/* 원더룹 — 게임 첫 화면(타이틀)·옷 갈아입기·오른쪽 위 구석 단추 (엔진 공통, 2026-11-03 — 개미굴 게임 #intro·#show·#wardBtn·#howMenu를 옮김)
   세계마다 세계 기본값(world.js)에 front:{ribbon, logo, sub, img:{ribbon, logo, w, h, twinkle:[[x,y,지연]…]} | null, deco, help:[[이름,설명]…], ending:{img:null}} 를 둔다.
   - 타이틀: 게임을 열면(촬영 모드·?notitle 빼고) 첫 구역을 만든 채로 그 위에 덮는다. img가 있으면 그림 두 장(리본이 먼저 내려오고 → 큰 제목이 통통),
     없으면 title.js 코드 로고(logoEl). 그 뒤로 아주 느리게 숨쉬듯 살랑. 그림 둘레에 반짝이·꽃잎이 천천히, 그림 속 별·이슬 자리(twinkle)가 가끔 반짝(모두 HTML — 3D 그리기 0회).
     뒤 배경은 그 구역을 천천히 돌아보는 카메라(구역 정보 titleView:{at,r,h,speed} — view.hold, 낮). 열려 있는 동안 core.block('front') → 나침반 연출·이벤트·말 걸기는 기다린다.
     진행 기록(state.flags)이 있으면 '이어서 하기'·'처음부터'(한 번 더 확인 → 진행을 지우고 첫 구역을 다시 만든다), 없으면 '시작하기'. 누르면 화면 전환(ui.transition)으로 원더룹 뒤 카메라로.
     처음 시작할 때 한 번은 조작법(controls.showHelp)을 보여 준다(localStorage 'wl-help-seen'). 소리는 첫 누르기 때 깨어난다(sound 소리 깨우기 그대로).
   - 옷 갈아입기(개미굴 옷장과 같은 방식·같은 모양): 오른쪽 패널(휴대폰은 아래 시트) — 옷(평상복·탐험복)·머리(세 가지)·표정 미리보기.
     카메라가 원더룹 앞으로 오고, 화면을 끌면 원더룹이 돈다. 고른 옷·머리는 localStorage 'wl-look'(새로고침 뒤에도) — 08 zoneLook이 세계 옷 다음에 입힌다(applyLook).
     세계 탈(화관 등)은 건드리지 않는다. 첫 화면 단추·게임 중 오른쪽 위 단추·C 키로 연다. 대화·카드·탈것·공중에서는 열지 않는다.
   - 오른쪽 위 구석 단추: '옷 갈아입기'·'조작법'(controls 도움말 열고 닫기). 안내 표시(wl-hint)라 영상 캡처에는 안 나온다.
   톱니 메뉴의 옷·머리·표정 단추는 시험용으로 그대로 둔다(촬영 도구가 누른다) — 플레이어용은 이것 하나.
   2026-11-03 개미굴 흐름으로: 첫 화면(로고·소개 두 줄·새로 시작|조작법·소리 안내) → 탐험가 소개 패널(옷 갈아입기 창이 이것 — 이름·소개·목표·색·화관·표정·모험 지도) → 이야기 소개(front.story) → 게임.
   왼쪽 위는 받은 물건 칩 대신 '가방' 단추 하나 → 탐험 가방 창(front.bag — 받은 물건·만난 친구·숨겨진 비밀). 시간대는 열 때마다 무작위(startTime). */
