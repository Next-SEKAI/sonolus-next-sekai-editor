import { ref } from 'vue'
import type { Tool } from '..'
import type { BpmObject } from '../../../chart/bpm'
import type { CameraEventObject } from '../../../chart/events/camera'
import type { StageMaskEventObject } from '../../../chart/events/stage/mask'
import type { StagePivotEventObject } from '../../../chart/events/stage/pivot'
import type { StageStyleEventObject } from '../../../chart/events/stage/style'
import type { GroupId } from '../../../chart/groups'
import type { FlickDirection, NoteObject } from '../../../chart/note'
import { parseLevelDataChart } from '../../../chart/parse/levelData'
import type { StageId } from '../../../chart/stages'
import type { TimeScaleObject } from '../../../chart/timeScale'
import { parseClipboardData } from '../../../clipboardData/parse'
import { pushState, state } from '../../../history'
import { checkDynamicStages, isDynamicStages } from '../../../history/dynamicStages'
import { defaultGroupId, groups } from '../../../history/groups'
import { defaultStageId, stages } from '../../../history/stages'
import { i18n } from '../../../i18n'
import type { Entity } from '../../../state/entities'
import { toBpmEntity, type BpmEntity } from '../../../state/entities/bpm'
import {
    toCameraEventJointEntity,
    type CameraEventJointEntity,
} from '../../../state/entities/events/joints/camera'
import {
    toStageMaskEventJointEntity,
    type StageMaskEventJointEntity,
} from '../../../state/entities/events/joints/stage/mask'
import {
    toStagePivotEventJointEntity,
    type StagePivotEventJointEntity,
} from '../../../state/entities/events/joints/stage/pivot'
import {
    toStageStyleEventJointEntity,
    type StageStyleEventJointEntity,
} from '../../../state/entities/events/joints/stage/style'
import { createSlideId } from '../../../state/entities/slides'
import { toNoteEntity, type NoteEntity } from '../../../state/entities/slides/note'
import { toTimeScaleEntity, type TimeScaleEntity } from '../../../state/entities/timeScale'
import { addBpm, removeBpm } from '../../../state/mutations/bpm'
import { addCameraEventJoint } from '../../../state/mutations/events/camera'
import { addStageMaskEventJoint } from '../../../state/mutations/events/stage/mask'
import { addStagePivotEventJoint } from '../../../state/mutations/events/stage/pivot'
import { addStageStyleEventJoint } from '../../../state/mutations/events/stage/style'
import { addNote } from '../../../state/mutations/slides/note'
import { addTimeScale, removeTimeScale } from '../../../state/mutations/timeScale'
import { getInStoreGrid } from '../../../state/store/grid'
import { createTransaction, type Transaction } from '../../../state/transaction'
import { interpolate } from '../../../utils/interpolate'
import { align } from '../../../utils/math'
import { timeout } from '../../../utils/promise'
import { notify } from '../../notification'
import { view, xToLane, yToBeatOffset } from '../../view'
import PasteSidebar from './PasteSidebar.vue'

export type ClipboardEntry = {
    name: string
    text: string
    data?: {
        lane: number
        beat: number
        entities: Entity[]
    }
}

let i = 0
let clipboardEntry: ClipboardEntry | undefined
const clipboardEntries: ClipboardEntry[] = []

export const clipboardEntryNames = ref<string[]>([])

