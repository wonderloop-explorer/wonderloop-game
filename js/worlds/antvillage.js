/* 원더룹 세계 설정 — 개미굴(앤트빌리지)  (2026-11-04, 시리즈 공통 틀의 첫 채움)
   ─────────────────────────────────────────────────────────────────────────
   세계 설정 형식 (새 세계 = 이 파일을 복사해 js/worlds/<세계>.js로 두고 칸을 채운 뒤 js/worlds/index.js 목록에 한 줄)
   한 세계 = 이 객체 하나. 공통으로 고정된 것(리본 문구·로고 테두리·그림자·단추 모양·소리 안내·조작법 창 틀)은 js/game/titlescreen.js·controls.js에 있고 여기서 바꾸지 않는다.
     id            세계 이름(영문, 저장·CSS 구분용)
     title         주제 타이틀 글자 (띄어쓰기 = 글자 사이 틈)
     letterColors  글자별 색 목록 (글자보다 짧으면 되풀이). 테두리 #4a2a2a 위에 얹히니 밝은 색으로
     titleDeco     글자 하나에 붙는 상징 장식 1개 + 반복 모션
                   { at: 몇 번째 글자(0부터), svg: '<svg …>' (그 글자 왼쪽 끝이 원점), css: '장식 모양·자리·모션 CSS' }
                   css는 '#wlTitle .wt-deco …'로 시작해 쓴다. 등장은 공통 키프레임 wtDrop을 써도 된다(개미굴 더듬이처럼).
     parade        타이틀 아래 점선 위를 지나가는 작은 상징 아이콘
                   { svg: 아이콘 하나(색은 currentColor), n: 개수, w·h: 크기(px), gap: 사이(CSS 길이), color: 색, sec: 한 번 흐르는 초, hop: 통통 걸음 초 }
     intro         설명 두 줄 [1줄 = 무슨 탈을 쓰고 들어왔는지, 2줄 = 어디를 향해 가는지]
     startColor    시작 단추 색 (글씨는 진갈색 #3e2834 고정 — 밝은 색으로)
     backdrop      배경 루프 — { zone: 시작 공간 구역 이름(js/zones), at: 보는 점 [x,y,z], r: 반지름(rz: 앞뒤 반지름), h: 카메라 높이,
                   bob: [높이 흔들림, 빠르기], speed: 각속도(라디안/초), a0: 시작 각도, sweep: [a,b](벽 있는 방이면 그 사이를 오감 — 없으면 한 바퀴씩),
                   lookUp: [올려다보는 높이, 빠르기, 위상](선택), show: {at:[x,z], az} 탐험 준비 때 원더룹을 세울 자리·카메라 방향 }
     ── 탐험 준비(탐험가 소개) 창 — 새로 시작할 때와 게임 중 '옷 갈아입기'가 같은 창·같은 저장값(localStorage 'wl-look2') ──
     talModel      탈 모양 = 탈 목록(06 HOODS)의 열쇠 (개미굴 'ant' — 얼굴 구멍이 있는 탈은 공통 앞머리·구멍 테가 저절로 맞는다)
     talLabel      창의 탈 칸 이름 ('개미탈')
     talColors     탈 색 목록 [[이름, 겉 색, 테두리 색]…] — 세계마다 따로 저장(w[id].tal)
     guide         창의 게임 설명 {text: 소개 한 단락, goal: 목표 한 줄}
     items         스테이지에서 받는 장식 [{id, name, stage: 몇 번째 스테이지(1~4), at: 다는 자리, shape: 모양 만드는 함수 또는 null}…]
                   받았는지 = 저장 기록 flags[item:<세계 id>:<id>] (items.give) — 받은 것만 고를 수 있고 못 받은 것은 물음표 칸. 처음엔 '없음'만
     map           모험 지도 = 스테이지 4칸 [{name, zone: 그 스테이지 첫 구역(아직 없으면 null)}…] (시리즈 규칙: 한 세계 스테이지 4개, 20~30분)
     music         첫 화면·탐험 준비부터 나오는 배경음 {id, song: 곡(game/music.js 형식)}
     ── 모험 시작 연출·첫 미션 (2026-11-04, 공통 틀 4단계 — game/front openIntro·game/mission) ──
     introNarration  '모험 떠나기' 뒤 이야기 소개 세 단계 [{text, vo, cam}…] — ① 이 세계 소개 ② 원더룹이 왜 왔는지 ③ 게임의 목표
                     text: 화면 아래 카드 글(초당 28자로 써짐), vo: 나레이션 파일 주소(없으면 글자 수만큼 쉼 — 읽어 주기가 켜졌으면 읽어 줌)
                     cam: {at:[x,y,z] 보는 점, r: 반지름(rz: 앞뒤 반지름), h: 카메라 높이, a:[시작 각도, 끝 각도](라디안, 0 = +z쪽), speed: 초당 라디안(개미굴 0.07), bob:[흔들림, 빠르기]}
     firstMission    첫 미션 = 그 세계에서 꼭 필요한 물건 하나 얻기 (시간 제한·실패·점수 없음)
                     { item: {id, name, at:[x,z] 놓인 자리, y: 떠 있는 높이, pickR: 줍는 거리, icon: ()=>그림 주소, model: (THREE,{held})=>Group(원점 = 밑, held면 손에 쥘 크기 — userData.setOn(켜짐)이 있으면 도구 단추로 켜고 끔),
                              tool: {on, off} 도구 단추 글(없으면 단추 없음)},
                       quest: 할 일 안내, popup: {kicker, title, text} 미션 카드, narration: {vo, text} 미션 나레이션,
                       goal: {at:[x,z], label} 민트 빛기둥·동그라미 길이 이어지는 목적지(없으면 item.at), got: {title, text:{key, touch}, vo} 얻었을 때 카드·나레이션, next: 다음 할 일 안내 }
     옷 조합(윗옷·바지 색 + 목도리 색)은 원더룹 자신의 옷이라 세계 설정이 아니라 06 outfitCombos 한 목록·한 저장값(세계가 바뀌어도 그대로)
     controlsNote  조작법 창(공통 틀) 안의 세계 전용 글 — 없으면 그 칸이 빠진다
                   { keys: [[키, 설명]…] (키보드 표의 E 다음에 들어감), talk: 터치 '말 걸기' 설명, touch: [[이름, 설명]…] (터치 표 끝),
                     play: '이렇게 놀아요' 한 단락, heatBefore·heatAfter: '휴대폰이 따뜻해질 때' 목록의 앞·뒤 항목(HTML) }
   ───────────────────────────────────────────────────────────────────────── */
