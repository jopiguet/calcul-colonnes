import { Hono, type MiddlewareHandler } from "hono";
import type { AppEnv } from "./auth/middleware.ts";
import type { AuthStore } from "./auth/store.ts";
import type { Repository } from "./repository.ts";
import type { VocabStore } from "./vocab.ts";

/**
 * The owner's page (docs/authentication.md#family-release): invitations to
 * create an account, which content other accounts see, and the feedback sent.
 * The owner is the first account; a player's own login is not the owner.
 */

/** Invitations last two weeks. */
export const INVITE_LIFETIME = 14 * 24 * 60 * 60 * 1000;
const NOTE_MAX = 60;
const FEEDBACK_SHOWN = 100;

const ownerOnly: MiddlewareHandler<AppEnv> = async (c, next) => {
  const session = c.get("session");
  if (!session || session.playerId !== null || !session.owner) return c.json({ error: "owner_only" }, 403);
  return next();
};

export function adminRoutes(deps: {
  store: AuthStore;
  repository: Repository;
  vocab: VocabStore;
  publicUrl: URL;
  registration: "open" | "invite" | "closed";
}): Hono<AppEnv> {
  const { store, repository, vocab } = deps;
  const admin = new Hono<AppEnv>();
  admin.use("*", ownerOnly);

  admin.get("/", async (c) => {
    const books = await vocab.books(true);
    return c.json({
      registration: deps.registration,
      invites: await store.invites(),
      books: books.map((b) => ({ id: b.id, title: b.title, kind: b.kind, term: b.term, visibility: b.visibility })),
      bank: (await repository.setting("bank_visibility")) === "shared" ? "shared" : "private",
      feedback: await repository.feedback(FEEDBACK_SHOWN),
    });
  });

  /** A new invitation: the link is shown once (only the code's hash is kept). */
  admin.post("/invites", async (c) => {
    const body = ((await c.req.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    const note = typeof body.note === "string" ? body.note.trim().replace(/\s+/g, " ").slice(0, NOTE_MAX) : "";
    const { code, invite } = await store.createInvite(c.get("session")!.accountId, note, INVITE_LIFETIME);
    const link = new URL(`/#join=${code}`, deps.publicUrl).toString();
    return c.json({ code, link, invite }, 201);
  });

  admin.delete("/invites/:id", async (c) => {
    const id = c.req.param("id");
    if (!/^[0-9a-f]{64}$/.test(id)) return c.json({ error: "unknown_invite" }, 404);
    return (await store.deleteInvite(id)) ? c.body(null, 204) : c.json({ error: "unknown_invite" }, 404);
  });

  /** A book for the owner only, or for every account. */
  admin.put("/books/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = ((await c.req.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    const visibility = body.visibility;
    if (!Number.isInteger(id) || id < 1 || (visibility !== "private" && visibility !== "shared")) return c.json({ error: "invalid" }, 400);
    return (await vocab.setVisibility(id, visibility)) ? c.body(null, 204) : c.json({ error: "unknown_book" }, 404);
  });

  /** The written questions of the bank: the owner only, or every account. */
  admin.put("/bank", async (c) => {
    const body = ((await c.req.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    if (body.visibility !== "private" && body.visibility !== "shared") return c.json({ error: "invalid" }, 400);
    await repository.setSetting("bank_visibility", body.visibility);
    return c.body(null, 204);
  });

  return admin;
}
