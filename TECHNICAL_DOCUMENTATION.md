# Hemit Nyttestyringsverktoy v6.3 – Teknisk dokumentasjon

> Sist oppdatert: 2026-02-15

---

## 1. Innledning

**Hemit Nyttestyringsverktoy** er en React-basert plattform for behovsstyrt forbedringsledelse ved Hemit HF / Helse Midt-Norge. Verktøyet tar imot, evaluerer og prioriterer forbedringsforslag gjennom WSJF-scoring med løypespesifikke rammeverk, sprintplanlegging, kapasitetsstyring og deloppgavefordeling.

### 1.1 Teknologistabel

| Lag | Teknologi | Versjon |
|-----|-----------|---------|
| Frontend | React + Vite | 19.0.0 / 6.1.0 |
| Backend | Firebase Firestore | 11.2.0 |
| Autentisering | Firebase Auth + Microsoft Entra ID (Azure AD) | — |
| Hosting | Firebase Hosting | — |
| CI/CD | GitHub Actions | — |
| Pakkebehandler | npm | — |

### 1.2 Prosjektstruktur

```
hemit-nyttestyring/
├── .github/workflows/
│   └── deploy.yml                 # CI/CD-pipeline (build, preview, produksjon)
├── firebase/
│   ├── firestore.rules            # Sikkerhetsregler for Firestore
│   └── firestore.indexes.json     # Sammensatte indekser
├── src/
│   ├── main.jsx                   # React-inngangspunkt (StrictMode)
│   ├── App.jsx                    # Hovedkomponent (~650 linjer, monolittisk)
│   ├── firebase.js                # Firebase-initialisering + emulatorstøtte
│   ├── firestore.js               # CRUD-operasjoner + sanntidslyttere
│   └── useAuth.js                 # Autentiseringshook (Microsoft + e-post)
├── .env.example                   # Miljøvariabelmal
├── .firebaserc                    # Firebase-prosjektalias
├── firebase.json                  # Firebase-konfigurasjon (hosting, emulator)
├── index.html                     # Vite HTML-inngangspunkt
├── package.json                   # Avhengigheter og scripts
├── vite.config.js                 # Vite build-konfigurasjon
└── README.md                      # Prosjektbeskrivelse
```

---

## 2. Arkitekturoversikt

### 2.1 Applikasjonsarkitektur

```
┌─────────────────────────────────────────────────────┐
│                    Brukergrensesnitt                 │
│  ┌───────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐ │
│  │ Medarbeider│ │ Forum    │ │ Team   │ │ Admin   │ │
│  │ (submit,  │ │ (inbox,  │ │(backlog│ │ (config,│ │
│  │  my)      │ │ review,  │ │ sprint,│ │  goals) │ │
│  │           │ │ backlog, │ │capacity│ │         │ │
│  │           │ │ goals)   │ │ dash)  │ │         │ │
│  └───────────┘ └──────────┘ └────────┘ └─────────┘ │
├─────────────────────────────────────────────────────┤
│              Tilstandshåndtering (useState)          │
│  tasks[] · goals[] · config{} · team[] · role · tab │
├─────────────────────────────────────────────────────┤
│               Scoring-motorer                       │
│  WSJF · CoD · RPA · RICE · ICE · TCO/Fit · Kompositt│
├─────────────────────────────────────────────────────┤
│               Datalaget                             │
│  ┌───────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ Firestore     │  │ localStorage│ │ useAuth    │ │
│  │ (sanntid)     │  │ (config)    │ │ (Azure AD) │ │
│  └───────────────┘  └────────────┘  └────────────┘ │
├─────────────────────────────────────────────────────┤
│              Integrasjoner (konfigurerbare)          │
│  Azure DevOps · ServiceNow · Microsoft Entra ID     │
└─────────────────────────────────────────────────────┘
```

### 2.2 Rollebasert tilgang

| Rolle | Faner | Rettigheter |
|-------|-------|-------------|
| **Medarbeider** | Meld forslag, Mine | Kan sende inn forslag, se egne |
| **Utviklingsforum** | Innkomne, Alle, Backlog, Mål | Kan vurdere, score, godkjenne/avvise |
| **Leveranseteam** | Backlog, Sprint, Kapasitet, Dashboard | Kan planlegge sprinter, tildele SP, oppdatere status |
| **Administrator** | Konfig, Mål | Full tilgang til konfigurasjon og systemoppsett |

