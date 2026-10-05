/* ---------- precomputed data (seeded so scrubbing is stable) ---------- */
const nd = z => Math.exp(-z*z/2);
// one lending story: a loan earns €80 if repaid and loses €600 if it defaults → approve when p < 80/680
const GAIN=80, LOSS=600, PSTAR=GAIN/(GAIN+LOSS);
const custP = (() => { const r=rng(801), a=[]; for(let i=0;i<5000;i++) a.push(clamp(Math.exp(-3.55+1.0*gauss(r)),0.002,0.9)); return a.sort((x,y)=>x-y); })();
const profitCurve = (() => { const out=[]; let cum=0, j=0; for(let i=0;i<=200;i++){ const th=i/200*0.4; while(j<custP.length && custP[j]<th){ cum += (1-custP[j])*GAIN - custP[j]*LOSS; j++; } out.push({th, v:cum, n:j}); } return out; })();
const approveAll = custP.reduce((s,p)=>s+(1-p)*GAIN-p*LOSS,0), best = profitCurve.reduce((b,x)=>x.v>b.v?x:b, profitCurve[0]);
const apAll = custP.filter(p=>p<PSTAR), approved = Array.from({length:1000},(_,i)=>apAll[Math.floor(i*apAll.length/1000)]), expDef = approved.reduce((s,p)=>s+p,0), sdDef = Math.sqrt(approved.reduce((s,p)=>s+p*(1-p),0));
const showCust = (() => { const r=rng(802), a=[]; for(let i=0;i<14;i++) a.push(custP[Math.floor((0.03+0.94*Math.pow(r(),0.55))*4999)]); return a; })();
const calib = (() => { const r=rng(803); return [0.02,0.05,0.09,0.14,0.2,0.28,0.37].map((p,i)=>{ const n=[5200,2600,1100,520,260,130,70][i], se=Math.sqrt(p*(1-p)/n); return {p, obs:clamp(p+se*gauss(r)*0.9,0,1), se}; }); })();
const lossCurve = Array.from({length:60},(_,i)=>({tr:0.28*Math.exp(-i/14)+0.11-0.0006*i, va:0.28*Math.exp(-i/14)+0.135+0.00006*Math.pow(Math.max(0,i-22),2)}));

/* ---------- scenes ---------- */
const S = [];
const card=(x,y,w,h,col,al=1)=>{ rect(x,y,w,h,COL.panel,al,10); strokeRect(x,y,w,h,col,al,2.5,10); };

S.push({ title:'The whole picture', dur:10,
  cap:[[0,'Four modules, one story. How probability and statistics turn data into a business decision.'],[6,'We follow a single case from start to finish: who should get a loan.']],
  draw(t){
    txt('WRAP-UP', 640, 240, {size:26, color:COL.acc, align:'center', mono:true, alpha:A(t,0)});
    txt('The whole picture', 640, 330, {size:88, weight:700, align:'center', alpha:A(t,.3)});
    txt('probability  →  statistics  →  model  →  decision', 640, 400, {size:28, color:COL.mut, align:'center', alpha:A(t,1.2)});
    txt('one Revolut case, end to end', 640, 460, {size:22, color:COL.faint, align:'center', alpha:A(t,2)});
  }});

S.push({ title:'Two directions — probability and statistics', dur:30,
  cap:[[0,'Start with the two words. They are the same road, travelled in opposite directions.'],[5,'Probability goes forward. If the true default rate is five percent, what will I see in a thousand loans? About fifty, give or take seven.'],[14,'Statistics goes backward. I saw fifty-three defaults in a thousand loans. What is the true rate, and how sure am I?'],[22,'Machine learning needs both. A model speaks probability. It is built, and checked, with statistics.']],
  draw(t){
    card(90,200,360,190,COL.acc,A(t,0)); txt('THE WORLD', 270, 250, {size:26, weight:700, align:'center', color:COL.acc, alpha:A(t,0)}); txt('the truth — never seen', 270, 284, {size:18, align:'center', color:COL.mut, alpha:A(t,0)}); txt('true default rate = 5 %', 270, 340, {size:22, mono:true, align:'center', alpha:A(t,5)});
    card(830,200,360,190,COL.green,A(t,0)); txt('THE DATA', 1010, 250, {size:26, weight:700, align:'center', color:COL.green, alpha:A(t,0)}); txt('a sample — what you observe', 1010, 284, {size:18, align:'center', color:COL.mut, alpha:A(t,0)}); txt('53 defaults in 1,000 loans', 1010, 340, {size:22, mono:true, align:'center', alpha:A(t,14)});
    const p=A(t,5,1); arrow(460,245,820,245,COL.yel,p,4); txt('PROBABILITY', 640, 226, {size:24, weight:700, align:'center', color:COL.yel, alpha:p}); txt('"given the truth, what will I see?"', 640, 276, {size:18, align:'center', color:COL.mut, alpha:p}); txt('≈ 50 ± 7 defaults', 640, 302, {size:19, mono:true, align:'center', color:COL.yel, alpha:A(t,9)});
    const s=A(t,14,1); arrow(820,355,460,355,COL.red,s,4); txt('STATISTICS', 640, 388, {size:24, weight:700, align:'center', color:COL.red, alpha:s}); txt('"given what I saw, what is true — and how sure?"', 640, 416, {size:18, align:'center', color:COL.mut, alpha:s}); txt('5.3 % ± 1.4 pp', 640, 444, {size:19, mono:true, align:'center', color:COL.red, alpha:A(t,18)});
    const m=A(t,22,1); card(330,476,620,104,COL.ink,m); txt('THE MODEL', 640, 514, {size:24, weight:700, align:'center', alpha:m}); txt('speaks probability   ·   is built and checked with statistics', 640, 552, {size:20, align:'center', color:COL.mut, alpha:A(t,24)});
  }});

