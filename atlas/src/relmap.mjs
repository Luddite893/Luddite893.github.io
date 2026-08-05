// 相関図　第二版
//
// ── 初版の相関図が読めなかった理由 ──────────────────
// 四つある。いずれも「線を減らす」では直らない。
//
//   一　節点が紋章だけだった。
//       紋章は二十五ミリで判別できるよう設計した図象であって、
//       七ミリでは何の組織か分からない。読者は凡例へ戻る。
//   二　関係が線の種類で表されていた。
//       実線・二重線・破線・点線の四つを覚えねば、一本も読めない。
//       ここでも凡例へ戻る。図の上で完結しない。
//   三　四十九点を一枚に詰めた。
//       円環に並べたので網目にはならなかったが、
//       弦が中央で束になり、どの線がどこへ行くのか追えない。
//   四　位置に意味を持たせすぎた。
//       分類ごとの扇に固定したため、**同じ出来事に関わる組織が遠くに離れた**。
//       内戦を追いたい読者は、円の反対側まで目を往復させることになる。
//
// ── 第二版で改めたこと ────────────────────────────
//   一　節点を「札」にする。紋章・組織名・肩書・所在を札の中に入れる。
//   二　関係の**語を札の中に入れる**。線の上には何も書かない。
//   三　一枚あたり八〜十枚の札に絞る。頁数の制約は外していただいた。
//   四　主題ごとに図を立てる。分類ではなく、**何が起きているか**で束ねる。
//
// ── 二について（第二版の途中で改めた点） ────────────
// はじめは線の中ほどに語の小札を置いていた。これは破綻する。
// 一枚の札から線が n 本出るとき、語も n 個要る。ところが札の縁は十三ミリしかない。
// 語の小札は四ミリ強あるので、三本を超えたところで必ず重なる。
// 溝で束になった縦線の脇に語が並ぶと、どの語がどの線のものか分からなくなる。
//
// そこで語を線から降ろし、**札の中に「関係の行」として持たせた**。
//   ・語は必ず一本の線と一対一で結びつく（その行から線が出る）
//   ・線の通り道には文字が一つも無い
//   ・**相手の名も行に書いてあるので、線を辿らずとも関係が読める**
// 三つ目が大きい。線は確かめのためのものになり、読解の頼みの綱ではなくなる。
//
// 札の位置は一枚ずつ手で決めている（relmap-data.mjs の col/row）。
// 力学的な自動配置を使わないのは、交差の無い配置を機械が見つけられないためである。

import { emblem } from './heraldry.mjs';
import { factions, categories } from './factions.mjs';
import { edgesOf, KINDS } from './relations.mjs';
import { ROLE, THEMES } from './relmap-data.mjs';
import cal from './calibration.json' with { type: 'json' };

const byId = Object.fromEntries(factions.map((f) => [f.id, f]));
const catOf = (id) => categories.find((c) => c.id === byId[id].cat);
const INK = '#1b1b1a';
const MID = '#5c5a54';

// ── 版面の割り付け（ミリ） ───────────────────────────
export const M = {
  W: 174, H: 236,
  CW: 44, CH: 13,              // 札の頭（紋章・名・肩書・所在）
  ROW: 4.6,                    // 関係の行。ここから線が出る
  GAP: 6,                      // 札と札の空き
  COL: [2, 65, 128],           // 三列。列間の溝は 19mm
  PITCH: 12,                   // 行送りの目安。札が高ければ下の札を押し下げる
  TOP: 34,                     // 図の始まり
};
const cardH = (n) => M.CH + (n ? n * M.ROW + 1.6 : 0);
const gutter = [(M.COL[0] + M.CW + M.COL[1]) / 2, (M.COL[1] + M.CW + M.COL[2]) / 2];

