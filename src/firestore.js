// ══════════════════════════════════════════════════════════════
// Firestore datalag for Nyttestyringsverktøyet
// ══════════════════════════════════════════════════════════════
//
// Kolleksjoner:
//   tasks/       – Forbedringsforslag og deloppgaver
//   team/        – Teammedlemmer og kapasitet
//   goals/       – Strategiske mål (hovedmål + delmål)
//   config/app   – Applikasjonskonfigurasjon (singleton)
//   sprints/     – Sprinthistorikk og velocity
//
// Alle skrive-operasjoner bruker serverTimestamp() for audit.
// ══════════════════════════════════════════════════════════════

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase.js";

// ── Generiske hjelpere ──────────────────────────────────────

const col = (name) => collection(db, name);

const snapToArray = (snap) =>
  snap.docs.map((d) => ({ id: d.id, ...d.data() }));

// ── Tasks ───────────────────────────────────────────────────

export const tasksCol = col("tasks");

/** Lytt til alle oppgaver i sanntid */
export function subscribeTasks(callback) {
  return onSnapshot(
    query(tasksCol, orderBy("date", "desc")),
    (snap) => callback(snapToArray(snap)),
    (err) => console.error("Tasks-lytter feilet:", err)
  );
}

/** Hent alle oppgaver (engangs) */
export async function fetchTasks() {
  const snap = await getDocs(query(tasksCol, orderBy("date", "desc")));
  return snapToArray(snap);
}

/** Opprett ny oppgave */
export async function createTask(task) {
  const ref = doc(tasksCol, task.id);
  await setDoc(ref, { ...task, _created: serverTimestamp(), _updated: serverTimestamp() });
  return task.id;
}

/** Oppdater felt på oppgave */
export async function updateTask(id, changes) {
  const ref = doc(db, "tasks", id);
  await updateDoc(ref, { ...changes, _updated: serverTimestamp() });
}

/** Slett oppgave */
export async function deleteTask(id) {
  await deleteDoc(doc(db, "tasks", id));
}

/** Batch-oppdatering av flere oppgaver */
export async function batchUpdateTasks(updates) {
  const batch = writeBatch(db);
  updates.forEach(({ id, changes }) => {
    batch.update(doc(db, "tasks", id), { ...changes, _updated: serverTimestamp() });
  });
  await batch.commit();
}

/** Hent deloppgaver for en parent */
export async function fetchSubtasks(parentId) {
  const snap = await getDocs(
    query(tasksCol, where("parentId", "==", parentId))
  );
  return snapToArray(snap);
}

// ── Team ────────────────────────────────────────────────────

export const teamCol = col("team");

export function subscribeTeam(callback) {
  return onSnapshot(teamCol, (snap) => callback(snapToArray(snap)));
}

export async function upsertMember(member) {
  await setDoc(doc(teamCol, member.id), { ...member, _updated: serverTimestamp() });
}

export async function removeMember(id) {
  await deleteDoc(doc(db, "team", id));
}

// ── Goals ───────────────────────────────────────────────────

export const goalsCol = col("goals");

export function subscribeGoals(callback) {
  return onSnapshot(goalsCol, (snap) => callback(snapToArray(snap)));
}

export async function upsertGoal(goal) {
  await setDoc(doc(goalsCol, goal.id), { ...goal, _updated: serverTimestamp() });
}

export async function removeGoal(id) {
  await deleteDoc(doc(db, "goals", id));
}

// ── Config (singleton) ──────────────────────────────────────

const configRef = doc(db, "config", "app");

export async function fetchConfig() {
  const snap = await getDoc(configRef);
  return snap.exists() ? snap.data() : null;
}

export async function saveConfig(config) {
  await setDoc(configRef, { ...config, _updated: serverTimestamp() });
}

export function subscribeConfig(callback) {
  return onSnapshot(configRef, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

// ── Sprints (historikk) ─────────────────────────────────────

export const sprintsCol = col("sprints");

export async function saveSprint(sprint) {
  await setDoc(doc(sprintsCol, sprint.id || sprint.s), {
    ...sprint,
    _updated: serverTimestamp(),
  });
}

export async function fetchSprints() {
  const snap = await getDocs(query(sprintsCol, orderBy("_updated", "desc")));
  return snapToArray(snap);
}
