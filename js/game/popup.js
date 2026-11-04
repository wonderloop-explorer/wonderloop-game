/* 원더룹 — 팝업·패널 공통 (2026-11-04, 아이폰 사파리에서 조작법·탐험가 소개 창이 손가락으로 안 밀리던 것)
   원인: index.html이 사파리 페이지 확대를 막으려고 모든 요소에 touch-action:none을 건다 → 창 안 글자·단추 위에서 시작한 끌기가 스크롤이 되지 않았다.
   앞으로 만드는 모든 팝업(조작법·탐험가 소개·옷 갈아입기·가방·소개 카드·미션 창 …)은 이 모양을 쓴다:
     <div class="wl-pop">                 화면 전체 덮개(뒤 게임 화면이 터치에 반응하지 않음) — popBackdrop(el, close)면 바깥 어두운 곳을 눌러 닫힘
       <div class="wl-pop-card">          창: 세로로 쌓이고, 높이는 아이폰 주소창(dvh)·안전 영역을 뺀 화면 안
         <div class="wl-pop-body">…</div> 내용만 이 안에서 스크롤(overflow-y:auto, touch-action:pan-y, overscroll-behavior:contain — 안쪽 요소까지)
         <button class="wl-pop-foot">     닫기·'모험 떠나기' 같은 단추: 스크롤과 상관없이 늘 보이게 창 아래에 고정
   덮개 없이 화면 한쪽에 붙는 패널(탐험가 소개 시트)은 .wl-pop-card·.wl-pop-body·.wl-pop-foot만 쓴다.
   열고 닫을 때 popShown(이름, 켜짐) → 하나라도 열려 있으면 body.wl-pop-on: 조이스틱·점프·대쉬·말 걸기·메뉴·도구 단추를 숨기고 누르던 조이스틱·키를 푼다.
   입력칸 글자는 16px 이상(아이폰이 입력할 때 화면을 확대하지 않게). */
const css=`
.wl-pop{position:fixed;inset:0;z-index:40;display:grid;place-items:center;box-sizing:border-box;touch-action:none;overscroll-behavior:contain;
  padding:calc(env(safe-area-inset-top,0px) + 12px) calc(env(safe-area-inset-right,0px) + 12px) calc(env(safe-area-inset-bottom,0px) + 12px) calc(env(safe-area-inset-left,0px) + 12px)}
.wl-pop[hidden]{display:none}
.wl-pop-card{display:flex;flex-direction:column;min-height:0;box-sizing:border-box;
  max-height:calc(100vh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 24px);
  max-height:calc(100dvh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 24px)}
.wl-pop-body{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.wl-pop-body,.wl-pop-body *{touch-action:pan-y}
.wl-pop-foot{flex:none}
.wl-pop input,.wl-pop textarea,.wl-pop select,.wl-pop-card input,.wl-pop-card textarea,.wl-pop-card select{font-size:max(16px,1em)}
body.wl-pop-on #wlJoy,body.wl-pop-on #wlJump,body.wl-pop-on #wlDash,body.wl-pop-on #wlAct,body.wl-pop-on #wlTool,body.wl-pop-on #wlHud{visibility:hidden!important;pointer-events:none!important}`;
let done=false;const open=new Set();const hooks={release:null};
function popCss(){if(done)return;done=true;const st=document.createElement('style');st.dataset.wl='popup';st.textContent=css;document.head.appendChild(st);}
function popShown(key,on){popCss();if(on)open.add(key);else open.delete(key);document.body.classList.toggle('wl-pop-on',open.size>0);
  if(on&&hooks.release)try{hooks.release();}catch(e){}}
/* 덮개 바깥(어두운 곳)을 누르면 close() — 창 안에서 시작해 밖에서 뗀 끌기는 닫지 않는다 */
function popBackdrop(el,close){let down=false;el.addEventListener('pointerdown',e=>{down=e.target===el;});el.addEventListener('click',e=>{if(down&&e.target===el)close();down=false;});}
const popOpen=()=>open.size>0;
export {hooks as popHooks,popBackdrop,popCss,popOpen,popShown};
