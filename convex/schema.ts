import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatar: v.string(),
    authUserId: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_auth_user_id", ["authUserId"]),
  groups: defineTable({
    name: v.string(),
    inviteCode: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_invite_code", ["inviteCode"]),
  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_user", ["groupId", "userId"]),
  meals: defineTable({
    userId: v.id("users"),
    groupId: v.id("groups"),
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("snack"),
      v.literal("dinner"),
    ),
    createdAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user_group", ["userId", "groupId"]),
  mealItems: defineTable({
    mealId: v.id("meals"),
    name: v.string(),
    image: v.string(),
    quantity: v.string(),
    calories: v.number(),
  }).index("by_meal", ["mealId"]),
  memberStreaks: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    currentStreak: v.number(),
    lastPostedDate: v.optional(v.string()),
    postedToday: v.boolean(),
    updatedAt: v.number(),
  }).index("by_group_user", ["groupId", "userId"]),
  groupStreaks: defineTable({
    groupId: v.id("groups"),
    currentStreak: v.number(),
    allMembersPostedToday: v.boolean(),
    lastCompletedDate: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_group", ["groupId"]),
});
