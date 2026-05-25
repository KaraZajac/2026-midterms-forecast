// =============================================================================
// 2026 Midterms — page rendering
// =============================================================================
//
// Loads assets/results.json (the Monte Carlo output) and renders:
//   - topline verdict boxes
//   - seat-count histograms (Chart.js)
//   - national-swing histogram
//   - senate cartogram (CSS grid of state tiles)
//   - senate + house race tables
//   - tipping-point table
//
// The page is otherwise static.

(async function(){

const css = getComputedStyle(document.documentElement);
const C = {
  d:        '#1e66f5',   // ctp-blue
  r:        '#d20f39',   // ctp-red
  d_light:  '#7287fd',   // ctp-lavender
  r_light:  '#e64553',   // ctp-maroon
  ink:      '#4c4f69',
  muted:    '#6c6f85',
  line:     '#ccd0da',
  surface:  '#e6e9ef',
  accent:   '#fe640b',
  yellow:   '#df8e1d',
  green:    '#40a02b',
  mauve:    '#8839ef',
};

const res = await fetch('assets/results.json?v=5').then(r => r.json());
const summary = res.summary;
const meta = res.meta;

// =============================================================================
// Header / meta
// =============================================================================
document.getElementById('m-asof').textContent = meta.as_of;
document.getElementById('m-approval').textContent = meta.trump_approval_pct;
document.getElementById('m-genballot').textContent = meta.generic_ballot_d_pct;
document.getElementById('m-ntrials').textContent = meta.n_trials.toLocaleString();

// =============================================================================
// Topline verdict
// =============================================================================
function pct(p){ return (p * 100).toFixed(0) + '%'; }
function pct1(p){ return (p * 100).toFixed(1) + '%'; }
function signPP(x){ const s = x>=0?'+':''; return s + x.toFixed(1); }

document.getElementById('t-pdh').textContent = pct(summary.house.p_d_wins);
document.getElementById('t-dh-median').textContent = summary.house.d_seats_median;
document.getElementById('t-dh-p10').textContent = summary.house.d_seats_p10;
document.getElementById('t-dh-p90').textContent = summary.house.d_seats_p90;

document.getElementById('t-pds').textContent = pct(summary.senate.p_d_wins);
document.getElementById('t-ds-median').textContent = summary.senate.d_seats_median;
document.getElementById('t-ds-p10').textContent = summary.senate.d_seats_p10;
document.getElementById('t-ds-p90').textContent = summary.senate.d_seats_p90;

document.getElementById('t-pdt').textContent = pct(summary.joint.p_d_trifecta);
document.getElementById('t-prt').textContent = pct(summary.joint.p_r_trifecta);

// Topline narrative
const narrative = (function(){
  const ph = summary.house.p_d_wins;
  const ps = summary.senate.p_d_wins;
  const hWord = ph > 0.6 ? 'leans Democratic' : ph > 0.45 ? 'is a coin flip' : ph > 0.3 ? 'leans Republican' : 'favors Republicans';
  const sWord = ps > 0.6 ? 'leans Democratic' : ps > 0.45 ? 'is a coin flip' : ps > 0.3 ? 'leans Republican' : 'favors Republicans';
  const split = summary.joint.p_d_house_only;
  return `As of ${meta.as_of}, the House ${hWord} (${pct1(ph)}) and the Senate ${sWord} (${pct1(ps)}). ` +
         `The single most likely joint outcome is ${
           Math.max(summary.joint.p_d_trifecta, summary.joint.p_r_trifecta, summary.joint.p_d_house_only, summary.joint.p_d_senate_only) === summary.joint.p_d_trifecta ? 'a Democratic trifecta' :
           Math.max(summary.joint.p_d_trifecta, summary.joint.p_r_trifecta, summary.joint.p_d_house_only, summary.joint.p_d_senate_only) === summary.joint.p_r_trifecta ? 'Republicans holding both chambers' :
           Math.max(summary.joint.p_d_trifecta, summary.joint.p_r_trifecta, summary.joint.p_d_house_only, summary.joint.p_d_senate_only) === summary.joint.p_d_house_only ? 'D-House / R-Senate split' :
           'R-House / D-Senate split'
         } at ${pct(Math.max(summary.joint.p_d_trifecta, summary.joint.p_r_trifecta, summary.joint.p_d_house_only, summary.joint.p_d_senate_only))}. ` +
         `A split chamber outcome (D House only) has probability ${pct(split)}. ` +
         `Republicans entered this cycle holding 220 House seats and 53 Senate seats; Democrats need a net +3 in the House and +4 in the Senate to flip both.`;
})();
document.getElementById('topline-narrative').textContent = narrative;

// =============================================================================
// Histograms — Chart.js
// =============================================================================
Chart.defaults.color = C.muted;
Chart.defaults.font.family = 'ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace';
Chart.defaults.font.size = 11;

function distChart(canvasId, data, threshold, dColor, rColor, xMin, xMax, pDwins){
  const canvas = document.getElementById(canvasId);
  const labels = data.map(d => d.x);
  const values = data.map(d => d.y);
  const bgs = labels.map(x => x >= threshold ? dColor : rColor);
  const chart = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ data: values, backgroundColor: bgs, borderWidth: 0, barPercentage: 1.02, categoryPercentage: 1.0 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => items[0].label + ' seats',
            label: (item) => (item.raw * 100).toFixed(2) + '% of trials',
          }
        },
      },
      scales: {
        x: { min: xMin, max: xMax, ticks: { maxTicksLimit: 12, autoSkip: true }, grid: { color: C.line, display: false } },
        y: { ticks: { callback: v => (v*100).toFixed(1)+'%' }, grid: { color: C.line }, beginAtZero: true },
      },
    },
    plugins: [{
      id: 'majorityLine',
      afterDraw(chart){
        // No canvas drawing — the line is an HTML element in the overlay,
        // positioned via the CSS variables we update below.  This is more
        // reliable across DPR / mobile rendering than a canvas stroke.
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        const xPos = xScale.getPixelForValue(threshold);
        positionMajorityOverlay(canvasId, xPos, xScale.left, xScale.right, yScale.top, yScale.bottom);
      }
    }]
  });

  // Wrap the canvas in a positioned container; build the HTML overlay (chip +
  // R/D labels) inside that container so the labels sit ONLY over the plot
  // area, not the title or caption above it.
  if (!canvas.parentElement.classList.contains('canvas-pos')){
    const posWrap = document.createElement('div');
    posWrap.className = 'canvas-pos';
    canvas.parentNode.insertBefore(posWrap, canvas);
    posWrap.appendChild(canvas);
  }
  const posWrap = canvas.parentElement;
  const overlay = document.createElement('div');
  overlay.className = 'maj-overlay';
  overlay.dataset.canvasId = canvasId;
  // The threshold "line" is now an HTML element (.maj-line) instead of a
  // canvas stroke.  The chip sits above it.  Bar coloring makes the
  // party-control split obvious without explicit R/D labels.
  overlay.innerHTML = `
    <div class="maj-line"></div>
    <div class="maj-chip">${threshold} for majority</div>
  `;
  posWrap.appendChild(overlay);
}

