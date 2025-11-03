import { settings } from '../../settings'
import { zoomXIn } from '../commands/zooms/zoomXIn'
import { zoomXOut } from '../commands/zooms/zoomXOut'
import { zoomYIn } from '../commands/zooms/zoomYIn'
import { zoomYOut } from '../commands/zooms/zoomYOut'
import { stopPlayer } from '../player'
import { switchToolTo, tool, toolName, type ToolName } from '../tools'
import { scrollViewXBy, scrollViewYBy, setViewHover, updateViewPointer, view } from '../view'
import { gesture } from './gestures/gesture'
import { drag } from './gestures/recognizers/drag'
import { tap } from './gestures/recognizers/tap'

const mouseGesture = gesture(drag(false), tap())

const toP = (event: MouseEvent) => ({
    id: 1,
    x: event.clientX,
    y: event.clientY,
    modifiers: {
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
    },
})

let secondarySwitchBack: ToolName | undefined

const mousedown = (event: MouseEvent) => {
    const p = toP(event)
    updateViewPointer(p)

    view.scrollingY = undefined
    stopPlayer(false)

    if (!mouseGesture.pointerCount && event.buttons & 2 && !secondarySwitchBack) {
        secondarySwitchBack = toolName.value
        switchToolTo(settings.mouseSecondaryTool)
    }

    mouseGesture.start([p])

    event.preventDefault()
}

const mousemove = (event: MouseEvent) => {
    const p = toP(event)
    updateViewPointer(p)

    if (mouseGesture.pointerCount) {
        mouseGesture.move([p])
    } else {
        setViewHover(p.y)
        void tool.value.hover?.(p.x, p.y, p.modifiers)
    }

    event.preventDefault()
}

const mouseup = (event: MouseEvent) => {
    const p = toP(event)
    updateViewPointer(p)

    mouseGesture.end([p])

    if (!mouseGesture.pointerCount && secondarySwitchBack) {
        switchToolTo(secondarySwitchBack)
        secondarySwitchBack = undefined
    }

    event.preventDefault()
}

const mouseleave = (event: MouseEvent) => {
    const p = toP(event)
    updateViewPointer(p)

    mouseGesture.end([p])

    event.preventDefault()
}

const wheel = (event: WheelEvent) => {
    if (event.ctrlKey) {
        if (event.shiftKey) {
            if (event.deltaY) {
                if (event.deltaY > 0) {
                    void zoomXOut.execute()
                } else {
                    void zoomXIn.execute()
                }
            }
            if (event.deltaX) {
                if (event.deltaX > 0) {
                    void zoomYOut.execute()
                } else {
                    void zoomYIn.execute()
                }
            }
        } else {
            if (event.deltaY) {
                if (event.deltaY > 0) {
                    void zoomYOut.execute()
                } else {
                    void zoomYIn.execute()
                }
            }
            if (event.deltaX) {
                if (event.deltaX > 0) {
                    void zoomXOut.execute()
                } else {
                    void zoomXIn.execute()
                }
            }
        }
    } else {
        if (event.shiftKey) {
            switch (event.deltaMode) {
                case WheelEvent.DOM_DELTA_PIXEL:
                    if (!settings.lockScrollX)
                        scrollViewXBy(event.deltaY, settings.mouseSmoothScrolling)
                    scrollViewYBy(-event.deltaX, settings.mouseSmoothScrolling)
                    break
                case WheelEvent.DOM_DELTA_LINE:
                    if (!settings.lockScrollX)
                        scrollViewXBy(event.deltaY * 20, settings.mouseSmoothScrolling)
                    scrollViewYBy(-(event.deltaX * 20), settings.mouseSmoothScrolling)
                    break
                case WheelEvent.DOM_DELTA_PAGE:
                    if (!settings.lockScrollX)
                        scrollViewXBy(-event.deltaY * view.w, settings.mouseSmoothScrolling)
                    scrollViewYBy(-event.deltaX * view.h, settings.mouseSmoothScrolling)
                    break
            }
        } else {
            switch (event.deltaMode) {
                case WheelEvent.DOM_DELTA_PIXEL:
                    if (!settings.lockScrollX)
                        scrollViewXBy(event.deltaX, settings.mouseSmoothScrolling)
                    scrollViewYBy(-event.deltaY, settings.mouseSmoothScrolling)
                    break
                case WheelEvent.DOM_DELTA_LINE:
                    if (!settings.lockScrollX)
                        scrollViewXBy(event.deltaX * 20, settings.mouseSmoothScrolling)
                    scrollViewYBy(-(event.deltaY * 20), settings.mouseSmoothScrolling)
                    break
                case WheelEvent.DOM_DELTA_PAGE:
                    if (!settings.lockScrollX)
                        scrollViewXBy(event.deltaX * view.w, settings.mouseSmoothScrolling)
                    scrollViewYBy(-event.deltaY * view.h, settings.mouseSmoothScrolling)
                    break
            }
        }
    }

    event.preventDefault()
}

export const mouseControlListeners = {
    mousedown,
    mousemove,
    mouseup,
    mouseleave,
    wheel,
}
