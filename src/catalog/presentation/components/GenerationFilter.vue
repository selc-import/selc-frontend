<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import type { CatalogFilter } from '../../domain/product'
import { motion } from '../../../shared/motion/tokens'
import { useReducedMotion } from '../../../shared/composables/useReducedMotion'

const props = defineProps<{ modelValue: CatalogFilter; options: readonly { value: CatalogFilter; label: string }[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: CatalogFilter] }>()
const root = ref<HTMLElement>()
const indicator = ref<HTMLElement>()
const ready = ref(false)
const reducedMotion = useReducedMotion()
let context: gsap.Context | undefined
let tween: gsap.core.Tween | undefined
let observer: ResizeObserver | undefined

function positionIndicator(animate = true) {
  const selected = root.value?.querySelector<HTMLElement>('button[aria-pressed="true"]')
  if (!selected || !indicator.value || !context) return
  const position = { x: selected.offsetLeft, y: selected.offsetTop, width: selected.offsetWidth, height: selected.offsetHeight, opacity: 1 }
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
  emit('update:modelValue', props.options[next].value)
}

watch([() => props.modelValue, () => props.options], () => positionIndicator(), { flush: 'post' })
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
  <div ref="root" class="generation-filter" :class="{ 'generation-filter--ready': ready }" role="group" aria-label="Filtrar por categoría de producto" @keydown="onKeydown">
    <span ref="indicator" class="generation-indicator" aria-hidden="true"></span>
    <button v-for="item in options" :key="item.value" type="button" :data-generation="item.value" :aria-pressed="modelValue === item.value" aria-controls="catalog-products catalog-accessories-products" :class="{ 'filter-active': modelValue === item.value }" @click="emit('update:modelValue', item.value)">{{ item.label }}</button>
  </div>
</template>
