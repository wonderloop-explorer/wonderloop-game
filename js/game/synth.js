/* 원더룹 — 합성 소리: 소리 파일이 없을 때 Web Audio로 즉석에서 만드는 효과음·배경음
   - 등록: sound.synth({id:{dur, play(ac,out,o)}}) — 효과음. 배경음은 {bed(ac,out)→{tick(dt),stop()}}.
   - 같은 id로 sound.register({id:'url'})하면 그 파일을 읽은 뒤부터 파일이 먼저다(ElevenLabs로 뽑은 소리로 하나씩 바꿔 끼우기).
   - 이 파일에는 소리 도구와 모든 세계가 함께 쓰는 소리(도감 카드 dex, 비밀 secret, 그림 컷 cut)만 둔다. 세계 소리는 구역 폴더에(예: js/zones/fairy/sounds.js).
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
/* 공통 소리 */
const COMMON={
  dex:{dur:1.1,play(ac,out){bell(ac,out,{f:1047,d:.6,g:.16});bell(ac,out,{t:.09,f:1568,d:.9,g:.15});}},                 // 새 도감 카드: 팅-팅 오름
  secret:{dur:1.5,play(ac,out){[1319,1568,1976,2637].forEach((f,i)=>bell(ac,out,{t:i*.07,f,d:.9,g:.11}));                 // 비밀 발견: 반짝이는 오름 + 고운 쉬익
    hiss(ac,out,{ft:'highpass',ff:6000,a:.3,d:.9,g:.05});}},
  cut:{dur:.45,play(ac,out){hiss(ac,out,{ff:1800,ff2:4200,fq:.8,a:.05,d:.22,g:.22});hiss(ac,out,{t:.13,ff:3200,fq:1.2,d:.07,g:.08});}}, // 그림 컷: 종이 스치는 소리
};
export {COMMON,bell,env,hiss,noise,rr,tone};
