/* 무한 우주 STAGE 3 구름 행성(금성) 본편 (2026-11-18 — 그 전에는 도착까지만 있는 임시 구역). 성격은 '살피기'(조용히 관찰), 대화보다 사건이 먼저. 처음 하는 사람 약 3분 20초.
   땅: 사방이 연보라 안개인 푹신한 구름 땅(정점 색 한 장), 해는 서쪽(-x)에 낮게 — 안개 너머 희미한 빛 덩어리로만 보이고(빛 판 1), 구름 기둥의 그림자는 동쪽(+x)으로 길게.
   길(PATH): 시작 [0,0] → 갈림길 1 [0,-20] → 갈림길 2 [-23,-20] → 굽이 → 갈림길 3 [-40,-4] → 문 구역 시작 [-54,-4] → 구름 문 [-70,-4] → 구름 끝 [-85,-4]. 비밀 [8.5,-7](첫 구간 옆 안개 속).
   흐름:
   ① 도착(whirl-lift cloudArrival 그대로): 도착 알림 + TR-004 → S3-001 나레이션(안내 문구 + 목소리) → 3초 조용히
   ② 거꾸리: 안개 속에서 뒷걸음(등이 먼저)으로 걸어 나와 원더룹 앞에서 돌아섬 → 끊김 없이 S3-002 → 003 → 004 → 친구 카드. 그 뒤로는 원더룹보다 약 3m 앞에서 뒷걸음으로 길잡이(얼굴은 원더룹 쪽) — 갈림길 앞에서는 멈춰 기다림(답을 먼저 가지 않음)
   ③ 그림자 길 찾기: 갈림길 셋(갈래 3·2·3), 갈래 입구마다 구름 기둥 + 바닥의 길고 또렷한 그림자(가짜 그림자 판 — 휴대폰도 같은 그림). 맞는 길 = 그림자 반대쪽(서쪽).
      맞으면 안개가 한 단계 옅어지고 맑은 소리(event-open), 틀리면 4.2m쯤에서 구름이 둥실 갈림길로 되돌림(실패 아님·화면 어두워짐 없음), 같은 갈림길에서 두 번 틀리면 거꾸리가 그림자를 가리키며 S3-005.
      셋을 다 지나면 안개가 크게 걷히며 S3-006 → 발견 카드 1(S3-007). 길 안내 빛기둥 없음(그림자가 길 안내). 길에서 6m 넘게 벗어나도 구름이 길로 되돌림.
   ④ 뭉게 문지기: 문 구역 시작에서 거꾸리 S3-008. 코 골 때(몸이 부풀었다 꺼짐 + event-snore)는 걸어도 됨. 몇 초마다 뒤척이며 '?' + S3-009 — 1.5초 동안 멈춰야 함(0.45초 여유 뒤부터 봄).
      '?' 중에 움직이면 '!' + S3-010, 구름이 문 구역 시작점으로 살짝 밀어냄. 대쉬·점프는 코골이 중에도 '?'를 부름. 문을 지나면 S3-011(잠꼬대) + 친구 카드.
      박자: 들어서고 1.8초 뒤 첫 '?', 그 뒤 코골이 2.4초마다 — 문까지 16m(걷기 약 4.3초)라 보통 '?'를 두 번 겪으면 지나감. 뭉게가 화면 밖이어도 '?'는 화면 가장자리에 붙어 보임.
   ⑤ 구름 끝: S3-012 → 013 → 토성 고리 얼음 조각 배가 떠 옴 → 둘이 탐 → 발견 카드 2(S3-014) → 지도 카드(S3-018) → 배가 출발 → 'STAGE 3 완료!' (쉼터가 아직 없어 배는 구름 끝으로 돌아와 내려 줌 — 이동 연출은 쉼터를 만들 때)
   비밀: 또생일 — 촛불 빛이 안개 속에 희미하게 + 생일 노래가 작게(tune-birthday). 말 걸면 S3-015 → 016 → 친구 카드 → '촛불 불기' → 반짝 + 발견 카드 3(S3-017). 들르지 않아도 끝낼 수 있음.
   저장: flags venus:met · venus:f1~f3 · venus:gate · venus:ddo · clear:space-venus, 발견 secret:<세계>:venussun · venusair · venusday. 다시 열면 진행한 곳에서 시작(안개도 그만큼 걷힌 채).
   그리기(구역 것): 땅 1 · 기둥·구름 둑·문 1 · 그림자 1 · 해 빛 1 · 거꾸리 3 · 뭉게 3 · 또생일 1 · 케이크 2 · 촛불 빛 1 · 배 1 · 구름 알갱이 1 = 17. 시험 tools/space-stage3-test.py */
import * as THREE from 'three';
import {PI,QUALITY,rng,blobMany} from '../../01-textures.js';
import * as G from '../../game/index.js';
import {sbMat} from '../../game/storybook.js';
import {markChar} from '../../game/bend.js';
import {RIDE,points} from './meteor-ride.js';
import {cloudArrival} from './whirl-lift.js';
import {lump} from './martians.js';
import {makeGeokkuri,makeMunge,makeDdo,makeCake,makeIceBoat,pillarParts,puff} from './cloudfolk.js';
import SPACE from '../../worlds/infinite-space.js';
const WID=SPACE.id,ZID='space-venus';
const K={met:'venus:met',f:['venus:f1','venus:f2','venus:f3'],gate:'venus:gate',ddo:'venus:ddo',clear:'clear:'+ZID};
const DISC={sun:'secret:'+WID+':venussun',air:'secret:'+WID+':venusair',day:'secret:'+WID+':venusday'},DISC_TOTAL=3;
/* 대사(docs/voice/script.csv SPC-S3-… 와 글자가 같아야 목소리를 찾는다) */
const T={n1:'구름이 너무 두꺼워서 한 치 앞도 안 보여요. 어디로 가야 할까요?',g2:"녕안! 아, 여기 말로 '안녕'이야. 나는 거꾸리, 뭐든 거꾸로 하지!",g3:'여기선 해가 서쪽에서 떠. 그래서 그림자도 반대로 읽어야 해.',g4:'그림자 반대쪽이 앞이야! 갈림길에서 그림자를 잘 보고 따라와.',
  g5:'그림자가 가리키는 쪽 말고, 그 반대쪽!',g6:'봐, 구름이 걷히잖아! 서쪽에서 뜬 해가 길을 비춰 줘.',n7:'금성은 다른 행성과 거꾸로 돌아서, 해가 서쪽에서 뜨고 동쪽으로 져요.',g8:'쉿, 뭉게 문지기가 자고 있어. 코를 골 때만 살금살금 걸어.',
  m9:'음? 누구야?',m10:'어이쿠, 누가 깨웠어?',m11:'드르렁, 더 자야지.',g12:'다 왔다! 여기가 구름 끝이야. 토성 고리에서 날아온 얼음 조각으로 배를 띄워 줄게.',g13:'나도 같이 갈래! 거꾸로 타면 더 재밌거든.',
  n14:'금성 땅은 아주 뜨겁지만, 구름 위 높은 곳은 기압과 온도가 지구와 비슷해요.',d15:'오늘 생일이야! 하루가 다 가기 전에 1년이 지나 버렸거든!',d16:'케이크 한 조각 먹고 가! 초는 네가 불어도 돼.',
  n17:'금성은 한 바퀴 도는 데 243일, 해를 한 바퀴 도는 데 225일이 걸려요. 하루가 1년보다 길어요.',n18:'보름 할아버지의 지도에 구름 행성이 그려졌어요.',g19:'그림자 반대쪽이 앞이야!'};
