// Smoke test: loads index.html with a stand-in for three.js (works offline),
// clicks "Start the hike", lets the leaf doors open, opens the fact book, walks to the
// rest site, sits through the rest scene, picks a path, comes out the far side of its gateway, and presses "Back to the start". Prints any page errors.
// then on through the second and third rest sites, the sky garden and the last cave to the summit.
// Usage: node tools/smoke-test.js [path/to/index.html] [route: L or R at each of the three rest sites, e.g. LRL]
const {chromium}=require('playwright'); const fs=require('fs'); const path=require('path');
const page=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const ROUTE=(process.argv[3]||'LLL').toUpperCase();
const stub=fs.readFileSync(path.join(__dirname,'three-stub.js'),'utf8');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1000,height:700}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));
  await p.route('**/*',r=>{ const u=r.request().url();
    if(u.includes('three')) return r.fulfill({body:stub,contentType:'application/javascript'});
    if(u.startsWith('file:')) return r.continue(); return r.abort(); });
  await p.goto('file://'+page); await p.waitForTimeout(800);
  await p.click('#splashBtn'); await p.waitForTimeout(1500);
  await p.click('#beginBtn'); await p.waitForTimeout(3000);
  // the pace button steps through x2, x4, x8 and back to x1; the rest of the test runs at x4 so the rest scenes do not take all day
  const paces=[]; for(let k=0;k<4;k++){ await p.evaluate(()=>document.getElementById('paceBtn').click()); paces.push(await p.evaluate(()=>window.hikeDebug.pace()+'|'+document.getElementById('paceBtn').textContent)); }
  if(paces.join(',')!=='2|Pace ×2,4|Pace ×4,8|Pace ×8,1|Pace ×1') errs.push('the pace button went '+paces.join(','));
  await p.evaluate(()=>window.hikeDebug.pace(4));
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
  await p.evaluate(id=>document.getElementById(id).click(),ROUTE[0]==='L'?'autumnBtn':'aspenBtn');
  await p.waitForFunction(()=>window.hikeDebug.mode()==='trail'&&window.hikeDebug.stage()===3,null,{timeout:20000});
  const forkChosen=await p.evaluate(()=>document.getElementById('forkDock').hidden&&window.hikeDebug.choice()!==0);
  if(!forkChosen) errs.push('the path buttons did not lead onto a path');
  // the far side of the cave: the autumn woods open up
  await p.evaluate(()=>window.hikeDebug.walkTo(140.5)); await p.waitForTimeout(2500);
  const revealed=await p.evaluate(()=>window.hikeDebug.stage()===4);
  if(!revealed) errs.push('the new forest did not open up after the gateway');
  // every kind of visitor gets a turn (all four bird flights included)
  for(const k of ROUTE==='LLL'?['birds','birds','birds','birds','butterfly','squirrel','rabbit','swirl','woodpecker','owl','acorns','leafpile','geese','hedgehog']:ROUTE[0]==='R'?['birds','deer','quake','eyes']:['birds','butterfly','acorns','leafpile']){
    await p.evaluate(k=>window.hikeDebug.event(k),k); await p.waitForTimeout(900);
    if(await p.evaluate(()=>window.hikeDebug.eventNow())!==k) errs.push('the '+k+' event did not start'); }
  // the second and third rest sites: each offers the two gateways that come next on this track; then the mountain trail, the mist,
  // the sky garden, the last cave and the top
  const places=[];
  for(const [i,at] of [[1,247.8],[2,395.8]]){
    await p.evaluate(m=>window.hikeDebug.walkTo(m),at);
    await p.waitForFunction(()=>window.hikeDebug.mode()==='rest'&&window.hikeDebug.ready()&&!document.getElementById('forkDock').hidden,null,{timeout:120000});
    if(await p.evaluate(()=>window.hikeDebug.site())!==i) errs.push('rest site '+(i+1)+' was not reached');
    if(!await p.evaluate(()=>document.getElementById('dadNoteText').textContent.length>20)) errs.push('no note from Dad at rest site '+(i+1));
    await p.screenshot({path:require('os').tmpdir()+'/hike-dock-'+ROUTE+'-'+i+'.png'});
    await p.evaluate(id=>document.getElementById(id).click(),ROUTE[i]==='L'?'autumnBtn':'aspenBtn');
    await p.waitForFunction(()=>window.hikeDebug.mode()==='trail'&&window.hikeDebug.stage()===3,null,{timeout:20000});
    await p.waitForTimeout(1500);
    await p.evaluate(m=>window.hikeDebug.walkTo(m),at+41.5); await p.waitForTimeout(2500);
    if(await p.evaluate(()=>window.hikeDebug.stage())!==4) errs.push('the place after rest site '+(i+1)+' did not open up');
    places.push(await p.evaluate(()=>window.hikeDebug.place())); await p.waitForTimeout(1500); }
  for(const m of [470,503,535,542,550,554,600,642,649]){ await p.evaluate(m=>window.hikeDebug.walkTo(m),m); await p.waitForTimeout(1800); }
  await p.evaluate(()=>window.hikeDebug.walkTo(653.4));
  await p.waitForFunction(()=>window.hikeDebug.mode()==='summit',null,{timeout:20000}).catch(()=>errs.push('the summit scene did not start'));
  await p.waitForTimeout(4000);
  const summit=await p.evaluate(()=>window.hikeDebug.mode()==='summit'&&window.hikeDebug.tail()===5);
  // at the top, the friend from the village turns up and offers a way home; accepting leads to spaghetti night, told to the end
  await p.waitForFunction(()=>!document.getElementById('homeDock').hidden,null,{timeout:90000}).catch(()=>errs.push('the friend never offered a way home'));
  const offer=await p.evaluate(()=>document.getElementById('homeBtn').textContent);
  await p.evaluate(()=>document.getElementById('homeBtn').click());
  await p.waitForFunction(()=>window.hikeDebug.mode()==='home',null,{timeout:30000}).catch(()=>errs.push('the dinner scene did not start'));
  const dinner=await p.waitForFunction(()=>window.hikeDebug.homeDone(),null,{timeout:120000}).then(()=>true).catch(()=>{ errs.push('the dinner scene never reached The End'); return false; });
  // the zone list: open it, count the places, and jump to every one of them in turn
  await p.evaluate(()=>document.getElementById('zoneBtn').click()); await p.waitForTimeout(300);
  const zoneNames=await p.evaluate(()=>[...document.querySelectorAll('#zoneList button')].map(b=>b.textContent));
  if(zoneNames.length<30) errs.push('the zone list is short: '+zoneNames.length);
  await p.evaluate(()=>document.getElementById('zoneClose').click());
  for(const z of zoneNames.filter(z=>!/secret|Dinner/.test(z))){ if(!await p.evaluate(z=>window.hikeDebug.warp(z),z)) errs.push('no zone called '+z); await p.waitForTimeout(700);
    if(await p.evaluate(()=>window.hikeDebug.mode())!=='trail') errs.push('jumping to '+z+' did not land on the trail'); }
  // and by the button: the summit is one tap and a few steps away
  await p.evaluate(()=>document.getElementById('zoneBtn').click()); await p.waitForTimeout(300);
  await p.evaluate(()=>[...document.querySelectorAll('#zoneList button')].find(b=>b.textContent==='Summit').click());
  const zones=await p.waitForFunction(()=>window.hikeDebug.mode()==='summit',null,{timeout:30000}).then(()=>true).catch(()=>{ errs.push('jumping to the summit did not get there'); return false; });
  // the secret ending: dinner with all four friends in the house, the telephone, Lumi, and the party on the Moon
  await p.evaluate(()=>window.hikeDebug.warp('The secret ending (as if everything were found)'));
  await p.waitForFunction(()=>!document.getElementById('phoneDock').hidden,null,{timeout:120000}).catch(()=>errs.push('the telephone never rang'));
  await p.evaluate(()=>document.getElementById('phoneBtn').click());
  const secret=await p.waitForFunction(()=>window.hikeDebug.mode()==='moon'&&window.hikeDebug.moonDone(),null,{timeout:150000}).then(()=>true).catch(()=>{ errs.push('the party on the Moon never happened'); return false; });
  await p.evaluate(()=>document.getElementById('goodnightBtn').click()); await p.waitForTimeout(1600);
  const backToStart=await p.evaluate(()=>!document.getElementById('intro').hidden);
  console.log({route:ROUTE,hikeStarted:true,bookOpen,mapOpen,restScene,forkChosen,revealed,places:places.join(' > '),summit,offer,dinner,zones:zones&&zoneNames.length,secret,found:await p.evaluate(()=>window.hikeDebug.saved()).catch(()=>''),backToStart});
  console.log(errs.length?errs.join('\n'):'no errors');
  await b.close(); process.exit(errs.length?1:0);
})();
