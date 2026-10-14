# Australia's native plants

A single-page visualisation for **FIT3179 Data Visualisation 2**, by **Ng Jun Yu**. It explores native plant diversity, recorded locations, conservation status and protected-land coverage using **12 Vega/Vega-Lite charts**, including three different map types.

## Visual summary

- **Diversity:** compare plant families, recording coverage and state species counts.
- **Records:** explore annual documentation and sampled species locations.
- **Conservation:** compare national threat categories across families and jurisdictions.
- **Protection:** examine protected-land coverage across bioregions, states and territories.

Selectors, tooltips and data-derived captions help readers explore the charts.

## Run locally

With Python 3 installed, run from the repository folder:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000). Use `python3` on macOS/Linux. Keep the terminal running; press Ctrl+C to stop. Use an HTTP server rather than opening `index.html` directly. No npm installation or build step is required.

The original local workspace also has a `start.ps1` helper, which is excluded from Git.

## Main files

| File or folder     | Purpose                                          |
| ------------------ | ------------------------------------------------ |
| `index.html`       | Page content and structure                       |
| `css/style.css`    | Layout, colours and typography                   |
| `js/`              | Chart rendering, controls and generated captions |
| `site-config.json` | Author, student ID and metadata                  |
| `charts/`          | Readable Vega/Vega-Lite specifications           |
| `data/processed/`  | Published data, geography and source metadata    |
| `assets/`          | Local libraries, fonts and licences              |

## Data sources

Australian Plant Census, Atlas of Living Australia, DCCEEW national listings, CAPAD and ABS.

See the [source metadata](data/processed/dataset_metadata.json) and [data dictionary](data/processed/data_dictionary.json). Sources, dates, rights and AI assistance are acknowledged on the webpage. Source licences, including applicable noncommercial conditions, remain in effect.

Records describe documentation, not population size. Missing records or unmatched listings do not establish absence or safety. Protection comparisons do not demonstrate conservation recovery.
