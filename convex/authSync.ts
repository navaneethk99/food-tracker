import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

type BetterAuthUser = {
  _id: string;
  email: string;
  name: string;
  image?: string | null;
};

async function upsertAppUser(ctx: any, authUser: BetterAuthUser) {
  const existingByAuthId = await ctx.db
    .query("users")
    .withIndex("by_auth_user_id", (queryBuilder: any) => queryBuilder.eq("authUserId", authUser._id))
    .first();

  const patch = {
    name: authUser.name,
    email: authUser.email,
    avatar: authUser.image ?? "",
    authUserId: authUser._id,
  };

  if (existingByAuthId) {
    await ctx.db.patch(existingByAuthId._id, patch);
    return;
  }

  const existingByEmail = await ctx.db
    .query("users")
    .withIndex("by_email", (queryBuilder: any) => queryBuilder.eq("email", authUser.email))
    .first();

  if (existingByEmail) {
    await ctx.db.patch(existingByEmail._id, patch);
    return;
  }

  await ctx.db.insert("users", patch);
}

export const onAuthTableCreate = internalMutation({
  args: {
    doc: v.any(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.model !== "user") {
      return;
    }

    await upsertAppUser(ctx, args.doc as BetterAuthUser);
  },
});

export const onAuthTableUpdate = internalMutation({
  args: {
    oldDoc: v.any(),
    newDoc: v.any(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.model !== "user") {
      return;
    }

    await upsertAppUser(ctx, args.newDoc as BetterAuthUser);
  },
});

export const onAuthTableDelete = internalMutation({
  args: {
    doc: v.any(),
    model: v.string(),
  },
  handler: async (_ctx, _args) => {
    // Keep app data intact if an auth row is deleted.
  },
});
