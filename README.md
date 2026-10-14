# Australia's native plants: diversity, risk & refuge

An original, single-page data story for **FIT3179 Data Visualisation 2**, by **Ng Jun Yu, Malaysia campus**. The author and student ID are loaded from `site-config.json`. The page compares documented native plant diversity, national threatened-species categories and terrestrial protected-land coverage.

All twelve diagrams use **Vega or Vega-Lite**. The site includes its libraries, fonts, data and readable chart specifications locally. Numeric findings are calculated from the published JSON.

## Start the webpage

With Python 3 installed, open a terminal in the repository folder and run:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

On macOS/Linux, use `python3` instead of `python`. Open [http://127.0.0.1:8000](http://127.0.0.1:8000), and keep the terminal running. Press Ctrl+C to stop it. Opening `index.html` directly does not load the JSON correctly; use an HTTP server. In the original local assignment workspace, the existing `start.ps1` helper can also start the server, but it is excluded from the published repository.

No npm installation, build step, CDN or ecological API is needed to view the site.

## Visual summary

| Section | Charts | What to learn |
|---|---|---|
| 1. A diverse flora | Treemap, coverage dots, richness bars, choropleth | Taxonomic composition, documentation coverage, geographic counts and proportions |
| 2. What the records reveal | Annual line, species point map | Recording effort over time and sampled documented footprints |
| 3. Diversity under pressure | Waffle, Sankey, matrix heatmap, proportional-symbol map | Extant national category composition, family contributions and jurisdictional patterns |
| 4. Protection in context | Bioregion histogram, state scatterplot | Uneven protection coverage and a descriptive comparison across eight jurisdictions |

The **three different map idioms** are a polygon-colour choropleth (proportion), an equal-size location point map (individual displayed records), and a proportional-symbol map (aggregated count). The same Australia-centred equal-area conic projection is used for all three.

Layout uses a shared spacing scale and four aligned regions in paired chart cards: header/controls, visual, finding and source caption. Reading notes share the same panel inset and heading rhythm. Paired diagrams use matching viewport heights; the enlarged state maps adapt to the available width. Panels use 24 px padding on desktop, 20 px on small laptops and 16 px on narrow screens, with consistent 24 px gaps.

Section numbers sit on the small label line above each title. Section titles, introductory paragraphs, insights and chart grids share the full content-column edges; transition paragraphs use the same width.

Eight idioms are proposed as advanced under the brief: treemap, the three maps, waffle, Sankey, matrix heatmap and histogram. Confirm the histogram classification with the tutor. Counts alone do not guarantee an HD; effectiveness, sketch alignment, submission and interview evidence remain essential.

Meaningful controls include family focus/reset in the treemap, a source-selected species selector, family highlighting in the Sankey, and jurisdiction highlighting in the scatterplot. Tooltips give exact values; text captions and printed labels provide information without hover. Navigation links scroll to sections without swapping them out.

The narrative opens with one research question, then guides the reader through four questions: locate diversity, examine occurrence evidence, follow assessed national risk and compare protected land. Each chart has a persistent finding and reading advice; three transitions explain why the next source or measure is needed. The ending returns to the opening question with three data-derived takeaways.

Annotations inside the diagrams include family counts, outlined family-coverage extremes, the highlighted richness leader, the highest threatened share, the full-year record peak and separate partial year, a selection-dependent sample footprint, exact flow/node counts, the outlined largest matrix cell, the leading threatened count, the modal protection bin and the highest-protection point. Numeric findings and callouts are calculated from the same JSON as the charts. Metadata distinguishes the webpage update date, data preparation date and each source's reference date; author, campus, source URLs/rights and AI assistance are visible.

## Published files

```text
index.html                         Page structure and explanatory prose
css/style.css                      Styling, layout and tooltip presentation
js/app.js                          Loading, chart rendering and controls
js/story.js                        Data-derived findings and captions
site-config.json                   Author, student ID and webpage metadata
charts/                            Twelve readable Vega/Vega-Lite specifications
data/processed/                    Chart data, geography, source metadata and rights
assets/                            Local libraries, fonts, licences and illustration
README.md                          Visual summary and startup instructions
docs/hand-drawn-sketch.pdf          Final sketch PDF, to be added by the student
```

Each chart links to its readable JSON. Specification source URLs resolve relative to the website root. The page loads shared tables once and updates the chart signals through its selectors.

## Data sources and interpretation

The page combines Australian Plant Census native taxonomy, Atlas of Living Australia occurrence records, DCCEEW national threatened-species listings, CAPAD protection summaries and ABS geography.

See [source and processing metadata](data/processed/dataset_metadata.json) and the [data dictionary](data/processed/data_dictionary.json). Source dates, URLs, rights and contributing-provider citations are also visible on the webpage. Author metadata and the AI acknowledgement are retained.

Recorded species are affected by documentation and filtering. A missing record does not establish absence. No verified threat match does not establish safety. Displayed point samples do not establish abundance or the complete species range. State species counts are not additive nationally. The protection comparison is descriptive and does not demonstrate conservation recovery.

Source-derived data retain their own licence conditions, including noncommercial conditions where applicable. Font and library licences are included in `assets/`.

## GitHub Pages and assignment artifacts

Publish the repository through GitHub Pages using the `main` branch and `/(root)` folder. Keep `index.html` at the repository root. Test the deployed page, charts, controls, source assets and chart-specification links while signed out.

Part C separately requires a public GitHub URL for a PDF containing the completed hand-drawn sketch. Save it as **`docs/hand-drawn-sketch.pdf`**; this path is allowed by `.gitignore`. The file has not been created automatically. Publish it and use its actual GitHub URL in the submission template.

The ignore rules keep planning, preparation scripts, raw/interim data, caches, temporary screenshots, the supplied assignment brief/template, topic notes and the rough sketch local. They are not deleted. Complete the final template, screenshots, sketch alignment and interview as required by the supplied brief.
