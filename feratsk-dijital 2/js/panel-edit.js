(function () {
  if (!window.__FERATSK_EDIT_MODE) return;

  var booted = false;
  var panelOrigin = null;
  try {
    if (document.referrer) panelOrigin = new URL(document.referrer).origin;
  } catch (e) {}

  function post(msg) {
    try { window.parent.postMessage(msg, panelOrigin || "*"); } catch (e) {}
  }

  function merge(target, src) {
    if (src == null) return target;
    if (Array.isArray(src)) return src;
    if (typeof src === "object") {
      target = (target && typeof target === "object" && !Array.isArray(target)) ? target : {};
      for (var k in src) if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = merge(target[k], src[k]);
      return target;
    }
    return src;
  }

  function apply(docs) {
    if (!docs) return;
    if (docs.config) window.SITE_CONFIG = merge(window.SITE_CONFIG, docs.config);
    if (docs.content) window.CONTENT = merge(window.CONTENT, docs.content);
    if (Array.isArray(docs.blog) && docs.blog.length) window.BLOG = docs.blog;
    if (docs.texts && window.I18N) {
      ["tr", "en"].forEach(function (l) {
        if (docs.texts[l]) window.I18N[l] = merge(window.I18N[l], docs.texts[l]);
      });
    }
  }

  function loadScripts(list, i, done) {
    if (i >= list.length) { if (done) done(); return; }
    var s = document.createElement("script");
    s.src = list[i];
    s.onload = function () { loadScripts(list, i + 1, done); };
    s.onerror = function () { loadScripts(list, i + 1, done); };
    document.body.appendChild(s);
  }

  function currentLang() {
    try { return localStorage.getItem("feratsk-lang") === "en" ? "en" : "tr"; } catch (e) { return "tr"; }
  }

  var SECTION_MAP = [
    [".work", "projeler"],
    [".svc", "hizmetler"],
    [".post-card", "blog"],
    [".pillar", "hakkimizda"],
    ["#steps .step", "hakkimizda"],
    [".reel-slide", "medya"]
  ];

  function setupEditClicks() {
    document.addEventListener("click", function (e) {
      var field = e.target.closest("[data-c], [data-i18n]");
      if (field) {
        e.preventDefault();
        e.stopPropagation();
        if (field.hasAttribute("data-c")) {
          post({ type: "feratsk:edit", lang: currentLang(), kind: "content", path: field.getAttribute("data-c") });
        } else {
          post({ type: "feratsk:edit", lang: currentLang(), kind: "text", path: field.getAttribute("data-i18n") });
        }
        return;
      }
      for (var i = 0; i < SECTION_MAP.length; i++) {
        var card = e.target.closest(SECTION_MAP[i][0]);
        if (card) {
          e.preventDefault();
          e.stopPropagation();
          post({ type: "feratsk:section", tab: SECTION_MAP[i][1] });
          return;
        }
      }
    }, true);
  }

  var scrollTimer = null;
  window.addEventListener("scroll", function () {
    if (scrollTimer) return;
    scrollTimer = setTimeout(function () {
      scrollTimer = null;
      post({ type: "feratsk:scroll", y: window.scrollY });
    }, 200);
  }, { passive: true });

  window.addEventListener("message", function (e) {
    if (!e.data || typeof e.data !== "object") return;
    var d = e.data;
    if (d.type !== "feratsk:docs") return;
    if (!panelOrigin) panelOrigin = e.origin;
    apply(d.docs);
    if (d.lang === "tr" || d.lang === "en") {
      try { localStorage.setItem("feratsk-lang", d.lang); } catch (err) {}
    }
    if (booted) return;
    booted = true;
    loadScripts([
      "js/scenes.js",
      "js/app.js",
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
      "js/villa3d.js"
    ], 0, function () {
      if (typeof d.scrollY === "number") window.scrollTo(0, d.scrollY);
      setupEditClicks();
      post({ type: "feratsk:booted" });
    });
  });

  post({ type: "feratsk:ready" });
})();
