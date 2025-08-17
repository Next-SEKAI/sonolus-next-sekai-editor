import { ref } from 'vue'
import type { Tool } from '..'
import type { BpmObject, FlickDirection, NoteObject, TimeScaleObject } from '../../../chart'
import { parseLevelDataChart } from '../../../chart/parse/levelData'
import { parseClipboardData } from '../../../clipboardData/parse'
import { pushState, state } from '../../../history'
import { i18n } from '../../../i18n'
import type { Entity } from '../../../state/entities'
import { toBpmEntity, type BpmEntity } from '../../../state/entities/bpm'
import { createSlideId } from '../../../state/entities/slides'
import { toNoteEntity, type NoteEntity } from '../../../state/entities/slides/note'
import { toTimeScaleEntity, type TimeScaleEntity } from '../../../state/entities/timeScale'
import { addBpm, removeBpm } from '../../../state/mutations/bpm'
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

        const transaction = createTransaction(state.value)

        const lane = xToLane(x)
        const beatOffset = yToBeatOffset(y, data.beat)

        const selectedEntities: Entity[] = []
        for (const entity of data.entities) {
            const beat = entity.beat + beatOffset
            if (beat < 0) continue

            const result = pastes[entity.type]?.(
                transaction,
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

        return {
            lane: clipboardData.lane,
            beat: clipboardData.beat,
            entities: [
                ...chart.bpms.map(toBpmEntity),
                ...chart.timeScales.map(toTimeScaleEntity),

                ...chart.slides.flatMap((slide) => {
                    const slideId = createSlideId()

                    return slide.map((note) => toNoteEntity(slideId, note))
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
    beat,
    bpm: entity.bpm,
})

const toMovedTimeScaleObject = (entity: TimeScaleEntity, beat: number): TimeScaleObject => ({
    group: view.group ?? entity.group,
    beat,
    timeScale: entity.timeScale,
    skip: entity.skip,
    ease: entity.ease,
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
    group: view.group ?? entity.group,
    beat,
    left: flip
        ? -(entity.left + entity.size) + align(startLane) + align(lane)
        : entity.left - align(startLane) + align(lane),
    flickDirection: flip ? flippedFlickDirections[entity.flickDirection] : entity.flickDirection,
})

type Create<T extends Entity> = (
    entity: T,
    startLane: number,
    lane: number,
    beat: number,
    flip: boolean,
) => Entity | undefined

const creates: {
    [T in Entity as T['type']]?: Create<T>
} = {
    bpm: (entity, startLane, lane, beat) => toBpmEntity(toMovedBpmObject(entity, beat)),
    timeScale: (entity, startLane, lane, beat) =>
        toTimeScaleEntity(toMovedTimeScaleObject(entity, beat)),

    note: (entity, startLane, lane, beat, flip) =>
        toNoteEntity(entity.slideId, toMovedNoteObject(entity, startLane, lane, beat, flip)),
}

type Paste<T extends Entity> = (
    transaction: Transaction,
    entity: T,
    startLane: number,
    lane: number,
    beat: number,
    flip: boolean,
) => Entity[] | undefined

const pastes: {
    [T in Entity as T['type']]?: Paste<T>
} = {
    bpm: (transaction, entity, startLane, lane, beat) => {
        const object = toMovedBpmObject(entity, beat)

        const overlap = getInStoreGrid(transaction.store.grid, 'bpm', object.beat)?.find(
            (entity) => entity.beat === object.beat,
        )
        if (overlap) removeBpm(transaction, overlap)

        return addBpm(transaction, object)
    },
    timeScale: (transaction, entity, startLane, lane, beat) => {
        const object = toMovedTimeScaleObject(entity, beat)

        const overlap = getInStoreGrid(transaction.store.grid, 'timeScale', object.beat)?.find(
            (entity) => entity.beat === object.beat && entity.group === object.group,
        )
        if (overlap) removeTimeScale(transaction, overlap)

        return addTimeScale(transaction, object)
    },

    note: (transaction, entity, startLane, lane, beat, flip) => {
        const object = toMovedNoteObject(entity, startLane, lane, beat, flip)

        return addNote(transaction, entity.slideId, object)
    },
}
