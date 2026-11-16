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
/* 섞기 값 한곳(2026-11-13, 모든 세계 공통 — docs/series-rules.md '배경음 크기'): 값을 바꿀 때는 여기만.
   bus 배경음 묶음 크기 · travelBus 이동 테마 묶음 크기 · target 배경음·이동 테마가 묶음을 나온 뒤의 체감 크기(LUFS — 곡마다 잰 값 lufs를 적으면 lufsGain이 이 크기로 맞춤)
   duck 대사·대화창이 떠 있는 동안 배경음 배율 · duckIn 줄어드는 빠르기(시상수 초) · hold 대화가 끝나고 이만큼(초) 조용해야 되돌리기 시작(짧게 이어지는 대화 사이에는 줄어든 채로)
   back 되돌아오는 시간(초) — 처음엔 느리게 끝에서 살며시 멈추는 곡선(smoothstep) */
const MIX={bus:.5,travelBus:.42,target:-21.5,duck:.4,duckIn:.12,hold:1.5,back:1.8,voice:1,voiceTail:.35};
/* voice 목소리 묶음 크기(메뉴 '목소리 크기' 배율을 곱함) · voiceTail 목소리가 끝난 뒤 대화창이 머무는 시간(초).
   목소리가 나오는 동안에도 같은 duck·hold·back을 쓴다(목소리 파일 유무와 상관없이 대화창이 떠 있으면 줄어든 채 — 줄마다 줄었다 커졌다 하지 않음) */
const lufsGain=(lufs,bus=MIX.bus)=>lufs==null?1:Math.pow(10,(MIX.target-lufs)/20)/bus;
const SRC={},BUF={},LEN={},SYN={},PEND={};const VHEAD=.5;let voicePost=null;let ctx=null,out=null,sfxBus=null,musicBus=null,voiceOut=null,ambBus=null,bedBus=null,travelBus=null,toneLP=null,toneGain=null;
const S={muted:false,tts:false};
/* 목소리 설정(2026-11-15 — 메뉴 '목소리 켜짐/꺼짐'·'목소리 크기', 배경음·효과음과 따로 이 기기에 기억 'wl-voice'): 끄면 파일을 틀지 않고 자막만(길이는 글자 수 어림) */
const VS=(()=>{try{const o=JSON.parse(localStorage.getItem('wl-voice')||'{}');return {on:o.on!==false,vol:typeof o.vol==='number'?Math.min(1.5,Math.max(.2,o.vol)):1};}catch(e){return {on:true,vol:1};}})();
function voiceSet(o){if(o.on!=null)VS.on=!!o.on;if(o.vol!=null)VS.vol=Math.min(1.5,Math.max(.2,+o.vol||1));try{localStorage.setItem('wl-voice',JSON.stringify(VS));}catch(e){}
  if(ctx&&voiceOut)voiceOut.gain.setTargetAtTime(VS.on?VS.vol*MIX.voice*VHEAD:0,ctx.currentTime,.05);if(!VS.on&&CURV)CURV.stop();return VS;}
