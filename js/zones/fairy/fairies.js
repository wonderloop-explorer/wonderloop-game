/* 요정의 숲 — 요정 모델 (기준 그림 wonderloop-studio/fairy-forest/ref/match/fairy-*.png, 생김새·색을 그대로. 장식 의상·소품을 더하지 않는다)
   사공·꽃·바람 요정은 작은 뾰족귀, 버섯 요정은 귀 없음. 모두 원더룹보다 작다(키 약 0.8, 원더룹 약 1.3).
   재질: 원더룹처럼 부드러운 음영 + 색연필 천 결(옷 linen, 피부 suede, 잎 leaf), 버섯 갓 무늬·주름은 캔버스 텍스처로 그린다(메시를 얹지 않음).
   볼터치는 얼굴 면에 붙여 납작하게(떠 보이지 않게). 팔은 어깨(몸통 위쪽)에서, 노는 손에 쥐어 몸 옆으로.
   fairy(kind) → {root, head, arms:[왼,오], tick(dt,t), wave(on), setMood(name)}
     kind: 'boatman' 사공(잎 모자·연파랑 옷·노) · 'mushroom' 버섯(주황 갓·아이보리 반점 셋·크림 통통 몸)
   이슬배: 길쭉한 나뭇잎배 leafBoat(길이, 폭)(2026-11-02 — 예전 파란 그릇 배 dewBoat()는 남겨 둠). 민들레 홀씨 우산 dandelionPuff(). 휴대폰은 bakeFairy로 부품을 합친다.
   얼굴 앞은 +z. 발바닥이 y=0. 그림자는 휴대폰 단계에서 구역이 shadowBlob을 단다. */
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {M,PI,lathe,lin,pencil} from '../../01-textures.js';
import {toon} from './paint.js';
const SKIN='#f4cfa6',CHEEK='#f39a9a',INK='#4a2a24';
const mats={};const mat=(c,k='suede',o)=>{o=Object.assign({flat:false},o);const key=c+k+JSON.stringify(o);return mats[key]||(mats[key]=M(c,k,o));}; // 부드러운 음영(원더룹과 같게)
const mesh=(g,m,parent,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;if(parent)parent.add(o);return o;};
/* 얼굴: 점 눈 둘, 웃는 입, 볼터치(얼굴 면에 붙인 납작 원) — 머리 반지름 r의 앞면에 */
function face(head,r,{mouth='smile'}={}){const ink=mat(INK,'plain',{flat:false}),pink=mat(CHEEK,'plain',{flat:false});
  // 얼굴 면 위 한 점: (x,y)에서 구 표면까지 + 살짝 바깥(면이 납작한 로우폴리라 표면보다 조금 밖에 붙여야 묻히지 않는다)
  const onFace=(x,y,out=0)=>{const z=Math.sqrt(Math.max(0,r*r-x*x-y*y));const n=new THREE.Vector3(x,y,z).normalize();return n.multiplyScalar(r+out);};
  const stick=(m,p)=>{m.position.copy(p);m.lookAt(p.clone().multiplyScalar(2));head.add(m);m.castShadow=false;return m;};
  const eyes=[-1,1].map(s=>{const e=stick(new THREE.Mesh(new THREE.SphereGeometry(r*.13,12,9),ink),onFace(s*r*.34,r*.02,-r*.03));e.scale.set(.9,1.1,.55);return e;}); // 큰 동그란 눈(레퍼런스처럼 안광 없음)
  [-1,1].forEach(s=>stick(new THREE.Mesh(new THREE.CircleGeometry(r*.17,18),pink),onFace(s*r*.55,-r*.2,r*.035))); // 볼터치: 얼굴 면에 붙은 납작한 원
  const mg=mouth==='o'?new THREE.TorusGeometry(r*.08,r*.03,6,14):new THREE.TorusGeometry(r*.14,r*.032,6,16,PI);
  const m=stick(new THREE.Mesh(mg,ink),onFace(0,-r*.16,r*.0));if(mouth!=='o')m.rotateZ(PI);
  return {eyes,mouth:m};}
function pointyEars(head,r){[-1,1].forEach(s=>{const e=mesh(new THREE.ConeGeometry(r*.24,r*.62,6).translate(0,r*.31,0),mat(SKIN),head,s*r*.86,r*.08,-r*.04);e.rotation.z=-s*1.2;e.rotation.y=s*.2;e.scale.z=.5;});} // 작은 뾰족귀: 옆·조금 위로
/* 팔·다리: 짧고 동글동글 (어깨 축으로 흔든다) */
function limb(parent,x,y,len,rad,color){const piv=new THREE.Group();piv.position.set(x,y,0);parent.add(piv);
  const g=new THREE.CapsuleGeometry(rad,len,4,8).translate(0,-len/2-rad*.5,0);mesh(g,mat(color),piv);return piv;}
