import { deleteMealAction } from "@/app/actions";
import type { AppUser, Meal } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { ImageLightbox } from "@/components/ui/image-lightbox";

function MealItemMeta({ quantity, calories }: { quantity: string; calories: number }) {
  if (quantity === "Unable to estimate" || calories === 0) {
    return (
      <div className="pixel-panel break-words bg-[#ffdfdf] px-2 py-1.5 text-[11px] leading-tight sm:px-3 sm:py-2 sm:text-base">
        Unable to estimate calories for this item.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      <span className="pixel-tag max-w-full break-words px-1.5 py-1 text-[8px] sm:px-2 sm:text-[9px]">
        {quantity}
      </span>
      <span className="pixel-tag bg-[#ffb7df] px-1.5 py-1 text-[8px] sm:px-2 sm:text-[9px]">
        {calories} cal
      </span>
    </div>
  );
}

export function MealCard({
  meal,
  user,
  canDelete,
}: {
  meal: Meal;
  user: AppUser | undefined;
  canDelete: boolean;
}) {
  const firstItem = meal.items[0];
  const totalCalories = meal.items.reduce((sum, item) => sum + item.calories, 0);

  return (
    <article className="pixel-window flex h-full min-w-0 flex-col">
      <div className="pixel-titlebar items-start gap-1.5 px-2 py-1.5 sm:items-center sm:gap-3 sm:px-3 sm:py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="break-words text-[8px] leading-none sm:text-[10px]">{meal.mealType}</span>
          <span className="break-words text-[8px] leading-none sm:text-[10px]">{totalCalories} cal</span>
        </div>
        <div className="flex w-full min-w-0 flex-col items-start gap-1 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
          <span className="break-words text-[8px] leading-none sm:text-[10px]">{formatTimestamp(meal.createdAt)}</span>
          {canDelete ? (
            <form action={deleteMealAction.bind(null, meal.id, meal.groupId)} className="w-full sm:w-auto">
              <ConfirmSubmitButton
                confirmMessage="Delete this meal?"
                className="pixel-button min-h-0 w-full bg-[#ffb7df] px-2 py-1 text-[8px] leading-none sm:w-auto sm:px-3 sm:text-sm"
              >
                Delete
              </ConfirmSubmitButton>
            </form>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col space-y-2 p-2 sm:space-y-4 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar}
              alt={user.name}
              className="h-8 w-8 shrink-0 border-2 border-[var(--border)] object-cover sm:h-14 sm:w-14 sm:border-4"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[var(--border)] bg-[#ffe58f] text-[8px] pixel-label sm:h-14 sm:w-14 sm:border-4 sm:text-xs">
              N/A
            </div>
          )}
          <div className="min-w-0">
            <p className="pixel-label break-words text-[8px] sm:text-[10px]">{user?.name ?? "Anonymous"}</p>
            <p className="break-words text-[11px] leading-tight sm:text-lg">{meal.items.length} items scanned</p>
          </div>
        </div>
        {firstItem ? (
          <div className="pixel-panel flex flex-1 flex-col overflow-hidden">
            {firstItem.image ? (
              <ImageLightbox
                src={firstItem.image}
                alt={firstItem.name}
                className="h-16 w-full border-b-2 border-[var(--border)] object-cover sm:h-40 sm:border-b-4"
                overlayImageClassName="max-h-[85vh] max-w-[92vw] object-contain"
              />
            ) : (
              <div className="flex h-16 w-full items-center justify-center border-b-2 border-[var(--border)] bg-[#fff4bf] pixel-label sm:h-40 sm:border-b-4">
                No image
              </div>
            )}
            <div className="space-y-2 p-2 sm:space-y-4 sm:p-3">
              <div className="space-y-1.5 sm:space-y-2">
                {meal.items.map((item) => (
                  <div
                    key={item.id}
                    className="space-y-1.5 border-b border-[rgba(46,25,83,0.15)] pb-2 last:border-b-0 last:pb-0 sm:space-y-2 sm:border-b-2 sm:pb-3"
                  >
                    <p className="pixel-label break-words text-[8px] sm:text-[10px]">{item.name}</p>
                    <MealItemMeta quantity={item.quantity} calories={item.calories} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="pixel-panel overflow-hidden">
            <div className="space-y-1.5 p-2 sm:space-y-2 sm:p-3">
              <p className="pixel-label text-[8px] sm:text-[10px]">No items found</p>
              <p className="text-[11px] leading-tight sm:text-base">This meal does not have any scanned items.</p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
