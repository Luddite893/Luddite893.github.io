// 関係図
//
// 二種類ある。
//   一　各項の「関係」欄に入る小図（49 点）。その組織を中心に据えた自我図。
//   二　巻頭の全体相関図（見開き 2P）。49 ノードを一望する。
//
// ── 14-4「49 ノード相関図の可読性を保つための設計案」への回答 ────
//
// 49 ノードを自由配置の網目として描くと、必ず読めなくなる。
// 力学的配置（force-directed）は見た目が有機的になるだけで、
// 読者は「どこに何があるか」を毎回探し直すことになる。
//
// 可読性は次の四点で担保する。
//
//   (1) 位置に意味を持たせる
//       ノードは円周上に固定し、分類ごとの扇形に束ねる。
//       どの扇にあるかで、その組織が何者かが分かる。
//       配置が動かないので、二度目に開いたとき同じ場所に同じ組織がある。
//
//   (2) 引く線を絞る
//       弦（円を横切る線）として描くのは **敵対だけ**。
//       敵対だけが遠距離の構造を持つからである。
//       同盟・従属・派生・反目は近傍に閉じるので、外周の短い弧で描く。
//       全種を弦にすると、中央が黒く潰れて何も読めなくなる。
//
//   (3) 色を使わない
//       弦は墨一色。分類色は扇形の帯にのみ乗せる。
//       線に色を付けると、色が「分類」と「関係」の二つを意味することになり、
//       どちらの意味で使われているのか読者に判断させることになる。
//
//   (4) 次数を外周に出す
//       各ノードの外側に、敵対の数だけ刻みを打つ。
//       線を数えなくても、誰が四面楚歌かが一目で分かる。

import { emblem } from './heraldry.mjs';
import { factions, categories, byCat } from './factions.mjs';
import { edges, edgesOf, hostileDegree, KINDS } from './relations.mjs';
import cal from './calibration.json' with { type: 'json' };

const INK = '#1b1b1a';
const byId = Object.fromEntries(factions.map((f) => [f.id, f]));
const catOf = (id) => categories.find((c) => c.id === byId[id].cat);

// ── 関係の記号 ──────────────────────────────────
// 線の中央に打つ。凡例は巻頭の「読み方」に一度だけ載せる。
function relMark(kind, x, y, ang) {
  const g = (b) => `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${ang.toFixed(1)})">${b}</g>`;
  const s = 2.2;
  switch (kind) {
    case 'hostile':                 // 断ち。交戦している。
      return g(`<path d="M ${-s} ${-s} L ${s} ${s} M ${-s} ${s} L ${s} ${-s}" stroke="${INK}" stroke-width="0.8" fill="none"/>`);
    case 'ally':                    // 二重線。結ばれている。
      return g(`<path d="M ${-s} -1.1 L ${s} -1.1 M ${-s} 1.1 L ${s} 1.1" stroke="${INK}" stroke-width="0.7" fill="none"/>`);
    case 'vassal':                  // 矢。上位を指す。
      return g(`<path d="M ${-s * 0.6} ${-s * 0.9} L ${s * 1.1} 0 L ${-s * 0.6} ${s * 0.9} Z" fill="${INK}"/>`);
    case 'origin':                  // ○ の側が母体。
      return g(`<circle r="${s * 0.8}" fill="none" stroke="${INK}" stroke-width="0.7"/>`);
    case 'rival':                   // 斜。席を争うが交戦しない。
      return g(`<path d="M ${-s * 0.5} ${s} L ${s * 0.5} ${-s}" stroke="${INK}" stroke-width="0.8" fill="none"/>`);
    default: return '';
  }
}

