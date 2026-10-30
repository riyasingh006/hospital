// Probe Gemini API with the configured key. Prints model ids + a tiny live test.
// Never prints the key.
const fs = require("fs");
const path = require("path");

const env = fs.readFileSync(path.join(__dirname, ".env.local"), "utf8");
const line = env.split(/\r?\n/).find((l) => l.startsWith("GEMINI_API_KEY="));
const key = (line ? line.slice("GEMINI_API_KEY=".length) : "").trim().replace(/^"|"$/g, "");
console.log("key loaded:", key.length > 0, "| length:", key.length);

async function main() {
  const { GoogleGenAI } = require("@google/genai");
  const ai = new GoogleGenAI({ apiKey: key });

  // 1) List a few available text models (free-tier candidates).
  try {
    const models = [];
    for await (const m of ai.models.list({ pageSize: 100 })) {
      const name = m.name ?? "";
      const supports = (m.supportedActions ?? []).includes("generateContent");
      if (supports && /(flash|lite|pro)/i.test(name)) models.push(name.replace(/^models\//, ""));
    }
    console.log("generateContent models (first 25):", models.slice(0, 25).join(", "));
  } catch (e) {
    console.log("models.list error:", e.name ?? "", (e.message ?? "").slice(0, 200));
  }

  // 2) Try a real streaming request on free-tier candidates in order of preference.
  const candidates = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
  ];
  for (const model of candidates) {
    try {
      const t0 = Date.now();
      const stream = await ai.models.generateContentStream({
        model,
        contents: [{ role: "user", parts: [{ text: "Reply with exactly: OK" }] }],
        config: { temperature: 0.2, maxOutputTokens: 16 },
      });
      let text = "";
      let chunks = 0;
      for await (const chunk of stream) {
        chunks++;
        text += chunk.text ?? "";
      }
      console.log(
        `LIVE OK model=${model} chunks=${chunks} text=${JSON.stringify(text.trim())} ms=${Date.now() - t0}`
      );
      return; // first success wins
    } catch (e) {
      const status = e?.status ?? e?.code ?? "";
      console.log(`live fail model=${model}: status=${status} msg=${(e?.message ?? "").slice(0, 180)}`);
    }
  }
  console.log("NO CANDIDATE MODEL WORKED");
}
main();
