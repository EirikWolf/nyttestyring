import { describe, test, expect } from "vitest";
import { SCORING_CRITERIA, SCORE_EXAMPLES, calcWeightedScore, makeComposite } from "../constants";

// ── SCORING_CRITERIA ─────────────────────────────────
describe("SCORING_CRITERIA", () => {
  test("inneholder nøyaktig 7 kriterier", () => {
    expect(SCORING_CRITERIA).toHaveLength(7);
  });

  test("hvert kriterie har key, label og weight", () => {
    SCORING_CRITERIA.forEach(c => {
      expect(c.key).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(typeof c.weight).toBe("number");
      expect(c.weight).toBeGreaterThan(0);
      expect(c.weight).toBeLessThanOrEqual(1);
    });
  });

  test("vektene summerer til 1.0", () => {
    const sum = SCORING_CRITERIA.reduce((s, c) => s + c.weight, 0);
    expect(Math.round(sum * 100) / 100).toBe(1.0);
  });

  test("inneholder forventede kriterier", () => {
    const keys = SCORING_CRITERIA.map(c => c.key);
    expect(keys).toContain("regulatory");
    expect(keys).toContain("security");
    expect(keys).toContain("costSaving");
    expect(keys).toContain("dataQuality");
    expect(keys).toContain("simplicity");
    expect(keys).toContain("patientBenefit");
    expect(keys).toContain("employeeSat");
  });

  test("korrekte vekter per kriterie", () => {
    const w = Object.fromEntries(SCORING_CRITERIA.map(c => [c.key, c.weight]));
    expect(w.regulatory).toBe(0.15);
    expect(w.security).toBe(0.10);
    expect(w.costSaving).toBe(0.20);
    expect(w.dataQuality).toBe(0.15);
    expect(w.simplicity).toBe(0.10);
    expect(w.patientBenefit).toBe(0.15);
    expect(w.employeeSat).toBe(0.15);
  });
});

// ── SCORE_EXAMPLES ───────────────────────────────────
describe("SCORE_EXAMPLES", () => {
  test("har eksempler for alle 7 kriterier", () => {
    SCORING_CRITERIA.forEach(c => {
      expect(SCORE_EXAMPLES[c.key]).toBeDefined();
    });
  });

  test("hvert kriterie har 11 eksempler (index 0–10)", () => {
    SCORING_CRITERIA.forEach(c => {
      expect(SCORE_EXAMPLES[c.key]).toHaveLength(11);
    });
  });

  test("alle eksempler er strenger", () => {
    SCORING_CRITERIA.forEach(c => {
      SCORE_EXAMPLES[c.key].forEach(ex => {
        expect(typeof ex).toBe("string");
        expect(ex.length).toBeGreaterThan(0);
      });
    });
  });
});

