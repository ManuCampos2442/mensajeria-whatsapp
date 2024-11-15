const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();
app.use(bodyParser.json());

// Habilitar CORS
app.use(cors());

// Configurar ruta estática para servir archivos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el archivo index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Configura Twilio
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Lista de números de teléfono para enviar consejos periódicos
let phoneNumbers = [];

// Lista de consejos
const adviceList = [
  "Si sientes que tu hijo llora con mucha facilidad, intenta validar sus emociones diciéndole que es normal sentirse así. Luego, ofrécele un abrazo o una actividad tranquila para calmarse.",
  "¿Tu hijo se frustra rápido al hacer una tarea difícil? Aliéntalo diciéndole que es normal sentirse desafiado y recuérdale que con práctica puede mejorar. La paciencia es clave en el aprendizaje.",
  "Hoy intenta dedicar cinco minutos a una conversación plena con tu hijo, sin distracciones. Este tiempo exclusivo ayuda a fortalecer su autoestima y a sentirse valorado.",
  "Si notas que tu hijo prefiere evitar ciertos alimentos, ofrece opciones similares pero en diferentes formas o texturas. A veces, probar en un nuevo formato puede hacer toda la diferencia."
];

// Ruta para enviar un mensaje de consejo
app.post("/send-advice", async (req, res) => {
  const { phoneNumber } = req.body;

  // Guardamos el número en la lista
  if (!phoneNumbers.includes(phoneNumber)) {
    phoneNumbers.push(phoneNumber);
  }

  // Elige un consejo aleatorio
  const randomAdvice = adviceList[Math.floor(Math.random() * adviceList.length)];

  try {
    const adviceMessage = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      body: randomAdvice,
      to: `whatsapp:${phoneNumber}`
    });
    console.log(res.status)
    res.status(200).send({ success: true, message: "Mensaje de consejo enviado", adviceMessage });
  } catch (error) {
    console.log(res.status)
    res.status(500).send({ success: false, error: error.message });
  }
});

// Enviar consejos periódicamente
function sendPeriodicMessages() {
  phoneNumbers.forEach(async (phoneNumber) => {
    const randomAdvice = adviceList[Math.floor(Math.random() * adviceList.length)];

    try {
      await client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        body: randomAdvice,
        to: `whatsapp:${phoneNumber}`
      });
      console.log(`Consejo enviado a ${phoneNumber}`);
    } catch (error) {
      console.error(`Error al enviar consejo a ${phoneNumber}:`, error.message);
    }
  });
}

// Enviar consejos cada 24 horas (86400000 ms)
setInterval(sendPeriodicMessages, 86400000); // 24 horas

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
