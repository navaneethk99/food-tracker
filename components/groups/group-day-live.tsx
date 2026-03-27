"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { AddMealModal } from "@/components/groups/add-meal-modal";
import { GroupHeader } from "@/components/groups/group-header";
import { MealCard } from "@/components/groups/meal-card";
import { StreakIndicator } from "@/components/groups/streak-indicator";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { GroupView } from "@/lib/types";
import { formatCalendarDate, getDateKey, getDateKeyFromDate } from "@/lib/utils";

export function GroupDayLive({
  authUserId,
  groupId,
  viewerId,
  dateKey,
  initialGroupView,
}: {
  authUserId: string;
  groupId: string;
  viewerId: string | null;
  dateKey: string;
  initialGroupView: GroupView;
}) {
  const liveGroupView = useQuery(api.app.getGroupView, {
    authUserId,
    groupId: groupId as Id<"groups">,
  });
  const groupView = liveGroupView ?? initialGroupView;
  const isCurrentDate = dateKey === getDateKeyFromDate(new Date());

  const mealsForDate = useMemo(
    () => groupView.meals.filter((meal) => getDateKey(meal.createdAt) === dateKey),
    [dateKey, groupView.meals],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
      <GroupHeader group={groupView.group} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/groups/${groupView.group.id}`} className="pixel-button bg-[#c6b4ff]">
          Back To Calendar
        </Link>
        {isCurrentDate ? <AddMealModal groupId={groupView.group.id} /> : null}
      </div>
      <StreakIndicator
        members={groupView.members}
        meals={groupView.meals}
        userStreaks={groupView.userStreaks}
        groupStreak={groupView.groupStreak}
      />
      <section className="space-y-4">
        <details className="pixel-window overflow-hidden">
          <summary className="pixel-titlebar cursor-pointer list-none">
            <span>{formatCalendarDate(dateKey)}</span>
            <span>{mealsForDate.length} meals</span>
          </summary>
          <div className="grid grid-cols-3 gap-2 p-3 md:gap-3 md:p-4">
            <div className="pixel-panel p-2 md:p-3">
              <p className="pixel-label mb-1 md:mb-2">Meals</p>
              <p className="text-xl leading-none md:text-3xl">{mealsForDate.length}</p>
            </div>
            <div className="pixel-panel p-2 md:p-3">
              <p className="pixel-label mb-1 md:mb-2">Items</p>
              <p className="text-xl leading-none md:text-3xl">
                {mealsForDate.reduce((sum, meal) => sum + meal.items.length, 0)}
              </p>
            </div>
            <div className="pixel-panel p-2 md:p-3">
              <p className="pixel-label mb-1 md:mb-2">Calories</p>
              <p className="text-xl leading-none md:text-3xl">
                {mealsForDate.reduce(
                  (sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + item.calories, 0),
                  0,
                )}
              </p>
            </div>
          </div>
        </details>

        {mealsForDate.length > 0 ? (
          <div className="grid gap-3">
            {mealsForDate.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                user={groupView.members.find((member) => member.id === meal.userId)}
                canDelete={viewerId === meal.userId}
              />
            ))}
          </div>
        ) : (
          <div className="pixel-window">
            <div className="pixel-titlebar">
              <span>{formatCalendarDate(dateKey)}</span>
              <span>Empty Day</span>
            </div>
            <div className="p-4">
              <div className="pixel-panel p-4">
                <p className="pixel-label mb-2">No Meals For This Day</p>
                <p className="text-lg sm:text-xl">
                  {isCurrentDate ? "Use the add meal button or head back to the calendar." : "Head back to the calendar to pick another day."}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
