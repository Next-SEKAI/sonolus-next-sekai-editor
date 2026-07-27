<script setup lang="ts">
defineProps<{
    label: string
}>()
</script>

<template>
    <label class="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <div class="sm:flex sm:min-h-8 sm:w-[48rem] sm:max-w-[60%] sm:items-center">
            {{ label }}
        </div>
        <slot />
    </label>
</template>
