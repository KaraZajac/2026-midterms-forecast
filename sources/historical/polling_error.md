# Polling Error: Historical Accuracy & Variance Calibration

## Summary

For calibrating priors:

- **Senate polls (final 3 weeks):** weighted-average error ≈ **5.4 points** since 1998 (FiveThirtyEight, 2022). [Source: Silver, "Republicans Are Just A Normal Polling Error Away From A Landslide — Or Wiping Out," https://fivethirtyeight.com/features/2022-polling-error/]
- **Generic House ballot:** mean absolute error ≈ **2.1 points** since 1998; SD of error ≈ 2.5 points.
- **National presidential polls (final week):** mean absolute error ≈ **2.5–3 points** in 2016/2020/2024.
- **Bias direction recently:** polls have understated Trump-coalition Republicans by ~3 points in *presidential* years (2016, 2020, 2024). They were roughly unbiased in *midterm* years (2018, 2022).

## Cycle-by-cycle accuracy

### 2016
- National polls: showed Clinton +3.2, actual Clinton +2.1 → 1.1-point error (small at national level).
- Decisive state polls (MI, WI, PA): Trump under-estimated by 4–5 points each.
- Senate polls: average error ~4 points; Wisconsin (Johnson) and Pennsylvania (Toomey) under-stated Republicans by 5–7 points.

### 2018 (midterm)
- Generic ballot showed D+7.3, actual D+8.6 → error of −1.3 (toward Republicans).
- Senate polls: roughly accurate on average; Florida and Indiana had Republicans modestly underestimated (~2 points).
- This was the most accurate generic-ballot cycle since 2010.

### 2020
- National presidential: polls showed Biden +8, actual +4.5 → ~3.5-point pro-D miss.
- Senate polls: mean error ≈ 6 points, with systematic understatement of Republicans (Collins-ME off by ~13, Graham-SC off by 8, Ernst-IA off by 7). Largest Senate polling miss since at least 1980.
- Generic ballot showed D+7.3, actual D+3.1 → 4.2-point pro-D miss.
[Source: Silver, "Why Was The National Polling Environment So Off In 2020?" https://fivethirtyeight.com/features/why-was-the-national-polling-environment-so-off-in-2020/]

### 2022 (midterm)
- Generic ballot showed R+2.5, actual R+2.0 to R+2.8 → ~0–0.5-point error. Most accurate generic-ballot cycle since at least 1998.
- Senate polls: roughly accurate but with Republican overestimation in Pennsylvania (Oz, off by ~5 points pro-R) and Georgia (Walker, off by ~3 pro-R) — partly candidate-quality, partly poll under-rating of Democratic turnout post-Dobbs.
[Source: FiveThirtyEight 2022 polling recap; Pew Research, https://www.pewresearch.org/short-reads/2024/08/28/key-things-to-know-about-us-election-polling-in-2024/]

### 2024
- National presidential: polls showed roughly tied, actual Trump +1.5 → ~2-point pro-D miss (similar to 2016).
- Selzer Iowa: showed Harris +3, actual Trump +13 → 16-point miss (single most prominent outlier; partly idiosyncratic, partly methodological).
- Senate polls: under-stated Democrats in CA/NJ/MA (safe-D over-correction) and under-stated Republicans in OH (Moreno), PA (McCormick) by ~2–3 points.
- Generic House: roughly tied final average, actual R+2.7 → 3-point pro-D miss.
[Source: Pew, https://www.pewresearch.org/short-reads/2024/08/28/key-things-to-know-about-us-election-polling-in-2024/; NPR, https://www.npr.org/2024/11/12/nx-s1-5188445/2024-election-polls-trump-kamala-harris]

## Senate polling: variance summary

From FiveThirtyEight's pollster ratings (1998–2022):

- **Average miss:** 5.4 points (weighted by recency)
- **SD of error:** roughly 6.0 points
- **Largest cycle mean errors:** 2020 (~6 pts, pro-D bias); 2014 (~4 pts, pro-D bias); 1998 (~5 pts).

This is much larger than the generic ballot's ~2-point error because:
1. Senate samples are smaller per race.
2. Individual races have idiosyncratic candidate effects.
3. State-level non-response bias differs from national.

## 2026-applicable priors

Recommended SDs for the Monte Carlo:

| Quantity | SD |
|----------|-----|
| Generic ballot polling error (midterm) | 2.5 pts |
| Generic ballot polling error (presidential) | 4.0 pts |
| Single-state Senate polling error (3 weeks out) | 5.5 pts |
| Single-state Senate polling error (final week) | 4.5 pts |
| Correlated national polling error across states | 3.0 pts |

The last row is critical: polling errors are *correlated* across states. In 2020, ~75% of the state-level error in the seven closest Senate races moved in the same (pro-R) direction. Your variance budget should split between national-correlated error (≈3 points) and state-idiosyncratic error (≈4 points) rather than treating each state independently.

## Bias direction prior for 2026

Given:
- 2026 is a *midterm* (Trump not on ballot) → 2018/2022 pattern, near-zero bias.
- But Trump remains the dominant political figure → low-propensity GOP voters might still be missed.
- Recent methodology adjustments (recalled-vote weighting introduced by major pollsters in 2022) partially correct the Trump-era miss.

**Best prior:** assume a small (~1 point) pro-D bias in generic ballot and Senate polls, but place ~30% probability on either tail (3+ point pro-R bias if Trump-coalition non-response persists in midterm; 1–2 point pro-R bias if recalled-vote weighting overcorrects and we see a hidden-Democratic-anger turnout).