// ── 一　自我図（各項の「関係」欄） ────────────────────
// 中心に当該組織、周囲に関係先。文章は一語も使わない。
export function egoDiagram(id, { w = 132, h = 74 } = {}) {
  const rels = edgesOf(id);
  const cx = w / 2, cy = h / 2;
  const rx = w * 0.36, ry = h * 0.33;
  const n = Math.max(rels.length, 1);
  const R = 7.2;                                   // 周囲ノードの半径
  let out = '';

  rels.forEach((rel, i) => {
    // 上下に振り分ける。真横は名前が長くなるので避ける。
    const a = (-90 + (360 / n) * i + (n % 2 ? 0 : 180 / n)) * Math.PI / 180;
    const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
    const k = KINDS[rel.kind];
    // 線は両端の円に食い込ませない
    const dx = x - cx, dy = y - cy, L = Math.hypot(dx, dy);
    const ux = dx / L, uy = dy / L;
    const x0 = cx + ux * 10.5, y0 = cy + uy * 10.5;
    const x1 = x - ux * (R + 0.6), y1 = y - uy * (R + 0.6);
    // 従属は下位から上位へ向ける
    const flip = rel.kind === 'vassal' && !rel.out;
    const ang = (Math.atan2(flip ? -uy : uy, flip ? -ux : ux) * 180) / Math.PI;
    out += `<path d="M ${x0.toFixed(2)} ${y0.toFixed(2)} L ${x1.toFixed(2)} ${y1.toFixed(2)}" `
      + `stroke="${INK}" stroke-width="${k.w}" fill="none"${k.dash ? ` stroke-dasharray="${k.dash}"` : ''}/>`;
    out += relMark(rel.kind, (x0 + x1) / 2, (y0 + y1) / 2, ang);
    const f = byId[rel.other];
    out += `<g transform="translate(${(x - R).toFixed(2)} ${(y - R).toFixed(2)}) scale(${(R * 2 / 120).toFixed(4)})">`
      + emblem(f.emblem, { scale: cal[f.id] ?? 1, extinct: f.extinct, color: catOf(rel.other).color }).replace(/<svg[^>]*>|<\/svg>/g, '')
      + `</g>`;
  });

  const me = byId[id];
  out += `<g transform="translate(${cx - 10} ${cy - 10}) scale(${(20 / 120).toFixed(4)})">`
    + emblem(me.emblem, { scale: cal[id] ?? 1, extinct: me.extinct }).replace(/<svg[^>]*>|<\/svg>/g, '')
    + `</g>`;

  return `<svg class="ego" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
}

// ── 二　全体相関図（見開き 2P） ──────────────────────
export function masterDiagram({ size = 900 } = {}) {
  const C = size / 2;
  // 外側から内側へ：組織名／刻み／ノード／分類帯／弦。
  // 分類帯を外に置くと組織名と衝突する。名は外向きに伸びるので外周を明け渡す。
  const R = size * 0.300;          // ノード環
  const RB = R - size * 0.020;     // 分類帯（ノードの内側）
  const BW = size * 0.030;         // 帯の幅
  const gap = 5;                   // 扇のあいだの空き（度）

  // 分類ごとに扇へ束ねる。位置そのものが分類を意味する。
  const order = [];
  const sectors = [];
  let a = -90 + gap / 2;
  const totalGap = gap * categories.length;
  const per = (360 - totalGap) / factions.length;
  for (const c of categories) {
    const list = byCat(c.id);
    const a0 = a;
    for (const f of list) { order.push({ f, ang: a + per / 2 }); a += per; }
    sectors.push({ c, a0, a1: a, mid: (a0 + a) / 2 });
    a += gap;
  }
  const pos = Object.fromEntries(order.map((o) => {
    const t = (o.ang * Math.PI) / 180;
    return [o.f.id, { x: C + Math.cos(t) * R, y: C + Math.sin(t) * R, ang: o.ang }];
  }));

  const arcPath = (r0, a0, a1, w) => {
    const p = (aa, rr) => [C + Math.cos((aa * Math.PI) / 180) * rr, C + Math.sin((aa * Math.PI) / 180) * rr];
    const [x0, y0] = p(a0, r0), [x1, y1] = p(a1, r0);
    const [x2, y2] = p(a1, r0 - w), [x3, y3] = p(a0, r0 - w);
    const big = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${r0} ${r0} 0 ${big} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0 - w} ${r0 - w} 0 ${big} 0 ${x3} ${y3} Z`;
  };

  let out = '';

  // 分類の帯。色を使うのはここだけ。帯の上に分類名を回す。
  let defs = '';
  for (const [i, sc] of sectors.entries()) {
    out += `<path d="${arcPath(RB, sc.a0, sc.a1, BW)}" fill="${sc.c.color}" opacity="0.40"/>`;
    // 帯に沿わせる基線。下半分は逆さになるので、向きを反転させる。
    const rt = RB - BW * 0.36;
    const flip = sc.mid > 0 && sc.mid < 180;
    const p = (aa, r) => [(C + Math.cos((aa * Math.PI) / 180) * r).toFixed(2),
                          (C + Math.sin((aa * Math.PI) / 180) * r).toFixed(2)];
    const [ax, ay] = p(flip ? sc.a1 : sc.a0, rt), [bx, by] = p(flip ? sc.a0 : sc.a1, rt);
    defs += `<path id="band${i}" fill="none" d="M ${ax} ${ay} A ${rt} ${rt} 0 0 ${flip ? 0 : 1} ${bx} ${by}"/>`;
    out += `<text font-size="${(size * 0.0155).toFixed(2)}" font-weight="600" fill="${sc.c.color}" `
      + `letter-spacing="${(size * 0.0022).toFixed(2)}">`
      + `<textPath href="#band${i}" startOffset="50%" text-anchor="middle">${sc.c.n}　${sc.c.ja}</textPath></text>`;
  }

  // 敵対だけを弦として描く。全種を弦にすると中央が潰れる。
  for (const [x, y, k] of edges) {
    if (k !== 'hostile' || !pos[x] || !pos[y]) continue;
    const a = pos[x], b = pos[y];
    // 制御点を中心寄りに置く。二点が近いほど中心へ寄せない。
    const d = Math.hypot(a.x - b.x, a.y - b.y) / (R * 2);
    const k2 = 0.30 + (1 - d) * 0.45;
    const mx = C + ((a.x + b.x) / 2 - C) * k2, my = C + ((a.y + b.y) / 2 - C) * k2;
    out += `<path d="M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}" `
      + `fill="none" stroke="${INK}" stroke-width="${size * 0.0011}" opacity="0.68"/>`;
  }

  // 同盟・従属・派生・反目は外周の短い弧。近傍に閉じる関係なので中央を通さない。
  for (const [x, y, k] of edges) {
    if (k === 'hostile' || !pos[x] || !pos[y]) continue;
    const a0 = pos[x].ang, a1 = pos[y].ang;
    let d = ((a1 - a0 + 540) % 360) - 180;
    const rr = R + size * 0.010;
    const mid = a0 + d / 2;
    const bulge = rr + Math.min(Math.abs(d) * 0.16, size * 0.024);
    const p = (aa, r) => [C + Math.cos((aa * Math.PI) / 180) * r, C + Math.sin((aa * Math.PI) / 180) * r];
    const [sx, sy] = p(a0, rr), [ex, ey] = p(a1, rr), [bx, by] = p(mid, bulge);
    out += `<path d="M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${bx.toFixed(1)} ${by.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" `
      + `fill="none" stroke="${INK}" stroke-width="${size * 0.0009}" opacity="0.5"`
      + (KINDS[k].dash ? ` stroke-dasharray="${size * 0.0026} ${size * 0.0022}"` : '') + `/>`;
    out += relMark(k, bx, by, (mid + 90));
  }

  // ノード。紋章そのものを置く。番号や点では、どれがどれか分からない。
  for (const o of order) {
    const p = pos[o.f.id];
    const r = size * 0.0165;
    out += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(r * 1.34).toFixed(1)}" fill="#eceae4"/>`;
    out += `<g transform="translate(${(p.x - r).toFixed(2)} ${(p.y - r).toFixed(2)}) scale(${(r * 2 / 120).toFixed(5)})">`
      + emblem(o.f.emblem, { scale: cal[o.f.id] ?? 1, extinct: o.f.extinct }).replace(/<svg[^>]*>|<\/svg>/g, '')
      + `</g>`;

    // 敵対の次数を刻みで外周に出す。線を数えずに四面楚歌が分かる。
    const deg = hostileDegree(o.f.id);
    for (let i = 0; i < deg; i++) {
      const aa = o.ang + (i - (deg - 1) / 2) * (per * 0.26);
      const t = (aa * Math.PI) / 180;
      const r0 = R + size * 0.019, r1 = r0 + size * 0.0072;
      out += `<path d="M ${(C + Math.cos(t) * r0).toFixed(1)} ${(C + Math.sin(t) * r0).toFixed(1)} `
        + `L ${(C + Math.cos(t) * r1).toFixed(1)} ${(C + Math.sin(t) * r1).toFixed(1)}" `
        + `stroke="${INK}" stroke-width="${size * 0.0013}"/>`;
    }

    // 名。外向きに置く。左半分は反転させて、逆さ文字を作らない。
    const t = (o.ang * Math.PI) / 180;
    const lx = C + Math.cos(t) * (R + size * 0.036), ly = C + Math.sin(t) * (R + size * 0.036);
    const flip = o.ang > 90 || o.ang < -90;
    out += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" `
      + `transform="rotate(${(flip ? o.ang + 180 : o.ang).toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)})" `
      + `text-anchor="${flip ? 'end' : 'start'}" dominant-baseline="middle" `
      + `font-size="${(size * 0.0118).toFixed(2)}" fill="${INK}">${o.f.ja}</text>`;
  }

  return `<svg class="master" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" `
    + `font-family="Noto Serif JP, serif"><defs>${defs}</defs>${out}</svg>`;
}

