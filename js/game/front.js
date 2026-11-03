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
import {setMuted,sfx,soundSettings} from './sound.js';
import {cardShown,setHints,toast,transition} from './ui.js';
import {helpShown,input,setHelpExtra,showHelp} from './controls.js';
import {flags,onFlag,resetAll} from './state.js';
import {ITEMS} from './items.js';
import {logoEl} from './title.js';
import {icon,mk,setIcons,setTheme,tape} from './felt.js';
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
#wlFront .sub{position:relative;margin:.6rem 0 0;font-size:clamp(1rem,2.4vh,1.25rem);padding:.45rem 1.6rem .5rem;text-align:center;animation:wlfFade .8s ease 1.4s both}
#wlFront .btns{display:flex;flex-direction:column;align-items:center;gap:.6rem;width:min(20rem,100%);animation:wlfFade .6s ease 1.2s both}
/* 단추: 펠트 스티커(game/felt) — 주 단추 살구, 나머지 크림. 위치·크기만 여기서 */
#wlFront .go{position:relative;display:block;width:100%;box-sizing:border-box;text-align:center;font-size:1.35rem;padding:.8rem 1rem .85rem;--fr:999px}
#wlFront .go.alt{font-size:1.15rem;padding:.65rem 1rem}
#wlFront .row{display:flex;gap:.6rem;width:100%}
#wlFront .gh{position:relative;flex:1;display:flex;align-items:center;justify-content:center;gap:.35rem;min-height:46px;box-sizing:border-box;font-size:1.02rem;padding:.45rem .7rem;white-space:nowrap;--fr:999px;--fd:4px}
#wlFront .ask{position:relative;width:min(20rem,100%);box-sizing:border-box;padding:1.1rem 1.1rem 1.15rem;text-align:center}
#wlFront .ask p{margin:0 0 .85rem;line-height:1.55;font-family:"Jua","Gowun Dodum",sans-serif;font-size:1.05rem}
#wlFront .ask .row button{position:relative;flex:1;text-align:center;padding:.6rem .5rem;font-size:1.05rem;min-height:46px;box-sizing:border-box;--fr:999px;--fd:4px}
#wlFront[data-ask] .btns{display:none}#wlFront:not([data-ask]) .ask{display:none}
@keyframes wlfDrop{from{opacity:0;transform:translateY(-22%)}to{opacity:1;transform:none}}
@keyframes wlfPop{0%{opacity:0;transform:scale(.55)}50%{opacity:1;transform:scale(1.08)}75%{transform:scale(.97)}100%{opacity:1;transform:scale(1)}}
@keyframes wlfBreath{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.012) rotate(-.35deg)}}
@keyframes wlfSway{0%,100%{transform:rotate(0)}50%{transform:rotate(.5deg) translateY(.5%)}}
@keyframes wlfTw{0%,64%,100%{transform:translate(-50%,-50%) scale(0) rotate(0);opacity:0}76%{transform:translate(-50%,-50%) scale(1) rotate(25deg);opacity:1}88%{transform:translate(-50%,-50%) scale(.35) rotate(45deg);opacity:.5}}
@keyframes wlfFloat{0%{opacity:0;transform:translate(0,-12px) rotate(0)}18%{opacity:.95}82%{opacity:.85}100%{opacity:0;transform:translate(var(--dx),70px) rotate(200deg)}}
@keyframes wlfFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){#wlFront *{animation:none!important}#wlFront .tw,#wlFront .fl{display:none}#wlFront .art img,#wlFront .sub,#wlFront .btns{opacity:1}}
#wlWard{position:fixed;top:0;right:0;bottom:0;width:min(23rem,100vw);z-index:31;display:none;flex-direction:column;box-sizing:border-box;
  padding:calc(env(safe-area-inset-top,0px) + 14px) calc(env(safe-area-inset-right,0px) + 14px) calc(env(safe-area-inset-bottom,0px) + 14px) 14px}
