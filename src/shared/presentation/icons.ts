import { ArrowLeft, ArrowUp, ArrowUpRight, BatteryFull, Check, ChevronDown, Search, X } from '@lucide/vue'
import WhatsAppLogo from './components/WhatsAppLogo.vue'

// Explicit imports keep the icon set small and tree-shakable.
export const icons = {
  'arrow-up': ArrowUp,
  'arrow-left': ArrowLeft,
  'arrow-up-right': ArrowUpRight,
  battery: BatteryFull,
  check: Check,
  'chevron-down': ChevronDown,
  whatsapp: WhatsAppLogo,
  search: Search,
  close: X,
} as const

export type IconName = keyof typeof icons
