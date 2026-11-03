/* 원더룹 — 조작 (개미굴 편 index.html의 keydown·pointer·wheel·joy를 엔진 공통으로 옮긴 것)
   키보드: WASD 이동(카메라가 보는 쪽이 앞) · 방향키 카메라 돌리기(←→ 초당 2.3, ↑↓ 초당 1.3) · Space 점프 · Shift 대쉬(누른 채면 달리기) · E 말 걸기·손 상호작용(dialog) ·
     F 세계 도구(setTool) · M 소리(sound) · H 조작 도움말 · C 옷장(hooks.onWardrobe) · Esc 창 닫기 · -/+ 카메라 거리
   마우스: 화면을 끌면 카메라가 원더룹 둘레로 돈다(가로 0.006·세로 0.004 라디안/픽셀, 위아래 -0.55~1.15) · 휠로 거리(×0.01, 4~13 — 가장 가까이는 08 CAM_MIN, 세로 화면은 배율을 곱한 뒤 4m)
   휴대폰: 왼쪽 아래 조이스틱(반지름 45px, 끝까지 밀면 달리기) · 오른쪽 점프·대쉬 단추(말 걸기 단추는 ui #wlAct) · 화면을 끌어 카메라
     · 두 손가락으로 벌리고 오므리면 카메라 거리(휠과 같은 3~13, 손가락 사이 거리에 반비례). 사파리가 페이지 자체를 확대하지 않게 막는다(gesture·두 손가락 touchmove·두 번 누르기)
   - 입력칸(INPUT·TEXTAREA·SELECT)에 쓰는 중이면 키를 가로채지 않고, 단추에 초점이 있으면 Space·Enter는 그 단추 몫(개미굴과 같음).
   - 창이 비활성화되면(blur) 눌린 키·조이스틱을 모두 푼다.
   - 이 모듈은 입력만 모은다(input). 카메라 둘레 돌기·따라가기는 08, 원더룹 움직임은 07(U.drive·jumpReq·dashReq)이 쓴다.
   - 촬영·영상 캡처 모드(?shot)에서는 키·끌기·휠을 받지 않는다(기준 화면·대본 그대로). 조이스틱·단추는 안내 표시라 영상에서 숨는다.
   세계 도구(개미굴 랜턴 자리): setTool({label, use}) — F 또는 왼쪽 위 도구 단추로 use()(켜고 끄기·쓰기). setTool(null)로 뺀다. 구역을 떠나면 비워진다. */
