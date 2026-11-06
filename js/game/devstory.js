/* 원더룹 — 시험 메뉴(톱니, ?debug): 공통 틀 8단계 시험 장면 (2026-11-06) — 지금 구역(베이스캠프·선착장 등) 원더룹 앞에 잠깐 깔았다가 다시 누르면 치운다.
   ① 긴장 구역 시험: 원더룹 둘레 4m 긴장 구역(세기 .5) — 안에 있으면 카메라가 살짝 떨림(game/stage). 바닥에 붉은 고리.
   ② 지나가는 큰 존재 시험: 원더룹 앞 5m를 가로질러 오가는 큰 마디벌레 + 빛나는 버섯(숨을 곳) + 천천히 굴러 오가는 공벌레 공(움직이는 숨을 곳). 들키면 처음 자리로.
   ③ 경비 영역 시험: 앞 6.5m에 원더룹 쪽을 보는 경비 + 그 사이 옆으로 비킨 나무 상자(눈길을 가림). 영역 5m.
   ④ 감정 구역 시험: 앞 2.5m 보라 고리 = 후덜덜 + 얼굴빛 하얗게 + 얼굴 클로즈업, 뒤 2.5m 노란 고리 = 감탄 + 클로즈업.
   ⑤ 스테이지 빛: 끔 → 세계 설정 stages의 빛(개미굴 꿀 저장소·보육실·지네 동굴) 차례로.
   ⑥ 큰 획득 시험: 앞 3m 큰 주민(가리개) 위로 세계 finale.gift. ⑦ 귀환 비행 시험: 세계 finale.vehicle을 타고 둘레를 날아 한 바퀴. ⑧ 미니어처 시험(세계 finale.miniature — 없으면 구역 크기로 다섯 자리).
   ⑨ 엔딩 화면 시험 · ⑩ 엔딩 순서 시험(큰 획득 → 귀환 비행 → 미니어처 → 엔딩 화면) · 미니어처 경로 저장(JSON 내려받기 — 유튜브 앰비언스 영상용). */
import * as THREE from 'three';
import {addEmotion,addTension,setTestLight} from './stage.js';
import {guard,hide,pass,remove} from './stealth.js';
import {bigGet,ending,flight,miniature,miniaturePath} from './finale.js';
import {hint,toast} from './ui.js';
let C=null,W=null;const ON={},SPOTS={}; // SPOTS: 시험 장면의 자리(녹화 도구가 원더룹을 걸려 보낼 때)
function initDevstory(c){C=c;W=c.world;}
const P=()=>C.WL.position,ry=()=>C.WL.rotation.y;
const at=(f,r=0)=>{const a=ry(),p=P();return [p.x+Math.sin(a)*f+Math.cos(a)*r,p.z+Math.cos(a)*f-Math.sin(a)*r];};
const gy=(x,z)=>C.groundY?C.groundY(x,z)||0:0;
/* 시험 장면을 놓기 전에 원더룹을 가장 트인 쪽으로 돌려 세운다(16방향 × 앞 1~7m·옆 ±6m 칸 중 걸을 수 있는 칸이 가장 많은 쪽) — 좁은 방에서 벽 밖에 놓이지 않게 */
function faceOpen(){if(!C.blocked)return;const p=P();let best=ry(),bn=-1;for(let i=0;i<16;i++){const a=i/16*Math.PI*2;let n=0;
    for(let f=1;f<=7;f+=1)for(let r=-6;r<=6;r+=1.5){const x=p.x+Math.sin(a)*f+Math.cos(a)*r,z=p.z+Math.cos(a)*f-Math.sin(a)*r;if(!C.blocked(x,z))n++;}if(n>bn){bn=n;best=a;}}
  C.WL.rotation.y=best;}
const mat=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.85,...o});
function ring(c,r,col){const m=new THREE.Mesh(new THREE.RingGeometry(r-.08,r,48),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide}));
  m.rotation.x=-Math.PI/2;m.position.set(c[0],gy(c[0],c[1])+.04,c[1]);C.scene.add(m);hint(m);return m;}