S.push({ title:'Start from the decision, not the model', dur:28,
  cap:[[0,'The business question comes first. Should we give this customer a loan?'],[5,'If they repay, we earn eighty euros. If they default, we lose six hundred.'],[11,'So the loan is worth making only when the chance of default is low enough. Work it out, and the line is about twelve percent.'],[20,'That tells us exactly what we need from machine learning: a trustworthy probability of default, for each customer.']],
  draw(t){
    card(90,260,230,90,COL.acc,A(t,0)); txt('approve?', 205, 314, {size:28, weight:700, align:'center', alpha:A(t,0)});
    const a=A(t,5,1); arrow(326,290,500,220,COL.green,a,3); arrow(326,320,500,400,COL.red,a,3);
    card(506,176,330,84,COL.green,a); txt('repays', 530, 212, {size:22, color:COL.green, alpha:a}); txt('+€80', 720, 232, {size:34, mono:true, weight:700, color:COL.green, alpha:a}); txt('probability 1 − p', 530, 242, {size:16, color:COL.mut, alpha:a});
    card(506,362,330,84,COL.red,a); txt('defaults', 530, 398, {size:22, color:COL.red, alpha:a}); txt('−€600', 700, 418, {size:34, mono:true, weight:700, color:COL.red, alpha:a}); txt('probability p', 530, 428, {size:16, color:COL.mut, alpha:a});
    const X=890, b=A(t,11,1);
    txt('expected profit', X, 190, {size:19, color:COL.mut, alpha:b}); txt('(1 − p) · 80  −  p · 600', X, 226, {size:24, mono:true, alpha:b});
    txt('positive when', X, 286, {size:19, color:COL.mut, alpha:A(t,14)}); txt('p < 80 / 680', X, 322, {size:24, mono:true, alpha:A(t,14)}); txt('= 11.8 %', X, 374, {size:44, mono:true, weight:700, color:COL.yel, alpha:A(t,16)});
    const g=A(t,20,1); card(90,486,1100,84,COL.yel,g); txt('what we need from ML:   P(default | this customer)   — and it has to be honest', 640, 538, {size:24, align:'center', alpha:g});
  }});

S.push({ title:'The data is a sample — module 2 comes first', dur:30,
  cap:[[0,'Before any model, look at the data. History is a sample of the world, not the world.'],[6,'First question: is it a fair sample? We only know the outcome for people we approved. The rejected ones are missing. That is bias, and more data will not fix it.'],[16,'Second: every number carries noise. The default rate is five percent, plus or minus a little.'],[22,'Third: hold data back, split by time. Train on the past, and judge on the most recent months.']],
  draw(t){
    rect(90,170,330,300,COL.acc,A(t,0)*.8,10); txt('200,000', 255, 300, {size:46, weight:700, align:'center', color:COL.bg, alpha:A(t,0)}); txt('past loans', 255, 336, {size:22, align:'center', color:COL.bg, alpha:A(t,0)}); txt('a sample of the world', 255, 500, {size:18, align:'center', color:COL.mut, alpha:A(t,0)});
    const X=480;
    const row=(y,n,q,ans,col,st)=>{ const a=A(t,st,1); dot(X+20,y-8,19,col,a); txt(n, X+20, y, {size:21, weight:700, align:'center', color:COL.bg, alpha:a}); txt(q, X+56, y-12, {size:23, weight:700, alpha:a}); txt(ans, X+56, y+18, {size:18, color:COL.mut, alpha:A(t,st+1.5)}); };
    row(210,'1','Is it a fair sample?  → BIAS','only approved customers have an outcome: survivorship. Fixed by design, not volume.',COL.red,6);
    row(320,'2','How noisy is each number?  → VARIANCE','default rate 5.0 % ± 0.1 pp   (standard error = σ / √n)',COL.yel,16);
    row(430,'3','Am I keeping myself honest?  → VALIDATION','split by time and by customer; leakage check',COL.green,22);
    const s=A(t,22,1); ['train','train','train','train','validate','TEST'].forEach((m,i)=>{ rect(X+56+i*110, 480, 104, 40, i<4?COL.acc:i===4?COL.yel:COL.green, s, 5); txt(m, X+56+i*110+52, 506, {size:17, weight:700, align:'center', color:COL.bg, alpha:s}); }); arrow(X+56,540,X+720,540,COL.faint,s,1.5); txt('time', X+730, 546, {size:15, color:COL.faint, alpha:s});
  }});

