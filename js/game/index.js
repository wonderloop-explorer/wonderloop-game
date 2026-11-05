/* 원더룹 — 게임 공통 시스템 묶음 (js/game/)
   core 게임 시간·소리 시점 기록·막힘 / sound 효과음·대사·나레이션 / ui 화면 카드·안내 표시 / dialog 대화·혼잣말 / events 이벤트 줄·트리거 / state 진행 상태 / title 타이틀·엔딩 로고 / codex 도감·숨겨진 비밀·엔딩 / lamps 등불(가짜 빛, 진짜 조명은 가까운 것만) / items 아이템(받기·다음 세계로) / hud 이야기 시계(남은 잎 카운터) / occlude 원더룹을 가리는 캐릭터를 반투명하게 / sky 하늘과 시간 흐름(낮 → 해 질 녘 → 밤) / fx 빛 입자·무리(같은 모델 여러 개) / profile 캐릭터 소개 카드(도감 대신, 처음 이야기한 뒤 한 번) / interact 손으로 하는 상호작용(누르면 걸어가서 손 동작) / course 통과 링(체크포인트) / ride 탈것(정해진 길로 태워 옮기기) / companion 따라오는 동행 / controls 조작(키보드·마우스·휴대폰 조이스틱 — 개미굴 편 그대로)
   이 폴더는 three와 서로만 가져다 쓴다(02~08·구역 모듈이 가져다 쓴다). 08이 initGame()으로 장면을 넘기고 매 프레임 updateGame(dt)을 부른다.
   구역을 떠날 때 clearZoneGame()이 그 구역의 NPC·트리거·이벤트 줄을 비우고 배경음을 서서히 멈춘다(02 unloadZone). */
import {clearReact,initReact,tickReact} from './react.js';
import {clock,cues,tickCore} from './core.js';
import {bed,stopAll,tickBed,tickNarration} from './sound.js';
import {clearDialog,clickNPC,initDialog,setDialogZone,tickDialog} from './dialog.js';
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
async function steps(...fns){const id=STEPS;for(const f of fns){if(id!==STEPS)return false;try{await f();}catch(e){console.error(e);}}return id===STEPS;}
function initGame(c){view.camera=c.camera;initControls(c);initDialog(c);initEvents(c);initCodex(c);initOcclude(c);initInteract(c);initCourse(c);initRide(c);initCompanions(c);initProfile(c);initGoal(c);initMission({...c,view});initIncident({...c,view});initReact(c);}
function updateGame(dt){tickCore(dt);tickCut();tickEvents();tickInteract();tickRide(dt);tickCourse();tickDialog();tickNarration();tickBed(dt);tickCodex();tickOcclude(dt);tickCompanions(dt);tickMission(dt);tickGoal(dt);tickIncident(dt);tickReact(dt);}
function clearZoneGame(id){STEPS++;setDialogZone(id);view.req=null;view.aim=null;clearControls();clearDialog();clearInteract();clearCourse();clearRide();clearCompanions();clearEvents();stopAll();bed(null);clearCards();clearSpots();clearOcclude();clearProfile();clearMission();clearGoal();clearIncident();clearReact();setQuest('');setPrompt('');}
/* 첫 화면·옷 갈아입기(game/front): 08이 첫 구역을 만든 뒤 startFront({zone, restart}) */
function startFront(o){initFront({ctx:o.ctx,view,zone:o.zone,restart:o.restart,world:o.world});} // world: 지금 세계 설정(js/worlds)
export {clickNPC,clearZoneGame,clock,cues,initGame,startFront,steps,updateGame,view};
export * as core from './core.js';
export * as sound from './sound.js';
export * as react from './react.js';
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
export * as weather from './weather.js';
export * as incident from './incident.js'; // 사건 연출 공통 처리 — 사건 순간 카메라 show · 굴러가는 물건 scatter
