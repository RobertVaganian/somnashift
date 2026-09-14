import {rankMatches,LOCAL_MODEL} from './change-brief.mjs';
/** A worker is created only when someone explicitly starts local search. */
export function createBriefRuntime(onChange,{workerFactory=()=>new Worker(new URL('./brief-worker.mjs',import.meta.url),{type:'module'}),deadline=120000}={}){
 let worker=null,timer=null,epoch=0;
 const value={phase:'idle',message:'',progress:null,result:null,loaded:false};
 const emit=()=>onChange({...value});
 function stop(message='Model unloaded. Downloaded files may remain cached in this browser.'){
  ++epoch;clearTimeout(timer);worker?.terminate();worker=null;Object.assign(value,{phase:'idle',loaded:false,message,progress:null});emit();
 }
 function fail(message){stop(message);value.phase='error';emit();}
 function search(review,query,documents){
  query=String(query||'').trim();if(!query||query.length>180||!documents.length||['loading','searching','removing'].includes(value.phase))return false;
  value.result=null;value.progress=null;value.phase=value.loaded?'searching':'loading';value.message=value.loaded?'Finding the closest recorded changes…':'Loading the on-device model…';emit();
  const request=++epoch;
  try{
   if(!worker)worker=workerFactory();
   const activeWorker=worker;
   worker.onmessage=e=>{
    if(request!==epoch||activeWorker!==worker||e.data?.requestId!==request)return;
    const data=e.data;
    if(data.type==='ready'){value.loaded=true;return;}
    if(data.type==='status'){Object.assign(value,{phase:data.phase,message:data.message,progress:data.progress??null});emit();return;}
    if(data.type==='complete'){clearTimeout(timer);Object.assign(value,{phase:'complete',progress:null,message:'Search completed on this device.',result:{fingerprint:data.fingerprint,query,matches:rankMatches(review.records,data.scores||[])}});emit();}
    if(data.type==='error')fail('Local search could not run here. Check the connection or use the guided demo.');
   };
   worker.onerror=()=>{if(request===epoch)fail('This browser could not run the local model. The guided demo remains available.');};
   timer=setTimeout(()=>{if(request===epoch)fail('The local run took too long and was stopped. You can retry or use the guided demo.');},deadline);
   worker.postMessage({type:'search',fingerprint:review.fingerprint,documents,query,requestId:request});return true;
  }catch{fail('This browser could not start a local worker. Try the guided demo.');return false;}
 }
 async function removeModel(){
  stop('Removing the model files…');value.phase='removing';value.result=null;emit();
  try{if(!globalThis.caches)throw new Error('Cache unavailable');let removed=0;
   for(const name of await caches.keys()){const cache=await caches.open(name);for(const request of await cache.keys())if(decodeURIComponent(request.url).includes(`${LOCAL_MODEL.id}/resolve/`)){if(await cache.delete(request))removed++;}}
   value.result=null;value.message=removed?'Downloaded model files removed. Shared runtime files may remain cached.':'No cached model files were found. The model is unloaded.';
  }catch{value.message='The model is unloaded. This browser did not allow cache removal; use its site-data settings.';}
  value.phase='idle';emit();
 }
 return {value,search,stop,removeModel};
}
