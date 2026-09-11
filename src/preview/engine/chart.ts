import type { GroupId } from '../../chart/groups'
import type { StageId } from '../../chart/stages'
import type { State } from '../../state'
import type { EntityOfType, EntityType } from '../../state/entities'
import type { NoteEntity } from '../../state/entities/slides/note'
import { findIntegral } from '../../state/integrals'
import { beatToTime } from '../../state/integrals/bpms'
import { FlickDirection, type CameraChange, type FlickDirectionValue } from './layout'
import { EaseType, ease, unlerpClamped, type EaseTypeValue } from './math'
import {
    ConnectorKind,
    NoteKind,
    isActiveConnectorKind,
    type ConnectorKindValue,
    type ConnectorLayerValue,
    type NoteKindValue,
    type PreviewChart,
    type PreviewConnector,
    type PreviewNote,
    type PreviewSimLine,
    type PreviewSlide,
    type PreviewStage,
    type StagePivotEvent,
    type StageStyleEvent,
} from './model'
import { createTimescaleGroup, preemptTime, scaledTimeAt, type TimescaleChange } from './timescale'

const flickDirections: Record<string, FlickDirectionValue> = {
    none: FlickDirection.upOmni,
    up: FlickDirection.upOmni,
    upLeft: FlickDirection.upLeft,
    upRight: FlickDirection.upRight,
    down: FlickDirection.downOmni,
    downLeft: FlickDirection.downLeft,
    downRight: FlickDirection.downRight,
}

const eventEases: Record<string, EaseTypeValue> = {
    none: EaseType.none,
    linear: EaseType.linear,
    in: EaseType.inQuad,
    out: EaseType.outQuad,
    inOut: EaseType.inOutQuad,
    outIn: EaseType.outInQuad,
}

const guideKinds: Record<string, ConnectorKindValue> = {
    neutral: ConnectorKind.guideNeutral,
    red: ConnectorKind.guideRed,
    green: ConnectorKind.guideGreen,
    blue: ConnectorKind.guideBlue,
    yellow: ConnectorKind.guideYellow,
    purple: ConnectorKind.guidePurple,
    cyan: ConnectorKind.guideCyan,
    black: ConnectorKind.guideBlack,
}

const connectorLayers: Record<string, ConnectorLayerValue> = {
    top: 0,
    bottom: 1,
    under: 2,
    over: 3,
}

const beatToTicks = 480

const getStoreEntities = <T extends EntityType>(
    grid: Map<number, Set<EntityOfType<T>>>,
): EntityOfType<T>[] => {
    const entities = new Set<EntityOfType<T>>()
    for (const set of grid.values()) {
        for (const entity of set) {
            entities.add(entity)
        }
    }
    return [...entities]
}

