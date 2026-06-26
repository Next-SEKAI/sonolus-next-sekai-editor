<script setup lang="ts">
import { i18n } from '../../../../../i18n'
import MultiBeatField from '../../../../../modals/form/MultiBeatField.vue'
import MultiEditorLaneField from '../../../../../modals/form/MultiEditorLaneField.vue'
import MultiEventEaseField from '../../../../../modals/form/MultiEventEaseField.vue'
import MultiJudgmentLineAlphaField from '../../../../../modals/form/MultiJudgmentLineAlphaField.vue'
import MultiJudgmentLineColorField from '../../../../../modals/form/MultiJudgmentLineColorField.vue'
import MultiLaneAlphaField from '../../../../../modals/form/MultiLaneAlphaField.vue'
import MultiLeftBorderStyleField from '../../../../../modals/form/MultiLeftBorderStyleField.vue'
import MultiRightBorderStyleField from '../../../../../modals/form/MultiRightBorderStyleField.vue'
import MultiStageAlphaField from '../../../../../modals/form/MultiStageAlphaField.vue'
import MultiStageField from '../../../../../modals/form/MultiStageField.vue'
import PropertiesModal from '../../../../../modals/form/PropertiesModal.vue'
import { interpolateRaw } from '../../../../../utils/interpolate'
import { useSelectedEntitiesProperties } from '../../../../utils/properties'

const { createModel } = useSelectedEntitiesProperties(
    (entity) => entity.type === 'stageStyleEventJoint',
)

const stageId = createModel('stageId')
const judgmentLineColor = createModel('judgmentLineColor')
const leftBorderStyle = createModel('leftBorderStyle')
const rightBorderStyle = createModel('rightBorderStyle')
const stageAlpha = createModel('stageAlpha')
const laneAlpha = createModel('laneAlpha')
const judgmentLineAlpha = createModel('judgmentLineAlpha')
const eventEase = createModel('eventEase')
const beat = createModel('beat')
const editorLane = createModel('editorLane')
</script>

<template>
    <PropertiesModal
        :title="interpolateRaw(i18n.tools.events.modal.title, i18n.events.stageStyleEvent)"
    >
        <MultiStageField v-model="stageId" />
        <MultiJudgmentLineColorField v-model="judgmentLineColor" />
        <MultiLeftBorderStyleField v-model="leftBorderStyle" />
        <MultiRightBorderStyleField v-model="rightBorderStyle" />
        <MultiStageAlphaField v-model="stageAlpha" />
        <MultiLaneAlphaField v-model="laneAlpha" />
        <MultiJudgmentLineAlphaField v-model="judgmentLineAlpha" />
        <MultiEventEaseField v-model="eventEase" />
        <MultiBeatField v-model="beat" />
        <MultiEditorLaneField v-model="editorLane" />
    </PropertiesModal>
</template>
