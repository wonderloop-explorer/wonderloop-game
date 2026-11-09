/* 원더룹 세계 설정 — 무한 우주 탐방 (2026-11-07 1차: 세계 뼈대 + 외계인 탈 + STAGE 1 회색 정원)
   형식은 antvillage.js 맨 위 주석 그대로. 공개 주소의 기본 세계는 개미굴(js/worlds/index.js CURRENT) — 이 세계는 ?world=infinite-space 로 연다.
   스테이지 4개: ① 회색 정원(달 + 수성, 걸어서 한 바퀴 도는 작은 행성 — js/zones/space/garden.js) ② 붉은 모래 언덕(화성) ③ 파란 노을 ④ 금성 구름(이름은 지도 자리만, 2차부터).
   색: 바탕 남보라 #211F45(글자엔 안 씀) · 달 회색 #BFC3CC · 화성 주황 #D9704A · 파란 노을 #7FB6E8 · 금성 연보라 #C9A6E0 · 탈 연두 #9BD46B */
/* 숨방울 목걸이 — 가는 은빛 끈 고리 + 가슴 앞 투명한 숨방울(안에 작은 빛 알갱이). 떠 있을 때는 숨방울이 가운데(원점 = 밑).
   얻으면(첫 미션) 손에 쥐지 않고 목에 건다: wear(WL) → 목 뼈에 목걸이, 머리 뼈에 탈 둘레 옅은 숨방울 막(둥근 반투명 공 + 테두리 빛) */
let ICON=null,MAPI=null;
function canvasIcon(draw){const c=document.createElement('canvas');c.width=c.height=96;draw(c.getContext('2d'));return c.toDataURL();}
function ICON_NECK(){return ICON||(ICON=canvasIcon(g=>{g.strokeStyle='#8a8fa0';g.lineWidth=4;g.beginPath();g.ellipse(48,34,26,20,0,Math.PI*.1,Math.PI*.9,true);g.stroke();
  const gr=g.createRadialGradient(42,58,3,48,64,22);gr.addColorStop(0,'#ffffff');gr.addColorStop(.35,'#d6f3ff');gr.addColorStop(1,'#7fc4e8');g.fillStyle=gr;g.beginPath();g.arc(48,64,20,0,7);g.fill();
  g.strokeStyle='#4a7c9c';g.lineWidth=2.5;g.stroke();g.fillStyle='#fff';g.beginPath();g.ellipse(41,57,5,3.4,-.6,0,7);g.fill();g.fillStyle='#ffe9a0';g.beginPath();g.arc(52,68,3,0,7);g.fill();}));}
/* 달떡 아이콘: 연보라 접시 위 하얀 떡 셋(하나는 연분홍) */
let CAKEI=null;function ICON_CAKE(){return CAKEI||(CAKEI=canvasIcon(g=>{g.fillStyle='#e8d6ea';g.strokeStyle='#5a3826';g.lineWidth=3;g.beginPath();g.ellipse(48,64,34,12,0,0,7);g.fill();g.stroke();
  [[36,52,'#fbf8f0'],[60,52,'#f7dbe4'],[48,40,'#fbf8f0']].forEach(([x,y,c])=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,14,11,0,0,7);g.fill();g.stroke();g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.ellipse(x-5,y-4,4,2.5,-.5,0,7);g.fill();});}));}
/* 우주 지도에 붙는 발견 그림(game/travel): 얼음 동굴 — 연하늘 얼음 결정 셋, 망원경 — 갈색 다리 위 크림 통 */
let ICEI=null,SCOPEI=null;
function ICON_ICE(){return ICEI||(ICEI=canvasIcon(g=>{g.strokeStyle='#4a6f8c';g.lineWidth=3;[[48,62,14,46],[30,68,9,30],[66,70,8,26]].forEach(([x,y,hw,hh])=>{g.fillStyle='#d6f0ff';g.beginPath();g.moveTo(x,y-hh);g.lineTo(x+hw,y-hh*.35);g.lineTo(x+hw*.7,y+8);g.lineTo(x-hw*.7,y+8);g.lineTo(x-hw,y-hh*.35);g.closePath();g.fill();g.stroke();
  g.strokeStyle='rgba(255,255,255,.9)';g.beginPath();g.moveTo(x-hw*.3,y-hh*.6);g.lineTo(x-hw*.4,y);g.stroke();g.strokeStyle='#4a6f8c';});}));}
