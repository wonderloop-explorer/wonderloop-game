/* 목소리 시험 측정 (2026-11-15) — 스테이지 시험이 끼워 넣음(WL_INIT=tools/voice-probe.js, 주소 뒤 WL_Q='&voiceTemp').
   매 프레임: 목소리 기록(game/sound voiceLog)·동시에 나온 목소리 수·배경음 줄이기 값(duckState)·대화창과 목소리의 끝 순서를 모은다.
   다시 열어도(reload) 이어지게 sessionStorage에 쌓는다. window.__voice.report() →
     plays 튼 줄(번호·길이) · nofile 대본에 있지만 파일 없는 줄 · unlisted 대본에 없는 글 · maxAtOnce 동시에 나온 목소리 수(1이어야 함)
     cutByClose 대화창이 닫힐 때 목소리가 아직 나오던 횟수(0이어야 함 — 눌러 넘긴 줄은 목소리를 먼저 멈춤) · shortHold 목소리보다 대화창이 먼저 닫힌 줄
     duck {min 배경음 묶음 가장 작은 값, max 가장 큰 값(0.5를 넘으면 안 됨), downs 줄어든 횟수, rises 되돌아온 횟수, riseSec 되돌아오는 데 걸린 시간들}
     ctx 소리 상태(휴대폰: 첫 터치 뒤 running이어야 함) */
