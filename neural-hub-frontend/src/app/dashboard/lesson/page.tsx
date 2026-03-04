"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Search, Network } from "lucide-react"
import Link from "next/link"

export default function LessonsDirectoryPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-8">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Lesson Directory</h1>
                    <p className="text-[var(--color-text-muted)]">Browse and search for specific concept nodes to study.</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
                        <input
                            type="text"
                            placeholder="Search concepts..."
                            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors text-white"
                        />
                    </div>
                    <Link href="/dashboard/concept-map">
                        <Button variant="outline" className="gap-2">
                            <Network size={16} /> Map View
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Mock Data Cards */}
                {[
                    { id: "c2", title: "Molecular Orbitals", subject: "Chemistry", desc: "Understand quantum mechanical behavior of electrons in molecules." },
                    { id: "p4", title: "Interference in Thin Films", subject: "Physics", desc: "Study the wave nature of light and phase differences." },
                    { id: "m3", title: "Eigenvalues & Vectors", subject: "Mathematics", desc: "Linear transformations and characteristic equations." },
                    { id: "m1", title: "Linear Algebra Basics", subject: "Mathematics", desc: "Introduction to vector spaces and matrices." },
                    { id: "p1", title: "Wave Optics", subject: "Physics", desc: "Huygens' principle and wave theory propagation." },
                    { id: "c1", title: "Quantum Chemistry", subject: "Chemistry", desc: "The Schrödinger equation and basic quantum models." }
                ].map(node => (
                    <Card key={node.id} className="p-6 flex flex-col hover:-translate-y-1 transition-transform group cursor-pointer relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="text-[var(--color-accent)]" size={20} />
                            <span className="text-xs font-mono text-[var(--color-text-muted)]">{node.subject}</span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{node.title}</h3>
                        <p className="text-sm text-[var(--color-text-muted)] mb-6 flex-1">{node.desc}</p>
                        <div className="flex items-center justify-between text-sm font-medium border-t border-[var(--color-border)] pt-4">
                            <span className="text-xs font-mono text-[var(--color-text-muted)] group-hover:text-white transition-colors">NODE_{node.id}</span>
                            <Link href={`/dashboard/lesson/${node.id}`}>
                                <span className="text-[var(--color-accent)] flex items-center gap-1 group-hover:underline">
                                    Enter Node →
                                </span>
                            </Link>
                        </div>
                    </Card>
                ))}

            </div>
        </div>
    )
}
