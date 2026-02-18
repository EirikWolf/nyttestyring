import { describe, test, expect } from "vitest";
import { calcWsjf, calcCod, calcRpa, calcRice, calcIce, calcCots, makeComposite } from "../constants";

// ── WSJF ──────────────────────────────────────────────
// Formel: (value + urgency + risk) * feasibility * deps * effort
// Defaults: alle 3 → (3+3+3)*3*3*3 = 9*27 = 243
describe("calcWsjf", () => {
  test("standard default-verdier (alle 3) gir 243", () => {
    expect(calcWsjf({})).toBe((3 + 3 + 3) * 3 * 3 * 3);
    expect(calcWsjf({})).toBe(243);
  });

  test("minimum verdier (alle 1)", () => {
    const t = { value: 1, urgency: 1, risk: 1, feasibility: 1, deps: 1, effort: 1 };
    expect(calcWsjf(t)).toBe((1 + 1 + 1) * 1 * 1 * 1);
    expect(calcWsjf(t)).toBe(3);
  });

  test("maks verdier (alle 5)", () => {
    const t = { value: 5, urgency: 5, risk: 5, feasibility: 5, deps: 5, effort: 5 };
    expect(calcWsjf(t)).toBe((5 + 5 + 5) * 5 * 5 * 5);
    expect(calcWsjf(t)).toBe(1875);
  });

  test("manglende felt bruker default 3", () => {
    const t = { value: 5 };
    expect(calcWsjf(t)).toBe((5 + 3 + 3) * 3 * 3 * 3);
  });

  test("asymmetriske verdier", () => {
    const t = { value: 5, urgency: 1, risk: 2, feasibility: 4, deps: 2, effort: 3 };
    expect(calcWsjf(t)).toBe((5 + 1 + 2) * 4 * 2 * 3);
    expect(calcWsjf(t)).toBe(192);
  });
});

// ── Cost of Delay ─────────────────────────────────────
// Formel: cod_business + cod_time + cod_opportunity + cod_downstream
describe("calcCod", () => {
  test("default-verdier (alle 3)", () => {
    expect(calcCod({})).toBe(12);
  });

  test("maks verdier", () => {
    const t = { cod_business: 5, cod_time: 5, cod_opportunity: 5, cod_downstream: 5 };
    expect(calcCod(t)).toBe(20);
  });

  test("min verdier", () => {
    const t = { cod_business: 1, cod_time: 1, cod_opportunity: 1, cod_downstream: 1 };
    expect(calcCod(t)).toBe(4);
  });
});

// ── RPA Pipeline ──────────────────────────────────────
// Formel: (rpa_volume + rpa_rule + rpa_digital + rpa_stability) * rpa_roi
describe("calcRpa", () => {
  test("default-verdier (alle 3)", () => {
    expect(calcRpa({})).toBe((3 + 3 + 3 + 3) * 3);
    expect(calcRpa({})).toBe(36);
  });

  test("maks verdier", () => {
    const t = { rpa_volume: 5, rpa_rule: 5, rpa_digital: 5, rpa_stability: 5, rpa_roi: 5 };
    expect(calcRpa(t)).toBe(100);
  });

  test("min verdier", () => {
    const t = { rpa_volume: 1, rpa_rule: 1, rpa_digital: 1, rpa_stability: 1, rpa_roi: 1 };
    expect(calcRpa(t)).toBe(4);
  });
});

// ── RICE ──────────────────────────────────────────────
// Formel: round((reach * impact * confidence) / max(6 - effort, 1))
describe("calcRice", () => {
  test("default-verdier (alle 3)", () => {
    // (3*3*3) / max(6-3,1) = 27 / 3 = 9
    expect(calcRice({})).toBe(9);
  });

  test("maks effort unngaar deling paa 0", () => {
    // effort=5 → divisor = max(6-5,1) = max(1,1) = 1
    const t = { rice_reach: 5, rice_impact: 5, rice_confidence: 5, rice_effort: 5 };
    expect(calcRice(t)).toBe(125);
  });

  test("effort=6 ville gitt 0 i max, men clamps til 1", () => {
    // effort=6 (utenfor normal range, men testes) → max(6-6,1) = max(0,1) = 1
    const t = { rice_reach: 4, rice_impact: 4, rice_confidence: 4, rice_effort: 6 };
    expect(calcRice(t)).toBe(64);
  });

  test("lav effort gir hoey divisor", () => {
    // effort=1 → divisor = max(6-1,1) = 5
    const t = { rice_reach: 5, rice_impact: 5, rice_confidence: 5, rice_effort: 1 };
    expect(calcRice(t)).toBe(Math.round(125 / 5));
    expect(calcRice(t)).toBe(25);
  });

  test("runder ned korrekt", () => {
    // rice_reach=2, rice_impact=3, rice_confidence=4, rice_effort=2
    // (2*3*4) / max(6-2,1) = 24 / 4 = 6
    const t = { rice_reach: 2, rice_impact: 3, rice_confidence: 4, rice_effort: 2 };
    expect(calcRice(t)).toBe(6);
  });
});

