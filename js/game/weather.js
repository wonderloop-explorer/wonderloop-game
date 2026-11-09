/* 원더룹 — 날씨와 시간대 (시리즈 공통, 2026-11-04)
   게임을 열 때 한 번: 낮(day) · 밤(night) · 비 오는 날(rain) · 노을 진 저녁(sunset) 가운데 하나를 무작위로 고르고, 그 판 동안 바꾸지 않는다
   (이어서 하기로 다시 열면 다시 무작위). 고를 목록은 세계 설정 weathers(없으면 넷 다). 주소 ?weather=day|night|rain|sunset 또는 ?time=0|1|2(낮·노을·밤)로 고정.
   촬영 모드(?shot)는 늘 낮(기준 촬영 그대로) — 앰비언스 영상처럼 일부러 ?weather를 적었을 때만 그 날씨.
   - 야외(하늘이 있는 구역, game/sky): 시간 값(낮 0·노을 1·밤 2) + 비(SK.rain — 흐린 하늘·약한 햇빛·가까운 안개). 빗줄기는 카메라 둘레 상자 안에서만
     선 하나 묶음으로(그리기 1회, 휴대폰 160·컴퓨터 420개 상한, 자동 화질이 내려가면 절반). 구역 정보 indoor:true면 야외라도 비를 내리지 않는다.
   - 실내·지하(하늘이 없거나 indoor:true — 베이스캠프 방): 비는 내리지 않고 창문 하늘·들어오는 빛 색으로만(08이 indoorLight로 조명을, 구역 light(env)가 env.weather·env.rain으로 창문을).
   - 공간음(합성 — 소리 파일 없음, 가볍게): 낮 새소리 · 밤 풀벌레 · 비 빗소리 + 아주 가끔 멀고 낮은 천둥(크고 가까운 천둥 없음, 번쩍임 없음) · 노을 잔잔한 바람.
     배경음과 함께 작게(sound 공간음 자리 0.32), 소리 끄기를 따른다. 실내는 먹먹하게(낮은 주파수만 통과·더 작게). 세계 설정 ambience로 날씨별 소리 이름을 바꿀 수 있다.
   - 길 안내(민트 동그라미)·이름표·말풍선·글씨는 조명을 받지 않는 재질·화면 글자라 어느 날씨에서도 또렷하다.
   구역 정보 ambience:'이름'이면 날씨와 상관없이 그 공간음(2026-11-09 — 화성은 우주 웅웅거림 대신 잔잔한 바람).
   시험: 톱니 메뉴 '날씨: …' 단추로 차례로 바꿔 본다(setWeather). */
import * as THREE from 'three';
import {ambience} from './sound.js';
const Q=new URLSearchParams(location.search),SHOT=Q.has('shot');
/* 우주 날씨(2026-11-07, 무한 우주 — 세계 설정 weathers): 맑은 별빛·유성우·오로라·성운 노을. 하늘 시간은 늘 0(우주 하늘은 구역 sky keys가 셋 다 까만 우주),
   그림(유성·오로라 띠·성운 빛)은 구역이 env.weather로 그린다. 비·천둥 없음. 공간음 space(잔잔한 웅웅거림)·meteor(+ 먼 쉬익) */
const ALL=['day','night','rain','sunset','starlight','meteor','aurora','nebula'],NAME={day:'낮',night:'밤',rain:'비 오는 날',sunset:'노을 진 저녁',starlight:'맑은 별빛',meteor:'유성우',aurora:'오로라',nebula:'성운 노을'};
const TIME={day:0,sunset:1,night:2,rain:0,starlight:0,meteor:0,aurora:0,nebula:0}; // 하늘 시간 값(game/sky)
const coarse=matchMedia('(pointer:coarse)').matches;
let list=ALL,cur=null,ctx=null,rainK=0,rain=null,rainN=0,amb=null,ambKey='',indoorK=0;
function pick(W){list=(W&&W.weathers&&W.weathers.length?W.weathers:ALL).filter(w=>ALL.includes(w));if(!list.length)list=ALL;
  const qw=Q.get('weather'),qt=Q.get('time');
  if(qw&&ALL.includes(qw))return qw;
  if(qt!==null&&qt!==''&&list.includes('day'))return ['day','sunset','night'][Math.max(0,Math.min(2,+qt|0))];
  if(SHOT)return list.includes('day')?'day':list[0];
  return list[Math.floor(Math.random()*list.length)];}
