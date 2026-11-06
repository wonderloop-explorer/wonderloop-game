/* 원더룹 — 첫 미션 틀 (시리즈 공통, 2026-11-04 — 개미굴 startPlazaQuest·lampMark·냄새 길·버섯 랜턴 줍기를 그대로 옮김)
   세계 설정 firstMission(js/worlds/<세계>.js 맨 위 형식 주석)으로 채운다: 그 세계에서 꼭 필요한 물건 하나(개미굴 = 어두운 굴을 비출 버섯 랜턴)를 얻는 것.
   흐름: '모험 시작'(game/front) → 할 일 안내(quest) + 목적지에 민트 빛기둥·이름표 + 발밑부터 민트 동그라미 길(goal style 'ant')
         → 미션 카드(ui.notice — 개미굴 #mission, sus 소리, 6초 또는 누르면 닫힘)와 미션 나레이션(눌러 닫으면 멈춤, 저절로 닫히면 끝까지)
         → 목적지에 떠서 도는 물건(item.model)에 1.5m 안으로 가면 줍기: 아이템 획득 공통 연출(game/itemget — 머리 위로 날아와 떠 있다가 오른손에 쥠, 원더룹은 카메라를 보며 웃음, 아이템 카드) + 획득 나레이션,
           세계 도구 단추(controls.setTool — 개미굴 랜턴 켜고 끄기)·다음 할 일(next).
   시간 제한·실패·점수 없음. 받았는지 = flags['have:<세계 id>:<물건 id>'] (저장) — 받았으면 미션 없이 손에 쥔 채로 시작한다.
   startMission(W)는 game/front가 게임을 시작할 때(조작법 창이 열려 있으면 닫힌 뒤) 부른다. 구역을 떠나면 game/index가 clearMission(). */
import {storybook} from './storybook.js';
import * as THREE from 'three';
import {notice,itemCard,setQuest,cardShown} from './ui.js';
import {set as setGoal} from './goal.js';
import {preload,register,sfx,voice} from './sound.js';
import {setTool} from './controls.js';
import {flags,setFlag} from './state.js';
import {itemGet} from './itemget.js';
const coarse=matchMedia('(pointer:coarse)').matches;
let ctx=null,M=null,obj=null,t=0,vo=null,voTok=0,light=null,pool=null,lampOn=false,lampK=0;
const SHOT=/[?&]shot(?=&|=|$)/.test(location.search);
const haveKey=(W,it)=>'have:'+W.id+':'+it.id;
/* 손에 든 랜턴 빛(2026-11-04 — 개미굴 heroLight 그대로: 진짜 점광원 세기 1.3·반경 9m·감쇠 1.5, 원더룹 오른쪽 앞 (-0.4, 0.9, 0.4)) + 발밑 따뜻한 빛 웅덩이(반지름 2.4m, 더하기 섞기).
   빛 개수가 바뀌면 셰이더를 모두 다시 만들어 멈추므로 처음부터 세기 0으로 달아 두고 세기만 바꾼다(촬영 모드는 달지 않음 — 기준 화면 그대로). 색은 물건 userData.light(없으면 따뜻한 노랑) */
function initMission(c){ctx=c;if(SHOT||!c.WL)return;
  light=new THREE.PointLight(0xffd27a,0,9,1.5);light.position.set(-.4,.9,.4);c.WL.add(light);
  const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,214,120,.55)');gr.addColorStop(.55,'rgba(255,200,100,.22)');gr.addColorStop(1,'rgba(255,190,90,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
  const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;
  pool=new THREE.Mesh(new THREE.CircleGeometry(2.4,40),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0,fog:false,polygonOffset:true,polygonOffsetFactor:-1}));
  pool.rotation.x=-Math.PI/2;pool.renderOrder=3;pool.visible=false;c.scene.add(pool);}
function tickLamp(dt){if(!light)return;const want=lampOn&&!!(ctx.WL.userData.heldObj)?1:0;lampK+=(want-lampK)*Math.min(1,dt*6);
  light.intensity=1.3*Math.PI*lampK;pool.visible=lampK>.01;if(pool.visible){const P=ctx.WL.position,x=P.x-.25,z=P.z+.15;pool.position.set(x,(ctx.ground?ctx.ground(x,z):0)+.03,z);pool.material.opacity=lampK;}}
