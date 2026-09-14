/** @typedef {'alex'|'jordan'|'taylor'} ActorId */
/** @typedef {{id:string, label:string, owner:ActorId|null, due:string, done:boolean}} Task */
/** @typedef {{id:string, room:string, name:string, initials:string, context:string, recordedAt:string, older:boolean, sbar:Record<string,string>, tasks:Task[], notes:Array<{text:string,time:string,actor:ActorId}>}} Patient */
/** @typedef {{id:string, number:number, sender:ActorId, recipient:ActorId, createdAt:string, patients:Patient[], changes:Array<{patient:string,field:string,before:string,after:string}>}} Version */
export const ACTORS = {
  alex: {id:'alex',name:'Alex Morgan',short:'Alex',initials:'AM',role:'Night shift · outgoing'},
  jordan: {id:'jordan',name:'Jordan Lee',short:'Jordan',initials:'JL',role:'Day shift · incoming'},
  taylor: {id:'taylor',name:'Taylor Brooks',short:'Taylor',initials:'TB',role:'Day shift · alternate'},
};
export const SECTIONS = ['Situation','Background','Assessment','Recommendation'];
export const SCHEMA = 2;
export const clone = value => structuredClone(value);
export function seedPatients() {
  return [
    {id:'p412',room:'412',name:'Morgan Ellis',initials:'ME',context:'Pending result · review at 08:15',recordedAt:'06:30',older:false,
      sbar:{Situation:'Resting at the end of the night shift. One laboratory result is still pending.',Background:'The overnight note and outstanding request are available for the incoming team.',Assessment:'No new concern was recorded in the last shift note.',Recommendation:'Check whether the pending result is available at 08:15 and record the follow-up.'},
      tasks:[{id:'t412',label:'Follow up on the pending laboratory result',owner:'jordan',due:'08:15',done:false}],notes:[]},
    {id:'p414',room:'414',name:'Avery Reid',initials:'AR',context:'One follow-up needs an owner',recordedAt:'06:18',older:false,
      sbar:{Situation:'A family update is requested during the day shift.',Background:'The request was added during the overnight round.',Assessment:'The communication task is still open.',Recommendation:'Assign a colleague to the family update before handoff.'},
      tasks:[{id:'t414',label:'Arrange the requested family update',owner:null,due:'09:00',done:false}],notes:[]},
    {id:'p417',room:'417',name:'Sam Taylor',initials:'ST',context:'Notes reviewed · no open actions',recordedAt:'06:25',older:false,
      sbar:{Situation:'The overnight handoff note has been reviewed.',Background:'The scheduled communication task was completed during the shift.',Assessment:'No outstanding communication item is recorded.',Recommendation:'Continue with the ward’s usual handoff conversation.'},
      tasks:[{id:'t417',label:'Confirm the overnight contact details',owner:'alex',due:'06:20',done:true}],notes:[]},
    {id:'p419',room:'419',name:'Jamie Brooks',initials:'JB',context:'Earlier note · check its timestamp',recordedAt:'05:10',older:true,
      sbar:{Situation:'The earlier shift note was recorded at 05:10.',Background:'The day team may need a more recent factual update.',Assessment:'This is an earlier entry, not a current assessment.',Recommendation:'Check the note with the outgoing colleague during the handoff conversation.'},
      tasks:[],notes:[]},
  ];
}
export function initialState() {
  return {schema:SCHEMA,actor:'alex',offline:false,tick:0,draft:{patients:seedPatients(),recipient:null,recipientConfirmed:false,baseId:null,verification:null,conflict:null},
    versions:[],transport:{},acknowledgments:[],questions:[],workEvents:[],events:[{id:'e0',kind:'draft',actor:'alex',time:'06:42',versionId:null,text:'Night-shift handoff started'}]};
}
export const demoTime = state => {const minutes=6*60+42+state.tick;return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;};
const requireThat = (condition,message) => {if(!condition)throw new Error(message);};
const latest = state => state.versions.at(-1);
const isRecipient = (state,version) => version && state.actor===version.recipient;
function event(state,kind,text,versionId=null) {
  state.tick+=1;
  state.events.push({id:`e${state.events.length}`,kind,actor:state.actor,time:demoTime(state),versionId,text});
}
function versionById(state,id) {const version=state.versions.find(v=>v.id===id);requireThat(version,'This handoff version is unavailable.');return version;}
function outgoing(state) {requireThat(state.actor==='alex','Only the outgoing colleague can edit this draft.');requireThat(state.draft,'Start an update before editing.');}
function online(state) {requireThat(!state.offline,'You’re offline. Your draft stays on this device; reconnect to communicate.');}
export function changesBetween(before,after) {
  if(!before)return [];
  const changes=[];
  for(const patient of after) {
    const old=before.find(p=>p.id===patient.id);if(!old)continue;
    for(const field of SECTIONS)if(old.sbar[field]!==patient.sbar[field])changes.push({patient:patient.room,field,before:old.sbar[field],after:patient.sbar[field]});
    for(const task of patient.tasks){const prev=old.tasks.find(t=>t.id===task.id);
      if(!prev)changes.push({patient:patient.room,field:'New action',before:'',after:task.label});
      else {if(prev.label!==task.label)changes.push({patient:patient.room,field:'Action description',before:prev.label,after:task.label});
      if(prev.due!==task.due)changes.push({patient:patient.room,field:'Action time',before:prev.due,after:task.due});
      if(prev.owner!==task.owner)changes.push({patient:patient.room,field:'Action owner',before:ACTORS[prev.owner]?.name||'Unassigned',after:ACTORS[task.owner]?.name||'Unassigned'});
      if(prev.done!==task.done)changes.push({patient:patient.room,field:'Action status',before:prev.done?'Completed':'Open',after:task.done?'Completed':'Open'});}
    }
    for(const note of patient.notes.slice(old.notes.length))changes.push({patient:patient.room,field:'Shift note',before:'',after:note.text});
  }
  return changes;
}
export function blockers(state) {
  if(!state.draft)return [];
  const result=[];const draft=state.draft;
  if(!draft.recipient)result.push({kind:'recipient',text:'Choose who will receive this handoff.'});
  for(const p of draft.patients)for(const t of p.tasks)if(!t.done&&!t.owner)result.push({kind:'owner',patient:p.id,text:`Room ${p.room}: assign an owner to the open action.`});
  if(draft.verification&&!draft.verification.verified)result.push({kind:'verification',patient:'p412',text:'Confirm the time in the sample dictation.'});
  if(draft.conflict)result.push({kind:'conflict',patient:draft.conflict.patientId,text:'Resolve the competing note before sending.'});
  const base=state.versions.find(v=>v.id===draft.baseId);
  if(base&&draft.recipient!==base.recipient&&!draft.recipientConfirmed)result.push({kind:'reassignment',text:'Confirm the new recipient for this update.'});
  if(base&&!changesBetween(base.patients,draft.patients).length&&draft.recipient===base.recipient)result.push({kind:'unchanged',text:'Add a change before sending a new version.'});
  if(state.offline)result.push({kind:'offline',text:'Reconnect before sending. Nothing has been delivered.'});
  return result;
}
export function statusFor(state,version) {
  const ack=state.acknowledgments.find(a=>a.versionId===version.id);
  if(ack)return {label:`Acknowledged v${version.number}`,tone:'good',time:ack.time};
  const transport=state.transport[version.id];
  if(transport?.viewedAt)return {label:'Viewed · not acknowledged',tone:'pending',time:transport.viewedAt};
  if(transport?.deliveredAt)return {label:'Delivered',tone:'neutral',time:transport.deliveredAt};
  return {label:'Sent · awaiting delivery',tone:'pending',time:version.createdAt};
}
/** Work is an append-only record beside submitted information, not a snapshot edit. */
export const taskFingerprint = task => JSON.stringify([task.label,task.owner,task.due,task.done]);
export function workFor(state,versionId,patientId,taskId) {
  const target=state.versions.findIndex(v=>v.id===versionId);if(target<0)return null;
  for(const record of [...(state.workEvents||[])].reverse()) {
    if(record.patientId!==patientId||record.taskId!==taskId)continue;
    const start=state.versions.findIndex(v=>v.id===record.versionId);
    if(start<0||start>target)continue;
    const continuous=state.versions.slice(start,target+1).every(v=>{const t=v.patients.find(p=>p.id===patientId)?.tasks.find(t=>t.id===taskId);return t&&taskFingerprint(t)===record.fingerprint;});
    if(continuous)return record;
  }
  return null;
}
export function workPatients(state,version) {
  return version.patients.map(p=>({...p,tasks:p.tasks.map(t=>{const work=workFor(state,version.id,p.id,t.id);return {...t,done:t.done||work?.status==='completed',work};})}));
}
export function workPermission(state,versionId,patientId,taskId) {
  const v=state.versions.find(v=>v.id===versionId);const task=v?.patients.find(p=>p.id===patientId)?.tasks.find(t=>t.id===taskId);
  if(!v||!task)return 'This action is unavailable.';
  if(v.id!==latest(state)?.id)return 'A newer handoff is available. Open its actions first.';
  if(v.recipient!==state.actor)return 'Only the named incoming colleague can record work for this handoff.';
  if(!state.transport[v.id]?.viewedAt)return 'Open the delivered handoff before recording work.';
  if(task.owner!==state.actor)return 'This action is assigned to another colleague.';
  if(task.done)return 'This action was already complete in the submitted handoff.';
  return '';
}
export function transition(previous,action) {
  const state=clone(previous);
  switch(action.type) {
    case 'ADVANCE_TIME':{requireThat(Number.isInteger(action.minutes)&&action.minutes>0&&action.minutes<=180,'Advance the demo clock by 1–180 minutes.');requireThat(6*60+42+state.tick+action.minutes<=19*60,'The demo clock stops at 19:00. Reset the scenario to start again.');state.tick+=action.minutes-1;event(state,'clock',`Demo time advanced to ${demoTime({...state,tick:state.tick+1})}`);break;}
    case 'RECORD_WORK':{const reason=workPermission(state,action.versionId,action.patientId,action.taskId);requireThat(!reason,reason);requireThat(['completed','reopened'].includes(action.status),'Choose a valid work status.');const previousWork=workFor(state,action.versionId,action.patientId,action.taskId);requireThat(action.status==='completed'?previousWork?.status!=='completed':previousWork?.status==='completed',action.status==='completed'?'This action is already recorded complete.':'There is no completion to correct.');requireThat(typeof action.note==='string'&&action.note.trim()&&action.note.trim().length<=500,'Write a factual note of 1–500 characters.');const v=versionById(state,action.versionId);const p=v.patients.find(p=>p.id===action.patientId);const task=p.tasks.find(t=>t.id===action.taskId);state.workEvents.push({id:`w${state.workEvents.length+1}`,versionId:v.id,patientId:p.id,taskId:task.id,fingerprint:taskFingerprint(task),actor:state.actor,time:demoTime({...state,tick:state.tick+1}),status:action.status,note:action.note.trim(),offline:state.offline});event(state,action.status==='completed'?'work-completed':'work-reopened',`${ACTORS[state.actor].short} ${action.status==='completed'?'recorded completion':'reopened an action'} for room ${p.room}`,v.id);break;}
    case 'ROLE':requireThat(ACTORS[action.actor],'Unknown demo colleague.');state.actor=action.actor;break;
    case 'OFFLINE':state.offline=Boolean(action.value);break;
    case 'RECIPIENT':outgoing(state);requireThat(['jordan','taylor'].includes(action.actor),'Choose an incoming colleague.');state.draft.recipient=action.actor;state.draft.recipientConfirmed=false;break;
    case 'CONFIRM_RECIPIENT':outgoing(state);state.draft.recipientConfirmed=Boolean(action.value);break;
    case 'EDIT':{outgoing(state);const p=state.draft.patients.find(p=>p.id===action.patientId);requireThat(p&&SECTIONS.includes(action.field),'Unknown note section.');requireThat(action.text.trim(),'A handoff section cannot be empty.');p.sbar[action.field]=action.text.trim();p.recordedAt=demoTime(state);break;}
    case 'ASSIGN':{outgoing(state);requireThat(ACTORS[action.actor],'Choose an action owner.');const p=state.draft.patients.find(p=>p.id===action.patientId);const t=p?.tasks.find(t=>t.id===action.taskId);requireThat(t,'Action unavailable.');t.owner=action.actor;break;}
    case 'ADD_TASK':{outgoing(state);const p=state.draft.patients.find(p=>p.id===action.patientId);requireThat(p&&action.text.trim(),'Write an action to add.');requireThat(!action.owner||ACTORS[action.owner],'Unknown action owner.');requireThat(!action.due||/^([01]\d|2[0-3]):[0-5]\d$/.test(action.due),'Use a valid time.');p.tasks.push({id:`t-${p.id}-${p.tasks.length}`,label:action.text.trim(),owner:action.owner||null,due:action.due||'Not set',done:false});break;}
    case 'EDIT_TASK':{outgoing(state);const p=state.draft.patients.find(p=>p.id===action.patientId);const t=p?.tasks.find(t=>t.id===action.taskId);requireThat(t,'Action unavailable.');requireThat(action.text?.trim(),'Write an action to save.');requireThat(!action.owner||ACTORS[action.owner],'Unknown action owner.');requireThat(!action.due||/^([01]\d|2[0-3]):[0-5]\d$/.test(action.due),'Use a valid time.');t.label=action.text.trim();t.owner=action.owner||null;t.due=action.due||'Not set';break;}
    case 'COMPLETE_TASK':{outgoing(state);const p=state.draft.patients.find(p=>p.id===action.patientId);const t=p?.tasks.find(t=>t.id===action.taskId);requireThat(t,'Action unavailable.');t.done=!t.done;break;}
    case 'DICTATE':outgoing(state);state.draft.verification={verified:false,time:null,text:'The result is expected at eight fifteen.'};break;
    case 'VERIFY':{outgoing(state);requireThat(state.draft.verification,'There is no transcript to verify.');requireThat(['08:15','18:15'].includes(action.time),'Choose the intended time.');state.draft.verification={...state.draft.verification,verified:true,time:action.time};state.draft.patients[0].sbar.Recommendation=`Check whether the pending result is available at ${action.time} and record the follow-up.`;state.draft.patients[0].tasks[0].due=action.time;break;}
    case 'CONFLICT':{outgoing(state);const p=state.draft.patients.find(p=>p.id==='p412');state.draft.conflict={patientId:p.id,field:'Recommendation',mine:p.sbar.Recommendation,theirs:'Check the outstanding result with the day team at 08:15. A colleague added this draft note.'};break;}
    case 'RESOLVE':{outgoing(state);const c=state.draft.conflict;requireThat(c,'No competing edit remains.');const text=action.choice==='mine'?c.mine:action.choice==='theirs'?c.theirs:action.text?.trim();requireThat(text,'Write the combined note.');state.draft.patients.find(p=>p.id===c.patientId).sbar[c.field]=text;state.draft.conflict=null;break;}
    case 'SEND':{outgoing(state);online(state);const issues=blockers(state);requireThat(!issues.length,issues[0]?.text);const base=latest(state);const number=(base?.number||0)+1;const v={id:`handoff-v${number}`,number,sender:'alex',recipient:state.draft.recipient,createdAt:demoTime({...state,tick:state.tick+1}),patients:clone(state.draft.patients),changes:changesBetween(base?.patients,state.draft.patients)};if(base&&base.recipient!==v.recipient)v.changes.push({patient:'All',field:'Recipient',before:ACTORS[base.recipient].name,after:ACTORS[v.recipient].name});state.versions.push(v);state.transport[v.id]={deliveredAt:null,viewedAt:null};state.draft=null;event(state,'sent',`Alex sent v${number} to ${ACTORS[v.recipient].short}`,v.id);break;}
    case 'DELIVER':{online(state);const v=versionById(state,action.versionId);requireThat(!state.transport[v.id].deliveredAt,'This version has already been delivered.');state.transport[v.id].deliveredAt=demoTime({...state,tick:state.tick+1});event(state,'delivered',`Demo transport delivered v${v.number} to ${ACTORS[v.recipient].short}`,v.id);break;}
    case 'VIEW':{online(state);const v=versionById(state,action.versionId);requireThat(isRecipient(state,v),'This version is addressed to another colleague.');requireThat(state.transport[v.id].deliveredAt,'Delivery has not been simulated yet.');if(!state.transport[v.id].viewedAt){state.transport[v.id].viewedAt=demoTime({...state,tick:state.tick+1});event(state,'viewed',`${ACTORS[state.actor].short} opened v${v.number}`,v.id);}break;}
    case 'ASK':{online(state);const v=versionById(state,action.versionId);requireThat(isRecipient(state,v),'Only the named recipient can ask a question.');requireThat(state.transport[v.id].viewedAt,'Open the delivered version before asking.');requireThat(v.patients.some(p=>p.id===action.patientId),'Choose a patient in this version.');requireThat(action.text.trim(),'Write a question first.');const q={id:`q${state.questions.length+1}`,versionId:v.id,patientId:action.patientId,actor:state.actor,text:action.text.trim(),time:demoTime({...state,tick:state.tick+1}),reply:null,resolvedAt:null};state.questions.push(q);event(state,'question',`${ACTORS[state.actor].short} asked about room ${v.patients.find(p=>p.id===action.patientId).room}`,v.id);break;}
    case 'REPLY':{online(state);requireThat(state.actor==='alex','Only Alex can reply to this handoff question.');const q=state.questions.find(q=>q.id===action.questionId);requireThat(q&&!q.reply,'This question is unavailable or already answered.');requireThat(action.text.trim(),'Write a reply first.');q.reply=action.text.trim();q.resolvedAt=demoTime({...state,tick:state.tick+1});event(state,'reply',`Alex answered ${ACTORS[q.actor].short}’s question`,q.versionId);break;}
    case 'ACK':{online(state);const v=versionById(state,action.versionId);requireThat(isRecipient(state,v),'Only the named recipient can acknowledge this version.');requireThat(state.transport[v.id]?.viewedAt,'Review this delivered version first.');requireThat(v.id===latest(state).id,'A newer version is available. Review that update first.');requireThat(!state.questions.some(q=>q.versionId===v.id&&!q.reply),'Resolve the open question before acknowledging.');requireThat(!state.acknowledgments.some(a=>a.versionId===v.id),'This version is already acknowledged.');state.acknowledgments.push({versionId:v.id,actor:state.actor,time:demoTime({...state,tick:state.tick+1}),meaning:'receipt-reviewed-information'});event(state,'acknowledged',`${ACTORS[state.actor].short} acknowledged v${v.number}`,v.id);break;}
    case 'START_UPDATE':{requireThat(state.actor==='alex','Only Alex can prepare an update.');requireThat(!state.draft,'A draft is already open.');const base=latest(state);requireThat(base,'Send the first handoff before starting an update.');state.draft={patients:clone(base.patients),recipient:base.recipient,recipientConfirmed:true,baseId:base.id,verification:null,conflict:null};event(state,'draft',`Alex started an update to v${base.number}`,base.id);break;}
    case 'ADD_NOTE':{outgoing(state);const p=state.draft.patients.find(p=>p.id===action.patientId);requireThat(p&&action.text.trim(),'Write a factual shift note.');p.notes.push({text:action.text.trim(),actor:'alex',time:demoTime({...state,tick:state.tick+1})});p.recordedAt=demoTime({...state,tick:state.tick+1});p.older=false;event(state,'note',`Alex added a draft shift note for room ${p.room}`);break;}
    default:throw new Error('Unknown handoff action.');
  }
  return state;
}
export function restoreState(raw) {
  try {
    const s=JSON.parse(raw);
    if(s?.schema===1){s.schema=SCHEMA;s.workEvents=[];}
    if(s?.schema!==SCHEMA||!ACTORS[s.actor]||typeof s.offline!=='boolean'||!Number.isSafeInteger(s.tick)||s.tick<0||!Array.isArray(s.versions)||!Array.isArray(s.events)||!Array.isArray(s.questions)||!Array.isArray(s.acknowledgments)||!s.transport||!Array.isArray(s.workEvents))return null;
    const time=t=>typeof t==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(t);
    const validPatients=patients=>Array.isArray(patients)&&patients.length===4&&patients.every(p=>p&&['p412','p414','p417','p419'].includes(p.id))&&new Set(patients.map(p=>p.id)).size===4&&patients.every(p=>p.room===p.id.slice(1)&&typeof p.name==='string'&&typeof p.initials==='string'&&typeof p.context==='string'&&typeof p.older==='boolean'&&time(p.recordedAt)&&Array.isArray(p.tasks)&&p.tasks.every(t=>t&&typeof t.id==='string'&&typeof t.label==='string'&&(t.owner===null||ACTORS[t.owner])&&typeof t.done==='boolean'&&(time(t.due)||t.due==='Not set'))&&Array.isArray(p.notes)&&p.notes.every(n=>n&&typeof n.text==='string'&&time(n.time)&&ACTORS[n.actor])&&SECTIONS.every(k=>typeof p.sbar?.[k]==='string'));
    if(s.draft&&(!validPatients(s.draft.patients)||![null,'jordan','taylor'].includes(s.draft.recipient)))return null;
    if(!s.draft&&!s.versions.length)return null;
    const ids=new Set();for(const [index,v] of s.versions.entries()){const transport=s.transport[v.id];if(ids.has(v.id)||v.number!==index+1||v.id!==`handoff-v${v.number}`||v.sender!=='alex'||!time(v.createdAt)||!validPatients(v.patients)||!['jordan','taylor'].includes(v.recipient)||!Array.isArray(v.changes)||!v.changes.every(c=>c&&['All','412','414','417','419'].includes(c.patient)&&typeof c.field==='string'&&typeof c.before==='string'&&typeof c.after==='string')||!transport||!(transport.deliveredAt===null||time(transport.deliveredAt))||!(transport.viewedAt===null||time(transport.viewedAt))||(transport.viewedAt&&!transport.deliveredAt))return null;ids.add(v.id);}
    if(s.acknowledgments.some(a=>!a||!ids.has(a.versionId)||!ACTORS[a.actor]||!time(a.time)||!s.transport[a.versionId].viewedAt||s.versions.find(v=>v.id===a.versionId).recipient!==a.actor)||new Set(s.acknowledgments.map(a=>a.versionId)).size!==s.acknowledgments.length)return null;
    if(s.questions.some(q=>!q||!ids.has(q.versionId)||!ACTORS[q.actor]||typeof q.id!=='string'||typeof q.text!=='string'||!time(q.time)||!(q.reply===null||typeof q.reply==='string')||!(q.resolvedAt===null||time(q.resolvedAt))||!s.versions.find(v=>v.id===q.versionId).patients.some(p=>p.id===q.patientId)))return null;
    if(s.events.some(e=>!e||typeof e.text!=='string'||!ACTORS[e.actor]||!time(e.time)||!(e.versionId===null||ids.has(e.versionId))))return null;
    if(s.draft){const d=s.draft;if(!(d.baseId===null||ids.has(d.baseId))||typeof d.recipientConfirmed!=='boolean')return null;if(d.verification&&(!(d.verification.verified===true||d.verification.verified===false)||![null,'08:15','18:15'].includes(d.verification.time)||typeof d.verification.text!=='string'))return null;if(d.conflict&&(!['p412','p414','p417','p419'].includes(d.conflict.patientId)||!SECTIONS.includes(d.conflict.field)||typeof d.conflict.mine!=='string'||typeof d.conflict.theirs!=='string'))return null;}
    const prefix=[];for(const [index,w] of s.workEvents.entries()) {
      const v=s.versions.find(v=>v.id===w?.versionId);const t=v?.patients.find(p=>p.id===w.patientId)?.tasks.find(t=>t.id===w.taskId);
      if(!w||w.id!==`w${index+1}`||!v||!t||t.done||v.recipient!==w.actor||t.owner!==w.actor||w.fingerprint!==taskFingerprint(t)||!s.transport[v.id]?.viewedAt||!time(w.time)||!['completed','reopened'].includes(w.status)||typeof w.note!=='string'||!w.note.trim()||w.note.length>500||typeof w.offline!=='boolean')return null;
      const prev=workFor({...s,workEvents:prefix},v.id,w.patientId,w.taskId);
      if(w.status==='completed'&&prev?.status==='completed'||w.status==='reopened'&&prev?.status!=='completed')return null;
      prefix.push(w);
    }
    return s;
  } catch {return null;}
}
export function sceneState(scene='draft') {
  let s=initialState();
  if(scene==='assist'){const p=s.draft.patients.find(p=>p.id==='p412');p.context='Pending result · follow-up planned';p.sbar.Recommendation='Check whether the pending result is available at the action’s expected time and record the follow-up.';}
  if(scene==='draft')return s;
  s=transition(s,{type:'ASSIGN',patientId:'p414',taskId:'t414',actor:'jordan'});
  s=transition(s,{type:'RECIPIENT',actor:'jordan'});s=transition(s,{type:'SEND'});
  if(scene==='sent')return s;
  s=transition(s,{type:'DELIVER',versionId:'handoff-v1'});s=transition(s,{type:'ROLE',actor:'jordan'});s=transition(s,{type:'VIEW',versionId:'handoff-v1'});
  if(scene==='incoming')return s;
  s=transition(s,{type:'ACK',versionId:'handoff-v1'});
  if(scene==='acknowledged')return s;
  if(scene==='work')return transition(s,{type:'ADVANCE_TIME',minutes:104});
  s=transition(s,{type:'ROLE',actor:'alex'});s=transition(s,{type:'START_UPDATE'});
  if(scene==='assist'){
    s=transition(s,{type:'EDIT_TASK',patientId:'p412',taskId:'t412',text:'Follow up on the pending laboratory result',owner:'jordan',due:'08:45'});
    s=transition(s,{type:'EDIT_TASK',patientId:'p414',taskId:'t414',text:'Arrange the requested family update',owner:'taylor',due:'09:00'});
  }
  s=transition(s,{type:'ADD_NOTE',patientId:'p419',text:'The day team requested a factual update at 07:30. The earlier note is retained in v1.'});
  s=transition(s,{type:'SEND'});s=transition(s,{type:'DELIVER',versionId:'handoff-v2'});s=transition(s,{type:'ROLE',actor:'jordan'});
  s=transition(s,{type:'VIEW',versionId:'handoff-v2'});return s;
}
