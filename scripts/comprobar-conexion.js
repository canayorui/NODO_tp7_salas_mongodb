const {
  conectarBaseDatos,
  desconectarBaseDatos,
} = require("../src/config/base-datos");

function informarError(error) {
  console.error("Falló la conexión con MongoDB.");

  const pendientes = [error];
  const visitados = new Set();

  while (pendientes.length > 0) {
    const actual = pendientes.shift();
    if (!actual || visitados.has(actual)) continue;

    visitados.add(actual);
    console.error(`Tipo de error: ${actual.name || "Error desconocido"}`);
    if (actual.code !== undefined) {
      console.error(`Código: ${actual.code}`);
    }
    if (
      actual.code === "MONGODB_URI_MISSING" ||
      actual.code === "MONGODB_URI_INVALID" ||
      actual.code === "MONGODB_DATABASE_INVALID"
    ) {
      console.error(actual.message);
    }
    if (actual.syscall) {
      console.error(`Operación de resolución: ${actual.syscall}`);
    }
    if (actual.cause) {
      pendientes.push(actual.cause);
    }
    if (actual.reason && actual.reason !== actual) {
      if (actual.reason.servers instanceof Map) {
        for (const servidor of actual.reason.servers.values()) {
          if (servidor.error) {
            pendientes.push(servidor.error);
          }
        }
      } else if (
        actual.reason.name ||
        actual.reason.code !== undefined ||
        actual.reason.syscall ||
        actual.reason.cause
      ) {
        pendientes.push(actual.reason);
      }
    }
  }
}

async function comprobarConexion() {
  try {
    await conectarBaseDatos();
    console.log("Conexión con MongoDB establecida correctamente.");
  } catch (error) {
    informarError(error);
    process.exitCode = 1;
  } finally {
    try {
      await desconectarBaseDatos();
    } catch (error) {
      console.error(
        `No se pudo cerrar la conexión: ${error.name || "Error desconocido"}.`,
      );
      process.exitCode = 1;
    }
  }
}

comprobarConexion();
