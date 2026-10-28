const leerConfiguracion = require("./config/entorno");
const crearApp = require("./app");
const crearServicioReservas = require("./services/reservas");

const datosIniciales = [
  {
    id: 1,
    estudiante: "Ana",
    email: "ana@mail.com",
    sala: "Sala Norte",
    fecha: "2026-09-22",
    turno: "Mañana",
    personas: 2,
  },
  {
    id: 2,
    estudiante: "Luis",
    email: "luis@mail.com",
    sala: "Sala Sur",
    fecha: "2026-09-23",
    turno: "Tarde",
    personas: 4,
  },
  {
    id: 3,
    estudiante: "María",
    email: "maria@mail.com",
    sala: "Sala Multimedia",
    fecha: "2026-09-24",
    turno: "Noche",
    personas: 3,
  },
  {
    id: 4,
    estudiante: "Pedro",
    email: "pedro@mail.com",
    sala: "Sala Norte",
    fecha: "2026-09-25",
    turno: "Mañana",
    personas: 1,
  },
];

const configuracion = leerConfiguracion();
const servicio = crearServicioReservas(datosIniciales);
const app = crearApp({
  servicio,
  formatoMorgan: configuracion.formatoMorgan,
});

app.listen(configuracion.port, () => {
  console.log(
    `Servidor iniciado en puerto ${configuracion.port} (${configuracion.entorno})`,
  );
});
