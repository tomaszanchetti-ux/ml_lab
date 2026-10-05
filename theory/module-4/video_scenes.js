/* ---------- precomputed data (seeded so scrubbing is stable) ---------- */
const sig = z => 1/(1+Math.exp(-z));
const tf = x => 0.5+0.3*Math.sin(2*Math.PI*x);
// 2-D classification data: class 1 (red) lives in two blocks, so no straight line separates it
const inRed = (x,y) => (x>0.55 && y>0.45) || (x<0.30 && y<0.38);
const D2 = (() => { const r=rng(601), a=[]; for(let i=0;i<170;i++){ const x=0.03+0.94*r(), y=0.03+0.94*r(); let k=inRed(x,y)?1:0; if(r()<0.03) k=1-k; a.push({x,y,k}); } return a; })();
const Q = {x:0.63, y:0.56};
const knn = (() => D2.map((p,i)=>({i, d:Math.hypot(p.x-Q.x,p.y-Q.y)})).sort((a,b)=>a.d-b.d).slice(0,7))();
const linPts = (() => { const r=rng(602), a=[]; for(let i=0;i<24;i++){ const x=0.05+0.9*r(); a.push([x, 0.2+0.55*x+0.07*gauss(r)]); } return a; })();
const logPts = (() => { const r=rng(603), a=[]; for(let i=0;i<46;i++){ const x=0.03+0.94*r(); a.push([x, r()<sig(11*(x-0.5))?1:0]); } return a; })();
function fitTree(xs, ys, depth, minLeaf=3){ const build=(ids,d)=>{ const m=ids.reduce((s,i)=>s+ys[i],0)/ids.length; if(d===0||ids.length<2*minLeaf) return {v:m};
    const so=[...ids].sort((a,b)=>xs[a]-xs[b]); let best=null;
    for(let k=minLeaf;k<=so.length-minLeaf;k++){ if(xs[so[k-1]]===xs[so[k]]) continue; let sl=0,sr=0; for(let j=0;j<k;j++) sl+=ys[so[j]]; for(let j=k;j<so.length;j++) sr+=ys[so[j]]; const ml=sl/k, mr=sr/(so.length-k); let sse=0; for(let j=0;j<k;j++) sse+=(ys[so[j]]-ml)**2; for(let j=k;j<so.length;j++) sse+=(ys[so[j]]-mr)**2; if(!best||sse<best.sse) best={sse,k,thr:(xs[so[k-1]]+xs[so[k]])/2}; }
    if(!best) return {v:m}; return {thr:best.thr, l:build(so.slice(0,best.k),d-1), r:build(so.slice(best.k),d-1)}; };
  const root=build(xs.map((_,i)=>i),depth); return x=>{ let n=root; while(n.thr!==undefined) n = x<n.thr ? n.l : n.r; return n.v; }; }
const D1 = (() => { const r=rng(604), xs=[], ys=[]; for(let i=0;i<46;i++){ const x=(i+0.2+0.6*r())/46; xs.push(x); ys.push(tf(x)+0.1*gauss(r)); } return {xs,ys}; })();
const GRID = Array.from({length:161},(_,i)=>i/160);
const forest = (() => { const r=rng(605), trees=[]; for(let s=0;s<40;s++){ const bx=[], by=[]; for(let i=0;i<46;i++){ const j=Math.floor(r()*46); bx.push(D1.xs[j]); by.push(D1.ys[j]); } const f=fitTree(bx,by,5,2); trees.push(GRID.map(f)); } const avg=GRID.map((_,i)=>trees.reduce((s,t)=>s+t[i],0)/trees.length); return {trees, avg}; })();
const boost = (() => { const mean=D1.ys.reduce((s,y)=>s+y,0)/46; let Ftr=D1.xs.map(()=>mean), Fg=GRID.map(()=>mean); const rounds=[{g:[...Fg], mse:D1.ys.reduce((s,y,i)=>s+(y-Ftr[i])**2,0)/46, tr:[...Ftr]}];
  for(let m=1;m<=60;m++){ const res=D1.ys.map((y,i)=>y-Ftr[i]), f=fitTree(D1.xs,res,2,3); Ftr=Ftr.map((v,i)=>v+0.25*f(D1.xs[i])); Fg=Fg.map((v,i)=>v+0.25*f(GRID[i])); rounds.push({g:[...Fg], mse:D1.ys.reduce((s,y,i)=>s+(y-Ftr[i])**2,0)/46, tr:[...Ftr]}); } return rounds; })();
const svm = (() => { const r=rng(606), a=[]; for(let i=0;i<26;i++) a.push({x:0.30+0.09*gauss(r), y:0.34+0.09*gauss(r), k:0}); for(let i=0;i<26;i++) a.push({x:0.70+0.09*gauss(r), y:0.68+0.09*gauss(r), k:1});
  const proj = p => (p.x+p.y)/Math.SQRT2; const max0=Math.max(...a.filter(p=>!p.k).map(proj)), min1=Math.min(...a.filter(p=>p.k).map(proj)); const b=(max0+min1)/2, m=(min1-max0)/2; a.forEach(p=>p.sv=Math.abs(Math.abs(proj(p)-b)-m)<0.012); return {a,b,m}; })();
