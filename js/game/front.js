/* 원더룹 — 게임 첫 화면(타이틀)·옷 갈아입기·오른쪽 위 구석 단추 (엔진 공통, 2026-11-03 — 개미굴 게임 #intro·#show·#wardBtn·#howMenu를 옮김)
   세계마다 세계 기본값(world.js)에 front:{ribbon, logo, sub, img:{ribbon, logo, w, h, twinkle:[[x,y,지연]…]} | null, deco, help:[[이름,설명]…], ending:{img:null}} 를 둔다.
   - 타이틀: 게임을 열면(촬영 모드·?notitle 빼고) 첫 구역을 만든 채로 그 위에 덮는다. img가 있으면 그림 두 장(리본이 먼저 내려오고 → 큰 제목이 통통),
     없으면 title.js 코드 로고(logoEl). 그 뒤로 아주 느리게 숨쉬듯 살랑. 그림 둘레에 반짝이·꽃잎이 천천히, 그림 속 별·이슬 자리(twinkle)가 가끔 반짝(모두 HTML — 3D 그리기 0회).
     뒤 배경은 그 구역을 천천히 돌아보는 카메라(구역 정보 titleView:{at,r,h,speed} — view.hold, 낮). 열려 있는 동안 core.block('front') → 나침반 연출·이벤트·말 걸기는 기다린다.
     진행 기록(state.flags)이 있으면 '이어서 하기'·'처음부터'(한 번 더 확인 → 진행을 지우고 첫 구역을 다시 만든다), 없으면 '시작하기'. 누르면 화면 전환(ui.transition)으로 원더룹 뒤 카메라로.
     처음 시작할 때 한 번은 조작법(controls.showHelp)을 보여 준다(localStorage 'wl-help-seen'). 소리는 첫 누르기 때 깨어난다(sound 소리 깨우기 그대로).
   - 옷 갈아입기(개미굴 옷장과 같은 방식·같은 모양): 오른쪽 패널(휴대폰은 아래 시트) — 옷(평상복·탐험복)·머리(세 가지)·표정 미리보기.
     카메라가 원더룹 앞으로 오고, 화면을 끌면 원더룹이 돈다. 고른 옷·머리는 localStorage 'wl-look'(새로고침 뒤에도) — 08 zoneLook이 세계 옷 다음에 입힌다(applyLook).
     세계 탈(화관 등)은 건드리지 않는다. 첫 화면 단추·게임 중 오른쪽 위 단추·O 키(예전 C — C는 사진 모드, 2026-11-08)로 연다. 대화·카드·탈것·공중에서는 열지 않는다.
   - 오른쪽 위 구석 단추: '옷 갈아입기'·'조작법'(controls 도움말 열고 닫기). 안내 표시(wl-hint)라 영상 캡처에는 안 나온다.
   톱니 메뉴의 옷·머리·표정 단추는 시험용으로 그대로 둔다(촬영 도구가 누른다) — 플레이어용은 이것 하나.
   2026-11-03 개미굴 흐름으로: 첫 화면(로고·소개 두 줄·새로 시작|조작법·소리 안내) → 탐험가 소개 패널(옷 갈아입기 창이 이것 — 이름·소개·목표·색·화관·표정·모험 지도) → 이야기 소개(front.story) → 게임.
   왼쪽 위는 받은 물건 칩 대신 '가방' 단추 하나 → 탐험 가방 창(front.bag — 받은 물건·만난 친구·숨겨진 비밀). 시간대는 열 때마다 무작위(startTime). */
