const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { once } = require("node:events");

if (!process.env.DB_NAME) {
  process.env.DB_NAME = "api_test";
}

const app = require("./app");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("health endpoint responds successfully", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("unknown routes return 404", async () => {
  const response = await fetch(`${baseUrl}/no-such-route`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "Ruta no encontrada" });
});

test("invalid resource ids return 400 without querying the database", async () => {
  const response = await fetch(`${baseUrl}/api/usuarios/no-es-un-id`);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "El id debe ser un entero positivo",
  });
});

test("user creation validates required fields", async () => {
  const response = await fetch(`${baseUrl}/api/usuarios`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 400);
});

test("login validates required credentials", async () => {
  const response = await fetch(`${baseUrl}/api/usuarios/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "no-es-valido" }),
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "email válido y contraseña son obligatorios",
  });
});

test("mutation requests require an object JSON body", async () => {
  const response = await fetch(`${baseUrl}/api/usuarios`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "[]",
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "El cuerpo debe ser un objeto JSON",
  });
});

test("product creation rejects negative prices", async () => {
  const response = await fetch(`${baseUrl}/api/productos`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ precio: -1 }),
  });
  assert.equal(response.status, 400);
});

test("chatbot requires a non-empty prompt", async () => {
  const response = await fetch(`${baseUrl}/api/chatbot`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: "   " }),
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "prompt debe ser un texto no vacío de hasta 4000 caracteres",
  });
});

test("legacy chatbot endpoint validates prompt length", async () => {
  const response = await fetch(`${baseUrl}/ollama-prompt`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: "a".repeat(4001) }),
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "prompt debe ser un texto no vacío de hasta 4000 caracteres",
  });
});

test("chatbot sends its historical context to Ollama", async () => {
  const originalFetch = global.fetch;
  let ollamaRequest;
  global.fetch = async (url, options) => {
    if (url !== "http://127.0.0.1:11434/api/generate") {
      return originalFetch(url, options);
    }
    ollamaRequest = { url, ...options, body: JSON.parse(options.body) };
    return {
      ok: true,
      json: async () => ({ response: "La Guerra del Chaco terminó en 1935." }),
    };
  };

  try {
    const response = await fetch(`${baseUrl}/api/chatbot`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt: "¿Cuándo terminó la guerra?" }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      response: "La Guerra del Chaco terminó en 1935.",
    });
    assert.equal(ollamaRequest.url, "http://127.0.0.1:11434/api/generate");
    assert.equal(ollamaRequest.body.stream, false);
    assert.match(ollamaRequest.body.system, /Guerra del Chaco/);
    assert.equal(ollamaRequest.body.prompt, "¿Cuándo terminó la guerra?");
  } finally {
    global.fetch = originalFetch;
  }
});
