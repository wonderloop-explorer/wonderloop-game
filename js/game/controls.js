/* 원더룹 — 조작 (개미굴 편 index.html의 keydown·pointer·wheel·joy를 엔진 공통으로 옮긴 것)
   키보드: WASD 이동(카메라가 보는 쪽이 앞) · 방향키 카메라 돌리기(←→ 초당 2.3, ↑↓ 초당 1.3) · Space 점프 · Shift 대쉬(원더룹은 달리지 않는다 — 2026-11-05) · E 말 걸기·손 상호작용(dialog) ·
     F 세계 도구(setTool) · M 소리(sound) · H 조작 도움말 · C 옷장(hooks.onWardrobe) · Esc 창 닫기 · -/+ 카메라 거리
   마우스: 화면을 끌면 카메라가 원더룹 둘레로 돈다(가로 0.006·세로 0.004 라디안/픽셀, 위아래 -0.55~1.15) · 휠로 거리(×0.01, 4~13 — 가장 가까이는 08 CAM_MIN, 세로 화면은 배율을 곱한 뒤 4m)
   휴대폰: 왼쪽 아래 조이스틱(반지름 45px, 미는 만큼 걷기 — 아래 JOY, 끝까지 밀어도 걷기) · 오른쪽 점프·대쉬 단추(말 걸기 단추는 ui #wlAct) · 화면을 끌어 카메라
     · 두 손가락으로 벌리고 오므리면 카메라 거리(휠과 같은 3~13, 손가락 사이 거리에 반비례). 사파리가 페이지 자체를 확대하지 않게 막는다(gesture·두 손가락 touchmove·두 번 누르기)
   - 입력칸(INPUT·TEXTAREA·SELECT)에 쓰는 중이면 키를 가로채지 않고, 단추에 초점이 있으면 Space·Enter는 그 단추 몫(개미굴과 같음).
   - 창이 비활성화되면(blur) 눌린 키·조이스틱을 모두 푼다.
   - 이 모듈은 입력만 모은다(input). 카메라 둘레 돌기·따라가기는 08, 원더룹 움직임은 07(U.drive·jumpReq·dashReq)이 쓴다.
   - 촬영·영상 캡처 모드(?shot)에서는 키·끌기·휠을 받지 않는다(기준 화면·대본 그대로). 조이스틱·단추는 안내 표시라 영상에서 숨는다.
   세계 도구(개미굴 랜턴 자리): setTool({label, use}) — F 또는 왼쪽 위 도구 단추로 use()(켜고 끄기·쓰기). setTool(null)로 뺀다. 구역을 떠나면 비워진다. */
import {block} from './core.js';
import {popBackdrop,popCss,popHooks,popShown} from './popup.js';
const SHOT=/[?&]shot(?=&|=|$)/.test(location.search);
const coarse=matchMedia('(pointer:coarse)').matches;
const touchDev=()=>matchMedia('(pointer:coarse)').matches||matchMedia('(any-pointer:coarse)').matches||navigator.maxTouchPoints>0; // 조작법 창 터치 표 먼저 — 열 때마다 다시 봄(아이폰에서 키보드 표가 먼저 나왔다는 보고, 2026-11-04)
const MOVE=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
const CAM={yawPx:.006,pitchPx:.004,pitchMin:-.55,pitchMax:1.15,distMin:4,distMax:13,wheel:.01,keyZoom:6};
const keys={};
const input={keys,jx:0,jy:0,jumpReq:false,dashReq:false,
  cam:{yaw:0,pitch:.34,dist:7.5,on:false}, // on: 08이 따라가기 카메라를 이 값으로 그릴 때만 끌기·휠을 받는다
  /* 앞(+)·옆(+오른쪽) 입력 — 08이 카메라 방향으로 바꾼다. 달리기는 없다(2026-11-05 — 이동은 걷기와 대쉬만) */
  /* 휴대폰 조이스틱 (2026-11-05): JOY.dead 안쪽은 무시(원더룹이 떨리지 않게), 그 밖은 미는 만큼 걷기 k = JOY.min~1(JOY.full부터 끝까지 걷기 속도 — 최고 속도).
     속도가 부드럽게 오르내리는 건 07(초당 8로 따라감) */
  axes(){const k=keys,m=Math.hypot(input.jx,input.jy),jo=m>=JOY.dead,jx=jo?input.jx:0,jy=jo?input.jy:0,kb=k.KeyW||k.KeyS||k.KeyA||k.KeyD;
    const f=(k.KeyW?1:0)-(k.KeyS?1:0)-jy,s=(k.KeyD?1:0)-(k.KeyA?1:0)+jx;
    return {f,s,k:kb||!jo?1:JOY.min+(1-JOY.min)*Math.min(1,(m-JOY.dead)/(JOY.full-JOY.dead))};}};