import {block,blocking} from './core.js';
import {setMuted,sfx,soundSettings} from './sound.js';
import {cardShown,setHints,toast,transition} from './ui.js';
import {controlHooks,helpShown,input,setHelpExtra,setHelpNote,showHelp} from './controls.js';
import {cards as profCards,pic,seen} from './profile.js';
import {flags,onFlag,resetAll} from './state.js';
import {ITEMS} from './items.js';
import {logoEl} from './title.js';
import {icon,mk,setIcons,setTheme,tape} from './felt.js';
import {backdropAt,render as renderTitle} from './titlescreen.js';
const Q=new URLSearchParams(location.search),SHOT=Q.has('shot'),NO=SHOT||Q.has('notitle');
const coarse=matchMedia('(pointer:coarse)').matches;
const LOOK_KEY='wl-look2',HELP_KEY='wl-help-seen';
const store={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}}};
const css=`
#wlFront{position:fixed;inset:0;z-index:30;display:none;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box;overflow-y:auto;
  padding:calc(env(safe-area-inset-top,0px) + 3vh) calc(env(safe-area-inset-right,0px) + 16px) calc(env(safe-area-inset-bottom,0px) + 3vh) calc(env(safe-area-inset-left,0px) + 16px);
  background:radial-gradient(ellipse 60% 45% at 50% 48%,rgba(30,14,36,.42) 0%,rgba(30,14,36,.18) 60%,rgba(30,14,36,0) 100%),radial-gradient(ellipse at 50% 55%,rgba(30,14,36,0) 35%,rgba(30,14,36,.55) 100%)}
#wlFront.on{display:flex}
#wlFront .top{display:flex;flex-direction:column;align-items:center;width:100%;text-align:center;color:#fff6e6}
#wlFront .art{position:relative;width:min(100%,58vh,640px)}
@media (orientation:landscape){#wlFront .art{width:min(60vw,78vh,820px)}}
/* 큰 제목 그림이 자리(높이)를 잡고 리본 그림은 그 위에 겹친다 — 높이를 aspect-ratio에만 맡기면 일부 사파리에서 0이 되어 로고가 안 보일 수 있다 */
#wlFront .art img{display:block;width:100%;height:auto;pointer-events:none;user-select:none;-webkit-user-select:none}#wlFront .art img.rib{position:absolute;left:0;top:0}
#wlFront .rib{transform-origin:50% 70%;animation:wlfDrop .8s cubic-bezier(.2,1.25,.4,1) both,wlfSway 7s ease-in-out 1.4s infinite}
#wlFront .logo{transform-origin:50% 72%;animation:wlfPop .95s ease-out .4s both,wlfBreath 5.5s ease-in-out 1.6s infinite}
#wlFront .tw{position:absolute;left:calc(var(--x) * 100%);top:calc(var(--y) * 100%);width:9%;aspect-ratio:1;transform:translate(-50%,-50%) scale(0);opacity:0;pointer-events:none;
  background:radial-gradient(circle,rgba(255,252,228,.95) 0 14%,rgba(255,226,140,.5) 32%,rgba(255,226,140,0) 66%);animation:wlfTw 4.2s ease-in-out var(--d) infinite}
#wlFront .tw::after{content:"";position:absolute;inset:22%;background:#fffbe6;clip-path:polygon(50% 0,58% 42%,100% 50%,58% 58%,50% 100%,42% 58%,0 50%,42% 42%)}
#wlFront .fl{position:absolute;left:var(--x);top:var(--y);pointer-events:none;opacity:0;animation:wlfFloat var(--t) ease-in-out var(--d) infinite}
#wlFront .fl.p{width:1.7%;aspect-ratio:1/1.45;background:#f7b6c6;border-radius:50% 50% 50% 50%/62% 62% 38% 38%;box-shadow:inset -1px -2px 0 rgba(200,110,130,.35)}
#wlFront .fl.s{width:2.6%;aspect-ratio:1;background:#ffe9a6;clip-path:polygon(50% 0,58% 42%,100% 50%,58% 58%,50% 100%,42% 58%,0 50%,42% 42%);filter:drop-shadow(0 0 3px rgba(255,230,150,.9))}
/* 첫 화면 아래(개미굴 #intro와 같게): 소개 두 줄 → 단추(새로 시작·조작법) → 소리 안내 */
#wlFront .sub{margin:.4rem 0 1.3rem;line-height:1.65;font-family:"Gowun Dodum",sans-serif;font-size:clamp(.98rem,2.2vh,1.12rem);white-space:pre-line;word-break:keep-all;text-shadow:0 2px 8px rgba(30,14,36,.85),0 0 2px rgba(30,14,36,.6);animation:wlfFade .8s ease 1.2s both}
#wlFront .btns{display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;animation:wlfFade .6s ease 1.35s both}
#wlFront .go{border:0;border-radius:14px;background:#ffd46a;color:#3e2834;font:inherit;font-family:"Gowun Dodum",sans-serif;font-size:1.15rem;padding:.8rem 1.7rem;cursor:pointer;box-shadow:0 5px 0 #b8743f;min-height:48px}
#wlFront .go:active{transform:translateY(3px);box-shadow:0 2px 0 #b8743f}
#wlFront .gh{border:2px solid rgba(255,246,230,.85);background:rgba(30,14,36,.3);color:#fff6e6;border-radius:14px;font:inherit;font-family:"Gowun Dodum",sans-serif;font-size:1.05rem;padding:.7rem 1.3rem;cursor:pointer;min-height:48px}
@media (max-width:520px){#wlFront .sub{font-size:min(3.9vw,1rem)}#wlFront .tip .sep{display:block;height:0;overflow:hidden}} /* 휴대폰 세로: 소개 두 줄이 그대로 두 줄, 소리 안내는 두 줄로 */
#wlFront .tip{margin:1rem 0 0;font-family:"Gowun Dodum",sans-serif;font-size:.88rem;opacity:.9;word-break:keep-all;text-shadow:0 2px 8px rgba(30,14,36,.8);animation:wlfFade .6s ease 1.5s both}
#wlFront .ask{position:relative;width:min(20rem,100%);box-sizing:border-box;padding:1.1rem 1.1rem 1.15rem;text-align:center;margin-top:1rem;background:#fff6ea;color:#3e2834;border-radius:18px;box-shadow:0 18px 50px rgba(30,14,36,.45)}
#wlFront .ask p{margin:0 0 .85rem;line-height:1.55;font-family:"Gowun Dodum",sans-serif;font-size:1.02rem;word-break:keep-all}
#wlFront .ask .row{display:flex;gap:.5rem}#wlFront .ask .row button{flex:1;border:0;border-radius:12px;font:inherit;font-family:"Gowun Dodum",sans-serif;font-size:1rem;padding:.6rem .5rem;min-height:46px;cursor:pointer;background:rgba(127,90,96,.14);color:#3e2834}
#wlFront .ask .row .yes{background:#3f9fa0;color:#fffaf2}
#wlFront[data-ask] .btns,#wlFront[data-ask] .tip{display:none}#wlFront:not([data-ask]) .ask{display:none}
@keyframes wlfDrop{from{opacity:0;transform:translateY(-22%)}to{opacity:1;transform:none}}
@keyframes wlfPop{0%{opacity:0;transform:scale(.55)}50%{opacity:1;transform:scale(1.08)}75%{transform:scale(.97)}100%{opacity:1;transform:scale(1)}}
@keyframes wlfBreath{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.012) rotate(-.35deg)}}
@keyframes wlfSway{0%,100%{transform:rotate(0)}50%{transform:rotate(.5deg) translateY(.5%)}}
@keyframes wlfTw{0%,64%,100%{transform:translate(-50%,-50%) scale(0) rotate(0);opacity:0}76%{transform:translate(-50%,-50%) scale(1) rotate(25deg);opacity:1}88%{transform:translate(-50%,-50%) scale(.35) rotate(45deg);opacity:.5}}
@keyframes wlfFloat{0%{opacity:0;transform:translate(0,-12px) rotate(0)}18%{opacity:.95}82%{opacity:.85}100%{opacity:0;transform:translate(var(--dx),70px) rotate(200deg)}}
@keyframes wlfFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){#wlFront *,#wlStory *,#wlBag *{animation:none!important}#wlFront .tw,#wlFront .fl{display:none}#wlFront .art img,#wlFront .sub,#wlFront .btns,#wlFront .tip{opacity:1}}
#wlWard{position:fixed;top:0;right:0;bottom:0;width:min(23rem,100vw);z-index:31;display:none;flex-direction:column;box-sizing:border-box;
  padding:calc(env(safe-area-inset-top,0px) + 14px) calc(env(safe-area-inset-right,0px) + 14px) calc(env(safe-area-inset-bottom,0px) + 14px) 14px}
#wlWard.on{display:flex}
/* 창 안 내용(.body)만 스크롤, '다 골랐어요'는 창 맨 아래에 따로(내용과 겹치지 않게) */
/* 탐험가 소개(개미굴 #show .panel과 같은 모양·순서, 2026-11-03): 탐험가 소개 꼬리표 → 이름 → 소개 → 목표 → 조끼·목수건 색 → 화관 → 표정 → 모험 지도 → 모험 떠나기.
   내용(.body)만 스크롤, 아래 단추는 늘 보이게. 늘 크림색 바탕 + 진갈색 글자 */
#wlWard .panel{display:flex;flex-direction:column;min-height:0;max-height:100%;box-sizing:border-box;background:#fff6ea;color:#3e2834;border-radius:22px;padding:1.2rem 1.2rem 1.1rem;box-shadow:0 18px 50px rgba(30,14,36,.45);font-family:"Gowun Dodum",sans-serif;word-break:keep-all;color-scheme:light}
#wlWard .body{flex:1;min-height:0;overflow-y:auto;margin:0 -.4rem;padding:0 .4rem .2rem}
@media (max-width:760px){#wlWard{top:auto;left:0;width:100%;max-height:56vh;padding-left:calc(env(safe-area-inset-left,0px) + 14px)}}
#wlWard .k{margin:0;display:inline-block;background:#f2b63c;color:#3e2834;border-radius:999px;padding:.15rem .7rem;font-size:.85rem}
#wlWard .namel{display:block;font-size:.85rem;color:#75565e;margin:.7rem 0 .25rem}
#wlWard input{width:100%;box-sizing:border-box;font:inherit;font-size:1.25rem;padding:.5rem .7rem;border-radius:12px;border:2px solid #3f9fa0;background:transparent;color:#3e2834}
#wlWard .bio{margin:.7rem 0;line-height:1.6;color:#75565e;font-size:.95rem}
#wlWard .goal{background:rgba(242,182,60,.18);border-radius:12px;padding:.6rem .75rem;line-height:1.5;font-size:.95rem}
#wlWard .goal span{display:inline-block;background:#f2b63c;color:#3e2834;border-radius:999px;padding:.05rem .55rem;margin-right:.4rem;font-size:.8rem}
#wlWard .lab{margin:.9rem 0 .35rem;font-size:.85rem;color:#75565e}
#wlWard .opts{display:flex;flex-wrap:wrap;gap:.4rem}
#wlWard .opts button{border:2px solid transparent;background:rgba(127,90,96,.12);color:#3e2834;font:inherit;font-size:.92rem;padding:.4rem .75rem;min-height:40px;border-radius:999px;cursor:pointer;display:flex;align-items:center;gap:.35rem;white-space:nowrap}
#wlWard .opts button[aria-pressed="true"]{border-color:#3f9fa0;background:rgba(63,159,160,.16)}
#wlWard .opts button:disabled{opacity:.55;cursor:default}
#wlWard .dot{width:14px;height:14px;border-radius:50%;flex:none;box-shadow:inset 0 0 0 1px rgba(62,40,52,.18)}
#wlWard .acclock{margin:.35rem 0 0;font-size:.8rem;color:#75565e}
#wlWard .map{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:.3rem;counter-reset:z}
#wlWard .map li{counter-increment:z;font-size:.85rem;padding:.3rem .6rem;border-radius:999px;background:rgba(127,90,96,.12);color:#75565e}
#wlWard .map li::before{content:counter(z) ". "}#wlWard .map li.on{background:rgba(63,159,160,.18);color:#3e2834}#wlWard .map li:not(.on)::after{content:" · 준비 중";font-size:.75rem}
#wlWard .spin{display:flex;gap:.5rem;margin-top:.9rem}#wlWard .spin button{flex:1;border:2px solid #3f9fa0;background:transparent;color:#3e2834;border-radius:12px;font:inherit;font-size:.92rem;padding:.4rem;min-height:40px;cursor:pointer}
#wlWard .done{flex:none;display:block;width:100%;text-align:center;box-sizing:border-box;margin-top:1rem;border:0;border-radius:14px;background:#3f9fa0;color:#fffaf2;font:inherit;font-size:1.05rem;padding:.8rem 1.6rem;min-height:48px;cursor:pointer}
/* 모험 떠나기 전 이야기 소개(개미굴 #story): 화면 아래 가운데 카드, 건너뛰기·다음, 점 */
#wlStory{position:fixed;inset:0;z-index:31;display:none;place-items:end center;padding:1rem 1rem calc(env(safe-area-inset-bottom,0px) + 3.5rem);box-sizing:border-box;background:linear-gradient(180deg,rgba(30,14,36,0) 35%,rgba(30,14,36,.6))}
#wlStory.on{display:grid}
#wlStory .scard{width:min(34rem,100%);background:#fff6ea;color:#3e2834;border-radius:22px;padding:1.4rem 1.4rem 1.1rem;box-shadow:0 18px 50px rgba(30,14,36,.5);box-sizing:border-box;font-family:"Gowun Dodum",sans-serif;color-scheme:light;animation:wlfFade .4s ease both}
#wlStory .stext{margin:0 0 1rem;font-size:1.15rem;line-height:1.75;min-height:5.3em;word-break:keep-all}
#wlStory .sbtns{display:flex;justify-content:flex-end;gap:.5rem}
#wlStory button{text-align:center;border-radius:14px;font:inherit;font-size:1.02rem;padding:.75rem 1.4rem;cursor:pointer;min-height:48px}
#wlStory .next{border:0;background:#3f9fa0;color:#fffaf2}#wlStory .skip{border:2px solid #3f9fa0;background:transparent;color:#3e2834}
#wlStory .dots{display:flex;gap:.35rem;justify-content:center;margin-top:.8rem}#wlStory .dots i{width:7px;height:7px;border-radius:50%;background:rgba(127,90,96,.35)}#wlStory .dots i.on{background:#3f9fa0}
/* 탐험 가방(개미굴 자연 도감 창 #dex와 같은 모양): 받은 물건·만난 친구·✦ 숨겨진 비밀을 카드로. 아직 없는 것은 ??? + 어디서 */
#wlBag{position:fixed;inset:0;z-index:33;display:none;place-items:center;padding:1rem;box-sizing:border-box;background:rgba(30,14,36,.5)}
#wlBag.on{display:grid}body.wl-bag-on #wlHud{visibility:hidden} /* 가방이 열린 동안 구석 단추(메뉴)가 창 위에 겹치지 않게 */
#wlBag{padding:calc(env(safe-area-inset-top,0px) + 1rem) 1rem calc(env(safe-area-inset-bottom,0px) + 1rem)}
#wlBag .hcard{width:min(40rem,100%);max-height:calc(100dvh - 2rem);display:flex;flex-direction:column;background:#fff6ea;color:#3e2834;border-radius:22px;padding:1.3rem 1.3rem 1.1rem;box-sizing:border-box;box-shadow:0 18px 50px rgba(30,14,36,.5);font-family:"Gowun Dodum",sans-serif;color-scheme:light;word-break:keep-all;animation:wlfFade .3s ease both}
#wlBag .dhead{display:flex;justify-content:space-between;align-items:baseline;gap:.6rem;flex-wrap:wrap;margin-bottom:.6rem}
#wlBag h2{margin:0;font-family:"Jua",sans-serif;font-weight:400;font-size:1.5rem}#wlBag .cnt{margin:0;font-size:.9rem;color:#75565e}
#wlBag .grid{flex:1;min-height:0;overflow-y:auto;margin:0 -.3rem;padding:0 .3rem}
#wlBag .sec{margin:.9rem 0 .5rem;font-family:"Jua",sans-serif;font-size:1.1rem;color:#75565e}#wlBag .sec.gold{color:#b07a12}
#wlBag .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(10.5rem,1fr));gap:.6rem}
#wlBag .dx{border:3px solid transparent;border-radius:16px;padding:.8rem .8rem .9rem;background:rgba(127,90,96,.08);text-align:left}
#wlBag .dx.got{border-color:#e3ad35;background:rgba(242,182,60,.12)}#wlBag .dx.secret.got{background:linear-gradient(170deg,#fffaea,#ffeab8);box-shadow:0 0 14px rgba(255,196,70,.45)}
#wlBag .dx .ic{display:grid;place-items:center;width:84px;height:84px;margin:0 auto .5rem;border-radius:50%;background:#fbefd6;overflow:hidden}
#wlBag .dx.secret.got .ic{box-shadow:0 0 0 3px #e3ad35}
#wlBag .dx .ic img{width:80%;height:80%;object-fit:contain}#wlBag .dx .ic .wl-ic{width:62%;height:62%;display:grid;place-items:center}#wlBag .dx .ic .wl-ic svg,#wlBag .dx .ic .wl-ic img{width:100%;height:100%}
#wlBag .dx .ic b{font-family:"Jua",sans-serif;font-size:2.2rem;color:#b8a48c;font-weight:400}
#wlBag .dx h3{margin:0 0 .3rem;font-family:"Jua",sans-serif;font-weight:400;font-size:1.12rem}#wlBag .dx p{margin:0;font-size:.9rem;line-height:1.55;color:#75565e}
#wlBag .dx:not(.got) h3,#wlBag .dx:not(.got) p{color:#9a8a8e}
#wlBag .close{display:block;width:100%;text-align:center;margin-top:1rem;border:0;border-radius:14px;background:#3f9fa0;color:#fffaf2;font:inherit;font-size:1.05rem;padding:.8rem;cursor:pointer;min-height:48px}
@media (max-width:520px){#wlBag .cards{grid-template-columns:1fr 1fr}#wlBag .dx .ic{width:64px;height:64px}#wlBag .dx h3{font-size:1rem}#wlBag .dx p{font-size:.84rem}}
/* 게임 중 화면 구석(개미굴 편과 같은 자리·모양 — 2026-11-03): 오른쪽 위 노란 '☰ 메뉴' 하나(누르면 소리·옷 갈아입기·조작법 칩이 아래로), 왼쪽 위 받은 물건(노란 칩 + 아이콘).
   위 할 일 안내가 휴대폰에서 화면 폭을 다 쓰면 그 높이(--qh, ui.setQuest)만큼 아래로 내려간다. 왼쪽 위 시험용 톱니(52px) 아래에서 시작 */
#wlHud:not(.on)>*{display:none!important}.wlg.prof-on #wlHud{visibility:hidden}
#wlHud .wl-chip{display:inline-flex;align-items:center;gap:.35rem;min-height:40px;box-sizing:border-box;background:rgba(46,28,44,.66);color:#fff4e4;border-radius:999px;padding:.4rem .95rem;
  font-family:"Jua","Gowun Dodum",sans-serif;font-size:.98rem;white-space:nowrap;-webkit-tap-highlight-color:transparent}
#wlHud .wl-chip.y{background:#f2b63c;color:#3e2834}#wlHud button.wl-chip{cursor:pointer}
#wlItems .wl-ic img{filter:drop-shadow(0 0 .7px #7a5236) drop-shadow(0 0 .7px #7a5236)} /* 크림색 아이콘도 노란 칩 위에서 보이게 */
#wlMenu{position:fixed;right:calc(env(safe-area-inset-right,0px) + 14px);top:calc(env(safe-area-inset-top,0px) + 14px + var(--qh,0px));z-index:41;display:flex;flex-direction:column;align-items:flex-end;gap:.45rem}
#wlMenu .ls{display:none;flex-direction:column;align-items:flex-end;gap:.45rem}#wlMenu.open .ls{display:flex}
#wlItems{position:fixed;left:calc(env(safe-area-inset-left,0px) + 14px);top:calc(env(safe-area-inset-top,0px) + 14px + max(58px,var(--qh,0px)));z-index:16;display:flex;flex-direction:column;align-items:flex-start;gap:.45rem;pointer-events:none}
#wlItems .wl-chip{min-height:40px;padding:.35rem .9rem .35rem .55rem;font-size:.95rem;color:#1e1418;pointer-events:auto;border:0;font:inherit;font-family:"Jua","Gowun Dodum",sans-serif}#wlItems .wl-ic,#wlItems .bagic{width:24px;height:24px}
#wlItems .wl-chip.pulse{animation:wlBagPulse .9s ease 2}@keyframes wlBagPulse{50%{transform:scale(1.12)}}
body.wl-front-on .bar .hint:not(#stats),body.wl-front-on #dbgBtn,body.wl-front-on header{display:none} /* 첫 화면: 아래 안내 글자·시험용 톱니 숨김 */`;
let WORLD=null,tEl=null,ctx=null,VIEW=null,el=null,ward=null,corner=null,menu=null,items=null,story=null,bag=null,zone=()=>null,restart=null,frontOn=false,wardOn=false,wardFrom=null,busy=false,storyOn=false,bagOn=false;
const look={vest:0,scarf:0,name:'',deco:''};try{Object.assign(look,JSON.parse(store.get(LOOK_KEY)||'{}'));}catch(e){}
/* 시간대(2026-11-03): 게임을 열 때마다 낮·해 질 녘·밤 가운데 하나를 무작위로(첫 화면 뒤 배경부터 같은 시간). ?time=0|1|2로 고정, 촬영 모드는 늘 그대로(구역 기본 — 낮) */
const T0=(()=>{const q=Q.get('time');if(q!==null&&q!=='')return Math.max(0,Math.min(2,+q|0));return Math.floor(Math.random()*3);})();
function startTime(){const Z=zone();if(!SHOT&&Z&&Z.sky)Z.sky.set(T0);}
/* 08 zoneLook이 세계 옷을 입힌 뒤 부른다: 플레이어가 고른 조끼·목수건 색, 화관(열린 것만). 옷·머리는 세계 기본(탐험복·지그재그 단발) */
function applyLook(U){if(SHOT||!U)return;if(U.setVest)U.setVest(look.vest|0);if(U.setScarf)U.setScarf(look.scarf|0);
  const D=decoList();if(look.deco&&U.setHood){const d=D.find(x=>x.hood===look.deco);if(d&&(!d.flag||flags[d.flag]))U.setHood(d.hood);}}
