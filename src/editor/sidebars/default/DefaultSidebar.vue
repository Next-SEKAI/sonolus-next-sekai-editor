<script setup lang="ts">
import { isEditableEntity } from '.'
import { isDynamicStages } from '../../../history/dynamicStages.ts'
import { i18n } from '../../../i18n'
import MultiBeatField from '../../../modals/form/MultiBeatField.vue'
import MultiBpmField from '../../../modals/form/MultiBpmField.vue'
import MultiCameraLeftField from '../../../modals/form/MultiCameraLeftField.vue'
import MultiCameraRotationField from '../../../modals/form/MultiCameraRotationField.vue'
import MultiCameraSizeField from '../../../modals/form/MultiCameraSizeField.vue'
import MultiCameraStageTiltField from '../../../modals/form/MultiCameraStageTiltField.vue'
import MultiCameraZoomField from '../../../modals/form/MultiCameraZoomField.vue'
import MultiCameraZoomTargetLaneField from '../../../modals/form/MultiCameraZoomTargetLaneField.vue'
import MultiCameraZoomTargetYField from '../../../modals/form/MultiCameraZoomTargetYField.vue'
import MultiCameraZoomVerticalAlignField from '../../../modals/form/MultiCameraZoomVerticalAlignField.vue'
import MultiConnectorActiveIsCriticalField from '../../../modals/form/MultiConnectorActiveIsCriticalField.vue'
import MultiConnectorActiveIsFakeField from '../../../modals/form/MultiConnectorActiveIsFakeField.vue'
import MultiConnectorEaseField from '../../../modals/form/MultiConnectorEaseField.vue'
import MultiConnectorGuideAlphaField from '../../../modals/form/MultiConnectorGuideAlphaField.vue'
import MultiConnectorGuideColorField from '../../../modals/form/MultiConnectorGuideColorField.vue'
import MultiConnectorIsPassThroughField from '../../../modals/form/MultiConnectorIsPassThroughField.vue'
import MultiConnectorLayerField from '../../../modals/form/MultiConnectorLayerField.vue'
import MultiConnectorTypeField from '../../../modals/form/MultiConnectorTypeField.vue'
import MultiDivisionParityField from '../../../modals/form/MultiDivisionParityField.vue'
import MultiDivisionSizeField from '../../../modals/form/MultiDivisionSizeField.vue'
import MultiEventEaseField from '../../../modals/form/MultiEventEaseField.vue'
import MultiFlickDirectionField from '../../../modals/form/MultiFlickDirectionField.vue'
import MultiGroupField from '../../../modals/form/MultiGroupField.vue'
import MultiHideNotesField from '../../../modals/form/MultiHideNotesField.vue'
import MultiIsAttachedField from '../../../modals/form/MultiIsAttachedField.vue'
import MultiIsConnectorSeparatorField from '../../../modals/form/MultiIsConnectorSeparatorField.vue'
import MultiIsCriticalField from '../../../modals/form/MultiIsCriticalField.vue'
import MultiIsFakeField from '../../../modals/form/MultiIsFakeField.vue'
import MultiJudgmentLineAlphaField from '../../../modals/form/MultiJudgmentLineAlphaField.vue'
import MultiJudgmentLineColorField from '../../../modals/form/MultiJudgmentLineColorField.vue'
import MultiLaneAlphaField from '../../../modals/form/MultiLaneAlphaField.vue'
import MultiLeftBorderStyleField from '../../../modals/form/MultiLeftBorderStyleField.vue'
import MultiLeftField from '../../../modals/form/MultiLeftField.vue'
import MultiMaskLeftField from '../../../modals/form/MultiMaskLeftField.vue'
import MultiMaskSizeField from '../../../modals/form/MultiMaskSizeField.vue'
import MultiNoteTypeField from '../../../modals/form/MultiNoteTypeField.vue'
import MultiPivotLaneField from '../../../modals/form/MultiPivotLaneField.vue'
import MultiRightBorderStyleField from '../../../modals/form/MultiRightBorderStyleField.vue'
import MultiSfxField from '../../../modals/form/MultiSfxField.vue'
import MultiSizeField from '../../../modals/form/MultiSizeField.vue'
import MultiSkipField from '../../../modals/form/MultiSkipField.vue'
import MultiStageAlphaField from '../../../modals/form/MultiStageAlphaField.vue'
import MultiStageField from '../../../modals/form/MultiStageField.vue'
import MultiTimeScaleEaseField from '../../../modals/form/MultiTimeScaleEaseField.vue'
import MultiTimeScaleField from '../../../modals/form/MultiTimeScaleField.vue'
import MultiYOffsetBeatField from '../../../modals/form/MultiYOffsetBeatField.vue'
import MultiYOffsetField from '../../../modals/form/MultiYOffsetField.vue'
import { useSelectedEntitiesProperties } from '../../utils/properties'
import BaseSidebar from '../BaseSidebar.vue'

const { entities, types, noteFields, createModel } = useSelectedEntitiesProperties(isEditableEntity)

