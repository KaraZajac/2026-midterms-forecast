# Generic Congressional Ballot → House Popular Vote → Seats

## Summary

The generic ballot (a poll asking which party's House candidate the respondent will vote for, without naming candidates) is the single best aggregate predictor of midterm House outcomes. Two translation steps matter:

1. **Generic ballot margin → actual national House popular vote margin.** Historically near unbiased on average, but with cycle-to-cycle errors of 2–4 points and a recent (2020) D overstatement of 4.2 points.
2. **Popular vote margin → House seats.** Asymmetric in the post-2010 era due to the partisan geography of districts (Democratic vote-share is concentrated in urban districts), giving Republicans a structural seats bias on the order of 2–3 points of popular vote.

## Generic ballot polling accuracy, 1998–2024

| Cycle | Final generic ballot margin (D−R) | Actual House popular vote margin (D−R) | Error (poll minus actual, + = pro-D bias) |
|------|--------|--------|---------|
| 1998 | D+2 | D+1.1 | +0.9 |
| 2000 | D+2 | D+0.0 | +2.0 |
| 2002 | R+1 | R+4.6 | +3.6 |
| 2004 | R+1 | R+2.6 | +1.6 |
| 2006 | D+11.5 | D+8.0 | +3.5 |
| 2008 | D+9 | D+10.6 | −1.6 |
| 2010 | R+9.4 | R+6.8 | −2.6 |
| 2012 | D+1.2 | D+1.4 | −0.2 |
| 2014 | R+2.4 | R+5.7 | +3.3 |
| 2016 | D+0.6 | D+1.1 | −0.5 |
| 2018 | D+7.3 | D+8.6 | −1.3 |
| 2020 | D+7.3 | D+3.1 | **+4.2** (largest pro-D miss in modern era) |
| 2022 | R+2.5 | R+2.8 (≈R+2.0 by some counts) | ≈0 to +0.5 |
| 2024 | D+1 (approx) | R+2.7 | **+3.7** (pro-D miss; Trump-on-ballot pattern) |

Sources: FiveThirtyEight historical generic-ballot averages; Wikipedia House election summaries; Split Ticket, "Estimating 2022's Generic Ballot," https://split-ticket.org/2022/12/12/estimating-2022s-generic-ballot/; FAIR, "In 2022 Midterms, Media Were Again Misled by Generic Ballot," https://fair.org/home/in-2022-midterms-media-were-again-misled-by-generic-ballot/; Silver, "Actually, sometimes polls underestimate Democrats," https://www.natesilver.net/p/actually-sometimes-polls-underestimate

**Mean absolute error 1998–2024:** roughly **2.1 points**.
**Mean signed bias 1998–2024:** roughly **+1.1 (slightly pro-Democratic)**.

**Cycle effect (critical for 2026):** In midterm cycles (Trump *not* on the ballot — 2018, 2022), the bias has been close to zero or slightly pro-Republican. In presidential cycles with Trump on the ballot (2016, 2020, 2024), the bias has been **+3 to +5 points pro-Democratic** because polls have systematically under-represented low-propensity Trump voters who turn out only when he is on the ticket. *2026 is a midterm without Trump on the ballot, suggesting the smaller midterm-style bias is the better prior.*

## Popular vote → seat translation

The Cook Partisan Voter Index and post-2010 redistricting analysis suggest a Republican seats bias:

- **2012:** Democrats won the House popular vote by 1.4 points but won only 201 of 435 seats (46.2%). Implied bias ≈ 5 points.
- **2018:** Democrats won by 8.6 points and won 235 seats (54.0%). Implied near-zero bias (heavy wave overcame structural tilt).
- **2020:** Democrats won by 3.1 points and won 222 seats (51.0%). Implied bias ≈ 1–2 points.
- **2022:** Republicans won by 2.8 points and won 222 seats (51.0%). Implied near-zero structural bias *after* post-2020 redistricting cycle (court-ordered NY/NC maps neutralized prior R bias).
- **2024:** Republicans won by 2.7 points and won 220 seats (50.6%). Implied near-zero bias.

Modern (post-2022) estimate: Democrats need to win the national popular vote by roughly **1–2 points to win a House majority** (down from ~3 points in 2018). [Sources: Wasserman/Cook Political Report, https://www.cookpolitical.com/; FairVote, "Shifts in Incumbency Advantage," https://fairvote.org/shifts_in_incumbency_advantage_in_the_us_house/]

## Practical translation function for 2026

For a Monte Carlo prior, a reasonable two-step linkage is:

  House popular vote margin (D−R) ≈ generic ballot margin (D−R) − 1.0 ± 2.5 (SD)

  Dem House seats ≈ 218 + 7 × (House popular vote D−R margin − 1.5) ± 8 seats (SD on the seat-to-vote curve itself)

The constants are rough; the implied "swing ratio" of ~7 seats per popular vote point is in the range Jacobson (2020) reports for the post-2010 House (5–8 seats/point depending on uniformity of swing).

## Key caveats for 2026

- Pollster herding intensified in 2022 and 2024. The dispersion of polls *understates* the true uncertainty.
- The generic ballot's accuracy improved markedly in 2022 (effectively zero error). Whether 2022 was the start of a new regime or a one-cycle blip is unknown; treat 2022 as one observation, not a structural shift.
- The seat-to-vote curve is itself uncertain because the 2026 House map has minor changes from 2024 (Louisiana, Alabama, Georgia court-ordered maps net +2–3 D seats vs. 2022 baseline).
