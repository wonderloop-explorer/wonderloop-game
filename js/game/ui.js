/* 원더룹 — 화면 카드: 대화창·안내 카드·결과 화면·할 일 문구·말 걸기 안내 (개미굴 편 카드 모양을 옮긴 것)
   카드가 열려 있는 동안은 core.block()으로 "막힘"을 알린다 → 위협 멈춤, 나레이션 다시, 혼잣말·이벤트 기다림.
   안내 표시(hint): 돋보기·말풍선·!·이름표·길 안내 점선 같은 게임 안내는 hint()로 등록한다.
   setHints(false) 한 번으로 모두 숨긴다(영상 캡처 모드). three 물체는 hint 레이어(5)에도 넣어 둔다.
   안내 카드·결과창·비밀 카드는 카드 자리 하나를 나눠 쓴다 — 한 번에 하나, 나머지는 줄을 선다(이벤트 공통 규칙 ⑦).
   카드가 열린 때와 길이는 시점 기록(kind 'card')에 남는다 → 영상에는 카드가 그려지지 않으므로 편집 때 마커로 다시 얹는다.
   모양·크기·색은 개미굴 편 CSS 값 그대로(#dlg·#mission·#getCard·#toast, 어두운 화면 설정이면 개미굴 어두운 색):
   대화창 = 화면 아래 가운데(터치 화면은 단추 위로 206px), 미션 카드 = notice(열 때 sus 소리, 6초 뒤 저절로·0.8초 뒤부터 눌러 닫기),
   아이템 획득 카드 = itemCard(itemget 소리, 2.8초), 안내 문구 = toast(위 가운데 칩, 2.8초), 결과창 = result(열 때 success 소리, 단추 click). */
