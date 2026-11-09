/* 원더룹 — 구역(zone) 구조
   구역 하나 = js/zones/<이름>.js 모듈 하나. 지금 구역만 장면에 올리고, 떠날 때 메시·재질·텍스처를 GPU에서 비운다.
   구역 모듈은 build({root,id})를 내보낸다. 그 안에서 add·boxAt·group 등으로 소품을 만들면 구역 뿌리(root)에 붙고,
   끝에 아래 "구역 정보"를 돌려준다. 원더룹(04~07)과 해·하늘빛·카메라(03)는 구역이 바뀌어도 그대로다.

   구역 정보 (js/zones/basecamp.js, sample-outdoor.js, sample-indoor.js 참고)
     name, kind: 'indoor'(실내) | 'outdoor'(야외)
     spawn: {x,z,ry}                     처음 들어올 때 원더룹 자리·방향
     areas: {이름: {bounds, obstacles, camera}}
       실내는 방마다 하나, 야외는 보통 하나. bounds [x0,x1,z0,z1] 걸을 수 있는 범위(방끼리 겹치는 곳이 문간),
       obstacles [{r:[x0,x1,z0,z1]} | {c:[x,z,반지름]}], camera {target, dist, polar, azimuth(없으면 한 바퀴), start, minDist, maxDist}
     doors: [{rect:[x0,x1,z0,z1], to, spawn}]  밟으면 다른 구역(to)으로 (spawn이 있으면 그 자리로)
     sun: {dir, shadow, follow}           해 방향, 그림자 범위(반지름), follow: 그림자 범위가 원더룹을 따라감(넓은 야외)
     music: '이름' | {id, gain, fade}  (선택) 구역 배경음 — assets/audio/<이름>.mp3, 구역을 옮기면 크로스페이드(game/sound.js zoneMusic). 파일이 없으면 빈 자리
     mood: {hemi, sun, fill, sky, ground, tint}  (선택) 구역 분위기 — 하늘빛·해·보조광 세기 배율과 하늘빛 물들일 색(땅속은 호박색). 낮·저녁·굴 단계 위에 곱한다
     groundY(x,z), ground: [메시]          (선택) 땅 높이, 클릭해서 걸을 때 맞힐 땅
     lights: [점광원]  light(env,dt)  update(dt,t,env)  click(ray)  keepOut: [병합에서 뺄 것]  dispose()
     lateUpdate(dt,t,env)                (선택) 원더룹 뼈가 움직인 뒤 맞출 것(08 — 두 손에 쥔 떡메처럼 손 자리를 따라가는 물건)
     start: {compass:true}               들어올 때 이미 그런 진행 상태(game/state)
     hood: 'ant'                         들어올 때 쓰는 탈(06 탈 목록의 key) — 세계마다 탈 하나. hood가 있으면 옷은 탐험복(08 zoneLook)
     platforms: [{r:[x0,x1,z0,z1]|c:[x,z,반지름], top}]   높은 발판(버섯 갓·가지 등): 위에 서고, 아래에서 걸어 들어가면 막힘(STEP보다 높으면)
     bouncers: [{c:[x,z,반지름], top, height, to:[x,z]}]   튀는 발판(버섯 갓): 밟기만 하면 top+height 높이로 튀어 to에 내려앉음(to 없으면 제자리)
     bounce(b)  튀는 발판이 튀길 때 구역이 부르는 함수(갓 출렁임·소리)   bend: {k,d0} 둥근 땅 세기(game/bend — 없으면 끔, 실내·베이스캠프는 넣지 않는다)   glide: true 늘 활공·false 활공 안 함·없으면 활공 아이템(민들레 솜털 우산, game/items canGlide)을 가졌을 때(07, 펼치는 물건은 06 setGlideProp)
     발판은 매 프레임 그 값을 읽는다 → p.top·c[2]를 바꾸면 자라는 발판(버섯 계단 등). 서 있는 발판이 천천히 자라면 원더룹도 함께 올라간다(한 프레임에 STEP보다 크게 바꾸지 않기)
     winds: [{c|r, dir:[x,z], strength, up, y:[아래,위], on}]   바람 구역: 공중·활공 중에만 dir 쪽으로 밀어 준다(초당 strength), up이 있으면 활공 중 위로 띄움(바람길).
                                         구역 코드가 dir·on을 바꾸면 바람 방향이 바뀐다(장난꾸러기 바람). 걷는 동안에는 밀지 않는다
     camRoom: {c:[x,z], r}                (선택) 따라가기 카메라가 머무는 동그란 방 — 카메라 팔이 이 밖으로 나가면 그만큼 짧아진다(둘레 벽 바깥에서 큰 잎 너머로 보지 않게, 요정의 숲)
     camBox: {x:[작은,큰], z:[..], y:[..]}   (선택, 2026-11-04) 카메라 자리를 이 상자 안으로 — 경계 너머 빈 곳·세계 끝·바닥 아래가 보이지 않게(08, 따라가기·방 카메라 모두, 연출 중 빼고)
     걷기 경계(bounds·obstacles)에 닿으면 07 slideGo가 벽을 따라 미끄러지듯 비켜 간다(안내 글 없음)
     outfit: 'explorer'|'casual'         (선택) 옷. 세계 구역은 js/zones/<세계>/world.js에 기본값(옷·탈·start)을 두고 펼쳐 쓴다
     NPC·이벤트는 build 안에서 js/game/의 dialog.npc()·events.area()로 등록한다(구역을 떠나면 비워진다)
   새 구역 추가: README "새 구역 추가하기". */
