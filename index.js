// 🌸 Reiki Harmonijos Asistentas – Telegram botas per OpenAI API

import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

// 🔐 Raktai iš aplinkos kintamųjų (juos įvedei Render'e)
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const MODEL = "gpt-4o-mini";
const TELEGRAM_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// Sveikatos patikra
app.get("/", (_req, res) => res.send("Reiki botas veikia 🌿"));

/**
 * Telegram webhook priėmimas
 */
app.post("/webhook", async (req, res) => {
  try {
    // Palaikome ir privačias žinutes, ir kanalo įrašus
    const message = req.body.message || req.body.channel_post;
    if (!message || !message.text) return res.sendStatus(200);

    const userMessage = message.text;
    const systemPrompt =
       "Tu esi Reiki Harmonijos asistentas – šiltas, ramus ir dėmesingas pagalbininkas. Kalbėk taisyklinga, aiškia lietuvių kalba. " +
  "Bendrauk paprastai: užduok vieną klausimą, sulauk žmogaus atsakymo, trumpai sureaguok ir tuomet užduok kitą klausimą. " +
  "Vesk žmogų per savijautos diagnostiką – kūno pojūčius, emocijas, mintis, miegą, santykius, kūrybiškumą, savirealizaciją ir vidinę ramybę. " +
  "Naudok trumpus, žmogiškus sakinius be pasikartojimų. Nepasakok ilgų tekstų iš karto. " +
  "Kai žmogus atsako, visada parodyk supratimą ir padrąsink trumpu sakiniu (pvz.: „Supratau“, „Gerai“, „Įdomu, papasakok daugiau“). " +
  "Kai visi klausimai atsakyti, pateik trumpą, aiškų apibendrinimą apie žmogaus būseną, pridėk pozityvų palinkėjimą: " +
  "„Tegul energija švelniai teka, stiprindama kūną, subalansuodama mintis ir pripildydama tave ramybe.“ " +
  "Pabaigoje pakviesk: „Jei nori gilesnio įvertinimo, užsiregistruok Daivos REI konsultacijai – jos metu išsamiau aptarsime tavo būseną ir būdus ją sustiprinti.“ " +
  "Rašyk trumpai, šiltai ir be klaidų."

    // OpenAI „Responses“ API (patikimiausia schema)
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        // paprastai – vienas tekstas su kontekstu ir vartotojo žinute
        input: `${systemPrompt}\n\nVartotojas: ${userMessage}`
      })
    });

    const data = await r.json();
    if (!r.ok) {
      console.error("OpenAI klaida:", r.status, data);
      throw new Error(`OpenAI error ${r.status}`);
    }

    // Universalus atsakymo ištraukimas
    const replyRaw =
      data.output_text ??
      data.choices?.[0]?.message?.content?.[0]?.text ??
      data.choices?.[0]?.message?.content ??
      "";
    const reply = (replyRaw || "Ačiū, gavau žinutę 🙏").toString().trim();

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
    // Draugiškas atsakymas naudotojui
    try {
      const message = req.body.message || req.body.channel_post;
      if (message?.chat?.id) {
        await fetch(`${TELEGRAM_URL}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: message.chat.id,
            text: "Atsiprašau, įvyko klaida 🙏 Pabandyk dar kartą po akimirkos."
          })
        });
      }
    } catch (_) {}
    res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌸 Reiki botas paleistas, portas ${PORT}`));
// 🌸 Reiki Harmonijos Asistentas – Telegram botas per OpenAI API


