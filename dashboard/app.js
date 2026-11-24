// Token Radar S4 dashboard. Reads window.RADAR (written by main.ts at
// runtime), renders the board, the live-token tab, filters, and one detail
// view per row. The held-out test and the hazard strip are recomputed here
// in the page from the snapshot data, not pasted as fixed text.
(function () {
  var R = window.RADAR;
  var IDX = { slug: 0, name: 1, cat: 2, chain: 3, tvl: 4, chg: 5, age: 6, ageU: 7, chgU: 8, implied: 9, verdict: 10, ev: 11, cost: 12, dep: 13, gas: 14, hold: 15, base: 16, growth: 17, mat: 18, odds: 19, ratio: 20 };
  function rowObj(a) {
    var o = {};
    for (var k in IDX) o[k] = a[IDX[k]];
    return o;
  }
  var rows = R.rows.map(rowObj);
  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }
  function money2(n) {
    return "$" + (Math.round(n * 100) / 100).toLocaleString("en-US");
  }
  function pct(n) {
    return (n === null || n === undefined) ? "—" : (n > 0 ? "+" : "") + n.toFixed(2) + "%";
  }

  // ---- status bar + curve values ----
  var counts = { FARM: 0, THIN: 0, SKIP: 0 };
  rows.forEach(function (r) { counts[r.verdict]++; });
  document.getElementById("statusBar").textContent =
    "FARM " + counts.FARM + " · THIN " + counts.THIN + " · SKIP " + counts.SKIP + " — 198 pre-token protocols, ranked by implied value";
  document.getElementById("fitA").textContent = R.a.toFixed(4);
  document.getElementById("fitB").textContent = R.b.toFixed(4);
  document.getElementById("fitR2").textContent = R.r2.toFixed(3);
  document.getElementById("asOf").textContent = R.asOf;

  // ---- live held-out test: refit the curve per fold in the page ----
  function ols(xs, ys) {
    var n = xs.length, mx = 0, my = 0, i;
    for (i = 0; i < n; i++) { mx += xs[i]; my += ys[i]; }
    mx /= n; my /= n;
    var sxy = 0, sxx = 0;
    for (i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) * (xs[i] - mx); }
    var b = sxy / sxx;
    return { a: my - b * mx, b: b };
  }
  function median(v) {
    var s = v.slice().sort(function (x, y) { return x - y; });
    var m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  function runHoldout() {
    var xs = R.comps.map(function (p) { return p[0]; });
    var ys = R.comps.map(function (p) { return p[1]; });
    var flatMed = median(R.comps.map(function (p) { return Math.exp(p[1]) / Math.exp(p[0]); }));
    var fSum = 0, lSum = 0, wins = 0, parts = [];
    for (var f = 0; f < 5; f++) {
      var tx = [], ty = [];
      for (var i = 0; i < xs.length; i++) if (i % 5 !== f) { tx.push(xs[i]); ty.push(ys[i]); }
      var fit = ols(tx, ty);
      var se = 0, sf = 0, cnt = 0;
      for (var j = 0; j < xs.length; j++) {
        if (j % 5 !== f) continue;
        var e = ys[j] - (fit.a + fit.b * xs[j]);
        se += e * e;
        var d = ys[j] - Math.log(flatMed * Math.exp(xs[j]));
        sf += d * d;
        cnt++;
      }
      var fr = Math.sqrt(se / cnt), lr = Math.sqrt(sf / cnt);
      fSum += fr; lSum += lr;
      if (fr < lr) wins++;
      parts.push("split " + (f + 1) + ": " + fr.toFixed(2) + " vs " + lr.toFixed(2));
    }
    var fitMean = fSum / 5, flatMean = lSum / 5;
    document.getElementById("liveHoldout").textContent =
      "Live refit: fitted log-RMSE " + fitMean.toFixed(2) + " vs flat " + flatMean.toFixed(2) + ", fitted wins " + wins + "/5. (" + parts.join("; ") + ")";
    document.getElementById("liveFit").textContent =
      "Fitted curve: a = " + R.a.toFixed(4) + ", b = " + R.b.toFixed(4) + ", R² = " + R.r2.toFixed(3) + " over the 128 traded comps.";
  }
  runHoldout();

  // ---- hazard strip, computed live from k = 0.50, lambda = 882 ----
  function hazard60(age) {
    return 1 - Math.exp(-Math.pow((age + 60) / 882, 0.5) + Math.pow(age / 882, 0.5));
  }
  (function () {
    var ages = [0, 100, 513, 1095, 3000];
    var html = "<caption>Fitted Weibull hazard — 60-day launch chance by age</caption><tr><th>Age (days)</th>";
    ages.forEach(function (a) { html += "<th>" + a + "</th>"; });
    html += "</tr><tr><td>Launch chance in next 60 days</td>";
    ages.forEach(function (a) { html += "<td>" + (hazard60(a) * 100).toFixed(1) + "%</td>"; });
    html += "</tr>";
    document.getElementById("hazardTable").innerHTML = html;
  })();

  // ---- board render, filter, search, sort ----
  var verdict = "ALL", query = "", sortKey = "implied-desc";
  function visibleRows() {
    var list = rows.filter(function (r) {
      if (verdict !== "ALL" && r.verdict !== verdict) return false;
      if (query) {
        var q = query.toLowerCase();
        if (r.name.toLowerCase().indexOf(q) < 0 && r.slug.toLowerCase().indexOf(q) < 0) return false;
      }
      return true;
    });
    if (sortKey === "implied-asc") list.sort(function (x, y) { return x.implied - y.implied; });
    else if (sortKey === "tvl-desc") list.sort(function (x, y) { return y.tvl - x.tvl; });
    else if (sortKey === "name-asc") list.sort(function (x, y) { return x.name < y.name ? -1 : 1; });
    else list.sort(function (x, y) { return y.implied - x.implied || (x.slug < y.slug ? -1 : 1); });
    return list;
  }
  function renderBoard() {
    var list = visibleRows();
    document.getElementById("countLine").textContent = "Showing " + list.length + " of 198";
    var html = "";
    list.forEach(function (r, i) {
      html += '<tr data-slug="' + r.slug + '"><td>' + (i + 1) + "</td><td><strong>" + r.name + "</strong><br><span>" + r.slug + "</span></td><td>" + r.chain + "</td><td>" + money(r.tvl) + "</td><td>" + pct(r.chg) + "</td><td>" + (r.ageU ? "—" : r.age + "d") + "</td><td>" + money(r.implied) + "</td><td>" + money(r.ev) + '</td><td><span class="badge ' + r.verdict + '">' + r.verdict + "</span></td></tr>";
    });
    var body = document.getElementById("boardBody");
    body.innerHTML = html;
    Array.prototype.forEach.call(body.querySelectorAll("tr"), function (tr) {
      tr.addEventListener("click", function () { openDetail(tr.getAttribute("data-slug")); });
    });
  }
  document.getElementById("verdictFilters").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    verdict = b.getAttribute("data-v");
    Array.prototype.forEach.call(this.querySelectorAll("button"), function (x) { x.classList.toggle("active", x === b); });
    renderBoard();
  });
  document.getElementById("search").addEventListener("input", function (e) { query = e.target.value.trim(); renderBoard(); });
  document.getElementById("sortSel").addEventListener("change", function (e) { sortKey = e.target.value; renderBoard(); });

  // ---- live-token tab ----
  document.getElementById("tabLive").addEventListener("click", function () {
    document.getElementById("tabLive").classList.add("active");
    document.getElementById("tabBoard").classList.remove("active");
    document.getElementById("boardPane").hidden = true;
    document.getElementById("livePane").hidden = false;
    document.getElementById("detail").hidden = true;
    document.getElementById("liveCount").textContent = "Showing " + R.live.length + " traded-token protocols, largest market cap first";
    var html = "";
    R.live.forEach(function (p, i) {
      html += "<tr><td>" + (i + 1) + "</td><td><strong>" + p[1] + "</strong><br><span>" + p[0] + "</span></td><td>" + money(p[2]) + "</td><td>" + money(p[3]) + "</td></tr>";
    });
    document.getElementById("liveBody").innerHTML = html;
  });
  document.getElementById("tabBoard").addEventListener("click", function () {
    document.getElementById("tabBoard").classList.add("active");
    document.getElementById("tabLive").classList.remove("active");
    document.getElementById("boardPane").hidden = false;
    document.getElementById("livePane").hidden = true;
    document.getElementById("detail").hidden = true;
  });

  // ---- detail view ----
  function planSteps(r) {
    var gas = r.gas >= 1 ? "$" + r.gas : "$" + r.gas.toFixed(2);
    var cost = r.cost >= 100 ? "$" + Math.round(r.cost) : "$" + r.cost.toFixed(2);
    var weekly;
    var c = r.cat.toLowerCase();
    if (c.indexOf("lend") >= 0) weekly = "Each week, supply or borrow on " + r.name + " at least once so the activity counts toward any future distribution.";
    else if (c.indexOf("dex") >= 0 || c.indexOf("exchange") >= 0) weekly = "Each week, swap or add liquidity on " + r.name + " at least once so the activity counts toward any future distribution.";
    else if (c.indexOf("yield") >= 0) weekly = "Each week, harvest or restake rewards on " + r.name + " at least once so the activity counts toward any future distribution.";
    else if (c.indexOf("cdp") >= 0 || c.indexOf("stable") >= 0) weekly = "Each week, mint or adjust a position on " + r.name + " at least once so the activity counts toward any future distribution.";
    else if (c.indexOf("deriv") >= 0 || c.indexOf("perp") >= 0) weekly = "Each week, open or close a trade on " + r.name + " at least once so the activity counts toward any future distribution.";
    else if (c.indexOf("restak") >= 0 || c.indexOf("staking") >= 0) weekly = "Each week, check and top up the stake on " + r.name + " at least once so the activity counts toward any future distribution.";
    else if (c.indexOf("bridge") >= 0) weekly = "Each week, bridge a small amount through " + r.name + " at least once so the activity counts toward any future distribution.";
    else if (c.indexOf("prediction") >= 0) weekly = "Each week, place a small prediction on " + r.name + " at least once so the activity counts toward any future distribution.";
    else if (c.indexOf("rwa") >= 0) weekly = "Each week, review and interact with a vault on " + r.name + " at least once so the activity counts toward any future distribution.";
    else if (c.indexOf("farm") >= 0) weekly = "Each week, claim or compound farm rewards on " + r.name + " at least once so the activity counts toward any future distribution.";
    else if (c.indexOf("option") >= 0) weekly = "Each week, open or settle an option on " + r.name + " at least once so the activity counts toward any future distribution.";
    else if (c.indexOf("liquid") >= 0) weekly = "Each week, deposit or withdraw liquidity on " + r.name + " at least once so the activity counts toward any future distribution.";
    else if (c.indexOf("vault") >= 0 || c.indexOf("curator") >= 0 || c.indexOf("curation") >= 0) weekly = "Each week, review the vault allocation on " + r.name + " at least once so the activity counts toward any future distribution.";
    else weekly = "Each week, use the main feature of " + r.name + " at least once so the activity counts toward any future distribution.";
    return [
      "Move $" + r.dep + " in USDC to a wallet on " + r.chain + " for " + r.name + "; the network gas for the move is about " + gas + ".",
      "Deposit $" + r.dep + " into " + r.name + " (" + r.cat + ") on " + r.chain + " and check that the position shows in the app.",
      "Hold the position for " + r.hold + " days; check it weekly, and add funds only if the pool TVL drops sharply.",
      weekly,
      "If " + r.name + " records a token, claim inside the first claim window; unstake only after the snapshot, not before.",
      "Exit by withdrawing the deposit plus any rewards; gas is about " + gas + ", so the all-in plan cost is about " + cost + " plus " + r.hold + " days of time."
    ];
  }
  function openDetail(slug) {
    var r = null;
    rows.forEach(function (x) { if (x.slug === slug) r = x; });
    if (!r) return;
    var ageLine = r.ageU
      ? "Age: assumed 513 days (listing date unreported)."
      : "Age: " + r.age + " days.";
    var missing = r.ageU && r.chgU ? "the age and the 7-day change are"
      : r.ageU ? "the age is"
      : "the 7-day change is";
    var note = (r.ageU || r.chgU)
      ? '<p class="warn">SKIP — an input is unreported, so ' + missing + ' assumed, and the odds are assumed, not observed.</p>'
      : "";
    var steps = planSteps(r).map(function (s) { return "<li>" + s + "</li>"; }).join("");
    document.getElementById("detailBody").innerHTML =
      "<h2>" + r.name + ' <span class="badge ' + r.verdict + '">' + r.verdict + "</span></h2>" +
      "<p>" + r.slug + " · " + r.cat + " · " + r.chain + " · TVL " + money(r.tvl) + " · 7d " + pct(r.chg) + "</p>" +
      "<dl class=\"kv\">" +
      "<dt>Size term exp(a + b·ln TVL)</dt><dd>" + money(r.base) + " — exp(a + b·ln TVL) on the fitted curve.</dd>" +
      "<dt>Growth factor</dt><dd>" + r.growth.toFixed(4) + "</dd>" +
      "<dt>Maturity factor</dt><dd>" + r.mat.toFixed(4) + "</dd>" +
      "<dt>Odds</dt><dd>" + r.odds.toFixed(4) + " — Odds use the assumed smooth exponential (see the method box).</dd>" +
      "<dt>Implied value</dt><dd>" + money(r.implied) + " — Implied value: fitted size curve × assumed odds × growth × maturity (see the method box).</dd>" +
      "<dt>Expected airdrop</dt><dd>" + money(r.ev) + " (farmer share of a 7% pool)</dd>" +
      "<dt>Expected / at-risk ratio</dt><dd>" + r.ratio.toFixed(2) + "×</dd>" +
      "<dt>Cost</dt><dd>" + money2(r.cost) + " = deposit " + money2(r.dep) + " + gas " + money2(r.gas) + "</dd>" +
      "<dt>Hold</dt><dd>" + r.hold + " days</dd>" +
      "<dt>Age</dt><dd>" + ageLine + "</dd>" +
      "</dl>" + note +
      "<h3>Farm plan</h3><ol class=\"plan\">" + steps + "</ol>";
    document.getElementById("detail").hidden = false;
    document.getElementById("detail").scrollIntoView();
  }
  document.getElementById("detailClose").addEventListener("click", function () {
    document.getElementById("detail").hidden = true;
  });

  // ---- deep links: #detail=slug, #filter=FARM, #tab=live ----
  function applyHash() {
    var hash = window.location.hash || "";
    var m = hash.match(/detail=([^&]+)/);
    if (m) openDetail(decodeURIComponent(m[1]));
    var f = hash.match(/filter=([A-Z]+)/);
    if (f && (f[1] === "FARM" || f[1] === "THIN" || f[1] === "SKIP")) {
      verdict = f[1];
      Array.prototype.forEach.call(document.querySelectorAll("#verdictFilters button"), function (x) {
        x.classList.toggle("active", x.getAttribute("data-v") === verdict);
      });
      renderBoard();
    }
    if (hash.indexOf("tab=live") >= 0) document.getElementById("tabLive").click();
  }
  window.addEventListener("hashchange", applyHash);
  renderBoard();
  applyHash();
})();