const km = (() => { const r=rng(607), pts=[]; [[0.25,0.3],[0.7,0.28],[0.5,0.74]].forEach(([cx,cy])=>{ for(let i=0;i<34;i++) pts.push({x:cx+0.085*gauss(r), y:cy+0.085*gauss(r)}); });
  let cen=[{x:0.10,y:0.55},{x:0.92,y:0.55},{x:0.48,y:0.97}]; const steps=[{cen:cen.map(c=>({...c})), asg:null}];
  for(let it=0; it<6; it++){ const asg=pts.map(p=>{ let b=0,bd=9; cen.forEach((c,i)=>{ const d=Math.hypot(p.x-c.x,p.y-c.y); if(d<bd){bd=d;b=i;} }); return b; }); steps.push({cen:cen.map(c=>({...c})), asg});
    cen=cen.map((c,i)=>{ const mine=pts.filter((_,j)=>asg[j]===i); return mine.length ? {x:mine.reduce((s,p)=>s+p.x,0)/mine.length, y:mine.reduce((s,p)=>s+p.y,0)/mine.length} : c; }); steps.push({cen:cen.map(c=>({...c})), asg}); }
  return {pts, steps}; })();

/* shared drawing helpers */
function pane(x0,y0,w,h){ return { x0,y0,w,h, X:x=>x0+x*w, Y:y=>y0+h-y*h, frame(al=1){ strokeRect(x0,y0,w,h,COL.rule,al,1.5,6); } }; }
function proscons(x, y, pros, cons, t, tp, tc){ txt('STRENGTHS', x, y, {size:15, mono:true, color:COL.green, alpha:A(t,tp)}); pros.forEach((s,i)=> txt('+ '+s, x, y+30+i*29, {size:20, alpha:A(t,tp+.4+i*.5)}));
  const y2=y+30+pros.length*29+22; txt('WEAKNESSES', x, y2, {size:15, mono:true, color:COL.red, alpha:A(t,tc)}); cons.forEach((s,i)=> txt('− '+s, x, y2+30+i*29, {size:20, alpha:A(t,tc+.4+i*.5)})); }
function scatter2(P, al=1, fade=null){ D2.forEach((p,i)=> dot(P.X(p.x), P.Y(p.y), 5, p.k?COL.red:COL.acc, al*(fade?fade(i):1))); }
function steps1(P, g, col, al=1, lw=2){ c.save(); c.beginPath(); c.rect(P.x0,P.y0,P.w,P.h); c.clip(); c.globalAlpha*=al; c.strokeStyle=col; c.lineWidth=lw; c.beginPath(); g.forEach((v,i)=>{ const px=P.X(GRID[i]), py=P.Y(v); i?c.lineTo(px,py):c.moveTo(px,py); }); c.stroke(); c.restore(); }

/* ---------- scenes ---------- */
const S = [];

S.push({ title:'The models — the visual tour', dur:10,
  cap:[[0,'Module four: the models. What each one does, its strengths, its weaknesses, and when to use it.'],[6,'Every one is the same machinery from module three, in a different shape.']],
  draw(t){
    txt('MODULE 4', 640, 250, {size:26, color:COL.acc, align:'center', mono:true, alpha:A(t,0)});
    txt('The models', 640, 340, {size:96, weight:700, align:'center', alpha:A(t,.3)});
    txt('linear · logistic · k-NN · naive Bayes · trees · forests · boosting · SVM · neural nets · k-means', 640, 410, {size:22, color:COL.mut, align:'center', alpha:A(t,1.2)});
    txt('Revolut · Machine Learning 1 (Basics) · 8 October', 640, 470, {size:20, color:COL.faint, align:'center', alpha:A(t,2)});
  }});

S.push({ title:'The map', dur:26,
  cap:[[0,'Start with a map.'],[3,'Linear models: a weighted sum of the features. Linear and logistic regression.'],[8,'Models built on similarity, or on Bayes: nearest neighbours, and naive Bayes.'],[12,'Trees, and ensembles of trees: random forests and gradient boosting.'],[16,'Neural networks, which learn their own features. And unsupervised methods, for data without labels.'],[21,'On tabular business data, boosted trees usually win; logistic regression is the explainable baseline.']],
  draw(t){
    const cards=[['Linear','linear regression · logistic regression','a weighted sum of the features',COL.acc,3],['Similarity / Bayes','k-nearest neighbours · naive Bayes','"similar cases, similar outcomes"',COL.yel,8],['Trees','decision tree','a flowchart of yes / no questions',COL.green,12],['Ensembles of trees','random forest · gradient boosting','many trees beat one',COL.green,13.5],['Neural networks','feed-forward · CNN · transformer','layers that learn their own features',COL.red,16],['Unsupervised','k-means · PCA · anomaly detection','structure without labels',COL.mut,18]];
    cards.forEach(([h,m,d,col,st],i)=>{ const x=80+(i%3)*380, y=160+Math.floor(i/3)*190, a=A(t,st,.8); rect(x,y,350,160,COL.panel,a,10); strokeRect(x,y,350,160,col,a,2.5,10); txt(h, x+22, y+46, {size:26, weight:700, color:col, alpha:a}); wrap(m, x+22, y+84, 310, 26, {size:19, alpha:a}); txt(d, x+22, y+142, {size:16, color:COL.mut, alpha:a}); });
    const f=A(t,21,1); if(f>0){ strokeRect(76,346,358,168,COL.ink,f,4,12); strokeRect(76,156,358,168,COL.ink,f*.7,3,12); txt('tabular data: boosting usually wins · logistic = the explainable baseline', 640, 575, {size:19, align:'center', color:COL.ink, alpha:f}); }
  }});