import {block,clock,cue} from './core.js';
import {sfx,soundHooks} from './sound.js';
const HINT_LAYER=5;
const css=`
.wlg{--panel:rgba(255,246,234,.95);--bubble:#fffaf2;--ink:#3e2834;--ink-soft:#75565e;--accent:#3f9fa0;--accent-ink:#fffaf2;--tag:#f2b63c;--tag-ink:#3e2834;--chip:rgba(46,28,44,.66);--chip-ink:#fff4e4;
  font-family:"Gowun Dodum","Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif;color:var(--ink)}
@media (prefers-color-scheme: dark){.wlg{--panel:rgba(44,30,42,.95);--ink:#fbe9d8;--ink-soft:#d9bfb3;--accent:#5cc4b9;--accent-ink:#1f1418;--chip:rgba(20,12,20,.7);--chip-ink:#fbe9d8;--bubble:#2e2030;--tag:#f2b63c;--tag-ink:#2a1a22}}
.wlg button{all:unset;box-sizing:border-box;cursor:pointer;font-family:inherit}
#wlDlg{cursor:pointer;position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 92px);width:min(30rem,calc(100vw - 32px));box-sizing:border-box;
  background:var(--bubble);color:var(--ink);border-radius:20px;padding:1.3rem 1.2rem .9rem;box-shadow:0 14px 40px rgba(30,14,36,.4);display:none;z-index:20}
#wlDlg .who{position:absolute;left:16px;top:-14px;background:var(--tag);color:var(--tag-ink);border-radius:999px;padding:.25rem .75rem;font-size:.88rem}
#wlDlg .line{margin:0;font-size:1.16rem;line-height:1.62}
#wlDlg .more{margin:.35rem 0 0;text-align:right;font-size:.8rem;color:var(--ink-soft)}
#wlNotice{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 92px);transform:translate(-50%,0) scale(.7);opacity:0;pointer-events:none;display:flex;gap:1rem;align-items:center;
  width:min(26rem,calc(100vw - 32px));box-sizing:border-box;background:var(--panel);color:var(--ink);border-radius:22px;padding:1.2rem 1.3rem;box-shadow:0 18px 50px rgba(30,14,36,.5);
  transition:transform .4s cubic-bezier(.2,1.5,.4,1),opacity .25s;z-index:21}
#wlNotice.on{opacity:1;transform:translate(-50%,0) scale(1);pointer-events:auto}
#wlNotice img{width:72px;height:72px;flex:none}#wlNotice img:not([src]){display:none}
#wlNotice .k{margin:0;display:inline-block;background:var(--tag);color:var(--tag-ink);border-radius:999px;padding:.15rem .7rem;font-size:.85rem}
#wlNotice .t{margin:.45rem 0 .3rem;font-size:1.3rem}
#wlGet{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 110px);width:max-content;max-width:calc(100vw - 32px);box-sizing:border-box;transform:translate(-50%,0) scale(.6);opacity:0;pointer-events:none;display:flex;align-items:center;gap:.9rem;z-index:21;
  background:var(--panel);color:var(--ink);border-radius:20px;padding:.9rem 1.4rem .9rem 1rem;box-shadow:0 14px 40px rgba(30,14,36,.45);transition:transform .38s cubic-bezier(.2,1.6,.4,1),opacity .25s}
#wlGet.on{opacity:1;transform:translate(-50%,0) scale(1)}
#wlGet .ic{flex:none;display:grid;place-items:center;width:58px;height:58px;box-sizing:border-box;border-radius:50%;background:#f3ead6;border:1.5px solid #a77a52}#wlGet .ic:has(img:not([src])){display:none}
#wlGet img{width:48px;height:48px;object-fit:contain;filter:drop-shadow(0 0 .7px #7a5236) drop-shadow(0 0 .7px #7a5236)}#wlGet img:not([src]){display:none}
#wlGet .t{margin:0;font-size:1.2rem}
#wlGet .s{margin:.2rem 0 0;font-size:.9rem;color:var(--ink-soft)}
#wlToast{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 70px);transform:translate(-50%,-10px);opacity:0;transition:opacity .3s,transform .3s;pointer-events:none;z-index:22;
  background:var(--chip);color:var(--chip-ink);border-radius:999px;padding:.45rem .9rem;font-size:.9rem;margin:0;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);white-space:nowrap}
#wlToast.on{opacity:1;transform:translate(-50%,0)}
#wlNotice .s{margin:0;color:var(--ink-soft);line-height:1.55;font-size:.95rem}
#wlNotice .h{margin:.5rem 0 0;font-size:.8rem;color:var(--ink-soft)}
#wlResult{position:fixed;inset:0;display:none;place-items:center;padding:1.2rem;box-sizing:border-box;background:rgba(30,14,36,.25);z-index:30}
#wlResult .card{background:var(--panel);border-radius:22px;padding:1.6rem 1.6rem 1.3rem;width:min(22rem,100%);box-sizing:border-box;box-shadow:0 18px 50px rgba(30,14,36,.45)}
#wlResult h2{margin:0 0 .5rem;font-size:1.5rem;font-weight:400;font-family:"Jua",sans-serif}
#wlResult p{margin:0 0 1.1rem;color:var(--ink-soft);line-height:1.6}
#wlResult p.sec{margin:-.4rem 0 1.1rem;color:#c08a20;font-weight:700}#wlResult p.sec:empty{display:none}
#wlResult .b1{display:block;width:100%;text-align:center;border-radius:14px;background:var(--accent);color:var(--accent-ink);font-size:1.05rem;padding:.8rem 1.2rem}
#wlResult .b2{display:block;width:100%;text-align:center;margin-top:.6rem;border:2px solid var(--accent);border-radius:14px;font-size:1rem;padding:.7rem 1.2rem}
#wlQuest,#wlPrompt{position:fixed;left:50%;transform:translateX(-50%);background:rgba(46,28,44,.66);color:#fff4e4;border-radius:999px;padding:.45rem .95rem;font-size:.95rem;
  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:none;z-index:15;white-space:nowrap}
#wlQuest{top:calc(env(safe-area-inset-top,0px) + 92px)}
#wlPrompt{bottom:calc(env(safe-area-inset-bottom,0px) + 112px)}
#wlAct{position:fixed;right:calc(env(safe-area-inset-right,0px) + 40px);bottom:calc(env(safe-area-inset-bottom,0px) + 126px);width:66px;height:66px;border-radius:50%;
  background:var(--tag);color:var(--tag-ink);font-size:.9rem;display:none;place-items:center;z-index:16;touch-action:none}
#wlSecret{position:fixed;inset:0;display:none;place-items:center;padding:1.2rem;box-sizing:border-box;background:rgba(30,14,36,.25);z-index:31}
#wlSecret .card{background:linear-gradient(170deg,#fffaea,#ffeab8);color:#4a2a2a;border:4px solid #e3ad35;border-radius:22px;padding:1.4rem 1.5rem 1.2rem;width:min(21rem,100%);box-sizing:border-box;text-align:center;
  box-shadow:inset 0 0 0 3px #fff6d6,0 0 34px rgba(255,196,70,.65),0 18px 50px rgba(30,14,36,.5)}
#wlSecret .k{margin:0;color:#b07a12;font-family:"Jua",sans-serif;font-size:.95rem}#wlSecret img{width:96px;height:96px;margin:.5rem auto 0;display:block}#wlSecret img:not([src]){display:none}
#wlSecret h2{margin:.5rem 0 .4rem;font-size:1.45rem;font-weight:400;font-family:"Jua",sans-serif}#wlSecret .f{margin:0;line-height:1.65}#wlSecret .n{margin:.6rem 0 0;color:#9a6a18;font-size:.9rem}#wlSecret .n:empty{display:none}
#wlSecret button{display:block;width:100%;margin-top:1rem;text-align:center;border-radius:14px;background:#e3ad35;color:#fffaf2;font-size:1.05rem;padding:.75rem 1.2rem}
body.wl-nohints .wl-hint{visibility:hidden!important}
.wlg button:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
#wlCut{position:fixed;inset:0;display:none;place-items:center;background:#1e0e24;z-index:45;cursor:pointer}#wlCut.on{display:grid;animation:wlCutIn .6s ease-out}
#wlProf{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 14px);width:min(34rem,calc(100vw - 24px));box-sizing:border-box;transform:translate(-50%,0) scale(.6);opacity:0;pointer-events:none;display:flex;align-items:stretch;gap:1.1rem;z-index:21;
  background:var(--panel);color:var(--ink);border-radius:22px;padding:1rem 1.2rem 1.05rem 1rem;box-shadow:0 14px 40px rgba(30,14,36,.45);transition:transform .38s cubic-bezier(.2,1.6,.4,1),opacity .25s}
/* 카드가 열린 동안 위쪽 할 일 문구는 잠시 숨김(카드 뒤로 비쳐 보이지 않게) */
.wlg.prof-on #wlQuest{visibility:hidden}
#wlProf.on{opacity:1;transform:translate(-50%,0) scale(1);pointer-events:auto;cursor:pointer}
#wlProf .ic{flex:none;width:9.5rem;position:relative;display:flex;align-items:flex-end;justify-content:center}
#wlProf .ic::before{content:"";position:absolute;left:0;right:0;bottom:0;aspect-ratio:1;border-radius:50%;background:var(--pbg,#f3ead6)}
#wlProf .ic img{position:relative;width:100%;aspect-ratio:3/4;object-fit:contain;object-position:50% 100%;display:block}#wlProf .ic img:not([src]){display:none}
#wlProf>div{flex:1;min-width:0;word-break:keep-all;overflow-wrap:break-word;display:flex;flex-direction:column;justify-content:center}
#wlProf .k{margin:0;align-self:flex-start;background:var(--tag);color:var(--tag-ink);border-radius:999px;padding:.12rem .7rem;font-size:.8rem}
#wlProf .t{margin:.35rem 0 .2rem;font-size:1.5rem;font-weight:700;line-height:1.2}
#wlProf .s{margin:0;font-size:.95rem;line-height:1.5;color:var(--ink-soft)}
#wlProf hr{width:100%;margin:.65rem 0 .55rem;border:0;border-top:1.5px solid rgba(117,86,94,.22)}
#wlProf .l{margin:0;font-size:.92rem;line-height:1.45;display:flex;gap:.5rem;align-items:baseline}
#wlProf .l b{flex:none;font-weight:400;font-size:.76rem;background:rgba(117,86,94,.13);color:var(--ink-soft);border-radius:999px;padding:.08rem .55rem}
#wlProf .q{position:relative;margin:.7rem 0 0 .35rem;padding:.55rem .8rem;font-size:.98rem;line-height:1.5;background:var(--bubble);border:1.5px solid rgba(167,122,82,.35);border-radius:14px}
#wlProf .q::before{content:"";position:absolute;left:-8px;top:14px;width:12px;height:12px;background:var(--bubble);border-left:1.5px solid rgba(167,122,82,.35);border-bottom:1.5px solid rgba(167,122,82,.35);transform:rotate(45deg)}
#wlProf .q:empty,#wlProf .l:empty{display:none}
@media (max-width:600px){#wlProf{gap:.75rem;padding:.85rem .9rem .9rem .7rem;border-radius:20px}#wlProf .ic{width:6.6rem}#wlProf .t{font-size:1.22rem}#wlProf .s{font-size:.86rem}#wlProf .l{font-size:.84rem}#wlProf .q{font-size:.88rem;padding:.45rem .65rem}#wlProf hr{margin:.5rem 0 .45rem}#wlProf .l{flex-direction:column;align-items:flex-start;gap:.2rem}#wlProf .l b{font-size:.72rem}} /* 휴대폰: 꼬리표를 위에 두어 좋아하는 것 내용이 한 줄로 */
#wlCut img{width:100%;height:100%;object-fit:contain}#wlCut p{position:absolute;right:calc(env(safe-area-inset-right,0px) + 14px);bottom:calc(env(safe-area-inset-bottom,0px) + 12px);margin:0;font-size:.8rem;color:rgba(255,246,234,.7)}
@keyframes wlCutIn{from{opacity:0}to{opacity:1}}
#wlFade{position:fixed;inset:0;pointer-events:none;opacity:0;z-index:44;display:none}
@media (prefers-reduced-motion: reduce){#wlNotice,#wlGet,#wlToast,#wlProf{transition:none}#wlNotice:not(.on),#wlGet:not(.on),#wlProf:not(.on){transform:translate(-50%,0)}#wlToast:not(.on){transform:translate(-50%,0)}#wlCut.on{animation:none}}
@media (max-width:600px){#wlDlg .line{font-size:1.12rem}#wlDlg .who{font-size:.95rem}}
@media (pointer:coarse){#wlDlg{bottom:calc(env(safe-area-inset-bottom,0px) + 206px)}}`;
const root=document.createElement('div');root.className='wlg';
root.innerHTML=`<div id="wlDlg" role="dialog" aria-live="polite"><span class="who"></span><p class="line"></p><p class="more"></p></div>
<div id="wlNotice" role="alert"><img alt=""><div><p class="k">미션</p><p class="t"></p><p class="s"></p><p class="h"></p></div></div>
<div id="wlGet" role="status" aria-live="polite"><span class="ic"><img alt=""></span><div><p class="t"></p><p class="s"></p></div></div><p id="wlToast" class="wl-hint" role="status" aria-live="polite"></p>
<div id="wlProf" role="status" aria-live="polite"><span class="ic"><img alt=""></span><div><p class="k">새 친구</p><p class="t"></p><p class="s"></p><hr><p class="l"></p><p class="q"></p></div></div>
<div id="wlSecret" role="dialog" aria-live="polite"><div class="card"><p class="k"></p><img alt=""><h2></h2><p class="f"></p><p class="n"></p><button type="button">좋아요</button></div></div>
<div id="wlResult" role="dialog" aria-live="polite"><div class="card"><h2></h2><p></p><p class="sec"></p><button class="b1" type="button"></button><button class="b2" type="button"></button></div></div>
<div id="wlCut" role="img"><img alt=""><p class="wl-hint"></p></div><div id="wlFade" aria-hidden="true"></div>
<p id="wlQuest" class="wl-hint"></p><p id="wlPrompt" class="wl-hint"></p><button id="wlAct" class="wl-hint" type="button">말 걸기</button>`;
{const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 if(!document.querySelector('link[data-wl-font]')){const l=document.createElement('link');l.rel='stylesheet';l.dataset.wlFont='1';l.href='https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Jua&display=swap';document.head.appendChild(l);}
 document.body.appendChild(root);}
