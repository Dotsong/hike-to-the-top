// Walk sim: runs the trail maths and the sisters' brains from index.html in Node for 30 minutes of hiking.
// Checks they stop at the rest site, keep up, never overlap and stay on the path.
// Usage: node tools/walk-sim.js index.html [-1 for the aspen grove | 1 for the autumn woods]
const fs=require('fs'); const src=fs.readFileSync(process.argv[2],'utf8');
const cut=(a,b)=>{ const i=src.indexOf(a), j=src.indexOf(b,i); if(i<0||j<0) throw new Error('missing '+a); return src.slice(i,j); };
const code=[
 "const lerp=(a,b,t)=>a+(b-a)*t; const clamp=(x,a,b)=>Math.min(b,Math.max(a,x)); const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};",
 "const damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt)); const pick=arr=>arr[Math.floor(Math.random()*arr.length)]; const hash=(a,b,c)=>{ const v=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return v-Math.floor(v); };",
 "class V2{constructor(){this.x=0;this.y=0;} set(x,y){this.x=x;this.y=y;}} const THREE={Vector2:V2};",
 "const part=()=>({position:{set(){},y:0},rotation:{set(){},x:0,y:0,z:0},scale:{y:1}});",
 "const girl=()=>({g:part(),upper:part(),head:part(),armL:part(),armR:part(),legs:[part(),part()],tails:[part(),part()],eyes:[part(),part()]}); const june=girl(), pip=girl();",
 "const state={started:true}; let time=0, speakIn=0, said=0, rests=0, waited=0; const onForkArrive=()=>{busy=8;}, onForkReady=()=>{}, onRiver=()=>{}, onDeep=()=>{}, onGateObstacle=()=>{}, onHop=()=>{}, onRestStop=()=>{}, onVillage=()=>{}, onCloud=()=>{}; let tails=[]; const onTail=w=>{ tails.push(w); if(w==='top') party.vT=0; }; let reveals=0; const onGateEnter=()=>{busy=6;}, onReveal=()=>{reveals++; busy=9; return 9;}; const PICK=+(process.argv[3]||-1); const lineTime=tx=>1.6+tx.length*0.06; let busy=0;",
 "const quiet=()=>busy<=0; const sayIf=()=>{said++; busy=3;}; const playScript=l=>{rests++; busy=l.reduce((t,x)=>t+lineTime(x[1])+0.45,0);}; const nextLine=(k,s)=>pick(s); const lineFor=(k,s)=>pick(s); const EVT={cur:null};",
 "const POSE_LINES={scoop:['a'],crouch:['a'],look:['a'],point:['a'],spin:['a'],wave:['a'],hop:['a']};",
 cut("const REST_S=","/* ---------- renderer"),
 cut("const WALK=0.8;","/* ---------- music"),
 `let minSep=9,maxLag=0,maxLead=0,maxOff=0,bad=0,stopAt=0,treeGap=9; const dt=1/60; party.v=party.vT=WALK;
  // three test trees planted right on the trail (middle, Pip's side, June's side): the girls must walk round each one
  const TREES=[[30,0],[200,0.5],[340,-0.5]], planted=[];
  for(let i=0;i<60*60*30;i++){ time+=dt; busy-=dt; updateParty(dt);
    TREES.forEach((t,k)=>{ if(!planted[k]&&party.s>t[0]-12){ planted[k]=true; solids.push({x:trailX(t[0])+t[1],z:t[0],r:0.7}); } });
    solids.forEach(o=>BRAINS.forEach(b=>{ treeGap=Math.min(treeGap,Math.hypot(b.pos.x-o.x,b.pos.y-o.z)-o.r); })); if(fork.stage===2){ stopAt=party.s; waited+=dt; if(waited>60){ waited=0; takeTrail(fork.site===1?-PICK:PICK); party.s=SITES[fork.site].a+1; party.v=WALK; fork.entered=true; placeGirls(); } } BRAINS.forEach(b=>updateBrain(b,dt));
    const sep=Math.hypot(juneB.pos.x-pipB.pos.x,juneB.pos.y-pipB.pos.y); minSep=Math.min(minSep,sep);
    BRAINS.forEach(b=>{ const e=party.s+b.ds-b.pos.y; maxLag=Math.max(maxLag,e); maxLead=Math.max(maxLead,-e); maxOff=Math.max(maxOff,Math.abs(b.pos.x-trailX(b.pos.y))); if(!isFinite(b.pos.x+b.pos.y+b.y+b.face)) bad++; }); }
  console.log({path:PICK<0?'thicket to aspen grove':'cave to autumn woods',stoppedAt:+stopAt.toFixed(2),waitedAtFork:+waited.toFixed(0),metres:+party.s.toFixed(0),minSep:+minSep.toFixed(2),maxLag:+maxLag.toFixed(2),maxLead:+maxLead.toFixed(2),maxSideways:+maxOff.toFixed(2),rests,reveals,stage:fork.stage,site:fork.site,route:[0,1,2].map(legKey).join('>'),tail:tails.join('>'),closestToATree:+treeGap.toFixed(2),poseLines:said,notFinite:bad});
  let worst=0; for(let s=0;s<660;s+=0.5){ worst=Math.max(worst,Math.abs(groundY(trailX(s)+2,s)-trailY(s)),Math.abs(groundY(trailX(s)-2,s)-trailY(s))); paths(s); if(!(trailX(s)===pL||trailX(s)===pR)) bad++; } console.log('trail is level out to 2 m either side, max error',worst,'| rows where the girls are off both paths:',bad);`
].join('\n');
new Function(code)();
