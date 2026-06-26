// @ts-nocheck
/* Logica original de Centro de mando, envuelta en una funcion que se ejecuta
   una vez en el cliente (despues de que el markup ya esta en el DOM).
   La unica modificacion respecto al HTML original: el modulo SYNC ahora apunta
   por defecto a la API route same-origin '/api/sync' (Upstash Redis). */
export function initCentralCommand() {
/* ============ helpers compartidos ============ */
const $=(id)=>document.getElementById(id);
const esc=s=>(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let toastT;function toast(msg,color){const el=$('toast');el.textContent=msg;if(color)el.style.borderColor=color;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2200);}
function downloadJSON(data,name){const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();}

/* ============ navegación por pestañas ============ */
const TAB_KEY='cdm-active-tab';
(function tabs(){
  const btns=[...document.querySelectorAll('.tab')];
  function activate(target){
    document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===target));
    btns.forEach(b=>b.classList.toggle('active',b.dataset.target===target));
    localStorage.setItem(TAB_KEY,target);
    window.scrollTo({top:0,behavior:'instant'in window?'instant':'auto'});
  }
  btns.forEach(b=>b.onclick=()=>activate(b.dataset.target));
  const saved=localStorage.getItem(TAB_KEY);
  if(saved&&document.getElementById(saved))activate(saved);
})();

/* ============ canvas fx (compartido) ============ */
const cv=$('fx'),ctx2=cv.getContext('2d');
function szfx(){cv.width=innerWidth;cv.height=innerHeight;}szfx();addEventListener('resize',szfx);
let parts=[];
function fireworks(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const cx=innerWidth/2,cy=innerHeight/2,cols=['#8B5CF6','#22D3EE','#FBBF24','#34D399'];
  for(let i=0;i<48;i++){const a=Math.PI*2*i/48,sp=3+Math.random()*4;parts.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:60,c:cols[i%cols.length]});}
  if(parts.length<=48)tickfx();
}
function tickfx(){
  ctx2.clearRect(0,0,cv.width,cv.height);parts=parts.filter(p=>p.life>0);
  parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.life--;ctx2.globalAlpha=p.life/60;ctx2.fillStyle=p.c;ctx2.beginPath();ctx2.arc(p.x,p.y,3,0,7);ctx2.fill();});
  ctx2.globalAlpha=1;if(parts.length)requestAnimationFrame(tickfx);else ctx2.clearRect(0,0,cv.width,cv.height);
}

/* ============================================================
   RPG STUDY
   ============================================================ */