import {block,blocking} from './core.js';
import {bed,preload,register,setMuted,sfx,songs,soundSettings,voice} from './sound.js';
import {startMission} from './mission.js';
import {cardShown,setHints,toast,transition} from './ui.js';
import {controlHooks,helpShown,input,setHelpExtra,setHelpNote,showHelp} from './controls.js';
import {cards as profCards,pic,seen} from './profile.js';
import {flags,gotAt,onFlag,resetAll} from './state.js';
import {ITEMS} from './items.js';
import {applyZone as weatherZone} from './weather.js';
import {logoEl} from './title.js';
import {icon,mk,setIcons,setTheme,tape} from './felt.js';
import {backdropAt,render as renderTitle} from './titlescreen.js';
import {popCss,popShown} from './popup.js';
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
@media (max-width:760px){#wlWard{top:auto;left:0;width:100%;max-height:min(46vh,calc(100dvh - env(safe-area-inset-top,0px) - 24px));padding-left:calc(env(safe-area-inset-left,0px) + 14px)}}
#wlWard .k{margin:0;display:inline-block;background:#f2b63c;color:#3e2834;border-radius:999px;padding:.15rem .7rem;font-size:.85rem}
#wlWard .namel{display:block;font-size:.85rem;color:#75565e;margin:.7rem 0 .25rem}
#wlWard input{width:100%;box-sizing:border-box;font:inherit;font-size:max(16px,1.25rem);padding:.5rem .7rem;border-radius:12px;border:2px solid #3f9fa0;background:transparent;color:#3e2834}
#wlWard .bio{margin:.7rem 0;line-height:1.6;color:#75565e;font-size:.95rem}
#wlWard .goal{background:rgba(242,182,60,.18);border-radius:12px;padding:.6rem .75rem;line-height:1.5;font-size:.95rem}
#wlWard .goal span{display:inline-block;background:#f2b63c;color:#3e2834;border-radius:999px;padding:.05rem .55rem;margin-right:.4rem;font-size:.8rem}
#wlWard .lab{margin:.9rem 0 .35rem;font-size:.85rem;color:#75565e}
#wlWard .opts{display:flex;flex-wrap:wrap;gap:.4rem}
#wlWard .opts button{border:2px solid transparent;background:rgba(127,90,96,.12);color:#3e2834;font:inherit;font-size:.92rem;padding:.4rem .75rem;min-height:40px;border-radius:999px;cursor:pointer;display:flex;align-items:center;gap:.35rem;white-space:nowrap}
#wlWard .opts button[aria-pressed="true"]{border-color:#3f9fa0;background:rgba(63,159,160,.16)}
#wlWard .opts button:disabled{opacity:.55;cursor:default}
#wlWard .opts button.q{min-width:44px;justify-content:center;border:2px dashed rgba(117,86,94,.45);background:rgba(127,90,96,.06);color:#9a8a8e;font-family:"Jua",sans-serif;font-size:1.05rem;opacity:1} /* 아직 못 받은 장식 — 물음표 칸 */
#wlWard .dot+.dot{margin-left:-.2rem}
#wlWard .dot{width:14px;height:14px;border-radius:50%;flex:none;box-shadow:inset 0 0 0 1px rgba(62,40,52,.18)}
#wlWard .acclock{margin:.35rem 0 0;font-size:.8rem;color:#75565e}
#wlWard .map{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:.3rem;counter-reset:z}
#wlWard .map li{counter-increment:z;font-size:.85rem;padding:.3rem .6rem;border-radius:999px;background:rgba(127,90,96,.12);color:#75565e}
#wlWard .map li::before{content:counter(z) ". "}#wlWard .map li.on{background:rgba(63,159,160,.18);color:#3e2834}#wlWard .map li:not(.on)::after{content:" · 준비 중";font-size:.75rem}
#wlWard .spin{display:flex;gap:.5rem;margin-top:.9rem}#wlWard .spin button{flex:1;border:2px solid #3f9fa0;background:transparent;color:#3e2834;border-radius:12px;font:inherit;font-size:.92rem;padding:.4rem;min-height:40px;cursor:pointer}
#wlWard .done{flex:none;display:block;width:100%;text-align:center;box-sizing:border-box;margin-top:1rem;border:0;border-radius:14px;background:#3f9fa0;color:#fffaf2;font:inherit;font-size:1.05rem;padding:.8rem 1.6rem;min-height:48px;cursor:pointer}
/* 시리즈 공통 틀(body.wl-antui): 미션 카드·아이템 카드를 개미굴 #mission·#getCard 그대로 — 크림 판·그림자, 제목도 고운돋움, 아이콘은 동그라미 없이 */
body.wl-antui #wlNotice .t,body.wl-antui #wlGet .t{font-family:"Gowun Dodum",sans-serif}
body.wl-antui #wlGet{border-radius:20px;padding:.9rem 1.4rem .9rem 1rem;background:rgba(44,30,42,.95);color:#fbe9d8;box-shadow:0 14px 40px rgba(30,14,36,.45)}body.wl-antui #wlGet .s{color:#d9bfb3} /* 아이템 획득 카드는 늘 개미굴 어두운 판(꿀방울 카드 그대로 — 이야기 소개 카드와 같은 값, 2026-11-05 사용자 요청) */
body.wl-antui #wlDlg{background:#2e2030;color:#fbe9d8;border:0;border-radius:20px;padding:1.3rem 1.2rem .9rem;box-shadow:0 14px 40px rgba(30,14,36,.4)}body.wl-antui #wlDlg::before{display:none}
body.wl-antui #wlDlg .who{left:16px;top:-14px;background:#f2b63c;color:#2a1a22;border-radius:999px;padding:.25rem .75rem;font-size:.88rem;font-family:"Gowun Dodum",sans-serif;transform:none;filter:none}body.wl-antui #wlDlg .who::before,body.wl-antui #wlDlg .who::after{display:none}
body.wl-antui #wlDlg .line{color:#fbe9d8}body.wl-antui #wlDlg .more{color:#d9bfb3}
@media (max-width:600px){body.wl-antui #wlDlg .line{font-size:1.12rem;line-height:1.62}body.wl-antui #wlDlg .who{font-size:.95rem}} /* 대화창도 개미굴 #dlg 어두운 화면 값 그대로(--bubble #2e2030·노란 알약 이름표 #f2b63c — 2026-11-06 사용자 요청, 펠트·민트 테이프 없음) */
body.wl-antui #wlGet .ic{width:auto;height:auto;background:none;border:0;border-radius:0}body.wl-antui #wlGet img{width:58px;height:58px;filter:none}
/* 모험 떠나기 전 이야기 소개(개미굴 #story) — 2026-11-04 사용자 요청으로 개미굴 어두운 화면 값(판 rgba(44,30,42,.95)·글자 #fbe9d8·민트 #5cc4b9)으로 늘 어둡게: 화면 아래 가운데 카드, 건너뛰기·다음, 점 */
#wlStory{position:fixed;inset:0;z-index:31;display:none;place-items:end center;padding:1rem 1rem calc(env(safe-area-inset-bottom,0px) + 3.5rem);box-sizing:border-box;background:linear-gradient(180deg,rgba(30,14,36,0) 35%,rgba(30,14,36,.6))}
#wlStory.on{display:grid}
#wlStory .scard{width:min(34rem,100%);background:rgba(44,30,42,.95);color:#fbe9d8;border-radius:22px;padding:1.4rem 1.4rem 1.1rem;box-shadow:0 18px 50px rgba(30,14,36,.5);box-sizing:border-box;font-family:"Gowun Dodum",sans-serif;color-scheme:dark;animation:wlfFade .4s ease both}
#wlStory .stext{margin:0 0 1rem;font-size:1.15rem;line-height:1.75;min-height:5.3em;word-break:keep-all}
#wlStory .sbtns{display:flex;justify-content:flex-end;gap:.5rem}
#wlStory button{text-align:center;border-radius:14px;font:inherit;font-size:1.02rem;padding:.75rem 1.4rem;cursor:pointer;min-height:48px}
#wlStory .next{border:0;background:#5cc4b9;color:#1f1418}#wlStory .skip{border:2px solid #5cc4b9;background:transparent;color:#fbe9d8}
#wlStory .dots{display:flex;gap:.35rem;justify-content:center;margin-top:.8rem}#wlStory .dots i{width:7px;height:7px;border-radius:50%;background:rgba(127,90,96,.35)}#wlStory .dots i.on{background:#5cc4b9}
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
#wlMenu .wl-ver{font:12px/1.2 'Gowun Dodum',sans-serif;color:#fbe9d8;background:rgba(44,30,42,.72);border-radius:999px;padding:.2rem .6rem;opacity:.9}
#wlMenu .ls{display:none;flex-direction:column;align-items:flex-end;gap:.45rem}#wlMenu.open .ls{display:flex}
#wlItems{position:fixed;left:calc(env(safe-area-inset-left,0px) + 14px);top:calc(env(safe-area-inset-top,0px) + 14px + max(58px,var(--qh,0px)));z-index:16;display:flex;flex-direction:column;align-items:flex-start;gap:.45rem;pointer-events:none}
#wlItems .wl-chip{min-height:40px;padding:.35rem .9rem .35rem .55rem;font-size:.95rem;color:#1e1418;pointer-events:auto;border:0;font:inherit;font-family:"Jua","Gowun Dodum",sans-serif}#wlItems .wl-ic,#wlItems .bagic{width:24px;height:24px}
#wlItems .bagbtn{position:relative}#wlItems .bagbtn.pulse{animation:wlBagPulse .5s ease 3;box-shadow:0 0 0 3px rgba(255,236,160,.9),0 0 18px rgba(255,214,90,.9)}
@keyframes wlBagPulse{0%,100%{transform:translateY(0) scale(1)}40%{transform:translateY(-6px) scale(1.12)}70%{transform:translateY(0) scale(.96)}}
#wlItems .spk{position:absolute;left:var(--x);top:var(--y);font-style:normal;font-size:15px;color:#ffd84a;text-shadow:0 0 6px #fff3b0;pointer-events:none;animation:wlSpk 1.1s ease var(--d) both}
@keyframes wlSpk{0%{opacity:0;transform:scale(.2) rotate(0)}30%{opacity:1;transform:scale(1.25) rotate(25deg)}100%{opacity:0;transform:scale(.6) translateY(-8px) rotate(60deg)}}
@media (prefers-reduced-motion: reduce){#wlItems .bagbtn.pulse{animation:none}#wlItems .spk{animation:none;opacity:.9}}
#wlItems #wlTool{position:static;pointer-events:auto;min-height:40px;box-sizing:border-box;border:0;border-radius:999px;padding:.4rem .95rem;background:rgba(46,28,44,.66);color:#fff4e4;
  font-family:"Jua","Gowun Dodum",sans-serif;font-size:.95rem;white-space:nowrap;cursor:pointer;backdrop-filter:none;-webkit-backdrop-filter:none;-webkit-tap-highlight-color:transparent}
#wlItems #wlTool.on{background:#f2b63c;color:#3e2834} /* 개미굴 #lamp: 꺼짐 어두운 칩 · 켜짐 노란 칩 */
body.wl-front-on .bar .hint:not(#stats),body.wl-front-on #dbgBtn,body.wl-front-on header,body.wl-ward-on header,body.wl-pop-on header{display:none} /* 첫 화면: 아래 안내 글자·시험용 톱니 숨김 */`;
let WORLD=null,tEl=null,ctx=null,VIEW=null,el=null,ward=null,corner=null,menu=null,items=null,story=null,bag=null,zone=()=>null,restart=null,frontOn=false,wardOn=false,wardFrom=null,busy=false,storyOn=false,bagOn=false;
const look={vest:0,scarf:0,name:'',deco:''};try{Object.assign(look,JSON.parse(store.get(LOOK_KEY)||'{}'));}catch(e){}
/* 시간대(2026-11-03): 게임을 열 때마다 낮·해 질 녘·밤 가운데 하나를 무작위로(첫 화면 뒤 배경부터 같은 시간). ?time=0|1|2로 고정, 촬영 모드는 늘 그대로(구역 기본 — 낮) */
const T0=(()=>{const q=Q.get('time');if(q!==null&&q!=='')return Math.max(0,Math.min(2,+q|0));return Math.floor(Math.random()*3);})();
function startTime(){const Z=zone();if((!SHOT||Q.has('weather'))&&Z&&Z.sky)weatherZone(Z);} // 하늘 시간 = 그 판의 날씨(game/weather — 열 때 한 번 무작위, 2026-11-04)
/* 08 zoneLook이 세계 옷을 입힌 뒤 부른다: 플레이어가 고른 조끼·목수건 색, 화관(열린 것만). 옷·머리는 세계 기본(탐험복·지그재그 단발) */
function applyLook(U){if(SHOT||!U)return;const X=worldX();if(X){applyWorldLook(U,X);return;}if(U.setVest)U.setVest(look.vest|0);if(U.setScarf)U.setScarf(look.scarf|0);
  const D=decoList();if(look.deco&&U.setHood){const d=D.find(x=>x.hood===look.deco);if(d&&(!d.flag||flags[d.flag]))U.setHood(d.hood);}}
/* 세계 설정 explorer(js/worlds — 2026-11-04): 탐험가 소개 창(새로 시작)과 게임 중 '옷 갈아입기'가 같은 목록·같은 저장값 look.w[세계 id] = {hood, outfit, deco} */
/* 이 세계의 구역 = 첫 화면 구역 + 모험 지도(map)의 스테이지 구역들(2026-11-10 — 화성 'space-mars'가 빠져 있어 STAGE 2에서는 옛 가방 화면이 떴다: 유리 조각·만난 친구가 안 보이고 '에서 받을 수 있어요'만) */
const worldZones=W=>W.zones||[W.backdrop.zone,...(W.map||[]).map(m=>m.zone).filter(Boolean)];
const curWorld=()=>WORLD&&WORLD.backdrop&&worldZones(WORLD).includes(zoneId(zone()))?WORLD:null;
const worldX=()=>{const W=curWorld();return W&&W.talColors?W:null;}; // 탐험 준비 창을 쓰는 세계(talColors가 있는 세계 설정)
const wsave=()=>{const W=curWorld();look.w=look.w||{};return look.w[W.id]=look.w[W.id]||{tal:0,deco:0};}; // 탈 색·장식은 세계마다, 옷 조합(look.combo)·이름은 하나
const itemFlag=(W,it)=>'item:'+W.id+':'+it.id,itemGot=(W,it)=>!!flags[itemFlag(W,it)];
const decoList2=W=>[{name:'없음'},...(W.items||[]).filter(i=>!i.bagOnly)]; // bagOnly: 가방에만 들어가는 물건(달떡 등) — 장식 목록에서 뺌
function applyWorldLook(U,W){const S=wsave();
  if(U.setOutfit)U.setOutfit('ant');if(W.talModel&&U.setHood)U.setHood(W.talModel); // 시리즈 공통 원더룹(앤트빌리지 차림) + 그 세계 탈
  if(U.setTint){const h=W.talColors[S.tal|0]||W.talColors[0];U.setTint('hood',[h[1],h[2]]);}
  if(U.setCombo)U.setCombo(look.combo|0);
  const L=decoList2(W),d=L[S.deco|0];U.wlDeco=d&&d.id&&itemGot(W,d)?d.id:null;} // 장식 모양(items[].shape)은 그 세계를 옮길 때 단다
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
  popCss();bag=document.createElement('div');bag.id='wlBag';bag.className='wl-pop';bag.setAttribute('role','dialog');bag.setAttribute('aria-modal','true');bag.setAttribute('aria-label','탐험 가방');root.appendChild(bag);
  bag.addEventListener('pointerdown',e=>{if(e.target===bag)closeBag();});
  corner=document.createElement('div');corner.id='wlHud';corner.className='wl-hint';root.appendChild(corner);
  // 오른쪽 위 메뉴(개미굴 #uiBtn): 노란 '☰ 메뉴' → 소리·옷 갈아입기·조작법 칩
  menu=document.createElement('div');menu.id='wlMenu';const mb=document.createElement('button');mb.type='button';mb.className='wl-chip y';mb.setAttribute('aria-expanded','false');
  const ls=document.createElement('div');ls.className='ls';const chip=(t,on)=>{const b=document.createElement('button');b.type='button';b.className='wl-chip';b.textContent=t;b.addEventListener('click',e=>{b.blur();on(e);});return b;};
  const snd=chip('',()=>{setMuted(!soundSettings.muted);sfx('ui-click');sndLabel();}),sndLabel=()=>{snd.textContent=soundSettings.muted?'소리 꺼짐':'소리 켜짐';};
  /* 절전 모드(2026-11-10 — 08 window.wlEco: 낮은 화질·30프레임 고정, 기본 꺼짐, 이 기기에 기억) */
  const eco=chip('',()=>{sfx('ui-click');if(window.wlEco){window.wlEco.set(!window.wlEco.on);ecoLabel();toast(window.wlEco.on?'절전 모드 켜짐 — 화질을 낮추고 30프레임으로':'절전 모드 꺼짐');}}),ecoLabel=()=>{eco.textContent='절전 모드: '+(window.wlEco&&window.wlEco.on?'켜짐':'꺼짐');};
  ls.append(snd,eco,chip('옷 갈아입기',()=>{setMenu(false);toggleWardrobe();}),chip('조작법 · 도움말',()=>{sfx('ui-click');setMenu(false);showHelp(!helpShown());}));
  /* 버전 표시(2026-11-14 — 휴대폰이 예전 버전을 보고 있는지 확인): 메뉴 맨 아래 작은 글자 '버전 7b75f60a35'(= version.json, 공개 주소 index.html의 WL_V — 한 파일 HTML은 빌드 해시) */
  {const v=document.createElement('div');v.className='wl-ver';v.textContent='버전 '+(window.WL_V||'-')+(window.WL_BUILD&&window.WL_BUILD.commit?' · '+window.WL_BUILD.commit:'');ls.append(v);}
  const setMenu=on=>{menu.classList.toggle('open',on);mb.textContent=on?'✕ 메뉴 닫기':'☰ 메뉴';mb.setAttribute('aria-expanded',on?'true':'false');if(on){sndLabel();ecoLabel();}};
  mb.addEventListener('click',()=>{sfx('ui-click');mb.blur();setMenu(!menu.classList.contains('open'));});setMenu(false);menu.append(mb,ls);
  // 왼쪽 위 가방 단추(개미굴 '도감 0/11' 노란 칩 자리): 받은 물건을 줄줄이 늘어놓지 않고 한 단추 → 탐험 가방 창
  items=document.createElement('div');items.id='wlItems';corner.append(items,menu);renderItems();
  {const tb=document.getElementById('wlTool');if(tb)items.appendChild(tb);} // 세계 도구 단추(랜턴 켜고 끄기 — 개미굴 #leftCol처럼 가방 단추 바로 아래, 겹치지 않게)
  let last=-1;onFlag(()=>{const n=bagCount();renderItems();if(last>=0&&n>last)bagPop();last=n;});last=bagCount();}
/* 새 물건이 가방에 들어가면 가방 단추가 통통 튀며 반짝(별 셋이 튀어 나옴, 움직임 줄이기면 반짝임만) */
function bagPop(){const b=items&&items.querySelector('.bagbtn');if(!b)return;b.classList.remove('pulse');void b.offsetWidth;b.classList.add('pulse');
  b.querySelectorAll('.spk').forEach(e=>e.remove());[[-14,-12,0],[54,-14,.12],[22,-20,.24]].forEach(([x,y,d])=>{const e=document.createElement('i');e.className='spk';e.textContent='✦';e.style.cssText=`--x:${x}px;--y:${y}px;--d:${d}s`;b.appendChild(e);});
  clearTimeout(bagPop.t);bagPop.t=setTimeout(()=>{b.classList.remove('pulse');b.querySelectorAll('.spk').forEach(e=>e.remove());},1800);}
/* ---------- 탐험 가방 ---------- */
const bagCfg=()=>{const Z=zone();return Z&&Z.front&&Z.front.bag;};
/* 시리즈 공통 세계(js/worlds — 구역에 front.bag이 없을 때, 2026-11-04): 그 세계에서 얻는 물건 = 첫 미션 물건(flags have:<세계>:<id>) + 장식(items — flags item:<세계>:<id>).
   얻은 것은 얻은 순서대로(state gotAt), 못 얻은 것은 그 뒤에 ??? 칸. 앞 세계에서 가져온 아이템(나침반 등)은 이 세계 가방에 넣지 않는다 */
function worldBag(){const W=curWorld();if(!W||bagCfg())return null;const L=[];
  const F=W.firstMission&&W.firstMission.item;if(F)L.push({key:'have:'+W.id+':'+F.id,name:F.name,f:F.desc||'',where:F.where||'첫 미션',img:F.icon?F.icon():null});
  (W.items||[]).forEach(i=>L.push({key:'item:'+W.id+':'+i.id,name:i.name,f:i.desc||'탐험 준비에서 달 수 있는 장식이에요.',where:i.where||('STAGE 0'+i.stage),img:i.icon?i.icon():null,st:i.stage||9}));
  L.forEach(i=>i.got=!!flags[i.key]);const got=L.filter(i=>i.got).sort((a,b)=>gotAt(a.key)-gotAt(b.key));return [...got,...L.filter(i=>!i.got).sort((a,b)=>(a.st||0)-(b.st||0))];}
/* 세계 설정 cards(만난 친구 — game/profile flags 'meet:<세계>:<id>'): 숨겨진 친구(secret)는 만난 뒤에만 보임 */
const friendGot=(W,id)=>!!flags['meet:'+W.id+':'+id];
function worldFriends(){const W=curWorld();if(!W||!W.cards)return [];return Object.keys(W.cards).map(id=>({id,c:W.cards[id],got:friendGot(W,id)})).filter(f=>f.got||!f.c.secret);}
function bagCount(){const WB=worldBag();if(WB)return WB.filter(i=>i.got).length+worldFriends().filter(f=>f.got).length;const B=bagCfg();if(!B)return Object.keys(ITEMS).filter(id=>flags[id]).length;
  return B.items.filter(i=>flags[i.id]).length+(B.friends||[]).filter(id=>seen(id)).length+(B.secrets||[]).filter(q=>seen(q.id)).length;}
function renderItems(){if(!items)return;let b=items.querySelector('.bagbtn');
  if(!b){b=document.createElement('button');b.type='button';b.className='wl-chip y bagbtn';b.setAttribute('aria-label','탐험 가방 열기');b.innerHTML=BAG_SVG+'<span class="n"></span>';b.addEventListener('click',()=>{b.blur();openBag();});items.prepend(b);}
  b.querySelector('.n').textContent='가방 '+bagCount();}
function card({got,secret,img,svg,title,text}){const c=document.createElement('div');c.className='dx'+(got?' got':'')+(secret?' secret':'');
  const ic=document.createElement('div');ic.className='ic';if(got&&img){const im=new Image();im.alt='';im.src=img;ic.appendChild(im);}else if(got&&svg)ic.appendChild(svg);else ic.innerHTML='<b>?</b>';
  const h=document.createElement('h3');h.textContent=got?title:'???';const p=document.createElement('p');p.textContent=text;c.append(ic,h,p);return c;}
function renderBag(){const WB=worldBag();if(WB){renderWorldBag(WB);return;}const B=bagCfg()||{title:'탐험 가방',items:Object.keys(ITEMS).map(id=>({id,name:ITEMS[id].name,f:ITEMS[id].use,where:''})),friends:[],secrets:[]};
  const Z=zone(),ic=(Z&&Z.front&&Z.front.itemIcons)||{},C=profCards();bag.innerHTML='';const H=document.createElement('div');H.className='hcard wl-pop-card';
  const nI=B.items.filter(i=>flags[i.id]).length,nF=(B.friends||[]).filter(seen).length;
  H.innerHTML='<div class="dhead"><h2></h2><p class="cnt"></p></div><div class="grid wl-pop-body"></div>';H.querySelector('h2').textContent=B.title;H.querySelector('.cnt').textContent=`받은 물건 ${nI}개 · 만난 친구 ${nF}명`;
  const G=H.querySelector('.grid'),sec=(t,gold=false)=>{const h=document.createElement('p');h.className='sec'+(gold?' gold':'');h.textContent=t;G.appendChild(h);const d=document.createElement('div');d.className='cards';G.appendChild(d);return d;};
  const A=sec('받은 물건');B.items.forEach(i=>{const got=!!flags[i.id];A.appendChild(card({got,img:ic[i.id]||null,svg:ic[i.id]?null:icon(i.id),title:i.name,text:got?i.f:(i.where?i.where+'에서 받을 수 있어요':'아직 받지 못했어요')}));});
  if((B.friends||[]).length){const F=sec('만난 친구');B.friends.forEach(id=>{const c=C[id]||{},got=seen(id);F.appendChild(card({got,img:pic(id),title:c.name,text:got?c.intro:'어딘가에서 만날 수 있어요'}));});}
  if((B.secrets||[]).length){const n=B.secrets.filter(q=>seen(q.id)).length,S=sec(`✦ 숨겨진 비밀 ${n}/${B.secrets.length}`,true);
    B.secrets.forEach(q=>{const c=C[q.id]||{},got=seen(q.id);S.appendChild(card({got,secret:true,img:pic(q.id),title:c.name,text:got?c.intro:q.where+' 어딘가에 숨어 있어요'}));});}
  const x=pbtn('close wl-pop-foot','닫기',()=>closeBag());H.appendChild(x);bag.appendChild(H);}
function renderWorldBag(L){const W=curWorld();bag.innerHTML='';const H=document.createElement('div');H.className='hcard wl-pop-card';const n=L.filter(i=>i.got).length;
  H.innerHTML='<div class="dhead"><h2>탐험 가방</h2><p class="cnt"></p></div><div class="grid wl-pop-body"></div>';const FR=worldFriends(),nF=FR.filter(f=>f.got).length;H.querySelector('.cnt').textContent=FR.length?`받은 물건 ${n}개 · 만난 친구 ${nF}명`:`받은 물건 ${n}개`;
  const G=H.querySelector('.grid'),h=document.createElement('p');h.className='sec';h.textContent='받은 물건';const d=document.createElement('div');d.className='cards';G.append(h,d);
  L.forEach(i=>d.appendChild(card({got:i.got,img:i.img,title:i.name,text:i.got?i.f:(i.where?i.where+'에서 받을 수 있어요':'아직 받지 못했어요')})));
  if(FR.length){const h2=document.createElement('p');h2.className='sec';h2.textContent=`만난 친구 ${nF}/${FR.length}`;const d2=document.createElement('div');d2.className='cards';G.append(h2,d2);
    FR.forEach(f=>{const im=pic(f.id,W.id);const cd=card({got:f.got,img:im,title:f.c.name,text:f.got?f.c.intro:(f.c.where?f.c.where+'에서 만날 수 있어요':'어딘가에서 만날 수 있어요')});
      if(f.got&&!im){const ic=cd.querySelector('.ic');ic.innerHTML='';const b=document.createElement('b');b.textContent=(f.c.name||'?').slice(0,1);b.style.cssText='color:#5a3826';ic.style.background=f.c.bg||'';ic.appendChild(b);}d2.appendChild(cd);});}
  /* 숨겨진 비밀·발견(세계 설정 finds:[{flag, name, text, where, note:{flag,text}}] — 2026-11-12): 찾은 것만 내용이 보이고, note의 flag가 켜졌으면 한 줄 더('깃발을 꽂았어요') */
  if(W&&W.finds&&W.finds.length){const nS=W.finds.filter(q=>flags[q.flag]).length,h3=document.createElement('p');h3.className='sec';h3.textContent=`✦ 숨겨진 비밀·발견 ${nS}/${W.finds.length}`;const d3=document.createElement('div');d3.className='cards';G.append(h3,d3);
    W.finds.forEach(q=>{const got=!!flags[q.flag],cd=card({got,secret:!q.open,title:q.name,text:got?q.text:q.open?(q.where?q.where+' — ':'')+q.open:(q.where?q.where+' 어딘가에 숨어 있어요':'어딘가에 숨어 있어요')}); /* open이 있으면 숨겨진 비밀이 아닌 일반 발견(금빛 비밀 카드 모양 아님, 어디서 알게 되는지 알려 줌) */
      if(got){const ic=cd.querySelector('.ic');if(ic&&!ic.querySelector('img')){ic.innerHTML='<b style="color:#e3ad35">✦</b>';}}
      if(got&&q.note&&flags[q.note.flag]){const n=document.createElement('p');n.className='note';n.textContent=q.note.text;n.style.cssText='margin:.45rem 0 0;padding:.2rem .6rem;border-radius:999px;background:#f2b63c;color:#4a2a2a;font-family:"Jua",sans-serif;font-size:.82rem;display:inline-block';cd.appendChild(n);}d3.appendChild(cd);});}
  H.appendChild(pbtn('close wl-pop-foot','닫기',()=>closeBag()));bag.appendChild(H);}
function openBag(){build();if(bagOn||frontOn||wardOn||storyOn)return;if(blocking('talk')||cardShown()){toast('지금은 가방을 열 수 없어요');return;}
  bagOn=true;sfx('ui-book');renderBag();bag.classList.add('on');popShown('bag',true);document.body.classList.add('wl-bag-on');block('bag',true);if(ctx.WL.userData.stopWalk)ctx.WL.userData.stopWalk();setTimeout(()=>{const b=bag.querySelector('.close');if(b&&!coarse)b.focus({preventScroll:true});},50);}
function closeBag(){if(!bagOn)return;bagOn=false;popShown('bag',false);sfx('ui-close');bag.classList.remove('on');document.body.classList.remove('wl-bag-on');block('bag',false);}
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
  if(hasProgress())B.append(pbtn('go','이어서 하기',()=>begin(false)),pbtn('gh','새로 시작',()=>{sfx('ui-click');el.dataset.ask='1';el.querySelector('.ask .no').focus({preventScroll:true});}));
  else B.appendChild(pbtn('go','새로 시작',()=>{sfx('ui-click');openWardrobe('start');}));
  B.appendChild(pbtn('gh','조작법',()=>{sfx('ui-click');showHelp(true);}));top.appendChild(B);
  const tip=document.createElement('p');tip.className='tip';tip.innerHTML='소리와 함께 즐겨 주세요<span class="sep"> · </span>소리가 안 들리면 조작법을 봐 주세요';top.appendChild(tip);
  const ask=document.createElement('div');ask.className='ask';ask.innerHTML='<p>처음부터 다시 할까요?<br>받은 물건과 만난 친구 기록이 지워져요.</p>';
  const ar=document.createElement('div');ar.className='row';ar.append(pbtn('yes','처음부터 하기',()=>{sfx('ui-click');fresh=true;delete el.dataset.ask;openWardrobe('start');}),pbtn('no','아니요',()=>{sfx('ui-click');delete el.dataset.ask;}));ask.appendChild(ar);top.appendChild(ask);
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
  const go=async fr=>{playWorldMusic(W);
    if(fr){if(busy)return;busy=true;try{resetAll();if(restart)await restart();startTime();playWorldMusic(W);}finally{busy=false;}} // 처음부터 하기(2026-11-04): 기록을 지우고 구역을 같은 그림으로 다시 만드는 일을 여기서 — '모험 시작' 때 화면을 까맣게 덮지 않고 카메라만 내려오게(다시 만드는 짧은 멈춤은 타이틀 위에서)
    if(worldX()||(zone().front&&zone().front.explorer)){fresh=fr;openWardrobe('start');}else begin(fr);}; // 세계에 탐험가 소개가 있으면 그것부터
  tEl=renderTitle(W,{progress:hasProgress(),onNew:()=>{sfx('ui-click');go(false);},onContinue:()=>{playWorldMusic(W);begin(false);},onFresh:()=>{sfx('ui-click');go(true);},onHow:()=>{sfx('ui-click');showHelp(true);},onClick:()=>sfx('ui-click')});
  document.querySelector('.wlg').appendChild(tEl);if(tEl._place)tEl._place();
  titleCam(W);
  return true;} // 개미굴처럼 단추에 미리 초점을 주지 않는다(Tab으로 옮겨 가면 초점 테두리가 보임)
/* 세계 배경음(world.music): 시작을 누를 때부터(개미굴처럼 — 소리는 첫 누르기에 깨어난다) */
function playWorldMusic(W){if(!W||!W.music)return;try{songs({[W.music.id]:W.music.song});bed(W.music.id);}catch(e){console.warn(e);}}
function titleCam(W){const B=W.backdrop,t0=performance.now();VIEW.hold(()=>backdropAt(B,(performance.now()-t0)/1000));}
const backToFront=()=>{if(tEl){tEl.hidden=false;titleCam(WORLD);}else{el.classList.add('on');orbit();}}; // 탐험가 소개를 닫고 첫 화면으로
function openFront(){const W=titleWorld();if(W)return openTitle(W);if(!zone()||!zone().front)return false;build();frontOn=true;document.body.classList.add('wl-front-on');block('front',true);setHints(false);corner.classList.remove('on');
  startTime();renderFront();el.classList.add('on');orbit();setTimeout(()=>{const b=el.querySelector('.go');if(b&&!coarse)b.focus({preventScroll:true});},50);return true;}
function closeFront(){if(tEl){if(tEl._unplace)tEl._unplace();tEl.remove();tEl=null;}frontOn=false;document.body.classList.remove('wl-front-on');el.classList.remove('on');block('front',false);setHints(true);corner.classList.add('on');VIEW.hold(null);}
async function begin(fr){if(busy)return;busy=true;sfx('ui-click');const W=curWorld();
  if(W){ // 처음부터 하기도 같은 연출(구역은 '처음부터 하기'를 누를 때 이미 다시 만들었다 — openTitle go) // 시리즈 공통 틀(개미굴 beginGame 그대로, 2026-11-04): 화면을 까맣게 덮지 않고 — 원더룹이 카메라를 등지고 서면 카메라가 이야기 소개 자리에서 원더룹 등 뒤로 휙 내려온다(따라가기 카메라가 지금 자리에서 이어 받아 약 0.5초)
    const P=ctx.WL.position,c=ctx.camera.position;const ry=Math.atan2(P.x-c.x,P.z-c.z);ctx.WL.rotation.y=ry;closeFront();
    VIEW.start({from:[P.x-Math.sin(ry)*7,P.y+.85+1.9,P.z-Math.cos(ry)*7]});}
  else await transition(async()=>{if(fr){resetAll();if(restart)await restart();startTime();if(W)playWorldMusic(W);}closeFront();},{out:.45,hold:.25,in:.75});
  busy=false;fresh=false; // 처음부터: 구역을 다시 만들어도 세계 배경음은 끊기지 않게(같은 곡이면 이어짐)
  if(!store.get(HELP_KEY)){store.set(HELP_KEY,'1');showHelp(true);}
  if(W&&W.firstMission){const go=()=>{if(helpShown()){requestAnimationFrame(go);return;}startMission(W);};go();}} // 첫 미션(game/mission) — 처음 조작법 창이 열려 있으면 닫힌 뒤 // 처음 시작할 때 한 번 조작법(닫으면 나침반 연출·버섯 요정 순서로 이어진다)
/* ---------- 이야기 소개(모험 떠나기 → 탐방하는 곳 소개 몇 장 → 게임) ---------- */
/* 시리즈 공통 모험 시작 연출(2026-11-04 — 개미굴 #story 그대로): 세계 설정 introNarration [{text, vo, cam:{at, r, h, a:[시작 각도, 끝 각도], speed, bob}}…] 세 단계
   ① 이 세계 소개 ② 원더룹이 왜 왔는지 ③ 게임의 목표. 화면 아래 카드에 글자가 초당 28자씩 써지고(다음을 누르면 먼저 다 보임) 그 단계 나레이션이 나온다.
   카메라는 단계마다 at 둘레 반지름 r·높이 h에서 a[0] → a[1]로 초당 speed라디안(개미굴 0.07) 돌고, 단계가 바뀌면 지금 자리에서 부드럽게 이어 간다.
   배경음은 탐험 준비 때 곡이 그대로 이어진다. 건너뛰기·다음·마지막 '모험 시작', 점(지금 단계) — 개미굴 단추·카드 그대로. */
function openIntro(W){const L=W.introNarration;storyOn=true;let i=0,full='',shown=0,typing=false,vo=null,tok=0,st=0,last=performance.now();el.classList.remove('on');
  const red=matchMedia('(prefers-reduced-motion: reduce)').matches,cam=ctx.camera;
  const path=(S,tt)=>{const d=Math.sign(S.a[1]-S.a[0]),a=S.a[0]+d*Math.min(Math.abs(S.a[1]-S.a[0]),tt*(S.speed||.07)),at=S.at,bob=S.bob?S.bob[0]*Math.sin(tt*S.bob[1]):0;
    return {from:[at[0]+Math.sin(a)*S.r,S.h+bob,at[2]+Math.cos(a)*(S.rz||S.r)],at:[...at]};};
  const c={from:cam.position.toArray(),at:[...L[0].cam.at]};
  VIEW.hold(()=>{const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;st+=dt*(red?.4:1);const T=path(L[i].cam,st),k=1-Math.exp(-dt*1.6);
    for(let j=0;j<3;j++){c.from[j]+=(T.from[j]-c.from[j])*k;c.at[j]+=(T.at[j]-c.at[j])*k;}
    if(typing){shown=Math.min(full.length,shown+dt*28);const tx=story.querySelector('.stext');if(tx)tx.textContent=full.slice(0,Math.floor(shown));if(shown>=full.length)typing=false;}
    return {from:[...c.from],at:[...c.at]};});
  const stopVO=()=>{tok++;if(vo){vo.stop();vo=null;}};
  const say=()=>{stopVO();const S=L[i],t=tok,id='intro:'+W.id+':'+i;if(S.vo){register({[id]:S.vo});preload([id]).then(()=>{if(t===tok&&storyOn)vo=voice({id,text:S.text,kind:'narration'});});}else vo=voice({text:S.text,kind:'narration'});};
  const draw=()=>{story.innerHTML='';const cd=document.createElement('div');cd.className='scard';const tx=document.createElement('p');tx.className='stext';
    const bs=document.createElement('div');bs.className='sbtns';const lastS=i===L.length-1;
    bs.append(pbtn('skip','건너뛰기',()=>end()),pbtn('next',lastS?'모험 시작':'다음',()=>{if(typing){typing=false;tx.textContent=full;return;}if(lastS)end();else{i++;st=0;show();}}));
    const d=document.createElement('div');d.className='dots';L.forEach((_,j)=>{const e=document.createElement('i');if(j===i)e.className='on';d.appendChild(e);});
    cd.append(tx,bs,d);story.appendChild(cd);setTimeout(()=>{const b=story.querySelector('.next');if(b&&!coarse)b.focus({preventScroll:true});},30);};
  const show=()=>{full=L[i].text;shown=0;typing=true;draw();sfx('talk-next');say();};
  const end=()=>{if(!storyOn)return;storyOn=false;stopVO();story.classList.remove('on');begin(fresh);};
  story._key=e=>{if(!storyOn)return;if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();end();}};
  show();story.classList.add('on');}
