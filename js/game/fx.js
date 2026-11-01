/* 원더룹 — 장면 효과 도우미: 빛 입자(떠오르기·흩날리기), 같은 모델 여러 개(무리)
   - particles({parent, n, box, vel, color, size, life, additive, rate}) → {update(dt,center), burst(k, at), points, dispose}
     빛 입자: 상자(box [가로,높이,세로 반폭]) 안에서 생겨 vel 방향(위로 + 흔들림)으로 움직이다 life초 뒤 사라지고 다시 생긴다.
     rate: 초당 새로 생기는 수(0이면 처음부터 n개가 돌고 돎), burst(k,{x,y,z})로 한꺼번에 k개(별꽃 개화 같은 순간).
     덧칠(additive) 빛이라 어두운 곳에서 빛나 보이고, 사라질 때는 색을 어둡게 해서 흐려진다(투명도 정렬 문제 없음). 그리기 1회.
     난수는 seed로 정해져 촬영 모드에서 매번 같은 그림.
   - crowd({parent, n, parts:[{geo, mat, cast, at:[x,y,z]}], blobs}) → {set(i,x,y,z,ry,s), part(k), meshes, count}
     같은 모델 n개를 부품마다 InstancedMesh 하나로(부품 수만큼 그리기). set(i,x,y,z,ry,s)이 발바닥 자리(y = 땅에서 뜬 높이)를 정하고 부품은 at만큼 떨어져 붙는다.
     날개처럼 따로 움직일 부품은 part(k).setMatrixAt으로 직접. blobs: 01 blobMany(n)의 결과(휴대폰 단계 발밑 그림자, 컴퓨터는 null)를 넘기면 함께 옮긴다.
     면 수를 아끼려면 부품 geo를 낮은 분할로(요정 무리는 몸·머리 합쳐 200면 안쪽 권장). */
import * as THREE from 'three';
let dotTex=null;
const dot=()=>{if(dotTex)return dotTex;const cv=document.createElement('canvas');cv.width=cv.height=32;const g=cv.getContext('2d'),gr=g.createRadialGradient(16,16,0,16,16,16);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.4,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);
  dotTex=new THREE.CanvasTexture(cv);return dotTex;};
function particles({parent,n=120,box=[3,4,3],vel=[0,.6,0],sway=.35,color='#fff1b8',size=.12,life=[3,6],additive=true,rate=0,seed=11,center=[0,0,0]}={}){
  let r=seed;const R=()=>(r=(r*16807)%2147483647)/2147483647,rr=(a,b)=>a+(b-a)*R();
  const pos=new Float32Array(n*3),col=new Float32Array(n*3),base=new THREE.Color(color),P=[];
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('color',new THREE.BufferAttribute(col,3).setUsage(THREE.DynamicDrawUsage));
  const m=new THREE.PointsMaterial({size,map:dot(),vertexColors:true,transparent:true,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,sizeAttenuation:true,fog:false});
  const pts=new THREE.Points(g,m);pts.frustumCulled=false;if(parent)parent.add(pts);
  const c0=new THREE.Vector3(...center);
  const spawn=(p,at,age)=>{const o=at||c0;p.x=o.x+rr(-1,1)*box[0];p.y=o.y+(at?rr(-.2,.2):rr(0,box[1]));p.z=o.z+rr(-1,1)*box[2];p.age=age??0;p.life=rr(life[0],life[1]);p.ph=rr(0,6.3);p.v=rr(.7,1.3);p.on=true;};
  for(let i=0;i<n;i++){const p={};if(rate>0){p.on=false;p.age=0;p.life=1;}else spawn(p,null,rr(0,life[1]));P.push(p);}
  let acc=0;
  const S={points:pts,
    burst(k,at){const v=at?new THREE.Vector3(at.x,at.y,at.z):null;for(const p of P){if(k<=0)break;if(!p.on){spawn(p,v);k--;}}},
    update(dt,center){if(center)c0.set(center.x,center.y||0,center.z);
      if(rate>0){acc+=dt*rate;for(const p of P){if(acc<1)break;if(!p.on){spawn(p);acc--;}}acc=Math.min(acc,1);}
      for(let i=0;i<n;i++){const p=P[i];if(!p.on){col[i*3]=col[i*3+1]=col[i*3+2]=0;continue;}
        p.age+=dt;if(p.age>p.life){if(rate>0)p.on=false;else spawn(p);continue;}
        const s=Math.sin(p.age*1.7+p.ph)*sway;p.x+=(vel[0]*p.v)*dt;p.y+=(vel[1]*p.v)*dt;p.z+=(vel[2]*p.v)*dt;
        pos[i*3]=p.x+s;pos[i*3+1]=p.y;pos[i*3+2]=p.z+Math.cos(p.age*1.3+p.ph)*sway*.7;
        const u=p.age/p.life,f=Math.min(1,u*5)*Math.min(1,(1-u)*3); // 처음엔 서서히 켜지고 끝에서 흐려짐
        col[i*3]=base.r*f;col[i*3+1]=base.g*f;col[i*3+2]=base.b*f;}
      g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;},
    dispose(){pts.removeFromParent();g.dispose();m.dispose();}};
  S.update(0);return S;}
function crowd({parent,n,parts,blobs=null}){
  const grp=new THREE.Group();if(parent)parent.add(grp);
  const meshes=parts.map(p=>{const m=new THREE.InstancedMesh(p.geo,p.mat,n);m.castShadow=p.cast!==false;m.receiveShadow=true;m.frustumCulled=false;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);grp.add(m);return m;});
  const offs=parts.map(p=>new THREE.Matrix4().makeTranslation(...(p.at||[0,0,0])));const o=new THREE.Object3D(),M=new THREE.Matrix4();
  return {group:grp,meshes,count:n,part:k=>meshes[k],
    set(i,x,y,z,ry=0,s=1){o.position.set(x,y,z);o.rotation.set(0,ry,0);o.scale.setScalar(s);o.updateMatrix();
      meshes.forEach((m,k)=>{M.multiplyMatrices(o.matrix,offs[k]);m.setMatrixAt(i,M);m.instanceMatrix.needsUpdate=true;});
      if(blobs)blobs.set(i,x,0,z,.24*s*Math.max(.3,1-y*.6));},
    color(k,i,c){const m=meshes[k];m.setColorAt(i,new THREE.Color(c));m.instanceColor.needsUpdate=true;}};}
export {crowd,particles};
