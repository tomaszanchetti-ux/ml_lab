/* ---------- precomputed data (seeded so scrubbing is stable) ---------- */
const nd = z => Math.exp(-z*z/2);
function Phi(z){ const t=1/(1+0.2316419*Math.abs(z)), d=0.3989423*Math.exp(-z*z/2); const p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274)))); return z>0 ? 1-p : p; }
const popDots = (() => { const r=rng(101), a=[]; while(a.length<600){ const x=r()*2-1, y=r()*2-1; if(x*x+y*y<=1) a.push({x,y,v:50+18*gauss(r)}); } return a; })();
const popSamples = (() => { const r=rng(102), out=[]; for(let s=0;s<6;s++){ const idx=new Set(); while(idx.size<40) idx.add(Math.floor(r()*600)); const arr=[...idx]; out.push({idx, mean: arr.reduce((t,i)=>t+popDots[i].v,0)/40}); } return out; })();
const seMeans = (() => { const r=rng(103); return [25,100,400].map(n => { const a=[]; for(let i=0;i<260;i++) a.push(50+18/Math.sqrt(n)*gauss(r)); return {n, a}; }); })();
const skewPop = (() => { const r=rng(104), a=[]; for(let i=0;i<4000;i++) a.push(Math.exp(3+0.9*gauss(r))); return a; })();
const skewMeans = (() => { const r=rng(105), a=[]; for(let i=0;i<500;i++){ let t=0; for(let j=0;j<50;j++) t+=Math.exp(3+0.9*gauss(r)); a.push(t/50); } return a; })();
const skewMu = Math.exp(3+0.405), skewSE = Math.sqrt((Math.exp(0.81)-1)*Math.exp(6+0.81))/Math.sqrt(50);
const darts = (() => { const r=rng(106); const mk=(bx,by,sd)=>{ const a=[]; for(let i=0;i<14;i++) a.push([bx+sd*gauss(r), by+sd*gauss(r)]); return a; }; return [mk(0,0,.09), mk(0,0,.36), mk(.42,-.36,.09), mk(.42,-.36,.33)]; })();
const merchants = (() => { const r=rng(107), a=[]; for(let i=0;i<220;i++){ const skill=10+4*gauss(r); a.push({m1:Math.max(0,skill+4*gauss(r)), m2:Math.max(0,skill+4*gauss(r))}); } const sorted=[...a].sort((p,q)=>q.m1-p.m1); const top=new Set(sorted.slice(0,20)); a.forEach(m=>m.top=top.has(m)); const T=sorted.slice(0,20); return {a, avg1:T.reduce((s,m)=>s+m.m1,0)/20, avg2:T.reduce((s,m)=>s+m.m2,0)/20}; })();
const cis = (() => { for(let seed=200; seed<400; seed++){ const r=rng(seed), a=[]; let miss=0; for(let i=0;i<30;i++){ const m=50+(10/Math.sqrt(40))*gauss(r), h=1.96*10/Math.sqrt(40); const out=(m-h>50)||(m+h<50); if(out) miss++; a.push({m,h,out}); } if(miss===2 && !a[0].out && !a[1].out && !a[2].out) return a; } return []; })();
const peek = (() => { for(let seed=300; seed<3000; seed++){ const r=rng(seed), z=[]; let s=0; for(let d=1; d<=28; d++){ s+=gauss(r); z.push(s/Math.sqrt(d)); } let cross=-1; for(let d=5; d<18; d++){ if(Math.abs(z[d])>2.05){ cross=d; break; } } if(cross>=6 && Math.abs(z[27])<0.9 && Math.max(...z.slice(0,5).map(Math.abs))<1.7) return {z, cross}; } return {z:Array(28).fill(0), cross:10}; })();

/* ---------- scenes ---------- */
const S = [];

S.push({ title:'Statistics — the visual tour', dur:9,
  cap:[[0,'Module two: statistics. From what you observed, back to what is true.'],[5,'Bias, standard errors, confidence intervals, significance, and A B testing.']],
  draw(t){
    txt('MODULE 2', 640, 250, {size:26, color:COL.acc, align:'center', mono:true, alpha:A(t,0)});
    txt('Statistics', 640, 340, {size:96, weight:700, align:'center', alpha:A(t,.3)});
    txt('bias  ·  standard error  ·  confidence intervals  ·  significance  ·  A/B testing', 640, 410, {size:26, color:COL.mut, align:'center', alpha:A(t,1.2)});
    txt('Revolut · Machine Learning 1 (Basics) · 8 October', 640, 470, {size:20, color:COL.faint, align:'center', alpha:A(t,2)});
  }});

