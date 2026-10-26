/* MIYAKO preloader — v7 (loading starts at once, per-letter label scramble, faster character, whisk loop)
   Order: bar + 0% fade in → character is drawn with a brush → logo letters spin in like reels
   (Japanese → Latin, fast then slow) → loading 0→100 runs while he tosses the matcha, jumps out
   (logo closes up into MIYAKO), runs to the edge and strains → at 100% the main screen bursts out
   to the left with motion blur → he wipes his brow and hops back into the logo. */
(() => {
  const M = {"toss":[{"src":"assets/frames/toss_01.png","w":357.5,"h":347.5,"ax":166.0}],"stand":[{"src":"assets/frames/stand_01.png","w":233.5,"h":358.5,"ax":141.5}],"wipe":[{"src":"assets/frames/wipe_01.png","w":274.5,"h":355.5,"ax":135.0}],"run":[{"src":"assets/frames/run_01.png","w":305.0,"h":338.5,"ax":162.5},{"src":"assets/frames/run_02.png","w":310.0,"h":323.0,"ax":168.5},{"src":"assets/frames/run_03.png","w":294.5,"h":340.5,"ax":165.0},{"src":"assets/frames/run_04.png","w":266.5,"h":341.5,"ax":126.0},{"src":"assets/frames/run_05.png","w":301.0,"h":338.0,"ax":160.5},{"src":"assets/frames/run_06.png","w":284.5,"h":338.0,"ax":144.5}],"pull":[{"src":"assets/frames/pull_01.png","w":296.0,"h":347.0,"ax":295.5},{"src":"assets/frames/pull_02.png","w":260.0,"h":353.0,"ax":259.5},{"src":"assets/frames/pull_03.png","w":345.5,"h":334.5,"ax":345.0},{"src":"assets/frames/pull_04.png","w":261.5,"h":352.5,"ax":261.0},{"src":"assets/frames/pull_05.png","w":286.5,"h":344.5,"ax":286.0},{"src":"assets/frames/pull_06.png","w":307.5,"h":347.0,"ax":307.0}]};
  const JP_POOL = '抹茶緑宮都和静湯葉碗泡香心間禅雅道粉点京花月水';
  const LABEL_JP = { authentic: '本格的', japanese: '日本の', green: '緑', tea: '茶' };

  const $ = (s) => document.querySelector(s);
  const stage = $('#stage'), frame = $('#frame'), viewport = $('#viewport');
  const actor = $('#actor'), hero = $('#hero');

  // ---------- fit the 1920x1080 stage ----------
  let stageScale = 1;
  function fit() {
    const r = viewport.getBoundingClientRect(), cs = getComputedStyle(viewport);
    const w = r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const h = r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const s = Math.max(0.05, Math.min(w / 1920, h / 1080));
    frame.style.width = 1920 * s + 'px'; frame.style.height = 1080 * s + 'px';
    stage.style.transform = `scale(${s})`;
    stageScale = s;
  }
  addEventListener('resize', fit); fit();

  // ---------- film grain: animated on the loader, static Figma noise on the main screen ----------
  (function grain() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d'), img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i+1] = img.data[i+2] = v; img.data[i+3] = 255; }
    g.putImageData(img, 0, 0);
    const d = document.createElement('div'); d.className = 'grain';
    d.style.backgroundImage = `url(${c.toDataURL()})`; d.style.backgroundSize = '256px 256px';
    $('#loader').prepend(d);
    // the grain jumps by moving its own composited layer (transform), not by re-painting the whole screen
    // (background-position on a full-screen blended layer repainted ~2000×1160 px ten times a second)
    d.style.inset = '-256px'; d.style.willChange = 'transform';
    let t = 0; setInterval(() => { t++; d.style.transform = `translate(${(t * 73) % 256}px, ${(t * 151) % 256}px)`; }, 90);
    // main screen — Figma "Multi" noise: every pixel (density 100%) a random colour, layer opacity 30%,
    // added on top of the 75% shade; tone calibrated against the Figma render (same photo patch: mean +14, fine grain)
    const NV = 96;
    const n = document.createElement("canvas"); n.width = n.height = 512;
    const ng = n.getContext('2d'), nd = ng.createImageData(512, 512);
    for (let i = 0; i < nd.data.length; i += 4) { nd.data[i] = Math.random() * NV; nd.data[i+1] = Math.random() * NV; nd.data[i+2] = Math.random() * NV; nd.data[i+3] = 255; }
    ng.putImageData(nd, 0, 0);
    $('#noise').style.backgroundImage = `url(${n.toDataURL()})`;
  })();

  // ---------- hero: vertical manifesto + brush icon cluster (from Figma) ----------
  const V = [[30,855,195,1,'A curated collection'],[30,605,220,0,'The green color speaks'],[30,30,182,1,'For the perfect cup'],
    [64,513,166,1,'When you are just'],[30,472,68,0,'A little'],[64,165,272,0,'For some of us there might be'],
    [47,957,93,0,'Of matcha'],[47,605,179,0,'Before the first sip'],[47,121,169,0,'Requires a moment'],[64,30,55,0,'ready']];
  $('#vtexts').innerHTML = V.map(([l,t,h,g,s]) =>
    `<div class="abs vtext hsm" style="left:${l}px;top:${t}px;height:${h}px"><span style="color:var(${g ? '--matcha-40' : '--cream-40'})">${s}</span></div>`).join('');
  // pagination (top right): six brush squares + the green scribble that fills the first one.
  // The first square exists twice — white (drawn first, like the others) and green (cross-fades in).
  const SQ = [30.88, 50.88, 70.88, 90.88, 110.88, 130.88];
  const SCRIB = [['8ada6',1875.28,30.57,6.261,9.769,[-2.58,-2.09,-2.42,-7.07]], ['0798d',1875.88,30.68,7.011,13.992,[.27,-7.04,.33,-2.8]],
    ['7c681',1876.19,30,9.404,15.809,[-1.51,-3.02,-1.51,-1.15]], ['35782',1880.39,30.96,8.886,15.592,[-1.73,-1.37,-2.6,-4.58]],
    ['df27c',1882.63,31.79,5.128,10.787,[.46,-2.56,.24,-4.02]], ['36a37',1884.53,33.85,4.864,12.138,[-3.66,-9.1,-1.97,-8.52]]];
  const icn = (f, l, t, w, h, [it, ir, ib, il], cls) =>
    `<div class="icn ${cls}" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px"><img src="assets/${f}.min.svg" alt="" style="top:${it}%;right:${ir}%;bottom:${ib}%;left:${il}%;width:calc(100% - ${il + ir}%);height:calc(100% - ${it + ib}%)"></div>`;
  const SQI = [-2.65,-2.76,-3.08,0];
  $('#icons').innerHTML = SQ.map(t => icn('923da', 1875, t, 15, 15, SQI, 'sq')).join('') + icn('10b08', 1875, SQ[0], 15, 15, SQI, 'sqg')
    + SCRIB.map(a => icn(...a, 'scrib')).join('');

  // ---------- sprite frames ----------
  const F = {};
  for (const [name, list] of Object.entries(M)) {
    F[name] = list.map(f => {
      const im = new Image(); im.src = f.src; im.alt = ''; im.decoding = 'async';
      Object.assign(im.style, { left: -f.ax + 'px', top: -f.h + 'px', width: f.w + 'px', height: f.h + 'px' });
      actor.appendChild(im); return im;
    });
  }
  let shown = null;
  function show(name, i) {
    const el = name ? F[name][i] : null;
    if (el === shown) return;
    if (el && !(el.complete && el.naturalWidth)) return;      // not arrived yet: keep the previous pose instead of blanking
    if (shown) shown.classList.remove('on');
    if (el) el.classList.add('on');
    shown = el;
  }
  const track = [];
  const seg = (t0, t1, name, frames, fps = 0) => track.push([t0, t1, name, frames, fps]);
  function renderFrame(t) {
    for (const [t0, t1, name, frames, fps] of track) {
      if (t >= t0 && t < t1) {
        if (!Array.isArray(frames)) return show(name, frames);
        return show(name, frames[Math.floor((t - t0) * fps) % frames.length]);
      }
    }
    show(null);
  }

  // ---------- frame-by-frame clips cut from generated video (fixed box on the stage) ----------
  const clipTrack = [];
  // Frames are painted into one canvas. They are decoded ahead of time OFF the main thread
  // (createImageBitmap from the file blob, already scaled to the canvas), in a sliding window around
  // the frame on screen — drawing a frame is then a cheap blit, so the clip never stalls or flickers.
  // A frame that is not ready yet never blanks the character: the last painted frame simply stays.
  async function loadClip(name) {
    const meta = await fetch(`assets/clips/${name}.json`).then(r => r.json());
    const box = document.createElement('div');
    box.className = 'clip clip-' + name;
    Object.assign(box.style, { left: meta.box.left + 'px', top: meta.box.top + 'px', width: meta.box.w + 'px', height: meta.box.h + 'px', visibility: 'hidden' });
    const cv = document.createElement('canvas');
    Object.assign(cv.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' });
    box.appendChild(cv);
    const g = cv.getContext('2d');
    const urls = [], imgs = [];
    for (let i = 1; i <= meta.count; i++) {
      const u = `assets/clips/${meta.pattern.replace('%03d', String(i).padStart(3, '0'))}`;
      urls.push(u);
      const im = new Image(); im.decoding = 'async'; im.src = u; imgs.push(im);
    }
    await imgs[0].decode().catch(() => {});
    // canvas = what the screen actually shows (box × device pixels × stage scale), never more than the source
    const natW = imgs[0].naturalWidth || meta.box.w * 2, natH = imgs[0].naturalHeight || meta.box.h * 2;
    const k = Math.min(natW / meta.box.w, Math.max(1, (devicePixelRatio || 1) * stageScale));
    cv.width = Math.round(meta.box.w * k); cv.height = Math.round(meta.box.h * k);
    actor.parentNode.insertBefore(box, actor);

    const blobs = [], bmp = new Map(), pending = new Map(), pinned = new Set();
    const canBmp = typeof createImageBitmap === 'function';
    const blobOf = (i) => blobs[i] || (blobs[i] = fetch(urls[i]).then(r => r.blob()));
    // at most 2 frames are decoded at a time, nearest first: decoding must never take all the CPU cores
    // away from drawing the page (that is what made the logo stutter at ~3 s)
    const queue = [];
    let busy = 0;
    function pump() {
      while (busy < 2 && queue.length) {
        const rank = (q) => (q.i < anchor ? 1000 + anchor - q.i : q.i - anchor);   // the next frames first
        queue.sort((a, b) => rank(a) - rank(b));
        const job = queue.shift();
        if (job.i < anchor - 3 && !pinned.has(job.i)) { pending.delete(job.i); job.done(); continue; }   // already played
        busy++;
        blobOf(job.i)
          .then(b => createImageBitmap(b, { resizeWidth: cv.width, resizeHeight: cv.height, resizeQuality: 'medium' }))
          .then(bm => { if (bmp.has(job.i)) bm.close(); else bmp.set(job.i, bm); })
          .catch(() => {})
          .finally(() => { pending.delete(job.i); busy--; job.done(); pump(); });
      }
    }
    function decode(i) {
      if (!canBmp || i < 0 || i >= meta.count || bmp.has(i)) return;
      if (pending.has(i)) return pending.get(i);
      const p = new Promise(done => queue.push({ i, done }));
      pending.set(i, p);
      pump();
      return p;
    }
    const AHEAD = 12;
    let anchor = 0;
    function want(i) {                     // decode the frames just ahead of i; release the ones already played
      anchor = i;
      for (let j = i; j <= i + AHEAD; j++) decode(j);
      // only frames behind are dropped — frames warmed up for a later segment are kept until they are used
      for (const [j, bm] of bmp) if (!pinned.has(j) && (j < i - 3 || j > i + 70)) { bm.close(); bmp.delete(j); }
    }
    const ready = (im) => im.complete && im.naturalWidth > 0;
    let cur = -1, painted = -1;
    return { meta, imgs, box, want, decode,
      pin(list) { list.forEach(j => { pinned.add(j); decode(j); }); },
      prime(from, n) { return Promise.all(Array.from({ length: n }, (_, j) => decode(from + j))); },
      show(i) {
        if (i < 0) { if (cur !== -1) { cur = -1; box.style.visibility = 'hidden'; } return; }
        if (i !== anchor) want(i);
        if (i === cur && painted === i) return;
        cur = i;
        let src = bmp.get(i);
        if (!src) {
          // not decoded yet: the nearest earlier decoded frame (no stall); only if none, the plain image
          for (let j = i - 1; j >= Math.max(0, i - 3) && !src; j--) if (bmp.has(j)) { src = bmp.get(j); }
          if (!src && painted < 0 && ready(imgs[i])) src = imgs[i];
          if (!src) { if (painted >= 0) box.style.visibility = 'visible'; return; }
        }
        g.clearRect(0, 0, cv.width, cv.height);
        g.drawImage(src, 0, 0, cv.width, cv.height);
        if (src === bmp.get(i) || src === imgs[i]) painted = i;
        box.style.visibility = 'visible';
      } };
  }
  const clipSeg = (t0, t1, clip, from = 0, to = clip.meta.count - 1) => clipTrack.push([t0, t1, clip, from, to]);
  // endless cycle from t0 on (driven by the wall clock, so it keeps going after the timeline ends):
  // the frames play at fps, then he rests on `rest` for `hold` seconds, and again
  const clipCycles = [];
  const clipCycle = (t0, clip, frames, fps, hold, rest) => { clipCycles.push([t0, clip, frames, fps, hold, rest]); clip.pin([...frames, rest]); };
  let loopStart = null;
  function renderClips(t) {
    const active = new Map();
    for (const [t0, t1, clip, from, to] of clipTrack) {
      if (t >= t0 && t < t1) active.set(clip, Math.min(to, from + Math.floor((t - t0) / (t1 - t0) * (to - from + 1))));
      else {
        if (!active.has(clip)) active.set(clip, -1);
        if (t < t0 && t > t0 - 1.2) clip.prime(from, 10);          // warm up the next segment before it starts
      }
    }
    for (const [t0, clip, frames, fps, hold, rest] of clipCycles) {
      if (t < t0) { loopStart = null; continue; }
      if (loopStart === null) loopStart = performance.now() - (t - t0) * 1000;
      const e = (performance.now() - loopStart) / 1000, play = frames.length / fps;
      const u = e % (play + hold);
      active.set(clip, u < play ? frames[Math.floor(u * fps)] : rest);
    }
    for (const [clip, i] of active) {
      clip.show(i);
      if (clip.meta.ropeEnd && i >= 0) clip.box.style.transform = `translateX(${gsap.getProperty(hero, 'x')}px)`;
    }
  }

  // ---------- text metrics (cap-top alignment like Figma's text-box trim) ----------
  const ctx = document.createElement('canvas').getContext('2d');
  function met(font, sample) {
    ctx.font = font; const m = ctx.measureText(sample);
    return { asc: m.fontBoundingBoxAscent, desc: m.fontBoundingBoxDescent, top: m.actualBoundingBoxAscent, bot: m.actualBoundingBoxDescent, w: m.width };
  }
  // a "reel": a clipped cell whose strip scrolls up through Japanese glyphs and lands on the Latin text
  function reel(parent, text, x, capTop, o) {
    const latFont = `${o.weight} ${o.size}px ${o.family}`;
    const cap = met(latFont, 'H');
    const R = Math.ceil(cap.top) + 2;                         // row height = cap height
    const latM = met(latFont, text);
    const w = latM.w + (o.ls || 0) * text.length;
    const latShift = (R - (cap.asc + cap.desc)) / 2 + cap.asc - cap.top - 1;
    const cell = document.createElement('div');
    cell.className = 'cell';
    // feathered window (like a feathered mask in After Effects): the cell reaches E px above and below the
    // letter and fades to nothing over that band, so glyphs dissolve at the edges instead of being cut.
    // It is also XW px wider on each side, so the shadow and the blur are never clipped at the sides.
    const E = Math.round(R * .24), XW = 60;
    const lx = o.align === 'right' ? x - w : x;
    Object.assign(cell.style, { left: lx - XW + 'px', top: capTop - 1 - E + 'px', width: w + 2 * XW + 'px', height: R + 2 * E + 'px', '--fe': E + 'px' });
    const strip = document.createElement('div'); strip.className = 'strip';
    Object.assign(strip.style, { top: E + 'px', left: XW + 'px', width: w + 'px' });
    const glyphs = o.jp;
    // rows sit one pitch apart with a gap, so when the letter lands the last kanji is already fully above
    // the window: it simply scrolls out upward, nothing has to be hidden
    const G = Math.round(R * .32), P = R + G;
    const rows = [];
    for (const g of glyphs) {
      const sj = Math.min(R / 0.86, (w * 0.98) / g.length);
      const jf = `700 ${sj}px "Noto Sans JP"`;
      const jm = met(jf, g);
      const want = R / 2 + (jm.top - jm.bot) / 2;            // baseline that centres the glyph
      const have = (R - (jm.asc + jm.desc)) / 2 + jm.asc;
      rows.push(`<div class="row jp${o.small ? ' small' : ''}" style="height:${R}px;margin-bottom:${G}px;line-height:${R}px;font-size:${sj}px"><span style="transform:translateY(${(want - have).toFixed(1)}px)">${g}</span></div>`);
    }
    rows.push(`<div class="row lat${o.small ? ' small' : ''}" style="height:${R}px;line-height:${R}px;font-size:${o.size}px;letter-spacing:${o.ls || 0}px"><span style="transform:translateY(${(-latShift).toFixed(1)}px)">${text}</span></div>`);
    strip.innerHTML = rows.join('');
    cell.appendChild(strip); parent.appendChild(cell);
    return { cell, strip, n: glyphs.length, R, P, w, jp: [...strip.querySelectorAll('.row.jp')] };
  }
  const pick = (n, seed) => { const a = []; for (let i = 0; i < n; i++) a.push(JP_POOL[(seed * 7 + i * 5) % JP_POOL.length]); return a; };

  // ---------- per-letter reels ----------
  // Every letter is a tiny vertical reel clipped to its own slot: it scrolls upward through a few kanji in
  // one continuous motion that slows down and settles on the letter. Kanji take the colour of the text and
  // are scaled to the letter's width, so neighbouring reels never overlap.
  // Text never changes inside a layer (no reflow): a translation is a second layer that rolls in while the
  // first one rolls out (see `dual`). Intro = timeline-driven (`renderScramble`), hovers = wall clock (`roll`).
  const FX = 2;                                              // = --fx in the CSS: side allowance of a slot's window
  const SMALL_FONT = '700 22px "Helvetica Neue", Helvetica, Arial, sans-serif';
  const COPY_FONT = '700 16px "Helvetica Neue", Helvetica, Arial, sans-serif';
  const vis = (c) => c === ' ' ? ' ' : c;
  const escH = (c) => vis(c).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const slotHTML = (c) => `<span class="ch"><span class="l">${escH(c)}</span><span class="k"></span><span class="ok"></span><span class="ol">${escH(c)}</span></span>`;
  // words: multi-line copy — words stay whole, lines wrap at the spaces
  function makeLbl(el, text, o = {}) {
    let list;
    if (o.words) {
      el.innerHTML = text.split(' ').map(w => `<span class="w">${[...w].map(slotHTML).join('')}</span>`).join(' ');
      list = [...text.replace(/ /g, '')];
    } else {
      list = [...text];
      el.innerHTML = list.map(slotHTML).join('');
    }
    el.classList.add('scr');
    if (o.native) el.classList.add('nat');
    const chars = [...el.querySelectorAll('.ch')].map((e, i) => {
      const [l, k, ok, ol] = e.children;
      return { el: e, l, k, ok, ol, orig: list[i], key: '', sx: 1, shown: false };
    });
    const lbl = { p: el, text, chars, flips: 3, step: .05, stagger: .022, seed: 1, t0: 1e9, D: 26, ks: 16, ...o };
    all.push(lbl);
    return lbl;
  }
  const all = [];
  function scramble(parent, text, x, capTop, o = {}) {
    const p = document.createElement('p');
    p.className = 'abs tag trim';
    Object.assign(p.style, { left: x + 'px', top: capTop + 'px' });
    parent.appendChild(p);
    return makeLbl(p, text, o);
  }
  // kanji layer: ink centre on the cap-height centre of the Latin letter; D = roll distance (line box + margin)
  function placeKanji(lbl, font = SMALL_FONT, lh = 22 * 1.08) {
    // roll distance: the line box plus the feathered band (.35em, see .scr .ch), so a glyph fully dissolves
    const fs = parseFloat((font.match(/([\d.]+)px/) || [0, 16])[1]);
    lbl.fe = Math.round(fs * .35 * 10) / 10;
    lbl.D = Math.ceil(lh + lbl.fe) + 1;
    lbl.p.style.setProperty('--fe', lbl.fe + 'px');
    if (lbl.native) return;                                   // a Japanese layer rolls kanji in its own font and place
    const cap = met(font, 'H');
    const capMid = (lh - (cap.asc + cap.desc)) / 2 + cap.asc - cap.top / 2;
    const ks = Math.round(cap.top * 1.12);
    const jm = met(`700 ${ks}px "Noto Sans JP"`, '茶');
    const inkMid = (ks - (jm.asc + jm.desc)) / 2 + jm.asc - (jm.top - jm.bot) / 2;
    // (+ fe: the slot's box reaches fe px above the line for the feathered band)
    const st = { fontSize: ks + 'px', lineHeight: ks + 'px', top: (capMid - inkMid + lbl.fe).toFixed(1) + 'px' };
    for (const c of lbl.chars) { Object.assign(c.k.style, st); Object.assign(c.ok.style, st); }
    lbl.ks = ks;
  }
  // after layout: kanji scaled to each slot's width (never wider than the letter + a hair)
  function fitSlots() {
    for (const lbl of all) {
      if (lbl.native) continue;
      for (const c of lbl.chars) c.sx = Math.max(.5, Math.min(1, (c.el.offsetWidth - 2 * FX + 1.5) / lbl.ks));
    }
  }
  const outCubic = (u) => 1 - Math.pow(1 - u, 3);
  const outQuart = (u) => 1 - Math.pow(1 - u, 4);            // the logo reels' feel: quick spin, long soft landing
  const inOutSine = (u) => -(Math.cos(Math.PI * u) - 1) / 2;
  // paint one slot: glyph `from` leaves upward, `to` comes in from below; p 0→1. Glyph: null | {k: kanji} | {l: true}
  function paint(lbl, c, from, to, p) {
    const key = (from ? (from.k || 'L') : '-') + (to ? (to.k || 'L') : '-') + Math.round(p * 60);
    if (key === c.key) return; c.key = key;
    const D = lbl.D, yIn = ((1 - p) * D).toFixed(2), yOut = (-p * D).toFixed(2);
    const kt = (y) => lbl.native ? `translateY(${y}px)` : `translate(-50%,${y}px) scale(${c.sx})`;
    // glyphs fade softly towards the edges of the window instead of being cut off
    const fade = (q) => { const u = Math.min(1, Math.max(0, (q - .25) / .75)); return (1 - u * u * (3 - 2 * u)).toFixed(3); };
    const aIn = fade(1 - p), aOut = fade(p);
    if (to && to.l) { c.l.style.visibility = 'visible'; c.l.style.transform = p < 1 ? `translateY(${yIn}px)` : ''; c.l.style.opacity = p < 1 ? aIn : ''; c.k.style.visibility = 'hidden'; }
    else if (to) { c.k.textContent = to.k; c.k.style.visibility = 'visible'; c.k.style.transform = kt(yIn); c.k.style.opacity = aIn; c.l.style.visibility = 'hidden'; }
    else { c.k.style.visibility = 'hidden'; c.l.style.visibility = 'hidden'; }
    if (from && p < 1) {
      if (from.l) { c.ol.style.visibility = 'visible'; c.ol.style.transform = `translateY(${yOut}px)`; c.ol.style.opacity = aOut; c.ok.style.visibility = 'hidden'; }
      else { c.ok.textContent = from.k; c.ok.style.visibility = 'visible'; c.ok.style.transform = kt(yOut); c.ok.style.opacity = aOut; c.ol.style.visibility = 'hidden'; }
    } else { c.ok.style.visibility = 'hidden'; c.ol.style.visibility = 'hidden'; }
  }
  const kj = (lbl, i, s) => ({ k: JP_POOL[(lbl.seed * 11 + i * 5 + s * 7) % JP_POOL.length] });
  // one reel run: glyphs G[0] → … → G[f+1] over a continuous, decelerating scroll; u 0→1
  function reelAt(lbl, c, i, u, f, fromG, toG, salt, ease = outQuart) {
    const G = (j) => j === 0 ? fromG : j <= f ? kj(lbl, i + salt, j) : toG;
    if (u >= 1) return paint(lbl, c, null, toG, 1);
    const pos = ease(Math.max(0, u)) * (f + 1), j = Math.min(f, Math.floor(pos));
    paint(lbl, c, G(j), G(j + 1), pos - j);
  }
  const LETTER = { l: true };
  const runT = (lbl, f) => (f + 1) * lbl.step * 2.1;
  // timeline-driven (intro): hidden → kanji → the letter
  function renderScramble(lbl, t) {
    if (lbl.live) return;                                      // after the intro, hovers own this layer
    if (lbl.instant) { lbl.chars.forEach(c => { c.shown = t >= lbl.t0 && !!c.orig; paint(lbl, c, null, c.shown && c.orig !== ' ' ? LETTER : null, 1); }); return; }
    lbl.chars.forEach((c, i) => {
      if (!c.orig || c.orig === ' ') return paint(lbl, c, null, null, 1);
      const f = lbl.flips + ((i * 7 + lbl.seed) % 3);
      const local = t - (lbl.t0 + i * lbl.stagger);
      c.shown = local >= runT(lbl, f);
      if (local < 0) return paint(lbl, c, null, null, 1);
      reelAt(lbl, c, i, local / runT(lbl, f), f, null, LETTER, 0);
    });
  }
  // wall-clock: roll a whole layer in (show) or out, letter by letter
  let flipGen = 0;
  function roll(lbl, show, o = {}) {
    // in: through a couple of kanji (or straight up from below with flips: 0); out: the letters glide up and away
    const { delay = 0, stagger = lbl.stagger * 1.3, flips = show ? 3 : 0, T, ease = show ? outQuart : inOutSine, delays } = o;
    lbl.live = true;
    const a = { gen: flipGen }; lbl.anim = a;
    const start = performance.now();
    const plan = lbl.chars.map((c, i) => {
      if (!c.orig || c.orig === ' ' || c.shown === show) return null;
      const f = flips ? flips + ((i * 5) % 2) : 0;
      return { c, i, f, d: delay + (delays ? delays[i] : i * stagger), T: T || (show ? .32 + (f + 1) * .085 : .42) };
    }).filter(Boolean);
    plan.forEach(q => { q.c.shown = show; });
    const tick = () => {
      if (lbl.anim !== a || a.gen !== flipGen) return;
      const t = (performance.now() - start) / 1000;
      let done = true;
      for (const q of plan) {
        const u = (t - q.d) / q.T;
        if (u < 1) done = false;
        if (u < 0) continue;
        reelAt(lbl, q.c, q.i, u, q.f, show ? null : LETTER, show ? LETTER : null, show ? 3 : 9, ease);
      }
      if (!done) requestAnimationFrame(tick); else lbl.anim = null;
    };
    requestAnimationFrame(tick);
  }
  // hide a layer instantly (replay / initial state of translation layers)
  function hideNow(lbl) { lbl.anim = null; lbl.chars.forEach(c => { c.shown = false; paint(lbl, c, null, null, 1); }); }
  // two layers, English (in flow) + Japanese (absolute), aligned left / right / centre inside `box`
  function dual(box, en, jp, o = {}) {
    const { align = 'center', font = COPY_FONT, lh = 16, ja = false, enOpts = {} } = o;
    box.textContent = '';
    const se = document.createElement('span'); se.className = 'dl en';
    const sj = document.createElement('span'); sj.className = 'dl jp';
    box.append(se, sj);
    const E = makeLbl(se, en, enOpts); placeKanji(E, font, lh);
    const J = makeLbl(sj, jp, { native: true, step: .05, stagger: .03 }); placeKanji(J, font, lh);
    if (ja) J.chars.forEach((c, i) => c.el.classList.toggle('ja', i < J.chars.length - 1));
    hideNow(J);
    const d = { box, E, J, align, lang: 'en' };
    d.place = () => {                                          // position the Japanese layer without transforms
      const bw = se.offsetWidth, jw = sj.offsetWidth;
      sj.style.left = (align === 'left' ? 0 : align === 'right' ? bw - jw : (bw - jw) / 2).toFixed(2) + 'px';
    };
    duals.push(d);
    return d;
  }
  const duals = [];
  function swap(d, lang) {
    if (d.lang === lang) return;
    d.lang = lang;
    // One reel strip at every point of the line, like the logo: the old letter glides up and out, then —
    // only once it has left that spot — kanji spin up from below and the new letter settles softly.
    // A left-to-right wave keyed to the letters' x, so the two words never overlap at the same place.
    const [out, inn] = lang === 'jp' ? [d.E, d.J] : [d.J, d.E];
    const cx = (L, c) => L.p.offsetLeft + c.el.offsetLeft + c.el.offsetWidth / 2;
    const xs = [...out.chars.map(c => cx(out, c)), ...inn.chars.map(c => cx(inn, c))];
    const x0 = Math.min(...xs), W = Math.max(1, Math.max(...xs) - x0);
    const SPREAD = .28, T_OUT = .36, T_IN = .78;
    const at = (L) => L.chars.map(c => SPREAD * (cx(L, c) - x0) / W);
    roll(out, false, { delays: at(out), T: T_OUT, ease: inOutSine });
    roll(inn, true, { delays: at(inn).map(v => v + T_OUT * .62), T: T_IN, ease: outCubic, flips: 3 });
  }



  // ink edges (Figma aligns the labels to the letters' visible edges, not to their advance boxes)
  ctx.letterSpacing = '0px';
  function inkRight(font, s, ls = 0) { ctx.font = font; ctx.letterSpacing = ls + 'px'; const r = ctx.measureText(s).actualBoundingBoxRight; ctx.letterSpacing = '0px'; return r; }

  // ---------- brush-drawn character ----------
  async function loadCharacter() {
    const svgText = await fetch('assets/character-draw.svg').then(r => r.text());
    $('#sit').innerHTML = svgText;
    const paths = [...$('#sit').querySelectorAll('.brush path')];
    const lens = paths.map(p => p.getTotalLength());
    paths.forEach((p, i) => { p.style.strokeDasharray = `${lens[i] + 1} ${lens[i] + 1}`; p.style.strokeDashoffset = lens[i] + 1; p.style.visibility = 'hidden'; });
    const cum = [0]; lens.forEach(l => cum.push(cum[cum.length - 1] + l));
    const total = cum[cum.length - 1];
    const cache = new Array(paths.length).fill(-1);
    return {
      fill: $('#sit .fill'),
      draw(p) {                                  // p: 0..1 of total stroke length
        const target = p * total;
        for (let i = 0; i < paths.length; i++) {
          const v = Math.max(0, Math.min(lens[i], target - cum[i]));
          const off = v <= 0 ? -1 : Math.round(lens[i] - v + (v >= lens[i] ? 0 : 1));
          if (off !== cache[i]) {
            // a zero-length dash still paints its round cap as a dot, so unstarted strokes stay hidden
            paths[i].style.visibility = off < 0 ? 'hidden' : 'visible';
            if (off >= 0) paths[i].style.strokeDashoffset = off;
            cache[i] = off;
          }
        }
      }
    };
  }

  // ---------- stroke-by-stroke writer (kanji at the top) ----------
  function writer(svgEl, gap = 0.12) {
    const paths = [...svgEl.querySelectorAll('path')];
    const lens = paths.map(p => p.getTotalLength());
    paths.forEach((p, i) => { p.style.strokeDasharray = `${lens[i] + 1} ${lens[i] + 1}`; p.style.strokeDashoffset = lens[i] + 1; p.style.visibility = 'hidden'; });
    // each stroke gets time ∝ its length plus a small lift-the-brush pause
    const total = lens.reduce((a, b) => a + b, 0);
    const slots = []; let acc = 0;
    lens.forEach(l => { const d = (l / total) * (1 - gap * paths.length / (paths.length + 1)) + gap / (paths.length + 1); slots.push([acc, acc + d]); acc += d; });
    return (p) => {
      paths.forEach((path, i) => {
        const [a, b] = slots[i];
        const k = Math.max(0, Math.min(1, (p * acc - a) / (b - a) * 1.25));   // last 20% of a slot is the pause
        path.style.visibility = k > 0 ? 'visible' : 'hidden';
        path.style.strokeDashoffset = (lens[i] + 1) * (1 - k);
      });
    };
  }


  // ---------- hand-written line: the real text is revealed through brush strokes along each letter's skeleton ----------
  // Skeletons: Hershey "futural" single-stroke glyphs (public domain), fitted to each letter's ink box.
  const SKEL = {"'":[[[5,-10],[4,-11],[5,-12],[6,-11],[6,-9],[5,-7],[4,-6]]],",":[[[5,5],[4,6],[3,5],[4,4],[5,5],[5,7],[3,9]]],".":[[[4,4],[3,5],[4,6],[5,5],[4,4]]],"0":[[[9,-12],[6,-11],[4,-8],[3,-3],[3,0],[4,5],[6,8],[9,9],[11,9],[14,8],[16,5],[17,0],[17,-3],[16,-8],[14,-11],[11,-12],[9,-12]]],"1":[[[6,-8],[8,-9],[11,-12],[11,9]]],"2":[[[4,-7],[4,-8],[5,-10],[6,-11],[8,-12],[12,-12],[14,-11],[15,-10],[16,-8],[16,-6],[15,-4],[13,-1],[3,9],[17,9]]],"3":[[[5,-12],[16,-12],[10,-4],[13,-4],[15,-3],[16,-2],[17,1],[17,3],[16,6],[14,8],[11,9],[8,9],[5,8],[4,7],[3,5]]],"4":[[[13,-12],[3,2],[18,2]],[[13,-12],[13,9]]],"5":[[[15,-12],[5,-12],[4,-3],[5,-4],[8,-5],[11,-5],[14,-4],[16,-2],[17,1],[17,3],[16,6],[14,8],[11,9],[8,9],[5,8],[4,7],[3,5]]],"6":[[[16,-9],[15,-11],[12,-12],[10,-12],[7,-11],[5,-8],[4,-3],[4,2],[5,6],[7,8],[10,9],[11,9],[14,8],[16,6],[17,3],[17,2],[16,-1],[14,-3],[11,-4],[10,-4],[7,-3],[5,-1],[4,2]]],"7":[[[17,-12],[7,9]],[[3,-12],[17,-12]]],"8":[[[8,-12],[5,-11],[4,-9],[4,-7],[5,-5],[7,-4],[11,-3],[14,-2],[16,0],[17,2],[17,5],[16,7],[15,8],[12,9],[8,9],[5,8],[4,7],[3,5],[3,2],[4,0],[6,-2],[9,-3],[13,-4],[15,-5],[16,-7],[16,-9],[15,-11],[12,-12],[8,-12]]],"9":[[[16,-5],[15,-2],[13,0],[10,1],[9,1],[6,0],[4,-2],[3,-5],[3,-6],[4,-9],[6,-11],[9,-12],[10,-12],[13,-11],[15,-9],[16,-5],[16,0],[15,5],[13,8],[10,9],[8,9],[5,8],[4,6]]],"A":[[[9,-12],[1,9]],[[9,-12],[17,9]],[[4,2],[14,2]]],"B":[[[4,-12],[4,9]],[[4,-12],[13,-12],[16,-11],[17,-10],[18,-8],[18,-6],[17,-4],[16,-3],[13,-2]],[[4,-2],[13,-2],[16,-1],[17,0],[18,2],[18,5],[17,7],[16,8],[13,9],[4,9]]],"C":[[[18,-7],[17,-9],[15,-11],[13,-12],[9,-12],[7,-11],[5,-9],[4,-7],[3,-4],[3,1],[4,4],[5,6],[7,8],[9,9],[13,9],[15,8],[17,6],[18,4]]],"D":[[[4,-12],[4,9]],[[4,-12],[11,-12],[14,-11],[16,-9],[17,-7],[18,-4],[18,1],[17,4],[16,6],[14,8],[11,9],[4,9]]],"E":[[[4,-12],[4,9]],[[4,-12],[17,-12]],[[4,-2],[12,-2]],[[4,9],[17,9]]],"F":[[[4,-12],[4,9]],[[4,-12],[17,-12]],[[4,-2],[12,-2]]],"G":[[[18,-7],[17,-9],[15,-11],[13,-12],[9,-12],[7,-11],[5,-9],[4,-7],[3,-4],[3,1],[4,4],[5,6],[7,8],[9,9],[13,9],[15,8],[17,6],[18,4],[18,1]],[[13,1],[18,1]]],"H":[[[4,-12],[4,9]],[[18,-12],[18,9]],[[4,-2],[18,-2]]],"I":[[[4,-12],[4,9]]],"J":[[[12,-12],[12,4],[11,7],[10,8],[8,9],[6,9],[4,8],[3,7],[2,4],[2,2]]],"K":[[[4,-12],[4,9]],[[18,-12],[4,2]],[[9,-3],[18,9]]],"L":[[[4,-12],[4,9]],[[4,9],[16,9]]],"M":[[[4,-12],[4,9]],[[4,-12],[12,9]],[[20,-12],[12,9]],[[20,-12],[20,9]]],"N":[[[4,-12],[4,9]],[[4,-12],[18,9]],[[18,-12],[18,9]]],"O":[[[9,-12],[7,-11],[5,-9],[4,-7],[3,-4],[3,1],[4,4],[5,6],[7,8],[9,9],[13,9],[15,8],[17,6],[18,4],[19,1],[19,-4],[18,-7],[17,-9],[15,-11],[13,-12],[9,-12]]],"P":[[[4,-12],[4,9]],[[4,-12],[13,-12],[16,-11],[17,-10],[18,-8],[18,-5],[17,-3],[16,-2],[13,-1],[4,-1]]],"Q":[[[9,-12],[7,-11],[5,-9],[4,-7],[3,-4],[3,1],[4,4],[5,6],[7,8],[9,9],[13,9],[15,8],[17,6],[18,4],[19,1],[19,-4],[18,-7],[17,-9],[15,-11],[13,-12],[9,-12]],[[12,5],[18,11]]],"R":[[[4,-12],[4,9]],[[4,-12],[13,-12],[16,-11],[17,-10],[18,-8],[18,-6],[17,-4],[16,-3],[13,-2],[4,-2]],[[11,-2],[18,9]]],"S":[[[17,-9],[15,-11],[12,-12],[8,-12],[5,-11],[3,-9],[3,-7],[4,-5],[5,-4],[7,-3],[13,-1],[15,0],[16,1],[17,3],[17,6],[15,8],[12,9],[8,9],[5,8],[3,6]]],"T":[[[8,-12],[8,9]],[[1,-12],[15,-12]]],"U":[[[4,-12],[4,3],[5,6],[7,8],[10,9],[12,9],[15,8],[17,6],[18,3],[18,-12]]],"V":[[[1,-12],[9,9]],[[17,-12],[9,9]]],"W":[[[2,-12],[7,9]],[[12,-12],[7,9]],[[12,-12],[17,9]],[[22,-12],[17,9]]],"X":[[[3,-12],[17,9]],[[17,-12],[3,9]]],"Y":[[[1,-12],[9,-2],[9,9]],[[17,-12],[9,-2]]],"Z":[[[17,-12],[3,9]],[[3,-12],[17,-12]],[[3,9],[17,9]]],"’":[[[5,-10],[4,-11],[5,-12],[6,-11],[6,-9],[5,-7],[4,-6]]],"Â":[[[9,-12],[1,9]],[[9,-12],[17,9]],[[4,2],[14,2]],[[4,-15],[9,-19],[14,-15]]]};
  function handwrite(p) {
    const text = p.textContent.toUpperCase();
    const capTop = parseFloat(p.style.top), left = parseFloat(p.style.left);
    const cap = met(COPY_FONT, 'H').top;
    const NS = 'http://www.w3.org/2000/svg', PAD = 12;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'abs'); svg.setAttribute('aria-label', p.textContent);
    Object.assign(svg.style, { left: left - PAD + 'px', top: capTop - PAD + 'px', overflow: 'visible' });
    svg.setAttribute('width', 420); svg.setAttribute('height', cap + 2 * PAD + 6);
    const base = PAD + cap;
    svg.innerHTML = `<defs><mask id="hwMask" maskUnits="userSpaceOnUse" x="-20" y="-20" width="480" height="80"><g class="hw" fill="none" stroke="#fff" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"></g></mask></defs>`
      + `<text x="${PAD}" y="${base}" fill="${getComputedStyle(p).color}" mask="url(#hwMask)"></text>`;
    const tx = svg.querySelector('text'); tx.textContent = text;
    tx.style.font = COPY_FONT; tx.style.letterSpacing = '-.32px';          // Helvetica Bold 16, like the rest of the copy
    p.replaceWith(svg);
    const g = svg.querySelector('.hw');
    let d = '';
    [...text].forEach((ch, i) => {
      const sk = SKEL[ch]; if (!sk) return;
      const x0 = tx.getStartPositionOfChar(i).x;
      ctx.font = COPY_FONT; const m = ctx.measureText(ch);
      const IN = 1.1;                                        // stroke centre sits half a stem inside the ink edge
      const bx0 = x0 - m.actualBoundingBoxLeft + IN, bx1 = x0 + m.actualBoundingBoxRight - IN;
      const by0 = base - m.actualBoundingBoxAscent + IN, by1 = base + m.actualBoundingBoxDescent - IN;
      const pts = sk.flat(), gx0 = Math.min(...pts.map(q => q[0])), gx1 = Math.max(...pts.map(q => q[0])), gy0 = Math.min(...pts.map(q => q[1])), gy1 = Math.max(...pts.map(q => q[1]));
      const X = (x) => gx1 > gx0 ? bx0 + (x - gx0) / (gx1 - gx0) * (bx1 - bx0) : (bx0 + bx1) / 2;
      const Y = (y) => gy1 > gy0 ? by0 + (y - gy0) / (gy1 - gy0) * (by1 - by0) : (by0 + by1) / 2;
      for (const s of sk) d += `<path d="M${s.map(([x, y]) => X(x).toFixed(2) + ' ' + Y(y).toFixed(2)).join(' L')}"/>`;
    });
    g.innerHTML = d;
    const write = writer(g, .25);
    ctx.font = COPY_FONT;
    const n = text.length, mA = ctx.measureText(text[0]), mZ = ctx.measureText(text[n - 1]);
    const ink0 = left - PAD + tx.getStartPositionOfChar(0).x - mA.actualBoundingBoxLeft;
    const ink1 = left - PAD + tx.getStartPositionOfChar(n - 1).x + mZ.actualBoundingBoxRight;
    // the brush underline runs exactly from the first letter's ink to the last one's
    Object.assign($('#uline').style, { left: ink0.toFixed(2) + 'px', width: (ink1 - ink0).toFixed(2) + 'px' });
    return (k) => { write(k); if (k >= 1) tx.removeAttribute('mask'); else if (!tx.hasAttribute('mask')) tx.setAttribute('mask', 'url(#hwMask)'); };
  }

  // ---------- living background: muted looped video under the shade + noise (photo stays as the poster) ----------
  (function bgVideo() {
    const v = $('#bgv'); if (!v) return;
    const go = () => v.play().catch(() => {});
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { v.removeAttribute('autoplay'); v.pause(); return; }
    go(); v.addEventListener('canplay', go, { once: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) go(); });
  })();


  // ---------- hand-written reveal for live HTML copy ----------
  // An SVG twin of the text (same font, colour, letter positions taken from the layout) is painted on top and
  // revealed through brush strokes along each letter's skeleton; when it is complete the real text takes over.
  let hwN = 0;
  function handwriteOverlay(lbl, font = COPY_FONT, lh = 16) {
    const NS = 'http://www.w3.org/2000/svg';
    const host = lbl.chars[0].el.offsetParent;
    ctx.font = font;
    const fm = ctx.measureText('H');
    const baseOff = (lh - (fm.fontBoundingBoxAscent + fm.fontBoundingBoxDescent)) / 2 + fm.fontBoundingBoxAscent;
    const id = 'hwm' + (hwN++);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'hwo'); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', 1); svg.setAttribute('height', 1);
    const mask = document.createElementNS(NS, 'mask');
    mask.setAttribute('id', id); mask.setAttribute('maskUnits', 'userSpaceOnUse');
    ['x', 'y'].forEach(k => mask.setAttribute(k, -50)); ['width', 'height'].forEach(k => mask.setAttribute(k, 2000));
    const g = document.createElementNS(NS, 'g');
    Object.entries({ fill: 'none', stroke: '#fff', 'stroke-width': 4.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }).forEach(([k, v]) => g.setAttribute(k, v));
    mask.appendChild(g); svg.appendChild(mask);
    const tg = document.createElementNS(NS, 'g'); tg.setAttribute('mask', `url(#${id})`); svg.appendChild(tg);
    let d = '';
    // letter x positions: advance widths accumulated per line (slots are separate boxes, so no kerning between them)
    const cs = getComputedStyle(lbl.chars[0].l);
    const mfont = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, ls = parseFloat(cs.letterSpacing) || 0;
    const posOf = (el) => { let x = 0, y = 0, e = el; while (e && e !== host) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return [x, y]; };
    let lineY = null, cx = 0, prevWord = null;
    for (const c of lbl.chars) {
      const ch = (c.orig || '').toUpperCase(); if (!ch.trim()) { if (ch) { ctx.font = mfont; cx += ctx.measureText(' ').width + ls; } continue; }
      const [ox0, y0] = posOf(c.el), ox = ox0 + FX, y = y0 + (lbl.fe || 0);   // the slot box reaches FX / fe past the letter
      const word = c.el.parentNode.classList.contains('w') ? c.el.parentNode : null;
      if (lineY === null || Math.abs(y - lineY) > 2) { lineY = y; cx = ox; }
      else if (word && prevWord && word !== prevWord) { ctx.font = mfont; cx += ctx.measureText(' ').width + ls; }
      prevWord = word;
      const x = cx;
      ctx.font = mfont; cx += ctx.measureText(ch).width + ls;
      ctx.font = font;
      const base = y + baseOff;
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', x.toFixed(2)); t.setAttribute('y', base.toFixed(2)); t.textContent = ch;
      t.style.font = font; t.style.fill = getComputedStyle(c.l).color;
      tg.appendChild(t);
      const sk = SKEL[ch]; if (!sk) continue;
      const m = ctx.measureText(ch), IN = 1.1;
      const bx0 = x - m.actualBoundingBoxLeft + IN, bx1 = x + m.actualBoundingBoxRight - IN;
      const by0 = base - m.actualBoundingBoxAscent + IN, by1 = base + m.actualBoundingBoxDescent - IN;
      const pts = sk.flat(), gx0 = Math.min(...pts.map(q => q[0])), gx1 = Math.max(...pts.map(q => q[0])), gy0 = Math.min(...pts.map(q => q[1])), gy1 = Math.max(...pts.map(q => q[1]));
      const X = (v) => gx1 > gx0 ? bx0 + (v - gx0) / (gx1 - gx0) * (bx1 - bx0) : (bx0 + bx1) / 2;
      const Y = (v) => gy1 > gy0 ? by0 + (v - gy0) / (gy1 - gy0) * (by1 - by0) : (by0 + by1) / 2;
      for (const st of sk) d += `<path d="M${st.map(([px, py]) => X(px).toFixed(2) + ' ' + Y(py).toFixed(2)).join(' L')}"/>`;
    }
    g.innerHTML = d;
    host.appendChild(svg);
    const write = writer(g, .22);
    let last = -2;
    return {
      lbl, n: lbl.chars.filter(c => (c.orig || '').trim()).length,
      render(t) {                                              // t0 = start of writing, lbl.t0 = hand-over to the live text
        const vis = t >= this.w0 && t < lbl.t0;
        const k = Math.max(0, Math.min(1, (t - this.w0) / (lbl.t0 - this.w0)));
        const key = vis ? Math.round(k * 400) : -1;
        if (key === last) return; last = key;
        svg.style.visibility = vis ? 'visible' : 'hidden';
        if (vis) { write(k); if (k >= 1) tg.removeAttribute('mask'); else if (!tg.hasAttribute('mask')) tg.setAttribute('mask', `url(#${id})`); }
      }
    };
  }

  // ---------- build everything once fonts + the first frames are ready ----------
  const BIG_FONT = '400 188px "Badeen Display", "Arial Black", sans-serif';
  async function init() {
    await Promise.all([
      document.fonts.load('400 188px "Badeen Display"', 'MIYAKO0123456789%'),
      document.fonts.load('700 100px "Noto Sans JP"', JP_POOL + Object.values(LABEL_JP).join('') + '抹茶とカタログ私たちお店砂糖なし。無添加お茶だけカタログを見る配達を手配'),
      document.fonts.load('600 22px "Inter"', '抹茶'),
    ]).catch(() => {});
    await document.fonts.ready;
    const [ch, toss, pull] = await Promise.all([loadCharacter(), loadClip('toss'), loadClip('pull')]);
    // only the frames needed in the first seconds block the start; the rest keep loading underneath
    // and every sprite pose is decoded before it is first shown (a pose shown undecoded blinks empty for a frame)
    await Promise.all([
      toss.prime(0, 16),
      ...toss.imgs.slice(16, 40).map(im => im.decode ? im.decode().catch(() => {}) : 0),
      ...Object.values(F).flat().map(im => im.decode ? im.decode().catch(() => {}) : 0),
    ]);
    pull.prime(0, 8);
    // the rest of the whisk + toss frames are decoded in the background from the very start (the character is
    // still being drawn then and the CPU is free), so nothing is left to decode while the logo spins in
    toss.prime(16, 50);

    // logo reels (loader version: logo row 62px lower than on the main screen)
    const BIG = { family: '"Badeen Display", "Arial Black", sans-serif', weight: 400, size: 188 };
    const L = $('#grpL'), Rg = $('#grpR');
    const letters = [];
    // logo hugs the character: ~16px of air on each side (Figma had ~50)
    const LX0 = 448, LX1 = 1485, HX0 = 450, HX1 = 1483;
    let x = LX0;
    'MIY'.split('').forEach((c, i) => { const r = reel(L, c, x, 474, { ...BIG, jp: pick(9 + i * 2, i + 1) }); x += r.w; letters.push(r); });
    const wM = x - LX0;
    const ako = 'AKO'.split(''); const wA = ako.reduce((s, c) => s + met(BIG_FONT, c).w, 0);
    x = LX1 - wA;
    let oStart = 0;
    ako.forEach((c, i) => { if (c === 'O') oStart = x; const r = reel(Rg, c, x, 474, { ...BIG, jp: pick(15 + i * 2, i + 4) }); x += r.w; letters.push(r); });
    const oInkRight = oStart + inkRight(BIG_FONT, 'O');

    // labels: per-letter scramble; JAPANESE / TEA end exactly on the right edge of the O
    const mk = (parent, word, capTop, seed) => scramble(parent, word.toUpperCase(), LX0, capTop, { seed, flips: 5, step: .05, stagger: .035 });
    const labels = [mk(L, 'authentic', 428, 1), mk(Rg, 'japanese', 428, 2), mk(L, 'green', 636, 3), mk(Rg, 'tea', 636, 4)];
    labels.forEach(l => placeKanji(l));
    for (const lbl of [labels[1], labels[3]]) alignRight(lbl.p, oInkRight, lbl.text);

    const target = 960 - (wM + wA) / 2;
    const dxL = target - LX0, dxR = (target + wM) - (LX1 - wA);

    // ===== main screen: the logo and its labels are built exactly like the loader's (Figma positions) =====
    const H = { letters: [], labels: [], small: [], nav: [], foot: [], btns: [] };
    const HL = $('#hgL'), HR = $('#hgR');
    x = HX0;
    'MIY'.split('').forEach((c, i) => { const r = reel(HL, c, x, 412, { ...BIG, jp: pick(9 + i * 2, i + 1) }); x += r.w; H.letters.push(r); });
    x = HX1 - wA; let hO = 0;
    ako.forEach((c, i) => { if (c === 'O') hO = x; const r = reel(HR, c, x, 412, { ...BIG, jp: pick(15 + i * 2, i + 4) }); x += r.w; H.letters.push(r); });
    const LBL_LH = 22 * 1.08;
    const mkH = (parent, word, capTop, seed, align) => {
      const p = document.createElement('p'); p.className = 'abs tag trim';
      Object.assign(p.style, { left: HX0 + 'px', top: capTop + 'px' });
      parent.appendChild(p);
      const d = dual(p, word.toUpperCase(), LABEL_JP[word], { align, font: SMALL_FONT, lh: LBL_LH, enOpts: { seed, flips: 5, step: .05, stagger: .035 } });
      d.word = word.toUpperCase();
      return d;
    };
    H.labels = [mkH(HL, 'authentic', 366, 1, 'left'), mkH(HR, 'japanese', 366, 2, 'right'), mkH(HL, 'green', 574, 3, 'left'), mkH(HR, 'tea', 574, 4, 'right')];
    // right-hand labels: aligned to the O, then anchored by their right edge
    for (const d of [H.labels[1], H.labels[3]]) { alignRight(d.box, hO + inkRight(BIG_FONT, 'O'), d.word); anchorRight(d.box); }

    // small copy: every text on the screen gets letter reels
    const SMALL = { flips: 2, step: .05, stagger: .016 };
    const copy = (el, text, o) => { const l = makeLbl(el, text, { ...SMALL, ...o }); placeKanji(l, COPY_FONT, 16); H.small.push(l); return l; };
    // nav: English + Japanese layers centred on each other; brush underline exactly under the Japanese ink
    for (const a of $('#nav').children) {
      const en = a.textContent.trim(), jp = a.dataset.jp;
      const d = dual(a, en, jp, { align: 'center', ja: true, enOpts: SMALL });
      H.small.push(d.E);
      const ul = document.createElement('span'); ul.className = 'ul';
      ul.innerHTML = '<img src="assets/navline.svg" alt="">';
      a.appendChild(ul);
      H.nav.push({ a, d, l: d.E, ul });
    }
    H.vert = [...document.querySelectorAll('#vtexts .vtext > span')].map(s => copy(s, s.textContent));
    H.addr = [...document.querySelectorAll('#hero .hsm p')].map(p => copy(p, p.textContent, { words: true }));
    H.writeSorry = handwrite($('#sorry'));
    for (const ph of $('#foot').children) {
      const d = dual(ph, ph.textContent.trim(), ph.dataset.jp, { align: 'center', enOpts: SMALL });
      H.small.push(d.E);
      H.foot.push({ el: ph, d, l: d.E });
    }
    // buttons: brush pill outline (drawn on entrance) + liquid layers + English/Japanese label
    const wave = (fill) => `<svg class="wave" viewBox="0 0 672 140" preserveAspectRatio="none" aria-hidden="true"><path fill="${fill}" d="M0 14 ${Array.from({ length: 8 }, (_, i) => `Q ${i * 84 + 42} ${i % 2 ? 24 : 4} ${(i + 1) * 84} 14`).join(' ')} L672 140 L0 140 Z"/></svg>`;
    for (const a of [$('#btnFill'), $('#btnLine')]) {
      const fill = a.classList.contains('fill');
      const en = a.textContent.trim(), jp = a.dataset.jp;
      a.innerHTML = (fill ? `<span class="liq base"><span class="lv">${wave('#C5E45A')}</span></span>` : '')
        + `<span class="liq hov"><span class="lv">${wave(fill ? '#F6F3EA' : '#C5E45A')}</span></span>`
        + `<svg class="pill" viewBox="0 0 336 100" aria-hidden="true"><rect x="1" y="1" width="334" height="98" rx="49" fill="none" stroke="${fill ? 'none' : '#F6F3EA'}" stroke-width="2" pathLength="1" stroke-dasharray="1 1"/></svg>`
        + '<span class="t"></span>';
      a.setAttribute('aria-label', en);
      const d = dual(a.querySelector('.t'), en, jp, { align: 'center', font: '700 22px "Helvetica Neue", Helvetica, Arial, sans-serif', lh: 22, enOpts: { flips: 3, step: .05, stagger: .03, seed: fill ? 2 : 5 } });
      H.btns.push({ a, d, l: d.E, fill, base: a.querySelector('.base .lv'), hov: a.querySelector('.hov .lv'), pill: a.querySelector('.pill rect'), svg: a.querySelector('.pill') });
    }

    // after layout: kanji fitted to their letters, Japanese layers positioned, nav underlines on the Japanese ink edges
    fitSlots();
    duals.forEach(d => d.place());
    document.querySelectorAll('#vtexts .vtext > span').forEach(sp => {
      sp.style.transform = `translate(${-Math.round(sp.offsetWidth / 2)}px, ${-Math.round(sp.offsetHeight / 2)}px) rotate(-90deg)`;
    });
    // vertical manifesto, addresses and footer are hand-written in the intro (like 抹茶 and "Sorry coffe…")
    H.hw = [...H.vert, ...H.addr, ...H.foot.map(f => f.l)].map(l => { l.instant = true; return handwriteOverlay(l); });
    H.nav.forEach(fitUnderline);

    // kanji at the top: the loader's stroke writer, at the main screen's 16px size
    const hk = $('#kanjiWrite').cloneNode(true);
    hk.id = 'hkWrite'; hk.removeAttribute('style'); hk.setAttribute('class', 'abs hk');
    hk.setAttribute('width', '36'); hk.setAttribute('height', '18.4');
    hk.querySelector('g').setAttribute('stroke-width', '15');       // heavier strokes, like the Figma weight at 16px
    $('#icons').before(hk);
    H.hk = hk;

    build(ch, toss, pull, letters, labels, dxL, dxR, H);
  }
  // nav underline: from the ink of the first Japanese letter to the ink of the last one,
  // measured with the font the browser actually uses for those letters
  function fitUnderline(n) {
    const J = n.d.J, sj = J.p, first = J.chars[0], last = J.chars[J.chars.length - 1];
    const cs = getComputedStyle(first.l);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const m0 = ctx.measureText(first.orig), m1 = ctx.measureText(last.orig);
    const x0 = sj.offsetLeft + first.el.offsetLeft + FX - m0.actualBoundingBoxLeft;
    const x1 = sj.offsetLeft + last.el.offsetLeft + FX + m1.actualBoundingBoxRight;
    Object.assign(n.ul.style, { left: x0.toFixed(2) + 'px', width: (x1 - x0).toFixed(2) + 'px' });
  }
  // right-anchor a positioned label at its current right edge
  function anchorRight(el) {
    const r = 1920 - (el.offsetLeft + el.offsetWidth);
    el.style.left = 'auto'; el.style.right = r.toFixed(1) + 'px';
  }
  // move a (left-positioned) label so the ink of its last letter ends at x
  function alignRight(el, x, str) {
    const s = (str || el.textContent).trim().toUpperCase(), last = s[s.length - 1];
    const lastStart = el.offsetWidth - met(SMALL_FONT, last).w + 0.88;      // offsetWidth carries the -0.88px tracking of the last letter
    el.style.left = (x - lastStart - inkRight(SMALL_FONT, last)).toFixed(1) + 'px';
  }

  // ---------- main-screen interactions (live only once the intro has finished) ----------
  function interactions(tl, H) {
    const ready = () => tl.progress() >= 1;
    const on = (el, evs, fn) => evs.split(' ').forEach(ev => el.addEventListener(ev, fn));

    // nav: turns green, flips to Japanese letter by letter, a brush underline is painted under it
    for (const n of H.nav) {
      on(n.a, 'pointerenter focus', () => {
        if (!ready()) return;
        n.a.classList.add('on');
        fitUnderline(n);
        swap(n.d, 'jp');
        gsap.fromTo(n.ul, { clipPath: 'inset(-2px 100% -2px 0%)' }, { clipPath: 'inset(-2px 0% -2px 0%)', duration: .55, delay: .1, ease: 'power2.out', overwrite: true });
      });
      on(n.a, 'pointerleave blur', () => {
        if (!ready() || !n.a.classList.contains('on')) return;
        n.a.classList.remove('on');
        swap(n.d, 'en');
        gsap.to(n.ul, { clipPath: 'inset(-2px 0% -2px 100%)', duration: .35, ease: 'power2.in', overwrite: true });
      });
    }

    // footer phrases: no hover (static after the hand-written intro)

    // buttons: magnetic pull towards the cursor, matcha (or milk, on the green one) pours in with a live
    // wave surface, the label flips to Japanese; on leave it drains and the button springs back
    // buttons: stay in place; on hover the outline fades and the liquid fills the whole pill, label → Japanese
    for (const b of H.btns) {
      on(b.a, 'pointerenter focus', () => {
        if (!ready()) return;
        b.a.classList.add('on');
        gsap.set(b.hov.parentNode, { visibility: 'visible' });
        gsap.to(b.hov, { yPercent: -18, duration: .75, ease: 'power2.out', overwrite: true });
        gsap.to(b.svg, { opacity: 0, duration: .35, ease: 'power1.out', overwrite: true });
        swap(b.d, 'jp');
      });
      on(b.a, 'pointerleave blur', () => {
        if (!ready() || !b.a.classList.contains('on')) return;
        b.a.classList.remove('on');
        gsap.to(b.hov, { yPercent: 125, duration: .6, ease: 'power2.in', overwrite: true,
          onComplete: () => { if (b.fill && !b.a.classList.contains('on')) gsap.set(b.hov.parentNode, { visibility: 'hidden' }); } });
        gsap.to(b.svg, { opacity: 1, duration: .4, delay: .25, ease: 'power1.in', overwrite: true });
        swap(b.d, 'en');
      });
    }

    // receipts: tilt towards the part under the cursor (3D), the soft shadow slides the other way; springs back on leave
    for (const f of [$('#fly1'), $('#fly2')]) {
      const soft = f.querySelectorAll('.soft');
      let q = null;
      // 3D only while hovered; at rest the receipt is a flat, crisp element again
      const follow = () => q || (gsap.killTweensOf(f, 'rotationX,rotationY,rotation'), gsap.killTweensOf(soft, 'x,y'), gsap.set(f, { transformPerspective: 1100, transformOrigin: '50% 50%' }), q = [
        gsap.quickTo(f, 'rotationX', { duration: .6, ease: 'power3.out' }), gsap.quickTo(f, 'rotationY', { duration: .6, ease: 'power3.out' }),
        gsap.quickTo(f, 'rotation', { duration: .8, ease: 'power3.out' }),
        gsap.quickTo(soft, 'x', { duration: .6, ease: 'power3.out' }), gsap.quickTo(soft, 'y', { duration: .6, ease: 'power3.out' })]);
      on(f, 'pointermove', (e) => {
        if (!ready()) return;
        const [rx, ry, rz, sx, sy] = follow();
        const r = f.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        rx(-py * 16); ry(px * 18); rz(px * 2.5); sx(-px * 16); sy(-py * 12 + 4);
      });
      on(f, 'pointerleave', () => {
        if (!ready()) return;
        q = null;
        gsap.to(f, { rotationX: 0, rotationY: 0, rotation: 0, duration: 1.1, ease: 'elastic.out(1,0.45)', overwrite: 'auto', onComplete: () => { if (!q) gsap.set(f, { clearProps: 'transform' }); } });
        gsap.to(soft, { x: 0, y: 0, duration: .8, ease: 'power3.out', overwrite: 'auto' });
      });
    }

    // AUTHENTIC JAPANESE GREEN TEA: every 5 s the words flip to Japanese, hold, and flip back
    let lang = 'en', next = 0;
    setInterval(() => {
      const now = performance.now();
      if (!ready()) { lang = 'en'; next = now + 5000; return; }
      if (now < next) return;
      lang = lang === 'en' ? 'jp' : 'en';
      H.labels.forEach((d, i) => setTimeout(() => { if (ready()) swap(d, lang); }, i * 110));
      next = now + (lang === 'jp' ? 2600 : 5000);
    }, 100);

    // a replay cancels every running flip; hover states are cleared
    // a replay or a scrub back cancels every running roll and returns all text to the intro's control
    const reset = () => {
      flipGen++;
      duals.forEach(d => { d.lang = 'en'; hideNow(d.J); });
      all.forEach(l => { l.live = false; l.anim = null; l.chars.forEach(c => { c.key = ''; }); });
      H.nav.forEach(n => n.a.classList.remove('on'));
      H.btns.forEach(b => { b.a.classList.remove('on'); if (b.fill) gsap.set(b.hov.parentNode, { visibility: 'hidden' }); });
      gsap.set(H.nav.map(n => n.ul), { clipPath: 'inset(-2px 100% -2px 0%)' });
      gsap.set([$('#fly1'), $('#fly2')], { rotationX: 0, rotationY: 0 });
    };
    tl.eventCallback('onStart', reset);
  }

  // ---------- hand-drawn cursor: an ordinary arrow drawn with a brush (black ink fill, cream brush edges) ----------
  (function cursor() {
    // arrow corners (tip first), 40×40 canvas, hotspot at the tip
    const P = [[5, 4], [5.6, 30], [12, 24], [16.6, 34.4], [21.6, 32.2], [17.2, 22.4], [26, 21.8]];
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 - .5;
    // each edge is its own brush stroke: slightly bowed, overshooting the corners a little
    const edge = (a, b, wob, over) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
      const s0 = [a[0] - ux * over * (.4 + rnd()), a[1] - uy * over * (.4 + rnd())];
      const s1 = [b[0] + ux * over * (.6 + rnd()), b[1] + uy * over * (.6 + rnd())];
      const m = [(a[0] + b[0]) / 2 + nx * wob * rnd() * 2, (a[1] + b[1]) / 2 + ny * wob * rnd() * 2];
      return `M${s0[0].toFixed(2)} ${s0[1].toFixed(2)} Q${m[0].toFixed(2)} ${m[1].toFixed(2)} ${s1[0].toFixed(2)} ${s1[1].toFixed(2)}`;
    };
    const ring = (pts) => pts.map((p, i) => [p, pts[(i + 1) % pts.length]]);
    const fillD = 'M' + P.map(([x, y]) => `${(x + .6 + rnd() * .5).toFixed(2)} ${(y + .5 + rnd() * .5).toFixed(2)}`).join(' L') + ' Z';
    const bold = ring(P).map(([a, b]) => edge(a, b, .7, 1.1)).join(' ');
    const thin = ring(P).map(([a, b]) => edge(a, b, 1.1, .6)).join(' ');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">`
      + `<path d="${fillD}" fill="#0b0a09"/>`
      + `<path d="${bold}" fill="none" stroke="#F6F3EA" stroke-width="2.3" stroke-linecap="round" stroke-dasharray="11 .7 5 1 17 .6"/>`
      + `<path d="${thin}" fill="none" stroke="#F6F3EA" stroke-width=".95" stroke-linecap="round" stroke-dasharray="4 1.6 9 2.2 2 1.4" opacity=".85"/>`
      + `<path d="M7.4 9 Q7.2 15 7.7 22 M9 21.5 L10.6 20.3" fill="none" stroke="#F6F3EA" stroke-width=".7" stroke-linecap="round" opacity=".45"/>`
      + `</svg>`;
    const cur = `url("data:image/svg+xml,${encodeURIComponent(svg)}") 5 4, auto`;
    const st = document.createElement('style');
    st.textContent = `html, body, body * { cursor: ${cur}; } a, a *, button, select, input, .flyer, .flyer * { cursor: ${cur.replace('auto', 'pointer')}; }`;
    document.head.appendChild(st);
    window.__cursorSVG = svg;
  })();

  // ---------- timeline ----------
  function build(ch, toss, pull, letters, labels, dxL, dxR, H) {
    const FLOOR = 1037;
    const SIT = { x: 960, y: 707 };
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    const writeKanji = writer($('#kanjiWrite'));
    const kanjiP = { p: 0 };
    const phases = [];
    const phase = (t, label) => phases.push([t, label]);
    const count = $('#count');
    const prog = { p: 0 };
    const setCount = () => { count.textContent = Math.round(prog.p) + '%'; };
    const loadTo = (v, at, d, ease = 'power2.inOut') => {
      tl.to(prog, { p: v, duration: d, ease, onUpdate: setCount }, at);
      tl.to('#progress', { scaleX: v / 100, duration: d, ease }, at);
    };
    const drawP = { p: 0 };
    const seatFx = { sx: 1, sy: 1 };

    // reset state
    tl.set(hero, { x: 1960, filter: 'none', willChange: 'auto' }, 0)
      .set('#mbHeroBlur', { attr: { stdDeviation: '0 0' } }, 0)
      .set('#sit', { autoAlpha: 1, rotation: 0, transformOrigin: '50% 100%' }, 0)
      .set(ch.fill, { autoAlpha: 0 }, 0)
      .set(drawP, { p: 0, onComplete: () => ch.draw(0) }, 0)
      .set('#seat', { autoAlpha: 0 }, 0)
      .set(seatFx, { sx: 1, sy: 1 }, 0)
      .set(count, { autoAlpha: 0, y: 40 }, 0)
      .set(kanjiP, { p: 0, onComplete: () => writeKanji(0) }, 0)
      .set('#track', { scaleX: 0 }, 0)
      .set('#progress', { scaleX: 0 }, 0)
      .set(prog, { p: 0, onComplete: setCount }, 0)
      .set(['#grpL', '#grpR'], { x: 0, filter: 'none', willChange: 'auto' }, 0)
      .set([...letters, ...H.letters].map(l => l.cell), { filter: 'none' }, 0)
      .set([...letters, ...H.letters].map(l => l.strip), { willChange: 'auto', filter: 'none' }, 0)
      .set(['#hgL', '#hgR'], { x: 0, filter: 'none' }, 0)
      .set(H.letters.map(l => l.strip), { y: 0 }, 0)
      .set(H.letters.map(l => l.cell), { autoAlpha: 0 }, 0)
      .set(H.letters.flatMap(l => l.jp), { autoAlpha: 1 }, 0)
      .set('#fly1', { autoAlpha: 0, y: -140, rotation: -4, clipPath: 'inset(-20px -20px 100% -20px)' }, 0)
      .set('#fly2', { autoAlpha: 0, x: 380, y: 60, rotation: 22 }, 0)
      .set('#uline', { clipPath: 'inset(-4px 100% -4px 0)' }, 0)
      .set(H.btns.map(b => b.pill), { attr: { 'stroke-dashoffset': 0 } }, 0)
      .set(H.btns.map(b => b.svg), { opacity: 0 }, 0)
      .set(H.btns.map(b => b.a), { x: 0, y: 0 }, 0)
      .set(H.btns.map(b => b.base).filter(Boolean), { yPercent: 105 }, 0)
      .set(H.btns.map(b => b.hov), { yPercent: 125 }, 0)
      .set(H.btns.filter(b => b.fill).map(b => b.hov.parentNode), { visibility: 'hidden' }, 0)
      .set('#bgv', { autoAlpha: 0 }, 0)
      .set(letters.map(l => l.strip), { y: 0 }, 0)
      .set(letters.map(l => l.cell), { autoAlpha: 0 }, 0)
      .set(letters.flatMap(l => l.jp), { autoAlpha: 1 }, 0)
      .set(actor, { x: SIT.x, y: SIT.y, filter: 'none' }, 0)
      .set(['#bowl', '#whisk', '#splash'], { autoAlpha: 0 }, 0)
      ;

    // on every (re)start the clip frames are decoded again in the background while the character is drawn
    // (a replay must not decode them in the middle of the logo spin)
    tl.call(() => { toss.prime(0, 66); pull.prime(0, 10); }, null, .05);

    // 1 — loading line, 0% and the counter starts moving right away
    phase(0, 'полоса и проценты');
    tl.to('#track', { scaleX: 1, duration: .6, ease: 'power3.inOut' }, .05)
      .to(count, { autoAlpha: 1, y: 0, duration: .5, ease: 'power3.out' }, .05)
      .to(kanjiP, { p: 1, duration: 1.6, ease: 'none', onUpdate: () => writeKanji(kanjiP.p) }, .15);
    loadTo(3, .15, .5);
    loadTo(6, .8, .9);
    loadTo(9, 1.9, .9);

    // 2 — the character is drawn with a brush, then the matcha fills in
    const T_DRAW = .45, DRAW_D = 2.0;
    phase(T_DRAW, 'рисуется кистью');
    tl.to(drawP, { p: 1, duration: DRAW_D, ease: 'power1.inOut', onUpdate: () => ch.draw(drawP.p) }, T_DRAW)
      .fromTo(ch.fill, { autoAlpha: 0 }, { autoAlpha: 1, duration: .35, ease: 'power2.out' }, T_DRAW + DRAW_D - .25);

    // 3 — logo letters spin in like reels: Japanese → Latin, fast then slow
    const T_LOGO = T_DRAW + DRAW_D - .55, SPIN = 1.5;
    phase(T_LOGO, 'собирается логотип');
    // Reels. Each letter's strip is its own GPU layer for the whole spin, and its motion blur is a CSS blur
    // on that layer, so the spin never re-paints anything: no SVG filter over the screen (that dropped the reel
    // to ~8 fps), and no switch from a filtered to a plain layer half-way through the landing (that was a hitch
    // at ~3 s). The slow expo landing glides in sub-pixel steps. Once landed, the strips are plain painted text
    // again, crisp at any window size.
    const spinReels = (list, t0) => {
      const strips = list.map(l => l.strip);
      tl.set(strips, { willChange: 'transform, filter' }, t0);
      list.forEach((l, i) => {
        const at = t0 + i * .09;
        tl.to(l.cell, { autoAlpha: 1, duration: .15 }, at)
          // during the slow landing the kanji above the letter must not peek out: hide the glyph rows
          // as soon as the Latin letter fills most of the cell (and bring them back when scrubbing back)
          .fromTo(l.strip, { y: 0 }, { y: -l.n * l.P, duration: SPIN, ease: 'expo.out', immediateRender: false }, at)
          .fromTo(l.strip, { filter: 'blur(5px)' }, { filter: 'blur(0px)', duration: SPIN * .55, ease: 'power2.out', immediateRender: false }, at)
          .set(l.jp, { autoAlpha: 0 }, at + SPIN);
      });
      tl.set(strips, { filter: 'none', willChange: 'auto' }, t0 + (list.length - 1) * .09 + SPIN + .02);
    };
    spinReels(letters, T_LOGO);
    const T_LOGO_END = T_LOGO + 5 * .09 + SPIN;
    // labels: letter by letter, each flips through kanji 5–7 times (50 ms apiece) and lands
    labels.forEach((l, i) => { l.t0 = T_LOGO + .35 + i * .1; });

    // 4 — whisking (clip frames 1–36) right after the drawing, then the toss + stand-up (frames 37–97), 30 fps.
    //     Clip frame 1 is the drawn character itself, so the hand-over from the SVG is invisible.
    const FPS = 30, WHISK_N = 36;
    const T_WHISK = T_DRAW + DRAW_D + .12;
    tl.set('#sit', { autoAlpha: 0 }, T_WHISK);
    clipSeg(T_WHISK, T_WHISK + WHISK_N / FPS, toss, 0, WHISK_N - 1);
    const T_TOSS = T_WHISK + WHISK_N / FPS;
    phase(T_TOSS, 'бросает матчу и встаёт');
    const TOSS_D = (toss.meta.count - WHISK_N) / FPS;
    clipSeg(T_TOSS, T_TOSS + TOSS_D, toss, WHISK_N, toss.meta.count - 1);
    loadTo(12, T_WHISK, .8);
    loadTo(16, T_TOSS + .3, 1.3);

    // Hand-overs between the sprite sheets and the video clips are matched on the HEAD position
    // (measured from the frames' alpha): x of the head relative to the sprite's anchor / the clip box.
    const HEAD = { run: 7.4, run3: 7.7, pull2: -273.8, wipe: 5.9, rope0: 304.7, ropeEnd: 74.5 };

    // jumps out of the logo → the logo closes up into MIYAKO
    const T_HOP = T_TOSS + TOSS_D, HOP_D = .4;
    phase(T_HOP, 'выпрыгивает, логотип сжимается');
    seg(T_HOP, T_HOP + HOP_D, 'run', [2, 3, 4, 5, 0], 14);
    tl.to(actor, { x: SIT.x + 60, duration: HOP_D, ease: 'power1.out' }, T_HOP)
      .to(actor, { y: SIT.y - 60, duration: HOP_D * .35, ease: 'sine.out' }, T_HOP)
      .to(actor, { y: FLOOR, duration: HOP_D * .65, ease: 'power2.in' }, T_HOP + HOP_D * .35);
    const logoCells = letters.map(l => l.cell);
    tl.set(logoCells, { filter: 'url(#mbLogo)' }, T_HOP + .1)
      .set(['#grpL', '#grpR'], { willChange: 'transform' }, T_HOP)
      .to('#grpL', { x: dxL, duration: .55, ease: 'power3.inOut' }, T_HOP + .1)
      .to('#grpR', { x: dxR, duration: .55, ease: 'power3.inOut' }, T_HOP + .1)
      .fromTo('#mbLogoBlur', { attr: { stdDeviation: '0 0' } }, { attr: { stdDeviation: '10 0' }, duration: .27, ease: 'power2.in', yoyo: true, repeat: 1, immediateRender: false }, T_HOP + .1)
      .set(logoCells, { filter: 'none' }, T_HOP + .66)
      .set(['#grpL', '#grpR'], { willChange: 'auto' }, T_HOP + .68);

    // runs to the right and stops exactly where his head is in the first rope frame
    const EDGE0 = 1900;
    const ROPE_HEAD = EDGE0 + pull.meta.box.left + HEAD.rope0;
    const T_RUN = T_HOP + HOP_D, RUN_D = .75, RUN_END = ROPE_HEAD - HEAD.run;
    phase(T_RUN, 'бежит');
    seg(T_RUN, T_RUN + RUN_D, 'run', [0, 1, 2, 3, 4, 5], 14);
    tl.to(actor, { x: RUN_END, duration: RUN_D, ease: 'power1.inOut' }, T_RUN);
    loadTo(31, T_RUN, RUN_D, 'power1.inOut');

    // the screen edge cracks in as he arrives; he grabs the rope (first clip frame, held)
    const T_REACH = T_RUN + RUN_D;
    phase(T_REACH, 'хватается за край');
    // while the screen is being dragged it is its own GPU layer (moves without re-painting 1920×1080 each frame);
    // the hint is dropped once it has landed, so the text is re-rasterised crisp
    tl.set(hero, { willChange: 'transform' }, T_REACH - .3);
    tl.fromTo(hero, { x: 1960 }, { x: EDGE0 + 14, duration: .14, ease: 'power2.out', immediateRender: false }, T_REACH - .22)
      .to(hero, { x: EDGE0, duration: .16, ease: 'elastic.out(1,0.4)' }, T_REACH - .08);
    loadTo(36, T_REACH, .45);

    // strains: 97-frame clip at 30 fps. The rope's end is glued to the screen edge; he backs off
    // while the screen gives in jerks and loading crawls to 99.
    const PULL_FPS = 30, K = 24 / PULL_FPS;
    const T_PULL = T_REACH + .25, PULL_D = pull.meta.count / PULL_FPS;
    clipSeg(T_REACH, T_PULL, pull, 0, 0);
    phase(T_PULL, 'тянет изо всех сил');
    clipSeg(T_PULL, T_PULL + PULL_D, pull);
    const steps = [[1880, .5, 'power2.out'], [1880, .35], [1840, .55, 'power3.out'], [1840, .4], [1800, .6, 'power2.out'], [1800, .35], [1750, .7, 'power3.out'], [1750, .59]];
    let t = T_PULL;
    for (const [xx, d, ease] of steps) { tl.to(hero, { x: xx, duration: d * K, ease: ease || 'none' }, t); t += d * K; }
    const pl = [[52, .7], [58, .45], [73, .8], [77, .55], [90, .8], [99, .74]];
    t = T_PULL; for (const [v, d] of pl) { loadTo(v, t, d * K); t += d * K; }
    const HEAD_END = 1750 + pull.meta.box.left + HEAD.ropeEnd;    // his head in the last rope frame

    // 100% — the main screen bursts out and flies to the left with motion blur
    const T_BURST = T_PULL + PULL_D;
    phase(T_BURST, '100% — экран вылетает');
    loadTo(100, T_BURST - .1, .15, 'power1.out');
    tl.to(count, { scale: 1.08, duration: .1, yoyo: true, repeat: 1, transformOrigin: '0 100%' }, T_BURST);
    tl.set(hero, { filter: 'url(#mbHero)' }, T_BURST)
      .to(hero, { x: 0, duration: .55, ease: 'expo.out' }, T_BURST)
      .fromTo('#mbHeroBlur', { attr: { stdDeviation: '90 0' } }, { attr: { stdDeviation: '0 0' }, duration: .55, ease: 'power3.out' }, T_BURST)
      .set(hero, { filter: 'none', willChange: 'auto' }, T_BURST + .57)
      // while the screen is dragged and flies in, the still frame (one layer with the shade + noise) is shown;
      // the live video fades in only once the screen has settled — nothing can slide apart
      .to('#bgv', { autoAlpha: 1, duration: .9, ease: 'power1.inOut' }, T_BURST + .65);
    // no pause after the yank: the moment the screen is out he springs from the rope pose straight into
    // his seat in the logo (head continues from the last rope frame). The landing spot is where the seated
    // whisking pose sits on the main screen (head x 948, lowest point y 631), so the pose change happens in place.
    const SEAT = { x: 948.3 - HEAD.run3, y: 630.6 };
    const T_JUMP = T_BURST, JUMP_D = .62;
    phase(T_JUMP, 'прыгает на место');
    seg(T_JUMP, T_JUMP + JUMP_D, 'run', 3);
    tl.set(actor, { x: HEAD_END - HEAD.run3, y: FLOOR }, T_JUMP);
    tl.to(actor, { x: SEAT.x, duration: JUMP_D, ease: 'power1.inOut' }, T_JUMP)
      .to(actor, { y: SEAT.y - 150, duration: JUMP_D * .52, ease: 'power2.out' }, T_JUMP)
      .to(actor, { y: SEAT.y, duration: JUMP_D * .48, ease: 'power2.in' }, T_JUMP + JUMP_D * .52);

    // lands and whisks exactly like on the loader (30 fps, quick strokes): two runs of the 4-stroke
    // cycle (frames 5–20, wraps without a jump), a short rest, and again — endlessly
    const T_LAND = T_JUMP + JUMP_D;
    const WHISK = Array.from({ length: 16 }, (_, i) => 4 + i);
    clipCycle(T_LAND, toss, [...WHISK, ...WHISK], 30, .65, 4);
    // a soft landing: a light squash that settles without wobbling
    tl.set(seatFx, { sx: 1.04, sy: .94 }, T_LAND)
      .to(seatFx, { sx: 1, sy: 1, duration: .45, ease: 'power3.out' }, T_LAND);

    phase(T_LAND, 'первый экран');
    // ===== main screen intro =====
    // the whole screen starts while he is still in the air — no waiting for the landing
    const T_MAIN = T_BURST + .12;
    // 1) MIY / AKO spin in like reels and the labels flip in letter by letter — exactly as on the loader
    const T_HLOGO = T_MAIN;
    spinReels(H.letters, T_HLOGO);
    H.labels.forEach((d, i) => { d.E.t0 = T_HLOGO + .35 + i * .1; });

    // 2) all the small copy, letter by letter through kanji (top-left first, then down and across)
    const T_SMALL = T_MAIN + .2;
    phase(T_SMALL, 'мелкий текст');
    H.nav.forEach((n, i) => { n.l.t0 = T_SMALL + i * .1; });
    // hand-written: the left column top to bottom, then the addresses, then the footer
    const hwDur = (o) => Math.max(.55, Math.min(1.5, .3 + .05 * o.n));
    H.hw.forEach((o, i) => {
      const k = H.vert.includes(o.lbl) ? i : H.addr.includes(o.lbl) ? i - H.vert.length : i - H.vert.length - H.addr.length;
      const base = H.vert.includes(o.lbl) ? T_SMALL : H.addr.includes(o.lbl) ? T_SMALL + .15 : T_SMALL + .45;
      o.w0 = base + k * (H.vert.includes(o.lbl) ? .08 : .14);
      o.lbl.t0 = o.w0 + hwDur(o);
    });

    // 3) "sorry coffe…" + its brush underline, the kanji at the top are written stroke by stroke,
    //    the pagination squares are drawn in white, then the first one turns green and gets scribbled in
    const T_SORRY = T_SMALL + .25;
    phase(T_SORRY, 'подчёркивание, 抹茶, пагинация');
    const swP = { p: 0 };
    tl.to(swP, { p: 1, duration: 1.0, ease: 'none', onUpdate: () => H.writeSorry(swP.p) }, T_SORRY);
    H.writeSorry(0);
    const ulP = { p: 0 };
    const setUl = () => { $('#uline').style.clipPath = ulP.p >= 1 ? 'none' : `inset(-4px ${(100 - ulP.p * 100).toFixed(2)}% -4px 0)`; };
    tl.to(ulP, { p: 1, duration: .5, ease: 'power2.inOut', onUpdate: setUl }, T_SORRY + .85);
    const writeHK = writer(H.hk);
    const hkP = { p: 0 };
    tl.to(hkP, { p: 1, duration: .9, ease: 'none', onUpdate: () => writeHK(hkP.p) }, T_SORRY);
    const sqs = [...document.querySelectorAll('#icons .sq')], sqg = $('#icons .sqg'), scr = [...document.querySelectorAll('#icons .scrib')];
    const mask = (el, m) => { el.style.webkitMaskImage = el.style.maskImage = m; };
    const IC = { sq: sqs.map(() => ({ p: 0 })), g: 0, sc: scr.map(() => ({ p: 0 })) };
    const renderIcons = () => {
      sqs.forEach((el, i) => { const a = IC.sq[i].p * 360; mask(el, a >= 360 ? 'none' : `conic-gradient(from -45deg, #000 ${a}deg, transparent ${a}deg)`); });
      sqg.style.opacity = IC.g;
      scr.forEach((el, i) => { const p = IC.sc[i].p * 100; el.style.opacity = p > 0 ? 1 : 0; mask(el, p >= 100 ? 'none' : `linear-gradient(160deg, #000 ${p}%, transparent ${p}%)`); });
    };
    sqs.forEach((_, i) => tl.to(IC.sq[i], { p: 1, duration: .32, ease: 'power1.inOut', onUpdate: renderIcons }, T_SORRY + .05 + i * .09));
    renderIcons(); writeHK(0);
    const T_GREEN = T_SORRY + .05 + 5 * .09 + .4;
    tl.to(IC, { g: 1, duration: .25, ease: 'power1.out', onUpdate: renderIcons }, T_GREEN);
    scr.forEach((_, i) => tl.to(IC.sc[i], { p: 1, duration: .14, ease: 'power1.in', onUpdate: renderIcons }, T_GREEN + .1 + i * .08));

    // 4) receipts: the straight one is printed down from the top edge, the tilted one is slapped on from the right
    const T_FLY = T_SORRY;
    phase(T_FLY, 'чеки');
    const flyP = { p: 0 };
    tl.to(flyP, { p: 1, duration: 1.1, ease: 'power3.out', onUpdate: () => { $('#fly1').style.clipPath = flyP.p >= 1 ? 'none' : `inset(-20px -20px ${(100 - flyP.p * 100).toFixed(2)}% -20px)`; } }, T_FLY)
      .fromTo('#fly1', { autoAlpha: 1, y: -140, rotation: -4 }, { y: 0, rotation: 0, duration: 1.2, ease: 'power3.out', immediateRender: false }, T_FLY)
      .fromTo('#fly2', { autoAlpha: 0, x: 380, y: 60, rotation: 22 }, { autoAlpha: 1, x: 0, y: 0, rotation: 0, duration: 1.05, ease: 'back.out(1.5)', immediateRender: false }, T_FLY + .35);

    // 5) buttons appear the way they react to hover: a liquid wave rises inside the pill.
    //    SEE CATALOG fills with matcha and stays; ARRANGE DELIVERY fills, then drains and leaves its outline.
    const T_BTN = T_SORRY + .25;
    phase(T_BTN, 'кнопки');
    H.btns.forEach((b, i) => {
      const at = T_BTN + i * .16;
      if (b.fill) {
        tl.fromTo(b.base, { yPercent: 105 }, { yPercent: -18, duration: .95, ease: 'power2.out', immediateRender: false }, at)
          .fromTo(b.svg, { opacity: 0 }, { opacity: 1, duration: .3, immediateRender: false }, at + .75);
        b.l.t0 = at + .25;
      } else {
        tl.fromTo(b.hov, { yPercent: 125 }, { yPercent: -18, duration: .7, ease: 'power2.out', immediateRender: false }, at)
          .fromTo(b.a, { color: '#242A24' }, { color: '#C5E45A', duration: .4, ease: 'power1.inOut', immediateRender: false }, at + .95)
          .to(b.hov, { yPercent: 125, duration: .7, ease: 'power2.in' }, at + .8)
          .fromTo(b.svg, { opacity: 0 }, { opacity: 1, duration: .45, ease: 'power1.out', immediateRender: false }, at + 1.0)
          .set(b.a, { clearProps: 'color' }, at + 1.4);
        b.l.t0 = at + .2;
      }
    });
    const T_END = T_BTN + 1.5;
    tl.to({}, { duration: .01 }, T_END);

    // clip box placement: loader seat → main-screen seat (+ landing squash about his feet)
    const B = toss.meta.box;
    const sc = 350 / 338, dx = 787 - B.left - sc * (791 - B.left), dy = 301 - B.top - sc * (365 - B.top);
    const fx = SIT.x - B.left, fy = SIT.y - B.top;
    let seated = null;
    function placeToss(t) {
      const on = t >= T_LAND;
      if (on === seated && !on) return;
      seated = on;
      toss.box.style.transformOrigin = '0 0';
      toss.box.style.transform = on
        ? `translate(${dx}px,${dy}px) scale(${sc}) translate(${fx}px,${fy}px) scale(${seatFx.sx},${seatFx.sy}) translate(${-fx}px,${-fy}px)`
        : '';
    }

    // ---------- drive: one render per animation frame (the whisk loop keeps running after the timeline ends) ----------
    function render(now) {
      renderFrame(now);
      placeToss(now);
      renderClips(now);
      for (const l of labels) renderScramble(l, now);
      for (const d of H.labels) renderScramble(d.E, now);
      for (const l of H.small) renderScramble(l, now);
      for (const b of H.btns) renderScramble(b.l, now);
      for (const o of H.hw) o.render(now);
    }
    window.__render = render;
    gsap.ticker.add(() => render(tl.time()));
    tl.eventCallback('onUpdate', () => render(tl.time()));
    interactions(tl, H);
    window.__tl = tl; window.__H = H;
    tl.progress(0);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) tl.progress(1); else tl.play(0);
  }

  init();
})();
