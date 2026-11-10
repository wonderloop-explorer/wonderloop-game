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
     열려 있을 때 시작된 나레이션은 닫힐 때까지 기다렸다가 시작한다. 나레이션끼리는 줄을 서서 하나씩.
   소리 크기·묶음(개미굴 편 그대로): 전체 0.85 → 효과음 0.9 · 배경음 0.5. 대사·나레이션 목소리는 전체를 거치지 않고 크기 1로 바로 나간다.
     대사·나레이션 목소리가 나오는 동안(파일·읽어 주기 모두, 길이는 voice()의 dur) 배경음을 40%로 줄였다가 끝나면 0.6초에 걸쳐 되돌린다
     (개미굴에는 없던 규칙 — 요정의 숲부터. 개미굴은 목소리 1, 배경음 0.5×0.85로 저절로 위에 들렸다).
   코드로 연주하는 배경음: songs({id:곡}) — game/music.js. 파일 배경음과 같은 자리라 크로스페이드·줄이기·M이 같다. bedHandle()로 지금 곡(예: 축제 bloom()).
   효과음 = 공통 묶음(js/sfx/common.js — 종류 이름 sfx('item-get'), 목록·이름 규칙 docs/sfx-list.md) + 지금 세계 전용 묶음(js/sfx/<세계>.js).
     옛 이름(개미굴 sfx 이름 'itemget'·'click'…)도 그대로 받아 종류 이름으로 바꾼다(ALIAS). 시점 기록 id는 종류 이름.
     useWorld(세계 id, 바꿔 끼우기 {종류:'다른 이름'|'파일 주소'}): 08 zoneLook이 구역마다 — 세계 전용 묶음을 켜고, 그 세계 설정 sfx로 몇 종류만 바꾼다.
   소리 끄고 켜기: M 키 또는 setMuted(참거짓) — 소리는 늘 켜진 채로 시작(개미굴과 같음). 끄면 말하던 목소리도 멈춘다.
   소리 깨우기(개미굴 wakeAudio): 누르기·터치·키·화면 복귀(visibilitychange·pageshow·focus) 때 다시 켜고 빈 소리를 한 번 틀어 아이폰을 깨운다.
     아이폰 무음 스위치를 켜도 들리게 audioSession 'playback'. 화면에 돌아와 0.8초 뒤에도 소리가 멈춰 있으면 onWakeFail(안내 문구)을 부른다.
   구역 배경음: 구역 정보 music:'이름' 또는 {id,gain,fade} → assets/audio/<이름>.mp3(확장자를 적으면 그 파일). 구역을 옮기면 앞 곡이 줄어드는 동안
     새 곡이 커진다(크로스페이드). 파일이 아직 없으면 조용히 빈 자리(콘솔 경고 한 번). */
import {blocking,clock,cue,cues} from './core.js';
import {common as SFX,WORLD_SFX} from '../sfx/index.js';
import {asBeds} from './music.js';
const SRC={},BUF={},LEN={},SYN={},PEND={};let ctx=null,out=null,sfxBus=null,musicBus=null,voiceOut=null,ambBus=null,bedBus=null,travelBus=null;
const S={muted:false,tts:false};
const SHOT=/[?&]shot(?=&|=|$)/.test(location.search);
function audio(){if(ctx)return ctx;try{ctx=new (window.AudioContext||window.webkitAudioContext)();
    out=ctx.createGain();out.gain.value=S.muted?0:.85;out.connect(ctx.destination);           // 전체 (개미굴 master)
    sfxBus=ctx.createGain();sfxBus.gain.value=.9;sfxBus.connect(out);                       // 효과음
    bedBus=ctx.createGain();bedBus.gain.value=1;bedBus.connect(out);                         // 스테이지 배경음 크기(이동 연출 동안 줄임 — bedLevel)
    musicBus=ctx.createGain();musicBus.gain.value=.5;musicBus.connect(bedBus);              // 배경음
    travelBus=ctx.createGain();travelBus.gain.value=.42;travelBus.connect(out);             // 이동 테마(game/travel — 전체를 거쳐 M·메뉴 소리 끄기를 같이 따름, 효과음보다 살짝 작게)
    ambBus=ctx.createGain();ambBus.gain.value=.32;ambBus.connect(out);                     // 공간음(game/weather — 새소리·풀벌레·빗소리·바람, 음악을 덮지 않게 작게, 2026-11-04)
    voiceOut=ctx.createGain();voiceOut.gain.value=1;voiceOut.connect(ctx.destination);}    // 목소리 (개미굴 voOut — 전체를 거치지 않음)
  catch(e){ctx=null;}return ctx;}
