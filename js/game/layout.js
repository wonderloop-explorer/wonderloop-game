/* 원더룹 — 화면 가림 규칙 (2026-11-10, 시리즈 공통 — docs/series-rules.md '화면 가림 규칙')
   휴대폰 세로에서 위(할 일 안내·가방·메뉴)와 아래(조이스틱·대쉬·점프)가 차 있고 대화창이 그 사이에 떠서, 카메라가 원더룹·주민을 두는 바로 그 높이를 거의 매번 덮었다.
   글상자·카드·표시의 자리는 모두 여기서 정한다(ui.js·float.js는 모양만):
   1. 조작이 잠긴 동안(주민 대화 · 이야기 장면 sceneLock · 탈것 · 획득 연출 …) body.wl-dock → 조이스틱·대쉬·점프·말 걸기 단추를 숨기고, 대화창은 그 자리(화면 맨 아래)로 내린다.
      풀리면 0.35초 뒤 단추가 돌아온다(대사 줄 사이에 깜빡이지 않게). 대화 넘기기는 대화창·화면 누르기(터치)·E·클릭 그대로. 대화창은 세 줄까지(넘으면 글자를 줄임 — ui.showDialog).
   2. 따라가기 카메라(08)는 아래에 대화창이 떠 있는 동안 heroBand() — 단추 줄 아래 ~ 대화창 위 — 가운데로 원더룹을 올린다(평소엔 화면 아래쪽 3분의 1이라 대화창에 덮였다).
      대화 카메라(game/index pairCam)는 band() — 맨 위 단추 줄 아래 ~ 내려간 대화창 위 — 안에 두 사람의 머리부터 발까지를 넣고, 낮은 쪽 얼굴도 화면 위쪽 절반에 오게 잡는다.
   3. 화면 가운데 큰 카드는 꼭 멈춰서 봐야 하는 것만(새 친구 소개·결과창). 발견(비밀)·아이템 획득·완료·미션 안내는 화면 위쪽 띠 카드(ui.js #wlStrip·#wlGet·#wlNotice)로 떴다가 몇 초 뒤 사라진다
      (자세한 내용은 가방에서). 카드는 카드 자리 하나를 나눠 써서 한 번에 하나(ui.js 줄 세우기).
   4. 진행 표시(ui.count — 떡방아 횟수)는 화면 위쪽 고정 자리: 맨 위 단추 줄 → 횟수 → 띠 카드 → 안내 문구(toast) 순으로 위에서부터 쌓는다(stack) — 서로 겹치지 않음.
   5. 뜰 때(그리고 카메라가 자리 잡는 0.5초 뒤 한 번 더) 원더룹과 말하는 상대의 화면 자리를 재서(chars — 발~머리 위를 화면에 비춘 네모, 둥근 땅은 휜 자리), 겹치면 반대쪽으로 비켜 간다:
      대화창 아래 ↔ 위(쌓기 아래), 띠 카드·안내 문구 위 → 왼쪽 옆(가로 화면) → 아래(대화창·조이스틱 위). 다 겹치면 덜 겹치는 쪽. 화면 밖으로 나가는 자리는 후보에서 뺌.
      가로 화면에서는 조이스틱과 단추 사이가 넓어, 잠기지 않은 혼잣말 대화창도 그 사이 맨 아래에 둔다. avoid(fn)으로 피할 자리를 더 넣을 수 있다(획득 연출의 떠 있는 물건).
   6. 머리 위 말풍선('…'·하트·float.bubble)은 그대로(float.js가 topEdge() 아래에서 자리를 잡음).
   자리 계산은 무엇이 뜨거나 바뀔 때·그 0.5초 뒤·그 뒤로 0.5초마다만(매 프레임 DOM을 재지 않음). 촬영 모드에서도 같다(영상에는 HTML이 안 들어감). */
