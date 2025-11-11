import type { Command } from '..'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import { settings } from '../../../settings'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { focusSidebar, isSidebarVisible } from '../../sidebars'
import { switchToolTo, toolName } from '../../tools'
import { defaultSlidePropertiesPresetIndex } from '../../tools/slide'
import DefaultSlidePropertiesModal from './DefaultSlidePropertiesModal.vue'
import SlideIcon from './SlideIcon.vue'

export const slide: Command = {
    title: () => i18n.value.commands.slide.title.default,
    icon: {
        is: SlideIcon,
    },

    async execute() {
        if (toolName.value === 'slide') {
            if (isSidebarVisible.value) {
                defaultSlidePropertiesPresetIndex.value =
                    (defaultSlidePropertiesPresetIndex.value + 1) %
                    settings.defaultSlidePropertiesPresets.length
            } else {
                await showModal(DefaultSlidePropertiesModal, {})
            }
        } else {
            switchToolTo('slide')
        }

        notify(
            interpolate(
                () => i18n.value.commands.slide.switched,
                `${defaultSlidePropertiesPresetIndex.value + 1}`,
            ),
        )
    },
}

export const createSlide = (index: number): Command => ({
    title: interpolate(() => i18n.value.commands.slide.title.preset, `${index + 1}`),
    icon: {
        is: SlideIcon,
        props: {
            index,
        },
    },

    async execute() {
        if (toolName.value === 'slide' && defaultSlidePropertiesPresetIndex.value === index) {
            if (isSidebarVisible.value) {
                focusSidebar()
            } else {
                await showModal(DefaultSlidePropertiesModal, {})
            }
        } else {
            defaultSlidePropertiesPresetIndex.value = index
            switchToolTo('slide')
        }

        notify(
            interpolate(
                () => i18n.value.commands.slide.switched,
                `${defaultSlidePropertiesPresetIndex.value + 1}`,
            ),
        )
    },
})
