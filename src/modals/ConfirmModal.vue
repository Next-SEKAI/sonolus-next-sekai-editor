<script setup lang="ts">
import { i18n } from '../i18n'
import BaseModal from './BaseModal.vue'

defineProps<{
    title: () => string
    message: () => string
}>()

defineEmits<{
    close: [result: boolean]
}>()
</script>

<template>
    <BaseModal :title="title()" @close="$emit('close', false)">
        <div>{{ message() }}</div>

        <div class="flex justify-end gap-2">
            <button
                class="w-32 rounded-full bg-accent px-4 py-1 shadow-md transition-colors hover:shadow-accent active:bg-button active:text-accent"
                @click="$emit('close', true)"
            >
                {{ i18n.modals.confirm.confirm }}
            </button>
            <button
                class="w-32 rounded-full bg-button px-4 py-1 shadow-md transition-colors hover:shadow-accent active:bg-accent active:text-button"
                @click="$emit('close', false)"
            >
                {{ i18n.modals.confirm.cancel }}
            </button>
        </div>
    </BaseModal>
</template>
