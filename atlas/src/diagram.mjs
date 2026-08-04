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
    // 真上から時計回りに等分し、偶数個のときは半目盛りずらす。
    // ずらさないと二件の項で節点が真上と真下に並び、横に細長い箱の中で
    // 上下の縁に貼りついてしまう。箱は横長なので、横に振るのが正しい。
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
    // 節点そのものが「その組織の名」である。ここから該当項へ飛ばす。
    out += `<a data-to="${f.id}"><g transform="translate(${(x - R).toFixed(2)} ${(y - R).toFixed(2)}) scale(${(R * 2 / 120).toFixed(4)})">`
      + emblem(f.emblem, { scale: cal[f.id] ?? 1, extinct: f.extinct, color: catOf(rel.other).color }).replace(/<svg[^>]*>|<\/svg>/g, '')
      + `</g></a>`;
  });

  const me = byId[id];
  out += `<g transform="translate(${cx - 10} ${cy - 10}) scale(${(20 / 120).toFixed(4)})">`
    + emblem(me.emblem, { scale: cal[id] ?? 1, extinct: me.extinct }).replace(/<svg[^>]*>|<\/svg>/g, '')
    + `</g>`;

  return `<svg class="ego" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
}

// ── 二　全体相関図は第二版で廃した ────────────────────
// 四十九点を円環に並べ、敵対を弦として引く図だった。
// 網目にはならなかったが、弦が中央で束になり、どの線がどこへ行くのか追えない。
// 一枚に収めるという制約を発注者様に外していただいたので、
// 主題別・分類別の十九枚（relmap.mjs）に置き換えた。

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
      + `<a data-to="${id}"><g transform="translate(${(x - r).toFixed(2)} ${(y - r).toFixed(2)}) scale(${(r * 2 / 120).toFixed(4)})">`
      + emblem(f.emblem, { scale: cal[id] ?? 1, extinct: f.extinct, color }).replace(/<svg[^>]*>|<\/svg>/g, '')
      + `</g></a>`;
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
