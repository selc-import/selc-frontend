import {
  Color, DirectionalLight, Group, Mesh, MeshBasicMaterial, MeshPhysicalMaterial,
  PlaneGeometry, PMREMGenerator, RectAreaLight, Scene, Vector3,
  type WebGLRenderer, type Object3D,
} from 'three'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import type { ImagotypeGroups } from './imagotype-model'

/** Reflection cards are baked once: no HDR download or per-frame cubemap. */
export function createStudioEnvironment(renderer: WebGLRenderer) {
  const studio = new Scene()
  studio.background = new Color(0.055, 0.06, 0.07)
  const plane = new PlaneGeometry(1, 1)
  const materials: MeshBasicMaterial[] = []
  const origin = new Vector3()
  const card = (position: [number, number, number], size: [number, number], power: number) => {
    const material = new MeshBasicMaterial({ color: new Color().setScalar(power) })
    materials.push(material)
    const mesh = new Mesh(plane, material)
    mesh.position.set(...position)
    mesh.scale.set(...size, 1)
    mesh.lookAt(origin)
    studio.add(mesh)
  }
  // A broad frontal softbox keeps silver readable; strips describe the bevel.
  card([0, 0.7, 5], [8, 1.8], 2.6)
  card([0, -2.8, 5], [8, 1.8], 0.65)
  card([-4, 2, 3], [2.4, 6], 3.4)
  card([4, 0, 3], [1, 6], 2.2)
  card([0, 5, 0], [7, 3], 4)
  card([-4, -2, 1], [2, 5], 1.6)
  card([2, 1, -4], [4, 6], 2.8)
  card([0, -4, 3], [6, 1], 0.8)
  const generator = new PMREMGenerator(renderer)
  try {
    return generator.fromScene(studio, 0.06, 0.1, 30)
  } finally {
    generator.dispose()
    plane.dispose()
    materials.forEach(material => material.dispose())
    studio.clear()
  }
}

export function createChromeMaterial() {
  return new MeshPhysicalMaterial({
    color: '#e3e6eb', metalness: 1, roughness: 0.18,
    clearcoat: 0.28, clearcoatRoughness: 0.2, envMapIntensity: 0,
  })
}

export function createStudioLights() {
  RectAreaLightUniformsLib.init()
  const key = new DirectionalLight('#ffffff', 0)
  key.position.set(-3, 4, 5)
  const fill = new DirectionalLight('#e2e8f0', 0)
  fill.position.set(4, -1, 3)
  const rim = new DirectionalLight('#ffffff', 0)
  rim.position.set(0, 3, -4)
  const sweep = new RectAreaLight('#ffffff', 0, 1.4, 6)
  sweep.position.set(-4, 0.5, 4)
  sweep.lookAt(0, 0, 0)
  const group = new Group()
  group.add(key, fill, rim, sweep)
  return { group, key, fill, rim, sweep }
}

export type BrandSceneRig = {
  symbol: Object3D
  groups: ImagotypeGroups
  materials: MeshPhysicalMaterial[]
  lights: ReturnType<typeof createStudioLights>
}
