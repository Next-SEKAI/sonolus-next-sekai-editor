<script setup lang="ts">
import { pushState, state } from '../../../../history'
import { groups } from '../../../../history/groups'
import { store } from '../../../../history/store'
import { i18n } from '../../../../i18n'
import { getStoreEntities } from '../../../../levelData/entities/serialize'
import { showModal } from '../../../../modals'
import BaseModal from '../../../../modals/BaseModal.vue'
import BaseField from '../../../../modals/form/BaseField.vue'
import { addToGroups, type GroupId } from '../../../../state/groups'
import { removeNote } from '../../../../state/mutations/slides/note'
import { removeTimeScale } from '../../../../state/mutations/timeScale'
import { createTransaction } from '../../../../state/transaction'
import { interpolate } from '../../../../utils/interpolate'
import { notify } from '../../../notification'
import { updateViewLastActive, view } from '../../../view'
import DeleteIcon from './DeleteIcon.vue'
import GroupPropertiesModal from './groupProperties/GroupPropertiesModal.vue'
import HiddenIcon from './HiddenIcon.vue'
import MoveDownIcon from './MoveDownIcon.vue'
import MoveUpIcon from './MoveUpIcon.vue'
import PropertiesIcon from './PropertiesIcon.vue'
import VisibleIcon from './VisibleIcon.vue'

const onSwitch = (group: GroupId, name: string) => {
    if (view.group === group) {
        view.group = undefined
        updateViewLastActive()

        notify(() => i18n.value.commands.manageGroups.modal.switched.all)
    } else {
        view.group = group
        updateViewLastActive()

        notify(interpolate(() => i18n.value.commands.manageGroups.modal.switched.one, name))
    }
}

const onMove = (group: GroupId, name: string, offset: -1 | 1) => {
    const entries = [...groups.value.entries()]

    const aIndex = entries.findIndex((entry) => entry[0] === group)
    const aEntry = entries[aIndex]
    if (!aEntry) return

    const bIndex = aIndex + offset
    const bEntry = entries[bIndex]
    if (!bEntry) return

    entries[aIndex] = bEntry
    entries[bIndex] = aEntry

    pushState(
        interpolate(() => i18n.value.commands.manageGroups.modal.moved, name),
        {
            ...state.value,
            groups: new Map(entries),
        },
    )

    notify(interpolate(() => i18n.value.commands.manageGroups.modal.moved, name))
}

const onProperties = (group: GroupId) => {
    void showModal(GroupPropertiesModal, {
        group,
    })
}

const onDelete = (group: GroupId, name: string) => {
    const transaction = createTransaction(state.value)

    for (const entity of getStoreEntities(store.value.grid.timeScale)) {
        if (entity.group !== group) continue

        removeTimeScale(transaction, entity)
    }

    for (const entity of getStoreEntities(store.value.grid.note)) {
        if (entity.group !== group) continue

        removeNote(transaction, entity)
    }

    const newState = transaction.commit([])

    newState.groups = new Map(newState.groups)
    newState.groups.delete(group)
    if (!newState.groups.size) addToGroups(newState.groups)

    pushState(
        interpolate(() => i18n.value.commands.manageGroups.modal.deleted, name),
        newState,
    )
    view.entities = {
        hovered: [],
        creating: [],
    }

    notify(interpolate(() => i18n.value.commands.manageGroups.modal.deleted, name))
}

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
                <div class="flex gap-1">
                    <button
                        class="rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
                        :title="i18n.commands.manageGroups.modal.switch"
                        @click="onSwitch(group, name)"
                    >
                        <component
                            :is="!view.group || view.group === group ? VisibleIcon : HiddenIcon"
                            class="size-4"
                        />
                    </button>
                    <button
                        class="rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
                        :title="i18n.commands.manageGroups.modal.moveUp"
                        @click="onMove(group, name, -1)"
                    >
                        <MoveUpIcon class="size-4" />
                    </button>
                    <button
                        class="rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
                        :title="i18n.commands.manageGroups.modal.moveDown"
                        @click="onMove(group, name, 1)"
                    >
                        <MoveDownIcon class="size-4" />
                    </button>
                    <button
                        class="rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
                        :title="i18n.commands.manageGroups.modal.properties.title"
                        @click="onProperties(group)"
                    >
                        <PropertiesIcon class="size-4" />
                    </button>
                    <button
                        class="rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
                        :title="i18n.commands.manageGroups.modal.delete"
                        @click="onDelete(group, name)"
                    >
                        <DeleteIcon class="size-4" />
                    </button>
                </div>
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
