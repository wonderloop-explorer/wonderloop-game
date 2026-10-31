/* 원더룹 — 이야기 시계(카운터) 화면 표시: 요정의 숲 "할아버지 참나무의 남은 잎" 같은, 실패·재시작 없이 줄어들기만 하는 이야기 시계.
   모양: 화면 오른쪽 위(안전 영역 안) 가는 나뭇가지에 참나무 잎이 매달려 있다(3D 마지막 잎과 같은 잎 모양·붉은 주황).
   잎이 줄면 그 잎이 가지에서 떨어져 뒤집히고 기울며 양옆으로 흔들리며 내려가고(떨어질 때마다 다른 움직임), 가지에는 작은 잎자루 자국만 남는다. 움직임 줄이기 설정이면 조용히 사라지기만.
   다른 세계는 icon(그림 SVG)·색을 바꿔 쓴다(산타 마을: 촛불 등). 게임 화면 표시라 영상에는 그리지 않는다(ui.hint) — 바뀐 때는 시점 기록 kind 'counter'.
   쓰는 법: const c=hud.counter({id:'leaves',max:5,value:5,label:'남은 잎'}); c.set(4); c.value; c.remove() */
import {cue} from './core.js';
import {hint} from './ui.js';
const css=`
.wlCounter{position:fixed;top:calc(env(safe-area-inset-top,0px) + 10px);right:calc(env(safe-area-inset-right,0px) + 12px);z-index:18;pointer-events:none;
  filter:drop-shadow(0 2px 3px rgba(46,28,44,.28))}
.wlCounter svg{display:block;overflow:visible}
/* 흔들림은 안쪽 g에 — 바깥 g의 transform 속성(잎 자리)을 CSS가 덮어쓰지 않게 */
.wlCounter .lf>g{transform-box:fill-box;transform-origin:50% 0%;animation:wlSwayLeaf 3.2s ease-in-out infinite}
.wlCounter .lf:nth-of-type(2n)>g{animation-delay:-1.1s}.wlCounter .lf:nth-of-type(3n)>g{animation-delay:-2.3s}
@keyframes wlSwayLeaf{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
/* 떨어지는 잎은 두 겹: 바깥(.fall)은 낙엽 길(좌우 흔들림·내려감), 안쪽(.tumble)은 잎 자체(뒤집힘·누움·기울기).
   움직임은 떨어질 때마다 drop()이 새로 만든다(Web Animations) — 잎마다 흔들림 횟수·폭·속도·뒤집히는 방향이 달라 반복처럼 보이지 않는다 */
.wlCounter .fall{position:absolute;top:0;left:0}
.wlCounter .fall .tumble{transform-origin:50% 40%}
@media (prefers-reduced-motion: reduce){.wlCounter .lf>g{animation:none}}
`;
let styled=false;const style=()=>{if(styled)return;styled=true;const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);};
// 참나무 잎 그림: 3D 잎(06 oakLeafGeo)과 같은 식 — 잎자루에서 끝까지 둥근 갈래 네 쌍 (잎자루가 위, 잎끝이 아래로 매달림)
function oakLeafPath(w,h){const N=28,L=h*.84,st=h*.16,wd=t=>w*.5*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.05)),.7)*(.6+.4*Math.abs(Math.sin(4*Math.PI*t+.4)));
  const cx=w/2,pt=(x,t)=>`${(cx+x).toFixed(1)},${(st+t*L).toFixed(1)}`;let d=`M${cx-.8},0 L${cx-.8},${st} `;
  for(let i=1;i<N;i++){const t=i/N;d+=`L${pt(-wd(t),t)} `;}d+=`L${pt(0,1)} `;for(let i=N-1;i>0;i--){const t=i/N;d+=`L${pt(wd(t),t)} `;}return d+`L${cx+.8},${st} L${cx+.8},0 Z`;}
const LEAF_W=22,LEAF_H=30;
function leafIcon({fill='#dc5a2c',edge='#9e3a1c',vein='#f4a070'}={}){const p=oakLeafPath(LEAF_W,LEAF_H),c=LEAF_W/2;
  return `<path d="${p}" fill="${fill}" stroke="${edge}" stroke-width="1.3" stroke-linejoin="round"/>`+
    `<path d="M${c},${LEAF_H*.2} L${c},${LEAF_H*.93}" stroke="${vein}" stroke-width="1.2" stroke-linecap="round"/>`+
    [.36,.52,.68].map(t=>{const y=LEAF_H*t;return `<path d="M${c},${y} q-3,1 -6,4 M${c},${y} q3,1 6,4" stroke="${vein}" stroke-width=".9" fill="none" stroke-linecap="round"/>`;}).join('');}
