<script lang="ts">
const layers = {
    timeScale: 0,
    bpm: 1,

    cameraEventConnection: 10,
    cameraEventJoint: 11,

    stageMaskEventConnection: 12,
    stageMaskEventJoint: 13,

    stagePivotEventConnection: 14,
    stagePivotEventJoint: 15,

    connector: {
        bottom: {
            active: 20,
            guide: 21,
        },
        top: {
            active: 22,
            guide: 23,
        },
    },

    note: 30,
}

const getLayer = (entity: Entity) => {
    switch (entity.type) {
        case 'bpm':
        case 'cameraEventJoint':
        case 'cameraEventConnection':
        case 'stageMaskEventJoint':
        case 'stageMaskEventConnection':
        case 'stagePivotEventJoint':
        case 'stagePivotEventConnection':
        case 'timeScale':
        case 'note':
            return layers[entity.type]
        case 'connector':
            return layers.connector[entity.head.connectorLayer][entity.head.connectorType]
    }
}

const isEntityVisibleByGroup = (entity: Entity) => {
    if (view.groupId === undefined) return true

    switch (entity.type) {
        case 'bpm':
        case 'cameraEventJoint':
        case 'cameraEventConnection':
        case 'stageMaskEventJoint':
        case 'stageMaskEventConnection':
        case 'stagePivotEventJoint':
        case 'stagePivotEventConnection':
            return true
        case 'timeScale':
        case 'note':
            return entity.groupId === view.groupId
        case 'connector':
            return (
                entity.attachHead.groupId === view.groupId ||
                entity.attachTail.groupId === view.groupId
            )
    }
}

const isEntityVisibleByStage = (entity: Entity) => {
    if (view.stageId === undefined) return true

    switch (entity.type) {
        case 'bpm':
        case 'cameraEventJoint':
        case 'cameraEventConnection':
        case 'timeScale':
            return true
        case 'note':
        case 'stageMaskEventJoint':
        case 'stagePivotEventJoint':
            return entity.stageId === view.stageId
        case 'stageMaskEventConnection':
        case 'stagePivotEventConnection':
            return entity.min.stageId === view.stageId
        case 'connector':
            return (
                entity.attachHead.stageId === view.stageId ||
                entity.attachTail.stageId === view.stageId
            )
    }
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { entityComponents } from '.'
import { beats, keys } from '..'
import { selectedEntities } from '../../history/selectedEntities'
import { cullAllEntities } from '../../history/store'
import { settings } from '../../settings'
import type { Entity } from '../../state/entities'
import { hoveredEntities, view } from '../view'
import LevelEditorCameraEventInfinity from './events/camera/LevelEditorCameraEventInfinity.vue'
import LevelEditorStageMaskEventInfinities from './events/stage/mask/LevelEditorStageMaskEventInfinities.vue'
import LevelEditorStagePivotEventInfinities from './events/stage/pivot/LevelEditorStagePivotEventInfinities.vue'

const culledEntities = computed(() => [...cullAllEntities(keys.value.min, keys.value.max)])

const visibleEntities = computed(() =>
    culledEntities.value.filter((entity) => {
        switch (entity.type) {
            case 'bpm':
            case 'cameraEventJoint':
            case 'stageMaskEventJoint':
            case 'stagePivotEventJoint':
            case 'timeScale':
            case 'note':
                return entity.beat >= beats.value.min && entity.beat <= beats.value.max
            case 'cameraEventConnection':
            case 'stageMaskEventConnection':
            case 'stagePivotEventConnection':
                return entity.min.beat <= beats.value.max && entity.max.beat >= beats.value.min
            case 'connector':
                return entity.head.beat <= beats.value.max && entity.tail.beat >= beats.value.min
        }
    }),
)

const visibleEntityInfos = computed(() => {
    let entities = visibleEntities.value.map((entity) => ({
        entity,
        isSelected: selectedEntities.value.includes(entity),
        isHovered: hoveredEntities.value.includes(entity),
        isVisibleByGroup: isEntityVisibleByGroup(entity),
        isVisibleByStage: isEntityVisibleByStage(entity),
        layer: getLayer(entity),
    }))

    if (!settings.showOtherGroups) {
        entities = entities.filter((entity) => entity.isVisibleByGroup)
    }

    if (!settings.showOtherStages) {
        entities = entities.filter((entity) => entity.isVisibleByStage)
    }

    return entities.sort(
        (a, b) =>
            +a.isSelected - +b.isSelected || a.layer - b.layer || b.entity.beat - a.entity.beat,
    )
})
</script>

<template>
    <LevelEditorCameraEventInfinity />
    <LevelEditorStageMaskEventInfinities />
    <LevelEditorStagePivotEventInfinities />

    <component
        :is="entityComponents[entity.type]"
        v-for="{
            entity,
            isSelected,
            isHovered,
            isVisibleByGroup,
            isVisibleByStage,
        } in visibleEntityInfos"
        :key="entity as never"
        :entity="entity as never"
        :is-highlighted="isSelected || isHovered"
        :opacity="isVisibleByGroup && isVisibleByStage ? 1 : 0.25"
    />
</template>
