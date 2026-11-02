/* 원더룹 — 대화: NPC와 말하기(E·말 걸기 단추·NPC 누르기), 혼잣말(say) — 개미굴 편 talk·say를 옮긴 것
   npc({name, root, lines | variants:[{when:()=>참거짓, lines}], onDone, talkR, voice:{대사:'소리id'}})
   규칙
   - 대사 묶음이 비어 있거나 준비되지 않은 NPC는 말 걸 상대로 고르지 않는다(개미굴 꿀단지 멈춤의 교훈). 대화 중 비면 닫는다.
   - 대화 중에는 다른 혼잣말이 끼어들지 않는다 → 줄을 섰다가 대화가 끝나면 나온다.
   - 대화가 열려 있으면 "막힘" → 위협 멈춤, 나레이션 멈췄다 닫히면 다시.
   - 대사 한 줄이 뜰 때마다 blip 소리(개미굴과 같음). 대화창·말풍선 모양은 개미굴 편 그대로(ui.js·아래 말풍선).
   - onDone은 마지막 대사까지 넘겨서 닫았을 때만(2026-11-02 — 대화 중 멀어지거나·대쉬하거나·구역을 바꿔 닫혀도 불려서, 사공 설명을 다 듣지 않아도 미션이 시작됐다).
     중간에 닫히면 진행은 그대로 두고 '…' 말풍선을 되돌린다(다시 말을 걸면 처음부터).
   - say()는 끝까지 보여 주면 true, 구역을 바꿔 지워지면 false로 끝난다 — 이어지는 진행은 결과를 보고(.then(ok=>ok&&…)). */
import * as THREE from 'three';
import {block,blocking,clock} from './core.js';
import {sfx,voice} from './sound.js';
import {hideDialog,hint,hintsVisible,setPrompt,showDialog} from './ui.js';
import {act as handAct,prompt as handPrompt} from './interact.js'; // 말 걸 상대가 없으면 손으로 하는 상호작용(E·터치 단추)
const coarse=matchMedia('(pointer:coarse)').matches,reduce=matchMedia('(prefers-reduced-motion: reduce)');
const NPCS=[];let talk=null,near=null,ctx=null;const sayQ=[];let saying=null;
function npc(def){const n=Object.assign({talkR:0},def);NPCS.push(n);return n;}
function linesOf(n){if(!n)return [];let L=n.lines;if(n.variants)for(const v of n.variants){try{if(v.when())L=v.lines;}catch(e){}}return Array.isArray(L)?L.filter(x=>x!=null&&x!==''):[];}
const talkable=n=>n&&n.root&&n.root.visible!==false&&linesOf(n).length>0;
function show(){const L=linesOf(talk.n);if(talk.i>=L.length){endTalk(true);return;}const text=L[talk.i];
  const last=talk.i>=L.length-1; // 넘기는 법: 터치는 대화창이나 아래 단추("다음"·"닫기"), 키보드는 E, 마우스는 대화창이나 화면 누르기
  showDialog(talk.n.name,text,coarse?(last?'눌러서 닫기':'눌러서 계속'):(last?'E 또는 클릭으로 닫기':'E 또는 클릭으로 계속'));
  sfx('blip');if(talk.h)talk.h.stop();talk.h=voice({id:talk.n.voice&&talk.n.voice[text],text,who:talk.n.name,kind:'dialogue'});}
function startTalk(n){if(!talkable(n)||talk)return false;n.talked=true; // 한 번 말을 건 인물은 '…' 말풍선을 더 띄우지 않는다
if(saying){const r=saying.r;saying=null;r(true);} // 떠 있던 혼잣말은 끝내고
  talk={n,i:0,h:null};block('talk',true);show();return true;}
function endTalk(done=false){if(!talk)return;const n=talk.n;if(talk.h)talk.h.stop();talk=null;hideDialog();block('talk',false);
  if(!done){n.talked=false;return;} // 중간에 닫힘: 진행 그대로, 말풍선 되돌림
  if(n.onDone)try{n.onDone();}catch(e){console.error(e);}}
