<script setup lang="ts">
import { brushProperties } from '.'
import { isDynamicStages } from '../../../history/dynamicStages.ts'
import { i18n } from '../../../i18n'
import OptionalCameraRotationField from '../../../modals/form/OptionalCameraRotationField.vue'
import OptionalCameraSizeField from '../../../modals/form/OptionalCameraSizeField.vue'
import OptionalCameraStageTiltField from '../../../modals/form/OptionalCameraStageTiltField.vue'
import OptionalCameraZoomField from '../../../modals/form/OptionalCameraZoomField.vue'
import OptionalCameraZoomTargetLaneField from '../../../modals/form/OptionalCameraZoomTargetLaneField.vue'
import OptionalCameraZoomTargetYField from '../../../modals/form/OptionalCameraZoomTargetYField.vue'
import OptionalCameraZoomVerticalAlignField from '../../../modals/form/OptionalCameraZoomVerticalAlignField.vue'
import OptionalConnectorActiveIsCriticalField from '../../../modals/form/OptionalConnectorActiveIsCriticalField.vue'
import OptionalConnectorActiveIsFakeField from '../../../modals/form/OptionalConnectorActiveIsFakeField.vue'
import OptionalConnectorEaseField from '../../../modals/form/OptionalConnectorEaseField.vue'
import OptionalConnectorGuideAlphaField from '../../../modals/form/OptionalConnectorGuideAlphaField.vue'
import OptionalConnectorGuideColorField from '../../../modals/form/OptionalConnectorGuideColorField.vue'
import OptionalConnectorIsPassThroughField from '../../../modals/form/OptionalConnectorIsPassThroughField.vue'
import OptionalConnectorLayerField from '../../../modals/form/OptionalConnectorLayerField.vue'
import OptionalConnectorTypeField from '../../../modals/form/OptionalConnectorTypeField.vue'
import OptionalEventEaseField from '../../../modals/form/OptionalEventEaseField.vue'
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
import OptionalStageField from '../../../modals/form/OptionalStageField.vue'
import OptionalTimeScaleEaseField from '../../../modals/form/OptionalTimeScaleEaseField.vue'
import OptionalTimeScaleField from '../../../modals/form/OptionalTimeScaleField.vue'
import BaseSidebar from '../../sidebars/BaseSidebar.vue'
import { useProperties } from '../../utils/properties'

const createModel = useProperties(brushProperties)

const groupId = createModel('groupId')
const stageId = createModel('stageId')
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
const connectorLayer = createModel('connectorLayer')
const connectorIsPassThrough = createModel('connectorIsPassThrough')
const timeScale = createModel('timeScale')
const skip = createModel('skip')
const timeScaleEase = createModel('timeScaleEase')
const hideNotes = createModel('hideNotes')
const cameraSize = createModel('cameraSize')
const cameraZoom = createModel('cameraZoom')
const cameraZoomTargetLane = createModel('cameraZoomTargetLane')
const cameraZoomTargetY = createModel('cameraZoomTargetY')
const cameraZoomVerticalAlign = createModel('cameraZoomVerticalAlign')
const cameraRotation = createModel('cameraRotation')
const cameraStageTilt = createModel('cameraStageTilt')
const eventEase = createModel('eventEase')
</script>

<template>
    <BaseSidebar :title="i18n.tools.brush.sidebar.title">
        <OptionalNoteTypeField v-model="noteType" />
        <OptionalGroupField v-model="groupId" />
        <OptionalStageField v-if="isDynamicStages" v-model="stageId" />
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
        <OptionalConnectorLayerField v-model="connectorLayer" />
        <OptionalConnectorIsPassThroughField v-model="connectorIsPassThrough" />
        <OptionalTimeScaleField v-model="timeScale" />
        <OptionalSkipField v-model="skip" />
        <OptionalTimeScaleEaseField v-model="timeScaleEase" />
        <OptionalHideNotesField v-model="hideNotes" />
        <OptionalCameraSizeField v-if="isDynamicStages" v-model="cameraSize" />
        <OptionalCameraZoomField v-if="isDynamicStages" v-model="cameraZoom" />
        <OptionalCameraZoomTargetLaneField v-if="isDynamicStages" v-model="cameraZoomTargetLane" />
        <OptionalCameraZoomTargetYField v-if="isDynamicStages" v-model="cameraZoomTargetY" />
        <OptionalCameraZoomVerticalAlignField
            v-if="isDynamicStages"
            v-model="cameraZoomVerticalAlign"
        />
        <OptionalCameraRotationField v-if="isDynamicStages" v-model="cameraRotation" />
        <OptionalCameraStageTiltField v-if="isDynamicStages" v-model="cameraStageTilt" />
        <OptionalEventEaseField v-if="isDynamicStages" v-model="eventEase" />
    </BaseSidebar>
</template>