const JOY={dead:.15,full:.75,min:.3};
const hooks={onWardrobe:null};
let tool=null;
const typing=t=>t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable);
const css=`
#wlJoy,#wlJump,#wlDash{position:fixed;display:none;touch-action:none;z-index:16}
#wlJoy{left:calc(env(safe-area-inset-left,0px) + 22px);bottom:calc(env(safe-area-inset-bottom,0px) + 22px);width:120px;height:120px;border-radius:50%;background:rgba(46,28,44,.66)} /* 개미굴 조작 단추 그대로 */
#wlKnob{position:absolute;left:50%;top:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:#fff4e4;opacity:.85}
#wlJump,#wlDash{border-radius:50%;background:rgba(46,28,44,.66);color:#fff4e4;place-items:center;font-family:"Jua","Gowun Dodum",sans-serif}
#wlJump{right:calc(env(safe-area-inset-right,0px) + 24px);bottom:calc(env(safe-area-inset-bottom,0px) + 34px);width:76px;height:76px;font-size:1.05rem}
#wlDash{right:calc(env(safe-area-inset-right,0px) + 112px);bottom:calc(env(safe-area-inset-bottom,0px) + 26px);width:64px;height:64px;font-size:.9rem;transition:opacity .2s}
#wlDash.cool{opacity:.45}
@media (pointer:coarse){#wlJoy{display:block}#wlJump,#wlDash{display:grid}}
#wlTool{position:fixed;left:calc(env(safe-area-inset-left,0px) + 14px);top:calc(env(safe-area-inset-top,0px) + 56px);display:none;z-index:16;
  background:var(--chip);color:var(--chip-ink);border-radius:999px;padding:.45rem .9rem;font-size:.9rem;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
/* 조작법 창: 개미굴 게임 #how 그대로(2026-11-04 시리즈 공통 틀) — 늘 밝은 크림색 카드(기기 어두운 화면 설정과 상관없이) */
#wlHelp{position:fixed;inset:0;display:grid;place-items:center;padding:1rem;box-sizing:border-box;background:rgba(30,14,36,.5);z-index:40;font-family:"Gowun Dodum","Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif;color-scheme:light}
#wlHelp[hidden]{display:none}
#wlHelp .hcard{width:min(36rem,100%);background:rgba(255,246,234,.95);color:#3e2834;border-radius:22px;padding:1.4rem;box-sizing:border-box;text-align:left} /* 높이·스크롤은 팝업 공통(game/popup) — 내용(.hsc)만 스크롤, '알겠어요'는 늘 아래 */
#wlHelp .hsc{margin:0 -.4rem;padding:0 .4rem}
#wlHelp h2{margin:0 0 .6rem;font-weight:400;font-size:1.5rem}
#wlHelp h3{margin:.9rem 0 .45rem;font-weight:400;font-size:1rem;color:#75565e}
#wlHelp .cols{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
@media (max-width:560px){#wlHelp .cols{grid-template-columns:1fr}}
#wlHelp dl{display:grid;grid-template-columns:auto 1fr;gap:.35rem .7rem;margin:0}
#wlHelp dt{background:rgba(127,90,96,.14);border-radius:8px;padding:.1rem .5rem;font-size:.85rem;text-align:center;white-space:nowrap}
#wlHelp dd{margin:0;font-size:.92rem;align-self:center}
#wlHelp p{line-height:1.65;color:#75565e;margin:0}
#wlHelp .sndtips{margin:.3rem 0 0;padding-left:1.15rem;line-height:1.6}
#wlHelp .sndtips li{margin:.2rem 0}
#wlHelp .close{display:block;flex:none;text-align:center;border:0;border-radius:14px;background:#3f9fa0;color:#fffaf2;font:inherit;font-size:1.05rem;padding:.8rem 1.6rem;cursor:pointer;margin-top:1.1rem;width:100%}
#wlHelp button:focus-visible{outline:3px solid #3f9fa0;outline-offset:3px}
/* 게임 중 휴대폰 세로: 창을 위쪽에 — 아래쪽 원더룹을 덜 가리게(2026-11-03). 높이는 화면 안(공통 규칙), 조이스틱·단추는 창이 열린 동안 숨김(game/popup) */
@media (pointer:coarse) and (orientation:portrait){body:not(.wl-front-on) #wlHelp{place-items:start center;padding-top:calc(env(safe-area-inset-top,0px) + 14px + var(--qh,0px) + 52px)}
  body:not(.wl-front-on) #wlHelp .hcard{max-height:calc(100dvh - env(safe-area-inset-top,0px) - var(--qh,0px) - 66px - env(safe-area-inset-bottom,0px) - 12px)}}`;
