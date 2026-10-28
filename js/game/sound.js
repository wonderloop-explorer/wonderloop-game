/* 원더룹 — 소리: 효과음·대사 음성·나레이션 (개미굴 편 playVO·narrate·speak를 옮긴 것)
   - 파일: register({id:'url'})로 세계마다 등록. 파일이 있으면 Web Audio로 틀고, 대사·나레이션 파일이 없으면 읽어 주기(켜졌을 때만, 기본 꺼짐).
   - 길이: 파일이 있으면 파일 길이, 없거나 아직 못 읽었으면 글자 수로 어림 → 자막 시간·여운·이벤트 기다리기에 쓴다.
   - 모든 소리는 소리 시점 기록(core.cue)에 남는다.
   - 나레이션 규칙: 대화·카드·결과가 열리면 나레이션을 멈추고, 닫히면 그 줄을 처음부터 다시 들려준다.
     열려 있을 때 시작된 나레이션은 닫힐 때까지 기다렸다가 시작한다. 나레이션끼리는 줄을 서서 하나씩. */
import {blocking,clock,cue} from './core.js';
const SRC={},BUF={},LEN={};let ctx=null,out=null;
const S={muted:false,tts:false};
function audio(){if(ctx||S.muted)return ctx;try{ctx=new (window.AudioContext||window.webkitAudioContext)();out=ctx.createGain();out.connect(ctx.destination);}catch(e){ctx=null;}return ctx;}
// 첫 터치·키 입력 때 소리 깨우기 (아이폰은 사용자 입력 안에서만 소리가 켜진다)
['pointerdown','touchend','keydown'].forEach(ev=>window.addEventListener(ev,()=>{const c=audio();if(c&&c.state!=='running')c.resume().catch(()=>{});},true));
try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){} // 아이폰 무음 모드에서도 소리 (지원하는 브라우저만)
function register(map){Object.assign(SRC,map);}
async function load(id){if(BUF[id]||!SRC[id])return BUF[id];const c=audio();if(!c)return null;
  try{const ab=await (await fetch(SRC[id]+(SRC[id].includes('?')?'':'?v='+(window.WL_V||'')))).arrayBuffer();BUF[id]=await c.decodeAudioData(ab);LEN[id]=BUF[id].duration;}catch(e){console.warn('원더룹: 소리 파일을 못 읽음',id,e);}
  return BUF[id];}
const preload=ids=>Promise.all(ids.map(load));
const estimate=text=>Math.max(1.2,String(text||'').replace(/\s+/g,'').length*.11+.5); // 한국어 한 글자 약 0.11초
function play(id,gain=1){const c=audio(),b=BUF[id];if(!c||!b||S.muted)return null;const s=c.createBufferSource();s.buffer=b;const g=c.createGain();g.gain.value=gain;s.connect(g);g.connect(out);s.start();return s;}
function sfx(id,o={}){const src=play(id,o.gain);if(!src)load(id);cue({kind:'sfx',id,file:SRC[id]||null,dur:+(LEN[id]||0).toFixed(3)});return src;}
function tts(text,who){if(!S.tts||!('speechSynthesis' in window)||!text)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text).replace(/…+/g,', '));u.lang='ko-KR';speechSynthesis.speak(u);}catch(e){}}
/* 목소리 하나 (대사·나레이션 공통): {id,text,who,kind} → {dur, stop()} */
function voice(v){const dur=LEN[v.id]||estimate(v.text);const src=v.id?play(v.id):null;if(!src){if(v.id&&SRC[v.id])load(v.id);tts(v.text,v.who);}
  const c=cue({kind:v.kind||'dialogue',id:v.id||null,file:SRC[v.id]||null,text:v.text||'',who:v.who||'',dur:+dur.toFixed(3)});
  return {dur,end:clock.t+dur,cue:c,stop(){if(src)try{src.stop();}catch(e){}if(S.tts)try{speechSynthesis.cancel();}catch(e){}c.cut=+(clock.t-c.t).toFixed(4);}};}
/* 나레이션 줄 */
const NQ=[];let cur=null;
function narrate(line){return new Promise(done=>{NQ.push(Object.assign({},line,{done,plays:0}));});}
function tickNarration(){
  if(cur&&cur.h&&blocking()){cur.h.stop();cur.h=null;cur.cut=true;}                // 막히면 멈춤 (끊김)
  if(cur&&!cur.h&&!blocking()){cur.plays++;cur.h=voice({...cur,kind:'narration'});} // 처음 시작 또는 끊긴 줄 다시
  if(cur&&cur.h&&clock.t>=cur.h.end){const d=cur.done;cur=null;d();}
  if(!cur&&NQ.length&&!blocking())cur=NQ.shift();}
const narrating=()=>!!cur||NQ.length>0;
function stopAll(){if(cur&&cur.h)cur.h.stop();if(cur)cur.done();cur=null;NQ.splice(0).forEach(n=>n.done());}
export {S as soundSettings,estimate,narrate,narrating,preload,register,sfx,stopAll,tickNarration,voice};
