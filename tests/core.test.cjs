const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const elements=new Map();
const element=id=>{
 if(!elements.has(id)) elements.set(id,{value:'',innerHTML:'',textContent:'',disabled:false,
   style:{},classList:{add(){},remove(){},contains(){return false;}},
   addEventListener(){},setAttribute(){},querySelectorAll(){return[];}});
 return elements.get(id);
};
const context=vm.createContext({console,Date,Intl,URL,URLSearchParams,AbortController,
 setInterval(){},setTimeout,clearTimeout,
 document:{getElementById:element,querySelectorAll(){return[];},addEventListener(){}},
 window:{isSecureContext:true},navigator:{geolocation:{getCurrentPosition(success,error){error({code:1});}}},
 localStorage:{getItem(){return null;},setItem(){},removeItem(){}}});
vm.runInContext(script,context);
const evaluate=source=>vm.runInContext(source,context);
test('real page script parses and historical boundary states stay unknown',()=>{
 const states=evaluate(`['2026-04-25T05:59:59Z','2026-04-25T06:00:00Z','2026-04-25T12:00:00Z','2026-05-02T05:59:59Z','2026-05-02T06:00:00Z','2026-10-10T14:00:00Z'].map(t=>groupStatus('A',Date.parse(t)).state)`);
 assert.deepEqual(Array.from(states),['unknown','off','on','off','unknown','unknown']);
});
test('ambiguous groups stay distinct and missing area has no confident state',()=>{
 assert.ok(evaluate(`new Set(findMatches('Madina',16).map(m=>m.group)).size`)>1);
 evaluate(`renderResults('fictional-no-such-area-xyz')`);
 assert.match(element('summary').innerHTML,/No match found/);
});
test('denied location preserves manual input and restores GPS control',async()=>{
 await evaluate('useCurrentLocation()');
 assert.match(element('geoStatus').innerHTML,/denied.*manually/i);
 assert.equal(element('useLocationBtn').disabled,false);
 assert.equal(element('searchInput').disabled,false);
});
