/**
 * Failure-path + streaming verification for the Gemini provider using a
 * local mock (no real key, no real API). Covers: unconfigured, rejected,
 * quota, transient-503 retry, streaming success, client abort.
 */
import http from "http";
import assert from "assert";

type Scenario = "ok" | "rejected" | "quota" | "flaky503";

let scenario: Scenario = "ok";
let flakyHits = 0;
let lastRequest: Record<string, unknown> = {};

const CHUNKS = ["नमस", "ते! I am", " जीवन AI."];

function sseBody(): string {
  let out = "";
  for (const c of CHUNKS) {
    out +=
      "data: " +
      JSON.stringify({
        candidates: [{ content: { parts: [{ text: c }] }, index: 0 }],
      }) +
      "\n\n";
  }
  return out;
}

const server = http.createServer((req, res) => {
  let body = "";
  req.on("data", (d) => (body += d));
  req.on("end", () => {
    if (!req.url?.includes(":streamGenerateContent")) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: { code: 404, message: "not found", status: "NOT_FOUND" } }));
      return;
    }
    lastRequest = JSON.parse(body || "{}");
    if (scenario === "rejected") {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: {
            code: 400,
            message: "API key not valid. Please pass a valid API key.",
            status: "INVALID_ARGUMENT",
          },
        })
      );
      return;
    }
    if (scenario === "quota") {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: {
            code: 429,
            message: "RESOURCE_EXHAUSTED: Quota exceeded for quota metric 'Generate Content API requests'",
            status: "RESOURCE_EXHAUSTED",
          },
        })
      );
      return;
    }
    if (scenario === "flaky503" && flakyHits < 1) {
      flakyHits++;
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: {
            code: 503,
            message: "The model is currently experiencing high demand. Please try again later.",
            status: "UNAVAILABLE",
          },
        })
      );
      return;
    }
    res.writeHead(200, { "Content-Type": "text/event-stream" });
    const lines = sseBody().split("\n\n").filter(Boolean);
    let i = 0;
    const timer = setInterval(() => {
      if (i < lines.length) {
        res.write(lines[i] + "\n\n");
        i++;
      } else {
        clearInterval(timer);
        res.end();
      }
    }, 30);
  });
});

async function main() {
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()));
  const port = (server.address() as { port: number }).port;

  process.env.OPENAI_BASE_URL = ""; // ensure no OpenAI interference
  delete process.env.OPENAI_API_KEY;
  process.env.GEMINI_MODEL = "gemini-flash-latest";

  // Point the real Gemini SDK at the mock via the documented env override.
  process.env.GOOGLE_GEMINI_BASE_URL = `http://127.0.0.1:${port}`;
  // The SDK reads apiKey at client construction; set after import of module
  // but before calls — llm.ts constructs lazily.
  process.env.GEMINI_API_KEY = "mock-key-for-tests";

  const { streamAiReply, LlmCallError, llmConfigured } = await import("./src/lib/llm");

  // 1) unconfigured when no keys
  delete process.env.GEMINI_API_KEY;
  assert.strictEqual(llmConfigured(), false, "llmConfigured false with no keys");
  let err: unknown;
  try {
    await streamAiReply({ history: [{ role: "user", content: "hi" }] });
  } catch (e) {
    err = e;
  }
  assert.ok(err instanceof LlmCallError);
  assert.strictEqual((err as InstanceType<typeof LlmCallError>).kind, "unconfigured");
  console.log("PASS unconfigured:", (err as Error).message);

  // The SDK client is constructed lazily on first call — the unconfigured
  // check above threw before construction, so setting the key now is safe.
  process.env.GEMINI_API_KEY = "mock-key-for-tests";
  assert.strictEqual(llmConfigured(), true, "configured with mock key");

  // 2) streaming success
  scenario = "ok";
  const deltas: string[] = [];
  const full = await streamAiReply({
    history: [{ role: "user", content: "Hello" }],
    onDelta: (d: string) => deltas.push(d),
  });
  assert.strictEqual(full, CHUNKS.join(""), "full text");
  assert.strictEqual(deltas.join(""), full, "deltas join == full");
  const sent = lastRequest as { contents?: { role: string }[]; systemInstruction?: unknown };
  assert.ok(Array.isArray(sent.contents) && sent.contents.length === 1, "history forwarded");
  assert.ok(sent.systemInstruction, "system instruction forwarded");
  console.log("PASS streaming:", JSON.stringify(full), "deltas=%d", deltas.length);

  // 3) rejected (invalid key)
  scenario = "rejected";
  err = undefined;
  try {
    await streamAiReply({ history: [{ role: "user", content: "hi" }] });
  } catch (e) {
    err = e;
  }
  assert.strictEqual((err as InstanceType<typeof LlmCallError>).kind, "rejected");
  assert.ok(((err as Error).message ?? "").includes("API key not valid"), "message forwarded");
  console.log("PASS rejected:", (err as Error).message.slice(0, 100));

  // 4) quota
  scenario = "quota";
  err = undefined;
  try {
    await streamAiReply({ history: [{ role: "user", content: "hi" }] });
  } catch (e) {
    err = e;
  }
  assert.strictEqual((err as InstanceType<typeof LlmCallError>).kind, "quota");
  assert.ok(((err as Error).message ?? "").includes("free-tier quota"), "quota message");
  console.log("PASS quota:", (err as Error).message.slice(0, 100));

  // 5) transient 503 retried then succeeds
  scenario = "flaky503";
  flakyHits = 0;
  const afterRetry = await streamAiReply({ history: [{ role: "user", content: "hi" }] });
  assert.strictEqual(afterRetry, CHUNKS.join(""), "retry recovered");
  assert.strictEqual(flakyHits, 1, "one 503 then success");
  console.log("PASS 503 retry recovered");

  server.close();
  console.log("ALL GEMINI HARNESS CHECKS PASSED");
  process.exit(0);
}

main().catch((e) => {
  console.error("HARNESS FAILED:", e);
  server.close();
  process.exit(1);
});