/* 조작법 창(2026-11-04, 개미굴 게임 #how의 디자인·구성·키 설명 표 그대로 — 시리즈 공통 틀): 키보드·터치 두 칸 → 이렇게 놀아요 → 소리가 안 들릴 때 → 휴대폰이 따뜻해질 때 → 알겠어요.
   세계에만 해당하는 글(개미굴의 도감·랜턴·읽어주기·냄새 길 등)은 세계 설정 controlsNote로 — setHelpNote(note): keys(키보드 표 E 다음), talk(터치 '말 걸기' 설명),
   touch(터치 표 끝), play(이렇게 놀아요), heatBefore·heatAfter(따뜻해질 때 목록 앞·뒤). 없는 칸은 빠진다. 예전 세계(요정의 숲)는 setHelpExtra(list, play) — play와 '이 세계에서' 표 */
const KEYS_A=[['W A S D','걷기'],['Shift','순간 대쉬'],['스페이스','점프'],['방향키','시점 돌리기'],['+ −','카메라 거리'],['E','말 걸기, 살펴보기, 대화 넘기기']];
const KEYS_B=[['M','소리 켜고 끄기'],['H','조작법 열고 닫기'],['C','옷 갈아입기']];
const TOUCH_A=[['왼쪽 원','미는 만큼 걷기'],['드래그','시점 돌리기'],['점프','뛰어오르기'],['대쉬','순간 대쉬']];
const SND_TIPS=['오른쪽 위 <b>메뉴</b>에서 <b>소리 켜짐</b>인지 확인해 주세요. 키보드는 M 키로 켜고 꺼요.','다른 앱이나 메시지에 다녀온 뒤 소리가 멈췄다면 <b>게임 화면을 한 번 눌러</b> 주세요. 소리가 다시 켜져요.',
  '아이폰은 옆면 <b>무음 모드</b>를 켜 두면 소리가 안 날 수 있어요. 무음 모드를 끄고 볼륨을 올려 주세요.','그래도 안 들리면 메뉴에서 소리를 껐다가 다시 켜거나, 페이지를 새로 고쳐 주세요.'];