/* 버섯 갓 그림: 주황 바탕 + 아이보리 반점 셋(갓 위쪽) + 색연필 결 — 회전체 UV(u 둘레, v 아래→위) */
let capTex=null,gillTex=null;
const ctex=cv=>{const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;};
function capCanvas(){const S=256,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');
  const gr=g.createLinearGradient(0,S,0,0);gr.addColorStop(0,'#de8340');gr.addColorStop(.6,'#ec9a52');gr.addColorStop(1,'#f2ab64');g.fillStyle=gr;g.fillRect(0,0,S,S);
  for(let i=0;i<90;i++){const x=(i*37)%S,y=(i*61)%S;g.strokeStyle=`rgba(${i%2?'255,230,190':'170,80,30'},${.07+(i%4)*.02})`;g.lineWidth=1.3;g.beginPath();g.moveTo(x,y);g.lineTo(x+9,y-14);g.stroke();}
  // 반점: 정면에서 위 가운데 하나 + 양옆 둘(레퍼런스처럼), 뒤에 하나. u=.75 둘레 묶음(갓을 돌려 정면에)
  g.fillStyle='#f6ecd6';[[.75,.3,.075,.1],[.64,.62,.07,.1],[.86,.62,.07,.1],[.25,.5,.09,.12]].forEach(([u,v,rx,ry])=>{g.beginPath();g.ellipse(u*S,(1-v)*S,rx*S,ry*S,0,0,PI*2);g.fill();});
  g.strokeStyle='rgba(200,150,110,.35)';g.lineWidth=2;[[.75,.3,.075,.1],[.64,.62,.07,.1],[.86,.62,.07,.1],[.25,.5,.09,.12]].forEach(([u,v,rx,ry])=>{g.beginPath();g.ellipse(u*S,(1-v)*S,rx*S,ry*S,0,0,PI*2);g.stroke();});
  return cv;}
function gillCanvas(){const S=256,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');g.fillStyle='#f3e4c8';g.fillRect(0,0,S,S);
  for(let i=0;i<48;i++){const x=i/48*S;g.strokeStyle=i%2?'rgba(190,150,110,.55)':'rgba(255,248,232,.7)';g.lineWidth=2.2;g.beginPath();g.moveTo(x,0);g.lineTo(x,S);g.stroke();} // 둘레를 따라 촘촘한 주름 줄(u 방향)
  return cv;}