import * as THREE from 'three';
import {BUILD,loadBaked,scene} from './01-textures.js';
import {clearZoneGame,sound} from './game/index.js';
import {applyStart} from './game/state.js';
import {CURRENT as WORLD} from './worlds/index.js';
// 구역 목록 — 새 구역은 여기에 한 줄 더한다
const ZONES={
  basecamp:()=>import('./zones/basecamp.js'),
  'fairy-dock':()=>import('./zones/fairy/dock.js'), // 요정의 숲 ① 이슬방울 선착장
  'space-garden':()=>import('./zones/space/garden.js'), // 무한 우주 ① 회색 정원(걸어서 한 바퀴 도는 작은 행성)
  'space-mars':()=>import('./zones/space/mars.js'), // 무한 우주 ② 화성 — 지금은 별똥별 꼬리 타기 착지 자리만(임시 땅, STAGE 2는 기획서대로 따로)
};
// 견본 구역(확인용, 하늘 없음)은 주소에 ?zonetest 를 붙였을 때만 목록에 들어간다 — 일반 주소에서는 문·wlZone.go·?zone= 어느 길로도 못 간다
const ZONETEST=new URLSearchParams(location.search).has('zonetest');
if(ZONETEST)Object.assign(ZONES,{
  'sample-outdoor':()=>import('./zones/sample-outdoor.js'),
  'sample-indoor':()=>import('./zones/sample-indoor.js'),
  'sample-fx':()=>import('./zones/sample-fx.js'), // 휴대폰 성능 시험 장면(반투명 판·등불 빛·낙엽·눈·여러 개 배치·점프·활공)
});
const zone={cur:null,area:null}; // 지금 구역과 원더룹이 있는 방(영역) — 03·07·08이 읽는다
async function loadZone(id){
  if(!ZONES[id])throw new Error('원더룹: 없는 구역 '+id);
  const [mod]=await Promise.all([ZONES[id](),loadBaked(id)]); // 구역 코드와 그 구역의 구운 텍스처
  const root=new THREE.Group();root.name='zone:'+id;scene.add(root);
  clearZoneGame(id); // 앞 구역의 NPC·트리거·이벤트 줄을 비우고 새 구역이 등록한다
  BUILD.root=root;BUILD.zone=id;let z;try{z=mod.build({root,id});}finally{BUILD.root=null;BUILD.zone=null;}
  Object.assign(z,{id,root});z.lights=z.lights||[];z.keepOut=z.keepOut||[];
  z.doors=(z.doors||[]).filter(d=>ZONES[d.to]); // 목록에 없는 구역으로 가는 문은 없앤다
  for(const a of Object.values(z.areas))a.obstacles=a.obstacles||[];z.platforms=z.platforms||[];z.bouncers=z.bouncers||[];z.winds=z.winds||[];
  applyStart(z.start); // 이 구역에 들어올 때 이미 그런 이야기 상태 (예: 나침반을 받음)
  if(z.music)sound.zoneMusic(z.music); // 구역 배경음 (assets/audio/, 앞 구역 곡과 크로스페이드 — game/sound.js)
  return z;}
function unloadZone(z){
  scene.remove(z.root);const seen=new Set();
  z.root.traverse(o=>{if(o.geometry)o.geometry.dispose();
    (Array.isArray(o.material)?o.material:o.material?[o.material]:[]).forEach(m=>{if(seen.has(m))return;seen.add(m);
      for(const k in m){const v=m[k];if(v&&v.isTexture)v.dispose();}m.dispose();});});
  if(z.dispose)z.dispose();}
