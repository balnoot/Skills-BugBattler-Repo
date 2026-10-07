// mango-banner.js
// Standalone ANSI truecolor — geen packages nodig.
// 25x20 mango + titel.
//geen ai chat trust

const RESET = "\x1b[0m";
const FG = (r, g, b, ch = "█") =>
  `\x1b[38;2;${r};${g};${b}m${ch}${RESET}`;

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mix(a, b, t) {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t))
  ];
}

// Foto-achtige mango gradient
const GRADIENT = [
  [0.00, [190, 18, 34]],
  [0.18, [225, 35, 42]],
  [0.38, [245, 65, 35]],
  [0.55, [255, 112, 28]],
  [0.72, [255, 160, 32]],
  [1.00, [255, 211, 63]]
];

function gradient(t) {
  t = clamp(t);

  for (let i = 1; i < GRADIENT.length; i++) {
    if (t <= GRADIENT[i][0]) {
      const [p0, c0] = GRADIENT[i - 1];
      const [p1, c1] = GRADIENT[i];

      return mix(c0, c1, (t - p0) / (p1 - p0));
    }
  }

  return GRADIENT[GRADIENT.length - 1][1];
}


// ------------------------------------------------------------
// MANGO
// ------------------------------------------------------------

function mangoMask(x, y) {
  const cx = 0.455;
  const cy = 0.53;

  const dx = x - cx;
  const dy = y - cy;

  // Lager gemaakt zodat de mango minder hoog/uitgerekt is
  const rx = 0.405;
  const ry = 0.34;

  let inside =
    (dx * dx) / (rx * rx) +
    (dy * dy) / (ry * ry) <= 1;

  if (!inside) return false;

  // Bovenkant iets platter
  if (y < 0.20 && x > 0.63) return false;

  // Linksonder iets voller
  if (y > 0.79 && x > 0.61) return false;

  // Rechterkant wordt afgesneden door blad
  if (x > 0.69 && y > 0.38) return false;

  return true;
}


// ------------------------------------------------------------
// BLAD
// ------------------------------------------------------------

function leafMask(x, y) {
  const tip = { x: 0.69, y: 0.91 };
  const top = { x: 0.70, y: 0.18 };

  const vx = top.x - tip.x;
  const vy = top.y - tip.y;

  const px = x - tip.x;
  const py = y - tip.y;

  const len = Math.sqrt(vx * vx + vy * vy);

  const along = (px * vx + py * vy) / len;
  const across = (px * (-vy) + py * vx) / len;

  const t = clamp(along / len);

  const width =
    0.018 +
    Math.sin(t * Math.PI) * 0.115;

  const curve = 0.035 * Math.sin(t * Math.PI);

  return (
    t >= 0 &&
    t <= 1.08 &&
    Math.abs(across - curve) < width
  );
}


// ------------------------------------------------------------
// STEEL
// ------------------------------------------------------------

function stemMask(x, y) {
  const cx = 0.61;
  const cy = 0.145;

  const dx = (x - cx) / 0.025;
  const dy = (y - cy) / 0.045;

  return dx * dx + dy * dy < 1;
}


// ------------------------------------------------------------
// FOTO-ACHTIGE DETAILS
// ------------------------------------------------------------

function highlight(x, y) {
  const dx = x - 0.33;
  const dy = y - 0.28;

  return Math.exp(-((dx * dx + dy * dy) * 115));
}

function smallHighlight(x, y) {
  const dx = x - 0.48;
  const dy = y - 0.39;

  return Math.exp(-((dx * dx + dy * dy) * 330));
}

function mangoTexture(x, y) {
  const a = Math.sin(x * 91 + y * 157);
  const b = Math.sin(x * 171 - y * 83);

  return (a + b) * 0.5;
}

function leafTexture(x, y) {
  return Math.sin(x * 120 + y * 90) * 0.5 + 0.5;
}


// ------------------------------------------------------------
// RENDER
// ------------------------------------------------------------

function renderMango(W = 25, H = 20) {
  const lines = [];

  for (let j = 0; j < H; j++) {
    let row = "";

    for (let i = 0; i < W; i++) {
      const x = i / (W - 1);
      const y = j / (H - 1);

      // BLAD
      if (leafMask(x, y)) {
        const t = clamp((y - 0.10) / 0.85);

        let c;

        if (t < 0.45) {
          c = mix(
            [30, 135, 38],
            [54, 180, 48],
            t / 0.45
          );
        } else {
          c = mix(
            [54, 180, 48],
            [25, 105, 31],
            (t - 0.45) / 0.55
          );
        }

        const vein =
          Math.exp(
            -Math.pow(
              (x - (0.695 - y * 0.025)) * 70,
              2
            )
          );

        const tex = leafTexture(x, y);

        let r = c[0] + vein * 24 + tex * 7;
        let g = c[1] + vein * 50 + tex * 12;
        let b = c[2] + vein * 12;

        row += FG(
          Math.min(255, Math.round(r)),
          Math.min(255, Math.round(g)),
          Math.min(255, Math.round(b))
        );

        continue;
      }

      // STEEL
      if (stemMask(x, y)) {
        row += FG(105, 74, 37);
        continue;
      }

      // MANGO
      if (mangoMask(x, y)) {
        const t =
          clamp(
            ((y * 0.88) + (x * 0.13) - 0.08) / 0.82
          );

        let [r, g, b] = gradient(t);

        // Rode blos boven/rechts
        const redGlow =
          Math.exp(
            -(
              Math.pow((x - 0.52) * 3.0, 2) +
              Math.pow((y - 0.22) * 3.2, 2)
            )
          );

        r += redGlow * 17;
        g -= redGlow * 12;

        // Fijne schiltextuur
        const tex = mangoTexture(x, y);

        r += tex * 3;
        g += tex * 2;
        b += tex;

        // Grote glans
        const h = highlight(x, y);

        r += h * 75;
        g += h * 55;
        b += h * 28;

        // Kleine heldere plekjes
        const sh = smallHighlight(x, y);

        r += sh * 40;
        g += sh * 34;
        b += sh * 22;

        row += FG(
          Math.min(255, Math.max(0, Math.round(r))),
          Math.min(255, Math.max(0, Math.round(g))),
          Math.min(255, Math.max(0, Math.round(b)))
        );

        continue;
      }

      // Achtergrond
      row += " ";
    }

    lines.push(row);
  }

  return lines;
}


// ------------------------------------------------------------
// TITEL
// ------------------------------------------------------------

function titleLine(totalW) {
  const title = "Mango CLI Bug Report";
  const chars = [...title];

  const start = Math.max(
    0,
    Math.floor((totalW - chars.length) / 2)
  );

  let line = " ".repeat(totalW).split("");

  chars.forEach((ch, i) => {
    const t = chars.length === 1
      ? 0
      : i / (chars.length - 1);

    const c = mix(
      [255, 92, 35],
      [255, 210, 55],
      t
    );

    line[start + i] = FG(
      c[0],
      c[1],
      c[2],
      ch
    );
  });

  return line.join("");
}


// ------------------------------------------------------------
// BANNER
// ------------------------------------------------------------

function getBanner() {
  const W = 25;
  const H = 20;

  const pad = 2;
  const totalW = W + pad * 2;

  const art = renderMango(W, H);

  const out = [];

  out.push("");

  for (const line of art) {
    out.push(" ".repeat(pad) + line);
  }

  out.push("");
  out.push(titleLine(totalW));
  out.push("");

  return out.join("\n");
}

module.exports = {
  getBanner
};