import * as THREE from 'three';
import {bentPos} from './bend.js';
import {blocking,clock} from './core.js';
import {input} from './controls.js';
const coarse=matchMedia('(pointer:coarse)').matches;
let dlgTopPx=0;
let ctx=null,speakFn=null,talkFn=null,camFn=null,dockT=-9,docked=false,dockAt=0,stackTop=0,sig='',nextAt=0,recheck=0,safeB=0,safeT=0,safeL=0,probe=null,stackBot=0;
const EXTRA=new Set(),SLOT={dlg:'bot',strip:'top'},_a=new THREE.Vector3(),_b=new THREE.Vector3();
const css=`body.wl-dock #wlJoy,body.wl-dock #wlJump,body.wl-dock #wlDash,body.wl-dock #wlAct{visibility:hidden!important;pointer-events:none!important}
body.wl-dock #wlDlg{width:min(34rem,calc(100vw - 24px - env(safe-area-inset-left,0px) - env(safe-area-inset-right,0px)))}
.wl-mv{transition:transform .38s cubic-bezier(.2,1.5,.4,1),opacity .25s,top .3s ease,left .3s ease!important}
@media (prefers-reduced-motion: reduce){.wl-mv{transition:none!important}}`;
const $=id=>document.getElementById(id);
const shown=e=>{if(!e)return false;const cs=getComputedStyle(e);return cs.display!=='none'&&cs.visibility!=='hidden';};
function safe(){if(!probe){probe=document.createElement('div');probe.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);padding-left:env(safe-area-inset-left,0px)';document.body.appendChild(probe);}
  const cs=getComputedStyle(probe);safeT=parseFloat(cs.paddingTop)||0;safeB=parseFloat(cs.paddingBottom)||0;safeL=parseFloat(cs.paddingLeft)||0;}
/* 조작이 잠겼나: 주민 대화 · 이야기 장면 · 탈것 · 획득·결말 연출 · 화면 전환 */
function locked(){if(!ctx)return false;const U=ctx.WL.userData;return !!((talkFn&&talkFn())||U.sceneLock||U.riding||blocking('itemget')||blocking('caught')||blocking('bigget')||blocking('finale')||blocking('meteor'));}
/* 화면에 비춘 인물 네모 [x0,y0,x1,y1, 얼굴 아래 끝 y] — 원더룹, 말하는 상대, avoid로 넣은 것 */
function proj(x,y,z){const b=bentPos({x,y,z});_a.set(b.x,b.y,b.z).project(ctx.camera);return _a.z>1?null:[(_a.x+1)/2*innerWidth,(1-_a.y)/2*innerHeight];}
function rectOf(x,y,z,h,wk,fk){const a=proj(x,y,z),b=proj(x,y+h,z);if(!a||!b)return null;const H=Math.abs(a[1]-b[1]),w=Math.max(18,H*wk),cx=(a[0]+b[0])/2,y0=Math.min(a[1],b[1]);return [cx-w/2,y0,cx+w/2,y0+H,y0+H*fk];}
function chars(){const L=[];if(!ctx||!ctx.camera)return L;const P=ctx.WL.position,r=rectOf(P.x,P.y-.04,P.z,blocking('itemget')?2.35:1.7,blocking('itemget')?.6:.82,blocking('itemget')?.74:.6) /* 탈 꼭대기·더듬이 여유까지(사진 모드 몸 범위와 비슷하게) */ /* 획득 연출 동안은 머리 위에 떠 있는 물건까지 */;if(r)L.push(r);
  const n=speakFn&&speakFn();if(n&&n.root){n.root.getWorldPosition(_b);const q=rectOf(_b.x,_b.y,_b.z,(n.bubbleY||1.4),.6,.5);if(q)L.push(q);}
  for(const f of EXTRA){try{const q=f();if(q){const [x,y,z,rad]=q,c=rectOf(x,y-rad,z,rad*2,1,1);if(c)L.push(c);}}catch(e){}}return L;}
const inter=(a,b)=>Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]));
/* 글상자 네모 R이 인물들을 얼마나 덮나: 얼굴은 조금만 걸려도 크게, 몸은 넓이 비율 */
function score(R,C){let s=0;for(const c of C){const A=Math.max(1,(c[2]-c[0])*(c[3]-c[1])),F=[c[0],c[1],c[2],c[4]],FA=Math.max(1,(F[2]-F[0])*(F[3]-F[1]));s+=inter(R,c)/A+3*inter(R,F)/FA;}return s;}
/* 자리 넣기(2026-11-11): 처음 뜰 때는 그 자리에서 바로(움직임 없이 나타나기만), 떠 있는 동안 자리가 바뀌면(인물을 피해 비켜 가거나 위쪽 쌓기가 밀릴 때) 0.3초에 걸쳐 부드럽게.
   크기는 offsetWidth·offsetHeight로 — 나타나는 동안 scale(.6~.7)이 걸려 있어 getBoundingClientRect는 작게 나온다(그 폭으로 왼쪽 옆자리를 잡아 카드가 화면 밖으로 잘렸다) */
