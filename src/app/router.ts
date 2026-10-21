import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import StorefrontView from './views/StorefrontView.vue'
export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'storefront', component: StorefrontView },
    { path: '/iphone/:productId', name: 'product', component: () => import('./views/ProductRouteView.vue') },
    { path: '/:pathMatch(.*)*', component: () => import('./views/ProductRouteView.vue') },
  ],
  async scrollBehavior(to, from, savedPosition) {
    await nextTick()
    const returningToProduct = to.name === 'storefront' && from.name === 'product' && window.history.state?.forward === from.fullPath
    const returnPosition = savedPosition ?? (returningToProduct ? window.history.state?.scroll : undefined)
    if (returnPosition) {
      if (returningToProduct) {
        // Native anchor history can restore focus after Vue's first DOM update.
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
        Array.from(document.querySelectorAll<HTMLAnchorElement>('.product-discovery')).find(link => link.getAttribute('href') === from.path)?.focus({ preventScroll: true })
      }
      return { ...returnPosition, behavior: 'instant' }
    }
    if (to.hash) {
      const element = document.getElementById(to.hash.slice(1))
      if (element) {
        if (element.hasAttribute('tabindex')) element.focus({ preventScroll: true })
        return {
          el: element,
          top: Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0,
          behavior: from.path !== to.path || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        }
      }
    }
    return { top: 0, behavior: 'instant' }
  },
})