// ── 札 ────────────────────────────────────────────
// 紋章・組織名・肩書・所在。この四つが札の中にあれば、凡例へ戻らずに済む。
export function card(id, x, y, { w = M.CW, rows = [], dim = false } = {}) {
  const f = byId[id], c = catOf(id), r = ROLE[id] ?? { role: '', where: '' };
  const es = 8.6;                                   // 紋章の一辺
  const h = cardH(rows.length);
  const op = dim ? 0.5 : 1;
  // 名が長い項（各デイドラ王の信徒団・ペントゥス・オクラトゥス）は札からはみ出る。
  // 札を広げると全体の割り付けが崩れるので、字のほうを詰める。
  const nameSize = Math.min(3.25, (w - 15.4) / [...f.ja].length);
  const yc = y + M.CH / 2;

  let out = `<g class="rm-card" opacity="${op}">`
    + `<rect x="${x}" y="${y}" width="${w}" height="${h.toFixed(2)}" rx="0.8" `
    + `fill="#fbfaf6" stroke="${c.color}" stroke-width="0.28"/>`
    + `<rect x="${x}" y="${y}" width="1.9" height="${h.toFixed(2)}" rx="0.8" `
    + `fill="${c.color}" opacity="0.85"/>`
    + `<g transform="translate(${(x + 3.2).toFixed(2)} ${(yc - es / 2).toFixed(2)}) `
    + `scale(${(es / 120).toFixed(5)})">`
    + emblem(f.emblem, { scale: cal[id] ?? 1, extinct: f.extinct, color: c.color })
      .replace(/<svg[^>]*>|<\/svg>/g, '')
    + `</g>`
    + `<a data-to="${id}"><text x="${(x + 13.4).toFixed(1)}" y="${(yc - 1.2).toFixed(1)}" `
    + `font-size="${nameSize.toFixed(2)}" fill="${INK}" letter-spacing="0.02">${f.ja}</text></a>`
    + `<text x="${(x + 13.4).toFixed(1)}" y="${(yc + 2.6).toFixed(1)}" `
    + `font-size="2.25" fill="${MID}" letter-spacing="0.04">${r.role}</text>`
    + `<text x="${(x + w - 1.6).toFixed(1)}" y="${(yc + 5.4).toFixed(1)}" text-anchor="end" `
    + `font-size="1.95" fill="#8b8880" letter-spacing="0.04">${r.where}</text>`;

  // ── 関係の行 ──
  // 語・相手の名。行の左右どちらかの縁から、その関係の線が出る。
  if (rows.length) {
    out += `<path d="M ${(x + 2.6).toFixed(1)} ${(y + M.CH).toFixed(1)} `
      + `L ${(x + w - 2.6).toFixed(1)} ${(y + M.CH).toFixed(1)}" `
      + `stroke="${c.color}" stroke-width="0.2" opacity="0.5"/>`;
    rows.forEach((rw, i) => {
      const ry = y + M.CH + 1.6 + i * M.ROW;        // 行の上端
      const ty = ry + M.ROW * 0.72;                 // 文字のベースライン
      const nm = byId[rw.other].ja;
      const ns = Math.min(2.2, 25.2 / [...nm].length);
      // 語の側に小さな爪を打つ。線がどちら側へ出るかが行だけで分かる。
      const cx = rw.side > 0 ? x + w - 1.5 : x + 1.5;
      out += `<path d="M ${cx.toFixed(1)} ${(ry + M.ROW / 2 - 1).toFixed(1)} `
        + `L ${cx.toFixed(1)} ${(ry + M.ROW / 2 + 1).toFixed(1)}" `
        + `stroke="${INK}" stroke-width="0.5"/>`
        + `<text x="${(x + 4.2).toFixed(1)}" y="${ty.toFixed(1)}" `
        + `font-size="2.2" fill="${INK}" letter-spacing="0.04">${KINDS[rw.kind].ja}</text>`
        + `<text x="${(x + 13.4).toFixed(1)}" y="${ty.toFixed(1)}" `
        + `font-size="${ns.toFixed(2)}" fill="${MID}" letter-spacing="0.02">${nm}</text>`;
    });
  }
  return out + `</g>`;
}


