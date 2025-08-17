import { shallowRef } from 'vue'
import { version } from '../../package.json'
import { i18n } from '../i18n'
import { interpolate } from '../utils/interpolate'

let id = 0

export const notification = shallowRef({
    id: id++,
    message: interpolate(() => i18n.value.notification.title, version),
})

export const notify = (message: () => string) => {
    notification.value = {
        id: id++,
        message,
    }
}
