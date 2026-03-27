import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";
import { getConvexSiteUrl } from "@/lib/auth";

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL or NEXT_PUBLIC_CONVEX_SITE_URL.");
  }

  return url;
}

const authHandler = convexBetterAuthNextJs({
  convexUrl: getConvexUrl(),
  convexSiteUrl: getConvexSiteUrl(),
}).handler;

export const GET = authHandler.GET;
export const POST = authHandler.POST;