S.push({ title:'Choose the model by the data and the outcome', dur:27,
  cap:[[0,'Now, which model? You said it well: it depends on the data, and on the outcome you need.'],[6,'The outcome is yes or no, so this is classification. The data is a table, so trees or linear models.'],[13,'It is a credit decision, so every answer must be explainable. Start with logistic regression.'],[19,'Then try gradient boosting as the challenger. Keep it only if it wins by enough to pay for its complexity.']],
  draw(t){
    [['the outcome','yes / no  →  classification',COL.acc,6],['the data','a table of customers  →  linear models or trees',COL.green,8.5],['the constraint','a regulated decision  →  must be explainable',COL.yel,13]].forEach(([k,v,col,st],i)=>{ const a=A(t,st,1), y=180+i*92; card(90,y,640,74,col,a); txt(k, 114, y+30, {size:17, mono:true, color:col, alpha:a}); txt(v, 114, y+58, {size:23, alpha:a}); });
    const b=A(t,13,1); arrow(740,300,820,300,COL.mut,b,3);
    card(830,180,360,110,COL.acc,b); txt('1 · logistic regression', 850, 222, {size:24, weight:700, color:COL.acc, alpha:b}); txt('baseline · explainable · calibrated', 850, 256, {size:17, color:COL.mut, alpha:b});
    const g=A(t,19,1); card(830,318,360,110,COL.yel,g); txt('2 · gradient boosting', 850, 360, {size:24, weight:700, color:COL.yel, alpha:g}); txt('challenger · usually more accurate', 850, 394, {size:17, color:COL.mut, alpha:g});
    txt('same machinery underneath: a function with weights, trained by minimising a loss', 640, 510, {size:20, align:'center', color:COL.mut, alpha:A(t,21)}); txt('complexity has to pay for itself', 640, 552, {size:24, align:'center', color:COL.yel, weight:600, alpha:A(t,22.5)});
  }});

S.push({ title:'A model is a probability machine', dur:32,
  cap:[[0,'What does the model actually produce? One number per customer: the probability of default, given what we know about them.'],[8,'Each customer is a weighted coin. Below twelve percent, we approve. Above, we decline.'],[15,'And probabilities add up. Take a thousand approved customers. Sum their probabilities, and that is how many defaults to expect.'],[24,'This is module one at work: Bernoulli for each customer, the binomial for the portfolio, expected value for the money.']],
  draw(t){
    txt('features  →  model  →  P(default | customer)', 640, 150, {size:24, mono:true, align:'center', color:COL.acc, alpha:A(t,0)});
    showCust.forEach((p,i)=>{ const x=110+i*80, a=A(t,1+i*.25,.6), ok=p<PSTAR, dec=A(t,8,1); dot(x,250,26, dec>0 ? (ok?COL.green:COL.red) : COL.faint, a*(dec>0?.9:1)); txt((p*100).toFixed(p<.1?1:0)+'%', x, 257, {size:16, weight:700, align:'center', color:COL.bg, alpha:a}); txt(ok?'approve':'decline', x, 304, {size:14, align:'center', color:ok?COL.green:COL.red, alpha:dec}); });
    const th=A(t,8,1); txt('threshold: 11.8 %', 640, 350, {size:21, align:'center', color:COL.yel, alpha:th});
    const s=A(t,15,1), x0=140, w=1000, y=490, X = v => x0 + clamp((v-10)/(80-10))*w;
    txt('1,000 approved customers', x0, 392, {size:20, color:COL.mut, alpha:s}); txt(`expected defaults = Σ p = ${expDef.toFixed(0)}`, x0+560, 392, {size:22, mono:true, color:COL.acc, alpha:s});
    line(x0,y,x0+w,y,COL.rule,s); [10,20,30,40,50,60,70,80].forEach(v=>{ line(X(v),y,X(v),y+7,COL.mut,s,1.5); txt(String(v), X(v), y+28, {size:15, align:'center', color:COL.mut, alpha:s}); });
    c.save(); c.globalAlpha=s*.45; c.fillStyle=COL.acc; c.beginPath(); c.moveTo(X(expDef-3.2*sdDef),y); for(let v=expDef-3.2*sdDef; v<=expDef+3.2*sdDef; v+=.3) c.lineTo(X(v), y-nd((v-expDef)/sdDef)*70); c.lineTo(X(expDef+3.2*sdDef),y); c.fill(); c.restore();
    line(X(expDef),y,X(expDef),y-78,COL.acc,s,2.5); txt(`± ${sdDef.toFixed(0)}  (binomial spread)`, X(expDef+2.6*sdDef), y-26, {size:17, color:COL.mut, alpha:A(t,18)});
    txt('defaults among 1,000 →', x0+w, y+54, {size:15, align:'right', color:COL.mut, alpha:s});
    txt('Bernoulli → each customer   ·   Binomial → the portfolio   ·   Expected value → the money', 640, 584, {size:19, align:'center', color:COL.yel, alpha:A(t,24)});
  }});

