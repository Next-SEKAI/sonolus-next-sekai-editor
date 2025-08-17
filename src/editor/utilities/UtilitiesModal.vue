<script setup lang="ts">
import { i18n } from '../../i18n'
import { showModal } from '../../modals'
import BaseModal from '../../modals/BaseModal.vue'
import CoverEditorModal from './coverEditor/CoverEditorModal.vue'
import PreviewEditorModal from './previewEditor/PreviewEditorModal.vue'

const utilities = {
    coverEditor: CoverEditorModal,
    previewEditor: PreviewEditorModal,
}
</script>

<template>
    <BaseModal :title="i18n.utilities.title">
        <div class="flex flex-col gap-2">
            <button
                v-for="(modal, name) in utilities"
                :key="name"
                class="rounded-full bg-button px-4 py-1 shadow-md transition-colors hover:shadow-accent active:bg-accent active:text-button"
                @click="showModal(modal, {})"
            >
                {{ i18n.utilities[name].title }}
            </button>
        </div>
    </BaseModal>
</template>
