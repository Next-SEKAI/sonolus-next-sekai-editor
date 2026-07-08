<script setup lang="ts">
import { i18n } from '../../../../../i18n/index.ts'
import MultiBeatField from '../../../../../modals/form/MultiBeatField.vue'
import MultiEventEaseField from '../../../../../modals/form/MultiEventEaseField.vue'
import MultiStageField from '../../../../../modals/form/MultiStageField.vue'
import PropertiesModal from '../../../../../modals/form/PropertiesModal.vue'
import { interpolateRaw } from '../../../../../utils/interpolate.ts'
import { useSelectedEntitiesProperties } from '../../../../utils/properties.ts'
import MultiRotationField from '../../../../../modals/form/MultiRotationField.vue'
import MultiXTranslationField from '../../../../../modals/form/MultiXTranslationField.vue'
import MultiYTranslationField from '../../../../../modals/form/MultiYTranslationField.vue'
import MultiAnchorField from '../../../../../modals/form/MultiAnchorField.vue'

const { createModel } = useSelectedEntitiesProperties(
    (entity) => entity.type === 'stageTransformEventJoint',
)

const stageId = createModel('stageId')
const rotation = createModel('rotation')
const xTranslation = createModel('xTranslation')
const yTranslation = createModel('yTranslation')
const anchor = createModel('anchor')
const eventEase = createModel('eventEase')
const beat = createModel('beat')
</script>

<template>
    <PropertiesModal
        :title="interpolateRaw(i18n.tools.events.modal.title, i18n.events.stageTransformEvent)"
    >
        <MultiStageField v-model="stageId" />
        <MultiRotationField v-model="rotation" />
        <MultiXTranslationField v-model="xTranslation" />
        <MultiYTranslationField v-model="yTranslation" />
        <MultiAnchorField v-model="anchor" />
        <MultiEventEaseField v-model="eventEase" />
        <MultiBeatField v-model="beat" />
    </PropertiesModal>
</template>