// The plugin tells us the pixel-x of the threshold and the plot top/bottom
// in canvas-internal coords.  Translate to CSS coords by ratioing against
// canvas internal vs. client size.
function positionMajorityOverlay(canvasId, xPx, plotLeft, plotRight, plotTop, plotBottom){
  const canvas = document.getElementById(canvasId);
  const overlay = canvas.parentElement.querySelector(`.maj-overlay[data-canvas-id="${canvasId}"]`);
  if (!overlay) return;
  const dprX = canvas.width / canvas.clientWidth;
  const dprY = canvas.height / canvas.clientHeight;
  overlay.style.setProperty('--maj-x', (xPx / dprX) + 'px');
  overlay.style.setProperty('--plot-left', (plotLeft / dprX) + 'px');
  overlay.style.setProperty('--plot-right', (plotRight / dprX) + 'px');
  if (plotTop != null)    overlay.style.setProperty('--plot-top', (plotTop / dprY) + 'px');
  if (plotBottom != null) overlay.style.setProperty('--plot-bottom', (plotBottom / dprY) + 'px');
}

// House distribution — center on 218
const houseDist = res.distributions.house_d_seats;
distChart('chart-house', houseDist, 218, C.d, C.r, 170, 260, summary.house.p_d_wins);
document.getElementById('dist-h-median').textContent = summary.house.d_seats_median;
document.getElementById('dist-h-mean').textContent = summary.house.d_seats_mean.toFixed(1);