S.push({ title:'Population and sample', dur:25,
  cap:[[0,'You never see the whole population. You see a sample.'],[5,'The true average is a parameter: fixed, and unknown.'],[10,'The average of your sample is a statistic: an estimate of it.'],[15,'Take another sample, and you get a slightly different estimate. And another.'],[21,'Statistics is about how far those estimates can be from the truth.']],
  draw(t){
    const cx=320, cy=355, R=205, k = t<15 ? 0 : Math.min(5, 1+Math.floor((t-15)/1.6)), smp=popSamples[k], on=A(t,2.5,1);
    popDots.forEach((d,i)=>{ const inS=smp.idx.has(i) && on>0; dot(cx+d.x*R, cy+d.y*R, inS?6:4, inS?COL.yel:COL.faint, inS?1:lerp(1,.45,on)); });
    txt('population: all customers', cx, 585, {size:19, align:'center', color:COL.mut}); txt('sample: 40 of them', cx, 140, {size:20, align:'center', color:COL.yel, alpha:on});
    const ax=640, aw=540, ay=380, toX = v => ax + clamp((v-40)/20)*aw;
    line(ax,ay,ax+aw,ay,COL.rule); [40,45,50,55,60].forEach(v=>{ line(toX(v),ay,toX(v),ay+8,COL.mut,1,1.5); txt('€'+v, toX(v), ay+30, {size:17, align:'center', color:COL.mut}); });
    txt('average spend', ax+aw, ay+58, {size:17, align:'right', color:COL.mut});
    const a5=A(t,5,1); line(toX(50),ay-210,toX(50),ay,COL.acc,a5,2.5,[6,6]); txt('μ = true average (parameter)', toX(50)+10, ay-206, {size:20, color:COL.acc, alpha:a5}); txt('unknown', toX(50)+10, ay-180, {size:17, color:COL.mut, alpha:a5});
    const a10=A(t,10,1); for(let j=0;j<k;j++) dot(toX(popSamples[j].mean), ay-22, 8, COL.yel, .35);
    dot(toX(smp.mean), ay-22, 11, COL.yel, a10); txt(`x̄ = €${smp.mean.toFixed(1)}  (statistic)`, toX(smp.mean)+ (smp.mean>52?-16:16), ay-58, {size:20, color:COL.yel, align: smp.mean>52?'right':'left', alpha:a10});
    txt('estimate = truth + error', ax, 520, {size:26, mono:true, alpha:A(t,21)});
  }});

S.push({ title:'Standard error — and the √n rule', dur:27,
  cap:[[0,'How far can a sample average be from the truth? Repeat the sample many times, and look at the spread of the averages.'],[7,'With twenty-five customers per sample, the averages scatter widely.'],[12,'With a hundred, the spread halves.'],[16,'With four hundred, it halves again.'],[20,'That spread is the standard error: sigma over the square root of n. Four times the data, half the error.']],
  draw(t){
    const ax=330, aw=820, toX = v => ax + clamp((v-38)/24)*aw;
    seMeans.forEach((g,row)=>{ const st=[7,12,16][row], a=A(t,st,1), base=250+row*120, bins={};
      txt(`n = ${g.n}`, 80, base-28, {size:28, weight:700, alpha:a}); txt(`SE = 18 / √${g.n} = ${(18/Math.sqrt(g.n)).toFixed(1)}`, 80, base+2, {size:19, mono:true, color:COL.mut, alpha:a});
      line(ax,base,ax+aw,base,COL.rule,a);
      const shown=Math.floor(g.a.length*clamp((t-st)/3)); for(let i=0;i<shown;i++){ const b=Math.round((g.a[i]-38)/24*110); bins[b]=(bins[b]||0)+1; if(bins[b]<=22) dot(ax+b/110*aw, base-5-(bins[b]-1)*4.3, 2.6, [COL.red,COL.yel,COL.green][row], a*.9); }
      const se=18/Math.sqrt(g.n); line(toX(50-2*se),base+10,toX(50+2*se),base+10,[COL.red,COL.yel,COL.green][row],a,4); });
    line(toX(50),150,toX(50),500,COL.acc,A(t,2),2,[6,6]); txt('true average', toX(50)+8, 162, {size:17, color:COL.acc, alpha:A(t,2)});
    txt('SE = σ / √n', 80, 560, {size:32, mono:true, weight:700, color:COL.acc, alpha:A(t,20)}); txt('4× the data  →  ½ the error', 420, 560, {size:26, color:COL.mut, alpha:A(t,22)});
  }});

S.push({ title:'Central Limit Theorem', dur:27,
  cap:[[0,'Here is the surprise. Start with data that is nothing like a bell: transaction amounts, heavily skewed.'],[7,'Take a sample of fifty, and compute its average. Repeat.'],[12,'The averages pile up into a bell curve.'],[17,'That is the central limit theorem: averages of large samples are normal, whatever the shape of the data.'],[22,'It is about the average, not the data. And with heavy tails, large enough means thousands.']],
  draw(t){
    const hist = (arr, x0, y0, w, h, lo, hi, nb, col, frac, al) => { const cnt=Array(nb).fill(0), n=Math.floor(arr.length*frac); for(let i=0;i<n;i++){ const b=Math.floor((arr[i]-lo)/(hi-lo)*nb); if(b>=0&&b<nb) cnt[b]++; } const mx=Math.max(...cnt,1), ref=Math.max(mx, arr.length/nb*2.2); cnt.forEach((v,b)=> rect(x0+b*w/nb, y0-v/ref*h, w/nb-1.5, v/ref*h, col, al)); line(x0,y0,x0+w,y0,COL.rule,al); return ref; };
    txt('THE DATA — one transaction', 70, 150, {size:18, mono:true, color:COL.red, alpha:A(t,0)});
    hist(skewPop, 70, 530, 480, 330, 0, 160, 48, COL.red, 1, A(t,0)*.8); txt('amount →', 550, 558, {size:16, align:'right', color:COL.mut});
    txt('skewed: a few huge ones', 300, 300, {size:19, color:COL.mut, alpha:A(t,2)});
    const a=A(t,7,1); txt('AVERAGES — of samples of 50', 670, 150, {size:18, mono:true, color:COL.green, alpha:a});
    const frac=clamp((t-7)/9), lo=skewMu-4*skewSE, hi=skewMu+4*skewSE; const ref=hist(skewMeans, 670, 530, 520, 330, lo, hi, 40, COL.green, frac, a*.8); txt('sample average →', 1190, 558, {size:16, align:'right', color:COL.mut, alpha:a});
    txt(`samples drawn: ${Math.floor(500*frac)}`, 670, 180, {size:18, color:COL.mut, alpha:a});
    const b=A(t,14,1.5); if(b>0){ c.save(); c.globalAlpha=b; c.strokeStyle=COL.yel; c.lineWidth=3; c.beginPath(); const sd=Math.sqrt(skewMeans.reduce((s,x)=>s+(x-skewMu)*(x-skewMu),0)/500); for(let i=0;i<=100;i++){ const v=lo+(hi-lo)*i/100, z=(v-skewMu)/sd, dens=nd(z)/(sd*2.5066), y=530 - (500*((hi-lo)/40)*dens)/ref*330; i?c.lineTo(670+i/100*520,y):c.moveTo(670+i/100*520,y); } c.stroke(); c.restore(); txt('normal', 1040, 250, {size:22, color:COL.yel, weight:600, alpha:b}); }
    arrow(565,340,655,340,COL.mut,a); txt('average', 610, 326, {size:15, align:'center', color:COL.mut, alpha:a});
  }});

