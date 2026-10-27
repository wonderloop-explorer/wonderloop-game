/* 원더룹 베이스캠프 — 색연필 텍스처·재질·메쉬 헬퍼 */
import * as THREE from 'three';
const PI=Math.PI;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=mulberry32(11);
const rnd=(a,b)=>a+(b-a)*R();
const pick=arr=>arr[Math.floor(R()*arr.length)];
/* 색연필 명암: sRGB 값 그대로 HSL을 다루고, 16진수는 r128처럼 버림(<<)으로 만든다 — 반올림하면 텍스처 색이 한 칸씩 어긋난다 */
function shade(hex,amt){const cm=THREE.ColorManagement,on=cm.enabled;cm.enabled=false;
  const c=new THREE.Color(hex);const h={};c.getHSL(h);c.setHSL(h.h,h.s,Math.min(1,Math.max(0,h.l+amt)));cm.enabled=on;
  return '#'+('000000'+((c.r*255)<<16^(c.g*255)<<8^(c.b*255)<<0).toString(16)).slice(-6);}
function hexA(hex,a){const c=new THREE.Color(hex).getRGB({},THREE.SRGBColorSpace);return `rgba(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)},${a})`;}
/* 색 관리(ColorManagement)가 켜져 있어 new THREE.Color('#hex')가 sRGB 색을 선형으로 바꿔 준다 → 재질 색은 lin()으로 */
const lin=hex=>new THREE.Color(hex);
/* r128 시절 16진수를 변환 없이 선형 값으로 쓰던 색(조명, 빛기둥·먼지 등) — 화면을 그대로 유지하려고 그 값 그대로 둔다 */
const rawLin=hex=>new THREE.Color().setHex(hex,THREE.LinearSRGBColorSpace);

/* ---------- 색연필 텍스처 ---------- */
function hatch(g,S,dark,light,amt){
  g.lineCap='round';
  const n=Math.floor(240*amt*(S/256)*(S/256));
  for(let i=0;i<n;i++){
    const x=rnd(-12,S),y=rnd(-12,S),L=rnd(8,26),a=-0.85+rnd(-0.15,0.15);
    g.strokeStyle=hexA(R()<0.62?dark:light,rnd(0.07,0.2));g.lineWidth=rnd(0.8,1.8);
    g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();
  }
  const d=S*S/80;
  for(let i=0;i<d;i++){g.fillStyle=hexA(R()<0.5?dark:'#ffffff',rnd(0.04,0.12));g.fillRect(rnd(0,S),rnd(0,S),1,1);}
}
function blotches(g,S,dark,light,n,r0,r1,a){
  for(let i=0;i<n;i++){const x=rnd(0,S),y=rnd(0,S),r=rnd(r0,r1);
    const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,hexA(R()<0.5?dark:light,a));gr.addColorStop(1,hexA(dark,0));
    g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
}
function wavyLine(g,S,y,amp,freq,ph){g.beginPath();g.moveTo(0,y);for(let x=0;x<=S;x+=8)g.lineTo(x,y+Math.sin(x*freq+ph)*amp);g.stroke();}

