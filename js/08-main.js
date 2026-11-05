/* 원더룹 — 입력·조명 단계·카메라 따라가기·구역 오가기·애니메이션 루프 */
import * as THREE from 'three';
import {PI,QUALITY,rawLin,rngLoaded,scene} from './01-textures.js';
import {ZONES,areaAt,blocked,doorAt,floorAt,groundY,loadZone,overlap,unloadZone,zone} from './02-zone.js';
import {ROOM_T,camera,controls,fill,follow,followDist,hemi,optimized,renderer,setAreaCamera,setPixelCap,setupView,statsEl,sun,ui} from './03-scene.js';
import {WL} from './04-character.js';
import './05-hair-headwear.js';
import './06-outfits.js';
import {DRV,GAIT,SPEED,hopWL,setWalkTarget,stopWalk,updateWL,walking,wlHit} from './07-actions.js';
import * as GAME from './game/index.js';
import {CURRENT as WORLD} from './worlds/index.js'; // 지금 세계 설정(시리즈 공통 틀 — 타이틀 화면)
import {bendInfo,setBend,setLevel,setZoneBend} from './game/bend.js';
import {clearDevcheck,initDevcheck,toggleBounds,toggleMeasure,toggleSize} from './game/devcheck.js'; // 톱니 메뉴: 경계 보기·걷는 시간 재기·크기 확인
/* ---------- 상호작용 ---------- */
let cave=0,caveTarget=0,lightState=0,emph='auto',night=0,nightTarget=0,spin=false,spinDir=1;
const dayBtn=document.getElementById('dayBtn'),spinBtn=document.getElementById('spinBtn');
/* 하늘이 있는 구역(요정의 숲 등 game/sky)에서는 이 단추가 "시간: 낮 / 해 질 녘 / 밤" — 엔진 시간 흐름(SK.to)과 같은 조명 값을 쓴다. 굴 조명은 하늘 없는 구역(베이스캠프·개미굴)에서만 */
const TIME_NAMES=['낮','해 질 녘','밤'];let dayLbl='';
function dayLabel(){const SK=zone.cur&&zone.cur.sky;const s=SK?'시간: '+TIME_NAMES[Math.round(SK.goal??SK.t)]:['저녁으로 바꾸기','어두운 굴로 바꾸기','낮으로 바꾸기'][lightState];if(s!==dayLbl)dayBtn.textContent=dayLbl=s;}
dayBtn.addEventListener('click',()=>{const SK=zone.cur&&zone.cur.sky;if(SK){SK.to((Math.round(SK.goal??SK.t)+1)%3,2.5);dayLabel();return;}
  lightState=(lightState+1)%3;nightTarget=lightState>=1?1:0;caveTarget=lightState===2?1:0;dayBtn.textContent=['저녁으로 바꾸기','어두운 굴로 바꾸기','낮으로 바꾸기'][lightState];});
/* 캐릭터 강조(림 라이트): 기본은 '자동' — 굴·저녁처럼 어두울 때만 켜지고 낮·밝은 곳에서는 꺼진다. 단추로 자동 → 켜짐(늘) → 꺼짐 */
{const eb=document.getElementById('emphBtn'),L={auto:'캐릭터 강조: 자동',on:'캐릭터 강조: 켜짐',off:'캐릭터 강조: 꺼짐'},N={auto:'on',on:'off',off:'auto'};
 eb.textContent=L[emph];eb.addEventListener('click',()=>{emph=N[emph];eb.textContent=L[emph];});}
spinBtn.addEventListener('click',()=>{spin=!spin;spinBtn.textContent=spin?'멈추기':'천천히 둘러보기';});
const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();let downAt=null;ray.layers.enable(1); // 레이어 1: 원더룹 원래 부품(클릭 판정용, 화면엔 SkinnedMesh가 그려짐)
renderer.domElement.addEventListener('pointerdown',e=>{downAt=[e.clientX,e.clientY];});
renderer.domElement.addEventListener('pointerup',e=>{
  if(!downAt)return;const moved=Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1]);downAt=null;if(moved>6||GAME.controls.input.pinching)return; // 두 손가락 확대·축소는 누르기가 아니다
  const r=renderer.domElement.getBoundingClientRect();ptr.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(ptr,camera);
  if(GAME.clickNPC(ray))return; // 대화 중이면 다음 대사, NPC를 누르면 말 걸기
  if(GAME.interact.click(ray))return; // 손으로 할 물건을 누르면 걸어가서 손 동작(game/interact)
  if(zone.cur.click&&zone.cur.click(ray))return; // 구역의 클릭할 것 (베이스캠프: 버섯 램프)
  if(ray.intersectObjects(wlHit,false).length){hopWL();return;}
  if(zone.cur.ground){const h=ray.intersectObjects(zone.cur.ground,false)[0];if(h)setWalkTarget(h.point.x,h.point.z);return;} // 높낮이 있는 땅
  const r0=ray.ray;if(r0.direction.y<-0.01){const tt=-r0.origin.y/r0.direction.y;setWalkTarget(r0.origin.x+r0.direction.x*tt,r0.origin.z+r0.direction.z*tt);}
});
/* 직접 조작 (game/controls — 개미굴 편 조작 그대로): 앞·옆 입력을 카메라가 보는 쪽 기준으로 바꿔 07에 넘긴다(U.drive·jumpReq·dashReq).
   결과창·그림 컷·화면 전환 중에는 움직이지 않는다. 대쉬하면 하던 대화는 닫힌다(개미굴과 같음). 촬영 모드는 쓰지 않는다 */
const _kf=new THREE.Vector3(),_ct=new THREE.Vector3(),_cw=new THREE.Vector3();
let shotDrive=null; // 촬영 모드: 직접 조작 대신 wlShot.drive({x,z,run})로 미는 값(끼임 시험) — 평소 null
function driveInput(){const I=GAME.controls.input,U=WL.userData;if(SHOT){U.drive=shotDrive;return;}
  const sh=GAME.ui.cardShown(),lock=sh==='result'||sh==='cut'||GAME.core.blocking('fade')||GAME.core.blocking('front')||GAME.core.blocking('ward'); // 첫 화면·옷 갈아입기 동안은 서 있는다
  camera.getWorldDirection(_kf);_kf.y=0;if(lock||_kf.lengthSq()<1e-6){U.drive=null;I.jumpReq=I.dashReq=false;return;}
  const a=I.axes();_kf.normalize();U.drive={x:_kf.x*a.f-_kf.z*a.s,z:_kf.z*a.f+_kf.x*a.s,run:a.run};
  if(I.jumpReq){U.jumpReq=true;I.jumpReq=false;}
  if(I.dashReq){U.dashReq=true;I.dashReq=false;if(GAME.dialog.talking())GAME.dialog.endTalk();}}
