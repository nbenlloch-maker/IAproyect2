import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ROCCO_AVATAR = '/rocco_avatar.png'; // Cambiado a .png que es el que generamos

// ── Animaciones ───────────────────────────────────────────────────────────────
const breatheVariants = {
    idle: { scale: [1, 1.04, 1], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } },
    loading: { scale: [1, 1.12, 0.94, 1.08, 1], y: [0, -6, 0, -4, 0], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' } },
};

// ── Eras disponibles ──────────────────────────────────────────────────────────
const ERAS = [
    { id: 'all', label: 'Toda mi vida', start: null, end: null, icon: '🌈' },
    { id: '2010', label: 'Juventud (2010)', start: 2010, end: 2010, icon: '🎓' },
    { id: '2015', label: 'Peak Amsterdam (2015)', start: 2015, end: 2015, icon: '🌷' },
    { id: '2020', label: 'Confinamiento (2020)', start: 2020, end: 2020, icon: '🏠' },
    { id: '2026', label: 'Valencia Hoy (2026)', start: 2026, end: 2026, icon: '☀️' },
];

// ── Avatar de Rocco ───────────────────────────────────────────────────────────
function RoccoAvatar({ isLoading, size = 60 }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <motion.div
                variants={breatheVariants}
                animate={isLoading ? 'loading' : 'idle'}
                style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: '2.5px solid #6B8F71', boxShadow: '0 4px 16px rgba(107,143,113,0.3)', background: '#e8f0e8', flexShrink: 0 }}
            >
                <img src={ROCCO_AVATAR} alt="Rocco" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
            {size >= 48 && <span style={{ fontFamily: 'Caveat, cursive', fontSize: '0.75rem', color: '#6B8F71', fontWeight: 600 }}>Rocco</span>}
        </div>
    );
}

// ── Avatar del Yo Pasado ──────────────────────────────────────────────────────
function YoAvatar({ isLoading, size = 60 }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <motion.div
                animate={isLoading ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                transition={isLoading ? { duration: 1.2, repeat: Infinity } : {}}
                style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #c8933a, #8a5e1a)', boxShadow: '0 4px 16px rgba(200,147,58,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: size > 40 ? '1.4rem' : '1rem' }}
            >
                🪞
            </motion.div>
            {size >= 48 && <span style={{ fontFamily: 'Caveat, cursive', fontSize: '0.75rem', color: '#8a5e1a', fontWeight: 600 }}>Tú</span>}
        </div>
    );
}

// ── Burbuja de mensaje ────────────────────────────────────────────────────────
function Burbuja({ msg, modoYoPasado }) {
    const esIA = msg.role === 'assistant';

    if (esIA && modoYoPasado) {
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px', gap: '8px', alignItems: 'flex-start' }}>
                <YoAvatar size={30} />
                <div style={{ maxWidth: '74%', background: 'linear-gradient(145deg, #fdf8f0, #faf3e5)', border: '1px solid #e8d5a8', borderLeft: '3px solid #C8933A', borderRadius: '2px 14px 14px 2px', padding: '12px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.6, color: '#3a2310', margin: 0 }}>
                        {msg.content}
                    </p>
                </div>
            </motion.div>
        );
    }

    if (esIA && !modoYoPasado) {
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #6B8F71', background: '#e8f0e8', flexShrink: 0 }}>
                    <img src={ROCCO_AVATAR} alt="Rocco" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ maxWidth: '74%', background: 'linear-gradient(145deg, #fffef9, #faf6ec)', border: '1px solid #e0d8c3', borderLeft: '3px solid #6B8F71', borderRadius: '2px 14px 14px 2px', padding: '12px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <p style={{ fontFamily: 'Caveat, cursive', fontSize: '1.15rem', lineHeight: 1.5, color: '#2d4a32', margin: 0 }}>
                        {msg.content}
                    </p>
                </div>
            </motion.div>
        );
    }

    // Usuario
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
            style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <div style={{ maxWidth: '74%', background: 'linear-gradient(135deg, #d4a045, #c8933a)', borderRadius: '14px 2px 14px 14px', padding: '10px 16px', boxShadow: '0 2px 10px rgba(200,147,58,0.25)' }}>
                <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '0.95rem', lineHeight: 1.55, color: '#fff', margin: 0 }}>
                    {msg.content}
                </p>
            </div>
        </motion.div>
    );
}

