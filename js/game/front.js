/* 원더룹 — 게임 첫 화면(타이틀)·옷 갈아입기·오른쪽 위 구석 단추 (엔진 공통, 2026-11-03 — 개미굴 게임 #intro·#show·#wardBtn·#howMenu를 옮김)
   세계마다 세계 기본값(world.js)에 front:{ribbon, logo, sub, img:{ribbon, logo, w, h, twinkle:[[x,y,지연]…]} | null, deco, help:[[이름,설명]…], ending:{img:null}} 를 둔다.
   - 타이틀: 게임을 열면(촬영 모드·?notitle 빼고) 첫 구역을 만든 채로 그 위에 덮는다. img가 있으면 그림 두 장(리본이 먼저 내려오고 → 큰 제목이 통통),
     없으면 title.js 코드 로고(logoEl). 그 뒤로 아주 느리게 숨쉬듯 살랑. 그림 둘레에 반짝이·꽃잎이 천천히, 그림 속 별·이슬 자리(twinkle)가 가끔 반짝(모두 HTML — 3D 그리기 0회).
     뒤 배경은 그 구역을 천천히 돌아보는 카메라(구역 정보 titleView:{at,r,h,speed} — view.hold, 낮). 열려 있는 동안 core.block('front') → 나침반 연출·이벤트·말 걸기는 기다린다.
     진행 기록(state.flags)이 있으면 '이어서 하기'·'처음부터'(한 번 더 확인 → 진행을 지우고 첫 구역을 다시 만든다), 없으면 '시작하기'. 누르면 화면 전환(ui.transition)으로 원더룹 뒤 카메라로.
     처음 시작할 때 한 번은 조작법(controls.showHelp)을 보여 준다(localStorage 'wl-help-seen'). 소리는 첫 누르기 때 깨어난다(sound 소리 깨우기 그대로).
   - 옷 갈아입기(개미굴 옷장과 같은 방식·같은 모양): 오른쪽 패널(휴대폰은 아래 시트) — 옷(평상복·탐험복)·머리(세 가지)·표정 미리보기.
     카메라가 원더룹 앞으로 오고, 화면을 끌면 원더룹이 돈다. 고른 옷·머리는 localStorage 'wl-look'(새로고침 뒤에도) — 08 zoneLook이 세계 옷 다음에 입힌다(applyLook).
     세계 탈(화관 등)은 건드리지 않는다. 첫 화면 단추·게임 중 오른쪽 위 단추·C 키로 연다. 대화·카드·탈것·공중에서는 열지 않는다.
   - 오른쪽 위 구석 단추: '옷 갈아입기'·'조작법'(controls 도움말 열고 닫기). 안내 표시(wl-hint)라 영상 캡처에는 안 나온다.
   톱니 메뉴의 옷·머리·표정 단추는 시험용으로 그대로 둔다(촬영 도구가 누른다) — 플레이어용은 이것 하나. */
