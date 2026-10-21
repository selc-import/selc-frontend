<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import type { Generation } from '../../domain/product'
import { motion } from '../../../shared/motion/tokens'
import { useReducedMotion } from '../../../shared/composables/useReducedMotion'

const props = defineProps<{ modelValue: Generation | 'all' }>()
const emit = defineEmits<{ 'update:modelValue': [value: Generation | 'all'] }>()
const generations = ['all', 17, 16, 15, 14] as const
const root = ref<HTMLElement>()
const indicator = ref<HTMLElement>()
const ready = ref(false)
const reducedMotion = useReducedMotion()
let context: gsap.Context | undefined
let tween: gsap.core.Tween | undefined
let observer: ResizeObserver | undefined

function positionIndicator(animate = true) {
  const selected = root.value?.querySelector<HTMLElement>(`[data-generation="${props.modelValue}"]`)
  if (!selected || !indicator.value || !context) return
  const position = { x: selected.offsetLeft, width: selected.offsetWidth, opacity: 1 }
  context.add(() => {
    tween?.kill()
    if (ready.value && animate && !reducedMotion.value) {
      tween = gsap.to(indicator.value!, { ...position, duration: motion.normal, ease: motion.ease, overwrite: true })
    } else gsap.set(indicator.value!, position)
  })
  ready.value = true
}

function onKeydown(event: KeyboardEvent) {
  const buttons = [...root.value!.querySelectorAll<HTMLButtonElement>('button')]
  const index = buttons.indexOf(event.target as HTMLButtonElement)
  if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length
  buttons[next].focus()
  emit('update:modelValue', generations[next])
}

watch(() => props.modelValue, () => positionIndicator(), { flush: 'post' })
watch(reducedMotion, () => positionIndicator(false), { flush: 'post' })
onMounted(() => {
  context = gsap.context(() => {}, root.value)
  positionIndicator(false)
  observer = new ResizeObserver(() => positionIndicator(false))
  observer.observe(root.value!)
})
onBeforeUnmount(() => { observer?.disconnect(); context?.revert() })
</script>

<template>
  <div ref="root" class="generation-filter" :class="{ 'generation-filter--ready': ready }" role="group" aria-label="Filtrar por generación de iPhone" @keydown="onKeydown">
    <span ref="indicator" class="generation-indicator" aria-hidden="true"></span>
    <button v-for="item in generations" :key="item" type="button" :data-generation="item" :aria-pressed="modelValue === item" aria-controls="catalog-products" :class="{ 'filter-active': modelValue === item }" @click="emit('update:modelValue', item)">{{ item === 'all' ? 'Todos' : `iPhone ${item}` }}</button>
  </div>
</template>
