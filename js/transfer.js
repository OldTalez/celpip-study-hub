/*
 * LEARNING NOTE (for beginners): this file moves one learner's progress to ANOTHER device without a server or an account.
 * There are two ways, and neither sends anything over the internet by itself:
 *   1. "Send backup file": the share sheet of the phone or computer (the Web Share API) is opened with the backup file attached, and the
 *      learner picks where it goes (email, a messaging app, AirDrop...). If the browser cannot share files, the file is simply downloaded.
 *   2. QR codes: the sending device shows a looping series of QR codes on its screen, and the receiving device reads them with its camera.
 *      Nothing travels except light. A QR code holds only a little, so the backup is squeezed and cut into pieces first:
 *         backup (JSON text) -> squeezed with gzip (CompressionStream; plain if the browser lacks it) -> made into letters and numbers
 *         that are safe in a code (base64url) -> cut into pieces of about 1000 characters.
 *      Each piece starts with a header:  CSH1|<transfer id>|<piece number>/<how many pieces>|<fingerprint of the whole>|<the piece>
 *      The fingerprint is the first 16 characters of a SHA-256 hash (a short summary that changes if even one letter changes). The receiver
 *      collects pieces in ANY order (the codes loop, so it may start in the middle), shows "12 of 31 received", joins them, checks the
 *      fingerprint, un-squeezes the result, and runs it through the SAME cleaning code as a backup file (Storage.cleanBundle in
 *      js/storage.js) before it is stored. Then the learner chooses: add it as a NEW profile, or replace this profile.
 * Why the receiver is strict: a QR code is typed-in data from outside. So it refuses more than 200 pieces, any piece that does not match the
 * exact header pattern or is longer than expected, mixed transfers, a wrong fingerprint, and anything that grows past 2 MB once un-squeezed
 * (a tiny file that explodes into gigabytes is a known trick, so un-squeezing stops as soon as the limit is passed).
 * The two QR libraries live in js/vendor/ and are loaded only when a QR screen opens, so the rest of the app stays light. The camera is asked
 * for only when the learner taps "Open camera", and it is switched off whenever the screen changes (render() stops everything in activeTimers).
 */