const decoList=()=>{const Z=zone(),E=Z&&Z.front&&Z.front.explorer;return (E&&E.deco&&E.deco.list)||[];};
const playerName=()=>(look.name||'').trim()||'원더룹';
const hasProgress=()=>Object.keys(flags).some(k=>k!=='compass'&&flags[k]);
function btn(cls,text,on,ic=null){const b=document.createElement('button');b.type='button';b.className=cls+' wl-felt wl-btn';if(ic)b.appendChild(icon(ic));b.append(mk(text));b.addEventListener('click',on);return b;}
function pbtn(cls,text,on){const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=text;b.addEventListener('click',on);return b;} // 개미굴 모양 단추(펠트 아님)
const BAG_SVG='<svg class="bagic" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8V6.5a4 4 0 0 1 8 0V8" fill="none" stroke="#5a3826" stroke-width="2" stroke-linecap="round"/><rect x="4" y="8" width="16" height="12.5" rx="3.5" fill="#c98a4b" stroke="#5a3826" stroke-width="1.8"/><path d="M4.6 12.5h14.8" stroke="#5a3826" stroke-width="1.6"/><rect x="10.2" y="11" width="3.6" height="3.4" rx="1" fill="#ffd46a" stroke="#5a3826" stroke-width="1.3"/></svg>';
function build(){const root=document.querySelector('.wlg');if(!root||el)return;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  el=document.createElement('div');el.id='wlFront';el.setAttribute('role','dialog');el.setAttribute('aria-label','게임 시작');root.appendChild(el);
  ward=document.createElement('div');ward.id='wlWard';ward.setAttribute('role','dialog');ward.setAttribute('aria-label','탐험가 소개');root.appendChild(ward);
  story=document.createElement('div');story.id='wlStory';story.setAttribute('role','dialog');story.setAttribute('aria-label','이야기');root.appendChild(story);
  bag=document.createElement('div');bag.id='wlBag';bag.setAttribute('role','dialog');bag.setAttribute('aria-modal','true');bag.setAttribute('aria-label','탐험 가방');root.appendChild(bag);
  bag.addEventListener('pointerdown',e=>{if(e.target===bag)closeBag();});
  corner=document.createElement('div');corner.id='wlHud';corner.className='wl-hint';root.appendChild(corner);
  // 오른쪽 위 메뉴(개미굴 #uiBtn): 노란 '☰ 메뉴' → 소리·옷 갈아입기·조작법 칩
  menu=document.createElement('div');menu.id='wlMenu';const mb=document.createElement('button');mb.type='button';mb.className='wl-chip y';mb.setAttribute('aria-expanded','false');
  const ls=document.createElement('div');ls.className='ls';const chip=(t,on)=>{const b=document.createElement('button');b.type='button';b.className='wl-chip';b.textContent=t;b.addEventListener('click',e=>{b.blur();on(e);});return b;};
  const snd=chip('',()=>{setMuted(!soundSettings.muted);sfx('click');sndLabel();}),sndLabel=()=>{snd.textContent=soundSettings.muted?'소리 꺼짐':'소리 켜짐';};
  ls.append(snd,chip('탐험 가방',()=>{setMenu(false);openBag();}),chip('옷 갈아입기',()=>{setMenu(false);toggleWardrobe();}),chip('조작법 · 도움말',()=>{sfx('click');setMenu(false);showHelp(!helpShown());}));
  const setMenu=on=>{menu.classList.toggle('open',on);mb.textContent=on?'✕ 메뉴 닫기':'☰ 메뉴';mb.setAttribute('aria-expanded',on?'true':'false');if(on)sndLabel();};
  mb.addEventListener('click',()=>{sfx('click');mb.blur();setMenu(!menu.classList.contains('open'));});setMenu(false);menu.append(mb,ls);
  // 왼쪽 위 가방 단추(개미굴 '도감 0/11' 노란 칩 자리): 받은 물건을 줄줄이 늘어놓지 않고 한 단추 → 탐험 가방 창
  items=document.createElement('div');items.id='wlItems';corner.append(items,menu);renderItems();
  let last=-1;onFlag(()=>{const n=bagCount();if(last>=0&&n>last){const b=items.querySelector('.wl-chip');if(b){b.classList.remove('pulse');void b.offsetWidth;b.classList.add('pulse');}}last=n;renderItems();});last=bagCount();}
