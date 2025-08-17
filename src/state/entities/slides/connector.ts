import type { BaseEntity } from '..'
import type { NoteEntity } from './note'

export type ConnectorEntity = BaseEntity & {
    type: 'connector'
    head: NoteEntity
    tail: NoteEntity
    attachHead: NoteEntity
    attachTail: NoteEntity
    segmentHead: NoteEntity
    segmentTail: NoteEntity
}

export const toConnectorEntity = (
    head: NoteEntity,
    tail: NoteEntity,
    attachHead: NoteEntity,
    attachTail: NoteEntity,
    segmentHead: NoteEntity,
    segmentTail: NoteEntity,
): ConnectorEntity => ({
    type: 'connector',

    beat: head.beat,
    head,
    tail,
    attachHead,
    attachTail,
    segmentHead,
    segmentTail,
})
