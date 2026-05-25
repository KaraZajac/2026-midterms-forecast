#!/usr/bin/env node
// =============================================================================
// 2026 Midterms — Build per-race priors from the source materials
// =============================================================================
//
// Reads:
//   sources/maps/pvi_house.csv             — 435 districts on 2024 lines
//   sources/maps/pvi_senate.csv            — 50 states (Cook 2025 PVI)
// Encodes (from sources/house/ratings.md and sources/senate/competitive.md):
//   - the ~55 competitive House districts with Cook/Sabato/IE consensus
//   - the 35 Senate races on the 2026 ballot with poll-derived margins
//
// Writes:
//   assets/race_priors.json
//
// Each race entry has:
//   id              — "CA-22" or "GA-SEN"
//   chamber         — "house" | "senate"
//   incumbent_party — "D" | "R" | null (open)
//   expected_margin — D-share minus R-share, in percentage points, under the
//                     central scenario (ratings/polls already price the May
//                     2026 environment, so this is the central point estimate).
//   sigma_race      — race-specific idiosyncratic SD (pp).  Larger for
//                     toss-ups and races with thin polling.
//   elasticity      — how much a 1pt national swing moves this race.  ~1.0
//                     for open seats, ~0.7-0.8 for entrenched incumbents.
//   rating_consensus — short string for display
//   notes           — provenance / hand-curation reason
//
// The Monte Carlo (scripts/montecarlo.js) reads this file and samples.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC  = path.join(ROOT, 'sources');
const OUT  = path.join(ROOT, 'assets', 'race_priors.json');

// =============================================================================
// Rating → implied P(D wins)
// =============================================================================
// Averaged across Cook / Sabato / Inside Elections.  When raters disagree we
// average the underlying probabilities, not the labels.
const RATING_PROB = {
  'safe d':    0.99, 'solid d':   0.99,
  'likely d':  0.88,
  'lean d':    0.72,
  'tilt d':    0.62,
  'toss-up':   0.50, 'tossup': 0.50,
  'tilt r':    0.38,
  'lean r':    0.28,
  'likely r':  0.12,
  'safe r':    0.01, 'solid r':   0.01,
};

function ratingProb(label){
  const k = label.toLowerCase().replace(/\s*\(flip\)\s*/,'').trim();
  if (RATING_PROB[k] === undefined) throw new Error('unknown rating: '+label);
  return RATING_PROB[k];
}

function consensusProb(ratings){
  // ratings: array of label strings.  Returns mean P(D wins).
  const ps = ratings.map(ratingProb);
  return ps.reduce((a,b)=>a+b,0) / ps.length;
}

// Given a target P(D wins) under N(margin, sigma_total), back out margin.
// sigma_total combines national-environment SD and race idiosyncratic SD.
const SIGMA_NAT = 4.0;  // national swing SD, in pp

function probToMargin(p, sigmaRace){
  const sigmaTotal = Math.sqrt(SIGMA_NAT*SIGMA_NAT + sigmaRace*sigmaRace);
  return sigmaTotal * inverseNormal(p);
}