// 矢。従属は上位を、派生は母体を指す。
const arrow = (x, y, dir) => {
  const a = { R: 0, L: 180, D: 90, U: 270 }[dir];
  return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${a})">`
    + `<path d="M -1.9 -1.5 L 0.9 0 L -1.9 1.5 Z" fill="${INK}"/></g>`;
};

const stroke = (kind) => {
  const k = KINDS[kind];
  return `stroke="${INK}" stroke-width="${kind === 'hostile' ? 0.55 : 0.4}" fill="none" `
    + `stroke-linejoin="round"` + (k.dash ? ` stroke-dasharray="1.9 1.4"` : '');
};

// ── 配線 ──────────────────────────────────────────
// 直交で引く。斜めに引くと、二本が交差したとき、どちらがどちらか分からなくなる。
// 直交なら交差は必ず直角になり、目で追える。
//
// 経路は最大で五点。
//   関係の行の縁 → 溝の通り道（縦） → 廊下（横） → 溝の通り道（縦） → 相手の行の縁
// 隣の列どうしなら通り道が一本で済み、三点に縮む。
//
// 線の上には文字を一つも置かない。語は札の中の行にある。

// 区間が重なるものだけを避けて、空いている道を返す。
function allot(bank, key, lo, hi, base, step, n = 13, span = Infinity) {
  const used = (bank[key] ??= []);
  for (let k = 0; k < n; k++) {
    const off = (k === 0 ? 0 : (k % 2 ? 1 : -1) * Math.ceil(k / 2) * step);
    if (Math.abs(off) > span) continue;
    const v = +(base + off).toFixed(2);
    if (!used.some((u) => u.v === v && !(hi < u.lo - 1.2 || lo > u.hi + 1.2))) {
      used.push({ v, lo, hi });
      return v;
    }
  }
  used.push({ v: base, lo, hi });
  return base;
}

// 溝の幅。通り道はこの内側にしか置けない。
const GUT = (M.COL[1] - (M.COL[0] + M.CW)) / 2 - 2.2;

function connect(A, B, kind, bank) {
  const dcol = B.col - A.col;
  const sideA = A.sideOf(B.id), sideB = B.sideOf(A.id);
  const ax = sideA > 0 ? A.x + M.CW : A.x;
  const bx = sideB > 0 ? B.x + M.CW : B.x;
  const ay = A.portOf(B.id), by = B.portOf(A.id);

  // 同じ高さで、あいだの列が空いていれば、まっすぐ引く。
  if (Math.abs(ay - by) < 0.4 && Math.abs(dcol) >= 1) {
    let clear = true;
    for (const c of bank.cards) {
      if (c.col <= Math.min(A.col, B.col) || c.col >= Math.max(A.col, B.col)) continue;
      if (ay > c.y0 - 1 && ay < c.y1 + 1) clear = false;
    }
    if (clear) {
      const dir = (kind === 'vassal' || kind === 'origin');
      return {
        svg: `<path d="M ${ax} ${ay.toFixed(2)} L ${bx} ${ay.toFixed(2)}" ${stroke(kind)}/>`
          + (dir ? arrow(bx + (sideB > 0 ? 1.5 : -1.5), ay, sideB > 0 ? 'L' : 'R') : ''),
        pts: [[ax, ay], [bx, ay]],
      };
    }
  }

  const gA = gutter[sideA > 0 ? Math.min(A.col, 1) : Math.max(A.col - 1, 0)];
  const gB = gutter[sideB > 0 ? Math.min(B.col, 1) : Math.max(B.col - 1, 0)];
  const lo = Math.min(ay, by), hi = Math.max(ay, by);
  const laneA = allot(bank.lane, gA, lo, hi, gA, 1.6, 21, GUT);
  const laneB = gA === gB ? laneA : allot(bank.lane, gB, lo, hi, gB, 1.6, 21, GUT);

  const pts = [[ax, ay], [laneA, ay]];
  if (laneA !== laneB) {
    // 廊下は、札のあいだの空きを通す。どの札とも重ならない高さを探す。
    const cor = allot(bank.cor, 'y', Math.min(laneA, laneB), Math.max(laneA, laneB),
      bank.corridor(A, B), 1.4, 9, (M.GAP - 1) / 2);
    pts.push([laneA, cor], [laneB, cor]);
  }
  pts.push([laneB, by], [bx, by]);

  const p = pts.filter((v, i) => i === 0 || v[0] !== pts[i - 1][0] || v[1] !== pts[i - 1][1]);
  const d = p.map((v, i) => `${i ? 'L' : 'M'} ${v[0].toFixed(2)} ${v[1].toFixed(2)}`).join(' ');
  const dir = (kind === 'vassal' || kind === 'origin');
  const tip = sideB > 0 ? { x: bx + 1.5, dir: 'L' } : { x: bx - 1.5, dir: 'R' };
  return {
    svg: `<path d="${d}" ${stroke(kind)}/>` + (dir ? arrow(tip.x, by, tip.dir) : ''),
    pts: p,
  };
}

