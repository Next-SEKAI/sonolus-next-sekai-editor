import { lerp, remap } from './math'

export const MIN_START_TIME = -2

export type TimescaleEase = 0 | 1 // none | linear

export type TimescaleChange = {
    time: number
    timescale: number
    skipSeconds: number
    ease: TimescaleEase
    hideNotes: boolean
}

export type TimescaleGroup = {
    changes: TimescaleChange[]
    scaledAtChanges: number[]
    forceNoteSpeed: number
}

export const createTimescaleGroup = (
    changes: TimescaleChange[],
    forceNoteSpeed: number,
): TimescaleGroup => {
    changes.sort((a, b) => a.time - b.time)

    const scaledAtChanges: number[] = []

    let lastTimescale = 1
    let lastTime = MIN_START_TIME
    let lastScaled = MIN_START_TIME
    let lastEase: TimescaleEase = 0

    for (const change of changes) {
        let scaled
        switch (lastEase) {
            case 0:
                scaled = lastScaled + (change.time - lastTime) * lastTimescale
                break
            case 1:
                scaled =
                    lastScaled + ((change.time - lastTime) * (change.timescale + lastTimescale)) / 2
                break
        }

        scaled += change.skipSeconds
        scaledAtChanges.push(scaled)

        lastTimescale = change.timescale
        lastTime = change.time
        lastScaled = scaled
        lastEase = change.ease
    }

    return { changes, scaledAtChanges, forceNoteSpeed }
}

const findLastChange = (changes: TimescaleChange[], t: number) => {
    let lo = 0
    let hi = changes.length - 1
    let result = -1
    while (lo <= hi) {
        const mid = (lo + hi) >> 1
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (changes[mid]!.time <= t) {
            result = mid
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }
    return result
}

export const scaledTimeAt = (group: TimescaleGroup, t: number) => {
    if (t <= MIN_START_TIME) return t

    const { changes, scaledAtChanges } = group
    const index = findLastChange(changes, t)
    if (index === -1) return t

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const change = changes[index]!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const scaled = scaledAtChanges[index]!

    switch (change.ease) {
        case 0:
            return scaled + (t - change.time) * change.timescale
        case 1: {
            const next = changes[index + 1]
            if (!next || Math.abs(next.time - change.time) < 1e-6) {
                return scaled + (t - change.time) * change.timescale
            }

            const avgTimescale =
                (change.timescale +
                    remap(change.time, next.time, change.timescale, next.timescale, t)) /
                2
            return scaled + (t - change.time) * avgTimescale
        }
    }
}

export const hideNotesAt = (group: TimescaleGroup, t: number) => {
    const index = findLastChange(group.changes, t)
    if (index === -1) return false

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return group.changes[index]!.hideNotes
}

export const preemptTime = (noteSpeed: number, forceSpeed: number) => {
    const speed = forceSpeed > 0 ? forceSpeed : noteSpeed
    return lerp(0.35, 4, ((1 - speed / 12) / (1 - 1 / 12)) ** 1.31)
}

export const progressTo = (targetScaledTime: number, nowScaledTime: number, preempt: number) =>
    (nowScaledTime - targetScaledTime + preempt) / preempt
