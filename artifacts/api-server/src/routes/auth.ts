import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  GetCurrentAuthUserResponse,
  ExchangeMobileAuthorizationCodeBody,
  ExchangeMobileAuthorizationCodeResponse,
  LogoutMobileSessionResponse,
} from "@workspace/api-zod";
import {
  clearSession,
  getSessionId,
  createSession,
  deleteSession,
  SESSION_COOKIE,
  SESSION_TTL,
  type SessionData,
} from "../lib/auth";
import crypto from "crypto";

const router: IRouter = Router();

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

function getSafeReturnTo(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

async function upsertUser(userData: {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}) {
  const [user] = await db
    .insert(usersTable)
    .values(userData)
    .onConflictDoUpdate({
      target: usersTable.id,
      set: {
        ...userData,
        updatedAt: new Date(),
      },
    })
    .returning();
  return user;
}

// ── Get current user ──
router.get("/auth/user", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: req.isAuthenticated() ? req.user : null,
    }),
  );
});

// ── Email/Password Login ──
router.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  // Find user by email
  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!existingUser) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // Verify password (simple hash comparison)
  const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
  if (existingUser.passwordHash !== hashedPassword) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const sessionData: SessionData = {
    user: {
      id: existingUser.id,
      email: existingUser.email,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      profileImageUrl: existingUser.profileImageUrl,
    },
    created_at: Date.now(),
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  res.json({ user: sessionData.user });
});

// ── Register ──
router.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body as {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "password must be at least 8 characters" });
    return;
  }

  // Check if user already exists
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existing) {
    res.status(409).json({ error: "User with this email already exists" });
    return;
  }

  const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
  const user = await upsertUser({
    id: crypto.randomUUID(),
    email,
    firstName: firstName || null,
    lastName: lastName || null,
    profileImageUrl: null,
    passwordHash: hashedPassword,
  } as any);

  const sessionData: SessionData = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
    created_at: Date.now(),
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  res.status(201).json({ user: sessionData.user });
});

// ── GitHub OAuth Login ──
router.get("/auth/github", (req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: "GitHub OAuth not configured" });
    return;
  }

  const returnTo = getSafeReturnTo(req.query.returnTo);
  const state = Buffer.from(returnTo).toString("base64");

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    `${getOrigin(req)}/api/auth/github/callback`,
  )}&scope=read:user,user:email&state=${state}`;

  res.redirect(githubAuthUrl);
});

router.get("/auth/github/callback", async (req: Request, res: Response) => {
  const { code, state } = req.query as { code?: string; state?: string };
  if (!code) {
    res.redirect("/?error=github_auth_failed");
    return;
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.redirect("/?error=github_not_configured");
    return;
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const tokenData = await tokenRes.json() as { access_token?: string };
    if (!tokenData.access_token) {
      res.redirect("/?error=github_token_failed");
      return;
    }

    // Get user info
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/json" },
    });
    const githubUser = await userRes.json() as {
      id: number;
      login: string;
      name?: string;
      email?: string;
      avatar_url?: string;
    };

    // Get primary email if not public
    let email = githubUser.email;
    if (!email) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/json" },
      });
      const emails = await emailsRes.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
      email = emails.find(e => e.primary && e.verified)?.email || emails[0]?.email;
    }

    const nameParts = (githubUser.name || githubUser.login).split(" ");
    const user = await upsertUser({
      id: `github:${githubUser.id}`,
      email: email || null,
      firstName: nameParts[0] || null,
      lastName: nameParts.slice(1).join(" ") || null,
      profileImageUrl: githubUser.avatar_url || null,
    });

    const sessionData: SessionData = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      },
      created_at: Date.now(),
    };

    const sid = await createSession(sessionData);
    setSessionCookie(res, sid);

    const returnTo = state ? Buffer.from(state, "base64").toString() : "/";
    res.redirect(returnTo);
  } catch (err) {
    console.error("GitHub OAuth error:", err);
    res.redirect("/?error=github_auth_failed");
  }
});

// ── Password-Only Login (no email, just a master password) ──
router.post("/auth/password-login", async (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  if (!password) {
    res.status(400).json({ error: "password is required" });
    return;
  }

  const masterPassword = process.env.MASTER_PASSWORD;
  if (!masterPassword) {
    res.status(500).json({ error: "Master password not configured on server" });
    return;
  }

  const hashedInput = crypto.createHash("sha256").update(password).digest("hex");
  const hashedMaster = crypto.createHash("sha256").update(masterPassword).digest("hex");

  if (hashedInput !== hashedMaster) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  // Create a session for a generic "master" user
  const sessionData: SessionData = {
    user: {
      id: "master-user",
      email: "master@www.studio",
      firstName: "Master",
      lastName: "User",
      profileImageUrl: null,
    },
    created_at: Date.now(),
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  res.json({ user: sessionData.user, token: sid });
});

// ── Logout ──
router.get("/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  res.redirect("/");
});

router.post("/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  if (sid) {
    await deleteSession(sid);
  }
  res.json(LogoutMobileSessionResponse.parse({ success: true }));
});

// ── Mobile token exchange (simplified — uses email/password) ──
router.post(
  "/mobile-auth/token-exchange",
  async (req: Request, res: Response) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!existingUser) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    if ((existingUser as any).passwordHash !== hashedPassword) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const sessionData: SessionData = {
      user: {
        id: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        profileImageUrl: existingUser.profileImageUrl,
      },
      created_at: Date.now(),
    };

    const sid = await createSession(sessionData);
    res.json(ExchangeMobileAuthorizationCodeResponse.parse({ token: sid }));
  },
);

router.post("/mobile-auth/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  if (sid) {
    await deleteSession(sid);
  }
  res.json(LogoutMobileSessionResponse.parse({ success: true }));
});

function getOrigin(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host =
    req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  return `${proto}://${host}`;
}

export default router;
