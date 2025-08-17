import { store } from '../../history/store'
import type { NoteEntity } from '../../state/entities/slides/note'

export type NoteFields = {
    isAttached: boolean
    left: boolean
    size: boolean
    isCritical: boolean
    flickDirection: boolean
    isFake: boolean
    isConnectorSeparator: boolean
    connectorType: boolean
    connectorEase: boolean
    connectorActiveIsCritical: boolean
    connectorActiveIsFake: boolean
    connectorGuideColor: boolean
    connectorGuideAlpha: boolean
}

export const getNoteFields = (note: NoteEntity): NoteFields => {
    const infos = store.value.slides.info.get(note.slideId)
    if (!infos) throw new Error('Unexpected missing infos')

    const info = infos.find((info) => info.note === note)
    if (!info) throw new Error('Unexpected missing info')

    const isFirst = infos[0] === info
    const isLast = infos[infos.length - 1] === info
    const isInActive = info.activeHead !== info.activeTail
    const isActiveHead = info.activeHead === info.note
    const isActiveTail = info.activeTail === info.note
    const isInGuide = info.guideHead !== info.guideTail
    const isGuideHead = info.guideHead === info.note
    const isGuideTail = info.guideTail === info.note

    return {
        isAttached: !isFirst && !isLast,
        left: isFirst || isLast || !note.isAttached,
        size: isFirst || isLast || !note.isAttached,
        isCritical: note.noteType !== 'anchor' && note.noteType !== 'damage',
        flickDirection:
            note.noteType === 'trace' ||
            (note.noteType === 'default' && (!isInActive || isActiveTail)) ||
            (note.noteType === 'forceNonTick' && (!isInActive || !isActiveHead)),
        isFake: note.noteType !== 'anchor',
        isConnectorSeparator: !isFirst && !isLast,
        connectorType: (isFirst || note.isConnectorSeparator) && !isLast,
        connectorEase: (isFirst || !note.isAttached) && !isLast,
        connectorActiveIsCritical: isInActive && (isActiveHead || note.isConnectorSeparator),
        connectorActiveIsFake: isInActive && (isActiveHead || note.isConnectorSeparator),
        connectorGuideColor: isInGuide && (isGuideHead || note.isConnectorSeparator),
        connectorGuideAlpha: isInGuide && (isGuideHead || note.isConnectorSeparator || isGuideTail),
    }
}
