/* 요정의 숲 — 세계 기본값 (설계 메모 wonderloop-studio/fairy-forest/wonderloop_fairy-forest_design.md "세계 규칙")
   이 세계의 구역(① 선착장 ② 공중정원 ③ 장터 ④ 수로·전망대)은 구역 정보에 ...FAIRY_WORLD 를 펼쳐 쓴다.
   상상의 세계에 들어가면 탐험복 그대로 탈만 바꿔 쓰는 규칙(08 zoneLook): 탐험복(분홍 목수건) + 꽃봉오리 탈(닫힘 'bud' → 클라이맥스부터 'bloom').
   나침반은 개미굴 편에서 받아 온 상태로 시작한다. 도감은 넣지 않는다(codex.setup을 부르지 않음 — 성취감은 꽃잎 배지 같은 아이템으로). 대신 주민과 처음 이야기한 뒤 캐릭터 소개 카드 한 번(FAIRY_CARDS, game/profile.js).
   배경음은 코드로 연주하는 곡(music.js) — 구역마다 music:'fairy-…'. 아이템 획득 카드 아이콘은 assets/icons/fairy/<이름>.png(256 투명, 카드가 크림색 동그라미 위에 얹는다). */
import * as G from '../../game/index.js';
import {FAIRY_MUSIC} from './music.js';
G.sound.synth(FAIRY_MUSIC);
export const FAIRY_WORLD={world:'fairy-forest',outfit:'explorer',hood:'bud',start:{compass:true}};
export const icon=id=>`assets/icons/fairy/${id}.png?v=${window.WL_V||''}`;
/* 소개 카드 전신 그림(2D, 투명 배경 webp — 2026-11-02 받은 그림의 정면 모습): 없는 주민은 img:null → 게임 안 전신 렌더링 */
const card=id=>`assets/cards/fairy/${id}.webp?v=${window.WL_V||''}`;
/* 시간별 하늘·빛 (game/sky.js keys — 08 시간 단추 "시간: 낮 / 해 질 녘 / 밤"과 엔진 시간 흐름이 같은 값을 쓴다)
   낮: 따뜻한 오후 파스텔(잎 사이 햇빛 얼룩은 구역이 그린다) · 해 질 녘: 복숭아·분홍 지평선 → 연보라 위, 해가 낮게 깔려 긴 그림자, 버섯등이 하나둘
   밤(첫별): 깊은 남색·보라 하늘에 별. 어둡기만 하지 않게 하늘빛을 푸른 보라로 남기고 보조광을 올려 얼굴이 보이게 — 따뜻한 빛은 구역의 버섯등·반딧불·꽃이 맡는다.
   안개는 가까이(먼 들판·지평선을 흐리게 — 야외의 아늑한 방). 물 색도 구역이 같은 시간 값으로 바꾼다(WATER). */
export const FAIRY_SKY=[
  {top:'#a9d3ea',horizon:'#fbe6c8',hemi:'#fff0d6',ground:'#c9a874',hemiI:.5,sun:'#ffdcaa',sunI:.86,sunDir:[6,-11,5],fill:.24,fog:'#f4e6cc',fogNear:13,fogFar:58,stars:0},
  {top:'#a68ed2',horizon:'#ffbf9c',hemi:'#f9c9b4',ground:'#a8807a',hemiI:.5,sun:'#ffa070',sunI:.62,sunDir:[11,-3.2,3],fill:.22,fog:'#f2b6a6',fogNear:12,fogFar:52,stars:0},
  {top:'#1b1d58',horizon:'#53468c',hemi:'#8a8fe0',ground:'#3c3260',hemiI:.2,sun:'#b9c3ff',sunI:.12,sunDir:[-4,-11,2],fill:.26,fog:'#3b3672',fogNear:10,fogFar:46,stars:1}];
/* 물 색 [낮, 해 질 녘, 밤]: 색·발광 — 연한 파스텔 청록 → 노을빛을 받은 분홍 청록 → 달빛 남색 */
export const WATER=[{c:'#8fdcd3',e:'#4fb5b2',ei:.14},{c:'#e4c3c3',e:'#e09a8c',ei:.2},{c:'#45578f',e:'#5a5cb8',ei:.16}];
/* 캐릭터 소개 카드 (도감 대신 — game/profile.js). img를 채우면 2D 그림, 비우면 게임 안 초상 렌더링. portrait: 얼굴 높이·거리·옆 각도 */
export const FAIRY_CARDS={
  boatman:{name:'사공 요정',intro:'선착장에서 이슬배를 모는 뱃사공. 물길이라면 눈 감고도 알아요.',likes:'바람 없는 아침의 잔잔한 물길',quote:'이슬배는 천천히 가야 제맛이란다!',img:card('boatman'),bg:'#d8e9f6'},
  mushroom:{name:'버섯 요정',intro:'축제 소식을 제일 먼저 알려 주는 마을 안내 요정.',likes:'비 온 다음 날의 축축한 흙',quote:'보이는 건 모자뿐이야. 진짜 내 몸은 땅속에 길게길게 뻗어 있거든!',img:card('mushroom'),bg:'#fbe0c8'},
  strider:{name:'아기 소금쟁이',intro:'물 위 걷기를 연습 중인 수줍은 아기. 아직 가끔 미끄러져요.',likes:'연잎 그늘 아래 조용한 물',quote:'톡톡톡! 물결로 하는 인사, 너도 할 줄 알지?',img:null,bg:'#fbf0bf'}, // 숨겨진 비밀 장면을 마친 뒤 meet('strider', 그 모델)
};
