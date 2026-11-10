// Smoke test: loads index.html with a stand-in for three.js (works offline),
// clicks "Start the hike", lets the leaf doors open, opens the fact book, walks to the
// rest site, sits through the rest scene, picks a path, comes out the far side of its gateway, and presses "Back to the start". Prints any page errors.
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
  // pausing unrolls Dad's map; tapping the map rolls it up; un-pausing carries on
  await p.evaluate(()=>document.getElementById('pauseBtn').click()); await p.waitForTimeout(1200);
  const mapOpen=await p.evaluate(()=>window.hikeDebug.mapOpen()&&document.getElementById('mapSvg').childElementCount>10);
  if(!mapOpen) errs.push('the map did not unroll on pause');
  await p.screenshot({path:require('os').tmpdir()+'/hike-map.png'});
  await p.evaluate(()=>document.getElementById('mapSheet').click());
  if(await p.evaluate(()=>window.hikeDebug.mapOpen())) errs.push('the map did not roll up when tapped');
  await p.evaluate(()=>document.getElementById('pauseBtn').click());
  // the rest site: jump to just before 98 m; the girls stop, the screen fades to the rest scene,
  // they sit and talk, and the two path buttons appear
  await p.evaluate(()=>window.hikeDebug.walkTo(97.2));
  await p.waitForFunction(()=>window.hikeDebug.mode()==='rest'&&window.hikeDebug.ready()&&!document.getElementById('forkDock').hidden,null,{timeout:120000});
  const restScene=true;
  // pick the cave: the girls set off, the screen fades back to the trail
  await p.evaluate(()=>document.getElementById('autumnBtn').click());
  await p.waitForFunction(()=>window.hikeDebug.mode()==='trail'&&window.hikeDebug.stage()===3,null,{timeout:20000});
  const forkChosen=await p.evaluate(()=>document.getElementById('forkDock').hidden&&window.hikeDebug.choice()===1);
  if(!forkChosen) errs.push('the path buttons did not lead to the cave path');
  // the far side of the cave: the autumn woods open up
  await p.evaluate(()=>window.hikeDebug.walkTo(140.5)); await p.waitForTimeout(2500);
  const revealed=await p.evaluate(()=>window.hikeDebug.stage()===4);
  if(!revealed) errs.push('the new forest did not open up after the gateway');
  await p.evaluate(()=>document.getElementById('goodnightBtn').click()); await p.waitForTimeout(1600);
  const backToStart=await p.evaluate(()=>!document.getElementById('intro').hidden);
  console.log({hikeStarted:true,bookOpen,mapOpen,restScene,forkChosen,revealed,backToStart});
  console.log(errs.length?errs.join('\n'):'no errors');
  await b.close(); process.exit(errs.length?1:0);
})();
