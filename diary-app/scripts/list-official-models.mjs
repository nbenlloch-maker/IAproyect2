import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const apiKey = process.argv[2];
if (!apiKey) {
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function list() {
    let log = 'LISTADO OFICIAL DE MODELOS\n==========================\n';

    try {
        // En algunas versiones del SDK, listModels se llama así:
        // Pero el SDK de @google/generative-ai no siempre lo tiene expuesto directamente en genAI
        // Probaremos con un fetch directo a la API para ver qué dice el servidor
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            log += 'Modelos encontrados:\n';
            data.models.forEach(m => {
                log += `- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})\n`;
            });
        } else {
            log += `Error en la respuesta: ${JSON.stringify(data)}\n`;
        }
    } catch (err) {
        log += `Error al listar: ${err.message}\n`;
    }

    fs.writeFileSync('available-models.log', log);
    console.log('Listado completado. Resultados en available-models.log');
}

list();
