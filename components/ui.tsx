import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...values: Array<string | false | null | undefined>) {
  return twMerge(clsx(values));
}

export function Shell({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("min-h-screen bg-aurora", className)}>
      <div className="mx-auto min-h-screen w-full max-w-[1500px] px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
        {children}
      </div>
    </main>
  );
}

export function Panel({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-[rgba(80,53,38,0.1)] bg-[rgba(255,251,246,0.74)] p-5 shadow-card backdrop-blur md:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const styles = {
    primary: "bg-clay text-white hover:bg-[#a85d3f]",
    secondary: "bg-cedar text-white hover:bg-[#24463d]",
    ghost: "bg-white/70 text-ink hover:bg-white"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold shadow-soft transition focus:outline-none focus:ring-2 focus:ring-clay/30 disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  body
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-[0.32em] text-clay/80">{eyebrow}</p>
      <h2 className="font-display text-2xl leading-tight text-ink sm:text-[2rem]">{title}</h2>
      {body ? <p className="max-w-2xl text-sm leading-7 text-[#6d5a50] sm:text-base">{body}</p> : null}
    </div>
  );
}

