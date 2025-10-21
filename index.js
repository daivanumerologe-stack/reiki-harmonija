// 🌸 Reiki Harmonijos Asistentas — Telegram botas (OpenAI)

// Moduliai
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

// App
const app = express();
app.use(bodyParser.json());

// Aplinka (Render -> Environment)
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const MODEL = "gpt-4o-mini";
const TELEGRAM_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// Sveikatos patikra
app.get("/", (_req, res) => res.send("Reiki botas veikia 🌿"));

// --- OpenAI kvietimas ---
async function askOpenAI(prompt) {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
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
            "Pabaigoje pateik Reiki stiliaus įžvalgas be čakrų terminų ir rekomendacijas. " +
            "Užbaik: 'Tegul energija švelniai teka, stiprindama kūną, subalansuodama mintis ir pripildydama tave ramybe.' " +
            "Jei žmogus nori daugiau, pasiūlyk: 'Jei šis testas neatsakė į visus tavo klausimus, užsiregistruok konsultacijai. " +
            "Konsultacijos metu išsamiau įvertinsim tavo būseną ir parinksim tinkamiausius būdus energijos tėkmei atkurti.'"
        },
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await resp.json();
  // Naudingas log’as Render → Logs lange, jei kas negerai
  console.log("OpenAI response status:", resp.status, data?.error || "");
  return data?.choices?.[0]?.message?.content?.trim() || "Atsiprašau, įvyko klaida 🙏";
}

// --- Telegram webhook ---
app.post("/webhook", async (req, res) => {
  try {
    // Palaikom asmenines žinutes ir pranešimus kanale
    const message = req.body.message || req.body.channel_post;
    if (!message || !message.text) return res.sendStatus(200);

    const userText = message.text.trim();
    console.log("INCOMING:", userText); // pamatysi Render → Logs

    // Gauk atsakymą iš OpenAI
    const reply = await askOpenAI(userText);

    // Atsakyk į tą patį chat’ą
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
    try {
      // Pabandome bent jau atsakyti žmogui apie klaidą
      const chatId =
        req?.body?.message?.chat?.id || req?.body?.channel_post?.chat?.id;
      if (chatId) {
        await fetch(`${TELEGRAM_URL}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "Atsiprašau, įvyko klaida 🙏 Pabandyk dar kartą po akimirkos."
          })
        });
      }
    } catch (_) {}
    res.sendStatus(200);
  }
});

// Paleidimas
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🌸 Reiki botas paleistas, portas ${PORT}`));