let snapAll=false;
/* 처음 뜨는 것은 한 프레임 숨겨 두고(같은 순간 할 일 안내 글이 바뀌어 단추 줄 높이가 달라지는 것까지 본 뒤) 다음 화면 갱신에 자리를 한 번 더 잡은 다음 보인다 — 처음 보이는 프레임부터 제자리 */
const fresh=new Set();let freshRaf=0;
function hold1(e){e._wlNew=true;e.style.visibility='hidden';fresh.add(e);if(!freshRaf)freshRaf=requestAnimationFrame(()=>{freshRaf=0;try{place();}catch(err){}for(const q of fresh){q._wlNew=false;q.style.visibility='';}fresh.clear();});}
function setPos(e,top,left,snap){top=Math.round(top)+'px';left=left==null?'':Math.round(left)+'px';if(!e._wlOn)hold1(e);const first=!e._wlOn||snapAll||e._wlNew||snap;e._wlOn=true;
  if(e.style.top===top&&e.style.left===left&&e.style.bottom==='auto')return;
  if(first)e.classList.remove('wl-mv');else{e.classList.add('wl-mv');clearTimeout(e._wlMv);e._wlMv=setTimeout(()=>e.classList.remove('wl-mv'),340);}
  e.style.top=top;e.style.bottom='auto';e.style.left=left;}
const avoid=fn=>{EXTRA.add(fn);sig='';return ()=>{EXTRA.delete(fn);};};
/* 맨 위 단추 줄 아래 끝(쌓기 시작) */
function rowBottom(){let b=safeT+8;for(const id of ['wlQuest','wlItems','wlMenu','wlTool','dbgBtn']){const e=$(id);if(!e||!shown(e))continue;const r=e.getBoundingClientRect();if(r.height&&r.top<innerHeight*.3&&r.bottom<innerHeight*.42)b=Math.max(b,r.bottom);}return b;}
const topEdge=()=>stackBot; // 위쪽 쌓기의 아래 끝(float.js 말풍선·표시가 이 아래에서 자리 잡음)
/* 대화 카메라가 인물을 넣을 화면 띠 [위, 아래](0~1): 맨 위 단추 줄 아래 ~ 맨 아래로 내려간 대화창 위 */
function band(){const H=innerHeight||1,d=$('wlDlg');let dh=0;if(d&&shown(d))dh=d.getBoundingClientRect().height;dh=Math.max(dh,coarse?132:118)+22;
  /* 넓은 화면(가로·컴퓨터)은 가방·메뉴가 구석에 있고 가운데 위에는 할 일 안내만 → 그 아래부터. 좁은 화면(세로)은 단추 줄 전체 아래부터 */
  let tp=rowBottom();if(innerWidth>700){tp=safeT+8;const q=$('wlQuest');if(q&&shown(q)){const r=q.getBoundingClientRect();if(r.height)tp=r.bottom;}}
  if(stackTop>tp+12)tp=Math.max(tp,stackTop-8); /* 횟수가 떠 있으면 그 아래부터(위로 비켜 간 대화창·띠 카드는 빼고 — 카메라가 인물을 띠에 넣으면 대화창은 아래로 돌아온다) */
  return [Math.min(.36,(tp+24)/H),Math.max(.55,1-(safeB+(coarse?14:22)+dh+8)/H)];}
/* 자리 고르기: 후보 [x0, y0] 가운데 인물을 가장 덜 덮는 것(앞 후보가 거의 안 덮으면 — 0.12 아래 — 그대로) */
function pick(w,h,C,cands,keep=0){const S=cands.map(c=>score([c[0],c[1],c[0]+w,c[1]+h],C));if(keep>0&&keep<cands.length&&S[keep]<=.12)return keep; /* 한번 비켜 간 자리는 거기가 덮이지 않는 한 그대로(오락가락하지 않게) */
  let best=0,bs=1e9;for(let i=0;i<cands.length;i++){if(i===0&&S[0]<=.12)return 0;if(S[i]+.1<bs){bs=S[i];best=i;}}return best;}
