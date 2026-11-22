/* Small DOM updates keep reading position, input and native dialogs intact. */
const EASE='cubic-bezier(.2,.75,.25,1)';
const CARD='[data-motion-card]';
function key(node){
 if(node.nodeType!==1)return null;
 if(node.id)return `${node.tagName}#${node.id}`;
 if(node.dataset.domKey)return `${node.tagName}:${node.dataset.domKey}`;
 if(node.dataset.motionCard)return `${node.tagName}:card:${node.dataset.motionCard}`;
 if(node.dataset.action)return `${node.tagName}:action:${node.dataset.action}:${node.dataset.value||node.dataset.patient||node.dataset.task||node.dataset.question||''}`;
 if(node.dataset.nav)return `${node.tagName}:nav:${node.dataset.nav}`;
 if(node.name)return `${node.tagName}:field:${node.name}:${node.type==='radio'?node.value:''}`;
 if(node.tagName==='IFRAME')return `IFRAME:${node.getAttribute('src')}`;
 return null;
}
function compatible(a,b){return a.nodeType===b.nodeType&&(a.nodeType!==1||a.tagName===b.tagName&&key(a)===key(b)&&a.classList[0]===b.classList[0]);}
function attributes(old,fresh){
 const valueChanged=old.tagName==='INPUT'&&!['checkbox','radio'].includes(old.type)&&fresh.hasAttribute('value')&&old.getAttribute('value')!==fresh.getAttribute('value');
 for(const attr of [...old.attributes])if(!fresh.hasAttribute(attr.name)&&!(['DETAILS','DIALOG'].includes(old.tagName)&&attr.name==='open'))old.removeAttribute(attr.name);
 for(const attr of fresh.attributes)if(old.getAttribute(attr.name)!==attr.value)old.setAttribute(attr.name,attr.value);
 if(valueChanged)old.value=fresh.value;
 if(old.tagName==='INPUT'&&['checkbox','radio'].includes(old.type))old.checked=fresh.checked;
 if(old.tagName==='OPTION')old.selected=fresh.selected;
}
function reconcile(parent,freshParent){
 const available=[...parent.childNodes],used=new Set();let cursor=parent.firstChild;
 for(const fresh of [...freshParent.childNodes]){
  const id=key(fresh);
  let old=id?available.find(n=>!used.has(n)&&key(n)===id):available.find(n=>!used.has(n)&&compatible(n,fresh));
  if(!old){old=fresh.cloneNode(true);parent.insertBefore(old,cursor);}
  else{
   used.add(old);if(old!==cursor)parent.insertBefore(old,cursor);
   if(old.nodeType!==1){if(old.nodeValue!==fresh.nodeValue)old.nodeValue=fresh.nodeValue;}
   else{
    if(old.isEqualNode(fresh)){cursor=old.nextSibling;continue;}
    attributes(old,fresh);
    if(old.tagName!=='IFRAME'&&old.tagName!=='TEXTAREA')reconcile(old,fresh);
    // Preserve a person's typed value until the explicit form handler applies it.
    if(old.tagName==='TEXTAREA')old.defaultValue=fresh.defaultValue;
   }
  }
  cursor=old.nextSibling;
 }
 for(const node of available)if(!used.has(node)&&node.parentNode===parent)node.remove();
}
export function createMotion({onToastExpired,onDismiss}){
 const system=matchMedia('(prefers-reduced-motion: reduce)');
 const narrow=()=>matchMedia('(max-width:900px)').matches;
 let userReduced=false,previous=null,revision=0,frame=0,dialog=null,dialogContext='';
 let lockY=null,toastTimer,toastValue='',pausedToast=false;
 const running=new Set();
 let sheetMotion=null,closing=null;
 let observedHandoffBar=null;
 const handoffBarObserver=typeof ResizeObserver==='function'?new ResizeObserver(entries=>{for(const entry of entries)if(entry.target===observedHandoffBar)document.documentElement.style.setProperty('--handoff-bar-height',`${entry.target.getBoundingClientRect().height}px`);}):null;
 const toastHost=document.createElement('div');toastHost.id='toast-host';document.body.append(toastHost);
 const reduced=()=>system.matches||userReduced;
 function animate(el,frames,duration=200,options={}){
  if(!el||reduced()||!el.animate)return null;
  const animation=el.animate(frames,{duration,easing:EASE,...options});running.add(animation);
  animation.finished.catch(()=>{}).finally(()=>{running.delete(animation);animation.cancel();});return animation;
 }
 function stop(){cancelAnimationFrame(frame);for(const a of running)a.cancel();running.clear();}
 function scrollY(){return lockY??window.scrollY;}
 function scrollTo(y){if(lockY!==null){lockY=y;document.body.style.top=`-${y}px`;}else window.scrollTo({top:y,behavior:'instant'});}
 function lock(){if(lockY!==null)return;lockY=window.scrollY;document.documentElement.dataset.dialogOpen='true';document.body.style.top=`-${lockY}px`;}
 function unlock(){if(lockY===null)return;const y=lockY;lockY=null;delete document.documentElement.dataset.dialogOpen;document.body.style.removeProperty('top');window.scrollTo({top:y,behavior:'instant'});}
 function animateSheet(sheet,frames,duration,options={}){
  sheetMotion?.cancel();
  sheetMotion=null;
  if(reduced()||!sheet.animate)return;
  const animation=sheet.animate(frames,{duration,easing:EASE,...options});
  sheetMotion=animation;
  animation.finished.then(()=>{
   if(sheetMotion===animation)sheetMotion=null;
   animation.cancel();
  },()=>{});
 }
 function finishDialog(){
  sheetMotion?.cancel();sheetMotion=null;
  const target=dialog;dialog=null;dialogContext='';
  target.close();target.remove();unlock();
 }
 function finishClose(job){
  if(closing!==job)return;
  closing=null;finishDialog();job.animation.cancel();job.after?.();
 }
 function exitDialog(after){
  if(!dialog){after?.();return;}
  if(closing)return;
  const target=dialog;
  if(reduced()||!target.animate){finishDialog();after?.();return;}
  const transform=getComputedStyle(target).transform;
  sheetMotion?.cancel();sheetMotion=null;
  target.dataset.closing='';target.inert=true;
  const animation=target.animate([
   {transform,opacity:1},
   {transform:`${transform==='none'?'':transform} translateY(${narrow()?20:8}px)`.trim(),opacity:0},
  ],{duration:140,easing:'ease-in',fill:'forwards'});
  const job={animation,after};closing=job;
  animation.finished.then(()=>finishClose(job),()=>finishClose(job));
 }
 function dialogUpdate(fresh,context){
  if(!fresh){if(dialog)exitDialog();return;}
  if(closing){
   const job=closing;closing=null;job.animation.cancel();
   dialog.inert=false;delete dialog.dataset.closing;
  }
  const changed=dialogContext!==context;
  if(!dialog){
   dialog=fresh;dialog.classList.add('motion-dialog');document.body.append(dialog);
   lock();dialog.showModal();bindSheetGesture(dialog);
   animateSheet(dialog,[{opacity:.85,transform:`translateY(${narrow()?18:8}px)`},{opacity:1,transform:'none'}],190);
  }else if(changed){
   attributes(dialog,fresh);dialog.classList.add('motion-dialog');
   dialog.replaceChildren(...fresh.childNodes);
  }else{attributes(dialog,fresh);dialog.classList.add('motion-dialog');reconcile(dialog,fresh);}
  dialogContext=context;
  return {element:dialog,changed};
 }
 function bindSheetGesture(sheet){
  let drag=null,dragFrame=0;
  const clearDrag=()=>{
   cancelAnimationFrame(dragFrame);dragFrame=0;drag=null;
   sheet.style.removeProperty('transform');
  };
  const settle=()=>{
   const from=sheet.style.transform;clearDrag();
   if(from&&sheet.isConnected&&!sheet.inert)animateSheet(sheet,[{transform:from},{transform:'none'}],155);
  };
  sheet.addEventListener('pointerdown',event=>{
   if(drag||!narrow()||sheet.inert||event.button!==0||!event.target.closest('.dialog-head')||event.target.closest('button,a,input'))return;
   drag={id:event.pointerId,x:event.clientX,y:event.clientY,started:performance.now(),distance:0};
  });
  sheet.addEventListener('pointermove',event=>{
   if(!drag||event.pointerId!==drag.id||sheet.inert)return;
   const dy=event.clientY-drag.y;
   if(Math.abs(event.clientX-drag.x)>Math.abs(dy)+14){settle();return;}
   drag.distance=Math.max(0,Math.min(dy,200));
   if(drag.distance>6&&!sheet.hasPointerCapture(event.pointerId)){
    sheetMotion?.cancel();sheetMotion=null;
    sheet.setPointerCapture(event.pointerId);
   }
   if(!dragFrame&&!reduced()&&(drag.distance>6||sheet.style.transform)){
    dragFrame=requestAnimationFrame(()=>{
     dragFrame=0;
     if(drag&&!sheet.inert)sheet.style.transform=`translateY(${drag.distance}px)`;
    });
   }
  });
  sheet.addEventListener('pointerup',event=>{
   if(!drag||event.pointerId!==drag.id)return;
   const {distance,started}=drag;
   if(distance>95||(distance>35&&distance/(performance.now()-started)>.65)){
    cancelAnimationFrame(dragFrame);dragFrame=0;drag=null;onDismiss?.();
   }else settle();
  });
  const cancel=event=>{if(drag?.id===event.pointerId)settle();};
  sheet.addEventListener('pointercancel',cancel);
  sheet.addEventListener('lostpointercapture',event=>{if(event.target===sheet)cancel(event);});
 }
 const disclosures=new WeakMap();
 document.addEventListener('click',event=>{
  const summary=event.target.closest?.('summary'),details=summary?.parentElement;
  if(!details||details.tagName!=='DETAILS'||reduced()||!details.animate||event.target.closest('a,button,input'))return;
  event.preventDefault();
  const previous=disclosures.get(details),opening=previous?!previous.opening:!details.open;
  const from=details.getBoundingClientRect().height;
  if(previous){previous.valid=false;previous.animation?.cancel();}
  details.open=true;const expanded=details.getBoundingClientRect().height,style=getComputedStyle(details);
  const collapsed=summary.getBoundingClientRect().height+parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)+parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth);
  details.style.overflow='clip';
  const animation=animate(details,[{height:`${from}px`},{height:`${opening?expanded:collapsed}px`}],180);
  const job={opening,valid:true,animation};disclosures.set(details,job);
  animation.finished.catch(()=>{}).then(()=>{if(!job.valid)return;details.open=opening;details.style.removeProperty('overflow');disclosures.delete(details);});
 });
 function toastSchedule(value){
  if(value===toastValue)return;toastValue=value;clearTimeout(toastTimer);
  if(!value)return;
  const expire=()=>{
   const notice=toastHost.querySelector('.notice.success');
   if(pausedToast||document.hidden||notice?.contains(document.activeElement)){toastTimer=setTimeout(expire,1000);return;}
   toastValue='';if(previous)previous={...previous,toast:''};onToastExpired?.();
   const leave=animate(notice,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(5px)'}],130);
   if(leave)leave.finished.catch(()=>{}).then(()=>{if(!toastValue)notice?.remove();});else notice?.remove();
  };
  toastTimer=setTimeout(expire,6500);
 }
 document.addEventListener('pointerover',e=>{if(e.target.closest?.('.notice.success'))pausedToast=true;});
 document.addEventListener('pointerout',e=>{if(e.target.closest?.('.notice.success')&&!e.relatedTarget?.closest?.('.notice.success'))pausedToast=false;});
 function update(app,html,next){
  const was=previous;const token=++revision;stop();
  const compact=narrow();
  const oldPanels=new Set(app.querySelectorAll('.search-field,.action-search,.guide-banner'));
  const oldCards=compact?null:new Map([...app.querySelectorAll(CARD)].map(el=>[el.dataset.motionCard,el.getBoundingClientRect()]));
  const template=document.createElement('template');template.innerHTML=html;
  const freshDialog=template.content.querySelector('dialog');freshDialog?.remove();
  const notice=template.content.querySelector('.notice.success'),notices=document.createDocumentFragment();if(notice)notices.append(notice);reconcile(toastHost,notices);
  reconcile(app,template.content);
  const handoffBar=app.querySelector('.handoff-bar');
  if(handoffBar!==observedHandoffBar){handoffBarObserver?.disconnect();observedHandoffBar=handoffBar;if(handoffBar)handoffBarObserver?.observe(handoffBar);}
  document.documentElement.style.setProperty('--handoff-bar-height',`${handoffBar?.getBoundingClientRect().height||0}px`);
  const dialogResult=dialogUpdate(freshDialog,next.modalContext);
  const routeChanged=was&&was.page!==next.page;
  const detailChanged=was&&next.page==='shift'&&(was.patient!==next.patient||was.detail!==next.detail);
  const actorChanged=was&&was.actor!==next.actor;
  const toastChanged=was&&was.toast!==next.toast;
  frame=requestAnimationFrame(()=>{
   if(token!==revision||reduced())return;
   if(routeChanged||actorChanged||detailChanged){
    // Moving all of main also moves its sticky handoff action.
    const workspace=app.querySelector('main');
    const target=detailChanged||next.detail?app.querySelector(next.detail||!compact?'.detail-panel':'.patient-board'):workspace?.querySelector('.page-heading');
    animate(target,[{opacity:.88,transform:'translateY(4px)'},{opacity:1,transform:'none'}],150);
   }else if(oldCards&&!next.modal&&!was?.modal){
    for(const el of [...app.querySelectorAll(CARD)].slice(0,12)){
     const rect=el.getBoundingClientRect(),old=oldCards.get(el.dataset.motionCard);if(rect.bottom<0||rect.top>innerHeight)continue;
     if(!old)animate(el,[{opacity:.5,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],170);
     else if(Math.abs(old.top-rect.top)>1&&Math.abs(old.top-rect.top)<innerHeight/2)animate(el,[{transform:`translateY(${old.top-rect.top}px)`},{transform:'translateY(0)'}],180);
    }
   }
   for(const panel of app.querySelectorAll('.search-field,.action-search,.guide-banner'))if(!oldPanels.has(panel))animate(panel,[{opacity:.5,transform:'translateY(-4px)'},{opacity:1,transform:'translateY(0)'}],160);
   if(toastChanged&&next.toast)animate(document.querySelector('.notice.success'),[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],180);
  });
  toastSchedule(next.toast);previous=next;return dialogResult;
 }
 function setReduced(value){userReduced=value;document.documentElement.dataset.reduceMotion=String(reduced());if(reduced()){stop();sheetMotion?.cancel();sheetMotion=null;if(closing)finishClose(closing);}}
 system.addEventListener('change',()=>setReduced(userReduced));
 function viewport(){const view=window.visualViewport;document.documentElement.style.setProperty('--usable-height',`${view?.height||innerHeight}px`);document.documentElement.style.setProperty('--keyboard-inset',`${Math.max(0,innerHeight-(view?.height||innerHeight)-(view?.offsetTop||0))}px`);}
 viewport();window.visualViewport?.addEventListener('resize',viewport,{passive:true});window.visualViewport?.addEventListener('scroll',viewport,{passive:true});window.addEventListener('resize',viewport,{passive:true});
 return {update,scrollY,scrollTo,setReduced,close:exitDialog,reduced};
}
