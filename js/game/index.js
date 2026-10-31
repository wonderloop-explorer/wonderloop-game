/* 원더룹 — 게임 공통 시스템 묶음 (js/game/)
   core 게임 시간·소리 시점 기록·막힘 / sound 효과음·대사·나레이션 / ui 화면 카드·안내 표시 / dialog 대화·혼잣말 / events 이벤트 줄·트리거 / state 진행 상태 / title 타이틀·엔딩 로고 / codex 도감·숨겨진 비밀·엔딩 / lamps 등불(가짜 빛, 진짜 조명은 가까운 것만) / items 아이템(받기·다음 세계로) / hud 이야기 시계(남은 잎 카운터)
   이 폴더는 three와 서로만 가져다 쓴다(02~08·구역 모듈이 가져다 쓴다). 08이 initGame()으로 장면을 넘기고 매 프레임 updateGame(dt)을 부른다.
   구역을 떠날 때 clearZoneGame()이 그 구역의 NPC·트리거·이벤트 줄을 비운다(02 unloadZone). */
import {clock,cues,tickCore} from './core.js';
import {stopAll,tickNarration} from './sound.js';
import {clearDialog,clickNPC,initDialog,tickDialog} from './dialog.js';
import {clearEvents,initEvents,tickEvents} from './events.js';
import {clearCards,setPrompt,setQuest} from './ui.js';
import {clearSpots,initCodex,tickCodex} from './codex.js';
function initGame(c){initDialog(c);initEvents(c);initCodex(c);}
function updateGame(dt){tickCore(dt);tickEvents();tickDialog();tickNarration();tickCodex();}
function clearZoneGame(){clearDialog();clearEvents();stopAll();clearCards();clearSpots();setQuest('');setPrompt('');}
export {clickNPC,clearZoneGame,clock,cues,initGame,updateGame};
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