const SHOT=/[?&]shot(?=&|=|$)/.test(location.search);
function audio(){if(ctx)return ctx;try{ctx=new (window.AudioContext||window.webkitAudioContext)();
    out=ctx.createGain();out.gain.value=S.muted?0:.85;out.connect(ctx.destination);           // 전체 (개미굴 master)
    sfxBus=ctx.createGain();sfxBus.gain.value=.9;sfxBus.connect(out);                       // 효과음
    bedBus=ctx.createGain();bedBus.gain.value=1;bedBus.connect(out);                         // 스테이지 배경음 크기(이동 연출 동안 줄임 — bedLevel)
    toneLP=ctx.createBiquadFilter();toneLP.type='lowpass';toneLP.frequency.value=20000;toneLP.Q.value=.5;toneGain=ctx.createGain();toneGain.gain.value=1;toneLP.connect(toneGain);toneGain.connect(bedBus); // 배경음 음색(bedTone — 노을이면 조금 작게·높은 소리 덜)
    musicBus=ctx.createGain();musicBus.gain.value=MIX.bus;musicBus.connect(toneLP);              // 배경음
    travelBus=ctx.createGain();travelBus.gain.value=MIX.travelBus;travelBus.connect(out);             // 이동 테마(game/travel — 전체를 거쳐 M·메뉴 소리 끄기를 같이 따름, 효과음보다 살짝 작게)
    ambBus=ctx.createGain();ambBus.gain.value=.32;ambBus.connect(out);                     // 공간음(game/weather — 새소리·풀벌레·빗소리·바람, 음악을 덮지 않게 작게, 2026-11-04)
    /* 목소리 끝의 부드러운 리미터(2026-11-16 — 메뉴 '목소리 크기' 125·150%에서 최고점이 0dB를 넘어 찢어졌다): 목소리 묶음 → 파형 다듬기(WaveShaper) → 스피커.
       최고점 0.89(−1dB) 아래는 입력 그대로(곧은 선 — 100% 이하에서는 파일 최고점이 −1.5dB라 소리가 예전과 똑같다), 그 위는 0.985로 부드럽게 눌러 0dB를 넘지 않는다.
       다듬기 곡선의 입력 범위가 −1~1이라 묶음 크기를 절반(VHEAD)으로 넣고 곡선에서 두 배로 되돌린다(150% × 최고점 0.84 = 1.26까지 곡선 안) */
    voiceOut=ctx.createGain();voiceOut.gain.value=VS.on?VS.vol*MIX.voice*VHEAD:0;voicePost=ctx.createWaveShaper();{const N=8193,cv=new Float32Array(N),K=.89,L=.985;for(let i=0;i<N;i++){const x=(i/(N-1)*2-1)/VHEAD,a=Math.abs(x);cv[i]=a<=K?x:Math.sign(x)*(K+(L-K)*Math.tanh((a-K)/(L-K)));}voicePost.curve=cv;voicePost.oversample='none';}
    voiceOut.connect(voicePost);voicePost.connect(ctx.destination);}    // 목소리 (개미굴 voOut — 전체를 거치지 않음)
  catch(e){ctx=null;}return ctx;}
const awake=()=>!SHOT&&!S.muted&&ctx&&ctx.state==='running';
// 소리 깨우기 (개미굴 wakeAudio): 아이폰은 사용자 입력 안에서만 소리가 켜지고, 다른 앱에 다녀오면 멈춰 있을 때가 있다
function wake(){if(S.muted&&ctx)return;const c=audio();if(!c||c.state==='running'||c.state==='closed')return;
  try{c.resume().then(()=>{try{const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0);}catch(e){}}).catch(()=>{});}catch(e){}}
try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){} // 아이폰 무음 스위치를 켜도 소리 (사파리 17+)
['pointerdown','touchend','keydown'].forEach(ev=>window.addEventListener(ev,wake,true));
const hooks={onWakeFail:null,onMute:null,talkBusy:null}; // talkBusy: 대화창이 떠 있는지(game/dialog가 넣음 — 목소리가 끝나도 대화 중이면 배경음을 줄인 채로)
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
/* ── 목소리 책(2026-11-15 — docs/voice/README.md): 대본 목록(docs/voice/script.csv)에서 만든 색인 assets/voice/<세계>/index.json을 읽어,
   대사·나레이션 글(말하는 사람 + 대사)로 그 줄의 번호·파일을 찾는다. 파일이 있으면(has) 그 파일을 틀고, 없으면 지금처럼 자막만(오류·404 없음 — 색인에 없는 파일은 아예 받지 않음).
   voiceBook(폴더) 08 zoneLook이 세계마다 · voiceStage(스테이지) 그 스테이지(와 이동 TR) 파일을 미리 읽어 둠(길이를 알아야 대화창이 목소리 길이에 맞음).
   주소에 ?voiceTemp면 assets/voice-temp/(임시 목소리 — tools/voice-index.py --temp, 시험용). 촬영 모드는 쓰지 않음 */
