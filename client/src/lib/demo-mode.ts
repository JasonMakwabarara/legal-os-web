export const DEMO_EMAIL = "demo@legalos.demo";
export const DEMO_PASSWORD = "Demo@2026!";
export const DEMO_STORAGE_KEY = "legal-os-demo-v2";
export const DEMO_SESSION_KEY = "legal-os-demo-session";

export function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === "true";
}
