/* 원더룹 — 펠트 스티커 UI 한 벌 (엔진 공통, 2026-11-03 — 시안 claude.ai "요정의 숲 손글씨 UI 시안". 그림 파일 없이 CSS만)
   - 판·단추: class "wl-felt" — 크림 펠트 #fff6e6(아주 옅은 천 결 점무늬) + 4px 따뜻한 갈색 테두리 #5a3826 + 안쪽 5px에 점선 바느질 한 줄 + 아래로 5px 갈색 두께.
     살구 펠트(주 단추) "wl-felt apri". 바느질은 ::before라, 판·단추 자신의 CSS에서 position(relative·fixed·absolute)을 정해 둔다(이 파일은 position을 건드리지 않는다).
   - 단추: "wl-btn"을 더하면 누를 때 3px 눌려 내려가고 두께가 얇아진다(transform과 따로 노는 translate 속성 — 가운데 맞춤 transform을 쓰는 것도 그대로). 단추는 알약 모양(--fr:999px).
   - 반투명 펠트 "wl-glass"(게임 중 조이스틱·대쉬·점프·오른쪽 위 아이콘 단추 — 바탕이 비쳐 보이게, 천 결 없음), 지금 누를 수 있는 행동 단추(말 걸기·타기·돌리기)는 "wl-glass act"(살구 반투명).
   - 마스킹테이프 "wl-tape"(분홍 — 화면 위 할 일 안내·첫 화면 부제, 양끝이 살짝 찢긴 모양, -1.5° 기울임), "wl-tape mint"(민트 — 대화창·소개 카드 이름표). tape(el)이 글자 칸을 만든다.
   - 마커 번짐 "wl-mk": 짧은 글자(단추·안내·이름표)의 가장자리가 마커로 쓴 듯 아주 살짝 번진다(SVG feTurbulence + feDisplacementMap 세기 1.8).
     휴대폰 단계(08이 body에 wl-lowfx)에서는 끈다 — 글자마다 필터를 다시 그려서.
   - 아이콘 자리: icon(이름) → <span class="wl-ic"> 안에 기본 SVG(옷걸이·게임패드·물음표). 세계 설정 front.icons:{wardrobe:'그림 주소', help:…}가 있으면 그 그림(나중에 만든 아이콘으로 바꿔 끼우기).
   - 색은 변수 — 다음 세계는 setTheme({cream, apricot, edge, depth, ink, soft, stitch, stitchApri, tape, tapeMint})로 색만 바꾼다(세계 설정 front.theme, game/front가 부른다).
   글자: 단추·할 일 안내·이름표·카드 제목·배지·컨트롤러는 Jua, 대화 본문·설명 글은 Gowun Dodum. */
