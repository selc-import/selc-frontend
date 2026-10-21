import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BrandAnimationPhase } from '../domain/model/brand-animation-phase.model'
export const useBrandSceneStore = defineStore('brand-scene',()=>{
  const phase = ref<BrandAnimationPhase>('dark')
  const introComplete = ref(false)
  function setPhase(value: BrandAnimationPhase) { phase.value = value; introComplete.value = value === 'idle' }
  function finishImmediately(){setPhase('idle')}
  return {phase,introComplete,setPhase,finishImmediately}
})
