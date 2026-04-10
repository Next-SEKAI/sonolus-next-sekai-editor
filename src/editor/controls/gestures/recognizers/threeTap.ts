import { play } from '../../../commands/play'
import type { Recognizer } from './recognizer'

export const threeTap = (): Recognizer<3> => ({
    count: 3,

    recognize([, p1], [, p2], [, p3]) {
        if (p1.isActive && p2.isActive && p3.isActive) return false
        if (p1.t - p1.st > 250 || p2.t - p2.st > 250 || p3.t - p3.st > 250) return false
        if (
            Math.hypot(p1.x - p1.sx, p1.y - p1.sy) > 20 ||
            Math.hypot(p2.x - p2.sx, p2.y - p2.sy) > 20 ||
            Math.hypot(p3.x - p3.sx, p3.y - p3.sy) > 20
        )
            return false

        void play.execute()
        return true
    },
})
