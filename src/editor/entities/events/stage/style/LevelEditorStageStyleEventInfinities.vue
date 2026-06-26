<script setup lang="ts">
import { computed } from 'vue'
import { store } from '../../../../../history/store.ts'
import { settings } from '../../../../../settings.ts'
import { view } from '../../../../view.ts'
import LevelEditorStageStyleEventInfinity from './LevelEditorStageStyleEventInfinity.vue'

const isEventVisible = computed(() => view.visibilities.stageStyleEventConnection)

const ranges = computed(() =>
    [...store.value.stageEventRanges.stageStyleEventJoint].map(([id, range]) => ({
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
        <LevelEditorStageStyleEventInfinity
            v-if="isVisible || settings.showOtherStages"
            :range
            :opacity="isVisible ? 1 : 0.25"
        />
    </template>
</template>
