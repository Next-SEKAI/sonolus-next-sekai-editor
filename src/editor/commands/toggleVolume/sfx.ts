import type { Command } from '..'
import { i18n } from '../../../i18n'
import { togglePlayerSfxVolume } from '../../../player'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import ToggleVolumeIcon from './ToggleVolumeIcon.vue'

export const toggleSfxVolume: Command = {
    title: interpolate(
        () => i18n.value.commands.toggleVolume.title,
        () => i18n.value.commands.toggleVolume.type.sfx,
    ),
    icon: {
        is: ToggleVolumeIcon,
    },

    execute() {
        togglePlayerSfxVolume()

        notify(
            interpolate(
                () => i18n.value.commands.toggleVolume.toggled,
                () => i18n.value.commands.toggleVolume.type.sfx,
            ),
        )
    },
}
