import { getProfile, getKnowledgeSummary, addEntry } from '../../lib/memory-store';
import { getJournalingResponse, extractTags } from '../../lib/ai-engine';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    // La key puede venir del body o del header; como fallback usamos la variable de entorno del servidor
    const apiKey = req.body.apiKey || req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '') || process.env.GEMINI_API_KEY || '';
    const { content, history = [] } = req.body || {};

    if (!content?.trim()) return res.status(400).json({ error: 'Falta el contenido de la entrada.' });
    if (!apiKey?.trim()) return res.status(400).json({ error: 'Falta clave API de Gemini. Asegúrate de configurarla.' });

    const profile = getProfile();
    const knowledgeSummary = getKnowledgeSummary();

    try {
        console.log('[API JOURNAL] Procesando entrada...');
        const [aiResponse, tags] = await Promise.all([
            getJournalingResponse({ apiKey, entry: content, profile, knowledgeSummary, history }),
            extractTags(apiKey, content),
        ]);

        const entry = addEntry({ content, aiResponse, tags });
        return res.status(200).json({ entry, aiResponse, tags });
    } catch (err) {
        console.error('[API JOURNAL ERROR]:', err);
        return res.status(500).json({ error: 'Error de la IA: ' + err.message });
    }
}
