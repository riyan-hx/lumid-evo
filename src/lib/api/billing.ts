/** Mock billing until the UPI/card gateway lands (build step 15). Same signature the real client will use. */
import { read } from "@/lib/store";

export type PlanId = "year" | "month";
export type Method = "upi" | "card";
export const PRICES: Record<PlanId, { amount: string; note: string }> = {
  year: { amount: "₹1,499", note: "per year · save 16%" },
  month: { amount: "₹149", note: "per month" },
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Dev switch to exercise 9.10: localStorage "evo.dev.pay" = "fail". */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- mock keeps the real signature
export async function pay(_plan: PlanId, _method: Method): Promise<{ ok: true } | { ok: false; reason: "timeout" }> {
  await wait(700);
  return read<string>("evo.dev.pay", "") === "fail" ? { ok: false, reason: "timeout" } : { ok: true };
}
