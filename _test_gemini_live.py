"""Live Gemini battery: real free-tier API through the app."""
import json
import sys
import time
import urllib.error
import urllib.request

sys.stdout.reconfigure(errors="replace")
BASE = "http://localhost:3006"
results = []


def chat(msg, timeout=120, **kw):
    body = json.dumps(dict(message=msg, **kw)).encode()
    req = urllib.request.Request(
        BASE + "/api/ai/chat", data=body, headers={"Content-Type": "application/json"}
    )
    raw = urllib.request.urlopen(req, timeout=timeout).read().decode("utf-8")
    ev = [json.loads(l[5:]) for l in raw.split("\n\n") if l.strip().startswith("data:")]
    meta = next(e for e in ev if e["type"] == "meta")
    done = next((e for e in ev if e["type"] == "done"), {})
    deltas = [e["text"] for e in ev if e["type"] == "delta"]
    return meta, done, deltas


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(("PASS " if ok else "FAIL ") + name + (" :: " + detail if detail else ""))


YM = dict(lat=30.1290, lng=77.2674, locationLabel="Yamunanagar, Haryana")
CFG = ("not configured", "GEMINI_API_KEY")

# G0: key detected server-side
meta, done, deltas = chat("Hello")
check("G0 Gemini key detected (aiStatus ready)",
      meta.get("aiConfigured") is True and meta.get("aiStatus") == "ready",
      f"aiConfigured={meta.get('aiConfigured')} aiStatus={meta.get('aiStatus')}")
r1 = done.get("reply") or ""
print("   greeting:", r1[:200].replace("\n", " "))
check("G1 greeting streams real Gemini reply",
      done.get("engine") == "llm" and len(deltas) >= 2 and "".join(deltas) == r1
      and len(r1.strip()) > 10 and not any(m in r1 for m in CFG),
      f"engine={done.get('engine')} deltas={len(deltas)} len={len(r1)}")

time.sleep(6)

# G2: medical information question
meta, done, deltas = chat("What is high blood pressure and why does it matter?")
r2 = done.get("reply") or ""
low = r2.lower()
check("G2 medical info from Gemini",
      done.get("engine") == "llm" and len(deltas) >= 2
      and any(w in low for w in ("blood pressure", "hypertension", "heart", "doctor", "mmhg"))
      and "km away" not in r2 and not any(m in r2 for m in CFG),
      f"reply={r2[:150]!r}")

time.sleep(6)

# G3: follow-up keeps context
meta, done, deltas = chat(
    "How can I keep it under control?",
    sessionId="gemini-suite",
    history=[
        {"role": "user", "content": "What is high blood pressure and why does it matter?"},
        {"role": "assistant", "content": r2},
    ],
)
r3 = done.get("reply") or ""
low3 = r3.lower()
check("G3 follow-up uses context",
      done.get("engine") == "llm" and len(r3.strip()) > 10
      and any(w in low3 for w in ("salt", "exercise", "diet", "medicine", "lifestyle", "pressure", "doctor"))
      and r3 != r2 and not any(m in r3 for m in CFG),
      f"reply={r3[:150]!r}")

time.sleep(6)

# G4: explicit city hospital search (Yamunanagar named, no GPS coords)
meta, done, deltas = chat("Find hospitals in Yamunanagar")
r4 = done.get("reply") or ""
recs = meta["recommendations"]
names = [r["name"] for r in recs]
mentions = any(n.split()[0].lower() in r4.lower() for n in names[:3]) if names else False
check("G4 Yamunanagar city search + grounded reply",
      meta.get("dataSource") in ("google-places", "internal-db") and len(recs) >= 1
      and done.get("engine") == "llm" and mentions and not any(m in r4 for m in CFG),
      f"src={meta.get('dataSource')} searched={meta.get('searchedLocation')} names={names[:3]} mentions={mentions}")

time.sleep(6)

# G5: emergency leads with 112/108, search still runs
meta, done, deltas = chat("I have severe chest pain and sweating", **YM)
r5 = done.get("reply") or ""
check("G5 emergency: 112/108 first + search runs",
      meta.get("urgency") == "EMERGENCY" and ("112" in r5 or "108" in r5)
      and r5.lower().find("112") < 150 and len(meta["recommendations"]) >= 1
      and done.get("engine") == "llm",
      f"recs={len(meta['recommendations'])} reply={r5[:140]!r}")

time.sleep(6)

# G6: empty message -> 4xx validation, no API call
body = json.dumps({"message": "   "}).encode()
req = urllib.request.Request(BASE + "/api/ai/chat", data=body, headers={"Content-Type": "application/json"})
try:
    resp = urllib.request.urlopen(req, timeout=30)
    status, payload = resp.status, resp.read().decode()
except urllib.error.HTTPError as e:
    status, payload = e.code, e.read().decode()
check("G6 empty message -> HTTP 4xx", 400 <= status < 500, f"status={status} body={payload[:100]}")

time.sleep(6)

# G7: no-location search asks honestly (no default city)
meta, done, deltas = chat("Find hospitals near me")
check("G7 no location -> honest question",
      meta.get("askForLocation") is True and len(meta["recommendations"]) == 0,
      f"reply={(done.get('reply') or '')[:90]}")

# G8: page UI intact
html = urllib.request.urlopen(BASE + "/ai-assistant", timeout=60).read().decode("utf-8", "replace")
check("G8 page UI intact",
      'aria-label="Start voice input"' in html and "Nearby Care" in html
      and "AI chat not configured" not in html)

print()
passed = sum(1 for _, ok, _ in results if ok)
print(f"GEMINI LIVE BATTERY: {passed}/{len(results)} passed")
for name, ok, detail in results:
    if not ok:
        print("  FAILED:", name, "-", detail)