function advance(){if(!talk)return false;talk.i++;show();return true;}
/* 혼잣말: say(누가, 대사, 초) — 화면이 막혀 있으면(대화·카드·결과) 기다렸다가 나온다. 끝나면 true, 구역을 바꿔 지워지면 false */
function say(who,text,sec,id){return new Promise(r=>sayQ.push({who,text,sec,id,r}));}
function tickSay(){
  if(saying&&clock.t>=saying.end){hideDialog();const r=saying.r;saying=null;r(true);}
  if(!saying&&!talk&&sayQ.length&&!blocking()){const s=sayQ.shift();showDialog(s.who,s.text,'');sfx('blip');const h=voice({id:s.id,text:s.text,who:s.who,kind:'dialogue'});
    s.end=clock.t+Math.max(s.sec||0,h.dur);saying=s;}}
/* 말풍선 (안내 표시) — 개미굴 편 bubbleSprite 그대로: 크림색(#fffaf2) 둥근 네모 + 왼쪽 아래 뾰족한 꼬리, 진한 점 세 개(#3e2834).
   아직 한 번도 말을 걸지 않은 인물 가운데 가장 가까운 하나(7m 안)의 머리 바로 위에만 — 'E 말 걸기'가 떠도 계속 보이고, 말을 건 뒤에는 그 인물 위에 다시 뜨지 않는다(2026-11-02).
   위아래로 살짝 흔들림(움직임 줄이기면 멈춤). 깊이를 봐서 잎 뒤로 숨은 인물의 말풍선은 같이 가려진다. 가까이 가면 조금 작게(원더룹 얼굴·화면 위 안내 문구와 겹치지 않게).
   크기도 개미굴과 같게: 카메라가 가까우면 화면 높이의 약 11%로 늘 같은 크기, 따라가기 거리보다 멀어지면 작아진다(개미굴 min(1, 거리/7)과 같은 비율).
   꼬리 끝 높이는 NPC bubbleY 아래 0.13(머리를 덮지 않게 예전 말풍선 꼬리 자리 그대로) */
let bubble=null;
function makeBubble(scene){const c=document.createElement('canvas');c.width=128;c.height=96;const g=c.getContext('2d');
  g.fillStyle='#fffaf2';g.beginPath();g.moveTo(24,8);g.lineTo(104,8);g.quadraticCurveTo(120,8,120,24);g.lineTo(120,52);g.quadraticCurveTo(120,68,104,68);
  g.lineTo(60,68);g.lineTo(44,86);g.lineTo(46,68);g.lineTo(24,68);g.quadraticCurveTo(8,68,8,52);g.lineTo(8,24);g.quadraticCurveTo(8,8,24,8);g.fill();
  g.fillStyle='#3e2834';[40,64,88].forEach(x=>{g.beginPath();g.arc(x,38,7,0,7);g.fill();});
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;bubble=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:true,depthWrite:false,transparent:true})); // 깊이를 봐서 잎·줄기 뒤로 숨은 요정의 말풍선만 떠 보이지 않게
  bubble.renderOrder=10;bubble.visible=false;hint(bubble);bubble.userData.scene=scene;} // 장면에는 보일 때만 붙인다 (숨겨 둔 스프라이트도 그림을 1단계 바꾼다)
/* 개미굴: 시야각 55°, 따라가기 거리 6에서 카메라 7 안쪽은 높이 0.82×(거리/7) → 화면 높이의 0.82/(7·2tan27.5°) ≈ 11.25%.
   원더룹: 따라가기 거리(가로 7.5, 세로 화면은 더 멀리)의 7/6배 안쪽은 같은 화면 비율, 그보다 멀면 거리에 반비례해 작아진다 */
