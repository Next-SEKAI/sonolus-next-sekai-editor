<script setup lang="ts">
import { computed } from 'vue'
import { store } from '../../../../../history/store'
import { settings } from '../../../../../settings'
import { view } from '../../../../view'
import LevelEditorStagePivotEventInfinity from './LevelEditorStagePivotEventInfinity.vue'

const ranges = computed(() =>
    [...store.value.stageEventRanges.stagePivotEventJoint].map(([id, range]) => ({
        id,
        range,
        isVisible: view.stageId === undefined || range.min.stageId === view.stageId,
    })),
)
</script>

<template>
    <template v-for="{ id, range, isVisible } in ranges" :key="id">
        <LevelEditorStagePivotEventInfinity
            v-if="isVisible || settings.showOtherStages"
            :range
            :opacity="isVisible ? 1 : 0.25"
        />
    </template>
</template>
