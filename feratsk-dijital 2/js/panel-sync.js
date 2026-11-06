(function () {
  if (window.__FERATSK_EDIT_MODE) return;
  var SUPABASE_URL = "https://slcrkqkxrpurcugxmuma.supabase.co";
  var ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsY3JrcWt4cnB1cmN1Z3htdW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4ODc1NDEsImV4cCI6MjEwOTQ2MzU0MX0.92_pKhx6rE8Ck0f6w_YtwlbcSFarVR-b61nVA4s5wM4";
  var CACHE_KEY = "feratsk.panel.cache.v1";
  var TIMEOUT_MS = 2500;

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

  function boot() {
    loadScripts([
      "js/scenes.js",
      "js/app.js",
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
      "js/villa3d.js"
    ], 0);
  }

  var done = false;
  function finish(docs) {
    if (done) return;
    done = true;
    if (docs) {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(docs)); } catch (e) {}
      apply(docs);
    } else {
      try {
        var cached = localStorage.getItem(CACHE_KEY);
        if (cached) apply(JSON.parse(cached));
      } catch (e) {}
    }
    boot();
  }

  var timer = setTimeout(function () { finish(null); }, TIMEOUT_MS);

  fetch(SUPABASE_URL + "/rest/v1/site_published?select=key,data", {
    headers: { apikey: ANON_KEY, Authorization: "Bearer " + ANON_KEY }
  }).then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
    .then(function (rows) {
      clearTimeout(timer);
      var docs = {};
      rows.forEach(function (r) { docs[r.key] = r.data; });
      finish(docs);
    })
    .catch(function () {
      clearTimeout(timer);
      finish(null);
    });
})();
