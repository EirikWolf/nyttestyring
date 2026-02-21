# Hemit Nyttestyring — Alle tester

> Vitest • 146 tester • 2 testfiler

---

## Fil 1: `src/__tests__/utils.test.js`

### autoHours
| # | Test | Forventet |
|---|------|-----------|
| 1 | 100% tilgjengelighet, 2 uker = 75t | `autoHours(100, 2) → 75` |
| 2 | 50% tilgjengelighet, 2 uker = 37.5t | `autoHours(50, 2) → 37.5` |
| 3 | 0% tilgjengelighet gir 0 | `autoHours(0, 2) → 0` |
| 4 | default weeks=2 | `autoHours(100) → 75` |
| 5 | 4 uker ved 100% = 150t | `autoHours(100, 4) → 150` |
| 6 | avrunder korrekt til 1 desimal | `autoHours(33, 2) → 24.8` |
| 7 | HRS_WEEK er 37.5 | `HRS_WEEK → 37.5` |

### fmtSize
| # | Test | Forventet |
|---|------|-----------|
| 1 | bytes (under 1 KB) | `fmtSize(500) → "500 B"` |
| 2 | 0 bytes | `fmtSize(0) → "0 B"` |
| 3 | nøyaktig 1 KB-grense | `1023 → "1023 B"`, `1024 → "1.0 KB"` |
| 4 | kilobytes | `fmtSize(2048) → "2.0 KB"` |
| 5 | nøyaktig 1 MB-grense | `1048575 → "1024.0 KB"`, `1048576 → "1.0 MB"` |
| 6 | megabytes | `fmtSize(5242880) → "5.0 MB"` |
| 7 | desimaler i KB | `fmtSize(1536) → "1.5 KB"` |

### findDupes
| # | Test | Forventet |
|---|------|-----------|
| 1 | finner duplikater basert på overlappende ord (substring-match) | Matcher T-001 på "innmelding saker automatisere" |
| 2 | returnerer tom array for kort tittel (under 5 tegn) | `findDupes("ABC", tasks) → []` |
| 3 | returnerer tom array for tom/null tittel | `findDupes("", tasks) → []` |
| 4 | ignorerer korte ord (3 tegn eller mindre) | `findDupes("En ny for oss", tasks) → []` |
| 5 | maks 5 resultater (A6: økt fra 3) | `result.length ≤ 5` |
| 6 | case-insensitive matching | Matcher på "AUTOMATISERE INNMELDING" |

### ts (timestamp)
| # | Test | Forventet |
|---|------|-----------|
| 1 | returnerer streng i format YYYY-MM-DD HH:MM | Matcher `/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/` |
| 2 | er 16 tegn lang | `ts().length → 16` |

### td (date)
| # | Test | Forventet |
|---|------|-----------|
| 1 | returnerer streng i format YYYY-MM-DD | Matcher `/^\d{4}-\d{2}-\d{2}$/` |
| 2 | er 10 tegn lang | `td().length → 10` |

### getTheme
| # | Test | Forventet |
|---|------|-----------|
| 1 | returnerer LT for false/undefined | `getTheme(false) → LT` |
| 2 | returnerer DK for true | `getTheme(true) → DK` |
| 3 | LT har lyse farger | `LT.bg → "#F5F7FA"`, `LT.surface → "#FFFFFF"` |
| 4 | DK har mørke farger | `DK.bg → "#0F1A2E"`, `DK.surface → "#162038"` |

### validTransition (A5)
| # | Test | Forventet |
|---|------|-----------|
| 1 | tillater alle overganger | Alle statusoverganger returnerer `true` |

### calcLeadTime (D4)
| # | Test | Forventet |
|---|------|-----------|
| 1 | beregner dager fra opprettet til done | `→ 10` (1. jan – 11. jan) |
| 2 | returnerer null uten done-historikk | `→ null` |
| 3 | returnerer null uten historikk | `→ null` |

### calcCycleTime (D4)
| # | Test | Forventet |
|---|------|-----------|
| 1 | beregner dager fra in-progress til done | `→ 7` (5. jan – 12. jan) |
| 2 | returnerer null uten in-progress-historikk | `→ null` |

### calcRealizationPct (A.11)
| # | Test | Forventet |
|---|------|-----------|
| 1 | beregner 100% når faktisk = mål | `calcRealizationPct("12","5","5") → 100` |
| 2 | beregner 0% når faktisk = baseline | `→ 0` |
| 3 | beregner 50% halvveis | `calcRealizationPct("10","0","5") → 50` |
| 4 | beregner over 100% ved overoppnåelse | `→ 150` |
| 5 | returnerer null ved manglende verdier | `→ null` |
| 6 | returnerer null når baseline = mål (divisjon med null) | `→ null` |
| 7 | håndterer ikke-numeriske verdier | `→ null` |

