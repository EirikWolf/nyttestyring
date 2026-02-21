import { describe, test, expect } from "vitest";
import { autoHours, HRS_WEEK, fmtSize, findDupes, ts, td, getTheme, LT, DK, validTransition, STATUS_TRANSITIONS, calcLeadTime, calcCycleTime, calcRealizationPct, BENEFIT_UNITS, BENEFIT_CATEGORIES, SP, fmtDate, scoreLabel, STATUSES, BENEFIT_TYPES, BENEFIT_CLASSIFICATIONS, PIR_LESSON_CATEGORIES, calcAggregatePayback, calcGoalBenefitRealization, buildPirReport, calcVelocityTrend, calcCycleTimeTrend, calcThroughputByTrack, buildCfdData, calcPredictiveCompletion, calcBenefitByTrack, calcBenefitByGoal, calcBenefitGaps, EXPORT_COLUMNS, EXPORT_TEMPLATES, DASHBOARD_WIDGETS, addGoalKpiSnapshot, calcResourceUtilization, isImageAttachment, getAttachIcon } from "../constants";

// ── autoHours ─────────────────────────────────────────
// Formel: round(avail/100 * HRS_WEEK * weeks * 10) / 10
describe("autoHours", () => {
  test("100% tilgjengelighet, 2 uker = 75t", () => {
    expect(autoHours(100, 2)).toBe(75);
  });

  test("50% tilgjengelighet, 2 uker = 37.5t", () => {
    expect(autoHours(50, 2)).toBe(37.5);
  });

  test("0% tilgjengelighet gir 0", () => {
    expect(autoHours(0, 2)).toBe(0);
  });

  test("default weeks=2", () => {
    expect(autoHours(100)).toBe(75);
  });

  test("4 uker ved 100% = 150t", () => {
    expect(autoHours(100, 4)).toBe(150);
  });

  test("avrunder korrekt til 1 desimal", () => {
    // 33% * 37.5 * 2 = 24.75
    expect(autoHours(33, 2)).toBe(24.8);
  });

  test("HRS_WEEK er 37.5", () => {
    expect(HRS_WEEK).toBe(37.5);
  });
});

// ── fmtSize ───────────────────────────────────────────
describe("fmtSize", () => {
  test("bytes (under 1 KB)", () => {
    expect(fmtSize(500)).toBe("500 B");
  });

  test("0 bytes", () => {
    expect(fmtSize(0)).toBe("0 B");
  });

  test("noyaktig 1 KB-grense", () => {
    expect(fmtSize(1023)).toBe("1023 B");
    expect(fmtSize(1024)).toBe("1.0 KB");
  });

  test("kilobytes", () => {
    expect(fmtSize(2048)).toBe("2.0 KB");
  });

  test("noyaktig 1 MB-grense", () => {
    expect(fmtSize(1048575)).toBe("1024.0 KB");
    expect(fmtSize(1048576)).toBe("1.0 MB");
  });

  test("megabytes", () => {
    expect(fmtSize(5242880)).toBe("5.0 MB");
  });

  test("desimaler i KB", () => {
    expect(fmtSize(1536)).toBe("1.5 KB");
  });
});

