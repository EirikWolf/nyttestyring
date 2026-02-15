# \# Hemit HF – Nyttestyringsverktøy v6.2

# 

# Verktøy for behovsbasert forbedringsledelse. Mottar, vurderer og prioriterer forbedringsforslag gjennom WSJF-scoring med løypespesifikke rammeverk (CoD, RICE, ICE, RPA Pipeline, TCO/Fit), sprintplanlegging, kapasitetsstyring og deloppgavefordeling.

# 

# \## Teknisk stack

# 

# | Lag | Teknologi |

# |-----|-----------|

# | Frontend | React 19 + Vite 6 |

# | Backend | Firebase Firestore (sanntid) |

# | Auth | Firebase Auth + Azure AD SSO |

# | Hosting | Firebase Hosting |

# | CI/CD | GitHub Actions |

# 

# \## Kom i gang

# 

# \### 1. Klon og installer

# 

# ```bash

# git clone https://github.com/DITT\_ORG/hemit-nyttestyring.git

# cd hemit-nyttestyring

# npm install

# ```

# 

# \### 2. Opprett Firebase-prosjekt

# 

# 1\. Gå til \[Firebase Console](https://console.firebase.google.com)

# 2\. Klikk \*\*Legg til prosjekt\*\* → `hemit-nyttestyring`

# 3\. Deaktiver Google Analytics (valgfritt)

# 4\. \*\*Firestore Database\*\* → Opprett database → \*\*europe-west1\*\* → Start i testmodus

# 5\. \*\*Authentication\*\* → Aktiver \*\*E-post/passord\*\* og \*\*Microsoft\*\* (for Azure AD SSO)

# 6\. \*\*Prosjektinnstillinger\*\* → \*\*Dine apper\*\* → Web (`</>`) → Registrer app → Kopier config

# 

# \### 3. Konfigurer miljøvariabler

# 

# ```bash

# cp .env.example .env.local

# ```

# 

# Rediger `.env.local` med verdiene fra steg 2:

# 

# ```env

# VITE\_FIREBASE\_API\_KEY=AIzaSy...

# VITE\_FIREBASE\_AUTH\_DOMAIN=hemit-nyttestyring.firebaseapp.com

# VITE\_FIREBASE\_PROJECT\_ID=hemit-nyttestyring

# VITE\_FIREBASE\_STORAGE\_BUCKET=hemit-nyttestyring.firebasestorage.app

# VITE\_FIREBASE\_MESSAGING\_ID=1234567890

# VITE\_FIREBASE\_APP\_ID=1:1234567890:web:abc123

# VITE\_AZURE\_TENANT\_ID=hemit.no

# ```

# 

# \### 4. Kjør lokalt

# 

# ```bash

# npm run dev

# ```

# 

# Åpner automatisk http://localhost:3000

# 

# \### 5. (Valgfritt) Firebase Emulators

# 

# For utvikling uten skykonto:

# 

# ```bash

# npm install -g firebase-tools

# firebase login

# firebase init emulators

# ```

# 

# Legg til i `.env.local`:

# ```env

# VITE\_USE\_EMULATORS=true

# ```

# 

# ```bash

# npm run firebase:emulators   # Terminal 1

# npm run dev                   # Terminal 2

# ```

# 

# Emulator UI: http://localhost:4000

# 

# \## Deploy til produksjon

# 

# \### Manuelt

# 

# ```bash

# npm run build

# firebase deploy --only hosting

# ```

# 

# \### Automatisk (GitHub Actions)

# 

# Legg til disse secrets i GitHub → Settings → Secrets and variables → Actions:

# 

# | Secret | Beskrivelse |

# |--------|-------------|

# | `FIREBASE\_SERVICE\_ACCOUNT` | JSON-nøkkel fra Firebase → Prosjektinnstillinger → Tjenestekontoer |

# | `VITE\_FIREBASE\_API\_KEY` | API-nøkkel |

# | `VITE\_FIREBASE\_AUTH\_DOMAIN` | Auth-domene |

# | `VITE\_FIREBASE\_PROJECT\_ID` | Prosjekt-ID |

