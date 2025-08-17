<script setup lang="ts">
import { i18n } from '../i18n'
import BaseModal from './BaseModal.vue'

defineProps<{
    title: () => string
    message: () => string
}>()

defineEmits<{
    close: []
}>()
</script>

<template>
    <BaseModal :title="title()" @close="$emit('close')">
        <div>{{ message() }}</div>

        <div class="flex justify-end">
            <button
                class="w-32 rounded-full bg-accent px-4 py-1 shadow-md transition-colors hover:shadow-accent active:bg-button active:text-accent"
                @click="$emit('close')"
            >
                {{ i18n.modals.info.ok }}
            </button>
        </div>
    </BaseModal>
</template>