export const paste: Tool = {
    title: () => i18n.value.tools.paste.title,
    sidebar: PasteSidebar,

    async hover(x, y, modifiers) {
        await updateClipboard()
        if (!clipboardEntry?.data?.entities.length) return

        const lane = xToLane(x)
        const beatOffset = yToBeatOffset(y, clipboardEntry.data.beat)

        const creating: Entity[] = []
        for (const entity of clipboardEntry.data.entities) {
            const beat = entity.beat + beatOffset
            if (beat < 0) continue

            const result = creates[entity.type]?.(
                clipboardEntry.data.entities,
                entity as never,
                clipboardEntry.data.lane,
                lane,
                beat,
                modifiers.shift,
            )
            if (!result) continue

            creating.push(result)
        }

        view.entities = {
            hovered: [],
            creating,
        }
    },

    async tap(x, y, modifiers) {
        await updateClipboard()
        if (!clipboardEntry) return

        const data = getData(clipboardEntry.text)
        if (!data?.entities.length) return

        if (
            data.entities.some(
                (entity) =>
                    entity.type === 'cameraEventJoint' ||
                    entity.type === 'stageMaskEventJoint' ||
                    entity.type === 'stagePivotEventJoint' ||
                    entity.type === 'stageStyleEventJoint',
            )
        ) {
            await checkDynamicStages()
        }

        const transaction = createTransaction(state.value)

        const lane = xToLane(x)
        const beatOffset = yToBeatOffset(y, data.beat)

        const selectedEntities: Entity[] = []
        for (const entity of data.entities) {
            const beat = entity.beat + beatOffset
            if (beat < 0) continue

            const result = pastes[entity.type]?.(
                transaction,
                data.entities,
                entity as never,
                data.lane,
                lane,
                beat,
                modifiers.shift,
            )
            if (!result) continue

            selectedEntities.push(...result)
        }

        pushState(
            interpolate(() => i18n.value.tools.paste.pasted, `${selectedEntities.length}`),
            transaction.commit(selectedEntities),
        )
        view.entities = {
            hovered: [],
            creating: [],
        }

        notify(interpolate(() => i18n.value.tools.paste.pasted, `${selectedEntities.length}`))
    },
}

export const updateClipboard = async () => {
    const text = await getText()
    if (!text) return
    if (clipboardEntry?.text === text) return

    clipboardEntry = clipboardEntries.find((entry) => entry.text === text)
    if (clipboardEntry) {
        clipboardEntries.splice(clipboardEntries.indexOf(clipboardEntry), 1)
        clipboardEntries.unshift(clipboardEntry)
        clipboardEntryNames.value = clipboardEntries.map(({ name }) => name)
        return
    }

    const data = getData(text)
    clipboardEntry = {
        name: data ? `#${++i} (${data.entities.length})` : '',
        text,
        data,
    }
    if (clipboardEntry.data) {
        clipboardEntries.unshift(clipboardEntry)
        if (clipboardEntries.length > 10) clipboardEntries.pop()
        clipboardEntryNames.value = clipboardEntries.map(({ name }) => name)
    }
}

const getText = async () => {
    try {
        return await Promise.race([navigator.clipboard.readText(), timeout(50)])
    } catch {
        return
    }
}

const getData = (text: string) => {
    try {
        const clipboardData = parseClipboardData(JSON.parse(text))
        const chart = parseLevelDataChart(clipboardData.entities)

        const groupIds = [...groups.value.keys()]
        const groupMappings = new Map(
            [...chart.groups.keys()].map((id, index) => [id, groupIds[index]]),
        )

        const stageIds = [...stages.value.keys()]
        const stageMappings = new Map(
            [...chart.stages.keys()].map((id, index) => [id, stageIds[index]]),
        )

        const mapGroupId = <T extends { groupId: GroupId }>(object: T) => ({
            ...object,
            groupId: groupMappings.get(object.groupId) ?? defaultGroupId.value,
        })

        const mapStageId = <T extends { stageId: StageId }>(object: T) => ({
            ...object,
            stageId: stageMappings.get(object.stageId) ?? defaultStageId.value,
        })

        return {
            lane: clipboardData.lane,
            beat: clipboardData.beat,
            entities: [
                ...chart.bpms.map(toBpmEntity),
                ...chart.timeScales.map(mapGroupId).map(toTimeScaleEntity),

                ...chart.cameraEvents.map(toCameraEventJointEntity),

                ...chart.stageMaskEvents.map(mapStageId).map(toStageMaskEventJointEntity),
                ...chart.stagePivotEvents.map(mapStageId).map(toStagePivotEventJointEntity),
                ...chart.stageStyleEvents.map(mapStageId).map(toStageStyleEventJointEntity),

                ...chart.slides.flatMap((slide) => {
                    const slideId = createSlideId()

                    return slide
                        .map(mapGroupId)
                        .map(mapStageId)
                        .map((note) => toNoteEntity(slideId, note))
                }),
            ],
        }
    } catch {
        return
    }
}

