import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-market-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-md border border-market-border bg-market-surface px-3.5 py-2.5 text-sm text-market-text placeholder:text-market-muted transition-colors focus:border-market-accent focus:outline-none focus:ring-1 focus:ring-market-accent/30",
            error && "border-market-down focus:border-market-down",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-market-down">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
