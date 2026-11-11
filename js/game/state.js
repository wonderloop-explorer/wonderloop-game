/* 원더룹 — 진행 상태 (세계를 넘어도 이어지는 이야기 표시)
   flags.compass: 여왕개미에게 더듬이 나침반을 받았는지 → 받은 뒤에만 배낭 키링이 보인다(07).
   다른 아이템도 flags[id]로 받았는지를 남긴다 → 나침반 옆 키링(06 addCharm, 07). 아이템 목록은 items.js.
   구역은 start:{compass:true}처럼 "처음 들어올 때 이미 그런 상태"를 적는다(02 loadZone이 적용). 산타 마을은 받은 상태로 시작.
   완료 후 상태(2026-11-11 — docs/series-rules.md '끝낸 뒤의 모습'): 스테이지를 끝낸 뒤 다시 열거나 다시 와도 이야기와 맞는 모습이 남게, 구역마다 한 덩어리를 저장한다.
     saveAfter(구역 id, {time: 하늘 시간(0 낮·1 해 질 녘·2 밤), who:{주민 id:[x,z,바라보는 각]}, …구역이 더 넣고 싶은 값}) — 끝나는 순간 구역이 부른다.
     afterOf(구역 id) → 그 덩어리 또는 null — 구역이 만들 때 읽어 주민을 그 자리에 세우고, 구역 정보 after:()=>afterOf(id)로 내주면 game/weather가 그날 날씨 대신 그 시간으로 연다.
     '처음부터 하기'·진행 초기화 때 함께 지워진다.
   저장: localStorage 'wl-state'. 촬영 모드(?shot)에서는 저장된 값을 읽지도 쓰지도 않는다(매번 같은 그림). */
const KEY='wl-state',SHOT=new URLSearchParams(location.search).has('shot');
let saved={};if(!SHOT)try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){}
const flags=Object.assign({compass:false,umbrella:false},saved.flags);
const order=Array.isArray(saved.order)?saved.order:[]; // 켜진 순서(탐험 가방이 얻은 순서대로 늘어놓는다, 2026-11-04)
const afters=saved.after&&typeof saved.after==='object'?saved.after:{}; // 구역 id → 완료 후 상태
const listeners=new Set();
function save(){if(SHOT)return;try{localStorage.setItem(KEY,JSON.stringify({flags,order,after:afters}));}catch(e){}}
function setFlag(k,v=true){if(flags[k]===v)return;flags[k]=v;if(v===true&&!order.includes(k))order.push(k);save();listeners.forEach(f=>{try{f(k,v);}catch(e){console.error(e);}});}
function onFlag(f){listeners.add(f);return()=>listeners.delete(f);}
function applyStart(start){if(start)for(const k in start)setFlag(k,start[k]);}
/* 진행 초기화(톱니 메뉴 '진행 초기화'): 저장된 진행·도감을 지운다 — 08이 지운 뒤 페이지를 다시 연다 */
function resetProgress(){try{localStorage.removeItem(KEY);localStorage.removeItem('wl-codex');localStorage.removeItem('wl-pics');}catch(e){}}
/* 첫 화면 '처음부터'(game/front): 저장도 지우고 지금 값도 처음으로 — 페이지를 다시 열지 않고 첫 구역을 다시 만든다 */
function resetAll(){resetProgress();for(const k of Object.keys(flags))delete flags[k];order.length=0;for(const k of Object.keys(afters))delete afters[k];Object.assign(flags,{compass:false,umbrella:false});}
function saveAfter(id,o){afters[id]=o;save();}
const afterOf=id=>afters[id]||null;
const gotAt=k=>{const i=order.indexOf(k);return i<0?1e9:i;}; // 얻은 순서(없으면 맨 뒤)
export {afterOf,saveAfter,applyStart,flags,gotAt,onFlag,resetAll,resetProgress,setFlag};
