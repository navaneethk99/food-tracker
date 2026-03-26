import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";

const authConfig = {
  providers: [getAuthConfigProvider({ basePath: "/api/auth" })],
};

export default authConfig;
