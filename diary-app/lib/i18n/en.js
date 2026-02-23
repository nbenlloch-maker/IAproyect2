/**
 * i18n/en.js
 * All UI strings in English.
 * To add a new language, create `fr.js`, `es.js`, `nl.js` etc. with the same keys.
 */
const en = {
    // App
    appName: 'AI of Memories',
    appTagline: 'Your personal digital time capsule.',

    // Lock Screen
    lockTitle: 'AI of Memories',
    lockSubtitle: 'Your memories, locked and yours alone.',
    lockPrompt: 'Enter your PIN to unlock',
    lockError: 'Incorrect PIN. Try again.',
    lockHint: 'Default PIN: 1234',

    // Onboarding
    onboardingTitle: 'Welcome to your diary.',
    onboardingConsent: 'Before we begin, let\'s be transparent about how this diary works.',
    onboardingConsentBody:
        'Every entry you write will be gently categorised — people you mention, emotions you feel, beliefs you hold — so that one day, your future self can look back and even have a conversation with who you are right now.\n\nAll data is stored locally on your device. You are always in control.',
    onboardingConsentCheck: 'I understand how my entries will be used and I consent to building my Past Self profile.',
    onboardingContinue: 'Continue →',
    onboardingBack: '← Back',
    onboardingStep: 'Step {current} of {total}',

    onboardingQ1: 'What is your name, and what chapter of life do you feel you\'re in right now?',
    onboardingQ1Hint: 'e.g. finishing university, starting a new job, raising a family, searching for direction…',
    onboardingQ2: 'What\'s a memory or experience that you feel has shaped the person you are today?',
    onboardingQ2Hint: 'It could be a triumph, a loss, a person, or a quiet moment that changed something inside you.',
    onboardingQ3: 'How would you describe the way you talk or write to people you\'re close to?',
    onboardingQ3Hint: 'Are you funny and sarcastic? Warm and earnest? Philosophical? Any phrases that are very you?',
    onboardingFinish: 'Open my diary →',
    onboardingWelcomeBack: 'Your diary is ready.',

    // Diary
    diaryPlaceholder: 'What happened today? Write freely — this is just for you…',
    diarySubmit: '✍️  Add entry',
    diaryLoading: 'Writing margin note…',
    diaryEntries: 'Entries',
    diaryToday: 'Today',
    diaryNoEntries: 'Your diary is empty. Write your first entry above.',

    // Sidebar
    sidebarTitle: 'My Diary',
    sidebarEntries: '{count} entries recorded',
    sidebarMemories: 'Memory Snapshot',
    sidebarNoMemories: 'No memories yet.',
    sidebarPastSelf: '🕰️ Activate Past Self Mode',
    sidebarReturn: '📖 Return to Journal',
    sidebarPrivacy: 'All data stays on your device.',
    sidebarApiKey: 'Gemini API Key',

    // Margin notes
    marginNoteLabel: 'Margin note',

    // Past Self
    pastSelfTitle: 'Past Self Mode',
    pastSelfBanner: 'You are speaking with your past self from {dateRange}.',
    pastSelfBannerNote: 'Responses are based strictly on what you wrote in your diary.',
    pastSelfPlaceholder: 'Ask your past self anything…',
    pastSelfSend: 'Send',
    pastSelfLoading: 'Reaching into the past…',
    pastSelfNoEntries: 'Write at least one diary entry before activating Past Self Mode.',
    pastSelfClose: 'Close',
};

export default en;
