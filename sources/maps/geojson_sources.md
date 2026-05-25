# GeoJSON / TopoJSON sources for the 2026 midterms map visualization

Goal: a US map for the GitHub Pages forecast site showing state and congressional district boundaries, low-resolution and web-suitable, with permissive licensing.

## Recommended primary source: `unitedstates/districts`

- **Repo:** https://github.com/unitedstates/districts
- **License:** Creative Commons Zero v1.0 Universal (CC0) - effectively public domain. Use without restriction.
- **Content:** GeoJSON shape files for federal legislative districts (House) at multiple Congresses, including data for current districts. Also includes KML and shapefile formats.
- **Pros:** No attribution required, designed for web reuse, hosted on GitHub (CDN via raw.githubusercontent.com or jsDelivr), maintained by the bipartisan civic-tech "@unitedstates" project.
- **Cons:** Repository was originally built for the 115th-118th Congresses; verify 119th coverage. May need to merge with Census 2024 cb files for the 119th boundaries and re-do for 2026 mid-decade-redrawn states.

[Source: @unitedstates/districts on GitHub, https://github.com/unitedstates/districts, fetched 2026-05-25]

## US Census Bureau Cartographic Boundary Files (authoritative, public domain)

- **Page:** https://www.census.gov/cgi-bin/geo/shapefiles/index.php?year=2024&layergroup=Congressional+Districts+(119)
- **Catalog:** https://catalog.data.gov/dataset/2024-cartographic-boundary-file-shp-119th-congressional-districts-for-united-states-1-20000000
- **License:** U.S. government work, public domain.
- **Content:** 119th Congressional Districts effective for the 2024 election cycle (does NOT yet reflect 2025-26 mid-decade redraws in TX, CA, MO, NC, OH, UT, TN, FL). Available at three resolutions: 1:500,000, 1:5,000,000, 1:20,000,000. Shapefile format - needs conversion to GeoJSON/TopoJSON.
- **Notes:** "Five states (Alabama, Georgia, Louisiana, New York, and North Carolina) delineated new boundaries for the 2024 election cycle, with all other states having no changes from 2022." The Census 2024 cb file is the 2024 baseline; for 2026 redistricted states you'll need to overlay state-provided shapefiles.

[Source: U.S. Census Bureau TIGER/Line, https://www.census.gov/cgi-bin/geo/shapefiles/index.php?year=2024&layergroup=Congressional+Districts+(119), 2024]

## US states (low-res, web-optimized)

- **Source:** https://github.com/topojson/us-atlas (and `us-atlas` npm)
- **License:** ISC (very permissive, MIT-equivalent)
- **Content:** Pre-built TopoJSON for U.S. states at 10m, 50m, 110m resolutions plus counties and nation outlines. Maintained by Mike Bostock (D3).js).
- **Use:** Drop-in for D3.js maps. The 10m (1:10,000,000) file is ~1.5 MB and ideal for a national overview.

[Source: topojson/us-atlas, https://github.com/topojson/us-atlas, license ISC, fetched 2026-05-25]

## Alternative / supplementary sources

| Source | Format | License | Use case |
|--------|--------|---------|----------|
| Jeffrey B. Lewis - congressional-district-boundaries (UCLA) | GeoJSON | Public-domain academic | Historical districts back to 1789, useful for cross-cycle visualizations. https://cdmaps.polisci.ucla.edu/ |
| Simplemaps US Congress | Shapefile/GeoJSON/SVG | Commercial (various tiers) | Skip - paid |
| Dave's Redistricting App | Shapefile/JSON | Permissive (with attribution) | Best for 2026 redrawn states since DRA publishes the new maps with partisan scoring. https://davesredistricting.org/ |
| Redistricting Data Hub | Shapefile | Free (academic, registration) | 2024 precinct + boundary disaggregation. https://redistrictingdatahub.org/ |
| 538 redistricting-atlas-data | CSV/JSON | MIT | Old atlas data, not 2026-current. https://github.com/fivethirtyeight/redistricting-atlas-data |

## Practical recommendation

For the GitHub Pages site:

1. **States layer:** use `us-atlas/states-10m.json` (TopoJSON, ~1.5 MB, ISC license, no attribution required practically).
2. **Districts layer:** start from Census cb_2024 `cb_2024_us_cd119_5m.zip` (5m resolution, ~1.5 MB shapefile). Convert to TopoJSON with `mapshaper` (`mapshaper input.shp -simplify dp 5% keep-shapes -o format=topojson cd119.topo.json`).
3. **Override for redistricted states:** for TX, CA, MO, NC, OH, UT, TN, FL — download the new-map shapefile from each state's redistricting authority (or pull from Dave's Redistricting App / Census once they publish 2026 boundary updates), and substitute those states' features in the TopoJSON.
4. **Bundle:** Final TopoJSON should be under 2 MB gzipped. Both layers fit comfortably under that.

All recommended sources permit redistribution without attribution. CC0 / public domain / ISC. We can mirror them into `assets/maps/` in this repo without legal concern.
