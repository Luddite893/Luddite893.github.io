// 銅版画調のエングレービング・エンジン
//
// 仕様書 9「銅版画・エッチング調のモノクロ線画を基本とし、分類色を 1 色だけ乗せる
// 二色刷りの体裁。全図版で統一すること」への実装。
// および仕様書 14-2「図版 150 点超の人物図版を統一画風で揃える手法」、
// 14-3「銅版画調の実現方法（手描き／版画的処理／その他）」への回答。
//
// ── なぜ「その他」なのか ────────────────────────────
// 手描きは 360 点で必ず崩れる。前半と後半で手が変わるからだ。
// 版画的処理（写真をハーフトーン化する類）は、元画像の階調に依存するので、
// 元がなければ何も出ない。本件には元画像が無い。
//
// 採ったのは第三の道——**調子を線の関数として定義する**方法である。
// 図版は「形」と「その各部の濃さ」だけを持ち、線は engrave が生成する。
// 濃さ 0.0 から 1.0 までの写像が一つしかないので、
// 49 組織ぶんの図版が、同じ彫師の手で彫られたものになる。
//
// ── 銅版画の線がなぜ銅版画に見えるか ─────────────────
// ビュラン（彫刻刀）は V 字の溝を彫る。押し込むほど溝が深く広くなり、
// 抜くときに細くなる。だから一本の線が **中央で太り、両端で消える**。
// 等幅の線を並べても銅版画には見えない。ここが要点で、
// 本エンジンは線を「棒」ではなく「木の葉形」として置く。
//
// 濃さの作り方も規約に従う。
//   薄い   線を疎に、細く
//   中間   線を密に、太く
//   濃い   二番手を斜交させる（cross-hatch）
//   最濃   三番手を入れ、その下に地を敷く
// 途中で技法が切り替わる閾値を全図版で共有するので、濃さの見え方が揃う。

let uid = 0;

// ── ビュランの一線 ──────────────────────────────
// 中央で太り、両端で尖る。これが銅版画の線の正体。
export function burin(x0, y0, x1, y1, w, bias = 0.5) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  // 太りの頂点は中央とは限らない。入りが太く抜きが細い線もある。
  const mx = x0 + dx * bias, my = y0 + dy * bias;
  const f = (v) => v.toFixed(2);
  return `M ${f(x0)} ${f(y0)} Q ${f(mx + nx * w * 2)} ${f(my + ny * w * 2)} ${f(x1)} ${f(y1)} `
       + `Q ${f(mx - nx * w * 2)} ${f(my - ny * w * 2)} ${f(x0)} ${f(y0)} Z`;
}

