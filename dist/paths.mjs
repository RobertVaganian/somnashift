export function appPath(path,baseUrl=import.meta.url){
  const url=new URL(path.replace(/^\//,''),new URL('.',baseUrl));
  return url.pathname+url.search+url.hash;
}
