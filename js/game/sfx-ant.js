/* 원더룹 — 개미굴 편 효과음 그대로 (antvillage index.html의 sfx() — 코드로 만드는 소리)
   이름·음·길이·세기를 개미굴과 같게 옮겼다. tone()·noise()·bell()·rumbleBurst()도 개미굴 식 그대로(지수 세기 모양, 사각파는 거르개).
   sound.js가 synth()로 등록한다 → sfx('jump') 처럼 부른다. 같은 이름의 파일을 register()하면 파일이 먼저.
   언제 나나(개미굴과 같은 때): blip 대사 한 줄마다(대화·혼잣말) · step 걸음마다 · jump 뛰어오를 때 · land 내려앉을 때 · dash 대쉬 ·
   click 단추 · pickup 물건 줍기 · itemget 아이템 획득 카드 · success 통과(결과창) · sus 미션 카드 · enter 구역에 들어갈 때 · dex 새 도감 카드 · whoosh 휙 덤빔.
   나머지(crash alarm alert windup caught collapse roll crunch snore drip tremble chime thunder pop)는 세계 연출에서 골라 쓴다.
   dur은 시점 기록·동시 소리 수 세기에 쓰는 길이(가장 늦게 끝나는 음까지). */
const mf=m=>440*Math.pow(2,(m-69)/12);
const rr=(a,b)=>a+Math.random()*(b-a),R=Math.random; // 소리는 화면 그림에 쓰지 않으므로 Math.random
const NB=new WeakMap();
function noiseBuf(c){let b=NB.get(c);if(b)return b;const len=c.sampleRate*2;b=c.createBuffer(1,len,c.sampleRate);const d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;NB.set(c,b);return b;}
function tone(c,type,f,t,dur,vol,dest,o){o=o||{};const os=c.createOscillator();os.type=type;os.frequency.setValueAtTime(f,t);if(o.slide)os.frequency.exponentialRampToValueAtTime(o.slide,t+dur);
  const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+(o.a||.006));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  let n=os;if(o.lp){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;os.connect(fl);n=fl;}n.connect(g);g.connect(dest);os.start(t);os.stop(t+dur+.05);os.onended=()=>g.disconnect();}
function noise(c,t,dur,vol,dest,type,freq,q,slideTo){const s=c.createBufferSource();s.buffer=noiseBuf(c);s.playbackRate.value=rr(.8,1.2);
  const f=c.createBiquadFilter();f.type=type||'lowpass';f.frequency.setValueAtTime(freq||1000,t);if(slideTo)f.frequency.exponentialRampToValueAtTime(slideTo,t+dur);f.Q.value=q||.7;
  const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(dest);s.start(t,R()*1.5);s.stop(t+dur+.05);s.onended=()=>g.disconnect();}