// Acklam-style inverse normal (good to ~1e-9 in tails we care about)
function inverseNormal(p){
  if (p <= 0) return -Infinity;
  if (p >= 1) return  Infinity;
  const a = [-3.969683028665376e+01,  2.209460984245205e+02, -2.759285104469687e+02,
              1.383577518672690e+02, -3.066479806614716e+01,  2.506628277459239e+00];
  const b = [-5.447609879822406e+01,  1.615858368580409e+02, -1.556989798598866e+02,
              6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
             -2.549732539343734e+00,  4.374664141464968e+00,  2.938163982698783e+00];
  const d = [ 7.784695709041462e-03,  3.224671290700398e-01,  2.445134137142996e+00,
              3.754408661907416e+00];
  const plow = 0.02425, phigh = 1 - plow;
  let q,r;
  if (p < plow){
    q = Math.sqrt(-2*Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= phigh){
    q = p - 0.5; r = q*q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    q = Math.sqrt(-2*Math.log(1-p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
            ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

// =============================================================================
// HOUSE — competitive districts (hand-curated from sources/house/ratings.md)
// =============================================================================
// Each row: [id, incumbent_party, [Cook, Sabato, IE], notes, optional override]
// "incumbent_party" is the party currently holding the seat (or party of the
// district under new lines for redrawn seats).  Override fields:
//   margin:      manually set expected_margin (overrides rating)
//   sigma:       manually set sigma_race
//   elasticity:  manually set elasticity (default 0.9 incumbent, 1.0 open)
//   open:        boolean — open seat
const HOUSE_COMPETITIVE = [
  // [id,           party, ratings,                              extras]
  ['AK-AL',  'R', ['Likely R','Likely R','Likely R'], {note:'RCV at-large'}],
  ['AZ-01',  'R', ['Toss-up','Toss-up','Toss-up'],   {open:true, note:'Schweikert running for gov'}],
  ['AZ-02',  'R', ['Likely R','Likely R','Likely R'], {}],
  ['AZ-06',  'R', ['Toss-up','Toss-up','Toss-up'],   {}],
  ['CA-01',  'D', ['Solid D','Safe D','Solid D'],    {open:true, note:'CA Prop 50 redraw flip'}],
  ['CA-06',  'D', ['Solid D','Likely D','Likely D'], {note:'Prop 50 redraw flip from Kiley R'}],
  ['CA-03',  'D', ['Lean D','Lean D','Tilt D'],      {note:'Prop 50 redraw flips Kiley R seat'}],
  ['CA-13',  'D', ['Lean D','Lean D','Tilt D'],      {}],
  ['CA-22',  'D', ['Toss-up','Toss-up','Tilt R'],    {note:'Incumbent-on-incumbent (Valadao R vs new D)'}],
  ['CA-40',  'D', ['Lean D','Lean D','Tilt D'],      {note:'Prop 50 redraw flips Kim R seat'}],
  ['CA-41',  'D', ['Lean D','Lean D','Toss-up'],     {note:'Prop 50 redraw flips Calvert R seat'}],
  ['CA-48',  'D', ['Lean D','Lean D','Tilt D'],      {open:true, note:'Issa retiring, Prop 50 redraw'}],
  ['CO-08',  'R', ['Toss-up','Toss-up','Toss-up'],   {}],
  ['FL-09',  'R', ['Likely R','Likely R','Likely R'],{note:'FL redraw flips Soto seat'}],
  ['FL-14',  'R', ['Lean R','Lean R','Toss-up'],     {note:'FL redraw flips Castor seat'}],
  ['FL-16',  'R', ['Solid R','Likely R','Tilt R'],   {open:true}],
  ['FL-22',  'R', ['Lean R','Lean R','Tilt R'],      {open:true, note:'New seat from FL redraw'}],
  ['FL-25',  'D', ['Toss-up','Toss-up','Tilt D'],    {open:true, note:'New seat from FL redraw'}],
  ['IA-01',  'R', ['Toss-up','Toss-up','Toss-up'],   {}],
  ['IA-02',  'R', ['Likely R','Likely R','Tilt R'],  {open:true, note:'Hinson running for Senate'}],
  ['IA-03',  'R', ['Toss-up','Toss-up','Lean R'],    {}],
  ['ME-02',  'R', ['Likely R','Lean R','Likely R'],  {open:true, note:'Golden retiring; was D-held'}],
  ['MI-04',  'R', ['Likely R','Lean R','Lean R'],    {}],
  ['MI-07',  'R', ['Toss-up','Toss-up','Toss-up'],   {}],
  ['MI-10',  'R', ['Lean R','Toss-up','Tilt R'],     {open:true, note:'James running for gov'}],
  ['MO-05',  'R', ['Lean R','Lean R','Tilt R'],      {note:'MO redraw flips Cleaver D seat (adopted 9/28/25)'}],
  ['MT-01',  'R', ['Likely R','Likely R','Toss-up'], {open:true, note:'Zinke retiring'}],
  ['NE-02',  'D', ['Lean D','Lean D','Tilt D'],      {open:true, note:'Bacon retiring (R)'}],
  ['NJ-07',  'R', ['Toss-up','Toss-up','Toss-up'],   {}],
  ['NV-01',  'D', ['Likely D','Likely D','Lean D'],  {}],
  ['NV-03',  'D', ['Lean D','Lean D','Lean D'],      {}],
  ['NC-01',  'R', ['Lean R','Lean R','Lean R'],      {note:'NC redraw flips Davis seat'}],
  ['NC-11',  'R', ['Likely R','Lean R','Toss-up'],   {}],
  ['NY-17',  'R', ['Toss-up','Lean R','Toss-up'],    {}],
  ['OH-01',  'D', ['Lean D','Lean D','Toss-up'],     {note:'OH redraw pressure'}],
  ['OH-09',  'D', ['Toss-up','Toss-up','Tilt R'],    {note:'OH redraw materially redder', margin:-1.5}],
  ['PA-01',  'R', ['Likely R','Lean R','Lean R'],    {}],
  ['PA-07',  'R', ['Toss-up','Toss-up','Toss-up'],   {}],
  ['PA-08',  'R', ['Toss-up','Lean R','Tilt R'],     {}],
  ['PA-10',  'R', ['Toss-up','Toss-up','Toss-up'],   {}],
  ['SC-01',  'R', ['Solid R','Safe R','Lean R'],     {open:true, note:'Mace running for gov'}],
  ['TN-09',  'R', ['Lean R','Lean R','Toss-up'],     {note:'TN redraw splits Memphis — flips Cohen D seat (adopted 5/7/26)'}],
  ['TX-09',  'R', ['Likely R','Likely R','Lean R'],  {note:'TX redraw dismantles Green coalition seat — was D'}],
  ['TX-15',  'R', ['Likely R','Likely R','Likely R'],{}],
  ['TX-23',  'R', ['Likely R','Likely R','Toss-up'], {note:'TX redraw'}],
  ['TX-28',  'D', ['Lean D','Lean D','Tilt D'],      {note:'TX redraw pressure on Cuellar'}],
  ['TX-32',  'R', ['Likely R','Likely R','Lean R'],  {note:'TX redraw dismantles Johnson coalition seat — was D'}],
  ['TX-34',  'D', ['Toss-up','Toss-up','Toss-up'],   {note:'TX redraw'}],
  ['TX-35',  'R', ['Likely R','Likely R','Tilt R'],  {open:true, note:'New TX seat'}],
  ['UT-02',  'D', ['Toss-up','Tilt D','Toss-up'],    {note:'UT court-ordered redraw flips Maloy R seat (adopted 11/10/25)'}],
  ['VA-01',  'R', ['Lean R','Lean R','Tilt R'],      {}],
  ['VA-02',  'R', ['Toss-up','Toss-up','Toss-up'],   {}],
  ['WA-03',  'D', ['Toss-up','Lean D','Tilt D'],     {note:'Gluesenkamp Perez — three different ratings'}],
  ['WI-01',  'R', ['Likely R','Likely R','Lean R'],  {}],
  ['WI-03',  'R', ['Toss-up','Toss-up','Tilt R'],    {}],
];

function sigmaFromConsensus(p){
  // Larger sigma where the race is uncertain (close to 0.5) and where raters
  // mostly say "toss-up".  Roughly: toss-ups get sigma 4.5, leans 3.5,
  // likelies 2.5, solids 1.0.
  const dist = Math.abs(p - 0.5);
  if (dist < 0.10) return 4.5;
  if (dist < 0.25) return 3.5;
  if (dist < 0.40) return 2.5;
  return 1.2;
}

function buildHouseRace(id, party, ratings, extras){
  const p = consensusProb(ratings);
  const sigma = extras.sigma ?? sigmaFromConsensus(p);
  const margin = extras.margin ?? probToMargin(p, sigma);
  const elasticity = extras.elasticity ?? (extras.open ? 1.00 : 0.88);
  return {
    id,
    chamber: 'house',
    incumbent_party: party,
    open: !!extras.open,
    expected_margin: round(margin, 2),
    sigma_race: sigma,
    elasticity,
    rating_consensus: prettyConsensus(p),
    rating_p_d_win: round(p, 3),
    rating_labels: ratings,
    note: extras.note || '',
  };
}

function prettyConsensus(p){
  if (p > 0.95) return 'Solid D';
  if (p > 0.80) return 'Likely D';
  if (p > 0.65) return 'Lean D';
  if (p > 0.55) return 'Tilt D';
  if (p >= 0.45) return 'Toss-up';
  if (p > 0.35) return 'Tilt R';
  if (p > 0.20) return 'Lean R';
  if (p > 0.05) return 'Likely R';
  return 'Solid R';
}

function round(x, d){ const k=Math.pow(10,d); return Math.round(x*k)/k; }

// =============================================================================
// HOUSE — bulk safe races from PVI CSV
// =============================================================================
function parsePviHouse(){
  const csv = fs.readFileSync(path.join(SRC,'maps','pvi_house.csv'),'utf8');
  const lines = csv.trim().split('\n');
  const header = lines.shift().split(',');
  return lines.map(line => {
    const cells = line.split(',');
    const row = {};
    header.forEach((h,i) => row[h] = cells[i]);
    return row;
  });
}

function pviToNumeric(s){
  // "R+7" → -7,  "D+5" → +5,  "EVEN" → 0
  if (!s || s === 'EVEN' || s === 'D+0' || s === 'R+0') return 0;
  const m = s.match(/^([DR])\+(\d+)/);
  if (!m) return 0;
  return (m[1] === 'D' ? 1 : -1) * parseInt(m[2],10);
}

function safeHouseRaceFromPvi(row){
  const pvi = pviToNumeric(row.pvi);
  const party = row.incumbent_party;
  // Translate PVI to a baseline D-R margin under a neutral national
  // environment.  Then add incumbency advantage of ~+2 to the incumbent.
  let margin = pvi * 1.4;
  margin += (party === 'D' ? 2.0 : -2.0);
  // Sigma scales with how marginal the seat is.  A PVI R+1 seat with a D
  // incumbent is empirically far more competitive than its label suggests.
  const absPvi = Math.abs(pvi);
  let sigma;
  if (absPvi <= 4) sigma = 2.5;
  else if (absPvi <= 8) sigma = 1.8;
  else if (absPvi <= 15) sigma = 1.2;
  else sigma = 0.7;
  // Compute the implied P(D wins) from the margin / sigma_total, and label
  // the seat by THAT (not by the incumbent's party).
  const sigmaTotal = Math.sqrt(SIGMA_NAT*SIGMA_NAT + sigma*sigma);
  const pD = normalCdf(margin / sigmaTotal);
  return {
    id: row.district,
    chamber: 'house',
    incumbent_party: party,
    open: false,
    expected_margin: round(margin, 2),
    sigma_race: sigma,
    elasticity: 0.85,
    rating_consensus: prettyConsensus(pD),
    rating_p_d_win: round(pD, 3),
    rating_labels: ['PVI-derived'],
    note: `PVI ${row.pvi}`,
  };
}

// Standard normal CDF via erf approximation (Abramowitz & Stegun 7.1.26)
function normalCdf(x){
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x*x/2);
  const p = d * t * (0.3193815 + t*(-0.3565638 + t*(1.781478 + t*(-1.821256 + t*1.330274))));
  return x > 0 ? 1 - p : p;
}

// =============================================================================
// SENATE — all 35 races (hand-curated from sources/senate/*.md)
// =============================================================================
// For competitive races we set the expected margin from polling-aware judgment
// rather than from raw ratings:
//
//  ME (Platner +7 polling, Collins long-time R-incumbent in D+2 state):
//      regress 50% to fundamentals → D+3.5
//  MI (open, Rogers +2/+2/+5 vs three D's, undecided high, R-trending state):
//      D-1.5
//  OH-Sp (Brown +1 latest, Husted +6 in Aug 2025; tightening; PVI R+6):
//      D+0.5 (Brown overperforms but PVI weight)
//  NC (Cooper +11; massive name-ID advantage; PVI R+3): D+5 (regress)
//  GA (Ossoff +5 vs Collins, +8 vs Dooley; R+2 state; incumbent at ~50): D+4
//  NH (Pappas modest lead; D+1 PVI): D+3
//  IA (Hinson Likely R, no strong D recruit, R+6 PVI): R-7
//  AK (Peltola +5-7 ASR but R+8 PVI + RCV unpredictable): D+1
//  TX (depends on R nominee; Talarico polled ahead of both; if Paxton wins
//      runoff candidate-quality penalty ~5pt; R+6 PVI):  D-3 with wide sigma
//  MN (Likely D; D+1 state but progressive primary risk Flanagan vs Craig): D+7
//  FL-Sp (Solid R/Likely R; Moody known statewide quantity): R-9
//  NE (Likely R; Osborn ran competitive 2024 but lost): R-8
//  LA, KY, AL, MT, WY, OK-Sp, SC, SD, WV, ID, MS, ND-not-on-ballot, etc.: Safe R
//  IL, MA, NJ, NM, OR, RI, VA, DE, CO: Safe D

const SENATE_RACES = [
  // [id,    party, expected_margin, sigma, elasticity, label, note]
  ['AL-SEN',  'R', -22, 1.5, 0.8, 'Solid R', 'Tuberville running for gov; open R'],
  ['AK-SEN',  'R', +1,  5.0, 0.9, 'Toss-up',  'Peltola (D) vs Sullivan (R-i); RCV; Sullivan re-elect at record low'],
  ['AR-SEN',  'R', -28, 1.0, 0.8, 'Solid R', 'Cotton (R-i) safe'],
  ['CO-SEN',  'D', +9,  1.8, 0.85,'Safe D',  'Hickenlooper (D-i)'],
  ['DE-SEN',  'D', +21, 1.0, 0.8, 'Solid D', 'Coons (D-i)'],
  ['FL-SEN-SP','R',-9,  3.5, 0.95,'Likely R','Moody (R-appt) vs Vindman (D); one outlier poll showed D+2'],
  ['GA-SEN',  'D', +4,  3.5, 0.90,'Lean D',  'Ossoff (D-i) vs Collins/Dooley R-runoff; Ossoff at/near 50 in polls'],
  ['ID-SEN',  'R', -32, 1.0, 0.8, 'Solid R', 'Risch (R-i)'],
  ['IL-SEN',  'D', +14, 1.5, 0.85,'Safe D',  'Open D (Durbin); Stratton (D) won primary'],
  ['IA-SEN',  'R', -7,  4.0, 0.95,'Likely R','Open R (Ernst retired); Hinson (R) vs Wahls/Turek/Sage (D)'],
  ['KS-SEN',  'R', -13, 1.5, 0.8, 'Solid R', 'Marshall (R-i)'],
  ['KY-SEN',  'R', -17, 1.8, 0.85,'Solid R', 'Open R (McConnell retired); Barr (R) vs Booker (D)'],
  ['LA-SEN',  'R', -16, 2.0, 0.9, 'Solid R', 'Cassidy lost primary; two R advanced; jungle primary'],
  ['ME-SEN',  'R', +3.5,4.0, 0.90,'Toss-up', 'Collins (R-i) vs Platner (D); Platner +7 in latest poll'],
  ['MA-SEN',  'D', +30, 1.0, 0.8, 'Solid D', 'Markey (D-i)'],
  ['MI-SEN',  'D', -1.5,4.0, 1.00,'Toss-up', 'Open D (Peters); Rogers (R) vs Stevens/McMorrow/El-Sayed (D primary 8/4)'],
  ['MN-SEN',  'D', +7,  2.5, 0.95,'Likely D','Open D (Smith); Craig vs Flanagan (D primary); Royce White likely R'],
  ['MS-SEN',  'R', -11, 1.5, 0.8, 'Solid R', 'Hyde-Smith (R-i)'],
  ['MT-SEN',  'R', -13, 2.5, 0.9, 'Likely R','Open R (Daines); messy R primary'],
  ['NE-SEN',  'R', -8,  3.0, 0.95,'Likely R','Ricketts (R-i) vs Osborn (I); Osborn outraised in Q1'],
  ['NH-SEN',  'D', +3,  3.5, 0.95,'Lean D',  'Open D (Shaheen); Pappas (D) vs Sununu (R)'],
  ['NJ-SEN',  'D', +14, 1.5, 0.85,'Safe D',  'Booker (D-i)'],
  ['NM-SEN',  'D', +8,  2.0, 0.85,'Safe D',  'Luján (D-i)'],
  ['NC-SEN',  'R', +5,  3.5, 0.95,'Lean D',  'Open R (Tillis); Cooper (D) vs Whatley (R); Cooper +11 polling, regressed'],
  ['OH-SEN-SP','R',+0.5,4.0, 0.95,'Toss-up', 'Husted (R-appt) vs Brown (D); poll-tightening; PVI R+6'],
  ['OK-SEN-SP','R',-19, 1.5, 0.85,'Solid R', 'Open R (Mullin-Armstrong); R primary 6/16'],
  ['OR-SEN',  'D', +14, 1.5, 0.85,'Safe D',  'Merkley (D-i)'],
  ['RI-SEN',  'D', +20, 1.0, 0.8, 'Solid D', 'Reed (D-i)'],
  ['SC-SEN',  'R', -12, 1.5, 0.8, 'Solid R', 'Graham (R-i)'],
  ['SD-SEN',  'R', -25, 1.0, 0.8, 'Solid R', 'Rounds (R-i)'],
  ['TN-SEN',  'R', -19, 1.5, 0.8, 'Solid R', 'Hagerty (R-i)'],
  ['TX-SEN',  'R', -3,  5.0, 0.95,'Tilt R',  'Cornyn (R-i) in runoff vs Paxton 5/26; Talarico (D) competitive in polls; Paxton candidate-quality risk'],
  ['VA-SEN',  'D', +8,  1.8, 0.85,'Safe D',  'Warner (D-i)'],
  ['WV-SEN',  'R', -33, 1.0, 0.8, 'Solid R', 'Capito (R-i)'],
  ['WY-SEN',  'R', -38, 1.0, 0.8, 'Solid R', 'Open R (Lummis retired); safe'],
];

function buildSenateRace(row){
  const [id, party, margin, sigma, elasticity, label, note] = row;
  const p = ratingProb(label.toLowerCase());
  return {
    id,
    chamber: 'senate',
    incumbent_party: party,
    open: /Open/.test(note),
    expected_margin: margin,
    sigma_race: sigma,
    elasticity,
    rating_consensus: label,
    rating_p_d_win: round(p, 3),
    rating_labels: [label],
    note,
  };
}

// =============================================================================
// National prior — synthesized from sources/historical/* and the May ratings.
// =============================================================================
// Trump approval ~38% (latest), generic ballot D+6.6 (latest).  Historical
// regression of midterm seat change on approval implies House Δ ≈ -28 R
// seats with residual SD 15 — Republicans losing the House decisively.
//
// Cook/Sabato/IE May ratings already encode an environment similar to that.
// So our central scenario is "the May ratings are right on average," and
// nat_swing represents uncertainty about how the environment evolves
// May → Nov (5.5 months) plus polling/forecast error.
//
// Empirically, midterm forecast error 6 months out (RCP generic ballot vs
// final House popular vote) is around 3-5 pp.  We use SD = 4 pp.
const NATIONAL_PRIOR = {
  as_of: '2026-05-25',
  election_date: '2026-11-03',
  days_until: 162,
  trump_approval_pct: 38,
  generic_ballot_d_pct: 6.6,
  nat_swing_mean_pp: 0.0,          // ratings = central case
  nat_swing_sigma_pp: SIGMA_NAT,
  house_senate_correlation: 0.65,  // national swings correlate across chambers
  current_house: { D: 215, R: 220 },
  current_senate: { D_caucus: 47, R: 53 },
  control_threshold: { house: 218, senate: 51 },
  notes: [
    'Trump approval ~38% (May 2026); historical regression at this approval gives House Δ ≈ -28 R, SD 15.',
    'Generic ballot D+6.6; comparable to May 2018 (which produced D+40 in November).',
    'Mid-decade redistricting partially offsets D environment: net +5-7 R structural seats (TX/FL/OH/NC/MO/TN vs CA/UT).',
    'Ratings as of May 8-21, 2026 (Cook 5/13, Sabato 5/8, Inside Elections 5/21).',
  ],
};

// =============================================================================
// Build
// =============================================================================
function main(){
  const competitiveIds = new Set(HOUSE_COMPETITIVE.map(r => r[0]));
  const houseCompetitive = HOUSE_COMPETITIVE.map(r => buildHouseRace(r[0], r[1], r[2], r[3]));

  const pviRows = parsePviHouse();
  const houseBulk = pviRows
    .filter(r => !competitiveIds.has(r.district))
    .map(safeHouseRaceFromPvi);

  const house = [...houseCompetitive, ...houseBulk].sort((a,b) => a.id.localeCompare(b.id));

  const senate = SENATE_RACES.map(buildSenateRace);

  const out = {
    meta: NATIONAL_PRIOR,
    house,
    senate,
  };

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`Wrote ${OUT}`);
  console.log(`  House: ${house.length} races (${houseCompetitive.length} competitive, ${houseBulk.length} bulk)`);
  console.log(`  Senate: ${senate.length} races`);
  // Sanity counts
  const dHouseExpected = house.filter(r => r.expected_margin > 0).length;
  const rHouseExpected = house.filter(r => r.expected_margin < 0).length;
  console.log(`  House central case: D-favored ${dHouseExpected}, R-favored ${rHouseExpected}`);
}

main();