S.push({ title:'Bias and variance — two kinds of error', dur:25,
  cap:[[0,'Two kinds of error. Imagine every repeat of your study as a dart.'],[5,'Variance is scatter: random error. More data tightens it.'],[11,'Bias is a systematic miss: the darts cluster in the wrong place.'],[16,'Tight and wrong is the dangerous one. It looks precise.'],[20,'More data never fixes bias. Only better design does.']],
  draw(t){
    const labs=[['low bias · low variance','the goal',0],['low bias · high variance','get more data',5],['high bias · low variance','looks precise — is wrong',11],['high bias · high variance','',13]];
    labs.forEach(([l1,l2,st],i)=>{ const cx=190+i*300, cy=330, R=118, a=A(t,st,1);
      [1,.66,.33].forEach((f,j)=>{ c.save(); c.globalAlpha=a; c.strokeStyle=COL.faint; c.lineWidth=1.5; c.fillStyle = j===2 ? '#22323A' : 'transparent'; c.beginPath(); c.arc(cx,cy,R*f,0,7); c.fill(); c.stroke(); c.restore(); });
      dot(cx,cy,4,COL.ink,a);
      darts[i].forEach(([x,y],j)=> dot(cx+clamp(x,-1.05,1.05)*R, cy+clamp(y,-1.05,1.05)*R, 6, i<2?COL.green:COL.red, a*A(t,st+.3+j*.08,.3)));
      if(i===2 && t>16){ strokeRect(cx-R-16,cy-R-16,2*R+32,2*R+92,COL.yel,A(t,16),3,10); }
      txt(l1, cx, cy+R+36, {size:19, align:'center', weight:600, alpha:a}); txt(l2, cx, cy+R+62, {size:17, align:'center', color: i===2?COL.yel:COL.mut, alpha:a}); });
    txt('error² = bias² + variance', 640, 150, {size:26, mono:true, align:'center', color:COL.acc, alpha:A(t,11)});
    txt('more data shrinks variance — never bias', 640, 580, {size:22, align:'center', color:COL.mut, alpha:A(t,20)});
  }});

S.push({ title:'Biased data — survivorship in credit', dur:27,
  cap:[[0,'Biased data. Ten thousand people apply for credit.'],[4,'Six thousand are approved. For them, you observe what happens: five percent default.'],[10,'Four thousand are rejected. What they would have done, you never see.'],[15,'Train a model on the approved only, and it has learned from the safest customers. That is survivorship bias.'],[21,'Two million approved loans would not fix it. The missing people are still missing.']],
  draw(t){
    rect(70,170,250,330,COL.faint,A(t,0)*.7,8); txt('10,000', 195, 320, {size:44, weight:700, align:'center', alpha:A(t,0)}); txt('applicants', 195, 354, {size:22, align:'center', color:COL.ink, alpha:A(t,0)});
    const a1=A(t,4,1); arrow(326,250,436,220,COL.mut,a1); rect(440,150,300,190,COL.acc,a1*.85,8); txt('6,000 approved', 590, 200, {size:26, weight:700, align:'center', color:COL.bg, alpha:a1});
    rect(460,222,260,44,COL.bg,a1*.35,5); txt('5,700 repaid', 590, 251, {size:20, align:'center', color:COL.bg, weight:600, alpha:a1}); rect(460,276,260,44,COL.red,A(t,6),5); txt('300 defaulted = 5 %', 590, 305, {size:20, align:'center', color:COL.bg, weight:600, alpha:A(t,6)});
    const a2=A(t,10,1); arrow(326,420,436,450,COL.mut,a2); c.save(); c.globalAlpha=a2; c.setLineDash([8,7]); c.strokeStyle=COL.mut; c.lineWidth=2.5; c.beginPath(); c.roundRect(440,370,300,150,8); c.stroke(); c.restore();
    txt('4,000 rejected', 590, 420, {size:26, weight:700, align:'center', color:COL.mut, alpha:a2}); txt('outcome never observed', 590, 456, {size:19, align:'center', color:COL.mut, alpha:a2}); txt('?', 590, 500, {size:34, weight:700, align:'center', color:COL.yel, alpha:a2});
    const a3=A(t,15,1); arrow(746,245,846,245,COL.mut,a3); rect(850,170,360,150,COL.panel,a3,8); strokeRect(850,170,360,150,COL.rule,a3,1.5,8);
    txt('model trained here', 1030, 212, {size:22, weight:600, align:'center', alpha:a3}); txt('"default is about 5 %"', 1030, 250, {size:21, align:'center', color:COL.acc, alpha:a3}); txt('…then applied to everyone', 1030, 288, {size:18, align:'center', color:COL.mut, alpha:A(t,17)});
    txt('more approved loans = smaller variance, same bias', 1030, 420, {size:19, align:'center', color:COL.yel, alpha:A(t,21)}); txt('fix: a small random-approval sample · reject inference', 1030, 452, {size:17, align:'center', color:COL.mut, alpha:A(t,23)});
  }});

