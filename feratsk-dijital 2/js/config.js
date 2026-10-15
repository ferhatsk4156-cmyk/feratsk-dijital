/* ==========================================================================
   FERATSK DİJİTAL — SITE CONFIGURATION
   Every real-world business detail lives here. Nothing below is invented:
   empty values (null) are rendered as clearly marked setup slots, never as
   fake numbers, addresses or profiles. Fill them in and the site updates.
   ========================================================================== */
window.SITE_CONFIG = {
  brand: {
    name: "FERATSK DİJİTAL",
    founder: "Ferhat SK",
    city: { tr: "Kocaeli, Türkiye", en: "Kocaeli, Türkiye" },
    // İzmit / Kocaeli city-centre coordinates, used as a technical detail in the hero.
    coordinates: "40.7654° N · 29.9408° E",
    year: 2026
  },

  contact: {
    // e.g. "905XXXXXXXXX" — international format, digits only. Enables the WhatsApp button.
    whatsapp: "905537104156",
    // e.g. "hello@feratsk.com"
    email: null,
    // e.g. "+90 5XX XXX XX XX" (display format)
    phone: "0553 710 41 56"
  },

  // Add only real, verified profiles. Each item: { label: "Instagram", url: "https://instagram.com/…" }
  social: [
    { label: "Instagram", handle: "@feratskdijital", url: "https://www.instagram.com/feratskdijital/" }
  ],

  form: {
    // POST endpoint that accepts JSON (Formspree, Basin, your own API route, etc.).
    // While null, the form validates input but never claims a message was sent.
    endpoint: null
  },

  media: {
    // Real footage slots. Use optimised MP4/WebM (H.264, ~6–10 Mbps for 1080p) plus a poster frame.
    // While null, the site shows labelled, art-directed placeholder frames instead.
    heroVideo: null,        // { src: "media/hero.mp4", poster: "media/hero.jpg" }
    showreel: null,         // { src: "media/showreel.mp4", poster: "media/showreel.jpg" }
    // Phone reels in the hero. Add vertical (9:16) MP4 files from @feratskdijital:
    // { src: "media/reel-1.mp4", poster: "media/reel-1.jpg", caption: { tr: "…", en: "…" } }
    // While empty, labelled sample frames are shown.
    reels: []
  }
};
