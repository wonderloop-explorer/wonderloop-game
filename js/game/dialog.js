/* 원더룹 — 대화: NPC와 말하기(E·말 걸기 단추·NPC 누르기), 혼잣말(say) — 개미굴 편 talk·say를 옮긴 것
   npc({name, root, lines | variants:[{when:()=>참거짓, lines}], onDone, talkR, voice:{대사:'소리id'}})
   규칙
   - 대사 묶음이 비어 있거나 준비되지 않은 NPC는 말 걸 상대로 고르지 않는다(개미굴 꿀단지 멈춤의 교훈). 대화 중 비면 닫는다.
   - 대화 중에는 다른 혼잣말이 끼어들지 않는다 → 줄을 섰다가 대화가 끝나면 나온다.
   - 대화가 열려 있으면 "막힘" → 위협 멈춤, 나레이션 멈췄다 닫히면 다시.
   - 대사 한 줄이 뜰 때마다 blip 소리(개미굴과 같음). 대화창·말풍선 모양은 개미굴 편 그대로(ui.js·아래 말풍선).
   - onDone은 마지막 대사까지 넘겨서 닫았을 때만(2026-11-02 — 대화 중 멀어지거나·대쉬하거나·구역을 바꿔 닫혀도 불려서, 사공 설명을 다 듣지 않아도 미션이 시작됐다).
     중간에 닫히면 진행은 그대로 두고 '…' 말풍선을 되돌린다(다시 말을 걸면 처음부터).
   - 말풍선·다시 말 걸기(2026-11-04 시리즈 규칙): 말풍선은 가까운 주민들 위에 늘 떠 있다(휴대폰 4·컴퓨터 6명, 9m 안). 이야기를 끝까지 들은 주민은 '…' 대신 작은 하트.
     이야기했는지는 저장(flags 'talk:<구역>:<id 또는 이름>' = 그때 들은 대사 묶음의 표시) — 다시 말을 걸면 같은 대사 묶음이면 짧은 한마디(npc repeatLine, 없으면 마지막 대사)만,
     이야기가 진행돼 대사 묶음이 바뀌었으면(variants) 새 대사를 처음부터. 이름이 같은 주민이 여럿이면 등록 순서로 #2, #3을 붙인다(구역은 늘 같은 순서로 만든다).
   - say()는 끝까지 보여 주면 true, 구역을 바꿔 지워지면 false로 끝난다 — 이어지는 진행은 결과를 보고(.then(ok=>ok&&…)). */
import * as THREE from 'three';
import {block,blocking,clock} from './core.js';
import {sfx,voice} from './sound.js';
import {hideDialog,hint,hintsVisible,setPrompt,showDialog} from './ui.js';
import {flags,setFlag} from './state.js';
import {bentPos} from './bend.js';
import {act as handAct,prompt as handPrompt} from './interact.js'; // 말 걸 상대가 없으면 손으로 하는 상호작용(E·터치 단추)
const coarse=matchMedia('(pointer:coarse)').matches,reduce=matchMedia('(prefers-reduced-motion: reduce)');
const NPCS=[];let talk=null,near=null,ctx=null;const sayQ=[];let saying=null;
let ZID='';function setDialogZone(id){if(id)ZID=id;}
function npc(def){const n=Object.assign({talkR:0},def);const base=def.id||def.name||'npc',same=NPCS.filter(m=>m.keyBase===base).length;n.keyBase=base;n.key='talk:'+ZID+':'+base+(same?'#'+(same+1):'');NPCS.push(n);return n;}
const sigOf=L=>{let h=0;const t=L.join('\n');for(let i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))|0;return 'v'+(h>>>0).toString(36);};
function rawLines(n){if(!n)return [];let L=n.lines;if(n.variants)for(const v of n.variants){try{if(v.when())L=v.lines;}catch(e){}}return Array.isArray(L)?L.filter(x=>x!=null&&x!==''):[];}
const met=n=>!!(n&&flags[n.key]);
/* 지금 들려줄 대사: 이미 끝까지 들은 같은 대사 묶음이면 짧은 한마디 */
function linesOf(n){const L=rawLines(n);if(!L.length)return L;if(flags[n.key]===sigOf(L))return [n.repeatLine||L[L.length-1]];return L;}
const talkable=n=>n&&n.root&&n.root.visible!==false&&linesOf(n).length>0;
function show(){const L=talk.L;if(talk.i>=L.length){endTalk(true);return;}const text=L[talk.i];
  const last=talk.i>=L.length-1; // 넘기는 법: 터치는 대화창이나 아래 단추("다음"·"닫기"), 키보드는 E, 마우스는 대화창이나 화면 누르기
  showDialog(talk.n.name,text,coarse?(last?'눌러서 닫기':'눌러서 계속'):(last?'E 또는 클릭으로 닫기':'E 또는 클릭으로 계속'));
  sfx(talk.i?'talk-next':'talk-start');if(talk.h)talk.h.stop();talk.h=voice({id:talk.n.voice&&talk.n.voice[text],text,who:talk.n.name,kind:'dialogue'});}
