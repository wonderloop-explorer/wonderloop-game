/* 원더룹 — 탐험 지도(장소 고르기) (시리즈 공통, 2026-11-26 — 구조 변경 v2 ④)
   시작 화면 '장소 고르기' · 옷 고르기(탐험 준비)의 '모험 지도' · 게임 중 메뉴 '탐험 지도'가 모두 이 화면 하나를 쓴다(game/front가 연다).
   세계 설정 map[{name, zone, planet, rest, last}] + travel.map.bodies(행성 색·고리)로 장소 카드를 그린다 — HTML만(3D 그리기 0).
   잠금(placeState): 첫 장소(map[0])는 늘 열림 · 가운데 장소들은 첫 장소를 끝낸 뒤(flags 'clear:<첫 구역>') 모두 열림 ·
     마지막 장소(map[].last — 목성)는 다른 장소를 모두 다녀와야 열림(다녀옴 = 'visit:<구역>' 또는 'clear:<구역>') — 그 전에는 구름에 가려진 모습 + "다른 행성을 모두 다녀오면 열려요".
   장소마다 발견 카드 수(세계 finds 가운데 where가 그 장소 이름인 것 — n/m).
   열린 장소를 누르면 o.onGo(구역 id) — 지금 있는 장소면 그냥 닫힘. 맨 아래 '처음부터'는 한 번 더 묻고 o.onReset().
   팝업 공통 틀(game/popup): .wl-pop > .wl-pop-card > .wl-pop-body + .wl-pop-foot, 바깥을 누르거나 Esc로 닫힘. */
