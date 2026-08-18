import { afterEach, describe, expect, it } from "vitest";
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_SESSION_KEY, DEMO_STORAGE_KEY } from "./demo-mode";
import { dispatchDemoProcedure } from "./demo-trpc-link";
import { resetDemoState, setDemoLoggedIn } from "./demo-store";

describe("dispatchDemoProcedure", () => {
  afterEach(() => {
    resetDemoState();
    setDemoLoggedIn(false);
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      localStorage.removeItem(DEMO_SESSION_KEY);
    }
  });

  it("rejects login with the wrong password", () => {
    expect(() =>
      dispatchDemoProcedure("auth.login", { email: DEMO_EMAIL, password: "wrong" }),
    ).toThrow(/Invalid email or password/);
  });

  it("logs in the published demo account and returns the seeded user", () => {
    const user = dispatchDemoProcedure("auth.login", {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    }) as { email: string; firmId: number; role: string };

    expect(user.email).toBe(DEMO_EMAIL);
    expect(user.firmId).toBe(1);
    expect(user.role).toBe("admin");
    expect(dispatchDemoProcedure("auth.me", undefined)).toMatchObject({ email: DEMO_EMAIL });
  });

  it("lists seeded TechCorp contract after login", () => {
    dispatchDemoProcedure("auth.login", { email: DEMO_EMAIL, password: DEMO_PASSWORD });
    const contracts = dispatchDemoProcedure("contracts.list", undefined) as Array<{ name: string }>;
    expect(contracts.some(c => c.name.includes("TechCorp"))).toBe(true);
  });

  it("creates an uploaded contract and attaches it to a matter and client", () => {
    dispatchDemoProcedure("auth.login", { email: DEMO_EMAIL, password: DEMO_PASSWORD });
    const created = dispatchDemoProcedure("contracts.create", {
      name: "Vendor MSA",
      fileName: "vendor-msa.docx",
      clientId: 1,
      caseId: 1,
    }) as { id: number; clientId: number; caseId: number; riskLevel: string };

    expect(created.clientId).toBe(1);
    expect(created.caseId).toBe(1);
    expect(created.riskLevel).toBe("high");

    const attached = dispatchDemoProcedure("contracts.attach", {
      id: created.id,
      clientId: 2,
      caseId: 2,
    }) as { clientId: number; caseId: number };
    expect(attached.clientId).toBe(2);
    expect(attached.caseId).toBe(2);
  });

  it("answers the grounded assistant from the TechCorp MSA", () => {
    dispatchDemoProcedure("auth.login", { email: DEMO_EMAIL, password: DEMO_PASSWORD });
    const result = dispatchDemoProcedure("aiChat.askAboutContract", {
      contractText: "TechCorp",
      question: "Is liability unlimited?",
    }) as { answer: string };
    expect(result.answer.toLowerCase()).toContain("unlimited");
    expect(result.answer.toLowerCase()).toContain("not legal advice");
  });

  it("returns empty success for unknown procedures so pages do not crash", () => {
    dispatchDemoProcedure("auth.login", { email: DEMO_EMAIL, password: DEMO_PASSWORD });
    expect(dispatchDemoProcedure("research.lookup", { q: "anything" })).toEqual({ success: true });
    expect(dispatchDemoProcedure("mystery.list", undefined)).toEqual([]);
  });
});