S.push({ title:'Training is statistics', dur:30,
  cap:[[0,'Where do those probabilities come from? From training. And training is statistics: estimating the weights from a sample.'],[8,'The rule is maximum likelihood. Choose the weights under which what actually happened was most probable. In practice, minimise the log loss.'],[17,'But the training data is one sample, with its own noise. Push too hard, and the model learns the noise.'],[23,'Training error keeps falling; error on held-out data turns back up. That is overfitting: variance. You stop there, or you regularise.']],
  draw(t){
    const X=90; txt('sample of history  →  estimate the weights', X, 170, {size:23, mono:true, color:COL.acc, alpha:A(t,0)});
    const k=ease(clamp((t-8)/7)), a=A(t,8,1);
    txt('how probable was what actually happened?', X, 230, {size:19, color:COL.mut, alpha:a}); rect(X,246,420,22,COL.panel,a,5); rect(X,246,420*lerp(.12,.86,k),22,COL.green,a,5); txt('likelihood', X+432, 264, {size:17, color:COL.green, alpha:a});
    txt('log loss', X, 316, {size:19, color:COL.mut, alpha:a}); rect(X,330,420,22,COL.panel,a,5); rect(X,330,420*lerp(.9,.25,k),22,COL.red,a,5); txt(lerp(.69,.19,k).toFixed(2), X+432, 348, {size:19, mono:true, color:COL.red, alpha:a});
    txt('maximum likelihood  =  minimise log loss', X, 410, {size:22, mono:true, color:COL.yel, alpha:A(t,12)}); txt('(gradient descent does the walking)', X, 440, {size:17, color:COL.mut, alpha:A(t,13)});
    const b=A(t,17,1), x0=660, y0=500, w=520, h=300; strokeRect(x0,y0-h,w,h,COL.rule,b,1.5,6); txt('error', x0+8, y0-h+22, {size:15, color:COL.mut, alpha:b}); txt('training rounds →', x0+w, y0+24, {size:15, align:'right', color:COL.mut, alpha:b});
    const upto=Math.floor(59*clamp((t-17)/7)), Y = v => y0 - (v-0.05)/0.4*h;
    [['tr',COL.acc],['va',COL.red]].forEach(([key,col])=>{ c.save(); c.globalAlpha=b; c.strokeStyle=col; c.lineWidth=3.5; c.beginPath(); for(let i=0;i<=upto;i++){ const px=x0+i/59*w, py=Y(lossCurve[i][key]); i?c.lineTo(px,py):c.moveTo(px,py);} c.stroke(); c.restore(); });
    txt('training', x0+w-80, Y(lossCurve[50].tr)+26, {size:16, color:COL.acc, alpha:A(t,20)}); txt('held-out data', x0+w-150, Y(lossCurve[55].va)-14, {size:16, color:COL.red, alpha:A(t,23)});
    let bi=0; lossCurve.forEach((l,i)=>{ if(l.va<lossCurve[bi].va) bi=i; }); const s=A(t,24,1); line(x0+bi/59*w,y0,x0+bi/59*w,y0-h,COL.green,s,2.5,[6,5]); txt('stop here', x0+bi/59*w+8, y0-h+46, {size:17, color:COL.green, weight:700, alpha:s});
    txt('bias ← too simple          too flexible → variance', x0+w/2, y0+56, {size:17, align:'center', color:COL.mut, alpha:A(t,25)});
  }});