function ICON_SCOPE(){return SCOPEI||(SCOPEI=canvasIcon(g=>{g.strokeStyle='#5a3826';g.lineWidth=4;g.beginPath();g.moveTo(48,52);g.lineTo(30,84);g.moveTo(48,52);g.lineTo(66,84);g.moveTo(48,52);g.lineTo(48,86);g.stroke();
  g.save();g.translate(48,44);g.rotate(-.55);g.fillStyle='#f3e4c4';g.lineWidth=3;g.beginPath();g.rect(-30,-9,56,18);g.fill();g.stroke();g.fillStyle='#d9704a';g.beginPath();g.rect(22,-12,10,24);g.fill();g.stroke();g.restore();}));}
function ICON_MAP(){return MAPI||(MAPI=canvasIcon(g=>{g.fillStyle='#f3e4c4';g.strokeStyle='#5a3826';g.lineWidth=3;g.beginPath();g.moveTo(16,22);g.lineTo(44,14);g.lineTo(80,24);g.lineTo(74,76);g.lineTo(46,82);g.lineTo(20,72);g.closePath();g.fill();g.stroke();
  g.setLineDash([4,5]);g.strokeStyle='#a8603f';g.beginPath();g.moveTo(26,62);g.quadraticCurveTo(40,40,62,44);g.stroke();g.setLineDash([]);
  g.fillStyle='#9bd46b';g.beginPath();g.arc(64,42,7,0,7);g.fill();g.strokeStyle='#4a2a2a';g.lineWidth=2;g.stroke();g.fillStyle='#bfc3cc';g.beginPath();g.arc(28,62,6,0,7);g.fill();g.stroke();}));}
function necklace(THREE,{held}){const g=new THREE.Group(),b=new THREE.Group();g.add(b);b.scale.setScalar(held?1:1.6);
  const cord=new THREE.Mesh(new THREE.TorusGeometry(.17,.012,6,32),new THREE.MeshStandardMaterial({color:'#c9ccd8',roughness:.6}));cord.rotation.x=Math.PI/2;cord.position.y=.2;cord.scale.set(1,1.15,1);b.add(cord);
  const bub=new THREE.Mesh(new THREE.SphereGeometry(.075,16,12),new THREE.MeshStandardMaterial({color:'#bfeaff',emissive:'#5fb8e0',emissiveIntensity:.35,roughness:.3,transparent:true,opacity:.72}));bub.position.set(0,.06,.19);b.add(bub);
  const core=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),new THREE.MeshStandardMaterial({color:'#fff3c0',emissive:'#ffe08a',emissiveIntensity:1}));core.position.copy(bub.position);b.add(core);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.018,.022,.03,8),new THREE.MeshStandardMaterial({color:'#c9ccd8'}));cap.position.set(0,.14,.19);b.add(cap);
  return g;}