const drop=o=>{if(!o)return;o.removeFromParent();o.traverse(c=>{if(c.geometry)c.geometry.dispose();if(c.material)[].concat(c.material).forEach(m=>m.dispose());});};
function toggle(id,make){if(ON[id]){ON[id]();delete ON[id];toast('시험 장면을 치웠어요');return false;}ON[id]=make();return true;}
/* ① */
function tension(){toggle('tension',()=>{faceOpen();const c=at(0),t={c,r:4,k:.5},off=addTension(t),g=ring(c,4,'#e8705a');toast('긴장 구역: 붉은 고리 안에서 카메라가 살짝 떨려요');return ()=>{off();drop(g);};});}
/* ② 지나가는 큰 존재 — 마디 아홉 개가 머리를 따라오는 큰 벌레 */
function bug(){const g=new THREE.Group(),segs=[],trail=[];const body=mat('#a8603f'),dark=mat('#5e2e18');
  for(let i=0;i<9;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(i?.42:.5,14,10),i?body:dark);s.position.y=.5;const l=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1.1,5),dark);l.rotation.z=Math.PI/2;l.position.y=-.25;s.add(l);
    if(!i)[-1,1].forEach(k=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),mat('#fff6e6'));e.position.set(k*.2,.18,.38);s.add(e);const p=new THREE.Mesh(new THREE.SphereGeometry(.05,6,5),mat('#2a1a24'));p.position.set(k*.2,.18,.47);s.add(p);});
    g.add(s);segs.push(s);}
  let t=0;g.userData.tick=(dt,moving)=>{t+=dt;const h=g.position;if(moving||!trail.length)trail.unshift([h.x,h.z]);if(trail.length>400)trail.length=400;
    segs.forEach((s,i)=>{if(!i){s.position.set(0,.5,0);return;}const k=Math.min(trail.length-1,i*6),q=trail[k];s.position.set(q[0]-h.x,.5+Math.sin(t*6+i)*.04,q[1]-h.z);s.position.applyAxisAngle(new THREE.Vector3(0,1,0),-g.rotation.y);s.children[0].rotation.x=Math.sin(t*9+i)*.4;});};
  return g;}
function mushroom(c){const g=new THREE.Group();g.position.set(c[0],gy(c[0],c[1]),c[1]);const st=new THREE.Mesh(new THREE.CylinderGeometry(.18,.26,1.5,10),mat('#efe4d0'));st.position.y=.75;g.add(st);
  const cap=new THREE.Mesh(new THREE.SphereGeometry(1.1,20,10,0,Math.PI*2,0,Math.PI/2),mat('#7fd8ff',{emissive:'#3fb8e8',emissiveIntensity:.55}));cap.scale.y=.45;cap.position.y=1.5;g.add(cap);C.scene.add(g);return g;} // 원본 지네 동굴 빛나는 버섯
function stealthPass(){toggle('pass',()=>{faceOpen();const a=at(5,-6),b=at(5,6),home=[P().x,P().z,ry()],m=bug();C.scene.add(m);
  const e=pass({model:m,path:[a,b],speed:1.3,wait:1.2,range:4.2,cone:null,height:1.3,who:'큰 마디벌레',safe:home,lines:{notice:['킁킁… 이상한 냄새가 나는데…?'],back:['휴… 처음 자리로 돌아왔어요']}});
  SPOTS.path=[a,b];const mc=at(2.6,1.6);SPOTS.mushroom=mc;const mu=mushroom(mc),h1=hide({at:mc,r:1.25});
  const ball=new THREE.Mesh(new THREE.SphereGeometry(.65,16,12),mat('#7f9bb8'));const b0=at(2.4,-2.6),b1=at(2.4,-.4);ball.position.set(b0[0],gy(b0[0],b0[1])+.65,b0[1]);C.scene.add(ball); // 몸을 만 공벌레(움직이는 숨을 곳)
  const h2=hide({obj:ball,r:1.1});let t=0;const tick=()=>{t+=1/60;const k=(Math.sin(t*.35)+1)/2;const x=b0[0]+(b1[0]-b0[0])*k,z=b0[1]+(b1[1]-b0[1])*k;ball.rotation.x=t*.7;ball.position.set(x,gy(x,z)+.65,z);};
  const iv=setInterval(tick,1000/60);const r1=ring(mc,1.25,'#8fe4ff'),r2=new THREE.Mesh(new THREE.RingGeometry(1,1.1,40),new THREE.MeshBasicMaterial({color:'#bff2ff',transparent:true,opacity:.5,depthWrite:false}));r2.rotation.x=-Math.PI/2;r2.position.y=-.6;ball.add(r2);hint(r2);
  toast('큰 마디벌레가 앞을 지나가요. 빛나는 버섯이나 굴러가는 공벌레 곁에 숨어 봐요');
  return ()=>{clearInterval(iv);remove(e);remove(h1);remove(h2);drop(m);drop(mu);drop(ball);drop(r1);};});}
