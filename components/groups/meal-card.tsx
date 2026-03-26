import { deleteMealAction } from "@/app/actions";
import type { AppUser, Meal } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";

export function MealCard({
  meal,
  user,
  canDelete,
}: {
  meal: Meal;
  user: AppUser | undefined;
  canDelete: boolean;
}) {
  return (
    <article className="pixel-window">
      <div className="pixel-titlebar">
        <span>{meal.mealType}</span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span>{formatTimestamp(meal.createdAt)}</span>
          {canDelete ? (
            <form action={deleteMealAction.bind(null, meal.id, meal.groupId)}>
              <button type="submit" className="pixel-button bg-[#ffb7df] px-3 py-1 text-sm">
                Delete Meal
              </button>
            </form>
          ) : null}
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar}
              alt={user.name}
              className="h-14 w-14 border-4 border-[var(--border)] object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center border-4 border-[var(--border)] bg-[#ffe58f] text-xs pixel-label">
              N/A
            </div>
          )}
          <div>
            <p className="pixel-label">{user?.name ?? "Anonymous"}</p>
            <p className="text-lg">{meal.items.length} items scanned</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {meal.items.map((item) => (
            <div key={item.id} className="pixel-panel overflow-hidden">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-32 w-full border-b-4 border-[var(--border)] object-cover sm:h-40"
                />
              ) : (
                <div className="flex h-32 w-full items-center justify-center border-b-4 border-[var(--border)] bg-[#fff4bf] pixel-label sm:h-40">
                  No image
                </div>
              )}
              <div className="space-y-2 p-3">
                <p className="pixel-label">{item.name}</p>
                {item.quantity === "Unable to estimate" || item.calories === 0 ? (
                  <div className="pixel-panel bg-[#ffdfdf] px-3 py-2 text-base">
                    Unable to estimate calories for this item.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <span className="pixel-tag">{item.quantity}</span>
                    <span className="pixel-tag bg-[#ffb7df]">{item.calories} cal</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
