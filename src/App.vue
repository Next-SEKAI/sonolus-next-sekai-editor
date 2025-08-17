<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import LevelEditor from './editor/LevelEditor.vue'
import LevelEditorSidebar from './editor/LevelEditorSidebar.vue'
import { currentSidebar } from './editor/sidebars'
import ModalManager from './modals/ModalManager.vue'
import LevelPreview from './preview/LevelPreview.vue'
import { screenSm, screenWidth } from './screen'
import { settings } from './settings'

watch(
    () => settings.locale,
    () => {
        document.documentElement.lang = settings.locale
    },
    { immediate: true },
)

const sidebar = useTemplateRef('sidebar')
watch(sidebar, () => {
    currentSidebar.value = sidebar.value
})

const previewPosition = computed(() =>
    settings.previewPosition !== 'auto'
        ? settings.previewPosition
        : screenSm.value
          ? 'left'
          : 'top',
)

type Panel = 'preview' | 'sidebar'

const isDragging = ref<Panel>()
const wasDragging = ref(false)

const onStartDragging = (panel: Panel) => {
    isDragging.value = panel
    wasDragging.value = false
}

const onDrag = (event: PointerEvent) => {
    if (!isDragging.value) return
    wasDragging.value = true

    switch (isDragging.value) {
        case 'preview':
            settings.showPreview = true
            if (previewPosition.value === 'left') {
                settings.previewWidth = event.clientX
            } else {
                settings.previewHeight = event.clientY
            }
            break
        case 'sidebar':
            settings.showSidebar = true
            settings.sidebarWidth = screenWidth.value - event.clientX
            break
    }
}

const onStopDragging = () => {
    isDragging.value = undefined
}

const onToggle = (panel: Panel) => {
    if (wasDragging.value) return

    switch (panel) {
        case 'preview':
            settings.showPreview = !settings.showPreview
            break
        case 'sidebar':
            settings.showSidebar = !settings.showSidebar
            break
    }
}

const onFocus = (event: FocusEvent) => {
    ;(event.currentTarget as HTMLElement | null)?.blur()
}
</script>

<template>
    <div
        class="flex h-screen w-screen overflow-hidden"
        @pointermove="onDrag"
        @pointerup="onStopDragging"
    >
        <div
            class="flex flex-grow overflow-hidden"
            :class="previewPosition === 'left' ? 'flex-row' : 'flex-col'"
        >
            <div
                class="relative z-10 bg-[#5b5c7c]"
                :class="
                    previewPosition === 'left'
                        ? { 'min-w-[20%] max-w-[40%]': settings.showPreview }
                        : { 'max-h-[40%] min-h-[20%]': settings.showPreview }
                "
                :style="
                    previewPosition === 'left'
                        ? { width: (settings.showPreview ? settings.previewWidth : 0) + 'px' }
                        : { height: (settings.showPreview ? settings.previewHeight : 0) + 'px' }
                "
            >
                <LevelPreview v-if="settings.showPreview" />

                <button
                    class="absolute flex items-center justify-center bg-button shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button"
                    :class="
                        previewPosition === 'left'
                            ? 'left-full top-1/2 h-16 w-4 -translate-y-1/2 cursor-col-resize rounded-r-full'
                            : 'left-1/2 top-full h-4 w-16 -translate-x-1/2 cursor-row-resize rounded-b-full'
                    "
                    @click="onToggle('preview')"
                    @pointerdown="onStartDragging('preview')"
                    @focus="onFocus"
                >
                    <svg
                        v-if="previewPosition === 'left'"
                        class="size-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 192 512"
                    >
                        <!--! Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                        <path
                            d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64L0 448c0 17.7 14.3 32 32 32s32-14.3 32-32L64 64zm128 0c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 384c0 17.7 14.3 32 32 32s32-14.3 32-32l0-384z"
                        />
                    </svg>
                    <svg
                        v-else
                        class="size-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                    >
                        <!--! Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                        <path
                            d="M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z"
                        />
                    </svg>
                </button>
            </div>

            <div class="flex-grow">
                <LevelEditor />
            </div>
        </div>

        <div
            v-if="screenSm"
            ref="sidebar"
            class="relative z-10 bg-modal"
            :class="{ 'min-w-[20%] max-w-[40%]': settings.showSidebar }"
            :style="{ width: (settings.showSidebar ? settings.sidebarWidth : 0) + 'px' }"
        >
            <LevelEditorSidebar v-if="settings.showSidebar" />

            <button
                class="absolute -left-4 top-1/2 flex h-16 w-4 -translate-y-1/2 cursor-col-resize items-center justify-center rounded-l-full bg-button shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button"
                @click="onToggle('sidebar')"
                @pointerdown="onStartDragging('sidebar')"
                @focus="onFocus"
            >
                <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
                    <!--! Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64L0 448c0 17.7 14.3 32 32 32s32-14.3 32-32L64 64zm128 0c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 384c0 17.7 14.3 32 32 32s32-14.3 32-32l0-384z"
                    />
                </svg>
            </button>
        </div>
    </div>

    <ModalManager />
</template>