const $=s=>root.querySelector(s);
const coarse=matchMedia('(pointer:coarse)').matches;
/* 대화창 */
const dlg=$('#wlDlg');
function showDialog(who,text,more){dlg.querySelector('.who').textContent=who||'';dlg.querySelector('.who').style.display=who?'':'none';dlg.querySelector('.line').textContent=text;dlg.querySelector('.more').textContent=more||'';dlg.style.display='block';}
function hideDialog(){dlg.style.display='none';}
const dialogShown=()=>dlg.style.display==='block';
/* 카드 자리 하나: 안내 카드·결과창·비밀 카드는 한 번에 하나만 보인다(줄 세우기 — 결과창과 비밀 카드가 겹치지 않게).
   열려 있는 동안 다른 카드를 부르면 줄을 섰다가, 앞 카드가 닫히는 즉시 들어온 순서로 열린다. 각 함수는 그 카드가 닫힐 때 resolve */
const CQ=[];let cardOn=null,cardOpenT=0;
const endCue=c=>{if(c)c.dur=+(clock.t-c.t).toFixed(4);};
function enqueue(kind,open){return new Promise(r=>{CQ.push({kind,open,r});pump();});}
function pump(){if(cardOn||!CQ.length)return;const c=CQ.shift();cardOn=c.kind;cardOpenT=performance.now();c.open(c.r);}
function cardDone(){cardOn=null;pump();}
const cardShown=()=>cardOn;
const cardsQueued=()=>CQ.length;
const closers={};const cardCloser=(kind,fn)=>{closers[kind]=fn;}; // 다른 모듈의 카드(도감·엔딩)를 닫는 방법 — 구역을 떠날 때·영상 캡처 자동 넘김
/* 안내 카드 (미션·알림): 아무 키나 누르면 닫힘 */
const nt=$('#wlNotice');let ntDone=null,ntCue=null,ntEnd=0;
function notice({kicker='미션',title='',text='',icon=null}){return enqueue('notice',r=>{ntDone=r;nt.querySelector('.k').textContent=kicker;nt.querySelector('.t').textContent=title;nt.querySelector('.s').textContent=text;
  const img=nt.querySelector('img');if(icon)img.src=icon;else img.removeAttribute('src');nt.querySelector('.h').textContent=coarse?'화면을 누르면 닫혀요':'아무 키나 누르면 닫혀요';
  ntCue=cue({kind:'card',who:kicker,text:title,sub:text,dur:0});nt.classList.add('on');block('notice',true);ntEnd=clock.t+6;sfx('sus');});} // 개미굴 미션 카드: sus 소리, 6초 뒤 저절로 닫힘
