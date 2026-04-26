<script setup lang="ts">
import { i18n } from '../../../../../i18n'
import CopyPropertiesField from '../../../../../modals/form/CopyPropertiesField.vue'
import OptionalEventEaseField from '../../../../../modals/form/OptionalEventEaseField.vue'
import OptionalMaskSizeField from '../../../../../modals/form/OptionalMaskSizeField.vue'
import PropertiesModal from '../../../../../modals/form/PropertiesModal.vue'
import { interpolateRaw } from '../../../../../utils/interpolate'
import { defaultStageMaskEventProperties } from '../../../../tools/events/stage/mask'
import { useProperties } from '../../../../utils/properties'

const createModel = useProperties(defaultStageMaskEventProperties)

const maskSize = createModel('maskSize')
const eventEase = createModel('eventEase')
const copyProperties = createModel('copyProperties')
</script>

<template>
    <PropertiesModal
        :title="interpolateRaw(i18n.commands.events.modal.title, i18n.events.stageMaskEvent)"
    >
        <OptionalMaskSizeField v-model="maskSize" />
        <OptionalEventEaseField v-model="eventEase" />
        <CopyPropertiesField v-model="copyProperties" />
    </PropertiesModal>
</template>
