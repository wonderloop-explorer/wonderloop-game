/* 무한 우주 ④ 붉은 폭풍(목성) 자리 — 임시 구역(2026-11-24). 토성 쉼터에서 붉은 소용돌이 빛에 끌려 오면(saturn.js departStorm → RIDE.pending.storm)
   목성 구름 위에 사뿐히 내려앉고 '다음 이야기 준비 중' 카드로 끝난다. STAGE 4 본편은 기획서대로 따로 만든다(이 파일을 바꿔 끼움).
   땅: 줄무늬 구름 바닥 한 장(크림·살구·산호 띠가 소용돌이처럼 휨 — 정점 색) + 둘레 구름 덩이(한 덩어리). 하늘: 붉은 폭풍 속(산호빛 안개).
   도착: whirl-lift cloudArrival(금성 도착과 같은 연출 — 천천히 내려와 사뿐, 이동 테마 해결 화음 = 내려앉는 순간) → 안내 카드.
   그리기(구역 것): 구름 바닥 1 · 구름 덩이 1 */
import * as THREE from 'three';
import {PI,QUALITY,rng} from '../../01-textures.js';
import * as G from '../../game/index.js';
import {sbMat} from '../../game/storybook.js';
import {RIDE} from './meteor-ride.js';
import {lump,M4,sph} from './martians.js';
import {cloudArrival} from './whirl-lift.js';
import SPACE from '../../worlds/infinite-space.js';
const ZID='space-jupiter',TMP={card:'[임시] 붉은 폭풍 이야기는 다음에 이어져요.' /* SPC-RS-010 글자만 */};
export function build({root}){const MOB=QUALITY.tier==='mobile',keep=[],R0=rng('space-jupiter:cloud'),RR=(a,b)=>a+R0()*(b-a);
  G.profile.setup({world:SPACE.id,cards:SPACE.cards});
  const add=o=>{root.add(o);keep.push(o);return o;};
  const KEY={top:'#b9573f',horizon:'#f0b48e',hemi:'#ffe6d2',ground:'#c8785a',hemiI:.86,sun:'#fff0d8',sunI:.6,sunDir:[5,-6,3],fill:.34,fog:'#ecaa88',fogNear:9,fogFar:46,stars:0};
  const SK=G.sky.sky({parent:root,keys:[KEY,KEY,KEY],t:0,nStars:0});
  /* 구름 바닥: 소용돌이처럼 휜 띠(가운데에서 바깥으로 색이 번갈아) */
  {const N=MOB?40:56,geo=new THREE.PlaneGeometry(90,90,N,N);geo.rotateX(-PI/2);const p=geo.attributes.position,col=new Float32Array(p.count*3),C=['#f6e2c6','#f2c9a2','#f7ead2','#eaa07e','#f4d6b4','#e58a6c'].map(c=>new THREE.Color(c)),c=new THREE.Color();
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),d=Math.hypot(x,z),a=Math.atan2(z,x),k=(d*.22+a*1.3+Math.sin(d*.31+a*2)*.6)%C.length,q=(k+C.length)%C.length,i0=Math.floor(q),f=q-i0,w=f<.7?0:(f-.7)/.3;
      c.copy(C[i0]).lerp(C[(i0+1)%C.length],w*w*(3-2*w));col.set([c.r,c.g,c.b],i*3);p.setY(i,d>7?Math.sin(x*.5)*Math.cos(z*.45)*.18*Math.min(1,(d-7)/6):0);}
    geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();const m=sbMat(new THREE.Color('#ffffff'));m.vertexColors=true;const g=new THREE.Mesh(geo,m);g.name='jupiter-cloud-floor';g.receiveShadow=true;g.userData.noMerge=true;add(g);var ground=g;}
  {const Lp=[],CC=['#f8e6cc','#f1c6a0','#ee9f80','#f6d8b8'];for(let i=0;i<(MOB?26:40);i++){const a=RR(0,PI*2),d=RR(9,30),r=RR(.8,2.4);for(let k=0;k<3;k++)Lp.push([sph(r*RR(.6,1),8,6).applyMatrix4(M4([Math.cos(a)*d+RR(-1,1)*r,r*.35+RR(0,.5)*r,Math.sin(a)*d+RR(-1,1)*r],[0,0,0],[1,.62,1])),CC[(i+k)%4]]);}
    const me=lump(Lp,true,1.6);me.name='jupiter-cloud-puffs';me.frustumCulled=false;add(me);}
  const pend=RIDE.pending&&RIDE.pending.storm?RIDE.pending:null;if(pend)RIDE.pending=null;
  const st={t:0,done:!pend,carded:false,T:{}},mark=k=>{if(st.T[k]==null)st.T[k]=+G.clock.t.toFixed(2);};let arr=null;
  const U0=()=>G.view.camera&&G.mission.hero&&G.mission.hero();
  const card=()=>{if(st.carded)return;st.carded=true;mark('card');G.ui.notice({kicker:'붉은 폭풍',title:'다음 이야기 준비 중',text:TMP.card,icon:SPACE.icons.map()});};
  function update(dt,t){const W=U0();if(!W)return;st.t+=dt;mark('start');
    if(pend&&!arr&&!st.done){arr=cloudArrival({G,root,WL:W,groundY:()=>0,mob:MOB,doneAt:3.6,onDone(){st.done=true;mark('free');}});mark('arrive');}
    if(arr&&!arr.state.done)arr.tick(dt,t);
    if(st.done&&!st.carded&&st.t>1.5&&!(G.front.frontShown&&G.front.frontShown()))card();}
  function lateUpdate(dt){if(arr&&!arr.state.done)arr.late(dt);}
  return {name:'붉은 폭풍',kind:'outdoor',start:{compass:true},world:null,
    spawn:{x:0,z:0,ry:PI/2},
    areas:{field:{bounds:[-6.5,6.5,-6.5,6.5],obstacles:[],camera:{target:[0,1,0],dist:9,polar:[.45,1.35],azimuth:null,start:[2.6,.95],minDist:3,maxDist:30}}},
    sun:{dir:new THREE.Vector3(...KEY.sunDir).normalize(),shadow:14,follow:true},
    sky:SK,far:120,ambience:'wind',charFog:.2,groundY:()=>0,ground:[ground],keepOut:keep,after:()=>({time:0}),
    state:()=>({done:st.done,carded:st.carded,landed:!!(arr&&arr.state.landed),T:{...st.T},t:+G.clock.t.toFixed(2)}),
    update,lateUpdate,dispose(){if(arr&&arr.dispose)arr.dispose();const W=U0();if(W){W.scale.set(1,1,1);W.userData.riding=null;G.core.block('meteor',false);}}};}
