"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, Mic, MicOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const EXAMPLES = [
  "I need a hospital with ICU availability.",
  "Find a cardiology specialist near me.",
  "Which hospital provides emergency respiratory care?",
  "Find hospitals with available beds.",
];

export function AiSearchPanel() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [placeholderIdx, setPlaceholderIdx] = React.useState(0);
  const [listening, setListening] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const { toast } = useToast();
  const recognitionRef = React.useRef<{
    stop: () => void;
    start: () => void;
  } | null>(null);

  React.useEffect(() => {
    const id = window.setInterval(
      () => setPlaceholderIdx((i) => (i + 1) % EXAMPLES.length),
      3600
    );
    return () => window.clearInterval(id);
  }, []);

  const submit = async (q: string) => {
    if (!q.trim()) {
      toast({
        title: "Please describe your requirement",
        description: "For example: “I need a hospital with ICU availability.”",
        variant: "info",
      });
      return;
    }
    setPending(true);
    // Route through the AI parser → hospital search results.
    try {
      const res = await fetch("/api/ai/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      const params = new URLSearchParams();
      params.set("q", q);
      if (json.data.specialty) params.set("specialty", json.data.specialty);
      if (json.data.requiresIcu) params.set("icu", "1");
      if (json.data.requiresEmergency) params.set("emergency", "1");
      router.push(`/hospitals?${params.toString()}`);
    } catch {
      toast({
        title: "Search could not start",
        description: "Please try again in a moment.",
        variant: "error",
      });
      setPending(false);
    }
  };

  const startVoice = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => unknown;
      webkitSpeechRecognition?: new () => unknown;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      toast({
        title: "Voice search unavailable",
        description:
          "Your browser does not support voice input. Please type your requirement instead.",
        variant: "warning",
      });
      return;
    }
    interface SR {
      lang: string;
      interimResults: boolean;
      onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
      onend: (() => void) | null;
      onerror: (() => void) | null;
      start: () => void;
      stop: () => void;
    }
    const rec = new Ctor() as SR;
    recognitionRef.current = rec;
    rec.lang = document.documentElement.lang === "hi" ? "hi-IN" : "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      if (transcript) setQuery(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => {
      setListening(false);
      toast({
        title: "Could not hear clearly",
        description: "Please try again or type your requirement.",
        variant: "warning",
      });
    };
    setListening(true);
    rec.start();
  };

  return (
    <section className="border-b border-slate-200 bg-primary-950 py-12">
      <div className="container max-w-3xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
          How can we help you today?
        </h2>
        <p className="mt-2 text-sm text-primary-200">
          Describe your medical requirement in your own words — our AI finds
          suitable hospitals for you.
        </p>

        <form
          className="mt-7"
          onSubmit={(e) => {
            e.preventDefault();
            void submit(query);
          }}
        >
          <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-white shadow-raised focus-within:border-care-400 focus-within:ring-2 focus-within:ring-care-400/40">
            <label htmlFor="ai-search" className="sr-only">
              Describe your healthcare requirement
            </label>
            <span className="flex items-center pl-4 text-slate-400" aria-hidden>
              <Search className="h-5 w-5" />
            </span>
            <input
              id="ai-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={EXAMPLES[placeholderIdx]}
              className="h-14 min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-slate-400 sm:text-base"
              aria-describedby="ai-search-hint"
            />
            <button
              type="button"
              onClick={startVoice}
              aria-label={listening ? "Stop voice search" : "Start voice search"}
              aria-pressed={listening}
              className={`hidden items-center px-3.5 transition-colors hover:bg-slate-50 sm:flex ${
                listening ? "text-red-600" : "text-slate-400"
              }`}
            >
              {listening ? (
                <>
                  <Mic className="h-5 w-5 animate-blink" aria-hidden />
                  <MicOff className="ml-1 h-3.5 w-3.5" aria-hidden />
                </>
              ) : (
                <Mic className="h-5 w-5" aria-hidden />
              )}
            </button>
            <div className="flex items-center pr-2">
              <Button type="submit" size="lg" loading={pending} className="gap-2">
                <BrainCircuit className="h-4.5 w-4.5" aria-hidden />
                Ask जीवन AI
              </Button>
            </div>
          </div>
          <p id="ai-search-hint" className="mt-3 text-xs text-primary-300">
            🎙 Voice search supported · Try:{" "}
            <em className="not-italic font-medium text-primary-100">
              “{EXAMPLES[(placeholderIdx + 1) % EXAMPLES.length]}”
            </em>
          </p>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setQuery(ex);
                void submit(ex);
              }}
              disabled={pending}
              className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs text-primary-100 transition-colors hover:border-white/50 hover:bg-white/10"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