// ── 凡例 ──────────────────────────────────────────
// 一枚ごとに刷る。巻頭に一度だけ載せる方式は、途中の頁を開いた読者に届かない。
// 語は札の中にあるので、ここでは語の意味と線の形だけを示す。
export function legend(x, y, { w = M.W } = {}) {
  const items = [
    ['hostile', '交戦している'],
    ['ally', '結んでいる'],
    ['vassal', '下位から上位へ'],
    ['origin', '母体を指す'],
    ['rival', '席を争うが交戦しない'],
  ];
  let out = `<rect x="${x}" y="${y}" width="${w}" height="13" rx="0.8" `
    + `fill="none" stroke="${MID}" stroke-width="0.2" opacity="0.55"/>`
    + `<text x="${x + 3}" y="${y + 5}" font-size="2.3" fill="${MID}" letter-spacing="0.14">関係の語</text>`
    + `<text x="${x + 3}" y="${y + 9.4}" font-size="1.85" fill="#8b8880">札の中に記す</text>`;
  items.forEach(([k, gloss], i) => {
    const cx = x + 26 + i * ((w - 30) / items.length);
    out += `<path d="M ${cx} ${y + 4.4} L ${cx + 9} ${y + 4.4}" ${stroke(k)}/>`;
    if (k === 'vassal' || k === 'origin') out += arrow(cx + 9, y + 4.4, 'R');
    out += `<text x="${cx}" y="${y + 8.4}" font-size="2.35" fill="${INK}">${KINDS[k].ja}</text>`
      + `<text x="${cx}" y="${y + 11.4}" font-size="1.9" fill="#8b8880">${gloss}</text>`;
  });
  return out;
}

// ── 検め ──────────────────────────────────────────
// 語が線から降りたので、見るのは一つだけになった。
//   線が札の下を通っていないか（通ると、どこへ繋がるか追えなくなる）
export function check(theme, place, wired) {
  const bad = [];
  const cards = theme.nodes.map((n) => ({
    id: n.id, x0: place[n.id].x, y0: place[n.id].y,
    x1: place[n.id].x + M.CW, y1: place[n.id].y + place[n.id].h,
  }));
  for (const w of wired) {
    for (let i = 1; i < w.pts.length; i++) {
      const [x0, y0] = w.pts[i - 1], [x1, y1] = w.pts[i];
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      for (const c of cards) {
        if (mx > c.x0 + 0.6 && mx < c.x1 - 0.6 && my > c.y0 + 0.6 && my < c.y1 - 0.6) {
          bad.push(`線が札を横切る　${c.id}`);
        }
      }
    }
  }
  // 版面に収まっているか。札が高くなると図が頁から出る。
  const bottom = Math.max(...cards.map((c) => c.y1));
  if (bottom > 196) bad.push(`図が版面から出る（下端 ${bottom.toFixed(0)}mm）`);

  // 札どうしが重なっていないか（背の高い札が下の札を押し潰していないか）
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const a = cards[i], b = cards[j];
      if (!(a.x1 <= b.x0 || b.x1 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0)) {
        bad.push(`札が重なる　${a.id}／${b.id}`);
      }
    }
  }
  return [...new Set(bad)];
}

