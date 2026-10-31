/* 원더룹 탈: 도토리 깍정이 (요정의 숲) — 기준 그림 wonderloop-studio/fairy-forest 탈 시트(2026-10-31)
   비늘 무늬 깍정이가 머리 윗부분을 덮고, 이마 높이를 크림 띠가 한 바퀴 두르고, 꼭대기에 짧은 나무꼭지,
   띠 높이 귀 위쪽 양옆에 장식용 잎맥 날개 두 장(날지 못함). 턱을 감싸지 않고 귀도 밖에 둔다.
   머리카락은 탐험 모자처럼 깍정이 안쪽만 눌러 넣는다(06 pressHair 3) → 띠 아래로 지그재그 앞머리·옆·뒷머리가 보인다.
   좌표는 머리(head 뼈) 기준. 깍정이 안쪽 모양(PROF)은 회전체 모양 그대로이고, 머리 눌림이 같은 값을 쓴다.
   탈 교체 약속(06): build()가 {g, parts, profile, top} 를 돌려주고, 06이 hoodParts(아틀라스 교체 영역)에 넣고 hw 번호를 붙인다. */
import * as THREE from 'three';
import {PI,lathe} from '../01-textures.js';
// 깍정이 바깥 모양 [반지름, 높이] — 테두리(0)에서 꼭대기까지, 정수리를 넉넉히 덮는 둥근 지붕
const PROF=[[.47,0],[.468,.06],[.452,.13],[.415,.2],[.355,.26],[.27,.305],[.16,.335],[0,.345]];
// 날개 그림: 끝이 뾰족한 잎 모양, 연둣빛 반투명 막 + 가운데 큰 맥과 갈래 맥, 노란 테두리 (난수 없이 늘 같은 그림, 256×256 → 아틀라스 층)
function wingCanvas(){const S=256,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');g.clearRect(0,0,S,S);
  const leaf=()=>{g.beginPath();g.moveTo(S*.5,S*.97);g.bezierCurveTo(S*.08,S*.72,S*.1,S*.28,S*.5,S*.03);g.bezierCurveTo(S*.9,S*.28,S*.92,S*.72,S*.5,S*.97);g.closePath();};
  leaf();const gr=g.createLinearGradient(0,S,0,0);gr.addColorStop(0,'rgba(222,238,190,0.96)');gr.addColorStop(1,'rgba(246,244,218,0.9)');g.fillStyle=gr;g.fill();
  g.save();leaf();g.clip();g.lineCap='round';g.strokeStyle='rgba(168,196,120,0.9)';g.lineWidth=5;g.beginPath();g.moveTo(S*.5,S*.97);g.lineTo(S*.5,S*.08);g.stroke();
  g.lineWidth=2.6;g.strokeStyle='rgba(176,204,128,0.85)';
  for(let i=1;i<=6;i++){const y=S*(.86-i*.12);[-1,1].forEach(s=>{g.beginPath();g.moveTo(S*.5,y);g.quadraticCurveTo(S*(.5+s*.16),y-S*.05,S*(.5+s*.34),y-S*.13);g.stroke();});}
  g.restore();leaf();g.lineWidth=7;g.strokeStyle='rgba(236,212,110,0.95)';g.stroke();
  return cv;}
export function build({head,wm,TM,SM}){
  const g=new THREE.Group();g.position.set(0,.15,-.025);g.rotation.x=-.1;g.scale.set(1,1,.9);head.add(g);
  const capM=TM('#a8673e','scales',{rep:[9,2],rows:4,cols:4}); // 둘레 36 × 위아래 8줄 — 시트처럼 둥근 비늘
  g.add(wm(lathe(PROF.map(q=>new THREE.Vector2(q[0],q[1])),40),capM));
  // 크림 띠: 테두리를 한 바퀴 (보송한 털실 결)
  const band=wm(new THREE.TorusGeometry(.474,.036,12,48),TM('#f1e3c3','wool',{rep:[8,1]}));band.rotation.x=PI/2;band.position.y=.006;g.add(band);
  // 나무꼭지: 짧고 살짝 기운 가지
  const stem=wm(new THREE.CylinderGeometry(.034,.044,.12,10),TM('#7a5236','wood',{rep:[1,1]}));stem.position.set(0,.39,0);stem.rotation.z=.12;g.add(stem);
  const stemTop=wm(new THREE.SphereGeometry(.035,10,6,0,PI*2,0,PI/2),SM('#8a603f'));stemTop.position.set(-.007,.45,0);stemTop.rotation.z=.12;stemTop.scale.y=.5;g.add(stemTop);
  // 장식 날개 두 장: 띠 높이, 귀 위쪽에서 바깥·살짝 뒤로 (날지는 못함)
  const wt=new THREE.CanvasTexture(wingCanvas());wt.colorSpace=THREE.SRGBColorSpace;
  const wingM=new THREE.MeshStandardMaterial({map:wt,side:THREE.DoubleSide,transparent:true,roughness:.85,metalness:0});
  const wingG=new THREE.PlaneGeometry(.315,.435).translate(0,.19,0); // 시트처럼 귀 옆에서 또렷하게 (2026-10-31 1.5배)
  // 띠보다 조금 낮게 귀 위쪽에서 시작해 바깥·위로 벌어짐. 앞을 보게 놓아 정면에서도 잎 모양이 보인다
  [-1,1].forEach(s=>{const w=wm(wingG,wingM);w.castShadow=false;w.position.set(s*.47,-.16,.12);w.rotation.set(0,s*.12,-s*1.0);g.add(w);});
  return {g,profile:PROF,top:PROF[PROF.length-1][1]};}
