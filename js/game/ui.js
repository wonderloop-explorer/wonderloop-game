/* 원더룹 — 화면 카드: 대화창·안내 카드·결과 화면·할 일 문구·말 걸기 안내 (개미굴 편 카드 모양을 옮긴 것)
   카드가 열려 있는 동안은 core.block()으로 "막힘"을 알린다 → 위협 멈춤, 나레이션 다시, 혼잣말·이벤트 기다림.
   안내 표시(hint): 돋보기·말풍선·!·이름표·길 안내 점선 같은 게임 안내는 hint()로 등록한다.
   setHints(false) 한 번으로 모두 숨긴다(영상 캡처 모드). three 물체는 hint 레이어(5)에도 넣어 둔다. */
import {block} from './core.js';
const HINT_LAYER=5;
const css=`
.wlg{--panel:rgba(255,246,234,.96);--bubble:#fffaf2;--ink:#3e2834;--ink-soft:#75565e;--accent:#3f9fa0;--accent-ink:#fffaf2;--tag:#f2b63c;--tag-ink:#3e2834;
  font-family:"Gowun Dodum","Apple SD Gothic Neo",sans-serif;color:var(--ink)}
.wlg button{all:unset;box-sizing:border-box;cursor:pointer;font-family:inherit}
#wlDlg{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 132px);width:min(30rem,calc(100vw - 32px));box-sizing:border-box;
  background:var(--bubble);border-radius:20px;padding:1.3rem 1.2rem .9rem;box-shadow:0 14px 40px rgba(30,14,36,.35);display:none;z-index:20}
#wlDlg .who{position:absolute;left:16px;top:-14px;background:var(--tag);color:var(--tag-ink);border-radius:999px;padding:.25rem .75rem;font-size:.9rem;font-family:"Jua",sans-serif}
#wlDlg .line{margin:0;font-size:1.16rem;line-height:1.62}
#wlDlg .more{margin:.35rem 0 0;text-align:right;font-size:.8rem;color:var(--ink-soft)}
#wlNotice{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 132px);transform:translate(-50%,0) scale(.7);opacity:0;pointer-events:none;display:flex;gap:1rem;align-items:center;
  width:min(26rem,calc(100vw - 32px));box-sizing:border-box;background:var(--panel);border-radius:22px;padding:1.2rem 1.3rem;box-shadow:0 18px 50px rgba(30,14,36,.4);
  transition:transform .4s cubic-bezier(.2,1.5,.4,1),opacity .25s;z-index:21}
#wlNotice.on{opacity:1;transform:translate(-50%,0) scale(1);pointer-events:auto}
#wlNotice img{width:72px;height:72px;flex:none}#wlNotice img:not([src]){display:none}
#wlNotice .k{margin:0;display:inline-block;background:var(--tag);color:var(--tag-ink);border-radius:999px;padding:.15rem .7rem;font-size:.85rem;font-family:"Jua",sans-serif}
#wlNotice .t{margin:.45rem 0 .3rem;font-size:1.3rem;font-family:"Jua",sans-serif}
#wlNotice .s{margin:0;color:var(--ink-soft);line-height:1.55;font-size:.95rem}
#wlNotice .h{margin:.5rem 0 0;font-size:.8rem;color:var(--ink-soft)}
#wlResult{position:fixed;inset:0;display:none;place-items:center;padding:1.2rem;box-sizing:border-box;background:rgba(30,14,36,.25);z-index:30}
#wlResult .card{background:var(--panel);border-radius:22px;padding:1.6rem 1.6rem 1.3rem;width:min(22rem,100%);box-sizing:border-box;box-shadow:0 18px 50px rgba(30,14,36,.45)}
#wlResult h2{margin:0 0 .5rem;font-size:1.5rem;font-weight:400;font-family:"Jua",sans-serif}
#wlResult p{margin:0 0 1.1rem;color:var(--ink-soft);line-height:1.6}
#wlResult .b1{display:block;width:100%;text-align:center;border-radius:14px;background:var(--accent);color:var(--accent-ink);font-size:1.05rem;padding:.8rem 1.2rem}
#wlResult .b2{display:block;width:100%;text-align:center;margin-top:.6rem;border:2px solid var(--accent);border-radius:14px;font-size:1rem;padding:.7rem 1.2rem}
#wlQuest,#wlPrompt{position:fixed;left:50%;transform:translateX(-50%);background:rgba(46,28,44,.66);color:#fff4e4;border-radius:999px;padding:.45rem .95rem;font-size:.95rem;
  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:none;z-index:15;white-space:nowrap}
#wlQuest{top:calc(env(safe-area-inset-top,0px) + 92px)}
#wlPrompt{bottom:calc(env(safe-area-inset-bottom,0px) + 112px)}
#wlAct{position:fixed;right:calc(env(safe-area-inset-right,0px) + 18px);bottom:calc(env(safe-area-inset-bottom,0px) + 132px);width:76px;height:76px;border-radius:50%;
  background:var(--accent);color:var(--accent-ink);font-size:1rem;display:none;place-items:center;box-shadow:0 8px 20px rgba(30,14,36,.35);z-index:16;font-family:"Jua",sans-serif}
body.wl-nohints .wl-hint{visibility:hidden!important}
@media (max-width:600px){#wlDlg .line{font-size:1.1rem}}`;
const root=document.createElement('div');root.className='wlg';
root.innerHTML=`<div id="wlDlg" role="dialog" aria-live="polite"><span class="who"></span><p class="line"></p><p class="more"></p></div>
<div id="wlNotice" role="alert"><img alt=""><div><p class="k">미션</p><p class="t"></p><p class="s"></p><p class="h"></p></div></div>
<div id="wlResult" role="dialog" aria-live="polite"><div class="card"><h2></h2><p></p><button class="b1" type="button"></button><button class="b2" type="button"></button></div></div>
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
/* 안내 카드 (미션·알림): 아무 키나 누르면 닫힘. 닫힐 때 resolve */
const nt=$('#wlNotice');let ntDone=null,ntOpenT=0;
function notice({kicker='미션',title='',text='',icon=null}){return new Promise(r=>{if(ntDone)ntDone();ntDone=r;nt.querySelector('.k').textContent=kicker;nt.querySelector('.t').textContent=title;nt.querySelector('.s').textContent=text;
  const img=nt.querySelector('img');if(icon)img.src=icon;else img.removeAttribute('src');nt.querySelector('.h').textContent=coarse?'화면을 누르면 닫혀요':'아무 키나 누르면 닫혀요';
  nt.classList.add('on');ntOpenT=performance.now();block('notice',true);});}
function closeNotice(){if(!nt.classList.contains('on'))return;nt.classList.remove('on');block('notice',false);const d=ntDone;ntDone=null;if(d)d();}
const noticeShown=()=>nt.classList.contains('on');
['keydown','pointerdown'].forEach(ev=>window.addEventListener(ev,e=>{if(noticeShown()&&performance.now()-ntOpenT>600&&!(e.target&&e.target.closest&&e.target.closest('#wlResult')))closeNotice();}));
/* 결과 화면: result({title,text,buttons:[{label,act}]}) → 누른 단추의 번호로 resolve */
const rs=$('#wlResult');
function result({title,text,buttons=[]}){return new Promise(r=>{rs.querySelector('h2').textContent=title;rs.querySelector('p').textContent=text;
  ['.b1','.b2'].forEach((s,i)=>{const b=rs.querySelector(s),B=buttons[i];b.style.display=B?'':'none';if(!B)return;b.textContent=B.label;
    b.onclick=()=>{rs.style.display='none';block('result',false);try{B.act&&B.act();}finally{r(i);}};});
  rs.style.display='grid';block('result',true);});}
const resultShown=()=>rs.style.display==='grid';
/* 할 일 문구·말 걸기 안내 */
const quest=$('#wlQuest'),prompt=$('#wlPrompt'),act=$('#wlAct');
function setQuest(t){quest.textContent=t||'';quest.style.display=t?'block':'none';}
function setPrompt(t){prompt.textContent=t||'';prompt.style.display=t&&!coarse?'block':'none';act.style.display=t&&coarse?'grid':'none';if(t)act.textContent=t.replace(/^E\s*/,'');}
/* 안내 표시 묶음 */
const hintObjs=new Set();let hintsOn=true;
function hint(o){if(o.isObject3D){o.layers.enable(HINT_LAYER);o.userData.wlHint=true;o.traverse(c=>c.userData.wlHint=true);hintObjs.add(o);o.visible=o.visible&&hintsOn;}else o.classList.add('wl-hint');return o;}
function setHints(on){hintsOn=on;document.body.classList.toggle('wl-nohints',!on);hintObjs.forEach(o=>{if(!on){o.userData.wlWasVisible=o.visible;o.visible=false;}else if(o.userData.wlWasVisible!=null)o.visible=o.userData.wlWasVisible;});}
const hintsVisible=()=>hintsOn;
export {HINT_LAYER,act as actButton,closeNotice,dialogShown,hideDialog,hint,hintObjs,hintsVisible,notice,noticeShown,result,resultShown,setHints,setPrompt,setQuest,showDialog};
