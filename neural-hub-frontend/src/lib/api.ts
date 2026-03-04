// Central API client for NEURAL HUB // AVX frontend
// All backend communication goes through this module

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `API error: ${res.status}`);
    }
    const data = await res.json();
    return data.data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────
export async function register(name: string, email: string, password: string) {
    return apiFetch<{ user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
}

export async function login(email: string, password: string) {
    return apiFetch<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

// ── Subjects ──────────────────────────────────────────────────────────────
export async function getSubjects(semester?: number): Promise<Subject[]> {
    const q = semester ? `?semester=${semester}` : '';
    return apiFetch<Subject[]>(`/api/subjects${q}`);
}

export async function getSubjectUnits(subjectId: string): Promise<Unit[]> {
    return apiFetch<Unit[]>(`/api/subjects/${subjectId}/units`);
}

// ── Topics ────────────────────────────────────────────────────────────────
export async function getTopics(unitId?: string, page = 1): Promise<Topic[]> {
    const q = unitId ? `?unitId=${unitId}&page=${page}` : `?page=${page}`;
    return apiFetch<Topic[]>(`/api/topics${q}`);
}

export async function getTopic(topicId: string): Promise<TopicDetail> {
    return apiFetch<TopicDetail>(`/api/topics/${topicId}`);
}

// ── PYQ ───────────────────────────────────────────────────────────────────
export async function getPYQs(params?: { topicId?: string; year?: number; difficulty?: number; page?: number }) {
    const q = new URLSearchParams();
    if (params?.topicId) q.set('topicId', params.topicId);
    if (params?.year) q.set('year', String(params.year));
    if (params?.difficulty) q.set('difficulty', String(params.difficulty));
    if (params?.page) q.set('page', String(params.page));
    const res = await fetch(`${API_URL}/api/pyq?${q}`);
    return res.json() as Promise<{ data: PYQ[]; pagination: Pagination }>;
}

// ── Practice ──────────────────────────────────────────────────────────────
export async function getRandomPractice(count = 10, difficulty?: number): Promise<PYQ[]> {
    const q = `?count=${count}${difficulty ? `&difficulty=${difficulty}` : ''}`;
    return apiFetch<PYQ[]>(`/api/practice/random${q}`);
}

// ── Concepts (3D Graph) ───────────────────────────────────────────────────
export async function getConceptGraph(): Promise<ConceptGraph> {
    return apiFetch<ConceptGraph>('/api/concepts');
}

// ── Analytics ─────────────────────────────────────────────────────────────
export async function getUserAnalytics(userId: string): Promise<Analytics> {
    return apiFetch<Analytics>(`/api/analytics/user/${userId}`);
}

export async function updateProgress(userId: string, topicId: string, completionPercentage: number) {
    return apiFetch('/api/analytics/progress', {
        method: 'POST',
        body: JSON.stringify({ userId, topicId, completionPercentage }),
    });
}

// ── Type Definitions ──────────────────────────────────────────────────────
export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Subject {
    id: string;
    name: string;
    code: string;
    category: string;
    semester: number;
}

export interface Unit {
    id: string;
    subjectId: string;
    name: string;
    number: number;
}

export interface Topic {
    id: string;
    unitId: string;
    name: string;
    difficulty: number;
    importance: number;
    conceptTags: { id: string; name: string }[];
}

export interface TopicDetail extends Topic {
    unit: Unit & { subject: Subject };
    pyqs: PYQ[];
    outboundLinks: { id: string; targetTopic: { id: string; name: string }; relationshipType: string }[];
    inboundLinks: { id: string; sourceTopic: { id: string; name: string }; relationshipType: string }[];
}

export interface PYQ {
    id: string;
    topicId: string;
    year: number;
    questionText: string;
    difficulty: number;
    topic?: Topic & { unit: Unit & { subject: Subject } };
}

export interface ConceptGraph {
    nodes: ConceptNode[];
    links: ConceptLink[];
}

export interface ConceptNode {
    id: string;
    name: string;
    subject: string;
    subjectCode: string;
    unit: string;
    difficulty: number;
    importance: number;
    tags: string[];
}

export interface ConceptLink {
    id: string;
    source: string;
    target: string;
    type: string;
}

export interface Analytics {
    userId: string;
    overview: {
        totalTopics: number;
        attemptedTopics: number;
        masteredTopics: number;
        avgCompletion: number;
    };
    subjectBreakdown: Record<string, { attempted: number; mastered: number; avgCompletion: number }>;
    recentActivity: Array<{ topicId: string; completionPercentage: number; lastAccessed: string; topic: Topic }>;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}
