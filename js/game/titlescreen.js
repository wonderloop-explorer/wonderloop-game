/* 원더룹 — 시작 타이틀 화면 틀 (시리즈 공통, 2026-11-04 — 개미굴 게임 antvillage #intro의 디자인·글꼴·모션을 그대로 옮김)
   모든 세계가 같은 것(이 파일에 고정): 리본 문구 '탐험가 원더룹의 대모험'·리본 모양과 색, 로고 형식(Jua, 두꺼운 진갈색 #4a2a2a 테두리, 아래로 쌓인 입체 그림자,
   글자마다 튀어 오르며 등장 → 살랑 흔들림, 글자 기울기 차례), 점선 행렬 자리, 설명 두 줄(뒤에 아주 옅은 어두운 받침), 단추 모양, 소리 안내 문구.
   세계마다 채우는 것(세계 설정 js/worlds/<세계>.js — 형식은 그 파일 맨 위 주석): title, letterColors, titleDeco, parade, intro, startColor, backdrop, controlsNote.
   단추: 저장 기록이 없으면 [새로 시작 | 조작법], 있으면 [이어서 하기 | 처음부터(작게) | 조작법] — '처음부터'는 한 번 더 묻고 지운다.
   render(world, {progress, onNew, onContinue, onFresh, onHow}) → 첫 화면 요소(붙인 뒤 el._place()로 장식 자리를 잡는다). 사라질 때는 요소를 지우면 된다(모두 CSS 애니메이션 — 3D 그리기 0회). */
