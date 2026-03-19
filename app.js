const categories = {
  'Psychedelika':'#7c5cff',
  'Dissoziativa':'#34c3ff',
  'Delirantia / atypisch':'#ff8a3d',
  'Stimulanzien':'#ff4d6d',
  'Sedativa':'#98a3b3',
  'Empathogene':'#2ad38b'
};
const base = [
  ['LSD',8,7,5,'Psychedelika','analytisch, klar, aktivierend'],
  ['Psilocybin',6,6,8,'Psychedelika','emotional, integrierbar'],
  ['Mescalin',8,6,8,'Psychedelika','klar, körperlich geerdet'],
  ['DMT',4,10,2,'Psychedelika','extrem schnell, schwer integrierbar'],
  ['Ayahuasca',6,6,9,'Psychedelika','rituell/therapeutisch, hoch integrierbar'],
  ['2C-B',7,6,6,'Psychedelika','sensorisch, sozialer als LSD'],
  ['Salvia',1,7,1,'Dissoziativa','brüchige Realität, kaum Integration'],
  ['Ketamin',3,4,6,'Dissoziativa','dissoziativ, Re-Entry wichtig'],
  ['MXE',5,5,6,'Dissoziativa','klarer als Ketamin'],
  ['DXM',2,3,3,'Dissoziativa','chaotischer, körperlastiger'],
  ['Amanita muscaria',2,4,2,'Delirantia / atypisch','traumartig, fragmentiert'],
  ['Datura',1,5,1,'Delirantia / atypisch','deliriant, kaum Meta-Bewusstsein'],
  ['Amphetamin',9,9,3,'Stimulanzien','zielgerichtet, eng'],
  ['Methamphetamin',9,10,2,'Stimulanzien','maximierte Aktivierung'],
  ['Kokain',6,9,2,'Stimulanzien','kurz, impulsiv'],
  ['Koffein',8,6,7,'Stimulanzien','mildes Aktivierungsprofil'],
  ['Nikotin',7,6,5,'Stimulanzien','kurzer Fokus-Schub'],
  ['MDMA',6,6,8,'Empathogene','prosozial, emotionale Integration'],
  ['MDA',6,7,6,'Empathogene','empathogen + psychedelischer'],
  ['Alkohol',3,3,2,'Sedativa','enthemmend, unschärfer'],
  ['Benzodiazepine',1,1,1,'Sedativa','dämpfend, kaum Integration'],
  ['Cannabis',4,3,5,'Sedativa','kontextabhängig, introspektiv bis diffus'],
  ['GHB/GBL',2,2,2,'Sedativa','sedierend, enthemmend'],
  ['Opioide',2,2,3,'Sedativa','wärmend, beruhigend, enges Profil']
];
const doseMap = {
  'LSD': [[6,6,6,'niedrig'],[8,7,5,'mittel'],[5,9,3,'hoch']],
  'Psilocybin': [[5,5,7,'niedrig'],[6,6,8,'mittel'],[4,8,5,'hoch']],
  'Mescalin': [[7,5,8,'niedrig'],[8,6,8,'mittel'],[6,8,6,'hoch']],
  'DMT': [[5,8,3,'niedrig'],[4,10,2,'mittel'],[2,10,1,'hoch']],
  'Ayahuasca': [[5,5,8,'niedrig'],[6,6,9,'mittel'],[4,8,6,'hoch']],
  'Ketamin': [[4,4,6,'niedrig'],[3,4,6,'mittel'],[1,3,3,'hoch']],
  'Cannabis': [[5,3,6,'niedrig'],[4,3,5,'mittel'],[2,4,2,'hoch']],
  'MDMA': [[6,5,8,'niedrig'],[6,6,8,'mittel'],[4,8,5,'hoch']],
  'Amphetamin': [[8,7,5,'niedrig'],[9,9,3,'mittel'],[7,10,1,'hoch']],
  'Kokain': [[6,8,3,'niedrig'],[6,9,2,'mittel'],[4,10,1,'hoch']],
  'Alkohol': [[4,3,4,'niedrig'],[3,3,2,'mittel'],[1,2,1,'hoch']]
};
const trajectories = {
  'Psilocybin': [[5,5,7,'Baseline'],[4,7,5,'Come-up'],[6,6,8,'Peak'],[7,4,9,'Afterglow']],
  'LSD': [[5,5,7,'Baseline'],[7,8,4,'Come-up'],[8,7,5,'Peak'],[7,5,6,'Re-Entry']],
  'Ketamin': [[5,5,7,'Baseline'],[2,4,3,'Dip'],[3,4,6,'Hole/Insight'],[5,4,7,'Re-Entry']],
  'MDMA': [[5,5,7,'Baseline'],[6,7,8,'Lift'],[6,6,8,'Peak'],[5,4,7,'Comedown']],
  'Ayahuasca': [[5,5,7,'Baseline'],[4,6,6,'Come-up'],[6,6,9,'Peak'],[6,4,9,'Integration']],
  'DMT': [[5,5,7,'Baseline'],[4,10,2,'Breakthrough'],[4,6,3,'Return']],
  'Cannabis': [[5,5,7,'Baseline'],[4,3,5,'Onset'],[3,3,4,'Peak'],[4,4,5,'Return']]
};

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const tip = document.getElementById('tip');
const hud = document.getElementById('hud');
let W=0,H=0,dpr=1;
const state = {rx:-0.62, ry:0.62, scale:1.0, layer:'base', trajectory:'all', activeCats:new Set(Object.keys(categories)), pointerDown:false, lastX:0, lastY:0, pinchDist:null};