GAME.controls.controlHooks.onWardrobe=()=>GAME.front.toggleWardrobe(); // C: 옷 갈아입기 창(game/front — 개미굴 옷장과 같은 방식)
/* ---------- 구역 오가기 ----------
   goZone(이름, 자리): 새 구역을 만들고 → 지금 구역을 비우고 → 원더룹을 자리에 세우고 → 해·카메라·병합을 맞춘다.
   문(doors)을 밟으면 저절로 부른다. 들어온 문 위에 서 있는 동안은 다시 넘어가지 않는다. 탈 교체 영역(아틀라스)은 새로 채운다 */
let zoneBusy=false,doorLock=true;
async function goZone(id,spawn){clearDevcheck();
  if(zoneBusy||!ZONES[id])return false;zoneBusy=true;
  try{const nz=await loadZone(id),old=zone.cur;unloadZone(old);zone.cur=nz;
    const sp=spawn||nz.spawn;stopWalk();WL.position.set(sp.x,groundY(sp.x,sp.z),sp.z);WL.rotation.y=sp.ry||0;
    zone.area=areaAt(sp.x,sp.z)||Object.keys(nz.areas)[0];setupView(nz,zone.area);
    WL.userData.atlas.clear('swap');zoneLook(nz);if(PERF.level&&nz.quality)nz.quality(PERF.level);doorLock=true;GAME.sound.sfx('enter'); // 구역에 들어갈 때 (개미굴 enter)
    const zb=document.getElementById('zoneBtn');if(zb)zb.textContent='구역: '+nz.name;
  }finally{zoneBusy=false;}
  return true;}
/* 세계의 옷·탈: 상상의 세계(구역 정보에 hood가 있는 곳)에 들어가면 탐험복 그대로 탈만 그 세계 것으로 바꿔 쓴다.
   outfit을 적으면 그 옷(예: 'casual'), 안 적으면 탐험복. hood가 없는 구역(베이스캠프 등)은 지금 차림 그대로 */
const DEV_HEAD=new URLSearchParams(location.search).has('debug');document.body.classList.toggle('wl-devhead',DEV_HEAD); // 개발용 머리말·아래 안내 글은 ?debug일 때만
function zoneLook(z){const U=WL.userData;setZoneBend(z.bend);bendBtn(); // 둥근 땅 세기는 구역 정보 bend(없으면 끔 — 실내·베이스캠프)
  {const h=document.querySelector('header');if(h)h.style.display=z.world||!DEV_HEAD?'none':''; /* 개발용 머리말('원더룹 베이스캠프 / … 실험')은 주소에 ?debug일 때만(2026-11-04) */document.body.classList.toggle('wl-world',!!z.world);} // 세계 구역: 베이스캠프 머리말·아래 조작 안내 글자 숨김(조작법 창에 다 있음) // 세계 구역에서는 베이스캠프 머리말(실험 안내 글자)을 숨긴다
  if(z.hood){U.setOutfit(z.outfit||'explorer');U.setHood(z.hood);}else if(z.outfit)U.setOutfit(z.outfit);
  GAME.front.applyLook(U);} // 플레이어가 옷 갈아입기에서 고른 옷·머리(저장 — 없으면 세계 옷 그대로, 탈은 그대로)
zoneLook(zone.cur); // 처음 구역 (?zone=…로 바로 들어와도)
{const sp=zone.cur.spawn;WL.position.set(sp.x,groundY(sp.x,sp.z),sp.z);WL.rotation.y=sp.ry||0;} // 처음 구역의 들어오는 자리 (베이스캠프는 04의 처음 자리와 같다)
GAME.initGame({scene,camera,renderer,WL,ground:(x,z)=>floorAt(x,z,.5)});window.wlGame=GAME; // 콘솔·시험 도구용
GAME.front.applyLook(WL.userData);
// 첫 화면(game/front): 세계 front가 있는 구역이면 그 위에 타이틀 — '처음부터'는 진행을 지우고 첫 구역을 다시 만든다
GAME.weather.initWeather({scene,camera,zone:()=>zone.cur},WORLD); // 날씨·시간대(game/weather — 그 판 동안 하나)
{const q=new URLSearchParams(location.search);if(!q.has('shot')||q.has('weather')){nightTarget=night=GAME.weather.indoorNight();lightState=nightTarget>=1?1:0;}}
window.wlGait={gait:GAIT,DRV,SPEED}; // 시험 도구(걸음 미끄러짐 재기 — tools/gait-test.py)
{const w=document.getElementById('walkSpd'),r=document.getElementById('runSpd'),wo=document.getElementById('walkOut'),ro=document.getElementById('runOut'),H=SPEED.H; // 걷기·달리기 속도 막대(톱니 메뉴 — 움직이는 즉시, 이 기기에 기억). 1초에 원더룹 키 몇 배인지 같이
 const show=()=>{w.value=DRV.walk;r.value=DRV.run;wo.textContent=`${DRV.walk.toFixed(1)}m/초 · 키 ${(DRV.walk/H).toFixed(2)}배 (원본의 ${(DRV.walk/5).toFixed(2)})`;ro.textContent=`${DRV.run.toFixed(1)}m/초 · 키 ${(DRV.run/H).toFixed(2)}배 (원본의 ${(DRV.run/8).toFixed(2)})`;};
 w.addEventListener('input',()=>{SPEED.set(+w.value,null);show();});r.addEventListener('input',()=>{SPEED.set(null,+r.value);show();});document.getElementById('spdReset').addEventListener('click',()=>{SPEED.reset();show();});show();}
{const wb=document.getElementById('weatherBtn'),lab=()=>{wb.textContent='날씨: '+GAME.weather.weatherName();};lab();wb.addEventListener('click',()=>{GAME.weather.nextWeather();if(!(zone.cur&&zone.cur.sky)){nightTarget=GAME.weather.indoorNight();lightState=nightTarget>=1?1:0;}lab();});}
GAME.startFront({ctx:{scene,camera,renderer,WL},world:WORLD,zone:()=>zone.cur,restart:()=>goZone(zone.cur.root.name.replace(/^zone:/,''))});
{let done=false;const go=()=>{if(done)return;done=true;if(window.wlBootDone)window.wlBootDone();};requestAnimationFrame(()=>requestAnimationFrame(go));setTimeout(go,1500);} // 공통 로딩 화면(index.html #wlBoot): 첫 구역을 그린 뒤 치운다 — 최소 1초·0.4초 사라짐·루프 멈춤은 로딩 화면 쪽. 화면이 가려져 그리기가 멈춰 있어도 1.5초 뒤엔 치운다(촬영 모드는 로딩 화면이 스스로 바로 지움)
window.wlZone={go:goZone,get cur(){return zone.cur;},get area(){return zone.area;},list:Object.keys(ZONES),blocked,overlap}; // blocked·overlap: 끼임 자동 시험(tools/stuck-test.js)
// 주소에 ?zonetest 를 붙이면 구역을 차례로 바꾸는 단추가 나온다 (견본 구역 시험용)
if(new URLSearchParams(location.search).has('zonetest')){const b=document.createElement('button');b.id='zoneBtn';b.textContent='구역: '+zone.cur.name;
  document.querySelector('.bar').appendChild(b);b.addEventListener('click',()=>{const L=Object.keys(ZONES);goZone(L[(L.indexOf(zone.cur.id)+1)%L.length]);});}