// ── 三　分類別の関係図（分類扉の右頁） ──────────────────
// 全体相関図は円環だが、分類ごとの図で円環を繰り返しても意味がない。
// ここで見たいのは「この分類の関係が、どこへ向かっているか」である。
// だから上段にこの分類の組織、下段に相手を置く二部の図にする。
// 上下に分ければ、分類の内側で閉じているか外へ出ているかが、線の形だけで判る。
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

export function catDiagram(catId, { w = 174, h = 118 } = {}) {
  const mine = factions.filter((f) => f.cat === catId);
  const rels = [];
  for (const f of mine) for (const r of edgesOf(f.id)) {
    if (byId[r.other].cat === catId && r.other < f.id) continue;   // 内側の関係は一度だけ
    rels.push({ from: f.id, to: r.other, kind: r.kind, inner: byId[r.other].cat === catId });
  }
  const others = [...new Set(rels.filter((r) => !r.inner).map((r) => r.to))];
  const idxOf = Object.fromEntries(mine.map((f, i) => [f.id, i]));
  // 交差を減らす。相手は、繋がる相手の平均位置の順に並べる。
  others.sort((a, b) => {
    const m = (id) => {
      const xs = rels.filter((r) => r.to === id).map((r) => idxOf[r.from]);
      return xs.reduce((s, v) => s + v, 0) / (xs.length || 1);
    };
    return m(a) - m(b) || a.localeCompare(b);
  });

  const R = 6.2;
  const yTop = h * 0.30, yBot = h * 0.71;
  const px = (n, i) => (w / (n + 1)) * (i + 1);
  const posTop = (id) => px(mine.length, idxOf[id]);
  const posBot = (id) => px(others.length, others.indexOf(id));

  let out = '';
  for (const r of rels) {
    const k = KINDS[r.kind];
    if (r.inner) {
      const x0 = posTop(r.from), x1 = posTop(r.to);
      const lift = yTop - 10 - Math.abs(x1 - x0) * 0.06;
      out += `<path d="M ${x0.toFixed(1)} ${(yTop - R).toFixed(1)} `
        + `C ${x0.toFixed(1)} ${lift.toFixed(1)}, ${x1.toFixed(1)} ${lift.toFixed(1)}, `
        + `${x1.toFixed(1)} ${(yTop - R).toFixed(1)}" fill="none" stroke="${INK}" `
        + `stroke-width="${k.w}"${k.dash ? ` stroke-dasharray="${k.dash}"` : ''}/>`;
    } else {
      const x0 = posTop(r.from), x1 = posBot(r.to);
      const my = (yTop + yBot) / 2;
      out += `<path d="M ${x0.toFixed(1)} ${(yTop + R).toFixed(1)} `
        + `C ${x0.toFixed(1)} ${my.toFixed(1)}, ${x1.toFixed(1)} ${my.toFixed(1)}, `
        + `${x1.toFixed(1)} ${(yBot - R).toFixed(1)}" fill="none" stroke="${INK}" `
        + `stroke-width="${k.w}"${k.dash ? ` stroke-dasharray="${k.dash}"` : ''} opacity="0.85"/>`;
    }
  }

  const node = (id, x, y, r, color) => {
    const f = byId[id];
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r + 0.9).toFixed(1)}" fill="#f4f2ec"/>`
      + `<g transform="translate(${(x - r).toFixed(2)} ${(y - r).toFixed(2)}) scale(${(r * 2 / 120).toFixed(4)})">`
      + emblem(f.emblem, { scale: cal[id] ?? 1, extinct: f.extinct, color }).replace(/<svg[^>]*>|<\/svg>/g, '')
      + `</g>`;
  };

  mine.forEach((f, i) => {
    const x = px(mine.length, i);
    out += node(f.id, x, yTop, R, categories.find((c) => c.id === catId).color);
    out += `<text x="${x.toFixed(1)}" y="${(yTop - R - 2.4).toFixed(1)}" transform="rotate(-52 ${x.toFixed(1)} ${(yTop - R - 2.4).toFixed(1)})" `
      + `font-size="2.5" fill="#1b1b1a" letter-spacing="0.1">${clip(f.ja, 12)}</text>`;
  });
  others.forEach((id, i) => {
    const x = px(others.length, i);
    out += node(id, x, yBot, R * 0.82, catOf(id).color);
    out += `<text x="${x.toFixed(1)}" y="${(yBot + R + 2.6).toFixed(1)}" transform="rotate(52 ${x.toFixed(1)} ${(yBot + R + 2.6).toFixed(1)})" `
      + `font-size="2.3" fill="#5c5a54" letter-spacing="0.1">${clip(byId[id].ja, 11)}</text>`;
  });

  return `<svg class="catdia" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" `
    + `font-family="Noto Serif JP, serif">${out}</svg>`;
}