// ── 主題別相関図 ─────────────────────────────────
export function themeSheet(theme) {
  const P = theme.pitch ?? M.PITCH, T = theme.top ?? M.TOP;
  const ids = new Set(theme.nodes.map((n) => n.id));

  // ── 引く辺を決める ──
  const drawn = new Set();
  const rels = [];
  for (const n of theme.nodes) {
    for (const r of edgesOf(n.id)) {
      if (!ids.has(r.other)) continue;
      // 分類の図では、その分類の組織が関わる辺だけに絞る（focus）。
      // 相手どうしの関係はこの図の主題ではなく、それぞれの分類の図に出る。
      if (theme.focus && !theme.focus.has(n.id) && !theme.focus.has(r.other)) continue;
      const key = [n.id, r.other].sort().join('|');
      if (drawn.has(key)) continue;
      drawn.add(key);
      const [a, b] = r.out ? [n.id, r.other] : [r.other, n.id];
      rels.push({ a, b, kind: r.kind });
    }
  }

  // ── 札の中の「関係の行」を作る ──
  // 行の順は相手の高さ順。こうすると、札から出た線どうしが札の脇で交差しない。
  const rowOf = Object.fromEntries(theme.nodes.map((n) => [n.id, n.row]));
  const colOf = Object.fromEntries(theme.nodes.map((n) => [n.id, n.col]));
  const rows = {};
  for (const r of rels) {
    for (const [me, you] of [[r.a, r.b], [r.b, r.a]]) {
      const d = colOf[you] - colOf[me];
      const side = d > 0 ? 1 : d < 0 ? -1 : (colOf[me] === 2 ? -1 : 1);
      (rows[me] ??= []).push({ kind: r.kind, other: you, side });
    }
  }
  for (const id of Object.keys(rows)) {
    rows[id].sort((u, v) => rowOf[u.other] - rowOf[v.other]
      || colOf[u.other] - colOf[v.other] || u.other.localeCompare(v.other));
  }

  // ── 置く ──
  // 札の高さが行数で変わるので、列ごとに上から積む。
  // 行の目安（row × 行送り）より下へは押すが、上へは戻さない。
  const place = {};
  for (const col of [0, 1, 2]) {
    const list = theme.nodes.filter((n) => n.col === col).sort((a, b) => a.row - b.row);
    let bottom = -Infinity;
    for (const n of list) {
      const h = cardH((rows[n.id] ?? []).length);
      const y = Math.max(T + n.row * P, bottom + M.GAP);
      place[n.id] = { ...n, id: n.id, x: M.COL[n.col], y, h, rows: rows[n.id] ?? [] };
      bottom = y + h;
    }
  }
  for (const id of Object.keys(place)) {
    const pl = place[id];
    pl.sideOf = (other) => (pl.rows.find((w) => w.other === other) ?? { side: 1 }).side;
    pl.portOf = (other) => {
      const i = pl.rows.findIndex((w) => w.other === other);
      return pl.y + M.CH + 1.6 + (i < 0 ? 0 : i) * M.ROW + M.ROW / 2;
    };
  }

  // ── 引く ──
  const cardBoxes = theme.nodes.map((n) => ({
    id: n.id, col: n.col, x0: place[n.id].x, y0: place[n.id].y,
    x1: place[n.id].x + M.CW, y1: place[n.id].y + place[n.id].h }));
  // 廊下の候補。札と札のあいだの空きを、列ごとに数え上げておく。
  // 横に走る線は、通る列すべてで空いている高さを選ばねばならない。
  const bandsOf = (col) => {
    const cs = cardBoxes.filter((c) => c.col === col).sort((a, b) => a.y0 - b.y0);
    const out = [];
    let prev = -1e4;
    for (const c of cs) { out.push([prev, c.y0]); prev = c.y1; }
    out.push([prev, 1e4]);
    return out;
  };
  const bands = [0, 1, 2].map(bandsOf);
  const freeAt = (y, c0, c1) => {
    for (let c = c0; c <= c1; c++) {
      if (!bands[c].some(([a, b]) => y > a + 1.6 && y < b - 1.6)) return false;
    }
    return true;
  };
  const bank = {
    lane: {}, cor: {}, cards: cardBoxes,
    corridor: (A, B) => {
      const c0 = Math.min(A.col, B.col), c1 = Math.max(A.col, B.col);
      const want = (A.portOf(B.id) + B.portOf(A.id)) / 2;
      const cand = [];
      for (let c = c0; c <= c1; c++) {
        for (const [a, b] of bands[c]) {
          const y = Math.max(a + 3, Math.min(b - 3, want));
          if (y > a + 1.6 && y < b - 1.6) cand.push(y);
        }
      }
      cand.sort((u, v) => Math.abs(u - want) - Math.abs(v - want));
      return cand.find((y) => freeAt(y, c0, c1)) ?? want;
    },
  };
  rels.sort((p, q) => {
    const d = (r) => Math.abs(place[r.a].y - place[r.b].y) + Math.abs(place[r.a].col - place[r.b].col) * 30;
    return d(q) - d(p);
  });
  const wired = rels.map((r) => connect(place[r.a], place[r.b], r.kind, bank));
  const wires = wired.map((w) => w.svg).join('');
  themeSheet.report = check(theme, place, wired);

  let cards = '';
  for (const n of theme.nodes) {
    cards += card(n.id, place[n.id].x, place[n.id].y, { rows: place[n.id].rows });
  }

  // 高さは図の中身に合わせて決める。
  const bottom = Math.max(...theme.nodes.map((n) => place[n.id].y + place[n.id].h));
  const noteH = Math.ceil([...theme.note].length / 62) * 4.1 + 1.5;
  const noteY = bottom + 11;
  const legY = noteY + noteH + 5;
  const H = Math.max(M.H, legY + 15);

  return `<svg class="relmap" viewBox="0 0 ${M.W} ${H.toFixed(1)}" xmlns="http://www.w3.org/2000/svg" `
    + `font-family="Noto Serif JP, serif">`
    + `<text x="0" y="6.6" font-size="5.6" fill="${INK}" letter-spacing="0.1">`
    + `${theme.kind ?? '主題'} ${theme.n}　${theme.ja}</text>`
    + `<text x="${M.W}" y="6.2" text-anchor="end" font-size="2.6" fill="${MID}" `
    + `letter-spacing="0.28">${theme.en}</text>`
    + `<path d="M 0 9.4 L ${M.W} 9.4" stroke="${INK}" stroke-width="0.35"/>`
    + `<foreignObject x="0" y="12" width="${M.W}" height="26">`
    + `<div xmlns="http://www.w3.org/1999/xhtml" class="rm-lead">${theme.lead}</div>`
    + `</foreignObject>`
    + wires + cards
    + `<foreignObject x="0" y="${noteY.toFixed(1)}" width="${M.W}" height="${(noteH + 2).toFixed(1)}">`
    + `<div xmlns="http://www.w3.org/1999/xhtml" class="rm-note">${theme.note}</div>`
    + `</foreignObject>`
    + legend(0, legY)
    + `</svg>`;
}


