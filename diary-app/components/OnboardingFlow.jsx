import { useState } from 'react';
import { motion } from 'framer-motion';
import t from '../lib/i18n/es';

const STEPS = [
    { key: 'nameAndLifeStage', question: t.onboardingQ1, hint: t.onboardingQ1Hint },
    { key: 'foundationalMemory', question: t.onboardingQ2, hint: t.onboardingQ2Hint },
    { key: 'linguisticStyle', question: t.onboardingQ3, hint: t.onboardingQ3Hint },
];

export default function OnboardingFlow({ onComplete }) {
    const [step, setStep] = useState(1); // starts at 1 (no consent step for MVP)
    const [answers, setAnswers] = useState({ nameAndLifeStage: '', foundationalMemory: '', linguisticStyle: '' });
    const [loading, setLoading] = useState(false);

    const currentQ = STEPS[step - 1];
    const canContinue = answers[currentQ?.key]?.trim().length > 5;

    const handleNext = async () => {
        if (step < STEPS.length) {
            setStep(s => s + 1);
        } else {
            setLoading(true);
            await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...answers, onboardingComplete: true }),
            });
            setLoading(false);
            onComplete();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6"
            style={{ background: 'linear-gradient(160deg, #fdfbf7 0%, #f5efe0 100%)' }}>

            <motion.div
                key={step}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-xl"
            >
                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="font-sans text-xs" style={{ color: '#9a8870' }}>
                            {t.onboardingStep.replace('{current}', step).replace('{total}', STEPS.length)}
                        </span>
                    </div>
                    <div className="h-0.5 rounded-full" style={{ background: '#e8dfc6' }}>
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: '#C8933A' }}
                            animate={{ width: `${(step / STEPS.length) * 100}%` }}
                            transition={{ duration: 0.4 }}
                        />
                    </div>
                </div>

                {/* Card */}
                <div className="rounded-2xl p-8"
                    style={{ background: '#fff', border: '1px solid #e8dfc6', boxShadow: '2px 4px 24px rgba(0,0,0,0.08)' }}>

                    <div className="space-y-6">
                        {step === 1 && (
                            <div className="text-center mb-2">
                                <div className="text-4xl mb-3">📖</div>
                                <h1 className="font-serif text-2xl font-medium" style={{ color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}>
                                    {t.onboardingTitle}
                                </h1>
                            </div>
                        )}

                        <div>
                            <p className="font-sans text-xs uppercase tracking-widest mb-3" style={{ color: '#C8933A', letterSpacing: '0.1em' }}>
                                Pregunta {step}
                            </p>
                            <h2 className="font-serif text-xl leading-relaxed" style={{ color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}>
                                {currentQ.question}
                            </h2>
                        </div>

                        <textarea
                            className="diary-textarea w-full"
                            style={{
                                background: '#fdfbf7',
                                border: '1px solid #e8dfc6',
                                minHeight: '140px',
                                borderRadius: '8px',
                                padding: '12px',
                            }}
                            placeholder={currentQ.hint}
                            value={answers[currentQ.key]}
                            onChange={e => setAnswers(a => ({ ...a, [currentQ.key]: e.target.value }))}
                            autoFocus
                        />
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-8">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(s => s - 1)}
                                className="font-sans text-sm"
                                style={{ color: '#9a8870' }}
                            >
                                {t.onboardingBack}
                            </button>
                        ) : <span />}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleNext}
                            disabled={!canContinue || loading}
                            className="px-6 py-2.5 rounded-full font-sans text-sm font-medium"
                            style={{
                                background: canContinue && !loading ? '#C8933A' : '#e8dfc6',
                                color: canContinue && !loading ? '#fff' : '#b8a890',
                                cursor: canContinue && !loading ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? '…' : step === STEPS.length ? t.onboardingFinish : t.onboardingContinue}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
