import { watch } from 'vue'
import { i18n } from '../i18n'
import { startPlayer as _startPlayer, stopPlayer as _stopPlayer, previewPlayer } from '../player'
import { settings } from '../settings'
import { time } from '../time'
import { interpolate } from '../utils/interpolate'
import { notify } from './notification'
import { focusView, view } from './view'

let speed = 1

let state:
    | {
          speed: number
          startTime: number
          startCursorTime: number
          returnTime: number
      }
    | undefined

watch(time, ({ now }) => {
    if (!state) return

    view.cursorTime = Math.max(0, now - state.startTime) * state.speed + state.startCursorTime

    if (!settings.playFollow) return

    view.time = Math.max(
        0,
        view.cursorTime + ((0.5 - settings.playFollowPosition / 100) * view.h) / settings.pps,
    )
})

watch(
    () => view.cursorTime,
    () => {
        if (state) return

        previewPlayer()
    },
)

export const startOrStopPlayer = () => {
    if (state) {
        _stopPlayer()

        state = undefined

        notify(() => i18n.value.player.stopped)
    } else {
        state = {
            speed,
            startTime: _startPlayer(speed),
            startCursorTime: view.cursorTime,
            returnTime: view.cursorTime,
        }

        notify(() => i18n.value.player.started)
    }
}

export const stopPlayer = (shouldReturn: boolean) => {
    if (!state) return

    _stopPlayer()

    if (shouldReturn) focusView(state.returnTime)
    state = undefined

    notify(() => i18n.value.player.stopped)
}

export const changePlayerSpeed = (direction: -1 | 1) => {
    if (state) {
        _stopPlayer()
    }

    speed = getNewSpeed(direction)

    if (state) {
        state = {
            speed,
            startTime: _startPlayer(speed),
            startCursorTime: view.cursorTime,
            returnTime: state.returnTime,
        }
    }

    notify(interpolate(() => i18n.value.player.changed, `${speed}`))
}

const speeds = [0.5, 0.75, 1, 1.5, 2]

const getNewSpeed = (direction: -1 | 1) => {
    const index = speeds.indexOf(speed)
    if (index === -1) return 1

    return speeds[index + direction] ?? speed
}
