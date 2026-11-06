/* 원더룹 — 스테이지 분위기 공통 (2026-11-06, 공통 틀 8단계 — 규칙은 docs/series-rules.md '긴장 구간'·'감정 구역'·'스테이지 빛 색')
   세계 설정 stages[구역 id] 또는 구역 정보에 같은 이름으로 채운다(둘 다 있으면 구역 정보가 먼저):
   ① tension: [{c:[x,z], r, k}] 긴장 구역 — 원더룹이 그 안에 있는 동안만 카메라가 손에 들고 찍은 것처럼 살짝 떨린다(개미굴 보육실: 보모개미가 깨어날수록
      카메라가 sin(31t)·sin(43t+1) × 세기 × 0.05 떨렸다 — game/react setSway가 그리기 한 장에만). k = 세기(기본 .35, 0~1). 가장자리 1m에 걸쳐 들어가고 나옴.
      game/stealth 알아차림이 오르면 그만큼 더 떨린다(원본 보육실처럼 — 들킬 뻔할수록). 밖에서는 차분하게(평소 따라가기 카메라 그대로).
   ② emotion: [{c:[x,z], r, react:'shiver', pale, closeup, closeSec, say, once:true, gap:6}] 감정 구역 — 들어가는 순간 단추 없이 저절로 리액션(game/react).
      once면 그 구역에 있는 동안 한 번(다시 들어와도 안 함), 아니면 gap초가 지나야 또. say면 혼잣말 한 줄(game/dialog say). 예: 큰 존재 근처 → shiver + pale + closeup, 멋진 풍경 → awe.
   ③ light: {hemi, ground, k, level, fill, sun, fog} 스테이지 빛 색 — 이 스테이지의 기본 빛. 08이 날씨·시간대를 먼저 계산한 뒤 하늘빛(hemi) 색을 k(기본 .8)만큼 이 색으로,
      바닥빛(ground)·안개(fog)도 같은 만큼 물들이고 세기에 level(기본 1)을, 햇빛에 sun(기본 0.25 — 원본 굴 스테이지는 해가 없었다, 야외 스테이지는 1)을 곱한다 → 스테이지 빛 색이 바탕, 날씨(밤·비가 어둡게·푸르게 한 것)는 그 위에 살짝 남는다.
      screen: [색, 진하기] — 화면 전체에 아주 옅게 곱하는 색(3D 빛만으로는 방 소품 색·등불 빛에 묻혀 '다른 곳'처럼 안 보여서. DOM이라 영상 캡처에는 안 들어간다). 0.4초에 걸쳐 바뀜.
      원본 값: 꿀 저장소 #ffd29a/#5a3020·0.55 · 보육실 #ffd6e4/#4a3350·0.55 · 지네 동굴 #a8b8ff/#2a2040·0.5(세기는 원본 hemi 세기 ÷ 우리 낮 0.62).
   08이 구역에 들어올 때 setStageZone(Z, 세계 설정), 매 프레임 tickStage(dt) · stageLight(). 시험: 톱니 메뉴 '긴장 구역 시험'·'감정 구역 시험'·'스테이지 빛'(game/devstory). */
import {setSway} from './react.js';
import {react} from './react.js';
import {say} from './dialog.js';
import {alertLevel} from './stealth.js';
let C=null,Z=null,S={tension:[],emotion:[],light:null},inside=new Map(),T=0,testLight=null;
function initStage(c){C=c;}
function setStageZone(z,W){Z=z;const w=(W&&W.stages&&z&&W.stages[z.id])||{};
  S={tension:[...(z&&z.tension||w.tension||[])],emotion:[...(z&&z.emotion||w.emotion||[])],light:(z&&z.stageLight)||w.light||null};inside=new Map();}
/* 시험용: 지금 구역에 더하거나 빼기 (game/devstory) */
function addTension(t){S.tension.push(t);return ()=>{S.tension=S.tension.filter(x=>x!==t);};}
function addEmotion(e){S.emotion.push(e);return ()=>{S.emotion=S.emotion.filter(x=>x!==e);inside.delete(e);};}
function setTestLight(L){testLight=L;}
const stageLight=()=>testLight||S.light;
function tensionAt(x,z){let k=0;for(const t of S.tension){const d=Math.hypot(x-t.c[0],z-t.c[1]),e=Math.min(1,Math.max(0,(t.r-d)/1+.0));if(e>0)k=Math.max(k,(t.k??.35)*Math.min(1,e));}return k;}
let scr=null,scrK='';
function screenTint(){const L=stageLight(),v=L&&L.screen,key=v?v.join():'';if(key===scrK)return;scrK=key;
  if(!scr){scr=document.createElement('div');scr.id='wlStageTint';scr.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;mix-blend-mode:multiply;transition:opacity .4s,background-color .4s;opacity:0';document.body.appendChild(scr);}
  if(v){scr.style.backgroundColor=v[0];scr.style.opacity=v[1];}else scr.style.opacity=0;}
function tickStage(dt){if(!C)return;T+=dt;const P=C.WL.position;screenTint();
  const k=tensionAt(P.x,P.z);setSway(k>0?Math.min(1,k+alertLevel()*.6):0); // 긴장 구역 밖에서는 늘 0(차분하게)
  for(const e of S.emotion){const inn=Math.hypot(P.x-e.c[0],P.z-e.c[1])<e.r,st=inside.get(e)||{in:false,last:-1e9,done:false};
    if(inn&&!st.in&&!(e.once!==false&&st.done)&&T-st.last>(e.gap??6)){st.done=true;st.last=T;
      react(e.react||'shiver',{pale:e.pale,closeup:e.closeup,closeSec:e.closeSec,sec:e.sec});if(e.say)say(e.say.who||'원더룹',e.say.text||e.say);}
    st.in=inn;inside.set(e,st);}}
function clearStage(){S={tension:[],emotion:[],light:null};inside=new Map();setSway(0);testLight=null;screenTint();}
export {addEmotion,addTension,clearStage,initStage,setStageZone,setTestLight,stageLight,tensionAt,tickStage};
