<script setup lang="ts">
defineProps<{
    title: string
}>()
</script>

<template>
    <div>
        <div class="bg-header p-4 font-bold">
            {{ title }}
        </div>

        <div class="flex flex-col gap-2 overflow-y-auto p-4">
            <slot />
        </div>
    </div>
</template>
