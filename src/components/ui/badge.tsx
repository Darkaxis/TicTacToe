import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-rhodes-bone bg-rhodes-bone text-rhodes-obsidian font-semibold",
        rhodes:
          "border-rhodes-cyan/50 bg-rhodes-cyan/10 text-rhodes-cyan",
        reunion:
          "border-rhodes-reunion/50 bg-rhodes-reunion/10 text-rhodes-reunion",
        caution:
          "border-rhodes-amber/50 bg-rhodes-amber/10 text-rhodes-amber",
        outline:
          "border-white/20 bg-rhodes-obsidian/80 text-rhodes-bone/75",
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