---

## 3. Datamodeller

### 3.1 Oppgave (Task)

```javascript
{
  id: "T-001",                    // Unik ID, format "T-NNN"
  title: "Automatisere ...",      // Tittel
  desc: "Beskrivelse ...",        // Beskrivelse
  tracks: ["rpa", "integration"], // Tilknyttede løyper
  status: "in-progress",          // Se statusliste
  sprint: "Sprint 27",            // Tilknyttet sprint (eller "")
  parentId: null,                 // For deloppgaver: referanse til forelder
  size: 5,                        // Story Points (Fibonacci)
  priority: "high",               // low | medium | high | critical

  // WSJF-dimensjoner (1-5)
  value: 4,                       // Forretningsverdi
  urgency: 4,                     // Hastegrad
  risk: 3,                        // Risiko ved utsettelse
  feasibility: 4,                 // Gjennomførbarhet
  deps: 3,                        // Avhengigheter
  effort: 4,                      // Innsats (invertert)

  // Løypespesifikke scorer (1-5, kun relevante)
  cod_business: 4,                // CoD: Forretningsverdi
  cod_time: 5,                    // CoD: Tidskritikalitet
  cod_opportunity: 3,             // CoD: Mulighetskostnad
  cod_downstream: 4,              // CoD: Nedstrøms blokkering
  rpa_volume: 5,                  // RPA: Transaksjonsvolum
  rpa_rule: 4,                    // RPA: Regelbaserthet
  rpa_digital: 5,                 // RPA: Digitaliseringsgrad
  rpa_stability: 4,               // RPA: Prosess-stabilitet
  rpa_roi: 5,                     // RPA: Estimert ROI
  rice_reach: 4,                  // RICE: Reach
  rice_impact: 4,                 // RICE: Impact
  rice_confidence: 3,             // RICE: Confidence
  rice_effort: 3,                 // RICE: Effort (invertert)
  ice_impact: 4,                  // ICE: Impact
  ice_confidence: 3,              // ICE: Confidence
  ice_ease: 4,                    // ICE: Ease
  cots_fit: 4,                    // TCO: Funksjonell dekning
  cots_tco: 3,                    // TCO: Total Cost of Ownership (inv.)
  cots_vendor: 4,                 // TCO: Leverandørsoliditet
  cots_integration: 3,            // TCO: Integrasjonsevne
  cots_security: 4,               // TCO: Sikkerhet/personvern

  // Metadata
  submitterName: "Ola Nordmann",  // Innsender
  submitterDept: "IKT-drift",     // Avdeling
  processOwner: "Kari Larsen",    // Prosess-/systemeier
  date: "2026-02-01",             // Innmeldingsdato
  reviewed: true,                 // Vurdert av forum
  goals: ["G-01", "G-02"],        // Tilknyttede strategiske mål
  eqsRef: "EQS-2023-0042",        // Referanse til kvalitetssystem
  personalData: "no",             // yes | no | unknown
  actualHours: 12,                // Timer registrert

  // Interaksjon
  comments: [{
    id: "c1",
    author: "Forum",
    text: "Godkjent for sprint",
    date: "2026-02-03 09:15"
  }],
  history: [{
    id: "h1",
    who: "System",
    what: "Opprettet",
    date: "2026-02-01 08:00"
  }],
  attachments: ["Prosessanalyse.pdf"],
  archived: false
}
```

### 3.2 Strategisk mal (Goal)

```javascript
{
  id: "G-01",                      // Unik ID
  title: "Øke digitaliseringsgrad til 80%",
  type: "Hovedmål",               // Hovedmål | Delmål
  parent: null                     // null (toppnivå) eller forelder-ID
}
```

**Mål-hierarki:**
```
G-01: Øke digitaliseringsgrad til 80% (Hovedmål)
  ├─ G-02: Redusere manuelt arbeid med 30% (Delmål)
G-03: Forbedre pasientsikkerhet gjennom IKT (Hovedmål)
  ├─ G-04: Styrke informasjonssikkerhet
  ├─ G-05: Redusere ventetider gjennom digitalisering
G-06: Effektivisere administrative prosesser (Hovedmål)
  └─ G-07: Øke medarbeidertilfredshet med IKT-verktøy
```

