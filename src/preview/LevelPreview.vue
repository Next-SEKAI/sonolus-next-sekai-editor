<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { view } from '../editor/view'
import { state } from '../history'
import { isPlaying } from '../player'
import { buildPreviewChart } from './engine/chart'
import { TARGET_ASPECT_RATIO } from './engine/layout'
import { renderPreviewFrame } from './engine/render'
import { createPreviewRenderer, type PreviewRenderer } from './gl'
import { loadParticleFromScp, type LoadedParticle } from './particle'
import { loadSkinFromScp, type LoadedSkin } from './skin'

const container = useTemplateRef('container')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

const noteSpeed = ref(6)

const renderScale = ref(1)

const showEffects = ref(true)

const antialias = ref(true)
const lockAspectRatio = ref(true)

const skin = shallowRef<LoadedSkin>()
const particle = shallowRef<LoadedParticle>()
const status = ref<'loading' | 'missing' | 'error' | 'ready'>('loading')

const chart = computed(() => buildPreviewChart(state.value, noteSpeed.value))

let renderer: PreviewRenderer | undefined

const fetchScp = async (name: string) => {
    const response = await fetch(`${import.meta.env.BASE_URL}resource/${name}`, {
        cache: 'no-store',
    })
    if (!response.ok) return

    return await response.arrayBuffer()
}

const loadSkin = async () => {
    status.value = 'loading'
    skin.value = undefined
    particle.value = undefined

    try {
        const skinBuffer = await fetchScp('skin.scp')
        if (!skinBuffer) {
            status.value = 'missing'
            return
        }

        skin.value = await loadSkinFromScp(skinBuffer)
        status.value = 'ready'
    } catch (error) {
        console.error('Failed to load preview skin:', error)
        status.value = 'missing'
        return
    }

    try {
        const particleBuffer = await fetchScp('particle.scp')
        if (particleBuffer) {
            particle.value = await loadParticleFromScp(particleBuffer)
        }
    } catch (error) {
        console.error('Failed to load preview particle:', error)
    }

    uploadTextures()
}

const uploadTextures = () => {
    if (!renderer) return

    if (skin.value) renderer.setTexture(0, skin.value.texture, skin.value.interpolation)
    if (particle.value) renderer.setTexture(1, particle.value.texture, particle.value.interpolation)
}

let rendererCanvas: HTMLCanvasElement | undefined

watch([skin, canvas], () => {
    if (!canvas.value || !skin.value) return

    if (!renderer || rendererCanvas !== canvas.value || renderer.isContextLost()) {
        renderer?.dispose()
        try {
            renderer = createPreviewRenderer(canvas.value, antialias.value)
            rendererCanvas = canvas.value
        } catch (error) {
            console.error('Failed to create preview renderer:', error)
            status.value = 'error'
            return
        }
    }

    uploadTextures()
})

const canvasWidth = ref(0)
const canvasHeight = ref(0)
const canvasLeft = ref(0)
const canvasTop = ref(0)

let containerWidth = 0
let containerHeight = 0

const canvasStyle = computed(() => ({
    left: `${canvasLeft.value}px`,
    top: `${canvasTop.value}px`,
    width: `${canvasWidth.value}px`,
    height: `${canvasHeight.value}px`,
}))

const MIN_ASPECT_RATIO = 4 / 3

const updateCanvasSize = () => {
    if (!containerWidth || !containerHeight) return

    const containerAspectRatio = containerWidth / containerHeight
    const aspectRatio = lockAspectRatio.value
        ? TARGET_ASPECT_RATIO
        : Math.max(MIN_ASPECT_RATIO, containerAspectRatio)

    const width = Math.min(containerWidth, containerHeight * aspectRatio)
    const height = width / aspectRatio
    const pixelRatio = devicePixelRatio || 1

    canvasWidth.value = Math.round(width * pixelRatio) / pixelRatio
    canvasHeight.value = Math.round(height * pixelRatio) / pixelRatio
    canvasLeft.value =
        Math.round(((containerWidth - canvasWidth.value) / 2) * pixelRatio) / pixelRatio
    canvasTop.value =
        Math.round(((containerHeight - canvasHeight.value) / 2) * pixelRatio) / pixelRatio
}

watch(lockAspectRatio, updateCanvasSize)

const resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry) return

    containerWidth = entry.contentRect.width
    containerHeight = entry.contentRect.height
    updateCanvasSize()
})

const onSpeedChange = (event: Event) => {
    const input = event.target as HTMLInputElement

    const value = Number.parseFloat(input.value)
    if (Number.isFinite(value)) {
        noteSpeed.value = Math.min(12, Math.max(1, Math.round(value * 100) / 100))
    }

    input.value = noteSpeed.value.toString()
}

const onScaleChange = (event: Event) => {
    const input = event.target as HTMLInputElement

    const value = Number.parseFloat(input.value)
    if (Number.isFinite(value)) {
        renderScale.value = Math.min(2, Math.max(0.25, Math.round(value * 4) / 4))
    }

    input.value = renderScale.value.toString()
}

