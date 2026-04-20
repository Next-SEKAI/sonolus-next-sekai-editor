import type { EventEase } from '../../../chart/events'
import { lerp } from '../../../utils/math'

export const getPathD = (
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    eventEase: EventEase,
) => {
    switch (eventEase) {
        case 'linear':
            return `M ${xMin} ${yMin} L ${xMax} ${yMax}`
        case 'in':
            return `M ${xMin} ${yMin} Q ${xMin} ${lerp(yMin, yMax, 0.5)} ${xMax} ${yMax}`
        case 'out':
            return `M ${xMin} ${yMin} Q ${xMax} ${lerp(yMin, yMax, 0.5)} ${xMax} ${yMax}`
        case 'inOut':
            return `M ${xMin} ${yMin} Q ${xMin} ${lerp(yMin, yMax, 0.25)} ${lerp(xMin, xMax, 0.5)} ${lerp(yMin, yMax, 0.5)} Q ${xMax} ${lerp(yMin, yMax, 0.75)} ${xMax} ${yMax}`
        case 'outIn':
            return `M ${xMin} ${yMin} Q ${lerp(xMin, xMax, 0.5)} ${lerp(yMin, yMax, 0.25)} ${lerp(xMin, xMax, 0.5)} ${lerp(yMin, yMax, 0.5)} Q ${lerp(xMin, xMax, 0.5)} ${lerp(yMin, yMax, 0.75)} ${xMax} ${yMax}`
        case 'none':
            return `M ${xMin} ${yMin} V ${yMax}`
    }
}
