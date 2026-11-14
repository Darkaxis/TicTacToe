import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-mono uppercase tracking-[0.16em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tactical-cyan disabled:pointer-events-none disabled:opacity-40 select-none overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-tactical-bone text-tactical-obsidian font-semibold border border-tactical-bone hover:bg-tactical-cyan hover:border-tactical-cyan hover:text-tactical-obsidian active:translate-y-[1px]",
        cyan:
          "bg-tactical-cyan/10 text-tactical-cyan border border-tactical-cyan/60 hover:bg-tactical-cyan hover:text-tactical-obsidian active:translate-y-[1px]",
        crimson:
          "bg-tactical-crimson/10 text-tactical-crimson border border-tactical-crimson/60 hover:bg-tactical-crimson hover:text-tactical-bone active:translate-y-[1px]",
        destructive:
          "bg-tactical-crimson text-tactical-bone border border-tactical-crimson hover:bg-tactical-crimson/90",
        outline:
          "border border-white/15 bg-tactical-slate/90 text-tactical-bone/85 hover:border-tactical-cyan/70 hover:text-tactical-cyan hover:bg-tactical-panel",
        secondary:
          "bg-tactical-panel text-tactical-bone border border-white/10 hover:border-white/30 hover:bg-white/10",
        ghost:
          "text-tactical-bone/70 hover:bg-white/5 hover:text-tactical-bone",
        link: "text-tactical-cyan underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 px-2.5 text-[10px]",
        lg: "h-11 px-6 text-xs",
        icon: "h-9 w-9",
      },
      chamfer: {
        none: "",
        sm: "clip-chamfer-sm",
        md: "clip-chamfer-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      chamfer: "sm",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, chamfer, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, chamfer, className }))}
        ref={ref}
        {...props}
      >
        <span className="pointer-events-none absolute top-0 left-0 h-1.5 w-1.5 border-t border-l border-current opacity-50" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-1.5 w-1.5 border-b border-r border-current opacity-50" />
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
