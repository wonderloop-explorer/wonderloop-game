/* 원더룹 — 코드로 연주하는 배경음 (음악 파일 없이 Web Audio로 직접 — 개미굴 편 SONGS·playStep·seqTick 방식을 엔진 공통으로)
   쓰는 법: 세계마다 곡 묶음을 만들어 songs({id:곡,…})로 등록 → 구역 정보 music:'id' (또는 sound.bed('id')).
     sound.js의 배경음 자리를 그대로 쓰므로 구역을 옮길 때 크로스페이드, 대사·나레이션 때 줄이기, M으로 끄고 켜기가 저절로 된다.
   곡 {bpm, bars:[{bass:미디, pad:[미디…], arp:[미디…]}], mel:[[8칸 미디|null]…], lead:'celesta'|'musicbox'|'marimba', parts:{…}, swing}
     한 마디 = 8분음표 8칸. 마디 목록을 끝까지 돌면 처음으로(끊김 없이 이어서 예약).
     parts(켜고 끄기·세기): pad 따뜻한 패드 · bass 피치카토 베이스(bassPat: 8칸 중 근음 0·5도 7 위치) · chords 뜯는 화음(offbeat) ·
       arp 느린 아르페지오(arpRate 칸마다) · sparkle 가끔 반짝이는 종 · drops 물방울 · wind 바람 스침 · wood 나무 톡톡 · shaker 셰이커 · counter 낮은 현 대선율 · thump 부드러운 북
     build: 처음엔 작게 시작해 build초 동안 층이 하나씩 더해지며 벅차게 커지는 곡(축제). h.bloom()이면 바로 다 핀다.
   변주: 같은 마디를 돌 때마다 선율 몇 음을 이웃 화음음으로 바꾸거나 꾸밈음을 넣고, 두 번째 바퀴마다 뒤 네 마디를 한 옥타브 위 오르골로 — 너무 똑같이 들리지 않게.
   악기(같은 세계는 같은 악기 바탕): celesta 셀레스타 · musicbox 오르골 · marimba 마림바 · pizz 피치카토 · pad 패드 · bell 종 · drop 물방울 · wind 바람 · wood 나무 · shaker.
   소리 크기는 개미굴 배경음과 비슷하게(음 하나 0.03~0.14, 배경음 묶음 0.5 × 전체 0.85) — 효과음(0.9)을 덮지 않는다.
   소리는 화면 그림에 쓰지 않으므로 Math.random을 쓴다. */
const mf=m=>440*Math.pow(2,(m-69)/12),R=Math.random,pick=a=>a[Math.floor(R()*a.length)];
const NB=new WeakMap();
function noiseBuf(c){let b=NB.get(c);if(b)return b;const n=c.sampleRate*2;b=c.createBuffer(1,n,c.sampleRate);const d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=R()*2-1;NB.set(c,b);return b;}
/* 음 하나 (개미굴 tone과 같은 지수 세기 모양): a 올라가는 시간, 나머지는 사라짐 */
function osc(c,D,type,f,t,dur,vol,o={}){const os=c.createOscillator();os.type=type;os.frequency.setValueAtTime(f,t);if(o.slide)os.frequency.exponentialRampToValueAtTime(o.slide,t+(o.slideT||dur));if(o.det)os.detune.value=o.det;
  const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+(o.a||.005));
  if(o.hold){g.gain.setValueAtTime(vol,t+o.hold);}g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  let n=os;if(o.lp){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;fl.Q.value=o.q||.7;os.connect(fl);n=fl;}n.connect(g);g.connect(D);os.start(t);os.stop(t+dur+.05);os.onended=()=>{g.disconnect();if(n!==os)n.disconnect();};}
function hiss(c,D,t,dur,vol,type,freq,q,to){const s=c.createBufferSource();s.buffer=noiseBuf(c);const f=c.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(freq,t);if(to)f.frequency.exponentialRampToValueAtTime(to,t+dur);f.Q.value=q||.7;
  const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+Math.min(.4*dur,.3));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(D);s.start(t,R()*1.5);s.stop(t+dur+.05);s.onended=()=>{g.disconnect();f.disconnect();};}
