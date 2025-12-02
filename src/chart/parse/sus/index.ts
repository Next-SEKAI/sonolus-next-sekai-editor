import type { Sus } from '../../../sus/parse.js'
import type { Chart, NoteObject } from '../../index.js'

export const parseSusChart = (sus: Sus) => {
    const chart: Chart = {
        bpms: [],
        groupCount: 2,
        timeScales: [],
        slides: [],
    }

    const flickMods = new Map<string, 'left' | 'up' | 'right'>()
    const traceMods = new Set<string>()
    const criticalMods = new Set<string>()
    const tickRemoveMods = new Set<string>()
    const slideStartEndRemoveMods = new Set<string>()
    const easeMods = new Map<string, 'in' | 'out'>()

    const preventSingles = new Set<string>()
    const dedupeSingles = new Set<string>()
    const dedupeSlides = new Map<string, NoteObject[]>()

    for (const slide of sus.slides) {
        if (slide.type !== 3) continue

        for (const note of slide.notes) {
            const key = getKey(note)
            switch (note.type) {
                case 1:
                case 2:
                case 3:
                case 5:
                    preventSingles.add(key)
                    break
            }
        }
    }
    for (const note of sus.directionalNotes) {
        const key = getKey(note)
        switch (note.type) {
            case 1:
                flickMods.set(key, 'up')
                break
            case 3:
                flickMods.set(key, 'left')
                break
            case 4:
                flickMods.set(key, 'right')
                break
            case 2:
                easeMods.set(key, 'in')
                break
            case 5:
            case 6:
                easeMods.set(key, 'out')
                break
        }
    }
    for (const note of sus.tapNotes) {
        const key = getKey(note)
        switch (note.type) {
            case 2:
                criticalMods.add(key)
                break
            case 5:
                traceMods.add(key)
                break
            case 6:
                traceMods.add(key)
                criticalMods.add(key)
                break
            case 3:
                tickRemoveMods.add(key)
                break
            case 7:
                slideStartEndRemoveMods.add(key)
                break
            case 8:
                criticalMods.add(key)
                slideStartEndRemoveMods.add(key)
                break
        }
    }

    for (const timeScaleChange of sus.timeScaleChanges) {
        chart.timeScales.push({
            group: 0,
            beat: timeScaleChange.tick / sus.ticksPerBeat,
            timeScale: timeScaleChange.timeScale,
            skip: 0,
            ease: 'none',
            hideNotes: false,
        })
    }

    for (const bpmChange of sus.bpmChanges) {
        chart.bpms.push({
            beat: bpmChange.tick / sus.ticksPerBeat,
            bpm: bpmChange.bpm,
        })
    }

    for (const note of sus.tapNotes) {
        if (note.lane <= 1 || note.lane >= 14) continue
        if (note.type !== 1 && note.type !== 2 && note.type !== 5 && note.type !== 6) continue

        const key = getKey(note)
        if (preventSingles.has(key)) continue

        if (dedupeSingles.has(key)) continue
        dedupeSingles.add(key)

        const isCritical = note.type === 2 || note.type === 6

        chart.slides.push([
            {
                group: 0,
                beat: note.tick / sus.ticksPerBeat,
                noteType: note.type === 5 || note.type === 6 ? 'trace' : 'default',
                isAttached: false,
                left: note.lane - 8,
                size: note.width,
                isCritical,
                flickDirection: flickDirections[flickMods.get(key) ?? 'none'],
                isFake: false,
                sfx: 'default',
                isConnectorSeparator: false,
                connectorType: 'active',
                connectorEase: 'linear',
                connectorActiveIsCritical: isCritical,
                connectorActiveIsFake: false,
                connectorGuideColor: 'green',
                connectorGuideAlpha: 1,
                connectorLayer: 'top',
            },
        ])
    }

    for (const slide of sus.slides) {
        const startNote = slide.notes.find(({ type }) => type === 1 || type === 2)
        if (!startNote) continue

        const slideCriticalMod = criticalMods.has(getKey(startNote))

        const group = 0
        const isFake = false
        const sfx = 'default'
        const isConnectorSeparator = false
        const connectorType = slide.type === 3 ? 'active' : 'guide'
        const connectorActiveIsCritical = connectorType === 'active' && slideCriticalMod
        const connectorActiveIsFake = false
        const connectorGuideColor =
            connectorType === 'guide' && slideCriticalMod ? 'yellow' : 'green'
        const connectorLayer = connectorType === 'guide' ? 'bottom' : 'top'

        const objects: NoteObject[] = []

        for (const note of slide.notes) {
            const key = getKey(note)

            const beat = note.tick / sus.ticksPerBeat
            const left = note.lane - 8
            const size = note.width
            const isCritical =
                connectorType === 'active' && (slideCriticalMod || criticalMods.has(key))
            const connectorEase = easeMods.get(key) ?? 'linear'

            switch (note.type) {
                case 1: {
                    if (connectorType === 'guide' || slideStartEndRemoveMods.has(key)) {
                        objects.push({
                            group,
                            beat,
                            noteType: 'anchor',
                            isAttached: false,
                            left,
                            size,
                            isCritical,
                            flickDirection: 'none',
                            isFake,
                            sfx,
                            isConnectorSeparator,
                            connectorType,
                            connectorEase,
                            connectorActiveIsCritical,
                            connectorActiveIsFake,
                            connectorGuideColor,
                            connectorGuideAlpha: 1,
                            connectorLayer,
                        })
                    } else {
                        objects.push({
                            group,
                            beat,
                            noteType: traceMods.has(key) ? 'trace' : 'default',
                            isAttached: false,
                            left,
                            size,
                            isCritical,
                            flickDirection: 'none',
                            isFake,
                            sfx,
                            isConnectorSeparator,
                            connectorType,
                            connectorEase,
                            connectorActiveIsCritical,
                            connectorActiveIsFake,
                            connectorGuideColor,
                            connectorGuideAlpha: 1,
                            connectorLayer,
                        })
                    }
                    break
                }
                case 2: {
                    if (connectorType === 'guide' || slideStartEndRemoveMods.has(key)) {
                        objects.push({
                            group,
                            beat,
                            noteType: 'anchor',
                            isAttached: false,
                            left,
                            size,
                            isCritical,
                            flickDirection: 'none',
                            isFake,
                            sfx,
                            isConnectorSeparator,
                            connectorType,
                            connectorEase,
                            connectorActiveIsCritical,
                            connectorActiveIsFake,
                            connectorGuideColor,
                            connectorGuideAlpha: 0,
                            connectorLayer,
                        })
                    } else {
                        objects.push({
                            group,
                            beat,
                            noteType: traceMods.has(key) ? 'trace' : 'default',
                            isAttached: false,
                            left,
                            size,
                            isCritical,
                            flickDirection: flickDirections[flickMods.get(key) ?? 'none'],
                            isFake,
                            sfx,
                            isConnectorSeparator,
                            connectorType,
                            connectorEase,
                            connectorActiveIsCritical,
                            connectorActiveIsFake,
                            connectorGuideColor,
                            connectorGuideAlpha: 1,
                            connectorLayer,
                        })
                    }
                    break
                }
                case 3: {
                    if (tickRemoveMods.has(key)) {
                        objects.push({
                            group,
                            beat,
                            noteType: 'default',
                            isAttached: true,
                            left,
                            size,
                            isCritical,
                            flickDirection: 'none',
                            isFake,
                            sfx,
                            isConnectorSeparator,
                            connectorType,
                            connectorEase,
                            connectorActiveIsCritical,
                            connectorActiveIsFake,
                            connectorGuideColor,
                            connectorGuideAlpha: 1,
                            connectorLayer,
                        })
                    } else {
                        objects.push({
                            group,
                            beat,
                            noteType: traceMods.has(key) ? 'trace' : 'default',
                            isAttached: tickRemoveMods.has(key),
                            left,
                            size,
                            isCritical,
                            flickDirection: 'none',
                            isFake,
                            sfx,
                            isConnectorSeparator,
                            connectorType,
                            connectorEase,
                            connectorActiveIsCritical,
                            connectorActiveIsFake,
                            connectorGuideColor,
                            connectorGuideAlpha: 1,
                            connectorLayer,
                        })
                    }
                    break
                }
                case 5: {
                    if (tickRemoveMods.has(key)) break

                    objects.push({
                        group: 0,
                        beat,
                        noteType: 'anchor',
                        isAttached: false,
                        left,
                        size,
                        isCritical,
                        flickDirection: 'none',
                        isFake,
                        sfx,
                        isConnectorSeparator,
                        connectorType,
                        connectorEase,
                        connectorActiveIsCritical,
                        connectorActiveIsFake,
                        connectorGuideColor,
                        connectorGuideAlpha: 1,
                        connectorLayer,
                    })
                    break
                }
            }
        }

        chart.slides.push(objects)

        if (connectorType === 'guide') continue

        const key = getKey(startNote)
        const dupe = dedupeSlides.get(key)
        if (dupe) chart.slides.splice(chart.slides.indexOf(dupe), 1)

        dedupeSlides.set(key, objects)
    }

    return chart
}

const getKey = (note: { tick: number; lane: number }) => `${note.lane}-${note.tick}`

const flickDirections = {
    up: 'up',
    left: 'upLeft',
    right: 'upRight',
    none: 'none',
} as const
