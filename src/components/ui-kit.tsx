import { cn } from "@/lib/utils";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
};

const base =
  "group inline-flex items-center justify-center gap-2 rounded-md font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-subtle hover:-translate-y-px hover:bg-primary/90 hover:shadow-panel",
  secondary:
    "border border-border-strong bg-card text-foreground shadow-subtle hover:-translate-y-px hover:bg-accent hover:shadow-panel",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-accent",
} as const;

/** Arrow that nudges forward when its parent Button is hovered. */
export function Arrow({ back = false }: { back?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={
        "inline-block transition-transform duration-200 ease-out " +
        (back ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5")
      }
    >
      {back ? "←" : "→"}
    </span>
  );
}

const sizes = {
  md: "h-9 px-3.5 text-sm",
  lg: "h-11 px-5 text-[0.95rem]",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const control =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-subtle transition-[border-color,box-shadow] duration-200 hover:border-border-strong focus:border-ring focus:shadow-[0_0_0_3px_var(--color-accent)] focus:outline-none";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-10", className)} {...props} />;
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, "h-10", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-24 resize-y", className)} {...props} />;
}
