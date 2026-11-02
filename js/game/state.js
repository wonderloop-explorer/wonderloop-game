/* 원더룹 — 진행 상태 (세계를 넘어도 이어지는 이야기 표시)
   flags.compass: 여왕개미에게 더듬이 나침반을 받았는지 → 받은 뒤에만 배낭 키링이 보인다(07).
   다른 아이템도 flags[id]로 받았는지를 남긴다 → 나침반 옆 키링(06 addCharm, 07). 아이템 목록은 items.js.
   구역은 start:{compass:true}처럼 "처음 들어올 때 이미 그런 상태"를 적는다(02 loadZone이 적용). 산타 마을은 받은 상태로 시작.
   저장: localStorage 'wl-state'. 촬영 모드(?shot)에서는 저장된 값을 읽지도 쓰지도 않는다(매번 같은 그림). */
const KEY='wl-state',SHOT=new URLSearchParams(location.search).has('shot');
let saved={};if(!SHOT)try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){}
const flags=Object.assign({compass:false,umbrella:false},saved.flags);
const listeners=new Set();
function save(){if(SHOT)return;try{localStorage.setItem(KEY,JSON.stringify({flags}));}catch(e){}}
function setFlag(k,v=true){if(flags[k]===v)return;flags[k]=v;save();listeners.forEach(f=>{try{f(k,v);}catch(e){console.error(e);}});}
function onFlag(f){listeners.add(f);return()=>listeners.delete(f);}
function applyStart(start){if(start)for(const k in start)setFlag(k,start[k]);}
/* 진행 초기화(톱니 메뉴 '진행 초기화'): 저장된 진행·도감을 지운다 — 08이 지운 뒤 페이지를 다시 연다 */
function resetProgress(){try{localStorage.removeItem(KEY);localStorage.removeItem('wl-codex');}catch(e){}}
export {applyStart,flags,onFlag,resetProgress,setFlag};
