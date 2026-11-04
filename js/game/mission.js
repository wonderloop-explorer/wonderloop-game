/* 원더룹 — 첫 미션 틀 (시리즈 공통, 2026-11-04 — 개미굴 startPlazaQuest·lampMark·냄새 길·버섯 랜턴 줍기를 그대로 옮김)
   세계 설정 firstMission(js/worlds/<세계>.js 맨 위 형식 주석)으로 채운다: 그 세계에서 꼭 필요한 물건 하나(개미굴 = 어두운 굴을 비출 버섯 랜턴)를 얻는 것.
   흐름: '모험 시작'(game/front) → 할 일 안내(quest) + 목적지에 민트 빛기둥·이름표 + 발밑부터 민트 동그라미 길(goal style 'ant')
         → 미션 카드(ui.notice — 개미굴 #mission, sus 소리, 6초 또는 누르면 닫힘)와 미션 나레이션(카드가 떠 있는 동안 — 닫히면 멈춤)
         → 목적지에 떠서 도는 물건(item.model)에 1.5m 안으로 가면 줍기: pickup 소리, 오른손에 쥠(07 setHeld), 아이템 카드(ui.itemCard) + 획득 나레이션,
           세계 도구 단추(controls.setTool — 개미굴 랜턴 켜고 끄기)·다음 할 일(next).
   시간 제한·실패·점수 없음. 받았는지 = flags['have:<세계 id>:<물건 id>'] (저장) — 받았으면 미션 없이 손에 쥔 채로 시작한다.
   startMission(W)는 game/front가 게임을 시작할 때(조작법 창이 열려 있으면 닫힌 뒤) 부른다. 구역을 떠나면 game/index가 clearMission(). */
import * as THREE from 'three';
import {notice,itemCard,setQuest,cardShown} from './ui.js';
import {set as setGoal} from './goal.js';
import {preload,register,sfx,voice} from './sound.js';
import {setTool} from './controls.js';
import {flags,setFlag} from './state.js';
const coarse=matchMedia('(pointer:coarse)').matches;
let ctx=null,M=null,obj=null,t=0,vo=null,voTok=0;
const haveKey=(W,it)=>'have:'+W.id+':'+it.id;
function initMission(c){ctx=c;}
/* 나레이션 한 줄: 세계 설정의 vo(파일 주소)를 등록해 읽은 뒤 튼다. 앞 줄은 멈춘다. 파일이 없으면 글자 수만큼(읽어 주기가 켜졌으면 읽어 줌) */
function sayVO(id,src,text){stopVO();const tok=++voTok;if(src){register({[id]:src});preload([id]).then(()=>{if(tok===voTok)vo=voice({id,text,kind:'narration'});});}else vo=voice({text,kind:'narration'});return tok;}
function stopVO(){voTok++;if(vo){vo.stop();vo=null;}}
const textOf=v=>v&&typeof v==='object'?(coarse?v.touch:v.key):v;
function giveHeld(W,it){const U=ctx.WL.userData;if(!it.model||!U.setHeld)return;const h=it.model(THREE,{held:true});U.setHeld(h);
  if(it.tool){let on=true;const lab=()=>on?it.tool.on:it.tool.off;const use=()=>{on=!on;sfx('click');if(h.userData.setOn)h.userData.setOn(on);setTool({label:lab(),use});};setTool({label:lab(),use});}}
function startMission(W){const F=W&&W.firstMission;if(!F||!ctx)return false;const it=F.item;clearMission();
  if(flags[haveKey(W,it)]){giveHeld(W,it);if(F.next)setQuest(F.next);return false;} // 이미 받았으면 쥔 채로
  M={W,F,it,got:false,at:F.goal&&F.goal.at||it.at};t=0;
  if(it.model){obj=it.model(THREE,{held:false});obj.position.set(it.at[0],(ctx.ground?ctx.ground(it.at[0],it.at[1]):0)+(it.y??1.1),it.at[1]);obj.userData.y0=obj.position.y;ctx.scene.add(obj);}
  setQuest(F.quest||'');
  setGoal({at:M.at,label:F.goal&&F.goal.label||it.name,style:'ant',h:3.4});
  const P=F.popup||{};
  notice({kicker:P.kicker||'미션',title:P.title||'',text:P.text||'',icon:it.icon?it.icon():null}).then(()=>{if(M&&!M.got)stopVO();});
  if(F.narration)sayVO('mission:'+W.id,F.narration.vo,F.narration.text||((P.title||'')+' '+(P.text||'')));
  return true;}
function tickMission(dt){if(!M||M.got||!ctx)return;t+=dt;const it=M.it;
  if(obj){obj.rotation.y+=dt*1.3;obj.position.y=obj.userData.y0+Math.sin(t*2)*.15;if(obj.userData.tick)obj.userData.tick(t);}
  const P=ctx.WL.position,r=it.pickR||1.5;if(Math.hypot(P.x-it.at[0],P.z-it.at[1])<r)pick();}
function pick(){const {W,F,it}=M;M.got=true;if(obj){obj.removeFromParent();dispose(obj);obj=null;}
  setFlag(haveKey(W,it),true);setGoal(null);sfx('pickup');giveHeld(W,it);
  const G=F.got||{};if(cardShown()==='notice')stopVO();
  itemCard({title:G.title||(it.name+'을 얻었어요!'),text:textOf(G.text)||'',icon:it.icon?it.icon():null,who:'아이템'});
  if(G.vo||G.narration)sayVO('got:'+W.id,G.vo,G.narration||G.title);
  setQuest(F.next||'');}
function dispose(o){o.traverse(c=>{if(c.geometry)c.geometry.dispose();if(c.material)[].concat(c.material).forEach(m=>{if(m.map)m.map.dispose();m.dispose();});});}
function clearMission(){if(obj){obj.removeFromParent();dispose(obj);obj=null;}M=null;stopVO();}
const hero=()=>ctx&&ctx.WL; // 시험 도구용(tools/intro-mission-test.py — 원더룹을 걸려 보냄)
const missionState=()=>M?{item:M.it.id,got:M.got,at:M.at}:null;
export {hero,clearMission,initMission,missionState,startMission,stopVO as stopMissionVO,tickMission};