function closeNotice(){if(cardOn!=='notice')return;nt.classList.remove('on');endCue(ntCue);ntCue=null;block('notice',false);const d=ntDone;ntDone=null;cardDone();if(d)d();}
const noticeShown=()=>cardOn==='notice';
/* 비밀 카드 (숨겨진 비밀을 찾았을 때 — 개미굴 도감 비밀 카드 모양): 아무 키나 누르거나 단추로 닫힘 */
const sc=$('#wlSecret');let scDone=null,scCue=null;
function secret({kicker='숨겨진 비밀',title='',text='',icon=null,count='',button='좋아요',onOpen=null}){return enqueue('secret',r=>{scDone=r;sc.querySelector('.k').textContent=kicker;sc.querySelector('h2').textContent=title;sc.querySelector('.f').textContent=text;sc.querySelector('button').textContent=button;if(onOpen)try{onOpen();}catch(e){console.error(e);}
  sc.querySelector('.n').textContent=count;const img=sc.querySelector('img');if(icon)img.src=icon;else img.removeAttribute('src');
  scCue=cue({kind:'card',who:kicker,text:title,sub:text,dur:0});sc.style.display='grid';block('secret',true);});}
function closeSecret(){if(cardOn!=='secret')return;sc.style.display='none';endCue(scCue);scCue=null;block('secret',false);const d=scDone;scDone=null;cardDone();if(d)d();}
const secretShown=()=>cardOn==='secret';
sc.querySelector('button').addEventListener('click',closeSecret);
['keydown','pointerdown'].forEach(ev=>window.addEventListener(ev,e=>{if(performance.now()-cardOpenT<=(cardOn==='notice'?800:600)||(e.target&&e.target.closest&&e.target.closest('#wlResult,#wlSecret button')))return;
  if(cardOn==='notice')closeNotice();else if(cardOn==='secret')closeSecret();}));
