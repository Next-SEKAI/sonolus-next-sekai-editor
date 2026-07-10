<script setup lang="ts">
import { defaultStageStyleEventProperties } from '.'
import CopyPropertiesField from '../../../../../modals/form/CopyPropertiesField.vue'
import OptionalDivisionLineAlphaField from '../../../../../modals/form/OptionalDivisionLineAlphaField.vue'
import OptionalEventEaseField from '../../../../../modals/form/OptionalEventEaseField.vue'
import OptionalIsFullWidthField from '../../../../../modals/form/OptionalIsFullWidthField.vue'
import OptionalJudgmentLineAlphaField from '../../../../../modals/form/OptionalJudgmentLineAlphaField.vue'
import OptionalJudgmentLineColorField from '../../../../../modals/form/OptionalJudgmentLineColorField.vue'
import OptionalJudgmentLineStyleField from '../../../../../modals/form/OptionalJudgmentLineStyleField.vue'
import OptionalLaneAlphaField from '../../../../../modals/form/OptionalLaneAlphaField.vue'
import OptionalLeftBorderStyleField from '../../../../../modals/form/OptionalLeftBorderStyleField.vue'
import OptionalRightBorderStyleField from '../../../../../modals/form/OptionalRightBorderStyleField.vue'
import OptionalStageAlphaField from '../../../../../modals/form/OptionalStageAlphaField.vue'
import { useProperties } from '../../../../utils/properties'

const createModel = useProperties(defaultStageStyleEventProperties)

const judgmentLineColor = createModel('judgmentLineColor')
const judgmentLineStyle = createModel('judgmentLineStyle')
const leftBorderStyle = createModel('leftBorderStyle')
const rightBorderStyle = createModel('rightBorderStyle')
const isFullWidth = createModel('isFullWidth')
const stageAlpha = createModel('stageAlpha')
const laneAlpha = createModel('laneAlpha')
const judgmentLineAlpha = createModel('judgmentLineAlpha')
const divisionLineAlpha = createModel('divisionLineAlpha')
const eventEase = createModel('eventEase')
const copyProperties = createModel('copyProperties')
</script>

<template>
    <OptionalJudgmentLineColorField v-model="judgmentLineColor" />
    <OptionalJudgmentLineStyleField v-model="judgmentLineStyle" />
    <OptionalLeftBorderStyleField v-model="leftBorderStyle" />
    <OptionalRightBorderStyleField v-model="rightBorderStyle" />
    <OptionalIsFullWidthField v-model="isFullWidth" />
    <OptionalStageAlphaField v-model="stageAlpha" />
    <OptionalLaneAlphaField v-model="laneAlpha" />
    <OptionalJudgmentLineAlphaField v-model="judgmentLineAlpha" />
    <OptionalDivisionLineAlphaField v-model="divisionLineAlpha" />
    <OptionalEventEaseField v-model="eventEase" />
    <CopyPropertiesField v-model="copyProperties" />
</template>