/* 08이 처음에 한 번(세계 설정을 넘김). 고른 날씨는 weather()로 */
function initWeather(c,W){ctx=c;cur=pick(W);ctx.world=W||null;return cur;}
const weather=()=>cur;
const weatherName=w=>NAME[w||cur];
const timeOf=w=>TIME[w||cur];
function setWeather(w){if(!ALL.includes(w))return;cur=w;const Z=ctx&&ctx.zone&&ctx.zone();if(Z&&Z.sky){Z.sky.to(TIME[w],1.5);}}
function nextWeather(){const L=list.includes(cur)?list:ALL;setWeather(L[(L.indexOf(cur)+1)%L.length]);return cur;}
const isIndoor=Z=>!Z||!Z.sky||!!Z.indoor;
/* 구역에 들어갈 때(08 zoneLook 뒤): 하늘 시간을 이 날씨로 */
function applyZone(Z){if(Z&&Z.sky){Z.sky.set(TIME[cur]);Z.sky.rain=!Z.indoor&&cur==='rain'?1:0;}rainK=Z&&Z.sky&&!Z.indoor&&cur==='rain'?1:0;}
/* 실내 조명(08이 하늘 없는 구역에서 해·하늘빛 계산 뒤에): 밤은 08 '저녁'(night 1)에 더 푸르고 어둡게, 노을은 반쯤 저녁 + 창으로 들어오는 주황빛, 비는 회청색으로 조금 어둡게 */
const cBlue=new THREE.Color(),cGrey=new THREE.Color();
function indoorNight(){return {day:0,sunset:.5,night:1,rain:.35}[cur]??0;}
let sunBase=null;
function indoorLight(L,dt,rawLin){if(!sunBase)sunBase=L.sun.color.clone();L.sun.color.copy(sunBase); /* 해 색은 08이 매 프레임 되돌리지 않으므로 여기서 */const tN=cur==='night'?1:0,tR=cur==='rain'?1:0,tS=cur==='sunset'?1:0;L.k=L.k||{n:0,r:0,s:0};const kk=Math.min(1,dt*2.2);L.k.n+=(tN-L.k.n)*kk;L.k.r+=(tR-L.k.r)*kk;L.k.s+=(tS-L.k.s)*kk;const n=L.k.n,r=L.k.r,sn=L.k.s;
  if(n>.001){L.hemi.intensity*=1-.55*n;L.hemi.color.lerp(cBlue.copy(rawLin(0x5f6fc4)),.6*n);L.hemi.groundColor.lerp(cBlue.copy(rawLin(0x33335a)),.5*n);L.sun.intensity*=1-.92*n;L.sun.color.lerp(cBlue.copy(rawLin(0x9fb0ff)),.7*n);L.fill.intensity*=1-.45*n;} // 밤: 푸르고 어둡게(달빛)
  if(sn>.001){L.hemi.color.lerp(cGrey.copy(rawLin(0xffb27a)),.4*sn);L.hemi.groundColor.lerp(cGrey.copy(rawLin(0xc07a5a)),.3*sn);L.sun.color.lerp(cGrey.copy(rawLin(0xff8a4a)),.75*sn);L.sun.intensity*=1+.35*sn;} // 노을: 창으로 낮게 들어오는 주황빛
  if(r>.001){L.hemi.intensity*=1-.12*r;L.hemi.color.lerp(cGrey.copy(rawLin(0xb6c2d0)),.5*r);L.hemi.groundColor.lerp(cGrey.copy(rawLin(0x8a8a8c)),.35*r);L.sun.intensity*=1-.75*r;L.sun.color.lerp(cGrey.copy(rawLin(0xd0d8e2)),.6*r);}
  return {night:n,rain:r};}
