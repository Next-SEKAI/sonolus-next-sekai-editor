<script setup lang="ts">
import { i18n } from '../../../../i18n'
import MultiBeatField from '../../../../modals/form/MultiBeatField.vue'
import MultiCameraLeftField from '../../../../modals/form/MultiCameraLeftField.vue'
import MultiCameraRotationField from '../../../../modals/form/MultiCameraRotationField.vue'
import MultiCameraSizeField from '../../../../modals/form/MultiCameraSizeField.vue'
import MultiCameraStageTiltField from '../../../../modals/form/MultiCameraStageTiltField.vue'
import MultiCameraZoomField from '../../../../modals/form/MultiCameraZoomField.vue'
import MultiCameraZoomTargetLaneField from '../../../../modals/form/MultiCameraZoomTargetLaneField.vue'
import MultiCameraZoomTargetYField from '../../../../modals/form/MultiCameraZoomTargetYField.vue'
import MultiCameraZoomVerticalAlignField from '../../../../modals/form/MultiCameraZoomVerticalAlignField.vue'
import MultiEventEaseField from '../../../../modals/form/MultiEventEaseField.vue'
import PropertiesModal from '../../../../modals/form/PropertiesModal.vue'
import { interpolateRaw } from '../../../../utils/interpolate'
import { useSelectedEntitiesProperties } from '../../../utils/properties'

const { createModel } = useSelectedEntitiesProperties(
    (entity) => entity.type === 'cameraEventJoint',
)

const cameraLeft = createModel('cameraLeft')
const cameraSize = createModel('cameraSize')
const cameraZoom = createModel('cameraZoom')
const cameraZoomTargetLane = createModel('cameraZoomTargetLane')
const cameraZoomTargetY = createModel('cameraZoomTargetY')
const cameraZoomVerticalAlign = createModel('cameraZoomVerticalAlign')
const cameraRotation = createModel('cameraRotation')
const cameraStageTilt = createModel('cameraStageTilt')
const eventEase = createModel('eventEase')
const beat = createModel('beat')
</script>

<template>
    <PropertiesModal
        :title="interpolateRaw(i18n.tools.events.modal.title, i18n.events.cameraEvent)"
    >
        <MultiCameraLeftField v-model="cameraLeft" />
        <MultiCameraSizeField v-model="cameraSize" />
        <MultiCameraZoomField v-model="cameraZoom" />
        <MultiCameraZoomTargetLaneField v-model="cameraZoomTargetLane" />
        <MultiCameraZoomTargetYField v-model="cameraZoomTargetY" />
        <MultiCameraZoomVerticalAlignField v-model="cameraZoomVerticalAlign" />
        <MultiCameraRotationField v-model="cameraRotation" />
        <MultiCameraStageTiltField v-model="cameraStageTilt" />
        <MultiEventEaseField v-model="eventEase" />
        <MultiBeatField v-model="beat" />
    </PropertiesModal>
</template>