function resize(){
  dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  W = canvas.clientWidth; H = canvas.clientHeight;
  canvas.width = Math.round(W*dpr); canvas.height = Math.round(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  draw();
}
window.addEventListener('resize', resize);

function rotY(p,a){const c=Math.cos(a),s=Math.sin(a);return {x:p.x*c+p.z*s,y:p.y,z:-p.x*s+p.z*c,meta:p.meta};}
function rotX(p,a){const c=Math.cos(a),s=Math.sin(a);return {x:p.x,y:p.y*c-p.z*s,z:p.y*s+p.z*c,meta:p.meta};}
function project(x,y,z,meta){ let p={x:(x-5)*28,y:(y-5)*-28,z:(z-5)*28,meta}; p=rotY(p,state.ry); p=rotX(p,state.rx); const depth=420/(420-p.z*state.scale); return {sx:W/2+p.x*depth*state.scale, sy:H/2+p.y*depth*state.scale, depth, z:p.z, meta}; }
function drawAxis(){
  const ax=[
    [[0,0,0],[10,0,0],'Klarheit'],
    [[0,0,0],[0,10,0],'Aktivierung'],
    [[0,0,0],[0,0,10],'Integration']
  ];
  ctx.lineWidth=1;
  ax.forEach(([a,b,label],i)=>{
    const p1=project(...a), p2=project(...b);
    ctx.strokeStyle=['#8fb9ff','#ff9fb0','#8ff0c2'][i];
    ctx.beginPath(); ctx.moveTo(p1.sx,p1.sy); ctx.lineTo(p2.sx,p2.sy); ctx.stroke();
    ctx.fillStyle=ctx.strokeStyle; ctx.font='12px -apple-system, sans-serif'; ctx.fillText(label,p2.sx+6,p2.sy-6);
  });
}
function drawGrid(){
  ctx.lineWidth=1;
  for(let i=0;i<=10;i++){
    const a=project(0,i,0), b=project(10,i,0), c=project(i,0,0), d=project(i,10,0);
    ctx.strokeStyle='rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(c.sx,c.sy); ctx.lineTo(d.sx,d.sy); ctx.stroke();
  }
}
let hitTargets=[];
function draw(){
  ctx.clearRect(0,0,W,H); hitTargets=[];
  drawGrid(); drawAxis();
  const items=[];
  base.forEach(([name,x,y,z,cat,desc])=>{ if(state.activeCats.has(cat)) items.push({type:'point', name, x,y,z, cat, desc, detail:`Basisprofil · ${cat}`}); });
  if(state.layer==='dose' || state.layer==='all') Object.entries(doseMap).forEach(([name,pts])=>{
    const baseCat=(base.find(b=>b[0]===name)||[])[4]; if(!state.activeCats.has(baseCat)) return;
    for(let i=0;i<pts.length;i++){
      const [x,y,z,label]=pts[i]; items.push({type:'dose',name,x,y,z,cat:baseCat,desc:`Dosis-Stufe: ${label}`,detail:`${name} · ${label}`});
      if(i<pts.length-1){ const [x2,y2,z2]=pts[i+1]; items.push({type:'line',name,x,y,z,x2,y2,z2,cat:baseCat,alpha:.35}); }
    }
  });
  if(state.layer==='trajectories' || state.layer==='all') Object.entries(trajectories).forEach(([name,pts])=>{
    if(state.trajectory!=='all' && state.trajectory!==name) return;
    const baseCat=(base.find(b=>b[0]===name)||[])[4]; if(!state.activeCats.has(baseCat)) return;
    for(let i=0;i<pts.length;i++){
      const [x,y,z,label]=pts[i]; items.push({type:'traj',name,x,y,z,cat:baseCat,desc:`Trajektorie: ${label}`,detail:`${name} · ${label}`});
      if(i<pts.length-1){ const [x2,y2,z2]=pts[i+1]; items.push({type:'line',name,x,y,z,x2,y2,z2,cat:baseCat,alpha:.9, strong:true}); }
    }
  });
  const projected=[];
  items.forEach(it=>{
    if(it.type==='line'){
      const p1=project(it.x,it.y,it.z), p2=project(it.x2,it.y2,it.z2);
      projected.push({kind:'line',z:(p1.z+p2.z)/2,p1,p2,it});
    } else {
      const p=project(it.x,it.y,it.z,it); projected.push({kind:'point',z:p.z,p,it});
    }
  });
  projected.sort((a,b)=>a.z-b.z);
  projected.forEach(o=>{
    if(o.kind==='line'){
      ctx.strokeStyle=hexToRgba(categories[o.it.cat], o.it.alpha || .5);
      ctx.lineWidth=o.it.strong?2.6:1.2;
      ctx.beginPath(); ctx.moveTo(o.p1.sx,o.p1.sy); ctx.lineTo(o.p2.sx,o.p2.sy); ctx.stroke();
    } else {
      const color=categories[o.it.cat];
      const r = o.it.type==='point' ? 7*o.p.depth : (o.it.type==='dose' ? 4.5*o.p.depth : 5.3*o.p.depth);
      ctx.fillStyle=color; ctx.beginPath(); ctx.arc(o.p.sx,o.p.sy,r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.75)'; ctx.lineWidth=1; ctx.stroke();
      if(o.it.type==='point'){ ctx.fillStyle='rgba(235,243,255,.92)'; ctx.font='12px -apple-system, sans-serif'; ctx.fillText(o.it.name,o.p.sx+9,o.p.sy-8); }
      hitTargets.push({x:o.p.sx,y:o.p.sy,r:Math.max(12,r+8),it:o.it});
    }
  });
  hud.textContent = `Rotieren: ${Math.round(state.ry*57.3)}° / ${Math.round(state.rx*57.3)}° · Zoom: ${state.scale.toFixed(2)}x`;
}
function hexToRgba(hex,a){const m=hex.replace('#','');const n=parseInt(m,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;}
function showTip(it){tip.style.display='block'; tip.innerHTML=`<h2>${it.name}</h2><div class="small">${it.detail}</div><div class="small">Klarheit ${fmt(it.x)} · Aktivierung ${fmt(it.y)} · Integration ${fmt(it.z)}</div><div class="small">${it.desc}</div>`;}
function hideTip(){tip.style.display='none';}
function fmt(v){return typeof v==='number'?v.toFixed(1):v;}
function pick(x,y){ for(let i=hitTargets.length-1;i>=0;i--){const h=hitTargets[i]; const dx=x-h.x, dy=y-h.y; if(dx*dx+dy*dy<=h.r*h.r) return h.it;} return null; }

function setView(view){
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
  if(view==='default'){state.rx=-0.62; state.ry=0.62; state.scale=1.0;}
  if(view==='top'){state.rx=-1.55; state.ry=0; state.scale=1.0;}
  if(view==='side'){state.rx=0; state.ry=1.57; state.scale=1.0;}
  if(view==='integrative'){state.rx=-0.45; state.ry=0.4; state.scale=1.25;}
  if(view==='activation'){state.rx=-0.2; state.ry=0.85; state.scale=1.15;}
  draw();
}
function setLayer(layer){ state.layer=layer; document.querySelectorAll('[data-layer]').forEach(b=>b.classList.toggle('active', b.dataset.layer===layer)); draw(); }

function pointerPos(ev){const r=canvas.getBoundingClientRect(); return {x:ev.clientX-r.left,y:ev.clientY-r.top};}
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId); state.pointerDown=true; const p=pointerPos(e); state.lastX=p.x; state.lastY=p.y;});
canvas.addEventListener('pointermove',e=>{ if(!state.pointerDown) return; const p=pointerPos(e); state.ry += (p.x-state.lastX)*0.01; state.rx += (p.y-state.lastY)*0.01; state.rx=Math.max(-1.56,Math.min(1.56,state.rx)); state.lastX=p.x; state.lastY=p.y; hideTip(); draw(); });
canvas.addEventListener('pointerup',e=>{ state.pointerDown=false; const p=pointerPos(e); const it=pick(p.x,p.y); if(it) showTip(it); });
canvas.addEventListener('wheel',e=>{e.preventDefault(); state.scale *= Math.exp(-e.deltaY*0.001); state.scale=Math.max(.6,Math.min(2.4,state.scale)); draw();},{passive:false});
canvas.addEventListener('touchstart',e=>{ if(e.touches.length===2){ const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY); state.pinchDist=d; } },{passive:false});
canvas.addEventListener('touchmove',e=>{ if(e.touches.length===2){ e.preventDefault(); const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY); if(state.pinchDist){ state.scale*=d/state.pinchDist; state.scale=Math.max(.6,Math.min(2.4,state.scale)); } state.pinchDist=d; draw(); } },{passive:false});
canvas.addEventListener('touchend',()=>{ state.pinchDist=null; });

