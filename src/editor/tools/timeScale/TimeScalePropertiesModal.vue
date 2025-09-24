<script setup lang="ts">
import { i18n } from '../../../i18n'
import MultiBeatField from '../../../modals/form/MultiBeatField.vue'
import MultiGroupField from '../../../modals/form/MultiGroupField.vue'
import MultiHideNotesField from '../../../modals/form/MultiHideNotesField.vue'
import MultiSkipField from '../../../modals/form/MultiSkipField.vue'
import MultiTimeScaleEaseField from '../../../modals/form/MultiTimeScaleEaseField.vue'
import MultiTimeScaleField from '../../../modals/form/MultiTimeScaleField.vue'
import PropertiesModal from '../../../modals/form/PropertiesModal.vue'
import { useSelectedEntitiesProperties } from '../../utils/properties'

const { entities, createModel } = useSelectedEntitiesProperties(
    (entity) => entity.type === 'timeScale',
)

const timeScale = createModel('timeScale')
const skip = createModel('skip')
const ease = createModel('ease')
const hideNotes = createModel('hideNotes')
const group = createModel('group')
const beat = createModel('beat')
</script>

<template>
    <PropertiesModal :title="i18n.tools.timeScale.modal.title">
        <MultiTimeScaleField v-model="timeScale" />
        <MultiSkipField v-model="skip" />
        <MultiTimeScaleEaseField v-model="ease" />
        <MultiHideNotesField v-model="hideNotes" />
        <MultiGroupField v-model="group" />
        <MultiBeatField v-if="entities.length === 1" v-model="beat" />
    </PropertiesModal>
</template>
