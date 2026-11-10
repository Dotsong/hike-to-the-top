// Plant every deep-woods tree the game would plant along 600 m of trail and measure, right round the rim of each one's root flare
// (36 points), how far the bottom of the flare stands above the drawn ground. It should never be above it.
const fs=require('fs'); const src=fs.readFileSync(process.argv[2],'utf8');
const cut=(a,b)=>{ const i=src.indexOf(a), j=src.indexOf(b,i); if(i<0||j<0) throw new Error('missing '+a); return src.slice(i,j); };
const pre='const lerp=(a,b,t)=>a+(b-a)*t; const clamp=(x,a,b)=>Math.min(b,Math.max(a,x)); const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}; const hash=(a,b,c)=>{ const v=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return v-Math.floor(v); };';
const code=pre+cut("const REST_S=","/* ---------- renderer")+cut("const OUT=[","const gPos=")+"const rowX=new Float32Array(NC);"+cut("/* where the columns of the row at z stand","function rebuildGround(")+`
let worst=-9, n=0, steep=0, old=-9;
for(const c of [-1,1]){ choice=c; rowCache.clear();
  for(let r=15;r<200;r++){ const z0=r*3; for(const side of [-1,1]) for(let j=0;j<6;j++){ if(deep(z0+1.5)<0.5) continue;
    const B=[[3.6,6],[6,10],[10,16],[16,26],[26,44],[44,75]][j], id=side*10+j, d=side*(B[0]+(B[1]-B[0])*hash(r,id,2)), z=z0+hash(r,id,3)*3; paths(z); const x=(side<0?pL:pR)+d;
    const sc=0.9+hash(r,id,5)*0.5, tr=(0.5+0.25*hash(r,id,15))*sc, fr=tr*1.8, y=treeBase(x,z,fr+0.1), y0=Math.min(floorY(x,z),floorY(x+1.2,z),floorY(x-1.2,z),floorY(x,z+1.2),floorY(x,z-1.2))-0.15; n++;
    let lo=9; for(let k=0;k<36;k++){ const a=k/36*6.2832, g=floorY(x+Math.cos(a)*fr,z+Math.sin(a)*fr); worst=Math.max(worst,y-g); old=Math.max(old,y0-g); lo=Math.min(lo,g); }
    steep=Math.max(steep,floorY(x,z)-lo); } } }
console.log(n+' big trees checked on both paths | steepest ground under one: '+steep.toFixed(2)+' m of drop across its roots');
console.log('highest the bottom of a root flare stands above the ground at its rim: '+worst.toFixed(2)+' m (was '+old.toFixed(2)+' m before this change; negative means buried)');`;
new Function(code)();
