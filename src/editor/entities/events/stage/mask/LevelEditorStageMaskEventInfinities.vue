<script setup lang="ts">
import { computed } from 'vue'
import { store } from '../../../../../history/store'
import { settings } from '../../../../../settings'
import { view } from '../../../../view'
import LevelEditorStageMaskEventInfinity from './LevelEditorStageMaskEventInfinity.vue'

const isEventVisible = computed(() => view.visibilities.stageMaskEventConnection)

const ranges = computed(() =>
    [...store.value.stageEventRanges.stageMaskEventJoint].map(([id, range]) => ({
        id,
        range,
        isVisible:
            isEventVisible.value &&
            (view.stageId === undefined || range.min.stageId === view.stageId),
    })),
)
</script>

<template>
    <template v-for="{ id, range, isVisible } in ranges" :key="id">
        <LevelEditorStageMaskEventInfinity
            v-if="isVisible || settings.showOtherStages"
            :id
            :range
            :opacity="isVisible ? 1 : 0.25"
        />
    </template>
</template>
