/* 원더룹 베이스캠프 — 바지·관절·캐릭터 병합·평상복/탐험복·탐험 모자·배낭과 키링(두 옷 모두)·탈 카테고리 */
import * as THREE from 'three';
import {PI,lathe,lin,pencil} from './01-textures.js';
import {SM,TM,WL,head,hoodParts,legs,roundBox,shorts,skin,tunic,wlBase,wlBody,wm,wmList} from './04-character.js';
import {CROWN,CROWN_BLOOM} from './hoods/crown.js';
/* 탈 교체 (세계마다 탈 하나) — 탈 번호 hw: 0 없음 · 1 개미탈(04) · 2 탐험 모자(아래)
   새 세계 탈: js/hoods/<이름>.js 의 build({head,wm,TM,SM}) → {g, profile, top}을 만들어 import하고 HOODS 끝에 {key,name,mod}로 더한다.
   여기서 hoodParts(아틀라스 교체 영역)에 넣고 userData.hw로 번호를 붙인다(05 applyLook이 그 번호일 때만 보임).
   머리 처리: 개미탈은 탈 아래 앞머리(05), 모자형 탈은 안쪽 머리만 눌러 넣기(pressHair, 탈의 profile·top). 구역 정보 hood:'<key>' → 들어올 때 그 탈(08).
   번호 0~2는 기준 촬영·영상 대본(setup({hood}))이 쓰므로 바꾸지 않고 뒤에 붙인다. */
const HOODS=[{key:'none',name:'없음'},{key:'ant',name:'개미탈'},{key:'hat',name:'탐험 모자'},
  {key:'crown',name:'화관(봉오리)',mod:CROWN},{key:'crownBloom',name:'화관(핌)',mod:CROWN_BLOOM}]; // 요정의 숲: 봉오리 화관 → 클라이맥스에 별꽃 보석이 들어가면 핀 화관(morphHood('crownBloom')) + 별가루
HOODS.forEach((h,i)=>{if(!h.mod)return;const r=h.mod.build({head,wm,TM,SM});r.g.userData.hw=i;hoodParts.push(r.g);h.press=r;});
WL.userData.hoods=HOODS;
/* 디테일: 옷 구조 + 탐험대 패치 */
{
  const cream=SM('#f3ead6');
  legs.forEach(lg=>{const kn=lg.userData.knee;lg.add(wm(new THREE.SphereGeometry(.086,16,12),shorts));lg.add(wm(new THREE.CylinderGeometry(.084,.081,.19,16).translate(0,-.03,0),shorts));
    kn.add(wm(new THREE.SphereGeometry(.081,16,12),shorts));kn.add(wm(new THREE.CylinderGeometry(.081,.078,.085,16).translate(0,-.0425,0),shorts));
    const roll=wm(new THREE.CylinderGeometry(.086,.086,.04,18),TM('#7d96cc','denim',{rep:[3,1],grain:.35}));roll.position.y=-.06;kn.add(roll);
    const fold=wm(new THREE.TorusGeometry(.086,.008,6,22),SM('#3f5a9c'));fold.rotation.x=PI/2;fold.position.y=-.04;kn.add(fold);(WL.userData.rf=WL.userData.rf||[]).push(roll,fold);});
  {const pel=wm(new THREE.SphereGeometry(.12,22,16),shorts);pel.scale.set(1.55,.78,1.15);pel.position.set(0,.33,-.01);wlBase.add(pel);}
}
/* 캐릭터 최적화: 같은 부모·같은 재질의 고정 부품을 한 덩어리로 합침 (움직이는 관절, 전환되는 부품, 머리카락은 그대로) */
function wlMerge(list){
  const sig=m=>[m.type,m.map?m.map.uuid:'',m.color?m.color.getHexString():'',m.side,m.transparent,m.opacity,m.emissive?m.emissive.getHexString()+m.emissiveIntensity:''].join('|');
  const groups=new Map();list.forEach(o=>{if(!o.isMesh||Array.isArray(o.material)||o.children.length||!o.parent)return;const k=o.parent.uuid+'#'+sig(o.material)+'#'+o.castShadow+'#'+o.visible;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o);});
  const made=[],removed=new Set();
  groups.forEach(arr=>{if(arr.length<2)return;const pos=[],nor=[],uv=[],nm=new THREE.Matrix3(),v=new THREE.Vector3();
    arr.forEach(o=>{o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry;const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;nm.getNormalMatrix(o.matrix);
      for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(o.matrix);pos.push(v.x,v.y,v.z);if(N){v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor.push(v.x,v.y,v.z);}else nor.push(0,1,0);if(U)uv.push(U.getX(i),U.getY(i));else uv.push(0,0);}});
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    const m=new THREE.Mesh(g,arr[0].material);m.castShadow=arr[0].castShadow;m.receiveShadow=true;m.visible=arr[0].visible;arr[0].parent.add(m);
    arr.forEach(o=>{o.parent.remove(o);removed.add(o);});made.push(m);});
  return {made,removed};}
{const skip=new Set([...(WL.userData.hairMeshes||[]),...(WL.userData.noMerge||[]),...(WL.userData.rf||[])]);
 const inHood=o=>{let q=o;while(q&&q!==WL){if(hoodParts.includes(q))return true;q=q.parent;}return false;};
 wlMerge(wmList.filter(o=>!skip.has(o)&&!inHood(o)));}
