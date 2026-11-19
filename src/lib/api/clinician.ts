/** Mock clinician directory until the API lands (build step 15). Same signatures the real client will use. */
import type { Clinician } from "@/lib/circle";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Dev-only code, like DEV_CODE for sign-in. The real lookup is server-side. */
export const DEV_CLINICIAN: Clinician = { code: "MEERA-4K2", name: "Dr. Meera R.", short: "Dr. Meera", first: "Meera", title: "Clinical psychologist", city: "Kozhikode" };

export const normaliseCode = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^([A-Z]+)([A-Z0-9]{3})$/, "$1-$2");

export async function lookupCode(code: string): Promise<Clinician | null> {
  await wait(400);
  return normaliseCode(code) === DEV_CLINICIAN.code ? DEV_CLINICIAN : null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- mock keeps the real signature
export async function sendBrief(_code: string, _lines: string[]): Promise<{ ok: boolean }> {
  await wait(600);
  return { ok: true };
}