(function RPG(){
  const KEY='rpg-study-v4';
  const MISSIONS=[
    {id:'ingles',icon:'🌐',name:'Inglés técnico',xp:110,min:'45 min',skill:'ingles',m:true},
    {id:'aplicar',icon:'🎯',name:'Aplicar a vacantes',xp:100,min:'45 min',skill:'busqueda',m:true},
    {id:'portfolio',icon:'🏗️',name:'Portfolio / GitHub',xp:95,min:'60 min',skill:'proyectos'},
    {id:'codigo',icon:'💻',name:'Entrevista de código',xp:80,min:'45 min',skill:'livecoding'},
    {id:'teorica',icon:'🎤',name:'Entrevista teórica simulada',xp:70,min:'30 min',skill:'comunicacion'},
    {id:'leetcode',icon:'⚡',name:'HackerRank / LeetCode',xp:60,min:'30 min',skill:'algoritmos'},
    {id:'teoria',icon:'📚',name:'Teoría + Arquitectura',xp:55,min:'45 min',skill:'fundamentos'},
    {id:'botas',icon:'👢',name:'Botas Don Lalo',xp:40,min:'30 min',skill:'negocio'},
  ];
  const SKILLS=[['ingles','Inglés'],['busqueda','Búsqueda'],['proyectos','Proyectos'],['livecoding','Live Coding'],['comunicacion','Comunicación'],['algoritmos','Algoritmos'],['fundamentos','Fundamentos'],['negocio','Negocio']];
  const SKILL_STEP=250;
  const todayStr=()=>new Date().toISOString().slice(0,10);
  const fresh=()=>({totalXp:0,xpByDay:{},done:{},lastDay:todayStr(),streak:0,lastStreakDay:null,skillXp:{},log:[]});
  let S=load();
  function load(){try{const r=JSON.parse(localStorage.getItem(KEY));return r&&r.skillXp?r:fresh();}catch(e){return fresh();}}
  function save(){localStorage.setItem(KEY,JSON.stringify(S));}
  if(S.lastDay!==todayStr()){S.done={};S.lastDay=todayStr();save();}

  function levelFromXp(xp){let lvl=1,need=400,acc=0;while(xp>=acc+need){acc+=need;lvl++;need+=150;}return {lvl,cur:xp-acc,need};}
  function award(xp,skill){
    S.totalXp+=xp;const t=todayStr();S.xpByDay[t]=(S.xpByDay[t]||0)+xp;
    if(skill)S.skillXp[skill]=(S.skillXp[skill]||0)+xp;
    if(S.lastStreakDay!==t){const y=new Date(Date.now()-864e5).toISOString().slice(0,10);S.streak=(S.lastStreakDay===y)?S.streak+1:1;S.lastStreakDay=t;}
    save();render();
  }
  function toggle(m){
    if(S.done[m.id]){S.done[m.id]=false;S.totalXp=Math.max(0,S.totalXp-m.xp);const t=todayStr();S.xpByDay[t]=Math.max(0,(S.xpByDay[t]||0)-m.xp);if(m.skill)S.skillXp[m.skill]=Math.max(0,(S.skillXp[m.skill]||0)-m.xp);save();render();}
    else{S.done[m.id]=true;award(m.xp,m.skill);fireworks();toast('+'+m.xp+' XP · '+m.name,'#8B5CF6');}
  }
  function render(){
    const t=todayStr(),lv=levelFromXp(S.totalXp);
    $('rpg-level').textContent=lv.lvl;$('rpg-xptoday').textContent=(S.xpByDay[t]||0);
    $('rpg-streak').textContent=(S.streak||0)+'🔥';
    $('rpg-missions').textContent=MISSIONS.filter(m=>S.done[m.id]).length+'/'+MISSIONS.length;
    $('rpg-lvlnum').textContent=lv.lvl;$('rpg-lvlcur').textContent=lv.cur;$('rpg-lvlneed').textContent=lv.need;
    $('rpg-lvlbar').style.width=(100*lv.cur/lv.need).toFixed(1)+'%';
    const mc=$('rpg-missionList');mc.innerHTML='';
    MISSIONS.forEach(m=>{const done=!!S.done[m.id];const el=document.createElement('div');el.className='mission'+(done?' done':'');
      el.innerHTML=`<div class="mcheck"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0E0B1A" stroke-width="3.5"><path d="M5 13l4 4L19 7"/></svg></div><div class="micon">${m.icon}</div><div class="minfo"><div class="name">${m.name}${m.m?'<span class="mmin">MÍNIMO</span>':''}</div><div class="meta">${m.min}</div></div><div class="mxp">+${m.xp}</div>`;
      el.onclick=()=>toggle(m);mc.appendChild(el);});
    const sc=$('rpg-skillList');sc.innerHTML='';
    SKILLS.forEach(([id,name])=>{const xp=S.skillXp[id]||0,lvl=Math.floor(xp/SKILL_STEP)+1,into=xp%SKILL_STEP;
      const el=document.createElement('div');el.className='skill';
      el.innerHTML=`<div class="sname">${name}<span class="slvl">Lv ${lvl}</span></div><div class="sbar"><i style="width:${(100*into/SKILL_STEP).toFixed(0)}%"></i></div>`;sc.appendChild(el);});
    const lc=$('rpg-log');lc.innerHTML='';
    (S.log||[]).slice(-6).reverse().forEach(it=>{const el=document.createElement('div');el.className='logitem';el.innerHTML=`<span class="d">${it.d}</span> · <b>${esc(it.t)}</b>`;lc.appendChild(el);});
  }
  function addTopic(){const inp=$('rpg-topicIn'),v=inp.value.trim();if(!v)return;S.log.push({d:todayStr(),t:v});inp.value='';save();render();}
  $('rpg-topicAdd').onclick=addTopic;
  $('rpg-topicIn').addEventListener('keydown',e=>{if(e.key==='Enter')addTopic();});
  // pomodoro
  let secs=25*60,timer=null,running=false;
  const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  const paint=()=>$('rpg-pomo').textContent=fmt(secs);
  $('rpg-pomoStart').onclick=function(){
    if(running){clearInterval(timer);running=false;this.textContent='Continuar';return;}
    running=true;this.textContent='Pausar';
    timer=setInterval(()=>{secs--;paint();if(secs<=0){clearInterval(timer);running=false;secs=25*60;paint();$('rpg-pomoStart').textContent='Iniciar';award(150,null);fireworks();toast('Pomodoro completado · +150 XP','#22D3EE');}},1000);
  };
  $('rpg-pomoReset').onclick=()=>{clearInterval(timer);running=false;secs=25*60;paint();$('rpg-pomoStart').textContent='Iniciar';};
  // toolbar
  $('rpg-export').onclick=()=>downloadJSON(S,'rpg-study-backup.json');
  $('rpg-import').onclick=()=>$('rpg-file').click();
  $('rpg-file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{S=JSON.parse(r.result);save();render();toast('Datos importados');}catch(err){toast('Archivo inválido');}};r.readAsText(f);};
  $('rpg-resetDay').onclick=()=>{if(confirm('¿Reiniciar las misiones de hoy? (No borra tu XP total)')){S.done={};save();render();}};
  render();
})();

/* ============================================================
   ROADMAP
   ============================================================ */
(function ROAD(){
  const KEY='roadmap-v4';
  const PHASES=[
    {code:'F1',title:'Fundamentos modernos',sub:'TypeScript · Next.js · PostgreSQL · Portfolio',tasks:['TypeScript: tipos, generics, type vs interface, declaration merging','Next.js: App Router, rutas, layouts','PostgreSQL básico + conexión','Refactor del portfolio con links a GitHub']},
    {code:'F2',title:'React intermedio',sub:'Hooks · estado · patrones',tasks:['useMemo / useCallback bien aplicados','Custom hooks','Zustand (estado global ligero)','Patrones de composición']},
    {code:'F3',title:'React avanzado',sub:'TanStack Query · Concurrent · RSC',tasks:['TanStack Query (cache, invalidación)','Concurrent features / Suspense','React Server Components','Optimización de renders']},
    {code:'F4',title:'Performance',sub:'Web vitals · caching · CDN',tasks:['Core Web Vitals + Lighthouse','CDN / edge cache, TTL','Cache-aside y stampede problem','Code splitting / lazy loading']},
    {code:'F5',title:'Testing frontend',sub:'Unit · integración · e2e',tasks:['Vitest / Jest','React Testing Library','Playwright (e2e)','Cobertura y CI']},
    {code:'F6',title:'Testing backend',sub:'API · base de datos',tasks:['Tests de endpoints','Mocks y fixtures','Tests de integración con DB']},
    {code:'F7',title:'Backend Pro',sub:'Fastify · Docker · CI/CD',tasks:['Fastify / Node avanzado','Docker (imágenes, compose)','CI/CD pipelines','Variables de entorno y secrets']},
    {code:'F8',title:'Arquitectura',sub:'Clean Architecture · escalabilidad',tasks:['Clean Architecture + regla de dependencias','Diseño de codebases grandes','Patrones de escalabilidad']},
    {code:'F9',title:'IA + inglés + entrevistas + AWS',sub:'cierre y empleabilidad',tasks:['Inglés técnico (B1 → B2)','Simulacros de entrevista (código + teórica)','AWS Cloud Practitioner (S3, VPC, RDS, billing)','Integración de IA en proyectos del portfolio']},
  ];
  let S=load();
  function load(){try{return JSON.parse(localStorage.getItem(KEY))||{};}catch(e){return {};}}
  function save(){localStorage.setItem(KEY,JSON.stringify(S));}
  const tid=(p,i)=>p+'-'+i;
  function render(){
    const wrap=$('rd-phases');wrap.innerHTML='';let total=0,done=0;
    PHASES.forEach(p=>{
      const ph=document.createElement('div');ph.className='phase'+(S['_open_'+p.code]?' open':'');
      const dc=p.tasks.filter((_,i)=>S[tid(p.code,i)]).length;total+=p.tasks.length;done+=dc;
      ph.innerHTML=`<div class="ph"><div class="pcode">${p.code}</div><div class="ptitle">${p.title}<small>${p.sub}</small></div><div class="pcount">${dc}/${p.tasks.length}</div><svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6"/></svg></div><div class="pbody"></div>`;
      const body=ph.querySelector('.pbody');
      p.tasks.forEach((t,i)=>{const isD=!!S[tid(p.code,i)];const row=document.createElement('div');row.className='task'+(isD?' done':'');
        row.innerHTML=`<div class="tcheck"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0E0B1A" stroke-width="3.5"><path d="M5 13l4 4L19 7"/></svg></div><div class="tlabel">${t}</div>`;
        row.onclick=e=>{e.stopPropagation();S[tid(p.code,i)]=!isD;save();render();};body.appendChild(row);});
      ph.querySelector('.ph').onclick=()=>{S['_open_'+p.code]=!S['_open_'+p.code];save();render();};
      wrap.appendChild(ph);
    });
    const pct=total?Math.round(100*done/total):0;$('rd-pct').textContent=pct+'%';$('rd-bar').style.width=pct+'%';
  }
  $('rd-export').onclick=()=>downloadJSON(S,'roadmap-backup.json');
  $('rd-import').onclick=()=>$('rd-file').click();
  $('rd-file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{S=JSON.parse(r.result);save();render();}catch(err){alert('Archivo inválido');}};r.readAsText(f);};
  render();
})();

/* ============================================================
   REPASO ESPACIADO
   ============================================================ */
(function REP(){
  const KEY='repaso',OFFSETS=[1,3,7,30];
  let S=load(),filter='due';
  function load(){try{return JSON.parse(localStorage.getItem(KEY))||[];}catch(e){return [];}}
  function save(){localStorage.setItem(KEY,JSON.stringify(S));}
  const dayStr=d=>d.toISOString().slice(0,10);
  function addDays(n){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);return dayStr(d);}
  function today(){const d=new Date();d.setHours(0,0,0,0);return dayStr(d);}
  function addTopic(){const inp=$('rep-topic'),v=inp.value.trim();if(!v)return;S.push({id:Date.now(),title:v,step:0,next:addDays(OFFSETS[0]),created:today()});inp.value='';save();render();}
  $('rep-add').onclick=addTopic;$('rep-topic').addEventListener('keydown',e=>{if(e.key==='Enter')addTopic();});
  function advance(it){it.step++;it.next=it.step>=OFFSETS.length?null:addDays(OFFSETS[it.step]);save();render();toast('Repaso registrado','#FBBF24');}
  function remove(id){S=S.filter(x=>x.id!==id);save();render();}
  function statusOf(it){if(it.next===null)return 'done';if(it.next<=today())return 'due';return 'upcoming';}
  function whenLabel(it){if(it.next===null)return {txt:'Consolidado · 4/4 repasos',cls:''};const t=today();if(it.next<t)return {txt:'Atrasado desde '+it.next,cls:'over'};if(it.next===t)return {txt:'Toca repasar hoy',cls:'due'};const diff=Math.round((new Date(it.next)-new Date(t))/864e5);return {txt:'Próximo repaso en '+diff+' día'+(diff>1?'s':''),cls:''};}
  function ladder(it){let h='<div class="ladder">';for(let i=0;i<OFFSETS.length;i++){const ht=12+i*8;let c='rung';if(i<it.step)c+=' done';else if(i===it.step&&it.next!==null&&it.next<=today())c+=' current';h+=`<div class="${c}" style="height:${ht}px"></div>`;}return h+'</div>';}
  function render(){
    const counts={due:0,upcoming:0,done:0};S.forEach(i=>counts[statusOf(i)]++);
    $('rep-bDue').textContent=counts.due;$('rep-bUp').textContent=counts.upcoming;$('rep-bDone').textContent=counts.done;
    $('rep-seg').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.f===filter));
    const list=S.filter(i=>statusOf(i)===filter).sort((a,b)=>((a.next||'9')<(b.next||'9')?-1:1));
    const wrap=$('rep-cards');wrap.innerHTML='';
    if(!list.length){wrap.innerHTML=`<div class="empty"><div class="big">${filter==='due'?'✓':'—'}</div>${filter==='due'?'Nada que repasar hoy. Buen momento para agregar un tema nuevo.':filter==='upcoming'?'No hay repasos programados todavía.':'Aún no consolidas ningún tema. Sube los cuatro peldaños y aparecerán aquí.'}</div>`;return;}
    list.forEach(it=>{const w=whenLabel(it);const el=document.createElement('div');el.className='card';
      el.innerHTML=`${ladder(it)}<div class="ctitle"><div class="t">${esc(it.title)}</div><div class="when ${w.cls}">${w.txt}</div></div><div class="actions">${it.next!==null?`<button class="ibtn ok" title="Repasado"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg></button>`:''}<button class="ibtn del" title="Eliminar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>`;
      const ok=el.querySelector('.ok');if(ok)ok.onclick=()=>advance(it);el.querySelector('.del').onclick=()=>remove(it.id);wrap.appendChild(el);});
  }
  $('rep-seg').onclick=e=>{const b=e.target.closest('button');if(!b)return;filter=b.dataset.f;render();};
  $('rep-export').onclick=()=>downloadJSON(S,'repaso-backup.json');
  $('rep-import').onclick=()=>$('rep-file').click();
  $('rep-file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{S=JSON.parse(r.result);save();render();}catch(err){alert('Archivo inválido');}};r.readAsText(f);};
  render();
})();

