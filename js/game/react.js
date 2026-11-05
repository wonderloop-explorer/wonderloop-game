/* 원더룹 — 리액션 모음 (2026-11-05, 공통 틀 7단계 — 규칙은 docs/series-rules.md '이야기 장치' 끝 "감정은 몸과 얼굴로")
   세계 어디서든 이름으로: react('shiver') · react('shake',{sec,amp}) · react('joy') … → Promise(끝나면). 같은 몸 리액션을 또 부르면 새것으로 바뀐다(화면 흔들림은 따로 겹침).
   개미굴 원본(antvillage)에서 그대로 옮긴 셋 — 값은 원본 숫자 그대로:
     shiver  후덜덜(원본 react('fear') — 경비개미 "거기 누구냐"): 고개를 초당 42 라디안 빠르기로 ±0.035 떨고(탈은 머리에 붙어 함께 떨림), 눈이 조금 작아지고 눈썹 안쪽이 올라감(04 표정 '걱정' = 원본 눈 0.9·0.92배),
             카메라 시야가 0.9초 동안 5° 좁아졌다 돌아옴(원본 evtPunch). 2.2초, 소리 event-tremble
     shake   화면 흔들림(원본 shakeT·shakeA — 카메라 자리에 무작위 흔들림, 끝 1/3초에 걸쳐 잦아듦). {sec, amp} 또는 preset:
             'bump' 0.55·0.4 공벌레·수레 충돌(기본) · 'collapse' 0.6·0.45 씨앗더미 무너짐 · 'caught' 0.4·0.25 잡힘·쫓겨남 · 'warn' 0.35·0.12 수레 경고 · 'rumble' 0.8·0.08 데구르르 소리
             소리 bump·collapse = event-clunk, rumble = event-roll(sound:null이면 없음). 휴대폰 진동도 원본 무늬 그대로(되는 기기만)
     joy     기쁨(원본 react('joy') + 꿀방울 들어 보이기): 서 있으면 카메라 쪽으로 돌아서서(원본 hold — 초당 8) 눈웃음·벌린 입(04 '기쁨' = 원본 happy 눈·입),
             몸통이 초당 9 빠르기로 0.07 통통, 시야 5° 좁아짐. 1.8초, 소리 event-sparkle
   새로 만든 넷 (원본에 없음):
     startle 깜짝 놀람: 0.12초 움찔(몸통이 내려앉고 팔이 붙음) → 0.25m 짧게 뜀(팔 벌림), 눈 커지고 '오' 입(04 '놀람' = 원본 surprise), 고개 뒤로 0.13(원본 surprise), 시야 5°. 1초, 소리 event-pop
     tilt    갸웃: 고개를 옆으로 0.32·살짝 돌려 0.12(천천히 기울였다 돌아옴), 04 '궁금'. 1.6초, 소리 talk-bubble
     hop     기뻐서 폴짝: 두 팔을 번쩍 들고 0.28m 두 번 폴짝(한 번 0.45초, 내려앉을 때 살짝 찌그러짐), 04 '신남'. 1.1초, 뛸 때마다 jump
     sigh    안도의 한숨: 0.5초 숨을 들이쉬며 어깨·고개가 살짝 올라갔다가 → 1.5초 내쉬며 어깨가 내려앉고(팔이 몸 쪽으로, 몸통 0.045 내려감) 고개가 앞으로 툭, 04 '기쁨'(눈 감은 웃음). 2초, 소리 event-whoosh(작게)
   공통: 원더룹이 걷거나 대쉬하면 몸 리액션의 자세는 그대로 겹쳐질 뿐 이동을 막지 않는다(갇히지 않게). 표정은 끝나면 리액션 전 표정으로(그동안 다른 코드가 표정을 바꿨으면 그대로 둠).
   옵션: {sec, sound(null이면 소리 없음), face:false(joy가 카메라로 돌지 않게), bounce:false(joy 몸통 통통 없이), punch:false(시야 좁힘 끔)}.
   그리기: 07 updateWL 뒤(game updateGame — tickReact)에 뼈(neck·spine·팔)와 원더룹 높이에 더하기만 한다 — 07이 매 프레임 다시 정하므로 끝나면 저절로 원래대로.
   카메라 흔들림·시야는 08이 그리기 바로 앞뒤로 camPre/camPost(그린 뒤 되돌려 따라가기 카메라에 흔들림이 쌓이지 않게 — 원본도 카메라 자리를 매 프레임 새로 썼다).
   촬영 모드에서도 같은 그림이 나오게 흔들림 난수는 시드 고정. 시험: 톱니 메뉴 '리액션: …' 단추(game/devcheck). */