/* ③ 경비 영역 */
function guardFig(){const g=new THREE.Group(),b=mat('#7e4229'),d=mat('#3e2834');const bd=new THREE.Mesh(new THREE.SphereGeometry(.45,14,10),b);bd.scale.set(.9,1.1,.9);bd.position.y=.7;g.add(bd);
  const hd=new THREE.Mesh(new THREE.SphereGeometry(.38,14,10),b);hd.position.set(0,1.45,.12);g.add(hd);const hel=new THREE.Mesh(new THREE.SphereGeometry(.4,14,8,0,Math.PI*2,0,Math.PI/2),d);hel.position.set(0,1.5,.1);g.add(hel);
  [-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),mat('#fff6e6'));e.position.set(s*.15,1.48,.45);g.add(e);});
  const sp=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,2,6),mat('#c8a070'));sp.position.set(.5,1,0);g.add(sp);return g;}
function stealthGuard(){toggle('guard',()=>{faceOpen();const p=at(6.5),home=[P().x,P().z,ry()],m=guardFig(),h=Math.atan2(P().x-p[0],P().z-p[1]);m.position.set(p[0],gy(p[0],p[1]),p[1]);m.rotation.y=h;C.scene.add(m);
  const e=guard({obj:m,heading:h,range:5,cone:.58,height:2.2,who:'경비',safe:home,lines:{alert:['거기 누구냐!'],back:['휴, 입구로 돌아왔어요']}});
  SPOTS.guard=p;const bc=at(3.2,1.3);SPOTS.box=bc;const box=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.2,1.4),mat('#c99d5c'));box.position.set(bc[0],gy(bc[0],bc[1])+.6,bc[1]);C.scene.add(box);const hh=hide({at:bc,r:.95});
  const rg=ring(p,5,'#ffd23f');toast('경비 영역(노란 고리)에 들어가면 ? → ! — 나무 상자 뒤에 숨으면 안 보여요');
  return ()=>{remove(e);remove(hh);drop(m);drop(box);drop(rg);};});}
/* ④ 감정 구역 */
function emotion(){toggle('emotion',()=>{faceOpen();const a=at(2.5),b=at(-2.5);SPOTS.fear=a;SPOTS.awe=b;const e1=addEmotion({c:a,r:1,react:'shiver',pale:true,closeup:true,once:false,gap:3}),e2=addEmotion({c:b,r:1,react:'awe',closeup:true,once:false,gap:3});
  const g1=ring(a,1,'#b08ae0'),g2=ring(b,1,'#ffd23f');toast('보라 고리 = 후덜덜 + 얼굴빛, 노란 고리 = 감탄 — 걸어 들어가 봐요');return ()=>{e1();e2();drop(g1);drop(g2);};});}
/* ⑤ 스테이지 빛 */
let li=0;function lightCycle(btn){const L=Object.entries((W&&W.stages)||{}).filter(([,v])=>v.light);li=(li+1)%(L.length+1);const cur=li?L[li-1]:null;setTestLight(cur?cur[1].light:null);
  const name=cur?(cur[1].label||cur[0]):'끔';if(btn)btn.textContent='스테이지 빛: '+name;toast('스테이지 빛: '+name);}
/* ⑥~⑩ */
function giver(){const g=new THREE.Group(),b=mat('#a8603f');const hd=new THREE.Mesh(new THREE.SphereGeometry(.9,18,14),b);hd.position.y=1.7;g.add(hd);const bd=new THREE.Mesh(new THREE.SphereGeometry(.8,16,12),b);bd.scale.set(1,1,1.3);bd.position.set(0,.8,-.9);g.add(bd);
  [-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),mat('#2a1a24'));e.position.set(s*.38,1.85,.72);g.add(e);});return g;}
