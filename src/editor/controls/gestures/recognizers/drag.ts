import { ref, watch } from 'vue'
import { settings } from '../../../../settings'
import { time } from '../../../../time'
import { unlerp } from '../../../../utils/math'
import { tool } from '../../../tools'
import { scrollViewXBy, scrollViewYBy, view } from '../../../view'
import type { Modifiers } from '../pointer'
import type { Recognizer } from './recognizer'

export const isDragging = ref(0)

export const drag = (): Recognizer<1> => {
    let active:
        | {
              id: number
          }
        | undefined

    let update:
        | {
              x: number
              y: number
              modifiers: Modifiers
          }
        | undefined

    watch(time, ({ delta }) => {
        if (!update) return
        const { x, y, modifiers } = update

        let updated = 0

        if (settings.dragToPanX) {
            const px = (x - view.x) / view.w
            if (px < 0.2) {
                scrollViewXBy(-unlerp(0.2, 0, px) * view.w * delta)
                updated++
            } else if (px > 0.8) {
                scrollViewXBy(unlerp(0.8, 1, px) * view.w * delta)
                updated++
            }
        }

        if (settings.dragToPanY) {
            const py = (y - view.y) / view.h
            if (py < 0.2) {
                scrollViewYBy(unlerp(0.2, 0, py) * view.h * delta)
                updated++
            } else if (py > 0.8) {
                scrollViewYBy(-unlerp(0.8, 1, py) * view.h * delta)
                updated++
            }
        }

        tool.value.dragUpdate?.(x, y, modifiers)

        if (!updated) {
            update = undefined
        }
    })

    return {
        count: 1,

        recognize([id, { isActive, sx, sy, x, y, modifiers }]) {
            if (!isActive) return false
            if (Math.hypot(x - sx, y - sy) <= 20) return false

            if (!tool.value.dragStart?.(sx, sy, modifiers)) return true

            isDragging.value++

            active = {
                id,
            }
            update = {
                x,
                y,
                modifiers,
            }
            return true
        },

        update(pointers) {
            if (!active) return

            const p = pointers.get(active.id)
            if (!p) return

            if (p.isActive) {
                update = {
                    x: p.x,
                    y: p.y,
                    modifiers: p.modifiers,
                }
            } else {
                isDragging.value--

                void tool.value.dragEnd?.(p.x, p.y, p.modifiers)
            }
        },

        reset() {
            active = undefined
            update = undefined
        },
    }
}
