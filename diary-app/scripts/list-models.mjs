import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.argv[2];
if (!apiKey) {
    console.error('Uso: node list-models.mjs <API_KEY>');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function list() {
    const modelsToProbe = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

    for (const modelId of modelsToProbe) {
        try {
            console.log(`Probando ${modelId}...`);
            const model = genAI.getGenerativeModel({ model: modelId });
            const result = await model.generateContent('Hola');
            console.log(`✅ Respuesta de ${modelId}:`, result.response.text());
        } catch (err) {
            console.error(`❌ Error con ${modelId}:`, err.message);
        }
    }
}

list();