export const setToClipboardEntry = async (name: string) => {
    const entry = clipboardEntries.find((entry) => entry.name === name)
    if (!entry) return

    await navigator.clipboard.writeText(entry.text)
    await updateClipboard()
}

const toMovedBpmObject = (entity: BpmEntity, beat: number): BpmObject => ({
    ...entity,
    beat,
})

const toMovedTimeScaleObject = (
    entities: Entity[],
    entity: TimeScaleEntity,
    startLane: number,
    lane: number,
    beat: number,
    flip: boolean,
): TimeScaleObject => ({
    ...entity,
    groupId: view.groupId ?? entity.groupId,
    beat,
    editorLane: entities.every((entity) => entity.type === 'timeScale')
        ? flip
            ? -entity.editorLane + align(startLane) + align(lane)
            : entity.editorLane - align(startLane) + align(lane)
        : entity.editorLane,
})

const toMovedCameraEventObject = (
    entity: CameraEventJointEntity,
    startLane: number,
    lane: number,
    beat: number,
    flip: boolean,
): CameraEventObject => ({
    ...entity,
    beat,
    cameraLeft: flip
        ? -(entity.cameraLeft + entity.cameraSize) + align(startLane) + align(lane)
        : entity.cameraLeft - align(startLane) + align(lane),
    cameraZoomTargetLane: flip ? -entity.cameraZoomTargetLane : entity.cameraZoomTargetLane,
    cameraRotation: flip ? -entity.cameraRotation : entity.cameraRotation,
})

const toMovedStageMaskEventObject = (
    entity: StageMaskEventJointEntity,
    startLane: number,
    lane: number,
    beat: number,
    flip: boolean,
): StageMaskEventObject => ({
    ...entity,
    stageId: view.stageId ?? entity.stageId,
    beat,
    maskLeft: flip
        ? -(entity.maskLeft + entity.maskSize) + align(startLane) + align(lane)
        : entity.maskLeft - align(startLane) + align(lane),
})

const toMovedStagePivotEventObject = (
    entity: StagePivotEventJointEntity,
    startLane: number,
    lane: number,
    beat: number,
    flip: boolean,
): StagePivotEventObject => ({
    ...entity,
    stageId: view.stageId ?? entity.stageId,
    beat,
    pivotLane: flip
        ? -entity.pivotLane + align(startLane) + align(lane)
        : entity.pivotLane - align(startLane) + align(lane),
})

const toMovedStageStyleEventObject = (
    entities: Entity[],
    entity: StageStyleEventJointEntity,
    startLane: number,
    lane: number,
    beat: number,
    flip: boolean,
): StageStyleEventObject => ({
    ...entity,
    stageId: view.stageId ?? entity.stageId,
    beat,
    editorLane: entities.every((entity) => entity.type === 'stageStyleEventJoint')
        ? flip
            ? -entity.editorLane + align(startLane) + align(lane)
            : entity.editorLane - align(startLane) + align(lane)
        : entity.editorLane,
    leftBorderStyle: flip ? entity.rightBorderStyle : entity.leftBorderStyle,
    rightBorderStyle: flip ? entity.leftBorderStyle : entity.rightBorderStyle,
})

const flippedFlickDirections: Record<FlickDirection, FlickDirection> = {
    none: 'none',
    up: 'up',
    upLeft: 'upRight',
    upRight: 'upLeft',
    down: 'down',
    downLeft: 'downRight',
    downRight: 'downLeft',
}

const toMovedNoteObject = (
    entity: NoteEntity,
    startLane: number,
    lane: number,
    beat: number,
    flip: boolean,
): NoteObject => ({
    ...entity,
    groupId: view.groupId ?? entity.groupId,
    stageId: view.stageId ?? entity.stageId,
    beat,
    left: flip
        ? -(entity.left + entity.size) + align(startLane) + align(lane)
        : entity.left - align(startLane) + align(lane),
    flickDirection: flip ? flippedFlickDirections[entity.flickDirection] : entity.flickDirection,
})

type Create<T extends Entity> = (
    entities: Entity[],
    entity: T,
    startLane: number,
    lane: number,
    beat: number,
    flip: boolean,
) => Entity | undefined