/* ============================================================
   CONTEXTOS
   ============================================================ */
(function CTX(){
  const KEY='contextos';
  const INTRO='Hola, retomo un trabajo anterior. Aquí está el contexto compactado del chat previo para que sigamos sin repetir todo:';
  const COLORS=['#5B9DF9','#34D399','#FBBF24','#C062D0','#F87171','#2DD4BF','#8B5CF6','#E0913A'];
  let S=load(),projFilter=null,search='';
  function load(){try{return JSON.parse(localStorage.getItem(KEY))||[];}catch(e){return [];}}
  function save(){localStorage.setItem(KEY,JSON.stringify(S));}
  const tokenEst=s=>Math.max(0,Math.round((s||'').length/4));
  function projColor(n){if(!n)return '#6E6796';let h=0;for(let i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))>>>0;return COLORS[h%COLORS.length];}
  $('ctx-body').addEventListener('input',e=>$('ctx-tok').textContent='~'+tokenEst(e.target.value)+' tokens');
  $('ctx-save').onclick=()=>{
    const title=$('ctx-title').value.trim(),project=$('ctx-project').value.trim(),body=$('ctx-body').value.trim();
    if(!title||!body){alert('Falta el título o el contenido.');return;}
    S.unshift({id:Date.now(),title,project,body,created:new Date().toISOString().slice(0,10)});save();
    $('ctx-title').value='';$('ctx-project').value='';$('ctx-body').value='';$('ctx-tok').textContent='~0 tokens';render();toast('Guardado en la bóveda','#5B9DF9');
  };
  const projects=()=>[...new Set(S.map(e=>e.project).filter(Boolean))];
  function copyEntry(e,withIntro,btn){const text=withIntro?INTRO+'\n\n'+e.body:e.body;navigator.clipboard.writeText(text).then(()=>{const sp=btn.querySelector('span');sp.textContent='¡Copiado!';setTimeout(()=>sp.textContent='Copiar',1400);});}
  function render(){
    const dl=$('ctx-projects');dl.innerHTML='';projects().forEach(p=>{const o=document.createElement('option');o.value=p;dl.appendChild(o);});
    const chips=$('ctx-chips');chips.innerHTML='';
    const all=document.createElement('button');all.className='chip'+(projFilter===null?' active':'');all.textContent='Todos';if(projFilter===null)all.style.background='#3A3460';all.style.color='#ECE9FB';all.onclick=()=>{projFilter=null;render();};chips.appendChild(all);
    projects().forEach(p=>{const c=document.createElement('button');c.className='chip'+(projFilter===p?' active':'');c.textContent=p;if(projFilter===p)c.style.background=projColor(p);c.onclick=()=>{projFilter=(projFilter===p?null:p);render();};chips.appendChild(c);});
    let list=S.slice();
    if(projFilter)list=list.filter(e=>e.project===projFilter);
    if(search)list=list.filter(e=>(e.title+' '+e.body+' '+(e.project||'')).toLowerCase().includes(search.toLowerCase()));
    const wrap=$('ctx-entries');wrap.innerHTML='';
    if(!list.length){wrap.innerHTML='<div class="empty">La bóveda está vacía. Guarda tu primer contexto arriba.</div>';return;}
    list.forEach(e=>{const el=document.createElement('div');el.className='entry';
      el.innerHTML=`<div class="ehead"><div class="etitle">${esc(e.title)}</div>${e.project?`<span class="ptag" style="background:${projColor(e.project)}">${esc(e.project)}</span>`:''}<span class="etok">~${tokenEst(e.body)} tok</span></div><div class="ebody">${esc(e.body)}</div><div class="eacts"><button class="ebtn copy"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg><span>Copiar</span></button><label class="intro-opt"><input type="checkbox" class="introchk"> con intro en español</label><button class="ebtn del">Eliminar</button></div>`;
      const copyBtn=el.querySelector('.copy'),chk=el.querySelector('.introchk');
      copyBtn.onclick=()=>copyEntry(e,chk.checked,copyBtn);
      el.querySelector('.del').onclick=()=>{if(confirm('¿Eliminar este contexto?')){S=S.filter(x=>x.id!==e.id);save();render();}};
      wrap.appendChild(el);});
  }
  $('ctx-search').addEventListener('input',e=>{search=e.target.value;render();});
  $('ctx-export').onclick=()=>downloadJSON(S,'contextos-backup.json');
  $('ctx-import').onclick=()=>$('ctx-file').click();
  $('ctx-file').onchange=ev=>{const f=ev.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);S=Array.isArray(d)?d:S;save();render();}catch(err){alert('Archivo inválido');}};r.readAsText(f);};
  render();
})();

