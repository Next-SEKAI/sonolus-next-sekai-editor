<script lang="ts">
const layers = {
    timeScale: 0,
    bpm: 1,

    connector: 10,
    note: 11,
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { entityComponents } from '.'
import { beats, keys } from '..'
import { selectedEntities } from '../../history/selectedEntities'
import { cullAllEntities } from '../../history/store'
import type { Entity } from '../../state/entities'
import { hoveredEntities, view } from '../view'

const isEntityVisible = (entity: Entity) => {
    if (view.group === undefined) return true

    switch (entity.type) {
        case 'bpm':
            return true
        case 'timeScale':
        case 'note':
            return entity.group === view.group
        case 'connector':
            return entity.attachHead.group === view.group || entity.attachTail.group === view.group
    }
}

const culledEntities = computed(() => [...cullAllEntities(keys.value.min, keys.value.max)])

const visibleEntities = computed(() =>
    culledEntities.value.filter((entity) => {
        switch (entity.type) {
            case 'bpm':
            case 'timeScale':
            case 'note':
                return entity.beat >= beats.value.min && entity.beat <= beats.value.max
            case 'connector':
                return entity.head.beat <= beats.value.max && entity.tail.beat >= beats.value.min
        }
    }),
)

const visibleEntityInfos = computed(() =>
    visibleEntities.value
        .map((entity) => ({
            entity,
            isSelected: selectedEntities.value.includes(entity),
            isHovered: hoveredEntities.value.includes(entity),
            isVisible: isEntityVisible(entity),
        }))
        .sort(
            (a, b) =>
                +a.isSelected - +b.isSelected ||
                layers[a.entity.type] - layers[b.entity.type] ||
                b.entity.beat - a.entity.beat,
        ),
)
</script>

<template>
    <component
        :is="entityComponents[entity.type]"
        v-for="{ entity, isSelected, isHovered, isVisible } in visibleEntityInfos"
        :key="entity as never"
        :entity="entity as never"
        :is-highlighted="isSelected || isHovered"
        :opacity="isVisible ? 1 : 0.25"
    />
</template>
