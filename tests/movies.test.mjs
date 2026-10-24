import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
const source=ts.transpileModule(readFileSync('app/api/movies/route.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {GET}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const originalFetch=globalThis.fetch,token=process.env.TMDB_READ_ACCESS_TOKEN;
const request=id=>new Request('https://bingebox.test/api/movies'+(id===undefined?'':'?id='+encodeURIComponent(id)));
try{
 delete process.env.TMDB_READ_ACCESS_TOKEN;
 await test('missing configuration remains safe for discovery and details',async()=>{
  assert.deepEqual((await(await GET(request())).json()).movies,[]);
  assert.equal((await GET(request('42'))).status,503);
 });
 process.env.TMDB_READ_ACCESS_TOKEN='private-test-token';
 await test('invalid movie IDs never make upstream requests',async()=>{
  globalThis.fetch=async()=>{throw Error('must not fetch')};
  for(const id of ['', '../secrets','-1','0','1.2','2147483648','42&append_to_response=bad'])assert.equal((await GET(request(id))).status,400);
 });
 await test('discovery exposes stable IDs for card links',async()=>{
  globalThis.fetch=async()=>Response.json({results:[{id:42,title:'Example',poster_path:'/example.jpg',release_date:'2024-01-01'},{id:43,adult:true,poster_path:'/adult.jpg'}]});
  const data=await(await GET(request())).json();assert.equal(data.movies.length,1);assert.equal(data.movies[0].id,42);
 });
 await test('details append videos and credits while sanitizing embeds and images',async()=>{
  globalThis.fetch=async(url,options)=>{
   assert.match(url,/movie\/42\?language=en-US&append_to_response=credits,videos/);
   assert.equal(options.headers.Authorization,'Bearer private-test-token');
   return Response.json({id:42,title:'Example',overview:'Overview',poster_path:'https://evil.test/a.jpg',backdrop_path:'/backdrop.jpg',genres:[{name:'Drama'}],credits:{cast:[{name:'Actor',character:'Character',profile_path:'/actor.jpg'}],crew:[{name:'Director',job:'Director'}]},videos:{results:[
    {site:'YouTube',key:'12345678901',type:'Teaser',official:false,name:'Teaser'},
    {site:'YouTube',key:'abcdefghijk',type:'Trailer',official:true,name:'Official trailer'},
    {site:'YouTube',key:'x" onload="bad',type:'Trailer'},
    {site:'Other',key:'abcdefghijk',type:'Trailer'}
   ]}});
  };
  const response=await GET(request('42')),data=await response.json();
  assert.equal(data.movie.videos.length,2);assert.equal(data.movie.videos[0].name,'Official trailer');
  assert.equal(data.movie.poster_path,null);assert.equal(data.movie.directors[0],'Director');
  assert.doesNotMatch(JSON.stringify(data),/private-test-token|evil.test|onload/);
 });
 await test('missing videos and credits render as empty lists',async()=>{
  globalThis.fetch=async()=>Response.json({id:42,title:'Example'});
  const {movie}=await(await GET(request('42'))).json();
  assert.deepEqual(movie.videos,[]);assert.deepEqual(movie.cast,[]);
 });
 await test('not-found, provider and network failures have controlled responses',async()=>{
  for(const status of [404,429,500]){
   globalThis.fetch=async()=>new Response('',{status});
   const response=await GET(request('42'));assert.equal(response.status,status===404?404:503);assert.equal(response.headers.get('cache-control'),'no-store');
  }
  globalThis.fetch=async()=>{throw Error('provider secret')};
  const response=await GET(request('42'));assert.equal(response.status,503);assert.doesNotMatch(await response.text(),/provider secret/);
 });
}finally{globalThis.fetch=originalFetch;if(token===undefined)delete process.env.TMDB_READ_ACCESS_TOKEN;else process.env.TMDB_READ_ACCESS_TOKEN=token}
