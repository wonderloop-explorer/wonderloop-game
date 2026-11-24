/* 무한 우주 쉼터(토성 고리) — 본편(2026-11-24, STAGE 3과 STAGE 4 사이의 번호 없는 쉼터. 흐름·대사 표 docs/space-rest-flow.md). 금성 구름 끝에서 얼음 배를 타고 오면(venus.js sail → RIDE.pending.boat) 토성 고리 위 얼음 섬에 내린다.
   ── 흐름(약 2분) ──
   ① 도착(얼음 배가 내려와 닿음 — 나레이션 RS-001) → 거꾸리 RS-003(고리 두께) · RS-004(고리 던지기 하자)
   ② 얼음 고리 던지기: 던지는 자리(THROW)에 서서 얼음 뿔 셋(PEGS — 가까이·중간·멀리)에 차례로. '던지기' 단추(휴대폰은 말 걸기 자리, PC는 E·단추 누르기)를 누르고 있는 동안 힘 게이지가 차올랐다 내려오고(세모 물결),
      떼면 그 세기만큼 둥실 느리게 날아감(거리 = D0 + DK×세기). 걸리면 '딩'(event-ding) + 고리가 뿔을 따라 빙글 내려감 + 거꾸리 폴짝, 빗나가면 얼음 위를 미끄러지다 사라지고 새 고리(실패·횟수 제한 없음 —
      같은 뿔을 두 번 놓칠 때마다 걸리는 범위를 넓힘). 셋 다 걸면 카메라 쪽을 보고 폴짝 → RS-006. 할 일 '얼음 고리를 걸어요 n/3', 놀이 곡(saturn-play — 파일이 없으면 코드 곡).
   ③ 앉아서 쉬기(약 40초 — 앰비언스): 큰 얼음 조각(SLAB)에 둘이 나란히 앉고, 원더룹이 카세트를 켬 → 지나온 길의 소리(달 떡방아·토끼 웃음 → 화성 바람·삐삐/둥둥 웃음 → 금성 생일 노래·양 → 조용).
      화면 글자·단추 모두 숨김, 대사 없음. 카메라 다섯 구간(REST_CAM): 옆모습 → 고리 얼음 들판과 작아진 해 → 멀리 작은 달 엔켈라두스의 얼음 분수 → 높이 올라가 토성 북극의 육각형 폭풍 → 둘에게로.
      10초 뒤부터 화면을 누르면 '건너뛰기' 단추가 잠깐 뜸. 쉬는 곡(saturn-rest — 파일이 없으면 달 배경음).
   ④ 발견 카드: 거꾸리 RS-007 → '토성은 물보다 가벼워요'(RS-008, 화면 아래쪽)
   ⑤ 인사: 거꾸리 RS-009 → 얼음 배가 떠 와서 거꾸리가 타고 손 흔들며 멀어짐(원더룹은 앞모습으로 손 흔들기) → 하늘에서 붉은 소용돌이 빛이 내려와 감싸 올림(목성의 붉은 폭풍이 끌어당김)
      → 행성 이동 공통 틀(meteor-ride departure, 탈것 = 붉은 소용돌이 빛) → 우주 지도 → 붉은 덮개 → 임시 구역 space-jupiter. 끝낸 뒤 다시 오면 섬 가운데 붉은 빛에 들어서면 다시 떠남.
   저장 flags: rest:met · rest:toss · rest:sat · secret:<세계>:saturnfloat · clear:space-saturn(중간에 나갔다 오면 그다음 단계부터)
   ── 땅·하늘 ──
   땅: 반지름 약 8.5m 얼음 섬(위가 평평) + 얼음 뿔 셋·앉는 얼음 조각·둘레 얼음 조각(모두 한 덩어리). 하늘: 우주 하늘 그림판(별·해).
   토성과 고리(2026-11-21): 우리는 고리 위에 서 있다 → 고리는 발밑에서 토성 쪽으로 쭉 깔린 납작한 얼음 들판(셰이더 판 한 장), 토성은 고리 면에 반쯤 잠긴 커다란 구(반지름 SR, 거리 SD).
   2026-11-24: 카메라가 높이 올라가면(쉬기 넷째 구간·목성으로 떠날 때) 고리 판이 토성을 한 바퀴 두르는 진짜 고리 띠로 바뀜(uFly — 카메라 높이로 저절로), 북극에 육각형 구름 띠(hexCap — 높이 올라갔을 때만 그림),
   멀리 작은 달 엔켈라두스(구 1) + 얼음 분수(점 묶음 1).
   그리기(구역 것): 섬 1 · 고리 판 1 · 하늘 그림판 · 토성 구 1 · 엔켈라두스 2 · 거꾸리 3(+ 해시계 판 1) · 배 1 · 얼음 고리(인스턴스 1) · 반짝이 0~1 · 놀이 표시 0~1 · 카세트(쉴 때만) · 붉은 빛 2(떠날 때만) */
import * as THREE from 'three';
import {PI,QUALITY,rng} from '../../01-textures.js';
import * as G from '../../game/index.js';
import {markChar} from '../../game/bend.js';
import {sbMat} from '../../game/storybook.js';
import {radialTex,gradTex} from '../../game/glowtex.js';
import {RIDE,lockOn,lockOff,camHome,departure,dustVeil,points} from './meteor-ride.js';
import {lump,M4,makeCassette} from './martians.js';
import {makeGeokkuri,makeIceBoat,boatStand} from './cloudfolk.js';
import {makeSkyBoard,makeOrb,canvasTex,saturnMap,jupiterMap} from './skyboard.js';
import SPACE from '../../worlds/infinite-space.js';
const ZID='space-saturn',WID=SPACE.id;
/* 대사 — 모두 [임시](docs/voice/script.csv SPC-RS-003~, 목소리는 나중에 한꺼번에) */
const T={land:'저 커다란 게 바로 토성이에요. 토성은 디딜 땅이 없는 가스 행성이라, 고리의 얼음 위에 내렸어요.' /* SPC-RS-001(나레이터 — 확정·녹음 완료) */,
  g1:'[임시] 여기서 좀 쉬었다 가자! 이 고리, 엄청 넓은데 두께는 10m쯤밖에 안 된대.' /* RS-003 */,g2:'[임시] 고리 행성에선 고리 던지기지! 저 얼음 뿔에 고리를 걸어 봐.' /* RS-004 */,
  rule:'[임시] 누른 만큼 멀리 날아가요' /* RS-005 글자만 */,g3:'[임시] 다 걸었다! 이제 진짜 쉬자.' /* RS-006 */,g4:'[임시] 이렇게 큰 토성을 아주 큰 욕조에 넣으면 둥둥 뜬대!' /* RS-007 */,
  cardT:'토성은 물보다 가벼워요',card:'[임시] 토성은 태양계에서 유일하게 평균 밀도가 물보다 낮은 행성이에요. 아주 큰 욕조가 있다면 둥둥 뜰 거예요.' /* RS-008 */,
  g5:'[임시] 난 이 배 타고 금성으로 돌아갈게. 목성에서 다들 모인대! 거기서 또 만나!' /* RS-009 */};
