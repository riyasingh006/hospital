// Follow-up probe: full 404 messages, list API shape, and live tests with real token budget.
const fs = require("fs");
const path = require("path");

const env = fs.readFileSync(path.join(__dirname, ".env.local"), "utf8");
const line = env.split(/\r?\n/).find((l) => l.startsWith("GEMINI_API_KEY="));
const key = (line ? line.slice("GEMINI_API_KEY=".length) : "").trim().replace(/^"|"$/g, "");

async function main() {
  const { GoogleGenAI } = require("@google/genai");
  const ai = new GoogleGenAI({ apiKey: key });

  // Full 404 message from a retired model (shows what Google wants us to use).
  try {
    await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: "hi" }] }],
    });
  } catch (e) {
    console.log("FULL 404 MESSAGE:\n", (e?.message ?? "").slice(0, 600));
  }

  // List API shape in SDK v2.
  try {
    const r = await ai.models.list({});
    console.log("list() typeof:", typeof r, "| isAsync:", typeof r?.[Symbol.asyncIterator] === "function");
    if (r && typeof r[Symbol.asyncIterator] === "function") {
      const names = [];
      for await (const m of r) names.push((m.name ?? "").replace(/^models\//, ""));
      console.log("listed", names.length, "models; text-ish:", names.filter((n) => /flash|lite|pro/i.test(n)).slice(0, 20).join(", "));
    } else if (Array.isArray(r?.models)) {
      console.log("paged models:", r.models.map((m) => (m.name ?? "").replace(/^models\//, "")).slice(0, 20).join(", "));
    }
  } catch (e) {
    console.log("list error:", (e?.message ?? "").slice(0, 200));
  }

  // Live streaming tests with a real token budget (thinking models need headroom).
  for (const model of ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-3.6-flash", "gemini-3.5-flash-lite"]) {
    try {
      const t0 = Date.now();
      const stream = await ai.models.generateContentStream({
        model,
        contents: [
          {
            role: "user",
            parts: [{ text: "Reply with exactly this and nothing else: OK" }],
          },
        ],
        config: { temperature: 0.2, maxOutputTokens: 2048 },
      });
      let text = "";
      let chunks = 0;
      for await (const chunk of stream) {
        chunks++;
        text += chunk.text ?? "";
      }
      console.log(`LIVE model=${model} chunks=${chunks} text=${JSON.stringify(text.trim().slice(0, 80))} ms=${Date.now() - t0}`);
    } catch (e) {
      console.log(`fail model=${model}: status=${e?.status ?? ""} msg=${(e?.message ?? "").slice(0, 220)}`);
    }
  }
}
main();
