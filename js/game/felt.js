/* 원더룹 — 펠트 스티커 UI 한 벌 (엔진 공통, 2026-11-03 — 요정의 숲 로고·완료 배지의 펠트·갈색 테두리·바느질 땀에 맞춤. 그림 파일 없이 CSS만)
   - 판(대화창·카드·조작법 창·옷장·첫 화면 확인 창): class "wl-felt" — 크림 펠트(아주 옅은 천 결 = SVG 잡음 data URI) + 두꺼운 둥근 갈색 테두리 + 안쪽 점선 바느질 한 줄 + 아래로 진한 갈색 두께.
     살구 펠트는 "wl-felt apri". 바느질은 ::before라, 판·단추 자신의 CSS에서 position(relative·fixed·absolute)을 정해 둔다(이 파일은 position을 건드리지 않는다).
   - 단추: "wl-felt wl-btn" — 누르면 2px 눌려 내려가고 두께가 얇아진다(transform과 따로 노는 translate 속성 — 가운데 맞춤 transform을 쓰는 것도 그대로).
   - 리본 띠(할 일 안내·첫 화면 부제): "wl-felt wl-rbn" 안에 <i class="rt l"></i>글자<i class="rt r"></i> — 양 끝 V자 홈 꼬리(살구 펠트·갈색 테두리).
   - 아이콘 자리: icon(이름) → <span class="wl-ic"> 안에 기본 SVG(옷걸이·게임패드·물음표). 세계 설정 front.icons:{wardrobe:'그림 주소', help:…}가 있으면 그 그림(나중에 만든 아이콘으로 바꿔 끼우기).
   - 색은 변수 — 다음 세계는 setTheme({cream, apricot, edge, depth, ink, soft, stitch, stitchApri})로 색만 바꾼다(세계 설정 front.theme, game/front가 부른다).
   글자는 Jua(로고와 어울리는 둥근 글꼴), 작은 설명만 Gowun Dodum. */
