import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FASE 1: Zona de Escritura Limpia
 * Interface tipo cuaderno, sin distracciones.
 * Tipografía: Playfair Display
 */
export default function DiaryPage({ profile, onSaved }) {
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const textareaRef = useRef(null);

    // Auto-crecimiento del textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [draft]);

    const hoy = new Date().toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    const nombre = profile?.nameAndLifeStage?.split(/[,\s]/)[0] || 'Mi';

    const handleGuardar = async () => {
        if (!draft.trim() || loading) return;
        setLoading(true);
        setError('');

        try {
            // Recuperar apiKey del localStorage (guardado por el componente de ajustes)
            const apiKey = localStorage.getItem('gemini_api_key') || '';

            const res = await fetch('/api/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: draft.trim(), history: [], apiKey }),
            });
            const data = await res.json();

            if (data.entry) {
                onSaved(data.entry); // → pasa a Fase 2
            } else {
                setError(data.error || 'Error al guardar. Inténtalo de nuevo.');
                setLoading(false);
            }
        } catch {
            setError('Error de conexión. Inténtalo de nuevo.');
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-start py-16 px-6"
            style={{
                background: 'linear-gradient(170deg, #fdfbf7 0%, #f7f1e5 100%)',
                // Textura de papel
                backgroundImage: `
          linear-gradient(170deg, #fdfbf7 0%, #f7f1e5 100%),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")
        `,
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="w-full max-w-2xl"
            >
                {/* ── Cabecera del cuaderno ───────────────────────────── */}
                <header className="mb-10">
                    <p style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.18em',
                        color: '#b8a890',
                        marginBottom: '8px',
                    }}>
                        {hoy}
                    </p>
                    <h1 style={{
                        fontFamily: 'Playfair Display, Georgia, serif',
                        fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                        fontWeight: 400,
                        color: '#1A1208',
                        lineHeight: 1.15,
                        letterSpacing: '-0.015em',
                    }}>
                        Diario de {nombre}
                    </h1>
                    <div style={{ height: '1px', background: 'linear-gradient(to right, #d4c9b0, transparent)', marginTop: '20px' }} />
                </header>

                {/* ── Zona de escritura (cuaderno con líneas) ────────── */}
                <div
                    style={{
                        background: '#fff',
                        border: '1px solid #e0d8c3',
                        borderRadius: '4px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.07), inset 0 0 0 1px rgba(255,255,255,0.8)',
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    {/* Línea roja de margen */}
                    <div style={{
                        position: 'absolute', left: '52px', top: 0, bottom: 0,
                        width: '1px', background: 'rgba(200, 80, 60, 0.15)', pointerEvents: 'none',
                    }} />

                    {/* Fecha dentro del cuaderno */}
                    <div style={{ padding: '20px 24px 0 24px', borderBottom: '1px solid #f0e8d8' }}>
                        <span style={{
                            fontFamily: 'Caveat, cursive',
                            fontSize: '1.1rem',
                            color: '#C8933A',
                            letterSpacing: '0.02em',
                        }}>
                            {hoy}
                        </span>
                    </div>

                    {/* Textarea */}
                    <div style={{
                        backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 34px, rgba(200,185,155,0.45) 34px, rgba(200,185,155,0.45) 35px)',
                        backgroundPositionY: '4px',
                        padding: '8px 24px 24px',
                        minHeight: '320px',
                    }}>
                        <textarea
                            ref={textareaRef}
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            disabled={loading}
                            placeholder="¿Qué pasó hoy? Escribe libremente…"
                            style={{
                                width: '100%',
                                fontFamily: 'Playfair Display, Georgia, serif',
                                fontSize: '1.125rem',
                                lineHeight: '35px',
                                color: '#1a1208',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                resize: 'none',
                                minHeight: '280px',
                                paddingLeft: '52px',
                                paddingTop: '8px',
                                caretColor: '#C8933A',
                                letterSpacing: '0.012em',
                            }}
                        />
                    </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#c0604a', marginTop: '10px' }}
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                {/* ── Botón principal ─────────────────────────────────── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <motion.button
                        onClick={handleGuardar}
                        disabled={!draft.trim() || loading}
                        whileHover={draft.trim() && !loading ? { scale: 1.03, y: -2 } : {}}
                        whileTap={draft.trim() && !loading ? { scale: 0.96 } : {}}
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            letterSpacing: '0.04em',
                            padding: '0.65rem 2rem',
                            borderRadius: '999px',
                            border: 'none',
                            cursor: draft.trim() && !loading ? 'pointer' : 'not-allowed',
                            background: draft.trim() && !loading
                                ? 'linear-gradient(135deg, #d4a045 0%, #c8933a 60%, #b87d28 100%)'
                                : '#e8dfc6',
                            color: draft.trim() && !loading ? '#fff' : '#b8a890',
                            boxShadow: draft.trim() && !loading
                                ? '0 2px 14px rgba(200,147,58,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                                : 'none',
                            transition: 'all 0.2s',
                        }}
                    >
                        {loading ? '✒ Guardando…' : '✦ Guardar y Reflexionar'}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
