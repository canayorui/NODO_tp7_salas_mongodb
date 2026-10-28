const {
  conectarBaseDatos,
  desconectarBaseDatos,
} = require("../src/config/base-datos");
const Reserva = require("../src/modelos/reserva");

async function listarReservas() {
  try {
    await conectarBaseDatos();
    const reservas = await Reserva.find();

    for (const reserva of reservas) {
      console.log(
        [
          `_id: ${reserva._id.toString()}`,
          `estudiante: ${reserva.estudiante}`,
          `email: ${reserva.email}`,
          `sala: ${reserva.sala}`,
          `fecha: ${reserva.fecha}`,
          `turno: ${reserva.turno}`,
          `personas: ${reserva.personas}`,
        ].join(" | "),
      );
    }

    console.log(`Cantidad de reservas: ${reservas.length}`);
  } catch (error) {
    console.error(
      `No se pudieron consultar las reservas (${error.name || "Error"}).`,
    );
    if (error.code !== undefined) {
      console.error(`Código: ${error.code}`);
    }
    if (
      error.code === "MONGODB_URI_MISSING" ||
      error.code === "MONGODB_URI_INVALID" ||
      error.code === "MONGODB_DATABASE_INVALID"
    ) {
      console.error(error.message);
    }
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

listarReservas();
