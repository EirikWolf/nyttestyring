#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════
// Seed-script: Legger inn startdata i Firestore
// ══════════════════════════════════════════════════════════════
//
// Bruk:
//   1. npm install (fra prosjektets rotmappe)
//   2. Opprett .env.local med Firebase-nøkler (se .env.example)
//   3. node scripts/seed-firestore.js
//
// Scriptet oppretter dokumenter i samlingene:
//   tasks, team, goals, config (singleton), sprints
//
// Eksisterende dokumenter med samme ID overskrives.
// ══════════════════════════════════════════════════════════════

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Last miljøvariabler fra .env.local ──────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");

try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
  console.log("Lastet .env.local");
} catch {
  console.error("Fant ikke .env.local – opprett den fra .env.example");
  process.exit(1);
}

// ── Firebase-initialisering ─────────────────────────────────
const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);

console.log(`Firebase-prosjekt: ${process.env.VITE_FIREBASE_PROJECT_ID}`);

// ══════════════════════════════════════════════════════════════
// STARTDATA – Identisk med INIT_* i App.jsx
// ══════════════════════════════════════════════════════════════

const GOALS = [
  { id: "G-01", title: "Øke digitaliseringsgrad til 80%", type: "Hovedmål", parent: null },
  { id: "G-02", title: "Redusere manuelt arbeid med 30%", type: "Delmål", parent: "G-01" },
  { id: "G-03", title: "Forbedre pasientsikkerhet gjennom IKT", type: "Hovedmål", parent: null },
  { id: "G-04", title: "Styrke informasjonssikkerhet", type: "Delmål", parent: "G-03" },
  { id: "G-05", title: "Redusere ventetider gjennom digitalisering", type: "Delmål", parent: "G-03" },
  { id: "G-06", title: "Effektivisere administrative prosesser", type: "Hovedmål", parent: null },
  { id: "G-07", title: "Øke medarbeidertilfredshet med IKT-verktøy", type: "Delmål", parent: "G-06" },
];

const TEAM = [
  { id: "m1", name: "Lars Kristiansen", role: "Backend", availability: 100, skills: ["Backend", "DevOps"], track: "sysdev" },
  { id: "m2", name: "Marte Solberg", role: "Frontend", availability: 80, skills: ["Frontend", "UX"], track: "sysdev" },
  { id: "m3", name: "Erik Nordli", role: "Fullstack", availability: 60, skills: ["Fullstack", "Backend"], track: "sysdev" },
  { id: "m4", name: "Sofie Aasen", role: "UX/UI", availability: 50, skills: ["UX", "Frontend"], track: "lowcode" },
  { id: "m5", name: "Jonas Ribe", role: "QA", availability: 100, skills: ["QA"], track: "sysdev" },
  { id: "m6", name: "Ida Berg", role: "RPA-utvikler", availability: 70, skills: ["RPA", "Backend"], track: "rpa" },
];

