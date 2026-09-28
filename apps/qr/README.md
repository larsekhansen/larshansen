# QR-verkstedet

A QR code generator that lives at **[larshansen.dev/qr](https://larshansen.dev/qr/)**.
Type a link (or Wi-Fi details, a contact card, …), pick a look, check that it scans, download.
Everything runs in the browser: nothing is sent to a server, and the last design is kept in
`localStorage` so it is still there next time.

```bash
bun run dev:qr        # from the repo root → http://localhost:5173/qr/
bun run build:qr
bun test              # from apps/qr — encoder and scannability tests
```

## Plan

Inspired by qrcode-ai.com's generator, minus everything that needs a server.

| Feature | Status | How |
|---|---|---|
| Content types: link, text, Wi-Fi, e-mail, SMS, phone, contact card | ✅ | `src/content/encode.ts` — plain string formats (`WIFI:`, `mailto:`, `SMSTO:`, vCard 3.0) |
| UTM parameters on links | ✅ | Added to the URL client side |
| Templates + "surprise me" | ✅ | `src/design/templates.ts` — a template is just a set of style values |
| Dot / corner shapes, colors, gradient, background | ✅ | `qr-code-styling` |
| Logo in the middle | ✅ | `qr-code-styling`, error correction bumped to H automatically |
| Scannability meter | ✅ | Contrast/quiet-zone heuristics **plus** a real decode of the rendered image with `jsQR` |
| Download PNG, SVG, JPEG, WEBP · copy image | ✅ | `qr-code-styling` |
| Draft saved between visits | ✅ | `localStorage` |
| PDF / EPS export | ❌ | SVG covers print; PDF would need another library |
| Dynamic codes (edit target later, expiry, password, A/B test, analytics) | ❌ | Needs a redirect server — the site is static hosting |
| AI "QR art" | ❌ | Needs an image model |

### Open-source building blocks

| Library | License | Used for |
|---|---|---|
| [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) | MIT | Drawing styled codes and exporting images |
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | MIT | Version / size readout and the capacity check (same engine qr-code-styling uses) |
| [jsQR](https://github.com/cozmo/jsQR) | Apache-2.0 | Decoding the rendered code to prove it scans |
| React, Vite | MIT | UI and build |
| Archivo, IBM Plex Mono via Fontsource | OFL-1.1 | Self-hosted fonts (no Google Fonts request) |

## Code tour

The code is split by the three things the page does. Each folder has a plain `.ts`
module with the logic and `.tsx` components that only render it.

```
src/
├── App.tsx                  # holds the state (content + design) and lays out the page
├── content/                 # 1. WHAT the code says
│   ├── content.ts           #    field types, defaults, tab labels
│   ├── encode.ts            #    fields → the exact text stored in the QR code
│   └── ContentForm.tsx
├── design/                  # 2. HOW it looks
│   ├── design.ts            #    the Design type, defaults, option lists
│   ├── templates.ts         #    ready-made looks
│   ├── logo.ts              #    reading an uploaded logo
│   └── DesignPanel.tsx      #    the Maler / Stil / Logo tabs (+ one component per tab)
├── qr/                      # 3. Turning content + design into a QR code
│   ├── qrOptions.ts         #    Design → qr-code-styling options (the only place that knows the library's shape)
│   ├── qrInfo.ts            #    version, module count, capacity
│   ├── scannability.ts      #    the heuristic score and tips
│   ├── scanTest.ts          #    decodes the rendered image with jsQR
│   ├── renderQr.ts          #    PNG/SVG/… files for download, clipboard and the scan test
│   └── QrCode.tsx           #    draws one code on the page
├── preview/                 # the sticky preview: label, meter, downloads
└── ui/, hooks/              # small shared building blocks
```

One detail worth knowing: qr-code-styling writes each character as a single byte (Latin-1),
so `ø` would survive but `€` or an emoji would not. `toQrByteString()` in `qr/qrOptions.ts`
converts the text to UTF-8 bytes first, which is what phone scanners expect.

## Hosting

Built with `base: "/qr/"` and published into `/var/www/larshansen.dev/qr/` by
`.github/workflows/deploy.yml`. The landing page's `rsync --delete` excludes `/qr/`, so the
two apps share the domain without touching nginx or Cloudflare.
