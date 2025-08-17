import { computed } from 'vue'
import { state } from '.'
import { view } from '../editor/view'
import { settings } from '../settings'
import type { Entity, EntityOfType, EntityType } from '../state/entities'
import { beatToTime, timeToBeat } from '../state/integrals/bpms'
import { beatToKey } from '../state/store/grid'
import { bpms } from './bpms'

export const store = computed(() => state.value.store)

export const walkAllEntities = (callback: (entity: Entity) => void) => {
    for (const map of Object.values(store.value.grid)) {
        for (const entities of map.values()) {
            entities.forEach(callback)
        }
    }
}

export const cullEntities = <T extends EntityType>(type: T, minKey: number, maxKey: number) => {
    if (!Number.isFinite(maxKey)) maxKey = minKey

    const culled = new Set<EntityOfType<T>>()

    for (let i = minKey; i <= maxKey; i++) {
        const entities = store.value.grid[type].get(i)
        if (!entities) continue

        for (const entity of entities) {
            culled.add(entity)
        }
    }

    return culled
}

export const cullAllEntities = (minKey: number, maxKey: number) => {
    if (!Number.isFinite(maxKey)) maxKey = minKey

    const culled = new Set<Entity>()

    for (const map of Object.values(store.value.grid)) {
        for (let i = minKey; i <= maxKey; i++) {
            const entities = map.get(i)
            if (!entities) continue

            for (const entity of entities) {
                culled.add(entity)
            }
        }
    }

    return culled
}

export const hitEntities = <T extends EntityType>(
    type: T,
    laneMin: number,
    laneMax: number,
    timeMin: number,
    timeMax: number,
) =>
    hitEntitiesByGetter(laneMin, laneMax, timeMin, timeMax, (minKey, maxKey) =>
        cullEntities(type, minKey, maxKey),
    )

export const hitAllEntities = (
    laneMin: number,
    laneMax: number,
    timeMin: number,
    timeMax: number,
) => hitEntitiesByGetter(laneMin, laneMax, timeMin, timeMax, cullAllEntities)

const hitEntitiesByGetter = <T extends Entity>(
    laneMin: number,
    laneMax: number,
    timeMin: number,
    timeMax: number,
    getEntities: (minKey: number, maxKey: number) => Set<T>,
) => {
    const spu = view.w / settings.width / settings.pps

    const minKey = beatToKey(timeToBeat(bpms.value, Math.max(0, timeMin - 0.25 * spu)))
    const maxKey = beatToKey(timeToBeat(bpms.value, Math.max(0, timeMax + 0.25 * spu)))

    return [...getEntities(minKey, maxKey)].filter(({ hitbox }) => {
        if (!hitbox) return false

        const { lane, w } = hitbox
        const h = hitbox.h * spu

        const time = beatToTime(bpms.value, hitbox.beat)

        return laneMax > lane - w && laneMin < lane + w && timeMax > time - h && timeMin < time + h
    })
}
