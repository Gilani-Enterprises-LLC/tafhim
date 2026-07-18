# QuranUrdu Tafheem Clone

A simple static modernization of https://www.quranurdu.com/tafa/.

## Stack
- Plain HTML
- Plain CSS
- Plain JavaScript
- XML manifest for audio records
- Browser localStorage for theme, history, and last-played state

## Features
- Mobile-first responsive layout
- Dark theme by default, optional light theme toggle
- Local playback history in the browser
- Resume/jump to the last audio played
- Anonymous access with no database

## Commands
- `npm run build` — build static files into `dist/`
- `npm run qa` — lightweight QA checks
- `npm run review` — lightweight review checks

## Notes
- `src/audios.xml` contains the generated audio manifest.
- `source.html` and `volume0*.html` are source snapshots used to derive the manifest.
