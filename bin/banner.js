// ===== BugBattler banner: zwart gat (Gargantua-stijl) =====
// ehm ja dit is de banner (helemaal zelf gemaakt natuurlijk)
// en deze word gecalled in index.js, zodat je hemt ziet als je de cli opstart hij sttaat hier omdat het erg veel ruimte ineemt.//

// ===== BugBattler banner: zwart gat (Gargantua-stijl) =====

const BANNER = [
  "██████╗ ██╗   ██╗ ██████╗     ██████╗  █████╗ ████████╗████████╗██╗     ███████╗██████╗ ",
  "██╔══██╗██║   ██║██╔════╝     ██╔══██╗██╔══██╗╚══██╔══╝╚══██╔══╝██║     ██╔════╝██╔══██╗",
  "██████╔╝██║   ██║██║  ███╗    ██████╔╝███████║   ██║      ██║   ██║     █████╗  ██████╔╝",
  "██╔══██╗██║   ██║██║   ██║    ██╔══██╗██╔══██║   ██║      ██║   ██║     ██╔══╝  ██╔══██╗",
  "██████╔╝╚██████╔╝╚██████╔╝    ██████╔╝██║  ██║   ██║      ██║   ███████╗███████╗██║  ██║",
  "╚═════╝  ╚═════╝  ╚═════╝     ╚═════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═╝",
];

const RESET = "\x1b[0m";
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const fg = (c, text) => `\x1b[38;2;${c[0]};${c[1]};${c[2]}m${text}${RESET}`;

// Warme kleuren van een zwart gat: zwart -> bruin -> oranje -> crème -> wit
const WARM = [
  [0.0, [0, 0, 0]],
  [0.12, [44, 16, 8]],
  [0.3, [120, 46, 20]],
  [0.5, [205, 98, 44]],
  [0.68, [244, 152, 88]],
  [0.84, [255, 208, 160]],
  [0.94, [255, 238, 214]],
  [1.0, [255, 252, 246]],
];

function warm(v) {
  v = clamp(v);
  for (let i = 1; i < WARM.length; i++) {
    if (v <= WARM[i][0]) {
      const [v0, c0] = WARM[i - 1];
      const [v1, c1] = WARM[i];
      const t = (v - v0) / (v1 - v0);
      return [c0[0] + (c1[0] - c0[0]) * t, c0[1] + (c1[1] - c0[1]) * t, c0[2] + (c1[2] - c0[2]) * t];
    }
  }
  return WARM[WARM.length - 1][1];
}

const STAR_CHARS = ["·", ".", "*", "+", "✦"];
const STAR_COLORS = [[110, 80, 62], [150, 120, 100], [90, 62, 50], [190, 160, 140]];

