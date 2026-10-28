const {
  conectarBaseDatos,
  desconectarBaseDatos,
} = require("../src/config/base-datos");
const Reserva = require("../src/modelos/reserva");

const reservaDePrueba = {
  estudiante: "Estudiante de prueba",
  email: "prueba@example.com",
  sala: "Sala Norte",
  fecha: "2026-11-02",
  turno: "Mañana",
  personas: 2,
};

function informarError(error) {
  console.error(`No se pudo crear la reserva (${error.name || "Error"}).`);

  if (
    error.code === "MONGODB_URI_MISSING" ||
    error.code === "MONGODB_URI_INVALID" ||
    error.code === "MONGODB_DATABASE_INVALID"
  ) {
    console.error(error.message);
  } else if (error.errors) {
    console.error(
      `Campos a revisar: ${Object.keys(error.errors).join(", ") || "ninguno"}.`,
    );
  } else if (error.path) {
    console.error(`Campo a revisar: ${error.path}.`);
  }
}

async function crearReserva() {
  try {
    await conectarBaseDatos();
    const reserva = await Reserva.create(reservaDePrueba);
    console.log(`Reserva guardada. _id: ${reserva._id.toString()}`);
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

crearReserva();
