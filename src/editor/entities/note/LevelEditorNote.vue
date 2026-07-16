<script setup lang="ts">
import { computed } from 'vue'
import { noteComponents } from '.'
import { bpms } from '../../../history/bpms'
import { isDynamicStages } from '../../../history/dynamicStages'
import { defaultGroupId, groups } from '../../../history/groups'
import { stages } from '../../../history/stages'
import { store } from '../../../history/store'
import { settings } from '../../../settings'
import type { NoteEntity } from '../../../state/entities/slides/note'
import { beatToTime } from '../../../state/integrals/bpms'
import { isViewRecentlyActive, ups } from '../../view'

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

        if (entity.isConnectorSeparator && entity.connectorType !== 'active') return 'tail'

        return 'tick'
    } else if (!infos.value[i - 1]) {
        if (entity.connectorType !== 'active') return 'single'

        return 'head'
    } else {
        if (!infos.value[i]) return 'single'

        if (entity.isConnectorSeparator && entity.connectorType === 'active') return 'head'

        return 'single'
    }
})

const stage = computed(
    () =>
        settings.showStageName &&
        isDynamicStages.value &&
        (props.isHighlighted || isViewRecentlyActive.value) &&
        stages.value.get(props.entity.stageId)?.name,
)

const group = computed(
    () =>
        settings.showGroupName &&
        props.entity.groupId !== defaultGroupId.value &&
        (props.isHighlighted || isViewRecentlyActive.value) &&
        groups.value.get(props.entity.groupId)?.name,
)
</script>

<template>
    <g :transform="`translate(${entity.left}, ${time * ups - 0.3})`">
        <component :is="noteComponents[type]" :entity :is-highlighted="isHighlighted" />
        <text
            v-if="stage"
            :x="entity.size / 2"
            y="0.3"
            font-size="0.4"
            :text-anchor="group ? 'end' : 'middle'"
            dominant-baseline="middle"
            fill="#a0a"
        >
            {{ stage }}
        </text>
        <text
            v-if="group"
            :x="entity.size / 2"
            y="0.3"
            font-size="0.4"
            :text-anchor="stage ? 'start' : 'middle'"
            dominant-baseline="middle"
            fill="#0aa"
        >
            {{ group }}
        </text>
    </g>
</template>