/* 버섯 랜턴(개미굴 makeLantern 그대로 — 줄기·빛나는 민트 갓·손잡이·빛무리). 떠 있을 때 1.8배, 손에 쥘 때 0.85배(개미굴 값) */
let ICON=null;
function ICON_LAMP(){if(ICON)return ICON;const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');
  g.fillStyle='#f2e2cc';g.fillRect(41,48,14,34);g.fillStyle='#bdf7ee';g.beginPath();g.ellipse(48,50,34,26,0,Math.PI,0);g.fill();
  g.fillStyle='#4fd8c8';g.beginPath();g.ellipse(48,50,34,7,0,0,Math.PI);g.fill();g.fillStyle='#ffffff';[[36,36,5],[56,30,4],[62,42,3]].forEach(q=>{g.beginPath();g.arc(q[0],q[1],q[2],0,7);g.fill();});
  return ICON=c.toDataURL();}
function lantern(THREE,{held}){const g=new THREE.Group(),S=held?.85*.62:1.8*.62;g.scale.setScalar(S); // 개미굴 원더룹 키 대비 크기를 이 원더룹 키(약 0.62배)에 맞춤
  const st=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,.32,8),new THREE.MeshLambertMaterial({color:'#f2e2cc'}));st.position.y=.16;g.add(st);
  const capMat=new THREE.MeshStandardMaterial({color:'#8ff0e2',emissive:'#3fd8c8',emissiveIntensity:1,roughness:.8});
  const cap=new THREE.Mesh(new THREE.SphereGeometry(.22,14,8,0,Math.PI*2,0,Math.PI/2),capMat);cap.scale.y=.75;cap.position.y=.3;g.add(cap);
  const hd=new THREE.Mesh(new THREE.TorusGeometry(.12,.02,6,14,Math.PI),new THREE.MeshLambertMaterial({color:'#7a4a32'}));hd.position.y=.44;g.add(hd);
  const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(111,240,224,.9)');gr.addColorStop(1,'rgba(111,240,224,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);
  const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;
  const h=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.9}));h.scale.set(1.7,1.7,1);h.position.y=.3;g.add(h);
  g.userData.setOn=on=>{capMat.emissiveIntensity=on?1:.05;h.visible=on;};return g;}
