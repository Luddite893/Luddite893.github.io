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
//   二　線に**語**を書く。敵対・同盟・従属・派生・反目を、そのまま刷る。
//   三　一枚あたり八〜十枚の札に絞る。頁数の制約は外していただいた。
//   四　主題ごとに図を立てる。分類ではなく、**何が起きているか**で束ねる。
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
  CW: 44, CH: 13,              // 札
  COL: [2, 65, 128],           // 三列。列間の溝は 19mm
  PITCH: 19,                   // 行送り。札の下に 6mm 空く
  TOP: 40,                     // 図の始まり
};
const gutter = [(M.COL[0] + M.CW + M.COL[1]) / 2, (M.COL[1] + M.CW + M.COL[2]) / 2];

// ── 札 ────────────────────────────────────────────
// 紋章・組織名・肩書・所在。この四つが札の中にあれば、凡例へ戻らずに済む。
export function card(id, x, y, { w = M.CW, h = M.CH, dim = false } = {}) {
  const f = byId[id], c = catOf(id), r = ROLE[id] ?? { role: '', where: '' };
  const es = 8.6;                                   // 紋章の一辺
  // 名が長い項（各デイドラ王の信徒団・ペントゥス・オクラトゥス）は札からはみ出る。
  // 札を広げると全体の割り付けが崩れるので、字のほうを詰める。
  const nameSize = Math.min(3.25, (w - 15.4) / [...f.ja].length);
  const op = dim ? 0.5 : 1;
  const yc = y + Math.min(h, M.CH) / 2;            // 字と紋章は上寄せ。背が高くても頭で揃える。
  return `<g class="rm-card" opacity="${op}">`
    + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0.8" `
    + `fill="#fbfaf6" stroke="${c.color}" stroke-width="0.28"/>`
    + `<rect x="${x}" y="${y}" width="1.9" height="${h}" rx="0.8" fill="${c.color}" opacity="0.85"/>`
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
    + `font-size="1.95" fill="#8b8880" letter-spacing="0.04">${r.where}</text>`
    + `</g>`;
}

// ── 線の語 ────────────────────────────────────────
// 白地の札を線の上に置き、その中に語を刷る。線は札の下で切れて見える。
//
// 札の多い図では語を一割詰める。詰めないと、行間の余りに収まらない。
// 二割詰めると刷り上がりで読めなくなるので、一割で止める。
let SC = 1;
export const chipSize = (kind) => ({
  w: KINDS[kind].ja.length * 2.35 * SC + 2.4 * SC, h: 4.3 * SC });

