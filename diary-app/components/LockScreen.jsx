import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import t from '../lib/i18n/es';

// PIN temporal para testing — cambia a tu PIN real cuando quieras
const CORRECT_PIN = '0000';

export default function LockScreen({ onUnlock }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [unlocking, setUnlocking] = useState(false);

    const handleDigit = (d) => {
        if (pin.length >= 4) return;
        const next = pin + d;
        setPin(next);
        setError(false);
        if (next.length === 4) checkPin(next);
    };

    const handleDelete = () => { setPin(p => p.slice(0, -1)); setError(false); };

    const checkPin = (p) => {
        if (p === CORRECT_PIN) {
            setUnlocking(true);
            setTimeout(() => onUnlock(), 900);
        } else {
            setError(true);
            setTimeout(() => setPin(''), 600);
        }
    };

    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0d0b07 0%, #1a1208 50%, #0f0d06 100%)' }}
            animate={unlocking ? { y: '-100vh', opacity: 0 } : {}}
            transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
            {/* Subtle grain overlay */}
            <div className="absolute inset-0 opacity-30 pointer-events-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E\")" }}
            />

            {/* Spine decoration */}
            <div className="absolute left-0 top-0 bottom-0 w-8 opacity-40"
                style={{ background: 'linear-gradient(to right, #3a2a10, transparent)' }} />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="flex flex-col items-center gap-8 z-10 px-6 w-full max-w-xs"
            >
                {/* Book icon + title */}
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: [0, -2, 2, -1, 0] }}
                        transition={{ delay: 1, duration: 0.6, repeat: Infinity, repeatDelay: 5 }}
                        className="text-6xl mb-4 select-none"
                    >
                        📖
                    </motion.div>
                    <h1 className="font-serif text-3xl font-medium tracking-wide"
                        style={{ color: '#e8d5a3', fontFamily: 'Playfair Display, Georgia, serif' }}>
                        {t.lockTitle}
                    </h1>
                    <p className="font-sans text-sm mt-1.5 tracking-wider uppercase"
                        style={{ color: '#7a6840', letterSpacing: '0.12em' }}>
                        {t.lockSubtitle}
                    </p>
                </div>

                {/* PIN dots */}
                <div className="flex gap-4">
                    {[0, 1, 2, 3].map(i => (
                        <motion.div
                            key={i}
                            animate={pin.length > i
                                ? { scale: [1, 1.3, 1], backgroundColor: '#C8933A' }
                                : { scale: 1, backgroundColor: '#3a2e1a' }
                            }
                            transition={{ duration: 0.2 }}
                            className="w-4 h-4 rounded-full"
                            style={{ border: '1.5px solid #6b5520' }}
                        />
                    ))}
                </div>

                {/* Error message */}
                <AnimatePresence>
                    {error && (
                        <motion.p
                            key="err"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-sm font-sans"
                            style={{ color: '#c0604a' }}
                        >
                            {t.lockError}
                        </motion.p>
                    )}
                </AnimatePresence>

                {/* PIN pad */}
                <div className="grid grid-cols-3 gap-3 w-full">
                    {digits.map((d, i) => {
                        if (d === '') return <div key={i} />;
                        return (
                            <motion.button
                                key={i}
                                onClick={() => d === '⌫' ? handleDelete() : handleDigit(d)}
                                whileTap={{ scale: 0.88 }}
                                className="pin-btn aspect-square flex items-center justify-center rounded-full font-serif text-xl select-none cursor-pointer"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(200,147,58,0.25)',
                                    color: '#d4b87a',
                                    fontFamily: d === '⌫' ? 'Inter, sans-serif' : 'Playfair Display, serif',
                                }}
                            >
                                {d}
                            </motion.button>
                        );
                    })}
                </div>

                <p className="font-sans text-xs" style={{ color: '#4a3a20' }}>
                    {t.lockHint}
                </p>

                {/* Bypass para testing — quitar en producción */}
                <button
                    onClick={() => { setUnlocking(true); setTimeout(() => onUnlock(), 900); }}
                    style={{
                        marginTop: '4px',
                        background: 'transparent',
                        border: '1px solid #3a2e1a',
                        borderRadius: '8px',
                        color: '#6b5520',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.72rem',
                        padding: '6px 16px',
                        cursor: 'pointer',
                        letterSpacing: '0.06em',
                    }}
                >
                    ↩ Entrar sin contraseña (modo prueba)
                </button>
            </motion.div>
        </motion.div>
    );
}
