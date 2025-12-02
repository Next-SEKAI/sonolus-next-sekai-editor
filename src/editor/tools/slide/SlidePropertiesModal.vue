<script setup lang="ts">
import { i18n } from '../../../i18n'
import MultiBeatField from '../../../modals/form/MultiBeatField.vue'
import MultiConnectorActiveIsCriticalField from '../../../modals/form/MultiConnectorActiveIsCriticalField.vue'
import MultiConnectorActiveIsFakeField from '../../../modals/form/MultiConnectorActiveIsFakeField.vue'
import MultiConnectorEaseField from '../../../modals/form/MultiConnectorEaseField.vue'
import MultiConnectorGuideAlphaField from '../../../modals/form/MultiConnectorGuideAlphaField.vue'
import MultiConnectorGuideColorField from '../../../modals/form/MultiConnectorGuideColorField.vue'
import MultiConnectorLayerField from '../../../modals/form/MultiConnectorLayerField.vue'
import MultiConnectorTypeField from '../../../modals/form/MultiConnectorTypeField.vue'
import MultiFlickDirectionField from '../../../modals/form/MultiFlickDirectionField.vue'
import MultiGroupField from '../../../modals/form/MultiGroupField.vue'
import MultiIsAttachedField from '../../../modals/form/MultiIsAttachedField.vue'
import MultiIsConnectorSeparatorField from '../../../modals/form/MultiIsConnectorSeparatorField.vue'
import MultiIsCriticalField from '../../../modals/form/MultiIsCriticalField.vue'
import MultiIsFakeField from '../../../modals/form/MultiIsFakeField.vue'
import MultiLeftField from '../../../modals/form/MultiLeftField.vue'
import MultiNoteTypeField from '../../../modals/form/MultiNoteTypeField.vue'
import MultiSfxField from '../../../modals/form/MultiSfxField.vue'
import MultiSizeField from '../../../modals/form/MultiSizeField.vue'
import PropertiesModal from '../../../modals/form/PropertiesModal.vue'
import { useSelectedEntitiesProperties } from '../../utils/properties'

const { noteFields, createModel } = useSelectedEntitiesProperties(
    (entity) => entity.type === 'note',
)

const noteType = createModel('noteType')
const group = createModel('group')
const beat = createModel('beat')
const isAttached = createModel('isAttached')
const left = createModel('left')
const size = createModel('size')
const isCritical = createModel('isCritical')
const flickDirection = createModel('flickDirection')
const isFake = createModel('isFake')
const sfx = createModel('sfx')
const isConnectorSeparator = createModel('isConnectorSeparator')
const connectorType = createModel('connectorType')
const connectorEase = createModel('connectorEase')
const connectorActiveIsCritical = createModel('connectorActiveIsCritical')
const connectorActiveIsFake = createModel('connectorActiveIsFake')
const connectorGuideColor = createModel('connectorGuideColor')
const connectorGuideAlpha = createModel('connectorGuideAlpha')
const connectorLayer = createModel('connectorLayer')
</script>

<template>
    <PropertiesModal :title="i18n.tools.slide.modal.title">
        <MultiNoteTypeField v-model="noteType" />
        <MultiGroupField v-model="group" />
        <MultiBeatField v-model="beat" />
        <MultiIsAttachedField v-if="noteFields.isAttached !== false" v-model="isAttached" />
        <MultiLeftField v-if="noteFields.left !== false" v-model="left" />
        <MultiSizeField v-if="noteFields.size !== false" v-model="size" />
        <MultiIsCriticalField v-if="noteFields.isCritical !== false" v-model="isCritical" />
        <MultiFlickDirectionField
            v-if="noteFields.flickDirection !== false"
            v-model="flickDirection"
        />
        <MultiIsFakeField v-if="noteFields.isFake !== false" v-model="isFake" />
        <MultiSfxField v-if="noteFields.sfx !== false" v-model="sfx" />
        <MultiIsConnectorSeparatorField
            v-if="noteFields.isConnectorSeparator !== false"
            v-model="isConnectorSeparator"
        />
        <MultiConnectorTypeField
            v-if="noteFields.connectorType !== false"
            v-model="connectorType"
        />
        <MultiConnectorEaseField
            v-if="noteFields.connectorEase !== false"
            v-model="connectorEase"
        />
        <MultiConnectorActiveIsCriticalField
            v-if="noteFields.connectorActiveIsCritical !== false"
            v-model="connectorActiveIsCritical"
        />
        <MultiConnectorActiveIsFakeField
            v-if="noteFields.connectorActiveIsFake !== false"
            v-model="connectorActiveIsFake"
        />
        <MultiConnectorGuideColorField
            v-if="noteFields.connectorGuideColor !== false"
            v-model="connectorGuideColor"
        />
        <MultiConnectorGuideAlphaField
            v-if="noteFields.connectorGuideAlpha !== false"
            v-model="connectorGuideAlpha"
        />
        <MultiConnectorLayerField
            v-if="noteFields.connectorLayer !== false"
            v-model="connectorLayer"
        />
    </PropertiesModal>
</template>