// Senate distribution — center on 51.  Use a wider x-range so the 51-chip
// has room on mobile (the threshold sits in the right half of 42-58 and the
// chip was clipping at narrow viewports).
const senateDist = res.distributions.senate_d_seats;
distChart('chart-senate', senateDist, 51, C.d, C.r, 40, 60, summary.senate.p_d_wins);
document.getElementById('dist-s-median').textContent = summary.senate.d_seats_median;
document.getElementById('dist-s-mean').textContent = summary.senate.d_seats_mean.toFixed(1);

// National swing distribution
const natSwingDist = res.distributions.national_swing;
const swingCtx = document.getElementById('chart-natswing');
new Chart(swingCtx, {
  type: 'bar',
  data: {
    labels: natSwingDist.map(d => d.x.toFixed(1)),
    datasets: [{
      data: natSwingDist.map(d => d.y),
      backgroundColor: natSwingDist.map(d => d.x >= 0 ? C.d_light : C.r_light),
      borderWidth: 0,
      barPercentage: 1.02,
      categoryPercentage: 1.0,
    }],
  },
  options: {
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: { legend: { display: false }, tooltip: {
      callbacks: {
        title: (items) => `D${items[0].label >= 0 ? '+' : ''}${items[0].label} pp`,
        label: (item) => (item.raw * 100).toFixed(2) + '% of trials',
      }
    }},
    scales: {
      x: { ticks: { maxTicksLimit: 11, autoSkip: true }, grid: { display: false } },
      y: { ticks: { callback: v => (v*100).toFixed(1)+'%' }, grid: { color: C.line }, beginAtZero: true },
    },
  },
});
document.getElementById('nat-mu').textContent = meta.nat_swing_mean_pp.toFixed(1);
document.getElementById('nat-sigma').textContent = meta.nat_swing_sigma_pp.toFixed(1);

// =============================================================================
// Senate cartogram — CSS grid layout of state tiles for the 35 races
// =============================================================================
// (col, row) hex-style positions for every state up in 2026.
const CARTO_POS = {
  'ME': [10, 0], 'NH': [9, 1], 'MA': [10, 2], 'RI': [11, 2], 'NJ': [9, 3], 'DE': [9, 4],
  'VA': [8, 5], 'NC': [8, 6], 'SC': [8, 7], 'GA': [7, 7],
  'AL': [6, 7], 'TN': [6, 6], 'KY': [6, 5], 'OH': [7, 4], 'MI': [7, 3],
  'MN': [5, 2], 'IL': [5, 4], 'IA': [4, 4], 'MO': [4, 5], 'AR': [4, 6], 'LA': [4, 7], 'MS': [5, 7],
  'KS': [3, 5], 'OK': [3, 6], 'TX': [3, 7],
  'NE': [3, 4], 'SD': [3, 3], 'ND': [3, 2],
  'CO': [2, 5], 'NM': [2, 6], 'WY': [2, 4], 'MT': [2, 3], 'ID': [1, 3], 'UT': [1, 5], 'AZ': [1, 6],
  'NV': [1, 4], 'CA': [0, 5], 'OR': [0, 3], 'WA': [0, 2], 'AK': [0, 7], 'HI': [0, 8],
};

const senateByState = {};
res.races.senate.forEach(r => {
  const state = r.id.split('-')[0];
  // OH-SEN-SP and FL-SEN-SP share state code with regular seat (FL is only on
  // ballot via special; OH same).  Keep both indexed by suffix.
  const isSpecial = r.id.includes('SP');
  const key = isSpecial ? state + '-SP' : state;
  senateByState[key] = r;
});

