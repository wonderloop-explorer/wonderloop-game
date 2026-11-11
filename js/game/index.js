/* 원더룹 — 게임 공통 시스템 묶음 (js/game/)
   core 게임 시간·소리 시점 기록·막힘 / sound 효과음·대사·나레이션 / ui 화면 카드·안내 표시 / dialog 대화·혼잣말 / events 이벤트 줄·트리거 / state 진행 상태 / title 타이틀·엔딩 로고 / codex 도감·숨겨진 비밀·엔딩 / lamps 등불(가짜 빛, 진짜 조명은 가까운 것만) / items 아이템(받기·다음 세계로) / hud 이야기 시계(남은 잎 카운터) / occlude 원더룹을 가리는 캐릭터를 반투명하게 / sky 하늘과 시간 흐름(낮 → 해 질 녘 → 밤) / fx 빛 입자·무리(같은 모델 여러 개) / profile 캐릭터 소개 카드(도감 대신, 처음 이야기한 뒤 한 번) / interact 손으로 하는 상호작용(누르면 걸어가서 손 동작) / course 통과 링(체크포인트) / ride 탈것(정해진 길로 태워 옮기기) / companion 따라오는 동행 / controls 조작(키보드·마우스·휴대폰 조이스틱 — 개미굴 편 그대로)
   이 폴더는 three와 서로만 가져다 쓴다(02~08·구역 모듈이 가져다 쓴다). 08이 initGame()으로 장면을 넘기고 매 프레임 updateGame(dt)을 부른다.
   구역을 떠날 때 clearZoneGame()이 그 구역의 NPC·트리거·이벤트 줄을 비우고 배경음을 서서히 멈춘다(02 unloadZone). */
import {clearReact,initReact,tickReact} from './react.js';
import {clearItemGet,initItemGet,tickItemGet} from './itemget.js';
import {clearStage,initStage,setStageZone,tickStage} from './stage.js';
import {clearStealth,initStealth,setStealthZone,tickStealth} from './stealth.js';
import {clearFinale,initFinale,tickFinale} from './finale.js';
import {clock,cues,tickCore} from './core.js';
import {bed,stopAll,tickBed,tickNarration} from './sound.js';
import {clearDialog,clickNPC,initDialog,setDialogZone,tickDialog,talkNPC} from './dialog.js';
import {clearEvents,initEvents,tickEvents} from './events.js';
import {clearCards,setPrompt,setQuest,tickCut} from './ui.js';
import {clearSpots,initCodex,tickCodex} from './codex.js';
import {clearOcclude,initOcclude,tickOcclude} from './occlude.js';
import {clearInteract,initInteract,tickInteract} from './interact.js';
import {clearCourse,initCourse,tickCourse} from './course.js';
import {clearRide,initRide,tickRide} from './ride.js';
import {clearCompanions,initCompanions,tickCompanions} from './companion.js';
import {clearControls,initControls} from './controls.js';
import {clearProfile,initProfile} from './profile.js';
import {initFront} from './front.js';
import {clearGoal,initGoal,tickGoal} from './goal.js';
import {clearMission,initMission,tickMission} from './mission.js';
import {applyZone as weatherZone} from './weather.js';
import {clearIncident,initIncident,tickIncident} from './incident.js';
import {clearFloat,initFloat,tickFloat} from './float.js';
import {band,initLayout,layoutNow,tickLayout} from './layout.js';
import {speaking,talking} from './dialog.js';
import {uiHooks} from './ui.js';
/* view.camera: 구역 코드가 화면 방향을 알아야 할 때(예: 동행 NPC가 카메라에서 보이는 쪽으로 따라오기)
   view.focus({at:[x,y,z], from:[x,y,z]?, dist, sec}): 따라가기 카메라가 sec초 동안 at을 비췄다가 돌아온다(미션 장소 알려 주기, 2026-11-02).
     from이 없으면 원더룹 쪽에서 dist(기본 7)만큼 떨어져 비스듬히 내려다본다. 들어갈 때·돌아올 때 0.45초씩 부드럽게(08 따라가기 카메라가 섞는다).
   view.hold(fn): fn()이 {at,from}을 돌려주는 동안 그 자리에서 비춘다(짧은 연출 — 이슬방울 따라가기) — null을 돌려주거나 hold(null)이면 원래 카메라로.
   focus·hold는 짧은 연출에만 쓴다. 플레이어가 화면을 끌거나 확대·축소하면 08이 바로 끝내고 지금 자리에서 조작을 넘겨준다.
   view.start({from,at}): 탈것·활공처럼 오래 가는 장면의 처음 각도 — 따라가기 카메라가 0.8초에 걸쳐 from 쪽(at 기준 방향·거리, at이 없으면 원더룹)으로 돌아간 뒤 그대로 둔다.
     그 뒤로는 플레이어가 끌기·두 손가락·휠로 마음대로 돌리고, 손을 떼도 그 각도를 지킨다(카메라 규칙, CLAUDE.md)
   focus는 Promise — 카메라가 원더룹 쪽으로 돌아왔을 때(또는 플레이어가 만져 끝냈을 때·다른 연출로 바뀌었을 때) 끝난다.
   steps(f1, f2, …): 카드·연출을 줄 세우기(2026-11-02 — 사공 대화 뒤 소개 카드·미션 카드·클로버 카메라가 한꺼번에 떠서 카드를 보는 사이 카메라 연출이 지나갔다).
     함수마다 Promise(카드 ui.notice·itemCard·profile.meet, view.focus, dialog.say 등)를 돌려주면 그것이 끝나야 다음을 부른다. 구역을 바꾸면 남은 단계는 버린다. */
