/* 원더룹 — 공통 바탕: 게임 시간, 소리 시점 기록(cues), 화면을 막는 것(대화·카드·결과), 게임 시간 기다리기
   게임 시간(clock.t)은 08 루프의 dt를 더한 값이라 촬영 모드에서는 1/60초씩(영상 캡처 중에는 1/72초씩) 정확히 늘어난다 → 기록 시점이 영상 프레임과 맞는다. */
const clock={t:0};
/* 소리 시점 기록: {t 시작(초), dur 길이(초), kind 'narration'|'dialogue'|'sfx'|'music', id, file, text, who}
   영상 캡처 모드가 녹화 시작 때 비우고 끝날 때 cues.json으로 저장한다 → tools/cues-to-ae.py가 애프터이펙트 스크립트로 바꾼다 */
const cues=[];
function cue(c){const e=Object.assign({t:+clock.t.toFixed(4)},c);cues.push(e);return e;}
/* 화면을 막는 것: 열려 있으면 위협은 멈추고, 나레이션은 끊겼다가 닫히면 다시, 혼잣말·이벤트는 기다린다 */
const blockers=new Set();
const block=(k,on)=>{if(on)blockers.add(k);else blockers.delete(k);};
const blocking=()=>blockers.size>0;
/* 게임 시간 기다리기 (이벤트 안에서 await wait(1.5)) */
const waits=[];
const wait=s=>new Promise(r=>waits.push({at:clock.t+s,r}));
const until=(fn,max=600)=>new Promise(r=>waits.push({fn,at:clock.t+max,r}));
function tickCore(dt){clock.t+=dt;for(let i=waits.length-1;i>=0;i--){const w=waits[i];if(clock.t>=w.at||(w.fn&&w.fn())){waits.splice(i,1);w.r();}}}
export {block,blocking,clock,cue,cues,tickCore,until,wait};
