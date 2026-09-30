import { bpms } from '../../../history/bpms'
import type { NoteEntity } from '../../../state/entities/slides/note'
import { beatToTime } from '../../../state/integrals/bpms'
import { connectorColors } from '../../../utils/colors'
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
    if (segmentHead.connectorType !== 'guide')
        return {
            fill: {
                fill: connectorColors[
                    segmentHead.connectorColor !== 'default'
                        ? segmentHead.connectorColor
                        : segmentHead.connectorType === 'active'
                          ? segmentHead.connectorActiveIsCritical
                              ? 'critical'
                              : 'normal'
                          : 'damage'
                ],
                'fill-opacity': 0.8,
            },
        }

    const tSegmentHead = beatToTime(bpms.value, segmentHead.beat)
    const tSegmentTail = beatToTime(bpms.value, segmentTail.beat)

    return {
        fill: {
            fill: `url(#${id})`,
            'fill-opacity': 1,
        },
        gradient: {
            id,
            color: connectorColors[
                segmentHead.connectorColor !== 'default' ? segmentHead.connectorColor : 'green'
            ],
            headAlpha:
                remap(
                    tSegmentHead,
                    tSegmentTail,
                    segmentHead.connectorGuideAlpha,
                    segmentTail.connectorGuideAlpha,
                    tHead,
                ) * 0.5,
            tailAlpha:
                remap(
                    tSegmentHead,
                    tSegmentTail,
                    segmentHead.connectorGuideAlpha,
                    segmentTail.connectorGuideAlpha,
                    tTail,
                ) * 0.5,
        },
    }
}