// 決定論的乱数。再ビルドで図版が変わらないように。
function rng(seed) {
  let a = 0;
  for (let i = 0; i < seed.length; i++) a = (Math.imul(a ^ seed.charCodeAt(i), 2654435761) >>> 0);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── 調子の規約 ─────────────────────────────────
// 全図版がこの一つの表に従う。ここを触ると 360 点すべての濃さが同時に動く。
// 値の単位は **刷り上がりのミリ**。図版の座標系ではない。
//
// これを座標系で定義すると、大きい図版ほど線が粗くなる。
// 紋章は 22mm、胸像は 18mm、小カットは 25mm、主図版は 174mm——
// すべて viewBox は 100 前後なので、同じ「線間 4 単位」が
// 刷り上がりでは 0.9mm と 7mm になってしまう。
// 同じ本の中で、頁をめくるたびに彫りの目が変わることになる。
// 銅版画の目は、版の大小にかかわらず一定である。彫師の手が一定だからだ。
export const TONE = {
  gapFar: 0.62,     // 最も薄いときの線間（mm）
  gapNear: 0.17,    // 最も濃いときの線間（mm）
  wThin: 0.013,     // 最も細いときの半幅（mm）
  wFat: 0.052,      // 最も太いときの半幅（mm）
  cross2: 0.42,     // 二番手（斜交）を入れ始める濃さ
  cross3: 0.70,     // 三番手を入れ始める濃さ
  flood: 0.93,      // 地を敷き始める濃さ
  jitter: 0.16,     // 線間の揺れ。等間隔は機械の線に見える。
};

const lerp = (a, b, t) => a + (b - a) * t;

// 領域 d を、濃さ t（0〜1）で彫る。
//   d      切り抜く形（SVG path）
//   t      濃さ 0〜1
//   angle  一番手の角度（度）。形の面の向きに合わせる。
//   box    [x0,y0,x1,y1] 走査範囲
// mmPerUnit：この図版の座標 1 単位が刷り上がり何ミリになるか。
//   紋章 22mm/120 単位 = 0.183 ／ 胸像 18mm/100 = 0.18
//   小カット 25mm/100 = 0.25 ／ 主図版 174mm/100 = 1.74
export function engrave(d, { t = 0.5, angle = 38, box, seed = '', ink = '#1b1b1a', mmPerUnit = 0.2 } = {}) {
  if (t <= 0.02) return '';
  const U = 1 / mmPerUnit;                       // mm → 座標単位
  const id = `e${++uid}`;
  const R = rng(id + seed + angle);
  const [x0, y0, x1, y1] = box;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const span = Math.hypot(x1 - x0, y1 - y0) * 0.62;

  const pass = (a, strength) => {
    let gap = lerp(TONE.gapFar, TONE.gapNear, strength) * U;
    const w = lerp(TONE.wThin, TONE.wFat, strength) * U;
    // 走査本数の上限。大きな面を最濃で彫ると、線が万を超えて版が重くなる。
    const maxLines = 460;
    if ((span * 2) / gap > maxLines) gap = (span * 2) / maxLines;
    const rad = (a * Math.PI) / 180;
    const ux = Math.cos(rad), uy = Math.sin(rad);
    let out = '';
    for (let s = -span; s <= span; s += gap * (1 + (R() - 0.5) * 2 * TONE.jitter)) {
      // 走査線ごとに角度も僅かにぶれる。手は同じ角度を二度引けない。
      const da = ((R() - 0.5) * 1.8 * Math.PI) / 180;
      const vx = Math.cos(rad + da), vy = Math.sin(rad + da);
      const px = cx - uy * s, py = cy + ux * s;
      // 線は端まで届かないことがある。届かせると版面が硬くなる。
      const e0 = -span * (0.72 + R() * 0.28), e1 = span * (0.72 + R() * 0.28);
      out += burin(px + vx * e0, py + vy * e0, px + vx * e1, py + vy * e1,
        w * (0.72 + R() * 0.56), 0.34 + R() * 0.32);
    }
    return out;
  };

  let body = '';
  if (t >= TONE.flood) {
    // 最濃部。地を敷いたうえに線を重ねる。真っ黒な面は銅版画には無い。
    body += `<path d="${d}" fill="${ink}" opacity="${((t - TONE.flood) / (1 - TONE.flood) * 0.72).toFixed(3)}"/>`;
  }
  body += `<path d="${pass(angle, Math.min(t / 0.55, 1))}"/>`;
  if (t > TONE.cross2) body += `<path d="${pass(angle + 54, (t - TONE.cross2) / (1 - TONE.cross2))}"/>`;
  if (t > TONE.cross3) body += `<path d="${pass(angle + 108, (t - TONE.cross3) / (1 - TONE.cross3))}"/>`;

  return `<clipPath id="${id}"><path d="${d}"/></clipPath>`
       + `<g clip-path="url(#${id})" fill="${ink}">${body}</g>`;
}

// ── 点刻（スティップル） ────────────────────────────
// 線が向かない場所——空、霞、皮膚のごく淡い調子——に使う。
// 銅版画では roulette や点刻器で打つ。線と混ぜても画風は破れない。
export function stipple(d, { t = 0.3, box, seed = '', ink = '#1b1b1a', mmPerUnit = 0.2 } = {}) {
  if (t <= 0.02) return '';
  const U = 1 / mmPerUnit;
  const id = `s${++uid}`;
  const R = rng(id + seed);
  const [x0, y0, x1, y1] = box;
  const area = (x1 - x0) * (y1 - y0);
  // 粒の数は刷り上がりの面積で決める。t=0.3 でおよそ 2.4 点／mm²。
  const areaMM = area * mmPerUnit * mmPerUnit;
  const n = Math.min(Math.round(areaMM * t * 8), 4000);
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0);
    const r = (0.026 + R() * 0.040) * (0.6 + t) * U;
    out += `M ${x.toFixed(2)} ${y.toFixed(2)} m -${r.toFixed(2)} 0 `
         + `a ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(r * 2).toFixed(2)} 0 `
         + `a ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-r * 2).toFixed(2)} 0 Z`;
  }
  return `<clipPath id="${id}"><path d="${d}"/></clipPath>`
       + `<g clip-path="url(#${id})"><path fill="${ink}" d="${out}"/></g>`;
}

// ── 輪郭線 ─────────────────────────────────────
// 銅版画の輪郭も等幅ではない。下側と奥側が太る。
export function contour(d, { w = 0.5, ink = '#1b1b1a', mmPerUnit = null } = {}) {
  // mmPerUnit を渡せば、線幅も刷り上がりのミリで指定できる。
  const sw = mmPerUnit ? (w / mmPerUnit).toFixed(3) : w;
  return `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${sw}" `
       + `stroke-linejoin="round" stroke-linecap="round"/>`;
}

// ── 二色刷りの版 ───────────────────────────────
// 墨版（線）と、分類色の版（面）。二版を刷り重ねる体裁。
// 色版は必ず線版の下に敷き、線に色を付けない。
// 線に色を乗せた瞬間、二色刷りではなく「着色されたイラスト」になる。
export function twoPlate({ colorPlate = '', inkPlate = '', color = '#8a6f2e', opacity = 0.30 }) {
  return (colorPlate ? `<g fill="${color}" opacity="${opacity}">${colorPlate}</g>` : '')
       + `<g>${inkPlate}</g>`;
}

export const nextId = () => ++uid;
