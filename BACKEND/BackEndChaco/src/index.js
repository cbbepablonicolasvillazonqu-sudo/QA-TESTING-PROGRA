const app = require("./app");
const database = require("./config/database");

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

async function start() {
  try {
    await database.query("SELECT 1");
    app.listen(port, host, () => {
      console.log(`API disponible en http://${host}:${port}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar la API:", error.message);
    await database.end();
    process.exitCode = 1;
  }
}

start();