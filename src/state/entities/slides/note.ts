import type { SlideId } from '.'
import type { BaseEntity } from '..'
import type { GroupId } from '../../../chart/groups'
import type {
    ConnectorEase,
    ConnectorGuideColor,
    ConnectorLayer,
    ConnectorType,
    FlickDirection,
    NoteObject,
    NoteSfx,
    NoteType,
} from '../../../chart/note'

export type NoteEntity = BaseEntity & {
    type: 'note'
    slideId: SlideId
    groupId: GroupId
    noteType: NoteType
    isAttached: boolean
    left: number
    size: number
    isCritical: boolean
    flickDirection: FlickDirection
    isFake: boolean
    sfx: NoteSfx
    isConnectorSeparator: boolean
    connectorType: ConnectorType
    connectorEase: ConnectorEase
    connectorLayer: ConnectorLayer
    connectorActiveIsCritical: boolean
    connectorActiveIsFake: boolean
    connectorGuideColor: ConnectorGuideColor
    connectorGuideAlpha: number
    connectorIsPassThrough: boolean

    useInfoOf?: NoteEntity
}

export const toNoteEntity = (
    slideId: SlideId,
    object: NoteObject,
    useInfoOf?: NoteEntity,
): NoteEntity => ({
    type: 'note',
    hitbox: {
        lane: object.left + object.size / 2,
        beat: object.beat,
        w: object.size / 2,
        h: 0.4,
    },

    slideId,
    groupId: object.groupId,
    beat: object.beat,
    noteType: object.noteType,
    isAttached: object.isAttached,
    left: object.left,
    size: object.size,
    isCritical: object.isCritical,
    flickDirection: object.flickDirection,
    sfx: object.sfx,
    isFake: object.isFake,
    isConnectorSeparator: object.isConnectorSeparator,
    connectorType: object.connectorType,
    connectorEase: object.connectorEase,
    connectorActiveIsCritical: object.connectorActiveIsCritical,
    connectorActiveIsFake: object.connectorActiveIsFake,
    connectorGuideColor: object.connectorGuideColor,
    connectorGuideAlpha: object.connectorGuideAlpha,
    connectorLayer: object.connectorLayer,
    connectorIsPassThrough: object.connectorIsPassThrough,

    useInfoOf,
})
