import type { Command } from '..'
import type { ClipboardData } from '../../../clipboardData/schema'
import { state } from '../../../history'
import { selectedEntities } from '../../../history/selectedEntities'
import { store } from '../../../history/store'
import { i18n } from '../../../i18n'
import { serializeToLevelDataEntities } from '../../../levelData/entities/serialize'
import type { Entity, EntityOfType, EntityType } from '../../../state/entities'
import { createStore } from '../../../state/store/creates'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { hitAllEntitiesAtPoint } from '../../tools/utils'
import { view, yToValidBeat } from '../../view'
import CopyIcon from './CopyIcon.vue'

export const copy: Command = {
    title: () => i18n.value.commands.copy.title,
    icon: {
        is: CopyIcon,
    },

    async execute() {
        const entities = selectedEntities.value

        if (!entities.length) {
            notify(() => i18n.value.commands.copy.noSelected)
            return
        }

        const data: ClipboardData = {
            ...getAnchor(entities, view.pointer.x, view.pointer.y),
            entities: serializeToLevelDataEntities(
                createStore({
                    bpms: getEntities(entities, 'bpm'),
                    timeScales: getEntities(entities, 'timeScale'),
                    groupCount: state.value.groupCount,
                    slides: getSlides(entities),
                }),
                state.value.groupCount,
            ),
        }
        const text = JSON.stringify(data)

        await navigator.clipboard.writeText(text)

        notify(interpolate(() => i18n.value.commands.copy.copied, `${entities.length}`))
    },
}

const getAnchor = (entities: Entity[], x: number, y: number) => {
    const hitEntities = hitAllEntitiesAtPoint(x, y)
        .filter((entity) => entities.includes(entity))
        .sort((a, b) => a.beat - b.beat)
    const sortedEntities = [...entities].sort((a, b) => a.beat - b.beat)

    const note =
        hitEntities.find((entity) => entity.type === 'note') ??
        sortedEntities.find((entity) => entity.type === 'note')
    if (note)
        return {
            lane: note.left + note.size / 2,
            beat: note.beat,
        }

    const entity = hitEntities[0] ?? sortedEntities[0]
    return {
        lane: 0,
        beat: entity?.beat ?? yToValidBeat(y),
    }
}

const getEntities = <T extends EntityType>(entities: Entity[], type: T) =>
    entities.filter((entity): entity is EntityOfType<T> => entity.type === type)

const getSlides = (entities: Entity[]) => {
    const selectedNotes = entities.filter((entity) => entity.type === 'note')
    const selectedNotesSet = new Set(selectedNotes)

    return [...new Set(selectedNotes.map((note) => note.slideId))].map((slideId) => {
        const notes = store.value.slides.note.get(slideId)
        if (!notes) throw new Error('Unexpected notes not found')

        return notes.filter((note) => selectedNotesSet.has(note))
    })
}
