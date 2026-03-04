"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayCircle, Target, Book, Activity, Beaker, Code, Calculator, Loader2, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { getSubjects, type Subject } from "@/lib/api"
import Link from "next/link"

const SUBJECT_COLORS: Record<string, { color: string; bg: string; icon: LucideIcon }> = {
    'Engineering Physics': { color: 'text-purple-400', bg: 'bg-purple-400', icon: Activity },
    'Engineering Chemistry': { color: 'text-[var(--color-accent)]', bg: 'bg-[var(--color-accent)]', icon: Beaker },
    'Engineering Mathematics I': { color: 'text-green-400', bg: 'bg-green-400', icon: Calculator },
    'Engineering Mathematics II': { color: 'text-green-400', bg: 'bg-green-400', icon: Calculator },
    'Programming for Problem Solving': { color: 'text-yellow-400', bg: 'bg-yellow-400', icon: Code },
    default: { color: 'text-sky-400', bg: 'bg-sky-400', icon: Zap },
}

export default function DashboardOverview() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getSubjects(1)
            .then(setSubjects)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="space-y-8 max-w-7xl mx-auto">

            {/* 1. Learning Launcher */}
            <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <PlayCircle className="text-[var(--color-accent)]" size={20} />
                    Continue Learning
                </h2>

                <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-base)] p-8">
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-end">
                        <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-medium">Mathematics I</span>
                                <span className="px-2.5 py-1 rounded bg-[var(--color-alert)]/10 text-[var(--color-alert)] border border-[var(--color-alert)]/20 text-xs font-medium">Difficulty: High</span>
                                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-medium">Est: 45 min</span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Eigenvalues &<br />Eigenvectors</h1>

                            <div className="flex flex-wrap gap-3">
                                <Link href="/dashboard/lesson/c2"><Button className="px-6 h-11 text-[15px]">Start Lesson →</Button></Link>
                                <Link href="/dashboard/pyq"><Button variant="secondary" className="px-6 h-11">View PYQs</Button></Link>
                                <Link href="/dashboard/concept-map"><Button variant="ghost" className="px-6 h-11">Concept Map</Button></Link>
                            </div>

                            <div className="mt-8 max-w-md">
                                <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-2">
                                    <span>Semester 1 Progress</span>
                                    <span className="font-mono text-[var(--color-accent)]">{loading ? '...' : `${subjects.length} subjects loaded`}</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--color-accent)] w-[30%] rounded-full transition-all duration-1000" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Grid Layout for Study Map & Queue */}
            <div className="grid lg:grid-cols-3 gap-8">

                {/* 2. Study Map — Live from API */}
                <section className="lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Target className="text-[var(--color-text-muted)]" size={20} />
                        Study Map
                        {loading && <Loader2 size={14} className="animate-spin text-[var(--color-text-muted)]" />}
                    </h2>

                    {error && (
                        <div className="p-4 rounded-lg bg-[var(--color-alert)]/10 border border-[var(--color-alert)]/20 text-[var(--color-alert)] text-sm mb-4">
                            ⚠ Could not load subjects: {error}. Is the backend running at localhost:3001?
                        </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i} className="p-6 h-36 animate-pulse bg-white/5" />
                            ))
                        ) : (
                            subjects.slice(0, 6).map((subject, i) => {
                                const style = SUBJECT_COLORS[subject.name] ?? SUBJECT_COLORS.default
                                const Icon = style.icon
                                const progress = [65, 22, 80, 0, 45, 10][i] ?? 0
                                return (
                                    <Card key={subject.id} className={`p-6 hover:-translate-y-1 transition-transform cursor-pointer group ${i === 1 ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/5' : ''}`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`flex items-center gap-2 font-semibold ${style.color}`}>
                                                <Icon size={18} />
                                                <span className="text-white">{subject.name.replace('Fundamentals of ', '').replace('Engineering ', '')}</span>
                                            </div>
                                            <div className={`text-xs font-mono ${style.color}`}>{progress}%</div>
                                        </div>
                                        <div className="h-1 w-full bg-black/40 mb-4 rounded-full">
                                            <div className={`h-full ${style.bg} rounded-full transition-all`} style={{ width: `${progress}%` }} />
                                        </div>
                                        <div className="text-xs text-[var(--color-text-muted)] font-mono">{subject.code}</div>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </section>

                {/* 3. Study Queue */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Book className="text-[var(--color-text-muted)]" size={20} />
                        Study Queue
                    </h2>

                    <div className="flex flex-col gap-3">
                        <Link href="/dashboard/lesson/c2">
                            <Card className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer">
                                <div>
                                    <div className="font-medium text-sm mb-1 group-hover:text-[var(--color-accent)] transition-colors">Eigenvalues &amp; Vectors</div>
                                    <div className="text-xs text-[var(--color-accent)] flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" /> Needs Practice
                                    </div>
                                </div>
                                <Button variant="secondary" size="sm">Start</Button>
                            </Card>
                        </Link>

                        <Link href="/dashboard/pyq">
                            <Card className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer border-[var(--color-alert)]/30">
                                <div>
                                    <div className="font-medium text-sm mb-1 group-hover:text-[var(--color-accent)] transition-colors">Cayley-Hamilton Theorem</div>
                                    <div className="text-xs text-[var(--color-alert)] flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-alert)]" /> Weak Area
                                    </div>
                                </div>
                                <Button variant="secondary" size="sm">Practice</Button>
                            </Card>
                        </Link>

                        <Link href="/dashboard/concept-map">
                            <Card className="p-4 flex items-center justify-between opacity-70 hover:opacity-100 transition-all group cursor-pointer">
                                <div>
                                    <div className="font-medium text-sm mb-1 group-hover:text-[var(--color-accent)] transition-colors">Explore Concept Graph</div>
                                    <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)]" /> Interactive 3D Map
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">Open</Button>
                            </Card>
                        </Link>
                    </div>
                </section>

            </div>

        </div>
    )
}
