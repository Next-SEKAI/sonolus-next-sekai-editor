import { computed, shallowReactive, watch } from 'vue'
import { times } from '.'
import { bpms } from '../history/bpms'
import { settings } from '../settings'
import type { Entity } from '../state/entities'
import { beatToTime, timeToBeat } from '../state/integrals/bpms'
import { time } from '../time'
import { align, clamp, lerp, unlerp } from '../utils/math'
import { optional } from '../utils/optional'

export type Selection = {
    laneMin: number
    laneMax: number
    timeMin: number
    timeMax: number
}

export const view = shallowReactive({
    time: 0,
    hoverTime: 0,
    cursorTime: 0,

    lane: 0,

    x: 0,
    y: 0,
    w: 0,
    h: 0,

    division: 4,
    snapping: 'absolute' as 'absolute' | 'relative',

    group: optional<number>(),

    pointer: {
        x: 0,
        y: 0,
    },
    selection: optional<Selection>(),
    entities: {
        hovered: new Array<Entity>(),
        creating: new Array<Entity>(),
    },

    lastActive: 0,

    scrollingX: optional<
        | {
              type: 'inertia'
              value: number
          }
        | {
              type: 'ease'
              from: {
                  time: number
                  viewLane: number
              }
              to: {
                  time: number
                  viewLane: number
              }
          }
    >(),
    scrollingY: optional<
        | {
              type: 'inertia'
              value: number
          }
        | {
              type: 'ease'
              from: {
                  time: number
                  viewTime: number
              }
              to: {
                  time: number
                  viewTime: number
              }
          }
    >(),
})

watch(time, ({ now, delta }) => {
    if (view.scrollingX) {
        switch (view.scrollingX.type) {
            case 'inertia': {
                if (!view.scrollingX.value) {
                    view.scrollingX = undefined
                    break
                }

                const a = Math.sign(view.scrollingX.value) * 800
                const t = Math.min(delta, view.scrollingX.value / a)

                scrollViewXBy(((2 * view.scrollingX.value - a * t) * delta) / 2)

                view.scrollingX.value -= a * t
                break
            }
            case 'ease': {
                if (now >= view.scrollingX.to.time) {
                    view.lane = view.scrollingX.to.viewLane
                    view.scrollingX = undefined
                    return
                }

                view.lane = lerp(
                    view.scrollingX.from.viewLane,
                    view.scrollingX.to.viewLane,
                    1 - (1 - unlerp(view.scrollingX.from.time, view.scrollingX.to.time, now)) ** 2,
                )
                break
            }
        }
    }

    if (view.scrollingY) {
        switch (view.scrollingY.type) {
            case 'inertia': {
                if (!view.scrollingY.value) {
                    view.scrollingY = undefined
                    break
                }

                const a = Math.sign(view.scrollingY.value) * 800
                const t = Math.min(delta, view.scrollingY.value / a)

                scrollViewYBy(((2 * view.scrollingY.value - a * t) * delta) / 2)

                view.scrollingY.value -= a * t
                break
            }
            case 'ease': {
                if (now >= view.scrollingY.to.time) {
                    view.time = view.scrollingY.to.viewTime
                    view.scrollingY = undefined
                    return
                }

                view.time = lerp(
                    view.scrollingY.from.viewTime,
                    view.scrollingY.to.viewTime,
                    1 - (1 - unlerp(view.scrollingY.from.time, view.scrollingY.to.time, now)) ** 2,
                )
                break
            }
        }
    }
})

export const hoveredEntities = computed(() => view.entities.hovered)

export const isViewRecentlyActive = computed(() => time.value.now - view.lastActive < 0.5)

export const viewBox = computed(() => {
    const w = settings.width
    const h = (view.h / view.w) * w

    const l = -0.5 * w + view.lane
    const r = 0.5 * w + view.lane

    const y = -(view.time * settings.pps) / view.h
    const t = (y - 0.5) * h
    const b = (y + 0.5) * h

    const ups = -(settings.pps / view.h) * h

    return {
        w,
        h,

        l,
        r,

        y,
        t,
        b,

        ups,
    }
})

export const ups = computed(() => viewBox.value.ups)

export const scrollViewXBy = (dx: number, smooth = false) => {
    updateViewLastActive()

    if (smooth) {
        view.scrollingX = {
            type: 'ease',
            from: {
                time: time.value.now,
                viewLane: view.lane,
            },
            to: {
                time: time.value.now + 0.25,
                viewLane: clamp(
                    (view.scrollingX?.type === 'ease' ? view.scrollingX.to.viewLane : view.lane) +
                        (dx / view.w) * settings.width,
                    -12,
                    12,
                ),
            },
        }
    } else {
        view.lane = clamp(view.lane + (dx / view.w) * settings.width, -12, 12)
    }
}

export const scrollViewYBy = (dy: number, smooth = false) => {
    updateViewLastActive()

    if (smooth) {
        view.scrollingY = {
            type: 'ease',
            from: {
                time: time.value.now,
                viewTime: view.time,
            },
            to: {
                time: time.value.now + 0.25,
                viewTime: Math.max(
                    0,
                    (view.scrollingY?.type === 'ease' ? view.scrollingY.to.viewTime : view.time) +
                        dy / settings.pps,
                ),
            },
        }
    } else {
        view.time = Math.max(0, view.time + dy / settings.pps)
    }
}

export const setViewHover = (y: number) => {
    view.hoverTime = Math.max(0, yToTime(y))
}

export const focusViewAtBeat = (beat: number) => {
    focusView(beatToTime(bpms.value, beat))
}

export const focusView = (t: number) => {
    updateViewLastActive()

    view.cursorTime = t

    if (t >= times.value.min && t <= times.value.max) return

    view.scrollingY = {
        type: 'ease',
        from: {
            time: time.value.now,
            viewTime: view.time,
        },
        to: {
            time: time.value.now + 0.25,
            viewTime: t,
        },
    }
}

export const updateViewPointer = (pointer?: { x: number; y: number }) => {
    if (!pointer) return

    view.pointer = {
        x: pointer.x,
        y: pointer.y,
    }

    updateViewLastActive()
}

export const updateViewLastActive = () => {
    view.lastActive = time.value.now
}

export const laneToValidLane = (lane: number) => align(lane - 0.5)

export const xToLane = (x: number) => ((x - view.x) / view.w - 0.5) * settings.width + view.lane

export const xToValidLane = (x: number) => laneToValidLane(xToLane(x))

export const yToTime = (y: number) => (0.5 * view.h - y + view.y) / settings.pps + view.time

const yToBeat = (y: number) => timeToBeat(bpms.value, Math.max(0, yToTime(y)))

export const yToValidBeat = (y: number) => align(yToBeat(y), view.division)

export const yToBeatOffset = (y: number, beat: number) =>
    view.snapping === 'absolute'
        ? align(yToBeat(y), view.division) - beat
        : align(yToBeat(y) - beat, view.division)

export const snapYToBeat = (y: number, beat: number) => Math.max(0, beat + yToBeatOffset(y, beat))
