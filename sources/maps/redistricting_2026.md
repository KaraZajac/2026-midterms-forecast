# Redistricting status for the 2026 midterm elections

Snapshot date: 2026-05-25. This documents which states have new congressional maps in effect for Nov 3, 2026 versus the maps used in 2024. The 2025-26 mid-decade redistricting cycle is the largest coordinated mid-decade redraw in modern U.S. history.

## Summary of net partisan impact

Industry consensus (Cook Political Report, Democracy Docket, Wikipedia) is that the net effect of all confirmed-in-effect maps is **approximately +5 to +7 R seats** vs. the 2024 baseline, after partial Democratic counter-moves (CA, Virginia counter struck down). The big swings:

- Republican-favoring redraws (in effect): TX +5, NC +1, OH +2, MO +1, FL +4, TN +1
- Democratic-favoring redraws (in effect): CA +5, UT +1 (court-ordered)
- Struck down / litigation: VA Dem map invalidated; TX upheld at SCOTUS

[Source: Wikipedia, 2025-2026 United States redistricting, https://en.wikipedia.org/wiki/2025%E2%80%932026_United_States_redistricting, 2026-05]
[Source: Cook Political Report, 2025-26 Mid-Decade Redistricting Tracker, https://www.cookpolitical.com/redistricting/2025-26-mid-decade-map, 2026]
[Source: Ballotpedia, Redistricting ahead of the 2026 elections, https://ballotpedia.org/Redistricting_ahead_of_the_2026_elections, 2026]

## State-by-state table

| State | 2024 map | 2026 map | In effect? | Est. net partisan shift | Adoption / status |
|-------|----------|----------|-----------|--------------------------|--------------------|
| Texas (38) | 2021 GOP map | New 2025 GOP map | Yes (SCOTUS stay 12/2025, formally affirmed 4/2026) | +5 R | Adopted Aug 29, 2025. Targets TX-09, TX-28, TX-32, TX-34, TX-35 (Veasey, Cuellar/Casar, Doggett, Johnson, Green coalition seats) |
| California (52) | 2021 Commission map | New 2025 legislative map (Prop 50) | Yes | +5 D | Prop 50 passed 64.4% on Nov 4, 2025; effective for 2026-2030 |
| Missouri (8) | 2022 map | New 2025 map | Yes (pending litigation) | +1 R | Adopted Sep 28, 2025; targets MO-05 (Cleaver) |
| North Carolina (14) | 2023 GOP map | New 2025 GOP map | Yes | +1 R | Adopted Oct 22, 2025; targets NC-01 (Davis) |
| Ohio (15) | 2024 map | New 2025 map | Yes | +2 R | Adopted Oct 31, 2025 by Ohio Redistricting Commission; targets OH-01 (Landsman) and OH-09 (Kaptur), pushes from 10-5 R to projected 12-3 R |
| Utah (4) | 2021 GOP map | Court-ordered map | Yes | +1 D | Adopted Nov 10, 2025 (court-ordered); UT-02 becomes competitive/D-leaning |
| Tennessee (9) | 2022 map | New 2026 GOP map | Yes | +1 R | Adopted May 7, 2026; targets TN-09 (Cohen) by splitting Memphis |
| Florida (28) | 2022 GOP map | New 2026 map | Yes | +4 R | Adopted May 4, 2026; further reduces FL competitive districts |
| Virginia (11) | 2021 map | Proposed Dem map STRUCK DOWN | No - 2024 map in effect | 0 (counter-move blocked) | Dem-favoring map adopted Apr 21, 2026; invalidated by Virginia Supreme Court May 8, 2026 |
| Alabama (8) | 2023 court-ordered map | Same (in effect) | Yes - unchanged from 2024 | 0 | No 2025-26 changes after Allen v. Milligan compliance |
| Louisiana (6) | 2024 court-ordered map | Pending Callais SCOTUS ruling | Uncertain | 0 to +1 R | SCOTUS Callais v. Landry ruling pending; could trigger redraw |
| South Carolina (7) | 2022 map | Attempt failed May 2026 | No - 2024 map in effect | 0 | Redraw resolution failed in legislature |
| Georgia (14) | 2023 court-ordered map | Same | Yes - unchanged from 2024 | 0 | No active changes |
| New York (26) | 2024 court-redrawn map | Same | Yes - unchanged | 0 | IRC process didn't deliver new map; 2024 map stands |
| Wisconsin (8) | 2022 map | Same | Yes - unchanged | 0 | Counter-attempt did not pass |
| Maryland (8) | 2022 map | Same | Yes - unchanged | 0 | Voluntary counter-attempt did not pass |

[Source: Texas Tribune, 2025 Texas redistricting maps, https://www.texastribune.org/2025/09/04/2025-texas-redistricting-maps/, 2025-09-04]
[Source: NPR, Supreme Court lets Texas use gerrymandered map, https://www.npr.org/2025/12/04/nx-s1-5619692/supreme-court-texas-redistricting-map, 2025-12-04]
[Source: Wikipedia, 2025 California Proposition 50, https://en.wikipedia.org/wiki/2025_California_Proposition_50, 2025-11]
[Source: Ballotpedia News, New maps in Florida, Tennessee shift five more districts to Republicans, https://news.ballotpedia.org/2026/05/11/new-congressional-maps-in-florida-tennessee-aim-to-shift-five-more-districts-to-republicans-ahead-of-2026-midterms/, 2026-05-11]
[Source: Al Jazeera, Tennessee approves new congressional map, https://www.aljazeera.com/news/2026/5/7/tennessee-approves-new-congressional-map-in-latest-redistricting-flurry, 2026-05-07]
[Source: Stateline, The redistricting frenzy is scrambling the midterm elections, https://stateline.org/2026/05/15/the-redistricting-frenzy-is-scrambling-the-midterm-elections-heres-where-things-stand-now/, 2026-05-15]

## Districts that materially shift the 2026 seat math

The seats most likely to flip vs. their 2024 lines (not vs. 2024 outcomes, but vs. the lean a hypothetical 2024 rerun would produce):

**New Republican-leaning districts:**
- TX-28, TX-34, TX-35 (Rio Grande Valley redraw)
- TX-09, TX-32 (Houston/Dallas coalition seats dismantled)
- NC-01 (Don Davis seat)
- OH-01 (Landsman), OH-09 (Kaptur)
- MO-05 (Kansas City - Cleaver)
- FL: roughly 4 additional GOP-leaning districts (Tampa/Orlando areas)
- TN-09 (Memphis split)

**New Democratic-leaning districts:**
- CA: ~5 districts redrawn to favor Dems, targeting current R-held seats including CA-22 (Valadao), CA-40 (Kim), CA-41 (Calvert), CA-48 (Issa), CA-03 (Kiley)
- UT-02 (Maloy seat, court redraw makes it more competitive)

## Notes for the model

The 2024 House results in `results_2024_house.csv` are on the 2024 lines. The PVI numbers in `pvi_house.csv` are also on the 2024 lines (computed from pres-by-CD on 2024 boundaries). **Before running the 2026 forecast, those values need to be re-mapped to the 2026 boundaries** for the 9 states above with new maps. Cook indicated as of April 2025 that their PVI had not yet been recomputed for mid-decade redraws; the same caveat applies here.

Practical approach: for the redistricted states, use the new-map "presidential margin under the new lines" published by The Downballot, Dave's Redistricting App, or PlanScore as the 2026 prior, rather than the 2024-line PVI.

[Source: The Downballot data hub, https://www.the-downballot.com/data, 2026]
[Source: Dave's Redistricting App, https://davesredistricting.org/, 2026]
[Source: PlanScore, https://planscore.org/, 2026]