let REQ=null,STEPS=0;
const view={camera:null,aim:null,
  get req(){return REQ;},set req(v){const o=REQ;REQ=v;if(o&&o!==v&&o.done)o.done();}, // 끝나거나 바뀌면 앞 연출의 Promise를 끝낸다
  start({from,at=null}){view.aim={from,at,t:0};},
  focus({at,from=null,dist=7,sec=2}){return new Promise(done=>{view.req={at,from,dist,sec,t:0,done};});},
  hold(fn,o){view.req=fn?{fn,t:0,snap:!!(o&&o.snap)}:null;}}; // snap: fn이 지금 카메라 자리에서 시작할 때 — 섞지 않고 바로 그 길로(섞으면 곧은 선으로 질러가 원더룹 머리를 뚫었다, 2026-11-05)
/* 대화 카메라(2026-11-10 — 모든 세계): 등 뒤 카메라 그대로면 상대 얼굴(특히 키 큰 주민)이 원더룹 탈에 가려졌다 → 대화가 시작되면 두 얼굴이 다 보이는 옆 사선으로 부드럽게 옮기고(view.hold),
   끝나면 원래 카메라로. 지금 카메라에 가까운 쪽 옆으로, 원더룹 조금 뒤에서(상대 얼굴 3/4 + 원더룹 옆얼굴), 거리는 둘 사이 거리·상대 키에 맞춰, 세로 화면은 따라가기처럼 멀리.
   플레이어가 카메라를 만지면 08이 연출을 끝내고 넘겨줌(그 대화 동안 다시 잡지 않음). 벽이 있는 방(방 카메라에 가로 범위)·촬영 모드는 하지 않음.
   view.pairCam(root, 머리 높이)는 구역 이야기 장면(혼잣말 줄로 진행하는 대화)이 같은 구도를 쓸 때 — hold에 넘길 함수를 돌려준다 */
