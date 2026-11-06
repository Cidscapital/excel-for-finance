/*!
 * Mini spreadsheet engine for the course's "Try it" sheets.
 * Parses and evaluates Excel-style formulas, copies formulas with relative/absolute references,
 * toggles $ like F4, and formats numbers with Excel custom format codes.
 * Exposes window.XL (browser) or module.exports (Node, for tests).
 */
(function (root) {
  "use strict";

  /* ---------- Errors ---------- */
  function XLError(code, why) { this.err = code; this.why = why || ""; }
  XLError.prototype.toString = function () { return this.err; };
  var ERR = {
    DIV0: function () { return new XLError("#DIV/0!", "A number was divided by zero or by an empty cell."); },
    NA: function (w) { return new XLError("#N/A", w || "The value you looked for isn't in the list."); },
    NAME: function (w) { return new XLError("#NAME?", w || "Excel doesn't recognise a name in this formula."); },
    VALUE: function (w) { return new XLError("#VALUE!", w || "Text was used where a number was expected."); },
    REF: function () { return new XLError("#REF!", "The formula points at a cell that doesn't exist."); },
    NUM: function () { return new XLError("#NUM!", "The calculation can't produce a valid number."); },
    CIRC: function () { return new XLError("#CIRC!", "The formula refers to its own cell (a circular reference)."); }
  };
  function isErr(v) { return v instanceof XLError; }

  /* ---------- Addresses ---------- */
  function colToNum(s) { var n = 0; for (var i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64); return n; }
  function numToCol(n) { var s = ""; while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
  function parseAddr(a) {
    var m = /^\$?([A-Z]{1,3})\$?(\d+)$/.exec(String(a).toUpperCase());
    return m ? { c: colToNum(m[1]), r: +m[2] } : null;
  }
  function addr(c, r) { return numToCol(c) + r; }
  function parseRange(s) {
    var parts = String(s).replace(/\$/g, "").toUpperCase().split(":");
    var p = parseAddr(parts[0]), q = parseAddr(parts[1] || parts[0]);
    if (!p || !q) return null;
    return { c1: Math.min(p.c, q.c), r1: Math.min(p.r, q.r), c2: Math.max(p.c, q.c), r2: Math.max(p.r, q.r) };
  }
  function rangeCells(s) {
    var R = parseRange(s), out = [];
    if (!R) return out;
    for (var r = R.r1; r <= R.r2; r++) for (var c = R.c1; c <= R.c2; c++) out.push(addr(c, r));
    return out;
  }
  function expandList(list) {
    var out = [];
    (Array.isArray(list) ? list : [list]).forEach(function (x) { if (x) out = out.concat(rangeCells(x)); });
    return out;
  }

  /* ---------- Tokenizer ---------- */
  var REF_RE = /^\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?(?![A-Za-z0-9_(.])/;
  function tokenize(src) {
    var t = [], i = 0;
    while (i < src.length) {
      var ch = src[i], rest = src.slice(i), m;
      if (/\s/.test(ch)) { i++; continue; }
      if (ch === '"') {
        var j = i + 1, s = "";
        for (;;) {
          if (j >= src.length) throw new SyntaxError("A text value is missing its closing quote (\").");
          if (src[j] === '"') { if (src[j + 1] === '"') { s += '"'; j += 2; continue; } break; }
          s += src[j++];
        }
        t.push({ type: "str", v: s, pos: i }); i = j + 1; continue;
      }
      if ((m = /^(\d+\.?\d*|\.\d+)(E[+-]?\d+)?/i.exec(rest))) { t.push({ type: "num", v: parseFloat(m[0]), pos: i }); i += m[0].length; continue; }
      if ((m = REF_RE.exec(rest))) { t.push({ type: m[0].indexOf(":") > 0 ? "range" : "ref", v: m[0].toUpperCase(), pos: i }); i += m[0].length; continue; }
      if ((m = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(rest))) {
        var name = m[0].toUpperCase(); i += m[0].length;
        while (src[i] === " ") i++;
        if (src[i] === "(") t.push({ type: "func", v: name.replace(/^_XLFN\./, ""), pos: i });
        else if (name === "TRUE" || name === "FALSE") t.push({ type: "bool", v: name === "TRUE" });
        else t.push({ type: "name", v: m[0] });
        continue;
      }
      if ((m = /^(<=|>=|<>)/.exec(rest))) { t.push({ type: "op", v: m[0] }); i += 2; continue; }
      if ("+-*/^&=<>%".indexOf(ch) >= 0) { t.push({ type: "op", v: ch }); i++; continue; }
      if (ch === "(" || ch === ")" || ch === "," || ch === ";") { t.push({ type: ch === ";" ? "," : ch }); i++; continue; }
      if (ch === "@") { i++; continue; }
      throw new SyntaxError("Excel can't read the character \"" + ch + "\" here.");
    }
    return t;
  }

  /* ---------- Parser (precedence climbing) ---------- */
  var BIN = { "=": 1, "<>": 1, "<": 1, ">": 1, "<=": 1, ">=": 1, "&": 2, "+": 3, "-": 3, "*": 4, "/": 4, "^": 5 };
  function parse(src) {
    var tokens = tokenize(src), p = 0;
    function peek() { return tokens[p]; }
    function next() { return tokens[p++]; }
    function expr(minPrec) {
      var left = unary();
      for (;;) {
        var t = peek();
        if (!t || t.type !== "op") break;
        if (t.v === "%") { next(); left = { k: "pct", a: left }; continue; }
        var prec = BIN[t.v];
        if (prec === undefined || prec < minPrec) break;
        next();
        left = { k: "bin", op: t.v, a: left, b: expr(prec + 1) };
      }
      return left;
    }
    function unary() {
      var t = peek();
      if (t && t.type === "op" && (t.v === "-" || t.v === "+")) { next(); var a = unary(); return t.v === "-" ? { k: "neg", a: a } : a; }
      var n = primary();
      while (peek() && peek().type === "op" && peek().v === "%") { next(); n = { k: "pct", a: n }; }
      return n;
    }
    function primary() {
      var t = next();
      if (!t) throw new SyntaxError("The formula ends too early. Is something missing after the last sign?");
      switch (t.type) {
        case "num": return { k: "num", v: t.v };
        case "str": return { k: "str", v: t.v };
        case "bool": return { k: "bool", v: t.v };
        case "ref": return { k: "ref", v: t.v };
        case "range": return { k: "range", v: t.v };
        case "name": return { k: "name", v: t.v };
        case "func": {
          var open = next();
          if (!open || open.type !== "(") throw new SyntaxError("Put an opening bracket after " + t.v + ".");
          var args = [];
          if (peek() && peek().type === ")") { next(); return { k: "call", f: t.v, args: args }; }
          for (;;) {
            if (peek() && (peek().type === "," || peek().type === ")")) args.push({ k: "missing" });
            else args.push(expr(1));
            var s = next();
            if (!s) throw new SyntaxError("A bracket is missing. Every ( needs a matching ).");
            if (s.type === ")") break;
            if (s.type !== ",") throw new SyntaxError("Separate the parts of " + t.v + " with commas.");
          }
          return { k: "call", f: t.v, args: args };
        }
        case "(": {
          var e = expr(1);
          var c = next();
          if (!c || c.type !== ")") throw new SyntaxError("A bracket is missing. Every ( needs a matching ).");
          return e;
        }
        case ")": throw new SyntaxError("There's an extra closing bracket ).");
        case ",": throw new SyntaxError("A comma is in an unexpected place.");
        default: throw new SyntaxError("The sign " + (t.v || t.type) + " needs a value on both sides.");
      }
    }
    if (!tokens.length) throw new SyntaxError("Type something after the = sign.");
    var ast = expr(1);
    if (p < tokens.length) {
      var x = tokens[p];
      if (x.type === ")") throw new SyntaxError("There's an extra closing bracket ).");
      throw new SyntaxError("Something is missing between two parts of the formula (an operator like + or *?).");
    }
    return ast;
  }

  /* ---------- Coercion ---------- */
  function RangeVal(ref, rows) { this.ref = ref; this.rows = rows; }
  RangeVal.prototype.flat = function () { var o = []; this.rows.forEach(function (r) { o.push.apply(o, r); }); return o; };
  function isRange(v) { return v instanceof RangeVal; }
  function scalar(v) {
    if (isRange(v)) { if (v.rows.length === 1 && v.rows[0].length === 1) return v.rows[0][0]; return ERR.VALUE("A range was used where one value was expected."); }
    return v;
  }
  function toNum(v) {
    v = scalar(v);
    if (isErr(v)) return v;
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === "number") return v;
    if (typeof v === "boolean") return v ? 1 : 0;
    var s = String(v).trim().replace(/,/g, ""), pct = /%$/.test(s);
    if (pct) s = s.slice(0, -1);
    if (s !== "" && isFinite(+s)) return pct ? +s / 100 : +s;
    return ERR.VALUE("\"" + v + "\" is text, so Excel can't calculate with it.");
  }
  function toBool(v) {
    v = scalar(v);
    if (isErr(v)) return v;
    if (typeof v === "boolean") return v;
    if (v === null || v === "") return false;
    if (typeof v === "number") return v !== 0;
    var u = String(v).toUpperCase();
    if (u === "TRUE") return true;
    if (u === "FALSE") return false;
    return ERR.VALUE("A test needs TRUE or FALSE, but got text.");
  }
  function toText(v) {
    v = scalar(v);
    if (isErr(v)) return v;
    if (v === null || v === undefined) return "";
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    if (typeof v === "number") return generalNum(v);
    return String(v);
  }
  function typeRank(v) { return typeof v === "number" ? 0 : typeof v === "string" ? 1 : 2; }
  function compare(a, b) {
    if (a === null || a === undefined) a = typeof b === "string" ? "" : typeof b === "boolean" ? false : 0;
    if (b === null || b === undefined) b = typeof a === "string" ? "" : typeof a === "boolean" ? false : 0;
    var ra = typeRank(a), rb = typeRank(b);
    if (ra !== rb) return ra - rb;
    if (typeof a === "string") { a = a.toLowerCase(); b = b.toLowerCase(); }
    if (typeof a === "boolean") { a = a ? 1 : 0; b = b ? 1 : 0; }
    return a < b ? -1 : a > b ? 1 : 0;
  }

  /* ---------- Criteria (COUNTIF/SUMIF) ---------- */
  function criteria(c) {
    c = scalar(c);
    if (typeof c === "number" || typeof c === "boolean") return function (v) { return v !== null && v !== "" && compare(v, c) === 0; };
    var s = String(c == null ? "" : c), m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(s), op = m[1] || "=", rhs = m[2];
    var num = rhs.trim() !== "" && isFinite(+rhs.replace(/,/g, "")) ? +rhs.replace(/,/g, "") : null;
    var target = num !== null ? num : rhs;
    var wild = num === null && /[*?]/.test(rhs) && (op === "=" || op === "<>");
    var re = wild ? new RegExp("^" + rhs.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$", "i") : null;
    return function (v) {
      if (v === null || v === undefined) v = "";
      if (wild) { var hit = typeof v === "string" && re.test(v); return op === "=" ? hit : !hit; }
      if (op === "=" && rhs === "") return v === "";
      if (num !== null && typeof v === "string" && v !== "" && isFinite(+v)) v = +v;
      if (num !== null && typeof v !== "number") return op === "<>";
      var k = compare(v, target);
      switch (op) { case "=": return k === 0; case "<>": return k !== 0; case "<": return k < 0; case ">": return k > 0; case "<=": return k <= 0; default: return k >= 0; }
    };
  }

  /* ---------- Functions ---------- */
  function nums(vals, strictScalars) {
    var out = [];
    for (var i = 0; i < vals.length; i++) {
      var v = vals[i];
      if (isErr(v)) return v;
      if (isRange(v)) {
        var f = v.flat();
        for (var j = 0; j < f.length; j++) { if (isErr(f[j])) return f[j]; if (typeof f[j] === "number") out.push(f[j]); }
      } else if (v !== null) {
        var n = toNum(v);
        if (isErr(n)) { if (strictScalars) return n; continue; }
        out.push(n);
      }
    }
    return out;
  }
  function roundHalfAway(x, d) {
    if (d >= 0) { var f = Math.pow(10, d); return Math.sign(x) * Math.round(Math.abs(x) * f + 1e-9) / f; }
    var g = Math.pow(10, -d); return Math.sign(x) * Math.round(Math.abs(x) / g + 1e-9) * g;
  }
  function vec(v) { return isRange(v) ? v.flat() : [scalar(v)]; }
  function dims(v) { return isRange(v) ? { r: v.rows.length, c: v.rows[0].length } : { r: 1, c: 1 }; }
  function npvCalc(rate, cfs) { var s = 0; for (var i = 0; i < cfs.length; i++) s += cfs[i] / Math.pow(1 + rate, i + 1); return s; }

  var FN = {
    SUM: function (a) { var n = nums(a, true); if (isErr(n)) return n; return n.reduce(function (s, x) { return s + x; }, 0); },
    AVERAGE: function (a) { var n = nums(a, true); if (isErr(n)) return n; if (!n.length) return ERR.DIV0(); return n.reduce(function (s, x) { return s + x; }, 0) / n.length; },
    MIN: function (a) { var n = nums(a, true); if (isErr(n)) return n; return n.length ? Math.min.apply(null, n) : 0; },
    MAX: function (a) { var n = nums(a, true); if (isErr(n)) return n; return n.length ? Math.max.apply(null, n) : 0; },
    MEDIAN: function (a) { var n = nums(a, true); if (isErr(n)) return n; if (!n.length) return ERR.NUM(); n.sort(function (x, y) { return x - y; }); var m = n.length >> 1; return n.length % 2 ? n[m] : (n[m - 1] + n[m]) / 2; },
    COUNT: function (a) { var c = 0; a.forEach(function (v) { vec(v).forEach(function (x) { if (typeof x === "number") c++; }); }); return c; },
    COUNTA: function (a) { var c = 0; a.forEach(function (v) { vec(v).forEach(function (x) { if (x !== null && x !== "") c++; }); }); return c; },
    COUNTBLANK: function (a) { var c = 0; vec(a[0]).forEach(function (x) { if (x === null || x === "") c++; }); return c; },
    PRODUCT: function (a) { var n = nums(a, true); if (isErr(n)) return n; return n.reduce(function (s, x) { return s * x; }, 1); },
    ROUND: function (a) { var x = toNum(a[0]), d = toNum(a[1]); if (isErr(x)) return x; if (isErr(d)) return d; return roundHalfAway(x, Math.trunc(d)); },
    ROUNDUP: function (a) { var x = toNum(a[0]), d = Math.trunc(toNum(a[1])), f = Math.pow(10, d); if (isErr(x)) return x; return Math.sign(x) * Math.ceil(Math.abs(x) * f - 1e-9) / f; },
    ROUNDDOWN: function (a) { var x = toNum(a[0]), d = Math.trunc(toNum(a[1])), f = Math.pow(10, d); if (isErr(x)) return x; return Math.sign(x) * Math.floor(Math.abs(x) * f + 1e-9) / f; },
    INT: function (a) { var x = toNum(a[0]); return isErr(x) ? x : Math.floor(x); },
    ABS: function (a) { var x = toNum(a[0]); return isErr(x) ? x : Math.abs(x); },
    SQRT: function (a) { var x = toNum(a[0]); if (isErr(x)) return x; return x < 0 ? ERR.NUM() : Math.sqrt(x); },
    POWER: function (a) { var x = toNum(a[0]), y = toNum(a[1]); if (isErr(x)) return x; if (isErr(y)) return y; return Math.pow(x, y); },
    MOD: function (a) { var x = toNum(a[0]), y = toNum(a[1]); if (isErr(x)) return x; if (isErr(y)) return y; if (y === 0) return ERR.DIV0(); return x - y * Math.floor(x / y); },
    LN: function (a) { var x = toNum(a[0]); if (isErr(x)) return x; return x <= 0 ? ERR.NUM() : Math.log(x); },
    EXP: function (a) { var x = toNum(a[0]); return isErr(x) ? x : Math.exp(x); },
    SUMPRODUCT: function (a) {
      if (!a.length) return ERR.VALUE();
      var d0 = dims(a[0]), arrs = [];
      for (var i = 0; i < a.length; i++) {
        var d = dims(a[i]);
        if (d.r !== d0.r || d.c !== d0.c) return ERR.VALUE("Every range in SUMPRODUCT must be the same size.");
        arrs.push(vec(a[i]));
      }
      var s = 0;
      for (var k = 0; k < arrs[0].length; k++) {
        var p = 1;
        for (var j = 0; j < arrs.length; j++) { var x = arrs[j][k]; if (isErr(x)) return x; p *= typeof x === "number" ? x : 0; }
        s += p;
      }
      return s;
    },
    SUMIF: function (a) {
      var test = criteria(a[1]), rng = vec(a[0]), sum = a[2] !== undefined && isRange(a[2]) ? vec(a[2]) : rng, s = 0;
      for (var i = 0; i < rng.length; i++) if (test(rng[i]) && typeof sum[i] === "number") s += sum[i];
      return s;
    },
    COUNTIF: function (a) { var test = criteria(a[1]), c = 0; vec(a[0]).forEach(function (v) { if (test(v)) c++; }); return c; },
    SUMIFS: function (a) {
      var sum = vec(a[0]), s = 0;
      for (var i = 0; i < sum.length; i++) {
        var ok = true;
        for (var j = 1; j + 1 < a.length; j += 2) if (!criteria(a[j + 1])(vec(a[j])[i])) { ok = false; break; }
        if (ok && typeof sum[i] === "number") s += sum[i];
      }
      return s;
    },
    COUNTIFS: function (a) {
      var n = vec(a[0]).length, c = 0;
      for (var i = 0; i < n; i++) {
        var ok = true;
        for (var j = 0; j + 1 < a.length; j += 2) if (!criteria(a[j + 1])(vec(a[j])[i])) { ok = false; break; }
        if (ok) c++;
      }
      return c;
    },
    AVERAGEIF: function (a) {
      var test = criteria(a[1]), rng = vec(a[0]), av = a.length > 2 ? vec(a[2]) : rng, s = 0, n = 0;
      for (var i = 0; i < rng.length; i++) if (test(rng[i]) && typeof av[i] === "number") { s += av[i]; n++; }
      return n ? s / n : ERR.DIV0();
    },
    AND: function (a) {
      var r = true, any = false;
      for (var i = 0; i < a.length; i++) {
        var list = isRange(a[i]) ? a[i].flat().filter(function (x) { return typeof x === "number" || typeof x === "boolean" || isErr(x); }) : [a[i]];
        for (var j = 0; j < list.length; j++) { var b = toBool(list[j]); if (isErr(b)) return b; any = true; if (!b) r = false; }
      }
      return any ? r : ERR.VALUE();
    },
    OR: function (a) {
      var r = false, any = false;
      for (var i = 0; i < a.length; i++) {
        var list = isRange(a[i]) ? a[i].flat().filter(function (x) { return typeof x === "number" || typeof x === "boolean" || isErr(x); }) : [a[i]];
        for (var j = 0; j < list.length; j++) { var b = toBool(list[j]); if (isErr(b)) return b; any = true; if (b) r = true; }
      }
      return any ? r : ERR.VALUE();
    },
    NOT: function (a) { var b = toBool(a[0]); return isErr(b) ? b : !b; },
    ISNUMBER: function (a) { return typeof scalar(a[0]) === "number"; },
    ISTEXT: function (a) { return typeof scalar(a[0]) === "string"; },
    ISBLANK: function (a) { var v = scalar(a[0]); return v === null || v === undefined; },
    ISERROR: function (a) { return isErr(scalar(a[0])); },
    ISNA: function (a) { var v = scalar(a[0]); return isErr(v) && v.err === "#N/A"; },
    INDEX: function (a) {
      var rng = a[0];
      if (!isRange(rng)) return ERR.VALUE("INDEX needs a range as its first part.");
      var r = toNum(a[1]), c = a.length > 2 && a[2] !== undefined ? toNum(a[2]) : null;
      if (isErr(r)) return r; if (isErr(c)) return c;
      var rows = rng.rows.length, cols = rng.rows[0].length;
      if (c === null) { if (rows === 1) { c = r; r = 1; } else c = 1; }
      if (c === 0 && cols === 1) c = 1;
      if (r === 0 && rows === 1) r = 1;
      if (r < 1 || c < 1 || r > rows || c > cols) return ERR.REF();
      var v = rng.rows[r - 1][c - 1];
      return v === null ? 0 : v;
    },
    MATCH: function (a) {
      var v = scalar(a[0]), list = vec(a[1]), type = a.length > 2 && a[2] !== undefined ? toNum(a[2]) : 1;
      if (isErr(v)) return v;
      if (type === 0) {
        var test = typeof v === "string" ? criteria(v) : function (x) { return x !== null && compare(x, v) === 0; };
        for (var i = 0; i < list.length; i++) if (test(list[i])) return i + 1;
        return ERR.NA("MATCH couldn't find \"" + toText(v) + "\" in the list. Check the spelling and the range.");
      }
      var best = -1;
      for (var k = 0; k < list.length; k++) {
        if (list[k] === null) continue;
        var cmp = compare(list[k], v);
        if (type > 0 ? cmp <= 0 : cmp >= 0) best = k; else break;
      }
      return best < 0 ? ERR.NA() : best + 1;
    },
    XLOOKUP: function (a) {
      var v = scalar(a[0]), look = a[1], ret = a[2];
      if (isErr(v)) return v;
      if (!isRange(look) || !isRange(ret)) return ERR.VALUE("XLOOKUP needs a range to search and a range to bring back from.");
      var lv = look.flat(), vertical = look.rows.length > 1 || look.rows[0].length === 1;
      var rv = vertical ? ret.rows.map(function (r) { return r[0]; }) : ret.rows[0];
      if (rv.length !== lv.length) return ERR.VALUE("The search range and the return range must be the same length.");
      var mode = a.length > 4 && a[4] !== undefined && a[4] !== null ? toNum(a[4]) : 0;
      var sm = a.length > 5 && a[5] !== undefined && a[5] !== null ? toNum(a[5]) : 1;
      if (sm === -1 || sm === -2) { lv = lv.slice().reverse(); rv = rv.slice().reverse(); }
      var test = typeof v === "string" && mode === 2 ? criteria(v) : function (x) { return x !== null && compare(x, v) === 0; };
      for (var i = 0; i < lv.length; i++) if (test(lv[i])) return rv[i] === null ? 0 : rv[i];
      if (mode === -1 || mode === 1) {
        var bi = -1;
        for (var k = 0; k < lv.length; k++) {
          if (typeof lv[k] !== typeof v) continue;
          var cmp = compare(lv[k], v);
          if (mode === -1 && cmp < 0 && (bi < 0 || compare(lv[k], lv[bi]) > 0)) bi = k;
          if (mode === 1 && cmp > 0 && (bi < 0 || compare(lv[k], lv[bi]) < 0)) bi = k;
        }
        if (bi >= 0) return rv[bi];
      }
      if (a.length > 3 && a[3] !== undefined) return a[3];
      return ERR.NA("XLOOKUP couldn't find \"" + toText(v) + "\". Add a fourth part, like \"Not found\", to show a message instead.");
    },
    VLOOKUP: function (a) {
      var v = scalar(a[0]), tbl = a[1], col = toNum(a[2]), approx = a.length > 3 && a[3] !== undefined ? toBool(a[3]) : true;
      if (isErr(v)) return v;
      if (!isRange(tbl)) return ERR.VALUE();
      if (col < 1) return ERR.VALUE();
      if (col > tbl.rows[0].length) return ERR.REF();
      var first = tbl.rows.map(function (r) { return r[0]; }), idx = -1;
      if (!approx) { for (var i = 0; i < first.length; i++) if (first[i] !== null && compare(first[i], v) === 0) { idx = i; break; } }
      else { for (var k = 0; k < first.length; k++) { if (first[k] === null) continue; if (compare(first[k], v) <= 0) idx = k; else break; } }
      if (idx < 0) return ERR.NA("VLOOKUP couldn't find \"" + toText(v) + "\" in the first column.");
      var out = tbl.rows[idx][col - 1];
      return out === null ? 0 : out;
    },
    HLOOKUP: function (a) {
      var v = scalar(a[0]), tbl = a[1], row = toNum(a[2]), approx = a.length > 3 && a[3] !== undefined ? toBool(a[3]) : true;
      if (!isRange(tbl)) return ERR.VALUE();
      if (row > tbl.rows.length) return ERR.REF();
      var first = tbl.rows[0], idx = -1;
      for (var i = 0; i < first.length; i++) { if (first[i] === null) continue; var c = compare(first[i], v); if (!approx ? c === 0 : c <= 0) { idx = i; if (!approx) break; } else if (approx) break; }
      if (idx < 0) return ERR.NA();
      return tbl.rows[row - 1][idx];
    },
    CONCAT: function (a) { var s = ""; for (var i = 0; i < a.length; i++) { var l = vec(a[i]); for (var j = 0; j < l.length; j++) { var t = toText(l[j]); if (isErr(t)) return t; s += t; } } return s; },
    LEN: function (a) { var t = toText(a[0]); return isErr(t) ? t : t.length; },
    LEFT: function (a) { var t = toText(a[0]), n = a.length > 1 ? toNum(a[1]) : 1; return isErr(t) ? t : t.slice(0, n); },
    RIGHT: function (a) { var t = toText(a[0]), n = a.length > 1 ? toNum(a[1]) : 1; return isErr(t) ? t : n ? t.slice(-n) : ""; },
    MID: function (a) { var t = toText(a[0]), s = toNum(a[1]), n = toNum(a[2]); return isErr(t) ? t : t.substr(s - 1, n); },
    TRIM: function (a) { var t = toText(a[0]); return isErr(t) ? t : t.trim().replace(/ +/g, " "); },
    UPPER: function (a) { var t = toText(a[0]); return isErr(t) ? t : t.toUpperCase(); },
    LOWER: function (a) { var t = toText(a[0]); return isErr(t) ? t : t.toLowerCase(); },
    TEXT: function (a) { var v = scalar(a[0]), f = toText(a[1]); if (isErr(v)) return v; var n = toNum(v); return isErr(n) ? toText(v) : format(n, f); },
    PV: function (a) {
      var r = toNum(a[0]), n = toNum(a[1]), pmt = toNum(a[2] === undefined ? 0 : a[2]), fv = toNum(a[3] === undefined ? 0 : a[3]), t = toNum(a[4] === undefined ? 0 : a[4]);
      if (r === 0) return -(fv + pmt * n);
      var q = Math.pow(1 + r, n);
      return -(fv + pmt * (1 + r * t) * (q - 1) / r) / q;
    },
    FV: function (a) {
      var r = toNum(a[0]), n = toNum(a[1]), pmt = toNum(a[2] === undefined ? 0 : a[2]), pv = toNum(a[3] === undefined ? 0 : a[3]), t = toNum(a[4] === undefined ? 0 : a[4]);
      if (r === 0) return -(pv + pmt * n);
      var q = Math.pow(1 + r, n);
      return -(pv * q + pmt * (1 + r * t) * (q - 1) / r);
    },
    PMT: function (a) {
      var r = toNum(a[0]), n = toNum(a[1]), pv = toNum(a[2]), fv = toNum(a[3] === undefined ? 0 : a[3]), t = toNum(a[4] === undefined ? 0 : a[4]);
      if (n === 0) return ERR.NUM();
      if (r === 0) return -(pv + fv) / n;
      var q = Math.pow(1 + r, n);
      return -(r * (pv * q + fv)) / ((1 + r * t) * (q - 1));
    },
    NPER: function (a) {
      var r = toNum(a[0]), pmt = toNum(a[1]), pv = toNum(a[2]), fv = toNum(a[3] === undefined ? 0 : a[3]), t = toNum(a[4] === undefined ? 0 : a[4]);
      if (r === 0) return -(pv + fv) / pmt;
      var k = pmt * (1 + r * t) / r, num = k - fv, den = pv + k;
      if (num / den <= 0) return ERR.NUM();
      return Math.log(num / den) / Math.log(1 + r);
    },
    RATE: function (a) {
      var n = toNum(a[0]), pmt = toNum(a[1]), pv = toNum(a[2]), fv = toNum(a[3] === undefined ? 0 : a[3]), t = toNum(a[4] === undefined ? 0 : a[4]);
      var r = a[5] === undefined ? 0.1 : toNum(a[5]);
      function f(x) { if (Math.abs(x) < 1e-12) return pv + pmt * n + fv; var q = Math.pow(1 + x, n); return pv * q + pmt * (1 + x * t) * (q - 1) / x + fv; }
      for (var i = 0; i < 100; i++) {
        var y = f(r), h = 1e-6, d = (f(r + h) - y) / h;
        if (!isFinite(d) || d === 0) break;
        var nr = r - y / d;
        if (Math.abs(nr - r) < 1e-10) return nr;
        r = nr;
      }
      return Math.abs(f(r)) < 1e-6 ? r : ERR.NUM();
    },
    NPV: function (a) {
      var r = toNum(a[0]); if (isErr(r)) return r;
      var cfs = nums(a.slice(1), true); if (isErr(cfs)) return cfs;
      return npvCalc(r, cfs);
    },
    IRR: function (a) {
      var cfs = nums([a[0]], true); if (isErr(cfs)) return cfs;
      var g = a.length > 1 ? toNum(a[1]) : 0.1;
      function f(x) { var s = 0; for (var i = 0; i < cfs.length; i++) s += cfs[i] / Math.pow(1 + x, i); return s; }
      for (var i = 0; i < 200; i++) {
        var y = f(g), h = 1e-6, d = (f(g + h) - y) / h;
        if (!isFinite(d) || d === 0) break;
        var ng = g - y / d;
        if (Math.abs(ng - g) < 1e-10) return ng;
        g = ng;
      }
      return ERR.NUM();
    }
  };
  /* ---------- More finance and dates ---------- */
  function fvRaw(r, n, pmt, pv, t) { if (r === 0) return -(pv + pmt * n); var q = Math.pow(1 + r, n); return -(pv * q + pmt * (1 + r * t) * (q - 1) / r); }
  function ipmtCalc(a) {
    var r = toNum(a[0]), per = toNum(a[1]), n = toNum(a[2]), pv = toNum(a[3]), fv = toNum(a[4] === undefined ? 0 : a[4]), t = toNum(a[5] === undefined ? 0 : a[5]);
    var bad = [r, per, n, pv, fv, t].filter(isErr)[0]; if (bad) return bad;
    if (per < 1 || per > n) return ERR.NUM();
    var pmt = FN.PMT([r, n, pv, fv, t]);
    if (t === 1 && per === 1) return 0;
    var bal = t === 1 ? fvRaw(r, per - 2, pmt, pv, 1) - pmt : fvRaw(r, per - 1, pmt, pv, 0);
    return bal * r;
  }
  FN.IPMT = ipmtCalc;
  FN.PPMT = function (a) {
    var i = ipmtCalc(a); if (isErr(i)) return i;
    return FN.PMT([toNum(a[0]), toNum(a[2]), toNum(a[3]), toNum(a[4] === undefined ? 0 : a[4]), toNum(a[5] === undefined ? 0 : a[5])]) - i;
  };
  FN.EFFECT = function (a) { var r = toNum(a[0]), n = Math.floor(toNum(a[1])); if (isErr(r)) return r; if (r <= 0 || n < 1) return ERR.NUM(); return Math.pow(1 + r / n, n) - 1; };
  FN.NOMINAL = function (a) { var r = toNum(a[0]), n = Math.floor(toNum(a[1])); if (isErr(r)) return r; if (r <= 0 || n < 1) return ERR.NUM(); return n * (Math.pow(1 + r, 1 / n) - 1); };
  function pairs(a) {
    var v = nums([a[0]], true), d = nums([a[1]], true);
    if (isErr(v)) return v; if (isErr(d)) return d;
    if (v.length !== d.length || !v.length) return ERR.NUM();
    return { v: v, d: d };
  }
  function xnpvCalc(r, p) { var s = 0; for (var i = 0; i < p.v.length; i++) s += p.v[i] / Math.pow(1 + r, (p.d[i] - p.d[0]) / 365); return s; }
  FN.XNPV = function (a) { var r = toNum(a[0]); if (isErr(r)) return r; var p = pairs(a.slice(1)); if (isErr(p)) return p; return xnpvCalc(r, p); };
  FN.XIRR = function (a) {
    var p = pairs(a); if (isErr(p)) return p;
    var g = a.length > 2 ? toNum(a[2]) : 0.1;
    for (var i = 0; i < 200; i++) {
      var y = xnpvCalc(g, p), h = 1e-6, d = (xnpvCalc(g + h, p) - y) / h;
      if (!isFinite(d) || d === 0) break;
      var ng = g - y / d; if (ng <= -0.999999) ng = (g - 0.999999) / 2;
      if (Math.abs(ng - g) < 1e-10) return ng;
      g = ng;
    }
    return ERR.NUM();
  };
  /* Dates are Excel serial numbers: 1 = 1 Jan 1900 (dates from March 1900 match Excel exactly) */
  var EPOCH = Date.UTC(1899, 11, 30);
  function serialOf(y, m, d) { return Math.round((Date.UTC(y, m - 1, d) - EPOCH) / 864e5); }
  function dateOf(n) { return new Date(EPOCH + Math.floor(n) * 864e5); }
  FN.DATE = function (a) { var y = toNum(a[0]), m = toNum(a[1]), d = toNum(a[2]); var bad = [y, m, d].filter(isErr)[0]; if (bad) return bad; if (y < 1900) y += 1900; return serialOf(Math.floor(y), Math.floor(m), Math.floor(d)); };
  FN.YEAR = function (a) { var n = toNum(a[0]); if (isErr(n)) return n; return dateOf(n).getUTCFullYear(); };
  FN.MONTH = function (a) { var n = toNum(a[0]); if (isErr(n)) return n; return dateOf(n).getUTCMonth() + 1; };
  FN.DAY = function (a) { var n = toNum(a[0]); if (isErr(n)) return n; return dateOf(n).getUTCDate(); };
  FN.EDATE = function (a) { var n = toNum(a[0]), k = Math.trunc(toNum(a[1])); if (isErr(n)) return n; var d = dateOf(n), y = d.getUTCFullYear(), m = d.getUTCMonth() + k, day = d.getUTCDate(); var last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); return Math.round((Date.UTC(y, m, Math.min(day, last)) - EPOCH) / 864e5); };
  FN.CONCATENATE = FN.CONCAT;
  FN["STDEV.S"] = FN.STDEV = function (a) { var n = nums(a, true); if (isErr(n)) return n; if (n.length < 2) return ERR.DIV0(); var m = n.reduce(function (s, x) { return s + x; }, 0) / n.length; return Math.sqrt(n.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (n.length - 1)); };
  FN["VAR.S"] = FN.VAR = function (a) { var s = FN.STDEV(a); return isErr(s) ? s : s * s; };
  var LAZY = { IF: 1, IFS: 1, IFERROR: 1, IFNA: 1 };
  var MISSING = { missing: true };

  /* ---------- Evaluate ---------- */
  function evaluate(node, ctx) {
    switch (node.k) {
      case "num": case "str": case "bool": return node.v;
      case "missing": return MISSING;
      case "ref": return ctx.get(node.v.replace(/\$/g, ""));
      case "range": return ctx.range(node.v);
      case "name": {
        var target = ctx.names && ctx.names[node.v.toUpperCase()];
        if (target === undefined) return ERR.NAME("\"" + node.v + "\" isn't a function or a named cell. Check the spelling, or put text in quotes.");
        return target.indexOf(":") > 0 ? ctx.range(target) : ctx.get(target.replace(/\$/g, ""));
      }
      case "neg": { var n = toNum(evaluate(node.a, ctx)); return isErr(n) ? n : -n; }
      case "pct": { var p = toNum(evaluate(node.a, ctx)); return isErr(p) ? p : p / 100; }
      case "bin": return binop(node.op, scalar(evaluate(node.a, ctx)), scalar(evaluate(node.b, ctx)));
      case "call": return call(node, ctx);
    }
    return ERR.VALUE();
  }
  function binop(op, a, b) {
    if (isErr(a)) return a;
    if (isErr(b)) return b;
    if (op === "&") { var ta = toText(a), tb = toText(b); return ta + tb; }
    if (BIN[op] === 1) {
      var k = compare(a, b);
      switch (op) { case "=": return k === 0; case "<>": return k !== 0; case "<": return k < 0; case ">": return k > 0; case "<=": return k <= 0; default: return k >= 0; }
    }
    var x = toNum(a), y = toNum(b);
    if (isErr(x)) return x;
    if (isErr(y)) return y;
    switch (op) {
      case "+": return x + y;
      case "-": return x - y;
      case "*": return x * y;
      case "/": return y === 0 ? ERR.DIV0() : x / y;
      case "^": { var r = Math.pow(x, y); return isFinite(r) ? r : ERR.NUM(); }
    }
    return ERR.VALUE();
  }
  function call(node, ctx) {
    var f = node.f, args = node.args;
    var ev = function (i) { if (i >= args.length) return undefined; var v = evaluate(args[i], ctx); return v === MISSING ? undefined : v; };
    if (LAZY[f]) {
      if (f === "IF") {
        var c = toBool(ev(0)); if (isErr(c)) return c;
        if (c) { var t = ev(1); return t === undefined ? 0 : t; }
        if (args.length < 3) return false;
        var e = ev(2); return e === undefined ? 0 : e;
      }
      if (f === "IFS") {
        if (args.length < 2 || args.length % 2) return ERR.VALUE("IFS needs pairs: a test, then the result for that test.");
        for (var i = 0; i < args.length; i += 2) { var b = toBool(ev(i)); if (isErr(b)) return b; if (b) return ev(i + 1); }
        return ERR.NA("None of the IFS tests were TRUE. End with TRUE, \"result\" to catch everything else.");
      }
      if (f === "IFERROR") { var v = scalar(ev(0)); return isErr(v) ? ev(1) : v; }
      if (f === "IFNA") { var w = scalar(ev(0)); return isErr(w) && w.err === "#N/A" ? ev(1) : w; }
    }
    var fn = FN[f];
    if (!fn) return ERR.NAME("Excel doesn't know a function called " + f + ". Check the spelling.");
    var vals = [];
    for (var k = 0; k < args.length; k++) {
      var x = evaluate(args[k], ctx);
      vals.push(x === MISSING ? undefined : x);
    }
    return fn(vals);
  }

  /* ---------- Sheet ---------- */
  function Sheet(opts) {
    opts = opts || {};
    this.raw = {};
    this.names = {};
    this.astCache = {};
    var self = this;
    Object.keys(opts.names || {}).forEach(function (n) { self.names[n.toUpperCase()] = String(opts.names[n]).replace(/\$/g, "").toUpperCase(); });
    Object.keys(opts.cells || {}).forEach(function (a) { self.raw[a.toUpperCase()] = opts.cells[a]; });
    this.invalidate();
  }
  Sheet.prototype.invalidate = function () { this.cache = {}; this.busy = {}; };
  Sheet.prototype.set = function (a, input) {
    a = a.toUpperCase();
    if (input === "" || input === null || input === undefined) delete this.raw[a]; else this.raw[a] = input;
    this.invalidate();
  };
  Sheet.prototype.getRaw = function (a) { var v = this.raw[a.toUpperCase()]; return v === undefined ? null : v; };
  Sheet.prototype.isFormula = function (a) { var v = this.raw[a.toUpperCase()]; return typeof v === "string" && v.charAt(0) === "="; };
  Sheet.prototype.clone = function () { var s = new Sheet(); s.raw = Object.assign({}, this.raw); s.names = Object.assign({}, this.names); return s; };
  Sheet.prototype.literal = function (v) {
    if (typeof v !== "string") return v === undefined ? null : v;
    var s = v.trim();
    if (s === "") return null;
    if (/^(TRUE|FALSE)$/i.test(s)) return s.toUpperCase() === "TRUE";
    var neg = /^\(.*\)$/.test(s), t = s.replace(/^\((.*)\)$/, "$1").replace(/,/g, "").replace(/^KES\s*/i, "");
    var pct = /%$/.test(t);
    if (pct) t = t.slice(0, -1);
    if (t !== "" && /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t)) { var n = +t; if (pct) n /= 100; return neg ? -n : n; }
    return v;
  };
  Sheet.prototype.value = function (a) {
    a = a.toUpperCase();
    if (a in this.cache) return this.cache[a];
    var raw = this.raw[a];
    if (raw === undefined) return null;
    if (typeof raw === "string" && raw.charAt(0) === "=") {
      if (this.busy[a]) return ERR.CIRC();
      this.busy[a] = true;
      var out;
      try {
        var ast = this.astCache[raw] || (this.astCache[raw] = parse(raw.slice(1)));
        out = scalar(evaluate(ast, this.ctx()));
        if (out === MISSING || out === undefined) out = 0;
        if (out === null) out = 0;
        if (typeof out === "number" && !isFinite(out)) out = ERR.NUM();
      } catch (e) {
        out = new XLError("#ERROR!", e.message);
      }
      this.busy[a] = false;
      this.cache[a] = out;
      return out;
    }
    var lit = this.literal(raw);
    this.cache[a] = lit;
    return lit;
  };
  Sheet.prototype.ctx = function () {
    var self = this;
    return {
      names: this.names,
      get: function (a) { return self.value(a); },
      range: function (r) {
        var R = parseRange(r);
        if (!R) return ERR.REF();
        var rows = [];
        for (var y = R.r1; y <= R.r2; y++) { var row = []; for (var x = R.c1; x <= R.c2; x++) row.push(self.value(addr(x, y))); rows.push(row); }
        return new RangeVal(r, rows);
      }
    };
  };
  /* Copy the source cell's formula into each target cell, shifting relative references (Excel's fill). */
  Sheet.prototype.fill = function (from, to) {
    var F = parseRange(from), T = parseRange(to);
    if (!F || !T) return;
    var h = F.r2 - F.r1 + 1, w = F.c2 - F.c1 + 1;
    for (var r = T.r1; r <= T.r2; r++) for (var c = T.c1; c <= T.c2; c++) {
      var sr = F.r1 + ((r - F.r1) % h + h) % h, sc = F.c1 + ((c - F.c1) % w + w) % w;
      if (sr === r && sc === c) continue;
      var src = this.raw[addr(sc, sr)];
      if (src === undefined) { delete this.raw[addr(c, r)]; continue; }
      this.raw[addr(c, r)] = typeof src === "string" && src.charAt(0) === "=" ? shift(src, c - sc, r - sr) : src;
    }
    this.invalidate();
  };

  /* ---------- Formula text helpers ---------- */
  function mapOutsideStrings(text, fn) {
    var parts = text.split('"');
    for (var i = 0; i < parts.length; i += 2) parts[i] = fn(parts[i]);
    return parts.join('"');
  }
  var SHIFT_RE = /(^|[^A-Za-z0-9_.$])(\$?)([A-Za-z]{1,3})(\$?)(\d+)(?![A-Za-z0-9_(.])/g;
  function shift(formula, dc, dr) {
    return mapOutsideStrings(formula, function (seg) {
      return seg.replace(SHIFT_RE, function (m, pre, dcol, col, drow, row) {
        var c = colToNum(col.toUpperCase()), r = +row;
        if (!dcol) c += dc;
        if (!drow) r += dr;
        if (c < 1 || r < 1) return pre + "#REF!";
        return pre + dcol + numToCol(c) + drow + r;
      });
    });
  }
  /* F4: cycle A1 -> $A$1 -> A$1 -> $A1 -> A1 for the reference at or just before the caret. */
  function toggleAbs(text, caret) {
    var re = /\$?[A-Za-z]{1,3}\$?\d+/g, m, hit = null;
    while ((m = re.exec(text))) {
      var s = m.index, e = s + m[0].length;
      var before = text[s - 1], after = text[e];
      if (before && /[A-Za-z0-9_.]/.test(before)) continue;
      if (after && /[A-Za-z0-9_(.]/.test(after)) continue;
      if (caret >= s && caret <= e) { hit = { s: s, e: e, t: m[0] }; break; }
      if (e <= caret) hit = { s: s, e: e, t: m[0] };
    }
    if (!hit) return { text: text, caret: caret, changed: false };
    var mm = /^(\$?)([A-Za-z]{1,3})(\$?)(\d+)$/.exec(hit.t);
    var state = (mm[1] ? 1 : 0) * 2 + (mm[3] ? 1 : 0); // 0 A1, 3 $A$1, 1 A$1, 2 $A1
    var nextState = { 0: 3, 3: 1, 1: 2, 2: 0 }[state];
    var col = mm[2].toUpperCase(), row = mm[4];
    var rep = (nextState & 2 ? "$" : "") + col + (nextState & 1 ? "$" : "") + row;
    var out = text.slice(0, hit.s) + rep + text.slice(hit.e);
    return { text: out, caret: hit.s + rep.length, changed: true, ref: rep };
  }
  function check(formula) {
    try { parse(String(formula).replace(/^=/, "")); return null; } catch (e) { return e.message; }
  }
  function refsIn(formula) {
    var out = [];
    mapOutsideStrings(formula, function (seg) {
      seg.replace(/(^|[^A-Za-z0-9_.$])(\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?)(?![A-Za-z0-9_(.])/g, function (m, pre, ref) { out.push(ref.toUpperCase()); return m; });
      return seg;
    });
    return out;
  }

  /* ---------- Number formats ---------- */
  function generalNum(v) {
    if (v === 0) return "0";
    var a = Math.abs(v);
    if (a >= 1e11 || a < 1e-9) return v.toExponential(5).replace(/\.?0+e/, "E").replace("E+", "E+");
    var s = String(Number(v.toPrecision(10)));
    if (/e/.test(s)) s = String(Number(v.toFixed(9)));
    return s;
  }
  function splitSections(code) {
    var out = [], cur = "", q = false;
    for (var i = 0; i < code.length; i++) {
      var ch = code[i];
      if (ch === '"') q = !q;
      if (ch === "\\" && !q) { cur += ch + (code[i + 1] || ""); i++; continue; }
      if (ch === ";" && !q) { out.push(cur); cur = ""; continue; }
      cur += ch;
    }
    out.push(cur);
    return out;
  }
  function formatSection(n, sec) {
    var pre = "", post = "", pat = "", seenPat = false, pct = false, i = 0;
    var pieces = [];
    while (i < sec.length) {
      var ch = sec[i];
      if (ch === '"') { var j = sec.indexOf('"', i + 1); if (j < 0) j = sec.length; pieces.push({ lit: sec.slice(i + 1, j) }); i = j + 1; continue; }
      if (ch === "\\") { pieces.push({ lit: sec[i + 1] || "" }); i += 2; continue; }
      if (ch === "_") { pieces.push({ lit: " " }); i += 2; continue; }
      if (ch === "*") { i += 2; continue; }
      if ("#0?.,".indexOf(ch) >= 0) { pieces.push({ pat: ch }); i++; continue; }
      if (ch === "%") { pct = true; pieces.push({ lit: "%" }); i++; continue; }
      if (ch === "[") { var k = sec.indexOf("]", i); i = k < 0 ? sec.length : k + 1; continue; }
      pieces.push({ lit: ch }); i++;
    }
    var firstPat = -1, lastPat = -1;
    pieces.forEach(function (p, idx) { if (p.pat !== undefined) { if (firstPat < 0) firstPat = idx; lastPat = idx; } });
    if (firstPat < 0) return pieces.map(function (p) { return p.lit; }).join("");
    pieces.forEach(function (p, idx) {
      if (idx < firstPat) pre += p.lit;
      else if (idx > lastPat) post += p.lit;
      else if (p.pat !== undefined) pat += p.pat; else post += "";
    });
    var digitsEnd = Math.max(pat.lastIndexOf("0"), pat.lastIndexOf("#"), pat.lastIndexOf("?"));
    var trailingCommas = pat.slice(digitsEnd + 1).replace(/[^,]/g, "").length;
    var core = pat.slice(0, digitsEnd + 1);
    var dot = core.indexOf(".");
    var intPat = dot >= 0 ? core.slice(0, dot) : core, decPat = dot >= 0 ? core.slice(dot + 1) : "";
    var thousands = intPat.indexOf(",") >= 0;
    var minInt = (intPat.match(/0/g) || []).length;
    var decimals = decPat.replace(/,/g, "").length, minDec = (decPat.match(/0/g) || []).length;
    if (pct) n *= 100;
    n /= Math.pow(1000, trailingCommas);
    var fixed = roundHalfAway(n, decimals).toFixed(decimals);
    var ip = fixed.split(".")[0], dp = fixed.split(".")[1] || "";
    if (decimals > minDec) { dp = dp.replace(/0+$/, ""); while (dp.length < minDec) dp += "0"; }
    if (ip === "0" && minInt === 0) ip = "";
    while (ip.length < minInt) ip = "0" + ip;
    if (thousands) ip = ip.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var num = ip + (dot >= 0 && (dp.length || decPat.indexOf("0") >= 0 || true) ? (dp.length ? "." + dp : (decPat.length ? "." : "")) : "");
    if (num.slice(-1) === "." ) num = num.slice(0, -1);
    return pre + num + post;
  }
  var MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function formatDate(v, code) {
    var d = new Date(Date.UTC(1899, 11, 30) + Math.floor(v) * 864e5), Y = d.getUTCFullYear(), M = d.getUTCMonth(), D = d.getUTCDate();
    return code.replace(/yyyy|yy|mmmm|mmm|mm|m|dd|d/gi, function (t) {
      t = t.toLowerCase();
      return t === "yyyy" ? String(Y) : t === "yy" ? String(Y).slice(-2) : t === "mmmm" ? MONL[M] : t === "mmm" ? MON3[M] : t === "mm" ? String(M + 1).padStart(2, "0") : t === "m" ? String(M + 1) : t === "dd" ? String(D).padStart(2, "0") : String(D);
    });
  }
  function format(v, code) {
    if (v === null || v === undefined) return "";
    if (isErr(v)) return v.err;
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    if (typeof v === "string") return v;
    if (!code || /^general$/i.test(code)) return generalNum(v);
    if (code === "@") return generalNum(v);
    if (/^[dmy\s\/\-.,]+$/i.test(code) && /[dy]|mmm/i.test(code)) return formatDate(v, code);
    var secs = splitSections(code), sec, n = v;
    if (v > 0 || (v === 0 && secs.length < 3)) sec = secs[0];
    else if (v < 0) { if (secs.length > 1 && secs[1] !== "") { sec = secs[1]; n = -v; } else { sec = secs[0]; } }
    else sec = secs[2];
    var out = formatSection(n, sec);
    if (v < 0 && sec === secs[0] && n < 0) {
      var stripped = formatSection(-n, sec);
      if (/[1-9]/.test(stripped)) out = "-" + stripped; else out = stripped;
    }
    return out;
  }

  var XL = {
    Sheet: Sheet, parse: parse, check: check, shift: shift, toggleAbs: toggleAbs, refsIn: refsIn, format: format,
    parseAddr: parseAddr, parseRange: parseRange, rangeCells: rangeCells, expandList: expandList, addr: addr,
    colToNum: colToNum, numToCol: numToCol, isErr: isErr, XLError: XLError, functions: Object.keys(FN).concat(Object.keys(LAZY))
  };
  if (typeof module !== "undefined" && module.exports) module.exports = XL;
  else root.XL = XL;
})(typeof window !== "undefined" ? window : this);
