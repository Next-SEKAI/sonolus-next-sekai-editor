import { ease } from '../../../ease'
import { lerp, unlerp } from '../../../utils/math'
import type { Entity } from '../../entities'
import type { SlideId } from '../../entities/slides'
import { toConnectorEntity, type ConnectorEntity } from '../../entities/slides/connector'
import { toNoteEntity, type NoteEntity } from '../../entities/slides/note'
import type { Store } from '../../store'
import { addToStoreGrid, removeFromStoreGrid } from '../../store/grid'

export const rebuildSlide = (store: Store, slideId: SlideId, selectedEntities: Entity[]) => {
    store.slides.info.delete(slideId)

    const connectors = store.slides.connector.get(slideId)
    if (connectors) {
        for (const connector of connectors) {
            removeFromStoreGrid(store.grid, connector, connector.head.beat, connector.tail.beat)
        }

        store.slides.connector.delete(slideId)
    }

    const notes = store.slides.note.get(slideId)
    if (!notes?.length) return

    notes.sort((a, b) => a.beat - b.beat)

    let attachHead = 0
    let attachTail = 0
    let segmentHead = 0
    let segmentTail = 0
    let activeHead = -1
    let activeTail = -1
    let guideHead = -1
    let guideTail = -1

    const rawInfos = notes.map((note, i) => {
        if (i === 0 || note.isConnectorSeparator) {
            if (note.connectorType === 'active') {
                if (activeHead === -1) activeHead = i
            } else {
                if (guideHead === -1) guideHead = i
            }
        }

        const rawInfo = {
            note,
            attachHead,
            attachTail,
            segmentHead,
            segmentTail,
            activeHead,
            activeTail,
            guideHead,
            guideTail,
        }

        if (!note.isAttached) attachHead = i
        if (note.isConnectorSeparator) segmentHead = i
        if (note.isConnectorSeparator) {
            if (note.connectorType === 'active') {
                guideHead = -1
            } else {
                activeHead = -1
            }
        }

        return rawInfo
    })

    activeHead = -1
    guideHead = -1

    for (let i = rawInfos.length - 1; i >= 0; i--) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const rawInfo = rawInfos[i]!

        if (i === rawInfos.length - 1 || !rawInfo.note.isAttached) attachTail = i
        if (i === rawInfos.length - 1 || rawInfo.note.isConnectorSeparator) segmentTail = i
        if (activeHead !== rawInfo.activeHead) {
            activeHead = rawInfo.activeHead
            if (rawInfo.activeHead === -1) {
                activeTail = -1
            } else {
                activeTail = i
            }
        }
        if (guideHead !== rawInfo.guideHead) {
            guideHead = rawInfo.guideHead
            if (rawInfo.guideHead === -1) {
                guideTail = -1
            } else {
                guideTail = i
            }
        }

        rawInfo.attachTail = attachTail
        rawInfo.segmentTail = segmentTail
        rawInfo.activeTail = activeTail
        rawInfo.guideTail = guideTail
    }

    for (const [i, rawInfo] of rawInfos.entries()) {
        if (i === 0 || i === notes.length - 1 || !rawInfo.note.isAttached) continue

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const head = notes[rawInfo.attachHead]!
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const tail = notes[rawInfo.attachTail]!

        const x = ease(
            head.connectorEase,
            head.beat === tail.beat ? 0.5 : unlerp(head.beat, tail.beat, rawInfo.note.beat),
        )

        const note = toNoteEntity(rawInfo.note.slideId, {
            ...rawInfo.note,
            left: lerp(head.left, tail.left, x),
            size: lerp(head.size, tail.size, x),
        })

        const index = selectedEntities.indexOf(rawInfo.note)
        removeFromStoreGrid(store.grid, rawInfo.note, rawInfo.note.beat)

        rawInfo.note = note
        notes[i] = note
        if (index !== -1) selectedEntities[index] = note
        addToStoreGrid(store.grid, note, note.beat)
    }

    const infos = rawInfos.map((rawInfo) => ({
        note: rawInfo.note,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        attachHead: notes[rawInfo.attachHead]!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        attachTail: notes[rawInfo.attachTail]!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        segmentHead: notes[rawInfo.segmentHead]!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        segmentTail: notes[rawInfo.segmentTail]!,
        activeHead: notes[rawInfo.activeHead],
        activeTail: notes[rawInfo.activeTail],
        guideHead: notes[rawInfo.guideHead],
        guideTail: notes[rawInfo.guideTail],
    }))

    store.slides.info.set(slideId, infos)

    const newConnectors: ConnectorEntity[] = []

    let head: NoteEntity | undefined
    for (const [i, info] of infos.entries()) {
        if (
            i !== 0 &&
            i !== notes.length - 1 &&
            info.note.isAttached &&
            !info.note.isConnectorSeparator
        )
            continue

        if (head) {
            newConnectors.push(
                toConnectorEntity(
                    head,
                    info.note,
                    info.attachHead,
                    info.attachTail,
                    info.segmentHead,
                    info.segmentTail,
                ),
            )
        }

        head = info.note
    }

    if (newConnectors.length) {
        for (const connector of newConnectors) {
            addToStoreGrid(store.grid, connector, connector.head.beat, connector.tail.beat)
        }

        store.slides.connector.set(slideId, newConnectors)
    }
}
