import type { Command } from '..'
import { i18n } from '../../../i18n'
import { notify } from '../../notification'
import { view } from '../../view'
import SnappingIcon from './SnappingIcon.vue'

export const snapping: Command = {
    title: () => i18n.value.commands.snapping.title,
    icon: {
        is: SnappingIcon,
    },

    execute() {
        if (view.snapping === 'absolute') {
            view.snapping = 'relative'

            notify(() => i18n.value.commands.snapping.relative)
        } else {
            view.snapping = 'absolute'

            notify(() => i18n.value.commands.snapping.absolute)
        }
    },
}
