"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Plus, RefreshCw } from "lucide-react"

export default function AdminPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">

            {/* Alert Banner */}
            <div className="bg-[var(--color-alert)]/10 border border-[var(--color-alert)]/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[var(--color-alert)]">
                    <Database size={20} />
                    <span className="font-semibold text-sm uppercase tracking-wider">System Administrator Mode Active</span>
                </div>
                <div className="text-xs text-[var(--color-alert)] font-mono opacity-80">
                    Access Level: OMEGA
                </div>
            </div>

            <div className="flex justify-between items-end border-b border-[var(--color-border)] pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Curriculum Control Panel</h1>
                    <p className="text-[var(--color-text-muted)]">Manage subjects, concept nodes, edges, and system data.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary"><RefreshCw size={16} className="mr-2" /> Sync Graph</Button>
                    <Button variant="alert"><Plus size={16} className="mr-2" /> New Concept Node</Button>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: "Active Nodes", val: "142" },
                    { label: "Graph Edges", val: "384" },
                    { label: "PYQs Indexed", val: "1,024" },
                    { label: "Users Online", val: "12" },
                ].map(s => (
                    <Card key={s.label} className="p-6">
                        <div className="text-sm text-[var(--color-text-muted)] mb-2 font-mono">{s.label}</div>
                        <div className="text-3xl font-bold">{s.val}</div>
                    </Card>
                ))}
            </div>

            {/* Data Table */}
            <Card className="mt-8 border-[var(--color-alert)]/20">
                <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
                    <h3 className="font-semibold">Recent Node Mutations</h3>
                    <input type="text" placeholder="Search ID..." className="bg-black/40 border border-[var(--color-border)] rounded text-sm px-3 py-1.5 focus:outline-none focus:border-[var(--color-alert)]" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[var(--color-text-muted)] bg-white/5 border-b border-[var(--color-border)] font-mono text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Node ID</th>
                                <th className="px-6 py-4 font-medium">Entity Name</th>
                                <th className="px-6 py-4 font-medium">Subject</th>
                                <th className="px-6 py-4 font-medium">Last Modified</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {[
                                { id: "c2_mo_theory", name: "Molecular Orbitals", sub: "Chemistry", date: "10 mins ago" },
                                { id: "p4_thin_films", name: "Interference in Thin Films", sub: "Physics", date: "2 hours ago" },
                                { id: "m1_linear_alg", name: "Linear Algebra Intro", sub: "Mathematics", date: "1 day ago" },
                            ].map(row => (
                                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-[var(--color-alert)]">{row.id}</td>
                                    <td className="px-6 py-4 font-medium">{row.name}</td>
                                    <td className="px-6 py-4">{row.sub}</td>
                                    <td className="px-6 py-4 text-[var(--color-text-muted)]">{row.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" className="text-[var(--color-text-muted)]">Edit</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

        </div>
    )
}
