<script setup lang="ts">
import { ref } from 'vue'
import { i18n } from '../../../i18n'
import FormModal from '../../../modals/form/FormModal.vue'
import NumberField from '../../../modals/form/NumberField.vue'
import { view } from '../../view'

defineEmits<{
    close: [division?: number]
}>()

const model = ref(view.division)
</script>

<template>
    <FormModal
        :title="i18n.commands.divisions.custom.modal.title"
        @close="$emit('close')"
        @submit="$emit('close', model)"
    >
        <NumberField
            v-model="model"
            :label="i18n.commands.divisions.custom.modal.division"
            :min="1"
            :step="1"
        />
    </FormModal>
</template>