const NOISE=`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .21 0 0 0 0 .12 .26 0 0 0 -.06'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E")`;
const DEF={cream:'#fffaf2',apricot:'#ffb86b',edge:'#5a3826',depth:'#3b2216',ink:'#4a2a2a',soft:'#86604e',stitch:'#d9b48c',stitchApri:'#fff1dc'};
const S=':not(#wl_a):not(#wl_b)'; // 판·단추 자신의 #id 규칙보다 앞서게(그 규칙의 배경·테두리·그림자를 펠트로 덮는다)
const CSS=`
.wlg{--f-noise:${NOISE}}
.wl-felt${S}{background-color:var(--fbg,var(--f-cream));background-image:var(--f-noise);border:2.5px solid var(--f-edge);border-radius:var(--fr,20px);
  box-shadow:0 var(--fd,4px) 0 var(--f-depth),0 calc(var(--fd,4px) + 6px) 18px rgba(30,14,36,.22);color:var(--f-ink);-webkit-backdrop-filter:none;backdrop-filter:none}
.wl-felt${S}::before{content:"";position:absolute;inset:4px;border:1.6px dashed var(--fst,var(--f-stitch));border-radius:calc(var(--fr,20px) - 4px);pointer-events:none}
.wl-felt.apri${S}{--fbg:var(--f-apri);--fst:var(--f-stitch-apri)}
.wl-btn${S}{font-family:"Jua","Gowun Dodum",sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:translate .08s,box-shadow .08s}
.wl-btn${S}:active{translate:0 2px;box-shadow:0 calc(var(--fd,4px) - 2px) 0 var(--f-depth),0 4px 10px rgba(30,14,36,.2)}
.wl-btn${S}:focus-visible{outline:3px solid #ffd46a;outline-offset:3px}
.wl-rbn${S}{border-radius:10px;--fr:10px;font-family:"Jua","Gowun Dodum",sans-serif;isolation:isolate}
.wl-rbn .rt{position:absolute;top:22%;bottom:-14%;width:20px;z-index:-1;pointer-events:none;
  filter:drop-shadow(2px 0 0 var(--f-edge)) drop-shadow(-2px 0 0 var(--f-edge)) drop-shadow(0 2px 0 var(--f-edge)) drop-shadow(0 -2px 0 var(--f-edge)) drop-shadow(0 3px 0 var(--f-depth))}
.wl-rbn .rt::after{content:"";position:absolute;inset:0;background-color:var(--f-apri);background-image:var(--f-noise);clip-path:polygon(0 0,100% 0,100% 100%,0 100%,42% 50%)}
.wl-rbn .rt.l{left:-15px}.wl-rbn .rt.r{right:-15px}.wl-rbn .rt.r::after{clip-path:polygon(0 0,100% 0,58% 50%,100% 100%,0 100%)}
.wl-ic{display:inline-grid;place-items:center;width:1.25em;height:1.25em;flex:none}.wl-ic svg,.wl-ic img{width:100%;height:100%;display:block}
@media (prefers-reduced-motion: reduce){.wl-btn${S}{transition:none}}`;
const SVG={
  wardrobe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 6.2a2 2 0 1 1 2.6 1.9c-.5.2-.6.6-.6 1.1v1.3"/><path d="M12 10.5 3.6 16.6c-.9.7-.4 1.9.6 1.9h15.6c1 0 1.5-1.2.6-1.9L12 10.5z"/></svg>',
  help:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 8.5h9a4.5 4.5 0 0 1 4.5 4.5v1.2a3 3 0 0 1-5.5 1.7l-1-1.4h-5l-1 1.4a3 3 0 0 1-5.5-1.7V13a4.5 4.5 0 0 1 4.5-4.5z"/><path d="M8 11v3.4M6.3 12.7h3.4"/><circle cx="15.6" cy="11.8" r=".6" fill="currentColor"/><circle cx="17.4" cy="13.6" r=".6" fill="currentColor"/></svg>',
  question:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M9 9.2a3 3 0 1 1 4.2 2.8c-.8.4-1.2 1-1.2 1.8v.6"/><circle cx="12" cy="17.6" r=".9" fill="currentColor" stroke="none"/></svg>'};
let custom={},done=false;
function injectFelt(){if(done)return;done=true;const st=document.createElement('style');st.dataset.wlFelt='1';st.textContent=CSS;document.head.appendChild(st);setTheme({});}
/* 아이콘 자리: 세계 그림(front.icons)이 있으면 <img>, 없으면 기본 SVG */
function icon(name){const s=document.createElement('span');s.className='wl-ic';s.dataset.ic=name;
  if(custom[name]){const im=new Image();im.alt='';im.src=custom[name];s.appendChild(im);}else s.innerHTML=SVG[name]||'';return s;}
function setIcons(map){custom=Object.assign({},map||{});}
function setTheme(t){const v=Object.assign({},DEF,t||{}),r=document.querySelector('.wlg');if(!r)return;
  const set=(k,x)=>r.style.setProperty(k,x);set('--f-cream',v.cream);set('--f-apri',v.apricot);set('--f-edge',v.edge);set('--f-depth',v.depth);set('--f-ink',v.ink);set('--f-soft',v.soft);set('--f-stitch',v.stitch);set('--f-stitch-apri',v.stitchApri);}
/* 리본 띠 꼬리 두 개를 넣는다(글자는 그 사이 span — setText로 바꾼다) */
function ribbonize(el){if(el.querySelector(':scope > .rt'))return el.querySelector(':scope > .tx');const tx=document.createElement('span');tx.className='tx';tx.textContent=el.textContent;el.textContent='';
  const l=document.createElement('i'),r=document.createElement('i');l.className='rt l';r.className='rt r';el.append(l,tx,r);el.classList.add('wl-felt','wl-rbn');return tx;}
export {icon,injectFelt,ribbonize,setIcons,setTheme};
