/* 요정의 숲 — 합성 소리 (파일이 생기면 같은 id로 sound.register하면 파일이 먼저)
   knot 매듭 잡아당김·툭 풀림·반짝 / silk-open 하얀 실 우편길이 아래부터 켜질 때 맑은 종소리가 차례로 오름(마디 10개가 켜지는 박자 0.226초)
   step-leaf 마른 잎 발소리 / wing 토리 날갯짓 / amb-roots 뿌리 우체국 배경음(땅속 낮은 웅웅거림 + 가끔 뿌리 삐걱임·멀리 편지 넘기는 소리) */
import {bell,hiss,noise,rr,tone} from '../../game/synth.js';
const FAIRY_SOUNDS={
  knot:{dur:1.6,play(ac,out){
    [0,.34].forEach((t,i)=>{tone(ac,out,{t,f:150+i*35,f2:240+i*50,type:'sawtooth',a:.12,d:.24,g:.07,ft:'bandpass',ff:700,fq:3}); // 팽팽하게 당겨지는 실
      hiss(ac,out,{t,ff:900,ff2:1700,fq:3,a:.1,d:.2,g:.08});});
    tone(ac,out,{t:.88,f:720,f2:170,a:.002,d:.13,g:.2});hiss(ac,out,{t:.88,ft:'highpass',ff:2500,a:.001,d:.04,g:.22}); // 툭 풀림
    [1568,2093,2637].forEach((f,i)=>bell(ac,out,{t:.98+i*.08,f,d:.55,g:.07}));}},                                        // 빛이 흩어지는 반짝
  'silk-open':{dur:3.6,play(ac,out){
    [784,880,1047,1175,1319,1568,1760,2093,2349,2637].forEach((f,i)=>bell(ac,out,{t:i*.226,f,d:1.5,g:.11-i*.004}));
    tone(ac,out,{f:196,a:.6,d:2.6,g:.05});tone(ac,out,{f:294,a:.8,d:2.4,g:.03});                                     // 아래에서 받쳐 주는 따뜻한 울림
    hiss(ac,out,{ft:'highpass',ff:5500,a:1.4,d:1.8,g:.035});}},                                                       // 빛 가루
  'step-leaf':{dur:.12,play(ac,out){const f=rr(2200,4200);
    hiss(ac,out,{ff:f,fq:1.2,a:.003,d:.05,g:.5});hiss(ac,out,{t:rr(.02,.035),ff:f*rr(.8,1.2),fq:1.5,a:.002,d:.04,g:.28});
    tone(ac,out,{f:rr(100,125),f2:70,a:.003,d:.06,g:.22});}},
  wing:{dur:.08,play(ac,out){hiss(ac,out,{ff:rr(700,1100),fq:1.5,a:.012,d:.06,g:.4});}},
  'amb-roots':{bed(ac,out){
    const far=ac.createBiquadFilter();far.type='lowpass';far.frequency.value=1600;const fg=ac.createGain();fg.gain.value=.8;far.connect(fg);fg.connect(out); // 멀리서 나는 소리
    const s=ac.createBufferSource();s.buffer=noise(ac,'brown');s.loop=true;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=200;lp.Q.value=.7;
    const hum=ac.createGain();hum.gain.value=.55;s.connect(lp);lp.connect(hum);hum.connect(out);s.start();
    const lfo=ac.createOscillator(),ld=ac.createGain();lfo.frequency.value=.07;ld.gain.value=60;lfo.connect(ld);ld.connect(lp.frequency);lfo.start(); // 숨 쉬듯 느린 출렁임
    const dr=[55,82.4].map((f,i)=>{const o=ac.createOscillator();o.frequency.value=f;const g=ac.createGain();g.gain.value=.025-i*.008;o.connect(g);g.connect(out);o.start();return o;});
    let tc=rr(4,9),tp=rr(6,12);
    const creak=()=>{const f=rr(90,135),d=rr(.5,1.1);tone(ac,far,{f,f2:f*rr(1.06,1.18),type:'sawtooth',a:d*.4,d:d*.6,g:.035,ft:'bandpass',ff:rr(500,800),fq:5});};
    const paper=()=>{let t=0;for(let k=0,n=2+Math.floor(rr(0,3));k<n;k++){hiss(ac,far,{t,ff:rr(2400,3800),fq:1,a:.01,d:rr(.05,.09),g:.05});t+=rr(.08,.16);}};
    return {tick(dt){if((tc-=dt)<0){creak();tc=rr(8,16);}if((tp-=dt)<0){paper();tp=rr(10,20);}},
      stop(){[s,lfo,...dr].forEach(n=>{try{n.stop();}catch(e){}});far.disconnect();fg.disconnect();hum.disconnect();}};}},
};
export {FAIRY_SOUNDS};
