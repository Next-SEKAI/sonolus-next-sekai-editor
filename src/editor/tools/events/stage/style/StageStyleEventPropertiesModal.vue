<script setup lang="ts">
import { i18n } from '../../../../../i18n'
import MultiBeatField from '../../../../../modals/form/MultiBeatField.vue'
import MultiDivisionLineAlphaField from '../../../../../modals/form/MultiDivisionLineAlphaField.vue'
import MultiEditorLaneField from '../../../../../modals/form/MultiEditorLaneField.vue'
import MultiEventEaseField from '../../../../../modals/form/MultiEventEaseField.vue'
import MultiIsFullWidthField from '../../../../../modals/form/MultiIsFullWidthField.vue'
import MultiJudgmentLineAlphaField from '../../../../../modals/form/MultiJudgmentLineAlphaField.vue'
import MultiJudgmentLineColorField from '../../../../../modals/form/MultiJudgmentLineColorField.vue'
import MultiJudgmentLineStyleField from '../../../../../modals/form/MultiJudgmentLineStyleField.vue'
import MultiLaneAlphaField from '../../../../../modals/form/MultiLaneAlphaField.vue'
import MultiLeftBorderStyleField from '../../../../../modals/form/MultiLeftBorderStyleField.vue'
import MultiNoteAlphaField from '../../../../../modals/form/MultiNoteAlphaField.vue'
import MultiRightBorderStyleField from '../../../../../modals/form/MultiRightBorderStyleField.vue'
import MultiStageField from '../../../../../modals/form/MultiStageField.vue'
import PropertiesModal from '../../../../../modals/form/PropertiesModal.vue'
import { interpolateRaw } from '../../../../../utils/interpolate'
import { useSelectedEntitiesProperties } from '../../../../utils/properties'

const { createModel } = useSelectedEntitiesProperties(
    (entity) => entity.type === 'stageStyleEventJoint',
)

const stageId = createModel('stageId')
const judgmentLineColor = createModel('judgmentLineColor')
const judgmentLineStyle = createModel('judgmentLineStyle')
const leftBorderStyle = createModel('leftBorderStyle')
const rightBorderStyle = createModel('rightBorderStyle')
const isFullWidth = createModel('isFullWidth')
const noteAlpha = createModel('noteAlpha')
const laneAlpha = createModel('laneAlpha')
const judgmentLineAlpha = createModel('judgmentLineAlpha')
const divisionLineAlpha = createModel('divisionLineAlpha')
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
        <MultiJudgmentLineStyleField v-model="judgmentLineStyle" />
        <MultiLeftBorderStyleField v-model="leftBorderStyle" />
        <MultiRightBorderStyleField v-model="rightBorderStyle" />
        <MultiIsFullWidthField v-model="isFullWidth" />
        <MultiNoteAlphaField v-model="noteAlpha" />
        <MultiLaneAlphaField v-model="laneAlpha" />
        <MultiJudgmentLineAlphaField v-model="judgmentLineAlpha" />
        <MultiDivisionLineAlphaField v-model="divisionLineAlpha" />
        <MultiEventEaseField v-model="eventEase" />
        <MultiBeatField v-model="beat" />
        <MultiEditorLaneField v-model="editorLane" />
    </PropertiesModal>
</template>