const Transfer = (function () {
  "use strict";
  const MAX_DECODED = 2 * 1024 * 1024;   // largest backup we will accept once un-squeezed: 2 MB
  const MAX_PIECES = 200;
  const PIECE_TOTAL = 1000;              // characters in one QR code, header included
  const HEADER_ROOM = 40;                // room kept for the header ("CSH1|" + id + "|" + "123/200" + "|" + 16 hex + "|")
  const PIECE_MAX = 1200;                // a longer piece is refused by the receiver
  const HEADER_RE = /^CSH1\|([a-z0-9]{6,12})\|(\d{1,3})\/(\d{1,3})\|([0-9a-f]{16})\|([A-Za-z0-9_-]*)$/;
  const mk = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
  const say = msg => { const a = document.getElementById("announcer"); if (a) { a.textContent = ""; a.textContent = msg; } };
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Text <-> bytes <-> base64url ----------
  function toB64u(bytes) {
    let s = ""; for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function fromB64u(str) {
    if (!/^[A-Za-z0-9_-]*$/.test(str) || str.length % 4 === 1) throw new Error("not base64url");
    const s = atob(str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4));
    const out = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
  async function pump(stream, bytes, limit) {   // runs bytes through a (De)CompressionStream; stops with an error past `limit` output bytes
    const w = stream.writable.getWriter(); w.write(bytes).catch(() => {}); w.close().catch(() => {});
    const r = stream.readable.getReader(), parts = []; let total = 0;
    for (;;) {
      const { done, value } = await r.read();
      if (done) break;
      total += value.length;
      if (total > limit) { try { await r.cancel(); } catch (e) {} throw new Error("too big"); }
      parts.push(value);
    }
    const out = new Uint8Array(total); let o = 0; parts.forEach(p => { out.set(p, o); o += p.length; });
    return out;
  }

  // ---------- SHA-256 (the first 16 hex characters are the fingerprint) ----------
  // crypto.subtle exists only on https pages and localhost; a plain http address on a home network has none, so a small pure-JS version backs it up.
  const K = [], H0 = [];
  (function () { let n = 2, c = 0; while (c < 64) { let p = true; for (let d = 2; d * d <= n; d++) if (n % d === 0) { p = false; break; } if (p) { K.push(Math.floor((Math.cbrt(n) % 1) * 4294967296) >>> 0); if (c < 8) H0.push(Math.floor((Math.sqrt(n) % 1) * 4294967296) >>> 0); c++; } n++; } })();
  function sha256Js(bytes) {
    const l = bytes.length, total = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(total);
    m.set(bytes); m[l] = 0x80;
    const dv = new DataView(m.buffer); dv.setUint32(total - 8, Math.floor((l * 8) / 4294967296)); dv.setUint32(total - 4, (l * 8) >>> 0);
    const h = H0.slice(), w = new Array(64), rr = (x, n) => (x >>> n) | (x << (32 - n));
    for (let off = 0; off < total; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
      for (let i = 16; i < 64; i++) { const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0; }
      let [a, b, c, d, e, f, g, hh] = h;
      for (let i = 0; i < 64; i++) {
        const t1 = (hh + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0, t2 = ((rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      [a, b, c, d, e, f, g, hh].forEach((v, i) => { h[i] = (h[i] + v) >>> 0; });
    }
    return h.map(v => v.toString(16).padStart(8, "0")).join("");
  }
  async function sha16(text) {
    const bytes = new TextEncoder().encode(text);
    if (window.crypto && crypto.subtle && crypto.subtle.digest) {
      try { return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16); } catch (e) { /* fall through */ }
    }
    return sha256Js(bytes).slice(0, 16);
  }

  // ---------- Sending: object -> squeezed text -> pieces ----------
  // The whole text starts with one letter: "g" = gzip-squeezed, "r" = raw (the browser had no CompressionStream).
  async function pack(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (bytes.length > MAX_DECODED) throw new Error("This backup is too big for QR codes. Use “Send backup file” instead.");
    if (typeof CompressionStream === "function") {
      try { return "g" + toB64u(await pump(new CompressionStream("gzip"), bytes, MAX_DECODED * 2)); } catch (e) { /* fall back to plain */ }
    }
    return "r" + toB64u(bytes);
  }
  function newTransferId() { let s = ""; const a = new Uint8Array(8); (window.crypto || { getRandomValues: x => x.forEach((_, i) => { x[i] = Math.random() * 256; }) }).getRandomValues(a); a.forEach(n => { s += (n % 36).toString(36); }); return s; }
  // Returns the list of strings to turn into QR codes.
  async function makeChunks(obj) {
    const whole = await pack(obj), hash = await sha16(whole), size = PIECE_TOTAL - HEADER_ROOM;
    const n = Math.max(1, Math.ceil(whole.length / size));
    if (n > MAX_PIECES) throw new Error("This backup needs " + n + " codes, more than the limit of " + MAX_PIECES + ". Use “Send backup file” instead.");
    const id = newTransferId(), out = [];
    for (let i = 0; i < n; i++) out.push("CSH1|" + id + "|" + (i + 1) + "/" + n + "|" + hash + "|" + whole.slice(i * size, (i + 1) * size));
    return out;
  }

  // ---------- Receiving: pieces -> object ----------
  // add(text) answers { state, have, n, message }:
  //   "progress" (piece taken), "same" (already had it), "other" (a different transfer; ignored), "ignored" (not one of ours), "refused" (too many pieces or too long),
  //   "error" (joined but failed the fingerprint, too big, or not a backup), "done" (also carries .data, the parsed object, still UNCLEANED).
  function Receiver() {
    let id = null, n = 0, hash = "", parts = new Map(), finished = false;
    const info = (state, message) => ({ state, have: parts.size, n, message: message || "" });
    return {
      get have() { return parts.size; }, get n() { return n; },
      reset() { id = null; n = 0; hash = ""; parts = new Map(); finished = false; },
      async add(text) {
        if (finished) return info("ignored");
        if (typeof text !== "string") return info("ignored");
        if (text.length > PIECE_MAX + 60) return info("refused", "That code is longer than expected, so it was refused.");
        const m = HEADER_RE.exec(text);
        if (!m) return info("ignored", "That code is not part of a CELPIP transfer.");
        const pid = m[1], i = Number(m[2]), total = Number(m[3]), h = m[4], data = m[5];
        if (total > MAX_PIECES) return info("refused", "That transfer has more than " + MAX_PIECES + " codes, so it was refused.");
        if (i < 1 || total < 1 || i > total || data.length > PIECE_MAX) return info("refused", "That code looks damaged.");
        if (id === null) { id = pid; n = total; hash = h; }
        else if (pid !== id) return info("other", "That code belongs to a different transfer. Press Start over to switch.");
        else if (total !== n || h !== hash) return info("refused", "That code does not match the others.");
        if (parts.has(i)) return info("same");
        parts.set(i, data);
        if (parts.size < n) return info("progress");
        // All pieces are here: join them in order and check them.
        let whole = ""; for (let k = 1; k <= n; k++) whole += parts.get(k);
        if ((await sha16(whole)) !== hash) { parts = new Map(); return info("error", "The codes did not add up (the check failed). Start over and scan again."); }
        try {
          const kind = whole[0], body = whole.slice(1);
          if (kind !== "g" && kind !== "r") throw new Error("format");
          let bytes;
          if (kind === "g") {
            if (typeof DecompressionStream !== "function") throw new Error("This browser cannot open squeezed codes.");
            bytes = await pump(new DecompressionStream("gzip"), fromB64u(body), MAX_DECODED);
          } else {
            if (body.length > (MAX_DECODED * 4) / 3 + 4) throw new Error("too big");
            bytes = fromB64u(body);
          }
          if (bytes.length > MAX_DECODED) throw new Error("too big");
          const data = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
          if (!data || typeof data !== "object" || Array.isArray(data) || !Storage.summary(data)) throw new Error("not a backup");
          finished = true;
          return Object.assign(info("done"), { data });
        } catch (e) {
          parts = new Map();
          const big = /too big/.test(String(e && e.message));
          return info("error", big ? "That transfer is bigger than 2 MB once opened, so it was refused." : "The received data could not be read as a CELPIP backup.");
        }
      }
    };
  }

  // ---------- Loading the vendor libraries only when a QR screen opens ----------
  const loading = {};
  function loadScript(src) {
    if (!loading[src]) loading[src] = new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => { delete loading[src]; rej(new Error("Could not load " + src)); }; document.head.appendChild(s); });
    return loading[src];
  }
  const loadQrMaker = () => (typeof qrcode === "function" ? Promise.resolve() : loadScript("js/vendor/qrcode.js"));
  const loadQrReader = () => (typeof jsQR === "function" ? Promise.resolve() : loadScript("js/vendor/jsQR.js"));
  // Draws one piece as a QR code (error correction M, black on white with a 4-module quiet border, whatever the theme) onto a canvas.
  function drawQr(canvas, text) {
    const q = qrcode(0, "M"); q.addData(text, "Byte"); q.make();
    const count = q.getModuleCount(), cell = 4, border = 4, size = (count + border * 2) * cell;
    canvas.width = size; canvas.height = size;
    const g = canvas.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, size, size);
    g.fillStyle = "#000";
    for (let r = 0; r < count; r++) for (let c = 0; c < count; c++) if (q.isDark(r, c)) g.fillRect((c + border) * cell, (r + border) * cell, cell, cell);
    return count;
  }

  // ---------- Share the backup file ----------
  // Uses the share sheet when the browser can share a FILE; otherwise downloads it. Returns a plain sentence for the status line.
  async function shareBackup() {
    const text = JSON.stringify(Storage.exportAll(), null, 1), name = "celpip-backup-" + Study.today() + ".json";
    let file = null;
    try { file = new File([text], name, { type: "application/json" }); } catch (e) { file = null; }
    if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "CELPIP backup" });
        if (window.AppFeel && AppFeel.recordBackup) AppFeel.recordBackup();
        return "Shared. Open the file on the other device with Settings, Import into this profile.";
      } catch (e) {
        if (e && e.name === "AbortError") return "Sharing cancelled. Nothing was sent.";
        /* any other failure: fall through to the download */
      }
    }
    Study.download(name, text, "application/json");
    if (window.AppFeel && AppFeel.recordBackup) AppFeel.recordBackup();
    return "This browser cannot share files, so the backup was saved to your downloads. Move it to the other device and use Import.";
  }

  // ---------- The Settings card ----------
  function mountCard(slot) {
    slot.textContent = "";
    const card = mk("div", "card mt");
    card.append(mk("h3", "", "Move to another device"),
      mk("p", "muted small", "Copies the profile shown in “Your data”. Nothing is uploaded: the app itself sends nothing. The share sheet and the QR codes are how you carry the file."));
    const row = mk("div", "cta-row-single");
    const share = mk("button", "btn", "Send backup to another device"); share.type = "button"; share.id = "shareBtn";
    const send = mk("a", "btn", "Send by QR"); send.href = "#/transfer/send"; send.id = "qrSendLink";
    const recv = mk("a", "btn", "Receive by QR"); recv.href = "#/transfer/receive"; recv.id = "qrRecvLink";
    row.append(share, send, recv);
    const msg = mk("p", "muted small mt", ""); msg.id = "shareMsg"; msg.setAttribute("role", "status");
    share.onclick = async () => { share.disabled = true; msg.textContent = await shareBackup(); share.disabled = false; };
    card.append(row, msg);
    slot.appendChild(card);
  }

  // ---------- The Send by QR screen ----------
  function title(t) { document.title = t + " | CELPIP Study Hub"; if (typeof app !== "undefined") app.focus({ preventScroll: true }); }
  async function renderSend() {
    title("Send by QR");
    const my = screenId;
    const wrap = mk("div");
    wrap.append(mk("h1", "", "Send by QR"),
      mk("p", "muted", "Hold this screen in front of the other device's camera. It shows a loop of codes; the other device collects them in any order and tells you when it has them all. Nothing goes over the internet."),
      mk("p", "small", "On the other device: Settings, then Receive by QR."),
      mk("p", "small", "Anyone who can see these codes can copy this profile."));
    const box = mk("div", "card qr-box");
    const status = mk("p", "qr-status", "Getting the codes ready…"); status.id = "qrStatus"; status.setAttribute("role", "status");
    box.appendChild(status); wrap.appendChild(box);
    wrap.appendChild(Object.assign(mk("div", "cta-row-single"), {})).appendChild(Object.assign(mk("a", "btn", "Back to Settings"), { href: "#/settings" }));
    app.appendChild(wrap);
    let chunks;
    try { await loadQrMaker(); chunks = await makeChunks(Storage.exportAll()); } catch (e) { if (my === screenId) status.textContent = String(e && e.message || "Could not make the codes."); return; }
    if (my !== screenId) return;   // the learner already left this screen
    const canvas = mk("canvas", "qr-canvas"); canvas.id = "qrCanvas"; canvas.setAttribute("role", "img");
    const ctrl = mk("div", "cta-row-single qr-ctrl");
    const prev = mk("button", "btn", "Previous"), play = mk("button", "btn btn-primary", "Pause"), next = mk("button", "btn", "Next");
    [prev, play, next].forEach(b => { b.type = "button"; });
    prev.id = "qrPrev"; play.id = "qrPlay"; next.id = "qrNext";
    const speedLab = mk("label", "field-label", "Speed"); speedLab.htmlFor = "qrSpeed";
    const speed = mk("select"); speed.id = "qrSpeed";
    [["Slower", 1400], ["Normal", 800], ["Faster", 500]].forEach(([l, ms]) => { const o = mk("option", "", l); o.value = String(ms); if (ms === 800) o.selected = true; speed.appendChild(o); });
    ctrl.append(prev, play, next, speedLab, speed);
    box.append(canvas, ctrl, mk("p", "muted small", "Codes change at most twice a second. If the other device keeps missing one, press Pause, or choose Slower."));
    let i = 0, timer = 0;
    const show = () => { drawQr(canvas, chunks[i]); const t = "Code " + (i + 1) + " of " + chunks.length; status.textContent = t; canvas.setAttribute("aria-label", "QR code " + (i + 1) + " of " + chunks.length); };
    const stop = () => { if (timer) { clearInterval(timer); timer = 0; } };
    const start = () => { stop(); timer = setInterval(() => { i = (i + 1) % chunks.length; show(); }, Number(speed.value)); play.textContent = "Pause"; };
    const pause = () => { stop(); play.textContent = "Play"; };
    play.onclick = () => (timer ? pause() : start());
    prev.onclick = () => { pause(); i = (i - 1 + chunks.length) % chunks.length; show(); };
    next.onclick = () => { pause(); i = (i + 1) % chunks.length; show(); };
    speed.onchange = () => { if (timer) start(); };
    activeTimers.push({ stop });   // the router stops the loop when the screen changes
    show();
    if (reduced() || chunks.length === 1) pause(); else start();   // reduced motion: no automatic changing; step with Next
    say(chunks.length + " codes ready");
  }

  // ---------- The Receive by QR screen ----------
  async function renderReceive() {
    title("Receive by QR");
    const my = screenId;
    const rx = Receiver();
    const wrap = mk("div");
    wrap.append(mk("h1", "", "Receive by QR"),
      mk("p", "muted", "Open the camera and point it at the codes on the other device (Settings, Send by QR). The camera is used only on this screen and only to read the codes; nothing is recorded or sent."));
    const box = mk("div", "card qr-box");
    const open = mk("button", "btn btn-primary", "Open camera"); open.type = "button"; open.id = "qrOpen";
    const video = mk("video", "qr-video"); video.setAttribute("playsinline", ""); video.muted = true; video.hidden = true; video.setAttribute("aria-label", "Camera view");
    const scratch = mk("canvas"); scratch.hidden = true;
    const prog = mk("progress", "qr-progress"); prog.max = 1; prog.value = 0; prog.hidden = true; prog.setAttribute("aria-label", "Codes received");
    const status = mk("p", "qr-status", "Camera is off."); status.id = "qrRecvStatus"; status.setAttribute("role", "status");
    const note = mk("p", "muted small", ""); note.id = "qrRecvNote";
    const again = mk("button", "btn", "Start over"); again.type = "button"; again.id = "qrReset"; again.hidden = true;
    box.append(open, video, prog, status, note, again);
    const result = mk("div"); result.id = "qrResult";
    wrap.append(box, result);
    wrap.appendChild(mk("div", "cta-row-single")).appendChild(Object.assign(mk("a", "btn", "Back to Settings"), { href: "#/settings" }));
    app.appendChild(wrap);

    let stream = null, loopId = 0, running = false, lastText = "", lastAt = 0, detector = null;
    function stopCamera() {
      running = false; if (loopId) { clearTimeout(loopId); loopId = 0; }
      if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
      video.srcObject = null; video.hidden = true;
    }
    activeTimers.push({ stop: stopCamera });   // render() calls this on every screen change, so the camera never stays on

    function paint(r) {
      prog.hidden = !r.n; prog.max = r.n || 1; prog.value = r.have;
      if (r.n) status.textContent = r.have + " of " + r.n + " received";
      note.textContent = r.message || "";
      again.hidden = !r.n && !r.message;
    }
    async function onText(text) {
      const r = await rx.add(text);
      if (my !== screenId) return;
      if (r.state === "ignored" && !r.message) return;
      paint(r);
      if (r.state === "progress") say(r.have + " of " + r.n + " received");
      if (r.state === "done") { stopCamera(); status.textContent = "All " + r.n + " codes received."; say("All codes received"); showChoice(r.data); }
      if (r.state === "error") { status.textContent = "Something went wrong."; }
    }
    function showChoice(data) {
      const sum = Storage.summary(data);
      result.textContent = "";
      const card = mk("div", "card mt");
      card.append(mk("h2", "", "Received a profile"));
      const who = mk("p", "", "From: "); who.appendChild(mk("strong", "", sum.name || "(no name)")); who.id = "qrWho";
      card.append(who, mk("p", "muted", sum.attempts + " saved attempts, " + sum.words + " words, " + sum.notes + " study notes." + (sum.skipped ? " " + sum.skipped + " entries could not be used and were left out." : "")));
      const row = mk("div", "cta-row-single");
      const add = mk("button", "btn btn-primary", "Add as new profile"); add.type = "button"; add.id = "qrAddNew";
      const rep = mk("button", "btn", "Replace this profile"); rep.type = "button"; rep.id = "qrReplace";
      const no = mk("button", "btn btn-quiet", "Cancel"); no.type = "button"; no.id = "qrCancel";
      if (!sum.hasData) {   // an empty backup would only erase this profile, so Replace is switched off
        rep.disabled = true;
        card.append(mk("p", "muted small", "This backup holds no saved data, so “Replace this profile” is switched off."));
      }
      add.onclick = () => {
        const p = Storage.addAsProfile(data);
        if (p === false) { toast("This device is full, so the profile could not be saved. Nothing was added.", "error"); card.appendChild(mk("p", "error", "This device is full, so the profile could not be saved. Nothing was added. Free some space and try again.")); return; }
        if (!p) { card.appendChild(mk("p", "error", "No room: you already have " + Profiles.MAX_PROFILES + " profiles. Delete one in Settings first.")); return; }
        toast("Added “" + p.name + "”", "ok");
        navigate("#/dashboard"); ProfileUI.switchTo(p.id);
      };
      rep.onclick = async () => {
        const name = Profiles.active().name;
        const a = await ProfileUI.choose({ title: "Replace “" + name + "”?", message: "Everything in this profile is erased and replaced by the received data. Other profiles are not touched.",
          buttons: [{ label: "Keep my profile", value: "no", primary: true }, { label: "Replace it", value: "yes", danger: true }], safe: "no" });
        if (a !== "yes") return;
        if (!Storage.replaceActive(data)) { toast("This device is full, so nothing was replaced. Your profile is as it was.", "error"); return; }   // the old data was put back
        toast("Profile replaced", "ok"); navigate("#/dashboard"); if (location.hash === "#/dashboard") render();
      };
      no.onclick = () => navigate("#/settings");
      row.append(add, rep, no); card.appendChild(row); result.appendChild(card);
      add.focus();
    }
    again.onclick = () => { rx.reset(); result.textContent = ""; prog.hidden = true; note.textContent = ""; status.textContent = running ? "Looking for codes…" : "Camera is off."; again.hidden = true; };

    async function scanLoop() {
      if (!running) return;
      try {
        if (video.readyState >= 2 && video.videoWidth) {
          let texts = [];
          if (detector) {
            const found = await detector.detect(video);
            texts = found.map(f => f.rawValue);
          } else if (typeof jsQR === "function") {
            const w = Math.min(640, video.videoWidth), h = Math.round(video.videoHeight * w / video.videoWidth);
            scratch.width = w; scratch.height = h;
            const g = scratch.getContext("2d", { willReadFrequently: true });
            g.drawImage(video, 0, 0, w, h);
            const code = jsQR(g.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "dontInvert" });
            if (code && code.data) texts = [code.data];
          }
          for (const t of texts) { const now = Date.now(); if (t === lastText && now - lastAt < 1500) continue; lastText = t; lastAt = now; await onText(t); }
        }
      } catch (e) { /* one bad frame: keep going */ }
      if (running && my === screenId) loopId = setTimeout(scanLoop, 120);
    }
    open.onclick = async () => {
      open.disabled = true;
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("no camera support");
        // BarcodeDetector is built into some browsers; where it is missing (or lacks QR), the vendored jsQR reads the frames instead.
        if (typeof BarcodeDetector === "function") {
          try { const f = await BarcodeDetector.getSupportedFormats(); if (f.includes("qr_code")) detector = new BarcodeDetector({ formats: ["qr_code"] }); } catch (e) { detector = null; }
        }
        if (!detector) await loadQrReader();
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });   // the permission question appears now, not before
        if (my !== screenId) { stream.getTracks().forEach(t => t.stop()); stream = null; return; }
        video.srcObject = stream; video.hidden = false; await video.play();
        running = true; status.textContent = "Looking for codes…"; open.hidden = true; again.hidden = false;
        scanLoop();
      } catch (e) {
        stopCamera(); open.disabled = false;
        status.textContent = "The camera could not be opened. " + (e && e.name === "NotAllowedError" ? "Camera permission was not given. You can allow it in the browser's site settings, or use “Send backup to another device” instead." : "Use “Send backup to another device” instead.");
      }
    };
  }

  route("transfer", parts => { if (parts[0] === "receive") renderReceive(); else renderSend(); });
  const slot = document.getElementById("transferCard");   // a reload while Settings is open: study.js drew the screen before this file ran
  if (slot) mountCard(slot);

  return { mountCard, shareBackup, makeChunks, Receiver, sha16, sha256Js, pack, loadQrMaker, loadQrReader, drawQr, MAX_DECODED, MAX_PIECES, PIECE_TOTAL };
})();
window.Transfer = Transfer;
if (typeof currentRoute === "function" && /^\/transfer/.test(currentRoute())) render();   // a reload on a QR screen: its route was not known yet when the first screen was drawn   // so js/study.js can ask "is it loaded yet?" with window.Transfer
