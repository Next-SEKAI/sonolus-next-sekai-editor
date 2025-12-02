import type { Command } from '..'
import { i18n } from '../../../i18n'
import { notify } from '../../notification'
import FullscreenIcon from './FullscreenIcon.vue'

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Document {
        webkitFullscreenElement: Document['fullscreenElement']
        webkitExitFullscreen: Document['exitFullscreen']
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Element {
        webkitRequestFullscreen: Element['requestFullscreen']
    }
}

export const fullscreen: Command = {
    title: () => i18n.value.commands.fullscreen.title,
    icon: {
        is: FullscreenIcon,
    },

    execute() {
        try {
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (document.exitFullscreen) {
                    void document.exitFullscreen()
                } else {
                    void document.webkitExitFullscreen()
                }
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (document.body.requestFullscreen) {
                    void document.body.requestFullscreen({ navigationUI: 'hide' })
                } else {
                    void document.body.webkitRequestFullscreen({ navigationUI: 'hide' })
                }
            }
        } finally {
            notify(() => i18n.value.commands.fullscreen.toggled)
        }
    },
}
