import type { Command } from '..'
import { i18n } from '../../../i18n'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { view } from '../../view'
import TextIcon from '../TextIcon.vue'

export const division = (division: number): Command => ({
    title: interpolate(() => i18n.value.commands.divisions.title, `${division}`),
    icon: {
        is: TextIcon,
        props: {
            title: `1/${division}`,
        },
    },

    execute() {
        view.division = division

        notify(interpolate(() => i18n.value.commands.divisions.switched, `${division}`))
    },
})
