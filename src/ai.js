// ══ AI-hjelpefunksjoner – Google Gemini API ══
import { SCORING_CRITERIA, BENEFIT_CATEGORIES, BENEFIT_UNITS, BENEFIT_CLASSIFICATIONS } from "./constants";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-2.5-flash";

/**
 * Generisk kall til Gemini generateContent med structured output (responseJsonSchema).
 * Returnerer parset JSON-objekt direkte.
 */
const callGemini = async (apiKey, prompt, schema, model = DEFAULT_MODEL) => {
  if (!apiKey) throw new Error("API-nøkkel ikke konfigurert. Gå til Konfig → Generelt, eller sett VITE_GEMINI_API_KEY i .env.local.");
  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        temperature: 0.4,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Gemini-feil (${res.status}): ${err.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Tomt svar fra Gemini. Prøv igjen.");
  return JSON.parse(text);
};

/**
 * Henter API-nøkkel: config-felt har prioritet, deretter .env-variabel.
 */
const getApiKey = (config) => config.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || "";

// ── Schema for "Foreslå gevinster" ──────────────────
const BENEFITS_SCHEMA = {
  type: "object",
  properties: {
    kvalitative: {
      type: "string",
      description: "Kvalitative gevinster: forbedret kvalitet, sikkerhet, brukeropplevelse, arbeidsmiljø osv.",
    },
    kvantitative: {
      type: "string",
      description: "Kvantitative gevinster: timer spart, kostnadsreduksjon, antall berørte brukere, målbare forbedringer.",
    },
  },
  required: ["kvalitative", "kvantitative"],
};

// ── Schema for "Vurder automatisk" ──────────────────
const SCORING_SCHEMA = {
  type: "object",
  properties: Object.fromEntries(
    SCORING_CRITERIA.map(c => [
      c.key,
      {
        type: "object",
        properties: {
          score: { type: "number", description: `Score 0–10 for ${c.label}` },
          begrunnelse: { type: "string", description: `Kort begrunnelse for scoren på ${c.label}` },
        },
        required: ["score", "begrunnelse"],
      },
    ])
  ),
  required: SCORING_CRITERIA.map(c => c.key),
};

/**
 * Funksjon A: Foreslå gevinster basert på beskrivelse, bakgrunn og løsningstype.
 * Returnerer: { kvalitative: string, kvantitative: string }
 */
export const suggestBenefits = async (config, losningstype, beskrivelse, bakgrunn) => {
  const apiKey = getApiKey(config);
  const prompt = `Du er en ekspert på digitalisering og nyttevurdering i norsk helsevesen (spesialisthelsetjenesten).

Løsningskategori: ${losningstype || "Ikke angitt"}
Behov/beskrivelse: ${beskrivelse}
Bakgrunn: ${bakgrunn}

Foreslå konkrete kvalitative og kvantitative gevinster for dette digitaliseringstiltaket.
Skriv på norsk. Vær konkret, realistisk og relevant for helsesektoren.`;

  return callGemini(apiKey, prompt, BENEFITS_SCHEMA);
};

/**
 * Funksjon B: Vurder tiltaket automatisk mot 7 prioriteringskriterier.
 * Returnerer: { regulatory: { score, begrunnelse }, security: { ... }, ... }
 */
export const autoScore = async (config, losningstype, beskrivelse, bakgrunn, gevinster) => {
  const apiKey = getApiKey(config);
  const kriterierTekst = SCORING_CRITERIA.map(c => `- ${c.label} (nøkkel: ${c.key}, vekt: ${Math.round(c.weight * 100)}%)`).join("\n");

  const prompt = `Du er en ekspert på prioritering av IT-tiltak i norsk spesialisthelsetjeneste.

Løsningskategori: ${losningstype || "Ikke angitt"}
Behov/beskrivelse: ${beskrivelse}
Bakgrunn: ${bakgrunn}
Kvalitative gevinster: ${gevinster.qualitative || "Ikke angitt"}
Kvantitative gevinster: ${gevinster.quantitative || "Ikke angitt"}

Vurder dette tiltaket mot følgende 7 prioriteringskriterier og gi en score fra 0 til 10 med kort begrunnelse for hver:
${kriterierTekst}

Vær realistisk og nøktern i vurderingen. Skriv begrunnelser på norsk.`;

  const result = await callGemini(apiKey, prompt, SCORING_SCHEMA);
  // Normaliser: sørg for at score alltid er mellom 0-10 og at "reason" alias finnes
  SCORING_CRITERIA.forEach(c => {
    if (result[c.key]) {
      result[c.key].score = Math.min(10, Math.max(0, Math.round(result[c.key].score || 0)));
      result[c.key].reason = result[c.key].begrunnelse || "";
    }
  });
  return result;
};

// ── Schema for "Foreslå nytte" ──────────────────
const BENEFIT_ESTIMATE_SCHEMA = {
  type: "object",
  properties: {
    expectedBenefit: { type: "string", description: "Kort beskrivelse av forventet nytteeffekt (1-2 setninger)" },
    benefitCategory: { type: "string", enum: BENEFIT_CATEGORIES.map(c => c.id), description: "Nyttekategori" },
    benefitUnit: { type: "string", enum: BENEFIT_UNITS.map(u => u.id), description: "Mest relevant måleenhet" },
    benefitClassification: { type: "string", enum: BENEFIT_CLASSIFICATIONS.map(c => c.id), description: "Kvantitativ eller kvalitativ" },
    benefitMetric: { type: "string", description: "Konkret metrikk/KPI som bør måles, f.eks. 'Behandlingstid per sak'" },
    benefitBaseline: { type: "string", description: "Realistisk estimat av nåverdi (baseline) som tall" },
    benefitTarget: { type: "string", description: "Realistisk målverdi etter implementering som tall" },
    estimatedAnnualSaving: { type: "string", description: "Estimert årlig besparelse i NOK som tall (kun siffer)" },
  },
  required: ["expectedBenefit", "benefitCategory", "benefitUnit", "benefitClassification", "benefitMetric", "benefitBaseline", "benefitTarget", "estimatedAnnualSaving"],
};

/**
 * Funksjon C: Foreslå nytteverdier basert på innmeldingsdata.
 * Returnerer forslag til alle felt under "Forventet nytte" + estimert årlig besparelse.
 */
export const suggestBenefitEstimate = async (config, taskData) => {
  const apiKey = getApiKey(config);

  const kategorier = BENEFIT_CATEGORIES.map(c => `${c.id} = ${c.label}`).join(", ");
  const enheter = BENEFIT_UNITS.map(u => `${u.id} = ${u.label}`).join(", ");

  const prompt = `Du er en ekspert på nyttevurdering og gevinstrealisering i norsk spesialisthelsetjeneste (Helse Midt-Norge).

Oppgave: Estimer forventet nytte og fyll ut alle felt basert på følgende informasjon om et forbedringstiltak.

═══ INNMELDT INFORMASJON ═══
Tittel: ${taskData.title || "Ikke angitt"}
Beskrivelse: ${taskData.desc || "Ikke angitt"}
Løsningskategori: ${taskData.solutionCategory || "Ikke angitt"}
Behov: ${taskData.needSummary || "Ikke angitt"}
Bakgrunn: ${taskData.background || "Ikke angitt"}
Kvalitative gevinster (innmeldt): ${taskData.qualitativeBenefits || "Ikke angitt"}
Kvantitative gevinster (innmeldt): ${taskData.quantitativeBenefits || "Ikke angitt"}
Manuell oppgave i dag: ${taskData.manualTask === "yes" ? "Ja" : taskData.manualTask === "no" ? "Nei" : "Ikke angitt"}
Hvem utfører oppgaven: ${taskData.taskPerformer || "Ikke angitt"}
Frekvens: ${taskData.frequency || "Ikke angitt"}
Volum per gang: ${taskData.volumePerTime || "Ikke angitt"}
Forventet tidsbesparelse (t/år): ${taskData.annualTimeSaving || "Ikke angitt"}
Involerte systemer: ${taskData.involvedSystems || "Ikke angitt"}
Foretak: ${taskData.enterprise || "Ikke angitt"}

═══ TILGJENGELIGE VERDIER ═══
Nyttekategorier: ${kategorier}
Måleenheter: ${enheter}
Klassifisering: kvantitativ, kvalitativ

═══ INSTRUKSJONER ═══
- Gi et konkret, realistisk estimat for hvert felt
- benefitBaseline og benefitTarget skal være realistiske tallverdier i valgt måleenhet
- estimatedAnnualSaving skal være et realistisk beløp i NOK (kun siffer, ingen valutategn)
- Bruk innmeldt tidsbesparelse, volum og frekvens for å beregne besparelse der det er mulig
- Vær konservativ i estimatene – heller for lavt enn for høyt
- Alle tekstfelt på norsk`;

  return callGemini(apiKey, prompt, BENEFIT_ESTIMATE_SCHEMA);
};
