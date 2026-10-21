/** Build-time contour extraction of the supplied lettering. No fonts, image
 * generation, texture baking or external vectorization service is involved.
 * The supplied Apple symbol is modeled separately by hand, not auto-traced.
 */
export type OutlinePoint = [number, number]
export type TraceRegion = { left: number; top: number; right: number; bottom: number; threshold: number }

export function outlineArea(points: readonly OutlinePoint[]) {
  return points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1]},0)/2
}

function simplifyLine(points: OutlinePoint[], tolerance: number): OutlinePoint[] {
  if(points.length<3)return points
  const start=points[0],end=points[points.length-1]
  const dx=end[0]-start[0],dy=end[1]-start[1],length=dx*dx+dy*dy
  let max=tolerance*tolerance, index=-1
  for(let i=1;i<points.length-1;i++){
    const p=points[i],t=length?Math.max(0,Math.min(1,((p[0]-start[0])*dx+(p[1]-start[1])*dy)/length)):0
    const distance=(p[0]-start[0]-t*dx)**2+(p[1]-start[1]-t*dy)**2
    if(distance>max){max=distance;index=i}
  }
  if(index<0)return [start,end]
  return [...simplifyLine(points.slice(0,index+1),tolerance).slice(0,-1),...simplifyLine(points.slice(index),tolerance)]
}

export function traceImagotypeRegion(pixels: Uint8ClampedArray, width: number, region: TraceRegion): OutlinePoint[][] {
  const {left,top,right,bottom,threshold}=region
  const sample=(x:number,y:number)=>{
    if(x<left||x>=right||y<top||y>=bottom)return 0
    const i=(y*width+x)*4
    return pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722
  }
  const segments: [OutlinePoint,OutlinePoint][]=[]
  const key=(p:OutlinePoint)=>`${Math.round(p[0]*10000)},${Math.round(p[1]*10000)}`
  for(let y=top-1;y<bottom;y++)for(let x=left-1;x<right;x++){
    const values=[sample(x,y),sample(x+1,y),sample(x+1,y+1),sample(x,y+1)]
    const code=values.reduce((bits,value,i)=>bits|(value>threshold?1<<i:0),0)
    if(code===0||code===15)continue
    const interpolate=(a:number,b:number)=>Math.max(0,Math.min(1,(threshold-a)/(b-a)))
    const corners: OutlinePoint[]=[
      [x+interpolate(values[0],values[1]),y],
      [x+1,y+interpolate(values[1],values[2])],
      [x+interpolate(values[3],values[2]),y+1],
      [x,y+interpolate(values[0],values[3])],
    ]
    const center=values.reduce((sum,value)=>sum+value,0)/4>threshold
    const table: Record<number,number[][]>={1:[[3,0]],2:[[0,1]],3:[[3,1]],4:[[1,2]],5:center?[[0,1],[2,3]]:[[3,0],[1,2]],6:[[0,2]],7:[[3,2]],8:[[2,3]],9:[[0,2]],10:center?[[3,0],[1,2]]:[[0,1],[2,3]],11:[[1,2]],12:[[1,3]],13:[[0,1]],14:[[3,0]]}
    for(const [a,b] of table[code])segments.push([corners[a],corners[b]])
  }
  const neighbors=new Map<string,number[]>()
  segments.forEach((segment,i)=>segment.forEach(point=>{const k=key(point);const list=neighbors.get(k)||[];list.push(i);neighbors.set(k,list)}))
  const used=new Set<number>(), loops: OutlinePoint[][]=[]
  for(let i=0;i<segments.length;i++){
    if(used.has(i))continue
    const points:OutlinePoint[]=[segments[i][0]],first=key(points[0])
    let segment=i,current=segments[i][1]
    used.add(i)
    while(key(current)!==first){
      points.push(current)
      const next=(neighbors.get(key(current))||[]).find(candidate=>!used.has(candidate))
      if(next===undefined)throw new Error('Open contour in original artwork')
      segment=next;used.add(segment)
      const [a,b]=segments[segment];current=key(a)===key(current)?b:a
    }
    if(Math.abs(outlineArea(points))<1.4)continue
    let farthest=1
    for(let j=2;j<points.length;j++)if((points[j][0]-points[0][0])**2+(points[j][1]-points[0][1])**2>(points[farthest][0]-points[0][0])**2+(points[farthest][1]-points[0][1])**2)farthest=j
    const simplified=[...simplifyLine(points.slice(0,farthest+1),.28).slice(0,-1),...simplifyLine([...points.slice(farthest),points[0]],.28).slice(0,-1)]
    if(simplified.length>=3)loops.push(simplified.map(([a,b])=>[Math.round(a*100)/100,Math.round(b*100)/100]))
  }
  return loops.sort((a,b)=>Math.abs(outlineArea(b))-Math.abs(outlineArea(a)))
}
