// Draws the homepage hero map from the business counts held in Sanity (homeRedesign.countyCounts).
import { BLANK_MAP_INNER as geo } from "@/lib/features/geo/blankMap";

const INK = "#121212", GOLD = "#FFC20E";

/** Ramer-Douglas-Peucker: fewer points, same shape at the sizes used here. */
function simplify(pts, tol) {
  if (pts.length < 4) return pts;
  const [a, b] = [pts[0], pts.at(-1)];
  let far = 0, at = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]], len = Math.hypot(dx, dy);
    const d = len ? Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / len : Math.hypot(pts[i][0] - a[0], pts[i][1] - a[1]);
    if (d > far) [far, at] = [d, i];
  }
  return far > tol ? [...simplify(pts.slice(0, at + 1), tol).slice(0, -1), ...simplify(pts.slice(at), tol)] : [a, b];
}
const area = (r) => Math.abs(r.reduce((a, [x, y], i) => { const [p, q] = r[(i + 1) % r.length]; return a + x * q - p * y; }, 0)) / 2;
const counties = [...geo.matchAll(/<path d="([^"]+)"[^>]*><title>([^<]+)<\/title>/g)].map(([, d, name]) => {
  const rings = d.split("M").slice(1).map((s) => {
    const n = s.match(/-?\d+\.?\d*/g).map(Number);
    return Array.from({ length: n.length / 2 }, (_, i) => [n[2 * i], n[2 * i + 1]]);
  }).filter((r) => r.length > 2);
  let best = [0, 0, 0];
  for (const r of rings) {
    let A = 0, x = 0, y = 0;
    r.forEach(([x1, y1], i) => { const [x2, y2] = r[(i + 1) % r.length]; const k = x1 * y2 - x2 * y1; A += k; x += (x1 + x2) * k; y += (y1 + y2) * k; });
    if (Math.abs(A) > best[0]) best = [Math.abs(A), x / (3 * A), y / (3 * A)];
  }
  return { name, rings: rings.map((r) => simplify(r, 0.9)).filter((r) => r.length > 2 && area(r) > 60), c: best.slice(1) };
});
const short = (n) => (n >= 9950 ? `${Math.round(n / 1000)}k` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
let count = {}, calls = {};
const path = (rings) => rings.map((r) => "M" + r.map(([x, y]) => `${+x.toFixed(1)} ${+y.toFixed(1)}`).join("L") + "Z").join("");
const ramp = (v) => (v < 24 ? "#FFF0BF" : v < 40 ? "#FFDF82" : v < 75 ? GOLD : "#F0A900");

/** Is a point inside a set of rings? */
const inside = (rings, x, y) => rings.reduce((odd, r) => {
  let hit = odd;
  for (let i = 0, k = r.length - 1; i < r.length; k = i++) if ((r[i][1] > y) !== (r[k][1] > y) && x < ((r[k][0] - r[i][0]) * (y - r[i][1])) / (r[k][1] - r[i][1]) + r[i][0]) hit = !hit;
  return hit;
}, false);

/** Centers each label in the visible part of its county, as large as fits. Counties too small for a label get none. */
function place(shapes, fonts, pad) {
  const step = 1, minX = Math.floor(Math.min(...shapes.flatMap((s) => s.top.flat().map((p) => p[0])))), minY = Math.floor(Math.min(...shapes.flatMap((s) => s.top.flat().map((p) => p[1]))));
  const w = Math.ceil(Math.max(...shapes.flatMap((s) => s.top.flat().map((p) => p[0]))) - minX) + 2, h = Math.ceil(Math.max(...shapes.flatMap((s) => s.top.flat().map((p) => p[1]))) - minY + 60);
  const grid = new Int16Array(w * h).fill(-1);
  const fill = (rings, id) => {
    const xs = rings.flat().map((p) => p[0]), ys = rings.flat().map((p) => p[1]);
    for (let y = Math.max(0, Math.floor(Math.min(...ys) - minY)); y <= Math.min(h - 1, Math.ceil(Math.max(...ys) - minY)); y += step)
      for (let x = Math.max(0, Math.floor(Math.min(...xs) - minX)); x <= Math.min(w - 1, Math.ceil(Math.max(...xs) - minX)); x += step)
        if (inside(rings, x + minX + .5, y + minY + .5)) grid[y * w + x] = id;
  };
  shapes.forEach((s, id) => { for (let k = s.h; k > 0; k -= 2) fill(s.top.map((r) => r.map(([x, y]) => [x, y + k])), 999); fill(s.top, id); });
  return shapes.flatMap((s, id) => {
    const cells = new Uint32Array((w + 1) * (h + 1));
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) cells[(y + 1) * (w + 1) + x + 1] = (grid[y * w + x] === id ? 1 : 0) + cells[y * (w + 1) + x + 1] + cells[(y + 1) * (w + 1) + x] - cells[y * (w + 1) + x];
    const all = (x0, y0, x1, y1) => x0 >= 0 && y0 >= 0 && x1 < w && y1 < h && cells[y1 * (w + 1) + x1] - cells[y0 * (w + 1) + x1] - cells[y1 * (w + 1) + x0] + cells[y0 * (w + 1) + x0] === (x1 - x0) * (y1 - y0);
    for (const font of fonts) {
      const tw = s.text.length * font * .64, th = font * .74;
      // How far the number can slide each way before touching an edge. Centered means the two sides match.
      let best = null;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (grid[y * w + x] !== id) continue;
        const box = (dx, dy) => all(Math.round(x + dx - tw / 2 - pad), Math.round(y + dy - th / 2 - pad), Math.round(x + dx + tw / 2 + pad), Math.round(y + dy + th / 2 + pad));
        if (!box(0, 0)) continue;
        const slide = (dx, dy) => { let k = 0; while (k < 70 && box(dx * (k + 1), dy * (k + 1))) k++; return k; };
        const l = slide(-1, 0), r = slide(1, 0), t = slide(0, -1), b = slide(0, 1);
        if (Math.abs(l - r) > 2 || Math.abs(t - b) > 2 || Math.min(l, r, t, b) < 1) continue;
        const score = Math.min(l, r, 24) + Math.min(t, b, 24) * 1.4 - Math.abs(l - r) * .55 - Math.abs(t - b) * .75;
        if (!best || score > best.score) best = { score, x, y, l, r, t, b };
      }
      if (best) {
        return [{ name: s.name, calls: s.text, x: best.x + minX + .5, y: +(best.y + minY + .5 + font * .364).toFixed(1), size: font }];
      }
    }
    return [];
  });
}

