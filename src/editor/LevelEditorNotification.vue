<script setup lang="ts">
import { notification } from './notification'
</script>

<template>
    <div class="pointer-events-none absolute flex size-full items-center justify-center">
        <div
            v-if="notification"
            :key="notification.id"
            class="notification whitespace-break-spaces rounded-full px-6 py-2 text-center"
        >
            {{ notification.message() }}
        </div>
    </div>
</template>

<style scoped>
.notification {
    animation-name: fade;
    animation-duration: 1s;
    animation-fill-mode: forwards;
}

@keyframes fade {
    0% {
        z-index: 100;
        color: rgb(68 68 102);
        background-color: rgb(119 239 220);
    }

    99% {
        z-index: 100;
    }

    100% {
        color: rgb(255 255 255 / 0.25);
        background-color: rgb(119 239 220 / 0);
    }
}
</style>
