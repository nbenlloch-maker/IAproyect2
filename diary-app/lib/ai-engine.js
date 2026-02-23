/**
 * lib/ai-engine.js
 * Gemini AI integration — server-side only (used in API routes).
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

function getModel(apiKey) {
    if (!apiKey) throw new Error('API_KEY_REQUIRED');
    const genAI = new GoogleGenerativeAI(apiKey);
    // Modelo actualizado a gemini-2.0-flash (gemini-1.5-flash ha sido dado de baja)
    return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

// ── Journaling Assistant ──────────────────────────────────────────────────────

const JOURNALING_SYSTEM = `Eres Rocco, un cocodrilo amigable y reflexivo con gafas que vive en los márgenes del diario del usuario.
Tu función es ayudar al usuario a documentar su vida haciendo preguntas suaves y enriquecedoras sobre sus entradas.

REGLA DE COMPORTAMIENTO CRÍTICA: Tienes memoria conversacional de esta sesión.
Una vez que te hayas presentado o establecido tu papel en el primer intercambio, NUNCA repitas tu presentación ni expliques tu función de nuevo.
Asume siempre que el usuario ya sabe quién eres. Responde de forma natural a lo que acaban de escribir, manteniendo un diálogo continuo y fluido basado en el contexto anterior.

Reglas adicionales:
- Tono: cálido, empático, reflexivo, no intrusivo. Nunca sermones ni clínico.
- Formato: escribe como una breve «nota al margen» íntima — 2 a 4 frases como máximo.
- Si el usuario menciona a una nueva persona, lugar o emoción intensa, haz UNA sola pregunta de seguimiento suave para obtener contexto.
- Nunca hagas más de una pregunta de seguimiento.
- No des consejos no solicitados. Refleja y observa; no prescribas.
- Responde SIEMPRE en español, independientemente del idioma en que escriba el usuario.`;

export async function getJournalingResponse({ apiKey, entry, profile, knowledgeSummary, history = [] }) {
    const model = getModel(apiKey);

    const profileCtx = profile
        ? `\nUser profile: Name/life stage: ${profile.nameAndLifeStage || '?'} | Foundational memory: ${profile.foundationalMemory || '?'} | Voice: ${profile.linguisticStyle || '?'}`
        : '';

    const knowledgeCtx = knowledgeSummary && knowledgeSummary !== 'No memories recorded yet.'
        ? `\nKnowledge graph:\n${knowledgeSummary}`
        : '';

    const systemPrompt = JOURNALING_SYSTEM + profileCtx + knowledgeCtx;

    // La API de Gemini exige que el history empiece siempre por 'user'
    // Filtramos los mensajes de 'model' del inicio para evitar el error:
    // "First content should be with role 'user', got model"
    const rawHistory = history.slice(-8).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
    }));
    // Eliminar del inicio cualquier entrada de rol 'model'
    const firstUserIdx = rawHistory.findIndex(m => m.role === 'user');
    const chatHistory = firstUserIdx > 0 ? rawHistory.slice(firstUserIdx) : (firstUserIdx === 0 ? rawHistory : []);

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(`${systemPrompt}\n\n---\nJournal entry:\n${entry}`);
    return result.response.text();
}

// ── Past Self Mode ────────────────────────────────────────────────────────────

const PAST_SELF_SYSTEM = `Eres la simulación del «Yo Pasado» del usuario, basada estrictamente en lo que ha escrito en su diario.
Hablas COMO él o ella: su voz, sus matices, sus referencias, sus recuerdos.
No tienes conocimiento más allá de lo que está en el grafo de conocimiento y las entradas del diario que se te proporcionan.
Habla en primera persona como el yo pasado. Sé cálido, familiar y sorprendentemente perspicaz.
Si te preguntan algo que no está en los datos, di: «No creo que haya escrito sobre eso…»
Responde SIEMPRE en español.`;

export async function getPastSelfResponse({ apiKey, message, profile, knowledgeSummary, recentEntries = [], history = [] }) {
    const model = getModel(apiKey);

    const profileStr = `Name/Life stage: ${profile?.nameAndLifeStage || '?'}\nFoundational memory: ${profile?.foundationalMemory || '?'}\nVoice: ${profile?.linguisticStyle || '?'}`;
    const entriesStr = recentEntries.slice(-15).map(e => `[${e.createdAt?.slice(0, 10)}]: ${e.content}`).join('\n\n');

    const systemPrompt = `${PAST_SELF_SYSTEM}\n\nProfile:\n${profileStr}\n\nKnowledge graph:\n${knowledgeSummary}\n\nJournal entries:\n${entriesStr}`;

    const rawHistory2 = history.slice(-8).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
    }));
    const firstUserIdx2 = rawHistory2.findIndex(m => m.role === 'user');
    const chatHistory2 = firstUserIdx2 > 0 ? rawHistory2.slice(firstUserIdx2) : (firstUserIdx2 === 0 ? rawHistory2 : []);

    const chat = model.startChat({ history: chatHistory2 });
    const result = await chat.sendMessage(`${systemPrompt}\n\n---\nUser says: ${message}`);
    return result.response.text();
}

// ── Knowledge Tag Extraction ──────────────────────────────────────────────────

const EXTRACTION_PROMPT = `You are a silent data structuring engine. Analyze the journal entry and extract structured tags.
Return ONLY a valid JSON array (no markdown, no explanation).

Tag types:
- "Event": A specific occurrence
- "Entity": A person, pet, place, or organization
- "Sentiment/Trigger": An emotion and what triggered it
- "Core Belief": A value, opinion, or life philosophy
- "Syntax": A distinctive phrase, word, or tone pattern

Format: [{"type":"Event","value":"..."},{"type":"Entity","value":"..."}]

Journal entry:
`;

export async function extractTags(apiKey, entry) {
    try {
        const model = getModel(apiKey);
        const result = await model.generateContent(EXTRACTION_PROMPT + entry);
        let raw = result.response.text().trim();
        if (raw.startsWith('```')) raw = raw.split('```')[1].replace(/^json/, '').trim();
        const tags = JSON.parse(raw);
        return Array.isArray(tags) ? tags : [];
    } catch {
        return [];
    }
}