Object.keys(categories).forEach(cat=>{
  const btn=document.createElement('button'); btn.textContent=cat; btn.className='active'; btn.style.borderColor=categories[cat]+'66';
  btn.onclick=()=>{ if(state.activeCats.has(cat)){state.activeCats.delete(cat); btn.classList.remove('active');} else {state.activeCats.add(cat); btn.classList.add('active');} hideTip(); draw(); };
  document.getElementById('catRow').appendChild(btn);
  const li=document.createElement('div'); li.className='legend-item'; li.innerHTML=`<span class="dot" style="background:${categories[cat]}"></span>${cat}`; document.getElementById('legend').appendChild(li);
});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
document.getElementById('resetBtn').onclick=()=>{state.activeCats=new Set(Object.keys(categories)); document.querySelectorAll('#catRow button').forEach(b=>b.classList.add('active')); document.getElementById('trajSelect').value='all'; state.trajectory='all'; setLayer('base'); setView('default'); hideTip(); draw();};
document.querySelectorAll('[data-layer]').forEach(b=>b.onclick=()=>setLayer(b.dataset.layer));
const trajSelect=document.getElementById('trajSelect'); Object.keys(trajectories).forEach(k=>{const o=document.createElement('option'); o.value=k; o.textContent=k; trajSelect.appendChild(o);}); trajSelect.onchange=()=>{state.trajectory=trajSelect.value; if(state.layer==='base') setLayer('trajectories'); else draw();};
resize();