/* ---------- 빗줄기 ---------- */
const BOX=new THREE.Vector3(26,16,26);
function buildRain(){if(rain)return;const n=coarse?160:420;rainN=n;const P=new Float32Array(n*2*3),S=new Float32Array(n*2*4);
  let s=11;const R=()=>(s=(s*16807)%2147483647)/2147483647;
  for(let i=0;i<n;i++){const a=R(),b=R(),c=R(),sp=.85+R()*.3;for(let e=0;e<2;e++){S.set([a,b,c,e+sp*10],(i*2+e)*4);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('seed',new THREE.BufferAttribute(S,4));
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e5);
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,
    uniforms:{uT:{value:0},uC:{value:new THREE.Vector3()},uB:{value:BOX},uA:{value:0},uCol:{value:new THREE.Color(0xdfe8f2)}},
    // 빗방울은 월드에 붙어 떨어지고(카메라가 움직여도 미끄러지지 않음), 카메라 둘레 상자 밖으로 나가면 반대쪽으로 감싼다. 두 꼭짓점(e 0 아래 · 1 위)이 한 줄기
    vertexShader:'attribute vec4 seed;uniform float uT;uniform vec3 uC;uniform vec3 uB;varying float vE;void main(){float e=floor(seed.w/10.);float sp=fract(seed.w/10.)*10.;'+
      'vec3 w=vec3(seed.x*uB.x,seed.z*uB.y-uT*sp*11.,seed.y*uB.z);vec3 p=uC+(fract((w-uC)/uB+.5)-.5)*uB;p.y+=e*.55;p.x+=e*.05;vE=e;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}',
    fragmentShader:'uniform float uA;uniform vec3 uCol;varying float vE;void main(){gl_FragColor=vec4(uCol,uA*(.25+.75*vE));}'});
  m.userData.noBend=true;
  rain=new THREE.LineSegments(g,m);rain.frustumCulled=false;rain.renderOrder=6;rain.visible=false;rain.name='rain';rain.userData.noMerge=true;ctx.scene.add(rain);}
/* 자동 화질(08 applyQuality)이 내려가면 빗줄기를 절반으로 */
function rainQuality(level){if(rain&&level>=1)rain.geometry.setDrawRange(0,Math.floor(rainN*(level>=3?.35:.5))*2);}
/* ---------- 공간음 ---------- */
function noiseBuf(c){const n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;l=(l+.02*w)/1.02;d[i]=w*.5+l*2.5;}return b;}
let NB=null;
function startAmb(key,indoor){stopAmb();const A=ambience();if(!A||!key)return;const c=A.ctx,root=c.createGain();root.gain.value=0;
  const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=indoor?700:16000;root.connect(lp);lp.connect(A.bus);root.gain.setTargetAtTime(indoor?.55:1,c.currentTime,1.2);
  if(!NB)NB=noiseBuf(c);const timers=[],nodes=[root,lp];let live=true;const later=(f,ms)=>{const id=setTimeout(()=>{if(live)f();},ms);timers.push(id);};
  const loopNoise=(type,freq,q,gain)=>{const s=c.createBufferSource();s.buffer=NB;s.loop=true;const f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=c.createGain();g.gain.value=gain;s.connect(f);f.connect(g);g.connect(root);s.start();nodes.push(s,f,g);return g;};
  const blip=(t,f0,f1,dur,g0,pan)=>{const o=c.createOscillator(),g=c.createGain(),p=c.createStereoPanner?c.createStereoPanner():null;o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(g0,t+dur*.25);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);if(p){p.pan.value=pan;g.connect(p);p.connect(root);}else g.connect(root);o.start(t);o.stop(t+dur+.05);};
  if(key==='birds'){const chirp=()=>{const t=c.currentTime+.05,pan=Math.random()*1.6-.8,base=2600+Math.random()*1600,n=2+Math.floor(Math.random()*4);
      for(let i=0;i<n;i++)blip(t+i*(.09+Math.random()*.05),base*(1+Math.random()*.2),base*(1.25+Math.random()*.4),.08+Math.random()*.05,.05+Math.random()*.03,pan);later(chirp,1400+Math.random()*4200);};
    later(chirp,600);loopNoise('lowpass',400,.5,.015);} // 새소리 + 아주 옅은 바깥 소리
  else if(key==='crickets'){const cr=(f,pan)=>{const t=c.currentTime+.05;for(let k=0;k<3;k++)blip(t+k*.055,f,f*.98,.04,.022,pan);later(()=>cr(f,pan),520+Math.random()*700);};
    later(()=>cr(4400,-.5),300);later(()=>cr(4900,.45),700);later(()=>cr(4150,.1),1100);loopNoise('lowpass',300,.5,.02);} // 풀벌레 셋 + 밤바람
  else if(key==='rain'){loopNoise('lowpass',indoor?1400:2600,.4,.32);loopNoise('highpass',5200,.3,indoor?.02:.06); // 빗소리(쏴아 + 잔 빗방울)
    const thunder=()=>{const t=c.currentTime+.1,s=c.createBufferSource();s.buffer=NB;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=110;const g=c.createGain();
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16,t+1.4);g.gain.exponentialRampToValueAtTime(.0001,t+6);s.connect(f);f.connect(g);g.connect(root);s.start(t);s.stop(t+6.2); // 멀고 낮게: 천천히 커졌다 길게 사라짐
      later(thunder,35000+Math.random()*45000);};later(thunder,20000+Math.random()*25000);}
  else if(key==='space'||key==='meteor'){ // 우주: 아주 낮고 잔잔한 웅웅거림(사인 두 개가 천천히 맥놀이) + 옅은 바람결 — 유성우면 가끔 먼 쉬익
    const hum=(f,g0,pan)=>{const o=c.createOscillator(),g=c.createGain(),p=c.createStereoPanner?c.createStereoPanner():null;o.type='sine';o.frequency.value=f;g.gain.value=g0;o.connect(g);if(p){p.pan.value=pan;g.connect(p);p.connect(root);nodes.push(p);}else g.connect(root);o.start();nodes.push(o,g);return g;};
    const a=hum(55,.05,-.3),b=hum(55.6,.045,.3),hi=hum(220.4,.008,0);loopNoise('lowpass',180,.4,.02);
    const swell=()=>{const t=c.currentTime;a.gain.setTargetAtTime(.03+Math.random()*.04,t,3);b.gain.setTargetAtTime(.03+Math.random()*.04,t,3);hi.gain.setTargetAtTime(.004+Math.random()*.008,t,4);later(swell,5000+Math.random()*4000);};swell();
    if(key==='meteor'){const whoosh=()=>{const t=c.currentTime+.05,s=c.createBufferSource();s.buffer=NB;const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=1.4;f.frequency.setValueAtTime(2400,t);f.frequency.exponentialRampToValueAtTime(500,t+1.6);
        const g=c.createGain(),p=c.createStereoPanner?c.createStereoPanner():null;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+.35);g.gain.exponentialRampToValueAtTime(.0001,t+1.8);s.connect(f);f.connect(g);
        if(p){p.pan.setValueAtTime(Math.random()*1.6-.8,t);p.pan.linearRampToValueAtTime(Math.random()*1.6-.8,t+1.8);g.connect(p);p.connect(root);}else g.connect(root);s.start(t);s.stop(t+1.9); // 멀리서 쉬익(작게)
        later(whoosh,3500+Math.random()*7000);};later(whoosh,2500);}}
  else if(key==='wind'){const g=loopNoise('bandpass',480,.7,.08);const sway=()=>{g.gain.setTargetAtTime(.05+Math.random()*.1,c.currentTime,1.6);later(sway,2500+Math.random()*3000);};sway();loopNoise('lowpass',220,.5,.03);}
  amb={stop(){live=false;timers.forEach(clearTimeout);const t=c.currentTime;root.gain.setTargetAtTime(0,t,.4);setTimeout(()=>nodes.forEach(n=>{try{n.stop&&n.stop();}catch(e){}try{n.disconnect();}catch(e){}}),2000);}};}
