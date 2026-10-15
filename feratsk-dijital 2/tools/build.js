/* ==========================================================================
   FERATSK DİJİTAL — BUILD
   Netlify runs this on every deploy (see netlify.toml). It reads what the
   admin panel saves (data/*.json, content/blog/*.json) and writes:
     js/cms-data.js            → applied on top of the site defaults
     blog/<slug>.html, blog/en/<slug>.html, blog/index.html, blog/en/index.html
     sitemap.xml, robots.txt
   No npm packages needed. Run locally with: node tools/build.js
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const SITE_URL = process.env.SITE_URL || "https://feratskdijital.com";
const root = path.join(__dirname, "..");
const read = (rel, fallback) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); } catch (e) { return fallback; }
};
const out = (rel, text) => {
  const f = path.join(root, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, text);
};
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const slugify = (s) => String(s || "").toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
  .normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "proje";
const media = (p) => (p ? (p.startsWith("http") || p.startsWith("/") ? p : "/" + p) : "");

/* Small Markdown → HTML for blog bodies: ## / ### headings, - lists, paragraphs,
   **bold**, *italic*, [links](url). Text is escaped first, so no raw HTML gets in. */
function markdown(src) {
  const inline = (t) => esc(t)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, '<a href="$2">$1</a>');
  const html = [];
  let para = [], list = [];
  const flushP = () => { if (para.length) { html.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
  const flushL = () => { if (list.length) { html.push(`<ul>${list.map((l) => `<li>${inline(l)}</li>`).join("")}</ul>`); list = []; } };
  String(src || "").replace(/\r/g, "").split("\n").forEach((line) => {
    const l = line.trim();
    if (!l) { flushP(); return; }
    let m;
    if ((m = l.match(/^(#{2,3})\s+(.*)$/))) { flushP(); flushL(); html.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); return; }
    if ((m = l.match(/^[-*]\s+(.*)$/))) { flushP(); list.push(m[1]); return; }
    flushL(); para.push(l);
  });
  flushP(); flushL();
  return html.join("\n");
}

/* ---------- Read admin data ---------- */
const settings = read("data/settings.json", {});
const reels = (read("data/reels.json", { reels: [] }).reels || []).filter((r) => r && r.src);
const projects = (read("data/projects.json", { projects: [] }).projects || []).filter((p) => p && p.title_tr);
const blogDir = path.join(root, "content/blog");
const posts = (fs.existsSync(blogDir) ? fs.readdirSync(blogDir) : [])
  .filter((f) => f.endsWith(".json"))
  .map((f) => {
    const p = read(`content/blog/${f}`, null);
    if (!p || !p.title_tr) return null;
    const d = p.date ? String(p.date).slice(0, 10) : new Date().toISOString().slice(0, 10);
    const words = String(p.body_tr || "").split(/\s+/).length;
    return {
      slug: f.replace(/\.json$/, ""),
      date: d,
      minutes: Number(p.minutes) || Math.max(2, Math.round(words / 200)),
      service: p.service || "",
      tone: p.tone || "peach",
      category: { tr: p.category_tr || "Blog", en: p.category_en || p.category_tr || "Blog" },
      title: { tr: p.title_tr, en: p.title_en || p.title_tr },
      excerpt: { tr: p.excerpt_tr || "", en: p.excerpt_en || p.excerpt_tr || "" },
      body: { tr: markdown(p.body_tr), en: markdown(p.body_en || p.body_tr) }
    };
  })
  .filter(Boolean)
  .sort((a, b) => (a.date === b.date ? (a.slug < b.slug ? -1 : 1) : a.date < b.date ? 1 : -1));

/* ---------- js/cms-data.js ---------- */
const digits = String(settings.whatsapp || "").replace(/\D/g, "");
const ig = String(settings.instagram || "").trim();
const igHandle = ig ? "@" + ig.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/[/?#].*$/, "") : "";
const cms = {
  contact: {
    whatsapp: digits ? (digits.length === 10 ? "90" + digits : digits.startsWith("0") ? "9" + digits : digits) : null,
    phone: settings.phone || null,
    email: settings.email || null
  },
  social: ig ? [{ label: "Instagram", handle: igHandle, url: ig }] : [],
  formEndpoint: settings.formEndpoint || null,
  reels: reels.map((r) => ({ src: media(r.src), poster: media(r.poster) || undefined, caption: { tr: r.caption_tr || "", en: r.caption_en || r.caption_tr || "" } })),
  projects: projects.map((p) => {
    const cover = p.cover_video ? { video: media(p.cover_video), poster: media(p.cover_image) || undefined }
      : p.cover_image ? { image: media(p.cover_image) } : undefined;
    return {
      id: p.id ? slugify(p.id) : slugify(p.title_tr),
      sample: !!p.sample,
      category: p.category || "brand",
      scene: p.scene || "light",
      cover,
      year: p.year || undefined,
      title: { tr: p.title_tr, en: p.title_en || p.title_tr },
      summary: { tr: p.summary_tr || "", en: p.summary_en || p.summary_tr || "" },
      format: { tr: p.format_tr || "", en: p.format_en || p.format_tr || "" },
      deliverables: { tr: p.deliverables_tr || [], en: (p.deliverables_en && p.deliverables_en.length ? p.deliverables_en : p.deliverables_tr) || [] }
    };
  }),
  blog: posts
};
out("js/cms-data.js", `/* AUTO-GENERATED by tools/build.js from the admin panel data. Do not edit by hand. */
(function () {
  var D = ${JSON.stringify(cms)};
  var C = window.SITE_CONFIG, K = window.CONTENT;
  if (C) {
    C.contact.whatsapp = D.contact.whatsapp; C.contact.phone = D.contact.phone; C.contact.email = D.contact.email;
    C.social = D.social; C.form.endpoint = D.formEndpoint; C.media.reels = D.reels;
  }
  if (K && D.projects.length) K.projects = D.projects;
  if (D.blog.length) window.BLOG = D.blog;
})();
`);

/* ---------- Blog SEO pages ---------- */
const fmt = (d, l) => new Date(d + "T12:00:00").toLocaleDateString(l === "tr" ? "tr-TR" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
const wa = cms.contact.whatsapp ? `https://wa.me/${cms.contact.whatsapp}` : "";
const css = `:root{--ink:#1D1D1F;--ink2:#6E6E73;--o:#D93800;--bg:#FFEDE4}*{box-sizing:border-box}body{margin:0;font:17px/1.7 Inter,-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;color:var(--ink);background:#fff;-webkit-font-smoothing:antialiased}
header{position:sticky;top:0;background:rgba(255,255,255,.85);backdrop-filter:blur(16px);border-bottom:1px solid #eee}header .w{display:flex;justify-content:space-between;align-items:center;height:68px}
.w{max-width:760px;margin:0 auto;padding:0 max(16px,env(safe-area-inset-left,0px))}a{color:var(--o)}.brand{display:flex;gap:10px;align-items:center;color:var(--ink);text-decoration:none;font-weight:800;letter-spacing:.02em}.brand img{height:36px}
.hero{background:linear-gradient(180deg,var(--bg),#fff);padding:56px 0 24px}.cat{color:var(--o);font-weight:600;font-size:14px}h1{font-size:clamp(2rem,5vw,3rem);line-height:1.1;letter-spacing:-.03em;margin:10px 0}
.lead{font-size:1.2rem;color:var(--ink2)}.meta{font-size:13px;color:#86868B}article h2{font-size:1.45rem;letter-spacing:-.02em;margin:34px 0 8px;line-height:1.25}li::marker{color:var(--o)}
.cta{display:inline-block;margin:36px 0 64px;background:var(--o);color:#fff;padding:14px 24px;border-radius:999px;text-decoration:none;font-weight:600}
.list a{display:block;padding:22px 0;border-bottom:1px solid #eee;text-decoration:none;color:var(--ink)}.list h2{margin:4px 0;font-size:1.3rem}.list p{margin:0;color:var(--ink2)}footer{border-top:1px solid #eee;padding:24px 0 40px;font-size:13px;color:var(--ink2)}`;
function page({ lang, title, desc, url, alt, body, jsonld }) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}"><link rel="icon" href="/assets/logo-mark-orange.png">
${alt ? `<link rel="alternate" hreflang="tr" href="${alt.tr}"><link rel="alternate" hreflang="en" href="${alt.en}">` : ""}
<meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${SITE_URL}/assets/logo-lockup-orange.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"><style>${css}</style>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ""}</head><body>
<header><div class="w"><a class="brand" href="/"><img src="/assets/logo-mark-orange.png" alt="">FERATSK DİJİTAL</a><a href="/${lang === "en" ? "blog/en/" : "blog/"}">Blog</a></div></header>
${body}<footer><div class="w">© ${new Date().getFullYear()} FERATSK DİJİTAL · Kocaeli, Türkiye${wa ? ` · <a href="${wa}">WhatsApp</a>` : ""}${ig ? ` · <a href="${esc(ig)}">Instagram</a>` : ""}</div></footer></body></html>`;
}
// clear old generated pages so deleted posts disappear
for (const dir of ["blog", "blog/en"]) {
  const d = path.join(root, dir);
  if (fs.existsSync(d)) fs.readdirSync(d).filter((f) => f.endsWith(".html")).forEach((f) => fs.unlinkSync(path.join(d, f)));
}
const urls = [`${SITE_URL}/`];
for (const lang of ["tr", "en"]) {
  const base = lang === "tr" ? "blog/" : "blog/en/";
  for (const p of posts) {
    const url = `${SITE_URL}/${base}${p.slug}.html`;
    urls.push(url);
    out(`${base}${p.slug}.html`, page({
      lang, url, title: `${p.title[lang]} | FERATSK DİJİTAL`, desc: p.excerpt[lang],
      alt: { tr: `${SITE_URL}/blog/${p.slug}.html`, en: `${SITE_URL}/blog/en/${p.slug}.html` },
      jsonld: { "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title[lang], description: p.excerpt[lang], datePublished: p.date, inLanguage: lang, author: { "@type": "Organization", name: "FERATSK DİJİTAL" }, publisher: { "@type": "Organization", name: "FERATSK DİJİTAL" }, mainEntityOfPage: url },
      body: `<div class="hero"><div class="w"><span class="cat">${esc(p.category[lang])}</span><h1>${esc(p.title[lang])}</h1><p class="lead">${esc(p.excerpt[lang])}</p><p class="meta">FERATSK DİJİTAL · ${fmt(p.date, lang)} · ${p.minutes} ${lang === "tr" ? "dk okuma" : "min read"}</p></div></div>
<article class="w">${p.body[lang]}<a class="cta" href="/#contact">${lang === "tr" ? "Projeniz için teklif alın" : "Get a quote for your project"}</a></article>`
    }));
  }
  urls.push(`${SITE_URL}/${base}`);
  out(`${base}index.html`, page({
    lang, url: `${SITE_URL}/${base}`, title: "Blog | FERATSK DİJİTAL",
    desc: lang === "tr" ? "Gayrimenkul, prodüksiyon, sosyal medya, yapay zeka ve düğün çekimi üzerine rehberler." : "Guides on real estate, production, social media, AI and wedding films.",
    body: `<div class="hero"><div class="w"><h1>Blog</h1></div></div><div class="w list">${posts.map((p) => `<a href="/${base}${p.slug}.html"><span class="cat">${esc(p.category[lang])}</span><h2>${esc(p.title[lang])}</h2><p>${esc(p.excerpt[lang])}</p></a>`).join("")}</div>`
  }));
}
out("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`);
out("robots.txt", `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`Build OK: ${projects.length} projects, ${reels.length} reels, ${posts.length} posts`);