(()=>{const KEY='__voiceProbe';let S;try{S=JSON.parse(sessionStorage.getItem(KEY)||'null');}catch(e){S=null;}
  if(!S)S={seen:{},plays:[],nofile:{},unlisted:{},skip:[],late:[],asleep:[],cut:[],userclose:[],replaced:[],stops:[],arrive:[],muteToast:0,muteDuck:0,maxAtOnce:0,cutByClose:0,cuts:[],duck:{min:9,max:0,downs:0,rises:0,riseSec:[]},ctx:[],frames:0,reloads:0};else S.reloads++;
  let AR=null,lastSt=null,riseT=0,dlgWas=false,voWas=null,saved=0,mtWas=false,mtNow=false;
  const save=()=>{try{sessionStorage.setItem(KEY,JSON.stringify(S));}catch(e){}};
  const tick=()=>{requestAnimationFrame(tick);const G=window.wlGame;if(!G||!G.sound||!G.sound.voiceLog)return;S.frames++;
    try{const L=G.sound.voiceLog();S.maxAtOnce=Math.max(S.maxAtOnce,L.max);S.has=L.has;S.lines=L.lines;S.temp=L.temp;
      for(const e of L.log){const k=S.reloads+':'+e.t+':'+e.g+':'+e.ev+':'+e.text;if(S.seen[k])continue;S.seen[k]=1;
        if(e.ev==='play')S.plays.push([e.id,e.dur,e.n]);else if(e.ev==='nofile')S.nofile[e.id]=(S.nofile[e.id]||0)+1;else if(e.ev==='unlisted')S.unlisted[e.text]=(S.unlisted[e.text]||0)+1;
        else if(e.ev==='skip')S.skip.push(e.id||e.text);else if(e.ev==='late')S.late.push(e.id);else if(e.ev==='asleep')S.asleep.push(e.id);else if(e.ev==='cut')S.cut.push(e.id);else if(e.ev==='userclose')S.userclose.push(e.id);else if(e.ev==='replaced')S.replaced.push([e.id,e.text]);else if(e.ev==='stop')S.stops.push([e.id,e.dur]);}
      /* 도착 안내(TR-003·004): 목소리가 나오는 동안 안내 문구가 떠 있는지 · 배경음 묶음(줄이기)·스테이지 배경음 크기(이동 테마 뒤 되돌아오는 중) */
      {const N2=G.sound.voiceNow(),t2=document.getElementById('wlToast'),on2=!!t2&&t2.classList.contains('on'),D2=G.sound.duckState(),tr=/SPC-TR-00[34]/.test(N2.id||'');
       if(tr&&!AR){AR={id:N2.id.slice(3),t0:performance.now(),toastAtStart:on2,gone:0,bus0:D2&&D2.bus,bed0:D2&&D2.bed,busMin:9,bedMin:9,bedMax:0};S.arrive.push(AR);}
       if(AR){if(tr){if(!on2)AR.gone++;if(D2){AR.busMin=Math.min(AR.busMin,D2.bus);AR.bedMin=Math.min(AR.bedMin,D2.bed);AR.bedMax=Math.max(AR.bedMax,D2.bed);}}
         else if(!AR.vEnd){AR.vEnd=+((performance.now()-AR.t0)/1000).toFixed(2);AR.bus1=D2&&D2.bus;AR.bed1=D2&&D2.bed;AR.toastAtEnd=on2;}
         if(AR.vEnd&&!on2&&!AR.toastOff){AR.toastOff=+((performance.now()-AR.t0)/1000).toFixed(2);}
         if(AR.vEnd&&(AR.toastOff||performance.now()-AR.t0>15000)){AR=null;}}}
      const ts=document.getElementById('wlToast'),mt=!!ts&&ts.classList.contains('on')&&(L.mute||[]).includes(ts.textContent);if(mt&&!mtWas)S.muteToast++;mtNow=mt;mtWas=mt;
      const N=G.sound.voiceNow(),d=document.getElementById('wlDlg'),dOn=!!d&&getComputedStyle(d).display!=='none';
      if(dlgWas&&!dOn&&voWas&&N.id===voWas){S.cutByClose++;S.cuts.push(voWas);} /* 대화창이 닫혔는데 그 줄 목소리가 계속 나옴 */
      dlgWas=dOn;voWas=dOn?N.id:null;
      const D=G.sound.duckState();if(D){S.duck.min=Math.min(S.duck.min,D.bus);S.duck.max=Math.max(S.duck.max,D.bus);
        if(D.st!==lastSt){if(D.st==='down'){S.duck.downs++;if(mtNow&&!dOn)S.muteDuck++;}if(D.st==='rise'){S.duck.rises++;riseT=D.t;}if(D.st==='up'&&lastSt==='rise')S.duck.riseSec.push(+(D.t-riseT).toFixed(2));lastSt=D.st;}
        if(!S.ctx.length||S.ctx[S.ctx.length-1]!=='running')S.ctx.push('running');}
    }catch(e){S.err=String(e);}
    if(performance.now()-saved>1000){saved=performance.now();save();}};
  requestAnimationFrame(tick);addEventListener('pagehide',save);
  window.__voice={report(){save();const ids=S.plays.map(p=>p[0]),dup={};ids.forEach(i=>dup[i]=(dup[i]||0)+1);
    return {색인:{줄:S.lines,'파일 있는 줄':S.has,임시:S.temp},'튼 목소리(번)':S.plays.length,'튼 줄(서로 다른)':Object.keys(dup).length,'동시에 나온 목소리 최대':S.maxAtOnce,'대화창이 닫힐 때 목소리가 남은 횟수':S.cutByClose,'그 줄':S.cuts,
      '파일 없는 줄(자막만)':S.nofile,'대본에 없는 글':S.unlisted,'건너뛴 작은 목소리':S.skip,'늦게 읽혀 못 튼 줄':S.late,'카드 나레이션이 끊긴 줄(저절로)':S.cut,'카드를 눌러 닫아 멈춘 줄':S.userclose,'새 목소리가 앞 목소리를 끊은 횟수':S.replaced.length,'끊긴 줄':S.replaced,'도착 안내':S.arrive,'끝나기 전에 멈춘 목소리(번호·그때까지 초)':S.stops,'글자만 안내 문구가 뜬 횟수':S.muteToast,'그때 배경음이 줄어든 횟수':S.muteDuck,'소리가 깨기 전이라 못 튼 줄':S.asleep,
      '배경음 줄이기':S.duck,'다시 연 횟수':S.reloads,'측정 오류':S.err||null,plays:S.plays};}};})();
