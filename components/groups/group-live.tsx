"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { GroupHeader } from "@/components/groups/group-header";
import { StreakIndicator } from "@/components/groups/streak-indicator";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { GroupView } from "@/lib/types";
import {
  cn,
  formatCalendarDate,
  getDateKey,
  getDateKeyFromDate,
  parseDateKey,
} from "@/lib/utils";
import type { CSSProperties } from "react";

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function getLatestMealDateKey(meals: GroupView["meals"]) {
  return (
    meals
      .map((meal) => meal.createdAt)
      .sort(
        (left, right) => new Date(right).getTime() - new Date(left).getTime(),
      )
      .map(getDateKey)[0] ?? null
  );
}

function getHeatmapStyle(
  mealCount: number,
  maxMealCount: number,
  isCurrentMonth: boolean,
): CSSProperties {
  const intensity = maxMealCount > 0 ? mealCount / maxMealCount : 0;
  const headerGradient =
    "linear-gradient(180deg, var(--pink), var(--lavender))";

  if (!isCurrentMonth) {
    return mealCount > 0
      ? {
          backgroundImage: `${headerGradient}`,
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          backgroundBlendMode: "screen",
          color: "var(--foreground)",
          opacity: 0.55,
        }
      : {
          backgroundImage: `${headerGradient}`,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backgroundBlendMode: "screen",
          color: "rgba(46, 25, 83, 0.6)",
          opacity: 0.35,
        };
  }

  if (intensity >= 1) {
    return {
      backgroundImage: headerGradient,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      backgroundBlendMode: "multiply",
      color: "var(--foreground)",
    };
  }

  if (intensity >= 0.75) {
    return {
      backgroundImage: headerGradient,
      backgroundColor: "rgba(255, 255, 255, 0.35)",
      backgroundBlendMode: "screen",
      color: "var(--foreground)",
    };
  }

  if (intensity >= 0.5) {
    return {
      backgroundImage: headerGradient,
      backgroundColor: "rgba(255, 255, 255, 0.55)",
      backgroundBlendMode: "screen",
      color: "var(--foreground)",
    };
  }

  if (intensity >= 0.25) {
    return {
      backgroundImage: headerGradient,
      backgroundColor: "rgba(255, 255, 255, 0.72)",
      backgroundBlendMode: "screen",
      color: "var(--foreground)",
    };
  }

  if (intensity > 0) {
    return {
      backgroundImage: headerGradient,
      backgroundColor: "rgba(255, 255, 255, 0.84)",
      backgroundBlendMode: "screen",
      color: "var(--foreground)",
    };
  }

  return {
    backgroundImage: headerGradient,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    backgroundBlendMode: "screen",
    color: "var(--foreground)",
  };
}

function getTodayStyle(): CSSProperties {
  return {
    boxShadow: "inset 0 0 0 1px var(--border)",
  };
}

function getSelectedStyle(): CSSProperties {
  return {
    outline: "4px solid var(--border)",
    outlineOffset: "-4px",
  };
}

function getFutureDateStyle(): CSSProperties {
  return {
    backgroundColor: "#ebe7f2",
    color: "rgba(46, 25, 83, 0.45)",
  };
}

