/* 원더룹 베이스캠프 — 헤어(지그재그 단발 등)·탈 아래 앞머리·헤어 전환 */
import * as THREE from 'three';
import {PI,R,pencil,rnd} from './01-textures.js';
import {WL,hairParts,head,hoodParts,wm} from './04-character.js';
/* 머리카락 (탈 벗은 모습) — 두 층: 윗층(지그재그 앞머리·옆머리, 끝이 살짝 들림) + 아래층(뒷머리·목덜미) */
{
  const hairTexM=new THREE.MeshStandardMaterial({map:pencil('#7e4c33','hair',{size:512}),roughness:.8,metalness:0});
  const tri=x=>{const f=x-Math.floor(x);return 1-Math.abs(f*2-1);};
  const smooth=(kp,az)=>{for(let k=1;k<kp.length;k++){if(az<=kp[k][0]){const a=kp[k-1],b=kp[k],u=(az-a[0])/(b[0]-a[0]),e=u*u*(3-2*u);return a[1]+(b[1]-a[1])*e;}}return kp[kp.length-1][1];};
  function shell(R,seg,edgeFn,lipK,flare,tousle,lift){
    const g=new THREE.SphereGeometry(R,seg,Math.floor(seg/2));const p=g.attributes.position;
    // 남극 줄(sp)의 각도: r128 구는 극점에 1e-16 크기 x·z가 남아 꼭짓점마다 각도가 달랐다(머리 끝 고리가 퍼짐). 새 구는 정확히 0이라 그 값을 직접 계산
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);let ny=y/R;const ix=i%(seg+1),sp=i>=p.count-seg-1,ang=sp?Math.atan2(Math.fround(-R*Math.cos(ix/seg*PI*2)*Math.sin(PI)),Math.fround(R*Math.sin(ix/seg*PI*2)*Math.sin(PI))):Math.atan2(x,z);const E=edgeFn(ang);
      let k=1;if(ny<E){ny=E;k=lipK;}
      const near=Math.max(0,1-(ny-E)/.3);
      let f=1+lift*Math.sin(Math.max(0,Math.min(1,(ny+.1)/1.1))*PI);if(flare)f=f*(1-near*near)+flare*near*near;
      f+=.08*Math.pow(Math.max(0,-Math.cos(ang)),1.5)*Math.sin(Math.max(0,Math.min(1,(ny+.85)/1.7))*PI)*(arguments[8]?(1-near*near):1);
      if(arguments[7])f+=arguments[7]*Math.pow(Math.sin(ang),2)*Math.sin(Math.max(0,Math.min(1,(ny+.35)/.9))*PI)*(1-.7*near*near);
      if(arguments[8]){const q=(ny+.4)/.3;f+=arguments[8]*Math.pow(Math.max(0,-Math.cos(ang)),1.2)*Math.exp(-q*q)*(1-near*near);}
      if(tousle)f+=tousle*Math.pow(Math.max(0,Math.sin(ang*6+ny*5)*Math.sin(ny*9+ang*2)),3)*Math.max(0,ny);
      const h=Math.sqrt(Math.max(0,1-ny*ny))*R*k*f;p.setXYZ(i,Math.sin(ang)*h,ny*R*k*f,Math.cos(ang)*h);}
    g.computeVertexNormals();return g;}
  // 아래층: 뒤통수와 목덜미를 덮는 바탕
  const CAPK=[[0,.5],[1.0,.48],[1.1,.0],[1.21,-.3],[1.31,-.04],[1.42,.03],[1.62,.03],[1.82,-.25],[2.3,-.6],[Math.PI,-.78]];
  const lower=wm(shell(.43,72,a=>smooth(CAPK,Math.abs(a)),.985,0,0,0),hairTexM);lower.scale.set(1.03,.99,.93);head.add(lower);hairParts.push(lower);
  // 윗층: 머리 둘레를 따라 넓적한 삼각 끝이 지그재그로 내려오고, 끝이 살짝 들려 볼륨이 생김
  const TOPK=[[0,.2],[.8,.22],[1.15,.16],[1.5,.0],[2.2,.1],[Math.PI,.14]];
  const period=PI*2/12;
  const upper=wm(shell(.45,96,a=>{const w=Math.pow(tri(a/period+.5),.85);return smooth(TOPK,Math.abs(a))+.2*w;},.975,.962,.05,.07),hairTexM);
  upper.scale.set(1.03,1.0,.93);head.add(upper);hairParts.push(upper);
  // 헤어 B: 둥근 단발에 옆으로 흐르는 큰 앞머리
  const hairB=[],hairD=[];
  {const LOBES=[[-1.02,-.7,.16,.75],[-.7,.12,.2,1.6],[.12,.7,.24,1.25],[.7,1.02,.16,1.3]],TOP=.5;
    const BK=[[1.85,-.3],[2.4,-.58],[Math.PI,-.7]];
    const edgeB=a=>{const az=Math.abs(a);
      if(az>=1.02&&az<1.19){if(az<1.17)return TOP+(-.3-TOP)*((az-1.02)/.15);return -.3;}
      if(az>=1.19&&az<1.85){const u=(az-1.52)/.33;return -.3+.36*Math.sqrt(Math.max(0,1-u*u));}
      if(az>=1.85)return smooth(BK,az);
      for(const L of LOBES){if(a>=L[0]&&a<=L[1]){const u=Math.pow((a-L[0])/(L[1]-L[0]),L[3]);const d=Math.pow(1-Math.pow(Math.abs(2*u-1),.9),.75);return TOP-(TOP-L[2])*d;}}
      return TOP;};
    const mB=wm(shell(.45,96,edgeB,.975,.92,.03,.03,.035,.04),hairTexM);mB.scale.set(1.0,1.0,.93);head.add(mB);hairB.push(mB);mB.visible=false;
    // 헤어 D: 지그재그 단발 — 둥근 단발의 옆머리·구레나루·뒷머리는 그대로, 앞머리만 지그재그
    const edgeD=a=>{const az=Math.abs(a);if(az<1.02){const w=Math.pow(tri(a/(PI*2/12)+.5),.85);return .2+.2*w;}return edgeB(a);};
    const mD=wm(shell(.45,96,edgeD,.975,.92,.03,.03,.035,.04),hairTexM);mD.scale.set(1.0,1.0,.93);head.add(mD);hairD.push(mD);mD.visible=false;}
  // 헤어 C: 점토로 빚은 듯한 굵은 머리 뭉치 — 정수리 가마에서 퍼져 나가 끝이 살짝 들림
  const hairC=[];
  {const clayM=new THREE.MeshStandardMaterial({map:pencil('#744631','plain',{hatch:.5}),roughness:.95});
   const capM=new THREE.MeshStandardMaterial({map:pencil('#5c3625','plain',{hatch:.4}),roughness:.95});
   const CK=[[0,.5],[1.0,.45],[1.35,.02],[1.75,0],[2.1,-.35],[2.5,-.6],[Math.PI,-.7]];
   const capC=wm(shell(.43,96,a=>smooth(CK,Math.abs(a)),.985,0,0,.03),capM);capC.scale.set(1.03,.99,.93);head.add(capC);hairC.push(capC);
   const RA=.455*1.03,RB=.455,RC=.455*.93;
   const surf=(d,lift)=>{const v=d.clone().normalize();const s=1/Math.sqrt((v.x/RA)*(v.x/RA)+(v.y/RB)*(v.y/RB)+(v.z/RC)*(v.z/RC));return v.multiplyScalar(s*(1+lift));};
   const CR=new THREE.Vector3(0,.9,-.35).normalize();
   function lock(end,w,lift){
     const e=new THREE.Vector3(end[0],end[1],end[2]).normalize();const st=CR.clone().lerp(e,.12+R()*.08).add(new THREE.Vector3(rnd(-.06,.06),0,rnd(-.06,.06))).normalize();
     const pts=[];for(let i=0;i<=6;i++){const t=i/6;pts.push(surf(st.clone().lerp(e,t),.035+lift*Math.pow(t,3)));}
     const curve=new THREE.CatmullRomCurve3(pts);const TS=32,RS=14;const g=new THREE.TubeGeometry(curve,TS,w,RS);const p=g.attributes.position,v=new THREE.Vector3(),hn=new THREE.Vector3();
     for(let i=0;i<=TS;i++){const t=i/TS,c=curve.getPointAt(t);hn.set(c.x/(RA*RA),c.y/(RB*RB),c.z/(RC*RC)).normalize();
       const k=Math.pow(Math.sin(Math.min(1,t*3.5)*PI/2),.5)*(1-.3*t)*Math.sqrt(Math.max(0,1-Math.pow(t,6)));
       for(let j=0;j<=RS;j++){const idx=i*(RS+1)+j;v.fromBufferAttribute(p,idx).sub(c);const dn=v.dot(hn);v.addScaledVector(hn,-dn*.22);v.multiplyScalar(k);v.add(c);p.setXYZ(idx,v.x,v.y,v.z);}}
     g.computeVertexNormals();const m=wm(g,clayM);head.add(m);hairC.push(m);}
   [[[-.42,.42,.8],.13,.08],[[-.12,.38,.92],.14,.1],[[.18,.39,.9],.14,.09],[[.46,.44,.76],.13,.08],
    [[-.9,.25,.35],.12,.1],[[.9,.25,.35],.12,.1],[[-.97,.1,-.1],.11,.07],[[.97,.1,-.1],.11,.07],
    [[-.6,.6,.3],.15,.12],[[.6,.6,.3],.15,.12],[[-.7,.45,-.5],.15,.1],[[.7,.45,-.5],.15,.1],
    [[-.5,-.35,-.78],.15,.06],[[-.15,-.45,-.88],.15,.06],[[.2,-.45,-.88],.15,.06],[[.52,-.35,-.78],.15,.06]].forEach(l=>lock(l[0],l[1],l[2]));}
  // 개미탈용 앞머리: 탈 구멍 윗부분 밑으로만 깔끔하게 빼꼼 나오는 지그재그 앞머리 (나머지 머리는 탈 안에)
  const hoodBangs=[];
  {const ramp=(a,v)=>{const az=Math.abs(a);return az<.85?v:Math.min(.95,.33+(az-.85)*6);};
   const zig=a=>{const w=Math.pow(tri(a/(PI*2/14)+.5),.85);return .16+.17*w;};
   const LB=[[-1.02,-.7,.16,.75],[-.7,.12,.2,1.6],[.12,.7,.24,1.25],[.7,1.02,.16,1.3]];
   const bob=a=>{for(const L of LB){if(a>=L[0]&&a<=L[1]){const u=Math.pow((a-L[0])/(L[1]-L[0]),L[3]);const d=Math.pow(1-Math.pow(Math.abs(2*u-1),.9),.75);return .5-(.5-L[2])*d;}}return .5;};
   [zig,bob].forEach(fn=>{const hb=wm(shell(.43,96,a=>ramp(a,fn(a)),.975,.96,0,0),hairTexM);hb.scale.set(1.03,1.0,.93);head.add(hb);hb.visible=false;hoodBangs.push(hb);});}
  let hoodOn=false;const hoodBtn=document.getElementById('hoodBtn');
  const hairStyles=[hairParts.slice(),hairB,hairD];WL.userData.hairMeshes=hairParts.concat(hairB,hairD).filter(o=>o.isMesh);WL.userData.noMerge=hoodBangs.slice();hairC.forEach(o=>o.parent&&o.parent.remove(o));hairC.forEach(o=>o.visible=false);let hairIdx=2;
  function applyLook(){const hw=WL.userData.hw||0;hoodParts.forEach(o=>o.visible=hw===1);hairStyles.forEach((arr,i)=>arr.forEach(o=>o.visible=hw!==1&&i===hairIdx));hoodBangs.forEach((b,i)=>b.visible=hw===1&&i===[0,1,0][hairIdx]);}
  WL.userData.applyLook=applyLook;applyLook();
  const HNAMES=['지그재그 앞머리','둥근 단발','지그재그 단발'];const hairBtn=document.getElementById('hairBtn');
  hairBtn.addEventListener('click',()=>{hairIdx=(hairIdx+1)%hairStyles.length;applyLook();hairBtn.textContent='머리: '+HNAMES[hairIdx];});
}
