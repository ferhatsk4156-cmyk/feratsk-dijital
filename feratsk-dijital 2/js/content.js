/* ==========================================================================
   FERATSK DİJİTAL — SECTION CONTENT
   Services, portfolio, approach pillars and process steps.
   Add a project by appending an object to PROJECTS; the grid, filters,
   counters and detail dialog are generated from this list.
   ========================================================================== */
window.CONTENT = {
  services: [
    {
      id: "strategy",
      no: "01",
      layout: "calendar",
      title: { tr: "DİJİTAL STRATEJİ", en: "DIGITAL STRATEGY" },
      text: {
        tr: "Sosyal medya yönetimi, dijital marka konumlandırması, içerik stratejisi ve yaratıcı iletişim.",
        en: "Social media management, digital brand positioning, content strategy, and creative communication."
      },
      tags: {
        tr: ["Sosyal medya yönetimi", "İçerik takvimi", "Marka konumlandırma", "Reklam kreatif stratejisi"],
        en: ["Social media management", "Content calendar", "Brand positioning", "Ad creative strategy"]
      }
    },
    {
      id: "film",
      no: "02",
      layout: "frame",
      scene: "light",
      title: { tr: "FİLM & PRODÜKSİYON", en: "FILM & PRODUCTION" },
      text: {
        tr: "Reklam filmleri, profesyonel çekimler, marka filmleri, kurumsal tanıtımlar ve video prodüksiyonu.",
        en: "Commercial films, professional video shoots, brand films, corporate productions, and cinematic storytelling."
      },
      tags: {
        tr: ["Reklam filmi", "Marka filmi", "Kurumsal tanıtım", "Kurgu & renk"],
        en: ["Commercials", "Brand films", "Corporate films", "Edit & grade"]
      }
    },
    {
      id: "realestate",
      no: "03",
      layout: "blueprint",
      title: { tr: "GAYRİMENKUL & İNŞAAT", en: "REAL ESTATE & CONSTRUCTION" },
      text: {
        tr: "Gayrimenkul ve inşaat projeleri için tanıtım filmleri, drone çekimleri ve yapım aşamalarını anlatan 3D animasyonlar.",
        en: "Launch films, drone cinematography and 3D animations that show every construction stage for real estate and building projects."
      },
      tags: {
        tr: ["3D yapım animasyonu", "Proje tanıtım filmi", "Drone çekimi", "Villa & konut"],
        en: ["3D construction animation", "Development films", "Drone cinematography", "Villas & residences"]
      }
    },
    {
      id: "content",
      no: "04",
      layout: "reels",
      title: { tr: "YARATICI İÇERİK", en: "CREATIVE CONTENT" },
      text: {
        tr: "Reels, kısa video içerikleri, sosyal medya tasarımları, reklam kreatifleri ve kampanya görselleri.",
        en: "Reels, short-form video production, social media design, advertising creatives, and campaign visuals."
      },
      tags: {
        tr: ["Reels & kısa video", "Restoran içerikleri", "Kampanya görselleri", "Grafik tasarım"],
        en: ["Reels & short-form", "Restaurant content", "Campaign visuals", "Graphic design"]
      }
    },
    {
      id: "ai",
      no: "05",
      layout: "ai",
      title: { tr: "YAPAY ZEKA İLE İÇERİK", en: "AI-POWERED CONTENT" },
      text: {
        tr: "Yapay zeka destekli görsel, video ve kampanya üretimi. Hızlı konsept denemeleri, sahne genişletme ve kişiselleştirilmiş reklam varyasyonları.",
        en: "AI-assisted visuals, video and campaign production. Fast concept tests, scene extension and personalised ad variations."
      },
      tags: {
        tr: ["AI görsel üretimi", "AI video", "Konsept & moodboard", "Reklam varyasyonları"],
        en: ["AI image generation", "AI video", "Concepts & moodboards", "Ad variations"]
      }
    },
    {
      id: "wedding",
      no: "06",
      layout: "wedding",
      title: { tr: "DÜĞÜN & ÖZEL GÜN", en: "WEDDINGS & EVENTS" },
      text: {
        tr: "Düğün, nişan ve dış çekimler için sinematik film ve fotoğraf. O günü belgesel samimiyetiyle, film kalitesinde anlatırız.",
        en: "Cinematic films and photography for weddings, engagements and pre-wedding shoots. Documentary warmth, film quality."
      },
      tags: {
        tr: ["Düğün filmi", "Dış çekim", "Drone ile düğün", "Kısa klip & reels"],
        en: ["Wedding film", "Pre-wedding shoot", "Drone wedding shots", "Highlight reels"]
      }
    }
  ],

  categories: [
    { id: "realestate", tr: "Gayrimenkul Filmleri", en: "Real Estate Films" },
    { id: "architecture", tr: "Mimari", en: "Architecture" },
    { id: "commercial", tr: "Reklam Prodüksiyonu", en: "Commercial Production" },
    { id: "social", tr: "Sosyal Medya Kampanyaları", en: "Social Media Campaigns" },
    { id: "drone", tr: "Drone Çekimleri", en: "Drone Cinematography" },
    { id: "brand", tr: "Marka İçerikleri", en: "Brand Content" },
    { id: "ai", tr: "Yapay Zeka", en: "AI Content" },
    { id: "wedding", tr: "Düğün Çekimleri", en: "Wedding Films" }
  ],

  /* sample: true marks placeholder work. Real projects: set sample:false,
     add cover: { image: "media/x.jpg" } or { video: "media/x.mp4", poster: "…" },
     and optionally year: 2026. */
  projects: [
    {
      id: "villa-3d",
      sample: true,
      category: "realestate",
      scene: "villa",
      title: { tr: "Villa Projesi 3D Yapım Animasyonu", en: "Villa 3D Construction Animation" },
      summary: {
        tr: "Temelden anahtar teslime kadar her aşamayı gösteren, sonunda kamerayla villanın içine giren 3D animasyon formatı. Satış ofisi ve ön satış kampanyaları için.",
        en: "A 3D animation format that shows every stage from foundation to handover and ends with the camera moving inside the villa. Built for sales offices and off-plan campaigns."
      },
      format: { tr: "3D animasyon · 16:9 ve 9:16", en: "3D animation · 16:9 and 9:16" },
      deliverables: {
        tr: ["Yapım aşamaları animasyonu", "Dıştan içe kamera geçişi", "İç mekân sahneleri", "Sosyal medya kesitleri"],
        en: ["Construction-stage animation", "Exterior-to-interior camera move", "Interior scenes", "Social cut-downs"]
      }
    },
    {
      id: "konut-projesi",
      sample: true,
      category: "realestate",
      scene: "skyline",
      title: { tr: "Konut Projesi Tanıtım Filmi", en: "Residential Development Film" },
      summary: {
        tr: "Bir konut projesinin yaşam alanlarını, çevresini ve mimari karakterini tek bir sinematik anlatıda birleştiren tanıtım filmi formatı.",
        en: "A launch film format that brings a residential development's living spaces, surroundings and architectural character into one cinematic story."
      },
      format: { tr: "16:9 ana film · 9:16 sosyal medya kesitleri", en: "16:9 hero film · 9:16 social cut-downs" },
      deliverables: {
        tr: ["90 sn ana tanıtım filmi", "Drone açılış planları", "Satış ofisi ekran versiyonu", "Reels kesitleri"],
        en: ["90-second hero film", "Drone opening shots", "Sales-office screen version", "Reels cut-downs"]
      }
    },
    {
      id: "mimari-detay",
      sample: true,
      category: "architecture",
      scene: "arch",
      title: { tr: "Mimari Detay Serisi", en: "Architectural Detail Series" },
      summary: {
        tr: "Yapının malzemesini, ışığını ve oranlarını yakın planlarla anlatan; mimarlık ofisleri ve inşaat firmaları için görsel seri.",
        en: "A visual series that reveals a building's materials, light and proportions through close framing, made for architecture practices and builders."
      },
      format: { tr: "Fotoğraf seti · kısa sinemagraf döngüleri", en: "Still series · short cinemagraph loops" },
      deliverables: {
        tr: ["Mimari fotoğraf seti", "Gün ışığı zaman atlamaları", "Portfolyo için düzenlenmiş görseller"],
        en: ["Architectural still set", "Daylight time-lapses", "Portfolio-ready edits"]
      }
    },
    {
      id: "urun-reklami",
      sample: true,
      category: "commercial",
      scene: "studio",
      title: { tr: "Ürün Reklam Filmi", en: "Product Commercial" },
      summary: {
        tr: "Stüdyo ışığı, kontrollü kamera hareketi ve net bir mesajla ürünü kahramanlaştıran reklam filmi formatı.",
        en: "A commercial format that makes the product the hero through studio lighting, controlled camera movement and a clear message."
      },
      format: { tr: "30 sn · 15 sn · 6 sn versiyonlar", en: "30s · 15s · 6s versions" },
      deliverables: {
        tr: ["Senaryo ve storyboard", "Stüdyo çekimi", "Kurgu, renk ve ses tasarımı", "Platform bazlı versiyonlar"],
        en: ["Script and storyboard", "Studio shoot", "Edit, grade and sound design", "Platform-specific versions"]
      }
    },
    {
      id: "restoran-reels",
      sample: true,
      category: "social",
      scene: "plate",
      title: { tr: "Restoran Reels Kampanyası", en: "Restaurant Reels Campaign" },
      summary: {
        tr: "Mutfağın ritmini, tabağın detayını ve mekânın atmosferini kısa videolara dönüştüren aylık içerik kampanyası formatı.",
        en: "A monthly content campaign format that turns the kitchen's rhythm, plate details and venue atmosphere into short-form video."
      },
      format: { tr: "9:16 Reels · 4:5 gönderi tasarımları", en: "9:16 Reels · 4:5 post designs" },
      deliverables: {
        tr: ["Aylık içerik planı", "Reels serisi", "Menü ve kampanya görselleri", "Yayın takvimi"],
        en: ["Monthly content plan", "Reels series", "Menu and campaign visuals", "Publishing calendar"]
      }
    },
    {
      id: "kiyi-drone",
      sample: true,
      category: "drone",
      scene: "coast",
      title: { tr: "Kıyı Şeridi Drone Sekansı", en: "Coastal Drone Sequence" },
      summary: {
        tr: "Konumu, ölçeği ve çevre ilişkisini yukarıdan anlatan; proje ve marka filmlerine eklenebilen havadan çekim sekansı.",
        en: "An aerial sequence that shows location, scale and context from above, ready to cut into development and brand films."
      },
      format: { tr: "4K havadan çekim · tepeden ve yörünge planları", en: "4K aerial · top-down and orbit shots" },
      deliverables: {
        tr: ["Uçuş planı ve izin süreci", "Havadan video ve fotoğraf", "Renk düzenlemesi"],
        en: ["Flight plan and permits", "Aerial video and stills", "Colour grading"]
      }
    },
    {
      id: "marka-hikayesi",
      sample: true,
      category: "brand",
      scene: "light",
      title: { tr: "Marka Hikâyesi Filmi", en: "Brand Story Film" },
      summary: {
        tr: "Markanın neden var olduğunu, kimlere dokunduğunu ve nasıl çalıştığını insan odaklı bir anlatıyla aktaran film formatı.",
        en: "A film format that tells why a brand exists, who it serves and how it works, through a people-first story."
      },
      format: { tr: "2–3 dk ana film · web ve sosyal medya kesitleri", en: "2–3 min hero film · web and social cut-downs" },
      deliverables: {
        tr: ["Röportaj ve hikâye kurgusu", "Belgesel tarzı çekim", "Altyazılı versiyonlar"],
        en: ["Interview and story structure", "Documentary-style shoot", "Subtitled versions"]
      }
    },
    {
      id: "ai-kampanya",
      sample: true,
      category: "ai",
      scene: "ai",
      title: { tr: "Yapay Zeka Destekli Kampanya", en: "AI-Assisted Campaign" },
      summary: {
        tr: "Gerçek ürün çekimleriyle yapay zeka ile üretilmiş arka planları ve sahneleri birleştiren, onlarca reklam varyasyonunu kısa sürede çıkaran kampanya formatı.",
        en: "A campaign format that combines real product shots with AI-generated backgrounds and scenes to produce many ad variations quickly."
      },
      format: { tr: "4:5 · 9:16 · 1:1 görsel ve kısa video", en: "4:5 · 9:16 · 1:1 stills and short video" },
      deliverables: {
        tr: ["Konsept ve moodboard", "AI ile sahne üretimi", "Ürün çekimi ile birleştirme", "A/B test varyasyonları"],
        en: ["Concept and moodboard", "AI scene generation", "Compositing with product shots", "A/B test variations"]
      }
    },
    {
      id: "dugun-filmi",
      sample: true,
      category: "wedding",
      scene: "wedding",
      title: { tr: "Düğün Filmi", en: "Wedding Film" },
      summary: {
        tr: "Hazırlıktan ilk dansa kadar günün duygusunu sinematik bir anlatıyla aktaran düğün filmi formatı; drone planları ve kısa reels klibiyle.",
        en: "A wedding film format that carries the emotion of the day from getting ready to the first dance, with drone shots and a short reels clip."
      },
      format: { tr: "4–6 dk film · 60 sn klip · 9:16 reels", en: "4–6 min film · 60s highlight · 9:16 reels" },
      deliverables: {
        tr: ["Hazırlık ve tören çekimi", "Drone planları", "Kurgu, renk ve müzik", "Sosyal medya klibi"],
        en: ["Getting-ready and ceremony coverage", "Drone shots", "Edit, grade and music", "Social highlight clip"]
      }
    }
  ],

  // Sample reels shown in the hero phone until real videos are added in config.js.
  sampleReels: [
    { scene: "skyline", caption: { tr: "Konut projesi tanıtımı", en: "Residential launch film" } },
    { scene: "villa", caption: { tr: "Villa projesi 3D animasyon", en: "Villa project 3D animation" } },
    { scene: "plate", caption: { tr: "Restoran reels serisi", en: "Restaurant reels series" } },
    { scene: "wedding", caption: { tr: "Düğün filmi", en: "Wedding film" } },
    { scene: "coast", caption: { tr: "Kıyı şeridi drone çekimi", en: "Coastal drone shot" } },
    { scene: "studio", caption: { tr: "Ürün reklam filmi", en: "Product commercial" } },
    { scene: "light", caption: { tr: "Marka hikâyesi", en: "Brand story" } }
  ],

  pillars: [
    {
      code: "STR",
      title: { tr: "Stratejik düşünce", en: "Strategic thinking" },
      text: { tr: "Her içerik bir hedefe hizmet eder. Önce kime, neden ve nerede konuşacağımızı netleştiririz.", en: "Every piece serves a goal. First we settle who we're talking to, why, and where." }
    },
    {
      code: "PRD",
      title: { tr: "Profesyonel prodüksiyon", en: "Professional production" },
      text: { tr: "Planlı set, doğru ekipman, disiplinli kurgu. Sinematik kalite tesadüf değil, süreçtir.", en: "A planned set, the right kit, a disciplined edit. Cinematic quality is a process, not luck." }
    },
    {
      code: "STY",
      title: { tr: "Güçlü görsel anlatım", en: "Strong visual storytelling" },
      text: { tr: "Kadraj, ışık ve ritimle markanın söylemek istediğini göstererek anlatırız.", en: "We show what the brand means through framing, light and rhythm, instead of just saying it." }
    },
    {
      code: "CON",
      title: { tr: "Tutarlı marka iletişimi", en: "Consistent brand communication" },
      text: { tr: "Reklam filminden tek bir story'e kadar markanın sesi ve görünümü aynı kalır.", en: "From a commercial to a single story frame, the brand looks and sounds like itself." }
    },
    {
      code: "E2E",
      title: { tr: "Uçtan uca yaratıcı üretim", en: "End-to-end creative execution" },
      text: { tr: "Fikir, çekim, tasarım ve yayın aynı ekipte buluşur; aradaki kayıplar ortadan kalkar.", en: "Idea, shoot, design and publishing sit with one team, so nothing gets lost in hand-offs." }
    }
  ],

  studioFacts: {
    founder: "Ferhat SK",
    base: { tr: "Kocaeli, Türkiye", en: "Kocaeli, Türkiye" },
    disciplines: { tr: "Strateji · Prodüksiyon · İçerik", en: "Strategy · Production · Content" },
    sectors: {
      tr: "Gayrimenkul, inşaat & mimari, restoran & ağırlama, kurumsal markalar, girişimler",
      en: "Real estate, construction & architecture, restaurants & hospitality, corporate brands, start-ups"
    }
  },

  process: [
    {
      no: "01",
      title: { tr: "KEŞİF", en: "DISCOVER" },
      text: { tr: "Markayı, hedef kitleyi ve ihtiyacı anlarız.", en: "We understand the brand, audience, and business objectives." }
    },
    {
      no: "02",
      title: { tr: "STRATEJİ", en: "STRATEGIZE" },
      text: { tr: "Doğru mesajı, içerik dilini ve yaratıcı yönü belirleriz.", en: "We define the message, creative direction, and content strategy." }
    },
    {
      no: "03",
      title: { tr: "ÜRETİM", en: "CREATE" },
      text: { tr: "Çekim, tasarım, kurgu ve içerik üretimini gerçekleştiririz.", en: "We bring the concept to life through production, design, editing, and content creation." }
    },
    {
      no: "04",
      title: { tr: "TESLİM", en: "DELIVER" },
      text: { tr: "İçerikleri yayına hazır, tutarlı ve profesyonel biçimde teslim ederiz.", en: "We deliver polished, consistent, and publication-ready creative assets." }
    }
  ]
};