S.push({ title:'Is the model right? Three statistical checks', dur:32,
  cap:[[0,'Now your question: how do we know the probabilities are right? We test them on data the model has never seen. Three checks.'],[8,'One: does it rank well? Do defaulters get higher scores than good customers? That is the A U C.'],[14,'Two: are the numbers honest? Among customers scored at twenty percent, do about twenty percent default? That is calibration, and for pricing it matters most.'],[23,'Three: does it beat what we had? And remember, the test set is a sample too, so every one of these numbers has error bars.']],
  draw(t){
    const pan=(x,ttl,sub,col,st)=>{ const a=A(t,st,1); card(x,150,360,400,col,a); txt(ttl, x+20, 190, {size:23, weight:700, color:col, alpha:a}); txt(sub, x+20, 218, {size:16, color:COL.mut, alpha:a}); return a; };
    const a1=pan(70,'1 · Ranking','do defaulters score higher?',COL.acc,8);
    const dn=s=>nd((s-.3)/.12), dp=s=>nd((s-.6)/.13)*.6, bx=100, bw=300, by=440; [[dn,COL.faint],[dp,COL.red]].forEach(([fn,col])=>{ c.save(); c.globalAlpha=a1*.7; c.fillStyle=col; c.beginPath(); c.moveTo(bx,by); for(let s=0;s<=1;s+=.01) c.lineTo(bx+s*bw, by-fn(s)*170); c.lineTo(bx+bw,by); c.fill(); c.restore(); });
    txt('good', bx+60, 270, {size:15, color:COL.mut, alpha:a1}); txt('defaulters', bx+190, 330, {size:15, color:COL.red, alpha:a1}); txt('AUC 0.95', 250, 500, {size:30, mono:true, weight:700, align:'center', color:COL.acc, alpha:A(t,10)}); txt('score →', bx+bw, by+20, {size:14, align:'right', color:COL.mut, alpha:a1});
    const a2=pan(460,'2 · Calibration','do the probabilities mean it?',COL.green,14);
    const cx=500, cy=470, cs=280; line(cx,cy,cx+cs,cy,COL.rule,a2); line(cx,cy,cx,cy-cs*.72,COL.rule,a2); line(cx,cy,cx+cs,cy-cs*.72,COL.faint,a2,1.5,[5,5]);
    calib.forEach((b,i)=>{ const al=A(t,15+i*.5,.5), px=cx+b.p/.4*cs, py=cy-b.obs/.4*cs*.72, e=1.96*b.se/.4*cs*.72; line(px,py-e,px,py+e,COL.green,al,2); dot(px,py,6,COL.green,al); });
    txt('predicted →', cx+cs, cy+20, {size:14, align:'right', color:COL.mut, alpha:a2}); txt('observed', cx+6, cy-cs*.72-6, {size:14, color:COL.mut, alpha:a2}); txt('on the diagonal = honest', 640, 520, {size:17, align:'center', color:COL.green, alpha:A(t,19)});
    const a3=pan(850,'3 · Against the baseline','and with error bars',COL.yel,23);
    [['old rule',.50,COL.faint],['model',.68,COL.yel]].forEach(([l,v,col],i)=>{ const x=900+i*150, hh=v*260*a3; rect(x,470-hh,100,hh,col,a3); line(x+50,470-hh-14,x+50,470-hh+14,COL.ink,a3,2.5); txt((v*100).toFixed(0)+' %', x+50, 470-hh-22, {size:22, weight:700, align:'center', alpha:a3}); txt(l, x+50, 494, {size:16, align:'center', color:COL.mut, alpha:a3}); });
    txt('precision at the same recall', 1030, 528, {size:15, align:'center', color:COL.mut, alpha:a3});
    txt('a test set is a sample: every metric is an estimate ± its standard error', 640, 586, {size:18, align:'center', color:COL.mut, alpha:A(t,26)});
  }});

S.push({ title:'From probability to decision — the threshold', dur:30,
  cap:[[0,'A probability is not a decision. The business turns it into one, with a threshold.'],[6,'Approve almost nobody, and you earn almost nothing. Approve everybody, and the riskiest customers cost more than they bring in.'],[14,'In between there is a best point. It sits exactly where the earlier arithmetic said: twelve percent.'],[21,'So the threshold comes from costs, not from the model. And one half is almost never the right answer.']],
  draw(t){
    const x0=120, y0=520, w=700, h=340, mx=best.v*1.12, mn=Math.min(approveAll, 0)*1.05, X = th => x0+th/0.4*w, Y = v => y0 - (v-mn)/(mx-mn)*h;
    line(x0,Y(0),x0+w,Y(0),COL.rule); line(x0,y0,x0,y0-h,COL.rule); [0,.1,.2,.3,.4].forEach(v=> txt((v*100).toFixed(0)+' %', X(v), y0+26, {size:15, align:'center', color:COL.mut})); txt('approve if P(default) is below →', x0+w, y0+52, {size:16, align:'right', color:COL.mut}); txt('total profit', x0+8, y0-h-8, {size:16, color:COL.mut});
    const up=clamp((t-2)/8); c.save(); c.strokeStyle=COL.acc; c.lineWidth=4; c.beginPath(); profitCurve.slice(0, Math.max(2,Math.floor(201*up))).forEach((p,i)=>{ i?c.lineTo(X(p.th),Y(p.v)):c.moveTo(X(p.th),Y(p.v)); }); c.stroke(); c.restore();
    const b=A(t,14,1); line(X(best.th),y0,X(best.th),Y(best.v),COL.yel,b,2.5,[6,5]); dot(X(best.th),Y(best.v),10,COL.yel,b); txt(`best: ${(best.th*100).toFixed(0)} %`, X(best.th)+14, Y(best.v)-10, {size:22, weight:700, color:COL.yel, alpha:b});
    txt('approve almost nobody', X(.012), Y(profitCurve[6].v)-34, {size:15, color:COL.mut, alpha:A(t,8)}); txt('approve everybody', X(.31), Y(profitCurve[160].v)+30, {size:15, color:COL.mut, alpha:A(t,8)});
    const X2=880;
    txt('approve when', X2, 200, {size:19, color:COL.mut, alpha:A(t,2)}); txt('p < gain / (gain + loss)', X2, 236, {size:22, mono:true, alpha:A(t,2)}); txt('= 80 / 680 = 11.8 %', X2, 270, {size:22, mono:true, color:COL.yel, alpha:A(t,14)});
    txt(`profit at the best threshold`, X2, 340, {size:17, color:COL.mut, alpha:b}); txt('€'+fmt(Math.round(best.v/1000)*1000), X2, 378, {size:32, mono:true, weight:700, color:COL.green, alpha:b});
    txt('approving everyone', X2, 428, {size:17, color:COL.mut, alpha:A(t,16)}); txt('€'+fmt(Math.round(approveAll/1000)*1000), X2, 462, {size:26, mono:true, color:COL.red, alpha:A(t,16)});
    txt('the threshold comes from costs —', X2, 524, {size:19, color:COL.yel, alpha:A(t,21)}); txt('0.5 is almost never right', X2, 552, {size:19, color:COL.yel, alpha:A(t,22)});
  }});