const TASKS = [
  { id: "T-001", title: "Automatisere fakturautsending", desc: "Robotisere manuell fakturaprosess i økonomiavd.", tracks: ["rpa"], value: 5, urgency: 4, risk: 3, feasibility: 4, deps: 5, effort: 4, size: 8, status: "ready", sprint: true, submitterName: "Kari Haugen", submitterDept: "Økonomiavd.", processOwner: "Økonomisjef Trond Lie", date: "2026-01-20", reviewed: true, priority: "high", goals: ["G-02", "G-06"], eqsRef: "EQS-2024-0142 Fakturahåndtering", personalData: "no", parentId: null, rpa_volume: 5, rpa_rule: 5, rpa_digital: 4, rpa_stability: 4, rpa_roi: 5, actualHours: 0, comments: [{ author: "Utviklingsforum", text: "Høy ROI – prioriteres i S-27.", time: "2026-01-22 09:15" }], history: [{ who: "System", what: "Opprettet", time: "2026-01-20 08:00" }, { who: "Utviklingsforum", what: "Status → Klar for sprint", time: "2026-01-22 09:15" }], attachments: [], archived: false },
  { id: "T-001-A", title: "Kartlegge fakturaprosess (AS-IS)", desc: "Dokumentere nåværende manuell flyt.", tracks: ["rpa"], value: 5, urgency: 4, risk: 2, feasibility: 5, deps: 5, effort: 5, size: 3, status: "done", sprint: true, submitterName: "Kari Haugen", submitterDept: "Økonomiavd.", processOwner: "Økonomisjef Trond Lie", date: "2026-01-21", reviewed: true, priority: "high", goals: ["G-02"], parentId: "T-001", personalData: "no", actualHours: 0, comments: [], history: [], attachments: [], archived: false },
  { id: "T-001-B", title: "Utvikle RPA-bot for faktura", desc: "Bygge UiPath-bot for automatisk fakturabehandling.", tracks: ["rpa"], value: 5, urgency: 4, risk: 3, feasibility: 4, deps: 4, effort: 3, size: 5, status: "in-progress", sprint: true, submitterName: "Kari Haugen", submitterDept: "Økonomiavd.", processOwner: "Økonomisjef Trond Lie", date: "2026-01-22", reviewed: true, priority: "high", goals: ["G-02"], parentId: "T-001", personalData: "no", rpa_volume: 5, rpa_rule: 5, rpa_digital: 4, rpa_stability: 4, rpa_roi: 5, actualHours: 0, comments: [], history: [], attachments: [], archived: false },
  { id: "T-001-C", title: "Test og pilot faktura-bot", desc: "UAT med økonomiavdelingen, pilotperiode 2 uker.", tracks: ["rpa"], value: 5, urgency: 3, risk: 3, feasibility: 4, deps: 4, effort: 4, size: 3, status: "ready", sprint: false, submitterName: "Kari Haugen", submitterDept: "Økonomiavd.", processOwner: "Økonomisjef Trond Lie", date: "2026-01-22", reviewed: true, priority: "high", goals: ["G-02"], parentId: "T-001", personalData: "no", actualHours: 0, comments: [{ author: "Leveranseteam", text: "Planlagt Sprint 28.", time: "2026-02-05 10:00" }], history: [], attachments: [], archived: false },
  { id: "T-002", title: "Bygge kundedashboard", desc: "Samlet oversikt over henvendelser.", tracks: ["sysdev"], value: 5, urgency: 2, risk: 2, feasibility: 5, deps: 4, effort: 2, size: 13, status: "ready", sprint: true, submitterName: "Per Olsen", submitterDept: "Kundeservice", processOwner: "Leder kundeservice", date: "2026-01-22", reviewed: true, priority: "high", goals: ["G-01"], parentId: null, rice_reach: 4, rice_impact: 5, rice_confidence: 4, rice_effort: 2, actualHours: 0, comments: [], history: [], attachments: [], archived: false },
  { id: "T-002-A", title: "Design UI/UX for dashboard", desc: "Wireframes og prototyp i Figma.", tracks: ["sysdev"], value: 5, urgency: 2, risk: 1, feasibility: 5, deps: 5, effort: 4, size: 5, status: "ready", sprint: true, submitterName: "Per Olsen", submitterDept: "Kundeservice", processOwner: "Leder kundeservice", date: "2026-01-23", reviewed: true, priority: "high", goals: ["G-01"], parentId: "T-002", actualHours: 0, comments: [], history: [], attachments: [], archived: false },
  { id: "T-002-B", title: "Implementere backend API for dashboard", desc: "REST-endepunkter for henvendelsesdata.", tracks: ["sysdev"], value: 5, urgency: 2, risk: 2, feasibility: 4, deps: 3, effort: 2, size: 8, status: "ready", sprint: false, submitterName: "Per Olsen", submitterDept: "Kundeservice", processOwner: "Leder kundeservice", date: "2026-01-23", reviewed: true, priority: "high", goals: ["G-01"], parentId: "T-002", rice_reach: 4, rice_impact: 5, rice_confidence: 4, rice_effort: 2, actualHours: 0, comments: [{ author: "Leveranseteam", text: "Sprint 28 – avhenger av T-002-A.", time: "2026-02-03 11:00" }], history: [], attachments: [], archived: false },
  { id: "T-003", title: "Oppgradere CRM-integrasjon", desc: "Ny REST-API versjon.", tracks: ["integration"], value: 4, urgency: 3, risk: 2, feasibility: 3, deps: 3, effort: 3, size: 8, status: "in-progress", sprint: true, submitterName: "Erik Holm", submitterDept: "IT-drift", processOwner: "CRM-forvalter", date: "2026-01-18", parentId: null, reviewed: true, priority: "medium", goals: ["G-01"], cod_business: 4, cod_time: 3, cod_opportunity: 2, cod_downstream: 4, actualHours: 0, comments: [], history: [], attachments: [], archived: false },
  { id: "T-004", title: "Migrere legacy-API", desc: "Flytte SOAP til REST – blokkerer flere initiativ.", tracks: ["integration", "sysdev"], value: 3, urgency: 5, risk: 4, feasibility: 2, deps: 2, effort: 1, size: 21, status: "blocked", sprint: false, submitterName: "Lise Berg", submitterDept: "Arkitektur", processOwner: "Sjefsarkitekt", date: "2026-01-15", parentId: null, reviewed: true, priority: "high", goals: ["G-01", "G-04"], cod_business: 5, cod_time: 5, cod_opportunity: 3, cod_downstream: 5, rice_reach: 3, rice_impact: 3, rice_confidence: 3, rice_effort: 2, actualHours: 0, comments: [{ author: "Utviklingsforum", text: "Blokkert av leverandør – følges opp.", time: "2026-02-01 14:00" }], history: [], attachments: [], archived: false },
  { id: "T-005", title: "SSO-pålogging alle systemer", desc: "Azure AD SSO for interne systemer.", tracks: ["sysdev"], value: 4, urgency: 3, risk: 3, feasibility: 4, deps: 4, effort: 3, size: 5, status: "ready", sprint: true, submitterName: "Jonas Ribe", submitterDept: "Sikkerhet", processOwner: "CISO", date: "2026-01-25", parentId: null, reviewed: true, priority: "medium", goals: ["G-04"], eqsRef: "EQS-2023-0088 Tilgangsstyring", personalData: "yes", rice_reach: 5, rice_impact: 4, rice_confidence: 5, rice_effort: 3, actualHours: 0, comments: [], history: [], attachments: [], archived: false },
  { id: "T-006", title: "Redesigne onboarding-flyt", desc: "Power Apps onboarding for nye ansatte.", tracks: ["lowcode"], value: 5, urgency: 2, risk: 1, feasibility: 5, deps: 5, effort: 4, size: 8, status: "assessed", sprint: false, submitterName: "Sofie Aasen", submitterDept: "HR", processOwner: "HR-leder", date: "2026-02-01", parentId: null, reviewed: true, priority: "medium", goals: ["G-07"], ice_impact: 5, ice_confidence: 4, ice_ease: 4, actualHours: 0, comments: [], history: [], attachments: [], archived: false },
  { id: "T-007", title: "Lisenshåndteringsverktøy", desc: "Erstatte Excel med hyllevare-løsning.", tracks: ["cots"], value: 4, urgency: 3, risk: 2, feasibility: 5, deps: 5, effort: 4, size: 3, status: "assessed", sprint: false, submitterName: "Ida Berg", submitterDept: "Innkjøp", processOwner: "IT innkjøpsansvarlig", date: "2026-02-03", parentId: null, reviewed: true, priority: "medium", goals: ["G-06"], cots_fit: 4, cots_tco: 4, cots_vendor: 5, cots_integration: 3, cots_security: 4, actualHours: 0, comments: [], history: [], attachments: [], archived: false },
  { id: "T-008", title: "Power App avviksmeldinger", desc: "Erstatte papirskjema for avviksrapportering.", tracks: [], value: 4, urgency: 3, risk: 2, feasibility: 5, deps: 5, effort: 5, size: 0, status: "submitted", sprint: false, submitterName: "Ona Nilsen", submitterDept: "Kvalitet", processOwner: "Kvalitetssjef", date: "2026-02-07", parentId: null, reviewed: false, priority: "medium", goals: ["G-06"], actualHours: 0, comments: [], history: [], attachments: [], archived: false },
  { id: "T-009", title: "Bedre venteromsinfo", desc: "Digital informasjonstavle for pasienter.", tracks: [], value: 3, urgency: 2, risk: 1, feasibility: 3, deps: 3, effort: 3, size: 0, status: "submitted", sprint: false, submitterName: "Anna Sæther", submitterDept: "Poliklinikk", processOwner: "Avd.leder poliklinikk", date: "2026-02-10", parentId: null, reviewed: false, priority: "low", goals: ["G-05"], actualHours: 0, comments: [], history: [], attachments: [], archived: false },
  { id: "T-010", title: "E-signeringsløsning", desc: "Digital signering for kontrakter og samtykker.", tracks: [], value: 5, urgency: 4, risk: 3, feasibility: 4, deps: 4, effort: 4, size: 0, status: "submitted", sprint: false, submitterName: "Toril Strand", submitterDept: "Jus", processOwner: "Juridisk rådgiver", date: "2026-02-12", parentId: null, reviewed: false, priority: "high", goals: ["G-06"], actualHours: 0, comments: [], history: [], attachments: [], archived: false },
];