// ── ICE ───────────────────────────────────────────────
// Formel: impact * confidence * ease
describe("calcIce", () => {
  test("default-verdier (alle 3)", () => {
    expect(calcIce({})).toBe(27);
  });

  test("maks verdier", () => {
    const t = { ice_impact: 5, ice_confidence: 5, ice_ease: 5 };
    expect(calcIce(t)).toBe(125);
  });

  test("min verdier", () => {
    const t = { ice_impact: 1, ice_confidence: 1, ice_ease: 1 };
    expect(calcIce(t)).toBe(1);
  });
});

// ── TCO/Fit (COTS) ───────────────────────────────────
// Formel: (cots_fit * cots_tco) + cots_vendor + cots_integration + cots_security
describe("calcCots", () => {
  test("default-verdier (alle 3)", () => {
    expect(calcCots({})).toBe(3 * 3 + 3 + 3 + 3);
    expect(calcCots({})).toBe(18);
  });

  test("maks verdier", () => {
    const t = { cots_fit: 5, cots_tco: 5, cots_vendor: 5, cots_integration: 5, cots_security: 5 };
    expect(calcCots(t)).toBe(5 * 5 + 5 + 5 + 5);
    expect(calcCots(t)).toBe(40);
  });

  test("min verdier", () => {
    const t = { cots_fit: 1, cots_tco: 1, cots_vendor: 1, cots_integration: 1, cots_security: 1 };
    expect(calcCots(t)).toBe(1 * 1 + 1 + 1 + 1);
    expect(calcCots(t)).toBe(4);
  });
});

// ── makeComposite ─────────────────────────────────────
describe("makeComposite", () => {
  test("returnerer WSJF alene uten tracks", () => {
    const composite = makeComposite({ scoringWeights: { wsjf: 60, trackSpecific: 40 } });
    const t = { value: 3, urgency: 3, risk: 3, feasibility: 3, deps: 3, effort: 3 };
    // Ingen tracks → x=0 → return w direkte (243)
    expect(composite(t)).toBe(243);
  });

  test("vekter WSJF og track-spesifikk score", () => {
    const composite = makeComposite({ scoringWeights: { wsjf: 60, trackSpecific: 40 } });
    const t = {
      value: 3, urgency: 3, risk: 3, feasibility: 3, deps: 3, effort: 3,
      tracks: ["rpa"],
      rpa_volume: 3, rpa_rule: 3, rpa_digital: 3, rpa_stability: 3, rpa_roi: 3,
    };
    // wsjf = 243, rpa = 36
    // result = round(243 * 0.6 + 36 * 0.4) = round(145.8 + 14.4) = round(160.2) = 160
    expect(composite(t)).toBe(Math.round(243 * 0.6 + 36 * 0.4));
    expect(composite(t)).toBe(160);
  });

  test("default vekter (60/40) brukes uten config", () => {
    const composite = makeComposite({});
    const t = {
      value: 5, urgency: 5, risk: 5, feasibility: 5, deps: 5, effort: 5,
      tracks: ["integration"],
      cod_business: 5, cod_time: 5, cod_opportunity: 5, cod_downstream: 5,
    };
    // wsjf = 1875, cod = 20
    // result = round(1875 * 0.6 + 20 * 0.4) = round(1125 + 8) = 1133
    expect(composite(t)).toBe(Math.round(1875 * 0.6 + 20 * 0.4));
  });

  test("summerer flere tracks", () => {
    const composite = makeComposite({ scoringWeights: { wsjf: 50, trackSpecific: 50 } });
    const t = {
      value: 3, urgency: 3, risk: 3, feasibility: 3, deps: 3, effort: 3,
      tracks: ["rpa", "integration"],
      rpa_volume: 3, rpa_rule: 3, rpa_digital: 3, rpa_stability: 3, rpa_roi: 3,
      cod_business: 3, cod_time: 3, cod_opportunity: 3, cod_downstream: 3,
    };
    // wsjf = 243, rpa = 36, cod = 12 → x = 48
    // result = round(243 * 0.5 + 48 * 0.5) = round(121.5 + 24) = round(145.5) = 146
    expect(composite(t)).toBe(Math.round(243 * 0.5 + 48 * 0.5));
  });

  test("haandterer null/undefined config", () => {
    const composite = makeComposite(null);
    const t = {
      value: 3, urgency: 3, risk: 3, feasibility: 3, deps: 3, effort: 3,
      tracks: ["sysdev"],
      rice_reach: 3, rice_impact: 3, rice_confidence: 3, rice_effort: 3,
    };
    // wsjf = 243, rice = 9
    // default 60/40: round(243 * 0.6 + 9 * 0.4) = round(145.8 + 3.6) = round(149.4) = 149
    expect(composite(t)).toBe(Math.round(243 * 0.6 + 9 * 0.4));
  });

  test("egendefinerte vekter (80/20)", () => {
    const composite = makeComposite({ scoringWeights: { wsjf: 80, trackSpecific: 20 } });
    const t = {
      value: 4, urgency: 4, risk: 4, feasibility: 4, deps: 4, effort: 4,
      tracks: ["lowcode"],
      ice_impact: 4, ice_confidence: 4, ice_ease: 4,
    };
    const wsjf = (4 + 4 + 4) * 4 * 4 * 4; // 12 * 64 = 768
    const ice = 4 * 4 * 4; // 64
    expect(composite(t)).toBe(Math.round(wsjf * 0.8 + ice * 0.2));
  });
});
