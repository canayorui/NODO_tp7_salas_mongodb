function leerConfiguracion() {
  const valorPuerto = process.env.PORT;
  const port = valorPuerto === undefined ? 3000 : Number(valorPuerto);

  if (valorPuerto !== undefined && !/^\d+$/.test(valorPuerto)) {
    throw new Error(
      `PORT inválido: "${valorPuerto}". Debe ser un entero entre 1 y 65535.`,
    );
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `PORT inválido: "${valorPuerto}". Debe ser un entero entre 1 y 65535.`,
    );
  }

  const entorno = process.env.NODE_ENV || "development";
  const formatoMorgan = entorno === "production" ? "combined" : "dev";

  return {
    port,
    entorno,
    formatoMorgan,
    mongodbUri: process.env.MONGODB_URI,
  };
}

module.exports = leerConfiguracion;