const awake=()=>!SHOT&&!S.muted&&ctx&&ctx.state==='running';
// 소리 깨우기 (개미굴 wakeAudio): 아이폰은 사용자 입력 안에서만 소리가 켜지고, 다른 앱에 다녀오면 멈춰 있을 때가 있다
function wake(){if(S.muted&&ctx)return;const c=audio();if(!c||c.state==='running'||c.state==='closed')return;
  try{c.resume().then(()=>{try{const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0);}catch(e){}}).catch(()=>{});}catch(e){}}
try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){} // 아이폰 무음 스위치를 켜도 소리 (사파리 17+)
['pointerdown','touchend','keydown'].forEach(ev=>window.addEventListener(ev,wake,true));
const hooks={onWakeFail:null,onMute:null};
/* 쓰지 않을 때 소리 처리 멈춤(2026-11-10 발열): 화면이 가려지면(다른 앱·탭) 오디오 처리를 멈추고(배경음·공간음 노드가 안 보이는 동안 계속 돌았다) 돌아오면 깨운다.
   소리를 끈 동안(M·메뉴)에도 멈춤 — 크기만 0이면 노드는 계속 계산된다. 다시 켜면 wake */
const rest=()=>{if(ctx&&ctx.state==='running'){try{ctx.suspend();}catch(e){}}};
document.addEventListener('visibilitychange',()=>{if(SHOT)return;if(document.hidden){rest();return;}if(S.muted)return;wake();
  setTimeout(()=>{if(ctx&&!S.muted&&ctx.state!=='running'&&hooks.onWakeFail)hooks.onWakeFail();},800);});
window.addEventListener('pageshow',wake);window.addEventListener('focus',wake);
/* 소리 끄고 켜기 (M 키, 개미굴과 같음) */
const VOICES=new Set();
function setMuted(m){S.muted=!!m;if(m){VOICES.forEach(v=>{try{v.stop();}catch(e){}});VOICES.clear();try{speechSynthesis.cancel();}catch(e){}}
  if(ctx)out.gain.setTargetAtTime(m?0:.85,ctx.currentTime,.05);if(m)setTimeout(()=>{if(S.muted)rest();},400);else wake();if(hooks.onMute)hooks.onMute(S.muted);}
window.addEventListener('keydown',e=>{if(e.code!=='KeyM'||e.repeat||SHOT||(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName)))return;audio();setMuted(!S.muted);});
function register(map){Object.assign(SRC,map);}
function synth(map){Object.assign(SYN,map);}
synth(SFX.SOUNDS);for(const k in SFX.FILES)SRC[k]=SFX.FILES[k];
/* 종류 이름 풀기: 옛 이름 → 종류 → 세계 바꿔 끼우기 */
let WSET=null,WOVR={},WALIAS={};
function useWorld(id,ovr){const W=id&&WORLD_SFX[id]||null;if(W!==WSET){WSET=W;WALIAS=W&&W.ALIAS||{};if(W)synth(W.SOUNDS);}
  WOVR={};if(ovr)for(const k in ovr){const v=ovr[k];if(/\.(mp3|ogg|wav|m4a)(\?|$)/i.test(v)){const fid='file:'+v;SRC[fid]=v;WOVR[k]=fid;}else WOVR[k]=v;}}
function kindOf(id){return SFX.ALIAS[id]||WALIAS[id]||id;}
function resolve(id){const k=kindOf(id),o=WOVR[k];return o?(SFX.ALIAS[o]||WALIAS[o]||o):k;}
function load(id){if(BUF[id]||!SRC[id])return Promise.resolve(BUF[id]);if(PEND[id])return PEND[id];const c=audio();if(!c)return Promise.resolve(null);
  return PEND[id]=(async()=>{try{const ab=await (await fetch(SRC[id]+(SRC[id].includes('?')?'':'?v='+(window.WL_V||'')))).arrayBuffer();BUF[id]=await c.decodeAudioData(ab);LEN[id]=BUF[id].duration;}catch(e){console.warn('원더룹: 소리 파일을 못 읽음',id,e);}
    delete PEND[id];return BUF[id];})();}
