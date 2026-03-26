"use client";

import { useQuery } from "convex/react";
import { AddMealModal } from "@/components/groups/add-meal-modal";
import { GroupHeader } from "@/components/groups/group-header";
import { MealCard } from "@/components/groups/meal-card";
import { StreakIndicator } from "@/components/groups/streak-indicator";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { GroupView } from "@/lib/types";

export function GroupLive({
  authUserId,
  groupId,
  viewerId,
  initialGroupView,
}: {
  authUserId: string;
  groupId: string;
  viewerId: string | null;
  initialGroupView: GroupView;
}) {
  const liveGroupView = useQuery(api.app.getGroupView, {
    authUserId,
    groupId: groupId as Id<"groups">,
  });
  const groupView = liveGroupView ?? initialGroupView;

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
      <GroupHeader group={groupView.group} canDelete={viewerId === groupView.group.createdBy} />
      <div className="flex justify-end">
        <AddMealModal groupId={groupView.group.id} />
      </div>
      <StreakIndicator
        members={groupView.members}
        meals={groupView.meals}
        userStreaks={groupView.userStreaks}
        groupStreak={groupView.groupStreak}
      />
      <section className="grid gap-4">
        {groupView.meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            user={groupView.members.find((member) => member.id === meal.userId)}
            canDelete={viewerId === meal.userId}
          />
        ))}
      </section>
    </div>
  );
}
