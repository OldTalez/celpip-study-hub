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
Extended 2026-11-05 (Nsikak, T-029 turn A) with checks for the new frame: left menu at 1000px and up, bottom tabs below it
(and the More sheet listing seven pages), the Light / Dark / Auto theme switch (Auto follows the device live), focus mode
(menus hidden, Exit asks first, in practice and in the exam), the contents list in Learn, no sideways scroll on a phone,
and one run with motion switched on so the View Transitions code path is exercised.
Extended 2026-11-05 (Nsikak, T-030 turn 2): projection from the largest single gap (not 4x), whole-number hours, the closed add-time form, on-track words,
the check-in banner (rules, dismiss for today, never blame words), the .ics file (downloaded and parsed), the Home plan card (sample and empty data,
click and Enter open My plan), and the Dashboard -> Home rename.
Extended 2026-11-05 (Nsikak, T-029 turn B) with checks for the practice tools: question dots and the Flag button, time per
question (saved on the attempt), the selection pop-up and notes (including a note made of HTML, which must show as plain
text), "Practise like the real test" and the always-on exam rule, the Writing word bar, the Listening progress bar (with a
stand-in voice that sends boundary events, and one that sends none), toasts, and the Add date button on a phone.
Toasts last 3 seconds and this test makes time run 100 times faster, so a script logs every toast the moment it appears
(window.__toasts) instead of the test racing the fade-out.
Extended 2026-11-05 (Nsikak, T-030 turn 1) with checks for My plan: the prescription functions run in the page with fixed inputs, settings
save and clamp, automatic study-time counting (pauses when hidden or idle), manual time with an HTML note shown as text, the import
cleaners for studyTime and the new settings, and the page sections.
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
 // log every toast as it appears (text|role|class); they fade after 3 s, which is 30 ms here
 await ctx.addInitScript(()=>{window.__toasts=[];document.addEventListener('DOMContentLoaded',()=>{new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.classList&&n.classList.contains('toast'))window.__toasts.push((n.textContent||'')+'|'+(n.getAttribute('role')||'')+'|'+n.className)}))).observe(document.getElementById('toastHost'),{childList:true})})});
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
   await selectPassage('.split-passage',12);await p.click('[data-hl-selection]');
   ok(await p.$$eval('mark.hl',m=>m.length)===1,'highlighter: "Highlight selection" marks the chosen words ("'+(await txt('mark.hl'))+'")');
   await p.click('[data-hl-clear]');ok(await p.$$eval('mark.hl',m=>m.length)===0,'highlighter: Clear highlights removes the mark');
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
   let guard=0,sawL=false;while(/Listening/.test(await txt('.exam-banner')||'')&&guard++<20){await run(13000);await run(120000);await p.waitForTimeout(60);
     if(await p.$('#nextBtn')){if(!sawL){sawL=true;ok(await p.$$eval('.dots .dot',d=>d.length)>0&&!(await p.$('.flag-btn'))&&!(await p.$('.qtime')),'exam listening: question dots shown; flags and the question clock hidden (exam realism is always on)')}
       await p.click('#qForm input[value="0"] >> nth=0').catch(()=>{});await p.click('#nextBtn');await run(50)}}
   ok(/Reading/.test(await txt('.exam-banner')||''),'exam: listening section done, reading started after '+guard+' passages');
   ok(!(await p.$('.hl-bar'))&&!(await p.$('[data-hl-toggle]'))&&!(await p.$('.flag-btn'))&&!(await p.$('.qtime'))&&!(await p.$('.notes-panel')),'exam reading: highlighter, notes, flags and the question clock are not on the page at all');
   await selectPassage('#readingBody',10);await p.waitForTimeout(100);ok(!(await p.$('.sel-pop')),'exam reading: selecting text shows no pop-up');
   ok(await p.$$eval('.dots .dot',d=>d.length)>0,'exam reading: question dots still shown');
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
   const h=await txt('#app h1');ok(!/Exam|Listening/i.test(await txt('#app')||'').valueOf()||/Home|Hello/.test(h||''),'');ok(!(await p.$('.exam-banner')),'exam left mid-audio: dashboard not taken over by the exam');
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
   await go('#/plan');ok(/Your rhythm/.test(await txt('#app')||''),'plan: shown');
   await go('#/settings');await p.fill('#nameInput','Kenny');await p.fill('#examDateInput',new Date(Date.now()+50*864e5).toISOString().slice(0,10));await p.click('#saveSettings');await run(50);ok(/Hello, Kenny/.test(await txt('#app h1')||''),'settings: saved and dashboard greets');
   ok(/weeks to go/.test(await txt('#app')||''),'settings: test date gives a weeks-to-go countdown');await go('#/plan');ok(/week/.test(await txt('#app')||''),'plan: shows the countdown with a test date');
   await go('#/history');const n0=await p.$$eval('.history-table tbody tr',x=>x.length);await p.click('.history-table .btn-icon >> nth=0');await run(50);ok((await p.$$eval('.history-table tbody tr',x=>x.length))===n0-1,'history: delete one');
   });

 await step('diagnostic starts each skill',async()=>{for(const s of ['listening','reading','writing','speaking']){await go('#/diagnostic');await p.click(`[data-diag=${s}]`);await run(100);await p.waitForTimeout(100);
   ok(!!(await p.$('#submitPassage,#writingArea,#skipPrep')),'diagnostic: '+s+' starts')}});

 // ---- T-029 turn A: the new frame (menus, theme, focus mode, contents list) ----
 // vis(): is the element really on screen (not display:none, not visibility:hidden, has size)
 const vis=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return false;const r=e.getBoundingClientRect(),c=getComputedStyle(e);return c.display!=='none'&&c.visibility!=='hidden'&&r.width>0&&r.height>0},sel);
 await step('layout: sidebar from 1000px, bottom tabs below, More sheet',async()=>{
   await p.setViewportSize({width:1280,height:900});await go('#/dashboard');
   ok(await vis('#sidebar')&&!(await vis('#tabBar')),'wide 1280: sidebar visible, bottom tabs hidden');
   ok(await p.$$eval('#mainNav a',a=>a.length)===11,'sidebar lists all 11 pages');
   ok(await p.$eval('#mainNav a[data-section=dashboard]',a=>a.getAttribute('aria-current'))==='page','sidebar: current page has aria-current="page"');
   ok(await p.evaluate(()=>{const n=document.querySelector('nav#mainNav'),t=document.querySelector('.sidebar [data-theme-switch]');return n.getAttribute('aria-label')==='Main'&&t.getBoundingClientRect().bottom<=innerHeight}),'sidebar: Main landmark, and the theme switch fits on screen');
   await p.setViewportSize({width:1000,height:800});await p.waitForTimeout(100);ok(await vis('#sidebar')&&!(await vis('#tabBar')),'exactly 1000px: sidebar');
   await p.setViewportSize({width:999,height:800});await p.waitForTimeout(100);ok(!(await vis('#sidebar'))&&await vis('#tabBar'),'999px: bottom tabs, no sidebar');
   await p.setViewportSize({width:1100,height:800});await p.waitForTimeout(100);
   ok(await p.evaluate(()=>{const s=document.querySelector('.sidebar [data-theme-switch]').getBoundingClientRect(),m=document.querySelector('main#app').getBoundingClientRect();return s.right<=m.left+1}),'1100px: theme switch sits in the sidebar (no wrapped header row)');
   await p.setViewportSize({width:390,height:844});await go('#/dashboard');
   const labels=await p.$$eval('#tabBar a, #tabBar button',x=>x.map(e=>e.textContent.trim()));
   ok(labels.join(',')==='Home,Practice,Review,Exam,More','phone: tabs are '+labels.join(', '));
   ok(await p.$eval('#tabBar a[data-section=dashboard]',a=>a.getAttribute('aria-current'))==='page','phone: current tab has aria-current');
   ok(await p.$$eval('#tabBar a, #tabBar button',x=>x.every(e=>e.getBoundingClientRect().height>=56)),'phone: every tab is 56px or taller');
   await p.click('#moreBtn');await p.waitForTimeout(150);
   ok(await p.$eval('#moreSheet',d=>d.open),'phone: More opens the sheet');
   const more=await p.$$eval('#moreSheet .sheet-list a',x=>x.map(a=>a.textContent.trim()));
   ok(more.join(',')==='Learn,Words,Grammar,Notes,My plan,History,Settings','More lists the 7 pages ('+more.join(', ')+')');
   await p.click('#moreSheet a[data-section=notes]');await p.waitForTimeout(250);
   ok(!(await p.$eval('#moreSheet',d=>d.open))&&await p.evaluate(()=>location.hash)==='#/notes','More: choosing Notes closes the sheet and opens Notes');
   ok(await p.$eval('#moreBtn',b=>b.getAttribute('aria-current'))==='page','More tab is marked current while on a More page');
   await p.setViewportSize({width:1280,height:900})});

 await step('sidebar folds into a hamburger menu (wide screens)',async()=>{
   await p.setViewportSize({width:1440,height:900});await p.evaluate(()=>localStorage.removeItem('celpip_sidebar'));await p.goto(BASE+'#/dashboard');await p.reload();await p.waitForTimeout(400);
   const st=()=>p.evaluate(()=>{const v=s=>{const e=document.querySelector(s);if(!e)return false;const r=e.getBoundingClientRect(),c=getComputedStyle(e);return c.display!=='none'&&c.visibility!=='hidden'&&r.width>0&&r.right>0&&r.top>=0&&r.top<80};return {side:v('#sidebar'),top:v('#topbar'),logo:v('#topbar .brand'),attr:document.documentElement.dataset.sidebar,ml:getComputedStyle(document.querySelector('.content')).marginLeft}});
   let a=await st();ok(a.side&&!a.top&&a.attr==='open','sidebar: open by default; sticky bar hidden');
   ok(await p.$eval('#menuBtn',b=>b.getAttribute('aria-label')==='Hide menu'&&b.getAttribute('aria-expanded')==='true'&&b.getAttribute('aria-controls')==='sidebar'),'sidebar: hamburger says "Hide menu", expanded, controls the sidebar');
   await p.click('#menuBtn');await p.waitForTimeout(500);a=await st();
   ok(!a.side&&a.top&&a.logo&&a.attr==='folded'&&a.ml==='0px','sidebar: folded -> sticky bar with logo shows, content full width');
   ok(await p.$eval('#menuBtnTop',b=>b.getAttribute('aria-label')==='Show menu'&&b.getAttribute('aria-expanded')==='false'&&document.activeElement===b),'sidebar: folded -> "Show menu", collapsed, focus on the toggle');
   await p.evaluate(()=>window.scrollTo(0,1200));await p.waitForTimeout(400);a=await st();ok(a.top&&a.logo,'sidebar: the logo bar stays visible after scrolling');
   await p.evaluate(()=>window.scrollTo(0,0));
   await p.reload();await p.waitForTimeout(400);a=await st();ok(a.attr==='folded'&&!a.side&&a.top,'sidebar: folded choice survives reload');
   await p.focus('#menuBtnTop');let reach=false;for(let i=0;i<40&&!reach;i++){await p.keyboard.press('Tab');reach=await p.evaluate(()=>!!document.activeElement.closest('#sidebar'))}
   ok(!reach,'sidebar: Tab never reaches the folded sidebar');
   await p.goto(BASE+'#/practice');await p.waitForTimeout(300);
   await p.evaluate(()=>Shell.focusMode.enter());await p.waitForTimeout(500);ok(!(await st()).top,'sidebar: focus mode hides the sticky bar');await p.evaluate(()=>Shell.focusMode.exit());await p.waitForTimeout(500);
   await p.click('#menuBtnTop');await p.waitForTimeout(500);a=await st();
   ok(a.side&&!a.top&&a.attr==='open'&&await p.evaluate(()=>document.activeElement.id==='menuBtn'&&localStorage.getItem('celpip_sidebar')==='open'),'sidebar: unfolds, focus returns to the sidebar toggle, saved as open');
   await p.evaluate(()=>localStorage.setItem('celpip_sidebar','banana'));await p.reload();await p.waitForTimeout(300);ok((await st()).attr==='open','sidebar: junk saved value = open');
   await p.evaluate(()=>localStorage.setItem('celpip_sidebar','folded'));await p.setViewportSize({width:390,height:844});await p.reload();await p.waitForTimeout(400);
   ok(await p.evaluate(()=>{const v=s=>{const e=document.querySelector(s);return !!e&&e.getBoundingClientRect().width>0&&getComputedStyle(e).display!=='none'};return !v('#sidebar')&&v('#topbar')&&v('#tabBar')&&!v('#menuBtnTop')&&getComputedStyle(document.querySelector('.content')).marginLeft==='0px'}),'sidebar: below 1000px nothing changes (tab bar and phone top bar, no hamburger)');
   await p.evaluate(()=>localStorage.removeItem('celpip_sidebar'));await p.setViewportSize({width:1440,height:900});await p.reload();await p.waitForTimeout(300)});

 await step('theme: Light / Dark / Auto',async()=>{
   const th=()=>p.evaluate(()=>[document.documentElement.dataset.theme,document.documentElement.dataset.themePref,localStorage.getItem('celpip_theme'),getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()]);
   await p.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});await go('#/settings');
   ok(await p.$$eval('#app [data-theme-set]',b=>b.length)===3,'settings: Light, Dark and Auto options');
   await p.click('.sidebar [role=radio][aria-label=Dark]');let t=await th();ok(t[0]==='dark'&&t[2]==='dark'&&t[3]==='#0a171d','theme: Dark chosen and saved ('+t.join(' ')+')');
   await p.click('.sidebar [role=radio][aria-label=Light]');t=await th();ok(t[0]==='light'&&t[2]==='light'&&t[3]==='#f2f6f8','theme: Light chosen and saved');
   await p.click('#app [role=radio][aria-label="Auto (follow device)"]');t=await th();ok(t[0]==='light'&&t[1]==='auto'&&t[2]==='auto','theme: Auto saved; the device is light so the page is light');
   await p.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});await p.waitForTimeout(100);t=await th();ok(t[0]==='dark'&&t[1]==='auto','theme: Auto follows the device to dark, live');
   await p.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});await p.waitForTimeout(100);t=await th();ok(t[0]==='light','theme: Auto follows the device back to light, live');
   ok(await p.$eval('.sidebar [data-theme-set=auto]',b=>b.getAttribute('aria-checked'))==='true','theme: the chosen option is marked aria-checked');
   await p.focus('.sidebar [data-theme-set=auto]');await p.keyboard.press('ArrowLeft');t=await th();ok(t[2]==='dark','theme: an arrow key moves to the neighbouring option and chooses it');
   // an old saved value keeps working, a junk value means Auto
   await p.evaluate(()=>localStorage.setItem('celpip_theme','dark'));await p.reload();await p.waitForTimeout(400);t=await th();ok(t[0]==='dark'&&t[1]==='dark','theme: an old saved "dark" still works after reload');
   await p.evaluate(()=>localStorage.setItem('celpip_theme','banana'));await p.reload();await p.waitForTimeout(400);t=await th();ok(t[1]==='auto'&&t[0]==='light','theme: an unknown saved value is treated as Auto');
   await p.evaluate(()=>localStorage.setItem('celpip_theme','auto'));await p.reload();await p.waitForTimeout(400);
   // icon buttons: every option has an accessible name and tooltip, and no visible Light/Dark/Auto words in the sidebar switch
   ok(await p.$$eval('[data-theme-set]',bs=>bs.length>=6&&bs.every(b=>b.getAttribute('aria-label')&&b.title===b.getAttribute('aria-label')&&b.querySelector('svg')&&!b.textContent.trim())),'theme icons: every option has an aria-label, a matching tooltip, an icon and no text');
   ok(JSON.stringify(await p.$$eval('.sidebar [data-theme-set]',bs=>bs.map(b=>b.getAttribute('aria-label'))))==='["Light","Dark","Auto (follow device)"]','theme icons: names are Light, Dark, Auto (follow device)');
   ok(await p.evaluate(()=>{const w=document.querySelector('.sidebar [data-theme-switch]');const l=w.querySelector('.seg-label'),r=l.getBoundingClientRect();return l.textContent==='Theme'&&r.width<=1&&!/Light|Dark|Auto/.test(w.innerText)}),'theme icons: sidebar switch shows no words, "Theme" label kept for screen readers');
   ok(await p.evaluate(()=>{const l=document.querySelector('#app .seg-label');return !!l&&l.getBoundingClientRect().width>10}),'theme icons: Settings still shows the visible "Theme" label');
   ok(await p.$$eval('.sidebar [data-theme-set]',bs=>bs.every(b=>{const r=b.getBoundingClientRect();return r.width>=36&&r.height>=44})),'theme icons: sidebar targets are at least 44px tall');
   const phc=await b.newContext({viewport:{width:390,height:844}});const ph=await phc.newPage();await ph.goto(BASE+'#/dashboard');await ph.evaluate(()=>localStorage.setItem('celpip_theme','light'));await ph.reload();await ph.waitForTimeout(400);
   const pb=()=>ph.$eval('#themeBtn',e=>[e.getAttribute('aria-label'),e.querySelector('use').getAttribute('href')].join('|'));
   const seq=[await pb()];for(let i=0;i<3;i++){await ph.click('#themeBtn');await ph.waitForTimeout(150);seq.push(await pb())}
   ok(seq.join(' ; ')==='Theme: Light, change|#i-sun ; Theme: Dark, change|#i-moon ; Theme: Auto, change|#i-theme ; Theme: Light, change|#i-sun','phone theme button: icon and label follow Light > Dark > Auto > Light ('+seq.join(' ; ')+')');
   ok(await ph.$eval('#themeBtn',e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44}),'phone theme button is at least 44px');
   await phc.close()});

 await step('focus mode in practice',async()=>{
   await go('#/practice/reading');ok(!(await vis('#exitBtn')),'focus: no Exit button on the practice menu page');
   await p.click('#quickBtn');await run(50);await p.waitForTimeout(200);
   ok(await p.evaluate(()=>document.body.dataset.mode)==='focus','focus: a practice run sets focus mode');
   ok(!(await vis('#sidebar'))&&await vis('#exitBtn'),'focus: menus hidden, Exit shown');
   await p.keyboard.press('Escape');await p.waitForTimeout(150);ok(await p.$eval('#confirmDlg',d=>d.open),'focus: Esc asks before leaving');
   await p.click('#confirmKeep');await p.waitForTimeout(150);
   ok(!(await p.$eval('#confirmDlg',d=>d.open))&&await p.evaluate(()=>document.body.dataset.mode)==='focus','focus: "Keep going" stays in the run');
   ok(await p.evaluate(()=>document.activeElement&&document.activeElement.id)==='exitBtn','focus: after staying, focus returns to Exit');
   await p.click('#exitBtn');await p.waitForTimeout(150);ok(await p.$eval('#confirmDlg',d=>d.open),'focus: Exit asks first');
   await p.click('#confirmDlg button[value=leave]');await p.waitForTimeout(250);
   ok((await p.evaluate(()=>document.body.dataset.mode||''))===''&&await vis('#sidebar')&&/Reading Practice/.test(await txt('#app h1')||''),'focus: Leave goes back to the practice page with the menu back');
   ok(await p.evaluate(()=>window.onbeforeunload===null),'focus: leave warning off after leaving');
   await p.click('#quickBtn');await run(50);await p.click('#submitPassage');await p.click('#nextPassage');
   ok((await p.evaluate(()=>document.body.dataset.mode||''))===''&&(await txt('.result-card h1'))==='Practice Complete','focus: a finished practice shows the menus again')});

 await step('focus mode in the exam, Exit asks first',async()=>{
   await go('#/exam');await p.click('a[href="#/exam/run"]');await run(100);await p.waitForTimeout(200);
   ok(await p.evaluate(()=>document.body.dataset.mode)==='focus','exam: focus mode on');
   ok(await p.evaluate(()=>typeof window.onbeforeunload==='function'),'exam: tab-close warning still set');
   await p.click('#exitBtn');await p.waitForTimeout(150);ok(await p.$eval('#confirmDlg',d=>d.open),'exam: Exit asks before leaving');
   ok(/Leave the exam/.test(await txt('#confirmTitle')||''),'exam: the question names the exam');
   await p.click('#confirmKeep');await p.waitForTimeout(150);
   ok(!!(await p.$('.exam-banner'))&&await p.evaluate(()=>document.body.dataset.mode)==='focus','exam: "Keep going" stays in the exam');
   await p.click('#exitBtn');await p.waitForTimeout(150);await p.click('#confirmDlg button[value=leave]');await run(100);await p.waitForTimeout(250);
   ok((await p.evaluate(()=>location.hash))==='#/exam'&&!(await p.$('.exam-banner'))&&(await p.evaluate(()=>document.body.dataset.mode||''))==='','exam: Leave returns to the exam page, menus back');
   ok(await p.evaluate(()=>window.onbeforeunload===null),'exam: leave warning cleared after leaving')});

 await step('learn: contents list',async()=>{
   await p.setViewportSize({width:1280,height:700});await go('#/learn/reading');
   const n=await p.$$eval('.toc a',a=>a.length);ok(n>=4,'learn: contents list has '+n+' entries built from the headings');
   ok(await p.$eval('.toc',d=>d.open),'learn: contents list open on a wide screen');
   ok((await p.$eval('.toc',e=>getComputedStyle(e).position))==='sticky','learn: contents list is sticky on a wide screen');
   const last=await p.$eval('.toc li:last-child a',a=>a.dataset.tocLink);
   await p.click('.toc li:last-child a');await p.waitForTimeout(500);
   ok(await p.evaluate(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.top>=0&&r.top<innerHeight},last)&&(await p.$eval('.toc li:last-child a',a=>a.getAttribute('aria-current')))==='location','learn: choosing the last entry jumps to its heading and marks it current');
   ok((await p.evaluate(()=>location.hash))==='#/learn/reading','learn: the jump did not change the page address');
   await p.click('.toc li:nth-child(2) a');await p.waitForTimeout(300);
   ok(await p.evaluate(()=>document.querySelector('details.model').open),'learn: choosing a part opens it');
   await p.setViewportSize({width:390,height:844});await go('#/learn/reading');
   ok(!(await p.$eval('.toc',d=>d.open)),'learn: on a phone the contents list starts collapsed');
   ok(await p.evaluate(()=>{const t=document.querySelector('.toc').getBoundingClientRect(),h=document.querySelector('.lesson-main').getBoundingClientRect();return t.top<h.top}),'learn: on a phone the contents list sits above the lesson');
   await p.click('.toc summary');ok(await p.$eval('.toc',d=>d.open),'learn: "On this page" opens on a phone');
   await p.setViewportSize({width:1280,height:900})});

 await step('phone: a practice run fits the screen',async()=>{await p.setViewportSize({width:390,height:844});
   await go('#/practice/reading');await p.click('#quickBtn');await run(50);await p.waitForTimeout(200);
   ok(await p.evaluate(()=>document.documentElement.scrollWidth)<=392,'phone: the reading run has no sideways scroll');
   ok(!(await vis('#tabBar')),'phone: tab bar hidden during a run');
   await p.setViewportSize({width:1280,height:900})});

 await step('screen changes with motion switched on (View Transitions)',async()=>{
   const c2=await b.newContext({viewport:{width:1280,height:900}});const q=await c2.newPage();const e2=[];q.on('pageerror',e=>e2.push(e.message));q.on('console',m=>{if(m.type()==='error')e2.push(m.text())});
   await q.goto(BASE);await q.waitForTimeout(500);
   const has=await q.evaluate(()=>!!document.startViewTransition);
   await q.click('#mainNav a[data-section=learn]');await q.waitForTimeout(900);
   ok(/Learn/.test(await q.$eval('#app h1',e=>e.textContent)),'motion on: sidebar link opens Learn ('+(has?'View Transitions available':'View Transitions not available, plain switch')+')');
   ok(await q.evaluate(()=>!document.documentElement.classList.contains('vt-route')),'motion on: transition class removed afterwards');
   await q.click('#mainNav a[data-section=practice]');await q.waitForTimeout(900);
   ok(/Practice/.test(await q.$eval('#app h1',e=>e.textContent)),'motion on: a second change works');
   await q.click('.sidebar [data-theme-set=dark]');await q.waitForTimeout(500);ok((await q.evaluate(()=>document.documentElement.dataset.theme))==='dark','motion on: theme change works');
   ok(!e2.length,'motion on: no page errors'+(e2.length?' ('+e2[0]+')':''));await c2.close()});

 // ===== T-029 turn B: practice tools =====
 // selects characters a to b of the passage text (counted across all its text pieces) and tells the page the mouse was let go
 const selectChars=(a,b)=>p.evaluate(([a,b])=>{const t=document.querySelector('.passage-text');const w=document.createTreeWalker(t,NodeFilter.SHOW_TEXT);let pos=0,n,r=document.createRange(),s=false;
   while((n=w.nextNode())){const L=n.nodeValue.length;if(!s&&a<pos+L){r.setStart(n,a-pos);s=true}if(s&&b<=pos+L){r.setEnd(n,b-pos);break}pos+=L}
   const sel=getSelection();sel.removeAllRanges();sel.addRange(r);t.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}))},[a,b]);
 const startReading=async()=>{await go('#/practice/reading');await p.click('#quickBtn');await run(50);await p.waitForTimeout(250)};
 const toasts=()=>p.evaluate(()=>window.__toasts.slice());

 await step('tools: question dots, flag, "This question" clock',async()=>{await startReading();
   const n=await p.$$eval('#qForm .question-block',x=>x.length);
   ok(await p.$$eval('.dots .dot',d=>d.length)===n,'dots: one per question ('+n+')');
   ok(await p.$eval('.dot[data-q="0"]',d=>d.getAttribute('aria-current'))==='step','dots: the first question is the current one (aria-current)');
   ok(await p.$$eval('.dot.ans',d=>d.length)===0,'dots: none answered at the start');
   const bb=await (await p.$('.dot[data-q="0"]')).boundingBox();ok(Math.round(bb.width)===36&&Math.round(bb.height)===36,'dots: drawn 36px ('+bb.width+')');
   ok(await p.$eval('.dot[data-q="0"]',d=>getComputedStyle(d,'::after').position)==='absolute','dots: a 44px hit area around each dot');
   ok(/Filled: answered/.test(await txt('.dot-key')||'')&&/Flag badge/.test(await txt('.dot-key')||''),'dots: a key says what filled, ring, outline and badge mean');
   await p.click('#qForm input[name=q1][value="0"]');
   ok(await p.$eval('.dot[data-q="1"]',d=>d.classList.contains('ans')&&/, answered/.test(d.getAttribute('aria-label'))),'dots: answering fills the dot and its label says "answered"');
   ok(await p.$eval('.dot[data-q="1"]',d=>d.getAttribute('aria-current'))==='step'&&!(await p.$eval('.dot[data-q="0"]',d=>d.hasAttribute('aria-current'))),'dots: answering makes that question the current one');
   ok((await txt('#answeredCount'))===`1 of ${n} answered`,'dots: the one answered counter still reads "1 of '+n+' answered"');
   await p.click('#qForm input[name=q1][value="1"]');ok(await p.$$eval('.dot.ans',d=>d.length)===1,'dots: changing an answer does not fill a second dot');
   const fb='.question-block[data-qi="2"] .flag-btn';
   ok(await p.$eval(fb,b=>b.getAttribute('aria-pressed'))==='false'&&(await txt(fb))==='Flag for review','flag: starts off, button says "Flag for review"');
   await p.click(fb);
   ok(await p.$eval(fb,b=>b.getAttribute('aria-pressed'))==='true'&&(await txt(fb))==='Flagged','flag: pressing it sets aria-pressed and the words change to "Flagged"');
   ok(await p.$eval('.dot[data-q="2"]',d=>getComputedStyle(d.querySelector('.fl')).display==='block'&&/flagged for review/.test(d.getAttribute('aria-label'))),'flag: the dot gets a badge and says "flagged for review"');
   await p.click(fb);ok(await p.$eval('.dot[data-q="2"]',d=>!d.classList.contains('flagged')),'flag: pressing again takes the flag off');
   await p.click(fb);
   if(n>=4){await p.click('.dot[data-q="3"]');await p.waitForTimeout(150);
     ok(await p.evaluate(()=>document.activeElement&&document.activeElement.dataset.qi)==='3','dots: clicking a dot moves focus to that question');
     ok(await p.$eval('.question-block[data-qi="3"]',b=>{const r=b.getBoundingClientRect(),c=b.closest('.split-questions').getBoundingClientRect();return r.top>=c.top-2&&r.top<c.bottom}),'dots: and scrolls it into view in the questions column');
     ok(await p.$eval('.dot[data-q="3"]',d=>d.getAttribute('aria-current'))==='step','dots: the clicked dot becomes current')}
   ok(/^\d+:\d\d$/.test(await txt('#qTime')||''),'clock: "This question" shows '+(await txt('#qTime')));
   ok(/This question/.test(await txt('.qtime')||''),'clock: labelled "This question" beside the timer area');
   await p.setViewportSize({width:390,height:844});await p.waitForTimeout(150);
   ok(await p.evaluate(()=>document.documentElement.scrollWidth)<=392,'phone: dots and flag fit, no sideways scroll');
   await p.setViewportSize({width:1280,height:900})});

 await step('tools: time per question is saved on the attempt',async()=>{await startReading();
   await p.waitForTimeout(2100);ok(/^0:0[2-4]$/.test(await txt('#qTime')||''),'timing: the question clock counts real seconds ('+(await txt('#qTime'))+')');
   await p.click('.dot[data-q="1"]');await p.waitForTimeout(1100);
   await p.click('#submitPassage');await p.click('#nextPassage');
   const last=await p.evaluate(()=>{const h=Storage.getHistory();return h[h.length-1]});
   const t=last.timing;
   ok(!!t&&Array.isArray(t.perQuestionSec)&&t.perQuestionSec.length===last.total,'timing: saved on the attempt with one number per question ('+(t&&t.perQuestionSec.length)+' for '+last.total+' questions)');
   ok(t&&t.perQuestionSec[0]>=2&&t.perQuestionSec[1]>=1&&t.perQuestionSec.every(x=>Number.isInteger(x)&&x>=0),'timing: question 1 got '+(t&&t.perQuestionSec[0])+' s, question 2 got '+(t&&t.perQuestionSec[1])+' s');
   ok(t&&t.totalSec===t.perQuestionSec.reduce((a,b)=>a+b,0)&&t.perPassageSec.length===1&&t.perPassageSec[0]===t.totalSec,'timing: totalSec ('+(t&&t.totalSec)+') is the sum; one passage entry');
   const ex=await p.evaluate(()=>{const h=Storage.getHistory().filter(x=>x.type==='exam');return h[h.length-1]});
   ok(!!ex&&ex.timing&&ex.timing.perQuestionSec.length===ex.breakdown.listening.total+ex.breakdown.reading.total,'timing: the full exam saved timing for every Listening and Reading question ('+(ex&&ex.timing&&ex.timing.perQuestionSec.length)+')');
   await go('#/history');ok(await p.$$eval('.history-table tr',r=>r.length)>1,'timing: History still shows attempts that carry timing')});

 await step('tools: selection pop-up, highlight, notes',async()=>{await startReading();
   await p.evaluate(()=>{window.__alerts=0;window.alert=()=>{window.__alerts++};window.__imgs=document.querySelectorAll('img').length});
   const inView=()=>p.$eval('.sel-pop',e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight});
   await selectChars(20,32);await p.waitForTimeout(150);
   ok(await p.$eval('.sel-pop',e=>!e.hidden&&e.getAttribute('role')==='toolbar'&&[...e.querySelectorAll('button')].map(b=>b.textContent).join()==='Highlight,Add note'),'pop-up: selecting words shows a toolbar with Highlight and Add note');
   ok(await inView(),'pop-up: placed inside the window');
   ok(await p.$eval('.sel-pop',e=>{const s=getSelection().getRangeAt(0).getBoundingClientRect(),r=e.getBoundingClientRect();return r.bottom<=s.top+1||r.top>=s.bottom-1}),'pop-up: sits above (or below) the words, not on top of them');
   await p.keyboard.press('Escape');await p.waitForTimeout(100);
   ok(await p.$eval('.sel-pop',e=>e.hidden)&&!(await p.$eval('#confirmDlg',d=>d.open)),'pop-up: Esc closes it and does not open the Exit question');
   ok(await p.$$eval('mark.hl',m=>m.length)===0,'pop-up: nothing was marked by opening it');
   await selectChars(20,32);await p.waitForTimeout(150);await p.click('.sel-pop button:has-text("Highlight")');
   ok(await p.$$eval('mark.hl',m=>m.length)>=1&&await p.$$eval('mark.has-note',m=>m.length)===0,'pop-up: Highlight marks the selection');
   ok(await p.$$eval('.note-list li',l=>l.length)===1&&/Remove highlight/.test(await txt('.note-list li')||''),'notes list: the highlight is listed under the passage');
   await p.click('.note-list button:has-text("Remove highlight")');ok(await p.$$eval('mark.hl',m=>m.length)===0&&await p.$$eval('.note-list li',l=>l.length)===0,'notes list: Remove highlight takes it away');
   // a note made of HTML
   const evil='<img src=x onerror=alert(1)>';
   await selectChars(20,32);await p.waitForTimeout(150);await p.click('.sel-pop button:has-text("Add note")');
   ok(await p.evaluate(()=>document.activeElement&&document.activeElement.tagName)==='TEXTAREA'&&await p.$eval('.sel-pop textarea',t=>t.maxLength)===280,'note: the box opens with focus in it and a 280 character limit');
   ok(/0 of 280/.test(await txt('.note-form span.small')||''),'note: a counter says "0 of 280 characters"');
   await p.fill('.sel-pop textarea',evil);await p.click('.sel-pop button:has-text("Save")');await p.waitForTimeout(100);
   ok(await p.$$eval('mark.has-note',m=>m.length)>=1,'note: Add note marks the words and attaches the note');
   ok((await txt('.note-list .note-text'))===evil,'note (HTML): shown in the list as the literal text "'+evil+'"');
   ok(await p.evaluate(()=>document.querySelectorAll('img').length===window.__imgs&&window.__alerts===0),'note (HTML): no <img> element was added and no script ran');
   ok(await p.$$eval('.note-list *',all=>all.every(e=>['LI','SPAN','P','BUTTON'].includes(e.tagName))),'note (HTML): the list holds only our own elements');
   ok(!(await p.evaluate(()=>Object.keys(localStorage).some(k=>(localStorage.getItem(k)||'').includes('onerror')))),'note: not written to localStorage (history, settings, backup)');
   ok((await toasts()).some(t=>/^Note saved\|\|/.test(t)),'toast: "Note saved" appeared');
   await p.mouse.move(2,2);await p.hover('mark.has-note');await p.waitForTimeout(150);
   ok(await p.$eval('.note-tip',(e,ev)=>!e.hidden&&e.textContent===ev&&e.children.length===0&&e.getAttribute('role')==='tooltip',evil),'note: hovering the mark shows the note as plain text in a tooltip '+JSON.stringify(await p.$eval('.note-tip',e=>[e.hidden,e.textContent,e.children.length,e.getAttribute('role')])));
   ok(await p.evaluate(()=>{const m=document.querySelector('mark.has-note');return m.getAttribute('tabindex')==='0'&&!m.outerHTML.includes('onerror')}),'note: the mark can be reached with Tab and carries no note text in its attributes');
   await p.mouse.move(5,5);
   // edit: a 400 character note is cut to 280
   await p.click('.note-list button:has-text("Edit note")');
   ok(await p.$eval('.sel-pop textarea',t=>t.value)===evil,'note: Edit note opens the box with the saved text');
   await p.$eval('.sel-pop textarea',t=>{t.value='x'.repeat(400);t.dispatchEvent(new Event('input'))});  /* set directly: a typed note is stopped by maxlength, a pasted or scripted one by the cap in the save code */ await p.click('.sel-pop button:has-text("Save")');await p.waitForTimeout(100);
   ok((await txt('.note-list .note-text')||'').length===280,'note: a 400 character note is cut to 280 ('+((await txt('.note-list .note-text'))||'').length+')');
   await p.click('mark.has-note');await p.waitForTimeout(100);
   ok(await p.$eval('.sel-pop textarea',t=>t.value.length)===280,'note: clicking the marked words opens the note for editing');
   await p.keyboard.press('Escape');await p.waitForTimeout(100);
   ok(await p.$eval('.sel-pop',e=>e.hidden)&&await p.$$eval('mark.has-note',m=>m.length)>=1,'note: Esc cancels the edit and keeps the note');
   await p.click('.note-list button:has-text("Delete note")');await p.waitForTimeout(100);
   ok(await p.$$eval('mark.has-note',m=>m.length)===0&&await p.$$eval('mark.hl',m=>m.length)>=1&&await p.$$eval('.note-text',m=>m.length)===0,'note: Delete note removes the note and keeps the highlight');
   ok((await toasts()).some(t=>/^Note deleted\|\|/.test(t)),'toast: "Note deleted" appeared');
   await p.click('[data-hl-clear]');ok(await p.$$eval('mark.hl',m=>m.length)===0,'notes: Clear highlights empties the passage');
   // keyboard route
   await selectChars(40,55);await p.waitForTimeout(150);await p.focus('.split-passage');await p.keyboard.press('Tab');
   ok(await p.evaluate(()=>document.activeElement.closest('.sel-pop')!==null),'keyboard: Tab from the passage reaches the pop-up '+JSON.stringify(await p.evaluate(()=>[document.activeElement.outerHTML.slice(0,70),document.querySelector('.sel-pop').hidden,String(getSelection()).length])));
   await p.keyboard.press('ArrowRight');ok((await p.evaluate(()=>document.activeElement.textContent))==='Add note','keyboard: arrow keys move between its buttons');
   await p.keyboard.press('Escape');await p.waitForTimeout(100);
   ok(await p.evaluate(()=>document.activeElement.classList.contains('split-passage'))&&await p.$eval('.sel-pop',e=>e.hidden),'keyboard: Esc closes it and focus goes back to the passage');
   await selectChars(40,55);await p.click('[data-hl-selection]');ok(await p.$$eval('mark.hl',m=>m.length)>=1,'keyboard: the "Highlight selection" button does the same as the pop-up');
   await p.evaluate(()=>getSelection().removeAllRanges());await p.click('[data-hl-selection]');
   ok((await toasts()).some(t=>/Select some words/.test(t)),'toast: "Highlight selection" with nothing selected says what to do');
   // pop-up on a phone stays inside the screen, even at the left edge
   await p.setViewportSize({width:390,height:844});await p.waitForTimeout(150);
   await selectChars(0,6);await p.waitForTimeout(200);ok(await inView(),'phone: the pop-up stays inside the screen at the left edge of the passage');
   await selectChars(300,330);await p.waitForTimeout(200);ok(await inView(),'phone: and further down the passage');
   await p.keyboard.press('Escape');
   await p.setViewportSize({width:1280,height:900});
   await selectChars(20,32);await p.waitForTimeout(150);await go('#/dashboard');await p.waitForTimeout(150);
   ok(!(await p.$('.sel-pop'))&&!(await p.$('.note-tip')),'pop-up: left behind by no screen (gone after leaving the passage)')});

 await step('tools: Practise like the real test',async()=>{
   await go('#/settings');ok(!(await p.isChecked('#realismToggle')),'realism: off by default in Practice');
   await p.check('#realismToggle');await p.waitForTimeout(100);
   ok(await p.evaluate(()=>Storage.getSettings().examRealism===true),'realism: switch saved in settings at once');
   ok((await toasts()).some(t=>/Practising like the real test/.test(t)),'toast: realism switch change confirmed');
   ok(/Practise like the real test: hide highlighter, notes and flags/.test(await txt('#realismToggle ~ .sw-text')||''),'realism: switch labelled as in the brief');
   await startReading();
   ok(!(await p.$('.hl-bar'))&&!(await p.$('.flag-btn'))&&!(await p.$('.qtime'))&&!(await p.$('.notes-panel')),'realism on: highlighter, notes, flags and the question clock are not drawn');
   ok(await p.$$eval('.dots .dot',d=>d.length)>0&&!/Flag badge/.test(await txt('.dot-key')||''),'realism on: dots stay, the key drops the flag badge');
   await selectChars(20,32);await p.waitForTimeout(150);ok(!(await p.$('.sel-pop')),'realism on: selecting words shows no pop-up');
   await go('#/practice/listening');await p.click('#quickBtn');await run(50);
   if(await p.$('#playBtn')){await p.evaluate(()=>{speechSynthesis.speak=u=>{window.__u=u}});await p.click('#playBtn');await p.evaluate(()=>window.__u.onend());
     ok(await p.$eval('#playBtn',b=>b.disabled)&&/once/.test(await txt('#audioStatus')||''),'realism on: the audio plays once, no replay')}
   await p.evaluate(()=>Storage.saveSettings({...Storage.getSettings(),examRealism:false}));
   await startReading();ok(!!(await p.$('.hl-bar'))&&!!(await p.$('.flag-btn')),'realism off again: tools are back')});

 await step('tools: exam reading keeps marks, notes and flags between tabs (with the exam rule switched off for this test)',async()=>{
   await p.evaluate(()=>{EXAM_REALISM.alwaysOn=false});
   await go('#/exam');await p.click('a[href="#/exam/run"]');await run(100);
   let g=0;while(/Listening/.test(await txt('.exam-banner')||'')&&g++<20){await run(13000);await run(120000);await p.waitForTimeout(60);
     if(await p.$('#nextBtn')){await p.click('#nextBtn');await run(50)}}
   ok(/Reading/.test(await txt('.exam-banner')||'')&&!!(await p.$('.hl-bar')),'exam (rule off): reading shows the tools');
   await p.click('#qForm input[name=q0][value="1"]');
   await selectChars(10,22);await p.waitForTimeout(100);await p.click('.sel-pop button:has-text("Highlight")');
   await selectChars(40,55);await p.waitForTimeout(100);await p.click('.sel-pop button:has-text("Add note")');await p.fill('.sel-pop textarea','keep me');await p.click('.sel-pop button:has-text("Save")');
   await p.click('.question-block[data-qi="1"] .flag-btn');
   await p.click('.tab-btn >> nth=1');await p.click('.tab-btn >> nth=0');await p.waitForTimeout(150);
   ok(await p.$$eval('#readingBody mark.hl',m=>m.length)>=2,'exam (rule off): highlights kept after switching tabs');
   ok((await txt('.note-list .note-text'))==='keep me'&&await p.$$eval('mark.has-note',m=>m.length)>=1,'exam (rule off): the note is kept after switching tabs');
   ok(await p.$eval('.question-block[data-qi="1"] .flag-btn',b=>b.getAttribute('aria-pressed'))==='true'&&await p.$eval('.dot[data-q="1"]',d=>d.classList.contains('flagged')),'exam (rule off): the flag is kept after switching tabs');
   ok(await p.$eval('.dot[data-q="0"]',d=>d.classList.contains('ans')),'exam (rule off): the answered dot is kept after switching tabs');
   ok(await p.$$eval('.qtime',q=>q.length)===1,'exam (rule off): switching tabs leaves one "This question" clock, not several');
   await p.evaluate(()=>{EXAM_REALISM.alwaysOn=true});await go('#/dashboard');await run(100)});

 await step('tools: word-count bar in Writing',async()=>{await go('#/practice/writing');await p.click('#emailBtn');await run(50);
   const [lo,hi]=await p.$eval('#wordBar',b=>[+b.dataset.lo,+b.dataset.hi]);
   ok(lo>0&&hi>lo&&await p.$eval('.wbar-range',r=>parseFloat(r.style.width)>0),'word bar: the target range ('+lo+' to '+hi+') is marked on the bar');
   ok(await p.$eval('#wordBar',b=>b.dataset.state)==='under'&&/Under by/.test(await txt('#wordBarStatus')||''),'word bar: empty says "'+(await txt('#wordBarStatus'))+'"');
   const w=n=>'word '.repeat(n);
   await p.fill('#writingArea',w(lo-10));ok(await p.$eval('#wordBar',b=>b.dataset.state)==='under'&&/Under by 10/.test(await txt('#wordBarStatus')||''),'word bar: '+(lo-10)+' words is Under by 10');
   const f1=await p.$eval('.wbar-fill',f=>f.style.transform);
   await p.fill('#writingArea',w(lo));ok(await p.$eval('#wordBar',b=>b.dataset.state)==='in'&&/In range/.test(await txt('#wordBarStatus')||''),'word bar: '+lo+' words is "In range"');
   ok(await p.$eval('.wbar-fill',f=>getComputedStyle(f).backgroundColor)!==await p.$eval('.wbar-track',t=>getComputedStyle(t).backgroundColor)&&f1!==await p.$eval('.wbar-fill',f=>f.style.transform),'word bar: the fill grew and turned to the "good" colour');
   ok(await p.$eval('.wbar-track',t=>t.getAttribute('aria-valuenow'))===String(lo)&&/in range/.test(await p.$eval('.wbar-track',t=>t.getAttribute('aria-valuetext'))),'word bar: progressbar value and spoken text updated');
   ok(await p.$eval('#wordBarStatus',s=>getComputedStyle(s,'::before').content!=='none'),'word bar: "In range" has a check icon too (not colour alone)');
   await p.fill('#writingArea',w(hi));ok(await p.$eval('#wordBar',b=>b.dataset.state)==='in','word bar: the top of the range ('+hi+') is still in range');
   await p.fill('#writingArea',w(hi+12));ok(await p.$eval('#wordBar',b=>b.dataset.state)==='over'&&/Over by 12/.test(await txt('#wordBarStatus')||''),'word bar: '+(hi+12)+' words is "Over by 12"');
   ok(/words/.test(await txt('#wordCountLabel')||''),'word bar: the old word count line still updates');
   await p.setViewportSize({width:390,height:844});await p.waitForTimeout(100);ok(await p.evaluate(()=>document.documentElement.scrollWidth)<=392,'phone: the word bar fits');
   await p.setViewportSize({width:1280,height:900})});

 await step('tools: Listening progress bar',async()=>{await go('#/practice/listening');await p.click('#quickBtn');await run(50);await p.waitForTimeout(200);
   if(!(await p.$('#playBtn'))){ok(true,'listening bar: browser has no speech voice, bar not applicable');return}
   ok(await p.$eval('#listenBar',b=>b.hidden),'listening bar: hidden before the audio plays');
   // a stand-in voice: it keeps the utterance so the test can send boundary events by hand
   await p.evaluate(()=>{speechSynthesis.speak=u=>{window.__u=u;window.__len=u.text.length}});
   await p.click('#playBtn');
   ok(await p.$eval('#listenBar',b=>!b.hidden)&&await p.$eval('#listenBar [role=progressbar]',t=>t.getAttribute('aria-valuenow'))==='0','listening bar: shows at 0 when the audio starts');
   await p.evaluate(()=>window.__u.onboundary({charIndex:Math.floor(window.__len/2)}));
   const v=+await p.$eval('#listenBar [role=progressbar]',t=>t.getAttribute('aria-valuenow'));
   ok(v>=48&&v<=51,'listening bar: a boundary event half way through the script puts the bar at '+v+'%');
   ok(/^\d+:\d\d of \d+:\d\d$/.test(await txt('#listenBar .pbar-time')||''),'listening bar: time readout "'+(await txt('#listenBar .pbar-time'))+'"');
   await p.evaluate(()=>window.__u.onend());
   ok(await p.$eval('#listenBar [role=progressbar]',t=>t.getAttribute('aria-valuenow'))==='100','listening bar: 100% when the audio ends');
   // no boundary events: falls back to elapsed time against the estimate
   await go('#/practice/listening');await p.click('#quickBtn');await run(50);await p.waitForTimeout(200);
   await p.evaluate(()=>{speechSynthesis.speak=u=>{window.__u=u};window.__realNow=Date.now;});
   await p.click('#playBtn');
   await p.evaluate(()=>{const r=window.__realNow;Date.now=()=>r()+8000});await p.waitForTimeout(150);
   const f=+await p.$eval('#listenBar [role=progressbar]',t=>t.getAttribute('aria-valuenow'));
   await p.evaluate(()=>{Date.now=window.__realNow});
   ok(f>0&&f<96,'listening bar: with no boundary events the bar still moves, by elapsed time ('+f+'% after a pretend 8 s)');
   await p.evaluate(()=>window.__u.onend());
   // exam playing screen has the bar too
   await go('#/exam/run');await run(13000);await p.waitForTimeout(100);
   ok(!!(await p.$('#examListeningBody #listenBar')),'listening bar: also on the exam audio screen');
   await go('#/dashboard')});

 await step('tools: toasts',async()=>{
   ok(await p.$eval('#toastHost',h=>h.getAttribute('role'))==='status','toast: the message box is role=status');
   const r=await p.evaluate(()=>{toast('First');toast('Second');const h=document.getElementById('toastHost'),t=h.querySelector('.toast');
     return {n:h.children.length,text:t.textContent,icon:!!t.querySelector('.toast-ico'),dur:getComputedStyle(t).transitionDuration,role:t.getAttribute('role')}});
   ok(r.n===1&&r.text==='Second','toast: one at a time, a new one replaces the old');
   ok(r.icon&&r.text.length>0,'toast: an icon and words (not colour alone)');
   ok(/^0(ms|s)/.test(r.dur),'toast: with reduced motion there is no animation ('+r.dur+')');
   await p.waitForTimeout(250);ok(await p.$$eval('#toastHost .toast',t=>t.length)===0,'toast: fades away by itself');
   const e=await p.evaluate(()=>{toast('Could not do that','error');const t=document.querySelector('#toastHost .toast');return {role:t.getAttribute('role'),btn:!!t.querySelector('button')}});
   await p.waitForTimeout(300);
   ok(e.role==='alert'&&e.btn&&await p.$$eval('#toastHost .toast',t=>t.length)===1,'toast: an error is role=alert, has a Dismiss button and stays');
   await p.click('#toastHost .toast button');await p.waitForTimeout(150);ok(await p.$$eval('#toastHost .toast',t=>t.length)===0,'toast: Dismiss removes it');
   await p.evaluate(()=>toast('<b>x</b>'));ok(await p.$eval('#toastHost',h=>h.querySelectorAll('b').length)===0,'toast: message shown as text, not as HTML');
   await go('#/settings');await p.fill('#nameInput','Ada');await p.click('#saveSettings');await p.waitForTimeout(250);
   ok((await toasts()).some(t=>/^Settings saved\|\|/.test(t)),'toast: "Settings saved"');
   await go('#/settings');await p.check('#sttToggle');await p.uncheck('#sttToggle');
   ok((await toasts()).some(t=>/Transcripts off/.test(t))&&(await toasts()).some(t=>/Transcripts on/.test(t)),'toast: transcript setting changes are confirmed');
   await p.click('#exportBtn');await p.waitForTimeout(100);ok((await toasts()).some(t=>/Backup exported/.test(t))&&/downloads/.test(await txt('#dataMsg')||''),'toast: backup exported (and the line under the buttons says so too)');
   await p.setInputFiles('#importFile',{name:'bad.json',mimeType:'application/json',buffer:Buffer.from('not json')});await p.waitForTimeout(250);
   ok((await toasts()).some(t=>/could not be read.*\|alert\|/.test(t))&&/could not be read/.test(await txt('#dataMsg')||''),'toast: a bad backup file gives an error toast (role=alert) and the line');
   await p.evaluate(()=>{const b=JSON.stringify(Storage.exportAll());window.__bk=b});
   await p.setInputFiles('#importFile',{name:'ok.json',mimeType:'application/json',buffer:Buffer.from(await p.evaluate(()=>window.__bk))});await p.waitForTimeout(250);
   ok((await toasts()).some(t=>/Backup imported/.test(t)),'toast: backup imported');
   await go('#/history');await p.click('.history-table .btn-icon >> nth=0');await p.waitForTimeout(100);
   ok((await toasts()).some(t=>/Attempt deleted/.test(t)),'toast: history item deleted')});

 await step('phone: the Add date button fits on one line',async()=>{
   await p.evaluate(()=>Storage.saveSettings({...Storage.getSettings(),examDate:''}));
   await p.setViewportSize({width:390,height:844});await go('#/dashboard');await p.waitForTimeout(200);
   const b=await p.$('.tile a.btn[href="#/settings"]');const box=b&&await b.boundingBox();
   ok(!!box&&box.height<=48&&box.x+box.width<=390,'phone: "Add date" is one line ('+(box&&Math.round(box.height))+'px tall)');
   ok(/Add date/.test(await b.textContent())&&await b.getAttribute('aria-label')==='Add your test date','phone: short label, full name for screen readers');
   await p.setViewportSize({width:1280,height:900})});

 // phone width: nothing wider than the screen
 await step('phone layout',async()=>{await p.setViewportSize({width:390,height:844});const bad=[];
   for(const r of ['dashboard','learn','practice','practice/listening','practice/writing','practice/speaking','review','vocab','grammar','notes','plan','exam','history','settings','diagnostic']){await go('#/'+r);const w=await p.evaluate(()=>document.documentElement.scrollWidth);if(w>392)bad.push(r+':'+w)}
   ok(!bad.length,'phone: no screen wider than the phone'+(bad.length?' ('+bad.join(', ')+')':''))});
 // turn C: dashboard radar, pace, mastery grid; toolbar; toast on navigation
 await step('dashboard: radar, pace, mastery, polish',async()=>{
   await p.setViewportSize({width:1440,height:1000});
   const snap=await p.evaluate(()=>JSON.stringify(Object.assign({},localStorage)));
   await p.evaluate(()=>{Storage.clearHistory();localStorage.removeItem('celpip_partstats_v1')});
   await go('#/dashboard');
   ok(await p.$$eval('.tile-pace #paceNum',e=>e.length)===0&&/No timing yet/.test(await txt('.tile-pace')||''),'pace: empty state before any timed attempt');
   {const e=await p.evaluate(()=>{const s=document.querySelector('svg.radar');return s?{none:[...s.querySelectorAll('.rd-none')].map(x=>x.textContent).join(),nums:s.querySelectorAll('.rd-num').length,tg:!!s.querySelector('.rd-target'),aria:s.getAttribute('aria-label')}:null});
   ok(/No results yet/.test(await txt('.tile-radar')||'')&&!!e&&e.none==='no score,no score,no score,no score'&&e.nums===0&&e.tg&&/No scores yet/.test(e.aria)&&/Target/.test(e.aria),'radar: empty state draws the chart with 4 "no score" labels, target outline, no invented values');
   await p.click('#radarStart');await p.waitForTimeout(300);
   ok(/#\/practice/.test(p.url()),'radar: empty-state button opens Practice');await go('#/dashboard');}
   await p.evaluate(()=>{
     const t=(a)=>({totalSec:a.reduce((x,y)=>x+y,0),perQuestionSec:a,perPassageSec:[a.reduce((x,y)=>x+y,0)]});
     Storage.saveAttempt({type:'practice',skill:'reading',mode:'mcq',correct:6,total:8,pct:75,clb:8,timing:t([60,70,65,60,75,70,60,60])});
     Storage.saveAttempt({type:'practice',skill:'listening',mode:'mcq',correct:5,total:8,pct:62,clb:6,timing:t([70,60,0,65,60,70,65,60])});
     Storage.saveAttempt({type:'practice',skill:'writing',mode:'writing',clb:7});
     Storage.set('partStats',{'listening|1':{right:9,total:10},'listening|2':{right:3,total:8},'reading|1':{right:7,total:10},'reading|4':{right:5,total:6}});
   });
   await go('#/dashboard');await p.waitForTimeout(300);
   const rd=await p.evaluate(()=>{const s=document.querySelector('svg.radar');return {role:s.getAttribute('role'),aria:s.getAttribute('aria-label'),names:[...s.querySelectorAll('.rd-name')].map(e=>e.textContent),nums:[...s.querySelectorAll('.rd-num')].map(e=>e.textContent),none:[...s.querySelectorAll('.rd-none')].map(e=>e.textContent),dash:getComputedStyle(s.querySelector('.rd-target')).strokeDasharray,rings:s.querySelectorAll('.rd-ring').length,ringn:[...s.querySelectorAll('.rd-ringn')].map(e=>e.textContent).join()}});
   ok(rd.role==='img'&&rd.names.join()==='Listening,Reading,Writing,Speaking','radar: role=img, four arms in fixed order ('+rd.names+')');
   ok(rd.nums.join()==='6,8,7'&&rd.none.join()==='no score','radar: numbers on the arms ('+rd.nums+') and "no score" for Speaking');
   ok(/Speaking no score yet, drawn at 0/.test(rd.aria)&&/Listening 6/.test(rd.aria),'radar: aria-label lists the values and says no-score is drawn at 0');
   ok(rd.dash!=='none'&&rd.rings===4&&rd.ringn==='3,6,9,12','radar: dashed target outline and rings 3,6,9,12 ('+rd.dash+')');
   ok(await p.$eval('#radarTable',e=>e.hidden),'radar: table hidden until asked');
   await p.click('#radarTableBtn');
   const tb=await p.$$eval('#radarTable tbody tr',r=>r.map(x=>[...x.children].map(c=>c.textContent)));
   ok(await p.$eval('#radarTableBtn',b=>b.getAttribute('aria-expanded'))==='true'&&tb.length===4&&tb[0][1]==='6'&&tb[1][1]==='8'&&tb[2][1]==='7'&&tb[3][1]==='no score','table fallback lists the same numbers ('+tb.map(r=>r[0]+' '+r[1])+')');
   const pc=await txt('.tile-pace');
   ok(await p.$eval('#paceNum',e=>parseInt(e.textContent))===65&&/On pace/.test(pc),'pace: shows the average (65 s, zero left out) and "On pace" in words');
   ok(/your guide: 90s/.test(pc),'pace: the guide value is printed');
   const cells=await p.$$eval('.mg-cell',c=>c.map(x=>x.textContent));
   ok(cells.length===10&&cells.every(t=>/%|n\/a/.test(t)),'mastery: 10 cells, each prints a value ('+cells.join(' | ')+')');
   ok(cells[0]==='90%10 q'&&cells[1]==='38%8 q','mastery: percent and question count per part');
   await p.click('.mg-cell[data-skill="reading"][data-part="4"]');await p.waitForTimeout(300);
   ok(await p.$$eval('.question-block',q=>q.length)>0&&await p.evaluate(()=>document.body.dataset.mode==='focus'),'mastery: clicking a cell starts that part (practice screen with questions, focus mode)');
   // toolbar
   ok(await p.$$eval('.hl-bar button',b=>b.map(x=>x.textContent).join())==='Highlight selection,Clear highlights','toolbar: reduced to Highlight selection and Clear highlights');
   // toast does not follow the learner to the next screen
   await p.evaluate(()=>toast('Could not do that','error'));await p.waitForTimeout(400);
   await go('#/plan');ok(await p.$$eval('#toastHost .toast',t=>t.length)===0,'toast: cleared when the screen changes');
   // screenshots and phone
   const shot=async n=>{if(SHOTS)await p.screenshot({path:SHOTS+n,fullPage:true})};
   await p.evaluate(()=>localStorage.setItem('celpip_theme','light'));await p.reload();await go('#/dashboard');await p.waitForTimeout(300);await shot('dash-1440-light.png');
   await p.evaluate(()=>localStorage.setItem('celpip_theme','dark'));await p.reload();await go('#/dashboard');await p.waitForTimeout(300);await shot('dash-1440-dark.png');
   await p.evaluate(()=>localStorage.setItem('celpip_theme','light'));await p.reload();
   await p.setViewportSize({width:390,height:844});await go('#/dashboard');await p.waitForTimeout(300);await shot('dash-390-light.png');
   ok(await p.evaluate(()=>document.documentElement.scrollWidth)<=392,'phone: dashboard with all new tiles has no sideways scroll');
   await p.evaluate(s=>{localStorage.clear();const o=JSON.parse(s);for(const k in o)localStorage.setItem(k,o[k])},snap);
   await p.setViewportSize({width:1280,height:900})});

 // turn C extra: a crafted backup must not put markup on the page (Inyene's Low finding on Storage.importAll)
 await step('import: crafted backup is cleaned',async()=>{
   const snap=await p.evaluate(()=>JSON.stringify(Object.assign({},localStorage)));
   const bad={history:[{id:'"><img src=x onerror=window.__pwn=1>',type:'practice',skill:'reading',pct:'<img src=x onerror=window.__pwn=1>',clb:'7',date:new Date().toISOString()},
     {id:'a_1730000000000_abc123',type:'practice',skill:'reading',pct:'<b>9</b>',clb:'8',date:new Date().toISOString()},
     {id:'a_1730000000001_abc124',type:'exam',date:new Date().toISOString()}],
     settings:{targetCLB:'<img src=x onerror=window.__pwn=1>',hoursPerWeek:'x',sessionMin:'<svg onload=window.__pwn=1>',name:'Ada'}};
   await p.evaluate(()=>{window.__pwn=0});await go('#/settings');
   await p.setInputFiles('#importFile',{name:'crafted.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(bad))});await p.waitForTimeout(300);
   const st=await p.evaluate(()=>({h:Storage.getHistory(),s:Storage.getSettings()}));
   ok(st.h.length===1&&st.h[0].id==='a_1730000000000_abc123'&&typeof st.h[0].clb==='number','import: entries with a bad id, or an exam with no breakdown, are dropped ('+st.h.length+' kept)');
   ok(!('pct' in st.h[0]),'import: a non-number pct is removed');
   ok(st.s.targetCLB===9&&st.s.hoursPerWeek===8&&st.s.sessionMin===75,'import: settings numbers are coerced to numbers in range ('+st.s.targetCLB+','+st.s.hoursPerWeek+','+st.s.sessionMin+')');
   for(const r of ['#/history','#/plan','#/settings','#/dashboard'])await go(r);
   ok(!(await p.evaluate(()=>window.__pwn))&&await p.$$eval('img[src="x"]',i=>i.length)===0,'import: no script ran and no injected element on History, Plan, Settings or Dashboard');
   await p.evaluate(s=>{localStorage.clear();const o=JSON.parse(s);for(const k in o)localStorage.setItem(k,o[k])},snap)});

 // turn C follow-up: every imported store is cleaned (Inyene's second finding)
 await step('import: crafted stores are cleaned',async()=>{
   const snap=await p.evaluate(()=>JSON.stringify(Object.assign({},localStorage)));
   const X='"><img src=x onerror=window.__pwn=1>';
   const bad={history:[{id:'a_1730000000000_abc123',type:'practice',skill:'reading',date:new Date().toISOString()},{id:X,type:'practice',skill:'reading',clb:5,date:new Date().toISOString()}],
     partStats:{'reading|1':{right:3,total:4},[X+'|1']:{right:1,total:2},'reading|2':{right:X,total:9},'listening|9':{right:5,total:2}},
     mistakes:{'reading|r1|0':{skill:'reading',pid:'r1',qi:0,part:1,box:X,due:'2026-11-01',wrong:1},['x|'+X+'|0']:{skill:X,pid:X,due:X}},
     vocab:{[X]:{box:1,due:'2026-11-01'},w1:{box:X,due:'2026-11-01'},w2:{box:2,due:X}},
     grammar:{g1:X,[X]:3},
     log:[{id:'n_'+X,date:'2026-11-01',minutes:X,skill:X},{id:'n_1730000000000',date:'2026-11-01',minutes:'20',skill:X,learned:X}]};
   await p.evaluate(()=>{window.__pwn=0});await go('#/settings');
   await p.setInputFiles('#importFile',{name:'crafted2.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(bad))});await p.waitForTimeout(300);
   ok(/\d+ entries skipped/.test(await txt('#dataMsg')||'')&&(await toasts()).some(t=>/Backup imported; \d+ entries skipped\|\|/.test(t)),'import: the message and the toast say how many entries were skipped ('+(await txt('#dataMsg'))+')');
   const st=await p.evaluate(()=>({ps:Storage.get('partStats',{}),mi:Storage.get('mistakes',{}),vo:Storage.get('vocab',{}),gr:Storage.get('grammar',{}),lg:Storage.get('log',[]),h:Storage.getHistory()}));
   ok(Object.keys(st.ps).join()==='reading|1'&&Object.keys(st.mi).join()==='reading|r1|0'&&st.mi['reading|r1|0'].box===0,'import: partStats and mistakes keep only well-formed entries, box coerced');
   ok(Object.keys(st.vo).join()==='w1'&&st.vo.w1.box===0&&Object.keys(st.gr).length===0,'import: vocab and grammar keep only well-formed entries');
   ok(st.lg.length===1&&st.lg[0].minutes===20&&st.lg[0].id==='n_1730000000000','import: the study log keeps only the well-formed note (id pattern, minutes number)');
   ok(st.h.length===1&&st.h[0].clb===null,'import: a missing level stays null, not 0');
   for(const r of ['#/dashboard','#/review','#/vocab','#/grammar','#/notes','#/history','#/plan','#/settings'])await go(r);
   await go('#/dashboard');
   ok(/no score/.test(await txt('.tile-radar')||'')&&!!(await p.$('.bento')),'import: the dashboard still renders and the radar shows no score (not 0) for the missing level');
   ok(!(await p.evaluate(()=>window.__pwn))&&await p.$$eval('img[src="x"]',i=>i.length)===0,'import: no script ran and no element was injected on any screen');
   await p.evaluate(s=>{localStorage.clear();const o=JSON.parse(s);for(const k in o)localStorage.setItem(k,o[k])},snap)});

 // T-030 turn 1: My plan
 await step('my plan: engine, settings, time tracking, page',async()=>{
   const snap=await p.evaluate(()=>JSON.stringify(Object.assign({},localStorage)));
   await p.evaluate(()=>{localStorage.clear()});
   // nav label
   await p.setViewportSize({width:1280,height:900});await go('#/dashboard');
   ok(/^\s*My plan\s*$/.test(await p.$eval('#sidebar a[data-section="plan"]',e=>e.textContent).catch(()=>'')||''),'nav: the Plan link now reads "My plan"');
   // engine, with fixed inputs
   const E=await p.evaluate(()=>{const P=Prescription;const out={};
     const sh=P.skillShares({listening:9,reading:9,writing:9,speaking:5},9);out.sh=sh.shares;
     out.eq=P.skillShares({},9);out.miss=P.skillShares({listening:7,reading:8,writing:6,speaking:null},9).missing;
     out.w10=P.weeklyMinutes({hoursPerWeek:10});out.w4=P.schedule({hoursPerWeek:4,studyDays:[1,3,5]},sh.shares);
     out.bad=P.cleanDays([1,'x',9,1.5,1,0,-1]);
     const t=new Date();const iso=n=>{const d=new Date(t.getTime()+n*864e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
     const today=iso(0);const L7={listening:7,reading:7,writing:7,speaking:7};
     out.pr=P.projection({targetCLB:9,hoursPerWeek:8,examDate:iso(70)},L7,today);
     out.prShort=P.projection({targetCLB:9,hoursPerWeek:2,examDate:iso(21)},L7,today);
     out.prMore=P.projection({targetCLB:9,hoursPerWeek:16,examDate:iso(70)},L7,today);
     out.noScore=P.projection({targetCLB:9,hoursPerWeek:8,examDate:iso(70)},{},today);
     out.noDate=P.projection({targetCLB:9,hoursPerWeek:8},L7,today);
     const sched=P.schedule({hoursPerWeek:8,studyDays:[0,1,2,3,4,5,6]},P.skillShares(L7,9).shares);
     const tpl=s=>[{min:40,text:'Q',href:'#/practice/'+s},{min:10,text:'V',href:'#/vocab'},{min:20,text:'N',href:'#/notes'},{min:20,text:'D',href:'#/dashboard'}];
     out.today=P.todayTasks(sched,today,{reading:tpl('reading'),listening:tpl('listening'),writing:tpl('writing'),speaking:tpl('speaking')});
     out.rev=[P.reviewSpacing(100).nextReviewDays,P.reviewSpacing(3).nextReviewDays,P.reviewSpacing(1000).nextReviewDays];
     out.mock=[P.mockPlan(today,iso(10),iso(-3),true).kind,P.mockPlan(today,iso(1),null,true).kind,P.mockPlan(today,iso(10),null,false).kind,P.mockPlan(today,iso(10),iso(-3),true).dueInDays];
     return out});
   const sum=Object.values(E.sh).reduce((a,b)=>a+b,0);
   ok(Math.abs(sum-1)<1e-9&&E.sh.speaking>E.sh.reading&&Math.min(...Object.values(E.sh))>=0.1-1e-9,'engine: shares add to 1, the weakest skill gets most, nobody under the 10% floor ('+JSON.stringify(E.sh)+')');
   ok(E.eq.equal&&E.miss.join()==='speaking','engine: no scores gives an equal split; a missing skill is named');
   ok(E.w10===600&&E.w4.weeklyMin===240&&E.w4.sessionMin===80&&E.w4.days.length===3,'engine: hoursPerWeek is used (10 h = 600 min; 4 h over 3 days = 80 min sessions)');
   ok(E.bad.join()==='1,0','engine: bad study days are dropped ('+E.bad+')');
   ok(E.pr.hoursNeeded.join()==='100,300'&&E.pr.projected.low<=E.pr.projected.high&&/not official/i.test(E.pr.label),'engine: projection is a range from 50 to 150 hours a step (largest single gap of 2 steps -> '+E.pr.hoursNeeded+'), labelled "not official"');
   ok(E.pr.neededPerWeek&&E.pr.neededPerWeek[0]<E.pr.neededPerWeek[1]&&E.prMore.projected.high>=E.pr.projected.high,'engine: hours-a-week needed is a range, and more hours never lowers the projection');
   ok(E.prShort.timeStatus==='short'&&E.prShort.messages.some(m=>/short/.test(m)),'engine: flags a test date too close for the gap');
   ok(E.noScore.missing.includes('scores')&&E.noScore.messages.some(m=>/No scores/.test(m))&&!E.noScore.projected,'engine: no scores says what is missing, no guess');
   ok(E.noDate.missing.includes('test date')&&E.noDate.messages.some(m=>/No test date/.test(m))&&!E.noDate.projected&&E.noDate.hoursNeeded.length===2,'engine: no test date says so and gives no projection');
   ok(E.today.isStudyDay&&E.today.retrievalShare>=60,'engine: today\'s tasks keep at least 60% retrieval ('+E.today.retrievalShare+'%)');
   ok(E.rev.join()==='14,1,14'&&E.mock.slice(0,3).join()==='mock,none,diagnostic'&&E.mock[3]===4,'engine: review gap clamps 1 to 14 days; mock cadence (every 14 days, none in the last 2, diagnostic first) ('+E.rev+' / '+E.mock+')');
   // settings: save and clamp
   await go('#/settings');await p.check('input[name="studyDay"][value="1"]');await p.check('input[name="studyDay"][value="3"]');await p.fill('#studyTimeInput','07:30');await p.fill('#sessionInput','9999');await p.click('#saveSettings');await run(50);
   let st=await p.evaluate(()=>Storage.getSettings());
   ok(st.studyDays.join()==='1,3'&&st.studyTime==='07:30'&&st.sessionMin===240,'settings: study days and time saved; a session of 9999 minutes is clamped to 240 ('+st.studyDays+' '+st.studyTime+' '+st.sessionMin+')');
   await go('#/settings');ok(await p.isChecked('input[name="studyDay"][value="3"]')&&!(await p.isChecked('input[name="studyDay"][value="2"]')),'settings: the saved days show ticked again');
   // seed sample results so the page has scores, then draw it
   await p.evaluate(()=>{const d=n=>new Date(Date.now()-n*864e5).toISOString();Storage.saveSettings({...Storage.getSettings(),hoursPerWeek:8,targetCLB:9,examDate:new Date(Date.now()+60*864e5).toISOString().slice(0,10)});
     localStorage.setItem('celpip_history_v1',JSON.stringify([{id:'a_1730000000001_aaa111',type:'practice',skill:'reading',mode:'mcq-timed',pct:85,clb:8,date:d(1)},{id:'a_1730000000002_aaa112',type:'practice',skill:'listening',pct:62,clb:7,date:d(2)},{id:'a_1730000000003_aaa113',type:'practice',skill:'writing',mode:'writing',clb:6,date:d(0)}]));
     Storage.set('partStats',{'listening|1':{right:9,total:10},'listening|2':{right:3,total:10}})});
   await go('#/plan');const pg=await txt('#app')||'';
   ok(['This week','Today','Projection','Milestones','Your rhythm'].every(h=>new RegExp(h).test(pg)),'my plan: all five sections render');
   ok(/Planning estimate, not official/.test(pg)&&/hours a week/.test(pg)&&/CLB \d/.test(pg),'my plan: the projection shows ranges and the "not official" label');
   ok(/Listening part 1: 75% or better/.test(pg)&&/Done/.test(pg)&&/Not yet/.test(pg),'my plan: milestones show progress from history and part stats');
   ok(/Speaking has no score yet/.test(pg),'my plan: the unscored skill is named, not guessed');
   ok((await p.$$eval('#app h1',h=>h.map(x=>x.textContent).join()))==='My plan','my plan: page title is "My plan"');
   // manual time and an HTML note
   await p.evaluate(()=>{window.__pwn=0;window.alert=()=>{window.__pwn=1}});
   await p.click('#addTimeDetails summary');await p.fill('#addMin','25');await p.selectOption('#addSkill','general');await p.fill('#addNote','<img src=x onerror=alert(1)>');await p.click('#addTimeBtn');await p.waitForTimeout(250);
   const lt=await txt('#manualList')||'';
   ok(lt.includes('<img src=x onerror=alert(1)>')&&(await p.$$eval('#app img',i=>i.length))===0&&!(await p.evaluate(()=>window.__pwn)),'manual time: an HTML note shows as plain text and does not run');
   let td=await p.evaluate(()=>Storage.get('studyTime',null));const tday=await p.evaluate(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')});
   ok(td.days[tday].general>=25&&td.manual.length===1,'manual time: 25 minutes stored for today under General');
   await p.click('#addTimeDetails summary');await p.evaluate(()=>{document.getElementById('addTimeForm').noValidate=true});await p.fill('#addMin','0');await p.click('#addTimeBtn');await p.waitForTimeout(100);
   ok(/whole number from 1 to 600/.test(await txt('#addTimeMsg')||'')&&(await p.evaluate(()=>Storage.get('studyTime',null).manual.length))===1,'manual time: 0 minutes is refused with a message');
   await p.fill('#addMin','10');await p.fill('#addNote','x'.repeat(300));await p.click('#addTimeBtn');await p.waitForTimeout(250);
   td=await p.evaluate(()=>Storage.get('studyTime',null));
   ok(td.manual.length===2&&td.manual.every(e=>e.note.length<=140),'manual time: a 300-character note is cut to 140');
   // automatic counting
   await p.evaluate(()=>localStorage.removeItem('celpip_studytime_v1'));await p.mouse.move(10,10);await p.mouse.move(40,40);
   await go('#/practice/reading');await p.mouse.move(60,60);await p.waitForTimeout(700);await p.mouse.move(20,20);await p.waitForTimeout(300);
   const auto=await p.evaluate(()=>{const t=Storage.get('studyTime',null);const d=t&&Object.values(t.days)[0];return d&&d.reading||0});
   ok(auto>0,'auto time: minutes counted on a practice screen ('+auto+' min, ticks run fast in this test)');
   const gate=await p.evaluate(()=>{const T=Study.tracker;T.noteActivity();const n=Date.now();const r={};
     r.idle=T.tick(n+T.IDLE_MS+60000,false);r.hidden=T.tick(n,true);r.active=T.tick(n,false);r.skill=[T.skillFor('practice/writing'),T.skillFor('review'),T.skillFor('settings'),T.skillFor('learn/listening/x')];return r});
   ok(gate.idle===false&&gate.hidden===false&&gate.active===true,'auto time: nothing counted when idle for over 2 minutes or when the tab is hidden');
   ok(gate.skill.join()==='writing,general,,listening','auto time: screens map to skills');
   await go('#/settings');const before=await p.evaluate(()=>JSON.stringify(Storage.get('studyTime',null)));await p.mouse.move(100,100);await p.waitForTimeout(400);
   ok(before===await p.evaluate(()=>JSON.stringify(Storage.get('studyTime',null))),'auto time: nothing counted on the Settings screen');
   // import cleaner
   const X='"><img src=x onerror=window.__pwn=1>';
   const bad={settings:{studyDays:[1,'x',9,1.5,1,3],studyTime:'<b>07:30</b>',examDate:X,name:'A'.repeat(200),targetCLB:9},
     studyTime:{days:{'2026-11-01':{reading:'20',general:99999,[X]:5},[X]:{reading:5},'2026-11-02':'x'},manual:[{id:'m_1730000000000',date:'2026-11-01',skill:'reading',minutes:'15',note:X+'y'.repeat(300)},{id:X,date:'2026-11-01',skill:'reading',minutes:5},{id:'m_2',date:'2026-11-01',skill:X,minutes:5},{id:'m_3',date:'2026-11-01',skill:'reading',minutes:-4}]}};
   await p.evaluate(()=>{window.__pwn=0});await go('#/settings');
   await p.setInputFiles('#importFile',{name:'crafted3.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(bad))});await p.waitForTimeout(300);
   const im=await p.evaluate(()=>({s:Storage.getSettings(),t:Storage.get('studyTime',null)}));
   ok(im.s.studyDays.join()==='1,3'&&im.s.studyTime===''&&im.s.examDate===''&&im.s.name.length===60,'import: bad study days, time, test date and an over-long name are cleaned ('+im.s.studyDays+')');
   ok(Object.keys(im.t.days).join()==='2026-11-01'&&im.t.days['2026-11-01'].reading===20&&im.t.days['2026-11-01'].general===1440&&Object.keys(im.t.days['2026-11-01']).length===2,'import: studyTime days keep only valid dates, known skills, clamped minutes');
   ok(im.t.manual.length===1&&im.t.manual[0].minutes===15&&im.t.manual[0].note.length===140,'import: studyTime manual entries keep only well-formed ones, note cut to 140');
   ok(await p.evaluate(()=>'studyTime' in Storage.exportAll()),'export: the backup includes studyTime');
   for(const r of ['#/plan','#/settings','#/dashboard'])await go(r);
   ok(!(await p.evaluate(()=>window.__pwn))&&await p.$$eval('img[src="x"]',i=>i.length)===0,'import: no script ran and no element injected on My plan, Settings or Dashboard');
   await p.evaluate(s=>{localStorage.clear();const o=JSON.parse(s);for(const k in o)localStorage.setItem(k,o[k])},snap)});

 // T-030 turn 2: on-track, check-in, calendar file, Home card
 await step('my plan turn 2: engine',async()=>{
   await p.setViewportSize({width:1280,height:900});await go('#/dashboard');
   const E=await p.evaluate(()=>{const P=Prescription,o={};
     const eq=P.skillShares({},9).shares;const sched=P.schedule({hoursPerWeek:6,studyDays:[1,3,5]},eq);o.sess=sched.sessionMin;
     const dn=t=>({listening:0,reading:0,writing:0,speaking:0,general:0,total:t});
     o.t240=P.onTrack(sched,eq,dn(240),'2026-11-05').overall;o.t150=P.onTrack(sched,eq,dn(150),'2026-11-05').overall;o.t60=P.onTrack(sched,eq,dn(60),'2026-11-05').overall;o.mon=P.onTrack(sched,eq,dn(0),'2026-11-02').overall;
     o.sk=P.onTrack(sched,eq,Object.assign(dn(0),{reading:60}),'2026-11-05').skills;
     const L7={listening:7,reading:7,writing:7,speaking:7};
     o.p7=P.projection({targetCLB:9,hoursPerWeek:8,examDate:'2027-01-14'},L7,'2026-11-05');
     o.pU=P.projection({targetCLB:9,hoursPerWeek:8,examDate:'2027-01-14'},{listening:7,reading:8,writing:6,speaking:7},'2026-11-05');
     o.nice=[P.niceHours(44.4),P.niceHours(0.44),P.niceHours(133.3)];
     const ch=(days,studied,first)=>P.checkIn(P.schedule({hoursPerWeek:6,studyDays:days},eq),new Set(studied),'2026-11-05',first);
     o.many=ch([1,3,5],['2026-10-28'],'2026-10-28');o.one=ch([1,3,5],['2026-11-02'],'2026-10-20');o.none=ch([1,3,5],['2026-11-04'],'2026-10-20');o.never=ch([1,3,5],[],null);o.unchosen=ch([],['2026-10-28'],'2026-10-28');
     o.nx=[P.nextSession(sched,'07:30',new Date(2026,10,5,8,0)),P.nextSession(P.schedule({hoursPerWeek:6,studyDays:[4]},eq),'07:30',new Date(2026,10,5,8,0)),P.nextSession(P.schedule({hoursPerWeek:6,studyDays:[4]},eq),'09:00',new Date(2026,10,5,8,0))].map(x=>x&&x.daysAway);
     return o});
   ok(E.sess===120&&E.t240.status==='ontrack'&&E.t150.status==='little'&&E.t150.text==='A little behind: 90 min to catch up'&&E.t60.status==='behind'&&E.t60.text==='Behind: 180 min to catch up'&&E.mon.status==='ontrack'&&E.t240.text==='On track','on track: words by thresholds (80% / 50% of the minutes planned before today); Monday never reads behind ('+E.t150.text+' | '+E.t60.text+')');
   ok(E.sk.reading.status==='ontrack'&&E.sk.writing.status==='behind'&&/min to catch up/.test(E.sk.writing.text),'on track: per skill ('+E.sk.reading.text+' | '+E.sk.writing.text+')');
   ok(E.p7.hoursNeeded.join()==='100,300'&&E.p7.hoursNeeded[1]*3<=1200&&E.p7.hoursNeeded[1]<1200/3.5,'projection: turn-1 sample (all CLB 7, target 9) gives 100 to 300 hours, not the old 400 to 1200 (4x)');
   ok(E.pU.stepsToTarget===3&&E.pU.hoursNeeded.join()==='150,450','projection: uneven levels use the largest single gap (3 steps -> 150 to 450 hours)');
   ok([...E.p7.hoursNeeded,...E.p7.neededPerWeek,E.p7.availableHours,E.p7.weeksLeft,...E.pU.neededPerWeek].every(Number.isInteger)&&E.nice.join()==='44,0.4,133','projection: hours, hours a week and weeks are whole numbers (neededPerWeek '+E.p7.neededPerWeek+'); under 1 keeps one decimal');
   ok(E.many.kind==='many'&&E.many.missed.length===3&&E.many.catchUp.length<=3&&E.many.catchUp.every(c=>c.extraMin<=30&&c.extraMin>0),'check-in: 2 or more missed days give a catch-up over at most 3 days, at most +25% a day (+30 of 120 min) ('+JSON.stringify(E.many.catchUp.map(c=>c.extraMin))+')');
   ok(E.one.kind==='one'&&E.one.missed.length===1&&E.one.catchUp.length===0&&E.none.kind==='none'&&E.never.kind==='none'&&E.unchosen.kind==='none','check-in: one missed day keeps the streak (no catch-up); nothing missed, never studied, or no chosen days gives no banner');
   ok(E.nx.join()==='1,7,0','next session: skips a time that has passed today ('+E.nx+')');
   const C=await p.evaluate(()=>{const o={};o.esc=CalendarExport.escapeText('a,b;c\\d\ne');
     const long='SUMMARY:'+'é'.repeat(60)+'x'.repeat(100);const f=CalendarExport.foldLine(long);o.fold=f.split('\r\n').every(l=>new TextEncoder().encode(l).length<=75);o.unfold=f.replace(/\r\n /g,'')===long;
     const sched=Prescription.schedule({hoursPerWeek:6,studyDays:[1]},Prescription.skillShares({},9).shares);
     const r=CalendarExport.buildIcs({sched,settings:{studyTime:'',examDate:''},today:'2026-11-05',now:new Date(2026,10,5,8,0),focusName:()=>'A,B;C\nINJECT:1',tasksFor:()=>[]});
     o.r=r;return o});
   ok(C.esc==='a\\,b\\;c\\\\d\\ne'&&C.fold&&C.unfold,'ics: commas, semicolons, backslashes and new lines are escaped; folding keeps every line at 75 octets or less without cutting a character');
   ok(C.r.ok&&C.r.untilDay==='2027-01-28'&&C.r.usedDefaultTime&&C.r.time==='18:00'&&/SUMMARY:CELPIP study: A\\,B\\;C\\nINJECT:1\r\n/.test(C.r.text)&&!/\r\nINJECT:1/.test(C.r.text),'ics: no test date repeats for 12 weeks; no time uses 18:00; a focus name with a line break cannot add a line to the file');
 });
 await step('my plan turn 2: Home card, check-in, plan page, calendar download',async()=>{
   const snap=await p.evaluate(()=>JSON.stringify(Object.assign({},localStorage)));
   const fs=require('fs');
   const seed=(withData)=>p.evaluate(wd=>{localStorage.clear();if(!wd)return;const d=n=>new Date(Date.now()-n*864e5).toISOString();
     localStorage.setItem('celpip_settings_v1',JSON.stringify({targetCLB:9,hoursPerWeek:6,sessionMin:75,examDate:new Date(Date.now()+60*864e5).toISOString().slice(0,10),studyDays:[0,1,2,3,4,5,6],studyTime:'07:30',name:'Secret Name'}));
     localStorage.setItem('celpip_history_v1',JSON.stringify(['listening','reading','writing','speaking'].map((k,i)=>({id:'a_17300000000'+i+'_aaa11'+i,type:'practice',skill:k,pct:70,clb:7,date:d(4)}))));
     localStorage.setItem('celpip_studytime_v1',JSON.stringify({days:{},manual:[]}))},withData);
   // empty data
   await seed(false);await go('#/dashboard');
   const em=await txt('.tile-plan')||'';
   ok(/My plan/.test(em)&&/not set up yet/.test(em)&&await p.$('.tile-plan a[href="#/settings"]')!==null&&await p.$('.tile-plan a[href="#/diagnostic"]')!==null&&!(await p.$('.checkin')),'home card: empty data shows a set-up message that points to Settings and the diagnostic, with no check-in');
   // sample data
   await seed(true);await go('#/dashboard');
   const hc=await txt('.tile-plan')||'';
   ok(/This week:/.test(hc)&&/On track|A little behind|Behind/.test(hc)&&/Next session:/.test(hc)&&/Planning estimate, not official/.test(hc)&&/Not yet|Reading|Listening|Writing|Speaking/.test(hc)&&(await p.$$eval('.tile-plan li',l=>l.length))===2,'home card: minutes, on-track words, next session, projection label and two open milestones ('+hc.slice(0,120).replace(/\s+/g,' ')+')');
   ok(/^\s*Home\s*$/.test(await p.$eval('#sidebar a[data-section="dashboard"]',e=>e.textContent))&&await p.$eval('#sidebar a[data-section="dashboard"] svg use',u=>u.getAttribute('href'))==='#i-dashboard'&&(await p.title()).startsWith('Home')&&(await txt('#app h1'))==='Hello, Secret Name','home: menu says Home with its icon; title says Home; heading greets by name');
   const lk=await p.$eval('.tile-plan a.card-link',a=>({href:a.getAttribute('href'),inner:a.querySelectorAll('a,button,input,select,textarea,[tabindex]').length}));
   ok(lk.href==='#/plan'&&lk.inner===0,'home card: the link goes to #/plan and holds no other interactive element');
   const bx=await (await p.$('.tile-plan')).boundingBox();await p.mouse.click(bx.x+bx.width-24,bx.y+bx.height/2);await p.waitForTimeout(250);
   ok(await p.evaluate(()=>location.hash)==='#/plan','home card: a click anywhere on the card opens My plan');
   await go('#/dashboard');await p.focus('.tile-plan a.card-link');await p.keyboard.press('Enter');await p.waitForTimeout(250);
   ok(await p.evaluate(()=>location.hash)==='#/plan','home card: Enter on the focused heading link opens My plan');
   // check-in
   const bn=await txt('.checkin')||'';
   ok(/Welcome back/.test(bn)&&/streak count starts again/.test(bn)&&/\+\d+ min/.test(bn)&&!/fail|lazy|guilt|shame|should have|disappoint|bad |sorry|missed|slack|lost/i.test(bn),'check-in on My plan: gentle wording, reset message and a short catch-up, no blame words');
   await go('#/dashboard');ok(!!(await p.$('.tile-plan .checkin'))&&!(await p.$('.checkin[role=alertdialog],[aria-modal=true]')),'check-in on Home: inside the card, not a modal');
   await p.click('[data-checkin-dismiss]');await p.waitForTimeout(100);
   const dis=await p.evaluate(()=>[localStorage.getItem('celpip_checkin_v1'),!!document.querySelector('.checkin')]);
   ok(dis[0]&&/^\d{4}-\d{2}-\d{2}$/.test(dis[0])&&dis[1]===false,'check-in: dismiss hides it and remembers today');
   await go('#/plan');ok(!(await p.$('.checkin')),'check-in: stays hidden on My plan for the rest of today');
   await p.evaluate(()=>localStorage.setItem('celpip_checkin_v1','2000-01-01'));await go('#/plan');ok(!!(await p.$('.checkin')),'check-in: an old dismissal does not hide today\'s');
   // one missed day: studied the day before yesterday
   await p.evaluate(()=>{const n=Date.now();const id=(k)=>({id:'a_'+n+k+'_bbb22'+k,type:'practice',skill:'reading',pct:70,clb:7,date:new Date(n-2*864e5).toISOString()});const h=JSON.parse(localStorage.getItem('celpip_history_v1'));h.push(id(1));localStorage.setItem('celpip_history_v1',JSON.stringify(h));localStorage.removeItem('celpip_checkin_v1')});
   await go('#/plan');const one=await txt('.checkin')||'';
   ok(/streak is safe/.test(one)&&!/\+\d+ min/.test(one),'check-in: one missed day says the streak is safe, no catch-up');
   // plan page: status, closed form, manual list visible
   await p.evaluate(()=>{const t=JSON.parse(localStorage.getItem('celpip_studytime_v1'));const d=new Date().toISOString().slice(0,10);t.manual=[{id:'m_1730000000001',date:d,skill:'general',minutes:20,note:'SECRET-NOTE, x;y'}];t.days[d]={general:20};localStorage.setItem('celpip_studytime_v1',JSON.stringify(t))});
   await go('#/plan');
   ok((await p.$$eval('#planWeek ~ .card .status, .plan-row .status',x=>x.length))>=5,'my plan: on-track words with an icon for the week and for each skill');
   ok(await p.$eval('#addTimeDetails',d=>!d.open)&&!(await p.isVisible('#addMin'))&&await p.isVisible('#manualList li'),'my plan: "Add study time you did elsewhere" is closed; the manual entries stay visible');
   await p.click('#addTimeDetails summary');ok(await p.isVisible('#addMin'),'my plan: opening it shows the form');
   const pj=await p.$eval('[aria-labelledby=planProj] .card',e=>e.textContent);
   ok(!/\d+\.\d+ hours|400 to 1200/.test(pj)&&/weakest skill/.test(pj),'my plan: projection text has no decimals like "44.4" and uses the weakest skill');
   // calendar download
   const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#icsBtn')]);
   const txtIcs=fs.readFileSync(await dl.path(),'utf8');const name=dl.suggestedFilename();
   const logical=txtIcs.replace(/\r\n /g,'').split('\r\n');
   const stack=[];let pairs=true;logical.forEach(l=>{if(l.startsWith('BEGIN:'))stack.push(l.slice(6));else if(l.startsWith('END:')){if(stack.pop()!==l.slice(4))pairs=false}});
   const ev=txtIcs.replace(/\r\n /g,'').split('BEGIN:VEVENT').slice(1);
   const get=(e,k)=>(e.match(new RegExp('\\r\\n'+k+'[:;]([^\\r]*)'))||[])[1];
   ok(/\.ics$/.test(name)&&txtIcs.endsWith('\r\n')&&!/[^\r]\n/.test(txtIcs)&&pairs&&stack.length===0&&logical[0]==='BEGIN:VCALENDAR'&&logical.includes('VERSION:2.0'),'ics: downloaded as .ics, CRLF everywhere, BEGIN/END pairs balance ('+name+')');
   ok(txtIcs.split('\r\n').every(l=>Buffer.byteLength(l)<=75),'ics: no line is longer than 75 octets');
   ok(ev.length===7&&ev.every(e=>/\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\n/.test(e)&&get(e,'TRIGGER')==='-PT10M'),'ics: one event per preferred day (7), each with a VALARM 10 minutes before');
   ok(ev.map(e=>get(e,'RRULE').match(/BYDAY=(\w\w)/)[1]).sort().join()==='FR,MO,SA,SU,TH,TU,WE'&&ev.every(e=>/^FREQ=WEEKLY;/.test(get(e,'RRULE'))),'ics: weekly RRULE with BYDAY matching the preferred days');
   const dur=e=>{const a=get(e,'DTSTART'),b=get(e,'DTEND');const t=x=>new Date(+x.slice(0,4),+x.slice(4,6)-1,+x.slice(6,8),+x.slice(9,11),+x.slice(11,13)).getTime();return (t(b)-t(a))/60000};
   ok(ev.every(e=>/^\d{8}T073000$/.test(get(e,'DTSTART'))&&dur(e)===Math.round(6*60/7)),'ics: DTSTART is 07:30 floating (no zone) and the length is the session length ('+dur(ev[0])+' min)');
   const until=new Date(Date.now()+59*864e5);const u=until.getFullYear()+String(until.getMonth()+1).padStart(2,'0')+String(until.getDate()).padStart(2,'0')+'T235959';
   ok(ev.every(e=>/UNTIL=/.test(get(e,'RRULE'))&&get(e,'RRULE').split('UNTIL=')[1]===u)&&new Set(ev.map(e=>get(e,'UID'))).size===7&&ev.every(e=>/^CELPIP study: /.test(get(e,'SUMMARY'))&&/DESCRIPTION:.*\\n- /.test(e)),'ics: repeats until the day before the test; unique UIDs; summary "CELPIP study: <focus>"; description lists tasks');
   ok(!/SECRET|Secret Name|x\\;y/i.test(txtIcs),'ics: the manual note and the learner name never reach the file');
   ok(/nothing is sent/i.test(await txt('#app')||'')&&/made on this device/i.test(await txt('#app')||''),'my plan: the page says the file is made on the device and nothing is sent');
   // phone: no sideways scroll, Home tab
   const pc=await b.newContext({viewport:{width:390,height:844}});const q=await pc.newPage();await q.goto(BASE+'#/dashboard');
   await q.evaluate(s=>{localStorage.clear();const o=JSON.parse(s);for(const k in o)localStorage.setItem(k,o[k])},await p.evaluate(()=>JSON.stringify(Object.assign({},localStorage))));
   const side=async h=>{await q.evaluate(h=>{location.hash=h},h);await q.reload();await q.waitForTimeout(400);return q.evaluate(()=>[document.documentElement.scrollWidth,innerWidth])};
   const s1=await side('#/dashboard'),s2=await side('#/plan');
   ok(s1[0]<=s1[1]&&s2[0]<=s2[1],'phone 390px: Home and My plan do not scroll sideways ('+s1+' / '+s2+')');
   await q.evaluate(()=>{location.hash='#/dashboard'});await q.reload();await q.waitForTimeout(300);
   ok((await q.$$eval('#tabBar a',x=>x.map(a=>a.textContent.trim()))).includes('Home')&&await q.isVisible('#tabBar a[data-section="dashboard"] svg')&&await q.isVisible('.tile-plan'),'phone 390px: bottom tab says Home with an icon; the plan card shows');
   await pc.close();
   await p.evaluate(s=>{localStorage.clear();const o=JSON.parse(s);for(const k in o)localStorage.setItem(k,o[k])},snap)});

 // T-030 turn 2 follow-up (Inyene's review and Ufok's check): escaping, tracker allow-list, reset, save limits, import cap, one today focus
 await step('turn 2 follow-up: review fixes',async()=>{
   const snap=await p.evaluate(()=>JSON.stringify(Object.assign({},localStorage)));
   await go('#/dashboard');
   const esc=await p.evaluate(()=>[CalendarExport.escapeText('a;b'),CalendarExport.escapeText('a,b'),CalendarExport.escapeText('a\\b'),CalendarExport.escapeText('a\nb'),CalendarExport.escapeText('x;y,z\\w\nq')]);
   ok(esc[0]==='a\\;b'&&esc[1]==='a\\,b'&&esc[2]==='a\\\\b'&&esc[3]==='a\\nb'&&esc[4]==='x\\;y\\,z\\\\w\\nq'&&esc[0].length===4,'ics: a value with ; , \\ and a new line comes out as \\; \\, \\\\ and \\n ('+esc[4]+')');
   const sk=await p.evaluate(()=>['practice/constructor','practice/__proto__','learn/toString','practice/reading','learn/writing','practice/general'].map(x=>Study.tracker.skillFor(x)));
   ok(sk.join()==='general,general,general,reading,writing,general','tracker: only a listed skill is taken from the URL; "constructor" and "__proto__" count as General ('+sk+')');
   await p.evaluate(()=>{localStorage.setItem('celpip_checkin_v1','2026-11-05');Storage.set('studyTime',{days:{},manual:[]});Storage.resetAll()});
   ok(await p.evaluate(()=>localStorage.getItem('celpip_checkin_v1'))===null&&!(await p.evaluate(()=>'celpip_checkin_v1' in Storage.exportAll()||'checkin' in Storage.exportAll())),'reset: the check-in date is removed, and it is not part of export (not in KEYS)');
   await go('#/settings');
   ok(await p.$eval('#nameInput',e=>e.maxLength)===60,'settings: the name box stops at 60 characters');
   await p.evaluate(()=>{const n=document.getElementById('nameInput');n.removeAttribute('maxlength');n.value='B'.repeat(200);const d=document.getElementById('examDateInput');d.type='text';d.value='"><img src=x onerror=1>'});
   await p.click('#saveSettings');await run(50);
   const sv=await p.evaluate(()=>Storage.getSettings());
   ok(sv.name.length===60&&sv.examDate==='','settings save: an over-long name is cut to 60 and a test date that is not YYYY-MM-DD is dropped ('+sv.name.length+', "'+sv.examDate+'")');
   const days={};for(let i=0;i<450;i++){const d=new Date(Date.UTC(2024,0,1+i));days[d.toISOString().slice(0,10)]={reading:5}}
   await go('#/settings');await p.setInputFiles('#importFile',{name:'many.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({studyTime:{days,manual:[]}}))});await p.waitForTimeout(300);
   const kept=await p.evaluate(()=>Object.keys(Storage.get('studyTime',null).days).sort());
   ok(kept.length===400&&kept[399]==='2025-03-25'&&kept[0]>'2024-02-01','import: studyTime days are capped at 400, newest kept ('+kept.length+')');
   // one today focus: Home card, My plan Today and Your rhythm agree; the old Today tile is gone
   await p.evaluate(()=>{localStorage.clear();localStorage.setItem('celpip_settings_v1',JSON.stringify({targetCLB:9,hoursPerWeek:7,sessionMin:75,examDate:'',studyDays:[0,1,2,3,4,5,6],studyTime:'',name:''}));
     localStorage.setItem('celpip_history_v1',JSON.stringify([['reading',8],['listening',7],['writing',6],['speaking',5]].map(([k,v],i)=>({id:'a_17300000000'+i+'_aaa11'+i,type:'practice',skill:k,pct:70,clb:v,date:new Date().toISOString()}))))});
   await go('#/dashboard');const home=await txt('#app')||'';
   const hf=((await txt('.tile-plan')||'').match(/Next session: today[^.]*?(Reading|Listening|Writing|Speaking)/)||[])[1];
   ok(!/(Reading|Listening|Writing|Speaking) day/.test(home)&&!(await p.$('.tile .badge'))&&!!hf,'home: the old "Today" tile is gone; one focus is shown in the plan card ('+hf+')');
   await go('#/plan');const pf=((await txt('[aria-labelledby=planToday] .card')||'').match(/Focus: (\w+)/)||[])[1];
   const rf=await p.$$eval('.week-card',c=>c.map(x=>x.textContent));const dn=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
   const rhy=(rf.find(x=>x.startsWith(dn))||'').match(/(Reading|Listening|Writing|Speaking) day/);
   ok(pf===hf&&rhy&&rhy[1]===hf,'one focus for today: Home card ('+hf+'), My plan Today ('+pf+') and Your rhythm ('+(rhy&&rhy[1])+') agree');
   await p.evaluate(s=>{localStorage.clear();const o=JSON.parse(s);for(const k in o)localStorage.setItem(k,o[k])},snap)});

 console.log(`\n${fails} failure(s)`);await b.close();process.exit(fails?1:0)})();