# | `VITE\_FIREBASE\_STORAGE\_BUCKET` | Storage bucket |

# | `VITE\_FIREBASE\_MESSAGING\_ID` | Messaging sender ID |

# | `VITE\_FIREBASE\_APP\_ID` | App ID |

# 

# Deretter:

# \- \*\*Push til `main`\*\* → Automatisk deploy til produksjon

# \- \*\*Pull request\*\* → Preview-deploy med unik URL

# 

# \### Firestore sikkerhetsregler

# 

# Deploy regler:

# ```bash

# firebase deploy --only firestore:rules

# ```

# 

# Se `firebase/firestore.rules` for rollebasert tilgangskontroll.

# 

# \## Prosjektstruktur

# 

# ```

# hemit-nyttestyring/

# ├── .github/workflows/

# │   └── deploy.yml              # CI/CD pipeline

# ├── firebase/

# │   ├── firestore.rules         # Sikkerhetsregler

# │   └── firestore.indexes.json  # Sammensatte indekser

# ├── public/

# │   └── favicon.svg             # Hemit-ikon

# ├── src/

# │   ├── main.jsx                # React entry point

# │   ├── App.jsx                 # Hovedkomponent (UI + logikk)

# │   ├── firebase.js             # Firebase init + emulator-kobling

# │   ├── firestore.js            # Firestore CRUD-operasjoner

# │   └── useAuth.js              # Auth hook (Azure AD + e-post)

# ├── .env.example                # Mal for miljøvariabler

# ├── .firebaserc                 # Firebase prosjekt-alias

# ├── .gitignore

# ├── firebase.json               # Firebase hosting + emulators

# ├── index.html                  # Vite HTML entry

# ├── package.json

# ├── vite.config.js

# └── README.md

# ```

# 

# \## Firestore datamodell

# 

# \### `tasks/{id}` – Forbedringsforslag

# ```

# id, title, desc, tracks\[], status, sprint, parentId,

# size (SP), priority, goals\[], submitterName, submitterDept,

# processOwner, date, reviewed, personalData, eqsRef,

# value, urgency, risk, feasibility, deps, effort,

# actualHours, comments\[], history\[], attachments\[], archived

# ```

# 

# \### `team/{id}` – Teammedlemmer

# ```

# id, name, role, availability (%), skills\[], track

# ```

# 

# \### `goals/{id}` – Strategiske mål

# ```

# id, title, type ("Hovedmål"|"Delmål"), parent (goalId|null)

# ```

# 

# \### `config/app` – Konfigurasjon

# ```

# sprintName, sprintStart, sprintEnd, sprintWeeks,

# notifyEmails\[], emailNotifications, notifyProcessOwner,

# scoringWeights { wsjf, trackSpecific }, dpiaLink, dpiaEqsRef

# ```

# 

# \## Azure AD SSO-oppsett

# 

# 1\. Gå til \[Azure Portal](https://portal.azure.com) → \*\*App-registreringer\*\*

# 2\. \*\*Ny registrering\*\* → `Hemit Nyttestyring`

# 3\. \*\*Omdirigerings-URI\*\*: `https://DITT\_PROSJEKT.firebaseapp.com/\_\_/auth/handler`

# 4\. Kopier \*\*Application (client) ID\*\* og \*\*Directory (tenant) ID\*\*

# 5\. \*\*Sertifikater og hemmeligheter\*\* → Ny klienthemmelighet → Kopier verdi

# 6\. Firebase Console → Authentication → Microsoft → Lim inn klient-ID og hemmelighet

# 7\. Sett `VITE\_AZURE\_TENANT\_ID=din-tenant-id` i `.env.local`

# 

# \## Roller

# 

# | Rolle | Tilgang |

# |-------|---------|

# | `employee` | Melde forslag, se egne |

# | `forum` | Vurdere, score, prioritere, administrere mål |

# | `team` | Sprintplanlegging, kapasitet, backlog |

# | `admin` | Konfigurasjon, alle rettigheter |

# 

# \## Lisens

# 

# Intern bruk