const VB={dir:null,map:new Map(),lines:[],ready:null,log:[],max:0};
const VTEMP=/[?&]voiceTemp(?=&|=|$)/.test(location.search);
const vnorm=t=>String(t||'').replace(/\s+/g,' ').trim(),vbase=w=>String(w||'').replace(/\s*\(.*\)$/,'').trim();
function voiceBook(dir){if(SHOT)return null;dir=dir||null;if(VB.dir===dir)return VB.ready;VB.dir=dir;VB.map.clear();VB.lines=[];if(!dir)return VB.ready=null;
  const root=(VTEMP?'assets/voice-temp/':'assets/voice/')+dir+'/';
  return VB.ready=fetch((window.wlVer?window.wlVer(root+'index.json'):root+'index.json')+(VTEMP?(root.includes('?')?'&':'?')+'t='+Date.now():'')).then(r=>r.ok?r.json():null).then(j=>{if(!j||VB.dir!==dir)return;
    for(const L of j.lines){L.url=root+L.file;VB.lines.push(L);if(L.fx)continue;const t=vnorm(L.text);VB.map.set(vbase(L.who)+'|'+t,L);if(!VB.map.has('*|'+t))VB.map.set('*|'+t,L);}}).catch(()=>{});}
const vbFind=(who,text)=>{const t=vnorm(text);return VB.map.get(vbase(who||'나레이터')+'|'+t)||VB.map.get('*|'+t)||null;}; /* 이름이 바뀐 주인공·'삐삐 (카세트)' 같은 이름표도 대사 글로 찾음 */
function voiceStage(st){if(!VB.ready)return;VB.ready.then(()=>{for(const L of VB.lines)if(L.has&&!L.mute&&(L.st===st||L.st==='TR')){const id='vo:'+L.id;SRC[id]=L.url;load(id);}});}
const vlog=(ev,id,text,dur)=>{VB.log.push({t:ctx?+ctx.currentTime.toFixed(3):0,g:+clock.t.toFixed(3),ev,id:id||null,text:String(text||'').slice(0,24),dur:dur?+dur.toFixed(3):0,n:VOICES.size});if(VB.log.length>600)VB.log.shift();};
/* 카드 나레이션이 나오는 중(2026-11-15 — 발견 카드·지도 카드·도착 안내의 나레이션, voice({hold:true})): 끝나고 MIX.voiceTail초 뒤까지 참 → game/dialog가 다음 장면 대사를 그때까지 기다린다 */
const voiceHold=()=>!!(CURV&&CURV.hold&&(CURV.live()||(CURV.doneT!=null&&clock.t<CURV.doneT+MIX.voiceTail)));
/* 큰 목소리(대사·나레이션)가 나오는 중이거나 끝난 지 MIX.voiceTail초 안 — 뒤에 올 자막(망원경 등)이 앞 대사를 끊지 않고 기다릴 때(2026-11-15) */
const voiceBusy=()=>!!(CURV&&(CURV.live()||(CURV.doneT!=null&&clock.t<CURV.doneT+MIX.voiceTail)));
/* 시험용: 리미터 뒤 목소리 파형의 최고값(0~1) — 부를 때마다 그사이 최고값을 돌려주고 0으로. 매 프레임 불러야 빠짐없이 잰다 */
let VPK=null;function voicePeak(){const c=audio();if(!c||!voicePost)return 0;if(!VPK){const a=c.createAnalyser();a.fftSize=2048;voicePost.connect(a);VPK={a,buf:new Float32Array(2048)};}VPK.a.getFloatTimeDomainData(VPK.buf);let m=0;for(let i=0;i<2048;i++){const v=Math.abs(VPK.buf[i]);if(v>m)m=v;}return m;}
const voiceNow=()=>({n:VOICES.size,id:CURV&&CURV.live()?CURV.id:null}); // 시험용: 지금 나오는 목소리 수·번호
const voiceLog=()=>({mute:VB.lines.filter(l=>l.mute&&!l.fx).map(l=>l.text),log:VB.log.slice(),max:VB.max,dir:VB.dir,temp:VTEMP,lines:VB.lines.length,has:VB.lines.filter(l=>l.has).length,set:{...VS}}); // 시험용
/* 목소리 하나 (대사·나레이션 공통): {id,text,who,kind, minor(말풍선·안내 문구 — 다른 목소리가 나오는 중이면 건너뜀), quiet(파일이 있을 때만 — 없으면 아무 일도 안 함: 시점 기록·배경음 줄이기 없음)}
   → {dur, end, live(), stop()}. 한 번에 하나: 새 대사·나레이션이 시작되면 앞 목소리는 멈춘다(CURV). 파일을 아직 못 읽었으면 읽는 대로(1.2초 안) 틀고 길이를 고친다 */