/* 걷기: 어느 방(영역) 안이어야 하고 장애물에 닿지 않아야 한다 (WR: 원더룹 몸 반지름) */
const WR=0.28;
const inRect=(r,x,z)=>x>=r[0]&&x<=r[1]&&z>=r[2]&&z<=r[3];
function areaAt(x,z){for(const k in zone.cur.areas)if(inRect(zone.cur.areas[k].bounds,x,z))return k;return null;}
/* 높이: 발판(platforms) 위에 서고, 발보다 STEP 넘게 높은 발판 옆면은 막는다. 발판·튀는 발판이 없는 구역은 예전과 같다(땅 높이만) */
const STEP=.22;
const inShape=(o,x,z,m=0)=>o.r?(x>o.r[0]-m&&x<o.r[1]+m&&z>o.r[2]-m&&z<o.r[3]+m):((x-o.c[0])**2+(z-o.c[1])**2<(o.c[2]+m)**2);
function floorAt(x,z,y=Infinity){let f=groundY(x,z);for(const p of zone.cur.platforms)if(p.top>f&&p.top<=y+STEP&&inShape(p,x,z))f=p.top;return f;}
const bouncerAt=(x,z)=>zone.cur.bouncers.find(b=>inShape(b,x,z))||null;
const hasHeights=()=>zone.cur.platforms.length>0||zone.cur.bouncers.length>0;
const windAt=(x,z,y)=>{for(const w of zone.cur.winds)if(w.on!==false&&inShape(w,x,z)&&(!w.y||(y>=w.y[0]&&y<=w.y[1])))return w;return null;};
function blocked(x,z,y){if(!areaAt(x,z))return true;
  if(y!=null)for(const p of zone.cur.platforms)if(p.top>y+STEP&&inShape(p,x,z,WR*.6))return true;
  for(const k in zone.cur.areas)for(const o of zone.cur.areas[k].obstacles){
    if(o.r){if(x>o.r[0]-WR&&x<o.r[1]+WR&&z>o.r[2]-WR&&z<o.r[3]+WR)return true;}
    else{const dx=x-o.c[0],dz=z-o.c[1];if(dx*dx+dz*dz<(o.c[2]+WR)*(o.c[2]+WR))return true;}}
  return false;}
/* 얼마나 파고들었나(m, 0이면 자유): 원더룹이 어떤 까닭으로든(활공 흔들림·튀는 발판·탈것에서 내림) 장애물 속에 들어가 있으면
   07이 '덜 파고드는 쪽'으로는 움직이게 한다 — 갇혀서 점프·대쉬로도 못 나오던 문제(2026-11-02, 요정의 숲 마을 꽃지붕 집 옆) */
function overlap(x,z,y){if(!areaAt(x,z))return 9;let d=0;
  if(y!=null)for(const p of zone.cur.platforms)if(p.top>y+STEP&&inShape(p,x,z,WR*.6))d=Math.max(d,p.r?Math.min(x-p.r[0],p.r[1]-x,z-p.r[2],p.r[3]-z)+WR*.6:p.c[2]+WR*.6-Math.hypot(x-p.c[0],z-p.c[1]));
  for(const k in zone.cur.areas)for(const o of zone.cur.areas[k].obstacles){
    if(o.r){if(x>o.r[0]-WR&&x<o.r[1]+WR&&z>o.r[2]-WR&&z<o.r[3]+WR)d=Math.max(d,Math.min(x-o.r[0],o.r[1]-x,z-o.r[2],o.r[3]-z)+WR);}
    else{const q=o.c[2]+WR-Math.hypot(x-o.c[0],z-o.c[1]);if(q>0)d=Math.max(d,q);}}
  return d;}
const groundY=(x,z)=>zone.cur.groundY?zone.cur.groundY(x,z):0;
const doorAt=(x,z)=>zone.cur.doors.find(d=>inRect(d.rect,x,z))||null;
// 처음 구역: 주소에 ?zone=이름 을 붙이면 그 구역에서 시작. 없으면 START_ZONE — 지금 세계(js/worlds CURRENT)의 시작 공간 backdrop.zone(2026-11-04 시리즈 공통 틀. 요정의 숲 선착장은 ?zone=fairy-dock).
// 촬영 모드(?shot)는 늘 베이스캠프(기준 촬영·규칙 시험이 zone 없이 연다)
const START_ZONE=window.WL_START_ZONE||WORLD.backdrop.zone; // 한 파일 빌드(tools/build-single.js)는 그 스테이지 구역을 WL_START_ZONE으로 정한다
{const q=new URLSearchParams(location.search),want=q.get('zone');zone.cur=await loadZone(ZONES[want]?want:!q.has('shot')&&ZONES[START_ZONE]?START_ZONE:'basecamp');}
zone.area=areaAt(zone.cur.spawn.x,zone.cur.spawn.z)||Object.keys(zone.cur.areas)[0];
export {STEP,WR,ZONES,ZONETEST,areaAt,blocked,bouncerAt,doorAt,floorAt,groundY,hasHeights,loadZone,overlap,unloadZone,windAt,zone};
