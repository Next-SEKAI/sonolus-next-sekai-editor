<script setup lang="ts">
import { i18n } from '../../../../../i18n'
import MultiBeatField from '../../../../../modals/form/MultiBeatField.vue'
import MultiEventEaseField from '../../../../../modals/form/MultiEventEaseField.vue'
import MultiMaskLeftField from '../../../../../modals/form/MultiMaskLeftField.vue'
import MultiMaskSizeField from '../../../../../modals/form/MultiMaskSizeField.vue'
import MultiStageField from '../../../../../modals/form/MultiStageField.vue'
import PropertiesModal from '../../../../../modals/form/PropertiesModal.vue'
import { interpolateRaw } from '../../../../../utils/interpolate'
import { useSelectedEntitiesProperties } from '../../../../utils/properties'

const { createModel } = useSelectedEntitiesProperties(
    (entity) => entity.type === 'stageMaskEventJoint',
)

const stageId = createModel('stageId')
const maskLeft = createModel('maskLeft')
const maskSize = createModel('maskSize')
const eventEase = createModel('eventEase')
const beat = createModel('beat')
</script>

<template>
    <PropertiesModal
        :title="interpolateRaw(i18n.tools.events.modal.title, i18n.events.stageMaskEvent)"
    >
        <MultiStageField v-model="stageId" />
        <MultiMaskLeftField v-model="maskLeft" />
        <MultiMaskSizeField v-model="maskSize" />
        <MultiEventEaseField v-model="eventEase" />
        <MultiBeatField v-model="beat" />
    </PropertiesModal>
</template>
