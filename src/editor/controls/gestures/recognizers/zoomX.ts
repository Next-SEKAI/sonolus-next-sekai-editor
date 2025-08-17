import { settings } from '../../../../settings'
import type { Recognizer } from './recognizer'

export const zoomX = (): Recognizer<2> => {
    let active:
        | {
              size: number
              id1: number
              id2: number
          }
        | undefined

    return {
        count: 2,

        recognize([id1, p1], [id2, p2]) {
            if (!p1.isActive || !p2.isActive) return false

            const sl = Math.abs(p1.sx - p2.sx)
            const l = Math.abs(p1.x - p2.x)
            if (Math.abs(sl - l) <= 40) return false

            active = {
                size: settings.width,
                id1,
                id2,
            }
            return true
        },

        update(pointers) {
            if (!active) return

            const p1 = pointers.get(active.id1)
            if (!p1) return

            const p2 = pointers.get(active.id2)
            if (!p2) return

            const sl = Math.abs(p1.sx - p2.sx)
            const l = Math.abs(p1.x - p2.x)

            settings.width = (active.size * sl) / l
        },

        reset() {
            active = undefined
        },
    }
}
