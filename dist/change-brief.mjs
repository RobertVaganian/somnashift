import {ACTORS,changesBetween} from './model.mjs';
export const LOCAL_MODEL={id:'Xenova/all-MiniLM-L6-v2',revision:'751bff37182d3f1213fa05d7196b954e230abad9',name:'MiniLM L6 · 22M',weightsMB:23,downloadMB:50};
export const BRIEF_EXAMPLES=[
 {id:'owner',label:'Who owns the family update?',query:'Who is responsible for the family conversation?',field:'Action owner'},
 {id:'time',label:'Which expected time moved?',query:'Which deadline has moved?',field:'Action time'},
 {id:'note',label:'What did the day team request?',query:'What did the day team request?',field:'Shift note'}
];
/** Comparisons contain only submitted, readable snapshots, never a working draft. */
export function changeReview(state,versionId=state.versions.at(-1)?.id){
 const index=state.versions.findIndex(v=>v.id===versionId);if(index<1)return null;
 const after=state.versions[index],before=state.versions[index-1];
 if(state.actor!=='alex'&&(after.recipient!==state.actor||before.recipient!==state.actor||!state.transport[after.id]?.viewedAt||!state.transport[before.id]?.viewedAt))return null;
 const raw=changesBetween(before.patients,after.patients);
 if(before.recipient!==after.recipient)raw.push({patient:'All',field:'Recipient',before:ACTORS[before.recipient].name,after:ACTORS[after.recipient].name});
 const records=raw.map((c,i)=>{
  const p=after.patients.find(p=>p.room===c.patient);
  const aliases=c.field==='Action owner'?'Assigned owner, responsibility, colleague':c.field==='Action time'?'Expected time, deadline, follow-up schedule':c.field==='Shift note'?'Added factual shift note, day team request':'';
  return {...c,id:`change-${i+1}`,patientId:p?.id||null,name:p?.name||'Handoff',context:p?.tasks.map(t=>t.label).join('. ')||'',aliases};
 });
 const fingerprint=JSON.stringify([before.id,after.id,before.recipient,after.recipient,records]);
 return {before:{id:before.id,number:before.number,time:before.createdAt},after:{id:after.id,number:after.number,time:after.createdAt},records,fingerprint,roomCount:new Set(records.map(c=>c.patient).filter(p=>p!=='All')).size};
}
export function searchDocuments(review){return review.records.slice(0,64).map(c=>({id:c.id,text:[c.patient==='All'?'Handoff':`Room ${c.patient}, ${c.name}`,c.field,c.aliases,c.before?`Previously: ${c.before}`:'',`Updated: ${c.after}`,c.context].filter(Boolean).join('. ').slice(0,1800)}));}
export function rankMatches(records,scores,minScore=.18){
 const allowed=new Set(records.map(r=>r.id));
 return scores.filter(x=>allowed.has(x.id)&&Number.isFinite(x.score)&&x.score>=minScore&&x.score<=1.001).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>({id:x.id}));
}
export function currentBrief(result,review){return Boolean(result&&review&&result.fingerprint===review.fingerprint);}
export function exampleMatches(review,id){const example=BRIEF_EXAMPLES.find(x=>x.id===id);return example?review.records.filter(c=>c.field===example.field).map(c=>({id:c.id})):[];}