let HERO=null,TC=null;const SHOT_Q=new URLSearchParams(location.search).has('shot');
function pairCam(root,headY=1.4){const cam=view.camera,W=HERO;if(!cam||!W||!root)return null;const Z=window.wlZone&&window.wlZone.cur,A=Z&&Z.areas&&Z.areas[window.wlZone.area];if(A&&A.camera&&A.camera.azimuth)return null;
  /* 2026-11-11 다시: 두 사람의 몸 전체(발 ~ 머리 위)가 화면 띠(맨 위 단추 줄 아래 ~ 내려간 대화창 위) 안에 들어오는 가장 가까운 거리 — 키 큰 상대(둥둥)는 저절로 더 멀리.
     방향은 둘을 잇는 선의 옆에서 상대 쪽으로 PHI만큼 돌아간 사선 → 원더룹 얼굴이 옆모습보다 더 보이고(얼굴·카메라 방향 내적 ≈ sin PHI + 여유), 상대는 옆모습.
     (예전엔 '낮은 쪽 얼굴을 화면 위 38%에'를 거리로 풀어서 띠가 좁으면 19m까지 물러났고, 원더룹 조금 뒤에서 봐 탈 뒤통수 쪽이 보였다.)
     옆(왼쪽·오른쪽)은 처음에 한 번 지금 카메라에 가까운 쪽으로 정하고, 자리는 매번 다시 계산(말 걸 때 아직 움직이던 주민을 따라감) */
  const PHI=.3,P=W.position;let side=0,B=null;
  const o={at:[0,0,0],from:[0,0,0]};
  return ()=>{root.updateWorldMatrix(true,false);const e=root.matrixWorld.elements,nx=e[12],ny=e[13],nz=e[14];let ax=nx-P.x,az=nz-P.z;const sep=Math.hypot(ax,az)||1;ax/=sep;az/=sep;
    const mx=(P.x+nx)/2,mz=(P.z+nz)/2;
    if(!side){side=((cam.position.x-mx)*-az+(cam.position.z-mz)*ax)<0?-1:1;
      /* 그쪽 옆에 큰 것(집·큰 바위 — 반지름 0.9m 넘는 둥근 장애물)이 카메라와 두 사람 사이에 서 있으면 반대쪽 옆으로(반대쪽이 트여 있을 때만) */
      const hitN=sd=>{let n=0;const ex=mx+(-az*sd*Math.cos(PHI)+ax*Math.sin(PHI))*9,ez=mz+(ax*sd*Math.cos(PHI)+az*Math.sin(PHI))*9,dx=ex-mx,dz=ez-mz,L2=dx*dx+dz*dz;
        if(Z&&Z.areas)for(const k in Z.areas)for(const ob of Z.areas[k].obstacles||[]){if(!ob.c||ob.c[2]<.9)continue;const [cx,cz,r]=ob.c;if(Math.hypot(cx-nx,cz-nz)<r+.3)continue;const t=Math.min(1,Math.max(.08,((cx-mx)*dx+(cz-mz)*dz)/L2));if(Math.hypot(mx+dx*t-cx,mz+dz*t-cz)<r+.5)n++;}return n;};
      if(hitN(side)>0&&hitN(-side)===0)side=-side;}
    const px=-az*side,pz=ax*side;
    if(!B)B=band(); /* 화면 띠는 말을 걸 때 한 번만(대화창이 비켜 가며 띠가 바뀌면 카메라와 대화창이 서로 밀어냄) */
    const [fT,fB]=B,top=Math.max(P.y+1.6,ny+headY+.18),bot=Math.min(P.y,ny)-.05,asp=cam.aspect,tf=2*Math.tan((cam.fov||30)*Math.PI/360);
    const wide=sep*Math.cos(PHI)+1.5,D=Math.min(19,Math.max(5.2,(top-bot)/(Math.max(.2,fB-fT-.1)*.78*tf),wide/(.88*asp*tf))),my=(top+bot)/2-(.5-((fT+fB)/2-.025))*D*tf; /* 발끝과 대화창 사이에 여유(띠의 5%) — 대화창이 아래에 그대로 있게 */
    const c=Math.cos(PHI),s=Math.sin(PHI);let fx=mx+(px*c+ax*s)*D,fz=mz+(pz*c+az*s)*D;const fy=my+D*.12;
    if(Z&&Z.camRoom){const [rx,rz]=Z.camRoom.c,r=Z.camRoom.r-.5,d=Math.hypot(fx-rx,fz-rz);if(d>r){fx=rx+(fx-rx)/d*r;fz=rz+(fz-rz)/d*r;}}
    o.at[0]=mx;o.at[1]=my;o.at[2]=mz;o.from[0]=fx;o.from[1]=fy;o.from[2]=fz;return o;};}
