import {ACTORS} from './model.mjs';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const check='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
export function ownerPicker(id,value,{filter=false}={}){
 const options=[{id:filter?'all':'',name:filter?'Everyone':'Assign later',initials:'—'},...Object.values(ACTORS)];
 const current=options.find(o=>o.id===value)||options[0];
 return `<div class="field-label owner-picker" data-dom-key="${id}"><span id="${id}-label">Owner</span><input type="hidden" name="owner" value="${escape(current.id)}"><button type="button" class="owner-trigger" id="${id}" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}-options" aria-labelledby="${id}-label ${id}-value"><span id="${id}-value" data-owner-value>${escape(current.name)}</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.65" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="owner-options" id="${id}-options" role="listbox" aria-labelledby="${id}-label" popover="manual">${options.map((o,i)=>`<div id="${id}-option-${i}" class="owner-option" role="option" aria-selected="${o.id===current.id}" data-owner-id="${escape(o.id)}"><span class="owner-initials" aria-hidden="true">${o.initials}</span><span>${escape(o.name)}</span><span class="owner-check">${check}</span></div>`).join('')}</div></div>`;
}
let opened=null,active=0,search='',lastTyped=0,positionFrame=0;
const parts=root=>({trigger:root.querySelector('.owner-trigger'),input:root.querySelector('input'),list:root.querySelector('.owner-options'),options:[...root.querySelectorAll('[role=option]')]});
export function closeOwnerPickers(){
 cancelAnimationFrame(positionFrame);positionFrame=0;
 if(!opened)return;
 const {trigger,list,options}=parts(opened);
 if(list.matches(':popover-open'))list.hidePopover();
 list.classList.remove('is-open');trigger.setAttribute('aria-expanded','false');trigger.removeAttribute('aria-activedescendant');
 options.forEach(o=>o.removeAttribute('data-active'));opened=null;search='';
}
export function syncOwnerPickers(){
 document.querySelectorAll('.owner-picker').forEach(root=>{
  const {input,options}=parts(root),selected=options.find(o=>o.dataset.ownerId===input.value)||options[0];
  input.value=selected.dataset.ownerId;root.querySelector('[data-owner-value]').textContent=selected.children[1].textContent;
  options.forEach(o=>o.setAttribute('aria-selected',String(o===selected)));
 });
}
function highlight(index){
 const {trigger,options}=parts(opened);active=(index+options.length)%options.length;
 options.forEach((o,i)=>o.toggleAttribute('data-active',i===active));
 trigger.setAttribute('aria-activedescendant',options[active].id);
 options[active].scrollIntoView({block:'nearest',behavior:'instant'});
}
function open(root,index){
 closeOwnerPickers();opened=root;
 const {trigger,list,input,options}=parts(root);
 function position(){
  if(opened!==root)return;
  if(!root.isConnected){closeOwnerPickers();return;}
  const rect=trigger.getBoundingClientRect(),viewport=window.visualViewport;
  const topEdge=viewport?.offsetTop||0,height=viewport?.height||innerHeight,leftEdge=viewport?.offsetLeft||0,width=viewport?.width||innerWidth;
  const below=height+topEdge-rect.bottom-12,above=rect.top-topEdge-12,wanted=options.length*48+12;
  const up=below<wanted&&above>below,available=Math.max(48,up?above:below),menuHeight=Math.min(wanted,available);
  const styles={width:`${Math.min(rect.width,width-24)}px`,left:`${Math.max(leftEdge+12,Math.min(rect.left,leftEdge+width-rect.width-12))}px`,top:`${up?rect.top-menuHeight-6:rect.bottom+6}px`,maxHeight:`${menuHeight}px`};
  for(const [key,value] of Object.entries(styles))if(list.style[key]!==value)list.style[key]=value;
  positionFrame=requestAnimationFrame(position);
 }
 position();
 if(list.showPopover)list.showPopover();else list.classList.add('is-open');
 trigger.setAttribute('aria-expanded','true');search='';
 highlight(index??Math.max(0,options.findIndex(o=>o.dataset.ownerId===input.value)));
}
function choose(option){
 const root=opened;if(!root)return;const {input,trigger}=parts(root);
 input.value=option.dataset.ownerId;syncOwnerPickers();closeOwnerPickers();trigger.focus({preventScroll:true});
 input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
}
export function installOwnerPickers(){
 document.addEventListener('click',event=>{
  const trigger=event.target.closest('.owner-trigger');
  if(trigger){event.preventDefault();const root=trigger.closest('.owner-picker');if(opened===root)closeOwnerPickers();else open(root);return;}
  const option=event.target.closest('.owner-option');if(option&&opened?.contains(option)){event.preventDefault();choose(option);}
 });
 document.addEventListener('pointerdown',event=>{if(!opened)return;if(opened.contains(event.target)){if(event.target.closest('.owner-option'))event.preventDefault();}else closeOwnerPickers();},true);
 document.addEventListener('focusin',event=>{if(opened&&!opened.contains(event.target))closeOwnerPickers();});
 document.addEventListener('keydown',event=>{
  const trigger=event.target.closest('.owner-trigger');if(!trigger)return;
  const root=trigger.closest('.owner-picker'),isOpen=opened===root;
  if(event.key==='Tab'){closeOwnerPickers();return;}
  if(event.key==='Escape'&&isOpen){event.preventDefault();event.stopImmediatePropagation();closeOwnerPickers();return;}
  if(['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(event.key)){
   event.preventDefault();
   if(!isOpen){open(root,event.key==='Home'?0:event.key==='End'?parts(root).options.length-1:undefined);return;}
   if(['Enter',' '].includes(event.key)){choose(parts(root).options[active]);return;}
   highlight(event.key==='Home'?0:event.key==='End'?parts(root).options.length-1:active+(event.key==='ArrowDown'?1:-1));return;
  }
  if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){
   event.preventDefault();if(!isOpen)open(root);
   const now=performance.now();search=now-lastTyped>700?'':search;lastTyped=now;search+=event.key.toLowerCase();
   const {options}=parts(root);const prefix=[...search].every(c=>c===search[0])?search[0]:search;
   const start=prefix.length===1?active+1:active;
   const found=Array.from({length:options.length},(_,i)=>(start+i)%options.length).find(i=>options[i].children[1].textContent.toLowerCase().startsWith(prefix));
   if(found!==undefined)highlight(found);
  }
 },true);
 window.addEventListener('resize',closeOwnerPickers);
 window.visualViewport?.addEventListener('resize',closeOwnerPickers);
 document.addEventListener('reset',()=>queueMicrotask(syncOwnerPickers));
}