### BENEFIT_UNITS (A.11)
| # | Test | Forventet |
|---|------|-----------|
| 1 | inneholder minst 5 enheter | `length ≥ 5` |
| 2 | hver enhet har id og label | Alle har `id` og `label` |

### BENEFIT_CATEGORIES (A.11)
| # | Test | Forventet |
|---|------|-----------|
| 1 | inneholder minst 5 kategorier | `length ≥ 5` |
| 2 | hver kategori har id og label | Alle har `id` og `label` |
| 3 | inneholder standard nyttekategorier | Inneholder `cost`, `time`, `quality` |

### SP – Spacing system (B.13)
| # | Test | Forventet |
|---|------|-----------|
| 1 | har alle 6 spacing-verdier | `{xs:4, sm:8, md:12, lg:16, xl:24, xxl:32}` |
| 2 | verdiene øker monotont | Hvert steg er større enn forrige |
| 3 | alle verdier er positive heltall | `> 0` og `Number.isInteger` |

### fmtDate – Norske datoformater (B.8)
| # | Test | Forventet |
|---|------|-----------|
| 1 | returnerer 'Nå' for tidspunkt < 60 sekunder siden | `→ "Nå"` |
| 2 | returnerer 'X min siden' for tidspunkt innenfor en time | Matcher `/^\d+ min siden$/` |
| 3 | returnerer 'X t siden' for tidspunkt innenfor et døgn | Matcher `/^\d+ t siden$/` |
| 4 | returnerer 'I går' for tidspunkt 1-2 dager siden | `→ "I går"` |
| 5 | returnerer 'X d siden' for tidspunkt innenfor en uke | Matcher `/^\d+ d siden$/` |
| 6 | returnerer absolutt dato for tidspunkt eldre enn en uke | Inneholder "jan" og årstall |
| 7 | returnerer absolutt dato ved style='absolute' | Inneholder "jun" og årstall |
| 8 | returnerer tom streng for falsy input | `fmtDate("") → ""` |
| 9 | returnerer original streng for ugyldig dato | `fmtDate("ikke-en-dato") → "ikke-en-dato"` |
| 10 | håndterer ISO-format med T-separator | Matcher relative tider |

### scoreLabel (B.11)
| # | Test | Forventet |
|---|------|-----------|
| 1 | returnerer 'Høy' for score >= 7 | `scoreLabel(7) → "Høy"` |
| 2 | returnerer 'Medium' for score 4–6.9 | `scoreLabel(5.5) → "Medium"` |
| 3 | returnerer 'Lav' for score < 4 | `scoreLabel(2) → "Lav"` |
| 4 | grenseverdier | 6.9→Medium, 7→Høy, 3.9→Lav, 4→Medium |

### STATUSES ikoner (B.11)
| # | Test | Forventet |
|---|------|-----------|
| 1 | alle statuser har ikon-felt | `s.icon` er truthy |
| 2 | alle statuser har id, label, color, bg | Alle felt finnes |
| 3 | inneholder forventede statuser | submitted, in-progress, done, blocked, archived |

### BENEFIT_TYPES (C.1)
| # | Test | Forventet |
|---|------|-----------|
| 1 | inneholder minst 6 typer | `length ≥ 6` |
| 2 | hver type har id og label | Alle har `id` og `label` |
| 3 | inneholder forventede typer | cost, time, quality |

### BENEFIT_CLASSIFICATIONS (C.1)
| # | Test | Forventet |
|---|------|-----------|
| 1 | inneholder nøyaktig 2 klassifiseringer | `length → 2` |
| 2 | inneholder kvantitativ og kvalitativ | IDs: kvantitativ, kvalitativ |

### PIR_LESSON_CATEGORIES (C.4)
| # | Test | Forventet |
|---|------|-----------|
| 1 | inneholder minst 4 kategorier | `length ≥ 4` |
| 2 | hver kategori har id og label | Alle har `id` og `label` |
| 3 | inneholder forventede kategorier | process, technical, organizational |

### calcAggregatePayback (C.9)
| # | Test | Forventet |
|---|------|-----------|
| 1 | beregner tilbakebetalingstid korrekt | `→ 2` (300k kost / 150k besparelse) |
| 2 | returnerer null ved 0 besparelse | `→ null` |
| 3 | returnerer null ved 0 kostnad | `→ null` |
| 4 | returnerer null for tom array | `→ null` |
| 5 | håndterer oppgaver uten kostnad/besparelse | `→ 3` (ignorerer tomme) |
| 6 | avrunder til 1 desimal | `→ 3.3` |