const ANT_SVG='<svg viewBox="0 0 40 22"><g fill="currentColor"><ellipse cx="9" cy="13" rx="6.5" ry="4.8"/><circle cx="19" cy="12.5" r="3.2"/><circle cx="28.5" cy="11.5" r="4.6"/></g><g stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M30 7.5q2-6 7-5.5M27.5 7.5q0-6 4-7"/><path d="M15.5 15l-3 6M19 15.5v6M22.5 15l3 6"/></g></svg>';
export default {
  id:'antvillage',
  title:'앤트빌리지',
  letterColors:['#ffd46a','#ffb86b','#8fe0c8','#f7a8c0','#ffd46a'],
  titleDeco:{at:0,
    svg:'<svg class="antn" viewBox="0 0 120 80"><g fill="none" stroke="#4a2a2a" stroke-width="7" stroke-linecap="round"><path class="al" d="M44 78 C40 50 22 34 10 22"/><path class="ar" d="M70 78 C76 50 96 34 110 20"/></g><circle class="al" cx="10" cy="20" r="11" fill="#ffd46a" stroke="#4a2a2a" stroke-width="6"/><circle class="ar" cx="110" cy="18" r="11" fill="#ffd46a" stroke="#4a2a2a" stroke-width="6"/></svg>',
    css:`#wlTitle .wt-deco .antn{position:absolute;left:-.12em;top:-.62em;width:1.15em;height:.78em;overflow:visible;pointer-events:none;animation:wtDrop .6s .9s cubic-bezier(.2,1.6,.4,1) both}
#wlTitle .wt-deco .antn .al{transform-origin:44px 78px;animation:antWigL 2.4s ease-in-out infinite}
#wlTitle .wt-deco .antn .ar{transform-origin:70px 78px;animation:antWigR 2.4s .3s ease-in-out infinite}
@keyframes antWigL{50%{transform:rotate(-9deg)}}@keyframes antWigR{50%{transform:rotate(9deg)}}`},
  parade:{svg:ANT_SVG,n:6,w:30,h:17,gap:'2.6rem',color:'#ffe9c2',sec:9,hop:.35},
  intro:['개미탈을 쓰고 몰래 들어온 탐험가 원더룹이','개미굴 가장 깊은 곳을 향해 떠나요'],
  startColor:'#ffd46a',
  /* 개미굴 원본 광장 카메라: 반지름 22·높이 8(±1.5)·초당 0.07라디안, 보는 점 (0,6,-4)에서 가끔 위로 14.
     광장은 아직 이 저장소에 없어(로드맵 7 이식) 그 전까지는 베이스캠프 방을 열린 쪽에서 천천히 오가며 본다 */
  backdrop:{zone:'basecamp',at:[0,1.2,-.2],r:21,h:15,bob:[1.2,.3],speed:.07,sweep:[.25,1.3],
    show:{at:[1.1,2.5],az:.35}}, // 탐험 준비: 원더룹을 세울 자리와 카메라 방향(개미굴도 광장 한쪽 트인 자리로 옮겨 세운다) — 앞을 가리는 소품이 없는 각도
  /* 탐험 준비(탐험가 소개) 창 — 개미굴 #show 그대로(개미탈 4색). 지도는 시리즈 규칙대로 스테이지 4칸 */
  talModel:'ant',talLabel:'개미탈',
  talColors:[['갈색 개미','#a8603f','#7e4229'],['검은 개미','#3e3446','#241d2a'],['황금 개미','#e0a63a','#a8701e'],['풀잎 개미','#6fa65a','#4a7a3c']],
  guide:{text:'개미 마을이 너무 궁금해서 개미탈을 쓰고 몰래 들어온 탐험가 원더룹이에요. 겁은 조금 많지만 발은 누구보다 빨라요.',goal:'개미굴 가장 깊은 곳, 여왕개미의 방까지 가 보기'},
  // 받는 스테이지는 개미굴 이야기 흐름에 맞춰 둔 값(원본은 도감을 다 모으면 둘 다) — 모양은 개미굴 이식 때 단다
  items:[{id:'crown',name:'반짝 왕관',stage:4,at:'head',shape:null},{id:'star',name:'별 핀',stage:3,at:'hood',shape:null}],
  map:[{name:'중앙 광장',zone:null},{name:'식량 저장고',zone:null},{name:'보육실',zone:null},{name:'여왕의 방',zone:null}],
  /* 개미굴 게임 SONGS.title 그대로(96bpm, 현악 패드 + 세모파 베이스 + 뜯는 종 선율 + 첫 박 북) */
  music:{id:'ant-title',song:{name:'앤트빌리지 타이틀',bpm:96,lead:'pluck',noVary:true,
    bars:[41,48,50,46,41,48,50,46].map((r,i)=>{const q=[4,4,3,4,4,4,3,4][i];return {bass:r,pad:[r+24,r+24+q,r+31]};}),
    mel:[[72,null,77,null,79,null,81,null],[79,null,76,null,72,null,null,74],[74,null,77,null,81,79,77,76],[74,null,null,72,74,null,null,null],
         [72,77,79,81,84,null,81,79],[79,null,76,77,79,null,null,null],[77,null,74,null,77,79,81,null],[79,null,77,null,77,null,null,null]],
    parts:{mel:{v:.12},pad:{v:.016},bass:{v:.15,pat:[0,null,null,7,0,null,12,null]},thump:{v:.26,at:[0]},sparkle:{p:.02,v:.04}}}},
  /* 모험 시작 연출 — 개미굴 STORY 세 줄·나레이션 pro1~3 그대로. 카메라는 개미굴 광장 둘레 돌기(초당 0.07라디안)를 베이스캠프 방 열린 쪽에서(광장 이식 때 바꿈) */
  introNarration:[
    {text:'흙냄새 나는 언덕 아래에는 개미들이 사는 커다란 마을, 앤트빌리지가 있대요.',vo:'assets/audio/antvillage/pro1.mp3',cam:{at:[0,1.2,-.2],r:21,h:15,a:[.2,.6],speed:.07,bob:[1.2,.3]}},
    {text:'원더룹은 개미탈을 쓰고 몰래 마을에 들어왔어요. 개미들 눈엔 조금 이상한 아기 개미로 보이겠지만요.',vo:'assets/audio/antvillage/pro2.mp3',cam:{at:[0,1.2,-.2],r:19,h:12,a:[.6,1.0],speed:.07,bob:[1.2,.3]}},
    {text:'목표는 개미굴 가장 깊은 곳, 여왕개미의 방. 하지만 깊은 굴은 아주 어둡고, 어디선가 자꾸 바스락 소리가 난대요…',vo:'assets/audio/antvillage/pro3.mp3',cam:{at:[0,1.2,-.2],r:20,h:14,a:[1.0,1.4],speed:.07,bob:[1.2,.3]}}],
  /* 첫 미션 — 개미굴 광장 '버섯 랜턴을 찾아요' 그대로(카드 문구·나레이션 m_lamp·g_lamp·민트 빛기둥·냄새 길). 자리는 베이스캠프 방 안(광장 이식 때 바꿈) */
  firstMission:{
    item:{id:'lantern',name:'버섯 랜턴',at:[2.8,-1.0],y:1.1,pickR:1.5,icon:()=>ICON_LAMP(),model:lantern,tool:{on:'버섯 랜턴 켜짐',off:'버섯 랜턴 꺼짐'}},
    quest:'광장 어딘가에 떨어진 버섯 랜턴을 찾아요',
    popup:{kicker:'미션',title:'버섯 랜턴을 찾아요',text:'깊은 개미굴은 아주 어두워요. 광장 어딘가에 떨어진 버섯 랜턴을 먼저 찾아보세요. 청록 빛기둥이 솟은 바위 위에 있어요.'},
    narration:{vo:'assets/audio/antvillage/m_lamp.mp3'},
    goal:{label:'버섯 랜턴'},
    got:{title:'버섯 랜턴을 얻었어요!',text:{key:'F 키로 켜고 꺼요',touch:'왼쪽 위 버튼으로 켜고 꺼요'},vo:'assets/audio/antvillage/g_lamp.mp3'},
    next:''}, // 개미굴은 다음이 '광장 개미들과 이야기해요 (0/2)' — 스테이지 내용이라 이식 때
  controlsNote:{
    keys:[['B','자연 도감 열기'],['V','대사 읽어주기 켜고 끄기'],['F','랜턴 켜고 끄기'],['U','메뉴 버튼과 단축키 안내 보이기, 숨기기']],
    talk:'개미나 돋보기 가까이에서 나타나요',
    touch:[['도감','왼쪽 위 노란 버튼'],['랜턴','왼쪽 위 버튼'],['메뉴','오른쪽 위 버튼을 누르면 소리, 읽어주기, 옷 갈아입기 버튼이 나와요']],
    play:'바닥에 반짝이는 점선, 개미들의 냄새 길을 따라가면 다음 목표가 나와요. 둥둥 뜬 돋보기를 살펴보면 자연 도감 카드가 모여요. 개미들과 이야기하며 단서를 모으고, 위험할 땐 대쉬로 피하세요. 경비개미 발밑의 노란 시야에 들어가면 들키니까, 씨앗 더미 뒤에 숨어서 지나가요.',
    heatBefore:['휴대폰에서는 <b>절전 모드</b>가 처음부터 켜져 있어요. 오른쪽 위 메뉴에서 켜짐인지 확인해 주세요.'],
    heatAfter:['손에 뜨겁게 느껴지면 잠시 쉬어 주세요. 다른 앱에 다녀와도 탐험은 그대로 이어지고, 페이지를 닫아도 <b>도감과 비밀 카드</b>는 남아 있어요.']}
};
