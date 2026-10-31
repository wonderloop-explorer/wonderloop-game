/* 원더룹 요정의 숲 — 요정 모델 (세계 전용, 네 구역이 함께 쓴다)
   기준 그림: ~/Downloads/Wonderloop/002. fairy forest/04. Gpt Img/"토리 우체부 요정 캐릭터 시트_최종"(2026-10-31). 요정은 모두 둥근 귀, 밤색 모자는 토리만.
   토리: 몽글몽글한 하얀 솜털 머리, 밤껍질 갈색 우체부 모자(볼록한 몸·앞 챙·띠·옆 단추), 크림 옷, 갈색 장화, 왼쪽 옆구리에 작은 호두 가방
   (끈은 오른 어깨에서 몸에 붙어 비스듬히), 등 가운데에서 뒤로 펼친 잎맥 날개 두 쌍, 가슴 앞에서 두 손으로 끌어안은 크림 편지.
   목에 연분홍 목도리. 얼굴: 눈썹 없음, 짙은 갈색 타원 눈 + 작은 흰 안광, 볼터치는 얼굴 면에 붙인 얇은 면(데칼).
   매끈한 면(flatShading 끔)에 색연필 결 텍스처 — 원더룹 몸과 같은 방식. 솜털 머리는 솜뭉치 여럿을 한 덩어리로 합쳐 한 번에 그린다.
   키는 원더룹의 절반 남짓(scale 1 기준 약 0.72). 앞이 +z. 표정은 setExpr('기본'|'호들갑'|'기쁨'|'안도'), 움직임은 mode — 'idle' 서 있기,
   'panic' 허둥지둥, 'beckon' 같이 가자고 손짓, 'follow' 원더룹 옆 조금 앞(카메라 쪽)에서 따라 걷기.
   update(dt,t,{wl,cam,free})를 구역 update에서 부른다 — cam 카메라(따라갈 자리 고르기), free(x,z) 설 수 있는 곳인지.
   우체국 요정(fairy): 토리와 같은 몸에 모자 색만 다르다(초록·회갈색). 움직이는 물체라 구역 정보 keepOut에 넣는다. */
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {PI,group,lathe,lin,pencil} from '../../01-textures.js';
// 잎맥 날개 그림: 끝이 둥근 잎 모양 반투명 막, 가운데 맥 + 갈래 맥 (아틀라스 밖이라 캔버스 그대로, 256). 잎자루가 아래 가운데.
function wingTex(){const S=256,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');g.clearRect(0,0,S,S);
  const leaf=()=>{g.beginPath();g.moveTo(S*.5,S*.98);g.bezierCurveTo(S*.04,S*.7,S*.12,S*.08,S*.5,S*.03);g.bezierCurveTo(S*.88,S*.08,S*.96,S*.7,S*.5,S*.98);g.closePath();};
  leaf();g.fillStyle='rgba(240,244,214,0.55)';g.fill();g.save();leaf();g.clip();g.lineCap='round';g.strokeStyle='rgba(176,190,128,0.9)';
  g.lineWidth=4;g.beginPath();g.moveTo(S*.5,S*.98);g.lineTo(S*.5,S*.06);g.stroke();g.lineWidth=2.2;
  for(let i=1;i<=6;i++){const y=S*(.88-i*.12);[-1,1].forEach(s=>{g.beginPath();g.moveTo(S*.5,y);g.quadraticCurveTo(S*(.5+s*.18),y-S*.05,S*(.5+s*.4),y-S*.16);g.stroke();});}
  g.restore();leaf();g.lineWidth=5;g.strokeStyle='rgba(206,206,150,0.95)';g.stroke();
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;}
const SKIN='#f9dcc3',EYE='#3e2620',R=.16; // R 머리 반지름
const Z=new THREE.Vector3(0,0,1),DOWN=new THREE.Vector3(0,-1,0);
const hash=i=>{const x=Math.sin(i*12.9898+4.1)*43758.5453;return x-Math.floor(x);};
/* 머리 겉면 위 점과 그 자리 바깥 방향 (머리 가운데 기준) */
const onHead=(x,y,off=0)=>new THREE.Vector3(x,y,Math.sqrt(Math.max(0,(R+off)**2-x*x-y*y)));
/* 얼굴 면에 붙는 얇은 타원(데칼): 구 겉면을 따라 휘어 떠 보이지 않는다 */
function decal(dir,ex,ey,mat){const T=new THREE.Vector3(0,1,0).cross(dir).normalize(),B=dir.clone().cross(T).normalize();
  const g=new THREE.CircleGeometry(1,28,0,PI*2);const p=g.attributes.position,v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){v.copy(dir).multiplyScalar(R).addScaledVector(T,p.getX(i)*ex).addScaledVector(B,p.getY(i)*ey).normalize().multiplyScalar(R+.0012);p.setXYZ(i,v.x,v.y,v.z);}
  g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.castShadow=false;m.receiveShadow=true;return m;}
