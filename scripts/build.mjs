import {readFile,mkdir,writeFile,rm} from 'node:fs/promises';
await rm('dist/capture-preview',{recursive:true,force:true});
const html=await readFile('dist/index.html','utf8');
for(const route of ['shift','actions','now','updates','case-study','watch']){
 await mkdir(`dist/${route}`,{recursive:true});
 await writeFile(`dist/${route}/index.html`,html.replaceAll('href="./','href="../').replaceAll('src="./','src="../'));
}
await writeFile('dist/404.html',html);
console.log('Built static entries: /, /shift, /actions, /now, /updates, /watch, /case-study.');
