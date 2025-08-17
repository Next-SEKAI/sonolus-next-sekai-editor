<script setup lang="ts">
import DefaultSidebar from './sidebars/default/DefaultSidebar.vue'
import { tool } from './tools'
</script>

<template>
    <div class="flex h-full flex-col overflow-y-auto">
        <DefaultSidebar class="flex-grow" />
        <component :is="tool.sidebar" class="flex-grow" />
    </div>
</template>
