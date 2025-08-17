<script setup lang="ts" generic="const T">
import BaseField from './BaseField.vue'

defineProps<{
    label: string
    options: [string, NoInfer<T>][]
}>()

const modelValue = defineModel<T>({ required: true })
</script>

<template>
    <BaseField :label>
        <select
            v-model.lazy="modelValue"
            class="w-full appearance-none rounded-full bg-button px-4 py-1 shadow-md transition-colors hover:shadow-accent active:bg-accent active:text-button"
            required
        >
            <option v-for="([name, value], index) in options" :key="index" :value>
                {{ name }}
            </option>
        </select>
    </BaseField>
</template>
