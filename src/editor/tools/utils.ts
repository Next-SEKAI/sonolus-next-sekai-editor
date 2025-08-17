import { hitAllEntities, hitEntities, store } from '../../history/store'
import type { Entity, EntityType } from '../../state/entities'
import type { Modifiers } from '../controls/gestures/pointer'
import { view, xToLane, yToTime, type Selection } from '../view'

export const hitEntitiesAtPoint = <T extends EntityType>(type: T, x: number, y: number) =>
    hitEntities(type, xToLane(x - 10), xToLane(x + 10), yToTime(y + 10), yToTime(y - 10)).filter(
        isVisible,
    )

export const hitAllEntitiesAtPoint = (x: number, y: number) =>
    hitAllEntities(xToLane(x - 10), xToLane(x + 10), yToTime(y + 10), yToTime(y - 10)).filter(
        isVisible,
    )

export const hitAllEntitiesInSelection = (selection: Selection) =>
    hitAllEntities(
        selection.laneMin,
        selection.laneMax,
        selection.timeMin,
        selection.timeMax,
    ).filter(isVisible)

export const modifyEntities = (entities: Entity[], modifiers: Modifiers) => {
    if (!modifiers.shift) return entities

    const allEntities = new Set(entities)

    for (const entity of entities) {
        if (entity.type !== 'note') continue

        const notes = store.value.slides.note.get(entity.slideId)
        if (!notes) continue

        for (const note of notes) {
            allEntities.add(note)
        }
    }

    return [...allEntities]
}

export const toSelection = (startLane: number, startTime: number, x: number, y: number) => {
    let laneMin = startLane
    let timeMin = startTime
    let laneMax = xToLane(x)
    let timeMax = yToTime(y)

    if (laneMin > laneMax) [laneMin, laneMax] = [laneMax, laneMin]
    if (timeMin > timeMax) [timeMin, timeMax] = [timeMax, timeMin]

    return {
        laneMin,
        laneMax,
        timeMin,
        timeMax,
    }
}

const isVisible = (entity: Entity) =>
    view.group === undefined ||
    entity.type === 'bpm' ||
    (entity.type !== 'connector' && entity.group === view.group)