#wlWard.on{display:flex}
/* 창 안 내용(.body)만 스크롤, '다 골랐어요'는 창 맨 아래에 따로(내용과 겹치지 않게) */
#wlWard .panel{display:flex;flex-direction:column;min-height:0;max-height:100%;box-sizing:border-box}#wlWard .body{flex:1;min-height:0;overflow-y:auto;margin:0 -.4rem;padding:0 .4rem .2rem}
@media (max-width:760px){#wlWard{top:auto;left:0;width:100%;max-height:52vh;padding-left:calc(env(safe-area-inset-left,0px) + 14px)}}
#wlWard .panel{position:relative;padding:1.1rem 1.2rem 1.1rem}
#wlWard .k{position:relative;margin:0;display:inline-flex;align-items:center;gap:.3rem;padding:.15rem .75rem;font-size:1rem;--fr:999px;--fd:2px}
#wlWard .note{margin:.55rem 0 0;font-size:.88rem;line-height:1.5;color:var(--f-soft)}
#wlWard .lab{margin:.85rem 0 .4rem;font-size:1rem;color:var(--f-soft);font-family:"Jua",sans-serif}
#wlWard .opts{display:flex;flex-wrap:wrap;gap:.45rem}
#wlWard .opts button{position:relative;font-size:.98rem;padding:.4rem .85rem;min-height:42px;box-sizing:border-box;white-space:nowrap;--fr:999px;--fd:4px;border-width:3px}
#wlWard .opts button[aria-pressed="true"]{--fbg:var(--f-apri);--fst:var(--f-stitch-apri)}
#wlWard .spin{display:flex;gap:.5rem;margin-top:.9rem}#wlWard .spin button{position:relative;flex:1;text-align:center;padding:.45rem;min-height:42px;box-sizing:border-box;font-size:1rem;--fr:999px;--fd:4px}
#wlWard .done{position:relative;flex:none;display:block;width:100%;box-sizing:border-box;margin-top:.9rem;text-align:center;font-size:1.15rem;padding:.65rem 1rem;min-height:48px;--fr:999px} /* 휴대폰 아래 시트에서도 '다 골랐어요'는 늘 보이게 */
/* 게임 중 화면 구석(개미굴 편과 같은 자리·모양 — 2026-11-03): 오른쪽 위 노란 '☰ 메뉴' 하나(누르면 소리·옷 갈아입기·조작법 칩이 아래로), 왼쪽 위 받은 물건(노란 칩 + 아이콘).
   위 할 일 안내가 휴대폰에서 화면 폭을 다 쓰면 그 높이(--qh, ui.setQuest)만큼 아래로 내려간다. 왼쪽 위 시험용 톱니(52px) 아래에서 시작 */
#wlHud:not(.on)>*{display:none!important}.wlg.prof-on #wlHud{visibility:hidden}
#wlHud .wl-chip{display:inline-flex;align-items:center;gap:.35rem;min-height:40px;box-sizing:border-box;background:rgba(46,28,44,.66);color:#fff4e4;border-radius:999px;padding:.4rem .95rem;
  font-family:"Jua","Gowun Dodum",sans-serif;font-size:.98rem;white-space:nowrap;-webkit-tap-highlight-color:transparent}
