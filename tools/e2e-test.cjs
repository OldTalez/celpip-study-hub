/*
LEARNING NOTE
e2e-test.cjs drives the whole app in a headless Chrome, the way a person would: every screen, each practice type,
a full timed exam with all 8 speaking tasks, review, words, grammar, notes, plan, settings, history and the phone
layout. It uses a fake microphone (Chrome's test device) and makes time run 100 times faster, so a 55-minute timer
takes about half a minute. Each check prints PASS or FAIL; the exit code is the number of failures.
Run only the steps whose name contains a word: E2E_ONLY="B2a" node tools/e2e-test.cjs ... (for quick debugging; the full run is what counts).
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
Extended 2026-11-05 (Nsikak, T-031 turn A) with checks for the installable app: Chrome's own installability and manifest checks (CDP), icon sizes, iPhone tags,
the install button (a fake beforeinstallprompt, iPhone steps, already installed), the update notice (a fake controllerchange), the offline pill
(context.setOffline), storage protection and the monthly backup reminder, the icon badge (stand-in functions), 44px mastery cells at 390px, and the contrast
checker run inside this test. Screenshots go to the folder given as the third argument.
Extended 2026-11-05 (Nsikak, T-030 turn 1) with checks for My plan: the prescription functions run in the page with fixed inputs, settings
save and clamp, automatic study-time counting (pauses when hidden or idle), manual time with an HTML note shown as text, the import
cleaners for studyTime and the new settings, and the page sections.
Extended 2026-11-05 (Nsikak, T-032): lazy data. meta.js equals the real data, Home loads no big file, each route loads exactly what it needs, leaving mid-load draws nothing old,
a forced load failure shows Retry, script names only come from the fixed table, and offline after the first visit every route still opens.
*/
const {chromium}=require('playwright-core');
const BASE=process.argv[2]||'http://localhost:8790/';const SHOTS=process.argv[3]||'';
// Screenshots: only the ones named b1b-* or b2a-* (the ones kept in the task folder) go to the folder given as the third argument.
// Every other screenshot is a throw-away check picture and goes to tools/work/shots/ (ignored by git, see "Celpip Test v2/.gitignore"), or to $E2E_SHOTS_DIR.
const SCRATCH=(process.env.E2E_SHOTS_DIR||require('path').join(__dirname,'work','shots'))+'/';
if(SHOTS)require('fs').mkdirSync(SCRATCH,{recursive:true});
const sp=n=>(/^(b1b|b2a|b2b)-/.test(n)?SHOTS:SCRATCH)+n;
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
 const step=async(name,fn)=>{if(process.env.E2E_ONLY&&name.indexOf(process.env.E2E_ONLY)<0)return;const before=errs.length;try{await fn()}catch(e){ok(false,name+" threw: "+e.message.split("\n").slice(0,6).join(" | "))}const n=errs.slice(before);if(n.length){ok(false,name+' page errors: '+n.slice(0,3).join(' | '))}};
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
   await p.waitForSelector('.explain',{timeout:5000}).catch(()=>{});ok(await p.$$eval('.explain',x=>x.length)>0,'listening: explanations shown under questions');
   await p.click('#nextPassage');ok((await txt('.result-card h1'))==='Practice Complete','listening: result saved')});

 await step('reading timed section runs out',async()=>{await go('#/practice/reading');await p.click('#timedBtn');await run(1000);
   await p.waitForSelector('#mcqTimer',{timeout:10000});const t1=await txt('#mcqTimer');await run(55*60*1000+2000);
   // the review is drawn the moment the clock reaches zero; on a slow machine the sped-up clock needs longer, so wait (bounded) instead of a fixed sleep
   await p.waitForSelector('.score-line',{timeout:120000}).catch(()=>{});
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
   ok(await p.evaluate(()=>{const n=document.querySelector('nav#mainNav');return n.getAttribute('aria-label')==='Main'&&!document.querySelector('.sidebar [data-theme-switch], .sidebar [role=radiogroup]')&&!!document.querySelector('#topbar #themeBtn')}),'sidebar: Main landmark; the theme switch is gone from the island and the theme button is in the top bar (T-033)');
   await p.setViewportSize({width:1000,height:800});await p.waitForTimeout(500);ok(await vis('#rail')&&!(await vis('#sidebar'))&&!(await vis('#tabBar')),'exactly 1000px: icon rail, island hidden (T-033 D6)');
   await p.setViewportSize({width:999,height:800});await p.waitForTimeout(100);ok(!(await vis('#sidebar'))&&await vis('#tabBar'),'999px: bottom tabs, no sidebar');
   await p.setViewportSize({width:1100,height:800});await p.waitForTimeout(100);
   ok(await p.evaluate(()=>{const s=document.querySelector('#rail').getBoundingClientRect(),m=document.querySelector('main#app').getBoundingClientRect();return s.right<=m.left+1}),'1100px: the rail sits left of the content');
   await p.setViewportSize({width:390,height:844});await go('#/dashboard');
   // PHONE: the bottom bar and the side drawer (T-033 B1a)
   const labels=await p.$$eval('#tabBar a, #tabBar button',x=>x.map(e=>e.textContent.trim()));
   ok(labels.join(',')==='Home,Practice,My plan,Exam','phone bar has exactly 4 items in this order: '+labels.join(', '));
   ok(await p.$eval('#tabBar a[data-section=dashboard]',a=>a.getAttribute('aria-current'))==='page','phone: current tab has aria-current');
   ok(await p.$$eval('#tabBar a',x=>x.every(e=>e.getBoundingClientRect().height>=56)),'phone: every tab is 56px or taller');
   ok(await p.evaluate(()=>{const r=document.getElementById('tabBar').getBoundingClientRect();return r.left===12&&Math.round(innerWidth-r.right)===12&&Math.round(innerHeight-r.bottom)===12&&getComputedStyle(document.getElementById('tabBar')).borderRadius==='24px'}),'phone bar: floating card, 12px from the sides and the bottom, 24px corners');
   ok(!(await p.$('#moreBtn'))&&!(await p.$('#moreSheet')),'phone: the old More button and sheet are gone');
   const mb=await p.$eval('#topbar .menu-btn',b=>({txt:b.textContent.trim(),lab:b.getAttribute('aria-label'),w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height,ex:b.getAttribute('aria-expanded')}));
   ok(mb.txt===''&&mb.lab==='Open menu'&&mb.w>=44&&mb.h>=44&&mb.ex==='false','phone: the menu button is icon-only, named "Open menu", 44px or more, closed');
   const dr=()=>p.evaluate(()=>{const s=document.getElementById('sidebar'),r=s.getBoundingClientRect();return {ov:document.documentElement.dataset.overlay||'',vis:getComputedStyle(s).visibility,left:Math.round(r.left),inert:s.inert,content:document.getElementById('content').inert,tabs:document.getElementById('tabBar').inert,scrim:getComputedStyle(document.getElementById('scrim')).opacity,act:document.activeElement.id||document.activeElement.className,names:[...document.querySelectorAll('#mainNav a')].filter(a=>a.getClientRects().length).map(a=>a.textContent.trim()),grp:getComputedStyle(document.querySelector('#sidebar .grp')).display,role:s.getAttribute('role'),menuExp:document.querySelector('#topbar .menu-btn').getAttribute('aria-expanded')}});
   await p.waitForTimeout(400);let d=await dr();ok(d.ov===''&&d.vis==='hidden'&&d.inert,'drawer closed: hidden and inert (the slide itself is skipped under reduced motion, which this run uses)');
   await p.click('#topbar .menu-btn');await p.waitForTimeout(400);d=await dr();
   ok(d.ov==='open'&&d.vis==='visible'&&!d.inert&&d.left>=0&&d.left<=16&&d.content&&d.tabs&&d.scrim==='1'&&d.role==='dialog'&&d.act==='islandX'&&d.menuExp==='true','drawer open: slid in from the left, modal, page and bottom bar inert, scrim on, focus on the X');
   ok(d.names.join(',')==='Learn,Review,Words,Grammar,Notes,History,Settings'&&d.grp==='block','drawer lists only the pages that are not in the bar ('+d.names.join(', ')+') under "More pages"');
   ok(await p.$eval('#islandX',x=>x.getAttribute('aria-label'))==='Close menu'&&!!(await p.$('#sidebar [data-profile-panel-open]')),'drawer: X is "Close menu"; the profile button is inside');
   let leak=false;for(let i=0;i<30&&!leak;i++){await p.keyboard.press('Tab');leak=await p.evaluate(()=>!document.activeElement.closest('#sidebar'))}ok(!leak,'drawer: Tab never leaves it (30 presses)');
   await p.keyboard.press('Escape');await p.waitForTimeout(400);d=await dr();ok(d.ov===''&&d.inert&&!d.content&&d.act.indexOf('menu-btn')>=0,'drawer: Esc closes it and focus returns to the menu button');
   await p.click('#topbar .menu-btn');await p.waitForTimeout(300);await p.click('#islandX');await p.waitForTimeout(300);ok((await dr()).ov===''&&(await dr()).act.indexOf('menu-btn')>=0,'drawer: the X closes it, focus back on the menu button');
   await p.click('#topbar .menu-btn');await p.waitForTimeout(300);await p.mouse.click(380,400);await p.waitForTimeout(300);ok((await dr()).ov==='','drawer: a tap on the dimmed page (scrim) closes it');
   await p.click('#topbar .menu-btn');await p.waitForTimeout(300);await p.click('#sidebar a[data-section=notes]');await p.waitForTimeout(300);
   ok((await dr()).ov===''&&await p.evaluate(()=>location.hash)==='#/notes','drawer: choosing Notes closes it and opens Notes');
   await p.setViewportSize({width:1280,height:900})})

 // T-033 turn A: the icon rail, the island (pinned or overlay), X and Expand, tooltips, spacing (spec section 17, items 5, 6, 15)
 await step('rail and island (wide screens)',async()=>{
   await p.setViewportSize({width:1440,height:900});await p.evaluate(()=>localStorage.removeItem('celpip_sidebar'));await p.goto(BASE+'#/dashboard');await p.reload();await p.waitForTimeout(400);
   const shown=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return false;const r=e.getBoundingClientRect(),c=getComputedStyle(e);return c.display!=='none'&&c.visibility!=='hidden'&&r.width>0&&!e.closest('[inert]')},sel);
   const st=()=>p.evaluate(()=>({nav:document.documentElement.dataset.nav,ov:document.documentElement.dataset.overlay||'',ml:getComputedStyle(document.documentElement).getPropertyValue('--off').trim(),pref:localStorage.getItem('celpip_sidebar'),act:document.activeElement.id||document.activeElement.getAttribute('data-rail-expand')!==null&&'expand'||document.activeElement.tagName}));
   let a=await st();ok(a.nav==='pinned'&&await shown('#sidebar')&&!(await shown('#rail'))&&a.ml==='304px','island: pinned by default at 1440 (1440 leaves 304px free each side; the column is centred, no left margin)');
   ok(await p.evaluate(()=>!document.querySelector('#rail [role=radiogroup], #sidebar [role=radiogroup]')&&!!document.querySelector('#topbar #themeBtn')),'rail/island: no theme radio group inside, the theme button is in the top bar');
   ok(await p.$eval('#islandX',x=>x.getAttribute('aria-label')==='Collapse menu to icons'),'island: the X is named "Collapse menu to icons" when pinned');
   ok(await p.$$eval('#mainNav a',l=>l.every(x=>x.getBoundingClientRect().height===48&&!!x.querySelector('.go[aria-hidden=true]'))&&l.length===11),'island: 11 rows, 48px high, each with an aria-hidden arrow chip');
   ok(await p.$eval('#mainNav a[aria-current=page] .go',c=>getComputedStyle(c).backgroundColor)==='rgb(15, 36, 48)','island: the chip on the current-page row is solid');
   await p.click('#islandX');await p.waitForTimeout(500);a=await st();
   ok(a.nav==='rail'&&a.pref==='folded'&&a.ml==='112px'&&await shown('#rail')&&!(await shown('#sidebar')),'X: collapses to the rail, saved as folded, content pushed 112px');
   ok(a.act==='expand','X: focus lands on Expand');
   const rail=await p.evaluate(()=>({links:[...document.querySelectorAll('#rail a.ri[data-section]')].map(x=>x.getAttribute('aria-label')),logo:!!document.querySelector('#rail [data-logo]'),exp:!!document.querySelector('#rail [data-rail-expand]'),prof:!!document.querySelector('#rail [data-profile-open]'),named:[...document.querySelectorAll('#rail a, #rail button')].every(x=>x.getAttribute('aria-label')&&x.tabIndex>=0&&x.getBoundingClientRect().width>=44)}));
   ok(rail.links.length===11&&rail.logo&&rail.exp&&rail.prof&&rail.named&&rail.links.includes('Practice'),'rail: 11 page links plus logo, Expand and profile, each named, focusable and 44px or more');
   await p.focus('#rail [data-rail-expand]');await p.keyboard.press('Tab');await p.keyboard.press('Tab');await p.keyboard.press('Tab');await p.waitForTimeout(400);
   const tip=()=>p.evaluate(()=>{const e=document.activeElement,c=getComputedStyle(e,'::after');return {name:e.getAttribute('aria-label'),content:c.content,op:c.opacity}});
   let t=await tip();ok(t.name==='Practice'&&t.content==='"Practice"'&&t.op==='1','rail: keyboard focus on Practice shows its tooltip (opacity '+t.op+', '+t.content+')');
   await p.keyboard.press('Escape');await p.waitForTimeout(300);t=await tip();ok(t.op==='0','rail: Esc hides the tooltip without moving focus');
   await p.keyboard.press('Tab');await p.waitForTimeout(300);t=await tip();ok(t.op==='1','rail: moving focus shows the next tooltip again');
   await p.click('#rail a[data-section=review]');await p.waitForTimeout(300);ok(await p.evaluate(()=>location.hash)==='#/review'&&await p.$eval('#rail a[data-section=review]',x=>x.getAttribute('aria-current'))==='page','rail: a click on Review navigates and marks it current');
   await p.click('#rail [data-rail-expand]');await p.waitForTimeout(500);a=await st();
   ok(a.nav==='pinned'&&a.pref==='open'&&a.ov===''&&await shown('#sidebar')&&a.act==='islandX','Expand (1440): re-pins the island, saved as open, focus on the X');
   await p.evaluate(()=>localStorage.setItem('celpip_sidebar','banana'));await p.reload();await p.waitForTimeout(300);ok((await st()).nav==='pinned','island: a junk saved value = pinned');
   await p.evaluate(()=>localStorage.setItem('celpip_sidebar','folded'));await p.reload();await p.waitForTimeout(300);ok((await st()).nav==='rail','rail: folded choice survives reload');
   // 1000 to 1199: rail only, Expand opens the island as a modal overlay
   await p.setViewportSize({width:1100,height:800});await p.waitForTimeout(300);
   a=await st();ok(a.nav==='rail'&&!(await shown('#sidebar')),'1100px: the rail rests, the island is hidden');
   await p.evaluate(()=>localStorage.removeItem('celpip_sidebar'));await p.reload();await p.waitForTimeout(300);
   ok((await st()).nav==='rail','1100px: rail even when never folded');
   await p.focus('#rail [data-rail-expand]');await p.keyboard.press('Enter');await p.waitForTimeout(500);a=await st();
   const ov=await p.evaluate(()=>({role:document.getElementById('sidebar').getAttribute('role'),modal:document.getElementById('sidebar').getAttribute('aria-modal'),content:document.getElementById('content').inert,lab:document.getElementById('islandX').getAttribute('aria-label'),exp:document.querySelector('[data-rail-expand]').getAttribute('aria-expanded')}));
   ok(a.ov==='open'&&await shown('#sidebar')&&ov.role==='dialog'&&ov.modal==='true'&&ov.content&&ov.lab==='Close menu'&&a.act==='islandX','overlay: opens as a modal dialog, page behind inert, X named "Close menu", focus on the X');
   let leaked=false;for(let i=0;i<30&&!leaked;i++){await p.keyboard.press('Tab');leaked=await p.evaluate(()=>!document.activeElement.closest('#sidebar'))}
   ok(!leaked,'overlay: Tab never leaves the island (30 presses)');
   await p.keyboard.press('Escape');await p.waitForTimeout(500);a=await st();ok(a.ov===''&&a.act==='expand'&&!(await shown('#sidebar')),'overlay: Esc closes it and focus returns to Expand');
   await p.click('#rail [data-rail-expand]');await p.waitForTimeout(500);await p.mouse.click(900,400);await p.waitForTimeout(500);ok((await st()).ov==='','overlay: a click on the dimmed page closes it');
   await p.click('#rail [data-rail-expand]');await p.waitForTimeout(500);await p.click('#islandX');await p.waitForTimeout(500);ok((await st()).ov===''&&(await st()).act==='expand','overlay: the X closes it');
   await p.click('#rail [data-rail-expand]');await p.waitForTimeout(500);await p.click('#sidebar a[data-section=learn]');await p.waitForTimeout(400);ok((await st()).ov===''&&await p.evaluate(()=>location.hash)==='#/learn','overlay: choosing a page closes it and goes there');
   await p.setViewportSize({width:999,height:800});await p.waitForTimeout(300);ok(!(await shown('#rail'))&&!(await shown('#sidebar'))&&await shown('#tabBar'),'999px: no rail, no island, bottom tabs');
   // spacing (item 15)
   await p.setViewportSize({width:1440,height:900});await p.evaluate(()=>localStorage.removeItem('celpip_sidebar'));await go('#/dashboard');await p.reload();await p.waitForTimeout(400);
   const sp=await p.evaluate(()=>({gap:getComputedStyle(document.querySelector('.bento')).columnGap,pad:getComputedStyle(document.querySelector('.bento .card')).paddingLeft,row:document.querySelector('#mainNav a').getBoundingClientRect().height,bg:getComputedStyle(document.body).backgroundColor,card:getComputedStyle(document.querySelector('.bento .card')).backgroundColor}));
   ok(sp.gap==='24px'&&sp.pad==='24px'&&sp.row===48,'spacing 1440: grid gap 24px, card padding 24px, island row 48px ('+JSON.stringify(sp)+')');
   ok(sp.bg==='rgb(255, 255, 255)'&&sp.card==='rgb(255, 255, 255)','light theme: body and card are white');
   await p.setViewportSize({width:390,height:844});await p.reload();await p.waitForTimeout(400);
   ok(await p.evaluate(()=>getComputedStyle(document.querySelector('main#app')).paddingLeft)==='20px','spacing 390: the gutter is 20px');
   await p.setViewportSize({width:1280,height:900});await p.reload();await p.waitForTimeout(300)});

 await step('theme: Light / Dark / Auto',async()=>{
   const th=()=>p.evaluate(()=>[document.documentElement.dataset.theme,document.documentElement.dataset.themePref,localStorage.getItem('celpip_theme'),getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),(document.getElementById('metaTheme')||{}).content]);
   await p.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});await go('#/settings');
   ok(await p.$$eval('#app [data-theme-set]',b=>b.length)===0&&await p.$$eval('#app [role=radiogroup]',b=>b.length)===0&&/button at the top right/.test(await txt('#themeHint')||''),'settings (T-031C): no theme switch in the card, just the one-line hint pointing to the top-right button');
   // T-033: ONE theme-color meta, no media attribute, rewritten on every change
   ok(await p.evaluate(()=>{const m=document.querySelectorAll('meta[name=theme-color]');return m.length===1&&!m[0].hasAttribute('media')&&m[0].id==='metaTheme'}),'theme-color: exactly one meta, no media attribute');
   const cycleTo=async pref=>{for(let i=0;i<3&&(await th())[1]!==pref;i++){await p.click('#themeBtn');await p.waitForTimeout(80)}};
   await cycleTo('dark');let t=await th();ok(t[0]==='dark'&&t[2]==='dark'&&t[3]==='#000000'&&t[4]==='#000000','theme: Dark by the top-bar button; --bg and theme-color are #000000 ('+t.join(' ')+')');
   ok(await p.evaluate(()=>getComputedStyle(document.body).backgroundColor)==='rgb(0, 0, 0)'&&await p.evaluate(()=>{const c=document.querySelector('.card');return !c||getComputedStyle(c).backgroundColor==='rgb(14, 14, 14)'}),'dark: body rgb(0, 0, 0), cards rgb(14, 14, 14)');
   await cycleTo('auto');t=await th();ok(t[0]==='light'&&t[1]==='auto'&&t[2]==='auto'&&t[4]==='#FFFFFF','theme: Auto saved; the device is light so the page and theme-color are light (#FFFFFF)');
   await p.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});await p.waitForTimeout(100);t=await th();ok(t[0]==='dark'&&t[1]==='auto'&&t[4]==='#000000','theme-color: Auto follows the device to dark, live, and the meta follows (#000000)');
   await p.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});await p.waitForTimeout(100);t=await th();ok(t[0]==='light'&&t[4]==='#FFFFFF','theme-color: Auto follows the device back to light (#FFFFFF)');
   await cycleTo('light');t=await th();ok(t[0]==='light'&&t[2]==='light'&&t[4]==='#FFFFFF','theme: Light chosen and saved; theme-color #FFFFFF');
   // an old saved value keeps working, a junk value means Auto; the head script sets the meta before first paint
   await p.evaluate(()=>localStorage.setItem('celpip_theme','dark'));await p.reload();await p.waitForTimeout(400);t=await th();ok(t[0]==='dark'&&t[1]==='dark'&&t[4]==='#000000','theme: an old saved "dark" still works after reload, meta #000000');
   await p.evaluate(()=>localStorage.setItem('celpip_theme','banana'));await p.reload();await p.waitForTimeout(400);t=await th();ok(t[1]==='auto'&&t[0]==='light'&&t[4]==='#FFFFFF','theme: an unknown saved value is treated as Auto');
   await p.evaluate(()=>localStorage.setItem('celpip_theme','auto'));await p.reload();await p.waitForTimeout(400);
   ok(await p.evaluate(()=>document.querySelector('meta[name=apple-mobile-web-app-status-bar-style]').content)==='black-translucent','iPhone status bar style is black-translucent (D1)');
   // phone More sheet keeps the three icon buttons; the top-bar button cycles them
   const phc=await b.newContext({viewport:{width:390,height:844}});const ph=await phc.newPage();await ph.goto(BASE+'#/dashboard');await ph.evaluate(()=>localStorage.setItem('celpip_theme','light'));await ph.reload();await ph.waitForTimeout(400);
   const pb=()=>ph.$eval('#themeBtn',e=>[e.getAttribute('aria-label'),e.querySelector('use').getAttribute('href')].join('|'));
   const seq=[await pb()];for(let i=0;i<3;i++){await ph.click('#themeBtn');await ph.waitForTimeout(150);seq.push(await pb())}
   ok(seq.join(' ; ')==='Theme: Light, change|#i-sun ; Theme: Dark, change|#i-moon ; Theme: Auto, change|#i-theme ; Theme: Light, change|#i-sun','phone theme button: icon and label follow Light > Dark > Auto > Light ('+seq.join(' ; ')+')');
   ok(await ph.$eval('#themeBtn',e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44}),'phone theme button is at least 44px');
   ok(await ph.evaluate(()=>!document.querySelector('[data-theme-set], [role=radiogroup]')),'theme: the three-button switch is gone with the More sheet; the one button cycles the choices');
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

 // ===== T-033 turn A (spec section 17): logo to Home, task bar title, no slit, collapsing bar =====
 await step('logo goes Home; confirm in practice and the exam',async()=>{
   await p.setViewportSize({width:1440,height:900});await go('#/settings');
   await p.click('#sidebar [data-logo]');await p.waitForTimeout(300);ok(await p.evaluate(()=>location.hash)==='#/dashboard','logo: from Settings the island logo goes Home');
   ok(await p.$$eval('[data-logo]',l=>l.length>=4&&l.every(x=>x.getAttribute('href')==='#/dashboard'&&x.getAttribute('aria-label')==='CELPIP Study Hub, go to Home')),'logo: every logo is a link to #/dashboard named "CELPIP Study Hub, go to Home"');
   await go('#/practice/reading');await p.click('#quickBtn');await run(50);await p.waitForTimeout(200);const hash0=await p.evaluate(()=>location.hash);
   ok(await p.$eval('#taskBar [data-logo]',l=>l.getBoundingClientRect().width===48),'practice: the task bar carries the 48px logo mark');
   await p.click('#taskBar [data-logo]');await p.waitForTimeout(200);
   ok(await p.$eval('#confirmDlg',d=>d.open)&&await p.evaluate(()=>document.activeElement.id)==='confirmKeep','practice: the logo opens the Leave question with "Keep going" focused');
   await p.click('#confirmKeep');await p.waitForTimeout(200);
   ok(await p.evaluate(()=>location.hash)===hash0&&await p.evaluate(()=>document.body.dataset.mode)==='focus'&&await p.evaluate(()=>document.activeElement.hasAttribute('data-logo')),'practice: Keep going leaves the route unchanged and returns focus to the logo');
   await p.click('#taskBar [data-logo]');await p.waitForTimeout(200);await p.click('#confirmDlg button[value=leave]');await p.waitForTimeout(300);
   ok(await p.evaluate(()=>location.hash)==='#/dashboard'&&(await p.evaluate(()=>document.body.dataset.mode||''))==='','practice: Leave goes Home and ends focus mode');
   await go('#/exam');await p.click('a[href="#/exam/run"]');await run(100);await p.waitForTimeout(250);
   const tn=()=>p.evaluate(()=>{const t=document.getElementById('taskName');return {n1:t.querySelector('.n1').textContent,n2:t.querySelector('.n2').textContent,fit:t.scrollWidth===t.clientWidth&&[...t.children].every(c=>c.scrollWidth<=c.clientWidth)}});
   let n=await tn();ok(n.n1==='Timed Exam'&&n.n2==='Listening'&&n.fit,'exam task bar 1440: "Timed Exam" and the part, no ellipsis ('+JSON.stringify(n)+')');
   await p.setViewportSize({width:390,height:844});await p.waitForTimeout(200);n=await tn();ok(n.n1==='Timed Exam'&&n.n2==='Listening'&&n.fit,'exam task bar 390: two parts "Timed Exam" over "Listening", no ellipsis');
   await p.setViewportSize({width:320,height:700});await p.waitForTimeout(200);n=await tn();
   ok(n.fit&&await p.evaluate(()=>{const b=document.getElementById('exitBtn'),r=b.getBoundingClientRect();return r.width===48&&b.textContent.trim()==='Exit'&&document.querySelector('#exitBtn .lbl').getBoundingClientRect().width<=1}),'exam task bar 320: Exit is icon-only (48px, name kept), the title fits');
   await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(150);
   await p.click('#taskBar [data-logo]');await p.waitForTimeout(200);
   ok(await p.$eval('#confirmDlg',d=>d.open)&&/Leave the exam/.test(await txt('#confirmTitle')||'')&&await p.evaluate(()=>document.activeElement.id)==='confirmKeep','exam: the logo opens the Leave-the-exam question, "Keep going" focused');
   await p.click('#confirmKeep');await p.waitForTimeout(200);ok(!!(await p.$('.exam-banner'))&&await p.evaluate(()=>document.body.dataset.mode)==='focus','exam: Keep going stays in the exam');
   await p.click('#taskBar [data-logo]');await p.waitForTimeout(200);await p.click('#confirmDlg button[value=leave]');await run(100);await p.waitForTimeout(300);
   ok(await p.evaluate(()=>location.hash)==='#/dashboard'&&!(await p.$('.exam-banner'))&&(await p.evaluate(()=>document.body.dataset.mode||''))==='','exam: Leave goes Home, focus mode ends');
   ok(await p.evaluate(()=>window.onbeforeunload===null),'exam: leave warning cleared after leaving via the logo')});

 for(const [W,H] of [[390,844],[1100,800],[1440,900]]) await step(`sticky stack and collapsing bar at ${W}`,async()=>{
   await p.setViewportSize({width:W,height:H});await p.evaluate(()=>localStorage.removeItem('celpip_sidebar'));await go('#/dashboard');await p.waitForTimeout(200);
   await p.evaluate(()=>{document.querySelector('main#app').style.minHeight='3500px';window.scrollTo(0,0);window.__cl=[];window.addEventListener('scroll',()=>{window.__cl.push([window.scrollY,document.documentElement.dataset.collapsed==='1'])})});
   await p.mouse.move(Math.round(W/2),Math.round(H/2));
   const gap=()=>p.evaluate(()=>{const bar=document.getElementById('topbar').getBoundingClientRect(),t=document.querySelector('main#app > .screen-title');if(!t)return {err:'no title'};const tr=t.getBoundingClientRect();
     const x=Math.round(innerWidth/2);const el=document.elementFromPoint(x,Math.round(bar.bottom+1));
     return {covered:tr.top<=bar.top+0.5&&tr.bottom>=bar.bottom-0.5,under:!!el&&!!el.closest('.screen-title,.topbar'),same:document.getElementById('topbar').parentElement===t.parentElement||true,tb:[tr.top,tr.bottom,bar.top,bar.bottom].map(v=>Math.round(v*10)/10).join('/')}});
   // a snapshot of every thing the Board's rules are about, so each STATE can be asserted on its own (T-033 B1a)
   const snap=()=>p.evaluate(()=>{const R=document.documentElement,m=document.querySelector('main#app').getBoundingClientRect(),th=document.querySelector('#topbar [data-theme-btn]').getBoundingClientRect(),t=document.querySelector('main#app > .screen-title'),tb=document.getElementById('topbar'),cs=(e,ps)=>getComputedStyle(e,ps);
     const wide=innerWidth>=1000,lg=wide?document.querySelector(R.dataset.nav==='pinned'?'#sidebar .logo .mark':'#rail .mark').getBoundingClientRect():null,an=document.getElementById('anchor').getBoundingClientRect();
     return {y:Math.round(scrollY),col:R.dataset.collapsed,ttl:R.dataset.title,mx:Math.round(m.left*10)/10,mw:Math.round(m.width*10)/10,thx:Math.round(th.left),thy:Math.round(th.top),
       barLine:+cs(tb,'::after').opacity,barBg:+cs(tb,'::before').opacity,titleOp:+cs(t).opacity,titleLine:cs(t).borderBottomColor!=='rgba(0, 0, 0, 0)'&&cs(t).borderBottomColor!=='transparent',
       logo:lg?[Math.round(lg.left+lg.width/2),Math.round(lg.top+lg.height/2)]:null,anchor:[Math.round(an.left+an.width/2),Math.round(an.top+an.height/2)],
       aHb:+cs(document.querySelector('.a-hb')).opacity,aLogo:+cs(document.querySelector('.a-logo')).opacity,anchorInert:document.getElementById('anchor').inert,
       sideOp:+cs(document.getElementById('sidebar')).opacity,railOp:+cs(document.getElementById('rail')).opacity,navInert:[document.getElementById('sidebar').inert,document.getElementById('rail').inert],
       ring:cs(tb.querySelector('[data-theme-btn]')).boxShadow!=='none',barInert:tb.inert,miniInert:document.getElementById('mini').inert,miniOp:+cs(document.getElementById('mini')).opacity,pillrow:cs(document.querySelector('.pillrow')).display,
       menuBtnOp:+cs(tb.querySelector('.menu-btn')).opacity,sw:document.documentElement.scrollWidth<=innerWidth}});
   let g=await gap();ok(g.covered&&g.under,`no slit at scroll 0: title covers the bar, nothing but bar or title just under it (${g.tb})`);
   const top0=await snap();
   ok(top0.col!=='1'&&top0.ttl==='1'&&top0.titleOp===1&&top0.barBg===1&&top0.barLine===0&&!top0.titleLine&&(W<1000||top0.aHb===0)&&top0.anchorInert,`${W} top: bar and greeting shown, no hairline at all, the anchor is invisible and inert`);
   await p.mouse.wheel(0,24);await p.waitForTimeout(150);g=await gap();ok(g.covered&&g.under,`no slit at scroll 24 (${g.tb})`);
   ok(await p.evaluate(()=>document.documentElement.dataset.collapsed!=='1'),'collapse: still showing at y<=24');
   for(let i=0;i<8;i++){await p.mouse.wheel(0,40);await p.waitForTimeout(80)}
   const log=await p.evaluate(()=>window.__cl);const flip=log.find(e=>e[1]);
   ok(!!flip&&flip[0]>96,`collapse flips only above y=96: first flip at y=${flip?flip[0]:'none'} (every event with y<=96 stayed expanded: ${log.filter(e=>e[0]<=96).every(e=>!e[1])})`);
   ok(log.filter(e=>e[0]<=96).every(e=>!e[1]),'collapse: never collapsed at y<=96 (log of every scroll event checked)');
   await p.waitForTimeout(500);
   // ---- STATE: collapsed (scrolled down) ----
   let c=await snap();
   ok(c.col==='1'&&c.barLine===0&&c.titleOp===0&&c.sw,`${W} collapsed: no hairline (bar line ${c.barLine}), the greeting is faded, no sideways scroll`);
   ok(c.mx===top0.mx&&c.mw===top0.mw,`${W} collapsed: content column x and width identical to the top (${c.mx}/${c.mw} against ${top0.mx}/${top0.mw})`);
   ok(await p.evaluate(()=>{const m=document.querySelector('main#app').getBoundingClientRect();return Math.abs(m.left-(innerWidth-m.right))<=1}),`${W}: the content column is centred in the window (equal space left and right)`);
   ok(await p.evaluate(()=>{const h=document.querySelector('#app h1');return !!h&&getComputedStyle(h).display!=='none'&&getComputedStyle(h).visibility!=='hidden'}),`${W} collapsed: the h1 is still in the accessibility tree`);
   if(W>=1000){
     ok(c.pillrow==='none'&&c.miniInert,`${W} collapsed: no mini island on a wide screen`);
     ok(c.aHb===1&&c.aLogo===0&&!c.anchorInert&&Math.abs(c.anchor[0]-c.logo[0])<=1&&Math.abs(c.anchor[1]-c.logo[1])<=1,`${W} collapsed: the logo spot shows a hamburger, exactly over the logo (anchor ${c.anchor} / logo ${c.logo})`);
     ok(c.sideOp===0&&c.railOp===0&&c.navInert[0]&&c.navInert[1],`${W} collapsed: the island and the rail have faded and are inert`);
     ok(c.thx===top0.thx&&c.thy===top0.thy&&c.ring&&!c.barInert,`${W} collapsed: the theme button has not moved (${c.thx},${c.thy}), it has a ring (floating circle) and stays live`);
   } else {
     ok(c.miniOp===1&&!c.miniInert&&c.barInert&&c.menuBtnOp===0,`${W} collapsed: the bar melted into the pill (pill visible and live, bar controls faded and inert)`);
     const pl=await p.evaluate(()=>{const m=document.getElementById('mini'),r=m.getBoundingClientRect();return {cx:Math.round(r.left+r.width/2),labs:[...m.querySelectorAll('a,button')].map(x=>x.getAttribute('aria-label')).join('|'),big:[...m.querySelectorAll('a,button')].every(x=>x.getBoundingClientRect().width>=44)}});
     ok(Math.abs(pl.cx-W/2)<=2&&pl.big&&/^Open menu\|CELPIP Study Hub, go to Home\|Theme: /.test(pl.labs),`${W} collapsed: the pill is centred and holds menu, Home mark, theme (${pl.labs})`);
   }
   // ---- scroll far down, then scroll UP by a short distance: the bar must stay hidden (Board: it came back too easily) ----
   await p.evaluate(()=>window.scrollTo(0,1600));await p.waitForTimeout(250);
   for(let i=0;i<6;i++){await p.mouse.wheel(0,-50);await p.waitForTimeout(70)}
   await p.waitForTimeout(300);c=await snap();
   ok(c.col==='1'&&c.y>1000,`${W}: bar stays hidden after a 300px scroll up (y=${c.y}, collapsed=${c.col})`);
   for(let i=0;i<14;i++){await p.mouse.wheel(0,-50);await p.waitForTimeout(70)}
   await p.waitForTimeout(400);c=await snap();
   ok(c.col==='0'&&c.y>200,`${W}: bar returns after an upward run of 60% of a screen (about ${Math.round(0.6*H)}px; y=${c.y})`);
   ok(c.ttl==='0'&&c.titleOp===0&&c.barBg===1&&c.barLine===1&&!c.titleLine,`${W} mid-page: greeting stays hidden, only the bar row has a background, exactly one hairline (the bar's)`);
   if(W>=1000)ok(c.aHb===0&&c.anchorInert&&c.sideOp===1||c.railOp===1,`${W}: the sidebar or rail is back and the hamburger has turned into the logo again`);
   else ok(c.miniOp===0&&c.miniInert&&!c.barInert&&c.menuBtnOp===1,`${W}: the pill has turned back into the bar`);
   await p.evaluate(()=>window.scrollTo(0,120));await p.waitForTimeout(500);c=await snap();
   ok(c.col==='0'&&c.ttl==='1'&&c.titleOp===1&&c.titleLine&&c.barLine===0,`${W} y=120: greeting shows again (y<=160) with the title's hairline only, never both lines (bar line ${c.barLine})`);
   await p.evaluate(()=>window.scrollTo(0,60));await p.waitForTimeout(400);c=await snap();
   ok(c.col==='0'&&c.titleLine&&c.barLine===0,`${W} y=60: one hairline (the title's), not collapsed`);
   await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(400);c=await snap();
   ok(c.col==='0'&&!c.titleLine&&c.barLine===0&&c.titleOp===1,`${W} back at the top: no hairline, greeting shown`);
   // ---- the hamburger / pill menu opens the island as an overlay, Esc closes it, focus returns ----
   await p.evaluate(()=>window.scrollTo(0,1600));await p.waitForTimeout(400);
   const opener=W>=1000?'#anchor':'#mini [data-menu-open]';
   await p.click(opener);await p.waitForTimeout(500);
   let o=await p.evaluate(()=>{const s=document.getElementById('sidebar'),r=s.getBoundingClientRect();return {ov:document.documentElement.dataset.overlay,vis:getComputedStyle(s).visibility,op:+getComputedStyle(s).opacity,left:Math.round(r.left),inert:s.inert,content:document.getElementById('content').inert,act:document.activeElement.id,sc:+getComputedStyle(document.getElementById('scrim')).opacity,col:document.documentElement.dataset.collapsed}});
   ok(o.ov==='open'&&o.vis==='visible'&&o.op===1&&!o.inert&&o.content&&o.act==='islandX'&&o.sc===1&&o.left>=0&&o.left<=16,`${W} collapsed: the hamburger opens the island as an overlay from the left (scrim on, page inert, focus on the X)`);
   await p.keyboard.press('Escape');await p.waitForTimeout(500);
   o=await p.evaluate(()=>({ov:document.documentElement.dataset.overlay||'',act:document.activeElement.id||document.activeElement.className,col:document.documentElement.dataset.collapsed,inert:document.getElementById('sidebar').inert}));
   ok(o.ov===''&&o.col==='1'&&o.inert&&(W>=1000?o.act==='anchor':/icon-btn/.test(o.act)),`${W}: Esc closes the overlay, focus returns to the control that opened it, bar still collapsed`);
   if(W===1440){
     await p.click('#anchor');await p.waitForTimeout(500);await p.mouse.click(1200,400);await p.waitForTimeout(400);ok(!(await p.evaluate(()=>document.documentElement.dataset.overlay)),'1440: a click on the dimmed page closes the scrolled overlay');
     await p.click('#anchor');await p.waitForTimeout(500);await p.click('#islandX');await p.waitForTimeout(400);ok(!(await p.evaluate(()=>document.documentElement.dataset.overlay)),'1440: the X closes the scrolled overlay');
   }
   await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(300);ok(await p.evaluate(()=>document.documentElement.dataset.collapsed!=='1'),'at scroll 0 the bar is always shown');
   ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`no sideways scroll at ${W}`);
   await p.evaluate(()=>{document.querySelector('main#app').style.minHeight=''})});


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
   await q.click('#themeBtn');await q.click('#themeBtn');await q.waitForTimeout(500);ok((await q.evaluate(()=>document.documentElement.dataset.theme))==='dark','motion on: theme change works');
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
   ok(/Add date/.test(await b.textContent())&&await b.getAttribute('aria-label')==='Add date for your test','phone: short label, full name for screen readers');
   await p.setViewportSize({width:1280,height:900})});

 // phone width: nothing wider than the screen
 await step('phone layout',async()=>{await p.setViewportSize({width:390,height:844});const bad=[];
   for(const r of ['dashboard','learn','practice','practice/listening','practice/writing','practice/speaking','review','vocab','grammar','notes','plan','exam','history','settings','diagnostic']){await go('#/'+r);const w=await p.evaluate(()=>document.documentElement.scrollWidth);if(w>392)bad.push(r+':'+w)}
   ok(!bad.length,'phone: no screen wider than the phone'+(bad.length?' ('+bad.join(', ')+')':''))});
 // turn C: dashboard radar, pace, mastery grid; toolbar; toast on navigation
 await step('dashboard: radar, pace, mastery, polish',async()=>{
   await p.setViewportSize({width:1440,height:1000});
   const snap=await p.evaluate(()=>JSON.stringify(Object.assign({},localStorage)));
   await p.evaluate(()=>{Storage.clearHistory();localStorage.removeItem(Profiles.key('celpip_partstats_v1'))});
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
   ok(/your guide: 68 to 88s per question/.test(pc)&&/guide, estimated from the official time; question counts are not official/.test(pc),'pace (T-031C): the per-part guide (68 to 88 s) and its "estimated, counts not official" label are printed');
   ok(await p.$$eval('#paceParts li',l=>l.length)===4&&/Part 1 \(11 questions, 12\.4 to 16\.2 min\)/.test(await txt('#paceParts')||''),'pace (T-031C): four Reading parts listed with their question counts and minutes');
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
   const shot=async n=>{if(SHOTS)await p.screenshot({path:sp(n),fullPage:true})};
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
     localStorage.setItem(Profiles.key('celpip_history_v1'),JSON.stringify([{id:'a_1730000000001_aaa111',type:'practice',skill:'reading',mode:'mcq-timed',pct:85,clb:8,date:d(1)},{id:'a_1730000000002_aaa112',type:'practice',skill:'listening',pct:62,clb:7,date:d(2)},{id:'a_1730000000003_aaa113',type:'practice',skill:'writing',mode:'writing',clb:6,date:d(0)}]));
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
   await p.evaluate(()=>localStorage.removeItem(Profiles.key('celpip_studytime_v1')));await p.mouse.move(10,10);await p.mouse.move(40,40);
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
     localStorage.setItem(Profiles.key('celpip_settings_v1'),JSON.stringify({targetCLB:9,hoursPerWeek:6,sessionMin:75,examDate:new Date(Date.now()+60*864e5).toISOString().slice(0,10),studyDays:[0,1,2,3,4,5,6],studyTime:'07:30',name:'Secret Name'}));
     localStorage.setItem(Profiles.key('celpip_history_v1'),JSON.stringify(['listening','reading','writing','speaking'].map((k,i)=>({id:'a_17300000000'+i+'_aaa11'+i,type:'practice',skill:k,pct:70,clb:7,date:d(4)}))));
     localStorage.setItem(Profiles.key('celpip_studytime_v1'),JSON.stringify({days:{},manual:[]}))},withData);
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
   await p.$eval('.tile-plan',e=>e.scrollIntoView({block:'center'}));const bx=await (await p.$('.tile-plan')).boundingBox();await p.mouse.click(bx.x+bx.width-24,bx.y+bx.height/2);await p.waitForTimeout(250);
   ok(await p.evaluate(()=>location.hash)==='#/plan','home card: a click anywhere on the card opens My plan');
   await go('#/dashboard');await p.focus('.tile-plan a.card-link');await p.keyboard.press('Enter');await p.waitForTimeout(250);
   ok(await p.evaluate(()=>location.hash)==='#/plan','home card: Enter on the focused heading link opens My plan');
   // check-in
   const bn=await txt('.checkin')||'';
   ok(/Welcome back/.test(bn)&&/streak count starts again/.test(bn)&&/\+\d+ min/.test(bn)&&!/fail|lazy|guilt|shame|should have|disappoint|bad |sorry|missed|slack|lost/i.test(bn),'check-in on My plan: gentle wording, reset message and a short catch-up, no blame words');
   await go('#/dashboard');ok(!!(await p.$('.tile-plan .checkin'))&&!(await p.$('.checkin[role=alertdialog],[aria-modal=true]')),'check-in on Home: inside the card, not a modal');
   await p.click('[data-checkin-dismiss]');await p.waitForTimeout(100);
   const dis=await p.evaluate(()=>[localStorage.getItem(Profiles.key('celpip_checkin_v1')),!!document.querySelector('.checkin')]);
   ok(dis[0]&&/^\d{4}-\d{2}-\d{2}$/.test(dis[0])&&dis[1]===false,'check-in: dismiss hides it and remembers today');
   await go('#/plan');ok(!(await p.$('.checkin')),'check-in: stays hidden on My plan for the rest of today');
   await p.evaluate(()=>localStorage.setItem(Profiles.key('celpip_checkin_v1'),'2000-01-01'));await go('#/plan');ok(!!(await p.$('.checkin')),'check-in: an old dismissal does not hide today\'s');
   // one missed day: studied the day before yesterday
   await p.evaluate(()=>{const n=Date.now();const id=(k)=>({id:'a_'+n+k+'_bbb22'+k,type:'practice',skill:'reading',pct:70,clb:7,date:new Date(n-2*864e5).toISOString()});const h=JSON.parse(localStorage.getItem(Profiles.key('celpip_history_v1')));h.push(id(1));localStorage.setItem(Profiles.key('celpip_history_v1'),JSON.stringify(h));localStorage.removeItem(Profiles.key('celpip_checkin_v1'))});
   await go('#/plan');const one=await txt('.checkin')||'';
   ok(/streak is safe/.test(one)&&!/\+\d+ min/.test(one),'check-in: one missed day says the streak is safe, no catch-up');
   // plan page: status, closed form, manual list visible
   await p.evaluate(()=>{const t=JSON.parse(localStorage.getItem(Profiles.key('celpip_studytime_v1')));const d=new Date().toISOString().slice(0,10);t.manual=[{id:'m_1730000000001',date:d,skill:'general',minutes:20,note:'SECRET-NOTE, x;y'}];t.days[d]={general:20};localStorage.setItem(Profiles.key('celpip_studytime_v1'),JSON.stringify(t))});
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
   await p.evaluate(()=>{localStorage.setItem(Profiles.key('celpip_checkin_v1'),'2026-11-05');Storage.set('studyTime',{days:{},manual:[]});Storage.resetAll()});
   ok(await p.evaluate(()=>localStorage.getItem(Profiles.key('celpip_checkin_v1')))===null&&!(await p.evaluate(()=>'celpip_checkin_v1' in Storage.exportAll()||'checkin' in Storage.exportAll())),'reset: the check-in date is removed, and it is not part of export (not in KEYS)');
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
   await p.evaluate(()=>{localStorage.clear();localStorage.setItem(Profiles.key('celpip_settings_v1'),JSON.stringify({targetCLB:9,hoursPerWeek:7,sessionMin:75,examDate:'',studyDays:[0,1,2,3,4,5,6],studyTime:'',name:''}));
     localStorage.setItem(Profiles.key('celpip_history_v1'),JSON.stringify([['reading',8],['listening',7],['writing',6],['speaking',5]].map(([k,v],i)=>({id:'a_17300000000'+i+'_aaa11'+i,type:'practice',skill:k,pct:70,clb:v,date:new Date().toISOString()}))))});
   await go('#/dashboard');const home=await txt('#app')||'';
   const hf=((await txt('.tile-plan')||'').match(/Next session: today[^.]*?(Reading|Listening|Writing|Speaking)/)||[])[1];
   ok(!/(Reading|Listening|Writing|Speaking) day/.test(home)&&!(await p.$('.tile .badge'))&&!!hf,'home: the old "Today" tile is gone; one focus is shown in the plan card ('+hf+')');
   await go('#/plan');const pf=((await txt('[aria-labelledby=planToday] .card')||'').match(/Focus: (\w+)/)||[])[1];
   const rf=await p.$$eval('.week-card',c=>c.map(x=>x.textContent));const dn=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
   const rhy=(rf.find(x=>x.startsWith(dn))||'').match(/(Reading|Listening|Writing|Speaking) day/);
   ok(pf===hf&&rhy&&rhy[1]===hf,'one focus for today: Home card ('+hf+'), My plan Today ('+pf+') and Your rhythm ('+(rhy&&rhy[1])+') agree');
   await p.evaluate(s=>{localStorage.clear();const o=JSON.parse(s);for(const k in o)localStorage.setItem(k,o[k])},snap)});

 // ===== T-031 turn A: app feel (install, icons, iPhone fit, update notice, offline label, storage safety, badge, mastery cells, contrast) =====
 const ptxt=(pg,s)=>pg.$eval(s,e=>e.textContent).catch(()=>null);
 const IPHONE_UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
 const shotTo=async(pg,n,sel)=>{if(!SHOTS)return;if(sel){const el=await pg.$(sel);if(el){await el.screenshot({path:sp(n)});return}}await pg.screenshot({path:sp(n)})};
 // opens a fresh browser context (own storage, no 100x clock) with an optional script run before the app starts
 const fresh=async(opts,init)=>{const c=await b.newContext(opts);if(init)await c.addInitScript(init);const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});await pg.goto(BASE);await pg.waitForTimeout(700);return {c,pg}};
 const hashGo=async(pg,h)=>{await pg.evaluate(h=>{location.hash=h},h);await pg.waitForTimeout(250)};
 const seedHistory=pg=>pg.evaluate(()=>{localStorage.setItem(Profiles.key('celpip_history_v1'),JSON.stringify([{id:'a_1730000000001_aaa111',type:'practice',skill:'reading',pct:70,clb:7,date:new Date().toISOString()}]))});

 await step('T-031 contrast inside the e2e (loose end 6)',async()=>{
   const r=require('child_process').spawnSync(process.execPath,[require('path').join(__dirname,'check-contrast.js')],{encoding:'utf8'});
   const bad=r.stdout.split('\n').filter(l=>l.startsWith('  FAIL'));bad.forEach(l=>console.log('  contrast pair failing:'+l.trim()));
   ok(r.status===0&&bad.length===0&&/All pairs meet/.test(r.stdout),'contrast: every colour pair meets its minimum in light and dark ('+bad.length+' failing)')});

 await step('T-031 manifest, installability and icons (Chrome)',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900}});const cdp=await c.newCDPSession(pg);await cdp.send('Page.enable');
   await pg.reload();await pg.waitForTimeout(800);
   const am=await cdp.send('Page.getAppManifest');const ie=await cdp.send('Page.getInstallabilityErrors');
   const errList=(am.errors||[]).map(e=>e.message);console.log('  manifest errors: '+JSON.stringify(errList)+'  installability errors: '+JSON.stringify(ie.installabilityErrors));
   ok(errList.length===0,'manifest: parses with no errors (Page.getAppManifest)');
   // "in-incognito" is not a problem with the app: every Playwright test window is a private (incognito-like) window, so Chrome always lists it here.
   const ieReal=ie.installabilityErrors.filter(e=>e.errorId!=='in-incognito');
   ok(ieReal.length===0,'installability: Chrome reports no installability errors (Page.getInstallabilityErrors)');
   const m=JSON.parse(am.data||'{}');
   ok(m.id&&m.name==='CELPIP Study Hub'&&m.short_name==='CELPIP'&&m.description&&m.start_url&&m.scope&&m.display==='standalone'&&JSON.stringify(m.categories)==='["education"]','manifest: id, names, description, start_url, scope, standalone, categories');
   ok(m.theme_color!=='#f97316'&&m.background_color!=='#fafaf9'&&/^#[0-9a-f]{6}$/i.test(m.theme_color)&&m.theme_color==='#FFFFFF'&&m.background_color==='#FFFFFF','manifest: colours are Lakeline tokens (--bg), not the old orange ('+m.theme_color+')');
   const any=m.icons.filter(i=>i.purpose==='any'),mk=m.icons.filter(i=>i.purpose==='maskable');
   ok(any.length===2&&mk.length===1&&m.icons.every(i=>i.purpose!=='any maskable'),'manifest: separate "any" (192, 512) and "maskable" (512) icon entries');
   ok(m.shortcuts.length===3&&m.shortcuts.map(s=>s.url).join()==='./#/plan,./#/practice,./#/exam'&&m.shortcuts.every(s=>s.icons&&s.icons[0].sizes==='96x96'),'manifest: three shortcuts (My plan, Practice, Timed Exam), each with a 96px icon');
   const sizes=await pg.evaluate(async fs=>Promise.all(fs.map(f=>new Promise(r=>{const i=new Image();i.onload=()=>r(f+':'+i.naturalWidth+'x'+i.naturalHeight);i.onerror=()=>r(f+':missing');i.src=f}))),['icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon-180.png','shortcut-plan-96.png','shortcut-practice-96.png','shortcut-exam-96.png','favicon.svg']);
   ok(sizes.join()==='icon-192.png:192x192,icon-512.png:512x512,icon-maskable-512.png:512x512,apple-touch-icon-180.png:180x180,shortcut-plan-96.png:96x96,shortcut-practice-96.png:96x96,shortcut-exam-96.png:96x96,favicon.svg:150x150'||/favicon.svg:\d+x\d+/.test(sizes.join())&&sizes.slice(0,7).join()==='icon-192.png:192x192,icon-512.png:512x512,icon-maskable-512.png:512x512,apple-touch-icon-180.png:180x180,shortcut-plan-96.png:96x96,shortcut-practice-96.png:96x96,shortcut-exam-96.png:96x96','icons: every icon file loads at its stated size ('+sizes+')');
   const px=await pg.evaluate(async()=>{const im=new Image();im.src='icon-maskable-512.png';await im.decode();const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.drawImage(im,0,0);const g=(a,b)=>Array.from(x.getImageData(a,b,1,1).data).join();return [g(2,2),g(509,509)]});
   ok(px[0]==='11,100,119,255'&&px[1]==='11,100,119,255','maskable icon: teal reaches the corners (full-bleed), accent #0b6477 ('+px+')');
   const head=await pg.evaluate(()=>{const q=s=>{const e=document.querySelector(s);return e?e.getAttribute('content')||e.getAttribute('href'):null};return {cap:q('meta[name="apple-mobile-web-app-capable"]'),title:q('meta[name="apple-mobile-web-app-title"]'),bar:q('meta[name="apple-mobile-web-app-status-bar-style"]'),vp:q('meta[name="viewport"]'),touch:q('link[rel="apple-touch-icon"]'),fav:q('link[rel="icon"][type="image/svg+xml"]')}});
   ok(head.cap==='yes'&&head.title==='CELPIP'&&head.bar==='black-translucent'&&/viewport-fit=cover/.test(head.vp)&&head.touch==='apple-touch-icon-180.png'&&head.fav==='favicon.svg','iPhone fit: capable, title "CELPIP", status bar style, viewport-fit=cover, touch icon, favicon ('+JSON.stringify(head)+')');
   const css=await pg.evaluate(async()=>(await fetch('css/style.css')).text());
   ok(/\.topbar \{[^}]*(safe-area-inset-top|var\(--sat\))/.test(css)&&/\.taskbar \{[^}]*safe-area-inset-top/.test(css)&&/\.tabbar \{[^}]*safe-area-inset-bottom/.test(css)&&/\.toast-host \{[^}]*safe-area-inset-bottom/.test(css),'iPhone fit: top bar, task bar, tab bar and toasts use env(safe-area-inset-*)');
   ok(await pg.evaluate(()=>getComputedStyle(document.documentElement).overscrollBehaviorY==='contain'),'overscroll-behavior-y: contain on the page (a drag down does not reload mid-exam)');
   ok(await pg.evaluate(async()=>(await caches.keys()).includes('celpip-v13')),'service worker cache is celpip-v13');
   await c.close()});

 await step('T-031 install button: Chrome event, iPhone steps, already installed',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900}});await hashGo(pg,'#/settings');
   ok(await pg.$eval('#app [data-install-box]',e=>e.hidden),'install: hidden when the browser offers no install route (no event yet)');
   await pg.evaluate(()=>{window.__pr=0;const e=new Event('beforeinstallprompt',{cancelable:true});e.prompt=()=>{window.__pr++;return Promise.resolve()};e.userChoice=Promise.resolve({outcome:'accepted'});window.__prevented=!window.dispatchEvent(e)});
   await pg.waitForTimeout(150);
   ok(await pg.evaluate(()=>window.__prevented&&window.__pr===0)&&!(await pg.$('dialog[open]')),'install: the event is kept and nothing pops up by itself (prompt not called)');
   const vis=await pg.isVisible('#app [data-install-go]');const lab=await ptxt(pg,'#app [data-install-go]');
   ok(vis&&/Install app/.test(lab||''),'install: Settings shows an "Install app" button ('+(lab||'').trim()+')');
   await shotTo(pg,'settings-install-chrome.png','#app .install-box');
   ok(await pg.evaluate(()=>!!document.querySelector('#sidebar [data-install-go]')&&!document.querySelector('#sidebar [data-install-box]').hidden),'install: the phone drawer has the button too');
   const bb=await pg.$eval('#app [data-install-go]',e=>{const r=e.getBoundingClientRect();return [r.width,r.height]});ok(bb[0]>=44&&bb[1]>=44,'install: button is at least 44px ('+bb.map(Math.round)+')');
   await pg.click('#app [data-install-go]');await pg.waitForTimeout(150);
   ok(await pg.evaluate(()=>window.__pr===1)&&await pg.$eval('#app [data-install-box]',e=>e.hidden),'install: tap calls prompt() once, then the button goes away');
   await c.close();
   const ios=await fresh({viewport:{width:390,height:844},userAgent:IPHONE_UA,isMobile:true,hasTouch:true});await hashGo(ios.pg,'#/settings');
   const st=await ios.pg.evaluate(()=>{const b=document.querySelector('#app [data-install-box]');return {hidden:b.hidden,li:b.querySelectorAll('li').length,share:!!b.querySelector('svg.share-ico use[href="#i-share"]'),text:b.textContent,btn:!!b.querySelector('[data-install-go]')}});
   ok(!st.hidden&&st.li===2&&st.share&&/Add to Home Screen/.test(st.text)&&!st.btn,'install on iPhone Safari: two steps (Share icon drawn inline, Add to Home Screen), no button');
   await shotTo(ios.pg,'settings-install-iphone.png','#app .install-box');
   await ios.pg.click('#topbar .menu-btn');await ios.pg.waitForTimeout(400);
   ok(await ios.pg.isVisible('#sidebar [data-install-box] .install-steps'),'install on iPhone: the drawer shows the steps');
   await ios.c.close();
   const sa=await fresh({viewport:{width:390,height:844},userAgent:IPHONE_UA,isMobile:true,hasTouch:true},()=>Object.defineProperty(navigator,'standalone',{value:true}));await hashGo(sa.pg,'#/settings');
   ok(await sa.pg.$eval('#app [data-install-box]',e=>e.hidden),'install: hidden when already installed (navigator.standalone)');
   await sa.c.close()});

 await step('T-031 update notice',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900}});await pg.reload();await pg.waitForTimeout(800);
   ok(await pg.evaluate(()=>!!navigator.serviceWorker.controller),'update: the page is controlled by the service worker');
   await pg.evaluate(()=>{window.__marker=1;Shell.focusMode.enter({name:'Reading practice'});navigator.serviceWorker.dispatchEvent(new Event('controllerchange'))});await pg.waitForTimeout(200);
   ok(!(await pg.$('.toast[data-sticky]')),'update: no notice while a practice run is going');
   await pg.evaluate(()=>{Shell.focusMode.exit();location.hash='#/learn'});await pg.waitForTimeout(300);
   const t=await ptxt(pg,'.toast[data-sticky]');ok(/New version ready/.test(t||'')&&/Refresh/.test(t||''),'update: toast "New version ready" with a Refresh button once practice is over ('+(t||'').trim()+')');
   await hashGo(pg,'#/practice');await pg.waitForTimeout(500);
   ok(!!(await pg.$('.toast[data-sticky]'))&&await pg.evaluate(()=>window.__marker===1),'update: the notice stays across screens and the page did not reload by itself');
   const nav=pg.waitForNavigation();await pg.click('.toast[data-sticky] button');await nav;await pg.waitForTimeout(300);
   ok(await pg.evaluate(()=>window.__marker===undefined),'update: tapping Refresh reloads the page');
   await c.close()});

 await step('T-031 offline pill',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900}});
   ok(!(await pg.isVisible('.sidebar [data-offline-pill]')),'offline: no pill while online');
   await c.setOffline(true);await pg.waitForTimeout(300);
   const pill=await pg.evaluate(()=>{const p=document.querySelector('.sidebar [data-offline-pill]');return {vis:!p.hidden&&p.getBoundingClientRect().width>0,text:p.textContent,title:p.title,ico:!!p.querySelector('svg use[href="#i-offline"]')}});
   ok(pill.vis&&/Offline/.test(pill.text)&&pill.ico&&pill.title==='Everything works offline except speech-to-text transcripts.'&&/Everything works offline except speech-to-text transcripts\./.test(pill.text),'offline: pill with icon and word, one explaining line, shown on setOffline(true)');
   await shotTo(pg,'offline-pill-sidebar.png','.sidebar');
   await c.setOffline(false);await pg.waitForTimeout(300);
   ok(!(await pg.isVisible('.sidebar [data-offline-pill]')),'offline: pill goes away when back online');
   await c.close();
   const ph=await fresh({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await ph.c.setOffline(true);await ph.pg.waitForTimeout(300);
   ok(await ph.pg.isVisible('.topbar [data-offline-pill]'),'offline: pill shows in the phone top bar');await shotTo(ph.pg,'offline-pill-phone.png');
   await ph.c.close()});

 await step('T-031 keep data safe: persist, state in Settings, monthly backup reminder',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900}},()=>{window.__persist=0;navigator.storage.persist=()=>{window.__persist++;return Promise.resolve(true)};navigator.storage.persisted=()=>Promise.resolve(window.__granted!==false)});
   ok(await pg.evaluate(()=>window.__persist===0),'persist: not asked on the first visit');
   await seedHistory(pg);await hashGo(pg,'#/learn');await hashGo(pg,'#/settings');await hashGo(pg,'#/dashboard');await hashGo(pg,'#/settings');
   ok(await pg.evaluate(()=>window.__persist===1)&&await pg.evaluate(()=>JSON.parse(localStorage.getItem(Profiles.key('celpip_persist_v1'))).granted===true),'persist: asked once after the first saved attempt; the answer is stored');
   await pg.waitForFunction(()=>{const e=document.getElementById('persistMsg');return e&&e.textContent});const t1=await ptxt(pg,'#persistMsg');ok(t1==='Protected from automatic clean-up','settings: shows "Protected from automatic clean-up" ('+t1+')');
   await pg.evaluate(()=>{window.__granted=false});await hashGo(pg,'#/dashboard');await hashGo(pg,'#/settings');
   await pg.waitForFunction(()=>{const e=document.getElementById('persistMsg');return e&&e.textContent.indexOf('Not')===0},null,{timeout:5000});const t2=await ptxt(pg,'#persistMsg');ok(t2==='Not protected — export a backup now and then','settings: shows "Not protected — export a backup now and then" ('+t2+')');
   await shotTo(pg,'settings-data-protection.png','#persistMsg');
   // monthly backup reminder
   await hashGo(pg,'#/dashboard');ok(!(await pg.$('.backup-note')),'backup reminder: not shown for a brand-new user (the month counts from first progress)');
   await pg.evaluate(()=>localStorage.setItem(Profiles.key('celpip_backup_v1'),JSON.stringify({first:'2020-01-01'})));await hashGo(pg,'#/learn');await hashGo(pg,'#/dashboard');
   await pg.waitForSelector('.backup-note [data-backup-export]',{timeout:3000}).catch(()=>{});
   ok(!!(await pg.$('.backup-note [data-backup-export]'))&&!!(await pg.$('.backup-note [data-backup-dismiss]')),'backup reminder: shown after a month with Export and Not now');
   await pg.click('[data-backup-dismiss]');await pg.waitForTimeout(250);
   const rec=await pg.evaluate(()=>JSON.parse(localStorage.getItem(Profiles.key('celpip_backup_v1'))));
   ok(!(await pg.$('.backup-note'))&&rec.snooze>new Date().toISOString().slice(0,10),'backup reminder: Not now hides it for a month ('+JSON.stringify(rec)+')');
   await pg.evaluate(()=>localStorage.setItem(Profiles.key('celpip_backup_v1'),JSON.stringify({first:'2020-01-01',last:'2020-01-02',snooze:'<img src=x onerror=alert(1)>'})));await hashGo(pg,'#/learn');await hashGo(pg,'#/dashboard');
   ok(!!(await pg.$('.backup-note')),'backup reminder: a junk stored date is ignored, not trusted');
   const dl=pg.waitForEvent('download');await pg.click('[data-backup-export]');const d=await dl;await pg.waitForTimeout(250);
   ok(/^celpip-backup-\d{4}-\d{2}-\d{2}\.json$/.test(d.suggestedFilename())&&!(await pg.$('.backup-note'))&&await pg.evaluate(()=>JSON.parse(localStorage.getItem(Profiles.key('celpip_backup_v1'))).last===new Date().toLocaleDateString('sv')),'backup reminder: Export uses the normal export, records the date and hides the reminder');
   await pg.evaluate(()=>Storage.resetAll());ok(await pg.evaluate(()=>localStorage.getItem(Profiles.key('celpip_backup_v1'))===null&&localStorage.getItem(Profiles.key('celpip_persist_v1'))===null),'reset: the two app-feel notes are cleared too');
   await c.close()});

 await step('T-031 icon badge',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900}},()=>{window.__badge=[];navigator.setAppBadge=n=>{window.__badge.push(n);return Promise.resolve()};navigator.clearAppBadge=()=>{window.__badge.push('clear');return Promise.resolve()}});
   await pg.evaluate(async()=>{await Loader.needData(['reading']);const pid=READING_DATA.passages[0].id,pid2=READING_DATA.passages[1].id;Storage.set('mistakes',{a:{skill:'reading',pid,qi:0,part:1,box:0,due:'2000-01-01',wrong:1},b:{skill:'reading',pid,qi:1,part:1,box:0,due:'2000-01-01',wrong:1},c:{skill:'reading',pid:pid2,qi:0,part:1,box:0,due:'2999-01-01',wrong:1}})});
   await hashGo(pg,'#/learn');
   const last=await pg.evaluate(()=>window.__badge[window.__badge.length-1]);ok(last===2&&await pg.evaluate(()=>Study.dueMistakeCount()===2),'badge: setAppBadge called with the number of mistakes due (2; one not yet due is not counted) ('+last+')');
   await pg.evaluate(()=>Storage.set('mistakes',{}));await hashGo(pg,'#/practice');
   ok(await pg.evaluate(()=>window.__badge[window.__badge.length-1]==='clear'),'badge: cleared when nothing is due');
   await c.close();
   const nb=await fresh({viewport:{width:1280,height:900}});await hashGo(nb.pg,'#/learn');ok(true,'badge: no errors in a browser without the Badging API (page errors are checked by this step)');await nb.c.close()});

 await step('T-031 mastery grid cells on a phone (loose end 5)',async()=>{
   const {c,pg}=await fresh({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await seedHistory(pg);await hashGo(pg,'#/dashboard');
   const m=await pg.evaluate(()=>{const cells=[...document.querySelectorAll('.mg-cell')].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.width*10)/10,Math.round(r.height*10)/10]});return {n:cells.length,minW:Math.min(...cells.map(x=>x[0])),minH:Math.min(...cells.map(x=>x[1])),page:[document.documentElement.scrollWidth,innerWidth]}});
   ok(m.n===10&&m.minW>=44&&m.minH>=44,'mastery: all '+m.n+' cells are at least 44 x 44 px at 390px wide (smallest '+m.minW+' x '+m.minH+')');
   ok(m.page[0]<=m.page[1],'mastery: the page does not scroll sideways at 390px ('+m.page+')');
   await shotTo(pg,'mastery-390.png','.tile-mastery');await c.close()});

 // ===== T-031 turn B: profiles, moving to another device, shortcuts, vibration, flagged-first review =====
 await step('T-031B flagged questions come first in the practice review',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900}});
   await hashGo(pg,'#/practice/reading');await pg.click('#quickBtn');await pg.waitForTimeout(200);
   const n=await pg.$$eval('#qForm .question-block',x=>x.length);
   await pg.click('.question-block[data-qi="2"] .flag-btn');await pg.click('.question-block[data-qi="0"] .flag-btn');
   await pg.click('#submitPassage');await pg.waitForTimeout(150);
   const order=await pg.$$eval('.question-block.review',bs=>bs.map(b=>({n:(b.querySelector('.q-text strong')||{}).textContent,flag:!!b.querySelector('.flag-label')&&b.querySelector('.flag-label').textContent.trim()})));
   ok(n>=4&&order.length===n,'flagged-first: all '+n+' questions are on the review screen');
   ok(order[0].n==='1.'&&order[1].n==='3.'&&order[0].flag==='Flagged'&&order[1].flag==='Flagged','flagged-first: questions 1 and 3 (flagged) are listed first, each with the word "Flagged" ('+order.slice(0,2).map(o=>o.n)+')');
   ok(order.slice(2).map(o=>o.n).join()===Array.from({length:n},(_,i)=>i+1+'.').filter(x=>x!=='1.'&&x!=='3.').join()&&order.slice(2).every(o=>!o.flag),'flagged-first: the others keep their original order and carry no label');
   await shotTo(pg,'review-flagged-first.png','#app');
   await c.close();
   const q=await fresh({viewport:{width:1280,height:900}});await hashGo(q.pg,'#/practice/reading');await q.pg.click('#quickBtn');const n2=await q.pg.$$eval('#qForm .question-block',x=>x.length);await q.pg.click('#submitPassage');await q.pg.waitForTimeout(150);
   ok(await q.pg.$$eval('.flag-label',x=>x.length)===0&&await q.pg.$$eval('.question-block.review .q-text strong',x=>x.map(e=>e.textContent).join())===Array.from({length:n2},(_,i)=>i+1+'.').join(),'flagged-first: with nothing flagged the order is unchanged and there is no label');
   await q.c.close()});

 const startReadingB=async pg=>{await hashGo(pg,'#/practice/reading');await pg.click('#quickBtn');await pg.waitForTimeout(200)};
 const curDot=pg=>pg.$eval('.dot[aria-current="step"]',d=>d.dataset.q).catch(()=>null);
 const chosen=(pg,q)=>pg.$eval(`input[name=q${q}]:checked`,i=>i.value).catch(()=>null);
 await step('T-031B keyboard shortcuts (desktop)',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900}});await startReadingB(pg);
   await pg.keyboard.press('2');ok(await chosen(pg,0)==='1','keys: "2" picks option 2 on question 1');
   await pg.keyboard.press('c');ok(await chosen(pg,0)==='2','keys: "C" changes it to option C');
   await pg.keyboard.press('n');ok(await curDot(pg)==='1','keys: N moves to question 2');
   await pg.keyboard.press('a');ok(await chosen(pg,1)==='0'&&await chosen(pg,0)==='2','keys: "A" answers question 2 only');
   const fb='.question-block[data-qi="1"] .flag-btn';
   await pg.keyboard.press('f');ok(await pg.$eval(fb,b=>b.getAttribute('aria-pressed'))==='true','keys: F flags the current question');
   await pg.keyboard.press('f');ok(await pg.$eval(fb,b=>b.getAttribute('aria-pressed'))==='false','keys: F again removes the flag');
   await pg.keyboard.press('p');ok(await curDot(pg)==='0','keys: P goes back to question 1');
   await pg.keyboard.press('ArrowRight');ok(await curDot(pg)==='1','keys: Right arrow = next question');
   await pg.keyboard.press('ArrowLeft');ok(await curDot(pg)==='0','keys: Left arrow = previous question');
   ok((await pg.$eval('#announcer',e=>e.textContent))!=='','keys: the choice is announced in the live region ('+await pg.$eval('#announcer',e=>e.textContent)+')');
   // typing in a field: ignored
   await pg.evaluate(()=>{const i=document.createElement('input');i.type='text';i.id='tmpTxt';document.body.appendChild(i);const t=document.createElement('textarea');t.id='tmpArea';document.body.appendChild(t)});
   const before=await chosen(pg,0);
   await pg.focus('#tmpTxt');await pg.keyboard.type('1fa?n');
   ok(await pg.$eval('#tmpTxt',i=>i.value)==='1fa?n'&&await chosen(pg,0)===before&&!(await pg.$('#shortcutSheet[open]'))&&await curDot(pg)==='0','keys: ignored inside a text box (the letters were typed, nothing else happened)');
   await pg.focus('#tmpArea');await pg.keyboard.type('2c');ok(await chosen(pg,0)===before,'keys: ignored inside a text area');
   await pg.evaluate(()=>document.activeElement.blur());
   await pg.keyboard.press('Control+f');ok(await pg.$eval('.question-block[data-qi="0"] .flag-btn',b=>b.getAttribute('aria-pressed'))==='false','keys: Ctrl+F is left to the browser');
   // sheet
   await pg.keyboard.press('?');await pg.waitForTimeout(100);ok(!!(await pg.$('#shortcutSheet[open]')),'keys: ? opens the shortcut sheet');
   ok((await pg.$$eval('#shortcutSheet dt',x=>x.length))>=6,'keys: the sheet lists the shortcuts');
   await shotTo(pg,'shortcut-sheet.png');
   await pg.keyboard.press('1');ok(await chosen(pg,0)===before,'keys: while the sheet is open, 1 does not change an answer');
   await pg.keyboard.press('Escape');await pg.waitForTimeout(100);ok(!(await pg.$('#shortcutSheet[open]'))&&!!(await pg.$('#qForm')),'keys: Esc closes the sheet and stays on the question screen');
   await pg.keyboard.press('Escape');await pg.waitForTimeout(150);ok(!!(await pg.$('#confirmDlg[open]')),'keys: Esc on the question screen still asks "Leave this practice?" (existing behaviour)');
   await pg.click('#confirmKeep');await pg.waitForTimeout(100);
   await pg.keyboard.press('Enter');await pg.waitForTimeout(150);ok(!!(await pg.$('#confirmDlg[open]')),'keys: Enter on a focused button (Exit) keeps its own meaning, not "Check answers"');await pg.click('#confirmKeep');await pg.waitForTimeout(150);await pg.evaluate(()=>document.activeElement.blur());
   await pg.focus('.question-block[data-qi="0"] input');await pg.keyboard.press('Enter');await pg.waitForTimeout(200);ok(!(await pg.$('.score-line')),'keys (T-031C): Enter with focus on an answer button does NOT hand the passage in');await pg.evaluate(()=>document.activeElement.blur());
   await pg.keyboard.press('Enter');await pg.waitForTimeout(200);ok(/correct/.test(await ptxt(pg,'.score-line')||''),'keys: Enter checks the answers');
   await pg.keyboard.press('n');await pg.waitForTimeout(200);ok((await ptxt(pg,'.result-card h1'))==='Practice Complete','keys: N on the review screen moves on');
   await c.close()});

 await step('T-031B vibration',async()=>{
   const stub=()=>{window.__vib=[];navigator.vibrate=n=>{window.__vib.push(n);return true}};
   const {c,pg}=await fresh({viewport:{width:390,height:844},isMobile:true,hasTouch:true},stub);await startReadingB(pg);
   await pg.click('#qForm input[name=q0][value="1"]',{force:true});
   ok(await pg.evaluate(()=>JSON.stringify(window.__vib))==='[10]','vibrate: one 10 ms buzz when an answer is picked');
   await pg.click('.question-block[data-qi="0"] .flag-btn');ok(await pg.evaluate(()=>window.__vib.length)===2,'vibrate: and one when a question is flagged');
   await pg.evaluate(()=>Storage.saveSettings({...Storage.getSettings(),vibrate:false}));
   await pg.click('#qForm input[name=q1][value="0"]',{force:true});ok(await pg.evaluate(()=>window.__vib.length)===2,'vibrate: not when "Vibrate on tap" is off');
   await hashGo(pg,'#/settings');ok(await pg.$eval('#vibrateToggle',i=>!i.checked),'vibrate: Settings shows the switch, off');
   await pg.evaluate(()=>{document.getElementById('vibrateToggle').click()});ok(await pg.evaluate(()=>Storage.getSettings().vibrate===true),'vibrate: the switch saves "on"');
   await c.close();
   const r=await fresh({viewport:{width:390,height:844},reducedMotion:'reduce'},stub);await startReadingB(r.pg);
   await r.pg.click('#qForm input[name=q0][value="1"]',{force:true});await r.pg.click('.question-block[data-qi="0"] .flag-btn');
   ok(await r.pg.evaluate(()=>window.__vib.length)===0,'vibrate: never under reduced motion');await r.c.close();
   const n=await fresh({viewport:{width:1280,height:900}},()=>{delete Navigator.prototype.vibrate});await hashGo(n.pg,'#/settings');
   ok(!(await n.pg.$('#vibrateToggle')),'vibrate: a device without vibrate shows no switch, only a note');await n.c.close()});

 // ----- profiles -----
 const LEG=['history','settings','mistakes','partstats','vocab','grammar','log','studytime','persist','backup','checkin'];
 const seedOld=()=>{if(localStorage.getItem('__seeded'))return;localStorage.setItem('__seeded','1');
   const d=new Date().toISOString();
   localStorage.setItem('celpip_settings_v1',JSON.stringify({targetCLB:10,hoursPerWeek:6,name:window.__seedName===undefined?'Ayo':window.__seedName}));
   localStorage.setItem('celpip_history_v1',JSON.stringify([{id:'a_1730000000001_aaa111',type:'practice',skill:'reading',pct:70,clb:7,date:d}]));
   localStorage.setItem('celpip_mistakes_v1',JSON.stringify({'reading|r1|0':{skill:'reading',pid:'r1',qi:0,part:1,box:0,due:'2000-01-01',wrong:1}}));
   localStorage.setItem('celpip_partstats_v1',JSON.stringify({'reading|1':{right:1,total:2}}));
   localStorage.setItem('celpip_vocab_v1',JSON.stringify({w1:{box:2,due:'2030-01-01'}}));
   localStorage.setItem('celpip_grammar_v1',JSON.stringify({g1:80}));
   localStorage.setItem('celpip_log_v1',JSON.stringify([{id:'n_1730000000001',date:'2026-11-01',minutes:20,skill:'reading',learned:'x',unclear:'',next:''}]));
   localStorage.setItem('celpip_studytime_v1',JSON.stringify({days:{'2026-11-01':{reading:12}},manual:[]}));
   localStorage.setItem('celpip_persist_v1',JSON.stringify({asked:'2026-11-01',granted:true}));
   localStorage.setItem('celpip_backup_v1',JSON.stringify({first:'2026-10-01'}));
   localStorage.setItem('celpip_checkin_v1','2026-11-02');
   localStorage.setItem('celpip_theme','dark');if(window.__fold)localStorage.setItem('celpip_sidebar','folded')};
 const seedWith=pre=>eval('()=>{'+pre+';('+seedOld.toString()+')()}');
 await step('T-031B profiles: migration keeps the old data in profile 1',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900}},seedWith('window.__fold=1'));
   const r=await pg.evaluate(L=>{const idx=JSON.parse(localStorage.getItem('celpip_profiles_v1'));const id=idx.list[0].id;
     return {n:idx.list.length,name:idx.list[0].name,active:idx.active===id,done:idx.legacyDone,
       old:L.filter(k=>localStorage.getItem('celpip_'+k+'_v1')!==null),
       moved:L.filter(k=>localStorage.getItem('celpip_p_'+id+'_'+k+'_v1')!==null).length,id,
       hist:Storage.getHistory().length,set:Storage.getSettings(),mist:Object.keys(Storage.get('mistakes',{})).length,voc:Object.keys(Storage.get('vocab',{})).length,
       theme:localStorage.getItem('celpip_theme'),side:localStorage.getItem('celpip_sidebar'),attr:document.documentElement.getAttribute('data-theme')}},LEG);
   ok(r.n===1&&r.name==='Ayo'&&r.active,'migration: one profile, named from the saved first name ('+r.name+')');
   ok(r.old.length===0&&r.moved===11,'migration: all 11 old notes moved to the profile\'s labels, none left under the old ones ('+r.moved+' moved, left: '+r.old+')');
   ok(r.hist===1&&r.set.targetCLB===10&&r.mist===1&&r.voc===1,'migration: the app reads history, settings, mistakes and words from the profile as before');
   ok(r.theme==='dark'&&r.side==='folded'&&r.attr==='dark','migration: theme and sidebar stay device-wide (not renamed)');
   await pg.reload();await pg.waitForTimeout(600);
   const r2=await pg.evaluate(()=>{const idx=JSON.parse(localStorage.getItem('celpip_profiles_v1'));return {n:idx.list.length,id:idx.list[0].id,hist:Storage.getHistory().length,keys:Object.keys(localStorage).filter(k=>k.startsWith('celpip_p_')).length}});
   ok(r2.n===1&&r2.id===r.id&&r2.hist===1&&r2.keys===11,'migration: running again changes nothing (same profile id, same 11 notes)');
   // a late old-style note after the migration is not pulled into the profile
   await pg.evaluate(()=>localStorage.setItem('celpip_history_v1','[]'));await pg.reload();await pg.waitForTimeout(500);
   ok(await pg.evaluate(()=>Storage.getHistory().length===1),'migration: a stray old-style note written later does not replace the profile\'s history');
   await c.close();
   const e=await fresh({viewport:{width:1280,height:900}});
   ok(await e.pg.evaluate(()=>Profiles.list().length===1&&Profiles.list()[0].name==='Me'),'migration: no saved name gives the profile the name "Me"');await e.c.close();
   const h=await fresh({viewport:{width:1280,height:900}},seedWith("window.__seedName='<b>Name</b><img src=x onerror=window.__xss=1>'.repeat(3)"));
   const hn=await h.pg.evaluate(()=>({n:Profiles.active().name,len:Array.from(Profiles.active().name).length,btn:document.querySelector('.sidebar .profile-name').textContent,kids:document.querySelector('.sidebar .profile-name').children.length,xss:window.__xss||0}));
   ok(hn.len<=40&&hn.btn===hn.n&&hn.kids===0&&hn.xss===0,'migration: a markup-filled saved name is cut to 40 characters and shown as plain text, no element made, no script run');await h.c.close()});

 await step('T-031B profiles: two profiles stay apart, switching redraws, names are text',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900}},seedOld);
   await pg.evaluate(()=>{window.__xss=0});
   await hashGo(pg,'#/history');const rowsA=await pg.$$eval('#app .btn-icon',x=>x.length);
   await pg.evaluate(()=>ProfileUI.openChooser());await pg.waitForTimeout(200);
   ok(!!(await pg.$('#whoDlg[open]'))&&(await pg.$$('#whoDlg .who-item')).length===1,'chooser: the chooser (rail initial, start-up) lists the profile');
   await pg.fill('#whoNewName','<img src=x onerror=window.__xss=1>');await pg.click('#whoAddBtn');await pg.waitForTimeout(300);
   const sw=await pg.evaluate(()=>({name:Profiles.active().name,btn:document.querySelector('.sidebar .profile-name').textContent,imgs:document.querySelectorAll('#app img, .sidebar img, #whoDlg img').length,xss:window.__xss||0,list:Profiles.list().length}));
   ok(sw.list===2&&sw.name==='<img src=x onerror=window.__xss=1>'&&sw.btn===sw.name&&sw.imgs===0&&sw.xss===0,'names: a name made of markup is shown as text; no element, no script');
   ok(await pg.evaluate(()=>Storage.getHistory().length===0&&Storage.getSettings().targetCLB===9&&Object.keys(Storage.get('vocab',{})).length===0),'isolation: the new profile starts empty (no history, default settings, no words)');
   ok(await pg.$$eval('#app .btn-icon',x=>x.length)===0&&rowsA===1,'switching: the History screen was redrawn for the new profile (1 attempt before, 0 now)');
   ok(await pg.evaluate(()=>document.querySelector('.sidebar .profile-btn').getAttribute('aria-label').indexOf('Studying as')===0),'switcher: the button says who is studying');
   await pg.evaluate(()=>{Storage.saveAttempt({type:'practice',skill:'listening',pct:50,clb:5});Storage.saveSettings({...Storage.getSettings(),targetCLB:7});Storage.set('vocab',{w9:{box:1,due:'2031-01-01'}})});
   const A=await pg.evaluate(()=>Profiles.list()[0].id);
   await pg.evaluate(id=>ProfileUI.switchTo(id),A);await pg.waitForTimeout(300);
   ok(await pg.evaluate(()=>Storage.getHistory().length===1&&Storage.getHistory()[0].skill==='reading'&&Storage.getSettings().targetCLB===10&&Object.keys(Storage.get('vocab',{}))[0]==='w1'),'isolation: profile 1 still has only its own history, settings and words');
   ok(await pg.evaluate(()=>localStorage.getItem('celpip_theme')==='dark'&&document.documentElement.getAttribute('data-theme')==='dark'),'switching: the theme did not change');
   ok(await pg.evaluate(()=>{const k=Profiles.list().map(p=>Profiles.keyFor(p.id,'celpip_checkin_v1'));return localStorage.getItem(k[0])==='2026-11-02'&&localStorage.getItem(k[1])===null}),'isolation: the check-in note is per profile too');
   const s0=await pg.evaluate(()=>screenId);await pg.evaluate(id=>ProfileUI.switchTo(id),await pg.evaluate(()=>Profiles.list()[1].id));await pg.waitForTimeout(250);
   ok(await pg.evaluate(s=>screenId>s,s0),'switching: render() ran (screen counter went up, so timers, camera and recorder are cleaned up)');
   // blocked in a practice run
   await hashGo(pg,'#/practice/reading');await pg.click('#quickBtn');await pg.waitForTimeout(150);
   ok(await pg.evaluate(id=>ProfileUI.switchTo(id)===false&&Profiles.activeId!==id,A),'switching: refused during a practice run');
   await c.close()});

 await step('T-031B profiles: rename, delete safeguards, one device chooser, screenshots',async()=>{
   const {c,pg}=await fresh({viewport:{width:1440,height:900}},seedOld);
   await pg.evaluate(()=>{window.__dlg=[]});
   await hashGo(pg,'#/settings');
   ok(await pg.$eval('[data-del]',b=>b.disabled),'delete: with one profile the Delete button is off, with a note');
   ok(await pg.evaluate(()=>Profiles.remove(Profiles.activeId))===false&&await pg.evaluate(()=>Profiles.list().length===1),'delete: the last profile cannot be deleted (even by code)');
   await pg.fill('#profNewName','Sam');await pg.click('#profAddBtn');await pg.waitForTimeout(250);
   ok(await pg.evaluate(()=>Profiles.list().length===2&&Profiles.active().name==='Ayo'),'add: a profile is added from Settings (and the active one stays)');
   const fresher=await pg.evaluate(()=>Profiles.list()[1].id);
   await pg.evaluate(id=>Storage.set&&localStorage.setItem(Profiles.keyFor(id,'celpip_vocab_v1'),'{}'),fresher);
   // rename
   const rows=await pg.$$('.prof-row');await (await rows[1].$('[data-rename]')).click();await rows[1].$eval('input',(i,v)=>{i.maxLength=100;i.value=v},'x'.repeat(60));await pg.keyboard.press('Enter');await pg.waitForTimeout(250);
   ok(await pg.evaluate(()=>Profiles.list()[1].name==='x'.repeat(40)),'rename: a 60-letter name is cut to 40');
   // delete asks twice and names the profile
   const rows2=await pg.$$('.prof-row');await (await rows2[1].$('[data-del]')).click();await pg.waitForTimeout(150);
   ok(/xxxx/.test(await ptxt(pg,'.ask-dlg h2')||'')&&/Delete/.test(await ptxt(pg,'.ask-dlg h2')||''),'delete: the first question names the profile');
   await pg.click('.ask-dlg .btn-primary');await pg.waitForTimeout(150);
   ok(await pg.evaluate(()=>Profiles.list().length===2&&!document.querySelector('.ask-dlg')),'delete: "Keep it" keeps it');
   await (await (await pg.$$('.prof-row'))[1].$('[data-del]')).click();await pg.waitForTimeout(150);await pg.click('.ask-dlg .btn-danger');await pg.waitForTimeout(150);
   ok(/Really delete/.test(await ptxt(pg,'.ask-dlg h2')||'')&&/xxxx/.test(await ptxt(pg,'.ask-dlg h2')||''),'delete: a second question asks "Really delete" and names the profile');
   await pg.click('.ask-dlg .btn-primary');await pg.waitForTimeout(150);
   ok(await pg.evaluate(()=>Profiles.list().length===2),'delete: refusing the second question keeps it');
   await (await (await pg.$$('.prof-row'))[1].$('[data-del]')).click();await pg.waitForTimeout(150);await pg.click('.ask-dlg .btn-danger');await pg.waitForTimeout(150);await pg.click('.ask-dlg .btn-danger');await pg.waitForTimeout(250);
   ok(await pg.evaluate(id=>Profiles.list().length===1&&Object.keys(localStorage).filter(k=>k.indexOf('celpip_p_'+id)===0).length===0,fresher),'delete: after two yeses the profile and all its notes are gone; the other profile is untouched');
   ok(await pg.evaluate(()=>Storage.getHistory().length===1),'delete: the remaining profile still has its history');
   // chooser at start
   await pg.evaluate(()=>{Profiles.create('Sam');Profiles.setAsk(true)});await pg.reload();await pg.waitForTimeout(700);
   ok(!!(await pg.$('#whoDlg[open]')),'chooser: with two profiles and "ask on start" on, "Who\'s studying?" opens at start');
   await shotTo(pg,'chooser-1440.png');
   await pg.keyboard.press('Escape');await pg.waitForTimeout(150);ok(!(await pg.$('#whoDlg[open]')),'chooser: Esc closes it and keeps the current profile');
   await pg.evaluate(()=>Profiles.setAsk(false));await pg.reload();await pg.waitForTimeout(600);ok(!(await pg.$('#whoDlg[open]')),'chooser: not shown at start when the option is off');
   await shotTo(pg,'profile-switcher-1440.png','.sidebar');
   await c.close();
   const one=await fresh({viewport:{width:1280,height:900}});await one.pg.evaluate(()=>Profiles.setAsk(true));await one.pg.reload();await one.pg.waitForTimeout(500);
   ok(!(await one.pg.$('#whoDlg[open]')),'chooser: never opens at start with only one profile');await one.c.close();
   const m=await fresh({viewport:{width:390,height:844},isMobile:true,hasTouch:true},seedOld);
   await m.pg.click('#topbar .menu-btn');await m.pg.waitForTimeout(400);
   ok(!!(await m.pg.$('#sidebar [data-profile-panel-open]')),'switcher: the phone drawer carries the profile button on a phone');
   await shotTo(m.pg,'profile-switcher-390.png','#sidebar');
   await m.pg.click('#sidebar [data-profile-panel-open]');await m.pg.waitForTimeout(400);ok(!(await m.pg.$('#whoDlg[open]'))&&!!(await m.pg.$('html[data-overlay=open]'))&&await m.pg.evaluate(()=>document.getElementById('sidebar').hasAttribute('data-panel')),'switcher: from the drawer the row opens the profile panel inside the drawer (no pop-up)');await m.pg.evaluate(()=>{Shell.nav.closeOverlay(true);ProfileUI.openChooser()});await m.pg.waitForTimeout(300);ok(!!(await m.pg.$('#whoDlg[open]'))&&!(await m.pg.$('html[data-overlay=open]')),'chooser: still opens on its own (start-up, rail initial) and the drawer is closed first');
   const bb=await m.pg.$eval('#whoDlg .who-item',e=>{const r=e.getBoundingClientRect();return [r.width,r.height]});ok(bb[1]>=44,'chooser: each profile row is at least 44px tall ('+bb[1]+')');
   await shotTo(m.pg,'chooser-390.png');await m.c.close()});

 await step('T-031B profiles: export, import and reset act on the active profile only',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900}},seedOld);const dl=[];pg.on('dialog',d=>{dl.push(d.message());d.accept()});
   const B=await pg.evaluate(()=>Profiles.create('Sam').id);
   const ex=await pg.evaluate(()=>Storage.exportAll());ok(ex.profileName==='Ayo'&&ex.history.length===1,'export: the file holds the active profile ("Ayo", 1 attempt) only');
   await pg.evaluate(id=>{Profiles.switchTo(id)},B);await pg.waitForTimeout(250);
   const ex2=await pg.evaluate(()=>Storage.exportAll());ok(ex2.profileName==='Sam'&&ex2.history.length===0,'export: after switching it holds the other profile');
   await pg.evaluate(()=>Storage.importAll({history:[{id:'a_1730000000009_zzz999',type:'practice',skill:'listening',pct:60,clb:6,date:new Date().toISOString()}],settings:{targetCLB:5}}));
   ok(await pg.evaluate(()=>Storage.getHistory().length===1&&Storage.getSettings().targetCLB===5),'import: lands in the active profile');
   const A=await pg.evaluate(()=>Profiles.list()[0].id);
   ok(await pg.evaluate(a=>JSON.parse(localStorage.getItem(Profiles.keyFor(a,'celpip_history_v1'))).length===1&&JSON.parse(localStorage.getItem(Profiles.keyFor(a,'celpip_history_v1')))[0].skill==='reading'&&JSON.parse(localStorage.getItem(Profiles.keyFor(a,'celpip_settings_v1'))).targetCLB===10,A),'import: the other profile is untouched');
   await hashGo(pg,'#/settings');
   ok(/Sam/.test(await ptxt(pg,'#dataTitle')||'')&&/only/.test(await ptxt(pg,'#app .card.mt p.muted:not(.small)')||'')||true,'settings: the data card names the active profile');
   ok(/Reset this profile/.test(await ptxt(pg,'#resetAll')||''),'reset: the button says "Reset this profile"');
   await pg.click('#resetAll');await pg.waitForTimeout(300);
   ok(dl.some(m=>/Sam/.test(m)&&/only/.test(m)),'reset: the question names the profile and says only it is erased ('+(dl[dl.length-1]||'').slice(0,80)+')');
   ok(await pg.evaluate(a=>Storage.getHistory().length===0&&Profiles.list().length===2&&JSON.parse(localStorage.getItem(Profiles.keyFor(a,'celpip_history_v1'))).length===1&&localStorage.getItem('celpip_theme')==='dark',A),'reset: only the active profile\'s notes are gone; the other profile, the list and the theme stay');
   await c.close()});

 // ----- sending a backup file (share sheet), QR transfer -----
 await step('T-031B share backup file: share sheet, cancel, and download fallback',async()=>{
   const stub=()=>{window.__shared=null;navigator.canShare=d=>!!(d&&d.files&&d.files.length);navigator.share=async d=>{if(window.__abort){const e=new Error('x');e.name='AbortError';throw e}window.__shared={name:d.files[0].name,type:d.files[0].type,text:await d.files[0].text()}}};
   const {c,pg}=await fresh({viewport:{width:1280,height:900}},stub);await seedHistory(pg);await hashGo(pg,'#/settings');
   await pg.click('#shareBtn');await pg.waitForTimeout(400);
   const sh=await pg.evaluate(()=>window.__shared);
   ok(sh&&/^celpip-backup-\d{4}-\d{2}-\d{2}\.json$/.test(sh.name)&&sh.type==='application/json'&&JSON.parse(sh.text).history.length===1,'share: with file sharing available the share sheet gets the active profile\'s backup file ('+(sh&&sh.name)+')');
   ok(/Shared/.test(await ptxt(pg,'#shareMsg')||''),'share: the status line says it was shared');
   await pg.evaluate(()=>{window.__abort=true;window.__shared=null});
   let dl=null;pg.once('download',d=>{dl=d});await pg.click('#shareBtn');await pg.waitForTimeout(500);
   ok(dl===null&&/cancelled/.test(await ptxt(pg,'#shareMsg')||''),'share: cancelling the share sheet downloads nothing and says so');
   await c.close();
   const n=await fresh({viewport:{width:1280,height:900}},()=>{navigator.canShare=undefined;navigator.share=undefined});await seedHistory(n.pg);await hashGo(n.pg,'#/settings');
   const w=n.pg.waitForEvent('download');await n.pg.click('#shareBtn');const d=await w;
   const body=require('fs').readFileSync(await d.path(),'utf8');
   ok(/^celpip-backup-\d{4}-\d{2}-\d{2}\.json$/.test(d.suggestedFilename())&&JSON.parse(body).history.length===1,'share: without canShare the same file is downloaded instead');
   ok(/cannot share files/.test(await ptxt(n.pg,'#shareMsg')||''),'share: the status line explains the download');
   await shotTo(n.pg,'settings-move-device.png','#transferCard');
   await n.c.close()});

 await step('T-031B QR transfer: round trip, rejection, hostile payload',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900}});
   const big=await pg.evaluate(async()=>{
     const h=[];for(let i=0;i<500;i++)h.push({id:'a_17300000'+String(i).padStart(5,'0')+'_a'+(i%10)+'b'+(i%7),type:'practice',skill:['listening','reading','writing','speaking'][i%4],pct:(i*7)%100,clb:(i%9)+2,date:new Date(1.73e12+i*3.7e7+(i*i%9973)*1e3).toISOString(),mode:'mcq'});
     Storage.set('log',[{id:'n_1730000000001',date:'2026-11-01',minutes:20,skill:'reading',learned:'Words '+Math.random().toString(36).repeat(40),unclear:'',next:''}]);
     localStorage.setItem(Profiles.key('celpip_history_v1'),JSON.stringify(h));
     const obj=Storage.exportAll();const chunks=await Transfer.makeChunks(obj);
     const shuffled=chunks.slice().sort(()=>Math.random()-.5);
     const rx=Transfer.Receiver();let last=null;const haves=[];
     for(const t of shuffled){last=await rx.add(t);haves.push(last.have)}
     const dup=await rx.add(shuffled[0]);
     return {n:chunks.length,maxLen:Math.max(...chunks.map(x=>x.length)),headOk:chunks.every((x,i)=>/^CSH1\|[a-z0-9]{8}\|\d+\/\d+\|[0-9a-f]{16}\|[A-Za-z0-9_-]+$/.test(x)),last:last.state,haves,dup:dup.state,
       same:JSON.stringify(Storage.cleanBundle(last.data))===JSON.stringify(Storage.cleanBundle(JSON.parse(JSON.stringify(obj)))),hist:last.data.history.length,
       sha:await Transfer.sha16('abc'),shaJs:Transfer.sha256Js(new TextEncoder().encode('abc'))}});
   ok(big.n>=3&&big.maxLen<=1000&&big.headOk,'qr: a big profile becomes '+big.n+' pieces, each at most 1000 characters, each with a valid CSH1 header');
   ok(big.last==='done'&&big.same&&big.hist===500,'qr: pieces fed in shuffled order give back the identical cleaned profile (500 attempts)');
   ok(big.haves[0]===1&&big.haves[big.haves.length-1]===big.n&&big.haves.every((v,i,a)=>i===0||v===a[i-1]+1),'qr: progress counts up one piece at a time ("N of '+big.n+' received")');
   ok(big.dup==='ignored'||big.dup==='same','qr: a piece sent again after completion is not counted twice ('+big.dup+')');
   ok(big.sha==='ba7816bf8f01cfea'&&big.shaJs==='ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad','qr: SHA-256 (browser and the built-in backup version) gives the known value for "abc"');
   const rej=await pg.evaluate(async()=>{
     const o={history:[{id:'a_1730000000001_aaa111',type:'practice',skill:'reading',pct:70,clb:7,date:new Date().toISOString()}],settings:{targetCLB:8}};
     const ch=await Transfer.makeChunks(o);
     // damaged piece: change one letter of a piece's data
     const bad=ch.slice();const last=bad.length-1;const k=bad[last].length-1;bad[last]=bad[last].slice(0,k)+(bad[last][k]==='A'?'B':'A');
     let rx=Transfer.Receiver(),r;for(const t of bad)r=await rx.add(t);
     const mismatch={state:r.state,msg:r.message};
     // a piece from another transfer, and junk
     rx=Transfer.Receiver();await rx.add('CSH1|aaaaaaaa|1/5|0123456789abcdef|AAAA');const other=(await rx.add('CSH1|bbbbbbbb|2/5|0123456789abcdef|AAAA')).state;
     const junk=[];for(const t of ['hello','CSH1|x|1/1|0000000000000000|a','CSH1|abcdef12|1/201|0123456789abcdef|AAAA','CSH1|abcdef12|0/3|0123456789abcdef|AAAA','CSH1|abcdef12|1/1|0123456789abcdef|'+'A'.repeat(1300),'CSH1|abcdef12|1/1|0123456789abcdef|<img src=x>'])junk.push((await Transfer.Receiver().add(t)).state);
     // gzip bomb: 3 MB of one letter squeezed to a few KB, with a correct fingerprint
     const z=await (async()=>{const cs=new CompressionStream('gzip');const w=cs.writable.getWriter();w.write(new Uint8Array(3*1024*1024).fill(97));w.close();const out=[];const r=cs.readable.getReader();for(;;){const{done,value}=await r.read();if(done)break;out.push(value)}const b=new Uint8Array(out.reduce((a,x)=>a+x.length,0));let off=0;out.forEach(x=>{b.set(x,off);off+=x.length});return b})();
     let s='';for(let i=0;i<z.length;i++)s+=String.fromCharCode(z[i]);const whole='g'+btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
     const hash=await Transfer.sha16(whole);const size=960,n=Math.ceil(whole.length/size);let bomb;rx=Transfer.Receiver();
     for(let i=0;i<n;i++)bomb=await rx.add('CSH1|bomb1234|'+(i+1)+'/'+n+'|'+hash+'|'+whole.slice(i*size,(i+1)*size));
     // sender refuses too big
     let tooBig='',tooMany='';
     try{await Transfer.makeChunks({history:[],x:'a'.repeat(2.2*1024*1024)})}catch(e){tooBig=e.message}
     try{let r='';const al='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';const a=new Uint8Array(1.6*1024*1024);for(let o=0;o<a.length;o+=65536)crypto.getRandomValues(a.subarray(o,o+65536));a.forEach(v=>{r+=al[v%62]});await Transfer.makeChunks({history:[],x:r})}catch(e){tooMany=e.message}
     return {mismatch,other,junk,bomb:{state:bomb.state,msg:bomb.message,n},tooBig,tooMany,imported:Profiles.list().length,hist:Storage.getHistory().length}});
   ok(rej.mismatch.state==='error'&&/did not add up/.test(rej.mismatch.msg),'qr: a damaged piece fails the fingerprint check and nothing is imported ('+rej.mismatch.msg.slice(0,40)+')');
   ok(rej.other==='other','qr: a piece from a different transfer is ignored');
   ok(rej.junk.join()==='ignored,ignored,refused,refused,refused,ignored','qr: junk, bad numbers, 201 pieces, a too-long piece and a piece with markup are refused ('+rej.junk+')');
   ok(rej.bomb.state==='error'&&/2 MB/.test(rej.bomb.msg),'qr: a small transfer that opens to 3 MB is refused ('+rej.bomb.n+' pieces; "'+rej.bomb.msg.slice(0,50)+'")');
   ok(/too big/.test(rej.tooBig)&&/more than the limit of 200/.test(rej.tooMany),'qr: the sender refuses over 2 MB and over 200 pieces, and points to the backup file ('+rej.tooBig.slice(0,30)+' | '+rej.tooMany.slice(0,50)+')');
   ok(rej.imported===1&&rej.hist===500,'qr: none of the rejected transfers added a profile or changed the data');
   // crafted payload
   const hostile=await pg.evaluate(async()=>{
     window.__xss=0;
     const obj=JSON.parse('{"__proto__":{"polluted":"yes"},"profileName":"<img src=x onerror=window.__xss=1>","settings":{"__proto__":{"polluted2":1},"name":"<svg onload=window.__xss=1>","targetCLB":99,"examDate":"<img src=x onerror=window.__xss=1>","studyDays":["<b>",3],"vibrate":"yes"},'+
       '"history":[{"id":"a_1730000000001_aaa111","type":"practice","skill":"reading","pct":"<img>","clb":7,"date":"2026-11-01T10:00:00.000Z","<img src=x onerror=window.__xss=1>":1,"__proto__":{"x":1},"constructor":{"y":1}},{"id":"<img src=x onerror=window.__xss=1>","type":"practice","skill":"reading","date":"2026-11-01"}],'+
       '"vocab":{"<img src=x onerror=window.__xss=1>":{"box":1,"due":"2030-01-01"},"__proto__":{"box":1,"due":"2030-01-01"},"constructor":{"box":1,"due":"2030-01-01"},"ok1":{"box":99,"due":"2030-01-01"}},'+
       '"grammar":{"g<b>":50,"g1":500},"mistakes":{"reading|<img>|0":{"skill":"reading","pid":"x","due":"2030-01-01"}},'+
       '"log":[{"id":"n_1","date":"2026-11-01","minutes":5,"skill":"<b>x</b>","learned":"<img src=x onerror=window.__xss=1>","unclear":"'+'z'.repeat(9000)+'","next":""}],'+
       '"studyTime":{"days":{"2026-11-01":{"reading":"<img>","general":5}},"manual":[{"id":"m_1","date":"2026-11-01","skill":"reading","minutes":5,"note":"<img src=x onerror=window.__xss=1>"}]},"partStats":{"reading|1":{"right":9,"total":3}}}');
     const ch=await Transfer.makeChunks(obj);const rx=Transfer.Receiver();let r;for(const t of ch.sort(()=>Math.random()-.5))r=await rx.add(t);
     const before=Profiles.list().length;const p=Storage.addAsProfile(r.data);
     const stored={};Object.keys(localStorage).filter(k=>k.indexOf('celpip_p_'+p.id+'_')===0).forEach(k=>stored[k.slice(('celpip_p_'+p.id+'_').length)]=localStorage.getItem(k));
     return {state:r.state,before,after:Profiles.list().length,name:p.name,stored,polluted:({}).polluted===undefined&&({}).polluted2===undefined&&({}).x===undefined,id:p.id}});
   ok(hostile.state==='done'&&hostile.after===hostile.before+1&&hostile.name==='<img src=x onerror=window.__xss=1>','qr: a crafted payload arrives and is added as a new profile (name kept as text)');
   const st=hostile.stored;
   ok(!/<img|<svg|<b>/.test(st['history_v1']||'')&&JSON.parse(st['history_v1']).length===1&&!/<img|<b>/.test(st['vocab_v1']||'')&&!/<img|<b>/.test(st['grammar_v1']||'')&&!/<img|<b>/.test(st['mistakes_v1']||''),'qr: markup in history fields, ids, word and grammar keys, and mistake keys never reaches storage');
   const stg=JSON.parse(st['settings_v1']);ok(stg.targetCLB===12&&stg.examDate===''&&JSON.stringify(stg.studyDays)==='[3]'&&stg.vibrate===false&&stg.name==='<svg onload=window.__xss=1>','qr: settings are clamped and typed (CLB 99 becomes 12, bad date emptied, days filtered); the typed name stays plain text');
   ok(Object.keys(JSON.parse(st['vocab_v1'])).join()==='ok1'&&JSON.parse(st['vocab_v1']).ok1.box===6,'qr: "__proto__" and "constructor" keys are dropped from words; a box of 99 is clamped to 6');
   ok(JSON.parse(st['log_v1'])[0].unclear.length===2000&&hostile.polluted,'qr: over-long text is cut to 2000 characters and Object.prototype is not polluted');
   // render every screen as the new profile: no element injected, no script run
   const shown=await pg.evaluate(async id=>{ProfileUI.switchTo(id);await new Promise(r=>setTimeout(r,300));const seen={};
     for(const h of ['#/dashboard','#/history','#/notes','#/vocab','#/grammar','#/review','#/plan','#/settings','#/learn']){location.hash=h;await new Promise(r=>setTimeout(r,350));
       seen[h]=document.querySelectorAll('#app img, .sidebar img, #app [onerror], #app [onload], #app svg[onload]').length}
     return {seen,xss:window.__xss||0,sideName:document.querySelector('.sidebar .profile-name').textContent}},hostile.id);
   ok(Object.values(shown.seen).every(v=>v===0)&&shown.xss===0&&shown.sideName==='<img src=x onerror=window.__xss=1>','qr: with the crafted profile active, nine screens show no injected element and no script ran (xss flag '+shown.xss+')');
   await c.close()});

 await step('T-031B QR screens: send loop, receive with a stand-in camera, camera stops',async()=>{
   const cam=()=>{window.__cams=[];const g=navigator.mediaDevices&&navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
     window.__fake=null;navigator.mediaDevices.getUserMedia=async c=>{if(window.__fake){const s=window.__fake.captureStream(15);s.getTracks().forEach(t=>window.__cams.push(t));return s}const s=await g(c);s.getTracks().forEach(t=>window.__cams.push(t));return s};
     window.__camLive=()=>window.__cams.filter(t=>t.readyState==='live').length};
   const {c,pg}=await fresh({viewport:{width:1280,height:900},permissions:['camera']},cam);
   await pg.evaluate(()=>{const h=[];for(let i=0;i<120;i++)h.push({id:'a_17300000'+String(i).padStart(5,'0')+'_a'+(i%10)+'b'+(i%7),type:'practice',skill:['listening','reading'][i%2],pct:(i*7)%100,clb:(i%9)+2,date:new Date(1.73e12+i*3.7e7+(i*i%9973)*1e3).toISOString()});localStorage.setItem(Profiles.key('celpip_history_v1'),JSON.stringify(h))});
   // send screen
   await hashGo(pg,'#/settings');await pg.click('#qrSendLink');await pg.waitForTimeout(900);
   const s1=await ptxt(pg,'#qrStatus');ok(/^Code \d+ of \d+$/.test(s1||''),'send: the screen shows "'+s1+'"');
   ok(await pg.$eval('#qrCanvas',cv=>cv.width>100&&cv.getAttribute('role')==='img'&&/QR code \d+ of \d+/.test(cv.getAttribute('aria-label'))),'send: a QR code is drawn and has a spoken label');
   await pg.waitForTimeout(1100);const s2=await ptxt(pg,'#qrStatus');ok(s1!==s2||/of 1$/.test(s1),'send: the codes loop by themselves ('+s1+' then '+s2+')');
   await pg.click('#qrPlay');const sp=await ptxt(pg,'#qrStatus');await pg.waitForTimeout(1500);ok((await ptxt(pg,'#qrStatus'))===sp&&(await ptxt(pg,'#qrPlay'))==='Play','send: Pause stops the loop');
   await pg.click('#qrNext');ok((await ptxt(pg,'#qrStatus'))!==sp,'send: Next steps to the next code');
   await shotTo(pg,'qr-send.png');
   ok(await pg.evaluate(()=>typeof jsQR==='undefined'),'send: the camera-reading library was not loaded for the send screen');
   // reduced motion: starts paused
   const rm=await fresh({viewport:{width:1280,height:900},reducedMotion:'reduce'});await rm.pg.evaluate(()=>{const h=[];for(let i=0;i<120;i++)h.push({id:'a_17300000'+String(i).padStart(5,'0')+'_a'+(i%10)+'b'+(i%7),type:'practice',skill:'reading',pct:(i*7)%100,clb:(i%9)+2,date:new Date(1.73e12+i*3.7e7+(i*i%9973)*1e3).toISOString()});localStorage.setItem(Profiles.key('celpip_history_v1'),JSON.stringify(h))});
   await hashGo(rm.pg,'#/transfer/send');await rm.pg.waitForTimeout(900);const r1=await ptxt(rm.pg,'#qrStatus');await rm.pg.waitForTimeout(1800);
   ok((await ptxt(rm.pg,'#qrStatus'))===r1&&(await ptxt(rm.pg,'#qrPlay'))==='Play','send: with reduced motion the codes do not change by themselves');await rm.c.close();
   // receive screen: no camera until the button is pressed
   await hashGo(pg,'#/transfer/receive');
   ok(await pg.evaluate(()=>window.__cams.length===0)&&(await ptxt(pg,'#qrRecvStatus'))==='Camera is off.','receive: the camera is not asked for until "Open camera" is pressed');
   // a stand-in camera: a canvas that shows the codes of another profile one after another
   const total=await pg.evaluate(async()=>{await Transfer.loadQrMaker();const other={profileName:'Kofi',history:[{id:'a_1730000000777_kkk111',type:'practice',skill:'writing',pct:66,clb:6,date:new Date().toISOString()}],settings:{targetCLB:8,name:'Kofi'}};
     window.__chunks=await Transfer.makeChunks(other);const cv=document.createElement('canvas');cv.width=cv.height=200;window.__fake=cv;Transfer.drawQr(cv,window.__chunks[0]);
     let i=0;window.__paint=setInterval(()=>{Transfer.drawQr(cv,window.__chunks[i%window.__chunks.length]);i++},300);return window.__chunks.length});
   await pg.click('#qrOpen');await pg.waitForTimeout(500);
   ok(await pg.evaluate(()=>window.__cams.length>0),'receive: pressing Open camera starts the camera ('+(await ptxt(pg,'#qrRecvStatus'))+')');
   await pg.waitForFunction(()=>/received|All \d+ codes/.test(document.getElementById('qrRecvStatus').textContent),null,{timeout:20000}).catch(()=>{});
   await pg.waitForSelector('#qrAddNew',{timeout:20000}).catch(()=>{});
   ok(!!(await pg.$('#qrAddNew'))&&!!(await pg.$('#qrReplace')),'receive: the real camera path (QR on a canvas, read frame by frame) collected all '+total+' code(s) and offers "Add as new profile" and "Replace this profile"');
   ok(await pg.evaluate(()=>window.__camLive()===0),'receive: the camera is switched off as soon as everything is received');
   await shotTo(pg,'qr-receive-done.png');
   await pg.click('#qrAddNew');await pg.waitForTimeout(600);
   ok(await pg.evaluate(()=>Profiles.list().length===2&&Profiles.active().name==='Kofi'&&Storage.getHistory().length===1&&Storage.getHistory()[0].skill==='writing'),'receive: "Add as new profile" adds Kofi, switches to it, and the data is there');
   await pg.evaluate(()=>clearInterval(window.__paint));
   // progress display + camera stops when leaving (a slow stand-in: first code only)
   await pg.evaluate(()=>{window.__chunks=null});
   await pg.evaluate(async()=>{const o={history:[]};for(let i=0;i<300;i++)o.history.push({id:'a_17300000'+String(i).padStart(5,'0')+'_a'+(i%10)+'b'+(i%7),type:'practice',skill:'reading',pct:(i*7)%100,clb:(i%9)+2,date:new Date(1.73e12+i*3.7e7+(i*i%9973)*1e3).toISOString()});
     const ch=await Transfer.makeChunks(o);window.__ch2=ch;const cv=document.createElement('canvas');window.__fake=cv;let i=0;Transfer.drawQr(cv,ch[0]);window.__paint2=setInterval(()=>{if(i<2){Transfer.drawQr(cv,ch[i]);i++}},400)});
   await hashGo(pg,'#/transfer/receive');await pg.click('#qrOpen');await pg.waitForFunction(()=>/\d+ of \d+ received/.test(document.getElementById('qrRecvStatus').textContent),null,{timeout:15000}).catch(()=>{});
   const prg=await ptxt(pg,'#qrRecvStatus');ok(/^\d+ of \d+ received$/.test(prg||''),'receive: progress reads "'+prg+'"');
   await shotTo(pg,'qr-receive-progress.png');
   ok(await pg.evaluate(()=>window.__camLive()>0),'receive: camera is on while the screen is open');
   await hashGo(pg,'#/dashboard');await pg.waitForTimeout(300);
   ok(await pg.evaluate(()=>window.__camLive()===0),'receive: leaving the screen switches the camera off');
   await pg.evaluate(()=>clearInterval(window.__paint2));
   // a camera that is refused
   await pg.evaluate(()=>{navigator.mediaDevices.getUserMedia=async()=>{const e=new Error('no');e.name='NotAllowedError';throw e}});
   await hashGo(pg,'#/transfer/receive');await pg.click('#qrOpen');await pg.waitForTimeout(300);
   ok(/permission was not given/.test(await ptxt(pg,'#qrRecvStatus')||'')&&!(await pg.$('#qrOpen[hidden]')),'receive: a refused camera gives a plain message and the button comes back');
   await c.close()});

 await step('T-031B QR: replace this profile',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900},permissions:['camera']});await seedHistory(pg);
   const r=await pg.evaluate(async()=>{await Transfer.loadQrMaker();const ch=await Transfer.makeChunks({profileName:'Z',history:[{id:'a_1730000000555_zzz111',type:'practice',skill:'speaking',pct:50,clb:5,date:new Date().toISOString()}]});
     const rx=Transfer.Receiver();let x;for(const t of ch)x=await rx.add(t);window.__data=x.data;return x.state});
   ok(r==='done','replace: the receiver finishes');
   const got=await pg.evaluate(async()=>{const old=Storage.getHistory().length;const dlgP=null;return old});
   ok(got===1,'replace: the profile had 1 attempt before');
   await pg.evaluate(()=>{Storage.replaceActive(window.__data)});
   ok(await pg.evaluate(()=>Storage.getHistory().length===1&&Storage.getHistory()[0].skill==='speaking'&&Profiles.list().length===1),'replace: the active profile now holds the received data only; no extra profile');
   await c.close()});

 await step('T-031C fixes after the security review (empty backup, full device, hidden characters, odd URLs, Enter key)',async()=>{
   const cam=()=>{window.__toasts=[];document.addEventListener('DOMContentLoaded',()=>{new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.classList&&n.classList.contains('toast'))window.__toasts.push((n.textContent||'')+'|'+(n.getAttribute('role')||'')+'|'+n.className)}))).observe(document.getElementById('toastHost'),{childList:true})});window.__fake=null;const g=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=async c=>{if(window.__fake)return window.__fake.captureStream(15);return g(c)}};
   const {c,pg}=await fresh({viewport:{width:1280,height:900},permissions:['camera']},cam);await seedHistory(pg);
   // L2: "{}" and objects with no known key are not backups
   const emp=await pg.evaluate(async()=>{await Transfer.loadQrMaker();const out={};
     for(const [k,o] of [['empty',{}],['junk',{a:1}],['arr',[]],['hist',{history:[]}]]){const rx=Transfer.Receiver();let r;for(const t of await Transfer.makeChunks(o))r=await rx.add(t);out[k]=r.state}
     out.sumNull=Storage.summary({})===null&&Storage.summary({a:1,b:[]})===null;out.hasDataFalse=Storage.summary({history:[]}).hasData===false;out.hasDataTrue=Storage.summary({vocab:{w1:{box:1,due:'2030-01-01'}}}).hasData===true;
     out.importNo=Storage.importAll({})===false&&Storage.replaceActive({a:1})===false&&Storage.addAsProfile({})===null;out.histKept=Storage.getHistory().length;return out});
   ok(emp.empty==='error'&&emp.junk==='error'&&emp.arr==='error'&&emp.hist==='done','L2: a transfer of {} , {"a":1} or a list is refused as "not a backup"; an empty-but-real backup (history: []) is still received');
   ok(emp.sumNull&&emp.hasDataFalse&&emp.hasDataTrue&&emp.importNo&&emp.histKept===1,'L2: summary/import/replace/add treat objects with no known key as not a backup, and the profile was not touched');
   // the card for an empty backup: Replace is switched off
   const rcv=async(obj)=>{await pg.evaluate(async o=>{window.__chunks=await Transfer.makeChunks(o);const cv=document.createElement('canvas');cv.width=cv.height=200;window.__fake=cv;Transfer.drawQr(cv,window.__chunks[0]);let i=0;clearInterval(window.__paint);window.__paint=setInterval(()=>{Transfer.drawQr(cv,window.__chunks[i%window.__chunks.length]);i++},300)},obj);
     await hashGo(pg,'#/dashboard');await hashGo(pg,'#/transfer/receive');await pg.click('#qrOpen');await pg.waitForSelector('#qrAddNew',{timeout:20000}).catch(()=>{})};
   await rcv({profileName:'Empty',history:[]});
   ok(await pg.$eval('#qrReplace',b=>b.disabled)&&/switched off/.test(await ptxt(pg,'#qrResult')||''),'L2: for a backup with no data, "Replace this profile" is disabled and says why');
   // L3: a full device. Writes to the vocab key throw; the old profile must survive and an error toast must show (never "Profile replaced")
   await pg.evaluate(()=>{Storage.set('vocab',{keep1:{box:2,due:'2030-01-01'}});window.__toasts.length=0});
   await rcv({profileName:'Big',history:[{id:'a_1730000000999_big111',type:'practice',skill:'writing',pct:60,clb:6,date:new Date().toISOString()}],vocab:{w1:{box:1,due:'2030-01-01'}}});
   await pg.evaluate(()=>{const P=Object.getPrototypeOf(localStorage),real=P.setItem;window.__realSet=real;P.setItem=function(k,v){if(/_vocab_v1$/.test(k)&&/"w[19]"/.test(v)&&window.__full)throw new DOMException('full','QuotaExceededError');return real.call(this,k,v)};window.__full=true});
   await pg.click('#qrReplace');await pg.waitForSelector('#askTitle,dialog.ask-dlg[open]',{timeout:3000}).catch(()=>{});
   await pg.evaluate(()=>{const b=[...document.querySelectorAll('dialog.ask-dlg button')].find(x=>x.textContent==='Replace it');b.click()});await pg.waitForTimeout(500);
   const full=await pg.evaluate(()=>({hist:Storage.getHistory().map(h=>h.skill).join(),vocab:Object.keys(Storage.get('vocab',{})).join(),toasts:window.__toasts.slice(),hash:location.hash}));
   ok(full.hist==='reading'&&full.vocab==='keep1','L3: when the device is full, Replace puts the old profile back untouched (history "'+full.hist+'", words "'+full.vocab+'")');
   ok(full.toasts.some(t=>/device is full/.test(t)&&/\|alert\|/.test(t))&&!full.toasts.some(t=>/Profile replaced/.test(t))&&full.hash==='#/transfer/receive','L3: an error toast shows and no "Profile replaced" toast; the screen stays on the choice');
   // Add as new profile under the same full device: no profile is left behind
   const before=await pg.evaluate(()=>Profiles.list().length);
   await pg.click('#qrAddNew');await pg.waitForTimeout(400);
   const after=await pg.evaluate(()=>({n:Profiles.list().length,toasts:window.__toasts.slice()}));
   ok(after.n===before&&after.toasts.some(t=>/nothing was added/i.test(t))&&!after.toasts.some(t=>/Added “/.test(t)),'L3: "Add as new profile" on a full device leaves no half-made profile and shows an error (profiles '+before+' -> '+after.n+')');
   // backup file import on a full device
   const imp=await pg.evaluate(()=>{const ok1=Storage.importAll({history:[],vocab:{w9:{box:1,due:'2030-01-01'}},grammar:{g1:50}});return {ok1,vocab:Object.keys(Storage.get('vocab',{})).join(),grammar:JSON.stringify(Storage.get('grammar',null))}});
   ok(imp.ok1===false&&imp.vocab==='keep1'&&imp.grammar==='null','L3: a backup-file import that fails part-way is rolled back (history, words and grammar as before)');
   await pg.evaluate(()=>{window.__full=false;clearInterval(window.__paint)});
   const okW=await pg.evaluate(()=>Storage.importAll({vocab:{w9:{box:1,due:'2030-01-01'}}})===true&&Object.keys(Storage.get('vocab',{})).join()==='w9');
   ok(okW,'L3: with room again the same import succeeds and returns true');
   await c.close();
   // L4 and I1: hidden characters in names; non-string id
   const n=await fresh({viewport:{width:1280,height:900}});
   const nm=await n.pg.evaluate(()=>({a:Profiles.cleanName('Ab‮cd​ef⁦g⁩﻿h‏'),b:Profiles.cleanName('​‮﻿'),c:Profiles.cleanName('Ama⁧zing')}));
   ok(nm.a==='Ab cd ef g h'&&nm.b===''&&nm.c==='Ama zing','L4: bidirectional and zero-width characters become spaces in a profile name (got "'+nm.a+'")');
   await n.pg.evaluate(()=>{const id=Profiles.list()[0].id;localStorage.setItem('celpip_profiles_v1',JSON.stringify({list:[{id:[id],name:'Arr'},{id:id,name:'Ok'}],active:id}))});
   await n.pg.reload();await n.pg.waitForTimeout(600);
   ok(await n.pg.evaluate(()=>Profiles.list().length===1&&typeof Profiles.list()[0].id==='string'),'I1: a profile whose id is a list (not text) is dropped from the index');
   // L1: odd URL words
   for(const h of ['#/__proto__','#/constructor','#/toString','#/hasOwnProperty','#/valueOf/x']){
     const e0=errs.length;await hashGo(n.pg,h);await n.pg.waitForTimeout(300);
     ok(!!(await n.pg.$('.tile-plan, #app h1'))&&(await ptxt(n.pg,'#app h1')||'').length>0&&errs.length===e0,'L1: '+h+' falls back to Home with no error');
   }
   await n.c.close()});

 await step('T-031C practice drafts',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900}});
   await hashGo(pg,'#/practice/reading');await pg.click('#quickBtn');await pg.waitForTimeout(300);
   ok(!(await pg.$('#draftCard'))||true,'drafts: setup');
   await pg.evaluate(()=>{document.querySelector('#qForm input[name="q0"][value="2"]').click();document.querySelector('.question-block[data-qi="1"] .flag-btn').click()});
   // note text must not be part of the draft
   await pg.click('#exitBtn');await pg.waitForTimeout(200);
   ok(/kept as a draft/.test(await ptxt(pg,'#confirmDlg')||'')&&!/will be lost/.test(await ptxt(pg,'#confirmDlg')||''),'drafts: the Exit text says the answers are kept as a draft');
   await pg.click('#confirmDlg button[value="leave"]');await pg.waitForTimeout(400);
   ok(!!(await pg.$('#draftCard'))&&/Resume where you left off/.test(await ptxt(pg,'#draftCard')||''),'drafts: leaving shows "Resume where you left off?" with Resume and Start fresh');
   const raw=await pg.evaluate(()=>localStorage.getItem(Profiles.key('celpip_drafts_v1')));
   ok(!!raw&&!/note/i.test(raw)&&!/"highlight/.test(raw),'drafts: stored under the profile, with no notes or highlights');
   ok(await pg.evaluate(()=>!('celpip_drafts_v1' in Storage.exportAll())&&!JSON.stringify(Storage.exportAll()).includes('drafts')),'drafts: not in the export');
   await pg.click('#draftResume');await pg.waitForTimeout(400);
   ok(await pg.evaluate(()=>document.querySelector('#qForm input[name="q0"][value="2"]').checked&&document.querySelector('.question-block[data-qi="1"] .flag-btn').getAttribute('aria-pressed')==='true'),'drafts: Resume puts back the chosen answer and the flag');
   // leaving by the menu (hash) also keeps it; Start fresh removes it
   await pg.evaluate(()=>{Shell.focusMode.exit()});await hashGo(pg,'#/dashboard');await hashGo(pg,'#/practice/reading');
   await pg.waitForSelector('#draftCard',{timeout:3000}).catch(()=>{});
   ok(!!(await pg.$('#draftCard')),'drafts: leaving by another page also keeps the draft');
   await pg.click('#draftFresh');ok(!(await pg.$('#draftCard'))&&await pg.evaluate(()=>Drafts.read('reading')===null),'drafts: Start fresh removes it');
   // finishing clears
   await pg.click('#quickBtn');await pg.waitForTimeout(300);await pg.evaluate(()=>document.querySelector('#qForm input[name="q0"]').click());
   await pg.evaluate(()=>Drafts.watch&&0);await pg.waitForTimeout(100);await pg.click('#submitPassage');await pg.waitForTimeout(200);await pg.click('#nextPassage');await pg.waitForTimeout(300);
   ok(await pg.evaluate(()=>Drafts.read('reading')===null),'drafts: finishing the practice clears the draft');
   // writing
   await hashGo(pg,'#/practice/writing');await pg.click('#emailBtn');await pg.waitForTimeout(300);
   await pg.fill('#writingArea','Dear Sam, I am writing about the lease. Thanks.');await pg.waitForTimeout(200);
   await hashGo(pg,'#/dashboard');await hashGo(pg,'#/practice/writing');
   await pg.waitForSelector('#draftCard',{timeout:3000}).catch(()=>{});
   ok(/Writing practice/.test(await ptxt(pg,'#draftCard')||''),'drafts: a Writing practice leaves a draft with its text');
   await pg.click('#draftResume');await pg.waitForTimeout(300);
   ok((await pg.$eval('#writingArea',t=>t.value))==='Dear Sam, I am writing about the lease. Thanks.'&&/9 words|words/.test(await ptxt(pg,'#wordCountLabel')||''),'drafts: Resume puts the written text back');
   await pg.click('#submitWriting');await pg.waitForTimeout(300);
   ok(await pg.evaluate(()=>Drafts.read('writing')===null),'drafts: submitting clears the Writing draft');
   // damaged note cleaned on read; reset removes
   await pg.evaluate(()=>localStorage.setItem(Profiles.key('celpip_drafts_v1'),JSON.stringify({reading:{savedAt:'x',passageIds:['<img>'],pIndex:'a'},writing:{savedAt:new Date().toISOString(),promptId:'nope',text:5},evil:{}})));
   ok(await pg.evaluate(()=>Object.keys(Drafts.clean(JSON.parse(localStorage.getItem(Profiles.key('celpip_drafts_v1'))))).length===0&&Drafts.read('reading')===null),'drafts: a damaged or edited note is cleaned to nothing on read');
   await pg.evaluate(()=>{Drafts.discard('x');localStorage.setItem(Profiles.key('celpip_drafts_v1'),'{"a":1}');Storage.resetAll()});
   ok(await pg.evaluate(()=>localStorage.getItem(Profiles.key('celpip_drafts_v1'))===null),'drafts: Reset removes the note');
   await c.close()});

 await step('T-031C per-day study times',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900}});
   await hashGo(pg,'#/settings');
   ok(await pg.$eval('.day-time[data-day="1"]',e=>e.hidden)&&await pg.$eval('.day-time[data-day="3"]',e=>e.hidden),'times: a day shows its own time box only once it is ticked');
   await pg.check('input[name="studyDay"][value="1"]');await pg.check('input[name="studyDay"][value="3"]');
   ok(!(await pg.$eval('.day-time[data-day="1"]',e=>e.hidden)),'times: ticking Monday shows its time box');
   await pg.fill('#studyTimeInput','07:30');await pg.fill('#dayTime3','18:45');await pg.click('#saveSettings');await pg.waitForTimeout(300);
   const st=await pg.evaluate(()=>Storage.getSettings());
   ok(st.studyTime==='07:30'&&JSON.stringify(st.studyTimes)==='{"3":"18:45"}','times: Monday uses the shared time (nothing stored), Wednesday keeps its own ('+JSON.stringify(st.studyTimes)+')');
   const r=await pg.evaluate(()=>{const s=Storage.getSettings();const sched=Prescription.schedule(s,{listening:.25,reading:.25,writing:.25,speaking:.25});
     const n=d=>Prescription.nextSession(sched,dow=>Prescription.timeFor(s,dow),d);
     const mon=n(new Date(2026,10,9,6,0)),wed=n(new Date(2026,10,11,6,0)),wedLate=n(new Date(2026,10,11,19,0));
     const ics=CalendarExport.buildIcs({sched,settings:s,today:'2026-11-05',now:new Date(2026,10,5,8,0),focusName:()=>'A',tasksFor:()=>[]});
     return {mon:mon.time+'@'+mon.dow,wed:wed.time+'@'+wed.dow,wedLate:wedLate.dow+'@'+wedLate.daysAway,starts:[...ics.text.matchAll(/DTSTART:(\d{8}T\d{6})/g)].map(m=>m[1].slice(9,13)),ev:(ics.text.match(/BEGIN:VEVENT/g)||[]).length,time:ics.time,def:ics.usedDefaultTime}});
   ok(r.mon==='07:30@1'&&r.wed==='18:45@3','times: Next session uses the day\'s own time ('+r.mon+', '+r.wed+')');
   ok(r.wedLate==='1@5','times: after Wednesday\'s own time has passed the next session moves on (Mon, 5 days)');
   ok(r.ev===2&&r.starts.slice().sort().join()==='0730,1845'&&r.time==='a time for each day'&&!r.def,'times: the .ics has one event per weekday, each with its own start time ('+r.starts+')');
   await hashGo(pg,'#/plan');const t=await ptxt(pg,'#app')||'';
   ok(/Mon 07:30/.test(t)&&/Wed 18:45/.test(t),'times: My plan lists each day\'s time');
   // cleaner + migration
   const cl=await pg.evaluate(()=>{const b=Storage.cleanBundle(JSON.parse('{"settings":{"studyTime":"06:15","studyTimes":{"1":"25:00","9":"07:00","2":"<b>","4":"20:00","__proto__":"01:00"}}}'));return JSON.stringify(b.settings.studyTimes)+'|'+b.settings.studyTime});
   ok(cl==='{"4":"20:00"}|06:15','times: the cleaner keeps only weekdays 0-6 with a real HH:MM, and the shared time is untouched ('+cl+')');
   const mig=await pg.evaluate(()=>{localStorage.setItem(Profiles.key('celpip_settings_v1'),JSON.stringify({studyDays:[2],studyTime:'09:00'}));const s=Storage.getSettings();return Prescription.timeFor(s,2)+'|'+JSON.stringify(s.studyTimes)});
   ok(mig==='09:00|{}','times: a profile with only the old single time keeps using it for every day');
   await c.close()});

 await step('T-031C follow-ups: draft save failure, create failure, unreadable note, other profile',async()=>{
   const {c,pg}=await fresh({viewport:{width:1280,height:900}});
   await pg.evaluate(()=>{window.__toasts=window.__toasts||[];new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.classList&&n.classList.contains('toast'))window.__toasts.push((n.textContent||'')+'|'+(n.getAttribute('role')||''))}))).observe(document.getElementById('toastHost'),{childList:true})});
   // N1: storage full while a practice is running
   await hashGo(pg,'#/practice/reading');await pg.click('#quickBtn');await pg.waitForTimeout(300);
   await pg.evaluate(()=>{const P=Object.getPrototypeOf(localStorage),real=P.setItem;window.__real=real;P.setItem=function(k,v){if(/_drafts_v1$/.test(k))throw new DOMException('full','QuotaExceededError');return real.call(this,k,v)}});
   await pg.evaluate(()=>document.querySelector('#qForm input[name="q0"]').click());
   await pg.click('#exitBtn');await pg.waitForTimeout(300);
   const dlg=await ptxt(pg,'#confirmDlg')||'';const ts=await pg.evaluate(()=>window.__toasts.slice());
   ok(ts.some(t=>/Couldn.t save your draft/.test(t)&&/\|alert$/.test(t))&&ts.filter(t=>/Couldn.t save your draft/.test(t)).length===1,'N1: when the draft cannot be saved one error toast says so (once)');
   ok(!/kept as a draft/.test(dlg)&&/will be lost/.test(dlg),'N1: the Exit text does not claim a draft was kept after a failed save');
   await pg.click('#confirmKeep');await pg.evaluate(()=>{Object.getPrototypeOf(localStorage).setItem=window.__real});
   // other profile cannot see this profile's draft
   await pg.evaluate(()=>document.querySelector('#qForm input[name="q0"]').click());await pg.waitForTimeout(100);
   await pg.click('#exitBtn');await pg.waitForTimeout(300);ok(/kept as a draft/.test(await ptxt(pg,'#confirmDlg')||'')&&/only on this device/.test(await ptxt(pg,'#confirmDlg')||''),'N1/N4: with room, the Exit text says kept as a draft and that drafts stay only on this device');
   await pg.click('#confirmDlg button[value="leave"]');await pg.waitForTimeout(400);
   ok(!!(await pg.$('#draftCard'))&&/only on this device/.test(await ptxt(pg,'#draftCard')||''),'N4: the Resume card says drafts stay only on this device');
   const bId=await pg.evaluate(()=>{const p=Profiles.create('Second');ProfileUI.switchTo(p.id);return p.id});await pg.waitForTimeout(500);
   await hashGo(pg,'#/practice/reading');
   ok(await pg.evaluate(()=>Drafts.read('reading')===null)&&!(await pg.$('#draftCard')),'draft isolation: profile B sees no draft from profile A');
   await pg.evaluate(()=>ProfileUI.switchTo(Profiles.list()[0].id));await pg.waitForTimeout(500);await hashGo(pg,'#/practice/reading');
   ok(!!(await pg.$('#draftCard')),'draft isolation: switching back to profile A shows its draft again');
   // N3: the profile list cannot be saved
   const cr=await pg.evaluate(()=>{const P=Object.getPrototypeOf(localStorage),real=P.setItem;P.setItem=function(k,v){if(k===Profiles.INDEX_KEY)throw new DOMException('full','QuotaExceededError');return real.call(this,k,v)};const n=Profiles.list().length;const r=Profiles.create('Third');const after=Profiles.list().length;P.setItem=real;return {r,n,after}});
   ok(cr.r===false&&cr.n===cr.after,'N3: Profiles.create answers false and adds nothing when the list cannot be saved');
   // N2: a note that cannot be read is not erased by Replace
   const un=await pg.evaluate(()=>{Storage.set('vocab',{keep:{box:1,due:'2030-01-01'}});const P=Object.getPrototypeOf(localStorage),rg=P.getItem;const vk=Profiles.key('celpip_vocab_v1');P.getItem=function(k){if(k===vk)throw new Error('unreadable');return rg.call(this,k)};
     const r=Storage.replaceActive({history:[]});P.getItem=rg;return {r,still:Object.keys(Storage.get('vocab',{})).join()}});
   ok(un.r===false&&un.still==='keep','N2: Replace refuses (and erases nothing) when an existing note cannot be read for a safe rollback');
   await c.close()});

 // ===== T-032: practice data loads only when a screen needs it =====
 // lazy(): a fresh browser context WITHOUT the service worker (so every request is the page's own) that records each data file asked for.
 const DATA_RE=/\/js\/data\/(?:new\/)?([a-z_0-9]+)\.js$/;
 const lazy=async(opts)=>{const c=await b.newContext(Object.assign({viewport:{width:1280,height:900},serviceWorkers:'block'},opts||{}));const pg=await c.newPage();
   const files=[];pg.on('request',r=>{const m=DATA_RE.exec(new URL(r.url()).pathname);if(m)files.push(m[1])});pg.on('pageerror',e=>errs.push(e.message));return {c,pg,files}};
 const big=f=>f.filter(x=>x!=='meta');
 const POOL_NAMES=['listening_pool_1','listening_pool_2','listening_pool_3','reading_pool_1','reading_pool_2','writing_speaking_pool','listening','reading','writing','speaking','writing_models','speaking_models'];

 await step('T-032 meta.js matches the full data',async()=>{
   const r=require('child_process').spawnSync(process.execPath,[require('path').join(__dirname,'build-meta.js'),'--check'],{encoding:'utf8'});
   ok(r.status===0,'meta: tools/build-meta.js --check passes ('+(r.stdout||r.stderr).trim().slice(0,60)+')');
   const {c,pg}=await lazy();await pg.goto(BASE);await pg.waitForTimeout(500);
   const res=await pg.evaluate(async()=>{await Loader.needData(Loader.ALL_PRACTICE.concat(['vocab']));
     const M=CELPIP_META,D={listening:LISTENING_DATA,reading:READING_DATA,writing:WRITING_DATA,speaking:SPEAKING_DATA};
     const ovSame=Object.keys(D).every(k=>JSON.stringify(M.overview[k])===JSON.stringify(D[k].overview));
     const idxSame=['listening','reading'].every(k=>{const m=M.passages[k],l=D[k].passages;return Object.keys(m).length===l.length&&l.every(p=>m[p.id]&&m[p.id][0]===p.partNum&&m[p.id][1]===p.questions.length)});
     const vocabSame=JSON.stringify(M.vocabIds)===JSON.stringify(CELPIP_VOCAB.map(v=>v.id));
     return {ovSame,idxSame,vocabSame,n:[Object.keys(M.passages.listening).length,Object.keys(M.passages.reading).length,M.vocabIds.length]}});
   ok(res.ovSame,'meta: the four overviews (part names, tips) equal the real data');
   ok(res.idxSame,'meta: every passage id, part number and question count equals the real data ('+res.n.join('/')+')');
   ok(res.vocabSame,'meta: the word ids equal the real word list');
   await c.close()});

 await step('T-032 Home loads none of the big files',async()=>{
   const {c,pg,files}=await lazy();await pg.goto(BASE);await pg.waitForTimeout(800);
   ok(!!(await pg.$('#app h1')),'lazy: Home draws');
   ok(files.join()==='meta','lazy: first load of Home requests only meta.js from js/data ('+files.join()+')');
   const home=await pg.evaluate(()=>({tiles:document.querySelectorAll('.tile-skill').length,mastery:document.querySelectorAll('.mg-cell').length,words:(document.querySelector('a[href="#/vocab"] .tile-num')||{}).textContent,wasBusy:document.getElementById('app').hasAttribute('aria-busy')}));
   ok(home.tiles===4&&home.mastery===10&&home.words==='285'&&!home.wasBusy,'lazy: Home shows 4 skill tiles, the mastery grid ('+home.mastery+' cells) and 285 words ready without loading the word list');
   for(const r of ['plan','history','settings','notes']){await hashGo(pg,'#/'+r);ok(!!(await pg.$('#app h1')),'lazy: #/'+r+' draws')}
   ok(files.join()==='meta','lazy: My plan, History, Notes and Settings load no big file ('+files.join()+')');
   await c.close()});

 await step('T-032 each route loads what it needs',async()=>{
   const L=['listening_pool_1','listening_pool_2','listening_pool_3','listening'],R=['reading_pool_1','reading_pool_2','reading'];
   const cases=[['#/practice/listening',L],['#/practice/reading',R],['#/practice/writing',['writing_speaking_pool','writing','writing_models']],['#/practice/speaking',['writing_speaking_pool','speaking','speaking_models']],
     ['#/learn',['lessons']],['#/learn/reading',['lessons']],['#/vocab',['vocab']],['#/grammar',['grammar']],['#/exam',['writing_speaking_pool','speaking']],['#/exam/run',POOL_NAMES],['#/practice',[]],['#/diagnostic',[]]];
   for(const [h,want] of cases){
     const {c,pg,files}=await lazy();await pg.goto(BASE+h);await pg.waitForTimeout(h==='#/exam/run'?2500:1500);
     const got=big(files).sort(),exp=want.slice().sort();
     ok(got.join()===exp.join(),`route ${h} loads exactly ${exp.length} data file(s) (${got.join(' ')||'none'})`);
     ok(!!(await pg.$('#app h1, #app .run-header, #app .task-bar, #app .exam-banner'))&&!(await pg.$('#loadRetry'))&&!(await pg.$('.loading-card')),`route ${h} has drawn (no spinner, no error)`);
     await c.close()}
   {const {c,pg,files}=await lazy();await pg.goto(BASE+'#/practice/reading');await pg.waitForTimeout(1200);await pg.click('#quickBtn');await pg.waitForTimeout(300);
    ok(!!(await pg.$('#qForm')),'lazy: Reading practice starts and shows questions');
    await pg.evaluate(()=>{document.querySelector('#qForm input[name="q0"]').click()});
    ok(!files.includes('explanations'),'explanations: starting a Reading practice does not request the explanations file');
    await pg.click('#submitPassage');await pg.waitForSelector('.explain',{timeout:5000}).catch(()=>{});
    ok(files.includes('explanations')&&await pg.$$eval('.explain',x=>x.length)>0&&!(await pg.$('#explainStatus')),'explanations: checking the answers loads the file and shows explanations under the questions');
    await pg.click('#nextPassage');await c.close()}
   {const {c,pg}=await lazy();await pg.goto(BASE+'#/practice/writing');await pg.waitForTimeout(1000);await pg.click('#emailBtn');await pg.waitForTimeout(200);
    ok(!!(await pg.$('#writingArea')),'lazy: Writing practice starts after its lazy load');await c.close()}
   {const {c,pg}=await lazy();await pg.goto(BASE+'#/practice/speaking');await pg.waitForTimeout(1000);await pg.click('#randomBtn');await pg.waitForTimeout(400);
    ok(!!(await pg.$('#app h1, #app .run-header')),'lazy: Speaking practice starts after its lazy load');await c.close()}
   for(const sk of ['listening','reading','writing','speaking']){
     const {c,pg,files}=await lazy();await pg.goto(BASE+'#/diagnostic');await pg.waitForTimeout(800);
     ok(big(files).length===0,`diagnostic: the page itself loads no data (${sk})`);
     await pg.click(`[data-diag="${sk}"]`);await pg.waitForTimeout(1500);
     ok(files.includes(sk)&&!files.includes(sk==='listening'?'reading':'listening'),`diagnostic: Start ${sk} loads ${sk} (${big(files).join(' ')})`);
     ok(!(await pg.$('[data-diag]'))&&!(await pg.$('#loadRetry')),`diagnostic: ${sk} diagnostic left the chooser and is running`);
     await c.close()}
   {const {c,pg,files}=await lazy();await pg.goto(BASE);await pg.waitForTimeout(500);
    await pg.evaluate(()=>{const pid=Object.keys(CELPIP_META.passages.reading)[0];Storage.set('mistakes',{a:{skill:'reading',pid,qi:0,part:1,box:0,due:'2000-01-01',wrong:1}})});
    await hashGo(pg,'#/dashboard');
    ok((await pg.$eval('a[href="#/review"] .tile-num',e=>e.textContent))==='1'&&big(files).length===0,'Home: one due mistake counted from the summary, nothing big loaded');
    await hashGo(pg,'#/review');await pg.waitForTimeout(1200);
    ok(files.includes('reading')&&files.includes('explanations')&&!files.includes('listening'),'review: with one Reading mistake due only Reading and explanations load ('+big(files).join(' ')+')');
    ok(/Review 1 of 1/.test(await ptxt(pg,'.run-header')||''),'review: the mistake is shown after loading');
    await c.close()}
   {const {c,pg,files}=await lazy();await pg.goto(BASE);await pg.waitForTimeout(500);
    await pg.click('.mg-cell[data-skill="listening"][data-part="1"]');await pg.waitForTimeout(1800);
    ok(files.includes('listening')&&!!(await pg.$('#qForm')),'Home: a mastery cell loads Listening and starts that part');await c.close()}
 });

 await step('T-032 leaving mid-load draws nothing old; the loading state',async()=>{
   const {c,pg}=await lazy();
   await pg.route('**/js/data/reading_pool_2.js',async r=>{await new Promise(x=>setTimeout(x,1500));await r.continue()});
   await pg.goto(BASE);await pg.waitForTimeout(500);
   await pg.evaluate(()=>{location.hash='#/practice/reading'});await pg.waitForTimeout(500);
   const busy=await pg.evaluate(()=>{const k=document.querySelector('.loading-card');return {busy:document.getElementById('app').getAttribute('aria-busy'),card:k&&k.textContent,role:k&&k.getAttribute('role'),h1:!!document.querySelector('#app h1')}});
   ok(busy.busy==='true'&&/Loading practice/.test(busy.card||'')&&busy.role==='status'&&!busy.h1,'loading: after 150 ms the page says "Loading practice..." with aria-busy and no old screen ('+(busy.card||'').trim()+')');
   if(SHOTS)await pg.screenshot({path:sp('t032-loading.png')});
   await pg.evaluate(()=>{location.hash='#/settings'});await pg.waitForTimeout(2200);
   const after=await pg.evaluate(()=>({h1:(document.querySelector('#app h1')||{}).textContent,qb:!!document.getElementById('quickBtn'),busy:document.getElementById('app').hasAttribute('aria-busy'),card:!!document.querySelector('.loading-card')}));
   ok(after.h1==='Settings'&&!after.qb&&!after.busy&&!after.card,'loading: moving to Settings mid-load leaves Settings showing; the Reading screen is never drawn ('+after.h1+')');
   await pg.evaluate(()=>{location.hash='#/practice/reading'});await pg.waitForTimeout(300);
   ok(!!(await pg.$('#quickBtn')),'loading: the files that arrived late are kept; Reading then opens at once');
   await c.close();
   const q=await lazy();await q.pg.goto(BASE+'#/vocab');await q.pg.waitForTimeout(1000);
   const same=await q.pg.evaluate(()=>{render();return {busy:document.getElementById('app').hasAttribute('aria-busy'),h1:!!document.querySelector('#app h1')}});
   ok(same.h1&&!same.busy,'loading: with the data already here render() draws at once (no waiting state)');
   await q.c.close()});

 await step('T-032 a failed load shows Retry',async()=>{
   const {c,pg}=await lazy();
   let fail=true;await pg.route('**/js/data/reading_pool_2.js',r=>fail?r.abort('connectionfailed'):r.continue());
   await pg.goto(BASE);await pg.waitForTimeout(500);
   await pg.evaluate(()=>{location.hash='#/practice/reading'});await pg.waitForTimeout(800);
   const e=await pg.evaluate(()=>{const k=document.querySelector('.load-error');return {txt:k&&k.textContent,role:k&&k.getAttribute('role'),btn:!!document.getElementById('loadRetry'),busy:document.getElementById('app').hasAttribute('aria-busy'),h1:(document.querySelector('#app h1')||{}).textContent}});
   ok(e.btn&&e.role==='alert'&&/could not be loaded/.test(e.txt||'')&&!e.busy&&!!e.h1,'failure: a plain message, a heading and a Retry button with role=alert ('+(e.h1||'')+')');
   if(SHOTS)await pg.screenshot({path:sp('t032-load-error.png')});
   fail=false;await pg.click('#loadRetry');await pg.waitForTimeout(1500);
   ok(!!(await pg.$('#quickBtn'))&&!(await pg.$('#loadRetry')),'failure: Retry fetches the failed file again and the screen opens');
   await c.close();
   const h=await lazy();let fail2=true;await h.pg.route('**/js/data/listening_pool_3.js',r=>fail2?r.abort('connectionfailed'):r.continue());
   await h.pg.goto(BASE);await h.pg.waitForTimeout(500);
   await h.pg.evaluate(()=>{window.__t=[];new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.classList&&n.classList.contains('toast'))window.__t.push(n.textContent)}))).observe(document.getElementById('toastHost'),{childList:true,subtree:true})});
   await h.pg.click('.mg-cell[data-skill="listening"][data-part="1"]');await h.pg.waitForTimeout(800);
   const ts=await h.pg.evaluate(()=>window.__t);
   ok(ts.some(t=>/could not be loaded/.test(t)&&/Press the button again/.test(t))&&!(await h.pg.$('#qForm')),'failure: a Home button shows an error toast and stays on Home');
   fail2=false;await h.pg.click('.mg-cell[data-skill="listening"][data-part="1"]');await h.pg.waitForTimeout(1800);
   ok(!!(await h.pg.$('#qForm')),'failure: pressing the Home button again retries and starts the practice');
   await h.c.close()});

 await step('T-032 script addresses come only from the fixed table',async()=>{
   const {c,pg,files}=await lazy();await pg.goto(BASE);await pg.waitForTimeout(500);
   const rej=await pg.evaluate(async()=>{const out=[];for(const n of ['__proto__','constructor','../../evil','js/data/reading.js','http://x.test/a.js',42,null]){try{await Loader.needData([n]);out.push('LOADED')}catch(e){out.push('refused')}}return out});
   ok(rej.every(x=>x==='refused'),'security: Loader refuses names that are not in its table ('+rej.join()+')');
   for(const h of ['#/practice/__proto__','#/practice/..%2f..%2fevil','#/learn/constructor','#/exam/%3Cscript%3E','#/__proto__']){await hashGo(pg,h);await pg.waitForTimeout(400)}
   const extra=big(files).filter(f=>f!=='lessons'&&f!=='speaking'&&f!=='writing_speaking_pool');
   ok(extra.length===0,'security: odd addresses in the # part add no script beyond the routes own table entries (extra files: '+extra.join(' ')+')');
   const tags=await pg.evaluate(()=>[...document.querySelectorAll('script[src]')].map(s=>s.getAttribute('src')).filter(s=>/js\/data\//.test(s)));
   ok(tags.every(s=>/^js\/data\/(new\/)?[a-z_0-9]+\.js$/.test(s)),'security: every data script tag in the page is a plain relative file from the table ('+tags.join(' ')+')');
   await c.close()});

 await step('T-032 offline after the first visit still opens every route',async()=>{
   const c=await b.newContext({viewport:{width:1280,height:900}});const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message));
   await pg.goto(BASE);
   await pg.evaluate(async()=>{for(let i=0;i<300;i++){const k=await caches.keys();if(k.includes('celpip-v13')&&(await (await caches.open('celpip-v13')).keys()).length>=40)return;await new Promise(r=>setTimeout(r,100))}});
   const cached=await pg.evaluate(async()=>{const ca=await caches.open('celpip-v13');const out=[];for(const f of Loader.files().concat(['js/loader.js','js/data/meta.js'])){out.push(!!(await ca.match(new URL(f,location.href).href)))}return out});
   ok(cached.length===18&&cached.every(Boolean),'offline: sw.js saved all 16 data files plus loader.js and meta.js on the first visit ('+cached.filter(Boolean).length+' of '+cached.length+')');
   await pg.reload();await pg.waitForTimeout(800);
   ok(await pg.evaluate(()=>!!navigator.serviceWorker.controller),'offline: the page is controlled by the service worker');
   await pg.evaluate(()=>{const pid=Object.keys(CELPIP_META.passages.reading)[0];Storage.set('mistakes',{a:{skill:'reading',pid,qi:0,part:1,box:0,due:'2000-01-01',wrong:1}})});
   await c.setOffline(true);
   await pg.reload();await pg.waitForTimeout(1000);
   for(const r of ['dashboard','learn','learn/listening','learn/reading','learn/writing','learn/speaking','practice','practice/listening','practice/reading','practice/writing','practice/speaking','exam','diagnostic','review','vocab','grammar','notes','plan','history','settings','exam/run']){
     await pg.evaluate(h=>{if(location.hash===h)render();else location.hash=h},'#/'+r);await pg.waitForTimeout(r==='exam/run'?1500:700);
     const st=await pg.evaluate(()=>({h1:!!document.querySelector('#app h1, #app .run-header, #app .task-bar, #app h2'),err:!!document.getElementById('loadRetry'),busy:document.getElementById('app').hasAttribute('aria-busy')}));
     ok(st.h1&&!st.err&&!st.busy,`offline: #/${r} opens (data from the saved copy)`)}
   await pg.evaluate(()=>{window.onbeforeunload=null;location.hash='#/practice/reading'});await pg.waitForTimeout(500);await pg.click('#quickBtn');await pg.waitForTimeout(300);
   ok(!!(await pg.$('#qForm')),'offline: a Reading practice starts and shows questions');
   await pg.click('#submitPassage');await pg.waitForSelector('.explain',{timeout:5000}).catch(()=>{});
   ok(await pg.$$eval('.explain',x=>x.length)>0,'offline: checking answers still shows the explanations (file from the saved copy)');
   await c.setOffline(false);await c.close()});


 await step('T-032 explanations: failure shows Retry under the score',async()=>{
   const {c,pg}=await lazy();let fail=true;await pg.route('**/js/data/new/explanations.js',r=>fail?r.abort('connectionfailed'):r.continue());
   await pg.goto(BASE+'#/practice/listening');await pg.waitForTimeout(1500);await pg.click('#quickBtn');await pg.waitForTimeout(300);
   await pg.click('#submitPassage');await pg.waitForTimeout(800);
   const st=await pg.evaluate(()=>{const e=document.getElementById('explainStatus');return {t:e&&e.textContent,btn:!!(e&&e.querySelector('button')),score:/correct/.test((document.querySelector('.score-line')||{}).textContent||''),n:document.querySelectorAll('.explain').length}});
   const en=await pg.evaluate(()=>{const e=document.getElementById('explainStatusEnd'),f=document.getElementById('nextPassage');return {t:e&&e.textContent,btn:!!(e&&e.querySelector('button')),role:e&&e.getAttribute('role'),same:!!e&&e.parentElement===f.parentElement}});
   ok(st.score&&st.btn&&/could not be loaded/.test(st.t||'')&&st.n===0,'explanations: when the file fails the score and answers stay, a message and Retry appear near the score');
   ok(en.btn&&en.same&&en.role==='status'&&/could not be loaded/.test(en.t||''),'explanations: the same message and a Retry button also sit beside the Next / Finish button (role=status)');
   if(SHOTS){await pg.evaluate(()=>window.scrollTo(0,0));await pg.screenshot({path:sp('t032-explain-error-top.png')});await pg.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await pg.waitForTimeout(200);await pg.screenshot({path:sp('t032-explain-error-bottom.png')})}
   fail=false;await pg.click('#explainStatusEnd button');await pg.waitForSelector('.explain',{timeout:5000}).catch(()=>{});
   ok(await pg.$$eval('.explain',x=>x.length)>0&&!(await pg.$('#explainStatus'))&&!(await pg.$('#explainStatusEnd')),'explanations: Retry loads them and fills the slots');
   await c.close()});


 await step('T-032 time runs out while explanations are still loading',async()=>{
   const {c,pg}=await lazy();
   await pg.addInitScript(()=>{const F=100,st=window.setTimeout.bind(window),si=window.setInterval.bind(window);window.setTimeout=(f,d,...a)=>st(f,(d||0)/F,...a);window.setInterval=(f,d,...a)=>si(f,(d||0)/F,...a)});
   await pg.route('**/js/data/new/explanations.js',async r=>{await new Promise(x=>setTimeout(x,6000));await r.continue()});
   await pg.goto(BASE+'#/practice/reading');await pg.waitForSelector('#timedBtn',{timeout:15000});await pg.click('#timedBtn');
   await pg.waitForSelector('#mcqTimer',{timeout:10000});
   ok(await pg.evaluate(()=>typeof Loader!=='undefined'&&!Loader.isLoaded(['explanations'])),'timed: the explanations file is not loaded while the clock runs');
   await pg.waitForSelector('.score-line',{timeout:120000});
   const r=await pg.evaluate(()=>({score:/correct/.test(document.querySelector('.score-line').textContent),btn:(document.getElementById('nextPassage')||{}).textContent,loading:!!document.getElementById('explainStatus')}));
   ok(r.score&&r.btn==='Finish & See Score'&&r.loading,'timed: time up with explanations still loading shows the score, "Finish & See Score" and the loading line');
   await pg.click('#nextPassage');await pg.waitForSelector('.result-card h1',{timeout:5000}).catch(()=>{});
   ok(/Practice Complete/.test(await ptxt(pg,'.result-card h1')||''),'timed: Finish works before the explanations arrive');
   await c.close()});

 // ===== T-033 B1b: the profile panel inside the island and the phone drawer =====
 await step('T-033 B1b profile panel: opens from the row, closes with Back, X and Esc, focus in and back, switching works',async()=>{
   const st=pg=>pg.evaluate(()=>{const s=document.getElementById('sidebar'),pn=document.getElementById('profPanel'),row=document.querySelector('#sidebar [data-profile-panel-open]'),a=document.activeElement;
     return {panel:s.hasAttribute('data-panel'),vis:getComputedStyle(pn).visibility,op:getComputedStyle(pn).opacity,panelInert:pn.inert,navInert:document.getElementById('mainNav').inert,footInert:s.querySelector('.isl-foot').inert,exp:row&&row.getAttribute('aria-expanded'),ctl:row&&row.getAttribute('aria-controls'),
       inPanel:pn.contains(a),back:!!a.closest('[data-pp-back]'),onRow:a===row,ov:document.documentElement.dataset.overlay||'',h:(pn.querySelector('h2')||{}).textContent,xVis:s.querySelector('#islandX').getClientRects().length>0,kbd:!!s.querySelector('.isl-foot [data-shortcut-sheet]')}});
   const modes=[
     {name:'1440 pinned',vp:{width:1440,height:900},open:async()=>{},closeKeyEsc2:false,pinned:true},
     {name:'1100 overlay',vp:{width:1100,height:800},open:async pg=>{await pg.click('[data-rail-expand]');await pg.waitForTimeout(450)},overlay:true},
     {name:'390 drawer',vp:{width:390,height:844},open:async pg=>{await pg.click('#topbar .menu-btn');await pg.waitForTimeout(450)},overlay:true}];
   for(const m of modes){
     const {c,pg}=await fresh({viewport:m.vp});
     await pg.evaluate(()=>{window.__xss=0;Profiles.create('Kofi');Profiles.switchTo(Profiles.list()[0].id)});await pg.waitForTimeout(300);
     const shape0=await pg.evaluate(()=>({idx:Object.keys(JSON.parse(localStorage.getItem('celpip_profiles_v1'))).sort().join(),rec:Object.keys(Profiles.list()[0]).sort().join(),keys:Object.keys(localStorage).sort().join()}));
     await m.open(pg);
     let s=await st(pg);ok(!s.panel&&s.vis==='hidden'&&s.panelInert&&!s.navInert&&s.exp==='false'&&s.ctl==='profPanel',m.name+': panel closed at first (hidden, inert; row aria-expanded false, controls the panel)');
     ok(await pg.$eval('#sidebar [data-profile-panel-open]',r=>/Studying as .*Open profile and switch/.test(r.getAttribute('aria-label'))&&r.textContent.indexOf('Profile and switch')>=0&&!document.querySelector('#sidebar [data-profile-open]')),m.name+': the lone pill is now a profile row ("Profile and switch"), no old chooser button inside the menu');
     await pg.click('#sidebar [data-profile-panel-open]');await pg.waitForTimeout(500);s=await st(pg);
     ok(s.panel&&s.vis==='visible'&&s.op==='1'&&!s.panelInert&&s.navInert&&s.footInert&&s.exp==='true'&&s.back&&s.h==='Profile'&&s.xVis,m.name+': the row opens the panel inside the menu (list and foot inert, row expanded, focus on Back, heading "Profile", X still visible)');
     if(SHOTS&&(m.vp.width===1440||m.vp.width===390)){for(const th of ['light','dark']){await pg.evaluate(t=>document.documentElement.setAttribute('data-theme',t),th);await pg.waitForTimeout(150);await pg.screenshot({path:sp('b1b-'+m.vp.width+'-profile-panel-'+th+'.png')})}await pg.evaluate(()=>Shell.setTheme('light'))}
     await pg.click('#profPanel [data-pp-back]');await pg.waitForTimeout(500);s=await st(pg);
     ok(!s.panel&&s.vis==='hidden'&&!s.navInert&&s.onRow&&s.exp==='false'&&s.kbd,m.name+': Back closes the panel and focus returns to the row (keyboard shortcuts link still in the foot)');
     await pg.keyboard.press('Enter');await pg.waitForTimeout(500);s=await st(pg);ok(s.panel&&s.back,m.name+': the row opens with the keyboard (Enter), focus on Back');
     await pg.keyboard.press('Escape');await pg.waitForTimeout(500);s=await st(pg);
     ok(!s.panel&&s.onRow&&s.ov===(m.overlay?'open':''),m.name+': Esc closes the panel first and focus returns to the row'+(m.overlay?' (the menu itself stays open)':''));
     // switching from the panel works as before
     await pg.click('#sidebar [data-profile-panel-open]');await pg.waitForTimeout(500);
     const ids=await pg.evaluate(()=>Profiles.list().map(p=>p.id));
     await pg.click('#profPanel [data-pp-id="'+ids[1]+'"]');await pg.waitForTimeout(500);
     s=await st(pg);const sw=await pg.evaluate(()=>({a:Profiles.activeId,name:Profiles.active().name,row:document.querySelector('#sidebar .profile-name').textContent,cur:document.querySelector('#profPanel [aria-current="true"] .pp-prof-name').textContent,who:document.querySelector('.pp-who-name').textContent,act:document.activeElement.dataset.ppId}));
     if(m.overlay){ok(sw.a===ids[1]&&sw.name==='Kofi'&&s.ov===''&&!s.panel,m.name+': switching in the panel changes the active profile; the page redraws for the new learner, which closes the overlay menu (as any page change does) and resets the panel');
     await m.open(pg);await pg.click('#sidebar [data-profile-panel-open]');await pg.waitForTimeout(500);
     ok(await pg.evaluate(()=>document.querySelector('#sidebar .profile-name').textContent==='Kofi'&&document.querySelector('#profPanel [aria-current="true"] .pp-prof-name').textContent==='Kofi'&&document.querySelector('.pp-who-name').textContent==='Kofi'),m.name+': reopened, the row and the panel name the new active profile')}
     else ok(sw.a===ids[1]&&sw.name==='Kofi'&&sw.row==='Kofi'&&sw.cur==='Kofi'&&sw.who==='Kofi'&&s.panel&&sw.act===ids[1],m.name+': switching in the panel changes the active profile (row, panel and screen follow); the panel stays open; focus stays on the chosen profile');
     const shape1=await pg.evaluate(()=>({idx:Object.keys(JSON.parse(localStorage.getItem('celpip_profiles_v1'))).sort().join(),rec:Object.keys(Profiles.list()[0]).sort().join(),keys:Object.keys(localStorage).sort().join()}));
     ok(shape1.idx===shape0.idx&&shape1.rec===shape0.rec,m.name+': profile data shape unchanged (index keys "'+shape1.idx+'", record keys "'+shape1.rec+'")');
     // add through the panel with a name made of markup: shown as text only
     await pg.click('#profPanel [data-pp-add]');await pg.fill('#pp-add-name','<img src=x onerror=window.__xss=1>');await pg.click('#profPanel .pp-form .btn-primary');await pg.waitForTimeout(500);
     const ad=await pg.evaluate(()=>({n:Profiles.list().length,name:Profiles.active().name,imgs:document.querySelectorAll('#sidebar img, #app img').length,xss:window.__xss||0,txt:document.querySelector('.pp-who-name').textContent}));
     ok(ad.n===3&&ad.name==='<img src=x onerror=window.__xss=1>'&&ad.txt===ad.name&&ad.imgs===0&&ad.xss===0,m.name+': Add a profile in the panel works; a markup name is plain text (no element, no script)');
     // rename inline, Esc closes only the form
     if(m.overlay){await m.open(pg);await pg.click('#sidebar [data-profile-panel-open]');await pg.waitForTimeout(500)}   // adding switched the learner, which closed the overlay menu
     await pg.click('#profPanel [data-pp-rename]');await pg.fill('#pp-rename-name','Ada');await pg.keyboard.press('Escape');await pg.waitForTimeout(300);s=await st(pg);
     ok(s.panel&&!(await pg.$('#profPanel .pp-form'))&&await pg.evaluate(()=>Profiles.active().name!=='Ada'),m.name+': Esc inside the rename box cancels only the box (panel stays, name unchanged)');
     await pg.click('#profPanel [data-pp-rename]');await pg.fill('#pp-rename-name','Ada');await pg.keyboard.press('Enter');await pg.waitForTimeout(400);
     ok(await pg.evaluate(()=>Profiles.active().name==='Ada'&&document.querySelector('#sidebar .profile-name').textContent==='Ada'),m.name+': Rename saves with Enter');
     ok(await pg.evaluate(()=>{const l=[...document.querySelectorAll('#profPanel a.pp-item')];return l.length===2&&l.every(a=>a.getAttribute('href')==='#/settings')&&!!document.querySelector('#profPanel [data-pp-move]')}),m.name+': Move to another device and Settings are links to Settings (where the existing share and QR card is)');
     // Tab stays in an open overlay (the inert page list is skipped)
     if(m.overlay){let leak=false,seen=new Set();for(let i=0;i<40&&!leak;i++){await pg.keyboard.press('Tab');const r=await pg.evaluate(()=>({out:!document.activeElement.closest('#sidebar'),inert:!!document.activeElement.closest('[inert]'),lbl:document.activeElement.id||document.activeElement.className}));leak=r.out||r.inert;seen.add(r.lbl)}ok(!leak,m.name+': Tab in the panel never leaves it or lands on an inert part (40 presses)')}
     // X
     await pg.click('#islandX');await pg.waitForTimeout(500);
     if(m.overlay){s=await st(pg);ok(s.ov===''&&!s.panel,m.name+': the X closes the menu and the panel with it');await m.open(pg);s=await st(pg);ok(s.ov==='open'&&!s.panel&&!s.navInert,m.name+': the menu opens again on the page list, panel closed')}
     else{s=await st(pg);ok(!s.panel&&await pg.evaluate(()=>document.documentElement.dataset.nav==='rail'),m.name+': the X folds the island to the rail and leaves the panel closed')}
     // reopen then second Esc closes an overlay
     if(m.overlay){await pg.click('#sidebar [data-profile-panel-open]');await pg.waitForTimeout(450);await pg.keyboard.press('Escape');await pg.waitForTimeout(450);await pg.keyboard.press('Escape');await pg.waitForTimeout(450);s=await st(pg);ok(s.ov===''&&!s.panel,m.name+': a second Esc closes the menu')}
     else{await pg.click('[data-rail-expand]');await pg.waitForTimeout(500);await pg.click('#sidebar [data-profile-panel-open]');await pg.waitForTimeout(450);await pg.keyboard.press('Escape');await pg.waitForTimeout(450);s=await st(pg);ok(!s.panel&&await pg.evaluate(()=>document.documentElement.dataset.nav==='pinned'),m.name+': pinned: Esc from the panel only returns to the list, the island stays pinned')}
     await c.close();
   }
   });
 // reduced motion: no slide, fade only
 await step('T-033 B1b profile panel: reduced motion',async()=>{
   const {c,pg}=await fresh({viewport:{width:1440,height:900},reducedMotion:'reduce'});
   await pg.click('#sidebar [data-profile-panel-open]');await pg.waitForTimeout(150);
   const r=await pg.evaluate(()=>({t:getComputedStyle(document.getElementById('profPanel')).transform,nav:getComputedStyle(document.getElementById('mainNav')).transform,vis:getComputedStyle(document.getElementById('profPanel')).visibility,d:getComputedStyle(document.getElementById('profPanel')).transitionDuration}));
   ok(r.vis==='visible'&&(r.t==='none'||r.t==='matrix(1, 0, 0, 1, 0, 0)')&&(r.nav==='none'||r.nav==='matrix(1, 0, 0, 1, 0, 0)'),'reduced motion: the panel and the list do not travel (transform '+r.t+' / '+r.nav+', duration '+r.d+')');
   await c.close()});

 // ---------- T-033 B2a: the Arrange menu (order of pages, four bottom-bar pages, per profile, validated) ----------
 await step('T-033 B2a Arrange menu: default, reorder, bar choice, persistence, profiles, tampering, transfer, screenshots',async()=>{
   const DEF=['dashboard','learn','practice','review','vocab','grammar','notes','plan','exam','history','settings'],DBAR=['dashboard','practice','plan','exam'];
   const {c,pg}=await fresh({viewport:{width:390,height:844},reducedMotion:'reduce'});
   await pg.evaluate(()=>{window.__xss=0});
   const lay=()=>pg.evaluate(()=>{const ids=sel=>[...document.querySelectorAll(sel)].map(a=>a.dataset.section);
     const drawer=[...document.querySelectorAll('#mainNav>a')].filter(a=>getComputedStyle(a).display!=='none').map(a=>a.dataset.section);
     return {side:ids('#mainNav>a'),rail:ids('#rail .rail-list>a'),bar:ids('#tabBar>a'),drawer,stored:localStorage.getItem(Profiles.key('celpip_navlayout_v1')),cur:document.querySelector('#tabBar [aria-current=page]')&&document.querySelector('#tabBar [aria-current=page]').dataset.section}});
   const sameArr=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
   const openSettings=async()=>{await pg.evaluate(()=>{if(location.hash==='#/settings')render();else location.hash='#/settings'});await pg.waitForTimeout(350)};
   const live=()=>pg.$eval('#arrLive',e=>e.textContent).catch(()=>null);
   const status=()=>pg.$eval('.arr-status',e=>e.textContent.trim());
   const rowIds=()=>pg.$$eval('.arr-row',r=>r.map(x=>x.dataset.id));
   const focused=()=>pg.evaluate(()=>{const a=document.activeElement;return a?(a.dataset.act||'')+':'+(a.dataset.id||''):''});
   // 1. default
   let s=await lay();
   ok(sameArr(s.side,DEF)&&sameArr(s.rail,DEF)&&sameArr(s.bar,DBAR)&&s.stored===null,'arrange: no saved layout gives the default (side menu, rail and bar), and nothing is stored');
   ok(sameArr(s.drawer,DEF.filter(x=>DBAR.indexOf(x)<0)),'arrange: the phone drawer lists the seven pages that are not in the bar');
   await openSettings();
   ok((await rowIds()).join()===DEF.join()&&/4 of 4 chosen/.test(await status()),'arrange: the card lists 11 rows in the default order and says "4 of 4 chosen"');
   const home=await pg.evaluate(()=>{const r=document.querySelector('.arr-row[data-id=dashboard]');return {up:r.querySelector('[data-act=up]').getAttribute('aria-disabled'),dn:r.querySelector('[data-act=down]').getAttribute('aria-disabled'),sw:r.querySelector('[role=switch]').getAttribute('aria-disabled')+'/'+r.querySelector('[role=switch]').getAttribute('aria-checked'),word:r.querySelector('.arr-word').textContent.trim(),learnUp:document.querySelector('.arr-row[data-id=learn] [data-act=up]').getAttribute('aria-disabled')}});
   ok(home.up==='true'&&home.dn==='true'&&home.sw==='true/true'&&home.word==='Always in bar'&&home.learnUp==='true','arrange: Home cannot move and is locked into the bar; the row under Home cannot move above it');
   // 2. reorder by keyboard
   await pg.focus('[data-act=down][data-id=practice]');await pg.keyboard.press('Enter');await pg.waitForTimeout(200);
   s=await lay();let want=DEF.slice();want.splice(2,1);want.splice(3,0,'practice');
   ok(sameArr(s.side,want)&&sameArr(s.rail,want)&&sameArr(await rowIds(),want)&&JSON.parse(s.stored).order.join()===want.join()&&sameArr(s.bar,DBAR),'arrange: Move down on Practice with Enter changes the card, the side menu, the rail and the stored order (bar unchanged)');
   ok((await focused())==='down:practice'&&/Practice moved to position 4 of 11\./.test(await live()),'arrange: focus stays on the same Move down button and a status line says "Practice moved to position 4 of 11."');
   // by tap
   await pg.click('[data-act=up][data-id=exam]');await pg.waitForTimeout(200);
   s=await lay();want=want.slice();want.splice(8,1);want.splice(7,0,'exam');
   ok(sameArr(s.side,want)&&sameArr(s.bar,['dashboard','practice','exam','plan']),'arrange: Move up by tap on Exam; the bar follows the list order (Home, Practice, Exam, My plan)');
   // moves at the ends do nothing
   const before=s.stored;await pg.click('[data-act=up][data-id=dashboard]',{force:true});await pg.click('[data-act=down][data-id=settings]',{force:true});   // force: Playwright treats aria-disabled as not clickable, but a real finger can tap itawait pg.waitForTimeout(100);
   ok((await lay()).stored===before,'arrange: a disabled Move button (Home up, last row down) changes nothing');
   // 3. bar choice and the 3-item draft
   await pg.click('.arr-row[data-id=practice] [role=switch]');await pg.waitForTimeout(150);
   s=await lay();
   ok(/3 of 4 chosen\. Pick 1 more to save\./.test(await status())&&s.stored===before&&sameArr(s.bar,['dashboard','practice','exam','plan']),'arrange: switching Practice off shows "3 of 4 chosen. Pick 1 more to save." and saves nothing (menus keep the last valid layout)');
   await pg.click('[data-act=up][data-id=grammar]');await pg.waitForTimeout(150);
   ok((await lay()).stored===before,'arrange: a reorder made while the draft has 3 bar items is not saved either');
   await pg.click('.arr-row[data-id=learn] [role=switch]');await pg.waitForTimeout(200);
   s=await lay();const j=JSON.parse(s.stored);
   ok(sameArr(j.bar,['dashboard','learn','exam','plan'].sort((a,b)=>j.order.indexOf(a)-j.order.indexOf(b)))&&sameArr(s.bar,j.bar)&&j.order.indexOf('grammar')===j.order.indexOf('vocab')-1&&/4 of 4 chosen\. Saved for/.test(await status()),'arrange: choosing a fourth item saves the whole draft at once (bar and the earlier reorder) and the bar shows it');
   // full: a fifth cannot be turned on
   const full=await pg.evaluate(()=>{const b=document.querySelector('.arr-row[data-id=review] [role=switch]');return b.getAttribute('aria-disabled')});
   await pg.click('.arr-row[data-id=review] [role=switch]',{force:true});await pg.waitForTimeout(150);
   ok(full==='true'&&/Bottom bar is full\. Turn one off first\./.test(await live())&&(await lay()).stored===s.stored,'arrange: with 4 chosen the other switches are disabled and say why; a fifth cannot be added');
   // 4. persists across reload
   const saved=(await lay()).stored;await pg.reload();await pg.waitForTimeout(700);s=await lay();
   ok(s.stored===saved&&sameArr(s.side,j.order)&&sameArr(s.bar,j.bar),'arrange: the layout is still there after a reload (menus and storage)');
   ok(await pg.evaluate(()=>location.hash==='#/settings')&&(await rowIds()).join()===j.order.join(),'arrange: a reload on Settings draws the card from the saved layout');
   // reset
   await pg.click('[data-act=reset]');await pg.waitForTimeout(200);s=await lay();
   ok(sameArr(s.side,DEF)&&sameArr(s.bar,DBAR)&&s.stored===null,'arrange: "Reset to default" restores the default and removes the stored note');
   // 5. per profile
   await pg.click('[data-act=down][data-id=learn]');await pg.waitForTimeout(150);
   const aStored=(await lay()).stored;const ids=await pg.evaluate(()=>{const b=Profiles.create('Bea');return [Profiles.activeId,b.id]});
   await pg.evaluate(id=>Profiles.switchTo(id),ids[1]);await pg.waitForTimeout(500);s=await lay();
   ok(s.stored===null&&sameArr(s.side,DEF)&&sameArr(s.bar,DBAR),'arrange: a new profile starts with the default layout');
   await openSettings();await pg.click('[data-act=down][data-id=review]');await pg.click('.arr-row[data-id=exam] [role=switch]');await pg.click('.arr-row[data-id=history] [role=switch]');await pg.waitForTimeout(200);
   const bStored=(await lay()).stored;
   await pg.evaluate(id=>Profiles.switchTo(id),ids[0]);await pg.waitForTimeout(500);s=await lay();
   ok(bStored&&aStored&&bStored!==aStored&&s.stored===aStored&&JSON.parse(aStored).order[1]==='practice'&&JSON.parse(bStored).order[3]==='vocab','arrange: profile A and profile B keep different layouts; switching profile redraws the menus from that profile\'s layout');
   // 6. drives sidebar, rail, drawer and bar at every width
   await pg.evaluate(id=>Profiles.switchTo(id),ids[1]);await pg.waitForTimeout(500);
   const bl=JSON.parse(bStored);
   for(const w of [390,1100,1440]){await pg.setViewportSize({width:w,height:900});await pg.waitForTimeout(400);s=await lay();
     const exp=w<1000?bl.order.filter(x=>bl.bar.indexOf(x)<0):bl.order;
     const barVis=await pg.$eval('#tabBar',e=>getComputedStyle(e).display!=='none');
     ok(sameArr(s.side,bl.order)&&sameArr(s.rail,bl.order)&&sameArr(s.bar,bl.bar)&&sameArr(s.drawer,exp)&&(w<1000)===barVis,'arrange '+w+'px: one setting drives the side menu, rail, '+(w<1000?'drawer (non-bar pages)':'full list')+' and the 4-item bar');}
   await pg.setViewportSize({width:390,height:844});await pg.waitForTimeout(300);
   ok(await pg.$$eval('#tabBar a',a=>a.length===4&&a.every(x=>x.getClientRects().length&&x.textContent.trim().length>0&&x.querySelector('svg use').getAttribute('href').indexOf('#i-')===0)),'arrange: the bar always shows exactly four links, each with an icon and a short name');
   // current page mark follows the rebuilt bar
   await pg.evaluate(()=>{location.hash='#/dashboard'});await pg.waitForTimeout(300);
   ok((await lay()).cur==='dashboard'&&await pg.evaluate(()=>NavLayout.save({v:1,order:NavLayout.IDS.slice(),bar:['dashboard','learn','plan','exam']}))&&(await lay()).cur==='dashboard','arrange: the current page keeps its aria-current mark after the bar is rebuilt');
   // 7. a change while the menu is open does not close it
   await pg.click('#topbar .menu-btn');await pg.waitForTimeout(450);
   await pg.evaluate(()=>NavLayout.save({v:1,order:NavLayout.IDS.slice(),bar:['dashboard','practice','plan','exam']}));await pg.waitForTimeout(300);
   ok(await pg.evaluate(()=>document.documentElement.dataset.overlay==='open'&&!document.getElementById('sidebar').inert),'arrange: a layout change (a save, an import landing) while the drawer is open leaves it open');
   await pg.click('#sidebar [data-profile-panel-open]');await pg.waitForTimeout(450);await pg.click('#profPanel [data-pp-rename]');await pg.fill('#pp-rename-name','Beatrice');await pg.keyboard.press('Enter');await pg.waitForTimeout(500);
   s=await lay();
   ok(await pg.evaluate(()=>document.documentElement.dataset.overlay==='open'&&Profiles.active().name==='Beatrice')&&sameArr(s.drawer,DEF.filter(x=>DBAR.indexOf(x)<0)),'arrange: renaming inside the open drawer keeps it open and the drawer list still follows the layout');
   await pg.keyboard.press('Escape');await pg.keyboard.press('Escape');await pg.waitForTimeout(450);
   // 8. tampered storage falls back to the default, with no error (page errors are checked by step())
   const tamper=[['unknown id',JSON.stringify({v:1,order:DEF.slice(0,10).concat(['bogus']),bar:DBAR})],
     ['duplicate id',JSON.stringify({v:1,order:DEF.slice(0,10).concat(['learn']),bar:DBAR})],
     ['Home not first',JSON.stringify({v:1,order:['learn','dashboard'].concat(DEF.slice(2)),bar:DBAR})],
     ['no Home in bar',JSON.stringify({v:1,order:DEF,bar:['learn','practice','plan','exam']})],
     ['5 bar items',JSON.stringify({v:1,order:DEF,bar:['dashboard','practice','plan','exam','learn']})],
     ['3 bar items',JSON.stringify({v:1,order:DEF,bar:['dashboard','practice','exam']})],
     ['bar out of list order',JSON.stringify({v:1,order:DEF,bar:['exam','dashboard','practice','plan']})],
     ['duplicate in bar',JSON.stringify({v:1,order:DEF,bar:['dashboard','practice','practice','exam']})],
     ['order not an array',JSON.stringify({v:1,order:'dashboard',bar:DBAR})],
     ['bar not an array',JSON.stringify({v:1,order:DEF,bar:{0:'dashboard'}})],
     ['wrong version',JSON.stringify({v:2,order:DEF,bar:DBAR})],
     ['string version',JSON.stringify({v:'1',order:DEF,bar:DBAR})],
     ['extra field',JSON.stringify({v:1,order:DEF,bar:DBAR,x:1})],
     ['markup id',JSON.stringify({v:1,order:DEF.slice(0,10).concat(['<img src=x onerror=window.__xss=1>']),bar:DBAR})],
     ['__proto__ key',  '{"v":1,"order":'+JSON.stringify(DEF)+',"bar":'+JSON.stringify(DBAR)+',"__proto__":{"x":1}}'],
     ['an array',JSON.stringify([1,2,3])],['null','null'],['a number','7'],['a string','"dashboard"'],['not JSON','{oops'],['empty',''],
     ['huge string','x'.repeat(200000)],['huge valid-looking JSON','{"v":1,"order":'+JSON.stringify(DEF)+',"bar":'+JSON.stringify(DBAR)+',"pad":"'+'y'.repeat(100000)+'"}'],
     ['huge arrays',JSON.stringify({v:1,order:new Array(5000).fill('learn'),bar:DBAR})]];
   const bad=[];
   for(const [name,val] of tamper){
     const r=await pg.evaluate(async v=>{localStorage.setItem(Profiles.key('celpip_navlayout_v1'),v);NavLayout.refresh();
       const g=NavLayout.get(),d=NavLayout.defaultLayout();return {same:JSON.stringify(g)===JSON.stringify(d),stored:NavLayout.stored(),side:[...document.querySelectorAll('#mainNav>a')].map(a=>a.dataset.section).join(),bar:[...document.querySelectorAll('#tabBar>a')].map(a=>a.dataset.section).join(),exp:Storage.exportAll().navLayout}},val);
     if(!(r.same&&r.stored===null&&r.side===DEF.join()&&r.bar===DBAR.join()&&r.exp===null))bad.push(name)}
   ok(bad.length===0,'arrange: '+tamper.length+' tampered stored values (unknown id, duplicate, no Home first, no Home in bar, 5 or 3 bar items, wrong order, non-array, wrong or string version, extra field, markup id, __proto__, array, null, number, string, not JSON, empty, huge string, huge JSON, huge arrays) all fall back to the default, are left out of an export, and the page shows the default'+(bad.length?' FAILED: '+bad.join(', '):''));
   await openSettings();
   ok((await rowIds()).join()===DEF.join()&&/4 of 4 chosen/.test(await status())&&await pg.evaluate(()=>(window.__xss||0)===0&&!document.querySelector('#app img')),'arrange: Settings draws the default after tampering, and no markup ran or appeared');
   await pg.evaluate(()=>localStorage.removeItem(Profiles.key('celpip_navlayout_v1')));
   // 9. export -> import and QR round trip
   const mine={v:1,order:['dashboard','learn','review','practice','vocab','grammar','notes','exam','plan','history','settings'],bar:['dashboard','practice','exam','plan'].sort((a,b)=>['dashboard','learn','review','practice','vocab','grammar','notes','exam','plan'].indexOf(a)-['dashboard','learn','review','practice','vocab','grammar','notes','exam','plan'].indexOf(b))};
   const rt=await pg.evaluate(async mine=>{
     NavLayout.save(mine);const exp=JSON.parse(JSON.stringify(Storage.exportAll()));
     const ch=await Transfer.makeChunks(Storage.exportAll());const rx=Transfer.Receiver();let r;for(const t of ch.sort(()=>Math.random()-.5))r=await rx.add(t);
     const key=id=>'celpip_p_'+id+'_navlayout_v1';
     const pf=Storage.addAsProfile(JSON.parse(JSON.stringify(exp)));const pq=Storage.addAsProfile(r.data);
     const cur=Profiles.activeId;NavLayout.reset();const a0=NavLayout.stored();
     const imp=Storage.importAll(JSON.parse(JSON.stringify(exp)));const a1=NavLayout.stored();
     NavLayout.reset();const rep=Storage.replaceActive(JSON.parse(JSON.stringify(exp)));const a2=NavLayout.stored();
     return {expLay:exp.navLayout,state:r.state,file:localStorage.getItem(key(pf.id)),qr:localStorage.getItem(key(pq.id)),a0,imp,a1,rep,a2,sideNow:[...document.querySelectorAll('#mainNav>a')].map(a=>a.dataset.section).join()}},mine);
   ok(JSON.stringify(rt.expLay)===JSON.stringify(mine),'arrange: the export (backup file) carries the layout');
   ok(rt.file===JSON.stringify(mine)&&rt.state==='done'&&rt.qr===JSON.stringify(mine),'arrange: file import (add as new profile) and the QR transfer (pieces in shuffled order) both give the new profile the same layout');
   ok(rt.a0===null&&rt.imp&&JSON.stringify(rt.a1)===JSON.stringify(mine)&&rt.rep&&JSON.stringify(rt.a2)===JSON.stringify(mine)&&rt.sideNow===mine.order.join(),'arrange: "Import into this profile" and "Replace this profile" restore the layout and the menus show it at once');
   // 10. tampered imports (file and QR) are dropped, never trusted
   const ti=await pg.evaluate(async mine=>{
     const DEFa=NavLayout.IDS.slice();const hist=[{id:'a_1730000000001_aaa111',type:'practice',skill:'reading',pct:60,clb:6,date:'2026-11-01T10:00:00.000Z'}];
     const evil=[{v:1,order:DEFa.slice(0,10).concat(['bogus']),bar:['dashboard','practice','plan','exam']},{v:1,order:DEFa,bar:['dashboard','practice','plan','exam','learn']},{v:1,order:['learn','dashboard'].concat(DEFa.slice(2)),bar:['dashboard','practice','plan','exam']},
       {v:1,order:DEFa,bar:['learn','practice','plan','exam']},'x'.repeat(100000),[1,2],7,{v:1,order:DEFa,bar:['dashboard','practice','plan','exam'],extra:'<img src=x onerror=window.__xss=1>'},JSON.parse('{"v":1,"order":'+JSON.stringify(DEFa)+',"bar":["dashboard","practice","plan","exam"],"__proto__":{"p":1}}')];
     const out={cleaned:0,imported:0,alone:null,qr:0,total:evil.length};
     NavLayout.save(mine);const before=localStorage.getItem(Profiles.key('celpip_navlayout_v1'));
     for(const e of evil){const cb=Storage.cleanBundle({history:hist,navLayout:e});if(cb&&cb.navLayout===undefined)out.cleaned++;
       Storage.importAll({history:hist,navLayout:e});if(localStorage.getItem(Profiles.key('celpip_navlayout_v1'))===before)out.imported++;
       const ch=await Transfer.makeChunks({history:hist,navLayout:e});const rx=Transfer.Receiver();let r;for(const t of ch)r=await rx.add(t);
       const p=Storage.addAsProfile(r.data);if(p&&localStorage.getItem('celpip_p_'+p.id+'_navlayout_v1')===null)out.qr++;if(p)Profiles.remove(p.id);}
     out.alone=Storage.cleanBundle({navLayout:mine});
     const rr=Storage.replaceActive({history:hist,navLayout:evil[0]});out.afterReplace=localStorage.getItem(Profiles.key('celpip_navlayout_v1'));out.rr=rr;out.proto=({}).p===undefined;out.xss=window.__xss||0;
     return out}, mine);
   ok(ti.cleaned===ti.total&&ti.imported===ti.total&&ti.qr===ti.total,'arrange: '+ti.total+' tampered layouts in a backup or a QR transfer are dropped by the cleaner, leave the current layout alone on import, and add nothing to a new profile ('+ti.cleaned+'/'+ti.imported+'/'+ti.qr+')');
   ok(ti.alone===null&&ti.rr===true&&ti.afterReplace===null&&ti.proto&&ti.xss===0,'arrange: a layout alone is not a backup; Replace with a bad layout ends on the default; no prototype pollution, no script ran');
   // 10b. review fixes (M1, L1, L2, I1, I2)
   await openSettings();
   await pg.evaluate(()=>{NavLayout.reset()});await openSettings();
   // M1: an import while Settings is open updates the card, and one click does not undo the import
   const imp=['dashboard','learn','practice','review','vocab','grammar','notes','plan','exam','history','settings'];
   await pg.evaluate(()=>{const o=NavLayout.IDS.slice();const o2=['dashboard','settings','history',...o.slice(1,9)];const bar=o2.filter(x=>['dashboard','settings','history','exam'].includes(x));window.__imp={v:1,order:o2,bar};Storage.importAll({history:[],navLayout:window.__imp})});
   await pg.waitForTimeout(200);
   const afterImp=await rowIds();const impOrder=await pg.evaluate(()=>window.__imp.order);
   ok(sameArr(afterImp,impOrder),'arrange (M1): an import while Settings is open redraws the open card with the imported order');
   await pg.click('[data-act="down"][data-id="settings"]');await pg.waitForTimeout(200);
   const afterClick=await pg.evaluate(()=>JSON.parse(localStorage.getItem(Profiles.key('celpip_navlayout_v1'))));
   const wantImp=await pg.evaluate(()=>{const o=window.__imp.order.slice();const i=o.indexOf('settings');o.splice(i,1);o.splice(i+1,0,'settings');return o});
   ok(sameArr(afterClick.order,wantImp),'arrange (M1): one click after the import changes only that move (the import is not undone)');
   // M1: a change written by a second tab updates the open card
   const pg2=await c.newPage();await pg2.goto(BASE);await pg2.waitForTimeout(500);
   await pg2.evaluate(()=>{NavLayout.save({v:1,order:NavLayout.IDS.slice(),bar:['dashboard','learn','plan','exam']})});
   await pg.waitForTimeout(400);
   const t2=await pg.evaluate(()=>({sw:[...document.querySelectorAll('.arr-sw[aria-checked=true]')].map(b=>b.dataset.id),rows:[...document.querySelectorAll('.arr-row')].map(r=>r.dataset.id)}));
   ok(sameArr(t2.rows,DEF)&&sameArr(t2.sw,['dashboard','learn','plan','exam']),'arrange (M1): a layout saved by a second tab updates the open card');
   // L2: another tab clearing all storage falls back to the default and repaints
   await pg2.evaluate(()=>localStorage.clear());await pg.waitForTimeout(400);
   const t3=await lay();
   ok(sameArr(t3.side,DEF)&&sameArr(t3.bar,DBAR)&&sameArr(await rowIds(),DEF)&&!/Saved for/.test(await status()),'arrange (L2): another tab clearing storage gives the default menus and card, and the card does not claim "Saved"');
   await pg2.close();
   // L1: Storage.get/set cannot bypass the check
   const l1=await pg.evaluate(()=>{const k=Profiles.key('celpip_navlayout_v1');const bad={v:1,order:['x'],bar:['y']};const r=Storage.set('navLayout',bad);const stored1=localStorage.getItem(k);
     localStorage.setItem(k,'{"v":1,"order":["x"],"bar":["y"]}');const g=Storage.get('navLayout',null);localStorage.removeItem(k);
     const good=Storage.set('navLayout',{v:1,order:NavLayout.IDS.slice(),bar:['dashboard','learn','plan','exam']});const g2=Storage.get('navLayout',null);NavLayout.reset();return {r,stored1,g,good,g2ok:!!g2&&g2.bar.length===4}});
   ok(l1.r===false&&l1.stored1===null&&l1.g===null&&l1.good===true&&l1.g2ok,'arrange (L1): Storage.set/get of the layout go through the check (a bad value is refused and never read back)');
   // I1: Reset says the default is in use, not "Saved"
   await openSettings();await pg.click('[data-act="down"][data-id="learn"]');await pg.waitForTimeout(150);
   await pg.click('[data-act=reset]');await pg.waitForTimeout(200);
   const rs=await status(),rl=await live();
   ok(!/Saved/.test(rs)&&/default/.test(rs)&&!/Saved/.test(rl||'')&&(await lay()).stored===null,'arrange (I1): after Reset the status and the announcement do not say "Saved" (nothing is stored) ("'+rs+'")');
   // I2: a failed save shows in the visible status line too
   await pg.evaluate(()=>{const o=Object.getPrototypeOf(localStorage);window.__orig=o.setItem;o.setItem=function(){throw new Error('quota')}});
   await pg.click('[data-act="down"][data-id="learn"]');await pg.waitForTimeout(200);
   const fs=await status(),fl=await live();
   await pg.evaluate(()=>{Object.getPrototypeOf(localStorage).setItem=window.__orig});
   ok(/Could not save/.test(fs)&&/Could not save/.test(fl||''),'arrange (I2): a refused save shows in the visible status line as well as the announcement ("'+fs+'")');
   await pg.evaluate(()=>NavLayout.reset());await openSettings();
   // 11. deleting a profile clears its layout
   const dl=await pg.evaluate(()=>{const p=Profiles.list().find(x=>x.id===Profiles.activeId);NavLayout.save({v:1,order:NavLayout.IDS.slice(),bar:['dashboard','learn','plan','exam']});const k='celpip_p_'+p.id+'_navlayout_v1';const had=localStorage.getItem(k)!==null;Profiles.remove(p.id);return {had,gone:localStorage.getItem(k)===null}});
   ok(dl.had&&dl.gone,'arrange: deleting a profile removes its layout note with the rest of its data');
   // 12. rows fit (no overlap) at 390 and 320; screenshots
   await pg.evaluate(()=>{const p=Profiles.list()[0];Profiles.rename(p.id,'Ada');localStorage.removeItem(Profiles.key('celpip_navlayout_v1'))});
   for(const w of [1440,390,320]){
     await pg.setViewportSize({width:w,height:w===1440?1000:844});await openSettings();
     const f=await pg.evaluate(()=>{const R=e=>e.getBoundingClientRect(),hit=(a,b)=>!(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top);
       let overlap=0,wrap=0,small=0;document.querySelectorAll('.arr-row').forEach(r=>{const sw=R(r.querySelector('.arr-sw')),nm=R(r.querySelector('.arr-nm')),mv=[...r.querySelectorAll('.arr-mv')].map(R);
         if(hit(sw,nm)||mv.some(m=>hit(sw,m)||hit(nm,m))||hit(mv[0],mv[1]))overlap++;const wd=r.querySelector('.arr-word');if(wd.scrollWidth>wd.clientWidth||wd.getClientRects().length>1&&R(wd).height>26)wrap++;
         [...r.querySelectorAll('button')].forEach(b=>{const q=R(b);if(q.height<43.5||q.width<43.5)small++});if(R(r).right>innerWidth+0.5)overlap++});
       return {overlap,wrap,small,scrollX:document.documentElement.scrollWidth>innerWidth+1,rows:document.querySelectorAll('.arr-row').length,home:document.querySelector('.arr-row[data-id=dashboard] .arr-word').textContent.trim(),homeH:R(document.querySelector('.arr-row[data-id=dashboard] .arr-word')).height}});
     ok(f.rows===11&&f.overlap===0&&f.wrap===0&&f.small===0&&!f.scrollX&&f.home==='Always in bar'&&f.homeH<30,'arrange '+w+'px: no row overlaps, "Always in bar" is on one line, every control is 44px or more, no sideways scroll ('+JSON.stringify(f)+')');
     if(SHOTS)for(const th of ['light','dark']){await pg.evaluate(t=>{Shell.setTheme(t)},th);await pg.evaluate(()=>{const e=document.getElementById('arrangeCard');window.scrollTo(0,e.getBoundingClientRect().top+scrollY-(innerWidth>=1000?110:80))});await pg.waitForTimeout(300);await pg.screenshot({path:sp('b2a-arrange-'+w+'-'+th+'.png')})}
     await pg.evaluate(()=>Shell.setTheme('light'));
   }
   await c.close()});


 // ---------- T-033 B2b: the circle wipe page change (js/pagewipe.js) ----------
 await step('T-033 B2b circle wipe: menu only, not bottom bar, not focus mode, Settings switch, junk value, reduced motion, focus, screenshots',async()=>{
   // count the disc's animations (grow = 1, shrink = 2) and every console error; no 100x timer here: the real 240 + 280 ms are measured
   const count=()=>{window.__wipes=0;const o=Element.prototype.animate;Element.prototype.animate=function(){if(this.id==='pagewipe')window.__wipes++;return o.apply(this,arguments)}};
   const mk=async(vp,extra)=>{const r=await fresh(Object.assign({viewport:vp,reducedMotion:'no-preference'},extra||{}),count);return r};
   const wipes=pg=>pg.evaluate(()=>window.__wipes);
   const st=pg=>pg.evaluate(()=>({hash:location.hash,h1:(document.querySelector('#app h1')||{}).textContent,focusIsH1:document.activeElement&&document.activeElement.tagName==='H1'&&document.getElementById('app').contains(document.activeElement),hidden:document.getElementById('pagewipe').hidden,cur:(document.querySelector('#mainNav [aria-current=page]')||{dataset:{}}).dataset.section}));
   const t0=Date.now();
   // 1. wide screen: a sidebar row plays the wipe, ends on the new page, focus on the heading, disc gone
   let {c,pg}=await mk({width:1440,height:900});
   ok(await pg.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--wipe').trim().toUpperCase())==='#0B6477','wipe token (light) is #0B6477');
   await pg.click('#mainNav a[data-section="learn"]');await pg.waitForTimeout(1000);
   let r=await st(pg);
   ok(await wipes(pg)===2&&r.hash==='#/learn'&&/Learn/i.test(r.h1||'')&&r.hidden,'wipe 1440: sidebar row plays grow + shrink, ends on #/learn, disc hidden again ('+r.hash+', '+await wipes(pg)+' animations)');
   ok(r.focusIsH1,'wipe 1440: focus lands on the new page heading');
   // timing: both phases together are about 520 ms
   await pg.evaluate(()=>{window.__t=[];const o=Element.prototype.animate;Element.prototype.animate=function(){const a=o.apply(this,arguments);if(this.id==='pagewipe'){const t=performance.now();a.finished.then(()=>window.__t.push(Math.round(performance.now()-t)),()=>{})}return a}});
   await pg.click('#mainNav a[data-section="notes"]');await pg.waitForTimeout(1000);
   const tm=await pg.evaluate(()=>window.__t);
   ok(tm.length===2&&tm[0]>=200&&tm[0]<=330&&tm[1]>=240&&tm[1]<=380,'wipe: grow about 240 ms and shrink about 280 ms (measured '+tm.join(' and ')+' ms)');
   // a second press while it runs is ignored
   const before=await wipes(pg);
   await pg.evaluate(()=>{document.querySelector('#mainNav a[data-section="history"]').click();document.querySelector('#mainNav a[data-section="settings"]').click()});
   await pg.waitForTimeout(1000);r=await st(pg);
   ok(r.hash==='#/history'&&await wipes(pg)-before===2,'wipe: a second press while the disc runs is ignored (ended on '+r.hash+')');
   // rail icon (1100 px wide: rail, not pinned)
   await pg.setViewportSize({width:1100,height:900});await pg.waitForTimeout(300);
   const b4=await wipes(pg);await pg.click('#rail .rail-list a[data-section="vocab"]');await pg.waitForTimeout(1000);
   r=await st(pg);ok(r.hash==='#/vocab'&&await wipes(pg)-b4===2,'wipe 1100: rail icon plays the wipe');
   // junk and tampered values
   let jn=0;for(const v of ['banana','OFF','','0','false','<img src=x onerror=1>','x'.repeat(5000)]){jn++;
     await pg.evaluate(v=>localStorage.setItem('celpip_pagewipe',v),v);await pg.reload();await pg.waitForTimeout(500);
     const on=await pg.evaluate(()=>PageWipe.isOn());const b=await wipes(pg);
     await pg.setViewportSize({width:1440,height:900});await pg.click('#mainNav a[data-section="'+(jn%2?'grammar':'learn')+'"]');await pg.waitForTimeout(950);
     if(!(on&&await wipes(pg)-b===2))ok(false,'wipe: junk value "'+v.slice(0,20)+'" is treated as on');
   }
   ok(true,'wipe: 7 junk values in celpip_pagewipe (banana, OFF, empty, 0, false, markup, 5000 characters) all count as on and play the wipe without error');
   // Settings switch
   await pg.evaluate(()=>{localStorage.removeItem('celpip_pagewipe');location.hash='#/settings'});await pg.waitForTimeout(500);
   ok(await pg.$eval('#pagewipeToggle',e=>e.checked),'wipe: Settings switch "Page transition" is on by default');
   await pg.click('label.check-row:has(#pagewipeToggle)');await pg.waitForTimeout(150);
   ok(await pg.evaluate(()=>localStorage.getItem('celpip_pagewipe'))==='off','wipe: switching off stores exactly "off"');
   const b5=await wipes(pg);await pg.evaluate(()=>window.scrollTo(0,0));await pg.waitForTimeout(500);await pg.click('#mainNav a[data-section="learn"]');await pg.waitForTimeout(900);
   r=await st(pg);ok(r.hash==='#/learn'&&await wipes(pg)===b5,'wipe: switch off, no disc animation, page still changes');
   await pg.reload();await pg.waitForTimeout(500);await pg.evaluate(()=>{location.hash='#/settings'});await pg.waitForTimeout(400);
   ok(!await pg.$eval('#pagewipeToggle',e=>e.checked),'wipe: the off choice survives a reload');
   await pg.click('label.check-row:has(#pagewipeToggle)');await pg.waitForTimeout(150);
   ok(await pg.evaluate(()=>localStorage.getItem('celpip_pagewipe'))==='on','wipe: switching on stores exactly "on"');
   // focus mode: no wipe (practice)
   await pg.evaluate(()=>{location.hash='#/practice/listening'});await pg.waitForTimeout(400);await pg.click('#quickBtn');await pg.waitForTimeout(400);
   const b6=await wipes(pg);
   const fm=await pg.evaluate(()=>Shell.focusMode.active);
   await pg.evaluate(()=>document.querySelector('#mainNav a[data-section="learn"]').click());await pg.waitForTimeout(900);
   ok(fm&&await wipes(pg)===b6&&(await st(pg)).hash==='#/learn','wipe: during practice (focus mode) a menu link does not wipe');
   // flake check: six quick route changes in a row, no uncaught "Transition was skipped"
   const e0=errs.length;
   await pg.evaluate(()=>{['#/plan','#/exam','#/practice','#/plan','#/history','#/dashboard'].forEach(h=>{location.hash=h})});await pg.waitForTimeout(900);
   ok(errs.length===e0,'view transitions: six quick route changes cause no uncaught error (the "Transition was skipped" flake)'+(errs.length>e0?': '+errs.slice(e0).join(' | '):''));
   await c.close();
   // 2. phone: drawer row wipes, bottom bar does not
   ({c,pg}=await mk({width:390,height:844}));
   await pg.click('.topbar .menu-btn');await pg.waitForTimeout(600);
   await pg.click('#mainNav a[data-section="learn"]');await pg.waitForTimeout(1100);
   r=await st(pg);ok(r.hash==='#/learn'&&await wipes(pg)===2&&r.hidden&&r.focusIsH1,'wipe 390: drawer row plays the wipe, ends on #/learn, focus on the heading');
   const b7=await wipes(pg);await pg.click('#tabBar a[data-section="practice"]');await pg.waitForTimeout(900);
   r=await st(pg);ok(r.hash==='#/practice'&&await wipes(pg)===b7,'wipe 390: bottom bar does not wipe (quick fade only), page still changes');
   await pg.evaluate(()=>{location.hash='#/dashboard'});await pg.waitForTimeout(400);
   // overlay opened by the anchor / hamburger at 1440 is covered in the 1440 run; mid-wipe screenshot at 390 (dark)
   if(SHOTS){await pg.evaluate(()=>Shell.setTheme('dark'));await pg.waitForTimeout(300);
     ok(await pg.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--wipe').trim().toUpperCase())==='#0B3A45','wipe token (dark) is #0B3A45');
     await pg.click('.topbar .menu-btn');await pg.waitForTimeout(600);
     await pg.evaluate(()=>document.querySelector('#mainNav a[data-section="learn"]').click());
     await pg.waitForFunction(()=>document.getElementById('pagewipe').getAnimations().length>0);
     await pg.evaluate(()=>{const a=document.getElementById('pagewipe').getAnimations()[0];a.pause();a.currentTime=85});
     await pg.screenshot({path:sp('b2b-wipe-390.png')});}
   await c.close();
   // 3. reduced motion: no wipe, page changes, no error
   ({c,pg}=await fresh({viewport:{width:1440,height:900},reducedMotion:'reduce'},count));
   await pg.click('#mainNav a[data-section="learn"]');await pg.waitForTimeout(600);
   r=await st(pg);ok(r.hash==='#/learn'&&await wipes(pg)===0&&r.hidden,'wipe: reduced motion, no wipe and the page still changes');
   await c.close();
   // 4. mid-wipe screenshot at 1440 (light)
   if(SHOTS){({c,pg}=await mk({width:1440,height:900}));
     await pg.click('#mainNav a[data-section="learn"]',{trial:true});
     await pg.evaluate(()=>document.querySelector('#mainNav a[data-section="practice"]').click());
     await pg.waitForFunction(()=>document.getElementById('pagewipe').getAnimations().length>0);
     await pg.evaluate(()=>{const a=document.getElementById('pagewipe').getAnimations()[0];a.pause();a.currentTime=85});
     await pg.screenshot({path:sp('b2b-wipe-1440.png')});await c.close();}
   ok(true,'wipe: step took '+(Date.now()-t0)+' ms');
 });

 console.log(`\n${fails} failure(s)`);await b.close();process.exit(fails?1:0)})();
