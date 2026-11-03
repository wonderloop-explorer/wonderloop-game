/* 요정의 숲 — 세계 기본값 (설계 메모 wonderloop-studio/fairy-forest/wonderloop_fairy-forest_design.md "세계 규칙")
   이 세계의 구역(① 선착장 ② 공중정원 ③ 장터 ④ 수로·전망대)은 구역 정보에 ...FAIRY_WORLD 를 펼쳐 쓴다.
   상상의 세계에 들어가면 탐험복 그대로 탈만 바꿔 쓰는 규칙(08 zoneLook): 탐험복(분홍 목수건) + 꽃 화관(봉오리 'crown' → 클라이맥스에 별꽃 보석이 들어가면 'crownBloom', 2026-11-02 꽃봉오리 탈 대신).
   나침반은 개미굴 편에서 받아 온 상태로 시작한다. 도감은 넣지 않는다(codex.setup을 부르지 않음 — 성취감은 꽃잎 배지 같은 아이템으로). 대신 주민과 처음 이야기한 뒤 캐릭터 소개 카드 한 번(FAIRY_CARDS, game/profile.js).
   배경음은 코드로 연주하는 곡(music.js) — 구역마다 music:'fairy-…'. 아이템 획득 카드 아이콘은 assets/icons/fairy/<이름>.png(256 투명, 카드가 크림색 동그라미 위에 얹는다). */
import * as G from '../../game/index.js';
import {FAIRY_MUSIC} from './music.js';
G.sound.synth(FAIRY_MUSIC);
export const FAIRY_WORLD={world:'fairy-forest',outfit:'explorer',hood:'crown',start:{compass:true},front:null,
  bend:{k:.006,d0:8}}; // 둥근 땅(game/bend): 카메라에서 8m 밖부터 아래로 k×(거리−8)² — 톱니 메뉴 '중'이 이 값, 약 ×0.5·강 ×2 // 2026-11-02 꽃봉오리 탈 대신 봉오리 화관 → 클라이맥스에 핀 화관(crownBloom)
/* 게임 첫 화면·스테이지 완료 배지·엔딩 그림(엔진 공통 game/front·ui.stageBadge·title — 2026-11-03). 그림 원본은 wonderloop-studio fairy-forest/ref/match/title-logo.png·stage-badge.png
   front.img: 원본 로고를 리본·큰 제목 두 장으로 나눈 투명 webp(1200×522, 같은 크기로 겹침 — 리본이 먼저 내려오고 큰 제목이 통통), twinkle = 그림 속 별·이슬 자리 [x, y, 지연초](그림 폭·높이 비율).
   img를 null로 두면 title.js 코드 로고(ribbon·logo 글자). ending.img는 STAGE 04 엔딩 로고 자리(아직 없음).
   badge: 완료 배지 그림(1400×416) — box 가운데 크림색 칸 [왼, 위, 오른, 아래], medal 위 꽃 메달 [x, y, 지름](비율) */
