# Do I Have Light?

A static historical area lookup using an embedded April–May 2026 ECG-labelled timetable. **This is not a live electricity status service or a confirmed current schedule.**

[Demo](https://obj7.github.io/do-i-have-lights/) · [Case and limitations](docs/case-study.md)

## Implemented behavior

- Area search and region filtering; same-name entries in different groups remain distinguishable.
- Schedule calculations in Ghana time, with unknown status outside the embedded timeline.
- Optional browser GPS and OpenStreetMap Nominatim reverse geocoding; manual search remains available.
- Copyable results and generated timetable images.
- HTML/CSS/JavaScript with no application build step.

## Source and validity

The source contains an ECG-labelled 800MW timetable transcription with date labels 25 April–1 May 2026. The code interprets midnight slots as the following day, ending 2 May at 06:00 Ghana time. The personal schedule view begins 27 April. These are properties of the embedded dataset and calculation, not proof of current official applicability.

`DATA_PROVENANCE` records that original publication time and verification time are unknown. The original source and current ECG notices were not authenticated in this review. New October 2026 wording makes the historical status explicit rather than extrapolating the timetable indefinitely.

## Local use

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. Manual search needs no external service. GPS needs browser permission and an external request. Offline logic checks run against the actual page script with minimal DOM doubles:

```bash
node --test tests/core.test.cjs
```

Browser regression checks in `tests/browser.cjs` require Playwright and a local Chromium installation:

```bash
node tests/browser.cjs
```

## Privacy and limits

GPS sends rounded coordinates to Nominatim and caches returned place data locally. The interface explains the request before it occurs. No account is required. Provider policy compliance and production request rates remain unverified. A schedule match or “not scheduled off” result cannot establish actual supply.

## Verification and contribution

Local logic checks cover fixed date boundaries, unknown state, no match, ambiguous groups, and denied GPS/manual fallback. They use minimal DOM doubles and do not verify visual rendering. The browser suite could not run because Chromium was unavailable. Neither suite authenticates the original dataset or live demo. Documentation and the October 2026 reliability changes were prepared with substantial AI assistance. Prior source history is preserved.