S.push({ title:'Linear regression', dur:26,
  cap:[[0,'Linear regression predicts a number as a weighted sum of the features.'],[5,'Each weight says how much the prediction moves when that feature goes up by one, holding the others fixed.'],[11,'Strengths: simple, fast, easy to explain, hard to overfit.'],[16,'Weaknesses: it only draws straight lines, and outliers and near-duplicate features throw it off.'],[21,'It is the baseline you fit first.']],
  draw(t){
    const P=pane(80,150,560,400); P.frame(); linPts.forEach(p=> dot(P.X(p[0]),P.Y(p[1]),5,COL.acc));
    line(P.X(0),P.Y(.2),P.X(1),P.Y(.75),COL.yel,A(t,1),3.5);
    const a=A(t,5,1); line(P.X(.4),P.Y(.42),P.X(.7),P.Y(.42),COL.green,a,2.5); line(P.X(.7),P.Y(.42),P.X(.7),P.Y(.585),COL.green,a,2.5); txt('+1', P.X(.55), P.Y(.42)+22, {size:17, align:'center', color:COL.green, alpha:a}); txt('+w', P.X(.7)+10, P.Y(.5), {size:19, color:COL.green, weight:700, alpha:a});
    txt('ŷ = w₀ + w₁x₁ + w₂x₂ + …', 80, 590, {size:22, mono:true, color:COL.yel, alpha:A(t,1)});
    proscons(710, 180, ['simple and fast','every weight is readable','needs little data','low variance'], ['straight lines only','sensitive to outliers','unstable with correlated features'], t, 11, 16);
    txt('→ the baseline you fit first', 710, 530, {size:21, color:COL.yel, weight:600, alpha:A(t,21)});
  }});

S.push({ title:'Logistic regression', dur:28,
  cap:[[0,'Logistic regression is for yes or no outcomes.'],[4,'It takes the same weighted sum, and squashes it through an S-shaped curve, the sigmoid, into a probability.'],[11,'It is still a linear model: the boundary between yes and no is a straight line.'],[16,'Strengths: interpretable, well calibrated, fast, and accepted by regulators. It is the standard for credit scorecards.'],[22,'Weakness: it misses curves and interactions, unless you build them in by hand.']],
  draw(t){
    const P=pane(80,170,580,340); line(P.x0,P.Y(0),P.x0+P.w,P.Y(0),COL.rule); line(P.x0,P.Y(1),P.x0+P.w,P.Y(1),COL.rule,.6,1,[4,4]);
    txt('1 = default', P.x0-8, P.Y(1)-8, {size:15, color:COL.red}); txt('0 = repaid', P.x0-8, P.Y(0)+24, {size:15, color:COL.acc}); txt('months late →', P.x0+P.w, P.Y(0)+24, {size:15, align:'right', color:COL.mut});
    logPts.forEach(p=> dot(P.X(p[0]), P.Y(p[1])+(p[1]?-8:8), 5.5, p[1]?COL.red:COL.acc, .85));
    const a=A(t,4,2); c.save(); c.globalAlpha=1; c.strokeStyle=COL.yel; c.lineWidth=4; c.beginPath(); for(let x=0; x<=a; x+=.005){ const px=P.X(x), py=P.Y(sig(11*(x-.5))); x===0?c.moveTo(px,py):c.lineTo(px,py);} c.stroke(); c.restore();
    txt('p = σ(w · x)', P.X(.02), P.Y(.62), {size:24, mono:true, color:COL.yel, alpha:A(t,5)}); txt('sigmoid: any number → 0…1', P.X(.02), P.Y(.62)+28, {size:16, color:COL.mut, alpha:A(t,6)});
    const b=A(t,11,1); line(P.X(.5),P.Y(-.08),P.X(.5),P.Y(1.1),COL.green,b,2.5,[7,5]); txt('p = 0.5 → decision boundary', P.X(.5)+10, P.Y(1.08), {size:17, color:COL.green, alpha:b}); line(P.x0,P.Y(.5),P.X(.5),P.Y(.5),COL.green,b*.6,1.5,[4,4]);
    txt('log( p / (1 − p) ) = w · x      linear in the log-odds', 80, 566, {size:19, mono:true, color:COL.mut, alpha:A(t,12)});
    proscons(730, 180, ['weights = odds ratios','calibrated probabilities','fast, stable, scales','regulator-friendly'], ['linear boundary','misses interactions','needs feature engineering'], t, 16, 22);
  }});