const texCache={};
function pencil(base,kind,o){
  kind=kind||'plain';o=o||{};
  const key=base+'|'+kind+'|'+JSON.stringify(o);
  if(texCache[key])return texCache[key];
  const S=o.size||256;const cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');
  const dark=shade(base,-0.13),darker=shade(base,-0.25),light=shade(base,0.1);
  g.fillStyle=base;g.fillRect(0,0,S,S);
  let hatchAmt=o.hatch==null?1:o.hatch;
  if(kind==='planks'){
    const rows=4,h=S/rows;
    for(let r=0;r<rows;r++){const y=r*h;
      g.fillStyle=shade(base,rnd(-0.05,0.04));g.fillRect(0,y,S,h);
      g.strokeStyle=hexA(dark,0.35);g.lineWidth=1;
      for(let k=0;k<5;k++)wavyLine(g,S,y+rnd(5,h-5),1.6,0.04,k*2);
      g.fillStyle=hexA(darker,0.5);g.beginPath();g.ellipse(rnd(20,S-20),y+h*0.5,5,2.5,0,0,PI*2);g.fill();
      g.strokeStyle=hexA(darker,0.85);g.lineWidth=2;g.beginPath();g.moveTo(0,y);g.lineTo(S,y);g.stroke();
      const jx=(r%2)?S*0.32:S*0.78;g.beginPath();g.moveTo(jx,y);g.lineTo(jx,y+h);g.stroke();
    }
  }else if(kind==='wood'){
    g.strokeStyle=hexA(dark,0.4);g.lineWidth=1;
    for(let k=0;k<14;k++)wavyLine(g,S,rnd(0,S),2,0.03,k);
  }else if(kind==='boards'){
    const n=6,w=S/n;
    for(let i=0;i<n;i++){g.fillStyle=shade(base,rnd(-0.03,0.03));g.fillRect(i*w,0,w,S);
      g.strokeStyle=hexA(darker,0.6);g.lineWidth=2;g.beginPath();g.moveTo(i*w,0);g.lineTo(i*w,S);g.stroke();
      g.strokeStyle=hexA(light,0.6);g.lineWidth=1.5;g.beginPath();g.moveTo(i*w+3,0);g.lineTo(i*w+3,S);g.stroke();}
  }else if(kind==='plaster'){
    blotches(g,S,dark,light,40,10,40,0.12);
  }else if(kind==='quilt'){
    const pal=o.pal||['#f2b5a0','#f6d68b','#a9d3c4','#c9b6e2','#f7c3cf','#bcd893','#f4e4c4'];
    const n=4,w=S/n;
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){
      const c=pick(pal);g.fillStyle=c;g.fillRect(i*w,j*w,w,w);
      const m=Math.floor(R()*4),dc=shade(c,-0.2),lc=shade(c,0.12);
      if(m===0){g.fillStyle=hexA(lc,0.9);for(let a=0;a<3;a++)for(let b=0;b<3;b++){g.beginPath();g.arc(i*w+w*(a+0.5)/3,j*w+w*(b+0.5)/3,3,0,PI*2);g.fill();}}
      else if(m===1){g.strokeStyle=hexA(dc,0.35);g.lineWidth=4;for(let a=1;a<4;a++){g.beginPath();g.moveTo(i*w+a*w/4,j*w);g.lineTo(i*w+a*w/4,j*w+w);g.stroke();g.beginPath();g.moveTo(i*w,j*w+a*w/4);g.lineTo(i*w+w,j*w+a*w/4);g.stroke();}}
      else if(m===2){g.fillStyle=hexA(lc,0.95);const cx=i*w+w/2,cy=j*w+w/2;for(let p=0;p<5;p++){g.beginPath();g.arc(cx+Math.cos(p*1.256)*8,cy+Math.sin(p*1.256)*8,6,0,PI*2);g.fill();}g.fillStyle=hexA(dc,0.9);g.beginPath();g.arc(cx,cy,4,0,PI*2);g.fill();}
      else{g.fillStyle=hexA(dc,0.35);g.beginPath();g.moveTo(i*w,j*w);g.lineTo(i*w+w,j*w+w);g.lineTo(i*w,j*w+w);g.fill();}
    }
    g.setLineDash([5,4]);g.strokeStyle='rgba(255,250,240,0.8)';g.lineWidth=1.5;
    for(let i=0;i<=n;i++){g.beginPath();g.moveTo(i*w+3,0);g.lineTo(i*w+3,S);g.stroke();g.beginPath();g.moveTo(0,i*w+3);g.lineTo(S,i*w+3);g.stroke();}
    g.setLineDash([]);hatchAmt*=0.7;
  }else if(kind==='rug'){
    const rings=o.rings||['#e9a07c','#f4d4a2','#8fc4b7','#f4d4a2','#e9a07c','#f7e6c8'];
    const c=S/2;for(let i=0;i<rings.length;i++){g.fillStyle=rings[i];g.beginPath();g.arc(c,c,c*(1-i/rings.length),0,PI*2);g.fill();}
    g.fillStyle=hexA('#fff7e6',0.85);const rr=c*(1-2.5/rings.length);
    for(let k=0;k<22;k++){const a=k/22*PI*2;g.beginPath();g.arc(c+Math.cos(a)*rr,c+Math.sin(a)*rr,3.5,0,PI*2);g.fill();}
  }else if(kind==='stripes'){
    const cols=o.stripes||[base,'#fff3df'];const n=o.n||8;const w=S/n;
    for(let i=0;i<n;i++){g.fillStyle=cols[i%cols.length];if(o.horizontal)g.fillRect(0,i*w,S,w);else g.fillRect(i*w,0,w,S);}
  }else if(kind==='leather'){
    blotches(g,S,dark,light,26,12,36,0.2);
    g.setLineDash([6,5]);g.strokeStyle=hexA('#f5dfc0',0.8);g.lineWidth=2;g.strokeRect(10,10,S-20,S-20);g.setLineDash([]);
  }else if(kind==='crate'){
    for(let r=0;r<3;r++){g.strokeStyle=hexA(dark,0.4);g.lineWidth=1;for(let k=0;k<4;k++)wavyLine(g,S,r*S/3+rnd(6,S/3-6),1.5,0.05,k);
      g.strokeStyle=hexA(darker,0.8);g.lineWidth=2;g.beginPath();g.moveTo(0,r*S/3);g.lineTo(S,r*S/3);g.stroke();}
    g.fillStyle=hexA(darker,0.55);g.fillRect(0,0,S,20);g.fillRect(0,S-20,S,20);g.fillRect(0,0,20,S);g.fillRect(S-20,0,20,S);
    g.strokeStyle=hexA(darker,0.55);g.lineWidth=18;g.beginPath();g.moveTo(20,S-20);g.lineTo(S-20,20);g.stroke();
    g.fillStyle=hexA('#5a4a3a',0.8);[[10,10],[S-10,10],[10,S-10],[S-10,S-10]].forEach(p=>{g.beginPath();g.arc(p[0],p[1],3,0,PI*2);g.fill();});
  }else if(kind==='weave'){
    const n=8,w=S/n;
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){g.fillStyle=((i+j)%2)?dark:light;g.fillRect(i*w+1,j*w+1,w-2,w-2);
      g.strokeStyle=hexA(darker,0.5);g.lineWidth=1;g.strokeRect(i*w+1,j*w+1,w-2,w-2);}
  }else if(kind==='cork'){
    for(let i=0;i<900;i++){g.fillStyle=hexA(R()<0.5?darker:light,rnd(0.25,0.6));g.beginPath();g.arc(rnd(0,S),rnd(0,S),rnd(0.8,2.2),0,PI*2);g.fill();}
  }else if(kind==='paper'){
    g.strokeStyle=hexA('#9bb7d4',0.6);g.lineWidth=1.2;for(let y=40;y<S;y+=22){g.beginPath();g.moveTo(16,y);g.lineTo(S-16,y);g.stroke();}
    g.strokeStyle=hexA('#6b5848',0.6);g.lineWidth=2;for(let y=36;y<S-30;y+=22){g.beginPath();let x=22;g.moveTo(x,y);while(x<S-30-rnd(0,60)){x+=rnd(6,14);g.lineTo(x,y+rnd(-2,2));}g.stroke();}
    hatchAmt*=0.5;
  }else if(kind==='antsketch'){
    g.strokeStyle='#5b4636';g.lineWidth=3;g.fillStyle='#e9b28f';
    const cx=S/2,cy=S/2+10;[[cx-50,cy,26,20],[cx,cy-6,20,17],[cx+44,cy-14,24,22]].forEach(e=>{g.beginPath();g.ellipse(e[0],e[1],e[2],e[3],0,0,PI*2);g.fill();g.stroke();});
    for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(cx+k*12,cy+8);g.quadraticCurveTo(cx+k*30,cy+40,cx+k*44,cy+58);g.stroke();}
    g.beginPath();g.moveTo(cx+52,cy-34);g.quadraticCurveTo(cx+60,cy-70,cx+80,cy-76);g.stroke();
    g.beginPath();g.moveTo(cx+40,cy-34);g.quadraticCurveTo(cx+36,cy-74,cx+54,cy-86);g.stroke();
    g.fillStyle='#5b4636';g.beginPath();g.arc(cx+52,cy-16,4,0,PI*2);g.fill();
    hatchAmt*=0.5;
  }else if(kind==='map'){
    g.fillStyle='#f3e1b9';g.fillRect(0,0,S,S);
    blotches(g,S,'#d9b98a','#fff4dc',20,20,60,0.25);
    g.fillStyle='#c7e0ad';g.strokeStyle='#7f9a63';g.lineWidth=3;g.beginPath();
    for(let k=0;k<=24;k++){const a=k/24*PI*2,r=S*0.32+Math.sin(a*5)*18+Math.cos(a*3)*12;const x=S*0.5+Math.cos(a)*r*1.1,y=S*0.52+Math.sin(a)*r*0.8;k?g.lineTo(x,y):g.moveTo(x,y);}
    g.closePath();g.fill();g.stroke();
    g.fillStyle='#a6cbe0';g.beginPath();g.ellipse(S*0.62,S*0.45,30,18,0.4,0,PI*2);g.fill();
    g.fillStyle='#c79a72';g.strokeStyle='#7c5a3e';g.lineWidth=2;
    [[0.3,0.38],[0.36,0.33],[0.42,0.4],[0.7,0.68]].forEach(p=>{const x=S*p[0],y=S*p[1];g.beginPath();g.moveTo(x-16,y+12);g.lineTo(x,y-14);g.lineTo(x+16,y+12);g.closePath();g.fill();g.stroke();});
    g.fillStyle='#6f9e5c';[[0.55,0.7],[0.6,0.74],[0.5,0.76],[0.3,0.62]].forEach(p=>{g.beginPath();g.arc(S*p[0],S*p[1],8,0,PI*2);g.fill();});
    g.setLineDash([8,7]);g.strokeStyle='#d45d5a';g.lineWidth=3.5;g.beginPath();g.moveTo(S*0.15,S*0.86);
    g.bezierCurveTo(S*0.35,S*0.7,S*0.25,S*0.5,S*0.5,S*0.55);g.bezierCurveTo(S*0.72,S*0.6,S*0.62,S*0.3,S*0.8,S*0.25);g.stroke();g.setLineDash([]);
    g.strokeStyle='#c2413e';g.lineWidth=5;g.beginPath();g.moveTo(S*0.77,S*0.22);g.lineTo(S*0.83,S*0.28);g.moveTo(S*0.83,S*0.22);g.lineTo(S*0.77,S*0.28);g.stroke();
    g.strokeStyle='#7c5a3e';g.lineWidth=2;g.beginPath();g.arc(S*0.15,S*0.17,26,0,PI*2);g.stroke();
    g.beginPath();g.moveTo(S*0.15,S*0.17-30);g.lineTo(S*0.15+6,S*0.17);g.lineTo(S*0.15,S*0.17+30);g.lineTo(S*0.15-6,S*0.17);g.closePath();g.fillStyle='#d45d5a';g.fill();
    g.fillStyle='#7c5a3e';g.font='bold 20px Georgia, serif';g.textAlign='center';g.fillText('N',S*0.15,S*0.17-36);
    g.strokeStyle=hexA('#9a7a52',0.8);g.lineWidth=6;g.strokeRect(6,6,S-12,S-12);
    hatchAmt*=0.6;
  }else if(kind==='leaf'){
    g.strokeStyle=hexA(light,0.9);g.lineWidth=4;g.beginPath();g.moveTo(S/2,S);g.lineTo(S/2,0);g.stroke();
    g.lineWidth=2;g.strokeStyle=hexA(light,0.55);
    for(let y=S*0.88;y>S*0.12;y-=S/9){g.beginPath();g.moveTo(S/2,y);g.quadraticCurveTo(S*0.32,y-12,S*0.04,y-34);g.stroke();g.beginPath();g.moveTo(S/2,y);g.quadraticCurveTo(S*0.68,y-12,S*0.96,y-34);g.stroke();}
    g.strokeStyle=hexA(darker,0.5);g.lineWidth=6;g.strokeRect(0,0,S,S);
  }else if(kind==='hair'){
    for(let i=0;i<80;i++){const x=rnd(0,S);g.strokeStyle=hexA(R()<.5?dark:light,rnd(.35,.65));g.lineWidth=rnd(1.2,2.4);g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+rnd(-8,8),S*.3,x+rnd(-8,8),S*.6,x+rnd(-6,6),S);g.stroke();}
    for(let i=0;i<70;i++){const x=rnd(0,S),y=S*.32+rnd(-9,9);g.strokeStyle=hexA(shade(base,.17),rnd(.25,.5));g.lineWidth=rnd(1.5,3);g.beginPath();g.moveTo(x,y-rnd(8,16));g.lineTo(x+rnd(-2,2),y+rnd(8,16));g.stroke();}
    hatchAmt*=0.4;
  }else if(kind==='stitch'){
    g.setLineDash([10,7]);g.strokeStyle=hexA('#fff3df',0.9);g.lineWidth=4;g.beginPath();g.moveTo(0,S*.5);g.lineTo(S,S*.5);g.stroke();g.setLineDash([]);
  }else if(kind==='jersey'){
    for(let x=0;x<S;x+=6){g.strokeStyle=hexA(dark,.16);g.lineWidth=1.4;g.beginPath();for(let y=0;y<=S;y+=6){g.moveTo(x,y);g.lineTo(x+3,y+5);g.lineTo(x+6,y);}g.stroke();}
    for(let y=0;y<S;y+=6){g.strokeStyle=hexA(light,.18);g.lineWidth=1;g.beginPath();g.moveTo(0,y+.5);g.lineTo(S,y+.5);g.stroke();}
    blotches(g,S,dark,light,10,20,50,.06);hatchAmt*=.35;
  }else if(kind==='denim'){
    for(let k=-S;k<S;k+=4){g.strokeStyle=hexA(k%8?shade(base,-.12):shade(base,.08),.35);g.lineWidth=1.6;g.beginPath();g.moveTo(k,0);g.lineTo(k+S,S);g.stroke();}
    for(let i=0;i<500;i++){g.fillStyle=hexA('#ffffff',rnd(.08,.22));g.fillRect(rnd(0,S),rnd(0,S),rnd(1,4),1);}
    blotches(g,S,dark,shade(base,.14),14,20,60,.14);hatchAmt*=.35;
  }else if(kind==='twill'){
    for(let k=-S;k<S;k+=3){g.strokeStyle=hexA(k%6?dark:light,.22);g.lineWidth=1.1;g.beginPath();g.moveTo(k,0);g.lineTo(k+S,S);g.stroke();}
    blotches(g,S,dark,light,10,20,50,.08);hatchAmt*=.35;
  }else if(kind==='canvas'||kind==='linen'){
    for(let y=0;y<S;y+=3){g.strokeStyle=hexA(y%6?dark:light,kind==='linen'?.14:.2);g.lineWidth=1.2;g.beginPath();g.moveTo(0,y+rnd(-.4,.4));g.lineTo(S,y+rnd(-.4,.4));g.stroke();}
    for(let x=0;x<S;x+=3){g.strokeStyle=hexA(x%6?light:dark,kind==='linen'?.12:.18);g.lineWidth=1.2;g.beginPath();g.moveTo(x,0);g.lineTo(x,S);g.stroke();}
    if(kind==='linen')for(let i=0;i<40;i++){const y=rnd(0,S);g.strokeStyle=hexA(R()<.5?light:dark,.35);g.lineWidth=rnd(1.5,2.5);g.beginPath();const x=rnd(0,S);g.moveTo(x,y);g.lineTo(x+rnd(20,60),y);g.stroke();}
    hatchAmt*=.4;
  }else if(kind==='suede'){
    for(let i=0;i<3000;i++){g.fillStyle=hexA(R()<.5?dark:light,rnd(.08,.2));g.beginPath();g.arc(rnd(0,S),rnd(0,S),rnd(.6,1.6),0,7);g.fill();}
    blotches(g,S,dark,light,18,15,45,.12);hatchAmt*=.3;
  }else if(kind==='rubber'){
    for(let i=0;i<900;i++){g.fillStyle=hexA(R()<.5?dark:'#ffffff',rnd(.06,.15));g.fillRect(rnd(0,S),rnd(0,S),1.5,1.5);}
    g.strokeStyle=hexA(dark,.3);g.lineWidth=2;for(let y=S*.62;y<S;y+=9){g.beginPath();g.moveTo(0,y);g.lineTo(S,y);g.stroke();}
    hatchAmt*=.2;
  }else if(kind==='dots'){
    for(let y=0;y<S;y+=32)for(let x=((y/32)%2)*16;x<S;x+=32){g.fillStyle=hexA('#fff6ea',.95);g.beginPath();g.arc(x+8,y+8,4.2,0,7);g.fill();
      g.strokeStyle=hexA('#fff6ea',.8);g.lineWidth=1.6;g.beginPath();g.arc(x+8,y+8,8,0,7);g.stroke();}
    hatchAmt*=.5;
  }else if(kind==='leather2'){
    blotches(g,S,dark,light,30,10,32,.2);
    for(let i=0;i<1600;i++){g.fillStyle=hexA(dark,rnd(.05,.15));g.beginPath();g.arc(rnd(0,S),rnd(0,S),rnd(.5,1.3),0,7);g.fill();}
    if(o.stitch==='h'){g.setLineDash([7,5]);g.strokeStyle=hexA('#f5dfc0',.75);g.lineWidth=2.2;[12,S-12].forEach(y=>{g.beginPath();g.moveTo(0,y);g.lineTo(S,y);g.stroke();});g.setLineDash([]);}hatchAmt*=.4;
  }else if(kind==='wool'){
    const cols=o.stripes||[base];const n=o.n||6;for(let i=0;i<n;i++){g.fillStyle=cols[i%cols.length];g.fillRect(0,i*S/n,S,S/n);}
    for(let i=0;i<2500;i++){g.strokeStyle=hexA(R()<.5?'#ffffff':dark,rnd(.06,.16));g.lineWidth=1;const x=rnd(0,S),y=rnd(0,S);g.beginPath();g.moveTo(x,y);g.lineTo(x+rnd(-3,3),y+rnd(-3,3));g.stroke();}
    hatchAmt*=.3;
  }else if(kind==='globe'){
    g.fillStyle='#bfe0a0';g.strokeStyle='#7f9a63';g.lineWidth=3;
    for(let k=0;k<6;k++){const x=rnd(20,S-20),y=rnd(50,S-50);g.beginPath();for(let s=0;s<=14;s++){const a=s/14*PI*2,r=rnd(18,40);const px=x+Math.cos(a)*r*1.4,py=y+Math.sin(a)*r;s?g.lineTo(px,py):g.moveTo(px,py);}g.closePath();g.fill();g.stroke();}
    g.strokeStyle=hexA('#ffffff',0.45);g.lineWidth=1.5;for(let y=S/6;y<S;y+=S/6){g.beginPath();g.moveTo(0,y);g.lineTo(S,y);g.stroke();}
  }
  hatch(g,S,dark,light,hatchAmt);
  if(o.grain){const n=S*S/12;for(let i=0;i<n;i++){g.fillStyle=hexA(R()<.55?shade(base,-.2):shade(base,.15),rnd(.1,o.grain));const z=rnd(1,2.2);g.fillRect(rnd(0,S),rnd(0,S),z,z);}}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;
  if(o.rep)t.repeat.set(o.rep[0],o.rep[1]);
  texCache[key]=t;return t;
}
function skyTex(night){
  const S=256,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,S);
  if(night){gr.addColorStop(0,'#28366a');gr.addColorStop(1,'#56649d');}else{gr.addColorStop(0,'#86c9ef');gr.addColorStop(1,'#e6f5ff');}
  g.fillStyle=gr;g.fillRect(0,0,S,S);
  if(night){
    for(let i=0;i<70;i++){g.fillStyle=`rgba(255,248,214,${rnd(0.4,1)})`;g.beginPath();g.arc(rnd(0,S),rnd(0,S*0.8),rnd(0.6,2),0,PI*2);g.fill();}
    g.fillStyle='#fff3c4';g.beginPath();g.arc(S*0.68,S*0.3,26,0,PI*2);g.fill();
    g.fillStyle='#2d3b70';g.beginPath();g.arc(S*0.74,S*0.26,24,0,PI*2);g.fill();
  }else{
    g.fillStyle='rgba(255,255,255,0.92)';
    [[0.3,0.55,1],[0.72,0.35,0.8],[0.55,0.8,1.2]].forEach(c=>{for(let k=0;k<5;k++){g.beginPath();g.arc(S*c[0]+(k-2)*16*c[2],S*c[1]+Math.abs(k-2)*5,(20-Math.abs(k-2)*4)*c[2],0,PI*2);g.fill();}});
  }
  hatch(g,S,night?'#1d2753':'#6fb3dc','#ffffff',0.6);
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;
}

