/* 원더룹 — 도감·숨겨진 비밀·엔딩 (개미굴 편 DEX·SEC_DEF·결과·엔딩을 세계 전용 내용 없이 옮긴 것, 카드 디자인 기준은 제작 기준서 "도감 카드 기준")
   세계마다 한 번: setup({world, name:'자연 도감', cards:[{id,t,f,x?,where,icon}], secrets:[{id,t,f,where,icon}]})
     t 제목, f 앞면 사실(한두 문장), x 더 알아보기(핵심 카드만), where 만나는 구역, icon 그림(data URL 또는 경로, 없으면 '?')
   - find(id): 새 도감 카드 창(꼬리표 "새 도감 카드" → 그림·제목·사실·[더 알아보기]·개수·"도감에 넣기"). 이미 찾았으면 false.
   - findSecret(id): 비밀 카드(ui.secret 금빛 판, "숨겨진 비밀 발견!", "발견한 비밀 n/N", "비밀 수첩에 넣기"), 나레이션 "비밀 발견! "+사실.
   - spot({id, root 또는 pos:[x,y,z], near:6.5, reach:1.4}): 비밀 장면 자리 — near 안으로 다가가면 금빛 반짝임이 점점 진해지고(안내 표시 = 영상에서 숨김),
     reach 안에 들어오면 findSecret. 찾은 비밀은 다시 반짝이지 않는다. 구역을 떠나면 자리는 지워진다(찾은 기록은 남음).
   - openBook()/closeBook(): 도감 목록(카드 칸 + "숨겨진 비밀" 칸). secretLine(): 결과창 note에 넣을 "✦ 발견한 비밀 n/N".
   - ending({ribbon, logo, sub, buttons}): 엔딩 화면(title.logoEl 로고 + 도감·비밀 개수 + 단추).
   카드 창·비밀 카드·결과창·엔딩은 모두 카드 자리 하나를 나눠 쓴다(이벤트 공통 규칙 ⑦ — 한 번에 하나, 줄 세우기).
   저장: localStorage 'wl-codex'(세계별). 촬영 모드(?shot)에서는 읽지도 쓰지도 않는다. */
import * as THREE from 'three';
import {block,clock,cue} from './core.js';
import {sfx,voice} from './sound.js';
import {cardCloser,cardDone,cardShown,cardSlot,hint,hintsVisible,secret as secretCard} from './ui.js';
import {logoEl} from './title.js';
const KEY='wl-codex',SHOT=new URLSearchParams(location.search).has('shot');
let store={};if(!SHOT)try{store=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){}
const W={world:'',name:'자연 도감',cards:[],secrets:[]},BY={},SBY={};let found=new Set(),sfound=new Set(),ctx=null;
function save(){if(SHOT||!W.world)return;store[W.world]={cards:[...found],secrets:[...sfound]};try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}}
function setup(o){Object.assign(W,{name:'자연 도감'},o);for(const k in BY)delete BY[k];for(const k in SBY)delete SBY[k];
  W.cards.forEach(c=>BY[c.id]=c);W.secrets.forEach(c=>SBY[c.id]=c);const s=store[W.world]||{};
  found=new Set((s.cards||[]).filter(id=>BY[id]));sfound=new Set((s.secrets||[]).filter(id=>SBY[id]));}