function gift(){const F=(W&&W.finale)||{},G=F.gift;if(!G){toast('세계 설정 finale.gift가 없어요');return Promise.resolve();}faceOpen();
  const p=at(3.4),gv=giver();gv.position.set(p[0],gy(p[0],p[1]),p[1]);gv.rotation.y=Math.atan2(P().x-p[0],P().z-p[1]);C.scene.add(gv);
  return bigGet({giver:gv,giverH:2.4,model:G.model,card:G.card,to:G.to}).then(()=>{setTimeout(()=>drop(gv),400);});}
function flyPath(){const p=P(),a=ry(),f=[Math.sin(a),Math.cos(a)],r=[Math.cos(a),-Math.sin(a)],y=p.y,pt=(F,R,H)=>[p.x+f[0]*F+r[0]*R,y+H,p.z+f[1]*F+r[1]*R];
  return [pt(0,0,0),pt(1.5,0,.6),pt(3.5,.5,2.2),pt(4.5,3,3.6),pt(2.5,5,4.4),pt(-1,4.5,4),pt(-3,1.5,3),pt(-2,-1,1.8),pt(-.6,-.4,.5),pt(0,0,0)];}
function fly(){const F=(W&&W.finale)||{};if(!F.vehicle){toast('세계 설정 finale.vehicle이 없어요');return Promise.resolve();}faceOpen();const v=F.vehicle(THREE),path=flyPath();
  v.position.set(...path[0]);C.scene.add(v);return flight({vehicle:v,path,speed:2.2,seat:.95}).then(()=>drop(v));}
function autoKeys(){const z=C.zone();let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const k in z.areas){const b=z.areas[k].bounds;if(!b)continue;x0=Math.min(x0,b[0]);x1=Math.max(x1,b[1]);z0=Math.min(z0,b[2]);z1=Math.max(z1,b[3]);}
  if(x0>x1){x0=z0=-10;x1=z1=10;}const cx=(x0+x1)/2,cz=(z0+z1)/2,sky=!!z.sky,R=Math.min(sky?18:99,Math.max(x1-x0,z1-z0)),H=sky?4.4:R*1.25, // 야외(하늘 있는 구역)는 머리 위 잎 지붕(5~6.5m) 아래에서 — 위로 올라가면 잎만 보였다
  fx=(u,v)=>[cx+Math.min(x1-x0,R)*u*.5,0,cz+Math.min(z1-z0,R)*v*.5];
  const names=['STAGE 1','STAGE 2','STAGE 3','쉼터','STAGE 4'],pts=[[-.6,-.6],[.6,-.6],[.6,.6],[0,0],[-.6,.6]];
  return pts.map(([u,v],i)=>{const a=fx(u,v),ang=i*1.1+.4;return {label:names[i],at:[a[0],.6,a[2]],from:[a[0]+Math.sin(ang)*R*(sky?.45:.9),H,a[2]+Math.cos(ang)*R*(sky?.45:.9)],sec:12};});}
const miniKeys=()=>{const F=(W&&W.finale)||{};return F.miniature&&F.miniature.keys||autoKeys();};
function mini(){const F=(W&&W.finale)||{};return miniature({keys:miniKeys(),fov:F.miniature&&F.miniature.fov||20,music:W&&W.music});}
function savePath(){const F=(W&&W.finale)||{},d=miniaturePath(miniKeys(),{fps:24,fov:F.miniature&&F.miniature.fov||20}),b=new Blob([JSON.stringify(d)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download=`miniature-path-${(W&&W.id)||'world'}-${C.zone().id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast(`미니어처 경로 ${d.frames.length}프레임(${d.duration}초)을 저장했어요`);return d;}
function end(){if(W)ending(W);}
async function chain(){await gift();await fly();await mini();end();}
function clearDevstory(){Object.keys(ON).forEach(k=>{ON[k]();delete ON[k];});setTestLight(null);li=0;}
const DEV={spots:SPOTS,tension,pass:stealthPass,guard:stealthGuard,emotion,light:lightCycle,gift,fly,mini,ending:end,chain,savePath,autoKeys};
export {DEV as devStory,clearDevstory,initDevstory};