function openStory(){{const W=worldX();if(W&&W.introNarration&&W.introNarration.length)return openIntro(W);}
  const L=(zone().front&&zone().front.story)||[];if(!L.length){begin(fresh);return;}
  storyOn=true;let i=0;el.classList.remove('on');
  // 카메라: 구역 정보 storyView:[{from,at}…](장마다 한 자리)가 있으면 개미굴처럼 하늘에서 마을로 천천히 내려오며 장마다 그 자리로, 없으면 첫 화면처럼 돌아보기
  const SV=zone().storyView;if(SV&&SV.length){const c={from:[...SV[0].from],at:[...SV[0].at]};let last=performance.now();
    VIEW.hold(()=>{const now=performance.now(),k=1-Math.exp(-Math.min(.1,(now-last)/1000)*.9);last=now;const T=SV[Math.min(i,SV.length-1)];
      for(let j=0;j<3;j++){c.from[j]+=(T.from[j]-c.from[j])*k;c.at[j]+=(T.at[j]-c.at[j])*k;}return {from:[...c.from],at:[...c.at]};});}
  else orbit();
  const draw=()=>{story.innerHTML='';const c=document.createElement('div');c.className='scard';const t=document.createElement('p');t.className='stext';t.textContent=L[i];
    const bs=document.createElement('div');bs.className='sbtns';const last=i===L.length-1;
    bs.append(pbtn('skip','건너뛰기',()=>end()),pbtn('next',last?'모험 시작!':'다음',()=>{sfx('talk-next');if(last)end();else{i++;draw();}}));
    const d=document.createElement('div');d.className='dots';L.forEach((_,j)=>{const e=document.createElement('i');if(j===i)e.className='on';d.appendChild(e);});
    c.append(t,bs,d);story.appendChild(c);setTimeout(()=>{const b=story.querySelector('.next');if(b&&!coarse)b.focus({preventScroll:true});},30);};
  const end=()=>{if(!storyOn)return;storyOn=false;story.classList.remove('on');begin(fresh);};
  story._key=e=>{if(!storyOn)return;if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();end();}};
  draw();story.classList.add('on');}