const RIBBON='탐험가 원더룹의 대모험';
const TIP='소리와 함께 즐겨 주세요<span class="sep"> · </span>소리가 안 들리면 조작법을 봐 주세요';
const TILT=[-6,4,-3,5,-4];          // 글자 기울기(도) — 개미굴 앤트빌리지 그대로, 글자가 많으면 되풀이
const INK='#4a2a2a';                // 로고 테두리·그림자 (모든 세계 고정)
const css=`
#wlTitle{position:fixed;inset:0;z-index:30;display:grid;place-items:center;padding:1.2rem;box-sizing:border-box;overflow-y:auto;
  font-family:"Gowun Dodum","Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif;
  background:radial-gradient(ellipse 60% 45% at 50% 48%,rgba(30,14,36,.42) 0%,rgba(30,14,36,.18) 60%,rgba(30,14,36,0) 100%),radial-gradient(ellipse at 50% 55%,rgba(30,14,36,0) 35%,rgba(30,14,36,.55) 100%)}
#wlTitle .titlebox{text-align:center;color:#fff6e6;animation:wtRise .9s cubic-bezier(.2,1.3,.4,1) both}
#wlTitle .ribbon{display:inline-block;position:relative;margin:0 0 .3rem;animation:wtDrop .6s cubic-bezier(.2,1.5,.4,1) both}
#wlTitle .ribbon span{display:inline-block;background:#ffb86b;color:#3e2834;font-size:.95rem;padding:.38rem 1.6rem;clip-path:polygon(0 0,100% 0,94% 50%,100% 100%,0 100%,6% 50%);box-shadow:0 3px 0 #a8603f}
#wlTitle .logo2{position:relative;display:flex;justify-content:center;width:max-content;margin:.35rem auto .1rem;font-family:"Jua","Gowun Dodum",sans-serif;font-weight:400;font-size:clamp(3.4rem,13.5vw,7rem);line-height:1.08;letter-spacing:.01em}
#wlTitle .logo2>span{display:inline-block;color:var(--c);transform:rotate(var(--r));
  text-shadow:.045em 0 ${INK},-.045em 0 ${INK},0 .045em ${INK},0 -.045em ${INK},.032em .032em ${INK},-.032em .032em ${INK},.032em -.032em ${INK},-.032em -.032em ${INK},
    0 .085em 0 ${INK},.03em .1em 0 ${INK},-.03em .1em 0 ${INK},0 .13em 0 ${INK},0 .2em .28em rgba(30,14,36,.55);
  animation:wtPop .75s cubic-bezier(.2,1.7,.4,1) both,wtWave 3.6s ease-in-out infinite;animation-delay:calc(var(--i)*90ms + .25s),calc(var(--i)*.2s + 1.4s)}
#wlTitle .logo2>span.gap{margin-left:.28em}
/* 상징 장식: 세계 titleDeco.at 번째 글자의 왼쪽 끝(--dx)에 붙는다. 장식 모양·자리·반복 모션은 세계 titleDeco.css(.wt-deco 안) */
#wlTitle .wt-deco{position:absolute;left:var(--dx,0);top:0;width:0;height:0;pointer-events:none}
/* 점선 위 행렬: 세계 parade (그림·개수·크기·간격·색·빠르기) */
#wlTitle .trail{width:min(26rem,86vw);height:26px;margin:.2rem auto .9rem;overflow:hidden;position:relative;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent);mask-image:linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent)}
#wlTitle .trail::before{content:"";position:absolute;left:0;right:0;top:19px;border-top:3px dotted rgba(255,233,194,.45)}
#wlTitle .march{display:flex;gap:var(--gap);width:max-content;animation:wtMarch var(--sec) linear infinite;color:var(--pc)}
#wlTitle .march i{display:block;width:var(--w);height:var(--h);animation:wtStep var(--hop) steps(2) infinite}
#wlTitle .march svg,#wlTitle .march img{width:100%;height:100%;display:block}
/* 설명 두 줄 — 밝은 세계에서도 흰 글씨가 읽히게 아주 옅은 어두운 받침(뒤에 번진 타원) */
#wlTitle .sub{position:relative;isolation:isolate;margin:0 0 1.4rem;line-height:1.65;font-size:1.02rem;text-shadow:0 2px 8px rgba(30,14,36,.75)}
#wlTitle .sub::before{content:"";position:absolute;z-index:-1;inset:-.5em -2.2em;border-radius:50%;pointer-events:none;
  background:radial-gradient(closest-side,rgba(30,14,36,.34),rgba(30,14,36,.2) 55%,rgba(30,14,36,0))}
#wlTitle .tbtns{display:flex;gap:.6rem;justify-content:center;align-items:center;flex-wrap:wrap}
#wlTitle .go{border:0;border-radius:14px;background:var(--sc,#ffd46a);color:#3e2834;font:inherit;font-size:1.15rem;padding:.85rem 2rem;cursor:pointer;box-shadow:0 5px 0 #a8603f;transition:transform .12s,box-shadow .12s}
#wlTitle .go:hover{transform:translateY(-2px);box-shadow:0 7px 0 #a8603f}
#wlTitle .go:active{transform:translateY(3px);box-shadow:0 2px 0 #a8603f}
#wlTitle .ghost{border:2px solid rgba(255,246,230,.85);background:rgba(30,14,36,.3);color:#fff6e6;border-radius:14px;font:inherit;font-size:1rem;padding:.7rem 1.3rem;cursor:pointer}
#wlTitle .ghost.small{font-size:.88rem;padding:.45rem .85rem;border-width:1.5px;border-radius:12px}
#wlTitle button:focus-visible{outline:3px solid #3f9fa0;outline-offset:3px}
#wlTitle .tip{margin:1rem 0 0;font-size:.85rem;opacity:.85;text-shadow:0 2px 8px rgba(30,14,36,.7)}
#wlTitle .ask{width:min(20rem,100%);box-sizing:border-box;margin:0 auto;padding:1.1rem 1.1rem 1.15rem;background:#fff6ea;color:#3e2834;border-radius:18px;box-shadow:0 18px 50px rgba(30,14,36,.45);text-shadow:none}
#wlTitle .ask p{margin:0 0 .85rem;line-height:1.55;font-size:1.02rem;word-break:keep-all}
#wlTitle .ask .row{display:flex;gap:.5rem}#wlTitle .ask .row button{flex:1;border:0;border-radius:12px;font:inherit;font-size:1rem;padding:.6rem .5rem;min-height:46px;cursor:pointer;background:rgba(127,90,96,.14);color:#3e2834}
#wlTitle .ask .row .yes{background:#3f9fa0;color:#fffaf2}
#wlTitle[data-ask] .tbtns,#wlTitle[data-ask] .tip{display:none}#wlTitle:not([data-ask]) .ask{display:none}
@media (max-width:520px){#wlTitle .tip .sep{display:block;height:0;overflow:hidden}}
@keyframes wtPop{from{opacity:0;transform:translateY(.7em) scale(.2) rotate(var(--r))}to{opacity:1;transform:translateY(0) scale(1) rotate(var(--r))}}
@keyframes wtWave{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-.07em) rotate(calc(var(--r) * -1))}}
@keyframes wtDrop{from{opacity:0;transform:translateY(-14px) scale(.8)}}
@keyframes wtRise{from{opacity:0;transform:translateY(22px) scale(.94)}}
@keyframes wtMarch{from{transform:translateX(-50%)}to{transform:translateX(0)}}
@keyframes wtStep{50%{transform:translateY(-2px)}}
@media (prefers-reduced-motion: reduce){#wlTitle .titlebox,#wlTitle .logo2>span,#wlTitle .march,#wlTitle .march i,#wlTitle .ribbon,#wlTitle .wt-deco *{animation:none!important}}`;
let cssDone=null,decoDone=new Set();
function addCss(id,text){const st=document.createElement('style');st.dataset.wl=id;st.textContent=text;document.head.appendChild(st);}
function btn(cls,text,on){const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=text;b.addEventListener('click',on);return b;}
/* 세계 설정 W로 첫 화면을 만든다 */
function render(W,o={}){
  if(!cssDone){cssDone=1;addCss('title',css);}
  const id=W.id||W.title;if(W.titleDeco&&W.titleDeco.css&&!decoDone.has(id)){decoDone.add(id);addCss('deco:'+id,W.titleDeco.css);}
  const el=document.createElement('div');el.id='wlTitle';el.setAttribute('role','dialog');el.setAttribute('aria-label','게임 시작');
  if(W.startColor)el.style.setProperty('--sc',W.startColor);
  const box=document.createElement('div');box.className='titlebox';
  const rb=document.createElement('div');rb.className='ribbon';const rs=document.createElement('span');rs.textContent=RIBBON;rb.appendChild(rs);
  // 로고: 글자마다 색(letterColors 되풀이)·기울기(TILT)·차례(--i)
  const h=document.createElement('h1');h.className='logo2';h.setAttribute('aria-label',W.title);
  const cols=W.letterColors&&W.letterColors.length?W.letterColors:['#ffd46a'];let ci=0,gap=false;const spans=[];
  for(const ch of [...W.title]){if(ch===' '){gap=true;continue;}const s=document.createElement('span');s.setAttribute('aria-hidden','true');s.textContent=ch;
    s.style.cssText=`--i:${ci};--c:${cols[ci%cols.length]};--r:${TILT[ci%TILT.length]}deg`;if(gap)s.className='gap';gap=false;h.appendChild(s);spans.push(s);ci++;}
  if(W.titleDeco&&W.titleDeco.svg){const d=document.createElement('div');d.className='wt-deco';d.setAttribute('aria-hidden','true');d.innerHTML=W.titleDeco.svg;h.insertBefore(d,h.firstChild);
    // 리본 문구가 길어져(공통 '탐험가 원더룹의 대모험') 좁은 화면에서 장식이 리본 글자를 덮으면 그때만 리본을 그만큼 위로(넓은 화면은 개미굴 그대로)
    const at=Math.max(0,Math.min(spans.length-1,W.titleDeco.at|0)),place=()=>{d.style.setProperty('--dx',spans[at].offsetLeft+'px');if(!el.isConnected)return;
      rb.style.marginBottom='';const all=[rb,...d.querySelectorAll('*'),d];all.forEach(e=>e.style.animation='none');
      const R=rs.getBoundingClientRect(),pad=parseFloat(getComputedStyle(rs).paddingLeft)||0;let need=0;
      d.querySelectorAll('circle,ellipse,path,rect,polygon,image').forEach(e=>{const q=e.getBoundingClientRect();if(q.right>R.left+pad*.6&&q.left<R.right-pad*.6&&q.top<R.bottom&&q.bottom>R.top)need=Math.max(need,R.bottom-q.top+4);});
      all.forEach(e=>e.style.animation='');if(need)rb.style.marginBottom=`calc(.3rem + ${Math.ceil(need)}px)`;};
    el._place=place;if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);addEventListener('resize',place);el._unplace=()=>removeEventListener('resize',place);}
  box.append(rb,h);
  // 점선 위 행렬 (세계 parade) — 화면 폭의 두 배만큼 늘어놓고 반만큼 흘려 끊김 없이
  if(W.parade&&W.parade.svg){const P=W.parade,t=document.createElement('div');t.className='trail';t.setAttribute('aria-hidden','true');
    const m=document.createElement('div');m.className='march';m.style.cssText=`--gap:${P.gap||'2.6rem'};--sec:${P.sec||9}s;--pc:${P.color||'#ffe9c2'};--w:${P.w||30}px;--h:${P.h||17}px;--hop:${P.hop||.35}s`;
    for(let i=0;i<(P.n||6);i++){const it=document.createElement('i');it.innerHTML=P.svg;m.appendChild(it);}t.appendChild(m);box.appendChild(t);}
  const sub=document.createElement('p');sub.className='sub';(W.intro||[]).forEach((line,i)=>{if(i)sub.appendChild(document.createElement('br'));sub.append(line);});box.appendChild(sub);
  const B=document.createElement('div');B.className='tbtns';
  if(o.progress){B.append(btn('go','이어서 하기',()=>o.onContinue&&o.onContinue()),
    btn('ghost small','처음부터',()=>{el.dataset.ask='1';if(o.onClick)o.onClick();el.querySelector('.ask .no').focus({preventScroll:true});}));}
  else B.appendChild(btn('go','새로 시작',()=>o.onNew&&o.onNew()));
  B.appendChild(btn('ghost','조작법',()=>o.onHow&&o.onHow()));box.appendChild(B);
  const tip=document.createElement('p');tip.className='tip';tip.innerHTML=TIP;box.appendChild(tip);
  const ask=document.createElement('div');ask.className='ask';ask.innerHTML='<p>처음부터 다시 할까요?<br>지금까지 모은 기록이 지워져요.</p>';
  const ar=document.createElement('div');ar.className='row';
  ar.append(btn('yes','처음부터 하기',()=>{delete el.dataset.ask;o.onFresh&&o.onFresh();}),btn('no','아니요',()=>{delete el.dataset.ask;if(o.onClick)o.onClick();}));ask.appendChild(ar);box.appendChild(ask);
  el.appendChild(box);return el;}
