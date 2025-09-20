<script setup lang="ts">
import { useTemplateRef, watch, type Ref } from 'vue'
import { useAutoSave } from '../history'
import { time } from '../time'
import { controlListeners } from './controls'
import { useFocusControl } from './controls/focus'
import { useKeyboardControl } from './controls/keyboard'
import LevelEditorCreatingEntities from './entities/LevelEditorCreatingEntities.vue'
import LevelEditorEntities from './entities/LevelEditorEntities.vue'
import LevelEditorCursor from './LevelEditorCursor.vue'
import LevelEditorGrid from './LevelEditorGrid.vue'
import LevelEditorHover from './LevelEditorHover.vue'
import LevelEditorHoveredEntities from './LevelEditorHoveredEntities.vue'
import LevelEditorHoverMarkers from './LevelEditorHoverMarkers.vue'
import LevelEditorNotification from './LevelEditorNotification.vue'
import LevelEditorRangeMarkers from './LevelEditorRangeMarkers.vue'
import LevelEditorSelectedEntities from './LevelEditorSelectedEntities.vue'
import LevelEditorSelection from './LevelEditorSelection.vue'
import LevelEditorWaveform from './LevelEditorWaveform.vue'
import LevelEditorToolbar from './toolbar/LevelEditorToolbar.vue'
import { view, viewBox } from './view'

useFocusControl()
useKeyboardControl()

useAutoSave()

const container: Ref<HTMLDivElement | null> = useTemplateRef('container')

watch(time, () => {
    if (!container.value) return

    const rect = container.value.getBoundingClientRect()
    view.x = rect.x
    view.y = rect.y
    view.w = rect.width
    view.h = rect.height
})
</script>

<template>
    <div
        ref="container"
        class="relative size-full select-none overflow-hidden"
        tabindex="-1"
        @pointerdown="container?.focus()"
    >
        <template v-if="view.w && view.h">
            <LevelEditorRangeMarkers />
            <LevelEditorHoverMarkers />

            <LevelEditorNotification />

            <svg
                class="editor absolute size-full"
                :viewBox="`${viewBox.l} ${viewBox.t} ${viewBox.w} ${viewBox.h}`"
                font-size="0.5"
                stroke="none"
                stroke-width="2"
                fill="none"
                v-on="controlListeners"
            >
                <animate
                    attributeName="stroke-dashoffset"
                    from="10"
                    to="0"
                    dur="1s"
                    repeatCount="indefinite"
                />

                <LevelEditorWaveform />
                <LevelEditorGrid />
                <LevelEditorCursor />
                <LevelEditorEntities />
                <LevelEditorCreatingEntities />
                <LevelEditorHoveredEntities />
                <LevelEditorSelectedEntities />
                <LevelEditorSelection />
                <LevelEditorHover />
            </svg>
        </template>

        <LevelEditorToolbar />
    </div>
</template>

<style scoped>
.editor :deep(circle),
.editor :deep(line),
.editor :deep(path),
.editor :deep(polygon),
.editor :deep(rect) {
    vector-effect: non-scaling-stroke;
}

.editor :deep(.scale-stroke) {
    vector-effect: none;
}
</style>