/* ---------- 탐험가 소개(개미굴 #show) — 새로 시작할 때('start': 아래 단추 '모험 떠나기' → 이야기 소개)와 게임 중 옷 갈아입기('game': '다 골랐어요') ---------- */
function opts(list,cur,pick,dots=null){const box=document.createElement('div');box.className='opts';
  list.forEach((it,i)=>{const o=typeof it==='string'?{name:it}:it;const b=document.createElement('button');b.type='button';
    if(dots&&dots[i])[].concat(dots[i]).forEach(c=>{const d=document.createElement('span');d.className='dot';d.style.background=c;b.appendChild(d);}); // 옷 조합은 동그라미 둘(옷·목도리)
    if(o.q){b.className='q';b.disabled=true;b.setAttribute('aria-label',o.label||'잠김');b.title=o.label||'';b.textContent='?';}
    else{b.append((o.lock?'🔒 ':'')+o.name);if(o.lock)b.disabled=true;}
    b.addEventListener('click',()=>{box.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');pick(i);});
    b.setAttribute('aria-pressed',i===cur?'true':'false');box.appendChild(b);});
  return box;}
function lab(t){const p=document.createElement('p');p.className='lab';p.textContent=t;return p;}
function renderWard(mode){const U=ctx.WL.userData,F=zone().front||{},X=worldX(),E=X?{bio:X.guide&&X.guide.text,goal:X.guide&&X.guide.goal,map:(X.map||[]).map(m=>[m.name,1])}:F.explorer||{};ward.innerHTML='';const P=document.createElement('div');P.className='panel wl-pop-card';const B=document.createElement('div');B.className='body wl-pop-body'; // 팝업 공통(game/popup): 내용만 스크롤, 아래 단추는 늘 보이게
  const k=document.createElement('p');k.className='k';k.textContent='탐험가 소개';
  const nl=document.createElement('label');nl.className='namel';nl.htmlFor='wlNameIn';nl.textContent='이름';
  const ni=document.createElement('input');ni.id='wlNameIn';ni.maxLength=8;ni.autocomplete='off';ni.placeholder='원더룹';ni.value=look.name||'';ni.addEventListener('input',()=>{look.name=ni.value;save();});
  ni.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')ni.blur();});
  B.append(k,nl,ni);
  if(E.bio){const b=document.createElement('p');b.className='bio';b.textContent=E.bio;B.appendChild(b);}
  if(E.goal){const g=document.createElement('div');g.className='goal';const sp=document.createElement('span');sp.textContent='목표';g.append(sp,E.goal);B.appendChild(g);}
  if(X){const S=wsave(),pickW=(k,i,snd='ui-click')=>{S[k]=i;save();applyWorldLook(U,X);sfx(snd);faceCam();}; // 탐험 준비: 탈 색 → 옷 조합 → 장식 (개미굴 #show 순서)
    B.append(lab(X.talLabel||'탈 색'),opts(X.talColors.map(h=>h[0]),S.tal|0,i=>pickW('tal',i),X.talColors.map(h=>h[1])));
    const C=U.outfitCombos||[];B.append(lab('옷 조합'),opts(C.map(c=>c.name),look.combo|0,i=>{look.combo=i;save();U.setCombo(i);sfx('ui-click');faceCam();},C.map(c=>[c.top,c.scarf])));
    const L=decoList2(X),got=L.map(d=>!d.id||itemGot(X,d)),cur=got[S.deco|0]?S.deco|0:0;
    B.append(lab('장식'),opts(L.map((d,i)=>got[i]?{name:d.name}:{name:'?',q:true,label:`잠김 — ${d.stage?d.stage+'번째 스테이지':'스테이지'}에서 받으면 열려요`}),cur,i=>pickW('deco',i,'item-pickup')));
    if(got.some(g=>!g)){const n=document.createElement('p');n.className='acclock';n.textContent='? 칸은 스테이지에서 받은 물건이에요. 받으면 달아 볼 수 있어요';B.appendChild(n);}}
  else{
  B.append(lab('조끼 색'),opts(U.vestColors||[],U.vestIdx|0,i=>{look.vest=i;U.setVest(i);save();sfx('ui-click');},U.vestHex),
    lab('목수건 색'),opts(U.scarfColors||[],U.scarfIdx|0,i=>{look.scarf=i;U.setScarf(i);save();sfx('ui-click');},U.scarfHex));
  if(E.deco&&E.deco.list){const D=E.deco.list.map(d=>({name:d.name,lock:d.flag&&!flags[d.flag]?d.lock:null}));const cur=Math.max(0,E.deco.list.findIndex(d=>d.hood===(look.deco||E.deco.list[0].hood)));
    B.append(lab(E.deco.label||'장식'),opts(D,cur,i=>{const d=E.deco.list[i];look.deco=d.hood;save();if(U.setHood)U.setHood(d.hood);sfx('ui-click');}));
    const lk=E.deco.list.find(d=>d.flag&&!flags[d.flag]);if(lk){const n=document.createElement('p');n.className='acclock';n.textContent=lk.lock;B.appendChild(n);}}}
  const faces=U.exprNames||[];B.append(lab('표정 미리보기'),opts(faces,faces.indexOf(U.exprName||'기본'),i=>{U.setExpr(faces[i]);sfx('talk-next');}));
  if(E.map){const cur=(zone().root&&zone().root.name||'').replace(/^zone:/,'');B.appendChild(lab('모험 지도'));const ol=document.createElement('ol');ol.className='map';
    E.map.forEach(([n,id])=>{const li=document.createElement('li');li.textContent=n;if(id)li.className='on';if(id===cur)li.setAttribute('aria-current','true');ol.appendChild(li);});B.appendChild(ol);}
  const spin=document.createElement('div');spin.className='spin';spin.append(pbtn('','↺ 돌려 보기',()=>{ctx.WL.rotation.y+=Math.PI/4;spinHold=performance.now();}),pbtn('','돌려 보기 ↻',()=>{ctx.WL.rotation.y-=Math.PI/4;spinHold=performance.now();}));B.appendChild(spin);
  P.append(B,pbtn('done wl-pop-foot',mode==='start'?'모험 떠나기':'다 골랐어요',()=>closeWardrobe(mode==='start')));ward.appendChild(P);}
function save(){store.set(LOOK_KEY,JSON.stringify(look));}
function showcase(){const W=ctx.WL,cam=ctx.camera;let dx=cam.position.x-W.position.x,dz=cam.position.z-W.position.z;
  // 방 카메라 구역(베이스캠프): 첫 화면 배경 카메라가 어디 있든 그 방의 열린 쪽(방 카메라 처음 각도)에서 — 앞 소품에 가리지 않게. 새로 시작·게임 중 같은 각도
  {const Z=zone(),A=Z&&Z.areas&&Object.values(Z.areas).find(a=>a.camera&&a.camera.start);if(A&&!Z.camRoom){const az=A.camera.start[0];dx=Math.sin(az);dz=Math.cos(az);}}
  {const S=wardFrom==='start'&&curWorld()&&curWorld().backdrop.show;if(S){W.position.x=S.at[0];W.position.z=S.at[1];dx=Math.sin(S.az);dz=Math.cos(S.az);}} // 새로 시작: 세계 설정의 보여 주는 자리로(개미굴처럼)
  const L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L;
  W.rotation.y=Math.atan2(ux,uz); // 원더룹이 카메라 쪽을 살짝 비스듬히(3/4) 본다
  // 개미굴 #show 카메라 그대로: 원더룹에서 3.6m·1.25m 높이(시야 55°) → 이 카메라 시야 30°에 같은 구도가 되는 7m. 컴퓨터는 원더룹을 왼쪽(보는 점을 오른쪽 0.95m·0.9m 높이), 휴대폰은 가운데 0.3m 높이(아래 시트 위)
  const narrow=innerWidth<=760,p=W.position,k=Math.tan(27.5*Math.PI/180)/Math.tan(15*Math.PI/180),rx=uz,rz=-ux;
  // 휴대폰(2026-11-04 아이폰 — 아래 창이 몸을 덮어 고른 옷이 안 보였다): 창을 화면 46%로 줄이고, 카메라를 8m로 물려 창 위쪽 빈 곳에 전신이 들어오게
  const at=narrow?[p.x,p.y-.05,p.z]:[p.x+rx*.95,p.y+.9,p.z+rz*.95],up=narrow?1:(1.25-.9)*k,d=narrow?8:3.6*k;
  const from=[at[0]+ux*d,at[1]+up,at[2]+uz*d];VIEW.hold(()=>({at,from}));}
function canWear(){const U=ctx.WL.userData;return !(blocking('talk')||blocking('fade')||cardShown()==='result'||cardShown()==='cut'||U.riding||(U.vert&&U.vert.air));}
function openWardrobe(mode='game'){build();if(wardOn||bagOn||storyOn)return;const fromFront=mode==='start'||frontOn;if(!fromFront&&!canWear()){toast('지금은 옷을 갈아입을 수 없어요');return;}
  if(frontOn&&mode!=='start')mode='front';
  wardOn=true;wardFrom=mode;document.body.classList.add('wl-ward-on');popShown('ward',true);sfx('ui-open');if(frontOn){el.classList.remove('on');if(tEl)tEl.hidden=true;}else{block('ward',true);setHints(false);}
  corner.classList.remove('on');if(ctx.WL.userData.stopWalk)ctx.WL.userData.stopWalk();renderWard(mode);ward.classList.add('on');showcase();
  input.dragHook=dx=>{ctx.WL.rotation.y+=dx*.012;spinHold=performance.now();};spin();}
/* 탐험 준비 창이 열려 있는 동안 원더룹이 제자리에서 천천히 돈다(개미굴 showAng — 초당 0.35라디안). 끌거나 돌려 보기 단추를 누르면 2.5초 쉬었다 다시 */
/* 옷·탈 색을 고르면 원더룹이 0.4초에 걸쳐 카메라 쪽(살짝 비스듬히)을 보고 2.5초 멈췄다가 다시 돈다 — 고른 옷이 바로 보이게 */
let faceTo=null;function faceCam(){const W=ctx.WL,c=ctx.camera;faceTo=Math.atan2(c.position.x-W.position.x,c.position.z-W.position.z)+.35;spinHold=performance.now();}
let spinHold=0,spinRaf=0;function spin(){cancelAnimationFrame(spinRaf);let last=performance.now();const red=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const f=now=>{if(!wardOn)return;spinRaf=requestAnimationFrame(f);const dt=Math.min(.1,(now-last)/1000);last=now;const W=ctx.WL;if(faceTo!=null){let d=faceTo-W.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));W.rotation.y+=d*Math.min(1,dt*8);if(Math.abs(d)<.01)faceTo=null;}
    else if(!red&&now-spinHold>2500)W.rotation.y+=dt*.35;};spinRaf=requestAnimationFrame(f);}