/* 목에 걸기(game/mission item.wear): 목걸이 + 숨방울 막. 한 번만 단다(다시 불러도 그대로) */
function wear(WL,THREE){const U=WL.userData;if(U.breathBubble)return;let neck=null,head=null;WL.traverse(o=>{if(o.isBone&&o.name==='neck')neck=o;if(o.isBone&&o.name==='head')head=o;});if(!neck||!head)return;
  const n=necklace(THREE,{held:true});n.position.set(0,-.36,.0);neck.add(n);
  const mat=new THREE.MeshBasicMaterial({color:'#bfe8ff',transparent:true,opacity:.13,depthWrite:false});mat.userData.noStorybook=true;
  const bubble=new THREE.Mesh(new THREE.SphereGeometry(.72,28,20),mat);bubble.position.set(0,.06,-.06);bubble.renderOrder=5;head.add(bubble);
  const rim=new THREE.Mesh(new THREE.SphereGeometry(.735,28,20),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{},
    vertexShader:'#include <common>\nvarying float vF;void main(){vec4 w=modelMatrix*vec4(position,1.);vec3 N=normalize(mat3(modelMatrix)*normal),V=normalize(cameraPosition-w.xyz);vF=pow(1.-abs(dot(N,V)),2.2);gl_Position=projectionMatrix*(wlBend.x>0.?viewMatrix*wlBent(w):viewMatrix*w);}',
    fragmentShader:'varying float vF;void main(){gl_FragColor=vec4(vec3(.62,.86,1.)*vF*.55,1.);}'}));rim.position.copy(bubble.position);rim.renderOrder=6;head.add(rim);
  U.breathBubble={necklace:n,bubble,rim};}
