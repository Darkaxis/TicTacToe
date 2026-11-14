import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-tactical-bone bg-tactical-bone text-tactical-obsidian font-semibold",
        cyan: "border-tactical-cyan/50 bg-tactical-cyan/10 text-tactical-cyan",
        crimson:
          "border-tactical-crimson/50 bg-tactical-crimson/10 text-tactical-crimson",
        caution:
          "border-tactical-amber/50 bg-tactical-amber/10 text-tactical-amber",
        outline:
          "border-white/20 bg-tactical-obsidian/80 text-tactical-bone/75",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
