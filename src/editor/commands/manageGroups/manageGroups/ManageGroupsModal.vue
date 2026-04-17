<script setup lang="ts">
import { pushState, state } from '../../../../history'
import { groups } from '../../../../history/groups'
import { i18n } from '../../../../i18n'
import BaseModal from '../../../../modals/BaseModal.vue'
import BaseField from '../../../../modals/form/BaseField.vue'
import { addToGroups } from '../../../../state/groups'
import { interpolate } from '../../../../utils/interpolate'
import { notify } from '../../../notification'

const onAdd = () => {
    const newGroups = new Map(groups.value)
    const [, name] = addToGroups(newGroups)

    pushState(
        interpolate(() => i18n.value.commands.manageGroups.modal.added, name),
        {
            ...state.value,
            groups: newGroups,
        },
    )

    notify(interpolate(() => i18n.value.commands.manageGroups.modal.added, name))
}
</script>

<template>
    <BaseModal :title="i18n.commands.manageGroups.modal.title">
        <div class="flex flex-col gap-2">
            <BaseField v-for="[group, { name }] in groups" :key="group" :label="name">
                <div class="flex gap-1"></div>
            </BaseField>
        </div>
        <div class="flex justify-end">
            <button
                class="w-32 rounded-full bg-button px-4 py-1 shadow-md transition-colors hover:shadow-accent active:bg-accent active:text-button"
                @click="onAdd"
            >
                {{ i18n.commands.manageGroups.modal.add }}
            </button>
        </div>
    </BaseModal>
</template>
