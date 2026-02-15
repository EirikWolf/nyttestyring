// ══════════════════════════════════════════════════════════════
// Autentisering - Azure AD SSO + e-post/passord fallback
// ══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  OAuthProvider,
  signOut as fbSignOut,
} from "firebase/auth";
import { auth } from "./firebase.js";

// Azure AD / Microsoft Entra ID provider
const microsoftProvider = new OAuthProvider("microsoft.com");
microsoftProvider.setCustomParameters({
  tenant: import.meta.env.VITE_AZURE_TENANT_ID || "common",
  prompt: "select_account",
});

/**
 * React hook for autentiseringstilstand.
 *
 * Returnerer:
 *   user     – Firebase User-objekt eller null
 *   loading  – true mens auth-tilstand lastes
 *   role     – "admin" | "forum" | "team" | "employee" (basert på e-post-domene/claims)
 *   signInMs – Logg inn med Microsoft/Azure AD
 *   signInEm – Logg inn med e-post/passord
 *   signOut  – Logg ut
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInMs = () => signInWithPopup(auth, microsoftProvider);

  const signInEm = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signOut = () => fbSignOut(auth);

  // Enkel rollebestemmelse basert på e-post
  // I produksjon: bruk Firebase Custom Claims via Cloud Functions
  const role = (() => {
    if (!user) return "employee";
    const email = user.email || "";
    if (email.includes("admin")) return "admin";
    if (email.includes("forum") || email.includes("utviklingsforum"))
      return "forum";
    if (email.includes("team") || email.includes("dev")) return "team";
    return "employee";
  })();

  return { user, loading, role, signInMs, signInEm, signOut };
}
