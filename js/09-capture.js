/* 원더룹 — 영상 캡처 모드: http://localhost:8000/?shot&capture=<대본.js>[&aspect=16x9|9x16][&go][&png]
   (python3 tools/shot-server.py 로 띄운다 → 결과를 captures/<세계>/ 에 저장. 서버가 없으면 내려받기)
   - 대본(촬영 순서) = 구간 목록. 화면비마다 새 페이지에서 한 번씩 찍는다(매번 같은 그림 → 16:9와 9:16의 시점이 같다).
   - 영상: 16:9 2560×1440(유튜브가 1440p부터 좋은 압축을 쓴다) · 9:16 1080×1920, 24fps, H.264(High) MP4, 애프터이펙트용 중간 파일이라 높은 비트레이트(16:9 50Mbps·9:16 30Mbps).
     H.264로 그 크기를 못 만드는 브라우저면 멈춘다(VP9 MP4는 애프터이펙트가 못 읽는다). 녹화하는 동안 64MB씩 촬영 서버로 보내 메모리에 쌓지 않는다. 한 대본 최대 길이는 README "영상 캡처하기".
   - 게임은 녹화하는 동안 1/72초씩(wlShot.dt), 영상 한 프레임(1/24초) = 세 걸음. 기기 성능과 상관없이 끊김 없는 영상. 기준 스크린샷·규칙 시험은 그대로 1/60초씩.
   - 타이틀(title.js)·종이결은 짧은 변 1080 기준 크기를 화면 크기에 비례해서 그린다 → 1440p에서도 1080p와 같은 비율로 보인다.
   - 영상에는 3D 장면(+ 페이지 배경·종이결)만 들어간다. 대화창·안내 카드·결과창·말풍선·걷기 표시 같은 게임 안내는 그리지 않고,
     대사·나레이션·효과음·카드·타이틀은 시점 기록(cues.json)에 남겨 편집 때 놓는다(tools/cues-to-ae.py).
   - 타이틀·엔딩 로고(js/game/title.js, 개미굴 .logo2 모양)는 영상에 직접 그려 넣을 수 있다. 켜고 끄기: 대본 burnTitles(기본 켜짐)
     → 구간 burnTitles → c.title/c.ending의 {burn}. 그려 넣어도 시점 기록에는 남는다(burned:true).
   - 구간마다 자동 확인표(check.json): 게임 표시 숨김, 카메라 가림, 타이틀과 원더룹 겹침, 원더룹이 잘 보이는지, 같은 장면 반복, 소리 끊김, 타이틀 3초 이상, 나레이션 뒤 3초 여운.
   결과: captures/<세계>/<대본>-<화면비>.mp4 · .cues.json · .check.json (&png 를 붙이면 프레임 PNG도 <대본>-<화면비>-png/ 에)

   대본 모양 (견본: tools/capture/sample-indoor.js, 세계 대본은 wonderloop-studio/<세계>/capture/ — 촬영 서버가 /studio/ 로 보여 준다)
     export default {world:'santa', script:'opening', zone:'basecamp', setup:{outfit:1}, flags:{compass:true}, burnTitles:true, titleRibbon:'원더룹', titleDeco:(g,ch)=>{…},
       segments:[{name:'도착', noWL:false, async run(c){ c.place(0,2,0); c.camera('follow'); await c.walk(1,0); await c.settle(); }}]}
   c(구간 안에서 쓰는 것): wait(초) until(조건,최대초) place(x,z,방향) walk(x,z) go(구역,자리) talk(NPC 이름) say(누가,대사,초,소리id)
     narrate(대사 또는 {text,id}) title(로고 글자,{sec,ribbon,sub,burn}) ending(로고 글자,{sec,ribbon,sub,sub2,burn}) camera('follow'|'room'|{az,pol,dist}) set({action,expr,outfit,light,hood})
     settle(초=3: 나레이션·대화·카드·이벤트가 다 끝난 뒤 여운) flag(이름,값) auto{dialog, linePad, card, result, resultHold} G S WL
   저절로 하는 것: 대사는 목소리 길이 + 0.6초 뒤 넘김, 안내 카드·비밀 카드·도감 카드는 읽을 시간(최소 3.5초) 뒤 닫음, 결과창은 4초 뒤 첫 단추, 엔딩 화면은 6초 뒤 첫 단추. */
import * as THREE from 'three';
import {drawTitle,fontsReady} from './game/title.js';
const clamp01=x=>Math.max(0,Math.min(1,x));
const MUXER='https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.1/build/mp4-muxer.mjs';
const FPS=24,STEPS=3,DT=1/72,ASPECTS={'16x9':[2560,1440],'9x16':[1080,1920]},BITRATE={'16x9':50e6,'9x16':30e6};
const SMP=2,THUMB=12;   // 확인표 기록 간격(프레임): 원더룹 위치·가림 1/12초, 작은 화면 0.5초
const Q=new URLSearchParams(location.search);
const S=window.wlShot,G=S.game,WL=S.WL,renderer=S.renderer;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const yieldTask=()=>new Promise(r=>{const ch=new MessageChannel();ch.port1.onmessage=()=>r();ch.port2.postMessage(0);}); // 대본의 await가 다 돌 때까지

