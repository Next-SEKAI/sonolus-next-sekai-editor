<script setup lang="ts">
import { computed, useTemplateRef, watch, type Ref } from 'vue'
import { useAutoSave } from '../history/autoSave'
import { groups } from '../history/groups'
import { i18n } from '../i18n'
import { time } from '../time'
import { interpolate } from '../utils/interpolate'
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
import { tool } from './tools'
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

watch([groups, view], () => {
    if (!view.groupId) return
    if (groups.value.has(view.groupId)) return

    view.groupId = undefined
})

const group = computed(() =>
    view.groupId === undefined
        ? () => i18n.value.statusBar.group.all
        : interpolate(
              () => i18n.value.statusBar.group.one,
              groups.value.get(view.groupId)?.name ?? '',
          ),
)
</script>

<template>
    <div class="flex flex-col">
        <div
            ref="container"
            class="relative flex-grow select-none overflow-hidden"
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
        <div class="z-10 flex gap-4 bg-preview px-2 py-1 text-xs text-white/50">
            <span class="flex-grow">{{ tool.title() }}</span>
            <span>{{ group() }}</span>
            <span>1/{{ view.division }}</span>
        </div>
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
