/* 요정의 숲 — 요정 모델 (기준 그림 wonderloop-studio/fairy-forest/ref/match/fairy-*.png, 생김새·색을 그대로. 장식 의상·소품을 더하지 않는다)
   사공·꽃·바람 요정은 작은 뾰족귀, 버섯 요정은 귀 없음. 모두 원더룹보다 작다(키 약 0.8, 원더룹 약 1.3).
   재질: 원더룹처럼 부드러운 음영 + 색연필 천 결(옷 linen, 피부 suede, 잎 leaf), 버섯 갓 무늬·주름은 캔버스 텍스처로 그린다(메시를 얹지 않음).
   볼터치는 얼굴 면에 붙여 납작하게(떠 보이지 않게). 팔은 어깨(몸통 위쪽)에서, 노는 손에 쥐어 몸 옆으로.
   fairy(kind) → {root, head, arms:[왼,오], tick(dt,t), wave(on), setMood(name)}
     kind: 'boatman' 사공(잎 모자·연파랑 옷·노) · 'mushroom' 버섯(주황 갓·아이보리 반점 셋·크림 통통 몸)
   이슬배(boatman이 탄 파란 그릇 배): dewBoat() → Group (지름 약 1.3, 원더룹이 탈 수 있는 크기는 bigDewBoat())
   얼굴 앞은 +z. 발바닥이 y=0. 그림자는 휴대폰 단계에서 구역이 shadowBlob을 단다. */
import * as THREE from 'three';
import {M,PI,lathe} from '../../01-textures.js';
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
/* 이슬배: 연파랑 그릇 배 (사공 요정 시트의 배) — scale로 크기만 바꿔 쓴다 */
function dewBoat(scale=1){const g=new THREE.Group();g.name='dewBoat';
  const bowl=mesh(lathe([[0,0],[.38,.01],[.55,.08],[.62,.2],[.6,.22],[.52,.12],[.36,.06],[0,.05]].map(q=>new THREE.Vector2(q[0],q[1])),18),mat('#8cc4e2','suede'),g);bowl.material=bowl.material;
  g.scale.setScalar(scale);return g;}
export {dewBoat,fairy};