### 3.3 Teammedlem

```javascript
{
  id: "m1",
  name: "Lars Kristiansen",
  role: "Backend",
  availability: 100,              // Prosent allokering
  skills: ["Backend", "DevOps"],   // Fra SKILLS_LIST
  track: "sysdev"                  // Primærløype
}
```

### 3.4 Konfigurasjon (INIT_CONFIG)

```javascript
{
  // Sprint
  sprintName: "Sprint 27",
  sprintStart: "2026-02-03",
  sprintEnd: "2026-02-14",
  sprintWeeks: 2,

  // E-postvarsling
  notifyEmails: ["utviklingsforum@hemit.no", "leder@hemit.no"],
  emailNotifications: true,
  emailOnStatusChange: true,
  emailOnReview: true,
  notifyProcessOwner: true,

  // Scoring
  scoringWeights: { wsjf: 60, trackSpecific: 40 },

  // DPIA
  dpiaLink: "https://eqs.hemit.no/doc/DPIA-mal-2024",
  dpiaEqsRef: "EQS-2024-0200 DPIA-prosedyre",

  // Tilgangsstyring (Azure AD) – se seksjon 8
  auth: { ... },

  // Azure DevOps-integrasjon – se seksjon 9.1
  azureDevOps: { ... },

  // ServiceNow-integrasjon – se seksjon 9.2
  serviceNow: { ... }
}
```

### 3.5 Sprint-historikk (Velocity)

```javascript
SPRINTS = [
  { s: "S-21", p: 34, d: 29 },   // planned, delivered
  { s: "S-22", p: 38, d: 35 },
  { s: "S-23", p: 40, d: 38 },
  { s: "S-24", p: 36, d: 36 },
  { s: "S-25", p: 42, d: 39 },
  { s: "S-26", p: 38, d: 37 }
]
```

---

## 4. Scoring-system

### 4.1 WSJF (Weighted Shortest Job First)

Brukes som grunnleggende prioriteringsmodell for alle oppgaver.

**Formel:**
```
WSJF = (Verdi + Hastegrad + Risiko) × Gjennomførbarhet × Avhengigheter × Innsats
```

Alle dimensjoner skaleres 1–5 (standardverdi: 3).

### 4.2 Løypespesifikke rammeverk

| Løype | Rammeverk | Formel |
|-------|-----------|--------|
| Integrasjon | **CoD** (Cost of Delay) | `Forrverdi + Tidskrit. + Mulighetskost. + Nedstrømsblokk` |
| RPA | **RPA Pipeline** | `(Volum + Regel + Digital + Stabilitet) × ROI` |
| Systemutvikling | **RICE** | `(Reach × Impact × Confidence) / max(6 − Effort, 1)` |
| No-code / Low-code | **ICE** | `Impact × Confidence × Ease` |
| Kjøp av hyllevare | **TCO/Fit** | `(Fit × TCO + Vendor + Integrasjon + Sikkerhet)` |

### 4.3 Sammensatt score (Composite)

```javascript
composite(task) = WSJF + Σ(løypespesifikke scorer for tilknyttede løyper)
```

Vektingsfordelingen mellom WSJF og løypespesifikk score er konfigurerbar (standard: 60/40).

### 4.4 Visuell fargekoding

| Score-intervall | Farge |
|-----------------|-------|
| > 200 | Grønn (success) |
| 100–200 | Gul (warning) |
| < 100 | Rød (danger) |

---

## 5. Konstanter og oppslagsverdier

### 5.1 Løyper (TRACKS)

| ID | Etikett | Farge | Ikon |
|----|---------|-------|------|
| `rpa` | RPA | #0072CE | ⚙️ |
| `integration` | Integrasjon | #6CACE4 | 🔗 |
| `sysdev` | Systemutvikling | #003087 | 💻 |
| `lowcode` | No code / Low code | #2D8A4E | 🧩 |
| `cots` | Kjøp av hyllevare | #C67A1A | 📦 |

### 5.2 Statuser (STATUSES)