// Willekeurig maar vast patroon
function hash(x, y) {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

// Zachte ruis; x herhaalt na `period` (nodig om rond de schijf heen te lopen)
function pnoise(x, y, period) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const x0 = ((xi % period) + period) % period, x1 = (x0 + 1) % period;
  const a = hash(x0, yi), b = hash(x1, yi), c = hash(x0, yi + 1), d = hash(x1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

// ---------- Zwart gat: lichtstralen volgen door gekromde ruimte ----------
// Eenheden: M = 1 (horizon op r = 2). De schaduw heeft straal b = 3*sqrt(3).
// ASPECT maakt het gat platter (lager getal = platter). Tekens zijn in de meeste terminals
// hoger dan breed, daardoor ziet het gat er anders uitgerekt uit.
const ASPECT = 0.7;
const HOLE_W = 88;                                      // pixels breed
const HOLE_H = Math.round((50 * ASPECT) / 2) * 2;       // pixels hoog (even: 2 pixels per teken)
const HOLE_CX = 68.4, HOLE_CY = 21.4 * ASPECT;          // midden van het gat
const HOLE_R = 14.8;                     // straal van de schaduw in pixels
const B_CRIT = 3 * Math.sqrt(3);
const PX_PER_M = HOLE_R / B_CRIT;
const R_IN = 3.4, R_OUT = 26;            // binnen- en buitenrand van de schijf
const ELEV = (6 * Math.PI) / 180;        // kijkhoek boven het vlak van de schijf
const ROLL = (13 * Math.PI) / 180;       // kanteling van het beeld
const SIN_E = Math.sin(ELEV), COS_E = Math.cos(ELEV);
const DPHI = 0.025, COS_D = Math.cos(DPHI), SIN_D = Math.sin(DPHI);
const BRIGHTNESS = 2.4, TONE = 1.15, DOPPLER = 0.65;

// Geeft de helderheid van de schijf voor een lichtstraal met afstand (sx, sy) tot het gat.
// -1 = ingeslikt door het gat, -2 = ontsnapt (geen schijf geraakt)
function traceDisk(sx, sy, b) {
  if (b < 1e-4) return -1;
  if (b > R_OUT * 1.15) return -2;
  const e2x = sx / b, e2y = (sy * COS_E) / b, e2z = (-sy * SIN_E) / b;
  const R0 = R_OUT * 1.6;
  let u = 1 / R0;
  let w = Math.sqrt(Math.max(0, 1 / (b * b) - u * u * (1 - 2 * u)));
  const phi0 = Math.asin(b / R0);
  let c = Math.cos(phi0), s = Math.sin(phi0);
  let r = R0;
  let x = r * s * e2x, y = r * (c * SIN_E + s * e2y), z = r * (c * COS_E + s * e2z);

  for (let i = 0; i < 700; i++) {
    const px = x, py = y, pz = z;
    w += (-u + 3 * u * u) * DPHI * 0.5;
    u += w * DPHI;
    w += (-u + 3 * u * u) * DPHI * 0.5;
    const c2 = c * COS_D - s * SIN_D;
    s = s * COS_D + c * SIN_D;
    c = c2;
    if (u > 0.5) return -1;
    r = 1 / u;
    x = r * s * e2x;
    y = r * (c * SIN_E + s * e2y);
    z = r * (c * COS_E + s * e2z);

    if (py * y < 0) {
      // De straal kruist het vlak van de schijf
      const t = py / (py - y);
      const hx = px + (x - px) * t, hz = pz + (z - pz) * t;
      const rc = Math.hypot(hx, hz);
      if (rc >= R_IN && rc <= R_OUT) {
        // Dopplereffect: de kant die naar ons toe draait is helderder
        const tx = x - px, ty = y - py, tz = z - pz;
        const vk = DOPPLER * Math.sqrt(1 / rc);
        const dot = (vk * (tx * hz - tz * hx)) / (rc * Math.hypot(tx, ty, tz));
        const g = 1 / ((1 / Math.sqrt(1 - vk * vk)) * (1 + dot));
        // Streepjes in de schijf
        const pu = Math.atan2(hz, hx) / (2 * Math.PI) + 0.5;
        const tex = 0.3 + 0.8 * pnoise(pu * 10, rc * 0.45, 10) + 0.5 * pnoise(pu * 30, rc * 1.3, 30);
        const edge = 1 - clamp((rc - R_OUT * 0.75) / (R_OUT * 0.25));
        return BRIGHTNESS * Math.pow(R_IN / rc, 1.25) * edge * tex * Math.pow(g, 3);
      }
    }
    if (w < 0 && r > R_OUT * 1.3) return -2;
  }
  return -2;
}

// Kleur van één lichtstraal: [r, g, b, vast]
function shade(sx, sy) {
  const b = Math.hypot(sx, sy);
  const ring = 0.9 * Math.exp(-(((b - B_CRIT) / 0.3) ** 2)); // dunne felle ring rond de schaduw
  const hit = traceDisk(sx, sy, b);
  const solid = hit !== -2 ? 1 : 0;
  const v = 1 - Math.exp(-(Math.max(hit, 0) + ring) * TONE);
  const c = warm(v);
  if (solid) return [c[0], c[1], c[2], 1];
  const bg = Math.exp(-((b / 18) ** 2)); // donkerbruine gloed van de ruimte
  return [c[0] + 46 * bg, c[1] + 20 * bg, c[2] + 11 * bg, 0];
}

function blur(src, W, H, kernel) {
  const k = (kernel.length - 1) / 2;
  const sum = kernel.reduce((a, b) => a + b, 0);
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      for (let ch = 0; ch < 3; ch++) {
        let acc = 0;
        for (let i = -k; i <= k; i++) {
          const xx = Math.min(W - 1, Math.max(0, x + i));
          acc += src[(y * W + xx) * 3 + ch] * kernel[i + k];
        }
        tmp[(y * W + x) * 3 + ch] = acc / sum;
      }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      for (let ch = 0; ch < 3; ch++) {
        let acc = 0;
        for (let i = -k; i <= k; i++) {
          const yy = Math.min(H - 1, Math.max(0, y + i));
          acc += tmp[(yy * W + x) * 3 + ch] * kernel[i + k];
        }
        out[(y * W + x) * 3 + ch] = acc / sum;
      }
  return out;
}

// Geeft per pixel [r, g, b] of null (niets, dus doorzichtig)
function renderHole() {
  const W = HOLE_W, H = HOLE_H;
  const pix = new Float32Array(W * H * 3);
  const solid = new Uint8Array(W * H);
  const cr = Math.cos(ROLL), sr = Math.sin(ROLL);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let r = 0, g = 0, bl = 0, s = 0;
      for (const oy of [0.25, 0.75]) {
        for (const ox of [0.25, 0.75]) {
          const X = (x + ox - HOLE_CX) / PX_PER_M;
          const Y = -(y + oy - HOLE_CY) / (PX_PER_M * ASPECT);
          const c = shade(X * cr + Y * sr, -X * sr + Y * cr);
          r += c[0]; g += c[1]; bl += c[2]; s |= c[3];
        }
      }
      const i = y * W + x;
      pix[i * 3] = r / 4; pix[i * 3 + 1] = g / 4; pix[i * 3 + 2] = bl / 4;
      solid[i] = s;
    }
  }

  // Witblauwe plasmawolkjes langs de schijf
  const blobs = [[34, 29.4], [43.4, 26.9], [58.9, 22.2]];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      for (const [bx, by] of blobs) {
        const d = ((x - bx) / 3.2) ** 2 + ((y - by * ASPECT) / (4.4 * ASPECT)) ** 2;
        const wgt = clamp(Math.exp(-d) * (0.45 + 1.0 * pnoise(x * 0.8, y * 0.8, 1e6)));
        const i = (y * W + x) * 3;
        pix[i] += (225 - pix[i]) * wgt;
        pix[i + 1] += (235 - pix[i + 1]) * wgt;
        pix[i + 2] += (255 - pix[i + 2]) * wgt;
      }
    }
  }

  // Gloed (bloom): de felle delen laten licht uitstralen
  const bright = new Float32Array(pix.length);
  for (let i = 0; i < W * H; i++) {
    const m = Math.max(pix[i * 3], pix[i * 3 + 1], pix[i * 3 + 2]);
    const k = clamp((m - 170) / 85);
    for (let ch = 0; ch < 3; ch++) bright[i * 3 + ch] = pix[i * 3 + ch] * k;
  }
  const glow = blur(bright, W, H, [1, 2, 3, 4, 3, 2, 1]);
  for (let i = 0; i < pix.length; i++) pix[i] = Math.min(255, pix[i] + 0.5 * glow[i]);

  const out = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let c = [pix[i * 3], pix[i * 3 + 1], pix[i * 3 + 2]];
      const m = Math.max(c[0], c[1], c[2]);
      if (!solid[i] && m < 14) {
        // lege ruimte: af en toe een ster
        c = hash(x * 1.7, y * 2.3) > 0.99 ? pick(STAR_COLORS) : null;
      }
      out.push(c ? c.map(Math.round) : null);
    }
  }
  return { W, H, pixels: out };
}

