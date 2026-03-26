import Link from "next/link";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { DesktopWindow } from "@/components/ui/desktop-window";

export default function Home() {
  return (
    <main className="pixel-shell min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-5">
        <DesktopWindow title="Social Food Tracker">
          <div className="space-y-4">
            <p className="pixel-label">Realtime Food Feed For Friend Groups</p>
            <h1 className="font-[var(--font-pixel)] text-xl leading-relaxed text-[#2e1953] sm:text-2xl">
              Post meals fast, keep group streaks alive, and make the whole flow work cleanly on your phone.
            </h1>
            <p className="max-w-2xl text-lg leading-6 sm:text-2xl sm:leading-7">
              Log meals with photos, let Gemini estimate calories, and track your group without desktop-style clutter.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <GoogleLoginButton />
              <Link href="/dashboard" className="pixel-button bg-[#c6b4ff] text-center">
                Open Dashboard
              </Link>
            </div>
          </div>
        </DesktopWindow>

        <div className="grid gap-4 sm:grid-cols-3">
          <DesktopWindow title="Fast Capture">
            <div className="space-y-3">
              <div className="pixel-panel flex h-28 items-center justify-center bg-[#ffb7df] text-5xl">◉</div>
              <p className="text-lg">Upload a meal, keep the photo if storage is ready, and still save the post if it is not.</p>
            </div>
          </DesktopWindow>

          <DesktopWindow title="Group Codes">
            <div className="space-y-3">
              <div className="pixel-progress">
                <span style={{ width: "88%" }} />
              </div>
              <p className="text-lg">Join by typing a group code. No invite links, no desktop detours, no case-sensitivity trap.</p>
            </div>
          </DesktopWindow>

          <DesktopWindow title="Daily Sync">
            <div className="space-y-3">
              {["Breakfast Club", "Streak Stickers", "Meal Uploads"].map((folder) => (
                <div key={folder} className="pixel-panel flex items-center gap-3 p-3">
                  <span className="text-2xl">▣</span>
                  <span className="pixel-label">{folder}</span>
                </div>
              ))}
            </div>
          </DesktopWindow>
        </div>
      </div>
    </main>
  );
}