import {block} from './core.js';
const SHOT=/[?&]shot(?=&|=|$)/.test(location.search);
const coarse=matchMedia('(pointer:coarse)').matches;
const MOVE=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
const CAM={yawPx:.006,pitchPx:.004,pitchMin:-.55,pitchMax:1.15,distMin:4,distMax:13,wheel:.01,keyZoom:6};
const keys={};
const input={keys,jx:0,jy:0,jumpReq:false,dashReq:false,
  cam:{yaw:0,pitch:.34,dist:7.5,on:false}, // on: 08이 따라가기 카메라를 이 값으로 그릴 때만 끌기·휠을 받는다
  /* 앞(+)·옆(+오른쪽) 입력과 달리기 — 08이 카메라 방향으로 바꾼다 */
  axes(){const k=keys;const f=(k.KeyW?1:0)-(k.KeyS?1:0)-input.jy,s=(k.KeyD?1:0)-(k.KeyA?1:0)+input.jx;
    return {f,s,run:!!(k.ShiftLeft||k.ShiftRight)||Math.hypot(input.jx,input.jy)>.95};}};
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
#wlHelp{position:fixed;inset:0;display:grid;place-items:center;padding:1.2rem;box-sizing:border-box;background:rgba(30,14,36,.45);z-index:40}
@media (pointer:coarse) and (orientation:portrait){#wlHelp{place-items:start center;padding:calc(env(safe-area-inset-top,0px) + 14px + var(--qh,0px) + 52px) 12px 0;background:rgba(30,14,36,.16)}#wlHelp .hcard{max-height:52vh}} /* 휴대폰 세로: 위쪽에 — 아래쪽 원더룹을 가리지 않게 */
#wlHelp[hidden]{display:none}
#wlHelp .snd{margin:0;padding-left:1.1rem;line-height:1.6;color:var(--f-soft);word-break:keep-all}#wlHelp .snd li{margin:.2rem 0}#wlHelp .snd b{color:var(--f-ink);font-weight:700}#wlHelp .play{margin:0;line-height:1.65;color:var(--f-soft);word-break:keep-all}
#wlHelp .hcard{position:relative;width:min(26rem,100%);max-height:calc(100dvh - 2.4rem);overflow-y:auto;background:var(--panel);color:var(--ink);border-radius:22px;padding:1.4rem 1.4rem 1.2rem;box-sizing:border-box;box-shadow:0 18px 50px rgba(30,14,36,.5)}
#wlHelp h2{margin:0 0 .7rem;font-size:1.4rem;font-weight:400;font-family:"Jua",sans-serif}
#wlHelp h3{margin:1rem 0 .45rem;font-size:1rem;font-weight:400;color:var(--f-soft);font-family:"Jua",sans-serif}
#wlHelp dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:.45rem .9rem;line-height:1.5}
#wlHelp dt{white-space:nowrap;font-family:"Jua",sans-serif;color:var(--f-ink)}#wlHelp dd{margin:0;color:var(--f-soft)}
#wlHelp kbd{font:inherit;font-size:.85rem;background:var(--f-cream);color:var(--f-ink);border:1.5px solid var(--f-edge);box-shadow:0 2px 0 var(--f-edge);border-radius:7px;padding:0 .4rem;margin-right:.2rem}
#wlHelp button{position:sticky;bottom:0;z-index:2;display:block;width:100%;box-sizing:border-box;margin-top:1.1rem;text-align:center;border-radius:14px;background:var(--accent);color:var(--accent-ink);font-size:1.15rem;padding:.65rem 1.2rem;--fr:999px}`;
/* 조작법 창(2026-11-03 개미굴 조작법과 같게): 컴퓨터는 키보드, 휴대폰은 터치 — 오른쪽 위 '조작법' 단추(game/front)·H 키로 열고 닫는다.
   세계마다 새로 생긴 것(탈것·우산 활공 등)은 세계 front.help로 '이 세계에서' 칸에(setHelpExtra). 늘 크림색 바탕·진갈색 글자, 휴대폰 세로는 화면 위쪽에 */
const KEYS_HELP=[['<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>','걷기 (카메라가 보는 쪽이 앞)'],['방향키 · 마우스 끌기','카메라 돌리기'],['휠 · <kbd>-</kbd><kbd>+</kbd>','카메라 확대·축소'],['<kbd>Space</kbd>','점프'],['<kbd>Shift</kbd>','대쉬 · 누른 채면 달리기'],
  ['<kbd>E</kbd>','말 걸기 · 손으로 하기 · 대화 넘기기'],['<kbd>F</kbd>','세계 도구 쓰기'],['<kbd>B</kbd>','탐험 가방 열기 (받은 물건·만난 친구·숨겨진 비밀)'],['<kbd>C</kbd>','탐험가 소개 · 옷 갈아입기'],['<kbd>M</kbd>','소리 끄고 켜기'],['<kbd>H</kbd>','조작법 열고 닫기'],['<kbd>Esc</kbd>','창 닫기']];
const TOUCH_HELP=[['왼쪽 아래 동그라미','끌어서 걷기 (끝까지 밀면 달리기)'],['한 손가락 끌기','카메라 돌리기'],['두 손가락','벌리면 가까이 · 오므리면 멀리'],['점프 · 대쉬','오른쪽 아래 단추'],['말 걸기','가까이 가면 생기는 노란 단추 (손으로 하기·타기도)'],['가방','왼쪽 위 노란 단추 — 받은 물건·만난 친구·숨겨진 비밀'],['메뉴','오른쪽 위 노란 단추 — 소리·옷 갈아입기·조작법'],['땅 누르기','그 자리로 걸어가기']];
let extra=null;
let help=null,toolBtn=null,dashBtn=null;
function build(){const root=document.querySelector('.wlg');if(!root)return;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  const box=document.createElement('div');
  box.innerHTML=`<div id="wlJoy" class="wl-hint" aria-hidden="true"><div id="wlKnob"></div></div><button id="wlJump" class="wl-hint" type="button">점프</button><button id="wlDash" class="wl-hint" type="button">대쉬</button>
<button id="wlTool" class="wl-hint" type="button"></button>
<div id="wlHelp" role="dialog" aria-label="조작법" hidden><div class="hcard wl-felt"><h2>조작법</h2><dl class="base">${(coarse?TOUCH_HELP:KEYS_HELP).map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl><div class="extra"></div><h3>소리가 안 들릴 때</h3><ul class="snd"><li>오른쪽 위 <b>메뉴</b>에서 <b>소리 켜짐</b>인지 확인해 주세요. 키보드는 M 키로 켜고 꺼요.</li><li>다른 앱에 다녀온 뒤 소리가 멈췄다면 <b>게임 화면을 한 번 눌러</b> 주세요. 소리가 다시 켜져요.</li><li>아이폰은 옆면 <b>무음 모드</b>를 켜 두면 소리가 안 날 수 있어요. 무음 모드를 끄고 볼륨을 올려 주세요.</li><li>그래도 안 들리면 메뉴에서 소리를 껐다가 다시 켜거나, 페이지를 새로 고쳐 주세요.</li></ul><button type="button" class="wl-felt apri wl-btn"><span class="wl-mk">알겠어요</span></button></div></div>`;
  while(box.firstChild)root.appendChild(box.firstChild);
  help=root.querySelector('#wlHelp');help.querySelector('button').addEventListener('click',()=>showHelp(false));
  help.addEventListener('pointerdown',e=>{if(e.target===help)showHelp(false);});
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
function showHelp(on){if(!help)return;help.hidden=!on;block('help',!!on);if(on)help.querySelector('button').focus({preventScroll:true});} // 열려 있는 동안 막힘 — 처음 시작할 때 조작법을 닫아야 나침반 연출이 이어진다
/* 세계마다 새로 생긴 조작(front.help: [[이름, 설명]…]) — '이 세계에서' 칸 */
/* setHelpExtra(list, play): 세계마다 '이렇게 놀아요'(play — 한 단락, 개미굴 조작법과 같게)와 '이 세계에서'(list) */
function setHelpExtra(list,play=null){extra=list||null;if(!help)return;const box=help.querySelector('.extra');box.innerHTML='';
  if(play){const h=document.createElement('h3');h.textContent='이렇게 놀아요';const p=document.createElement('p');p.className='play';p.textContent=play;box.append(h,p);}
  if(!extra||!extra.length)return;
  const h=document.createElement('h3');h.textContent='이 세계에서';const dl=document.createElement('dl');extra.forEach(([k,v])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;dl.append(dt,dd);});box.append(h,dl);}
const helpShown=()=>!!help&&!help.hidden;
function setTool(t){tool=t||null;if(!toolBtn)return;toolBtn.style.display=tool?'block':'none';if(tool)toolBtn.textContent=tool.label||'도구';}
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
export {CAM,clearControls,hooks as controlHooks,helpShown,initControls,input,setHelpExtra,setTool,showHelp,tickControls,useTool};
