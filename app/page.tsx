"use client";
import BrandLogo from '../components/BrandLogo';
import {useEffect,useState} from 'react';
import { Mail } from 'lucide-react';
import PosterBackground from '@/components/PosterBackground';
import Navbar from '@/components/Navbar';
import Chatbot from '@/components/Chatbot';
import MovieDetails from '@/features/pages/MovieDetails';
import Home from '@/features/pages/Home';
import Signup from '@/features/pages/Signup';
import RequestPage from '@/features/pages/RequestPage';
export default function App(){const [page,setPage]=useState('home');useEffect(()=>{const sync=()=>{setPage((['signup','request'].includes(location.hash.slice(1))||/^movie\/[1-9]\d*$/.test(location.hash.slice(1)))?location.hash.slice(1):'home');window.scrollTo(0,0)};sync();window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync)},[]);return <><PosterBackground intervalMs={5_000}/><a className="skip" href="#main">Skip to content</a><Navbar page={page.startsWith('movie/')?'home':page}/><main id="main">{page.startsWith('movie/')?<MovieDetails key={page} id={page.slice(6)}/>:page==='signup'?<Signup/>:page==='request'?<RequestPage/>:<Home/>}</main><footer><a className="brand" href="#home"><BrandLogo/></a><span>Your couch. Your queue. Your kind of night.</span><a className="footer-contact" href="mailto:b1ng3b0x@gmail.com"><Mail size={18} aria-hidden="true"/>Get in touch</a><small>Powered by Jellyfin · Independently operated by BingeBox</small></footer><Chatbot/></>}
