import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white hover:bg-primary-600",
        secondary:
          "border-transparent bg-secondary text-white hover:bg-secondary-600",
        destructive:
          "border-transparent bg-destructive text-white hover:bg-destructive-600",
        success:
          "border-transparent bg-success text-white hover:bg-success-600",
        warning:
          "border-transparent bg-warning text-white hover:bg-warning-600",
        outline: "text-gray-700 border-gray-300 bg-white hover:border-primary-300 hover:text-primary",
        "primary-soft":
          "border-primary-200 bg-primary-100 text-primary-700",
        "secondary-soft":
          "border-secondary-200 bg-secondary-100 text-secondary-700",
        "success-soft":
          "border-success-200 bg-success-100 text-success-700",
        "warning-soft":
          "border-warning-200 bg-warning-100 text-warning-700",
        "destructive-soft":
          "border-destructive-200 bg-destructive-100 text-destructive-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
