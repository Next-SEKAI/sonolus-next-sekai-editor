<script setup lang="ts">
import { isEditableEntity } from '.'
import { i18n } from '../../../i18n'
import MultiBeatField from '../../../modals/form/MultiBeatField.vue'
import MultiBpmField from '../../../modals/form/MultiBpmField.vue'
import MultiConnectorActiveIsCriticalField from '../../../modals/form/MultiConnectorActiveIsCriticalField.vue'
import MultiConnectorActiveIsFakeField from '../../../modals/form/MultiConnectorActiveIsFakeField.vue'
import MultiConnectorEaseField from '../../../modals/form/MultiConnectorEaseField.vue'
import MultiConnectorGuideAlphaField from '../../../modals/form/MultiConnectorGuideAlphaField.vue'
import MultiConnectorGuideColorField from '../../../modals/form/MultiConnectorGuideColorField.vue'
import MultiConnectorTypeField from '../../../modals/form/MultiConnectorTypeField.vue'
import MultiFlickDirectionField from '../../../modals/form/MultiFlickDirectionField.vue'
import MultiGroupField from '../../../modals/form/MultiGroupField.vue'
import MultiIsAttachedField from '../../../modals/form/MultiIsAttachedField.vue'
import MultiIsConnectorSeparatorField from '../../../modals/form/MultiIsConnectorSeparatorField.vue'
import MultiIsCriticalField from '../../../modals/form/MultiIsCriticalField.vue'
import MultiIsFakeField from '../../../modals/form/MultiIsFakeField.vue'
import MultiLeftField from '../../../modals/form/MultiLeftField.vue'
import MultiNoteTypeField from '../../../modals/form/MultiNoteTypeField.vue'
import MultiSizeField from '../../../modals/form/MultiSizeField.vue'
import MultiSkipField from '../../../modals/form/MultiSkipField.vue'
import MultiTimeScaleEaseField from '../../../modals/form/MultiTimeScaleEaseField.vue'
import MultiTimeScaleField from '../../../modals/form/MultiTimeScaleField.vue'
import { useSelectedEntitiesProperties } from '../../utils/properties'
import BaseSidebar from '../BaseSidebar.vue'

const { entities, types, noteFields, createModel } = useSelectedEntitiesProperties(isEditableEntity)

const beat = createModel('beat')
const bpm = createModel('bpm')
const group = createModel('group')
const timeScale = createModel('timeScale')
const skip = createModel('skip')
const ease = createModel('ease')
const noteType = createModel('noteType')
const isAttached = createModel('isAttached')
const left = createModel('left')
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
    <BaseSidebar :title="i18n.sidebars.default.title">
        <div v-if="!entities.length">{{ i18n.sidebars.default.none }}</div>
        <template v-else>
            <MultiBpmField v-if="types.bpm" v-model="bpm" />
            <MultiTimeScaleField v-if="types.timeScale" v-model="timeScale" />
            <MultiSkipField v-if="types.timeScale" v-model="skip" />
            <MultiTimeScaleEaseField v-if="types.timeScale" v-model="ease" />
            <MultiNoteTypeField v-if="types.note" v-model="noteType" />
            <MultiGroupField v-if="types.timeScale || types.note" v-model="group" />
            <MultiBeatField
                v-if="entities.length === 1 || (!types.bpm && !types.timeScale)"
                v-model="beat"
            />
            <MultiIsAttachedField
                v-if="types.note && noteFields.isAttached !== false"
                v-model="isAttached"
            />
            <MultiLeftField v-if="types.note && noteFields.left !== false" v-model="left" />
            <MultiSizeField v-if="types.note && noteFields.size !== false" v-model="size" />
            <MultiIsCriticalField
                v-if="types.note && noteFields.isCritical !== false"
                v-model="isCritical"
            />
            <MultiFlickDirectionField
                v-if="types.note && noteFields.flickDirection !== false"
                v-model="flickDirection"
            />
            <MultiIsFakeField v-if="types.note && noteFields.isFake !== false" v-model="isFake" />
            <MultiIsConnectorSeparatorField
                v-if="types.note && noteFields.isConnectorSeparator !== false"
                v-model="isConnectorSeparator"
            />
            <MultiConnectorTypeField
                v-if="types.note && noteFields.connectorType !== false"
                v-model="connectorType"
            />
            <MultiConnectorEaseField
                v-if="types.note && noteFields.connectorEase !== false"
                v-model="connectorEase"
            />
            <MultiConnectorActiveIsCriticalField
                v-if="types.note && noteFields.connectorActiveIsCritical !== false"
                v-model="connectorActiveIsCritical"
            />
            <MultiConnectorActiveIsFakeField
                v-if="types.note && noteFields.connectorActiveIsFake !== false"
                v-model="connectorActiveIsFake"
            />
            <MultiConnectorGuideColorField
                v-if="types.note && noteFields.connectorGuideColor !== false"
                v-model="connectorGuideColor"
            />
            <MultiConnectorGuideAlphaField
                v-if="types.note && noteFields.connectorGuideAlpha !== false"
                v-model="connectorGuideAlpha"
            />
        </template>
    </BaseSidebar>
</template>
