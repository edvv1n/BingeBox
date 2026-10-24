import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
async function check(production,port){
const child=spawn(process.execPath,['server/index.mjs',...(production?['--production']:[])],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Startup timeout')),15000);child.stdout.on('data',data=>{if(data.toString().includes('BingeBox:')){clearTimeout(timer);resolve()}});child.once('exit',()=>{clearTimeout(timer);reject(Error('Server exited'))})});
 const base='http://127.0.0.1:'+port;
 assert.equal((await fetch(base)).status,200);
 assert.equal((await(await fetch(base+'/api/movies')).json()).configured,false);
 const response=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({messages:[{role:'user',content:'How much?'}]})});
 const data=await response.json();assert.equal(data.mode,'knowledge');assert.match(data.answer,/subscription price/);
 console.log((production?'Production':'Development')+' frontend and API checks passed');
}finally{child.kill('SIGTERM')}
}
await check(true,5181);await check(false,5182);