S.push({ title:"Simpson's paradox — the mix changes the answer", dur:27,
  cap:[[0,'A new dispute flow, against the old one.'],[3,'On small disputes, the new flow wins: eighty-five against eighty.'],[8,'On large disputes, it wins again: twenty-five against twenty.'],[13,'Overall, it loses badly: thirty-three against sixty.'],[17,"Simpson's paradox. The new flow was handed mostly the hard cases, so the totals compare different mixes."],[23,'The cure is to randomise who gets which flow.']],
  draw(t){
    const G=[['Small disputes',80,85,'800 / 1,000','170 / 200',3],['Large disputes',20,25,'100 / 500','325 / 1,300',8],['Overall',60,33,'900 / 1,500','495 / 1,500',13]], by=480, sc=3.1;
    G.forEach(([lab,o,n,oc,nc,st],i)=>{ const x=110+i*340, a=A(t,st,1), win = n>o;
      rect(x,by-o*sc*a,110,o*sc*a,COL.faint,a); rect(x+125,by-n*sc*a,110,n*sc*a, win?COL.green:COL.red,a);
      txt(o+' %', x+55, by-o*sc-12, {size:24, weight:700, align:'center', alpha:a}); txt(n+' %', x+180, by-n*sc-12, {size:24, weight:700, align:'center', color:win?COL.green:COL.red, alpha:a});
      txt('old', x+55, by+24, {size:17, align:'center', color:COL.mut, alpha:a}); txt('new', x+180, by+24, {size:17, align:'center', color:COL.mut, alpha:a});
      txt(oc, x+55, by+46, {size:14, align:'center', color:COL.faint, alpha:a}); txt(nc, x+180, by+46, {size:14, align:'center', color:COL.faint, alpha:a});
      txt(lab, x+117, by+78, {size:22, weight:600, align:'center', alpha:a}); line(x-10,by,x+245,by,COL.rule,a); });
    const m=A(t,17,1); if(m>0){ rect(790,140,410,96,COL.panel,m,8); strokeRect(790,140,410,96,COL.rule,m,1.5,8); txt('share of LARGE (hard) cases', 810, 168, {size:17, color:COL.mut, alpha:m});
      rect(810,180,370*.33,18,COL.faint,m); txt('old 33 %', 810+370*.33+8, 195, {size:16, color:COL.mut, alpha:m}); rect(810,206,370*.87,18,COL.red,m); txt('new 87 %', 810+370*.87-74, 221, {size:16, color:COL.bg, weight:700, alpha:m}); }
  }});

S.push({ title:'Regression to the mean', dur:25,
  cap:[[0,'Disputes per merchant: last month against this month.'],[5,'Take the worst twenty last month, and send them a warning.'],[10,'This month they improved. Did the warning work?'],[14,'Not necessarily. An extreme month is partly bad luck, and luck does not repeat. They would have drifted back anyway.'],[20,'That is regression to the mean. You need a control group chosen the same way.']],
  draw(t){
    const x0=110, y0=540, w=560, h=400, mx=28, X=v=>x0+clamp(v/mx)*w, Y=v=>y0-clamp(v/mx)*h, hl=A(t,5,1);
    line(x0,y0,x0+w,y0,COL.rule); line(x0,y0,x0,y0-h,COL.rule); line(X(0),Y(0),X(mx),Y(mx),COL.faint,1,1.5,[5,5]); txt('same as last month', X(23), Y(25.5), {size:14, color:COL.faint});
    txt('disputes last month →', x0+w, y0+30, {size:17, align:'right', color:COL.mut}); c.save(); c.translate(x0-34,y0-h); c.rotate(-Math.PI/2); txt('disputes this month →', 0, 0, {size:17, align:'right', color:COL.mut}); c.restore();
    merchants.a.forEach(m=> dot(X(m.m1), Y(m.m2), m.top?6:4, m.top && hl>0 ? COL.red : COL.acc, m.top ? 1 : lerp(.8,.3,hl)));
    const X2=760;
    txt('worst 20 last month', X2, 190, {size:24, weight:600, color:COL.red, alpha:hl});
    txt(`last month:  ${merchants.avg1.toFixed(1)} disputes on average`, X2, 250, {size:22, mono:true, alpha:A(t,6)});
    txt(`this month:  ${merchants.avg2.toFixed(1)}`, X2, 292, {size:22, mono:true, color:COL.green, alpha:A(t,10)});
    txt('the warning worked?', X2, 350, {size:24, color:COL.yel, alpha:A(t,10.5)});
    txt('no warning was sent in this simulation', X2, 392, {size:20, color:COL.mut, alpha:A(t,14)});
    txt('extreme = signal + luck', X2, 444, {size:21, mono:true, color:COL.acc, alpha:A(t,16)}); txt('and luck does not repeat', X2, 472, {size:19, color:COL.mut, alpha:A(t,17)});
    txt('→ always compare with a control group', X2, 524, {size:20, color:COL.mut, alpha:A(t,20)});
    if(t>10){ const a=A(t,10,1); line(X(merchants.avg1),Y(merchants.avg1),X(merchants.avg1),Y(merchants.avg2),COL.yel,a,3); dot(X(merchants.avg1),Y(merchants.avg2),8,COL.yel,a); }
  }});