const SPEAK=new Set(); // 지금 말하는 목소리 (배경음 줄이기)
let CURV=null,CURM=null;const MQ=[];
function tickVoiceQ(){if(!MQ.length||(CURV&&CURV.live())||(CURM&&CURM.live()))return;const q=MQ.shift();if(clock.t-q.t>6){vlog('skip',null,q.v.text);return;}voice(q.v);} // 지금 나오는 큰 목소리(대사·나레이션) · 작은 목소리(말풍선·안내 문구)
function voice(v){let id=v.id,e=null;if(!id&&!SHOT&&VB.dir){e=vbFind(v.who,v.text);if(e&&e.has&&!e.mute){id='vo:'+e.id;SRC[id]=e.url;}}
  const busy=!!(CURV&&CURV.live())||!!(v.minor&&CURM&&CURM.live()),can=!!id&&(VS.on||!e&&!String(id).startsWith('vo:'))&&!(v.minor&&busy);
  /* 작은 목소리 줄 세우기(2026-11-15 — 말풍선 대사가 연달아 뜰 때: 아기 토끼 떡방아 구경): 다른 작은 목소리가 나오는 중이면 건너뛰지 않고 줄을 섰다가 끝나면 차례로(6초 넘게 기다린 줄은 버림). 큰 목소리(대사·나레이션) 중이면 예전처럼 건너뜀 */
  if(v.minor&&!v._q&&id&&VS.on&&!(CURV&&CURV.live())&&CURM&&CURM.live()){if(MQ.length<3){MQ.push({v:{...v,_q:1},t:clock.t});vlog('queue',e&&e.id,v.text);}else vlog('skip',e&&e.id,v.text);return null;}
  if(v.quiet&&!can){if(!SHOT&&VB.dir)vlog(!id?(e?'nofile':'unlisted'):!VS.on?'off':'skip',e&&e.id,v.text);return null;}
  const t0=clock.t,dur=(can&&LEN[id])||estimate(v.text),sp={end:t0+dur};SPEAK.add(sp);
  if(can&&!v.minor){if(CURV&&CURV.live()){vlog('replaced',CURV.id,v.text);CURV.stop();} /* 시험용 기록: 새 목소리가 앞 목소리를 끊음 */if(CURM&&CURM.live())CURM.stop();} /* 큰 목소리가 시작되면 앞 목소리(큰 것·작은 것)는 멈춤 */
  let src=null,ended=!can,stopped=false,pend=false;
  const c=cue({kind:v.kind||'dialogue',id:(e&&e.id)||v.id||null,file:SRC[id]||null,text:v.text||'',who:v.who||'',dur:+dur.toFixed(3)});
  const H={id,dur,end:t0+dur,cue:c,hold:!!v.hold,doneT:null,live:()=>!stopped&&(pend||(!!src&&!ended)),
    stop(why){if(H.live()){if(H.hold)vlog(why==='user'?'userclose':'cut',e&&e.id,v.text);else if(src&&!v.minor)vlog('stop',e&&e.id,v.text,clock.t-t0);} /* 시험용 기록: 끝나기 전에 멈춘 목소리(dur = 그때까지 나온 초) */stopped=true;if(H.doneT==null)H.doneT=clock.t;SPEAK.delete(sp);if(src){try{src.stop();}catch(x){}VOICES.delete(src);}if(S.tts)try{speechSynthesis.cancel();}catch(x){}if(CURV===H)CURV=null;if(CURM===H)CURM=null;if(clock.t<c.t+H.dur-1e-3)c.cut=+(clock.t-c.t).toFixed(4);}}; // 다 끝난 뒤 멈추면 끊김 아님
  const start=()=>{src=play(id,{bus:'voice'});if(!src){ended=true;vlog('asleep',e&&e.id,v.text);return;}VOICES.add(src);VB.max=Math.max(VB.max,VOICES.size);vlog('play',(e&&e.id)||id,v.text,LEN[id]);
    src.onended=(f=>()=>{VOICES.delete(src);ended=true;if(H.doneT==null)H.doneT=clock.t;sp.end=Math.min(sp.end,clock.t);if(f)f();})(src.onended);};
  if(can){if(BUF[id])start();else{pend=true;load(id).then(b=>{pend=false;if(stopped||!b||clock.t>t0+1.2){ended=true;vlog('late',e&&e.id,v.text);return;}H.dur=b.duration;H.end=clock.t+b.duration;sp.end=H.end;c.dur=+b.duration.toFixed(3);start();});}
    if(v.minor)CURM=H;else CURV=H;}
  else{if(!SHOT&&VB.dir)vlog(!id?(e?'nofile':'unlisted'):!VS.on?'off':'skip',e&&e.id,v.text);if(v.id&&SRC[v.id])load(v.id);if(!id)tts(v.text,v.who);}
  return H;}
