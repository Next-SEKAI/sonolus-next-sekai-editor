import type { Command } from '..'
import { i18n } from '../../../i18n'
import { isSfxEnabled } from '../../../player'
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
        props: {
            get state() {
                return isSfxEnabled.value
            },
        },
    },

    execute() {
        isSfxEnabled.value = !isSfxEnabled.value

        notify(
            interpolate(
                () => i18n.value.commands.toggleVolume.toggled,
                () => i18n.value.commands.toggleVolume.type.sfx,
            ),
        )
    },
}
