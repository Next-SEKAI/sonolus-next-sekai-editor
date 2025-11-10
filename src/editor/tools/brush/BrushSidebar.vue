<script setup lang="ts">
import { brushProperties, setBrushProperties } from '.'
import { i18n } from '../../../i18n'
import OptionalConnectorActiveIsCriticalField from '../../../modals/form/OptionalConnectorActiveIsCriticalField.vue'
import OptionalConnectorActiveIsFakeField from '../../../modals/form/OptionalConnectorActiveIsFakeField.vue'
import OptionalConnectorEaseField from '../../../modals/form/OptionalConnectorEaseField.vue'
import OptionalConnectorGuideAlphaField from '../../../modals/form/OptionalConnectorGuideAlphaField.vue'
import OptionalConnectorGuideColorField from '../../../modals/form/OptionalConnectorGuideColorField.vue'
import OptionalConnectorTypeField from '../../../modals/form/OptionalConnectorTypeField.vue'
import OptionalFlickDirectionField from '../../../modals/form/OptionalFlickDirectionField.vue'
import OptionalGroupField from '../../../modals/form/OptionalGroupField.vue'
import OptionalHideNotesField from '../../../modals/form/OptionalHideNotesField.vue'
import OptionalIsAttachedField from '../../../modals/form/OptionalIsAttachedField.vue'
import OptionalIsConnectorSeparatorField from '../../../modals/form/OptionalIsConnectorSeparatorField.vue'
import OptionalIsCriticalField from '../../../modals/form/OptionalIsCriticalField.vue'
import OptionalIsFakeField from '../../../modals/form/OptionalIsFakeField.vue'
import OptionalNoteTypeField from '../../../modals/form/OptionalNoteTypeField.vue'
import OptionalSfxField from '../../../modals/form/OptionalSfxField.vue'
import OptionalSizeField from '../../../modals/form/OptionalSizeField.vue'
import OptionalSkipField from '../../../modals/form/OptionalSkipField.vue'
import OptionalTimeScaleEaseField from '../../../modals/form/OptionalTimeScaleEaseField.vue'
import OptionalTimeScaleField from '../../../modals/form/OptionalTimeScaleField.vue'
import BaseSidebar from '../../sidebars/BaseSidebar.vue'
import { useProperties } from '../../utils/properties'

const createModel = useProperties(() => brushProperties, setBrushProperties)

const group = createModel('group')
const noteType = createModel('noteType')
const isAttached = createModel('isAttached')
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
const timeScale = createModel('timeScale')
const skip = createModel('skip')
const ease = createModel('ease')
const hideNotes = createModel('hideNotes')
</script>

<template>
    <BaseSidebar :title="i18n.tools.brush.sidebar.title">
        <OptionalNoteTypeField v-model="noteType" />
        <OptionalGroupField v-model="group" />
        <OptionalIsAttachedField v-model="isAttached" />
        <OptionalSizeField v-model="size" />
        <OptionalIsCriticalField v-model="isCritical" />
        <OptionalFlickDirectionField v-model="flickDirection" />
        <OptionalIsFakeField v-model="isFake" />
        <OptionalSfxField v-model="sfx" />
        <OptionalIsConnectorSeparatorField v-model="isConnectorSeparator" />
        <OptionalConnectorTypeField v-model="connectorType" />
        <OptionalConnectorEaseField v-model="connectorEase" />
        <OptionalConnectorActiveIsCriticalField v-model="connectorActiveIsCritical" />
        <OptionalConnectorActiveIsFakeField v-model="connectorActiveIsFake" />
        <OptionalConnectorGuideColorField v-model="connectorGuideColor" />
        <OptionalConnectorGuideAlphaField v-model="connectorGuideAlpha" />
        <OptionalTimeScaleField v-model="timeScale" />
        <OptionalSkipField v-model="skip" />
        <OptionalTimeScaleEaseField v-model="ease" />
        <OptionalHideNotesField v-model="hideNotes" />
    </BaseSidebar>
</template>
