"use client";

import { useEffect, useRef, useState } from "react";

const DOUBLE_TAP_DELAY_MS = 300;

export function ImageLightbox({
  src,
  alt,
  className,
  overlayImageClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  overlayImageClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const lastTapTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const openLightbox = () => {
    setIsOpen(true);
  };

  const handleTouchEnd = () => {
    const now = Date.now();
    const lastTapTime = lastTapTimeRef.current;

    if (lastTapTime && now - lastTapTime <= DOUBLE_TAP_DELAY_MS) {
      openLightbox();
      lastTapTimeRef.current = null;
      return;
    }

    lastTapTimeRef.current = now;
  };

  return (
    <>
      <button
        type="button"
        onDoubleClick={openLightbox}
        onTouchEnd={handleTouchEnd}
        className="block w-full cursor-zoom-in appearance-none border-0 bg-transparent p-0 text-left touch-manipulation"
        aria-label={`Open full image for ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={className} />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(46,25,83,0.92)] p-4 sm:p-6"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            type="button"
            className="absolute right-4 top-4 pixel-button bg-[#ffe58f] px-3 py-2"
            onClick={() => setIsOpen(false)}
            aria-label="Close image viewer"
          >
            Close
          </button>
          <div
            className="flex max-h-full max-w-full items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className={overlayImageClassName ?? "max-h-[85vh] max-w-[92vw] object-contain"}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