const progress=()=>({cards:[found.size,W.cards.length],secrets:[sfound.size,W.secrets.length]});
const secretLine=()=>W.secrets.length?`✦ 발견한 비밀 ${sfound.size}/${W.secrets.length}`:'';
const has=id=>found.has(id),hasSecret=id=>sfound.has(id);
/* ---------- 화면 ---------- */
const css=`
#wlDex,#wlBook,#wlEnd{position:fixed;inset:0;display:none;place-items:center;padding:1.2rem;box-sizing:border-box;background:rgba(30,14,36,.5);z-index:32}
#wlDex .dcard{background:var(--panel);border-radius:22px;padding:1.4rem 1.4rem 1.2rem;width:min(22rem,100%);max-height:calc(100vh - 2.4rem);overflow:auto;box-sizing:border-box;text-align:center;
  box-shadow:0 18px 50px rgba(30,14,36,.5);animation:wlRise .45s cubic-bezier(.2,1.4,.4,1)}
#wlDex .k2{display:inline-block;margin:0;background:var(--tag);color:var(--tag-ink);border-radius:999px;padding:.15rem .7rem;font-size:.85rem;font-family:"Jua",sans-serif}
#wlDex img{width:132px;height:132px;display:block;margin:.6rem auto 0}#wlDex h2{margin:.5rem 0 .4rem;font-size:1.6rem;font-weight:400;font-family:"Jua",sans-serif}
#wlDex .fact{margin:0;font-size:1.1rem;line-height:1.7}#wlDex .moreB{display:inline-block;margin-top:.7rem;border:2px solid var(--accent);border-radius:999px;padding:.3rem 1rem;font-size:.95rem}
#wlDex .more{margin:.7rem 0 0;padding:.75rem .9rem;border-radius:14px;background:rgba(242,182,60,.18);line-height:1.65;font-size:1rem;text-align:left}#wlDex [hidden]{display:none!important}
#wlDex .cnt{margin:.7rem 0 0;font-size:.85rem;color:var(--ink-soft)}#wlDex .ok,#wlBook .x,#wlEnd .b1{display:block;width:100%;margin-top:.9rem;text-align:center;border-radius:14px;background:var(--accent);color:var(--accent-ink);font-size:1.05rem;padding:.75rem 1.2rem}
#wlBook .panel{background:var(--panel);border-radius:22px;padding:1.2rem;width:min(40rem,100%);max-height:calc(100vh - 2.4rem);overflow:auto;box-sizing:border-box;box-shadow:0 18px 50px rgba(30,14,36,.5)}
#wlBook h2{margin:0 0 .7rem;font-family:"Jua",sans-serif;font-weight:400;font-size:1.4rem}#wlBook .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(9.5rem,1fr));gap:.6rem}
#wlBook .dx{display:flex;flex-direction:column;align-items:center;gap:.2rem;border:2px solid rgba(62,40,52,.12);border-radius:16px;padding:.6rem;text-align:center}
#wlBook .dx img{width:68px;height:68px}#wlBook .dx b{font-size:1rem;font-weight:400;font-family:"Jua",sans-serif}#wlBook .dx span{font-size:.84rem;color:var(--ink-soft);line-height:1.45}
#wlBook .dx.found{background:rgba(242,182,60,.2);border-color:rgba(242,182,60,.6)}#wlBook .dx.lock{opacity:.6}#wlBook .dx.secret{background:rgba(232,181,58,.2);border-color:#e3ad35}
#wlBook .mtag{font-style:normal;font-size:.75rem;padding:.1rem .5rem;border-radius:999px;background:rgba(242,182,60,.35)}
#wlBook .dsec{grid-column:1/-1;margin-top:.7rem;font-family:"Jua","Gowun Dodum",sans-serif;font-size:1.1rem;color:#c08a20}
#wlEnd{background:radial-gradient(ellipse at 50% 45%,rgba(40,50,90,.35),rgba(30,14,36,.7))}#wlEnd .in{text-align:center;color:#fff8ec;width:min(30rem,100%)}
#wlEnd .stat{margin:1rem 0 0;font-size:1.05rem;text-shadow:0 0 .3em rgba(30,14,36,.8)}#wlEnd .b2{display:block;width:100%;margin-top:.6rem;text-align:center;border:2px solid #fff8ec;border-radius:14px;padding:.7rem 1.2rem;color:#fff8ec}
@keyframes wlRise{from{opacity:0;transform:translateY(24px) scale(.94)}to{opacity:1;transform:none}}`;
const root=document.createElement('div');root.className='wlg';
root.innerHTML=`<div id="wlDex" role="dialog" aria-modal="true" aria-label="새 도감 카드"><div class="dcard"><p class="k2"></p><img alt=""><h2></h2><p class="fact"></p>
<button class="moreB" type="button" hidden>더 알아보기</button><p class="more" hidden></p><p class="cnt"></p><button class="ok" type="button">도감에 넣기</button></div></div>
<div id="wlBook" role="dialog" aria-modal="true" aria-label="도감"><div class="panel"><h2></h2><div class="grid"></div><button class="x" type="button">닫기</button></div></div>
<div id="wlEnd" role="dialog" aria-modal="true"><div class="in"><div class="logo"></div><p class="stat"></p><button class="b1" type="button"></button><button class="b2" type="button"></button></div></div>`;
{const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);document.body.appendChild(root);}
const $=s=>root.querySelector(s);
const ICON_Q=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#fff1d6';g.beginPath();g.arc(64,64,60,0,7);g.fill();
  g.fillStyle='#c9b392';g.font='64px "Jua",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('?',64,68);return c.toDataURL();})();