const preload=ids=>Promise.all(ids.map(load));
const estimate=text=>Math.max(1.2,String(text||'').replace(/\s+/g,'').length*.11+.5); // 한국어 한 글자 약 0.11초
const MAXV=12;let live=[]; // 지금 울리는 효과음이 끝나는 시각
/* 틀기: 파일이 있으면 파일, 없으면 합성 소리. o: {gain, rate(파일 재생 빠르기), minor(동시 소리가 많으면 건너뜀), bus('voice'면 목소리 묶음)} → {stop()} 또는 null */
function play(id,o={}){const b=BUF[id],y=SYN[id];if(!awake()||(!b&&!(y&&y.play)))return null;const c=ctx,now=c.currentTime;
  live=live.filter(e=>e>now);if(live.length>=MAXV&&o.minor)return null;
  const g=c.createGain();g.gain.value=o.gain??1;g.connect(o.bus==='voice'?voiceOut:sfxBus);
  if(b){const s=c.createBufferSource();s.buffer=b;if(o.rate)s.playbackRate.value=o.rate;s.connect(g);s.onended=()=>g.disconnect();s.start();live.push(now+b.duration);return s;}
  y.play(c,g,o);live.push(now+y.dur);const tm=setTimeout(()=>g.disconnect(),(y.dur+.5)*1000);
  return {stop(){clearTimeout(tm);try{g.disconnect();}catch(e){}}};}
function sfx(name,o={}){const kind=kindOf(name),id=resolve(name);const src=play(id,o);if(SRC[id]&&!BUF[id])load(id);
  if(o.cue!==false)cue({kind:'sfx',id:kind,...(id!==kind?{as:id}:{}),file:SRC[id]||null,dur:+(LEN[id]||(SYN[id]&&SYN[id].dur)||0).toFixed(3),...(!BUF[id]&&SYN[id]?{synth:true}:{})});return src;}
function tts(text,who){if(!S.tts||!('speechSynthesis' in window)||!text)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text).replace(/…+/g,', '));u.lang='ko-KR';speechSynthesis.speak(u);}catch(e){}}
/* 목소리 하나 (대사·나레이션 공통): {id,text,who,kind} → {dur, stop()} */
const SPEAK=new Set(); // 지금 말하는 목소리 (배경음 줄이기)
function voice(v){const dur=LEN[v.id]||estimate(v.text);const sp={end:clock.t+dur};SPEAK.add(sp);const src=v.id?play(v.id,{bus:'voice'}):null;if(src){VOICES.add(src);src.onended=(f=>()=>{VOICES.delete(src);if(f)f();})(src.onended);}if(!src){if(v.id&&SRC[v.id])load(v.id);tts(v.text,v.who);}
  const c=cue({kind:v.kind||'dialogue',id:v.id||null,file:SRC[v.id]||null,text:v.text||'',who:v.who||'',dur:+dur.toFixed(3)});
  return {dur,end:clock.t+dur,cue:c,stop(){SPEAK.delete(sp);if(src)try{src.stop();}catch(e){}if(S.tts)try{speechSynthesis.cancel();}catch(e){}if(clock.t<c.t+dur-1e-3)c.cut=+(clock.t-c.t).toFixed(4);}};} // 다 끝난 뒤 멈추면 끊김 아님
/* 배경음 (구역마다 하나) */
let want=null,B=null,nullT=0; // want: 틀어야 할 배경음 {id,gain,fade,cue}, B: 지금 울리는 것 {id,g,src|h}
function bedCue(w){return cue({kind:'music',id:w.id,file:SRC[w.id]||null,dur:0,loop:true,...(!BUF[w.id]&&SYN[w.id]?{synth:true}:{})});}
function fadeOut(sec){if(!B)return;const b=B;B=null;const c=ctx,now=c.currentTime;b.g.gain.cancelScheduledValues(now);b.g.gain.setValueAtTime(b.g.gain.value,now);b.g.gain.linearRampToValueAtTime(0,now+sec);
  setTimeout(()=>{try{if(b.src)b.src.stop();if(b.h)b.h.stop();b.g.disconnect();}catch(e){}},sec*1000+100);}
function bed(id,o={}){if((want&&want.id)===(id||undefined))return;
  if(want)want.cue.dur=+(clock.t-want.cue.t).toFixed(3);
  want=id?{id,gain:o.gain??1,fade:o.fade??1.5}:null;if(want){want.cue=bedCue(want);if(SRC[id]&&!BUF[id])load(id);}
  nullT=0;} // 바로 끄지 않는다 — 같은 곡을 곧 다시 틀면(처음부터 다시 하기로 구역을 다시 만들 때) 끊김 없이 이어지게(2026-11-03). 끄는 건 tickBed가