/* ---------- 탐험 가방 ---------- */
const bagCfg=()=>{const Z=zone();return Z&&Z.front&&Z.front.bag;};
function bagCount(){const B=bagCfg();if(!B)return Object.keys(ITEMS).filter(id=>flags[id]).length;
  return B.items.filter(i=>flags[i.id]).length+(B.friends||[]).filter(id=>seen(id)).length+(B.secrets||[]).filter(q=>seen(q.id)).length;}
function renderItems(){if(!items)return;items.innerHTML='';const b=document.createElement('button');b.type='button';b.className='wl-chip y';b.setAttribute('aria-label','탐험 가방 열기');
  b.innerHTML=BAG_SVG;b.append('가방 '+bagCount());b.addEventListener('click',()=>{b.blur();openBag();});items.appendChild(b);}
function card({got,secret,img,svg,title,text}){const c=document.createElement('div');c.className='dx'+(got?' got':'')+(secret?' secret':'');
  const ic=document.createElement('div');ic.className='ic';if(got&&img){const im=new Image();im.alt='';im.src=img;ic.appendChild(im);}else if(got&&svg)ic.appendChild(svg);else ic.innerHTML='<b>?</b>';
  const h=document.createElement('h3');h.textContent=got?title:'???';const p=document.createElement('p');p.textContent=text;c.append(ic,h,p);return c;}
