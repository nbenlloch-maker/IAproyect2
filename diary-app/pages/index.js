import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LockScreen from '../components/LockScreen';
import OnboardingFlow from '../components/OnboardingFlow';
import DiaryPage from '../components/DiaryPage';
import PastSelfMode from '../components/PastSelfMode';

// ── Barra de navegación persistente ─────────────────────────────────────────
const MODOS = [
  { id: 'diario', icono: '📓', label: 'Mi Diario' },
  { id: 'rocco', icono: '🐊', label: 'Charla con Rocco' },
  { id: 'pasado', icono: '🕰️', label: 'Mi Yo Pasado' },
];

function NavBar({ modoActual, onCambiar, entradaDisponible }) {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '6px',
      padding: '10px 16px',
      background: 'rgba(253,251,247,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e0d8c3',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {MODOS.map(m => {
        const activo = modoActual === m.id;
        // "Charla con Rocco" solo activo si hay entrada guardada
        const deshabilitado = m.id === 'rocco' && !entradaDisponible;
        return (
          <motion.button
            key={m.id}
            onClick={() => !deshabilitado && onCambiar(m.id)}
            whileHover={!deshabilitado ? { scale: 1.03 } : {}}
            whileTap={!deshabilitado ? { scale: 0.96 } : {}}
            title={deshabilitado ? 'Escribe y guarda una entrada primero' : m.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '999px',
              border: activo ? '1.5px solid #C8933A' : '1.5px solid transparent',
              background: activo
                ? 'linear-gradient(135deg, #fdf3e3, #faebd5)'
                : 'transparent',
              color: activo ? '#8a5e1a' : deshabilitado ? '#c8c0b0' : '#7a6840',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.8rem',
              fontWeight: activo ? 600 : 400,
              cursor: deshabilitado ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: activo ? '0 1px 8px rgba(200,147,58,0.2)' : 'none',
              opacity: deshabilitado ? 0.5 : 1,
              letterSpacing: '0.01em',
            }}
          >
            <span style={{ fontSize: '0.95rem' }}>{m.icono}</span>
            <span className="hidden sm:inline">{m.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}

// ── Panel flotante de clave API ──────────────────────────────────────────────
function FloatingApiKey() {
  const [abierto, setAbierto] = useState(false);
  const [clave, setClave] = useState('');

  useEffect(() => {
    setClave(localStorage.getItem('gemini_api_key') || '');
  }, []);

  const guardar = () => {
    localStorage.setItem('gemini_api_key', clave.trim());
    setAbierto(false);
  };

  const tieneKey = !!clave.trim();

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 100 }}>
      <AnimatePresence>
        {abierto && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            style={{
              background: '#fff',
              border: '1px solid #e0d8c3',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '10px',
              width: '270px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            }}
          >
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#9a8870',
              marginBottom: '10px',
            }}>
              🔑 Clave API de Gemini
            </p>
            <input
              type="password"
              value={clave}
              onChange={e => setClave(e.target.value)}
              placeholder="AIzaSy…"
              onKeyDown={e => e.key === 'Enter' && guardar()}
              autoFocus
              style={{
                width: '100%',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #e0d8c3',
                outline: 'none',
                color: '#1a1208',
                marginBottom: '10px',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={guardar}
              style={{
                width: '100%',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.82rem',
                fontWeight: 500,
                padding: '9px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #d4a045, #c8933a)',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(200,147,58,0.3)',
              }}
            >
              Guardar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setAbierto(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        title={tieneKey ? 'Clave API guardada ✓' : 'Añadir clave API de Gemini'}
        style={{
          width: '44px', height: '44px',
          borderRadius: '50%',
          border: tieneKey ? '2px solid #6B8F71' : '1.5px solid #d0c5ae',
          background: tieneKey ? '#6B8F71' : '#fff',
          color: tieneKey ? '#fff' : '#9a8870',
          fontSize: '1.1rem',
          cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        🔑
      </motion.button>
    </div>
  );
}

// ── Orquestador principal ────────────────────────────────────────────────────
export default function Home() {
  const [estadoApp, setEstadoApp] = useState('cargando');
  const [perfil, setPerfil] = useState({});
  const [modo, setModo] = useState('diario');   // diario | rocco | pasado
  const [ultimaEntrada, setUltimaEntrada] = useState(null);

  // Cargar perfil y entradas al iniciar
  useEffect(() => {
    // Perfil
    fetch('/api/profile')
      .then(r => r.json())
      .then(prof => {
        setPerfil(prof);
        setEstadoApp(prof.onboardingComplete ? 'bloqueada' : 'onboarding');
      })
      .catch(() => setEstadoApp('onboarding'));

    // Última entrada (para habilitar Rocco)
    fetch('/api/entries')
      .then(r => r.json())
      .then(entries => {
        if (entries && entries.length > 0) {
          setUltimaEntrada(entries[entries.length - 1]);
        }
      });
  }, []);

  // Callbacks
  const alDesbloquear = () => setEstadoApp('app');

  const alCompletarOnboarding = () => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(prof => { setPerfil(prof); setEstadoApp('app'); });
  };

  // Cuando se guarda una entrada: ir a Rocco automáticamente
  const alGuardarEntrada = (entrada) => {
    setUltimaEntrada(entrada);
    setModo('rocco');
  };

  // ── Pantalla de carga ─────────────────────────────────────────────
  if (estadoApp === 'cargando') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDFBF7' }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontFamily: 'Playfair Display, serif', fontSize: '3rem', color: '#d4c9b0' }}
        >
          📖
        </motion.div>
      </div>
    );
  }

  // ── Pantalla de bloqueo ───────────────────────────────────────────
  if (estadoApp === 'bloqueada') {
    return <LockScreen onUnlock={alDesbloquear} />;
  }

  // ── Onboarding ────────────────────────────────────────────────────
  if (estadoApp === 'onboarding') {
    return <OnboardingFlow onComplete={alCompletarOnboarding} />;
  }

  // ── App principal (3 modos) ───────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fdfbf7' }}>

      {/* Barra de navegación persistente */}
      <NavBar
        modoActual={modo}
        onCambiar={setModo}
        entradaDisponible={!!ultimaEntrada}
      />

      {/* Contenido del modo activo */}
      <div style={{ flex: 1 }}>
        <AnimatePresence mode="wait">

          {/* ── MODO 1: Diario ──────────────────────────────── */}
          {modo === 'diario' && (
            <motion.div
              key="diario"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <DiaryPage
                profile={perfil}
                onSaved={alGuardarEntrada}
              />
            </motion.div>
          )}

          {/* ── MODO 2: Charla con Rocco ─────────────────── */}
          {modo === 'rocco' && (
            <motion.div
              key="rocco"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
            >
              <PastSelfMode
                entradaGuardada={ultimaEntrada}
                perfil={perfil}
                onVolver={() => setModo('diario')}
                modoYoPasado={false}
              />
            </motion.div>
          )}

          {/* ── MODO 3: Mi Yo Pasado ─────────────────────── */}
          {modo === 'pasado' && (
            <motion.div
              key="pasado"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
            >
              <PastSelfMode
                entradaGuardada={null}
                perfil={perfil}
                onVolver={() => setModo('diario')}
                modoYoPasado={true}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Botón flotante de API key */}
      <FloatingApiKey />
    </div>
  );
}
