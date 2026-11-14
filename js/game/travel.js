/* 원더룹 — 스테이지 이동 연출 공통 틀(2026-11-09, 모든 세계가 같이 씀 — 첫 적용: 무한 우주 달 → 화성 별똥별 꼬리 타기 js/zones/space/meteor-ride.js)
   한 번의 이동 = begin() → (비행 동안 tick(dt,'fly')) → map() 우주 지도 장면 → arrive() → landIn(초)/land() → 끝.
   - 이동 테마: 세계 설정 travel.theme {file:'assets/audio/travel-theme.mp3', from, to, resolve, loop:[a,b]}(초, 파일 기준).
       파일이 있으면 그 파일을 from부터(앞 0.3초 서서히), 해결 화음 자리(resolve)가 착지 순간에 오게 맞춘다 — landIn(초)를 받으면 지금 재생 자리와
       '착지까지 남은 시간'이 0.12초 넘게 어긋날 때 0.5초 크로스페이드로 resolve−남은 시간 자리에서 다시(비행 구간에서 늘이거나 줄이는 셈),
       loop가 있으면 착지 시각을 모르는 동안 그 구간을 되풀이. 해결 화음 뒤 1.5초에 걸쳐 줄여 끝(to를 넘으면 거기서).
       파일이 없으면(지금) 코드로 만든 짧은 테마: 오르골·글로켄슈필 아르페지오로 차오름(D장조 3/4, 한 마디 1.5초 D–Bm–G–A, 마디마다 음역이 조금씩 위로)
       → 4.5초부터 패드·낮은 베이스가 깔리며 거르개가 열려 넓어짐 → 착지 0.75초 전 A(딸림화음) + 글로켄 오름 → 착지 순간 따뜻한 D 화음(D add9) + 종 굴림, 그 뒤 잦아듦.
       곡 길이와 연출 길이가 달라도: 코드 테마는 착지를 받을 때까지 마디를 이어 가고, 착지 시각을 알면 그 앞을 딸림화음으로 정리해 해결 화음을 정확히 맞춘다.
   - 섞기: 시작하면 스테이지 배경음을 1초에 걸쳐 줄이고(sound.bedLevel) 테마를 1초에 걸쳐 올림. 착지 해결 화음이 울리고 1.8초 뒤부터 배경음을 3.5초에 걸쳐 되돌림.
     테마는 sound의 travelBus(.42 — 배경음 .5보다 조금 작게, 전체 out을 거쳐 M·메뉴 소리 끄기를 그대로 따름), 효과음은 묻히지 않게 1.15~1.3배.
   - 효과음(공통 묶음 docs/sfx-list.md): 출발 travel-depart(반짝이며 휙 올라감) · 비행 event-wind(2.1초마다)·event-sparkle 작게(1.3~2.7초마다)
     · 지도 travel-step(발자국 한 칸마다 마림바 톡, 칸마다 한 음씩 위로) · 도착 travel-arrive(낮은 우웅) + event-whoosh(먼지구름) · 착지 land + event-pop(퐁)
   - 우주 지도 장면 map(o): HTML 캔버스 한 장(3D 그리기 0)이 화면을 덮음 — 미니어처처럼 행성이 한눈에(위아래 흐림 띠), 지나온 행성 → 다음 행성
     분홍 발자국 점선(로딩 화면 발자국과 같은 모양 — index.html solePath)이 한 칸씩, 지나온 행성 둘레에 그 스테이지에서 발견한 것이 작은 그림으로 톡톡,
     아래에 다음 행성 예고 한 줄(나레이션 자리 — 지금은 자막만, 시점 기록 kind 'narration'으로 남겨 녹음 뒤 같은 자리에 놓음). 약 3.6초, 누르면 끝나지 않음.
     o: {bodies:[{id,name,color,r,ring?,glow?}], from:id, to:id, facts:[{img(데이터 주소)|draw(g,s)}], line:'예고 한 줄', lineId, sec}
     세계 설정 travel.map.bodies, travel.lines['<지나온 구역>><다음 구역>'] — 세계마다 행성·문구만 바꿔 쓴다.
   촬영 모드(?shot)는 소리를 틀지 않음(sound가 막음), 지도 장면은 그대로 그림. */