/* 그림 컷 (장면 사이에 넣는 한 장짜리 그림, 예: 오프닝 편지 클로즈업): cut({src, alt, sec, id})
   화면 전체에 그림을 띄우고 sec초(게임 시간 — 촬영 모드에서도 같은 길이) 뒤나 누르면(0.6초 뒤부터) 닫힌다. 카드 자리를 함께 써서 다른 카드와 겹치지 않는다.
   영상에는 그리지 않는다(HTML) → 시점 기록 kind 'card'(who '그림', id)로 남겨 편집 때 같은 그림을 얹는다. 열고 닫을 때 종이 스치는 소리(sfx 'cut'). */
const ct=$('#wlCut');let ctDone=null,ctCue=null,ctEnd=0;
function cut({src,alt='',sec=4.5,id=''}){return enqueue('cut',r=>{ctDone=r;const img=ct.querySelector('img');img.src=src;img.alt=alt;ct.setAttribute('aria-label',alt);
  ct.querySelector('p').textContent=coarse?'화면을 누르면 넘어가요':'누르거나 아무 키나 누르면 넘어가요';ctEnd=clock.t+sec;
  ctCue=cue({kind:'card',who:'그림',id,text:alt,dur:0});ct.classList.add('on');block('cut',true);sfx('cut');});}
