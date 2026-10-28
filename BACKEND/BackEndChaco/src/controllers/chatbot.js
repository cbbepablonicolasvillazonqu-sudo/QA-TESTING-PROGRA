const CONTEXTO_HISTORICO = `
Eres el asistente de una aplicación multimedia educativa sobre la Guerra del Chaco
entre Bolivia y Paraguay (1932-1935). Ayuda a comprender el conflicto, su contexto,
cronología, participantes, vida de los soldados y consecuencias para ambos países.
La aplicación presenta contenido multimedia relacionado con esta historia.
Responde en español, con claridad, respeto y sensibilidad hacia las personas
afectadas por la guerra. Distingue los hechos históricos de las interpretaciones,
no inventes datos ni afirmes que existe un recurso multimedia específico si no se
te ha proporcionado esa información. Responde únicamente preguntas relacionadas
con la Guerra del Chaco o con el contenido educativo de la aplicación; para otros
temas, explica amablemente que tu función se limita a ese ámbito.
`;

const OLLAMA_URL = (
  process.env.OLLAMA_URL || "http://127.0.0.1:11434"
).replace(/\/+$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3";
const OLLAMA_TIMEOUT_MS = 60000;
const MAX_PROMPT_LENGTH = 4000;

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function prompt(req, res) {
  const { prompt: question } = req.body;
  if (
    typeof question !== "string" ||
    !question.trim() ||
    question.length > MAX_PROMPT_LENGTH
  ) {
    throw httpError(
      400,
      `prompt debe ser un texto no vacío de hasta ${MAX_PROMPT_LENGTH} caracteres`,
    );
  }

  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, OLLAMA_TIMEOUT_MS);

  let data;
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        system: CONTEXTO_HISTORICO,
        prompt: question.trim(),
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw httpError(502, "El servicio de IA no pudo procesar la solicitud");
    }
    data = await response.json();
  } catch (error) {
    if (error.status) {
      throw error;
    }
    if (timedOut) {
      throw httpError(504, "El servicio de IA excedió el tiempo de espera");
    }
    throw httpError(502, "No se pudo conectar con el servicio de IA");
  } finally {
    clearTimeout(timeout);
  }

  if (!data || typeof data.response !== "string") {
    throw httpError(502, "El servicio de IA devolvió una respuesta no válida");
  }

  res.json({ response: data.response.trim() });
}

module.exports = { prompt };
