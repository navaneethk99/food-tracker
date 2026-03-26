import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const groups = pgTable("groups", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  inviteCode: varchar("invite_code", { length: 64 }).notNull().unique(),
  createdBy: varchar("created_by", { length: 64 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const groupMembers = pgTable(
  "group_members",
  {
    groupId: varchar("group_id", { length: 64 })
      .notNull()
      .references(() => groups.id),
    userId: varchar("user_id", { length: 64 })
      .notNull()
      .references(() => users.id),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.groupId, table.userId] })],
);

export const meals = pgTable("meals", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 })
    .notNull()
    .references(() => users.id),
  groupId: varchar("group_id", { length: 64 })
    .notNull()
    .references(() => groups.id),
  mealType: varchar("meal_type", { length: 16 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mealItems = pgTable("meal_items", {
  id: varchar("id", { length: 64 }).primaryKey(),
  mealId: varchar("meal_id", { length: 64 })
    .notNull()
    .references(() => meals.id),
  name: text("name").notNull(),
  image: text("image").notNull(),
  quantity: text("quantity").notNull(),
  calories: integer("calories").notNull(),
});

export const memberStreaks = pgTable(
  "member_streaks",
  {
    groupId: varchar("group_id", { length: 64 })
      .notNull()
      .references(() => groups.id),
    userId: varchar("user_id", { length: 64 })
      .notNull()
      .references(() => users.id),
    currentStreak: integer("current_streak").default(0).notNull(),
    lastPostedDate: varchar("last_posted_date", { length: 10 }),
    postedToday: boolean("posted_today").default(false).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.groupId, table.userId] })],
);

export const groupStreaks = pgTable("group_streaks", {
  groupId: varchar("group_id", { length: 64 })
    .primaryKey()
    .references(() => groups.id),
  currentStreak: integer("current_streak").default(0).notNull(),
  allMembersPostedToday: boolean("all_members_posted_today").default(false).notNull(),
  lastCompletedDate: varchar("last_completed_date", { length: 10 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
