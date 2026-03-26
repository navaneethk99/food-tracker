"use server";

import { fetchMutation } from "convex/nextjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError, z } from "zod";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getViewer } from "@/lib/data";
import { analyzeMealItems } from "@/lib/gemini";
import { normalizeMealImage } from "@/lib/image-upload";
import { deleteMealImages, SupabaseBucketNotFoundError, uploadMealImage } from "@/lib/supabase";

const createGroupSchema = z.object({
  name: z.string().min(2).max(48),
});

const joinGroupSchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .length(4)
    .transform((value) => value.toUpperCase())
    .pipe(z.string().regex(/^[A-Z0-9]{4}$/)),
});

const addMealSchema = z.object({
  groupId: z.string().min(1),
  mealType: z.enum(["breakfast", "lunch", "snack", "dinner"]),
  itemNames: z.array(z.string().min(1)),
});

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL or NEXT_PUBLIC_CONVEX_SITE_URL.");
  }

  return url;
}

function getImageUrlForItem(imageUrls: string[], index: number) {
  if (imageUrls.length === 0) {
    return "";
  }

  if (imageUrls.length === 1) {
    return imageUrls[0];
  }

  return imageUrls[index] ?? imageUrls[0];
}

export async function createGroupAction(formData: FormData) {
  const viewer = await getViewer();
  if (!viewer) {
    throw new Error("Unauthorized");
  }

  const parsed = createGroupSchema.parse({
    name: formData.get("name"),
  });

  await fetchMutation(
    api.groups.create,
    {
      userId: viewer.id as Id<"users">,
      name: parsed.name,
    },
    {
      url: getConvexUrl(),
    },
  );

  revalidatePath("/dashboard");
  redirect(`/dashboard?created=${encodeURIComponent(parsed.name)}`);
}

export async function joinGroupAction(formData: FormData) {
  const viewer = await getViewer();
  if (!viewer) {
    throw new Error("Unauthorized");
  }

  let parsed: z.infer<typeof joinGroupSchema>;

  try {
    parsed = joinGroupSchema.parse({
      inviteCode: formData.get("inviteCode"),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      redirect(`/dashboard?joinError=${encodeURIComponent("Enter a valid 4-character group code.")}`);
    }

    throw error;
  }

  let groupId: string;

  try {
    groupId = await fetchMutation(
      api.groups.joinByInvite,
      {
        userId: viewer.id as Id<"users">,
        inviteCode: parsed.inviteCode,
      },
      {
        url: getConvexUrl(),
      },
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invite code not found.")) {
      redirect(`/dashboard?joinError=${encodeURIComponent("Group code not found.")}`);
    }

    throw error;
  }

  revalidatePath("/dashboard");
  redirect(`/groups/${encodeURIComponent(groupId)}`);
}

export async function addMealAction(formData: FormData) {
  const viewer = await getViewer();
  if (!viewer) {
    throw new Error("Unauthorized");
  }

  const itemNames = formData
    .getAll("itemNames")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const parsed = addMealSchema.parse({
    groupId: formData.get("groupId"),
    mealType: formData.get("mealType"),
    itemNames,
  });
  const normalizedFiles = await Promise.all(files.map((file) => normalizeMealImage(file)));
  const imageFiles = await Promise.all(
    normalizedFiles.map(async (file) => ({
      mimeType: file.mimeType,
      data: file.buffer.toString("base64"),
    })),
  );

  let imageUrls: string[] = [];

  try {
    imageUrls = await Promise.all(
      normalizedFiles.map((file) => uploadMealImage(file, parsed.groupId, viewer.id)),
    );
  } catch (error) {
    if (error instanceof SupabaseBucketNotFoundError) {
      console.warn(error.message);
    } else {
      throw error;
    }
  }

  const analyzedItems = await analyzeMealItems({
    itemNames: parsed.itemNames,
    imageFiles,
  });
  const createdAt = Date.now();

  await fetchMutation(
    api.meals.create,
    {
      userId: viewer.id as Id<"users">,
      groupId: parsed.groupId as Id<"groups">,
      mealType: parsed.mealType,
      items: analyzedItems.map((item, index) => ({
        name: item.name,
        image: getImageUrlForItem(imageUrls, index),
        quantity: item.quantity,
        calories: item.calories,
      })),
    },
    {
      url: getConvexUrl(),
    },
  );
  await fetchMutation(
    api.streaks.updateAfterMeal,
    {
      groupId: parsed.groupId as Id<"groups">,
      userId: viewer.id as Id<"users">,
      createdAt,
    },
    {
      url: getConvexUrl(),
    },
  );

  revalidatePath("/dashboard");
  revalidatePath(`/groups/${parsed.groupId}`);
}

export async function deleteMealAction(mealId: string, groupId: string, formData: FormData) {
  void formData;

  const viewer = await getViewer();
  if (!viewer) {
    throw new Error("Unauthorized");
  }

  const deletedMeal = await fetchMutation(
    api.meals.remove,
    {
      mealId: mealId as Id<"meals">,
      userId: viewer.id as Id<"users">,
    },
    {
      url: getConvexUrl(),
    },
  );

  if (deletedMeal.imageUrls.length > 0) {
    try {
      await deleteMealImages(deletedMeal.imageUrls);
    } catch (error) {
      console.warn("Failed to delete Supabase meal images after meal deletion.", error);
    }
  }

  await fetchMutation(
    api.streaks.recomputeAfterMealDeletion,
    {
      groupId: deletedMeal.groupId as Id<"groups">,
      userId: deletedMeal.userId as Id<"users">,
    },
    {
      url: getConvexUrl(),
    },
  );

  revalidatePath("/dashboard");
  revalidatePath(`/groups/${groupId}`);
}

export async function deleteGroupAction(groupId: string, formData: FormData) {
  void formData;

  const viewer = await getViewer();
  if (!viewer) {
    throw new Error("Unauthorized");
  }

  await fetchMutation(
    api.groups.remove,
    {
      groupId: groupId as Id<"groups">,
      userId: viewer.id as Id<"users">,
    },
    {
      url: getConvexUrl(),
    },
  );

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
