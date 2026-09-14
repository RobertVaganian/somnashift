import {demoTime,workPatients} from './model.mjs';
import {collectActions} from './handoff-view.mjs';
const minutes=value=>{if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))return null;const [h,m]=value.split(':').map(Number);return h*60+m;};
export function dueState(due,now) {
 const deadline=minutes(due),current=minutes(now);if(deadline===null||current===null)return {bucket:'undated',label:'Time not set'};
 const delta=deadline-current;
 return delta<0?{bucket:'overdue',label:`${-delta} min past expected time`}:delta<=60?{bucket:'soon',label:delta===0?'Expected now':`In ${delta} min`}:{bucket:'later',label:`Expected ${due}`};
}
export function nowData(state) {
 const version=state.versions.at(-1),now=demoTime(state);
 const accessible=Boolean(version&&(state.actor==='alex'||version.recipient===state.actor));
 const ready=accessible&&Boolean(state.transport[version.id]?.viewedAt);
 const groups={overdue:[],soon:[],later:[],undated:[]};
 if(ready)for(const row of collectActions(workPatients(state,version),{owner:state.actor,filter:'open'}))groups[dueState(row.task.due,now).bucket].push(row);
 const questions=state.questions.filter(q=>!q.reply&&(state.actor==='alex'||q.actor===state.actor));
 return {version,now,accessible,ready,groups,questions,needsReview:accessible&&!state.acknowledgments.some(a=>a.versionId===version.id&&a.actor===state.actor)};
}