/* ---------- 영상 한 프레임 = 배경 그라데이션 + 3D 장면 + 종이결 (게임 화면과 같게, 밝은 테마) ---------- */
const frame=document.createElement('canvas'),fg=frame.getContext('2d');
// 종이결: 게임 화면과 같은 220px 무늬를 짧은 변 1080 기준으로(타이틀과 같은 min(W,H)/1080) — 1440p에서는 무늬도 같은 배율로 크게(화면에 대한 결의 크기는 1080p와 같게)
let grain=null;
function makeGrain(W,H){const n=Math.round(220*Math.max(1,Math.min(W,H)/1080)),f=(.85*220/n).toFixed(4);return new Promise(r=>{const im=new Image();im.onload=()=>{grain=im;r();};im.onerror=()=>r();
  im.src="data:image/svg+xml;utf8,"+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${n}' height='${n}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${f}' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .35 0 0 0 0 .27 0 0 0 0 .18 0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`);});}
const overlays=[],titleRects=[];   // 영상에 그려 넣는 타이틀·엔딩 {o, t0(게임 시각), sec}, 이번 프레임에 그린 타이틀 영역(픽셀)
function compose(){const W=frame.width,H=frame.height;
  const r=Math.hypot(W*1.2,H*.9)/2,gr=fg.createRadialGradient(W/2,H*.4,0,W/2,H*.4,r);gr.addColorStop(0,'#efe2c9');gr.addColorStop(1,'#e6d3b2');
  fg.globalCompositeOperation='source-over';fg.globalAlpha=1;fg.fillStyle=gr;fg.fillRect(0,0,W,H);
  fg.drawImage(renderer.domElement,0,0,W,H);
  titleRects.length=0;for(const ov of overlays){const t=G.clock.t-ov.t0;if(t<0||t>ov.sec)continue;const a=clamp01(t/.45)*clamp01((ov.sec-t)/.45),r=drawTitle(fg,W,H,ov.o,t,a);if(r&&a>.5)titleRects.push(r);}
  if(grain){fg.globalCompositeOperation='multiply';fg.globalAlpha=.2;fg.fillStyle=fg.createPattern(grain,'repeat');fg.fillRect(0,0,W,H);fg.globalCompositeOperation='source-over';fg.globalAlpha=1;}}

/* ---------- 확인표용 기록: 원더룹 화면 위치·가림(SMP 프레임 = 1/12초마다), 작은 화면(THUMB 프레임 = 0.5초마다) ---------- */
const bones={};WL.traverse(o=>{if(o.isBone)bones[o.name]=o;});
const ray=new THREE.Raycaster(),_a=new THREE.Vector3(),_b=new THREE.Vector3(),box=new THREE.Box3();
let occList=null,occZone=null;
function occluders(){const z=window.wlZone.cur;if(occZone===z)return occList;occZone=z;occList=[];
  z.root.traverseVisible(o=>{if(!o.isMesh||!o.layers.test(ray.layers)||o.userData.wlHint)return;const m=Array.isArray(o.material)?o.material[0]:o.material;
    if(m&&m.transparent&&m.opacity<.6)return;if(m&&m.depthWrite===false)return;occList.push(o);});return occList;}
function blockedTo(p){_a.copy(S.camera.position);_b.copy(p).sub(_a);const d=_b.length();ray.set(_a,_b.normalize());ray.near=.05;ray.far=d-.12;
  return ray.intersectObjects(occluders(),false).length>0;}
function wlSample(){WL.updateMatrixWorld(true);box.makeEmpty();
  for(const k in bones){bones[k].getWorldPosition(_a);box.expandByPoint(_a);}box.expandByScalar(.22);box.max.y+=.18; // 머리 위·모자
  const cam=S.camera;cam.updateMatrixWorld();let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,behind=false;
  for(let i=0;i<8;i++){_a.set(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z).project(cam);if(_a.z>1)behind=true;
    x0=Math.min(x0,_a.x);x1=Math.max(x1,_a.x);y0=Math.min(y0,_a.y);y1=Math.max(y1,_a.y);}
  const area=(x1-x0)*(y1-y0),ix=Math.max(0,Math.min(1,x1)-Math.max(-1,x0)),iy=Math.max(0,Math.min(1,y1)-Math.max(-1,y0));
  const inside=behind||area<=0?0:ix*iy/area;
  const head=bones.head?bones.head.getWorldPosition(new THREE.Vector3()):WL.position.clone().setY(1.2);
  const chest=bones.spine?bones.spine.getWorldPosition(new THREE.Vector3()):WL.position.clone().setY(.7);
  const hintOn=[...G.ui.hintObjs].filter(o=>o.visible&&o.parent).length+(document.body.classList.contains('wl-nohints')?0:1); // 안내 표시가 장면에 남았는지
  const W=frame.width,H=frame.height,rx0=(x0+1)/2*W,rx1=(x1+1)/2*W,ry0=(1-y1)/2*H,ry1=(1-y0)/2*H,parea=Math.max(1,(rx1-rx0)*(ry1-ry0));
  let tcover=0;for(const r of titleRects){const ix=Math.max(0,Math.min(rx1,r.x1)-Math.max(rx0,r.x0)),iy=Math.max(0,Math.min(ry1,r.y1)-Math.max(ry0,r.y0));tcover=Math.max(tcover,ix*iy/parea);}
  return {inside,h:(y1-y0)/2,cy:1-((y0+y1)/2+1)/2,occ:blockedTo(head)&&blockedTo(chest),hint:hintOn,title:titleRects.length>0,tcover};}
const thumbC=document.createElement('canvas'),tg=thumbC.getContext('2d',{willReadFrequently:true});
function thumb(){tg.drawImage(frame,0,0,thumbC.width,thumbC.height);const d=tg.getImageData(0,0,thumbC.width,thumbC.height).data,g=new Uint8Array(d.length/4);
  for(let i=0;i<g.length;i++)g[i]=(d[i*4]*.3+d[i*4+1]*.59+d[i*4+2]*.11)|0;return g;}
const tdiff=(a,b)=>{let s=0;for(let i=0;i<a.length;i++)s+=Math.abs(a[i]-b[i]);return s/a.length/255;};

/* ---------- 확인표 ---------- */
const OK='통과',WARN='주의',FIX='고칠 것',NA='해당 없음';
const VOICE=k=>k==='narration'||k==='dialogue';
const endOf=c=>c.t+(c.cut!=null?c.cut:(c.dur||0));
function runs(samples,test,dt=SMP/FPS){let best=null,cur=null;for(const s of samples){if(test(s)){if(!cur)cur={a:s.t,b:s.t};cur.b=s.t+dt;if(!best||cur.b-cur.a>best.b-best.a)best={...cur};}else cur=null;}return best;}
const f1=x=>(Math.round(x*10)/10).toFixed(1);
function checkSegment(seg,all,ctx){const R=[];const inSeg=x=>x.t>=seg.t0-1e-6&&x.t<seg.t1-1e-6;
  const smp=ctx.samples.filter(inSeg),th=ctx.thumbs.filter(inSeg),cues=ctx.cues.filter(inSeg);
  const add=(항목,결과,내용)=>R.push({항목,결과,내용});
  // 0. 게임 표시 숨김 (ui.hint()로 등록한 것만 알 수 있다 — 새 안내 표시는 꼭 hint()로)
  {const r=runs(smp,s=>s.hint>0);add('게임 표시 숨김',r?FIX:OK,r?`안내 표시가 보임 (${f1(r.a)}~${f1(r.b)}초)`:'등록된 안내 표시 모두 숨김');}
  // 1. 카메라 가림
  if(seg.noWL)add('카메라 가림',NA,'풍경 구간');else{const r=runs(smp,s=>s.occ);
    if(!r)add('카메라 가림',OK,'원더룹을 가린 물체 없음');
    else add('카메라 가림',r.b-r.a>=.5?FIX:WARN,`원더룹이 ${f1(r.b-r.a)}초 가려짐 (${f1(r.a)}~${f1(r.b)}초)`);}
  // 2. 원더룹이 잘 보이는지
  if(seg.noWL)add('원더룹 보임',NA,'풍경 구간');else{const out=runs(smp,s=>s.inside<.7),notes=[];let res=OK;
    if(out&&out.b-out.a>=.5){res=FIX;notes.push(`화면 밖으로 ${f1(out.b-out.a)}초 (${f1(out.a)}~${f1(out.b)}초)`);}
    const hAvg=smp.reduce((a,s)=>a+s.h,0)/Math.max(1,smp.length);
    if(smp.length&&hAvg<.06){if(res===OK)res=WARN;notes.push(`작게 보임 (화면 높이의 ${Math.round(hAvg*100)}%)`);}
    if(ctx.aspect==='9x16'){const low=runs(smp,s=>s.cy>.8||s.cy<.12);if(low&&low.b-low.a>=1){if(res===OK)res=WARN;notes.push(`쇼츠 글씨 자리(위 12%·아래 20%)에 ${f1(low.b-low.a)}초`);}}
    add('원더룹 보임',res,notes.join(', ')||`화면 높이의 평균 ${Math.round(hAvg*100)}%`);}
  // 3. 같은 장면 반복: 구간 안에서 화면이 4초 넘게 그대로(카드·타이틀이 덮는 동안은 빼고) / 앞 구간과 비슷한 장면
  {const notes=[];let still=null,cur=null;const over=ctx.cues.filter(c=>c.kind==='card'||c.kind==='title'),covered=t=>over.some(c=>t>=c.t&&t<=c.t+c.dur);
    for(let i=1;i<th.length;i++){if(tdiff(th[i].g,th[i-1].g)<.004&&!covered(th[i].t)){if(!cur)cur={a:th[i-1].t,b:th[i].t};cur.b=th[i].t;if(!still||cur.b-cur.a>still.b-still.a)still={...cur};}else cur=null;}
    if(still&&still.b-still.a>=4)notes.push(`화면이 ${f1(still.b-still.a)}초 동안 거의 그대로 (${f1(still.a)}~${f1(still.b)}초)`);
    for(const o of all){if(o===seg)break;const oth=ctx.thumbs.filter(x=>x.t>=o.t0&&x.t<o.t1);if(!oth.length||!th.length)continue;
      const same=th.filter(a=>oth.some(b=>tdiff(a.g,b.g)<.02)).length/th.length;if(same>=.6)notes.push(`앞 구간 '${o.name}'와 비슷한 장면 (${Math.round(same*100)}%)`);}
    add('같은 장면 반복',notes.length?WARN:OK,notes.join(', ')||'반복 없음');}
  // 4. 소리 끊김: 끊긴 목소리, 목소리 겹침, 영상 끝에서 잘림, 소리 없는 긴 구간, 녹음 파일 없음
  {const notes=[];let res=OK;const voices=cues.filter(c=>VOICE(c.kind));
    for(const c of voices)if(c.cut!=null){res=FIX;notes.push(`끊긴 ${c.kind==='narration'?'나레이션':'대사'} "${String(c.text).slice(0,18)}" (${f1(c.t+c.cut)}초)`);}
    for(const c of voices)if(c.cut==null&&endOf(c)>ctx.duration+.01){res=FIX;notes.push(`영상 끝에서 잘림 "${String(c.text).slice(0,18)}"`);}
    for(let i=0;i<voices.length;i++)for(let j=i+1;j<voices.length;j++){const a=voices[i],b=voices[j],ov=Math.min(endOf(a),endOf(b))-Math.max(a.t,b.t);
      if(ov>.2){if(res===OK)res=WARN;notes.push(`목소리 겹침 ${f1(ov)}초 (${a.who||a.kind}·${b.who||b.kind}, ${f1(Math.max(a.t,b.t))}초)`);}}
    const iv=ctx.cues.filter(c=>c.kind!=='card'&&c.kind!=='title'&&(c.cut!=null?c.cut:c.dur)>0).map(c=>[c.t,endOf(c)]).sort((a,b)=>a[0]-b[0]);
    let at=seg.t0,gap=null;for(const [a,b] of iv){if(b<=at)continue;if(a>at&&(!gap||a-at>gap[1]-gap[0]))gap=[at,Math.min(a,seg.t1)];at=Math.max(at,b);if(at>=seg.t1)break;}
    if(at<seg.t1&&(!gap||seg.t1-at>gap[1]-gap[0]))gap=[at,seg.t1];
    if(gap&&gap[1]-gap[0]>=6){if(res===OK)res=WARN;notes.push(`목소리·효과음 없는 구간 ${f1(gap[1]-gap[0])}초 (${f1(gap[0])}~${f1(gap[1])}초, 배경음 필요)`);}
    const nofile=voices.filter(c=>!c.file).length;if(nofile){if(res===OK)res=WARN;notes.push(`녹음 파일 없음 ${nofile}개 (길이는 글자 수로 어림)`);}
    add('소리 끊김',res,notes.join(', ')||(voices.length?'끊김 없음':'목소리 없음'));}
  // 5. 타이틀·카드 3초 이상
  {const cs=cues.filter(c=>c.kind==='title'||c.kind==='card');const short=cs.filter(c=>c.dur<3);
    add('타이틀 3초 이상',!cs.length?NA:short.length?FIX:OK,!cs.length?'타이틀·카드 없음':short.length?short.map(c=>`"${c.text}" ${f1(c.dur)}초`).join(', '):cs.map(c=>`"${c.text}" ${f1(c.dur)}초`).join(', '));}
  // 7. 타이틀과 원더룹 겹침: 영상에 그려 넣은 타이틀·엔딩이 원더룹을 가리는지 (타이틀이 다 나타난 동안)
  {const ts=smp.filter(s=>s.title);if(seg.noWL||!ts.length)add('타이틀과 원더룹 겹침',NA,seg.noWL?'풍경 구간':'그려 넣은 타이틀 없음');
    else{const r=runs(ts,s=>s.tcover>.3),mx=Math.max(...ts.map(s=>s.tcover));
      add('타이틀과 원더룹 겹침',r&&r.b-r.a>=.5?FIX:mx>.05?WARN:OK,mx>.05?`타이틀이 원더룹을 최대 ${Math.round(mx*100)}% 가림${r?` (${f1(r.a)}~${f1(r.b)}초 30% 넘게)`:''} — 카메라를 비키거나 원더룹을 옮기기`:'겹치지 않음');}}
  // 6. 나레이션 뒤 3초 여운
  {const ns=cues.filter(c=>c.kind==='narration');if(!ns.length)add('나레이션 뒤 여운',NA,'나레이션 없음');
    else{const e=Math.max(...ns.map(endOf)),tail=seg.t1-e;add('나레이션 뒤 여운',tail>=3-1e-3?OK:FIX,tail>=0?`마지막 나레이션 뒤 ${f1(tail)}초`:`나레이션이 구간 끝을 ${f1(-tail)}초 넘김`);}}
  return R;}

/* ---------- 영상 인코딩 (WebCodecs → MP4, 소리 없음: 소리는 편집 때 시점 기록으로 놓는다) ----------
   H.264만 쓴다: High 5.1·5.0(2560×1440까지), 4.2·4.0(1080×1920), Main 5.1. VP9로 내려가지 않는다(애프터이펙트가 VP9 MP4를 못 읽는다) */
const CODECS=['avc1.640033','avc1.640032','avc1.64002a','avc1.640028','avc1.4d0033'];
/* 영상 조각: mp4-muxer StreamTarget이 넘기는 조각을 64MB씩 모아 녹화하는 동안 촬영 서버로 보낸다(&at=위치에 이어 쓰기) → 길이와 상관없이 메모리가 거의 늘지 않는다.
   촬영 서버가 없으면 조각을 메모리에 모아 끝에 Blob으로 내려받는다 — 앱 내장 브라우저에서 1.26GB Blob의 중간이 읽히지 않았으므로(2026-10-29) 500MB에서 멈춘다.
   (예전 ArrayBufferTarget은 버퍼를 두 배씩 키워서 1GB→2GB에서 'Array buffer allocation failed': 1440p로 4분 남짓이 한계였다)
   이미 보낸 앞쪽을 고쳐 쓰는 조각(mdat 길이)은 그 위치로 따로 보내고, 아직 안 보낸 조각이면 덮어쓴다 */
let server=true;
const PART=64<<20;
// 보낼 몸통은 Blob이 아니라 바이트 배열로: 앱 내장 브라우저는 보낸 Blob이 바로 풀리지 않아 약 550MB 쌓이면 다음 Blob이 읽히지 않았다(2026-10-29)
const join=parts=>{const u=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let o=0;for(const p of parts){u.set(p,o);o+=p.length;}return u;};
const saveUrl=(rel,q)=>'/save?path='+encodeURIComponent('../captures/'+rel)+(q||'');
const post=(rel,q,body)=>fetch(saveUrl(rel,q),{method:'POST',body}).then(r=>{if(!r.ok)throw new Error('촬영 서버에 저장하지 못했어요 ('+r.status+')');});
async function pieces(rel){const P=[];let end=0,sent=0,q=Promise.resolve(),busy=0,fail=null;
  let live=server&&await post(rel,'&at=0&new',new Blob([])).then(()=>true,()=>false);if(!live)server=false;
  const send=(at,parts)=>{busy++;q=q.then(()=>fail?null:post(rel,'&at='+at,join(parts))).catch(e=>{fail=fail||new Error(`녹화하는 동안 촬영 서버에 저장하지 못했어요(${e.message}). 촬영 서버가 켜져 있는지 확인하고 다시 녹화해 주세요.`);}).finally(()=>{busy--;});};
  return {live,
    onData(d,pos){if(pos>end)throw new Error('영상 조각 순서가 어긋났어요');
      if(pos<end){if(pos<sent){const n=Math.min(d.length,sent-pos);send(pos,[d.slice(0,n)]);}
        for(const p of P){const a=Math.max(pos,p.pos),b=Math.min(pos+d.length,p.pos+p.d.length);if(a<b)p.d.set(d.subarray(a-pos,b-pos),a-p.pos);}
        if(pos+d.length<=end)return;d=d.subarray(end-pos);pos=end;}
      P.push({pos,d});end=pos+d.length;
      if(live&&end-sent>=PART){send(sent,P.splice(0).map(p=>p.d));sent=end;}
      if(!live&&end>5e8)fail=fail||new Error('촬영 서버 없이 내려받기로는 500MB(1440p 약 1분 20초)까지만 녹화해요. python3 tools/shot-server.py로 띄워서 열어 주세요.');},
    async drain(){while(busy>2)await sleep(5);if(fail)throw fail;},     // 보내는 줄이 길면 녹화를 잠깐 기다린다
    async close(){if(live){if(P.length){send(sent,P.splice(0).map(p=>p.d));sent=end;}await q;if(fail)throw fail;return 'captures/'+rel;}
      const b=new Blob(P.map(p=>p.d),{type:'video/mp4'});P.length=0;return b;}};}
async function encoder(W,H,bitrate,rel){
  if(!window.VideoEncoder)throw new Error('이 브라우저는 영상 인코딩(WebCodecs)을 지원하지 않아요. 최신 Chrome에서 열어 주세요.');
  const {Muxer,StreamTarget}=await import(MUXER);let cfg=null;
  for(const codec of CODECS){const c={codec,width:W,height:H,bitrate,framerate:FPS};
    try{if((await VideoEncoder.isConfigSupported(c)).supported){cfg=c;break;}}catch(e){}}
  if(!cfg)throw new Error(`이 브라우저는 ${W}×${H} H.264 영상을 만들지 못해요 — 애프터이펙트용 파일을 만들 수 없어요. 최신 Chrome(맥)에서 열어 주세요.`);
  const out=await pieces(rel),muxer=new Muxer({target:new StreamTarget({onData:(d,pos)=>out.onData(d,pos)}),video:{codec:'avc',width:W,height:H,frameRate:FPS},fastStart:false});
  let err=null;const venc=new VideoEncoder({output:(c,m)=>muxer.addVideoChunk(c,m),error:e=>{err=e;}});venc.configure(cfg);
  return {codec:cfg.codec,live:out.live,
    async add(src,i){if(err)throw err;const vf=new VideoFrame(src,{timestamp:Math.round(i*1e6/FPS),duration:Math.round(1e6/FPS)});venc.encode(vf,{keyFrame:i%(FPS*2)===0});vf.close();
      while(venc.encodeQueueSize>6)await sleep(2);await out.drain();},
    /* 끝: 촬영 서버로 다 보냈으면 저장 위치(문자열), 아니면 내려받을 Blob */
    async finish(){await venc.flush();if(err)throw err;muxer.finalize();return out.close();}};}

/* ---------- 저장: 촬영 서버(captures/) → 없으면 내려받기 ---------- */
async function save(rel,blob){
  if(server)try{await post(rel,'',blob);return 'captures/'+rel;}catch(e){server=false;}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=rel.replace(/\//g,'_');document.body.appendChild(a);a.click();a.remove();return '내려받기: '+a.download;}
const json=o=>new Blob([JSON.stringify(o,null,1)],{type:'application/json'});

/* ---------- 패널 (영상에는 안 나온다) ---------- */
const panel=document.createElement('div');panel.id='wlCapture';
panel.innerHTML=`<style>#wlCapture{position:fixed;left:12px;top:12px;z-index:50;width:min(560px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;background:rgba(255,248,236,.97);color:#3e2834;
 border-radius:14px;padding:12px 14px;font:14px/1.5 "Apple SD Gothic Neo",sans-serif;box-shadow:0 10px 30px rgba(30,14,36,.3)}#wlCapture b{font-size:15px}
 #wlCapture button{all:unset;cursor:pointer;background:#3f9fa0;color:#fffaf2;border-radius:9px;padding:5px 11px;margin:6px 6px 0 0}#wlCapture button.sec{background:#b7a690}
 #wlCapture table{border-collapse:collapse;margin-top:8px;width:100%;font-size:12.5px}#wlCapture td,#wlCapture th{border-top:1px solid #e3d4bd;padding:3px 5px;text-align:left;vertical-align:top}
 #wlCapture .통과{color:#2f7d5b}#wlCapture .주의{color:#a9701c}#wlCapture .고칠{color:#c0392b;font-weight:700}#wlCapture code{background:#efe2c9;border-radius:4px;padding:0 4px;font-size:12px;word-break:break-all}</style>
 <b>원더룹 영상 캡처</b> <span id="wcName"></span><div id="wcWarn" style="color:#c0392b;font-weight:700"></div><div id="wcBtns"></div><div id="wcMsg"></div><div id="wcOut"></div>`;
document.body.appendChild(panel);
const $=s=>panel.querySelector(s),msg=t=>{$('#wcMsg').textContent=t;};

/* ---------- 녹화 한 번 (화면비 하나) ---------- */
let script=null,busy=false,stop=false;
async function take(aspect,opt={}){
  if(busy)return null;busy=true;stop=false;const [W,H]=ASPECTS[aspect];S.dt=DT;const png=opt.png??Q.has('png');
  try{
  const sc=script,base=`${sc.world}/${sc.script}-${aspect}`;
  if(sc.zone&&window.wlZone.cur.id!==sc.zone)await S.go(sc.zone);
  G.ui.setHints(false);                                   // 말풍선·걷기 표시 같은 안내 표시 숨김
  for(const k in (sc.flags||{}))G.state.setFlag(k,sc.flags[k]);
  if(sc.setup)S.setup(sc.setup);
  S.size(W,H);frame.width=W;frame.height=H;thumbC.width=aspect==='9x16'?18:32;thumbC.height=aspect==='9x16'?32:18;
  const enc=await encoder(W,H,BITRATE[aspect],base+'.mp4');await makeGrain(W,H);
  const t0=G.clock.t,n0=G.cues.length,vt=()=>+(G.clock.t-t0).toFixed(4);
  const auto={dialog:true,linePad:.6,card:null,result:0,resultHold:4};let cardT=null,resT=null;
  const ctx={aspect,samples:[],thumbs:[],cues:[],duration:0};const segs=[];let curSeg=null,curDef=null;overlays.length=0;await fontsReady();
  const c={G,S,WL,auto,get zone(){return window.wlZone.cur;},
    wait:s=>G.core.wait(s),until:(fn,max=60)=>G.core.until(fn,max),
    place:(x,z,ry)=>S.place(x,z,ry),
    async walk(x,z,o={}){S.setup({walk:[x,z]});await G.core.until(()=>!S.walking(),o.max||40);},
    go:(id,spawn)=>S.go(id,spawn),
    async talk(name){const n=G.dialog.findNPC(name);if(!n)throw new Error('대화 상대가 없어요: '+name);
      const p=n.root.getWorldPosition(new THREE.Vector3()),P=WL.position,d=Math.hypot(p.x-P.x,p.z-P.z);
      if(d>1.5){const k=(d-1.1)/d;await c.walk(P.x+(p.x-P.x)*k,P.z+(p.z-P.z)*k);}
      if(!G.dialog.startTalk(n))throw new Error('말을 걸 수 없어요: '+name);await G.core.until(()=>!G.dialog.talking(),120);},
    say:(who,text,sec,id)=>G.dialog.say(who,text,sec,id),
    narrate:l=>G.sound.narrate(typeof l==='string'?{text:l}:l),
    title:(text,o={})=>showTitle('title',text,o),ending:(text,o={})=>showTitle('ending',text,o),
    camera(v){if(v==='follow'||v==='room')S.setup({follow:v==='follow'});else S.view(v);},
    set:o=>S.setup(o),flag:(k,v)=>G.state.setFlag(k,v),
    async settle(sec=3){await G.core.until(()=>!G.sound.narrating()&&!G.dialog.talking()&&!G.ui.cardShown()&&!G.ui.cardsQueued()&&!G.events.eventBusy(),120);await G.core.wait(sec);}};
  // 타이틀·엔딩: 그려 넣을지는 호출 {burn} → 구간 burnTitles → 대본 burnTitles(기본 켜짐)
  async function showTitle(kind,text,o){const end=kind==='ending',sec=o.sec??(end?6:3.5);
    const burn=o.burn??(curDef&&curDef.burnTitles)??sc.burnTitles??true;
    const ob={kind,logo:text,ribbon:o.ribbon??(end?(sc.endingRibbon||'탐험가의 대모험'):(sc.titleRibbon||'원더룹')),sub:o.sub||'',sub2:o.sub2||'',deco:o.deco||sc.titleDeco||null};
    G.core.cue({kind:'title',text,who:end?'엔딩':'타이틀',sub:[ob.sub,ob.sub2].filter(Boolean).join(' / '),dur:sec,burned:!!burn});
    if(burn)overlays.push({o:ob,t0:G.clock.t,sec});
    await G.core.wait(sec);}
  function autoTick(){const t=G.clock.t,U=G.ui;
    if(auto.dialog&&G.dialog.talking()){const e=G.dialog.lineEnd();if(e!=null&&t>=e+auto.linePad)G.dialog.act();}
    const read=sel=>Math.max(3.5,[...document.querySelectorAll(sel)].map(e=>e.textContent).join('').replace(/\s+/g,'').length*.07+1.5); // 읽을 시간
    const kind=U.cardShown();if(kind==='notice'||kind==='secret'){if(cardT==null)cardT=t;
      const hold=auto.card??read(kind==='notice'?'#wlNotice .t,#wlNotice .s':'#wlSecret h2,#wlSecret .f');if(t-cardT>=hold)kind==='notice'?U.closeNotice():U.closeSecret();}
    else if(kind==='dex'||kind==='book'||kind==='ending'){if(cardT==null)cardT=t;const hold=auto.card??(kind==='ending'?6:read('#wlDex h2,#wlDex .fact'));if(t-cardT>=hold&&U.cardClosers[kind])U.cardClosers[kind]();}
    else cardT=null;
    if(U.resultShown()){if(resT==null)resT=t;if(auto.result!=null&&t-resT>=auto.resultHold)U.chooseResult(auto.result);}else resT=null;}
  let fi=0,pngQ=[];
  async function grab(){if(renderer.domElement.width!==W||renderer.domElement.height!==H)S.size(W,H);
    compose();const at=fi/FPS;
    if(fi%SMP===0)ctx.samples.push({t:at,...wlSample()});
    if(fi%THUMB===0)ctx.thumbs.push({t:at,g:thumb()});
    if(png){const b=await new Promise(r=>frame.toBlob(r,'image/png'));pngQ.push(save(`${base}-png/${String(fi).padStart(5,'0')}.png`,b));if(pngQ.length>8)await pngQ.shift();}
    await enc.add(frame,fi);fi++;}
  // 시작 화면 → 구간들을 차례로
  renderer.render(S.scene,S.camera);await grab();
  let done=false,err=null;const MAX=(sc.max||600)*FPS;
  (async()=>{for(const sg of sc.segments){curDef=sg;curSeg={name:sg.name,t0:vt(),noWL:!!sg.noWL};segs.push(curSeg);msg(`${sg.name} 녹화 중…`);await sg.run(c);curSeg.t1=vt();}})()
    .catch(e=>{err=e;}).finally(()=>{done=true;});
  await yieldTask();
  while(!done&&!stop&&fi<MAX){S.step(STEPS);await grab();autoTick();await yieldTask();
    if(fi%THUMB===0)msg(`${curSeg?curSeg.name:''} 녹화 중… ${(fi/FPS).toFixed(1)}초`);}
  if(curSeg&&curSeg.t1==null)curSeg.t1=vt();
  await Promise.all(pngQ);
  if(err)throw err;if(stop)throw new Error('멈췄어요');if(fi>=MAX)throw new Error(`대본이 ${sc.max||600}초 안에 끝나지 않았어요 ('${curSeg&&curSeg.name}' 구간)`);
  msg('영상 마무리 중…');
  ctx.duration=+(fi/FPS).toFixed(4);
  ctx.cues=G.cues.slice(n0).map(q=>{const o={...q,t:+(q.t-t0).toFixed(4)};if(o.file)o.file=String(o.file).split('?')[0];return o;});
  const check=segs.map(s=>({구간:s.name,시작:s.t0,끝:s.t1,항목:checkSegment(s,segs,ctx)}));
  const name=`${sc.script}-${aspect}`;
  const cueDoc={world:sc.world,script:sc.script,aspect,width:W,height:H,fps:FPS,duration:ctx.duration,video:name+'.mp4',codec:enc.codec,zone:window.wlZone.cur.id,version:window.WL_V,
    segments:segs.map(s=>({name:s.name,t:s.t0,dur:+(s.t1-s.t0).toFixed(4)})),cues:ctx.cues};
  const video=await enc.finish();
  const where=[typeof video==='string'?video:await save(base+'.mp4',video),await save(base+'.cues.json',json(cueDoc)),await save(base+'.check.json',json({world:sc.world,script:sc.script,aspect,duration:ctx.duration,check}))];
  return {aspect,where,check,cues:cueDoc,frames:fi};
  }finally{busy=false;S.dt=1/60;}}

function show(res){const rows=[];
  for(const s of res.check){rows.push(`<tr><th colspan="3">${s.구간} <small>(${s.시작.toFixed(1)}~${s.끝.toFixed(1)}초)</small></th></tr>`);
    for(const r of s.항목)rows.push(`<tr><td>${r.항목}</td><td class="${r.결과.split(' ')[0]}">${r.결과}</td><td>${r.내용}</td></tr>`);}
  const n=k=>res.check.reduce((a,s)=>a+s.항목.filter(r=>r.결과===k).length,0);
  $('#wcOut').insertAdjacentHTML('beforeend',`<p><b>${res.aspect.replace('x',':')}</b> ${res.cues.duration.toFixed(1)}초 · 고칠 것 ${n(FIX)} · 주의 ${n(WARN)}<br>${res.where.map(w=>`<code>${w}</code>`).join(' ')}</p><table>${rows.join('')}</table>`);
  console.table(res.check.flatMap(s=>s.항목.map(r=>({구간:s.구간,...r}))));}

async function start(){
  const src=Q.get('capture');
  if(!src){msg('주소에 &capture=대본.js 를 붙여 주세요 (견본: tools/capture/sample-indoor.js)');return;}
  try{script=(await import(new URL(src,location.origin+'/').href)).default;}catch(e){msg('대본을 못 읽었어요: '+e);console.error(e);return;}
  $('#wcName').textContent=`${script.world} · ${script.script} (구간 ${script.segments.length}개)`;
  // 촬영 서버 확인: 없으면(일반 http 서버로 열었으면) 녹화 전에 알린다 — 조용히 내려받기로 바뀌지 않게
  if(!await fetch(saveUrl('.server-check.json'),{method:'POST',body:'{}'}).then(r=>r.ok,()=>false)){server=false;
    $('#wcWarn').textContent='촬영 서버로 열지 않았어요. 이대로 녹화하면 captures/에 저장되지 않고 내려받기로 저장되며, 500MB(16:9 약 1분 20초)에서 멈춰요. 터미널에서 wonderloop-game 폴더로 가서 python3 tools/shot-server.py 를 켜고 http://localhost:8000 으로 다시 열어 주세요.';}
  const url=(aspect,then)=>{const q=new URLSearchParams(location.search);q.set('aspect',aspect);q.set('go','');if(then)q.set('then',then);else q.delete('then');return location.pathname+'?'+q.toString().replace(/=(&|$)/g,'$1');};
  const B=$('#wcBtns');[['16:9 녹화',()=>location.href=url('16x9')],['9:16 녹화',()=>location.href=url('9x16')],['둘 다 녹화',()=>location.href=url('16x9','9x16')]]
    .forEach(([t,f])=>{const b=document.createElement('button');b.textContent=t;b.onclick=f;B.appendChild(b);});
  {const b=document.createElement('button');b.className='sec';b.textContent='멈추기';b.onclick=()=>{stop=true;};B.appendChild(b);}
  window.wlCapture={script,take,ASPECTS,FPS,BITRATE,checkSegment};
  const aspect=Q.get('aspect');
  if(Q.has('go')&&ASPECTS[aspect]){
    try{const res=await take(aspect);window.wlCapture.result=res;show(res);
      const then=Q.get('then');
      if(then&&ASPECTS[then]){msg('다음 화면비를 새 페이지에서 찍어요…');await sleep(600);location.href=url(then);return;}
      const dir=`captures/${script.world}`;
      msg('');$('#wcOut').insertAdjacentHTML('beforeend',`<p>애프터이펙트 스크립트 만들기:<br><code>python3 tools/cues-to-ae.py ${dir}/${script.script}-16x9.cues.json ${dir}/${script.script}-9x16.cues.json</code></p>`);
    }catch(e){msg('녹화 실패: '+(e&&e.message||e));console.error(e);window.wlCapture.error=String(e&&e.stack||e);}}
  else msg('화면비를 고르면 새 페이지에서 처음부터 녹화해요. 녹화 중에는 이 탭을 그대로 두세요.');}
start();