const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* 시험용 단추(톱니, 2026-11-03):
   - 공개 주소(github.io)의 게임 = 플레이어가 보는 실제 게임 — 톱니가 절대 없다(?debug 를 붙여도).
   - 한 파일 HTML(WL_BUILD, 개발자판 — 컴퓨터에서 플레이해 보며 확인) — 톱니가 늘 있다(닫힌 채 시작).
   - 그 밖(로컬 서버)은 주소 뒤 ?debug 일 때만. ?debug 면 시험용 단추가 열린 채 시작 */
{const b=document.getElementById('dbgBtn'),set=on=>{document.body.classList.toggle('debug',on);b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'시험용 단추 닫기':'시험용 단추 열기');};
 const q=new URLSearchParams(location.search).has('debug'),single=!!window.WL_BUILD,pub=/\.github\.io$/.test(location.hostname)&&!single;
 const dev=!pub&&(single||q);document.body.classList.toggle('wl-dev',dev);set(dev&&q);
 b.addEventListener('click',()=>{const vv=window.visualViewport;if(performance.now()-(GAME.controls.input.multiT||0)<800||(vv&&vv.scale>1.01))return; // 두 손가락 동작 끝에 잘못 눌린 것은 무시(저절로 열리지 않게)
   set(!document.body.classList.contains('debug'));});}
/* 둥근 땅(시험용, 톱니 메뉴): 끔 → 약 → 중 → 강 → 끔 (game/bend — 그림만 휜다, 이 기기에 기억). 구역 정보 bend가 없는 곳(실내·베이스캠프)은 늘 끔 */
function bendBtn(){const b=document.getElementById('bendBtn');if(!b)return;const I=bendInfo();b.textContent=I.on?`둥근 땅: ${I.label}`:'둥근 땅: 이 구역 없음';b.disabled=!I.on;}
{const b=document.getElementById('bendBtn');if(b)b.addEventListener('click',()=>{const I=bendInfo();if(!I.on)return;setLevel((I.level+1)%4);bendBtn();});}
/* 진행 초기화(시험용, 톱니 메뉴): 저장된 진행(flags — 우산·완료·소개 카드)·도감을 지우고 다시 연다. 실수로 눌리지 않게 3초 안에 한 번 더 눌러야 */
/* 세계 만들기 도구(시험용, 톱니 메뉴 — game/devcheck): 경계 보기 · 걷는 시간 재기(바닥 두 곳) · 크기 확인(주민·생물 키 / 원더룹 키) */
initDevcheck({scene,camera,renderer,WL,blocked:(x,z)=>blocked(x,z),groundY:(x,z)=>floorAt(x,z,.5),walk:()=>[+DRV.walk.toFixed(2),+DRV.run.toFixed(2)],zone:()=>zone.cur});
[['boundsBtn',()=>toggleBounds(),on=>`경계 보기: ${on?'켜짐':'끔'}`],['measBtn',()=>toggleMeasure(),on=>`걷는 시간 재기: ${on?'켜짐':'끔'}`],['sizeBtn',()=>!!toggleSize(),on=>`크기 확인: ${on?'켜짐':'끔'}`]]
  .forEach(([id,f,lab])=>{const b=document.getElementById(id);if(b)b.addEventListener('click',()=>{b.textContent=lab(f());});});
{const b=document.getElementById('resetBtn');let armT=0;if(b)b.addEventListener('click',()=>{const now=performance.now();
   if(now-armT<3000){GAME.state.resetProgress();location.reload();return;}armT=now;b.textContent='한 번 더 누르면 처음부터';setTimeout(()=>{if(performance.now()-armT>=2900)b.textContent='진행 초기화';},3000);});}

/* ---------- 애니메이션 ---------- */
const INL={hemi,sun,fill};
const cDaySky=rawLin(0xfff3dc),cNightSky=rawLin(0x8b92c8),cDayG=rawLin(0xd2ab88),cNightG=rawLin(0x5a4a5e);
/* 안개: 처음부터 늘 켜 두고 하늘 없는 구역에서는 아주 멀리 밀어 둔다(그림은 그대로) — 구역마다 켜고 끄면 셰이더를 모두 다시 만들어 휴대폰이 멈춘다 */
const FOG_OFF=1e4;scene.fog=new THREE.Fog(0xffffff,FOG_OFF,FOG_OFF*2);
/* 휴대폰 세로 화면 따라가기(2026-11-03 — 아이폰 세로에서 길가 풀이 풍경보다 크게 보이던 구간): 거리 배율 상한 2.1 → 2(원더룹이 너무 작아지지 않게),
   처음 각도 0.42 라디안 위에서(풀 너머로), 보는 점을 0.6m 올려 원더룹을 화면 조금 아래에 두고 가는 쪽이 더 보이게. 가로 화면·컴퓨터는 그대로 */
const PORTRAIT={far:2,pitch:.42,lift:.6};
/* 카메라 범위(2026-11-04, 시리즈 공통 경계 규칙 — CLAUDE.md·docs/series-rules.md): 카메라는 경계 안에서만. 구역 정보로 고른다
   camRoom:{c:[x,z], r} 동그란 방(팔이 밖으로 나가면 방 안까지만 당김 — 아래) · camBox:{x:[작은,큰], z:[..], y:[..]} 카메라 자리를 그 상자 안으로(따라가기·방 카메라 모두, 연출 중 빼고)
   땅 밑: 따라가기는 늘 땅 0.7 위(아래), 위아래 각도 -0.55~1.15. 방 카메라는 방마다 polar·azimuth·maxDist(03) */