/* ============================================================
   ANALIZADOR DE VACANTES
   ============================================================ */
(function JOB(){
  const STRONG={'react':'React','redux':'Redux','javascript':'JavaScript','es6':'ES6+','vue':'Vue.js','node':'Node.js','aws':'AWS','cloudfront':'CloudFront','lambda':'Lambda','django':'Django','rest':'REST APIs','git':'Git','scrum':'SCRUM','postgres':'PostgreSQL','postgresql':'PostgreSQL','html':'HTML','css':'CSS','php':'PHP','lighthouse':'Lighthouse','drf':'DRF'};
  const GAP={'typescript':'TypeScript','next.js':'Next.js','nextjs':'Next.js','zustand':'Zustand','tanstack':'TanStack Query','react query':'TanStack Query','tailwind':'Tailwind','docker':'Docker','graphql':'GraphQL','kubernetes':'Kubernetes','jest':'Jest','vitest':'Vitest','playwright':'Playwright','cypress':'Cypress','angular':'Angular','svelte':'Svelte'};
  $('job-analyze').onclick=()=>{
    const raw=$('job-jd').value;if(!raw.trim()){alert('Pega primero la descripción de la vacante.');return;}
    const t=' '+raw.toLowerCase()+' ';
    const matched={};for(const[k,l]of Object.entries(STRONG))if(t.includes(k))matched[l]=true;
    const gapsReq={};for(const[k,l]of Object.entries(GAP))if(t.includes(k))gapsReq[l]=true;
    const matchList=Object.keys(matched),gapList=Object.keys(gapsReq);
    const engHigh=/(advanced english|fluent english|english\s*(b2|c1|c2)|inglés\s*(avanzado|b2|c1|c2)|english required|proficient in english|excellent communication)/i.test(raw);
    const engMention=/english|inglés/i.test(raw);
    const remote=/(remote|remoto|work from home|home office|distributed)/i.test(raw);
    const usd=/(usd|\$\s*\d|dollars|us dollar)/i.test(raw);
    const senior=/(senior|lead|staff|principal)/i.test(raw),junior=/(junior|jr\.|entry level|trainee)/i.test(raw);
    const totalReq=(matchList.length+gapList.length)||1;
    let base=Math.round(100*matchList.length/totalReq);if(engHigh)base-=12;if(senior)base-=6;base=Math.max(8,Math.min(98,base));
    const col=base>=70?'#34D399':base>=45?'#FBBF24':'#F87171';
    $('job-ring').innerHTML=`<svg width="100" height="100" viewBox="0 0 104 104"><circle cx="52" cy="52" r="44" fill="none" stroke="#322A5C" stroke-width="9"/><circle cx="52" cy="52" r="44" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${2*Math.PI*44}" stroke-dashoffset="${2*Math.PI*44*(1-base/100)}" transform="rotate(-90 52 52)"/></svg><div class="pct" style="color:${col}">${base}%</div>`;
    let v,vd;
    if(base>=70){v='Buen match — aplica';vd='Tu stack cubre la mayoría de lo pedido. Personaliza el CV con sus keywords exactas.';}
    else if(base>=45){v='Match parcial — vale la pena';vd='Cubres lo central pero hay brechas. Aplica si te interesa y menciona que las estás aprendiendo.';}
    else{v='Match bajo';vd='Pide bastante fuera de tu stack actual. Aplica solo si te late mucho o úsalo como meta de aprendizaje.';}
    $('job-verdict').textContent=v;$('job-verdictD').textContent=vd;
    const flags=[];flags.push(remote?{c:'good',t:'Remoto'}:{c:'warn',t:'No menciona remoto'});
    if(usd)flags.push({c:'good',t:'USD / dólares'});
    if(engHigh)flags.push({c:'bad',t:'Inglés avanzado (tu blocker)'});else if(engMention)flags.push({c:'warn',t:'Menciona inglés'});
    if(senior)flags.push({c:'warn',t:'Senior/Lead'});if(junior)flags.push({c:'good',t:'Junior-friendly'});
    $('job-flags').innerHTML=flags.map(f=>`<span class="flag ${f.c}">${f.t}</span>`).join('');
    $('job-matches').innerHTML=matchList.length?matchList.map(m=>`<span class="pill match dot">${m}</span>`).join(''):'<span class="empty-skills">No detecté tus skills fuertes en el texto. Revisa que pegaste los requisitos.</span>';
    $('job-gaps').innerHTML=gapList.length?gapList.map(g=>`<span class="pill gap dot">${g}</span>`).join('')+`<div class="note">Estas aparecen en la vacante y son brechas/filtros ATS. Priorízalas en tu roadmap.</div>`:'<span class="empty-skills">No detecté brechas conocidas. Buena señal.</span>';
    $('job-result').classList.add('show');
    lastResult={name:($('job-name').value.trim()||('Vacante '+new Date().toLocaleDateString())),base,remote,usd,engHigh};
  };

  // ---- guardar vacante + match promedio ----
  const SKEY='saved-vacancies';
  let lastResult=null;
  let saved=loadSaved();
  function loadSaved(){try{return JSON.parse(localStorage.getItem(SKEY))||[];}catch(e){return [];}}
  function saveSaved(){localStorage.setItem(SKEY,JSON.stringify(saved));}
  const colorFor=p=>p>=70?'#34D399':p>=45?'#FBBF24':'#F87171';
  $('job-save').onclick=()=>{
    if(!lastResult)return;
    saved.unshift({id:Date.now(),name:lastResult.name,match:lastResult.base,date:new Date().toISOString().slice(0,10),remote:lastResult.remote,usd:lastResult.usd});
    saveSaved();renderSaved();toast('Vacante guardada · '+lastResult.base+'% match','#2DD4BF');
    $('job-name').value='';
  };
  function renderSaved(){
    const avgEl=$('job-avg');
    if(saved.length){
      const avg=Math.round(saved.reduce((a,b)=>a+(b.match||0),0)/saved.length);
      const c=colorFor(avg);
      avgEl.innerHTML=`<div class="avgcard"><div class="avgnum" style="color:${c}">${avg}%</div><div class="avgmeta"><div class="al">Match promedio</div><div class="as">${saved.length} vacante${saved.length>1?'s':''} guardada${saved.length>1?'s':''}</div></div></div>`;
    }else avgEl.innerHTML='';
    $('job-savedTitle').style.display=saved.length?'block':'none';
    const wrap=$('job-saved');wrap.innerHTML='';
    saved.forEach(v=>{
      const c=colorFor(v.match);
      const el=document.createElement('div');el.className='saved-item';
      el.innerHTML=`<div class="saved-pct" style="color:${c}">${v.match}%</div><div class="saved-info"><div class="sn">${esc(v.name)}</div><div class="sd">${v.date}${v.remote?' · remoto':''}${v.usd?' · USD':''}</div></div><button class="saved-del" title="Eliminar">✕</button>`;
      el.querySelector('.saved-del').onclick=()=>{saved=saved.filter(x=>x.id!==v.id);saveSaved();renderSaved();};
      wrap.appendChild(el);
    });
  }
  renderSaved();
})();
/* ============================================================
   FRASE MOTIVACIONAL DIARIA
   ============================================================ */