function renderBag(){const B=bagCfg()||{title:'탐험 가방',items:Object.keys(ITEMS).map(id=>({id,name:ITEMS[id].name,f:ITEMS[id].use,where:''})),friends:[],secrets:[]};
  const Z=zone(),ic=(Z&&Z.front&&Z.front.itemIcons)||{},C=profCards();bag.innerHTML='';const H=document.createElement('div');H.className='hcard';
  const nI=B.items.filter(i=>flags[i.id]).length,nF=(B.friends||[]).filter(seen).length;
  H.innerHTML='<div class="dhead"><h2></h2><p class="cnt"></p></div><div class="grid"></div>';H.querySelector('h2').textContent=B.title;H.querySelector('.cnt').textContent=`받은 물건 ${nI}개 · 만난 친구 ${nF}명`;
  const G=H.querySelector('.grid'),sec=(t,gold=false)=>{const h=document.createElement('p');h.className='sec'+(gold?' gold':'');h.textContent=t;G.appendChild(h);const d=document.createElement('div');d.className='cards';G.appendChild(d);return d;};
  const A=sec('받은 물건');B.items.forEach(i=>{const got=!!flags[i.id];A.appendChild(card({got,img:ic[i.id]||null,svg:ic[i.id]?null:icon(i.id),title:i.name,text:got?i.f:i.where+'에서 받을 수 있어요'}));});
  if((B.friends||[]).length){const F=sec('만난 친구');B.friends.forEach(id=>{const c=C[id]||{},got=seen(id);F.appendChild(card({got,img:pic(id),title:c.name,text:got?c.intro:'어딘가에서 만날 수 있어요'}));});}
  if((B.secrets||[]).length){const n=B.secrets.filter(q=>seen(q.id)).length,S=sec(`✦ 숨겨진 비밀 ${n}/${B.secrets.length}`,true);
    B.secrets.forEach(q=>{const c=C[q.id]||{},got=seen(q.id);S.appendChild(card({got,secret:true,img:pic(q.id),title:c.name,text:got?c.intro:q.where+' 어딘가에 숨어 있어요'}));});}
  const x=pbtn('close','닫기',()=>closeBag());H.appendChild(x);bag.appendChild(H);}