/* 의상 전환: 평상복(기준 자산) ↔ 탐험복 */
{
  const shirtMs=[],pantsMs=[];WL.traverse(o=>{if(o.isMesh&&o.material===tunic)shirtMs.push(o);if(o.isMesh&&o.material===shorts)pantsMs.push(o);});
  const rf=WL.userData.rf||[];const rfBase=rf.map(o=>o.material);
  const E={shirt:TM('#f7f2e8','linen',{rep:[3,3]}),pants:TM('#8f8558','twill',{rep:[2,3],grain:.35}),roll:TM('#b3a978','twill',{rep:[3,1],grain:.35}),fold:SM('#6c643f')};WL.userData.outfitMats=Object.values(E); // 아틀라스가 탐험복 텍스처 층을 미리 잡도록
  const exp=[];const vestM=TM('#c99d5c','canvas',{rep:[3,2]},THREE.DoubleSide);const vestD=TM('#a87e43','canvas',{rep:[2,1]});
  const add2=(m,parent)=>{parent.add(m);exp.push(m);return m;};
  // 배낭·침낭·나침반 키링은 평상복·탐험복 모두에 (2026-10-31 — 어느 옷이든 받은 아이템이 배낭에 달려 계속 보인다)
  const pack=[];const add3=(m,parent)=>{parent.add(m);pack.push(m);return m;};
  add2(wm(lathe([[.236,.33],[.238,.4],[.24,.45],[.233,.52],[.218,.565],[.185,.603]].map(q=>new THREE.Vector2(q[0],q[1])),30,.32,PI*2-.64),vestM),wlBody);
  [-1,1].forEach(s=>{const pk=add2(wm(roundBox(.068,.056,.014,.35),vestM),wlBody);pk.position.set(s*.175,.405,.176);pk.rotation.y=s*.82;
    const fl=add2(wm(roundBox(.07,.017,.019,.35),vestD),wlBody);fl.position.set(s*.177,.46,.179);fl.rotation.y=s*.82;});
  add2(wm(new THREE.CylinderGeometry(.232,.232,.034,30),TM('#7a4a32','leather2',{rep:[6,1],stitch:'h'})),wlBody).position.y=.322;
  {const bk=add2(wm(roundBox(.035,.024,.01,.4),SM('#f2b63c')),wlBody);bk.position.set(0,.322,.233);}
  const nkM=SM('#ec8b7d'),bandM=TM('#ec8b7d','plain',{hatch:.45},THREE.DoubleSide);
  {const nk=add2(wm(new THREE.TorusGeometry(.16,.042,10,28),nkM),wlBody);nk.rotation.x=PI/2;nk.position.y=.605;
   // 가슴을 덮는 큰 삼각 반다나: 조끼·셔츠 면을 따라 휘어짐
   {const VP=[[.33,.236],[.4,.238],[.45,.24],[.52,.233],[.565,.218],[.603,.185]];
    const Rv=y=>{for(let k=1;k<VP.length;k++){if(y<=VP[k][0]){const a=VP[k-1],b=VP[k],u=(y-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*u;}}return VP[VP.length-1][1];};
    const NY=12,NX=16,pos=[],uv=[],idx=[];
    for(let j=0;j<=NY;j++){const t=j/NY,y=.608-.1*t,half=.125*(1-t)+.004;
      for(let i=0;i<=NX;i++){const u=i/NX*2-1,x=u*half,e=Math.min(1,t*2.5),R=Rv(y)+.013;pos.push(x,y,Math.sqrt(Math.max(0,R*R-x*x)));uv.push(u*.5+.5,1-t);}}
    for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const a=j*(NX+1)+i,b=a+NX+1;idx.push(a,b,a+1,a+1,b,b+1);}
    const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));bg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));bg.setIndex(idx);bg.computeVertexNormals();
    add2(wm(bg,bandM),wlBody);}}
  // 탐험가 모자: 머리 위에 얹히고 앞챙이 살짝 들려 앞머리가 보임
  {const hatG=new THREE.Group();hatG.position.set(0,.33,-.1);hatG.rotation.x=-.3;hatG.scale.setScalar(.9);head.add(hatG);WL.userData.hatG=hatG;
   const hatM=TM('#dcc48e','canvas',{rep:[4,2]},THREE.DoubleSide);
   hatG.add(wm(lathe([[0,.235],[.12,.23],[.215,.21],[.262,.16],[.29,.07],[.305,0]].map(q=>new THREE.Vector2(q[0],q[1])),36),hatM));
   hatG.add(wm(lathe([[.3,.012],[.37,0],[.44,-.03],[.47,-.05],[.465,-.062],[.43,-.045],[.36,-.015],[.3,-.002]].map(q=>new THREE.Vector2(q[0],q[1])),40),hatM));
   const band=wm(new THREE.CylinderGeometry(.296,.303,.045,36,1,true),new THREE.MeshStandardMaterial({map:pencil('#7a4a32','plain',{hatch:.4}),roughness:.9,side:THREE.DoubleSide}));band.position.y=.03;hatG.add(band);
   const pin=wm(new THREE.SphereGeometry(.03,12,10),SM('#ec8b7d'));pin.position.set(.21,.035,.21);hatG.add(pin);}
  // 모자를 쓰면 모자 안으로 들어가는 머리카락만 살짝 눌러 넣음 (모자 밖으로 뚫고 나오지 않게)
  const hairMs=WL.userData.hairMeshes||[];const orig=hairMs.map(m=>m.geometry.attributes.position.array.slice());
  const PROF=[[.305,0],[.29,.07],[.262,.16],[.215,.21],[.12,.23],[0,.235]];
  const rc=h=>{if(h<=0)return .305;for(let k=1;k<PROF.length;k++){if(h<=PROF[k][1]){const a=PROF[k-1],b=PROF[k],u=(h-a[1])/(b[1]-a[1]);return a[0]+(b[0]-a[0])*u;}}return 0;};
  const rcOf=P=>h=>{if(h<=0)return P[0][0];for(let k=1;k<P.length;k++){if(h<=P[k][1]){const a=P[k-1],b=P[k],u=(h-a[1])/(b[1]-a[1]);return a[0]+(b[0]-a[0])*u;}}return 0;};
  function pressHair(mode){const cap=mode>=3?HOODS[mode].press:null;const hatG=cap?cap.g:WL.userData.hatG;hatG.updateMatrix();const inv=hatG.matrix.clone().invert();const v=new THREE.Vector3();const hood=hoodParts[0];
    const rcM=cap?rcOf(cap.profile.map(q=>[q[0],q[1]])):rc,topM=(cap?cap.top:.235)*.95;
    hairMs.forEach((m,mi)=>{const p=m.geometry.attributes.position,o=orig[mi];if(!mode){p.array.set(o);p.needsUpdate=true;m.geometry.computeVertexNormals();return;}
      m.updateMatrix();
      if(mode===1){const mInv=m.matrix.clone().invert(),hp=hood.position,hs=hood.scale;
        for(let i=0;i<p.count;i++){v.set(o[i*3],o[i*3+1],o[i*3+2]).applyMatrix4(m.matrix);
          const ux=(v.x-hp.x)/hs.x*2,uy=(v.y-hp.y)/hs.y*2,uz=(v.z-hp.z)/hs.z*2,L=Math.hypot(ux,uy,uz)||1e-6;
          const nx=ux/L,ny=uy/L,nz=uz/L;let kk=1;
          if(nz>0){const d=(nx/.74)*(nx/.74)+((ny+.22)/.68)*((ny+.22)/.68);if(d<1){const t=Math.min(1,(1-d)/.22);kk=1-.34*t*t*(3-2*t)*Math.min(1,nz*2.2);}}
          if(kk>=.8&&L>.95*kk){const s=.95*kk/L;v.set(hp.x+ux*s/2*hs.x,hp.y+uy*s/2*hs.y,hp.z+uz*s/2*hs.z);}
          v.applyMatrix4(mInv);p.setXYZ(i,v.x,v.y,v.z);}
        p.needsUpdate=true;m.geometry.computeVertexNormals();return;}
      const M=inv.clone().multiply(m.matrix),Mi=M.clone().invert();
      for(let i=0;i<p.count;i++){v.set(o[i*3],o[i*3+1],o[i*3+2]).applyMatrix4(M);
        if(v.y>-.005){const top=topM;const h=Math.min(v.y,top);const d=Math.hypot(v.x,v.z),r=rcM(h)*.95;
          if(v.y>top||d>r){const s=(d>r&&d>1e-6)?r/d:1;v.x*=s;v.z*=s;v.y=h;}}
        else if(!cap){const d=Math.hypot(v.x,v.z);if(d>.29&&d<.49){const u=Math.min(1,(d-.3)/.165);const yb=-.002-.06*u*u-.012;if(v.y>yb)v.y=yb;}}
        v.applyMatrix4(Mi);p.setXYZ(i,v.x,v.y,v.z);}
      p.needsUpdate=true;m.geometry.computeVertexNormals();});}
  {const pk=TM('#b8743f','leather2'),pd=TM('#8a5230','leather2'),rl=TM('#f3e3c6','wool',{stripes:['#f3e3c6','#f3e3c6','#d97e6a','#f3e3c6','#5f8f86'],n:10,rep:[1,1]}),bu=SM('#f2b63c');
   add3(wm(roundBox(.19,.17,.12,.4),pk),wlBody).position.set(0,.45,-.33);
   add3(wm(roundBox(.195,.075,.13,.4),pd),wlBody).position.set(0,.56,-.33);
   add3(wm(new THREE.BoxGeometry(.06,.07,.02),bu),wlBody).position.set(0,.51,-.46);
   [-1,1].forEach(s=>add3(wm(roundBox(.05,.09,.08,.45),pd),wlBody).position.set(s*.21,.42,-.33));
   const rlCap=TM('#f3e3c6','wool',{stripes:['#f3e3c6'],n:1});const r=add3(wm(new THREE.CylinderGeometry(.07,.07,.44,16),[rl,rlCap,rlCap]),wlBody);r.rotation.z=PI/2;r.position.set(0,.26,-.34);
   [-.11,.11].forEach(x=>{const t=add3(wm(new THREE.TorusGeometry(.073,.013,6,16),pd),wlBody);t.rotation.y=PI/2;t.position.set(x,.26,-.34);});}
  legs.forEach((lg,i)=>{const s=i?1:-1;add2(wm(roundBox(.022,.045,.042,.4),E.fold),lg).position.set(s*.08,-.05,0);});
  // 여왕개미가 준 나침반 키링: 배낭 버클에 매달려 걸을 때 달랑달랑
  {const brassM=SM('#d8b36a');const ch=new THREE.Bone();ch.name='charm';ch.position.set(0,.476,-.468);wlBody.add(ch);pack.push(ch);
   const ring=wm(new THREE.TorusGeometry(.016,.0045,8,18),brassM);ring.position.y=-.014;ch.add(ring);
   [-.036,-.054].forEach((y,i)=>{const l=wm(new THREE.TorusGeometry(.0095,.0035,6,14),brassM);l.position.y=y;if(i===0)l.rotation.y=PI/2;ch.add(l);});
   const bail=wm(new THREE.TorusGeometry(.012,.004,6,14),brassM);bail.position.y=-.07;ch.add(bail);
   // 게임 속 '더듬이 나침반'과 같은 디자인: 금빛 테, 크림 판, 빨강·남색 바늘, 갈색 더듬이 두 개
   {const cg=new THREE.Group();cg.position.y=-.122;cg.rotation.y=PI;cg.scale.setScalar(.11);ch.add(cg);
    const gold=new THREE.MeshStandardMaterial({map:pencil('#ffd04a','plain',{hatch:.3}),roughness:.6,emissive:lin('#e8a020'),emissiveIntensity:.3});
    cg.add(wm(new THREE.TorusGeometry(.42,.07,10,32),gold));
    cg.add(new THREE.Mesh(new THREE.CircleGeometry(.4,32),SM('#fff3d8')));
    const back=new THREE.Mesh(new THREE.CircleGeometry(.46,32),gold);back.position.z=-.04;back.rotation.y=PI;cg.add(back);
    const nd=new THREE.Bone();nd.name='charm_needle';nd.position.z=.04;cg.add(nd);
    const n1=new THREE.Mesh(new THREE.ConeGeometry(.07,.3,8),SM('#e85a5a'));n1.position.y=.15;nd.add(n1);
    const n2=new THREE.Mesh(new THREE.ConeGeometry(.07,.3,8),SM('#5a6a9a'));n2.position.y=-.15;n2.rotation.z=PI;nd.add(n2);
    const hub=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),gold);hub.position.z=.07;cg.add(hub);
    const brn=SM('#7a4a32');[-1,1].forEach(s=>{cg.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(s*.12,.44,0),new THREE.Vector3(s*.2,.74,0),new THREE.Vector3(s*.42,.86,0)]),10,.026,5),brn));
      const tp=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),gold);tp.position.set(s*.42,.86,0);cg.add(tp);});
    WL.userData.charmNeedle=nd;}
   WL.userData.charm={g:ch,ax:0,az:0,vx:0,vz:0};}
  /* 받은 아이템 키링 칸: 세계를 마치고 받은 아이템이 나침반 옆에 차례로 매달린다(뼈 charm_<flag>). 키링 모양은 세계 코드가 정해
     WL.userData.addCharm({flag, obj})로 단다(obj 원점 = 고리, 아래로 매달림). flags[flag]가 참일 때만 보이고(07), 걸을 때 나침반과 같이 흔들린다.
     다시 부르면(같은 flag) 모양만 바꾼다. 아틀라스 밖에서 그리는 보통 메시다. */
  WL.userData.charms=[WL.userData.charm];
  WL.userData.addCharm=({flag,obj})=>{const cs=WL.userData.charms;let C=cs.find(c=>c.flag===flag);
    if(!C){const i=cs.length,ch=new THREE.Bone();ch.name='charm_'+flag;ch.position.set((i%2?1:-1)*.078*Math.ceil(i/2),.476,-.462);wlBody.add(ch);C={g:ch,ax:0,az:0,vx:0,vz:0,flag};cs.push(C);}
    C.g.clear();if(obj)C.g.add(obj);return C;};
  /* 꾸미기 칸(배지 등): 받은 꾸미기를 조끼 왼쪽 가슴(at:'vest') 또는 배낭 덮개(at:'pack')에 단다 — WL.userData.addBadge({flag, obj, at}).
     obj 원점 = 배지 가운데, +z가 바깥(보이는 쪽). flags[flag]가 참일 때만 보인다(07). 흔들리지 않는다. 평상복이면 셔츠 같은 자리 */
  WL.userData.badges=[];
  WL.userData.addBadge=({flag,obj,at='vest'})=>{const bs=WL.userData.badges;let B=bs.find(b=>b.flag===flag);
    if(!B){const b=new THREE.Bone();b.name='badge_'+flag;if(at==='pack'){b.position.set(.075,.43,-.462);b.rotation.y=PI;}else{b.position.set(.105,.6,.255);b.rotation.set(-.2,.28,0);}
      wlBody.add(b);B={g:b,flag,at};bs.push(B);}
    B.g.clear();if(obj)B.g.add(obj);return B;};
  /* 활공할 때 머리 위로 펼쳐 드는 물건(07이 활공할 때만 보인다): 세계마다 WL.userData.setGlideProp(obj)로 바꾼다(obj 원점 = 손잡이, 머리 위).
     없으면 몸짓(두 팔 들기·흔들림)만 하고 천천히 내려온다. */
  {const g=new THREE.Bone();g.name='glide_prop';g.position.set(0,1.95,.02);g.visible=false;wlBody.add(g);WL.userData.glideProp=g;
   WL.userData.setGlideProp=obj=>{g.clear();if(obj)g.add(obj);};}
  /* 앤트빌리지 차림(옷 번호 2, 2026-11-04 — 시리즈 공통 원더룹): antvillage 게임의 원더룹 옷을 그 모양·자리 그대로 — 파랑 긴팔 윗옷(원통) · 남색 반바지 · 갈색 벨트와 금빛 버클 ·
     청록 목도리 고리와 매듭·꼬리 · 동그란 갈색 장화와 발목 테(뒤꿈치까지 감싸 걷기·달리기·점프·돌기 어느 각도에서도 살이 안 보임). 배낭은 같은 배낭을 2cm 앞으로(원통 윗옷 등에 붙게).
     이 옷일 때 v2 옷 부품(저지 윗옷·데님 바지·접은 단·목 립·스웨이드 신발·조끼 등)은 숨기고, 눈은 개미굴처럼 짙은 색, 눈썹은 개미굴 크기·기울기.
     옷 조합(setCombo)은 윗옷·바지(파란 부분) 색 + 목도리 색 — 기본 재질에 색 배율만 곱해 끼운다(setTint 'top'·'pants'·'antScarf'). 평상복·탐험복(기준 촬영)은 그대로 */
  const ant=[];const addA=(m,parent)=>{parent.add(m);ant.push(m);return m;};
  const aTop=TM('#4a7cc8','jersey',{rep:[3,3]}),aPants=TM('#2e3c6a','twill',{rep:[2,2],grain:.35}),aBoot=TM('#7a4a32','suede',{rep:[2,2],grain:.4}),aCuff=SM('#4e2e22'),
        aBelt=TM('#7a4a32','leather2',{rep:[6,1]}),aBuck=SM('#f2b63c'),aScarf=TM('#36aaa0','plain',{hatch:.45});
  WL.userData.antMats={top:aTop,pants:aPants,scarf:aScarf};
  addA(wm(new THREE.CylinderGeometry(.16,.22,.32,20),aTop),wlBody).position.y=.47;
  addA(wm(new THREE.CylinderGeometry(.225,.225,.05,20),aBelt),wlBody).position.y=.37;
  addA(wm(new THREE.BoxGeometry(.08,.06,.02),aBuck),wlBody).position.set(0,.37,.225);
  addA(wm(new THREE.CylinderGeometry(.2,.22,.1,20),aPants),wlBase).position.y=.31;
  {const sc=addA(wm(new THREE.TorusGeometry(.2,.062,12,32),aScarf),wlBody);sc.rotation.x=PI/2;sc.scale.set(1.08,1,1);sc.position.set(0,.6,-.02);
   const kn=addA(wm(new THREE.SphereGeometry(.06,12,10),aScarf),wlBody);kn.scale.set(1.1,.9,.8);kn.position.set(.1,.57,.18);
   const tl=addA(wm(roundBox(.045,.09,.02,.5),aScarf),wlBody);tl.position.set(.13,.48,.19);tl.rotation.set(-.15,0,.25);}
  WL.traverse(o=>{if(!o.isBone)return;const n=o.name;
    if(n.startsWith('upperarm.'))addA(wm(new THREE.CylinderGeometry(.058,.054,.125,12).translate(0,-.0625,0),aTop),o);           // 긴팔: 어깨~팔꿈치
    if(n.startsWith('forearm.'))addA(wm(new THREE.CylinderGeometry(.055,.05,.12,12).translate(0,-.055,0),aTop),o);               //      팔꿈치~손목
    if(n.startsWith('foot.')){const bb=addA(wm(new THREE.SphereGeometry(.105,18,12),aBoot),o);bb.scale.set(1,.78,1.42);bb.position.z=.016;   // 개미굴 장화 — 2026-11-05: 뒤꿈치까지 한 덩어리로 감싸게 뒤로만 조금 늘림(앞끝은 그대로 ≈ +0.165, 뒤끝 −0.10 → −0.133). 덧붙인 뒤꿈치 공·장화 목은 뺐다(걸을 때 따로 붙은 조각처럼 보였다)
      // 발목 테(2026-11-04): 다리(반지름 6.4cm)가 장화로 들어가는 선을 그대로 따라 도는 진한 갈색 가는 테(두께 1.6cm) — 장화 입구는 앞이 높고 뒤가 낮아 평평한 고리는 앞에서 묻혔다. 다리 축은 발 관절보다 2cm 뒤(z −.02)
      {const sy=(x,z)=>.082*Math.sqrt(Math.max(0,1-(x/.105)**2-((z-.016)/.1491)**2));
       const pts=[];for(let k=0;k<48;k++){const t=k/48*PI*2,x=.068*Math.sin(t),z=-.02+.068*Math.cos(t);pts.push(new THREE.Vector3(x,sy(x,z)+.003,z));}
       addA(wm(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),64,.008,8,true),aCuff),o);}}
    // 정강이: v2 정강이는 발목 아래로 5.5cm 더 내려가 발이 꺾이면 장화 바닥으로 살이 비쳤다 → 이 옷에서는 무릎~발목 1.5cm 아래까지만(장화 안)
    if(n.startsWith('shin.')){addA(wm(new THREE.SphereGeometry(.061,14,10),skin),o);addA(wm(new THREE.CylinderGeometry(.061,.064,.09,14).translate(0,-.045,0),skin),o);}});
  const shinV2=[];WL.traverse(o=>{if(o.isMesh&&o.parent&&o.parent.isBone&&o.parent.name.startsWith('shin.')&&o.material===skin&&!ant.includes(o))shinV2.push(o);});
  let outfit=0,v2Hide=null;const V2=WL.userData.v2Mats||{};
  const eyeMs=[];WL.traverse(o=>{if(o.isBone&&o.name.startsWith('eye.')&&o.children[0])eyeMs.push(o.children[0]);});const eyeV2=eyeMs.map(m=>m.material),eyeAnt=new THREE.MeshStandardMaterial({color:lin('#2a1a24'),roughness:.75,metalness:0});
  function applyOutfit(){const e=outfit===1,a=outfit===2;shirtMs.forEach(o=>{o.material=e?E.shirt:tunic;o.visible=!a;});pantsMs.forEach(o=>{o.material=e?E.pants:shorts;o.visible=!a;});
    rf.forEach((o,i)=>{o.material=e?(i%2?E.fold:E.roll):rfBase[i];o.visible=!a;});exp.forEach(o=>o.visible=e);pack.forEach(o=>o.visible=true);ant.forEach(o=>o.visible=a);
    if(!v2Hide){v2Hide=[];WL.traverse(o=>{if(o.isMesh&&[V2.rib,V2.boot,V2.sole].includes(o.userData.wlBaseMat||o.material))v2Hide.push(o);});}v2Hide.forEach(o=>o.visible=!a);shinV2.forEach(o=>o.visible=!a);
    // 배낭·키링: 앤트빌리지 차림이면 2cm 앞으로(원통 윗옷 등에 붙게)
    [...pack,...(WL.userData.charms||[]).map(c=>c.g),...(WL.userData.badges||[]).filter(b=>b.at==='pack').map(b=>b.g)].forEach(o=>{if(o.userData.z0==null)o.userData.z0=o.position.z;o.position.z=o.userData.z0+(a?.02:0);});
    eyeMs.forEach((m,i)=>m.material=a?eyeAnt:eyeV2[i]);
    (WL.userData.brows||[]).forEach(b=>b.scale.set(a?.06/.078:1,a?.014/.02:1,1));WL.userData.browRest=a?-.08:.15;if(WL.userData.setExpr)WL.userData.setExpr(WL.userData.exprName||'기본');
    WL.userData.outfit=e;WL.userData.outfitKey=a?'ant':e?'explorer':'casual';}
  applyOutfit();
  {const r=wlMerge(exp.filter(o=>o.isMesh));for(let i=exp.length-1;i>=0;i--)if(r.removed.has(exp[i]))exp.splice(i,1);r.made.forEach(m=>exp.push(m));
   {const r2=wlMerge(pack.filter(o=>o.isMesh));for(let i=pack.length-1;i>=0;i--)if(r2.removed.has(pack[i]))pack.splice(i,1);r2.made.forEach(m=>pack.push(m));}
   wlMerge(WL.userData.hatG.children.slice());if(WL.userData.charm)wlMerge(WL.userData.charm.g.children.slice());applyOutfit();}
  // 탈 카테고리: 없음 → 개미탈 → 탐험 모자 (옷과 따로 쓰고 벗음)
  {const hwBtn=document.getElementById('hoodBtn');WL.userData.hw=0;
   const applyHW=()=>{const hw=WL.userData.hw;WL.userData.hatG.visible=hw===2;WL.userData.applyLook();pressHair(hw===2||(HOODS[hw].press&&HOODS[hw].press.profile)?hw:0);hwBtn.textContent='탈: '+HOODS[hw].name;};
   hwBtn.addEventListener('click',()=>{WL.userData.hw=(WL.userData.hw+1)%HOODS.length;applyHW();});applyHW();
   // 이름으로 탈 쓰기 (구역 정보 hood, 영상 대본): setHood('ant')
   WL.userData.setHood=key=>{const i=HOODS.findIndex(h=>h.key===key);if(i<0){console.warn('원더룹: 없는 탈',key);return;}WL.userData.hw=i;applyHW();};
   /* 탈 모습 바뀌기 연출 (꽃봉오리 → 활짝 핀 꽃처럼, 한 탈의 두 모습을 HOODS 두 칸으로 두고 이어 준다): morphHood(key,{sec,onSwitch,onEnd})
      앞 40%: 지금 탈이 살짝 움츠러들고 → 바뀌는 순간(onSwitch — 빛 입자 터뜨리기 등) → 뒤 60%: 새 탈이 0.6배에서 통 튀어나오며 1배로.
      크기는 0.93 아래로 줄이지 않는다(탈 안으로 눌린 머리가 드러나지 않게 — 맨 정수리가 보였다). 새 탈 모듈에 animate(g,u)(u 0→1)가 있으면 그동안 함께 부른다(꽃잎이 펼쳐지는 움직임은 세계 탈 쪽에서). 07이 게임 시간으로 진행(촬영 모드에서도 같은 그림) */
   const hoodObjs=hw=>hw===2?[WL.userData.hatG]:hw===1?hoodParts.filter(o=>o.userData.hw==null):HOODS[hw]&&HOODS[hw].press?[HOODS[hw].press.g]:[];
   const easeBack=u=>{const c=1.7;u-=1;return 1+(c+1)*u*u*u+c*u*u;};
   WL.userData.morphHood=(key,{sec=1.2,onSwitch,onEnd}={})=>{const to=HOODS.findIndex(h=>h.key===key);if(to<0){console.warn('원더룹: 없는 탈',key);return;}
     const from=hoodObjs(WL.userData.hw),scale=(L,v)=>L.forEach(o=>o.scale.setScalar(v));let t=0,switched=false;
     WL.userData.hoodMorph={tick(dt){t+=dt;const k=Math.min(1,t/sec);
       if(k<.4)scale(from,1-.07*Math.sin(k/.4*Math.PI/2));
       else{if(!switched){switched=true;scale(from,1);WL.userData.hw=to;applyHW();if(onSwitch)try{onSwitch();}catch(e){console.error(e);}}
         const u=(k-.4)/.6,L=hoodObjs(to);scale(L,.93+.07*easeBack(u)+.06*Math.sin(Math.PI*u));const m=HOODS[to].mod;if(m&&m.animate&&HOODS[to].press)m.animate(HOODS[to].press.g,u);}
       if(k>=1){scale(hoodObjs(to),1);WL.userData.hoodMorph=null;if(onEnd)try{onEnd();}catch(e){console.error(e);}}}};};}
  const ob=document.getElementById('outfitBtn');const showOutfit=()=>ob.textContent=outfit===2?'옷: 앤트빌리지':outfit?'옷: 탐험복':'옷: 평상복';ob.addEventListener('click',()=>{outfit=outfit===2?0:1-outfit;applyOutfit();showOutfit();});
  /* 탐험복 조끼·목수건 색(옷 갈아입기 창, 2026-11-03): 0 기본 · 1 · 2. 같은 천 결 그림에 색 배율만 곱한 재질로 바꿔 끼운다(아틀라스 색은 소수라 1을 넘어도 되고, 새 그림 층이 필요 없다 —
     부품 재질이 바뀌면 07이 그 부품 정점만 다시 적는다). 기준 촬영·영상 대본은 늘 기본 색 */
  {const VEST=[['기본','#c99d5c','#a87e43'],['풀잎','#8fae6a','#6e8f4c'],['하늘','#8db3d2','#6a8fb0']],SCARF=[['기본','#ec8b7d'],['민트','#7ccbb0'],['해바라기','#f2c14e']];
   const tint=(m,from,to)=>{const k=m.clone(),a=new THREE.Color(from),b=new THREE.Color(to);k.color.setRGB(m.color.r*b.r/a.r,m.color.g*b.g/a.g,m.color.b*b.b/a.b);return k;};
   const cache=new Map(),pick=(m,from,to)=>{if(from===to)return m;const key=m.uuid+to;if(!cache.has(key))cache.set(key,tint(m,from,to));return cache.get(key);};
   const swap=(base,want)=>WL.traverse(o=>{if(!o.isMesh)return;for(const [m,mm] of base){if(o.material===m||o.userData.wlBaseMat===m){o.userData.wlBaseMat=m;o.material=mm;}}});
   WL.userData.vestColors=VEST.map(v=>v[0]);WL.userData.scarfColors=SCARF.map(v=>v[0]);WL.userData.vestHex=VEST.map(v=>v[1]);WL.userData.scarfHex=SCARF.map(v=>v[1]); // 색 이름·점 색(탐험가 소개 창)
   WL.userData.setVest=i=>{const v=VEST[i]||VEST[0];swap([[vestM,pick(vestM,VEST[0][1],v[1])],[vestD,pick(vestD,VEST[0][2],v[2])]]);WL.userData.vestIdx=VEST.indexOf(v);};
   WL.userData.setScarf=i=>{const v=SCARF[i]||SCARF[0];swap([[nkM,pick(nkM,SCARF[0][1],v[1])],[bandM,pick(bandM,SCARF[0][1],v[1])]]);WL.userData.scarfIdx=SCARF.indexOf(v);};
   WL.userData.vestIdx=0;WL.userData.scarfIdx=0;
   /* 색을 16진수로 바로(세계 설정 explorer — 탐험가 소개 창, 2026-11-04): setTint('hood',[겉,테두리]) 개미탈 · ('vest',[겉,안]) 조끼 · ('scarf',색) 목수건. null이면 기본 색.
      같은 방식(기본 재질에 색 배율만 곱한 재질로 바꿔 끼움) — 기준 촬영은 부르지 않으니 그대로 */
   const [hM,hD]=WL.userData.hoodMats||[];
   const AM=WL.userData.antMats||{};
   const BASE={top:[[AM.top,'#4a7cc8']],pants:[[AM.pants,'#2e3c6a']],antScarf:[[AM.scarf,'#36aaa0']],hood:[[hM,'#a8603f'],[hD,'#7e4229']],vest:[[vestM,VEST[0][1]],[vestD,VEST[0][2]]],scarf:[[nkM,SCARF[0][1]],[bandM,SCARF[0][1]]]};
   WL.userData.setTint=(part,c)=>{const B=BASE[part];if(!B||!B[0][0])return;const L=c==null?B.map(b=>b[1]):Array.isArray(c)?c:[c,c];
     swap(B.map(([m,from],i)=>[m,pick(m,from,L[Math.min(i,L.length-1)]||from)]));};
   /* 옷 조합(앤트빌리지 차림): 윗옷·바지의 파란 부분 색 + 목도리 색 — 원더룹 자신의 옷이라 세계와 상관없이 하나(game/front가 저장). 옷 색과 목도리 색이 같은 조합은 두지 않는다 */
   const COMBOS=[{name:'파랑 옷 · 노랑 목도리',top:'#4a7cc8',pants:'#2e3c6a',scarf:'#f2c14e'},{name:'분홍 옷 · 민트 목도리',top:'#ef8fae',pants:'#a8506f',scarf:'#6fcfb4'},
     {name:'노랑 옷 · 파랑 목도리',top:'#f2c14e',pants:'#a87a1c',scarf:'#4a7cc8'},{name:'민트 옷 · 분홍 목도리',top:'#6fcfb4',pants:'#2f8a72',scarf:'#ef8fae'}];
   WL.userData.outfitCombos=COMBOS;WL.userData.comboIdx=0;
   WL.userData.setCombo=i=>{const c=COMBOS[i]||COMBOS[0];WL.userData.setTint('top',c.top);WL.userData.setTint('pants',c.pants);WL.userData.setTint('antScarf',c.scarf);WL.userData.comboIdx=COMBOS.indexOf(c);};}
  // 이름으로 옷 입기 (구역 정보 outfit): setOutfit('explorer'|'casual')
  WL.userData.setOutfit=key=>{outfit=key==='explorer'?1:key==='ant'?2:0;applyOutfit();showOutfit();};
}
