"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full border-b border-[var(--color-border)] bg-[var(--color-base)]/80 backdrop-blur-md z-50">
            <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[var(--color-accent)] font-mono font-bold text-xl">//</span>
                    <span className="text-white font-bold tracking-wider text-lg">NEURAL HUB</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text-muted)]">
                    <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                    <Link href="#workflow" className="hover:text-white transition-colors">Workflow</Link>
                    <Link href="#demo" className="hover:text-white transition-colors">Demo</Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost">Sign In</Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button>Enter Workspace →</Button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