import {block,blocking} from './core.js';
import {sfx} from './sound.js';
import {cardShown,setHints,toast,transition} from './ui.js';
import {helpShown,input,setHelpExtra,showHelp} from './controls.js';
import {flags,resetAll} from './state.js';
import {logoEl} from './title.js';
import {icon,ribbonize,setIcons,setTheme} from './felt.js';
const Q=new URLSearchParams(location.search),SHOT=Q.has('shot'),NO=SHOT||Q.has('notitle');
const coarse=matchMedia('(pointer:coarse)').matches;
const LOOK_KEY='wl-look',HELP_KEY='wl-help-seen';
const store={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}}};
const css=`
#wlFront{position:fixed;inset:0;z-index:30;display:none;flex-direction:column;align-items:center;justify-content:space-between;box-sizing:border-box;
  padding:calc(env(safe-area-inset-top,0px) + 4vh) calc(env(safe-area-inset-right,0px) + 16px) calc(env(safe-area-inset-bottom,0px) + 5vh) calc(env(safe-area-inset-left,0px) + 16px);
  background:radial-gradient(ellipse 85% 50% at 50% 26%,rgba(255,248,236,.32),rgba(255,248,236,0) 72%),linear-gradient(180deg,rgba(30,14,36,0) 58%,rgba(30,14,36,.32))}
#wlFront.on{display:flex}
#wlFront .top{display:flex;flex-direction:column;align-items:center;width:100%}
#wlFront .art{position:relative;width:min(100%,69vh,640px)}
@media (orientation:landscape){#wlFront .art{width:min(64vw,92vh,860px)}#wlFront{padding-top:calc(env(safe-area-inset-top,0px) + 6vh)}}
/* 큰 제목 그림이 자리(높이)를 잡고 리본 그림은 그 위에 겹친다 — 높이를 aspect-ratio에만 맡기면 일부 사파리에서 0이 되어 로고가 안 보일 수 있다 */
#wlFront .art img{display:block;width:100%;height:auto;pointer-events:none;user-select:none;-webkit-user-select:none}#wlFront .art img.rib{position:absolute;left:0;top:0}
#wlFront .rib{transform-origin:50% 70%;animation:wlfDrop .8s cubic-bezier(.2,1.25,.4,1) both,wlfSway 7s ease-in-out 1.4s infinite}
#wlFront .logo{transform-origin:50% 72%;animation:wlfPop .95s ease-out .4s both,wlfBreath 5.5s ease-in-out 1.6s infinite}
#wlFront .tw{position:absolute;left:calc(var(--x) * 100%);top:calc(var(--y) * 100%);width:9%;aspect-ratio:1;transform:translate(-50%,-50%) scale(0);opacity:0;pointer-events:none;
  background:radial-gradient(circle,rgba(255,252,228,.95) 0 14%,rgba(255,226,140,.5) 32%,rgba(255,226,140,0) 66%);animation:wlfTw 4.2s ease-in-out var(--d) infinite}
#wlFront .tw::after{content:"";position:absolute;inset:22%;background:#fffbe6;clip-path:polygon(50% 0,58% 42%,100% 50%,58% 58%,50% 100%,42% 58%,0 50%,42% 42%)}
#wlFront .fl{position:absolute;left:var(--x);top:var(--y);pointer-events:none;opacity:0;animation:wlfFloat var(--t) ease-in-out var(--d) infinite}
#wlFront .fl.p{width:1.7%;aspect-ratio:1/1.45;background:#f7b6c6;border-radius:50% 50% 50% 50%/62% 62% 38% 38%;box-shadow:inset -1px -2px 0 rgba(200,110,130,.35)}
#wlFront .fl.s{width:2.6%;aspect-ratio:1;background:#ffe9a6;clip-path:polygon(50% 0,58% 42%,100% 50%,58% 58%,50% 100%,42% 58%,0 50%,42% 42%);filter:drop-shadow(0 0 3px rgba(255,230,150,.9))}
#wlFront .sub{position:relative;margin:.5rem 0 0;font-size:clamp(.95rem,2.3vh,1.2rem);padding:.3rem 1.1rem;text-align:center;--fd:3px;animation:wlfFade .8s ease 1.4s both}
#wlFront .btns{display:flex;flex-direction:column;align-items:center;gap:.6rem;width:min(20rem,100%);animation:wlfFade .6s ease 1.2s both}
/* 단추: 펠트 스티커(game/felt) — 주 단추 살구, 나머지 크림. 위치·크기만 여기서 */
#wlFront .go{position:relative;display:block;width:100%;box-sizing:border-box;text-align:center;font-size:1.3rem;padding:.8rem 1rem .85rem;--fr:20px;--fd:5px}
#wlFront .go.alt{font-size:1.1rem;padding:.65rem 1rem;--fd:4px}
#wlFront .row{display:flex;gap:.6rem;width:100%}
#wlFront .gh{position:relative;flex:1;display:flex;align-items:center;justify-content:center;gap:.35rem;min-height:46px;box-sizing:border-box;font-size:1rem;padding:.45rem .7rem;white-space:nowrap;--fr:999px;--fd:3px}
#wlFront .ask{position:relative;width:min(20rem,100%);box-sizing:border-box;padding:1.1rem 1.1rem 1.15rem;text-align:center}
#wlFront .ask p{margin:0 0 .85rem;line-height:1.55;font-family:"Jua","Gowun Dodum",sans-serif;font-size:1.05rem}
#wlFront .ask .row button{position:relative;flex:1;text-align:center;padding:.6rem .5rem;font-size:1.05rem;min-height:46px;box-sizing:border-box;--fr:16px;--fd:3px}
#wlFront[data-ask] .btns{display:none}#wlFront:not([data-ask]) .ask{display:none}
@keyframes wlfDrop{from{opacity:0;transform:translateY(-22%)}to{opacity:1;transform:none}}
@keyframes wlfPop{0%{opacity:0;transform:scale(.55)}50%{opacity:1;transform:scale(1.08)}75%{transform:scale(.97)}100%{opacity:1;transform:scale(1)}}
@keyframes wlfBreath{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.012) rotate(-.35deg)}}
@keyframes wlfSway{0%,100%{transform:rotate(0)}50%{transform:rotate(.5deg) translateY(.5%)}}
@keyframes wlfTw{0%,64%,100%{transform:translate(-50%,-50%) scale(0) rotate(0);opacity:0}76%{transform:translate(-50%,-50%) scale(1) rotate(25deg);opacity:1}88%{transform:translate(-50%,-50%) scale(.35) rotate(45deg);opacity:.5}}
@keyframes wlfFloat{0%{opacity:0;transform:translate(0,-12px) rotate(0)}18%{opacity:.95}82%{opacity:.85}100%{opacity:0;transform:translate(var(--dx),70px) rotate(200deg)}}
@keyframes wlfFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){#wlFront *{animation:none!important}#wlFront .tw,#wlFront .fl{display:none}#wlFront .art img,#wlFront .sub,#wlFront .btns{opacity:1}}
#wlWard{position:fixed;top:0;right:0;bottom:0;width:min(23rem,100vw);z-index:31;display:none;box-sizing:border-box;overflow-y:auto;
  padding:calc(env(safe-area-inset-top,0px) + 14px) calc(env(safe-area-inset-right,0px) + 14px) calc(env(safe-area-inset-bottom,0px) + 14px) 14px}
#wlWard.on{display:block}
@media (max-width:760px){#wlWard{top:auto;left:0;width:100%;max-height:52vh;padding-left:calc(env(safe-area-inset-left,0px) + 14px)}}
#wlWard .panel{position:relative;padding:1.1rem 1.2rem 1.1rem}
#wlWard .k{position:relative;margin:0;display:inline-flex;align-items:center;gap:.3rem;padding:.15rem .75rem;font-size:1rem;--fr:999px;--fd:2px}
#wlWard .note{margin:.55rem 0 0;font-size:.88rem;line-height:1.5;color:var(--f-soft)}
#wlWard .lab{margin:.85rem 0 .4rem;font-size:1rem;color:var(--f-soft);font-family:"Jua",sans-serif}
#wlWard .opts{display:flex;flex-wrap:wrap;gap:.45rem}
#wlWard .opts button{position:relative;font-size:.98rem;padding:.4rem .8rem;min-height:40px;box-sizing:border-box;white-space:nowrap;--fr:999px;--fd:3px;border-width:2px}
#wlWard .opts button[aria-pressed="true"]{--fbg:var(--f-apri);--fst:var(--f-stitch-apri)}
#wlWard .spin{display:flex;gap:.5rem;margin-top:.9rem}#wlWard .spin button{position:relative;flex:1;text-align:center;padding:.45rem;min-height:42px;box-sizing:border-box;font-size:1rem;--fr:14px;--fd:3px}
#wlWard .done{position:sticky;bottom:2px;z-index:2;display:block;width:100%;box-sizing:border-box;margin-top:1rem;text-align:center;font-size:1.15rem;padding:.65rem 1rem;min-height:48px;--fr:16px} /* 휴대폰 아래 시트에서도 '다 골랐어요'는 늘 보이게 */
/* 오른쪽 위 동그란 펠트 아이콘 단추(48px — 손가락 닿는 넓이 그대로). 이름은 마우스를 올리거나 길게 누르면 왼쪽에 작은 펠트 꼬리표로 */
#wlCorner{position:fixed;right:calc(env(safe-area-inset-right,0px) + 12px);top:calc(env(safe-area-inset-top,0px) + 12px);z-index:41;display:none;flex-direction:column;align-items:flex-end;gap:.55rem}
#wlCorner.on{display:flex}
#wlCorner button{position:relative;width:48px;height:48px;box-sizing:border-box;display:grid;place-items:center;font-size:1.55rem;--fr:999px;--fd:3px}
#wlCorner button[aria-expanded="true"]{--fbg:var(--f-apri);--fst:var(--f-stitch-apri)}
#wlCorner .lb{position:absolute;right:calc(100% + 8px);top:50%;transform:translateY(-50%);white-space:nowrap;font-size:.92rem;padding:.2rem .65rem;--fr:999px;--fd:2px;opacity:0;pointer-events:none;transition:opacity .15s}
@media (hover:hover){#wlCorner button:hover .lb{opacity:1}}#wlCorner button:focus-visible .lb,#wlCorner button.lbl .lb{opacity:1} /* 손가락 화면은 길게 누를 때만(누른 뒤 남는 hover 없이) */
.wlg.prof-on #wlCorner{visibility:hidden} /* 소개 카드가 위에 떠 있는 동안 */
body.wl-front-on .bar .hint:not(#stats){display:none}`;
let ctx=null,VIEW=null,el=null,ward=null,corner=null,zone=()=>null,restart=null,frontOn=false,wardOn=false,wardFrom=null,busy=false;
const look={outfit:null,hair:null};try{Object.assign(look,JSON.parse(store.get(LOOK_KEY)||'{}'));}catch(e){}
/* 08 zoneLook이 세계 옷을 입힌 뒤 부른다: 플레이어가 고른 옷·머리(있으면). 탈은 그대로 */
function applyLook(U){if(SHOT||!U)return;if(look.outfit&&U.setOutfit)U.setOutfit(look.outfit);if(look.hair!=null&&U.setHair)U.setHair(look.hair);}
const hasProgress=()=>Object.keys(flags).some(k=>k!=='compass'&&flags[k]);
function btn(cls,text,on,ic=null){const b=document.createElement('button');b.type='button';b.className=cls+' wl-felt wl-btn';if(ic)b.appendChild(icon(ic));b.append(text);b.addEventListener('click',on);return b;}
/* 동그란 아이콘 단추: 이름은 꼬리표(마우스 올림·길게 누름) — 길게 눌러 이름을 본 뒤 떼면 누른 것으로 치지 않는다 */
function iconBtn(ic,name,on){const b=document.createElement('button');b.type='button';b.className='wl-felt wl-btn';b.setAttribute('aria-label',name);b.appendChild(icon(ic));
  const lb=document.createElement('span');lb.className='lb wl-felt';lb.textContent=name;b.appendChild(lb);let t=0,long=false;
  b.addEventListener('pointerdown',()=>{long=false;clearTimeout(t);t=setTimeout(()=>{long=true;b.classList.add('lbl');},450);});
  const up=()=>{clearTimeout(t);setTimeout(()=>b.classList.remove('lbl'),900);};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);
  b.addEventListener('click',e=>{if(long){long=false;e.preventDefault();return;}on();});b.addEventListener('contextmenu',e=>e.preventDefault());return b;}
