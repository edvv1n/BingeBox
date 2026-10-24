const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':status===200?'public, max-age=1800':'no-store'}});
const text=(value:unknown)=>typeof value==='string'?value:'';
const image=(value:unknown)=>typeof value==='string'&&/^\/[a-zA-Z0-9._-]+$/.test(value)?value:null;
export async function GET(req?:Request){
 const id=req?new URL(req.url).searchParams.get('id'):null;
 if(id!==null&&(!/^[1-9]\d{0,9}$/.test(id)||Number(id)>2147483647))return json({error:'Invalid movie.'},400);
 const token=process.env.TMDB_READ_ACCESS_TOKEN;
 if(!token)return id?json({error:'Movie information is temporarily unavailable.'},503):json({movies:[],configured:false});
 try{
  const path=id?'movie/'+id+'?language=en-US&append_to_response=credits,videos':'movie/now_playing?language=en-US&page=1';
  const r=await fetch('https://api.themoviedb.org/3/'+path,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(8000)});
  if(r.status===404)return json({error:'This movie could not be found.'},404);
  if(!r.ok)throw Error();
  const d=await r.json();
  if(!id){
   if(!Array.isArray(d.results))throw Error();
   return json({movies:d.results.filter((m:any)=>Number.isInteger(m.id)&&m.id>0&&image(m.poster_path)&&!m.adult).slice(0,16).map((m:any)=>({id:m.id,title:text(m.title),poster_path:image(m.poster_path),release_date:text(m.release_date)}))});
  }
  if(d.adult)return json({error:'This movie is not available in discovery.'},404);
  if(!Number.isInteger(d.id)||typeof d.title!=='string')throw Error();
  const videos=(Array.isArray(d.videos?.results)?d.videos.results:[])
   .filter((v:any)=>['Trailer','Teaser'].includes(v.type)&&((v.site==='YouTube'&&/^[\w-]{11}$/.test(v.key))||(v.site==='Vimeo'&&/^\d{1,12}$/.test(v.key))))
   .sort((a:any,b:any)=>(Number(b.type==='Trailer')*2+Number(b.official===true))-(Number(a.type==='Trailer')*2+Number(a.official===true)))
   .slice(0,6).map((v:any)=>({key:v.key,site:v.site,name:text(v.name),type:v.type,official:v.official===true}));
  return json({movie:{
   id:d.id,title:d.title,overview:text(d.overview),tagline:text(d.tagline),poster_path:image(d.poster_path),backdrop_path:image(d.backdrop_path),
   release_date:text(d.release_date),runtime:Number.isFinite(d.runtime)&&d.runtime>0?d.runtime:null,
   rating:Number.isFinite(d.vote_average)?Math.max(0,Math.min(10,d.vote_average)):null,vote_count:Number.isFinite(d.vote_count)?Math.max(0,d.vote_count):0,
   genres:(Array.isArray(d.genres)?d.genres:[]).map((g:any)=>text(g.name)).filter(Boolean),
   cast:(Array.isArray(d.credits?.cast)?d.credits.cast:[]).slice(0,8).map((c:any)=>({name:text(c.name),character:text(c.character),profile_path:image(c.profile_path)})),
   directors:(Array.isArray(d.credits?.crew)?d.credits.crew:[]).filter((c:any)=>c.job==='Director').map((c:any)=>text(c.name)).filter(Boolean),
   videos
  }});
 }catch{return json(id?{error:'Movie information is temporarily unavailable. Please try again.'}:{movies:[],error:'Movie discovery is temporarily unavailable.'},503)}
}