(function MOTTO(){
  const PHRASES=[
    "El progreso se construye un día a la vez. Hoy cuenta.",
    "No tienes que hacerlo todo, solo lo siguiente.",
    "La constancia le gana al talento cuando el talento no es constante.",
    "Cada aplicación enviada es una puerta que tocaste. Sigue tocando.",
    "Aprender incomoda. Esa incomodidad es la señal de que avanzas.",
    "El inglés se gana en repeticiones pequeñas, no en saltos heroicos.",
    "Un mal día no borra una buena racha.",
    "Descansar también es parte del plan. Hazlo sin culpa.",
    "Lo difícil de hoy será tu base de mañana.",
    "Mejor terminar el mínimo que abandonar el máximo.",
    "Tu próximo trabajo todavía no sabe que vas en camino.",
    "Pequeños pasos, repetidos, mueven montañas.",
    "El código que no entiendes hoy, lo dominarás esta semana.",
    "Enfócate en el bloque que tienes enfrente, no en toda la montaña.",
    "Compite contigo de ayer, no con nadie más.",
    "La disciplina es elegir a largo plazo sobre lo que quieres ahora.",
    "Cada repaso fija un poco más lo que ya sabes.",
    "Hecho es mejor que perfecto.",
    "Confía en el proceso que ya armaste. Solo ejecútalo.",
    "Las entrevistas se ganan en la práctica, no en la suerte.",
    "Hoy solo necesitas avanzar un casillero.",
    "El miedo a empezar suele ser más grande que la tarea misma.",
    "Tu portfolio habla por ti cuando no estás en la sala.",
    "Sembrar hoy es cosechar en unos meses. Sigue sembrando.",
    "La calma también se entrena. Respira y continúa.",
    "Un problema a la vez. Así se desarma cualquier reto.",
    "No subestimes lo que logras en sesiones cortas y consistentes.",
    "Estás más cerca de lo que crees. Sigue.",
    "El esfuerzo de hoy es invisible, pero no inútil.",
    "Empieza por tu mínimo no negociable. El resto vendrá solo.",
  ];
  const d=new Date();
  const dayNum=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);
  $('motto').textContent=PHRASES[((dayNum%PHRASES.length)+PHRASES.length)%PHRASES.length];
})();