S.push({ title:'Did it work? Back to statistics — the A/B test', dur:31,
  cap:[[0,'The model is live. Did it actually help? An offline score cannot tell you. Only an experiment can.'],[7,'Split customers at random. One half is decided by the old rule, the other half by the model.'],[13,'Default rate: five percent against four point two. A difference of zero point eight points.'],[19,'Is that luck? The standard error says no: nearly four standard errors from zero. The true gain is between zero point four and one point two points.'],[27,'Then the business number: about a hundred thousand euros for every twenty thousand loans.']],
  draw(t){
    const by=500, Y = v => by-(v-3)/3*320, a=A(t,7,1);
    line(110,by,470,by,COL.rule,a); [3,4,5,6].forEach(v=>{ line(104,Y(v),470,Y(v),COL.rule,a*.5,1); txt(v+' %', 96, Y(v)+6, {size:15, align:'right', color:COL.mut, alpha:a}); });
    const b=A(t,13,1); rect(160,Y(5.0),110,by-Y(5.0),COL.faint,b); rect(320,Y(4.2),110,by-Y(4.2),COL.green,b*.9);
    [[215,5.0,.30],[375,4.2,.28]].forEach(([x,v,hh])=>{ line(x,Y(v-hh),x,Y(v+hh),COL.ink,b,3); line(x-10,Y(v-hh),x+10,Y(v-hh),COL.ink,b,3); line(x-10,Y(v+hh),x+10,Y(v+hh),COL.ink,b,3); });
    txt('old rule', 215, by+28, {size:20, weight:700, align:'center', alpha:a}); txt('model', 375, by+28, {size:20, weight:700, align:'center', alpha:a}); txt('20,000 loans', 215, by+52, {size:15, align:'center', color:COL.mut, alpha:a}); txt('20,000 loans', 375, by+52, {size:15, align:'center', color:COL.mut, alpha:a});
    txt('5.0 %', 215, Y(5.45), {size:22, weight:700, align:'center', alpha:b}); txt('4.2 %', 375, Y(4.62), {size:22, weight:700, align:'center', color:COL.green, alpha:b}); txt('default rate (axis starts at 3 %)', 110, 160, {size:14, color:COL.faint, alpha:a});
    const X=560;
    txt('randomised: the two groups differ only by the decision rule', X, 180, {size:18, color:COL.mut, alpha:a});
    txt('difference', X, 240, {size:21, color:COL.mut, alpha:b}); txt('0.8 pp', X+230, 240, {size:26, mono:true, alpha:b});
    txt('standard error', X, 288, {size:21, color:COL.mut, alpha:A(t,19)}); txt('0.21 pp', X+230, 288, {size:26, mono:true, alpha:A(t,19)});
    txt('z', X, 336, {size:21, color:COL.mut, alpha:A(t,20)}); txt('3.8   → p < 0.001', X+230, 336, {size:26, mono:true, color:COL.yel, alpha:A(t,20)});
    const g=A(t,22,1); card(X-14,366,620,84,COL.acc,g); txt('95 % CI of the improvement', X+6, 398, {size:18, color:COL.mut, alpha:g}); txt('[ 0.4 pp ,  1.2 pp ]', X+6, 434, {size:28, mono:true, weight:700, color:COL.acc, alpha:g});
    const m=A(t,27,1); txt('0.8 pp × 20,000 loans × €600', X, 504, {size:19, mono:true, color:COL.mut, alpha:m}); txt('≈ €96,000', X, 546, {size:36, mono:true, weight:700, color:COL.green, alpha:m}); txt('measured against the old rule, not against nothing', X+250, 540, {size:16, color:COL.mut, alpha:A(t,28.5)});
  }});

