/* 원더룹 — 둥근 땅 (동물의 숲처럼, 2026-11-03)
   그릴 때만 카메라에서 수평으로 멀수록 아래로 내린다: 아래로 = k × max(0, 거리 − d0)²  (거리는 카메라 기준 x·z).
   평평한 땅이 둥근 섬처럼 넘어가 보이고, 먼 곳은 지평선 아래로 숨는다. 실제 위치·충돌·이동·판정·카메라 당김은 평평한 그대로(그림만 바뀜).
   어떻게: three 셰이더 조각을 한 번 고친다 — project_vertex(화면 위치)·worldpos_vertex(그림자 좌표·빛)·스프라이트 꼭짓점.
     → 기본 재질(Standard·Toon·Basic·Lambert·Points·Sprite), 합친 덩어리, 인스턴싱, 뼈대(Skinned), 그림자 깊이 그리기까지 모두 같은 만큼 휜다.
     uniform wlBend(vec4: x = k, y·z = 카메라 x·z, w = d0) 하나를 모든 재질이 같이 쓴다(Material.onBeforeCompile에 끼워 넣음 — 구역 코드가 재질에 붙이는 onBeforeCompile은 그대로 불린다).
     k가 0이면 셰이더가 예전 계산을 그대로 탄다(베이스캠프·실내·기준 촬영 화면 그대로).
   직접 쓴 셰이더(ShaderMaterial)는 #include <common> 뒤 정점 위치에 wlBent(modelMatrix*…)를 써야 한다(crown.js 별가루 견본). 휘면 안 되는 것(하늘 지붕·별)은 material.userData.noBend=true.
   매 프레임 자바스크립트 일은 08이 setBend(카메라 x·z)로 uniform 값 셋만 바꾸는 것뿐. 세기는 구역 정보 bend:{k,d0}(없으면 끔) × 톱니 메뉴 단계(끔·약·중·강).
   ── 작은 행성(2026-11-07, 무한 우주 STAGE 1): 구역 정보 bend:{sphere:R, wrap:L} ──
   판정은 여전히 평평한 땅(x·z)이고, 땅은 L(= 2πR) 간격으로 이어진다(08이 원더룹을 L만큼 옮겨 이어 붙임 — 한 방향으로 L을 걸으면 제자리).
   그릴 때만 원더룹 자리를 꼭대기로 하는 반지름 R 공 위로 감는다: 원더룹에서 평평한 거리 r(L 주기로 가장 가까운 쪽)·방향 → 공 중심에서 각도 r/R,
   높이 y는 공 표면에서 바깥으로. 원더룹 둘레는 거의 그대로, 멀수록 지평선 아래로 넘어가 공 모양 행성으로 보인다(카메라 위쪽 = 원더룹이 선 자리의 표면 방향).
   wlSph(vec4: x = R(0이면 끔), y·z = 원더룹 x·z, w = L). 둥근 땅 단계(끔·약·중·강)와 상관없이 늘 켜짐. 구역 물체는 평평한 자리로 화면 밖 판정을 하면 안 되므로 frustumCulled=false(구역 쪽 몫). */
import * as THREE from 'three';
const BEND = { value: new THREE.Vector4(0, 0, 0, 8) }, NONE = { value: new THREE.Vector4(0, 0, 0, 8) }, SPH = { value: new THREE.Vector4(0, 0, 0, 1) }, SNONE = { value: new THREE.Vector4(0, 0, 0, 1) };
const CHARFOG = { value: 1 }, FOG1 = { value: 1 };
const C = THREE.ShaderChunk;
/* 작은 행성 각도(2026-11-09 — 별똥별 꼬리 타기): 4m 위는 그 높이의 둘레로 각도를 잰다(th = r/(R+max(0,y−4))) — R로만 재면 높이 y의 물체가 (R+y)/R배 옆으로 넓어져
   하늘 높이의 원더룹·별똥별이 납작해졌다. 땅·4m 아래(바위 꼭대기·둥실 뛰기 포함)는 예전 그대로 */
