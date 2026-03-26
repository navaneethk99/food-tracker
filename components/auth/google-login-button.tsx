"use client";

import { authConfig } from "@/lib/auth";
import { useState } from "react";

export function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/sign-in/social", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          provider: authConfig.provider,
          callbackURL: `${window.location.origin}/dashboard`,
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      let data: { redirect?: boolean; url?: string; message?: string } | null = null;
      let fallbackMessage = "";

      if (contentType.includes("application/json")) {
        data = (await response.json()) as { redirect?: boolean; url?: string; message?: string };
      } else {
        fallbackMessage = await response.text();
      }

      if (!response.ok) {
        const errorMessage =
          data?.message ??
          (fallbackMessage || `Failed to start Google sign-in (${response.status}).`);
        throw new Error(errorMessage);
      }

      if (data?.redirect && data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("Missing redirect URL from Better Auth.");
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  return (
    <button
      className="pixel-button inline-flex items-center gap-3 bg-[#fff0a8]"
      type="button"
      onClick={handleSignIn}
      disabled={isLoading}
    >
      <span>☺</span>
      <span>{isLoading ? "Connecting..." : "Login With Google"}</span>
    </button>
  );
}