const PLANET=(c,extra='')=>`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${c}" stroke="#4a2a2a" stroke-width="2"/>${extra}</svg>`;
export default {
  id:'infinite-space',
  title:'무한 우주',
  name:'무한 우주', // 엔딩 큰 제목 '무한 우주 탐방 끝'(game/finale — '{name} 탐방 끝')
  letterColors:['#BFC3CC','#D9704A','#7FB6E8','#C9A6E0','#9BD46B'],
  /* '우'의 ㅇ = 고리 달린 작은 토성(2026-11-07 — 따로 떠 있던 토성 장식 대신, 글자 장식은 하나): game/titlescreen glyphize가 '우' 칸의 위쪽(ㅇ)을 잘라 숨기고
     아래 ㅜ 획은 글자 그대로 두며 이 그림을 ㅇ 자리에 얹는다. 금빛 몸통 + 비스듬한 고리(뒤 반은 몸통 뒤, 앞 반은 앞), 글자와 같은 갈색 테두리(#4a2a2a, .045em)·
     아래로 밀린 입체 그림자(.085~.13em)·흐린 그림자. 천천히 돎(고리가 눕혔다 세웠다 + 몸통 줄무늬가 흐름), 고리에 가끔 빛이 스치고 작은 반짝이.
     엔딩 큰 글자 '무한 우주 탐방 끝'도 같은 방식(game/finale). 읽어 주기·페이지 제목은 '무한 우주' 그대로 */
  titleGlyph:{ch:'우',cut:'.52em',gx:'50%',gy:'.278em',gw:'.92em',gh:'.63em',svg:id=>{
    const INK='#4a2a2a',spin=`<animateTransform attributeName="transform" type="scale" values="1 1;1 .68;1 1" dur="7s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>`;
    const ring=(half,body)=>`<g transform="translate(66 45) rotate(-17)"><g>${spin}${body(half?'M-66 0A66 17 0 0 0 66 0':'M-66 0A66 17 0 0 1 66 0')}</g></g>`;
    const inkRing=w=>d=>`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round"/>`;
    const goldRing=d=>`<path d="${d}" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ffe08a" stroke-width="6.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#d6a744" stroke-width="1.8" transform="scale(.9)"/>`;
    const shadow=dy=>`<g transform="translate(0 ${dy})">${ring(0,inkRing(13))}<circle cx="66" cy="45" r="37.6" fill="${INK}"/>${ring(1,inkRing(13))}</g>`;
    return `<svg viewBox="0 0 132 90" aria-hidden="true"><defs><clipPath id="${id}c"><circle cx="66" cy="45" r="31"/></clipPath></defs>`+shadow(19)+shadow(12.5)+
      ring(0,goldRing)+`<circle cx="66" cy="45" r="37.6" fill="${INK}"/><circle cx="66" cy="45" r="31" fill="#f2c24f"/><g clip-path="url(#${id}c)"><g><animateTransform attributeName="transform" type="translate" values="-7 0;7 0;-7 0" dur="9s" repeatCount="indefinite"/>`+
      `<path d="M26 33q40 7 80 0M24 49q42 6 84 0M30 62q36 5 72 0" stroke="#d29a35" stroke-width="5.5" fill="none" stroke-linecap="round"/><path d="M28 41q38 4 76 0" stroke="#ffe7a6" stroke-width="3.2" fill="none" stroke-linecap="round"/></g>`+
      `<ellipse cx="53" cy="29" rx="14" ry="7.5" fill="#fff6d6" opacity=".55" transform="rotate(-25 53 29)"/></g>`+
      ring(1,d=>goldRing(d)+`<path d="${d}" fill="none" stroke="#fffbe8" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="12 260" opacity="0"><animate attributeName="stroke-dashoffset" values="40;-200" dur="4.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.95;0" keyTimes="0;.55;.7;1" dur="4.6s" repeatCount="indefinite"/></path>`)+
      `<g transform="translate(116 56)"><g opacity="0"><animate attributeName="opacity" values="0;0;1;0" keyTimes="0;.8;.88;1" dur="4.6s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" values=".3;.3;1.15;.4" keyTimes="0;.8;.88;1" dur="4.6s" repeatCount="indefinite"/>`+
      `<path d="M0-11L2.4-2.4 11 0 2.4 2.4 0 11-2.4 2.4-11 0-2.4-2.4Z" fill="#fff4b8" stroke="${INK}" stroke-width="1.6"/></g></g></svg>`;}},
  /* 행렬 행성 굴리기(장식 그림 없이 css만 — titleDeco는 css만 씀) */
  titleDeco:{css:`#wlTitle .march i{animation:none!important}
#wlTitle .march i svg{animation:spRoll 1.9s linear infinite}
@keyframes spRoll{to{transform:rotate(360deg)}}`},
  /* 점선 위 행렬: 작은 행성 다섯(회색 달·주황 화성·연보라 금성·금빛·줄무늬)이 차례로 데굴데굴 */
  parade:{svgs:[
      PLANET('#BFC3CC','<circle cx="9" cy="9" r="2.2" fill="#9a9eaa"/><circle cx="15" cy="15" r="1.6" fill="#9a9eaa"/>'),
      PLANET('#D9704A','<path d="M5 10q7 2 14-1" stroke="#a84c2c" stroke-width="1.6" fill="none"/>'),
      PLANET('#C9A6E0','<path d="M4 13q8-3 16 1" stroke="#9a78b4" stroke-width="1.6" fill="none"/>'),
      PLANET('#F2C14E','<circle cx="14" cy="9" r="2" fill="#fff1b0"/>'),
      PLANET('#7FB6E8','<path d="M3.5 9h17M3 13h18M4.5 17h15" stroke="#4a7cc8" stroke-width="1.6"/>')],
    n:10,w:22,h:22,gap:'2.2rem',color:'#fff',sec:11,hop:.35},
  intro:['외계인 탈을 쓰고 나침반을 따라온 탐험가 원더룹이','빈 우주 지도를 채우러 떠나요'],
  startColor:'#9BD46B',
  /* 배경 루프: 작은 행성을 바깥에서 — 카메라가 원더룹에서 멀리(26m) 있으면 그 아래 땅은 행성 둘레를 따라 넘어가 공 모양이 다 보인다 */
  backdrop:{zone:'space-garden',at:[0,3,8],r:34,h:2,bob:[1,.25],speed:.06,a0:.4,
    show:{at:[0,9],az:.3}},
  /* 우주 날씨(game/weather): 맑은 별빛·유성우·오로라·성운 노을 — 비·천둥 없음. 공간음: 잔잔한 우주 웅웅거림, 유성우는 먼 쉬익 */
  weathers:['starlight','meteor','aurora','nebula'],
  ambience:{starlight:'space',meteor:'meteor',aurora:'space',nebula:'space'},
  talModel:'alien',talLabel:'외계인 탈',
  talColors:[['연두 외계인','#9bd46b','#6f9e48'],['연보라 외계인','#c9a6e0','#9a78b4'],['하늘 외계인','#8cc8ec','#5f9cc4'],['회색 외계인','#bfc3cc','#868a96']],
  guide:{text:'여왕개미의 나침반 바늘이 하늘을 가리킨 밤, 외계인 탈을 쓰고 우주로 날아온 탐험가 원더룹이에요. 낯선 행성도 두 발로 걸어 보는 걸 좋아해요.',goal:'행성을 하나씩 걸어 빈 우주 지도를 채우고, 해 가까이까지 가 보기'},
  /* 세계 물건(가방): 달떡 — STAGE 1 떡방아(js/zones/space/garden.js). bagOnly: 탐험 준비 장식 목록에는 넣지 않음.
     STAGE 4 연결 메모(share): 친구들이 모였을 때 나눠 먹는 장면에서 쓸 예정 — flags['item:infinite-space:dalddeok']로 가졌는지 본다 */
  items:[{id:'dalddeok',name:'달떡',stage:1,bagOnly:true,share:'stage4-friends',where:'STAGE 1 떡방아',icon:()=>ICON_CAKE(),
    desc:'낮은 중력에서 둥실둥실 찧은 쫀득한 달떡. 친구들이 모이면 나눠 먹어요.'}],
  map:[{name:'회색 정원',zone:'space-garden'},{name:'붉은 모래 언덕',zone:null},{name:'파란 노을',zone:null},{name:'금성 구름',zone:null}],
  /* 첫 화면·탐험 준비 곡(game/music 형식): 느린 72bpm, 패드 + 종 아르페지오 + 반짝이 — 잔잔하고 넓게 */
  music:{id:'space-title',song:{name:'무한 우주 타이틀',bpm:72,lead:'celesta',noVary:true,
    bars:[45,41,43,40,45,41,38,40].map((r,i)=>{const q=[3,4,4,3,3,4,4,4][i];return {bass:r,pad:[r+24,r+24+q,r+31]};}),
    mel:[[76,null,null,79,81,null,null,null],[77,null,76,null,72,null,null,null],[74,null,null,79,83,null,81,null],[79,null,null,null,76,null,null,null],
         [76,null,79,null,84,null,83,81],[81,null,null,77,76,null,null,null],[74,null,77,null,81,null,79,null],[76,null,null,null,null,null,null,null]],
    parts:{mel:{v:.1},pad:{v:.02},bass:{v:.12,pat:[0,null,null,null,7,null,null,null]},sparkle:{p:.05,v:.035}}}},
  /* 모험 시작 연출 — 글자만(음성은 나중에). 카메라는 작은 행성 둘레를 천천히(멀리서 → 가까이) */
  introNarration:[
    {text:'개미굴을 빠져나온 밤, 여왕개미의 나침반 바늘이 땅이 아니라 하늘을 가리켰어요. 바늘을 따라 도착한 곳은 끝이 보이지 않는 무한 우주예요.',cam:{at:[0,-4,8],r:32,h:10,a:[.3,.75],speed:.06,bob:[1,.25]}},
    {text:'외계인 탈을 쓴 원더룹이 내려앉은 작은 회색 행성에는, 발자국으로 지도를 그리는 달토끼 보름 할아버지가 살고 있었어요.',cam:{at:[1.2,1,5.5],r:9,h:3.6,a:[.9,1.35],speed:.06,bob:[.3,.3]}},
    {text:'할아버지의 지도에는 아직 빈칸이 많아요. 행성을 하나씩 걸어 빈칸을 채우고, 아무도 가 본 적 없는 해 가까이까지 가 보는 거예요.',cam:{at:[0,1,6],r:22,h:9,a:[1.5,2.0],speed:.06,bob:[.6,.25]}}],
  /* 첫 미션 — 숨방울 목걸이(시간 제한·실패 없음). 민트 길은 할아버지의 오래된 발자국 길을 따라(발자국 길이 출발점 → 그늘 분화구로 곧게 이어짐) */
  firstMission:{
    item:{id:'necklace',name:'숨방울 목걸이',at:[-3.2,-15.2],y:.9,pickR:1.5,icon:()=>ICON_NECK(),model:necklace,wear,getScale:1.3,getTop:1.9,
      desc:'숨 쉴 공기를 동그랗게 담아 두는 목걸이. 걸면 탈 둘레에 옅은 숨방울 막이 생겨요.',where:'첫 미션'},
    quest:'보름 할아버지의 발자국을 따라 그늘 분화구로 가요',
    popup:{kicker:'미션',title:'숨방울 목걸이를 찾아요',text:'여기는 숨 쉴 공기가 거의 없는 행성이에요. 보름 할아버지가 그늘 분화구 쪽에 떨어뜨린 목걸이를 찾아 주세요.'},
    narration:{text:'숨방울 목걸이를 찾아요. 여기는 숨 쉴 공기가 거의 없는 행성이에요.'},
    goal:{label:'숨방울 목걸이'},
    got:{title:'숨방울 목걸이를 얻었어요!',text:'목에 걸었더니 탈 둘레에 숨방울 막이 생겼어요'},
    next:'보름 할아버지에게 돌아가요'},
  controlsNote:{
    keys:[['Space','둥실 뛰기 — 중력이 약해서 높이 떠올라 천천히 내려와요']],
    talk:'보름 할아버지 가까이에서 나타나요',
    touch:[['점프','둥실 뛰기 — 높이 떠올라 천천히 내려와요']],
    play:'바람이 없는 행성이라 걸은 발자국이 그대로 남아요. 할아버지의 오래된 발자국 길을 따라가면 다음 목표가 나와요. 그늘 분화구 깊은 곳에는 아무도 모르는 비밀이 숨어 있대요.'},
  /* 스테이지 빛(game/stage): 회색 정원 — 연보라 하늘빛·연보라 땅 반사(그늘이 연보라), 해는 따뜻하고 강하게(공기가 없어 그림자가 또렷) */
  stages:{'space-garden':{label:'회색 정원(우주)',light:{hemi:'#d2c6ea',ground:'#7a64a2',level:.82,sun:1.1,k:.7}}},
  finale:{gift:null,vehicle:null,miniature:null,endBackdrop:null},
  cert:null,
  icons:{map:ICON_MAP,necklace:ICON_NECK},
  /* 스테이지 이동 연출(game/travel — 공통 틀, 2026-11-09): 이동 테마 파일 자리(없으면 코드로 만든 임시 테마), 우주 지도 장면의 행성(해에서 가까운 차례 — 미니어처처럼 한눈에),
     구역 사이 예고 한 줄(나레이션 자리 — 지금은 자막만), 지나온 스테이지에서 발견한 것(flag가 켜진 것만 작은 그림으로) */
  travel:{theme:{file:'assets/audio/travel-theme.mp3'},
    map:{bodies:[{id:'sun',name:'해',color:'#F6C85A',r:.06,glow:true},{id:'venus',name:'금성',color:'#C9A6E0',r:.05},{id:'moon',name:'달',color:'#BFC3CC',r:.05,zone:'space-garden'},
      {id:'mars',name:'화성',color:'#D9704A',r:.058,zone:'space-mars'},{id:'jupiter',name:'목성',color:'#E9C49A',r:.085},{id:'saturn',name:'토성',color:'#E8D29A',r:.068,ring:true}]},
    lines:{'space-garden>space-mars':{id:'travel-moon-mars',text:'저 붉은 행성에선 노을이 파래대요.'}},
    facts:{'space-garden':[{flag:'have:infinite-space:necklace',img:()=>ICON_NECK()},{flag:'secret:infinite-space:icecave',img:()=>ICON_ICE()},
      {flag:'secret:infinite-space:telescope',img:()=>ICON_SCOPE()},{flag:'item:infinite-space:dalddeok',img:()=>ICON_CAKE()}]}},
};
