import BrandLogo from './BrandLogo';
import WatchNow from './WatchNow';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import ThemeControl from './ThemeControl';
import {Film,Clapperboard,Ticket} from 'lucide-react';

export default function Navbar({page}:{page:string}){
  const [scrolled,setScrolled]=useState(false);
  const [open,setOpen]=useState(false);
  const [theme,setTheme]=useState('system');
  const toggle=useRef<HTMLButtonElement>(null);
  const header=useRef<HTMLElement>(null);
  const drawer=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const update=()=>setScrolled(window.scrollY>20);
    update();window.addEventListener('scroll',update,{passive:true});
    return()=>window.removeEventListener('scroll',update);
  },[]);
  useEffect(()=>{setTheme(localStorage.getItem('bingebox-theme')||'system')},[]);
  useEffect(()=>{
    const media=matchMedia('(prefers-color-scheme: dark)');
    const apply=()=>document.documentElement.dataset.theme=theme==='system'?(media.matches?'dark':'light'):theme;
    apply();localStorage.setItem('bingebox-theme',theme);
    media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply);
  },[theme]);
  useEffect(()=>setOpen(false),[page]);
  useEffect(()=>{
    const media=matchMedia('(min-width: 801px)');
    const resize=()=>{if(media.matches)setOpen(false)};
    media.addEventListener('change',resize);return()=>media.removeEventListener('change',resize);
  },[]);
  useEffect(()=>{
    if(!open)return;
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const backgrounds=Array.from(document.querySelectorAll<HTMLElement>('main,footer,.chatbot'));
    const states=backgrounds.map(el=>el.hasAttribute('inert'));
    backgrounds.forEach(el=>el.setAttribute('inert',''));
    const keydown=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.preventDefault();setOpen(false);return}
      if(e.key!=='Tab')return;
      const elements=[header.current,drawer.current].flatMap(el=>Array.from(el?.querySelectorAll<HTMLElement>('a[href],button,select')||[])).filter(el=>el.getClientRects().length>0 && !el.closest('[inert]') && getComputedStyle(el).visibility!=='hidden');
      const first=elements[0],last=elements.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
    };
    document.addEventListener('keydown',keydown);
    drawer.current?.querySelector<HTMLElement>('a')?.focus({preventScroll:true});
    return()=>{
      document.body.style.overflow=overflow;
      backgrounds.forEach((el,i)=>{if(!states[i])el.removeAttribute('inert')});
      document.removeEventListener('keydown',keydown);
      if(toggle.current?.getClientRects().length)toggle.current.focus({preventScroll:true});
    };
  },[open]);
  const close=()=>setOpen(false);
  return <>
    <header ref={header} className={[scrolled?'is-scrolled':'',open?'menu-open':''].join(' ')}>
      <nav aria-label="Main navigation">
        <a className="brand" href="#home" onClick={close}><BrandLogo/></a>
        <div className="nav-links">
          <a className={page==='home'?'active':''} href="#home"><Film size={15} aria-hidden="true"/>Discover</a>
          <a className={page==='request'?'active':''} href="#request"><Clapperboard size={15} aria-hidden="true"/>Request a title</a>
        </div>
        <div className="nav-actions">
          <ThemeControl theme={theme} onChange={setTheme}/>
          <WatchNow className="button small watch-nav"/>
          <a href="#signup" className="button small"><Ticket size={16} aria-hidden="true"/>Join BingeBox</a>
          <button ref={toggle} type="button" className={'menu icon-button '+(open?'is-open':'')} aria-label={open?'Close menu':'Open menu'} aria-controls="mobile-navigation" aria-expanded={open} onClick={()=>setOpen(value=>!value)}>
            <span className="hamburger-lines" aria-hidden="true"><span/><span/><span/></span>
          </button>
        </div>
      </nav>
    </header>
    {createPortal(<div ref={drawer} id="mobile-navigation" className={'mobile-drawer '+(open?'is-open':'')} aria-hidden={!open} inert={!open}>
      <div className="mobile-drawer-content">
        <p className="eyebrow">YOUR NEXT GREAT WATCH STARTS HERE</p>
        <nav aria-label="Mobile navigation">
          <WatchNow className="watch-drawer-link" onLaunch={close}/>
          <a href="#home" aria-current={page==='home'?'page':undefined} onClick={close}><Film aria-hidden="true"/>Discover</a>
          <a href="#request" aria-current={page==='request'?'page':undefined} onClick={close}><Clapperboard aria-hidden="true"/>Request a title</a>
          <a href="#signup" aria-current={page==='signup'?'page':undefined} onClick={close}><Ticket aria-hidden="true"/>Join BingeBox</a>
        </nav>
        <p className="mobile-drawer-caption">Your couch. Your queue.<br/>Your kind of night.</p>
      </div>
    </div>,document.body)}
  </>;
}
