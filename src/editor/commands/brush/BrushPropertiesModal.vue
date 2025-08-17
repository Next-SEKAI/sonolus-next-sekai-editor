<script setup lang="ts">
import { i18n } from '../../../i18n'
import OptionalConnectorActiveIsCriticalField from '../../../modals/form/OptionalConnectorActiveIsCriticalField.vue'
import OptionalConnectorActiveIsFakeField from '../../../modals/form/OptionalConnectorActiveIsFakeField.vue'
import OptionalConnectorEaseField from '../../../modals/form/OptionalConnectorEaseField.vue'
import OptionalConnectorGuideAlphaField from '../../../modals/form/OptionalConnectorGuideAlphaField.vue'
import OptionalConnectorGuideColorField from '../../../modals/form/OptionalConnectorGuideColorField.vue'
import OptionalConnectorTypeField from '../../../modals/form/OptionalConnectorTypeField.vue'
import OptionalFlickDirectionField from '../../../modals/form/OptionalFlickDirectionField.vue'
import OptionalGroupField from '../../../modals/form/OptionalGroupField.vue'
import OptionalIsAttachedField from '../../../modals/form/OptionalIsAttachedField.vue'
import OptionalIsConnectorSeparatorField from '../../../modals/form/OptionalIsConnectorSeparatorField.vue'
import OptionalIsCriticalField from '../../../modals/form/OptionalIsCriticalField.vue'
import OptionalIsFakeField from '../../../modals/form/OptionalIsFakeField.vue'
import OptionalNoteTypeField from '../../../modals/form/OptionalNoteTypeField.vue'
import OptionalSizeField from '../../../modals/form/OptionalSizeField.vue'
import PropertiesModal from '../../../modals/form/PropertiesModal.vue'
import { brushProperties, setBrushProperties } from '../../tools/brush'
import { useProperties } from '../../utils/properties'

const createModel = useProperties(() => brushProperties, setBrushProperties)

const group = createModel('group')
const noteType = createModel('noteType')
const isAttached = createModel('isAttached')
const size = createModel('size')
const isCritical = createModel('isCritical')
const flickDirection = createModel('flickDirection')
const isFake = createModel('isFake')
const isConnectorSeparator = createModel('isConnectorSeparator')
const connectorType = createModel('connectorType')
const connectorEase = createModel('connectorEase')
const connectorActiveIsCritical = createModel('connectorActiveIsCritical')
const connectorActiveIsFake = createModel('connectorActiveIsFake')
const connectorGuideColor = createModel('connectorGuideColor')
const connectorGuideAlpha = createModel('connectorGuideAlpha')
</script>

<template>
    <PropertiesModal :title="i18n.commands.brush.modal.title">
        <OptionalNoteTypeField v-model="noteType" />
        <OptionalGroupField v-model="group" />
        <OptionalIsAttachedField v-model="isAttached" />
        <OptionalSizeField v-model="size" />
        <OptionalIsCriticalField v-model="isCritical" />
        <OptionalFlickDirectionField v-model="flickDirection" />
        <OptionalIsFakeField v-model="isFake" />
        <OptionalIsConnectorSeparatorField v-model="isConnectorSeparator" />
        <OptionalConnectorTypeField v-model="connectorType" />
        <OptionalConnectorEaseField v-model="connectorEase" />
        <OptionalConnectorActiveIsCriticalField v-model="connectorActiveIsCritical" />
        <OptionalConnectorActiveIsFakeField v-model="connectorActiveIsFake" />
        <OptionalConnectorGuideColorField v-model="connectorGuideColor" />
        <OptionalConnectorGuideAlphaField v-model="connectorGuideAlpha" />
    </PropertiesModal>
</template>
