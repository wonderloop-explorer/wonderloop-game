/* 원더룹 견본 구역: 실내 (방 여러 개) — 새 실내 구역을 만들 때 복사해서 쓰는 본보기.
   - 방마다 영역(areas) 하나: 걸을 수 있는 범위(bounds)·장애물·카메라. 두 방의 범위가 문간에서 겹쳐 오갈 수 있다.
   - 원더룹이 다른 방으로 들어가면 카메라가 그 방 기준으로 바뀐다('방 전체' 카메라도 그 방을 본다).
   - 방 조명은 lights에 넣고 light(env)에서 밝기를 정한다(08이 옛 단위 → 물리 단위로 바꿈).
   - 문: 거실 왼쪽 앞 문 → 견본 야외, 서재 오른쪽 앞 문 → 베이스캠프.
   - 공통 시스템(js/game/) 견본: 서재의 견본 손님(대화, 나침반 받은 뒤 다른 대사), 말 없는 손님(대사 묶음이 비어도 멈추지 않음),
     거실 한가운데를 밟으면 나레이션 → 안내 카드(이벤트 줄), 거실을 오가는 먼지 뭉치(위협 견본 — 대화·카드가 열리면 멈춘다),
     도감 견본(손님과 대화를 마치면 카드 한 장), 숨겨진 비밀 견본(서재 안쪽 책장 옆 — 다가가면 금빛 반짝임). */