function openBag(){build();if(bagOn||frontOn||wardOn||storyOn)return;if(blocking('talk')||cardShown()){toast('지금은 가방을 열 수 없어요');return;}
  bagOn=true;sfx('dex');renderBag();bag.classList.add('on');document.body.classList.add('wl-bag-on');block('bag',true);if(ctx.WL.userData.stopWalk)ctx.WL.userData.stopWalk();setTimeout(()=>{const b=bag.querySelector('.close');if(b&&!coarse)b.focus({preventScroll:true});},50);}
function closeBag(){if(!bagOn)return;bagOn=false;sfx('click');bag.classList.remove('on');document.body.classList.remove('wl-bag-on');block('bag',false);}
/* ---------- 첫 화면 ---------- */
function art(F){const box=document.createElement('div');box.className='art';
  if(F.img){const r=new Image(),l=new Image();r.className='rib';l.className='logo';r.alt='';l.alt=[F.ribbon,F.logo].filter(Boolean).join(' ');r.src=F.img.ribbon;l.src=F.img.logo;box.append(l,r);
    (F.img.twinkle||[]).forEach(([x,y,d=0])=>{const s=document.createElement('i');s.className='tw';s.style.cssText=`--x:${x};--y:${y};--d:${d}s`;box.appendChild(s);});
    // 그림 둘레에 천천히 흩날리는 꽃잎·반짝이(자리·빠르기는 정해 둔 값 — 매번 같은 화면)
    [[-4,8,11,0,30,'p'],[8,-6,13,2.5,-20,'s'],[30,-10,12,5,24,'p'],[62,-8,14,1.2,-30,'s'],[90,-4,12,3.8,26,'p'],[103,24,15,6.5,-18,'s'],[-6,52,13,4.6,22,'s'],[104,70,12,8,-24,'p'],[46,96,14,7,30,'s'],[16,92,13,9.5,-26,'p']]
      .forEach(([x,y,t,d,dx,k])=>{const f=document.createElement('i');f.className='fl '+k;f.style.cssText=`--x:${x}%;--y:${y}%;--t:${t}s;--d:${d}s;--dx:${dx}px`;box.appendChild(f);});}
  else box.appendChild(logoEl({ribbon:F.ribbon,logo:F.logo}));
  return box;}
/* 개미굴 첫 화면과 같은 순서: 로고 → 소개 두 줄 → [새로 시작 | 조작법] → 소리 안내. 진행 기록이 있으면 [이어서 하기 | 새로 시작 | 조작법] */
function renderFront(){const F=zone().front;el.innerHTML='';delete el.dataset.ask;
  const top=document.createElement('div');top.className='top';top.appendChild(art(F));
  const p=document.createElement('p');p.className='sub';p.textContent=F.intro||F.sub||'';top.appendChild(p);
  const B=document.createElement('div');B.className='btns';
  if(hasProgress())B.append(pbtn('go','이어서 하기',()=>begin(false)),pbtn('gh','새로 시작',()=>{sfx('click');el.dataset.ask='1';el.querySelector('.ask .no').focus({preventScroll:true});}));
  else B.appendChild(pbtn('go','새로 시작',()=>{sfx('click');openWardrobe('start');}));
  B.appendChild(pbtn('gh','조작법',()=>{sfx('click');showHelp(true);}));top.appendChild(B);
  const tip=document.createElement('p');tip.className='tip';tip.innerHTML='소리와 함께 즐겨 주세요<span class="sep"> · </span>소리가 안 들리면 조작법을 봐 주세요';top.appendChild(tip);
  const ask=document.createElement('div');ask.className='ask';ask.innerHTML='<p>처음부터 다시 할까요?<br>받은 물건과 만난 친구 기록이 지워져요.</p>';
  const ar=document.createElement('div');ar.className='row';ar.append(pbtn('yes','처음부터 하기',()=>{sfx('click');fresh=true;delete el.dataset.ask;openWardrobe('start');}),pbtn('no','아니요',()=>{sfx('click');delete el.dataset.ask;}));ask.appendChild(ar);top.appendChild(ask);
  el.append(top);}
let fresh=false;
/* 첫 화면 뒤 카메라: 구역 정보 titleView — {from:[x,y,z], r, y, speed, a0}면 카메라는 그 자리(트인 곳 — 물 위 등)에 두고 보는 쪽만 천천히 돌아본다(가까운 큰 잎이 화면을 덮지 않게),
   {at, r, h}면 at 둘레를 돈다. 없으면 들어오는 자리 둘레 */
function orbit(){const Z=zone(),T=Z.titleView||{};const sp=Z.spawn||{x:0,z:0},sp2=T.speed||.045;let a=T.a0||0,last=performance.now();
  VIEW.hold(()=>{const now=performance.now();a+=Math.min(.1,(now-last)/1000)*sp2;last=now;
    if(T.from)return {from:T.from,at:[T.from[0]+Math.cos(a)*(T.r||9),T.y??.6,T.from[2]+Math.sin(a)*(T.r||9)]};
    const at=T.at||[sp.x,.6,sp.z],r=T.r||13;return {at,from:[at[0]+Math.cos(a)*r,T.h||7,at[2]+Math.sin(a)*r]};});}