| ID | Etikett | Farge | Bakgrunn |
|----|---------|-------|----------|
| `submitted` | Innmeldt | #8896A6 | #F0F0F0 |
| `under-review` | Under vurdering | #7C3AED | #EDE9FE |
| `assessed` | Vurdert | #0891B2 | #E0F7FA |
| `ready` | Klar for sprint | #2D8A4E | #E6F5EC |
| `in-progress` | Pågår | #0072CE | #E0F0FF |
| `blocked` | Blokkert | #C53030 | #FEE2E2 |
| `done` | Ferdig | #6B7280 | #F3F4F6 |
| `rejected` | Avvist | #991B1B | dangerBg |
| `archived` | Arkivert | #9CA3AF | #F3F4F6 |

### 5.3 Fibonacci Story Points

| Verdi | Beskrivelse |
|-------|-------------|
| 1 | Triviell (timer) |
| 2 | Enkel (halv dag) |
| 3 | Overkommelig (1 dag) |
| 5 | Middels (2–3 dager) |
| 8 | Kompleks (1 uke) |
| 13 | Svært kompleks (2 uker) |
| 21 | Episk (full sprint+) |

### 5.4 Prioritetsnivåer

| ID | Etikett | Farge |
|----|---------|-------|
| `low` | Lav | #8896A6 |
| `medium` | Medium | warning |
| `high` | Høy | danger |
| `critical` | Kritisk | #991B1B |

### 5.5 Kompetanser (SKILLS_LIST)

Backend, Frontend, Fullstack, UX, QA, DevOps, RPA, Data, Arkitektur

---

## 6. UI-komponentbibliotek

### 6.1 Atomiske komponenter

| Komponent | Props | Beskrivelse |
|-----------|-------|-------------|
| `Badge` | `children, color, bg, style` | Inline-merkelapp med farge/bakgrunn |
| `TBadge` | `id` | Løypemerkelapp – slår opp TRACKS etter ID |
| `Card` | `children, style, ...props` | Containerkort med surface-bg, avrunding |
| `Btn` | `children, variant, onClick, style, type, disabled` | Knapp med varianter: primary, secondary, ghost, danger, success |
| `SH` | `children` | Seksjonsoverskrift (h3) med primærunderstreking |
| `TF` | `label, id, value, onChange, multiline, placeholder, type, required` | Tekstfelt (input/textarea) med etikett |
| `SF` | `label, id, value, onChange, children, required` | Nedtrekksmeny med etikett |
| `Sl` | `label, id, value, onChange` | Glidebryter (1–5) med tallvisning |
| `SBar` | `value` | 5-prikks visuell scorer |
| `Tip` | `children, k, style` | Verktøytips med stiplet understreking |
| `Empty` | `icon, text` | Tomt-tilstand plassholdervisning |

### 6.2 Sammensatte komponenter

| Komponent | Props | Beskrivelse |
|-----------|-------|-------------|
| `GoalPicker` | `goals, selected, onChange` | Flervalg av strategiske mål |
| `AttachArea` | `attachments, onChange` | Dra-slipp-sone for vedlegg (simulert) |
| `CommentsPanel` | `task, role, onAdd` | Kommentarvisning/inndata |
| `HistoryPanel` | `task` | Kronologisk endringslogg |
| `ReviewModal` | `task, onClose` | Vurderingsmodal med scoring og trackvalg |

### 6.3 Temasystem

Verktøyet støtter lyst (LT) og mørkt (DK) tema med 22 fargevariabler:

| Variabel | Lyst tema | Mørkt tema |
|----------|-----------|------------|
| `primary` | #003087 | #6CACE4 |
| `primaryLight` | #6CACE4 | #003087 |
| `primaryDark` | #001A4E | #0A1628 |
| `accent` | #0072CE | #4DB8FF |
| `bg` | #F5F7FA | #0F1A2E |
| `surface` | #FFFFFF | #162038 |
| `surfaceAlt` | #EBF0F7 | #1C2A48 |
| `border` | #D0D9E4 | #2A3A5C |
| `text` | #1A1A2E | #E8ECF2 |
| `textSec` | #4A5568 | #A0B0C8 |
| `textMuted` | #8896A6 | #6880A0 |
| `success` | #2D8A4E | #4ADE80 |
| `warning` | #C67A1A | #FBB040 |
| `danger` | #C53030 | #F87171 |
| `purple` | #7C3AED | #A78BFA |

