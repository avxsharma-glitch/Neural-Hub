"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Archive, Loader2, AlertTriangle } from "lucide-react"
import { getPYQs, type PYQ } from "@/lib/api"

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
    1: { label: "Very Easy", color: "text-green-400 bg-green-400/10 border-green-400/20" },
    2: { label: "Easy", color: "text-green-400 bg-green-400/10 border-green-400/20" },
    3: { label: "Medium", color: "text-[var(--color-accent)] bg-[var(--color-accent)]/10 border-[var(--color-accent)]/20" },
    4: { label: "Hard", color: "text-[var(--color-alert)] bg-[var(--color-alert)]/10 border-[var(--color-alert)]/20" },
    5: { label: "Very Hard", color: "text-[var(--color-alert)] bg-[var(--color-alert)]/10 border-[var(--color-alert)]/20" },
}

export default function PYQPage() {
    const [pyqs, setPyqs] = useState<PYQ[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [difficulty, setDifficulty] = useState<number | undefined>(undefined)
    const [expanded, setExpanded] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        getPYQs({ difficulty })
            .then(res => setPyqs(res.data))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [difficulty])

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">PYQ Intelligence Archive</h1>
                    <p className="text-[var(--color-text-muted)]">
                        {loading ? 'Loading questions...' : `${pyqs.length} questions from live database`}
                    </p>
                </div>

                <div className="flex gap-4">
                    <select
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] text-sm rounded-md px-3 py-2 text-white focus:outline-none focus:border-[var(--color-accent)]"
                        onChange={e => setDifficulty(e.target.value ? parseInt(e.target.value) : undefined)}
                    >
                        <option value="">Difficulty: Any</option>
                        <option value="1">Level 1-2 (Easy)</option>
                        <option value="3">Level 3 (Medium)</option>
                        <option value="4">Level 4 (Hard)</option>
                        <option value="5">Level 5 (Very Hard)</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--color-alert)]/10 border border-[var(--color-alert)]/20 text-[var(--color-alert)] text-sm">
                    <AlertTriangle size={16} />
                    Backend connection failed: {error}
                </div>
            )}

            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="p-6 h-40 animate-pulse bg-white/5" />
                    ))
                ) : pyqs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-[var(--color-text-muted)]">
                        <Archive size={48} className="mb-4 opacity-30" />
                        <p>No questions found for this filter.</p>
                    </div>
                ) : (
                    pyqs.map(pyq => {
                        const diff = DIFFICULTY_LABELS[pyq.difficulty] ?? { label: "Unknown", color: "text-white" }
                        return (
                            <Card key={pyq.id} className="p-6 md:p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-3 flex-wrap">
                                        <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono">
                                            AKTU {pyq.year}–{pyq.year + 1}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded text-xs font-mono border ${diff.color}`}>
                                            {diff.label}
                                        </span>
                                        {pyq.topic && (
                                            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-[var(--color-text-muted)]">
                                                {pyq.topic.unit?.subject?.name ?? 'General'}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-mono text-[var(--color-text-muted)] hidden sm:block">
                                        {pyq.topic?.name ?? 'Topic'}
                                    </span>
                                </div>

                                <h3 className="text-xl font-medium leading-relaxed mb-8">{pyq.questionText}</h3>

                                <div className="flex items-center justify-between border-t border-white/5 pt-6">
                                    <Button
                                        variant="ghost"
                                        className="text-[var(--color-text-muted)]"
                                        onClick={() => setExpanded(expanded === pyq.id ? null : pyq.id)}
                                    >
                                        {expanded === pyq.id ? "Hide Hint ↑" : "Reveal Hint ↓"}
                                    </Button>
                                    <Button variant="secondary">Solve in Practice →</Button>
                                </div>

                                {expanded === pyq.id && (
                                    <div className="mt-4 p-4 rounded-lg bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 text-sm text-[var(--color-text-muted)]">
                                        💡 This question relates to <strong className="text-white">{pyq.topic?.name}</strong>.
                                        Review the concept tags and solve step-by-step.
                                    </div>
                                )}
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