function closeCut(){if(cardOn!=='cut')return;ct.classList.remove('on');sfx('cut',{gain:.6});endCue(ctCue);ctCue=null;block('cut',false);const d=ctDone;ctDone=null;cardDone();if(d)d();}
/* 화면 전환: transition(fn, {out:.6, hold:.2, in:.7, color:'#1e0e24'}) → 화면이 서서히 덮였다가(게임 시간) fn()을 부르고(프라미스면 끝날 때까지 기다림)
   잠시 뒤 다시 밝아진다(비밀 통로를 지나 다른 구역으로 같은 이동). 하는 동안 막힘('fade'). 영상에는 그리지 않는다(HTML) → 시점 기록 kind 'transition'으로 편집 때 같은 전환을 넣는다.
   움직임 줄이기 설정이면 덮고 밝아지는 시간을 짧게(0.15초). */
const fd=$('#wlFade');let fade=null;
function transition(fn,{out=.6,hold=.2,in:inn=.7,color='#1e0e24'}={}){if(fade)return Promise.resolve(false);const red=matchMedia('(prefers-reduced-motion: reduce)').matches;if(red){out=Math.min(out,.15);inn=Math.min(inn,.15);}
  return new Promise(res=>{fd.style.background=color;fd.style.display='block';block('fade',true);const c=cue({kind:'transition',text:'화면 전환',dur:0});
    fade={ph:'out',t0:clock.t,out,hold,inn,fn,res,c};});}
function tickFade(){if(!fade)return;const f=fade,e=clock.t-f.t0;
  if(f.ph==='out'){fd.style.opacity=Math.min(1,e/f.out);if(e>=f.out){f.ph='wait';fd.style.opacity=1;const go=()=>{f.ph='hold';f.t0=clock.t;};let r;try{r=f.fn&&f.fn();}catch(err){console.error(err);}
    if(r&&r.then)r.catch(err=>console.error(err)).then(go);else go();}} // 보통 함수는 바로, 프라미스(구역 불러오기 등)면 끝날 때까지 기다림
  else if(f.ph==='hold'){if(e>=f.hold){f.ph='in';f.t0=clock.t;}}
  else if(f.ph==='in'){fd.style.opacity=Math.max(0,1-e/f.inn);if(e>=f.inn){fd.style.display='none';block('fade',false);endCue(f.c);fade=null;f.res(true);}}}
/* 아이템 획득 카드 (개미굴 #getCard): itemCard({title, text, icon, sec}) — 아래 가운데에 통 튀어나와 sec초(기본 2.8, 게임 시간) 뒤 사라진다.
   itemget 소리. 막지는 않지만(개미굴과 같음) 카드 자리를 함께 써서 미션 카드·결과창과 겹치지 않는다. 시점 기록 kind 'card' who '아이템' */
