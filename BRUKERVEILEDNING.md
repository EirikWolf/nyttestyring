# Brukerveiledning – Hemit Nyttestyringsverktoy

> Versjon 6.3

---

## 1. Hva er Nyttestyringsverktøyet?

Nyttestyringsverktøyet hjelper Hemit HF med å ta imot, vurdere og prioritere forbedringsforslag. Alle ansatte kan melde inn forslag, som deretter vurderes av Utviklingsforumet, planlegges av Leveranseteamet og følges opp gjennom sprinter.

Verktøyet bruker anerkjente prioriteringsmodeller (WSJF, RICE, ICE m.fl.) for å sikre at de viktigste forslagene prioriteres først.

---

## 2. Roller

Verktøyet har fire roller. Hvilken rolle du har bestemmer hvilke faner og funksjoner du ser.

| Rolle | Hvem | Hovedoppgaver |
|-------|------|---------------|
| **Medarbeider** | Alle ansatte | Melde inn forbedringsforslag, følge med på egne forslag |
| **Utviklingsforum** | Vurderingsgruppen | Vurdere og score innkomne forslag, koble til strategiske mål |
| **Leveranseteam** | Utviklingsteamet | Planlegge sprinter, utføre arbeid, registrere timer |
| **Administrator** | Systemansvarlig | Konfigurere verktøyet, sette opp integrasjoner |

Når tilgangsstyring ikke er aktivert, kan du bytte rolle med knappene i topplinjen.

---

## 3. Medarbeider

### 3.1 Meld forslag

Dette er skjemaet der du sender inn et forbedringsforslag.

**Grunndata**

Fyll inn følgende informasjon:

- **Tittel** (obligatorisk) – Kort beskrivelse av forslaget
- **Problembeskrivelse** – Hva er utfordringen? Beskriv gjerne nåsituasjonen
- **Ditt navn** (obligatorisk) – Fornavn og etternavn
- **Avdeling** – Hvilken avdeling du tilhører
- **Prosess-/systemeier** – Hvem eier prosessen eller systemet det gjelder?
- **Prioritet** – Hvor viktig er dette? (Lav / Medium / Høy / Kritisk)
- **EQS-referanse** – Hvis forslaget er knyttet til en prosedyre i kvalitetssystemet
- **Persondata** – Innebærer forslaget behandling av personopplysninger? (Usikker / Ja / Nei)

**Duplikatsjekk**

Mens du skriver tittelen, sjekker systemet automatisk om lignende forslag allerede er registrert. Hvis det finnes treff, vises de som en advarsel slik at du kan unngå duplikater.

**DPIA-varsel**

Hvis du velger «Ja» på persondata, vises en advarsel om at det kreves en personvernvurdering (DPIA). Du får lenke til DPIA-malen og referanse til gjeldende prosedyre.

**Strategiske mål**

Du kan koble forslaget til ett eller flere av organisasjonens strategiske mål. Klikk på målene som er relevante – valgte mål vises med hake.

**Vedlegg**

Klikk i vedleggsfeltet for å legge til filer. Vedlagte filer vises som merkelapper som kan fjernes.

**Egenvurdering (WSJF)**

Du kan gi en foreløpig vurdering av forslaget langs seks dimensjoner (skala 1–5):

| Dimensjon | Hva betyr det? |
|-----------|----------------|
| Forretningsverdi | Hvor stor nytte gir dette? |
| Hastegrad | Hvor tidskritisk er det? |
| Risiko ved utsettelse | Hva er risikoen ved å vente? |
| Gjennomførbarhet | Er det teknisk/organisatorisk realistisk? |
| Avhengigheter | Hvor mange andre ting avhenger av dette? |
| Innsats (invertert) | Hvor mye arbeid kreves? (lavere = bedre) |

Poengsummen beregnes automatisk og vises til høyre.

**Sende inn**

Klikk «Send inn forslag». Forslaget sendes til Utviklingsforum for vurdering. Du får en bekreftelse, og skjemaet tømmes.

### 3.2 Mine forslag

Her ser du en oversikt over dine egne innsendte forslag med tittel, dato og status.

---

## 4. Utviklingsforum

### 4.1 Innkomne

Viser alle forslag som ikke er vurdert ennå. Antallet vises som et tall på fanen.

For hvert forslag ser du:
- Tittel og prioritet
- Beskrivelse
- Hvem som har meldt inn, prosesseier og dato
- Merkelapper for EQS-referanse og persondata

**Handlinger:**
- **Vurder →** – Åpner vurderingsvinduet (se 4.2)
- **Slett** – Fjerner forslaget (krever bekreftelse)

Når alle forslag er vurdert, vises «Alle vurdert!».

### 4.2 Vurdere et forslag

Når du klikker «Vurder», åpnes et vindu der du gjennomgår og scorer forslaget.