const CONFIG = {
  sprintName: "Sprint 27",
  sprintStart: "2026-02-03",
  sprintEnd: "2026-02-14",
  sprintWeeks: 2,
  notifyEmails: ["utviklingsforum@hemit.no", "leder@hemit.no"],
  emailNotifications: true,
  emailOnStatusChange: true,
  emailOnReview: true,
  notifyProcessOwner: true,
  scoringWeights: { wsjf: 60, trackSpecific: 40 },
  dpiaLink: "https://eqs.hemit.no/doc/DPIA-mal-2024",
  dpiaEqsRef: "EQS-2024-0200 DPIA-prosedyre",
  auth: {
    enabled: false,
    provider: "azure-ad",
    tenantId: "",
    clientId: "",
    allowedDomains: ["hemit.no", "helse-midt.no", "helseplattformen.no"],
    requireMfa: false,
    sessionTimeout: 480,
    roleMappings: [
      { id: "rm1", groupId: "", groupName: "IT Utviklingsforum", role: "forum" },
      { id: "rm2", groupId: "", groupName: "Leveranseteam", role: "team" },
      { id: "rm3", groupId: "", groupName: "IT Administrasjon", role: "admin" },
    ],
    defaultRole: "employee",
    autoProvision: true,
  },
  azureDevOps: {
    enabled: false,
    orgUrl: "",
    pat: "",
    defaultProject: "",
    syncWorkItems: true,
    syncOnStatusChange: true,
    fieldMapping: { title: "System.Title", description: "System.Description", priority: "Microsoft.VSTS.Common.Priority", status: "System.State" },
    workItemType: "User Story",
    areaPath: "",
    iterationPath: "",
    statusMapping: [
      { id: "sm1", appStatus: "ready", devOpsState: "New" },
      { id: "sm2", appStatus: "in-progress", devOpsState: "Active" },
      { id: "sm3", appStatus: "done", devOpsState: "Closed" },
    ],
  },
  serviceNow: {
    enabled: false,
    instanceUrl: "",
    authMethod: "basic",
    username: "",
    password: "",
    clientId: "",
    clientSecret: "",
    syncIncidents: true,
    syncChangeRequests: false,
    syncOnStatusChange: true,
    table: "incident",
    assignmentGroup: "",
    category: "Software",
    fieldMapping: { shortDescription: "title", description: "description", priority: "priority", state: "status" },
    statusMapping: [
      { id: "sn1", appStatus: "submitted", snowState: "New" },
      { id: "sn2", appStatus: "in-progress", snowState: "In Progress" },
      { id: "sn3", appStatus: "done", snowState: "Resolved" },
    ],
  },
};