/* 하얀 솜털 머리: 솜뭉치 자리(난수 없이 정해진 자리 — 요정마다 같은 머리)를 한 덩어리로. 뭉치끼리 맞닿는 곳을 살짝 어둡게(정점 색) 해 몽글몽글함이 보이게 */
function hairGeo(){const geos=[],u=new THREE.Vector3();
  const qq=new THREE.Quaternion();
  const puff=(c,r,sx=1,sy=1,sz=1,i=0,flat=1)=>{const g=new THREE.SphereGeometry(r,r>.1?18:11,r>.1?12:8);g.scale(sx,sy,sz);if(flat<1){g.scale(1,1,flat);g.applyQuaternion(qq.setFromUnitVectors(Z,c.clone().normalize()));}
    const n=g.attributes.normal,col=[],tint=.97+hash(i+7)*.03;u.copy(c).normalize();
    for(let k=0;k<n.count;k++){const d=n.getX(k)*u.x+n.getY(k)*u.y+n.getZ(k)*u.z,f=(.88+.12*Math.min(1,Math.max(0,d*.6+.55)))*tint;col.push(f,f,f*.985);}
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.translate(c.x,c.y,c.z);geos.push(g);};
  // 둘레 뭉치: 구 위에 고르게(피보나치) — 얼굴(앞·눈썹 아래)과 목 아래, 모자 속 꼭대기는 비운다
  const N=64;for(let i=0;i<N;i++){const y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y),th=i*2.39996,x=Math.cos(th)*r,z=Math.sin(th)*r;
    if(z>.25&&y<.5)continue;if(y<-.5)continue;if(z>-.1&&y<-.3)continue;if(y>.9)continue;
    const side=Math.abs(x)>.6&&y<.35?1.12:1; // 옆머리는 바깥으로 부풀게
    const j=1.04+hash(i+40)*.08;puff(new THREE.Vector3(x*R*j*side,y*R*j,z*R*j),.052+hash(i)*.034,1,1,1,i,.8);}
  puff(new THREE.Vector3(0,.03,-.035),.158,1.04,1,1,200); // 바탕 머리: 뭉치 사이 틈을 메운다(앞은 얼굴 속에 숨는다)
  // 앞머리: 이마 위 한 줄, 눈썹 자리 위에서 멈춘다
  for(let k=0;k<7;k++){const x=(k-3)*.036,c=onHead(x,.098+Math.abs(k-3)*.004,.008);puff(c,.044+hash(k+90)*.01,1,.9,.8,k+90);}
  // 귀 옆 큰 뭉치(볼까지 내려오는 동그란 부풀음)
  [-1,1].forEach(s=>{puff(new THREE.Vector3(s*.15,-.02,-.035),.07,1,1.1,1,s+120);puff(new THREE.Vector3(s*.14,.06,.04),.06,1,1,1,s+130);});
  return mergeGeometries(geos);}