S.push({ title:'Confidence intervals', dur:29,
  cap:[[0,'A confidence interval is the estimate with its error bars: plus or minus about two standard errors.'],[6,'Each line here is one study. The dot is the estimate; the bar is the ninety-five percent interval.'],[12,'Repeat the study thirty times. Most intervals capture the true value.'],[17,'About one in twenty misses. That is what ninety-five percent means: it describes the procedure.'],[22,'More data makes the bars shorter. But an interval only covers noise. If the sample is biased, it is confidently wrong.']],
  draw(t){
    const ax=420, aw=760, X = v => ax + clamp((v-42)/16)*aw, n = t<6 ? 0 : t<12 ? 3 : Math.min(30, 3+Math.floor((t-12)*6));
    txt('95 % CI = estimate ± 1.96 × SE', 70, 180, {size:25, mono:true, color:COL.acc, alpha:A(t,0)});
    txt('30 % on 400 cases', 70, 250, {size:21, color:COL.mut, alpha:A(t,2)}); txt('→ 30 % ± 4.5 pp', 70, 282, {size:24, mono:true, alpha:A(t,3)});
    txt('on 4,000 cases', 70, 340, {size:21, color:COL.mut, alpha:A(t,22)}); txt('→ 30 % ± 1.4 pp', 70, 372, {size:24, mono:true, alpha:A(t,22.5)});
    txt('covers noise, not bias', 70, 440, {size:21, color:COL.yel, alpha:A(t,25)});
    line(X(50),130,X(50),575,COL.acc,A(t,5),2.5,[6,6]); txt('true value', X(50)+8, 142, {size:17, color:COL.acc, alpha:A(t,5)});
    for(let i=0;i<n;i++){ const ci=cis[i], y=165+i*13.6, col = ci.out ? COL.red : COL.ink, al = ci.out ? 1 : .8; line(X(ci.m-ci.h),y,X(ci.m+ci.h),y,col,al,ci.out?3.5:2.2); dot(X(ci.m),y,ci.out?5:3.6,col,al); }
    const miss = cis.slice(0,n).filter(x=>x.out).length;
    if(n>3){ txt(`studies: ${n}`, 70, 520, {size:21, mono:true}); txt(`missed the truth: ${miss}`, 70, 552, {size:21, mono:true, color: miss?COL.red:COL.mut}); }
  }});

S.push({ title:'The p-value and statistical significance', dur:29,
  cap:[[0,'Is B really better than A, or was it luck? Start by assuming nothing is going on: the null hypothesis.'],[7,'If that were true, the difference you measure would bounce around zero, like this.'],[12,'You observed a difference two point three standard errors away.'],[17,'The p-value is the area out in the tails: how often chance alone would give something this extreme. Here, two percent.'],[24,'Below five percent, we call it statistically significant. It is not the probability that the null is true, and it says nothing about size.']],
  draw(t){
    const mu=640, sg=120, base=520, amp=300, f = x => nd((x-mu)/sg), a=A(t,7,1.2), zo=2.31;
    txt('H₀: no difference between A and B', 70, 160, {size:24, mono:true, color:COL.acc, alpha:A(t,1)});
    const tail = (from,to,col,al) => { c.save(); c.globalAlpha=al; c.fillStyle=col; c.beginPath(); c.moveTo(from,base); for(let x=from;x<=to;x+=2) c.lineTo(x, base-f(x)*amp); c.lineTo(to,base); c.fill(); c.restore(); };
    const p=A(t,17,1); tail(mu+zo*sg, mu+3.7*sg, COL.red, p*.9); tail(mu-3.7*sg, mu-zo*sg, COL.red, p*.9);
    c.save(); c.globalAlpha=a; c.strokeStyle=COL.ink; c.lineWidth=3.5; c.beginPath(); for(let x=mu-3.7*sg;x<=mu+3.7*sg;x+=3){ const y=base-f(x)*amp; x===mu-3.7*sg?c.moveTo(x,y):c.lineTo(x,y);} c.stroke(); c.restore();
    line(mu-3.8*sg,base,mu+3.8*sg,base,COL.rule,a); for(let k=-3;k<=3;k++) txt(String(k).replace('-','−'), mu+k*sg, base+28, {size:18, align:'center', color:COL.mut, alpha:a}); txt('difference, in standard errors (z)', mu, base+56, {size:17, align:'center', color:COL.mut, alpha:a});
    const o=A(t,12,1); line(mu+zo*sg, base, mu+zo*sg, base-230, COL.yel, o, 3); dot(mu+zo*sg, base-230, 7, COL.yel, o); txt('observed: z = 2.31', mu+zo*sg+12, base-234, {size:21, color:COL.yel, weight:600, alpha:o});
    txt('p = 0.021', mu+zo*sg+12, base-70, {size:30, mono:true, weight:700, color:COL.red, alpha:p}); txt('(both tails)', mu+zo*sg+12, base-44, {size:16, color:COL.mut, alpha:p});
    const s=A(t,24,1); line(mu+1.96*sg,base,mu+1.96*sg,base-120,COL.green,s,2,[5,5]); line(mu-1.96*sg,base,mu-1.96*sg,base-120,COL.green,s,2,[5,5]); txt('±1.96 → α = 5 %', mu-1.96*sg-10, base-126, {size:18, align:'right', color:COL.green, alpha:s});
    txt('p = P(data this extreme | no effect)', 70, 200, {size:21, mono:true, color:COL.mut, alpha:A(t,18)}); txt('≠ P(no effect | data)', 70, 232, {size:21, mono:true, color:COL.red, alpha:A(t,25)});
  }});