S.push({ title:'The limit of linear models', dur:21,
  cap:[[0,'Here is the limit of linear models. Two classes, arranged in blocks.'],[5,'No straight line separates them. Whatever line you draw, one group ends up on the wrong side.'],[12,'To capture this, you need a model that can bend: neighbours, trees, or networks.']],
  draw(t){
    const P=pane(120,140,560,430); P.frame(); scatter2(P);
    const ang = 0.6+1.9*Math.sin(clamp((t-5)/14)*Math.PI*1.6), nx=Math.cos(ang), ny=Math.sin(ang), side = p => (p.x-.5)*nx+(p.y-.5)*ny > 0 ? 1 : 0;
    if(t>5){ const a=A(t,5,1), dx=-ny, dy=nx; c.save(); c.beginPath(); c.rect(P.x0,P.y0,P.w,P.h); c.clip(); line(P.X(.5-dx),P.Y(.5-dy),P.X(.5+dx),P.Y(.5+dy),COL.yel,a,3.5); c.restore();
      let ok=0; D2.forEach(p=>{ if(side(p)===p.k) ok++; }); const acc=Math.max(ok,D2.length-ok)/D2.length;
      txt('best a straight line can do right now', 760, 240, {size:19, color:COL.mut, alpha:a}); txt((acc*100).toFixed(0)+' %', 760, 300, {size:54, mono:true, weight:700, color:COL.yel, alpha:a}); txt('correct', 880, 300, {size:22, color:COL.mut, alpha:a}); }
    txt('you need a model that can bend:', 760, 400, {size:21, alpha:A(t,12)}); ['k-nearest neighbours','decision trees and ensembles','neural networks'].forEach((s,i)=> txt('→ '+s, 760, 436+i*30, {size:20, color:COL.green, alpha:A(t,13+i*.6)}));
  }});

S.push({ title:'k-nearest neighbours', dur:25,
  cap:[[0,'K nearest neighbours: to classify a new case, look at the most similar cases you have already seen.'],[6,'Take the k closest, and let them vote.'],[11,'There is no training at all. But every prediction has to search the whole data set.'],[16,'It needs scaled features, and with many features, nothing is really near anything. K trades variance for bias.']],
  draw(t){
    const P=pane(100,140,540,430); P.frame(); const R=knn[6].d, grow=ease(clamp((t-6)/3)), nn=new Set(knn.map(k=>k.i));
    scatter2(P, 1, i => (grow>.9 && !nn.has(i)) ? .35 : 1);
    c.save(); c.globalAlpha=A(t,6); c.strokeStyle=COL.yel; c.lineWidth=2.5; c.setLineDash([6,5]); c.beginPath(); c.ellipse(P.X(Q.x),P.Y(Q.y),R*grow*P.w,R*grow*P.h,0,0,7); c.stroke(); c.restore();
    if(grow>.9) knn.forEach(k=>{ const p=D2[k.i]; line(P.X(Q.x),P.Y(Q.y),P.X(p.x),P.Y(p.y),COL.yel,.5,1.2); dot(P.X(p.x),P.Y(p.y),8,p.k?COL.red:COL.acc); });
    const a=A(t,1,1); c.save(); c.globalAlpha=a; c.fillStyle=COL.yel; c.beginPath(); for(let i=0;i<10;i++){ const r=i%2?7:15, th=-Math.PI/2+i*Math.PI/5; c.lineTo(P.X(Q.x)+r*Math.cos(th), P.Y(Q.y)+r*Math.sin(th)); } c.fill(); c.restore(); txt('new case', P.X(Q.x)+18, P.Y(Q.y)-14, {size:17, color:COL.yel, alpha:a});
    const red=knn.filter(k=>D2[k.i].k).length, X2=710;
    txt('k = 7', X2, 200, {size:32, mono:true, weight:700, alpha:A(t,6)}); txt(`${red} red  ·  ${7-red} blue`, X2, 246, {size:24, alpha:A(t,9)}); txt('→ predict red', X2, 282, {size:24, weight:700, color:COL.red, alpha:A(t,9.5)});
    proscons(X2, 340, ['no training','non-linear for free'], ['slow at prediction time','needs scaling','fails with many features'], t, 11, 16);
  }});