Font: **Source Sans 3** (Google Fonts) – vekter 400, 600, 700, 800.

---

## 7. Tilstandshåndtering

### 7.1 Tilstandsvariabler (useState)

| Variabel | Type | Standardverdi | Beskrivelse |
|----------|------|---------------|-------------|
| `dark` | boolean | false | Tema-veksler |
| `role` | string | "employee" | Aktiv brukerrolle |
| `tab` | string | "submit" | Aktiv fane |
| `tasks` | array | INIT_TASKS | Alle oppgaver |
| `goals` | array | INIT_GOALS | Strategiske mål |
| `config` | object | INIT_CONFIG | Systemkonfigurasjon |
| `team` | array | INIT_TEAM | Teammedlemmer |
| `sortBy` | string | "score" | Sortering: score, priority, date |
| `filterTrack` | string | "all" | Løypefilter |
| `filterStatus` | string | "all" | Statusfilter |
| `searchQ` | string | "" | Søkeord |
| `selectedTask` | string/null | null | Utvidet rad i backlog |
| `modal` | object/null | null | `{type, task}` for åpen modal |
| `note` | object/null | null | Varselmelding (toast) |
| `batchSel` | array | [] | Batchvalgte oppgave-IDer |
| `editMember` | string/null | null | Redigerbart team-ID |
| `dragTask` | string/null | null | Dra-slipp tilstand |
| `showArchived` | boolean | false | Vis arkiverte oppgaver |
| `form` | object | emptyForm | Skjema for innmelding |
| `goalForm` | object | {...} | Nytt mål-skjema |
| `memberForm` | object | {...} | Nytt teammedlem-skjema |
| `subForm` | object | {...} | Ny deloppgave-skjema |

### 7.2 Beregnede verdier (useMemo)

| Variabel | Beskrivelse |
|----------|-------------|
| `dupes` | Duplikatdeteksjon for innmeldingsskjema |
| `unreviewed` | Oppgaver som ikke er vurdert |
| `activeTasks` | Filtrert aktive/arkiverte oppgaver |
| `parentTasks` | Oppgaver uten parentId |
| `sorted` | Filtrert + sortert backlog |
| `sprintTasks` | Oppgaver tilordnet sprint |
| `totalSP` | Sum story points i sprint |
| `doneSP` | Ferdige story points i sprint |
| `sprintPct` | Prosent fullføring av sprint |
| `totalCap` | Total teamkapasitet (timer) |

---

## 8. Autentisering

### 8.1 useAuth-hook

Fil: `src/useAuth.js`

```javascript
useAuth() => {
  user,       // Firebase User eller null
  loading,    // Boolean – laster autentiseringstilstand
  role,       // "admin" | "forum" | "team" | "employee"
  signInMs,   // () => Promise – Microsoft/Azure AD popup-innlogging
  signInEm,   // (email, password) => Promise – e-postinnlogging
  signOut     // () => Promise – logg ut
}
```

### 8.2 Microsoft Entra ID (Azure AD)

**Provider-konfigurasjon:**
```javascript
const microsoftProvider = new OAuthProvider("microsoft.com");
microsoftProvider.setCustomParameters({
  tenant: import.meta.env.VITE_AZURE_TENANT_ID || "common",
  prompt: "select_account"
});
```

**Rollebestemmelse** (forenklet – i produksjon: bruk Custom Claims):
- E-post inneholder "admin" → `admin`
- E-post inneholder "forum" / "utviklingsforum" → `forum`
- E-post inneholder "team" / "dev" → `team`
- Ellers → `employee`

### 8.3 Konfigurerbare auth-innstillinger

| Innstilling | Beskrivelse |
|-------------|-------------|
| Tenant ID | Directory (tenant) ID fra Azure Portal |
| Client ID | Application (client) ID fra Azure Portal |
| Tillatte domener | Kommaseparerte e-postdomener |
| Krev MFA | Multifaktor-autentisering |
| Auto-opprett brukere | Ved første innlogging |
| Sesjonstid | 15–1440 minutter (standard: 480) |
| Rollemappinger | Azure AD-gruppe → applikasjonsrolle |
| Standardrolle | Rolle for brukere uten gruppematch |