function chip(cx, cy, kind) {
  const t = KINDS[kind].ja;
  const { w, h } = chipSize(kind);
  return `<g class="rm-chip">`
    + `<rect x="${(cx - w / 2).toFixed(2)} " y="${(cy - h / 2).toFixed(2)}" width="${w.toFixed(2)}" height="${h}" `
    + `rx="0.6" fill="#fbfaf6" stroke="${INK}" stroke-width="0.18" opacity="0.96"/>`
    + `<text x="${cx.toFixed(2)}" y="${(cy + 0.85).toFixed(2)}" text-anchor="middle" `
    + `font-size="${(2.35 * SC).toFixed(2)}" fill="${INK}" letter-spacing="0.06">${t}</text></g>`;
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
//   札の縁 → 溝の通り道（縦） → 行間の廊下（横） → 溝の通り道（縦） → 札の縁
// 隣の列どうしなら通り道が一本で済み、三点に縮む。同じ列なら廊下が要らない。
//
// 通り道と廊下は、区間が重なる線どうしで必ず別のものを割り当てる。
// 番号順に配るだけでは、離れた二本が同じ道を使えず、すぐ溝が尽きる。

// 区間が重なるものだけを避けて、空いている道を返す。
function allot(bank, key, lo, hi, base, step, n = 9, span = Infinity) {
  const used = (bank[key] ??= []);
  for (let k = 0; k < n; k++) {
    const off = (k === 0 ? 0 : (k % 2 ? 1 : -1) * Math.ceil(k / 2) * step);
    if (Math.abs(off) > span) continue;
    const v = +(base + off).toFixed(2);
    if (!used.some((u) => u.v === v && !(hi < u.lo - 1.5 || lo > u.hi + 1.5))) {
      used.push({ v, lo, hi });
      return v;
    }
  }
  used.push({ v: base, lo, hi });
  return base;
}

// 溝の幅。通り道はこの内側にしか置けない。
const GUT = (M.COL[1] - (M.COL[0] + M.CW)) / 2 - 2.2;

// 行と行のあいだの廊下。札の高さ 13、行送り 19 なので 6mm 空いている。
const corridorY = (A, B) => {
  const r = Math.min(A.row, B.row);
  const pitch = A.pitch ?? M.PITCH;
  return (A.top ?? M.TOP) + r * pitch + M.CH + (pitch - M.CH) / 2;
};


// 経路のうち、どの札にも掛からない区間でいちばん長いものを返す。
// 語はここに置く。長い線分の真ん中に置くだけでは、札の上に乗ることがある。
function freeRuns(p, cards = [], kind = 'ally') {
  const runs = [];
  for (let i = 1; i < p.length; i++) {
    const [x0, y0] = p[i - 1], [x1, y1] = p[i];
    const horiz = Math.abs(x1 - x0) >= Math.abs(y1 - y0);
    const a = horiz ? Math.min(x0, x1) : Math.min(y0, y1);
    const b = horiz ? Math.max(x0, x1) : Math.max(y0, y1);
    // 札が覆う区間を抜く
    const cut = [];
    // 語は幅を持つ。線が札を外れていても、語が札に掛かることがある。
    // 線分を語の幅の帯として扱い、その帯が札に触れる範囲を抜く。
    const { w: cw, h: ch } = chipSize(kind);
    const pad = horiz ? ch / 2 + 0.6 : cw / 2 + 0.6;
    for (const c of cards) {
      const across = horiz ? (y0 > c.y0 - pad && y0 < c.y1 + pad)
        : (x0 > c.x0 - pad && x0 < c.x1 + pad);
      if (!across) continue;
      const bite = horiz ? cw / 2 + 0.6 : ch / 2 + 0.6;
      const lo = horiz ? c.x0 - bite : c.y0 - bite, hi = horiz ? c.x1 + bite : c.y1 + bite;
      if (hi > a && lo < b) cut.push([Math.max(a, lo), Math.min(b, hi)]);
    }
    cut.sort((u, v) => u[0] - v[0]);
    let cur = a;
    const free = [];
    for (const [lo, hi] of cut) { if (lo > cur) free.push([cur, lo]); cur = Math.max(cur, hi); }
    if (cur < b) free.push([cur, b]);
    for (const [lo, hi] of free) {
      runs.push({ len: hi - lo,
        seg: horiz ? [[lo, y0], [hi, y0]] : [[x0, lo], [x0, hi]] });
    }
  }
  runs.sort((a, b) => b.len - a.len);
  return runs.length ? runs : [{ len: 0, seg: [p[0], p[1]] }];
}
const freeSeg = (p, cards, kind) => freeRuns(p, cards, kind)[0].seg;

function connect(A, B, kind, bank) {
  const dcol = B.col - A.col;

  // 同じ行で、あいだの列が空いているなら、まっすぐ引く。
  // 折れる必要のない線を折ると、読者は「なぜ折れたのか」を考えてしまう。
  if (A.row === B.row && Math.abs(dcol) >= 1) {
    let clear = true;
    for (let c = Math.min(A.col, B.col) + 1; c < Math.max(A.col, B.col); c++) {
      if (bank.at.has(`${c},${A.row}`)) clear = false;
    }
    if (clear) {
      const y = A.y + A.h / 2;
      const x0 = dcol > 0 ? A.x + M.CW : A.x, x1 = dcol > 0 ? B.x : B.x + M.CW;
      const seg = freeSeg([[x0, y], [x1, y]], bank.cards, kind);
      const dir = (kind === 'vassal' || kind === 'origin');
      return {
        svg: `<path d="M ${x0} ${y} L ${x1} ${y}" ${stroke(kind)}/>`
          + (dir ? arrow(x1 + (dcol > 0 ? -1.5 : 1.5), y, dcol > 0 ? 'R' : 'L') : ''),
        pts: seg,
        label: { kind, seg, path: [[x0, y], [x1, y]],
          cx: (seg[0][0] + seg[1][0]) / 2, cy: (seg[0][1] + seg[1][1]) / 2 },
      };
    }
  }

  // 出る辺を決める。相手のいる側から出す。同じ列なら近い溝へ出す。
  const sideA = dcol > 0 ? 1 : dcol < 0 ? -1 : (A.col === 2 ? -1 : 1);
  const sideB = dcol > 0 ? -1 : dcol < 0 ? 1 : sideA;
  const ax = sideA > 0 ? A.x + M.CW : A.x;
  const bx = sideB > 0 ? B.x + M.CW : B.x;
  const ay = A.y + A.port(sideA, B);
  const by = B.y + B.port(sideB, A);

  // 縦の通り道。溝は列のあいだに一本ずつ。
  const gA = gutter[sideA > 0 ? Math.min(A.col, 1) : Math.max(A.col - 1, 0)];
  const gB = gutter[sideB > 0 ? Math.min(B.col, 1) : Math.max(B.col - 1, 0)];
  const lo = Math.min(ay, by), hi = Math.max(ay, by);
  const laneA = allot(bank.lane, gA, lo, hi, gA, 1.7, 19, GUT);
  const laneB = gA === gB ? laneA : allot(bank.lane, gB, lo, hi, gB, 1.7, 19, GUT);

  const pts = [[ax, ay], [laneA, ay]];
  let cor = null;
  if (laneA !== laneB) {
    cor = allot(bank.cor, 'y', Math.min(laneA, laneB), Math.max(laneA, laneB),
      corridorY(A, B), 1.5, 7, ((A.pitch ?? M.PITCH) - M.CH) / 2 - 1);
    pts.push([laneA, cor], [laneB, cor]);
  }
  pts.push([laneB, by], [bx, by]);

  // 同じ点が続いたら畳む。畳まないと 0 長の線分が矢の向きを狂わせる。
  const p = pts.filter((v, i) => i === 0 || v[0] !== pts[i - 1][0] || v[1] !== pts[i - 1][1]);
  const d = p.map((v, i) => `${i ? 'L' : 'M'} ${v[0].toFixed(2)} ${v[1].toFixed(2)}`).join(' ');

  const seg = freeSeg(p, bank.cards, kind);

  const dir = (kind === 'vassal' || kind === 'origin');
  const tip = sideB > 0 ? { x: bx + 1.5, y: by, dir: 'L' } : { x: bx - 1.5, y: by, dir: 'R' };
  return {
    svg: `<path d="${d}" ${stroke(kind)}/>` + (dir ? arrow(tip.x, tip.y, tip.dir) : ''),
    pts: p,
    label: { kind, seg, path: p,
      cx: (seg[0][0] + seg[1][0]) / 2, cy: (seg[0][1] + seg[1][1]) / 2 },
  };
}

// ── 語の札が重ならないようにする ────────────────────
// 位置を決めたあとで見直す。重なった二枚は、載っている線分の上をずらす。
// 線分から出さないので、どの線の語かは動かしても分かる。
function spreadLabels(labels, cards = []) {
  const box = (L) => {
    const { w, h } = chipSize(L.kind);
    return [L.cx - (w + 1) / 2, L.cy - (h + 0.9) / 2, L.cx + (w + 1) / 2, L.cy + (h + 0.9) / 2];
  };
  const hit = (a, b) => !(a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]);
  const cbox = cards.map((c) => [c.x0 - 0.8, c.y0 - 0.8, c.x1 + 0.8, c.y1 + 0.8]);
  const nudge = (L, sign) => {
    const [[x0, y0], [x1, y1]] = L.seg;
    const horiz = Math.abs(x1 - x0) >= Math.abs(y1 - y0);
    const len = horiz ? Math.abs(x1 - x0) : Math.abs(y1 - y0);
    const room = len / 2 - (horiz ? chipSize(L.kind).w / 2 + 1.2 : chipSize(L.kind).h / 2 + 1.2);
    if (room <= 1) return false;
    const step = sign * Math.min(3.2, room);
    if (horiz) L.cx = Math.min(Math.max(L.cx + step, Math.min(x0, x1) + 5), Math.max(x0, x1) - 5);
    else L.cy = Math.min(Math.max(L.cy + step, Math.min(y0, y1) + 3.4), Math.max(y0, y1) - 3.4);
    return true;
  };
  for (let pass = 0; pass < 30; pass++) {
    let moved = false;
    // まず組織の札から逃がす。語が札に掛かるのがいちばん読みにくい。
    for (const L of labels) {
      for (const c of cbox) {
        if (!hit(box(L), c)) continue;
        const away = (L.cy < (c[1] + c[3]) / 2) ? -1 : 1;
        const keep = { cx: L.cx, cy: L.cy };
        if (nudge(L, away) && !hit(box(L), c)) { moved = true; continue; }
        Object.assign(L, keep);
        if (nudge(L, -away) && !hit(box(L), c)) { moved = true; continue; }
        Object.assign(L, keep);
        // 線分の上では逃げられない。経路の別の区間へ移す。
        const w = chipSize(L.kind).w + 1;
        for (const run of freeRuns(L.path, cards, L.kind)) {
          if (run.len < w + 2) continue;
          const cx = (run.seg[0][0] + run.seg[1][0]) / 2;
          const cy = (run.seg[0][1] + run.seg[1][1]) / 2;
          const probe = { ...L, cx, cy };
          if (cbox.some((b) => hit(box(probe), b))) continue;
          Object.assign(L, { cx, cy, seg: run.seg });
          moved = true;
          break;
        }
      }
    }
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        if (!hit(box(labels[i]), box(labels[j]))) continue;
        for (const L of [labels[i], labels[j]]) {
          const [[x0, y0], [x1, y1]] = L.seg;
          const horiz = Math.abs(x1 - x0) >= Math.abs(y1 - y0);
          const len = horiz ? Math.abs(x1 - x0) : Math.abs(y1 - y0);
          const room = len / 2 - (horiz ? chipSize(L.kind).w / 2 + 1.2 : chipSize(L.kind).h / 2 + 1.2);
          if (room <= 1) continue;
          const step = (L === labels[i] ? -1 : 1) * Math.min(3.2, room);
          if (horiz) L.cx = Math.min(Math.max(L.cx + step, Math.min(x0, x1) + 5), Math.max(x0, x1) - 5);
          else L.cy = Math.min(Math.max(L.cy + step, Math.min(y0, y1) + 3.4), Math.max(y0, y1) - 3.4);
          moved = true;
        }
      }
    }
    if (!moved) break;
  }

  // それでも重なるものは、同じ経路の別の区間へ移す。
  // 線分の上を滑らせるだけでは、短い区間に置かれた語が逃げ場を失う。
  for (let pass = 0; pass < 6; pass++) {
    let moved = false;
    for (const L of labels) {
      const others = labels.filter((o) => o !== L);
      if (!others.some((o) => hit(box(L), box(o))) && !cbox.some((c) => hit(box(L), c))) continue;
      const w = chipSize(L.kind).w + 1;
      let bestV = -1, best = null;
      for (const run of freeRuns(L.path, cards, L.kind)) {
        if (run.len < w + 2) continue;
        const cx = (run.seg[0][0] + run.seg[1][0]) / 2, cy = (run.seg[0][1] + run.seg[1][1]) / 2;
        const probe = { ...L, cx, cy };
        if (cbox.some((c) => hit(box(probe), c))) continue;
        const near = Math.min(...others.map((o) => Math.hypot(o.cx - cx, o.cy - cy)), 999);
        if (near > bestV) { bestV = near; best = { cx, cy, seg: run.seg }; }
      }
      if (best && bestV > 5.5) { Object.assign(L, best); moved = true; }
    }
    if (!moved) break;
  }

  // 語どうしがなお重なるものは、経路の別の区間へ移す（札は避ける）。
  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    for (let i = 0; i < labels.length; i++) {
      const L = labels[i];
      const others = labels.filter((o) => o !== L);
      if (!others.some((o) => hit(box(L), box(o)))) continue;
      const keep = { cx: L.cx, cy: L.cy, seg: L.seg };
      let placed = false;
      for (const run of freeRuns(L.path, cards, L.kind)) {
        const need = (Math.abs(run.seg[1][0] - run.seg[0][0])
          >= Math.abs(run.seg[1][1] - run.seg[0][1])
          ? chipSize(L.kind).w : chipSize(L.kind).h) + 1.5;
        if (run.len < need) continue;
        const cx = (run.seg[0][0] + run.seg[1][0]) / 2;
        const cy = (run.seg[0][1] + run.seg[1][1]) / 2;
        const probe = { ...L, cx, cy };
        if (cbox.some((c) => hit(box(probe), c))) continue;
        if (others.some((o) => hit(box(probe), box(o)))) continue;
        Object.assign(L, { cx, cy, seg: run.seg });
        placed = true; moved = true;
        break;
      }
      if (!placed) Object.assign(L, keep);
    }
    if (!moved) break;
  }

  // 締めに、札へ掛かったものだけをもう一度逃がす。
  // 語どうしをほどく途中で、札の上へ押し戻されたものが残る。
  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    for (const L of labels) {
      if (!cbox.some((c) => hit(box(L), c))) continue;
      const keep = { cx: L.cx, cy: L.cy };
      for (const sign of [1, -1, 2, -2]) {
        Object.assign(L, keep);
        if (nudge(L, sign * 1.6) && !cbox.some((c) => hit(box(L), c))) { moved = true; break; }
      }
      if (!moved) Object.assign(L, keep);
    }
    if (!moved) break;
  }
  return labels;
}

