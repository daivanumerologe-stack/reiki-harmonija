// 🌸 Reiki Harmonijos Asistentas – Telegram botas per OpenAI API

import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

// 🔐 Raktai iš aplinkos kintamųjų (juos įvesi Render'e)
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const MODEL = "gpt-4o-mini";
const TELEGRAM_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// Sveikatos patikra
app.get("/", (_req, res) => res.send("Reiki botas veikia 🌿"));

// Telegram webhook priėmimas
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.message;
    if (!message || !message.text) return res.sendStatus(200);

    const userMessage = message.text;

    // Siunčiame užklausą į OpenAI
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "Tu esi Reiki Harmonijos asistentas. Kalbėk šiltai, ramiai ir profesionaliai. " +
              "Vesk žmogų per 7–9 paprastus klausimus (fizinė savijauta, emocijos, miegas, mintys/dėmesys, santykiai, savirealizacija, kūrybiškumas, santykis su savimi, vidinė ramybė). " +
              "Pabaigoje pateik Reiki stiliaus išvadą be čakrų terminų ir rekomendacijas. " +
              "Užbaik: 'Tegul energija švelniai teka, stiprindama kūną, subalansuodama mintis ir pripildydama tave ramybe.' " +
              "Jei žmogus nori daugiau, pasiūlyk: 'Jei šis testas neatsakė į visus tavo klausimus, užsiregistruok konsultacijai. Konsultacijos metu išsamiau įvertinsim tavo būseną ir parinksim tinkamiausius būdus energijos tėkmei atkurti.'"
          },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await aiResponse.json();
    const reply = data?.choices?.[0]?.message?.content || "Atsiprašau, įvyko klaida 🙏";

    // Atsakome Telegrame
    await fetch(`${TELEGRAM_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: reply
      })
    });

    res.sendStatus(200);
  } catch (e) {
    console.error("Klaida /webhook:", e);
    res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌸 Reiki botas paleistas, portas ${PORT}`));
