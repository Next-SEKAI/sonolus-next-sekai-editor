<script setup lang="ts">
import { i18n } from '../../../../../i18n'
import MultiBeatField from '../../../../../modals/form/MultiBeatField.vue'
import MultiDivisionParityField from '../../../../../modals/form/MultiDivisionParityField.vue'
import MultiDivisionSizeField from '../../../../../modals/form/MultiDivisionSizeField.vue'
import MultiEventEaseField from '../../../../../modals/form/MultiEventEaseField.vue'
import MultiPivotLaneField from '../../../../../modals/form/MultiPivotLaneField.vue'
import MultiStageField from '../../../../../modals/form/MultiStageField.vue'
import MultiYOffsetBeatField from '../../../../../modals/form/MultiYOffsetBeatField.vue'
import MultiYOffsetField from '../../../../../modals/form/MultiYOffsetField.vue'
import PropertiesModal from '../../../../../modals/form/PropertiesModal.vue'
import { interpolateRaw } from '../../../../../utils/interpolate'
import { useSelectedEntitiesProperties } from '../../../../utils/properties'

const { createModel } = useSelectedEntitiesProperties(
    (entity) => entity.type === 'stagePivotEventJoint',
)

const stageId = createModel('stageId')
const pivotLane = createModel('pivotLane')
const divisionSize = createModel('divisionSize')
const divisionParity = createModel('divisionParity')
const yOffset = createModel('yOffset')
const yOffsetBeat = createModel('yOffsetBeat')
const eventEase = createModel('eventEase')
const beat = createModel('beat')
</script>

<template>
    <PropertiesModal
        :title="interpolateRaw(i18n.tools.events.modal.title, i18n.events.stagePivotEvent)"
    >
        <MultiStageField v-model="stageId" />
        <MultiPivotLaneField v-model="pivotLane" />
        <MultiDivisionSizeField v-model="divisionSize" />
        <MultiDivisionParityField v-model="divisionParity" />
        <MultiYOffsetField v-model="yOffset" />
        <MultiYOffsetBeatField v-model="yOffsetBeat" />
        <MultiEventEaseField v-model="eventEase" />
        <MultiBeatField v-model="beat" />
    </PropertiesModal>
</template>
