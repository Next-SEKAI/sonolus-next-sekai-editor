import { bpms } from '../../../history/bpms'
import type { NoteEntity } from '../../../state/entities/slides/note'
import { beatToTime } from '../../../state/integrals/bpms'
import { activeColors, guideColors } from '../../../utils/colors'
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
                fill: activeColors[segmentHead.connectorActiveIsCritical ? 'critical' : 'normal'],
                'fill-opacity': 0.8,
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
