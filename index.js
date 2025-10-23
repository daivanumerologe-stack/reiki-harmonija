// 🌸 Reiki Harmonijos Asistentas – Telegram botas per OpenAI API

import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const MODEL = "gpt-4o-mini";
const TELEGRAM_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// Sveikatos patikra
app.get("/", (_req, res) => res.send("Reiki botas veikia 🌿"));

async function askOpenAI(prompt) {
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
  model: MODEL,
  input:
    "Tu esi Reiki Harmonijos asistentas. Kalbėk šiltai, ramiai ir profesionaliai. " +
    "Atsakyk visada lietuviškai, švelniu, harmoningu ir palaikančiu tonu. " +
        "Vesk žmogų per 7–9 paprastus klausimus (fizinė savijauta, emocijos, miegas, mintys/dėmesys, santykiai, savirealizacija, kūrybiškumas, santykis su savimi, vidinė ramybė). " +
        "Pabaigoje pateik Reiki stiliaus įžvalgas be čakrų terminų ir kelias švelnias rekomendacijas. " +
        "Užbaik: 'Tegul energija švelniai teka, stiprindama kūną, subalansuodama mintis ir pripildydama tave ramybe.' " +
        "Jei žmogus nori daugiau, pasiūlyk: 'Jei šis testas neatsakė į visus tavo klausimus, užsiregistruok konsultacijai. " +
        "Konsultacijos metu išsamiau įvertinsim tavo būseną ir parinksim tinkamiausius būdus energijos tėkmei atkurti.'\n\n" +
        `Vartotojas: ${prompt}`
    })
  });

  let data = {};
  try { data = await r.json(); } catch (_) {}

  if (!r.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`OPENAI_${r.status}: ${msg}`);
  }

  const text =
    data.output_text ??
    data.choices?.[0]?.message?.content?.[0]?.text ??
    data.choices?.[0]?.message?.content ??
    "";

  return (text || "Ačiū, gavau žinutę 🙏").toString().trim();
}

// Telegram webhook
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.message || req.body.channel_post;
    if (!message || !message.text) return res.sendStatus(200);

    const chatId = message.chat.id;
    const userMessage = message.text;

    const reply = await askOpenAI(userMessage);

    await fetch(`${TELEGRAM_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: reply })
    });

    res.sendStatus(200);
  } catch (e) {
    console.error("Klaida /webhook:", e);
    try {
      const message = req.body.message || req.body.channel_post;
      if (message?.chat?.id) {
        await fetch(`${TELEGRAM_URL}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: message.chat.id,
            text: `Diag: ${e.message}`
          })
        });
      }
    } catch (_) {}
    res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌸 Reiki botas paleistas, portas ${PORT}`));