/* 악기 */
const INST={
  celesta(c,D,m,t,v){osc(c,D,'sine',mf(m),t,1.3,v);osc(c,D,'sine',mf(m)*2,t,.55,v*.22);osc(c,D,'sine',mf(m)*4.01,t,.22,v*.14);},
  musicbox(c,D,m,t,v){osc(c,D,'sine',mf(m),t,1,v);osc(c,D,'sine',mf(m)*3,t,.3,v*.12);osc(c,D,'triangle',mf(m)*6,t,.05,v*.05);},
  marimba(c,D,m,t,v){osc(c,D,'sine',mf(m),t,.42,v);osc(c,D,'sine',mf(m)*4,t,.06,v*.3);},
  pizz(c,D,m,t,v){osc(c,D,'triangle',mf(m),t,.32,v,{lp:1300,a:.004});osc(c,D,'sine',mf(m),t,.18,v*.5);},
  bell(c,D,m,t,v){osc(c,D,'sine',mf(m),t,1.6,v,{a:.003});osc(c,D,'sine',mf(m)*2.76,t,.6,v*.25,{a:.002});osc(c,D,'sine',mf(m)*5.4,t,.25,v*.08,{a:.002});},
  pad(c,D,notes,t,dur,v){notes.forEach(m=>[-5,5].forEach(det=>{const os=c.createOscillator();os.type='sawtooth';os.frequency.value=mf(m);os.detune.value=det;
      const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=950;const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+Math.min(.9,dur*.35));
      g.gain.setValueAtTime(v,t+dur*.75);g.gain.linearRampToValueAtTime(0,t+dur+.6);os.connect(f);f.connect(g);g.connect(D);os.start(t);os.stop(t+dur+.7);os.onended=()=>{g.disconnect();f.disconnect();};}));},
  counter(c,D,m,t,dur,v){[-4,4].forEach(det=>osc(c,D,'sawtooth',mf(m),t,dur,v,{a:.35,hold:dur*.6,lp:1100,det}));},
  drop(c,D,t,v){const f=pick([1400,1600,1800,2100,2400]);osc(c,D,'sine',f,t,.09,v,{slide:f*1.9,slideT:.06,a:.003});},
  wind(c,D,t,dur,v){hiss(c,D,t,dur,v,'bandpass',380,1.4,1300);},
  wood(c,D,t,v){hiss(c,D,t,.05,v,'bandpass',1900,4);osc(c,D,'sine',880,t,.05,v*.4);},
  shaker(c,D,t,v){hiss(c,D,t,.06,v,'highpass',6500,.7);},
  thump(c,D,t,v){osc(c,D,'sine',120,t,.28,v,{slide:52,a:.004});},
};
/* 마디 하나의 칸 하나를 예약 */
function playStep(c,D,S,st,t,lvl){const bars=S.bars.length,bar=Math.floor(st/8)%bars,i=st%8,loop=Math.floor(st/(8*bars)),B=S.bars[bar],P=S.parts||{},spb=60/S.bpm/2;
  const on=(k,need=0)=>P[k]&&lvl>=need,dur=spb;
  if(i===0&&on('pad'))INST.pad(c,D,B.pad,t,spb*8,(P.pad.v||.012)*(.6+.4*lvl));
  if(on('bass',S.build?.35:0)){const pat=P.bass.pat||[0,null,null,null,7,null,null,null],iv=pat[i];if(iv!=null)INST.pizz(c,D,B.bass+iv,t,P.bass.v||.12);}
  if(on('chords',S.build?.5:0)&&(P.chords.at||[2,6]).includes(i))B.pad.forEach((m,k)=>INST.pizz(c,D,m+12,t+k*.012,(P.chords.v||.035)));
  if(on('arp',S.build?.45:0)){const rate=P.arp.rate||1;if(i%rate===0){const A=B.arp||B.pad,k=(i/rate+bar)%(A.length*2-2),idx=k<A.length?k:A.length*2-2-k;INST[P.arp.inst||'celesta'](c,D,A[idx],t,(P.arp.v||.045)*(.85+R()*.3));}}
  // 선율 + 변주
  if(on('mel',S.build?.2:0)){let m=S.mel[bar][i];
    if(m!=null){let inst=S.lead||'celesta',v=(P.mel&&P.mel.v)||.11;
      if(loop%2===1&&bar>=bars/2&&!S.noOct){m+=12;inst='musicbox';v*=.8;} // 두 번째 바퀴 뒤 절반은 한 옥타브 위 오르골
      if(loop>0&&R()<.18){const ct=(B.arp||B.pad).map(x=>{let y=x;while(y<m-6)y+=12;while(y>m+6)y-=12;return y;}).filter(y=>y!==m);if(ct.length)m=pick(ct);} // 이웃 화음음
      INST[inst](c,D,m,t+(S.swing&&i%2?spb*S.swing:0),v);
      if(loop>0&&R()<.1&&S.mel[bar][(i+1)%8]==null)INST[inst](c,D,m+pick([2,-1,4]),t+spb*.5,v*.55);}} // 꾸밈음
  if(on('counter',S.build?.65:0)&&i===0)INST.counter(c,D,B.pad[0]-12+(bar%2?7:0),t,spb*8,P.counter.v||.012);
  if(on('sparkle',S.build?.1:0)&&R()<(P.sparkle.p||.06))INST.bell(c,D,pick(B.arp||B.pad)+24,t,P.sparkle.v||.035);
  if(on('drops')&&R()<(P.drops.p||.12))INST.drop(c,D,t+R()*spb*.5,P.drops.v||.03);
  if(on('wind')&&i===0&&bar%(P.wind.every||2)===0)INST.wind(c,D,t,spb*8,P.wind.v||.02);
  if(on('wood',S.build?.8:0)&&(P.wood.at||[2,6]).includes(i))INST.wood(c,D,t,P.wood.v||.05);
  if(on('shaker',S.build?.8:0)&&i%2===1)INST.shaker(c,D,t,P.shaker.v||.015);
  if(on('thump',S.build?.85:0)&&(P.thump.at||[0,4]).includes(i))INST.thump(c,D,t,P.thump.v||.12);
  if(S.build&&lvl>=.95&&i===0&&bar%2===0)B.pad.forEach((x,k)=>INST.bell(c,D,x+24,t+k*.04,.03));} // 다 피면 마디마다 종 화음