function fairy(kind){const root=new THREE.Group();root.name='fairy:'+kind;const body=new THREE.Group();root.add(body);let head,arms,legs,F;
  if(kind==='boatman'){
    // 연파랑 A자 옷(어깨가 둥근 종 모양) — 위가 어깨(y .52)
    mesh(lathe([[0,.0],[.2,0],[.2,.04],[.16,.2],[.125,.34],[.11,.37],[.06,.39],[0,.39]].map(q=>new THREE.Vector2(q[0],q[1])),16),mat('#9cc6e8','linen',{rep:[3,2]}),body,0,.14,0);
    legs=[-1,1].map(s=>limb(body,s*.06,.17,.08,.035,SKIN));
    head=new THREE.Group();head.position.set(0,.74,0);body.add(head);const r=.2;mesh(new THREE.SphereGeometry(r,20,16),mat(SKIN,'suede',{rep:[2,2]}),head);
    F=face(head,r);pointyEars(head,r);
    // 큰 초록 잎 모자: 머리에 얹힘(머리 위에 닿게) + 진한 가운데 맥 + 갈색 꼭지
    const hat=new THREE.Group();hat.position.set(0,r*.74,0);hat.rotation.z=.06;head.add(hat);
    const leaf=mesh(new THREE.SphereGeometry(.4,24,10),mat('#86bf4e','leaf',{rep:[2,1]}),hat);leaf.scale.set(1,.16,.55);
    const rib=mesh(new THREE.BoxGeometry(.78,.012,.03),mat('#5c9a34','plain'),hat,0,.06,0);rib.castShadow=false;
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,.04,0),new THREE.Vector3(.02,.16,0),new THREE.Vector3(.1,.23,0)]),8,.018,6),mat('#8a5a36','wood'),hat);
    // 팔: 어깨(옷 위쪽 옆)에서
    arms=[-1,1].map(s=>{const a=limb(body,s*.12,.48,.12,.034,SKIN);a.rotation.z=s*.45;return a;});
    // 나무 노: 오른손(-x)에 쥐고 몸 옆으로 비스듬히 — 손 끝에 붙여 팔과 함께 움직인다
    const oar=new THREE.Group();oar.position.set(0,-.17,.03);arms[0].add(oar);oar.rotation.set(.12,0,-.45); // 팔 기울기(-.45)를 되돌려 거의 곧게 + 앞으로 살짝
    mesh(new THREE.CylinderGeometry(.017,.019,.78,8),mat('#a06a3e','wood'),oar,0,-.12,0);const blade=mesh(new THREE.SphereGeometry(.07,10,8),mat('#9a6238','wood'),oar,0,-.52,0);blade.scale.set(1,1.6,.35);
    mesh(new THREE.SphereGeometry(.04,8,6),mat(SKIN,'suede'),oar,0,0,0); // 쥔 손
    root.userData.oar=oar;}
  else if(kind==='mushroom'){
    // 아래가 넓은 둥근 몸통 하나(배 모양) — 얼굴은 몸 위쪽 앞에
    mesh(lathe([[0,0],[.18,.01],[.26,.08],[.29,.2],[.28,.32],[.24,.42],[.17,.48],[0,.5]].map(q=>new THREE.Vector2(q[0],q[1])),24),mat('#f2dfc0','suede',{rep:[3,2]}),body,0,.05,0);
    legs=[-1,1].map(s=>limb(body,s*.09,.1,.03,.045,'#f2dfc0'));
    head=new THREE.Group();head.position.set(0,.33,0);body.add(head);const r=.3; // 얼굴 면(몸통 위쪽의 둥근 면에 맞춘 가상 구)
    F=face(head,r);
    // 갓: 머리 꼭대기를 덮게 낮게(갓 테두리가 눈썹 높이), 무늬는 텍스처 / 아래쪽은 크림색 주름
    capTex=capTex||ctex(capCanvas());gillTex=gillTex||ctex(gillCanvas());
    const cap=new THREE.Mesh(lathe([[.0,.3],[.14,.28],[.27,.21],[.37,.1],[.42,.02],[.41,-.02]].map(q=>new THREE.Vector2(q[0],q[1])),28),new THREE.MeshStandardMaterial({map:capTex,roughness:.9,metalness:0,side:THREE.DoubleSide})); // 회전체 면이 안쪽을 봐서 양면으로(앞면이 빠져 갓 속이 비쳐 보이던 것)
    cap.position.set(0,.41,0);cap.rotation.y=PI/2;cap.castShadow=true;body.add(cap); // 반점 셋 묶음이 정면에 오게 // 갓 테두리가 눈썹 바로 위 — 머리 윗부분은 갓 속에 숨는다
    const gill=new THREE.Mesh(new THREE.RingGeometry(.001,.41,28,1),new THREE.MeshStandardMaterial({map:gillTex,roughness:.95,metalness:0,side:THREE.DoubleSide}));
    gill.rotation.x=PI/2;gill.position.set(0,.395,0);body.add(gill);
    {const uv=gill.geometry.attributes.uv,p=gill.geometry.attributes.position;for(let k=0;k<uv.count;k++){const a=Math.atan2(p.getY(k),p.getX(k));uv.setXY(k,(a/PI/2+.5)*6,Math.hypot(p.getX(k),p.getY(k)));}} // 주름 줄이 둘레를 따라 촘촘히
    arms=[-1,1].map(s=>{const a=limb(body,s*.25,.2,.07,.042,'#f2dfc0');a.rotation.z=s*.75;a.rotation.x=-.25;mesh(new THREE.SphereGeometry(.055,10,8),mat('#f2dfc0'),a,0,-.16,0);return a;});} // 팔은 몸통 옆 아래쪽에서(귀처럼 보이지 않게), 끝에 동그란 손
  let wave=false,mood='기본';
  const P={root,head,arms,legs,body,face:F,
    wave(on){wave=!!on;},setMood(n){mood=n;},
    tick(dt,t){const ph=t*2+(root.id%7);body.position.y=Math.abs(Math.sin(ph))*.012;head.rotation.z=kind==='mushroom'?0:Math.sin(t*.9+root.id)*.06;
      if(kind==='mushroom')body.rotation.z=Math.sin(ph)*.05; // 뒤뚱뒤뚱
      if(arms){const w=wave?Math.sin(t*9)*.35:0;arms[1].rotation.z=wave?1.75+w*.6:(kind==='boatman'?.45:.75);arms[0].rotation.z=-(kind==='boatman'?.45:.75);} // 흔드는 팔은 바깥·위로 (머리·귀에 닿지 않게)
      if(root.userData.oar)root.userData.oar.rotation.x=.12+Math.sin(t*1.6)*.1;}};
  return P;}
/* 휴대폰 단계(2026-11-02 발열): 요정 한 명의 부품을 텍스처마다 한 덩어리로 합친다(색은 정점 색, 재질은 이 요정 전용 — 가림 흐림이 다른 물체로 번지지 않게).
   같은 부모 아래 부품끼리만 합쳐 움직이는 마디(머리·팔·노)는 그대로 움직인다. into(그룹)를 주면 그 아래는 모두 into 하나로(버섯 요정은 몸이 통째로 뒤뚱이고 팔·머리는 가만히 있어서) */