view.pairCam=pairCam;
function tickTalkCam(){if(SHOT_Q)return;const n=talkNPC();
  if(n&&!TC){TC={n,fn:null};if(!view.req&&n.root&&n.talkCam!==false){const fn=pairCam(n.root,n.bubbleY||1.4);if(fn){TC.fn=fn;view.hold(fn);}}}
  else if(TC&&TC.n!==n){if(TC.fn&&view.req&&view.req.fn===TC.fn)view.hold(null);TC=null;}}
async function steps(...fns){const id=STEPS;for(const f of fns){if(id!==STEPS)return false;try{await f();}catch(e){console.error(e);}}return id===STEPS;}
function initGame(c){view.camera=c.camera;HERO=c.WL||null;initControls(c);initDialog(c);initEvents(c);initCodex(c);initOcclude(c);initInteract(c);initCourse(c);initRide(c);initCompanions(c);initProfile(c);initGoal(c);initMission({...c,view});initIncident({...c,view});initReact({...c,view});initItemGet({...c,view});initStage(c);initStealth(c);initFinale({...c,view});initFloat(c);initLayout(c,{speaking,talking});uiHooks.layout=layoutNow;}
function updateGame(dt){tickCore(dt);tickCut();tickEvents();tickInteract();tickRide(dt);tickCourse();tickDialog(dt);tickTalkCam();tickNarration();tickBed(dt);tickCodex();tickOcclude(dt);tickCompanions(dt);tickMission(dt);tickGoal(dt);tickIncident(dt);tickReact(dt);tickItemGet(dt);tickStealth(dt);tickStage(dt);tickFinale(dt);tickLayout();tickFloat();}
function clearZoneGame(id){STEPS++;setDialogZone(id);view.req=null;view.aim=null;clearControls();clearDialog();clearInteract();clearCourse();clearRide();clearCompanions();clearEvents();stopAll();bed(null);clearCards();clearSpots();clearOcclude();clearProfile();clearMission();clearGoal();clearIncident();clearReact();clearItemGet();clearStage();clearStealth();clearFinale();clearFloat();setQuest('');setPrompt('');}
/* 첫 화면·옷 갈아입기(game/front): 08이 첫 구역을 만든 뒤 startFront({zone, restart}) */
function startFront(o){initFront({ctx:o.ctx,view,zone:o.zone,restart:o.restart,world:o.world});} // world: 지금 세계 설정(js/worlds)
export {enterZone,clickNPC,clearZoneGame,clock,cues,initGame,startFront,steps,updateGame,view};
export * as core from './core.js';
export * as sound from './sound.js';
export * as react from './react.js';
export * as itemget from './itemget.js';
export * as stage from './stage.js';
export * as stealth from './stealth.js';
export * as finale from './finale.js';
export * as travel from './travel.js';
/* 구역에 들어온 뒤(08 — 처음 구역은 initGame 뒤, 그다음은 goZone에서 zoneLook 뒤): 세계 설정 stages[구역 id]의 긴장·감정 구역·스테이지 빛·숨바꼭질을 깐다 */
function enterZone(z,W){setStageZone(z,W);setStealthZone(z,W);}
export * as controls from './controls.js';
export * as ui from './ui.js';
export * as dialog from './dialog.js';
export * as events from './events.js';
export * as state from './state.js';
export * as title from './title.js';
export * as codex from './codex.js';
export * as lamps from './lamps.js';
export * as items from './items.js';
export * as hud from './hud.js';
export * as occlude from './occlude.js';
export * as sky from './sky.js';
export * as fx from './fx.js';
export * as profile from './profile.js';
export * as interact from './interact.js';
export * as course from './course.js';
export * as ride from './ride.js';
export * as companion from './companion.js';
export * as front from './front.js';
export * as goal from './goal.js';
export * as mission from './mission.js';
export * as photo from './photo.js'; // 사진 모드(시리즈 공통 — 08이 initPhoto·cameraTick·render)
export * as weather from './weather.js';
export * as incident from './incident.js';
export * as layout from './layout.js'; // 화면 가림 규칙(2026-11-10) — 글상자·카드·표시 자리, 대화 중 단추 숨김
export * as float from './float.js'; // 3D 자리에 붙는 화면 표시(말풍선·횟수·반짝이 표시 — 2026-11-10) // 사건 연출 공통 처리 — 사건 순간 카메라 show · 굴러가는 물건 scatter
