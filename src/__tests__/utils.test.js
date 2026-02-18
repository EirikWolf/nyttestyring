import { describe, test, expect } from "vitest";
import { autoHours, HRS_WEEK, fmtSize, findDupes, ts, td, getTheme, LT, DK, validTransition, STATUS_TRANSITIONS, calcLeadTime, calcCycleTime } from "../constants";

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
