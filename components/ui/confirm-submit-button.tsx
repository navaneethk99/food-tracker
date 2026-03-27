"use client";

import { useState } from "react";
import type { ButtonHTMLAttributes, MouseEvent } from "react";

export function ConfirmSubmitButton({
  confirmMessage,
  children,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmMessage: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingForm, setPendingForm] = useState<HTMLFormElement | null>(null);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    setPendingForm(event.currentTarget.form);
    setIsOpen(true);
  }

  function handleConfirm() {
    setIsOpen(false);
    pendingForm?.requestSubmit();
  }

  function handleCancel() {
    setIsOpen(false);
    setPendingForm(null);
  }

  return (
    <>
      <button type="submit" onClick={handleClick} {...props}>
        {children}
      </button>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2e1953]/40 p-3 sm:p-4">
          <div className="pixel-window w-full max-w-sm">
            <div className="pixel-titlebar">
              <span>Confirm Delete</span>
              <button type="button" className="pixel-button bg-[#c6b4ff] px-3 py-1" onClick={handleCancel}>
                X
              </button>
            </div>
            <div className="space-y-4 p-4">
              <div className="pixel-panel p-3">
                <p className="text-sm sm:text-base">{confirmMessage}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" className="pixel-button flex-1 bg-white" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="button" className="pixel-button flex-1 bg-[#ffb7df]" onClick={handleConfirm}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
