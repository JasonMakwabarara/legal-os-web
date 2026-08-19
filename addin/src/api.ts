import { createTRPCClient, httpLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../server/routers";

/**
 * tRPC client for the task pane.
 *
 * Auth is Bearer-token based: Word on the web hosts the pane in an iframe
 * where our session cookie is third-party (blocked by ITP/partitioning), so
 * cookies are unreliable. auth.tokenLogin returns a JWT we attach on every
 * request; the server accepts it via `Authorization: Bearer`.
 *
 * A plain (non-batched) httpLink is used because analyzeDocument is a single
 * long-running call.
 */

const TOKEN_BASE_KEY = "legalos:addin:token";

function storageKey(): string {
  // Office guidance: prefix web-storage keys with Office.context.partitionKey
  // where defined, so storage stays isolated per document-host partition.
  try {
    const partitionKey =
      typeof Office !== "undefined" ? (Office.context as { partitionKey?: string })?.partitionKey : undefined;
    return partitionKey ? `${partitionKey}:${TOKEN_BASE_KEY}` : TOKEN_BASE_KEY;
  } catch {
    return TOKEN_BASE_KEY;
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(storageKey());
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(storageKey(), token);
    } else {
      localStorage.removeItem(storageKey());
    }
  } catch {
    // Safari-partitioned storage can throw; the user just re-logs next session.
  }
}

export const api = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      // Same origin in dev (vite proxy) and production (Express serves /addin).
      url: "/api/trpc",
      // tRPC's shipped .d.mts types drop the transformer flag from AppRouter
      // (see scripts/fix-trpc-types.mjs in the repo root).
      transformer: superjson as never,
      headers() {
        const token = getToken();
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