// ── 凡例 ──────────────────────────────────────────
// 一枚ごとに刷る。巻頭に一度だけ載せる方式は、途中の頁を開いた読者に届かない。
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
    + `<text x="${x + 3}" y="${y + 5}" font-size="2.3" fill="${MID}" letter-spacing="0.14">線の読み方</text>`;
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
// 目では拾えないものだけを出す。
//   一　線が札の下を通っていないか（通ると、どこへ繋がるか追えなくなる）
//   二　語の札どうしが重なっていないか
//   三　語の札が組織の札に掛かっていないか
export function check(theme, place, wired, labels) {
  const bad = [];
  const cards = theme.nodes.map((n) => ({
    id: n.id, x0: place[n.id].x, y0: place[n.id].y,
    x1: place[n.id].x + M.CW, y1: place[n.id].y + place[n.id].h,
  }));
  const inside = (c, x, y, pad = 0) =>
    x > c.x0 + pad && x < c.x1 - pad && y > c.y0 + pad && y < c.y1 - pad;

  for (const w of wired) {
    for (let i = 1; i < w.pts.length; i++) {
      const [x0, y0] = w.pts[i - 1], [x1, y1] = w.pts[i];
      for (const c of cards) {
        // 端点が自分の札の縁にある線分は数えない。
        if (inside(c, (x0 + x1) / 2, (y0 + y1) / 2, 0.6)) {
          bad.push(`線が札を横切る　${c.id}`);
        }
      }
    }
  }
  const box = (L) => {
    const { w, h } = chipSize(L.kind);
    return [L.cx - w / 2, L.cy - h / 2, L.cx + w / 2, L.cy + h / 2];
  };
  const hit = (a, b) => !(a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]);
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      if (hit(box(labels[i]), box(labels[j]))) {
        bad.push(`語が重なる　${KINDS[labels[i].kind].ja}／${KINDS[labels[j].kind].ja}`);
      }
    }
    const b = box(labels[i]);
    for (const c of cards) {
      if (!(b[2] < c.x0 || c.x1 < b[0] || b[3] < c.y0 || c.y1 < b[1])) {
        bad.push(`語が札に掛かる　${KINDS[labels[i].kind].ja} → ${c.id}`);
      }
    }
  }
  return [...new Set(bad)];
}

