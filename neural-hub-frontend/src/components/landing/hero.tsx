"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

            {/* Background Gradients */}
            <div className="absolute inset-0 w-full h-full bg-[var(--color-base)] -z-20" />
            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--color-accent)]/20 via-[var(--color-base)] to-[var(--color-base)] -z-10" />

            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-[var(--color-text-muted)] mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-[var(--color-accent)]"></span>
                        v2.0 Architecture Live
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight mb-6">
                        A developer-grade <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-blue-400">
                            learning workspace.
                        </span>
                    </h1>

                    <p className="text-lg lg:text-xl text-[var(--color-text-muted)] mb-10 max-w-xl">
                        Master engineering concepts with interactive 3D graphs, personalized study queues, and a professional workspace that respects your focus.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/dashboard">
                            <Button size="lg" className="w-full sm:w-auto text-md px-8 h-12">
                                Start Learning Now
                            </Button>
                        </Link>
                        <Button variant="outline" size="lg" className="w-full sm:w-auto text-md px-8 h-12">
                            View Documentation
                        </Button>
                    </div>
                </motion.div>

                {/* Right Content - Abstract UI Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative lg:h-[600px] flex items-center justify-center perspective-1000"
                >
                    {/* Floating UI Cards */}
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                            rotateX: [10, 15, 10],
                            rotateY: [-10, -5, -10]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative w-full max-w-md aspect-[4/3] rounded-xl border border-white/10 bg-[var(--color-surface)]/80 backdrop-blur-xl shadow-2xl p-6 transform-gpu"
                    >
                        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="h-4 w-1/3 bg-white/5 rounded" />
                            <div className="h-24 w-full bg-white/5 rounded border border-white/5" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-20 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 rounded" />
                                <div className="h-20 bg-white/5 rounded" />
                            </div>
                        </div>

                        {/* Floating Element 2 */}
                        <motion.div
                            animate={{ y: [0, 15, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -right-12 -bottom-12 w-48 h-48 bg-[var(--color-surface)] border border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-md"
                        >
                            <div className="flex flex-col h-full justify-between">
                                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)]">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                </div>
                                <div>
                                    <div className="text-xs text-[var(--color-text-muted)] mb-1">Mastery Score</div>
                                    <div className="text-2xl font-mono font-bold text-white">92.4%</div>
                                </div>
                            </div>
                        </motion.div>

                    </motion.div>
                </motion.div>

            </div>
        </section>
    )
}
