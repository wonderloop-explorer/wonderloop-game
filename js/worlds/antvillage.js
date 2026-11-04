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
                   lookUp: [올려다보는 높이, 빠르기, 위상](선택) }
     controlsNote  조작법 창(공통 틀) 안의 세계 전용 글 — 없으면 그 칸이 빠진다
                   { keys: [[키, 설명]…] (키보드 표의 E 다음에 들어감), talk: 터치 '말 걸기' 설명, touch: [[이름, 설명]…] (터치 표 끝),
                     play: '이렇게 놀아요' 한 단락, heatBefore·heatAfter: '휴대폰이 따뜻해질 때' 목록의 앞·뒤 항목(HTML) }
   ───────────────────────────────────────────────────────────────────────── */
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
  backdrop:{zone:'basecamp',at:[0,1.2,-.2],r:21,h:15,bob:[1.2,.3],speed:.07,sweep:[.25,1.3]},
  controlsNote:{
    keys:[['B','자연 도감 열기'],['V','대사 읽어주기 켜고 끄기'],['F','랜턴 켜고 끄기'],['U','메뉴 버튼과 단축키 안내 보이기, 숨기기']],
    talk:'개미나 돋보기 가까이에서 나타나요',
    touch:[['도감','왼쪽 위 노란 버튼'],['랜턴','왼쪽 위 버튼'],['메뉴','오른쪽 위 버튼을 누르면 소리, 읽어주기, 옷 갈아입기 버튼이 나와요']],
    play:'바닥에 반짝이는 점선, 개미들의 냄새 길을 따라가면 다음 목표가 나와요. 둥둥 뜬 돋보기를 살펴보면 자연 도감 카드가 모여요. 개미들과 이야기하며 단서를 모으고, 위험할 땐 대쉬로 피하세요. 경비개미 발밑의 노란 시야에 들어가면 들키니까, 씨앗 더미 뒤에 숨어서 지나가요.',
    heatBefore:['휴대폰에서는 <b>절전 모드</b>가 처음부터 켜져 있어요. 오른쪽 위 메뉴에서 켜짐인지 확인해 주세요.'],
    heatAfter:['손에 뜨겁게 느껴지면 잠시 쉬어 주세요. 다른 앱에 다녀와도 탐험은 그대로 이어지고, 페이지를 닫아도 <b>도감과 비밀 카드</b>는 남아 있어요.']}
};
