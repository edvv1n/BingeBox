import {useEffect,useState,type ReactNode} from 'react';

export default function WelcomeScreen({children}:{children:ReactNode}){
  // Form returns should show their confirmation/error immediately.
  const [visible,setVisible]=useState(()=>!new URLSearchParams(location.search).has('bbx_kind'));
  const [leaving,setLeaving]=useState(false);
  useEffect(()=>{
    if(!visible)return;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const fade=setTimeout(()=>setLeaving(true),reduced?250:1900);
    const finish=setTimeout(()=>setVisible(false),reduced?350:2350);
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setVisible(false)};
    window.addEventListener('keydown',escape);
    return()=>{clearTimeout(fade);clearTimeout(finish);document.body.style.overflow=previous;window.removeEventListener('keydown',escape)};
  },[visible]);
  return <>
    <div inert={visible} aria-hidden={visible||undefined}>{children}</div>
    {visible&&<div className={'welcome-screen '+(leaving?'is-leaving':'')} aria-label="Welcome to BingeBox">
      <div className="welcome-glow" aria-hidden="true"/>
      <div className="welcome-brand" role="img" aria-label="BingeBox">
        <img className="welcome-mark" src="/brand/bingebox-mark.svg" alt="" width="96" height="96"/>
        <div className="welcome-wordmark"><img src="/brand/bingebox-wordmark-dark.svg" alt="" width="305" height="96"/></div>
      </div>
      <p className="welcome-caption">Your kind of night.</p>
      <button className="welcome-skip" type="button" onClick={()=>setVisible(false)}>Skip intro</button>
    </div>}
  </>;
}
