import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,sceneState,transition,restoreState} from '../dist/model.mjs';
import {notificationItems} from '../dist/notifications.mjs';
const as=(state,actor)=>transition(state,{type:'ROLE',actor});
const unread=state=>notificationItems(state).filter(item=>!item.read);
const mark=(state,ids,read=true)=>transition(state,{type:'NOTIFICATION_READ',ids,read});

// Exercise communication and review boundaries, not the presentation's labels.
test('a draft has an empty inbox and sending alone does not report delivery',()=>{
 assert.deepEqual(notificationItems(initialState()),[]);
 const sent=sceneState('sent');
 assert.deepEqual(notificationItems(sent),[]);
 assert.deepEqual(notificationItems(as(sent,'jordan')),[]);
});
test('delivery reaches only the named recipient, with the submitted version as its source',()=>{
 const sent=sceneState('sent');
 const delivered=transition(sent,{type:'DELIVER',versionId:'handoff-v1'});
 assert.equal(notificationItems(delivered).length,0);
 const incoming=notificationItems(as(delivered,'jordan'));
 assert.equal(incoming.length,1);assert.equal(incoming[0].versionId,'handoff-v1');
 assert.equal(incoming[0].actor,'alex');assert.equal(incoming[0].read,false);
 assert.equal(notificationItems(as(delivered,'taylor')).length,0);
 assert.equal(notificationItems(as(delivered,'jordan')).length,1);
});
test('a question notifies its sender and a reply returns only to the colleague who asked',()=>{
 let s=sceneState('incoming');
 s=transition(s,{type:'ASK',versionId:'handoff-v1',patientId:'p412',text:'Please confirm the time.'});
 assert.equal(notificationItems(as(s,'alex')).filter(n=>n.kind==='question').length,1);
 assert.equal(notificationItems(as(s,'taylor')).length,0);
 s=transition(as(s,'alex'),{type:'REPLY',questionId:'q1',text:'The planned time is 08:15.'});
 const reply=notificationItems(as(s,'jordan')).find(n=>n.kind==='reply');
 assert.equal(reply.questionId,'q1');assert.equal(reply.patientId,'p412');assert.equal(reply.detail,'The planned time is 08:15.');
 assert.equal(notificationItems(as(s,'alex')).some(n=>n.kind==='reply'),false);
 assert.equal(notificationItems(as(s,'taylor')).length,0);
});
test('reading notifications changes neither submitted information nor review and transport records',()=>{
 const s=sceneState('notifications');const before=structuredClone(s);
 const next=mark(s,notificationItems(s).map(n=>n.id));
 for(const key of ['versions','acknowledgments','transport','questions','workEvents','events','tick'])assert.deepEqual(next[key],before[key],key);
 assert.equal(unread(next).length,0);assert.equal(unread(s).length,2);
 assert.equal(next.acknowledgments.some(a=>a.versionId==='handoff-v2'),false);
 assert.equal(next.transport['handoff-v2'].viewedAt,null);
});
test('read and unread state survives recovery separately for each colleague',()=>{
 let s=sceneState('notifications');const id=unread(s)[0].id;
 s=mark(s,[id]);const recovered=restoreState(JSON.stringify(s));
 assert.equal(notificationItems(recovered).find(n=>n.id===id).read,true);
 assert.equal(notificationItems(as(recovered,'alex')).every(n=>!n.read),true);
 s=mark(recovered,[id],false);assert.equal(notificationItems(s).find(n=>n.id===id).read,false);
});
test('marking all read does not consume a later delivery',()=>{
 let s=sceneState('incoming');s=mark(s,notificationItems(s).map(n=>n.id));
 s=transition(s,{type:'ACK',versionId:'handoff-v1'});
 s=transition(as(s,'alex'),{type:'START_UPDATE'});
 s=transition(s,{type:'ADD_NOTE',patientId:'p419',text:'A new factual shift note.'});
 s=transition(s,{type:'SEND'});s=transition(s,{type:'DELIVER',versionId:'handoff-v2'});
 s=as(s,'jordan');assert.equal(unread(s).length,1);assert.equal(unread(s)[0].versionId,'handoff-v2');
 assert.equal(notificationItems(s).find(n=>n.versionId==='handoff-v1').read,true);
});
test('the inbox preserves an earlier version target after an update is delivered',()=>{
 const items=notificationItems(sceneState('notifications'));
 assert.equal(items.find(n=>n.kind==='reply').versionId,'handoff-v1');
 assert.equal(items[0].versionId,'handoff-v2');
 assert.equal(items.length,3);
});
test('unrelated notifications cannot be marked read and a legacy saved handoff still restores',()=>{
 const s=sceneState('notifications');
 assert.throws(()=>mark(as(s,'taylor'),[notificationItems(s)[0].id]));
 assert.throws(()=>mark(s,['missing']));assert.throws(()=>mark(s,[], 'yes'));
 const legacy=structuredClone(s);delete legacy.notificationReads;
 const restored=restoreState(JSON.stringify(legacy));assert.ok(restored);assert.equal(unread(restored).length,3);
});
test('damaged inbox preferences are discarded without losing the handoff',()=>{
 const s=sceneState('notifications');s.notificationReads={jordan:['unknown',null,4],alex:'invalid'};
 const recovered=restoreState(JSON.stringify(s));assert.ok(recovered);
 assert.deepEqual(recovered.versions,s.versions);assert.equal(unread(recovered).length,3);
});
test('work completions notify the outgoing colleague, not the person recording their own work',()=>{
 let s=sceneState('work');s=transition(s,{type:'RECORD_WORK',versionId:'handoff-v1',patientId:'p412',taskId:'t412',status:'completed',note:'Recorded a fictional follow-up.'});
 assert.equal(notificationItems(s).some(n=>n.kind==='work-completed'),false);
 const received=notificationItems(as(s,'alex')).find(n=>n.kind==='work-completed');
 assert.equal(received.patientId,'p412');assert.equal(received.versionId,'handoff-v1');
});
test('the sample inbox starts with two unread events and a previously read delivery',()=>{
 const s=sceneState('notifications');assert.equal(unread(s).length,2);
 assert.equal(notificationItems(s).filter(n=>n.read).length,1);
 assert.deepEqual(unread(s).map(n=>n.kind),['delivered','reply']);
});