// ── calcWeightedScore ────────────────────────────────
// Formel: sum(criterion_score * weight) for alle 7 kriterier → 0–10
describe("calcWeightedScore", () => {
  test("alle 0 gir score 0", () => {
    const t = { regulatory: 0, security: 0, costSaving: 0, dataQuality: 0, simplicity: 0, patientBenefit: 0, employeeSat: 0 };
    expect(calcWeightedScore(t)).toBe(0);
  });

  test("alle 10 gir score 10", () => {
    const t = { regulatory: 10, security: 10, costSaving: 10, dataQuality: 10, simplicity: 10, patientBenefit: 10, employeeSat: 10 };
    expect(calcWeightedScore(t)).toBe(10);
  });

  test("alle 5 gir score 5", () => {
    const t = { regulatory: 5, security: 5, costSaving: 5, dataQuality: 5, simplicity: 5, patientBenefit: 5, employeeSat: 5 };
    expect(calcWeightedScore(t)).toBe(5);
  });

  test("manglende felt bruker default 0", () => {
    const t = {};
    expect(calcWeightedScore(t)).toBe(0);
  });

  test("kun costSaving=10 gir 2.0 (vekt 0.20)", () => {
    const t = { costSaving: 10 };
    expect(calcWeightedScore(t)).toBe(2.0);
  });

  test("kun security=10 gir 1.0 (vekt 0.10)", () => {
    const t = { security: 10 };
    expect(calcWeightedScore(t)).toBe(1.0);
  });

  test("kun regulatory=10 gir 1.5 (vekt 0.15)", () => {
    const t = { regulatory: 10 };
    expect(calcWeightedScore(t)).toBe(1.5);
  });

  test("asymmetriske verdier beregnes korrekt", () => {
    const t = {
      regulatory: 8,     // 8 * 0.15 = 1.2
      security: 3,       // 3 * 0.10 = 0.3
      costSaving: 6,     // 6 * 0.20 = 1.2
      dataQuality: 7,    // 7 * 0.15 = 1.05
      simplicity: 4,     // 4 * 0.10 = 0.4
      patientBenefit: 9,  // 9 * 0.15 = 1.35
      employeeSat: 5,    // 5 * 0.15 = 0.75
    };
    // Sum: 1.2 + 0.3 + 1.2 + 1.05 + 0.4 + 1.35 + 0.75 = 6.25
    expect(calcWeightedScore(t)).toBe(6.3); // rounded to 1 decimal
  });

  test("avrunder til 1 desimal", () => {
    // Lager en case der resultatet krever avrunding
    const t = {
      regulatory: 3,     // 3 * 0.15 = 0.45
      security: 7,       // 7 * 0.10 = 0.7
      costSaving: 2,     // 2 * 0.20 = 0.4
      dataQuality: 8,    // 8 * 0.15 = 1.2
      simplicity: 1,     // 1 * 0.10 = 0.1
      patientBenefit: 6,  // 6 * 0.15 = 0.9
      employeeSat: 4,    // 4 * 0.15 = 0.6
    };
    // Sum: 0.45 + 0.7 + 0.4 + 1.2 + 0.1 + 0.9 + 0.6 = 4.35
    const result = calcWeightedScore(t);
    expect(result).toBe(4.4); // round(4.35 * 10) / 10 = round(43.5) / 10 = 44 / 10 = 4.4
  });

  test("delvis utfylte felter beregnes riktig", () => {
    const t = {
      regulatory: 10,    // 10 * 0.15 = 1.5
      costSaving: 10,    // 10 * 0.20 = 2.0
      patientBenefit: 10, // 10 * 0.15 = 1.5
    };
    // Sum: 1.5 + 0 + 2.0 + 0 + 0 + 1.5 + 0 = 5.0
    expect(calcWeightedScore(t)).toBe(5.0);
  });
});

// ── makeComposite ────────────────────────────────────
describe("makeComposite", () => {
  test("returnerer en funksjon", () => {
    const composite = makeComposite({});
    expect(typeof composite).toBe("function");
  });

  test("gir samme resultat som calcWeightedScore", () => {
    const composite = makeComposite({});
    const t = { regulatory: 7, security: 5, costSaving: 8, dataQuality: 6, simplicity: 3, patientBenefit: 9, employeeSat: 4 };
    expect(composite(t)).toBe(calcWeightedScore(t));
  });

  test("håndterer null config", () => {
    const composite = makeComposite(null);
    const t = { regulatory: 5, security: 5, costSaving: 5, dataQuality: 5, simplicity: 5, patientBenefit: 5, employeeSat: 5 };
    expect(composite(t)).toBe(5);
  });

  test("håndterer tomt task-objekt", () => {
    const composite = makeComposite({});
    expect(composite({})).toBe(0);
  });

  test("ignorerer gamle WSJF-felter", () => {
    const composite = makeComposite({});
    const t = { value: 5, urgency: 5, risk: 5, feasibility: 5, deps: 5, effort: 5 };
    // Gamle felter har ingen effekt, alle nye kriterier er 0
    expect(composite(t)).toBe(0);
  });
});
