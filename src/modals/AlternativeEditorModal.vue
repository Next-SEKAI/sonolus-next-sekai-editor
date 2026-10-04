<script setup lang="ts">
import { i18n } from '../i18n'
import BaseModal from './BaseModal.vue'

defineEmits<{
    close: []
}>()
</script>

<template>
    <BaseModal :title="i18n.modals.alternativeEditor.title" @close="$emit('close')">
        <div>
            <p>{{ i18n.modals.alternativeEditor.message }}</p>
            <a
                class="mt-2 block cursor-pointer underline"
                href="https://next-sekai-editor-test.qwewqa.xyz"
                target="_blank"
            >
                https://next-sekai-editor-test.qwewqa.xyz
            </a>
        </div>

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
