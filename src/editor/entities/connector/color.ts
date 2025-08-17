import { bpms } from '../../../history/bpms'
import type { NoteEntity } from '../../../state/entities/slides/note'
import { beatToTime } from '../../../state/integrals/bpms'
import { remap } from '../../../utils/math'

export type Gradient = {
    id: string
    color: string
    headAlpha: number
    tailAlpha: number
}

export const getColor = (
    id: string,
    segmentHead: NoteEntity,
    segmentTail: NoteEntity,
    tHead: number,
    tTail: number,
): {
    fill: {
        fill: string
        'fill-opacity': number
    }
    gradient?: Gradient
} => {
    if (segmentHead.connectorType === 'active')
        return {
            fill: {
                fill: segmentHead.connectorActiveIsCritical
                    ? 'rgb(251, 255, 220, 0.8)'
                    : 'rgb(127, 255, 211, 0.8)',
                'fill-opacity': 1,
            },
        }

    const tSegmentHead = beatToTime(bpms.value, segmentHead.beat)
    const tSegmentTail = beatToTime(bpms.value, segmentTail.beat)

    return {
        fill: {
            fill: `url(#${id})`,
            'fill-opacity': 0.5,
        },
        gradient: {
            id,
            color: guideColors[segmentHead.connectorGuideColor],
            headAlpha: remap(
                tSegmentHead,
                tSegmentTail,
                segmentHead.connectorGuideAlpha,
                segmentTail.connectorGuideAlpha,
                tHead,
            ),
            tailAlpha: remap(
                tSegmentHead,
                tSegmentTail,
                segmentHead.connectorGuideAlpha,
                segmentTail.connectorGuideAlpha,
                tTail,
            ),
        },
    }
}

const guideColors = {
    neutral: '#ededed',
    red: '#d6737b',
    green: '#73d69d',
    blue: '#737bd6',
    yellow: '#d6b362',
    purple: '#d673cd',
    cyan: '#73acd6',
    black: '#000000',
}
