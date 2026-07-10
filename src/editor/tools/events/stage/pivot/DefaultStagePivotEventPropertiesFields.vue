<script setup lang="ts">
import { defaultStagePivotEventProperties } from '.'
import CopyPropertiesField from '../../../../../modals/form/CopyPropertiesField.vue'
import OptionalDivisionParityField from '../../../../../modals/form/OptionalDivisionParityField.vue'
import OptionalDivisionSizeField from '../../../../../modals/form/OptionalDivisionSizeField.vue'
import OptionalEventEaseField from '../../../../../modals/form/OptionalEventEaseField.vue'
import OptionalYOffsetBeatField from '../../../../../modals/form/OptionalYOffsetBeatField.vue'
import OptionalYOffsetField from '../../../../../modals/form/OptionalYOffsetField.vue'
import { useProperties } from '../../../../utils/properties'

const createModel = useProperties(defaultStagePivotEventProperties)

const divisionSize = createModel('divisionSize')
const divisionParity = createModel('divisionParity')
const yOffset = createModel('yOffset')
const yOffsetBeat = createModel('yOffsetBeat')
const eventEase = createModel('eventEase')
const copyProperties = createModel('copyProperties')
</script>

<template>
    <OptionalDivisionSizeField v-model="divisionSize" />
    <OptionalDivisionParityField v-model="divisionParity" />
    <OptionalYOffsetField v-model="yOffset" />
    <OptionalYOffsetBeatField v-model="yOffsetBeat" />
    <OptionalEventEaseField v-model="eventEase" />
    <CopyPropertiesField v-model="copyProperties" />
</template>