import {sfx,bedLevel,travelOut,quietBuf,lufsGain,MIX} from './sound.js';
import {cue,clock} from './core.js';
const PI=Math.PI,mf=m=>440*Math.pow(2,(m-69)/12);
let CFG={},T=null;
/* 세계 설정을 받아 둠 + 테마 파일 미리 불러 두기(휴대폰에서 연출 시작이 파일 때문에 늦지 않게) */
export function prepare(cfg){CFG=cfg||{};const f=CFG.theme&&CFG.theme.file;if(f)quietBuf(f);try{devBox();}catch(e){}}
/* ── 코드로 만든 임시 테마 ── */
function env(c,g,t,a,peak,d,tail=.001){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(tail,t+a+d);}
function osc(c,type,f,t,dur,dest,peak,a=.005,det=0){if(f>16000)return;const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;if(det)o.detune.value=det;env(c,g,t,a,peak,dur);o.connect(g);g.connect(dest);o.start(t);o.stop(t+a+dur+.05);}
const musicBox=(c,D,m,t,v)=>{const f=mf(m);osc(c,'sine',f,t,1.5,D,v);osc(c,'sine',f*2,t,.35,D,v*.22);osc(c,'sine',f*3.01,t,.12,D,v*.08);};
const glock=(c,D,m,t,v)=>{const f=mf(m);osc(c,'sine',f,t,2.1,D,v,.003);osc(c,'sine',f*2.76,t,.5,D,v*.3,.002);osc(c,'sine',f*5.4,t,.15,D,v*.1,.002);};
function pad(c,D,ms,t,dur,v,c0,c1,att=.7){const f=c.createBiquadFilter(),g=c.createGain();f.type='lowpass';f.Q.value=.6;f.frequency.setValueAtTime(c0,t);f.frequency.linearRampToValueAtTime(c1,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+att);g.gain.setValueAtTime(v,t+Math.max(att,dur-.35));g.gain.linearRampToValueAtTime(0,t+dur+.6);f.connect(g);g.connect(D);
  for(const m of ms)for(const d of [-7,7]){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=mf(m);o.detune.value=d;o.connect(f);o.start(t);o.stop(t+dur+.7);}}
const bass=(c,D,m,t,dur,v)=>{osc(c,'sine',mf(m),t,dur,D,v,.04);osc(c,'triangle',mf(m),t,dur*.5,D,v*.25,.03);};
const BAR=1.5,EI=BAR/6; // 3/4, 한 박 0.5초(120), 여덟음표 0.25초
const PROG=[{r:62,ch:[62,66,69]},{r:59,ch:[59,62,66]},{r:55,ch:[55,59,62]},{r:57,ch:[57,61,64]}]; // D Bm G A
const ARP=[0,1,2,3,2,1]; // 화음 음 차례(위로 갔다 내려옴)
function codeTheme(c,D){const g=c.createGain(),t0=c.currentTime+.05;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(1,t0+1);g.connect(D);
  let bar=0,landAt=null,stopped=false,cad=false;
  function schedBar(k){const t=t0+k*BAR,P=PROG[k%4],lift=Math.min(7,Math.floor(k/2)*2+(k>=6?1:0)),ns=[...P.ch,P.ch[0]+12].map(m=>m+12+lift); // 마디마다 음역이 조금씩 위로(최대 +7)
    for(let i=0;i<6;i++){const tt=t+i*EI;if(landAt!=null&&tt>landAt-.8)break;musicBox(c,g,ns[ARP[i]],tt,i===0?.13:.09);}
    if(k>=2&&(landAt==null||t<landAt-.8))glock(c,g,ns[3],t,.05);
    if(k>=3&&(landAt==null||t<landAt-.8)){const dur=landAt!=null?Math.min(BAR,landAt-.8-t):BAR;if(dur>.2){const w=Math.min(1,(k-3)/6);pad(c,g,P.ch.map(m=>m+12),t,dur,.035+.03*w,500+1500*w,700+1700*w,k===3?1.2:.25);bass(c,g,P.r-12,t,dur*.9,.12);}}}
  function cadence(){if(cad)return;cad=true;const now=c.currentTime,ta=Math.max(now+.02,landAt-.8);
    pad(c,g,[57,61,64,67],ta,Math.max(.3,landAt-ta),.06,1400,2200,.25);bass(c,g,45,ta,landAt-ta,.12);[69,73,76,81].forEach((m,i)=>glock(c,g,m+12,ta+i*.17,.05));
    // 해결: 따뜻한 D add9 + 종 굴림 + 낮은 D, 그 뒤 2.5초에 걸쳐 잦아듦
    pad(c,g,[50,57,62,66,69,76],landAt,2.6,.075,2400,1200,.12);bass(c,g,38,landAt,3,.18);[74,78,81,86,88].forEach((m,i)=>glock(c,g,m,landAt+i*.06,.07));musicBox(c,g,74,landAt,.14);musicBox(c,g,81,landAt+.3,.1);
    g.gain.setValueAtTime(1,landAt+1.6);g.gain.linearRampToValueAtTime(0,landAt+4.4);setTimeout(()=>{stopped=true;clearInterval(iv);try{g.disconnect();}catch(e){}},(landAt-now+4.6)*1000);}
  const iv=setInterval(()=>{if(stopped)return;const now=c.currentTime;
    while(t0+bar*BAR<now+.35&&(landAt==null||t0+bar*BAR<landAt-.8)){schedBar(bar);bar++;}
    if(landAt!=null)cadence();},60);
  return {kind:'code',t0,get landAt(){return landAt;},landIn(sec){if(landAt==null){landAt=c.currentTime+Math.max(.85,sec);cadence();}},
    stop(sec=.6){if(stopped)return;stopped=true;clearInterval(iv);const now=c.currentTime;g.gain.cancelScheduledValues(now);g.gain.setValueAtTime(g.gain.value,now);g.gain.linearRampToValueAtTime(0,now+sec);setTimeout(()=>{try{g.disconnect();}catch(e){}},sec*1000+200);}};}
