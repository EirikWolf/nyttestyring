// ══ AI-hjelpefunksjoner – Google Gemini API ══
import { SCORING_CRITERIA } from "./constants";

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
