/* 원더룹 — 아이템: 세계를 마치면 받아 다음 세계에서 쓰는 물건. 받은 아이템은 배낭에 키링으로 나란히 달려 계속 보인다(06·07).
   받았는지는 진행 상태 flags[id](state.js, localStorage 'wl-state')에 남는다 → 세계를 넘어도 그대로.
   새 세계는 구역 정보 start:{compass:true, lastLeaf:true}처럼 "이미 받은 상태"로 시작할 수 있다(산타 마을은 둘 다 받은 상태).
   새 아이템: 아래 ITEMS에 한 줄 + 06에 키링 모델(뼈 이름 charm_<id>) + state.js 기본값.
   give(id): 받기 — flags를 켜고(키링이 나타남) 시점 기록에 kind 'item'으로 남긴다. 획득 카드는 세계 쪽에서 ui.notice로 띄운다(카드 그림은 세계 자산). */
import {cue} from './core.js';
import {flags,setFlag} from './state.js';
const ITEMS={
  compass:{name:'더듬이 나침반',world:'antvillage',use:'길 찾기 — 힌트·보물이 있는 쪽을 가리킨다'},
  lastLeaf:{name:'마지막 단풍잎',world:'fairy-forest',use:'높이와 바람 — 높은 곳에서 펼치면 천천히 내려오고, 바람을 막는다(참나무 잎 모양)'},
};
const has=id=>!!flags[id];
function give(id){if(!ITEMS[id]){console.warn('원더룹: 없는 아이템',id);return false;}if(has(id))return false;setFlag(id,true);cue({kind:'item',id,text:ITEMS[id].name});return true;}
const owned=()=>Object.keys(ITEMS).filter(has);
export {ITEMS,give,has,owned};