S.push({ title:'Naive Bayes', dur:23,
  cap:[[0,'Naive Bayes applies the theorem from module one.'],[4,'For each word, how much more common is it in spam than in normal mail? Multiply those ratios together, times the prior.'],[11,'Naive, because it assumes the words are independent. They are not.'],[15,'So its probabilities are too extreme. But it is fast, needs little data, and is a good first model for text.']],
  draw(t){
    txt('P(spam | words)  ∝  P(spam) × P(word₁ | spam) × P(word₂ | spam) × …', 640, 160, {size:23, mono:true, align:'center', color:COL.acc, alpha:A(t,0)});
    txt('in spam', 420, 220, {size:16, color:COL.red, alpha:A(t,4)}); txt('in normal mail', 640, 220, {size:16, color:COL.acc, alpha:A(t,4)}); txt('ratio', 900, 220, {size:16, color:COL.mut, alpha:A(t,4)});
    [['"winner"',.18,.006,30],['"urgent"',.22,.03,7.3],['"transfer"',.15,.05,3]].forEach(([w,ps,ph,ra],i)=>{ const y=250+i*62, a=A(t,4+i*1.3,.8); txt(w, 120, y+22, {size:26, weight:600, alpha:a}); rect(420,y,ps*800,26,COL.red,a,4); txt((ps*100).toFixed(0)+' %', 420+ps*800+8, y+20, {size:16, alpha:a}); rect(640,y,Math.max(ph*800,3),26,COL.acc,a,4); txt((ph*100).toFixed(1)+' %', 640+ph*800+10, y+20, {size:16, alpha:a}); txt('× '+ra, 900, y+22, {size:24, mono:true, color:COL.yel, alpha:a}); });
    txt('30 × 7.3 × 3  ≈  660 times more likely spam', 120, 470, {size:24, mono:true, color:COL.yel, alpha:A(t,9)});
    txt('"naive": treats the words as independent — it double-counts related evidence', 120, 520, {size:20, color:COL.red, alpha:A(t,11)});
    txt('+ very fast · little data · good text baseline          − badly calibrated', 120, 566, {size:19, color:COL.mut, alpha:A(t,15)});
  }});

S.push({ title:'Decision trees', dur:28,
  cap:[[0,'A decision tree asks yes or no questions, one at a time.'],[4,'First split: the one question that separates the classes best.'],[9,'Then it splits each side again, and again, until the groups are nearly pure.'],[15,'Strengths: you can read the rules, it handles curves and interactions, and it needs no scaling.'],[21,'Weakness: it is unstable. Change the data a little, and you get a different tree.']],
  draw(t){
    const P=pane(80,140,480,430); P.frame(); const s1=A(t,4,1), s2=A(t,9,1), s3=A(t,10.5,1), s4=A(t,12,1);
    rect(P.X(.55),P.Y(1),P.w*.45,P.h*.55,COL.red,s2*.16); rect(P.X(0),P.Y(.38),P.w*.3,P.h*.38,COL.red,s4*.16);
    scatter2(P);
    line(P.X(.55),P.Y(0),P.X(.55),P.Y(1),COL.yel,s1,3.5); line(P.X(.55),P.Y(.45),P.X(1),P.Y(.45),COL.yel,s2,3); line(P.X(.3),P.Y(0),P.X(.3),P.Y(1),COL.yel,s3,3); line(P.X(0),P.Y(.38),P.X(.3),P.Y(.38),COL.yel,s4,3);
    const node=(x,y,s,al,col=COL.ink)=>{ c.save(); c.font='400 17px -apple-system,sans-serif'; const w=c.measureText(s).width+24; c.restore(); rect(x-w/2,y-18,w,36,COL.panel,al,8); strokeRect(x-w/2,y-18,w,36,col,al,2,8); txt(s, x, y+6, {size:17, align:'center', color:col, alpha:al}); };
    const TX=930;
    line(TX,200,TX-150,270,COL.faint,s3); line(TX,200,TX+150,270,COL.faint,s2); node(TX,190,'x > 0.55 ?',s1,COL.yel);
    txt('no', TX-90, 228, {size:14, color:COL.mut, alpha:s3}); txt('yes', TX+84, 228, {size:14, color:COL.mut, alpha:s2});
    line(TX+150,290,TX+90,360,COL.faint,s2); line(TX+150,290,TX+215,360,COL.faint,s2); node(TX+150,280,'y > 0.45 ?',s2,COL.yel); node(TX+90,372,'blue',s2,COL.acc); node(TX+215,372,'RED',s2,COL.red);
    line(TX-150,290,TX-215,360,COL.faint,s3); line(TX-150,290,TX-90,360,COL.faint,s3); node(TX-150,280,'x < 0.30 ?',s3,COL.yel); node(TX-90,372,'blue',s3,COL.acc);
    line(TX-215,382,TX-265,446,COL.faint,s4); line(TX-215,382,TX-165,446,COL.faint,s4); node(TX-215,372,'y < 0.38 ?',s4,COL.yel); node(TX-265,458,'RED',s4,COL.red); node(TX-165,458,'blue',s4,COL.acc);
    txt('+ readable rules · non-linear · interactions · no scaling', 620, 530, {size:19, color:COL.green, alpha:A(t,15)}); txt('− unstable (high variance) · overfits when deep', 620, 562, {size:19, color:COL.red, alpha:A(t,21)});
  }});