import {cue} from './core.js';
import {sfx} from './sound.js';
let C=null,cur=null,shk=null,punch=0,T=0,seed=12345,camSave=null;
const rnd=()=>((seed=(seed*1103515245+12345)&0x7fffffff)/0x7fffffff); // 흔들림 난수(시드 고정 — 촬영 모드에서도 같게)
const SHAKE={bump:[.55,.4,'event-clunk',[90,40,160]],collapse:[.6,.45,'event-clunk',[80,30,120,30,80]],caught:[.4,.25,null,240],warn:[.35,.12,null,null],rumble:[.8,.08,'event-roll',[30,30,30,30,30]]};
const DEF={shiver:{sec:2.2,expr:'걱정',sound:'event-tremble',punch:true},joy:{sec:1.8,expr:'기쁨',sound:'event-sparkle',punch:true},
  startle:{sec:1,expr:'놀람',sound:'event-pop',punch:true},tilt:{sec:1.6,expr:'궁금',sound:'talk-bubble'},hop:{sec:1.1,expr:'신남',sound:'jump'},sigh:{sec:2,expr:'기쁨',sound:'event-whoosh',gain:.45}};
const NAMES={shiver:'후덜덜',shake:'화면 흔들림',joy:'기쁨',startle:'깜짝 놀람',tilt:'갸웃',hop:'기뻐서 폴짝',sigh:'안도의 한숨'};
function initReact(c){C=c;}
const vib=p=>{try{if(p&&navigator.vibrate&&!window.wlShot)navigator.vibrate(p);}catch(e){}};
function endBody(ok){if(!cur)return;const U=C.WL.userData;if(cur.expr&&U.exprName===cur.expr&&U.setExpr)U.setExpr(cur.prev||'기본');const r=cur.res;cur=null;r(ok);}
function react(name,o={}){if(!C)return Promise.resolve(false);
  if(name==='shake'){const P=SHAKE[o.preset||'bump']||SHAKE.bump,sec=o.sec??P[0],amp=o.amp??P[1],snd=o.sound===undefined?P[2]:o.sound;
    shk={t:sec,amp};if(snd)sfx(snd);vib(o.vib===undefined?P[3]:o.vib);cue({kind:'react',id:'shake',who:NAMES.shake,text:'',dur:sec});return new Promise(r=>setTimeout(()=>r(true),sec*1000));}
  const D=DEF[name];if(!D){console.warn('원더룹: 모르는 리액션 '+name);return Promise.resolve(false);}
  endBody(false);const U=C.WL.userData,sec=o.sec??D.sec,snd=o.sound===undefined?D.sound:o.sound;
  if(snd)sfx(snd,D.gain?{gain:D.gain}:{});if((o.punch??D.punch))punch=.9;
  const prev=U.exprName;if(U.setExpr&&D.expr)U.setExpr(D.expr);
  cue({kind:'react',id:name,who:NAMES[name],text:'',dur:sec});
  return new Promise(res=>{cur={name,t:0,sec,expr:D.expr,prev,res,face:o.face!==false,bounce:o.bounce!==false,hops:0};});}