/* ── 파일 테마(수노 곡 등): from부터 시작해 해결 화음(resolve)이 착지에 오게 ──
   o: {file, from, to, resolve, bar(한 마디 초), beat0(마디가 시작하는 한 자리), jumpAt(늘이거나 줄일 자리 — 절정 안 마디 경계 근처)}
   expect(출발 때 알려 주는 '착지까지 남은 초')가 있으면 계획: 모자라는(남는) 시간 D = expect − (resolve − from) → 마디 k = round(D / bar)개만큼
   절정의 마디 경계 J에서 J − k·bar 자리로 한 번 건너뜀(박자·마디가 그대로 이어지게 — 80ms 크로스페이드, 소리 시계로 정확히 예약),
   남는 자투리(한 마디 안)는 시작 자리를 from − (D − k·bar)로 조금 당기거나 밀어 맞춤. 착지 시각을 정확히 알게 되면(landIn) 0.06초 넘게 어긋날 때만 0.35초 크로스페이드로 고침.
   앞 0.3초 서서히 올리고, 해결 화음 0.8초 뒤부터 1.5초에 걸쳐 줄임(to를 넘지 않음) */
function fileTheme(c,D,buf,o,expect){const from=o.from||0,to=Math.min(buf.duration,o.to||buf.duration),res=o.resolve??Math.max(from,to-1.5),bar=o.bar||0,XF=.08;
  const segs=[];let landAt=null,done=false,planLand=null;const tail=o.tail??((o.beat0??from)+Math.floor((res-2.6-(o.beat0??from))/(bar||1))*(bar||1)); /* 해결 화음 앞 구절이 시작하는 마디 경계(눌러 넘길 때 여기로) */
  function seg(when,off,fadeIn){const s=c.createBufferSource(),g=c.createGain();s.buffer=buf;g.gain.setValueAtTime(0,when);g.gain.linearRampToValueAtTime(1,when+fadeIn);s.connect(g);g.connect(D);
    s.start(when,Math.max(0,off),Math.max(.1,to-Math.max(0,off)));const n={s,g,t:when,off};segs.push(n);return n;}
  function cut(n,when,fade){n.g.gain.cancelScheduledValues(when);n.g.gain.setValueAtTime(1,when);n.g.gain.linearRampToValueAtTime(0,when+fade);try{n.s.stop(when+fade+.02);}catch(e){}}
  const now0=c.currentTime+.03;let plan={k:0,start:from};
  if(expect&&bar){const Dd=expect-(res-from),k=Math.round(Dd/bar),st=Math.max(0,from+k*bar-Dd);plan={k,start:+st.toFixed(3),D:+Dd.toFixed(3)};}
  const a=seg(now0,plan.start,.3);
  if(plan.k){const b0=o.beat0??from,ja=o.jumpAt??(from+res)/2;let J=b0+Math.round((ja-b0)/bar)*bar;while(J<=plan.start+1)J+=bar; // 절정 안 마디 경계
    const tJ=now0+(J-plan.start);cut(a,tJ-XF/2,XF);seg(tJ-XF/2,J-plan.k*bar-XF/2,XF);plan.J=+J.toFixed(3);plan.to=+(J-plan.k*bar).toFixed(3);}
  LOG.plan=plan;
  const curAt=t=>{let n=segs[0];for(const x of segs)if(x.t<=t)n=x;return n;},head=t=>{const n=curAt(t);return n.off+(t-n.t);};
  return {kind:'file',get landAt(){return landAt;},landIn(sec){if(landAt!=null||done)return;const now=c.currentTime;landAt=now+sec;
      const err=head(landAt)-res;LOG.err=+err.toFixed(3); // +면 곡이 앞서 감
      if(Math.abs(err)>.06){const w=now+.03;segs.filter(x=>x.t>w).forEach(x=>{try{x.s.stop();}catch(e){}});const k=curAt(w);cut(k,w,.35);seg(w,head(w)-err,.35);LOG.fix=+err.toFixed(3);}
      const n=curAt(landAt),e1=landAt+1.4,e2=Math.min(landAt+3.3,landAt+Math.max(1.6,to-res-.1)); /* 끝 울림은 끊지 않고 1.4초 뒤부터 약 1.9초에 걸쳐(2026-11-13 — 예전 0.8초 뒤 1.5초: 도착한 곳의 바람 소리로 넘어가기 전에 꺼졌다) */n.g.gain.setValueAtTime(1,e1);n.g.gain.linearRampToValueAtTime(0,e2);setTimeout(()=>{segs.forEach(x=>{try{x.s.stop();x.g.disconnect();}catch(e){}});},(e2-now)*1000+200);},
    /* 화면을 눌러 단계를 넘김(2026-11-13 두 번째 — 예전엔 곡 자리를 바로 건너뛰어 끊겨 들렸다): 곡은 지금 자리에서 그대로 흐르다가, 해결 화음까지 TAIL초 남는 순간에
       해결 화음 앞 구절(마디 경계 tail)로 0.9초에 걸쳐 부드럽게 넘어간다 → 해결 화음은 여전히 sec초 뒤(도착 순간). 남은 시간이 그보다 짧으면 지금 바로 0.6초에 걸쳐 넘어감. 거듭 누르면 다시 잡음 */
    retime(sec){if(landAt!=null||done)return;const now=c.currentTime,w=now+.05,tLand=now+sec;
      for(let i=segs.length-1;i>=0;i--)if(segs[i].t>w){try{segs[i].s.stop();}catch(e){}segs.splice(i,1);} /* 예약해 둔 넘어가기는 버림 */
      const k=curAt(w);k.g.gain.cancelScheduledValues(w);k.g.gain.setValueAtTime(1,w);planLand=tLand;LOG.retime=(LOG.retime||0)+1;
      if(Math.abs(head(tLand)-res)<=.06)return;const L=res-tail;
      if(sec<=L+.5){cut(k,w,.6);seg(w,Math.max(0,res-(tLand-w)),.6);}else{const tS=tLand-L,XF=.9;cut(k,tS-XF/2,XF);seg(tS-XF/2,tail-XF/2,XF);}},
    /* 해결 화음까지 남은 초(눌러 넘긴 뒤에는 다시 잡은 도착 시각 기준) — 연출이 남은 장면 길이를 곡에 맞출 때 */
    left(){const now=c.currentTime;return planLand!=null?planLand-now:res-head(now);},
    stop(sec=.6){if(done)return;done=true;const now=c.currentTime;segs.forEach(n=>{n.g.gain.cancelScheduledValues(now);n.g.gain.setValueAtTime(n.g.gain.value,now);n.g.gain.linearRampToValueAtTime(0,now+sec);try{n.s.stop(now+sec+.05);}catch(e){}});}};}