const HEAT_TIPS=['<b>충전하면서</b> 하면 더 뜨거워져요. 가능하면 충전기를 빼고 해 주세요.','화면 <b>밝기를 조금 낮추면</b> 발열이 줄어요.'];
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dl=rows=>`<dl>${rows.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
const ul=items=>`<ul class="sndtips">${items.map(t=>`<li>${t}</li>`).join('')}</ul>`;
let note=null;
function helpHTML(){const N=note||{};
  const keysRows=[...KEYS_A,...(N.keys||[]),...KEYS_B],touchRows=[...TOUCH_A,['말 걸기',N.talk||'말 걸 상대 가까이에서 나타나요'],...(N.touch||[])];
  const kb=`<div><h3>키보드</h3>${dl(keysRows)}</div>`,tc=`<div><h3>터치</h3>${dl(touchRows)}</div>`; // 터치 기기는 터치 표 먼저
  return `<div class="hcard wl-pop-card"><div class="hsc wl-pop-body"><h2>조작법</h2><div class="cols">${touchDev()?tc+kb:kb+tc}</div>`+
    (N.play?`<h3>이렇게 놀아요</h3><p>${esc(N.play)}</p>`:'')+(N.extra&&N.extra.length?`<h3>이 세계에서</h3>${dl(N.extra)}`:'')+
    `<h3>소리가 안 들릴 때</h3>${ul(SND_TIPS)}<h3>휴대폰이 따뜻해질 때</h3>${ul([...(N.heatBefore||[]),...HEAT_TIPS,...(N.heatAfter||[])])}`+
    `</div><button class="close wl-pop-foot" type="button">알겠어요</button></div>`;}
let help=null,toolBtn=null,dashBtn=null;
function build(){const root=document.querySelector('.wlg');if(!root)return;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  const box=document.createElement('div');
  box.innerHTML=`<div id="wlJoy" class="wl-hint" aria-hidden="true"><div id="wlKnob"></div></div><button id="wlJump" class="wl-hint" type="button">점프</button><button id="wlDash" class="wl-hint" type="button">대쉬</button>