function startTalk(n){if(!talkable(n)||talk)return false;
if(saying){const r=saying.r;saying=null;r(true);} // 떠 있던 혼잣말은 끝내고
  const R=rawLines(n);talk={n,i:0,h:null,L:linesOf(n),sig:sigOf(R)};block('talk',true);show();return true;}
function endTalk(done=false){if(!talk)return;const n=talk.n,talk0sig=talk.sig;if(talk.h)talk.h.stop();talk=null;hideDialog();block('talk',false);
  if(!done)return; // 중간에 닫힘: 진행 그대로(저장 안 함 — 다시 말 걸면 처음부터)
  setFlag(n.key,talk0sig);
  if(n.onDone)try{n.onDone();}catch(e){console.error(e);}}
function advance(){if(!talk)return false;talk.i++;show();return true;}
/* 혼잣말: say(누가, 대사, 초) — 화면이 막혀 있으면(대화·카드·결과) 기다렸다가 나온다. 끝나면 true, 구역을 바꿔 지워지면 false */
function say(who,text,sec,id){return new Promise(r=>sayQ.push({who,text,sec,id,r}));}
function tickSay(){
  if(saying&&clock.t>=saying.end){hideDialog();const r=saying.r;saying=null;r(true);}
  if(!saying&&!talk&&sayQ.length&&!blocking()){const s=sayQ.shift();showDialog(s.who,s.text,'');sfx('talk-next');const h=voice({id:s.id,text:s.text,who:s.who,kind:'dialogue'});
    s.end=clock.t+Math.max(s.sec||0,h.dur);saying=s;}}
/* 말풍선 (안내 표시) — 개미굴 편 bubbleSprite 그대로: 크림색(#fffaf2) 둥근 네모 + 왼쪽 아래 뾰족한 꼬리, 진한 점 세 개(#3e2834).
   아직 한 번도 말을 걸지 않은 인물 가운데 가장 가까운 하나(7m 안)의 머리 바로 위에만 — 'E 말 걸기'가 떠도 계속 보이고, 말을 건 뒤에는 그 인물 위에 다시 뜨지 않는다(2026-11-02).
   위아래로 살짝 흔들림(움직임 줄이기면 멈춤). 깊이를 봐서 잎 뒤로 숨은 인물의 말풍선은 같이 가려진다. 가까이 가면 조금 작게(원더룹 얼굴·화면 위 안내 문구와 겹치지 않게).
   크기도 개미굴과 같게: 카메라가 가까우면 화면 높이의 약 11%로 늘 같은 크기, 따라가기 거리보다 멀어지면 작아진다(개미굴 min(1, 거리/7)과 같은 비율).
   꼬리 끝 높이는 NPC bubbleY 아래 0.13(머리를 덮지 않게 예전 말풍선 꼬리 자리 그대로) */
