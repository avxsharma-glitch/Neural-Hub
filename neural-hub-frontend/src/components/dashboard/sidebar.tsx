"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
// We installed lucide-react earlier
import {
    LayoutDashboard,
    BookOpen,
    Network,
    PenTool,
    Archive,
    LineChart,
    Settings
} from "lucide-react"

const NAV_ITEMS = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "3D Concept Map", href: "/dashboard/concept-map", icon: Network },
    { name: "Lessons", href: "/dashboard/lesson", icon: BookOpen },
    { name: "Practice", href: "/dashboard/practice", icon: PenTool },
    { name: "PYQ Archive", href: "/dashboard/pyq", icon: Archive },
    { name: "Analytics", href: "/dashboard/analytics", icon: LineChart },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] h-screen flex flex-col flex-shrink-0">

            <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-accent)] font-mono font-bold mr-2">//</span>
                <span className="font-bold tracking-wide">NEURAL HUB</span>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                                    : "text-[var(--color-text-muted)] hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon size={18} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-3 border-t border-[var(--color-border)]">
                <Link
                    href="/dashboard/admin"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        pathname.startsWith("/dashboard/admin")
                            ? "bg-[var(--color-alert)]/10 text-[var(--color-alert)]"
                            : "text-[var(--color-text-muted)] hover:text-white hover:bg-white/5"
                    )}
                >
                    <Settings size={18} />
                    Admin Panel
                </Link>
            </div>

        </aside>
    )
}
