import type { Command } from '..'
import { walkAllEntities } from '../../../history/store'
import { i18n } from '../../../i18n'
import { focusViewAtBeat } from '../../view'
import JumpUpIcon from './JumpUpIcon.vue'

export const jumpUp: Command = {
    title: () => i18n.value.commands.jumps.jumpUp.title,
    icon: {
        is: JumpUpIcon,
    },

    execute() {
        let beat = Number.NEGATIVE_INFINITY
        walkAllEntities((entity) => {
            if (entity.beat > beat) beat = entity.beat
        })

        focusViewAtBeat(beat)
    },
}
