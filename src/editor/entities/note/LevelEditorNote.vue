<script setup lang="ts">
import { computed } from 'vue'
import { noteComponents } from '.'
import { bpms } from '../../../history/bpms'
import { store } from '../../../history/store'
import type { NoteEntity } from '../../../state/entities/slides/note'
import { beatToTime } from '../../../state/integrals/bpms'
import { ups } from '../../view'

const props = defineProps<{
    entity: NoteEntity
    isHighlighted: boolean
}>()

const time = computed(() => beatToTime(bpms.value, props.entity.beat))

const infos = computed(() => store.value.slides.info.get(props.entity.slideId))

const type = computed(() => {
    const { entity } = props

    if (entity.noteType === 'anchor') return 'anchor'

    if (entity.noteType === 'damage') return 'damage'

    if (entity.noteType === 'trace') return 'trace'

    if (entity.noteType === 'forceTick') return 'tick'

    if (!infos.value) return 'single'

    const infoEntity = entity.useInfoOf ?? entity
    const info = infos.value.find((info) => info.note === infoEntity)
    if (info) {
        if (info.activeHead === info.activeTail) return 'single'

        if (info.activeHead === infoEntity) return 'head'

        if (info.activeTail === infoEntity) return 'tail'

        if (infoEntity.noteType === 'default') return 'tick'

        return 'single'
    }

    if (!infos.value.length) return 'single'

    let isActive = false
    let i = 0
    for (; i < infos.value.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { note } = infos.value[i]!

        if (entity.beat < note.beat) break

        if (i === 0 || note.isConnectorSeparator) {
            isActive = note.connectorType === 'active'
        }
    }

    if (isActive) {
        if (!infos.value[i]) return 'tail'

        if (entity.isConnectorSeparator && entity.connectorType === 'guide') return 'tail'

        return 'tick'
    } else if (!infos.value[i - 1]) {
        if (entity.connectorType === 'guide') return 'single'

        return 'head'
    } else {
        if (!infos.value[i]) return 'single'

        if (entity.isConnectorSeparator && entity.connectorType === 'active') return 'head'

        return 'single'
    }
})
</script>

<template>
    <g :transform="`translate(${entity.left}, ${time * ups - 0.4})`">
        <component :is="noteComponents[type]" :entity :is-highlighted="isHighlighted" />
        <text
            v-if="entity.group"
            :x="entity.size / 2"
            y="0.4"
            font-size="0.4"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="#0aa"
        >
            #{{ entity.group }}
        </text>
    </g>
</template>