function bakeFairy(P,{into=null}={}){const root=P.root;root.updateMatrixWorld(true);const B=new Map(),M4=new THREE.Matrix4(),inv=new THREE.Matrix4();
  root.traverse(m=>{if(!m.isMesh||m.children.length)return;let t=m.parent;if(into){let q=m;while(q&&q!==into)q=q.parent;if(q)t=into;}
    const mt=m.material,k=t.uuid+'|'+(mt.map?mt.map.uuid:'-')+'|'+mt.side+'|'+mt.transparent+'|'+mt.type;if(!B.has(k))B.set(k,{t,list:[]});B.get(k).list.push(m);});
  B.forEach(({t,list})=>{if(list.length<2)return;inv.copy(t.matrixWorld).invert();
    const geos=list.map(m=>{const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();for(const a of Object.keys(g.attributes))if(!['position','normal','uv'].includes(a))g.deleteAttribute(a);g.clearGroups();
      g.applyMatrix4(M4.multiplyMatrices(inv,m.matrixWorld));const c=m.material.color,n=g.attributes.position.count,col=new Float32Array(n*3);for(let i=0;i<n;i++)col.set([c.r,c.g,c.b],i*3);g.setAttribute('color',new THREE.BufferAttribute(col,3));return g;});
    const mt=list[0].material.clone();mt.color.setRGB(1,1,1);mt.vertexColors=true;const mm=new THREE.Mesh(mergeGeometries(geos),mt);mm.castShadow=list.some(m=>m.castShadow);mm.receiveShadow=true;t.add(mm);
    geos.forEach(g=>g.dispose());list.forEach(m=>m.parent.remove(m));});
  return P;}
/* 이슬배: 연파랑 그릇 배 (사공 요정 시트의 배) — scale로 크기만 바꿔 쓴다 */
function dewBoat(scale=1){const g=new THREE.Group();g.name='dewBoat';
  const bowl=mesh(lathe([[0,0],[.38,.01],[.55,.08],[.62,.2],[.6,.22],[.52,.12],[.36,.06],[0,.05]].map(q=>new THREE.Vector2(q[0],q[1])),18),mat('#8cc4e2','suede'),g);bowl.material=bowl.material;
  g.scale.setScalar(scale);return g;}
/* 나뭇잎배(2026-11-02, 그릇 배 대신): 길쭉한 잎 한 장이 배 — 가운데가 오목하고 가장자리가 위로 말려 올라가며 앞뒤 끝이 들린다. 가운데 잎맥 + 옆 잎맥 넷씩, 뒤쪽에 말린 잎자루.
   leafBoat(길이, 폭) → Group (앞 = +z, 바닥 가운데가 y 0). userData.floor(u) = 길이 방향 자리 u(-1 뒤 … +1 앞)의 바닥 높이, userData.half(u) = 그 자리 반폭 */
function leafBoat(L=2.6,W=1.15,{color='#8cc05c',rib='#6f9e44'}={}){const g=new THREE.Group();g.name='leafBoat';
  const half=u=>W/2*Math.pow(Math.max(0,1-u*u),.55)*(1-.1*u),
    at=(u,v)=>{const ax=Math.abs(v),h=half(u);return new THREE.Vector3(v*h*(1-.1*ax**4),.18*u*u*(1-v*v)+.3*ax**3*(1-.45*u*u)+.16*u**4,u*L/2);}; // 오목한 바닥 + 말려 올라간 가장자리 + 들린 앞뒤 끝
  const NU=30,NV=14,pos=[],uv=[],idx=[];
  for(let i=0;i<=NU;i++)for(let j=0;j<=NV;j++){const p=at(i/NU*2-1,j/NV*2-1);pos.push(p.x,p.y,p.z);uv.push(j/NV*1.4,i/NU*3);}
  for(let i=0;i<NU;i++)for(let j=0;j<NV;j++){const a=i*(NV+1)+j,b=a+NV+1;idx.push(a,b,a+1,a+1,b,b+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
  const hull=mesh(geo,mat(color,'leaf',{rep:[1,2]}),g);hull.material=hull.material.clone();hull.material.side=THREE.DoubleSide;
  const tube=(pts,r,c)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),Math.max(6,pts.length*3),r,5),mat(c,'leaf'),g);
  const lift=(p,d=.012)=>p.add(new THREE.Vector3(0,d,0));
  tube([-.97,-.6,-.2,.2,.6,.95].map(u=>lift(at(u,0),.018)),.024,rib); // 가운데 잎맥
  for(const s of [-1,1])[-.55,-.2,.15,.5].forEach(u0=>tube([0,.3,.6,.85].map(k=>lift(at(u0+k*.28,s*k),.012)),.012,rib)); // 옆 잎맥: 가운데에서 앞쪽으로 비스듬히 가장자리까지
  {const e=at(-1,0);tube([e,e.clone().add(new THREE.Vector3(0,.12,-.18)),e.clone().add(new THREE.Vector3(0,.3,-.2)),e.clone().add(new THREE.Vector3(0,.36,-.08))],.03,rib);} // 뒤쪽 잎자루(위로 말림)
  {const parts=[...g.children],geos=parts.map(m=>{const q=(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone());for(const a of Object.keys(q.attributes))if(!['position','normal','uv'].includes(a))q.deleteAttribute(a);q.clearGroups();
     m.updateMatrix();q.applyMatrix4(m.matrix);const c=m.material.color,n=q.attributes.position.count,col=new Float32Array(n*3);for(let i=0;i<n;i++)col.set([c.r,c.g,c.b],i*3);q.setAttribute('color',new THREE.BufferAttribute(col,3));return q;});
   const mt=hull.material.clone();mt.color.setRGB(1,1,1);mt.vertexColors=true;parts.forEach(m=>{g.remove(m);m.geometry.dispose();});mesh(mergeGeometries(geos),mt,g);geos.forEach(q=>q.dispose());} // 배 한 척 = 그리기 1번(잎맥·잎자루는 정점 색)
  g.userData.floor=u=>at(u,0).y;g.userData.half=half;return g;}
