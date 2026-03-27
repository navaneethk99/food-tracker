import type { AppUser, Meal } from "@/lib/types";

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
  dateKey,
}: {
  members: AppUser[];
  meals: Meal[];
  dateKey?: string;
}) {
  const activeDateKey = dateKey ?? getDateKey(new Date().toISOString());

  return (
    <details className="pixel-window overflow-hidden">
      <summary className="pixel-titlebar cursor-pointer list-none">
        <span>Member Details</span>
      </summary>
      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
        <div className="grid gap-2 md:grid-cols-3 md:gap-3">
          {members.map((member) => {
            const mealsForDay = meals.filter(
              (meal) => meal.userId === member.id && getDateKey(meal.createdAt) === activeDateKey,
            );
            const caloriesForDay = mealsForDay.reduce(
              (sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + item.calories, 0),
              0,
            );
            const hasUnavailableCalories = mealsForDay.some((meal) =>
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
                <div className="min-w-0 space-y-0 sm:space-y-0">
                  <p className="pixel-label break-words text-[8px] sm:text-[10px]">{member.name}</p>
                  <p className="text-[20px] font-bold sm:text-xl">
                    {caloriesForDay > 0
                      ? `${caloriesForDay} cal`
                      : hasUnavailableCalories
                        ? "Calories unavailable"
                        : "0 cal"}
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
