import {workPermission,workFor} from './model.mjs';
export const RESUMABLE_FORMS=['edit','add-note','add-task','edit-action','ask','reply','work-complete','work-reopen','conflict'];
const PATIENTS=['p412','p414','p417','p419'];
const ROUTES=['shift','actions','now','updates'];
export function viewScope(state,ui) {return state.actor==='alex'&&state.draft&&!ui.versionId?`draft:${state.draft.baseId||'first'}`:(ui.versionId||state.versions.at(-1)?.id||'empty');}
export function formKey(state,ui){return `${state.actor}:${viewScope(state,ui)}:${ui.modal}:${ui.patient}:${ui.editing?.taskId||''}:${ui.questionId||''}`;}
export function canResumeForm(state,ui) {
 if(!RESUMABLE_FORMS.includes(ui.modal))return false;
 const v=state.versions.find(v=>v.id===(ui.versionId||state.versions.at(-1)?.id));
 if(['edit','add-note','add-task','edit-action','conflict'].includes(ui.modal))return state.actor==='alex'&&Boolean(state.draft)&&!ui.versionId&&(ui.modal!=='edit-action'||state.draft.patients.some(p=>p.id===ui.editing?.patientId&&p.tasks.some(t=>t.id===ui.editing?.taskId)))&&(ui.modal!=='conflict'||Boolean(state.draft.conflict));
 if(ui.modal==='ask')return v?.recipient===state.actor&&Boolean(state.transport[v.id]?.viewedAt);
 if(ui.modal==='reply')return state.actor==='alex'&&state.questions.some(q=>q.id===ui.questionId&&!q.reply);
 const e=ui.editing;if(!e||workPermission(state,e.versionId,e.patientId,e.taskId))return false;
 const complete=workFor(state,e.versionId,e.patientId,e.taskId)?.status==='completed';
 return ui.modal==='work-reopen'?complete:!complete;
}
function validForms(forms){
 const result={};if(!forms||typeof forms!=='object'||Array.isArray(forms))return result;
 const names=new Set(['Situation','Background','Assessment','Recommendation','text','owner','due','choice']);
 for(const [key,values] of Object.entries(forms).slice(-32)){
  if(key.length>220||!key.startsWith('alex:')&&!key.startsWith('jordan:')&&!key.startsWith('taylor:')||!values||typeof values!=='object'||Array.isArray(values))continue;
  const fields=Object.fromEntries(Object.entries(values).filter(([k,v])=>names.has(k)&&typeof v==='string'&&v.length<=8000));if(Object.keys(fields).length)result[key]=fields;
 }
 return result;
}
export function workspaceRecord(state,ui,route,scrollY,forms) {
 if(!ROUTES.includes(route))return null;
 return {schema:1,actor:state.actor,route,scope:viewScope(state,ui),patient:ui.patient,mobileDetail:ui.mobileDetail,versionId:ui.versionId,
  filter:ui.filter,query:ui.query,actionFilter:ui.actionFilter,actionOwner:ui.actionOwner,actionQuery:ui.actionQuery,scrollY,
  modal:canResumeForm(state,ui)?ui.modal:null,editing:ui.editing,questionId:ui.questionId,forms:validForms(forms)};
}
export function restoreWorkspace(raw,state) {
 try{
  const value=JSON.parse(raw);if(value?.schema!==1||value.actor!==state.actor||!ROUTES.includes(value.route)||!PATIENTS.includes(value.patient))return null;
  const versionId=typeof value.versionId==='string'&&state.versions.some(v=>v.id===value.versionId&&(state.actor==='alex'||v.recipient===state.actor))?value.versionId:null;
  const ui={patient:value.patient,mobileDetail:typeof value.mobileDetail==='boolean'?value.mobileDetail:false,versionId,
   filter:['all','open'].includes(value.filter)?value.filter:'all',query:typeof value.query==='string'?value.query.slice(0,100):'',
   actionFilter:['all','open','done','unassigned'].includes(value.actionFilter)?value.actionFilter:'open',actionOwner:['all','alex','jordan','taylor'].includes(value.actionOwner)?value.actionOwner:'all',actionQuery:typeof value.actionQuery==='string'?value.actionQuery.slice(0,100):'',
   searchOpen:typeof value.query==='string'&&Boolean(value.query),actionSearchOpen:Boolean(value.actionQuery)||['alex','jordan','taylor'].includes(value.actionOwner),
   modal:RESUMABLE_FORMS.includes(value.modal)?value.modal:null,editing:value.editing&&typeof value.editing==='object'?{patientId:value.editing.patientId,taskId:value.editing.taskId,versionId:value.editing.versionId}:null,questionId:typeof value.questionId==='string'?value.questionId:null};
  if(value.scope!==viewScope(state,ui)||!canResumeForm(state,ui))ui.modal=null;
  return {route:value.route,ui,dialogScroll:Number.isFinite(value.dialogScroll)&&value.dialogScroll>=0?value.dialogScroll:0,scrollY:Number.isFinite(value.scrollY)&&value.scrollY>=0&&value.scrollY<=100000?value.scrollY:0,forms:validForms(value.forms)};
 }catch{return null;}
}
