<script setup lang="ts">
import type { IconName } from '../icons'
import { motionCssVars } from '../../motion/tokens'
import AppIcon from './AppIcon.vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon'
  href?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  leadingIcon?: IconName
  trailingIcon?: IconName
}>(), { variant: 'primary', disabled: false, type: 'button' })
const emit = defineEmits<{ click: [event: MouseEvent] }>()
function onClick(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault()
    event.stopImmediatePropagation()
    return
  }
  emit('click', event)
}
</script>

<template>
  <component :is="href ? 'a' : 'button'" class="ui-button" :class="`ui-button--${variant}`" :style="motionCssVars" :href="disabled ? undefined : href" :type="href ? undefined : type" :disabled="!href && disabled ? true : undefined" :aria-disabled="disabled ? true : undefined" :tabindex="href && disabled ? -1 : undefined" @click="onClick">
    <AppIcon v-if="leadingIcon" :name="leadingIcon" class="ui-button__leading" />
    <slot />
    <AppIcon v-if="trailingIcon" :name="trailingIcon" class="ui-button__trailing" />
  </component>
</template>
