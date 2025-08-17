<script setup lang="ts">
import { i18n } from '../../../i18n'
import BaseModal from '../../../modals/BaseModal.vue'
import { commands, type CommandName } from '../../commands'
import LevelEditorToolbarTool from '../../toolbar/LevelEditorToolbarTool.vue'

defineEmits<{
    close: [tool?: CommandName]
}>()
</script>

<template>
    <BaseModal :title="i18n.settings.toolbar.modal.title" @close="$emit('close')">
        <div class="flex flex-wrap justify-center gap-1">
            <LevelEditorToolbarTool
                v-for="(_, name) in commands"
                :key="name"
                :name
                @click="$emit('close', name)"
            />
        </div>
    </BaseModal>
</template>