function clampBox(v,B){if(B.x)v.x=Math.min(B.x[1],Math.max(B.x[0],v.x));if(B.z)v.z=Math.min(B.z[1],Math.max(B.z[0],v.z));if(B.y)v.y=Math.min(B.y[1],Math.max(B.y[0],v.y));}
const _fv=new THREE.Vector3();const CAM_MIN=4; // 따라가기 카메라 가장 가까운 거리(m) — 원더룹 전신이 다 보이게(세로 시야 30°에서 키 1.1m + 여백)
const clock=new THREE.Timer();clock.connect(document);const tmp=new THREE.Vector3();
/* 촬영 모드(?shot): 고정 시간 간격(기본 1/60초, 영상 캡처 중에는 wlShot.dt=1/72)으로 한 프레임씩 진행 — 기준 스크린샷·영상 캡처용 */
const SHOT=new URLSearchParams(location.search).has('shot');let shotT=0,shotDt=1/60;
/* 안전장치: 프레임 안에서 오류가 나도 멈추지 않게 — 콘솔에 한 번 남기고, 이번 화면은 그려 두고, 다음 프레임을 잇는다 */
const tickErrSeen=new Set();
/* 플레이 중 아끼기(촬영 모드는 그대로 — 한 걸음씩 직접 진행): 컴퓨터는 화면 갱신마다(개미굴 원본과 같게, 2026-11-05 — 예전엔 60으로 묶었다), 휴대폰 단계는 30프레임(발열, 2026-11-01),
   창이 가려지거나(document.hidden) 다른 창을 보고 있으면(blur) 그리기를 멈췄다가 돌아오면(focus·누르기) 다시 그린다. 멈춘 동안 게임 시간도 멈춘다(돌아온 첫 프레임 간격은 0.05초로 자른다). */
let lastFrame=-1e9,paused=false,rafOn=false;const FRAME_MS=QUALITY.tier==='mobile'?1000/30:0; // 컴퓨터는 개미굴 원본처럼 화면 갱신마다(120Hz면 120번 — 2026-11-05, 60으로 묶으면 원본보다 덜 부드러웠다), 휴대폰은 30
const schedule=()=>{if(!rafOn){rafOn=true;requestAnimationFrame(frame);}}; // 루프가 두 갈래로 갈라지지 않게 예약은 한 번만
/* 쉴 때 아끼기(휴대폰 단계, 2026-11-02 발열): 대화·카드가 열려 있거나, 1.5초 넘게 손대지 않고 원더룹·카메라가 가만히 있으면 초당 20프레임.
   누르기·끌기·키·조이스틱, 원더룹이 움직이거나 탈것을 타거나 카메라가 움직이면 바로 30프레임으로 */
const MOBILE=QUALITY.tier==='mobile';document.body.classList.toggle('wl-lowfx',MOBILE); // 휴대폰 단계: 글자 마커 번짐(game/felt) 끄기
let lastAct=0;const _lw=new THREE.Vector3(),_lc=new THREE.Vector3();
['pointerdown','pointermove','keydown','wheel','touchmove'].forEach(ev=>window.addEventListener(ev,()=>{lastAct=performance.now();},{passive:true,capture:true}));
let _lr=0;function markMotion(now){const I=GAME.controls.input;if(I.jx||I.jy||GAME.ride.riding()||_lw.distanceToSquared(WL.position)>1e-6||_lc.distanceToSquared(camera.position)>1e-5||Math.abs(WL.rotation.y-_lr)>1e-4||(WL.userData.isWalking&&WL.userData.isWalking()))lastAct=now;_lw.copy(WL.position);_lc.copy(camera.position);_lr=WL.rotation.y;}
/* 20프레임은 입력·원더룹·카메라가 모두 1초 넘게 멈췄을 때만(대화·카드가 열려 있어도 움직이면 30 — 2026-11-05 걷는 중 덜컹 점검) */
const idle=now=>MOBILE&&!SHOT&&!FPS60.on&&now-lastAct>1000;
/* 화면 갱신에 맞춘 프레임 제한(2026-11-05): requestAnimationFrame 간격의 중앙값으로 화면 갱신 간격(vs — 60Hz 16.7ms, 120Hz 8.3ms)을 재고,
   그 갱신을 세어 N번에 1번 그린다(N = 목표 간격 ÷ 갱신 간격 반올림) → 120Hz에서 30프레임이면 4번에 1번, 60Hz면 2번에 1번이 늘 고르게. 갱신 개수는 직전 콜백과의 간격을 반올림해 세므로(건너뛴 갱신도 셈) 타임스탬프가 몇 ms 흔들려도 그대로다
   (예전 '목표−2ms' 시간 문턱은 타임스탬프가 2ms만 일러도 한 번 더 기다려 33/42ms로 들쭉날쭉할 수 있었다 — tools/walk-smooth-test.py 시뮬레이션: 120Hz·흔들림 ±3ms에서 27%가 41.7ms).
   게임 시간(dt)도 requestAnimationFrame 시각으로 잰다(계산이 끝난 시각이 아니라 — 화면에 나오는 시각과 같은 간격). ?debug '60프레임으로 보기'(FPS60)는 휴대폰 단계도 60으로 */
const FPS60={on:false},VS={d:[],v:16.67,prev:0};let frameNow=0;
const frameLog={iv:new Float32Array(240),dt:new Float32Array(240),idle:new Uint8Array(240),n:0,last:0}; // ?debug 프레임 간격 기록(걷는 동안 그래프) — window.wlFrameLog
function frame(now){rafOn=false;if(paused)return;
  const dr=now-VS.prev;VS.prev=now;if(dr>3&&dr<45){VS.d.push(dr);if(VS.d.length>41)VS.d.shift();if(VS.d.length>=9){const a=[...VS.d].sort((x,y)=>x-y);VS.v=a[a.length>>1];}}
  VS.cnt=(VS.cnt||0)+(dr>0&&dr<200?(dr>VS.v*1.6?Math.round(dr/VS.v):1):99); // 지난 그리기 뒤 화면 갱신 몇 번 — 콜백 하나 = 갱신 하나(간격이 1.6배 넘을 때만 건너뛴 갱신을 셈) → 타임스탬프가 몇 ms 흔들려도 개수는 그대로
  const id=idle(now),ms=id?50:(FPS60.on?1000/60:FRAME_MS),N=Math.max(1,Math.round(ms/VS.v));if(VS.cnt<N){schedule();return;}VS.cnt=0;
  const L=frameLog,i=L.n%240;L.iv[i]=lastFrame>0&&now-lastFrame<1000?now-lastFrame:0;L.idle[i]=id?1:0;L.n++;
  lastFrame=now;frameNow=now;const w0=performance.now();tick();L.dt[i]=ui.lastDt||0;markMotion(now);perfTick(now,performance.now()-w0);}