const gt=$('#wlGet');let gtDone=null,gtCue=null,gtEnd=0;
function itemCard({title='',text='',icon=null,sec=2.8}){return enqueue('item',r=>{gtDone=r;gt.querySelector('.t').textContent=title;gt.querySelector('.s').textContent=text;
  const img=gt.querySelector('img');if(icon)img.src=icon;else img.removeAttribute('src');gtEnd=clock.t+sec;gtCue=cue({kind:'card',who:'아이템',text:title,sub:text,dur:0});gt.classList.add('on');sfx('itemget');});}
function closeItemCard(){if(cardOn!=='item')return;gt.classList.remove('on');endCue(gtCue);gtCue=null;const d=gtDone;gtDone=null;cardDone();if(d)d();}
cardCloser('item',closeItemCard);
/* 캐릭터 소개 카드 (도감 대신 — 요정의 숲부터, game/profile.js가 부른다): profileCard({name, intro, likes, quote, img, sec})
   아이템 카드와 같은 테두리·글꼴, 왼쪽 동그라미에 초상(img: 2D 그림 경로 또는 게임 안에서 렌더링한 그림). 화면 위 가운데(휴대폰에서 원더룹·대화창을 가리지 않게).
   막지 않는다: 걷기·대화는 그대로, 아무 키나 누르기·터치로 닫히고(0.6초 뒤부터) sec초(기본 12, 게임 시간) 뒤 저절로. 시점 기록 kind 'card' who '소개' */
const pf=$('#wlProf');let pfDone=null,pfCue=null,pfEnd=0;
function profileCard({name='',intro='',likes='',quote='',img=null,bg=null,kicker='새 친구',sec=12}){return enqueue('profile',r=>{pfDone=r;pf.querySelector('.k').textContent=kicker;pf.querySelector('.t').textContent=name;pf.querySelector('.s').textContent=intro;
  {const l=pf.querySelector('.l');l.textContent='';if(likes){const b=document.createElement('b');b.textContent='좋아하는 것';const sp=document.createElement('span');sp.textContent=likes;l.append(b,sp);}}
  pf.querySelector('.q').textContent=quote?quote.replace(/^["“]|["”]$/g,''):'';pf.querySelector('.ic').style.setProperty('--pbg',bg||'#f3ead6');
  const im=pf.querySelector('img');if(img)im.src=img;else im.removeAttribute('src');im.alt=name?name+' 초상':'';pfEnd=clock.t+sec;pfCue=cue({kind:'card',who:'소개',text:name,sub:intro,dur:0});pf.classList.add('on');root.classList.add('prof-on');sfx('itemget');});}
function closeProfile(){if(cardOn!=='profile')return;pf.classList.remove('on');root.classList.remove('prof-on');endCue(pfCue);pfCue=null;const d=pfDone;pfDone=null;cardDone();if(d)d();}
const profileShown=()=>cardOn==='profile';
cardCloser('profile',closeProfile);
['keydown','pointerdown'].forEach(ev=>window.addEventListener(ev,()=>{if(cardOn==='profile'&&performance.now()-cardOpenT>600)closeProfile();}));
/* 안내 문구 (개미굴 #toast): toast('…') — 위 가운데 칩, 2.8초(게임 시간). 안내 표시라 영상에는 안 나온다 */
const ts=$('#wlToast');let tsEnd=0;
function toast(msg,sec=2.8){ts.textContent=msg;ts.classList.add('on');tsEnd=clock.t+sec;}
const tickCut=()=>{if(cardOn==='cut'&&clock.t>=ctEnd)closeCut();if(cardOn==='notice'&&clock.t>=ntEnd)closeNotice();if(cardOn==='item'&&clock.t>=gtEnd)closeItemCard();if(cardOn==='profile'&&clock.t>=pfEnd)closeProfile();
  if(tsEnd&&clock.t>=tsEnd){ts.classList.remove('on');tsEnd=0;}tickFade();};