/* 배경음 (구역마다 하나) */
let want=null,B=null,nullT=0; // want: 틀어야 할 배경음 {id,gain,fade,cue}, B: 지금 울리는 것 {id,g,src|h}
function bedCue(w){return cue({kind:'music',id:w.id,file:SRC[w.id]||null,dur:0,loop:true,...(!BUF[w.id]&&SYN[w.id]?{synth:true}:{})});}
function fadeOut(sec){if(!B)return;const b=B;B=null;const c=ctx,now=c.currentTime;b.g.gain.cancelScheduledValues(now);b.g.gain.setValueAtTime(b.g.gain.value,now);b.g.gain.linearRampToValueAtTime(0,now+sec);
  setTimeout(()=>{try{if(b.src)b.src.stop();if(b.h)b.h.stop();b.g.disconnect();}catch(e){}},sec*1000+100);}
function bed(id,o={}){if((want&&want.id)===(id||undefined))return;
  if(want)want.cue.dur=+(clock.t-want.cue.t).toFixed(3);
  want=id?{id,gain:o.gain??1,fade:o.fade??1.5,loop:o.loop||null,intro:!!o.intro}:null;if(want){want.cue=bedCue(want);if(SRC[id]&&!BUF[id])load(id);}
  nullT=0;} // 바로 끄지 않는다 — 같은 곡을 곧 다시 틀면(처음부터 다시 하기로 구역을 다시 만들 때) 끊김 없이 이어지게(2026-11-03). 끄는 건 tickBed가
