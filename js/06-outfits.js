/* 원더룹 베이스캠프 — 바지·관절·캐릭터 병합·평상복/탐험복·탐험 모자·키링·탈 카테고리 */
/* 디테일: 옷 구조 + 탐험대 패치 */
{
  const cream=SM('#f3ead6');
  legs.forEach(lg=>{const kn=lg.userData.knee;lg.add(wm(new THREE.SphereGeometry(.086,16,12),shorts));lg.add(wm(new THREE.CylinderGeometry(.084,.081,.19,16).translate(0,-.03,0),shorts));
    kn.add(wm(new THREE.SphereGeometry(.081,16,12),shorts));kn.add(wm(new THREE.CylinderGeometry(.081,.078,.085,16).translate(0,-.0425,0),shorts));
    const roll=wm(new THREE.CylinderGeometry(.086,.086,.04,18),TM('#7d96cc','denim',{rep:[3,1],grain:.35}));roll.position.y=-.06;kn.add(roll);
    const fold=wm(new THREE.TorusGeometry(.086,.008,6,22),SM('#3f5a9c'));fold.rotation.x=PI/2;fold.position.y=-.04;kn.add(fold);(WL.userData.rf=WL.userData.rf||[]).push(roll,fold);});
  {const pel=wm(new THREE.SphereGeometry(.12,22,16),shorts);pel.scale.set(1.55,.78,1.15);pel.position.set(0,.33,-.01);WL.add(pel);}
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
  const E={shirt:TM('#f7f2e8','linen',{rep:[3,3]}),pants:TM('#8f8558','twill',{rep:[2,3],grain:.35}),roll:TM('#b3a978','twill',{rep:[3,1],grain:.35}),fold:SM('#6c643f')};
  const exp=[];const vestM=TM('#c99d5c','canvas',{rep:[3,2]},THREE.DoubleSide);const vestD=TM('#a87e43','canvas',{rep:[2,1]});
  const add2=(m,parent)=>{parent.add(m);exp.push(m);return m;};
  add2(wm(new THREE.LatheGeometry([[.236,.33],[.238,.4],[.24,.45],[.233,.52],[.218,.565],[.185,.603]].map(q=>new THREE.Vector2(q[0],q[1])),30,.32,PI*2-.64),vestM),wlBody);
  [-1,1].forEach(s=>{const pk=add2(wm(roundBox(.068,.056,.014,.35),vestM),wlBody);pk.position.set(s*.175,.405,.176);pk.rotation.y=s*.82;
    const fl=add2(wm(roundBox(.07,.017,.019,.35),vestD),wlBody);fl.position.set(s*.177,.46,.179);fl.rotation.y=s*.82;});
  add2(wm(new THREE.CylinderGeometry(.232,.232,.034,30),TM('#7a4a32','leather2',{rep:[6,1],stitch:'h'})),wlBody).position.y=.322;
  {const bk=add2(wm(roundBox(.035,.024,.01,.4),SM('#f2b63c')),wlBody);bk.position.set(0,.322,.233);}
  {const nkM=SM('#ec8b7d');const nk=add2(wm(new THREE.TorusGeometry(.16,.042,10,28),nkM),wlBody);nk.rotation.x=PI/2;nk.position.y=.605;
   // 가슴을 덮는 큰 삼각 반다나: 조끼·셔츠 면을 따라 휘어짐
   {const VP=[[.33,.236],[.4,.238],[.45,.24],[.52,.233],[.565,.218],[.603,.185]];
    const Rv=y=>{for(let k=1;k<VP.length;k++){if(y<=VP[k][0]){const a=VP[k-1],b=VP[k],u=(y-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*u;}}return VP[VP.length-1][1];};
    const NY=12,NX=16,pos=[],uv=[],idx=[];
    for(let j=0;j<=NY;j++){const t=j/NY,y=.608-.1*t,half=.125*(1-t)+.004;
      for(let i=0;i<=NX;i++){const u=i/NX*2-1,x=u*half,e=Math.min(1,t*2.5),R=Rv(y)+.013;pos.push(x,y,Math.sqrt(Math.max(0,R*R-x*x)));uv.push(u*.5+.5,1-t);}}
    for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const a=j*(NX+1)+i,b=a+NX+1;idx.push(a,b,a+1,a+1,b,b+1);}
    const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));bg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));bg.setIndex(idx);bg.computeVertexNormals();
    add2(wm(bg,TM('#ec8b7d','plain',{hatch:.45},THREE.DoubleSide)),wlBody);}}
  // 탐험가 모자: 머리 위에 얹히고 앞챙이 살짝 들려 앞머리가 보임
  {const hatG=new THREE.Group();hatG.position.set(0,.33,-.1);hatG.rotation.x=-.3;hatG.scale.setScalar(.9);head.add(hatG);WL.userData.hatG=hatG;
   const hatM=TM('#dcc48e','canvas',{rep:[4,2]},THREE.DoubleSide);
   hatG.add(wm(new THREE.LatheGeometry([[0,.235],[.12,.23],[.215,.21],[.262,.16],[.29,.07],[.305,0]].map(q=>new THREE.Vector2(q[0],q[1])),36),hatM));
   hatG.add(wm(new THREE.LatheGeometry([[.3,.012],[.37,0],[.44,-.03],[.47,-.05],[.465,-.062],[.43,-.045],[.36,-.015],[.3,-.002]].map(q=>new THREE.Vector2(q[0],q[1])),40),hatM));
   const band=wm(new THREE.CylinderGeometry(.296,.303,.045,36,1,true),new THREE.MeshStandardMaterial({map:pencil('#7a4a32','plain',{hatch:.4}),roughness:.9,side:THREE.DoubleSide}));band.position.y=.03;hatG.add(band);
   const pin=wm(new THREE.SphereGeometry(.03,12,10),SM('#ec8b7d'));pin.position.set(.21,.035,.21);hatG.add(pin);}
  // 모자를 쓰면 모자 안으로 들어가는 머리카락만 살짝 눌러 넣음 (모자 밖으로 뚫고 나오지 않게)
  const hairMs=WL.userData.hairMeshes||[];const orig=hairMs.map(m=>m.geometry.attributes.position.array.slice());
  const PROF=[[.305,0],[.29,.07],[.262,.16],[.215,.21],[.12,.23],[0,.235]];
  const rc=h=>{if(h<=0)return .305;for(let k=1;k<PROF.length;k++){if(h<=PROF[k][1]){const a=PROF[k-1],b=PROF[k],u=(h-a[1])/(b[1]-a[1]);return a[0]+(b[0]-a[0])*u;}}return 0;};
  function pressHair(mode){const hatG=WL.userData.hatG;hatG.updateMatrix();const inv=hatG.matrix.clone().invert();const v=new THREE.Vector3();const hood=hoodParts[0];
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
        if(v.y>-.005){const top=.235*.95;const h=Math.min(v.y,top);const d=Math.hypot(v.x,v.z),r=rc(h)*.95;
          if(v.y>top||d>r){const s=(d>r&&d>1e-6)?r/d:1;v.x*=s;v.z*=s;v.y=h;}}
        else{const d=Math.hypot(v.x,v.z);if(d>.29&&d<.49){const u=Math.min(1,(d-.3)/.165);const yb=-.002-.06*u*u-.012;if(v.y>yb)v.y=yb;}}
        v.applyMatrix4(Mi);p.setXYZ(i,v.x,v.y,v.z);}
      p.needsUpdate=true;m.geometry.computeVertexNormals();});}
  {const pk=TM('#b8743f','leather2'),pd=TM('#8a5230','leather2'),rl=TM('#f3e3c6','wool',{stripes:['#f3e3c6','#f3e3c6','#d97e6a','#f3e3c6','#5f8f86'],n:10,rep:[1,1]}),bu=SM('#f2b63c');
   add2(wm(roundBox(.19,.17,.12,.4),pk),wlBody).position.set(0,.45,-.33);
   add2(wm(roundBox(.195,.075,.13,.4),pd),wlBody).position.set(0,.56,-.33);
   add2(wm(new THREE.BoxGeometry(.06,.07,.02),bu),wlBody).position.set(0,.51,-.46);
   [-1,1].forEach(s=>add2(wm(roundBox(.05,.09,.08,.45),pd),wlBody).position.set(s*.21,.42,-.33));
   const rlCap=TM('#f3e3c6','wool',{stripes:['#f3e3c6'],n:1});const r=add2(wm(new THREE.CylinderGeometry(.07,.07,.44,16),[rl,rlCap,rlCap]),wlBody);r.rotation.z=PI/2;r.position.set(0,.26,-.34);
   [-.11,.11].forEach(x=>{const t=add2(wm(new THREE.TorusGeometry(.073,.013,6,16),pd),wlBody);t.rotation.y=PI/2;t.position.set(x,.26,-.34);});}
  legs.forEach((lg,i)=>{const s=i?1:-1;add2(wm(roundBox(.022,.045,.042,.4),E.fold),lg).position.set(s*.08,-.05,0);});
  // 여왕개미가 준 나침반 키링: 배낭 버클에 매달려 걸을 때 달랑달랑
  {const brassM=SM('#d8b36a');const ch=new THREE.Group();ch.position.set(0,.476,-.468);wlBody.add(ch);exp.push(ch);
   const ring=wm(new THREE.TorusGeometry(.016,.0045,8,18),brassM);ring.position.y=-.014;ch.add(ring);
   [-.036,-.054].forEach((y,i)=>{const l=wm(new THREE.TorusGeometry(.0095,.0035,6,14),brassM);l.position.y=y;if(i===0)l.rotation.y=PI/2;ch.add(l);});
   const bail=wm(new THREE.TorusGeometry(.012,.004,6,14),brassM);bail.position.y=-.07;ch.add(bail);
   // 게임 속 '더듬이 나침반'과 같은 디자인: 금빛 테, 크림 판, 빨강·남색 바늘, 갈색 더듬이 두 개
   {const cg=new THREE.Group();cg.position.y=-.122;cg.rotation.y=PI;cg.scale.setScalar(.11);ch.add(cg);
    const gold=new THREE.MeshStandardMaterial({map:pencil('#ffd04a','plain',{hatch:.3}),roughness:.6,emissive:lin('#e8a020'),emissiveIntensity:.3});
    cg.add(wm(new THREE.TorusGeometry(.42,.07,10,32),gold));
    cg.add(new THREE.Mesh(new THREE.CircleGeometry(.4,32),SM('#fff3d8')));
    const back=new THREE.Mesh(new THREE.CircleGeometry(.46,32),gold);back.position.z=-.04;back.rotation.y=PI;cg.add(back);
    const nd=new THREE.Group();nd.position.z=.04;cg.add(nd);
    const n1=new THREE.Mesh(new THREE.ConeGeometry(.07,.3,8),SM('#e85a5a'));n1.position.y=.15;nd.add(n1);
    const n2=new THREE.Mesh(new THREE.ConeGeometry(.07,.3,8),SM('#5a6a9a'));n2.position.y=-.15;n2.rotation.z=PI;nd.add(n2);
    const hub=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),gold);hub.position.z=.07;cg.add(hub);
    const brn=SM('#7a4a32');[-1,1].forEach(s=>{cg.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(s*.12,.44,0),new THREE.Vector3(s*.2,.74,0),new THREE.Vector3(s*.42,.86,0)]),10,.026,5),brn));
      const tp=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),gold);tp.position.set(s*.42,.86,0);cg.add(tp);});
    WL.userData.charmNeedle=nd;}
   WL.userData.charm={g:ch,ax:0,az:0,vx:0,vz:0};}
  let outfit=0;
  function applyOutfit(){const e=outfit===1;shirtMs.forEach(o=>o.material=e?E.shirt:tunic);pantsMs.forEach(o=>o.material=e?E.pants:shorts);
    rf.forEach((o,i)=>o.material=e?(i%2?E.fold:E.roll):rfBase[i]);exp.forEach(o=>o.visible=e);WL.userData.outfit=e;}
  applyOutfit();
  {const r=wlMerge(exp.filter(o=>o.isMesh));for(let i=exp.length-1;i>=0;i--)if(r.removed.has(exp[i]))exp.splice(i,1);r.made.forEach(m=>exp.push(m));
   wlMerge(WL.userData.hatG.children.slice());if(WL.userData.charm)wlMerge(WL.userData.charm.g.children.slice());applyOutfit();}
  // 탈 카테고리: 없음 → 개미탈 → 탐험 모자 (옷과 따로 쓰고 벗음)
  {const hwBtn=document.getElementById('hoodBtn');const HW=['없음','개미탈','탐험 모자'];WL.userData.hw=0;
   const applyHW=()=>{const hw=WL.userData.hw;WL.userData.hatG.visible=hw===2;WL.userData.applyLook();pressHair(hw===2?2:0);hwBtn.textContent='탈: '+HW[hw];};
   hwBtn.addEventListener('click',()=>{WL.userData.hw=(WL.userData.hw+1)%3;applyHW();});applyHW();}
  const ob=document.getElementById('outfitBtn');ob.addEventListener('click',()=>{outfit=1-outfit;applyOutfit();ob.textContent=outfit?'옷: 탐험복':'옷: 평상복';});
}
