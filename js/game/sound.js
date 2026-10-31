/* 원더룹 — 소리: 효과음·대사 음성·나레이션·배경음 (개미굴 편 playVO·narrate·speak를 옮긴 것)
   - 파일: register({id:'url'})로 세계마다 등록. 파일이 있으면 Web Audio로 틀고, 대사·나레이션 파일이 없으면 읽어 주기(켜졌을 때만, 기본 꺼짐).
   - 합성 소리: synth({id:{dur,play}|{bed}})로 등록하면 파일이 없거나 아직 못 읽었을 때 대신 튼다(synth.js). 파일을 읽은 뒤부터는 파일이 먼저.
   - 배경음: bed(id,{gain,fade})는 구역마다 하나 — 반복하며 fade초 동안 서서히 커지고, bed(null) 또는 구역을 떠나면(clearZoneGame) 서서히 줄어 멈춘다.
     소리가 깨어난 뒤(첫 터치·키)에 시작한다. 시점 기록 kind 'music'(loop, 길이는 멈출 때까지).
   - 길이: 파일이 있으면 파일 길이, 합성 소리는 정해 둔 길이, 없거나 아직 못 읽었으면 글자 수로 어림 → 자막 시간·여운·이벤트 기다리기에 쓴다.
   - 모든 소리는 소리 시점 기록(core.cue)에 남는다(발소리처럼 잦은 소리는 sfx(id,{cue:false})로 뺀다).
   - 촬영·영상 캡처 모드(?shot)는 소리를 틀지 않고 시점 기록만 남긴다(영상에는 소리를 넣지 않고 편집 때 놓는다).
   - 동시에 울리는 효과음은 MAXV개까지 — 넘으면 작은 소리({minor:true})부터 건너뛴다. 창이 가려지면 소리를 멈췄다가 돌아오면 다시.
   - 나레이션 규칙: 대화·카드·결과가 열리면 나레이션을 멈추고, 닫히면 그 줄을 처음부터 다시 들려준다.
     열려 있을 때 시작된 나레이션은 닫힐 때까지 기다렸다가 시작한다. 나레이션끼리는 줄을 서서 하나씩. */
import {blocking,clock,cue,cues} from './core.js';
import {COMMON} from './synth.js';
const SRC={},BUF={},LEN={},SYN={},PEND={};let ctx=null,out=null;
const S={muted:false,tts:false};
const SHOT=/[?&]shot(?=&|=|$)/.test(location.search);
function audio(){if(ctx||S.muted)return ctx;try{ctx=new (window.AudioContext||window.webkitAudioContext)();out=ctx.createGain();out.connect(ctx.destination);}catch(e){ctx=null;}return ctx;}
const awake=()=>!SHOT&&!S.muted&&ctx&&ctx.state==='running';
// 첫 터치·키 입력 때 소리 깨우기 (아이폰은 사용자 입력 안에서만 소리가 켜진다)
['pointerdown','touchend','keydown'].forEach(ev=>window.addEventListener(ev,()=>{const c=audio();if(c&&c.state!=='running')c.resume().catch(()=>{});},true));
try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){} // 아이폰 무음 모드에서도 소리 (지원하는 브라우저만)
// 창이 가려지면 멈춤, 돌아오면 다시 (아이폰은 돌아온 뒤 첫 터치에서 깨어날 수도 있다 — 위 소리 깨우기)
document.addEventListener('visibilitychange',()=>{if(!ctx)return;(document.hidden?ctx.suspend():ctx.resume()).catch(()=>{});});
function register(map){Object.assign(SRC,map);}
function synth(map){Object.assign(SYN,map);}
synth(COMMON);
function load(id){if(BUF[id]||!SRC[id])return Promise.resolve(BUF[id]);if(PEND[id])return PEND[id];const c=audio();if(!c)return Promise.resolve(null);
  return PEND[id]=(async()=>{try{const ab=await (await fetch(SRC[id]+(SRC[id].includes('?')?'':'?v='+(window.WL_V||'')))).arrayBuffer();BUF[id]=await c.decodeAudioData(ab);LEN[id]=BUF[id].duration;}catch(e){console.warn('원더룹: 소리 파일을 못 읽음',id,e);}
    delete PEND[id];return BUF[id];})();}
