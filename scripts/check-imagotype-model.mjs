import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const bytes=await readFile('public/assets/brand/selc-imagotype.glb')
assert.equal(bytes.readUInt32LE(0),0x46546c67)
assert.equal(bytes.readUInt32LE(4),2)
const jsonSize=bytes.readUInt32LE(12)
const document=JSON.parse(bytes.subarray(20,20+jsonSize).toString())
const binaryOffset=20+jsonSize+8
assert.equal(document.images?.length||0,0,'The model must not embed the reference image')
assert.equal(document.textures?.length||0,0,'The imagotype must use real surfaces, not image textures')
const componentBytes={5121:1,5123:2,5125:4,5126:4}
const sizes={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}
function accessor(index){
  const entry=document.accessors[index],view=document.bufferViews[entry.bufferView]
  const start=binaryOffset+(view.byteOffset||0)+(entry.byteOffset||0)
  const size=sizes[entry.type],step=view.byteStride||size*componentBytes[entry.componentType]
  const read=entry.componentType===5126?'readFloatLE':entry.componentType===5125?'readUInt32LE':entry.componentType===5123?'readUInt16LE':'readUInt8'
  return {count:entry.count,get:(i,c=0)=>bytes[read](start+i*step+c*componentBytes[entry.componentType])}
}
let triangles=0,vertices=0
const parts=[]
for(const mesh of document.meshes){
  mesh.name=document.nodes.find(node=>node.mesh===document.meshes.indexOf(mesh))?.name||'unnamed'
  let meshVolume=0
  for(const primitive of mesh.primitives){
    const p=accessor(primitive.attributes.POSITION),n=accessor(primitive.attributes.NORMAL),index=accessor(primitive.indices)
    const edges=new Map()
    let lowZ=Infinity,highZ=-Infinity
    for(let i=0;i<p.count;i++){
      const z=p.get(i,2);lowZ=Math.min(lowZ,z);highZ=Math.max(highZ,z)
      assert.ok(Math.abs(Math.hypot(n.get(i,0),n.get(i,1),n.get(i,2))-1)<.002,`${mesh.name}: valid unit normals`)
    }
    assert.ok(highZ-lowZ>.03,`${mesh.name}: must have real thickness`)
    for(let i=0;i<index.count;i+=3){
      const ids=[index.get(i),index.get(i+1),index.get(i+2)]
      const [a,b,c]=ids.map(id=>[p.get(id,0),p.get(id,1),p.get(id,2)])
      const ab=b.map((v,j)=>v-a[j]),ac=c.map((v,j)=>v-a[j])
      const area=Math.hypot(ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0])
      assert.ok(area>1e-12,`${mesh.name}: no degenerate triangles`)
      meshVolume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6
      for(let j=0;j<3;j++){const edge=[ids[j],ids[(j+1)%3]].sort((x,y)=>x-y).join(':');edges.set(edge,(edges.get(edge)||0)+1)}
    }
    assert.ok([...edges.values()].every(count=>count===2),`${mesh.name}: every surface must be closed`)
    triangles+=index.count/3;vertices+=p.count
  }
  assert.ok(meshVolume>0,`${mesh.name}: outward winding and positive volume`)
  parts.push(mesh.name)
}
assert.equal(parts.length,52)
for(const name of ['isotype','wordmark','import','descriptor'])assert.ok(document.nodes.some(node=>node.name===name),`Missing group ${name}`)
for(const name of ['supplied_apple','supplied_leaf','S_main_ribbon','S_lower_ribbon','S_rear_curl'])assert.ok(parts.includes(name))
console.log(JSON.stringify({model:'selc-imagotype.glb',bytes:bytes.length,meshes:parts.length,vertices,triangles,imageTextures:0,closedSolids:true,positiveVolumes:true,validNormals:true},null,2))
