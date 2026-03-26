import type { AppUser, GroupStreak, Meal, UserStreak } from "@/lib/types";

function getDateKey(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function StreakIndicator({
  members,
  meals,
  userStreaks,
  groupStreak,
}: {
  members: AppUser[];
  meals: Meal[];
  userStreaks: UserStreak[];
  groupStreak: GroupStreak;
}) {
  const todayKey = getDateKey(new Date().toISOString());

  return (
    <div className="space-y-4">
      <div className="pixel-panel p-4">
        <p className="pixel-label mb-3">Group Sync Streak</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-3xl leading-none sm:text-4xl">{groupStreak.currentStreak}</span>
          <span className="pixel-tag bg-[#b7f1de]">
            {groupStreak.allMembersPostedToday ? "All Posted Today" : "Waiting On Squad"}
          </span>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {members.map((member) => {
          const streak = userStreaks.find((entry) => entry.userId === member.id);
          const todaysMeals = meals.filter(
            (meal) => meal.userId === member.id && getDateKey(meal.createdAt) === todayKey,
          );
          const todaysCalories = todaysMeals.reduce(
            (sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + item.calories, 0),
            0,
          );
          const hasUnavailableCalories = todaysMeals.some((meal) =>
            meal.items.some((item) => item.quantity === "Unable to estimate" || item.calories === 0),
          );

          return (
            <div key={member.id} className="pixel-panel flex items-center gap-3 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={member.avatar}
                alt={member.name}
                className="h-12 w-12 border-4 border-[var(--border)] object-cover sm:h-14 sm:w-14"
              />
              <div className="space-y-1">
                <p className="pixel-label">{member.name}</p>
                <p className="text-base sm:text-lg">{streak?.currentStreak ?? 0} day streak</p>
                <p className="text-sm">{streak?.postedToday ? "Posted today" : "Missing today"}</p>
                <p className="text-sm">
                  {todaysCalories > 0
                    ? `${todaysCalories} cal today`
                    : hasUnavailableCalories
                      ? "Calories unavailable today"
                      : "0 cal today"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