/* 요정 하나. cap: 모자 색, letter: 편지를 두 손에 들기, bag: 호두 가방 */
function fairy({x=0,z=0,ry=0,cap='#7d4a2a',letter=true,bag=true,scale=1}={}){
  const mats=[],texs=[]; // texs: 이 요정만 쓰는 텍스처(날개). 색연필 결은 pencil 캐시라 함께 쓰므로 지우지 않는다
  const mat=(c,kind='plain',o={},extra={})=>{const t=pencil(c,kind,o);const m=new THREE.MeshStandardMaterial({map:t,roughness:.9,metalness:0,...extra});mats.push(m);return m;};
  const flat=(c,extra={})=>{const m=new THREE.MeshStandardMaterial({color:lin(c),roughness:.75,metalness:0,...extra});mats.push(m);return m;};
  const mesh=(geo,m,parent,px=0,py=0,pz=0,o={})=>{const me=new THREE.Mesh(geo,m);me.position.set(px,py,pz);if(o.s)me.scale.set(...o.s);
    if(o.r)me.rotation.set(...o.r);me.castShadow=o.cast!==false;me.receiveShadow=true;parent.add(me);return me;};
  const root=group(x,0,z,ry);root.scale.setScalar(scale);
  const body=new THREE.Group();root.add(body); // 통통 뛰기·흔들기는 body로
  // 장화·짧은 바지·옷 (옷은 아래가 넓은 종 모양 회전체)
  const bootM=mat('#6f4529','leather'),pantM=mat('#ebdfc7','linen'),clothM=mat('#f3ead8','plain',{hatch:.5});
  [-1,1].forEach(s=>{mesh(new THREE.SphereGeometry(.046,20,14),bootM,body,s*.048,.034,.012,{s:[1,.78,1.3]});
    mesh(new THREE.CylinderGeometry(.036,.04,.05,18),bootM,body,s*.048,.06,0);mesh(new THREE.CylinderGeometry(.03,.032,.04,16),pantM,body,s*.046,.09,0);});
  const prof=[[0,.075],[.112,.075],[.122,.088],[.118,.12],[.104,.18],[.088,.23],[.07,.27],[.045,.295],[0,.305]];
  mesh(lathe(prof.map(([r,y])=>new THREE.Vector2(r,y)),28),clothM,body);
  const bodyR=y=>{for(let i=1;i<prof.length;i++){const [r0,y0]=prof[i-1],[r1,y1]=prof[i];if(y<=y1)return r0+(r1-r0)*Math.max(0,(y-y0)/(y1-y0||1));}return 0;};
  // 목도리: 시트처럼 목에 두른 연분홍 목도리 + 앞으로 늘어진 짧은 끝
  const scarfM=mat('#d9908a','plain',{hatch:.5});
  mesh(new THREE.TorusGeometry(.066,.022,12,28),scarfM,body,0,.3,0,{r:[PI/2,0,0],s:[1,1.05,1]});
  mesh(new THREE.CapsuleGeometry(.018,.035,6,10),scarfM,body,-.035,.265,.07,{r:[.35,0,.25],s:[1.3,1,.7]});
  // 머리
  const head=new THREE.Group();head.position.set(0,.45,0);body.add(head);
  const skinM=mat(SKIN,'plain',{hatch:.45});
  mesh(new THREE.SphereGeometry(R,30,22),skinM,head);
  [-1,1].forEach(s=>mesh(new THREE.SphereGeometry(.034,16,12),skinM,head,s*.155,-.045,.01,{s:[.55,.9,.8]})); // 둥근 귀 (옆머리 아래로 빼꼼)
  mesh(new THREE.SphereGeometry(.009,10,8),flat('#f0a48c'),head,0,-.034,R-.002,{s:[1.2,.9,.6],cast:false}); // 작은 코
  const cheekM=flat('#f4a0a0',{transparent:true,opacity:.78,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,roughness:1});
  [-1,1].forEach(s=>head.add(decal(onHead(s*.088,-.042).normalize(),.03,.021,cheekM)));
  // 눈: 얼굴 면에 반쯤 묻힌 납작한 타원 + 작은 흰 안광 (감은 눈은 위로 볼록한 곡선)
  const eyeM=flat(EYE,{roughness:.5}),shineM=flat('#ffffff',{emissive:lin('#ffffff'),emissiveIntensity:.6,roughness:.3});
  const eyes=[-1,1].map(s=>{const g=new THREE.Group(),p=onHead(s*.058,-.006);g.position.copy(p);g.quaternion.setFromUnitVectors(Z,p.clone().normalize());head.add(g);
    const e=mesh(new THREE.SphereGeometry(.03,20,16),eyeM,g,0,0,0,{s:[.78,1.12,.3],cast:false});
    const sh=mesh(new THREE.SphereGeometry(.0085,10,8),shineM,g,-.008,.013,.008,{s:[1,1,.5],cast:false});return {g,e,sh};});
  const shut=[-1,1].map(s=>{const p=onHead(s*.058,-.01,.002);const m=mesh(new THREE.TorusGeometry(.021,.0055,6,16,PI),eyeM,head,p.x,p.y,p.z,{cast:false});
    m.quaternion.setFromUnitVectors(Z,p.clone().normalize());m.visible=false;return m;});
  const mp=onHead(0,-.07,.001),mq=new THREE.Quaternion().setFromUnitVectors(Z,mp.clone().normalize());
  const mouth=mesh(new THREE.SphereGeometry(.012,12,8),flat('#7a3a34'),head,mp.x,mp.y,mp.z,{s:[1.3,.42,.3],cast:false});mouth.quaternion.copy(mq);
  const mouthO=mesh(new THREE.SphereGeometry(.015,14,10),flat('#9a4038'),head,mp.x,mp.y-.004,mp.z,{s:[.85,1.15,.3],cast:false});mouthO.quaternion.copy(mq);mouthO.visible=false;
  // 하얀 솜털 머리
  const hairM=new THREE.MeshStandardMaterial({map:pencil('#fbf7ef','wool',{n:1}),roughness:1,metalness:0,vertexColors:true});mats.push(hairM);
  mesh(hairGeo(),hairM,head);
  // 우체부 모자: 볼록한 몸 + 띠 + 앞 챙 + 옆 단추, 솜털 위에 살짝 뒤·옆으로 기울여 얹는다. 몸 아래는 곧게 내려와 바닥으로 막혀 있어 챙 사이로 머리카락이 비치지 않는다
  const capM=mat(cap,'suede'),bandM=mat('#a9784a','plain'),capG=new THREE.Group();capG.position.set(0,.125,-.02);capG.rotation.set(-.1,0,.12);capG.scale.setScalar(1.14);head.add(capG);
  mesh(lathe([[0,-.014],[.174,-.014],[.186,.008],[.19,.04],[.178,.075],[.14,.104],[.08,.118],[0,.121]].map(([r,y])=>new THREE.Vector2(r,y)),32),capM,capG);
  mesh(new THREE.TorusGeometry(.178,.01,8,48),bandM,capG,0,-.002,0,{r:[PI/2,0,0]}); // 띠: 모자 몸 아래 가장자리를 두른다
  mesh(new THREE.CylinderGeometry(.15,.15,.013,28,1,false,-PI/2,PI),capM,capG,0,-.016,.08,{s:[1,1,.95],r:[.1,0,0]}); // 앞 챙
  mesh(new THREE.SphereGeometry(.016,12,10),flat('#d8b07a',{roughness:.5}),capG,.13,-.002,.125,{s:[1,1,.6],r:[0,.8,0]}); // 옆 단추
  // 팔·손: 어깨에서 손까지 소매 + 동그란 손. 편지가 있으면 가슴 앞에서 편지 아래 양옆을 두 손으로 끌어안는다
  const sleeveM=clothM,handM=skinM,arms=[-1,1].map(s=>{const a=new THREE.Group();a.position.set(s*.078,.255,0);body.add(a);
    const hand=new THREE.Vector3(s*.088,.178,.122),dir=hand.clone().sub(a.position),L=dir.length();
    a.quaternion.setFromUnitVectors(DOWN,dir.normalize());const rest=a.quaternion.clone();
    mesh(new THREE.CapsuleGeometry(.027,L-.06,6,14),sleeveM,a,0,-(L-.02)/2,0);const h=mesh(new THREE.SphereGeometry(.034,18,14),handM,a,0,-L,0);return {a,h,s,rest};});
  const restArm=()=>arms.forEach(({a,rest})=>a.quaternion.copy(rest));
  let paper=null;
  if(letter){paper=new THREE.Group();paper.position.set(0,.205,.105);paper.rotation.set(-.14,0,.03);body.add(paper);
    const papM=mat('#f6ecd6','plain',{hatch:.4});mesh(new THREE.BoxGeometry(.17,.125,.012),papM,paper);
    const flap=new THREE.Shape();flap.moveTo(-.085,.0625);flap.lineTo(.085,.0625);flap.lineTo(0,-.005);flap.closePath();
    mesh(new THREE.ShapeGeometry(flap),mat('#eadabd','plain',{hatch:.4}),paper,0,0,.0065,{cast:false});
    mesh(new THREE.CylinderGeometry(.016,.016,.006,16),flat('#a5532e'),paper,0,.0,.01,{r:[PI/2,0,0]});}
  // 호두 가방: 왼쪽 옆구리에 작게, 끈은 오른 어깨에서 몸통 겉면을 따라 비스듬히 한 바퀴
  if(bag){const bagM=mat('#966037','weave',{rep:[2,1]});
    const b=new THREE.Group();b.position.set(.128,.12,.025);body.add(b);
    mesh(new THREE.SphereGeometry(.042,20,14),bagM,b,0,0,0,{s:[1,.88,.9]});
    mesh(new THREE.SphereGeometry(.043,20,10,0,PI*2,0,PI*.42),mat('#7a4a2a','leather'),b,0,.006,0,{s:[1.02,.8,.92]}); // 뚜껑
    const pts=[];for(let i=0;i<48;i++){const th=i/48*PI*2,y=.19+.075*Math.cos(th+PI/2),r=bodyR(y)+.007;pts.push(new THREE.Vector3(Math.sin(th)*r,y,Math.cos(th)*r));}
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),96,.0055,6,true),mat('#7a4e30','leather'),body);}
  // 날개 두 쌍: 등 가운데에서 뒤·바깥으로 펼친다 (위 큰 날개, 아래 작은 날개)
  const wt=wingTex();texs.push(wt);const wm=new THREE.MeshStandardMaterial({map:wt,side:THREE.DoubleSide,transparent:true,depthWrite:false,roughness:.8});mats.push(wm);
  const wg=new THREE.PlaneGeometry(1,1).translate(0,.5,0),wings=[];
  [-1,1].forEach(s=>{[[.2,.32,1.1],[.145,.21,1.95]].forEach(([w,h,tilt])=>{const m=new THREE.Mesh(wg,wm);m.castShadow=false;m.scale.set(w,h,1);
    const p=new THREE.Group();p.position.set(s*.012,.23,-.075);p.add(m);body.add(p);wings.push({p,s,tilt});});});
  // 표정
  function setExpr(e){const closed=e==='기쁨'||e==='안도';eyes.forEach(({g,e:m})=>{g.visible=!closed;m.scale.set(e==='호들갑'?.85:.78,e==='호들갑'?1.3:1.12,.3);});shut.forEach(m=>m.visible=closed);
    mouth.visible=e==='기본'||e==='안도';mouthO.visible=e==='호들갑'||e==='기쁨';mouthO.scale.set(e==='기쁨'?1.15:.85,e==='기쁨'?.8:1.15,.3);}
  setExpr('기본');
  const st={mode:'idle',t:0,speed:0,side:0},cr=new THREE.Vector3(),tc=new THREE.Vector3();
  function update(dt,t,{wl,cam,free}={}){st.t+=dt;const T=st.t;let bob=Math.sin(t*3.1)*.008,flap=.15+Math.sin(t*4)*.08,lean=0,hx=0;restArm();
    if(st.mode==='panic'){bob=Math.abs(Math.sin(T*9))*.05;flap=.4+Math.sin(T*30)*.4;hx=Math.sin(T*5.3)*.35;body.rotation.y=Math.sin(T*3.7)*.5;}
    else body.rotation.y*=.9;
    if(st.mode==='beckon'){const a=arms[1];a.a.quaternion.setFromEuler(new THREE.Euler(-2.5+Math.sin(T*8)*.35,0,.25));bob=Math.abs(Math.sin(T*4))*.03;flap=.3+Math.sin(T*16)*.3;}
    if(st.mode==='follow'&&wl){
      // 따라갈 자리: 원더룹 옆(카메라 기준 오른쪽·왼쪽 중 토리가 있던 쪽) + 카메라 쪽으로 조금 앞 — 원더룹 몸에 가리지 않는다
      let gx=wl.position.x,gz=wl.position.z;
      if(cam){cr.setFromMatrixColumn(cam.matrixWorld,0);cr.y=0;cr.normalize();tc.set(cam.position.x-gx,0,cam.position.z-gz).normalize();
        if(!st.side)st.side=Math.sign((root.position.x-gx)*cr.x+(root.position.z-gz)*cr.z)||1;
        const want=s=>[gx+cr.x*s*.95+tc.x*.45,gz+cr.z*s*.95+tc.z*.45];
        let [tx,tz]=want(st.side);if(free&&!free(tx,tz)){const o=want(-st.side);if(free(o[0],o[1])){st.side=-st.side;[tx,tz]=o;}else{tx=gx+tc.x*.7;tz=gz+tc.z*.7;}}
        gx=tx;gz=tz;}
      const dx=gx-root.position.x,dz=gz-root.position.z,d=Math.hypot(dx,dz),want=d>.18?Math.min(3.4,d*2.6):0;
      st.speed+=(want-st.speed)*Math.min(1,dt*5);
      if(d>.01){const nx=root.position.x+dx/d*st.speed*dt,nz=root.position.z+dz/d*st.speed*dt;if(!free||free(nx,nz)){root.position.x=nx;root.position.z=nz;}}
      // 걸을 때는 가는 쪽, 멈추면 원더룹이 보는 쪽
      const a=st.speed>.3?Math.atan2(dx,dz):wl.rotation.y;let da=a-root.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));root.rotation.y+=da*Math.min(1,dt*6);
      if(st.speed>.3){bob=.05+Math.sin(T*14)*.03;flap=.5+Math.sin(T*28)*.4;lean=.12;}}
    body.position.y=bob;body.rotation.x=lean;head.rotation.y=hx;head.rotation.z=Math.sin(t*1.3)*.04;
    wings.forEach(w=>w.p.rotation.set(0,w.s*(.3+flap),-w.s*w.tilt));}
  return {root,body,head,paper,setExpr,update,set mode(m){if(st.mode!==m){st.mode=m;st.t=0;st.side=0;}},get mode(){return st.mode;},
    dispose(){texs.forEach(t=>t.dispose());mats.forEach(m=>m.dispose());}};}
const tori=o=>fairy({cap:'#7d4a2a',letter:true,bag:true,...o});
export {fairy,tori,wingTex};