function stopAmb(){if(amb){amb.stop();amb=null;}}
const AMB={day:'birds',night:'crickets',rain:'rain',sunset:'wind'};
/* 08이 매 프레임(구역·카메라) */
function tickWeather(dt,Z,camera){if(!ctx)return;
  // 빗줄기
  const want=Z&&Z.sky&&!Z.indoor&&cur==='rain'?1:0;rainK+=(want-rainK)*Math.min(1,dt*1.5);if(Z&&Z.sky)Z.sky.rain=rainK;
  if(rainK>.01){buildRain();rain.visible=true;const u=rain.material.uniforms;u.uT.value+=dt;u.uC.value.copy(camera.position);u.uA.value=.42*rainK;}else if(rain)rain.visible=false;
  // 공간음: 날씨(+실내)가 바뀌거나 소리가 처음 깨어나면 다시
  const W=ctx.world,A=ambience(),indoor=isIndoor(Z),key=((Z&&Z.ambience)||(W&&W.ambience&&W.ambience[cur])||AMB[cur])||'',k=A&&A.running?key+'|'+indoor:'';
  if(k!==ambKey){ambKey=k;if(k)startAmb(key,indoor);else stopAmb();}}
function weatherState(){return {weather:cur,name:NAME[cur],rain:+rainK.toFixed(2),rainDrops:rain&&rain.visible?(rain.geometry.drawRange.count===Infinity?rainN:rain.geometry.drawRange.count/2):0,amb:ambKey};}
export {ALL as WEATHERS,applyZone,indoorLight,indoorNight,initWeather,isIndoor,nextWeather,rainQuality,setWeather,tickWeather,timeOf,weather,weatherName,weatherState};
