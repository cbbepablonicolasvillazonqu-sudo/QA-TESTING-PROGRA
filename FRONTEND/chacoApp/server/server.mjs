import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Cargar dataset histórico
const dataFilePath = path.resolve(__dirname, '../public/data/hitos.json');
let hitos = [];
try {
  const raw = fs.readFileSync(dataFilePath, 'utf-8');
  hitos = JSON.parse(raw);
  console.log(`[API Chaco] Dataset cargado con ${hitos.length} hitos históricos.`);
} catch (err) {
  console.error('[API Chaco] Error al leer hitos.json:', err.message);
}

// Respuestas históricas del asistente
function answerChatQuery(query, activeCode) {
  const q = (query || '').toLowerCase().trim();
  const currentHito = hitos.find((h) => h.codigo_linea_tiempo === activeCode);

  if (q.includes('boqueron') || q.includes('boquerón') || (activeCode === 'boqueron-1932' && (q.includes('marzana') || q.includes('defensa') || q.includes('agua') || q.includes('quién')))) {
    return 'La Batalla de Boquerón (9 al 29 de septiembre de 1932) fue el primer choque masivo de la guerra. 600 defensores bolivianos bajo el mando del teniente coronel Manuel Marzana resistieron 20 días de asedio implacable frente a más de 12.000 soldados paraguayos del Cnl. José Félix Estigarribia. Sin agua potable y con munición agotada, capitularon con honores militares.';
  }

  if (q.includes('kundt') || q.includes('hans kundt') || activeCode === 'kundt-1932') {
    return 'El General alemán Hans Kundt fue llamado en diciembre de 1932 por el presidente Daniel Salamanca para asumir la comandancia en jefe del ejército boliviano. Veterano prusiano de la Gran Guerra europea, impulsó asaltos frontales masivos que no se adaptaban al agreste bosque chaqueño ni a la guerra de maniobra paraguaya, lo que provocó gran desgaste y su relevo tras Campo Vía.';
  }

  if (q.includes('nanawa') || activeCode === 'nanawa-1933') {
    return 'La Batalla de Nanawa (julio de 1933), apodada "El Verdún Sudamericano", fue un asalto frontal masivo ordenado por Kundt con apoyo de artillería, aviación, tanques ligeros Vickers y una mina subterránea. La posición fue heroicamente defendida por el coronel paraguayo Luis Irrazábal, costándole a Bolivia más de 2.000 bajas.';
  }

  if (q.includes('campo via') || q.includes('campo vía') || activeCode === 'campo-via-1933') {
    return 'La Maniobra de Campo Vía (diciembre de 1933) fue una obra maestra de cerco del general paraguayo Estigarribia. Dos divisiones bolivianas (4.ª y 9.ª) con más de 7.500 efectivos quedaron cercadas en los cañadones chaqueños sin agua ni pertrechos, obligando a su rendición y sellando la salida de Kundt.';
  }

  if (q.includes('el carmen') || activeCode === 'el-carmen-1934' || q.includes('salamanca') || q.includes('corralito')) {
    return 'En la Batalla de El Carmen (noviembre de 1934), tropas paraguayas envolvieron el centro boliviano capturando a 4.000 hombres. El desastre militar aceleró la crisis política que desembocó en el "Corralito de Villamontes", donde los jefes militares apresaron al presidente Daniel Salamanca y lo obligaron a renunciar.';
  }

  if (q.includes('ingavi') || q.includes('pozo del tigre') || q.includes('paz') || q.includes('fin') || activeCode === 'ingavi-1935') {
    return 'La Batalla de Pozo del Tigre – Ingavi (mayo–junio de 1935) fue la última gran batalla en el norte chaqueño. Tras la firma del Protocolo de Paz en Buenos Aires el 12 de junio de 1935, el cese al fuego definitivo se proclamó el 14 de junio a las 12:00 del mediodía con un emotivo abrazo entre trincheras.';
  }

  if (q.includes('pitiantuta') || activeCode === 'junio-1932' || q.includes('comenzó') || q.includes('inicio')) {
    return 'El Incidente de Laguna Pitiantuta (15 de junio de 1932) inició la contienda cuando una patrulla boliviana comandada por el Mayor Óscar Moscoso tomó el Fortín Carlos Antonio López junto a la laguna. La posterior recuperación paraguaya desató la escalada militar hacia la guerra abierta.';
  }

  if (currentHito) {
    return `Sobre ${currentHito.titulo} (${currentHito.fecha}): ${currentHito.descripcion} ${currentHito.texto.slice(0, 220)}... ¿Deseas profundizar sobre los comandantes o las tácticas empleadas?`;
  }

  return `La Guerra del Chaco (1932–1935) fue el conflicto bélico más extenso y sangriento de América Latina en el siglo XX, enfrentando a Bolivia y Paraguay en el árido territorio chaqueño. Puedes navegar por los 7 hitos de la línea de tiempo o preguntarme sobre cualquier batalla específica.`;
}

// Servidor HTTP con CORS nativo
const server = http.createServer((req, res) => {
  // Encabezados CORS universales
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // GET /api/hitos
  if (req.method === 'GET' && pathname === '/api/hitos') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(hitos));
    return;
  }

  // GET /api/hitos/:codigo
  if (req.method === 'GET' && pathname.startsWith('/api/hitos/')) {
    const codigo = pathname.replace('/api/hitos/', '').trim();
    const found = hitos.find((h) => h.codigo_linea_tiempo === codigo);
    if (found) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(found));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Hito no encontrado' }));
    }
    return;
  }

  // POST /api/chat
  if (req.method === 'POST' && pathname === '/api/chat') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const reply = answerChatQuery(payload.message, payload.codigo_linea_tiempo);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(
          JSON.stringify({
            reply,
            source: 'API Histórica Node.js - Archivo Guerra del Chaco',
            hito_relacionado: payload.codigo_linea_tiempo || null
          })
        );
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload JSON inválido' }));
      }
    });
    return;
  }

  // Ruta base o salud
  if (pathname === '/' || pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', hitos_count: hitos.length, version: '1.0.0' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint no encontrado' }));
});

server.listen(PORT, () => {
  console.log(`[API Guerra del Chaco] Servidor Node activo en http://localhost:${PORT}`);
});
