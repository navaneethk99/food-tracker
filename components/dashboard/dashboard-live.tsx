"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { DashboardData } from "@/lib/types";

export function DashboardLive({
  authUserId,
  initialData,
}: {
  authUserId: string;
  initialData: DashboardData;
}) {
  const liveData = useQuery(api.app.getDashboardData, { authUserId });
  const data = liveData ?? initialData;

  return data.groups.length > 0 ? (
    <div className="grid gap-4 md:grid-cols-2">
      {data.groups.map((group) => (
        <article key={group.id} className="pixel-panel space-y-4 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="pixel-label">{group.name}</p>
              <p className="text-lg sm:text-xl">{group.members.length} members</p>
            </div>
            <span className="pixel-tag">{group.groupStreak} day sync</span>
          </div>
          <div className="pixel-progress">
            <span style={{ width: `${Math.min(group.mealsToday * 26 + 20, 100)}%` }} />
          </div>
          <div className="flex flex-wrap gap-2">
            {group.members.map((member) => (
              <span key={member.id} className="pixel-tag bg-[#fff7d9]">
                {member.name}
              </span>
            ))}
          </div>
          <div className="space-y-1">
            <p className="pixel-label">Group Code</p>
            <p className="pixel-panel inline-flex max-w-full break-all px-3 py-2">{group.inviteCode}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/groups/${group.id}`} className="pixel-button bg-[#ffe58f]">
              Open Group
            </Link>
          </div>
        </article>
      ))}
    </div>
  ) : (
    <div className="pixel-panel p-5">
      <p className="pixel-label mb-2">No Groups Yet</p>
      <p className="text-lg sm:text-xl">Once Convex and auth are connected, your real groups will show up here.</p>
    </div>
  );
}