/* 시리즈 공통 타이틀(game/titlescreen, 2026-11-04): 지금 세계 설정(js/worlds CURRENT)의 시작 공간(backdrop.zone)이면 그 틀로 — 아니면(요정의 숲 선착장 등) 아래 예전 첫 화면 */
const zoneId=Z=>(Z&&Z.root&&Z.root.name||'').replace(/^zone:/,'');
const titleWorld=()=>WORLD&&WORLD.backdrop&&zoneId(zone())===WORLD.backdrop.zone?WORLD:null;
function openTitle(W){build();frontOn=true;document.body.classList.add('wl-front-on');block('front',true);setHints(false);corner.classList.remove('on');startTime();
  const go=fr=>{if(zone().front&&zone().front.explorer){fresh=fr;openWardrobe('start');}else begin(fr);}; // 세계에 탐험가 소개가 있으면 그것부터
  tEl=renderTitle(W,{progress:hasProgress(),onNew:()=>{sfx('click');go(false);},onContinue:()=>begin(false),onFresh:()=>{sfx('click');go(true);},onHow:()=>{sfx('click');showHelp(true);},onClick:()=>sfx('click')});
  document.querySelector('.wlg').appendChild(tEl);if(tEl._place)tEl._place();
  const B=W.backdrop,t0=performance.now();VIEW.hold(()=>backdropAt(B,(performance.now()-t0)/1000));
  return true;} // 개미굴처럼 단추에 미리 초점을 주지 않는다(Tab으로 옮겨 가면 초점 테두리가 보임)
function openFront(){const W=titleWorld();if(W)return openTitle(W);if(!zone()||!zone().front)return false;build();frontOn=true;document.body.classList.add('wl-front-on');block('front',true);setHints(false);corner.classList.remove('on');
  startTime();renderFront();el.classList.add('on');orbit();setTimeout(()=>{const b=el.querySelector('.go');if(b&&!coarse)b.focus({preventScroll:true});},50);return true;}
function closeFront(){if(tEl){if(tEl._unplace)tEl._unplace();tEl.remove();tEl=null;}frontOn=false;document.body.classList.remove('wl-front-on');el.classList.remove('on');block('front',false);setHints(true);corner.classList.add('on');VIEW.hold(null);}
async function begin(fr){if(busy)return;busy=true;sfx('click');
  await transition(async()=>{if(fr){resetAll();if(restart)await restart();startTime();}closeFront();},{out:.45,hold:.25,in:.75});busy=false;fresh=false;
  if(!store.get(HELP_KEY)){store.set(HELP_KEY,'1');showHelp(true);}} // 처음 시작할 때 한 번 조작법(닫으면 나침반 연출·버섯 요정 순서로 이어진다)
/* ---------- 이야기 소개(모험 떠나기 → 탐방하는 곳 소개 몇 장 → 게임) ---------- */
function openStory(){const L=(zone().front&&zone().front.story)||[];if(!L.length){begin(fresh);return;}
  storyOn=true;let i=0;el.classList.remove('on');
  // 카메라: 구역 정보 storyView:[{from,at}…](장마다 한 자리)가 있으면 개미굴처럼 하늘에서 마을로 천천히 내려오며 장마다 그 자리로, 없으면 첫 화면처럼 돌아보기
  const SV=zone().storyView;if(SV&&SV.length){const c={from:[...SV[0].from],at:[...SV[0].at]};let last=performance.now();
    VIEW.hold(()=>{const now=performance.now(),k=1-Math.exp(-Math.min(.1,(now-last)/1000)*.9);last=now;const T=SV[Math.min(i,SV.length-1)];
      for(let j=0;j<3;j++){c.from[j]+=(T.from[j]-c.from[j])*k;c.at[j]+=(T.at[j]-c.at[j])*k;}return {from:[...c.from],at:[...c.at]};});}
  else orbit();
  const draw=()=>{story.innerHTML='';const c=document.createElement('div');c.className='scard';const t=document.createElement('p');t.className='stext';t.textContent=L[i];
    const bs=document.createElement('div');bs.className='sbtns';const last=i===L.length-1;
    bs.append(pbtn('skip','건너뛰기',()=>end()),pbtn('next',last?'모험 시작!':'다음',()=>{sfx('blip');if(last)end();else{i++;draw();}}));
    const d=document.createElement('div');d.className='dots';L.forEach((_,j)=>{const e=document.createElement('i');if(j===i)e.className='on';d.appendChild(e);});
    c.append(t,bs,d);story.appendChild(c);setTimeout(()=>{const b=story.querySelector('.next');if(b&&!coarse)b.focus({preventScroll:true});},30);};
  const end=()=>{if(!storyOn)return;storyOn=false;story.classList.remove('on');begin(fresh);};
  story._key=e=>{if(!storyOn)return;if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();end();}};
  draw();story.classList.add('on');}
