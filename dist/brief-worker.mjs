import {LOCAL_MODEL} from './change-brief.mjs';
let extractor=null,indexKey='',indexVectors=null;
self.onmessage=async event=>{
 const {type,documents,query,fingerprint,requestId}=event.data||{};if(type!=='search')return;
 const send=data=>self.postMessage({...data,requestId});
 try{
  if(!extractor){
   send({type:'status',phase:'loading',message:'Loading the on-device search model…'});
   const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js');
   env.allowLocalModels=false;env.useBrowserCache=true;env.backends.onnx.wasm.numThreads=1;
   let lastProgress=0;
   extractor=await pipeline('feature-extraction',LOCAL_MODEL.id,{revision:LOCAL_MODEL.revision,device:'wasm',dtype:'q8',progress_callback:p=>{
    if(p.status==='progress'&&performance.now()-lastProgress>180){lastProgress=performance.now();send({type:'status',phase:'loading',message:p.file?.endsWith('.onnx')?'Loading model weights…':'Loading model files…',progress:Math.min(100,Math.max(0,Math.round(p.progress||0)))});}
   }});
   send({type:'ready'});
  }
  send({type:'status',phase:'searching',message:'Matching your question to the recorded changes…'});
  if(indexKey!==fingerprint){const vectors=await extractor(documents.map(d=>d.text),{pooling:'mean',normalize:true});indexVectors=vectors.tolist();indexKey=fingerprint;}
  const queryVector=(await extractor(query,{pooling:'mean',normalize:true})).tolist()[0];
  const scores=documents.map((doc,i)=>({id:doc.id,score:indexVectors[i].reduce((sum,value,k)=>sum+value*queryVector[k],0)}));
  send({type:'complete',fingerprint,query,scores});
 }catch{send({type:'error'});}
};
