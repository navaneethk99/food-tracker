import { notFound } from "next/navigation";
import { GroupLive } from "@/components/groups/group-live";
import { getAuthUserId, getGroupView } from "@/lib/data";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const [authUserId, groupView] = await Promise.all([getAuthUserId(), getGroupView(groupId)]);

  if (!groupView || !authUserId) {
    notFound();
  }

  return (
    <main className="pixel-shell min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <GroupLive
        authUserId={authUserId}
        groupId={groupId}
        initialGroupView={groupView}
      />
    </main>
  );
}
