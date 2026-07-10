<script setup lang="ts">
import { defaultStageTransformEventProperties } from './index.ts'
import CopyPropertiesField from '../../../../../modals/form/CopyPropertiesField.vue'
import OptionalEventEaseField from '../../../../../modals/form/OptionalEventEaseField.vue'
import { useProperties } from '../../../../utils/properties.ts'
import OptionalRotationField from '../../../../../modals/form/OptionalRotationField.vue'
import OptionalYTranslationField from '../../../../../modals/form/OptionalYTranslationField.vue'
import OptionalAnchorField from '../../../../../modals/form/OptionalAnchorField.vue'

const createModel = useProperties(defaultStageTransformEventProperties)

const rotation = createModel('rotation')
const yTranslation = createModel('yTranslation')
const anchor = createModel('anchor')
const eventEase = createModel('eventEase')
const copyProperties = createModel('copyProperties')
</script>

<template>
    <OptionalRotationField v-model="rotation" />
    <OptionalYTranslationField v-model="yTranslation" />
    <OptionalAnchorField v-model="anchor" />
    <OptionalEventEaseField v-model="eventEase" />
    <CopyPropertiesField v-model="copyProperties" />
</template>
