"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart2, AlertTriangle, Loader2, CheckCircle, TrendingUp } from "lucide-react"
import { getUserAnalytics, type Analytics } from "@/lib/api"

// Mock userId — in a real app this comes from auth context
const DEMO_USER_ID = "demo-user"

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getUserAnalytics(DEMO_USER_ID)
            .then(setAnalytics)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            <div className="border-b border-[var(--color-border)] pb-6">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Mastery Analytics</h1>
                <p className="text-[var(--color-text-muted)]">Live progress data from the backend database.</p>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--color-alert)]/10 border border-[var(--color-alert)]/20 text-[var(--color-alert)] text-sm">
                    <AlertTriangle size={16} />
                    Could not load analytics: {error}. You may not have any study progress recorded yet.
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-24 gap-3 text-[var(--color-text-muted)]">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Loading analytics from backend...</span>
                </div>
            ) : (
                <>
                    {/* Overview Stats */}
                    {analytics && (
                        <div className="grid sm:grid-cols-4 gap-4">
                            {[
                                { label: "Total Topics", value: analytics.overview.totalTopics, icon: BarChart2, color: "text-[var(--color-accent)]" },
                                { label: "Attempted", value: analytics.overview.attemptedTopics, icon: TrendingUp, color: "text-yellow-400" },
                                { label: "Mastered", value: analytics.overview.masteredTopics, icon: CheckCircle, color: "text-green-400" },
                                { label: "Avg Completion", value: `${analytics.overview.avgCompletion}%`, icon: BarChart2, color: "text-purple-400" },
                            ].map(stat => (
                                <Card key={stat.label} className="p-5">
                                    <stat.icon size={20} className={`${stat.color} mb-2`} />
                                    <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                                    <div className="text-xs text-[var(--color-text-muted)] mt-1">{stat.label}</div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Subject Breakdown */}
                    {analytics && Object.keys(analytics.subjectBreakdown).length > 0 && (
                        <Card className="p-6">
                            <h2 className="font-semibold mb-6 flex items-center gap-2">
                                <TrendingUp size={18} className="text-[var(--color-accent)]" />
                                Subject Breakdown
                            </h2>
                            <div className="space-y-4">
                                {Object.entries(analytics.subjectBreakdown).map(([subject, data]) => (
                                    <div key={subject}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium">{subject}</span>
                                            <span className="font-mono text-[var(--color-accent)]">{Math.round(data.avgCompletion)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-700"
                                                style={{ width: `${data.avgCompletion}%` }}
                                            />
                                        </div>
                                        <div className="flex gap-4 mt-1 text-xs text-[var(--color-text-muted)]">
                                            <span>{data.attempted} topics attempted</span>
                                            <span>{data.mastered} mastered</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Empty State */}
                    {(!analytics || (analytics.overview.attemptedTopics === 0 && Object.keys(analytics.subjectBreakdown).length === 0)) && (
                        <div className="flex flex-col items-center justify-center py-24 text-center text-[var(--color-text-muted)]">
                            <BarChart2 size={48} className="mb-4 opacity-20" />
                            <p className="text-lg mb-2">No study progress recorded yet.</p>
                            <p className="text-sm">Start studying lessons and practice questions to see your analytics here.</p>
                            <Button className="mt-8" onClick={() => window.location.href = '/dashboard/practice'}>
                                Start Practice Session
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
