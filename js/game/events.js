/* 원더룹 — 이벤트: 줄 세우기와 트리거 (개미굴 편 미션·결과 흐름을 옮긴 것)
   queue({id, priority, run:async (e)=>{...}}) — 여러 이벤트가 동시에 일어나면 우선순위(큰 것 먼저) → 들어온 순서로 줄을 서고,
   하나씩, 화면이 비어 있을 때(대화·카드·결과가 닫혔을 때) 시작한다. 같은 id가 이미 줄에 있으면 또 넣지 않는다.
   run 안에서 쓸 것: e.say(누가,대사,초) e.narrate({text,id}) e.notice({title,text}) e.result({title,text,buttons}) e.secret({title,text,icon,count}) e.wait(초) e.until(조건)
   트리거: area({rect,once,event}) 영역에 들어가면, when({test,once,event}) 조건이 참이 되면 → queue(event)
   위협: threatsPaused() — 대화·카드·결과가 열려 있거나 이벤트가 연출 중(e.hold())이면 참. 위협 쪽 코드는 이것이 참이면 움직이지 않는다. */
import {blocking,until,wait} from './core.js';
import {narrate} from './sound.js';
import {say} from './dialog.js';
import {notice,result,secret} from './ui.js';
const Q=[];let running=null,seq=0,holds=0;const TRIG=[];let ctx=null;
function queue(ev){if(!ev||typeof ev.run!=='function')return false;if((running&&running.id===ev.id&&ev.id)||Q.some(q=>ev.id&&q.id===ev.id))return false;
  Q.push(Object.assign({priority:0},ev,{seq:seq++}));Q.sort((a,b)=>b.priority-a.priority||a.seq-b.seq);return true;}
function api(ev){let held=false;return {id:ev.id,say,narrate,notice,result,secret,wait,until,
  hold(){if(!held){held=true;holds++;}},release(){if(held){held=false;holds--;}},get held(){return held;}};}
function tickEvents(){if(!ctx)return;const P=ctx.WL.position;
  for(let i=TRIG.length-1;i>=0;i--){const t=TRIG[i];let hit=false;
    try{hit=t.rect?(P.x>=t.rect[0]&&P.x<=t.rect[1]&&P.z>=t.rect[2]&&P.z<=t.rect[3]):!!t.test();}catch(e){console.error(e);}
    if(hit&&!t.inside){t.inside=true;queue(t.event);if(t.once)TRIG.splice(i,1);}else if(!hit)t.inside=false;}
  if(!running&&Q.length&&!blocking()){running=Q.shift();const e=api(running),me=running;
    Promise.resolve().then(()=>running.run(e)).catch(err=>console.error('원더룹: 이벤트 오류',me.id,err)).finally(()=>{e.release();if(running===me)running=null;});}}
const area=t=>{TRIG.push(Object.assign({once:true},t));};
const when=t=>{TRIG.push(Object.assign({once:true},t));};
const threatsPaused=()=>blocking()||holds>0;
const eventBusy=()=>!!running||Q.length>0;
function initEvents(c){ctx=c;}
function clearEvents(){Q.length=0;TRIG.length=0;}
export {area,clearEvents,eventBusy,initEvents,queue,threatsPaused,tickEvents,when};
