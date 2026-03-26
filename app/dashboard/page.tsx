import { createGroupAction, joinGroupAction } from "@/app/actions";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardLive } from "@/components/dashboard/dashboard-live";
import { DesktopWindow } from "@/components/ui/desktop-window";
import { getAuthUserId, getDashboardData } from "@/lib/data";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ joinError?: string }>;
}) {
  const [authUserId, dashboardData] = await Promise.all([getAuthUserId(), getDashboardData()]);
  const { viewer } = dashboardData;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const joinError = resolvedSearchParams?.joinError;

  return (
    <main className="pixel-shell min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:gap-5 xl:grid xl:grid-cols-[0.82fr_1.18fr]">
        <DesktopWindow title={viewer ? `${viewer.name} Dashboard` : "Sign In"}>
          <div className="space-y-4">
            {viewer ? (
              <>
                <div className="pixel-panel flex items-center gap-3 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={viewer.avatar}
                    alt={viewer.name}
                    className="h-14 w-14 border-4 border-[var(--border)] object-cover sm:h-16 sm:w-16"
                  />
                  <div>
                    <p className="pixel-label">{viewer.name}</p>
                    <p className="text-base break-all sm:text-xl">{viewer.email}</p>
                  </div>
                </div>
                <form action={createGroupAction} className="space-y-3">
                  <p className="pixel-label">Create Group</p>
                  <input className="pixel-input bg-white" name="name" placeholder="New food group" />
                  <button className="pixel-button w-full bg-[#ffb7df]">Create</button>
                </form>
                <form action={joinGroupAction} className="space-y-3">
                  <p className="pixel-label">Join With Group Code</p>
                  <input
                    className="pixel-input bg-white uppercase"
                    name="inviteCode"
                    placeholder="Enter group code"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  {joinError ? <p className="pixel-panel bg-[#ffdfdf] px-3 py-2 text-lg">{joinError}</p> : null}
                  <button className="pixel-button w-full bg-[#b7f1de]">Join</button>
                </form>
                <SignOutButton />
              </>
            ) : (
              <div className="space-y-4">
                <div className="pixel-panel p-4">
                  <p className="pixel-label mb-2">Authentication Required</p>
                  <p className="text-lg sm:text-xl">
                    Sign in with Google to create groups, upload meals, and join shared streaks.
                  </p>
                </div>
                <GoogleLoginButton />
              </div>
            )}
          </div>
        </DesktopWindow>

        <DesktopWindow title="Your Groups">
          {authUserId ? (
            <DashboardLive authUserId={authUserId} initialData={dashboardData} />
          ) : (
            <div className="pixel-panel p-5">
              <p className="pixel-label mb-2">No Groups Yet</p>
              <p className="text-lg sm:text-xl">Sign in to create or join a group.</p>
            </div>
          )}
        </DesktopWindow>
      </div>
    </main>
  );
}
