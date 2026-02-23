/**
 * api/chat.js (LEGACY FALLBACK)
 * Reenvía la petición a /api/past-self para evitar errores 404
 * si algún componente antiguo intenta llamar a este endpoint.
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    // Este endpoint ahora es solo un alias de past-self
    // Podríamos hacer un rewrite interno o simplemente copiar la lógica,
    // pero lo más limpio es importar el handler de past-self si quisiéramos.
    // Para simplificar, implementamos un reenvío básico.

    console.warn('[API CHAT] Llamada a endpoint legado /api/chat. Redirigiendo lógica...');

    const pastSelfHandler = (await import('./past-self')).default;
    return pastSelfHandler(req, res);
}