#wlHud .wl-chip.y{background:#f2b63c;color:#3e2834}#wlHud button.wl-chip{cursor:pointer}
#wlItems .wl-ic img{filter:drop-shadow(0 0 .7px #7a5236) drop-shadow(0 0 .7px #7a5236)} /* 크림색 아이콘도 노란 칩 위에서 보이게 */
#wlMenu{position:fixed;right:calc(env(safe-area-inset-right,0px) + 14px);top:calc(env(safe-area-inset-top,0px) + 14px + var(--qh,0px));z-index:41;display:flex;flex-direction:column;align-items:flex-end;gap:.45rem}
#wlMenu .ls{display:none;flex-direction:column;align-items:flex-end;gap:.45rem}#wlMenu.open .ls{display:flex}
#wlItems{position:fixed;left:calc(env(safe-area-inset-left,0px) + 14px);top:calc(env(safe-area-inset-top,0px) + 14px + max(58px,var(--qh,0px)));z-index:16;display:flex;flex-direction:column;align-items:flex-start;gap:.45rem;pointer-events:none}
#wlItems .wl-chip{min-height:36px;padding:.3rem .8rem .3rem .45rem;font-size:.9rem;color:#1e1418}#wlItems .wl-ic{width:24px;height:24px}
body.wl-front-on .bar .hint:not(#stats),body.wl-front-on #dbgBtn{display:none} /* 첫 화면: 아래 안내 글자·시험용 톱니 숨김 */`;
let ctx=null,VIEW=null,el=null,ward=null,corner=null,menu=null,items=null,zone=()=>null,restart=null,frontOn=false,wardOn=false,wardFrom=null,busy=false;
const look={outfit:null,hair:null};try{Object.assign(look,JSON.parse(store.get(LOOK_KEY)||'{}'));}catch(e){}
/* 08 zoneLook이 세계 옷을 입힌 뒤 부른다: 플레이어가 고른 옷·머리(있으면). 탈은 그대로 */
function applyLook(U){if(SHOT||!U)return;if(look.outfit&&U.setOutfit)U.setOutfit(look.outfit);if(look.hair!=null&&U.setHair)U.setHair(look.hair);}
const hasProgress=()=>Object.keys(flags).some(k=>k!=='compass'&&flags[k]);
function btn(cls,text,on,ic=null){const b=document.createElement('button');b.type='button';b.className=cls+' wl-felt wl-btn';if(ic)b.appendChild(icon(ic));b.append(mk(text));b.addEventListener('click',on);return b;}
function build(){const root=document.querySelector('.wlg');if(!root||el)return;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  el=document.createElement('div');el.id='wlFront';el.setAttribute('role','dialog');el.setAttribute('aria-label','게임 시작');root.appendChild(el);
  ward=document.createElement('div');ward.id='wlWard';ward.setAttribute('role','dialog');ward.setAttribute('aria-label','옷 갈아입기');root.appendChild(ward);
  corner=document.createElement('div');corner.id='wlHud';corner.className='wl-hint';root.appendChild(corner);
  // 오른쪽 위 메뉴(개미굴 #uiBtn): 노란 '☰ 메뉴' → 소리·옷 갈아입기·조작법 칩
  menu=document.createElement('div');menu.id='wlMenu';const mb=document.createElement('button');mb.type='button';mb.className='wl-chip y';mb.setAttribute('aria-expanded','false');
  const ls=document.createElement('div');ls.className='ls';const chip=(t,on)=>{const b=document.createElement('button');b.type='button';b.className='wl-chip';b.textContent=t;b.addEventListener('click',e=>{b.blur();on(e);});return b;};
  const snd=chip('',()=>{setMuted(!soundSettings.muted);sfx('click');sndLabel();}),sndLabel=()=>{snd.textContent=soundSettings.muted?'소리 꺼짐':'소리 켜짐';};
  ls.append(snd,chip('옷 갈아입기',()=>{setMenu(false);toggleWardrobe();}),chip('조작법 · 도움말',()=>{sfx('click');setMenu(false);showHelp(!helpShown());}));
  const setMenu=on=>{menu.classList.toggle('open',on);mb.textContent=on?'✕ 메뉴 닫기':'☰ 메뉴';mb.setAttribute('aria-expanded',on?'true':'false');if(on)sndLabel();};
  mb.addEventListener('click',()=>{sfx('click');mb.blur();setMenu(!menu.classList.contains('open'));});setMenu(false);menu.append(mb,ls);
  // 왼쪽 위 받은 물건(개미굴 #compassChip·#honeyChip): 노란 칩 + 아이콘
  items=document.createElement('div');items.id='wlItems';items.setAttribute('aria-label','받은 물건');corner.append(items,menu);renderItems();onFlag(()=>renderItems());}
/* 받은 물건 칩: 아이템 목록(game/items) 가운데 가진 것. 아이콘은 세계 설정 front.itemIcons[id](그림 주소) → 없으면 기본 SVG(felt icon) */
function renderItems(){if(!items)return;items.innerHTML='';const Z=zone(),ic=(Z&&Z.front&&Z.front.itemIcons)||{};
  for(const id of Object.keys(ITEMS)){if(!flags[id])continue;const c=document.createElement('span');c.className='wl-chip y';
    if(ic[id]){const s=document.createElement('span');s.className='wl-ic';const im=new Image();im.alt='';im.src=ic[id];s.appendChild(im);c.appendChild(s);}else c.appendChild(icon(id));
    c.append(ITEMS[id].name);items.appendChild(c);}}
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
  const top=document.createElement('div');top.className='top';top.appendChild(art(F));if(F.sub){const p=document.createElement('p');p.className='sub';p.textContent=F.sub;tape(p);top.appendChild(p);} // 부제: 분홍 마스킹테이프 띠
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
  const B=document.createElement('div');B.className='body';
  B.append(k,note,lab('옷'),opts(['평상복','탐험복'],U.outfit?1:0,i=>{look.outfit=i?'explorer':'casual';U.setOutfit(look.outfit);save();sfx('click');}),
    lab('머리'),opts(U.hairNames||[],U.getHair?U.getHair():0,i=>{look.hair=i;U.setHair(i);save();sfx('click');}));
  const faces=U.exprNames||[];
  B.append(lab('표정 미리보기'),opts(faces,faces.indexOf(U.exprName||'기본'),i=>{U.setExpr(faces[i]);sfx('blip');}));
  const spin=document.createElement('div');spin.className='spin';spin.append(btn('','↺ 돌리기',()=>{ctx.WL.rotation.y+=Math.PI/4;}),btn('','돌리기 ↻',()=>{ctx.WL.rotation.y-=Math.PI/4;}));
  B.appendChild(spin);P.append(B,btn('done apri','다 골랐어요',()=>closeWardrobe()));ward.appendChild(P);}
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
