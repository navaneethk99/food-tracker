import { notFound } from "next/navigation";
import { GroupDayLive } from "@/components/groups/group-day-live";
import { getAuthUserId, getGroupView, getViewer } from "@/lib/data";
import { isDateKey } from "@/lib/utils";

export default async function GroupDayPage({
  params,
}: {
  params: Promise<{ groupId: string; date: string }>;
}) {
  const { groupId, date } = await params;

  if (!isDateKey(date)) {
    notFound();
  }

  const [authUserId, groupView, viewer] = await Promise.all([
    getAuthUserId(),
    getGroupView(groupId),
    getViewer(),
  ]);

  if (!groupView || !authUserId) {
    notFound();
  }

  return (
    <main className="pixel-shell min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <GroupDayLive
        authUserId={authUserId}
        groupId={groupId}
        viewerId={viewer?.id ?? null}
        dateKey={date}
        initialGroupView={groupView}
      />
    </main>
  );
}
