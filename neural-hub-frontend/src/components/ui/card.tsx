import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-2xl border border-[var(--color-border)] bg-[var(--color-base)] text-[var(--color-text-primary)] shadow-sm",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl",
            className
        )}
        {...props}
    />
))
GlassCard.displayName = "GlassCard"

export { Card, GlassCard }
