// Draws the homepage hero map from src/lib/home/calls.json (calls per county).
// Run after changing the counts: node scripts/homeArt.mjs
import { readFileSync, writeFileSync } from "node:fs";

const geo = readFileSync("src/lib/features/geo/blankMap.ts", "utf8").match(/INNER = (".*?");?\s*$/m)[1];
const calls = JSON.parse(readFileSync("src/lib/home/calls.json", "utf8"));
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
const counties = [...JSON.parse(geo).matchAll(/<path d="([^"]+)"[^>]*><title>([^<]+)<\/title>/g)].map(([, d, name]) => {
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
  return { name, rings: rings.map((r) => simplify(r, 0.45)).filter((r) => r.length > 2), c: best.slice(1) };
});
const path = (rings) => rings.map((r) => "M" + r.map(([x, y]) => `${+x.toFixed(1)} ${+y.toFixed(1)}`).join("L") + "Z").join("");
const ramp = (v) => (v < 15 ? "#FFF0BF" : v < 40 ? "#FFDF82" : v < 75 ? GOLD : "#F0A900");

function draw({ sx, sy, ox, ty, gy, lift, only, font, small, offset, box, ground, stroke, dot, line }) {
  const at = ([x, y], o) => [x * sx + ox, y * sy + o];
  let out = `<g transform="translate(${ox} ${gy}) scale(${sx} ${sy})">` +
    counties.map((c) => `<path d="${path(c.rings)}" fill="#BDB7AC" stroke="#BDB7AC" stroke-width="${ground}" stroke-linejoin="round"/>`).join("") +
    counties.map((c) => `<path d="${path(c.rings)}" fill="#F3F1ED" stroke="#F3F1ED" stroke-width="1.6"/>`).join("") + "</g>";
  for (const c of counties) {
    const [x, y1] = at(c.c, ty), [, y2] = at(c.c, gy);
    out += `<path d="M${x.toFixed(0)} ${y1.toFixed(0)}V${y2.toFixed(0)}" stroke="#8F887C" stroke-width="${line}"/><circle cx="${x.toFixed(0)}" cy="${y2.toFixed(0)}" r="${dot}" fill="#8F887C"/>`;
  }
  const order = [...counties].sort((a, b) => a.c[1] + (a.name === "Baltimore City" ? 30 : 0) - b.c[1] - (b.name === "Baltimore City" ? 30 : 0));
  for (const c of order) {
    const h = calls[c.name] * lift + 5;
    for (const ring of c.rings) {
      const p = ring.map((q) => at(q, ty));
      let walls = "";
      p.forEach((a, i) => {
        const b = p[(i + 1) % p.length], [l, r] = a[0] < b[0] ? [a, b] : [b, a];
        walls += `M${l[0].toFixed(1)} ${l[1].toFixed(1)}L${r[0].toFixed(1)} ${r[1].toFixed(1)}v${-h.toFixed(1)}L${l[0].toFixed(1)} ${(l[1] - h).toFixed(1)}Z`;
      });
      out += `<path d="${walls}" fill="#2A2620" stroke="#2A2620" stroke-width=".8"/><path d="${path([p.map(([x, y]) => [x, y - h])])}" fill="${ramp(calls[c.name])}" stroke="${INK}" stroke-width="${stroke}" stroke-linejoin="round"/>`;
    }
  }
  const labels = counties.filter((c) => !only || only.includes(c.name)).map((c) => {
    const [dx, dy] = offset[c.name] ?? [0, 0], [x, y] = at([c.c[0] + dx, c.c[1] + dy], ty);
    return { name: c.name, calls: calls[c.name], x: Math.round(x), y: Math.round(y - calls[c.name] * lift - 5 + font / 3), size: small.includes(c.name) ? font - 3 : font };
  });
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}">${out}</svg>`, labels, box };
}

const wide = draw({ sx: .83, sy: .555, ox: 590, ty: 474, gy: 612, lift: .8, font: 15, small: ["Calvert", "Baltimore City", "Kent", "Talbot"], box: "580 370 850 545", ground: 7, stroke: 1.2, dot: 3.2, line: 1.4,
  offset: { Garrett: [-6, -10], Allegany: [22, -8], Kent: [14, -14], Cecil: [12, -14], Wicomico: [8, 0], "Baltimore City": [0, 3], Harford: [16, -6], Howard: [21, 9], Carroll: [4, -10], Frederick: [0, -18] } });
const narrow = draw({ sx: .95, sy: .74, ox: 10, ty: 130, gy: 300, lift: .95, font: 31, small: [], only: ["Garrett", "Frederick", "Montgomery", "Prince George's", "Anne Arundel", "Baltimore County", "Charles", "Worcester"], box: "0 30 980 670", ground: 8, stroke: 1.2, dot: 5, line: 2,
  offset: { Garrett: [-6, -10], Frederick: [2, -20], "Baltimore County": [0, -26], Montgomery: [-2, 0], Worcester: [-4, 0], "Prince George's": [10, 8], "Anne Arundel": [2, -6] } });
writeFileSync("public/images/home/hero-map.svg", wide.svg);
writeFileSync("public/images/home/hero-map-mobile.svg", narrow.svg);
writeFileSync("src/lib/home/heroMap.json", JSON.stringify({ wide: { box: wide.box, labels: wide.labels }, narrow: { box: narrow.box, labels: narrow.labels } }));
writeFileSync("src/lib/home/land.json", JSON.stringify(Object.fromEntries(counties.map((c) => [c.name, path(c.rings)]))));
