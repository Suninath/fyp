import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-purple text-white hover:bg-purple-600 shadow-lg hover:shadow-purple/50",
        destructive:
          "bg-red text-white hover:bg-red-600 shadow-lg hover:shadow-red/50",
        outline:
          "border-2 border-gray-300 bg-white text-gray-700 hover:bg-purple-50 hover:border-purple hover:text-purple transition-all",
        secondary:
          "bg-blue text-white hover:bg-blue-600 shadow-md hover:shadow-blue/50",
        ghost: "hover:bg-purple-50 hover:text-purple transition-all",
        link: "text-purple underline-offset-4 hover:underline hover:opacity-80",
        success: "bg-green text-white hover:bg-green-600 shadow-lg hover:shadow-green/50",
        warning: "bg-amber text-white hover:bg-amber-600 shadow-lg hover:shadow-amber/50",
        info: "bg-blue text-white hover:bg-blue-600 shadow-lg hover:shadow-blue/50",
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