// ── findDupes ─────────────────────────────────────────
describe("findDupes", () => {
  const tasks = [
    { id: "T-001", title: "Automatisere innmelding av saker" },
    { id: "T-002", title: "Oppgradere nettverksinfrastruktur" },
    { id: "T-003", title: "Innmelding av nye henvendelser" },
    { id: "T-004", title: "Rapport for nettverksanalyse" },
  ];

  test("finner duplikater basert paa overlappende ord (substring-match)", () => {
    // findDupes sjekker om soekeordene (>3 tegn) finnes som substring i task.title
    // "innmelding saker automatisere" → ord: ["innmelding","saker","automatisere"]
    // T-001 inneholder "innmelding" og "saker" → match (2 av 3)
    const result = findDupes("innmelding saker automatisere", tasks);
    expect(result.length).toBeGreaterThan(0);
    const ids = result.map(t => t.id);
    expect(ids).toContain("T-001");
  });

  test("returnerer tom array for kort tittel (under 5 tegn)", () => {
    expect(findDupes("ABC", tasks)).toEqual([]);
    expect(findDupes("Test", tasks)).toEqual([]);
  });

  test("returnerer tom array for tom/null tittel", () => {
    expect(findDupes("", tasks)).toEqual([]);
    expect(findDupes(null, tasks)).toEqual([]);
  });

  test("ignorerer korte ord (3 tegn eller mindre)", () => {
    // Alle ord er 3 tegn eller kortere → ingen matchende ord
    expect(findDupes("En ny for oss", tasks)).toEqual([]);
  });

  test("maks 5 resultater (A6: økt fra 3)", () => {
    const manyTasks = Array.from({ length: 10 }, (_, i) => ({
      id: `T-${i}`,
      title: "nettverk infrastruktur system integrasjon",
    }));
    const result = findDupes("nettverk infrastruktur system integrasjon oppgradering", manyTasks);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  test("case-insensitive matching", () => {
    const result = findDupes("AUTOMATISERE INNMELDING av noe", tasks);
    expect(result.length).toBeGreaterThan(0);
  });
});

// ── ts / td ───────────────────────────────────────────
describe("ts (timestamp)", () => {
  test("returnerer streng i format YYYY-MM-DD HH:MM", () => {
    const result = ts();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  test("er 16 tegn lang", () => {
    expect(ts().length).toBe(16);
  });
});

describe("td (date)", () => {
  test("returnerer streng i format YYYY-MM-DD", () => {
    const result = td();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("er 10 tegn lang", () => {
    expect(td().length).toBe(10);
  });
});

// ── getTheme ──────────────────────────────────────────
describe("getTheme", () => {
  test("returnerer LT for false/undefined", () => {
    expect(getTheme(false)).toBe(LT);
    expect(getTheme(undefined)).toBe(LT);
  });

  test("returnerer DK for true", () => {
    expect(getTheme(true)).toBe(DK);
  });

  test("LT har lyse farger", () => {
    expect(LT.bg).toBe("#F5F7FA");
    expect(LT.surface).toBe("#FFFFFF");
  });

  test("DK har morke farger", () => {
    expect(DK.bg).toBe("#0F1A2E");
    expect(DK.surface).toBe("#162038");
  });
});

// ── validTransition (A5) ──────────────────────────────
describe("validTransition", () => {
  test("tillater alle overganger", () => {
    expect(validTransition("submitted", "done")).toBe(true);
    expect(validTransition("done", "submitted")).toBe(true);
    expect(validTransition("archived", "submitted")).toBe(true);
    expect(validTransition("submitted", "in-progress")).toBe(true);
    expect(validTransition("in-progress", "done")).toBe(true);
    expect(validTransition("done", "archived")).toBe(true);
  });
});

// ── calcLeadTime / calcCycleTime (D4) ─────────────────
describe("calcLeadTime", () => {
  test("beregner dager fra opprettet til done", () => {
    const task = {
      history: [
        { who: "System", what: "Opprettet", time: "2026-01-01 08:00" },
        { who: "Forum", what: "status: submitted→done", time: "2026-01-11 08:00" },
      ],
    };
    expect(calcLeadTime(task)).toBe(10);
  });

  test("returnerer null uten done-historikk", () => {
    const task = {
      history: [{ who: "System", what: "Opprettet", time: "2026-01-01 08:00" }],
    };
    expect(calcLeadTime(task)).toBeNull();
  });

  test("returnerer null uten historikk", () => {
    expect(calcLeadTime({})).toBeNull();
    expect(calcLeadTime({ history: [] })).toBeNull();
  });
});

describe("calcCycleTime", () => {
  test("beregner dager fra in-progress til done", () => {
    const task = {
      history: [
        { who: "Team", what: "status: ready→in-progress", time: "2026-01-05 08:00" },
        { who: "Team", what: "status: in-progress→done", time: "2026-01-12 08:00" },
      ],
    };
    expect(calcCycleTime(task)).toBe(7);
  });

  test("returnerer null uten in-progress-historikk", () => {
    const task = {
      history: [{ who: "Team", what: "status: ready→done", time: "2026-01-12 08:00" }],
    };
    expect(calcCycleTime(task)).toBeNull();
  });
});

// ── calcRealizationPct (A.11) ──────────────────────────
describe("calcRealizationPct", () => {
  test("beregner 100% når faktisk = mål", () => {
    expect(calcRealizationPct("12", "5", "5")).toBe(100);
  });

  test("beregner 0% når faktisk = baseline", () => {
    expect(calcRealizationPct("12", "5", "12")).toBe(0);
  });

  test("beregner 50% halvveis", () => {
    expect(calcRealizationPct("10", "0", "5")).toBe(50);
  });

  test("beregner over 100% ved overoppnåelse", () => {
    expect(calcRealizationPct("12", "6", "3")).toBe(150);
  });

  test("returnerer null ved manglende verdier", () => {
    expect(calcRealizationPct("", "5", "3")).toBeNull();
    expect(calcRealizationPct("12", "", "3")).toBeNull();
    expect(calcRealizationPct("12", "5", "")).toBeNull();
  });

  test("returnerer null når baseline = mål (divisjon med null)", () => {
    expect(calcRealizationPct("5", "5", "5")).toBeNull();
  });

  test("håndterer ikke-numeriske verdier", () => {
    expect(calcRealizationPct("abc", "5", "3")).toBeNull();
    expect(calcRealizationPct("12", "xyz", "3")).toBeNull();
  });
});

// ── BENEFIT_UNITS og BENEFIT_CATEGORIES (A.11) ─────────
describe("BENEFIT_UNITS", () => {
  test("inneholder minst 5 enheter", () => {
    expect(BENEFIT_UNITS.length).toBeGreaterThanOrEqual(5);
  });

  test("hver enhet har id og label", () => {
    BENEFIT_UNITS.forEach(u => {
      expect(u.id).toBeTruthy();
      expect(u.label).toBeTruthy();
    });
  });
});

describe("BENEFIT_CATEGORIES", () => {
  test("inneholder minst 5 kategorier", () => {
    expect(BENEFIT_CATEGORIES.length).toBeGreaterThanOrEqual(5);
  });

  test("hver kategori har id og label", () => {
    BENEFIT_CATEGORIES.forEach(c => {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
    });
  });

  test("inneholder standard nyttekategorier", () => {
    const ids = BENEFIT_CATEGORIES.map(c => c.id);
    expect(ids).toContain("cost");
    expect(ids).toContain("time");
    expect(ids).toContain("quality");
  });
});

// ── SP – Spacing system (B.13) ──────────────────────
describe("SP (spacing system)", () => {
  test("har alle 6 spacing-verdier", () => {
    expect(SP).toEqual({ xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 });
  });

  test("verdiene øker monotont", () => {
    const vals = [SP.xs, SP.sm, SP.md, SP.lg, SP.xl, SP.xxl];
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i]).toBeGreaterThan(vals[i - 1]);
    }
  });

  test("alle verdier er positive heltall", () => {
    Object.values(SP).forEach(v => {
      expect(v).toBeGreaterThan(0);
      expect(Number.isInteger(v)).toBe(true);
    });
  });
});

// ── fmtDate – Norske datoformater (B.8) ─────────────
describe("fmtDate", () => {
  // Helper: format local Date to "YYYY-MM-DD HH:MM" (same format fmtDate expects)
  const toLocal = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  test("returnerer 'Nå' for tidspunkt < 60 sekunder siden", () => {
    const recent = toLocal(new Date());
    expect(fmtDate(recent)).toBe("Nå");
  });

  test("returnerer 'X min siden' for tidspunkt innenfor en time", () => {
    const d = new Date(Date.now() - 15 * 60 * 1000);
    expect(fmtDate(toLocal(d))).toMatch(/^\d+ min siden$/);
  });

  test("returnerer 'X t siden' for tidspunkt innenfor et døgn", () => {
    const d = new Date(Date.now() - 3 * 3600 * 1000);
    expect(fmtDate(toLocal(d))).toMatch(/^\d+ t siden$/);
  });

  test("returnerer 'I går' for tidspunkt 1-2 dager siden", () => {
    const d = new Date(Date.now() - 30 * 3600 * 1000);
    expect(fmtDate(toLocal(d))).toBe("I går");
  });

  test("returnerer 'X d siden' for tidspunkt innenfor en uke", () => {
    const d = new Date(Date.now() - 4 * 86400 * 1000);
    expect(fmtDate(toLocal(d))).toMatch(/^\d+ d siden$/);
  });

  test("returnerer absolutt dato for tidspunkt eldre enn en uke", () => {
    const result = fmtDate("2024-01-15 10:00");
    // Bør inneholde "jan" i norsk format
    expect(result).toMatch(/\d+.*jan.*\d{4}/i);
  });

  test("returnerer absolutt dato ved style='absolute'", () => {
    const result = fmtDate("2025-06-15 10:00", "absolute");
    expect(result).toMatch(/\d+.*jun.*\d{4}/i);
  });

  test("returnerer tom streng for falsy input", () => {
    expect(fmtDate("")).toBe("");
    expect(fmtDate(null)).toBe("");
    expect(fmtDate(undefined)).toBe("");
  });

  test("returnerer original streng for ugyldig dato", () => {
    expect(fmtDate("ikke-en-dato")).toBe("ikke-en-dato");
  });

  test("håndterer ISO-format med T-separator", () => {
    const d = new Date(Date.now() - 5 * 60 * 1000);
    // Use local time format with T separator (fmtDate replaces space→T internally)
    const str = toLocal(d).replace(" ", "T");
    expect(fmtDate(str)).toMatch(/\d+ min siden/);
  });
});

// ── scoreLabel (B.11) ──────────────────────────────
// Ny skala: 0–10 (vektet scoring)
describe("scoreLabel", () => {
  test("returnerer 'Høy' for score >= 7", () => {
    expect(scoreLabel(7)).toBe("Høy");
    expect(scoreLabel(8.5)).toBe("Høy");
    expect(scoreLabel(10)).toBe("Høy");
  });

  test("returnerer 'Medium' for score 4–6.9", () => {
    expect(scoreLabel(4)).toBe("Medium");
    expect(scoreLabel(5.5)).toBe("Medium");
    expect(scoreLabel(6.9)).toBe("Medium");
  });

  test("returnerer 'Lav' for score < 4", () => {
    expect(scoreLabel(3.9)).toBe("Lav");
    expect(scoreLabel(2)).toBe("Lav");
    expect(scoreLabel(0)).toBe("Lav");
  });

  test("grenseverdier", () => {
    expect(scoreLabel(6.9)).toBe("Medium");
    expect(scoreLabel(7)).toBe("Høy");
    expect(scoreLabel(3.9)).toBe("Lav");
    expect(scoreLabel(4)).toBe("Medium");
  });
});

// ── STATUSES – ikoner (B.11) ────────────────────────
describe("STATUSES ikoner (B.11)", () => {
  test("alle statuser har ikon-felt", () => {
    STATUSES.forEach(s => {
      expect(s.icon).toBeTruthy();
    });
  });

  test("alle statuser har id, label, color, bg", () => {
    STATUSES.forEach(s => {
      expect(s.id).toBeTruthy();
      expect(s.label).toBeTruthy();
      expect(s.color).toBeTruthy();
      expect(s.bg).toBeTruthy();
    });
  });

  test("inneholder forventede statuser", () => {
    const ids = STATUSES.map(s => s.id);
    expect(ids).toContain("submitted");
    expect(ids).toContain("in-progress");
    expect(ids).toContain("done");
    expect(ids).toContain("blocked");
    expect(ids).toContain("archived");
  });
});

// ── BENEFIT_TYPES (C.1) ────────────────────────────
describe("BENEFIT_TYPES (C.1)", () => {
  test("inneholder minst 6 typer", () => {
    expect(BENEFIT_TYPES.length).toBeGreaterThanOrEqual(6);
  });
  test("hver type har id og label", () => {
    BENEFIT_TYPES.forEach(t => {
      expect(t.id).toBeTruthy();
      expect(t.label).toBeTruthy();
    });
  });
  test("inneholder forventede typer", () => {
    // BENEFIT_TYPES er nå alias for BENEFIT_CATEGORIES
    const ids = BENEFIT_TYPES.map(t => t.id);
    expect(ids).toContain("cost");
    expect(ids).toContain("time");
    expect(ids).toContain("quality");
  });
});

// ── BENEFIT_CLASSIFICATIONS (C.1) ───────────────────
describe("BENEFIT_CLASSIFICATIONS (C.1)", () => {
  test("inneholder nøyaktig 2 klassifiseringer", () => {
    expect(BENEFIT_CLASSIFICATIONS.length).toBe(2);
  });
  test("inneholder kvantitativ og kvalitativ", () => {
    const ids = BENEFIT_CLASSIFICATIONS.map(c => c.id);
    expect(ids).toContain("kvantitativ");
    expect(ids).toContain("kvalitativ");
  });
});

// ── PIR_LESSON_CATEGORIES (C.4) ────────────────────
describe("PIR_LESSON_CATEGORIES (C.4)", () => {
  test("inneholder minst 4 kategorier", () => {
    expect(PIR_LESSON_CATEGORIES.length).toBeGreaterThanOrEqual(4);
  });
  test("hver kategori har id og label", () => {
    PIR_LESSON_CATEGORIES.forEach(c => {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
    });
  });
  test("inneholder forventede kategorier", () => {
    const ids = PIR_LESSON_CATEGORIES.map(c => c.id);
    expect(ids).toContain("process");
    expect(ids).toContain("technical");
    expect(ids).toContain("organizational");
  });
});

// ── calcAggregatePayback (C.9) ─────────────────────
describe("calcAggregatePayback (C.9)", () => {
  test("beregner tilbakebetalingstid korrekt", () => {
    const tasks = [
      { estimatedCost: "100000", estimatedAnnualSaving: "50000" },
      { estimatedCost: "200000", estimatedAnnualSaving: "100000" },
    ];
    expect(calcAggregatePayback(tasks)).toBe(2);
  });
  test("returnerer null ved 0 besparelse", () => {
    const tasks = [{ estimatedCost: "100000", estimatedAnnualSaving: "0" }];
    expect(calcAggregatePayback(tasks)).toBeNull();
  });
  test("returnerer null ved 0 kostnad", () => {
    const tasks = [{ estimatedCost: "0", estimatedAnnualSaving: "50000" }];
    expect(calcAggregatePayback(tasks)).toBeNull();
  });
  test("returnerer null for tom array", () => {
    expect(calcAggregatePayback([])).toBeNull();
  });
  test("håndterer oppgaver uten kostnad/besparelse", () => {
    const tasks = [{ estimatedCost: "", estimatedAnnualSaving: "" }, { estimatedCost: "300000", estimatedAnnualSaving: "100000" }];
    expect(calcAggregatePayback(tasks)).toBe(3);
  });
  test("avrunder til 1 desimal", () => {
    const tasks = [{ estimatedCost: "100000", estimatedAnnualSaving: "30000" }];
    expect(calcAggregatePayback(tasks)).toBe(3.3);
  });
});

// ── calcGoalBenefitRealization (C.8) ────────────────
describe("calcGoalBenefitRealization (C.8)", () => {
  test("beregner gjennomsnittlig realisering", () => {
    const tasks = [
      { benefitBaseline: "10", benefitTarget: "0", benefitActual: "5" },
      { benefitBaseline: "100", benefitTarget: "0", benefitActual: "50" },
    ];
    // Task 1: (5-10)/(0-10) = 50%, Task 2: (50-100)/(0-100) = 50% → avg 50%
    expect(calcGoalBenefitRealization(tasks)).toBe(50);
  });
  test("returnerer null for oppgaver uten måldata", () => {
    const tasks = [
      { benefitBaseline: "", benefitTarget: "", benefitActual: "" },
      { benefitBaseline: "10", benefitTarget: "", benefitActual: "5" },
    ];
    expect(calcGoalBenefitRealization(tasks)).toBeNull();
  });
  test("returnerer null for tom array", () => {
    expect(calcGoalBenefitRealization([])).toBeNull();
  });
  test("ignorerer oppgaver uten komplett data", () => {
    const tasks = [
      { benefitBaseline: "10", benefitTarget: "0", benefitActual: "0" },
      { benefitBaseline: "", benefitTarget: "5", benefitActual: "3" },
    ];
    // Bare task 1 teller: (0-10)/(0-10) = 100%
    expect(calcGoalBenefitRealization(tasks)).toBe(100);
  });
});

// ── buildPirReport (C.4) ────────────────────────────
describe("buildPirReport (C.4)", () => {
  test("genererer rapport med tittel og vurderinger", () => {
    const task = {
      title: "Test-oppgave", id: "T-099",
      pirRealization: 4, pirSatisfaction: 3, pirProcess: 5, pirTechnical: 4,
      pirStakeholderScore: 3,
      expectedBenefit: "Raskere behandling",
      benefitBaseline: "10", benefitTarget: "5", benefitActual: "6",
      pirOutcome: "partial",
    };
    const report = buildPirReport(task);
    expect(report).toContain("PIR-RAPPORT: Test-oppgave");
    expect(report).toContain("T-099");
    expect(report).toContain("Nytterealisering: 4/5");
    expect(report).toContain("Raskere behandling");
  });
  test("håndterer tom oppgave uten feil", () => {
    const report = buildPirReport({});
    expect(report).toContain("PIR-RAPPORT: Ukjent");
    expect(report).toContain("Ikke målt");
  });
  test("inkluderer læringspunkter når kategorisert", () => {
    const task = {
      title: "X",
      pirLessonCategories: [{ category: "Teknisk", text: "Bedre testing nødvendig" }],
    };
    const report = buildPirReport(task);
    expect(report).toContain("Bedre testing nødvendig");
  });
  test("inkluderer oppfølgingstiltak", () => {
    const task = {
      title: "Y",
      pirActionItems: [{ action: "Oppdater rutine", responsible: "Kari", deadline: "2026-03-01", done: false }],
    };
    const report = buildPirReport(task);
    expect(report).toContain("Oppdater rutine");
    expect(report).toContain("Kari");
  });
});

// ── D.1: calcVelocityTrend ──
describe("calcVelocityTrend", () => {
  const sprints = [
    { id: "S1", name: "Sprint 1", status: "completed", planned: 30, delivered: 25 },
    { id: "S2", name: "Sprint 2", status: "completed", planned: 35, delivered: 30 },
    { id: "S3", name: "Sprint 3", status: "completed", planned: 38, delivered: 35 },
    { id: "S4", name: "Sprint 4", status: "completed", planned: 40, delivered: 38 },
  ];
  test("beregner gjennomsnitt og standardavvik", () => {
    const r = calcVelocityTrend(sprints);
    expect(r.avg).toBe(32);
    expect(r.stdDev).toBeGreaterThan(0);
    expect(r.data).toHaveLength(4);
  });
  test("returnerer tom for ingen fullførte sprinter", () => {
    const r = calcVelocityTrend([{ id: "S1", status: "active", delivered: 0 }]);
    expect(r.data).toHaveLength(0);
    expect(r.avg).toBe(0);
  });
  test("identifiserer stigende trend", () => {
    const r = calcVelocityTrend(sprints);
    expect(r.trend).toBe("up");
    expect(r.slope).toBeGreaterThan(0);
  });
  test("identifiserer synkende trend", () => {
    const falling = [
      { id: "S1", name: "S1", status: "completed", planned: 40, delivered: 40 },
      { id: "S2", name: "S2", status: "completed", planned: 35, delivered: 30 },
      { id: "S3", name: "S3", status: "completed", planned: 30, delivered: 20 },
    ];
    const r = calcVelocityTrend(falling);
    expect(r.trend).toBe("down");
    expect(r.slope).toBeLessThan(0);
  });
});

// ── D.1: calcCycleTimeTrend ──
describe("calcCycleTimeTrend", () => {
  test("returnerer data per sprint", () => {
    const sprints = [{ id: "S1", status: "completed" }];
    const tasks = [
      { sprintId: "S1", status: "done", history: [
        { what: 'status: "in-progress"', time: "2026-01-01 08:00" },
        { what: 'status: "done"', time: "2026-01-03 08:00" },
      ]},
    ];
    const r = calcCycleTimeTrend(tasks, sprints);
    expect(r).toHaveLength(1);
    expect(r[0].avgCycleTime).toBe(2);
  });
  test("returnerer tom for ingen sprinter", () => {
    const r = calcCycleTimeTrend([], []);
    expect(r).toHaveLength(0);
  });
});

// ── D.1: calcThroughputByTrack ──
describe("calcThroughputByTrack", () => {
  test("fordeler per løype", () => {
    const sprints = [{ id: "S1", status: "completed" }];
    const tasks = [
      { sprintId: "S1", status: "done", tracks: ["rpa"] },
      { sprintId: "S1", status: "done", tracks: ["rpa", "sysdev"] },
      { sprintId: "S1", status: "done", tracks: ["sysdev"] },
    ];
    const r = calcThroughputByTrack(tasks, sprints);
    expect(r[0].tracks.rpa).toBe(2);
    expect(r[0].tracks.sysdev).toBe(2);
    expect(r[0].total).toBe(3);
  });
  test("returnerer tom for ingen sprinter", () => {
    expect(calcThroughputByTrack([], [])).toHaveLength(0);
  });
});

// ── D.2: buildCfdData ──
describe("buildCfdData", () => {
  test("bygger dagsdata fra task-historikk", () => {
    const tasks = [{
      id: "T-001", archived: false,
      history: [
        { what: "Opprettet", time: "2026-01-20 08:00" },
        { what: 'status: "submitted"→"in-progress"', time: "2026-01-22 08:00" },
      ],
    }];
    const r = buildCfdData(tasks);
    expect(r.length).toBeGreaterThanOrEqual(1);
    expect(r[0].date).toBe("2026-01-20");
  });
  test("håndterer tom array", () => {
    expect(buildCfdData([])).toHaveLength(0);
  });
  test("kumulerer statusendringer korrekt", () => {
    const tasks = [
      { id: "T-1", archived: false, history: [{ what: "Opprettet", time: "2026-01-01 08:00" }] },
      { id: "T-2", archived: false, history: [{ what: "Opprettet", time: "2026-01-01 09:00" }] },
    ];
    const r = buildCfdData(tasks);
    expect(r[0].submitted).toBe(2);
  });
});

// ── D.3: calcPredictiveCompletion ──
describe("calcPredictiveCompletion", () => {
  const sprints = [
    { id: "S1", status: "completed", delivered: 30 },
    { id: "S2", status: "completed", delivered: 35 },
    { id: "S3", status: "completed", delivered: 32 },
  ];
  test("beregner prognose", () => {
    const r = calcPredictiveCompletion(100, sprints);
    expect(r).not.toBeNull();
    expect(r.optimistic).toBeLessThanOrEqual(r.mostLikely);
    expect(r.mostLikely).toBeLessThanOrEqual(r.pessimistic);
    expect(r.dates.optimistic).toBeTruthy();
  });
  test("returnerer null ved 0 backlog", () => {
    expect(calcPredictiveCompletion(0, sprints)).toBeNull();
  });
  test("returnerer null uten fullførte sprinter", () => {
    expect(calcPredictiveCompletion(100, [])).toBeNull();
  });
});

// ── D.4: calcBenefitByTrack ──
describe("calcBenefitByTrack", () => {
  test("grupperer nytte per løype", () => {
    const tasks = [
      { tracks: ["rpa"], estimatedCost: "100000", estimatedAnnualSaving: "200000", archived: false, parentId: null },
      { tracks: ["rpa"], estimatedCost: "50000", estimatedAnnualSaving: "80000", archived: false, parentId: null },
    ];
    const r = calcBenefitByTrack(tasks);
    const rpa = r.find(x => x.trackId === "rpa");
    expect(rpa.totalEstCost).toBe(150000);
    expect(rpa.totalEstSaving).toBe(280000);
    expect(rpa.taskCount).toBe(2);
  });
  test("håndterer tasks uten nyttedata", () => {
    const r = calcBenefitByTrack([{ tracks: ["sysdev"], archived: false, parentId: null }]);
    const sd = r.find(x => x.trackId === "sysdev");
    expect(sd.totalEstCost).toBe(0);
    expect(sd.avgRealization).toBeNull();
  });
});

// ── D.4: calcBenefitByGoal ──
describe("calcBenefitByGoal", () => {
  const goals = [
    { id: "G-01", title: "Mål 1", parent: null },
    { id: "G-02", title: "Delmål", parent: "G-01" },
  ];
  test("beregner per mål med delmål", () => {
    const tasks = [
      { goals: ["G-01"], estimatedCost: "100000", estimatedAnnualSaving: "200000", archived: false },
      { goals: ["G-02"], estimatedCost: "50000", estimatedAnnualSaving: "60000", archived: false },
    ];
    const r = calcBenefitByGoal(tasks, goals);
    expect(r).toHaveLength(1);
    expect(r[0].totalEstCost).toBe(150000);
    expect(r[0].taskCount).toBe(2);
  });
  test("håndterer tom oppgaveliste", () => {
    const r = calcBenefitByGoal([], goals);
    expect(r[0].totalEstCost).toBe(0);
    expect(r[0].taskCount).toBe(0);
  });
});

// ── D.4: calcBenefitGaps ──
describe("calcBenefitGaps", () => {
  test("sorterer etter gap synkende", () => {
    const tasks = [
      { id: "T-1", title: "A", benefitBaseline: "0", benefitTarget: "100", benefitActual: "80", archived: false },
      { id: "T-2", title: "B", benefitBaseline: "0", benefitTarget: "100", benefitActual: "30", archived: false },
    ];
    const r = calcBenefitGaps(tasks);
    expect(r).toHaveLength(2);
    expect(r[0].id).toBe("T-2"); // Størst gap
    expect(r[0].gap).toBe(70);
  });
  test("returnerer tom for tasks uten måling", () => {
    const r = calcBenefitGaps([{ id: "T-1", archived: false }]);
    expect(r).toHaveLength(0);
  });
});

// ── D.5: EXPORT_COLUMNS ──
describe("EXPORT_COLUMNS", () => {
  test("alle kolonner har get-funksjon", () => {
    EXPORT_COLUMNS.forEach(c => {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(typeof c.get).toBe("function");
    });
  });
});

// ── D.5: EXPORT_TEMPLATES ──
describe("EXPORT_TEMPLATES", () => {
  test("alle maler refererer gyldige kolonne-IDer", () => {
    const validIds = EXPORT_COLUMNS.map(c => c.id);
    EXPORT_TEMPLATES.forEach(tpl => {
      tpl.cols.forEach(colId => {
        expect(validIds).toContain(colId);
      });
    });
  });
});

// ── D.6: DASHBOARD_WIDGETS ──
describe("DASHBOARD_WIDGETS", () => {
  test("alle widgets har id, label og default", () => {
    DASHBOARD_WIDGETS.forEach(w => {
      expect(w.id).toBeTruthy();
      expect(w.label).toBeTruthy();
      expect(typeof w.default).toBe("boolean");
    });
  });
});

// ── D.8: addGoalKpiSnapshot ──
describe("addGoalKpiSnapshot", () => {
  test("legger til ny måling i kpiHistory", () => {
    const goal = { id: "G-01", kpiHistory: [{ date: "2025-10-01", value: "50" }] };
    const r = addGoalKpiSnapshot(goal, 55);
    expect(r.kpiHistory).toHaveLength(2);
    expect(r.kpiHistory[1].value).toBe("55");
  });
  test("håndterer mål uten eksisterende kpiHistory", () => {
    const goal = { id: "G-01" };
    const r = addGoalKpiSnapshot(goal, 42);
    expect(r.kpiHistory).toHaveLength(1);
    expect(r.kpiHistory[0].value).toBe("42");
  });
});

// ── D.9: calcResourceUtilization ──
describe("calcResourceUtilization", () => {
  const team = [
    { id: "m1", name: "Lars", availability: 100 },
    { id: "m2", name: "Marte", availability: 50 },
  ];
  test("beregner utnyttelsesgrad per medlem", () => {
    const tasks = [
      { sprintId: "S1", assignee: "m1", actualHours: 30, tracks: ["rpa"], archived: false },
      { sprintId: "S1", assignee: "m1", actualHours: 20, tracks: ["sysdev"], archived: false },
    ];
    const r = calcResourceUtilization(team, tasks, "S1", 2);
    expect(r[0].actualHours).toBe(50);
    expect(r[0].utilization).toBeGreaterThan(0);
    expect(r[0].hoursByTrack.rpa).toBe(30);
    expect(r[0].hoursByTrack.sysdev).toBe(20);
  });
  test("identifiserer overallokerte medlemmer", () => {
    const tasks = [
      { sprintId: "S1", assignee: "m2", actualHours: 50, tracks: ["rpa"], archived: false },
    ];
    const r = calcResourceUtilization(team, tasks, "S1", 2);
    const marte = r.find(m => m.memberId === "m2");
    expect(marte.overAllocated).toBe(true);
  });
});

// ── E.7: isImageAttachment ──
describe("isImageAttachment", () => {
  test("true for bilder, false for dokumenter", () => {
    expect(isImageAttachment({ type: "image/png" })).toBe(true);
    expect(isImageAttachment({ type: "image/jpeg" })).toBe(true);
    expect(isImageAttachment({ type: "application/pdf" })).toBe(false);
    expect(isImageAttachment(null)).toBeFalsy();
  });
});

// ── E.7: getAttachIcon ──
describe("getAttachIcon", () => {
  test("riktig ikon per filtype", () => {
    expect(getAttachIcon({ name: "foto.png", type: "image/png" })).toBe("🖼");
    expect(getAttachIcon({ name: "rapport.docx" })).toBe("📝");
    expect(getAttachIcon({ name: "data.xlsx" })).toBe("📊");
    expect(getAttachIcon({ name: "presentasjon.pptx" })).toBe("📽");
    expect(getAttachIcon({ name: "dokument.pdf" })).toBe("📕");
    expect(getAttachIcon({ name: "annen.zip" })).toBe("📄");
  });
});

// ── INIT_GOALS struktur-validering ──
import { INIT_GOALS } from "../data";

describe("INIT_GOALS structure", () => {
  test("inneholder 24 mål (5 hovedmål + 19 delmål)", () => {
    expect(INIT_GOALS).toHaveLength(24);
    const hoved = INIT_GOALS.filter(g => g.type === "Hovedmål");
    const del = INIT_GOALS.filter(g => g.type === "Delmål");
    expect(hoved).toHaveLength(5);
    expect(del).toHaveLength(19);
  });

  test("alle hovedmål har parent: null", () => {
    INIT_GOALS.filter(g => g.type === "Hovedmål").forEach(g => {
      expect(g.parent).toBeNull();
    });
  });

  test("alle delmål har gyldig parent som peker til et hovedmål", () => {
    const hovedIds = INIT_GOALS.filter(g => g.type === "Hovedmål").map(g => g.id);
    INIT_GOALS.filter(g => g.type === "Delmål").forEach(g => {
      expect(hovedIds).toContain(g.parent);
    });
  });

  test("alle mål-IDer er unike", () => {
    const ids = INIT_GOALS.map(g => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("hvert mål har pålagt feltstruktur", () => {
    INIT_GOALS.forEach(g => {
      expect(g.id).toBeTruthy();
      expect(g.title).toBeTruthy();
      expect(["Hovedmål", "Delmål"]).toContain(g.type);
      expect(g).toHaveProperty("metric");
      expect(g).toHaveProperty("baseline");
      expect(g).toHaveProperty("target");
      expect(g).toHaveProperty("current");
      expect(g).toHaveProperty("deadline");
      expect(g).toHaveProperty("kpiStatus");
      expect(g).toHaveProperty("kpiHistory");
    });
  });

  test("hierarkistruktur matcher handlingsplan", () => {
    const childrenOf = (parentId) =>
      INIT_GOALS.filter(g => g.parent === parentId).map(g => g.id);
    // Mål 1: 4 delmål (G-02..G-05)
    expect(childrenOf("G-01")).toHaveLength(4);
    // Mål 2: 4 delmål (G-07..G-10)
    expect(childrenOf("G-06")).toHaveLength(4);
    // Mål 3: 4 delmål (G-12..G-15)
    expect(childrenOf("G-11")).toHaveLength(4);
    // Mål 4: 4 delmål (G-17..G-20)
    expect(childrenOf("G-16")).toHaveLength(4);
    // Mål 5: 3 delmål (G-22..G-24)
    expect(childrenOf("G-21")).toHaveLength(3);
  });
});
