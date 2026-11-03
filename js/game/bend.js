/* 원더룹 — 둥근 땅 (동물의 숲처럼, 2026-11-03)
   그릴 때만 카메라에서 수평으로 멀수록 아래로 내린다: 아래로 = k × max(0, 거리 − d0)²  (거리는 카메라 기준 x·z).
   평평한 땅이 둥근 섬처럼 넘어가 보이고, 먼 곳은 지평선 아래로 숨는다. 실제 위치·충돌·이동·판정·카메라 당김은 평평한 그대로(그림만 바뀜).
   어떻게: three 셰이더 조각을 한 번 고친다 — project_vertex(화면 위치)·worldpos_vertex(그림자 좌표·빛)·스프라이트 꼭짓점.
     → 기본 재질(Standard·Toon·Basic·Lambert·Points·Sprite), 합친 덩어리, 인스턴싱, 뼈대(Skinned), 그림자 깊이 그리기까지 모두 같은 만큼 휜다.
     uniform wlBend(vec4: x = k, y·z = 카메라 x·z, w = d0) 하나를 모든 재질이 같이 쓴다(Material.onBeforeCompile에 끼워 넣음 — 구역 코드가 재질에 붙이는 onBeforeCompile은 그대로 불린다).
     k가 0이면 셰이더가 예전 계산을 그대로 탄다(베이스캠프·실내·기준 촬영 화면 그대로).
   직접 쓴 셰이더(ShaderMaterial)는 #include <common> 뒤 정점 위치에 wlBent(modelMatrix*…)를 써야 한다(crown.js 별가루 견본). 휘면 안 되는 것(하늘 지붕·별)은 material.userData.noBend=true.
   매 프레임 자바스크립트 일은 08이 setBend(카메라 x·z)로 uniform 값 셋만 바꾸는 것뿐. 세기는 구역 정보 bend:{k,d0}(없으면 끔) × 톱니 메뉴 단계(끔·약·중·강). */
import * as THREE from 'three';
const BEND = { value: new THREE.Vector4(0, 0, 0, 8) }, NONE = { value: new THREE.Vector4(0, 0, 0, 8) };
const C = THREE.ShaderChunk;
if (!C.common.includes('wlBend')) {
  C.common += `
uniform vec4 wlBend; // 둥근 땅(game/bend.js): x 세기 k, yz 카메라 x·z, w 평평하게 둘 거리 d0
vec4 wlBent( vec4 w ) { vec2 d = w.xz - wlBend.yz; float r = max( 0.0, length( d ) - wlBend.w ); w.y -= wlBend.x * r * r; return w; }`;
  const pv = 'mvPosition = modelViewMatrix * mvPosition;';
  if (!C.project_vertex.includes(pv)) console.warn('원더룹: 둥근 땅 패치 실패(project_vertex)');
  C.project_vertex = C.project_vertex.replace(pv, 'if ( wlBend.x > 0.0 ) mvPosition = viewMatrix * wlBent( modelMatrix * mvPosition ); else mvPosition = modelViewMatrix * mvPosition;');
  const wp = 'worldPosition = modelMatrix * worldPosition;';
  if (!C.worldpos_vertex.includes(wp)) console.warn('원더룹: 둥근 땅 패치 실패(worldpos_vertex)');
  C.worldpos_vertex = C.worldpos_vertex.replace(wp, wp + '\n\tif ( wlBend.x > 0.0 ) worldPosition = wlBent( worldPosition );');
  const sp = 'vec4 mvPosition = modelViewMatrix[ 3 ];', S = THREE.ShaderLib.sprite;
  if (!S.vertexShader.includes(sp)) console.warn('원더룹: 둥근 땅 패치 실패(sprite)');
  S.vertexShader = S.vertexShader.replace(sp, 'vec4 mvPosition = wlBend.x > 0.0 ? viewMatrix * wlBent( modelMatrix[ 3 ] ) : modelViewMatrix[ 3 ];');
}
// 모든 재질에 uniform 끼워 넣기: onBeforeCompile을 바꿔 단 재질도 그 함수 뒤에 wlBend가 붙는다
{ const P = THREE.Material.prototype, add = (m, sh) => { sh.uniforms.wlBend = m.userData && m.userData.noBend ? NONE : BEND; };
  if (!Object.getOwnPropertyDescriptor(P, 'onBeforeCompile') || !P.__wlBend) {
    P.__wlBend = true;
    Object.defineProperty(P, 'onBeforeCompile', { configurable: true,
      get() { const m = this; return this.__wlObc || (this.__wlObc = function (sh, r) { add(m, sh); }); }, // this 대신 m(앞 함수를 this 없이 부르는 곳이 있다 — 07)
      set(f) { const m = this; this.__wlUser = typeof f === 'function' ? f : null; this.__wlObc = this.__wlUser ? function (sh, r) { f.call(this, sh, r); add(m, sh); } : null; } });
    // three의 기본 프로그램 열쇠는 onBeforeCompile.toString()이다 — 감싼 함수는 모두 같은 글이라, 원래 함수의 글로(다른 셰이더 패치끼리 프로그램을 같이 쓰지 않게)
    const key0 = P.customProgramCacheKey;
    P.customProgramCacheKey = function () { return this.__wlUser ? this.__wlUser.toString() : key0.call({ onBeforeCompile: () => {} }); };
  } }
/* 단계: 0 끔 · 1 약 · 2 중 · 3 강 — 구역 정보 bend:{k,d0}의 k가 '중', 약은 ×0.5, 강은 ×2 */
const LEVELS = ['끔', '약', '중', '강'], MUL = [0, .5, 1, 2];
let zoneBend = null, level = 2, paused = 0;
try { const v = localStorage.getItem('wl-bend'); if (v != null && v !== '') level = Math.max(0, Math.min(3, +v)); } catch (e) {}
function setZoneBend(b) { zoneBend = b && b.k > 0 ? { k: b.k, d0: b.d0 ?? 8 } : null; }
function setLevel(l) { level = l; try { localStorage.setItem('wl-bend', String(l)); } catch (e) {} }
const bendK = () => (zoneBend && !paused ? zoneBend.k * MUL[level] : 0);
/* 08이 그리기 직전에(카메라가 움직인 뒤) */
function setBend(cam) { const v = BEND.value; v.x = bendK(); v.y = cam.position.x; v.z = cam.position.z; v.w = zoneBend ? zoneBend.d0 : 8; }
/* 잠깐 끄기(소개 카드 초상 찍기 등): const resume = bendPaused(); … resume(); */
function bendPaused() { paused++; const x = BEND.value.x; BEND.value.x = 0; return () => { paused--; BEND.value.x = paused ? 0 : x; }; }
/* 그림 위치 계산(자바스크립트 쪽 — 화면 위 안내를 3D 자리에 맞출 때): 평평한 자리 p를 휜 자리로 */
function bentY(x, z, y) { const v = BEND.value; if (!(v.x > 0)) return y; const r = Math.max(0, Math.hypot(x - v.y, z - v.z) - v.w); return y - v.x * r * r; }
const bendInfo = () => ({ on: !!zoneBend, level, label: LEVELS[level], k: bendK(), d0: zoneBend ? zoneBend.d0 : null });
export { BEND, LEVELS, bendInfo, bendK, bendPaused, bentY, setBend, setLevel, setZoneBend };