### calcGoalBenefitRealization (C.8)
| # | Test | Forventet |
|---|------|-----------|
| 1 | beregner gjennomsnittlig realisering | `→ 50` (begge 50%) |
| 2 | returnerer null for oppgaver uten måldata | `→ null` |
| 3 | returnerer null for tom array | `→ null` |
| 4 | ignorerer oppgaver uten komplett data | `→ 100` (bare fullstendige teller) |

### buildPirReport (C.4)
| # | Test | Forventet |
|---|------|-----------|
| 1 | genererer rapport med tittel og vurderinger | Inneholder "PIR-RAPPORT: Test-oppgave" |
| 2 | håndterer tom oppgave uten feil | Inneholder "PIR-RAPPORT: Ukjent" |
| 3 | inkluderer læringspunkter når kategorisert | Inneholder "Bedre testing nødvendig" |
| 4 | inkluderer oppfølgingstiltak | Inneholder "Oppdater rutine" og "Kari" |

### calcVelocityTrend (D.1)
| # | Test | Forventet |
|---|------|-----------|
| 1 | beregner gjennomsnitt og standardavvik | `avg → 32`, `stdDev > 0`, `data.length → 4` |
| 2 | returnerer tom for ingen fullførte sprinter | `data.length → 0`, `avg → 0` |
| 3 | identifiserer stigende trend | `trend → "up"`, `slope > 0` |
| 4 | identifiserer synkende trend | `trend → "down"`, `slope < 0` |

### calcCycleTimeTrend (D.1)
| # | Test | Forventet |
|---|------|-----------|
| 1 | returnerer data per sprint | `length → 1`, `avgCycleTime → 2` |
| 2 | returnerer tom for ingen sprinter | `length → 0` |

### calcThroughputByTrack (D.1)
| # | Test | Forventet |
|---|------|-----------|
| 1 | fordeler per løype | `rpa → 2`, `sysdev → 2`, `total → 3` |
| 2 | returnerer tom for ingen sprinter | `length → 0` |

### buildCfdData (D.2)
| # | Test | Forventet |
|---|------|-----------|
| 1 | bygger dagsdata fra task-historikk | `length ≥ 1`, `date → "2026-01-20"` |
| 2 | håndterer tom array | `length → 0` |
| 3 | kumulerer statusendringer korrekt | `submitted → 2` |

### calcPredictiveCompletion (D.3)
| # | Test | Forventet |
|---|------|-----------|
| 1 | beregner prognose | `optimistic ≤ mostLikely ≤ pessimistic` |
| 2 | returnerer null ved 0 backlog | `→ null` |
| 3 | returnerer null uten fullførte sprinter | `→ null` |

### calcBenefitByTrack (D.4)
| # | Test | Forventet |
|---|------|-----------|
| 1 | grupperer nytte per løype | `rpa: cost=150k, saving=280k, count=2` |
| 2 | håndterer tasks uten nyttedata | `cost → 0`, `avgRealization → null` |

### calcBenefitByGoal (D.4)
| # | Test | Forventet |
|---|------|-----------|
| 1 | beregner per mål med delmål | `cost=150k, count=2` |
| 2 | håndterer tom oppgaveliste | `cost → 0, count → 0` |

### calcBenefitGaps (D.4)
| # | Test | Forventet |
|---|------|-----------|
| 1 | sorterer etter gap synkende | `T-2 først, gap → 70` |
| 2 | returnerer tom for tasks uten måling | `length → 0` |

### EXPORT_COLUMNS (D.5)
| # | Test | Forventet |
|---|------|-----------|
| 1 | alle kolonner har get-funksjon | `typeof c.get → "function"` |

### EXPORT_TEMPLATES (D.5)
| # | Test | Forventet |
|---|------|-----------|
| 1 | alle maler refererer gyldige kolonne-IDer | Alle `colId` finnes i EXPORT_COLUMNS |

### DASHBOARD_WIDGETS (D.6)
| # | Test | Forventet |
|---|------|-----------|
| 1 | alle widgets har id, label og default | Alle felt finnes, `default` er boolean |

### addGoalKpiSnapshot (D.8)
| # | Test | Forventet |
|---|------|-----------|
| 1 | legger til ny måling i kpiHistory | `kpiHistory.length → 2`, `value → "55"` |
| 2 | håndterer mål uten eksisterende kpiHistory | `kpiHistory.length → 1` |

