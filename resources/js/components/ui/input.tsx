import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex w-full min-w-0 rounded-[8px] border border-input bg-background px-[14px] py-3 text-[15px] text-foreground outline-none transition-[color,border-color,outline]",
        "placeholder:text-muted-foreground",
        "selection:bg-primary selection:text-primary-foreground",
        "focus-visible:border-(--amber-500) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--amber-500)",
        "aria-invalid:border-(--red-500)",
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
