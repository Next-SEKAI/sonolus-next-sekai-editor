<script setup lang="ts">
import { i18n } from '../../../i18n'
import MultiBeatField from '../../../modals/form/MultiBeatField.vue'
import MultiBpmField from '../../../modals/form/MultiBpmField.vue'
import PropertiesModal from '../../../modals/form/PropertiesModal.vue'
import { useSelectedEntitiesProperties } from '../../utils/properties'

const { entities, createModel } = useSelectedEntitiesProperties((entity) => entity.type === 'bpm')

const bpm = createModel('bpm')
const beat = createModel('beat')
</script>

<template>
    <PropertiesModal :title="i18n.tools.bpm.modal.title">
        <MultiBpmField v-model="bpm" />
        <MultiBeatField v-if="entities.length === 1" v-model="beat" />
    </PropertiesModal>
</template>
