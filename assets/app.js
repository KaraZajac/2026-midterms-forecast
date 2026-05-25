// =============================================================================
// 2026 Midterms — page renderer (vanilla JS, Chart.js + annotation plugin)
// =============================================================================

(async function(){

const C = {
  d:        '#1e66f5',
  r:        '#d20f39',
  ink:      '#1c1f2a',
  muted:    '#5c5f77',
  line:     '#ccd0da',
  panel:    '#ffffff',
};

// Tell Chart.js's plugin loader to use the annotation plugin.
if (window.Chart && window.ChartAnnotation){
  Chart.register(window.ChartAnnotation);
} else if (window.Chart && window['chartjs-plugin-annotation']){
  Chart.register(window['chartjs-plugin-annotation']);
}

const res = await fetch('assets/results.json?v=20').then(r => r.json());
const summary = res.summary;
const meta = res.meta;

function pct0(p){ return Math.round(p*100) + '%' }
function pct1(p){ return (p*100).toFixed(1) + '%' }
function set(id, val){ const el = document.getElementById(id); if (el) el.textContent = val; }

// =============================================================================
// Header
// =============================================================================
set('meta-days', meta.days_until);

// =============================================================================
// Topline — house + senate
// =============================================================================
function paintChamber(chamberName, summaryObj, controlThreshold){
  const pD = summaryObj.p_d_wins;
  const pR = 1 - pD;
  set(`${chamberName}-d-prob`, pct0(pD));
  set(`${chamberName}-r-prob`, pct0(pR));
  set(`${chamberName}-median`, summaryObj.d_seats_median);
  set(`${chamberName}-range`, `${summaryObj.d_seats_p10}–${summaryObj.d_seats_p90} D seats`);

  // Probability bar: blue from the right
  const winbarD = document.querySelector(`#${chamberName}-winbar .winbar-d`);
  if (winbarD) winbarD.style.width = (pD * 100) + '%';

  // Mark favored side
  const dSide = document.getElementById(`${chamberName}-d`);
  const rSide = document.getElementById(`${chamberName}-r`);
  if (pD >= 0.5){ dSide.classList.add('favored'); }
  else          { rSide.classList.add('favored'); }
}

paintChamber('house',  summary.house,  218);
paintChamber('senate', summary.senate, 51);

// =============================================================================
// Distribution charts — Chart.js + annotation plugin for the threshold line
// =============================================================================
function distributionChart(canvasId, data, threshold, thresholdLabel, xMin, xMax){
  const labels = data.map(d => d.x);
  const values = data.map(d => d.y);
  // For senate: line at 50 means "bars where seat count is strictly greater
  // than 50 are blue".  threshold == 50, so x > threshold → blue.
  const colors = labels.map(x => x > threshold ? C.d : C.r);

  new Chart(document.getElementById(canvasId), {
    type: 'bar',
    data: { labels, datasets: [{
      data: values,
      backgroundColor: colors,
      borderWidth: 0,
      barPercentage: 1.02,
      categoryPercentage: 1.0,
    }]},
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: items => items[0].label + ' D seats',
            label: item => (item.raw * 100).toFixed(2) + '% of trials',
          }
        },
        annotation: {
          annotations: {
            majority: {
              type: 'line',
              xMin: threshold,
              xMax: threshold,
              borderColor: '#000',
              borderWidth: 4,
              borderDash: [],
              label: {
                display: true,
                content: thresholdLabel,
                position: 'start',
                backgroundColor: '#000',
                color: '#fff',
                font: { family: "ui-monospace, monospace", size: 11, weight: 'bold' },
                padding: { top: 5, bottom: 5, left: 8, right: 8 },
                borderRadius: 4,
                yAdjust: -4,
              },
              z: 100,
            }
          }
        },
      },
      scales: {
        x: {
          type: 'linear',
          min: xMin, max: xMax,
          ticks: { maxTicksLimit: 9, color: C.muted, font: { family: 'ui-monospace, monospace', size: 11 }},
          grid: { display: false },
          border: { color: C.line },
        },
        y: {
          ticks: { callback: v => (v*100).toFixed(1)+'%', color: C.muted, font: { family: 'ui-monospace, monospace', size: 10 }},
          grid: { color: C.line },
          border: { display: false },
          beginAtZero: true,
        },
      },
    },
  });
}

