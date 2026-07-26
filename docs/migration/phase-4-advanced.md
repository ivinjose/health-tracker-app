# Phase 4 — Advanced / Platform-Specific Features

**Goal:** Port PDF viewing, report file upload, and OCR — or define acceptable mobile alternatives.

**Estimated effort:** 2–5 days (high uncertainty; **deferrable**)

**Prerequisites:** [Phase 2 Reports screen](./phase-2-core-crud.md) exists with manual entry working.

**Next phase:** [phase-5-cleanup.md](./phase-5-cleanup.md)

---

## 4.1 Web features to assess

From `health-tracker/src/pages/ReportsPage/ReportsPage.jsx`:

```js
import { createWorker } from 'tesseract.js';
import { PDFParse } from 'pdf-parse';
// File input → OCR → auto-fill form fields
```

Related components:

| Web file | Purpose |
|----------|---------|
| `src/components/PDFViewer/PDFViewer.jsx` | Render PDF pages (`react-pdf`) |
| `src/components/ViewReport/ViewReport.jsx` | Report detail with PDF attachment |

---

## 4.2 PDF viewing

### Problem

`react-pdf` (PDF.js) is browser/DOM-oriented and does not run natively on iOS/Android.

### Options

| Approach | Packages / APIs | Best for |
|----------|-----------------|----------|
| **A. Open externally** | `expo-linking`, `expo-web-browser` | Fastest v1 |
| **B. In-app native viewer** | `react-native-pdf`, `expo-file-system` | In-app UX |
| **C. Web-only** | Keep `react-pdf` when `Platform.OS === 'web'` | Expo web target |

### Recommendation

Start with **A** — "View report" opens PDF in device browser or system PDF app. Upgrade to **B** if in-app viewing is required.

### Expo targets

- `components/ViewReport.jsx`
- Wire into `ReportCard` actions menu
- Optional route: `app/(tabs)/reports/[reportId].jsx`

---

## 4.3 File upload

### Web pattern

```html
<input type="file" accept=".pdf,image/*" />
```

### Mobile packages

```bash
npx expo install expo-document-picker expo-image-picker
```

| Use case | Package |
|----------|---------|
| PDF documents | `expo-document-picker` |
| Photo of lab report | `expo-image-picker` |

### Tasks

1. Add "Attach report" to `components/NewReportDialog.jsx`
2. Store file URI / base64 for upload
3. Confirm backend payload shape (web may send `report` as URL, base64, or multipart)
4. Extend `ReportsApiManager.createReport` if multipart is required

---

## 4.4 OCR strategy

### Web stack

- `tesseract.js` — browser worker
- `pdf-parse` — Node/browser worker for PDF text extraction

### Problem on native

Workers are browser-oriented; `pdf-parse` is Node-oriented; performance and bundle size are concerns on mobile.

### Options

| Option | Effort | UX |
|--------|--------|-----|
| **A. Web-only OCR** | Low | Manual entry on iOS/Android; OCR on Expo web |
| **B. Server-side OCR** | Medium | Upload → backend OCR → return parsed values |
| **C. Native OCR** | High | `react-native-tesseract-ocr`, ML Kit, etc. |

### Recommendation for v1

**Option A** — ship upload + view on mobile; port web OCR logic behind `Platform.OS === 'web'`:

```jsx
{Platform.OS === "web" && (
  <OcrUploadSection onValuesExtracted={...} />
)}
```

Plan **Option B** as a backend follow-up if mobile OCR is required.

### If implementing web OCR block

Copy from `ReportsPage.jsx`:

- Tesseract worker setup
- PDF parse + text extraction
- Auto-fill investigation, value, date fields

Ensure PDF worker path works on Expo web (`public/workers/` or equivalent).

---

## 4.5 Port ViewReport flow

### Web source

- `health-tracker/src/components/ViewReport/ViewReport.jsx`

### Expo target

- `components/ViewReport.jsx`

### Display

- Report metadata: investigation, value, date, remarks
- Attached file: preview/open button (per 4.2 strategy)
- Navigation: modal or stack screen

---

## 4.6 WidgetView (optional)

### Web source

- `health-tracker/src/components/WidgetView/WidgetView.jsx`

Check usages. If it is only a card wrapper already covered by `CardView`, skip. Otherwise port as a thin RN wrapper.

---

## Decision log (fill in when implementing)

| Decision | Choice | Date | Notes |
|----------|--------|------|-------|
| PDF viewing | A / B / C | | |
| OCR | A / B / C | | |
| Upload formats | PDF only / PDF + images | | |

---

## Testing checklist

- [ ] Pick and attach PDF/image on iOS
- [ ] Pick and attach PDF/image on Android
- [ ] View attached report (in-app or external)
- [ ] OCR auto-fill works on Expo web (if Option A)
- [ ] Manual entry still works when OCR skipped on native
- [ ] Large files do not crash the app
- [ ] Permissions handled (camera, photo library, documents)

---

## Exit criteria

- Report attachments viewable on mobile
- OCR documented as web-only or implemented per chosen strategy
- No regression to Phase 2 manual report entry

---

## Skip criteria

You may defer entire Phase 4 if manual report entry is sufficient for v1. Document in README:

> Native PDF/OCR not yet supported. Use web app or manual entry on mobile.
