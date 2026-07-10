<script setup lang="ts">
import { defaultStageMaskEventProperties } from '.'
import CopyPropertiesField from '../../../../../modals/form/CopyPropertiesField.vue'
import OptionalEventEaseField from '../../../../../modals/form/OptionalEventEaseField.vue'
import OptionalMaskSizeField from '../../../../../modals/form/OptionalMaskSizeField.vue'
import { useProperties } from '../../../../utils/properties'

const createModel = useProperties(defaultStageMaskEventProperties)

const maskSize = createModel('maskSize')
const eventEase = createModel('eventEase')
const copyProperties = createModel('copyProperties')
</script>

<template>
    <OptionalMaskSizeField v-model="maskSize" />
    <OptionalEventEaseField v-model="eventEase" />
    <CopyPropertiesField v-model="copyProperties" />
</template>