/* 새 도감 카드 */
const dex=$('#wlDex');let dexDone=null,dexCue=null,dexVoice=null;
function find(id){const d=BY[id];if(!d||found.has(id))return false;found.add(id);save();return showCard(id,true);}
function showCard(id,isNew){const d=BY[id];return cardSlot('dex',r=>{dexDone=r;$('#wlDex .k2').textContent=isNew?'새 도감 카드':W.name;const img=$('#wlDex img');img.src=d.icon||ICON_Q;
  $('#wlDex h2').textContent=d.t;$('#wlDex .fact').textContent=d.f;const mb=$('#wlDex .moreB'),mp=$('#wlDex .more');mb.hidden=!d.x;mb.textContent='더 알아보기';mp.hidden=true;mp.textContent=d.x||'';
  $('#wlDex .cnt').textContent=`${W.name} ${found.size}/${W.cards.length}`;$('#wlDex .ok').textContent=isNew?'도감에 넣기':'닫기';
  dexCue=cue({kind:'card',who:isNew?'새 도감 카드':W.name,text:d.t,sub:d.f,dur:0});dex.style.display='grid';block('dex',true);if(isNew)sfx('dex');
  mb.onclick=()=>{mp.hidden=false;mb.textContent='다시 듣기';if(dexVoice)dexVoice.stop();dexVoice=voice({id:'x_'+d.id,text:d.x,who:'나레이션',kind:'narration'});};});}
function closeDex(){if(cardShown()!=='dex')return;dex.style.display='none';if(dexVoice){dexVoice.stop();dexVoice=null;}if(dexCue)dexCue.dur=+(clock.t-dexCue.t).toFixed(4);dexCue=null;
  block('dex',false);const d=dexDone;dexDone=null;cardDone();if(d)d();}
$('#wlDex .ok').addEventListener('click',closeDex);cardCloser('dex',closeDex);
/* 숨겨진 비밀 */
function findSecret(id){const q=SBY[id];if(!q||sfound.has(id))return false;sfound.add(id);save();let v=null;
  return secretCard({kicker:'숨겨진 비밀 발견!',title:q.t,text:q.f,icon:q.icon,count:secretLine(),button:'비밀 수첩에 넣기',
    onOpen:()=>{sfx('secret');v=voice({id:'s_'+q.id,text:'비밀 발견! '+q.f,who:'나레이션',kind:'narration'});}}).then(r=>{if(v)v.stop();return r;});}
/* 비밀 자리: 금빛 반짝임 (안내 표시) */
const SPOTS=[];let sparkTex=null;
function spark(){if(sparkTex)return sparkTex;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,30);
  gr.addColorStop(0,'rgba(255,240,180,1)');gr.addColorStop(.35,'rgba(255,208,74,.7)');gr.addColorStop(1,'rgba(255,196,70,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
  g.fillStyle='#fff6d6';g.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?3:16;g.lineTo(32+Math.cos(a)*r,32+Math.sin(a)*r);}g.fill();
  sparkTex=new THREE.CanvasTexture(c);sparkTex.colorSpace=THREE.SRGBColorSpace;return sparkTex;}
function spot(o){if(!SBY[o.id])return null;const s=Object.assign({near:6.5,reach:1.4,y:.9},o);
  s.sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:spark(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));s.sprite.scale.setScalar(.7);s.sprite.visible=false;hint(s.sprite);
  SPOTS.push(s);return s;}