/* 민들레 홀씨 우산(활공 물건, 2026-11-02 — 살만 남은 우산 대신): 가는 연두 줄기 끝에 하얀 솜털 다발이 둥글게 퍼진 폭신한 공, 가운데는 연노랑.
   원점 = 줄기 아래 끝(손잡이), +y 위. 줄기는 손에서 바깥으로 올라갔다가 reach(+x)만큼 안쪽으로 휘어 들어온다 — 약 2등신이라 든 손이 뺨 높이라서,
   곧은 줄기면 큰 탈을 뚫는다(원더룹 오른손이 -x 쪽이니 reach가 머리 가운데까지). 솜털은 안·바깥 두 겹(각각 한 번에 그림)이고 sway(t, k)로 살랑인다(k 0~1 — 활공할 때 1) */
function dandelionPuff({stem=1.75,reach=0,R=.44}={}){const g=new THREE.Group();g.name='dandelionPuff';
  const st=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(-.12-reach*.6,stem*.4,0),new THREE.Vector3(-.1-reach*.55,stem*.78,0),new THREE.Vector3(reach*.2,stem*.97,0),new THREE.Vector3(reach,stem,0)]);
  mesh(new THREE.TubeGeometry(st,16,.024,6),mat('#a9c77a','leaf'),g);
  const top=new THREE.Group();top.position.set(reach,stem+.03,0);g.add(top);
  mesh(new THREE.SphereGeometry(.085,12,9),mat('#f6e48a','plain'),top);mesh(new THREE.SphereGeometry(.05,8,6),mat('#a9c77a','leaf'),top,0,-.07,0); // 연노랑 가운데 + 줄기와 이어지는 꽃받침
  const fluff=toon('#ffffff',{emissive:'#fffaf0',ei:.42}),thread=toon('#f4efe2',{emissive:'#ffffff',ei:.3});
  const layers=[{n:70,r:R,tuft:.05,a:0},{n:36,r:R*.74,tuft:.042,a:.4}].map(L=>{const lg=new THREE.Group();top.add(lg);const fil=[],tuf=[],up=new THREE.Vector3(0,1,0),q=new THREE.Quaternion();
    for(let i=0;i<L.n;i++){const y=1-2*(i+.5)/L.n,rr=Math.sqrt(1-y*y),a=i*2.39996+L.a,d=new THREE.Vector3(Math.cos(a)*rr,y,Math.sin(a)*rr);if(d.y<-.72)continue; // 아래(줄기 쪽)는 비워 둔다
      q.setFromUnitVectors(up,d);fil.push(new THREE.CylinderGeometry(.0045,.0045,L.r*.9,3).translate(0,L.r*.45,0).applyQuaternion(q));
      tuf.push(new THREE.ConeGeometry(L.tuft,L.tuft*.7,7,1,true).rotateX(PI).translate(0,L.r+L.tuft*.2,0).applyQuaternion(q)); // 솜털 다발: 끝이 우산처럼 퍼진 하얀 갓털
      tuf.push(new THREE.SphereGeometry(L.tuft*.55,6,4).scale(1,.45,1).translate(0,L.r+L.tuft*.35,0).applyQuaternion(q));}
    mesh(mergeGeometries(fil),thread,lg);const tm=mesh(mergeGeometries(tuf),fluff,lg);tm.material=fluff.clone();tm.material.side=THREE.DoubleSide;fil.concat(tuf).forEach(x=>x.dispose());return lg;});
  const haze=new THREE.Mesh(new THREE.SphereGeometry(R*.93,18,14),new THREE.MeshBasicMaterial({color:0xfffdf6,transparent:true,opacity:.42,depthWrite:false}));top.add(haze); // 솜털 사이를 채우는 옅은 흰 기운(멀리서 보면 폭신한 흰 공)
  g.traverse(o=>{if(o.isMesh)o.castShadow=o!==haze;});
  g.userData.sway=(t,k)=>{layers[0].rotation.set(Math.sin(t*2.1)*.07*k,t*.25*k,Math.sin(t*1.7+1)*.08*k);layers[1].rotation.set(Math.sin(t*2.6+2)*.09*k,-t*.18*k,Math.sin(t*2.2)*.06*k);
    const b=1+Math.sin(t*3.2)*.025*k;layers[0].scale.setScalar(b);top.rotation.z=Math.sin(t*1.3)*.06*k;};
  return g;}