const beat = createModel('beat')
const bpm = createModel('bpm')
const groupId = createModel('groupId')
const stageId = createModel('stageId')
const timeScale = createModel('timeScale')
const skip = createModel('skip')
const timeScaleEase = createModel('timeScaleEase')
const hideNotes = createModel('hideNotes')
const cameraLeft = createModel('cameraLeft')
const cameraSize = createModel('cameraSize')
const cameraZoom = createModel('cameraZoom')
const cameraZoomTargetLane = createModel('cameraZoomTargetLane')
const cameraZoomTargetY = createModel('cameraZoomTargetY')
const cameraZoomVerticalAlign = createModel('cameraZoomVerticalAlign')
const cameraRotation = createModel('cameraRotation')
const cameraStageTilt = createModel('cameraStageTilt')
const maskLeft = createModel('maskLeft')
const maskSize = createModel('maskSize')
const pivotLane = createModel('pivotLane')
const divisionSize = createModel('divisionSize')
const divisionParity = createModel('divisionParity')
const yOffset = createModel('yOffset')
const yOffsetBeat = createModel('yOffsetBeat')
const judgmentLineColor = createModel('judgmentLineColor')
const leftBorderStyle = createModel('leftBorderStyle')
const rightBorderStyle = createModel('rightBorderStyle')
const stageAlpha = createModel('stageAlpha')
const laneAlpha = createModel('laneAlpha')
const judgmentLineAlpha = createModel('judgmentLineAlpha')
const eventEase = createModel('eventEase')
const noteType = createModel('noteType')
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
const connectorIsPassThrough = createModel('connectorIsPassThrough')
</script>

<template>
    <BaseSidebar :title="i18n.sidebars.default.title">
        <div v-if="!entities.length">{{ i18n.sidebars.default.none }}</div>
        <template v-else>
            <MultiBpmField v-if="types.bpm" v-model="bpm" />
            <MultiTimeScaleField v-if="types.timeScale" v-model="timeScale" />
            <MultiSkipField v-if="types.timeScale" v-model="skip" />
            <MultiTimeScaleEaseField v-if="types.timeScale" v-model="timeScaleEase" />
            <MultiHideNotesField v-if="types.timeScale" v-model="hideNotes" />
            <MultiCameraLeftField v-if="types.cameraEventJoint" v-model="cameraLeft" />
            <MultiCameraSizeField v-if="types.cameraEventJoint" v-model="cameraSize" />
            <MultiCameraZoomField v-if="types.cameraEventJoint" v-model="cameraZoom" />
            <MultiCameraZoomTargetLaneField
                v-if="types.cameraEventJoint"
                v-model="cameraZoomTargetLane"
            />
            <MultiCameraZoomTargetYField
                v-if="types.cameraEventJoint"
                v-model="cameraZoomTargetY"
            />
            <MultiCameraZoomVerticalAlignField
                v-if="types.cameraEventJoint"
                v-model="cameraZoomVerticalAlign"
            />
            <MultiCameraRotationField v-if="types.cameraEventJoint" v-model="cameraRotation" />
            <MultiCameraStageTiltField v-if="types.cameraEventJoint" v-model="cameraStageTilt" />
            <MultiMaskLeftField v-if="types.stageMaskEventJoint" v-model="maskLeft" />
            <MultiMaskSizeField v-if="types.stageMaskEventJoint" v-model="maskSize" />
            <MultiPivotLaneField v-if="types.stagePivotEventJoint" v-model="pivotLane" />
            <MultiDivisionSizeField v-if="types.stagePivotEventJoint" v-model="divisionSize" />
            <MultiDivisionParityField v-if="types.stagePivotEventJoint" v-model="divisionParity" />
            <MultiYOffsetField v-if="types.stagePivotEventJoint" v-model="yOffset" />
            <MultiYOffsetBeatField v-if="types.stagePivotEventJoint" v-model="yOffsetBeat" />
            <MultiJudgmentLineColorField
                v-if="types.stageStyleEventJoint"
                v-model="judgmentLineColor"
            />
            <MultiLeftBorderStyleField
                v-if="types.stageStyleEventJoint"
                v-model="leftBorderStyle"
            />
            <MultiRightBorderStyleField
                v-if="types.stageStyleEventJoint"
                v-model="rightBorderStyle"
            />
            <MultiStageAlphaField v-if="types.stageStyleEventJoint" v-model="stageAlpha" />
            <MultiLaneAlphaField v-if="types.stageStyleEventJoint" v-model="laneAlpha" />
            <MultiJudgmentLineAlphaField
                v-if="types.stageStyleEventJoint"
                v-model="judgmentLineAlpha"
            />
            <MultiEventEaseField
                v-if="
                    types.cameraEventJoint ||
                    types.stageMaskEventJoint ||
                    types.stagePivotEventJoint ||
                    types.stageStyleEventJoint
                "
                v-model="eventEase"
            />
            <MultiNoteTypeField v-if="types.note" v-model="noteType" />
            <MultiGroupField v-if="types.timeScale || types.note" v-model="groupId" />
            <MultiStageField
                v-if="
                    isDynamicStages &&
                    (types.note ||
                        types.stageMaskEventJoint ||
                        types.stagePivotEventJoint ||
                        types.stageStyleEventJoint)
                "
                v-model="stageId"
            />
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
            <MultiSfxField v-if="types.note && noteFields.sfx !== false" v-model="sfx" />
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
            <MultiConnectorLayerField
                v-if="types.note && noteFields.connectorLayer !== false"
                v-model="connectorLayer"
            />
            <MultiConnectorIsPassThroughField
                v-if="types.note && noteFields.connectorIsPassThrough !== false"
                v-model="connectorIsPassThrough"
            />
        </template>
    </BaseSidebar>
</template>
