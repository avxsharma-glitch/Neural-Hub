"use client"

import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { PlayCircle, GitCommit, Zap, MonitorPlay } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LessonWorkspace() {
    const params = useParams()
    // Mock fetching node details based on ID
    const nodeId = params?.id || "c2"

    return (
        <div className="max-w-4xl mx-auto pb-12">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 text-xs font-mono">NODE_{nodeId}</span>
                        <span className="text-sm text-[var(--color-text-muted)]">Chemistry / Bonding Theory</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Molecular Orbitals</h1>
                </div>

                {/* IDE-like Progress Indicator */}
                <div className="flex gap-1.5">
                    <div className="w-8 h-1.5 rounded-full bg-[var(--color-success)]" />
                    <div className="w-8 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                    <div className="w-8 h-1.5 rounded-full bg-white/10" />
                    <div className="w-8 h-1.5 rounded-full bg-white/10" />
                </div>
            </div>

            {/* Main Content Area */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >

                <div>
                    <h3 className="text-[var(--color-accent)] font-mono text-sm mb-4 flex items-center gap-2">
                        <span className="opacity-50">&gt;</span> 01_concept_exploration
                    </h3>
                    <p className="text-lg leading-relaxed text-[var(--color-text-muted)] pr-8">
                        Molecular orbital (MO) theory describes the electronic structure of molecules using quantum mechanics. Electrons are not assigned to individual bonds between atoms, but are treated as moving under the influence of the nuclei in the whole molecule.
                    </p>
                </div>

                {/* VoyLearning Style Cards Grid */}
                <div className="grid sm:grid-cols-2 gap-4 mt-8">

                    <motion.div whileHover={{ y: -4 }} className="group relative rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-base)] p-6 cursor-pointer overflow-hidden isolate">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="w-12 h-12 rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] flex items-center justify-center mb-4 group-hover:border-white/20 transition-colors">
                            <PlayCircle className="text-white" size={24} />
                        </div>

                        <h4 className="font-semibold text-lg mb-2">Interactive Notes</h4>
                        <p className="text-sm text-[var(--color-text-muted)] mb-6">Review detailed structured notes on Diatomic Molecules with interactive visualizations.</p>

                        <div className="flex items-center justify-between text-sm font-medium border-t border-[var(--color-border)] pt-4 group-hover:text-[var(--color-accent)] transition-colors">
                            Open Workspace <span>→</span>
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -4 }} className="group relative rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-base)] p-6 cursor-pointer overflow-hidden isolate">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="w-12 h-12 rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] flex items-center justify-center mb-4 group-hover:border-[var(--color-success)]/50 transition-colors">
                            <GitCommit className="text-[var(--color-success)]" size={24} />
                        </div>

                        <h4 className="font-semibold text-lg mb-2">Concept Formulas</h4>
                        <div className="font-mono text-sm bg-black/40 px-3 py-2 rounded border border-[var(--color-border)] mb-4 text-[var(--color-accent)] text-center">
                            Ψ_MO = c₁Ψ₁ ± c₂Ψ₂
                        </div>

                        <div className="flex items-center justify-between text-sm font-medium border-t border-[var(--color-border)] pt-4 group-hover:text-[var(--color-success)] transition-colors">
                            View Derivations <span>→</span>
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -4 }} className="group relative rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-base)] p-6 cursor-pointer overflow-hidden isolate">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--color-alert)] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />

                        <div className="w-12 h-12 rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] flex items-center justify-center mb-4 group-hover:border-[var(--color-alert)]/50 transition-colors">
                            <Zap className="text-[var(--color-alert)]" size={24} />
                        </div>

                        <h4 className="font-semibold text-lg mb-2">Micro-Quiz</h4>
                        <p className="text-sm text-[var(--color-text-muted)] mb-6">Test your understanding of constructive and destructive interference in orbitals.</p>

                        <div className="flex items-center justify-between text-sm font-medium border-t border-[var(--color-border)] pt-4 group-hover:text-[var(--color-alert)] transition-colors">
                            Start Quiz (3 min) <span>→</span>
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -4 }} className="group relative rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-base)] p-6 cursor-pointer overflow-hidden isolate">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay pointer-events-none" />

                        <div className="w-12 h-12 rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] flex items-center justify-center mb-4 group-hover:border-purple-400/50 transition-colors">
                            <MonitorPlay className="text-purple-400" size={24} />
                        </div>

                        <h4 className="font-semibold text-lg mb-2">3D Simulator</h4>
                        <p className="text-sm text-[var(--color-text-muted)] mb-6">Launch the 3D WebGL simulator to visualize electron density probability.</p>

                        <div className="flex items-center justify-between text-sm font-medium border-t border-[var(--color-border)] pt-4 group-hover:text-purple-400 transition-colors">
                            Launch Sandbox <span>→</span>
                        </div>
                    </motion.div>

                </div>

            </motion.div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-[var(--color-border)]">
                <Button variant="ghost">← Previous Concept</Button>
                <Button>Complete & Verify Mastery →</Button>
            </div>

        </div>
    )
}
