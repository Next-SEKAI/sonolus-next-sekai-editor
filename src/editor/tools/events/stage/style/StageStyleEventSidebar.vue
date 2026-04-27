<script setup lang="ts">
import { defaultStageStyleEventProperties } from '.'
import { i18n } from '../../../../../i18n'
import CopyPropertiesField from '../../../../../modals/form/CopyPropertiesField.vue'
import OptionalEventEaseField from '../../../../../modals/form/OptionalEventEaseField.vue'
import OptionalJudgmentLineAlphaField from '../../../../../modals/form/OptionalJudgmentLineAlphaField.vue'
import OptionalJudgmentLineColorField from '../../../../../modals/form/OptionalJudgmentLineColorField.vue'
import OptionalLaneAlphaField from '../../../../../modals/form/OptionalLaneAlphaField.vue'
import OptionalLeftBorderStyleField from '../../../../../modals/form/OptionalLeftBorderStyleField.vue'
import OptionalRightBorderStyleField from '../../../../../modals/form/OptionalRightBorderStyleField.vue'
import OptionalStageAlphaField from '../../../../../modals/form/OptionalStageAlphaField.vue'
import { interpolateRaw } from '../../../../../utils/interpolate'
import BaseSidebar from '../../../../sidebars/BaseSidebar.vue'
import { useProperties } from '../../../../utils/properties'

const createModel = useProperties(defaultStageStyleEventProperties)

const judgmentLineColor = createModel('judgmentLineColor')
const leftBorderStyle = createModel('leftBorderStyle')
const rightBorderStyle = createModel('rightBorderStyle')
const stageAlpha = createModel('stageAlpha')
const laneAlpha = createModel('laneAlpha')
const judgmentLineAlpha = createModel('judgmentLineAlpha')
const eventEase = createModel('eventEase')
const copyProperties = createModel('copyProperties')
</script>

<template>
    <BaseSidebar
        :title="interpolateRaw(i18n.tools.events.sidebar.title, i18n.events.stageStyleEvent)"
    >
        <OptionalJudgmentLineColorField v-model="judgmentLineColor" />
        <OptionalLeftBorderStyleField v-model="leftBorderStyle" />
        <OptionalRightBorderStyleField v-model="rightBorderStyle" />
        <OptionalStageAlphaField v-model="stageAlpha" />
        <OptionalLaneAlphaField v-model="laneAlpha" />
        <OptionalJudgmentLineAlphaField v-model="judgmentLineAlpha" />
        <OptionalEventEaseField v-model="eventEase" />
        <CopyPropertiesField v-model="copyProperties" />
    </BaseSidebar>
</template>
