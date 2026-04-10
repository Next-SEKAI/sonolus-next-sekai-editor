<script setup lang="ts">
import { commands, type CommandName } from '../commands'

defineProps<{
    name: CommandName
    showLabel?: boolean
}>()
</script>

<template>
    <button
        class="flex items-center gap-2 rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
        :title="commands[name].title()"
    >
        <component :is="commands[name].icon.is" class="size-4" v-bind="commands[name].icon.props" />
        <span v-if="showLabel" class="text-sm">{{ commands[name].title() }}</span>
    </button>
</template>