const BUB_H=.82/(7*2*Math.tan(27.5*Math.PI/180));
function bubbleSize(cam,d){const asp=cam.aspect,far=7.5*(asp<1.25?Math.min(2.1,1.25/asp):1)*7/6,h=BUB_H*Math.min(d,far)*2*Math.tan(cam.fov*Math.PI/360);return h;}
const _p=new THREE.Vector3(),_q=new THREE.Vector3();
function tickDialog(){if(!ctx)return;const P=ctx.WL.position;
  // 대화 중 너무 멀어지면 닫음
  if(talk){talk.n.root.getWorldPosition(_p);if(Math.hypot(_p.x-P.x,_p.z-P.z)>3.6+talk.n.talkR)endTalk(false);}
  near=null;let nd=1.7;if(!talk&&!blocking())for(const n of NPCS){if(!talkable(n))continue;n.root.getWorldPosition(_p);const d=Math.hypot(_p.x-P.x,_p.z-P.z)-n.talkR;if(d<nd){nd=d;near=n;}}
  if(talk){const L=linesOf(talk.n);setPrompt('',talk.i>=L.length-1?'닫기':'다음');} // 대화 중에도 터치 넘김 단추를 남긴다
  else setPrompt(near?(coarse?'말 걸기':'E 말 걸기'):handPrompt());
  // 말풍선은 아직 말을 걸지 않은 가장 가까운 인물 위에 — 'E 말 걸기'가 떠도 그대로, 말을 건 뒤에는 사라짐
  let who=null,wd=7;if(!talk&&!blocking()){for(const n of NPCS){if(!talkable(n)||n.talked)continue;n.root.getWorldPosition(_p);const d=Math.hypot(_p.x-P.x,_p.z-P.z);if(d<wd){wd=d;who=n;}}}
  if(bubble){if(who&&hintsVisible()){who.root.getWorldPosition(_q);const cam=ctx.camera,h=bubbleSize(cam,cam.position.distanceTo(_q))*(.72+.28*Math.min(1,Math.max(0,(wd-1.5)/2.5)));bubble.scale.set(h*1.1/.82,h,1); // 대화 거리 가까이는 72%까지 작게
    _q.y+=(who.bubbleY||1.4)-.133+h*.5+(reduce.matches?0:Math.sin(clock.t*4)*.04);bubble.position.copy(_q);bubble.visible=true;if(!bubble.parent)bubble.userData.scene.add(bubble);}else{bubble.visible=false;if(bubble.parent)bubble.parent.remove(bubble);}}
  tickSay();}
/* 입력: E(또는 말 걸기 단추) — 대화 중이면 다음, 아니면 가까운 NPC와 대화 */
function act(){if(talk)return advance();if(near)return startTalk(near);return handAct();}
function clickNPC(ray){if(talk){advance();return true;}const hits=ray.intersectObjects(NPCS.filter(talkable).map(n=>n.root),true);if(hits.length){let o=hits[0].object;const n=NPCS.find(n=>{let q=o;while(q){if(q===n.root)return true;q=q.parent;}return false;});if(n&&startTalk(n))return true;}return false;}
function initDialog(c){ctx=c;makeBubble(c.scene);
  window.addEventListener('keydown',e=>{if(e.code==='KeyE'&&!e.repeat&&!(e.target&&e.target.tagName==='INPUT'))act();});
  document.getElementById('wlAct').addEventListener('pointerdown',e=>{e.preventDefault();act();});
  document.getElementById('wlDlg').addEventListener('pointerdown',e=>{if(talk){e.preventDefault();e.stopPropagation();advance();}});} // 대화창을 눌러도 다음
function clearDialog(){if(talk)endTalk(false);NPCS.length=0;near=null; // 구역을 바꿀 때: 기다리던 혼잣말·떠 있는 혼잣말도 비우고 false로 끝낸다
  sayQ.splice(0).forEach(s=>s.r(false));if(saying){hideDialog();const r=saying.r;saying=null;r(false);}}
const talking=()=>!!talk;
const findNPC=name=>NPCS.find(n=>n.name===name)||null;
const lineEnd=()=>talk&&talk.h?talk.h.end:null; // 지금 대사(목소리)가 끝나는 게임 시각 — 영상 캡처가 대사를 저절로 넘길 때
export {act,clearDialog,clickNPC,endTalk,findNPC,initDialog,lineEnd,linesOf,npc,say,startTalk,talkable,talking,tickDialog};
