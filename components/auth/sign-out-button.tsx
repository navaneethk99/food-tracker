"use client";

import { useState } from "react";

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Failed to sign out (${response.status}).`);
      }

      window.location.href = "/";
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  return (
    <button
      className="pixel-button w-full bg-[#fff0a8]"
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
