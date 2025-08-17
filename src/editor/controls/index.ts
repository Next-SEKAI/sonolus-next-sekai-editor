import { mouseControlListeners } from './mouse'
import { touchControlListeners } from './touch'

const contextmenu = (event: Event) => {
    event.preventDefault()
}

export const controlListeners = {
    ...mouseControlListeners,
    ...touchControlListeners,
    contextmenu,
}
