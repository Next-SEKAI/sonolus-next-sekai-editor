<script setup lang="ts">
import { i18n } from '../../i18n'
import BaseModal from '../BaseModal.vue'

defineProps<{
    title: string
}>()

defineEmits<{
    submit: []
    close: []
}>()
</script>

<template>
    <BaseModal :title @close="$emit('close')">
        <form @submit.prevent="$emit('submit')">
            <div class="flex flex-col gap-2">
                <slot />
            </div>

            <div class="mt-4 flex justify-end">
                <input
                    class="w-32 rounded-full bg-accent px-4 py-1 shadow-md transition-colors hover:shadow-accent active:bg-button active:text-accent"
                    type="submit"
                    :value="i18n.modals.form.confirm"
                />
            </div>
        </form>
    </BaseModal>
</template>
