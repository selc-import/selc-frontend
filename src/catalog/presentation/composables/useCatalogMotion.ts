import { onBeforeUnmount, watch, type Ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../../shared/composables/useReducedMotion'
import { motion } from '../../../shared/motion/tokens'

gsap.registerPlugin(ScrollTrigger)

export function useCatalogMotion(root: Ref<HTMLElement | undefined>, productIds: Ref<string>) {
  const reducedMotion = useReducedMotion()
  let context: gsap.Context | undefined
  let refreshFrame: number | undefined
  // The heading belongs to the page lifecycle, not the current filter result.
  const stop = watch([root, reducedMotion], () => {
    context?.revert()
    if (!root.value || reducedMotion.value) return
    context = gsap.context(() => {
      gsap.from('.catalog-heading', {
        y: 24, opacity: 0.35, ease: 'none',
        scrollTrigger: { trigger: root.value, start: 'top 95%', end: 'top 35%', scrub: 0.5 },
      })
    }, root.value)
  }, { flush: 'post', immediate: true })
  const refreshLayout = () => {
    if (refreshFrame !== undefined) return
    // Wait for scrolling to settle when async promos change the section height.
    refreshFrame = requestAnimationFrame(() => { refreshFrame = undefined; ScrollTrigger.refresh(true) })
  }
  const stopLayout = watch(productIds, refreshLayout, { flush: 'post' })
  onBeforeUnmount(() => {
    stop(); stopLayout(); context?.revert()
    if (refreshFrame !== undefined) cancelAnimationFrame(refreshFrame)
  })
  return { refreshLayout }
}

/** Each card owns its reveal. Filtering never restarts a retained card or the heading. */
export function useProductCardMotion(root: Ref<HTMLElement | undefined>, order: () => number) {
  const reducedMotion = useReducedMotion()
  let context: gsap.Context | undefined
  let revealed = false
  const stop = watch([root, reducedMotion], () => {
    context?.revert()
    if (!root.value || reducedMotion.value || revealed) return
    const card = root.value
    context = gsap.context(() => {
      const animation = gsap.from(card, {
        y: motion.enterY, opacity: 0.4, duration: motion.slow,
        delay: (order() % 3) * motion.stagger, ease: motion.ease,
        scrollTrigger: { trigger: card, start: 'top 96%', once: true },
        onComplete: () => { revealed = true },
      })
      const reveal = () => { animation.progress(1); animation.scrollTrigger?.kill() }
      card.addEventListener('focusin', reveal)
      return () => card.removeEventListener('focusin', reveal)
    }, card)
  }, { flush: 'post', immediate: true })
  onBeforeUnmount(() => { stop(); context?.revert() })
}
