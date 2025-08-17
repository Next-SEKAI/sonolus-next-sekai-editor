<script setup lang="ts">
defineProps<{
    title: string
}>()
</script>

<template>
    <section>
        <h2 class="mb-2 font-bold">{{ title }}</h2>

        <div class="flex flex-col gap-2">
            <slot />
        </div>
    </section>
</template>
