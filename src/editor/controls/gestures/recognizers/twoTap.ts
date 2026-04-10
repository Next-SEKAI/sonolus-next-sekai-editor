import { deselect } from '../../../commands/deselect'
import type { Recognizer } from './recognizer'

export const twoTap = (): Recognizer<2> => ({
    count: 2,

    recognize([, p1], [, p2]) {
        if (p1.isActive && p2.isActive) return false
        if (p1.t - p1.st > 250 || p2.t - p2.st > 250) return false
        if (
            Math.hypot(p1.x - p1.sx, p1.y - p1.sy) > 20 ||
            Math.hypot(p2.x - p2.sx, p2.y - p2.sy) > 20
        )
            return false

        void deselect.execute()
        return true
    },
})