function build(){const root=document.querySelector('.wlg');if(!root||el)return;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  el=document.createElement('div');el.id='wlFront';el.setAttribute('role','dialog');el.setAttribute('aria-label','게임 시작');root.appendChild(el);
  ward=document.createElement('div');ward.id='wlWard';ward.setAttribute('role','dialog');ward.setAttribute('aria-label','옷 갈아입기');root.appendChild(ward);
  corner=document.createElement('div');corner.id='wlCorner';corner.className='wl-hint';root.appendChild(corner);
  corner.append(iconBtn('wardrobe','옷 갈아입기',()=>toggleWardrobe()),iconBtn('help','조작법',()=>{sfx('click');showHelp(!helpShown());}));
  const how=corner.lastChild;how.setAttribute('aria-expanded','false');setInterval(()=>how.setAttribute('aria-expanded',helpShown()?'true':'false'),250);}
/* ---------- 첫 화면 ---------- */
function art(F){const box=document.createElement('div');box.className='art';
  if(F.img){const r=new Image(),l=new Image();r.className='rib';l.className='logo';r.alt='';l.alt=[F.ribbon,F.logo].filter(Boolean).join(' ');r.src=F.img.ribbon;l.src=F.img.logo;box.append(l,r);
    (F.img.twinkle||[]).forEach(([x,y,d=0])=>{const s=document.createElement('i');s.className='tw';s.style.cssText=`--x:${x};--y:${y};--d:${d}s`;box.appendChild(s);});
    // 그림 둘레에 천천히 흩날리는 꽃잎·반짝이(자리·빠르기는 정해 둔 값 — 매번 같은 화면)
    [[-4,8,11,0,30,'p'],[8,-6,13,2.5,-20,'s'],[30,-10,12,5,24,'p'],[62,-8,14,1.2,-30,'s'],[90,-4,12,3.8,26,'p'],[103,24,15,6.5,-18,'s'],[-6,52,13,4.6,22,'s'],[104,70,12,8,-24,'p'],[46,96,14,7,30,'s'],[16,92,13,9.5,-26,'p']]
      .forEach(([x,y,t,d,dx,k])=>{const f=document.createElement('i');f.className='fl '+k;f.style.cssText=`--x:${x}%;--y:${y}%;--t:${t}s;--d:${d}s;--dx:${dx}px`;box.appendChild(f);});}
  else box.appendChild(logoEl({ribbon:F.ribbon,logo:F.logo}));
  return box;}