window.wlFrameLog={log:frameLog,vs:VS,fps60:FPS60,target:()=>idle(performance.now())?50:(FPS60.on?1000/60:(FRAME_MS||VS.v))};
/* ?debug 프레임 간격 기록(2026-11-05): 그린 프레임마다 간격(ms)을 막대로 — 초록 목표 ±1.5ms, 노랑 그보다 김, 파랑 쉬는 20프레임. 아래 줄에 화면 갱신(Hz)·몇 번에 한 번·평균·흔들림(표준편차)·최소/최대·벗어난 비율.
   '60프레임으로 보기'는 휴대폰 단계에서도 60프레임(30과 비교용, 이 기기 이 탭에서만) */
{const b=document.getElementById('fps60Btn'),cv=document.getElementById('frameGraph'),out=document.getElementById('frameOut'),g=cv.getContext('2d');
 const lab=()=>{b.textContent='60프레임으로 보기: '+(FPS60.on?'켬':'끔');};b.addEventListener('click',()=>{FPS60.on=!FPS60.on;lab();});lab();
 setInterval(()=>{if(!document.body.classList.contains('debug'))return;const L=frameLog,n=Math.min(L.n,240),W=cv.width,Hh=cv.height,tg=window.wlFrameLog.target();g.clearRect(0,0,W,Hh);
  const sc=Hh/70,bw=W/240;g.fillStyle='rgba(255,255,255,.35)';[16.67,33.33,50].forEach(y=>g.fillRect(0,Hh-y*sc,W,1));
  const v=[];for(let k=0;k<n;k++){const i=(L.n-n+k)%240,iv=L.iv[i];if(!iv)continue;if(!L.idle[i])v.push(iv);g.fillStyle=L.idle[i]?'#7ab8ff':Math.abs(iv-tg)<=1.5?'#7ddc8a':'#ffd36b';g.fillRect(k*bw,Hh-Math.min(70,iv)*sc,Math.max(1,bw-.5),Math.min(70,iv)*sc);}
  if(!v.length){out.textContent='';return;}const m=v.reduce((a,c)=>a+c,0)/v.length,sd=Math.sqrt(v.reduce((a,c)=>a+(c-m)*(c-m),0)/v.length),off=v.filter(x=>Math.abs(x-tg)>1.5).length;
  out.textContent=`화면 갱신 약 ${(1000/VS.v).toFixed(0)}Hz · 목표 ${tg.toFixed(1)}ms(${Math.max(1,Math.round(tg/VS.v))}번에 1번)\n최근 ${v.length}프레임 평균 ${m.toFixed(1)}ms · 흔들림 ±${sd.toFixed(1)}ms · ${Math.min(...v).toFixed(1)}~${Math.max(...v).toFixed(1)}ms · 목표에서 벗어남 ${(off/v.length*100).toFixed(0)}%`;},250);}
/* 실제 기기 성능(톱니 단추를 열면 화면 아래 표시): 1초마다 초당 프레임·프레임 간격·한 프레임 계산 시간·픽셀 비율·드로우콜·삼각형.
   자동 화질 조절(휴대폰 단계만): 초당 프레임이 목표(30)보다 3초 연달아 26 아래면 한 단계씩 낮춘다 —
   1 공중 입자 끔 · 2 먼 배경 겹·빛줄기 끔(구역 정보 quality(단계)) · 3 픽셀 비율 1.1 · 4 픽셀 비율 1. 다시 올리지는 않는다(오르내림 반복 막기). 빛·그림자 개수는 건드리지 않는다.
   쉬는 20프레임(위 idle) 동안은 느린 것으로 세지 않는다. 오래 플레이하면(휴대폰이 데워짐) 프레임과 상관없이 10분에 적어도 1단계, 20분에 적어도 2단계(화면을 보고 있는 시간만 셈) */
const PERF={t0:0,last:0,n:0,iv:0,work:0,fps:0,ivA:0,workA:0,bad:0,level:0,play:0};
function perfTick(now,work){const P=PERF;if(!P.last||now-P.last>500){P.t0=now;P.last=now;P.n=P.iv=P.work=0;return;}P.iv+=now-P.last;P.work+=work;P.n++;P.last=now;
  if(now-P.t0<1000)return;const sec=(now-P.t0)/1000;P.fps=P.n*1000/(now-P.t0);P.ivA=P.iv/P.n;P.workA=P.work/P.n;P.t0=now;P.n=P.iv=P.work=0;
  if(MOBILE&&!SHOT){P.play+=sec;if(idle(now))P.bad=0;else if(P.fps<26)P.bad++;else P.bad=0;
    const want=Math.max(P.bad>=3?P.level+1:P.level,P.play>1200?2:P.play>600?1:0);if(want>P.level&&P.level<4){P.level=Math.min(4,want);P.bad=0;applyQuality();}}}
function applyQuality(){const L=PERF.level;GAME.weather.rainQuality(L);if(zone.cur&&zone.cur.quality)zone.cur.quality(L);if(L>=3)setPixelCap(L>=4?1:1.1);}
const nextFrame=()=>{if(!SHOT&&!paused)schedule();};
if(!SHOT){const setPaused=p=>{if(p===paused)return;paused=p;if(!p)schedule();};
  document.addEventListener('visibilitychange',()=>setPaused(document.hidden));
  window.addEventListener('blur',()=>setPaused(true));['focus','pointerdown','keydown'].forEach(ev=>window.addEventListener(ev,()=>setPaused(document.hidden)));}
/* 한 화면 그리기: 보통 그리기 + 흐려 보기 덧그리기(game/occlude — 세계 구역에서 원더룹을 가리는 조각만). 화면 통계는 둘을 합친 값 */
renderer.info.autoReset=false;
/* 둥근 땅(game/bend): 그리기 직전 카메라 자리를 넣는다(그림자 그리기도 같은 값) */
function renderFrame(){setBend(camera);renderer.info.reset();renderer.render(scene,camera);GAME.occlude.overlayPass(renderer,scene,camera);}
function tick(){let ok=false;try{tickBody();ok=true;}catch(e){const k=String(e&&e.stack||e);if(!tickErrSeen.has(k)){tickErrSeen.add(k);console.error('원더룹: 프레임 오류 (계속 진행)',e);}
  try{renderFrame();}catch(e2){}}if(!ok)nextFrame();}
