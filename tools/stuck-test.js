/* 끼임 자동 시험 — 걸어 다닐 수 있는 곳 전체를 0.2m 칸으로 돌며 원더룹이 끼일 수 있는 곳을 찾는다(2026-11-02, 요정의 숲 마을에서 갇힌 일 뒤)
   http://localhost:8000/?shot&zone=<구역> 에서 (페이지가 다 뜬 뒤) (await import('/tools/stuck-test.js')).run() → {요약, 목록, 그림(dataURL)}
   보는 것:
   ① 막힌 섬: 서 있을 수 있는데 들어오는 자리(spawn)에서 걸어서 갈 수 없는 칸 — 활공·튀는 발판·탈것으로 들어가면 못 나온다
   ② 끼이는 칸: 열여섯 방향으로 걸어 봐도(07과 같은 미끄러짐 규칙 — 대각선이 막히면 x만·z만) 0.15m도 못 가는 칸
   ③ 둥근 장애물 속에서 시작(활공 흔들림 등으로 파고든 경우): 07의 '덜 파고드는 쪽으로는 걸을 수 있다' 규칙으로 1.5초 안에 열린 칸까지 나오는지
   들어오는 자리(spawn)와 구역 정보 walkLinks(탈것에서 내리는 자리 등)에서 출발한다
   ④ 실제 게임 안전장치: 끼이는 곳에 세워 두고 조이스틱을 계속 밀면 3초 뒤 열린 곳으로 밀려나는지(07 unstick)
   그림: 위에서 본 지도 — 초록 걸을 수 있음 · 회색 막힘 · 빨강 막힌 섬 · 자홍 끼이는 칸 · 주황 장애물 속에서 못 나옴 */