// ── 主題別相関図 ─────────────────────────────────
export function themeSheet(theme) {
  SC = theme.chip ?? 1;
  const P = theme.pitch ?? M.PITCH, T = theme.top ?? M.TOP;
  const place = {};
  for (const n of theme.nodes) {
    // 辺を多く持つ札は背を高くする。十三本の線を高さ十三ミリの縁から出すと、
    // 出入口の間隔が一ミリを切り、どれがどれか分からなくなる。
    const h = M.CH + (n.tall ?? 0) * P;
    place[n.id] = { ...n, x: M.COL[n.col], y: T + n.row * P, h, pitch: P, top: T };
  }
  const ids = new Set(theme.nodes.map((n) => n.id));

  // この図に載っている組織どうしの辺だけを引く。外へ出る辺は引かない。
  //
  // 分類の図では、さらに「その分類の組織が関わる辺」だけに絞る（focus）。
  // 相手どうしの関係は、この図の主題ではない。それぞれの分類の図に出る。
  // 絞らないと、左右の相手を結ぶ線が中央の列を横切り、いちばん見せたい
  // 中央の組織が線に埋もれる。
  const drawn = new Set();
  const rels = [];
  for (const id of ids) {
    for (const r of edgesOf(id)) {
      if (!ids.has(r.other)) continue;
      if (theme.focus && !theme.focus.has(id) && !theme.focus.has(r.other)) continue;
      const key = [id, r.other].sort().join('|');
      if (drawn.has(key)) continue;
      drawn.add(key);
      // 向きのある関係は、辺の定義どおり from → to で描く。
      const [a, b] = r.out ? [id, r.other] : [r.other, id];
      rels.push({ a, b, kind: r.kind });
    }
  }

  // ── 札の縁に出入口を割る ──────────────────────────
  // 一枚の札から何本も出るとき、すべてを札の中心から出すと線が重なる。
  // 縁の高さを人数で割り、相手の上下の順に並べて配る。
  const ports = {};
  for (const r of rels) {
    for (const [me, you] of [[r.a, r.b], [r.b, r.a]]) {
      const dcol = place[you].col - place[me].col;
      const side = dcol > 0 ? 1 : dcol < 0 ? -1 : (place[me].col === 2 ? -1 : 1);
      ((ports[me] ??= {})[side] ??= []).push(you);
    }
  }
  for (const id of Object.keys(ports)) {
    for (const s of Object.keys(ports[id])) {
      ports[id][s].sort((u, v) => place[u].row - place[v].row);
    }
  }
  for (const id of Object.keys(place)) {
    place[id].port = (side, other) => {
      const list = ports[id]?.[side] ?? [];
      const i = list.indexOf(other.id ?? other);
      const n = list.length || 1;
      return place[id].h * ((i < 0 ? 0 : i) + 1) / (n + 1);
    };
    place[id].id = id;
  }

  const cardBoxes = theme.nodes.map((n) => ({
    x0: place[n.id].x, y0: place[n.id].y,
    x1: place[n.id].x + M.CW, y1: place[n.id].y + place[n.id].h }));
  const bank = { lane: {}, cor: {}, cards: cardBoxes,
    at: new Set(theme.nodes.map((n) => `${n.col},${n.row}`)) };
  // 長い辺から引く。短い辺を先に引くと、長い辺の通り道が塞がる。
  rels.sort((p, q) => {
    const d = (r) => Math.abs(place[r.a].row - place[r.b].row) * 4
      + Math.abs(place[r.a].col - place[r.b].col);
    return d(q) - d(p);
  });
  const wired = rels.map((r) => connect(place[r.a], place[r.b], r.kind, bank));
  const wires = wired.map((w) => w.svg).join('');
  const labels = spreadLabels(wired.map((w) => w.label), cardBoxes);
  const chips = labels.map((L) => chip(L.cx, L.cy, L.kind)).join('');

  // 線が札の下を通っていないか検める。通っていれば配置のほうを直す。
  themeSheet.report = check(theme, place, wired, labels);

  let cards = '';
  for (const n of theme.nodes) {
    cards += card(n.id, place[n.id].x, place[n.id].y, { h: place[n.id].h });
  }

  // 高さは図の中身に合わせて決める。
  // 一定にすると、札の多い主題で註と凡例が重なる。
  const bottom = Math.max(...theme.nodes.map((n) => place[n.id].y + place[n.id].h));
  const noteH = Math.ceil([...theme.note].length / 62) * 4.1 + 1.5;
  const noteY = bottom + 11;
  const legY = noteY + noteH + 5;
  const H = Math.max(M.H, legY + 15);

  return `<svg class="relmap" viewBox="0 0 ${M.W} ${H}" xmlns="http://www.w3.org/2000/svg" `
    + `font-family="Noto Serif JP, serif">`
    + `<text x="0" y="6.6" font-size="5.6" fill="${INK}" letter-spacing="0.1">`
    + `${theme.kind ?? '主題'} ${theme.n}　${theme.ja}</text>`
    + `<text x="${M.W}" y="6.2" text-anchor="end" font-size="2.6" fill="${MID}" `
    + `letter-spacing="0.28">${theme.en}</text>`
    + `<path d="M 0 9.4 L ${M.W} 9.4" stroke="${INK}" stroke-width="0.35"/>`
    + `<foreignObject x="0" y="12" width="${M.W}" height="26">`
    + `<div xmlns="http://www.w3.org/1999/xhtml" class="rm-lead">${theme.lead}</div>`
    + `</foreignObject>`
    + wires + chips + cards
    + `<foreignObject x="0" y="${noteY}" width="${M.W}" height="${noteH + 2}">`
    + `<div xmlns="http://www.w3.org/1999/xhtml" class="rm-note">${theme.note}</div>`
    + `</foreignObject>`
    + legend(0, legY)
    + `</svg>`;
}


