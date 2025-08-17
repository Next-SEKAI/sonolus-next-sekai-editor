<script setup lang="ts">
import LevelEditorHitbox from './entities/LevelEditorHitbox.vue'
import { hoveredEntities } from './view'
</script>

<template>
    <template v-for="entity in hoveredEntities" :key="entity">
        <LevelEditorHitbox v-if="entity.hitbox" :hitbox="entity.hitbox" stroke-opacity="0.5" />
    </template>
</template>