**Øverst** ser du grunndata: tittel, innsender, prosesseier, dato, beskrivelse, EQS-referanse og eventuelle DPIA-varsler.

**WSJF-scoring**

Juster de seks dimensjonene med glidebryterne (1–5). WSJF-poengsummen oppdateres automatisk.

**Velg løype(r)**

Velg hvilke leveranseløyper forslaget tilhører ved å klikke på knappene:

| Løype | Ikon | Beskrivelse |
|-------|------|-------------|
| RPA | ⚙️ | Robotisert prosessautomatisering |
| Integrasjon | 🔗 | Integrasjon mellom systemer |
| Systemutvikling | 💻 | Utvikling av nye løsninger |
| No code / Low code | 🧩 | Løsninger med lite programmering |
| Kjøp av hyllevare | 📦 | Kjøp av ferdig programvare |

Når du velger en løype, dukker det opp ekstra vurderingsdimensjoner som er tilpasset den løypen (se seksjon 7 for detaljer).

**Prioritet og status**

- Velg prioritetsnivå (Lav / Medium / Høy / Kritisk)
- Velg status (for eksempel «Vurdert» eller «Klar for sprint»)

**Faktisk tidsbruk**

Registrer timer brukt så langt.

**Kommentar**

Skriv en begrunnelse eller merknad som legges til forslagets kommentarfelt.

**Deloppgaver**

Hvis forslaget er stort nok, kan du opprette deloppgaver. Hver deloppgave får egen tittel, story points og status. Fremdriften vises som en prosentbar.

**Godkjenn**

Klikk «Godkjenn» for å lagre vurderingen. Forslaget markeres som vurdert og flyttes ut av innboksen.

### 4.3 Alle

Viser alle oppgaver i en tabell med mulighet for filtrering og sortering.

**Tabellen viser:**
- Oppgave (tittel, innsender, deloppgave-indikator)
- Løype-merkelapper
- Score (fargekode: grønn > 200, oransje > 100, rød < 100)
- Verdi, Hastegrad, Gjennomførbarhet (visuelle søyler)
- Story Points
- Timer brukt
- Status

**Verktøylinjen:**
- **Søk** – Fritekst i tittel, beskrivelse, innsender og prosesseier
- **Filtrer etter løype** – Vis bare oppgaver i en bestemt løype
- **Filtrer etter status** – Vis bare en bestemt status
- **Sorter** – Etter score, prioritet eller dato
- **Vis arkiverte** – Slå av/på visning av arkiverte oppgaver

**Utvid en rad** ved å klikke på den for å se beskrivelse, kommentarer, endringshistorikk og mulighet for å legge til sprint eller arkivere.

**Batch-operasjoner:** Velg flere oppgaver med avkrysningsboksene, og endre status, legg til sprint eller arkiver alle samtidig.

### 4.4 Mål

Her oppretter og administrerer du strategiske mål.

**Opprett nytt mål:**
- Tittel
- Type: Hovedmål eller Delmål
- Overordnet: Velg hvilket hovedmål delmålet hører under

**Målregisteret** viser hierarkiet med hovedmål og tilhørende delmål. For hvert mål ser du hvor mange tilknyttede oppgaver som er ferdige, og en fremdriftsindikator.

---

## 5. Leveranseteam

### 5.1 Backlog

Identisk med forumets «Alle»-fane, men med en viktig forskjell: teamet kan redigere **story points** direkte i tabellen via en nedtrekksmeny. Story points angis i Fibonacci-skala:

| Poeng | Omfang |
|-------|--------|
| 1 | Triviell (timer) |
| 2 | Enkel (halv dag) |
| 3 | Overkommelig (1 dag) |
| 5 | Middels (2–3 dager) |
| 8 | Kompleks (1 uke) |
| 13 | Svært kompleks (2 uker) |
| 21 | Episk (full sprint+) |

### 5.2 Sprint

Kanban-tavle for gjeldende sprint. Øverst vises sprintens navn, datoer, fremdrift i prosent, story points og total kapasitet.

**Fire kolonner:**

| Kolonne | Betydning |
|---------|-----------|
| **Klar** | Oppgaver som er klare til å starte |
| **Pågår** | Oppgaver som jobbes med nå |
| **Blokkert** | Oppgaver som er stoppet av en avhengighet |
| **Ferdig** | Fullførte oppgaver |

**Dra og slipp** oppgavekort mellom kolonnene for å oppdatere status. Hvert kort viser tittel, løype, story points, timer brukt og eventuell deloppgave-fremdrift.

Klikk på et kort for å åpne vurderingsvinduet og redigere detaljer.

### 5.3 Kapasitet

Her administreres teamets medlemmer og kapasitet.

**Legge til nytt medlem:**
Fyll inn navn, stilling, løype og allokering i prosent, og klikk «+».

