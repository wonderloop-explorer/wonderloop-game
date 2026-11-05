/* 원더룹 — 합성 소리: 소리 파일이 없을 때 Web Audio로 즉석에서 만드는 효과음·배경음
   - 등록: sound.synth({id:{dur, play(ac,out,o)}}) — 효과음. 배경음은 {bed(ac,out)→{tick(dt),stop()}}.
   - 같은 id로 sound.register({id:'url'})하면 그 파일을 읽은 뒤부터 파일이 먼저다(ElevenLabs로 뽑은 소리로 하나씩 바꿔 끼우기).
   - 이 파일에는 소리 도구만 둔다. 효과음 공통 묶음은 js/sfx/common.js(예전 여기 있던 dex·secret·cut도 그리로), 세계 전용은 js/sfx/<세계>.js.
   - 소리는 화면 그림에 쓰지 않으므로 Math.random을 쓴다(시드 난수 순서와 상관없음). */
const NB=new WeakMap();
const rr=(a,b)=>a+Math.random()*(b-a);
/* 소음 2초짜리(반복용): white 흰 소음, brown 갈색 소음(낮은 웅웅거림) */
function noise(ac,kind='white'){let m=NB.get(ac);if(!m){m={};NB.set(ac,m);}if(m[kind])return m[kind];
  const n=ac.sampleRate*2,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);let last=0;
  for(let i=0;i<n;i++){const w=Math.random()*2-1;if(kind==='brown'){last=(last+.02*w)/1.02;d[i]=last*3.5;}else d[i]=w;}
  return m[kind]=b;}
/* 세기 모양: t에 시작, a초 동안 g까지 올라갔다가 d초 동안 사라짐 */
function env(ac,out,T,a,d,g){const e=ac.createGain();e.gain.setValueAtTime(0,T);e.gain.linearRampToValueAtTime(g,T+a);e.gain.exponentialRampToValueAtTime(.0001,T+a+d);e.connect(out);return e;}
/* 거르개(선택): {ft:'lowpass'|'bandpass'|'highpass', ff 주파수, fq} */
function filt(ac,node,o,T,dur){if(!o.ft)return node;const f=ac.createBiquadFilter();f.type=o.ft;f.frequency.setValueAtTime(o.ff,T);if(o.ff2)f.frequency.exponentialRampToValueAtTime(o.ff2,T+dur);f.Q.value=o.fq??1;node.connect(f);return f;}
/* 음 하나: f에서 f2로 미끄러지며 */
function tone(ac,out,o){const {t=0,f=440,f2=null,type='sine',a=.005,d=.4,g=.3}=o,T=ac.currentTime+t,os=ac.createOscillator();os.type=type;os.frequency.setValueAtTime(f,T);
  if(f2)os.frequency.exponentialRampToValueAtTime(f2,T+a+d);const e=env(ac,out,T,a,d,g);filt(ac,os,o,T,a+d).connect(e);os.start(T);os.stop(T+a+d+.05);os.onended=()=>e.disconnect();return os;}
/* 소음 한 번(바스락·쉭): 걸러서 */
function hiss(ac,out,o){const {t=0,a=.005,d=.1,g=.3,kind='white'}=o,T=ac.currentTime+t,s=ac.createBufferSource();s.buffer=noise(ac,kind);s.loop=true;
  const e=env(ac,out,T,a,d,g);filt(ac,s,{ft:'bandpass',ff:2000,...o},T,a+d).connect(e);s.start(T,Math.random()*1.5);s.stop(T+a+d+.05);s.onended=()=>e.disconnect();return s;}
/* 종소리: 기본음 + 맑은 배음 두 개 */
function bell(ac,out,{t=0,f=880,d=1.2,g=.2}){tone(ac,out,{t,f,d,g,a:.003});tone(ac,out,{t,f:f*2.76,d:d*.4,g:g*.22,a:.002});tone(ac,out,{t,f:f*5.4,d:d*.18,g:g*.08,a:.002});}
export {bell,env,hiss,noise,rr,tone};
