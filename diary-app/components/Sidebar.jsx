import { motion, AnimatePresence } from 'framer-motion';
import t from '../lib/i18n/es';

const TAG_COLORS = {
    'Event': { bg: '#fef3e2', border: '#C8933A', text: '#7a4e10' },
    'Entity': { bg: '#f0f4ff', border: '#8A9BB5', text: '#3a4a6a' },
    'Sentiment/Trigger': { bg: '#f0fff4', border: '#6B8F71', text: '#2d5a35' },
    'Core Belief': { bg: '#fff0f0', border: '#c0604a', text: '#7a2a1a' },
    'Syntax': { bg: '#f8f0ff', border: '#9a7abf', text: '#4a2a7a' },
};

export default function Sidebar({
    profile, entryCount, tags, mode,
    onActivatePastSelf, onReturnToJournal,
    apiKey, onApiKeyChange,
}) {
    const tagsByType = tags.reduce((acc, t) => {
        if (!acc[t.type]) acc[t.type] = [];
        if (!acc[t.type].includes(t.value)) acc[t.type].push(t.value);
        return acc;
    }, {});

    return (
        <div
            className="h-full flex flex-col gap-6 py-6 px-5 overflow-y-auto"
            style={{ borderRight: '1px solid #e8dfc6', background: '#F5EFE0', minHeight: '100vh' }}
        >
            {/* Logo */}
            <div>
                <h2 className="font-serif text-lg font-medium" style={{ color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}>
                    📖 {t.sidebarTitle}
                </h2>
                {profile?.nameAndLifeStage && (
                    <p className="font-sans text-xs mt-1 truncate" style={{ color: '#9a8870' }}>
                        {profile.nameAndLifeStage.slice(0, 40)}
                    </p>
                )}
            </div>

            <div className="h-px" style={{ background: '#e8dfc6' }} />

            {/* API Key */}
            <div>
                <label className="block font-sans text-xs uppercase tracking-widest mb-1.5" style={{ color: '#9a8870' }}>
                    {t.sidebarApiKey}
                </label>
                <input
                    type="password"
                    value={apiKey}
                    onChange={e => onApiKeyChange(e.target.value)}
                    placeholder="AIza…"
                    className="w-full rounded-lg px-3 py-2 font-sans text-sm"
                    style={{ background: '#fdfbf7', border: '1px solid #e0d5c0', color: '#2D2D2D', outline: 'none' }}
                />
            </div>

            <div className="h-px" style={{ background: '#e8dfc6' }} />

            {/* Entry count */}
            <div className="text-center">
                <motion.span
                    key={entryCount}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="font-serif text-3xl font-bold"
                    style={{ color: '#C8933A', fontFamily: 'Playfair Display, serif' }}
                >
                    {entryCount}
                </motion.span>
                <p className="font-sans text-xs mt-0.5" style={{ color: '#9a8870' }}>
                    {t.diaryEntries}
                </p>
            </div>

            <div className="h-px" style={{ background: '#e8dfc6' }} />

            {/* Mode toggle */}
            {mode === 'journaling' ? (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onActivatePastSelf}
                    disabled={entryCount === 0}
                    className="w-full py-2.5 rounded-xl font-sans text-sm font-medium transition-all"
                    style={{
                        background: entryCount > 0 ? '#1A1A2E' : '#e8dfc6',
                        color: entryCount > 0 ? '#e8d5a3' : '#b8a890',
                        cursor: entryCount > 0 ? 'pointer' : 'not-allowed',
                    }}
                >
                    {t.sidebarPastSelf}
                </motion.button>
            ) : (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onReturnToJournal}
                    className="w-full py-2.5 rounded-xl font-sans text-sm font-medium"
                    style={{ background: '#C8933A', color: '#fff', cursor: 'pointer' }}
                >
                    {t.sidebarReturn}
                </motion.button>
            )}

            {/* Memory Snapshot */}
            {Object.keys(tagsByType).length > 0 && (
                <>
                    <div className="h-px" style={{ background: '#e8dfc6' }} />
                    <div>
                        <p className="font-sans text-xs uppercase tracking-widest mb-3" style={{ color: '#9a8870' }}>
                            🧠 {t.sidebarMemories}
                        </p>
                        <div className="space-y-3">
                            {Object.entries(tagsByType).map(([type, values]) => {
                                const c = TAG_COLORS[type] || { bg: '#f5f5f5', border: '#ccc', text: '#333' };
                                return (
                                    <div key={type}>
                                        <span className="font-sans text-xs font-medium" style={{ color: c.text }}>
                                            {type}
                                        </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {values.slice(0, 5).map((v, i) => (
                                                <span key={i}
                                                    className="inline-block font-sans text-xs rounded-full px-2 py-0.5"
                                                    style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                                                    {v.length > 22 ? v.slice(0, 22) + '…' : v}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            <div className="mt-auto pt-4">
                <p className="font-sans text-xs text-center" style={{ color: '#b8a890' }}>
                    🔒 {t.sidebarPrivacy}
                </p>
            </div>
        </div>
    );
}
