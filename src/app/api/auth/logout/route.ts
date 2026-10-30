import { clearSessionCookie, getSession, writeAudit } from "@/lib/auth";
import { ok, withApi } from "@/lib/api-helpers";

export const POST = withApi(async () => {
  const session = await getSession();
  await clearSessionCookie();
  if (session) {
    await writeAudit({
      actorUserId: session.sub,
      actorEmail: session.email,
      action: "AUTH_LOGOUT",
    });
  }
  return ok({ loggedOut: true });
});