/* ---------- 재질 / 메쉬 헬퍼 ---------- */
function M(color,kind,o){
  o=o||{};
  const m=new THREE.MeshStandardMaterial({map:pencil(color,kind,o),roughness:0.95,metalness:0,flatShading:o.flat!==false});
  if(o.opacity!=null){m.transparent=true;m.opacity=o.opacity;m.depthWrite=false;}
  if(o.emissive){m.emissive=lin(o.emissive);m.emissiveIntensity=o.ei==null?1:o.ei;}
  m.userData.base=color;return m;
}
const lineMats={};
function lineMat(c){if(!lineMats[c])lineMats[c]=new THREE.LineBasicMaterial({color:lin(shade(c,-0.38)),transparent:true,opacity:0.5});return lineMats[c];}
const scene=new THREE.Scene();
function add(geo,mat,x,y,z,o){
  o=o||{};const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);
  if(o.rx)m.rotation.x=o.rx;if(o.ry)m.rotation.y=o.ry;if(o.rz)m.rotation.z=o.rz;
  if(o.s)m.scale.set(o.s[0],o.s[1],o.s[2]);
  m.castShadow=o.cast!==false;m.receiveShadow=true;
  if(o.line!==false&&mat.userData.base){m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo,o.thr||28),lineMat(mat.userData.base)));}
  (o.parent||scene).add(m);return m;
}
/* 회전체(상체·조끼·모자): r128처럼 면 법선을 평균하고 이음매 법선을 맞춘다 — 새 LatheGeometry 법선은 음영이 달라진다 */
function lathe(points,segments,phiStart,phiLength=PI*2){
  const g=new THREE.LatheGeometry(points,segments,phiStart,phiLength);g.computeVertexNormals();
  if(phiLength===PI*2){const n=g.attributes.normal.array,base=segments*points.length*3,v=new THREE.Vector3();
    for(let j=0;j<points.length*3;j+=3){v.set(n[j]+n[base+j],n[j+1]+n[base+j+1],n[j+2]+n[base+j+2]).normalize();
      n[j]=n[base+j]=v.x;n[j+1]=n[base+j+1]=v.y;n[j+2]=n[base+j+2]=v.z;}}
  return g;}
