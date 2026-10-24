export function serverUrl(value:string|undefined){
  try{const url=new URL(value||'');return url.protocol==='https:'&&!url.username&&!url.password?url.href:''}catch{return ''}
}
export function mobilePlatform(ua:string,touchPoints=0){
  if(/Android/i.test(ua))return 'android';
  if(/iPhone|iPad|iPod/i.test(ua)||(/Macintosh/i.test(ua)&&touchPoints>1))return 'ios';
  return '';
}
export function appUrl(value:string|undefined,fallback:string){
  const url=(value||fallback).trim();
  return /^(jellyfin|org\.jellyfin\.expo):\/\/[^\s]*$/i.test(url)?url:fallback;
}