/* 테마 고르기(비교용, 2026-11-09): 'file'(곡 파일 — 기본) | 'code'(코드로 만든 테마) — 주소 ?travelTheme=, 톱니 메뉴 '이동 테마'(이 기기에 기억 'wl-travel-theme') */
function themeMode(){try{const q=new URLSearchParams(location.search).get('travelTheme');if(q==='file'||q==='code')return q;const v=localStorage.getItem('wl-travel-theme');if(v==='file'||v==='code')return v;}catch(e){}return (CFG.theme&&CFG.theme.use)||'file';}
function devBox(){if(document.getElementById('travelThemeBox'))return;const after=document.getElementById('spdBox');if(!after)return;const d=document.createElement('div');d.className='spdBox';d.id='travelThemeBox';
  d.innerHTML='<span>이동 테마</span> <button type="button" data-m="file">곡</button> <button type="button" data-m="code">코드</button>';
  const show=()=>d.querySelectorAll('button').forEach(b=>{b.style.fontWeight=b.dataset.m===themeMode()?'700':'400';b.style.textDecoration=b.dataset.m===themeMode()?'underline':'none';});
  d.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{try{localStorage.setItem('wl-travel-theme',b.dataset.m);}catch(e){}show();}));show();after.after(d);}
/* ── 한 번의 이동 ── o: {id, expect(착지까지 남은 초 — 곡 파일을 마디 단위로 맞출 때)} */
/* 곡 파일 크기 맞추기: theme.lufs(잰 체감 크기)가 있으면 배경음과 같은 크기(sound MIX.target)로 */
function themeBus(out,th){if(th.lufs==null)return out.bus;const g=out.ctx.createGain();g.gain.value=lufsGain(th.lufs,MIX.travelBus);g.connect(out.bus);return g;}
export async function begin(o={}){if(T)end(true);const t={id:o.id||'travel',wind:.4,spark:1,landed:false,theme:null,bedT:null};T=t;
  bedLevel(0,1);const mode=themeMode();
  const th=Object.assign({},CFG.theme||{},o.theme||{});cue({kind:'music',id:'travel-theme',file:mode==='file'?th.file||null:null,dur:0});
  const out=travelOut();if(out){const t0=out.ctx.currentTime,buf=mode==='file'&&th.file?await quietBuf(th.file):null;if(T!==t)return t;const ex=o.expect?o.expect-(out.ctx.currentTime-t0):0;
    t.theme=buf?fileTheme(out.ctx,themeBus(out,th),buf,th,ex):codeTheme(out.ctx,out.bus);LOG.kind=t.theme.kind;LOG.begin=out.ctx.currentTime;LOG.expect=o.expect||null;}
  return t;}
/* 비행 동안(매 프레임): 잔잔한 바람 + 꼬리 반짝이(작게) */
export function tick(dt,phase){const t=T;if(!t||phase!=='fly')return;t.wind-=dt;if(t.wind<=0){t.wind=2.1;sfx('event-wind',{gain:.6,minor:true,cue:false});}
  t.spark-=dt;if(t.spark<=0){t.spark=1.3+Math.random()*1.4;sfx('event-sparkle',{gain:.34,minor:true,cue:false});}}
