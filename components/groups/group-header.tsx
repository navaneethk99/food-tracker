import Link from "next/link";
import type { Group, GroupStreak } from "@/lib/types";

export function GroupHeader({
  group,
  groupStreak,
}: {
  group: Group;
  groupStreak?: GroupStreak;
}) {
  return (
    <div className="pixel-window">
      <div className="pixel-titlebar text-2xl">
        <span>{group.name}</span>
        <span>✦ Group Hub</span>
      </div>
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between">
        <div className="grid flex-1 grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <p className="pixel-label">Group Code</p>
            <div className="pixel-panel flex min-h-[92px] items-center px-4 py-3">
              <p className="w-full break-all text-3xl text-center leading-tight sm:text-2xl font-bold tracking-[6px]">
                {group.inviteCode}
              </p>
            </div>
          </div>
          {groupStreak ? (
            <div className="space-y-2">
              <p className="pixel-label">Group Streak</p>
              <div className="pixel-panel flex min-h-[92px] flex-col justify-center gap-1 px-4 py-3">
                <p className="text-xl font-bold leading-none sm:text-2xl">{groupStreak.currentStreak} days</p>
                <p className="text-md sm:text-sm">
                  {groupStreak.allMembersPostedToday ? "All posted today" : "Waiting on squad"}
                </p>
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="pixel-button bg-[#c6b4ff]">
            Back To Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