// ── 分類相関図 ────────────────────────────────────
// 主題別の図は「何が起きているか」で束ねる。こちらは「その分類がどこと繋がるか」を見る。
// 中央にその分類の組織、左右に相手を置く。
//
// ── 割り方について ────────────────────────────────
// 札の高さは関係の行数で決まるので、辺を十三本持つ帝国軍の札は七十ミリになる。
// 分類 II の六項をそのまま一枚に並べると、中央の列だけで二百三十ミリを超える。
// そこで**相手ではなく成員のほうで割る**。
// 一枚に載せる成員を、中央の列が百九十ミリに収まる範囲で選び、
// その成員の相手をすべて左右に置く。
// こうすると、どの成員も「自分の関係が全部見える一枚」を必ず持つ。

const CENTRE_BUDGET = 150;    // 中央の列に許す高さ
const SIDE_MAX = 7;           // 片側に置ける相手の数

// 成員を、中央の列が予算に収まるように束ねる。
function groupMembers(cat) {
  const mine = factions.filter((f) => f.cat === cat.id).map((f) => f.id);
  const mineSet = new Set(mine);
  const degOf = (id) => edgesOf(id).length;
  const groups = [];
  let cur = [], h = 0, partners = new Set();
  for (const id of mine) {
    const ch = cardH(degOf(id));
    const p = edgesOf(id).filter((r) => !mineSet.has(r.other)).map((r) => r.other);
    const nextP = new Set([...partners, ...p]);
    // 左右の列の高さも見る。相手の札は関係の行の数だけ高くなる。
    const sideH = (set) => {
      const hs = [...set].map((q) => cardH(
        edgesOf(q).filter((r) => mineSet.has(r.other)).length || 1));
      hs.sort((u, v) => v - u);
      const col = [0, 0];
      for (const v of hs) { const k = col[0] <= col[1] ? 0 : 1; col[k] += v + M.GAP; }
      return Math.max(col[0], col[1]);
    };
    const tooTall = cur.length && h + M.GAP + ch > CENTRE_BUDGET;
    const tooWide = cur.length
      && (nextP.size > SIDE_MAX * 2 || sideH(nextP) > CENTRE_BUDGET);
    if (tooTall || tooWide) {
      groups.push(cur); cur = []; h = 0; partners = new Set();
    }
    cur.push(id); h += (h ? M.GAP : 0) + ch;
    for (const q of p) partners.add(q);
  }
  if (cur.length) groups.push(cur);
  return groups;
}

