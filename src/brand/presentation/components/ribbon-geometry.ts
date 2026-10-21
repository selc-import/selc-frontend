import { ExtrudeGeometry, Shape } from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import { symbolOutline } from './symbol-outline'

/** Closed, beveled badge. This factory is the replacement boundary for an exact
 * Blender/GLB model. ExtrudeGeometry owns cap triangulation and side winding.
 */
export function createRibbonGeometry() {
  const shape = new Shape()
  const unit = 0.008
  for (const command of symbolOutline) {
    switch (command[0]) {
      case 'M': shape.moveTo(command[1] * unit, -command[2] * unit); break
      case 'L': shape.lineTo(command[1] * unit, -command[2] * unit); break
      case 'C': shape.bezierCurveTo(
        command[1] * unit, -command[2] * unit,
        command[3] * unit, -command[4] * unit,
        command[5] * unit, -command[6] * unit,
      ); break
      case 'Z': shape.closePath()
    }
  }
  const depth = 0.25
  const bevelThickness = 0.055
  const extrusion = new ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness,
    bevelSize: 0.035, bevelSegments: 5, curveSegments: 40, steps: 1,
  })
  extrusion.center()
  // Weld only exact positions, rather than smoothing unrelated nearby vertices.
  // Cap UV seams and the original flat normals must not prevent that weld.
  extrusion.deleteAttribute('normal')
  extrusion.deleteAttribute('uv')
  const geometry = mergeVertices(extrusion, 0.00001)
  geometry.computeVertexNormals()
  const positions = geometry.getAttribute('position')
  const normals = geometry.getAttribute('normal')
  // Keep planar lids planar: interpolating bevel normals over the large cap
  // triangles creates false diagonal facets in a mirror-like material.
  for (let i = 0; i < positions.count; i++) {
    const z = positions.getZ(i)
    if (Math.abs(Math.abs(z) - (depth / 2 + bevelThickness)) < 0.00001) normals.setXYZ(i, 0, 0, Math.sign(z))
  }
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  extrusion.dispose()
  return geometry
}