const asset=p=>`${p}?v=${window.WL_V||''}`;
export const FAIRY_FRONT={ribbon:'원더룹의 대모험',logo:'요정의 숲 탐방',sub:'요정들의 첫별 축제에 놀러 가요',
  img:{ribbon:asset('assets/titles/fairy/title-ribbon.webp'),logo:asset('assets/titles/fairy/title-logo.webp'),w:1200,h:522,
    twinkle:[[.4625,.425,0],[.963,.544,1.4],[.428,.468,2.6],[.649,.808,3.3],[.373,.913,.8]]},
  itemIcons:{umbrella:asset('assets/icons/fairy/umbrella.png')}, // 왼쪽 위 받은 물건 칩 아이콘(game/front) — 나침반은 기본 SVG
  // 첫 화면 소개 두 줄(개미굴 .sub)·탐험가 소개 패널·모험 떠나기 전 이야기 소개(개미굴 #show·#story — 2026-11-03)
  intro:'꽃 화관을 쓰고 요정 마을에 온 탐험가 원더룹이\n첫별 축제가 열리는 별꽃 전망대로 떠나요',
  explorer:{bio:'요정 마을의 첫별 축제가 너무 궁금해서 꽃 화관을 쓰고 찾아온 탐험가 원더룹이에요. 처음 보는 건 꼭 손으로 만져 봐요.',
    goal:'첫별이 뜨는 밤, 별꽃 전망대의 축제까지 가 보기',
    deco:{label:'화관',list:[{name:'봉오리 화관',hood:'crown'},{name:'활짝 핀 화관',hood:'crownBloom',flag:'gem',lock:'별꽃 전망대에서 첫별이 뜨면 열려요'}]},
    map:[['이슬방울 선착장','fairy-dock'],['민들레 공중정원',null],['버섯 장터',null],['별꽃 전망대',null]]},
  story:['숲속 아주 깊은 곳, 커다란 클로버와 연잎 사이에 작은 요정들의 마을이 있대요.',
    '오늘 밤은 일 년에 한 번, 별꽃 전망대에서 첫별 축제가 열리는 날이에요.',
    '첫 번째 길은 이슬방울 선착장. 이슬배를 타야 강 건너 마을로 갈 수 있어요.'],
  play:'바닥에 반짝이는 동그라미 길과 빛 기둥을 따라가면 다음 목표가 나와요. 위 가운데 안내의 화살표도 가야 할 쪽을 가리켜요. 요정들과 이야기하며 부탁을 들어주고, 받은 물건과 만난 친구는 왼쪽 위 가방에 모여요. 어딘가 금빛으로 반짝이는 곳에는 숨겨진 비밀이 있어요.',
  // 탐험 가방(game/front — 왼쪽 위 '가방' 단추, B 키): 받은 물건·만난 친구·숨겨진 비밀을 도감처럼 한 창에. 아직 못 받은 것은 ??? + 어디서
  bag:{title:'탐험 가방 · 요정의 숲',
    items:[{id:'compass',name:'더듬이 나침반',f:'개미굴 여왕개미에게 받은 나침반. 가야 할 쪽을 바늘로 살짝 알려 줘요.',where:'개미굴'},
      {id:'umbrella',name:'민들레 솜털 우산',f:'사공 요정의 선물. 뛰어내리거나 떨어질 때 펼쳐져 사뿐히 내려와요.',where:'이슬방울 선착장'},
      {id:'badge',name:'???',where:'민들레 공중정원'},{id:'can',name:'???',where:'버섯 장터'},{id:'gem',name:'???',where:'별꽃 전망대'}],
    friends:['boatman','mushroom'],secrets:[{id:'strider',where:'이슬방울 선착장'},{id:'ladybug',where:'이슬방울 선착장'}]},
  help:[['탈것','가까이 가면 생기는 단추(E)로 타요 · 타는 동안에도 카메라는 돌릴 수 있어요'],['민들레 우산','받은 뒤에는 점프하거나 높은 데서 떨어질 때 저절로 펼쳐져 천천히 내려와요']],
  ending:{img:null}};
export const FAIRY_BADGE={img:asset('assets/ui/fairy/stage-badge.webp'),box:[.128,.414,.868,.893],medal:[.4992,.2153,.13],ar:1400/416};
export const icon=id=>`assets/icons/fairy/${id}.png?v=${window.WL_V||''}`;
/* 소개 카드 전신 그림(2D, 투명 배경 webp — 2026-11-02 받은 그림의 정면 모습): 없는 주민은 img:null → 게임 안 전신 렌더링 */
const card=id=>`assets/cards/fairy/${id}.webp?v=${window.WL_V||''}`;
/* 시간별 하늘·빛 (game/sky.js keys — 08 시간 단추 "시간: 낮 / 해 질 녘 / 밤"과 엔진 시간 흐름이 같은 값을 쓴다)
   낮: 따뜻한 오후 파스텔(잎 사이 햇빛 얼룩은 구역이 그린다) · 해 질 녘: 복숭아·분홍 지평선 → 연보라 위, 해가 낮게 깔려 긴 그림자, 버섯등이 하나둘
   밤(첫별): 깊은 남색 하늘에 별과 옅은 은하수(milky). 땅·풀·잎은 푸른 초록으로 차분하게 — 하늘빛을 푸른 청록으로, 달빛(sun)은 옆에서 낮게 비춰 가장자리에만 옅은 푸른 빛.
     따뜻한 빛은 구역의 버섯등 아래 빛 웅덩이·반딧불·꽃이 맡는다(장면 전체 따뜻한 주변광은 줄임 — 초록이 올리브빛으로 탁해졌다, 2026-11-03).
   낮(2026-11-03): 해를 조금 줄여(0.86 → 0.8) 흰 소품·디딤돌이 순백으로 날아가지 않게.
   안개는 가까이(먼 들판·지평선을 흐리게 — 야외의 아늑한 방). 물 색도 구역이 같은 시간 값으로 바꾼다(WATER). */
