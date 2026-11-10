/* 원더룹 — 3D 자리에 붙어 다니는 화면 표시(HTML, 3D 그리기 0회 — 2026-11-10, 시리즈 공통)
   add({root | at:[x,y,z], y, cls, text | html, far, prio, hint}) → {el, set(text), html(h), show(켜짐), remove()}
     root(3D 물체) 또는 at(월드 자리)의 y만큼 위를 화면에 비춘 자리에 붙는다(둥근 땅은 휜 자리로). far보다 멀면(원더룹 기준 수평 거리) 숨김, 카메라 뒤면 숨김.
     clamp:true면 붙는 점이 화면 밖이어도 숨기지 않고 가장자리에 붙인다(횟수 — 가까이 잡은 카메라에서 절구 위가 화면 밖일 때).
     화면 밖으로 나가지 않게 가장자리 안으로 당기고(맨 위 단추 줄 아래), 아래 대화창·획득 카드가 떠 있으면 그 위로 올린다 → 대화창에 가려지지 않는다.
     prio가 높은 것부터 자리를 잡고, 낮은 것은 겹치면 그 아래로 비켜난다(횟수 표시 > 말풍선).
   bubble({root, y, text, sec}) 머리 위 작은 말풍선(크림색 둥근 네모 + 꼬리) — sec초 뒤 사라짐. 체험 중 구경꾼 한마디처럼 아래 대화창을 쓰면 화면을 가리는 곳에.
   count({root | at, y, label, n, max}) 물건 바로 위에 크게 띄우는 횟수('떡 찧기 ●●○ 2/3') → {set(n), remove()}.
   mark({root | at, y, far}) 멀리서도 보이는 반짝이 표시(✦ 금빛, 천천히 숨쉼) — 해 볼 수 있는 체험 자리. 가까이(near, 기본 2.6m) 가면 숨는다(그때는 발밑 동그라미·안내 문구 차례).
   모두 안내 표시(ui.hint — 영상 캡처·사진 모드에서는 숨김). 구역을 떠나면 clearFloat(). 움직임 줄이기면 숨쉬기·튀기 없음. */
import * as THREE from 'three';
import {bentPos} from './bend.js';
import {clock} from './core.js';
import {hint,hintsVisible} from './ui.js';
const L=[];let ctx=null,css=false;const _p=new THREE.Vector3();
const CSS=`.wl-float{position:fixed;left:0;top:0;z-index:41;pointer-events:none;margin:0;opacity:0;transition:opacity .2s;will-change:transform}
.wl-float.on{opacity:1}
.wl-fbub{background:#fffaf2;color:#3e2834;border:2.5px solid #5a3826;border-radius:16px;padding:.3rem .7rem;font-family:"Jua","Gowun Dodum",sans-serif;font-size:clamp(14px,2.7vh,19px);line-height:1.25;max-width:min(62vw,280px);text-align:center;word-break:keep-all;box-shadow:0 3px 0 rgba(90,56,38,.4)}
.wl-fbub:after{content:"";position:absolute;left:50%;bottom:-9px;margin-left:-7px;border:7px solid transparent;border-top-color:#5a3826;border-bottom:0}
.wl-fcnt{display:flex;align-items:center;gap:.5rem;padding:.45rem 1.05rem;border-radius:999px;background:rgba(46,28,44,.9);color:#fff4e4;font-family:"Jua","Gowun Dodum",sans-serif;font-size:clamp(19px,3.9vh,27px);white-space:nowrap;box-shadow:0 3px 0 rgba(30,14,36,.45)}
.wl-fcnt i{width:.8em;height:.8em;border-radius:50%;border:2.5px solid #fff4e4;box-sizing:border-box;display:inline-block}.wl-fcnt i.f{background:#f7c948;border-color:#f7c948}.wl-fcnt b{font-weight:400;color:#f7c948}
.wl-fcnt.pop{animation:wlFPop .32s ease}@keyframes wlFPop{0%{scale:1}45%{scale:1.16}100%{scale:1}}
.wl-fmark{font-size:clamp(26px,5.2vh,38px);line-height:1;color:#ffd84a;text-shadow:0 0 10px #fff3b0,0 0 3px #b8860b;font-style:normal;animation:wlFMark 1.6s ease-in-out infinite}
@keyframes wlFMark{0%,100%{scale:.82;rotate:0deg}50%{scale:1.18;rotate:18deg}}
@media (prefers-reduced-motion: reduce){.wl-fmark,.wl-fcnt.pop{animation:none}}`;
function initFloat(c){ctx=c;}
function add(o){if(!css){css=true;const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);}
  const el=document.createElement('div');el.className='wl-float '+(o.cls||'');el.setAttribute('aria-hidden','true');if(o.html!=null)el.innerHTML=o.html;else el.textContent=o.text||'';
  (document.querySelector('.wlg')||document.body).appendChild(el);if(o.hint!==false)hint(el);
  const it={el,o,on:true,end:o.sec?clock.t+o.sec:0,prio:o.prio||0,
    set(t){el.textContent=t;},html(h){el.innerHTML=h;},show(v){it.on=!!v;},remove(){const i=L.indexOf(it);if(i>=0)L.splice(i,1);el.classList.remove('on');setTimeout(()=>el.remove(),220);}};
  L.push(it);L.sort((a,b)=>b.prio-a.prio);return it;}
