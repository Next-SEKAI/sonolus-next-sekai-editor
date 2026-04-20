import { ref } from 'vue'
import type { Tool } from '..'
import { pushState, state } from '../../../history'
import { bgm } from '../../../history/bgm'
import { i18n } from '../../../i18n'
import { align } from '../../../utils/math'
import { notify } from '../../notification'
import { yToTime } from '../../view'

export const bgmOffsetDelta = ref(0)

let activeTime = 0

export const offset: Tool = {
    title: () => i18n.value.tools.offset.title,

    dragStart(x, y) {
        activeTime = yToTime(y)

        bgmOffsetDelta.value = 0

        return true
    },

    dragUpdate(x, y) {
        bgmOffsetDelta.value = activeTime - yToTime(y)
    },

    dragEnd(x, y) {
        bgmOffsetDelta.value = 0

        pushState(() => i18n.value.tools.offset.changed, {
            ...state.value,
            bgm: {
                ...bgm.value,
                offset: align(bgm.value.offset + activeTime - yToTime(y), 1000),
            },
        })

        notify(() => i18n.value.tools.offset.changed)
    },
}
