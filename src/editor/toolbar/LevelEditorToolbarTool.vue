<script setup lang="ts">
import { commands, type CommandName } from '../commands'

defineProps<{
    name: CommandName
}>()
</script>

<template>
    <button
        class="size-8 rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
        :title="commands[name].title()"
    >
        <component
            :is="commands[name].icon.is"
            class="size-full"
            v-bind="commands[name].icon.props"
        />
    </button>
</template>
