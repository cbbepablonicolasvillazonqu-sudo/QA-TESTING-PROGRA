# API backend

API REST en Express para las tablas MySQL `usuarios` y `productos`.

## Configuración

Requiere Node.js y una base MySQL. Crea la base y ejecuta
[`database/schema.sql`](./database/schema.sql) dentro de ella antes de iniciar.
Copia `.env.example` a `.env` en la raíz del proyecto y configura allí la
conexión. El archivo `.env` real está excluido del control de versiones.

| Variable | Predeterminado | Descripción |
| --- | --- | --- |
| `DB_HOST` | `127.0.0.1` | Host de MySQL |
| `DB_PORT` | `3306` | Puerto de MySQL |
| `DB_USER` | `root` | Usuario de MySQL |
| `DB_PASSWORD` | vacío | Contraseña de MySQL |
| `DB_NAME` | — | Nombre obligatorio de la base de datos |
| `HOST` | `127.0.0.1` | Interfaz donde escucha la API |
| `PORT` | `3000` | Puerto HTTP |

Instala dependencias con `npm install` e inicia con `npm start` (o `npm run dev`
durante el desarrollo). La aplicación carga `.env` desde la raíz del proyecto
y comprueba la conexión MySQL antes de abrir el puerto.

## Rutas

Todas las rutas usan JSON. Las rutas de usuarios no devuelven la contraseña;
las contraseñas recibidas se guardan con hash bcrypt.

| Método | Ruta | Acción |
| --- | --- | --- |
| `GET` | `/api/health` | Comprueba el estado del servidor |
| `GET` | `/api/usuarios` | Lista usuarios |
| `GET` | `/api/usuarios/:id` | Obtiene un usuario |
| `POST` | `/api/usuarios` | Crea usuario: `{ "nombre", "email", "contraseña" }` |
| `POST` | `/api/usuarios/login` | Valida credenciales: `{ "email", "contraseña" }` |
| `PUT` | `/api/usuarios/:id` | Actualiza campos enviados del usuario |
| `DELETE` | `/api/usuarios/:id` | Elimina usuario |
| `GET` | `/api/productos` | Lista productos |
| `GET` | `/api/productos/:id` | Obtiene un producto |
| `POST` | `/api/productos` | Crea producto con `precio` obligatorio |
| `PUT` | `/api/productos/:id` | Actualiza campos enviados del producto |
| `DELETE` | `/api/productos/:id` | Elimina producto |
| `POST` | `/api/chatbot` | Consulta al asistente multimedia de la Guerra del Chaco: `{ "prompt": "..." }` |
| `POST` | `/ollama-prompt` | Alias compatible con el endpoint anterior del chatbot |

El login responde `200` con los datos públicos del usuario si las credenciales
son correctas, `401` si no coinciden y `400` si faltan campos o no son válidos.
No devuelve la contraseña ni emite un token de sesión.

El chatbot requiere Ollama disponible en `OLLAMA_URL` (predeterminado
`http://127.0.0.1:11434`) y usa el modelo `OLLAMA_MODEL` (predeterminado
`gemma3`). El endpoint acepta prompts de hasta 4000 caracteres y responde
`{ "response": "..." }`. El asistente está orientado a la historia y al contenido
educativo multimedia de la Guerra del Chaco entre Bolivia y Paraguay.
