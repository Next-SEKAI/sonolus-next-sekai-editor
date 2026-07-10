<script setup lang="ts">
import { defaultCameraEventProperties } from '.'
import CopyPropertiesField from '../../../../modals/form/CopyPropertiesField.vue'
import OptionalCameraRotationField from '../../../../modals/form/OptionalCameraRotationField.vue'
import OptionalCameraSizeField from '../../../../modals/form/OptionalCameraSizeField.vue'
import OptionalCameraStageTiltField from '../../../../modals/form/OptionalCameraStageTiltField.vue'
import OptionalCameraZoomField from '../../../../modals/form/OptionalCameraZoomField.vue'
import OptionalCameraZoomTargetLaneField from '../../../../modals/form/OptionalCameraZoomTargetLaneField.vue'
import OptionalCameraZoomTargetYField from '../../../../modals/form/OptionalCameraZoomTargetYField.vue'
import OptionalCameraZoomVerticalAlignField from '../../../../modals/form/OptionalCameraZoomVerticalAlignField.vue'
import OptionalEventEaseField from '../../../../modals/form/OptionalEventEaseField.vue'
import { useProperties } from '../../../utils/properties'

const createModel = useProperties(defaultCameraEventProperties)

const cameraSize = createModel('cameraSize')
const cameraZoom = createModel('cameraZoom')
const cameraZoomTargetLane = createModel('cameraZoomTargetLane')
const cameraZoomTargetY = createModel('cameraZoomTargetY')
const cameraZoomVerticalAlign = createModel('cameraZoomVerticalAlign')
const cameraRotation = createModel('cameraRotation')
const cameraStageTilt = createModel('cameraStageTilt')
const eventEase = createModel('eventEase')
const copyProperties = createModel('copyProperties')
</script>

<template>
    <OptionalCameraSizeField v-model="cameraSize" />
    <OptionalCameraZoomField v-model="cameraZoom" />
    <OptionalCameraZoomTargetLaneField v-model="cameraZoomTargetLane" />
    <OptionalCameraZoomTargetYField v-model="cameraZoomTargetY" />
    <OptionalCameraZoomVerticalAlignField v-model="cameraZoomVerticalAlign" />
    <OptionalCameraRotationField v-model="cameraRotation" />
    <OptionalCameraStageTiltField v-model="cameraStageTilt" />
    <OptionalEventEaseField v-model="eventEase" />
    <CopyPropertiesField v-model="copyProperties" />
</template>