import * as THREE from 'three';
import {M,PI,add,blob,boxAt,cylAt,group,rawLin,rng} from '../01-textures.js';
import * as G from '../game/index.js';
export function build({root}){
const R=rng('sample-indoor:props'),rnd=(a,b)=>a+(b-a)*R();
const W=6,D=4,H=2.8; // 방 하나 가로 6, 깊이 ±4
const floorM=M('#e2c29a','planks',{rep:[2,2]}),wallM=M('#efe0c4','plaster',{rep:[2,1]}),wall2=M('#d7e6dc','plaster',{rep:[2,1]});
// 바닥·뒷벽 (인형의 집처럼 앞쪽 두 면은 열어 둔다)
add(new THREE.PlaneGeometry(W*2,D*2),floorM,0,0,0,{rx:-PI/2,cast:false,line:false});
boxAt(W*2+0.3,H,0.2,wallM,0,0,-D-0.1,{cast:false});
boxAt(0.2,H,D*2,wall2,-W-0.1,0,0,{cast:false});
// 가운데 칸막이벽 + 문간(z -1.1~1.1)
boxAt(0.24,H,D-1.1,wallM,0,0,-(D+1.1)/2,{cast:false});boxAt(0.24,H,D-1.1,wallM,0,0,(D+1.1)/2,{cast:false});
boxAt(0.24,0.5,2.2,wallM,0,H-0.5,0,{cast:false});
// 거실: 소파·탁자
const obsHall=[],obsStudy=[];
{const g=group(-3.4,0,-3.2,0);boxAt(2.4,0.45,0.9,M('#c98a6a','plain'),0,0,0,{parent:g});boxAt(2.4,0.6,0.25,M('#b57a5c','plain'),0,0.45,-0.33,{parent:g});obsHall.push({r:[-4.6,-2.2,-3.7,-2.7]});}
{cylAt(0.55,0.55,0.08,M('#c69468','wood'),-3,0.42,-0.6);cylAt(0.06,0.06,0.42,M('#a97a52','wood'),-3,0,-0.6);blob(-3,-0.6,0.7,0.7,0.25);obsHall.push({c:[-3,-0.6,0.55]});}
// 서재: 책상·책장·등
{boxAt(1.6,0.08,0.8,M('#c88f5e','wood'),3.2,0.72,-3.4);[[2.5,-3.7],[3.9,-3.7],[2.5,-3.1],[3.9,-3.1]].forEach(([x,z])=>boxAt(0.07,0.72,0.07,M('#a9764b','wood'),x,0,z));obsStudy.push({r:[2.3,4.1,-3.9,-2.9]});}
{const bs=group(5.6,0,-1,-PI/2);boxAt(2,2.2,0.4,M('#b88457','wood'),0,0,0,{parent:bs});
  for(let s=0;s<3;s++)for(let k=0;k<7;k++){const w=rnd(0.1,0.16),h=rnd(0.3,0.42);boxAt(w,h,0.28,M(['#d45d5a','#3fa89b','#e7b05a','#7d8bd0'][Math.floor(R()*4)],'plain'),-0.8+k*0.24,0.25+s*0.68,0.08,{parent:bs});}
  obsStudy.push({r:[5.2,6,-2.1,0.1]});}
const lamp=new THREE.PointLight(rawLin(0xffc27a),0.5,7,2);lamp.position.set(3.2,2.2,-2.6);root.add(lamp);
add(new THREE.SphereGeometry(0.16,12,8),new THREE.MeshStandardMaterial({color:0xfff1cf,emissive:0xffd58a,emissiveIntensity:0.6}),3.2,2.25,-2.6,{line:false,cast:false});
// 문틀 (밟는 자리 표시)
boxAt(0.9,2,0.08,M('#7a4a32','wood'),-5.3,0,D-0.1);boxAt(0.9,2,0.08,M('#7a4a32','wood'),5.3,0,D-0.1);
// 공통 시스템 견본
const person=(x,z,ry,c)=>{const g=group(x,0,z,ry);cylAt(.17,.22,.62,M(c,'plain'),0,0,0,{parent:g});add(new THREE.SphereGeometry(.21,12,8),M('#ffd6b0','plain'),0,.82,0,{parent:g});blob(x,z,.35,.35,.25);return g;};
const guest=person(3.7,0.4,-0.7,'#7d8bd0'),quiet=person(-1.6,2.6,2.4,'#b7ab9a');
G.codex.setup({world:'sample',name:'견본 도감',
  cards:[{id:'camera',t:'방마다 카메라',f:'실내 구역은 방마다 카메라가 따로 있어요. 문간을 지나면 그 방을 비춰요.',x:'방 카메라는 방의 가운데와 거리, 돌려 볼 수 있는 각도를 구역 정보에 적어 두고 써요.',where:'견본 실내'},
         {id:'door',t:'문으로 오가기',f:'문을 밟으면 다른 구역으로 가요.',where:'견본 실내'}],
  secrets:[{id:'shelf',t:'책장 앞 먼지',f:'오래된 책장 앞에는 먼지가 소복이 쌓여 있어요. 아무도 이 책들을 꺼내 보지 않았나 봐요.',where:'서재'}]});
G.codex.spot({id:'shelf',pos:[4.8,0,-2.6]}); // 서재 안쪽 구석 (손님과 멀리)
G.dialog.npc({name:'견본 손님',root:guest,onDone:()=>G.codex.find('camera'),lines:['어서 와, 여기는 견본 실내야.','방마다 카메라가 바뀌는 거 봤어?'],
  variants:[{when:()=>G.state.flags.compass,lines:['어서 와! 배낭에 나침반 키링이 달려 있네.','방마다 카메라가 바뀌는 거 봤어?']}]});
G.dialog.npc({name:'말 없는 손님',root:quiet,lines:[]}); // 대사 묶음이 비어 있음 → 말 걸 상대로 고르지 않는다
G.events.area({rect:[-3.6,-2.4,0.4,1.6],event:{id:'sample-hall',run:async e=>{
  await e.narrate({text:'견본 실내예요. 방마다 카메라가 따로 있어요.'});
  await e.notice({kicker:'견본',title:'서재로 가 봐요',text:'문간을 지나면 카메라가 서재를 비춰요. 서재의 견본 손님에게 말을 걸어 보세요.'});
  G.ui.setQuest('서재의 견본 손님과 이야기해요');}}});
const dust=add(new THREE.IcosahedronGeometry(.22,0),M('#8a7a6a','plain'),-3.4,.24,-1.6,{line:false});let dustT=0;
const cam=x=>({target:[x,1.2,-0.4],dist:19,polar:[0.55,1.32],azimuth:[0.12,1.45],start:[0.98,0.8],minDist:3,maxDist:34});
return {
  name:'견본 실내',kind:'indoor',start:{compass:true},
  spawn:{x:-4,z:2.6,ry:PI*0.9},
  areas:{
    hall:{bounds:[-W+0.35,0.4,-D+0.35,D-0.3],obstacles:[...obsHall,{r:[-0.12,0.12,-D,-1.1]},{r:[-0.12,0.12,1.1,D]}],camera:cam(-3)},
    study:{bounds:[-0.4,W-0.35,-D+0.35,D-0.3],obstacles:obsStudy,camera:cam(3)}},
  doors:[{rect:[-5.8,-4.8,3.2,3.7],to:'sample-outdoor',spawn:{x:-3.6,z:-2.6,ry:0.3}},{rect:[4.8,5.8,3.2,3.7],to:'basecamp'}],
  sun:{dir:new THREE.Vector3(3,-12,12).normalize(),shadow:9,follow:false},
  lights:[lamp],keepOut:[guest,quiet,dust],
  update(dt){if(!G.events.threatsPaused())dustT+=dt;dust.position.x=-3.4+Math.sin(dustT*.9)*1.6;dust.rotation.y=dustT*2;}, // 위협 견본: 막히면 멈춤
  dust,guest,quiet,
  light(env){lamp.intensity=(0.35+0.9*env.night)*env.flick*(1-.6*env.cave);},
};
}