S.push({ title:'Random forest — many trees, averaged', dur:28,
  cap:[[0,'One tree is jumpy. So grow many.'],[4,'Each tree sees a different random sample of the data, and a random subset of the features.'],[10,'Each one is wrong in its own way.'],[14,'Average them, and the errors cancel. That is a random forest: it cuts variance.'],[20,'Robust, parallel, and it works almost without tuning.']],
  draw(t){
    const P=pane(80,140,700,420); P.frame(); D1.xs.forEach((x,i)=> dot(P.X(x),P.Y(D1.ys[i]),4.5,COL.acc,.9));
    const n = t<1 ? 1 : Math.min(14, 1+Math.floor((t-1)/0.9)), av=A(t,14,1.5), cols=[COL.yel,COL.red,COL.green,'#B48EAD','#D08770'];
    for(let i=0;i<n;i++) steps1(P, forest.trees[i], cols[i%5], lerp(.75,.22,av), 1.8);
    steps1(P, forest.avg, COL.ink, av, 4.5);
    const X2=830;
    txt(`trees shown: ${n}`, X2, 190, {size:22, mono:true}); txt('each on a bootstrap sample', X2, 224, {size:18, color:COL.mut, alpha:A(t,4)}); txt('+ random features per split', X2, 250, {size:18, color:COL.mut, alpha:A(t,5)});
    txt('average of 40 trees', X2, 320, {size:22, weight:700, alpha:av}); txt('the jumps cancel → lower variance', X2, 350, {size:18, color:COL.green, alpha:av});
    proscons(X2, 410, ['robust, little tuning','parallel'], ['big; not readable'], t, 20, 22);
  }});

S.push({ title:'Gradient boosting — fix the errors, one small tree at a time', dur:29,
  cap:[[0,'Gradient boosting takes the opposite route. Start with the simplest possible model: the average.'],[6,'Look at the errors. Fit a small tree to those errors, and add a fraction of it.'],[12,'Repeat. Each new tree corrects what is still wrong.'],[17,'Step by step the bias falls. On tabular data this is usually the most accurate model.'],[22,'But it needs tuning, and it will overfit if you never stop. You stop when validation error stops improving.']],
  draw(t){
    const P=pane(80,140,700,420); P.frame(); const m = t<6 ? 0 : Math.min(60, Math.floor(60*Math.pow(clamp((t-6)/15),1.6))), R=boost[m];
    D1.xs.forEach((x,i)=>{ line(P.X(x),P.Y(D1.ys[i]),P.X(x),P.Y(R.tr[i]),COL.red,.7,1.6); dot(P.X(x),P.Y(D1.ys[i]),4.5,COL.acc,.9); });
    steps1(P, R.g, COL.yel, 1, 4);
    const X2=830;
    txt(`round ${m}`, X2, 190, {size:34, mono:true, weight:700}); txt('trees added so far', X2, 218, {size:16, color:COL.mut});
    txt('remaining error', X2, 280, {size:18, color:COL.mut}); rect(X2,292,320,16,COL.panel,1,4); rect(X2,292,320*clamp(R.mse/boost[0].mse),16,COL.red,1,4);
    txt('red sticks = what is still wrong', X2, 344, {size:17, color:COL.red, alpha:A(t,6)}); txt('next tree is fitted to those', X2, 370, {size:17, color:COL.mut, alpha:A(t,7)});
    txt('F ← F + η · small_tree(errors)', X2, 420, {size:19, mono:true, color:COL.yel, alpha:A(t,8)});
    txt('+ usually the best on tabular data', X2, 480, {size:18, color:COL.green, alpha:A(t,17)}); txt('− tuning: learning rate, depth', X2, 510, {size:18, color:COL.red, alpha:A(t,22)}); txt('− overfits → early stopping', X2, 538, {size:18, color:COL.red, alpha:A(t,23)});
  }});

S.push({ title:'Random forest vs. gradient boosting', dur:23,
  cap:[[0,'Side by side.'],[2,'Forest: deep trees, built independently, and averaged. Boosting: shallow trees, built in sequence, and added.'],[9,'The forest cuts variance. Boosting cuts bias.'],[13,'More trees never hurt a forest. Boosting needs early stopping.'],[18,'Start with a forest for a robust baseline. Move to boosting for the last points of accuracy.']],
  draw(t){
    txt('Random forest', 470, 170, {size:28, weight:700, align:'center', color:COL.green}); txt('Gradient boosting', 920, 170, {size:28, weight:700, align:'center', color:COL.yel});
    [['trees are built','independently, in parallel','in sequence, each on the last errors',2],['each tree is','deep','shallow',4],['mainly reduces','VARIANCE','BIAS',9],['more trees','never hurts','eventually overfits → early stopping',13],['tuning','works out of the box','needs care',15],['accuracy (tabular)','very good','usually the best',16.5]].forEach(([k,a1,b1,st],i)=>{ const y=222+i*56, a=A(t,st,.8); line(80,y+18,1200,y+18,COL.rule,a*.6,1); txt(k, 90, y, {size:19, color:COL.mut, alpha:a}); txt(a1, 470, y, {size:21, align:'center', alpha:a, weight: i===2?700:400, color: i===2?COL.green:COL.ink}); txt(b1, 920, y, {size:21, align:'center', alpha:a, weight: i===2?700:400, color: i===2?COL.yel:COL.ink}); });
    txt('both: no scaling · non-linear · interactions for free · feature importance instead of readable rules', 640, 580, {size:17, align:'center', color:COL.faint, alpha:A(t,18)});
  }});