/* ---------- 탐험가 소개(개미굴 #show) — 새로 시작할 때('start': 아래 단추 '모험 떠나기' → 이야기 소개)와 게임 중 옷 갈아입기('game': '다 골랐어요') ---------- */
function opts(list,cur,pick,dots=null){const box=document.createElement('div');box.className='opts';
  list.forEach((it,i)=>{const o=typeof it==='string'?{name:it}:it;const b=document.createElement('button');b.type='button';
    if(dots&&dots[i]){const d=document.createElement('span');d.className='dot';d.style.background=dots[i];b.appendChild(d);}
    b.append((o.lock?'🔒 ':'')+o.name);if(o.lock)b.disabled=true;
    b.addEventListener('click',()=>{box.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');pick(i);});
    b.setAttribute('aria-pressed',i===cur?'true':'false');box.appendChild(b);});
  return box;}
function lab(t){const p=document.createElement('p');p.className='lab';p.textContent=t;return p;}
function renderWard(mode){const U=ctx.WL.userData,F=zone().front||{},E=F.explorer||{};ward.innerHTML='';const P=document.createElement('div');P.className='panel';const B=document.createElement('div');B.className='body';
  const k=document.createElement('p');k.className='k';k.textContent='탐험가 소개';
  const nl=document.createElement('label');nl.className='namel';nl.htmlFor='wlNameIn';nl.textContent='이름';
  const ni=document.createElement('input');ni.id='wlNameIn';ni.maxLength=8;ni.autocomplete='off';ni.placeholder='원더룹';ni.value=look.name||'';ni.addEventListener('input',()=>{look.name=ni.value;save();});
  ni.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')ni.blur();});
  B.append(k,nl,ni);
  if(E.bio){const b=document.createElement('p');b.className='bio';b.textContent=E.bio;B.appendChild(b);}
  if(E.goal){const g=document.createElement('div');g.className='goal';const sp=document.createElement('span');sp.textContent='목표';g.append(sp,E.goal);B.appendChild(g);}
  B.append(lab('조끼 색'),opts(U.vestColors||[],U.vestIdx|0,i=>{look.vest=i;U.setVest(i);save();sfx('click');},U.vestHex),
    lab('목수건 색'),opts(U.scarfColors||[],U.scarfIdx|0,i=>{look.scarf=i;U.setScarf(i);save();sfx('click');},U.scarfHex));
  if(E.deco&&E.deco.list){const D=E.deco.list.map(d=>({name:d.name,lock:d.flag&&!flags[d.flag]?d.lock:null}));const cur=Math.max(0,E.deco.list.findIndex(d=>d.hood===(look.deco||E.deco.list[0].hood)));
    B.append(lab(E.deco.label||'장식'),opts(D,cur,i=>{const d=E.deco.list[i];look.deco=d.hood;save();if(U.setHood)U.setHood(d.hood);sfx('click');}));
    const lk=E.deco.list.find(d=>d.flag&&!flags[d.flag]);if(lk){const n=document.createElement('p');n.className='acclock';n.textContent=lk.lock;B.appendChild(n);}}
  const faces=U.exprNames||[];B.append(lab('표정 미리보기'),opts(faces,faces.indexOf(U.exprName||'기본'),i=>{U.setExpr(faces[i]);sfx('blip');}));
  if(E.map){const cur=(zone().root&&zone().root.name||'').replace(/^zone:/,'');B.appendChild(lab('모험 지도'));const ol=document.createElement('ol');ol.className='map';
    E.map.forEach(([n,id])=>{const li=document.createElement('li');li.textContent=n;if(id)li.className='on';if(id===cur)li.setAttribute('aria-current','true');ol.appendChild(li);});B.appendChild(ol);}
  const spin=document.createElement('div');spin.className='spin';spin.append(pbtn('','↺ 돌려 보기',()=>{ctx.WL.rotation.y+=Math.PI/4;}),pbtn('','돌려 보기 ↻',()=>{ctx.WL.rotation.y-=Math.PI/4;}));B.appendChild(spin);
  P.append(B,pbtn('done',mode==='start'?'모험 떠나기':'다 골랐어요',()=>closeWardrobe(mode==='start')));ward.appendChild(P);}
function save(){store.set(LOOK_KEY,JSON.stringify(look));}
function showcase(){const W=ctx.WL,cam=ctx.camera;const dx=cam.position.x-W.position.x,dz=cam.position.z-W.position.z,L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L;
  W.rotation.y=Math.atan2(ux,uz)+.35; // 원더룹이 카메라 쪽을 살짝 비스듬히(3/4) 본다
  const narrow=innerWidth<=760,p=W.position,d=narrow?7:5,rx=uz,rz=-ux; // 카메라 오른쪽 — 전신이 다 보이게
  const at=narrow?[p.x,p.y-.2,p.z]:[p.x+rx*1.1,p.y+.55,p.z+rz*1.1]; // 패널을 피해: 컴퓨터는 원더룹을 왼쪽에, 휴대폰은 아래 시트 위쪽 칸에
  const from=[p.x+ux*d,p.y+(narrow?1.3:1.0),p.z+uz*d];VIEW.hold(()=>({at,from}));}
function canWear(){const U=ctx.WL.userData;return !(blocking('talk')||blocking('fade')||cardShown()==='result'||cardShown()==='cut'||U.riding||(U.vert&&U.vert.air));}
function openWardrobe(mode='game'){build();if(wardOn||bagOn||storyOn)return;const fromFront=mode==='start'||frontOn;if(!fromFront&&!canWear()){toast('지금은 옷을 갈아입을 수 없어요');return;}
  if(frontOn&&mode!=='start')mode='front';
  wardOn=true;wardFrom=mode;sfx('pickup');if(frontOn){el.classList.remove('on');}else{block('ward',true);setHints(false);}
  corner.classList.remove('on');if(ctx.WL.userData.stopWalk)ctx.WL.userData.stopWalk();renderWard(mode);ward.classList.add('on');showcase();
  input.dragHook=dx=>{ctx.WL.rotation.y+=dx*.012;};}
function closeWardrobe(go=false){if(!wardOn)return;wardOn=false;ward.classList.remove('on');input.dragHook=null;const U=ctx.WL.userData;if(U.setExpr)U.setExpr('기본');sfx('click');
  if(wardFrom==='start'){if(go)openStory();else{el.classList.add('on');orbit();}}
  else if(wardFrom==='front'){el.classList.add('on');orbit();}else{block('ward',false);setHints(true);corner.classList.add('on');VIEW.hold(null);}}
function toggleWardrobe(){if(wardOn)closeWardrobe();else openWardrobe('game');}
/* ---------- 시작 ---------- */
/* 08이 게임을 준비한 뒤: initFront({ctx, view, zone:()=>지금 구역, restart:()=>첫 구역 다시 만들기}) → 첫 화면을 열거나(세계 front가 있을 때) 구석 단추만 */
function initFront(o){ctx=o.ctx;VIEW=o.view;zone=o.zone;restart=o.restart;WORLD=o.world||null;if(SHOT)return;{const F0=zone()&&zone().front;if(F0&&F0.icons)setIcons(F0.icons);}build(); // 아이콘은 단추를 만들기 전에
  window.addEventListener('keydown',e=>{if(story&&story._key)story._key(e);
    if(bagOn&&(e.code==='Escape'||e.code==='KeyB')){e.preventDefault();e.stopImmediatePropagation();closeBag();return;}
    if(!wardOn)return;if(e.target&&e.target.tagName==='INPUT')return;if(e.code==='Escape'||(e.code==='KeyC'&&wardFrom==='game')){e.preventDefault();e.stopImmediatePropagation();closeWardrobe();}},true);
  controlHooks.onBag=()=>{if(bagOn)closeBag();else openBag();};
  const Z=zone(),F=Z&&Z.front;if(titleWorld())setHelpNote(WORLD.controlsNote||null);else setHelpExtra(F&&F.help,F&&F.play);if(F&&F.theme)setTheme(F.theme); // 세계 색(펠트 한 벌은 game/felt)
  if(NO||!openFront()){startTime();corner.classList.add('on');}}
const frontShown=()=>frontOn,wardrobeShown=()=>wardOn,bagShown=()=>bagOn;
export {applyLook,bagShown,closeBag,closeFront,closeWardrobe,frontShown,initFront,openBag,openFront,openWardrobe,playerName,toggleWardrobe,wardrobeShown};