/* 도착: 대기에 들어섬 + 먼지구름 휙 */
export function arrive(){sfx('travel-arrive',{gain:1.2});setTimeout(()=>sfx('event-whoosh',{gain:.9}),120);}
/* 착지까지 남은 초(알게 되는 대로) — 테마 해결 화음을 그 순간에 */
export function landIn(sec){const t=T;if(!t||t.landed)return;t.landed=true;if(t.theme)t.theme.landIn(sec);LOG.resolve=t.theme?t.theme.landAt:null;
  t.bedT=setTimeout(()=>{bedLevel(1,3.5);},(sec+1.8)*1000);cue({kind:'music',id:'travel-resolve',dur:0,at:+(clock.t+sec).toFixed(3)});}
export const land=()=>landIn(0);
/* 시험 기록(소리 시각 = 오디오 시계): 테마 종류·해결 화음 시각·실제 착지 시각 — tools/space-meteor-rec.py가 읽어 둘의 차이를 잼 */
const LOG={};export const log=()=>LOG;
export const untilResolve=()=>{const t=T;return t&&!t.landed&&t.theme&&t.theme.left?t.theme.left():null;};
export function retime(sec){const t=T;if(t&&!t.landed&&t.theme&&t.theme.retime)t.theme.retime(sec);}
export function note(k,v){LOG[k]=v;}
export function mark(name){const o=travelOut();LOG[name]=o?o.ctx.currentTime:null;if(name==='land'&&T&&T.theme)LOG.resolve=T.theme.landAt??null;}
/* 끝(정리) — abort면 테마를 바로 줄이고 배경음을 되돌림 */
export function end(abort){const t=T;if(!t)return;T=null;if(abort){if(t.theme)t.theme.stop(.6);clearTimeout(t.bedT);bedLevel(1,1.5);}}
export const active=()=>!!T;
/* 출발(몸이 끌려 올라가는 순간): 반짝이며 휙 올라감 */
export function depart(){sfx('travel-depart',{gain:1.25});}
/* 세계 설정으로 지도 장면: W.travel.map.bodies(행성마다 zone) · lines['지나온>다음'] · facts[지나온 구역](flag가 켜진 것만) */
export function mapFor(W,from,to,flags={},opt={}){const C=W&&W.travel||{},B=C.map&&C.map.bodies||[],f=B.find(b=>b.zone===from),t=B.find(b=>b.zone===to),L=(C.lines||{})[from+'>'+to]||{};
  return map({sec:opt.sec,bodies:B,from:f&&f.id,to:t&&t.id,line:L.text||'',lineId:L.id,facts:((C.facts||{})[from]||[]).filter(x=>flags[x.flag]).map(x=>({img:typeof x.img==='function'?x.img():x.img,draw:x.draw}))});}