const _p=new THREE.Vector3();
function tickCodex(){if(!ctx)return;const P=ctx.WL.position;
  for(const s of SPOTS){const sp=s.sprite;if(sfound.has(s.id)){if(sp.parent)sp.parent.remove(sp);continue;}
    if(s.root)s.root.getWorldPosition(_p);else _p.set(...s.pos);const d=Math.hypot(_p.x-P.x,_p.z-P.z),k=Math.max(0,Math.min(1,(s.near-d)/(s.near-s.reach)));
    sp.material.opacity=k*(.75+.25*Math.sin(clock.t*5));sp.position.set(_p.x,_p.y+s.y+Math.sin(clock.t*2)*.06,_p.z);
    const show=k>.01&&hintsVisible();sp.visible=show;if(show&&!sp.parent)ctx.scene.add(sp);else if(!show&&sp.parent)sp.parent.remove(sp); // 보일 때만 장면에
    if(d<=s.reach&&!cardShown())findSecret(s.id);}}
/* 도감 목록 */
const book=$('#wlBook');
function openBook(){if(cardShown())return false;return cardSlot('book',r=>{book._r=r;const g=$('#wlBook .grid');g.innerHTML='';$('#wlBook h2').textContent=`${W.name} ${found.size}/${W.cards.length}`;
  const cell=(cls,icon,t,sp,tag)=>{const b=document.createElement('button');b.type='button';b.className='dx '+cls;const im=document.createElement('img');im.alt='';im.src=icon;b.appendChild(im);
    const bt=document.createElement('b');bt.textContent=t;b.appendChild(bt);const s=document.createElement('span');s.textContent=sp;b.appendChild(s);if(tag){const m=document.createElement('em');m.className='mtag';m.textContent=tag;b.appendChild(m);}g.appendChild(b);return b;};
  W.cards.forEach(d=>{const got=found.has(d.id);const b=cell(got?'found':'lock',got?(d.icon||ICON_Q):ICON_Q,got?d.t:'???',got?d.f:`${d.where||''}에서 만날 수 있어요`,got&&d.x?'더 알아보기':'');
    if(got)b.onclick=()=>{closeBook();showCard(d.id,false);};});
  if(W.secrets.length){const h=document.createElement('div');h.className='dsec';h.textContent=`✦ 숨겨진 비밀 ${sfound.size}/${W.secrets.length}`;g.appendChild(h);
    W.secrets.forEach(q=>{const got=sfound.has(q.id);cell(got?'secret':'lock',got?(q.icon||ICON_Q):ICON_Q,got?q.t:'???',got?q.f:`${q.where||''} 어딘가`);});}
  book.style.display='grid';block('book',true);});}
function closeBook(){if(cardShown()!=='book')return;book.style.display='none';block('book',false);const r=book._r;book._r=null;cardDone();if(r)r();}
$('#wlBook .x').addEventListener('click',closeBook);cardCloser('book',closeBook);
/* 엔딩 */
const end=$('#wlEnd');let endCue=null;
function ending({ribbon='탐험가의 대모험',logo='',sub='',buttons=[{label:'처음으로'}]}={}){return cardSlot('ending',r=>{const L=$('#wlEnd .logo');L.innerHTML='';L.appendChild(logoEl({ribbon,logo,sub,kind:'ending'}));
  const p=progress();$('#wlEnd .stat').textContent=[W.cards.length?`${W.name} ${p.cards[0]}/${p.cards[1]}`:'',secretLine()].filter(Boolean).join(' · ');
  ['.b1','.b2'].forEach((s,i)=>{const b=$('#wlEnd '+s),B=buttons[i];b.style.display=B?'':'none';if(!B)return;b.textContent=B.label;
    b.onclick=()=>{closeEnding();try{B.act&&B.act();}finally{r(i);}};});
  endCue=cue({kind:'card',who:'엔딩',text:logo,sub,dur:0});end.style.display='grid';block('ending',true);});}
function closeEnding(){if(cardShown()!=='ending')return;end.style.display='none';if(endCue)endCue.dur=+(clock.t-endCue.t).toFixed(4);endCue=null;block('ending',false);cardDone();}
cardCloser('ending',()=>{const b=$('#wlEnd .b1');if(b.onclick)b.onclick();else closeEnding();});
function initCodex(c){ctx=c;}
function clearSpots(){SPOTS.splice(0).forEach(s=>{if(s.sprite.parent)s.sprite.parent.remove(s.sprite);s.sprite.material.dispose();});}
export {clearSpots,closeBook,closeDex,ending,find,findSecret,has,hasSecret,initCodex,openBook,progress,secretLine,setup,spot,tickCodex};