S.push({ title:'The loop never closes — monitor, and retrain', dur:27,
  cap:[[0,'One last thing. The world moves.'],[4,'The model said: expect about thirty-four defaults in this group. If you see thirty-seven, that is noise. If you see sixty, the model no longer describes the world.'],[14,'Customers change. Fraudsters adapt. That is drift.'],[19,'So you keep comparing what the model predicted with what happened, and you retrain. It is a loop, not a project.']],
  draw(t){
    const steps=['data','train','evaluate','decide','outcomes','monitor'], cx=330, cy=360, R=170, hi = t<19 ? -1 : Math.floor((t-19)/1.1)%6;
    steps.forEach((s,i)=>{ const th=-Math.PI/2+i*Math.PI/3, x=cx+R*Math.cos(th), y=cy+R*Math.sin(th), th2=-Math.PI/2+(i+1)*Math.PI/3, a=A(t,i*.5,.6), on = hi===i || (i===5 && t>4 && t<19);
      const mx=cx+R*Math.cos(th+.42), my=cy+R*Math.sin(th+.42), nx=cx+R*Math.cos(th2-.42), ny=cy+R*Math.sin(th2-.42); arrow(mx,my,nx,ny,COL.faint,a,2);
      dot(x,y,46,COL.panel,a); c.save(); c.globalAlpha=a; c.strokeStyle= on?COL.yel:(i===5?COL.red:COL.acc); c.lineWidth=on?4:2.5; c.beginPath(); c.arc(x,y,46,0,7); c.stroke(); c.restore(); txt(s, x, y+6, {size:18, weight:700, align:'center', color:on?COL.yel:COL.ink, alpha:a}); });
    const x0=660, w=520, y=330, X = v => x0 + clamp((v-10)/(80-10))*w, a=A(t,4,1);
    txt(`the model predicted: ${expDef.toFixed(0)} ± ${sdDef.toFixed(0)} defaults`, x0, 190, {size:21, color:COL.acc, alpha:a});
    line(x0,y,x0+w,y,COL.rule,a); [10,30,50,70].forEach(v=> txt(String(v), X(v), y+26, {size:15, align:'center', color:COL.mut, alpha:a}));
    c.save(); c.globalAlpha=a*.4; c.fillStyle=COL.acc; c.beginPath(); c.moveTo(X(expDef-3.2*sdDef),y); for(let v=expDef-3.2*sdDef; v<=expDef+3.2*sdDef; v+=.3) c.lineTo(X(v), y-nd((v-expDef)/sdDef)*90); c.lineTo(X(expDef+3.2*sdDef),y); c.fill(); c.restore();
    const o1=A(t,7,1), v1=expDef+3; line(X(v1),y,X(v1),y-60,COL.green,o1,3); dot(X(v1),y-60,7,COL.green,o1); txt(`saw ${v1.toFixed(0)} → noise`, X(v1)+10, y-104, {size:18, color:COL.green, alpha:o1});
    const o2=A(t,10,1); line(X(60),y,X(60),y-60,COL.red,o2,3); dot(X(60),y-60,7,COL.red,o2); txt('saw 60 → the world changed', X(60)+12, y-64, {size:18, color:COL.red, weight:700, alpha:o2}); txt(`${((60-expDef)/sdDef).toFixed(1)} standard deviations away`, X(60)+12, y-40, {size:15, color:COL.mut, alpha:o2});
    txt('drift: the customers change, or the relationship does', x0, 440, {size:20, color:COL.yel, alpha:A(t,14)}); txt('→ monitor predictions against outcomes · retrain on recent data', x0, 474, {size:18, color:COL.mut, alpha:A(t,19)});
    txt('probability made the prediction;', x0, 524, {size:19, color:COL.ink, alpha:A(t,21)}); txt('statistics tells you when to stop trusting it', x0, 552, {size:19, color:COL.ink, alpha:A(t,21.5)});
  }});

