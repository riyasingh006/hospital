import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import {
  getClientIp,
  setSessionCookie,
  writeAudit,
  type Role,
} from "@/lib/auth";
import { ok, fail } from "@/lib/api-helpers";

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

async function exchangeCode(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) throw new Error("token_exchange_failed");
  return res.json() as Promise<{ id_token: string; access_token: string }>;
}

async function verifyIdToken(idToken: string): Promise<{
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}> {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );
  if (!res.ok) throw new Error("id_token_verification_failed");
  return res.json();
}

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl(req);
  const loginUrl = new URL("/login", baseUrl);
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      loginUrl.searchParams.set("error", "google_cancelled");
      return NextResponse.redirect(loginUrl.toString());
    }

    if (!code || !state) {
      loginUrl.searchParams.set("error", "google_invalid");
      return NextResponse.redirect(loginUrl.toString());
    }

    const savedState = req.cookies.get("google_oauth_state")?.value;
    if (!savedState || savedState !== state) {
      loginUrl.searchParams.set("error", "google_state_mismatch");
      return NextResponse.redirect(loginUrl.toString());
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      loginUrl.searchParams.set("error", "google_config_missing");
      return NextResponse.redirect(loginUrl.toString());
    }

    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`;
    const tokens = await exchangeCode(code, redirectUri);
    const claims = await verifyIdToken(tokens.id_token);

    if (!claims.email) {
      loginUrl.searchParams.set("error", "google_email_missing");
      return NextResponse.redirect(loginUrl.toString());
    }

    const email = claims.email.toLowerCase();
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const name = claims.name || email.split("@")[0];
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: `google:${claims.sub}`,
        },
      });
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Welcome to Jeevan Sahay",
          body: "Complete your health profile so hospitals can assist you faster during an emergency.",
          type: "INFO",
          link: "/profile",
        },
      });
      await writeAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        action: "AUTH_REGISTER_GOOGLE",
        entityType: "User",
        entityId: user.id,
        ip: await getClientIp(),
      });
    }

    if (user.status !== "ACTIVE") {
      loginUrl.searchParams.set("error", "account_suspended");
      return NextResponse.redirect(loginUrl.toString());
    }

    await setSessionCookie({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      hospitalId: user.hospitalId ?? undefined,
    });

    await writeAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      action: "AUTH_LOGIN_GOOGLE",
      entityType: "User",
      entityId: user.id,
      ip: await getClientIp(),
    });

    const res = NextResponse.redirect(new URL("/dashboard", baseUrl));
    res.cookies.set("google_oauth_state", "", { path: "/", maxAge: 0 });
    res.cookies.set("google_oauth_nonce", "", { path: "/", maxAge: 0 });
    return res;
  } catch (e) {
    loginUrl.searchParams.set("error", "google_failed");
    return NextResponse.redirect(loginUrl.toString());
  }
}
