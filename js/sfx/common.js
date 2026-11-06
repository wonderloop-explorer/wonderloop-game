/* 원더룹 — 효과음 공통 묶음 (시리즈 공통 틀 6단계, 2026-11-05 — 목록·이름 규칙·새 소리 넣는 법은 docs/sfx-list.md)
   ─────────────────────────────────────────────────────────────────────────
   어느 세계든 이 묶음을 먼저 쓰고, 여기에 없는 그 세계만의 소리만 js/sfx/<세계>.js에 새로 만든다.
   코드에서는 종류 이름으로 부른다: sound.sfx('item-get'). 세계 설정 sfx:{'item-get':'<다른 이름 또는 파일 주소>'}로 그 세계에서만 바꿔 끼운다(game/sound useWorld).
   소리는 파일이 아니라 코드로 만든다(개미굴 원본 sfx()도 모두 코드 — 원본에 효과음 파일은 없다. 원본 안의 소리 파일은 목소리뿐).
     같은 이름의 소리 파일을 assets/sfx/common/<이름>.mp3로 두고 FILES에 적으면 그 파일을 읽은 뒤부터 파일이 먼저(파일이 없으면 이 코드 소리).
   ── 원본 그대로 ──
   BASE = 개미굴 원본(antvillage index.html sfx())의 소리 정의를 이름·음·길이·세기 그대로 옮긴 것(예전 js/game/sfx-ant.js) +
          원더룹에서 만든 dex·secret·cut(예전 js/game/synth.js COMMON — 새 엔진은 원본 dex 대신 이 dex를 써 왔다, 원본 dex는 js/sfx/antvillage.js 'ant-dex').
   종류 이름은 BASE 소리를 가리키기만 하므로 소리는 바뀌지 않는다. 새로 만든 소리(NEW)는 원본에 없던 종류만이고, 같은 묶음 원본 소리와 크기(RMS)를 맞췄다(tools/sfx-loudness.py).
   ── 이름 규칙 ── 소문자-줄표, 앞은 묶음: ui- 화면 · mission- · item- · card- · zone- · step(-바닥) · jump·land·dash · talk- · event- · weather-
   세계 전용은 <세계 약칭>-<이름>(개미굴 ant-alert …). dur은 시점 기록·동시 소리 수 세기에 쓰는 길이(가장 늦게 끝나는 음까지). */
import {bell as bell2,hiss} from '../game/synth.js';
const mf=m=>440*Math.pow(2,(m-69)/12);
const rr=(a,b)=>a+Math.random()*(b-a),R=Math.random; // 소리는 화면 그림에 쓰지 않으므로 Math.random
const NB=new WeakMap();
function noiseBuf(c){let b=NB.get(c);if(b)return b;const len=c.sampleRate*2;b=c.createBuffer(1,len,c.sampleRate);const d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;NB.set(c,b);return b;}
/* 개미굴 원본 tone()·noise()·bell()·rumbleBurst() 그대로 (지수 세기 모양, 사각파는 거르개) */
function tone(c,type,f,t,dur,vol,dest,o){o=o||{};const os=c.createOscillator();os.type=type;os.frequency.setValueAtTime(f,t);if(o.slide)os.frequency.exponentialRampToValueAtTime(o.slide,t+dur);
  const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+(o.a||.006));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  let n=os;if(o.lp){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;os.connect(fl);n=fl;}n.connect(g);g.connect(dest);os.start(t);os.stop(t+dur+.05);os.onended=()=>g.disconnect();}
function noise(c,t,dur,vol,dest,type,freq,q,slideTo){const s=c.createBufferSource();s.buffer=noiseBuf(c);s.playbackRate.value=rr(.8,1.2);
  const f=c.createBiquadFilter();f.type=type||'lowpass';f.frequency.setValueAtTime(freq||1000,t);if(slideTo)f.frequency.exponentialRampToValueAtTime(slideTo,t+dur);f.Q.value=q||.7;
  const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(dest);s.start(t,R()*1.5);s.stop(t+dur+.05);s.onended=()=>g.disconnect();}
