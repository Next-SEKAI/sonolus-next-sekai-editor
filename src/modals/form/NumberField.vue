<script setup lang="ts">
import { useTemplateRef, type Ref } from 'vue'
import BaseField from './BaseField.vue'

defineProps<{
    label: string
    min?: number
    max?: number
    step?: number | 'any'
}>()

const input: Ref<HTMLInputElement | null> = useTemplateRef('input')

const modelValue = defineModel<number>({
    required: true,
    set: (value) => (input.value?.reportValidity() ? value : modelValue.value),
})

const onFocus = (event: FocusEvent) => {
    ;(event.currentTarget as HTMLInputElement | null)?.select()
}
</script>

<template>
    <BaseField :label>
        <input
            ref="input"
            v-model.lazy="modelValue"
            class="w-full appearance-none rounded-full bg-button px-4 py-1 shadow-md transition-colors hover:shadow-accent active:bg-accent active:text-button"
            type="number"
            :min
            :max
            :step
            required
            @focus="onFocus"
        />
    </BaseField>
</template>
