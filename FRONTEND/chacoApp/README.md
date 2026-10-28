# Enciclopedia Interactiva Multimedia — Guerra del Chaco (1932–1935)

Aplicación web educativa, inmersiva y multimedia desarrollada con **Angular 22**, **Tailwind CSS** y **Node.js**, diseñada para la divulgación histórica rigurosa de la Guerra del Chaco para estudiantes e investigadores.

---

## 🎯 Características Principales

- **Línea de Tiempo Cronológica Navegable:** Menú colapsable y responsivo con los 7 hitos obligatorios del conflicto, con soporte para atajos de teclado (`[←]`, `[→]`, `[Enter]`).
- **Archivo Multimedia Local Completo:**
  - 📷 **Fotografías históricas:** Fotografías de época restauradas en `/public/imgs/` con carga diferida (`loading="lazy"`).
  - 🎬 **Videos documentales locales:** Archivos audiovisuales en `/public/videos/` con reproductor nativo y `preload="none"`.
  - 🎙️ **Narración oral histórica:** Pistas sonoras en `/public/voz/` con relatos de época.
  - 📜 **Crónica y Análisis Militar:** Textos detallados sobre contexto táctico, teatros de operaciones, comandantes en campaña y bajas.
- **Asistente IA del Chaco (Chatbot Flotante):**
  - Widget en la esquina inferior derecha (`fixed bottom-6 right-6`).
  - Conectado a la API REST de Node.js (`POST /api/chat`) con contexto del hito activo.
  - Sugerencias rápidas de preguntas, indicador de tipeo, reintentos y motor de contingencia histórica.
- **Conmutador de Origen de Datos en Tiempo Real:**
  - Permite alternar entre **Mock JSON** (`/data/hitos.json`) y **API REST Node.js** (`http://localhost:3000/api/hitos`).
- **Accesibilidad y Rendimiento:** Cumple directrices WCAG 2.1 AA (roles ARIA, contraste visual, soporte total de teclado).

---

## 🏛️ Los 7 Hitos Obligatorios

| # | Hito Histórico | Código | Fecha |
|---|---|---|---|
| 1 | **Incidente de Laguna Pitiantuta** | `junio-1932` | 15 de junio de 1932 |
| 2 | **Batalla de Boquerón** | `boqueron-1932` | 9 al 29 de septiembre de 1932 |
| 3 | **Llegada del Gral. Hans Kundt** | `kundt-1932` | Diciembre de 1932 – 1933 |
| 4 | **Batalla de Nanawa** | `nanawa-1933` | Enero y Julio de 1933 |
| 5 | **Maniobra de Campo Vía** | `campo-via-1933` | Octubre – Diciembre de 1933 |
| 6 | **Batalla de El Carmen** | `el-carmen-1934` | 10 al 16 de noviembre de 1934 |
| 7 | **Batalla de Pozo del Tigre – Ingavi** | `ingavi-1935` | Mayo a Junio de 1935 (Armisticio) |

---

## 🛠️ Stack Tecnológico

- **Frontend:** Angular 22 (Standalone Components, Signals, Control Flow `@if`/`@for`).
- **Estilos:** Tailwind CSS v4 + Google Fonts (*Merriweather*, *Cinzel*, *Inter*).
- **Backend / API:** Node.js (Servidor REST nativo en puerto 3000 con CORS universal).
- **Testing:** Vitest con `@angular/build:unit-test`.
- **Datos:** JSON local en `public/data/hitos.json` y servido vía API REST.

---

## 📁 Estructura del Proyecto

```
appBol/
├── public/
│   ├── data/
│   │   └── hitos.json            # Dataset de los 7 hitos históricos
│   ├── imgs/                     # Fotografías históricas locales
│   ├── videos/                   # Clips documentales locales
│   └── voz/                      # Narraciones orales de audio local
├── server/
│   └── server.mjs                # API REST Node.js (GET /api/hitos, POST /api/chat)
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   ├── hito.model.ts # Interfaz Hito según especificación
│   │   │   │   └── chat.model.ts # Modelos de mensajes y chatbot
│   │   │   └── services/
│   │   │       ├── hitos.service.ts
│   │   │       ├── hitos.service.spec.ts
│   │   │       ├── chatbot.service.ts
│   │   │       └── chatbot.service.spec.ts
│   │   ├── features/
│   │   │   ├── timeline/         # Línea de tiempo colapsable con accesibilidad ARIA
│   │   │   ├── hito-detalle/     # Vista multimedia completa (foto, video, audio, crónica)
│   │   │   └── chatbot/          # Widget flotante inferior derecho con IA
│   │   ├── shared/
│   │   │   └── components/
│   │   │       └── header/       # Barra superior con conmutador Mock/API
│   │   ├── app.routes.ts         # Enrutamiento con lazy loading y default redirect
│   │   ├── app.config.ts         # Proveedores: Router, HttpClient con withFetch
│   │   ├── app.ts                # Componente raíz orquestador con signals
│   │   └── app.html              # Layout responsivo con drawer y overlay
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.development.ts
│   ├── index.html
│   └── styles.css                # Tailwind CSS v4 y animaciones
└── package.json
```

---

## 🚀 Instrucciones de Ejecución

### 1. Iniciar la API REST de Node.js (Backend)

En una terminal ejecuta:
```bash
cmd /c npm run server
```
El servidor backend se iniciará en `http://localhost:3000`.
Endpoints disponibles:
- `GET http://localhost:3000/api/hitos`
- `GET http://localhost:3000/api/hitos/:codigo`
- `POST http://localhost:3000/api/chat`

### 2. Iniciar la Aplicación Angular (Frontend)

En otra terminal ejecuta:
```bash
cmd /c npm start
```
Abre tu navegador en `http://localhost:4200/`.

> **Nota:** La aplicación cuenta con un botón en la barra superior para alternar instantáneamente entre el dataset mock local (`/data/hitos.json`) y la API de Node.js (`http://localhost:3000`). Si la API no está encendida, el frontend utiliza de forma transparente el fallback de contingencia.

---

## 🧪 Ejecución de Tests Unitarios

Para ejecutar la suite de pruebas unitarias automatizadas con Vitest:
```bash
cmd /c npx ng test --watch=false
```
Todos los 23 tests de servicios y componentes se ejecutan y validan:
- `HitosService` (carga mock/API, filtrado por código, anterior/siguiente, manejo de errores).
- `ChatbotService` (envío a endpoint, fallback histórico, historial, visibilidad).
- `TimelineComponent` (renderizado cronológico, emisión de eventos de navegación).
- `HitoDetalleComponent` (reproducción multimedia, carga diferida, formato de texto).
- `ChatbotWidgetComponent` (apertura/cierre, submit de preguntas, tecla Escape).
- `App` (creación y toggling de drawer).

---

## 📦 Compilación para Producción

Para compilar la aplicación para despliegue:
```bash
cmd /c npm run build
```
Los archivos optimizados se generan en el directorio `dist/appBol`.