function probColor(p){
  // 0 = red, 0.5 = grey, 1 = blue.  Use HSL-like interp between red and blue.
  const dStrength = Math.abs(p - 0.5) * 2;  // 0..1
  if (p >= 0.5){
    // Mix from neutral to D blue
    return mixColors('#bcc0cc', '#1e66f5', dStrength);
  } else {
    return mixColors('#bcc0cc', '#d20f39', dStrength);
  }
}
function mixColors(c1, c2, t){
  const a = parseInt(c1.slice(1),16), b = parseInt(c2.slice(1),16);
  const ar = (a>>16)&0xff, ag = (a>>8)&0xff, ab = a&0xff;
  const br = (b>>16)&0xff, bg = (b>>8)&0xff, bb = b&0xff;
  const r = Math.round(ar + (br-ar)*t);
  const g = Math.round(ag + (bg-ag)*t);
  const bl = Math.round(ab + (bb-ab)*t);
  return `rgb(${r},${g},${bl})`;
}

// Wrap the cartogram in a scroller so on narrow viewports it can pan
// horizontally instead of collapsing the tiles to unreadable size.
const carto = document.getElementById('senate-cartogram');
const cartoScroller = document.createElement('div');
cartoScroller.className = 'carto-scroller';
carto.parentNode.insertBefore(cartoScroller, carto);
cartoScroller.appendChild(carto);

carto.style.display = 'grid';
carto.style.gridTemplateColumns = 'repeat(13, 1fr)';
carto.style.gridTemplateRows = 'repeat(9, 1fr)';
carto.style.gap = '4px';
carto.style.width = '100%';
carto.style.maxWidth = '760px';
carto.style.margin = '12px auto';
carto.style.aspectRatio = '13 / 9';

// For each state up in 2026 (regular + specials), place a tile.
const tilesAdded = [];
Object.entries(senateByState).forEach(([key, r]) => {
  const state = key.replace('-SP','');
  const pos = CARTO_POS[state];
  if (!pos) return;
  const tile = document.createElement('div');
  tile.style.gridColumn = pos[0] + 1;
  tile.style.gridRow = pos[1] + 1;
  // If both regular and special exist for same state, offset special slightly
  if (key.endsWith('-SP') && senateByState[state]){
    tile.style.gridColumn = pos[0] + 2;
  }
  tile.style.background = probColor(r.model_p_d_win);
  tile.style.borderRadius = '6px';
  tile.style.padding = '8px 4px';
  tile.style.textAlign = 'center';
  tile.style.color = (Math.abs(r.model_p_d_win - 0.5) > 0.25) ? '#fff' : '#222';
  tile.style.fontFamily = 'ui-monospace, monospace';
  tile.style.fontSize = '12px';
  tile.style.cursor = 'help';
  tile.style.position = 'relative';
  tile.innerHTML = `<div style="font-weight:700">${state}${key.endsWith('-SP') ? '·SP' : ''}</div>` +
                   `<div style="font-size:10px;opacity:.9">${pct(r.model_p_d_win)}</div>`;
  tile.title = `${r.id} (${r.rating_consensus})\nIncumbent: ${r.incumbent_party}\nExpected D-R margin: ${signPP(r.expected_margin)} pp\nModel P(D wins): ${pct1(r.model_p_d_win)}\n${r.note}`;
  carto.appendChild(tile);
  tilesAdded.push(state);
});

// Add a small legend below the cartogram
const legend = document.createElement('div');
legend.style.cssText = 'display:flex;justify-content:center;gap:14px;font-family:ui-monospace, monospace;font-size:11px;color:var(--muted);margin-top:8px';
legend.innerHTML = `
  <span><span style="display:inline-block;width:14px;height:14px;background:#d20f39;border-radius:3px;vertical-align:middle"></span> &nbsp;Safe R</span>
  <span><span style="display:inline-block;width:14px;height:14px;background:#e64553;border-radius:3px;vertical-align:middle"></span> &nbsp;Lean R</span>
  <span><span style="display:inline-block;width:14px;height:14px;background:#bcc0cc;border-radius:3px;vertical-align:middle"></span> &nbsp;Toss-up</span>
  <span><span style="display:inline-block;width:14px;height:14px;background:#7287fd;border-radius:3px;vertical-align:middle"></span> &nbsp;Lean D</span>
  <span><span style="display:inline-block;width:14px;height:14px;background:#1e66f5;border-radius:3px;vertical-align:middle"></span> &nbsp;Safe D</span>
`;
carto.parentNode.appendChild(legend);

