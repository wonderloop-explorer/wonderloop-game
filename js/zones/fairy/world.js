/* 요정의 숲 — 세계 기본값 (설계 메모 wonderloop-studio/fairy-forest/wonderloop_fairy-forest_design.md "세계 규칙")
   이 세계의 구역(① 선착장 ② 공중정원 ③ 장터 ④ 수로·전망대)은 구역 정보에 ...FAIRY_WORLD 를 펼쳐 쓴다.
   상상의 세계에 들어가면 탐험복 그대로 탈만 바꿔 쓰는 규칙(08 zoneLook): 탐험복(분홍 목수건) + 꽃봉오리 탈(닫힘 'bud' → 클라이맥스부터 'bloom').
   나침반은 개미굴 편에서 받아 온 상태로 시작한다. 도감은 넣지 않는다(성취감은 꽃잎 배지 같은 아이템으로).
   배경음은 코드로 연주하는 곡(music.js) — 구역마다 music:'fairy-…'. 아이템 획득 카드 아이콘은 assets/icons/fairy/<이름>.png(256 투명, 카드가 크림색 동그라미 위에 얹는다). */
import * as G from '../../game/index.js';
import {FAIRY_MUSIC} from './music.js';
G.sound.synth(FAIRY_MUSIC);
export const FAIRY_WORLD={world:'fairy-forest',outfit:'explorer',hood:'bud',start:{compass:true}};
export const icon=id=>`assets/icons/fairy/${id}.png?v=${window.WL_V||''}`;
/* 낮 하늘(콘셉트 그림의 따뜻한 복숭앗빛 오후) — game/sky.js keys */
export const FAIRY_SKY=[
  {top:'#a9cde6',horizon:'#fbe3c6',hemi:'#fff1dc',ground:'#c9a77a',hemiI:.66,sun:'#ffe2b8',sunI:.74,sunDir:[6,-11,5],fill:.24,fog:'#f6e2c9',fogNear:30,fogFar:95,stars:0},
  {top:'#9c90c8',horizon:'#f8bf98',hemi:'#f9cfae',ground:'#a8807a',hemiI:.46,sun:'#ffa775',sunI:.52,sunDir:[11,-4,3],fill:.18,fog:'#efbd9f',fogNear:24,fogFar:85,stars:0},
  {}];
