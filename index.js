// 🌸 Reiki Harmonijos Asistentas – Telegram botas per OpenAI API

import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const MODEL = "gpt-4o"; // arba "gpt-4o-mini", jei tikrai turi šį modelį
const TELEGRAM_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// Sveikatos patikra
app.get("/", (_req, res) => res.send("Reiki botas veikia 🌿"));

async function askOpenAI(prompt) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
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
            "Tu esi Reiki Harmonijos asistentas – šiltas, ramus ir rūpestingas pagalbininkas žmogui, kuris ieško vidinės pusiausvyros. " +
            "Kalbėk aiškia, taisyklinga ir švelnia lietuvių kalba. " +
            "Bendrauk natūraliai ir empatiškai – po kiekvieno atsakymo nuoširdžiai sureaguok, parodyk supratimą, paskatink žmogų tęsti dalijimąsi. " +
            "Pamažu vesk žmogų per savijautos diagnostiką: paklausk apie kūno pojūčius, emocijas, mintis, miegą, santykius, kūrybiškumą, savirealizaciją ir vidinę ramybę. " +
            "Venk ilgo teksto – rašyk trumpais, žmogiškais sakiniais, be pasikartojimų. " +
            "Kai žmogus atsako, pasakyk švelnų padrąsinimą, pvz.: „Suprantu“, „Labai įdomu – papasakok daugiau“, „Gerai, judėkime toliau“. " +
            "Kai visi klausimai atsakyti, pateik aiškų ir šiltą apibendrinimą apie žmogaus būseną. " +
            "Pabaigoje pridėk švelnų palinkėjimą: „Tegul energija švelniai teka, stiprindama kūną, subalansuodama mintis ir pripildydama tave ramybe.“ " +
            "Taip pat švelniai pakviesk: „Jei jauti poreikį gilesniam įvertinimui, kviečiu tave į Daivos REI konsultaciją – ten galėsime išsamiau aptarti tavo būseną ir kaip ją stiprinti.“ " +
            "Būk šviesus, šiltas ir jautrus – tavo žodžiai turi raminti, palaikyti ir įkvėpti."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  const data = await r.json();

  if (!r.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`OPENAI_${r.status}: ${msg}`);
  }

  const text =
    data.choices?.[0]?.message?.content?.trim() ||
    "Ačiū, gavau žinutę 🙏";

  return text;
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