const SPRINTS = [
  { id: "S-21", s: "S-21", p: 34, d: 29 },
  { id: "S-22", s: "S-22", p: 38, d: 35 },
  { id: "S-23", s: "S-23", p: 40, d: 38 },
  { id: "S-24", s: "S-24", p: 36, d: 36 },
  { id: "S-25", s: "S-25", p: 42, d: 39 },
  { id: "S-26", s: "S-26", p: 38, d: 37 },
];

// ══════════════════════════════════════════════════════════════
// SEED-LOGIKK
// ══════════════════════════════════════════════════════════════

async function seed() {
  console.log("\n--- Starter seeding ---\n");

  // ── Tasks (batches av maks 500) ──
  const taskBatch = writeBatch(db);
  for (const task of TASKS) {
    taskBatch.set(doc(db, "tasks", task.id), {
      ...task,
      _created: serverTimestamp(),
      _updated: serverTimestamp(),
    });
  }
  await taskBatch.commit();
  console.log(`  tasks:   ${TASKS.length} dokumenter opprettet`);

  // ── Team ──
  const teamBatch = writeBatch(db);
  for (const member of TEAM) {
    teamBatch.set(doc(db, "team", member.id), {
      ...member,
      _updated: serverTimestamp(),
    });
  }
  await teamBatch.commit();
  console.log(`  team:    ${TEAM.length} dokumenter opprettet`);

  // ── Goals ──
  const goalBatch = writeBatch(db);
  for (const goal of GOALS) {
    goalBatch.set(doc(db, "goals", goal.id), {
      ...goal,
      _updated: serverTimestamp(),
    });
  }
  await goalBatch.commit();
  console.log(`  goals:   ${GOALS.length} dokumenter opprettet`);

  // ── Config (singleton) ──
  await setDoc(doc(db, "config", "app"), {
    ...CONFIG,
    _updated: serverTimestamp(),
  });
  console.log(`  config:  1 dokument opprettet (config/app)`);

  // ── Sprints ──
  const sprintBatch = writeBatch(db);
  for (const sprint of SPRINTS) {
    sprintBatch.set(doc(db, "sprints", sprint.id), {
      ...sprint,
      _updated: serverTimestamp(),
    });
  }
  await sprintBatch.commit();
  console.log(`  sprints: ${SPRINTS.length} dokumenter opprettet`);

  console.log("\n--- Seeding fullført! ---\n");
  console.log("Totalt:", TASKS.length + TEAM.length + GOALS.length + 1 + SPRINTS.length, "dokumenter");
  console.log("Samlingene tasks, team, goals, config og sprints er nå fylt med startdata.\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding feilet:", err);
  process.exit(1);
});
