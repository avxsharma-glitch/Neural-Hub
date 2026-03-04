"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Timer, Shuffle, AlertTriangle, Loader2, CheckCircle, ChevronRight } from "lucide-react"
import { getRandomPractice, type PYQ } from "@/lib/api"

export default function PracticePage() {
    const [questions, setQuestions] = useState<PYQ[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentIdx, setCurrentIdx] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)
    const [answered, setAnswered] = useState<Set<string>>(new Set())

    const fetchQuestions = async (count = 10, difficulty?: number) => {
        setLoading(true)
        setError(null)
        setCurrentIdx(0)
        setAnswered(new Set())
        setShowAnswer(false)
        try {
            const data = await getRandomPractice(count, difficulty)
            setQuestions(data)
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to load questions')
        } finally {
            setLoading(false)
        }
    }

    const markAnswered = () => {
        setAnswered(prev => new Set([...prev, questions[currentIdx].id]))
        setShowAnswer(false)
        if (currentIdx < questions.length - 1) setCurrentIdx(i => i + 1)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Practice Arena</h1>
                <p className="text-[var(--color-text-muted)]">Test your knowledge with questions from the live database.</p>
            </div>

            {/* Mode Selection — visible when no questions loaded */}
            {questions.length === 0 && !loading && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-8 border-[var(--color-accent)]/20 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-base)] relative overflow-hidden group">
                        <div className="absolute -right-12 -top-12 opacity-5 group-hover:opacity-10 transition-opacity"><Target size={180} /></div>
                        <Target className="text-[var(--color-accent)] mb-6" size={32} />
                        <h2 className="text-xl font-semibold mb-2">Medium Difficulty</h2>
                        <p className="text-[var(--color-text-muted)] mb-8">10 questions at medium difficulty from the database.</p>
                        <Button onClick={() => fetchQuestions(10, 3)}>Start Practice (Medium) →</Button>
                    </Card>

                    <Card className="p-8 border-[var(--color-alert)]/20 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-base)] relative overflow-hidden group">
                        <div className="absolute -right-12 -top-12 opacity-5 group-hover:opacity-10 transition-opacity"><Timer size={180} /></div>
                        <Timer className="text-[var(--color-alert)] mb-6" size={32} />
                        <h2 className="text-xl font-semibold mb-2">Hard Challenge</h2>
                        <p className="text-[var(--color-text-muted)] mb-8">Push your limits with the hardest questions.</p>
                        <Button variant="alert" onClick={() => fetchQuestions(5, 4)}>Start Hard Mode →</Button>
                    </Card>

                    <Card className="p-8 border-purple-500/20 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-base)] relative overflow-hidden group md:col-span-2 flex flex-col items-center text-center">
                        <Shuffle className="text-purple-400 mb-6" size={32} />
                        <h2 className="text-xl font-semibold mb-2">Random Mix</h2>
                        <p className="text-[var(--color-text-muted)] mb-8 max-w-md">Random questions from across the entire knowledge graph.</p>
                        <Button className="bg-purple-600 hover:bg-purple-700 px-12" onClick={() => fetchQuestions(10)}>
                            Generate 10 Random Questions
                        </Button>
                    </Card>
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center py-24 gap-3 text-[var(--color-text-muted)]">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Loading questions from backend...</span>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--color-alert)]/10 border border-[var(--color-alert)]/20 text-[var(--color-alert)] text-sm">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}

            {/* Active Question Card */}
            {questions.length > 0 && !loading && (
                <div className="space-y-6">
                    {/* Progress Header */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-[var(--color-text-muted)] font-mono">
                            Question {currentIdx + 1} / {questions.length}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle size={14} className="text-green-400" />
                            <span className="text-green-400 font-mono">{answered.size} answered</span>
                        </div>
                    </div>
                    <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500"
                            style={{ width: `${(answered.size / questions.length) * 100}%` }}
                        />
                    </div>

                    {/* Active Question */}
                    {currentIdx < questions.length ? (
                        <Card className="p-8">
                            <div className="flex gap-3 flex-wrap mb-6">
                                <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono">AKTU {questions[currentIdx].year}</span>
                                <span className="px-2.5 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 rounded text-xs font-mono">
                                    Difficulty {questions[currentIdx].difficulty}
                                </span>
                            </div>

                            <h3 className="text-xl font-medium leading-relaxed mb-8">{questions[currentIdx].questionText}</h3>

                            {showAnswer && (
                                <div className="mb-6 p-4 rounded-lg bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 text-sm text-[var(--color-text-muted)]">
                                    💡 Attempt to solve this step-by-step. Review theory in the Lesson Workspace.
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t border-white/5 pt-6 gap-4">
                                <Button
                                    variant="ghost"
                                    className="text-[var(--color-text-muted)]"
                                    onClick={() => setShowAnswer(!showAnswer)}
                                >
                                    {showAnswer ? 'Hide hint' : 'Show hint'}
                                </Button>
                                <div className="flex gap-3">
                                    <Button variant="secondary" onClick={markAnswered}>
                                        Answered <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-12 text-center">
                            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
                            <p className="text-[var(--color-text-muted)] mb-8">
                                You answered {answered.size} of {questions.length} questions.
                            </p>
                            <Button onClick={() => { setQuestions([]); setCurrentIdx(0); setAnswered(new Set()); }}>
                                Start New Session
                            </Button>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}
