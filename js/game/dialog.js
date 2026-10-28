/* 원더룹 — 대화: NPC와 말하기(E·말 걸기 단추·NPC 누르기), 혼잣말(say) — 개미굴 편 talk·say를 옮긴 것
   npc({name, root, lines | variants:[{when:()=>참거짓, lines}], onDone, talkR, voice:{대사:'소리id'}})
   규칙
   - 대사 묶음이 비어 있거나 준비되지 않은 NPC는 말 걸 상대로 고르지 않는다(개미굴 꿀단지 멈춤의 교훈). 대화 중 비면 닫는다.
   - 대화 중에는 다른 혼잣말이 끼어들지 않는다 → 줄을 섰다가 대화가 끝나면 나온다.
   - 대화가 열려 있으면 "막힘" → 위협 멈춤, 나레이션 멈췄다 닫히면 다시. */
import * as THREE from 'three';
import {block,blocking,clock} from './core.js';
import {voice} from './sound.js';
import {hideDialog,hint,hintsVisible,setPrompt,showDialog} from './ui.js';
const coarse=matchMedia('(pointer:coarse)').matches;
const NPCS=[];let talk=null,near=null,ctx=null;const sayQ=[];let saying=null;
function npc(def){const n=Object.assign({talkR:0},def);NPCS.push(n);return n;}
function linesOf(n){if(!n)return [];let L=n.lines;if(n.variants)for(const v of n.variants){try{if(v.when())L=v.lines;}catch(e){}}return Array.isArray(L)?L.filter(x=>x!=null&&x!==''):[];}
const talkable=n=>n&&n.root&&n.root.visible!==false&&linesOf(n).length>0;
function show(){const L=linesOf(talk.n);if(talk.i>=L.length){endTalk();return;}const text=L[talk.i];
  showDialog(talk.n.name,text,talk.i<L.length-1?(coarse?'말 걸기를 눌러 계속':'E로 계속'):(coarse?'말 걸기를 눌러 닫기':'E로 닫기'));
  if(talk.h)talk.h.stop();talk.h=voice({id:talk.n.voice&&talk.n.voice[text],text,who:talk.n.name,kind:'dialogue'});}
function startTalk(n){if(!talkable(n)||talk)return false;if(saying){const r=saying.r;saying=null;r();} // 떠 있던 혼잣말은 끝내고
  talk={n,i:0,h:null};block('talk',true);show();return true;}
function endTalk(){if(!talk)return;const n=talk.n;if(talk.h)talk.h.stop();talk=null;hideDialog();block('talk',false);if(n.onDone)try{n.onDone();}catch(e){console.error(e);}}
function advance(){if(!talk)return false;talk.i++;show();return true;}
/* 혼잣말: say(누가, 대사, 초) — 화면이 막혀 있으면(대화·카드·결과) 기다렸다가 나온다. 끝나면 resolve */
function say(who,text,sec,id){return new Promise(r=>sayQ.push({who,text,sec,id,r}));}
function tickSay(){
  if(saying&&clock.t>=saying.end){hideDialog();const r=saying.r;saying=null;r();}
  if(!saying&&!talk&&sayQ.length&&!blocking()){const s=sayQ.shift();showDialog(s.who,s.text,'');const h=voice({id:s.id,text:s.text,who:s.who,kind:'dialogue'});
    s.end=clock.t+Math.max(s.sec||0,h.dur);saying=s;}}
/* 말풍선 (안내 표시) */
let bubble=null;
function makeBubble(scene){const c=document.createElement('canvas');c.width=128;c.height=96;const g=c.getContext('2d');
  g.fillStyle='#fffaf2';g.strokeStyle='#3e2834';g.lineWidth=5;g.beginPath();g.roundRect?g.roundRect(8,8,112,62,22):g.rect(8,8,112,62);g.fill();g.stroke();
  g.beginPath();g.moveTo(44,68);g.lineTo(36,90);g.lineTo(62,69);g.fill();g.fillStyle='#3e2834';[40,64,88].forEach(x=>{g.beginPath();g.arc(x,39,6,0,7);g.fill();});
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;bubble=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));
  bubble.scale.set(.5,.38,1);bubble.renderOrder=10;bubble.visible=false;hint(bubble);bubble.userData.scene=scene;} // 장면에는 보일 때만 붙인다 (숨겨 둔 스프라이트도 그림을 1단계 바꾼다)
const _p=new THREE.Vector3(),_q=new THREE.Vector3();
function tickDialog(){if(!ctx)return;const P=ctx.WL.position;
  // 대화 중 너무 멀어지면 닫음
  if(talk){talk.n.root.getWorldPosition(_p);if(Math.hypot(_p.x-P.x,_p.z-P.z)>3.6+talk.n.talkR)endTalk();}
  near=null;let nd=1.7;if(!talk&&!blocking())for(const n of NPCS){if(!talkable(n))continue;n.root.getWorldPosition(_p);const d=Math.hypot(_p.x-P.x,_p.z-P.z)-n.talkR;if(d<nd){nd=d;near=n;}}
  setPrompt(near?(coarse?'말 걸기':'E 말 걸기'):'');
  const who=talk?null:near;if(bubble){if(who&&hintsVisible()){who.root.getWorldPosition(_q);_q.y+=(who.bubbleY||1.4)+Math.sin(clock.t*4)*.04;bubble.position.copy(_q);bubble.visible=true;if(!bubble.parent)bubble.userData.scene.add(bubble);}else{bubble.visible=false;if(bubble.parent)bubble.parent.remove(bubble);}}
  tickSay();}
/* 입력: E(또는 말 걸기 단추) — 대화 중이면 다음, 아니면 가까운 NPC와 대화 */
function act(){if(talk)return advance();if(near)return startTalk(near);return false;}
function clickNPC(ray){if(talk){advance();return true;}const hits=ray.intersectObjects(NPCS.filter(talkable).map(n=>n.root),true);if(hits.length){let o=hits[0].object;const n=NPCS.find(n=>{let q=o;while(q){if(q===n.root)return true;q=q.parent;}return false;});if(n&&startTalk(n))return true;}return false;}
function initDialog(c){ctx=c;makeBubble(c.scene);
  window.addEventListener('keydown',e=>{if(e.code==='KeyE'&&!e.repeat&&!(e.target&&e.target.tagName==='INPUT'))act();});
  document.getElementById('wlAct').addEventListener('pointerdown',e=>{e.preventDefault();act();});}
function clearDialog(){if(talk)endTalk();NPCS.length=0;near=null;}
const talking=()=>!!talk;
const findNPC=name=>NPCS.find(n=>n.name===name)||null;
const lineEnd=()=>talk&&talk.h?talk.h.end:null; // 지금 대사(목소리)가 끝나는 게임 시각 — 영상 캡처가 대사를 저절로 넘길 때
export {act,clearDialog,clickNPC,endTalk,findNPC,initDialog,lineEnd,linesOf,npc,say,startTalk,talkable,talking,tickDialog};