const ease=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
function tickReact(dt){T+=dt;if(shk){shk.t-=dt;if(shk.t<=0)shk=null;}
  if(!cur)return;const R=cur,{WL}=C,{neck,spine,arms}=C.rig,U=WL.userData;R.t+=dt;const t=R.t,s=R.sec;
  if(t>=s){endBody(true);return;}
  const env=Math.min(1,t/.15,(s-t)/.25); // 새 리액션은 부드럽게 들어가고 나옴
  switch(R.name){
    case 'shiver':neck.rotation.z+=Math.sin(T*42)*.035;break; // 원본 그대로(들어가고 나옴 없이)
    case 'joy':{if(R.bounce)spine.position.y+=Math.abs(Math.sin(T*9))*.07; // 원본 그대로(bounce:false = 꿀방울 들어 보일 때처럼 웃기만)
      if(R.face&&!(U.walkAmt>0)){const cp=C.camera.position,a=Math.atan2(cp.x-WL.position.x,cp.z-WL.position.z);let d=a-WL.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));WL.rotation.y+=d*Math.min(1,dt*8);}break;}
    case 'startle':{if(t<.12){const k=Math.sin(t/.12*Math.PI*.5);spine.position.y-=.05*k;arms[0].rotation.z+=.2*k;arms[1].rotation.z-=.2*k;neck.rotation.x-=.13*k;}
      else{const u=Math.min(1,(t-.12)/.38),j=Math.sin(u*Math.PI);WL.position.y+=.25*j;arms[0].rotation.z-=.7*j;arms[1].rotation.z+=.7*j;neck.rotation.x-=.13*env;
        if(u>=1&&t<.62){const q=1-(t-.5)/.12;spine.position.y-=.03*Math.max(0,q);}}
      break;}
    case 'tilt':{const k=ease(Math.min(1,t/.35))*ease(Math.min(1,(s-t)/.4));neck.rotation.z+=.32*k;neck.rotation.y+=.12*k;break;}
    case 'hop':{const H=.45,i=Math.floor(t/H),u=(t-i*H)/H;if(i<2){if(i>=R.hops){R.hops=i+1;if(i>0)sfx('jump');}const j=Math.sin(u*Math.PI);WL.position.y+=.28*j;
        if(u>.85||u<.08)spine.position.y-=.03;}
      const a=env*2;arms[0].rotation.z-=a;arms[1].rotation.z+=a;break;}
    case 'sigh':{let up=0,dn=0;if(t<.5)up=ease(t/.5);else{up=1-ease((t-.5)/.35);dn=ease(Math.min(1,(t-.5)/.6))*ease(Math.min(1,(s-t)/.45));}
      spine.position.y+=.025*up-.045*dn;neck.rotation.x+=-.1*up+.18*dn;arms[0].rotation.z+=-.12*up+.24*dn;arms[1].rotation.z-=-.12*up+.24*dn;break;}
  }}
/* 08: 그리기 바로 앞(camPre)·뒤(camPost) — 흔들림·시야를 그 한 장에만 */
function camPre(camera,dt){let on=false;
  if(punch>0){punch-=dt;const k=Math.sin(Math.min(1,Math.max(0,punch)/.9)*Math.PI);camSave=camSave||{};camSave.fov=camera.fov;camera.fov=camera.fov-5*k;camera.updateProjectionMatrix();on=true;}
  if(shk){const k=shk.amp*Math.min(1,shk.t*3);camSave=camSave||{};camSave.p=camera.position.clone();camera.position.x+=(rnd()-.5)*k;camera.position.y+=(rnd()-.5)*k;on=true;}
  return on;}
function camPost(camera){if(!camSave)return;if(camSave.fov!=null){camera.fov=camSave.fov;camera.updateProjectionMatrix();}if(camSave.p)camera.position.copy(camSave.p);camSave=null;}
function clearReact(){if(cur)endBody(false);shk=null;punch=0;}
const reactNames=()=>['shiver','shake','joy','startle','tilt','hop','sigh'].map(id=>({id,name:NAMES[id]}));
export {camPost,camPre,clearReact,initReact,react,reactNames,tickReact};