const bubble=o=>add({cls:'wl-fbub',prio:1,sec:2.6,far:22,...o});
function count(o){const draw=n=>{let h='<span></span>';for(let i=0;i<o.max;i++)h+=i<n?'<i class="f"></i>':'<i></i>';return h+'<b>'+n+'/'+o.max+'</b>';};
  const it=add({cls:'wl-fcnt',prio:5,far:30,clamp:true,...o,html:draw(o.n||0)});it.el.firstChild.textContent=o.label||'';
  const set=n=>{it.html(draw(n));it.el.firstChild.textContent=o.label||'';it.el.classList.remove('pop');void it.el.offsetWidth;it.el.classList.add('pop');};return {el:it.el,set,remove:it.remove,show:it.show};}
const mark=o=>add({cls:'wl-fmark',text:'✦',prio:0,far:26,near:2.6,...o});
const shown=e=>{const cs=getComputedStyle(e);return cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>.05;}; /* 고정 자리 요소는 offsetParent가 늘 null이라 스타일로 본다 */
const hit=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
function tickFloat(){if(!ctx||!L.length)return;const cam=ctx.camera,W=ctx.WL,P=W.position,vis=hintsVisible(),iw=innerWidth,ih=innerHeight,placed=[];
  /* 위·아래 한계: 맨 위 단추 줄 아래 ~ 아래 대화창·획득 카드 위 */
  let top=8;for(const id of ['wlQuest','wlItems','wlMenu']){const e=document.getElementById(id);if(!e||!shown(e))continue;const r=e.getBoundingClientRect();if(r.height&&r.top<ih*.3)top=Math.max(top,r.bottom+6);}
  let bot=ih-8;for(const id of ['wlDlg','wlGet']){const e=document.getElementById(id);if(!e||!shown(e))continue;const r=e.getBoundingClientRect();if(r.height&&r.top>ih*.35)bot=Math.min(bot,r.top-8);}
  for(let i=L.length-1;i>=0;i--){const it=L[i];if(it.end&&clock.t>=it.end)it.remove();}
  /* 말풍선이 원더룹 얼굴을 덮지 않게: 탈 둘레를 먼저 자리로 잡아 둔다(말풍선만 비켜남 — 횟수 표시는 그대로) */
  let face=null;{const b=bentPos({x:P.x,y:P.y+1.02,z:P.z});_p.set(b.x,b.y,b.z);const dz=_p.distanceTo(cam.position);_p.project(cam);if(_p.z<1){const r=.5/(Math.max(.5,dz)*Math.tan(cam.fov*Math.PI/360))*ih/2,fx=(_p.x+1)/2*iw,fy=(1-_p.y)/2*ih;face=[fx-r,fy-r,fx+r,fy+r];}}
  let faceIn=false;
  for(const it of L){const o=it.o,el=it.el;let x,y,z;if(face&&!faceIn&&it.prio<5){faceIn=true;placed.push(face);}if(o.root){o.root.getWorldPosition(_p);x=_p.x;y=_p.y;z=_p.z;}else{[x,y,z]=o.at;}
    const d=Math.hypot(x-P.x,z-P.z);let ok=vis&&it.on&&!(o.far&&d>o.far)&&!(o.near&&d<o.near)&&!(o.when&&!o.when());
    if(ok){const b=bentPos({x,y:y+(o.y||0),z});_p.set(b.x,b.y,b.z).project(cam);if(_p.z>1||(!o.clamp&&(Math.abs(_p.x)>1.15||Math.abs(_p.y)>1.25)))ok=false;}
    if(!ok){el.classList.remove('on');continue;}
    const w=el.offsetWidth,h=el.offsetHeight;let sx=(_p.x+1)/2*iw,sy=(1-_p.y)/2*ih; /* 붙는 점 = 표시의 아래 가운데 */
    sx=Math.min(iw-w/2-8,Math.max(w/2+8,sx));let ty=Math.min(bot-h,Math.max(top,sy-h-(o.cls&&o.cls.includes('fbub')?10:4)));
    let r=[sx-w/2,ty,sx+w/2,ty+h];for(let k=0;k<3;k++){const q=placed.find(q=>hit(r,q));if(!q)break;ty=q[3]+6;if(ty+h>bot)ty=Math.max(top,q[1]-h-6);r=[sx-w/2,ty,sx+w/2,ty+h];}
    placed.push(r);el.style.transform=`translate(${Math.round(sx-w/2)}px,${Math.round(ty)}px)`;el.classList.add('on');}}
function clearFloat(){L.splice(0).forEach(it=>it.el.remove());}
export {add,bubble,clearFloat,count,initFloat,mark,tickFloat};
