const express = require("express");
const usuariosRoutes = require("./routes/usuarios");
const productosRoutes = require("./routes/productos");
const chatbotRoutes = require("./routes/chatbot");
const errorHandler = require("./middlewares/error-handler");
const requireJsonObject = require("./middlewares/require-json-object");

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(requireJsonObject);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/ollama-prompt", chatbotRoutes);
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});
app.use(errorHandler);

module.exports = app;
