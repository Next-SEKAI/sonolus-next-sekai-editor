<script setup lang="ts">
import { entityComponents } from '.'
import { view } from '../view'
</script>

<template>
    <g opacity="0.5">
        <component
            :is="entityComponents[entity.type]"
            v-for="entity in view.entities.creating"
            :key="entity as never"
            :entity="entity as never"
            is-highlighted
        />
    </g>
</template>
