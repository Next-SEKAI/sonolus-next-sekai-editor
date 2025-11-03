import { computed, ref, shallowReactive } from 'vue'
import type { Chart } from '../chart'
import { i18n } from '../i18n'
import { showModal } from '../modals'
import ConfirmModal from '../modals/ConfirmModal.vue'
import { createState, type State } from '../state'
import { cleanupWaveform } from '../waveform'

const defaultChart: Chart = {
    bpms: [
        {
            beat: 0,
            bpm: 60,
        },
    ],
    groupCount: 2,
    timeScales: [],
    slides: [],
}

const index = ref(0)

export const isStateDirty = computed(() => index.value > 0)

const states = shallowReactive([
    {
        name: () => i18n.value.history.initialize,
        state: createState(defaultChart, 0),
    },
])

addEventListener('beforeunload', (event) => {
    if (isStateDirty.value) event.preventDefault()
})

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const current = computed(() => states[index.value]!)

export const state = computed(() => current.value.state)

export const replaceState = (state: State) => {
    states[index.value] = {
        name: current.value.name,
        state,
    }
}

export const pushState = (name: () => string, state: State) => {
    states.splice(index.value + 1, states.length - index.value - 1, {
        name,
        state,
    })
    index.value++
}

export const undoState = () => {
    if (!isStateDirty.value) return

    const name = current.value.name
    index.value--
    return name
}

export const redoState = () => {
    if (index.value >= states.length - 1) return

    index.value++
    return current.value.name
}

export const checkState = async () => {
    if (!isStateDirty.value) return true

    return await showModal(ConfirmModal, {
        title: () => i18n.value.history.changes.title,
        message: () => i18n.value.history.changes.message,
    })
}

export const resetState = (chart?: Chart, offset?: number, filename?: string) => {
    index.value = 0
    states.splice(0, states.length, {
        name: () => i18n.value.history.initialize,
        state: createState(chart ?? defaultChart, offset ?? 0, filename),
    })

    cleanupWaveform()
}