/* 곡 틀기: sound.js 배경음 자리(bed)가 부른다 → {tick(dt), stop(), bloom()} */
function start(S,c,out){const D=c.createGain();D.gain.value=1;D.connect(out);const spb=60/S.bpm/2;let st=0,next=c.currentTime+.08,t0=c.currentTime,lvl=S.build?0:1,full=false;
  const iv=setInterval(()=>{if(c.state!=='running')return;if(next<c.currentTime-.5)next=c.currentTime+.05;let n=0; // 탭이 잠들었다 깨면 밀린 칸은 건너뛴다
    if(S.build&&!full)lvl=Math.min(1,.15+(c.currentTime-t0)/S.build);
    while(next<c.currentTime+.2&&n++<16){try{playStep(c,D,S,st,next,lvl);}catch(e){}next+=spb;st++;}},30);
  return {stop(){clearInterval(iv);setTimeout(()=>{try{D.disconnect();}catch(e){}},3000);},bloom(){full=true;lvl=1;},get level(){return lvl;}};}
/* 등록: songs({id:곡}) → sound.synth에 배경음으로 */
function asBeds(map){const o={};for(const k in map){const S=map[k];o[k]={bed:(c,out)=>start(S,c,out),song:S};}return o;}
export {INST,asBeds,playStep,start};
