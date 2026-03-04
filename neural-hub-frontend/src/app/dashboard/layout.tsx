import { Sidebar } from "@/components/dashboard/sidebar"
import { Search } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-base)] text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">

                {/* Topbar */}
                <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-8 flex justify-between items-center shrink-0">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
                        <input
                            type="text"
                            placeholder="Search syllabus, notes, problems..."
                            className="w-full bg-[var(--color-base)] border border-[var(--color-border)] rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                            System Status:
                            <div className="w-2 h-2 rounded-full bg-[var(--color-success)] shadow-[0_0_8px_var(--color-success)]" />
                            Online
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-blue-600 flex items-center justify-center font-bold text-xs ml-4">
                            S1
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-8 relative">
                    {children}
                </main>

            </div>
        </div>
    )
}