const preload=ids=>Promise.all(ids.map(load));
const estimate=text=>Math.max(1.2,String(text||'').replace(/\s+/g,'').length*.11+.5); // 한국어 한 글자 약 0.11초
const MAXV=12;let live=[]; // 지금 울리는 효과음이 끝나는 시각
/* 틀기: 파일이 있으면 파일, 없으면 합성 소리. o: {gain, rate(파일 재생 빠르기), minor(동시 소리가 많으면 건너뜀)} → {stop()} 또는 null */
function play(id,o={}){const b=BUF[id],y=SYN[id];if(!awake()||(!b&&!(y&&y.play)))return null;const c=ctx,now=c.currentTime;
  live=live.filter(e=>e>now);if(live.length>=MAXV&&o.minor)return null;
  const g=c.createGain();g.gain.value=o.gain??1;g.connect(out);
  if(b){const s=c.createBufferSource();s.buffer=b;if(o.rate)s.playbackRate.value=o.rate;s.connect(g);s.onended=()=>g.disconnect();s.start();live.push(now+b.duration);return s;}
  y.play(c,g,o);live.push(now+y.dur);const tm=setTimeout(()=>g.disconnect(),(y.dur+.5)*1000);
  return {stop(){clearTimeout(tm);try{g.disconnect();}catch(e){}}};}
function sfx(id,o={}){const src=play(id,o);if(SRC[id]&&!BUF[id])load(id);
  if(o.cue!==false)cue({kind:'sfx',id,file:SRC[id]||null,dur:+(LEN[id]||(SYN[id]&&SYN[id].dur)||0).toFixed(3),...(!BUF[id]&&SYN[id]?{synth:true}:{})});return src;}
function tts(text,who){if(!S.tts||!('speechSynthesis' in window)||!text)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text).replace(/…+/g,', '));u.lang='ko-KR';speechSynthesis.speak(u);}catch(e){}}
/* 목소리 하나 (대사·나레이션 공통): {id,text,who,kind} → {dur, stop()} */
function voice(v){const dur=LEN[v.id]||estimate(v.text);const src=v.id?play(v.id):null;if(!src){if(v.id&&SRC[v.id])load(v.id);tts(v.text,v.who);}
  const c=cue({kind:v.kind||'dialogue',id:v.id||null,file:SRC[v.id]||null,text:v.text||'',who:v.who||'',dur:+dur.toFixed(3)});
  return {dur,end:clock.t+dur,cue:c,stop(){if(src)try{src.stop();}catch(e){}if(S.tts)try{speechSynthesis.cancel();}catch(e){}if(clock.t<c.t+dur-1e-3)c.cut=+(clock.t-c.t).toFixed(4);}};} // 다 끝난 뒤 멈추면 끊김 아님
/* 배경음 (구역마다 하나) */
let want=null,B=null; // want: 틀어야 할 배경음 {id,gain,fade,cue}, B: 지금 울리는 것 {id,g,src|h}
function bedCue(w){return cue({kind:'music',id:w.id,file:SRC[w.id]||null,dur:0,loop:true,...(!BUF[w.id]&&SYN[w.id]?{synth:true}:{})});}
function fadeOut(sec){if(!B)return;const b=B;B=null;const c=ctx,now=c.currentTime;b.g.gain.cancelScheduledValues(now);b.g.gain.setValueAtTime(b.g.gain.value,now);b.g.gain.linearRampToValueAtTime(0,now+sec);
  setTimeout(()=>{try{if(b.src)b.src.stop();if(b.h)b.h.stop();b.g.disconnect();}catch(e){}},sec*1000+100);}
function bed(id,o={}){if((want&&want.id)===(id||undefined))return;
  if(want)want.cue.dur=+(clock.t-want.cue.t).toFixed(3);
  want=id?{id,gain:o.gain??.5,fade:o.fade??2}:null;if(want){want.cue=bedCue(want);if(SRC[id]&&!BUF[id])load(id);}
  if(B)fadeOut(o.fade??1.2);}
function tickBed(dt){
  if(want){if(!cues.includes(want.cue))want.cue=bedCue(want); // 영상 캡처가 녹화 시작 때 기록을 비우면 그 시점부터 다시
    want.cue.dur=+(clock.t-want.cue.t).toFixed(3);}
  if(!awake())return;const c=ctx;
  if(B&&(!want||B.id!==want.id))fadeOut(1.2);
  if(want&&!B){const b=BUF[want.id],y=SYN[want.id];if(!b&&!(y&&y.bed))return;
    const g=c.createGain(),now=c.currentTime;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(want.gain,now+want.fade);g.connect(out);B={id:want.id,g};
    if(b){const s=c.createBufferSource();s.buffer=b;s.loop=true;s.connect(g);s.start();B.src=s;}else B.h=y.bed(c,g);}
  if(B&&B.h&&B.h.tick)B.h.tick(dt);}
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
export {S as soundSettings,bed,estimate,narrate,narrating,preload,register,sfx,stopAll,synth,tickBed,tickNarration,voice};
