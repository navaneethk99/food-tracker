import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function toAppUser(user: {
  _id: string;
  name: string;
  email: string;
  avatar: string;
}) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  };
}

async function ensureAppUser(
  ctx: any,
  authUser: {
    authUserId: string;
    email: string;
    name: string;
    image?: string | null;
  },
) {
  const patch = {
    name: authUser.name,
    email: authUser.email,
    avatar: authUser.image ?? "",
    authUserId: authUser.authUserId,
  };

  const existingByAuthId = await ctx.db
    .query("users")
    .withIndex("by_auth_user_id", (queryBuilder: any) =>
      queryBuilder.eq("authUserId", authUser.authUserId),
    )
    .first();

  if (existingByAuthId) {
    await ctx.db.patch(existingByAuthId._id, patch);
    return existingByAuthId._id;
  }

  const existingByEmail = await ctx.db
    .query("users")
    .withIndex("by_email", (queryBuilder: any) => queryBuilder.eq("email", authUser.email))
    .first();

  if (existingByEmail) {
    await ctx.db.patch(existingByEmail._id, patch);
    return existingByEmail._id;
  }

  return await ctx.db.insert("users", patch);
}

export const ensureViewer = mutation({
  args: {
    authUserId: v.string(),
    email: v.string(),
    name: v.string(),
    image: v.optional(v.union(v.null(), v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await ensureAppUser(ctx, args);
    const user = (await ctx.db.get(userId)) as
      | {
          _id: string;
          name: string;
          email: string;
          avatar: string;
        }
      | null;

    return user ? toAppUser(user) : null;
  },
});

export const getViewerByAuthUserId = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    const viewer = await ctx.db
      .query("users")
      .withIndex("by_auth_user_id", (queryBuilder) => queryBuilder.eq("authUserId", authUserId))
      .first();

    return viewer ? toAppUser(viewer) : null;
  },
});

export const getDashboardData = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    const viewer = await ctx.db
      .query("users")
      .withIndex("by_auth_user_id", (queryBuilder) => queryBuilder.eq("authUserId", authUserId))
      .first();

    if (!viewer) {
      return {
        viewer: null,
        groups: [],
      };
    }

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (queryBuilder) => queryBuilder.eq("userId", viewer._id))
      .collect();

    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        if (!group) {
          return null;
        }

        const memberLinks = await ctx.db
          .query("groupMembers")
          .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", group._id))
          .collect();
        const members = (
          await Promise.all(memberLinks.map((memberLink) => ctx.db.get(memberLink.userId)))
        )
          .filter((member): member is NonNullable<typeof member> => Boolean(member))
          .map(toAppUser);

        const groupStreak = await ctx.db
          .query("groupStreaks")
          .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", group._id))
          .first();
        const mealsToday = await ctx.db
          .query("meals")
          .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", group._id))
          .collect();

        return {
          id: group._id,
          name: group.name,
          inviteCode: group.inviteCode,
          members,
          mealsToday: mealsToday.length,
          groupStreak: groupStreak?.currentStreak ?? 0,
        };
      }),
    );

    return {
      viewer: toAppUser(viewer),
      groups: groups.filter((group): group is NonNullable<typeof group> => Boolean(group)),
    };
  },
});

export const getGroupView = query({
  args: {
    authUserId: v.string(),
    groupId: v.id("groups"),
  },
  handler: async (ctx, { authUserId, groupId }) => {
    const viewer = await ctx.db
      .query("users")
      .withIndex("by_auth_user_id", (queryBuilder) => queryBuilder.eq("authUserId", authUserId))
      .first();

    if (!viewer) {
      return null;
    }

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (queryBuilder) =>
        queryBuilder.eq("groupId", groupId).eq("userId", viewer._id),
      )
      .first();

    if (!membership) {
      return null;
    }

    const group = await ctx.db.get(groupId);
    if (!group) {
      return null;
    }

    const memberLinks = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", groupId))
      .collect();
    const memberDocs = (
      await Promise.all(memberLinks.map((memberLink) => ctx.db.get(memberLink.userId)))
    ).filter((member): member is NonNullable<typeof member> => Boolean(member));

    const meals = await ctx.db
      .query("meals")
      .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", groupId))
      .order("desc")
      .collect();

    const memberStreaks = await ctx.db
      .query("memberStreaks")
      .withIndex("by_group_user", (queryBuilder) => queryBuilder.eq("groupId", groupId))
      .collect();
    const groupStreak = await ctx.db
      .query("groupStreaks")
      .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", groupId))
      .first();

    return {
      group: {
        id: group._id,
        name: group.name,
        createdBy: group.createdBy,
        inviteCode: group.inviteCode,
        memberIds: memberDocs.map((member) => member._id),
      },
      members: memberDocs.map(toAppUser),
      meals: await Promise.all(
        meals.map(async (meal) => {
          const items = await ctx.db
            .query("mealItems")
            .withIndex("by_meal", (queryBuilder) => queryBuilder.eq("mealId", meal._id))
            .collect();

          return {
            id: meal._id,
            userId: meal.userId,
            groupId: meal.groupId,
            mealType: meal.mealType,
            createdAt: new Date(meal.createdAt).toISOString(),
            items: items.map((item) => ({
              id: item._id,
              name: item.name,
              image: item.image,
              quantity: item.quantity,
              calories: item.calories,
            })),
          };
        }),
      ),
      userStreaks: memberStreaks.map((streak) => ({
        userId: streak.userId,
        groupId: streak.groupId,
        currentStreak: streak.currentStreak,
        postedToday: streak.postedToday,
      })),
      groupStreak: {
        groupId,
        currentStreak: groupStreak?.currentStreak ?? 0,
        allMembersPostedToday: groupStreak?.allMembersPostedToday ?? false,
      },
    };
  },
});
