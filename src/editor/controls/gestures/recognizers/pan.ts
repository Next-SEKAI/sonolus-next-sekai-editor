import { settings } from '../../../../settings'
import { time } from '../../../../time'
import { scrollViewXBy, scrollViewYBy, view } from '../../../view'
import type { Recognizer } from './recognizer'

export const pan = (): Recognizer<2> => {
    const updates: {
        t: number
        dx: number
        dy: number
    }[] = []
    let active:
        | {
              x: boolean
              y: boolean
              sx: number
              sy: number
              id1: number
              id2: number
          }
        | undefined

    return {
        count: 2,

        recognize([id1, p1], [id2, p2]) {
            if (!p1.isActive || !p2.isActive) return false

            const sx = (p1.sx + p2.sx) / 2
            const x = (p1.x + p2.x) / 2
            const sy = (p1.sy + p2.sy) / 2
            const y = (p1.y + p2.y) / 2
            if (Math.abs(x - sx) <= 20 && Math.abs(y - sy) <= 20) return false

            active = {
                x: Math.abs(x - sx) >= 10,
                y: Math.abs(y - sy) >= 10,
                sx,
                sy,
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

            const x = (p1.x + p2.x) / 2
            const dx = x - active.sx
            const y = (p1.y + p2.y) / 2
            const dy = y - active.sy

            if (active.x) scrollViewXBy(-dx)
            if (active.y) scrollViewYBy(dy)

            updates.push({
                t: time.value.now,
                dx,
                dy,
            })
            active.sx = x
            active.sy = y
        },

        reset() {
            if (settings.touchScrollInertia) {
                if (active?.x) {
                    const dx = updates
                        .filter(({ t }) => time.value.now - t <= 0.1)
                        .reduce((sum, { dx }) => sum + dx, 0)
                    view.scrollingX = {
                        type: 'inertia',
                        value: -dx / 0.1,
                    }
                }

                if (active?.y) {
                    const dy = updates
                        .filter(({ t }) => time.value.now - t <= 0.1)
                        .reduce((sum, { dy }) => sum + dy, 0)
                    view.scrollingY = {
                        type: 'inertia',
                        value: dy / 0.1,
                    }
                }
            }

            updates.length = 0
            active = undefined
        },
    }
}
