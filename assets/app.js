/* Excel for Finance: app runtime. Reads window.Course and renders every page client-side.
   Routes are plain hashes: #today, #lessons, #w1 (week), #w1-l6 (lesson), #reference, #ref-shortcuts, #search. */
(function () {
  "use strict";
  var C = window.Course, XL = window.XL;
  if (!C || !XL) { document.body.innerHTML = "<p style='padding:24px;font-family:system-ui'>The course files didn't load. Keep the assets and content folders next to index.html.</p>"; return; }

  /* ================= Helpers ================= */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function strip(h) { return String(h || "").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " ").trim(); }
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function dateOf(iso) { return new Date(iso + "T12:00:00"); }
  function longDate(iso) { var d = dateOf(iso); return DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()]; }
  function shortDate(iso) { var d = dateOf(iso); return DAYS[d.getDay()].slice(0, 3) + " " + d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3); }
  function todayISO() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var compactMQ = window.matchMedia("(max-width: 1023px)");

  /* ================= Symbols (own drawings in the SF grammar: 24 grid, round caps) ================= */
  var SYM = {
    sidebar: '<rect x="3" y="4.5" width="18" height="15" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9.5 4.5v15M5.6 8.5h1.6M5.6 11h1.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    left: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    right: '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    chev: '<path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    check: '<path d="M6 12.5l4 4 8-8.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    xmark: '<path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5l5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    calendar: '<path fill="currentColor" d="M7 3.5a1 1 0 0 1 2 0V5h6V3.5a1 1 0 1 1 2 0V5h1a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h1zm-2 7.5v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7z"/>',
    book: '<path fill="currentColor" d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H7.5a.5.5 0 0 0 0 1H19a1 1 0 1 1 0 2H7.5A2.5 2.5 0 0 1 5 19.5z"/>',
    lessons: '<path fill="currentColor" d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5zM8 8a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2zm0 4a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2zm0 4a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2z"/>',
    clock: '<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M12 7v5l3.2 2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    table: '<rect x="3.5" y="4.5" width="17" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M3.5 9.5h17M9.5 9.5v10" stroke="currentColor" stroke-width="1.9"/>',
    tableFill: '<path fill="currentColor" d="M6.5 4h11A3.5 3.5 0 0 1 21 7.5v1H3v-1A3.5 3.5 0 0 1 6.5 4zM3 10.5h5V20h-1.5A3.5 3.5 0 0 1 3 16.5zm7 0h11v6a3.5 3.5 0 0 1-3.5 3.5H10z"/>',
    checklist: '<path d="M9 6.5h11M9 12h11M9 17.5h11" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M3.8 6.4l1 1 1.9-2M3.8 11.9l1 1 1.9-2M3.8 17.4l1 1 1.9-2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    bulb: '<path fill="currentColor" d="M9 21h6v-1.6H9zm3-19a7 7 0 0 0-4 12.8V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.2A7 7 0 0 0 12 2z"/>',
    info: '<path fill="currentColor" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 8a1.2 1.2 0 0 0-1.2 1.2v5.2a1.2 1.2 0 0 0 2.4 0v-5.2A1.2 1.2 0 0 0 12 10zm0-4.2a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/>',
    infoPlain: '<path fill="currentColor" d="M11 10.5h2V17h-2zm1-4a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6z"/>',
    warn: '<path fill="currentColor" d="M10.3 3.6a2 2 0 0 1 3.4 0l8 13.8A2 2 0 0 1 20 20.4H4a2 2 0 0 1-1.7-3zM12 8.5a1.1 1.1 0 0 0-1.1 1.1v4.2a1.1 1.1 0 0 0 2.2 0V9.6A1.1 1.1 0 0 0 12 8.5zm0 7.4a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/>',
    chart: '<path d="M4 4v16h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 15l3.5-4.5 3 2.5L20 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    appearance: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/>',
    sun: '<circle cx="12" cy="12" r="4.2" fill="currentColor"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    moon: '<path fill="currentColor" d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a.6.6 0 0 0-.8-.7A9.6 9.6 0 1 0 21.2 15.4a.6.6 0 0 0-.7-.8z"/>',
    download: '<path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5M5 19.5h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    copy: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15.5 8.5V6.6A2.6 2.6 0 0 0 12.9 4H6.6A2.6 2.6 0 0 0 4 6.6v6.3a2.6 2.6 0 0 0 2.6 2.6h1.9" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4.5 4.5v4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
    keyboard: '<rect x="2" y="6" width="20" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M7 14h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    flag: '<path fill="currentColor" d="M5 21a1 1 0 0 1-1-1V4.5a1 1 0 0 1 .6-.9C6 3 7.7 3 9.5 3.7c1.7.7 3.2.9 5 .2a1 1 0 0 1 1.5.9v8.4a1 1 0 0 1-.6.9c-1.9.8-3.7.6-5.7-.1-1.4-.5-2.6-.6-3.7-.2V20a1 1 0 0 1-1 1z"/>',
    case: '<path fill="currentColor" d="M9 3.5h6A2.5 2.5 0 0 1 17.5 6v1H20a2 2 0 0 1 2 2v3.3a2 2 0 0 1-1.3 1.9L14 16.5v-.5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.5l-6.7-2.3A2 2 0 0 1 2 12.3V9a2 2 0 0 1 2-2h2.5V6A2.5 2.5 0 0 1 9 3.5zm0 2a.5.5 0 0 0-.5.5v1h7V6a.5.5 0 0 0-.5-.5zM2 15.4l8 2.6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1l8-2.6V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>',
    play: '<path fill="currentColor" d="M8 5.2v13.6a1 1 0 0 0 1.5.9l11-6.8a1 1 0 0 0 0-1.8l-11-6.8A1 1 0 0 0 8 5.2z"/>',
    pencil: '<path fill="currentColor" d="M16.2 3.6a2.2 2.2 0 0 1 3.1 0l1.1 1.1a2.2 2.2 0 0 1 0 3.1L9.2 19 4 20.5a.5.5 0 0 1-.6-.6L5 14.8z"/>',
    sparkle: '<path fill="currentColor" d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9-1.9 5.6-1.9-5.6L4.5 10l5.6-1.9z"/>',
    fx: '<path d="M9.5 20c2 0 2.5-1.6 3-4.5l1.5-9c.4-2.3 1-3.5 3-3.5M8.5 9.5h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    lockFill: '<path fill="currentColor" d="M7 10V7.5a5 5 0 0 1 10 0V10h.5A2.5 2.5 0 0 1 20 12.5v7A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5v-7A2.5 2.5 0 0 1 6.5 10zm2 0h6V7.5a3 3 0 0 0-6 0z"/>',
    target: '<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
    quiz: '<path fill="currentColor" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 14.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zM12 5.8a3.8 3.8 0 0 0-3.8 3.5 1.1 1.1 0 0 0 2.2.2 1.6 1.6 0 1 1 2.3 1.5c-1 .5-1.8 1.4-1.8 2.6v.4a1.1 1.1 0 0 0 2.2 0v-.4c0-.3.2-.6.6-.7A3.8 3.8 0 0 0 12 5.8z"/>',
    layers: '<path fill="currentColor" d="M11.3 3.2a1.6 1.6 0 0 1 1.4 0l8.1 4.1a.9.9 0 0 1 0 1.6l-8.1 4.1a1.6 1.6 0 0 1-1.4 0L3.2 8.9a.9.9 0 0 1 0-1.6zM4.9 11.7l6 3a2.4 2.4 0 0 0 2.2 0l6-3 1.7.9a.9.9 0 0 1 0 1.6l-8.1 4.1a1.6 1.6 0 0 1-1.4 0l-8.1-4.1a.9.9 0 0 1 0-1.6z"/>',
    house: '<path fill="currentColor" d="M11.3 3.3a1.1 1.1 0 0 1 1.4 0l8 6.5a1 1 0 0 1-1.3 1.6l-.4-.3V19a2 2 0 0 1-2 2h-2.5v-5a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v5H7a2 2 0 0 1-2-2v-7.9l-.4.3a1 1 0 0 1-1.3-1.6z"/>'
  };
  function sym(name, cls, label) {
    return '<svg class="sym ' + (cls || "") + '" viewBox="0 0 24 24" ' + (label ? 'role="img" aria-label="' + esc(label) + '"' : 'aria-hidden="true"') + ">" + (SYM[name] || "") + "</svg>";
  }
  function doneMark(size) { var s = size || 22; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" role="img" aria-label="Done"><circle cx="12" cy="12" r="10" fill="var(--green)"/><path d="M7.5 12.3l3 3 6-6.3" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
  function wrongMark(size) { var s = size || 22; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" role="img" aria-label="Wrong"><circle cx="12" cy="12" r="10" fill="var(--red)"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/></svg>'; }
  function todoMark(size) { var s = size || 20; return '<svg class="st-todo-svg" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" role="img" aria-label="Not started"><circle class="st-todo" cx="12" cy="12" r="9" fill="none" stroke="var(--label-3)" stroke-width="1.8"/></svg>'; }
  function currentMark(size) { var s = size || 20; return '<svg class="st-ring" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" role="img" aria-label="In progress"><circle cx="12" cy="12" r="9" fill="none" stroke="var(--fill-3)" stroke-width="2.6"/><circle cx="12" cy="12" r="9" fill="none" stroke="var(--tint-glyph)" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="14 56.5" transform="rotate(-90 12 12)"/></svg>'; }
  function infoMark(color) { return '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style="flex:none"><circle cx="12" cy="12" r="10" fill="' + (color || "var(--blue)") + '"/><path d="M12 11v6M12 7.5h.01" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/></svg>'; }
  function warnMark() { return '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style="flex:none"><path d="M10.3 3.6a2 2 0 0 1 3.4 0l8 13.8A2 2 0 0 1 20 20.4H4a2 2 0 0 1-1.7-3z" fill="var(--orange)"/><path d="M12 9v4.5M12 17h.01" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/></svg>'; }
  function bulbMark() { return '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style="flex:none"><circle cx="12" cy="12" r="10" fill="var(--orange)"/><path fill="#fff" d="M10.4 17.6h3.2v-1h-3.2zM12 6.2a3.9 3.9 0 0 0-2.3 7.1v1.4c0 .3.3.6.6.6h3.4c.3 0 .6-.3.6-.6v-1.4A3.9 3.9 0 0 0 12 6.2z"/></svg>'; }
  function ring(size, stroke, pct, color, inner) {
    var r = (size - stroke) / 2, c = 2 * Math.PI * r, d = Math.max(0.001, c * Math.min(1, pct));
    return '<div class="ring" style="width:' + size + 'px;height:' + size + 'px"><svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + " " + size + '" aria-hidden="true"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--fill-2)" stroke-width="' + stroke + '"/><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + (color || "var(--green)") + '" stroke-width="' + stroke + '" stroke-linecap="round" stroke-dasharray="' + d.toFixed(1) + " " + c.toFixed(1) + '" transform="rotate(-90 ' + size / 2 + " " + size / 2 + ')"/></svg>' + (inner || "") + "</div>";
  }
  var TONES = ["var(--gray)", "var(--blue)", "var(--indigo)", "var(--orange)", "var(--green)", "var(--teal)", "var(--purple)"];
  function groupTone(g) { return g.portfolio ? "var(--purple)" : TONES[(g.session == null ? 1 : g.session) % TONES.length]; }
  function groupGlyph(g) { if (g.session === 0) return sym("play"); if (g.session === 4) return sym("flag"); if (g.portfolio) return sym("case"); return esc(String(g.session || "")); }

  /* ================= Storage ================= */
  var KEY = (C.storageKey || "eff") + ".v2";
  var S = { done: {}, items: {}, steps: {}, sheets: {}, quiz: {}, tips: {}, last: null, os: null, sideHidden: false, open: {} };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved && typeof saved === "object") Object.keys(S).forEach(function (k) { if (saved[k] !== undefined) S[k] = saved[k]; }); } catch (e) {}
  if (!S.os) S.os = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "mac" : "win";
  var saveT = null;
  function save() { clearTimeout(saveT); saveT = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }, 120); }

  /* ================= Course model ================= */
  var WEEKS = (C.weeks || []).map(function (w) {
    var data = C.content && C.content[w.n], lessons = [];
    if (data) data.groups.forEach(function (g) { g.lessons.forEach(function (l) { l.week = w.n; l.group = g; lessons.push(l); }); });
    return { meta: w, data: data, lessons: lessons, open: !!data };
  });
  var LESSONS = [];
  WEEKS.forEach(function (w) { w.lessons.forEach(function (l) { LESSONS.push(l); }); });
  var BY_ID = {};
  LESSONS.forEach(function (l, i) { l.index = i; BY_ID[l.id] = l; });
  var FN_CARDS = {}, FN_LIST = [];
  LESSONS.forEach(function (l) { (l.blocks || []).forEach(function (b) { if (b.type === "fn" && !FN_CARDS[b.name]) { FN_CARDS[b.name] = { block: b, lesson: l }; FN_LIST.push(FN_CARDS[b.name]); } }); });
  FN_LIST.sort(function (a, c) { return a.block.name < c.block.name ? -1 : 1; });
  var pendingFn = null;
  var REFS = C.reference || [];
  REFS.forEach(function (r) { r.isRef = true; BY_ID[r.id] = r; });
  function weekOf(n) { return WEEKS.filter(function (w) { return w.meta.n === n; })[0]; }
  function trackables(l) {
    var out = [];
    (l.blocks || []).forEach(function (b) {
      if (b.type === "steps" || b.type === "quiz" || b.type === "checklist") out.push(b.id);
      if (b.type === "sheet" && b.check) out.push(b.id);
      if (b.type === "widget" && b.name === "colours") out.push(b.id);
    });
    return out;
  }
  function lessonStats(l) { var t = trackables(l); return { total: t.length, done: t.filter(function (id) { return S.items[id]; }).length }; }
  function weekStats(w) { var d = w.lessons.filter(function (l) { return S.done[l.id]; }).length; return { done: d, total: w.lessons.length, pct: w.lessons.length ? d / w.lessons.length : 0 }; }
  function courseStats() { var d = LESSONS.filter(function (l) { return S.done[l.id]; }).length; return { done: d, total: LESSONS.length, pct: LESSONS.length ? d / LESSONS.length : 0 }; }
  function nextUp() {
    if (S.last && BY_ID[S.last] && !BY_ID[S.last].isRef && !S.done[S.last]) return BY_ID[S.last];
    for (var i = 0; i < LESSONS.length; i++) if (!S.done[LESSONS[i].id]) return LESSONS[i];
    return LESSONS[LESSONS.length - 1];
  }
  function lessonLabel(l) { return l.num ? "Lesson " + l.num.replace(/^L/, "") + " of " + LESSONS.filter(function (x) { return x.week === l.week && x.num; }).length : l.type === "Homework" ? "Homework" : l.type === "Quiz" ? "Review" : "Before you start"; }
  function itemDone(id) {
    if (!id || S.items[id]) return;
    S.items[id] = true; save();
    var l = currentLesson;
    if (l && !S.done[l.id]) { var st = lessonStats(l); if (st.total && st.done === st.total) markComplete(l, true); }
    refreshProgress();
  }
  function markComplete(l, auto) {
    S.done[l.id] = true; save();
    hud(auto ? "Lesson complete" : "Marked as complete");
    if (currentLesson === l) renderFinish();
    refreshProgress();
  }

  /* ================= Shell ================= */
  var app = $("#app");
  app.className = "app" + (S.sideHidden ? " side-hidden" : "");
  app.innerHTML =
    '<aside class="sidebar glass" id="sidebar" aria-label="Course"></aside>' +
    '<div class="main" id="main">' +
      '<header class="toolbar" id="toolbar">' +
        '<div class="capsule glass" id="navCapsule">' +
          '<button class="icon-btn side-toggle" id="sideToggle">' + sym("sidebar") + "</button>" +
          '<a class="icon-btn" id="prevBtn" aria-label="Previous lesson">' + sym("left") + "</a>" +
          '<a class="icon-btn" id="nextBtn" aria-label="Next lesson">' + sym("right") + "</a>" +
        "</div>" +
        '<span class="crumb" id="crumb"></span>' +
        '<span class="inline-title glass" id="inlineTitle" aria-hidden="true"></span>' +
        '<span class="spacer"></span>' +
        '<div class="capsule glass">' +
          '<button class="icon-btn" id="themeBtn"></button>' +
          '<a class="ring-btn" id="ringBtn" href="#today"></a>' +
        "</div>" +
      "</header>" +
      '<main id="page" class="page" tabindex="-1"></main>' +
    "</div>" +
    '<div class="tabbar" id="tabbar"><nav class="glass" aria-label="Sections">' +
      '<a class="tab" data-tab="today" href="#today">' + sym("calendar") + "Today</a>" +
      '<a class="tab" data-tab="lessons" href="#lessons">' + sym("lessons") + "Lessons</a>" +
      '<a class="tab" data-tab="reference" href="#reference">' + sym("book") + "Reference</a>" +
    '</nav><a class="tab-search glass" data-tab="search" href="#search" aria-label="Search">' + sym("search") + "</a></div>" +
    '<div class="sheet-scrim" id="sheetScrim"></div>' +
    '<section class="sheet" id="sheet" role="dialog" aria-modal="false" aria-label="Try it"><button class="grabber" id="grabber" aria-label="Resize sheet"><span></span></button><button class="icon-btn sheet-close" id="sheetClose" aria-label="Close">' + sym("xmark", "s") + '</button><div class="sheet-body" id="sheetBody"></div></section>' +
    '<div class="hud glass" id="hud" role="status" aria-live="polite"></div>';

  var sidebar = $("#sidebar"), page = $("#page"), toolbar = $("#toolbar");
  var currentLesson = null, currentRoute = null, lastIndex = -1;

  /* ----- HUD ----- */
  var hudT = null;
  function hud(text) { var h = $("#hud"); h.innerHTML = doneMark(22) + "<span>" + esc(text) + "</span>"; h.classList.add("show"); clearTimeout(hudT); hudT = setTimeout(function () { h.classList.remove("show"); }, 2400); }

  /* ----- Appearance ----- */
  /* Appearance: one setting for the whole site (key "hyperlite.theme"). No saved choice means follow the system. */
  var THEME_KEY = "hyperlite.theme", darkMQ = window.matchMedia("(prefers-color-scheme: dark)"), ownTheme = false;
  function themePref() { try { var t = localStorage.getItem(THEME_KEY); return t === "light" || t === "dark" ? t : null; } catch (e) { return null; } }
  function themeNow() { return themePref() || (darkMQ.matches ? "dark" : "light"); }
  function applyTheme() {
    var root = document.documentElement, pref = themePref();
    if (pref) { root.setAttribute("data-theme", pref); ownTheme = true; }
    else if (ownTheme || root.getAttribute("data-theme")) { root.removeAttribute("data-theme"); ownTheme = false; }
    var now = themeNow(), other = now === "dark" ? "Light" : "Dark", b = $("#themeBtn");
    b.innerHTML = sym(now === "dark" ? "moon" : "sun");
    b.setAttribute("aria-label", "Appearance: " + (now === "dark" ? "Dark" : "Light") + ". Switch to " + other); b.title = "Switch to " + other;
  }
  $("#themeBtn").addEventListener("click", function () {
    var next = themeNow() === "dark" ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    applyTheme(); hud(next === "dark" ? "Dark appearance" : "Light appearance");
  });
  if (darkMQ.addEventListener) darkMQ.addEventListener("change", applyTheme);
  window.addEventListener("storage", function (e) { if (e.key === THEME_KEY) applyTheme(); });
  applyTheme();

  /* ----- Sidebar toggle ----- */
  function updateSideToggle() { var b = $("#sideToggle"); b.setAttribute("aria-label", S.sideHidden ? "Show sidebar" : "Hide sidebar"); b.setAttribute("aria-expanded", String(!S.sideHidden)); }
  $("#sideToggle").addEventListener("click", function () { S.sideHidden = !S.sideHidden; save(); app.classList.toggle("side-hidden", S.sideHidden); updateSideToggle(); });
  updateSideToggle();

  /* ----- Progress in chrome ----- */
  function refreshProgress() {
    var cs = courseStats();
    $("#ringBtn").innerHTML = ring(24, 3.4, cs.pct, "var(--green)") + "<span>" + cs.done + "/" + cs.total + "</span>";
    $("#ringBtn").setAttribute("aria-label", "Progress: " + cs.done + " of " + cs.total + " lessons done");
    $$("[data-status]").forEach(function (el) { var id = el.getAttribute("data-status"); el.innerHTML = statusMark(id, currentLesson && currentLesson.id === id); });
    $$("[data-week-count]").forEach(function (el) { var w = weekOf(+el.getAttribute("data-week-count")); if (w) { var s = weekStats(w); el.textContent = s.done + " of " + s.total; } });
    var al = $("#actLine"); if (al && currentLesson) al.innerHTML = activityText(currentLesson);
  }
  function statusMark(id, isCur) { return S.done[id] ? doneMark(20) : isCur ? currentMark(20) : todoMark(20); }
  function activityText(l) { var st = lessonStats(l); return sym("checklist", "s") + (st.total ? st.done + " of " + st.total + " activities done" : "Reading lesson"); }

  /* ================= Sidebar ================= */
  var SEARCH = [];
  LESSONS.forEach(function (l) { SEARCH.push({ id: l.id, title: (l.num ? l.num + " " : "") + l.title, where: "Week " + l.week, text: (l.title + " " + strip(l.lede) + " " + (l.keywords || "") + " " + (l.blocks || []).map(function (b) { return strip(b.html || b.text || b.title || (b.items || []).join ? "" : ""); }).join(" ")).toLowerCase() }); });
  LESSONS.forEach(function (l) { (l.blocks || []).forEach(function (b) { if (b.type === "concept") SEARCH.push({ id: l.id, title: b.title, where: (l.num ? l.num + ", " : "") + "Week " + l.week, text: (b.title + " " + strip(b.does)).toLowerCase() }); }); });
  FN_LIST.forEach(function (f) { SEARCH.push({ id: f.lesson.id, fn: f.block.name, title: f.block.name + " function", where: (f.lesson.num ? f.lesson.num + ", " : "") + "Week " + f.lesson.week, text: (f.block.name + " " + strip(f.block.does) + " " + (f.block.cat || "")).toLowerCase() }); });
  REFS.forEach(function (r) { SEARCH.push({ id: r.id, title: r.title, where: "Reference", text: (r.title + " " + (r.keywords || "") + " " + strip(r.lede)).toLowerCase() }); });
  WEEKS.forEach(function (w) { (w.meta.plan || []).forEach(function (g) { g.lessons.forEach(function (t) { SEARCH.push({ id: "w" + w.meta.n, title: t, where: "Week " + w.meta.n + ", opens " + shortDate(w.meta.date), text: t.toLowerCase() }); }); }); });
  function searchHits(q) {
    q = q.trim().toLowerCase(); if (!q) return [];
    var words = q.split(/\s+/);
    return SEARCH.filter(function (s) { return words.every(function (w) { return s.text.indexOf(w) >= 0 || s.title.toLowerCase().indexOf(w) >= 0; }); }).slice(0, 20);
  }

  function renderSidebar() {
    var activeId = currentRoute;
    var top = '<span class="app-icon" aria-hidden="true">fx</span><span class="name">' + esc(C.name) + "</span>";
    var html = (C.homeHref ? '<a class="side-top" href="' + esc(C.homeHref) + '" title="' + esc(C.homeLabel || "Course page") + '">' + top + "</a>" : '<div class="side-top">' + top + "</div>") +
      '<label class="search-field">' + sym("search", "s") + '<input id="sideSearch" type="search" placeholder="Search" aria-label="Search lessons and reference" autocomplete="off"></label>' +
      '<div class="side-scroll" id="sideScroll"></div>';
    sidebar.innerHTML = html;
    var scroll = $("#sideScroll");
    function list() {
      var h = '<a class="side-row" href="#today"' + (activeId === "today" ? ' aria-current="page"' : "") + '><span class="tile" style="background:var(--red)">' + sym("calendar") + '</span><span class="grow">Today</span></a>' +
        '<a class="side-row" href="#reference"' + (/^ref/.test(activeId) || activeId === "reference" ? ' aria-current="page"' : "") + '><span class="tile" style="background:var(--gray)">' + sym("book") + '</span><span class="grow">Reference</span></a>';
      WEEKS.forEach(function (w) {
        var n = w.meta.n, routeWeek = currentLesson ? currentLesson.week : (/^w(\d+)$/.test(activeId || "") ? +activeId.slice(1) : null), open = S.open[n] !== undefined ? S.open[n] : (routeWeek ? routeWeek === n : (w.open && (n === (nextUp() || {}).week)));
        h += '<div class="side-sec"><button class="disclosure" data-week="' + n + '" aria-expanded="' + open + '"><span class="title">Week ' + n + "</span>" +
          (w.open ? '<span class="footnote secondary" data-week-count="' + n + '"></span>' : '<span class="footnote secondary">' + esc(shortDate(w.meta.date)) + "</span>") +
          sym("chev", "s chev") + '</button><div class="collapse' + (open ? " open" : "") + '"><div>';
        if (w.open) {
          w.data.groups.forEach(function (g) {
            var gd = g.lessons.filter(function (l) { return S.done[l.id]; }).length;
            h += '<div class="side-sub"><span class="tile s" style="background:' + groupTone(g) + '">' + groupGlyph(g) + "</span>" + esc(g.title) + '<span class="muted">' + gd + " of " + g.lessons.length + "</span></div>";
            g.lessons.forEach(function (l) {
              var cur = l.id === activeId;
              h += '<a class="side-row lesson" href="#' + l.id + '"' + (cur ? ' aria-current="page"' : "") + '><span data-status="' + l.id + '">' + statusMark(l.id, cur) + '</span><span class="num">' + esc(l.num || "") + '</span><span class="grow">' + esc(l.title) + "</span></a>";
            });
          });
        } else {
          (w.meta.plan || []).forEach(function (g) {
            h += '<div class="side-sub"><span class="tile s" style="background:' + (g.portfolio ? "var(--purple)" : "var(--gray)") + '">' + (g.portfolio ? sym("case") : sym("lockFill")) + "</span>" + esc(g.title.replace(/^Session \d+: /, "")) + "</div>";
            g.lessons.forEach(function (t) { h += '<div class="side-planned">' + todoMark(18) + "<span>" + esc(t) + "</span></div>"; });
          });
          h += '<a class="side-row lesson" href="#w' + n + '"><span class="grow secondary">Opens ' + esc(longDate(w.meta.date)) + "</span>" + sym("chev", "xs chev") + "</a>";
        }
        h += "</div></div></div>";
      });
      return h;
    }
    scroll.innerHTML = list();
    refreshProgress();
    scroll.addEventListener("click", function (e) {
      var d = e.target.closest(".disclosure"); if (!d) return;
      var n = +d.getAttribute("data-week"), open = d.getAttribute("aria-expanded") !== "true";
      S.open[n] = open; save();
      d.setAttribute("aria-expanded", String(open)); d.nextElementSibling.classList.toggle("open", open);
    });
    var input = $("#sideSearch");
    input.addEventListener("input", function () {
      var hits = searchHits(input.value);
      if (!input.value.trim()) { scroll.innerHTML = list(); refreshProgress(); return; }
      scroll.innerHTML = hits.length ? '<div class="side-sub">Results</div>' + hits.map(function (h) { return '<a class="side-row lesson" href="#' + h.id + '"' + (h.fn ? ' data-fn-link="' + esc(h.fn) + '"' : "") + '><span class="grow">' + esc(h.title) + '</span><span class="muted">' + esc(h.where) + "</span></a>"; }).join("") :
        '<p class="footnote secondary" style="padding:12px">No results for "' + esc(input.value) + '". Try SUM or XLOOKUP.</p>';
    });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { var a = $("a.side-row", scroll); if (a) { location.hash = a.getAttribute("href"); input.value = ""; } } if (e.key === "Escape") { input.value = ""; input.dispatchEvent(new Event("input")); } });
    var cur = $('[aria-current="page"].lesson', scroll);
    if (cur) setTimeout(function () { var r = cur.getBoundingClientRect(), sr = scroll.getBoundingClientRect(); if (r.top < sr.top || r.bottom > sr.bottom) scroll.scrollTop += r.top - sr.top - sr.height / 3; }, 30);
  }

  /* ================= Router ================= */
  function route() {
    var id = (location.hash || "#today").slice(1) || "today";
    closeSheet(true);
    teardown();
    currentLesson = null;
    var idx = BY_ID[id] && BY_ID[id].index != null ? BY_ID[id].index : -1;
    var back = idx >= 0 && lastIndex >= 0 && idx < lastIndex;
    lastIndex = idx;
    currentRoute = id;
    if (id === "today") renderToday();
    else if (id === "lessons") renderLessons();
    else if (id === "reference") renderRefIndex();
    else if (id === "search") renderSearch();
    else if (/^w\d+$/.test(id)) renderWeek(+id.slice(1));
    else if (BY_ID[id] && BY_ID[id].isRef) renderRef(BY_ID[id]);
    else if (BY_ID[id]) renderLesson(BY_ID[id]);
    else { currentRoute = "today"; renderToday(); }
    renderSidebar();
    $$(".tabbar [data-tab]").forEach(function (t) {
      var tab = t.getAttribute("data-tab");
      var on = tab === "today" ? currentRoute === "today" : tab === "lessons" ? (currentRoute === "lessons" || /^w\d/.test(currentRoute)) : tab === "reference" ? (currentRoute === "reference" || /^ref-/.test(currentRoute)) : currentRoute === "search";
      if (on) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current");
    });
    page.classList.remove("page-enter", "back"); void page.offsetWidth; page.classList.add("page-enter"); if (back) page.classList.add("back");
    window.scrollTo(0, 0);
    page.focus({ preventScroll: true });
    watchTitle();
    refreshProgress();
    if (pendingFn) { var target = document.getElementById("fn-" + pendingFn.toLowerCase().replace(/[^a-z0-9]/g, "")); pendingFn = null; if (target) setTimeout(function () { target.scrollIntoView({ block: "start" }); target.classList.add("flash"); setTimeout(function () { target.classList.remove("flash"); }, 1600); }, 60); }
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-fn-link]"); if (!a) return;
    var name = a.getAttribute("data-fn-link"), f = FN_CARDS[name]; if (!f) return;
    e.preventDefault();
    var here = document.getElementById("fn-" + name.toLowerCase().replace(/[^a-z0-9]/g, ""));
    if (here && currentRoute === f.lesson.id) { here.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" }); return; }
    pendingFn = name; location.hash = "#" + f.lesson.id;
  });
  window.addEventListener("hashchange", route);
  var cleanups = [];
  function teardown() { cleanups.forEach(function (f) { try { f(); } catch (e) {} }); cleanups = []; }

  function setChrome(opts) {
    $("#crumb").innerHTML = opts.crumb || "";
    $("#inlineTitle").textContent = opts.title || "";
    var p = $("#prevBtn"), n = $("#nextBtn");
    if (opts.prev) { p.href = "#" + opts.prev.id; p.setAttribute("aria-label", "Previous: " + opts.prev.title); p.style.display = ""; } else p.style.display = "none";
    if (opts.next) { n.href = "#" + opts.next.id; n.setAttribute("aria-label", "Next: " + opts.next.title); n.style.display = ""; } else n.style.display = "none";
    page.classList.toggle("narrow", !!opts.narrow);
    $("#navCapsule").classList.toggle("bare", !opts.prev && !opts.next);
  }
  function watchTitle() {
    var t = $(".large-title", page);
    toolbar.classList.remove("scrolled");
    if (!t || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (en) { toolbar.classList.toggle("scrolled", !en[0].isIntersecting); }, { rootMargin: "-72px 0px 0px 0px" });
    io.observe(t); cleanups.push(function () { io.disconnect(); });
  }

  /* ================= Today ================= */
  function renderToday() {
    setChrome({ title: "Today", narrow: false });
    var cs = courseStats(), up = nextUp(), today = todayISO();
    var nowWeek = WEEKS.filter(function (w) { return w.open && w.meta.date <= today; }).pop() || WEEKS.filter(function (w) { return w.open; })[0];
    var nextWeek = WEEKS.filter(function (w) { return w.meta.date > today; })[0];
    var html = '<header class="page-head"><span class="overline secondary">' + esc(longDate(today)) + '</span><h1 class="large-title">Today</h1></header><div class="home-grid"><div>';
    if (up) {
      var ws = weekStats(weekOf(up.week));
      html += '<section class="card lift upnext" aria-label="Up next"><div class="top"><div><span class="overline" style="color:' + groupTone(up.group) + '">' + (cs.done || S.last ? "Up next" : "Start here") + '</span><span class="title-2">' + esc(up.title) + '</span><span class="subhead secondary">' + esc(lessonLabel(up)) + (up.time ? ", about " + esc(up.time) : "") + "</span></div>" +
        ring(84, 10, ws.pct, "var(--green)", '<span class="count">' + ws.done + "<small>of " + ws.total + "</small></span>") + '</div><a class="btn filled large wide" href="#' + up.id + '">' + (cs.done || S.last ? "Continue" : "Get Started") + "</a></section>";
    }
    if (nowWeek && nowWeek.data && nowWeek.data.slots) {
      html += '<div style="height:28px"></div>' + slotsHTML(nowWeek, up);
    }
    html += '</div><div>';
    var latest = WEEKS.filter(function (w) { return w.open; }).pop(), dl = (C.downloads || [])[(C.downloads || []).length - 1] || {};
    var hwId = latest ? "w" + latest.meta.n + "-homework" : "", hwDue = latest && weekOf(latest.meta.n + 1) ? weekOf(latest.meta.n + 1).meta.date : null;
    html += '<div class="tiles" style="margin-bottom:28px">' +
      '<a class="tile-card" href="' + esc(dl.href || "#") + '" download><span class="tile l" style="background:var(--green)">' + sym("tableFill") + "</span><b>Workbook</b><span>" + esc(dl.name || "") + "</span></a>" +
      (BY_ID[hwId] ? '<a class="tile-card" href="#' + hwId + '"><span class="tile l" style="background:var(--orange)">' + sym("flag") + "</span><b>Homework</b><span>" + (hwDue ? "Due " + esc(shortDate(hwDue)) : "Week " + latest.meta.n + " tasks") + "</span></a>" : "") + "</div>";
    html += '<section class="group"><div class="group-head"><h2>Six weeks</h2><span class="secondary">' + cs.done + " of " + cs.total + " lessons</span></div><div class=\"list\" style=\"--inset:70px\">";
    WEEKS.forEach(function (w) {
      var portfolio = (w.meta.plan || []).some(function (g) { return g.portfolio; });
      var st = w.open ? weekStats(w) : null;
      html += '<a class="row" href="#w' + w.meta.n + '"><span class="tile l" style="background:' + (w.open ? "var(--blue)" : portfolio ? "var(--purple)" : "var(--gray)") + '">' + (w.open ? w.meta.n : portfolio ? sym("case") : sym("lockFill")) + '</span><span class="row-body"><span class="row-title">Week ' + w.meta.n + ": " + esc(w.meta.title) + '</span><span class="row-sub">' + esc(shortDate(w.meta.date)) + (portfolio ? ", portfolio projects" : "") + "</span></span>" +
        (w.open ? ring(26, 3.6, st.pct, "var(--green)") : '<span class="row-detail">' + (w.meta.date > today ? "Opens " + esc(shortDate(w.meta.date)) : "") + "</span>") + sym("chev", "xs chev") + "</a>";
    });
    html += "</div></section>";
    if (C.homeHref || C.siteHref) {
      html += '<section class="group"><div class="list" style="--inset:70px">' +
        (C.homeHref ? '<a class="row" href="' + esc(C.homeHref) + '"><span class="tile l" style="background:var(--green)">' + sym("info") + '</span><span class="row-body"><span class="row-title">' + esc(C.homeLabel || "Course page") + '</span><span class="row-sub">Projects, the six weeks, how lessons work</span></span>' + sym("chev", "xs chev") + "</a>" : "") +
        (C.siteHref ? '<a class="row" href="' + esc(C.siteHref) + '"><span class="tile l" style="background:var(--gray)">' + sym("house") + '</span><span class="row-body"><span class="row-title">' + esc(C.siteLabel || "Home") + "</span></span>" + sym("chev", "xs chev") + "</a>" : "") +
        "</div></section>";
    }
    html += "</div></div>";
    page.innerHTML = html;
  }
  function slotsHTML(w, up) {
    var html = "";
    w.data.slots.forEach(function (s) {
      html += '<section class="group"><div class="group-head"><h2>' + esc(s.label) + '</h2><span class="secondary">' + esc(s.length) + '</span></div><div class="list" style="--inset:72px">';
      s.items.forEach(function (it) {
        var l = it.lesson && BY_ID[it.lesson];
        var tag = l ? (S.done[l.id] ? doneMark(22) : up && up.id === l.id ? '<span class="badge">Now</span>' : "") : "";
        var inner = '<span class="time">' + esc(it.t) + '</span><span class="row-body"><span class="row-title' + (up && l && up.id === l.id ? " strong" : "") + '">' + esc(l ? l.title : it.title) + '</span><span class="row-sub">' + esc(l ? (l.num ? l.num + ", " : "") + (l.time || "") : "") + (it.note ? (l ? ". " : "") + esc(it.note) : "") + "</span></span>" + tag;
        html += l ? '<a class="row" href="#' + l.id + '">' + inner + sym("chev", "xs chev") + "</a>" : '<div class="row">' + inner + "</div>";
      });
      html += "</div></section>";
    });
    return html;
  }

  /* ================= Lessons ================= */
  function renderLessons() {
    setChrome({ title: "Lessons", narrow: true });
    var today = todayISO();
    var html = '<header class="page-head"><h1 class="large-title">Lessons</h1><p class="lede">Six weeks. Each lesson adds one idea to the last, so go in order.</p></header>';
    WEEKS.forEach(function (w) {
      html += '<section class="group"><div class="group-head"><h2>Week ' + w.meta.n + '</h2><span class="secondary">' + esc(shortDate(w.meta.date)) + "</span></div>";
      if (w.open) {
        w.data.groups.forEach(function (g) {
          html += '<div class="list" style="--inset:52px;margin-bottom:10px"><div class="row" style="min-height:46px"><span class="tile s" style="background:' + groupTone(g) + '">' + groupGlyph(g) + '</span><span class="row-body"><span class="row-title strong">' + esc(g.title) + "</span>" + (g.sub ? '<span class="row-sub">' + esc(g.sub) + "</span>" : "") + "</span></div>";
          g.lessons.forEach(function (l) {
            html += '<a class="row" href="#' + l.id + '"><span data-status="' + l.id + '">' + statusMark(l.id, false) + '</span><span class="row-body"><span class="row-title">' + esc((l.num ? l.num + " " : "") + l.title) + '</span></span><span class="row-detail">' + esc(l.time || "") + "</span>" + sym("chev", "xs chev") + "</a>";
          });
          html += "</div>";
        });
      } else {
        html += '<a class="list row" href="#w' + w.meta.n + '" style="margin-bottom:10px"><span class="tile" style="background:var(--gray)">' + sym("lockFill") + '</span><span class="row-body"><span class="row-title">' + esc(w.meta.title) + '</span><span class="row-sub">' + esc(w.meta.summary) + '</span></span><span class="row-detail">' + (w.meta.date > today ? "Opens " + esc(shortDate(w.meta.date)) : "") + "</span>" + sym("chev", "xs chev") + "</a>";
      }
      html += "</section>";
    });
    page.innerHTML = html;
  }

  /* ================= Week ================= */
  function renderWeek(n) {
    var w = weekOf(n);
    if (!w) { renderToday(); return; }
    setChrome({ title: "Week " + n, crumb: '<a href="#lessons">Lessons</a>', narrow: true });
    var html = "";
    if (!w.open) {
      html += '<header class="page-head"><span class="overline secondary">Week ' + n + "</span><h1 class=\"large-title\">" + esc(w.meta.title) + '</h1><p class="lede">' + esc(w.meta.summary) + ".</p></header>" +
        '<div class="locked-hero"><span class="tile l" style="background:var(--gray)">' + sym("lockFill") + '</span><span class="title-3">Opens ' + esc(longDate(w.meta.date)) + '</span><p class="subhead secondary">Lessons, Try-it sheets and the workbook appear here after the session. This is the plan.</p>' +
        (LESSONS.length ? '<a class="btn gray" href="#' + nextUp().id + '">Review Earlier Lessons</a>' : "") + "</div>";
      (w.meta.plan || []).forEach(function (g) {
        html += '<section class="group"><div class="group-head"><h2>' + esc(g.title) + "</h2>" + (g.portfolio ? '<span class="badge" style="background:var(--purple)">Portfolio project</span>' : "") + '</div><div class="list" style="--inset:52px">' +
          g.lessons.map(function (t) { return '<div class="row">' + todoMark(20) + '<span class="row-body"><span class="row-title">' + esc(t) + "</span></span></div>"; }).join("") + "</div></section>";
      });
      page.innerHTML = html; return;
    }
    var d = w.data, ws = weekStats(w), first = w.lessons.filter(function (l) { return !S.done[l.id]; })[0] || w.lessons[0];
    html += '<header class="page-head"><span class="overline secondary">Week ' + n + ", " + esc(longDate(w.meta.date)) + '</span><h1 class="large-title">' + esc(w.meta.title) + '</h1><p class="lede">' + (d.intro || "") + '</p><div class="meta"><span>' + sym("lessons", "s") + w.lessons.length + " lessons</span><span>" + sym("clock", "s") + esc(d.duration || "") + '</span><span data-week-count-wrap>' + sym("checklist", "s") + '<span data-week-count="' + n + '"></span> done</span></div></header>' +
      '<div style="margin-bottom:30px"><a class="btn filled large" href="#' + first.id + '">' + (ws.done ? "Continue" : "Get Started") + "</a></div>";
    if (d.objectives) html += learnHTML(d.objectives, "By the end of this week you can");
    if (d.slots) html += slotsHTML(w, nextUp());
    if (d.files) html += filesHTML(d.files, "Files");
    page.innerHTML = html;
  }
  function learnHTML(list, title) {
    return '<section class="group learn"><div class="group-head"><h2>' + esc(title || "You will learn to") + '</h2></div><div class="card"><ul>' + list.map(function (o) { return "<li>" + doneMark(22).replace('aria-label="Done"', 'aria-hidden="true"').replace('role="img"', "") + "<span>" + o + "</span></li>"; }).join("") + "</ul></div></section>";
  }
  function filesHTML(list, title) {
    return '<section class="group">' + (title ? '<div class="group-head"><h2>' + esc(title) + "</h2></div>" : "") + '<div class="list" style="--inset:70px">' + list.map(function (f) {
      return '<div class="row"><span class="tile l" style="background:var(--green)">' + sym("tableFill") + '</span><span class="row-body"><span class="row-title">' + esc(f.name) + '</span><span class="row-sub">' + esc(f.note || "") + '</span></span><a class="btn small gray" href="' + esc(f.href) + '" download>' + sym("download", "s") + "Download</a></div>";
    }).join("") + "</div></section>";
  }

  /* ================= Reference + search ================= */
  function renderRefIndex() {
    setChrome({ title: "Reference", narrow: true });
    var colors = ["var(--indigo)", "var(--orange)", "var(--blue)", "var(--red)", "var(--teal)"];
    page.innerHTML = '<header class="page-head"><h1 class="large-title">Reference</h1><p class="lede">Shortcuts, format codes, every function used so far, error messages and terms. It grows each week.</p></header>' +
      '<div class="list" style="--inset:70px">' + REFS.map(function (r, i) { return '<a class="row" href="#' + r.id + '"><span class="tile l" style="background:' + colors[i % colors.length] + '">' + sym(r.icon === "alert" ? "warn" : r.icon || "book") + '</span><span class="row-body"><span class="row-title">' + esc(r.title) + '</span><span class="row-sub">' + strip(r.lede) + "</span></span>" + sym("chev", "xs chev") + "</a>"; }).join("") + "</div>";
  }
  function renderRef(r) {
    setChrome({ title: r.title, crumb: '<a href="#reference">Reference</a>', narrow: true });
    page.innerHTML = '<header class="page-head"><span class="overline secondary">Reference</span><h1 class="large-title">' + esc(r.title) + "</h1>" + (r.lede ? '<p class="lede">' + r.lede + "</p>" : "") + '</header><div class="flow" id="blocks"></div>';
    renderBlocks(r.blocks || [], $("#blocks"), r);
  }
  function renderSearch() {
    setChrome({ title: "Search", narrow: true });
    page.innerHTML = '<header class="page-head"><h1 class="large-title">Search</h1></header><label class="search-field" style="margin:0 0 20px;height:44px">' + sym("search", "s") + '<input id="bigSearch" type="search" placeholder="Lessons, functions, topics" aria-label="Search" autocomplete="off"></label><div id="results"></div>';
    var input = $("#bigSearch"), out = $("#results");
    function show() {
      var q = input.value, hits = searchHits(q);
      out.innerHTML = !q.trim() ? '<p class="subhead secondary" style="padding:0 4px">Try SUM, $ sign, XLOOKUP or trial balance.</p>' : hits.length ? '<div class="list">' + hits.map(function (h) { return '<a class="row" href="#' + h.id + '"' + (h.fn ? ' data-fn-link="' + esc(h.fn) + '"' : "") + '><span class="row-body"><span class="row-title">' + esc(h.title) + '</span><span class="row-sub">' + esc(h.where) + "</span></span>" + sym("chev", "xs chev") + "</a>"; }).join("") + "</div>" : '<div class="empty">' + sym("search", "l") + '<span class="headline">No results for "' + esc(q) + '"</span><span class="subhead">Check the spelling or try a function name.</span></div>';
    }
    input.addEventListener("input", show); show();
    setTimeout(function () { input.focus(); }, 80);
  }

  /* ================= Lesson ================= */
  function renderLesson(l) {
    var w = weekOf(l.week); currentLesson = l; S.last = l.id; save();
    var prev = LESSONS[l.index - 1], next = LESSONS[l.index + 1];
    setChrome({ title: l.title, crumb: '<a href="#w' + l.week + '">Week ' + l.week + "</a>  ›  " + esc(l.group.title), prev: prev, next: next });
    var meta = [];
    if (l.time) meta.push("<span>" + sym("clock", "s") + esc(l.time) + "</span>");
    if (l.sheet) meta.push("<span>" + sym("table", "s") + "Workbook tab " + esc(l.sheet) + "</span>");
    meta.push('<span id="actLine">' + activityText(l) + "</span>");
    var tip = l.keyIdea && !S.tips[l.id] ? '<aside class="tip" id="tip"><span class="glyph">' + sym("bulb") + "</span><div><b>The idea</b><p>" + l.keyIdea + '</p></div><button class="icon-btn close" id="tipClose" aria-label="Hide the idea">' + sym("xmark", "xs") + "</button></aside>" : "<span></span>";
    page.innerHTML = '<header class="lesson-head"><div class="page-head" style="padding:0"><span class="eyebrow" style="color:' + groupTone(l.group) + '">' + esc(lessonLabel(l)) + '</span><h1 class="large-title">' + esc(l.title) + "</h1>" + (l.lede ? '<p class="lede">' + l.lede + "</p>" : "") + '<div class="meta">' + meta.join("") + "</div></div>" + tip + "</header>" +
      (l.objectives ? learnHTML(l.objectives, "You'll learn to") : "") +
      '<div class="flow" id="blocks"></div><div class="finish"><div id="finish"></div><nav class="pn" aria-label="Lesson navigation">' +
      (prev ? '<a href="#' + prev.id + '"><small>' + sym("left", "xs") + "Previous</small><b>" + esc(prev.title) + "</b></a>" : '<a href="#w' + l.week + '"><small>' + sym("left", "xs") + "Week " + l.week + "</small><b>Overview</b></a>") +
      (next ? '<a class="next" href="#' + next.id + '"><small>Next' + sym("right", "xs") + "</small><b>" + esc(next.title) + "</b></a>" : '<a class="next" href="#today"><small>Done' + sym("right", "xs") + "</small><b>Back to Today</b></a>") + "</nav></div>";
    var tc = $("#tipClose"); if (tc) tc.addEventListener("click", function () { S.tips[l.id] = true; save(); var t = $("#tip"); t.style.transition = "opacity 200ms, transform 260ms"; t.style.opacity = "0"; t.style.transform = "scale(.97)"; setTimeout(function () { t.replaceWith(document.createElement("span")); }, 220); });
    renderBlocks(l.blocks || [], $("#blocks"), l);
    renderFinish();
  }
  function renderFinish() {
    var l = currentLesson, box = $("#finish"); if (!l || !box) return;
    var st = lessonStats(l);
    if (S.done[l.id]) box.innerHTML = '<div class="finish-card done"><span class="done-label">' + doneMark(26) + "Lesson complete</span>" + (LESSONS[l.index + 1] ? '<a class="btn filled" href="#' + LESSONS[l.index + 1].id + '">Next Lesson</a>' : "") + "</div>";
    else {
      box.innerHTML = '<div class="finish-card"><p>' + (st.total ? "Finish the " + st.total + " activit" + (st.total === 1 ? "y" : "ies") + " above and the lesson completes itself, or mark it now." : "Read it through, try it in Excel, then mark the lesson complete.") + '</p><button class="btn filled" id="markDone">Mark as Complete</button></div>';
      $("#markDone").addEventListener("click", function () { markComplete(l, false); });
    }
  }

  /* ================= Blocks ================= */
  var uid = 0;
  function renderBlocks(blocks, mount, owner) {
    blocks.forEach(function (b) {
      var el = document.createElement("div");
      mount.appendChild(el);
      var R = RENDER[b.type];
      if (R) R(b, el, owner); else el.innerHTML = "<p>Unknown block " + esc(b.type) + "</p>";
    });
  }
  var NOTE_KINDS = { note: ["Note", "infoPlain"], tip: ["Tip", "bulb"], warning: ["Watch out", "warn"], finance: ["In finance", "chart"] };
  var RENDER = {
    h: function (b, el) { el.innerHTML = '<h2 class="sec-title" id="s' + (++uid) + '">' + esc(b.text) + "</h2>"; },
    h3: function (b, el) { el.innerHTML = '<h3 class="headline">' + esc(b.text) + "</h3>"; },
    p: function (b, el) { el.className = "notes"; el.innerHTML = "<p>" + b.html + "</p>"; },
    html: function (b, el) { el.className = "notes"; el.innerHTML = b.html; },
    list: function (b, el) { el.className = "notes"; var t = b.ordered ? "ol" : "ul"; el.innerHTML = "<" + t + ">" + b.items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</" + t + ">"; },
    key: function (b, el) { el.innerHTML = '<div class="keyline"><span class="k">' + esc(b.label || "Remember") + '</span><span class="v">' + b.html + "</span></div>"; },
    callout: function (b, el) {
      var k = NOTE_KINDS[b.kind] || NOTE_KINDS.note;
      el.innerHTML = '<div class="note ' + esc(b.kind || "note") + '-kind" role="note"><span class="glyph">' + sym(k[1]) + "</span><div><b>" + esc(b.title || k[0]) + '</b><div class="note-text">' + b.html + "</div></div></div>";
    },
    table: function (b, el) {
      var num = b.num || [];
      el.innerHTML = '<div class="table-wrap"><table class="data"><thead><tr>' + b.head.map(function (h, i) { return "<th" + (num.indexOf(i) >= 0 ? ' class="num"' : "") + ">" + h + "</th>"; }).join("") + "</tr></thead><tbody>" +
        b.rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return "<td" + (num.indexOf(i) >= 0 ? ' class="num"' : "") + ">" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
    },
    files: function (b, el) { el.innerHTML = filesHTML(b.items || C.downloads || []); },
    timeline: function (b, el, owner) { var w = weekOf(b.week || (owner && owner.week)); el.innerHTML = w && w.data && w.data.slots ? slotsHTML(w, nextUp()) : ""; },
    example: function (b, el) {
      el.innerHTML = '<div class="example"><div class="example-head"><span class="tile" style="background:var(--indigo)">' + sym("eye") + '</span><span class="headline grow">' + esc(b.title || "Example") + "</span></div>" + (b.html ? '<p class="subhead secondary">' + b.html + "</p>" : "") +
        '<div class="ex-sheet"></div>' + (b.code || b.tryIt ? '<div class="formula-line">' + (b.code ? "<code>" + esc(b.code) + '</code><button class="btn small gray" data-copy="' + esc(b.code) + '">' + sym("copy", "s") + "Copy</button>" : "") + '<span style="flex:1"></span>' + (b.tryIt ? '<button class="btn small filled" data-try="' + esc(b.tryIt) + '">Try It Yourself</button>' : "") + "</div>" : "") + "</div>";
      if (b.sheet) SheetWidget(Object.assign({ readonly: true, id: "ex" + (++uid) }, b.sheet), $(".ex-sheet", el));
      bindCopy(el);
      var t = $("[data-try]", el);
      if (t) t.addEventListener("click", function () { var tut = document.querySelector('[data-tutorial="' + b.tryIt + '"]'); if (tut) { tut.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" }); if (compactMQ.matches) setTimeout(function () { var o = $(".tut-open", tut); if (o) o.click(); }, 400); } });
    },
    steps: function (b, el) { ChecksWidget(b, el, false); },
    checklist: function (b, el) { ChecksWidget(b, el, true); },
    quiz: function (b, el) { QuizWidget(b, el); },
    sheet: function (b, el) { Tutorial(b, el); },
    fn: function (b, el) { FnCard(b, el); },
    concept: function (b, el) { FnCard(b, el); },
    widget: function (b, el, owner) { var W = WIDGETS[b.name]; if (W) W(b, el, owner); else el.innerHTML = ""; }
  };
  function bindCopy(root) {
    $$("[data-copy]", root).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-copy"), orig = btn.innerHTML;
        var ok = function () { btn.innerHTML = sym("check", "s") + "Copied"; setTimeout(function () { btn.innerHTML = orig; }, 1500); };
        try { navigator.clipboard.writeText(text).then(ok, function () { selectNear(btn); }); } catch (e) { selectNear(btn); }
      });
    });
  }
  function selectNear(btn) { var c = btn.parentElement.querySelector("code"); if (c && window.getSelection) { var r = document.createRange(); r.selectNodeContents(c); var s = getSelection(); s.removeAllRanges(); s.addRange(r); hud("Selected. Press Ctrl+C to copy"); } }

  /* ================= Function cards ================= */
  function fnId(name) { return "fn-" + name.toLowerCase().replace(/[^a-z0-9]/g, ""); }
  function syntaxHTML(b) {
    var m = /^([A-Z0-9.]+)\((.*)\)$/.exec(b.syntax || "");
    if (!m) return esc(b.syntax || "");
    var parts = m[2].split(/,\s*/).filter(Boolean);
    return '<span class="fn-n">=' + esc(m[1]) + "</span>(" + parts.map(function (p) {
      var opt = /^\[.*\]$/.test(p), name = p.replace(/^\[|\]$/g, "").replace(/\.\.\.$/, "");
      return '<span class="fn-arg' + (opt ? " opt" : "") + '" data-arg="' + esc(name) + '" tabindex="0">' + esc(p) + "</span>";
    }).join(", ") + ")";
  }
  function FnCard(b, el) {
    var isC = b.type === "concept";
    el.className = "fn" + (isC ? " concept" : ""); el.id = isC ? "cc-" + (b.id || b.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")) : fnId(b.name);
    var sheet = null;
    if (b.sheet) { sheet = new XL.Sheet({ cells: cellsFromSpec(b.sheet), names: b.sheet.names }); }
    var fm = b.sheet ? fmtMap(b.sheet) : {};
    function run(ex) {
      if (ex.out !== undefined) return esc(ex.out);
      if (ex.code !== undefined) return esc(XL.format(typeof ex.value === "number" ? ex.value : +ex.value, ex.code));
      var sh = sheet ? sheet.clone() : new XL.Sheet({ cells: {} });
      sh.raw.ZZZ9999 = ex.f; sh.invalidate();
      var v = sh.value("ZZZ9999");
      if (XL.isErr(v)) return '<span class="err">' + esc(v.err) + "</span>";
      if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
      if (typeof v === "number") return esc(XL.format(v, ex.fmt || "General"));
      return esc(String(v));
    }
    var h = isC
      ? '<div class="fn-head"><span class="tile" style="background:var(--teal)">' + sym(b.icon || "book") + '</span><div class="grow"><h3 class="fn-title">' + esc(b.title) + '</h3><span class="footnote secondary">' + esc(b.cat || "Concept") + "</span></div></div>" +
        '<p class="fn-does">' + b.does + "</p>" + (b.pattern ? '<div class="fn-syntax" aria-label="Pattern"><code>' + b.pattern + "</code></div>" : "")
      : '<div class="fn-head"><span class="tile fx-tile" style="background:var(--indigo)" aria-hidden="true">fx</span><div class="grow"><h3 class="fn-name">' + esc(b.name) + "</h3>" + (b.cat ? '<span class="footnote secondary">' + esc(b.cat) + "</span>" : "") + "</div></div>" +
        '<p class="fn-does">' + b.does + "</p>" +
        '<div class="fn-syntax" aria-label="Syntax"><code>' + syntaxHTML(b) + '</code><button class="btn small plain" data-copy="=' + esc(b.syntax) + '">' + sym("copy", "s") + "Copy</button></div>";
    if (b.body) h += '<div class="fn-body">' + b.body + "</div>";
    if (b.args && b.args.length) {
      h += '<h4 class="fn-h">' + esc(b.argsTitle || (isC ? "The parts" : "Arguments")) + '</h4><div class="fn-args">' + b.args.map(function (a) {
        return '<div class="fn-argrow" data-arg-row="' + esc(a.n) + '"><div class="an">' + (isC ? "<b>" + a.n + "</b>" : "<code>" + esc(a.n) + "</code>") + (isC ? "" : '<span class="badge ' + (a.req === false ? "gray" : "") + '">' + (a.req === false ? "Optional" : "Required") + "</span>") + '</div><div class="am">' + a.means + (a.eg ? '<span class="eg">' + (isC ? "" : "For example ") + a.eg + "</span>" : "") + "</div></div>";
      }).join("") + "</div>";
    }
    if (b.returns) h += '<div class="fn-returns"><b>Returns</b><span>' + b.returns + "</span></div>";
    if (b.how && b.how.length) h += '<h4 class="fn-h">' + esc(b.howTitle || (isC ? "How it works" : "How Excel works it out")) + '</h4><ol class="fn-how">' + b.how.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol>";
    if (b.sheet) h += '<h4 class="fn-h">' + esc(b.sheet.title || "Example data") + '</h4><div class="fn-data"></div>';
    if (b.examples && b.examples.length) {
      h += '<h4 class="fn-h">' + esc(b.examplesTitle || "Examples") + '</h4><div class="fn-ex">' + b.examples.map(function (ex) {
        var shown = ex.show !== undefined ? ex.show : ex.f !== undefined ? ex.f : (ex.value !== undefined ? ex.value + "  with  " + ex.code : "");
        return '<div class="fn-exrow"><div class="fx-line"><code>' + esc(shown) + '</code><span class="res" aria-label="Result">' + run(ex) + "</span></div>" + (ex.why ? '<p class="why">' + ex.why + "</p>" : "") + "</div>";
      }).join("") + "</div>";
    }
    if ((b.uses && b.uses.length) || (b.mistakes && b.mistakes.length)) {
      h += '<div class="fn-two">';
      if (b.uses && b.uses.length) h += '<div class="fn-list uses"><h4 class="fn-h">' + sym("chart", "s") + "Where it's used</h4><ul>" + b.uses.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>";
      if (b.mistakes && b.mistakes.length) h += '<div class="fn-list warn"><h4 class="fn-h">' + sym("warn", "s") + "Watch out</h4><ul>" + b.mistakes.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>";
      h += "</div>";
    }
    if (b.tip) h += '<div class="fn-tip">' + bulbMark() + "<p>" + b.tip + "</p></div>";
    if (b.practice && b.practice.length) h += '<h4 class="fn-h">' + sym("pencil", "s") + 'Practice, with solutions</h4><div class="fn-practice">' + b.practice.map(function (q, i) {
      return '<div class="pq"><p class="pq-q"><span class="n">' + (i + 1) + ".</span>" + q.q + '</p><button class="btn small gray pq-btn" aria-expanded="false">Show Solution</button><div class="pq-a" hidden>' + q.a + "</div></div>";
    }).join("") + "</div>";
    if (b.related && b.related.length) h += '<div class="fn-related"><span class="footnote secondary">Related</span>' + b.related.map(function (r) { return FN_CARDS[r] ? '<a class="chip-btn" href="#' + FN_CARDS[r].lesson.id + '" data-fn-link="' + esc(r) + '">' + esc(r) + "</a>" : '<span class="chip-btn" aria-disabled="true">' + esc(r) + "</span>"; }).join("") + "</div>";
    el.innerHTML = h;
    if (b.sheet) SheetWidget(Object.assign({ readonly: true, id: "fnd-" + b.name }, b.sheet), $(".fn-data", el));
    bindCopy(el);
    el.addEventListener("click", function (e) {
      var t = e.target.closest(".pq-btn"); if (!t) return;
      var a = t.nextElementSibling, open = a.hidden; a.hidden = !open;
      t.setAttribute("aria-expanded", String(open)); t.textContent = open ? "Hide Solution" : "Show Solution";
    });
    function hl(name, on) { var row = el.querySelector('[data-arg-row="' + name + '"]'); if (row) row.classList.toggle("hl", on); }
    $$(".fn-arg", el).forEach(function (s) {
      var n = s.getAttribute("data-arg");
      s.addEventListener("mouseenter", function () { hl(n, true); }); s.addEventListener("mouseleave", function () { hl(n, false); });
      s.addEventListener("focus", function () { hl(n, true); }); s.addEventListener("blur", function () { hl(n, false); });
    });
  }

  /* ================= Reminders-style checklists ================= */
  function ChecksWidget(b, el, isHomework) {
    var state = S.steps[b.id] || [];
    function render() {
      var n = b.items.filter(function (_, i) { return state[i]; }).length, cur = b.items.findIndex(function (_, i) { return !state[i]; });
      el.innerHTML = '<section class="checks" aria-label="' + esc(b.title || "Steps") + '"><div class="checks-head"><span class="tile" style="background:' + (isHomework ? "var(--orange)" : "var(--green)") + '">' + sym(isHomework ? "flag" : "tableFill") + '</span><div class="grow"><div class="headline">' + esc(b.title || "Follow along in Excel") + "</div>" + (b.sheet ? '<div class="footnote secondary">Workbook tab ' + esc(b.sheet) + "</div>" : "") + '</div><span class="count" aria-live="polite">' + n + " of " + b.items.length + '</span></div><div class="progress-line"><i style="width:' + Math.round(n / b.items.length * 100) + '%"></i></div>' +
        b.items.map(function (s, i) {
          var on = !!state[i];
          return '<div class="check-row' + (on ? " done" : "") + (!isHomework && i === cur ? " current" : "") + '"><button class="circle-toggle" role="checkbox" aria-checked="' + on + '" data-i="' + i + '" aria-label="' + esc(strip(s.html || s.title)) + '"><span class="ring-o"><svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-8.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>' +
            '<div class="check-body">' + (isHomework ? '<div class="step-text"><b style="font-weight:600">' + esc(s.title) + "</b>" + (s.tag ? ' <span class="footnote secondary">' + esc(s.tag) + "</span>" : "") + '</div><div class="check-sub">' + (s.sub || "") + (s.time ? ". " + esc(s.time) : "") + "</div>" :
              '<div class="step-text">' + s.html + "</div>" + (s.code ? '<div class="code-row"><code>' + esc(s.code) + '</code><button class="btn small plain" data-copy="' + esc(s.code) + '">' + sym("copy", "s") + "Copy</button></div>" : "") + (s.tip ? '<div class="check-sub">' + s.tip + "</div>" : "")) + "</div></div>";
        }).join("") + "</section>";
      bindCopy(el);
    }
    el.addEventListener("click", function (e) {
      var t = e.target.closest(".circle-toggle"); if (!t) return;
      var i = +t.getAttribute("data-i"); state[i] = !state[i]; S.steps[b.id] = state; save(); render();
      var f = el.querySelector('.circle-toggle[data-i="' + i + '"]'); if (f) f.focus();
      if (b.items.every(function (_, k) { return state[k]; })) itemDone(b.id);
    });
    render();
  }

  /* ================= Quiz ================= */
  function norm(s) { return String(s == null ? "" : s).replace(/\s+/g, "").replace(/[“”]/g, '"').toUpperCase(); }
  function QuizWidget(b, el) {
    var st = S.quiz[b.id] || {};
    function score() { var c = 0, a = 0; b.questions.forEach(function (q, i) { if (st[i]) { a++; if (st[i].ok) c++; } }); return { c: c, a: a }; }
    function render() {
      var sc = score();
      var h = '<section class="quiz" aria-label="Test yourself"><div class="quiz-head"><h2 class="title-2">' + esc(b.title || "Test yourself") + '</h2><span class="subhead secondary" aria-live="polite">' + (sc.a ? sc.c + " of " + b.questions.length + " correct" : b.questions.length + " questions") + "</span></div>";
      b.questions.forEach(function (q, i) {
        var s = st[i];
        h += '<div class="q" data-q="' + i + '"><p class="q-prompt"><span class="n">' + (i + 1) + ".</span>" + q.q + "</p>";
        if (q.kind === "fill") {
          h += '<div class="q-fill"><span class="expr">' + esc(q.before || "") + '<input type="text" class="' + (s ? (s.ok ? "ok" : "no") : "") + '" aria-label="Your answer" autocomplete="off" autocapitalize="off" spellcheck="false" value="' + esc(s ? s.v : "") + '">' + esc(q.after || "") + '</span><button class="btn small filled" data-check>Check</button></div>';
        } else {
          h += q.options.map(function (o, k) {
            var cls = "", mark = '<span class="radio"></span>';
            if (s) { if (k === q.answer) { cls = " correct"; mark = '<span class="radio">' + doneMark(22) + "</span>"; } else if (k === s.v) { cls = " wrong"; mark = '<span class="radio">' + wrongMark(22) + "</span>"; } }
            return '<button class="q-opt' + cls + '" data-k="' + k + '"' + (s ? " disabled" : "") + ">" + mark + "<span>" + o + "</span></button>";
          }).join("");
        }
        if (s) h += '<div class="q-why">' + (s.ok ? doneMark(20) : infoMark("var(--orange)")) + "<p><b>" + (s.ok ? "Correct." : "Not quite.") + "</b> " + (q.why || "") + (!s.ok && q.kind === "fill" ? " The answer is <code>" + esc(q.answers[0]) + "</code>." : "") + "</p></div>";
        h += "</div>";
      });
      if (sc.a) h += '<div><button class="btn small plain" data-retry>' + sym("reset", "s") + "Try Again</button></div>";
      el.innerHTML = h + "</section>";
    }
    el.addEventListener("click", function (e) {
      if (e.target.closest("[data-retry]")) { st = {}; S.quiz[b.id] = st; save(); render(); return; }
      var qEl = e.target.closest("[data-q]"); if (!qEl) return;
      var i = +qEl.getAttribute("data-q"), q = b.questions[i];
      var opt = e.target.closest(".q-opt");
      if (opt && !opt.disabled) { var k = +opt.getAttribute("data-k"); st[i] = { v: k, ok: k === q.answer }; finish(); return; }
      if (e.target.closest("[data-check]")) { var inp = $("input", qEl), v = inp.value; if (!v.trim()) { inp.focus(); return; } st[i] = { v: v, ok: q.answers.some(function (a) { return norm(a) === norm(v); }) }; finish(); }
    });
    el.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.matches(".q-fill input")) { e.preventDefault(); e.target.closest(".q-fill").querySelector("[data-check]").click(); } });
    function finish() { S.quiz[b.id] = st; save(); render(); if (score().a === b.questions.length) itemDone(b.id); }
    render();
  }

  /* ================= Tutorial: steps beside a live sheet ================= */
  var CELL_RE = /^\s*(?:<[^>]+>)?\s*([A-Z]{1,3}\d{1,4})\b/;
  function Tutorial(b, el) {
    el.className = "tutorial"; el.setAttribute("data-tutorial", b.id);
    var tasks = (b.tasks && b.tasks.length) ? b.tasks : ["Fill the yellow cells, then press Check Answer."];
    var steps = tasks.map(function (t) { var m = CELL_RE.exec(t); return { html: t, cell: m ? m[1] : null }; });
    el.innerHTML = '<div class="tutorial-steps"><div class="tut-head"><h2 class="title-2">' + esc(b.title || "Try it") + "</h2>" + (b.intro ? "<p>" + b.intro + "</p>" : "") + '</div><div class="tsteps"></div>' +
      '<div class="tut-launch card" style="display:none"></div></div><div class="tut-live"></div>';
    var stepsBox = $(".tsteps", el), live = $(".tut-live", el), launch = $(".tut-launch", el);
    var widget = SheetWidget(b, live, { onChange: paint });
    function paint() {
      var allOk = widget.allCorrect();
      var states = steps.map(function (s) { return s.cell ? widget.cellCorrect(s.cell) : allOk || !!S.items[b.id]; });
      var cur = states.indexOf(false);
      stepsBox.innerHTML = steps.map(function (s, i) {
        return '<button class="tstep' + (states[i] ? " done" : "") + (i === cur ? " current" : "") + '" data-i="' + i + '"><span class="mark">' + (states[i] ? doneMark(22) : i === cur ? currentMark(22) : todoMark(22)) + '</span><span><span class="lbl">Step ' + (i + 1) + (s.cell ? ", cell " + s.cell : "") + "</span>" + s.html + "</span></button>";
      }).join("");
      var doneN = states.filter(Boolean).length;
      launch.innerHTML = '<div style="display:flex;align-items:center;gap:12px"><span class="tile" style="background:var(--green)">' + sym("tableFill") + '</span><div style="flex:1;min-width:0"><div class="headline">Live sheet</div><div class="footnote secondary">' + doneN + " of " + steps.length + ' steps done</div></div><button class="btn filled small tut-open">Open</button></div>';
    }
    stepsBox.addEventListener("click", function (e) {
      var t = e.target.closest(".tstep"); if (!t) return;
      var s = steps[+t.getAttribute("data-i")];
      if (compactMQ.matches) openSheet(widget.root, live, b.title);
      if (s.cell) widget.select(s.cell, true);
      else if (!compactMQ.matches) widget.root.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "nearest" });
    });
    launch.addEventListener("click", function (e) { if (e.target.closest(".tut-open")) openSheet(widget.root, live, b.title); });
    function sizeClass() { launch.style.display = compactMQ.matches ? "" : "none"; live.classList.toggle("compact-hidden", compactMQ.matches); }
    sizeClass();
    var onMQ = function () { closeSheet(true); sizeClass(); };
    compactMQ.addEventListener ? compactMQ.addEventListener("change", onMQ) : compactMQ.addListener(onMQ);
    cleanups.push(function () { compactMQ.removeEventListener ? compactMQ.removeEventListener("change", onMQ) : compactMQ.removeListener(onMQ); });
    paint();
  }

  /* ================= Bottom sheet (compact) ================= */
  var sheetEl = $("#sheet"), sheetBody = $("#sheetBody"), scrimEl = $("#sheetScrim");
  var sheetState = { open: false, node: null, home: null, detent: "medium" };
  function detentY(d) { var h = sheetEl.getBoundingClientRect().height || window.innerHeight * 0.9; return d === "large" ? 0 : d === "medium" ? Math.round(h * 0.36) : h + 40; }
  function setDetent(d) {
    sheetState.detent = d; sheetEl.style.transform = "translateY(" + detentY(d) + "px)";
    scrimEl.classList.toggle("on", d === "large"); $("#grabber").setAttribute("aria-label", d === "large" ? "Make sheet smaller" : "Make sheet larger");
  }
  function openSheet(node, home, title) {
    if (sheetState.open && sheetState.node === node) return;
    closeSheet(true);
    sheetState = { open: true, node: node, home: home, detent: "medium" };
    sheetBody.appendChild(node); sheetEl.setAttribute("aria-label", title || "Try it");
    sheetEl.classList.add("open"); app.classList.add("sheet-open");
    sheetEl.style.transform = "translateY(110%)";
    requestAnimationFrame(function () { requestAnimationFrame(function () { setDetent("medium"); }); });
  }
  function closeSheet(instant) {
    if (!sheetState.open) return;
    var st = sheetState; sheetState = { open: false, node: null, home: null, detent: "closed" };
    app.classList.remove("sheet-open"); scrimEl.classList.remove("on");
    var finish = function () { if (st.home && st.node) st.home.appendChild(st.node); sheetEl.classList.remove("open"); };
    if (instant) { sheetEl.style.transform = "translateY(110%)"; finish(); }
    else { sheetEl.style.transform = "translateY(" + detentY("closed") + "px)"; setTimeout(finish, 380); }
  }
  $("#sheetClose").addEventListener("click", function () { closeSheet(false); });
  scrimEl.addEventListener("click", function () { setDetent("medium"); });
  $("#grabber").addEventListener("click", function () { if (!dragMoved) setDetent(sheetState.detent === "large" ? "medium" : "large"); });
  var drag = null, dragMoved = false;
  function onDown(e) {
    if (!sheetState.open) return;
    if (!e.target.closest(".grabber") && !e.target.closest(".xl-head")) return;
    if (e.target.closest("button:not(.grabber)")) return;
    drag = { y0: e.clientY, base: detentY(sheetState.detent), hist: [{ y: e.clientY, t: performance.now() }] }; dragMoved = false;
    sheetEl.classList.add("dragging"); sheetEl.setPointerCapture && sheetEl.setPointerCapture(e.pointerId);
  }
  function onMove(e) {
    if (!drag) return;
    var dy = e.clientY - drag.y0; if (Math.abs(dy) > 4) dragMoved = true;
    var y = drag.base + dy; if (y < 0) y = y / 4; /* rubber band at the top */
    sheetEl.style.transform = "translateY(" + y + "px)";
    drag.hist.push({ y: e.clientY, t: performance.now() }); if (drag.hist.length > 6) drag.hist.shift();
  }
  function onUp(e) {
    if (!drag) return;
    sheetEl.classList.remove("dragging");
    var h = drag.hist, a = h[0], z = h[h.length - 1], v = (z.y - a.y) / Math.max(1, z.t - a.t) * 1000; /* px/s */
    var cur = drag.base + (e.clientY - drag.y0), projected = cur + (v / 1000) * 0.998 / (1 - 0.998) * 0.12;
    drag = null;
    var opts = [["large", detentY("large")], ["medium", detentY("medium")], ["closed", detentY("closed")]];
    var best = opts.reduce(function (p, o) { return Math.abs(o[1] - projected) < Math.abs(p[1] - projected) ? o : p; });
    if (best[0] === "closed") closeSheet(false); else setDetent(best[0]);
    setTimeout(function () { dragMoved = false; }, 0);
  }
  sheetEl.addEventListener("pointerdown", onDown); window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp); window.addEventListener("pointercancel", onUp);
  window.addEventListener("resize", function () { if (sheetState.open) setDetent(sheetState.detent); });

  /* ================= Live sheet widget ================= */
  function cellsFromSpec(spec) { var cells = {}; Object.keys(spec.cells || {}).forEach(function (k) { cells[k.toUpperCase()] = spec.cells[k]; }); return cells; }
  function classMap(spec) { var m = {}; Object.keys(spec.styles || {}).forEach(function (c) { XL.expandList(spec.styles[c]).forEach(function (a) { (m[a] = m[a] || []).push(c); }); }); return m; }
  function fmtMap(spec) { var m = {}; Object.keys(spec.formats || {}).forEach(function (r) { XL.rangeCells(r).forEach(function (a) { m[a] = spec.formats[r]; }); }); return m; }
  function same(a, b) {
    if (XL.isErr(a) || XL.isErr(b)) return XL.isErr(a) && XL.isErr(b) && a.err === b.err;
    if (typeof b === "number") return typeof a === "number" && Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
    if (typeof b === "string") return typeof a === "string" && a.trim().toLowerCase() === b.trim().toLowerCase();
    return a === b;
  }
  function SheetWidget(spec, mount, opt) {
    opt = opt || {};
    var ro = !!spec.readonly;
    var colSpec = spec.cols || "A:F", cols = [];
    if (Array.isArray(colSpec)) cols = colSpec.map(function (x) { return XL.colToNum(x); });
    else { var a1 = XL.colToNum(colSpec.split(":")[0]), a2 = XL.colToNum(colSpec.split(":")[1]); for (var cc = a1; cc <= a2; cc++) cols.push(cc); }
    function colStep(c, d) { var i = cols.indexOf(c) + d; return i >= 0 && i < cols.length ? cols[i] : null; }
    var r1 = spec.rows[0], r2 = spec.rows[1];
    var base = cellsFromSpec(spec), editable = {};
    XL.expandList(spec.editable || []).forEach(function (a) { editable[a] = true; });
    var choices = spec.choices || {}, cls = classMap(spec), fmts = fmtMap(spec);
    var sheet = new XL.Sheet({ cells: base, names: spec.names });
    var saved = !ro && S.sheets[spec.id];
    if (saved) Object.keys(saved).forEach(function (a) { if (saved[a] === null) delete sheet.raw[a]; else sheet.raw[a] = saved[a]; });
    sheet.invalidate();
    var sel = spec.start || Object.keys(editable)[0] || XL.addr(cols[0], r1);
    var showF = false, marks = {}, note = null, hintN = 0, pointIns = null, msg = null, solvedCache = null;
    var checkCells = spec.check ? XL.expandList(spec.check.cells) : [];

    var root = document.createElement("div");
    root.className = "xl" + (ro ? " ro" : "") + (spec.check && S.items[spec.id] ? " is-done" : "");
    root.innerHTML = (ro ? "" : '<div class="xl-head"><span class="t">' + esc(spec.title || "Try it") + '</span><span class="badge green done-badge">' + sym("check", "xs") + ' Done</span><div class="seg" role="group" aria-label="Show"><button data-view="r" aria-pressed="true">Results</button><button data-view="f" aria-pressed="false">Formulas</button></div></div>') +
      '<div class="fbar"' + (ro ? ' style="margin-top:14px"' : "") + '><span class="namebox" aria-label="Selected cell"></span><span class="fx" aria-hidden="true">fx</span><input type="text" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Formula bar"' + (ro ? " disabled" : "") + ">" + (ro ? "" : '<button class="f4" type="button" title="Cycle $ signs on the address at the cursor (F4)">$ F4</button>') + "</div>" +
      '<div class="xl-msg" aria-live="polite"></div><div class="grid-wrap" tabindex="0" aria-label="Spreadsheet. Arrow keys move, Return edits."><table class="grid"></table></div>' +
      (ro ? '<div style="height:14px"></div>' : '<div class="xl-legend"><span><i style="background:var(--yours)"></i>Your cells</span><span><i style="background:var(--cell);box-shadow:inset 0 0 0 1.5px var(--cell-input)"></i><span style="color:var(--cell-input)">Blue</span> inputs</span></div><div class="xl-out"></div>' +
        '<div class="xl-actions">' + (spec.check ? '<button class="btn filled" data-act="check">Check Answer</button>' : "") +
        (spec.fill ? '<button class="btn gray" data-act="fill">' + sym("copy", "s") + esc(spec.fill.label || "Copy") + "</button>" : "") +
        (spec.hints ? '<button class="btn gray" data-act="hint" aria-label="Hint">' + sym("bulb", "s") + "Hint</button>" : "") +
        (spec.solution ? '<button class="btn plain" data-act="solution">Show Solution</button>' : "") +
        '<span class="grow"></span><span class="reset-zone"><button class="btn destructive" data-act="reset">Reset</button></span></div>');
    mount.appendChild(root);
    var table = $("table.grid", root), input = $(".fbar input", root), namebox = $(".namebox", root), msgEl = $(".xl-msg", root), out = $(".xl-out", root), gridWrap = $(".grid-wrap", root);

    function persist() {
      if (ro) return;
      var o = {};
      Object.keys(editable).concat(Object.keys(choices)).forEach(function (a) { if (sheet.raw[a] !== base[a]) o[a] = sheet.raw[a] === undefined ? null : sheet.raw[a]; });
      if (spec.fill) XL.rangeCells(spec.fill.to).forEach(function (a) { if (sheet.raw[a] !== base[a]) o[a] = sheet.raw[a] === undefined ? null : sheet.raw[a]; });
      S.sheets[spec.id] = o; save();
    }
    function isEditable(a) { return !ro && !!editable[a]; }
    function display(a) {
      var raw = sheet.raw[a];
      if (showF && typeof raw === "string" && raw.charAt(0) === "=") return { text: raw, cls: "showf" };
      var v = sheet.value(a);
      if (v === null) return { text: "", cls: "" };
      if (XL.isErr(v)) return { text: v.err, cls: "err" };
      if (typeof v === "boolean") return { text: v ? "TRUE" : "FALSE", cls: "bool" };
      if (typeof v === "number") return { text: XL.format(v, fmts[a]), cls: "num" };
      return { text: String(v), cls: "" };
    }
    function refMap() {
      var map = {}, t = input.value;
      if ((document.activeElement === input || ro || !isEditable(sel)) && t.charAt(0) === "=") XL.refsIn(t).forEach(function (r, i) { XL.rangeCells(r).forEach(function (a) { if (!(a in map)) map[a] = "ref" + (i % 4); }); });
      return map;
    }
    function render() {
      var raw = sheet.raw[sel];
      if (document.activeElement !== input) input.value = raw == null ? "" : String(raw);
      var refs = refMap(), sp = XL.parseAddr(sel);
      var h = "<thead><tr><th></th>" + cols.map(function (c) { return '<th class="' + (sp && sp.c === c ? "hl" : "") + '">' + XL.numToCol(c) + "</th>"; }).join("") + "</tr></thead><tbody>";
      for (var r = r1; r <= r2; r++) {
        h += '<tr><th class="rowh' + (sp && sp.r === r ? " hl" : "") + '">' + r + "</th>";
        cols.forEach(function (c) {
          var a = XL.addr(c, r), d = display(a), k = (cls[a] || []).slice();
          if (d.cls) k.push(d.cls);
          if (isEditable(a)) k.push("yours");
          if (refs[a]) k.push(refs[a]);
          if (marks[a]) k.push(marks[a]);
          if (a === sel) k.push("sel");
          var content = esc(d.text);
          if (choices[a] && !ro) content = '<select data-choice="' + a + '" aria-label="Choose a value for ' + a + '">' + choices[a].map(function (o) { return "<option" + (o === sheet.raw[a] ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select>";
          h += '<td class="' + k.join(" ") + '" data-a="' + a + '" title="' + esc(d.text) + '">' + content + "</td>";
        });
        h += "</tr>";
      }
      table.innerHTML = h + "</tbody>";
      namebox.textContent = sel;
      var ed = isEditable(sel); input.disabled = ro || !ed;
      var f4 = $(".f4", root); if (f4) f4.disabled = !ed;
      var m = msg;
      if (!m) m = ro ? { text: "Click a cell to see what it holds." } : ed ? { text: "Type in the formula bar, then press Return. While typing, click cells to add their addresses." } : sheet.isFormula(sel) ? { text: "This formula is already there. Your cells are yellow." } : { text: "This is a given value. Your cells are yellow." };
      msgEl.className = "xl-msg" + (m.kind === "err" ? " err" : ""); msgEl.textContent = m.text;
    }
    function renderNote() {
      if (!out) return;
      if (!note) { out.innerHTML = ""; return; }
      var g = note.kind === "ok" ? doneMark(22) : note.kind === "hint" ? bulbMark() : note.kind === "no" ? warnMark() : infoMark();
      out.innerHTML = '<div class="xl-note ' + note.kind + '" role="status">' + g + "<div>" + note.html + "</div></div>";
    }
    function changed() { solvedCache = null; if (opt.onChange) opt.onChange(); }
    function select(a, focusInput) {
      sel = a; msg = null; pointIns = null; render();
      var td = $('td[data-a="' + a + '"]', table); if (td && td.scrollIntoView) td.scrollIntoView({ block: "nearest", inline: "nearest" });
      if (focusInput && isEditable(a)) { setTimeout(function () { input.focus(); input.setSelectionRange(input.value.length, input.value.length); render(); }, 30); }
      else gridWrap.focus({ preventScroll: true });
    }
    function commit(move) {
      if (!isEditable(sel)) return true;
      var v = input.value.trim();
      if (v.charAt(0) === "=") {
        if (/^=\s*$/.test(v)) { msg = { kind: "err", text: "Type something after the = sign." }; render(); return false; }
        var p = XL.check(v); if (p) { msg = { kind: "err", text: "There's a problem with this formula. " + p }; render(); return false; }
      }
      sheet.set(sel, v === "" ? null : v); marks = {}; note = null; renderNote(); persist();
      var val = sheet.value(sel);
      msg = XL.isErr(val) ? { kind: "err", text: sel + " shows " + val.err + ". " + (val.why || "") } : null;
      if (move) {
        var pp = XL.parseAddr(sel), nc = move === "down" ? pp.c : colStep(pp.c, 1), nr = move === "down" ? pp.r + 1 : pp.r;
        if (nc !== null && nr <= r2) { var nx = XL.addr(nc, nr); if (isEditable(nx) || move === "right") sel = nx; }
      }
      input.blur(); render(); gridWrap.focus({ preventScroll: true }); changed();
      return true;
    }
    table.addEventListener("mousedown", function (e) {
      var td = e.target.closest("td[data-a]"); if (!td || e.target.closest("select")) return;
      var a = td.getAttribute("data-a");
      if (document.activeElement === input && !input.disabled && input.value.charAt(0) === "=") {
        var pos = input.selectionStart, before = input.value.slice(0, pos);
        if (e.shiftKey && pointIns) { e.preventDefault(); var rg = pointIns.addr + ":" + a; input.value = input.value.slice(0, pointIns.pos) + rg + input.value.slice(pointIns.pos + pointIns.len); var np = pointIns.pos + rg.length; pointIns.len = rg.length; input.setSelectionRange(np, np); render(); input.focus(); return; }
        if (/[=(,+\-*/^&<>:]\s*$/.test(before)) { e.preventDefault(); input.value = before + a + input.value.slice(pos); var cp = pos + a.length; pointIns = { pos: pos, len: a.length, addr: a }; input.setSelectionRange(cp, cp); render(); input.focus(); return; }
        if (!commit(null)) { e.preventDefault(); return; }
      }
      e.preventDefault(); select(a, false);
    });
    table.addEventListener("dblclick", function (e) { var td = e.target.closest("td[data-a]"); if (td && isEditable(td.getAttribute("data-a"))) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } });
    table.addEventListener("change", function (e) { var s = e.target.closest("select[data-choice]"); if (!s) return; sheet.set(s.getAttribute("data-choice"), s.value); marks = {}; note = null; renderNote(); persist(); render(); changed(); });
    input.addEventListener("focus", function () { if (isEditable(sel)) { msg = null; render(); } });
    input.addEventListener("input", function () { pointIns = null; msg = null; render(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); commit("down"); }
      else if (e.key === "Tab") { if (commit("right")) e.preventDefault(); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); var raw = sheet.raw[sel]; input.value = raw == null ? "" : String(raw); msg = null; input.blur(); render(); gridWrap.focus({ preventScroll: true }); }
      else if (e.key === "F4") { e.preventDefault(); f4(); }
    });
    function f4() {
      var t = XL.toggleAbs(input.value, input.selectionStart == null ? input.value.length : input.selectionStart);
      if (t.changed) { input.value = t.text; input.focus(); input.setSelectionRange(t.caret, t.caret); msg = { text: "F4 made it " + t.ref + ". Press again to cycle $A$1, A$1, $A1, A1." }; render(); }
      else { input.focus(); msg = { text: "Put the cursor on a cell address first, then press F4." }; render(); }
    }
    var f4b = $(".f4", root); if (f4b) { f4b.addEventListener("mousedown", function (e) { e.preventDefault(); }); f4b.addEventListener("click", f4); }
    gridWrap.addEventListener("keydown", function (e) {
      if (e.target !== gridWrap) return;
      var p = XL.parseAddr(sel), n = null;
      if (e.key === "ArrowUp") n = [p.c, p.r - 1]; else if (e.key === "ArrowDown") n = [p.c, p.r + 1];
      else if (e.key === "ArrowLeft") n = [colStep(p.c, -1), p.r]; else if (e.key === "ArrowRight") n = [colStep(p.c, 1), p.r];
      if (n) { e.preventDefault(); if (n[0] !== null && n[1] >= r1 && n[1] <= r2) select(XL.addr(n[0], n[1]), false); return; }
      if (!isEditable(sel)) return;
      if (e.key === "Enter" || e.key === "F2") { e.preventDefault(); input.focus(); input.setSelectionRange(input.value.length, input.value.length); return; }
      if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); input.value = ""; commit(null); return; }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); input.value = e.key; input.focus(); input.setSelectionRange(1, 1); msg = null; render(); }
    });
    function solved() {
      if (solvedCache) return solvedCache;
      var s2 = sheet.clone();
      Object.keys(spec.solution || {}).forEach(function (a) { s2.raw[a] = spec.solution[a]; });
      if (spec.fill && spec.check && spec.check.fill !== false) s2.fill(spec.fill.from, spec.fill.to);
      s2.invalidate(); solvedCache = s2; return s2;
    }
    function cellCorrect(a) {
      if (!spec.solution) return false;
      var raw = sheet.raw[a]; if (raw === undefined || raw === null || raw === "") return false;
      var want = solved().value(a);
      if (!same(sheet.value(a), want)) return false;
      if (editable[a] && typeof want === "number" && !(typeof raw === "string" && raw.charAt(0) === "=") && !(spec.cells || {})[a]) return false;
      return true;
    }
    function allCorrect() { return checkCells.length > 0 && checkCells.every(cellCorrect); }
    function check() {
      var wrong = [], empty = [], typed = []; marks = {};
      var s2 = solved();
      checkCells.forEach(function (a) {
        var raw = sheet.raw[a], got = sheet.value(a), want = s2.value(a);
        if (raw === undefined || raw === null || raw === "") { empty.push(a); marks[a] = "wrong"; return; }
        if (!same(got, want)) { wrong.push(a); marks[a] = "wrong"; return; }
        if (editable[a] && typeof want === "number" && !(typeof raw === "string" && raw.charAt(0) === "=") && !(spec.cells || {})[a]) { typed.push(a); marks[a] = "wrong"; return; }
        marks[a] = "right";
      });
      var needs = (spec.check.require || []).filter(function (rq) { return String(sheet.raw[rq.cell] || "").toUpperCase().indexOf(rq.has.toUpperCase()) < 0; });
      if (!wrong.length && !empty.length && !typed.length && !needs.length) {
        note = { kind: "ok", html: spec.check.success || "Everything matches." };
        root.classList.add("is-done"); itemDone(spec.id);
      } else {
        var parts = [];
        if (empty.length) {
          parts.push(empty.length === 1 ? "<b>" + empty[0] + "</b> is still empty." : "<b>" + empty.length + " cells</b> are still empty, starting with " + empty[0] + ".");
          if (spec.fill && XL.rangeCells(spec.fill.to).indexOf(empty[0]) >= 0 && !editable[empty[0]]) parts.push("Write the formula in " + esc(spec.fill.from) + ", then press <b>" + esc(spec.fill.label || "Copy") + "</b>.");
        }
        if (typed.length) parts.push("<b>" + typed[0] + "</b> has the right number, typed in. Use a formula that points at the cells, so it updates when an input changes.");
        if (wrong.length) {
          var f = wrong[0], gv = sheet.value(f);
          parts.push(XL.isErr(gv) ? "<b>" + f + "</b> shows " + gv.err + ". " + esc(gv.why || "") : (wrong.length === 1 ? "<b>" + f + "</b> doesn't match yet" : "<b>" + wrong.length + " cells</b> don't match yet, starting with " + f) + ". It shows " + esc(display(f).text) + ".");
          var why = (spec.check.why || {})[f]; if (why) parts.push(why);
        }
        needs.forEach(function (rq) { parts.push(rq.msg || "Use " + esc(rq.has.replace("(", "")) + " in " + rq.cell + "."); });
        note = { kind: "no", html: parts.join(" ") + (spec.hints ? " Stuck? Press <b>Hint</b>." : "") };
      }
      render(); renderNote(); changed();
    }
    if (!ro) root.addEventListener("click", function (e) {
      var v = e.target.closest("[data-view]");
      if (v) { showF = v.getAttribute("data-view") === "f"; $$("[data-view]", root).forEach(function (bb) { bb.setAttribute("aria-pressed", String(bb === v)); }); render(); return; }
      var b = e.target.closest("[data-act]"); if (!b) return;
      var act = b.getAttribute("data-act");
      if (act === "check") check();
      if (act === "fill") {
        var src = sheet.raw[spec.fill.from.split(":")[0]];
        if (src == null || src === "") { note = { kind: "no", html: "Write the formula in " + esc(spec.fill.from) + " first, then copy it." }; renderNote(); return; }
        sheet.fill(spec.fill.from, spec.fill.to); marks = {}; persist();
        note = { kind: "info", html: "Copied " + esc(spec.fill.from) + " to " + esc(spec.fill.to) + ". Switch to <b>Formulas</b> to see how Excel moved each address." + (spec.check ? " Then press <b>Check Answer</b>." : "") };
        render(); renderNote(); changed();
      }
      if (act === "hint") { var i = Math.min(hintN, spec.hints.length - 1); note = { kind: "hint", html: "<b>Hint " + (i + 1) + " of " + spec.hints.length + ".</b> " + spec.hints[i] }; hintN++; renderNote(); }
      if (act === "solution") {
        var ex = spec.explain || {};
        note = { kind: "info", html: "<b>Worked solution</b>" + '<ol class="sol-list">' + Object.keys(spec.solution).map(function (a) { return '<li><span class="sol-cell">' + a + "</span><code>" + esc(spec.solution[a]) + "</code>" + (ex[a] ? '<span class="sol-why">' + ex[a] + "</span>" : "") + "</li>"; }).join("") + "</ol>" +
          (spec.fill ? "<p>Then copy " + esc(spec.fill.from) + " to " + esc(spec.fill.to) + (ex.fill ? ". " + ex.fill : ".") + "</p>" : "") + (ex.result ? "<p>" + ex.result + "</p>" : "") + '<button class="btn small gray" data-act="apply" style="margin-top:8px">Fill It In for Me</button>' };
        renderNote();
      }
      if (act === "apply") {
        Object.keys(spec.solution).forEach(function (a) { sheet.raw[a] = spec.solution[a]; });
        if (spec.fill) sheet.fill(spec.fill.from, spec.fill.to);
        sheet.invalidate(); persist(); marks = {};
        note = { kind: "info", html: "Filled in. Click each yellow cell to read its formula, then do the same task in Excel." }; render(); renderNote(); changed();
      }
      if (act === "reset") $(".reset-zone", root).innerHTML = '<span class="confirm">Clear your work?<button class="btn destructive" data-act="reset-yes">Clear</button><button class="btn plain" data-act="reset-no">Keep</button></span>';
      if (act === "reset-no") $(".reset-zone", root).innerHTML = '<button class="btn destructive" data-act="reset">Reset</button>';
      if (act === "reset-yes") {
        sheet = new XL.Sheet({ cells: base, names: spec.names }); delete S.sheets[spec.id]; save(); marks = {}; note = null; hintN = 0; msg = null;
        $(".reset-zone", root).innerHTML = '<button class="btn destructive" data-act="reset">Reset</button>'; render(); renderNote(); changed();
      }
    });
    render();
    return { root: root, select: select, cellCorrect: cellCorrect, allCorrect: allCorrect };
  }

  /* ================= Widgets ================= */
  var WIDGETS = {};
  WIDGETS.shortcuts = function (b, el) {
    var list = (C.shortcuts || []).filter(function (s) { return !b.only || b.only.indexOf(s.id) >= 0; });
    function keys(s) { return s.split(" / ").map(function (combo) { return combo.split("+").map(function (k) { return "<kbd>" + esc(k) + "</kbd>"; }).join(" "); }).join(' <span class="footnote secondary">or</span> '); }
    function render() {
      el.innerHTML = '<section class="widget"><div class="widget-head"><span class="tile" style="background:var(--gray)">' + sym("keyboard") + '</span><span class="grow">' + esc(b.title || "Shortcuts") + '</span><div class="seg" role="group" aria-label="Keyboard"><button data-os="win" aria-pressed="' + (S.os === "win") + '">Windows</button><button data-os="mac" aria-pressed="' + (S.os === "mac") + '">Mac</button></div></div>' +
        '<div class="table-wrap" style="background:transparent"><table class="data"><tbody>' + list.map(function (s) { return "<tr><td>" + esc(s.action) + (s.why ? '<br><span class="footnote secondary">' + esc(s.why) + "</span>" : "") + '</td><td style="text-align:right;white-space:nowrap">' + keys(S.os === "mac" ? s.mac : s.win) + "</td></tr>"; }).join("") + "</tbody></table></div></section>";
    }
    el.addEventListener("click", function (e) { var t = e.target.closest("[data-os]"); if (!t) return; S.os = t.getAttribute("data-os"); save(); render(); });
    render();
  };
  WIDGETS.formats = function (b, el) {
    var codes = [{ code: "#,##0", label: "Thousands" }, { code: "#,##0;(#,##0)", label: "Brackets" }, { code: '#,##0;(#,##0);"-"', label: "Zero as dash" }, { code: "0.0%", label: "Percent" }, { code: '0.0"x"', label: "Multiple" }, { code: "#,##0.00", label: "Two decimals" }, { code: "General", label: "General" }];
    var id = ++uid;
    el.innerHTML = '<section class="widget"><div class="widget-head"><span class="tile" style="background:var(--indigo)">' + sym("pencil") + '</span><span class="grow">' + esc(b.title || "Format playground") + '</span></div><div class="fields"><div class="field"><label for="fv' + id + '">Value in the cell</label><input id="fv' + id + '" class="fv" inputmode="decimal" value="' + esc(b.value || "-45230") + '"></div><div class="field"><label for="fc' + id + '">Format code</label><input id="fc' + id + '" class="fc" spellcheck="false" value="' + esc(b.code || "#,##0;(#,##0)") + '"></div></div>' +
      '<div class="chips" role="group" aria-label="Example codes">' + codes.map(function (c) { return '<button class="chip-btn" data-code="' + esc(c.code) + '" aria-pressed="false">' + esc(c.label) + "</button>"; }).join("") + '</div><div class="cellview" aria-live="polite"></div><p class="subhead secondary expl"></p></section>';
    var fv = $(".fv", el), fc = $(".fc", el), out = $(".cellview", el), ex = $(".expl", el);
    function render() {
      var raw = fv.value.replace(/,/g, "").trim(), pct = /%$/.test(raw), v = parseFloat(raw.replace(/%$/, "")); if (pct) v /= 100;
      var code = fc.value; out.textContent = raw === "" ? "" : isFinite(v) ? XL.format(v, code) : fv.value;
      var secs = code.split(";").length, used = v > 0 ? "the first part (positive)" : v < 0 ? (secs >= 2 ? "the second part (negative)" : "the first part, with a minus sign") : (secs >= 3 ? "the third part (zero)" : "the first part");
      ex.innerHTML = isFinite(v) ? "The cell still holds <b>" + esc(String(v)) + "</b>. This code has " + secs + " part" + (secs > 1 ? "s" : "") + ", and this value uses " + used + "." : "Type a number to see it formatted.";
      $$("[data-code]", el).forEach(function (t) { t.setAttribute("aria-pressed", String(t.getAttribute("data-code") === code)); });
    }
    el.addEventListener("click", function (e) { var t = e.target.closest("[data-code]"); if (!t) return; fc.value = t.getAttribute("data-code"); render(); });
    fv.addEventListener("input", render); fc.addEventListener("input", render); render();
  };
  WIDGETS.colours = function (b, el) {
    var st = (S.steps[b.id] || []).slice(), checked = false;
    function render() {
      var right = b.items.filter(function (it, i) { return st[i] === it.answer; }).length;
      el.innerHTML = '<section class="widget"><div class="widget-head"><span class="tile" style="background:var(--blue)">' + sym("layers") + '</span><span class="grow">' + esc(b.title || "Which colour?") + "</span></div>" + (b.intro ? '<p class="subhead secondary">' + b.intro + "</p>" : "") +
        "<div>" + b.items.map(function (it, i) {
          var pick = st[i], res = checked && pick ? (pick === it.answer ? doneMark(22) : wrongMark(22)) : "";
          return '<div class="sort-row"><span class="what">' + esc(it.cell) + "<small>" + esc(it.note || "") + '</small></span><div class="seg" role="group" aria-label="Colour for ' + esc(it.cell) + '">' + ["Blue", "Black", "Green"].map(function (c) { return '<button data-i="' + i + '" data-c="' + c + '" aria-pressed="' + (pick === c) + '" style="' + (c === "Blue" ? "color:var(--cell-input)" : c === "Green" ? "color:var(--cell-link)" : "") + '">' + c + "</button>"; }).join("") + '</div><span class="mark">' + res + "</span></div>";
        }).join("") + '</div><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button class="btn filled" data-check>Check Answer</button><span class="subhead secondary" aria-live="polite">' + (checked ? (right === b.items.length ? "All " + right + " right." : right + " of " + b.items.length + " right. Ask: typed, calculated here, or from another tab?") : "") + "</span></div></section>";
    }
    el.addEventListener("click", function (e) {
      var t = e.target.closest("[data-c]");
      if (t) { st[+t.getAttribute("data-i")] = t.getAttribute("data-c"); S.steps[b.id] = st; save(); checked = false; render(); return; }
      if (e.target.closest("[data-check]")) { checked = true; render(); if (b.items.every(function (it, i) { return st[i] === it.answer; })) itemDone(b.id); }
    });
    render();
  };
  WIDGETS.logic = function (b, el) {
    var id = ++uid;
    el.innerHTML = '<section class="widget"><div class="widget-head"><span class="tile" style="background:var(--orange)">' + sym("target") + '</span><span class="grow">' + esc(b.title || "Be the lender") + "</span></div>" + (b.intro ? '<p class="subhead secondary">' + b.intro + "</p>" : "") +
      '<div class="lab"><div class="slider"><div class="row-h"><label for="cr' + id + '">Current ratio</label><output class="cro"></output></div><input id="cr' + id + '" class="cr" type="range" min="0.4" max="3" step="0.01" value="1.48"><span class="footnote secondary">Current assets ÷ current liabilities</span></div>' +
      '<div class="slider"><div class="row-h"><label for="de' + id + '">Debt / equity</label><output class="deo"></output></div><input id="de' + id + '" class="de" type="range" min="0" max="4" step="0.01" value="0.57"><span class="footnote secondary">Total debt ÷ equity</span></div></div>' +
      '<div class="lab"><div class="trace"><span class="footnote secondary">Liquidity with IFS: tests run in order, the first TRUE wins</span><span class="big liq"></span><div class="rows ifs"></div></div><div class="trace"><span class="footnote secondary">Loan with AND: every test must be TRUE</span><span class="big loan"></span><div class="rows and"></div></div></div></section>';
    var cr = $(".cr", el), de = $(".de", el);
    function chip(v) { return '<span class="tf ' + (v ? "t" : "f") + '">' + (v ? "TRUE" : "FALSE") + "</span>"; }
    function render() {
      var c = +cr.value, d = +de.value;
      cr.style.setProperty("--p", ((c - 0.4) / 2.6 * 100) + "%"); de.style.setProperty("--p", (d / 4 * 100) + "%");
      $(".cro", el).textContent = c.toFixed(2) + "x"; $(".deo", el).textContent = d.toFixed(2) + "x";
      var tests = [[c < 1, c.toFixed(2) + " < 1", "Weak"], [c <= 2, c.toFixed(2) + " <= 2", "Adequate"], [true, "TRUE", "Strong"]], hit = tests.findIndex(function (t) { return t[0]; });
      $(".liq", el).textContent = tests[hit][2];
      $(".ifs", el).innerHTML = tests.map(function (t, i) { return '<div class="' + (i === hit ? "hit" : "") + '"><span>' + esc(t[1]) + ' → "' + t[2] + '"</span>' + (i <= hit ? chip(t[0]) : '<span class="tf f">skipped</span>') + "</div>"; }).join("");
      var t1 = c >= 1.2, t2 = d <= 2;
      $(".loan", el).textContent = t1 && t2 ? "Yes" : "No";
      $(".and", el).innerHTML = "<div><span>" + c.toFixed(2) + " >= 1.2</span>" + chip(t1) + "</div><div><span>" + d.toFixed(2) + " <= 2</span>" + chip(t2) + '</div><div class="hit"><span>AND(…)</span>' + chip(t1 && t2) + "</div>";
    }
    cr.addEventListener("input", render); de.addEventListener("input", render); render();
  };
  WIDGETS.lookup = function (b, el) {
    var rows = b.rows, cols = b.cols, look = b.look || 1, ret = 2, id = ++uid;
    el.innerHTML = '<section class="widget"><div class="widget-head"><span class="tile" style="background:var(--teal)">' + sym("search") + '</span><span class="grow">' + esc(b.title || "Lookup explorer") + '</span><div class="seg" role="group" aria-label="Column to bring back">' + cols.map(function (c, i) { return i === look ? "" : '<button data-ret="' + i + '" aria-pressed="' + (i === ret) + '">' + esc(c.label) + "</button>"; }).join("") + "</div></div>" +
      '<div class="field" style="max-width:320px"><label for="lk' + id + '">Find this company</label><select id="lk' + id + '" class="pick">' + rows.map(function (r) { return "<option" + (r[look] === b.pick ? " selected" : "") + ">" + esc(r[look]) + "</option>"; }).join("") + "</select></div>" +
      '<div class="say"><div class="find"><b>Find this</b><span class="s1"></span></div><div class="in"><b>In here</b><span class="s2"></span></div><div class="bring"><b>Bring back that</b><span class="s3"></span></div></div><div class="table-wrap" style="background:var(--fill)"><table class="data lk"></table></div><div class="codeline xf"></div><div class="codeline imf"></div><p class="subhead secondary lkx"></p></section>';
    var sel = $(".pick", el);
    function render() {
      var idx = rows.findIndex(function (r) { return r[look] === sel.value; }), first = b.firstRow || 6, last = first + rows.length - 1, L = cols[look].col, R = cols[ret].col;
      $(".lk", el).innerHTML = "<thead><tr><th>Row</th>" + cols.map(function (c, i) { return '<th class="' + (c.num ? "num" : "") + '">' + c.col + " " + esc(c.label) + "</th>"; }).join("") + "</tr></thead><tbody>" + rows.map(function (r, i) { return '<tr class="' + (i === idx ? "match" : "") + '"><td class="secondary">' + (first + i) + "</td>" + r.map(function (v, k) { return '<td class="' + (cols[k].num ? "num " : "") + (k === look ? "look" : k === ret ? "ret" : "") + '">' + esc(cols[k].num ? Number(v).toFixed(cols[k].dp || 0) : v) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody>";
      var res = rows[idx][ret]; if (cols[ret].num) res = Number(res).toFixed(cols[ret].dp || 0);
      $(".s1", el).textContent = '"' + sel.value + '"'; $(".s2", el).textContent = cols[look].label + ", " + L + first + ":" + L + last; $(".s3", el).textContent = cols[ret].label + ", " + R + first + ":" + R + last;
      $(".xf", el).textContent = '=XLOOKUP("' + sel.value + '", ' + L + first + ":" + L + last + ", " + R + first + ":" + R + last + ', "Not found")   gives   ' + res;
      $(".imf", el).textContent = "=INDEX(" + R + first + ":" + R + last + ', MATCH("' + sel.value + '", ' + L + first + ":" + L + last + ", 0))   gives   " + res;
      $(".lkx", el).innerHTML = "MATCH finds <b>" + esc(sel.value) + "</b> in position " + (idx + 1) + ". INDEX brings back item " + (idx + 1) + " of the " + esc(cols[ret].label.toLowerCase()) + " column." + (ret < look ? " That column is to the left of the names: XLOOKUP and INDEX-MATCH can do this, VLOOKUP can't." : "");
      $$("[data-ret]", el).forEach(function (t) { t.setAttribute("aria-pressed", String(+t.getAttribute("data-ret") === ret)); });
    }
    sel.addEventListener("change", render);
    el.addEventListener("click", function (e) { var t = e.target.closest("[data-ret]"); if (!t) return; ret = +t.getAttribute("data-ret"); render(); });
    render();
  };
  WIDGETS.timeline = function (b, el, owner) { RENDER.timeline(b, el, owner); };
  WIDGETS.functions = function (b, el) {
    var legacy = [];
    WEEKS.forEach(function (w) { if (w.data && w.data.functions) w.data.functions.forEach(function (f) { if (!FN_CARDS[f.name]) legacy.push(Object.assign({ week: w.meta.n }, f)); }); });
    var all = FN_LIST.map(function (f) { return { name: f.block.name, does: strip(f.block.does), syntax: "=" + f.block.syntax, lesson: f.lesson, card: f.block, cat: f.block.cat || "" }; })
      .concat(legacy.map(function (f) { return { name: f.name, does: f.does, syntax: f.syntax, lesson: f.lesson && BY_ID[f.lesson], week: f.week, cat: "" }; }));
    all.sort(function (a, c) { return a.name < c.name ? -1 : 1; });
    el.innerHTML = '<label class="search-field" style="margin:0 0 14px;height:44px;max-width:420px">' + sym("search", "s") + '<input class="ff" type="search" placeholder="Filter functions" aria-label="Filter functions"></label><p class="footnote secondary" style="margin:0 4px 12px">' + all.length + ' functions. Open one to see its arguments, examples and common mistakes.</p><div class="fguide"></div>';
    function render(q) {
      q = (q || "").toLowerCase();
      var rows = all.filter(function (f) { return !q || (f.name + " " + f.does + " " + f.cat).toLowerCase().indexOf(q) >= 0; });
      $(".fguide", el).innerHTML = rows.length ? rows.map(function (f, i) {
        return '<div class="fg-item"><button class="fg-row" aria-expanded="false" data-i="' + all.indexOf(f) + '"><span class="row-body"><span class="row-title strong mono">' + esc(f.name) + '</span><span class="row-sub">' + esc(f.does) + '</span></span><span class="row-detail">' + esc(f.lesson ? (f.lesson.num || "") + " Week " + f.lesson.week : "Week " + f.week) + "</span>" + sym("chev", "xs chev") + '</button><div class="fg-body"></div></div>';
      }).join("") : '<div class="empty">' + sym("search", "l") + '<span class="headline">No function matches "' + esc(q) + '"</span><span class="subhead">Try SUM, LOOKUP or PMT.</span></div>';
    }
    el.addEventListener("click", function (e) {
      var r = e.target.closest(".fg-row"); if (!r) return;
      var f = all[+r.getAttribute("data-i")], body = r.nextElementSibling, open = r.getAttribute("aria-expanded") !== "true";
      r.setAttribute("aria-expanded", String(open));
      if (open && !body.firstChild) {
        if (f.card) { var d = document.createElement("div"); body.appendChild(d); FnCard(f.card, d); d.removeAttribute("id"); }
        else body.innerHTML = '<div class="fn"><p class="fn-does">' + esc(f.does) + '</p><div class="fn-syntax"><code>' + esc(f.syntax) + "</code></div>" + (f.lesson ? '<a class="btn small gray" href="#' + f.lesson.id + '">Open ' + esc(f.lesson.num || f.lesson.title) + "</a>" : "") + "</div>";
      }
      body.classList.toggle("open", open);
    });
    $(".ff", el).addEventListener("input", function (e) { render(e.target.value); }); render("");
  };

  /* ================= Global keys ================= */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sheetState.open) { closeSheet(false); return; }
    if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      e.preventDefault();
      if (compactMQ.matches) location.hash = "#search"; else { var s = $("#sideSearch"); if (s) { if (S.sideHidden) { S.sideHidden = false; app.classList.remove("side-hidden"); updateSideToggle(); } s.focus(); } }
    }
  });

  route();
})();