// ── Indicador de escritura ────────────────────────────────────────────────────
function TypingIndicator({ modoYoPasado, accentColor }) {
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            {modoYoPasado
                ? <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#c8933a,#8a5e1a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>🪞</div>
                : <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #6B8F71', background: '#e8f0e8', flexShrink: 0 }}>
                    <img src={ROCCO_AVATAR} alt="Rocco" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            }
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid #e0d8c3', borderRadius: '20px', padding: '9px 16px', display: 'flex', gap: '5px' }}>
                {[0, 1, 2].map(i => (
                    <motion.span key={i} animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22 }}
                        style={{ fontFamily: 'monospace', fontSize: '1rem', color: accentColor }}>●</motion.span>
                ))}
            </div>
        </motion.div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function PastSelfMode({ entradaGuardada, perfil, onVolver, modoYoPasado = false }) {
    const [mensajes, setMensajes] = useState([]);
    const [input, setInput] = useState('');
    const [cargando, setCargando] = useState(false);
    const [iaEscribe, setIaEscribe] = useState(false);
    const [eraActiva, setEraActiva] = useState(ERAS[0]);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    const hoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    const config = modoYoPasado ? {
        bgGradient: 'linear-gradient(170deg, #fdf6e8 0%, #f5e8cc 100%)',
        headerBorder: '#e8d5a8',
        titulo: '🪞 Tu Yo Pasado',
        subtitulo: eraActiva.label,
        accentColor: '#8a5e1a',
        chip: 'Voz imitada de tu diario',
    } : {
        bgGradient: 'linear-gradient(170deg, #f0ebe1 0%, #e8dfc8 100%)',
        headerBorder: '#d8cebc',
        titulo: '🐊 Charla con Rocco',
        subtitulo: hoy,
        accentColor: '#6B8F71',
        chip: 'Extrae más de tu entrada',
    };

    const llamarApi = useCallback(async (message, history) => {
        const apiKey = localStorage.getItem('gemini_api_key') || '';
        if (!apiKey) throw new Error('NO_API_KEY');

        const res = await fetch('/api/past-self', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                history,
                apiKey,
                modoYoPasado,
                eraYearStart: eraActiva.start,
                eraYearEnd: eraActiva.end,
                eraLabel: eraActiva.label
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error del servidor');
        return data.response || '…';
    }, [modoYoPasado, eraActiva]);

    const iniciarConversacion = useCallback(async (entrada) => {
        const msgInicio = modoYoPasado
            ? `__INICIO_PASADO__: El usuario quiere hablar con su yo pasado de la época ${eraActiva.label}. Salúdalo con tu propia voz de ese entonces y pregúntale qué quiere explorar.`
            : entrada
                ? `__INICIO__: El usuario acaba de escribir esta entrada en su diario: "${entrada.content}". Preséntate brevemente y haz tu primera pregunta para extraer más detalles.`
                : '__INICIO__: El usuario ha abierto el chat. Preséntate y pídele que te cuente algo.';

        setMensajes([]);
        setError('');
        setCargando(true);
        setIaEscribe(true);
        try {
            const respuesta = await llamarApi(msgInicio, []);
            setMensajes([{ role: 'assistant', content: respuesta }]);
        } catch (err) {
            if (err.message === 'NO_API_KEY') {
                setError('⚠️ Añade tu clave API de Gemini con el botón 🔑 (abajo a la derecha).');
            } else {
                setError(`⚠️ ${err.message || 'Error al conectar. Comprueba tu clave API.'}`);
            }
        } finally {
            setCargando(false);
            setIaEscribe(false);
            inputRef.current?.focus();
        }
    }, [modoYoPasado, eraActiva, llamarApi]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes, iaEscribe]);

    useEffect(() => {
        iniciarConversacion(entradaGuardada);
    }, [modoYoPasado, eraActiva]);

    const enviarMensaje = async () => {
        const texto = input.trim();
        if (!texto || cargando) return;

        const nuevosMensajes = [...mensajes, { role: 'user', content: texto }];
        setMensajes(nuevosMensajes);
        setInput('');
        setError('');
        setCargando(true);
        setIaEscribe(true);
        try {
            const respuesta = await llamarApi(texto, mensajes);
            setMensajes(prev => [...prev, { role: 'assistant', content: respuesta }]);
        } catch (err) {
            console.error('[PastSelfMode] Error:', err);
            const errMsg = err.message === 'NO_API_KEY'
                ? '⚠️ Añade tu clave API de Gemini (botón 🔑).'
                : `⚠️ ${err.message || 'Error de conexión.'}`;
            setMensajes(prev => [...prev, { role: 'assistant', content: errMsg }]);
        } finally {
            setCargando(false);
            setIaEscribe(false);
            inputRef.current?.focus();
        }
    };

    const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensaje(); } };

    return (
        <div style={{ minHeight: 'calc(100vh - 57px)', display: 'flex', flexDirection: 'column', background: config.bgGradient }}>

            <header style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: `1px solid ${config.headerBorder}`, background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(8px)' }}>
                {modoYoPasado ? <YoAvatar isLoading={iaEscribe} size={52} /> : <RoccoAvatar isLoading={iaEscribe} size={52} />}
                <div>
                    <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.15rem', fontWeight: 500, color: '#1a1208', margin: 0, lineHeight: 1.2 }}>{config.titulo}</h2>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.66rem', color: '#9a8870', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '2px 0 0' }}>{config.subtitulo}</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: config.accentColor, background: `${config.accentColor}1a`, padding: '4px 10px', borderRadius: '999px', letterSpacing: '0.03em' }}>
                        {config.chip}
                    </span>
                </div>
            </header>

            {modoYoPasado && (
                <div style={{
                    padding: '10px 24px',
                    background: 'rgba(255,255,255,0.3)',
                    borderBottom: `1px solid ${config.headerBorder}`,
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                }}>
                    {ERAS.map(era => (
                        <motion.button
                            key={era.id}
                            onClick={() => setEraActiva(era)}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '999px',
                                border: '1px solid',
                                borderColor: eraActiva.id === era.id ? config.accentColor : '#d0c5ae',
                                background: eraActiva.id === era.id ? config.accentColor : 'transparent',
                                color: eraActiva.id === era.id ? '#fff' : '#7a6840',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span>{era.icon}</span>
                            {era.label}
                        </motion.button>
                    ))}
                </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>

                    {!modoYoPasado && entradaGuardada && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid #e0d8c3', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', backdropFilter: 'blur(4px)' }}>
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#C8933A', marginBottom: '6px' }}>✦ Tu entrada de hoy</p>
                            <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '0.95rem', lineHeight: 1.6, color: '#3a2e1a', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {entradaGuardada.content}
                            </p>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#9a3a2a', background: '#fdf0ec', border: '1px solid #f0c0b0', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
                            {error}
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {mensajes.map((msg, i) => <Burbuja key={i} msg={msg} modoYoPasado={modoYoPasado} />)}
                    </AnimatePresence>

                    <AnimatePresence>
                        {iaEscribe && <TypingIndicator modoYoPasado={modoYoPasado} accentColor={config.accentColor} />}
                    </AnimatePresence>

                    <div ref={bottomRef} />
                </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: `1px solid ${config.headerBorder}`, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <textarea
                        ref={inputRef}
                        rows={1}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        disabled={cargando}
                        placeholder={modoYoPasado ? 'Pregúntale algo a tu yo pasado…' : 'Cuéntale más a Rocco…'}
                        style={{ flex: 1, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: '1.5', padding: '11px 16px', borderRadius: '24px', border: `1px solid ${config.headerBorder}`, background: '#fff', outline: 'none', resize: 'none', color: '#1a1208', maxHeight: '120px', overflowY: 'auto' }}
                    />
                    <motion.button
                        onClick={enviarMensaje}
                        disabled={!input.trim() || cargando}
                        whileHover={input.trim() && !cargando ? { scale: 1.06 } : {}}
                        whileTap={input.trim() && !cargando ? { scale: 0.93 } : {}}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', border: 'none', cursor: input.trim() && !cargando ? 'pointer' : 'not-allowed', background: input.trim() && !cargando ? 'linear-gradient(135deg, #d4a045, #c8933a)' : '#e8dfc6', color: input.trim() && !cargando ? '#fff' : '#b8a890', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: input.trim() && !cargando ? '0 2px 10px rgba(200,147,58,0.35)' : 'none', transition: 'all 0.2s' }}
                    >
                        ↑
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