// 漢数字。'一二三四五' を添字で引く書き方は、六枚目が出た日に undefined を刷る。
const KN = '〇一二三四五六七八九';
const kanji = (n) => (n < 10 ? KN[n]
  : n < 20 ? '十' + (n % 10 ? KN[n % 10] : '')
  : KN[Math.floor(n / 10)] + '十' + (n % 10 ? KN[n % 10] : ''));

export function categoryTheme(cat, group, part = 0, parts = 1, only = null) {
  const mineAll = new Set(factions.filter((f) => f.cat === cat.id).map((f) => f.id));
  const mine = group;
  const shown = new Set(mine);
  const outer = new Map();
  for (const id of mine) {
    for (const r of edgesOf(id)) {
      if (shown.has(r.other)) continue;
      if (!outer.has(r.other)) outer.set(r.other, []);
      outer.get(r.other).push(mine.indexOf(id));
    }
  }
  // 相手は、繋がる先の平均の高さの順に並べ替えてから左右へ割る。交差がその分だけ減る。
  let others = [...outer.keys()].sort((a, b) => {
    const m = (id) => outer.get(id).reduce((s, v) => s + v, 0) / outer.get(id).length;
    return m(a) - m(b) || a.localeCompare(b);
  });
  if (only) others = others.filter((id) => only.has(id));
  const L = others.filter((_, i) => i % 2 === 0);
  const R = others.filter((_, i) => i % 2 === 1);
  const rows = Math.max(mine.length, L.length, R.length, 6);

  const nodes = [];
  const spread = Math.max(1, Math.floor(rows / mine.length));
  mine.forEach((id, i) => nodes.push({ id, col: 1, row: Math.min(i * spread, rows - 1) }));
  const spreadRow = (i, n) => (n <= 1 ? 0 : Math.round(i * (rows - 1) / (n - 1)));
  L.forEach((id, i) => nodes.push({ id, col: 0, row: spreadRow(i, L.length) }));
  R.forEach((id, i) => nodes.push({ id, col: 2, row: spreadRow(i, R.length) }));

  const total = factions.filter((f) => f.cat === cat.id).length;
  return {
    key: 'cat' + cat.id + (parts > 1 ? '-' + (part + 1) : ''),
    kind: '分類', n: cat.n,
    ja: cat.ja + (parts > 1 ? `（${kanji(part + 1)}）` : ''),
    en: cat.en, focus: new Set(mine),
    lead: cat.note + `本書はこの分類に ${total} 項を収めた。`
      + (parts > 1
        ? `札の高さが関係の数で決まるため、${kanji(parts)} 枚に割った。`
          + `これはその ${kanji(part + 1)} 枚目で、`
          + `${mine.map((id) => byId[id].ja).join('・')} の ${mine.length} 項を中央に置く。`
        : '中央がこの分類の組織、左右がその相手である。')
      + `左右の ${others.length} 組織が、その相手である。`,
    nodes,
    note: '左右に置いた組織は、それぞれ別の分類に属する。'
      + '札の左端の色がその分類を示す（前付「分類について」の色と同じ）。'
      + '中央の組織については、その組織が持つ関係をすべてこの一枚に載せている。'
      + '左右の組織の関係は、その組織の属する分類の図に出る。',
    pitch: 11, top: 32,
    focusMembers: mineAll,
  };
}