S.push({ title:'Support vector machines', dur:19,
  cap:[[0,'Support vector machines find the boundary with the widest possible margin between the classes.'],[6,'Only the points on the edge of the margin matter: the support vectors.'],[11,'Good on small, high-dimensional data. Slow on large data, and hard to interpret. Worth knowing; rarely the first choice today.']],
  draw(t){
    const P=pane(110,140,520,430); P.frame(); const a=A(t,1,1.5), {b,m}=svm, L = off => { const k=(b+off)*Math.SQRT2; return [[P.X(k-1.2),P.Y(1.2)],[P.X(k+.2),P.Y(-.2)]]; };
    c.save(); c.beginPath(); c.rect(P.x0,P.y0,P.w,P.h); c.clip(); c.globalAlpha=a*.14; c.fillStyle=COL.yel; const p1=L(-m), p2=L(m); c.beginPath(); c.moveTo(...p1[0]); c.lineTo(...p1[1]); c.lineTo(...p2[1]); c.lineTo(...p2[0]); c.fill(); c.globalAlpha=1;
    const l0=L(0); line(l0[0][0],l0[0][1],l0[1][0],l0[1][1],COL.yel,a,3.5); [p1,p2].forEach(l=> line(l[0][0],l[0][1],l[1][0],l[1][1],COL.yel,a*.7,1.8,[6,5])); c.restore();
    svm.a.forEach(p=>{ dot(P.X(p.x),P.Y(p.y),5.5,p.k?COL.red:COL.acc); if(p.sv && t>6){ c.save(); c.globalAlpha=A(t,6); c.strokeStyle=COL.ink; c.lineWidth=2.5; c.beginPath(); c.arc(P.X(p.x),P.Y(p.y),12,0,7); c.stroke(); c.restore(); } });
    txt('widest margin', 700, 220, {size:26, weight:700, color:COL.yel, alpha:a}); txt('support vectors = the circled points', 700, 262, {size:19, color:COL.mut, alpha:A(t,6)}); txt('kernel trick → curved boundaries', 700, 292, {size:19, color:COL.mut, alpha:A(t,8)});
    proscons(700, 350, ['small, high-dimensional data'], ['slow on large data','needs scaling; no probabilities','hard to interpret'], t, 11, 13);
  }});

S.push({ title:'Neural networks', dur:29,
  cap:[[0,'A neural network stacks layers. Each unit takes a weighted sum, and passes it through a non-linear function.'],[7,'Early layers learn simple features. Later layers combine them. The network learns its own features from raw data.'],[14,'It is trained by backpropagation: push the error backwards, and adjust every weight a little.'],[19,'Best for images, text and sequences, and when data is abundant. That is where foundation models like PRAGMA live.'],[25,'The price: data, compute, tuning, and a black box.']],
  draw(t){
    const L=[4,6,6,1], xs=[140,330,520,710], pos=L.map((n,li)=> Array.from({length:n},(_,i)=>[xs[li], 355+(i-(n-1)/2)*64]));
    const fwd = t<14 ? ((t*0.5)%1) : -1, back = (t>=14 && t<19) ? (((t-14)*0.6)%1) : -1;
    for(let li=0; li<3; li++) pos[li].forEach((p,i)=> pos[li+1].forEach((q,j)=>{ line(p[0],p[1],q[0],q[1],COL.faint,.45,1);
      if(fwd>=0){ const ph=fwd*3-li; if(ph>0&&ph<1 && (i+j)%2===0) dot(lerp(p[0],q[0],ph),lerp(p[1],q[1],ph),3.5,COL.yel,.9); }
      if(back>=0){ const ph=back*3-(2-li); if(ph>0&&ph<1 && (i+j)%2===1) dot(lerp(q[0],p[0],ph),lerp(q[1],p[1],ph),3.5,COL.red,.9); } }));
    pos.forEach((layer,li)=> layer.forEach(p=>{ dot(p[0],p[1],15,COL.panel); c.save(); c.strokeStyle=[COL.acc,COL.green,COL.green,COL.red][li]; c.lineWidth=2.5; c.beginPath(); c.arc(p[0],p[1],15,0,7); c.stroke(); c.restore(); }));
    ['features','simple features','combinations','prediction'].forEach((s,i)=> txt(s, xs[i], 580, {size:16, align:'center', color:COL.mut, alpha:A(t, i?7:0)}));
    txt('unit = activation( weighted sum )', 140, 150, {size:20, mono:true, color:COL.acc, alpha:A(t,1)});
    txt(fwd>=0?'forward: compute the prediction →':(back>=0?'← backward: backpropagate the error':''), 425, 132, {size:17, align:'center', color: fwd>=0?COL.yel:COL.red});
    const X2=820;
    txt('learns its own features', X2, 200, {size:24, weight:700, color:COL.green, alpha:A(t,7)});
    txt('trained by backprop + gradient descent', X2, 240, {size:18, color:COL.mut, alpha:A(t,14)});
    txt('images · text · sequences', X2, 300, {size:22, alpha:A(t,19)}); txt('transformers → LLMs, PRAGMA', X2, 332, {size:19, color:COL.yel, alpha:A(t,20.5)});
    proscons(X2, 392, ['state of the art on unstructured data','keeps improving with more data'], ['data- and compute-hungry','black box; hard to tune'], t, 19, 25);
  }});

