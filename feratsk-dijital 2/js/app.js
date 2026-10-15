/* ==========================================================================
   FERATSK DİJİTAL — APPLICATION
   Language system, section rendering, interactions and motion.
   Motion language: ease-out cubic-bezier(.16,1,.3,1) for entrances,
   ease-in-out (.65,0,.35,1) for wipes; 0.28s micro / 0.6s UI / 1.1s reveals;
   rise distance 28px; headline lines stagger 85ms.
   ========================================================================== */
(function () {
  "use strict";

  const CFG = window.SITE_CONFIG;
  const DICT = window.I18N;
  const C = window.CONTENT;
  const LANGS = ["tr", "en"];
  const STORE_KEY = "feratsk-lang";

  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduce = mqReduce.matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduce;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const pad = (n) => String(n).padStart(2, "0");

  /* ---------------- Language state ---------------- */
  let lang = readLang();
  function readLang() {
    try {
      const v = localStorage.getItem(STORE_KEY);
      if (LANGS.includes(v)) return v;
    } catch (e) { /* storage unavailable */ }
    return "tr";
  }
  function saveLang(v) {
    try { localStorage.setItem(STORE_KEY, v); } catch (e) { /* ignore */ }
  }
  const isLocalized = (o) => o && typeof o === "object" && !Array.isArray(o) && "tr" in o && "en" in o;
  const pick = (o) => (isLocalized(o) ? o[lang] : o);
  function resolve(root, path) {
    let o = root;
    for (const seg of path.split(".")) {
      if (o == null) return undefined;
      if (isLocalized(o) && !(seg in o)) o = o[lang];
      o = o[seg];
    }
    return pick(o);
  }
  function t(path) {
    const v = resolve(DICT[lang], path);
    if (v == null) { console.warn("[i18n] missing key:", path); return ""; }
    return v;
  }
  const c = (path) => resolve(C, path);
  /* Apple-style sentence case: copy written in ALL CAPS is shown as a sentence.
     Brand names stay untouched. */
  function sentence(str, loc) {
    const lower = str.toLocaleLowerCase(loc);
    return lower.replace(/(^|[.!?]\s+)(\p{L})/gu, (m, a, b) => a + b.toLocaleUpperCase(loc));
  }
  const isShouting = (v) => typeof v === "string" && /\p{L}{2}/u.test(v) && v === v.toLocaleUpperCase("tr-TR") && !/FERATSK|^[A-Z0-9]{1,3}$/.test(v);
  function normalizeCase(node, loc) {
    if (Array.isArray(node)) {
      if (node.length && node.every((x) => typeof x === "string") && node.every(isShouting)) {
        const joined = sentence(node.join("\u0000"), loc).split("\u0000");
        return joined.map((ln, i) => (i > 0 && !/[.!?]$/.test(node[i - 1]) ? ln : ln.charAt(0).toLocaleUpperCase(loc) + ln.slice(1)));
      }
      return node.map((x) => normalizeCase(x, loc));
    }
    if (node && typeof node === "object") {
      for (const k of Object.keys(node)) {
        const childLoc = k === "tr" ? "tr-TR" : k === "en" ? "en-US" : loc;
        node[k] = normalizeCase(node[k], childLoc);
      }
      return node;
    }
    return isShouting(node) ? sentence(node, loc) : node;
  }
  normalizeCase(DICT, "tr-TR");
  C.services.forEach((x) => normalizeCase(x.title, "tr-TR"));
  C.process.forEach((x) => normalizeCase(x.title, "tr-TR"));

  const catName = (id) => { const k = C.categories.find((x) => x.id === id); return k ? k[lang] : ""; };
  const upperTR = (s) => s.toLocaleUpperCase("tr-TR");

  /* ---------------- Icons ---------------- */
  const ICON = {
    diag: '<svg viewBox="0 0 16 16" fill="none"><path d="M4 12L12 4M5.5 4H12v6.5" stroke="currentColor" stroke-width="1.5"/></svg>',
    right: '<svg viewBox="0 0 16 16" fill="none"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg>'
  };
  function arrows(root = document) {
    $$(".arw", root).forEach((a) => {
      if (a.dataset.done) return;
      const k = a.classList.contains("right") ? "right" : "diag";
      a.innerHTML = ICON[k] + ICON[k];
      a.dataset.done = "1";
    });
  }

  /* ---------------- Media helpers ---------------- */
  function mediaHTML(p, eager) {
    const cover = p.cover || {};
    if (cover.video) {
      return `<video muted loop playsinline preload="${eager ? "metadata" : "none"}" ${cover.poster ? `poster="${esc(cover.poster)}"` : ""} src="${esc(cover.video)}"></video>`;
    }
    if (cover.image) {
      return `<img src="${esc(cover.image)}" alt="" loading="${eager ? "eager" : "lazy"}" decoding="async">`;
    }
    return window.SCENES.render(p.scene);
  }
  const serviceForCategory = { realestate: "realestate", architecture: "realestate", drone: "realestate", commercial: "film", brand: "film", social: "content", ai: "ai", wedding: "wedding" };

  /* ---------------- Headlines ---------------- */
  function linesHTML(lines) {
    return lines.map((ln, i) =>
      `<span class="l"><span class="li" style="--i:${i}">${esc(ln).replace(/\.$/, '<span class="dot">.</span>')}</span></span>`
    ).join("");
  }
  function fitHeadline(el) {
    const kind = el.dataset.fit;
    const lis = $$(".li", el);
    if (!lis.length) return;
    el.style.fontSize = "100px";
    el.style.whiteSpace = "nowrap";
    let widest = 0;
    lis.forEach((s) => { widest = Math.max(widest, s.getBoundingClientRect().width); });
    el.style.whiteSpace = "";
    const avail = el.clientWidth;
    if (!widest || !avail) { el.style.fontSize = ""; return; }
    let fs = (100 * avail) / widest * 0.985;
    fs = Math.min(kind === "hero" ? 158 : 168, fs);
    if (kind === "hero" && window.innerWidth > 760) {
      const cap = (window.innerHeight - 360) / (lis.length * 0.92);
      if (cap > 44) fs = Math.min(fs, cap);
    }
    // Small screens: keep a strong minimum and let the longest line wrap if it must.
    const floor = window.innerWidth <= 760 ? 46 : 30;
    el.style.fontSize = Math.max(floor, fs) + "px";
  }
  function fitWordmark() {
    const el = $("#wordmark");
    if (!el) return;
    el.style.fontSize = "100px";
    const w = el.getBoundingClientRect().width;
    const host = el.parentElement;
    const cs = getComputedStyle(host);
    const avail = host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (w && avail) el.style.fontSize = Math.max(40, (100 * avail) / w * 0.995) + "px";
  }
  function fitAll() {
    $$("[data-fit]").forEach(fitHeadline);
    fitWordmark();
    $$(".lang").forEach(placeLangIndicator);
  }

  /* ---------------- Builders (run once; text filled by applyText) ---------------- */
  function buildServices() {
    const grid = $("#svc-grid");
    grid.innerHTML = C.services.map((s, i) => {
      const p = `services.${i}`;
      const tags = s.tags.tr.map((_, j) => `<li data-c="${p}.tags.${j}"></li>`).join("");
      const top = `<div class="svc-top"><span class="svc-no">${s.no} / ${pad(C.services.length)}</span><span class="svc-icon"><span class="arw" aria-hidden="true"></span></span></div>`;
      const body = `<div class="svc-body">
          <h3 class="svc-title" data-c="${p}.title"></h3>
          <p class="svc-text" data-c="${p}.text"></p>
          <ul class="svc-tags">${tags}</ul>
          <a href="#contact-form" class="svc-link" data-service="${s.id}"><span data-i18n="services.cta"></span><span class="arw right" aria-hidden="true"></span></a>
        </div>`;
      let inner = "";
      if (s.layout === "calendar") {
        const days = [0, 1, 2, 3, 4, 5, 6].map((d) => `<span class="d" data-i18n="services.days.${d}"></span>`).join("");
        const planned = [1, 3, 5, 8, 9, 12, 15, 17, 19, 22, 23, 26];
        const accent = [9, 19];
        const cells = Array.from({ length: 28 }, (_, k) => `<span class="c${planned.includes(k) ? " p" : ""}${accent.includes(k) ? " a" : ""}"></span>`).join("");
        inner = top + body + `<div class="cal" aria-hidden="true"><div class="cal-grid">${days}${cells}</div><div class="cal-cap"><span data-i18n="services.calendarCaption"></span><span>W41–44</span></div></div>`;
      } else if (s.layout === "frame") {
        inner = top + `<div class="frame" aria-hidden="true">${window.SCENES.render(s.scene)}
            <div class="frame-ui"><div class="row"><span class="rec"><i></i>TC 01:00:12:08</span><span>2.39:1</span></div>
            <div class="row"><span>A001_C014</span><span>4K · 24p</span></div></div></div>` + body;
      } else if (s.layout === "blueprint") {
        inner = `<div class="blueprint" aria-hidden="true">${blueprintSVG()}
            <div class="hud"><span data-i18n="services.hud"></span><span data-i18n="services.north"></span></div></div>
          <div style="display:flex;flex-direction:column;gap:22px;min-width:0">${top}${body}</div>`;
      } else if (s.layout === "ai") {
        inner = top + body + `<div class="ai-vis" aria-hidden="true">${window.SCENES.render("ai")}
            <div class="ai-prompt"><span class="ai-dot"></span><span data-i18n="services.prompt"></span><span class="caret"></span></div></div>`;
      } else if (s.layout === "wedding") {
        inner = `<div class="wed-vis" aria-hidden="true">${window.SCENES.render("wedding")}<div class="frame-ui"><div class="row"><span class="rec"><i></i>REC</span><span>4K · 24p</span></div></div></div>` + top + body;
      } else {
        const ph = ["plate", "coast", "skyline"].map((k) => `<div class="reel-phone">${window.SCENES.render(k)}<div class="bars"><i></i><i></i><i></i></div></div>`).join("");
        inner = top + body + `<div class="reels" aria-hidden="true">${ph}</div>`;
      }
      return `<article class="svc rv" data-layout="${s.layout}" data-id="${s.id}" style="--rd:${(i % 2) * 90}ms">${inner}</article>`;
    }).join("");
  }
  function blueprintSVG() {
    const d = (path, extra = "") => `<path class="draw" pathLength="1" d="${path}" ${extra}/>`;
    return `<svg viewBox="0 0 300 375" fill="none" stroke="#86868B" stroke-width="1.4" stroke-linecap="square">
      ${d("M20 30H280V300H20Z", 'stroke="#1D1D1F" stroke-width="2.2"')}
      ${d("M20 150H120M146 150H150V30")}
      ${d("M150 190V300M150 190H210M236 190H280")}
      ${d("M120 150A26 26 0 0 1 146 124")}
      ${d("M210 190A26 26 0 0 0 236 164")}
      ${d("M40 200H120V280H40Z M40 216H120M40 232H120M40 248H120M40 264H120")}
      ${d("M60 30H110M190 30H250M280 60V120", 'stroke="#1D1D1F" stroke-width="5"')}
      ${d("M20 325H280M20 318V332M280 318V332", 'stroke="#FC4306"')}
      ${d("M305 30V300M298 30H312M298 300H312", 'stroke="#FC4306" transform="translate(-14 0)"')}
      <circle cx="215" cy="100" r="16" stroke="#FC4306" stroke-dasharray="3 3"/>
      <path d="M215 88V112M203 100H227" stroke="#FC4306"/>
      <text x="150" y="350" fill="#6E6E73" stroke="none" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" data-i18n="services.dim">12,40 m</text>
      <text x="30" y="48" fill="#86868B" stroke="none" font-family="JetBrains Mono, monospace" font-size="9">A-01</text>
      <text x="160" y="48" fill="#86868B" stroke="none" font-family="JetBrains Mono, monospace" font-size="9">A-02</text>
      <text x="160" y="208" fill="#86868B" stroke="none" font-family="JetBrains Mono, monospace" font-size="9">A-03</text>
    </svg>`;
  }

  // Apple-style rhythm: one wide tile, then two pairs of half tiles.
  const workPattern = (k) => (k % 5 === 0 ? "w" : "h");
  function buildWorks() {
    $("#works").innerHTML = C.projects.map((p, i) => `
      <article class="work rv" data-id="${esc(p.id)}" data-cat="${esc(p.category)}" data-p="${workPattern(i)}">
        <div class="work-media" ${p.cover ? "" : 'role="img" data-i18n-aria="a11y.placeholderMedia"'}>
          <div class="par">${mediaHTML(p, false)}</div>
          <div class="work-badges">${p.sample ? '<span class="badge sample" data-i18n="work.sample"></span>' : "<span></span>"}${p.year ? `<span class="badge">${esc(p.year)}</span>` : ""}</div>
        </div>
        <div class="work-meta">
          <span class="work-idx">(${pad(i + 1)})</span>
          <h3 class="work-title"><button type="button" class="work-open" data-open="${esc(p.id)}" data-c="projects.${i}.title"></button></h3>
          <span class="arw" aria-hidden="true"></span>
          <span class="work-cat" style="grid-column:2/-1" data-cat-label="${esc(p.category)}"></span>
          <p class="work-sum" data-c="projects.${i}.summary"></p>
        </div>
      </article>`).join("") + `<p class="works-empty" id="works-empty" hidden data-i18n="work.noResults"></p>`;
  }

  function buildTrust() {
    $("#pillars").innerHTML = C.pillars.map((p, i) => `
      <li class="pillar rv"><span class="code">${esc(p.code)}</span><h3 data-c="pillars.${i}.title"></h3><p data-c="pillars.${i}.text"></p></li>`).join("");
    const f = [["founder", "studioFacts.founder"], ["base", "studioFacts.base"], ["disciplines", "studioFacts.disciplines"], ["sectors", "studioFacts.sectors"]];
    $("#facts").innerHTML = f.map(([k, path]) => `<div><dt data-i18n="trust.facts.${k}"></dt><dd data-c="${path}"></dd></div>`).join("");
  }

  /* ---------------- Blog ---------------- */
  const BLOG = window.BLOG || [];
  const postState = { i: -1 };
  function fmtDate(iso) {
    try { return new Date(iso + "T12:00:00").toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", { day: "numeric", month: "long", year: "numeric" }); }
    catch (e) { return iso; }
  }
  function renderBlog() {
    const box = $("#blog-grid");
    if (!box) return;
    box.innerHTML = BLOG.map((p, i) => `
      <article class="post-card rv" data-tone="${esc(p.tone || "mist")}" style="--rd:${(i % 3) * 80}ms">
        <span class="post-cat">${esc(pick(p.category))}</span>
        <h3 class="post-title"><button type="button" class="post-open" data-post="${i}">${esc(pick(p.title))}</button></h3>
        <p class="post-ex">${esc(pick(p.excerpt))}</p>
        <div class="post-meta"><span>${esc(fmtDate(p.date))} · ${p.minutes} ${esc(t("blog.minutes"))}</span><span class="post-more">${esc(t("blog.read"))} <span class="arw right" aria-hidden="true"></span></span></div>
      </article>`).join("");
    arrows(box);
    if (window.__revealObserver) $$(".rv", box).forEach((el) => window.__revealObserver.observe(el));
    else $$(".rv", box).forEach((el) => el.classList.add("is-in"));
  }
  function openPost(i) {
    if (!BLOG[i]) return;
    postState.i = i;
    renderPost();
    openDialog($("#post-dialog"));
    $("#post-dialog").scrollTop = 0;
  }
  function renderPost() {
    const p = BLOG[postState.i];
    if (!p) return;
    $("#post-crumb").textContent = `Blog · ${pick(p.category)}`;
    $("#post-content").innerHTML = `
      <article class="post-body">
        <span class="eyebrow">${esc(pick(p.category))}</span>
        <h2 id="post-title">${esc(pick(p.title))}</h2>
        <p class="post-lead">${esc(pick(p.excerpt))}</p>
        <p class="post-info">FERATSK DİJİTAL · ${esc(fmtDate(p.date))} · ${p.minutes} ${esc(t("blog.minutes"))}</p>
        <div class="prose">${pick(p.body)}</div>
        <div class="post-cta"><a href="#contact-form" class="btn btn-primary" data-post-cta data-service="${esc(p.service || "")}"><span>${esc(t("blog.cta"))}</span><span class="arw" aria-hidden="true"></span></a></div>
      </article>`;
    arrows($("#post-content"));
  }

  function buildProcess() {
    $("#steps").innerHTML = `<span class="rail" aria-hidden="true"><i></i></span>` + C.process.map((s, i) => `
      <li class="step rv" style="--rd:${i * 110}ms"><span class="node" aria-hidden="true"></span>
        <span class="no" aria-hidden="true">${s.no}</span>
        <h3><span class="sr-step" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"><span data-i18n="process.step"></span> ${s.no}: </span><span data-c="process.${i}.title"></span></h3>
        <p data-c="process.${i}.text"></p>
      </li>`).join("");
  }

  /* ---------------- Language-dependent rendering ---------------- */
  let manifestoST = null;
  function renderManifesto() {
    const el = $("#manifesto-text");
    const words = t("manifesto.text").split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
    if (manifestoST) lightWords(manifestoST.progress);
  }
  function lightWords(p) {
    const ws = $$("#manifesto-text .w");
    const n = Math.round(p * ws.length);
    ws.forEach((w, i) => w.classList.toggle("on", i < n));
  }
  function renderMarquee() {
    if (!$("#marquee")) return;
    const items = C.categories.map((k) => `<span>${esc(k[lang])}</span>`).join("");
    $("#marquee").innerHTML = items + items;
  }
  function renderFilters() {
    const box = $("#filters");
    const counts = {};
    C.projects.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
    const list = [{ id: "all", label: t("work.all"), n: C.projects.length }]
      .concat(C.categories.filter((k) => counts[k.id]).map((k) => ({ id: k.id, label: k[lang], n: counts[k.id] })));
    box.innerHTML = list.map((f) => `<button type="button" data-filter="${f.id}" aria-pressed="${state.filter === f.id}">${esc(f.label)}<sup>${pad(f.n)}</sup></button>`).join("");
  }
  function renderSelect() {
    const sel = $("#f-service");
    const val = sel.value;
    sel.innerHTML = `<option value="">${esc(t("contact.form.servicePh"))}</option>` +
      C.services.map((s) => `<option value="${s.id}">${esc(pick(s.title))}</option>`).join("") +
      `<option value="other">${esc(t("contact.form.serviceOther"))}</option>`;
    sel.value = val;
  }
  function waLink() {
    const n = CFG.contact.whatsapp;
    return n ? `https://wa.me/${String(n).replace(/\D/g, "")}?text=${encodeURIComponent(t("contact.waText"))}` : null;
  }
  function renderChannels() {
    const ct = CFG.contact;
    const rows = [];
    const row = (k, v) => `<div class="channel"><span class="k">${esc(k)}</span>${v}</div>`;
    const copyable = (val) => `<span style="display:flex;gap:12px;align-items:center;min-width:0"><span class="v" data-copy-src>${esc(val)}</span><button type="button" class="copy-btn" data-copy="${esc(val)}">${esc(t("contact.copy"))}</button></span>`;
    const wa = waLink();
    if (wa) rows.push(row("WhatsApp", `<a class="v" href="${esc(wa)}" target="_blank" rel="noopener">${esc(t("contact.whatsapp"))} ↗</a>`));
    if (ct.email) rows.push(row(t("contact.email"), copyable(ct.email)));
    if (ct.phone) rows.push(row(t("contact.phone"), copyable(ct.phone)));
    (CFG.social || []).forEach((s) => rows.push(row(s.label, `<a class="v" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.handle || s.url.replace(/^https?:\/\/(www\.)?/, ""))} ↗</a>`)));
    rows.push(row(t("contact.base"), `<span class="v">${esc(pick(CFG.brand.city))}</span>`));
    let html = rows.join("");
    if (!wa && !ct.email && !ct.phone && !(CFG.social || []).length) {
      html += `<div class="setup" style="margin-top:16px"><strong>${esc(t("contact.setupTitle"))}</strong><p>${esc(t("contact.setupContact"))}</p></div>`;
    }
    $("#channels").innerHTML = html;

    const cta = $("#contact-cta");
    if (wa) { cta.href = wa; cta.target = "_blank"; cta.rel = "noopener"; }
    else { cta.href = "#contact-form"; cta.removeAttribute("target"); }
  }
  function renderFooterLists() {
    const loc = lang === "tr" ? "tr-TR" : "en-US";
    const titleCase = (str) => str.toLocaleLowerCase(loc).split(" ").map((w) => w.charAt(0).toLocaleUpperCase(loc) + w.slice(1)).join(" ");
    $("#foot-services").innerHTML = C.services.map((s) => `<li><a href="#services">${esc(titleCase(pick(s.title)))}</a></li>`).join("");
    const soc = CFG.social || [];
    $("#foot-social").innerHTML = soc.length
      ? soc.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a></li>`).join("")
      : `<li class="muted">${esc(t("footer.socialEmpty"))}</li>`;
    const ct = CFG.contact;
    const items = [`<li>${esc(pick(CFG.brand.city))}</li>`];
    if (ct.email) items.push(`<li>${esc(ct.email)}</li>`);
    if (ct.phone) items.push(`<li>${esc(ct.phone)}</li>`);
    const wa = waLink();
    if (wa) items.push(`<li><a href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp ↗</a></li>`);
    if (items.length === 1) items.push(`<li class="muted">${esc(t("footer.contactEmpty"))}</li>`);
    $("#foot-contact").innerHTML = items.join("");
    $("#copyright").textContent = `© ${new Date().getFullYear()} FERATSK DİJİTAL. ${t("footer.rights")}`;
  }
  function renderMeta() {
    document.documentElement.lang = lang;
    document.title = t("meta.title");
    const set = (sel, attr, val) => { const m = $(sel); if (m) m.setAttribute(attr, val); };
    set('meta[name="description"]', "content", t("meta.description"));
    set('meta[property="og:title"]', "content", t("meta.title"));
    set('meta[property="og:description"]', "content", t("meta.description"));
    set('meta[property="og:locale"]', "content", t("meta.ogLocale"));
    set('meta[property="og:locale:alternate"]', "content", lang === "tr" ? "en_US" : "tr_TR");
  }
  function placeLangIndicator(group) {
    const active = $(`button[data-lang="${lang}"]`, group);
    const ind = $(".ind", group);
    if (!active || !ind) return;
    ind.style.left = active.offsetLeft + "px";
    ind.style.width = active.offsetWidth + "px";
  }
  function renderLangUI() {
    $$(".lang button[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    $$(".lang").forEach(placeLangIndicator);
  }

  function applyText() {
    renderMeta();
    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $$("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    $$("[data-i18n-lines]").forEach((el) => { el.innerHTML = linesHTML(t(el.dataset.i18nLines)); });
    $$("[data-c]").forEach((el) => { const v = c(el.dataset.c); el.textContent = v == null ? "" : v; });
    $$("[data-cat-label]").forEach((el) => { el.textContent = catName(el.dataset.catLabel); });
    if ($("#hero-coords")) $("#hero-coords").textContent = `${CFG.brand.coordinates} · ${upperTR(pick(CFG.brand.city))}`;
    renderManifesto();
    renderMarquee();
    renderFilters();
    renderSelect();
    renderChannels();
    renderFooterLists();
    renderLangUI();
    $$(".err[data-code]").forEach((el) => { el.textContent = t("contact.form." + el.dataset.code); });
    renderStatus();
    if (pdState.index > -1 && $("#project-dialog").open) renderProject();
    renderBlog();
    if ($("#post-dialog") && $("#post-dialog").open) renderPost();
    renderReelText();
    arrows();
    fitAll();
  }

  function setLang(next) {
    if (!LANGS.includes(next) || next === lang) return;
    const root = document.documentElement;
    const swap = () => {
      lang = next;
      saveLang(lang);
      applyText();
      const inView = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; };
      const replay = motion ? $$(".reveal-lines.is-in").filter(inView) : [];
      replay.forEach((el) => { el.classList.remove("is-in"); $$(".li", el).forEach((sp) => { sp.style.transition = "none"; }); });
      root.classList.remove("is-switching");
      void document.body.offsetWidth;
      replay.forEach((el) => { $$(".li", el).forEach((sp) => { sp.style.transition = ""; }); el.classList.add("is-in"); });
      if (hasGsap) window.ScrollTrigger.refresh();
    };
    if (reduce) { swap(); return; }
    root.classList.add("is-switching");
    setTimeout(swap, 230);
  }

  /* ---------------- Work filter ---------------- */
  const state = { filter: "all" };
  function setFilter(f) {
    if (f === state.filter) return;
    state.filter = f;
    $$("#filters button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === f)));
    const items = $$(".work");
    items.forEach((el) => el.classList.add("is-out"));
    setTimeout(() => {
      let k = 0;
      items.forEach((el) => {
        const show = f === "all" || el.dataset.cat === f;
        el.hidden = !show;
        if (show) { el.dataset.p = workPattern(k); k += 1; }
      });
      $("#works-empty").hidden = k > 0;
      requestAnimationFrame(() => {
        let j = 0;
        items.forEach((el) => {
          if (el.hidden) return;
          el.style.transitionDelay = j * 70 + "ms";
          el.classList.add("is-in");
          el.classList.remove("is-out");
          j += 1;
          setTimeout(() => { el.style.transitionDelay = ""; }, 900);
        });
        if (hasGsap) window.ScrollTrigger.refresh();
      });
    }, reduce ? 0 : 300);
  }

  /* ---------------- Dialogs ---------------- */
  const pdState = { index: -1, lastFocus: null };
  function openDialog(dlg) {
    if (dlg.open) return;
    pdState.lastFocus = document.activeElement;
    dlg.classList.remove("closing");
    dlg.showModal();
    document.body.style.overflow = "hidden";
  }
  function closeDialog(dlg, after) {
    if (!dlg.open) return;
    const done = () => {
      dlg.classList.remove("closing");
      dlg.close();
      document.body.style.overflow = "";
      $$("video", dlg).forEach((v) => v.pause());
      if (after) after();
      else if (pdState.lastFocus && pdState.lastFocus.focus) pdState.lastFocus.focus({ preventScroll: true });
    };
    if (reduce) { done(); return; }
    dlg.classList.add("closing");
    setTimeout(done, 430);
  }
  function openProject(id) {
    const i = C.projects.findIndex((p) => p.id === id);
    if (i < 0) return;
    pdState.index = i;
    renderProject();
    openDialog($("#project-dialog"));
    $("#project-dialog").scrollTop = 0;
  }
  function stepProject(dir) {
    const n = C.projects.length;
    pdState.index = (pdState.index + dir + n) % n;
    renderProject();
    $("#project-dialog").scrollTop = 0;
  }
  function renderProject() {
    const i = pdState.index;
    const p = C.projects[i];
    const cat = catName(p.category);
    $("#pd-crumb").textContent = `${pad(i + 1)} / ${pad(C.projects.length)} · ${upperTR(cat)}`;
    const deliver = (pick(p.deliverables) || []).map((d) => `<li>${esc(d)}</li>`).join("");
    $("#pd-content").innerHTML = `
      <div class="pd-media" ${p.cover ? "" : `role="img" aria-label="${esc(t("a11y.placeholderMedia"))}"`}>${mediaHTML(p, true)}
        <div class="frame-ui"><div class="row"><span class="rec"><i></i>${esc(upperTR(p.id))}</span>${p.sample ? `<span class="badge sample">${esc(t("work.sample"))}</span>` : ""}</div>
        <div class="row"><span>A00${(i % 9) + 1}_C0${pad(i + 11)}</span><span>${esc(pick(p.format))}</span></div></div>
      </div>
      <div class="pd-body">
        <div class="pd-head">
          <span class="eyebrow">${esc(cat)}</span>
          <h2 id="pd-title">${esc(pick(p.title))}</h2>
          <p>${esc(pick(p.summary))}</p>
          ${p.sample ? `<div class="notice">${esc(t("work.sampleNotice"))}</div>` : ""}
          <div><a href="#contact-form" class="btn btn-primary" data-pd-cta data-service="${serviceForCategory[p.category] || ""}"><span>${esc(t("work.detailCta"))}</span><span class="arw" aria-hidden="true"></span></a></div>
        </div>
        <div class="pd-side">
          <dl>
            <div><dt>${esc(t("work.detailCategory"))}</dt><dd>${esc(cat)}</dd></div>
            <div><dt>${esc(t("work.detailFormat"))}</dt><dd>${esc(pick(p.format))}</dd></div>
            <div><dt>${esc(t("work.detailDeliverables"))}</dt><dd><ul>${deliver}</ul></dd></div>
            ${p.year ? `<div><dt>Year</dt><dd>${esc(p.year)}</dd></div>` : ""}
          </dl>
        </div>
      </div>`;
    arrows($("#pd-content"));
    const v = $("#pd-content video");
    if (v) v.play().catch(() => {});
  }
  function renderReelDialog() {
    const sr = CFG.media.showreel;
    $("#rd-content").innerHTML = sr && sr.src
      ? `<h3 id="rd-title" class="eyebrow">${esc(t("work.showreel"))}</h3><video controls playsinline ${sr.poster ? `poster="${esc(sr.poster)}"` : ""} src="${esc(sr.src)}"></video>`
      : `<div class="rd-empty"><span class="eyebrow">${esc(t("work.showreel"))}</span><h3 id="rd-title">${esc(t("work.showreelEmptyTitle"))}</h3><p>${esc(t("work.showreelEmptyText"))}</p></div>`;
  }

  /* ---------------- Navigation ---------------- */
  const nav = $("#nav");
  const mmenu = $("#mmenu");
  const burger = $("#burger");
  function openMenu() {
    mmenu.classList.add("is-open");
    mmenu.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    $("#main").inert = true;
    $(".site-footer").inert = true;
    setTimeout(() => $("#mmenu-close").focus(), 50);
  }
  function closeMenu(returnFocus) {
    if (!mmenu.classList.contains("is-open")) return;
    mmenu.classList.remove("is-open");
    mmenu.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    $("#main").inert = false;
    $(".site-footer").inert = false;
    if (returnFocus) burger.focus();
  }
  function scrollToEl(el, offset) {
    const top = el === document.body ? 0 : el.getBoundingClientRect().top + window.scrollY - (offset || 0);
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
  }
  function setService(id) {
    const sel = $("#f-service");
    if (id && [...sel.options].some((o) => o.value === id)) {
      sel.value = id;
      clearError("service");
    }
  }

  function bindNav() {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 40);
      const darkZones = $$(".band-dark");
      const probe = nav.offsetHeight / 2;
      nav.classList.toggle("on-dark", darkZones.some((z) => { const r = z.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; }));
      const down = y > lastY + 4, up = y < lastY - 4;
      if (down && y > 640 && !document.body.classList.contains("menu-open")) nav.classList.add("is-hidden");
      if (up || y < 640) nav.classList.remove("is-hidden");
      lastY = y;
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();

    nav.addEventListener("focusin", () => nav.classList.remove("is-hidden"));

    burger.addEventListener("click", openMenu);
    $("#mmenu-close").addEventListener("click", () => closeMenu(true));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(true); });

    // Active section in nav
    const links = $$(".nav-links a[data-link]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const id = en.target.id === "approach" ? "studio" : en.target.id === "process" ? "work" : en.target.id === "villa" ? "services" : en.target.id;
        links.forEach((a) => (a.dataset.link === id ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["studio", "services", "villa", "work", "approach", "process", "blog", "contact"].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });
    const heroIO = new IntersectionObserver(([en]) => { if (en.isIntersecting) links.forEach((a) => a.removeAttribute("aria-current")); }, { rootMargin: "-45% 0px -50% 0px" });
    heroIO.observe($("#top"));

    // In-page links
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href").slice(1);
      const target = id === "top" ? document.body : document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const inMenu = mmenu.contains(a);
      closeMenu(false);
      if (a.dataset.service) setService(a.dataset.service);
      const go = () => {
        scrollToEl(target, id === "contact-form" ? 110 : 0);
        if (id === "contact-form" && finePointer) setTimeout(() => $("#f-name").focus({ preventScroll: true }), reduce ? 0 : 700);
      };
      if (a.hasAttribute("data-pd-cta")) { closeDialog($("#project-dialog"), go); return; }
      if (a.hasAttribute("data-post-cta")) { closeDialog($("#post-dialog"), go); return; }
      if (inMenu && !reduce) setTimeout(go, 380); else go();
    });

    $("#to-top").addEventListener("click", () => scrollToEl(document.body));
    $$(".lang button[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  }

  function bindWork() {
    $("#filters").addEventListener("click", (e) => { const b = e.target.closest("button[data-filter]"); if (b) setFilter(b.dataset.filter); });
    $("#works").addEventListener("click", (e) => { const b = e.target.closest("[data-open]"); if (b) openProject(b.dataset.open); });
    $("#pd-prev").addEventListener("click", () => stepProject(-1));
    $("#pd-next").addEventListener("click", () => stepProject(1));
    $$(".dlg").forEach((dlg) => {
      dlg.addEventListener("cancel", (e) => { e.preventDefault(); closeDialog(dlg); });
      dlg.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeDialog(dlg); });
    });
    $("#project-dialog").addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") stepProject(1);
      if (e.key === "ArrowLeft") stepProject(-1);
    });
    // hover-play for real video covers
    $$(".work").forEach((w) => {
      const v = $("video", w);
      if (!v) return;
      w.addEventListener("mouseenter", () => v.play().catch(() => {}));
      w.addEventListener("mouseleave", () => v.pause());
    });
  }

  /* ---------------- Contact form ---------------- */
  const form = $("#contact-form");
  let attempted = false;
  let status = null; // { tone, title?, text, copy? }
  let lastPayload = null;
  function fieldEls(name) {
    return { input: form.elements[name], err: $("#e-" + name) };
  }
  function setError(name, code) {
    const { input, err } = fieldEls(name);
    input.setAttribute("aria-invalid", "true");
    err.dataset.code = code;
    err.textContent = t("contact.form." + code);
  }
  function clearError(name) {
    const { input, err } = fieldEls(name);
    if (!input || !err) return;
    input.removeAttribute("aria-invalid");
    delete err.dataset.code;
    err.textContent = "";
  }
  function validate() {
    const errs = {};
    const v = (n) => form.elements[n].value.trim();
    if (v("name").length < 2) errs.name = "errName";
    const reach = v("reach");
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(reach);
    const digits = reach.replace(/\D/g, "");
    const isPhone = /^[+\d\s().-]+$/.test(reach) && digits.length >= 10 && digits.length <= 15;
    if (!(isEmail || isPhone)) errs.reach = "errReach";
    if (!v("service")) errs.service = "errService";
    if (v("message").length < 20) errs.message = "errMessage";
    ["name", "reach", "service", "message"].forEach((n) => (errs[n] ? setError(n, errs[n]) : clearError(n)));
    return errs;
  }
  function renderStatus() {
    const box = $("#form-status");
    if (!status) { box.innerHTML = ""; return; }
    box.innerHTML = `<div class="status" data-tone="${status.tone}">
      ${status.title ? `<strong>${esc(t(status.title))}</strong>` : ""}
      <p>${esc(t(status.text))}</p>
      ${status.copy ? `<button type="button" class="copy-btn" data-copy-message>${esc(t("contact.form.copyMessage"))}</button>` : ""}
    </div>`;
  }
  function setStatus(s) { status = s; renderStatus(); }
  function setLoading(on) {
    const b = $("#f-submit");
    b.disabled = on;
    b.setAttribute("aria-busy", String(on));
    $("#f-submit-label").dataset.i18n = on ? "contact.form.sending" : "contact.form.submit";
    $("#f-submit-label").textContent = t($("#f-submit-label").dataset.i18n);
    const icon = $("#f-submit-icon");
    if (on) { icon.dataset.done = ""; icon.innerHTML = '<span class="spinner"></span>'; }
    else { icon.dataset.done = ""; arrows(b); }
  }
  function messageText(p) {
    const svc = p.service === "other" ? t("contact.form.serviceOther") : pick((C.services.find((s) => s.id === p.service) || {}).title) || "";
    return [
      `${t("contact.form.name")}: ${p.name}`,
      p.company ? `${t("contact.form.company")}: ${p.company}` : null,
      `${t("contact.form.reach")}: ${p.reach}`,
      `${t("contact.form.service")}: ${svc}`,
      "",
      p.message
    ].filter((x) => x !== null).join("\n");
  }
  function bindForm() {
    form.addEventListener("input", (e) => { if (attempted && e.target.name) { const errs = validate(); if (!Object.keys(errs).length && status && status.tone === "error") setStatus(null); } });
    form.addEventListener("change", (e) => { if (e.target.name === "service") clearError("service"); });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      attempted = true;
      const errs = validate();
      const keys = Object.keys(errs);
      if (keys.length) {
        setStatus({ tone: "error", text: "contact.form.errSummary" });
        form.elements[keys[0]].focus();
        return;
      }
      const payload = {
        name: form.elements.name.value.trim(),
        company: form.elements.company.value.trim(),
        reach: form.elements.reach.value.trim(),
        service: form.elements.service.value,
        message: form.elements.message.value.trim(),
        language: lang,
        source: "feratsk-website"
      };
      lastPayload = payload;
      const endpoint = CFG.form && CFG.form.endpoint;
      if (!endpoint) {
        // No delivery service configured: never pretend the message was sent.
        setStatus({ tone: "info", title: "contact.form.notConnectedTitle", text: "contact.form.notConnected", copy: true });
        return;
      }
      setLoading(true);
      setStatus(null);
      try {
        const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error("HTTP " + res.status);
        setStatus({ tone: "ok", text: "contact.form.success" });
        form.reset();
        attempted = false;
      } catch (err) {
        setStatus({ tone: "error", text: "contact.form.error" });
      } finally {
        setLoading(false);
      }
    });

    // Copy buttons (contact details + composed message)
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-copy], [data-copy-message]");
      if (!b) return;
      const text = b.hasAttribute("data-copy-message") ? (lastPayload ? messageText(lastPayload) : "") : b.dataset.copy;
      const original = b.textContent;
      const ok = () => { b.textContent = t("contact.copied"); setTimeout(() => { b.textContent = original; }, 1600); };
      const fallback = () => {
        const ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); ok(); } catch (err) { /* user can select manually */ }
        ta.remove();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
      else fallback();
    });
  }

  /* ---------------- Ambient loops (timecode, reel, calendar) ---------------- */
  function timecode(frames) {
    const f = frames % 24, s = Math.floor(frames / 24);
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
  }
  function startLoops() {
    if (reduce) return;
    const svcCal = $('.svc[data-layout="calendar"]');
    if (!svcCal) return;
    let visible = false;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(svcCal);
    const cells = $$(".cal-grid .c", svcCal);
    setInterval(() => {
      if (!visible || document.hidden) return;
      const on = cells.filter((x) => x.classList.contains("a"));
      if (on.length) on[0].classList.remove("a");
      const pool = cells.filter((x) => x.classList.contains("p") && !x.classList.contains("a"));
      pool[Math.floor(Math.random() * pool.length)].classList.add("a");
    }, 1500);
  }

  /* ---------------- Hero phone: reels player ----------------
     Tap right = next, tap left = previous, swipe up/down like Reels,
     arrow keys when focused, press-and-hold to pause. Videos come from
     SITE_CONFIG.media.reels; until then labelled sample frames are used. */
  const reels = { list: [], i: 0, t: 0, dur: 5000, paused: false, held: false, visible: true, raf: 0, last: 0 };
  function reelItems() {
    const real = (CFG.media.reels || []).filter((r) => r && r.src);
    if (real.length) return real.map((r) => ({ src: r.src, poster: r.poster, caption: r.caption, sample: false }));
    return C.sampleReels.map((r) => ({ scene: r.scene, caption: r.caption, sample: true }));
  }
  function buildPhone() {
    const track = $("#reels-track");
    if (!track) return;
    reels.list = reelItems();
    track.innerHTML = reels.list.map((r, k) => `<div class="reel-slide" style="top:${k * 100}%" aria-hidden="${k !== 0}">${
      r.src ? `<video muted playsinline loop preload="${k < 2 ? "auto" : "metadata"}" ${r.poster ? `poster="${esc(r.poster)}"` : ""} src="${esc(r.src)}"></video>` : window.SCENES.render(r.scene)
    }</div>`).join("");
    $("#reels-bars").innerHTML = reels.list.map(() => "<i><b></b></i>").join("");
    const ig = (CFG.social || []).find((x) => /instagram/i.test(x.url));
    ["#reel-who", "#reel-ig"].forEach((sel) => { const a = $(sel); if (ig) a.href = ig.url; else a.removeAttribute("href"); });
    $("#reel-ig").hidden = !ig;
    if (ig) $("#reel-handle").textContent = ig.handle || "@feratskdijital";
    $("#reel-sound").hidden = !reels.list.some((r) => r.src);
    bindPhone();
    goReel(0, true);
    new IntersectionObserver(([en]) => { reels.visible = en.isIntersecting; syncPlayback(); }).observe($("#phone"));
    document.addEventListener("visibilitychange", syncPlayback);
    reels.last = performance.now();
    reels.raf = requestAnimationFrame(tickReels);
  }
  function renderReelText() {
    const r = reels.list[reels.i];
    if (!r) return;
    $("#reel-cap").textContent = pick(r.caption) || "";
    $("#reel-tag").hidden = !r.sample;
  }
  function goReel(n, instant) {
    const len = reels.list.length;
    if (!len) return;
    reels.i = (n + len) % len;
    reels.t = 0;
    const track = $("#reels-track");
    if (instant) track.classList.add("dragging");
    track.style.transform = `translateY(${-reels.i * 100}%)`;
    if (instant) { void track.offsetWidth; track.classList.remove("dragging"); }
    $$(".reel-slide", track).forEach((sl, k) => {
      sl.classList.toggle("on", k === reels.i);
      sl.setAttribute("aria-hidden", String(k !== reels.i));
      const v = $("video", sl);
      if (v && k !== reels.i) { v.pause(); v.currentTime = 0; }
    });
    $$("#reels-bars i").forEach((b, k) => { b.classList.toggle("done", k < reels.i); $("b", b).style.transform = k < reels.i ? "scaleX(1)" : "scaleX(0)"; });
    renderReelText();
    syncPlayback();
  }
  function currentVideo() { const sl = $$(".reel-slide")[reels.i]; return sl ? $("video", sl) : null; }
  function syncPlayback() {
    const v = currentVideo();
    const run = reels.visible && !document.hidden && !reels.held && !reels.paused;
    if (v) { if (run) v.play().catch(() => {}); else v.pause(); }
    $("#phone").classList.toggle("paused", reels.paused);
  }
  function tickReels(now) {
    const dt = now - reels.last;
    reels.last = now;
    const running = reels.visible && !document.hidden && !reels.held && !reels.paused && !reduce;
    if (running && reels.list.length) {
      const v = currentVideo();
      let p;
      if (v && v.duration && isFinite(v.duration)) {
        p = v.currentTime / v.duration;
        if (v.ended || p > 0.985) { goReel(reels.i + 1); p = 0; }
      } else {
        reels.t += dt;
        p = reels.t / reels.dur;
        if (p >= 1) { goReel(reels.i + 1); p = 0; }
      }
      const bar = $$("#reels-bars i b")[reels.i];
      if (bar) bar.style.transform = `scaleX(${Math.min(1, p)})`;
    }
    reels.raf = requestAnimationFrame(tickReels);
  }
  function bindPhone() {
    const phone = $("#phone");
    const track = $("#reels-track");
    let start = null, holdTimer = 0, moved = false;
    phone.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".reel-btn, .reel-who")) return;
      start = { x: e.clientX, y: e.clientY, h: phone.querySelector(".screen").clientHeight };
      moved = false;
      phone.setPointerCapture(e.pointerId);
      holdTimer = setTimeout(() => { reels.held = true; syncPlayback(); }, 260);
    });
    phone.addEventListener("pointermove", (e) => {
      if (!start) return;
      const dy = e.clientY - start.y;
      if (Math.abs(dy) > 8) { moved = true; clearTimeout(holdTimer); }
      if (moved) {
        track.classList.add("dragging");
        track.style.transform = `translateY(calc(${-reels.i * 100}% + ${dy}px))`;
      }
    });
    const end = (e) => {
      if (!start) return;
      clearTimeout(holdTimer);
      const dy = e.clientY - start.y;
      const wasHeld = reels.held;
      reels.held = false;
      track.classList.remove("dragging");
      if (moved && Math.abs(dy) > start.h * 0.12) goReel(reels.i + (dy < 0 ? 1 : -1));
      else if (moved) goReel(reels.i);
      else if (!wasHeld) {
        const r = phone.getBoundingClientRect();
        goReel(reels.i + (e.clientX - r.left < r.width * 0.35 ? -1 : 1));
      } else syncPlayback();
      start = null;
    };
    phone.addEventListener("pointerup", end);
    phone.addEventListener("pointercancel", (e) => { if (start) { start = null; reels.held = false; track.classList.remove("dragging"); goReel(reels.i); } });
    phone.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); goReel(reels.i + 1); }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); goReel(reels.i - 1); }
      if (e.key === " ") { e.preventDefault(); reels.paused = !reels.paused; syncPlayback(); }
    });
    $("#reel-up").addEventListener("click", () => goReel(reels.i - 1));
    $("#reel-down").addEventListener("click", () => goReel(reels.i + 1));
    $("#reel-sound").addEventListener("click", () => {
      const vids = $$(".reel-slide video");
      const unmute = vids.some((v) => v.muted);
      vids.forEach((v) => { v.muted = !unmute; });
      const v = currentVideo();
      if (v && unmute) v.play().catch(() => {});
      $("#snd-x").style.display = unmute ? "none" : "";
    });
  }

  /* ---------------- Motion ---------------- */
  function revealHero() {
    $$(".hero .reveal-lines, .hero .rv").forEach((el) => el.classList.add("is-in"));
  }
  function initMotion() {
    const gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);

    // Reveals for everything outside the hero
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    window.__revealObserver = io;
    $$(".reveal-lines, .rv, .svc").forEach((el) => { if (!el.closest(".hero")) io.observe(el); });

    requestAnimationFrame(revealHero);

    // Hero parallax and exit
    gsap.fromTo("#phone", { y: 40, rotate: -2 }, { y: 0, rotate: 0, ease: "none", scrollTrigger: { trigger: ".phone-stage", start: "top bottom", end: "top 30%", scrub: true } });
    gsap.to(".hero-inner", { y: -40, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "20% top", end: "60% top", scrub: true } });

    // Manifesto word-by-word light-up
    manifestoST = ST.create({
      trigger: "#manifesto-text",
      start: "top 82%",
      end: "bottom 48%",
      onUpdate: (self) => lightWords(self.progress)
    });

    // Process rail
    const steps = $$(".step");
    const railHost = $("#steps");
    ST.create({
      trigger: railHost,
      start: "top 75%",
      end: "bottom 60%",
      onUpdate: (self) => {
        railHost.style.setProperty("--p", self.progress.toFixed(3));
        steps.forEach((s, i) => s.classList.toggle("on", self.progress >= i / steps.length + 0.02));
      }
    });

    // Media parallax, desktop only
    const mm = gsap.matchMedia();
    mm.add("(min-width: 761px)", () => {
      $$(".work .par").forEach((par) => {
        gsap.fromTo(par, { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: par.closest(".work"), start: "top bottom", end: "bottom top", scrub: true } });
      });
    });

    // Cursor label on work cards (fine pointers only)
    if (finePointer && $("#cursor")) {
      const cur = $("#cursor");
      const xTo = gsap.quickTo(cur, "x", { duration: 0.45, ease: "power3.out" });
      const yTo = gsap.quickTo(cur, "y", { duration: 0.45, ease: "power3.out" });
      window.addEventListener("pointermove", (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
      $("#works").addEventListener("pointerover", (e) => { cur.classList.toggle("on", !!e.target.closest(".work-media")); });
      $("#works").addEventListener("pointerleave", () => cur.classList.remove("on"));
    }
  }

  /* ---------------- Init ---------------- */
  function init() {
    if (motion) document.documentElement.classList.add("motion");
    buildServices();
    buildWorks();
    buildTrust();
    buildProcess();
    applyText();
    bindNav();
    bindWork();
    const bg = $("#blog-grid");
    if (bg) bg.addEventListener("click", (e) => { const b = e.target.closest("[data-post]"); if (b) openPost(+b.dataset.post); });
    bindForm();
    startLoops();
    buildPhone();
    if (motion) initMotion();
    else {
      $$(".step").forEach((s) => s.classList.add("on"));
      $$(".svc").forEach((s) => s.classList.add("is-in"));
    }

    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { fitAll(); if (hasGsap) window.ScrollTrigger.refresh(); }, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fitAll(); if (hasGsap) window.ScrollTrigger.refresh(); });

    // Deep links: #services, #work, #work-<project-id> …
    const h = (location.hash || "").slice(1);
    if (h) {
      if (h.startsWith("work-")) { const id = h.slice(5); setTimeout(() => openProject(id), 300); }
      else if (h.startsWith("blog-")) { const i = BLOG.findIndex((p) => p.slug === h.slice(5)); if (i > -1) setTimeout(() => openPost(i), 300); }
      else { const el = document.getElementById(h); if (el) setTimeout(() => scrollToEl(el), 300); }
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