---

## 9. Integrasjoner

### 9.1 Azure DevOps

**Formål:** Synkronisere forbedringsforslag som work items i Azure DevOps.

**Konfigurasjonsmodell:**
```javascript
azureDevOps: {
  enabled: false,
  orgUrl: "",                      // https://dev.azure.com/hemit
  pat: "",                         // Personal Access Token
  defaultProject: "",              // Prosjektnavn
  syncWorkItems: true,
  syncOnStatusChange: true,
  fieldMapping: {
    title: "System.Title",
    description: "System.Description",
    priority: "Microsoft.VSTS.Common.Priority",
    status: "System.State"
  },
  workItemType: "User Story",      // User Story | Bug | Task | Feature | Epic
  areaPath: "",                    // Prosjekt\Team
  iterationPath: "",               // Prosjekt\Sprint 27
  statusMapping: [
    { appStatus: "ready",       devOpsState: "New" },
    { appStatus: "in-progress", devOpsState: "Active" },
    { appStatus: "done",        devOpsState: "Closed" }
  ]
}
```

**Oppsettskrav:**
1. Opprett PAT med scope `Work Items (Read & Write)`
2. Angi organisasjons-URL (`https://dev.azure.com/din-org`)
3. Opprett prosjekt for work items
4. Konfigurer Area Path og Iteration Path
5. Map app-statuser til DevOps-tilstander (Agile/Scrum/CMMI)

### 9.2 ServiceNow

**Formål:** Opprette og synkronisere incidents/change requests i ServiceNow.

**Konfigurasjonsmodell:**
```javascript
serviceNow: {
  enabled: false,
  instanceUrl: "",                 // https://hemit.service-now.com
  authMethod: "basic",             // basic | oauth
  username: "",                    // For Basic Auth
  password: "",                    // For Basic Auth
  clientId: "",                    // For OAuth 2.0
  clientSecret: "",                // For OAuth 2.0
  syncIncidents: true,
  syncChangeRequests: false,
  syncOnStatusChange: true,
  table: "incident",               // incident | change_request | sc_req_item | problem
  assignmentGroup: "",             // Ansvarlig gruppe
  category: "Software",            // Software | Hardware | Network | Database | Inquiry
  fieldMapping: {
    shortDescription: "title",
    description: "description",
    priority: "priority",
    state: "status"
  },
  statusMapping: [
    { appStatus: "submitted",    snowState: "New" },
    { appStatus: "in-progress",  snowState: "In Progress" },
    { appStatus: "done",         snowState: "Resolved" }
  ]
}
```

**Oppsettskrav:**
1. Opprett integrasjonsbruker med `itil`-rolle
2. (Valgfritt) Konfigurer OAuth via Application Registry
3. Angi instans-URL
4. Definer Assignment Group for mottakergruppe
5. Map app-statuser til ServiceNow-tilstander

---

## 10. Firebase-datalaget

### 10.1 Initialisering (`firebase.js`)