if (!C.common.includes('wlBend')) {
  C.common += `
uniform vec4 wlBend; // 둥근 땅(game/bend.js): x 세기 k, yz 카메라 x·z, w 평평하게 둘 거리 d0
uniform vec4 wlSph; // 작은 행성(game/bend.js): x 반지름 R(0이면 끔), yz 원더룹 x·z, w 이어지는 간격 L
vec4 wlBent( vec4 w ) {
  if ( wlSph.x > 0.0 ) { vec2 d = mod( w.xz - wlSph.yz + 0.5 * wlSph.w, wlSph.w ) - 0.5 * wlSph.w; float r = length( d ), th = r / ( wlSph.x + max( 0.0, w.y - 4.0 ) ), rr = wlSph.x + w.y;
    vec2 dir = r > 1e-5 ? d / r : vec2( 0.0 ); w.xz = wlSph.yz + dir * rr * sin( th ); w.y = rr * cos( th ) - wlSph.x; return w; }
  vec2 d = w.xz - wlBend.yz; float r = max( 0.0, length( d ) - wlBend.w ); w.y -= wlBend.x * r * r; return w; }`;
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
/* 캐릭터 안개(2026-11-14 — 금성 안개 3~24m가 원더룹까지 덮어 반투명 유령처럼 보였다): 배경 안개는 그대로, 캐릭터 재질(userData.wlChar — markChar(root))만 안개 섞는 양에 CHARFOG를 곱함.
   구역 정보 charFog(0~1, 없으면 1 = 예전 그대로 — 기준 촬영 바이트 그대로). 다른 재질은 늘 1 */
{ const ff = 'gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );';
  if (!C.fog_fragment.includes(ff)) console.warn('원더룹: 캐릭터 안개 패치 실패(fog_fragment)');
  C.fog_fragment = C.fog_fragment.replace(ff, 'gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor * wlFogK );');
  C.fog_pars_fragment = C.fog_pars_fragment.replace('uniform vec3 fogColor;', 'uniform vec3 fogColor;\n\tuniform float wlFogK;'); }
/* sRGB 바꾸기(three colorspace_pars_fragment)의 쓰지 않는 갈래 pow(0, 0.41666)이 이 GPU 경로(ANGLE·Metal)에서 NaN — mix가 그 NaN을 그대로 남긴다(2026-11-08).
   캔버스(8비트)는 섞기 전에 0으로 잘려 안 보이지만 사진 모드 렌더 타깃(HalfFloat)에서는 NaN이 남아 더하기 섞기로 번져 까만 점이 됐다(회색 정원 집 둘레 빛 웅덩이 색 0인 곳).
   pow 입력만 아주 작은 양수로 — 그 범위(≤0.0031308)는 늘 다른 갈래(×12.92)를 쓰므로 그림 값은 그대로(기준 촬영 바이트 그대로) */
{ const o = 'pow( value.rgb, vec3( 0.41666 ) )';
  if (C.colorspace_pars_fragment.includes(o)) C.colorspace_pars_fragment = C.colorspace_pars_fragment.replace(o, 'pow( max( value.rgb, vec3( 1e-7 ) ), vec3( 0.41666 ) )');
  else if (!C.colorspace_pars_fragment.includes('1e-7')) console.warn('원더룹: sRGB NaN 패치 실패(colorspace_pars_fragment)'); }
// 모든 재질에 uniform 끼워 넣기: onBeforeCompile을 바꿔 단 재질도 그 함수 뒤에 wlBend가 붙는다
{ const P = THREE.Material.prototype, add = (m, sh) => { const no = m.userData && m.userData.noBend; sh.uniforms.wlBend = no ? NONE : BEND; sh.uniforms.wlSph = no ? SNONE : SPH; sh.uniforms.wlFogK = m.userData && m.userData.wlChar ? CHARFOG : FOG1; };
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
let sphere = null;
function setZoneBend(b) { zoneBend = b && b.k > 0 ? { k: b.k, d0: b.d0 ?? 8 } : null; sphere = b && b.sphere > 0 ? { R: b.sphere, L: b.wrap || 2 * Math.PI * b.sphere } : null; }
function setLevel(l) { level = l; try { localStorage.setItem('wl-bend', String(l)); } catch (e) {} }
const bendK = () => (zoneBend && !paused ? zoneBend.k * MUL[level] : 0);
/* 08이 그리기 직전에(카메라가 움직인 뒤) */
function setBend(cam, hero) { const v = BEND.value; v.x = bendK(); v.y = cam.position.x; v.z = cam.position.z; v.w = zoneBend ? zoneBend.d0 : 8;
  const s = SPH.value; if (sphere && !paused) { s.x = sphere.R; s.w = sphere.L; if (hero) { s.y = hero.x; s.z = hero.z; } if (!(v.x > 0)) v.x = 1e-6; } else s.x = 0; } // 행성이면 셰이더가 wlBent를 타도록 wlBend.x를 아주 작게
const sphereInfo = () => sphere;
/* 잠깐 끄기(소개 카드 초상 찍기 등): const resume = bendPaused(); … resume(); */
function bendPaused() { paused++; const x = BEND.value.x, sx = SPH.value.x; BEND.value.x = 0; SPH.value.x = 0; return () => { paused--; BEND.value.x = paused ? 0 : x; SPH.value.x = paused ? 0 : sx; }; }
/* 그림 위치 계산(자바스크립트 쪽 — 화면 위 안내를 3D 자리에 맞출 때): 평평한 자리 p를 휜 자리로 */
function bentPos(p) { const s = SPH.value; if (!(s.x > 0)) { p.y = bentY(p.x, p.z, p.y); return p; } const L = s.w, w = q => ((q % L) + 1.5 * L) % L - .5 * L;
  const dx = w(p.x - s.y), dz = w(p.z - s.z), r = Math.hypot(dx, dz), th = r / (s.x + Math.max(0, p.y - 4)), rr = s.x + p.y, k = r > 1e-5 ? rr * Math.sin(th) / r : 1;
  p.x = s.y + dx * k; p.z = s.z + dz * k; p.y = rr * Math.cos(th) - s.x; return p; }
function bentY(x, z, y) { const s = SPH.value; if (s.x > 0) return bentPos({ x, y, z }).y; const v = BEND.value; if (!(v.x > 0)) return y; const r = Math.max(0, Math.hypot(x - v.y, z - v.z) - v.w); return y - v.x * r * r; }
/* 캐릭터 표시: root 아래 메시 재질에 wlChar를 달고(처음이면 다시 컴파일 — 프로그램은 같은 열쇠라 캐시) — 08이 구역에 들어갈 때 원더룹을, 구역이 주민을 */
function markChar(root) { if (root) root.traverse(o => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) if (m && !(m.userData && m.userData.wlChar)) { m.userData.wlChar = true; m.needsUpdate = true; } }); }
function setCharFog(k) { CHARFOG.value = k == null ? 1 : k; }
const bendInfo = () => ({ on: !!zoneBend, level, label: LEVELS[level], k: bendK(), d0: zoneBend ? zoneBend.d0 : null });
export { CHARFOG, markChar, setCharFog, BEND, LEVELS, bendInfo, bendK, bendPaused, bentPos, bentY, setBend, setLevel, setZoneBend, sphereInfo };
