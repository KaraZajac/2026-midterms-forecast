#!/usr/bin/env node
// =============================================================================
// 2026 Midterms — Monte Carlo
// =============================================================================
//
// Model (per trial t):
//
//   nat_house_t ~ N(mu_nat, sigma_nat)             — national environment in pp
//   nat_senate_t = rho * nat_house_t + sqrt(1-rho^2) * N(0,sigma_nat)
//
//   For each race r in chamber c:
//     margin_r,t = expected_margin_r
//                + nat_c_t * elasticity_r
//                + N(0, sigma_race_r)
//     D wins iff margin_r,t > 0
//
//   Seat totals are summed; chamber control is determined by the threshold
//   in meta.control_threshold (218 House, 51 Senate).
//
// Output: assets/results.json containing the full forecast.
//
// Usage:  node scripts/montecarlo.js [N_TRIALS]

const fs = require('fs');
const path = require('path');

const ROOT     = path.resolve(__dirname, '..');
const PRIORS   = path.join(ROOT, 'assets', 'race_priors.json');
const OUT      = path.join(ROOT, 'assets', 'results.json');

const N_TRIALS = parseInt(process.argv[2] ?? '20000', 10);

// =============================================================================
// RNG — Mulberry32 (deterministic, seeded for reproducibility)
// =============================================================================
function mulberry32(seed){
  return function(){
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260525);

// Box-Muller (uses two uniforms, returns one normal)
function randn(){
  let u1 = rng();
  while (u1 === 0) u1 = rng();
  const u2 = rng();
  return Math.sqrt(-2*Math.log(u1)) * Math.cos(2*Math.PI*u2);
}

// =============================================================================
// Load priors
// =============================================================================
const priors = JSON.parse(fs.readFileSync(PRIORS, 'utf8'));
const meta = priors.meta;
const houseRaces = priors.house;
const senateRaces = priors.senate;

const SIGMA_NAT = meta.nat_swing_sigma_pp;
const MU_NAT = meta.nat_swing_mean_pp;
const RHO = meta.house_senate_correlation;

// 2024 baseline: 220R / 215D in House.  Each D win in the simulation gives D
// a seat; each R win gives R a seat.  We do NOT compute "flips" because our
// model produces direct seat counts.
//
// Current Senate (Class 2 OFF the ballot): D-caucus 35, R 23 (out of 65 not on
// ballot in 2026).  Wait — there are 100 senators, 35 on the ballot in 2026.
// Of the 65 NOT on the ballot: 35 D-caucus and 30 R.  We add the 2026 outcomes
// to those baselines.
const SENATE_NOT_ON_BALLOT = { D_caucus: 35, R: 30 };  // verified: 100 - 35 = 65; 47 D + 53 R - (12 D + 23 R) = 35 D + 30 R

// =============================================================================
// Run the simulation
// =============================================================================
function simulate(){
  const houseSeatCountsD = new Array(N_TRIALS);
  const senateSeatCountsD = new Array(N_TRIALS);
  const natSwings = new Array(N_TRIALS);

  // Per-race tallies — fraction of trials D wins
  const houseDwinCount = new Array(houseRaces.length).fill(0);
  const senateDwinCount = new Array(senateRaces.length).fill(0);

  // Tipping point: across trials where the House is decided by one seat, which
  // races flipped the outcome?  Approximate by counting how often each race's
  // outcome was decisive (margin near 0 AND result determined chamber control).
  const tippingPoint = {};

  // Joint outcomes for the scenario library
  let trifectaCount = 0;            // D wins both chambers
  let dHouseRSenate = 0;
  let rHouseDSenate = 0;
  let rTrifecta = 0;

  for (let t = 0; t < N_TRIALS; t++){
    const ns = MU_NAT + SIGMA_NAT * randn();      // House national swing
    const nsSen = RHO * ns + Math.sqrt(1 - RHO*RHO) * SIGMA_NAT * randn() + MU_NAT*(1-RHO);
    natSwings[t] = ns;

    let dHouse = 0;
    for (let i = 0; i < houseRaces.length; i++){
      const r = houseRaces[i];
      const margin = r.expected_margin + ns * r.elasticity + r.sigma_race * randn();
      if (margin > 0){ dHouse++; houseDwinCount[i]++; }
    }
    houseSeatCountsD[t] = dHouse;

    let dSenateOnBallot = 0;
    for (let i = 0; i < senateRaces.length; i++){
      const r = senateRaces[i];
      const margin = r.expected_margin + nsSen * r.elasticity + r.sigma_race * randn();
      if (margin > 0){ dSenateOnBallot++; senateDwinCount[i]++; }
    }
    const dSenate = dSenateOnBallot + SENATE_NOT_ON_BALLOT.D_caucus;
    senateSeatCountsD[t] = dSenate;

    // Trifecta accounting
    const dWinsHouse = dHouse >= meta.control_threshold.house;
    const dWinsSenate = dSenate >= meta.control_threshold.senate;
    if (dWinsHouse && dWinsSenate) trifectaCount++;
    else if (dWinsHouse && !dWinsSenate) dHouseRSenate++;
    else if (!dWinsHouse && dWinsSenate) rHouseDSenate++;
    else rTrifecta++;
  }

  // =============================================================================
  // Per-race win probabilities
  // =============================================================================
  const houseRaceResults = houseRaces.map((r, i) => ({
    id: r.id,
    chamber: 'house',
    incumbent_party: r.incumbent_party,
    rating_consensus: r.rating_consensus,
    rating_p_d_win: r.rating_p_d_win,
    expected_margin: r.expected_margin,
    model_p_d_win: houseDwinCount[i] / N_TRIALS,
    note: r.note,
  }));

  const senateRaceResults = senateRaces.map((r, i) => ({
    id: r.id,
    chamber: 'senate',
    incumbent_party: r.incumbent_party,
    rating_consensus: r.rating_consensus,
    rating_p_d_win: r.rating_p_d_win,
    expected_margin: r.expected_margin,
    model_p_d_win: senateDwinCount[i] / N_TRIALS,
    note: r.note,
  }));

  // =============================================================================
  // Tipping-point analysis (House only — Senate has too few races to be useful)
  // =============================================================================
  // We re-run a small batch of trials and identify, in each, which race was
  // decisive — the race that, sorted by margin, sits at the index that flips
  // the chamber when reversed.
  const TIP_TRIALS = 5000;
  const tipCounts = new Array(houseRaces.length).fill(0);
  for (let t = 0; t < TIP_TRIALS; t++){
    const ns = MU_NAT + SIGMA_NAT * randn();
    const margins = houseRaces.map((r,i) => ({
      idx: i,
      m: r.expected_margin + ns * r.elasticity + r.sigma_race * randn(),
    }));
    margins.sort((a,b) => a.m - b.m);  // most-R first
    // After sorting, the (435 - 218) = 217th from the bottom (index 217) is the
    // race that decides if D gets 218 (i.e. the marginal seat).
    const tip = margins[217];  // 0-indexed, so the 218th
    if (tip) tipCounts[tip.idx]++;
  }
  const tippingByRace = houseRaces.map((r,i) => ({
    id: r.id,
    rating_consensus: r.rating_consensus,
    p_decisive: tipCounts[i] / TIP_TRIALS,
  })).sort((a,b) => b.p_decisive - a.p_decisive).slice(0, 25);

  // =============================================================================
  // Seat-count histograms
  // =============================================================================
  function histogram(arr, binSize=1){
    const bins = {};
    for (const v of arr){
      const b = Math.round(v / binSize) * binSize;
      bins[b] = (bins[b] ?? 0) + 1;
    }
    return Object.entries(bins)
      .map(([k,v]) => ({x: +k, y: v / arr.length}))
      .sort((a,b) => a.x - b.x);
  }

  function quantile(arr, q){
    const s = [...arr].sort((a,b)=>a-b);
    const i = Math.max(0, Math.min(s.length-1, Math.floor(s.length * q)));
    return s[i];
  }
  function mean(arr){ return arr.reduce((a,b)=>a+b,0) / arr.length; }

  const pDwinsHouse = houseSeatCountsD.filter(s => s >= 218).length / N_TRIALS;
  const pDwinsSenate = senateSeatCountsD.filter(s => s >= 51).length / N_TRIALS;

  const result = {
    meta: {
      ...meta,
      n_trials: N_TRIALS,
      generated_at: new Date().toISOString(),
    },
    summary: {
      house: {
        p_d_wins:  pDwinsHouse,
        p_r_wins:  1 - pDwinsHouse,
        d_seats_mean:   mean(houseSeatCountsD),
        d_seats_median: quantile(houseSeatCountsD, 0.5),
        d_seats_p10:    quantile(houseSeatCountsD, 0.10),
        d_seats_p90:    quantile(houseSeatCountsD, 0.90),
        d_seats_p05:    quantile(houseSeatCountsD, 0.05),
        d_seats_p95:    quantile(houseSeatCountsD, 0.95),
      },
      senate: {
        p_d_wins:  pDwinsSenate,
        p_r_wins:  1 - pDwinsSenate,
        d_seats_mean:   mean(senateSeatCountsD),
        d_seats_median: quantile(senateSeatCountsD, 0.5),
        d_seats_p10:    quantile(senateSeatCountsD, 0.10),
        d_seats_p90:    quantile(senateSeatCountsD, 0.90),
        d_seats_p05:    quantile(senateSeatCountsD, 0.05),
        d_seats_p95:    quantile(senateSeatCountsD, 0.95),
      },
      joint: {
        p_d_trifecta:     trifectaCount  / N_TRIALS,
        p_d_house_only:   dHouseRSenate  / N_TRIALS,
        p_d_senate_only:  rHouseDSenate  / N_TRIALS,
        p_r_trifecta:     rTrifecta      / N_TRIALS,
      },
      national_swing: {
        mean:   mean(natSwings),
        p10:    quantile(natSwings, 0.10),
        p50:    quantile(natSwings, 0.50),
        p90:    quantile(natSwings, 0.90),
      },
    },
    distributions: {
      house_d_seats:   histogram(houseSeatCountsD, 1),
      senate_d_seats:  histogram(senateSeatCountsD, 1),
      national_swing:  histogram(natSwings, 0.5),
    },
    races: {
      house:  houseRaceResults,
      senate: senateRaceResults,
    },
    tipping_point_house: tippingByRace,
  };

  fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(`Wrote ${OUT}`);
  console.log('');
  console.log(`HOUSE  — P(D wins): ${(pDwinsHouse*100).toFixed(1)}%`);
  console.log(`         D seats: median ${result.summary.house.d_seats_median} ` +
              `[80% CI ${result.summary.house.d_seats_p10}–${result.summary.house.d_seats_p90}]`);
  console.log(`SENATE — P(D wins): ${(pDwinsSenate*100).toFixed(1)}%`);
  console.log(`         D-caucus seats: median ${result.summary.senate.d_seats_median} ` +
              `[80% CI ${result.summary.senate.d_seats_p10}–${result.summary.senate.d_seats_p90}]`);
  console.log('');
  console.log(`Joint:  D trifecta ${(trifectaCount/N_TRIALS*100).toFixed(1)}%, ` +
              `R trifecta ${(rTrifecta/N_TRIALS*100).toFixed(1)}%, ` +
              `split (D house only) ${(dHouseRSenate/N_TRIALS*100).toFixed(1)}%`);
}

simulate();
