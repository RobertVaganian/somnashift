import test from 'node:test';
import assert from 'node:assert/strict';
import {collectActions,filterPatients,makeBriefing} from '../dist/handoff-view.mjs';
import {initialState,sceneState,transition,changesBetween,restoreState} from '../dist/model.mjs';

test('the action board sorts expected times, filters owners/status and leaves patient data intact',()=>{
 const ps=initialState().draft.patients,original=structuredClone(ps);
 assert.deepEqual(collectActions(ps).map(r=>r.patient.room),['412','414']);
 assert.deepEqual(collectActions(ps,{filter:'unassigned'}).map(r=>r.patient.room),['414']);
 assert.deepEqual(collectActions(ps,{filter:'done',owner:'alex'}).map(r=>r.patient.room),['417']);
 assert.equal(collectActions(ps,{owner:'jordan',query:'ELLIS'}).length,1);
 assert.equal(collectActions(ps,{query:'family'}).length,1);
 assert.deepEqual(ps,original);
});
test('patient search combines room/name and open actions, with no matches handled explicitly',()=>{
 const ps=initialState().draft.patients;
 assert.deepEqual(filterPatients(ps,{query:'  414  '}).map(p=>p.id),['p414']);
 assert.deepEqual(filterPatients(ps,{query:'ellis',filter:'open'}).map(p=>p.id),['p412']);
 assert.equal(filterPatients(ps,{query:'sam',filter:'open'}).length,0);
 assert.equal(filterPatients(ps,{query:'not a patient'}).length,0);
});
test('a draft read-through includes outstanding verification, unassigned actions and its unsent label',()=>{
 const s=initialState();const text=makeBriefing({patients:s.draft.patients,unverified:true,conflict:true});
 assert.match(text,/UNSENT LOCAL DRAFT/);assert.match(text,/Recipient not chosen/);assert.match(text,/OWNER NOT ASSIGNED/);
 assert.match(text,/manual verification/);assert.match(text,/competing note is unresolved/);
 for(const p of s.draft.patients)assert.match(text,new RegExp(`ROOM ${p.room}`));
});
test('a submitted read-through uses its exact snapshot while a new draft changes',()=>{
 let s=sceneState('acknowledged');const v=s.versions[0];const original=makeBriefing({patients:v.patients,version:v});
 s=transition(s,{type:'ROLE',actor:'alex'});s=transition(s,{type:'START_UPDATE'});
 s=transition(s,{type:'EDIT_TASK',patientId:'p412',taskId:'t412',text:'Confirm availability with the day team',owner:'taylor',due:'10:30'});
 assert.equal(makeBriefing({patients:s.versions[0].patients,version:s.versions[0]}),original);
 assert.match(original,/Submitted handoff v1/);assert.match(original,/Robert Vaganian → Jordan Lee/);assert.match(original,/08:15/);assert.doesNotMatch(original,/10:30/);
 assert.ok(restoreState(JSON.stringify(s)));
});
test('action edits report every changed field and remain restricted to an outgoing draft',()=>{
 let s=sceneState('acknowledged');s=transition(s,{type:'ROLE',actor:'alex'});s=transition(s,{type:'START_UPDATE'});
 const before=s.draft.patients;
 s=transition(s,{type:'EDIT_TASK',patientId:'p412',taskId:'t412',text:'Check the outstanding result',owner:'taylor',due:'10:30'});
 s=transition(s,{type:'COMPLETE_TASK',patientId:'p412',taskId:'t412'});
 const diff=changesBetween(before,s.draft.patients);
 assert.deepEqual(diff.map(c=>c.field),['Action description','Action time','Action owner','Action status']);
 const action={type:'EDIT_TASK',patientId:'p412',taskId:'t412',text:'New action',owner:'jordan',due:'25:00'};
 assert.throws(()=>transition(s,action),/valid time/);
 assert.throws(()=>transition(transition(s,{type:'ROLE',actor:'jordan'}),{...action,due:'09:00'}),/Only the outgoing/);
 assert.throws(()=>transition(s,{...action,text:'   ',due:'09:00'}),/Write an action/);
 assert.equal(s.versions[0].patients[0].tasks[0].due,'08:15');
});
