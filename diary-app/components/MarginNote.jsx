import { motion } from 'framer-motion';

const ROCCO_AVATAR = '/rocco.svg';

export default function MarginNote({ text, index }) {
    if (!text) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.08, duration: 0.5, ease: 'easeOut' }}
            className="relative"
            style={{
                /* Slightly rotated paper feel */
                transform: index % 2 === 0 ? 'rotate(-0.4deg)' : 'rotate(0.3deg)',
            }}
        >
            {/* Paper card */}
            <div
                style={{
                    background: 'linear-gradient(145deg, #fffef9 0%, #faf8f0 100%)',
                    border: '1px solid #e0d8c3',
                    borderLeft: '3px solid #6B8F71',
                    borderRadius: '2px 8px 8px 2px',
                    padding: '14px 14px 14px 16px',
                    boxShadow: '2px 3px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Subtle paper grain overlay */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.025,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
                        pointerEvents: 'none',
                    }}
                />

                {/* Rocco header */}
                <div className="flex items-center gap-2 mb-2.5">
                    <div
                        style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '1.5px solid #6B8F71',
                            flexShrink: 0,
                            boxShadow: '0 1px 4px rgba(107,143,113,0.3)',
                        }}
                    >
                        <img
                            src={ROCCO_AVATAR}
                            alt="Rocco"
                            width={26}
                            height={26}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => {
                                e.target.style.display = 'none';
                                e.target.parentElement.style.background = '#6B8F71';
                            }}
                        />
                    </div>
                    <span
                        style={{
                            fontFamily: 'Caveat, cursive',
                            fontSize: '0.8rem',
                            color: '#6B8F71',
                            fontWeight: 600,
                            letterSpacing: '0.03em',
                        }}
                    >
                        Rocco
                    </span>
                </div>

                {/* Note text */}
                <p
                    style={{
                        fontFamily: 'Caveat, cursive',
                        fontSize: '1.05rem',
                        lineHeight: '1.55',
                        color: '#3d5c42',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {text}
                </p>

                {/* Corner fold decoration */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 0,
                        height: 0,
                        borderStyle: 'solid',
                        borderWidth: '0 0 14px 14px',
                        borderColor: 'transparent transparent #e0d8c3 transparent',
                        opacity: 0.6,
                    }}
                />
            </div>
        </motion.div>
    );
}