cardCloser('cut',closeCut);
['keydown','pointerdown'].forEach(ev=>window.addEventListener(ev,()=>{if(cardOn==='cut'&&performance.now()-cardOpenT>600)closeCut();}));
/* 결과 화면: result({title,text,buttons:[{label,act}],note}) → 누른 단추의 번호로 resolve */
const rs=$('#wlResult');let rsCue=null;
function result({title,text,buttons=[],note='',sound='success'}){return enqueue('result',r=>{if(sound)sfx(sound); // 개미굴: 통과하면 success (잡혔을 때 등은 sound:'caught' 또는 null)
  rs.querySelector('h2').textContent=title;rs.querySelector('p').textContent=text;rs.querySelector('p.sec').textContent=note; // note: 비밀 개수 줄 (codex.secretLine())
  ['.b1','.b2'].forEach((s,i)=>{const b=rs.querySelector(s),B=buttons[i];b.style.display=B?'':'none';if(!B)return;b.textContent=B.label;
    b.onclick=()=>{sfx('click');rs.style.display='none';block('result',false);endCue(rsCue);rsCue=null;try{B.act&&B.act();}finally{cardDone();r(i);}};});
  rsCue=cue({kind:'card',who:'결과',text:title,sub:text,dur:0});
  rs.style.display='grid';block('result',true);});}
const resultShown=()=>cardOn==='result';
function chooseResult(i=0){if(!resultShown())return false;const b=rs.querySelector(i?'.b2':'.b1');if(b.style.display==='none'||!b.onclick)return false;b.onclick();return true;} // 영상 캡처·시험용
/* 구역을 떠날 때: 열린 카드를 닫고 줄을 비운다(기다리던 것은 그대로 끝난 것으로) */
function clearCards(){CQ.splice(0).forEach(c=>c.r(-1));closeNotice();closeSecret();closeItemCard();closeProfile();if(cardOn&&closers[cardOn])closers[cardOn]();if(resultShown()){rs.style.display='none';block('result',false);endCue(rsCue);rsCue=null;cardOn=null;}}
/* 할 일 문구·말 걸기 안내 */
const quest=$('#wlQuest'),prompt=$('#wlPrompt'),act=$('#wlAct');
function setQuest(t){quest.textContent=t||'';quest.style.display=t?'block':'none';}
/* setPrompt(글자, 터치 단추 글자): 키보드 화면은 안내 문구, 터치 화면은 말 걸기 단추. 대화 중에는 문구 없이 터치 단추만("다음"·"닫기") */
function setPrompt(t,touchOnly){prompt.textContent=t||'';prompt.style.display=t&&!coarse?'block':'none';const b=touchOnly||t;act.style.display=b&&coarse?'grid':'none';if(b)act.textContent=b.replace(/^E\s*/,'');} // 개미굴 #act 자리(오른쪽, 점프 단추 위). 대화창은 터치 화면에서 그 위(206px)로 올라가 단추를 덮지 않는다
/* 안내 표시 묶음 */
const hintObjs=new Set();let hintsOn=true;
function hint(o){if(o.isObject3D){o.layers.enable(HINT_LAYER);o.userData.wlHint=true;o.traverse(c=>c.userData.wlHint=true);hintObjs.add(o);o.visible=o.visible&&hintsOn;}else o.classList.add('wl-hint');return o;}
function setHints(on){hintsOn=on;document.body.classList.toggle('wl-nohints',!on);hintObjs.forEach(o=>{if(!on){o.userData.wlWasVisible=o.visible;o.visible=false;}else if(o.userData.wlWasVisible!=null)o.visible=o.userData.wlWasVisible;});}
const hintsVisible=()=>hintsOn;
export {profileCard,closeProfile,profileShown,itemCard,toast,closeItemCard,transition,HINT_LAYER,act as actButton,cardCloser,closeCut,cut,tickCut,closers as cardClosers,cardDone,enqueue as cardSlot,cardShown,cardsQueued,chooseResult,clearCards,closeNotice,closeSecret,secret,secretShown,dialogShown,hideDialog,hint,hintObjs,hintsVisible,notice,noticeShown,result,resultShown,setHints,setPrompt,setQuest,showDialog};
// 소리 안내 (개미굴과 같은 문구): 화면에 돌아왔는데 소리가 깨어나지 않으면, M으로 끄고 켤 때
soundHooks.onWakeFail=()=>toast('소리가 멈췄다면 화면을 한 번 눌러 주세요');
soundHooks.onMute=m=>toast(m?'소리 꺼짐 (M으로 다시 켜기)':'소리 켜짐');
