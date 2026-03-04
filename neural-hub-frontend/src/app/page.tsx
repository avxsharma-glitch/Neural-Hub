"use client"

import { Navbar } from "@/components/layout/navbar"
import { HeroSection } from "@/components/landing/hero"
// TODO: Add Features, Workflow, Demo, CTA

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-base)] text-white overflow-x-hidden">
      <Navbar />
      <HeroSection />

      {/* Spacer for Future Sections */}
      <div className="h-40" />
    </main>
  )
}
