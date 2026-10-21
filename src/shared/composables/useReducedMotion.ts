import { onMounted, onUnmounted, ref } from 'vue'

/** Read before child mounting, and react to changes during the session. */
export function useReducedMotion() {
  const query = typeof window === 'undefined' ? undefined : window.matchMedia('(prefers-reduced-motion: reduce)')
  const reducedMotion = ref(query?.matches ?? false)
  const update = (event: MediaQueryListEvent) => { reducedMotion.value = event.matches }
  onMounted(() => query?.addEventListener('change', update))
  onUnmounted(() => query?.removeEventListener('change', update))
  return reducedMotion
}