export async function run({step=.2}={}){
  const Z=window.wlZone,cur=Z.cur,blocked=Z.blocked,overlap=Z.overlap,s=window.wlShot;
  const A=Object.values(cur.areas),b=[Math.min(...A.map(a=>a.bounds[0])),Math.max(...A.map(a=>a.bounds[1])),Math.min(...A.map(a=>a.bounds[2])),Math.max(...A.map(a=>a.bounds[3]))];
  const nx=Math.round((b[1]-b[0])/step)+1,nz=Math.round((b[3]-b[2])/step)+1,X=i=>b[0]+i*step,Zc=j=>b[2]+j*step,id=(i,j)=>j*nx+i;
  const free=new Uint8Array(nx*nz);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)free[id(i,j)]=blocked(X(i),Zc(j),0)?0:1;
  // ① 들어오는 자리에서 걸어서 닿는 칸(이웃 칸 사이 가운데도 열려 있어야)
  const sp=cur.spawn,si=Math.round((sp.x-b[0])/step),sj=Math.round((sp.z-b[2])/step),reach=new Uint8Array(nx*nz),q=[id(si,sj)];reach[q[0]]=1;
  for(const [x,z] of cur.walkLinks||[]){const k=id(Math.round((x-b[0])/step),Math.round((z-b[2])/step));if(free[k]){reach[k]=1;q.push(k);}} // 구역 정보 walkLinks: 탈것에서 내리는 자리처럼 걷지 않고 닿는 곳
  while(q.length){const k=q.pop(),i=k%nx,j=(k-i)/nx;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,c=j+dj;if(a<0||c<0||a>=nx||c>=nz)continue;const kk=id(a,c);
    if(free[kk]&&!reach[kk]&&!blocked((X(i)+X(a))/2,(Zc(j)+Zc(c))/2,0)){reach[kk]=1;q.push(kk);}}}
  // ② 걸어 보기(07 규칙 그대로 — 대각선이 막히면 x만, 그다음 z만; 장애물 속이면 덜 파고드는 쪽만)
  const canGo=(x,z,nx2,nz2)=>{if(!blocked(nx2,nz2,0))return true;const c=overlap(x,z,0);return c>0&&overlap(nx2,nz2,0)<c-1e-4;};
  const walk=(x,z,a,n=30,st=.05)=>{const dx=Math.cos(a)*st,dz=Math.sin(a)*st;for(let k=0;k<n;k++){if(canGo(x,z,x+dx,z+dz)){x+=dx;z+=dz;}else if(canGo(x,z,x+dx,z))x+=dx;else if(canGo(x,z,x,z+dz))z+=dz;}return [x,z];};
  const bestMove=(x,z,n)=>{let m=0,end=null;for(let d=0;d<16;d++){const [ex,ez]=walk(x,z,d/16*Math.PI*2,n);const dd=Math.hypot(ex-x,ez-z);if(dd>m){m=dd;end=[ex,ez];}}return {m,end};};
  const circles=A.flatMap(a=>a.obstacles.filter(o=>o.c)),inCircle=(x,z)=>circles.some(o=>Math.hypot(x-o.c[0],z-o.c[1])<o.c[2]+.28);
  const island=[],stuck=[],trapped=[];
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=id(i,j),x=X(i),z=Zc(j);
    if(free[k]){if(!reach[k])island.push([+x.toFixed(2),+z.toFixed(2)]);
      const edge=[[1,0],[-1,0],[0,1],[0,-1]].some(([di,dj])=>!free[id(Math.min(nx-1,Math.max(0,i+di)),Math.min(nz-1,Math.max(0,j+dj)))]);
      if(edge&&reach[k]&&bestMove(x,z,6).m<.15)stuck.push([+x.toFixed(2),+z.toFixed(2)]);}
    else if(overlap(x,z,0)<.6&&inCircle(x,z)){ // ③ 둥근 장애물(줄기·집·바위·소품) 가장자리 0.6m 안쪽까지 파고든 자리에서 시작 — 물길(네모 띠)은 07이 들어가지 못하게 막는다
      let ok=false;for(let d=0;d<16&&!ok;d++){const [ex,ez]=walk(x,z,d/16*Math.PI*2,30);ok=!blocked(ex,ez,0);}
      if(!ok)trapped.push([+x.toFixed(2),+z.toFixed(2)]);}}
  // ④ 실제 게임 안전장치: 두 장애물 사이 좁은 틈(있으면 끼이는 칸, 없으면 장애물 속 한 곳)에 세우고 조이스틱을 계속 민다
  let safety=null;if(s){const WL=s.WL,U=WL.userData,hut=circles.reduce((m,o)=>o.c[2]>(m?m.c[2]:0)?o:m,null),pick=stuck[0]||(hut&&[hut.c[0]+hut.c[2]*.5,hut.c[1]]); // 없으면 가장 큰 둥근 장애물(집) 속 — 활공 흔들림으로 파고든 경우
    if(pick){const [x0,z0]=pick;WL.position.set(x0,0,z0);s.step(2);let dir=null;
      for(let d=0;d<16&&!dir;d++){const a=d/16*Math.PI*2,[ex,ez]=walk(x0,z0,a,6);if(Math.hypot(ex-x0,ez-z0)<.05)dir=a;} // 못 가는 쪽으로 밀기
      dir=dir??0;const p0=WL.position.clone();let moved=0,at=null;
      s.drive({x:Math.cos(dir),z:Math.sin(dir),run:false});for(let f=0;f<60*5;f++){s.step(1);const d=WL.position.distanceTo(p0);if(d>moved){moved=d;if(d>.25&&at===null)at=f/60;}}
      s.drive(null);safety={자리:pick,밀어낸_거리:+moved.toFixed(2),빠져나온_초:at===null?null:+at.toFixed(2),지금_막힘:blocked(WL.position.x,WL.position.z,0)};}}
  // 그림
  const S=4,cv=document.createElement('canvas');cv.width=nx*S;cv.height=nz*S;const g=cv.getContext('2d');
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=id(i,j);g.fillStyle=free[k]?(reach[k]?'#9fd47a':'#e04848'):'#8a8a8a';g.fillRect(i*S,j*S,S,S);}
  const dot=(arr,c)=>{g.fillStyle=c;arr.forEach(([x,z])=>g.fillRect((x-b[0])/step*S-1,(z-b[2])/step*S-1,S+2,S+2));};dot(stuck,'#e030c8');dot(trapped,'#ff9a20');
  g.fillStyle='#2050ff';g.beginPath();g.arc(si*S,sj*S,6,0,7);g.fill();
  const cluster=a=>{const out=[];a.forEach(p=>{const c=out.find(o=>Math.hypot(o[0]-p[0],o[1]-p[1])<1.2);if(c)c[2]++;else out.push([p[0],p[1],1]);});return out.sort((x,y)=>y[2]-x[2]).slice(0,12);};
  return {요약:{구역:cur.id,칸:step,걸을_수_있는_칸:free.reduce((a,v)=>a+v,0),막힌_섬_칸:island.length,끼이는_칸:stuck.length,장애물_속에서_못_나옴:trapped.length,안전장치:safety},
    목록:{막힌_섬:cluster(island),끼이는_곳:cluster(stuck),못_나옴:cluster(trapped)},그림:cv.toDataURL('image/png')};}
