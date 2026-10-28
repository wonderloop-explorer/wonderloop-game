/* 원더룹 — 타이틀·엔딩 로고 (개미굴 게임 첫 화면 .logo2 모양: 리본 + 글자마다 색·기울기·두꺼운 갈색 테두리, 튀어 오르며 등장)
   - drawTitle(g, W, H, o, t, a): 캔버스에 그린다 → 영상 캡처 모드가 영상에 직접 그려 넣는다(09, 대본 c.title·c.ending, burn).
     o = {ribbon:'원더룹', logo:'산타 마을 탐방', sub, sub2, kind:'title'|'ending', deco(g, 첫글자 정보)}, t = 나온 뒤 흐른 초, a = 불투명도.
   - logoEl({ribbon, logo, sub}): 같은 모양의 HTML(게임 첫 화면·엔딩 화면용).
   세계마다 다른 꾸밈(개미굴의 첫 글자 더듬이 같은 것)은 deco로 넘긴다. 이 파일에는 세계 전용 그림을 넣지 않는다. */
const FONT='"Jua","Gowun Dodum",sans-serif';
const RIB_FONT='"Gowun Dodum","Apple SD Gothic Neo",sans-serif';   // 리본 글씨: 개미굴 게임 .ribbon과 같이 Gowun Dodum 보통 굵기(400)
const COLS=['#ffd46a','#ffb86b','#8fe0c8','#c8b0ff','#f7a8c0','#8fd0ff'];   // .logo2 글자 색 차례
const TILT=[-6,4,-3,4,-5,5];                                                // 글자 기울기(도)
const INK='#4a2a2a';
const ease=x=>{const c=1.9;x=Math.max(0,Math.min(1,x));return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);};
const clamp=x=>Math.max(0,Math.min(1,x));
/* 리본 (.ribbon: 살구색 띠, 양끝 V자 홈, 아래 그림자) */
function ribbon(g,text,cx,cy,a,sz){g.save();g.globalAlpha*=a;g.font='400 '+sz+'px '+RIB_FONT;const w=g.measureText(text).width+sz*1.6,h=sz*1.55,n=sz*.45;
  const band=(dy,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(cx-w/2-n,cy-h/2+dy);g.lineTo(cx+w/2+n,cy-h/2+dy);g.lineTo(cx+w/2+n-n*.8,cy+dy);g.lineTo(cx+w/2+n,cy+h/2+dy);
    g.lineTo(cx-w/2-n,cy+h/2+dy);g.lineTo(cx-w/2-n+n*.8,cy+dy);g.closePath();g.fill();};
  band(sz*.15,'#a8603f');band(0,'#ffb86b');g.fillStyle='#3e2834';g.textAlign='center';g.textBaseline='middle';g.fillText(text,cx,cy+sz*.05);g.restore();}
/* 로고 글자: 글자마다 튀어 오르며(.09초 간격) 등장, 살랑 흔들림, 두꺼운 테두리 + 아래로 쌓인 두께 + 하이라이트 */
function logo(g,text,cx,cy,t,a,sz,deco){g.save();g.globalAlpha=a;g.font=sz+'px '+FONT;g.textBaseline='middle';g.textAlign='left';g.lineJoin='round';
  const chars=[...text],ws=chars.map(c=>c===' '?sz*.28:g.measureText(c).width*1.02),tw=ws.reduce((x,y)=>x+y,0);let x=cx-tw/2,ci=0;
  chars.forEach((ch,i)=>{const w=ws[i];if(ch===' '){x+=w;return;}const k=ease((t-.25-i*.09)/.45);if(k<=0){x+=w;ci++;return;}
    const bob=Math.sin(t*2.2+i*.7)*sz*.02,rot=TILT[ci%TILT.length]*Math.PI/180*(1+Math.sin(t*2.2+i*.7)*.15);
    g.save();g.translate(x+w/2,cy+bob+(1-Math.min(1,k))*sz*.35);g.rotate(rot);g.scale(k,k);g.translate(-w/2,0);
    for(let d=sz*.13;d>0;d-=sz*.02){g.fillStyle=INK;g.strokeStyle=INK;g.lineWidth=sz*.09;g.strokeText(ch,0,d);g.fillText(ch,0,d);}  // 아래로 쌓인 두께
    g.lineWidth=sz*.09;g.strokeStyle=INK;g.strokeText(ch,0,0);g.fillStyle=COLS[ci%COLS.length];g.fillText(ch,0,0);
    g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.ellipse(w*.38,-sz*.26,w*.18,sz*.06,-.3,0,7);g.fill();
    if(deco)try{deco(g,{i:ci,w,sz,t});}catch(e){}
    g.restore();x+=w;ci++;});
  g.restore();return tw;}