/* 나레이션 한 줄: 세계 설정의 vo(파일 주소)를 등록해 읽은 뒤 튼다. 앞 줄은 멈춘다. 파일이 없으면 글자 수만큼(읽어 주기가 켜졌으면 읽어 줌) */
function sayVO(id,src,text){stopVO();const tok=++voTok;if(src){register({[id]:src});preload([id]).then(()=>{if(tok===voTok)vo=voice({id,text,kind:'narration'});});}else vo=voice({text,kind:'narration'});return tok;}
function stopVO(){voTok++;if(vo){vo.stop();vo=null;}}
const textOf=v=>v&&typeof v==='object'?(coarse?v.touch:v.key):v;
function giveHeld(W,it){const U=ctx.WL.userData;if(!it.model||!U.setHeld)return;const h=storybook(it.model(THREE,{held:true}));h.userData.missionItem=true;U.setHeld(h);lampOn=!!it.light;
  if(it.tool){let on=true;const lab=()=>on?it.tool.on:it.tool.off;const use=()=>{on=!on;lampOn=on&&!!it.light;sfx('ui-click');if(h.userData.setOn)h.userData.setOn(on);setTool({label:lab(),use,on});};setTool({label:lab(),use,on});}}
function startMission(W){const F=W&&W.firstMission;if(!F||!ctx)return false;const it=F.item;clearMission();
  if(flags[haveKey(W,it)]){giveHeld(W,it);if(F.next)setQuest(F.next);return false;} // 이미 받았으면 쥔 채로
  M={W,F,it,got:false,at:F.goal&&F.goal.at||it.at};t=0;
  if(it.model){obj=storybook(it.model(THREE,{held:false}));obj.position.set(it.at[0],(ctx.ground?ctx.ground(it.at[0],it.at[1]):0)+(it.y??1.1),it.at[1]);obj.userData.y0=obj.position.y;ctx.scene.add(obj);}
  setQuest(F.quest||'');
  setGoal({at:M.at,label:F.goal&&F.goal.label||it.name,style:'ant',h:3.4});
  const P=F.popup||{};
  notice({kicker:P.kicker||'미션',title:P.title||'',text:P.text||'',icon:it.icon?it.icon():null}).then(w=>{if(w!=='auto'&&M&&!M.got)stopVO();}); // 개미굴처럼: 키·화면을 눌러 닫으면 나레이션도 멈추고, 6초 뒤 저절로 닫히면 끝까지
  if(F.narration)sayVO('mission:'+W.id,F.narration.vo,F.narration.text||((P.title||'')+' '+(P.text||'')));
  return true;}
function tickMission(dt){tickLamp(dt);if(!M||M.got||!ctx)return;t+=dt;const it=M.it;
  if(obj){obj.rotation.y+=dt*1.3;obj.position.y=obj.userData.y0+Math.sin(t*2)*.15;if(obj.userData.tick)obj.userData.tick(t);}
  const P=ctx.WL.position,r=it.pickR||1.5;if(Math.hypot(P.x-it.at[0],P.z-it.at[1])<r)pick();}
function pick(){const {W,F,it}=M;M.got=true;const o=obj;obj=null;
  setFlag(haveKey(W,it),true);setGoal(null);
  const G=F.got||{};if(cardShown()==='notice')stopVO();
  if(G.vo||G.narration)sayVO('got:'+W.id,G.vo,G.narration||G.title);
  setQuest(F.next||'');
  /* 아이템 획득 공통 연출(game/itemget — 개미굴 꿀방울 그대로): 떠 있던 물건이 머리 위로 날아와 잠시 떠 있고, 원더룹은 카메라를 보며 웃고, 아래 획득 카드 → 오른손에 쥠 */
  const card={title:G.title||(it.name+'을 얻었어요!'),text:textOf(G.text)||'',icon:it.icon?it.icon():null,sec:3.2};
  if(o)itemGet({obj:o,to:'hand',held:()=>{giveHeld(W,it);return null;},card,scale:it.getScale||1.1,top:it.getTop||1.72});
  else{giveHeld(W,it);itemCard({...card,who:'아이템'});}}
function dispose(o){o.traverse(c=>{if(c.geometry)c.geometry.dispose();if(c.material)[].concat(c.material).forEach(m=>{if(m.map)m.map.dispose();m.dispose();});});}
function clearMission(){lampOn=false;{const U=ctx&&ctx.WL&&ctx.WL.userData;if(U&&U.heldObj&&U.heldObj.userData.missionItem&&U.setHeld)U.setHeld(null);} // 처음부터 하기: 쥐고 있던 미션 물건도 내려놓음
  if(obj){obj.removeFromParent();dispose(obj);obj=null;}M=null;stopVO();}
const hero=()=>ctx&&ctx.WL; // 시험 도구용(tools/intro-mission-test.py — 원더룹을 걸려 보냄)
const missionState=()=>M?{item:M.it.id,got:M.got,at:M.at}:null;
export {hero,clearMission,initMission,missionState,startMission,stopVO as stopMissionVO,tickMission};
