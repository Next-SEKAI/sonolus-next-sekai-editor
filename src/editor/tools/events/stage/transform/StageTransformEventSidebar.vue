<script setup lang="ts">
import { defaultStageTransformEventProperties } from './index.ts'
import { i18n } from '../../../../../i18n/index.ts'
import CopyPropertiesField from '../../../../../modals/form/CopyPropertiesField.vue'
import OptionalEventEaseField from '../../../../../modals/form/OptionalEventEaseField.vue'
import { interpolateRaw } from '../../../../../utils/interpolate.ts'
import BaseSidebar from '../../../../sidebars/BaseSidebar.vue'
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
    <BaseSidebar
        :title="interpolateRaw(i18n.tools.events.sidebar.title, i18n.events.stageTransformEvent)"
    >
        <OptionalRotationField v-model="rotation" />
        <OptionalYTranslationField v-model="yTranslation" />
        <OptionalAnchorField v-model="anchor" />
        <OptionalEventEaseField v-model="eventEase" />
        <CopyPropertiesField v-model="copyProperties" />
    </BaseSidebar>
</template>