function subText(g,text,cx,cy,a,sz){g.save();g.globalAlpha=a;g.font=sz+'px '+FONT;g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  g.lineWidth=sz*.22;g.strokeStyle='rgba(60,32,18,.75)';g.strokeText(text,cx,cy);g.fillStyle='#fff8ec';g.fillText(text,cx,cy);g.restore();}
function shade(g,W,H,a){g.save();g.globalAlpha=a*.55;const gr=g.createLinearGradient(0,H*.15,0,H*.85);gr.addColorStop(0,'rgba(40,60,110,0)');gr.addColorStop(.5,'rgba(40,50,90,.45)');gr.addColorStop(1,'rgba(40,60,110,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);g.restore();}
/* 로고 크기: 기준 높이 1080에서 타이틀 190px·엔딩 170px, 화면 폭의 86%를 넘지 않게(세로 영상) */
function fit(g,text,base,W){g.save();g.font=base+'px '+FONT;const w=[...text].reduce((s,c)=>s+(c===' '?base*.28:g.measureText(c).width*1.02),0);g.restore();return Math.min(base,base*W*.86/Math.max(1,w));}
function drawTitle(g,W,H,o,t,a){if(a<=0)return;const u=Math.min(W,H)/1080,end=o.kind==='ending';
  shade(g,W,H,a);const sz=fit(g,o.logo||'',(end?170:190)*u,W),top=H*(end?.27:.29),mid=H*(end?.44:.47);
  const k=clamp(t/.35);if(o.ribbon)ribbon(g,o.ribbon,W/2,top+(1-k)*-40*u,a*k,(end?36:40)*u);
  logo(g,o.logo||'',W/2,mid,t,a,sz,o.deco);
  if(o.sub)subText(g,o.sub,W/2,mid+sz*.95,a*clamp((t-1.6)/.6),(end?54:46)*u);
  if(o.sub2)subText(g,o.sub2,W/2,mid+sz*.95+70*u,a*clamp((t-2.2)/.6),34*u);}
/* HTML 로고 (게임 화면용) */
let cssDone=false;
function css(){if(cssDone)return;cssDone=true;const st=document.createElement('style');st.textContent=`
.wl-logo{text-align:center;font-family:${FONT}}
.wl-logo .ribbon{display:inline-block;margin:0 0 .3rem;animation:wlDrop .6s cubic-bezier(.2,1.5,.4,1) both}
.wl-logo .ribbon span{display:inline-block;background:#ffb86b;color:#3e2834;font-family:${RIB_FONT};font-weight:400;font-size:.95rem;padding:.38rem 1.6rem;clip-path:polygon(0 0,100% 0,94% 50%,100% 100%,0 100%,6% 50%);box-shadow:0 3px 0 #a8603f}
.wl-logo .logo2{position:relative;display:flex;justify-content:center;width:max-content;max-width:100%;margin:.35rem auto .1rem;font-weight:400;font-size:clamp(3.4rem,13.5vw,7rem);line-height:1.08;letter-spacing:.01em}
.wl-logo .logo2 span{display:inline-block;color:var(--c);transform:rotate(var(--r));
  text-shadow:.045em 0 ${INK},-.045em 0 ${INK},0 .045em ${INK},0 -.045em ${INK},.032em .032em ${INK},-.032em .032em ${INK},.032em -.032em ${INK},-.032em -.032em ${INK},0 .085em 0 ${INK},.03em .1em 0 ${INK},-.03em .1em 0 ${INK},0 .13em 0 ${INK},0 .2em .28em rgba(30,14,36,.55);
  animation:wlPop .75s cubic-bezier(.2,1.6,.4,1) both,wlWave 3s ease-in-out infinite;animation-delay:calc(var(--i)*.09s),calc(.9s + var(--i)*.15s)}
.wl-logo .sub{margin:.4rem 0 0;font-size:1.2rem;color:#fff8ec;text-shadow:0 0 .25em rgba(60,32,18,.8)}
@keyframes wlPop{from{opacity:0;transform:translateY(.7em) scale(.2) rotate(var(--r))}to{opacity:1;transform:translateY(0) scale(1) rotate(var(--r))}}
@keyframes wlWave{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-.07em) rotate(calc(var(--r) * -1))}}
@keyframes wlDrop{from{opacity:0;transform:translateY(-1em)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.wl-logo .logo2 span,.wl-logo .ribbon{animation:none}}`;document.head.appendChild(st);}
function logoEl({ribbon:rb,logo:text='',sub}={}){css();const el=document.createElement('div');el.className='wl-logo';
  if(rb){const r=document.createElement('div');r.className='ribbon';const s=document.createElement('span');s.textContent=rb;r.appendChild(s);el.appendChild(r);}
  const h=document.createElement('h2');h.className='logo2';h.setAttribute('aria-label',text);let ci=0;
  [...text].forEach((ch,i)=>{if(ch===' '){h.lastChild&&(h.lastChild.dataset.gap='1');return;}const s=document.createElement('span');s.setAttribute('aria-hidden','true');s.textContent=ch;
    s.style.cssText=`--i:${i};--c:${COLS[ci%COLS.length]};--r:${TILT[ci%TILT.length]}deg`+([...text][i-1]===' '?';margin-left:.28em':'');h.appendChild(s);ci++;});
  el.appendChild(h);if(sub){const p=document.createElement('p');p.className='sub';p.textContent=sub;el.appendChild(p);}return el;}
/* 캔버스에 쓰기 전에 글꼴을 받아 둔다 (영상 첫 프레임부터 같은 글꼴) */
const fontsReady=()=>document.fonts?Promise.all(['400 40px Jua','700 40px Jua','40px "Gowun Dodum"'].map(f=>document.fonts.load(f,'원더룹 가나다'))).catch(()=>{}):Promise.resolve();
export {COLS as LOGO_COLS,drawTitle,fontsReady,logoEl};
