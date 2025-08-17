import type { SlideId } from '../entities/slides'
import type { ConnectorEntity } from '../entities/slides/connector'
import type { NoteEntity } from '../entities/slides/note'

export type StoreSlides = {
    note: Map<SlideId, NoteEntity[]>
    info: Map<
        SlideId,
        {
            note: NoteEntity
            attachHead: NoteEntity
            attachTail: NoteEntity
            segmentHead: NoteEntity
            segmentTail: NoteEntity
            activeHead?: NoteEntity
            activeTail?: NoteEntity
            guideHead?: NoteEntity
            guideTail?: NoteEntity
        }[]
    >
    connector: Map<SlideId, ConnectorEntity[]>
}