export function GroupLive({
  authUserId,
  groupId,
  initialGroupView,
}: {
  authUserId: string;
  groupId: string;
  initialGroupView: GroupView;
}) {
  const liveGroupView = useQuery(api.app.getGroupView, {
    authUserId,
    groupId: groupId as Id<"groups">,
  });
  const groupView = liveGroupView ?? initialGroupView;
  const latestMealDateKey = getLatestMealDateKey(groupView.meals);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<Date>(() =>
    latestMealDateKey
      ? startOfMonth(parseDateKey(latestMealDateKey))
      : startOfMonth(new Date()),
  );

  const mealsByDate = useMemo(() => {
    const grouped = new Map<string, GroupView["meals"]>();

    for (const meal of groupView.meals) {
      const dateKey = getDateKey(meal.createdAt);
      grouped.set(dateKey, [...(grouped.get(dateKey) ?? []), meal]);
    }

    return grouped;
  }, [groupView.meals]);

  const activeDateKey =
    selectedDateKey && mealsByDate.has(selectedDateKey)
      ? selectedDateKey
      : latestMealDateKey;

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth);
    const monthOffset = monthStart.getDay();
    const firstGridDay = new Date(monthStart);
    firstGridDay.setDate(monthStart.getDate() - monthOffset);

    return Array.from({ length: 35 }, (_, index) => {
      const date = new Date(firstGridDay);
      date.setDate(firstGridDay.getDate() + index);
      const dateKey = getDateKeyFromDate(date);
      return {
        date,
        dateKey,
        isCurrentMonth: date.getMonth() === visibleMonth.getMonth(),
        meals: mealsByDate.get(dateKey) ?? [],
      };
    });
  }, [mealsByDate, visibleMonth]);

  const maxMealCount = useMemo(
    () =>
      Math.max(0, ...Array.from(mealsByDate.values(), (meals) => meals.length)),
    [mealsByDate],
  );
  const totalMealDays = mealsByDate.size;
  const selectedMonthKey = activeDateKey
    ? getMonthKey(parseDateKey(activeDateKey))
    : null;
  const todayDateKey = getDateKeyFromDate(new Date());
  const todayDateValue = parseDateKey(todayDateKey).getTime();

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
      <GroupHeader group={groupView.group} />
      <StreakIndicator
        members={groupView.members}
        meals={groupView.meals}
      />
      <section className="space-y-4">
        <div className="pixel-window">
          <div className="pixel-titlebar">
            <span>Meal Calendar</span>
            <span>{totalMealDays} active days</span>
          </div>
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                className="pixel-button bg-[#c6b4ff] px-3 py-2"
                onClick={() =>
                  setVisibleMonth((currentMonth) => addMonths(currentMonth, -1))
                }
              >
                Prev
              </button>
              <div className="text-center">
                <p className="pixel-label">{formatMonthLabel(visibleMonth)}</p>
                <p className="text-sm">
                  {selectedMonthKey === getMonthKey(visibleMonth) &&
                  activeDateKey
                    ? `Selected ${formatCalendarDate(activeDateKey)}`
                    : "Pick a day to inspect meals"}
                </p>
              </div>
              <button
                type="button"
                className="pixel-button bg-[#ffe58f] px-3 py-2"
                onClick={() =>
                  setVisibleMonth((currentMonth) => addMonths(currentMonth, 1))
                }
              >
                Next
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <p key={day} className="pixel-label text-[9px] sm:text-[10px]">
                  {day}
                </p>
              ))}
              {calendarDays.map((day) => {
                const isSelected = activeDateKey === day.dateKey;
                const isToday = day.dateKey === todayDateKey;
                const isFutureDate = day.date.getTime() > todayDateValue;
                const mealCount = day.meals.length;
                const cellStyle = {
                  ...getHeatmapStyle(
                    mealCount,
                    maxMealCount,
                    day.isCurrentMonth,
                  ),
                  ...(isFutureDate ? getFutureDateStyle() : {}),
                  ...(isSelected ? getSelectedStyle() : {}),
                  ...(isToday ? getTodayStyle() : {}),
                } satisfies CSSProperties;

                return (
                  <Link
                    key={day.dateKey}
                    href={`/groups/${groupView.group.id}/days/${day.dateKey}`}
                    onMouseEnter={() => {
                      setSelectedDateKey(day.dateKey);
                      if (!day.isCurrentMonth) {
                        setVisibleMonth(startOfMonth(day.date));
                      }
                    }}
                    onFocus={() => setSelectedDateKey(day.dateKey)}
                    className={cn(
                      "pixel-panel relative z-0 flex min-h-20 items-center justify-center p-2 text-center transition-colors sm:min-h-24",
                      isToday && "z-10",
                    )}
                    style={cellStyle}
                  >
                    <span
                      className={cn(
                        "pixel-label text-[9px] sm:text-[10px]",
                        isToday && "text-[11px] sm:text-xs",
                      )}
                    >
                      {day.date.getDate()}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