function renderFront(){const F=zone().front;el.innerHTML='';delete el.dataset.ask;
  const top=document.createElement('div');top.className='top';top.appendChild(art(F));if(F.sub){const p=document.createElement('p');p.className='sub';p.textContent=F.sub;ribbonize(p);top.appendChild(p);} // 부제: 크림 펠트 작은 리본
  const B=document.createElement('div');B.className='btns';
  if(hasProgress()){B.append(btn('go apri','이어서 하기',()=>begin(false)),btn('go alt','처음부터',()=>{sfx('click');el.dataset.ask='1';el.querySelector('.ask .no').focus({preventScroll:true});}));}
  else B.appendChild(btn('go apri','시작하기',()=>begin(false)));
  const row=document.createElement('div');row.className='row';row.append(btn('gh','옷 갈아입기',()=>openWardrobe(true),'wardrobe'),btn('gh','조작법',()=>{sfx('click');showHelp(true);},'help'));B.appendChild(row);
  const ask=document.createElement('div');ask.className='ask wl-felt';ask.innerHTML='<p>처음부터 다시 할까요?<br>받은 물건과 만난 친구 기록이 지워져요.</p>';
  const ar=document.createElement('div');ar.className='row';ar.append(btn('yes apri','처음부터 하기',()=>begin(true)),btn('no','아니요',()=>{sfx('click');delete el.dataset.ask;}));ask.appendChild(ar);
  el.append(top,B,ask);}