<button id="wlTool" class="wl-hint" type="button"></button>
<div id="wlHelp" class="wl-pop" role="dialog" aria-modal="true" aria-label="조작법" hidden></div>`;
  while(box.firstChild)root.appendChild(box.firstChild);
  help=root.querySelector('#wlHelp');renderHelp();
  popCss();popBackdrop(help,()=>showHelp(false));popHooks.release=releaseAll; // 창 바깥 어두운 곳을 누르면 닫힘, 창이 열리면 조이스틱·키를 푼다
  toolBtn=root.querySelector('#wlTool');toolBtn.addEventListener('click',()=>useTool());
  dashBtn=root.querySelector('#wlDash');
  const joy=root.querySelector('#wlJoy'),knob=root.querySelector('#wlKnob');let joyId=null;
  const joyMove=e=>{const r=joy.getBoundingClientRect();let dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);const d=Math.hypot(dx,dy),m=45;if(d>m){dx*=m/d;dy*=m/d;}
    input.jx=dx/m;input.jy=dy/m;knob.style.transform=`translate(${dx}px,${dy}px)`;};
  joy.addEventListener('pointerdown',e=>{e.preventDefault();joyId=e.pointerId;joy.setPointerCapture(e.pointerId);joyMove(e);});
  joy.addEventListener('pointermove',e=>{if(e.pointerId===joyId)joyMove(e);});
  const joyEnd=e=>{if(e.pointerId!==joyId)return;joyId=null;input.jx=input.jy=0;knob.style.transform='';};
  joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);
  input.releaseJoy=()=>{joyId=null;input.jx=input.jy=0;knob.style.transform='';};
  root.querySelector('#wlJump').addEventListener('pointerdown',e=>{e.preventDefault();input.jumpReq=true;});
  dashBtn.addEventListener('pointerdown',e=>{e.preventDefault();input.dashReq=true;});}
function showHelp(on){if(!help)return;if(on&&help.hidden)renderHelp(); // 열 때마다 다시 그림(터치 기기 판단을 그때 다시)
  help.hidden=!on;block('help',!!on);popShown('help',!!on);if(on){const c=help.querySelector('.hsc');if(c)c.scrollTop=0;help.querySelector('.close').focus({preventScroll:true});}} // 열려 있는 동안 막힘 — 처음 시작할 때 조작법을 닫아야 나침반 연출이 이어진다
function renderHelp(){if(!help)return;help.innerHTML=helpHTML();help.querySelector('.close').addEventListener('click',()=>showHelp(false));}
/* 세계 설정 controlsNote(js/worlds — 형식은 antvillage.js 맨 위) */
function setHelpNote(n){note=n||null;renderHelp();}
/* 예전 세계 front(요정의 숲): help [[이름, 설명]…] → '이 세계에서' 표, play → '이렇게 놀아요' */
function setHelpExtra(list,play=null){note={play,extra:list||null};renderHelp();}
const helpShown=()=>!!help&&!help.hidden;
function setTool(t){tool=t||null;if(!toolBtn)return;toolBtn.style.display=tool?'block':'none';if(tool){toolBtn.textContent=tool.label||'도구';toolBtn.classList.toggle('on',tool.on!==false);toolBtn.setAttribute('aria-pressed',tool.on===false?'false':'true');}} // on: 켜짐(노란 칩 — 개미굴 #lamp.on), false면 어두운 칩
function useTool(){if(!tool||!tool.use)return false;try{tool.use();}catch(e){console.error(e);}if(toolBtn&&tool)toolBtn.textContent=tool.label||'도구';return true;}
function releaseAll(){for(const k in keys)keys[k]=false;if(input.releaseJoy)input.releaseJoy();}
function initControls(ctx){build();if(SHOT)return;
  window.addEventListener('keydown',e=>{if(typing(e.target)||e.metaKey||e.ctrlKey)return;
    if(e.target&&e.target.tagName==='BUTTON'&&(e.code==='Space'||e.code==='Enter'))return; // 단추에 초점: 그 단추를 누르는 키
    if(helpShown()){if(e.code==='Escape'||e.code==='KeyH'){e.preventDefault();showHelp(false);}return;}
    if(MOVE.includes(e.code)||e.code==='Space')e.preventDefault();keys[e.code]=true;
    if(e.repeat)return;
    if(e.code==='Space')input.jumpReq=true;
    else if(e.code==='ShiftLeft'||e.code==='ShiftRight')input.dashReq=true;
    else if(e.code==='KeyF')useTool();
    else if(e.code==='KeyH')showHelp(true);
    else if(e.code==='KeyC'&&hooks.onWardrobe)hooks.onWardrobe();
    else if(e.code==='KeyB'&&hooks.onBag)hooks.onBag();});
  window.addEventListener('keyup',e=>{keys[e.code]=false;});
  window.addEventListener('blur',releaseAll);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll();});
  // 화면 끌기 → 카메라 둘레 돌기 (끌지 않고 누르기만 하면 08이 '눌러서 걷기'·말 걸기로 쓴다)
  const cv=ctx.renderer.domElement;let drag=null,pinch=null;const pts=new Map();
  const span=()=>{const [a,b]=[...pts.values()];return Math.hypot(a.x-b.x,a.y-b.y);};
  cv.addEventListener('pointerdown',e=>{pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===2){drag=null;pinch={d:span(),dist:input.cam.dist};input.pinching=true;}else if(pts.size===1)drag={id:e.pointerId,x:e.clientX,y:e.clientY};});
  cv.addEventListener('pointermove',e=>{const p=pts.get(e.pointerId);if(p){p.x=e.clientX;p.y=e.clientY;}
    if(pinch&&pts.size>=2){if(input.cam.on){const d=span();if(d>10)input.cam.dist=Math.min(CAM.distMax,Math.max(input.cam.minD||CAM.distMin,pinch.dist*pinch.d/d));input.cam.user=(input.cam.user||0)+1;}return;} // 벌리면 가까이, 오므리면 멀리
    if(drag&&drag.id===e.pointerId&&input.dragHook){const dx=e.clientX-drag.x;drag.x=e.clientX;drag.y=e.clientY;input.dragHook(dx);return;} // 옷 갈아입기: 끌면 원더룹이 돈다(카메라는 그대로)
    if(!drag||drag.id!==e.pointerId||!input.cam.on)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
    if(dx||dy)input.cam.user=(input.cam.user||0)+1;input.cam.yaw-=dx*CAM.yawPx;input.cam.pitch=Math.min(CAM.pitchMax,Math.max(CAM.pitchMin,input.cam.pitch+dy*CAM.pitchPx));});
  const endDrag=e=>{pts.delete(e.pointerId);if(drag&&drag.id===e.pointerId)drag=null;if(pts.size<2&&pinch){pinch=null;drag=null;} // 두 손가락을 떼는 동안 남은 손가락으로 카메라가 튀지 않게
    if(!pts.size&&input.pinching)setTimeout(()=>{input.pinching=false;},0);}; // 다 뗄 때까지는 '눌러서 걷기'로 보지 않는다(08)
  cv.addEventListener('pointerup',endDrag);cv.addEventListener('pointercancel',endDrag);
  // 사파리 페이지 확대 막기: 핀치(gesture*)·두 손가락 끌기 (두 번 누르기 확대는 index.html touch-action:manipulation)
  ['gesturestart','gesturechange','gestureend'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault(),{passive:false}));
  document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault();},{passive:false});
  document.addEventListener('touchstart',e=>{if(e.touches.length>1){input.multiT=performance.now();e.preventDefault();}},{passive:false}); // 조이스틱·단추·카드 위에서 시작한 두 손가락도
  document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
  // 그래도 페이지가 확대돼 버리면(사파리가 막기를 무시한 경우) 배율 1로 되돌린다
  {const vv=window.visualViewport,meta=document.querySelector('meta[name=viewport]');if(vv&&meta){const base=meta.content;let t=0;
    vv.addEventListener('resize',()=>{if(vv.scale>1.01){clearTimeout(t);meta.content=base+', minimum-scale=1';t=setTimeout(()=>{meta.content=base;},300);}});}}
  cv.addEventListener('wheel',e=>{if(!input.cam.on||input.dragHook)return;e.preventDefault();input.cam.user=(input.cam.user||0)+1;input.cam.dist=Math.min(CAM.distMax,Math.max(input.cam.minD||CAM.distMin,input.cam.dist+e.deltaY*CAM.wheel));},{passive:false});}
/* 08이 매 프레임: 키로 하는 카메라 거리(-/+), 대쉬 단추 식힘 표시 */
function tickControls(dt,dashCool){if(SHOT)return;const c=input.cam;
  if(c.on){if(keys.ArrowLeft||keys.ArrowRight||keys.ArrowUp||keys.ArrowDown||keys.Minus||keys.NumpadSubtract||keys.Equal||keys.NumpadAdd)c.user=(c.user||0)+1; // 플레이어가 카메라를 만진 횟수 — 08이 보고 짧은 카메라 연출을 끝낸다
    if(keys.ArrowLeft)c.yaw+=dt*2.3;if(keys.ArrowRight)c.yaw-=dt*2.3; // 개미굴: 방향키는 카메라
    if(keys.ArrowUp)c.pitch=Math.max(CAM.pitchMin,c.pitch-dt*1.3);if(keys.ArrowDown)c.pitch=Math.min(CAM.pitchMax,c.pitch+dt*1.3);
    if(keys.Minus||keys.NumpadSubtract)c.dist=Math.min(CAM.distMax,c.dist+dt*CAM.keyZoom);if(keys.Equal||keys.NumpadAdd)c.dist=Math.max(c.minD||CAM.distMin,c.dist-dt*CAM.keyZoom);}
  if(dashBtn)dashBtn.classList.toggle('cool',!!dashCool);}
function clearControls(){setTool(null);}
export {CAM,clearControls,hooks as controlHooks,helpShown,initControls,input,setHelpExtra,setHelpNote,setTool,showHelp,tickControls,useTool};
