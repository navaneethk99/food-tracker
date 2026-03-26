import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const meals = await ctx.db
      .query("meals")
      .withIndex("by_group", (queryBuilder) => queryBuilder.eq("groupId", groupId))
      .order("desc")
      .collect();

    return Promise.all(
      meals.map(async (meal) => {
        const items = await ctx.db
          .query("mealItems")
          .withIndex("by_meal", (queryBuilder) => queryBuilder.eq("mealId", meal._id))
          .collect();
        const user = await ctx.db.get(meal.userId);

        return {
          ...meal,
          user,
          items,
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    groupId: v.id("groups"),
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("snack"),
      v.literal("dinner"),
    ),
    items: v.array(
      v.object({
        name: v.string(),
        image: v.string(),
        quantity: v.string(),
        calories: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const createdAt = Date.now();
    const mealId = await ctx.db.insert("meals", {
      userId: args.userId,
      groupId: args.groupId,
      mealType: args.mealType,
      createdAt,
    });

    await Promise.all(
      args.items.map((item) =>
        ctx.db.insert("mealItems", {
          mealId,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          calories: item.calories,
        }),
      ),
    );

    return mealId;
  },
});

export const remove = mutation({
  args: {
    mealId: v.id("meals"),
    userId: v.id("users"),
  },
  handler: async (ctx, { mealId, userId }) => {
    const meal = await ctx.db.get(mealId);

    if (!meal) {
      throw new Error("Meal not found.");
    }

    if (meal.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const items = await ctx.db
      .query("mealItems")
      .withIndex("by_meal", (queryBuilder) => queryBuilder.eq("mealId", mealId))
      .collect();

    await Promise.all(items.map((item) => ctx.db.delete(item._id)));
    await ctx.db.delete(mealId);

    return {
      groupId: meal.groupId,
      imageUrls: items.map((item) => item.image).filter(Boolean),
      userId: meal.userId,
    };
  },
});