const blurInput = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement
    input.blur()
}

const onSpeedKeydown = (event: KeyboardEvent) => {
    event.stopPropagation()

    if (event.key === 'Enter') (event.currentTarget as HTMLInputElement).blur()
}

let rafId = 0

const getRenderSize = (requestedScale: number) => {
    if (!renderer) return

    const requestedWidth = canvasWidth.value * requestedScale
    const requestedHeight = canvasHeight.value * requestedScale
    const { width: maxWidth, height: maxHeight } = renderer.maxViewportSize
    const fit = Math.min(1, maxWidth / requestedWidth, maxHeight / requestedHeight)

    return {
        width: Math.max(1, Math.round(requestedWidth * fit)),
        height: Math.max(1, Math.round(requestedHeight * fit)),
    }
}

const onFrame = () => {
    rafId = requestAnimationFrame(onFrame)

    if (!renderer || !skin.value || !canvasWidth.value || !canvasHeight.value) return

    const scale = (devicePixelRatio || 1) * renderScale.value
    const renderSize = getRenderSize(scale)
    if (!renderSize) return

    renderPreviewFrame(
        renderer,
        skin.value.skin,
        chart.value,
        view.cursorTime,
        renderSize.width,
        renderSize.height,
        canvasWidth.value,
        canvasHeight.value,
        noteSpeed.value,
        showEffects.value,
        particle.value?.particle,
    )
}

onMounted(() => {
    if (container.value) resizeObserver.observe(container.value)

    void loadSkin()

    rafId = requestAnimationFrame(onFrame)
})

onUnmounted(() => {
    resizeObserver.disconnect()
    cancelAnimationFrame(rafId)
    renderer?.dispose()
})
</script>

<template>
    <div ref="container" class="preview relative h-full w-full overflow-hidden">
        <div class="preview-viewport absolute overflow-hidden" :style="canvasStyle">
            <canvas
                ref="canvas"
                :key="antialias ? 'aa' : 'no-aa'"
                class="absolute inset-0 h-full w-full"
            />

            <div
                v-if="status !== 'ready'"
                class="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-sm text-white/75"
            >
                <template v-if="status === 'loading'">Loading skin...</template>
                <template v-else>
                    <p>
                        Put a skin package at
                        <span class="font-bold">public/resource/skin.scp</span> to enable the
                        preview.
                    </p>
                    <p class="text-xs text-white/50">
                        Optionally add
                        <span class="font-bold">public/resource/particle.scp</span> for hit effects.
                    </p>
                    <button
                        class="rounded bg-button px-3 py-1 text-fg transition-colors hover:shadow-accent active:bg-accent active:text-button"
                        @click="loadSkin"
                    >
                        Reload
                    </button>
                </template>
            </div>

            <div
                v-else-if="!isPlaying"
                class="absolute right-1 top-1 flex flex-col items-end gap-1 rounded bg-black/40 px-2 py-1 text-xs text-white/75"
            >
                <div class="flex items-center gap-2">
                    <span>Speed</span>
                    <input v-model.number="noteSpeed" type="range" min="1" max="12" step="0.05" />
                    <input
                        class="number-input w-10 rounded bg-black/30 px-1 text-right"
                        type="number"
                        min="1"
                        max="12"
                        step="0.01"
                        :value="noteSpeed"
                        @change="onSpeedChange"
                        @keydown="onSpeedKeydown"
                    />
                </div>
                <div class="flex items-center gap-2">
                    <span>Quality</span>
                    <input
                        v-model.number="renderScale"
                        type="range"
                        min="0.25"
                        max="2"
                        step="0.25"
                    />
                    <input
                        class="number-input w-10 rounded bg-black/30 px-1 text-right"
                        type="number"
                        min="0.25"
                        max="2"
                        step="0.25"
                        :value="renderScale"
                        @change="onScaleChange"
                        @keydown="onSpeedKeydown"
                    />
                </div>
                <label class="flex cursor-pointer items-center gap-2">
                    <span>Lock 16:9</span>
                    <input v-model="lockAspectRatio" type="checkbox" @change="blurInput" />
                </label>
                <label class="flex cursor-pointer items-center gap-2">
                    <span>Effects</span>
                    <input v-model="showEffects" type="checkbox" @change="blurInput" />
                </label>
                <label class="flex cursor-pointer items-center gap-2">
                    <span>Antialias</span>
                    <input v-model="antialias" type="checkbox" @change="blurInput" />
                </label>
            </div>
        </div>
    </div>
</template>

<style scoped>
.preview-viewport {
    background: url('./bg.png') center / cover no-repeat;
}

.number-input {
    appearance: textfield;
}

.number-input::-webkit-outer-spin-button,
.number-input::-webkit-inner-spin-button {
    margin: 0;
    appearance: none;
}
</style>