function tickBody(){
  let dt,t;if(SHOT){dt=shotDt;shotT+=dt;t=shotT;}else{clock.update(frameNow||undefined);dt=Math.max(0,Math.min(clock.getDelta(),0.05));t=clock.getElapsed();if(window.wlTimeScale)dt*=window.wlTimeScale;}ui.lastDt=dt; /* wlTimeScale: 시험 도구가 느린 화면(0.25배속)을 찍을 때만 */
  night+=(nightTarget-night)*Math.min(1,dt*2.2);
  const Z=zone.cur,SK=Z.sky; // 하늘이 있는 구역(game/sky): 낮/저녁 단추 대신 하늘의 시간 값을 따른다
  const n=SK?SK.night:night,flick=reduce?1:(1+Math.sin(t*7.3)*0.04+Math.sin(t*13.1)*0.03);
  hemi.intensity=0.62-0.4*n;hemi.color.copy(cDaySky).lerp(cNightSky,n);hemi.groundColor.copy(cDayG).lerp(cNightG,n);
  sun.intensity=0.72*(1-n);fill.intensity=0.22-0.08*n;
  if(SK)SK.light({hemi,sun,fill,fog:scene.fog},camera,dt,Z.sun.dir);else if(scene.fog.near<FOG_OFF){scene.fog.near=FOG_OFF;scene.fog.far=FOG_OFF*2;}
  {const far=SK?Math.min(120,scene.fog.far+4):120;if(camera.far!==far){camera.far=far;camera.updateProjectionMatrix();}} // 하늘 있는 구역: 안개가 다 덮는 곳부터는 그리지 않는다(하늘 지붕은 그 안으로 줄어듦)
  const wx=SK?{night:0,rain:SK.rain||0}:GAME.weather.indoorLight(INL,dt,rawLin); // 실내 날씨: 밤은 푸르고 어둡게, 비는 회청색(창문 하늘은 구역 light(env)가 env.weather·env.rain으로)
  cave+=((SK?0:caveTarget)-cave)*Math.min(1,dt*2.2);dayLabel(); // 하늘 있는 구역에서는 굴 조명을 쓰지 않는다
  if(cave>0.001){hemi.intensity*=1-.75*cave;hemi.color.lerp(rawLin(0x6b4a3a),cave);hemi.groundColor.lerp(rawLin(0x2a1d16),cave);fill.intensity*=1-.75*cave;}
  const env={night:n,cave,flick,reduce,weather:GAME.weather.weather(),rain:wx.rain,deep:wx.night};WL.userData.nightK=SK?Math.min(1,SK.t/2*1.3):n; // 탈 효과(화관 별가루)가 해 질 녘·밤에 더 또렷하게
  if(Z.mood){const m=Z.mood;hemi.intensity*=m.hemi??1;sun.intensity*=m.sun??1;fill.intensity*=m.fill??1; // 구역 분위기(땅속 등): 하늘빛·해를 줄이고 색을 물들인다 — 없으면 예전과 같다
    if(m.sky!=null){hemi.color.lerp(rawLin(m.sky),m.tint??.5);hemi.groundColor.lerp(rawLin(m.ground??m.sky),m.tint??.5);}}
  if(Z.light)Z.light(env,dt); // 구역 조명(램프·등불 등)과 효과의 밝기
  {const dark=Math.min(1,Math.max(0,1-hemi.intensity/.62));const U=WL.userData;const a=emph==='on'?1:emph==='off'?0:Math.min(1,Math.max(0,(dark-.25)/.25)); // 자동: 어두움 .25부터 켜지기 시작해 .5 이상(저녁·굴·땅속)이면 예전 세기 그대로
   if(U.rimU){U.rimU.value=a*(.08+.45*dark);U.liftU.value=a*(.02+.17*dark);}}
  // 위 세기는 r128 옛 조명 단위 → 물리 단위로 (옛 방식은 셰이더에서 π를 곱했다)
  [hemi,sun,fill,...Z.lights].forEach(l=>l.intensity*=PI);
  GAME.weather.tickWeather(dt,Z,camera); // 빗줄기·공간음
  if(Z.update)Z.update(dt,t,env); // 구역 움직임 (베이스캠프: 먼지·김·시계)
  driveInput();GAME.controls.tickControls(dt,WL.userData.dashCool());
  updateWL(dt,t);
  GAME.updateGame(dt); // 대화·이벤트·나레이션 (게임 시간 = 촬영 모드에서는 1/60초씩, 영상 캡처 중에는 1/72초씩)
  // 방(영역)이 바뀌면 그 방 카메라로, 문을 밟으면 다른 구역으로
  {const a=areaAt(WL.position.x,WL.position.z);if(a&&a!==zone.area){zone.area=a;setAreaCamera(Z.areas[a].camera,false);}
   const d=doorAt(WL.position.x,WL.position.z);if(!d)doorLock=false;else if(!doorLock&&!zoneBusy){doorLock=true;goZone(d.to,d.spawn);}}
  // 넓은 야외: 그림자 범위가 원더룹을 따라감 (그림자 지도 한 칸 단위로 맞춰 떨림 없게)
  if(Z.sun.follow){const s=Z.sun.shadow,st=2*s/sun.shadow.mapSize.x,cx=Math.round(WL.position.x/st)*st,cz=Math.round(WL.position.z/st)*st;
    sun.target.position.set(cx,0,cz);sun.position.set(cx,0,cz).sub(tmp.copy(Z.sun.dir).multiplyScalar(16));}
  // 천천히 둘러보기
  const C=GAME.controls.input.cam,rig=!SHOT&&follow;C.on=rig;controls.enableRotate=controls.enableZoom=!rig; // 따라가기 카메라 = 개미굴 카메라(끌기·휠)
  if(spin&&!rig){const off=camera.position.clone().sub(controls.target);const s=new THREE.Spherical().setFromVector3(off);
    s.theta+=spinDir*dt*0.18;if(s.theta>controls.maxAzimuthAngle-0.02){spinDir=-1;}if(s.theta<controls.minAzimuthAngle+0.02){spinDir=1;}
    camera.position.copy(new THREE.Vector3().setFromSpherical(s).add(controls.target));}
  /* 개미굴 따라가기 카메라: 원더룹 둘레 yaw(가로)·pitch(위아래 -0.55~1.15)·거리(3~13, 세로 화면은 방 카메라와 같은 배율로 멀리).
     자리는 초당 7, 보는 점은 초당 10으로 따라가고, 땅 밑으로는 0.7 위까지만 내려간다. 처음엔 지금 카메라 방향에서 이어 받는다.
     벽이 있는 방은 방 카메라 각도 범위 안에서(아래). 넓은 야외는 개미굴 값 그대로 */
  if(rig){if(!C.ready){const sp=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));C.yaw=sp.theta;C.pitch=Math.min(1.15,Math.max(-.55,PI/2-sp.phi));C.dist=7.5;C.ready=true;
    if(camera.aspect<1)C.pitch=Math.max(C.pitch,PORTRAIT.pitch);} // 세로 화면 처음 각도: 조금 더 위에서(키 큰 풀 너머로 원더룹 전신과 가는 길이 함께) — 그 뒤로는 플레이어 것
    if(spin)C.yaw+=spinDir*dt*.18;
    // 벽이 있는 방(방 카메라에 가로 범위가 있는 곳)은 그 방의 열린 쪽 각도 안에서만 — 개미굴도 구역마다 카메라 자리를 방 안으로 묶었다
    {const A=Z.areas[zone.area],c=A&&A.camera;if(c&&c.azimuth){const y0=c.azimuth[0],y1=c.azimuth[1];let y=C.yaw;while(y<y0-PI)y+=2*PI;while(y>y1+PI)y-=2*PI;C.yaw=Math.min(y1,Math.max(y0,y));
      C.pitch=Math.min(PI/2-c.polar[0],Math.max(PI/2-c.polar[1],C.pitch));}}
    /* 거리: 플레이어가 정한 C.dist(휠·두 손가락)만 바꾼다 — 한 손가락 끌기는 각도만. 가장 가까이는 원더룹 전신이 화면에 다 들어오는 4m(세로 화면 배율을 곱한 뒤 값),
       방(camRoom) 같은 장애물 때문에 당겨지면 C.pull로 빨리 당기고, 장애물이 없어지면 정한 거리로 천천히 돌아간다 */
    const asp=camera.aspect,fk=asp<1.25?Math.min(asp<1?PORTRAIT.far:2.1,1.25/asp):1;
    /* 카메라 규칙(CLAUDE.md): 탈것·활공 중에도 카메라를 붙박지 않는다. view.start는 처음 각도만 0.8초에 걸쳐 맞추고 놓아 준다.
       짧은 연출(view.focus·hold) 중에 플레이어가 끌기·두 손가락·휠·방향키로 카메라를 만지면 연출을 끝내고 지금 카메라 자리에서 바로 조작을 넘겨준다 */
    {const V=GAME.view;if(C.user!==C.userSeen){C.userSeen=C.user;V.aim=null;
       if(V.req||C.fw>0){const ox=camera.position.x-WL.position.x,oy=camera.position.y-WL.position.y-.85,oz=camera.position.z-WL.position.z,L=Math.hypot(ox,oy,oz)||1;
         C.yaw=Math.atan2(ox,oz);C.pitch=Math.min(1.15,Math.max(-.55,Math.asin(oy/L)));C.dist=Math.min(13,Math.max(CAM_MIN/fk,L/fk));V.req=null;C.fw=0;}}
     if(V.aim){const a=V.aim;if(!a.rel){const o=a.at||[WL.position.x,WL.position.y+.85,WL.position.z];a.rel=[a.from[0]-o[0],a.from[1]-o[1],a.from[2]-o[2]];}a.t+=dt;
       const [ox,oy,oz]=a.rel,L=Math.hypot(ox,oy,oz)||1,gy=Math.atan2(ox,oz),k=Math.min(1,dt*6);let dy=gy-C.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));
       C.yaw+=dy*k;C.pitch+=(Math.min(1.15,Math.max(-.55,Math.asin(oy/L)))-C.pitch)*k;C.dist+=(Math.min(13,Math.max(CAM_MIN/fk,L))-C.dist)*k;if(a.t>.8)V.aim=null;}} // from 거리는 가로 화면 기준(세로 화면은 따라가기와 같은 배율로 멀리)
    C.minD=CAM_MIN/fk;if(C.dist<C.minD)C.dist=C.minD;const d=C.dist*fk;_ct.set(WL.position.x,WL.position.y+.85+(asp<1?PORTRAIT.lift:0),WL.position.z);
    _cw.set(_ct.x+Math.sin(C.yaw)*Math.cos(C.pitch)*d,_ct.y+Math.sin(C.pitch)*d,_ct.z+Math.cos(C.yaw)*Math.cos(C.pitch)*d);
    {let kt=1;if(Z.camRoom){const [rx,rz]=Z.camRoom.c,rr=Z.camRoom.r,ox=_ct.x-rx,oz=_ct.z-rz,dx=_cw.x-_ct.x,dz=_cw.z-_ct.z,A=dx*dx+dz*dz,B=2*(ox*dx+oz*dz),Cq=ox*ox+oz*oz-rr*rr; // 카메라 방(구역 정보 camRoom): 팔이 방 밖으로 나가면 방 안까지만
       if(A>1e-6&&(_cw.x-rx)**2+(_cw.z-rz)**2>rr*rr)kt=Cq<0?(-B+Math.sqrt(B*B-4*A*Cq))/(2*A):0;
       /* 집·바위·큰 잎처럼 흐려질 수 있는 물체는 카메라를 당기지 않는다(game/occlude가 흐린다 — 2026-11-02, 꽃지붕 집 옆에서 당겼다 물러났다 하던 것). 당기는 건 이 카메라 방(둘레 벽)과 아래 땅뿐 */}
     /* 부드럽게, 여유를 두고: 당길 때는 약 0.25초에 걸쳐, 놓을 때는 0.8초 동안 계속 열려 있어야 천천히(짧은 사이에 당겼다 물러났다 되풀이하지 않게) */
     C.pull=C.pull??1;if(kt<C.pull-.02){C.pull+=(kt-C.pull)*Math.min(1,dt*4);C.relT=0;}else if(kt>C.pull+.02){C.relT=(C.relT||0)+dt;if(C.relT>.8)C.pull+=(kt-C.pull)*Math.min(1,dt*1.5);}else C.relT=0;
     const k=Math.min(1,Math.max(CAM_MIN/d,C.pull));
     if(k<1)_cw.set(_ct.x+(_cw.x-_ct.x)*k,_ct.y+(_cw.y-_ct.y)*k,_ct.z+(_cw.z-_ct.z)*k);}
    /* 구역이 비춰 달라는 곳(game view.focus·hold): 그쪽 자리·보는 점으로 섞는다 — 들어갈 때·돌아올 때 0.45초 */
    {const V=GAME.view,r=V.req;let want=0;if(r){r.t+=dt;let at=null,from=null;
       if(r.fn){const o=r.fn();if(o){at=o.at;from=o.from;want=1;}}else if(r.t<r.sec+.45){at=r.at;from=r.from;want=r.t<r.sec?1:0;
         if(!from){const dx=WL.position.x-at[0],dz=WL.position.z-at[2],L=Math.hypot(dx,dz)||1;from=[at[0]+dx/L*r.dist,at[1]+r.dist*.55,at[2]+dz/L*r.dist];}}
       else V.req=null;if(at){C.fAt=at;C.fFrom=from;}}
     C.fw=(C.fw||0)+(want-(C.fw||0))*Math.min(1,dt/.45*2.2);if(C.fw<.002)C.fw=0;
     if(C.fw>0&&C.fAt){const w=C.fw*C.fw*(3-2*C.fw);_ct.lerp(_fv.set(...C.fAt),w);_cw.lerp(_fv.set(...C.fFrom),w);}}
    if(Z.camBox&&(C.fw||0)<.5)clampBox(_cw,Z.camBox); // 카메라 상자(구역 정보 camBox): 경계 너머 빈 곳·세계 끝이 보이지 않게 카메라 자리를 상자 안으로(연출 중에는 빼고)
    _cw.y=Math.max(_cw.y,groundY(_cw.x,_cw.z)+.7);
    camera.position.lerp(_cw,SHOT?Math.min(1,dt*7):1-Math.exp(-dt*7));camera.position.y=Math.max(camera.position.y,groundY(camera.position.x,camera.position.z)+.6); // 따라오는 길에도 땅 속으로 들어가지 않게
    controls.target.lerp(_ct,SHOT?Math.min(1,dt*10):1-Math.exp(-dt*10));camera.lookAt(controls.target);ui.camGoal=0;}
  else if(GAME.view.req&&GAME.view.req.fn&&(C.hv=GAME.view.req.fn())){C.ready=false;const k=Math.min(1,dt*1.5); // 방 카메라 구역에서도 view.hold(첫 화면 배경 루프 — 베이스캠프): 개미굴 타이틀처럼 그 자리로 부드럽게
    camera.position.lerp(_fv.set(...C.hv.from),k);controls.target.lerp(_fv.set(...C.hv.at),k);camera.lookAt(controls.target);}
  else{C.ready=false;C.hv=null;const tg=follow?new THREE.Vector3(WL.position.x,WL.position.y+.85,WL.position.z):ROOM_T;const k=Math.min(1,dt*3);const dv=tg.clone().sub(controls.target).multiplyScalar(k);controls.target.add(dv);camera.position.add(dv);
   if(ui.camGoal){const off=camera.position.clone().sub(controls.target);const L=off.length(),nl=L+(ui.camGoal-L)*Math.min(1,dt*3);off.setLength(nl);camera.position.copy(controls.target).add(off);if(Math.abs(nl-ui.camGoal)<.05)ui.camGoal=0;}}
  if(!rig&&!C.hv){controls.update();if(Z.camBox&&!GAME.view.req)clampBox(camera.position,Z.camBox);}GAME.occlude.prepCut();renderFrame(); // 흐려 보기 동그라미는 카메라가 움직인 뒤에 맞춘다
  if(!ui.firstFrame){ui.firstFrame=true;performance.mark('wl-frame');} // 첫 화면 (로딩 시간 측정용)
  ui.statT+=dt;if(ui.statT>0.5){ui.statT=0;const ri=renderer.info.render,P=PERF,c=renderer.domElement;
    statsEl.textContent=(SHOT?'':`버전 ${window.WL_V||'-'}${window.WL_BUILD?' · 커밋 '+window.WL_BUILD.commit:''}\n`)+`${optimized?'최적화 켜짐':'최적화 꺼짐'}: 드로우콜 ${ri.calls}회(그림자 포함), 삼각형 ${ri.triangles.toLocaleString('ko-KR')}개`+(SHOT?'':
      `\n${QUALITY.tier==='mobile'?'휴대폰':'컴퓨터'} 단계 · 초당 ${P.fps.toFixed(0)}프레임(목표 ${FRAME_MS?Math.round(1000/FRAME_MS):"화면 갱신마다"}) · 프레임 간격 ${P.ivA.toFixed(1)}ms · 계산 ${P.workA.toFixed(1)}ms\n픽셀 비율 ${renderer.getPixelRatio()}(기기 ${window.devicePixelRatio}) · 그리는 크기 ${c.width}×${c.height} · 자동 화질 ${P.level}단계 · 플레이 ${Math.floor(P.play/60)}분${idle(performance.now())?' · 쉬는 중 20프레임':''}`);}
  nextFrame();
}
tick();
if(SHOT){
  /* 콘솔·자동화에서 쓰는 촬영 도구: wlShot.setup({...}) → wlShot.step(n) → wlShot.capture() */
  renderer.setPixelRatio(1);
  const clickUntil=(id,ok)=>{const b=document.getElementById(id);for(let i=0;i<12&&!ok();i++)b.click();};
  window.wlShot={
    revision:THREE.REVISION,scene,renderer,camera,WL,game:GAME,
    /* 한 걸음 시간(초). 기본 1/60(기준 스크린샷·규칙 시험), 영상 캡처는 1/72 × 3걸음 = 24fps 한 프레임 */
    get dt(){return shotDt;},set dt(v){shotDt=v;},
    /* 화면 크기(영상 캡처: 2560×1440, 1080×1920). 방 카메라·따라가기 거리도 새 화면비로 다시 잡는다(세로 화면은 멀리) */
    size(w,h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();const A=zone.cur.areas[zone.area];if(A){setAreaCamera(A.camera,false);ui.camGoal=follow?followDist():ui.dist;}},
    /* 원더룹을 그 자리에 세운다 (영상 캡처 구간 시작) */
    place(x,z,ry){stopWalk();WL.position.set(x,groundY(x,z),z);if(ry!=null)WL.rotation.y=ry;const a=areaAt(x,z);if(a&&a!==zone.area){zone.area=a;setAreaCamera(zone.cur.areas[a].camera,false);}},
    walking,go:goZone,get follow(){return follow;},
    setup(o){
      if(o.light!=null)clickUntil('dayBtn',()=>lightState===o.light);
      if(o.hood!=null)clickUntil('hoodBtn',()=>WL.userData.hw===o.hood);
      if(o.outfit!=null)clickUntil('outfitBtn',()=>!!WL.userData.outfit===!!o.outfit);
      if(o.action)clickUntil('actBtn',()=>WL.userData.action===o.action);
      if(o.expr)clickUntil('exprBtn',()=>document.getElementById('exprBtn').textContent==='표정: '+o.expr);
      if(o.follow!=null&&o.follow!==follow)document.getElementById('camBtn').click();
      if(o.walk)setWalkTarget(o.walk[0],o.walk[1]);
      if(o.hop)hopWL();
      if(o.view)this.view(o.view);
    },
    /* az: 원더룹이 보는 방향 기준 각도(0 정면, π/2 측면, π 뒷면), pol: 위에서 내려다보는 각, dist: 거리 */
    view(v){Object.assign(controls,{minAzimuthAngle:-Infinity,maxAzimuthAngle:Infinity,minPolarAngle:0,maxPolarAngle:PI,minDistance:0.5});ui.camGoal=0;
      const tg=v.room?ROOM_T.clone():new THREE.Vector3(WL.position.x,WL.position.y+.85,WL.position.z);if(v.ty!=null)tg.y=v.ty;
      controls.target.copy(tg);camera.position.copy(new THREE.Vector3().setFromSpherical(new THREE.Spherical(v.dist,v.pol,(v.room?0:WL.rotation.y)+v.az)).add(tg));controls.update();},
    step(n){for(let i=0;i<n;i++)tick();},
    render:renderFrame,drive(v){shotDrive=v||null;},
    capture(){renderFrame();return renderer.domElement.toDataURL('image/png');},
    info(){const ri=renderer.info.render;return{calls:ri.calls,triangles:ri.triangles};}
  };
}
rngLoaded(); // 로딩 끝 (난수 기록 모드면 여기서 기록을 저장)
// 영상 캡처 모드(?shot&capture=대본.js): 촬영 도구가 다 준비된 뒤에 불러온다 (09-capture.js)
if(SHOT&&new URLSearchParams(location.search).has('capture'))import('./09-capture.js');
