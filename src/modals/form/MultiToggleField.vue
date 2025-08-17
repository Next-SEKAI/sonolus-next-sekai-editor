<script setup lang="ts">
import { i18n } from '../../i18n'
import BaseField from './BaseField.vue'

defineProps<{
    label: string
    disabled?: string
    enabled?: string
}>()

const modelValue = defineModel<boolean | undefined>({ required: true })
</script>

<template>
    <BaseField :label>
        <input
            class="w-full rounded-full bg-button px-4 py-1 text-left shadow-md transition-colors hover:shadow-accent active:bg-accent active:text-button"
            type="button"
            :value="
                modelValue === undefined
                    ? ''
                    : modelValue
                      ? (enabled ?? i18n.modals.form.toggle.enabled)
                      : (disabled ?? i18n.modals.form.toggle.disabled)
            "
            @click="modelValue = !modelValue"
        />
    </BaseField>
</template>