import {popBackdrop,popShown} from './popup.js';
const css=`
#wlPlaces{z-index:46;background:rgba(30,14,36,.55);font-family:"Gowun Dodum","Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif}
#wlPlaces .wl-pop-card{width:min(44rem,100%);background:rgba(44,30,42,.97);color:#fbe9d8;border-radius:22px;box-shadow:0 18px 50px rgba(20,8,26,.55);padding:1.1rem 1.1rem .9rem}
#wlPlaces h2{margin:0 0 .15rem;font-family:"Jua","Gowun Dodum",sans-serif;font-weight:400;font-size:1.45rem;text-align:center;color:#ffe9a8}
#wlPlaces .lead{margin:0 0 .8rem;text-align:center;font-size:.92rem;opacity:.85;word-break:keep-all}
#wlPlaces ul{list-style:none;margin:0;padding:0 .1rem .2rem;display:grid;gap:.6rem;grid-template-columns:repeat(auto-fill,minmax(12.5rem,1fr))}
#wlPlaces .pl{display:grid;grid-template-columns:64px 1fr;gap:.75rem;align-items:center;width:100%;box-sizing:border-box;text-align:left;font:inherit;color:inherit;cursor:pointer;
  background:rgba(255,246,230,.08);border:2px solid rgba(255,246,230,.16);border-radius:16px;padding:.65rem .75rem;min-height:86px;transition:transform .12s,background .12s,border-color .12s}
#wlPlaces .pl:not([disabled]):hover{background:rgba(255,246,230,.14);border-color:#5cc4b9;transform:translateY(-2px)}
#wlPlaces .pl:focus-visible{outline:3px solid #5cc4b9;outline-offset:2px}
#wlPlaces .pl.cur{border-color:#ffd46a;background:rgba(255,212,106,.12)}
#wlPlaces .pl[disabled]{cursor:default;opacity:.78}
#wlPlaces .orb{position:relative;width:56px;height:56px;margin:0 auto;border-radius:50%;background:radial-gradient(circle at 34% 30%,color-mix(in srgb,var(--c) 55%,#fff),var(--c) 55%,color-mix(in srgb,var(--c) 62%,#2a1830));box-shadow:0 0 0 3px rgba(255,246,230,.1)}
#wlPlaces .orb.ring::after{content:"";position:absolute;left:-13px;right:-13px;top:21px;height:13px;border:3px solid color-mix(in srgb,var(--c) 70%,#fff);border-radius:50%;transform:rotate(-16deg);box-sizing:border-box;opacity:.9}
#wlPlaces .orb.band{background:repeating-linear-gradient(8deg,color-mix(in srgb,var(--c) 70%,#fff) 0 7px,var(--c) 7px 13px,color-mix(in srgb,var(--c) 78%,#b0553c) 13px 19px)}
#wlPlaces .orb .cl{position:absolute;border-radius:50%;background:#efe6f6;box-shadow:0 2px 0 rgba(30,14,36,.18)}
#wlPlaces .orb .stamp{position:absolute;right:-6px;bottom:-4px;width:24px;height:24px;border-radius:50%;background:#5cc4b9;color:#23303a;font-size:15px;line-height:24px;text-align:center;font-weight:700}
#wlPlaces .nm{display:block;font-family:"Jua","Gowun Dodum",sans-serif;font-size:1.12rem;line-height:1.25;word-break:keep-all}
#wlPlaces .sm{display:block;font-size:.84rem;opacity:.82;margin-top:.1rem;line-height:1.4;word-break:keep-all}
#wlPlaces .tag{display:inline-block;margin-top:.3rem;font-size:.78rem;border-radius:999px;padding:.12rem .6rem;background:rgba(255,246,230,.14)}
#wlPlaces .pl.cur .tag.here{background:#ffd46a;color:#3e2834}
#wlPlaces .tag.fd{background:rgba(92,196,185,.22);color:#c9f3ee;margin-left:.3rem}
#wlPlaces .foot{display:flex;gap:.6rem;align-items:center;justify-content:space-between;margin-top:.8rem}
#wlPlaces .close{border:0;border-radius:14px;background:#5cc4b9;color:#23303a;font:inherit;font-size:1.05rem;padding:.7rem 1.8rem;min-height:46px;cursor:pointer}
#wlPlaces .reset{border:1.5px solid rgba(255,246,230,.5);background:transparent;color:#fbe9d8;border-radius:12px;font:inherit;font-size:.86rem;padding:.45rem .8rem;min-height:40px;cursor:pointer;opacity:.85}
#wlPlaces .ask{display:none;margin-top:.8rem;background:#fff6ea;color:#3e2834;border-radius:16px;padding:.9rem 1rem}
#wlPlaces .ask p{margin:0 0 .7rem;line-height:1.55;word-break:keep-all}
#wlPlaces .ask .row{display:flex;gap:.5rem}#wlPlaces .ask button{flex:1;border:0;border-radius:12px;font:inherit;font-size:1rem;min-height:46px;cursor:pointer;background:rgba(127,90,96,.14);color:#3e2834}
#wlPlaces .ask .yes{background:#3f9fa0;color:#fffaf2}
#wlPlaces[data-ask] .ask{display:block}#wlPlaces[data-ask] .foot{display:none}
#wlPlaces button:focus-visible{outline:3px solid #5cc4b9;outline-offset:2px}
@media (max-width:520px){#wlPlaces .wl-pop-card{padding:.9rem .8rem .8rem}#wlPlaces ul{grid-template-columns:1fr}#wlPlaces .pl{min-height:76px}}
@media (prefers-reduced-motion: reduce){#wlPlaces .pl{transition:none}}`;
let cssDone=false,cur=null;
const visited=(F,z)=>!!z&&!!(F['visit:'+z]||F['clear:'+z]);
/* 장소 목록과 상태: [{name, zone(갈 구역), planet 이름, color, ring, open, here, been, why(잠긴 까닭), finds:[n,m]}] */
export function placeState(W,F,curZone){const M=(W&&W.map)||[],B=(W&&W.travel&&W.travel.map&&W.travel.map.bodies)||[],first=M[0]&&M[0].zone,FD=(W&&W.finds)||[];
  const mids=M.filter(m=>!m.last);
  return M.map((m,i)=>{const b=B.find(x=>x.id===m.planet)||{},zone=m.zone||b.zone||null,here=zone===curZone,been=here||visited(F,zone);let open=true,why='';
    if(m.last){open=mids.every(q=>q.zone===curZone||visited(F,q.zone));if(!open)why='다른 행성을 모두 다녀오면 열려요';}
    else if(i>0){open=!!F['clear:'+first]||been;if(!open)why=M[0].name+'을 먼저 둘러보면 열려요';}
    if(!zone){open=false;why=why||'준비 중이에요';}
    const fs=FD.filter(f=>f.where===m.name);
    return {name:m.name,zone,planet:b.name||'',color:b.color||'#cfc3e6',ring:!!b.ring,band:m.planet==='jupiter',last:!!m.last,open,here,been,why,finds:[fs.filter(f=>F[f.flag]).length,fs.length]};});}