function counter({id='counter',max=5,value=max,label='남은 잎',icon=leafIcon,twig='#7a5236'}={}){style();
  const gap=27,pad=10,W=pad*2+gap*(max-1)+LEAF_W,H=LEAF_H+16,el=document.createElement('div');el.className='wlCounter wlg';el.setAttribute('role','img');
  // 가지: 살짝 굽은 가는 가지, 오른쪽 끝이 화면 밖에서 들어오는 듯 두껍다. 잎마다 짧은 잎자루 자리
  const xs=[...Array(max)].map((_,i)=>pad+i*gap),twigY=x=>5+Math.sin(x/W*Math.PI*.9)*3;
  const branch=`<path d="M2,${twigY(2)+1} Q${W*.45},${twigY(W*.45)-4} ${W+6},${twigY(W)}" stroke="${twig}" stroke-width="3.2" stroke-linecap="round" fill="none"/>`+
    `<path d="M${W*.62},${twigY(W*.62)-1} q4,-6 9,-7" stroke="${twig}" stroke-width="1.8" stroke-linecap="round" fill="none"/>`;
  const stubs=xs.map(x=>`<path d="M${x+LEAF_W/2},${twigY(x+LEAF_W/2)} l0,4" stroke="${twig}" stroke-width="1.6" stroke-linecap="round"/>`).join('');
  const leaves=xs.map((x,i)=>`<g class="lf" data-i="${i}" transform="translate(${x},${twigY(x+LEAF_W/2)+3})"><g>${icon()}</g></g>`).join('');
  el.innerHTML=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${branch}${stubs}${leaves}</svg>`;
  document.body.appendChild(el);hint(el);
  const svg=el.querySelector('svg'),lf=[...el.querySelectorAll('.lf')];let v=Math.max(0,Math.min(max,value));
  const show=()=>{lf.forEach((g,i)=>g.style.opacity=i<v?1:0); /* visibility를 잎마다 쓰면 영상 캡처의 '안내 표시 숨김'(부모 visibility:hidden)을 뚫고 보인다 → 투명도로 */el.setAttribute('aria-label',`${label} ${v}장`);};
  // 떨어지는 잎: 그 잎만 떼어 따로 그린 작은 svg가 가지 아래로 내려간다. 매번 새로 만드는 움직임(화면 표시용 무작위 — 게임 상태·영상과 상관없음)
  const rr=(a,b)=>a+Math.random()*(b-a),reduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fallMotion(){
    // 길: 3~6번 좌우로 흔들리며 내려감. 흔들림 폭은 점점 줄거나 늘고, 흔들림 끝(방향이 바뀌는 곳)에서 느려진다(ease-in-out)
    const dur=rr(2600,4200),fall=rr(220,320),n=3+Math.floor(Math.random()*4),dir=Math.random()<.5?1:-1,grow=rr(-.4,.4);const path=[{transform:'translate(0px,0px)',opacity:1,offset:0}];
    let o=0;for(let k=1;k<=n;k++){o=Math.min(.97,o+(1/n)*rr(.75,1.25));const amp=rr(8,26)*(1+grow*(k/n-.5));
      path.push({transform:`translate(${(dir*(k%2?-1:1)*amp).toFixed(1)}px,${(fall*o).toFixed(1)}px)`,opacity:o>.8?Math.max(0,1-(o-.8)/.2):1,offset:+o.toFixed(3),easing:'ease-in-out'});}
    path.push({transform:`translate(${(dir*rr(-10,10)).toFixed(1)}px,${fall.toFixed(1)}px)`,opacity:0,offset:1});
    // 잎: 4~8번 자세가 바뀐다. 한쪽으로 계속 뒤집히거나(빙글) 갔다 왔다 하거나, 눕는 정도·기울기도 매번 다르다
    const m=4+Math.floor(Math.random()*5),spin=Math.random()<.6,ydir=Math.random()<.5?1:-1;let ry=0;const tum=[{transform:'perspective(220px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',offset:0}];
    for(let k=1;k<=m;k++){ry=spin?ry+ydir*rr(30,110):ydir*(k%2?1:-1)*rr(20,80);
      tum.push({transform:`perspective(220px) rotateX(${rr(-55,55).toFixed(0)}deg) rotateY(${ry.toFixed(0)}deg) rotateZ(${rr(-38,38).toFixed(0)}deg)`,offset:+(k/(m+1)).toFixed(3),easing:Math.random()<.5?'ease-in-out':'linear'});}
    tum.push({transform:`perspective(220px) rotateX(${rr(-20,20).toFixed(0)}deg) rotateY(${(ry+ydir*rr(20,60)).toFixed(0)}deg) rotateZ(${rr(-20,20).toFixed(0)}deg)`,offset:1});
    return {dur,path,tum};}
  function drop(i){const r=lf[i].getBoundingClientRect(),b=el.getBoundingClientRect(),f=document.createElement('div');
    f.className='fall';f.style.left=(r.left-b.left)+'px';f.style.top=(r.top-b.top)+'px';
    f.innerHTML=`<div class="tumble"><svg width="${LEAF_W}" height="${LEAF_H}" viewBox="0 0 ${LEAF_W} ${LEAF_H}" aria-hidden="true">${icon()}</svg></div>`;el.appendChild(f);
    if(reduce()||!f.animate){(f.animate?f.animate([{opacity:1},{opacity:0}],{duration:450,fill:'forwards'}):null);setTimeout(()=>f.remove(),500);return;} // 움직임 줄이기: 조용히 사라지기만
    const M=fallMotion();f.animate(M.path,{duration:M.dur,fill:'forwards'});f.firstChild.animate(M.tum,{duration:M.dur*rr(.9,1.1),fill:'forwards'});setTimeout(()=>f.remove(),M.dur*1.15);}
  function set(n){n=Math.max(0,Math.min(max,n));if(n===v)return;const was=v;v=n;if(n<was)for(let i=was-1;i>=n;i--)drop(i);show();
    cue({kind:'counter',id,text:`${label} ${n}`,dur:0});}
  show();
  return {set,get value(){return v;},el,remove(){el.remove();}};}
export {counter,leafIcon,oakLeafPath};