function bell(c,m,t,dur,vol,dest){tone(c,'sine',mf(m),t,dur,vol,dest);tone(c,'sine',mf(m)*2.76,t,dur*.4,vol*.25,dest);}
function rumbleBurst(c,t,dur,D){noise(c,t,dur,.75,D,'lowpass',150,.8,55);tone(c,'sine',46,t,dur,.28,D);}
/* 개미굴 sfx(n)의 switch를 소리마다 하나씩 */
const S={
  blip:[.11,(c,t,D)=>{const f=rr(540,760);tone(c,'square',f,t,.05,.035,D,{lp:2200});tone(c,'square',f*1.26,t+.055,.05,.03,D,{lp:2200});}],
  step:[.05,(c,t,D)=>noise(c,t,.045,.06,D,'bandpass',rr(800,1200),1.3)],
  jump:[.2,(c,t,D)=>tone(c,'sine',360,t,.2,.17,D,{slide:820})],
  land:[.11,(c,t,D)=>noise(c,t,.11,.2,D,'lowpass',450)],
  dash:[.2,(c,t,D)=>{noise(c,t,.2,.3,D,'bandpass',900,1.1,5200);noise(c,t+.03,.13,.1,D,'highpass',3500,.7);}],
  click:[.07,(c,t,D)=>{tone(c,'square',1500,t,.03,.05,D,{lp:3200});tone(c,'square',900,t+.04,.03,.04,D,{lp:3200});}],
  pickup:[.46,(c,t,D)=>[84,88,91,96].forEach((m,i)=>tone(c,'triangle',mf(m),t+i*.07,.25,.11,D))],
  itemget:[2.12,(c,t,D)=>{[72,76,79,84].forEach((m,i)=>tone(c,'triangle',mf(m),t+i*.11,.32,.14,D));[84,88,91,96].forEach((m,i)=>bell(c,m,t+.46+i*.02,1.6,.06,D));noise(c,t+.44,1,.05,D,'highpass',6500);}],
  crash:[1,(c,t,D)=>{noise(c,t,.7,.7,D,'lowpass',900,.7,110);for(let i=0;i<10;i++)tone(c,'sine',rr(1800,4300),t+.05+R()*.45,.08,.06,D);noise(c,t+.05,.4,.2,D,'highpass',3600);rumbleBurst(c,t,1,D);}],
  alarm:[.65,(c,t,D)=>[0,.17,.34,.51].forEach((d,i)=>tone(c,'square',mf(i%2?83:88),t+d,.14,.075,D,{lp:2600}))],
  alert:[.29,(c,t,D)=>{tone(c,'square',mf(83),t,.08,.09,D,{lp:2600});tone(c,'square',mf(90),t+.09,.2,.09,D,{lp:2600});}],
  sus:[.35,(c,t,D)=>{tone(c,'sine',mf(79),t,.16,.08,D);tone(c,'sine',mf(84),t+.11,.24,.065,D);}],
  windup:[.32,(c,t,D)=>tone(c,'sawtooth',130,t,.32,.075,D,{slide:270,lp:900})],
  whoosh:[.36,(c,t,D)=>noise(c,t,.36,.34,D,'bandpass',1700,1.2,330)],
  caught:[.88,(c,t,D)=>{tone(c,'sine',170,t,.45,.45,D,{slide:48});[67,63,60].forEach((m,i)=>tone(c,'triangle',mf(m),t+.28+i*.15,.26,.09,D));rumbleBurst(c,t,.6,D);}],
  success:[2.2,(c,t,D)=>{[72,76,79,84,79,84,88].forEach((m,i)=>tone(c,'triangle',mf(m),t+i*.1,i===6?.9:.22,.12,D));[76,79,84].forEach(m=>bell(c,m,t+.6,1.6,.05,D));}],
  collapse:[1.2,(c,t,D)=>{rumbleBurst(c,t,1.2,D);for(let i=0;i<30;i++)noise(c,t+R()*1,.05,.09,D,'bandpass',rr(1100,2700),2);noise(c,t,.55,.45,D,'lowpass',420);}],
  roll:[1.8,(c,t,D)=>rumbleBurst(c,t,1.8,D)],
  crunch:[.15,(c,t,D)=>{for(let k=0;k<4;k++)noise(c,t+k*.025+R()*.02,.04,.12,D,'bandpass',rr(2500,4200),2.5);}],
  snore:[.9,(c,t,D)=>{noise(c,t,.9,.035,D,'lowpass',420,.8,200);tone(c,'sine',115,t,.9,.025,D,{slide:85,a:.3});}],
  drip:[.06,(c,t,D)=>tone(c,'sine',rr(1400,2600),t,.06,.012,D,{slide:rr(700,1200)})],
  enter:[1.63,(c,t,D)=>{noise(c,t,.7,.22,D,'bandpass',600,1.2,2400);[79,84,88].forEach((m,i)=>bell(c,m,t+.25+i*.09,1.2,.06,D));}],
  dex:[1.39,(c,t,D)=>{noise(c,t,.16,.12,D,'highpass',3200);[79,83,86,91].forEach((m,i)=>bell(c,m,t+.08+i*.07,1.1,.06,D));}],
  tremble:[1.02,(c,t,D)=>{for(let i=0;i<14;i++)tone(c,'sine',mf(96+(i%2?2:0)),t+.25+i*.055,.09,.022*(1-i/16),D);[84,88].forEach((m,i)=>bell(c,m,t+i*.1,1.1,.045,D));}],
  chime:[1.16,(c,t,D)=>[84,79,88].forEach((m,i)=>bell(c,m,t+i*.08,1,.05,D))],
  thunder:[3,(c,t,D)=>{rumbleBurst(c,t,3,D);noise(c,t,.5,.5,D,'lowpass',380,.7,90);tone(c,'sine',38,t,2.5,.3,D);}],
  // 원더룹 전용(2026-11-03, 개미굴에 없던 소리): 걸음마다 부드러운 발소리 — 개미굴 step(아주 작은 사각 잡음)은 배경음에 묻혀 안 들렸다. 낮은 '통' + 풀 스치는 소리, 걸음마다 높낮이가 조금씩
  footstep:[.12,(c,t,D)=>{const f=rr(105,135);tone(c,'sine',f,t,.08,.11,D,{slide:f*.6,a:.004});noise(c,t,.07,.09,D,'lowpass',rr(900,1300),.9,350);noise(c,t+.01,.05,.035,D,'bandpass',rr(2600,3400),1.4);}],
  pop:[.5,(c,t,D)=>{tone(c,'sine',480,t,.14,.16,D,{slide:1150});[76,79,84].forEach((m,i)=>tone(c,'triangle',mf(m),t+.12+i*.08,.22,.09,D));}],
};
const ANT={};for(const k in S){const [dur,fn]=S[k];ANT[k]={dur,play(c,out){fn(c,c.currentTime,out);}};}
export {ANT};
