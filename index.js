
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function askOpenAI(prompt) {
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      input: prompt
    })
  });

  let data = {};
  try { data = await r.json(); } catch (_) {}

  if (!r.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    // Mėgstamiausi atvejai: 401 – neteisingas/užblokuotas raktas; 429 – planas/limitai
    throw new Error(`OPENAI_${r.status}: ${msg}`);
  }

  const text =
    data.output_text ??
    data.choices?.[0]?.message?.content?.[0]?.text ??
    data.choices?.[0]?.message?.content ??
    "";

  return (text || "Ačiū, gavau žinutę 🙏").toString().trim();
}
