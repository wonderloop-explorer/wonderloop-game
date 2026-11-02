/* 따라가기 카메라 거리 자동 시험 — 집·바위·큰 잎 옆을 걸어서 지나가며 카메라 거리를 프레임마다 잰다(2026-11-02, 꽃지붕 집 옆에서 카메라가 당겨졌다 물러났다 하던 일 뒤)
   보통 주소(촬영 모드 아님 — 따라가기 카메라는 플레이 때만): http://localhost:8000/?zone=fairy-dock&quality=mobile (휴대폰 세로 창에서)
   (await import('/tools/cam-walk-test.js')).run({paths}) → {길:[{이름, 거리:[[초, m, 당김]…], 바뀜}], 그림(dataURL)}
   paths: [{이름, from:[x,z], to:[x,z], yaw, pitch, dist}] — yaw·pitch·dist는 플레이어가 정해 둔 카메라(끌기·두 손가락). 없으면 선착장 기본 길 셋.
   '바뀜' = 1초 안에 카메라 거리가 0.8m 넘게 줄었다 다시 늘어난 횟수(당겼다 물러났다 되풀이). 고치면 0이어야 한다. */
const DEF=[
  {이름:'꽃지붕 집 옆',from:[-5.6,-9],to:[2,-9],yaw:Math.PI-.25,pitch:.35,dist:7.5},
  {이름:'바위 옆',from:[-1.4,-.4],to:[5.6,.9],yaw:2.4,pitch:.3,dist:7.5},
  {이름:'큰 잎 지붕 아래',from:[-5.6,6.4],to:[-.8,1.2],yaw:-1.9,pitch:.4,dist:7.5}];
export async function run({paths=DEF}={}){
  const G=window.wlGame,C=G.controls.input.cam,cam=G.view.camera;let W=null;window.wlZone.cur.root.parent.traverse(o=>{if(!W&&o.userData&&o.userData.vert)W=o;});const U=W.userData;
  const frame=()=>new Promise(r=>requestAnimationFrame(r)),wait=ms=>new Promise(r=>setTimeout(r,ms));const out=[];
  for(const p of paths){W.position.set(p.from[0],0,p.from[1]);C.yaw=p.yaw;C.pitch=p.pitch;C.dist=p.dist;await wait(1800);
    U.walkTo(p.to[0],p.to[1]);const t0=performance.now(),s=[];
    while(U.isWalking()&&performance.now()-t0<15000){await frame();C.yaw=p.yaw;const d=cam.position.distanceTo({x:W.position.x,y:W.position.y+.85,z:W.position.z});s.push([+((performance.now()-t0)/1000).toFixed(3),+d.toFixed(3),+(C.pull??1).toFixed(3)]);}
    let flips=0;for(let i=0;i<s.length;i++){const j=s.findIndex((q,k)=>k>i&&q[0]-s[i][0]<=1&&s[i][1]-q[1]>.8);if(j<0)continue;const back=s.findIndex((q,k)=>k>j&&q[0]-s[i][0]<=1&&q[1]-s[j][1]>.8);if(back>=0){flips++;i=back;}}
    out.push({이름:p.이름,거리:s,바뀜:flips,최소:Math.min(...s.map(q=>q[1])),최대:Math.max(...s.map(q=>q[1]))});}
  // 그림: 길마다 한 칸, 가로 시간(초)·세로 카메라 거리(m)
  const Wd=900,H=220,cv=document.createElement('canvas');cv.width=Wd;cv.height=H*out.length;const g=cv.getContext('2d');g.font='15px sans-serif';
  out.forEach((o,k)=>{const y0=k*H,T=Math.max(...o.거리.map(q=>q[0]),1),D=Math.max(16,o.최대+1);g.fillStyle='#fffaf2';g.fillRect(0,y0,Wd,H);g.strokeStyle='#e5d8c8';g.lineWidth=1;
    for(let m=0;m<=D;m+=4){const y=y0+H-20-(H-50)*m/D;g.beginPath();g.moveTo(50,y);g.lineTo(Wd-10,y);g.stroke();g.fillStyle='#75565e';g.fillText(m+'m',8,y+5);}
    g.strokeStyle='#c2496b';g.lineWidth=2.5;g.beginPath();o.거리.forEach(([t,d],i)=>{const x=50+(Wd-60)*t/T,y=y0+H-20-(H-50)*d/D;i?g.lineTo(x,y):g.moveTo(x,y);});g.stroke();
    g.fillStyle='#3e2834';g.fillText(`${o.이름} — 카메라 거리 ${o.최소.toFixed(1)}~${o.최대.toFixed(1)}m · 당겼다 물러났다 ${o.바뀜}번 · ${T.toFixed(1)}초`,60,y0+22);});
  return {길:out.map(o=>({이름:o.이름,바뀜:o.바뀜,최소:+o.최소.toFixed(2),최대:+o.최대.toFixed(2),프레임:o.거리.length})),자료:out,그림:cv.toDataURL('image/png')};}
