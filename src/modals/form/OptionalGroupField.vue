<script setup lang="ts">
import { groups } from '../../history/groups'
import { i18n } from '../../i18n'
import type { GroupId } from '../../state/groups'
import OptionalSelectField from './OptionalSelectField.vue'

const modelValue = defineModel<GroupId | undefined>({ required: true })
</script>

<template>
    <OptionalSelectField
        v-model="modelValue"
        :label="i18n.modals.form.group.label"
        :options="[...groups.entries()].map(([id, { name }]) => [name, id])"
    />
</template>