const BX=[-88,12,-34,14]; // 걷는 범위
function groundY(x,z){return .22*Math.sin(x*.21+Math.sin(z*.13)*1.4)*Math.cos(z*.19)+.14*Math.sin((x+z)*.37)+.1*Math.sin(x*.61-z*.47);}
const PATH=[[0,0],[0,-20],[-23,-20],[-36,-20],[-39,-18.8],[-40,-16],[-40,-4],[-54,-4],[-70,-4],[-85,-4]];
const FORKS=[{c:[0,-20],br:[{d:[-1,0],ok:true},{d:[0,-1]},{d:[1,0]}]},{c:[-23,-20],br:[{d:[-1,0],ok:true},{d:[0,-1]}]},{c:[-40,-4],br:[{d:[-1,0],ok:true},{d:[0,1]},{d:[1,0]}]}];
const GS=[-54,-4],GATE=[-70,-4],END=[-85,-4],SEC=[8.5,-7],CAKE=[9.5,-6.2],MUNGE=[-68.3,-6.5],SPUR=[[0,-6.5],SEC];
const SHD=(()=>{const l=Math.hypot(9,1);return [9/l,1/l];})(); // 그림자가 뻗는 쪽(동쪽 — 해 반대)
const SUNDIR=new THREE.Vector3(-9,3.0,-1).normalize(); // 해가 있는 쪽(서쪽 낮게)
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);},lerp=(a,b,t)=>a+(b-a)*t;
/* 길 계산: 누적 길이·한 점을 길 위로 내린 자리 */
const SEG=PATH.slice(1).map((p,i)=>Math.hypot(p[0]-PATH[i][0],p[1]-PATH[i][1])),ACC=[0];SEG.forEach(l=>ACC.push(ACC[ACC.length-1]+l));const SLEN=ACC[ACC.length-1];
function pointAt(s){s=Math.min(SLEN,Math.max(0,s));for(let i=0;i<SEG.length;i++)if(s<=ACC[i+1]||i===SEG.length-1){const u=(s-ACC[i])/SEG[i];return [lerp(PATH[i][0],PATH[i+1][0],u),lerp(PATH[i][1],PATH[i+1][1],u)];}}
function segD(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,u=Math.min(1,Math.max(0,((x-a[0])*dx+(z-a[1])*dz)/l2)),px=a[0]+dx*u,pz=a[1]+dz*u;return {d:Math.hypot(x-px,z-pz),u,pt:[px,pz]};}
function proj(x,z){let best=null;for(let i=0;i<SEG.length;i++){const q=segD(x,z,PATH[i],PATH[i+1]);if(!best||q.d<best.d)best={d:q.d,s:ACC[i]+q.u*SEG[i],pt:q.pt};}return best;}
const sOf=p=>proj(p[0],p[1]).s,SF=FORKS.map(f=>sOf(f.c)),S_GS=sOf(GS),S_GATE=sOf(GATE),S_END=sOf(END);
export function build({root}){const MOB=QUALITY.tier==='mobile',keep=[],F=G.state.flags,R0=rng('space-venus:decor'),RR=(a,b)=>a+R0()*(b-a),obstacles=[];
  G.profile.setup({world:WID,cards:SPACE.cards});
  const add=o=>{root.add(o);keep.push(o);return o;};
  /* ── 땅: 구름 결(연보라·크림) + 길 자리는 조금 밝게, 구름 끝(x<-88.5) 너머는 아래로 꺼짐 ── */
  const X0=-110,X1=24,Z0=-46,Z1=26,CELL=MOB?1.8:1.5,NX=Math.round((X1-X0)/CELL),NZ=Math.round((Z1-Z0)/CELL);
  const stubs=FORKS.flatMap(f=>f.br.filter(b=>!b.ok).map(b=>[f.c,[f.c[0]+b.d[0]*6.5,f.c[1]+b.d[1]*6.5]]));
  const pathD=(x,z)=>{let d=proj(x,z).d;for(const [a,b] of stubs)d=Math.min(d,segD(x,z,a,b).d);return Math.min(d,segD(x,z,SPUR[0],SPUR[1]).d+.8);};
  {const pos=[],col=[],uv=[],idx=[],A=new THREE.Color('#e3d0f3'),C2=new THREE.Color('#c9a6e0'),C3=new THREE.Color('#f6ecfd'),CP=new THREE.Color('#fbf5ff'),t=new THREE.Color();
    for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++){const x=X0+(X1-X0)*i/NX,z=Z0+(Z1-Z0)*j/NZ;let y=groundY(x,z);const off=Math.max(0,-88.5-x);y-=off*off*.35+off*.5;pos.push(x,y,z);uv.push(x/4,z/4);
      t.copy(A).lerp(C3,Math.max(0,groundY(x,z)*2.2)).lerp(C2,Math.max(0,-groundY(x,z)*2.6)).lerp(CP,.6*ss(2.4,.6,pathD(x,z))).lerp(C2,Math.min(.6,off*.12));col.push(t.r,t.g,t.b);}
    for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const a=j*(NX+1)+i,b=a+1,c=a+NX+1,d=c+1;idx.push(a,c,b,b,c,d);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
    const mat=sbMat('#ffffff');mat.vertexColors=true;var ground=new THREE.Mesh(geo,mat);ground.name='venus-cloud';ground.receiveShadow=true;ground.frustumCulled=false;add(ground);}
  /* ── 하늘·안개: 처음엔 3~24m, 갈림길을 지날 때마다 한 단계 옅어짐(SK.fogPush) ── */
  const KEY={top:'#cdb2e6',horizon:'#dcc8ee',hemi:'#f1e6fb',ground:'#b99ad6',hemiI:.84,sun:'#fff0dc',sunI:.5,sunDir:[9,-3.0,1],fill:.3,fog:'#d6c0ea',fogNear:3,fogFar:24,stars:0,milky:0};
  const SK=G.sky.sky({parent:root,keys:[KEY,KEY,KEY],t:0,nStars:0});
  const FOGS=[[0,0],[1.5,7],[3,15],[7,44]];
  /* ── 구름 기둥(갈래 입구마다 하나)·구름 문·구름 둑·길가 구름 둔덕: 한 덩어리 / 그림자: 한 덩어리 ── */
  const parts=[],shadows=[];
  const pillar=(x,z,h,seed,sl=6.2,sw=1.5)=>{parts.push(...pillarParts(x,z,groundY(x,z),h,seed));obstacles.push({c:[x,z,.78]});shadows.push([x,z,sl,sw]);};
  FORKS.forEach((f,i)=>f.br.forEach((b,j)=>{const sd=(i+j)%2?1:-1,x=f.c[0]+b.d[0]*3.4-b.d[1]*sd*1.9,z=f.c[1]+b.d[1]*3.4+b.d[0]*sd*1.9;b.pil=[x,z];pillar(x,z,3.3,i*3+j);}));
  /* 구름 문: 큰 기둥 둘 + 위를 잇는 구름 아치 + 양옆 구름 둑(돌아갈 수 없게) */
  for(const s of [-1,1]){pillar(GATE[0],GATE[1]+s*2.6,4.2,20+s,7.5,2);for(let i=0;i<7;i++){const a=i/6*PI,y=groundY(...GATE)+3.5+Math.sin(a)*.9;if(s>0)parts.push([puff(.62+Math.sin(i*2.3)*.08,GATE[0]+Math.sin(i*1.9)*.12,y,GATE[1]+Math.cos(a)*2.6),['#f1e6fb','#e6d6f6','#f8f1fd'][i%3]]);}
    for(let k=0;k<5;k++){const z=GATE[1]+s*(4.5+k*1.9),x=GATE[0]+Math.sin(k*1.7+s)*.5,r=1.25-k*.06;parts.push([puff(r,x,groundY(x,z)+r*.55,z,[1,.85,1]),['#e6d6f6','#f1e6fb','#dccaf0'][k%3]]);obstacles.push({c:[x,z,r*.9]});}}
  for(let i=0;i<(MOB?22:34);i++){const x=RR(BX[0]+2,BX[1]-1),z=RR(BX[2]+1,BX[3]-1),d=pathD(x,z);if(d<3.4||d>9||Math.hypot(x-SEC[0],z-SEC[1])<3.2||Math.hypot(x-MUNGE[0],z-MUNGE[1])<3||Math.hypot(x,z)<4)continue;
    const r=RR(.5,1.15);parts.push([puff(r,x,groundY(x,z)+r*.3,z,[1.25,.6,1.1]),['#efe4fa','#e3d2f4','#f6eefd'][i%3]]);if(i%3===0)parts.push([puff(r*.55,x+r*.8,groundY(x,z)+r*.2,z+r*.3,[1.2,.6,1]),'#e3d2f4']);}
  {const m=lump(parts,false,.6);m.name='venus-pillars';m.frustumCulled=false;add(m);}
  {const c=document.createElement('canvas');c.width=128;c.height=32;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,128,0);gr.addColorStop(0,'rgba(92,62,140,.74)');gr.addColorStop(.7,'rgba(92,62,140,.6)');gr.addColorStop(1,'rgba(92,62,140,0)');g.fillStyle=gr;g.fillRect(0,0,128,32);
    g.globalCompositeOperation='destination-in';const gv=g.createLinearGradient(0,0,0,32);gv.addColorStop(0,'rgba(0,0,0,0)');gv.addColorStop(.22,'#000');gv.addColorStop(.78,'#000');gv.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gv;g.fillRect(0,0,128,32);
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const pos=[],uv=[],idx=[],N=7;
    shadows.forEach(([x,z,L,W])=>{const b=pos.length/3,px=-SHD[1],pz=SHD[0];for(let i=0;i<=N;i++){const u=i/N,w=W*(1-.25*u)/2;for(const s of [-1,1]){const X=x+SHD[0]*L*u+px*w*s,Z=z+SHD[1]*L*u+pz*w*s;pos.push(X,groundY(X,Z)+.05,Z);uv.push(u,s>0?1:0);}}
      for(let i=0;i<N;i++){const a=b+i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}});
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);
    const m=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});m.userData.noStorybook=true;
    const me=new THREE.Mesh(geo,m);me.name='venus-shadows';me.frustumCulled=false;me.renderOrder=1;me.userData.noMerge=true;add(me);}
  /* 해: 안개 너머 희미한 빛 덩어리(카메라를 따라다니는 판 — 안개 끝 바로 안쪽에 두어 가까운 물체에는 가려짐) */
  const glow=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,250,236,1)');gr.addColorStop(.18,'rgba(255,240,214,.7)');gr.addColorStop(.5,'rgba(255,226,204,.22)');gr.addColorStop(1,'rgba(255,226,204,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,opacity:.5});m.userData.noBend=true;m.userData.noStorybook=true;
    const s=new THREE.Sprite(m);s.name='venus-sun';s.userData.noMerge=true;s.frustumCulled=false;add(s);return s;})();
  /* ── 주민 ── */
  const gg=makeGeokkuri(),munge=makeMunge(),ddo=makeDdo(),cake=makeCake(),boat=makeIceBoat();
  [gg.root,munge.root,ddo.root,cake.g,boat].forEach(o=>{add(o);markChar(o);});boat.visible=false;gg.root.visible=false;
  munge.root.position.set(MUNGE[0],groundY(...MUNGE),MUNGE[1]);munge.root.rotation.y=Math.atan2(GS[0]-MUNGE[0],GS[1]+1.5-MUNGE[1]);obstacles.push({c:[MUNGE[0],MUNGE[1],1.25]});
  ddo.root.position.set(SEC[0],groundY(...SEC),SEC[1]);ddo.root.rotation.y=Math.atan2(-SEC[0],-3-SEC[1]);obstacles.push({c:[SEC[0],SEC[1],.3]});
  cake.g.position.set(CAKE[0],groundY(...CAKE),CAKE[1]);obstacles.push({c:[CAKE[0],CAKE[1],.34]});cake.lit(!F[DISC.day]);
  /* 촛불 빛: 안개 속에서도 희미하게 보이는 따뜻한 빛(안개를 덜 받는 판) */
  const candle=(()=>{const m=glow.material.clone();m.color=new THREE.Color('#ffc66e');m.opacity=.5;m.userData.noBend=true;m.userData.noStorybook=true;const s=new THREE.Sprite(m);s.position.set(CAKE[0],groundY(...CAKE)+.55,CAKE[1]);s.scale.setScalar(2.6);s.userData.noMerge=true;add(s);s.visible=!F[DISC.day];return s;})();
  const blobs=blobMany(3);if(blobs){blobs.frustumCulled=false;add(blobs);}
  const puffs=points(root,MOB?70:120,{map:glow.material.map,add:false,size:.6,grav:-.04,drag:1.6});keep.push(puffs.pts);
  const puffAt=(x,z,n,sp=.9,col=[.95,.9,1])=>{const y=groundY(x,z);for(let i=0;i<n;i++){const a=Math.random()*PI*2,r=.2+Math.random()*.6,v=sp*(.4+Math.random()*.7),k=.88+Math.random()*.12;puffs.emit(x+Math.cos(a)*r,y+.15+Math.random()*.5,z+Math.sin(a)*r,Math.cos(a)*v,.3+Math.random()*.6,Math.sin(a)*v,1.3+Math.random()*1.2,[col[0]*k,col[1]*k,col[2]*k]);}};
  /* 뭉게 머리 위 '?'·'!'(화면 표시 — 그리기 0) */
  if(!document.getElementById('vnMarkCss')){const s=document.createElement('style');s.id='vnMarkCss';s.textContent='.vn-mark{font:700 1.5rem/1 Jua,sans-serif;color:#3e2834;background:#fff6e0;border:2.5px solid #4a2a2a;border-radius:999px;width:2.1rem;height:2.1rem;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 0 rgba(74,42,42,.35)}.vn-mark.al{background:#ffd66b}';document.head.appendChild(s);}
  const qmark=G.float.add({root:munge.root,y:2.45,cls:'vn-mark',text:'?',far:40,prio:3,clamp:true});qmark.show(false);
  /* ── 상태 ── */
  const solved=()=>K.f.filter(k=>F[k]).length;
  const pend=RIDE.pending&&RIDE.pending.cloud?RIDE.pending:(/[?&]arrive\b/.test(location.search)&&!F[K.met]?{cloud:true}:null);if(RIDE.pending&&RIDE.pending.cloud)RIDE.pending=null; /* ?arrive: 시험용 — 주소로 바로 열어도 내려앉는 연출부터 */
  let arr=null,started=false;
  const st={arrDone:!pend,scene:false,lastQ:null,fog:[...FOGS[solved()]],wrong:[0,0,0],carry:null,intro:0,ggOn:!!F[K.met],ggMode:'idle',gate:{ph:'snore',t:1.8,in:false,said:false,grace:0,n:0,caught:0},mState:'sleep',spd:0,lastP:null,songT:0,songK:0,T:{}};
  const U0=()=>G.view.camera&&G.mission.hero&&G.mission.hero();
  const say=(who,text,sec,o)=>G.dialog.say(who,text,sec,undefined,o),wait=s=>G.core.wait(s);
  const pk=()=>{const c=G.view.camera;return c&&c.aspect<1.25?Math.min(2,1.25/c.aspect):1;};
  const mark=k=>{if(st.T[k]==null)st.T[k]=+G.clock.t.toFixed(2);};
  const stage=()=>!st.arrDone?'arrive':!F[K.met]?'meet':solved()<3?'forks':!F[K.gate]?'gate':!F[K.clear]?'end':'done';
  function quest(q){if(q!==st.lastQ){st.lastQ=q;G.ui.setQuest(q);G.goal.set(null);}}
  const ggPlace=(x,z)=>{gg.root.position.set(x,groundY(x,z),z);};
  const faceTo=(o,x,z,dt)=>{const ry=Math.atan2(x-o.position.x,z-o.position.z);if(dt==null){o.rotation.y=ry;return;}o.rotation.y+=Math.atan2(Math.sin(ry-o.rotation.y),Math.cos(ry-o.rotation.y))*Math.min(1,dt*7);};
  if(st.ggOn){const s=F[K.clear]?S_END-1.2:Math.min(sOf(spawnAt())+3,S_END-1.2),p=pointAt(s);ggPlace(p[0],p[1]);gg.root.visible=true;}
  function spawnAt(){return F[K.clear]?[END[0]+2.6,END[1]]:F[K.gate]?[GATE[0]-3,GATE[1]]:F[K.f[2]]?[-44.5,-4]:F[K.f[1]]?[-27.5,-20]:F[K.f[0]]?[-4.5,-20]:[0,0];}
  /* 이야기 장면 감싸기(화성과 같은 방식): 원더룹은 서 있고(sceneLock — 조이스틱·화면 누르기·점프 모두 잠김), who를 주면 대화 카메라 */
  async function scene(fn,who){if(st.scene)return;const W=U0();if(!W)return;st.scene=true;const U=W.userData;if(U.stopWalk)U.stopWalk();U.sceneLock=true;
    let pc=null;if(who){W.rotation.y=Math.atan2(who.root.position.x-W.position.x,who.root.position.z-W.position.z);pc=G.view.pairCam(who.root,who.head);if(pc)G.view.hold(pc);}
    try{await fn(W,U);}catch(e){console.error(e);}finally{if(pc&&G.view.req&&G.view.req.fn===pc)G.view.hold(null);U.sceneLock=false;st.scene=false;st.lastQ=null;}}
  /* 구름이 둥실 되돌려 보냄(틀린 갈래·길 밖·문지기) — 살짝 떠서 미끄러지듯, 화면은 그대로 */
  function carryBack(W,to,sec=1.15){const U=W.userData,P=W.position,a=[P.x,P.z];if(U.stopWalk)U.stopWalk();U.sceneLock=true;U.riding={y:P.y,carry:false};U.action='서기';U.at=0;G.sound.sfx('cloud-poof',{gain:.9});puffAt(P.x,P.z,MOB?10:16,.8);
    return new Promise(res=>{st.carry={t:0,sec,a,to,res,W};});}
  function tickCarry(dt){const c=st.carry;if(!c)return;c.t+=dt;const u=Math.min(1,c.t/c.sec),e=u*u*(3-2*u),W=c.W,U=W.userData,x=lerp(c.a[0],c.to[0],e),z=lerp(c.a[1],c.to[1],e),y=groundY(x,z)+Math.sin(u*PI)*.55;
    W.position.set(x,y,z);if(U.riding)U.riding.y=y;if(Math.random()<dt*14)puffAt(x,z,1,.4);
    if(u>=1){st.carry=null;W.position.y=groundY(x,z);U.riding=null;puffAt(x,z,MOB?8:12,.7);G.sound.sfx('land',{gain:.4});if(c.to[2]!=null)W.rotation.y=c.to[2];if(!st.scene)U.sceneLock=false;st.lastP=null;c.res();}}
  /* ── ① 도착 뒤 나레이션 → 3초 조용히 → ② 거꾸리 등장 ── */
  async function intro(W,U){if(st.intro)return;st.intro=1;
    await G.core.until(()=>!document.getElementById('wlToast')?.classList.contains('on')&&!G.sound.voiceBusy(),12);await wait(.4);mark('nar');
    G.ui.toast(T.n1,5.2,T.n1);await wait(1);await G.core.until(()=>!document.getElementById('wlToast')?.classList.contains('on')&&!G.sound.voiceBusy(),14);
    await wait(3);await G.core.until(()=>!G.core.blocking()&&!G.ui.cardShown()&&!st.carry&&!(U.vert&&U.vert.air),20);mark('gg');
    await scene(async()=>{const P=W.position,s0=proj(P.x,P.z).s,far=pointAt(Math.min(SF[0]-1.5,s0+12)),dx=far[0]-P.x,dz=far[1]-P.z,d=Math.hypot(dx,dz)||1,to=[P.x+dx/d*1.9,P.z+dz/d*1.9];
      ggPlace(far[0],far[1]);gg.root.visible=true;st.ggOn=true;gg.root.rotation.y=Math.atan2(dx,dz); /* 등이 원더룹 쪽(뒷걸음으로 다가옴) */
      /* 카메라: 원더룹 등 뒤 위에서 거꾸리가 나오는 안개 쪽을(도착 카메라는 원더룹 앞쪽이라 등 뒤에서 오는 거꾸리가 안 보였다) — 만지면 플레이어 것 */
      const ec=()=>{const k=pk(),g=gg.root.position;return {at:[lerp(P.x,g.x,.45),1.0,lerp(P.z,g.z,.45)],from:[P.x-dx/d*4.6*k+dz/d*1.6,2.5+.9*(k-1),P.z-dz/d*4.6*k-dx/d*1.6]};};G.view.hold(ec);
      U.action='두리번';U.at=0;const t0=G.clock.t,len=Math.hypot(to[0]-far[0],to[1]-far[1]),TT=Math.max(1.6,len/3.4);st.ggMode='walk';let stp=0;
      await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/TT);ggPlace(lerp(far[0],to[0],u),lerp(far[1],to[1],u));if(u>.35){if(U.action==='두리번'){U.action='서기';U.at=0;}W.rotation.y+=Math.atan2(Math.sin(Math.atan2(dx,dz)-W.rotation.y),Math.cos(Math.atan2(dx,dz)-W.rotation.y))*.15;}
        if(Math.floor((G.clock.t-t0)*4.5)!==stp){stp=Math.floor((G.clock.t-t0)*4.5);G.sound.sfx('step',{gain:.7});}return u>=1;},TT+1);
      st.ggMode='idle';U.action='서기';U.at=0;G.react.react('startle',{sound:null});G.sound.sfx('event-pop',{gain:.6});
      {const t1=G.clock.t,r0=gg.root.rotation.y;await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t1)/.45);gg.root.rotation.y=r0+PI*u*u*(3-2*u);return u>=1;},1);} /* 빙글 돌아서 원더룹을 봄 */
      W.rotation.y=Math.atan2(gg.root.position.x-P.x,gg.root.position.z-P.z);const pc=G.view.pairCam(gg.root,gg.head);if(pc)G.view.hold(pc);else if(G.view.req&&G.view.req.fn===ec)G.view.hold(null);
      try{st.ggMode='talk';await say('거꾸리',T.g2,4.6);await say('거꾸리',T.g3,4.4);await say('거꾸리',T.g4,4.6);st.ggMode='idle';}finally{if(pc&&G.view.req&&G.view.req.fn===pc)G.view.hold(null);}
      G.state.setFlag(K.met,true);mark('met');U.sceneLock=false;await G.profile.meet('geokkuri',gg.root);});}
  /* ── ③ 갈림길 ── */
  const forkHere=P=>{let hit=null;FORKS.forEach((f,i)=>{const dx=P.x-f.c[0],dz=P.z-f.c[1];if(Math.hypot(dx,dz)>9)return;let bj=-1,bd=0;f.br.forEach((b,j)=>{const a=dx*b.d[0]+dz*b.d[1],pp=Math.abs(dx*b.d[1]-dz*b.d[0]);if(a>bd&&pp<3.2){bd=a;bj=j;}});if(bj>=0&&bd>4.2)hit={i,j:bj,f,b:f.br[bj]};});return hit;};
  async function forkRight(W,U,i){G.state.setFlag(K.f[i],true);mark('f'+(i+1));G.sound.sfx('event-open',{gain:.9});puffAt(W.position.x,W.position.z,MOB?8:14,1.2,[1,.97,.86]);
    if(solved()<3)return;
    await G.core.until(()=>!G.core.blocking()&&!(U.vert&&U.vert.air),6);
    await scene(async()=>{G.sound.sfx('event-sparkle');G.react.react('awe',{sound:null});st.ggMode='talk';await wait(.5);await say('거꾸리',T.g6,4.2,{look:'해'});st.ggMode='idle';
      G.state.setFlag(DISC.sun,true);G.react.react('joy',{sound:'card-secret',bounce:false});
      await G.ui.secret({kicker:'새 발견',title:'해가 서쪽에서 떠요',text:T.n7,vo:T.n7,count:`발견 ${discN()}/${DISC_TOTAL}`,at:innerHeight>innerWidth?'bottom':null}); /* 세로 화면: 위에 뜨면 서쪽 하늘의 해를 가림 */
      mark('card1');});}
  async function forkWrong(W,U,h,count){const f=h.f,back=[f.c[0]+(h.i===0?0:h.i===1?1.2:0),f.c[1]+(h.i===0?1.2:h.i===1?0:-1.2),Math.atan2(-SHD[0],-SHD[1])];
    if(count)st.wrong[h.i]++;await carryBack(W,back);
    if(count&&st.wrong[h.i]>=2&&st.wrong[h.i]%2===0)await scene(async()=>{const p=h.f.br[0].pil,sx=p[0]+SHD[0]*3,sz=p[1]+SHD[1]*3;ggPlace(f.c[0]+SHD[0]*1.6,f.c[1]+SHD[1]*1.6-1.4);faceTo(gg.root,sx,sz);st.ggMode='point';
      await say('거꾸리',T.g5,3.6,{look:{at:[sx,sz],name:'그림자'}});st.ggMode='idle';mark('hint'+(h.i+1));});}
  const discN=()=>Object.values(DISC).filter(k=>F[k]).length;
  /* ── ④ 뭉게 문지기 ── */
  function gateTick(dt,W,U,P){const g=st.gate,inZone=P.x<GS[0]+.6&&P.x>GATE[0]-1.3&&Math.abs(P.z-GATE[1])<8;
    if(F[K.gate]){st.mState='sleep';qmark.show(false);return;}
    if(P.x<=GATE[0]-1.3&&Math.abs(P.z-GATE[1])<3.2){G.state.setFlag(K.gate,true);mark('gate');qmark.show(false);st.mState='sleep';G.sound.sfx('event-open',{gain:.7});
      say('뭉게 문지기',T.m11,2.6,{hear:'혼잣말',look:'잠꼬대'}).then(ok=>ok&&G.profile.meet('munge',munge.root));return;}
    if(!inZone||st.scene||st.carry){if(!st.carry&&g.ph!=='wake'){if(g.ph==='ask'){g.ph='snore';g.t=2.2;}st.mState='sleep';qmark.show(false);}return;}
    if(!g.said){g.said=true;mark('gateIn');scene(async()=>{faceTo(gg.root,P.x,P.z);st.ggMode='talk';await say('거꾸리',T.g8,4.4);st.ggMode='idle';g.ph='snore';g.t=1.8;},null);return;}
    quest('코 골 때만 살금살금 걸어요');
    const loud=!!(U.vert&&U.vert.air)||st.spd>8;
    if(g.ph==='snore'){st.mState='sleep';g.t-=dt;if(g.t<=0||loud){g.ph='ask';g.t=1.5;g.grace=loud?.6:.45;g.n++;qmark.set('?');qmark.el.classList.remove('al');qmark.show(true);G.sound.sfx('guard-notice',{gain:.9});say('뭉게 문지기',T.m9,1.3,{hear:'혼잣말',look:'뒤척임'});mark('ask'+g.n);}}
    else if(g.ph==='ask'){st.mState='ask';g.t-=dt;g.grace-=dt;
      if(g.grace<=0&&(st.spd>.6||(U.vert&&U.vert.air))){g.ph='wake';g.caught++;qmark.set('!');qmark.el.classList.add('al');st.mState='wake';G.sound.sfx('guard-alert');mark('caught'+g.caught);
        scene(async()=>{G.react.react('startle',{sound:null});const s=say('뭉게 문지기',T.m10,2.4,{hear:'혼잣말',look:'깜짝'});await wait(.45);await carryBack(W,[GS[0]+1.2,GS[1],-PI/2],1.3);await s;qmark.show(false);st.mState='sleep';g.ph='snore';g.t=2.2;},null);}
      else if(g.t<=0){g.ph='snore';g.t=2.4;qmark.show(false);}}}
  /* ── ⑤ 구름 끝: 얼음 조각 배 ── */
  const DOCK=[-90.7,-4],BY=-.3;
  async function ending(W,U){const P=W.position;faceTo(gg.root,P.x,P.z);W.rotation.y=Math.atan2(gg.root.position.x-P.x,gg.root.position.z-P.z);mark('end');
    {const pc=G.view.pairCam(gg.root,gg.head);if(pc)G.view.hold(pc);st.ggMode='talk';await say('거꾸리',T.g12,5.2);await say('거꾸리',T.g13,3.6);st.ggMode='idle';if(pc&&G.view.req&&G.view.req.fn===pc)G.view.hold(null);}
    /* 배가 떠 옴 */
    const B={x:-105,z:-11,ry:.5};boat.visible=true;const setBoat=t=>{boat.position.set(B.x,BY+Math.sin(t*1.7)*.05,B.z);boat.rotation.set(Math.sin(t*1.3)*.03,B.ry,Math.sin(t*1.1)*.04);};st.boat={B,setBoat};
    const cam=()=>{const k=pk();return {at:[B.x+.4,.75,B.z],from:[B.x+5.2*k,2.4+1.2*(k-1),B.z+6.2*k]};};
    faceTo(gg.root,-105,-11);W.rotation.y=Math.atan2(-105-P.x,-11-P.z);st.ggMode='point';G.sound.sfx('event-sparkle');
    {const t0=G.clock.t,a=[B.x,B.z];await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/3.2),e=1-Math.pow(1-u,2.4);B.x=lerp(a[0],DOCK[0],e);B.z=lerp(a[1],DOCK[1],e);B.ry=lerp(.5,0,e);return u>=1;},4.5);}
    st.ggMode='idle';G.sound.sfx('cloud-poof',{gain:.7});G.view.hold(cam);
    /* 둘이 올라탐: 거꾸리가 먼저(뱃머리 쪽, 거꾸로 앉음 — 원더룹을 봄), 원더룹이 뒤따라 */
    const hop=(from,to,sec,fn)=>{const t0=G.clock.t;return G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/sec),e=u*u*(3-2*u);fn(lerp(from[0],to[0],e),lerp(from[1],to[1],e)+Math.sin(u*PI)*.8,lerp(from[2],to[2],e));return u>=1;},sec+1);};
    {const r=gg.root.position;G.sound.sfx('jump',{gain:.6});await hop([r.x,r.y,r.z],[DOCK[0]-.75,BY+.14,DOCK[1]],.7,(x,y,z)=>gg.root.position.set(x,y,z));gg.root.rotation.y=PI/2;st.ggSit=true;G.sound.sfx('event-pop',{gain:.5});}
    {U.riding={y:P.y,carry:false};G.sound.sfx('jump');await hop([P.x,P.y,P.z],[DOCK[0]+.55,BY+.3,DOCK[1]],.8,(x,y,z)=>{W.position.set(x,y,z);U.riding.y=y;});W.rotation.y=-PI/2;U.action='앉기';U.at=0;st.aboard=true;G.sound.sfx('event-pop');G.react.react('joy',{sound:null,bounce:false});}
    mark('boat');await wait(.9);
    G.state.setFlag(DISC.air,true);G.sound.sfx('card-secret');
    await G.ui.secret({kicker:'새 발견',title:'구름 위는 지구와 비슷해요',text:T.n14,vo:T.n14,count:`발견 ${discN()}/${DISC_TOTAL}`});await wait(.4);
    await G.ui.notice({kicker:'우주 지도',title:'구름 행성을 그렸어요!',text:T.n18,vo:T.n18,icon:SPACE.icons.map()});mark('map');
    /* 출발 → 완료 카드 → (쉼터가 생길 때까지) 구름 끝으로 돌아와 내려 줌 */
    G.sound.sfx('travel-depart',{gain:.7});{const t0=G.clock.t;await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/3.4),e=u*u;B.x=lerp(DOCK[0],DOCK[0]-9.5,e);B.z=lerp(DOCK[1],DOCK[1]+2.2,e);B.ry=lerp(0,-.22,e);return u>=1;},5);}
    G.sound.sfx('mission-clear');G.state.setFlag(K.clear,true);mark('clear');G.state.saveAfter(ZID,{time:0});
    await Promise.race([G.ui.itemCard({title:'STAGE 3 완료!',text:'구름 행성 탐험 완료 · 다음 목적지: 토성 쉼터',icon:SPACE.icons.map(),sec:3.2,sound:null,who:'완료'}),wait(3.8)]);
    {const t0=G.clock.t,a=[B.x,B.z,B.ry];await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/2.6),e=u*u*(3-2*u);B.x=lerp(a[0],DOCK[0],e);B.z=lerp(a[1],DOCK[1],e);B.ry=lerp(a[2],0,e);return u>=1;},4);}
    st.aboard=false;U.action='서기';U.at=0;G.sound.sfx('jump');{const p=W.position,to=[END[0]-1.3,groundY(END[0]-1.3,END[1]),END[1]];await hop([p.x,p.y,p.z],to,.8,(x,y,z)=>{W.position.set(x,y,z);U.riding.y=y;});U.riding=null;W.rotation.y=PI/2;G.sound.sfx('land',{gain:.5});puffAt(to[0],to[2],8,.6);}
    st.ggSit=false;{const r=gg.root.position,to=[END[0]-1.6,groundY(END[0]-1.6,END[1]-1.7),END[1]-1.7];await hop([r.x,r.y,r.z],to,.7,(x,y,z)=>gg.root.position.set(x,y,z));}
    if(G.view.req&&G.view.req.fn===cam)G.view.hold(null);st.boat=null;st.ggHome=[END[0]-1.6,END[1]-1.7];mark('done');}
  /* ── 비밀: 또생일 ── */
  G.dialog.npc({id:'geokkuri',name:'거꾸리',root:gg.root,bubbleY:gg.head+.32,talkR:.9,bubbleR:4.5,variants:[{when:()=>true,lines:[]},{when:()=>!!F[K.met]&&!st.scene&&!st.carry&&st.gate.ph==='snore'&&gg.root.visible,lines:[T.g19]}]}); /* 뒤에 있는 맞는 묶음이 이김(dialog rawLines) — 빈 묶음을 맨 앞에 */
  G.dialog.npc({id:'munge',name:'뭉게 문지기',root:munge.root,bubbleY:2.3,talkR:1.4,bubbleR:.01,variants:[{when:()=>true,lines:[]}]}); /* 말 걸 상대가 아님(자는 중) — 대사 줄에서 이름으로 찾을 수 있게만 */
  G.dialog.npc({id:'ddo',name:'또생일',root:ddo.root,bubbleY:1.0,talkR:1.0,bubbleR:4.5,onDone:()=>{if(!F[K.ddo]){G.state.setFlag(K.ddo,true);mark('ddo');G.profile.meet('ddo',ddo.root);}},
    variants:[{when:()=>true,lines:[]},{when:()=>!F[K.ddo]&&!st.scene,lines:[T.d15,T.d16]},{when:()=>!!F[DISC.day]&&!st.scene,lines:[T.d15]}]});
  const cakeMark=new THREE.Object3D();cakeMark.position.set(CAKE[0],groundY(...CAKE)+.3,CAKE[1]);add(cakeMark);
  G.interact.add({root:cakeMark,at:[CAKE[0]-.75,CAKE[1]+.55],face:CAKE,label:'촛불 불기',action:'들여다보기',dur:.9,near:2.1,once:false,when:()=>!!F[K.ddo]&&!F[DISC.day]&&!st.scene&&!G.ui.cardShown(),
    onDone:()=>scene(async(W)=>{cake.lit(false);candle.visible=false;G.sound.sfx('event-sparkle');puffAt(CAKE[0],CAKE[1],MOB?14:24,1.5,[1,.9,.55]);G.react.react('joy',{sound:null});st.ddoHop=1.6;await wait(1.1);
      G.state.setFlag(DISC.day,true);G.sound.sfx('card-secret');mark('candle');await G.ui.secret({kicker:'숨겨진 비밀',title:'하루가 1년보다 길어요',text:T.n17,vo:T.n17,count:`발견 ${discN()}/${DISC_TOTAL}`});},null)});
  /* ── 매 프레임 ── */
  function update(dt,t){const W=U0();if(!W)return;const U=W.userData,P=W.position,cam=G.view.camera;
    mark('start');if(pend&&!started){started=true;arr=cloudArrival({G,root,WL:W,groundY,mob:MOB,onDone:()=>{st.arrDone=true;mark('land');G.ui.toast('구름 행성 금성에 도착했어요! 금성은 온통 두꺼운 구름에 덮여 있어요',4.2,'구름 행성 금성에 도착했어요!');}});}
    if(arr)arr.tick(dt,t);puffs.tick(dt);tickCarry(dt);
    /* 안개: 지난 갈림길 수만큼 옅게(천천히) + 해 빛 덩어리 */
    {const g=FOGS[solved()];st.fog[0]+=(g[0]-st.fog[0])*Math.min(1,dt*.9);st.fog[1]+=(g[1]-st.fog[1])*Math.min(1,dt*.9);SK.fogPush=st.fog;
      const d=(KEY.fogFar+st.fog[1])*.86;glow.position.copy(cam.position).addScaledVector(SUNDIR,d);glow.scale.setScalar(d*(.62-.2*st.fog[1]/44));glow.material.opacity=.42+.5*st.fog[1]/44;}
    /* 원더룹 빠르기(문지기 판정) */
    {if(st.lastP&&dt>0){const v=Math.hypot(P.x-st.lastP[0],P.z-st.lastP[1])/dt;st.spd+=(v-st.spd)*Math.min(1,dt*18);}st.lastP=[P.x,P.z];}
    /* 주민 움직임 */
    const beat=munge.tick(dt,t,st.mState);if(beat&&Math.hypot(P.x-MUNGE[0],P.z-MUNGE[1])<20&&!F[K.clear])G.sound.sfx('event-snore',{gain:Math.max(.25,1-Math.hypot(P.x-MUNGE[0],P.z-MUNGE[1])/22)});
    ddo.tick(dt,t,st.ddoHop>0?'talk':'idle');if(st.ddoHop>0)st.ddoHop-=dt;if(!st.scene)faceTo(ddo.root,P.x,P.z,Math.hypot(P.x-SEC[0],P.z-SEC[1])<5?dt:0);cake.tick(t);
    if(Math.hypot(P.x-SEC[0],P.z-SEC[1])<16&&!st.scene&&!G.dialog.talking()){st.songT-=dt;if(st.songT<=0){st.songT=3.3;G.sound.sfx('tune-birthday',{phrase:st.songK++,gain:Math.max(.12,.75*(1-Math.hypot(P.x-SEC[0],P.z-SEC[1])/16))});}}
    if(st.boat)st.boat.setBoat(t);if(st.aboard){const B=st.boat.B;W.position.set(B.x+.55,boat.position.y+.6,B.z);U.riding.y=W.position.y;}
    if(st.ggSit&&st.boat){const B=st.boat.B;gg.root.position.set(B.x-.75,boat.position.y+.44,B.z);}
    /* 거꾸리 길잡이: 원더룹보다 약 3m 앞(길 위), 아직 안 푼 갈림길 앞에서는 멈춰 기다림. 얼굴은 늘 원더룹 쪽 */
    let gm=st.ggMode;if(st.ggOn&&!st.scene&&!st.boat&&!G.dialog.talking()){const r=gg.root.position;let tx,tz;
      if(st.ggHome){[tx,tz]=st.ggHome;}else{const n=solved(),cap=n<3?SF[n]-1.1:S_END-1.2,s=Math.min(cap,proj(P.x,P.z).s+3),p=pointAt(s);tx=p[0];tz=p[1];}
      const dx=tx-r.x,dz=tz-r.z,d=Math.hypot(dx,dz);if(d>.12){const v=Math.min(5.4,d*5),s=Math.min(d,v*dt);ggPlace(r.x+dx/d*s,r.z+dz/d*s);gm=v>.5?'walk':'idle';}else gm='idle';
      faceTo(gg.root,P.x,P.z,dt);}
    else if(st.ggOn&&G.dialog.talking()){faceTo(gg.root,P.x,P.z,dt);gm='talk';}
    gg.tick(dt,t,st.ggSit?'sit':gm);
    if(blobs){const b=(i,o,r,on)=>blobs.set(i,o.position.x,groundY(o.position.x,o.position.z)+.03,o.position.z,on?r:0);b(0,gg.root,.42,gg.root.visible&&!st.ggSit);b(1,munge.root,1.25,true);b(2,ddo.root,.26,true);blobs.instanceMatrix.needsUpdate=true;}
    if(!st.arrDone||(G.front.frontShown&&G.front.frontShown()))return;
    if(st.scene||st.carry||U.riding)return;
    const sg=stage();
    if(sg==='meet'){quest('');intro(W,U);}
    else if(sg==='forks')quest('그림자를 보고 길을 찾아요');
    else if(sg==='gate'){if(!st.gate.said||P.x>GS[0]+.6)quest('거꾸리를 따라가요');}
    else if(sg==='end')quest('구름 끝으로 가요');else quest('');
    if(G.core.blocking()||G.ui.cardShown()||G.dialog.talking())return;
    const air=!!(U.vert&&U.vert.air);
    /* 갈림길: 맞는 갈래·틀린 갈래 */
    if(F[K.met]&&!air){const h=forkHere(P);if(h){if(h.b.ok){if(!F[K.f[h.i]]&&(h.i===0||F[K.f[h.i-1]])){forkRight(W,U,h.i);return;}}else{forkWrong(W,U,h,!F[K.f[h.i]]);return;}}}
    /* 길에서 멀리 벗어나면 구름이 길로 되돌림(비밀 자리·그리로 가는 샛길은 괜찮음) */
    if(!air){const q=proj(P.x,P.z),inSec=Math.hypot(P.x-SEC[0],P.z-SEC[1])<5.5||segD(P.x,P.z,SPUR[0],SPUR[1]).d<4;if(q.d>6&&!inSec){const p=q.pt;carryBack(W,[p[0],p[1]]);return;}
      /* 아직 안 푼 갈림길을 건너뛰어 앞으로 가지 못하게 */
      const n=solved();if(n<3&&q.s>SF[n]+5.5){const f=FORKS[n];carryBack(W,[f.c[0],f.c[1]]);return;}}
    if(sg==='gate'||(sg==='forks'&&false))gateTick(dt,W,U,P);
    if(sg==='end'&&P.x<END[0]+3.2&&!air)scene(ending,null);}
  function lateUpdate(dt,t){if(arr)arr.late(dt,t);}
  const sp=spawnAt();
  return {name:'구름 행성',kind:'outdoor',start:{compass:true},world:null,
    spawn:{x:sp[0],z:sp[1],ry:sp[0]||sp[1]?-PI/2:PI},
    areas:{field:{bounds:BX,obstacles,camera:{target:[0,1,0],dist:9,polar:[.45,1.35],azimuth:null,start:[2.6,.95],minDist:3,maxDist:30}}},
    sun:{dir:new THREE.Vector3(...KEY.sunDir).normalize(),shadow:16,follow:true},
    sky:SK,far:120,ambience:'wind',charFog:.12, /* 캐릭터는 안개를 아주 약하게(game/bend markChar — 주민·배도, 배경 안개는 그대로) */groundY,ground:[ground],keepOut:keep,
    arrival:()=>arr,
    state:()=>({arrDone:st.arrDone,landed:!!(arr&&arr.state.landed),stage:stage(),scene:st.scene,carry:!!st.carry,solved:solved(),wrong:[...st.wrong],gate:st.gate.ph,gateN:st.gate.n,caught:st.gate.caught,gateSaid:st.gate.said,quest:st.lastQ||'',fog:st.fog.map(v=>+v.toFixed(1)),
      gg:[+gg.root.position.x.toFixed(2),+gg.root.position.z.toFixed(2),+gg.root.rotation.y.toFixed(2),gg.root.visible],spd:+st.spd.toFixed(2),aboard:!!st.aboard,boat:st.boat?[+st.boat.B.x.toFixed(1),+st.boat.B.z.toFixed(1)]:null,T:{...st.T},t:+G.clock.t.toFixed(2),disc:discN(),met:!!F[K.met],clear:!!F[K.clear]}),
    spots:{spawn:[0,0],path:PATH,forks:FORKS.map(f=>({c:f.c,br:f.br.map(b=>({d:b.d,ok:!!b.ok,pil:b.pil}))})),gs:GS,gate:GATE,end:END,sec:SEC,cake:CAKE,munge:MUNGE,shd:SHD},
    update,lateUpdate,dispose(){if(arr){arr.dispose();arr=null;}qmark.remove();puffs.dispose();const W=U0();if(W){W.scale.set(1,1,1);W.userData.sceneLock=false;if(st.carry||st.aboard)W.userData.riding=null;}}};}
