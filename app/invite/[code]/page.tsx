import Link from "next/link";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <main className="pixel-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pixel-window w-full max-w-xl">
        <div className="pixel-titlebar">
          <span>Invite Pop-Up</span>
          <span>☺</span>
        </div>
        <div className="space-y-4 p-4">
          <p className="pixel-label">Share This Link</p>
          <div className="pixel-panel break-all p-4 text-2xl">/invite/{code}</div>
          <p className="text-2xl">
            Send this retro invite to your friends so they can join the same meal feed and keep the group streak alive.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="pixel-button bg-[#ffe58f]">
              Back To Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
