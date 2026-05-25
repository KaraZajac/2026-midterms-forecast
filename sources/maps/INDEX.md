# sources/maps - Index

Geographic substrate and structural per-seat priors for the 2026 midterm forecast.

Last assembled: 2026-05-25.

## Files

### CSV data

- **`pvi_house.csv`** - 435 rows. Columns: `district, pvi, incumbent_party, pres_margin_2024, incumbent_name`. The PVI value is computed from 2020 + 2024 presidential results using the official Cook PVI formula (avg of two-cycle two-party lean minus national); should match published Cook 2025 PVI within ±1 point on virtually all districts. Districts are on 2024 boundaries.
- **`pvi_senate.csv`** - 51 rows (50 states + DC). Columns: `state, state_abbr, pvi, pres_margin_2024, trump_pct_2024, harris_pct_2024, senate_up_2026`. State-level Cook PVI values are direct quotes from the 2025 Cook update (via Wikipedia transcription). `senate_up_2026` flags Class 2 regular elections plus FL and OH specials.
- **`results_2024_house.csv`** - 435 rows. Columns: `district, d_pct, r_pct, margin_d_minus_r, winner_2024`. Source: U.S. House Clerk's official 2024 statistics PDF. Confirmed 215 D wins / 220 R wins, matching official totals exactly. For top-two same-party races (e.g. CA-12, CA-16, CA-20) the percentages are aggregated to one party.

### Markdown notes

- **`redistricting_2026.md`** - State-by-state status of 2025-26 mid-decade redistricting. Identifies the 9 states with new 2026 maps and estimated net partisan impact.
- **`geojson_sources.md`** - Public-domain / permissively licensed geographic data sources for the map visualization. Includes recommended workflow (Census cb_2024 + us-atlas + state-by-state overrides for redrawn states).
- **`demographics.md`** - Reapportionment cheat sheet from the 2020 Census and notes on demographic shifts that may have outpaced the 2025 PVI update.

## Source attribution

| Data | Source | URL | Retrieved |
|------|--------|-----|-----------|
| Cook PVI state-level 2025 | Cook Political Report (via Wikipedia transcript) | https://en.wikipedia.org/wiki/Cook_Partisan_Voting_Index | 2026-05-25 |
| Pres-by-CD 2020 + 2024 (basis for our PVI calc) | The Downballot | https://docs.google.com/spreadsheets/d/1ng1i_Dm_RMDnEvauH44pgE6JCUsapcuu8F2pCfeLWFo | 2026-05-25 |
| State pres results 2024 | Wikipedia "2024 United States presidential election" | https://en.wikipedia.org/wiki/2024_United_States_presidential_election | 2026-05-25 |
| 2024 House results | Office of the Clerk, U.S. House | https://clerk.house.gov/member_info/electionInfo/2024/statistics2024.pdf | 2026-05-25 |
| Redistricting status | Wikipedia "2025-2026 United States redistricting", Cook, Ballotpedia, Stateline | (see redistricting_2026.md) | 2026-05-25 |
| Reapportionment | U.S. Census, Ballotpedia | https://www.census.gov/data/tables/2020/dec/2020-apportionment-data.html | 2026-05-25 |

## Known data-quality caveats

1. **District PVI is our computation, not Cook's published number.** Cook does not publish district PVI in machine-readable form (subscriber-only). We back-computed from Downballot's pres-by-CD using the official Cook formula. Expected accuracy: ±1 point vs Cook's published 2025 PVI on virtually every district, with rare ±2 differences due to Downballot rounding percentages to integers. If exact Cook numbers are needed for marketing or for a published-comparison plot, manually pull from cookpolitical.com via subscription.

2. **PVI and 2024 results are on 2024 district lines.** Nine states have new 2026 maps (TX, CA, MO, NC, OH, UT, TN, FL plus pending LA). Before running the 2026 forecast, the PVI for those states' districts must be recomputed on the new lines. See `redistricting_2026.md`.

3. **Top-two same-party races (CA, LA, WA).** In `results_2024_house.csv`, the percentages for these races sum to one party (e.g. CA-12 shows 100% D). The winner is correctly identified; the margin is artificial. Don't use these specific district margins as a national benchmark - filter them out for any "average margin" calculation.

4. **Uncontested races.** Several races (AL-03, AL-04, AL-05, FL-20, OK-03 and similar) had only one major-party candidate. Encoded as 0% / 100%. The Clerk PDF reports these as "(1)" with no vote total; we coded by winning party.

5. **AK uses ranked choice voting.** The AK-AL margin reflects first-choice tallies; the actual winner (Begich) was determined after RCV elimination rounds. The first-choice numbers we have are slightly off from the certified two-candidate final tally but are the cleanest single number available.

6. **Cook PVI vs presidential margin.** Note that PVI and `pres_margin_2024` are correlated but not identical. PVI averages 2020+2024 and is relative to the nation; pres margin is just 2024 absolute. For most modeling purposes PVI is the better feature; use pres margin for trend checks.

## Re-running the data assembly

The Clerk PDF is the source of truth for 2024 House results. The parser is brittle to PDF format changes; if the Clerk republishes (rare), re-run the extraction script and re-validate against the 215 D / 220 R seat totals.

Downballot may update their pres-by-CD spreadsheet as state recounts certify. The current values are as of late November 2024 and shouldn't change materially.
