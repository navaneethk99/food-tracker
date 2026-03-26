export const authConfig = {
  provider: "google",
  callbackPath: "/api/auth/callback/google",
};

export function getConvexSiteUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_SITE_URL.");
  }

  return url.replace(/\/$/, "");
}
