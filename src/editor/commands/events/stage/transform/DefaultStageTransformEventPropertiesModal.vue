<script setup lang="ts">
import { i18n } from '../../../../../i18n/index.ts'
import CopyPropertiesField from '../../../../../modals/form/CopyPropertiesField.vue'
import OptionalAnchorField from '../../../../../modals/form/OptionalAnchorField.vue'
import OptionalEventEaseField from '../../../../../modals/form/OptionalEventEaseField.vue'
import OptionalRotationField from '../../../../../modals/form/OptionalRotationField.vue'
import OptionalYTranslationField from '../../../../../modals/form/OptionalYTranslationField.vue'
import PropertiesModal from '../../../../../modals/form/PropertiesModal.vue'
import { interpolateRaw } from '../../../../../utils/interpolate.ts'
import { defaultStageTransformEventProperties } from '../../../../tools/events/stage/transform/index.ts'
import { useProperties } from '../../../../utils/properties.ts'

const createModel = useProperties(defaultStageTransformEventProperties)

const rotation = createModel('rotation')
const yTranslation = createModel('yTranslation')
const anchor = createModel('anchor')
const eventEase = createModel('eventEase')
const copyProperties = createModel('copyProperties')
</script>

<template>
    <PropertiesModal
        :title="interpolateRaw(i18n.commands.events.modal.title, i18n.events.stageTransformEvent)"
    >
        <OptionalRotationField v-model="rotation" />
        <OptionalYTranslationField v-model="yTranslation" />
        <OptionalAnchorField v-model="anchor" />
        <OptionalEventEaseField v-model="eventEase" />
        <CopyPropertiesField v-model="copyProperties" />
    </PropertiesModal>
</template>
