import os
import json
import chromadb
import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv

# 1. Configuración de Gemini
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

# 2. Configuración de Base de Datos Vectorial (ChromaDB)
# Esto guarda los embeddings matemáticos localmente en la carpeta "data"
chroma_client = chromadb.PersistentClient(path="./data/chroma_db")
collection = chroma_client.get_or_create_collection(name="recuerdos_diarios")

PERFIL_FILE = "./data/perfil.json"

def guardar_perfil(datos_perfil):
    os.makedirs("./data", exist_ok=True)
    with open(PERFIL_FILE, "w", encoding="utf-8") as f:
        json.dump(datos_perfil, f, ensure_ascii=False, indent=4)

def cargar_perfil():
    if os.path.exists(PERFIL_FILE):
        with open(PERFIL_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return None

def procesar_y_guardar_recuerdo(texto_usuario):
    """Guarda el recuerdo y genera una pregunta proactiva usando el LLM."""
    prompt_analisis = f"""
    Eres un asistente estructurador. Analiza esta entrada de diario de un usuario: "{texto_usuario}"
    Devuelve un JSON estricto con dos claves:
    "categorias": [lista de 2 a 4 palabras clave exactas],
    "pregunta_seguimiento": "Formula una sola pregunta breve y empática para profundizar sobre lo que ha contado, buscando que el usuario reflexione más."
    IMPORTANTE: Devuelve SOLO el JSON válido, sin formato markdown ni texto adicional.
    """
    
    try:
        respuesta = model.generate_content(prompt_analisis)
        texto_limpio = respuesta.text.replace("```json", "").replace("```", "").strip()
        analisis = json.loads(texto_limpio)
        categorias = analisis.get("categorias", ["General"])
        pregunta = analisis.get("pregunta_seguimiento", "¿Hay algo más que te gustaría compartir sobre hoy?")
    except Exception as e:
        categorias = ["Sin categorizar"]
        pregunta = "Gracias por compartir. ¿Algo más que añadir?"

    # Guardar en la base de datos vectorial
    doc_id = f"rec_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    metadata = {"fecha": datetime.now().strftime("%Y-%m-%d %H:%M"), "categorias": ", ".join(categorias)}
    
    collection.add(
        documents=[texto_usuario],
        metadatas=[metadata],
        ids=[doc_id]
    )
    
    return categorias, pregunta

def chatear_con_pasado(mensaje_usuario):
    """Recupera contexto vectorial y genera la respuesta del ente del pasado."""
    perfil = cargar_perfil()
    if not perfil:
        return "Primero debes completar tu perfil en la configuración inicial."

    contexto_perfil = f"Nombre: {perfil['nombre']}, Edad actual: {perfil['edad']}, Ocupación: {perfil['ocupacion']}. Intereses: {perfil['intereses']}"
    
    # Búsqueda semántica en ChromaDB
    resultados = collection.query(
        query_texts=[mensaje_usuario],
        n_results=3 # Recupera los 3 recuerdos más relevantes
    )
    
    recuerdos_str = ""
    if resultados['documents'] and len(resultados['documents'][0]) > 0:
        for i, doc in enumerate(resultados['documents'][0]):
            meta = resultados['metadatas'][0][i]
            recuerdos_str += f"- [{meta['fecha']}] ({meta['categorias']}): {doc}\n"
    else:
        recuerdos_str = "No hay recuerdos en la base de datos relacionados con este tema."

    prompt_chat = f"""
    Eres una simulación digital del "yo del pasado" del usuario, un ente creado a partir de sus memorias.
    Tu perfil base de cuando se registraron estos datos: {contexto_perfil}.
    
    Aquí tienes los recuerdos más relevantes recuperados de tu memoria que coinciden con la pregunta del usuario:
    {recuerdos_str}
    
    Instrucciones críticas:
    1. Responde basándote ESTRICTAMENTE en los recuerdos proporcionados arriba.
    2. Si te preguntan algo que no está en los recuerdos, admite abiertamente que no tienes registros o recuerdos sobre eso en tu base de datos. No inventes nada.
    3. Usa un tono nostálgico, en primera persona, como si hablaras con tu yo del futuro.
    
    Mensaje actual del usuario: "{mensaje_usuario}"
    """
    
    respuesta = model.generate_content(prompt_chat)
    return respuesta.text