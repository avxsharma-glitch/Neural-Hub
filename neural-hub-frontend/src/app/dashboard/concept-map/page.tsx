"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import * as THREE from "three"
import { Search, Loader2, AlertTriangle } from "lucide-react"
import { getConceptGraph, type ConceptNode, type ConceptLink } from "@/lib/api"
import Link from "next/link"

// Subject → color mapping (consistent with dashboard)
const SUBJECT_COLORS: Record<string, string> = {
    'Engineering Mathematics I': "#4ade80",
    'Engineering Mathematics II': "#4ade80",
    'Engineering Physics': "#c084fc",
    'Engineering Chemistry': "#58A6FF",
    'Fundamentals of Electrical Engineering': "#f87171",
    'Programming for Problem Solving': "#facc15",
    default: "#94a3b8",
}

function getColor(subjectName: string) {
    return SUBJECT_COLORS[subjectName] ?? SUBJECT_COLORS.default
}

// Stable random 3D position seeded by node id
function seedPosition(id: string): [number, number, number] {
    let h = 0
    for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
    const rand = (s: number) => {
        let x = Math.sin(s + h) * 10000
        return (x - Math.floor(x)) * 2 - 1
    }
    return [rand(1) * 12, rand(2) * 8, rand(3) * 12]
}

interface NodeMeshProps { node: ConceptNode; position: [number, number, number]; isSelected: boolean; onClick: () => void }

function NodeMesh({ node, position, isSelected, onClick }: NodeMeshProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const color = getColor(node.subject)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.08
        }
    })

    return (
        <group position={position}>
            <mesh ref={meshRef} onClick={onClick} scale={isSelected ? 1.4 : 1}>
                <sphereGeometry args={[0.4 + node.importance * 0.3, 24, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isSelected ? 0.6 : 0.2}
                    metalness={0.2}
                    roughness={0.4}
                />
            </mesh>
            <Text
                position={[0, 0.9, 0]}
                fontSize={0.22}
                color="#E6EDF3"
                anchorX="center"
                anchorY="middle"
                maxWidth={3}
                lineHeight={1.4}
            >
                {node.name.length > 18 ? node.name.substring(0, 16) + '…' : node.name}
            </Text>
        </group>
    )
}

function Edge({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
    const geometry = useMemo(() => {
        const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)]
        return new THREE.BufferGeometry().setFromPoints(points)
    }, [start, end])

    return <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "#30363D", opacity: 0.5, transparent: true }))} />
}

function Graph({ nodes, links, selectedId, onSelect, positions }: {
    nodes: ConceptNode[]
    links: ConceptLink[]
    selectedId: string | null
    onSelect: (id: string) => void
    positions: Map<string, [number, number, number]>
}) {
    return (
        <group>
            {links.map((link) => {
                const from = positions.get(link.source)
                const to = positions.get(link.target)
                if (!from || !to) return null
                return <Edge key={link.id} start={from} end={to} />
            })}
            {nodes.map((node) => {
                const pos = positions.get(node.id)
                if (!pos) return null
                return (
                    <NodeMesh
                        key={node.id}
                        node={node}
                        position={pos}
                        isSelected={selectedId === node.id}
                        onClick={() => onSelect(node.id)}
                    />
                )
            })}
        </group>
    )
}

export default function ConceptMapPage() {
    const [nodes, setNodes] = useState<ConceptNode[]>([])
    const [links, setLinks] = useState<ConceptLink[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        getConceptGraph()
            .then(graph => {
                setNodes(graph.nodes)
                setLinks(graph.links)
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [])

    // Stable positions derived from node id
    const positions = useMemo(() => {
        const map = new Map<string, [number, number, number]>()
        nodes.forEach(n => map.set(n.id, seedPosition(n.id)))
        return map
    }, [nodes])

    const filtered = useMemo(() =>
        searchQuery
            ? nodes.filter(n =>
                n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            : nodes,
        [nodes, searchQuery]
    )

    const selectedNode = nodes.find(n => n.id === selectedId)

    return (
        <div className="h-[calc(100vh-5rem)] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between shrink-0 pb-4 border-b border-[var(--color-border)]">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        3D Concept Map
                        {!loading && <span className="ml-3 text-sm font-mono text-[var(--color-text-muted)]">
                            {nodes.length} nodes · {links.length} connections — live
                        </span>}
                    </h1>
                </div>

                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={15} />
                    <input
                        type="text"
                        placeholder="Search concepts..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors text-white"
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 mt-4 p-4 rounded-lg bg-[var(--color-alert)]/10 border border-[var(--color-alert)]/20 text-[var(--color-alert)] text-sm">
                    <AlertTriangle size={16} />
                    Could not load graph data: {error}. Is the backend running at localhost:3001?
                </div>
            )}

            {/* Main: 3D Canvas + Sidebar */}
            <div className="flex-1 flex gap-4 mt-4 min-h-0">

                {/* Three.js Canvas */}
                <div className="flex-1 rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-base)] relative">
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[var(--color-text-muted)] z-10 bg-[var(--color-base)]">
                            <Loader2 size={32} className="animate-spin text-[var(--color-accent)]" />
                            <span className="text-sm">Loading knowledge graph from backend…</span>
                        </div>
                    )}
                    {!loading && nodes.length > 0 && (
                        <Canvas camera={{ position: [0, 5, 18], fov: 60 }}>
                            <ambientLight intensity={0.4} />
                            <pointLight position={[10, 15, 10]} intensity={1} />
                            <OrbitControls enableDamping dampingFactor={0.05} />
                            <Graph
                                nodes={filtered}
                                links={links}
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                                positions={positions}
                            />
                        </Canvas>
                    )}
                    {!loading && nodes.length === 0 && !error && (
                        <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)] text-sm">
                            No concept nodes found in the database.
                        </div>
                    )}
                </div>

                {/* Sidebar: Selected Node or Search Results */}
                <div className="w-72 overflow-y-auto shrink-0 space-y-3">
                    {selectedNode ? (
                        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ background: getColor(selectedNode.subject) }} />
                                <span className="text-xs font-mono text-[var(--color-text-muted)]">{selectedNode.subject}</span>
                            </div>
                            <h3 className="font-semibold text-lg leading-tight">{selectedNode.name}</h3>
                            <div className="flex gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono">Difficulty {selectedNode.difficulty}/5</span>
                                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono">Importance {Math.round(selectedNode.importance * 100)}%</span>
                            </div>
                            {selectedNode.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {selectedNode.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 text-xs rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">{tag}</span>
                                    ))}
                                </div>
                            )}
                            <Link href={`/dashboard/lesson/${selectedNode.id}`}>
                                <div className="w-full text-center mt-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-base)] text-sm font-semibold hover:bg-[var(--color-accent)]/90 transition-colors">
                                    Enter Lesson Node →
                                </div>
                            </Link>
                        </div>
                    ) : (
                        <div className="text-xs text-[var(--color-text-muted)] p-3">
                            Click a node in the 3D graph to inspect it
                        </div>
                    )}

                    {/* Quick node list */}
                    {filtered.slice(0, 20).map(node => (
                        <div
                            key={node.id}
                            onClick={() => setSelectedId(node.id)}
                            className={`rounded-lg border p-3 cursor-pointer transition-all ${selectedId === node.id ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/5' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-white/5'}`}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: getColor(node.subject) }} />
                                <span className="text-sm font-medium truncate">{node.name}</span>
                            </div>
                            <div className="text-xs text-[var(--color-text-muted)] mt-1 truncate">{node.unit}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