// xMin/xMax wide enough that the threshold label has room and the distribution
// tails don't get cut off
distributionChart('house-chart',  res.distributions.house_d_seats,  218, '218 needed for majority', 170, 260);
distributionChart('senate-chart', res.distributions.senate_d_seats, 50,  '50 = tie · 51 for D control', 40, 60);

// =============================================================================
// Joint outcomes
// =============================================================================
set('joint-rr', pct0(summary.joint.p_r_trifecta));
set('joint-rd', pct0(summary.joint.p_d_senate_only));
set('joint-dr', pct0(summary.joint.p_d_house_only));
set('joint-dd', pct0(summary.joint.p_d_trifecta));

// =============================================================================
// Race lists
// =============================================================================
function ratingShort(label){
  return label
    .replace(/Solid /,'').replace(/Safe /,'Safe ')
    .replace(/Likely /,'Lk ')
    .replace(/Lean /,'Ln ')
    .replace(/Tilt /,'Tt ')
    .replace(/Toss-up/, 'Toss')
    || label;
}

function probColor(p){
  // 0 = solid red, 0.5 = grey, 1 = solid blue
  const t = Math.abs(p - 0.5) * 2;     // distance from 50/50, 0..1
  if (p >= 0.5){
    return mix('#bcc0cc', C.d, t);
  } else {
    return mix('#bcc0cc', C.r, t);
  }
}
function mix(a, b, t){
  const ah = parseInt(a.slice(1),16), bh = parseInt(b.slice(1),16);
  const ar=(ah>>16)&0xff, ag=(ah>>8)&0xff, ab=ah&0xff;
  const br=(bh>>16)&0xff, bg=(bh>>8)&0xff, bb=bh&0xff;
  return `rgb(${Math.round(ar+(br-ar)*t)},${Math.round(ag+(bg-ag)*t)},${Math.round(ab+(bb-ab)*t)})`;
}

function renderRace(r){
  const led = r.model_p_d_win >= 0.5 ? 'd-led' : 'r-led';
  return `
    <div class="race-card ${led}">
      <div class="race-id">${r.id}</div>
      <div class="race-meta">
        <div class="race-rating">${r.rating_consensus}${r.incumbent_party ? ' · '+r.incumbent_party+' held' : ''}</div>
        ${r.note ? `<div class="race-note">${r.note}</div>` : ''}
      </div>
      <div class="race-prob" style="background:${probColor(r.model_p_d_win)}">${pct0(r.model_p_d_win)} D</div>
    </div>
  `;
}

// Senate — all 35, sorted by closeness to 50/50
const senateSorted = [...res.races.senate].sort((a,b) =>
  Math.abs(a.model_p_d_win - 0.5) - Math.abs(b.model_p_d_win - 0.5)
);
document.getElementById('senate-races').innerHTML = senateSorted.map(renderRace).join('');

// House — only the competitive ones (hand-curated + any auto-derived with
// non-trivial uncertainty)
const houseShown = res.races.house.filter(r =>
  Math.abs(r.model_p_d_win - 0.5) < 0.45 || !r.note?.startsWith('PVI')
).sort((a,b) =>
  Math.abs(a.model_p_d_win - 0.5) - Math.abs(b.model_p_d_win - 0.5)
);
document.getElementById('house-races').innerHTML = houseShown.map(renderRace).join('');

// =============================================================================
// Tipping point
// =============================================================================
const tipHtml = res.tipping_point_house.slice(0, 20).map(t => `
  <li>
    <span class="tip-id">${t.id}</span>
    <span class="tip-rating">${t.rating_consensus}</span>
    <span class="tip-pct">${(t.p_decisive*100).toFixed(2)}%</span>
  </li>
`).join('');
document.getElementById('tip-list').innerHTML = tipHtml;

})();
