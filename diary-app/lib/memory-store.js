/**
 * lib/memory-store.js
 * File-based JSON persistence for the AI of Memories app.
 * Stores profile and journal entries in /data directory (server-side only).
 */
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const ENTRIES_FILE = path.join(DATA_DIR, 'entries.json');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ── Profile ──────────────────────────────────────────────────────────────────

export function getProfile() {
    ensureDataDir();
    if (!fs.existsSync(PROFILE_FILE)) return {};
    try { return JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf-8')); }
    catch { return {}; }
}

export function setProfile(key, value) {
    ensureDataDir();
    const profile = getProfile();
    profile[key] = value;
    profile.updatedAt = new Date().toISOString();
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2));
    return profile;
}

export function setProfileBulk(data) {
    ensureDataDir();
    const profile = { ...getProfile(), ...data, updatedAt: new Date().toISOString() };
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2));
    return profile;
}

export function isOnboardingComplete() {
    return getProfile().onboardingComplete === true;
}

// ── Journal Entries ───────────────────────────────────────────────────────────

export function getEntries() {
    ensureDataDir();
    if (!fs.existsSync(ENTRIES_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(ENTRIES_FILE, 'utf-8')); }
    catch { return []; }
}

export function addEntry({ content, aiResponse, tags = [] }) {
    ensureDataDir();
    const entries = getEntries();
    const entry = {
        id: Date.now(),
        content,
        aiResponse,
        tags,
        createdAt: new Date().toISOString(),
    };
    entries.push(entry);
    fs.writeFileSync(ENTRIES_FILE, JSON.stringify(entries, null, 2));
    return entry;
}

// ── Knowledge Graph Summary ───────────────────────────────────────────────────

export function getKnowledgeSummary() {
    const entries = getEntries();
    if (!entries.length) return 'No memories recorded yet.';

    const grouped = {};
    for (const entry of entries) {
        for (const tag of (entry.tags || [])) {
            if (!grouped[tag.type]) grouped[tag.type] = new Set();
            grouped[tag.type].add(tag.value);
        }
    }

    return Object.entries(grouped)
        .map(([type, vals]) => `[${type}]: ${[...vals].join(' | ')}`)
        .join('\n');
}

export function getAllTags() {
    const entries = getEntries();
    const all = [];
    for (const entry of entries) {
        for (const tag of (entry.tags || [])) {
            all.push({ ...tag, entryId: entry.id, date: entry.createdAt });
        }
    }
    return all;
}

/**
 * Devuelve entradas dentro de un rango de años (inclusive).
 * Si no se especifican, devuelve todas.
 */
export function getEntriesByEra(yearStart = null, yearEnd = null) {
    const entries = getEntries();
    if (!yearStart && !yearEnd) return entries;
    return entries.filter(e => {
        const year = new Date(e.createdAt).getFullYear();
        const okStart = yearStart ? year >= yearStart : true;
        const okEnd = yearEnd ? year <= yearEnd : true;
        return okStart && okEnd;
    });
}

