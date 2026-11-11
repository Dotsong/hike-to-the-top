// Real test: runs index.html with the real three.js (tools/vendor) in headless Chromium, fast-forwarded, along one route to the summit.
// Reports any error and any point where the frame loop stops (a freeze), and saves a screenshot of every place.
// Usage: node tools/real-test.js [route, e.g. LRL] [path/to/index.html]   (slow: software rendering; run one or two at a time)
const {chromium}=require('playwright'); const fs=require('fs');
const ROUTE=(process.argv[2]||'LLL'), path=require('path'), OUT=path.join(require('os').tmpdir(),'hike-shots'), PAGE=path.resolve(process.argv[3]||path.join(__dirname,'..','index.html'));
const three=fs.readFileSync(path.join(__dirname,'vendor','three.min.js'),'utf8');
let html=fs.readFileSync(PAGE,'utf8');
const sub=(a,b)=>{ if(!html.includes(a)) throw new Error('missing '+a); html=html.replace(a,b); };
sub("const rawDt=Math.min(0.05,(now-last)/1000)","const rawDt=window.__dt||0.08; window.__frames=(window.__frames||0)+1; window.__mode=mode");
sub("renderer.render(mode==='rest'","if(window.__draw||frameNo%40===0) renderer.render(mode==='rest'");
(async()=>{ fs.mkdirSync(OUT,{recursive:true});
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const p=await b.newPage({viewport:{width:900,height:600}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n').slice(1,4).join(' | ').slice(0,400))); p.on('console',m=>{ if(m.type()==='error'&&!/ERR_FAILED|AudioContext/.test(m.text())) errs.push('console: '+m.text().slice(0,200)); });
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.includes('three')) return r.fulfill({body:three,contentType:'application/javascript'}); if(u.startsWith('file:')) return r.fulfill({body:html,contentType:'text/html'}); return r.abort(); });
  await p.goto('file://'+PAGE); await p.waitForTimeout(1500);
  if(await p.$('#splashBtn')){ await p.click('#splashBtn'); await p.waitForTimeout(1500); }
  await p.click('#beginBtn'); await p.waitForTimeout(6000);
  const flush=n=>{ if(errs.length) console.log('ERR after',n,'\n'+[...new Set(errs.splice(0))].slice(0,6).join('\n')); };
  const shot=async n=>{ await p.evaluate(()=>{window.__draw=1;}); await p.waitForTimeout(1500); await p.screenshot({path:OUT+'/'+ROUTE+'-'+n+'.png',timeout:120000}); await p.evaluate(()=>{window.__draw=0;}); flush(n); };
  const alive=async n=>{ const f=await p.evaluate(()=>window.__frames); await p.waitForTimeout(700); const g=await p.evaluate(()=>window.__frames); if(g===f){ console.log('FROZEN at',n); flush(n); } };
  const go=async(m,n,w=2500)=>{ await p.evaluate(m=>window.hikeDebug.walkTo(m),m); await p.waitForTimeout(w); await alive(n||m); if(n) await shot(n); };
  const rest=async(i,at)=>{ await go(at,null,500);
    await p.waitForFunction(()=>window.hikeDebug.mode()==='rest'&&window.hikeDebug.ready(),null,{timeout:120000}).catch(()=>console.log('rest',i,'never ready')); await shot('rest'+i);
    const id=ROUTE[i]==='L'?'autumnBtn':'aspenBtn'; await p.hover('#'+id); await p.waitForTimeout(1500); await shot('rest'+i+'-look');
    await p.click('#'+id); await p.waitForFunction(()=>window.hikeDebug.mode()==='trail'&&window.hikeDebug.stage()===3,null,{timeout:30000}).catch(()=>console.log('gate',i,'never entered')); await p.waitForTimeout(800); await shot('gate'+i); };
  await shot('start'); await go(80,'deep');
  await rest(0,97.2); await go(142,'out0',2500); await go(190,'leg0',2000);
  await rest(1,247.8); await go(290,'out1',2500); await go(340,'leg1',2000);
  await rest(2,395.8); await go(438,'out2',2500); await go(475,'leg2',2000);
  await go(520,'mtn',2000); await go(541,'mist',2000); await go(552,'sky0',2500); await go(600,'sky',2000); await go(644,'topcave',2000);
  await go(650.4,null,500); await p.waitForFunction(()=>window.hikeDebug.mode()==='summit',null,{timeout:30000}).catch(()=>console.log('no summit'));
  for(let k=0;k<3;k++){ await p.waitForTimeout(2500); await shot('summit'+k); await p.mouse.move(450,300); await p.mouse.down(); await p.mouse.move(700,300,{steps:8}); await p.mouse.up(); }
  await alive('summit'); console.log(ROUTE,'done; screenshots in',OUT,errs.join('\n')); await b.close(); })();
