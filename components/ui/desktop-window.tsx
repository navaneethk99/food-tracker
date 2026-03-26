import { cn } from "@/lib/utils";

type DesktopWindowProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function DesktopWindow({
  title,
  children,
  className,
  contentClassName,
}: DesktopWindowProps) {
  return (
    <section className={cn("pixel-window mobile-window", className)}>
      <div className="pixel-titlebar">
        <span>{title}</span>
        <div className="pixel-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className={cn("p-4 sm:p-5", contentClassName)}>{children}</div>
    </section>
  );
}
