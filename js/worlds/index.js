/* 원더룹 세계 설정 목록 (시리즈 공통 틀, 2026-11-04) — 세계 하나 = js/worlds/<세계>.js 설정 한 덩어리(형식은 antvillage.js 맨 위 주석).
   CURRENT = 지금 게임이 여는 세계: 주소에 zone이 없으면 그 세계의 시작 공간(backdrop.zone)에서 시작하고 그 세계의 타이틀 화면을 띄운다.
   ?world=<id>로 다른 세계 타이틀을 볼 수 있다. 이 파일은 데이터만 — 아무것도 import하지 않는 설정 파일만 가져온다. */
import antvillage from './antvillage.js';
import space from './infinite-space.js'; // 무한 우주(2026-11-07 1차 — ?world=infinite-space 로만, 기본은 개미굴)
const WORLDS={antvillage,'infinite-space':space};
const want=new URLSearchParams(location.search).get('world');
const CURRENT=WORLDS[want]||WORLDS.antvillage;
export {CURRENT,WORLDS};
