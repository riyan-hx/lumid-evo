/** Mock account API until build step 15. The server keeps a 7-day undo window; this device is wiped at once. */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function requestDeletion(): Promise<{ ok: boolean; purgeAfter: string }> {
  await wait(500);
  return { ok: true, purgeAfter: new Date(Date.now() + 7 * 864e5).toISOString() };
}
