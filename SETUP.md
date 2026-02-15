# Oppsettguide – Hemit Nyttestyringsverktoy

Denne guiden tar deg gjennom alle steg for a fa verktøyet opp og kjøre med Firebase og GitHub Actions.

**Forutsetninger:**
- Firebase-prosjekt `nyttestyring` er opprettet
- GitHub-repo: `https://github.com/eirikwolf/nyttestyring`

---

## Steg 1: Aktiver Firestore Database

> Hopp over dette steget hvis du allerede har opprettet databasen.

1. Ga til [Firebase Console](https://console.firebase.google.com) → Velg prosjektet **nyttestyring**
2. Ga til **Build → Firestore Database**
3. Klikk **"Opprett database"**
4. Velg lokasjon: **`europe-west1`** (Belgia)
5. Velg **Produksjonsmodus** (reglene vi deployer overskriver dette)

---

## Steg 2: Registrer webapp og hent nokler

1. Firebase Console → **⚙️ Prosjektinnstillinger** → **Dine apper**
2. Klikk **`</>`** (Legg til webapp)
3. Navn: `Hemit Nyttestyring` → Klikk **Registrer app**
4. Du far nå en `firebaseConfig`-blokk. **Kopier disse 6 verdiene** – du trenger dem i steg 3 og 4:

```
apiKey:            "AIzaSy..."
authDomain:        "nyttestyring.firebaseapp.com"
projectId:         "nyttestyring"
storageBucket:     "nyttestyring.firebasestorage.app"
messagingSenderId: "123456789012"
appId:             "1:123...:web:abc..."
```

---

## Steg 3: Hent tjenestekonto-nokkel

1. Firebase Console → **⚙️ Prosjektinnstillinger** → **Tjenestekontoer**
2. Klikk **"Generer ny privat nokkel"**
3. Last ned JSON-filen (den inneholder hele service account-nokkkelen)
4. Apne filen og kopier **hele innholdet** – du trenger det i neste steg

---

## Steg 4: Legg til GitHub Secrets

Ga til: **https://github.com/eirikwolf/nyttestyring/settings/secrets/actions**

Klikk **"New repository secret"** for hver av disse 7:

| Secret-navn | Verdi |
|-------------|-------|
| `FIREBASE_SERVICE_ACCOUNT` | Hele JSON-innholdet fra steg 3 |
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` (fra steg 2) |
| `VITE_FIREBASE_AUTH_DOMAIN` | `nyttestyring.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `nyttestyring` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `nyttestyring.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_ID` | Nummeret fra steg 2 |
| `VITE_FIREBASE_APP_ID` | App-ID fra steg 2 |

---

## Steg 5: Push filene til GitHub

```bash
git add .
git commit -m "Klargjort for Firebase deploy"
git push origin main
```

Etter push skjer følgende automatisk via GitHub Actions:
1. Bygger appen med Vite
2. Deployer Firestore-regler og indekser
3. Deployer til Firebase Hosting

**Appen blir tilgjengelig pa:** `https://nyttestyring.web.app`

Du kan følge fremdriften under: **https://github.com/eirikwolf/nyttestyring/actions**

---

## Steg 6: Seed startdata (valgfritt)

Appen fungerer uten startdata (den bruker innebygde demodata i minnet). Men hvis du vil ha dataene lagret i Firestore:

### Alternativ A: Kjør seed-script lokalt

```bash
# 1. Opprett .env.local fra malen
cp .env.example .env.local

# 2. Rediger .env.local – fyll inn de ekte verdiene fra steg 2:
#    VITE_FIREBASE_API_KEY=AIzaSy...din-ekte-nøkkel
#    (osv. for alle 6 verdier)

# 3. Installer avhengigheter og kjør seed
npm install
node scripts/seed-firestore.js
```

### Alternativ B: Legg inn data manuelt

Firebase Console → Firestore Database → klikk **"Start samling"** og opprett dokumenter manuelt.

---

## Steg 7: Verifiser

1. Apne **https://nyttestyring.web.app** i nettleseren
2. Bytt rolle med rolleveksleren i headeren (Medarbeider → Forum → Team → Admin)
3. Sjekk at alle faner fungerer:
   - **Medarbeider:** Meld forslag, Mine
   - **Forum:** Innkomne, Alle, Backlog, Mål
   - **Team:** Backlog, Sprint, Kapasitet, Dashboard
   - **Admin:** Konfig, Mål

---

## Vedlikehold

### Oppdatere appen
Push endringer til `main` – GitHub Actions bygger og deployer automatisk.

### Aktivere tilgangsstyring senere

Nar du er klar for a kreve innlogging:

1. Rediger `firebase/firestore.rules`:
   - Kommenter ut "Apen modus"-blokken (linje 16-18)
   - Fjern kommentarer fra "Sikret modus"-blokken (linje 22-75)
2. Aktiver Authentication i Firebase Console:
   - **Build → Authentication → Kom i gang**
   - Aktiver **E-post/passord**
   - (Valgfritt) Aktiver **Microsoft** for Azure AD SSO
3. Push endringene – reglene deployes automatisk via GitHub Actions
4. Opprett brukere i `users`-samlingen med rolleinfo:
   ```
   users/{uid} → { role: "admin" }
   ```

### Aktivere Azure DevOps / ServiceNow

Disse integrasjonene konfigureres i appen under **Admin → Konfig** (scroll ned til integrasjonsseksjonene). Tilkoblingsinfo lagres i config-dokumentet.

---

## Feilsøking

| Problem | Løsning |
|---------|---------|
| GitHub Actions feiler pa build | Sjekk at alle 7 secrets er lagt inn riktig |
| Firestore regler feiler | Sjekk at `FIREBASE_SERVICE_ACCOUNT` inneholder gyldig JSON |
| Appen viser "Firebase-feil" | Sjekk at webapp er registrert i Firebase Console (steg 2) |
| `nyttestyring.web.app` er ikke tilgjengelig | Vent noen minutter etter første deploy |
| Seed-script feiler | Sjekk at `.env.local` har riktige verdier |

---

## Filendringer gjort for dette oppsettet

| Fil | Endring |
|-----|---------|
| `.firebaserc` | Satt prosjekt-ID til `nyttestyring` |
| `firebase/firestore.rules` | Apen modus (ingen auth krevd), med sikret modus klar til aktivering |
| `.github/workflows/deploy.yml` | Lagt til automatisk deploy av Firestore-regler og indekser |
| `.env.example` | Oppdatert med riktig prosjekt-ID i eksempelverdier |
| `scripts/seed-firestore.js` | **Nytt** – Seed-script for a legge startdata i Firestore |
| `SETUP.md` | **Nytt** – Denne filen |
