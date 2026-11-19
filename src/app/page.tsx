import { redirect } from "next/navigation";

/** Until auth lands (step 15): send everyone to the welcome screen. */
export default function Root() {
  redirect("/welcome");
}