function place(){if(!ctx)return;safe();const H=innerHeight,W=innerWidth,C=chars(),row=rowBottom();
  /* 넓은 화면(가로·컴퓨터): 가방·메뉴는 구석에 있으니, 그 사이에 들어가는 가운데 표시는 할 일 칩 바로 아래부터 쌓는다(낮은 화면에서 한 줄이라도 위로 — 원더룹 탈에 닿지 않게) */
  let y=row+8,cL=0,cR=W;if(W>700){let q=safeT+8;const qe=$('wlQuest');if(qe&&shown(qe)){const r=qe.getBoundingClientRect();if(r.height)q=r.bottom;}y=q+8;
    for(const id of ['wlItems','wlTool','dbgBtn']){const e=$(id);if(e&&shown(e)){const r=e.getBoundingClientRect();if(r.height&&r.top<H*.3)cL=Math.max(cL,r.right);}}
    for(const id of ['wlMenu','wlCamBtn']){const e=$(id);if(e&&shown(e)){const r=e.getBoundingClientRect();if(r.height&&r.top<H*.3)cR=Math.min(cR,r.left);}}}
  const clear=w=>{if((W-w)/2<cL+8||(W+w)/2>cR-8)y=Math.max(y,row+8);}; /* 구석 단추에 걸리는 넓은 것은 단추 줄 아래로 */
  const dlg=$('wlDlg'),cnt=$('wlCount'),toast=$('wlToast'),strips=['wlStrip','wlGet','wlNotice'].map($).filter(e=>e&&e.classList.contains('on'));
  const dOn=dlg&&dlg.style.display==='block',cOn=cnt&&cnt.classList.contains('on'),tOn=toast&&toast.classList.contains('on');
  /* 조이스틱·단추(안 숨겨졌을 때) 위 끝과, 가로 화면에서 그 사이 빈 폭 */
  const joy=$('wlJoy'),dash=$('wlDash'),ctl=coarse&&!docked&&joy&&shown(joy);let ctlTop=H-safeB-8,gapL=0,gapR=W;
  if(ctl){const j=joy.getBoundingClientRect(),d=dash&&shown(dash)?dash.getBoundingClientRect():null;ctlTop=Math.min(j.top,d?d.top-16:H)-10;gapL=j.right+8;gapR=(d?d.left:W)-8;}
  /* 왼쪽 옆자리(가로 화면처럼 위·아래가 모두 인물에 걸릴 때): 가방 칸 아래 ~ 조이스틱 위 */
  let leftTop=row+8;{const it=$('wlItems');if(it&&shown(it)){const r=it.getBoundingClientRect();leftTop=Math.max(leftTop,r.bottom+8);}}const leftX=safeL+14;
  for(const id of ['wlCount','wlToast','wlStrip','wlGet','wlNotice']){const e=$(id);if(e&&!e.classList.contains('on')){e._wlOn=false;e._slot=0;}}if(dlg&&!dOn){dlg._wlOn=false;dlg._slot=0;}
  if(cOn){clear(cnt.offsetWidth);setPos(cnt,y,null);y+=cnt.offsetHeight+8;}stackTop=y;
  /* 대화창: 아래(잠겼거나 조이스틱과 단추 사이에 들어가면 맨 아래, 아니면 조이스틱·단추 위) ↔ 위 */
  let dTop=H,dLeft=W;
  if(dOn){const w=dlg.offsetWidth,h=dlg.offsetHeight,x0=(W-w)/2,tag=22,low=docked||(ctl&&gapR-gapL>=w+8),bo=low?(coarse?14:22):(coarse?206:92);
    const yB=H-safeB-bo-h,cands=[[x0,yB-tag]];clear(w);if(y+tag+h<H*.62&&!(docked&&camFn&&camFn()&&performance.now()-dockAt<900))cands.push([x0,y]); /* 잠긴 직후 0.9초는 아래 그대로: 대화 카메라가 인물을 대화창 위 띠로 옮기는 중 */
    const k=pick(w,h+tag,C,cands,0),was=dlg._slot;dlg._slot=k;SLOT.dlg=k===1?'top':'bot';const dsnap=was===k; /* 아래 ↔ 위로 비켜 갈 때만 부드럽게(대사가 바뀌어 높이가 달라질 때는 바로) */
    if(SLOT.dlg==='top'){setPos(dlg,y+tag,null,dsnap);y+=tag+h+10;dLeft=x0;}
    else{setPos(dlg,yB,null,dsnap);dTop=yB-tag;}dlgTopPx=SLOT.dlg==='bot'&&(docked||H<520)?dTop:0;}
  else{dlgTopPx=0;if(dlg){dlg.style.top='';dlg.style.bottom='';dlg.classList.remove('wl-mv');}}
  /* 띠 카드·안내 문구: 위 가운데(쌓기) → 왼쪽 옆 → 아래(대화창·조이스틱 위) */
  const put=(e,stack)=>{const w=e.offsetWidth,h=e.offsetHeight,x0=(W-w)/2,floor=Math.min(dTop,ctlTop)-8;clear(w);const cands=[[x0,y]];
    if(leftX+w<Math.min(W*.48,dLeft-8)&&leftTop+h<floor)cands.push([leftX,leftTop]);
    if(stack&&floor-h>y+h*.5)cands.push([x0,floor-h]);
    const fit=cands.filter(c=>c[1]+h<=floor+8),use=fit.length?fit:cands,kind=c=>c[0]===leftX?1:c[1]===y?0:2,keep=e._slot?use.findIndex(c=>kind(c)===e._slot):0,k=pick(w,h,C,use,keep),c=use[k];e._slot=kind(c);setPos(e,c[1],c[0]===x0?null:c[0]+w/2);
    if(c[0]===x0&&c[1]===y)y+=h+8;else if(c[0]===leftX)leftTop+=h+8;return c[0]===leftX?1:c[1]===y?0:2;};
  for(const e of strips)SLOT.strip=['top','side','bot'][put(e,true)]||'top';
  if(tOn)put(toast,false);
  /* 'E …' 안내(컴퓨터, 화면 아래 가운데 — 주민 머리 위에 붙은 때는 dialog가 자리를 잡음): 대화창이 아래에 떠 있으면 숨기고(겹침), 낮은 화면은 발밑으로 내린다 */
  {const pr=$('wlPrompt');if(pr&&!pr.dataset.at){pr.style.visibility=dOn&&SLOT.dlg==='bot'?'hidden':'';pr.style.bottom=H<700?`calc(env(safe-area-inset-bottom,0px) + 26px)`:'';}else if(pr)pr.style.visibility='';}
  stackBot=y;snapAll=false;}