const K={met:'rest:met',toss:'rest:toss',sat:'rest:sat',float:'secret:'+WID+':saturnfloat',clear:'clear:'+ZID};
const HSEAT=.15,GSEAT=.14 /* 배 위에 서는 높이(금성 venus.js와 같은 값) */,DOCKB=[-3.3,0] /* 배가 닿는 자리: 섬의 토성 쪽 */,BSIDE=.42,HX=.45,GX=.55,HERO=[.4,.5],GGAT=[1.1,-1.5],BY=.42 /* 배 밑이 얼음 섬 위에 얹히는 높이 */,SR=250,SD=600,SC=[-SD,-.9,-70] /* 토성 구 가운데(고리 면 높이) */;
/* 고리 던지기 자리: 던지는 곳 → 얼음 뿔 셋(서쪽 = 토성 쪽으로 한 줄) */
const THROW=[2.8,-2.0],PEGS=[[0,-2.2],[-2.4,-2.6],[-4.9,-2.4]],PEGH=1.15,GTOSS=[3.9,-.1],D0=1.4,DK=8.2 /* 날아가는 거리 = D0 + DK×세기 */,FILL=1.7 /* 게이지가 끝까지 차는 초 */,RING_R=.3;
/* 앉는 얼음 조각 */
const SLAB=[1.0,3.7],STOP=.32,HS=[1.3,3.05],GS=[1.3,4.45],REST=40;
const AFTER=[[-.3,1.3],[-.3,-.5]],BYEH=[-.4,1.5],GGB=[-1.5,.9],PORT=[-2.3,.7]; /* 끝낸 뒤 다시 왔을 때 붉은 빛이 기다리는 자리(시작 자리에서 약 2.7m) */
const ENC_D=new THREE.Vector3(-Math.cos(.17)*Math.cos(.74),Math.sin(.17),-Math.cos(.17)*Math.sin(.74)),ENC_R=30,ENC_DIST=1050,ENC_PD=new THREE.Vector3(.34,.86,-.2).normalize(); /* 엔켈라두스: 토성 오른쪽(북서) 하늘 낮게 · 분수가 뿜는 방향 */
const STORM_VEIL={blobs:['#f2b08e','#e98a6c','#f6c9a6','#dd6f58','#f0a07e'],bg:['#eca486','#de7a62'],fade:'rgba(236,150,120,0)',tiles:[[255,226,196],[196,84,62]],dots:['255,236,214','226,110,84','246,176,140']};
const PLAY_SONG={name:'토성 고리 던지기(임시)',bpm:132,lead:'celesta',noVary:true, /* 지금은 금성 놀이 곡과 같은 가락 — assets/audio/saturn-play.mp3을 넣으면 그 곡 */
  bars:[48,48,53,55,48,45,53,55].map((r,i)=>({bass:r,pad:[r+24,r+24+[4,4,4,4,4,3,4,4][i],r+31]})),
  mel:[[76,null,79,null,84,null,79,null],[76,79,84,null,88,null,84,null],[77,null,81,null,84,null,81,null],[79,null,83,86,null,83,79,null],
       [76,null,79,null,84,null,79,null],[76,null,81,84,null,81,76,null],[77,81,84,null,86,null,84,null],[83,null,79,null,84,null,null,null]],
  parts:{mel:{v:.085},pad:{v:.02},bass:{v:.1,pat:[0,null,7,null,0,null,7,null]},arp:{v:.03},wood:{p:.5,v:.03}}};
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);},lerp=(a,b,t)=>a+(b-a)*t;
function encMap(g,w,h){g.fillStyle='#eef4fb';g.fillRect(0,0,w,h);g.strokeStyle='#a9c8ea';g.lineWidth=2;g.lineCap='round';for(let i=0;i<9;i++){const x=(i*37%w),y=h*(.25+.5*((i*53%17)/17));g.globalAlpha=.5;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+w*.08,y+h*.06*(i%2?1:-1),x+w*.17,y+h*.02);g.stroke();}g.globalAlpha=1;}
/* 놀이 화면 표시(던지기 단추 + 힘 게이지) — 모양은 말 걸기 단추(#wlAct)와 같은 자리·크기 */
const CSS=`#wlToss{position:fixed;right:calc(env(safe-area-inset-right,0px) + 40px);bottom:calc(env(safe-area-inset-bottom,0px) + 126px);min-width:66px;height:66px;border-radius:33px;padding:0 .9rem;border:0;background:#ffd76a;color:#3a2218;
font-family:"Jua","Gowun Dodum",sans-serif;font-size:1.02rem;box-shadow:0 4px 0 rgba(0,0,0,.28);cursor:pointer;z-index:36;touch-action:none;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
#wlToss.on{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.28);background:#ffc23a}
#wlTossBar{position:fixed;right:calc(env(safe-area-inset-right,0px) + 22px);bottom:calc(env(safe-area-inset-bottom,0px) + 208px);width:150px;height:20px;border-radius:10px;background:rgba(46,28,44,.74);box-shadow:0 0 0 2px rgba(255,244,228,.75) inset;z-index:36;overflow:hidden;pointer-events:none}
#wlTossBar i{position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(90deg,#5cc4b9,#ffe07a);border-radius:10px}
#wlTossBar b{position:absolute;top:2px;bottom:2px;border-radius:7px;box-shadow:0 0 0 2px #fff inset;background:rgba(255,255,255,.28)}
#wlRestSkip{position:fixed;right:calc(env(safe-area-inset-right,0px) + 16px);bottom:calc(env(safe-area-inset-bottom,0px) + 18px);z-index:45;border:0;border-radius:999px;padding:.5rem 1.1rem;background:rgba(46,28,44,.7);color:#fff4e4;font-family:"Jua","Gowun Dodum",sans-serif;font-size:1rem;cursor:pointer;-webkit-tap-highlight-color:transparent}
body.wl-nohints #wlToss,body.wl-nohints #wlTossBar{display:none}`;
export function build({root}){const st0={};const MOB=QUALITY.tier==='mobile',keep=[],R0=rng('space-saturn:ice'),RR=(a,b)=>a+R0()*(b-a),obstacles=[],F=G.state.flags;
  G.profile.setup({world:SPACE.id,cards:SPACE.cards});G.sound.songs({'saturn-play-code':PLAY_SONG});G.travel.prepare(SPACE.travel);
  if(!document.getElementById('wlSaturnCss')){const s=document.createElement('style');s.id='wlSaturnCss';s.textContent=CSS;document.head.appendChild(s);}
  const add=o=>{root.add(o);keep.push(o);return o;};
  const KEY={top:'#151331',horizon:'#2b2560',hemi:'#e6dcff',ground:'#7c6aa8',hemiI:.84,sun:'#fff1d6',sunI:.72,sunDir:[6,-4,3],fill:.32,fog:'#2b2560',fogNear:220,fogFar:900,stars:0,milky:1.1};
  const SK=G.sky.sky({parent:root,keys:[KEY,KEY,KEY],t:0,nStars:0,space:true});
  const board=makeSkyBoard(root,{mob:MOB,seed:'space-saturn:sky'});
  /* 토성: 고리 면에 반쯤 잠긴 커다란 구(불투명) — 그 앞으로 발밑에서부터 고리 판이 깔림 */
  const oSat=makeOrb(root,{map:canvasTex(512,saturnMap,256),rep:[9,5],ring:false,seg:MOB?[48,28]:[72,40]});oSat.g.position.set(...SC);oSat.g.scale.setScalar(SR);oSat.g.rotation.z=.06;oSat.g.name='saturn-planet';oSat.U.uL.value.set(.55,.6,.45).normalize();if(oSat.halo)oSat.halo.visible=false;oSat.g.traverse(o=>{o.frustumCulled=false;});oSat.body.material.transparent=true;oSat.body.renderOrder=-3; /* 하늘 그림판(별·성운 — 카메라 앞 90m의 반투명 판)보다 뒤에 그려야 그 판에 덮이지 않는다: 반투명 차례로 옮겨 그림판 다음에(불투명도는 1 그대로, 고리 판·얼음은 깊이로 앞을 가림) */keep.push(oSat.g);
  /* 북극의 육각형 폭풍(2026-11-24 — 쉬기 넷째 구간에서 카메라가 높이 올라가면 보임. NASA: 토성 북극에는 육각형 모양 제트기류가 있다): 극을 덮는 얇은 덮개 한 장(정점 색·알파 — 가운데 눈 → 밝은 구름 → 진한 육각형 띠 → 옅어짐).
     구의 겉면 바로 위(1.004), 모서리가 둥근 육각형. 높이 올라갔을 때만 그림(평소 0) */
  const hexCap=(()=>{const NA=72,S=[0,.1,.22,.4,.62,.8,.9,1,1.1,1.26],C0=.3 /* 육각형 띠의 가운데 각(극에서 — 약 17°, 잘 보이게 실제 12°보다 조금 크게) */,pos=[],col=[],idx=[],c=new THREE.Color(),
      CS=[['#a88a55',1],['#b3965f',1],['#d9c58c',1],['#efdca4',1],['#e9d59c',1],['#c8a868',1],['#a8854c',1],['#b8965a',1],['#ecd9a2',.9],['#ecd9a2',0]];
    const hx=a=>{const q=((a+PI/6)%(PI/3)+PI/3)%(PI/3)-PI/6;return lerp(1,Math.cos(PI/6)/Math.cos(q),.78);}; /* 둥근 육각형: 꼭짓점 쪽이 1, 변 가운데가 약 0.9 */
    for(let k=0;k<S.length;k++)for(let j=0;j<=NA;j++){const a=j/NA*PI*2,cl=C0*S[k]*(k>3?hx(a):lerp(1,hx(a),k/4)),r=1.004;pos.push(Math.sin(cl)*Math.cos(a)*r,Math.cos(cl)*r,Math.sin(cl)*Math.sin(a)*r);c.set(CS[k][0]);col.push(c.r,c.g,c.b,CS[k][1]);}
    for(let k=0;k<S.length-1;k++)for(let j=0;j<NA;j++){const a=k*(NA+1)+j,b=a+1,d=a+NA+1,e=d+1;idx.push(a,b,d,b,e,d);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,4));geo.setIndex(idx);
    const m=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,fog:false,side:THREE.DoubleSide});m.userData.noBend=true;m.userData.noStorybook=true;
    const me=new THREE.Mesh(geo,m);me.name='saturn-hexagon';me.frustumCulled=false;me.renderOrder=-2.9;me.userData.noMerge=true;me.visible=false;oSat.g.add(me);return me;})();
  /* 엔켈라두스(멀리 작은 얼음 달) + 얼음 분수(NASA: 엔켈라두스 남극의 얼음 분수가 토성 E 고리의 재료가 된다) */
  const oEnc=makeOrb(root,{map:canvasTex(128,encMap,64),rep:[3,2],seg:[20,14]});oEnc.g.position.copy(ENC_D).multiplyScalar(ENC_DIST);oEnc.g.scale.setScalar(ENC_R);oEnc.g.name='enceladus';oEnc.U.uL.value.set(.55,.6,.45).normalize();oEnc.halo.visible=false;oEnc.body.material.transparent=true;oEnc.body.renderOrder=-3;keep.push(oEnc.g);
  const dotTex=radialTex(64,[[0,255,255,255,1],[.4,255,255,255,.55],[1,255,255,255,0]]);
  const plume=(()=>{const N=MOB?90:160,pos=new Float32Array(N*3),sa=new Float32Array(N*4),r=rng('space-saturn:plume');for(let i=0;i<N;i++)sa.set([r()*2-1,r()*2-1,r(),.5+r()*.8],i*4);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('sa',new THREE.BufferAttribute(sa,4));
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,uniforms:{uT:{value:0},uSc:{value:800},uMap:{value:dotTex},uO:{value:oEnc.g.position.clone()},uD:{value:ENC_PD.clone()},uR:{value:ENC_R}},
      vertexShader:'uniform float uT,uSc,uR;uniform vec3 uO,uD;attribute vec4 sa;varying float vA;void main(){float k=fract(sa.z+uT*.11*sa.w);vec3 sx=normalize(cross(uD,vec3(0.,0.,1.))),sy=cross(uD,sx);'+
        'vec3 p=uO+uD*uR*(.96+k*4.2)+(sx*sa.x+sy*sa.y)*uR*(.1+k*1.7)-vec3(0.,1.,0.)*uR*k*k*1.3;float tw=.55+.45*sin(uT*6.+sa.z*40.);vA=(1.-k)*smoothstep(0.,.08,k)*tw;vec4 mv=viewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=uR*(.13+.15*sa.w)*(1.-.4*k)*uSc/max(1.,-mv.z);}',
      fragmentShader:'uniform sampler2D uMap;varying float vA;void main(){vec4 c=texture2D(uMap,gl_PointCoord);if(c.a<.02)discard;gl_FragColor=vec4(vec3(.82,.93,1.)*c.a*vA,1.);}'});
    m.userData.noBend=true;const p=new THREE.Points(geo,m);p.name='enceladus-plume';p.frustumCulled=false;p.renderOrder=-2.8;p.userData.noMerge=true;add(p);return m;})();
  {/* 고리 = 얼음 들판(2026-11-21): 발밑 높이의 납작한 판 한 장을 화소마다 계산 — 가까운 곳은 드문드문 흩어진 얼음 조각(칸마다 무작위 — 사이로 우주가 비침), 멀어질수록 옅어지며 지평선으로 이어지고,
       토성을 중심으로 한 동심원 띠(밝은 얼음 띠·어두운 틈)가 멀리 토성 쪽에 가는 빛 띠 몇 줄로 보인다. 반투명(깊이 안 씀) — 섬·얼음 조각·토성 구가 깊이로 가림. 그리기 1.
       2026-11-24 uFly(0 평소 → 1 높이 올라갔을 때): 섬 둘레의 들판 대신 토성을 한 바퀴 두르는 고리 띠 전체(위에서 보면 진짜 고리) — 판을 토성 가운데에 두고 넓혀 고리 전체를 덮음 */
    const geo=new THREE.PlaneGeometry(2500,2500,1,1);geo.rotateX(-PI/2);
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,side:THREE.DoubleSide,uniforms:{uSC:{value:new THREE.Vector2(SC[0],SC[2])},uR0:{value:SR*1.02},uIce:{value:new THREE.Color('#dfeafb')},uWarm:{value:new THREE.Color('#f7eeda')},uT:{value:0},uFly:{value:0}},
      vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
      fragmentShader:`precision highp float;varying vec3 vW;uniform vec2 uSC;uniform float uR0,uT,uFly;uniform vec3 uIce,uWarm;
        float h2(vec2 p){p=fract(p*vec2(.1031,.1030));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.y);}
        float chunks(vec2 p,float cell,float fill){vec2 c=floor(p/cell),f=fract(p/cell)-.5;float h=h2(c),k=h2(c+7.3);vec2 o=(vec2(h2(c+1.7),h2(c+4.1))-.5)*.5;float r=.16+.26*k;return step(1.-fill,h)*smoothstep(r,r*.55,length((f-o)*vec2(1.,.8+.6*k)));}
        float band(float r,float c,float w){return smoothstep(w,0.,abs(r-c));}
        void main(){vec2 p=vW.xz;float d=length(p),rs=length(p-uSC);
          float near=chunks(p,1.5,.34)*smoothstep(70.,14.,d)+chunks(p+31.,3.1,.36)*smoothstep(190.,40.,d)*smoothstep(8.,30.,d)*.8;
          float haze=mix(.06,.2,smoothstep(10.,120.,d))*smoothstep(520.,260.,d);
          float b=band(rs,318.,14.)+.8*band(rs,372.,9.)+band(rs,455.,20.)*.9+.6*band(rs,520.,8.);
          float gap=band(rs,410.,12.);
          float far=b*smoothstep(60.,170.,d)*.62;
          float a=clamp(near*.82+haze*(1.-gap*.8)+far,0.,.92);
          a*=smoothstep(uR0,uR0+26.,rs)*smoothstep(720.,560.,d);
          float af=smoothstep(uR0,uR0+26.,rs)*smoothstep(700.,650.,rs)*clamp(.5+.3*b-.44*gap+.12*sin(rs*.21)+.06*sin(rs*.83),0.,.9);
          a=mix(a,af,uFly);
          vec3 col=mix(uIce,uWarm,clamp(far*1.4+.25*h2(floor(p/1.5))+uFly*(.35+.3*b),0.,1.));col*=.86+.14*near+.1*sin(uT*.7+h2(floor(p/1.5))*40.)*near;
          if(a<.004)discard;gl_FragColor=vec4(col,a);
          #include <colorspace_fragment>
        }`});
    m.userData.noBend=true;m.userData.noStorybook=true;const ring=new THREE.Mesh(geo,m);ring.position.set(SC[0],-.92,SC[2]);ring.name='saturn-ring';ring.frustumCulled=false;ring.renderOrder=-2;ring.userData.noMerge=true;add(ring);st0.ring=m;st0.ringMesh=ring;}
  /* 얼음 섬(위가 평평한 얼음 덩어리 — 각진 면) + 가장자리 얼음 뿔 + 고리의 얼음 조각 띠 */
  const L=[],ICE=['#dcecfb','#cfe4f8','#eaf4ff','#c2d9f2','#f4efdc'];
  {const g=new THREE.CylinderGeometry(8.6,6.4,2.2,11,1).toNonIndexed(),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+Math.sin(x*1.7+z*2.3)*.05;p.setXYZ(i,x*k,y>0?0:y-1.1+Math.sin(x*.9)*.4,z*k);}g.computeVertexNormals();L.push([g,'#e6f1fc']);}
  for(let i=0;i<9;i++){const a=i/9*PI*2+RR(-.2,.2),r=8.0+RR(-.3,.3),h=RR(.9,2.4),x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.hypot(x-7.8,z)<4.6||Math.hypot(x+7.8,z)<3.6)continue; /* 카메라 쪽(동쪽)과 배가 내려오는 쪽은 비움 */L.push([new THREE.ConeGeometry(RR(.35,.7),h,5).applyMatrix4(M4([x,h/2-.1,z],[RR(-.2,.2),RR(0,3),RR(-.2,.2)])),ICE[i%4]]);obstacles.push({c:[x,z,.6]});}
  /* 가까운 얼음 들판: 고리 면 높이에 납작하게 깔린 작은 얼음 조각(섬 둘레 12~75m — 섬과 한 덩어리) */
  for(let i=0,n=MOB?80:130;i<n;i++){const a=RR(0,PI*2),d=12+63*Math.pow(R0(),1.5),r=RR(.18,.75);L.push([new THREE.IcosahedronGeometry(r,0).applyMatrix4(M4([Math.cos(a)*d,-.95+RR(-.12,.2),Math.sin(a)*d],[RR(0,3),RR(0,3),RR(0,3)],[1,RR(.3,.6),1])),ICE[i%5]]);}
  for(let i=0,n=MOB?70:110;i<n;i++){const x=RR(-120,120),z=RR(-95,95),r=RR(.35,2.3);if(Math.hypot(x,z)<11.5)continue;const g=new THREE.IcosahedronGeometry(r,0).applyMatrix4(M4([x,RR(-1.6,.4),z],[RR(0,3),RR(0,3),RR(0,3)],[1,RR(.5,.9),1]));L.push([g,ICE[i%5]]);}
  /* 2026-11-24(새 난수 이름 없이 고정 값 — 예전 난수 순서 그대로): 고리 던지기 얼음 뿔 셋(뾰족한 뿔 + 낮은 받침) · 앉는 큰 얼음 조각(위가 평평) */
  PEGS.forEach(([x,z],i)=>{L.push([new THREE.ConeGeometry(.19,PEGH,6).applyMatrix4(M4([x,PEGH/2+.06,z],[0,i*.9,0])),'#bfe0ff']);L.push([new THREE.CylinderGeometry(.36,.46,.14,7).applyMatrix4(M4([x,.06,z],[0,i*.5,0])),'#d6e9fb']);obstacles.push({c:[x,z,.34]});});
  {const g=new THREE.CylinderGeometry(1.72,1.95,.62,8,1).toNonIndexed();g.applyMatrix4(M4([SLAB[0],STOP-.31,SLAB[1]],[0,.3,0],[1,1,.66]));L.push([g,'#dcebfa']);}
  const island=lump(L.map(([q,c])=>[q.index?q.toNonIndexed():q,c]),true,1.2);island.geometry.computeVertexNormals();island.name='saturn-ice';island.frustumCulled=false;island.receiveShadow=true;add(island);
  const gg=makeGeokkuri(),boat=makeIceBoat();[gg.root,boat].forEach(o=>{add(o);markChar(o);});
  const pend=RIDE.pending&&RIDE.pending.boat?RIDE.pending:null;if(pend)RIDE.pending=null;
  const st={t:0,arr:pend?{t:0,ph:'down',cu:null,idle:9}:null,done:!pend,flow:false,scene:false,T:{},lastQ:null,mus:null},B={x:DOCKB[0],y:BY,z:DOCKB[1]};
  const U0=()=>G.view.camera&&G.mission.hero&&G.mission.hero(),mark=k=>{if(st.T[k]==null)st.T[k]=+G.clock.t.toFixed(2);};
  const say=(who,text,sec,o)=>G.dialog.say(who,text,sec,undefined,o),wait=s=>G.core.wait(s),pk=()=>{const c=G.view.camera;return c&&c.aspect<1.25?Math.min(2,1.25/c.aspect):1;};
  const quest=q=>{if(q!==st.lastQ){st.lastQ=q;G.ui.setQuest(q);}};
  gg.root.position.set(GGAT[0],0,GGAT[1]);gg.root.rotation.y=PI/2;boat.position.set(B.x,B.y,B.z);if(!pend)boat.visible=false;if(F[K.clear])gg.root.visible=false;
  G.dialog.npc({id:'geokkuri',name:'거꾸리',root:gg.root,bubbleY:gg.head+.32,talkR:1.3,bubbleR:.01,variants:[{when:()=>true,lines:[]}]}); /* 쉼터에서는 흐름이 저절로 이어져 따로 말 걸 상대가 아님 */
  const hop=(from,to,sec,fn,h=.8)=>{const t0=G.clock.t;return G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/sec),e=u*u*(3-2*u);fn(lerp(from[0],to[0],e),lerp(from[1],to[1],e)+Math.sin(u*PI)*h,lerp(from[2],to[2],e));return u>=1;},sec+1);};
  const faceTo=(o,x,z)=>{o.rotation.y=Math.atan2(x-o.position.x,z-o.position.z);};
  /* 배경음: 쉼터 바탕은 조용히(공간음만) · 놀이 곡 · 쉬는 곡 — 파일 자리 assets/audio/saturn-play.mp3 · saturn-rest.mp3(수노 곡이 오면 넣기만). 없으면 놀이는 코드 곡(saturn-play-code), 쉬기는 달 배경음(moon-bgm) */
  const HAS={};['saturn-play','saturn-rest'].forEach(async id=>{try{const r=await fetch('assets/audio/'+id+'.mp3?v='+(window.WL_V||''),{method:'HEAD'});HAS[id]=r.ok&&r.headers.get('content-type')!=='text/html';}catch(e){HAS[id]=false;}});
  const music=m=>{if(st.mus===m)return;st.mus=m;st.musLog=(st.musLog||[]);st.musLog.push([m,+G.clock.t.toFixed(2)]);
    if(m==='play'){if(HAS['saturn-play'])G.sound.zoneMusic({id:'saturn-play',fade:.6,out:1.2});else G.sound.bed('saturn-play-code',{fade:.6,out:1.2});}
    else if(m==='rest'){if(HAS['saturn-rest'])G.sound.zoneMusic({id:'saturn-rest',fade:2.5,out:1.5});else G.sound.zoneMusic({id:'moon-bgm',fade:2.5,out:1.5,loop:[14.44,87.04,.12],lufs:-13.8,gain:undefined});}
    else G.sound.bed(null);};
  /* 이야기 장면 감싸기(금성과 같은 방식): 원더룹은 서 있고(sceneLock), who를 주면 대화 카메라 */
  let ggMode='idle';
  async function scene(fn,who){if(st.scene)return;const W=U0();if(!W)return;st.scene=true;const U=W.userData;if(U.stopWalk)U.stopWalk();U.sceneLock=true;
    let pc=null;if(who){W.rotation.y=Math.atan2(who.root.position.x-W.position.x,who.root.position.z-W.position.z);faceTo(who.root,W.position.x,W.position.z);pc=G.view.pairCam(who.root,who.head);if(pc)G.view.hold(pc);}
    try{await fn(W,U);}catch(e){console.error(e);}finally{if(pc&&G.view.req&&G.view.req.fn===pc)G.view.hold(null);U.sceneLock=false;st.scene=false;}}
  /* 걸어서 옮기기(연출): 원더룹은 그 자리까지 미끄러지듯 걷는 동작으로(짧은 거리), 거꾸리는 뒷걸음 뒤뚱 */
  const moveTo=(o,to,sec,isHero)=>{const a=[o.position.x,o.position.z],t0=G.clock.t,U=isHero?o.userData:null;if(U){U.action='걷기';U.at=0;o.rotation.y=Math.atan2(to[0]-a[0],to[1]-a[1]);}else{ggMode='walk';o.rotation.y=Math.atan2(a[0]-to[0],a[1]-to[1]);}
    return G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/sec);o.position.x=lerp(a[0],to[0],u);o.position.z=lerp(a[1],to[1],u);if(u>=1){if(U){U.action='서기';U.at=0;}else ggMode='idle';}return u>=1;},sec+1);};
  const frontCam=(W,D0=6.2)=>{const P=W.position,c=G.view.camera.position;let nx=c.x-P.x,nz=c.z-P.z;const l=Math.hypot(nx,nz)||1;nx/=l;nz/=l;const k=pk(),pt=k>1.3,D=(pt?D0+.4:D0)*k;W.rotation.y=Math.atan2(nx,nz);return ()=>({at:[P.x,P.y+(pt?.6:1.0),P.z],from:[P.x+nx*D,P.y+1.5+.25*(k-1),P.z+nz*D]});};
  /* ── ① 도착: 배가 내려와 닿음 → 둘이 내림 ── */
  const ur=G.travel.untilResolve(),D=ur!=null&&isFinite(ur)&&ur>0?Math.min(4.4,Math.max(2.2,ur)):3.1,FROM=[-8,8.5,4]; /* 토성 쪽 하늘에서 내려옴 */let started=false;
  async function land(W,U){mark('land');G.travel.mark('land');G.ui.toast(T.land,5.2,T.land);G.sound.sfx('land',{gain:.5});G.sound.sfx('event-pop',{gain:.6});
    await G.core.wait(.7);ggMode='walk';G.sound.sfx('jump',{gain:.6});{const r=gg.root.position;await hop([r.x,r.y,r.z],[GGAT[0],0,GGAT[1]],.7,(x,y,z)=>gg.root.position.set(x,y,z));}ggMode='idle';gg.root.rotation.y=PI/2;
    U.action='서기';U.at=0;G.sound.sfx('jump');{const p=W.position;await hop([p.x,p.y,p.z],[HERO[0],0,HERO[1]],.8,(x,y,z)=>{W.position.set(x,y,z);U.riding.y=y;});}G.sound.sfx('land',{gain:.5});
    st.arr=null;lockOff(G,W);W.scale.set(1,1,1);G.travel.end();W.rotation.y=PI/2;mark('free');await G.core.wait(.5);G.react.react('joy',{sound:null,bounce:false}); /* 카메라 쪽(정면)을 본 채 내려서 그대로 섬 */
    await G.core.wait(.6);st.boatGo={t:0};G.sound.sfx('event-sparkle',{gain:.5}); /* 둘이 다 내린 뒤에 배가 스르륵 떠올라 고리 너머로 작아지며 사라짐 */
    /* 도착 나레이션(RS-001)이 끝난 뒤에 거꾸리가 말을 검 */
    {const t0=G.clock.t;await G.core.until(()=>G.clock.t-t0>3.6&&!(G.sound.voiceBusy&&G.sound.voiceBusy()),9);}st.done=true;} /* 도착 안내 문구(5.2초)가 사라진 뒤 */
  /* ── 거꾸리 첫 대사 둘 ── */
  async function intro(){await scene(async()=>{mark('intro');ggMode='talk';await say('거꾸리',T.g1,5.4);await say('거꾸리',T.g2,4.6);ggMode='idle';},gg);G.state.setFlag(K.met,true);}
  /* ── ② 얼음 고리 던지기 ── */
  const ringGeo=new THREE.TorusGeometry(RING_R,.045,7,22);ringGeo.rotateX(PI/2);const ringMat=sbMat(new THREE.Color('#aadcff'));ringMat.transparent=true;ringMat.opacity=.82;ringMat.emissive=new THREE.Color('#3f8fd0');ringMat.emissiveIntensity=.35;
  const rings=new THREE.InstancedMesh(ringGeo,ringMat,5);rings.name='saturn-rings-toss';rings.frustumCulled=false;rings.userData.noMerge=true;rings.castShadow=false;add(rings);
  const RI=[0,1,2,3,4].map(()=>({on:false,p:new THREE.Vector3(),spin:0,tilt:0,s:1})),_m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_s=new THREE.Vector3(),_v=new THREE.Vector3();
  const putRings=()=>{RI.forEach((r,i)=>{if(r.on){_e.set(r.tilt,r.spin,0,'YXZ');_q.setFromEuler(_e);_s.setScalar(r.s);_m.compose(r.p,_q,_s);}else _m.makeScale(1e-4,1e-4,1e-4).setPosition(0,-50,0);rings.setMatrixAt(i,_m);});rings.instanceMatrix.needsUpdate=true;};
  const restY=i=>.19+0*i,setPegRing=i=>{const r=RI[i+1];r.on=true;r.p.set(PEGS[i][0],restY(i),PEGS[i][1]);r.tilt=.06;r.spin=i*1.3;r.s=1;};
  if(F[K.toss])PEGS.forEach((_,i)=>setPegRing(i));putRings();
  const spark=points(root,MOB?44:80,{map:dotTex,add:true,size:.2,grav:.15,drag:.9});keep.push(spark.pts);
  /* 다음 뿔 표시: 뿔 밑동 둘레의 민트 고리(안내 표시) */
  const tmark=new THREE.Mesh(new THREE.RingGeometry(.52,.66,28).rotateX(-PI/2),new THREE.MeshBasicMaterial({color:new THREE.Color('#5cc4b9'),transparent:true,opacity:.85,depthWrite:false,fog:false}));tmark.material.userData.noStorybook=true;tmark.position.y=.03;tmark.visible=false;tmark.userData.noMerge=true;G.ui.hint(tmark);add(tmark);
  const TS={on:false,i:0,ph:'idle',p:0,ct:0,miss:[0,0,0],fl:null,hold:false,n:0,log:[]};
  const pegDist=i=>Math.hypot(PEGS[i][0]-THROW[0],PEGS[i][1]-THROW[1]),tol=i=>.62+.24*Math.min(3,Math.floor(TS.miss[i]/2)); /* 같은 뿔을 두 번 놓칠 때마다 걸리는 범위를 넓힘 */
  const band=i=>{const d=pegDist(i),t=tol(i);return [Math.max(0,(d-t-D0)/DK),Math.min(1,(d+t-D0)/DK)];};
  const handPos=(W,out)=>{const R=W.getObjectByName('forearm.R');W.updateMatrixWorld(true);return R.localToWorld(out.set(0,-.24,.06));};
  let btn=null,bar=null,barFill=null,barBand=null;
  const tossDown=()=>{if(!TS.on||TS.ph!=='ready')return;const W=U0();TS.ph='charge';TS.ct=0;TS.p=0;if(btn)btn.classList.add('on');if(W){W.userData.action='뿌리기';W.userData.at=0;}G.sound.sfx('ui-click',{gain:.5});};
  const tossUp=()=>{if(btn)btn.classList.remove('on');if(!TS.on||TS.ph!=='charge')return;if(TS.ct<.12){TS.ph='ready';const W=U0();if(W){W.userData.action='서기';W.userData.at=0;}return;}throwRing(TS.p);};
  const onKey=e=>{if(e.code!=='KeyE'||e.repeat)return;if(e.type==='keydown')tossDown();else tossUp();};
  function tossUI(on){if(on&&!btn){const host=document.querySelector('.wlg')||document.body;btn=document.createElement('button');btn.id='wlToss';btn.type='button';btn.textContent='던지기';btn.setAttribute('aria-label','얼음 고리 던지기 — 누르고 있다가 떼기');
      bar=document.createElement('div');bar.id='wlTossBar';bar.setAttribute('aria-hidden','true');barBand=document.createElement('b');barFill=document.createElement('i');bar.append(barFill,barBand);host.append(bar,btn);
      btn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();try{btn.setPointerCapture(e.pointerId);}catch(_){}tossDown();});['pointerup','pointercancel'].forEach(k=>btn.addEventListener(k,e=>{e.preventDefault();e.stopPropagation();tossUp();}));
      btn.addEventListener('keydown',e=>{if((e.code==='Space'||e.code==='Enter')&&!e.repeat){e.preventDefault();tossDown();}});btn.addEventListener('keyup',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();tossUp();}});
      window.addEventListener('keydown',onKey);window.addEventListener('keyup',onKey);}
    else if(!on&&btn){window.removeEventListener('keydown',onKey);window.removeEventListener('keyup',onKey);btn.remove();bar.remove();btn=bar=barFill=barBand=null;}}
  function throwRing(p){const W=U0();if(!W)return;const i=TS.i,dx=PEGS[i][0]-THROW[0],dz=PEGS[i][1]-THROW[1],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L,d=D0+DK*p,hit=Math.abs(d-L)<tol(i),h0=handPos(W,_v).clone();
    TS.n++;TS.ph='fly';TS.fl={t:0,dur:1.25+.13*d,from:h0,to:new THREE.Vector3(hit?PEGS[i][0]:THROW[0]+ux*d,hit?PEGH+.12:.07,hit?PEGS[i][1]:THROW[1]+uz*d),peak:1.2+.2*d,hit,ux,uz,d,i};TS.log.push([i,+p.toFixed(3),hit?1:0]);
    G.sound.sfx('jump',{gain:.45});G.sound.sfx('event-whoosh',{gain:.3});W.userData.action='서기';W.userData.at=0;mark('throw1');}
  function tickToss(dt,t,W){const U=W.userData,r=RI[0],i=Math.min(2,TS.i);
    if(TS.on){tmark.visible=TS.i<3&&G.ui.hintsVisible();if(TS.i<3){tmark.position.set(PEGS[i][0],.03,PEGS[i][1]);tmark.scale.setScalar(1+.08*Math.sin(t*4));}
      if(TS.ph==='ready'||TS.ph==='charge'){W.rotation.y+=Math.atan2(Math.sin(Math.atan2(PEGS[i][0]-W.position.x,PEGS[i][1]-W.position.z)-W.rotation.y),Math.cos(Math.atan2(PEGS[i][0]-W.position.x,PEGS[i][1]-W.position.z)-W.rotation.y))*Math.min(1,dt*8);}
      if(TS.ph==='charge'){TS.ct+=dt;const m=(TS.ct/FILL)%2;TS.p=m<1?m:2-m;}
      if(bar){const b=band(i);barFill.style.width=(TS.ph==='charge'?TS.p*100:0)+'%';barBand.style.left=(b[0]*100)+'%';barBand.style.width=((b[1]-b[0])*100)+'%';bar.style.opacity=TS.ph==='ready'||TS.ph==='charge'?1:.45;if(btn)btn.style.opacity=TS.ph==='ready'||TS.ph==='charge'?1:.5;}}
    const f=TS.fl;
    if(TS.ph==='fly'&&f){f.t+=dt;const u=Math.min(1,f.t/f.dur);r.on=true;r.p.lerpVectors(f.from,f.to,u);r.p.y+=4*f.peak*u*(1-u);r.spin+=dt*9;r.tilt=.35*Math.sin(f.t*5)*(1-u*.6);r.s=1;
      if(Math.random()<dt*16)spark.emit(r.p.x+(Math.random()-.5)*.3,r.p.y,r.p.z+(Math.random()-.5)*.3,0,.15,0,.7,[.75,.9,1]);
      if(u>=1){if(f.hit){TS.ph='drop';f.t=0;G.sound.sfx('event-ding',{pitch:1+.12*f.i});mark('hit'+(f.i+1));st.ggHop=t;if(U.setExpr)U.setExpr('기쁨');for(let k=0;k<(MOB?12:20);k++){const a=Math.random()*PI*2;spark.emit(r.p.x,r.p.y,r.p.z,Math.cos(a)*1.1,.6+Math.random()*1.2,Math.sin(a)*1.1,.9+Math.random()*.6,Math.random()<.5?[.8,.93,1]:[1,.96,.8]);}}
        else{TS.ph='slide';f.t=0;TS.miss[f.i]++;G.sound.sfx('land',{gain:.3});G.sound.sfx('event-tok',{gain:.35});}}}
    else if(TS.ph==='drop'&&f){f.t+=dt;const u=Math.min(1,f.t/.8),e=u*u;r.p.set(PEGS[f.i][0],lerp(PEGH+.12,restY(f.i),e),PEGS[f.i][1]);r.spin+=dt*(16-10*u);r.tilt=.3*(1-u)*Math.sin(f.t*14);
      if(Math.random()<dt*20)spark.emit(r.p.x+(Math.random()-.5)*.5,r.p.y,r.p.z+(Math.random()-.5)*.5,0,.5,0,.6,[.85,.95,1]);
      if(u>=1){setPegRing(f.i);r.on=false;TS.fl=null;TS.i++;TS.ph=TS.i>=3?'done':'wait';TS.wt=.45;if(U.setExpr)U.setExpr('기본');}}
    else if(TS.ph==='slide'&&f){f.t+=dt;const u=Math.min(1,f.t/.95),e=1-(1-u)*(1-u),k=f.t>.95?Math.max(0,1-(f.t-.95)/.3):1;r.p.set(f.to.x+f.ux*1.15*e,.07,f.to.z+f.uz*1.15*e);r.spin+=dt*6*(1-u);r.tilt=0;r.s=Math.max(.001,k);
      if(f.t>=1.25){r.on=false;r.s=1;TS.fl=null;TS.ph='wait';TS.wt=.2;}}
    else if(TS.ph==='wait'){TS.wt-=dt;if(TS.wt<=0)TS.ph='ready';}
    if(TS.on&&(TS.ph==='ready'||TS.ph==='charge'||TS.ph==='wait')){handPos(W,r.p);r.on=TS.ph!=='wait';r.tilt=.5;r.spin=W.rotation.y+(TS.ph==='charge'?TS.ct*3:0);r.s=1;}
    else if(!TS.on&&!f)r.on=false;
    spark.tick(dt);putRings();}
  async function toss(W,U){mark('toss');U.sceneLock=true;st.scene=true; /* 놀이 동안 원더룹은 던지는 자리에 서 있음(조이스틱 숨김 — 던지기 단추만) */
    const mv=[moveTo(W,THROW,Math.max(.6,Math.hypot(W.position.x-THROW[0],W.position.z-THROW[1])/3.4),true),moveTo(gg.root,GTOSS,1.2)];await Promise.all(mv);faceTo(gg.root,PEGS[1][0],PEGS[1][1]);faceTo(W,PEGS[0][0],PEGS[0][1]);
    const tcam=()=>{const k=pk(),pt=k>1.3;return {at:[-1.0,pt?1.3:.5,pt?-1.5:-1.9],from:[THROW[0]+(pt?11:7.2),pt?9.2:5.2,THROW[1]-(pt?4.6:4.3)]};}; /* 원더룹 뒤쪽 비스듬한 위에서 — 뿔 셋이 다 보이게(세로 화면은 더 높이·멀리) */G.view.hold(tcam);st.tcam=tcam;
    music('play');quest('얼음 고리를 걸어요 0/3');G.ui.toast(T.rule,4.5);TS.on=true;TS.i=0;TS.ph='ready';tossUI(true);
    await G.core.until(()=>{quest('얼음 고리를 걸어요 '+Math.min(3,TS.i)+'/3');if(G.view.req==null&&TS.ph!=='done'&&!st.tcamOff){/* 플레이어가 카메라를 만지면 그대로 둠 */st.tcamOff=true;}return TS.ph==='done';},600);
    TS.on=false;tossUI(false);tmark.visible=false;G.state.setFlag(K.toss,true);mark('tossDone');quest('');st.lastQ=null;music(null);
    /* 결과: 원더룹이 카메라 쪽을 보며 웃으며 폴짝(앞모습) */
    const fc=frontCam(W);faceTo(gg.root,G.view.camera.position.x,G.view.camera.position.z);G.view.hold(fc);await wait(.6);G.sound.sfx('mission-clear');G.react.react('hop',{sound:null,face:'기쁨'});st.ggHop=G.clock.t;await wait(1.5);G.react.react('hop',{sound:null,face:'기쁨'});st.ggHop=G.clock.t;await wait(1.3);
    if(G.view.req&&G.view.req.fn===fc)G.view.hold(null);if(U.setExpr)U.setExpr('기본');st.scene=false;U.sceneLock=false;
    await scene(async()=>{ggMode='talk';await say('거꾸리',T.g3,3.4);ggMode='idle';},gg);}
  /* ── ③ 앉아서 쉬기 ── */
  const cas=makeCassette();cas.g.scale.setScalar(1.7);cas.g.visible=false;cas.g.position.set(SLAB[0]-.55,STOP,SLAB[1]+.05);cas.g.rotation.y=-PI/2+.5;add(cas.g);
  /* 카세트에 담긴 지나온 길의 소리(초 — 켠 뒤): 달 떡방아 쿵·아기 토끼 웃음 → 화성 바람·삐삐와 둥둥 웃음 → 금성 생일 노래 조금·양 음매 → 딸깍, 조용 */
  const TAPE=[[0,'cassette-click',{}],[.5,'cassette-run',{gain:.6}],[1.9,'event-tok',{gain:.55}],[2.0,'land',{gain:.4}],[2.9,'event-tok',{gain:.55}],[3.0,'land',{gain:.4}],[3.9,'event-tok',{gain:.6}],[4.0,'land',{gain:.45}],[5.0,'voice-giggle',{pitch:1.5,gain:.55}],[6.1,'voice-giggle',{pitch:1.65,n:3,gain:.45}],
    [8.2,'event-wind',{gain:.7}],[9.6,'voice-giggle',{pitch:1.25,gain:.55}],[10.7,'voice-giggle',{pitch:.62,n:3,gain:.6}],[12.2,'event-wind',{gain:.55}],[14.6,'cassette-run',{gain:.4}],
    [15.4,'tune-birthday',{phrase:0,gain:.6}],[18.6,'tune-birthday',{phrase:3,gain:.55}],[21.6,'event-baa',{pitch:1.1,gain:.5}],[22.7,'event-baa',{pitch:.9,gain:.45}],[24.6,'cassette-click',{}]];
  /* 카메라 다섯 구간(초, 보는 자리 from · 보는 점 at) — 사이는 부드럽게 이어 감 */
  const CC=[SLAB[0]+.3,STOP+.6,(HS[1]+GS[1])/2],EH=[ENC_D.x/Math.hypot(ENC_D.x,ENC_D.z),ENC_D.z/Math.hypot(ENC_D.x,ENC_D.z)];
  const restKeys=()=>{const k=pk(),pt=k>1.3,m=pt?1.5:1,F3=[CC[0]-EH[0]*8.5*m,pt?2.9:2.5,CC[2]-EH[1]*8.5*m],E3=[F3[0]+ENC_D.x*40,F3[1]+ENC_D.y*40-(pt?4.4:3.9),F3[2]+ENC_D.z*40],SCP=[SC[0],SR*.99,SC[2]];return [
    [0,[CC[0]-4.3*m,1.0,CC[2]+3.5*m],[CC[0],pt?1.25:.95,CC[2]]],[7.5,[CC[0]-3.3*m,1.25,CC[2]+4.5*m],[CC[0],pt?1.25:.95,CC[2]]],                       /* 1 둘의 옆모습(조금 앞쪽에서 — 정옆이면 거꾸리가 원더룹을 가림) */
    [10.5,[CC[0]-4.6*m,1.5,CC[2]-2.6*m],[CC[0]+6,1.0,CC[2]+3]],[17,[CC[0]-6*m,2.1,CC[2]-4.2*m],[CC[0]+40,3.2,CC[2]+26]],                               /* 2 끝없는 고리 얼음 들판과 작아진 해 */
    [19.5,F3,E3],[24.5,[F3[0]-EH[0]*1.6,F3[1]+.4,F3[2]-EH[1]*1.6],[E3[0],E3[1]+.7,E3[2]]],                                                                 /* 3 엔켈라두스의 얼음 분수(둘의 뒷모습 너머) */
    [28,pt?[620,1500,SC[2]+40]:[170,840,SC[2]+60],[SC[0],pt?120:60,SC[2]]],[29.2,pt?[600,1480,SC[2]+40]:[150,830,SC[2]+60],[SC[0],pt?120:70,SC[2]]],        /* 4 높이 올라가 고리를 두른 토성 → 북극의 육각형 폭풍으로 다가감 */
    [31.6,pt?[-230,760,SC[2]+40]:[-370,530,SC[2]+40],SCP],[32.8,pt?[-250,740,SC[2]+40]:[-385,515,SC[2]+40],SCP],
    [36,[CC[0]-4.4*m,1.15,CC[2]-2.4*m],[CC[0],pt?1.2:.95,CC[2]]],[REST,[CC[0]-4.0*m,1.1,CC[2]-1.6*m],[CC[0],pt?1.2:.95,CC[2]]]];};                           /* 5 다시 둘에게(앞모습) */
  const RS={on:false,t:0,keys:null,ti:0,skip:false,chip:null,chipT:0};
  const restCam=()=>{const Kk=RS.keys,t=Math.min(REST,RS.t);let i=0;while(i<Kk.length-2&&t>Kk[i+1][0])i++;const A=Kk[i],Bk=Kk[i+1],w=ss(A[0],Bk[0],t);return {from:[0,1,2].map(j=>lerp(A[1][j],Bk[1][j],w)),at:[0,1,2].map(j=>lerp(A[2][j],Bk[2][j],w))};};
  const restTap=()=>{if(!RS.on||RS.t<10)return;if(!RS.chip){const b=document.createElement('button');b.id='wlRestSkip';b.type='button';b.textContent='건너뛰기 ▸';b.addEventListener('pointerdown',e=>{e.stopPropagation();});b.addEventListener('click',e=>{e.stopPropagation();RS.skip=true;});document.body.appendChild(b);RS.chip=b;}RS.chipT=3.5;};
  const restKey=e=>{if(!RS.on||RS.t<10||e.repeat)return;if(RS.chip&&(e.code==='Enter'||e.code==='KeyE'||e.code==='Escape'))RS.skip=true;else restTap();};
  async function rest(W,U){mark('rest');U.sceneLock=true;st.scene=true;
    /* 얼음 조각 옆으로 걸어가 폴짝 올라앉음 */
    await Promise.all([moveTo(W,[HS[0]+1.9,HS[1]-.3],Math.max(.6,Math.hypot(W.position.x-HS[0]-1.9,W.position.z-HS[1]+.3)/3.4),true),moveTo(gg.root,[GS[0]+1.9,GS[1]+.2],1.4)]);
    U.riding={y:W.position.y,carry:false};G.core.block('meteor',true);st.hints=G.ui.hintsVisible();G.ui.setHints(false);quest('');
    G.sound.sfx('jump',{gain:.6});await Promise.all([hop([W.position.x,W.position.y,W.position.z],[HS[0],STOP,HS[1]],.7,(x,y,z)=>{W.position.set(x,y,z);U.riding.y=y;}),hop([gg.root.position.x,0,gg.root.position.z],[GS[0],STOP,GS[1]],.8,(x,y,z)=>gg.root.position.set(x,y,z))]);
    W.rotation.y=-PI/2;gg.root.rotation.y=-PI/2;U.action='앉기';U.at=0;ggMode='sit';G.sound.sfx('land',{gain:.4});st.sitting=true;
    st.farMin=4200;RS.keys=restKeys();RS.t=0;RS.ti=0;RS.skip=false;RS.on=true;G.view.hold(restCam);window.addEventListener('pointerdown',restTap);window.addEventListener('keydown',restKey);
    await wait(1.2);cas.g.visible=true;cas.run(true);G.sound.sfx('event-pop',{gain:.5});music('rest');RS.t0=RS.t; /* 카세트를 꺼내 켬 */
    await G.core.until(()=>RS.skip||RS.t>=REST,REST+30);mark('restEnd');
    RS.on=false;window.removeEventListener('pointerdown',restTap);window.removeEventListener('keydown',restKey);if(RS.chip){RS.chip.remove();RS.chip=null;}
    if(G.view.req&&G.view.req.fn===restCam)G.view.hold(null);st.farMin=0;cas.run(false);cas.g.visible=false;music(null);
    /* 일어나 내려옴 */
    st.sitting=false;U.action='서기';U.at=0;ggMode='idle';G.sound.sfx('jump',{gain:.5});
    await Promise.all([hop([HS[0],STOP,HS[1]],[HS[0]-1.9,0,HS[1]-.6],.7,(x,y,z)=>{W.position.set(x,y,z);U.riding.y=y;}),hop([GS[0],STOP,GS[1]],[GS[0]-2.6,0,GS[1]-.5],.8,(x,y,z)=>gg.root.position.set(x,y,z))]);
    U.riding=null;G.core.block('meteor',false);G.ui.setHints(st.hints!==false);G.state.setFlag(K.sat,true);
    await Promise.all([moveTo(W,AFTER[0],1.0,true),moveTo(gg.root,AFTER[1],1.5)]);st.scene=false;U.sceneLock=false;} /* 섬 가운데로(둘이 남북으로 나란히 — 대화 카메라가 동·서의 트인 쪽에서 봄. 둘레 얼음 뿔이 카메라 앞을 가리지 않게) */
  /* ── ④ 발견 카드 ── */
  async function floatCard(){await scene(async()=>{ggMode='talk';await say('거꾸리',T.g4,4.4);ggMode='idle';},gg);
    const W=U0(),P=W.position,q=gg.root.position,k=pk(),pt=k>1.3,cx=(P.x+q.x)/2,cz=(P.z+q.z)/2,fc=()=>({at:[cx-3,pt?-1.6:-.9,cz],from:[cx+(pt?12:8.2),pt?3.0:2.2,cz+1.2]}); /* 동쪽에서 토성 쪽을 — 보는 점을 낮춰 둘이 화면 가운데쯤(아래 카드에 안 가림) */
    W.userData.sceneLock=true;faceTo(W,cx+9,cz+1.2);faceTo(gg.root,cx+9,cz+1.2);G.view.hold(fc);G.state.setFlag(K.float,true);G.sound.sfx('card-secret');mark('card');await G.ui.secret({kicker:'새 발견',title:T.cardT,text:T.card,vo:T.card,at:'bottom',lines:4});if(G.view.req&&G.view.req.fn===fc)G.view.hold(null);W.userData.sceneLock=false;await wait(.4);}
  /* ── ⑤ 거꾸리와 인사 ── */
  async function bye(W,U){await scene(async()=>{ggMode='talk';await say('거꾸리',T.g5,5.6);ggMode='idle';},gg);mark('bye');
    U.sceneLock=true;st.scene=true;boat.visible=true;boat.scale.setScalar(1);st.boatGo=null;st.boatIn={t:0};G.sound.sfx('event-sparkle',{gain:.5});
    await Promise.all([moveTo(W,BYEH,Math.max(.5,Math.hypot(W.position.x-BYEH[0],W.position.z-BYEH[1])/3.4),true),moveTo(gg.root,GGB,1.5)]);faceTo(W,DOCKB[0],DOCKB[1]);
    await G.core.until(()=>!st.boatIn,5);
    {const r=gg.root.position,q=boatStand(boat,0,0);G.sound.sfx('jump',{gain:.6});await hop([r.x,r.y,r.z],[q.x,q.y,q.z],.7,(x,y,z)=>gg.root.position.set(x,y,z));}st.ggBoat=true;ggMode='wave';G.sound.sfx('event-pop',{gain:.5});
    /* 옆에서: 원더룹 옆모습과 손 흔들며 멀어지는 거꾸리 → 배 쪽에서 돌아본 원더룹 앞모습(손 흔들기) */
    const P=W.position,k=pk(),pt=k>1.3,dn=Math.hypot(DOCKB[0]-P.x,DOCKB[1]-P.z)||1,dx=(DOCKB[0]-P.x)/dn,dz=(DOCKB[1]-P.z)/dn,
      camA=pt?()=>({at:[lerp(P.x,B.x,.8),1.1+.8*(B.y-BY),lerp(P.z,B.z,.8)],from:[P.x-dx*8.5+dz*1.4,4.4,P.z-dz*8.5-dx*1.4]}) /* 세로 화면(가로 시야가 좁음): 원더룹 뒤 위에서 — 아래에 손 흔드는 원더룹, 그 너머 위로 떠나는 배 */
        :()=>({at:[lerp(P.x,B.x,.45),1.2+.25*(B.y-BY),lerp(P.z,B.z,.45)],from:[P.x-.6,1.9,P.z+8]}); /* 가로 화면: 원더룹의 옆모습(조금 앞쪽) 너머로 떠나는 배 */
    U.action='손 흔들기';U.at=0;if(U.setExpr)U.setExpr('기쁨');G.view.hold(camA);await wait(.5);st.boatOut={t:0};G.sound.sfx('travel-depart',{gain:.5});await wait(2.9);
    const camB=()=>({at:[P.x,P.y+(pt?.75:1.0),P.z],from:[P.x-(pt?7.8:5.6),P.y+(pt?2.5:1.9),P.z+(pt?2.6:1.9)]});W.rotation.y=Math.atan2(-5.6,1.9);G.view.hold(camB,{snap:true});await wait(3.0); /* 반대쪽 구도로 바로 넘어감(섞으면 카메라가 반 바퀴 휘돌아 바닥을 훑었다) */
    if(G.view.req&&G.view.req.fn===camB)G.view.hold(null);U.action='서기';U.at=0;if(U.setExpr)U.setExpr('기본');gg.root.visible=false;boat.visible=false;st.ggBoat=false;st.boatOut=null;
    G.state.setFlag(K.clear,true);G.state.saveAfter(ZID,{time:0});mark('clear');st.scene=false;U.sceneLock=false;}
  /* ── 붉은 소용돌이 빛(목성의 붉은 폭풍이 끌어당김) ── 점 묶음(나선으로 감겨 오르는 빛 알갱이) + 옅은 빛 기둥. 그리기 2(보일 때만) */
  const storm=(()=>{const g=new THREE.Group();g.name='red-storm';g.visible=false;root.add(g);const N=MOB?150:260,pos=new Float32Array(N*3),sa=new Float32Array(N*4),r=rng('space-saturn:storm');for(let i=0;i<N;i++)sa.set([(i%3)*PI*2/3+(r()-.5)*.5,r(),.85+r()*.3,r()],i*4); /* 세 가닥으로 감겨 오름 */
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('sa',new THREE.BufferAttribute(sa,4));
    const U1={uT:{value:0},uK:{value:0},uH:{value:8},uSc:{value:800},uMap:{value:dotTex}};
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,uniforms:U1,
      vertexShader:'uniform float uT,uH,uSc,uK;attribute vec4 sa;varying float vA,vS;void main(){float hh=fract(sa.y+uT*.16);float ang=sa.x+uT*3.1+hh*8.5;float rad=(.55+1.05*hh*hh)*sa.z;vec3 p=vec3(cos(ang)*rad,hh*uH,sin(ang)*rad);'+
        'vA=uK*smoothstep(0.,.08,hh)*(1.-smoothstep(.72,1.,hh));vS=sa.w;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(.09+.12*sa.w)*uSc/max(1.,-mv.z);}',
      fragmentShader:'uniform sampler2D uMap;varying float vA,vS;void main(){vec4 c=texture2D(uMap,gl_PointCoord);if(c.a<.02)discard;gl_FragColor=vec4(mix(vec3(.95,.2,.1),vec3(1.,.55,.18),vS*vS)*c.a*vA*.8,1.);}'});
    m.userData.noBend=true;const pts=new THREE.Points(geo,m);pts.frustumCulled=false;pts.userData.noMerge=true;pts.renderOrder=3;g.add(pts);
    const bm=new THREE.MeshBasicMaterial({map:gradTex(4,64,(u,v)=>[236,70,44,Math.pow(Math.sin(v*PI),1.4)*.5]),transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,opacity:0});bm.userData.noBend=true;bm.userData.noStorybook=true;
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(1.25,.5,8,20,1,true).translate(0,4,0),bm);beam.frustumCulled=false;beam.userData.noMerge=true;beam.renderOrder=2;g.add(beam);
    return {g,set(k){U1.uK.value=k;bm.opacity=k*.18;g.visible=k>.01;},tick(t,cam){U1.uT.value=t;U1.uSc.value=innerHeight*Math.min(window.devicePixelRatio||1,MOB?1.25:2)/(2*Math.tan(cam.fov*PI/360));beam.rotation.y=t*.9;}};})();
  const oJup=board.add({map:canvasTex(512,jupiterMap,256),rep:[7,4],ring:false,seg:MOB?[40,26]:[56,36]});oJup.g.visible=false;
  {/* 붉은 점(그림의 경도 0.17·남위 18°)이 우리가 보는 면의 위쪽에 오게: 줄무늬는 가로 그대로 두고 위아래를 뒤집은 뒤(가는 방향 축으로 반 바퀴) 경도를 돌림 — 목표 방향에 가장 가까운 각을 고름 */
    const s0=new THREE.Vector3(-.458,-.309,.833),tg=new THREE.Vector3(-.93,.309,.2).normalize(),qx=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),PI),q=new THREE.Quaternion(),v=new THREE.Vector3();let best=-9,ba=0;
    for(let a=0;a<PI*2;a+=.02){q.setFromAxisAngle(new THREE.Vector3(0,1,0),a).premultiply(qx);const d=v.copy(s0).applyQuaternion(q).dot(tg);if(d>best){best=d;ba=a;}}oJup.body.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),ba).premultiply(qx);}
  const zip=points(root,MOB?90:160,{map:dotTex,add:true,size:.42,grav:0,drag:0});
  const _d=new THREE.Vector3(),_q2=new THREE.Quaternion(),SL=new THREE.Vector3(-.9,.3,.3).normalize(); /* 목성은 우리 쪽 면이 밝게(빛이 우리 뒤에서) */
  const setSat=dx=>{oSat.g.position.x=SC[0]-dx;st0.ringMesh.position.x=SC[0]-dx;st0.ring.uniforms.uSC.value.x=SC[0]-dx;};
  function departStorm(W,U){if(st.dep)return;mark('storm');st.lastQ=null;G.ui.setQuest('');G.goal.set(null);import('./jupiter.js').catch(()=>{});
    const P0=W.position.clone();W.rotation.y=PI/2;let flyU=0,lastW=null,zAcc=0,wi=-1,hid=false,sv=0,lastS=null;st.farMin=5600;
    const pathF=u=>({x:P0.x+18*ss(0,.3,u)+520*ss(.2,1,u),y:P0.y+1.1+55*ss(0,.34,u)+205*ss(.25,1,u),z:P0.z+8*ss(.1,.5,u)});
    /* 카메라 키: [비행 진행, 가는 방향 기준(0 = 앞쪽에서 돌아봄), 위아래, 거리] — 달 → 화성 차례: 앞옆 낮게(빙글 도는 얼굴) → 등 뒤 위에서 내려다봄(멀어지는 얼음 섬·고리·토성)
       → 옆에서 나란히(별빛이 휙휙) → 어깨 너머로 다가오는 목성 → 마지막: 원더룹이 뒤돌아 카메라를 보고(앞모습) 그 뒤로 목성이 화면을 덮음 */
    const CK=[[0,.95,.02,5.6],[.1,.95,.02,5.6],[.15,PI+.4,.92,9.5],[.31,PI+.4,.92,10.5],[.37,PI/2,.08,6.8],[.56,PI/2,.08,6.8],[.62,PI+.42,.2,5.6],[.74,PI+.38,.16,6.2],[.84,PI+.3,.05,5.4],[1,PI+.22,.03,4.8]];
    const spin=u=>PI*2*ss(.0,.13,u)+PI*ss(.5,.62,u); /* 소용돌이에 한 바퀴 빙글 → 중간부터 뒤돌아(카메라 쪽) */
    const carrier={hang:false,pose:{grab:'팔 벌리기',fly:u=>u<.4?'팔 벌리기':'둥실'},lift:T2=>1.1*ss(2.4,3.75,T2),stop(){storm.set(0);zip.pts.visible=false;},dispose(){},
      late(dt,t,s2){if(s2.phase==='fly')W.rotation.y=s2.face+spin(flyU);else W.rotation.y=PI/2+PI*2*ss(2.6,3.75,s2.t)*0;},
      tick(dt,t,s2,wp){lastS=s2;const cam=G.view.camera,u=flyU,T2=s2.t;
        /* 내려와 감쌈 → 끌어올림 */
        storm.set(s2.phase==='fly'?.9-.25*ss(.8,1,u):ss(.1,1.6,T2)*.9);storm.g.position.set(wp.x,wp.y-.35+(s2.phase==='fly'?0:15*(1-ss(0,2.3,T2))),wp.z);storm.tick(t,cam);
        zip.tick(dt);{const v=lastW?Math.hypot(wp.x-lastW.x,wp.y-lastW.y,wp.z-lastW.z)/Math.max(dt,1e-3):0;sv+=(v-sv)*Math.min(1,dt*6);if(lastW&&u>.22&&u<.985&&v>4){const dx=wp.x-lastW.x,dy=wp.y-lastW.y,dz=wp.z-lastW.z,Ln=Math.hypot(dx,dy,dz)||1,ux=dx/Ln,uy=dy/Ln,uz=dz/Ln;zAcc+=dt*Math.min(MOB?46:90,v*1.6);
            while(zAcc>=1){zAcc-=1;const a=Math.random()*PI*2,r=2.2+Math.random()*7.5,f=v*(.35+Math.random()*1.1),c=Math.random()<.5?[1,.82,.7]:[1,.95,.85];zip.emit(wp.x+ux*f-uz*Math.cos(a)*r,wp.y+uy*f+Math.sin(a)*r*.8+.6,wp.z+uz*f+ux*Math.cos(a)*r,0,0,0,1.5,c);}}
          lastW=lastW||new THREE.Vector3();lastW.set(wp.x,wp.y,wp.z);}
        /* 토성이 뒤로 멀어짐 */
        setSat(2700*Math.pow(ss(.3,.86,u),1.3));if(u>.42&&!hid){hid=true;[island,rings,oEnc.g,spark.pts,tmark].forEach(o=>{o.visible=false;});st.hid=true;}
        /* 목성: 가는 쪽 하늘의 한 방향에 박혀 있다가 다가갈수록 커져 화면을 압도(토성보다 크게 — 끝 반지름 약 44°), 붉은 점이 우리 쪽 */
        {const on=u>.4,g=oJup.g;g.visible=on;if(on){const pt=cam.aspect<1,pp=ss(.2,1,u),TF=pt?.37:.76,thF=Math.atan(TF),th=Math.atan(TF/(1+26*(1-pp)))*ss(.4,.48,u),
              /* 마지막 카메라(가는 방향에서 0.22 왼쪽을 봄)에서 붉은 점(목성 가운데에서 오른쪽 0.2·위 0.31 × 반지름)이 화면 안(가로 화면: 오른쪽 12°·위 9°, 세로 화면: 가운데 조금 오른쪽·위 8°)에 오게 목성 가운데 방향을 정함 */
              psi=lerp(-.4,-.22+(pt?.1:.21)-.2*thF,ss(.68,.9,u)),el=lerp(.1,(pt?.06:.1)-.309*thF,ss(.7,.95,u)),c=board.D;
            _d.set(Math.cos(psi)*Math.cos(el),Math.sin(el),Math.sin(psi)*Math.cos(el));g.parent.getWorldQuaternion(_q2).invert();g.position.copy(_d).applyQuaternion(_q2).multiplyScalar(c);g.quaternion.copy(_q2);g.scale.setScalar(c*Math.sin(th));oJup.U.uL.value.copy(SL);oJup.halo.quaternion.copy(cam.quaternion);st.jupTh=th;}}
        st.sailU=u;if(Math.floor(T2/2.1)!==wi){wi=Math.floor(T2/2.1);if(T2>2.4)G.sound.sfx('event-wind',{gain:.5});}}};
    G.sound.sfx('event-whirl',{gain:.9});G.sound.sfx('event-sparkle',{gain:.7});
    const dep=departure({G,root,WL:W,groundY:()=>0,mob:MOB,fly:13,carrier,camk:CK,after:3.6+.75+.06+3.1,path:pathF,lookAt:[0,0],lookEnd:[.31,.38],
      pre:T2=>[.2,6.4-1.2*ss(1.2,3.4,T2)],onFly:u=>{flyU=u;},
      onEnd:async()=>{G.travel.note('phase','map');RIDE.pending={from:ZID,storm:true};const mp=await G.travel.mapFor(SPACE,ZID,'space-jupiter',F);
        G.travel.note('phase','veil');G.travel.arrive();const veil=dustVeil(STORM_VEIL);G.sound.sfx('event-whoosh',{gain:1});await veil.cover(.75);G.travel.mark('veil');st.depTick=null;st.depLate=null;dep.stop();
        try{if(window.wlZone)await window.wlZone.go('space-jupiter');}catch(e){console.error(e);}mp.remove();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));veil.clear(1.5);}});
    st.dep=dep;st.depTick=dt=>dep.tick(dt,G.clock.t);st.depLate=dt=>dep.late(dt,G.clock.t);}
  /* ── 전체 흐름: 저장된 자리 다음부터 ── */
  async function flow(){if(st.flow)return;st.flow=true;const W=U0(),U=W.userData;mark('flow');
    try{if(!F[K.met])await intro();if(!F[K.toss])await toss(W,U);if(!F[K.sat])await rest(W,U);if(!F[K.float])await floatCard();
      if(!F[K.clear]){await bye(W,U);await wait(.7);departStorm(W,U);}}catch(e){console.error(e);}}
  function update(dt,t){const W=U0();if(!W)return;const U=W.userData,cam=G.view.camera;st.t+=dt;mark('start');
    board.tick(dt,t,cam);{const pt=cam.aspect<1,w=RS.on?ss(8.5,11,RS.t)*(1-ss(17.5,19.5,RS.t)):0; /* 쉬기 둘째 구간: 아주 작아진 해가 들판 위에 */
      const sx=lerp(pt?-.5:-.7,pt?.2:.34,w),sy=lerp(pt?.86:.8,pt?.5:.52,w);board.place(board.sunGlow,sx,sy,lerp(pt?.6:.5,.42,w));board.place(board.sun,sx,sy,lerp(pt?.26:.22,.16,w));} /* 토성에서 보는 해는 아주 작다(지구에서의 약 1/10) */
    if(st0.ring){st0.ring.uniforms.uT.value=t;const fk=ss(40,170,cam.position.y);st0.ring.uniforms.uFly.value=fk;hexCap.visible=cam.position.y>60;}
    plume.uniforms.uT.value=t;plume.uniforms.uSc.value=innerHeight*Math.min(window.devicePixelRatio||1,MOB?1.25:2)/(2*Math.tan(cam.fov*PI/360));
    if(!st.ggBoat&&!st.boatIn&&!st.boatOut)boat.rotation.set(Math.sin(t*1.3)*.02,0,Math.sin(t*1.1)*.03);
    if(st.boatGo){const b=st.boatGo;b.t+=dt;const u=Math.min(1,b.t/2.6),e=u*u;boat.position.set(B.x-9*e,B.y+3.2*e+Math.sin(t*1.7)*.05,B.z+5*e);boat.scale.setScalar(Math.max(.001,1-ss(.35,1,u)));if(u>=1){boat.visible=false;st.boatGo=null;}}
    if(st.boatIn){const b=st.boatIn;b.t+=dt;const u=Math.min(1,b.t/2.4),e=1-Math.pow(1-u,2.2);B.x=DOCKB[0];B.y=BY;B.z=DOCKB[1];boat.position.set(lerp(B.x-9,B.x,e),lerp(B.y+3.4,B.y,e)+Math.sin(t*1.7)*.05*(1-u),lerp(B.z+5,B.z,e));boat.scale.setScalar(Math.max(.001,ss(0,.5,u)));if(u>=1){st.boatIn=null;G.sound.sfx('land',{gain:.4});}}
    if(st.boatOut){const b=st.boatOut;b.t+=dt;const u=Math.min(1,b.t/5.6),e=u*u*(3-2*u)*u;B.x=DOCKB[0]-16*e;B.y=BY+.4*ss(0,.12,u)+8*e;B.z=DOCKB[1]+9*e;boat.position.set(B.x,B.y+Math.sin(t*1.7)*.05,B.z);boat.rotation.set(Math.sin(t*1.3)*.04,-.5*ss(0,.4,u),Math.sin(t*1.1)*.06);boat.scale.setScalar(Math.max(.001,1-ss(.7,1,u)));}
    if(st.ggBoat){boatStand(boat,0,0,gg.root.position);faceTo(gg.root,W.position.x,W.position.z);gg.root.scale.setScalar(boat.scale.x);}
    else if(st.ggHop!=null){const k=t-st.ggHop;gg.root.position.y=(st.sitting?STOP:0)+(k<.5?Math.sin(k/.5*PI)*.45:0);if(k>=.5)st.ggHop=null;}
    const a=st.arr;if(a){if(!started){started=true;lockOn(G,W);U.action='서기';U.at=0;if(U.setExpr)U.setExpr('반짝 신남');G.travel.note('phase','arrive');G.travel.landIn(D);const C=G.controls.input.cam;if(C){C.yaw=PI/2-.42;C.pitch=.03;C.dist=9;a.cu=C.user;}U.riding.snap=true;}
      if(a.ph==='down'){a.t+=dt;const u=Math.min(1,a.t/D),e=1-Math.pow(1-u,2.2);B.x=lerp(DOCKB[0]+FROM[0],DOCKB[0],e);B.y=lerp(FROM[1],BY,e)+Math.sin(t*1.7)*.05*(1-u);B.z=lerp(FROM[2],DOCKB[1],e);
        boat.position.set(B.x,B.y,B.z);boatStand(boat,HX,-BSIDE,W.position);U.riding.lookOff=[-(HX+GX)/2,BSIDE];U.riding.y=W.position.y;W.rotation.y=PI/2;boatStand(boat,-GX,BSIDE,gg.root.position);gg.root.rotation.y=PI/2; /* 발은 배 겉면에 딱(cloudfolk boatStand) */ggMode='idle';
        if(u>=1){a.ph='off';land(W,U);}}}
    else if(!st.done&&!started){st.done=true;}
    gg.tick(dt,t,ggMode);cas.tick(dt);
    if(RS.on){RS.t+=dt;if(RS.chip){RS.chipT-=dt;RS.chip.style.opacity=RS.chipT>0?1:0;RS.chip.style.pointerEvents=RS.chipT>0?'auto':'none';}
      if(G.view.req==null||G.view.req.fn!==restCam)G.view.hold(restCam,{snap:true}); /* 쉬는 동안은 정해진 카메라(끌어도 다시 잡음) */
      if(RS.t0!=null){const tt=RS.t-RS.t0;while(RS.ti<TAPE.length&&TAPE[RS.ti][0]<=tt){const q=TAPE[RS.ti++];G.sound.sfx(q[1],q[2]);}}}
    tickToss(dt,t,W);
    if(st.depTick)st.depTick(dt);
    /* 흐름 시작: 도착 연출이 끝났거나(이동해 옴) 바로 열었을 때 첫 화면이 닫힌 뒤 */
    if(st.done&&!st.flow&&!st.arr&&st.t>1.2&&!(G.front.frontShown&&G.front.frontShown())&&!G.dialog.talking()){if(!F[K.clear])flow();else st.flow=true;}
    /* 끝낸 뒤 다시 오면: 섬 가운데 붉은 빛에 들어서면 다시 목성으로 */
    if(F[K.clear]&&!st.dep&&!st.scene&&st.flow&&st.T.clear==null){storm.set(.75);storm.g.position.set(PORT[0],-.2,PORT[1]);storm.tick(t,cam);quest('붉은 빛을 타고 목성으로');
      if(!st.goalOn){st.goalOn=true;G.goal.set({at:PORT,y:0,label:'목성행 붉은 빛',h:2.2,beam:false});}
      if(Math.hypot(W.position.x-PORT[0],W.position.z-PORT[1])<1.15&&!U.riding)departStorm(W,U);}}
  function lateUpdate(dt){const a=st.arr;if(a&&started)camHome(G,dt,PI/2-.42,.03,a.ph==='down'?9:9.5,a,1.6); /* 원더룹 뒤 옆에서 토성 쪽을(낮게 — 커다란 토성과 발밑 고리 들판이 한 화면에) */
    if(st.depLate)st.depLate(dt);}
  return {name:'토성 고리',kind:'outdoor',start:{compass:true},world:null,
    spawn:{x:HERO[0],z:HERO[1],ry:-PI/2},
    areas:{field:{bounds:[-6.6,6.6,-6.6,6.6],obstacles,camera:{target:[0,1,0],dist:9,polar:[.45,1.35],azimuth:null,start:[2.6,.95],minDist:3,maxDist:30}}},
    platforms:[{r:[SLAB[0]-1.45,SLAB[0]+1.45,SLAB[1]-.95,SLAB[1]+.95],top:STOP}],
    sun:{dir:new THREE.Vector3(...KEY.sunDir).normalize(),shadow:14,follow:true},
    sky:SK,far:2400,get farMin(){return st.farMin||1400;} /* 엔켈라두스(1050m)까지 — 쉬기 넷째 구간·떠날 때는 더 멀리 */,ambience:'space',rim:.2,groundY:()=>0,ground:[island],keepOut:keep,
    state:()=>({arr:st.arr?st.arr.ph:null,done:st.done,flow:st.flow,scene:st.scene,T:{...st.T},t:+G.clock.t.toFixed(2),toss:{on:TS.on,i:TS.i,ph:TS.ph,p:+TS.p.toFixed(3),band:TS.i<3?band(TS.i):null,n:TS.n,miss:[...TS.miss],log:TS.log.slice(-12)},rest:{on:RS.on,t:+RS.t.toFixed(2)},sailU:st.sailU||0,dep:st.dep?st.dep.state.phase:null,jupTh:st.jupTh||0,mus:st.musLog||[]}),
    spots:{hero:HERO,gg:GGAT,dock:DOCKB,throw:THROW,pegs:PEGS,slab:SLAB,port:PORT},
    dbgRest(t){RS.t=t;},dbgDown:tossDown,dbgUp:tossUp,dbgStorm(){const W=U0();if(W)departStorm(W,W.userData);},
    update,lateUpdate,dispose(){board.dispose&&board.dispose();tossUI(false);if(RS.chip)RS.chip.remove();window.removeEventListener('pointerdown',restTap);window.removeEventListener('keydown',restKey);const W=U0();if(W){W.scale.set(1,1,1);if(st.arr){try{lockOff(G,W);}catch(e){}}if(RS.on||st.sitting){W.userData.riding=null;G.core.block('meteor',false);G.ui.setHints(true);}W.userData.sceneLock=false;}}};}