/* 첫 화면 뒤 카메라: 구역 정보 titleView — {from:[x,y,z], r, y, speed, a0}면 카메라는 그 자리(트인 곳 — 물 위 등)에 두고 보는 쪽만 천천히 돌아본다(가까운 큰 잎이 화면을 덮지 않게),
   {at, r, h}면 at 둘레를 돈다. 없으면 들어오는 자리 둘레 */
function orbit(){const Z=zone(),T=Z.titleView||{};const sp=Z.spawn||{x:0,z:0},sp2=T.speed||.045;let a=T.a0||0,last=performance.now();
  VIEW.hold(()=>{const now=performance.now();a+=Math.min(.1,(now-last)/1000)*sp2;last=now;
    if(T.from)return {from:T.from,at:[T.from[0]+Math.cos(a)*(T.r||9),T.y??.6,T.from[2]+Math.sin(a)*(T.r||9)]};
    const at=T.at||[sp.x,.6,sp.z],r=T.r||13;return {at,from:[at[0]+Math.cos(a)*r,T.h||7,at[2]+Math.sin(a)*r]};});}
function openFront(){if(!zone()||!zone().front)return false;build();frontOn=true;document.body.classList.add('wl-front-on');block('front',true);setHints(false);corner.classList.remove('on');
  if(zone().sky)zone().sky.set(0);renderFront();el.classList.add('on');orbit();setTimeout(()=>{const b=el.querySelector('.go');if(b&&!coarse)b.focus({preventScroll:true});},50);return true;}
