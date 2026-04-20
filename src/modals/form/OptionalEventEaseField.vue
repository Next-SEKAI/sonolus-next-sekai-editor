<script setup lang="ts">
import type { EventEase } from '../../chart/events'
import { i18n } from '../../i18n'
import OptionalSelectField from './OptionalSelectField.vue'

const modelValue = defineModel<EventEase | undefined>({ required: true })
</script>

<template>
    <OptionalSelectField
        v-model="modelValue"
        :label="i18n.modals.form.eventEase.label"
        :options="[
            [i18n.modals.form.eventEase.linear, 'linear'],
            [i18n.modals.form.eventEase.in, 'in'],
            [i18n.modals.form.eventEase.out, 'out'],
            [i18n.modals.form.eventEase.inOut, 'inOut'],
            [i18n.modals.form.eventEase.outIn, 'outIn'],
            [i18n.modals.form.eventEase.none, 'none'],
        ]"
    />
</template>
