// Smoke test: loads index.html with a stand-in for three.js (works offline),
// clicks "Start the hike", lets the leaf doors open, opens the fact book, walks to the
// fork, picks a path, comes out the far side of its gateway, and presses "Back to the start". Prints any page errors.
// Usage: node tools/smoke-test.js [path/to/index.html]
const {chromium}=require('playwright'); const fs=require('fs'); const path=require('path');
const page=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const stub=fs.readFileSync(path.join(__dirname,'three-stub.js'),'utf8');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1000,height:700}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));
  await p.route('**/*',r=>{ const u=r.request().url();
    if(u.includes('three')) return r.fulfill({body:stub,contentType:'application/javascript'});
    if(u.startsWith('file:')) return r.continue(); return r.abort(); });
  await p.goto('file://'+page); await p.waitForTimeout(800);
  await p.click('#beginBtn'); await p.waitForTimeout(3000);
  await p.evaluate(()=>document.getElementById('bookBtn').click()); await p.waitForTimeout(500);
  const bookOpen=await p.evaluate(()=>!document.getElementById('bookScrim').hidden);
  await p.evaluate(()=>document.getElementById('bookClose').click());
  // the fork: jump to just before 70 m, wait for the girls to stop and talk, then pick a path
  await p.evaluate(()=>window.hikeDebug.walkTo(69.2));
  await p.waitForFunction(()=>!document.getElementById('fork').hidden&&window.hikeDebug.stage()===2,null,{timeout:45000});
  await p.evaluate(()=>document.getElementById('autumnBtn').click()); await p.waitForTimeout(1800);
  const forkChosen=await p.evaluate(()=>document.getElementById('fork').hidden&&window.hikeDebug.stage()===3&&window.hikeDebug.choice()===1);
  if(!forkChosen) errs.push('the fork card did not lead to the cave path');
  // the far side of the cave: the autumn woods open up
  await p.evaluate(()=>window.hikeDebug.walkTo(112.5)); await p.waitForTimeout(2500);
  const revealed=await p.evaluate(()=>window.hikeDebug.stage()===4);
  if(!revealed) errs.push('the new forest did not open up after the gateway');
  await p.evaluate(()=>document.getElementById('goodnightBtn').click()); await p.waitForTimeout(1600);
  const backToStart=await p.evaluate(()=>!document.getElementById('intro').hidden);
  console.log({hikeStarted:true,bookOpen,forkChosen,revealed,backToStart});
  console.log(errs.length?errs.join('\n'):'no errors');
  await b.close(); process.exit(errs.length?1:0);
})();
