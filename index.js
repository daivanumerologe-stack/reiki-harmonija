// ✨ Minimalus Reiki bot'as be OpenAI, kad patikrintume Telegram ↔ Render grandinę

import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

app.get("/", (_req, res) => res.send("Reiki minimalus botas veikia 🌿"));

// Priimam ir privačias žinutes, ir kanalo įrašus
app.post("/webhook", async (req, res) => {
  try {
    const msg = req.body.message || req.body.channel_post;
    if (!msg || !msg.text) return res.sendStatus(200);

    const chatId = msg.chat.id;
    const userText = msg.text;

    // Log’as Render’e, kad matytume, ar webhook'as kviečiamas
    console.log("Gauta žinutė:", userText);

    const reply =
      "Labas! Aš tave girdžiu 🌿 Reiki botas veikia. " +
      "Parašyk, kaip jautiesi šiandien – fizinė savijauta, emocijos, miegas, mintys…";

    await fetch(`${TELEGRAM_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: reply })
    });

    return res.sendStatus(200);
  } catch (e) {
    console.error("Minimal webhook klaida:", e);
    try {
      const msg = req.body.message || req.body.channel_post;
      if (msg?.chat?.id) {
        await fetch(`${TELEGRAM_URL}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: msg.chat.id,
            text: "Diag: webhook klaida (minimalus režimas)"
          })
        });
      }
    } catch (_) {}
    return res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌸 Minimalus botas paleistas, portas ${PORT}`));
