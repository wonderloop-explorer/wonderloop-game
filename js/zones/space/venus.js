/* 무한 우주 STAGE 3 구름 행성(금성) 본편 (2026-11-19 — 미션 하나 더(바람 타고 생일 초 잡기)·'거꾸로' 소품 삭제 → 해시계 마을·끝은 얼음 배로 토성). 성격은 '살피기'. 자동 플레이 약 4분 4초(휴대폰·PC 같음).
   흐름·대사 자리 목록은 docs/space-stage3-flow.md(대본 만들 때 볼 것). 대사는 2026-11-21 확정(T·T2 — script.csv와 글자가 같아야 목소리를 찾는다).
   사실 기준: 금성이 반대로 돌아서 달라지는 건 해의 길(서쪽에서 뜸)·그림자가 움직이는 방향·해시계 눈금 방향뿐 — 위아래가 뒤집히지 않는다(집·나무·연기는 평범하게). 구름 꼭대기 바람은 서쪽으로 아주 빠르다 → 깃발·구름 줄기는 모두 서쪽으로.
   땅: 구름 바다(SEA) 위에 뜬 구름 섬 + 둘레 구름 섬·먼 구름 탑. 해는 서쪽(-x): 해돋이 전에는 서쪽 지평선의 금빛 띠만, 광장에서 떠오름.
   자리(2026-11-19 두 번째 — 바람은 서쪽으로 부니 바람길도 서쪽으로만): 시작 START·처음 만나는 또생일 둔덕 DDO0·바람길 발판 PAD는 동쪽(x 34~44), 파티장(단상 SEC·식탁 CAKE·내리는 자리 LAND)은 마을 입구 옆(x 1~6). 또생일은 부탁한 뒤 먼저 날아가 단상에서 기다림.
   길(PATH): [0,0](파티장 옆) → 마을 입구 [0,-10] → 굽은 마을 길 약 90m → 광장 PLZ → 문 구역 GS → 구름 문 GATE → 구름 끝 END.
   ① 도착 → ② 거꾸리(S3-002·020) → ③ 또생일 부탁(다가가면 저절로: S3-015·021·022)
   ④ 바람 타기: 발판에 올라서면 파티 우산 + 정해진 바람길 WIND(WSEC초, x가 줄어들기만 함) — 조이스틱·WASD·방향키로 좌우·위아래 조금씩, 공중의 초 CAND 셋에 닿으면 잡힘(저장), 파티장에 내림. 놓치면 '다시 타 볼까?' → 구름이 동쪽 발판 옆으로
   ⑤ 식탁에서 '초 꽂기' → S3-016 → 촛불 불기 → 생일 노래 → 발견 카드(S3-017)
   ⑥ 해시계 마을(걸으며 구경): 구름 집 넷(등불 셋)·작은 해시계 넷(반시계 눈금)·깃발·바람개비·우산 나무·조는 구름 양 셋, 길 한가운데 빈터의 '구름 양 재우기'(2026-11-20 — 구멍 다섯에서 튀어나오는 양을 톡 쳐서 다섯 번 재우면 구름 둑이 걷힘), 서쪽으로 흐르는 구름 줄기
   ⑦ 광장(한가운데 큰 해시계): 대사 → 해돋이 5.8초 → 대사 → 서쪽 출구 = 발견 카드(S3-007), 동·남 = 되돌림(두 번이면 S3-005)
   ⑧ 뭉게 문지기: 코골이 + 오르골 반주 → 미리 알림 0.8초(반주 멈춤·들썩·구름 말풍선 ?) → 눈뜸(0.2초 봐줌) → 움직이면 ! → 문을 지나면 S3-011
   ⑨ 구름 끝: S3-012 → 013 → 얼음 배 → 발견 카드(S3-014 — 낡은 비행선) → 지도 카드 → STAGE 3 완료 → ⑩ sail(): 행성 이동 공통 틀(meteor-ride departure, 탈것 = 얼음 배)로 space-saturn
   저장: flags venus:met · ask · c1~c3 · ddo · town · sunrise · plaza · gate · clear:space-venus, 발견 secret:<세계>:venusday · venussun · venusair.
   하늘 칸 [해돋이 전, 해돋이 뒤, 우주(떠날 때)] — after()로 고정. 안개: 도착 3~24m → 6~54 → 해돋이 11~108 → 광장을 나서면 29~239.
   휴대폰은 기둥·먼 배경·마을 소품·집 넷이 한 덩어리(집은 조각 번호 — 가리는 그 집만 점무늬로 흐려짐, game/occlude pieces always). 토성으로 떠날 때는 안개에 묻힌 것부터 숨김(sailHide).
   그리기(구역 것 — 컴퓨터): 땅·바다 1 · 기둥·문·둔덕·섬·탑 1 · 마을 소품 1 · 집 4(가리면 흐려짐) · 해시계 그림 1 · 깃발·바람개비 1 · 구름 줄기 1 · 등불 빛 1 · 그림자 1 · 서쪽 빛 띠 1 · 해 1 · 거꾸리 3+1 · 뭉게 3 · 또생일 1 · 케이크 3 · 비행선 1 · 알갱이 1 (+ 휴대폰 동그란 그림자 1), 미션 중 초 3·우산 1, 끝에 배 1.
   시험 tools/space-stage3-test.py */
import * as THREE from 'three';
import {PI,QUALITY,rng,blobMany} from '../../01-textures.js';
import * as G from '../../game/index.js';
import {sbMat} from '../../game/storybook.js';
import {markChar} from '../../game/bend.js';
import {RIDE,points,departure,arrival,landOn,handsMid} from './meteor-ride.js';
import {makeSkyBoard,makeOrb,canvasTex,venusMap,saturnMap,satCloudMap,jupiterMap,marsMap} from './skyboard.js';
import {lump} from './martians.js';
import {radialTex,gradTex} from '../../game/glowtex.js';
import {makeGeokkuri,makeMunge,makeDdo,makeCake,makeIceBoat,pillarParts,puff,houseParts,treeParts,mailboxParts,sheepParts,herdSheepParts,fenceParts,sundialParts,makeAirship,poleParts,podiumParts,tableParts,dialMat,makeUmbrella,makeCandle,boatStand,makeBreath} from './cloudfolk.js';
import SPACE from '../../worlds/infinite-space.js';
const WID=SPACE.id,ZID='space-venus';
const K={met:'venus:met',ask:'venus:ask',c:['venus:c1','venus:c2','venus:c3'],town:'venus:town',sun:'venus:sunrise',plaza:'venus:plaza',gate:'venus:gate',sheep:'venus:sheep',ddo:'venus:ddo',clear:'clear:'+ZID};
const DISC={sun:'secret:'+WID+':venussun',air:'secret:'+WID+':venusair',day:'secret:'+WID+':venusday'},DISC_TOTAL=3;
/* 대사(docs/voice/script.csv SPC-S3-… 와 글자가 같아야 목소리를 찾는다) */
const T={n0:'구름 행성 금성에 도착했어요! 금성은 온통 두꺼운 구름에 덮여 있어요.',n1:'구름이 너무 두꺼워서 한 치 앞도 안 보여요. 어디로 가야 할까요?',g2:"녕안! 거꾸로 한 '안녕'이야. 나는 거꾸리, 거꾸로 하는 장난을 좋아해!",g3:'여기선 해가 서쪽에서 떠. 그래서 그림자도 반대로 읽어야 해.',g4:'그림자 반대쪽이 앞이야! 갈림길에서 그림자를 잘 보고 따라와.',
  g5:'그림자가 가리키는 쪽 말고, 그 반대쪽!',g6:'봐, 구름이 걷히잖아! 서쪽에서 뜬 해가 길을 비춰 줘.',n7:'금성은 다른 행성과 거꾸로 돌아서, 해가 서쪽에서 뜨고 동쪽으로 져요.',g8:'쉿, 자고 있어. 코를 골 때만 살금살금 걸어.',
  m9:'음? 누구야?',m10:'어이쿠, 누가 깨웠어?',m11:'드르렁, 더 자야지.',g12:'다 왔다! 여기가 구름 끝이야. 토성 고리에서 날아온 얼음 조각으로 배를 띄워 줄게.',g13:'잘 가! 나는 거꾸로 인사할게. 녕안!',
  n14:'금성 땅은 아주 뜨겁지만, 구름 위 높은 곳은 기압과 온도가 지구와 비슷해요. 그래서 과학자들은 금성 구름 위에 비행선을 띄우는 탐사를 연구하기도 했어요.',d15:'오늘 내 생일이야! 금성이 한 바퀴 다 돌기도 전에 1년이 또 지나 버렸거든!',d16:'케이크 한 조각 먹고 가! 초는 네가 불어도 돼.',
  n17:'금성이 제자리에서 한 바퀴 도는 데 243일, 해를 한 바퀴 도는 데 225일이 걸려요. 한 바퀴 도는 것보다 1년이 먼저 끝나요.',n18:'보름 할아버지의 지도에 구름 행성이 그려졌어요.',g19:'그림자 반대쪽이 앞이야!'};
/* 새 흐름의 대사(2026-11-21 확정 — docs/voice/script.csv SPC-S3-020~040과 글자가 같아야 목소리를 찾는다. first·retry는 글자만인 안내 문구) */
const T2={thanks:'고마워! 내 생일 중에 가장 특별한 날이야!',dial:'그림자 봐, 곧 해 뜰 시간이야!',goal:'구름 끝은 해 뜨는 쪽에 있어. 안개 때문에 어느 쪽인지 모르겠지? 해가 뜨면 알 수 있어!',go:'따라와, 마을로 가자!',ask:'바람에 초가 날아갔어! 이 우산 타고 잡아 와!',wait:'초 세 개, 꼭 찾아 줘!',retry:'다시 타 볼까요?',first:'먼저 또생일의 초를 찾아 줘요.',town:'오늘 드디어 해가 떠! 금성에선 해가 한 번 뜨려면 아주 오래 걸려. 광장에서 같이 보자!',rise:'해가 뜬다! 어느 쪽에서 뜨는지 봐!',west:'봤지? 금성에선 해가 서쪽에서 떠! 해돋이는 지구 날짜로 약 117일에 한 번뿐이야.',hint:'그쪽이 아니야, 해가 뜬 쪽으로 가자!',again2:'금성 해돋이는 117일에 한 번이야. 오늘 봐서 운이 좋았어!',gate:'저기 뭉게 문지기야. 구름 끝 비행선 선착장 문을 지켜. 금성은 낮이 지구 날짜로 두 달 가까이 이어져서 늘 졸려.',again:'광장으로 가자! 해돋이를 놓치면 117일을 기다려야 해.',sheep:'큰일이야, 구름 양들이 울타리에서 빠져나갔어! 양 뒤로 다가가서 울타리 안으로 몰아 줘!',herd:'양 뒤로 다가가서 울타리로 몰아요',quiet:'다 들어갔다! 고마워. 이제 해돋이 보러 서두르자!',lead:'해 뜨는 쪽으로 더 가까이 가 볼까? 구름 끝이 그쪽이야!',end1:'다 왔다! 여기가 구름 끝이야. 여기까지 같이 와 줘서 고마워!',party:'파티장에서 만나!',goAsk:'얼음 배를 타고 토성으로 가 볼래?' /* SPC-S3-042 글자만 — 끝낸 뒤 다시 왔을 때 거꾸리에게 말 걸면 */,end2:'저기 얼음 배가 왔다! 토성에서 마중 보낸 배야. 타고 가 봐!' /* SPC-S3-041 — 다른 행성 이름 예외(사용자가 정함) */};
/* 배경음(2026-11-22): 금성 전체 = venus-bgm(2분 30초 — 잦아드는 끝 꼬리 1.8초를 처음 소리와 겹쳐 되풀이: [되풀이 시작, 끝, 겹침]), 해돋이 = venus-sunrise(63초, 한 번만 — 가장 커지는 RISE초에 해가 다 뜸), 놀이 = venus-play(코드 곡) */
const BGM={id:'venus-bgm',fade:2.5,loop:[2,146.5,1.8],intro:true,lufs:-15.5},RISE=17.8,SUN_LOOP=[60,170,2.5]; /* 해돋이 음악(2분 59초): 처음부터 한 번 → 끝에 닿으면 60~170초를 2.5초 겹쳐 되풀이 */
const SONG_R=17; /* 생일 노래가 들리는 거리: 또생일(파티장) 5m 안은 다 들리고 멀어질수록 줄어 17m에서 꺼짐(2026-11-21 — 예전: 26m 안이면 0.35 아래로 안 줄어 양 몰기 빈터에서도 계속 들렸다). 놀이(바람 타기·양 몰기) 중에는 놀이 배경음만 */
const BX=[-90,50,-36,14]; // 걷는 범위
function groundY(x,z){return .22*Math.sin(x*.21+Math.sin(z*.13)*1.4)*Math.cos(z*.19)+.14*Math.sin((x+z)*.37)+.1*Math.sin(x*.61-z*.47);}
const PATH=[[0,0],[0,-10],[-4,-17],[-12,-20],[-19,-13],[-25,-6],[-33,-4],[-40,-7],[-42,-12],[-42,-20],[-56,-20],[-72,-20],[-87,-20]]; /* 2026-11-20: 마을 길 약 90m → 약 58m(광장 동쪽은 비워 둠 — 해돋이 카메라 자리, 걷는 시간 절반 — 해돋이를 보러 서두르는 길) */
/* 광장: 북쪽(+z)에서 들어섬(inc = 들어오는 방향), 출구 셋 — 서쪽(해 쪽)이 맞는 길, 동쪽(그림자가 뻗는 쪽)·남쪽이 틀린 길. wait = 거꾸리가 기다리는 자리(가운데 기준) */
const PLZ={c:[-42,-20],R:7,inc:[0,-1],wait:[2.7,4.4],br:[{d:[-1,0],ok:true,n:'서쪽'},{d:[1,0],n:'동쪽'},{d:[0,-1],n:'남쪽'}]};
const GS=[-56,-20],GATE=[-72,-20],END=[-87,-20],SEC=[4.4,-6.4],CAKE=[5.9,-5.4],PAD=[44,-2],LAND=[1.2,-6.3],START=[34,0],DDO0=[40.3,-5.2],GG0=[37.6,-3.4],GGP=[-1.4,-4.8],MUNGE=[-70.3,-22.5],SPUR=[[0,-6],[5,-5.6]],EASTP=[[44,-2],[34,0],[17,-1.5],[0,0]],SEA=-1.1,DOCK=[-92.7,-20];
/* 바람길(생일 초 잡기 — 2026-11-19): 또생일 옆 발판 PAD → 서쪽으로 부는 바람을 타고 북쪽 구름 바다 위 구름 섬 사이를 크게 돌아 → 길 옆 LAND. [x, 땅 위 높이, z] · 초 [길 진행 u, 옆(오른쪽 +), 위] */
const WIND=[[44,.4,-2],[40,4.6,7],[33,6,18],[24,6,26],[15,6,25],[9,5.6,16],[5,4,5],[3,1.6,-4],[1.2,.1,-6.3]],WSEC=18,CAND=[[.27,0,0],[.52,-2.5,.6],[.76,2.3,.9]] /* [바람길 진행, 옆, 위] — 첫째는 길 가운데(조종 없이 잡힘), 둘째·셋째는 옆·위로 비켜 있어 조금 움직여야 잡힘(2026-11-20: 셋 다 가운데 + 넓은 범위 + 센 자석이라 조종 없이 다 잡혔다) */,CATCH=1.95 /* 잡히는 범위(처음 1.3의 1.5배) */,CCOL=['#8cc8ec','#9bd46b','#ffd27a'];
const ICE_VEIL={blobs:['#eef6ff','#dbeafc','#f6f1e2','#cfe0f6','#e9f0fb'],bg:['#dfeaf8','#cfdcf0'],fade:'rgba(220,232,248,0)',tiles:[[250,252,255],[170,190,220]],dots:['255,255,255','200,216,240','236,226,200']};
const SHD=[1,0]; // 그림자가 뻗는 쪽(동쪽 — 해 반대)
const SHIP=[DOCK[0]-.612*58,1.5,DOCK[1]-.791*58]; // 낡은 비행선(구름 끝에서 배를 비추는 카메라가 보는 쪽 구름 바다 위)
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);},lerp=(a,b,t)=>a+(b-a)*t;
/* 길 계산: 누적 길이·한 점을 길 위로 내린 자리 */
const SEG=PATH.slice(1).map((p,i)=>Math.hypot(p[0]-PATH[i][0],p[1]-PATH[i][1])),ACC=[0];SEG.forEach(l=>ACC.push(ACC[ACC.length-1]+l));const SLEN=ACC[ACC.length-1];
function pointAt(s){s=Math.min(SLEN,Math.max(0,s));for(let i=0;i<SEG.length;i++)if(s<=ACC[i+1]||i===SEG.length-1){const u=(s-ACC[i])/SEG[i];return [lerp(PATH[i][0],PATH[i+1][0],u),lerp(PATH[i][1],PATH[i+1][1],u)];}}
function segD(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,u=Math.min(1,Math.max(0,((x-a[0])*dx+(z-a[1])*dz)/l2)),px=a[0]+dx*u,pz=a[1]+dz*u;return {d:Math.hypot(x-px,z-pz),u,pt:[px,pz]};}
function proj(x,z){let best=null;for(let i=0;i<SEG.length;i++){const q=segD(x,z,PATH[i],PATH[i+1]);if(!best||q.d<best.d)best={d:q.d,s:ACC[i]+q.u*SEG[i],pt:q.pt};}return best;}
const sOf=p=>proj(p[0],p[1]).s,S_TOWN=9,S_PIN=sOf([PLZ.c[0],PLZ.c[1]+PLZ.R+1]),S_PLZ=sOf(PLZ.c),S_GS=sOf(GS),S_GATE=sOf(GATE),S_END=sOf(END);
/* 구름 양 몰기(2026-11-21 — '톡 쳐서 재우기'를 바꿈): 마을 길 GL_S 자리 둘레 빈터(RES — 다른 소품을 두지 않음)에 탈출한 양 다섯이 흩어져 있고, 길 옆 둥근 울타리(가운데 PC·반지름 PR, 문은 길 쪽으로 넓게 ±GHALF)로 뒤에서 몰아넣는다.
   GP = 문 바로 앞(양이 살짝 끌리는 자리) · ROAM = 양이 돌아다니는 범위 · GGS = 거꾸리가 서서 기다리는 자리 · BAR = 다 몰기 전 길을 막는 구름 둑 */
const GL_S=24,RES=8,ROAM=7.2,PR=2.5,GHALF=.85,FLEE=3.5,GC=pointAt(GL_S),GDIR=(()=>{const a=pointAt(GL_S-.5),b=pointAt(GL_S+.5),l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [(b[0]-a[0])/l,(b[1]-a[1])/l];})(),GANG=Math.atan2(GDIR[1],GDIR[0]),GN=[GDIR[1],-GDIR[0]],
  PC=[GC[0]+GN[0]*4.7,GC[1]+GN[1]*4.7],GATEA=Math.atan2(GC[1]-PC[1],GC[0]-PC[0]),GP=[PC[0]+Math.cos(GATEA)*(PR+.8),PC[1]+Math.sin(GATEA)*(PR+.8)],
  HERD0=[[.35,5.6],[1.15,5.4],[1.95,6.2],[2.75,5.2],[-2.7,6]].map(([a,r])=>[GC[0]+Math.cos(GANG+a)*r,GC[1]+Math.sin(GANG+a)*r]) /* 처음 흩어져 있는 자리(울타리 반대쪽·길 앞뒤) */,
  GGS=(()=>{const p=pointAt(GL_S-RES+1.2);return [p[0]-GN[0]*1.7,p[1]-GN[1]*1.7];})(),BAR_S=GL_S+7,BAR=pointAt(BAR_S);