// 一項だけで相手が多すぎる場合（帝国軍は十三本持つ）は、
// 同じ成員のまま相手のほうを割る。成員の関係が二枚にまたがるが、
// 一枚に詰めて版面から出すよりは読める。
export function categorySheets(cat) {
  const groups = groupMembers(cat);
  const mineSet = new Set(factions.filter((f) => f.cat === cat.id).map((f) => f.id));
  const sheets = [];
  for (const g of groups) {
    const gs = new Set(g);
    const partners = [];
    for (const id of g) {
      for (const r of edgesOf(id)) if (!gs.has(r.other) && !partners.includes(r.other)) {
        partners.push(r.other);
      }
    }
    const hOf = (q) => cardH(edgesOf(q).filter((r) => mineSet.has(r.other)).length || 1) + M.GAP;
    const stack = (list) => {
      const hs = list.map(hOf).sort((u, v) => v - u);
      const col = [0, 0];
      for (const v of hs) { const k = col[0] <= col[1] ? 0 : 1; col[k] += v; }
      return Math.max(col[0], col[1]);
    };
    let n = 1;
    while (n < 4 && stack(partners.filter((_, i) => i % n === 0)) > CENTRE_BUDGET) n++;
    for (let i = 0; i < n; i++) {
      sheets.push({ g, only: n === 1 ? null : new Set(partners.filter((_, k) => k % n === i)) });
    }
  }
  return sheets.map((sh, i) =>
    categoryTheme(cat, sh.g, i, sheets.length, sh.only));
}

export const relmapCss = () => `
.relmap { width:174mm; display:block; }
.rm-lead { font-family:'Noto Serif JP',serif; font-size:2.9px; line-height:1.62;
           color:#3a3833; letter-spacing:.02em; text-align:justify; }
.rm-note { font-family:'Noto Serif JP',serif; font-size:2.55px; line-height:1.6;
           color:#5c5a54; letter-spacing:.02em; text-align:justify;
           border-left:.5px solid #b9b5aa; padding-left:3px; }
`;

export { THEMES };
