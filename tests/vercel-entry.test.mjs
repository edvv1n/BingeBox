import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const dir=mkdtempSync(join(tmpdir(),'bbx-vercel-'));
const saved={...process.env},originalFetch=globalThis.fetch;
try{
 writeFileSync(join(dir,'package.json'),'{"type":"module"}');
 for(const file of ['api/movies.ts','api/chat.ts','app/api/movies/route.ts','app/api/chat/route.ts','lib/support-knowledge.ts']){
  const out=join(dir,file.replace(/\.ts$/,'.js'));mkdirSync(dirname(out),{recursive:true});
  writeFileSync(out,ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
 }
 const movies=await import(pathToFileURL(join(dir,'api/movies.js')));
 const chat=await import(pathToFileURL(join(dir,'api/chat.js')));
 await test('compiled Vercel entry point resolves ESM imports and returns TMDB posters',async()=>{
  process.env.TMDB_READ_ACCESS_TOKEN='  test-token  ';
  globalThis.fetch=async(url,opts)=>{assert.match(url,/movie\/now_playing/);assert.equal(opts.headers.Authorization,'Bearer test-token');return Response.json({results:[{id:42,title:'Test Movie',poster_path:'/poster.jpg',adult:false}]})};
  const response=await movies.GET(new Request('https://example.vercel.app/api/movies?v=2'));
  assert.equal(response.status,200);assert.equal((await response.json()).movies[0].poster_path,'/poster.jpg');
 });
 await test('movie query survives deployed entry point',async()=>{
  globalThis.fetch=async url=>{assert.match(url,/movie\/42\?/);return Response.json({id:42,title:'Test Movie'})};
  const response=await movies.GET(new Request('https://example.vercel.app/api/movies?id=42'));assert.equal((await response.json()).movie.id,42);
 });
 await test('TMDB authentication failure is controlled JSON, not a startup 500',async()=>{
  globalThis.fetch=async()=>new Response('',{status:401});
  const response=await movies.GET(new Request('https://example.vercel.app/api/movies?v=2'));assert.equal(response.status,503);assert.deepEqual((await response.json()).movies,[]);
 });
 await test('compiled chat dependencies load and retain the knowledge fallback',async()=>{
  delete process.env.OPENAI_API_KEY;delete process.env.GEMINI_API_KEY;
  const response=await chat.POST(new Request('https://example.vercel.app/api/chat',{method:'POST',headers:{origin:'https://example.vercel.app','content-type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:'How much?'}]})}));assert.equal(response.status,200);assert.equal((await response.json()).mode,'knowledge');
 });
}finally{globalThis.fetch=originalFetch;process.env=saved;rmSync(dir,{recursive:true,force:true})}
