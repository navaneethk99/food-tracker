export type MealType = "breakfast" | "lunch" | "snack" | "dinner";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

export type DashboardGroup = {
  id: string;
  name: string;
  inviteCode: string;
  members: AppUser[];
  mealsToday: number;
  groupStreak: number;
};

export type Group = {
  id: string;
  name: string;
  createdBy: string;
  inviteCode: string;
  memberIds: string[];
};

export type MealItem = {
  id: string;
  name: string;
  image: string;
  quantity: string;
  calories: number;
};

export type Meal = {
  id: string;
  userId: string;
  groupId: string;
  mealType: MealType;
  createdAt: string;
  items: MealItem[];
};

export type UserStreak = {
  userId: string;
  groupId: string;
  currentStreak: number;
  postedToday: boolean;
};

export type GroupStreak = {
  groupId: string;
  currentStreak: number;
  allMembersPostedToday: boolean;
};

export type GroupView = {
  group: Group;
  members: AppUser[];
  meals: Meal[];
  userStreaks: UserStreak[];
  groupStreak: GroupStreak;
};

export type DashboardData = {
  viewer: AppUser | null;
  groups: DashboardGroup[];
};