S.push({ title:'Two errors — and power', dur:29,
  cap:[[0,'A test is a detector, and it can be wrong in two ways.'],[4,'Grey: the world with no effect. The red tail is a false positive, a type one error. We fix it at five percent.'],[11,'Blue: the world where the effect is real. The yellow part falls short of the threshold: a false negative, a type two error.'],[18,'The green part is power: the chance of detecting a real effect. Add more users, and the two worlds pull apart.'],[24,'Power goes up. An under-powered test that finds nothing has shown nothing.']],
  draw(t){
    const x0=180, sg=96, base=500, amp=270, m = 2.0 + 1.7*ease(clamp((t-20)/5)), thr=1.96, X = z => x0+ (z+3)*sg;
    const curve = (mean,col,al,lw=3.5) => { c.save(); c.globalAlpha=al; c.strokeStyle=col; c.lineWidth=lw; c.beginPath(); for(let z=mean-3.4; z<=mean+3.4; z+=.04){ const x=X(z), y=base-nd(z-mean)*amp; z===mean-3.4?c.moveTo(x,y):c.lineTo(x,y);} c.stroke(); c.restore(); };
    const area = (mean,from,to,col,al) => { c.save(); c.globalAlpha=al; c.fillStyle=col; c.beginPath(); c.moveTo(X(from),base); for(let z=from; z<=to; z+=.04) c.lineTo(X(z), base-nd(z-mean)*amp); c.lineTo(X(to),base); c.fill(); c.restore(); };
    const a0=A(t,4,1), a1=A(t,11,1), a2=A(t,18,1);
    area(0,thr,3.4,COL.red,a0*.85); area(m,m-3.4,thr,COL.yel,a1*.55); area(m,thr,m+3.4,COL.green,a2*.5);
    curve(0,COL.mut,a0); curve(m,COL.acc,a1);
    line(X(-3.3),base,X(7),base,COL.rule); line(X(thr),base+8,X(thr),base-300,COL.ink,a0,2,[6,5]); txt('threshold', X(thr), base-308, {size:17, align:'center', alpha:a0});
    txt('no effect', X(0), base-290, {size:20, align:'center', color:COL.mut, alpha:a0}); txt('real effect', X(m), base-290, {size:20, align:'center', color:COL.acc, alpha:a1});
    txt('α = 5 %', X(2.45), base-34, {size:17, color:COL.red, weight:700, alpha:a0}); txt('Type I: false positive', X(2.2), base+34, {size:17, color:COL.red, alpha:a0});
    txt('β', X(Math.min(thr-.45, m-1)), base-60, {size:26, color:COL.yel, weight:700, alpha:a1}); txt('Type II: false negative', X(.2), base+62, {size:17, color:COL.yel, alpha:a1});
    const pw=1-Phi(thr-m); txt(`power = ${(pw*100).toFixed(0)} %`, 70, 170, {size:36, mono:true, weight:700, color:COL.green, alpha:a2}); txt('P(detect | real effect) · target 80 %', 70, 202, {size:17, color:COL.mut, alpha:a2});
    txt('more users → smaller SE → the two worlds separate', 70, 232, {size:17, color:COL.acc, alpha:A(t,21)});
  }});

S.push({ title:'An A/B test, by hand', dur:29,
  cap:[[0,'A real one. Ten thousand customers in each group.'],[4,'A converts at ten percent. B at eleven.'],[8,'The difference is one point. Its standard error is zero point four three.'],[13,'One divided by zero point four three: z equals two point three. Beyond one point nine six, so significant, with a p-value of two percent.'],[20,'But say it like this: B is better by somewhere between zero point one five and one point eight five points. The size, with its range.']],
  draw(t){
    const by=520, Y = v => by - (v-8)/4*340, a=A(t,4,1);
    line(110,by,470,by,COL.rule); [8,9,10,11,12].forEach(v=>{ line(104,Y(v),470,Y(v),COL.rule,.5,1); txt(v+' %', 96, Y(v)+6, {size:16, align:'right', color:COL.mut}); });
    rect(160,Y(10),110,by-Y(10),COL.faint,a); rect(320,Y(11),110,by-Y(11),COL.green,a*.9);
    [[215,10,.59],[375,11,.61]].forEach(([x,v,h])=>{ line(x,Y(v-h),x,Y(v+h),COL.ink,a,3); line(x-10,Y(v-h),x+10,Y(v-h),COL.ink,a,3); line(x-10,Y(v+h),x+10,Y(v+h),COL.ink,a,3); });
    txt('A', 215, by+30, {size:24, weight:700, align:'center'}); txt('B', 375, by+30, {size:24, weight:700, align:'center'}); txt('1,000 / 10,000', 215, by+54, {size:15, align:'center', color:COL.mut, alpha:a}); txt('1,100 / 10,000', 375, by+54, {size:15, align:'center', color:COL.mut, alpha:a});
    txt('10.0 %', 215, Y(10.75), {size:22, weight:700, align:'center', alpha:a}); txt('11.0 %', 375, Y(11.78), {size:22, weight:700, align:'center', color:COL.green, alpha:a});
    txt('(axis starts at 8 %)', 110, 160, {size:14, color:COL.faint});
    const X=560;
    txt('difference', X, 190, {size:22, color:COL.mut, alpha:A(t,8)}); txt('= 1.0 pp', X+250, 190, {size:26, mono:true, alpha:A(t,8)});
    txt('standard error', X, 240, {size:22, color:COL.mut, alpha:A(t,9.5)}); txt('= 0.434 pp', X+250, 240, {size:26, mono:true, alpha:A(t,9.5)}); txt('√( p(1−p) · (1/n + 1/n) ),  p = 0.105', X, 270, {size:16, mono:true, color:COL.faint, alpha:A(t,10)});
    txt('z = 1.0 / 0.434', X, 330, {size:22, color:COL.mut, alpha:A(t,13)}); txt('= 2.31', X+250, 330, {size:30, mono:true, weight:700, color:COL.yel, alpha:A(t,13.5)});
    txt('p-value', X, 380, {size:22, color:COL.mut, alpha:A(t,15)}); txt('= 0.021  → significant', X+250, 380, {size:24, mono:true, color:COL.green, alpha:A(t,15.5)});
    const g=A(t,20,1); rect(X-14,420,620,96,COL.panel,g,8); strokeRect(X-14,420,620,96,COL.acc,g,2,8); txt('95 % CI of the lift', X+6, 456, {size:20, color:COL.mut, alpha:g}); txt('[ +0.15 pp ,  +1.85 pp ]', X+6, 496, {size:30, mono:true, weight:700, color:COL.acc, alpha:g});
  }});