/* ============================================================
   SINCRONIZACIÓN EN LA NUBE
   - localStorage sigue siendo la fuente local/offline
   - empuja y jala un blob con las 4 claves contra tu servidor
   - last-write-wins por timestamp (uso personal, un equipo a la vez)
   ============================================================ */
(function SYNC(){
  const CFG_KEY='cdm-sync-cfg';
  const DEFAULT_URL='/api/sync';
  const STAMP_KEY='cdm-last-applied';
  const DATA_KEYS=['rpg-study-v4','roadmap-v4','repaso','contextos','portfolio-projects','saved-vacancies'];
  let applying=false, pushT=null;

  const getCfg=()=>{try{return JSON.parse(localStorage.getItem(CFG_KEY))||{};}catch(e){return {};}};
  const setCfg=c=>localStorage.setItem(CFG_KEY,JSON.stringify(c));
  const configured=()=>{const c=getCfg();return !!c.code;};

  function collect(){const o={};DATA_KEYS.forEach(k=>{const v=localStorage.getItem(k);if(v!=null)o[k]=v;});return o;}
  function apply(data){applying=true;DATA_KEYS.forEach(k=>{if(data&&data[k]!=null)localStorage.setItem(k,data[k]);});applying=false;}

  function status(state,text){
    const box=$('syncStatus');box.className='syncstatus'+(state?(' '+state):'');
    $('syncStatusText').textContent=text;
    $('syncDot').style.display=configured()?'block':'none';
  }

  // intercept writes to data keys → debounce a push
  const _set=localStorage.setItem.bind(localStorage);
  localStorage.setItem=function(k,v){
    _set(k,v);
    if(!applying && DATA_KEYS.includes(k) && configured()){
      clearTimeout(pushT);pushT=setTimeout(push,1400);
    }
  };

  async function push(){
    const c=getCfg();if(!c.code)return;
    try{
      status('syncing','Subiendo cambios…');
      const updated_at=Date.now();
      const res=await fetch((c.url||DEFAULT_URL),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:c.code,data:collect(),updated_at})});
      if(!res.ok)throw new Error('HTTP '+res.status);
      _set(STAMP_KEY,String(updated_at));
      status('ok','Sincronizado · '+new Date().toLocaleTimeString());
    }catch(e){status('err','Error al subir: '+e.message);}
  }

  async function pull(opts){
    opts=opts||{};
    const c=getCfg();if(!c.code)return;
    try{
      if(opts.loud)status('syncing','Buscando cambios…');
      const res=await fetch((c.url||DEFAULT_URL)+'?code='+encodeURIComponent(c.code),{cache:'no-store'});
      if(!res.ok)throw new Error('HTTP '+res.status);
      const remote=await res.json();
      if(remote&&remote.data&&remote.updated_at){
        const localApplied=+localStorage.getItem(STAMP_KEY)||0;
        if(remote.updated_at>localApplied){
          apply(remote.data);
          _set(STAMP_KEY,String(remote.updated_at));
          if(!sessionStorage.getItem('cdm-pulled')){
            sessionStorage.setItem('cdm-pulled','1');
            location.reload();return;
          }
        }
      }
      if(opts.loud)status('ok','Al día · '+new Date().toLocaleTimeString());
    }catch(e){if(opts.loud)status('err','Error al bajar: '+e.message);}
  }

  // ---- modal wiring ----
  function openModal(){
    const c=getCfg();
    $('syncUrl').value=c.url||'';
    $('syncCode').value=c.code||'';
    if(configured()){
      const stamp=+localStorage.getItem(STAMP_KEY)||0;
      status('ok', stamp?('Última sync: '+new Date(stamp).toLocaleString()):'Configurado · aún sin sincronizar');
    }else status('','Sin configurar');
    $('syncOverlay').classList.add('show');
  }
  $('openSync').onclick=openModal;
  $('syncClose').onclick=()=>$('syncOverlay').classList.remove('show');
  $('syncOverlay').onclick=e=>{if(e.target.id==='syncOverlay')$('syncOverlay').classList.remove('show');};
  $('genCode').onclick=()=>{
    const rnd=(crypto.getRandomValues(new Uint32Array(2))).reduce((a,b)=>a+b.toString(36),'');
    $('syncCode').value='lalo-'+rnd;
  };
  $('syncNow').onclick=async()=>{
    const url=$('syncUrl').value.trim(),code=$('syncCode').value.trim();
    if(!code){status('err','Falta tu código de sync.');return;}
    setCfg({url,code});
    await push();
    await pull({loud:true});
  };

  // ---- on load: reflect status + auto pull once ----
  status(configured()?'ok':'', configured()?'Sincronización activa':'Sin configurar');
  if(configured())pull({loud:false});
})();

