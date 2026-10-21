import {
  BufferGeometry, ExtrudeGeometry, Float32BufferAttribute, Group, Mesh,
  MeshPhysicalMaterial, Path, Shape, Vector3, type Object3D,
} from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import contours from '../assets/imagotype-contours.json'

const UNIT = 0.008
const source = (x: number, y: number): [number,number] => [(x-640)*UNIT,(474.5-y)*UNIT]
type Relief = (x: number,y: number) => number
type GeometryOptions = {depth:number;bevel:number;subdivisions?:number;relief?:Relief;normalRelief?:Relief}

function contains(loop: number[][], point: number[]) {
  let inside=false
  for(let i=0,j=loop.length-1;i<loop.length;j=i++){
    const a=loop[i],b=loop[j]
    if((a[1]>point[1])!==(b[1]>point[1]) && point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside
  }
  return inside
}

function shapesFromContours(loops: number[][][]) {
  const parents=loops.map((loop,i)=>{
    for(let j=i-1;j>=0;j--)if(contains(loops[j],loop[0]))return j
    return -1
  })
  const level=(i:number):number=>parents[i]<0?0:level(parents[i])+1
  const path=(loop:number[][],target:Path)=>{
    loop.forEach(([x,y],i)=>{const p=source(x,y);if(i)target.lineTo(...p);else target.moveTo(...p)})
    target.closePath();return target
  }
  return loops.flatMap((loop,i)=>{
    if(level(i)%2)return []
    const shape=path(loop,new Shape()) as Shape
    loops.forEach((hole,j)=>{if(parents[j]===i)shape.holes.push(path(hole,new Path()))})
    return [shape]
  })
}

/** Uniform triangle subdivision keeps neighboring edge samples identical.
 * The resulting deformation has actual depth, not a displacement texture.
 */
function subdivide(positions: Float32Array) {
  const result=new Float32Array(positions.length*4)
  let cursor=0
  const put=(v:number[])=>{result.set(v,cursor);cursor+=3}
  const midpoint=(a:number[],b:number[])=>a.map((value,i)=>(value+b[i])/2)
  for(let i=0;i<positions.length;i+=9){
    const a=Array.from(positions.subarray(i,i+3)),b=Array.from(positions.subarray(i+3,i+6)),c=Array.from(positions.subarray(i+6,i+9))
    const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a)
    for(const point of [a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca])put(point)
  }
  return result
}

function volumeGeometry(shape: Shape, options: GeometryOptions) {
  const {depth,bevel,subdivisions=0,relief=()=>0,normalRelief=relief}=options
  const extrusion=new ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel*.65,bevelSegments:3,curveSegments:18})
  extrusion.translate(0,0,-depth/2)
  let vertices=new Float32Array(extrusion.getAttribute('position').array)
  extrusion.dispose()
  for(let i=0;i<subdivisions;i++)vertices=subdivide(vertices)
  const raw=new BufferGeometry()
  raw.setAttribute('position',new Float32BufferAttribute(vertices,3))
  const geometry=mergeVertices(raw,0.000001)
  raw.dispose()
  const position=geometry.getAttribute('position')
  const cap=new Int8Array(position.count)
  const half=depth/2+bevel
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i)
    if(Math.abs(Math.abs(z)-half)<.000001)cap[i]=Math.sign(z)
    position.setZ(i,z+relief(x/UNIT+640,474.5-y/UNIT))
  }
  geometry.computeVertexNormals()
  const normal=geometry.getAttribute('normal'),n=new Vector3()
  for(let i=0;i<position.count;i++)if(cap[i]){
    const x=position.getX(i)/UNIT+640,y=474.5-position.getY(i)/UNIT,h=.1
    const dx=(normalRelief(x+h,y)-normalRelief(x-h,y))/(2*h*UNIT)
    const dy=-(normalRelief(x,y+h)-normalRelief(x,y-h))/(2*h*UNIT)
    n.set(-dx,-dy,1).normalize().multiplyScalar(cap[i]);normal.setXYZ(i,n.x,n.y,n.z)
  }
  geometry.computeBoundingBox();geometry.computeBoundingSphere()
  return geometry
}

