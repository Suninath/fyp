import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-600 shadow-sm hover:shadow-md",
        destructive:
          "bg-destructive text-white hover:bg-destructive-600 shadow-sm hover:shadow-md",
        outline:
          "border-2 border-gray-300 bg-white text-gray-700 hover:bg-primary-50 hover:border-primary hover:text-primary transition-all",
        secondary:
          "bg-secondary text-white hover:bg-secondary-600 shadow-sm hover:shadow-md",
        ghost: "hover:bg-primary-50 hover:text-primary transition-all",
        link: "text-primary underline-offset-4 hover:underline hover:opacity-80",
        success: "bg-success text-white hover:bg-success-600 shadow-sm hover:shadow-md",
        warning: "bg-warning text-white hover:bg-warning-600 shadow-sm hover:shadow-md",
        info: "bg-secondary text-white hover:bg-secondary-600 shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