export const buildPreviewChart = (state: State, noteSpeed: number): PreviewChart => {
    const bpms = state.bpms
    const toTime = (beat: number) => beatToTime(bpms, beat)
    const secondsPerBeat = (beat: number) => findIntegral(bpms, 'x', Math.max(0, beat)).s

    const isDynamicStages = state.isDynamicStages

    const groupIndexes = new Map<GroupId, number>()
    const groupObjects = [...state.groups.entries()]
    for (const [index, [groupId]] of groupObjects.entries()) {
        groupIndexes.set(groupId, index)
    }

    const timescaleChangesByGroup = new Map<GroupId, TimescaleChange[]>()
    for (const timeScale of getStoreEntities(state.store.grid.timeScale)) {
        let changes = timescaleChangesByGroup.get(timeScale.groupId)
        if (!changes) {
            changes = []
            timescaleChangesByGroup.set(timeScale.groupId, changes)
        }

        changes.push({
            time: toTime(timeScale.beat),
            timescale: timeScale.timeScale,
            skipSeconds: timeScale.skip * secondsPerBeat(timeScale.beat),
            ease: timeScale.timeScaleEase === 'linear' ? 1 : 0,
            hideNotes: timeScale.hideNotes,
        })
    }

    const groups = groupObjects.map(([groupId, group]) =>
        createTimescaleGroup(timescaleChangesByGroup.get(groupId) ?? [], group.forceNoteSpeed ?? 0),
    )

    const stageIndexes = new Map<StageId, number>()
    const stages: PreviewStage[] = []
    let hasStageTransforms = false
    if (isDynamicStages) {
        const masks = getStoreEntities(state.store.grid.stageMaskEventJoint)
        const pivots = getStoreEntities(state.store.grid.stagePivotEventJoint)
        const styles = getStoreEntities(state.store.grid.stageStyleEventJoint)
        const transforms = getStoreEntities(state.store.grid.stageTransformEventJoint)

        const preempt = preemptTime(noteSpeed, 0)

        for (const [index, [stageId, stage]] of [...state.stages.entries()].entries()) {
            stageIndexes.set(stageId, index)

            const stageMasks = masks
                .filter((event) => event.stageId === stageId)
                .sort((a, b) => a.beat - b.beat)
                .map((event) => ({
                    time: toTime(event.beat),
                    lane: event.maskLeft + event.maskSize / 2,
                    size: event.maskSize / 2,
                    ease: eventEases[event.eventEase] ?? EaseType.linear,
                }))

            const stagePivots = pivots
                .filter((event) => event.stageId === stageId)
                .sort((a, b) => a.beat - b.beat)
                .map((event): StagePivotEvent => ({
                    time: toTime(event.beat),
                    lane: event.pivotLane,
                    divisionSize: event.divisionSize,
                    divisionParity: event.divisionParity === 'odd' ? 1 : 0,
                    yOffset:
                        event.yOffset + (event.yOffsetBeat * secondsPerBeat(event.beat)) / preempt,
                    ease: eventEases[event.eventEase] ?? EaseType.linear,
                }))

            const stageStyles = styles
                .filter((event) => event.stageId === stageId)
                .sort((a, b) => a.beat - b.beat)
                .map((event): StageStyleEvent => ({
                    time: toTime(event.beat),
                    judgeLineColor: judgeLineColors[event.judgmentLineColor] ?? 0,
                    judgeLineStyle: event.judgmentLineStyle === 'singleLine' ? 1 : 0,
                    leftBorderStyle: borderStyles[event.leftBorderStyle] ?? 0,
                    rightBorderStyle: borderStyles[event.rightBorderStyle] ?? 0,
                    fullWidth: event.isFullWidth ? 1 : 0,
                    noteAlpha: event.noteAlpha,
                    laneAlpha: event.laneAlpha,
                    judgeLineAlpha: event.judgmentLineAlpha,
                    divisionLineAlpha: event.divisionLineAlpha,
                    ease: eventEases[event.eventEase] ?? EaseType.linear,
                }))

            const stageTransforms = transforms
                .filter((event) => event.stageId === stageId)
                .sort((a, b) => a.beat - b.beat)
                .map((event) => ({
                    time: toTime(event.beat),
                    rotate: (event.rotation * Math.PI) / 180,
                    xLaneTranslate: event.xTranslation,
                    yLaneTranslate: event.yTranslation,
                    centerWeight: event.anchor === 'center' ? 1 : 0,
                    ease: eventEases[event.eventEase] ?? EaseType.linear,
                }))

            if (stageTransforms.length) hasStageTransforms = true

            stages.push({
                order: index,
                drawStartTime: stage.isFromStart ? -1e8 : (stageMasks[0]?.time ?? 1e8),
                drawEndTime: stage.isUntilEnd ? 1e8 : (stageMasks.at(-1)?.time ?? -1e8),
                masks: stageMasks,
                pivots: stagePivots,
                styles: stageStyles,
                transforms: stageTransforms,
                hasTransforms: stageTransforms.length > 0,
            })
        }
    }

    const cameras: CameraChange[] = isDynamicStages
        ? getStoreEntities(state.store.grid.cameraEventJoint)
              .sort((a, b) => a.beat - b.beat)
              .map((joint) => ({
                  time: toTime(joint.beat),
                  lane: joint.cameraLeft + joint.cameraSize / 2,
                  size: joint.cameraSize / 2,
                  zoom: Math.max(joint.cameraZoom, 0.01),
                  zoomTargetLane: joint.cameraZoomTargetLane,
                  zoomTargetY: joint.cameraZoomTargetY,
                  zoomVerticalAlign: joint.cameraZoomVerticalAlign === 'center' ? 1 : 0,
                  rotate: (joint.cameraRotation * Math.PI) / 180,
                  stageTilt: Math.min(Math.max(joint.cameraStageTilt, 0), 1),
                  ease: eventEases[joint.eventEase] ?? EaseType.linear,
              }))
        : []

    const notes: PreviewNote[] = []
    const connectors: PreviewConnector[] = []
    const slides: PreviewSlide[] = []
    const simLines: PreviewSimLine[] = []

    const partitionedAllowSimLines = new Map<StageId | undefined, Map<number, PreviewNote[]>>()
    const getAllowSimLines = (stageId: StageId) => {
        const stage = state.stages.get(stageId)
        const id = isDynamicStages && stage?.generateSimLines === 'isolated' ? stageId : undefined
        let allowSimLines = partitionedAllowSimLines.get(id)
        if (!allowSimLines) {
            allowSimLines = new Map()
            partitionedAllowSimLines.set(id, allowSimLines)
        }
        return allowSimLines
    }

    for (const infos of state.store.slides.info.values()) {
        const previewNotes = new Map<NoteEntity, PreviewNote>()
        const getPreviewNote = (note: NoteEntity) => {
            const previewNote = previewNotes.get(note)
            if (!previewNote) throw new Error('Unexpected missing preview note')

            return previewNote
        }

        const slideConnectors = new Map<PreviewNote, PreviewConnector[]>()

        for (const [i, info] of infos.entries()) {
            const note = info.note

            const isFirst = i === 0
            const isLast = i === infos.length - 1
            const isInActive = info.activeHead !== info.activeTail
            const isActiveHead = info.activeHead === note
            const isActiveTail = info.activeTail === note
            const isFlick = note.flickDirection !== 'none'

            let kind: NoteKindValue
            if (note.noteType === 'anchor') {
                kind = NoteKind.anchor
            } else if (note.noteType === 'damage') {
                kind = NoteKind.damage
            } else if (note.noteType === 'trace') {
                if (isInActive && isActiveHead) {
                    kind = isFlick ? NoteKind.headTraceFlick : NoteKind.headTrace
                } else if (isInActive && isActiveTail) {
                    kind = isFlick ? NoteKind.tailTraceFlick : NoteKind.tailTrace
                } else {
                    kind = isFlick ? NoteKind.traceFlick : NoteKind.trace
                }
            } else if (note.noteType === 'forceTick') {
                kind = NoteKind.tick
            } else if (!isInActive) {
                kind = isFlick ? NoteKind.flick : NoteKind.tap
            } else if (isActiveHead) {
                kind = isFlick ? NoteKind.headFlick : NoteKind.headTap
            } else if (isActiveTail) {
                kind = isFlick ? NoteKind.tailFlick : NoteKind.tailRelease
            } else if (note.noteType === 'default') {
                kind = NoteKind.tick
            } else {
                kind = isFlick ? NoteKind.flick : NoteKind.tap
            }

            const groupIndex = groupIndexes.get(note.groupId) ?? 0
            const previewNote: PreviewNote = {
                kind,
                isCritical: note.isCritical,
                isFake: note.isFake,
                targetTime: toTime(note.beat),
                lane: note.left + note.size / 2,
                size: note.size / 2,
                direction: flickDirections[note.flickDirection] ?? FlickDirection.upOmni,
                groupIndex,
                stageIndex: stageIndexes.get(note.stageId) ?? -1,
                isAttached: !isFirst && !isLast && note.isAttached,
                connectorEase: eventEases[note.connectorEase] ?? EaseType.linear,
                targetScaledTime: 0,
            }
            previewNotes.set(note, previewNote)
            notes.push(previewNote)

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const group = groups[groupIndex]!
            previewNote.targetScaledTime = scaledTimeAt(group, previewNote.targetTime)

            if (
                note.noteType === 'trace' ||
                (note.noteType === 'default' && (!isInActive || isActiveHead || isActiveTail)) ||
                note.noteType === 'forceNonTick'
            ) {
                const allowSimLines = getAllowSimLines(note.stageId)
                const tick = Math.round(note.beat * beatToTicks)
                const tickNotes = allowSimLines.get(tick)
                if (tickNotes) {
                    tickNotes.push(previewNote)
                } else {
                    allowSimLines.set(tick, [previewNote])
                }
            }
        }

        for (const info of infos) {
            const previewNote = getPreviewNote(info.note)
            if (!previewNote.isAttached) continue

            previewNote.attachHead = getPreviewNote(info.attachHead)
            previewNote.attachTail = getPreviewNote(info.attachTail)
        }

        let head: NoteEntity | undefined
        for (const [i, info] of infos.entries()) {
            const note = info.note
            const isFirst = i === 0
            const isLast = i === infos.length - 1

            if (isFirst || isLast || !note.isAttached || note.isConnectorSeparator) {
                if (head) {
                    const segmentHead = info.segmentHead

                    let kind: ConnectorKindValue
                    if (segmentHead.connectorType === 'active') {
                        kind = segmentHead.connectorIsFake
                            ? segmentHead.connectorActiveIsCritical
                                ? ConnectorKind.activeFakeCritical
                                : ConnectorKind.activeFakeNormal
                            : segmentHead.connectorActiveIsCritical
                              ? ConnectorKind.activeCritical
                              : ConnectorKind.activeNormal
                    } else if (segmentHead.connectorType === 'damage') {
                        kind = segmentHead.connectorIsFake
                            ? ConnectorKind.fakeDamage
                            : ConnectorKind.damage
                    } else {
                        kind =
                            guideKinds[segmentHead.connectorGuideColor] ??
                            ConnectorKind.guideNeutral
                    }

                    const activeHead =
                        segmentHead.connectorType === 'damage' ? info.damageHead : info.activeHead
                    const activeTail =
                        segmentHead.connectorType === 'damage' ? info.damageTail : info.activeTail

                    const headNote = getPreviewNote(head)
                    const connector: PreviewConnector = {
                        kind,
                        ease: headNote.isAttached
                            ? (headNote.attachHead?.connectorEase ?? headNote.connectorEase)
                            : headNote.connectorEase,
                        head: headNote,
                        tail: getPreviewNote(note),
                        segmentHead: getPreviewNote(info.segmentHead),
                        segmentTail: getPreviewNote(info.segmentTail),
                        activeHead: activeHead && getPreviewNote(activeHead),
                        activeTail: activeTail && getPreviewNote(activeTail),
                        segmentHeadAlpha: info.segmentHead.connectorGuideAlpha,
                        segmentTailAlpha: info.segmentTail.connectorGuideAlpha,
                        layer: connectorLayers[segmentHead.connectorLayer] ?? 0,
                        throughJudgeLine: segmentHead.connectorIsPassThrough,
                        fullScreen: segmentHead.connectorPresentation === 'fullscreen',
                    }
                    connectors.push(connector)

                    if (
                        connector.activeHead &&
                        (isActiveConnectorKind(kind) || kind === ConnectorKind.damage)
                    ) {
                        const list = slideConnectors.get(connector.activeHead)
                        if (list) {
                            list.push(connector)
                        } else {
                            slideConnectors.set(connector.activeHead, [connector])
                        }
                    }
                }

                head = note
            }
        }

        for (const [activeHead, activeConnectors] of slideConnectors) {
            activeConnectors.sort((a, b) => a.head.targetTime - b.head.targetTime)

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const activeTail = activeConnectors[0]!.activeTail
            if (!activeTail) continue

            slides.push({
                activeHead,
                activeTail,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                kind: activeConnectors[0]!.kind,
                connectors: activeConnectors,
            })
        }
    }

    for (const allowSimLines of partitionedAllowSimLines.values()) {
        for (const tickNotes of allowSimLines.values()) {
            if (tickNotes.length < 2) continue

            tickNotes.sort((a, b) => a.lane - b.lane)

            let prev: PreviewNote | undefined
            for (const note of tickNotes) {
                if (prev) {
                    simLines.push({ left: prev, right: note })
                }
                prev = note
            }
        }
    }

    notes.sort((a, b) => a.targetTime - b.targetTime)
    connectors.sort((a, b) => a.head.targetTime - b.head.targetTime)

    return {
        isDynamicStages,
        notes,
        connectors,
        slides,
        simLines,
        cameras,
        groups,
        stages,
        hasStageTransforms,
    }
}

export const attachEasedFrac = (note: PreviewNote) => {
    if (!note.attachHead || !note.attachTail) return 0

    return ease(
        note.attachHead.connectorEase,
        unlerpClamped(note.attachHead.targetTime, note.attachTail.targetTime, note.targetTime),
    )
}

const judgeLineColors: Record<string, number> = {
    neutral: 0,
    red: 1,
    green: 2,
    blue: 3,
    yellow: 4,
    purple: 5,
    cyan: 6,
    black: 7,
}

const borderStyles: Record<string, number> = {
    default: 0,
    light: 1,
    disabled: 2,
    medium: 3,
}