/* 구역을 떠날 때: 요정 재질·갓 무늬 캐시를 놓는다(다음 구역에서 다시 만들면 같은 그림) */
/* 마을 주민 요정(2026-11-03 — 개미굴 마을처럼 북적이게): 꽃 요정·바람 요정·작은 버섯 요정. 기준 그림 fairy-flower·fairy-wind·fairy-mushroom의 생김새를 따르되 색만 여러 가지.
   재질은 흰 천 결 그림 한 장에 색만 곱한 것(vmat)이라 bakeFairy(into: body)로 주민 하나가 그리기 1번(휴대폰 스테이지 예산).
   villager(kind, {petal, dress, hair, cap}) → {root, body, tick(dt, t, moving)} — 걸을 때 통통 튀고 팔을 흔든다. 키 약 0.75(원더룹보다 작게), 얼굴 앞 +z, 발바닥 y=0 */
let vTex=null;const vmats={};
function vmat(c){if(!vTex)vTex=pencil('#ffffff','suede',{rep:[2,2]});return vmats[c]||(vmats[c]=new THREE.MeshStandardMaterial({map:vTex,color:new THREE.Color(c),roughness:.95,metalness:0}));}
function vface(head,r){const ink=vmat(INK),pink=vmat(CHEEK);const onFace=(x,y,out=0)=>{const z=Math.sqrt(Math.max(0,r*r-x*x-y*y));return new THREE.Vector3(x,y,z).normalize().multiplyScalar(r+out);};
  const stick=(m,p)=>{m.position.copy(p);m.lookAt(p.clone().multiplyScalar(2));head.add(m);m.castShadow=false;return m;};
  [-1,1].forEach(s=>{const e=stick(new THREE.Mesh(new THREE.SphereGeometry(r*.12,10,8),ink),onFace(s*r*.34,r*.02,-r*.03));e.scale.set(.9,1.1,.55);});
  [-1,1].forEach(s=>stick(new THREE.Mesh(new THREE.CircleGeometry(r*.16,14),pink),onFace(s*r*.55,-r*.2,r*.035)));
  const m=stick(new THREE.Mesh(new THREE.TorusGeometry(r*.13,r*.032,6,14,PI),ink),onFace(0,-r*.17,0));m.rotateZ(PI);}
