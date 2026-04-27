<script setup lang="ts">
import { i18n } from '../../../../../i18n'
import CopyPropertiesField from '../../../../../modals/form/CopyPropertiesField.vue'
import OptionalEventEaseField from '../../../../../modals/form/OptionalEventEaseField.vue'
import PropertiesModal from '../../../../../modals/form/PropertiesModal.vue'
import { interpolateRaw } from '../../../../../utils/interpolate'
import { defaultStageStyleEventProperties } from '../../../../tools/events/stage/style'
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
    <PropertiesModal
        :title="interpolateRaw(i18n.commands.events.modal.title, i18n.events.stageStyleEvent)"
    >
        <OptionalJudgmentLineColorField v-model="judgmentLineColor" />
        <OptionalLeftBorderStyleField v-model="leftBorderStyle" />
        <OptionalRightBorderStyleField v-model="rightBorderStyle" />
        <OptionalStageAlphaField v-model="stageAlpha" />
        <OptionalLaneAlphaField v-model="laneAlpha" />
        <OptionalJudgmentLineAlphaField v-model="judgmentLineAlpha" />
        <OptionalEventEaseField v-model="eventEase" />
        <CopyPropertiesField v-model="copyProperties" />
    </PropertiesModal>
</template>
