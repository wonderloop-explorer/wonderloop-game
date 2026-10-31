/* 원더룹 — 게임 공통 시스템 묶음 (js/game/)
   core 게임 시간·소리 시점 기록·막힘 / sound 효과음·대사·나레이션 / ui 화면 카드·안내 표시 / dialog 대화·혼잣말 / events 이벤트 줄·트리거 / state 진행 상태 / title 타이틀·엔딩 로고 / codex 도감·숨겨진 비밀·엔딩 / lamps 등불(가짜 빛, 진짜 조명은 가까운 것만) / items 아이템(받기·다음 세계로) / hud 이야기 시계(남은 잎 카운터) / occlude 원더룹을 가리는 캐릭터를 반투명하게
   이 폴더는 three와 서로만 가져다 쓴다(02~08·구역 모듈이 가져다 쓴다). 08이 initGame()으로 장면을 넘기고 매 프레임 updateGame(dt)을 부른다.
   구역을 떠날 때 clearZoneGame()이 그 구역의 NPC·트리거·이벤트 줄을 비우고 배경음을 서서히 멈춘다(02 unloadZone). */
import {clock,cues,tickCore} from './core.js';
import {bed,stopAll,tickBed,tickNarration} from './sound.js';
import {clearDialog,clickNPC,initDialog,tickDialog} from './dialog.js';
import {clearEvents,initEvents,tickEvents} from './events.js';
import {clearCards,setPrompt,setQuest,tickCut} from './ui.js';
import {clearSpots,initCodex,tickCodex} from './codex.js';
import {clearOcclude,initOcclude,tickOcclude} from './occlude.js';
/* view.camera: 구역 코드가 화면 방향을 알아야 할 때(예: 동행 NPC가 카메라에서 보이는 쪽으로 따라오기) */
const view={camera:null};
function initGame(c){view.camera=c.camera;initDialog(c);initEvents(c);initCodex(c);initOcclude(c);}
function updateGame(dt){tickCore(dt);tickCut();tickEvents();tickDialog();tickNarration();tickBed(dt);tickCodex();tickOcclude(dt);}
function clearZoneGame(){clearDialog();clearEvents();stopAll();bed(null);clearCards();clearSpots();clearOcclude();setQuest('');setPrompt('');}
export {clickNPC,clearZoneGame,clock,cues,initGame,updateGame,view};
export * as core from './core.js';
export * as sound from './sound.js';
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
