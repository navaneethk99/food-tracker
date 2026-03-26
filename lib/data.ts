import { fetchMutation, fetchQuery } from "convex/nextjs";
import { cookies } from "next/headers";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { AppUser, DashboardData, GroupView } from "@/lib/types";

type AuthSessionResponse = {
  user?: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  } | null;
};

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL or NEXT_PUBLIC_CONVEX_SITE_URL.");
  }

  return url;
}

function getConvexSiteUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_SITE_URL.");
  }

  return url.replace(/\/$/, "");
}

async function getAuthSession(): Promise<AuthSessionResponse | null> {
  const cookieStore = await cookies();
  const response = await fetch(`${getConvexSiteUrl()}/api/auth/get-session`, {
    method: "GET",
    headers: {
      cookie: cookieStore.toString(),
      accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  return (await response.json()) as AuthSessionResponse;
}

export async function getAuthUserId() {
  const session = await getAuthSession();
  return session?.user?.id ?? null;
}

async function ensureViewerFromSession(session: AuthSessionResponse) {
  const authUser = session.user;

  if (!authUser) {
    return null;
  }

  return (await fetchMutation(
    api.app.ensureViewer,
    {
      authUserId: authUser.id,
      email: authUser.email,
      name: authUser.name,
      image: authUser.image ?? null,
    },
    { url: getConvexUrl() },
  )) as AppUser | null;
}

export async function getViewer(): Promise<AppUser | null> {
  const session = await getAuthSession();
  const authUserId = session?.user?.id;

  if (!authUserId) {
    return null;
  }

  const ensuredViewer = await ensureViewerFromSession(session);
  if (ensuredViewer) {
    return ensuredViewer;
  }

  return await fetchQuery(
    api.app.getViewerByAuthUserId,
    { authUserId },
    { url: getConvexUrl() },
  ) as AppUser | null;
}

export async function getDashboardData(): Promise<DashboardData> {
  const session = await getAuthSession();
  const authUserId = session?.user?.id;

  if (!authUserId) {
    return {
      viewer: null,
      groups: [],
    };
  }

  await ensureViewerFromSession(session);

  return await fetchQuery(
    api.app.getDashboardData,
    { authUserId },
    { url: getConvexUrl() },
  ) as DashboardData;
}

export async function getGroupView(groupId: string): Promise<GroupView | null> {
  const session = await getAuthSession();
  const authUserId = session?.user?.id;

  if (!authUserId) {
    return null;
  }

  await ensureViewerFromSession(session);

  return await fetchQuery(
    api.app.getGroupView,
    { authUserId, groupId: groupId as Id<"groups"> },
    { url: getConvexUrl() },
  ) as GroupView | null;
}