const DK={st:'up',t0:0,from:1,last:0}; // 배경음 줄이기 상태: up 원래 크기 · down 줄어듦(줄어드는 중) · rise 되돌아오는 중
function duckNow(now){if(DK.st==='down')return MIX.duck+(DK.from-MIX.duck)*Math.exp(-(now-DK.t0)/MIX.duckIn);if(DK.st==='rise'){const u=Math.min(1,(now-DK.t0)/MIX.back);return DK.from+(1-DK.from)*u*u*(3-2*u);}return 1;}
const duckState=()=>ctx?{st:DK.st,k:+duckNow(ctx.currentTime).toFixed(4),bus:+musicBus.gain.value.toFixed(4),bed:+bedBus.gain.value.toFixed(3),t:+ctx.currentTime.toFixed(3)}:null; // 시험용: 지금 줄이기 배율·실제 묶음 값
function tickBed(dt){
  if(want){if(!cues.includes(want.cue))want.cue=bedCue(want); // 영상 캡처가 녹화 시작 때 기록을 비우면 그 시점부터 다시
    want.cue.dur=+(clock.t-want.cue.t).toFixed(3);}
  if(!awake())return;const c=ctx;tickVoiceQ();
  {let talk=false;SPEAK.forEach(sp=>{if(clock.t<sp.end)talk=true;else SPEAK.delete(sp);});if(!talk&&hooks.talkBusy&&hooks.talkBusy())talk=true;
   /* 대화하는 동안 배경음 줄이기(값은 맨 위 MIX): 목소리가 나오거나 대화창이 떠 있으면 duck배로, 끝나고 hold초 조용하면 back초에 걸쳐 부드럽게(처음 느리게·끝에서 살며시) 원래 크기 MIX.bus로 정확히.
      예전(2026-11-13까지)에는 목소리가 끝나자마자 시상수 0.25초로 올라와 대사 한 줄마다 줄었다 커졌다 했고 갑자기 커져 크게 들렸다 */
   const now=c.currentTime,P=musicBus.gain,v=duckNow(now);
   if(talk){DK.last=now;if(DK.st!=='down'){P.cancelScheduledValues(now);P.setValueAtTime(v*MIX.bus,now);P.setTargetAtTime(MIX.duck*MIX.bus,now,MIX.duckIn);DK.st='down';DK.t0=now;DK.from=v;}}
   else if(DK.st==='down'&&now-DK.last>=MIX.hold){const N=64,cv=new Float32Array(N);for(let i=0;i<N;i++){const u=i/(N-1);cv[i]=(v+(1-v)*u*u*(3-2*u))*MIX.bus;}
     P.cancelScheduledValues(now);try{P.setValueCurveAtTime(cv,now,MIX.back);}catch(e){P.setValueAtTime(v*MIX.bus,now);P.linearRampToValueAtTime(MIX.bus,now+MIX.back);}DK.st='rise';DK.t0=now;DK.from=v;}
   else if(DK.st==='rise'&&now-DK.t0>MIX.back+.05){P.cancelScheduledValues(now);P.setValueAtTime(MIX.bus,now);DK.st='up';}}
  if(!want)nullT+=dt;
  if(B&&((!want&&nullT>.8)||(want&&B.id!==want.id)))fadeOut(1.2); // 곡이 없어진 뒤 0.8초 기다렸다가(구역을 다시 만드는 사이)
  if(want&&!B){const b=BUF[want.id],y=SYN[want.id];if(!b&&!(y&&y.bed))return;
    const g=c.createGain(),now=c.currentTime;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(want.gain,now+want.fade);g.connect(musicBus);B={id:want.id,g};
    if(b){const s=c.createBufferSource();s.buffer=b;s.loop=true;
      /* 구간 루프(2026-11-12 — 화성 배경음): loop [a,b]초만 되풀이, intro면 처음(0초)부터 한 번 틀고 그 구간으로. 이음매가 튀지 않게 b 바로 앞 60ms를 a 바로 앞 소리와 섞어 둔다(버퍼에 한 번) */
      if(want.loop){const [la,lb,xf=.06]=want.loop;if(!b._xf){b._xf=1;const F=Math.floor(xf*b.sampleRate),ia=Math.floor(la*b.sampleRate),ib=Math.floor(lb*b.sampleRate);if(ia>F&&ib<=b.length)for(let ch=0;ch<b.numberOfChannels;ch++){const d=b.getChannelData(ch);for(let i=0;i<F;i++){const t=i/F;d[ib-F+i]=d[ib-F+i]*(1-t)+d[ia-F+i]*t;}}}
        s.loopStart=la;s.loopEnd=lb;s.connect(g);s.start(0,want.intro?0:la);}
      else{s.connect(g);s.start();}B.src=s;}else B.h=y.bed(c,g);}
  if(B&&B.h&&B.h.tick)B.h.tick(dt);}