function draw({ sx, sy, ox, ty, gy, lift, fonts, pad, box, ground, stroke }) {
  const at = ([x, y], o) => [x * sx + ox, y * sy + o];
  let out = `<g transform="translate(${ox} ${gy}) scale(${sx} ${sy})">` +
    counties.map((c) => `<path d="${path(c.rings)}" fill="#BDB7AC" stroke="#BDB7AC" stroke-width="${ground}" stroke-linejoin="round"/>`).join("") +
    counties.map((c) => `<path d="${path(c.rings)}" fill="#F3F1ED" stroke="#F3F1ED" stroke-width="1.6"/>`).join("") + "</g>";
  const shapes = [...counties].sort((a, b) => a.c[1] + (a.name === "Baltimore City" ? 30 : 0) - b.c[1] - (b.name === "Baltimore City" ? 30 : 0)).map((c) => {
    const h = calls[c.name] * lift + 6;
    return { name: c.name, h, text: short(count[c.name]), top: c.rings.map((r) => r.map((q) => { const [x, y] = at(q, ty); return [x, y - h]; })) };
  });
  for (const s of shapes) {
    let walls = "";
    for (const p of s.top) p.forEach((a, i) => {
      const b = p[(i + 1) % p.length], [l, r] = a[0] < b[0] ? [a, b] : [b, a];
      walls += `M${l[0].toFixed(1)} ${l[1].toFixed(1)}L${r[0].toFixed(1)} ${r[1].toFixed(1)}v${s.h.toFixed(1)}L${l[0].toFixed(1)} ${(l[1] + s.h).toFixed(1)}Z`;
    });
    out += `<path d="${walls}" fill="#2A2620" stroke="#2A2620" stroke-width="1"/><path d="${path(s.top)}" fill="${ramp(calls[s.name])}" stroke="${INK}" stroke-width="${stroke}" stroke-linejoin="round"/>`;
  }
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}">${out}</svg>`, labels: place(shapes, fonts, pad), box };
}

let done;
/** Both maps, drawn once per set of counts. */
export function heroMaps(counts) {
  const key = JSON.stringify(counts);
  if (done?.key === key) return done;
  count = counts;
  const most = Math.max(...Object.values(counts));
  // Heights follow the square root of the counts, so small counties stay visible. The labels carry the numbers.
  calls = Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, Math.sqrt(v / most) * 104]));
  const wide = draw({ sx: .83, sy: .66, ox: 590, ty: 452, gy: 566, lift: .16, fonts: [16, 13], pad: 2, box: "580 370 850 545", ground: 7, stroke: 1.3 });
  const narrow = draw({ sx: .95, sy: .8, ox: 10, ty: 130, gy: 280, lift: .2, fonts: [31], pad: 3, box: "0 30 980 670", ground: 8, stroke: 1.6 });
  return (done = { key, wide, narrow });
}
