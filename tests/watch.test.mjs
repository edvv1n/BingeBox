import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
const source=ts.transpileModule(readFileSync('lib/watch-settings.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {serverUrl,mobilePlatform,appUrl}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('server links preserve base paths and reject missing, insecure or credential-bearing URLs',()=>{
 assert.equal(serverUrl('https://media.example.com/jellyfin/'),'https://media.example.com/jellyfin/');
 for(const value of ['',undefined,'javascript:alert(1)','http://media.example.com','https://user:password@media.example.com'])assert.equal(serverUrl(value),'');
});
test('desktop versus mobile includes iPad desktop user agent',()=>{
 assert.equal(mobilePlatform('Mozilla Android'),'android');
 assert.equal(mobilePlatform('Mozilla iPhone'),'ios');
 assert.equal(mobilePlatform('Mozilla Macintosh',5),'ios');
 assert.equal(mobilePlatform('Mozilla Macintosh',0),'');
 assert.equal(mobilePlatform('Mozilla Windows NT'),'');
});
test('app launches allow only the intended app schemes',()=>{
 assert.equal(appUrl('javascript:alert(1)','jellyfin://'),'jellyfin://');
 assert.equal(appUrl('jellyfin://','jellyfin://'),'jellyfin://');
 assert.equal(appUrl('org.jellyfin.expo://','jellyfin://'),'org.jellyfin.expo://');
});