S.push({ title:'Sample size — how many users?', dur:25,
  cap:[[0,'How many users do you need? It depends on the smallest lift worth detecting.'],[5,'Rule of thumb: sixteen times the variance, divided by the effect squared. Per group.'],[11,'Baseline ten percent, looking for one point: about fourteen thousand per group.'],[16,'Looking for half a point: four times as many. Fifty-eight thousand.'],[20,'Halve the effect, quadruple the cost. This is why you size the test before you run it.']],
  draw(t){
    const x0=120, y0=530, w=640, h=380, N = d => 16*0.09/((d/100)*(d/100)), X = d => x0 + (d-0.3)/(2.2-0.3)*w, Y = n => y0 - clamp(n/80000)*h, a=A(t,0,1.5);
    line(x0,y0,x0+w,y0,COL.rule); line(x0,y0,x0,y0-h,COL.rule); [0.5,1,1.5,2].forEach(d=>{ line(X(d),y0,X(d),y0+8,COL.mut,1,1.5); txt(d+' pp', X(d), y0+30, {size:17, align:'center', color:COL.mut}); }); [20000,40000,60000,80000].forEach(n=>{ line(x0-6,Y(n),x0+w,Y(n),COL.rule,.5,1); txt(fmt(n), x0-12, Y(n)+6, {size:15, align:'right', color:COL.mut}); });
    txt('smallest lift you want to detect →', x0+w, y0+58, {size:17, align:'right', color:COL.mut}); txt('users per group', x0, y0-h-14, {size:17, color:COL.mut});
    c.save(); c.globalAlpha=1; c.strokeStyle=COL.acc; c.lineWidth=3.5; c.beginPath(); let first=true; for(let d=2.2; d>=2.2-(2.2-0.42)*a; d-=.01){ const x=X(d), y=Y(N(d)); first?c.moveTo(x,y):c.lineTo(x,y); first=false; } c.stroke(); c.restore();
    [[2,COL.mut,11],[1,COL.green,11],[0.5,COL.red,16]].forEach(([d,col,st])=>{ const al=A(t,st,1); dot(X(d),Y(N(d)),8,col,al); line(X(d),Y(N(d)),X(d),y0,col,al*.6,1.5,[4,4]); txt(fmt(Math.round(N(d))), X(d)+14, Y(N(d))-8, {size:21, mono:true, weight:700, color:col, alpha:al}); });
    const X2=830;
    txt('n ≈ 16 · σ² / δ²', X2, 200, {size:34, mono:true, weight:700, color:COL.acc, alpha:A(t,5)}); txt('per group · α = 5 % · power = 80 %', X2, 236, {size:17, color:COL.mut, alpha:A(t,6)});
    txt('rate:  σ² = p(1 − p)', X2, 290, {size:21, mono:true, color:COL.mut, alpha:A(t,7)}); txt('p = 10 %  →  σ² = 0.09', X2, 322, {size:21, mono:true, color:COL.mut, alpha:A(t,11)});
    txt('½ the effect', X2, 410, {size:28, color:COL.yel, weight:600, alpha:A(t,20)}); txt('→ 4× the users', X2, 448, {size:28, color:COL.yel, weight:600, alpha:A(t,20.5)});
  }});

