import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "secondary" | "ghost" | "alert" | "outline"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90 shadow-lg shadow-[var(--color-accent)]/20": variant === "default",
                        "bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-white/5": variant === "secondary",
                        "hover:bg-white/5 text-[var(--color-text-primary)]": variant === "ghost",
                        "bg-[var(--color-alert)] text-white hover:bg-[var(--color-alert)]/90": variant === "alert",
                        "border border-[var(--color-border)] bg-transparent hover:bg-white/5 text-[var(--color-text-primary)]": variant === "outline",
                        "h-9 px-4 py-2": size === "default",
                        "h-8 rounded-md px-3 text-xs": size === "sm",
                        "h-10 rounded-md px-8": size === "lg",
                        "h-9 w-9": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
