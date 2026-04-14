<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { times } from '.'
import { bgm } from '../history/bgm'
import { settings } from '../settings'
import { computedRange } from '../utils/range'
import { waveformDuration } from '../waveform'
import { bgmOffsetDelta } from './tools/offset'
import { ups } from './view'

const bgmOffset = computed(() => bgm.value.offset + bgmOffsetDelta.value)

const indexes = computedRange(() => ({
    min: Math.floor((times.value.min + bgmOffset.value) / waveformDuration),
    max: Math.floor((times.value.max + bgmOffset.value) / waveformDuration),
}))

const images = computed(() => {
    if (settings.waveform === 'off') return

    const waveform = bgm.value.waveform
    if (!waveform) return

    const images: {
        href: string
        y: number
        style: CSSProperties
    }[] = []

    for (let index = indexes.value.min; index <= indexes.value.max; index++) {
        const href = waveform.images[index]
        if (!href) continue

        images.push({
            href,
            y: -index - 1,
            style: waveform.style,
        })
    }

    return images
})
</script>

<template>
    <g
        opacity="0.25"
        :transform="`translate(0, ${bgmOffset * -ups}) scale(4, ${waveformDuration * -ups})`"
    >
        <template v-for="{ href, y, style } in images" :key="href">
            <image :href :y width="1" height="1" preserveAspectRatio="none" :style />
            <image
                :href
                :y
                width="1"
                height="1"
                preserveAspectRatio="none"
                transform="scale(-1, 1)"
                :style
            />
        </template>
    </g>
</template>
