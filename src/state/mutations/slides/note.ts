import type { NoteObject } from '../../../chart'
import type { SlideId } from '../../entities/slides'
import { toNoteEntity, type NoteEntity } from '../../entities/slides/note'
import { addToStoreGrid, removeFromStoreGrid } from '../../store/grid'
import type { Transaction } from '../../transaction'

export const addNote = (
    { store, addToGroup }: Transaction,
    slideId: SlideId,
    object: NoteObject,
) => {
    const note = toNoteEntity(slideId, object)
    addToStoreGrid(store.grid, note, note.beat)
    addToGroup(note.group)

    const notes = store.slides.note.get(slideId)
    store.slides.note.set(slideId, notes ? [...notes, note] : [note])
    store.markDirty(slideId)

    return [note]
}

export const replaceNote = (
    { store, addToGroup }: Transaction,
    note: NoteEntity,
    object: NoteObject,
) => {
    removeFromStoreGrid(store.grid, note, note.beat)

    const newNote = toNoteEntity(note.slideId, object)
    addToStoreGrid(store.grid, newNote, newNote.beat)
    addToGroup(newNote.group)

    const notes = store.slides.note.get(note.slideId)
    if (!notes) throw new Error('Unexpected notes not found')

    const newNotes = [...notes]
    newNotes[notes.indexOf(note)] = newNote

    store.slides.note.set(note.slideId, newNotes)
    store.markDirty(note.slideId)

    return [newNote]
}

export const removeNote = ({ store }: Transaction, note: NoteEntity) => {
    removeFromStoreGrid(store.grid, note, note.beat)

    const notes = store.slides.note.get(note.slideId)
    if (!notes) throw new Error('Unexpected notes not found')

    const newNotes = [...notes]
    newNotes.splice(notes.indexOf(note), 1)

    if (newNotes.length) {
        store.slides.note.set(note.slideId, newNotes)
    } else {
        store.slides.note.delete(note.slideId)
    }
    store.markDirty(note.slideId)
}
