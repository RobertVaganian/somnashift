import {readFile,mkdir,writeFile} from 'node:fs/promises';
const output=new URL('../dist/capture-preview/',import.meta.url);
await mkdir(output,{recursive:true});
for(const [template,name] of [['capture-frame.html','phone.html'],['capture-surface.html','surface.html']]){
 const html=(await readFile(new URL(template,import.meta.url),'utf8'))
  .replaceAll('../dist/fonts/','../fonts/')
  .replaceAll("'../dist/'+route+'/?'","'../'+route+'/?'");
 await writeFile(new URL(name,output),html);
}
console.log('Capture layouts ready: /capture-preview/phone.html and /capture-preview/surface.html. Run npm run dev to open them.');
