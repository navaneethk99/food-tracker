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
    <details className="pixel-window overflow-hidden">
      <summary className="pixel-titlebar cursor-pointer list-none">
        <span>Member Details</span>
        <span>{groupStreak.currentStreak} day sync</span>
      </summary>
      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
        <div className="pixel-panel p-3 sm:p-4">
          <p className="pixel-label mb-2 sm:mb-3">Group Sync Streak</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <span className="text-2xl leading-none sm:text-4xl">{groupStreak.currentStreak}</span>
            <span className="pixel-tag bg-[#b7f1de] px-2 py-1 text-[8px] sm:px-2 sm:text-[9px]">
              {groupStreak.allMembersPostedToday ? "All Posted Today" : "Waiting On Squad"}
            </span>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-3 md:gap-3">
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
              <div key={member.id} className="pixel-panel flex items-center gap-2 p-2 sm:gap-3 sm:p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="h-9 w-9 border-2 border-[var(--border)] object-cover sm:h-14 sm:w-14 sm:border-4"
                />
                <div className="min-w-0 space-y-0.5 sm:space-y-1">
                  <p className="pixel-label break-words text-[8px] sm:text-[10px]">{member.name}</p>
                  <p className="text-sm sm:text-lg">{streak?.currentStreak ?? 0} day streak</p>
                  <p className="text-[11px] sm:text-sm">{streak?.postedToday ? "Posted today" : "Missing today"}</p>
                  <p className="text-[11px] sm:text-sm">
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
    </details>
  );
}