**Miljøvariabler:**
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_ID
VITE_FIREBASE_APP_ID
VITE_AZURE_TENANT_ID
VITE_USE_EMULATORS=true|false
```

**Emulatorstøtte:** Automatisk kobling til lokale emulatorinstanser i utviklingsmodus:
- Firestore: localhost:8080
- Auth: localhost:9099

### 10.2 Firestore-samlinger (`firestore.js`)

#### tasks/
| Operasjon | Funksjon | Beskrivelse |
|-----------|----------|-------------|
| Lytt | `subscribeTasks(callback)` | Sanntidslytter, sortert etter dato DESC |
| Hent | `fetchTasks()` | Engangshenting |
| Opprett | `createTask(task)` | Med `_created` og `_updated` serverTimestamp |
| Oppdater | `updateTask(id, changes)` | Med `_updated` |
| Slett | `deleteTask(id)` | Permanent sletting |
| Batch | `batchUpdateTasks(updates)` | Fleroppgaveoppdatering |
| Deloppgaver | `fetchSubtasks(parentId)` | Query på `parentId` |

#### team/
| Operasjon | Funksjon |
|-----------|----------|
| Lytt | `subscribeTeam(callback)` |
| Opprett/oppdater | `upsertMember(member)` |
| Fjern | `removeMember(id)` |

#### goals/
| Operasjon | Funksjon |
|-----------|----------|
| Lytt | `subscribeGoals(callback)` |
| Opprett/oppdater | `upsertGoal(goal)` |
| Fjern | `removeGoal(id)` |

#### config/app (singleton)
| Operasjon | Funksjon |
|-----------|----------|
| Hent | `fetchConfig()` |
| Lagre | `saveConfig(config)` |
| Lytt | `subscribeConfig(callback)` |

#### sprints/
| Operasjon | Funksjon |
|-----------|----------|
| Lagre | `saveSprint(sprint)` |
| Hent | `fetchSprints()` |

### 10.3 Sikkerhetsregler

**Hjelpefunksjoner:**
- `isAuthenticated()` – Sjekker at bruker er innlogget
- `hasRole(role)` – Sjekker rolle i `users/{uid}`
- `isForumOrAdmin()` – Rolle er forum eller admin
- `isTeamOrAbove()` – Rolle er team, forum eller admin

**Tilgangsmatrise:**

| Samling | Les | Opprett | Oppdater | Slett |
|---------|-----|---------|----------|-------|
| tasks | Autentisert | Autentisert | Team+ | Forum+ |
| team | Autentisert | — | Team+ | — |
| goals | Autentisert | — | Forum+ | Forum+ |
| config | Autentisert | — | Admin | — |
| sprints | Autentisert | — | Team+ | — |
| users | Autentisert | — | Admin | — |

---

## 11. Kjerneflyter (Workflows)

### 11.1 Innmeldingsflyt (Medarbeider)

```
Medarbeider fyller ut skjema
  → Validering (tittel + navn kreves)
  → Duplikatdeteksjon (viser lignende forslag)
  → DPIA-advarsel (hvis personaldata=ja)
  → Selv-vurdering (WSJF-dimensjoner)
  → Målkobling (strategiske mål)
  → Vedlegg (valgfritt)
  → "Send inn" → Oppgave opprettes med status "submitted"
  → Varsel til forum
```

### 11.2 Vurderingsflyt (Forum)

```
Forum åpner innkomne → Ser uvurderte oppgaver
  → "Vurder →" → ReviewModal
  → Velger løyper (RPA/Integration/Sysdev/Lowcode/COTS)
  → Scorer WSJF-dimensjoner (1–5)
  → Scorer løypespesifikke dimensjoner
  → Eventuell kommentar
  → "Godkjenn" → reviewed=true, status oppdatert
  → Historikkoppføring, e-postvarsling
```

### 11.3 Sprintplanlegging (Team)

```
Team åpner backlog → Filtrerer vurderte oppgaver
  → Velger oppgaver for sprint (checkbox)
  → Tildeler story points (Fibonacci)
  → Bekrefter statusendringer
  → Sprint-fane: Kanban-tavle
    → Dra-slipp mellom statuskolonner
    → Sporing: % ferdig, SP-teller
  → Registrerer faktiske timer
```

### 11.4 Kapasitetsplanlegging

```
Formel: Timer = allokering% × 37,5 t/uke × sprintuker

Eksempel: 80% allokering × 37,5 × 2 uker = 60 timer
```

### 11.5 Målsporing

```
Admin/Forum oppretter mål (hierarki: Hovedmål → Delmål)
  → Oppgaver kobles til mål (flervalg)
  → Dashboard beregner: ferdige / tilknyttede oppgaver
  → Fremdriftsindikator per mål
