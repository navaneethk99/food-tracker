import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function createInviteCode(name: string) {
  void name;

  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function normalizeInviteCode(inviteCode: string) {
  return inviteCode.trim().toUpperCase();
}

export const listForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (queryBuilder) => queryBuilder.eq("userId", userId))
      .collect();

    return Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        const groupStreak = await ctx.db
          .query("groupStreaks")
          .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", membership.groupId))
          .first();
        const members = await ctx.db
          .query("groupMembers")
          .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", membership.groupId))
          .collect();

        return {
          ...group,
          memberCount: members.length,
          groupStreak: groupStreak?.currentStreak ?? 0,
        };
      }),
    );
  },
});

export const create = mutation({
  args: { userId: v.id("users"), name: v.string() },
  handler: async (ctx, { userId, name }) => {
    const now = Date.now();
    const groupId = await ctx.db.insert("groups", {
      name,
      inviteCode: createInviteCode(name),
      createdBy: userId,
      createdAt: now,
    });

    await ctx.db.insert("groupMembers", {
      groupId,
      userId,
      joinedAt: now,
    });

    await ctx.db.insert("memberStreaks", {
      groupId,
      userId,
      currentStreak: 0,
      postedToday: false,
      updatedAt: now,
    });

    await ctx.db.insert("groupStreaks", {
      groupId,
      currentStreak: 0,
      allMembersPostedToday: false,
      updatedAt: now,
    });

    return groupId;
  },
});

export const joinByInvite = mutation({
  args: { userId: v.id("users"), inviteCode: v.string() },
  handler: async (ctx, { userId, inviteCode }) => {
    const normalizedInviteCode = normalizeInviteCode(inviteCode);
    const group = await ctx.db
      .query("groups")
      .withIndex("by_invite_code", (queryBuilder) =>
        queryBuilder.eq("inviteCode", normalizedInviteCode),
      )
      .first();

    if (!group) {
      throw new Error("Invite code not found.");
    }

    const existing = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (queryBuilder) =>
        queryBuilder.eq("groupId", group._id).eq("userId", userId),
      )
      .first();

    if (!existing) {
      await ctx.db.insert("groupMembers", {
        groupId: group._id,
        userId,
        joinedAt: Date.now(),
      });

      await ctx.db.insert("memberStreaks", {
        groupId: group._id,
        userId,
        currentStreak: 0,
        postedToday: false,
        updatedAt: Date.now(),
      });
    }

    return group._id;
  },
});

export const remove = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, { groupId, userId }) => {
    const group = await ctx.db.get(groupId);

    if (!group) {
      throw new Error("Group not found.");
    }

    if (group.createdBy !== userId) {
      throw new Error("Unauthorized");
    }

    const groupMembers = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", groupId))
      .collect();
    const meals = await ctx.db
      .query("meals")
      .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", groupId))
      .collect();
    const memberStreaks = await ctx.db
      .query("memberStreaks")
      .withIndex("by_group_user", (queryBuilder) => queryBuilder.eq("groupId", groupId))
      .collect();
    const groupStreak = await ctx.db
      .query("groupStreaks")
      .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", groupId))
      .first();
    const mealItems = (
      await Promise.all(
        meals.map((meal) =>
          ctx.db
            .query("mealItems")
            .withIndex("by_meal", (queryBuilder) => queryBuilder.eq("mealId", meal._id))
            .collect(),
        ),
      )
    ).flat();

    await Promise.all(mealItems.map((item) => ctx.db.delete(item._id)));
    await Promise.all(meals.map((meal) => ctx.db.delete(meal._id)));
    await Promise.all(groupMembers.map((member) => ctx.db.delete(member._id)));
    await Promise.all(memberStreaks.map((streak) => ctx.db.delete(streak._id)));

    if (groupStreak) {
      await ctx.db.delete(groupStreak._id);
    }

    await ctx.db.delete(groupId);

    return { groupId };
  },
});