### calcResourceUtilization (D.9)
| # | Test | Forventet |
|---|------|-----------|
| 1 | beregner utnyttelsesgrad per medlem | `actualHours → 50`, `rpa → 30`, `sysdev → 20` |
| 2 | identifiserer overallokerte medlemmer | `marte.overAllocated → true` |

### isImageAttachment (E.7)
| # | Test | Forventet |
|---|------|-----------|
| 1 | true for bilder, false for dokumenter | `image/png → true`, `application/pdf → false` |

### getAttachIcon (E.7)
| # | Test | Forventet |
|---|------|-----------|
| 1 | riktig ikon per filtype | png→🖼, docx→📝, xlsx→📊, pptx→📽, pdf→📕, zip→📄 |

### INIT_GOALS structure
| # | Test | Forventet |
|---|------|-----------|
| 1 | inneholder 24 mål (5 hovedmål + 19 delmål) | `length → 24`, `Hovedmål → 5`, `Delmål → 19` |
| 2 | alle hovedmål har parent: null | Hovedmål.parent → null |
| 3 | alle delmål har gyldig parent som peker til et hovedmål | parent finnes blant Hovedmål-IDer |
| 4 | alle mål-IDer er unike | `Set(ids).size === ids.length` |
| 5 | hvert mål har pålagt feltstruktur | id, title, type, metric, baseline, target, current, deadline, kpiStatus, kpiHistory |
| 6 | hierarkistruktur matcher handlingsplan | G-01→4, G-06→4, G-11→4, G-16→4, G-21→3 barn |

---

## Fil 2: `src/__tests__/scoring.test.js`

### SCORING_CRITERIA
| # | Test | Forventet |
|---|------|-----------|
| 1 | inneholder nøyaktig 7 kriterier | `length → 7` |
| 2 | hvert kriterie har key, label og weight | Alle felt finnes, `weight ∈ (0, 1]` |
| 3 | vektene summerer til 1.0 | `Σweight → 1.0` |
| 4 | inneholder forventede kriterier | regulatory, security, costSaving, dataQuality, simplicity, patientBenefit, employeeSat |
| 5 | korrekte vekter per kriterie | regulatory=0.15, security=0.10, costSaving=0.20, dataQuality=0.15, simplicity=0.10, patientBenefit=0.15, employeeSat=0.15 |

### SCORE_EXAMPLES
| # | Test | Forventet |
|---|------|-----------|
| 1 | har eksempler for alle 7 kriterier | Alle keys har eksempler |
| 2 | hvert kriterie har 11 eksempler (index 0–10) | `length → 11` |
| 3 | alle eksempler er strenger | `typeof → "string"`, `length > 0` |

### calcWeightedScore
Formel: `Σ(criterion_score × weight)` for alle 7 kriterier → 0–10

| # | Test | Forventet |
|---|------|-----------|
| 1 | alle 0 gir score 0 | `→ 0` |
| 2 | alle 10 gir score 10 | `→ 10` |
| 3 | alle 5 gir score 5 | `→ 5` |
| 4 | manglende felt bruker default 0 | `calcWeightedScore({}) → 0` |
| 5 | kun costSaving=10 gir 2.0 (vekt 0.20) | `→ 2.0` |
| 6 | kun security=10 gir 1.0 (vekt 0.10) | `→ 1.0` |
| 7 | kun regulatory=10 gir 1.5 (vekt 0.15) | `→ 1.5` |
| 8 | asymmetriske verdier beregnes korrekt | `8×.15 + 3×.10 + 6×.20 + 7×.15 + 4×.10 + 9×.15 + 5×.15 = 6.25 → 6.3` |
| 9 | avrunder til 1 desimal | `3×.15 + 7×.10 + 2×.20 + 8×.15 + 1×.10 + 6×.15 + 4×.15 = 4.35 → 4.4` |
| 10 | delvis utfylte felter beregnes riktig | `10×.15 + 10×.20 + 10×.15 = 5.0` |

### makeComposite
| # | Test | Forventet |
|---|------|-----------|
| 1 | returnerer en funksjon | `typeof → "function"` |
| 2 | gir samme resultat som calcWeightedScore | `composite(t) === calcWeightedScore(t)` |
| 3 | håndterer null config | `composite(alle 5) → 5` |
| 4 | håndterer tomt task-objekt | `composite({}) → 0` |
| 5 | ignorerer gamle WSJF-felter | `composite({value:5, urgency:5, ...}) → 0` |

---

## Oppsummering

| Testfil | Describe-blokker | Tester |
|---------|-------------------|--------|
| utils.test.js | 35 | 123 |
| scoring.test.js | 4 | 23 |
| **Totalt** | **39** | **146** |