function songs(map){synth(asBeds(map));}
const bedHandle=()=>B&&B.h||null;
/* 구역 배경음: 구역 정보 music → bed. 파일 이름만 적으면 assets/audio/<이름>.mp3 */
function zoneMusic(m){if(!m){bed(null);return;}let o=typeof m==='string'?{id:m}:m;if(o.lufs!=null&&o.gain==null)o={...o,gain:lufsGain(o.lufs)}; /* lufs: 그 곡(되풀이 구간)을 잰 체감 크기 → MIX.target에 맞춤 */const id=o.id.replace(/\.[a-z0-9]+$/i,'');
  if(!SRC[id]&&!(SYN[id]&&SYN[id].bed))SRC[id]=o.file||('assets/audio/'+(/\.[a-z0-9]+$/i.test(o.id)?o.id:o.id+'.mp3'));bed(id,o);}
/* 이동 연출(game/travel, 2026-11-09): 스테이지 배경음 크기 줄이기·되돌리기(sec초에 걸쳐), 이동 테마가 울릴 자리.
   이동 테마 파일은 조용히 읽는다(파일이 아직 없으면 404를 경고로 남기지 않고 null — 코드로 만든 임시 테마로) */
/* 배경음 음색: lp 저역 통과 주파수(Hz, 기본 20000 = 그대로)·gain 크기 배율 — sec초에 걸쳐. 화성 노을: 조금 작게, 높은 소리 살짝 덜 */
function bedTone({lp=20000,gain=1}={},sec=2){const c=audio();if(!c||!toneLP)return;const now=c.currentTime;toneLP.frequency.cancelScheduledValues(now);toneLP.frequency.setTargetAtTime(lp,now,Math.max(.05,sec/3));toneGain.gain.cancelScheduledValues(now);toneGain.gain.setTargetAtTime(gain,now,Math.max(.05,sec/3));}
function bedLevel(level,sec=1){const c=audio();if(!c||!bedBus)return;const now=c.currentTime;bedBus.gain.cancelScheduledValues(now);bedBus.gain.setValueAtTime(bedBus.gain.value,now);bedBus.gain.linearRampToValueAtTime(level,now+Math.max(.02,sec));}
const travelOut=()=>!SHOT&&ctx&&ctx.state==='running'?{ctx,bus:travelBus}:null; // 소리를 꺼 둔 채 출발해도 테마는 돌림(전체 out이 0) — 도중에 켜면 그대로 들림
/* 시험 도구용(소리 포함 녹화): 전체 소리와 목소리를 MediaStream으로도 내보냄(실제 출력은 그대로) */
function tap(which){const c=audio();if(!c)return null;const d=c.createMediaStreamDestination();if(which==='bed')bedBus.connect(d);else if(which==='travel')travelBus.connect(d);else if(which==='voice')voicePost.connect(d);else if(which==='sfx')sfxBus.connect(d);else{out.connect(d);voicePost.connect(d);}return d.stream;} // which 'bed' = 배경음만(크기 재기 — 전체 크기·소리 끄기 앞)
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
  if(cur&&cur.h&&clock.t>=cur.h.end&&!cur.h.live()){const d=cur.done;cur=null;d();}
  if(!cur&&NQ.length&&!blocking())cur=NQ.shift();}
const narrating=()=>!!cur||NQ.length>0;
function stopAll(){if(cur&&cur.h)cur.h.stop();if(cur)cur.done();cur=null;NQ.splice(0).forEach(n=>n.done());}
/* 공간음 자리(game/weather): 소리가 깨어 있을 때만 {ctx, bus} — 소리 끄기(M)는 전체(out)를 거치므로 그대로 따른다. 촬영 모드는 null */
const ambience=()=>{if(SHOT)return null;const c=audio();return c&&ambBus?{ctx:c,bus:ambBus,running:c.state==='running'}:null;};
export {voiceBook,voiceStage,voiceLog,voiceNow,voiceHold,voiceBusy,voicePeak,voiceSet,VS as voiceSettings,MIX,lufsGain,duckState,tap,audioNow,bedLevel,bedTone,travelOut,quietBuf,kindOf,useWorld,ambience,songs,bedHandle,S as soundSettings,hooks as soundHooks,setMuted,wake,zoneMusic,bed,estimate,narrate,narrating,preload,register,sfx,stopAll,synth,tickBed,tickNarration,voice};