const DOTS='radial-gradient(rgba(90,56,38,.075) 1px,transparent 1.6px) 0 0/9px 9px';
const DEF={cream:'#fff6e6',apricot:'#ffb86b',edge:'#5a3826',depth:'#5a3826',ink:'#4a2a2a',soft:'#86604e',stitch:'rgba(90,56,38,.32)',stitchApri:'rgba(255,246,230,.95)',tape:'#f6a4ae',tapeMint:'#a6dcc0'};
const S=':not(#wl_a):not(#wl_b)'; // 판·단추 자신의 #id 규칙보다 앞서게(그 규칙의 배경·테두리·그림자를 펠트로 덮는다)
const TORN='polygon(0 6%,2.5% 0,5% 8%,8% 1%,100% 0,98% 14%,100% 28%,97.5% 44%,100% 58%,98% 72%,100% 86%,97.5% 100%,4% 100%,1.5% 92%,0 80%,2% 64%,0 48%,2.5% 32%,0 18%)';
const CSS=`
.wl-felt${S}{background:${DOTS},var(--fbg,var(--f-cream));border:4px solid var(--f-edge);border-radius:var(--fr,26px);
  box-shadow:0 var(--fd,5px) 0 var(--f-depth);color:var(--f-ink);-webkit-backdrop-filter:none;backdrop-filter:none}
.wl-felt${S}::before{content:"";position:absolute;inset:5px;border:2px dashed var(--fst,var(--f-stitch));border-radius:max(4px,calc(var(--fr,26px) - 9px));pointer-events:none}
.wl-felt.apri${S}{--fbg:var(--f-apri);--fst:var(--f-stitch-apri)}
.wl-btn${S}{font-family:"Jua","Gowun Dodum",sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:translate .08s,box-shadow .08s}
.wl-btn${S}:active{translate:0 3px;box-shadow:0 calc(var(--fd,5px) - 3px) 0 var(--f-depth)}
.wl-btn${S}:focus-visible{outline:3px solid #ffd46a;outline-offset:3px}
/* 반투명 펠트(컨트롤러·아이콘 단추) */
.wl-glass${S}{background:rgba(255,246,230,.42);border:4px solid rgba(90,56,38,.75);border-radius:999px;box-shadow:0 var(--fd,5px) 0 rgba(90,56,38,.55);color:var(--f-ink);
  -webkit-backdrop-filter:none;backdrop-filter:none;font-family:"Jua","Gowun Dodum",sans-serif;-webkit-tap-highlight-color:transparent;transition:translate .08s,box-shadow .08s}
.wl-glass${S}::before{content:"";position:absolute;inset:5px;border:2px dashed rgba(255,246,230,.7);border-radius:999px;pointer-events:none}
.wl-glass.knob${S}{background:rgba(255,246,230,.7)}
.wl-glass.act${S}{background:rgba(255,184,107,.72)}
button.wl-glass${S}:active{translate:0 3px;box-shadow:0 calc(var(--fd,5px) - 3px) 0 rgba(90,56,38,.55)}
button.wl-glass${S}:focus-visible{outline:3px solid #ffd46a;outline-offset:3px}
/* 마스킹테이프 띠 */
.wl-tape${S}{background:${DOTS},var(--f-tape);border:0;border-radius:0;box-shadow:0 2px 0 rgba(90,56,38,.18);clip-path:${TORN};rotate:-1.5deg;
  color:var(--f-ink);font-family:"Jua","Gowun Dodum",sans-serif;-webkit-backdrop-filter:none;backdrop-filter:none}
.wl-tape.mint${S}{background:${DOTS},var(--f-tape-mint);rotate:-3deg}
/* 마커 번짐(짧은 글자) — 휴대폰 단계는 끔 */
.wl-mk{filter:url(#wlMarker)}body.wl-lowfx .wl-mk{filter:none}
.wl-ic{display:inline-grid;place-items:center;width:1.25em;height:1.25em;flex:none}.wl-ic svg,.wl-ic img{width:100%;height:100%;display:block}
@media (prefers-reduced-motion: reduce){.wl-btn${S},.wl-glass${S}{transition:none}}`;
const SVG={
  wardrobe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 6.2a2 2 0 1 1 2.6 1.9c-.5.2-.6.6-.6 1.1v1.3"/><path d="M12 10.5 3.6 16.6c-.9.7-.4 1.9.6 1.9h15.6c1 0 1.5-1.2.6-1.9L12 10.5z"/></svg>',
  help:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 8.5h9a4.5 4.5 0 0 1 4.5 4.5v1.2a3 3 0 0 1-5.5 1.7l-1-1.4h-5l-1 1.4a3 3 0 0 1-5.5-1.7V13a4.5 4.5 0 0 1 4.5-4.5z"/><path d="M8 11v3.4M6.3 12.7h3.4"/><circle cx="15.6" cy="11.8" r=".6" fill="currentColor"/><circle cx="17.4" cy="13.6" r=".6" fill="currentColor"/></svg>',
  compass:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 5V3M9.5 3h5"/><path d="m14.8 10.2-1.6 4-4 1.6 1.6-4z" fill="currentColor"/></svg>',
  question:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M9 9.2a3 3 0 1 1 4.2 2.8c-.8.4-1.2 1-1.2 1.8v.6"/><circle cx="12" cy="17.6" r=".9" fill="currentColor" stroke="none"/></svg>'};
let custom={},done=false;
function injectFelt(){if(done)return;done=true;const st=document.createElement('style');st.dataset.wlFelt='1';st.textContent=CSS;document.head.appendChild(st);
  // 마커 번짐 필터(한 번만, 화면에 안 보이는 SVG)
  const sv=document.createElementNS('http://www.w3.org/2000/svg','svg');sv.setAttribute('width','0');sv.setAttribute('height','0');sv.setAttribute('aria-hidden','true');sv.style.cssText='position:absolute;width:0;height:0';
  sv.innerHTML='<filter id="wlMarker" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="1" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G"/></filter>';
  document.body.appendChild(sv);setTheme({});}
/* 아이콘 자리: 세계 그림(front.icons)이 있으면 <img>, 없으면 기본 SVG */
function icon(name){const s=document.createElement('span');s.className='wl-ic';s.dataset.ic=name;
  if(custom[name]){const im=new Image();im.alt='';im.src=custom[name];s.appendChild(im);}else s.innerHTML=SVG[name]||'';return s;}
function setIcons(map){custom=Object.assign({},map||{});}
function setTheme(t){const v=Object.assign({},DEF,t||{}),r=document.querySelector('.wlg');if(!r)return;
  const set=(k,x)=>r.style.setProperty(k,x);set('--f-cream',v.cream);set('--f-apri',v.apricot);set('--f-edge',v.edge);set('--f-depth',v.depth);set('--f-ink',v.ink);set('--f-soft',v.soft);
  set('--f-stitch',v.stitch);set('--f-stitch-apri',v.stitchApri);set('--f-tape',v.tape);set('--f-tape-mint',v.tapeMint);}
/* 테이프 띠: 글자 칸(마커 번짐) — 돌려준 span의 textContent로 글자를 바꾼다 */
function tape(el,mint=false){let tx=el.querySelector(':scope > .tx');if(!tx){tx=document.createElement('span');tx.className='tx wl-mk';tx.textContent=el.textContent;el.textContent='';el.appendChild(tx);}
  el.classList.add('wl-tape');if(mint)el.classList.add('mint');return tx;}
/* 단추 글자에 마커 번짐: <span class="wl-mk">글자</span> */
function mk(text){const s=document.createElement('span');s.className='wl-mk';s.textContent=text;return s;}
export {icon,injectFelt,mk,setIcons,setTheme,tape};