export const FAIRY_SKY=[
  {top:'#a9d3ea',horizon:'#fbe6c8',hemi:'#fff0d6',ground:'#c9a874',hemiI:.5,sun:'#ffd9a8',sunI:.8,sunDir:[6,-11,5],fill:.24,fog:'#f4e6cc',fogNear:13,fogFar:58,stars:0},
  {top:'#a68ed2',horizon:'#ffbf9c',hemi:'#f9c9b4',ground:'#a8807a',hemiI:.5,sun:'#ffa070',sunI:.62,sunDir:[11,-3.2,3],fill:.22,fog:'#f2b6a6',fogNear:12,fogFar:52,stars:0},
  {top:'#141d4c',horizon:'#3b4a84',hemi:'#7fa8e8',ground:'#2a5258',hemiI:.27,sun:'#a9c8ff',sunI:.2,sunDir:[-9,-7,3],fill:.2,fog:'#2c3c68',fogNear:10,fogFar:46,stars:1,milky:.55}];
/* 물 색 [낮, 해 질 녘, 밤]: 색·발광 — 연한 파스텔 청록 → 노을빛이 비친 복숭아빛 청록 → 깊은 청록(가운데는 남색으로 — 구역이 물길 가운데·가장자리 그러데이션) */
export const WATER=[{c:'#8fdcd3',e:'#4fb5b2',ei:.14},{c:'#8cbcb8',e:'#f0a088',ei:.22},{c:'#2e7488',e:'#25607e',ei:.2}];
/* 캐릭터 소개 카드 (도감 대신 — game/profile.js). img를 채우면 2D 그림, 비우면 게임 안 초상 렌더링. portrait: 얼굴 높이·거리·옆 각도 */
export const FAIRY_CARDS={
  boatman:{name:'사공 요정',intro:'선착장에서 이슬배를 모는 뱃사공. 물길이라면 눈 감고도 알아요.',likes:'바람 없는 아침의 잔잔한 물길',quote:'이슬배는 천천히 가야 제맛이란다!',img:card('boatman'),bg:'#d8e9f6'},
  mushroom:{name:'버섯 요정',intro:'축제 소식을 제일 먼저 알려 주는 마을 안내 요정.',likes:'비 온 다음 날의 축축한 흙',quote:'보이는 건 모자뿐이야. 진짜 내 몸은 땅속에 길게길게 뻗어 있거든!',img:card('mushroom'),bg:'#fbe0c8'},
  strider:{name:'아기 소금쟁이',intro:'물 위 걷기를 연습 중인 수줍은 아기. 아직 가끔 미끄러져요.',likes:'연잎 그늘 아래 조용한 물',quote:'톡톡톡! 물결로 하는 인사, 너도 할 줄 알지?',img:null,bg:'#fbf0bf',secret:true,portrait:{side:.5,lift:.9}}, // 숨겨진 비밀 장면을 마친 뒤 meet('strider', 그 모델)
  ladybug:{name:'낮잠 무당벌레',intro:'축제 전에 클로버 그늘에서 한숨 자 두는 중. 깨면 바로 날아갈 수 있어요.',likes:'햇볕 든 클로버 잎 뒤',quote:'음냐… 첫별 뜨면 깨워 줘…',img:null,bg:'#fbd9d2',secret:true,portrait:{side:.5,lift:.8}},
};
FAIRY_WORLD.front=FAIRY_FRONT; // 게임 첫 화면(game/front)
FAIRY_WORLD.badge=FAIRY_BADGE; // 스테이지 완료 배지(ui.stageBadge) — 구역 정보에서도 보이게