// =============================================================================
// Race tables
// =============================================================================
function ratingTag(r){
  const cls = r.rating_consensus.toLowerCase().includes(' d') || r.rating_consensus === 'Solid D'
    ? 'tag-d' : r.rating_consensus.toLowerCase().includes(' r') || r.rating_consensus === 'Solid R'
    ? 'tag-r' : 'tag-toss';
  return `<span class="${cls}">${r.rating_consensus}</span>`;
}

function deltaTag(model, rating){
  const d = model - rating;
  const sign = d > 0 ? '+' : '';
  const cls = Math.abs(d) > 0.05 ? (d > 0 ? 'tag-d' : 'tag-r') : 'tag-toss';
  return `<span class="${cls}">${sign}${(d*100).toFixed(1)}pp</span>`;
}

function probCellHTML(p){
  const bgColor = probColor(p);
  const txtColor = Math.abs(p - 0.5) > 0.25 ? '#fff' : '#222';
  return `<span style="display:inline-block;padding:3px 8px;border-radius:3px;background:${bgColor};color:${txtColor};font-weight:700;font-family:ui-monospace,monospace;min-width:50px;text-align:center">${pct1(p)}</span>`;
}

// Senate table — sort by closeness to 0.5 (most competitive first)
const senateSorted = [...res.races.senate].sort((a,b) => Math.abs(a.model_p_d_win - 0.5) - Math.abs(b.model_p_d_win - 0.5));
const senateTbody = document.querySelector('#senate-table tbody');
senateSorted.forEach(r => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><b>${r.id}</b></td>
    <td>${r.incumbent_party === 'D' ? '<span class="tag-d">D</span>' : '<span class="tag-r">R</span>'}</td>
    <td>${ratingTag(r)}</td>
    <td class="num">${signPP(r.expected_margin)}</td>
    <td>${probCellHTML(r.model_p_d_win)}</td>
    <td>${deltaTag(r.model_p_d_win, r.rating_p_d_win)}</td>
    <td style="font-size:12px;color:var(--muted)">${r.note}</td>
  `;
  senateTbody.appendChild(tr);
});

// House table — only competitive races, sorted by closeness
const houseCompetitive = res.races.house.filter(r => Math.abs(r.model_p_d_win - 0.5) < 0.45 || (r.note && !r.note.startsWith('PVI')));
const houseSorted = [...houseCompetitive].sort((a,b) => Math.abs(a.model_p_d_win - 0.5) - Math.abs(b.model_p_d_win - 0.5));
const houseTbody = document.querySelector('#house-table tbody');
houseSorted.forEach(r => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><b>${r.id}</b></td>
    <td>${r.incumbent_party === 'D' ? '<span class="tag-d">D</span>' : r.incumbent_party === 'R' ? '<span class="tag-r">R</span>' : '<span class="tag-toss">—</span>'}</td>
    <td>${ratingTag(r)}</td>
    <td class="num">${signPP(r.expected_margin)}</td>
    <td>${probCellHTML(r.model_p_d_win)}</td>
    <td style="font-size:12px;color:var(--muted)">${r.note}</td>
  `;
  houseTbody.appendChild(tr);
});

// =============================================================================
// Tipping-point table
// =============================================================================
const tipTbody = document.querySelector('#tipping-table tbody');
res.tipping_point_house.forEach((r, i) => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="num">${i+1}</td>
    <td><b>${r.id}</b></td>
    <td>${r.rating_consensus}</td>
    <td class="num">${(r.p_decisive*100).toFixed(2)}%</td>
  `;
  tipTbody.appendChild(tr);
});

})();