function tickLayout(){if(!ctx)return;const now=clock.t,lk=locked();if(lk)dockT=now;const dk=lk||now-dockT<.35;
  if(dk!==docked){docked=dk;if(dk)dockAt=performance.now();document.body.classList.toggle('wl-dock',dk);if(dk&&input.releaseJoy)input.releaseJoy();sig='';}
  const dlg=$('wlDlg'),on=id=>{const e=$(id);return e&&e.classList.contains('on')?1:0;};
  const s=[dlg&&dlg.style.display==='block'?dlg.querySelector('.line').textContent.length+':'+dlg.querySelector('.line').textContent.slice(0,12):0,on('wlStrip'),on('wlGet'),on('wlNotice'),on('wlCount'),on('wlToast'),docked?1:0,innerWidth,innerHeight].join('|');
  const perf=performance.now();
  if(s!==sig){sig=s;place();recheck=perf+500;nextAt=perf+500;}
  else if(recheck&&perf>=recheck){recheck=0;place();}
  else if(perf>=nextAt){nextAt=perf+500;place();}} /* 0.5초마다 다시(카메라가 움직여 인물 자리가 바뀌면 비켜 감 — 앞 후보가 거의 안 덮으면 그대로라 오락가락하지 않음) */
function initLayout(c,o){ctx=c;speakFn=o.speaking;talkFn=o.talking;camFn=o.talkCam||null; /* 대화 카메라가 실제로 잡혔을 때만 '잠긴 직후 아래 그대로'(다른 연출 카메라가 돌고 있으면 평소처럼 비켜 감) */const st=document.createElement('style');st.dataset.wl='layout';st.textContent=css;document.head.appendChild(st);safe();stackBot=rowBottom()+8;
  addEventListener('resize',()=>{sig='';snapAll=true;});
  /* 글꼴이 늦게 불러와져 글상자 크기가 바뀌면(첫 화면에서 특히) 자리를 다시 — 움직임 없이 바로 */
  if(document.fonts){const re=()=>{sig='';snapAll=true;};try{document.fonts.addEventListener('loadingdone',re);document.fonts.ready.then(re);}catch(e){}}}
const isDocked=()=>docked;
/* 따라가기 카메라가 원더룹을 둘 화면 띠 [위, 아래](0~1) — 대화창이 아래에 떠 있고(잠긴 동안, 또는 낮은 화면) 그 위로 비켜 줘야 할 때만, 아니면 null (08: 보는 점을 내려 원더룹을 띠 가운데로) */
function heroBand(){if(!dlgTopPx)return null;const H=innerHeight||1,d=$('wlDlg');if(!d||d.style.display!=='block')return null;const b=band();return [b[0],Math.max(b[0]+.2,(dlgTopPx-8)/H)];}
export {heroBand,avoid,band,chars,initLayout,isDocked,locked,place as layoutNow,tickLayout,topEdge};