/* ============================================================
   PORTAFOLIO DE PROYECTOS
   ============================================================ */
(function PORT(){
  const KEY='portfolio-projects';
  let S=load();
  function load(){try{return JSON.parse(localStorage.getItem(KEY))||[];}catch(e){return [];}}
  function save(){localStorage.setItem(KEY,JSON.stringify(S));}
  const uid=()=>Date.now()+''+Math.floor(Math.random()*1000);

  function progress(p){
    let total=0,done=0;
    (p.tasks||[]).forEach(t=>{
      if(t.subtasks&&t.subtasks.length){t.subtasks.forEach(s=>{total++;if(s.done)done++;});}
      else{total++;if(t.done)done++;}
    });
    return total?Math.round(100*done/total):0;
  }

  $('port-create').onclick=()=>{
    const title=$('port-title').value.trim();if(!title){alert('Ponle un título al proyecto.');return;}
    S.unshift({id:uid(),title,desc:$('port-desc').value.trim(),open:true,tasks:[]});
    $('port-title').value='';$('port-desc').value='';save();render();
  };

  function render(){
    const wrap=$('port-list');wrap.innerHTML='';
    if(!S.length){wrap.innerHTML='<div class="empty">Aún no tienes proyectos. Crea el primero arriba.</div>';return;}
    S.forEach(p=>{
      const pct=progress(p);
      const proj=document.createElement('div');proj.className='project'+(p.open?' open':'');
      proj.innerHTML=`<div class="proj-head"><div class="proj-top"><svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6"/></svg><div class="proj-title">${esc(p.title)}</div><div class="proj-pct">${pct}%</div><button class="proj-del" title="Eliminar proyecto">✕</button></div><div class="proj-bar"><i style="width:${pct}%"></i></div>${p.desc?`<div class="proj-desc">${esc(p.desc)}</div>`:''}</div><div class="proj-body"></div>`;
      proj.querySelector('.proj-head').onclick=e=>{if(e.target.closest('.proj-del'))return;p.open=!p.open;save();render();};
      proj.querySelector('.proj-del').onclick=e=>{e.stopPropagation();if(confirm('¿Eliminar "'+p.title+'" y sus tareas?')){S=S.filter(x=>x.id!==p.id);save();render();}};
      const body=proj.querySelector('.proj-body');
      (p.tasks||[]).forEach(t=>{
        const hasSubs=t.subtasks&&t.subtasks.length;
        const doneState=hasSubs?t.subtasks.every(s=>s.done):t.done;
        const tk=document.createElement('div');tk.className='tk';
        tk.innerHTML=`<div class="tk-row ${doneState?'done':''}"><div class="ck ${doneState?'on':''}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2a0a23" stroke-width="3.5"><path d="M5 13l4 4L19 7"/></svg></div><div class="tk-text">${esc(t.text)}</div><button class="mini addsubbtn">+ subtarea</button><button class="mini delbtn">✕</button></div>`;
        tk.querySelector('.ck').onclick=()=>{if(hasSubs){const all=t.subtasks.every(s=>s.done);t.subtasks.forEach(s=>s.done=!all);}else{t.done=!t.done;}save();render();};
        tk.querySelector('.delbtn').onclick=()=>{p.tasks=p.tasks.filter(x=>x!==t);save();render();};
        tk.querySelector('.addsubbtn').onclick=()=>{const txt=prompt('Nueva subtarea:');if(txt&&txt.trim()){t.subtasks=t.subtasks||[];t.subtasks.push({id:uid(),text:txt.trim(),done:false});save();render();}};
        if(hasSubs){
          const subs=document.createElement('div');subs.className='subs';
          t.subtasks.forEach(s=>{
            const sr=document.createElement('div');sr.className='tk';
            sr.innerHTML=`<div class="tk-row ${s.done?'done':''}"><div class="ck sm ${s.done?'on':''}"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#2a0a23" stroke-width="3.5"><path d="M5 13l4 4L19 7"/></svg></div><div class="tk-text sub-text">${esc(s.text)}</div><button class="mini delbtn">✕</button></div>`;
            sr.querySelector('.ck').onclick=()=>{s.done=!s.done;save();render();};
            sr.querySelector('.delbtn').onclick=()=>{t.subtasks=t.subtasks.filter(x=>x!==s);save();render();};
            subs.appendChild(sr);
          });
          tk.appendChild(subs);
        }
        body.appendChild(tk);
      });
      const add=document.createElement('div');add.className='addrow';
      add.innerHTML=`<input placeholder="Nueva tarea…"><button>Añadir</button>`;
      const inp=add.querySelector('input');
      const doAdd=()=>{const v=inp.value.trim();if(!v)return;p.tasks=p.tasks||[];p.tasks.push({id:uid(),text:v,done:false,subtasks:[]});save();render();};
      add.querySelector('button').onclick=doAdd;
      inp.addEventListener('keydown',e=>{if(e.key==='Enter')doAdd();});
      body.appendChild(add);
      wrap.appendChild(proj);
    });
  }
  $('port-export').onclick=()=>downloadJSON(S,'portfolio-backup.json');
  $('port-import').onclick=()=>$('port-file').click();
  $('port-file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{S=JSON.parse(r.result);save();render();}catch(err){alert('Archivo inválido');}};r.readAsText(f);};
  render();
})();
}
