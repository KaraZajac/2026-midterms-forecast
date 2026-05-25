# Historical Sources Index — 2026 Midterm Forecast Calibration

Compiled: 2026-05-25 for /Users/kara/Documents/Projects/2026-midterms/

These files form the **fundamentals half** of the Monte Carlo prior — empirical relationships between observable conditions (approval, economy, polling) and electoral outcomes (House seats, Senate seats, popular vote margin).

## Files

| File | Topic | Use in model |
|------|-------|--------------|
| [midterm_penalty.md](./midterm_penalty.md) | 1934–2022 table of approval, House Δ, Senate Δ; conditional means by approval bucket | Primary prior on president-party seat loss given approval |
| [exceptions.md](./exceptions.md) | 1934, 1998, 2002 deep dive — conditions under which the midterm penalty inverts | Tail-risk calibration; check whether any 1998/2002-like conditions hold for 2026 (none currently do) |
| [generic_ballot.md](./generic_ballot.md) | Generic ballot → House popular vote → seats; historical bias and translation | Polling-driven update to prior; defines swing ratio and seats-to-vote curve |
| [polling_error.md](./polling_error.md) | Historical accuracy of Senate, generic ballot, presidential polls; bias direction by cycle | Variance parameters for poll-based likelihood; conditional bias prior |
| [incumbency.md](./incumbency.md) | Decline of incumbency advantage; current best estimate House (~2–3 pts), Senate (~2–4 pts) | Per-race adjustment for incumbents; open-seat treatment |
| [trump_era.md](./trump_era.md) | Split-ticket collapse and partial rebound; candidate quality penalty (Mastriano/Walker/Lake); Trump-salience asymmetry | State-level Senate adjustments; explanation for 2022 vs 2018 asymmetry |
| [economic_indicators.md](./economic_indicators.md) | Real income, inflation, unemployment, gas prices as of May 2026 with historical β coefficients | Fundamentals input; supplements approval-based prior |

## Cross-references

- The 2018 case (Trump, 42% approval, −40 House) is the most relevant historical comparable for 2026.
- The 2022 case (Biden, 42% approval, −9 House) is the cautionary counter-example: similar fundamentals, very different outcome, driven by Dobbs + candidate quality + Trump-salience.
- 1958 and 2010 are the worst-case envelopes (big losses despite middling-to-high approval, driven by recession).

## Recommended priors (summary; full reasoning in `midterm_penalty.md` and `economic_indicators.md`)

| Quantity | Prior (mean, SD) |
|----------|------------------|
| House popular vote D−R margin (national) | D+5.5, SD 3.5 |
| House seats Δ for Republicans | −28, SD 15 |
| Senate seats Δ for Republicans | −1, SD 2.5 |
| Generic ballot polling bias (poll minus actual, +=pro-D) | +1.0, SD 2.0 |
| Senate state polling error SD | 4.5 (final week) |
| Incumbent advantage (House, competitive races) | 2.5, SD 1.0 |
| Incumbent advantage (Senate, competitive races) | 3.0, SD 1.5 |
| Candidate-quality penalty (flawed nominee) | 3.5 pts, SD 1.5 |

These are starting priors; the model should update them with actual 2026 polling, fundraising, primary results, and economic data as 2026 progresses.

## Notes on data quality

- Approval ratings 1946–present are Gallup (gold standard). Pre-Gallup 1934 approval is estimated from 1936 reelection results.
- Seat data is from American Presidency Project, cross-checked against Brookings Vital Statistics on Congress and Wikipedia.
- Economic data is BLS/BEA/FRED primary; political-science β coefficients are from peer-reviewed forecasting papers (Abramowitz, Hibbs, Bafumi-Erikson-Wlezien, Jacobson).
- Polling accuracy figures are from FiveThirtyEight pollster ratings and post-election reviews (Pew, AAPOR).

## Open questions / known gaps

1. Whether 2022's accurate polling was a methodological regime change or a one-cycle blip.
2. How much of the 2022 Democratic outperformance was Dobbs-specific vs. structural Trump-salience advantage.
3. The seat-to-vote curve under the 2024 House map (post-redistricting court orders in LA, AL, GA, NY).
4. Whether the partial 2024 ticket-splitting rebound is durable into 2026 (especially for D incumbents in Trump states: GA-Ossoff, NH-Shaheen open seat, ME, others).
