# ELS Performance Audit — Sprint 5a

**Date:** 2026-04-23  
**Motor:** 1,197,518 chars (tanakh.db, ketiv, 306k words)  
**Engine:** `els_search` subsampled-string, pure Python, no precompute  
**Platform:** macOS Darwin 25.3.0, Python 3.14

## Motor build time

`build_motor()` (SQL + concatenation): ~600–660ms. One-time cost per process.

## Search latency — skip[1,1000], full Tanakh

| target   | len | matches  | search_ms |
|----------|-----|----------|-----------|
| תורה     | 4   | 32,780   | 3,802     |
| יהוה     | 4   | 115,802  | 3,823     |
| משיח     | 4   | 7,386    | 3,329     |
| אלהים    | 5   | 3,665    | 3,555     |
| כתר      | 3   | 100,924  | 4,368     |
| תשובה    | 5   | 1,524    | 3,413     |
| גאולה    | 5   | 522      | 3,457     |

## Key observations

**Latency is uniformly ~3.5–4.4s for skip[1,1000].** The dominant cost is iterating
1,000 skip values × residue-class extraction, not str.find() itself (str.find is C-speed).
The per-skip overhead is dominated by Python loop overhead, not search complexity.

**Match density is highly target-dependent:**
- 3-char targets (כתר): ~100k matches — unusable without ranking or skip filtering
- 4-char targets (תורה, יהוה): 8k–116k matches depending on letter frequency
- 5-char targets (תשובה, גאולה): 522–3,665 — browsable with limit

**skip=1 matches are plain text occurrences** (contiguous letters), not ELS. Any UI should
default skip_min=2 or allow the caller to filter. WRR-94 itself focuses on skip≥2.

## Architectural decision

**API: synchronous is viable for narrow ranges (skip[40,60] ~= 40ms).** For broad ranges
(skip[1,1000]), synchronous is 3–4s — acceptable for a research tool but not a
real-time frontend. Options in order of implementation cost:

1. **Narrow default**: `--skip-min 2 --skip-max 300` reduces latency ~3× with no code change.
2. **Book scope filter**: searching Genesis alone (~96k chars) drops latency to ~300ms.
3. **Streaming/SSE**: yield results as they come, skip by skip — no precompute needed.
4. **Precomputed inverted index**: index motor by residue class for O(1) lookup per target.
   Only warranted for WRR-style batch experiments over many targets.

**Recommendation for Sprint 5c (API):** implement streaming endpoint (SSE or chunked JSON).
Síncrono works for CLI and for skip ranges ≤ 100. For the browser, stream.

## WRR canonical check

```
target=תורה  skip=[50,50]  motor=1,197,518chars  build=662ms  search=6ms
matches=3  — canonical: start=5, indices=(5,55,105,155), Genesis 1:1 … Genesis 1:5
```

Single fixed skip takes 6ms. WRR-style experiments (skip ± narrow window around 50)
are trivially fast.