function tickBed(dt){
  if(want){if(!cues.includes(want.cue))want.cue=bedCue(want); // 영상 캡처가 녹화 시작 때 기록을 비우면 그 시점부터 다시
    want.cue.dur=+(clock.t-want.cue.t).toFixed(3);}
  if(!awake())return;const c=ctx;
  {let talk=false;SPEAK.forEach(sp=>{if(clock.t<sp.end)talk=true;else SPEAK.delete(sp);}); // 목소리가 나오는 동안 배경음 40%
   const g=(talk?.4:1)*.5;if(Math.abs(musicBus.gain.value-g)>.002&&musicBus.duckTo!==g){musicBus.duckTo=g;musicBus.gain.setTargetAtTime(g,c.currentTime,talk?.12:.25);}}
  if(!want)nullT+=dt;
  if(B&&((!want&&nullT>.8)||(want&&B.id!==want.id)))fadeOut(1.2); // 곡이 없어진 뒤 0.8초 기다렸다가(구역을 다시 만드는 사이)
  if(want&&!B){const b=BUF[want.id],y=SYN[want.id];if(!b&&!(y&&y.bed))return;
    const g=c.createGain(),now=c.currentTime;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(want.gain,now+want.fade);g.connect(musicBus);B={id:want.id,g};
    if(b){const s=c.createBufferSource();s.buffer=b;s.loop=true;s.connect(g);s.start();B.src=s;}else B.h=y.bed(c,g);}
  if(B&&B.h&&B.h.tick)B.h.tick(dt);}
function songs(map){synth(asBeds(map));}
const bedHandle=()=>B&&B.h||null;
/* 구역 배경음: 구역 정보 music → bed. 파일 이름만 적으면 assets/audio/<이름>.mp3 */
function zoneMusic(m){if(!m){bed(null);return;}const o=typeof m==='string'?{id:m}:m;const id=o.id.replace(/\.[a-z0-9]+$/i,'');
  if(!SRC[id]&&!(SYN[id]&&SYN[id].bed))SRC[id]=o.file||('assets/audio/'+(/\.[a-z0-9]+$/i.test(o.id)?o.id:o.id+'.mp3'));bed(id,o);}
/* 이동 연출(game/travel, 2026-11-09): 스테이지 배경음 크기 줄이기·되돌리기(sec초에 걸쳐), 이동 테마가 울릴 자리.
   이동 테마 파일은 조용히 읽는다(파일이 아직 없으면 404를 경고로 남기지 않고 null — 코드로 만든 임시 테마로) */
function bedLevel(level,sec=1){const c=audio();if(!c||!bedBus)return;const now=c.currentTime;bedBus.gain.cancelScheduledValues(now);bedBus.gain.setValueAtTime(bedBus.gain.value,now);bedBus.gain.linearRampToValueAtTime(level,now+Math.max(.02,sec));}
const travelOut=()=>!SHOT&&ctx&&ctx.state==='running'?{ctx,bus:travelBus}:null; // 소리를 꺼 둔 채 출발해도 테마는 돌림(전체 out이 0) — 도중에 켜면 그대로 들림
/* 시험 도구용(소리 포함 녹화): 전체 소리와 목소리를 MediaStream으로도 내보냄(실제 출력은 그대로) */
function tap(){const c=audio();if(!c)return null;const d=c.createMediaStreamDestination();out.connect(d);voiceOut.connect(d);return d.stream;}
const audioNow=()=>ctx?ctx.currentTime:null;
const QF={};
function quietBuf(url){if(QF[url])return QF[url];const c=audio();if(!c||SHOT)return Promise.resolve(null);
  return QF[url]=(async()=>{try{const r=await fetch(url+(url.includes('?')?'':'?v='+(window.WL_V||'')));if(!r.ok)return null;return await c.decodeAudioData(await r.arrayBuffer());}catch(e){return null;}})();}
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
/* 공간음 자리(game/weather): 소리가 깨어 있을 때만 {ctx, bus} — 소리 끄기(M)는 전체(out)를 거치므로 그대로 따른다. 촬영 모드는 null */
const ambience=()=>{if(SHOT)return null;const c=audio();return c&&ambBus?{ctx:c,bus:ambBus,running:c.state==='running'}:null;};
export {tap,audioNow,bedLevel,travelOut,quietBuf,kindOf,useWorld,ambience,songs,bedHandle,S as soundSettings,hooks as soundHooks,setMuted,wake,zoneMusic,bed,estimate,narrate,narrating,preload,register,sfx,stopAll,synth,tickBed,tickNarration,voice};