S.push({ title:'The four modules, one sentence each', dur:26,
  cap:[[0,'So here is how the four modules fit together.'],[3,'Probability is the language. It describes uncertainty, and it is what a model outputs.'],[9,'Statistics is the honesty. It tells you how much to trust a number that came from a sample.'],[14,'The maths of machine learning is the machinery: fit a function, without fooling yourself.'],[19,'And the models are the shapes that function can take. You pick one by the data, the outcome, and the constraints.']],
  draw(t){
    [['1','Probability','the LANGUAGE','describes uncertainty · what a model outputs','base rates, Bayes, expected value, distributions',COL.acc,3],['2','Statistics','the HONESTY','how far to trust a number from a sample','bias, standard error, confidence intervals, A/B tests',COL.red,9],['3','Maths for ML','the MACHINERY','fit a function without fooling yourself','loss, bias–variance, validation, metrics',COL.yel,14],['4','The models','the SHAPES','what the function can look like','linear, trees, ensembles, networks — pros and cons',COL.green,19]].forEach(([n,h,role,d1,d2,col,st],i)=>{ const x=90+(i%2)*560, y=160+Math.floor(i/2)*212, a=A(t,st,1); card(x,y,530,186,col,a); dot(x+40,y+44,22,col,a); txt(n, x+40, y+52, {size:24, weight:700, align:'center', color:COL.bg, alpha:a}); txt(h, x+76, y+40, {size:24, weight:700, alpha:a}); txt(role, x+76, y+68, {size:17, mono:true, color:col, alpha:a}); txt(d1, x+24, y+118, {size:20, alpha:a}); txt(d2, x+24, y+152, {size:16, color:COL.mut, alpha:a}); });
  }});

S.push({ title:'Your sentence — sharpened', dur:27,
  cap:[[0,'You put it like this: the model is the probabilities, and statistics tells you whether the model is right.'],[7,'That is nearly it. One correction: statistics is used twice.'],[11,'Once to build the model: training estimates the weights from a sample.'],[16,'And once to check it: on unseen data, and then in a live experiment.'],[21,'The model speaks probability. Statistics builds it and checks it. The business decides what to do with the number.']],
  draw(t){
    card(90,150,1100,80,COL.faint,A(t,0)); txt('"The model is the probabilities; statistics tells you if the model is right."', 640, 200, {size:24, align:'center', color:COL.mut, alpha:A(t,0)});
    const row=(y,k,v,col,st)=>{ const a=A(t,st,1); card(90,y,1100,84,col,a); txt(k, 120, y+52, {size:25, weight:700, color:col, alpha:a}); txt(v, 440, y+52, {size:22, alpha:a}); };
    row(262,'PROBABILITY','what the model says:  P(outcome | features)',COL.acc,7);
    row(360,'STATISTICS  ×2','builds it (training)   ·   checks it (test set, A/B test)',COL.red,11);
    row(458,'THE BUSINESS','turns the probability into a decision: the threshold, from costs',COL.yel,21);
    txt('probability → data → statistics → model → decision → outcomes → statistics again', 640, 584, {size:19, mono:true, align:'center', color:COL.mut, alpha:A(t,23)});
  }});

S.push({ title:'Explain it to someone with no statistics', dur:30,
  cap:[[0,'One more skill they may test: explaining these ideas to someone with no statistics. Four you can say in a breath.'],[7,'A model: a rule learned from past cases, that gives each new case a probability.'],[12,'A confidence interval: we measured thirty percent, but on a small sample, so the truth is probably between twenty-five and thirty-five.'],[19,'A p-value: if the change did nothing at all, how often would luck alone produce a result like this?'],[24,'An A B test: flip a coin for every customer, treat the two groups differently, and compare. The coin is what makes it fair.']],
  draw(t){
    [['A model','a rule learned from past cases that gives each new case a probability',COL.acc,7],['A confidence interval','"we measured 30 %, on a small sample — the truth is probably between 25 and 35"',COL.green,12],['A p-value','"if the change did nothing, how often would luck alone give a result like this?"',COL.yel,19],['An A/B test','flip a coin per customer, treat the two groups differently, compare — the coin makes it fair',COL.red,24]].forEach(([k,v,col,st],i)=>{ const y=160+i*106, a=A(t,st,1); card(90,y,1100,90,col,a); txt(k, 116, y+38, {size:23, weight:700, color:col, alpha:a}); txt(v, 116, y+70, {size:20, alpha:a}); });
  }});

S.push({ title:'Eight sentences to keep', dur:26,
  cap:[[0,'Eight sentences to keep.'],[2,'Start from the decision and its costs, not from the model.'],[6,'The data is a sample: check it for bias before anything else.'],[10,'A model outputs a probability. Training estimates it; testing verifies it.'],[15,'The threshold is a business choice. An experiment tells you whether it worked.'],[20,'And the world moves, so you keep measuring.']],
  draw(t){
    const L=['Start from the decision and its costs — they tell you what probability you need.','Data is a sample of the world: bias first, then noise, then hold some back.','Pick the model by the data, the outcome and the constraints. Baseline first.','A model is a probability machine: P(outcome | features).','Training is statistics: estimate the weights; watch the bias–variance trade-off.','Evaluation is statistics: ranking, calibration, baseline — with error bars.','The threshold turns a probability into a decision, and it comes from costs.','An A/B test proves the value. Monitoring tells you when it stops being true.'];
    L.forEach((s,i)=>{ const a=A(t,1+i*2.3,.8); dot(96, 160+i*53, 7, COL.acc, a); wrap(s, 126, 168+i*53, 1060, 26, {size:22, alpha:a}); });
  }});