**Medlemskort:**
Hvert medlem vises som et kort med:
- Initialer (avatar), navn og stilling
- Løype med ikon og farge
- Allokering i prosent
- Beregnet kapasitet i timer
- Kompetanser (Backend, Frontend, UX, QA osv.)

**Kapasitetsberegning:**
```
Timer = allokering% × 37,5 timer/uke × antall sprintuker
```

Eksempel: 80 % allokering i en 2-ukers sprint = 60 timer.

Klikk blyant-ikonet for å redigere et medlem. Klikk søppelbøtta for å fjerne.

### 5.4 Dashboard

Visuell oversikt over teamets fremdrift.

**Nøkkeltall (øverst):**
- **Velocity** – Antall story points levert i forrige sprint
- **Sprint** – Fullføringsprosent for gjeldende sprint
- **Kapasitet** – Totalt tilgjengelige timer
- **Aktive** – Antall aktive oppgaver

**Diagrammer:**
- **Per løype** – Viser hvor mange aktive oppgaver som finnes i hver løype
- **Velocity** – Stolpediagram over de siste 6 sprintene

**Mål-fremgang:**
For hvert strategisk hovedmål vises antall fullførte oppgaver og en fremdriftsindikator.

---

## 6. Administrator

### 6.1 Konfigurasjon

Administratoren har tilgang til alle systeminnstillinger.

**Sprint-innstillinger**
- Sprintnavn, startdato, sluttdato og varighet i uker
- Brukes til kapasitetsberegning og sprint-tavlen

**E-postvarsling**
- Aktiver/deaktiver varsling
- Velg hendelser som utløser varsling: statusendring, vurdering, prosesseier
- Legg inn mottakeradresser (kommaseparert)

**DPIA / Personvern**
- Lenke til DPIA-mal
- Referanse til prosedyre i kvalitetssystemet
- Vises automatisk når et forslag innebærer persondata

**Scoringsvekter**
- Glidebryter som bestemmer fordelingen mellom WSJF-score og løypespesifikk score
- Standard: 60 % WSJF / 40 % løypespesifikk

**Tilgangsstyring (Microsoft Entra ID)**
- Slå av/på autentisering
- Når aktivert: konfigurer Tenant ID, Client ID, tillatte domener
- Sikkerhet: Krev MFA, auto-opprett brukere, sesjonstid
- Rollemapping: Koble Azure AD-grupper til roller i verktøyet
- Oppsettguide med trinn-for-trinn-instruksjoner

**Azure DevOps-integrasjon**
- Slå av/på synkronisering mot Azure DevOps
- Konfigurer organisasjons-URL, PAT (Personal Access Token) og prosjekt
- Velg work item-type (User Story, Bug, Task osv.)
- Konfigurer statusmapping mellom verktøyet og DevOps
- Oppsettguide inkludert

**ServiceNow-integrasjon**
- Slå av/på synkronisering mot ServiceNow
- Konfigurer instans-URL og autentisering (Basic Auth eller OAuth)
- Velg tabell (Incident, Change Request osv.), gruppe og kategori
- Konfigurer statusmapping
- Oppsettguide inkludert

**Lagre/Laste inn**
- «Lagre» – Lagrer all konfigurasjon
- «Last inn» – Henter sist lagrede konfigurasjon

### 6.2 Mål

Samme funksjonalitet som Utviklingsforumets mål-fane (se seksjon 4.4).

---

## 7. Scoring-systemet

Scoring brukes til å prioritere forbedringsforslag objektivt. Alle dimensjoner settes på en skala fra 1 (lav) til 5 (høy).

### 7.1 WSJF (brukes for alle forslag)

WSJF (Weighted Shortest Job First) er grunnmodellen. Formelen er:

```
WSJF = (Verdi + Hastegrad + Risiko) × Gjennomførbarhet × Avhengigheter × Innsats
```

Høyere poeng = høyere prioritet.

### 7.2 Løypespesifikke modeller

Når en løype velges under vurdering, legges det til ekstra dimensjoner:

**RPA Pipeline** (for automatisering)

| Dimensjon | Vurder |
|-----------|--------|
| Transaksjonsvolum | Hvor mange transaksjoner håndteres? |
| Regelbaserthet | Er prosessen regelbasert og forutsigbar? |
| Digitaliseringsgrad | Er data og systemer allerede digitale? |
| Prosess-stabilitet | Er prosessen stabil og sjelden endret? |
| Estimert ROI | Forventet avkastning? |

**Cost of Delay** (for integrasjoner)

| Dimensjon | Vurder |
|-----------|--------|
| Forretningsverdi | Hvor stor er verdien av integrasjonen? |
| Tidskritikalitet | Er det tidskritisk? |
| Mulighetskostnad | Hva taper vi ved å vente? |
| Nedstrøms blokkering | Blokkerer dette andre initiativer? |