function closeWardrobe(go=false){if(!wardOn)return;wardOn=false;document.body.classList.remove('wl-ward-on');popShown('ward',false);ward.classList.remove('on');input.dragHook=null;const U=ctx.WL.userData;if(U.setExpr)U.setExpr('기본');sfx('ui-click');
  if(wardFrom==='start'){if(go)openStory();else backToFront();}
  else if(wardFrom==='front')backToFront();else{block('ward',false);setHints(true);corner.classList.add('on');VIEW.hold(null);}}
function toggleWardrobe(){if(wardOn)closeWardrobe();else openWardrobe('game');}
/* ---------- 시작 ---------- */
/* 08이 게임을 준비한 뒤: initFront({ctx, view, zone:()=>지금 구역, restart:()=>첫 구역 다시 만들기}) → 첫 화면을 열거나(세계 front가 있을 때) 구석 단추만 */
function initFront(o){ctx=o.ctx;VIEW=o.view;zone=o.zone;restart=o.restart;WORLD=o.world||null;applyLook(ctx.WL.userData);if(SHOT)return;{const F0=zone()&&zone().front;if(F0&&F0.icons)setIcons(F0.icons);}build(); // 아이콘은 단추를 만들기 전에
  window.addEventListener('keydown',e=>{if(story&&story._key)story._key(e);
    if(bagOn&&(e.code==='Escape'||e.code==='KeyB')){e.preventDefault();e.stopImmediatePropagation();closeBag();return;}
    if(!wardOn)return;if(e.target&&e.target.tagName==='INPUT')return;if(e.code==='Escape'||(e.code==='KeyC'&&wardFrom==='game')){e.preventDefault();e.stopImmediatePropagation();closeWardrobe();}},true);
  controlHooks.onBag=()=>{if(bagOn)closeBag();else openBag();};
  if(titleWorld()){document.body.classList.add('wl-antui');['wlNotice','wlGet','wlDlg'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.remove('wl-felt');});{const w=document.querySelector('#wlDlg .who');if(w)w.classList.remove('wl-tape','mint','wl-mk');}} // 시리즈 공통 틀: 미션 카드·아이템 카드도 개미굴 #mission·#getCard 모양(펠트 없음)
  const Z=zone(),F=Z&&Z.front;if(titleWorld())setHelpNote(WORLD.controlsNote||null);else setHelpExtra(F&&F.help,F&&F.play);if(F&&F.theme)setTheme(F.theme); // 세계 색(펠트 한 벌은 game/felt)
  if(NO||!openFront()){startTime();corner.classList.add('on');}}
const frontShown=()=>frontOn,wardrobeShown=()=>wardOn,bagShown=()=>bagOn;
export {applyLook,bagShown,closeBag,closeFront,closeWardrobe,frontShown,initFront,openBag,openFront,openWardrobe,playerName,toggleWardrobe,wardrobeShown};