const BUBS=[],MAXB=coarse?4:6;let bubTex=null,heartTex=null,bubScene=null;
function bubCanvas(heart){const c=document.createElement('canvas');c.width=128;c.height=96;const g=c.getContext('2d');
  g.fillStyle='#fffaf2';g.beginPath();g.moveTo(24,8);g.lineTo(104,8);g.quadraticCurveTo(120,8,120,24);g.lineTo(120,52);g.quadraticCurveTo(120,68,104,68);
  g.lineTo(60,68);g.lineTo(44,86);g.lineTo(46,68);g.lineTo(24,68);g.quadraticCurveTo(8,68,8,52);g.lineTo(8,24);g.quadraticCurveTo(8,8,24,8);g.fill();
  if(heart){g.fillStyle='#ef6f8a';g.beginPath();const x=64,y=40,r=13;g.moveTo(x,y+r*1.15);g.bezierCurveTo(x-r*2.1,y-r*.2,x-r*.9,y-r*1.7,x,y-r*.55);g.bezierCurveTo(x+r*.9,y-r*1.7,x+r*2.1,y-r*.2,x,y+r*1.15);g.fill();}
  else{g.fillStyle='#3e2834';[40,64,88].forEach(x=>{g.beginPath();g.arc(x,38,7,0,7);g.fill();});}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function makeBubble(scene){bubScene=scene;bubTex=bubCanvas(false);heartTex=bubCanvas(true);
  for(let i=0;i<MAXB;i++){const b=new THREE.Sprite(new THREE.SpriteMaterial({map:bubTex,depthTest:true,depthWrite:false,transparent:true})); // 깊이를 봐서 잎·줄기 뒤로 숨은 요정의 말풍선만 떠 보이지 않게
    b.renderOrder=10;b.visible=false;hint(b);BUBS.push(b);}} // 장면에는 보일 때만 붙인다 (숨겨 둔 스프라이트도 그림을 1단계 바꾼다)
/* 개미굴: 시야각 55°, 따라가기 거리 6에서 카메라 7 안쪽은 높이 0.82×(거리/7) → 화면 높이의 0.82/(7·2tan27.5°) ≈ 11.25%.
   원더룹: 따라가기 거리(가로 7.5, 세로 화면은 더 멀리)의 7/6배 안쪽은 같은 화면 비율, 그보다 멀면 거리에 반비례해 작아진다 */
const BUB_H=.82/(7*2*Math.tan(27.5*Math.PI/180));
function bubbleSize(cam,d){const asp=cam.aspect,far=7.5*(asp<1.25?Math.min(2.1,1.25/asp):1)*7/6,h=BUB_H*Math.min(d,far)*2*Math.tan(cam.fov*Math.PI/360);return h;}
const _p=new THREE.Vector3(),_q=new THREE.Vector3();
function tickDialog(){if(!ctx)return;const P=ctx.WL.position;
  // 대화 중 너무 멀어지면 닫음
  if(talk){talk.n.root.getWorldPosition(_p);if(Math.hypot(_p.x-P.x,_p.z-P.z)>3.6+talk.n.talkR)endTalk(false);}
  near=null;let nd=1.7;if(!talk&&!blocking())for(const n of NPCS){if(!talkable(n))continue;n.root.getWorldPosition(_p);const d=Math.hypot(_p.x-P.x,_p.z-P.z)-n.talkR;if(d<nd){nd=d;near=n;}}
  if(talk){const L=talk.L;setPrompt('',talk.i>=L.length-1?'닫기':'다음');} // 대화 중에도 터치 넘김 단추를 남긴다
  else setPrompt(near?(coarse?'말 걸기':'E 말 걸기'):handPrompt());
  placePrompt(talk?null:near);
  // 말풍선: 9m 안 가까운 주민들 위에 늘(대화 중인 상대는 빼고) — 아직 끝까지 이야기하지 않은 주민은 '…', 이야기한 주민은 작은 하트(조금 작게)
  const L=[];if(hintsVisible()&&!(blocking()&&!talk)){for(const n of NPCS){if(!talkable(n)||(talk&&talk.n===n))continue;n.root.getWorldPosition(_p);const d=Math.hypot(_p.x-P.x,_p.z-P.z);if(d<9)L.push([d,n]);}L.sort((a,b)=>a[0]-b[0]);}
  for(let i=0;i<BUBS.length;i++){const b=BUBS[i],e=L[i];if(!e){if(b.visible){b.visible=false;if(b.parent)b.parent.remove(b);}continue;}const [wd,who]=e,hm=met(who);
    if(b.material.map!==(hm?heartTex:bubTex)){b.material.map=hm?heartTex:bubTex;b.material.needsUpdate=true;}
    who.root.getWorldPosition(_q);const cam=ctx.camera,h=bubbleSize(cam,cam.position.distanceTo(_q))*(.72+.28*Math.min(1,Math.max(0,(wd-1.5)/2.5)))*(hm?.78:1);b.scale.set(h*1.1/.82,h,1); // 대화 거리 가까이는 72%까지 작게
    _q.y+=(who.bubbleY||1.4)-.133+h*.5+(reduce.matches?0:Math.sin(clock.t*4+i*1.7)*.04);b.position.copy(_q);b.visible=true;if(!b.parent)bubScene.add(b);}
  tickSay();}
/* 입력: E(또는 말 걸기 단추) — 대화 중이면 다음, 아니면 가까운 NPC와 대화 */
function act(){if(talk)return advance();if(near)return startTalk(near);return handAct();}
function clickNPC(ray){if(talk){advance();return true;}const hits=ray.intersectObjects(NPCS.filter(talkable).map(n=>n.root),true);if(hits.length){let o=hits[0].object;const n=NPCS.find(n=>{let q=o;while(q){if(q===n.root)return true;q=q.parent;}return false;});if(n&&startTalk(n))return true;}return false;}
/* 'E 말 걸기'는 말 걸 상대 머리 위(말풍선 위)에 띄운다(2026-11-08 — 화면 아래 가운데에 뜨면 문·절구 같은 물건 앞에 섰을 때 누구에게 말을 거는지 몰랐다).
   컴퓨터만(휴대폰은 오른쪽 말 걸기 단추). 상대가 화면 밖·카메라 뒤면 원래 자리(아래 가운데). 손으로 하는 상호작용 안내는 그대로 아래 가운데 */
const _pp=new THREE.Vector3();
function placePrompt(n){const el=document.getElementById('wlPrompt');if(!el)return;const cam=ctx&&ctx.camera;
  if(!n||coarse||!cam){if(el.dataset.at){el.style.left=el.style.top=el.style.bottom=el.style.transform='';delete el.dataset.at;}return;}
  n.root.getWorldPosition(_pp);_pp.y+=(n.bubbleY||1.4);const b=bentPos({x:_pp.x,y:_pp.y,z:_pp.z});_pp.set(b.x,b.y,b.z).project(cam);
  if(_pp.z>1||Math.abs(_pp.x)>.95||_pp.y>.95||_pp.y<-.9){if(el.dataset.at){el.style.left=el.style.top=el.style.bottom=el.style.transform='';delete el.dataset.at;}
    if(n.name)el.textContent='E '+n.name+'에게 말 걸기';return;} /* 상대가 화면 밖이면 아래 가운데에 누구인지 이름을 붙여서 */
  const x=(_pp.x+1)/2*innerWidth,y=(1-_pp.y)/2*innerHeight-innerHeight*.11;el.dataset.at='1';
  el.style.left=Math.round(Math.min(innerWidth-90,Math.max(90,x)))+'px';el.style.top=Math.round(Math.max(130,y))+'px';el.style.bottom='auto';el.style.transform='translate(-50%,-100%)';}
function initDialog(c){ctx=c;makeBubble(c.scene);
  window.addEventListener('keydown',e=>{if(e.code==='KeyE'&&!e.repeat&&!(e.target&&e.target.tagName==='INPUT'))act();});
  document.getElementById('wlAct').addEventListener('pointerdown',e=>{e.preventDefault();act();});
  document.getElementById('wlDlg').addEventListener('pointerdown',e=>{if(talk){e.preventDefault();e.stopPropagation();advance();}});} // 대화창을 눌러도 다음
function clearDialog(){if(talk)endTalk(false);NPCS.length=0;near=null; // 구역을 바꿀 때: 기다리던 혼잣말·떠 있는 혼잣말도 비우고 false로 끝낸다
  sayQ.splice(0).forEach(s=>s.r(false));if(saying){hideDialog();const r=saying.r;saying=null;r(false);}}
const talking=()=>!!talk,talkNPC=()=>talk?talk.n:null; /* 지금 이야기하는 주민(대화 카메라 — game/index) */
const npcList=()=>NPCS; // 시험 도구(game/devcheck 크기 확인)
const findNPC=name=>NPCS.find(n=>n.name===name)||null;
const lineEnd=()=>talk&&talk.h?talk.h.end:null; // 지금 대사(목소리)가 끝나는 게임 시각 — 영상 캡처가 대사를 저절로 넘길 때
export {talkNPC,act,setDialogZone,met as npcMet,clearDialog,clickNPC,endTalk,findNPC,npcList,initDialog,lineEnd,linesOf,npc,say,startTalk,talkable,talking,tickDialog};
