import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent font-semibold tracking-[-0.01em] cursor-pointer transition disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-(--ring)/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-(--primary) text-white hover:bg-(--amber-600)",
        destructive:
          "bg-(--destructive) text-white hover:bg-(--destructive)/90",
        outline:
          "bg-background text-foreground border-input hover:bg-muted",
        secondary:
          "bg-(--ink-900) text-(--bone-50) hover:bg-(--ink-900)/90",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        link: "text-(--primary) underline-offset-4 hover:underline",
      },
      size: {
        default: "text-[15px] py-3 px-[18px]",
        sm: "text-[13px] py-2 px-3",
        lg: "text-[15px] py-3 px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
