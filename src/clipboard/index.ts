import { computed, markRaw, ref } from 'vue'
import type { Chart } from '../chart'
import { parseLevelDataChart } from '../chart/parse/levelData'
import { parseClipboardData } from './data/parse'
import type { ClipboardData } from './data/schema'

type ClipboardEntry = {
    name: string
    text: string
    data?: {
        lane: number
        beat: number
        chart: Chart
    }
}

export const clipboardEntries = ref<ClipboardEntry[]>([])

export const clipboardEntry = computed(() => clipboardEntries.value[0])

let isUpdating = false

export const updateClipboard = async () => {
    if (isUpdating) return

    isUpdating = true
    try {
        const text = await navigator.clipboard.readText()
        if (!text) return

        updateClipboardEntries(text)
    } finally {
        isUpdating = false
    }
}

export const setClipboardData = (data: ClipboardData) => {
    const text = JSON.stringify(data)
    if (!updateClipboardEntries(text)) return

    void navigator.clipboard.writeText(text)
}

export const setClipboardEntry = (entry: ClipboardEntry) => {
    clipboardEntries.value.splice(clipboardEntries.value.indexOf(entry), 1)
    clipboardEntries.value.unshift(markRaw(entry))

    void navigator.clipboard.writeText(entry.text)
}

const updateClipboardEntries = (text: string) => {
    const entry = clipboardEntries.value.find((entry) => entry.text === text)
    if (entry) {
        clipboardEntries.value.splice(clipboardEntries.value.indexOf(entry), 1)
        clipboardEntries.value.unshift(markRaw(entry))
        return false
    }

    clipboardEntries.value.unshift(markRaw(getClipboardEntry(text)))
    if (clipboardEntries.value.length > 10) clipboardEntries.value.pop()

    return true
}

let i = 0

const getClipboardEntry = (text: string): ClipboardEntry => {
    try {
        const data = parseClipboardData(JSON.parse(text))
        const chart = parseLevelDataChart(data.entities)

        return {
            name: `#${++i} (${
                chart.cameraEvents.length +
                chart.stageMaskEvents.length +
                chart.stagePivotEvents.length +
                chart.stageStyleEvents.length +
                chart.stageTransformEvents.length +
                chart.timeScales.length +
                chart.slides.reduce((sum, slide) => sum + slide.length, 0)
            })`,
            text,
            data: {
                lane: data.lane,
                beat: data.beat,
                chart,
            },
        }
    } catch {
        return {
            name: `${Math.random()}`,
            text,
        }
    }
}
