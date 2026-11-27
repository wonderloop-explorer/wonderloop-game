/* 원더룹 — 설정 한곳 (2026-11-27)
   DEV_OPEN_ALL: 개발하는 동안 행성을 하나씩 살펴보기 편하게 — true면 시작 화면에 '장소 고르기'가 늘 보이고 모든 장소(목성 포함)를 잠금 없이 바로 골라 갈 수 있다.
     정식 공개 전에 false로 바꾸면 '처음 하는 사람' 규칙(js/game/front.js openTitle·showPlaces, js/game/places.js placeState):
       · 기록 없음: [시작하기] [조작법] — 달부터 순서대로
       · 하다 만 기록: [이어서 하기] [처음부터] [조작법] — 처음부터는 한 번 더 물음
       · 마지막 장소(목성)까지 다녀옴: [이어서 하기] [장소 고르기] [처음부터] [조작법]
       · 탐험 준비(옷 고르기)의 '모험 지도'·게임 중 메뉴 '탐험 지도'는 다 마치기 전엔 보기만, 지도의 잠금 안내("다른 행성을 모두 다녀오면 열려요")도 이때만 나온다.
   기록 초기화: 주소 끝에 ?reset(또는 &reset)을 붙여 열면 이 브라우저에 저장된 원더룹 기록(진행·가방·발견·옷·설정 — 이름이 'wl-'로 시작하는 것 모두)을 지우고
     reset을 뗀 주소로 다시 연다 → '처음 하는 사람' 상태. (유튜브 녹화 전에 쓴다. 기기마다 따로 해야 한다.) 설명 docs/dev-switch.md */
const SWITCH=true; /* ← 이 값 하나: 개발 중 true, 정식 공개 전에 false */
/* 확인용: 주소에 ?devopen=0(또는 1)을 붙이면 이 값을 그 페이지에서만 바꿔 본다(스위치를 끈 모습을 미리 볼 때) */
export const DEV_OPEN_ALL=(()=>{try{const v=new URLSearchParams(location.search).get('devopen');if(v==='0')return false;if(v==='1')return true;}catch(e){}return SWITCH;})();
try{const u=new URL(location.href);if(u.searchParams.has('reset')){const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('wl-'))ks.push(k);}ks.forEach(k=>localStorage.removeItem(k));
    try{sessionStorage.clear();}catch(e){}u.searchParams.delete('reset');location.replace(u.pathname+(u.searchParams.toString()?'?'+u.searchParams.toString():'')+u.hash);}}catch(e){}
