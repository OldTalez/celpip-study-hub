/*
LEARNING NOTE
e2e-test.cjs drives the whole app in a headless Chrome, the way a person would: every screen, each practice type,
a full timed exam with all 8 speaking tasks, review, words, grammar, notes, plan, settings, history and the phone
layout. It uses a fake microphone (Chrome's test device) and makes time run 100 times faster, so a 55-minute timer
takes about half a minute. Each check prints PASS or FAIL; the exit code is the number of failures.
Run it (from this folder):
  npm install playwright-core           (once; uses an installed Chrome via CHROME_PATH, or Playwright's own)
  python -m http.server 8790            (in another window)
  node tools/e2e-test.cjs http://localhost:8790/
Added 2026-11-05 (Ufok). It found four bugs, fixed the same day: microphone left on, exam warning left on (twice),
and "Practice Again" doing nothing.
*/
const {chromium}=require('playwright-core');
const BASE=process.argv[2]||'http://localhost:8790/';const SHOTS=process.argv[3]||'';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,
   args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required']});
 // reduced motion: with time 100x faster, a 30-second preparation lasts 0.3 s, shorter than the screen fade-in
 const ctx=await b.newContext({viewport:{width:1280,height:900},permissions:['microphone'],reducedMotion:'reduce'});
 // count live microphone tracks, to catch a mic left on
 await ctx.addInitScript(()=>{window.__tracks=[];const g=navigator.mediaDevices&&navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
   if(g)navigator.mediaDevices.getUserMedia=async c=>{const s=await g(c);s.getTracks().forEach(t=>window.__tracks.push(t));return s};
   window.__live=()=>window.__tracks.filter(t=>t.readyState==='live').length;
   // time runs 100x faster: a 55-minute timer takes 33 seconds
   const F=100,st=window.setTimeout.bind(window),si=window.setInterval.bind(window);window.setTimeout=(f,d,...a)=>st(f,(d||0)/F,...a);window.setInterval=(f,d,...a)=>si(f,(d||0)/F,...a)});
 // a stand-in for the browser's speech recognition, counting how often it is started (it must stay off unless opted in)
 await ctx.addInitScript(()=>{window.__sr=0;window.SpeechRecognition=window.webkitSpeechRecognition=class{start(){window.__sr++}stop(){setTimeout(()=>this.onend&&this.onend(),10)}abort(){}}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
 p.on('dialog',d=>d.accept());
 const run=ms=>p.waitForTimeout(Math.max(40,ms/100));
 const go=async h=>{await p.evaluate(h=>{if(location.hash===h)render();else location.hash=h},h);await p.waitForTimeout(150)};
 const step=async(name,fn)=>{const before=errs.length;try{await fn()}catch(e){ok(false,name+' threw: '+e.message.split('\n')[0])}const n=errs.slice(before);if(n.length){ok(false,name+' page errors: '+n.slice(0,3).join(' | '))}};
 const txt=s=>p.$eval(s,e=>e.textContent).catch(()=>null);
 // selects the first n characters of a passage and tells the highlighter the mouse was let go
 const selectPassage=(scope,n)=>p.evaluate(([scope,n])=>{const t=document.querySelector(scope+' .passage-text');const w=document.createTreeWalker(t,NodeFilter.SHOW_TEXT);w.nextNode();
   const r=document.createRange();r.setStart(w.currentNode,0);r.setEnd(w.currentNode,Math.min(n,w.currentNode.length));const s=getSelection();s.removeAllRanges();s.addRange(r);t.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}))},[scope,n]);
 await p.goto(BASE);await run(100);await p.waitForTimeout(300);

 await step('all screens load',async()=>{for(const r of ['dashboard','learn','learn/listening','learn/reading','learn/writing','learn/speaking','practice','practice/listening','practice/reading','practice/writing','practice/speaking','review','vocab','grammar','notes','plan','exam','history','settings','diagnostic']){
   await go('#/'+r);const h=await txt('#app h1');ok(!!h,`screen #/${r} has a heading (${(h||'').trim().slice(0,30)})`)}});

 await step('listening quick practice',async()=>{await go('#/practice/listening');await p.click('#quickBtn');await run(50);
   if(await p.$('#playBtn')){await p.click('#playBtn');await run(2000)}
   const n=await p.$$eval('#qForm .question-block',x=>x.length);for(let i=0;i<n;i++)await p.click(`#qForm input[name=q${i}][value="0"]`);
   await p.click('#submitPassage');ok(/correct/.test(await txt('.score-line')||''),'listening: answers checked, score shown');
   ok(await p.$$eval('.explain',x=>x.length)>0,'listening: explanations shown under questions');
   await p.click('#nextPassage');ok((await txt('.result-card h1'))==='Practice Complete','listening: result saved')});

 await step('reading timed section runs out',async()=>{await go('#/practice/reading');await p.click('#timedBtn');await run(1000);
   const t1=await txt('#mcqTimer');await run(55*60*1000+2000);await p.waitForTimeout(100);
   ok(/correct/.test(await txt('.score-line')||''),`reading timed: clock (${t1}) ran out and the passage was checked`);
   ok((await txt('#nextPassage'))==='Finish & See Score','reading timed: only "Finish" offered after time is up');await p.click('#nextPassage');
   const r=await txt('.result-card p');ok(/ \/ \d+ correct/.test(r||''),'reading timed: result counts the skipped passages ('+(r||'').slice(0,40)+')')});

 await step('writing practice',async()=>{await go('#/practice/writing');await p.click('#emailBtn');await run(50);
   await p.fill('#writingArea',('Dear manager, I am writing to explain the problem with my order. '.repeat(14)).trim());
   ok(/words/.test(await txt('#wordCountLabel')||''),'writing: word count updates');await p.click('#submitWriting');
   ok((await txt('#app h2'))==='Self-Assessment','writing: self-assessment shown');await p.check('#checklistForm input >> nth=0');await p.click('#saveWriting');
   ok((await txt('.result-card h1'))==='Practice Saved','writing: result saved')});

 await step('speaking practice with microphone',async()=>{await go('#/practice/speaking');await p.click('#randomBtn');await run(50);
   await p.click('#skipPrep');await run(200);await p.waitForTimeout(400);
   ok((await txt('#recIndicator'))==='Recording...',`speaking: recording started (indicator "${await txt('#recIndicator')}")`);
   ok(await p.evaluate(()=>__live())===1,'speaking: microphone on while recording');
   await p.click('#finishEarly');await run(500);await p.waitForTimeout(600);await run(500);
   ok(!!(await p.$('#app audio')),'speaking: recording can be played back');
   ok(await p.evaluate(()=>__live())===0,'speaking: microphone off after finishing');
   await p.click('#saveSpeaking');ok((await txt('.result-card h1'))==='Practice Saved','speaking: result saved')});

 await step('leaving speaking mid-recording',async()=>{await go('#/practice/speaking');await p.click('#randomBtn');await run(50);await p.click('#skipPrep');await run(200);await p.waitForTimeout(400);
   await go('#/dashboard');await p.waitForTimeout(300);ok(await p.evaluate(()=>__live())===0,`speaking: microphone released after leaving the page (live tracks: ${await p.evaluate(()=>__live())})`)});

 await step('reading: side by side, answered count, highlighter',async()=>{await go('#/practice/reading');await p.click('#quickBtn');await run(50);
   const n=await p.$$eval('#qForm .question-block',x=>x.length);
   ok((await txt('#answeredCount'))===`0 of ${n} answered`,'answered count starts at 0 of '+n);
   await p.click('#qForm input[name=q0][value="1"]');await p.click('#qForm input[name=q0][value="2"]');
   ok((await txt('#answeredCount'))===`1 of ${n} answered`,'answered count: a changed answer still counts once');
   const cols=await p.evaluate(()=>{const a=document.querySelector('.split-passage').getBoundingClientRect(),b=document.querySelector('.split-questions').getBoundingClientRect();return {side:a.right<=b.left,scroll:getComputedStyle(document.querySelector('.split-questions')).overflowY}});
   ok(cols.side&&cols.scroll==='auto','wide screen: passage left, questions right, each scrolls on its own');
   await selectPassage('.split-passage',12);ok(await p.$$eval('mark.hl',m=>m.length)===0,'highlighter: off by default, selecting marks nothing');
   await p.click('[data-hl-toggle]');await selectPassage('.split-passage',12);
   ok(await p.$$eval('mark.hl',m=>m.length)===1,'highlighter: on, a selection is marked ("'+(await txt('mark.hl'))+'")');
   await p.click('mark.hl');ok(await p.$$eval('mark.hl',m=>m.length)===0,'highlighter: tapping a mark removes it');
   await p.setViewportSize({width:390,height:844});await p.waitForTimeout(100);
   ok(await p.evaluate(()=>{const a=document.querySelector('.split-passage').getBoundingClientRect(),b=document.querySelector('.split-questions').getBoundingClientRect();return b.top>=a.bottom-1}),'phone: passage above the questions');
   await p.setViewportSize({width:1280,height:900})});

 await step('timer warnings',async()=>{await go('#/practice/writing');await p.click('#emailBtn');await run(50);
   ok(!(await p.getAttribute('#timerDisplay','data-state')),'timer: plain at the start');
   const state=s=>p.waitForFunction(s=>{const t=document.getElementById('timerDisplay');return t&&t.dataset.state===s?t.textContent:false},s,{timeout:30000,polling:5}).then(h=>h.jsonValue()).catch(()=>null);
   const lowAt=await state('low');ok(!!lowAt&&/^(1:00|0:[1-5]\d)$/.test(lowAt),'timer: "low" in the last minute (from '+lowAt+')');
   ok(/left/.test(await txt('#announcer')||''),'timer: screen reader told "'+(await txt('#announcer'))+'"');
   const critAt=await state('critical');ok(!!critAt&&/^0:(10|0\d)$/.test(critAt),'timer: "critical" in the last 10 seconds (from '+critAt+')');await run(12000)});

 await step('speaking: ring, mic meter, transcripts opt-in',async()=>{await go('#/settings');ok(!(await p.isChecked('#sttToggle')),'transcripts: off by default');
   const sr0=await p.evaluate(()=>__sr);await go('#/practice/speaking');await p.click('#randomBtn');await run(50);
   ok(!!(await p.$('#ringFill')),'speaking: ring timer shown');const off0=await p.$eval('#ringFill',e=>e.style.strokeDashoffset);
   await run(3000);ok(await p.$eval('#ringFill',e=>e.style.strokeDashoffset)!==off0,'speaking: ring moves as time passes');
   await p.click('#skipPrep');await run(200);await p.waitForTimeout(500);
   ok(!(await p.$('#micMeter.hidden')),'speaking: microphone level bars shown while recording');
   ok(await p.$$eval('#micMeter i',b=>b.some(x=>x.style.transform&&x.style.transform!=='scaleY(0.080)')),'speaking: the bars react to the (fake) microphone');
   await p.click('#finishEarly');await run(500);await p.waitForTimeout(600);
   ok(await p.evaluate(()=>__sr)===sr0,'transcripts off: speech recognition never started');ok(/Transcripts are off/.test(await txt('#app')||''),'transcripts off: review says how to turn them on');
   await go('#/settings');await p.check('#sttToggle');ok(/Transcripts on/.test(await txt('#sttMsg')||''),'transcripts: switched on in Settings');
   await go('#/practice/speaking');await p.click('#randomBtn');await run(50);await p.click('#skipPrep');await run(200);await p.waitForTimeout(400);await p.click('#finishEarly');await run(500);await p.waitForTimeout(600);
   ok(await p.evaluate(()=>__sr)===sr0+1,'transcripts on: speech recognition started');
   await go('#/settings');await p.uncheck('#sttToggle');await p.click('#saveSettings');ok(!(await p.evaluate(()=>Storage.getSettings().speechToText)),'transcripts: switched off again, and Save keeps it off')});

 await step('dashboard tiles',async()=>{await go('#/dashboard');ok(await p.$$eval('.bento > .tile',t=>t.length)>=12,'dashboard: tiles shown');
   ok(await p.$$eval('.quick',q=>q.length)===4,'dashboard: quick practice for all four skills');
   const cols=await p.$eval('.bento',e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);ok(cols===4,'dashboard: four columns on a wide screen');
   await p.click('.quick[href="#/practice/speaking"]');await p.waitForTimeout(150);ok(/Speaking Practice/.test(await txt('#app h1')||''),'dashboard: quick practice opens the skill')});

 await step('full timed exam',async()=>{await go('#/exam');await p.click('a[href="#/exam/run"]');await run(100);
   let guard=0;while(/Listening/.test(await txt('.exam-banner')||'')&&guard++<20){await run(13000);await run(120000);await p.waitForTimeout(60);
     if(await p.$('#nextBtn')){await p.click('#qForm input[value="0"] >> nth=0').catch(()=>{});await p.click('#nextBtn');await run(50)}}
   ok(/Reading/.test(await txt('.exam-banner')||''),'exam: listening section done, reading started after '+guard+' passages');
   await p.click('[data-hl-toggle]');await selectPassage('#readingBody',10);await p.click('.tab-btn >> nth=1');await p.click('.tab-btn >> nth=0');
   ok(await p.$$eval('#readingBody mark.hl',m=>m.length)===1,'exam reading: highlight kept after switching tabs');
   const tabs=await p.$$('.tab-btn');for(const t of tabs){await t.click();await p.click('#qForm input[value="1"] >> nth=0')}
   ok(new RegExp('^'+tabs.length+' of \\d+ answered$').test(await txt('#answeredTotal')||''),'exam reading: total answered "'+(await txt('#answeredTotal'))+'"');
   ok(/^1\/\d+$/.test(await txt('#tabCount0')||''),'exam reading: tab shows its own count ('+(await txt('#tabCount0'))+')');
   await p.click('#submitReading');await run(50);
   for(let w=0;w<2;w++){ok(/Writing/.test(await txt('.exam-banner')||''),'exam: writing task '+(w+1));await p.fill('#writingArea','I think the park is the better choice because it helps families and costs less to run. '.repeat(8));
     await p.click('#submitWriting');await p.click('#saveWriting');await run(50)}
   for(let s=0;s<8;s++){ok(/Speaking/.test(await txt('.exam-banner')||''),'exam: speaking task '+(s+1));await p.click('#skipPrep');await run(300);await p.waitForTimeout(300);
     await p.click('#finishEarly');await run(500);await p.waitForTimeout(500);await run(300);await p.click('#saveSpeaking');await run(50)}
   ok((await txt('.result-card h1'))==='Exam Complete','exam: complete, overall '+(await txt('.big-score')));
   ok(await p.evaluate(()=>window.onbeforeunload===null),'exam: leave warning switched off at the end');
   await go('#/history');ok(await p.$$eval('.history-table tbody tr',r=>r.some(x=>/Full exam/.test(x.textContent))),'exam: saved in History')});

 await step('leaving the exam mid-audio',async()=>{await go('#/exam/run');await run(13000);await go('#/dashboard');await run(120000);await p.waitForTimeout(200);
   const h=await txt('#app h1');ok(!/Exam|Listening/i.test(await txt('#app')||'').valueOf()||/desk|Hello/.test(h||''),'');ok(!(await p.$('.exam-banner')),'exam left mid-audio: dashboard not taken over by the exam');
   ok(await p.evaluate(()=>window.onbeforeunload===null),'exam left: leave warning switched off')});

 await step('leaving the exam while audio plays',async()=>{
   // headless Chrome has no voices, so speech ends at once; make it last a minute like a real voice, and fire
   // "error" on cancel as Chrome does when a page stops speech
   await p.evaluate(()=>{let cur=null;speechSynthesis.speak=u=>{cur=u;setTimeout(()=>{if(cur===u){cur=null;u.onend&&u.onend()}},60000)};
     speechSynthesis.cancel=()=>{const u=cur;cur=null;if(u&&u.onerror)u.onerror({error:'interrupted'})}});
   await go('#/exam/run');await run(13000);ok(/Playing/.test(await txt('#examListeningBody')||''),'exam: audio is playing');
   await go('#/dashboard');await run(200000);await p.waitForTimeout(300);
   ok(!(await p.$('.exam-banner')),'exam left while audio played: the exam did not come back over the dashboard');
   ok(await p.evaluate(()=>window.onbeforeunload===null),'exam left while audio played: leave warning off')});
 await step('practice again on the same page',async()=>{await go('#/practice/writing');await p.click('#emailBtn');await p.fill('#writingArea','Short answer for the test.');
   await p.click('#submitWriting');await p.click('#saveWriting');await p.click('.result-card a.btn-primary');await p.waitForTimeout(200);
   ok(/Writing Practice/.test(await txt('#app h1')||''),'"Practice Again" opens the practice page again')});
 await step('review, words, grammar, notes, plan, settings, history, theme',async()=>{
   await go('#/review');if(await p.$('#checkBtn')){await p.click('#rf input >> nth=0');await p.click('#checkBtn');ok((await p.$$eval('#fb .score-line',x=>x.length))===1,'review: answer checked with explanation')}else ok(false,'review: mistakes from wrong answers should be due');
   await go('#/vocab');await p.click('#vStart');await p.click('#rev');await p.click('#yes');ok(/Card 2/.test(await txt('#vArea')||''),'words: card flip and "I knew it" move on');
   await go('#/grammar');await p.click('#app a.card >> nth=0');await run(50);await p.click('#gf input >> nth=0');await p.click('#gCheck');ok(/correct/.test(await txt('#gScore')||''),'grammar: drill checked');
   await go('#/notes');await p.fill('#nLearn','Linking words');await p.click('#nf button[type=submit]');await run(50);ok(/Linking words/.test(await txt('#app')||''),'notes: saved');
   await p.click('[data-del]');await run(50);ok(/No notes yet/.test(await txt('#app')||''),'notes: deleted');
   await go('#/plan');ok(/The week/.test(await txt('#app')||''),'plan: shown');
   await go('#/settings');await p.fill('#nameInput','Kenny');await p.fill('#examDateInput',new Date(Date.now()+50*864e5).toISOString().slice(0,10));await p.click('#saveSettings');await run(50);ok(/Hello, Kenny/.test(await txt('#app h1')||''),'settings: saved and dashboard greets');
   ok(/weeks to go/.test(await txt('#app')||''),'settings: test date gives a weeks-to-go countdown');await go('#/plan');ok(/week/.test(await txt('#app')||''),'plan: shows the countdown with a test date');
   await go('#/history');const n0=await p.$$eval('.history-table tbody tr',x=>x.length);await p.click('.history-table .btn-icon >> nth=0');await run(50);ok((await p.$$eval('.history-table tbody tr',x=>x.length))===n0-1,'history: delete one');
   await p.click('#themeBtn');ok(await p.evaluate(()=>document.documentElement.dataset.theme)==='dark','theme: switches to dark')});

 await step('diagnostic starts each skill',async()=>{for(const s of ['listening','reading','writing','speaking']){await go('#/diagnostic');await p.click(`[data-diag=${s}]`);await run(100);await p.waitForTimeout(100);
   ok(!!(await p.$('#submitPassage,#writingArea,#skipPrep')),'diagnostic: '+s+' starts')}});

 // phone width: nothing wider than the screen
 await step('phone layout',async()=>{await p.setViewportSize({width:390,height:844});const bad=[];
   for(const r of ['dashboard','learn','practice','practice/listening','practice/writing','practice/speaking','review','vocab','grammar','notes','plan','exam','history','settings','diagnostic']){await go('#/'+r);const w=await p.evaluate(()=>document.documentElement.scrollWidth);if(w>392)bad.push(r+':'+w)}
   ok(!bad.length,'phone: no screen wider than the phone'+(bad.length?' ('+bad.join(', ')+')':''))});
 console.log(`\n${fails} failure(s)`);await b.close();process.exit(fails?1:0)})();