function manualShape(draw:(m:(x:number,y:number)=>void,l:(x:number,y:number)=>void,c:(...p:[number,number,number,number,number,number])=>void)=>void) {
  const shape=new Shape()
  draw((x,y)=>shape.moveTo(...source(x,y)),(x,y)=>shape.lineTo(...source(x,y)),(a,b,c,d,e,f)=>shape.bezierCurveTo(...source(a,b),...source(c,d),...source(e,f)))
  shape.closePath();return shape
}

/** Hand-modeled from the supplied artwork, not an imported or regenerated mark. */
function suppliedAppleShapes() {
  const body=manualShape((m,_l,c)=>{
    m(638,224);c(647,224,652,217,666,220);c(678,220,687,227,692,235)
    c(673,246,671,273,696,284);c(692,299,679,319,669,320)
    c(658,321,652,315,642,315);c(632,315,627,321,617,321)
    c(603,322,586,293,584,272);c(581,251,587,232,600,224)
    c(613,216,624,223,630,224);c(634,226,635,226,638,224)
  })
  const leaf=manualShape((m,_l,c)=>{m(639,218);c(637,205,650,187,669,186);c(671,199,658,215,639,218)})
  return [body,leaf]
}

function lowerRibbon() {
  return manualShape((m,l,c)=>{
    m(444,369);c(439,414,465,457,502,474);c(521,482,538,484,563,484)
    // Follow the main ribbon's inner return, with a small concealed overlap
    // so the two bevels cannot leave an open slit between the solids.
    l(745,484);c(764,476,775,463,775,449);c(775,442,773,436,770,431)
    l(565,431);c(525,431,503,416,483,399)
  })
}

function mainRibbon() {
  // The raster's dark reflections must not become missing geometry or jagged
  // notches. These smooth curves follow its visible ribbon boundaries instead.
  return manualShape((m,l,c)=>{
    m(635,93);c(566,87,519,110,481,147);c(454,176,444,205,445,238)
    c(444,285,471,317,510,338);c(545,359,589,370,647,382)
    l(709,397);c(751,408,772,428,772,449);c(772,463,761,476,742,484)
    c(794,481,826,462,824,431);c(824,397,792,375,738,361)
    c(699,351,667,347,631,337);c(573,322,536,302,516,272)
    c(495,240,498,208,514,183);c(529,159,551,149,586,149)
    l(700,149);c(725,149,731,156,750,170);l(803,205)
    c(811,176,803,145,782,122);c(763,102,743,94,717,94)
  })
}

function rearRibbon() {
  return manualShape((m,l,c)=>{m(740,286);c(786,319,819,348,823,386);l(804,374);c(789,342,764,313,740,286)})
}

/** X on the main ribbon's inner return at a source-image Y coordinate. */
function ribbonSeamX(y:number) {
  const upper=y<449
  const xs=upper?[709,751,772,772]:[772,772,761,742]
  const ys=upper?[397,408,428,449]:[449,463,476,484]
  const cubic=(p:number[],t:number)=>p[0]*(1-t)**3+3*p[1]*(1-t)**2*t+3*p[2]*(1-t)*t*t+p[3]*t**3
  let low=0,high=1
  for(let i=0;i<20;i++){const t=(low+high)/2;if(cubic(ys,t)<y)low=t;else high=t}
  return cubic(xs,(low+high)/2)
}

