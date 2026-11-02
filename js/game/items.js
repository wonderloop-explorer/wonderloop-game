/* 원더룹 — 아이템: 세계를 마치면 받아 다음 세계에서 쓰는 물건. 받은 아이템은 배낭에 키링으로 나란히 달려 계속 보인다(06·07).
   받았는지는 진행 상태 flags[id](state.js, localStorage 'wl-state')에 남는다 → 세계를 넘어도 그대로.
   새 세계는 구역 정보 start:{compass:true}처럼 "이미 받은 상태"로 시작할 수 있다.
   새 아이템: 아래 ITEMS에 한 줄 + 세계 코드에서 키링 모양 WL.userData.addCharm({flag:id, obj})(06, 뼈 이름 charm_<id>) + state.js 기본값.
   give(id): 받기 — flags를 켜고(키링이 나타남) 시점 기록에 kind 'item'으로 남긴다. 획득 카드는 세계 쪽에서 ui.notice로 띄운다(카드 그림은 세계 자산).
   glide:true인 아이템(민들레 솜털 우산)을 가지고 있으면 어느 구역에서든 떨어질 때 활공한다(07 — 구역 정보 glide가 true면 늘, false면 안 함, 없으면 이 아이템으로).
   펼쳐 드는 모양은 세계 쪽이 WL.userData.setGlideProp으로(없으면 몸짓만). */
import {cue} from './core.js';
import {flags,setFlag} from './state.js';
const ITEMS={
  compass:{name:'더듬이 나침반',world:'antvillage',use:'길 찾기 — 힌트·보물이 있는 쪽을 가리킨다'},
  umbrella:{name:'민들레 솜털 우산',world:'fairy-forest',use:'뛰어내리거나 떨어질 때 펼쳐 천천히 내려옴',glide:true}, // 요정의 숲 STAGE 01 사공에게 받음, STAGE 02 민들레 공중정원 경주에서 씀
};
const has=id=>!!flags[id];
function give(id){if(!ITEMS[id]){console.warn('원더룹: 없는 아이템',id);return false;}if(has(id))return false;setFlag(id,true);cue({kind:'item',id,text:ITEMS[id].name});return true;}
const owned=()=>Object.keys(ITEMS).filter(has);
const canGlide=()=>owned().some(id=>ITEMS[id].glide);
export {ITEMS,canGlide,give,has,owned};
