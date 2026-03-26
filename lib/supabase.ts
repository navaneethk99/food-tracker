import { createClient } from "@supabase/supabase-js";

export class SupabaseBucketNotFoundError extends Error {
  constructor(bucket: string) {
    super(
      `Supabase storage bucket "${bucket}" was not found. Create the bucket in Supabase Storage or set SUPABASE_BUCKET to an existing bucket.`,
    );
    this.name = "SupabaseBucketNotFoundError";
  }
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase server credentials.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function uploadMealImage(file: File, groupId: string, userId: string) {
  const bucket = process.env.SUPABASE_BUCKET ?? "meal-images";
  const client = getSupabaseAdmin();
  const path = `${groupId}/${userId}/${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await client.storage
    .from(bucket)
    .upload(path, arrayBuffer, {
      contentType: file.type || "image/png",
      upsert: false,
    });

  if (error) {
    if (/bucket.+not found/i.test(error.message)) {
      throw new SupabaseBucketNotFoundError(bucket);
    }

    throw new Error(error.message);
  }

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function getStoragePathFromPublicUrl(imageUrl: string, bucket: string) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = imageUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(imageUrl.slice(markerIndex + marker.length));
}

export async function deleteMealImages(imageUrls: string[]) {
  const bucket = process.env.SUPABASE_BUCKET ?? "meal-images";
  const client = getSupabaseAdmin();
  const paths = imageUrls
    .map((imageUrl) => getStoragePathFromPublicUrl(imageUrl, bucket))
    .filter((path): path is string => Boolean(path));

  if (paths.length === 0) {
    return;
  }

  const { error } = await client.storage.from(bucket).remove(paths);

  if (error) {
    throw new Error(error.message);
  }
}
