"use client";

import { useRef, useState, useTransition } from "react";
import { addMealAction } from "@/app/actions";

const mealTypes = ["breakfast", "lunch", "snack", "dinner"] as const;

export function AddMealModal({ groupId }: { groupId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mealType, setMealType] = useState<(typeof mealTypes)[number]>("breakfast");
  const [isMealTypeOpen, setIsMealTypeOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const nextIdRef = useRef(2);
  const [items, setItems] = useState([{ id: "item-1", name: "" }]);

  function addItem() {
    const nextId = `item-${nextIdRef.current++}`;
    setItems((current) => [...current, { id: nextId, name: "" }]);
  }

  return (
    <>
      <button type="button" className="pixel-button bg-[#b7f1de]" onClick={() => setIsOpen(true)}>
        + Add Meal
      </button>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2e1953]/40 p-2 sm:items-center sm:p-4">
          <div className="pixel-window max-h-[92vh] w-full max-w-2xl overflow-y-auto">
            <div className="pixel-titlebar">
              <span>Upload Meal</span>
              <button type="button" className="pixel-button bg-[#ffb7df] px-3 py-2" onClick={() => setIsOpen(false)}>
                X
              </button>
            </div>
            <form
              className="space-y-4 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                startTransition(async () => {
                  await addMealAction(formData);
                  setIsOpen(false);
                });
              }}
            >
              <input type="hidden" name="groupId" value={groupId} />
              <input type="hidden" name="mealType" value={mealType} />
              <label className="block space-y-2">
                <span className="pixel-label">Meal Type</span>
                <div className="relative">
                  <button
                    type="button"
                    className="pixel-button flex w-full items-center justify-between bg-[#ffe58f] text-left"
                    onClick={() => setIsMealTypeOpen((current) => !current)}
                    aria-haspopup="listbox"
                    aria-expanded={isMealTypeOpen}
                  >
                    <span>{mealType}</span>
                    <span>{isMealTypeOpen ? "▲" : "▼"}</span>
                  </button>
                  {isMealTypeOpen ? (
                    <div className="pixel-panel absolute left-0 right-0 top-[calc(100%+8px)] z-10 overflow-hidden bg-[#fffdf2]">
                      <div className="flex flex-col">
                        {mealTypes.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={`border-b-4 border-[var(--border)] px-4 py-3 text-left font-[var(--font-pixel)] text-[10px] uppercase last:border-b-0 ${
                              option === mealType ? "bg-[#b7f1de]" : "bg-[#fffdf2]"
                            }`}
                            onClick={() => {
                              setMealType(option);
                              setIsMealTypeOpen(false);
                            }}
                            role="option"
                            aria-selected={option === mealType}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="pixel-label">Items</span>
                  <button type="button" className="pixel-button bg-[#c6b4ff]" onClick={addItem}>
                    + Row
                  </button>
                </div>
                {items.map((item, index) => (
                  <div key={item.id} className="grid gap-3 md:grid-cols-[1fr_1fr]">
                    <input
                      name="itemNames"
                      placeholder={`Food Item ${index + 1}`}
                      className="pixel-input bg-white"
                      value={item.name}
                      onChange={(event) =>
                        setItems((current) =>
                          current.map((entry) =>
                            entry.id === item.id ? { ...entry, name: event.target.value } : entry,
                          ),
                        )
                      }
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="pixel-button bg-white text-center">
                        Gallery
                        <input
                          name="images"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                        />
                      </label>
                      <label className="pixel-button bg-[#b7f1de] text-center">
                        Camera
                        <input
                          name="images"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <button type="submit" className="pixel-button bg-[#ffe58f]">
                {isPending ? "Analyzing..." : "Save Meal"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
