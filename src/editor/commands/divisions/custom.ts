import type { Command } from '..'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { view } from '../../view'
import TextIcon from '../TextIcon.vue'
import CustomDivisionModal from './CustomDivisionModal.vue'

export const divisionCustom: Command = {
    title: () => i18n.value.commands.divisions.custom.title,
    icon: {
        is: TextIcon,
        props: {
            title: '1/n',
        },
    },

    async execute() {
        const division: number | undefined = await showModal(CustomDivisionModal, {})
        if (!division) return

        view.division = division

        notify(interpolate(() => i18n.value.commands.divisions.switched, `${division}`))
    },
}
