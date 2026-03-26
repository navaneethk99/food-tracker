import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function getDateKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function getPreviousDateKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function getCurrentStreak(dateKeys: string[]) {
  const sortedDateKeys = [...new Set(dateKeys)].sort((a, b) => b.localeCompare(a));
  const latestDateKey = sortedDateKeys[0];

  if (!latestDateKey) {
    return {
      currentStreak: 0,
      latestDateKey: undefined,
    };
  }

  let currentStreak = 1;
  let previousDateKey = latestDateKey;

  for (const dateKey of sortedDateKeys.slice(1)) {
    if (dateKey !== getPreviousDateKey(previousDateKey)) {
      break;
    }

    currentStreak += 1;
    previousDateKey = dateKey;
  }

  return {
    currentStreak,
    latestDateKey,
  };
}

export const getForGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const memberStreaks = await ctx.db
      .query("memberStreaks")
      .withIndex("by_group_user", (queryBuilder) => queryBuilder.eq("groupId", groupId))
      .collect();

    const groupStreak = await ctx.db
      .query("groupStreaks")
      .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", groupId))
      .first();

    return { memberStreaks, groupStreak };
  },
});

export const updateAfterMeal = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
    createdAt: v.number(),
  },
  handler: async (ctx, { groupId, userId, createdAt }) => {
    const dateKey = getDateKey(createdAt);
    const yesterday = getPreviousDateKey(dateKey);
    const streak = await ctx.db
      .query("memberStreaks")
      .withIndex("by_group_user", (queryBuilder) =>
        queryBuilder.eq("groupId", groupId).eq("userId", userId),
      )
      .first();

    if (!streak) {
      return;
    }

    const nextStreak =
      streak.lastPostedDate === yesterday
        ? streak.currentStreak + 1
        : streak.lastPostedDate === dateKey
          ? streak.currentStreak
          : 1;

    await ctx.db.patch(streak._id, {
      currentStreak: nextStreak,
      lastPostedDate: dateKey,
      postedToday: true,
      updatedAt: Date.now(),
    });

    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", groupId))
      .collect();
    const memberStates = await Promise.all(
      members.map((member) =>
        ctx.db
          .query("memberStreaks")
          .withIndex("by_group_user", (queryBuilder) =>
            queryBuilder.eq("groupId", groupId).eq("userId", member.userId),
          )
          .first(),
      ),
    );
    const allMembersPostedToday = memberStates.every((member) => member?.lastPostedDate === dateKey);
    const groupStreak = await ctx.db
      .query("groupStreaks")
      .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", groupId))
      .first();

    if (!groupStreak) {
      return;
    }

    const nextGroupStreak =
      allMembersPostedToday && groupStreak.lastCompletedDate === yesterday
        ? groupStreak.currentStreak + 1
        : allMembersPostedToday && groupStreak.lastCompletedDate !== dateKey
          ? 1
          : groupStreak.currentStreak;

    await ctx.db.patch(groupStreak._id, {
      currentStreak: nextGroupStreak,
      allMembersPostedToday,
      lastCompletedDate: allMembersPostedToday ? dateKey : groupStreak.lastCompletedDate,
      updatedAt: Date.now(),
    });
  },
});

export const recomputeAfterMealDeletion = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, { groupId, userId }) => {
    const today = getDateKey(Date.now());
    const memberStreak = await ctx.db
      .query("memberStreaks")
      .withIndex("by_group_user", (queryBuilder) =>
        queryBuilder.eq("groupId", groupId).eq("userId", userId),
      )
      .first();

    if (memberStreak) {
      const userMeals = await ctx.db
        .query("meals")
        .withIndex("by_user_group", (queryBuilder) =>
          queryBuilder.eq("userId", userId).eq("groupId", groupId),
        )
        .collect();
      const userDateKeys = userMeals.map((meal) => getDateKey(meal.createdAt));
      const userStats = getCurrentStreak(userDateKeys);

      await ctx.db.patch(memberStreak._id, {
        currentStreak: userStats.currentStreak,
        lastPostedDate: userStats.latestDateKey,
        postedToday: userStats.latestDateKey === today,
        updatedAt: Date.now(),
      });
    }

    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", groupId))
      .collect();
    const memberDateKeys = await Promise.all(
      members.map(async (member) => {
        const meals = await ctx.db
          .query("meals")
          .withIndex("by_user_group", (queryBuilder) =>
            queryBuilder.eq("userId", member.userId).eq("groupId", groupId),
          )
          .collect();

        return [...new Set(meals.map((meal) => getDateKey(meal.createdAt)))];
      }),
    );
    const allDateKeys = [...new Set(memberDateKeys.flat())];
    const completedDateKeys = allDateKeys.filter((dateKey) =>
      memberDateKeys.every((dateKeys) => dateKeys.includes(dateKey)),
    );
    const groupStats = getCurrentStreak(completedDateKeys);
    const groupStreak = await ctx.db
      .query("groupStreaks")
      .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", groupId))
      .first();

    if (!groupStreak) {
      return;
    }

    await ctx.db.patch(groupStreak._id, {
      currentStreak: groupStats.currentStreak,
      allMembersPostedToday: completedDateKeys.includes(today),
      lastCompletedDate: groupStats.latestDateKey,
      updatedAt: Date.now(),
    });
  },
});
