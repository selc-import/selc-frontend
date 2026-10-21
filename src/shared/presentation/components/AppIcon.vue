<script setup lang="ts">
import { icons, type IconName } from '../icons'
import '../ui.css'

withDefaults(defineProps<{ name: IconName; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })
const sizes = { sm: 16, md: 18, lg: 20 } as const
</script>

<template>
  <component :is="icons[name]" class="ui-icon" :data-icon="name" :size="sizes[size]" :stroke-width="1.75" aria-hidden="true" focusable="false" />
</template>