S.push({ title:'k-means clustering', dur:25,
  cap:[[0,'No labels? K means finds groups.'],[4,'Drop k centres at random. Assign every point to its nearest centre.'],[9,'Move each centre to the middle of its points. Repeat.'],[14,'It settles in a few rounds.'],[18,'You have to choose k, scale the features, and it only finds round clusters. Run it several times.']],
  draw(t){
    const P=pane(110,140,540,430); P.frame(); const cols=[COL.red,COL.green,COL.yel];
    const f = t<4 ? 0 : Math.min(km.steps.length-1.001, (t-4)/1.25), i0=Math.floor(f), fr=f-i0, s0=km.steps[i0], s1=km.steps[Math.min(i0+1,km.steps.length-1)], asg = s1.asg || s0.asg;
    km.pts.forEach((p,j)=> dot(P.X(p.x),P.Y(p.y),5, asg && t>4 ? cols[asg[j]] : COL.faint, .9));
    if(t>2) s0.cen.forEach((cc,i)=>{ const x=lerp(cc.x,s1.cen[i].x,ease(fr)), y=lerp(cc.y,s1.cen[i].y,ease(fr)), px=P.X(x), py=P.Y(y); c.save(); c.globalAlpha=A(t,2); c.strokeStyle=COL.ink; c.lineWidth=4; c.beginPath(); c.moveTo(px-11,py-11); c.lineTo(px+11,py+11); c.moveTo(px+11,py-11); c.lineTo(px-11,py+11); c.stroke(); c.strokeStyle=cols[i]; c.lineWidth=2; c.stroke(); c.restore(); });
    const X2=720;
    txt('k = 3', X2, 200, {size:32, mono:true, weight:700}); txt(`round ${Math.floor(i0/2)}`, X2+130, 200, {size:22, mono:true, color:COL.mut, alpha:A(t,4)});
    txt('1 · assign each point to the nearest centre', X2, 260, {size:19, color: i0%2===0 && t>4 ? COL.ink : COL.mut}); txt('2 · move each centre to the mean of its points', X2, 292, {size:19, color: i0%2===1 ? COL.ink : COL.mut}); txt('3 · repeat until nothing changes', X2, 324, {size:19, color:COL.mut});
    proscons(X2, 384, ['simple, fast, scales'], ['you must choose k','round clusters only','sensitive to scale and start'], t, 18, 19.5);
  }});

S.push({ title:'Which model, when?', dur:27,
  cap:[[0,'So which model, when? Ask in this order.'],[3,'Is there a label? If not: clustering, or anomaly detection.'],[7,'What kind of data? Images, text, sequences: neural networks. Tables: trees or linear models.'],[13,'Must every decision be explained? Logistic regression, or a shallow tree.'],[17,'How much data, and how fast must it answer?'],[21,'And always: start with a simple baseline. Keep the complex model only if it earns its complexity.']],
  draw(t){
    [['1','Is there a label?','no → k-means, anomaly detection',3],['2','What kind of data?','images / text / sequences → neural network   ·   tabular → boosting or linear',7],['3','Must each decision be explained?','yes → logistic regression, shallow tree  (or boosting + SHAP)',13],['4','How much data? How fast?','little data → simple model   ·   tight latency → linear or small trees',17],['5','Always','baseline first — complexity has to pay for itself',21]].forEach(([n,q,ans,st],i)=>{ const y=170+i*84, a=A(t,st,.8); dot(104,y,20,i===4?COL.yel:COL.acc,a); txt(n, 104, y+8, {size:22, weight:700, align:'center', color:COL.bg, alpha:a}); txt(q, 144, y-2, {size:25, weight:700, alpha:a}); txt(ans, 144, y+28, {size:19, color: i===4?COL.yel:COL.green, alpha:A(t,st+1)}); });
  }});

S.push({ title:'Seven sentences to keep', dur:22,
  cap:[[0,'Seven sentences to keep.'],[2,'Linear models are simple, stable and explainable, and they only draw straight lines.'],[7,'Trees bend, and can be read, but one tree is unstable.'],[11,'A forest averages trees to cut variance. Boosting adds them in sequence to cut bias.'],[16,'Neural networks learn their own features, for a price. And always start with the baseline.']],
  draw(t){
    const L=['Linear / logistic: weighted sum. Explainable, stable — straight lines only.','k-NN: vote of similar cases. Naive Bayes: Bayes with an independence shortcut.','Decision tree: readable if/else rules — but high variance.','Random forest: many deep trees averaged → less variance.','Gradient boosting: shallow trees in sequence → less bias. Best on tabular.','Neural nets: learn features; images, text, sequences; data-hungry, opaque.','Choose by data type, explainability, data size, latency — baseline first.'];
    L.forEach((s,i)=>{ const a=A(t,1+i*2.2,.8); dot(96, 168+i*60, 7, COL.acc, a); wrap(s, 126, 177+i*60, 1060, 28, {size:24, alpha:a}); });
  }});

