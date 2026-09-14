import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../dist/app.css',import.meta.url),'utf8');
function luminance(hex){const values=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return values[0]*.2126+values[1]*.7152+values[2]*.0722;}
const ratio=(a,b)=>{const values=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (values[0]+.05)/(values[1]+.05);};
for(const [mode,selector] of [['daylight',':root'],['twilight',':root[data-theme=twilight]'],['amber',':root[data-theme=amber]']]){
 const start=css.indexOf(selector+'{');const block=css.slice(start,css.indexOf('}',start));
 const tokens=Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi)].map(m=>[m[1],m[2]]));
 for(const [fg,bg] of [['ink','paper'],['ink','bg'],['muted','paper'],['muted','bg'],['muted','subtle'],['faint','bg'],['accent-ink','accent'],['accent','paper'],['accent','bg'],['warn','bg'],['good','good-bg'],['warn','warn-bg'],['danger','danger-bg']])test(`${mode}: ${fg} on ${bg} reaches 4.5:1`,()=>assert.ok(ratio(tokens[fg],tokens[bg])>=4.5,`${ratio(tokens[fg],tokens[bg]).toFixed(2)}:1`));
}
