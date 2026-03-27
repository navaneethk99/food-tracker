import Link from "next/link";
import type { Group } from "@/lib/types";

export function GroupHeader({ group }: { group: Group }) {
  return (
    <div className="pixel-window">
      <div className="pixel-titlebar text-2xl">
        <span>{group.name}</span>
        <span>✦ Group Hub</span>
      </div>
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="pixel-label">Group Code</p>
          <p className="pixel-panel inline-flex max-w-full break-all px-3 py-2">
            {group.inviteCode}
          </p>
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