/* 배경 카메라(세계 backdrop): 시작 공간을 천천히 루프로 돈다 — t초 뒤 {from, at}.
   loop: a = a0 + t·speed 로 한 바퀴씩(개미굴 광장처럼 트인 곳), sweep:[a,b]면 그 각도 사이를 천천히 오간다(벽이 있는 방).
   자리 = at + (sin a·r, h + bob, cos a·(rz||r)), 보는 점 = at(+ lookUp: [높이, 빠르기, 위상]이면 개미굴처럼 가끔 위를 올려다봄) */
function backdropAt(B,t){const sp=B.speed||.07;let a;
  if(B.sweep){const [a0,a1]=B.sweep,m=(a0+a1)/2,hw=(a1-a0)/2;a=m+hw*Math.sin(t*sp/Math.max(.05,hw));}else a=(B.a0||0)+t*sp;
  const at=B.at||[0,1,0],r=B.r||20,bob=B.bob?B.bob[0]*Math.sin(t*B.bob[1]):0;
  const look=[at[0],at[1]+(B.lookUp?Math.max(0,Math.sin(t*B.lookUp[1]+B.lookUp[2]))*B.lookUp[0]:0),at[2]];
  return {from:[at[0]+Math.sin(a)*r,(B.h||8)+bob,at[2]+Math.cos(a)*(B.rz||r)],at:look};}
export {RIBBON,backdropAt,render};
