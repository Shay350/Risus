import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--foreground)] text-white hover:bg-slate-800 focus-visible:ring-[var(--ring)]",
        secondary:
          "bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-teal-700 focus-visible:ring-[var(--ring)]",
        outline:
          "border border-[var(--border-strong)] bg-white text-[var(--foreground)] hover:bg-slate-50 focus-visible:ring-[var(--ring)]",
        ghost:
          "text-[var(--foreground)] hover:bg-white/80 focus-visible:ring-[var(--ring)]",
        danger:
          "bg-[var(--danger)] text-white hover:bg-red-700 focus-visible:ring-[rgba(180,35,24,0.18)]",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 px-5 text-sm",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
