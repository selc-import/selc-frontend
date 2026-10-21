import { writeFile } from 'node:fs/promises'

export async function connectPage() {
  const target = await fetch('http://127.0.0.1:9333/json/new?about:blank', {method:'PUT'}).then(response=>response.json())
  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject})
  let serial = 0
  const pending = new Map()
  const errors = []
  socket.onmessage = event => {
    const message=JSON.parse(event.data)
    if(message.id){const request=pending.get(message.id);pending.delete(message.id);if(message.error)request?.reject(new Error(message.error.message));else request?.resolve(message.result)}
    if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails)
    if(message.method==='Runtime.consoleAPICalled' && message.params.type==='error')errors.push(message.params.args)
    if(message.method==='Log.entryAdded' && message.params.entry.level==='error')errors.push(message.params.entry)
  }
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
  const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value}
  const waitFor=async(expression,timeout=16000)=>{const start=Date.now();while(Date.now()-start<timeout){const result=await evaluate(expression);if(result)return result;await new Promise(resolve=>setTimeout(resolve,100))}throw new Error(`Timeout: ${expression}`)}
  const screenshot=async(path,clip)=>{const result=await send('Page.captureScreenshot',{format:'png',...(clip?{clip}:{})});await writeFile(path,Buffer.from(result.data,'base64'))}
  const close=async()=>{await send('Page.close').catch(()=>{});socket.close()}
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Log.enable')
  return {send,evaluate,waitFor,screenshot,close,errors}
}
