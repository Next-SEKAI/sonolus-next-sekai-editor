import { stopPlayer } from '../player'
import { updateViewPointer, view } from '../view'
import { gesture } from './gestures/gesture'
import { drag } from './gestures/recognizers/drag'
import { pan } from './gestures/recognizers/pan'
import { tap } from './gestures/recognizers/tap'
import { zoomX } from './gestures/recognizers/zoomX'
import { zoomY } from './gestures/recognizers/zoomY'

const touchGesture = gesture(zoomY(), zoomX(), pan(), drag(true), tap())

const toPs = (event: TouchEvent) =>
    [...event.changedTouches].map((touch) => ({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        modifiers: {
            ctrl: event.ctrlKey,
            shift: event.shiftKey,
        },
    }))

const touchstart = (event: TouchEvent) => {
    const ps = toPs(event)
    updateViewPointer(ps[0])

    view.scrollingY = undefined
    stopPlayer(false)

    touchGesture.start(ps)

    event.preventDefault()
}

const touchmove = (event: TouchEvent) => {
    const ps = toPs(event)
    updateViewPointer(ps[0])

    touchGesture.move(ps)

    event.preventDefault()
}

const touchend = (event: TouchEvent) => {
    const ps = toPs(event)
    updateViewPointer(ps[0])

    touchGesture.end(ps)

    event.preventDefault()
}

const touchcancel = (event: TouchEvent) => {
    const ps = toPs(event)
    updateViewPointer(ps[0])

    touchGesture.end(ps)

    event.preventDefault()
}

export const touchControlListeners = {
    touchstart,
    touchmove,
    touchend,
    touchcancel,
}