**RICE** (for systemutvikling)

| Dimensjon | Vurder |
|-----------|--------|
| Reach | Hvor mange brukere berøres? |
| Impact | Hvor stor effekt per bruker? |
| Confidence | Hvor sikre er vi på estimatene? |
| Effort (invertert) | Hvor mye arbeid kreves? |

**ICE** (for no-code/low-code)

| Dimensjon | Vurder |
|-----------|--------|
| Impact | Forventet effekt |
| Confidence | Sikkerhet i vurderingen |
| Ease | Hvor enkelt er det å gjennomføre? |

**TCO/Fit** (for hyllevare)

| Dimensjon | Vurder |
|-----------|--------|
| Funksjonell dekning | Hvor godt dekker løsningen behovene? |
| TCO (invertert) | Total eierskapskostnad |
| Leverandørsoliditet | Er leverandøren pålitelig? |
| Integrasjonsevne | Kan det integreres med eksisterende systemer? |
| Sikkerhet/personvern | Oppfyller sikkerhetskravene? |

### 7.3 Sammensatt score

Den endelige scoren er summen av WSJF og alle valgte løype-scorer. Fargekoden hjelper deg å raskt se prioritet:

| Farge | Score | Betydning |
|-------|-------|-----------|
| Grønn | Over 200 | Høy prioritet |
| Oransje | 100–200 | Middels prioritet |
| Rød | Under 100 | Lavere prioritet |

---

## 8. Oppgavens livssyklus

Et forbedringsforslag går gjennom følgende statuser:

```
Innmeldt
  ↓  Utviklingsforum vurderer
Under vurdering → Vurdert (når løyper er valgt)
  ↓  Forum godkjenner for sprint
Klar for sprint
  ↓  Teamet starter arbeid
Pågår
  ├→ Blokkert (ved hindringer)
  │    └→ tilbake til Pågår/Klar
  └→ Ferdig
       ↓
     Arkivert

Alternativt:
  Innmeldt → Avvist → Arkivert
```

**Statusforklaring:**

| Status | Betydning |
|--------|-----------|
| Innmeldt | Nytt forslag, venter på vurdering |
| Under vurdering | Forum har startet vurdering |
| Vurdert | Vurdert med løype og score, venter på beslutning |
| Klar for sprint | Godkjent og klar til å jobbes med |
| Pågår | Under arbeid i gjeldende sprint |
| Blokkert | Stoppet av en avhengighet eller hindring |
| Ferdig | Fullført |
| Avvist | Ikke godkjent av forum |
| Arkivert | Fjernet fra aktiv visning |

---

## 9. Deloppgaver

Store oppgaver kan deles opp i deloppgaver for bedre styring.

**Opprette deloppgaver:**
1. Åpne vurderingsvinduet for en oppgave
2. Scroll ned til «Deloppgaver»
3. Skriv inn tittel og velg story points
4. Klikk «+ Legg til»

Deloppgaven får automatisk ID basert på hovedoppgaven (f.eks. T-001-A, T-001-B).

**Sporing:**
- Hovedoppgaven viser en fremdriftsbar med antall ferdige deloppgaver
- Hver deloppgave kan ha egen status og sprinttilordning
- I sprint-tavlen vises deloppgave-fremdriften på hovedoppgavens kort

---

## 10. Navigasjon og tema

**Topplinjen** inneholder:
- Appnavn og versjon
- Rolleveksler (når tilgangsstyring er av)
- Mørkt/lyst tema-knapp (måne/sol-ikon)
- Faner som endrer seg basert på valgt rolle

**Mørkt tema** bytter alle farger til en mørk palett som er behagelig for øynene i dunkle omgivelser. Klikk måne-ikonet i topplinjen for å bytte.

**Varsler** vises som meldinger øverst til høyre. De forsvinner automatisk etter noen sekunder. Grønne varsler betyr suksess, oransje betyr advarsel.

---

## 11. Hurtigreferanse

### Hva gjør jeg hvis...

| Jeg vil... | Gå til |
|------------|--------|
| Melde inn et forbedringsforslag | Medarbeider → Meld forslag |
| Se status på mine forslag | Medarbeider → Mine |
| Vurdere innkomne forslag | Forum → Innkomne |
| Se alle oppgaver med filtrering | Forum → Alle |
| Planlegge en sprint | Team → Sprint |
| Se teamets kapasitet | Team → Kapasitet |
| Se nøkkeltall og fremdrift | Team → Dashboard |
| Opprette strategiske mål | Forum/Admin → Mål |
| Konfigurere systemet | Admin → Konfig |
| Bytte til mørkt tema | Klikk måne-ikonet i topplinjen |

---

*Hemit HF – Nyttestyringsverktoy v6.3*