// ── 分類相関図 ────────────────────────────────────
// 主題別の図は「何が起きているか」で束ねる。こちらは「その分類がどこと繋がるか」を見る。
// 中央にその分類の組織、左右に相手を置く。
// 相手は、繋がる先の平均の高さの順に並べ替えてから左右へ割る。交差がその分だけ減る。
export function categoryTheme(cat, part = 0, parts = 1) {
  const mine = factions.filter((f) => f.cat === cat.id).map((f) => f.id);
  const idx = Object.fromEntries(mine.map((id, i) => [id, i]));
  const outer = new Map();
  for (const id of mine) {
    for (const r of edgesOf(id)) {
      if (idx[r.other] !== undefined) continue;
      (outer.get(r.other) ?? outer.set(r.other, []).get(r.other)).push(idx[id]);
    }
  }
  const others = [...outer.keys()].sort((a, b) => {
    const m = (id) => outer.get(id).reduce((s, v) => s + v, 0) / outer.get(id).length;
    return m(a) - m(b) || a.localeCompare(b);
  });
  const share = parts === 1 ? others
    : others.filter((_, i) => Math.floor(i * parts / others.length) === part);
  const L = share.filter((_, i) => i % 2 === 0);
  const R = share.filter((_, i) => i % 2 === 1);
  // 行は詰めない。二枚に割った図で相手を詰めると、語の置き場が無くなる。
  const rows = Math.max(mine.length, L.length, R.length, 9);

  const inSheet = new Set(share);
  const deg = Object.fromEntries(mine.map((id) => [id,
    edgesOf(id).filter((r) => inSheet.has(r.other)).length]));
  const nodes = [];
  let r = 0;
  const spread = Math.max(1, Math.floor(rows / mine.length));
  mine.forEach((id, i) => {
    const tall = deg[id] >= 5 ? 1 : 0;
    nodes.push({ id, col: 1, row: Math.min(r, rows - 1 - tall), tall });
    r += spread + tall;
  });
  const spreadRow = (i, n) => (n <= 1 ? Math.floor((rows - 1) / 2)
    : Math.round(i * (rows - 1) / (n - 1)));
  L.forEach((id, i) => nodes.push({ id, col: 0, row: spreadRow(i, L.length) }));
  R.forEach((id, i) => nodes.push({ id, col: 2, row: spreadRow(i, R.length) }));

  const n = mine.length, e = others.length;
  return {
    key: 'cat' + cat.id + (parts > 1 ? '-' + (part + 1) : ''),
    kind: '分類', n: cat.n, ja: cat.ja + (parts > 1 ? `（${'一二三'[part]}）` : ''),
    en: cat.en, focus: new Set(mine),
    lead: cat.note + `本書はこの分類に ${n} 項を収めた。`
      + `外へ出る関係は ${e} 組織との間にある。`
      + '中央がこの分類の組織、左右がその相手である。'
      + (parts > 1 ? `相手が多いため ${'一二三四'[parts - 1]} 枚に割った。`
        + `これはその ${'一二三四'[part]} 枚目で、${share.length} 組織を載せている。` : ''),
    nodes,
    note: '左右に置いた組織は、それぞれ別の分類に属する。'
      + '札の左端の色がその分類を示す（前付「分類について」の色と同じ）。'
      + 'この図は中央の組織が関わる関係のみを引いている。'
      + '相手どうしの関係は、相手の属する分類の図に出る。',
    pitch: 17, top: 32, chip: 0.9,
  };
}

// 相手が多い分類は割る。溝に通せる線は一枚あたり十本ほどが限度で、
// それを超えると通り道か語の置き場のどちらかが必ず尽きる。
// 頁数の制約を外していただいたので、詰めるより割るほうを選ぶ。
export function categorySheets(cat) {
  const mine = new Set(factions.filter((f) => f.cat === cat.id).map((f) => f.id));
  const outer = new Set();
  for (const id of mine) for (const r of edgesOf(id)) if (!mine.has(r.other)) outer.add(r.other);
  const parts = outer.size > 18 ? 3 : outer.size > 12 ? 2 : 1;
  return Array.from({ length: parts }, (_, i) => categoryTheme(cat, i, parts));
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
