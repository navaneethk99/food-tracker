import { betterAuth } from "better-auth/minimal";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components, internal } from "./_generated/api";
import authConfig from "./auth.config";

export const authComponent: any = createClient(components.betterAuth, {
  triggers: {
    user: {
      onCreate: async () => {},
      onUpdate: async () => {},
      onDelete: async () => {},
    },
  },
  authFunctions: {
    onCreate: (internal as any).authSync.onAuthTableCreate,
    onUpdate: (internal as any).authSync.onAuthTableUpdate,
    onDelete: (internal as any).authSync.onAuthTableDelete,
  },
});

export const createAuth = (ctx: Parameters<typeof authComponent.adapter>[0]) => {
  const baseURL =
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
    process.env.CONVEX_SITE_URL;

  if (!baseURL) {
    throw new Error("Missing BETTER_AUTH_URL or NEXT_PUBLIC_CONVEX_SITE_URL for BetterAuth.");
  }

  return betterAuth({
    baseURL,
    basePath: "/api/auth",
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    trustedOrigins: [
      process.env.BETTER_AUTH_URL,
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    ].filter((value): value is string => Boolean(value)),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
    plugins: [
      convex({
        authConfig,
        options: {
          basePath: "/api/auth",
        },
      }),
    ],
  });
};

export const { getAuthUser } = authComponent.clientApi();