const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
const C=(rt,rb,h,s)=>new THREE.CylinderGeometry(rt,rb,h,s||10);
function boxAt(w,h,d,mat,x,yb,z,o){return add(B(w,h,d),mat,x,yb+h/2,z,o);}
function cylAt(rt,rb,h,mat,x,yb,z,o){o=o||{};o.thr=o.thr||50;return add(C(rt,rb,h,o.seg),mat,x,yb+h/2,z,o);}
const UP=new THREE.Vector3(0,1,0);
function cylBetween(p1,p2,r,mat,parent,seg){
  const a=new THREE.Vector3(...p1),b=new THREE.Vector3(...p2);const dir=b.clone().sub(a);const L=dir.length();
  const m=add(C(r,r,L,seg||6),mat,0,0,0,{parent,thr:50});m.position.copy(a.clone().add(b).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(UP,dir.normalize());return m;
}
function group(x,y,z,ry){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry||0;scene.add(g);return g;}

/* 부드러운 그림자 / AO */
function gradTex(radial,strong){
  const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');
  const gr=radial?g.createRadialGradient(64,64,0,64,64,64):g.createLinearGradient(0,0,0,128);
  gr.addColorStop(0,`rgba(70,45,30,${strong})`);gr.addColorStop(1,'rgba(70,45,30,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(cv);
}
const blobTex=gradTex(true,0.6),aoTex=gradTex(false,0.6);
function softMat(t,op){return new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:op,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});}
function blob(x,z,rx,rz,op){const m=new THREE.Mesh(new THREE.PlaneGeometry(rx*2,rz*2),softMat(blobTex,op||0.35));m.rotation.x=-PI/2;m.position.set(x,0.045,z);scene.add(m);}
function aoPlane(w,h,rot,pos,op){const geo=new THREE.PlaneGeometry(w,h);rot(geo);const m=new THREE.Mesh(geo,softMat(aoTex,op));m.position.set(...pos);scene.add(m);}
export {B,C,M,PI,R,UP,add,aoPlane,blob,blobTex,boxAt,cylAt,cylBetween,group,lathe,lin,pencil,rawLin,rnd,scene,shade,skyTex,softMat};