const creates: {
    [T in Entity as T['type']]: Create<T> | undefined
} = {
    bpm: (entities, entity, startLane, lane, beat) => toBpmEntity(toMovedBpmObject(entity, beat)),
    timeScale: (entities, entity, startLane, lane, beat, flip) =>
        toTimeScaleEntity(toMovedTimeScaleObject(entities, entity, startLane, lane, beat, flip)),

    cameraEventJoint: (entities, entity, startLane, lane, beat, flip) =>
        toCameraEventJointEntity(toMovedCameraEventObject(entity, startLane, lane, beat, flip)),
    cameraEventConnection: undefined,

    stageMaskEventJoint: (entities, entity, startLane, lane, beat, flip) =>
        toStageMaskEventJointEntity(
            toMovedStageMaskEventObject(entity, startLane, lane, beat, flip),
        ),
    stageMaskEventConnection: undefined,

    stagePivotEventJoint: (entities, entity, startLane, lane, beat, flip) =>
        toStagePivotEventJointEntity(
            toMovedStagePivotEventObject(entity, startLane, lane, beat, flip),
        ),
    stagePivotEventConnection: undefined,

    stageStyleEventJoint: (entities, entity, startLane, lane, beat, flip) =>
        toStageStyleEventJointEntity(
            toMovedStageStyleEventObject(entities, entity, startLane, lane, beat, flip),
        ),
    stageStyleEventConnection: undefined,

    note: (entities, entity, startLane, lane, beat, flip) =>
        toNoteEntity(entity.slideId, toMovedNoteObject(entity, startLane, lane, beat, flip)),
    connector: undefined,
}

type Paste<T extends Entity> = (
    transaction: Transaction,
    entities: Entity[],
    entity: T,
    startLane: number,
    lane: number,
    beat: number,
    flip: boolean,
) => Entity[] | undefined

const pastes: {
    [T in Entity as T['type']]: Paste<T> | undefined
} = {
    bpm: (transaction, entities, entity, startLane, lane, beat) => {
        const object = toMovedBpmObject(entity, beat)

        const overlap = getInStoreGrid(transaction.store.grid, 'bpm', object.beat)?.find(
            (entity) => entity.beat === object.beat,
        )
        if (overlap) removeBpm(transaction, overlap)

        return addBpm(transaction, object)
    },
    timeScale: (transaction, entities, entity, startLane, lane, beat, flip) => {
        const object = toMovedTimeScaleObject(entities, entity, startLane, lane, beat, flip)

        const overlap = getInStoreGrid(transaction.store.grid, 'timeScale', object.beat)?.find(
            (entity) => entity.beat === object.beat && entity.groupId === object.groupId,
        )
        if (overlap) removeTimeScale(transaction, overlap)

        return addTimeScale(transaction, object)
    },

    cameraEventJoint: (transaction, entities, entity, startLane, lane, beat, flip) => {
        if (!isDynamicStages.value) return

        const object = toMovedCameraEventObject(entity, startLane, lane, beat, flip)

        return addCameraEventJoint(transaction, object)
    },
    cameraEventConnection: undefined,

    stageMaskEventJoint: (transaction, entities, entity, startLane, lane, beat, flip) => {
        if (!isDynamicStages.value) return

        const object = toMovedStageMaskEventObject(entity, startLane, lane, beat, flip)

        return addStageMaskEventJoint(transaction, object)
    },
    stageMaskEventConnection: undefined,

    stagePivotEventJoint: (transaction, entities, entity, startLane, lane, beat, flip) => {
        if (!isDynamicStages.value) return

        const object = toMovedStagePivotEventObject(entity, startLane, lane, beat, flip)

        return addStagePivotEventJoint(transaction, object)
    },
    stagePivotEventConnection: undefined,

    stageStyleEventJoint: (transaction, entities, entity, startLane, lane, beat, flip) => {
        if (!isDynamicStages.value) return

        const object = toMovedStageStyleEventObject(entities, entity, startLane, lane, beat, flip)

        return addStageStyleEventJoint(transaction, object)
    },
    stageStyleEventConnection: undefined,

    note: (transaction, entities, entity, startLane, lane, beat, flip) => {
        const object = toMovedNoteObject(entity, startLane, lane, beat, flip)

        return addNote(transaction, entity.slideId, object)
    },
    connector: undefined,
}
