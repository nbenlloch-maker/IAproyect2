/**
 * lib/i18n/es.js  — Español (MVP)
 */
const es = {
    // App
    appName: 'Mis Memorias',
    appTagline: 'Tu diario personal.',

    // Lock Screen
    lockTitle: 'Mis Memorias',
    lockSubtitle: 'Tus recuerdos, solo tuyos.',
    lockPrompt: 'Introduce tu PIN para desbloquear',
    lockError: 'PIN incorrecto. Inténtalo de nuevo.',
    lockHint: 'PIN por defecto: 1234',

    // Onboarding
    onboardingTitle: 'Bienvenido a tu diario.',
    onboardingContinue: 'Continuar →',
    onboardingBack: '← Volver',
    onboardingStep: 'Paso {current} de {total}',
    onboardingFinish: 'Abrir mi diario →',

    onboardingQ1: '¿Cuál es tu nombre y en qué etapa de tu vida te encuentras ahora mismo?',
    onboardingQ1Hint: 'Ej: terminando la universidad, empezando un nuevo trabajo, criando una familia…',
    onboardingQ2: '¿Qué recuerdo o experiencia crees que más te ha formado como persona?',
    onboardingQ2Hint: 'Puede ser un triunfo, una pérdida, una persona o un momento que cambió algo en ti.',
    onboardingQ3: '¿Cómo describirías tu forma de hablar o escribir con la gente cercana a ti?',
    onboardingQ3Hint: '¿Eres gracioso y sarcástico? ¿Cálido y sincero? ¿Filosófico? ¿Tienes frases que son muy tuyas?',

    // Diary
    diaryPlaceholder: '¿Qué pasó hoy? Escribe libremente — esto es solo para ti…',
    diarySubmit: '✍️  Añadir entrada',
    diaryLoading: 'Escribiendo nota al margen…',
    diaryEntries: 'entradas',
    diaryToday: 'Hoy',
    diaryNoEntries: 'Tu diario está vacío. Escribe tu primera entrada arriba.',

    // Sidebar
    sidebarTitle: 'Mi Diario',
    sidebarEntries: '{count} entradas registradas',
    sidebarMemories: 'Resumen de Memorias',
    sidebarNoMemories: 'Aún no hay memorias.',
    sidebarPastSelf: '🕰️ Hablar con mi Yo Pasado',
    sidebarReturn: '📖 Volver al Diario',
    sidebarPrivacy: 'Todos los datos están en tu dispositivo.',
    sidebarApiKey: 'Clave API de Gemini',

    // Margin notes
    marginNoteLabel: 'Nota al margen',

    // Past Self
    pastSelfTitle: 'Mi Yo Pasado',
    pastSelfBanner: 'Estás hablando con tu yo pasado ({dateRange}).',
    pastSelfBannerNote: 'Las respuestas se basan en lo que escribiste en tu diario.',
    pastSelfPlaceholder: 'Pregúntale algo a tu yo pasado…',
    pastSelfSend: 'Enviar',
    pastSelfLoading: 'Buscando en el pasado…',
    pastSelfNoEntries: 'Escribe al menos una entrada antes de activar este modo.',
    pastSelfClose: 'Cerrar',
};

export default es;
