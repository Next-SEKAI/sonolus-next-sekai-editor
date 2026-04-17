<script setup lang="ts">
import { groups } from '../../history/groups'
import { i18n } from '../../i18n'
import type { GroupId } from '../../state/groups'
import MultiSelectField from './MultiSelectField.vue'

const modelValue = defineModel<GroupId | undefined>({ required: true })
</script>

<template>
    <MultiSelectField
        v-model="modelValue"
        :label="i18n.modals.form.group.label"
        :options="[...groups.entries()].map(([id, { name }]) => [name, id])"
    />
</template>