function villager(kind,o={}){const root=new THREE.Group();root.name='villager:'+kind;const body=new THREE.Group();root.add(body);
  const vm=(g,c,par=body,x=0,y=0,z=0)=>{const m=new THREE.Mesh(g,vmat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;par.add(m);return m;};
  const limbs=[],legs=[];const lim=(x,y,len,rad,c,arr)=>{const piv=new THREE.Group();piv.position.set(x,y,0);body.add(piv);vm(new THREE.CapsuleGeometry(rad,len,3,6).translate(0,-len/2-rad*.5,0),c,piv);arr.push(piv);return piv;};
  let head,r=.17;
  if(kind==='mushroom'){const cap=o.cap||'#e9824a';
    vm(lathe([[0,0],[.15,.01],[.21,.07],[.23,.17],[.21,.27],[.15,.33],[0,.35]].map(q=>new THREE.Vector2(q[0],q[1])),14),'#f2dfc0',body,0,.04,0);
    head=new THREE.Group();head.position.set(0,.24,0);body.add(head);r=.22;vface(head,r);
    const c=vm(lathe([[0,.22],[.11,.2],[.21,.14],[.29,.06],[.31,0]].map(q=>new THREE.Vector2(q[0],q[1])),16),cap,body,0,.3,0);c.material=vmat(cap);
    [[0,.47,.12],[.12,.44,.06],[-.1,.45,.08]].forEach(([x,y,z])=>{const d=vm(new THREE.SphereGeometry(.045,8,6),'#fbf1de',body,x,y,z);d.scale.y=.4;});
    [-1,1].forEach(s=>{const a=lim(s*.2,.16,.05,.035,'#f2dfc0',limbs);a.rotation.z=s*.7;});[-1,1].forEach(s=>lim(s*.07,.08,.02,.035,'#f2dfc0',legs));}
  else{const dress=o.dress||(kind==='wind'?'#a9d8b0':'#f6dc84');
    vm(lathe([[0,0],[.16,0],[.16,.03],[.12,.18],[.09,.29],[.05,.31],[0,.31]].map(q=>new THREE.Vector2(q[0],q[1])),12),dress,body,0,.13,0);
    if(kind==='flower')vm(new THREE.CylinderGeometry(.162,.165,.04,12,1,true),o.hem||'#f2a6b4',body,0,.15,0);
    [-1,1].forEach(s=>lim(s*.055,.15,.06,.03,SKIN,legs));
    head=new THREE.Group();head.position.set(0,.6,0);body.add(head);vm(new THREE.SphereGeometry(r,16,12),SKIN,head);vface(head,r);
    [-1,1].forEach(s=>{const e=vm(new THREE.ConeGeometry(r*.24,r*.6,5).translate(0,r*.3,0),SKIN,head,s*r*.86,r*.08,-r*.04);e.rotation.z=-s*1.2;e.scale.z=.5;});
    [-1,1].forEach(s=>{const a=lim(s*.1,.4,.1,.028,SKIN,limbs);a.rotation.z=s*.4;});
    if(kind==='flower'){const pc=o.petal||'#f4a7b9';
      [-2.05,-1.1,0,1.1,2.05].forEach((a,i)=>{const p=vm(new THREE.SphereGeometry(.16,10,8),pc,head,Math.sin(a)*r*1.3,Math.cos(a)*r*1.15+.02,-r*.5);p.scale.set(1,1.2,.55);p.rotation.z=-a;}); // 기준 그림처럼 머리보다 큰 꽃잎 다섯
      const g=vm(new THREE.IcosahedronGeometry(.05,0),'#f2c14e',head,0,r*.95,r*.25);}
    else{const hc=o.hair||'#8a5a3c';const h=vm(new THREE.SphereGeometry(r*1.05,16,10,0,PI*2,0,PI*.55),hc,head);h.rotation.x=-.5;
      [-1,1].forEach(s=>{const c=vm(new THREE.TorusGeometry(.055,.018,6,12,PI*1.5),hc,head,s*.06,r*1.05,-.02);c.rotation.set(0,s*.3,s>0?-.3:PI+.3);});
      [-1,1].forEach(s=>{const w=vm(new THREE.SphereGeometry(.16,12,8),o.wing||'#bcd8f2',body,s*.15,.48,-.13);w.scale.set(.75,1,.12);w.rotation.set(.1,s*.5,s*.35);});}}
  root.traverse(m=>{if(m.isMesh)m.castShadow=true;});
  let ph=(root.id*1.37)%6; // 난수 대신 물체 번호로(촬영 모드에서도 같은 그림)
  return {root,body,head,kind,tick(dt,t,moving=false){ph+=dt*(moving?9:2);const hop=moving?Math.abs(Math.sin(ph))*.05:Math.abs(Math.sin(ph*.5))*.008;body.position.y=hop;
    if(kind==='mushroom')body.rotation.z=Math.sin(ph)*(moving?.12:.04);else head.rotation.z=Math.sin(t*.9+root.id)*.06;
    limbs.forEach((a,i)=>{a.rotation.x=moving?Math.sin(ph+(i?PI:0))*.6:Math.sin(t*1.3+i)*.08;});legs.forEach((l,i)=>{l.rotation.x=moving?Math.sin(ph+(i?0:PI))*.5:0;});}};}
/* 무당벌레(숨겨진 비밀 둘째): 클로버 그늘에서 낮잠 — 빨간 등딱지(검은 점 다섯)·검은 머리·감은 눈. 길이 약 0.3m */
function ladybug(){const root=new THREE.Group();root.name='fairy:ladybug';const body=new THREE.Group();root.add(body);
  const red=mat('#e2493c'),blk=mat('#3a2a2a'),wh=mat('#fffaf0','plain');
  const shell=mesh(new THREE.SphereGeometry(.13,16,10,0,PI*2,0,PI/2),red,body,0,.03,0);shell.scale.set(1,.85,1.2);
  mesh(new THREE.CylinderGeometry(.115,.115,.03,16),blk,body,0,.03,0).scale.set(1,1,1.2);
  [[.06,.1,.05],[-.06,.1,.05],[.07,.08,-.08],[-.07,.08,-.08],[0,.115,-.02]].forEach(([x,y,z])=>{const d=mesh(new THREE.SphereGeometry(.025,8,6),blk,body,x,y,z);d.scale.y=.5;});
  const head=mesh(new THREE.SphereGeometry(.05,12,8),blk,body,0,.05,.15);
  [-1,1].forEach(s=>{const e=mesh(new THREE.TorusGeometry(.012,.004,4,8,PI),wh,head,s*.025,.02,.05);e.rotation.z=PI;});
  root.traverse(o=>{if(o.isMesh)o.castShadow=false;});
  return {root,tick(dt,t){body.scale.y=1+Math.sin(t*1.6)*.03;}};}
/* 아기 소금쟁이(숨겨진 비밀, 2026-11-03): 물 위에 서는 가늘고 긴 다리 여섯, 길쭉한 갈색 몸, 큰 점 눈·볼터치. 길이 약 0.5m(원더룹보다 훨씬 작다).
   strider() → {root, tick(dt,t)} — 앞다리로 물을 톡톡(인사), 몸이 살짝 미끄러졌다 돌아온다. 발 끝은 y=0(물 면) */
function strider(){const root=new THREE.Group();root.name='fairy:strider';const body=new THREE.Group();root.add(body);body.position.y=.13;
  const bm=mat('#9a7350'),dk=mat('#6e4e34'),ink=mat(INK,'plain'),pink=mat(CHEEK,'plain'),wh=mat('#fffaf0','plain');
  const torso=mesh(new THREE.SphereGeometry(.07,12,9),bm,body,0,0,-.05);torso.scale.set(.85,.7,2.1);
  const head=mesh(new THREE.SphereGeometry(.062,14,10),bm,body,0,.02,.11);
  [-1,1].forEach(sx=>{const e=mesh(new THREE.SphereGeometry(.026,10,8),wh,head,sx*.034,.026,.03);mesh(new THREE.SphereGeometry(.016,8,6),ink,e,0,.002,.015);
    const c=mesh(new THREE.CircleGeometry(.013,10),pink,head,sx*.045,-.012,.042);c.lookAt(c.position.clone().multiplyScalar(3).add(head.getWorldPosition(new THREE.Vector3())));});
  [-1,1].forEach(sx=>{const a=mesh(new THREE.CylinderGeometry(.004,.004,.09,5),dk,head,sx*.018,.07,.0);a.rotation.z=-sx*.35;a.rotation.x=-.4;});
  const legs=[];const L=[[.08,.2,.5],[0,.32,.05],[-.11,.34,-.45]]; // [몸 z, 길이, 펼침 각]
  L.forEach(([z,len,ay],i)=>[-1,1].forEach(sx=>{const piv=new THREE.Group();piv.position.set(sx*.04,0,z);body.add(piv);
    const up=mesh(new THREE.CylinderGeometry(.006,.005,len*.45,5).translate(0,len*.225,0),dk,piv);up.rotation.z=-sx*1.0;
    const knee=new THREE.Group();knee.position.set(sx*Math.sin(1.0)*len*.45,Math.cos(1.0)*len*.45,0);piv.add(knee);
    const lo=mesh(new THREE.CylinderGeometry(.005,.003,len*.75,5).translate(0,-len*.375,0),dk,knee);lo.rotation.z=sx*1.12;
    const foot=mesh(new THREE.SphereGeometry(.012,6,4),dk,knee,sx*Math.sin(1.12)*len*.75,-Math.cos(1.12)*len*.75,0);foot.scale.y=.4;
    piv.rotation.y=sx*ay;legs.push({piv,sx,i});}));
  root.traverse(o=>{if(o.isMesh)o.castShadow=false;});
  return {root,tick(dt,t){const k=Math.sin(t*5);legs.forEach(l=>{if(l.i===0)l.piv.rotation.x=-Math.max(0,k)*.35*(l.sx>0?1:.4);});body.position.y=.13+Math.sin(t*2.4)*.006;
    root.position.x+=Math.sin(t*.9)*.0015;body.rotation.y=Math.sin(t*.7)*.12;}};}
function clearFairyCache(){for(const k in vmats){vmats[k].dispose();delete vmats[k];}if(vTex){vTex.dispose();vTex=null;}for(const k in mats){mats[k].dispose();delete mats[k];}if(capTex){capTex.dispose();capTex=null;}if(gillTex){gillTex.dispose();gillTex=null;}}
export {bakeFairy,clearFairyCache,dandelionPuff,dewBoat,fairy,ladybug,leafBoat,strider,villager};