function closeFront(){frontOn=false;document.body.classList.remove('wl-front-on');el.classList.remove('on');block('front',false);setHints(true);corner.classList.add('on');VIEW.hold(null);}
async function begin(fresh){if(busy)return;busy=true;sfx('click');
  await transition(async()=>{if(fresh){resetAll();if(restart)await restart();}closeFront();},{out:.45,hold:.25,in:.75});busy=false;
  if(!store.get(HELP_KEY)){store.set(HELP_KEY,'1');showHelp(true);}} // 처음 시작할 때 한 번 조작법(닫으면 나침반 연출·버섯 요정 순서로 이어진다)
/* ---------- 옷 갈아입기 ---------- */
function opts(list,cur,pick){const box=document.createElement('div');box.className='opts';
  list.forEach((name,i)=>{const b=btn('',name,()=>{box.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');pick(i);});b.setAttribute('aria-pressed',i===cur?'true':'false');box.appendChild(b);});
  return box;}
function lab(t){const p=document.createElement('p');p.className='lab';p.textContent=t;return p;}
function renderWard(){const U=ctx.WL.userData;ward.innerHTML='';const P=document.createElement('div');P.className='panel wl-felt';
  const k=document.createElement('p');k.className='k wl-felt apri';k.append(icon('wardrobe'),'옷 갈아입기');const note=document.createElement('p');note.className='note';
  note.textContent=(coarse?'화면을 끌면':'화면을 끌거나 아래 단추로')+' 원더룹을 돌려 볼 수 있어요. 고른 옷과 머리는 다음에 열어도 그대로예요.';
  P.append(k,note,lab('옷'),opts(['평상복','탐험복'],U.outfit?1:0,i=>{look.outfit=i?'explorer':'casual';U.setOutfit(look.outfit);save();sfx('click');}),
    lab('머리'),opts(U.hairNames||[],U.getHair?U.getHair():0,i=>{look.hair=i;U.setHair(i);save();sfx('click');}));
  const faces=U.exprNames||[];
  P.append(lab('표정 미리보기'),opts(faces,faces.indexOf(U.exprName||'기본'),i=>{U.setExpr(faces[i]);sfx('blip');}));
  const spin=document.createElement('div');spin.className='spin';spin.append(btn('','↺ 돌리기',()=>{ctx.WL.rotation.y+=Math.PI/4;}),btn('','돌리기 ↻',()=>{ctx.WL.rotation.y-=Math.PI/4;}));
  P.append(spin,btn('done apri','다 골랐어요',()=>closeWardrobe()));ward.appendChild(P);}
function save(){store.set(LOOK_KEY,JSON.stringify(look));}
function showcase(){const W=ctx.WL,cam=ctx.camera;const dx=cam.position.x-W.position.x,dz=cam.position.z-W.position.z,L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L;
  W.rotation.y=Math.atan2(ux,uz)+.35; // 원더룹이 카메라 쪽을 살짝 비스듬히(3/4) 본다
  const narrow=innerWidth<=760,p=W.position,d=narrow?7:5,rx=uz,rz=-ux; // 카메라 오른쪽 — 전신이 다 보이게
  const at=narrow?[p.x,p.y-.2,p.z]:[p.x+rx*1.1,p.y+.55,p.z+rz*1.1]; // 패널을 피해: 컴퓨터는 원더룹을 왼쪽에, 휴대폰은 아래 시트 위쪽 칸에
  const from=[p.x+ux*d,p.y+(narrow?1.3:1.0),p.z+uz*d];VIEW.hold(()=>({at,from}));}
function canWear(){const U=ctx.WL.userData;return !(blocking('talk')||blocking('fade')||cardShown()==='result'||cardShown()==='cut'||U.riding||(U.vert&&U.vert.air));}
function openWardrobe(fromFront=false){build();if(wardOn)return;if(!fromFront&&(frontOn||!canWear())){if(!frontOn)toast('지금은 옷을 갈아입을 수 없어요');return;}
  wardOn=true;wardFrom=fromFront?'front':'game';sfx('pickup');if(fromFront){el.classList.remove('on');}else{block('ward',true);setHints(false);}
  corner.classList.remove('on');if(ctx.WL.userData.stopWalk)ctx.WL.userData.stopWalk();renderWard();ward.classList.add('on');showcase();
  input.dragHook=dx=>{ctx.WL.rotation.y+=dx*.012;};}
function closeWardrobe(){if(!wardOn)return;wardOn=false;ward.classList.remove('on');input.dragHook=null;const U=ctx.WL.userData;if(U.setExpr)U.setExpr('기본');sfx('click');
  if(wardFrom==='front'){el.classList.add('on');orbit();}else{block('ward',false);setHints(true);corner.classList.add('on');VIEW.hold(null);}}
function toggleWardrobe(){if(wardOn)closeWardrobe();else openWardrobe(false);}
/* ---------- 시작 ---------- */
/* 08이 게임을 준비한 뒤: initFront({ctx, view, zone:()=>지금 구역, restart:()=>첫 구역 다시 만들기}) → 첫 화면을 열거나(세계 front가 있을 때) 구석 단추만 */
function initFront(o){ctx=o.ctx;VIEW=o.view;zone=o.zone;restart=o.restart;if(SHOT)return;{const F0=zone()&&zone().front;if(F0&&F0.icons)setIcons(F0.icons);}build(); // 아이콘은 단추를 만들기 전에
  window.addEventListener('keydown',e=>{if(!wardOn)return;if(e.code==='Escape'||e.code==='KeyC'){e.preventDefault();e.stopImmediatePropagation();closeWardrobe();}},true);
  const Z=zone(),F=Z&&Z.front;setHelpExtra(F&&F.help);if(F&&F.theme)setTheme(F.theme); // 세계 색(펠트 한 벌은 game/felt)
  if(NO||!openFront())corner.classList.add('on');}
const frontShown=()=>frontOn,wardrobeShown=()=>wardOn;
export {applyLook,closeFront,closeWardrobe,frontShown,initFront,openFront,openWardrobe,toggleWardrobe,wardrobeShown};
