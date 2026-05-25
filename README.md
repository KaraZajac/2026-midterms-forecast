# 2026 Midterms — Monte Carlo Forecast

Open-source forecast of the 2026 U.S. midterm elections (Nov 3, 2026). Synthesizes
Cook Political Report / Sabato's Crystal Ball / Inside Elections ratings, head-to-head
polling, presidential approval, generic-ballot trends, and historical midterm patterns
into a per-race win-probability model. 20,000-trial correlated-swing simulation produces
the seat-count posterior for both chambers.

**Forecast as of 2026-05-25** (162 days out):

|              | P(D wins) | Median D seats | 80% CI       |
|--------------|-----------|----------------|--------------|
| House (218+) | ~46%      | 216            | 192–237      |
| Senate (51+) | ~46%      | 50             | 47–53        |

Joint: D trifecta ~31%, R trifecta ~39%, D-House/R-Senate split ~15%, R-House/D-Senate split ~15%.

Both chambers genuinely on a knife's edge. The model is honest about how much can change
in five and a half months — σ<sub>national</sub> = 4 percentage points produces an 80% interval
on the House of roughly ±20 seats.

## What's in here

- `index.html` — the site. Open it directly in a browser, or serve it.
- `assets/styles.css` — Catppuccin Latte theme.
- `assets/app.js` — page rendering (loads `results.json` and `race_priors.json`, draws
  Chart.js histograms, the senate cartogram, and the race tables).
- `assets/race_priors.json` — per-race priors: expected margin, race-specific sigma,
  elasticity, rating consensus, notes. Produced by `scripts/build_priors.js`.
- `assets/results.json` — Monte Carlo output: seat-count distributions, per-race model
  win probabilities, tipping-point analysis, joint outcomes.
- `scripts/build_priors.js` — translates the source-material ratings and polls into the
  per-race prior spec.
- `scripts/montecarlo.js` — the 20,000-trial correlated-swing simulator.
- `sources/` — offline citations for every input, grouped by topic:
  - `sources/house/` — Cook/Sabato/IE ratings, retirements, redistricting deltas,
    Q1 fundraising, generic ballot, special elections, Trump approval.
  - `sources/senate/` — full Class 2 map, competitive-race deep dives, polling tables,
    fundraising, control math.
  - `sources/historical/` — midterm-penalty table (1934–2022), generic-ballot→seats
    translation, polling-error history, incumbency, Trump-era patterns, economic indicators.
  - `sources/maps/` — district-level PVI, 2024 House results, 2026 redistricting status,
    GeoJSON source identification, demographic shifts.

## Local run

No build step. Either:

```bash
open index.html
```

or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Reproducing the forecast

```bash
node scripts/build_priors.js          # rebuild assets/race_priors.json
node scripts/montecarlo.js 20000      # rerun the Monte Carlo (default 20k trials)
```

The simulation is seeded (`mulberry32(20260525)`) so the output is deterministic for a
given priors file. To resample with a different seed, edit the seed value at the top of
`scripts/montecarlo.js`.

## Model, briefly

For each trial *t*, draw one national environment from `nat_swing ~ N(0, 4)` percentage
points (House) and a correlated `nat_swing_sen` (ρ = 0.65). The mean of 0 reflects the
choice to anchor on the May 2026 rating consensus, which already prices ~38% Trump approval
and a D+6.6 generic ballot. σ = 4 reflects the empirical 6-months-out forecast error on
the generic ballot.

For each race *r*, draw the outcome margin:

```
margin_r = expected_margin_r + nat_swing · elasticity_r + N(0, sigma_race_r)
D wins iff margin_r > 0
```

`expected_margin_r` is derived from the rating consensus for the ~47 competitive House
districts and the 35 Senate races. For the other 388 House districts, it is computed from
Cook PVI plus an incumbency bonus, with `sigma_race` scaling with how marginal the seat is
(PVI ≤ 4 → σ = 2.5 pp; PVI 5–8 → 1.8; PVI 9–15 → 1.2; PVI > 15 → 0.7).

`elasticity_r` is 1.0 for open seats and ~0.88 for entrenched incumbents — incumbent
campaigns absorb some of the national environment.

Aggregation: seat counts are summed; chamber control is determined by the 218-House /
51-Senate threshold; joint outcomes are tallied per trial. Tipping-point analysis sorts
each trial's House races by sampled margin and finds the race sitting at the 218th seat.

## Important caveats

- This is May, not November. 162 days is a long time.
- Florida (May 4) and Tennessee (May 7) mid-decade redraws are weeks old; ratings on
  affected districts are still settling.
- Alaska and Maine use ranked-choice voting; the model treats both as single-round
  head-to-heads with wider sigma. Round-by-round dynamics could flip either by 5+ pp.
- The Texas Senate race depends on the May 26 Cornyn/Paxton runoff. If Paxton wins, the
  Likely R → Tilt R move (and the model's R+3 expected margin) is roughly right; if
  Cornyn survives, the seat reverts to Likely R / Solid R.
- Nebraska's Osborn (I) is assumed to caucus Democratic if elected. He has not committed.
- This is an analytical exercise. Not an electoral prediction service. Defer to the
  professionals.

## Sources

Every cited input has an offline snapshot under `sources/`. Per-section bibliographies are
in `sources/{house,senate,historical,maps}/INDEX.md`. Major sources: Cook Political Report,
Sabato's Crystal Ball (UVA Center for Politics), Inside Elections, RealClearPolling,
Wikipedia (consolidation), the American Presidency Project (historical midterm data),
Gallup (approval history), Cook PVI (geographic priors), The Downballot and Dave's
Redistricting App (district lean under 2026 lines).

## License

MIT.