export function createImagotypeModel() {
  const root=new Group();root.name='SELC_Imagotype_3D'
  root.userData={source:'selc-original.png',sourceWidth:1280,sourceHeight:949,kind:'full-volumetric-imagotype',referenceOnly:true,noImageTextures:true}
  const groups={isotype:new Group(),wordmark:new Group(),import:new Group(),descriptor:new Group()}
  for(const [name,group] of Object.entries(groups)){group.name=name;root.add(group)}
  const materials=Object.keys(groups).map((name,i)=>{
    const material=new MeshPhysicalMaterial({color:i<2?'#e2e5e9':'#f0f1f3',metalness:1,roughness:i<2?.18:.24,clearcoat:.22,clearcoatRoughness:.2,envMapIntensity:1.05})
    material.name=`SELC_${name}_chrome`;return material
  })
  const geometries:BufferGeometry[]=[]
  function add(group:Group,shape:Shape,material:MeshPhysicalMaterial,options:GeometryOptions,name:string){
    const geometry=volumeGeometry(shape,options);geometries.push(geometry)
    const mesh=new Mesh(geometry,material);mesh.name=name;mesh.userData={part:group.name,volumetric:true};group.add(mesh)
  }
  const ribbonRelief:Relief=(x,y)=>.12*Math.sin((y-110)/100)+.20*Math.sin((x-540)/100)*Math.sin((y-180)/180)
  // Preserve both visible ribbon faces. The dark rear curl is a separate solid
  // behind the main face, as in the reference, rather than a printed shadow.
  add(groups.isotype,mainRibbon(),materials[0],{depth:.13,bevel:.012,subdivisions:2,relief:ribbonRelief},'S_main_ribbon')
  const rearMaterial=materials[0].clone();rearMaterial.name='SELC_isotype_rear_chrome';rearMaterial.color.set('#444a54');materials.push(rearMaterial)
  add(groups.isotype,rearRibbon(),rearMaterial,{depth:.11,bevel:.008,subdivisions:2,relief:(x,y)=>ribbonRelief(x,y)-.22},'S_rear_curl')
  // A gradual twist turns the lower face away from the softbox toward the
  // right. Avoid a cylindrical cross-section: it makes a white horizontal bar.
  const lowerTwist:Relief=(x,y)=>-.16+.000006*(x-295)*(y-450)-.0000025*(x-445)**2
  const lowerRelief:Relief=(x,y)=>{
    const twist=lowerTwist(x,y)
    // Match depth near the shared edge. The lower face sits just behind the
    // main one to avoid coincident surfaces in the concealed overlap.
    const t=Math.max(0,Math.min(1,(x-ribbonSeamX(y)+64)/60))
    return twist+(ribbonRelief(x,y)-.008-twist)*t*t*(3-2*t)
  }
  // Retain smooth face normals across the depth correction, like weighted
  // normals on a modeled fold, without a band of concentrated reflections.
  add(groups.isotype,lowerRibbon(),materials[0],{depth:.13,bevel:.012,subdivisions:2,relief:lowerRelief,normalRelief:lowerTwist},'S_lower_ribbon')
  suppliedAppleShapes().forEach((shape,i)=>add(groups.isotype,shape,materials[0],{depth:.14,bevel:.014,subdivisions:1,relief:(x,y)=>.06-.045*((x-640)/65)**2-.025*((y-270)/60)**2},i?'supplied_leaf':'supplied_apple'))
  shapesFromContours(contours.wordmark).forEach((shape,i)=>add(groups.wordmark,shape,materials[1],{depth:.16,bevel:.005,subdivisions:1,relief:(_x,y)=>-.000008*(y-588)**2},`SELC_letter_${i+1}`))
  shapesFromContours(contours.import).forEach((shape,i)=>add(groups.import,shape,materials[2],{depth:.065,bevel:.0018},`IMPORT_and_rule_${i+1}`))
  shapesFromContours(contours.descriptor).forEach((shape,i)=>add(groups.descriptor,shape,materials[3],{depth:.035,bevel:.0009},`descriptor_glyph_${i+1}`))
  root.updateMatrixWorld(true)
  return {root,groups,materials,dispose:()=>{geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose())}}
}

export type ImagotypeGroups = Record<'isotype'|'wordmark'|'import'|'descriptor',Object3D>
