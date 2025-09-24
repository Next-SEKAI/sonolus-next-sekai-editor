import type { TimeScaleEase } from '../chart'

export const formatIntegerTime = (time: number) =>
    `${`${Math.floor(time / 60)}`.padStart(2, '0')}:${`${time % 60}`.padStart(2, '0')}`

export const formatTime = (time: number) =>
    `${`${Math.floor(time / 60)}`.padStart(2, '0')}:${(time % 60).toFixed(3).padStart(6, '0')}`

export const formatIntegerBeat = (beat: number) => `${beat}`

export const formatBeat = (beat: number) => beat.toFixed(3)

export const formatBpm = (value: number) => `${value}`

export const formatTimeScale = (
    value: number,
    skip: number,
    ease: TimeScaleEase,
    hideNotes: boolean,
) => {
    let text = `${hideNotes ? 'H' : ''}${value}x`

    if (skip) {
        if (skip > 0) text += '+'
        text += `${skip}`
    }

    if (ease === 'linear') {
        text += '^'
    }

    return text
}