S.push({ title:'Peeking — how to fool yourself', dur:27,
  cap:[[0,'The classic mistake: peeking. This is an A A test. Both groups get exactly the same thing.'],[7,'Watch the test statistic day by day. It wanders.'],[12,'On some day it crosses the line. Stop there, and you ship a difference that does not exist.'],[18,'Check every day and stop at the first significant result, and your false positive rate is not five percent. It is closer to thirty.'],[24,'Fix the sample size in advance, and read the result once.']],
  draw(t){
    const x0=110, w=760, ym=345, sc=62, X = d => x0 + d/27*w, Y = z => ym - z*sc, n = Math.max(1, Math.min(28, Math.floor(1+27*clamp((t-7)/9))));
    txt('A/A test — there is NO real difference', x0, 150, {size:22, color:COL.yel, weight:600, alpha:A(t,1)});
    line(x0,ym,x0+w,ym,COL.rule); [1.96,-1.96].forEach(v=>{ line(x0,Y(v),x0+w,Y(v),COL.red,.8,2,[7,6]); }); txt('"significant"', x0+w+10, Y(1.96)+6, {size:16, color:COL.red}); txt('"significant"', x0+w+10, Y(-1.96)+6, {size:16, color:COL.red}); txt('z = 0', x0-10, ym+6, {size:16, align:'right', color:COL.mut});
    txt('day 1', x0, 560, {size:16, color:COL.mut}); txt('day 28 (planned end)', x0+w, 560, {size:16, align:'right', color:COL.mut});
    c.save(); c.strokeStyle=COL.acc; c.lineWidth=3; c.beginPath(); for(let d=0; d<n; d++){ d?c.lineTo(X(d),Y(peek.z[d])):c.moveTo(X(d),Y(peek.z[d])); } c.stroke(); c.restore();
    for(let d=0; d<n; d++) dot(X(d),Y(peek.z[d]),4, Math.abs(peek.z[d])>1.96?COL.red:COL.acc);
    if(n>peek.cross && t>12){ const a=A(t,12,1), d=peek.cross; c.save(); c.globalAlpha=a; c.strokeStyle=COL.red; c.lineWidth=3; c.beginPath(); c.arc(X(d),Y(peek.z[d]),16,0,7); c.stroke(); c.restore(); txt(`day ${d+1}: "ship it!"`, X(d)+24, Y(peek.z[d]) + (peek.z[d]>0?-14:28), {size:20, color:COL.red, weight:700, alpha:a}); }
    if(n>=28){ txt(`day 28: z = ${peek.z[27].toFixed(2)} — nothing`, X(27)-8, Y(peek.z[27])-18, {size:17, align:'right', color:COL.green}); }
    const X2=920;
    txt('one look at the end', X2, 250, {size:19, color:COL.mut, alpha:A(t,18)}); txt('5 %', X2, 292, {size:40, mono:true, weight:700, color:COL.green, alpha:A(t,18)});
    txt('a look every day', X2, 360, {size:19, color:COL.mut, alpha:A(t,19.5)}); txt('≈ 30 %', X2, 402, {size:40, mono:true, weight:700, color:COL.red, alpha:A(t,19.5)}); txt('false positives', X2, 432, {size:17, color:COL.mut, alpha:A(t,19.5)});
  }});

S.push({ title:'A/B testing — the checklist', dur:27,
  cap:[[0,'Putting it together. One hypothesis, one primary metric, and guardrails that must not get worse.'],[6,'Randomise by customer. Compute the sample size. Run whole weeks.'],[11,'Do not peek. Check that the split really is fifty fifty: a sample ratio mismatch means something is broken.'],[17,'Watch for novelty effects, for too many metrics, and for a few whales driving a revenue number.'],[22,'Then report the effect size with its interval, and decide.']],
  draw(t){
    const steps=[['1','Hypothesis — one change, one direction',0],['2','Primary metric + guardrails',1.5],['3','Randomise by customer',6],['4','Sample size:  n ≈ 16 σ² / δ²',7.5],['5','Duration: whole weeks, fixed in advance',9],['6','Run — check health, not significance',11],['7','Effect size + CI  →  ship / iterate / kill',22]];
    steps.forEach(([n,s,st],i)=>{ const a=A(t,st,.8), y=168+i*58; dot(96,y-8,17,COL.acc,a); txt(n, 96, y-1, {size:19, weight:700, align:'center', color:COL.bg, alpha:a}); txt(s, 130, y, {size:23, alpha:a}); });
    txt('PITFALLS', 800, 160, {size:17, mono:true, color:COL.red, alpha:A(t,11)});
    [['peeking / stopping early',11],['sample ratio mismatch (SRM)',13],['novelty effect',17],['many metrics or segments',18.5],['skewed metrics — whales',20],['interference between users',21],['opt-in = selection bias',21.5]].forEach(([s,st],i)=>{ const a=A(t,st,.8), y=180+i*52; rect(800,y,380,40,COL.panel,a,6); strokeRect(800,y,380,40,COL.red,a*.7,1.5,6); txt(s, 818, y+27, {size:19, alpha:a}); });
  }});

S.push({ title:'Six sentences to keep', dur:20,
  cap:[[0,'Six sentences to keep.'],[2,'Every number from a sample is an estimate with an error.'],[6,'More data fixes noise, never bias. Bias is fixed by design: randomise.'],[11,'A p-value is how surprising the data would be if nothing were going on. It is not the size of the effect.'],[16,'Size the test first, do not peek, and report the lift with its interval.']],
  draw(t){
    const L=['Sample → estimate → error. Statistics measures the error.','Bias is systematic, variance is noise. More data only fixes variance.','Standard error = σ / √n. Four times the data, half the error.','95 % CI = estimate ± 2 SE. It covers noise, not bias.','p-value = P(data this extreme | no effect). Significant ≠ important.','A/B: one metric · randomise · n ≈ 16σ²/δ² · no peeking · effect size with CI'];
    L.forEach((s,i)=>{ const a=A(t,1+i*2.2,.8); dot(96, 178+i*66, 7, COL.acc, a); wrap(s, 126, 187+i*66, 1060, 30, {size:26, alpha:a}); });
  }});

