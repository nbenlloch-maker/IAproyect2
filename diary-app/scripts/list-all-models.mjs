import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const apiKey = process.argv[2];
if (!apiKey) {
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function list() {
    let log = 'RESULTADOS DE DIAGNOSTICO\n=========================\n';

    const modelsToProbe = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-001',
        'gemini-1.5-flash-002',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-pro',
        'gemini-pro-vision'
    ];

    for (const modelId of modelsToProbe) {
        try {
            const model = genAI.getGenerativeModel({ model: modelId });
            await model.generateContent('ping');
            log += `[OK] ${modelId}\n`;
        } catch (err) {
            log += `[FAIL] ${modelId}: ${err.message.split('\n')[0]}\n`;
        }
    }

    fs.writeFileSync('model-diagnostics.log', log);
    console.log('Diagnóstico completado. Resultados en model-diagnostics.log');
}

list();
