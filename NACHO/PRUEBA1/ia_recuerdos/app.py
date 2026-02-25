import os
import json
import random
import streamlit as st
import chromadb
import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv

# ==========================================
# 1. CONFIGURACIÓN
# ==========================================
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

chroma_client = chromadb.PersistentClient(path="./data/chroma_db")
collection = chroma_client.get_or_create_collection(name="recuerdos_diarios")
PERFIL_FILE = "./data/perfil.json"

# ==========================================
# 2. FUNCIONES LÓGICAS BASE
# ==========================================
def guardar_perfil(datos_perfil):
    os.makedirs("./data", exist_ok=True)
    with open(PERFIL_FILE, "w", encoding="utf-8") as f:
        json.dump(datos_perfil, f, ensure_ascii=False, indent=4)

def cargar_perfil():
    if os.path.exists(PERFIL_FILE):
        with open(PERFIL_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return None

def guardar_en_chroma(texto, tipo="diario"):
    doc_id = f"rec_{datetime.now().strftime('%Y%m%d%H%M%S%f')}"
    metadata = {"fecha": datetime.now().strftime("%Y-%m-%d %H:%M"), "tipo": tipo}
    collection.add(documents=[texto], metadatas=[metadata], ids=[doc_id])

def obtener_total_recuerdos():
    try:
        return collection.count()
    except:
        return 0

def chatear_con_pasado(mensaje_usuario):
    perfil = cargar_perfil()
    contexto_perfil = f"Nombre: {perfil['nombre']}, Edad: {perfil['edad']}, Ocupación: {perfil['ocupacion']}"
    resultados = collection.query(query_texts=[mensaje_usuario], n_results=5)
    recuerdos_str = ""
    
    if resultados['documents'] and len(resultados['documents'][0]) > 0:
        for i, doc in enumerate(resultados['documents'][0]):
            meta = resultados['metadatas'][0][i]
            recuerdos_str += f"- [{meta['fecha']}]: {doc}\n"
    else:
        recuerdos_str = "No hay recuerdos relacionados en tu base de datos."

    prompt_chat = f"""
    Eres una simulación digital del "yo del pasado" del usuario. Tu perfil: {contexto_perfil}.
    Recuerdos recuperados:
    {recuerdos_str}
    Responde ESTRICTAMENTE basándote en los recuerdos. Mantén tu personalidad original.
    Mensaje: "{mensaje_usuario}"
    """
    respuesta = model.generate_content(prompt_chat)
    return respuesta.text

# ==========================================
# 3. LÓGICA DEL ENTREVISTADOR DINÁMICO
# ==========================================
def generar_pregunta_dinamica(contexto_hoy):
    perfil = cargar_perfil()
    contexto_perfil = f"Nombre: {perfil['nombre']}, Ocupación: {perfil['ocupacion']}"
    historial_str = "\n".join(contexto_hoy)
    
    prompt = f"""
    Eres un diario inteligente. Perfil: {contexto_perfil}
    Historial de hoy (NO repitas temas ya hablados):
    {historial_str}
    
    Genera UNA NUEVA pregunta para profundizar. Decide aleatoriamente si será abierta o de opciones.
    Devuelve SOLO un JSON válido:
    {{
        "tipo": "abierta" (o "opciones"),
        "pregunta": "Tu nueva pregunta aquí",
        "opciones": ["Opcion 1", "Opcion 2"]
    }}
    """
    try:
        respuesta = model.generate_content(prompt)
        texto_limpio = respuesta.text.replace("```json", "").replace("```", "").strip()
        return json.loads(texto_limpio)
    except:
        return {"tipo": "abierta", "pregunta": "Y cambiando un poco de tema, ¿qué más destacarías de hoy?", "opciones": []}

def generar_feedback_empatico(contexto_hoy):
    historial_str = "\n".join(contexto_hoy)
    prompt = f"""
    Eres un diario empático. Lee la última respuesta del usuario y dale un feedback breve y validante (1 frase).
    Historial: {historial_str}
    Responde SOLO con el feedback.
    """
    return model.generate_content(prompt).text

# ==========================================
# 4. INTERFAZ VISUAL (Streamlit)
# ==========================================
st.set_page_config(page_title="Echoes | Tu Segunda Memoria", page_icon="✨", layout="wide")

# CSS Avanzado para pestañas y diseño de botones OSCUROS
st.markdown("""
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap');
    html, body, [class*="css"] {font-family: 'Plus Jakarta Sans', sans-serif;}
    
    /* Estilo de las pestañas superiores (Tabs) */
    .stTabs [data-baseweb="tab-list"] {
        gap: 24px;
        justify-content: center;
        background-color: transparent;
    }
    .stTabs [data-baseweb="tab"] {
        height: 60px;
        white-space: pre-wrap;
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 10px 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border: 1px solid #e5e7eb;
    }
    .stTabs [aria-selected="true"] {
        background-color: #1E293B; /* Color oscuro al seleccionar pestaña */
        color: white !important;
        font-weight: 600;
        border: none;
        box-shadow: 0 4px 10px rgba(30,41,59,0.4);
    }
    
    /* Botones primarios (Color oscuro intenso) */
    .stButton>button[kind="primary"] {
        background-color: #0F172A !important; /* Azul medianoche/casi negro */
        color: #FFFFFF !important; 
        border: 1px solid #000000 !important; 
        border-radius: 8px; 
        font-weight: 600; 
        transition: all 0.3s ease;
    }
    .stButton>button[kind="primary"]:hover { 
        background-color: #1E293B !important; /* Un poco más claro al pasar el ratón */
        border-color: #1E293B !important;
        transform: translateY(-2px); 
        box-shadow: 0 6px 12px rgba(0,0,0,0.3); 
    }

    /* Botones secundarios (Color gris oscuro) */
    .stButton>button[kind="secondary"] {
        background-color: #334155 !important; /* Gris oscuro */
        color: #FFFFFF !important;
        border: 1px solid #1E293B !important;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    .stButton>button[kind="secondary"]:hover {
        background-color: #475569 !important;
        color: #FFFFFF !important;
        transform: translateY(-2px);
    }
    
    /* Cajas de texto */
    .stTextArea textarea, .stTextInput input { 
        border-radius: 10px; border: 1px solid #e5e7eb; padding: 12px;
    }
    .stTextArea textarea:focus, .stTextInput input:focus {
        border-color: #1E293B; box-shadow: 0 0 0 2px rgba(30,41,59,0.2);
    }
    </style>
""", unsafe_allow_html=True)

perfil_existente = cargar_perfil()

# ------------------------------------------
# BARRA LATERAL (Solo Datos y Estadísticas)
# ------------------------------------------
with st.sidebar:
    st.image("https://cdn-icons-png.flaticon.com/512/2103/2103322.png", width=70)
    st.markdown("## Echoes App")
    st.caption("Tu memoria digital estructurada.")
    st.divider()
    
    if perfil_existente:
        st.markdown(f"### 👤 {perfil_existente['nombre']}")
        st.markdown("---")
        st.markdown("#### 📊 Tus Datos en Directo")
        st.metric("🧠 Recuerdos Guardados", obtener_total_recuerdos())
        st.metric("⏳ Edad Registrada", perfil_existente.get("edad", "--"))
        st.metric("🟢 Estado del Sistema", "Online")
    else:
        st.warning("⚠️ Debes configurar tu identidad para ver tus estadísticas.")
        
    st.divider()
    st.caption("AI PROJECT 2 - EDEM 2025-2026")

# ------------------------------------------
# NAVEGACIÓN SUPERIOR (Pestañas de fácil acceso)
# ------------------------------------------
st.markdown("<h1 style='text-align: center; margin-bottom: 2rem;'>✨ Tu Centro de Control</h1>", unsafe_allow_html=True)

tab1, tab2, tab3, tab4 = st.tabs([
    "👤 Identidad", 
    "📝 Escribir Diario", 
    "🕰️ Hablar al Pasado", 
    "🌐 Asistente Gemini"
])

# --- PESTAÑA 1: PERFIL ---
with tab1:
    st.markdown("### Configuración Base")
    with st.form("perfil_form"):
        col1, col2 = st.columns(2)
        with col1:
            nombre = st.text_input("Nombre o Apodo", value=perfil_existente["nombre"] if perfil_existente else "")
            edad = st.number_input("Edad", min_value=10, value=perfil_existente["edad"] if perfil_existente else 25)
        with col2:
            ocupacion = st.text_input("Ocupación Principal", value=perfil_existente["ocupacion"] if perfil_existente else "")
        
        intereses = st.text_area("Tus intereses, aficiones y valores", value=perfil_existente["intereses"] if perfil_existente else "", height=100)
        
        if st.form_submit_button("Guardar Identidad", type="primary"):
            if nombre and ocupacion:
                guardar_perfil({"nombre": nombre, "edad": edad, "ocupacion": ocupacion, "intereses": intereses})
                st.toast("¡Perfil actualizado! 💾", icon="✅")
                st.rerun()

# Si no hay perfil, bloqueamos el acceso al resto de herramientas mostrando un aviso
if not perfil_existente:
    with tab2: st.info("👈 Configura tu Identidad en la primera pestaña para activar el diario.")
    with tab3: st.info("👈 Configura tu Identidad para poder interactuar con tu yo del pasado.")
    with tab4: st.info("👈 Configura tu Identidad para acceder al Asistente General.")
else:
    # --- PESTAÑA 2: DIARIO DINÁMICO ---
    with tab2:
        if 'diario_activo' not in st.session_state: st.session_state.diario_activo = False
        if 'ronda_actual' not in st.session_state: st.session_state.ronda_actual = 0
        if 'max_rondas' not in st.session_state: st.session_state.max_rondas = random.randint(2, 3)
        if 'contexto_hoy' not in st.session_state: st.session_state.contexto_hoy = []
        if 'pregunta_actual' not in st.session_state: st.session_state.pregunta_actual = None
        if 'esperando_siguiente' not in st.session_state: st.session_state.esperando_siguiente = False
        if 'feedback_actual' not in st.session_state: st.session_state.feedback_actual = None
        if 'respuesta_temp' not in st.session_state: st.session_state.respuesta_temp = None

        if not st.session_state.diario_activo:
            st.markdown("### ¿Qué tienes en mente hoy?")
            entrada_inicial = st.text_area("Vuelca aquí tu día de forma libre...", height=150)
            
            if st.button("Comenzar análisis", type="primary"):
                if entrada_inicial:
                    with st.spinner("Procesando memorias..."):
                        guardar_en_chroma(f"Resumen del día: {entrada_inicial}", "resumen_dia")
                        st.session_state.contexto_hoy.append(f"Usuario: {entrada_inicial}")
                        st.session_state.pregunta_actual = generar_pregunta_dinamica(st.session_state.contexto_hoy)
                        st.session_state.diario_activo = True
                        st.rerun()

        elif st.session_state.ronda_actual < st.session_state.max_rondas:
            pregunta = st.session_state.pregunta_actual
            st.progress((st.session_state.ronda_actual) / st.session_state.max_rondas, text=f"Explorando: {st.session_state.ronda_actual + 1} de {st.session_state.max_rondas}")
            
            st.info(f"💡 **{pregunta['pregunta']}**")
            
            if not st.session_state.esperando_siguiente:
                with st.form(key=f"form_ronda_{st.session_state.ronda_actual}", clear_on_submit=False):
                    if pregunta['tipo'] == 'opciones' and pregunta['opciones']:
                        respuesta_usuario = st.radio("Selecciona tu opción:", pregunta['opciones'], index=None)
                    else:
                        respuesta_usuario = st.text_area("Tu respuesta:")
                    
                    if st.form_submit_button("Enviar", type="primary"):
                        if respuesta_usuario:
                            with st.spinner("Conectando..."):
                                texto_a_guardar = f"Pregunta: {pregunta['pregunta']} | Respuesta: {respuesta_usuario}"
                                guardar_en_chroma(texto_a_guardar, "reflexion_guiada")
                                st.session_state.contexto_hoy.append(f"IA: {pregunta['pregunta']}")
                                st.session_state.contexto_hoy.append(f"Usuario: {respuesta_usuario}")
                                
                                st.session_state.feedback_actual = generar_feedback_empatico(st.session_state.contexto_hoy)
                                st.session_state.respuesta_temp = respuesta_usuario
                                st.session_state.esperando_siguiente = True
                                st.rerun()
            else:
                st.success(f"**Tú:** {st.session_state.respuesta_temp}")
                st.markdown(f"💬 *{st.session_state.feedback_actual}*")
                
                if st.button("Continuar ➡️", type="primary"):
                    with st.spinner("Generando siguiente interacción..."):
                        st.session_state.ronda_actual += 1
                        if st.session_state.ronda_actual < st.session_state.max_rondas:
                            st.session_state.pregunta_actual = generar_pregunta_dinamica(st.session_state.contexto_hoy)
                        
                        st.session_state.esperando_siguiente = False
                        st.session_state.feedback_actual = None
                        st.session_state.respuesta_temp = None
                        st.rerun()

        else:
            st.success("✨ ¡Día registrado con éxito!")
            st.balloons()
            if st.button("Cerrar diario de hoy", type="primary"):
                st.session_state.diario_activo = False
                st.session_state.ronda_actual = 0
                st.session_state.contexto_hoy = []
                st.rerun()

    # --- PESTAÑA 3: INTERACCIÓN CON EL PASADO ---
    with tab3:
        st.markdown("### Conversa con tu Pasado")
        
        if "mensajes_pasado" not in st.session_state: st.session_state.mensajes_pasado = []

        for msg in st.session_state.mensajes_pasado:
            with st.chat_message(msg["rol"]): st.markdown(msg["contenido"])

        if prompt_usuario := st.chat_input("Ej: ¿Cómo me sentía en mi antiguo trabajo?", key="input_pasado"):
            st.session_state.mensajes_pasado.append({"rol": "user", "contenido": prompt_usuario})
            with st.chat_message("user"): st.markdown(prompt_usuario)
                
            with st.chat_message("assistant"):
                with st.spinner("Recuperando recuerdos..."):
                    respuesta_ia = chatear_con_pasado(prompt_usuario)
                st.markdown(respuesta_ia)
                st.session_state.mensajes_pasado.append({"rol": "assistant", "contenido": respuesta_ia})

    # --- PESTAÑA 4: ASISTENTE GEMINI ---
    with tab4:
        st.markdown("### Asistente de Investigación")
        st.caption("Consulta dudas generales aquí sin perder el hilo de tu diario.")
        
        if "mensajes_gemini" not in st.session_state: st.session_state.mensajes_gemini = []

        for msg in st.session_state.mensajes_gemini:
            with st.chat_message(msg["rol"]): st.markdown(msg["contenido"])

        if prompt_gemini := st.chat_input("Pregunta cualquier duda histórica o general...", key="input_gemini"):
            st.session_state.mensajes_gemini.append({"rol": "user", "contenido": prompt_gemini})
            with st.chat_message("user"): st.markdown(prompt_gemini)
                
            with st.chat_message("assistant"):
                with st.spinner("Investigando..."):
                    respuesta_gemini = model.generate_content(prompt_gemini).text
                st.markdown(respuesta_gemini)
                st.session_state.mensajes_gemini.append({"rol": "assistant", "contenido": respuesta_gemini})