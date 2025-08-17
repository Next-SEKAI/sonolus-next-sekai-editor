import { computed } from 'vue'
import { bpms } from '../history/bpms'
import { settings } from '../settings'
import { timeToBeat } from '../state/integrals/bpms'
import { beatToKey } from '../state/store/grid'
import { computedRange } from '../utils/range'
import { view } from './view'

export const times = computed(() => ({
    min: Math.max(0, view.time - (0.5 * view.h) / settings.pps),
    max: view.time + (0.5 * view.h) / settings.pps,
}))

export const beats = computed(() => ({
    min: timeToBeat(bpms.value, times.value.min),
    max: timeToBeat(bpms.value, times.value.max),
}))

export const keys = computedRange(() => ({
    min: beatToKey(
        timeToBeat(
            bpms.value,
            Math.max(
                0,
                view.time - (0.5 * view.h + (0.25 * view.w) / settings.width) / settings.pps,
            ),
        ),
    ),
    max: beatToKey(
        timeToBeat(
            bpms.value,
            Math.max(
                0,
                view.time + (0.5 * view.h + (0.25 * view.w) / settings.width) / settings.pps,
            ),
        ),
    ),
}))
