import { writeFile } from 'node:fs/promises'
import { connectPage } from './cdp-client.mjs'

const page=await connectPage()
try {
  await page.send('Page.navigate',{url:'http://localhost:5173/assets/brand/selc-original.png'})
  await page.waitFor('document.images[0]?.complete')
  const data=await page.evaluate(`(async()=>{
    const {traceImagotypeRegion,outlineArea}=await import('/src/brand/presentation/components/trace-imagotype.ts');
    const image=document.images[0];const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const context=canvas.getContext('2d');context.drawImage(image,0,0);const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
    const region=(left,top,right,bottom,threshold)=>traceImagotypeRegion(pixels,canvas.width,{left,top,right,bottom,threshold});
    return {width:canvas.width,height:canvas.height,
      symbol:region(430,80,840,492,42.25).filter(loop=>{
        const xs=loop.map(p=>p[0]);return Math.abs(outlineArea(loop))>600 && (Math.min(...xs)<470 || Math.max(...xs)>780);
      }),
      wordmark:region(240,515,1042,663,70.25),
      import:region(240,680,1042,747,70.25),
      descriptor:region(120,775,1165,810,60.25)};
  })()`)
  await writeFile('src/brand/presentation/assets/imagotype-contours.json',JSON.stringify(data))
  const path=loop=>loop.map((p,i)=>`${i?'L':'M'}${p[0]},${p[1]}`).join('')+'Z'
  const preview=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${data.width} ${data.height}"><rect width="100%" height="100%" fill="black"/><g fill="#d5d7dc" fill-rule="evenodd">${['symbol','wordmark','import','descriptor'].map(name=>`<path d="${data[name].map(path).join('')}"/>`).join('')}</g></svg>`
  await writeFile('.qa/contours-preview.svg',preview)
  const model=await page.evaluate(`(async()=>{
    const {createImagotypeModel}=await import('/src/brand/presentation/components/imagotype-model.ts');
    const {GLTFExporter}=await import('/node_modules/three/examples/jsm/exporters/GLTFExporter.js');
    const model=createImagotypeModel();let meshes=0,triangles=0;
    model.root.traverse(object=>{if(object.isMesh){meshes++;triangles+=(object.geometry.index?.count||object.geometry.attributes.position.count)/3;}});
    const buffer=await new GLTFExporter().parseAsync(model.root,{binary:true,onlyVisible:true});
    let binary='';const bytes=new Uint8Array(buffer);for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));
    model.dispose();return {base64:btoa(binary),meshes,triangles,bytes:bytes.length};
  })()`)
  await writeFile('public/assets/brand/selc-imagotype.glb',Buffer.from(model.base64,'base64'))
  console.log(JSON.stringify({width:data.width,height:data.height,loops:Object.fromEntries(['symbol','wordmark','import','descriptor'].map(name=>[name,data[name].length])),meshes:model.meshes,triangles:model.triangles,glbBytes:model.bytes}))
}finally{await page.close()}