export const placesOpen=()=>!!cur;
export function closePlaces(){if(cur)cur.close();}
/* o: {world, flags, zone(지금 구역 id), title?, lead?, pick(false면 보기만 — 누를 수 없음), onGo(zone), onReset(), sfx(name)} */
export function openPlaces(o){if(cur)return cur;if(!cssDone){cssDone=true;const s=document.createElement('style');s.dataset.wl='places';s.textContent=css;document.head.appendChild(s);}
  const L=placeState(o.world,o.flags||{},o.zone),el=document.createElement('div');el.className='wl-pop';el.id='wlPlaces';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','탐험 지도');
  const card=document.createElement('div');card.className='wl-pop-card';const body=document.createElement('div');body.className='wl-pop-body';
  const h=document.createElement('h2');h.textContent=o.title||'탐험 지도';const lead=document.createElement('p');lead.className='lead';lead.textContent=o.lead||(o.pick===false?'다녀온 곳과 앞으로 갈 곳이에요':'가고 싶은 곳을 골라요');
  const ul=document.createElement('ul');const snd=n=>{try{o.sfx&&o.sfx(n);}catch(e){}};
  L.forEach(p=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.className='pl'+(p.here?' cur':'');
    const orb=document.createElement('span');orb.className='orb'+(p.ring?' ring':'')+(p.band?' band':'');orb.style.setProperty('--c',p.color);orb.setAttribute('aria-hidden','true');
    if(!p.open&&p.last)[[-8,6,34],[18,-4,30],[30,16,32],[2,26,36],[24,32,28]].forEach(([x,y,r])=>{const c=document.createElement('i');c.className='cl';c.style.cssText=`left:${x}px;top:${y}px;width:${r}px;height:${r*.72}px`;orb.appendChild(c);}); /* 구름에 가려진 모습 */
    else if(p.been&&!p.here){const s=document.createElement('i');s.className='stamp';s.textContent='✓';orb.appendChild(s);}
    const tx=document.createElement('span'),nm=document.createElement('span');nm.className='nm';nm.textContent=p.name;tx.appendChild(nm);
    const sm=document.createElement('span');sm.className='sm';sm.textContent=p.open?(p.planet||''):p.why;tx.appendChild(sm);
    if(p.here){const t=document.createElement('span');t.className='tag here';t.textContent='지금 여기';tx.appendChild(t);}
    else if(p.open&&p.been){const t=document.createElement('span');t.className='tag';t.textContent='다녀온 곳';tx.appendChild(t);}
    else if(!p.open){const t=document.createElement('span');t.className='tag';t.textContent='잠김';tx.appendChild(t);}
    if(p.finds[1]){const t=document.createElement('span');t.className='tag fd';t.textContent='발견 '+p.finds[0]+'/'+p.finds[1];tx.appendChild(t);}
    b.append(orb,tx);const can=p.open&&o.pick!==false;if(!can)b.disabled=true;
    b.setAttribute('aria-label',p.name+(p.planet?' · '+p.planet:'')+(p.here?' · 지금 여기':p.open?'':' · 잠김 — '+p.why)+(p.finds[1]?' · 발견 '+p.finds[0]+'/'+p.finds[1]:''));
    b.addEventListener('click',()=>{if(!can)return;snd('ui-click');const z=p.zone,here=p.here;close(true);if(o.onGo)o.onGo(z,here);});li.appendChild(b);ul.appendChild(li);});
  body.append(h,lead,ul);
  const foot=document.createElement('div');foot.className='foot wl-pop-foot';const rs=document.createElement('button');rs.type='button';rs.className='reset';rs.textContent='처음부터';
  const cl=document.createElement('button');cl.type='button';cl.className='close';cl.textContent='닫기';foot.append(o.onReset?rs:document.createElement('span'),cl);
  const ask=document.createElement('div');ask.className='ask wl-pop-foot';ask.innerHTML='<p>처음부터 다시 할까요?<br>지금까지 모은 기록이 모두 지워져요.</p><div class="row"><button type="button" class="yes">처음부터 하기</button><button type="button" class="no">아니요</button></div>';
  card.append(body,foot,ask);el.appendChild(card);document.body.appendChild(el);popShown('places',true);snd('ui-open');
  function close(quiet){if(!cur)return;cur=null;window.removeEventListener('keydown',kd,true);el.remove();popShown('places',false);if(!quiet)snd('ui-click');if(o.onClose)o.onClose();}
  const kd=e=>{if(e.code==='Escape'){e.preventDefault();e.stopPropagation();if(el.dataset.ask)delete el.dataset.ask;else close();}};window.addEventListener('keydown',kd,true);
  cl.addEventListener('click',()=>close());popBackdrop(el,()=>close());
  rs.addEventListener('click',()=>{snd('ui-click');el.dataset.ask='1';ask.querySelector('.no').focus({preventScroll:true});});
  ask.querySelector('.no').addEventListener('click',()=>{snd('ui-click');delete el.dataset.ask;});
  ask.querySelector('.yes').addEventListener('click',()=>{snd('ui-click');close(true);if(o.onReset)o.onReset();});
  cur={el,close,list:L};return cur;}
