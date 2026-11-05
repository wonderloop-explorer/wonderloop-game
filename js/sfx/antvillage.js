/* 원더룹 — 개미굴(앤트빌리지) 전용 효과음 (2026-11-05, 공통 틀 6단계 — docs/sfx-list.md)
   공통 묶음(js/sfx/common.js)에 넣지 않은 개미굴 원본 소리 — 경비개미 추격·잠든 보모·굴 무너짐처럼 개미굴 사건에만 맞는 것.
   이름·음·길이·세기는 원본 sfx() 그대로. 개미굴 세계(js/worlds/antvillage.js, id 'antvillage')에서만 등록된다(game/sound useWorld).
   (시리즈 규칙상 쫓기는 미션·실패는 없으니 새 세계에서는 쓰지 않는다 — 개미굴 이식 때 쓰려고 남겨 둠) */
import {mf,noise,rr,rumbleBurst,tone,bell} from './common.js';
const R=Math.random;
const ORIG={
  alarm:[.65,(c,t,D)=>[0,.17,.34,.51].forEach((d,i)=>tone(c,'square',mf(i%2?83:88),t+d,.14,.075,D,{lp:2600}))],
  alert:[.29,(c,t,D)=>{tone(c,'square',mf(83),t,.08,.09,D,{lp:2600});tone(c,'square',mf(90),t+.09,.2,.09,D,{lp:2600});}],
  windup:[.32,(c,t,D)=>tone(c,'sawtooth',130,t,.32,.075,D,{slide:270,lp:900})],
  caught:[.88,(c,t,D)=>{tone(c,'sine',170,t,.45,.45,D,{slide:48});[67,63,60].forEach((m,i)=>tone(c,'triangle',mf(m),t+.28+i*.15,.26,.09,D));rumbleBurst(c,t,.6,D);}],
  collapse:[1.2,(c,t,D)=>{rumbleBurst(c,t,1.2,D);for(let i=0;i<30;i++)noise(c,t+R()*1,.05,.09,D,'bandpass',rr(1100,2700),2);noise(c,t,.55,.45,D,'lowpass',420);}],
  snore:[.9,(c,t,D)=>{noise(c,t,.9,.035,D,'lowpass',420,.8,200);tone(c,'sine',115,t,.9,.025,D,{slide:85,a:.3});}],
  dex:[1.39,(c,t,D)=>{noise(c,t,.16,.12,D,'highpass',3200);[79,83,86,91].forEach((m,i)=>bell(c,m,t+.08+i*.07,1.1,.06,D));}], // 원본 새 도감 카드(새 엔진은 공통 card-new를 써 왔다)
};
const KINDS={
  'ant-alarm':['개미굴','alarm','경비개미가 쫓아옴(경보)'],
  'ant-alert':['개미굴','alert','들킴(!) · 미션 카드 바로 시작'],
  'ant-windup':['개미굴','windup','덤비기 전 웅크림 · 수레 미끄러짐'],
  'ant-caught':['개미굴','caught','잡힘'],
  'ant-collapse':['개미굴','collapse','흙더미 무너짐'],
  'ant-snore':['개미굴','snore','코 고는 보모'],
  'ant-dex':['개미굴','dex','원본 새 도감 카드 소리'],
};
const ALIAS={alarm:'ant-alarm',alert:'ant-alert',windup:'ant-windup',caught:'ant-caught',collapse:'ant-collapse',snore:'ant-snore'};
const SOUNDS={};for(const k in KINDS){const [dur,fn]=ORIG[KINDS[k][1]];SOUNDS[k]={dur,play(c,out){fn(c,c.currentTime,out);}};}
export {ALIAS,KINDS,SOUNDS};
