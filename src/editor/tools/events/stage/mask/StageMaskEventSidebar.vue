<script setup lang="ts">
import { defaultStageMaskEventProperties } from '.'
import { i18n } from '../../../../../i18n'
import CopyPropertiesField from '../../../../../modals/form/CopyPropertiesField.vue'
import OptionalEventEaseField from '../../../../../modals/form/OptionalEventEaseField.vue'
import OptionalMaskSizeField from '../../../../../modals/form/OptionalMaskSizeField.vue'
import { interpolateRaw } from '../../../../../utils/interpolate'
import BaseSidebar from '../../../../sidebars/BaseSidebar.vue'
import { useProperties } from '../../../../utils/properties'

const createModel = useProperties(defaultStageMaskEventProperties)

const maskSize = createModel('maskSize')
const eventEase = createModel('eventEase')
const copyProperties = createModel('copyProperties')
</script>

<template>
    <BaseSidebar
        :title="interpolateRaw(i18n.tools.events.sidebar.title, i18n.events.stageMaskEvent)"
    >
        <OptionalMaskSizeField v-model="maskSize" />
        <OptionalEventEaseField v-model="eventEase" />
        <CopyPropertiesField v-model="copyProperties" />
    </BaseSidebar>
</template>