export function build({root}){const MOB=QUALITY.tier==='mobile',keep=[],F=G.state.flags,R0=rng('space-venus:decor'),RR=(a,b)=>a+R0()*(b-a),obstacles=[],floats=[];
  G.profile.setup({world:WID,cards:SPACE.cards});G.sound.songs({'venus-play':PLAY_SONG});
  if(F[K.sun]&&!F[K.sheep])G.state.setFlag(K.sheep,true); /* 예전 저장(양 재우기가 없던 때 광장을 지남) */
  if(F['venus:f3']&&!F[K.plaza]){G.state.setFlag(K.sun,true);G.state.setFlag(K.plaza,true);} /* 예전 저장(갈림길 셋) */
  const add=o=>{root.add(o);keep.push(o);return o;};
  const c0=PLZ.c[0],c1=PLZ.c[1],dPlz=(x,z)=>Math.hypot(x-c0,z-c1);
  const stubs=PLZ.br.filter(b=>!b.ok).map(b=>[PLZ.c,[c0+b.d[0]*11,c1+b.d[1]*11]]);
  const pathD=(x,z)=>{let d=proj(x,z).d;for(const [a,b] of stubs)d=Math.min(d,segD(x,z,a,b).d);for(let i=0;i<EASTP.length-1;i++)d=Math.min(d,segD(x,z,EASTP[i],EASTP[i+1]).d+.5);return Math.min(d,segD(x,z,SPUR[0],SPUR[1]).d+.8,Math.max(0,dPlz(x,z)-PLZ.R+1.2));};
  /* ── 땅: 구름 바다 위에 뜬 구름 섬 한 장(정점 색) — 걷는 범위 밖은 둥글게 가라앉아 바다(SEA, 잔물결)와 만나고, 그 밖으로 아주 먼 바다 판 ── */
  const sea=(x,z)=>SEA+.34*Math.sin(x*.13+Math.sin(z*.09)*1.3)*Math.cos(z*.11)+.2*Math.sin((x-z)*.21);
  const edge=(x,z)=>{const e=Math.max(0,1.2+1.2*Math.sin(x*.31)+1.2*Math.sin(z*.27));return Math.max((BX[0]-.5)-x,Math.max(x-(BX[1]+5),(BX[2]-5)-z,z-(BX[3]+5))-e,0);};
  const X0=-128,X1=70,Z0=-56,Z1=34,CELL=MOB?1.9:1.5,NX=Math.round((X1-X0)/CELL),NZ=Math.round((Z1-Z0)/CELL);
  {const pos=[],col=[],uv=[],idx=[],A=new THREE.Color('#e3d0f3'),C2=new THREE.Color('#c9a6e0'),C3=new THREE.Color('#f6ecfd'),CP=new THREE.Color('#fdf8ff'),CS=new THREE.Color('#c2a6dc'),CS2=new THREE.Color('#dfcef2'),t=new THREE.Color(),t2=new THREE.Color();
    for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++){const x=X0+(X1-X0)*i/NX,z=Z0+(Z1-Z0)*j/NZ,g0=groundY(x,z),off=edge(x,z),yl=g0-(off*off*.35+off*.5),ys=sea(x,z);pos.push(x,Math.max(yl,ys),z);uv.push(x/4,z/4);
      t.copy(A).lerp(C3,Math.max(0,g0*2.2)).lerp(C2,Math.max(0,-g0*2.6)).lerp(CP,.82*ss(2.3,.9,pathD(x,z))).lerp(C2,Math.min(.6,off*.12));
      if(yl<ys+.6)t.lerp(t2.copy(CS).lerp(CS2,Math.min(1,Math.max(0,(ys-SEA)*1.5+.45))),ss(ys+.6,ys-.1,yl));col.push(t.r,t.g,t.b);}
    for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const a=j*(NX+1)+i,b=a+1,c=a+NX+1,d=c+1;idx.push(a,c,b,b,c,d);}
    {const b=pos.length/3,I=[[X0+2,Z0+2],[X1-2,Z0+2],[X1-2,Z1-2],[X0+2,Z1-2]],O=[[-900,-900],[900,-900],[900,900],[-900,900]];[...I,...O].forEach(([x,z])=>{pos.push(x,SEA-.35,z);uv.push(x/4,z/4);col.push(CS.r,CS.g,CS.b);});
      for(let k=0;k<4;k++){const a=b+k,a2=b+(k+1)%4,o=b+4+k,o2=b+4+(k+1)%4;idx.push(a,a2,o,a2,o2,o);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
    const mat=sbMat('#ffffff');mat.vertexColors=true;var ground=new THREE.Mesh(geo,mat);ground.name='venus-cloud';ground.receiveShadow=true;ground.frustumCulled=false;add(ground);}
  /* ── 하늘·안개: 위쪽은 보라, 지평선은 연보라(해돋이 뒤에는 살구빛) + 서쪽 지평선의 금빛·살구빛 띠(아래 band). 안개는 진행에 따라(fogWant → SK.fogPush) ── */
  const PRE={top:'#a386d6',horizon:'#dcc6ec',hemi:'#ecdefa',ground:'#b294d4',hemiI:.82,sun:'#ffe8d2',sunI:.34,sunDir:[9,-3.0,0],fill:.3,fog:'#d5bee9',fogNear:3,fogFar:24,stars:0,milky:0},
    POST={...PRE,top:'#a88ede',horizon:'#f3cdb4',hemi:'#fbe9de',ground:'#c3a2d2',hemiI:.8,sun:'#ffd29a',sunI:.56,fog:'#e9c6c8'};
  const SPACEV={...POST,via:{horizon:'#b79be0',top:'#6a56b4',hemi:'#e6d8f8',ground:'#a58cce',sun:'#fbe6e6'}, /* 2026-11-27: 우주로 넘어가는 가운데를 연보라로(복숭아빛 → 남색이 곧게 섞여 잠깐 탁한 회갈색 화면이 됐다) */top:'#151331',horizon:'#2b2560',hemi:'#d9ccf4',ground:'#8a76b4',hemiI:.72,sun:'#fff4e0',sunI:.55,fog:'#d2bce8'}; /* 셋째 칸 = 우주(얼음 배로 떠날 때). 안개 색 = 하늘 지평선 색(2026-11-22 — 예전 구름 빛 안개는 하늘이 어두워진 뒤 안개에 묻힌 구름 바닥이 연보라 네모 판으로 드러났다): 올라갈수록 바닥이 하늘과 같은 어둠에 묻혀 사라짐 */
  const SK=G.sky.sky({parent:root,keys:[PRE,POST,SPACEV],t:F[K.sun]?1:0,nStars:0});
  const fogWant=()=>!F[K.met]?[0,0]:!F[K.sun]?[3,30]:!F[K.plaza]?[8,84]:[26,215];
  /* ── 물체: A = 구름 기둥·문·둔덕·먼 구름 섬·구름 탑(그림자 안 드리움 — 기둥은 그림자 판) / V = 마을(집·나무·우체통·양·해시계 — 컴퓨터는 진짜 그림자) ── */
  const A=[],V=[],shadows=[],placed=[[c0,c1,PLZ.R+2.6],[SEC[0],SEC[1],1.2],[CAKE[0],CAKE[1],.8],[0,0,3],[MUNGE[0],MUNGE[1],2]],bl=[],smokes=[],houses=[],sheep=[];
  placed.push([8.2,-2.6,2.4],[-1.5,-6.5,1.6],[1.5,-4.4,.8],[PAD[0],PAD[1],2.4],[LAND[0],LAND[1],1.6],[START[0],START[1],3],[DDO0[0],DDO0[1],1.2],[GG0[0],GG0[1],.8],[GGP[0],GGP[1],.8]);placed.push([GC[0],GC[1],RES],[PC[0],PC[1],PR+1.4],[BAR[0],BAR[1],1.6]);const faces=[],flagsAt=[],pinsAt=[],lamps=[],FC=['#f59ab5','#8fd6c2','#ffd27a','#b7a4ea'];
  for(const dx of [10,14,18,22])placed.push([c0+dx,c1+.4,3.4]); /* 광장 동쪽(해돋이를 원더룹 뒤에서 보는 카메라 자리 — 세로 화면은 17m 뒤)은 비워 둠 */
  const freeAt=(x,z,r)=>placed.every(p=>Math.hypot(x-p[0],z-p[1])>r+p[2]+.4);
  const nrm=s=>{const a=pointAt(s-.5),b=pointAt(s+.5),l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [(b[1]-a[1])/l,-(b[0]-a[0])/l];};
  /* 길 s 자리에서 옆(side)으로 off만큼 — 길(모든 구간)에서 r+clear 넘게 떨어지고 다른 것과 안 겹치는 첫 자리 */
  const along=(s,side,off,r,clear)=>{for(const o of [off,off+1.3,off+2.6])for(const sd of [side,-side]){const p=pointAt(s),n=nrm(s),x=p[0]+n[0]*sd*o,z=p[1]+n[1]*sd*o;
    if(pathD(x,z)>=r+clear&&freeAt(x,z,r)&&x>BX[0]+2&&x<BX[1]-2&&z>BX[2]+2&&z<BX[3]-2){placed.push([x,z,r]);return [x,z];}}return null;};
  const toPath=p=>{const n=proj(p[0],p[1]).pt;return Math.atan2(n[0]-p[0],n[1]-p[1]);};
  const pillar=(x,z,h,seed,sl=6.2,sw=1.5)=>{A.push(...pillarParts(x,z,groundY(x,z),h,seed));obstacles.push({c:[x,z,.78]});shadows.push([x,z,sl,sw]);};
  /* 또생일 자리(첫 미션 — 마을 입구 쪽 길 옆): 구름 단상(원더룹 눈높이) + 작은 식탁 위 케이크 / 그 옆 바람길 출발 발판(구름 발판 + 깃대) */
  const PODH=.72,TBH=.8;V.push(...podiumParts(SEC[0],SEC[1],groundY(...SEC),PODH),...tableParts(CAKE[0],CAKE[1],groundY(...CAKE),TBH));obstacles.push({c:[SEC[0],SEC[1],.62]},{c:[CAKE[0],CAKE[1],.55]});bl.push([SEC[0],SEC[1],.75],[CAKE[0],CAKE[1],.6]);lamps.push([CAKE[0],groundY(...CAKE)+TBH+.5,CAKE[1]]);
  const MH=.56;{const gy=groundY(...DDO0);A.push([puff(.75,DDO0[0],gy+.1,DDO0[1],[1.25,.62,1.25]),'#fbe6f0'],[puff(.45,DDO0[0]+.7,gy+.05,DDO0[1]+.35,[1.2,.6,1.2]),'#f6d2e2'],[puff(.4,DDO0[0]-.65,gy+.05,DDO0[1]-.4,[1.2,.6,1.2]),'#fff6e6']);obstacles.push({c:[DDO0[0],DDO0[1],.7]});bl.push([DDO0[0],DDO0[1],.85]);} /* 처음 만나는 자리의 작은 구름 둔덕(또생일이 올라서 있음) */
  for(let i=0;i<8;i++){const a=i/8*PI*2,r=i%2?1.25:1.0;A.push([puff(.62,PAD[0]+Math.cos(a)*r,groundY(...PAD)+.05,PAD[1]+Math.sin(a)*r,[1.2,.42,1.2]),i%2?'#fff6e6':'#fbe6f0']);}A.push([puff(1.0,PAD[0],groundY(...PAD)+.02,PAD[1],[1.3,.3,1.3]),'#fffaf0']);
  {const x=PAD[0]+2.7,z=PAD[1]+.3,gy=groundY(x,z);V.push(...poleParts(x,z,gy,3));flagsAt.push([x,gy+2.9,z,'#f59ab5']);}
  /* 바람길 둘레 구름 섬(북쪽 구름 바다 위 — 그 사이를 날아감) */
  for(const [x,z,y,r] of [[40,25,1,5],[28,34,2,6],[30,20,-.3,3.6],[18,20,.4,4.4],[10,29,1.6,5.5],[20,32,-.2,3.4],[2,18,.6,4],[36,-16,4.4,5],[19,-15,5,5.5]]) /* 바람길 아래·옆(구름 바다 위 낮게 — 사이로 바다가 보임) */{A.push([puff(r,x,y,z,[1.3,.3,1.05]),'#f3e9fc']);A.push([puff(r*.6,x+r*.7,y+.3,z-r*.4,[1.2,.34,1]),'#e3d2f4']);A.push([puff(r*.5,x-r*.6,y-.2,z+r*.5,[1.2,.36,1]),'#eadcf8']);}
  /* 구름 집 넷(지붕이 위 — 평범한 집): 길 양옆에 번갈아(문이 길 쪽), 등불이 켜진 집 셋, 지붕 꼭대기 깃발은 모두 서쪽으로 펄럭임 */
  const HC=[{wall:'#f8ecd8',roof:'#e59ab4',trim:'#c9788f',win:'#ffd98a',lit:1},{wall:'#ece4fb',roof:'#9a86d6',trim:'#7c69b8'},{wall:'#e4f4ec',roof:'#7fc4b0',trim:'#5fa693',win:'#ffd98a',lit:1},{wall:'#fdeed6',roof:'#f0b072',trim:'#d18f52',win:'#ffd98a',lit:1}];
  const HS=[];
  [[12.5,1],[36,-1],[45,1],[56,-1]].forEach(([s,sd],i)=>{const p=along(s,sd,5,1.9,1.7);if(!p)return;const h=houseParts(p[0],p[1],groundY(...p),toPath(p),HC[i]);HS.push({p,parts:[...h.parts,...poleParts(h.top[0],h.top[2],h.top[1]-.15,1.1)]});obstacles.push({c:[p[0],p[1],1.75]});smokes.push(h.smoke);houses.push(p);bl.push([p[0],p[1],1.75]);if(HC[i].lit)lamps.push(h.win);flagsAt.push([h.top[0],h.top[1]+.88,h.top[2],FC[i%4]]);});
  /* 집은 카메라와 원더룹 사이에 오면 흐려진다(지붕이 화면을 덮었다): 컴퓨터는 한 채씩 따로, 휴대폰은 넷을 한 덩어리로(그리기 1 — 한 채가 가리면 넷이 함께 흐려짐, 2026-11-19 드로우콜 줄이기) */
  {const mk=(list)=>{const m=lump(list.flatMap(h=>h.parts),true,.6),g=new THREE.Group(),c=list[0].p,gy=groundY(...c);g.name='venus-house';g.position.set(c[0],gy,c[1]);m.position.set(-c[0],-gy,-c[1]);m.frustumCulled=false;g.add(m);add(g);
      G.occlude.add(g,2.1,3.6,{near:true,speed:6,boxes:list.map(h=>new THREE.Box3(new THREE.Vector3(h.p[0]-1.7,groundY(...h.p)-.2,h.p[1]-1.7),new THREE.Vector3(h.p[0]+1.7,groundY(...h.p)+3.5,h.p[1]+1.7)))});};
    if(!MOB)HS.forEach(h=>mk([h]));}
  /* 조는 구름 양 넷 · 우체통 · 작은 해시계 넷(눈금은 반시계 방향) · 깃대와 바람개비 · 우산 나무(길 양옆) */
  [[35,1],[49,-1],[61,1]].forEach(([s,sd],i)=>{const p=along(s,sd,2.9,.5,2.1);if(!p)return;const gy=groundY(...p);V.push(...sheepParts(p[0],p[1],gy,toPath(p)+(i%2?1:-1)*.9,i));obstacles.push({c:[p[0],p[1],.42]});sheep.push(p);bl.push([p[0],p[1],.55]);});
  [[11.5,-1]].forEach(([s,sd])=>{const p=along(s,sd,2.6,.3,2);if(p)V.push(...mailboxParts(p[0],p[1],groundY(...p),toPath(p)));});
  /* 구름 양 울타리(마을 덩어리에 함께 — 그리기 0 추가): 원더룹은 말뚝을 못 지나감(문으로만 드나듦) */
  V.push(...fenceParts(PC[0],PC[1],PR,GATEA,GHALF,groundY));for(let i=0;i<=22;i++){const a=GATEA+GHALF+(PI*2-GHALF*2)*i/22;obstacles.push({c:[PC[0]+Math.cos(a)*PR,PC[1]+Math.sin(a)*PR,.3]});}
  let stopDial=null; /* 둘째 해시계(마을 입구 대사가 끝날 즈음) = 거꾸리가 한 번 멈춰 그림자를 보여 주는 자리 */
  [[19.5,1],[33,-1],[47,1],[59,-1]].forEach(([s,sd],i)=>{const p=along(s,sd,2.8,.6,2);if(!p)return;if(!stopDial&&s>GL_S+RES)stopDial=p; /* 빈터를 지난 뒤 첫 해시계(2026-11-21 — 예전 '둘째 해시계'(33m) 자리는 양 몰기 빈터·구름 둑과 겹쳐 세워지지 않았고, 그래서 이 대사가 한 번도 안 나왔다) */V.push(...sundialParts(p[0],p[1],groundY(...p),1,faces,1,{wedge:true}));obstacles.push({c:[p[0],p[1],.6]});bl.push([p[0],p[1],.7]);});
  [[13,1],[24,-1],[30,1],[38,-1],[45,-1],[51,1],[57,1],[63,-1]].forEach(([s,sd],i)=>{const p=along(s,sd,2.4,.25,1.9);if(!p)return;const gy=groundY(...p),pin=i%3===1,h=pin?2.1:2.8;V.push(...poleParts(p[0],p[1],gy,h));(pin?pinsAt:flagsAt).push([p[0],gy+h-(pin?0:.1),p[1],FC[i%4]]);});
  {let k=0;for(let s=12.5;s<S_PIN-2;s+=5.4,k++){const p=along(s,k%2?1:-1,5.2,1.2,3.6);if(!p)continue;V.push(...treeParts(p[0],p[1],groundY(...p),k,.9+.25*((k*7)%5)/4));obstacles.push({c:[p[0],p[1],1.2]});bl.push([p[0],p[1],.95]);}}
  /* 광장: 출구 넷(들어오는 북쪽 포함) 양옆 구름 기둥 여덟(긴 그림자가 동쪽으로) + 사이사이 우산 나무 넷 + 해시계 */
  for(let k=0;k<4;k++){for(const sg of [-1,1]){const a=k*PI/2+sg*.37;pillar(c0+Math.cos(a)*7.5,c1+Math.sin(a)*7.5,3.6,30+k*2+sg,9.4,1.7);}
    const a=k*PI/2+PI/4,x=c0+Math.cos(a)*8.4,z=c1+Math.sin(a)*8.4;V.push(...treeParts(x,z,groundY(x,z),k+1,1.15));obstacles.push({c:[x,z,1.4]});placed.push([x,z,1.4]);bl.push([x,z,1]);}
  {V.push(...sundialParts(c0,c1,groundY(c0,c1),2.7,faces,.42,{pyr:true}));obstacles.push({c:[c0,c1,1.6]});shadows.push([c0,c1,1.47,.78,.66],[c0+1.5,c1,5.2,.7]); /* 바늘 그림자: 판 위(가운데 → 동쪽 '6' 눈금) + 판 너머 땅으로 길게 */bl.push([c0,c1,1.75]);} /* 광장 한가운데 큰 해시계(바늘이 꽂혀 있음) — 해가 뜨면 바늘 그림자도 기둥 그림자와 함께 동쪽으로 길게 */
  /* 구름 문: 큰 기둥 둘 + 위를 잇는 구름 아치 + 양옆 구름 둑(돌아갈 수 없게) */
  for(const s of [-1,1]){pillar(GATE[0],GATE[1]+s*2.6,4.2,20+s,7.5,2);for(let i=0;i<7;i++){const a=i/6*PI,y=groundY(...GATE)+3.5+Math.sin(a)*.9;if(s>0)A.push([puff(.62+Math.sin(i*2.3)*.08,GATE[0]+Math.sin(i*1.9)*.12,y,GATE[1]+Math.cos(a)*2.6),['#f1e6fb','#e6d6f6','#f8f1fd'][i%3]]);}
    for(let k=0;k<5;k++){const z=GATE[1]+s*(4.5+k*1.9),x=GATE[0]+Math.sin(k*1.7+s)*.5,r=1.25-k*.06;A.push([puff(r,x,groundY(x,z)+r*.55,z,[1,.85,1]),['#e6d6f6','#f1e6fb','#dccaf0'][k%3]]);obstacles.push({c:[x,z,r*.9]});}}
  /* 길가 구름 둔덕(막지 않음) */
  for(let i=0;i<(MOB?24:36);i++){const x=RR(BX[0]+2,BX[1]-1),z=RR(BX[2]+1,BX[3]-1),d=pathD(x,z),r=RR(.5,1.15);if(d<3.4||d>10||!freeAt(x,z,r))continue;
    A.push([puff(r,x,groundY(x,z)+r*.3,z,[1.25,.6,1.1]),['#efe4fa','#e3d2f4','#f6eefd'][i%3]]);if(i%3===0)A.push([puff(r*.55,x+r*.8,groundY(x,z)+r*.2,z+r*.3,[1.2,.6,1]),'#e3d2f4']);}
  /* 먼 배경: 걷는 땅 밖에 높이가 다른 구름 섬 + 멀리 겹겹이 솟은 구름 탑(안개가 걷힐수록 멀리까지 보임). 서쪽 해 자리(±0.3라디안)와 구름 끝 앞바다는 비움 */
  {const RF=rng('space-venus:far'),rf=(a,b)=>a+RF()*(b-a),lo=(r,x,y,z,s)=>new THREE.SphereGeometry(r,7,5).applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(...(s||[1,1,1])))),IC=['#eadcf8','#dccaf0','#f3e9fc','#d2bdea'];
    const shipWay=(x,z,r)=>{const ax=x-DOCK[0],az=z-DOCK[1],al=ax*-.612+az*-.791,pp=Math.abs(ax*-.791-az*-.612);return al>-6&&pp<al*.42+14+r;};
    for(let i=0,n=0;i<120&&n<(MOB?12:17);i++){const x=rf(-150,100),z=rf(-98,66),r0=rf(5,10);if((x>BX[0]-15&&x<BX[1]+15&&z>BX[2]-15&&z<BX[3]+15)||shipWay(x,z,r0))continue;n++;
      const r=r0,y=rf(-.4,7.5);A.push([lo(r,x,y,z,[1.35,.3,1.05]),IC[n%4]]);for(let k=0;k<3;k++){const a=rf(0,PI*2),q=r*rf(.45,.7);A.push([lo(q,x+Math.cos(a)*r*.8,y+rf(-.4,.5),z+Math.sin(a)*r*.7,[1.2,.36,1]),IC[(n+k+1)%4]]);}
      if(n%3===0){let yy=y+r*.25,q=r*.34;for(let k=0;k<3;k++){A.push([lo(q,x+rf(-1,1),yy+q*.7,z+rf(-1,1)),IC[(n+k)%4]]);yy+=q*1.1;q*=.74;}}}
    const NT=MOB?11:15;for(let i=0;i<NT;i++){const a=i/NT*PI*2+rf(-.12,.12);if(Math.abs(Math.atan2(Math.sin(a-PI),Math.cos(a-PI)))<.3)continue;const d=rf(100,185),x=-45+Math.cos(a)*d,z=-12+Math.sin(a)*d;let y=SEA-2,r=rf(9,13.5);if(shipWay(x,z,r))continue;
      for(let k=0;k<6;k++){A.push([lo(r,x+rf(-2.2,2.2),y+r*.6,z+rf(-2.2,2.2),[1,.92,1]),k>3?'#f1e6fb':['#c6aee4','#d2bdea','#bda2de'][k%3]]);y+=r*1.05;r*=.8;}}}
  const sailHide=[];let pieceU=null;
  if(MOB){ /* 휴대폰: 기둥·먼 배경·마을 소품·집 넷을 모두 한 덩어리로(그리기 1). 집은 정점에 조각 번호(wlPiece)를 적어, 카메라와 원더룹 사이에 낀 그 집만 점무늬로 흐려진다(game/occlude pieces always — 그리기 0 추가) */
    const all=[...A.map(p=>[p,0]),...V.map(p=>[p,0])];HS.forEach((h,i)=>h.parts.forEach(p=>all.push([p,i+1])));const cnt=all.map(([p])=>p[0].index?p[0].index.count:p[0].attributes.position.count);
    const m=lump(all.map(a=>a[0]),false,.6),pc=new Float32Array(m.geometry.attributes.position.count);let o=0;all.forEach(([,id],i)=>{pc.fill(id,o,o+cnt[i]);o+=cnt[i];});m.geometry.setAttribute('wlPiece',new THREE.BufferAttribute(pc,1));
    m.name='venus-town';m.frustumCulled=false;add(m);const boxes={};HS.forEach((h,i)=>{boxes[i+1]=new THREE.Box3(new THREE.Vector3(h.p[0]-1.7,groundY(...h.p)-.2,h.p[1]-1.7),new THREE.Vector3(h.p[0]+1.7,groundY(...h.p)+3.5,h.p[1]+1.7));});G.occlude.pieces({meshes:[m],boxes,always:true});pieceU=m.userData.wlFade;}
  else{{const m=lump(A,false,.6);m.name='venus-pillars';m.frustumCulled=false;add(m);}
  {const m=lump(V,true,.6);m.name='venus-town';m.frustumCulled=false;m.receiveShadow=false;add(m);sailHide.push([m,44]);}}
  /* 해시계 그림(금빛 판·반시계 숫자 눈금) 한 덩어리 */
  if(faces.length){const pos=[],uv=[];faces.forEach(g=>{const q=g.toNonIndexed(),pp=q.attributes.position,u=q.attributes.uv;for(let i=0;i<pp.count;i++){pos.push(pp.getX(i),pp.getY(i),pp.getZ(i));uv.push(u.getX(i),u.getY(i));}});const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));const m=new THREE.Mesh(geo,dialMat());m.name='venus-dials';m.frustumCulled=false;m.userData.noMerge=true;add(m);sailHide.push([m,44]);}
  /* 서풍(금성 구름 꼭대기는 바람이 서쪽으로 아주 빠르게 분다): 깃발은 모두 서쪽(-x)으로 펄럭이고 바람개비는 돈다 — 한 덩어리, 꼭짓점만 CPU로 */
  const windMesh=(()=>{const pos=[],col=[],idx=[],it=[],c=new THREE.Color(),NF=5;
    flagsAt.forEach(([x,y,z,cl],k)=>{const b=pos.length/3;c.set(cl);for(let i=0;i<=NF;i++)for(let j=0;j<2;j++){pos.push(x,y,z);const d=(i%2?.82:1);col.push(c.r*d,c.g*d,c.b*d);}for(let i=0;i<NF;i++){const a=b+i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}it.push({f:1,b,x,y,z,k});});
    pinsAt.forEach(([x,y,z,cl],k)=>{const b=pos.length/3;for(let i=0;i<4;i++){c.set(FC[(i+k)%4]);for(let j=0;j<3;j++){pos.push(x,y,z);col.push(c.r,c.g,c.b);}idx.push(b+i*3,b+i*3+1,b+i*3+2);}it.push({f:0,b,x,y,z,k});});
    const geo=new THREE.BufferGeometry(),pa=new THREE.Float32BufferAttribute(pos,3);geo.setAttribute('position',pa);geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Array(pos.length/3*2).fill(.5),2));geo.setIndex(idx);
    const mat=sbMat('#ffffff');mat.vertexColors=true;mat.side=THREE.DoubleSide;const me=new THREE.Mesh(geo,mat);me.name='venus-flags';me.frustumCulled=false;me.userData.noMerge=true;add(me);sailHide.push([me,44]);
    function tick(t){const a=pa.array;for(const o of it){if(o.f){for(let i=0;i<=NF;i++){const u=i/NF,w=Math.sin(t*8-i*1.15+o.k*1.7)*.1*u+Math.sin(t*3.1+o.k)*.05*u,q=(o.b+i*2)*3;a[q]=o.x-u*1.25;a[q+1]=o.y-.08*u+w*.4;a[q+2]=o.z+w;a[q+3]=o.x-u*1.25;a[q+4]=o.y-.55+.2*u+w*.4;a[q+5]=o.z+w*1.15;}}
        else{const r0=t*7+o.k;for(let i=0;i<4;i++){const an=r0+i*PI/2,q=(o.b+i*3)*3;a[q]=o.x-.07;a[q+1]=o.y;a[q+2]=o.z;a[q+3]=o.x-.07;a[q+4]=o.y+Math.sin(an)*.42;a[q+5]=o.z+Math.cos(an)*.42;a[q+6]=o.x-.07;a[q+7]=o.y+Math.sin(an+.95)*.26;a[q+8]=o.z+Math.cos(an+.95)*.26;}}}
      pa.needsUpdate=true;}
    tick(0);geo.computeVertexNormals();return {me,tick};})();
  /* 서쪽으로 흘러가는 구름 줄기(가까운 낮은 줄기 + 높은 하늘의 긴 줄기): 원더룹 둘레에서 끝없이 이어짐 — 한 덩어리 */
  const wisps=(()=>{const N=MOB?26:40,pos=new Float32Array(N*12*3),col=new Float32Array(N*12*4),idx=[],it=[],RW=rng('space-venus:wisps');
    for(let i=0;i<N;i++){const hi=i%4===0,len=hi?26+RW()*18:5+RW()*6,o={hi,len,ox:RW()*140,oz:RW()*100,y:hi?22+RW()*26:2.6+RW()*7.5,v:(hi?13:8.5)+RW()*4,th:hi?.75:.11+RW()*.07};it.push(o);
      for(let k=0;k<2;k++){const b=i*12+k*6;for(let j=0;j<6;j++){const q=(b+j)*4;col[q]=col[q+1]=col[q+2]=1;col[q+3]=(j===2||j===3)?(hi?.5:.62):0;}idx.push(b,b+1,b+2,b+1,b+3,b+2,b+2,b+3,b+4,b+3,b+5,b+4);}}
    const geo=new THREE.BufferGeometry(),pa=new THREE.BufferAttribute(pos,3);geo.setAttribute('position',pa);geo.setAttribute('color',new THREE.BufferAttribute(col,4));geo.setIndex(idx);
    const mat=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false,opacity:.8});mat.userData.noStorybook=true;const me=new THREE.Mesh(geo,mat);me.name='venus-wisps';me.frustumCulled=false;me.userData.noMerge=true;me.renderOrder=2;add(me);
    function tick(t,px,pz,py=0,k=0){const TH=1+1.3*k;for(let i=0;i<N;i++){const o=it[i],xr=((((o.ox-t*o.v-px)%140)+140)%140)-70,x=px+(o.hi?xr:xr*(1-.55*k)),zr=((((o.oz-pz)%100)+100)%100)-50,z=pz+(o.hi?zr:zr*(1-.84*k)),y=(o.hi?o.y:lerp(o.y,py-2.2+(o.y-2.6)*.75,k))+Math.sin(t*.7+i)*.25; /* k(바람 타는 중): 낮은 줄기가 원더룹 높이 둘레로 모여 옆을 휙휙 지나감 */
        for(let k=0;k<2;k++)for(let j=0;j<6;j++){const q=(i*12+k*6+j)*3,u=(j>>1)/2,s=(j&1)?1:-1;pos[q]=x-u*o.len;pos[q+1]=y+(k?0:s*o.th*TH)+Math.sin(u*3+t+i)*.12*(o.hi?3:1);pos[q+2]=z+(k?s*o.th*TH:0);}}
      pa.needsUpdate=true;}
    return {me,tick,mat};})();
  /* 그림자 판(기둥 — 해돋이 전에는 안 보이고 해가 뜨면 동쪽으로 길게 나타남) */
  let shMat,shMesh;
  {/* 색·진하기는 정점 색으로(기둥 = 연보라 .74, 해시계 판 위 = 짙은 보라 .93). 흰 그림 + 알파만 — 화소마다 계산(game/glowtex) */
    const sm=(a,b,x)=>Math.max(0,Math.min(1,(x-a)/(b-a))),tex=gradTex(128,32,(u,v)=>[255,255,255,(u<.7?1-u/.7*.19:.81*(1-(u-.7)/.3))*Math.min(sm(0,.22,v),sm(1,.78,v))]);
    const pos=[],uv=[],col=[],idx=[],N=7,CS=new THREE.Color('#5c3e8c'),CD=new THREE.Color('#3a2452');
    shadows.forEach(([x,z,L,W,yo])=>{const b=pos.length/3,px=-SHD[1],pz=SHD[0];for(let i=0;i<=N;i++){const u=i/N,w=W*(1-(yo?.94:.25)*u)/2;for(const s of [-1,1]){const X=x+SHD[0]*L*u+px*w*s,Z=z+SHD[1]*L*u+pz*w*s;pos.push(X,yo?groundY(x,z)+yo:groundY(X,Z)+.05,Z);if(yo){uv.push(u*.55,s>0?.7:.3);col.push(CD.r,CD.g,CD.b,.93);}else{uv.push(u,s>0?1:0);col.push(CS.r,CS.g,CS.b,.74);}}} /* yo(판 위 그림자): 끝이 뾰족한 세모, 가장자리·끝이 흐려지지 않게 그림의 진한 가운데만 씀 */
      for(let i=0;i<N;i++){const a=b+i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}});
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,4));geo.setIndex(idx);
    shMat=new THREE.MeshBasicMaterial({map:tex,vertexColors:true,transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});shMat.userData.noStorybook=true;
    shMesh=new THREE.Mesh(geo,shMat);shMesh.name='venus-shadows';shMesh.frustumCulled=false;shMesh.renderOrder=1;shMesh.userData.noMerge=true;add(shMesh);sailHide.push([shMesh,19]);}
  /* 서쪽 지평선의 금빛·살구빛 띠 + 해(둘 다 카메라를 따라다니는 빛 판 — 안개 끝 바로 안쪽에 두어 가까운 물체에는 가려짐) */
  const glowTex=radialTex(128,[[0,255,250,236,1],[.18,255,240,214,.7],[.5,255,226,204,.22],[1,255,226,204,0]]); /* 빛 그림은 화소마다 계산(game/glowtex — 캔버스 그러데이션은 아이폰에서 녹색 점 무리가 됐다, docs/green-dots.md) */
  const sunTex=radialTex(128,[[0,255,246,200,1],[.19,255,232,150,1],[.24,255,206,120,.7],[.5,255,190,130,.26],[1,255,180,140,0]]);
  const bandTex=radialTex(128,[[0,255,214,130,.95],[.3,255,190,140,.6],[.65,246,170,170,.22],[1,246,170,170,0]],{w:256,h:128});
  const spr=(tex,name)=>{const m=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,fog:false,opacity:.5});m.userData.noBend=true;m.userData.noStorybook=true;const s=new THREE.Sprite(m);s.name=name;s.userData.noMerge=true;s.frustumCulled=false;add(s);return s;};
  const band=spr(bandTex,'venus-westglow'),glow=spr(sunTex,'venus-sun');
  /* ── 주민·배·비행선 ── */
  const gg=makeGeokkuri(),munge=makeMunge(),ddo=makeDdo(),cake=makeCake(),boat=makeIceBoat(),ship=makeAirship(),umb=makeUmbrella(),breath=makeBreath(MOB),cands=CAND.map((c,i)=>makeCandle(CCOL[i]));
  [gg.root,munge.root,ddo.root,cake.g,boat].forEach(o=>{add(o);markChar(o);});boat.visible=false;gg.root.visible=false;add(ship);ship.scale.setScalar(.85);add(breath.me);add(umb);umb.visible=false;markChar(umb);cands.forEach(c=>{add(c);c.scale.setScalar(1.5);});
  munge.root.position.set(MUNGE[0],groundY(...MUNGE),MUNGE[1]);munge.root.rotation.y=Math.atan2(GS[0]-MUNGE[0],GS[1]+1.5-MUNGE[1]);obstacles.push({c:[MUNGE[0],MUNGE[1],1.25]});
  /* 또생일: 부탁하기 전에는 처음 만나는 자리(동쪽 시작 지점 옆 구름 둔덕), 부탁한 뒤에는 먼저 날아가 파티장 단상에서 기다림 */
  const ddoHome=(party=F[K.ask])=>{if(party){ddo.root.position.set(SEC[0],groundY(...SEC)+PODH,SEC[1]);ddo.root.rotation.y=Math.atan2(LAND[0]-SEC[0],LAND[1]-SEC[1]);}else{ddo.root.position.set(DDO0[0],groundY(...DDO0)+MH,DDO0[1]);ddo.root.rotation.y=Math.atan2(START[0]-DDO0[0],START[1]-DDO0[1]);}ddo.root.scale.setScalar(1);};ddoHome();const candOn=CAND.map(()=>false);
  cake.g.position.set(CAKE[0],groundY(...CAKE)+TBH+.03,CAKE[1]);cake.candles(!!F[DISC.day]);cake.lit(false);
  /* 등불이 켜진 집 창문·식탁 위의 따뜻한 빛(더하기 점 한 덩어리 — 작게: 큰 빛 판은 가까이서 카메라 앞을 뿌옇게 가렸다) */
  if(!MOB){const pos=[];lamps.forEach(l=>pos.push(l[0],l[1],l[2]));const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));const m=new THREE.PointsMaterial({map:glowTex,size:1.3,color:'#ffc66e',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.6,fog:false});m.userData.noStorybook=true;const pt=new THREE.Points(geo,m);pt.name='venus-lamps';pt.frustumCulled=false;pt.userData.noMerge=true;add(pt);}
  const blobs=blobMany(4+bl.length);if(blobs){blobs.frustumCulled=false;add(blobs);bl.forEach((b,i)=>blobs.set(4+i,b[0],groundY(b[0],b[1])+.03,b[1],b[2]));}
  const puffs=points(root,MOB?90:150,{map:glowTex,add:false,size:.6,grav:-.04,drag:1.6});keep.push(puffs.pts);
  const puffAt=(x,z,n,sp=.9,col=[.95,.9,1])=>{const y=groundY(x,z);for(let i=0;i<n;i++){const a=Math.random()*PI*2,r=.2+Math.random()*.6,v=sp*(.4+Math.random()*.7),k=.88+Math.random()*.12;puffs.emit(x+Math.cos(a)*r,y+.15+Math.random()*.5,z+Math.sin(a)*r,Math.cos(a)*v,.3+Math.random()*.6,Math.sin(a)*v,1.3+Math.random()*1.2,[col[0]*k,col[1]*k,col[2]*k]);}};
  /* ── 구름 양 몰기: 양 다섯 = 한 묶음(그리기 1, 50m 밖은 안 그림) · 빈터 뒤 구름 둑(다 몰면 걷히고 지움) ── */
  const HD=HERD0.map((p,i)=>F[K.sheep]?{x:PC[0]+Math.cos(i*2.4)*1.15,z:PC[1]+Math.sin(i*2.4)*1.15,vx:0,vz:0,ry:i*1.3,ph:i,in:true,hop:0}:{x:p[0],z:p[1],vx:0,vz:0,ry:Math.atan2(GC[0]-p[0],GC[1]-p[1])+i,ph:i*1.7,in:false,hop:0}),SG={started:false,on:false,done:!!F[K.sheep],n:F[K.sheep]?5:0,open:0,opening:false,t0:0};
  const sheepM=(()=>{const src=lump(herdSheepParts(),!MOB,.6),m=new THREE.InstancedMesh(src.geometry,src.material,5);m.name='venus-sheep';m.frustumCulled=false;m.castShadow=!MOB;m.userData.noMerge=true;add(m);markChar(m); /* 멀리서 내려다보는 카메라에서도 안개에 묻히지 않게 */return m;})();
  const _sm=new THREE.Matrix4(),_sq=new THREE.Quaternion(),_sv=new THREE.Vector3(),_ss=new THREE.Vector3(),_sy=new THREE.Vector3(0,1,0);
  const barObs=[];let barM=null;if(!SG.done){const L=[],bd=(()=>{const a=pointAt(BAR_S-.5),b=pointAt(BAR_S+.5),l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [(b[0]-a[0])/l,(b[1]-a[1])/l];})(),nx=-bd[1],nz=bd[0];for(let k=-2;k<=2;k++){const ox=nx*k*1.45+bd[0]*Math.sin(k*2.1)*.3,oz=nz*k*1.45+bd[1]*Math.sin(k*2.1)*.3,r=1.12-Math.abs(k)*.08;L.push([puff(r,ox,r*.62,oz,[1,.9,1]),['#f1e6fb','#e6d6f6','#fbf6ff'][(k+2)%3]],[puff(r*.6,ox+nx*.5,r*1.25,oz+nz*.5),'#fbf6ff']);const o={c:[BAR[0]+ox,BAR[1]+oz,r*.92]};obstacles.push(o);barObs.push(o);}
    barM=lump(L,false,.6);barM.name='venus-sheep-gate';barM.position.set(BAR[0],groundY(...BAR),BAR[1]);barM.frustumCulled=false;barM.userData.noMerge=true;add(barM);}
  /* 뭉게 머리 위 '?'·'!' · 조는 양 위 작은 z(화면 표시 — 그리기 0) */
  if(!document.getElementById('vnMarkCss')){const s=document.createElement('style');s.id='vnMarkCss';s.textContent='.vn-mark{font:900 3.5rem/1 Jua,sans-serif;color:#5b3a8c;-webkit-text-stroke:.1em #fff;paint-order:stroke fill;filter:drop-shadow(0 3px 0 rgba(90,60,140,.4))}.vn-mark.al{color:#ff9455;-webkit-text-stroke-color:#fff6ea}.vn-z{font:700 1.5rem/1 Jua,sans-serif;color:#6a5a8a;text-shadow:0 1px 0 #fff,0 0 6px #fff}.vn-z i{display:inline-block;font-style:normal;animation:vnz 2.4s ease-in-out infinite}.vn-z i+i{font-size:.8em;animation-delay:.5s;margin-left:.15em}@keyframes vnz{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-6px);opacity:1}}@media (prefers-reduced-motion:reduce){.vn-z i{animation:none}}';document.head.appendChild(s);}
  const qmark=G.float.add({root:munge.root,y:2.12,cls:'vn-mark',text:'?',far:40,prio:3,clamp:true});qmark.show(false);
  sheep.forEach(p=>floats.push(G.float.add({at:[p[0],groundY(...p),p[1]],y:.95,cls:'vn-z',html:'<i>z</i><i>z</i>',far:4.2,prio:0})));
  /* ── 상태 ── */
  const pend=RIDE.pending||(/[?&]arrive\b/.test(location.search)&&!F[K.met]?{cloud:true}:null);RIDE.pending=null; /* 2026-11-26: 어디서 오든(순서대로·지도에서 골라) 같은 반짝이 착지 */ /* ?arrive: 시험용 — 주소로 바로 열어도 내려앉는 연출부터 */
  let arr=null,started=false;
  const st={arrDone:!pend,scene:false,lastQ:null,fog:[...fogWant()],wrong:0,fv:0,zc:null,zcOff:null,carry:null,intro:0,ggOn:!!F[K.met],ggMode:'idle',rise:F[K.sun]?1:0,riseGo:false,townSaid:!!F[K.town],ride:null,padArm:true,gate:{ph:'snore',t:1.8,in:false,said:false,grace:0,n:0,caught:0},mState:'sleep',spd:0,lastP:null,songT:0,songK:0,T:{}};
  const U0=()=>G.view.camera&&G.mission.hero&&G.mission.hero();
  const say=(who,text,sec,o)=>G.dialog.say(who,text,sec,undefined,o),wait=s=>G.core.wait(s);
  const pk=()=>{const c=G.view.camera;return c&&c.aspect<1.25?Math.min(2,1.25/c.aspect):1;};
  const mark=k=>{if(st.T[k]==null)st.T[k]=+G.clock.t.toFixed(2);};
  /* 한 번에 한 곡: 바꿀 때 앞 곡이 out초에 줄어 꺼지고 새 곡이 fade초에 들어온다(game/sound bed). 대사 때 줄이기(duck)는 그대로 */
  const music=(m,o)=>{if(st.mus===m)return;st.mus=m;st.musT=G.clock.t;st.musLog=(st.musLog||[]);st.musLog.push([m,+G.clock.t.toFixed(2)]);
    if(m==='bgm')G.sound.zoneMusic({...BGM,resume:true,...(o||{})}); /* resume: 놀이 곡·해돋이 음악 뒤에는 멈췄던 자리부터 이어서 */else if(m==='play')G.sound.bed('venus-play',{fade:.6,out:1.2});else if(m==='sunrise')G.sound.zoneMusic({id:'venus-sunrise',fade:.5,out:2,loop:SUN_LOOP,intro:!!(o&&o.fresh),resume:!(o&&o.fresh),lufs:-16.2,...(o&&o.fade?{fade:o.fade}:{})});};
  /* 해돋이 뒤(2026-11-23)에는 스테이지 끝(얼음 배 출발)까지 해돋이 음악이 바탕 — 곡(약 3분)이 먼저 끝나면 뒷부분 SUN_LOOP를 겹쳐 되풀이, 놀이 곡(문지기) 뒤에는 멈췄던 자리부터.
     base() = 지금 바탕 곡: 해돋이를 봤으면 'sunrise', 아니면 'bgm'. 얼음 배가 떠나면 이동 음악이 배경음을 줄이며 넘어감(game/travel) */
  const base=()=>F[K.sun]?'sunrise':'bgm';
  const caught=()=>K.c.filter(k=>F[k]).length;
  /* 다시 찾은 탐방(2026-11-27 두 번째 — 규칙 docs/series-rules.md): 이미 끝낸 금성을 다시 열면 도착 지점에는 거꾸리도 배도 없고, 거꾸리는 구름 끝(REVGG)에서 기다리며 그 옆 선착장에 얼음 배가 매여 있음 →
     배 앞(구름 끝 가장자리)에 다가가면 올라타고 거꾸리가 손을 흔들며 배웅(S3-013 글자만) → 출발. 길 안내·할 일 없이 얼음 배 빛기둥만, 목소리 없이 글자만 */
  const REV=!!F[K.clear],REVGG=[END[0]+1.6,END[1]-1.9];if(REV)G.sound.voiceGag(true);
  const stage=()=>!st.arrDone?'arrive':!F[K.met]?'meet':(!F[K.sun]&&!F[K.ask])?'ask':(!F[K.sun]&&!F[DISC.day])?'wind':!F[K.sun]?'town':!F[K.plaza]?'plaza':!F[K.gate]?'gate':!F[K.clear]?'end':'done';
  /* 구름 양 몰기(양치기 개처럼 뒤에서 — 실패 없음): 원더룹이 FLEE(3.5m) 안으로 다가가면 반대쪽으로 종종 도망가되 울타리 문 쪽으로 반쯤 끌림(뒤에서 다가가면 문으로 감, 문 쪽에서 막아서면 멈칫).
     울타리는 문으로만 드나들고, 문턱을 넘으면 '음매' + 폴짝폴짝 뒤 우리 안 자기 자리에서 논다. 다섯 마리가 다 들어가면 구름 둑이 걷힘 */
  const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
  function herdIn(s,i){s.in=true;s.hop=1.5;SG.n++;mark('sheepIn'+SG.n);G.sound.sfx('event-baa',{gain:.9});G.sound.sfx('travel-step',{step:3+SG.n,gain:.9});puffAt(s.x,s.z,MOB?4:7,.6,[1,.95,.7]);quest(SG.n>=5?'해돋이를 보러 광장으로':`양을 울타리로 몰아요 ${SG.n}/5`);
    if(SG.n>=5){const W=U0();SG.done=true;G.state.setFlag(K.sheep,true);mark('sheep1');music(base(),{fade:3});
      scene(async()=>{G.react.react('hop',{sound:'mission-clear'});await wait(.9);G.sound.sfx('event-open');G.sound.sfx('cloud-poof',{gain:.8});SG.opening=true;barObs.forEach(o=>{const k=obstacles.indexOf(o);if(k>=0)obstacles.splice(k,1);});puffAt(BAR[0],BAR[1],MOB?14:22,1.3);await wait(.7);st.ggMode='talk';if(W)faceTo(gg.root,W.position.x,W.position.z);await say('거꾸리',T2.quiet,3);st.ggMode='idle';mark('sheepEnd');},null);}}
  function sheepStart(W){SG.started=true;mark('sheep0');scene(async()=>{st.ggMode='talk';faceTo(gg.root,W.position.x,W.position.z);await say('거꾸리',T2.sheep,5);st.ggMode='idle'; /* 설명하는 동안은 대화 카메라(scene의 who — 둘이 얼굴을 보며), 위에서 내려다보는 구도는 놀이가 시작될 때(SG.on — zoneCam 'glade') */SG.on=true;SG.t0=G.clock.t;music('play');G.ui.toast(T2.herd,4.5);mark('sheepGo');},gg);}
  function sheepTick(dt,t,P){const near=Math.hypot(P.x-GC[0],P.z-GC[1])<50;sheepM.visible=near;
    if(barM&&SG.opening){SG.open+=dt/.8;const k=Math.max(.001,1-SG.open);barM.scale.set(k,k,k);if(SG.open>=1){root.remove(barM);barM.geometry.dispose();barM=null;}}
    if(!near)return;const act=SG.on&&!SG.done&&!st.scene&&!G.dialog.talking();
    HD.forEach((s,i)=>{let vx=0,vz=0;
      if(s.in){const tx=PC[0]+Math.cos(i*2.4)*1.15,tz=PC[1]+Math.sin(i*2.4)*1.15,dx=tx-s.x,dz=tz-s.z,d=Math.hypot(dx,dz);if(d>.18){const v=Math.min(2.4,d*3);vx=dx/d*v;vz=dz/d*v;}}
      else if(act){const dx=s.x-P.x,dz=s.z-P.z,d=Math.hypot(dx,dz)||1;
        if(d<2.8&&G.clock.t-(s.baaT||-9)>2){s.baaT=G.clock.t;G.sound.sfx('event-baa',{gain:.6,pitch:[.84,.94,1.04,1.15,1.27][i%5]});} /* 가까이 가면 음매(양마다 높이가 다름, 같은 양은 2초에 한 번 — 2026-11-22: 말풍선 대신) */
        if(d<FLEE){const gx=GP[0]-s.x,gz=GP[1]-s.z,gl=Math.hypot(gx,gz)||1,close=gl<1.7; /* 문 앞에 오면 우리 안으로 쏙 */
          let ux=close?PC[0]-s.x:dx/d*.5+gx/gl*.5,uz=close?PC[1]-s.z:dz/d*.5+gz/gl*.5;const ul=Math.hypot(ux,uz);if(ul>.12){const sp=1.2+1.9*(1-d/FLEE);vx=ux/ul*sp;vz=uz/ul*sp;}}
        for(const o of HD)if(o!==s&&!o.in){const ex=s.x-o.x,ez=s.z-o.z,e=Math.hypot(ex,ez)||1;if(e<1.1){vx+=ex/e*(1.1-e)*2;vz+=ez/e*(1.1-e)*2;}}}
      else if(SG.started&&!SG.on){ /* 설명 대화 동안: 원더룹·거꾸리·대화 카메라 사이에 서 있던 양은 옆으로 비켜남(카메라 바로 앞에 선 양이 화면을 덮었다 — 2026-11-21) */
        const c=G.view.camera.position,g2=gg.root.position;for(const [qx,qz,R] of [[P.x,P.z,3],[g2.x,g2.z,3],[c.x,c.z,3.4],[(c.x+P.x)/2,(c.z+P.z)/2,3],[(c.x+g2.x)/2,(c.z+g2.z)/2,3]]){const ex=s.x-qx,ez=s.z-qz,e=Math.hypot(ex,ez)||1;if(e<R){vx+=ex/e*3.2*(1.15-e/R);vz+=ez/e*3.2*(1.15-e/R);}}}
      const kk=Math.min(1,dt*7);s.vx+=(vx-s.vx)*kk;s.vz+=(vz-s.vz)*kk;let nx=s.x+s.vx*dt,nz=s.z+s.vz*dt;
      /* 울타리: 문(±GHALF) 말고는 못 지나감 — 밖의 양은 밖에, 안의 양은 안에 */
      {const r1=Math.hypot(nx-PC[0],nz-PC[1])||1,inG=Math.abs(wrapA(Math.atan2(nz-PC[1],nx-PC[0])-GATEA))<GHALF-.14,was=Math.hypot(s.x-PC[0],s.z-PC[1])<PR;
        if(!inG||s.in){const lim=was?PR-.4:PR+.4;if(was?r1>lim:r1<lim){nx=PC[0]+(nx-PC[0])/r1*lim;nz=PC[1]+(nz-PC[1])/r1*lim;}}}
      if(!s.in){const rr=Math.hypot(nx-GC[0],nz-GC[1]);if(rr>ROAM){nx=GC[0]+(nx-GC[0])/rr*ROAM;nz=GC[1]+(nz-GC[1])/rr*ROAM;}}
      s.x=nx;s.z=nz;const sp=Math.hypot(s.vx,s.vz);if(sp>.25){s.ry+=wrapA(Math.atan2(s.vx,s.vz)-s.ry)*Math.min(1,dt*10);s.ph+=dt*(4+sp*4.5);}else if(act&&!s.in){s.ry+=wrapA(Math.atan2(P.x-s.x,P.z-s.z)-s.ry)*Math.min(1,dt*2);} /* 서 있을 때는 원더룹 쪽을 힐끔 */
      if(!s.in&&act&&Math.hypot(s.x-PC[0],s.z-PC[1])<PR-.45)herdIn(s,i);
      if(s.hop>0)s.hop-=dt;const trot=sp>.25?Math.abs(Math.sin(s.ph))*.1:0,hp=s.hop>0?Math.abs(Math.sin(s.hop*8.4))*.42*Math.min(1,s.hop):0,q=1+hp*.25;
      _sq.setFromAxisAngle(_sy,s.ry);_sm.compose(_sv.set(s.x,groundY(s.x,s.z)+trot+hp,s.z),_sq,_ss.set(1.15/Math.sqrt(q),1.15*q,1.15/Math.sqrt(q)));sheepM.setMatrixAt(i,_sm);});sheepM.instanceMatrix.needsUpdate=true;}
  function quest(q){if(q!==st.lastQ){st.lastQ=q;G.ui.setQuest(q);G.goal.set(null);}}
  const ggPlace=(x,z)=>{gg.root.position.set(x,groundY(x,z),z);};
  const faceTo=(o,x,z,dt)=>{const ry=Math.atan2(x-o.position.x,z-o.position.z);if(dt==null){o.rotation.y=ry;return;}o.rotation.y+=Math.atan2(Math.sin(ry-o.rotation.y),Math.cos(ry-o.rotation.y))*Math.min(1,dt*7);};
  if(st.ggOn){const s=Math.min(sOf(spawnAt())+3,S_END-1.2),p=pointAt(s);ggPlace(p[0],p[1]);if(F[K.clear]||(!F[K.sun]&&!F[DISC.day])){const e=REV?REVGG:spawnAt()[0]>20?GG0:GGP;ggPlace(e[0],e[1]);if(REV)faceTo(gg.root,END[0]+8,END[1]);} /* 끝낸 뒤에는 처음부터 시작 자리 옆(2026-11-27 — 예전: 구름 끝에서 100m를 걸어옴) */gg.root.visible=true;}
  function spawnAt(){return F[K.clear]?[START[0]+1.5,START[1]-1] /* 2026-11-27: 끝낸 뒤 다시 오면(지도에서 골라 와도) 처음 도착한 자리 — 예전: 구름 끝 */:F[K.gate]?[GATE[0]-3,GATE[1]]:F[K.plaza]?[c0-9.5,c1]:F[K.sun]?[c0,c1+3.7]:F[DISC.day]?[0,-9]:caught()>=3?[0,-4.5]:F[K.met]?[START[0]+1.5,START[1]-1]:START;}
  /* 이야기 장면 감싸기(화성과 같은 방식): 원더룹은 서 있고(sceneLock — 조이스틱·화면 누르기·점프 모두 잠김), who를 주면 대화 카메라 */
  async function scene(fn,who){if(st.scene)return;const W=U0();if(!W)return;st.scene=true;const U=W.userData;if(U.stopWalk)U.stopWalk();U.sceneLock=true;
    let pc=null;if(who){W.rotation.y=Math.atan2(who.root.position.x-W.position.x,who.root.position.z-W.position.z);pc=G.view.pairCam(who.root,who.head);if(pc)G.view.hold(pc);}
    try{await fn(W,U);}catch(e){console.error(e);}finally{if(pc&&G.view.req&&G.view.req.fn===pc)G.view.hold(null);U.sceneLock=false;st.scene=false;st.lastQ=null;}}
  /* 구름이 둥실 되돌려 보냄(틀린 갈래·길 밖·문지기) — 살짝 떠서 미끄러지듯, 화면은 그대로 */
  function carryBack(W,to,sec=1.15){const U=W.userData,P=W.position,a=[P.x,P.z];if(U.stopWalk)U.stopWalk();U.sceneLock=true;U.riding={y:P.y,carry:false};U.action='서기';U.at=0;G.sound.sfx('cloud-poof',{gain:.9});puffAt(P.x,P.z,MOB?10:16,.8);
    return new Promise(res=>{st.carry={t:0,sec,a,to,res,W};});}
  function tickCarry(dt){const c=st.carry;if(!c)return;c.t+=dt;const u=Math.min(1,c.t/c.sec),e=u*u*(3-2*u),W=c.W,U=W.userData,x=lerp(c.a[0],c.to[0],e),z=lerp(c.a[1],c.to[1],e),y=groundY(x,z)+Math.sin(u*PI)*.55;
    W.position.set(x,y,z);if(U.riding)U.riding.y=y;if(Math.random()<dt*14)puffAt(x,z,1,.4);
    if(u>=1){st.carry=null;W.position.y=groundY(x,z);U.riding=null;puffAt(x,z,MOB?8:12,.7);G.sound.sfx('land',{gain:.4});if(c.to[2]!=null)W.rotation.y=c.to[2];if(!st.scene)U.sceneLock=false;st.lastP=null;c.res();}}
  /* ── ① 도착 뒤 나레이션 → 3초 조용히 → ② 거꾸리 등장 ── */
  async function intro(W,U){if(st.intro)return;st.intro=1;
    /* 2026-11-21: 내려앉고 2초 뒤 거꾸리가 안개 속에서 걸어 나옴(원더룹 혼자 서 있는 시간 15~20초 → 약 5~6초). 나레이션(S3-001)은 기다리지 않고 그동안 함께 흐름 — 거꾸리 대사는 목소리가 끝난 뒤에(say가 기다림) */
    /* 2026-11-23: 도착 나레이션 둘(TR-004 → S3-001)이 다 끝난 뒤에 거꾸리가 나와 인사(예전: 내려앉고 2초 뒤에 나와 나레이션과 겹쳐 "녕안!…" 목소리가 묻히거나 끊겼다) */
    {const quiet=()=>!document.getElementById('wlToast')?.classList.contains('on')&&!G.sound.voiceBusy();await G.core.until(quiet,14);await G.core.wait(.4);mark('nar');const rd=Math.max(2.4,T.n1.length/8.5);
      if(!F[K.met]){G.ui.toast(T.n1,rd+1.6,T.n1);await G.core.wait(.5);await G.core.until(quiet,rd+6);}}
    await wait(.4);await G.core.until(()=>!G.core.blocking()&&!st.carry&&!(U.vert&&U.vert.air),20);mark('gg');
    await scene(async()=>{const P=W.position,far=P.x>20?[P.x-12,P.z-.6]:pointAt(proj(P.x,P.z).s+12),dx=far[0]-P.x,dz=far[1]-P.z,d=Math.hypot(dx,dz)||1,to=[P.x+dx/d*1.9,P.z+dz/d*1.9];
      ggPlace(far[0],far[1]);gg.root.visible=true;st.ggOn=true;gg.root.rotation.y=Math.atan2(dx,dz); /* 등이 원더룹 쪽(뒷걸음으로 다가옴) */
      /* 카메라: 원더룹 등 뒤 위에서 거꾸리가 나오는 안개 쪽을(도착 카메라는 원더룹 앞쪽이라 등 뒤에서 오는 거꾸리가 안 보였다) — 만지면 플레이어 것 */
      const ec=()=>{const k=pk(),g=gg.root.position;return {at:[lerp(P.x,g.x,.45),1.0,lerp(P.z,g.z,.45)],from:[P.x-dx/d*4.6*k+dz/d*1.6,2.5+.9*(k-1),P.z-dz/d*4.6*k-dx/d*1.6]};};G.view.hold(ec);
      U.action='두리번';U.at=0;const t0=G.clock.t,len=Math.hypot(to[0]-far[0],to[1]-far[1]),TT=Math.max(1.6,len/3.4);st.ggMode='walk';let stp=0;
      await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/TT);ggPlace(lerp(far[0],to[0],u),lerp(far[1],to[1],u));if(u>.35){if(U.action==='두리번'){U.action='서기';U.at=0;}W.rotation.y+=Math.atan2(Math.sin(Math.atan2(dx,dz)-W.rotation.y),Math.cos(Math.atan2(dx,dz)-W.rotation.y))*.15;}
        if(Math.floor((G.clock.t-t0)*4.5)!==stp){stp=Math.floor((G.clock.t-t0)*4.5);G.sound.sfx('step',{gain:.7});}return u>=1;},TT+1);
      st.ggMode='idle';U.action='서기';U.at=0;G.react.react('startle',{sound:null});G.sound.sfx('event-pop',{gain:.6});
      {const t1=G.clock.t,r0=gg.root.rotation.y;await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t1)/.45);gg.root.rotation.y=r0+PI*u*u*(3-2*u);return u>=1;},1);} /* 빙글 돌아서 원더룹을 봄 */
      W.rotation.y=Math.atan2(gg.root.position.x-P.x,gg.root.position.z-P.z);mark('ggHere');await G.view.meetCard('geokkuri',gg.root,gg.head+.25); /* 처음 만나는 순간: 확대 → 친구 카드 → 대화 */const pc=G.view.pairCam(gg.root,gg.head);if(pc)G.view.hold(pc);else if(G.view.req&&G.view.req.fn===ec)G.view.hold(null);
      try{st.ggMode='talk';await say('거꾸리',T.g2,4.6);await say('거꾸리',T2.go,3.2);st.ggMode='idle';}finally{if(pc&&G.view.req&&G.view.req.fn===pc)G.view.hold(null);}
      G.state.setFlag(K.met,true);mark('met');});}
  /* ── ④ 서쪽 해돋이 광장 ── */
  const exitHere=P=>{const dx=P.x-c0,dz=P.z-c1;for(const b of PLZ.br){const a=dx*b.d[0]+dz*b.d[1],pp=Math.abs(dx*b.d[1]-dz*b.d[0]);if(a>PLZ.R+1.6&&a<PLZ.R+7&&pp<3.2)return b;}return null;};
  async function sunrise(W,U){mark('sun0');
    await scene(async()=>{const P=W.position;faceTo(gg.root,P.x,P.z);W.rotation.y=Math.atan2(gg.root.position.x-P.x,gg.root.position.z-P.z);
      /* 구도(2026-11-22 — 따라가기 카메라 그대로면 휴대폰은 거꾸리가 왼쪽 끝에 잘리고, 컴퓨터는 원더룹 뒤통수가 가운데를 가렸다): 장면 처음부터 동쪽에서 서쪽을 보는 한 자리 —
         해(가운데 멀리)·광장 해시계(가운데)·거꾸리(왼쪽)·원더룹(오른쪽 — 대사 동안은 거꾸리를 보는 옆얼굴, 해가 올라오면 둘 다 서쪽). 해가 올라오는 만큼 조금 올려다봄 */
      const HZ=c1-.95,GZ=c1+1.0,CZ=c1 /* 동쪽 출구 기둥 둘(z ±2.7) 사이로 봄 — 둘이 그 틈 안에 서야 기둥에 안 가림 */,cam=()=>{const k=pk(),pt=k>1.3;return pt?{at:[c0-18,1.5+2.9*st.rise,CZ],from:[c0+2.8+8.4*k,1.75+.5*(k-1),CZ]}:{at:[c0-18,1.9+1.1*st.rise,CZ],from:[c0+2.8+9.4,.95,CZ]};};G.view.hold(cam);st.sunCam=cam; /* 가로 화면: 낮은 카메라(발이 아래 대사창 위로 올라오고 해는 화면 위쪽에) · sunCam: 이 장면 동안은 화면을 만져도 다시 이 구도(update — 2026-11-25) */
      /* 해돋이 음악(2026-11-22): 배경음이 2초에 줄어 꺼지고 해돋이 음악 — 해는 그 곡의 자리를 따라 떠오른다(st.rise = (곡 자리 ÷ RISE)^1.8: 대사 둘이 끝날 즈음 지평선 위로, 곡이 가장 커지는 RISE초에 다 뜸) */
      music('sunrise',{fresh:true});st.riseT0=G.clock.t;st.riseGo=true;G.state.setFlag(K.sun,true);SK.to(1,RISE);mark('rise');
      /* 세로 화면(2026-11-22 — 멀리서 좁게 보는 카메라라 똑바로 마주 보면 원더룹이 뒷모습에 가까웠다): 둘이 서로가 아니라 둘 사이 카메라 쪽 한 점을 봐서 몸을 카메라로 연다(원더룹 3/4 얼굴, 거꾸리도 얼굴) */
      const LK=pk()>1.3?{look:{at:[c0+4.1,c1+.05],name:'서로'},pin:'bottom'}:{pin:'bottom'};
      const ptw=pk()>1.3,speak=()=>{st.ggMode='talk';return say('거꾸리',T2.goal,6.2,LK).then(()=>say('거꾸리',T2.rise,2.6,LK));};let ln=ptw?null:speak(); /* 세로 화면(2026-11-28): 좁은 화면이라 걸어 들어오는 동안 원더룹이 화면 밖 — 둘이 자리에 선 뒤에 대사 */ /* 목적을 먼저(왜 해 뜨는 쪽을 찾는지) · 이 장면의 대사창은 아래 */
      /* 대사하는 동안 원더룹은 광장 가운데 옆으로(해시계를 가리지 않게 남쪽으로 비켜), 거꾸리는 반대쪽 옆으로 */
      {const a=[P.x,P.z],to=[c0+2.8,HZ],L=Math.hypot(to[0]-a[0],to[1]-a[1]),TT=Math.max(.6,L/3.6);await wait(ptw?.25:.9);const t1=G.clock.t;U.action='걷기';U.at=0;W.rotation.y=Math.atan2(to[0]-a[0],to[1]-a[1]);st.ggTo=[c0+2.4,GZ];
        await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t1)/TT),x=lerp(a[0],to[0],u),z=lerp(a[1],to[1],u);W.position.set(x,groundY(x,z),z);return u>=1;},TT+1);U.action='서기';U.at=0;st.lastP=null;}
      if(ptw){await G.core.until(()=>Math.hypot(gg.root.position.x-(c0+2.4),gg.root.position.z-GZ)<.25,1.6);faceTo(gg.root,P.x,P.z);ln=speak();}await ln;st.ggTo=null;
      st.ggMode='point';faceTo(gg.root,c0-30,GZ);st.faceW=true;G.sound.sfx('event-sparkle');
      await G.core.until(()=>st.rise>.72,RISE+3);G.react.react('awe',{sound:null});await G.core.until(()=>st.rise>=1,RISE+3);G.sound.sfx('event-open',{gain:.8});mark('sun1');await wait(.9);
      st.faceW=false;st.ggMode='talk';faceTo(gg.root,P.x,P.z);await say('거꾸리',T2.west,4.2,{look:'해',pin:'bottom'});
      /* 어디로 갈지 알려 줌(2026-11-21): 거꾸리가 해 뜨는 쪽(서쪽 출구)으로 먼저 몇 걸음 앞장서 가서 돌아보며 기다림 */
      st.ggTo=[c0-PLZ.R+1.6,c1+.9];st.ggMode='walk';const ld=say('거꾸리',T2.lead,3.6,{pin:'bottom'});await wait(1.7);st.ggMode='talk';faceTo(gg.root,P.x,P.z);await ld;st.ggTo=null;st.ggMode='idle';
      st.sunCam=null;if(G.view.req&&G.view.req.fn===cam)G.view.hold(null);},null);
    st.sunCam=null;mark('sunEnd');} /* 해 구경이 끝나도 해돋이 음악은 그대로(2026-11-23 — 스테이지 끝까지) */
  async function plazaRight(W,U){G.state.setFlag(K.plaza,true);mark('plaza');G.sound.sfx('event-open',{gain:.9});puffAt(W.position.x,W.position.z,MOB?8:14,1.2,[1,.97,.86]);
    await G.core.until(()=>!G.core.blocking()&&!(U.vert&&U.vert.air),6);
    await scene(async()=>{G.sound.sfx('event-sparkle');
      /* 구도(2026-11-21 — 따라가기 카메라 그대로면 출구 옆 기둥이 원더룹을 가렸다): 출구 길 한가운데(동쪽 — 기둥 사이)에서 원더룹 너머 서쪽 해를, 세로 화면은 카드가 아래라 원더룹을 화면 가운데 위로 */
      const P=W.position,pc=()=>{const k=pk(),pt=k>1.3;return pt?{at:[P.x-6,2.1,c1],from:[P.x+6.2*k,2.5,c1]}:{at:[P.x-6,1.7,c1-3.4],from:[P.x+9,1.1,c1]};} /* 카메라 자리는 출구 길 가운데 그대로(기둥에 안 가림), 보는 쪽만 조금 옆으로 돌려 원더룹·해가 가운데 아래 카드의 왼쪽에 */ /* 세로: 거의 수평으로(해가 화면 위쪽에, 원더룹 발은 아래 카드 바로 위) · 가로(2026-11-22 — 카드가 아래로 내려와 원더룹 머리를 덮었다): 낮은 카메라로 조금 올려다봐 원더룹이 카드 위로 */;W.rotation.y=-PI/2;G.view.hold(pc);st.plzCam=pc;
      G.react.react('awe',{sound:null});await wait(1.3);
      G.state.setFlag(DISC.sun,true);G.react.react('joy',{sound:'card-secret',bounce:false});
      await G.ui.secret({kicker:'새 발견',title:'해가 서쪽에서 떠요',text:T.n7,vo:T.n7,count:`발견 ${discN()}/${DISC_TOTAL}`}); /* 2026-11-27: 해를 본 다음에 나오는 카드라 PC·휴대폰 모두 화면 위쪽 */ /* (예전) 늘 아래(2026-11-22 — 가로 화면도): 위에 뜨면 서쪽 하늘의 해를 가림. 이 장면은 원더룹이 화면 아래쪽에 없다 */
      mark('card1');if(G.view.req&&G.view.req.fn===pc)G.view.hold(null);st.plzCam=null;});}
  async function plazaWrong(W,U,b,count){if(count){st.wrong++;mark('wrong'+st.wrong);}await carryBack(W,[c0+.4,c1+3.5,Math.atan2(PLZ.inc[0],PLZ.inc[1])]);
    if(count&&st.wrong>=2&&st.wrong%2===0)await scene(async()=>{const sx=c0-PLZ.R+4,sz=c1+2.7;faceTo(gg.root,c0-30,c1);st.ggMode='point';
      await say('거꾸리',T2.hint,3.2,{look:{at:[c0-30,c1],name:'해'}});st.ggMode='idle';mark('hint');});}
  const discN=()=>Object.values(DISC).filter(k=>F[k]).length;
  /* ── ④ 뭉게 문지기 ── */
  function gateTick(dt,W,U,P){const g=st.gate,inZone=P.x<GS[0]+.6&&P.x>GATE[0]-1.3&&Math.abs(P.z-GATE[1])<8;
    if(F[K.gate]){st.mState='sleep';qmark.show(false);return;}
    if(P.x<=GATE[0]-1.3&&Math.abs(P.z-GATE[1])<3.2){G.state.setFlag(K.gate,true);mark('gate');music(base(),{fade:3});qmark.show(false);st.mState='sleep';G.sound.sfx('event-open',{gain:.7});
      say('뭉게 문지기',T.m11,2.6,{hear:'혼잣말',look:'잠꼬대',pin:'bottom'});return;}
    if(!inZone||st.scene||st.carry){if(!st.carry&&g.ph!=='wake'){if(g.ph==='ask'||g.ph==='warn'){g.ph='snore';g.iv=null;g.t=2.2;}st.mState='sleep';qmark.show(false);}return;}
    /* 2026-11-21 흐름: ① 다가가면 뭉게 문지기를 확대 → 친구 카드 ② 거꾸리·원더룹 대화 화면으로 돌아와 문지기가 왜 있는지 + '코 골 때만 살금살금' ③ 미션은 위에서 내려다보는 구도(zoneCam). 대사창은 늘 아래 같은 자리(pin) */
    if(!g.said){g.said=true;st.gateIntro=true;mark('gateIn');scene(async()=>{faceTo(gg.root,P.x,P.z);W.rotation.y=Math.atan2(MUNGE[0]-P.x,MUNGE[1]-P.z);
        if(G.profile.seen('munge')){const z=G.view.meetCam(munge.root,2);if(z){G.view.hold(z);await wait(1.5);}}else await G.view.meetCard('munge',munge.root,2,1.4);mark('gateCard');
        W.rotation.y=Math.atan2(gg.root.position.x-P.x,gg.root.position.z-P.z);const pc=G.view.pairCam(gg.root,gg.head);G.view.hold(pc||null);
        st.ggMode='talk';await say('거꾸리',T2.gate,7.2,{pin:'bottom'});await say('거꾸리',T.g8,4.4,{pin:'bottom'});st.ggMode='idle';if(pc&&G.view.req&&G.view.req.fn===pc)G.view.hold(null);st.gateIntro=false;g.ph='snore';g.iv=null;g.t=1.8;music('play');mark('gateGo'); /* 문지기 놀이 동안은 놀이 배경음 — 문을 지나면 해돋이 음악이 멈췄던 자리부터 */},null);return;}
    quest('코 골 때만 살금살금 걸어요');
    const loud=!!(U.vert&&U.vert.air)||st.spd>8;
    /* 박자(2026-11-19 — 무궁화꽃 놀이처럼): 잠든 동안 코골이 + 작은 오르골 반주 → 눈뜨기 0.8초 전 미리 알림(반주·코골이가 뚝 멈추고 '흐음?' + 몸이 크게 들썩 + 구름 말풍선 '?') → 눈을 뜸(0.2초는 봐줌) → 그 뒤에도 움직이면 '!' */
    /* 2026-11-20 가락: '무궁화 꽃이 피었습니다'처럼 7음짜리 짧은 오르골 가락이 흐르는 동안은 잠(걸어도 됨), 가락이 끝나는 순간 눈을 뜸. 빠르기는 판마다 바뀜(보통·빠르게·느리게…).
       눈뜨기 0.8초 전 미리 알림(코골이 멈춤·몸 들썩·'?')은 가락의 끝 음들과 겹침. 눈을 감으면 가락이 다시 시작 */
    const tune=()=>{g.mt+=dt;while(g.ni<7&&g.mt>=g.ni*g.iv){G.sound.sfx('travel-step',{step:[4,4,5,5,4,4,2][g.ni],gain:.62});g.ni++;}return 7.2*g.iv-g.mt;};
    if(g.ph==='snore'){st.mState='sleep';if(g.iv==null){g.iv=[.42,.3,.5,.26,.36][(g.round=(g.round||0)+1)%5];g.ni=0;g.mt=-.45;}
      const left=tune();if(left<=.8||loud){if(loud)g.ni=7;g.ph='warn';g.t=loud?.8:Math.max(.05,left);st.mState='warn';qmark.set('?');qmark.el.classList.remove('al');qmark.show(true);G.sound.sfx('guard-notice',{gain:1});mark('warn'+(g.n+1));}}
    else if(g.ph==='warn'){st.mState='warn';tune();g.t-=dt;if(g.t<=0){g.ph='ask';g.t=1.5;g.grace=.2;g.n++;g.iv=null;st.mJolt=1; /* 눈을 뜨는 순간 몸이 들썩 + 원더룹 쪽으로 고개를 휙 */G.sound.sfx('event-pop',{gain:.5});say('뭉게 문지기',T.m9,1.3,{hear:'혼잣말',look:'뒤척임',pin:'bottom'});mark('ask'+g.n);}}
    else if(g.ph==='ask'){st.mState='ask';g.t-=dt;g.grace-=dt;
      if(g.grace<=0&&(st.spd>.6||(U.vert&&U.vert.air))){g.ph='wake';g.caught++;qmark.set('!');qmark.el.classList.add('al');st.mState='wake';G.sound.sfx('guard-alert');mark('caught'+g.caught);
        scene(async()=>{G.react.react('startle',{sound:null});const s=say('뭉게 문지기',T.m10,2.4,{hear:'혼잣말',look:'깜짝',pin:'bottom'});await wait(.45);await carryBack(W,[GS[0]+1.2,GS[1],-PI/2],1.3);await s;qmark.show(false);st.mState='sleep';g.ph='snore';g.iv=null;g.t=2.2;},null);}
      else if(g.t<=0){g.ph='snore';g.iv=null;g.t=2.4;qmark.show(false);}}}
  /* ── ⑤ 구름 끝: 얼음 조각 배 ── */
  const BY=SEA+.55,HSEAT=.15,GSEAT=.14,BSIDE=.5,HX=.8,GX=.85 /* 2026-11-25: 둘을 더 떨어뜨림(서로 가리지 않게 — 예전 .42·.45·.55) */ /* 배 가운데에서 원더룹은 뒤쪽으로 HX, 거꾸리는 뱃머리 쪽으로 GX */ /* 좌우로 조금 엇갈려 섬(앞에 선 거꾸리가 뒤의 원더룹을 가리지 않게) */; /* 2026-11-21: 배 위에 서서 감(앉은 자세는 배 위에 떠 보였다) — 배 윗면 높이 */ // /* 배 바닥에 앉는 높이(원더룹 '앉기'는 자세가 0.235 내려감 — 예전 .6·.44는 배 위에 둥둥 떠 보였다, 2026-11-20) */
  const hop=(from,to,sec,fn)=>{const t0=G.clock.t;return G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/sec),e=u*u*(3-2*u);fn(lerp(from[0],to[0],e),lerp(from[1],to[1],e)+Math.sin(u*PI)*.8,lerp(from[2],to[2],e));return u>=1;},sec+1);};
  const seatAt=(lx,lz)=>{const q=boatStand(boat,lx,lz);return [q.x,q.y,q.z];}; /* 배 위에 서는 자리(겉면 높이 — cloudfolk boatStand) */
  const mkBoat=(x,z,ry)=>{const B={x,z,ry};boat.visible=true;st.boat={B,setBoat:t=>{boat.position.set(B.x,(st.sailY!=null?st.sailY:BY)+Math.sin(t*1.7)*.05,B.z);boat.rotation.set(Math.sin(t*1.3)*.03,B.ry,Math.sin(t*1.1)*.04);}};return B;};
  async function ending(W,U){const P=W.position;mark('end');
    /* 2026-11-21 순서: 구름 끝에 닿으면 ① 비행선 확대 + 발견 카드 → ② 거꾸리 "다 왔다!…" → 얼음 배가 떠 옴 → "나도 같이 갈래!…" → ③ STAGE 3 완료 → 배에 타서 출발(다 둘러본 다음에 마무리) */
    {const sp=[END[0]-1.5,END[1]+.9],a=[P.x,P.z],L=Math.hypot(sp[0]-a[0],sp[1]-a[1]),TT=Math.max(.5,L/3.4),t1=G.clock.t;U.action='걷기';U.at=0;W.rotation.y=Math.atan2(sp[0]-a[0],sp[1]-a[1]);st.ggTo=[END[0]-1.3,END[1]-1.1];
      await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t1)/TT),x=lerp(a[0],sp[0],u),z=lerp(a[1],sp[1],u);W.position.set(x,groundY(x,z),z);return u>=1;},TT+1);U.action='서기';U.at=0;st.lastP=null;await wait(.3);st.ggTo=null;}
    const sd=[-.612,-.791],cam2=()=>{const k=pk(),wide=k<1.3;return {at:[P.x+sd[0]*9-(wide?2.2:0),1.9,P.z+sd[1]*9],from:[P.x-sd[0]*6.4*k+(wide?1.2:.4),2.7+.8*(k-1),P.z-sd[1]*6.4*k+(wide?-1.6:-.5)]};};
    W.rotation.y=Math.atan2(sd[0],sd[1]);faceTo(gg.root,gg.root.position.x+sd[0],gg.root.position.z+sd[1]);st.ggMode='point';G.view.hold(cam2);await wait(1.0);
    /* 비행선을 가까이: 카메라가 구름 바다 너머 비행선 앞옆으로 다가가 크게 — 가로 화면은 카드가 위라 비행선을 화면 아래쪽에, 세로 화면은 카드가 아래라 위쪽에 */
    const cam3=()=>{const pt=pk()>1.3,q=ship.position,D=pt?27:15;return {at:[q.x,q.y+(pt?-2.6:1.7),q.z],from:[q.x-sd[0]*D*.9+sd[1]*D*.42,q.y+2.4,q.z-sd[1]*D*.9-sd[0]*D*.42]};};G.view.hold(cam3);await wait(1.7);st.ggMode='idle';mark('look');
    G.state.setFlag(DISC.air,true);G.sound.sfx('card-secret');
    /* 2026-11-27: 비행선만 보이는 시간은 절반쯤(약 7초) — 그 뒤에는 둘과 구름 바다 너머 비행선이 함께 보이는 구도로 돌아와 카드가 끝날 때까지 */
    {const cp=G.ui.secret({kicker:'새 발견',title:'구름 위는 지구와 비슷해요',text:T.n14,vo:T.n14,count:`발견 ${discN()}/${DISC_TOTAL}`,at:innerHeight>innerWidth?'bottom':null,lines:5});let closed=false;cp.then(()=>{closed=true;});
      const t0=G.clock.t;await G.core.until(()=>closed||G.clock.t-t0>5.2,7);if(!closed)G.view.hold(cam2);await cp;} /* 세로 화면: 위에 뜨면 구름 바다 너머 비행선을 가림 */await wait(.4);mark('card2');
    /* ② 거꾸리와 마주 보고 */
    faceTo(gg.root,P.x,P.z);W.rotation.y=Math.atan2(gg.root.position.x-P.x,gg.root.position.z-P.z);
    {const pc=G.view.pairCam(gg.root,gg.head);G.view.hold(pc||null);st.ggMode='talk';await say('거꾸리',T2.end1,5.2);st.ggMode='idle';if(pc&&G.view.req&&G.view.req.fn===pc)G.view.hold(null);}mark('endTalk');
    /* 2026-11-27 새 흐름: ② 얼음 배가 날아와 닿음 → ③ 거꾸리 S3-041 → ④ 원더룹만 탐(거꾸리는 남음) → ⑤ 거꾸리 S3-013 손 흔들기 → ⑥ 완료 카드 → 배가 원더룹을 띄워 출발 */
    const B=mkBoat(-107,-27,.5);
    faceTo(gg.root,-107,-27);W.rotation.y=Math.atan2(-107-P.x,-27-P.z);st.ggMode='point';G.sound.sfx('event-sparkle');G.view.hold(cam2);
    {const t0=G.clock.t,a=[B.x,B.z];await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/3.2),e=1-Math.pow(1-u,2.4);B.x=lerp(a[0],DOCK[0],e);B.z=lerp(a[1],DOCK[1],e);B.ry=lerp(.5,0,e);return u>=1;},4.5);}
    st.ggMode='idle';G.sound.sfx('cloud-poof',{gain:.7});
    faceTo(gg.root,P.x,P.z);W.rotation.y=Math.atan2(gg.root.position.x-P.x,gg.root.position.z-P.z);
    {const pc=G.view.pairCam(gg.root,gg.head);G.view.hold(pc||null);st.ggMode='talk';await say('거꾸리',T2.end2,4.6);st.ggMode='idle';if(pc&&G.view.req&&G.view.req.fn===pc)G.view.hold(null);}
    /* 원더룹만 배에 폴짝 — 배 옆 카메라(배와 원더룹, 그 뒤 구름 끝의 거꾸리) */
    const cam=()=>{const k=pk();return {at:[B.x+.6,BY+1.25,B.z],from:[B.x-5.2*k,BY+2.4+.9*(k-1),B.z+4.8*k]};};G.view.hold(cam);
    {U.riding={y:P.y,carry:false};G.sound.sfx('jump');await hop([P.x,P.y,P.z],seatAt(0,0),.8,(x,y,z)=>{W.position.set(x,y,z);U.riding.y=y;});U.action='서기';U.at=0;st.aboard=true;G.sound.sfx('event-pop');}
    /* 2026-11-27: 배 한가운데에 올라 카메라 쪽(정면)을 보고 섬 → 거꾸리가 말하기 시작하면 배가 조금 움직이고 원더룹이 몸을 살짝 틀어 거꾸리를 봄(얼굴은 3/4로 보임) */
    {const c=G.view.camera.position;W.rotation.y=Math.atan2(c.x-P.x,c.z-P.z);}faceTo(gg.root,P.x,P.z);mark('boat');await wait(.5);
    {const r0=W.rotation.y,x0=B.x,ry0=B.ry,t0=G.clock.t,ga=Math.atan2(gg.root.position.x-P.x,gg.root.position.z-P.z),to=r0+wrapA(ga-r0)*.55;G.sound.sfx('cloud-poof',{gain:.4});
      G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/1.2),e=u*u*(3-2*u);B.x=x0-.55*e;B.ry=ry0+.22*e;W.rotation.y=r0+(to-r0)*e;faceTo(gg.root,P.x,P.z);return u>=1;},2);}
    st.ggMode='wave';await say('거꾸리',T.g13,4.4,{to:null});
    /* 완료: 원더룹이 카메라 쪽을 보며 폴짝(거꾸리는 계속 손을 흔듦) */
    {const c=G.view.camera.position;W.rotation.y=Math.atan2(c.x-P.x,c.z-P.z);}await wait(.5);
    G.sound.sfx('mission-clear');G.state.setFlag(K.clear,true);mark('clear');G.state.saveAfter(ZID,{time:1});G.react.react('hop',{sound:null,face:'기쁨'});
    await Promise.race([G.ui.itemCard({title:'구름 행성 탐험 완료!',text:'',icon:SPACE.icons.map(),sec:3.2,sound:null,who:'완료'}),wait(3.8)]);if(U.setExpr)U.setExpr('기본');
    if(G.view.req&&(G.view.req.fn===cam2||G.view.req.fn===cam3||G.view.req.fn===cam))G.view.hold(null);
    await sail(W,U);}
  /* 끝낸 뒤 다시 오면: 구름 끝에 매여 있는 얼음 배에 다시 타고 떠남 */
  /* 끝낸 뒤 다시 왔을 때(2026-11-27): 처음 도착한 자리 옆의 거꾸리에게 말을 걸면 "얼음 배를 타고 토성으로 가 볼래?" → 얼음 배가 날아와 닿음 → 원더룹이 올라탐 → 거꾸리는 말없이 손만 흔듦 → 출발 */
  async function reboard(W,U){const P=W.position,B=st.boat.B;G.goal.set(null);if(U.stopWalk)U.stopWalk();
    const cam=()=>{const k=pk();return {at:[B.x+.6,BY+1.25,B.z],from:[B.x-5.2*k,BY+2.4+.9*(k-1),B.z+4.8*k]};};G.view.hold(cam);
    {const a=[gg.root.position.x,gg.root.position.z],to=[END[0]-1.3,END[1]-1.1],t0=G.clock.t;G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/1.3),x=lerp(a[0],to[0],u),z=lerp(a[1],to[1],u);ggPlace(x,z);if(u<1)faceTo(gg.root,to[0],to[1]);return u>=1;},2);} /* 거꾸리가 구름 끝 가장자리로 배웅 나옴 */
    U.riding={y:P.y,carry:false};G.sound.sfx('jump');W.rotation.y=Math.atan2(B.x-P.x,B.z-P.z);await hop([P.x,P.y,P.z],seatAt(0,0),.8,(x,y,z)=>{W.position.set(x,y,z);U.riding.y=y;});U.action='서기';U.at=0;st.aboard=true;G.sound.sfx('event-pop');
    {const c=G.view.camera.position;W.rotation.y=Math.atan2(c.x-P.x,c.z-P.z);}faceTo(gg.root,P.x,P.z);await wait(.5);
    {const r0=W.rotation.y,x0=B.x,ry0=B.ry,t0=G.clock.t,ga=Math.atan2(gg.root.position.x-P.x,gg.root.position.z-P.z),to=r0+wrapA(ga-r0)*.55;G.sound.sfx('cloud-poof',{gain:.4});
      G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/1.2),e=u*u*(3-2*u);B.x=x0-.55*e;B.ry=ry0+.22*e;W.rotation.y=r0+(to-r0)*e;faceTo(gg.root,P.x,P.z);return u>=1;},2);}
    st.ggMode='wave';await say('거꾸리',T.g13,4.4,{to:null});
    {const c=G.view.camera.position;W.rotation.y=Math.atan2(c.x-P.x,c.z-P.z);}await wait(.4);if(G.view.req&&G.view.req.fn===cam)G.view.hold(null);await sail(W,U);}
  /* ── ⑥ 얼음 배 출발 → 토성(2026-11-19 — 행성 이동 공통 틀 meteor-ride departure: 달 → 화성·화성 → 금성과 같은 시간표·카메라 차례, 탈것만 얼음 배).
       0~3.75초 배가 구름 바다 위로 떠오름 → 13초 비행: 구름층을 뚫고(안개가 다가와 땅이 연보라에 묻힘) 우주로, 발아래 둥근 금성이 멀어지고 토성이 커짐 → 우주 지도 → 얼음빛 덮개 → space-saturn ── */
  function sail(W,U){return new Promise(res=>{W.rotation.y=-PI/2; /* 가는 쪽(서쪽)을 보고 섬 */
    /* 2026-11-27: 배웅 장면의 연출 카메라를 놓는 순간 따라가기 카메라가 예전 각도(등 뒤 위)로 튀었다가 다시 앞으로 돌아와 화면이 출렁였다 → 따라가기 각도·거리를 지금 카메라 자리로 맞춰 놓고 거기서 이어감 */
    {const C=G.controls.input.cam,c=G.view.camera.position,dx=c.x-W.position.x,dz=c.z-W.position.z,dy=c.y-(W.position.y+1),h=Math.hypot(dx,dz);if(C&&h>.5){C.yaw=Math.atan2(dx,dz);C.pitch=Math.max(-.2,Math.min(1,Math.atan2(dy,h)));C.dist=Math.max(4,Math.min(13,Math.hypot(h,dy)/pk()));}}st.sailing=true;st.lastQ=null;G.ui.setQuest('');G.goal.set(null);qmark.show(false);
    const board=makeSkyBoard(root,{mob:MOB,seed:'space-venus:travel'});board.setAlpha(.001);import('./saturn.js').catch(()=>{});
    const BSC=32,RV=420,oSat=board.add({map:canvasTex(512,satCloudMap,256),rep:[14,8],ring:true,seg:[48,30]});oSat.U.uCrayK.value=.3; /* 끝에 화면 가득 다가오므로 쉼터의 큰 토성과 같은 겉면(가는 선 없음 — 2026-11-26) */board.place(oSat,0,0,1e-4);board.anchor.scale.setScalar(BSC);st.farMin=4300;st.sailPre=0;st.sailU=0;
    /* 금성(2026-11-23 — 떠나는 장면이 끊기지 않게, 화성을 떠날 때와 같은 방식): 구름 바다 바로 아래에 진짜 둥근 금성(반지름 RV)을 둠 → 먼 바다 판 대신 이 구가 수평선(안개 색 한 가지) → 올라갈수록 수평선이 둥글게 휘며 내려가고
       → 구름 섬이 안개에 묻히면 숨기고 구의 구름 결이 드러남 → 아래로 멀어지며(drop) 화면 왼쪽 아래 작은 구로 → 화면 밖 */
    const gV=makeOrb(root,{map:canvasTex(256,venusMap,128),rep:[4,2],seg:[96,64]});gV.g.visible=false;gV.halo.visible=false;gV.U.uFlat.value=1;gV.body.rotation.set(1.05,0,.5); /* 구의 꼭짓점(무늬가 한 점으로 모이는 곳)이 위에서 안 보이게 기울임 */let scn=root;while(scn.parent)scn=scn.parent;
    const _q=new THREE.Quaternion(),_pw=new THREE.Vector3(),_ps=new THREE.Vector3(),_d=new THREE.Vector3(),_n=new THREE.Vector3(),_up=new THREE.Vector3(),ZAX=new THREE.Vector3(0,0,1),VL=new THREE.Vector3(-.55,.75,.35).normalize(),SL=new THREE.Vector3(.7,.45,.3).normalize();
    /* 길(2026-11-26 새로): ① 출발 — '둥' 하고 힘 있게 떠올라 처음이 가장 빠르고(초당 약 35m) 금성 위 60m에서 잦아듦(u .34) → ② 지도(UM에서 비행을 잠깐 멈춤) → ③ 우주 — 천천히 빨라져(슬로우 인) 토성 앞에서 느려짐 */
    const UM=.36,pathF=u=>{const a=Math.min(1,u/.34),up=60*(1-Math.pow(1-a,2.6)),b=ss(UM,1,u);return {x:P0.x-20*(1-Math.pow(1-a,2))-520*b,y:P0.y+.1+up+205*b,z:P0.z+10*ss(.1,.6,u)};};
    let lines=null,oM=null,oJ=null,side=1;
    const P0=W.position.clone();let flyU=0,spc=false,wi=-1;
    /* 카메라(2026-11-21 — 예전 공통 차례는 뒷모습이 6초 넘게 이어졌다): 둘 다 뒤를 보고 타므로 배 뒤쪽에서 보면 늘 얼굴. 키 = [비행 진행, 얼굴 기준 방향(0 = 정면), 위아래, 거리].
       움직이기 시작·멈춤을 이동 음악의 마디 경계에 맞춤(곡 한 마디 약 1.38초 — 비행이 시작될 때 곡 자리를 읽어 마디 경계 b[0]… 를 비행 진행 값으로 바꿈):
       거꾸리 쪽 앞옆 → 1마디 동안 조금 옆·위로(발아래 구름) → 1마디 동안 얼굴 앞을 지나 반대쪽 옆모습(멀어지는 금성) → 2마디에 걸쳐 등 뒤를 한 번에 돌아(멈추지 않음 — 뒷모습 약 1.2초, 다가오는 토성) 거꾸리 쪽 옆 → 마지막에 거꾸리 쪽 앞옆 가까이.
       각도 음수 = 거꾸리가 선 쪽(북쪽): 그쪽 앞옆에서는 앞에 선 원더룹이 거꾸리를 가리지 않는다 */
    /* 카메라 키(2026-11-26 새로 — [비행 진행, 얼굴 기준 방향(0 = 정면), 위아래, 거리]): 가까이 → 솟구치는 배를 낮은 데서 올려다보며 물러남 → 위에서(발아래 금성 구름이 멀어짐) → (지도) →
       얼굴 가까이(줌인 — 배가 천천히 돌기 시작) → 옆으로 물러나며(줌아웃 — 스쳐 가는 것들) → 다시 앞 가까이 → 원더룹 정면 한가운데(뒤로 토성과 고리) */
    const CK=[[0,-.4,.14,4.6],[.07,-.32,-.1,7.6],[.2,.28,.4,10.8],[UM,.38,.42,11.4],[.42,.3,.28,9.2],[.52,-.28,.1,6.0],[.64,-.72,.12,8.6],[.76,-.2,.06,6.6],[.9,0,.03,5.6],[1,0,.02,4.9]],mkCam=()=>{mkSpace();};
    /* 우주에 떠 있는 것(제자리 — 배가 지나가면 스쳐 감): 길 둘레의 별빛 줄기(선 묶음 1회) · 얼음 덩이(한 덩어리 1회) · 작은 화성·목성(지나가는 길의 행성 궤도 — 구 둘) */
    const mkSpace=()=>{if(lines)return;const RS=rng('space-venus:sail'),cz=G.view.camera.position.z-W.position.z;side=cz>0?-1:1; /* 옆에서 볼 때 카메라 건너편 */
      {const N=MOB?170:320,pos=new Float32Array(N*6),col=new Float32Array(N*6);
        for(let i=0;i<N;i++){const u=.34+.64*RS(),a=pathF(u-.01),b2=pathF(u+.01),tx=b2.x-a.x,ty=b2.y-a.y,tz=b2.z-a.z,L=Math.hypot(tx,ty,tz)||1,T=[tx/L,ty/L,tz/L],ang=RS()*PI*2,rr=4+Math.pow(RS(),1.6)*34,len=3+RS()*7,k=.5+.5*RS(),c=RS()<.5?[.8,.92,1]:[1,.95,.85],
            x=(a.x+b2.x)/2-T[2]*Math.cos(ang)*rr,y=(a.y+b2.y)/2+Math.sin(ang)*rr*.8,z=(a.z+b2.z)/2+T[0]*Math.cos(ang)*rr;
          pos.set([x,y,z,x+T[0]*len,y+T[1]*len,z+T[2]*len],i*6);col.set([0,0,0,c[0]*k,c[1]*k,c[2]*k],i*6);}
        const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
        const m=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,opacity:0});m.userData.noBend=true;
        lines=new THREE.LineSegments(geo,m);lines.frustumCulled=false;lines.userData.noMerge=true;lines.name='venus-sail-streaks';lines.visible=false;root.add(lines);}
      {const list=[],CC=['#cfe3f4','#dccdf0','#f3ead6','#b9cfe8'],n=MOB?7:11;
        for(let i=0;i<n;i++){const u=.4+.52*RS(),p=pathF(u),sg=RS()<.7?side:-side,rr=8+RS()*17,r=.6+RS()*2.2,geo=new THREE.IcosahedronGeometry(r,1);geo.scale(1,.7+RS()*.5,.8+RS()*.4);geo.rotateY(RS()*6);geo.rotateX(RS()*3);geo.translate(p.x+(RS()-.5)*6,p.y+(RS()-.35)*9,p.z+sg*rr);list.push([geo,CC[i%4]]);}
        const me=lump(list,false,.5);me.frustumCulled=false;me.userData.noMerge=true;me.name='venus-sail-rocks';root.add(me);st.sailRocks=me;me.visible=false;}
      {const mk=(map,rp,r,u,lat,up)=>{const o=makeOrb(root,{map,rep:rp,seg:[28,18]}),p=pathF(u);o.g.position.set(p.x,p.y+up,p.z+side*lat);o.g.scale.setScalar(r);o.U.uL.value.copy(SL);o.g.visible=false;return o;};
        oM=mk(canvasTex(256,marsMap,128),[3,2],4.2,.56,30,5);oJ=mk(canvasTex(256,jupiterMap,128),[4,2],13,.75,80,12);}};let camOn=false,lastS=null,lastW=null,zAcc=0;const _bv=new THREE.Vector3(),zip=points(root,MOB?90:160,{map:glowTex,add:true,size:.42,grav:0,drag:0});
    /* 배가 빙글 돌면서 날아감(2026-11-25 — 달 → 화성처럼): 떠오르며 한 바퀴 → 우주에서 천천히 두 바퀴 → 토성 앞에서 멈춰 원래 방향(카메라 키는 가는 방향 기준이라 그대로 — 화면에서 배와 둘이 돎) */
    const bspin=u=>{const a=PI*2*Math.pow(ss(.44,.86,u),1.25);return a-.8*Math.sin(a);}; /* 우주에서 한 바퀴만(2026-11-26 — 예전 세 바퀴): 천천히 시작(슬로우 인), 얼굴이 카메라 쪽일 때 천천히·등은 휙 */
    /* 2026-11-26: 탈것은 별똥별 리본(공통 틀) — 이 carrier는 하늘·배경만 맡음(ribbonAt:-1) */
    /* 2026-11-27: 얼음 배가 원더룹을 띄워 올림 → 우주에 닿으면 배는 투명해지며 사라지고 원더룹은 두 팔을 벌리고 둥실 → 토성이 가까워지면 배가 다시 나타나 태움(토성에는 배를 타고 내림) */
    const bm=boat.children[0].material,boatK=u=>1; /* 2026-11-27 두 번째: 얼음 배는 사라지지 않고 끝까지 원더룹을 태우고 감 */
    const carrier={hang:false /* plain 아님 — 달 → 화성처럼 출발할 때 몸이 쭉 늘어났다 돌아오고 날아가는 내내 몸이 흔들림(배도 함께 기우뚱) */,pose:{grab:'서기',fly:u=>u<.06||u>.9?'서기':'팔 벌리기'},lift:T=>.55*ss(.2,2.5,T)-.5*ss(2.9,3.7,T) /* 살짝 떠올랐다 꾹 가라앉고 → 둥! */,stop(){},dispose(){bm.opacity=1;},
      late(dt,t){const T=lastS?lastS.t:0,Tf=Math.max(0,T-3.75),k0=T>3.75?ss(0,.12,Tf)*Math.exp(-Tf*1.5)*1.25:0,k=boatK(flyU);boat.visible=k>.01;bm.opacity=k;
        boat.rotation.set(Math.sin(t*1.3)*.03+k0*.1*Math.sin(T*6.1)+W.rotation.z*1.5,0,Math.sin(t*1.1)*.04+k0*.15*Math.sin(T*5.2+1)-W.rotation.x*1.5+.1*Math.sin(t*.9)*ss(.1,.3,flyU));boat.position.copy(W.position);boatStand(boat,0,0,_bv);boat.position.add(W.position).sub(_bv);},
      tick(dt,t,s2,wp){lastS=s2;if(!lines&&s2.t>.6)mkSpace(); /* 2026-11-27: 우주에 떠 있는 것들은 떠오르기 전에 미리 만들어 둠(날기 시작하는 순간에 만들면 그 프레임이 멈칫했다) */
        /* 속도감(2026-11-23 — 제자리에서 돌기만 하고 배경이 다가오는 느낌이었다): 가는 길 앞쪽 둘레에 얼음빛 알갱이를 뿌려 두면(제자리에 떠 있음) 배가 빠를수록 휙휙 스쳐 지나감 + 배 뒤로 반짝이 꼬리.
           알갱이 수는 속도에 비례(느린 출발·도착에는 거의 없음) — 점 묶음 하나(그리기 1, 우주에서만) */
        {zip.tick(dt);const v=lastW?Math.hypot(wp.x-lastW.x,wp.y-lastW.y,wp.z-lastW.z)/Math.max(dt,1e-3):0;st.sailV=(st.sailV||0)+(v-(st.sailV||0))*Math.min(1,dt*6);if(lastW&&flyU>.004&&flyU<.985&&v>4&&!st.sailPause){const dx=(wp.x-lastW.x),dy=(wp.y-lastW.y),dz=(wp.z-lastW.z),L=Math.hypot(dx,dy,dz)||1,ux=dx/L,uy=dy/L,uz=dz/L,hl=Math.hypot(ux,uz),qx=hl>.2?-uz/hl:0,qz=hl>.2?ux/hl:1,vx=uy*qz,vy=uz*qx-ux*qz,vz=-uy*qx; /* 길에 수직인 두 방향(곧게 솟을 때도 둘레에 고르게) */zAcc+=dt*Math.min(MOB?46:90,v*1.6);
            while(zAcc>=1){zAcc-=1;const a=Math.random()*PI*2,r=2.2+Math.random()*7.5,f=v*(.35+Math.random()*1.1),px=-uz,pz=ux /* 길에 수직(수평) */,c=Math.random()<.5?[.8,.92,1]:[1,.96,.86];
              zip.emit(wp.x+ux*f+(qx*Math.cos(a)+vx*Math.sin(a))*r,wp.y+uy*f+vy*Math.sin(a)*r+.6,wp.z+uz*f+(qz*Math.cos(a)+vz*Math.sin(a))*r,0,0,0,1.5,c);}
            if(Math.random()<dt*26)zip.emit(wp.x-ux*1.2+(Math.random()-.5)*.8,wp.y-uy*1.2+.1+Math.random()*.4,wp.z-uz*1.2+(Math.random()-.5)*.8,-ux*2,-uy*2,-uz*2,1.1,[.85,.95,1]);}
          lastW=lastW||new THREE.Vector3();lastW.set(wp.x,wp.y,wp.z);}
        faceTo(gg.root,wp.x,wp.z);st.ggMode='wave';/* 배·거꾸리는 원더룹 자리를 따라감(원더룹은 배 뒤쪽에 서서 뒤를 봄) */
        const cam=G.view.camera,a=Math.pow(Math.max(.001,Math.min(1,SK.t-1)),1.5),u=flyU,pt=cam.aspect<1;board.tick(dt,t,cam);board.setAlpha(a);board.anchor.visible=a>.01; /* 별은 하늘이 짙어지는 만큼 서서히 */
        board.place(board.sunGlow,pt?-.45:-.66,pt?.84:.76,pt?1:.8);board.place(board.sun,pt?-.45:-.66,pt?.84:.76,pt?.5:.4);
        st.sailPre=s2.phase==='fly'?1:Math.max(st.sailPre||0,ss(.4,3.3,s2.t));st.sailU=u;
        /* 금성: 먼 바다 판(안개에 다 묻힌 뒤) 대신 둥근 구가 수평선 → 구름 섬을 숨긴 뒤 구름 결이 드러나고 아래로 멀어짐 → 화면 왼쪽 아래 작은 구 → 화면 밖 */
        if(!st.ringOff&&s2.phase==='fly'&&(st.sailFar||99)<44){st.ringOff=true;const ix=ground.geometry.index;ground.geometry.setDrawRange(0,ix.count-24);}
        {const g=gV.g,ex=ss(.7,.84,u);g.visible=!!st.ringOff&&ex<.98;if(g.visible){const k2=ss(.35,.45,u),kk=ss(.38,.8,u),as=Math.min(1,cam.aspect),sz=1.0*Math.pow(.16,kk)*(1-.4*ex),tv=Math.tan(cam.fov*PI/360),th=tv*cam.aspect,d=600,drop=2400*Math.pow(ss(.33,.85,u),1.4);
            _pw.set(P0.x,SEA-.8-RV-drop,P0.z);_ps.set((lerp(0,pt?-.5:-.6,kk)-1.6*ex)*th*d,(lerp(-.3,-.42,kk)-sz*as-.5*ex)*tv*d,-d).applyQuaternion(cam.quaternion).add(cam.position);
            g.position.lerpVectors(_pw,_ps,k2);g.scale.setScalar(lerp(RV,sz*Math.min(tv,th)*d,k2));gV.U.uL.value.copy(VL);gV.U.uFlat.value=1-ss(.33,.43,u);if(scn.fog)gV.U.uFlatC.value.copy(scn.fog.color);
            gV.halo.visible=k2>.6;gV.halo.quaternion.copy(cam.quaternion);}}
        /* 토성(지름이 금성의 약 10배): 화면 자리가 아니라 가는 쪽 하늘의 한 방향에 박혀 있음(카메라가 돌면 화면에서 따라 움직임 — 우리가 그쪽으로 가는 느낌).
           크기는 남은 거리로(원근 — 멀리 작은 점 → 천천히 → 마지막에 확 커져 화면을 덮음), 끝에는 고리 면 바로 위로 내려앉아 고리가 발아래 들판처럼 깔림 */
        {const on=u>.4,g=oSat.g;g.visible=on;if(on){const pp=ss(UM,1,u),e1=ss(.8,1,u),thS=Math.atan((pt?.2:.33)/(1+28*(1-pp)))*ss(.4,.47,u),psi=.12*(1-e1)*(st.satSide||1),el=lerp(.1,pt?-.04:-.06,e1),be=lerp(.26,.17,ss(.7,1,u)), /* 끝(2026-11-26): 원더룹 정면 뒤 한가운데에 — 둥근 윗가장자리와 고리가 화면 안에 들어오는 크기(반지름 가로 화면 약 18°·세로 화면 약 11°) */ /* 끝: 반지름 약 32°(가로 화면 대부분) — 한쪽 가장자리와 발아래 고리 면이 보이게 가운데를 옆으로 */c=board.D;
            _d.set(-Math.cos(psi)*Math.cos(el),Math.sin(el),Math.sin(psi)*Math.cos(el));{const kc=ss(.7,.9,u);if(kc>0){cam.getWorldDirection(_ps);_ps.y+=pt?.03:.05;_ps.normalize();_d.lerp(_ps,kc).normalize();}} /* 끝(2026-11-26 이동 통일): 원더룹이 가는 쪽을 보므로 얼굴 앞 카메라에서는 토성이 등 뒤 — 카메라가 보는 쪽 하늘로 옮겨 와 원더룹 뒤 한가운데에 */g.parent.getWorldQuaternion(_q).invert();
            g.position.copy(_d).applyQuaternion(_q).multiplyScalar(c);g.quaternion.copy(_q);g.scale.setScalar(c*Math.sin(thS));
            _up.set(0,1,0).addScaledVector(_d,-_d.y).normalize();_n.copy(_up).multiplyScalar(Math.cos(be)).addScaledVector(_d,-Math.sin(be));_ps.crossVectors(_d,_n);_n.multiplyScalar(Math.cos(.14)).addScaledVector(_ps,Math.sin(.14)).normalize();
            oSat.ring.quaternion.setFromUnitVectors(ZAX,_n);oSat.U.uRn.value.copy(_n);oSat.U.uL.value.copy(SL);oSat.halo.quaternion.copy(cam.quaternion);}}
        /* 스쳐 가는 것들: 별빛 줄기는 빠를수록 또렷 · 얼음 덩이 · 작은 화성·목성 */
        {const v=st.sailV||0,inS=!!st.hid&&u<.99;if(lines){lines.visible=inS;lines.material.opacity=Math.min(1,v/40)*(1-ss(.93,1,u));}if(st.sailRocks)st.sailRocks.visible=inS;
          for(const o of [oM,oJ])if(o){o.g.visible=inS;o.halo.quaternion.copy(cam.quaternion);}}
        st.sailFog=ss(.03,.2,u);if(u>.15&&!st.hid){st.hid=true; /* 2026-11-26: 빨리 솟으므로 일찍(구름 탑이 안개 색 그림자로 떠 보였다) */keep.forEach(o=>{if(o!==boat)o.visible=false;});}
        if(Math.floor(s2.t/2.1)!==wi){wi=Math.floor(s2.t/2.1);if(s2.t>2.4)G.sound.sfx('event-wind',{gain:.5});}}};
    const dep=departure({G,root,WL:W,groundY,mob:MOB,fly:13,carrier,camk:CK,after:3.6+.75+.06+3.1,
      /* 길(2026-11-23): 천천히 떠나(슬로우 인) 우주 한가운데에서 가장 빠르고 토성 앞에서 느려짐(슬로우 아웃) — 예전: 끝까지 빨라지기만 */
      path:pathF,pre:T=>[.22-.08*ss(.3,3.4,T),6.5-2.2*ss(.3,3.4,T)], /* 2026-11-23 두 번째: 먼저 구름 바다 위로 40m 떠오르고(발아래가 멀어짐) 그다음 우주로 — 길이도 길게(가장 빠를 때 초당 약 75m) */
      onFly:u=>{flyU=u;if(!camOn){camOn=true;mkCam();G.sound.sfx('event-whoosh',{gain:1.1});G.sound.sfx('land',{gain:.9,pitch:.6});} /* 둥!(소리만 — 2026-11-27: 화면 흔들기는 뺌, 배가 떠오르는 순간 화면이 떨려 보였다) */
        if(u>.02&&!spc){spc=true;SK.to(2,3.4);}
        /* 우주 지도는 금성을 막 떠났을 때(2026-11-26 — 예전: 토성에 거의 다 와서 떠 흐름이 끊겼다): 비행을 잠깐 멈추고 지도 → 걷히면 이어서 날아감. 끝은 지도 없이 '원더룹 정면 + 토성' → 덮개 → 도착 */
},
      onEnd:async()=>{await landOn(G,'space-saturn',{from:ZID,pend:{boat:true},map:()=>G.travel.mapFor(SPACE,ZID,'space-saturn',F),sfx:'event-whoosh',before:()=>{st.depTick=null;st.depLate=null;dep.stop();}});res();}});
    st.dep=dep;mark('sail');st.depTick=dt=>{if(!st.sailPause)dep.tick(dt,G.clock.t);};st.depLate=dt=>dep.late(dt,G.clock.t);});}
  /* ── 또생일(첫 미션: 바람 타고 생일 초 잡기) ── */
  G.dialog.npc({id:'geokkuri',name:'거꾸리',root:gg.root,bubbleY:gg.head+.72 /* 해시계 모자 위로(2026-11-27 — 말풍선 꼬리가 모자 속에 묻혔다) */,talkR:.9,bubbleR:4.5,variants:[{when:()=>true,lines:[]},{when:()=>!!F[K.met]&&!F[K.sun]&&!st.scene&&!st.carry&&gg.root.visible&&(st.ggWait||G.dialog.talking()),lines:[T2.again]},
    {when:()=>!!F[K.sun]&&!st.scene&&!st.carry&&st.gate.ph==='snore'&&gg.root.visible&&(st.ggWait||G.dialog.talking()),lines:[T2.again2]},{when:()=>!!F[K.clear]&&!st.scene&&!st.sailing&&!st.carry&&gg.root.visible,lines:[T2.goAsk]}]}); /* 뒤에 있는 맞는 묶음이 이김(dialog rawLines) — 빈 묶음을 맨 앞에 */
  G.dialog.npc({id:'munge',name:'뭉게 문지기',root:munge.root,bubbleY:2.3,talkR:1.4,bubbleR:.01,variants:[{when:()=>true,lines:[]}]}); /* 말 걸 상대가 아님(자는 중) — 대사 줄에서 이름으로 찾을 수 있게만 */
  G.dialog.npc({id:'ddo',name:'또생일',root:ddo.root,bubbleY:1.0,talkR:1.5,bubbleR:4.5,talkCam:true,
    variants:[{when:()=>true,lines:[]},{when:()=>!!F[K.ask]&&!F[DISC.day]&&caught()<3&&!st.scene&&!st.ride,lines:[T2.wait]},{when:()=>!!F[DISC.day]&&!st.scene,lines:[T.d15]}]});
  const cakeMark=new THREE.Object3D();cakeMark.position.set(CAKE[0],groundY(...CAKE)+TBH+.3,CAKE[1]);add(cakeMark);
  /* 부탁: 또생일에게 다가가면 저절로 — S3-015 → S3-021 → 친구 카드 */
  async function ddoAsk(W,U){mark('ask0');await scene(async()=>{const P=W.position;W.rotation.y=Math.atan2(ddo.root.position.x-P.x,ddo.root.position.z-P.z);
      /* 2026-11-23: 4m 밖에서 대화가 시작되면 세로 화면 대화 카메라에 둘이 다 못 들어와 원더룹이 왼쪽 끝에 잘렸다 → 먼저 또생일 앞 2.3m까지 걸어감 */
      {const d=ddo.root.position,dx=P.x-d.x,dz=P.z-d.z,L=Math.hypot(dx,dz)||1;if(L>2.6){const to=[d.x+dx/L*2.3,d.z+dz/L*2.3],a=[P.x,P.z],TT=Math.max(.3,(L-2.3)/3.4),t1=G.clock.t;U.action='걷기';U.at=0;
          await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t1)/TT),x=lerp(a[0],to[0],u),z=lerp(a[1],to[1],u);W.position.set(x,groundY(x,z),z);return u>=1;},TT+1);U.action='서기';U.at=0;st.lastP=null;}}
      await G.view.meetCard('ddo',ddo.root,ddo.head+.2); /* 확대 → 친구 카드 → 대화 */const pc=G.view.pairCam(ddo.root,ddo.head);if(pc)G.view.hold(pc);
      st.ddoHop=9;await say('또생일',T.d15,5.4);await say('또생일',T2.ask,4.2);candOn.forEach((_,i)=>{candOn[i]=!F[K.c[i]];});await say('또생일',T2.party,2.6);st.ddoHop=0; /* 대화 동안 우산은 또생일 옆에 가만히(2026-11-23 — 대사 중에 발판으로 날아가 왔다 갔다 해 보였다) */
      if(pc&&G.view.req&&G.view.req.fn===pc)G.view.hold(null);
      /* 또생일이 먼저 둥실 떠올라 바람을 타고 서쪽으로(안개 속으로 작아지며 사라짐) → 파티장 단상에서 기다림 */
      G.sound.sfx('event-whoosh',{gain:.6});st.ddoFly={t:0};await G.core.until(()=>!st.ddoFly,4);ddoHome(true); /* 사라진 뒤에는 파티장 단상(케이크 옆)에서 기다림 — 예전엔 부탁 표시를 켜기 전에 불러 처음 자리에 다시 나타났고, 그 뒤로도 그 자리에 남았다(2026-11-23) */
      st.umbHop=0;G.sound.sfx('event-wind',{gain:.45});
      {const Wp=W.position,m=[(Wp.x+PAD[0])/2,(Wp.z+PAD[1])/2],dx=PAD[0]-Wp.x,dz=PAD[1]-Wp.z,L=Math.hypot(dx,dz)||1,c=G.view.camera.position,sg=((c.x-m[0])*(-dz)+(c.z-m[1])*dx)>0?1:-1,k=pk(),gy=groundY(m[0],m[1]),
          uc=()=>({at:[m[0],gy+1.5,m[1]],from:[m[0]-dz/L*sg*8.5*k,gy+4.4+1.2*(k-1),m[1]+dx/L*sg*8.5*k]}); /* 우산이 날아가 내려앉는 것이 화면에 들어오게: 원더룹과 발판 사이를 옆에서(지금 카메라 쪽) */
        G.view.hold(uc);await wait(2.9);if(G.view.req&&G.view.req.fn===uc)G.view.hold(null);} /* 또생일이 사라진 다음에 우산이 발판 위로 날아가 둥실 떠서 기다림 */
      G.state.setFlag(K.ask,true);G.state.setFlag(K.ddo,true);mark('ask');},null);}
  /* 바람 타기: 발판에 올라서면 파티 우산이 펼쳐지고 정해진 바람길을 둥실(WSEC초). 조이스틱·WASD·방향키로 좌우·위아래 조금씩 — 공중의 초에 닿으면 잡힘(잡은 초는 저장).
     카메라는 따라가기 카메라의 각도만 매 프레임 정함(원더룹 뒤 약간 위 — 다음 초 쪽을 봄). 타는 동안 조이스틱은 그대로 보인다(U.riding.steer — game/layout) */
  const wcurve=new THREE.CatmullRomCurve3(WIND.map(([x,h,z])=>new THREE.Vector3(x,Math.max(SEA,groundY(x,z))+h,z)),false,'catmullrom',.5),_wp=new THREE.Vector3(),_wt=new THREE.Vector3();
  const candAt=CAND.map(([u,la,up])=>{const p=wcurve.getPointAt(u),t=wcurve.getTangentAt(u),l=Math.hypot(t.x,t.z)||1;return new THREE.Vector3(p.x-t.z/l*la,p.y+up+.7,p.z+t.x/l*la);});
  cands.forEach((c,i)=>{c.position.copy(candAt[i]);candOn[i]=!!F[K.ask]&&!F[K.c[i]]&&!F[DISC.day];c.visible=false;}); /* 부탁을 받은 뒤에만 보임(그 전에는 그리지 않음) */
  function rideStart(W,U){if(U.stopWalk)U.stopWalk();U.riding={y:W.position.y,carry:true,steer:true};U.at=0;G.sound.sfx('event-sparkle',{gain:1.1}); /* 뾰로롱 — 2026-11-27: 놀이용 코드 배경음은 빼고 금성 배경음 그대로 */if(U.setExpr)U.setExpr('반짝 신남');{const c=G.view.camera.position;W.position.set(PAD[0],groundY(...PAD)+.3,PAD[1]);U.riding.y=W.position.y;U.action='팔 벌리기';st.ride={t:0,pre:0,f0:Math.atan2(c.x-PAD[0],c.z-PAD[1]),lat:0,up:0,yaw:null,n0:caught()};}st.rode=true;st.padArm=false;umb.visible=true;umb.scale.setScalar(1);
    G.goal.set(null);G.sound.sfx('jump',{gain:.6});puffAt(PAD[0],PAD[1],MOB?10:16,1);mark('ride'+(st.rideN=(st.rideN||0)+1));}
  /* 바람길 진행: 고른 빠르기로 가다가 마지막 25%(파티장 가까이)는 천천히(끝에서 35%) 내려앉음 */
  const rideU=r=>{const s=Math.min(1,r.t/WSEC),a=1.0884;return s<.75?a*s:Math.min(1,a*s-1.415*(s-.75)*(s-.75));};
  function rideTick(dt,t,W,U){const r=st.ride;
    /* 끝(1.3초 — 2026-11-21): 내려앉으며 우산이 천천히 멈추고 한 바퀴 돌아 카메라 쪽(앞)을 보고 섬 — 성공이든 실패든 뒷모습으로 끝나지 않게 */
    if(r.post){const p=r.post;p.t+=dt;const u=Math.min(1,p.t/1.3),e=1-Math.pow(1-u,3),c=G.view.camera.position,fc=Math.atan2(c.x-LAND[0],c.z-LAND[1]),gy=groundY(...LAND);
      W.rotation.y=p.ry+(wrapA(fc-p.ry)+PI*2)*e;W.rotation.z=p.rz*(1-e);W.position.set(lerp(p.x,LAND[0],e),lerp(p.y,gy,e)+Math.sin(u*PI)*.1,lerp(p.z,LAND[1],e));U.riding.y=W.position.y;if(u>=1){W.rotation.y=fc;rideEnd(W,U);}return;}
    /* 출발(1.15초 — 화성 먼지 회오리를 탈 때처럼): 발판 위에서 카메라 쪽(앞)을 보며 한 바퀴 돌고 내려온 우산을 잡은 뒤 떠남. 다시 탈 때 뒤돌아 선 채 출발하지 않게(2026-11-20) */
    if(r.pre<9){r.pre+=dt;const u=Math.min(1,r.pre/2.3),e=u*u*u*(u*(6*u-15)+10);W.rotation.y=r.f0+PI*2*e; /* 2026-11-27: 천천히 한 바퀴(2.3초 — 예전 1.15초는 뱅글뱅글 가벼워 보였다) 돌고 자리 잡음 */W.position.y=groundY(...PAD)+.3+Math.sin(u*PI)*.25;U.riding.y=W.position.y;if(u>.8&&U.action!=='우산 잡기'){U.action='우산 잡기';U.at=0;}if(u>=1){r.pre=9;G.sound.sfx('event-whoosh',{gain:.9});}return;}
    r.t+=dt;const u=rideU(r),I=G.controls.input,a=I.axes(),k=I.keys,env=ss(0,.07,u)*(1-ss(.9,1,u));
    r.lat=Math.max(-2.3,Math.min(2.3,r.lat+(a.s+(k.ArrowRight?1:0)-(k.ArrowLeft?1:0))*2.9*dt));r.up=Math.max(-1.4,Math.min(1.4,r.up+(a.f+(k.ArrowUp?1:0)-(k.ArrowDown?1:0))*2.3*dt));
    wcurve.getPointAt(u,_wp);wcurve.getTangentAt(u,_wt);const l=Math.hypot(_wt.x,_wt.z)||1,rx=-_wt.z/l,rz=_wt.x/l,x=_wp.x+rx*r.lat*env,z=_wp.z+rz*r.lat*env,y=_wp.y+r.up*env+Math.sin(t*1.9)*.12*env;
    W.position.set(x,y,z);U.riding.y=y;{const ty=Math.atan2(_wt.x,_wt.z);W.rotation.y=ty+Math.atan2(Math.sin(r.f0-ty),Math.cos(r.f0-ty))*(1-ss(0,.7,r.t));}W.rotation.z=-r.lat*.06+Math.sin(t*1.7)*.05;
    /* 초 잡기(반짝 + 종소리) */
    cands.forEach((c,i)=>{if(!candOn[i]||st.dbgMiss)return;if(c.position.distanceTo(_wp.set(x,y+.7,z))<CATCH){candOn[i]=false;c.visible=false;G.state.setFlag(K.c[i],true);mark('c'+(i+1));G.sound.sfx('event-sparkle',{gain:1});G.sound.sfx('travel-step',{step:5+i*2,gain:1.1});G.react.react('joy',{sound:null,bounce:false,sec:.9});G.ui.setQuest(`생일 초 ${caught()}/3`);
        for(let j=0;j<(MOB?10:18);j++){const an=Math.random()*PI*2;puffs.emit(c.position.x,c.position.y,c.position.z,Math.cos(an)*1.6,.6+Math.random(),Math.sin(an)*1.6,1+Math.random()*.6,[1,.92,.55]);}st.lastQ=null;}});
    /* 바람 줄기: 가는 길 앞쪽으로 흰 알갱이가 흘러감 */
    r.ws=(r.ws||0)-dt;if(r.ws<=0){r.ws=2.1;G.sound.sfx('event-wind',{gain:.85});} /* 바람 소리: 타는 동안만 조금 크게 */
    if(Math.random()<dt*(MOB?9:14)){const q=wcurve.getPointAt(Math.min(1,u+.02+Math.random()*.1)),tt=wcurve.getTangentAt(Math.min(1,u+.05));puffs.emit(q.x+(Math.random()-.5)*3,q.y+.4+(Math.random()-.5)*2,q.z+(Math.random()-.5)*3,tt.x*3,tt.y*3,tt.z*3,1.6,[1,1,1]);}
    /* 카메라: 원더룹 뒤 약간 위 — 아직 안 잡은 다음 초(앞쪽 22m 안)가 있으면 그쪽을 봄 */
    {const C=I.cam;if(C){let hx=_wt.x,hz=_wt.z;const nx=cands.findIndex((c,i)=>candOn[i]&&CAND[i][0]>u-.01);if(nx>=0&&CAND[nx][0]-u<.3){const c=cands[nx].position,w=pk()>1.3?.85:.6;hx=hx/l*(1-w)+(c.x-x)/(Math.hypot(c.x-x,c.z-z)||1)*w;hz=hz/l*(1-w)+(c.z-z)/(Math.hypot(c.x-x,c.z-z)||1)*w;}
      const yw=Math.atan2(-hx,-hz)+(st.dbgYaw||0);if(r.yaw==null)r.yaw=yw;r.yaw+=Math.atan2(Math.sin(yw-r.yaw),Math.cos(yw-r.yaw))*Math.min(1,dt*2.4);C.yaw=r.yaw;const hi=ss(.03,.16,u)*(1-ss(.84,.99,u));C.pitch+=(lerp(.34,pk()>1.3?.62:.52,hi)-C.pitch)*Math.min(1,dt*2.5);C.dist+=(lerp(pk()>1.3?5.4:6.6,pk()>1.3?7.6:9.6,hi)-C.dist)*Math.min(1,dt*2.5);if(st.dbgDist){C.dist=st.dbgDist;C.pitch=.12;r.yaw=yw;C.yaw=yw;}}} /* 떠오르면 더 뒤·위에서(원더룹·다음 초·발아래 구름 섬과 바다가 함께), 내려앉을 때 다시 가까이 */
    if(r.t>=WSEC){r.post={t:0,ry:W.rotation.y,rz:W.rotation.z,x,y,z};G.sound.sfx('cloud-poof',{gain:.6});}}
  function rideEnd(W,U){const n=caught();st.ride=null;U.riding=null;umb.visible=false;U.action='서기';U.at=0;W.rotation.z=0;W.position.set(LAND[0],groundY(...LAND),LAND[1]);st.lastP=null;G.sound.sfx('land',{gain:.5});puffAt(LAND[0],LAND[1],MOB?8:14,.8);mark('rideEnd'+st.rideN);st.lastQ=null;music(base(),{fade:3});
    /* 앞(카메라 쪽)을 본 채: 성공 = 웃으면서 폴짝 / 실패 = 아쉬워하는 표정(걱정)과 어깨가 툭 떨어지는 한숨 → 구름이 출발점(동쪽 발판 옆)으로 데려다줌 */
    U.sceneLock=true;st.rideFace={t:0,ry:W.rotation.y};
    if(n<3){G.react.react('sigh',{sound:'event-whoosh'});if(U.setExpr)U.setExpr('걱정');G.ui.toast(T2.retry,2.6);mark('rideFail');G.core.wait(2.3).then(()=>{st.rideFace=null;if(U.setExpr)U.setExpr('기본');U.sceneLock=false;if(!st.scene&&!st.carry&&!st.ride){const bc=()=>{const k=pk(),Q=W.position;return {at:[Q.x+.9,1.9,Q.z+2.6],from:[Q.x+1.3,3.3+1.2*(k-1),Q.z-8.6*k]};};st.backCam={fn:bc,p:null};G.view.hold(bc); /* 되돌아갈 때(2026-11-22 — 따라가기 카메라는 너무 가까워 얼굴이 화면 아래에 크게 잘렸다): 남쪽으로 한 걸음 물러나 원더룹 전신·발판 위 우산·북쪽으로 뻗는 바람길이 한 화면에. 발판 쪽으로 걸어가면 풀림 */
          carryBack(W,[PAD[0]-2.1,PAD[1]-.9,Math.atan2(2.1,.9)],3.4).then(()=>{st.padArm=true;if(st.backCam)st.backCam.p=[W.position.x,W.position.z];});}});}
    else{if(U.setExpr)U.setExpr('기쁨');G.react.react('hop',{sound:'mission-clear'});st.ddoHop=2.2;mark('rideWin');G.core.wait(1.5).then(()=>{st.rideFace=null;if(U.setExpr)U.setExpr('기본');U.sceneLock=false;});}}
  const rideInfo=()=>{const r=st.ride;if(!r)return null;const u=rideU(r),i=cands.findIndex((c,j)=>candOn[j]&&CAND[j][0]>u-.012);const W=U0();return {u:+u.toFixed(3),lat:+r.lat.toFixed(2),up:+r.up.toFixed(2),next:i,dist:i>=0&&W?+cands[i].position.distanceTo(_wt.set(W.position.x,W.position.y+.7,W.position.z)).toFixed(2):null,need:i>=0?[CAND[i][1],CAND[i][2]]:[0,0],du:i>=0?+(CAND[i][0]-u).toFixed(3):1};};
  G.interact.add({root:cakeMark,at:[CAKE[0]-.95,CAKE[1]+.7],face:CAKE,label:'초 꽂기',action:'팔 벌리기',dur:.5,near:2.3,once:false,when:()=>caught()>=3&&!F[DISC.day]&&!st.scene&&!st.ride&&!G.ui.cardShown(),
    onDone:()=>scene(async(W)=>{mark('cake');
      /* 구도(2026-11-21 다시 — 원더룹 얼굴이 보이게): 원더룹(왼쪽)·케이크(가운데 앞)·또생일(오른쪽, 단상 위)이 화면 가로로 고르게 벌어지는 쪽에서 봄 — 케이크가 원더룹과 또생일의 한가운데에 오는 가로축 r을 구하고(원더룹 기준 케이크·r = 또생일·r ÷ 2),
         그 축에 수직인 두 쪽 가운데 케이크가 앞에 오는 쪽에 카메라. 원더룹은 케이크를 보고 섬 = 카메라에서 3/4 얼굴(대사 동안 또생일 쪽으로 돌아서지 않게 say에 look:'케이크', 또생일은 원더룹을 봄). 예전: 또생일이 말하면 원더룹이 또생일 쪽으로 돌아 뒷모습 + 케이크가 몸을 가림 */
      const cam3=()=>{const c=G.view.camera,P=W.position,d=ddo.root.position,kx=CAKE[0]-P.x,kz=CAKE[1]-P.z,dx=d.x-P.x,dz=d.z-P.z;let rx=-(kz-dz/2),rz=kx-dx/2;{const l=Math.hypot(rx,rz)||1;rx/=l;rz/=l;}if(dx*rx+dz*rz<0){rx=-rx;rz=-rz;}
        let nx=-rz,nz=rx;if(kx*nx+kz*nz<0){nx=-nx;nz=-nz;}const wd=dx*rx+dz*rz,cx=P.x+rx*wd/2+nx*.1,cz=P.z+rz*wd/2+nz*.1,Wd=wd+2.3,th=Math.tan(15*PI/180),D=Math.max(3.1/2/th,Wd/2/(th*c.aspect))*1.1,pt=c.aspect<1;
        return {at:[cx,groundY(cx,cz)+(pt?.8:1.05),cz],from:[cx+nx*D,groundY(cx,cz)+1.5+D*.1,cz+nz*D]};};
      W.rotation.y=Math.atan2(CAKE[0]-W.position.x,CAKE[1]-W.position.z);faceTo(ddo.root,W.position.x,W.position.z);G.view.hold(cam3);st.cakeCam=cam3;
      /* 초 셋이 원더룹 손에서 반짝이며 케이크 위로 날아가 꽂힘(2026-11-20 — 예전: 식탁 위 케이크를 향해 고개·몸을 숙였다) */
      W.userData.action='팔 벌리기';W.userData.at=0;st.fly=cands.map((c,i)=>({i,t:-i*.24,a:[W.position.x,W.position.y+1.55,W.position.z]}));await G.core.until(()=>!st.fly,4);W.userData.action='서기';W.userData.at=0;
      cake.candles(true);cake.lit(true);G.sound.sfx('event-pop');puffAt(CAKE[0],CAKE[1],MOB?8:12,.7,[1,.92,.6]);mark('stuck');st.ddoHop=9;faceTo(ddo.root,W.position.x,W.position.z);await say('또생일',T2.thanks,3.8,{look:'케이크'});
      /* 촛불은 생일 주인공 또생일이 직접 붊(케이크 쪽으로 돌아 후 — 입김 알갱이) → 생일 노래(크게) → 발견 카드 */
      {const d=ddo.root.position,dx=CAKE[0]-d.x,dz=CAKE[1]-d.z,L=Math.hypot(dx,dz)||1;st.ddoBlow=true;faceTo(ddo.root,CAKE[0],CAKE[1]);G.sound.sfx('event-whoosh',{gain:.5});
        /* 흰색·연분홍 바람 줄기 + 작은 반짝임이 촛불 쪽으로(cloudfolk makeBreath), 촛불이 흔들리다 꺼지며 가는 흰 연기 한 줄 */
        breath.blow([d.x+dx/L*.3,d.y+.42,d.z+dz/L*.3],[CAKE[0],cake.g.position.y+.42,CAKE[1]],G.clock.t);st.flick=G.clock.t;await wait(MOB?1.15:1.0);st.ddoBlow=false;st.flick=null;}
      cake.lit(false);cake.flames.scale.set(1,1,1);cake.flames.rotation.z=0;breath.smoke([CAKE[0],cake.g.position.y+.44,CAKE[1]],G.clock.t);G.sound.sfx('event-sparkle');G.react.react('joy',{sound:null});mark('blow');
      G.sound.sfx('tune-birthday',{phrase:0,gain:1.15});await wait(1.9);G.sound.sfx('tune-birthday',{phrase:1,gain:1.15});await wait(1.7);st.ddoHop=0;
      G.state.setFlag(DISC.day,true);G.sound.sfx('card-secret');mark('candle');await G.ui.secret({kicker:'새 발견',title:'한 바퀴보다 1년이 먼저 끝나요',text:T.n17,vo:T.n17,count:`발견 ${discN()}/${DISC_TOTAL}`,at:innerHeight>innerWidth?'bottom':null,lines:4});if(G.view.req&&G.view.req.fn===cam3)G.view.hold(null);st.cakeCam=null;},null)});
  /* ── 구역 카메라: 해돋이를 본 뒤 광장 안에서는(나갈 길을 찾을 때까지) 위로 올라가 출구 셋과 동쪽으로 뻗는 그림자를 한 화면에 — 가로 화면은 북쪽 위에서(동서 출구가 화면 가로로), 세로 화면은 동쪽 높이에서 서쪽을(맞는 길이 위, 그림자는 아래로).
       문 구역에서는 원더룹과 뭉게 문지기가 한 화면에 들어오는 거리(둘 사이가 멀수록 물러남). 벗어나면 원래 카메라, 플레이어가 카메라를 만지면 그 구역을 나갈 때까지 플레이어 것. 카메라 시야각이 30°라 멀리 물러나야 다 보인다 */
  function zoneCam(dt,W,P){let want=null;const pt=pk()>1.3;
    if(F[K.sun]&&!F[K.plaza]&&!st.boat&&(!st.scene||(st.zc&&st.zc.id==='plz'))&&dPlz(P.x,P.z)<PLZ.R+(st.zc&&st.zc.id==='plz'?2.2:.6))want={id:'plz',fog:1,fn:()=>pk()>1.3
      ?{at:[c0-1,0,c1],from:[c0+27,35,c1]}
      :{at:[c0,0,c1-1.4],from:[c0,21,c1+20.5]}};
    if(!want&&stage()==='gate'&&st.gate.said&&!st.gateIntro&&P.x<GS[0]+1.6&&P.x>GATE[0]-1.3&&Math.abs(P.z-GATE[1])<8)want={id:'gate',fog:0,fn:()=>{const p2=pk()>1.3,Q2=W.position,dx=Q2.x-MUNGE[0],dz=Q2.z-MUNGE[1],d=Math.hypot(dx,dz)||1,ax=lerp(Q2.x,MUNGE[0],.5),az=lerp(Q2.z,MUNGE[1],.5),D=(9.5+d*.7)*(p2?1.5:1.18),
      a=Math.atan2(dz,dx)+.28,hx=Math.cos(a),hz=Math.sin(a); /* 문지기 → 원더룹 방향에서 남쪽으로 조금 돌아간 쪽 뒤 위: 둘이 화면 가운데 세로로 나란히(멀수록 물러남) */
      return {at:[ax,p2?.9:.5,az],from:[ax+hx*D*.84,1.5+D*.5,az+hz*D*.84]};}}; /* 보는 점을 올려 문지기 머리 위에 '?'·'!' 자리가 남게(2026-11-20) */
    /* 양 몰기 빈터: 가로 화면은 위에서 빈터·울타리가 한 화면에(들어온 쪽 뒤·위), 세로 화면은 폭이 좁아 원더룹을 따라가며 높이서 내려다봄 */
    if(!want&&SG.on&&!SG.done&&Math.hypot(P.x-GC[0],P.z-GC[1])<RES+2.5)want={id:'glade',fog:1,fn:()=>{const p2=pk()>1.3,Q=W.position;if(p2)return {at:[Q.x+GDIR[0]*1.5,.4,Q.z+GDIR[1]*1.5],from:[Q.x-GDIR[0]*10.5,17.5,Q.z-GDIR[1]*10.5]};const cx=GC[0]+GN[0]*1.2,cz=GC[1]+GN[1]*1.2,D=26;return {at:[cx,.2,cz],from:[cx-GDIR[0]*D*.5,D*.86,cz-GDIR[1]*D*.5]};}};
    if(want){if(!st.zc||st.zc.id!==want.id){if(st.zcOff!==want.id){if(st.zc&&G.view.req&&G.view.req.fn===st.zc.fn)G.view.hold(null);st.zc={...want,t:0};G.view.hold(want.fn);}}
      else{st.zc.t+=dt;if(st.zc.t>.3&&!st.scene&&!(G.view.req&&G.view.req.fn===st.zc.fn)){st.zcOff=st.zc.id;st.zc=null;}}} /* 만져서 풀렸으면 이 구역에서는 다시 잡지 않음 */
    else{if(st.zc){if(G.view.req&&G.view.req.fn===st.zc.fn)G.view.hold(null);st.zc=null;}st.zcOff=null;}
    st.fv+=((st.zc&&st.zc.fog?1:0)-st.fv)*Math.min(1,dt*2.6);}
  /* ── 매 프레임 ── */
  function update(dt,t){const W=U0();if(!W)return;const U=W.userData,P=W.position,cam=G.view.camera;
    mark('start');if(pend&&!started){started=true;arr=arrival({G,root,WL:W,groundY,mob:MOB,quick:true,plain:true,dustCols:[[.93,.86,1],[.86,.78,.96],[.98,.94,1]],landSfx:'cloud-poof',onDone:()=>{st.arrDone=true;mark('land');if(!REV)G.ui.toast(T.n0,3.2,T.n0); /* 다시 찾은 탐방: 도착 안내 없음 */}});}
    if(arr)arr.tick(dt,t);puffs.tick(dt);tickCarry(dt);if(st.depTick)st.depTick(dt);if(st.ride)rideTick(dt,t,W,U);
    breath.tick(G.clock.t,G.view.camera);if(st.flick!=null){const q=G.clock.t-st.flick,k=ss(.25,.7,q);cake.flames.scale.set(1+.35*k*Math.sin(q*37),1-.4*ss(.45,1,q)+.14*k*Math.sin(q*29),1);cake.flames.rotation.z=.22*k*Math.sin(q*23);}
    windMesh.tick(t);st.wk=(st.wk||0)+((st.ride?1:0)-(st.wk||0))*Math.min(1,dt*2);st.wt=(st.wt==null?t:st.wt)+dt*(1+2.4*st.wk);wisps.tick(st.wt,P.x,P.z,P.y,st.wk);wisps.me.visible=!st.hid;wisps.mat.opacity=Math.min(1,.25+.55*Math.min(1,st.fog[1]/30)+.3*st.wk);cands.forEach((c,i)=>{c.visible=candOn[i]&&!st.hid&&Math.hypot(P.x-c.position.x,P.z-c.position.z)<st.fog[1]+8+(st.wk||0)*48;if(c.visible){c.rotation.y=t*1.6+i;c.position.copy(candAt[i]);c.position.y+=Math.sin(t*2+i*2)*.15;if(st.ride&&st.ride.pre>=9){const d=Math.hypot(P.x-candAt[i].x,P.y+.7-candAt[i].y,P.z-candAt[i].z),mk=.2*ss(CATCH+1,CATCH+.1,d);c.position.x+=(P.x-c.position.x)*mk;c.position.y+=(P.y+.7-c.position.y)*mk;c.position.z+=(P.z-c.position.z)*mk;} /* 잡히는 범위 바로 바깥 1m 안까지 왔을 때만 원더룹 쪽으로 약하게 끌려옴(아슬아슬하게 스칠 때 도와줌) */if(Math.random()<dt*2.5)puffs.emit(c.position.x,c.position.y+.4,c.position.z,(Math.random()-.5)*.5,.5,(Math.random()-.5)*.5,.9,[1,.9,.5]);}});
    /* 해돋이(st.rise 0 → 1): 서쪽 빛 띠가 밝아지고 해가 지평선 아래(-3°)에서 +8.5°로, 기둥 그림자가 나타남. 안개는 진행에 따라 천천히 */
    if(st.backCam){const b=st.backCam,held=G.view.req&&G.view.req.fn===b.fn;if(st.ride||st.scene||(b.p&&(!held||Math.hypot(P.x-b.p[0],P.z-b.p[1])>1.3))){if(held)G.view.hold(null);st.backCam=null;}}
    /* 해돋이 장면 카메라 지키기(2026-11-25 — 휴대폰에서 해를 못 봤다): 대사를 넘기려 화면을 누를 때 손가락이 조금만 밀려도 '카메라를 만짐'으로 잡혀 08이 연출 카메라를 끝내고 따라가기(원더룹 등 뒤 — 해가 화면 밖)로 돌아갔다 → 장면이 끝날 때까지 다시 잡음 */
    if(st.sunCam&&!window.__noSunHold&&(!G.view.req||G.view.req.fn!==st.sunCam)){G.view.hold(st.sunCam);st.sunRe=(st.sunRe||0)+1;}
    if(st.riseGo){const bt=G.sound.bedTime&&G.sound.bedTime('venus-sunrise'),tm=bt?bt.t:G.clock.t-st.riseT0-.25,u=Math.min(1,Math.max(0,tm/RISE));st.rise=Math.max(st.rise,Math.pow(u,1.8));if(u>=1){st.rise=1;st.riseGo=false;}} /* 곡 자리(소리 시계)를 따라 — 소리가 꺼져 있으면 장면 시계로 */
    if(!st.mus&&st.arrDone)music(base(),{fade:2.5});
    if(st.faceW)W.rotation.y+=Math.atan2(Math.sin(-PI/2-W.rotation.y),Math.cos(-PI/2-W.rotation.y))*Math.min(1,dt*4);
    if(st.hid)SK.fogPush=[900,2000];else {const g=fogWant();st.fog[0]+=(g[0]-st.fog[0])*Math.min(1,dt*.9);st.fog[1]+=(g[1]-st.fog[1])*Math.min(1,dt*.9);zoneCam(dt,W,P);const pt=pk()>1.3,fp=[st.fog[0]+st.fv*(pt?34:12),st.fog[1]+st.fv*(pt?40:14)];if(st.wk>.01&&!F[K.sun]){fp[0]+=st.wk*9;fp[1]+=st.wk*48;} /* 바람을 타는 동안은 안개를 밀어내 발아래 구름 바다·구름 섬이 보이게 */if(st.sailing){const s=st.sailPre||0,h=Math.max(0,cam.position.y-SEA),m=ss(.22,.31,st.sailU||0);fp[0]=lerp(fp[0],2+.15*h,s);fp[1]=lerp(fp[1],lerp(28+.5*h,.8*h+3,m),s);} /* 떠오르는 동안 구름이 밀려와(뜨기 전 28m) 올라갈수록 발아래 구름 섬이 옅어지다 묻힘 */st.sailFar=fp[1];SK.fogPush=fp; /* 위에서 보는 카메라가 멀리 있어 그동안만 안개를 더 밀어냄 */
      const r=st.rise,e=r*r*(3-2*r),d=(PRE.fogFar+fp[1])*.86,el=(-3.2+11.7*e)*PI/180,C=cam.position;
      band.position.set(C.x-d,C.y+d*.02,C.z);band.scale.set(d*2.1,d*(.5+.2*e),1);band.material.opacity=(F[K.met]?.5:.3)+.35*e;
      glow.visible=r>.03;glow.position.set(C.x-Math.cos(el)*d*.98,C.y+Math.sin(el)*d*.98,C.z);glow.scale.setScalar(d*.42);glow.material.opacity=ss(.04,.5,r);
      shMesh.visible=r>.02&&!(st.sailing&&st.sailFar<19);shMat.opacity=e;if(st.sailing&&(st.sailFog||0)>.75)band.visible=glow.visible=false;}
    /* 원더룹 빠르기(문지기 판정) */
    {if(st.lastP&&dt>0){const v=Math.hypot(P.x-st.lastP[0],P.z-st.lastP[1])/dt;st.spd+=(v-st.spd)*Math.min(1,dt*18);}st.lastP=[P.x,P.z];}
    /* 주민 움직임 */
    /* 멀리 있어 안 보이는 것은 그리지 않음(드로우콜 줄이기): 또생일·케이크는 50m 밖, 문지기는 62m 밖, 비행선은 안개가 걷히기 전 */
    if(!st.hid){const far=Math.max(40,st.fog[1]+10),dp=ddo.root.position;ddo.root.visible=Math.hypot(P.x-dp.x,P.z-dp.z)<Math.min(50,far);cake.g.visible=Math.hypot(P.x-CAKE[0],P.z-CAKE[1])<Math.min(50,far);munge.root.visible=Math.hypot(P.x-MUNGE[0],P.z-MUNGE[1])<Math.min(62,far)&&!(st.sailing&&st.sailFar<24);ship.visible=!!F[K.plaza]&&!(st.sailing&&st.sailFar<62);
      if(st.sailing)for(const [o,D] of sailHide)o.visible=st.sailFar>D;} /* 토성으로 떠나는 동안: 안개가 다가와 묻힌 것(마을·해시계·깃발·그림자·문지기·비행선)은 그 순간부터 그리지 않음 */
    /* 또생일이 먼저 날아감(부탁 장면 끝) · 파티 우산(타지 않을 때: 부탁 전 또생일 옆 → 건네면 발판 위에 둥실 떠서 기다림) */
    if(st.ddoFly){const f=st.ddoFly;f.t+=dt;const u=Math.min(1,f.t/2.5),e=u*u,r=ddo.root;r.position.set(DDO0[0]-13*e,groundY(...DDO0)+MH+5.2*ss(0,1,u)+Math.sin(t*9)*.05,DDO0[1]-.45*e);r.rotation.y=-PI/2; /* 파티장(서쪽) 쪽으로 */r.scale.setScalar(1-.97*ss(.72,1,u));if(Math.random()<dt*22)puffs.emit(r.position.x,r.position.y+.2,r.position.z,.8,-.2,(Math.random()-.5)*.6,1.1,[1,.95,.98]);if(u>=1){puffAt(r.position.x,r.position.z,4,.5);st.ddoFly=null;}}
    if(!st.ride){const on=!F[DISC.day]&&caught()<3&&!st.hid&&P.x>12;umb.visible=on;if(on){if(st.umbHop!=null&&st.umbHop<1)st.umbHop=Math.min(1,st.umbHop+dt/2.2); /* 바람에 실려 가듯(2026-11-23): 2.2초 — 천천히 떠올라(슬로우 인) 옆으로 휜 길을 살짝 흔들리며 날아가 사뿐히(슬로우 아웃) */const h=F[K.ask]?1:st.umbHop!=null?st.umbHop:0,e=h*h*h*(h*(6*h-15)+10),arc=Math.sin(PI*e),ax=DDO0[0]+.95,az=DDO0[1]+.55,dx=PAD[0]-ax,dz=PAD[1]-az,L=Math.hypot(dx,dz)||1,x=lerp(ax,PAD[0],e)-dz/L*arc*.9,z=lerp(az,PAD[1],e)+dx/L*arc*.9;umb.position.set(x,lerp(groundY(ax,az)+.02,groundY(...PAD)+.55+Math.sin(t*1.8)*.1,e)+arc*1.7-.5,z);st.umbA=(st.umbA||0)+dt*.3*e; /* 2026-11-27: 가는 시간은 그대로(2.2초), 도는 것만 차분하게 — 천천히 두 바퀴 돌며(슬로우 인·아웃) 사뿐히 앉고, 그 뒤 아주 느리게 돎(예전: 게임 시계 × 진행으로 돌려 날아가는 동안 다섯 바퀴 넘게 팽글팽글, 빠른 흔들림까지) */umb.rotation.set(Math.sin(t*1.6+1)*.05*arc,PI*4*e+st.umbA,.16*(1-e)+Math.sin(t*2.1)*.07*arc);umb.scale.setScalar(lerp(.72,1,e));}}
    const beat=munge.tick(dt,t,st.mState);if(beat&&Math.hypot(P.x-MUNGE[0],P.z-MUNGE[1])<20&&!F[K.clear])G.sound.sfx('event-snore',{gain:Math.max(.25,1-Math.hypot(P.x-MUNGE[0],P.z-MUNGE[1])/22)});
    {const mr=munge.root,base=Math.atan2(GS[0]-MUNGE[0],GS[1]+1.5-MUNGE[1]),awake=st.mState==='ask'||st.mState==='wake',ty=awake?Math.atan2(P.x-MUNGE[0],P.z-MUNGE[1]):base;mr.rotation.y+=wrapA(ty-mr.rotation.y)*Math.min(1,dt*(awake?13:2.2));
      if(st.mJolt>0)st.mJolt=Math.max(0,st.mJolt-dt*2.8);mr.position.y=groundY(...MUNGE)+(st.mJolt>0?Math.sin((1-st.mJolt)*PI)*.36:0);} /* 문지기: 눈뜰 때 들썩·휙(긴장감), 다시 잠들면 천천히 제자리로 */
    ddo.tick(dt,t,st.ddoHop>0||st.ddoFly?'talk':'idle');if(st.ddoHop>0)st.ddoHop-=dt;if(!st.scene&&!st.ddoFly&&Math.hypot(P.x-ddo.root.position.x,P.z-ddo.root.position.z)<5)faceTo(ddo.root,P.x,P.z,dt);cake.tick(t);
    if(st.fly){let live=false;const top=groundY(...CAKE)+TBH+.42;for(const f of st.fly){if(f.done)continue;live=true;f.t+=dt;if(f.t<0)continue;const u=Math.min(1,f.t/.62),e=u*u*(3-2*u),c=cands[f.i];c.visible=true;c.position.set(lerp(f.a[0],CAKE[0],e),lerp(f.a[1],top,e)+Math.sin(u*PI)*.9,lerp(f.a[2],CAKE[1],e));c.rotation.y=t*9;c.scale.setScalar(lerp(1.3,.45,e));
        if(Math.random()<dt*30)puffs.emit(c.position.x,c.position.y,c.position.z,(Math.random()-.5)*.6,.4,(Math.random()-.5)*.6,.7,[1,.92,.55]);if(u>=1){f.done=true;c.visible=false;c.scale.setScalar(1.5);G.sound.sfx('travel-step',{step:5+f.i*2,gain:1});}}if(!live)st.fly=null;}
    {const d=Math.hypot(P.x-ddo.root.position.x,P.z-ddo.root.position.z),gn=1.2*Math.min(1,Math.max(0,(SONG_R-d)/(SONG_R-5)));if(gn>.04&&!st.ddoFly&&!st.scene&&!st.sailing&&!st.ride&&!(SG.on&&!SG.done)&&!G.dialog.talking()){st.songT-=dt;if(st.songT<=0){st.songT=3.3;G.sound.sfx('tune-birthday',{phrase:st.songK++,gain:gn});}}} /* 생일 노래: 가까이 가면 분명히 들리게(예전보다 크게) */
    /* 굴뚝 연기: 위로(카메라가 굴뚝 가까이 있으면 내지 않음 — 큰 알갱이가 화면을 가림) · 비행선: 구름 바다 위를 천천히 */
    if(!st.hid)for(const s of smokes)if(Math.abs(s[0]-P.x)+Math.abs(s[2]-P.z)<36&&(cam.position.x-s[0])**2+(cam.position.z-s[2])**2>49&&Math.random()<dt*4){const k=.82+Math.random()*.14;puffs.emit(s[0],s[1],s[2],-.5-Math.random()*.5,.9,(Math.random()-.5)*.3,2.2+Math.random()*1.2,[.9*k,.84*k,.96*k]);}
    if(st.ggTo&&st.scene){const r=gg.root.position,dx=st.ggTo[0]-r.x,dz=st.ggTo[1]-r.z,d=Math.hypot(dx,dz);if(d>.08){const v=Math.min(d,4.6*dt);ggPlace(r.x+dx/d*v,r.z+dz/d*v);}}
    {const a=t*.07,o=Math.sin(a)*3;ship.position.set(SHIP[0]+o*.79,SHIP[1]+Math.sin(t*.4)*.35,SHIP[2]-o*.61);ship.rotation.set(Math.sin(t*.5)*.03,.55+Math.sin(a)*.22,Math.sin(t*.33)*.03);if(ship.visible)ship.userData.spin(t);}
    if(st.boat){st.boat.setBoat(t);const B=st.boat.B,cx=Math.cos(B.ry),sx=Math.sin(B.ry);if(st.aboard&&!st.sailing){boatStand(boat,0,0,W.position);U.riding.y=W.position.y;} /* 발이 배 겉면에 딱(배가 기울어도) */
      if(st.ggSit&&!st.sailing){boatStand(boat,-GX,BSIDE,gg.root.position);gg.root.rotation.y=B.ry+PI/2;}} /* 거꾸리가 뱃머리 쪽, 원더룹이 배 뒤쪽 — 둘 다 뒤(가는 쪽의 반대)를 봄: 뒤에서 보는 카메라에 원더룹이 앞·거꾸리가 그 뒤, 두 얼굴이 다 보임 */
    /* 거꾸리 길잡이: 원더룹보다 5.5m 앞, 길 한쪽 옆(1.25m)에서 뒷걸음. 광장을 풀기 전에는 광장 안 기다리는 자리(PLZ.wait)에서 멈춤(답을 먼저 가지 않음).
       걷는 동안은 말 걸 상대가 아님('말 걸기'·'…' 없음) — 멈춰 기다릴 때(광장·문 앞뒤·구름 끝)만 st.ggWait */
    let gm=st.ggMode;st.ggWait=false;if(st.ggOn&&!st.scene&&!st.boat&&!G.dialog.talking()){const r=gg.root.position;let tx,tz,hold=false;
      const side=s=>{const a=pointAt(s-.4),b=pointAt(s+.4),l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [(b[1]-a[1])/l,-(b[0]-a[0])/l];};
      if(st.ggHome){[tx,tz]=st.ggHome;hold=true;}else if(!F[K.sun]&&!F[DISC.day]){[tx,tz]=(!F[K.ask]||(!st.rode&&P.x>20))?GG0:GGP;hold=true;} /* 초를 찾는 동안: 처음엔 시작 지점 옆, 바람길을 타면 파티장으로 먼저 달려가 기다림 */else if(!SG.done&&!F[K.sun]&&proj(P.x,P.z).s+5.5>=GL_S-RES+1.2){[tx,tz]=GGS;} /* 양을 다 몰기 전: 빈터 들머리에서 기다림(답을 먼저 가지 않음) */else{const pz=!F[K.plaza],cap=pz?S_PIN:F[K.gate]?S_END-1.2:st.gate.said?S_GATE+3.2:S_GS-1.6,s=proj(P.x,P.z).s+5.5;
        if(s>=cap){hold=true;if(pz){if(F[K.sun]){tx=c0-PLZ.R+1.6;tz=c1+.9;}else{tx=c0+PLZ.wait[0];tz=c1+PLZ.wait[1];}} /* 해돋이를 본 뒤에는 서쪽 출구 앞에서 기다림(앞장섬) */else{const p=pointAt(cap),q=side(cap);tx=p[0]+q[0]*1.5;tz=p[1]+q[1]*1.5;}}
        else{const p=pointAt(s),q=side(s);tx=p[0]+q[0]*1.25;tz=p[1]+q[1]*1.25;}}
      const dx=tx-r.x,dz=tz-r.z,d=Math.hypot(dx,dz);if(d>.12){const v=Math.min(5.6,d*5),s=Math.min(d,v*dt);ggPlace(r.x+dx/d*s,r.z+dz/d*s);gm=v>.5?'walk':'idle';}else{gm='idle';st.ggWait=hold;}
      faceTo(gg.root,P.x,P.z,dt);}
    else if(st.ggOn&&G.dialog.talking()){faceTo(gg.root,P.x,P.z,dt);gm='talk';}
    {const li=st.scene&&G.dialog.lineInfo&&G.dialog.lineInfo();if(li&&li.who==='또생일'&&gg.root.visible&&!st.ggSit&&!st.ggTo)faceTo(gg.root,ddo.root.position.x,ddo.root.position.z,dt);} /* 또생일이 말하는 동안은 거꾸리도 또생일 쪽을 봄(2026-11-23 — 원더룹만 보고 있었다) */
    gg.tick(dt,t,st.ggSit?'idle':gm);
    sheepTick(dt,t,P);
    if(blobs){const b=(i,o,r,on)=>blobs.set(i,o.position.x,groundY(o.position.x,o.position.z)+.03,o.position.z,on?r:0);b(0,gg.root,.42,gg.root.visible&&!st.ggSit);b(1,munge.root,1.25,true);b(2,ddo.root,.26,ddo.root.visible&&!st.ddoFly);{const gy=Math.max(sea(P.x,P.z),groundY(P.x,P.z)),h=P.y-gy;blobs.set(3,P.x,gy+.05,P.z,st.ride?Math.max(.35,.8-h*.05):0);} /* 바람을 타는 동안 발아래 구름 바다·땅에 떨어지는 원더룹 그림자(높이감) */blobs.instanceMatrix.needsUpdate=true;}
    if(!st.arrDone||(G.front.frontShown&&G.front.frontShown()))return;
    if(st.scene||st.carry||U.riding)return;
    const sg=stage();
    if(sg==='meet'){quest('');intro(W,U);}
    else if(sg==='ask')quest('거꾸리를 따라가요');
    else if(sg==='wind'){const n=caught(),q=n<3?`생일 초 ${n}/3`:'또생일 케이크에 초를 꽂아요';if(q!==st.lastQ){quest(q);G.goal.set(n<3?{at:PAD,label:'바람길',style:'ant',beam:false}:{at:CAKE,label:'케이크',style:'ant',beam:false});}}
    else if(sg==='town'){quest(SG.on&&!SG.done?`양을 울타리로 몰아요 ${SG.n}/5`:'해돋이를 보러 광장으로');
      /* 마을에 들어설 때 한 번: 따라가기 카메라를 낮춰 집·나무와 먼 구름 탑이 화면에 들어오게(1.2초 — 그 뒤로는 플레이어 것, 만지면 그만) */
      const C=G.controls.input.cam;if(C&&st.camLow==null){st.camLow=0;st.camU=C.user;st.camP=C.pitch;}if(C&&st.camLow<1&&C.user===st.camU&&!G.ui.cardShown()){st.camLow=Math.min(1,st.camLow+dt/1.2);const e=st.camLow*st.camLow*(3-2*st.camLow);C.pitch=lerp(st.camP,Math.min(st.camP,pk()>1.3?.42:.28),e);}}
    else if(sg==='plaza')quest('해 뜨는 쪽 구름 끝으로');
    else if(sg==='gate'){if(!st.gate.said||P.x>GS[0]+.6)quest('거꾸리를 따라가요');}
    else if(sg==='end')quest('구름 끝으로 가요');else{quest('');
      if(REV&&st.boat&&!st.sailing&&!st.aboard){G.goal.set({at:DOCK,y:BY,label:'얼음 배',style:'ant',h:3.6,path:false}); /* 출구 빛기둥만(길·할 일 없음) */
        {const r=gg.root.position;if(Math.hypot(P.x-r.x,P.z-r.z)<9&&!G.dialog.talking())faceTo(gg.root,P.x,P.z,dt);}
        if(P.x<END[0]-.5&&Math.abs(P.z-END[1])<3.2&&!(U.vert&&U.vert.air)&&!G.core.blocking()&&!G.ui.cardShown()&&!G.dialog.talking()){scene(reboard,null);return;}}}
    if(G.core.blocking()||G.ui.cardShown()||G.dialog.talking())return;
    const air=!!(U.vert&&U.vert.air),q=proj(P.x,P.z),dp=dPlz(P.x,P.z);
    /* 또생일 부탁(다가가면 저절로) · 바람길 발판(올라서면 출발) · 초를 다 찾기 전에는 마을로 못 감 */
    const dD=Math.hypot(P.x-DDO0[0],P.z-DDO0[1]),dPad=Math.hypot(P.x-PAD[0],P.z-PAD[1]);if(dPad>2)st.padArm=true;
    if(sg==='ask'&&!air&&dD<4.2){ddoAsk(W,U);return;}
    if(sg==='ask'&&!air&&P.x<22){G.ui.toast(T2.first,2.6);carryBack(W,[START[0]+1,START[1]-.5],2.2);return;}
    if(sg==='wind'&&!air&&caught()<3&&st.padArm&&dPad<1.15){rideStart(W,U);return;}
    if((sg==='ask'||sg==='wind')&&!air&&q.s>S_TOWN+4&&q.d<6){G.ui.toast(T2.first,2.6);carryBack(W,[0,-7.5]);return;}
    /* ③ 마을 입구 대사 자리(멈추지 않음) · ④ 광장에 들어서면 해돋이 */
    if(sg==='town'&&!st.townSaid&&q.s>S_TOWN&&q.d<4&&!air){st.townSaid=true;G.state.setFlag(K.town,true);mark('town');if(pk()>1.3){scene(async()=>{st.ggMode='talk';faceTo(gg.root,P.x,P.z);await say('거꾸리',T2.town,3.6);st.ggMode='idle';},gg);}else say('거꾸리',T2.town,3.6);return;} /* 세로 화면(2026-11-28): 걸으며 들으면 앞서가는 거꾸리가 화면 오른쪽 끝에 잘렸다 → 잠깐 서서 대화 카메라로(가로 화면은 그대로 걸으며) */
    /* 구름 양 몰기: 빈터에 들어서면 시작 · 다 몰기 전에 구름 둑을 돌아 지나가면 구름이 빈터로 되돌림 */
    if(sg==='town'&&!SG.done&&!SG.started&&!air&&q.s>GL_S-RES+2.2&&q.d<5){sheepStart(W);return;}
    if(sg==='town'&&!SG.done&&!air&&q.s>BAR_S+2.2&&q.d<6){carryBack(W,[GC[0]-GDIR[0]*.9,GC[1]-GDIR[1]*.9]);return;}
    if(sg==='town'&&!st.dialSaid&&SG.done&&!st.scene&&stopDial&&q.s>sOf(stopDial)-1.4&&q.d<4&&!air){ /* 양을 다 몬 뒤·다른 장면이 끝난 뒤에만(2026-11-21 — 양을 몰다 이 자리를 지나면 장면이 겹쳐 대사 없이 지나간 것으로 표시됐다) */st.dialSaid=true;mark('dial');scene(async()=>{const sx=stopDial[0],sz=stopDial[1];faceTo(gg.root,sx,sz);st.ggMode='point';W.rotation.y=Math.atan2(sx-P.x,sz-P.z);
        /* 해시계를 보는 구도: 원더룹 등 뒤 위에서 해시계 판(그림자)이 보이게 내려다봄 — 세로 화면은 더 물러남. 만지면 플레이어 것 */
        const dx=P.x-sx,dz=P.z-sz,L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L,ptc=pk()>1.3,k=ptc?1.5:1,cam=()=>ptc?{at:[sx+dx*.5+uz*.55,.7,sz+dz*.5-ux*.55],from:[P.x+ux*6.3*k+uz*.55,6.1*k,P.z+uz*6.3*k-ux*.55]}:{at:[sx+dx*.45,.8,sz+dz*.45],from:[P.x+ux*5.8*k-uz*3.1*k,3.9*k,P.z+uz*5.8*k+ux*3.1*k]};G.view.hold(cam); /* 세로 화면(2026-11-28): 옆으로 비켜 보면 좁은 화면에서 원더룹 탈이 거꾸리를 통째로 덮었다 → 원더룹 바로 뒤 위에서 내려다봄(아래 원더룹 · 위 해시계 · 그 옆 거꾸리) */ /* 옆으로 비켜서: 원더룹 뒤 옆얼굴·해시계·그 옆에 온 거꾸리가 한 화면에 */
        {const to=[sx+uz*1.35+ux*.3,sz-ux*1.35+uz*.3];st.ggTo=to;st.ggMode='walk';await G.core.until(()=>Math.hypot(gg.root.position.x-to[0],gg.root.position.z-to[1])<.15,1.8);st.ggTo=null;}st.ggMode='point';faceTo(gg.root,sx,sz);
        await say('거꾸리',T2.dial,3.2,{look:{at:[sx,sz],name:'해시계'}});st.ggMode='idle';if(G.view.req&&G.view.req.fn===cam)G.view.hold(null);},null);return;}
    if(sg==='town'&&dp<5.8&&!air){sunrise(W,U);return;}
    /* 광장 출구: 서쪽 = 맞는 길, 동쪽·남쪽 = 구름이 되돌림 */
    if(F[K.sun]&&!air){const b=exitHere(P);if(b){if(b.ok){if(!F[K.plaza]){plazaRight(W,U);return;}}else{plazaWrong(W,U,b,!F[K.plaza]);return;}}}
    /* 길에서 멀리 벗어나면 구름이 길로 되돌림(광장 안·또생일네 집과 샛길은 괜찮음) */
    if(!air){const inSec=P.x>-9&&P.z>-11.5,inP=dp<PLZ.R+2.4;if(q.d>6&&!inSec&&!inP&&Math.hypot(P.x-GC[0],P.z-GC[1])>RES+1.5){carryBack(W,[q.pt[0],q.pt[1]]);return;}
      if(!F[K.plaza]&&q.s>S_PLZ+PLZ.R+3&&!inP){carryBack(W,[c0+.4,c1+3.5]);return;}}
    if(sg==='gate')gateTick(dt,W,U,P);
    if(sg==='end'&&P.x<END[0]+3.2&&!air)scene(ending,null);}
  const _um=new THREE.Vector3();
  function lateUpdate(dt,t){if(arr)arr.late(dt,t);if(st.depLate)st.depLate(dt);
    if(st.rideFace){const W=U0();if(W)W.rotation.y=st.rideFace.ry;} /* 끝 동작 동안 앞을 본 채 */
    /* 우산(2026-11-21 두 번째): 곧은 우산대 — 옆 위로 쭉 뻗은 오른손(07 '우산 잡기')에서 탈 옆으로 똑바로 올라감. 우산(cloudfolk makeUmbrella — 원점 = 원더룹 발밑)이 원더룹 자리·방향을 그대로 따라감 */
    if(st.ride&&umb.visible){const W=U0();if(W){const r=st.ride,pre=r.pre<9?(1-ss(.25,.85,r.pre/1.15)):0;umb.position.copy(W.position);umb.position.y+=pre*.9;umb.quaternion.copy(W.quaternion);if(!st.umbDbg){handsMid(W,_um);W.worldToLocal(_um);st.umbDbg=[+_um.x.toFixed(2),+_um.y.toFixed(2),+_um.z.toFixed(2)];}}}}
  /* 끝낸 뒤: 구름 끝에 얼음 배가 매여 있고(거꾸리가 옆에서 기다림) '얼음 배 타기'로 다시 떠남 */
  if(REV)mkBoat(DOCK[0],DOCK[1],0); /* 2026-11-27 두 번째: 다시 찾은 탐방 — 구름 끝 선착장에 얼음 배가 매여 있음(거꾸리는 그 옆 REVGG) */
  {const bm=new THREE.Object3D();bm.position.set(DOCK[0],.4,DOCK[1]);add(bm);G.interact.add({root:bm,at:[END[0]-1.2,END[1]],face:DOCK,label:'얼음 배 타기',action:'들여다보기',dur:.4,near:3.2,once:false,when:()=>false&& /* 2026-11-27: 끝낸 뒤 떠나기는 거꾸리에게 말 걸기로(구름 끝 배 단추는 안 씀) */!!F[K.clear]&&!st.scene&&!st.sailing&&!G.ui.cardShown(),onDone:()=>scene(reboard,null)});}
  const sp=spawnAt();
  return {name:'구름 행성',kind:'outdoor',start:{compass:true},world:null,
    spawn:{x:sp[0],z:sp[1],ry:(sp[0]<-40||sp[0]>20)?-PI/2:PI},
    areas:{field:{bounds:BX,obstacles,camera:{target:[0,1,0],dist:9,polar:[.45,1.35],azimuth:null,start:[2.6,.95],minDist:3,maxDist:30}}},
    sun:{dir:new THREE.Vector3(...PRE.sunDir).normalize(),shadow:16,follow:true},
    sky:SK,after:()=>({time:F[K.sun]?1:0}),far:280,get farMin(){return st.farMin||0;},ambience:'wind',charFog:.12, /* 캐릭터는 안개를 아주 약하게(game/bend markChar — 주민·배도, 배경 안개는 그대로) */groundY,ground:[ground],keepOut:keep,
    arrival:()=>arr,dbgSail:()=>{if(F[K.clear]&&!st.scene&&!st.sailing)scene(reboard,null);} /* 시험용: 끝낸 뒤 얼음 배 다시 타기를 바로 */,dbgBlow:()=>!!st.ddoBlow,dbgMiss:v=>{st.dbgMiss=!!v;},dbgCam:(y,d)=>{st.dbgYaw=y||0;st.dbgDist=d||0;}, /* 시험용: 바람 타는 동안 카메라를 옆·앞으로(우산 쥔 모습 촬영) */ /* 시험용: 초를 일부러 놓침(다시 타기 확인) */
    state:()=>({sailU:st.sailing?+(st.sailU||0).toFixed(3):-1,sailPre:+(st.sailPre||0).toFixed(2),hid:!!st.hid,umbHop:st.umbHop==null?-1:+st.umbHop.toFixed(2),ddoAt:[+ddo.root.position.x.toFixed(1),+ddo.root.position.z.toFixed(1),ddo.root.visible?1:0],mus:st.musLog||[],rise:+st.rise.toFixed(3),umb:st.umbDbg||null,rideFace:!!st.rideFace,sheep:{started:SG.started,on:SG.on,done:SG.done,n:SG.n,bar:!!barM,list:HD.map(s=>[+s.x.toFixed(2),+s.z.toFixed(2),s.in?1:0])},ddoFly:!!st.ddoFly,pre:!!(st.ride&&st.ride.pre<9),pf:pieceU?Array.from(pieceU).slice(1,5).map(v=>+v.toFixed(2)):null,cand:caught(),ask:!!F[K.ask],day:!!F[DISC.day],ride:rideInfo(),sailing:!!st.sailing,hid:!!st.hid,arrDone:st.arrDone,landed:!!(arr&&arr.state.landT!=null),stage:stage(),scene:st.scene,carry:!!st.carry,sun:!!F[K.sun],plaza:!!F[K.plaza],rise:+st.rise.toFixed(2),wrong:st.wrong,gate:st.gate.ph,gateN:st.gate.n,caught:st.gate.caught,gateSaid:st.gate.said,quest:st.lastQ||'',fog:st.fog.map(v=>+v.toFixed(1)),
      ggWait:!!st.ggWait,zc:st.zc?st.zc.id:null,gg:[+gg.root.position.x.toFixed(2),+gg.root.position.z.toFixed(2),+gg.root.rotation.y.toFixed(2),gg.root.visible],spd:+st.spd.toFixed(2),aboard:!!st.aboard,boat:st.boat?[+st.boat.B.x.toFixed(1),+st.boat.B.z.toFixed(1)]:null,T:{...st.T},t:+G.clock.t.toFixed(2),disc:discN(),met:!!F[K.met],clear:!!F[K.clear]}),
    spots:{glade:{c:GC,R:RES,pen:PC,penR:PR,gate:GP,bar:BAR,gg:GGS},dial:stopDial,pad:PAD,land:LAND,cand:CAND,spawn:START,ddo0:DDO0,wind:WIND,path:PATH,plaza:{c:PLZ.c,R:PLZ.R,inc:PLZ.inc,br:PLZ.br.map(b=>({d:b.d,ok:!!b.ok,n:b.n}))},pin:pointAt(S_PIN),town:pointAt(S_TOWN),houses,sheep,gs:GS,gate:GATE,end:END,sec:SEC,cake:CAKE,munge:MUNGE,shd:SHD,ship:SHIP},
    update,lateUpdate,dispose(){if(arr){arr.dispose();arr=null;}qmark.remove();floats.forEach(f=>f.remove());if(st.dep){try{st.dep.dispose();}catch(e){}}puffs.dispose();const W=U0();if(W){W.scale.set(1,1,1);W.rotation.z=0;W.userData.sceneLock=false;if(st.carry||st.aboard||st.ride)W.userData.riding=null;}}};}

/* 금성 놀이 배경음(임시, 코드 — 바람 타고 초 잡기·양 몰기 동안만): 빠른 132bpm, 통통 튀는 셀레스타 가락 + 아르페지오 + 톡톡 베이스(C장조) */
const PLAY_SONG={name:'금성 놀이(임시)',bpm:132,lead:'celesta',noVary:true,
  bars:[48,48,53,55,48,45,53,55].map((r,i)=>({bass:r,pad:[r+24,r+24+[4,4,4,4,4,3,4,4][i],r+31]})),
  mel:[[76,null,79,null,84,null,79,null],[76,79,84,null,88,null,84,null],[77,null,81,null,84,null,81,null],[79,null,83,86,null,83,79,null],
       [76,null,79,null,84,null,79,null],[76,null,81,84,null,81,76,null],[77,81,84,null,86,null,84,null],[83,null,79,null,84,null,null,null]],
  parts:{mel:{v:.085},pad:{v:.02},bass:{v:.1,pat:[0,null,7,null,0,null,7,null]},arp:{v:.03},wood:{p:.5,v:.03}}};
