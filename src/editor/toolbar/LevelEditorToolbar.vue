<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { settings } from '../../settings'
import { commands, type CommandName } from '../commands'
import { isDragging } from '../controls/gestures/recognizers/drag'
import LevelEditorToolbarTool from './LevelEditorToolbarTool.vue'

const toolbar = computed<CommandName[][]>(() => [...settings.toolbar, ['settings', 'help']])

const activeNames = ref<CommandName[]>([])

watch(
    toolbar,
    (toolbar) => {
        activeNames.value = toolbar.map((commands) => commands[commands.length - 1] ?? 'select')
    },
    { immediate: true },
)

const activeIndex = ref(-1)

const onOverMain = (event: PointerEvent, index: number) => {
    if (event.pointerType !== 'mouse') return

    activeIndex.value = index
}

const onClickMain = (index: number, name: CommandName) => {
    if (activeIndex.value === -1 && toolbar.value[index] && toolbar.value[index].length > 1) {
        activeIndex.value = index
        return
    }

    void commands[name].execute()

    activeIndex.value = -1
}

const onClickSub = (index: number, name: CommandName) => {
    void commands[name].execute()

    activeIndex.value = -1
    activeNames.value[index] = name
}

const onOverBackdrop = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return

    activeIndex.value = -1
}
</script>

<template>
    <div
        v-show="!isDragging"
        class="pointer-events-none absolute flex size-full flex-wrap content-end justify-center p-4"
    >
        <div
            v-for="(activeName, i) in activeNames"
            :key="i"
            class="pointer-events-auto relative"
            :class="{ 'z-20': activeIndex === i }"
            :inert="activeIndex !== -1 && activeIndex !== i"
        >
            <LevelEditorToolbarTool
                :name="activeName"
                @pointerover="onOverMain($event, i)"
                @click="onClickMain(i, activeName)"
            />

            <div v-if="activeIndex === i" class="absolute top-0 -translate-y-full">
                <LevelEditorToolbarTool
                    v-for="(name, j) in toolbar[i]"
                    :key="j"
                    :name
                    @click="onClickSub(i, name)"
                />
            </div>
        </div>
    </div>

    <div
        v-if="activeIndex !== -1"
        class="absolute size-full bg-bg/75"
        @pointerover="onOverBackdrop"
        @click="activeIndex = -1"
    />
</template>
