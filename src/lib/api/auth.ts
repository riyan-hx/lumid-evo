/** Mock auth until the OTP API lands (build step 15). Same signatures the real client will use. */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const DEV_CODE = "123456";

export async function sendCode(phone: string): Promise<{ ok: true } | { ok: false; error: "invalid" }> {
  await wait(500);
  return /^\d{10}$/.test(phone) ? { ok: true } : { ok: false, error: "invalid" };
}

export async function verifyCode(_phone: string, code: string): Promise<{ ok: boolean }> {
  await wait(500);
  return { ok: code === DEV_CODE };
}