function bell(c,m,t,dur,vol,dest){tone(c,'sine',mf(m),t,dur,vol,dest);tone(c,'sine',mf(m)*2.76,t,dur*.4,vol*.25,dest);}
function rumbleBurst(c,t,dur,D){noise(c,t,dur,.75,D,'lowpass',150,.8,55);tone(c,'sine',46,t,dur,.28,D);}
/* 원본 소리 [길이, 그리기(c, 시작 시각, 내보낼 곳)] — 개미굴 sfx(n)의 switch를 소리마다 하나씩 (공통으로 쓰는 것만, 개미굴 전용은 js/sfx/antvillage.js) */
const ORIG={
  blip:[.11,(c,t,D)=>{const f=rr(540,760);tone(c,'square',f,t,.05,.035,D,{lp:2200});tone(c,'square',f*1.26,t+.055,.05,.03,D,{lp:2200});}],
  step:[.05,(c,t,D)=>noise(c,t,.045,.06,D,'bandpass',rr(800,1200),1.3)],
  jump:[.2,(c,t,D)=>tone(c,'sine',360,t,.2,.17,D,{slide:820})],
  land:[.11,(c,t,D)=>noise(c,t,.11,.2,D,'lowpass',450)],
  dash:[.2,(c,t,D)=>{noise(c,t,.2,.3,D,'bandpass',900,1.1,5200);noise(c,t+.03,.13,.1,D,'highpass',3500,.7);}],
  click:[.07,(c,t,D)=>{tone(c,'square',1500,t,.03,.05,D,{lp:3200});tone(c,'square',900,t+.04,.03,.04,D,{lp:3200});}],
  pickup:[.46,(c,t,D)=>[84,88,91,96].forEach((m,i)=>tone(c,'triangle',mf(m),t+i*.07,.25,.11,D))],
  itemget:[2.12,(c,t,D)=>{[72,76,79,84].forEach((m,i)=>tone(c,'triangle',mf(m),t+i*.11,.32,.14,D));[84,88,91,96].forEach((m,i)=>bell(c,m,t+.46+i*.02,1.6,.06,D));noise(c,t+.44,1,.05,D,'highpass',6500);}],
  crash:[1,(c,t,D)=>{noise(c,t,.7,.7,D,'lowpass',900,.7,110);for(let i=0;i<10;i++)tone(c,'sine',rr(1800,4300),t+.05+R()*.45,.08,.06,D);noise(c,t+.05,.4,.2,D,'highpass',3600);rumbleBurst(c,t,1,D);}],
  sus:[.35,(c,t,D)=>{tone(c,'sine',mf(79),t,.16,.08,D);tone(c,'sine',mf(84),t+.11,.24,.065,D);}],
  whoosh:[.36,(c,t,D)=>noise(c,t,.36,.34,D,'bandpass',1700,1.2,330)],
  success:[2.2,(c,t,D)=>{[72,76,79,84,79,84,88].forEach((m,i)=>tone(c,'triangle',mf(m),t+i*.1,i===6?.9:.22,.12,D));[76,79,84].forEach(m=>bell(c,m,t+.6,1.6,.05,D));}],
  roll:[1.8,(c,t,D)=>rumbleBurst(c,t,1.8,D)],
  crunch:[.15,(c,t,D)=>{for(let k=0;k<4;k++)noise(c,t+k*.025+R()*.02,.04,.12,D,'bandpass',rr(2500,4200),2.5);}],
  drip:[.06,(c,t,D)=>tone(c,'sine',rr(1400,2600),t,.06,.012,D,{slide:rr(700,1200)})],
  enter:[1.63,(c,t,D)=>{noise(c,t,.7,.22,D,'bandpass',600,1.2,2400);[79,84,88].forEach((m,i)=>bell(c,m,t+.25+i*.09,1.2,.06,D));}],
  tremble:[1.02,(c,t,D)=>{for(let i=0;i<14;i++)tone(c,'sine',mf(96+(i%2?2:0)),t+.25+i*.055,.09,.022*(1-i/16),D);[84,88].forEach((m,i)=>bell(c,m,t+i*.1,1.1,.045,D));}],
  chime:[1.16,(c,t,D)=>[84,79,88].forEach((m,i)=>bell(c,m,t+i*.08,1,.05,D))],
  thunder:[3,(c,t,D)=>{rumbleBurst(c,t,3,D);noise(c,t,.5,.5,D,'lowpass',380,.7,90);tone(c,'sine',38,t,2.5,.3,D);}],
  pop:[.5,(c,t,D)=>{tone(c,'sine',480,t,.14,.16,D,{slide:1150});[76,79,84].forEach((m,i)=>tone(c,'triangle',mf(m),t+.12+i*.08,.22,.09,D));}],
};
/* 원더룹에서 만든 공통 소리 (예전 synth.js COMMON 그대로 — play(ac,out)는 ac.currentTime부터) */
const WL={
  dex:{dur:1.1,play(ac,out){bell2(ac,out,{f:1047,d:.6,g:.16});bell2(ac,out,{t:.09,f:1568,d:.9,g:.15});}},                 // 새 도감·소개 카드: 팅-팅 오름
  secret:{dur:1.5,play(ac,out){[1319,1568,1976,2637].forEach((f,i)=>bell2(ac,out,{t:i*.07,f,d:.9,g:.11}));hiss(ac,out,{ft:'highpass',ff:6000,a:.3,d:.9,g:.05});}}, // 비밀 발견
  cut:{dur:.45,play(ac,out){hiss(ac,out,{ff:1800,ff2:4200,fq:.8,a:.05,d:.22,g:.22});hiss(ac,out,{t:.13,ff:3200,fq:1.2,d:.07,g:.08});}}, // 그림 컷: 종이 스치는 소리
};
/* 새로 만든 소리 — 원본에 없던 종류만. 세기는 같은 묶음 원본 소리의 RMS에 맞춤(docs/sfx-list.md 표) */
const NEW={
  // 발소리 바닥별: 원본 step(띠 거르개 소음 0.045초)과 같은 모양·같은 크기, 거르개 자리·길이만 바닥에 맞게
  'step-grass':[.07,(c,t,D)=>{noise(c,t,.06,.021,D,'bandpass',rr(2200,3000),1.1);noise(c,t+.012,.04,.011,D,'highpass',5200,.7);}],      // 풀: 사각
  'step-wood':[.07,(c,t,D)=>{noise(c,t,.05,.011,D,'bandpass',rr(380,520),1.6);tone(c,'sine',rr(180,220),t,.06,.008,D);}],               // 나무 바닥: 톡
  'step-stone':[.05,(c,t,D)=>{noise(c,t,.035,.04,D,'bandpass',rr(1500,2100),2.2);tone(c,'triangle',rr(900,1100),t,.025,.011,D);}],   // 돌: 딱
  'step-water':[.12,(c,t,D)=>{noise(c,t,.1,.017,D,'bandpass',rr(700,1000),1.4,2600);tone(c,'sine',rr(700,900),t+.01,.07,.006,D,{slide:rr(1300,1600)});}], // 얕은 물: 찰박
  // 말풍선 뜸: blip과 같은 크기의 작고 동그란 '뽁'(사각파 대신 사인파 — 대사 넘김 blip과 섞이지 않게)
  'talk-bubble':[.12,(c,t,D)=>{tone(c,'sine',rr(620,700),t,.08,.035,D,{slide:1200});tone(c,'sine',1500,t+.05,.06,.011,D);}],
  // 길 열림: chime과 같은 크기 — 낮은 바람이 열리듯 쉬익 + 종 세 음 오름
  'event-open':[1.5,(c,t,D)=>{noise(c,t,.9,.09,D,'bandpass',400,1,2200);[79,84,88,91].forEach((m,i)=>bell(c,m,t+.18+i*.11,1.1,.045,D));}],
};
/* 종류 표: 이름 → [묶음, 쓰는 소리(ORIG·WL·NEW 이름), 설명]. 같은 원본 소리를 여러 종류가 가리킬 수 있다(원본이 그렇게 썼으니) */
const KINDS={
  'ui-click':['화면','click','단추 누름 · 창 닫기 단추 · 메뉴'],
  'ui-open':['화면','pickup','옷 갈아입기(탐험 준비) 창 열기'],
  'ui-close':['화면','click','창 닫기(가방 등)'],
  'ui-book':['화면','dex','가방·도감 창 열기'],
  'mission-start':['화면','sus','미션 카드(할 일이 생김)'],
  'mission-clear':['화면','success','통과·결과창·스테이지 완료 배지'],
  'item-pickup':['화면','pickup','물건 줍기(첫 미션 물건)'],
  'item-get':['화면','itemget','아이템 획득 카드'],
  'card-new':['화면','dex','새 도감 카드 · 친구 소개 카드'],
  'card-secret':['화면','secret','숨겨진 비밀 발견 카드'],
  'card-cut':['화면','cut','그림 컷 열고 닫기'],
  'zone-enter':['화면','enter','구역에 들어갈 때'],
  'step':['움직임','step','발소리(기본 바닥)'],
  'step-grass':['움직임','step-grass','발소리 — 풀'],
  'step-leaf':['움직임','crunch','발소리 — 마른 잎(바스락)'],
  'step-wood':['움직임','step-wood','발소리 — 나무'],
  'step-stone':['움직임','step-stone','발소리 — 돌'],
  'step-water':['움직임','step-water','발소리 — 얕은 물'],
  'jump':['움직임','jump','점프'],
  'land':['움직임','land','착지 · 탈것에서 내림'],
  'dash':['움직임','dash','대쉬'],
  'talk-start':['대화','blip','말 걸기(첫 대사)'],
  'talk-next':['대화','blip','대사 넘김 · 이야기 소개 다음 · 표정 미리보기'],
  'talk-bubble':['대화','talk-bubble','말풍선 뜸(아직 아무 데도 안 씀 — 원본에 없던 소리)'],
  'event-clunk':['사건','crash','덜컹(수레가 넘어지며 물건이 쏟아짐 — 원본 꿀단지)'],
  'event-roll':['사건','roll','굴러감(데구르르 — 원본 공벌레)'],
  'event-tok':['사건','pickup','톡 하고 제자리로(굴러간 물건에 닿음 — 원본 꿀단지 줍기)'],
  'event-sparkle':['사건','chime','반짝임(클로버 돌림 · 나침반 반짝)'],
  'event-open':['사건','event-open','길 열림'],
  'event-pop':['사건','pop','퐁(탈것에 올라탐 · 무언가 튀어나옴)'],
  'event-whoosh':['사건','whoosh','휙(굴러옴 · 물 가르기)'],
  'event-tremble':['사건','tremble','파르르(나침반 바늘 떨림)'],
  'guard-notice':['사건','sus','알아차림 ?(갸웃 — game/stealth가 작게 틂, 원본 경비개미 sus)'],
  'guard-alert':['사건','pop','들킴 !(세계 설정으로 바꿔 끼움 — 개미굴 ant-alert)'],
  'guard-windup':['사건','whoosh','덤비기 전(세계 설정으로 — 개미굴 ant-windup)'],
  'guard-caught':['사건','whoosh','안전한 곳으로 옮겨짐(세계 설정으로 — 개미굴 ant-caught)'],
  'big-get':['사건','success','큰 획득 — 선물이 원더룹 앞에 닿는 순간(원본 나침반 success)'],
  'weather-thunder':['날씨','thunder','천둥'],
  'weather-drip':['날씨','drip','물방울 똑'],
};
/* 옛 이름(개미굴 sfx 이름) → 종류 — 예전 코드·대본이 부르던 이름도 그대로 받는다 */
const ALIAS={blip:'talk-next',click:'ui-click',pickup:'item-pickup',itemget:'item-get',success:'mission-clear',sus:'mission-start',enter:'zone-enter',dex:'card-new',secret:'card-secret',cut:'card-cut',
  crash:'event-clunk',roll:'event-roll',crunch:'step-leaf',chime:'event-sparkle',pop:'event-pop',whoosh:'event-whoosh',tremble:'event-tremble',thunder:'weather-thunder',drip:'weather-drip'};
/* 소리 파일로 바꿔 끼운 것 (assets/sfx/common/<이름>.mp3 — 지금은 없음) */
const FILES={};
function asSynth(def){if(def.play)return def;const [dur,fn]=def;return {dur,play(c,out){fn(c,c.currentTime,out);}};}
const SOUNDS={};for(const k in KINDS){const b=KINDS[k][1];SOUNDS[k]=asSynth(ORIG[b]||WL[b]||NEW[b]);}
export {ALIAS,FILES,KINDS,SOUNDS,bell,mf,noise,rr,rumbleBurst,tone};
