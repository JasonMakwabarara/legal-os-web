export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Base URL of the live app. On the Netlify marketing/demo build, set
 * VITE_APP_URL to the Railway deployment so "Sign In" / "Get Started"
 * land on the production app instead of the local demo login.
 */
const appBase = () => {
  const base = import.meta.env.VITE_APP_URL as string | undefined;
  return base ? String(base).replace(/\/$/, "") : "";
};

export const getLoginUrl = () => `${appBase()}/login`;
export const getRegisterUrl = () => `${appBase()}/login?tab=register`;