// Tekent het gat met halve blokken: 2 pixels boven elkaar per teken
function drawBlackHole(margin) {
  const { W, H, pixels } = renderHole();
  const rows = [];
  for (let y = 0; y < H; y += 2) {
    let row = " ".repeat(margin);
    for (let x = 0; x < W; x++) {
      const top = pixels[y * W + x];
      const bottom = pixels[(y + 1) * W + x];
      if (!top && !bottom) row += " ";
      else if (!bottom) row += `\x1b[38;2;${top.join(";")}m▀${RESET}`;
      else if (!top) row += `\x1b[38;2;${bottom.join(";")}m▄${RESET}`;
      else row += `\x1b[38;2;${top.join(";")}m\x1b[48;2;${bottom.join(";")}m▀${RESET}`;
    }
    rows.push(row);
  }
  return rows.join("\n");
}

// ---------- Banner ----------
function star() {
  return fg(pick(STAR_COLORS), pick(STAR_CHARS));
}

function starRow(width, chance) {
  let row = "";
  for (let i = 0; i < width; i++) row += Math.random() < chance ? star() : " ";
  return row;
}

function getBanner() {
  const width = Math.max(...BANNER.map((line) => line.length));
  const margin = 6;
  const total = width + margin * 2;
  const lines = [];

  lines.push(starRow(total, 0.05));
  lines.push(starRow(total, 0.05));

  for (const line of BANNER) {
    let row = "";
    for (let x = 0; x < total; x++) {
      const ch = line[x - margin]; // undefined in de marges
      if (ch && ch !== " ") {
        const t = (x - margin) / (width - 1);
        const glowT = 1 - Math.abs(2 * t - 1); // 0 aan de randen, 1 in het midden
        row += fg(warm(0.45 + 0.55 * glowT).map(Math.round), ch);
      } else if (x < margin || x >= margin + width) {
        row += Math.random() < 0.08 ? star() : " ";
      } else {
        row += " ";
      }
    }
    lines.push(row);
  }

  return lines.join("\n") + "\n" + drawBlackHole(margin);
}

module.exports = { getBanner };