```

---

## 12. Bygg og deploy

### 12.1 NPM-scripts

| Script | Kommando | Beskrivelse |
|--------|----------|-------------|
| `dev` | `vite` | Lokal utviklingsserver (port 3000) |
| `build` | `vite build` | Produksjonsbygg → `dist/` |
| `preview` | `vite preview` | Forhåndsvisning av bygd dist |
| `deploy` | `firebase deploy --only hosting` | Produksjonsdeployment |
| `firebase:emulators` | `firebase emulators:start` | Start lokale emulatorinstanser |
| `lint` | `eslint src/` | Kjør linting |

### 12.2 Vite-konfigurasjon

```javascript
{
  plugins: [react()],
  server: { port: 3000, open: true },
  build: { outDir: "dist", sourcemap: false }
}
```

### 12.3 Firebase Hosting

- **public:** `dist/`
- **SPA-rewrites:** Alle ruter → `index.html`
- **Cache:** Immutable-eiendeler med `max-age=31536000`

### 12.4 GitHub Actions CI/CD

**Triggere:**
- Push til `main` → Produksjonsdeployment
- PR mot `main` → Forhåndsvisningsdeployment

**Jobber:**
1. **build** – Node 20, `npm ci`, bygg med miljøvariabler
2. **deploy-preview** – Kun PR, genererer forhåndsvisnings-URL
3. **deploy-production** – Kun `main`-push, live-kanal

**Nødvendige secrets:**
- `FIREBASE_SERVICE_ACCOUNT` (JSON-tjenestekontonøkkel)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_ID`
- `VITE_FIREBASE_APP_ID`

### 12.5 Emulatoroppsett

| Tjeneste | Port |
|----------|------|
| Auth | 9099 |
| Firestore | 8080 |
| Hosting | 5000 |
| Emulator UI | 4000 |

---

## 13. Avhengigheter

### 13.1 Produksjon

| Pakke | Versjon | Formål |
|-------|---------|--------|
| react | ^19.0.0 | UI-rammeverk |
| react-dom | ^19.0.0 | React DOM-renderer |
| firebase | ^11.2.0 | Backend (Auth, Firestore, Hosting) |

### 13.2 Utvikling

| Pakke | Versjon | Formål |
|-------|---------|--------|
| vite | ^6.1.0 | Byggeverktøy |
| @vitejs/plugin-react | ^4.3.0 | Vite React-plugin |
| eslint | ^9.0.0 | Linting |

---

## 14. Kjente begrensninger og fremtidige forbedringer

| Omrode | Nå-tilstand | Planlagt |
|--------|-------------|----------|
| Firestore-integrasjon | Config/team/goals lagres i localStorage | Full Firestore-persistering |
| Auth-integrasjon | useAuth-hook finnes, men ikke koblet til rolletildeling i UI | Koble rollebestemmelse fra AD-grupper |
| E-postvarsling | Konfigurert i UI, ikke implementert | Backend-funksjon (Cloud Functions) |
| Azure DevOps-synk | Konfigurert i UI, ikke implementert | Backend API-kall via Cloud Functions |
| ServiceNow-synk | Konfigurert i UI, ikke implementert | Backend API-kall via Cloud Functions |
| Filvedlegg | Simulert med prompt-dialog | Firebase Storage-integrasjon |
| Responsivt design | Grunnleggende media queries | Fullstendig mobiltilpasning |
| Kodestruktur | Monolittisk App.jsx (~650 linjer) | Modularisering til separate komponenter |

---

## 15. Verktøytips (TIP-objekt)

Verktøyet inneholder konteksthjelp for sentrale begreper:

| Nøkkel | Begrep | Forklaring |
|--------|--------|------------|
| `WSJF` | Weighted Shortest Job First | Prioriteringsmodell som vekter forretningsverdi, hastegrad og risiko |
| `CoD` | Cost of Delay | Kostnaden ved å utsette en leveranse |
| `RPA` | RPA Pipeline | Egnethetsvurdering for robotisert prosessautomatisering |
| `RICE` | RICE-scoring | Reach, Impact, Confidence delt på Effort |
| `ICE` | ICE-scoring | Impact, Confidence, Ease |
| `TCO` | TCO/Fit-Gap | Total eierskapskostnad og funksjonell dekning |
| `Score` | Sammensatt score | WSJF + løypespesifikk score |
| `V` | Verdi | Forventet forretningsverdi (1–5) |
| `H` | Hastegrad | Tidskritikalitet (1–5) |
| `Gf` | Gjennomførbarhet | Teknisk/organisatorisk gjennomførbarhet (1–5) |
| `SP` | Story Points | Relativ kompleksitet (Fibonacci) |
| `Velocity` | Velocity | Teamets leveransehastighet per sprint |
| `DPIA` | DPIA | Data Protection Impact Assessment |
| `EQS` | EQS | Elektronisk kvalitetssystem |

---

*Dokumentet er autogenerert basert på kodebasen for Hemit Nyttestyringsverktoy v6.3.*