/* ── 우주 지도 장면 ── */
function solePath(c){c.beginPath();c.moveTo(0,.02);c.bezierCurveTo(.05,.02,.062,-.04,.062,-.085);c.bezierCurveTo(.062,-.135,.035,-.165,.002,-.165);c.bezierCurveTo(-.04,-.165,-.062,-.125,-.056,-.075);
  c.bezierCurveTo(-.05,-.03,-.042,.02,0,.02);c.closePath();c.moveTo(.045,.075);c.ellipse(.003,.075,.042,.046,0,0,PI*2);} // 로딩 화면(index.html #wlBoot) 발자국과 같은 모양
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
function shadeHex(h,k){const n=parseInt(h.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.round(k>0?v+(255-v)*k:v*(1+k));return `rgb(${f(r)},${f(g)},${f(b)})`;}
/* 지도가 화면을 다 덮은 동안 참 — 08이 3D를 그리지 않음(2026-11-14 버벅거림: 안 보이는 3D 장면을 지도 밑에서 계속 그렸다) */
let COVERING=false;export const covering=()=>COVERING;
export function map(o){return new Promise(done=>{const sec=o.sec||3.6,cv=document.createElement('canvas');cv.id='wlTravelMap';cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:58;pointer-events:none;opacity:0;transition:opacity .35s';document.body.appendChild(cv);
  // 미니어처: 위·아래 띠를 흐리게(가운데만 또렷)
  /* 2026-11-14 버벅거림: 휴대폰은 흐림 띠(backdrop-filter — 아래 지도 캔버스가 매 프레임 바뀌어 다시 흐렸다) 대신 위아래를 살짝 어둡게만 */
  const LOW=matchMedia('(pointer:coarse)').matches;
  const blur=[0,1].map(i=>{const d=document.createElement('div');const m=i?'linear-gradient(to top,#000 0%,#000 30%,transparent 100%)':'linear-gradient(to bottom,#000 0%,#000 30%,transparent 100%)';
    d.style.cssText=LOW?`position:fixed;left:0;right:0;${i?'bottom':'top'}:0;height:24%;z-index:58;pointer-events:none;background:linear-gradient(${i?'to top':'to bottom'},rgba(20,14,40,.35),rgba(20,14,40,0));opacity:0;transition:opacity .35s`:`position:fixed;left:0;right:0;${i?'bottom':'top'}:0;height:24%;z-index:58;pointer-events:none;backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);mask-image:${m};-webkit-mask-image:${m};opacity:0;transition:opacity .35s`;document.body.appendChild(d);return d;});
  const cap=document.createElement('div');cap.id='wlTravelLine';cap.setAttribute('role','status');cap.textContent=o.line||'';
  cap.style.cssText='position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 9%);transform:translate(-50%,8px);z-index:59;pointer-events:none;max-width:min(88vw,560px);box-sizing:border-box;padding:.6rem 1.15rem;border-radius:16px;background:rgba(44,30,42,.86);color:#fbe9d8;font-family:"Gowun Dodum",sans-serif;font-size:clamp(15px,2.2vw,19px);line-height:1.45;text-align:center;word-break:keep-all;opacity:0;transition:opacity .45s,transform .45s';
  if(o.line)document.body.appendChild(cap);
  if(o.line)cue({kind:'narration',id:o.lineId||null,file:null,text:o.line,who:'나레이션',dur:+Math.max(2.4,o.line.replace(/\s+/g,'').length*.11+.5).toFixed(3)});
  const g=cv.getContext('2d'),B=o.bodies||[],iF=B.findIndex(b=>b.id===o.from),iT=B.findIndex(b=>b.id===o.to);
  const IM=(o.facts||[]).map(f=>{if(f.img){const im=new Image();im.src=f.img;return {im};}return {draw:f.draw};});
  /* 2026-11-10: 어두운 바탕에 작은 행성 한 줄이라 허전하고 발자국 점선이 거의 안 보였다 → 행성 1.45배, 별 많이 + 네 갈래 반짝이·색 구름, 발자국은 크게 + 크림 테두리·빛 받침, 발견 그림도 크게 */
  const STAR=[];for(let i=0;i<300;i++)STAR.push([Math.random(),Math.random(),.4+Math.random()*1.5,Math.random()*6,Math.random()]);
  const TWK=[];for(let i=0;i<16;i++)TWK.push([Math.random(),Math.random()*.9,3+Math.random()*4,Math.random()*6]);
  const NEB=[[.2,.25,.5,'255,150,190',.16],[.78,.3,.55,'140,170,255',.16],[.5,.8,.6,'201,166,224',.18],[.9,.78,.4,'255,190,150',.1]];
  const NSTEP=o.steps||8,STEP0=.55,STEPD=.27;let bgC=null,stepN=0,t0=performance.now(),on=true,w=0,h=0,dpr=1;
  requestAnimationFrame(()=>{cv.style.opacity='1';blur.forEach(d=>d.style.opacity='1');});setTimeout(()=>{if(on)COVERING=true;},420); /* 지도가 화면을 다 덮은 동안 3D 그리기 쉼(08 — covering()) */setTimeout(()=>{cap.style.opacity='1';cap.style.transform='translate(-50%,0)';},450);
  // 자리: 지나온 행성 → 다음 행성 사이를 넓게(발자국 길), 나머지는 고르게. 가로 화면은 왼쪽 → 오른쪽 완만한 물결, 세로 화면은 아래 → 위 지그재그
  const GW=B.map((b,i)=>i===0?0:((i===iF&&i-1===iT)||(i===iT&&i-1===iF))?2.6:1),GS=[];{let a=0;GW.forEach(v=>{a+=v;GS.push(a);});}
  function lay(){const pt=h>w,tot=GS[GS.length-1]||1;return B.map((b,i)=>{const s=B.length>1?GS[i]/tot:.5;
      const x=pt?.5+(i%2?.22:-.22):.075+.85*s,y=pt?.68-.58*s:.6-.2*s+.1*Math.sin(s*PI);const R=Math.min(w,h)*(b.r||.07)*(pt?1.5:1.45)*(1.05-.15*s);return {x:x*w,y:y*h,R,b};});}
  function planet(p,k,hl){const {x,y,R,b}=p;if(k<=0)return;const r=R*k;g.save();
    if(b.glow){const gl=g.createRadialGradient(x,y,r*.6,x,y,r*2.4);gl.addColorStop(0,'rgba(255,214,120,.55)');gl.addColorStop(1,'rgba(255,214,120,0)');g.fillStyle=gl;g.fillRect(x-r*2.5,y-r*2.5,r*5,r*5);}
    if(hl){const a=.35+.25*Math.sin(hl*7);const gl=g.createRadialGradient(x,y,r,x,y,r*1.7);gl.addColorStop(0,`rgba(255,236,210,${a})`);gl.addColorStop(1,'rgba(255,236,210,0)');g.fillStyle=gl;g.beginPath();g.arc(x,y,r*1.7,0,PI*2);g.fill();}
    if(b.ring){g.strokeStyle=shadeHex(b.color,-.15);g.lineWidth=r*.16;g.beginPath();g.ellipse(x,y,r*1.75,r*.5,-.25,PI*1.02,PI*1.98);g.stroke();}
    g.fillStyle='rgba(20,16,40,.35)';g.beginPath();g.ellipse(x+r*.12,y+r*1.08,r*.85,r*.2,0,0,PI*2);g.fill(); // 미니어처 장난감 그림자
    const gr=g.createRadialGradient(x-r*.38,y-r*.42,r*.1,x,y,r*1.05);gr.addColorStop(0,shadeHex(b.color,.42));gr.addColorStop(.55,b.color);gr.addColorStop(1,shadeHex(b.color,-.38));
    g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,PI*2);g.fill();
    g.save();g.clip();g.globalAlpha=.16;g.strokeStyle='#fff8ec';g.lineWidth=Math.max(1,r*.025);for(let i=-6;i<=6;i++){g.beginPath();g.moveTo(x+i*r*.22-r,y-r);g.lineTo(x+i*r*.22+r*.4,y+r);g.stroke();}g.restore(); // 크레용 빗금
    g.strokeStyle='rgba(74,42,42,.55)';g.lineWidth=Math.max(1.2,r*.05);g.beginPath();g.arc(x,y,r,0,PI*2);g.stroke();
    if(b.ring){g.strokeStyle=shadeHex(b.color,.1);g.lineWidth=r*.16;g.beginPath();g.ellipse(x,y,r*1.75,r*.5,-.25,-PI*.02,PI*1.02);g.stroke();}
    g.font=`${Math.round(Math.max(12,Math.min(w,h)*.028))}px Jua, "Gowun Dodum", sans-serif`;g.textAlign='center';g.textBaseline='top';g.fillStyle='rgba(251,233,216,.92)';g.fillText(b.name,x,y+r*1.32);g.restore();}
  let odd=false;function draw(now){if(!on)return;if(LOW&&(odd=!odd)){requestAnimationFrame(draw);return;} /* 휴대폰은 초당 30장(게임과 같게 — 발열) */const t=(now-t0)/1000;dpr=Math.min(2,devicePixelRatio||1);const W=Math.round(innerWidth*dpr),H=Math.round(innerHeight*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}w=W;h=H;
    g.setTransform(1,0,0,1,0,0);
    /* 바탕(그러데이션·색 구름·별 300)은 크기가 바뀔 때만 따로 한 번 그려 두고 매 프레임 붙이기만(2026-11-14 버벅거림 — 화면 전체 그러데이션 다섯 장 + 별 300개를 매 프레임 그렸다). 반짝임은 아래 네 갈래 별이 맡음 */
    if(!bgC||bgC.width!==w||bgC.height!==h){bgC=document.createElement('canvas');bgC.width=w;bgC.height=h;const q=bgC.getContext('2d');
      const bg=q.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#211d4c');bg.addColorStop(.55,'#35296a');bg.addColorStop(1,'#4a3472');q.fillStyle=bg;q.fillRect(0,0,w,h);
      for(const [nx0,ny0,nr,nc,na] of NEB){const r=Math.max(w,h)*nr,gr=q.createRadialGradient(nx0*w,ny0*h,0,nx0*w,ny0*h,r);gr.addColorStop(0,`rgba(${nc},${na})`);gr.addColorStop(1,`rgba(${nc},0)`);q.fillStyle=gr;q.fillRect(0,0,w,h);}
      const ng=q.createRadialGradient(w*.62,h*.35,0,w*.62,h*.35,Math.max(w,h)*.6);ng.addColorStop(0,'rgba(201,166,224,.22)');ng.addColorStop(1,'rgba(201,166,224,0)');q.fillStyle=ng;q.fillRect(0,0,w,h);
      for(const [sx,sy,sr,sp,sc] of STAR){q.globalAlpha=.5+.45*Math.sin(sp);q.fillStyle=sc<.7?'#fff6e4':sc<.8?'#ffe9a8':sc<.9?'#ffd0e0':'#cfe4ff';q.beginPath();q.arc(sx*w,sy*h,sr*dpr,0,PI*2);q.fill();}}
    g.drawImage(bgC,0,0);
    for(const [sx,sy,sr,sp] of TWK){const k=Math.max(0,Math.sin(t*1.7+sp)),r=sr*dpr*(1+2.2*k);g.globalAlpha=.35+.65*k;g.fillStyle='#fff4c2';g.beginPath();for(let i=0;i<8;i++){const a=i*PI/4,q=i%2?r*.22:r;g.lineTo(sx*w+Math.cos(a)*q,sy*h+Math.sin(a)*q);}g.closePath();g.fill();}g.globalAlpha=1;
    const L=lay();
    // 미니어처 카메라: 한눈에 보다가(0~0.4초) 발자국 길 쪽으로 살짝 다가감
    {let cx=w/2,cy=h/2;if(iF>=0&&iT>=0){cx=(L[iF].x+L[iT].x)/2;cy=(L[iF].y+L[iT].y)/2;}const k=ss(.35,2.4,t),z=1+(h>w?.12:.24)*k,fx=w/2+(cx-w/2)*k*.9,fy=h/2+(cy-h/2)*k*.9;
     g.setTransform(z,0,0,z,w/2-fx*z,h/2-fy*z);}
    // 궤도 길(옅은 점선)
    g.save();g.setLineDash([3*dpr,8*dpr]);g.strokeStyle='rgba(251,233,216,.34)';g.lineWidth=2*dpr;g.beginPath();L.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();g.restore();
    // 발자국: 지나온 행성 가장자리 → 다음 행성 가장자리, 휜 길을 따라 한 칸씩
    if(iF>=0&&iT>=0){const A=L[iF],Bq=L[iT],dx=Bq.x-A.x,dy=Bq.y-A.y,dl=Math.hypot(dx,dy)||1,nx=-dy/dl,ny=dx/dl,bow=dl*.18;
      const P=u=>{const x=A.x+dx*u+nx*bow*Math.sin(u*PI),y=A.y+dy*u+ny*bow*Math.sin(u*PI);return [x,y];};
      const u0=(A.R*1.2)/dl,u1=1-(Bq.R*1.25)/dl,FOOT=Math.min(w,h)*.215;
      const want=Math.min(NSTEP,Math.max(0,Math.floor((t-STEP0)/STEPD)+1));while(stepN<want){sfx('travel-step',{step:stepN,gain:1.3,cue:stepN===0});stepN++;}
      for(let i=0;i<stepN;i++){const u=u0+(u1-u0)*(i+.5)/NSTEP,[x,y]=P(u),[x2,y2]=P(u+.01),ang=Math.atan2(y2-y,x2-x)+PI/2,left=i%2===0,pop=ss(0,.18,t-(STEP0+i*STEPD)),sc=FOOT*(pop<1?.6+.55*pop-.15*pop*pop:1);
        const fx=x+nx*(left?-1:1)*FOOT*.09,fy=y+ny*(left?-1:1)*FOOT*.09,al=Math.min(1,pop*1.4);
        {const gl=g.createRadialGradient(fx,fy,0,fx,fy,sc*.2);gl.addColorStop(0,`rgba(255,196,206,${.5*al})`);gl.addColorStop(1,'rgba(255,196,206,0)');g.fillStyle=gl;g.fillRect(fx-sc*.2,fy-sc*.2,sc*.4,sc*.4);} // 빛 받침
        g.save();g.translate(fx,fy);g.rotate(ang);g.scale((left?-1:1)*sc,sc);g.translate(0,.045);solePath(g);g.globalAlpha=al;g.lineJoin='round';g.strokeStyle='#fff3e6';g.lineWidth=.03;g.stroke();g.fillStyle='#F2899A';g.fill();g.restore();}}
    L.forEach((p,i)=>planet(p,ss(.02*i,.25+.02*i,t),i===iT&&stepN>=NSTEP?t:0));
    // 지나온 행성 둘레에 발견한 것 — 작은 그림이 톡톡(0.2초부터 하나씩)
    if(iF>=0&&IM.length){const A=L[iF],n=IM.length,S=Math.max(46*dpr,A.R*1.05);IM.forEach((f,i)=>{const a=-PI*.92+i*(PI*1.0/Math.max(1,n-1)),k=ss(.15+i*.14,.4+i*.14,t);if(k<=0)return;
        const y=A.y+Math.sin(a)*(A.R+S*.78),s=S*(.7+.3*k);let x=A.x+Math.cos(a)*(A.R+S*.78);{const T=g.getTransform(),m=S*.7+6*dpr,x0=(m-T.e)/T.a,x1=(w-m-T.e)/T.a;x=Math.min(x1,Math.max(x0,x));} /* 화면 옆으로 잘리지 않게(세로 화면) */g.save();g.globalAlpha=k;g.fillStyle='rgba(255,246,230,.97)';g.strokeStyle='rgba(90,56,38,.9)';g.lineWidth=2.5*dpr;
        g.beginPath();g.arc(x,y,s*.62,0,PI*2);g.fill();g.stroke();if(f.im&&f.im.complete&&f.im.naturalWidth)g.drawImage(f.im,x-s*.5,y-s*.5,s,s);else if(f.draw){g.translate(x,y);f.draw(g,s);}g.restore();});}
    if(t<sec+2)requestAnimationFrame(draw);}
  requestAnimationFrame(draw);
  const fin=()=>{if(fin.d)return;fin.d=1;if(MAPSKIP===fin)MAPSKIP=null;done({remove(){on=false;COVERING=false;cv.remove();blur.forEach(d=>d.remove());cap.remove();}});};MAPSKIP=fin;setTimeout(fin,sec*1000);});}
let MAPSKIP=null;
/* 우주 지도를 지금 끝냄(화면을 눌러 넘길 때 — map()의 약속이 바로 풀림) */
export function mapSkip(){if(MAPSKIP)MAPSKIP();}
