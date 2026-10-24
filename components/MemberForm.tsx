import {type FormEvent,useEffect,useRef,useState} from 'react';
import {FORM_URL,bankDetails} from '@/lib/form-settings';
const messages:Record<string,string>={
 consent:'Please check the consent box before sending your form.',
 rate_limit:'You’ve made several attempts. Please wait a few minutes before trying again.',
 invalid_form:'We couldn’t accept your form. Please check your details and try again.',
 unavailable:'We couldn’t send your form right now. Please try again later or contact b1ng3b0x@gmail.com.'
};
export default function MemberForm({kind,onSuccess}:{kind:'signup'|'request';onSuccess:(d:any)=>void}){
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const id=useRef('');const formRef=useRef<HTMLFormElement>(null);const errorRef=useRef<HTMLParagraphElement>(null);
 const pendingKey='bingebox-pending-'+kind;const draftKey='bingebox-draft-'+kind;
 useEffect(()=>{
  const url=new URL(location.href);
  if(url.searchParams.get('bbx_kind')!==kind)return;
  const saved=url.searchParams.get('bbx_saved');const code=url.searchParams.get('bbx_error');
  let pending='';try{pending=sessionStorage.getItem(pendingKey)||''}catch{}
  if(!saved&&!code)return;
  if(code){
   setError(messages[code]||messages.unavailable);
   try{
    const draft=JSON.parse(sessionStorage.getItem(draftKey)||'null');
    if(draft&&Date.now()-draft.savedAt<30*60*1000){
     for(const name of ['name','email','type','title']){
      const field=formRef.current?.elements.namedItem(name);
      if((field instanceof HTMLInputElement||field instanceof HTMLSelectElement)&&typeof draft.fields[name]==='string')field.value=draft.fields[name];
     }
     id.current=pending;
    }
    sessionStorage.removeItem(draftKey);
   }catch{}
  }else if(saved&&saved===pending){
   try{sessionStorage.removeItem(pendingKey);sessionStorage.removeItem(draftKey)}catch{}
   onSuccess({bank:bankDetails});
  }else{setError('Please check your email or contact our team to confirm your submission before sending again.');}
  for(const key of ['bbx_saved','bbx_kind','bbx_error'])url.searchParams.delete(key);
  history.replaceState(null,'',url);
 },[kind]);
 useEffect(()=>{if(error)errorRef.current?.focus()},[error]);
 useEffect(()=>{const reset=()=>setBusy(false);window.addEventListener('pageshow',reset);return()=>window.removeEventListener('pageshow',reset)},[]);
 function submit(e:FormEvent<HTMLFormElement>){
  setError('');
  if(!FORM_URL){e.preventDefault();setError(messages.unavailable);return}
  try{
   const endpoint=new URL(FORM_URL);if(endpoint.protocol!=='https:')throw Error();
   if(!id.current)id.current=crypto.randomUUID();
   sessionStorage.setItem(pendingKey,id.current);
   const form=e.currentTarget;const data=new FormData(form);const fields:Record<string,string>={};
   for(const name of ['name','email','type','title'])fields[name]=String(data.get(name)||'');
   try{sessionStorage.setItem(draftKey,JSON.stringify({savedAt:Date.now(),fields}))}catch{}
   const url=new URL(location.href);url.search='';url.hash='';
   for(const [name,value] of Object.entries({id:id.current,return_url:url.href})){
    let field=form.querySelector<HTMLInputElement>('input[name="'+name+'"]');
    if(!field){field=document.createElement('input');field.type='hidden';field.name=name;form.appendChild(field)}
    field.value=value;
   }
   setBusy(true);
  }catch{e.preventDefault();setError('We couldn’t send your form. Please allow browser storage and try again.');}
 }
return <form ref={formRef} autoComplete="on" action={FORM_URL} method="POST" onSubmit={submit} onChange={()=>{id.current=''}}>
<input type="hidden" name="action" value="bbx_submit"/><input type="hidden" name="kind" value={kind}/><label htmlFor={kind+'-name'}>Full name</label><input id={kind+'-name'} name="name" placeholder="Your full name" autoComplete="name" required maxLength={100}/><label htmlFor={kind+'-email'}>Email address</label><input id={kind+'-email'} name="email" type="email" placeholder="you@example.com" autoComplete="email" required maxLength={254}/>{kind==='request'&&<><label htmlFor="type">What are we looking for?</label><select id="type" name="type" required><option value="Movie">Movie</option><option value="TV Show">TV Show</option></select><label htmlFor="title">Movie or TV show title</label><input id="title" name="title" placeholder="e.g. Dune: Part Two (2024)" required maxLength={200}/></>}<label className="consent"><input type="checkbox" name="consent" value="yes" required/> <span>I agree to BingeBox using these details to process my {kind==='signup'?'signup and contact me about my subscription':'request and contact me about it'}.</span></label>{error&&<p className="error" role="alert" tabIndex={-1} ref={errorRef}>{error}</p>}<button className="button full" disabled={busy}>{busy?'Sending…':kind==='signup'?'Create my signup':'Send my request'}</button><p className="privacy-note">Your details are used only to process your submission and contact you about it.</p></form>}
