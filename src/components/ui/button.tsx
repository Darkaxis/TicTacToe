import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-mono uppercase tracking-[0.16em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rhodes-cyan disabled:pointer-events-none disabled:opacity-40 select-none overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-rhodes-bone text-rhodes-obsidian font-semibold border border-rhodes-bone hover:bg-rhodes-cyan hover:border-rhodes-cyan hover:text-rhodes-obsidian active:translate-y-[1px]",
        rhodes:
          "bg-rhodes-cyan/10 text-rhodes-cyan border border-rhodes-cyan/60 hover:bg-rhodes-cyan hover:text-rhodes-obsidian active:translate-y-[1px]",
        reunion:
          "bg-rhodes-reunion/10 text-rhodes-reunion border border-rhodes-reunion/60 hover:bg-rhodes-reunion hover:text-rhodes-bone active:translate-y-[1px]",
        destructive:
          "bg-rhodes-reunion text-rhodes-bone border border-rhodes-reunion hover:bg-rhodes-reunion/90",
        outline:
          "border border-white/15 bg-rhodes-slate/90 text-rhodes-bone/85 hover:border-rhodes-cyan/70 hover:text-rhodes-cyan hover:bg-rhodes-panel",
        secondary:
          "bg-rhodes-panel text-rhodes-bone border border-white/10 hover:border-white/30 hover:bg-white/10",
        ghost:
          "text-rhodes-bone/70 hover:bg-white/5 hover:text-rhodes-bone",
        link: "text-rhodes-cyan underline-offset-4 hover:underline",
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

