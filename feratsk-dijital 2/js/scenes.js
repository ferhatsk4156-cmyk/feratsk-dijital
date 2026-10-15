/* ==========================================================================
   FERATSK DİJİTAL — PLACEHOLDER SCENES
   Art-directed SVG stand-ins for footage that doesn't exist yet. They are
   always labelled as placeholders in the UI. Replace by giving a project a
   real `cover` in content.js or by filling SITE_CONFIG.media.
   ========================================================================== */
(function () {
  let uid = 0;
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  const W = 1600, H = 1000;
  const wrap = (body, defs) =>
    `<svg class="scene-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>${defs}</defs>${body}</svg>`;

  function windows(r, x, y, w, h, cols, rows, litChance, warm) {
    let out = "";
    const cw = w / cols, rh = h / rows;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const lit = r() < litChance;
        const c = lit ? (warm ? (r() < 0.5 ? "#e8b878" : "#f3d6a4") : "#cfe2ff") : "#0c1016";
        const o = lit ? (0.55 + r() * 0.45).toFixed(2) : 0.9;
        out += `<rect x="${(x + i * cw + cw * 0.22).toFixed(1)}" y="${(y + j * rh + rh * 0.25).toFixed(1)}" width="${(cw * 0.56).toFixed(1)}" height="${(rh * 0.5).toFixed(1)}" fill="${c}" opacity="${o}"/>`;
      }
    }
    return out;
  }

  const scenes = {
    dusk(id) {
      const r = rng(7);
      const defs = `
        <linearGradient id="sk${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#07090e"/><stop offset=".45" stop-color="#141b26"/>
          <stop offset=".66" stop-color="#3a3434"/><stop offset=".72" stop-color="#7a5038"/></linearGradient>
        <radialGradient id="sun${id}" cx=".68" cy=".69" r=".35">
          <stop offset="0" stop-color="#ffcf91" stop-opacity=".95"/><stop offset=".12" stop-color="#e3874c" stop-opacity=".55"/>
          <stop offset="1" stop-color="#e3874c" stop-opacity="0"/></radialGradient>
        <linearGradient id="wt${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2a2526"/><stop offset="1" stop-color="#06080b"/></linearGradient>`;
      let b = `<rect width="${W}" height="${H}" fill="url(#sk${id})"/><rect width="${W}" height="${H}" fill="url(#sun${id})"/>`;
      b += `<path d="M0 640 L180 600 L360 625 L560 585 L760 615 L980 590 L1200 612 L1400 596 L1600 620 L1600 720 L0 720Z" fill="#11151c"/>`;
      b += `<path d="M0 690 L240 668 L520 684 L820 662 L1120 682 L1600 664 L1600 720 L0 720Z" fill="#0b0e13"/>`;
      // modern hillside villas, left third
      const blocks = [[90, 600, 210, 95], [260, 560, 170, 140], [450, 618, 150, 80], [610, 585, 120, 115]];
      blocks.forEach(([x, y, w, h]) => {
        b += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#090b0f"/>`;
        b += `<rect x="${x - 14}" y="${y - 8}" width="${w + 28}" height="8" fill="#0d1016"/>`;
        b += windows(r, x + 8, y + 10, w - 16, h - 24, Math.round(w / 34), 2, 0.55, true);
      });
      b += `<rect y="720" width="${W}" height="${H - 720}" fill="url(#wt${id})"/>`;
      for (let i = 0; i < 46; i++) {
        const y = 728 + i * i * 0.13 + r() * 6;
        const x = 1088 - (40 + i * 7) * (0.6 + r() * 0.6);
        const w = (80 + i * 14) * (0.4 + r() * 0.6);
        b += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${(1.4 + i * 0.05).toFixed(1)}" fill="#ffc98a" opacity="${(0.55 - i * 0.011).toFixed(2)}"/>`;
      }
      return wrap(b, defs);
    },

    skyline(id) {
      const r = rng(21);
      const defs = `<linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0a0f18"/><stop offset=".6" stop-color="#1d2a3b"/><stop offset="1" stop-color="#4a4a52"/></linearGradient>
        <radialGradient id="h${id}" cx=".3" cy=".9" r=".6"><stop offset="0" stop-color="#d39a6a" stop-opacity=".35"/><stop offset="1" stop-color="#d39a6a" stop-opacity="0"/></radialGradient>`;
      let b = `<rect width="${W}" height="${H}" fill="url(#g${id})"/><rect width="${W}" height="${H}" fill="url(#h${id})"/>`;
      let x = -20;
      while (x < W) {
        const w = 120 + r() * 140, h = 260 + r() * 520;
        const y = 880 - h;
        b += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="#0a0d12"/>`;
        b += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${(w * 0.08).toFixed(0)}" height="${h.toFixed(0)}" fill="#1a212c" opacity=".7"/>`;
        b += windows(r, x + 10, y + 16, w - 20, h - 30, Math.max(3, Math.round(w / 26)), Math.round(h / 34), 0.32, true);
        x += w + 14 + r() * 30;
      }
      b += `<path d="M1180 140 L1188 140 L1188 520 L1180 520Z M1060 150 L1430 150 L1430 158 L1060 158Z M1184 158 L1300 260" stroke="#151b24" stroke-width="5" fill="#151b24"/>`;
      b += `<rect y="880" width="${W}" height="120" fill="#07090c"/>`;
      return wrap(b, defs);
    },

    arch(id) {
      const defs = `<linearGradient id="c${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#3b3d40"/><stop offset="1" stop-color="#16171a"/></linearGradient>
        <linearGradient id="l${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#f1e6d4" stop-opacity="0"/><stop offset=".5" stop-color="#f1e6d4" stop-opacity=".55"/><stop offset="1" stop-color="#f1e6d4" stop-opacity="0"/></linearGradient>`;
      let b = `<rect width="${W}" height="${H}" fill="#101113"/>`;
      b += `<polygon points="0,0 980,0 620,1000 0,1000" fill="url(#c${id})"/>`;
      b += `<polygon points="980,0 1600,0 1600,1000 620,1000" fill="#1b1c1f"/>`;
      b += `<polygon points="980,0 1060,0 700,1000 620,1000" fill="#56575a"/>`;
      for (let i = 0; i < 9; i++) {
        const y = 80 + i * 105;
        b += `<line x1="0" y1="${y}" x2="${980 - y * 0.36}" y2="${y}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>`;
      }
      b += `<polygon points="1180,180 1600,90 1600,330 1180,360" fill="#0b0b0c"/>`;
      b += `<polygon points="1180,420 1600,400 1600,620 1180,600" fill="#0b0b0c"/>`;
      b += `<polygon points="200,0 420,0 0,700 0,330" fill="url(#l${id})" opacity=".55"/>`;
      return wrap(b, defs);
    },

    studio(id) {
      const defs = `<radialGradient id="bg${id}" cx=".5" cy=".38" r=".7">
        <stop offset="0" stop-color="#2b2c31"/><stop offset="1" stop-color="#08080a"/></radialGradient>
        <linearGradient id="cone${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff6e6" stop-opacity=".22"/><stop offset="1" stop-color="#fff6e6" stop-opacity="0"/></linearGradient>
        <linearGradient id="obj${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#1b1c20"/><stop offset=".28" stop-color="#6b6c72"/><stop offset=".36" stop-color="#d9d9dc"/><stop offset=".46" stop-color="#4b4c51"/><stop offset="1" stop-color="#121216"/></linearGradient>`;
      let b = `<rect width="${W}" height="${H}" fill="url(#bg${id})"/>`;
      b += `<polygon points="690,0 910,0 1120,760 480,760" fill="url(#cone${id})"/>`;
      b += `<ellipse cx="800" cy="760" rx="300" ry="46" fill="#000" opacity=".55"/>`;
      b += `<rect x="560" y="700" width="480" height="300" fill="#141418"/>`;
      b += `<ellipse cx="800" cy="700" rx="240" ry="36" fill="#26272c"/>`;
      b += `<rect x="740" y="380" width="120" height="320" rx="22" fill="url(#obj${id})"/>`;
      b += `<rect x="770" y="330" width="60" height="64" rx="8" fill="#1e1f23"/>`;
      b += `<rect x="740" y="520" width="120" height="70" fill="#0d0d10" opacity=".55"/>`;
      return wrap(b, defs);
    },

    plate(id) {
      const r = rng(5);
      const defs = `<radialGradient id="t${id}" cx=".5" cy=".5" r=".75">
        <stop offset="0" stop-color="#3a2a20"/><stop offset="1" stop-color="#0d0907"/></radialGradient>
        <radialGradient id="p${id}" cx=".45" cy=".42" r=".6">
        <stop offset="0" stop-color="#ece7de"/><stop offset="1" stop-color="#a8a39b"/></radialGradient>`;
      let b = `<rect width="${W}" height="${H}" fill="url(#t${id})"/>`;
      for (let i = 0; i < 28; i++) {
        const y = i * 38 + r() * 10;
        b += `<path d="M0 ${y.toFixed(0)} C 500 ${(y + r() * 30 - 15).toFixed(0)}, 1100 ${(y + r() * 30 - 15).toFixed(0)}, 1600 ${y.toFixed(0)}" stroke="#000" stroke-opacity=".25" stroke-width="2" fill="none"/>`;
      }
      b += `<circle cx="760" cy="500" r="330" fill="#000" opacity=".35"/>`;
      b += `<circle cx="740" cy="480" r="320" fill="url(#p${id})"/>`;
      b += `<circle cx="740" cy="480" r="235" fill="none" stroke="#8d877e" stroke-opacity=".5" stroke-width="3"/>`;
      const food = ["#9b4b2a", "#c2733c", "#5e7a3a", "#d9b36a", "#7c2e22"];
      for (let i = 0; i < 18; i++) {
        const a = r() * Math.PI * 2, d = r() * 120;
        b += `<circle cx="${(740 + Math.cos(a) * d).toFixed(0)}" cy="${(480 + Math.sin(a) * d).toFixed(0)}" r="${(16 + r() * 40).toFixed(0)}" fill="${food[i % food.length]}" opacity=".92"/>`;
      }
      b += `<circle cx="1260" cy="250" r="110" fill="#d8e3e6" opacity=".12" stroke="#d8e3e6" stroke-opacity=".35" stroke-width="4"/>`;
      b += `<rect x="1150" y="560" width="16" height="360" rx="8" fill="#b9b6b0"/><rect x="1200" y="560" width="22" height="360" rx="10" fill="#9d9a94"/>`;
      return wrap(b, defs);
    },

    coast(id) {
      const r = rng(13);
      const defs = `<linearGradient id="s${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0e3a44"/><stop offset="1" stop-color="#04161c"/></linearGradient>`;
      let b = `<rect width="${W}" height="${H}" fill="url(#s${id})"/>`;
      b += `<path d="M560 0 C 620 260, 820 420, 900 620 S 1080 900, 1120 1000 L1600 1000 L1600 0Z" fill="#b39f7c"/>`;
      b += `<path d="M640 0 C 700 260, 900 420, 980 620 S 1160 900, 1200 1000 L1600 1000 L1600 0Z" fill="#3c4a33"/>`;
      for (let i = 0; i < 26; i++) {
        const x = 1000 + (i % 4) * 150 + r() * 40, y = (i >> 2) * 160 + r() * 30;
        const c = ["#4a5a3b", "#56653f", "#33402c", "#6b6a45"][i % 4];
        b += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${(110 + r() * 40).toFixed(0)}" height="${(120 + r() * 40).toFixed(0)}" fill="${c}" transform="rotate(${(-12 + r() * 6).toFixed(1)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
      }
      for (let i = 1; i < 6; i++) {
        b += `<path d="M${560 - i * 26} 0 C ${620 - i * 26} 260, ${820 - i * 26} 420, ${900 - i * 26} 620 S ${1080 - i * 26} 900, ${1120 - i * 26} 1000" stroke="#e6f1ef" stroke-opacity="${(0.42 - i * 0.07).toFixed(2)}" stroke-width="${6 - i}" fill="none"/>`;
      }
      b += `<path d="M300 520 L330 512 L334 528Z" fill="#f2f2ee"/><path d="M296 522 C 220 560, 140 570, 40 640" stroke="#e6f1ef" stroke-opacity=".35" stroke-width="10" fill="none"/>`;
      return wrap(b, defs);
    },

    villa(id) {
      const defs = `<linearGradient id="vs${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2B3A55"/><stop offset=".55" stop-color="#C98B7A"/><stop offset="1" stop-color="#F2C9A8"/></linearGradient>
        <linearGradient id="vg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE3B8"/><stop offset="1" stop-color="#E8A86B"/></linearGradient>
        <linearGradient id="vp${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5FB7C9"/><stop offset="1" stop-color="#9FDCE6"/></linearGradient>`;
      let b = `<rect width="${W}" height="${H}" fill="url(#vs${id})"/>`;
      b += `<path d="M0 700 C 400 660, 900 690, 1600 650 L1600 1000 L0 1000Z" fill="#3E4F3A"/>`;
      b += `<rect x="330" y="470" width="760" height="240" fill="#EDE6DC"/>`;
      b += `<rect x="560" y="300" width="620" height="170" fill="#F5F0E8"/>`;
      b += `<rect x="540" y="288" width="660" height="16" fill="#2D2A28"/><rect x="310" y="460" width="800" height="14" fill="#2D2A28"/>`;
      b += `<rect x="600" y="330" width="420" height="110" fill="url(#vg${id})" opacity=".95"/>`;
      b += `<rect x="560" y="300" width="20" height="170" fill="#8B5E3C"/><rect x="1040" y="330" width="120" height="140" fill="#8B5E3C"/>`;
      b += `<rect x="560" y="500" width="500" height="200" fill="url(#vg${id})"/>`;
      for (let k = 0; k < 6; k++) b += `<rect x="${560 + k * 100}" y="500" width="4" height="200" fill="#2D2A28" opacity=".8"/>`;
      b += `<rect x="360" y="500" width="160" height="210" fill="#D9CFC2"/>`;
      b += `<path d="M700 760 L1400 760 L1460 860 L640 860Z" fill="url(#vp${id})"/>`;
      b += `<path d="M700 760 L1400 760" stroke="#fff" stroke-opacity=".7" stroke-width="4"/>`;
      [[200, 520, 1], [1300, 470, 1.3], [1480, 520, .9]].forEach(([x, y, k]) => {
        b += `<rect x="${x - 6}" y="${y + 120 * k}" width="12" height="${90 * k}" fill="#2E241B"/><ellipse cx="${x}" cy="${y + 90 * k}" rx="${60 * k}" ry="${90 * k}" fill="#2F4A33"/>`;
      });
      return wrap(b, defs);
    },

    ai(id) {
      const r = rng(41);
      const defs = `<radialGradient id="a1${id}" cx=".3" cy=".35" r=".6"><stop offset="0" stop-color="#C7B8FF"/><stop offset="1" stop-color="#C7B8FF" stop-opacity="0"/></radialGradient>
        <radialGradient id="a2${id}" cx=".72" cy=".6" r=".6"><stop offset="0" stop-color="#FFB8A0"/><stop offset="1" stop-color="#FFB8A0" stop-opacity="0"/></radialGradient>
        <radialGradient id="a3${id}" cx=".5" cy=".9" r=".5"><stop offset="0" stop-color="#A8E6CF"/><stop offset="1" stop-color="#A8E6CF" stop-opacity="0"/></radialGradient>`;
      let b = `<rect width="${W}" height="${H}" fill="#F7F4FF"/><rect width="${W}" height="${H}" fill="url(#a1${id})"/><rect width="${W}" height="${H}" fill="url(#a2${id})"/><rect width="${W}" height="${H}" fill="url(#a3${id})"/>`;
      for (let i = 0; i < 16; i++) for (let j = 0; j < 10; j++) {
        const on = r() < 0.18;
        b += `<circle cx="${100 + i * 93}" cy="${80 + j * 93}" r="${on ? 7 : 3}" fill="${on ? "#7A5CFF" : "#9C90C8"}" opacity="${on ? .8 : .35}"/>`;
      }
      b += `<path d="M380 640 C 560 360, 900 760, 1220 420" stroke="#7A5CFF" stroke-width="3" fill="none" opacity=".6"/>`;
      b += `<g transform="translate(800 470)"><path d="M0 -150 L30 -30 L150 0 L30 30 L0 150 L-30 30 L-150 0 L-30 -30Z" fill="#FFFFFF" opacity=".9"/><path d="M0 -150 L30 -30 L150 0 L30 30 L0 150 L-30 30 L-150 0 L-30 -30Z" fill="none" stroke="#FC4306" stroke-width="3" opacity=".7"/></g>`;
      b += `<g transform="translate(1110 260) scale(.4)"><path d="M0 -150 L30 -30 L150 0 L30 30 L0 150 L-30 30 L-150 0 L-30 -30Z" fill="#FFFFFF"/></g>`;
      return wrap(b, defs);
    },

    wedding(id) {
      const r = rng(77);
      const defs = `<linearGradient id="wg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDE7EE"/><stop offset="1" stop-color="#F6D3C4"/></linearGradient>
        <radialGradient id="wl${id}" cx=".5" cy=".3" r=".5"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>`;
      let b = `<rect width="${W}" height="${H}" fill="url(#wg${id})"/><rect width="${W}" height="${H}" fill="url(#wl${id})"/>`;
      for (let i = 0; i < 26; i++) {
        const cx = r() * W, cy = r() * H * .7, rr = 10 + r() * 40;
        b += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rr.toFixed(0)}" fill="#FFFFFF" opacity="${(.15 + r() * .3).toFixed(2)}"/>`;
      }
      b += `<path d="M420 1000 L420 420 C 420 160, 1180 160, 1180 420 L1180 1000" fill="none" stroke="#FFFFFF" stroke-width="26" opacity=".85"/>`;
      for (let i = 0; i < 34; i++) {
        const t = i / 33, a = Math.PI * (1 - t);
        const x = 800 + Math.cos(a) * 380, y = 420 - Math.sin(a) * 250;
        b += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(16 + r() * 14).toFixed(0)}" fill="${["#F7A8B8", "#FFFFFF", "#F4C2A1", "#E8B4D8"][i % 4]}"/>`;
      }
      b += `<path d="M690 1000 C 690 820, 720 700, 760 640 C 740 600, 740 560, 770 540 C 800 520, 830 545, 828 580 C 826 610, 812 630, 800 640 C 830 700, 850 820, 860 1000Z" fill="#3A2E33"/>`;
      b += `<path d="M830 1000 C 820 860, 840 720, 880 650 C 860 610, 865 565, 895 552 C 925 540, 950 570, 945 605 C 940 630, 925 645, 915 652 C 960 720, 1020 860, 1040 1000Z" fill="#FFFFFF"/>`;
      return wrap(b, defs);
    },

    light(id) {
      const r = rng(31);
      const defs = `<linearGradient id="f${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#7fb2ff" stop-opacity="0"/><stop offset=".5" stop-color="#bcd6ff" stop-opacity=".85"/><stop offset="1" stop-color="#7fb2ff" stop-opacity="0"/></linearGradient>
        <radialGradient id="k${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#9cc0ff" stop-opacity="0"/></radialGradient>
        <radialGradient id="w${id}" cx=".62" cy=".55" r=".5"><stop offset="0" stop-color="#35281f"/><stop offset="1" stop-color="#08080a"/></radialGradient>`;
      let b = `<rect width="${W}" height="${H}" fill="url(#w${id})"/>`;
      for (let i = 0; i < 22; i++) {
        const cx = r() * W, cy = r() * H, rr = 20 + r() * 70;
        b += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rr.toFixed(0)}" fill="${r() < 0.5 ? "#e0a46a" : "#8aa8d8"}" opacity="${(0.05 + r() * 0.12).toFixed(2)}"/>`;
      }
      b += `<path d="M560 1000 C 560 760, 640 640, 760 600 C 700 560, 690 470, 740 420 C 800 360, 900 380, 920 460 C 940 540, 900 590, 870 610 C 1000 650, 1060 780, 1060 1000Z" fill="#050506"/>`;
      b += `<rect x="0" y="452" width="${W}" height="14" fill="url(#f${id})"/>`;
      b += `<rect x="200" y="456" width="1200" height="5" fill="url(#f${id})"/>`;
      b += `<ellipse cx="930" cy="459" rx="60" ry="60" fill="url(#k${id})"/>`;
      return wrap(b, defs);
    }
  };

  window.SCENES = {
    render(kind) {
      uid += 1;
      return (scenes[kind] || scenes.dusk)(uid);
    },
    kinds: Object.keys(scenes)
  };
})();
