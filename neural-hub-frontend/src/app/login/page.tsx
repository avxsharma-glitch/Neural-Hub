"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        // Simulated authentication routing
        window.location.href = "/dashboard"
    }

    return (
        <main className="relative min-h-screen flex items-center justify-center bg-[var(--color-base)] overflow-hidden">

            {/* Subtle Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[var(--color-accent)] opacity-20 blur-[100px]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <GlassCard className="w-full max-w-md p-8 relative z-10 border-white/10">

                    <div className="text-center mb-8">
                        <span className="text-[var(--color-accent)] font-mono font-bold text-2xl">//</span>
                        <h1 className="text-2xl font-bold text-white tracking-wider mt-2">NEURAL HUB</h1>
                        <p className="text-sm text-[var(--color-text-muted)] mt-2">Authenticate to enter workspace</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider">System ID [Email]</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                                placeholder="developer@neuralhub.app"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Access Token [Password]</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full mt-6 h-11 text-md">
                            Initialize Session →
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-[var(--color-text-muted)] border-t border-white/5 pt-4">
                        <Link href="/" className="hover:text-white transition-colors">
                            ← Return Home
                        </Link>
                    </div>

                </GlassCard>
            </motion.div>
        </main>
    )
}
