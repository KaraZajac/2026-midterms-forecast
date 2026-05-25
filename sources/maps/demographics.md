# Demographic shifts and reapportionment notes for the 2026 midterms

## Post-2020 reapportionment (applied starting 2022, still in effect for 2026)

The 2020 Census reapportionment shifted seven House seats among 13 states. The new totals were used for the 2022 and 2024 elections and remain in effect for 2026.

### States that gained seats

| State | Seats gained | New total |
|-------|--------------|-----------|
| Texas | +2 | 38 |
| Colorado | +1 | 8 |
| Florida | +1 | 28 |
| Montana | +1 | 2 |
| North Carolina | +1 | 14 |
| Oregon | +1 | 6 |

### States that lost seats

| State | Seats lost | New total |
|-------|------------|-----------|
| California | -1 | 52 |
| Illinois | -1 | 17 |
| Michigan | -1 | 13 |
| New York | -1 | 26 |
| Ohio | -1 | 15 |
| Pennsylvania | -1 | 17 |
| West Virginia | -1 | 2 |

Net: Sunbelt and Mountain West gained at the expense of the Rust Belt and Northeast. This pattern has held across the last several decennial cycles.

[Source: U.S. Census Bureau, 2020 Census Apportionment Results, https://www.census.gov/data/tables/2020/dec/2020-apportionment-data.html, 2021]
[Source: Ballotpedia, Congressional apportionment after the 2020 census, https://ballotpedia.org/Congressional_apportionment_after_the_2020_census, 2021]
[Source: Brennan Center, The 2020 Census Population and Apportionment Data, Explained, https://www.brennancenter.org/our-work/research-reports/2020-census-population-and-apportionment-data-explained, 2021]

## Demographic shifts since 2020 that may outpace the 2025 PVI update

The 2025 Cook PVI uses 2020 and 2024 presidential results, which captures most short-term shifts. However, the data is only updated through November 2024. Several demographic trends visible in 2024 are continuing and may push districts further than PVI implies for 2026.

### Rio Grande Valley and South Texas

The most dramatic 2020-2024 shift in the country. Hispanic-majority districts in South Texas moved hard toward Trump: TX-15 went from D+7 in 2020 PVI to R+5 by 2024 results, and TX-28 (Cuellar) and TX-34 (Vasquez area) have shifted similarly. The 2025 Texas redraw locks in the Republican shift; even before the redraw the underlying demographics had moved 10-15 points right since 2020.

[Source: Brookings, What the nation told us in 2024, state by state, https://www.brookings.edu/articles/what-the-nation-told-us-in-2024-state-by-state/, 2024-11]

### Florida (statewide drift)

Florida moved from a perennial swing state (R+1 PVI in 2020) to R+5 in the 2025 update. Miami-Dade went from D+7 in 2020 to R+11 in 2024 - one of the largest county-level shifts in the country. FL-26, FL-27, FL-28 are now solidly R when they were swing districts a decade ago. The 2026 Florida redraw further cements this.

[Source: Wikipedia, 2024 United States presidential election in Florida, https://en.wikipedia.org/wiki/2024_United_States_presidential_election_in_Florida, 2024-11]

### Asian and Latino urban precincts (NY, NJ, CA)

Districts with large Asian-American (Queens, Orange County) and Latino (Bronx, North Jersey, Central Valley) populations also shifted 5-10 points toward Trump in 2024. The PVI absorbs half of this (the 2024 cycle gets averaged with 2020) but if the trend continues, districts like NY-06 (Meng), NJ-09 (Pou), CA-22 (Valadao), CA-40 (Kim) may underperform their PVI by another few points in 2026. Worth modeling as a small additional R-shift prior in heavily Latino/Asian districts.

[Source: Sabato's Crystal Ball, How the States Vote Relative to the Nation: A 2024 Update, https://centerforpolitics.org/crystalball/how-the-states-vote-relative-to-the-nation-a-2024-update/, 2024]

### Educational polarization

Continuing trend: college-educated white voters moved D, non-college white and non-college non-white voters moved R. This drives:
- Suburban districts (NJ-07, PA-01, VA-07, MI-07, NY-03, NY-17, CA-49) becoming more D than PVI implies
- Rural and working-class districts (OH-13, PA-08, NY-19) becoming more R than PVI implies

For our model: the PVI is averaged across 2020 and 2024. If 2024-style polarization continues into 2026, districts on either side of the educational gradient should be expected to move further in their respective directions by ~1-2 points beyond what PVI shows. We may want to allow a small "trend extrapolation" prior - but cautiously, since reversion is also possible.

### Crossover districts (most relevant for the forecast)

After 2024 only 13 districts crossed the presidential winner (down from 23 in 2022). Of those, only 3 are Harris-district Republicans (the GOP held seats most exposed to a Dem midterm wave):
- PA-01 (Fitzpatrick) - Harris+1, R held by 12 points
- NE-02 (Bacon) - Harris+5, R held by 2 points  
- IA-01 (Miller-Meeks) - Trump+1, R held by 0.2 points (near-crossover)

Harris-district Republicans are the most likely Democratic pickups in 2026 absent a wave; their PVI numbers will already capture this.

[Source: Sabato's Crystal Ball, The 2024 Crossover House Seats, https://centerforpolitics.org/crystalball/the-2024-crossover-house-seats-overall-number-remains-low-with-few-harris-district-republicans/, 2024]

## Modeling implications

1. The 2025 PVI numbers in `pvi_house.csv` are the best single anchor for district-level priors as of May 2026.
2. For the 9 states with new 2026 maps, PVI must be recomputed on the new boundaries (see `redistricting_2026.md`).
3. Consider adding a small "ongoing trend" adjustment: heavily Latino districts trend R, college-educated suburbs trend D, on the order of 1-2 points beyond PVI. Don't overweight this - it might revert.
4. The R+1 to R+2 national PVI baseline shift seen in 2024 may itself be partially noise; the national fundamentals (incumbent-party penalty, generic ballot) should dominate any individual district trend in the prior.
