import { useCallback, useEffect, useRef, useState } from "react";
import { AiOrb } from "@/components/ai-orb";
import { Button } from "@/components/ui-kit";
import {
  conversation,
  interpretUserInput,
  processNewRequest,
  processClarificationAnswer,
  processSearchAndRecommend,
  approveContact,
  declineContact,
  showAllProviders,
  selectProvider,
  explainWhy,
  startProviderChat,
  type OrbState,
} from "@/lib/conversation-engine";
import { useOnboarding } from "@/lib/onboarding-store";

/**
 * Hands-off mode — immersive full-screen overlay with animated orb.
 * Uses Web Speech API (SpeechRecognition + SpeechSynthesis) when available.
 * Falls back to text input when not supported.
 */

// ── Web Speech API types (not in TS stdlib) ────────────────────────
interface SpeechRecognitionEvent {
  results: {
    length: number;
    [index: number]: { 0: { transcript: string }; isFinal: boolean };
  };
  resultIndex: number;
}
interface SpeechRecognitionType {
  new (): {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((e: SpeechRecognitionEvent) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
  };
}

function getSpeechRecognition(): SpeechRecognitionType | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition || w.webkitSpeechRecognition) as SpeechRecognitionType | null;
}

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

type HandsOffProps = {
  onExit: () => void;
  onSeeProviders: () => void;
};

export function HandsOffMode({ onExit, onSeeProviders }: HandsOffProps) {
  const { customer } = useOnboarding();
  const firstName = customer.name.trim().split(" ")[0];

  const conv = conversation.get();
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [transcript, setTranscript] = useState("");
  const [lastSpoken, setLastSpoken] = useState("");
  const [listening, setListening] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [amplitude, setAmplitude] = useState(0);

  const recognitionRef = useRef<ReturnType<SpeechRecognitionType["new"]> | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const amplitudeRafRef = useRef<number | null>(null);
  const hasGreetedRef = useRef(false);
  const spokenRef = useRef(false);

  const speechSupported = !!getSpeechRecognition();
  const synthSupported = !!getSpeechSynthesis();

  // ── Subscribe to conversation state ────────────────────────────
  useEffect(() => {
    return conversation.subscribe(() => {
      const s = conversation.get();
      setOrbState(s.orbState);
    });
  }, []);

  // ── Speak helper (TTS) ─────────────────────────────────────────
  const speak = useCallback((text: string) => {
    setLastSpoken(text);
    if (!synthSupported || !synthRef.current) return;
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.volume = 0.9;
    setOrbState("speaking");
    utter.onend = () => {
      const s = conversation.get();
      setOrbState(s.orbState);
    };
    synthRef.current.speak(utter);
  }, [synthSupported]);

  // ── Greet on mount ──────────────────────────────────────────────
  useEffect(() => {
    synthRef.current = getSpeechSynthesis();
    if (hasGreetedRef.current) return;
    hasGreetedRef.current = true;
    const greeting = firstName
      ? `Hi, ${firstName}. What would you like to get done?`
      : "Hi. What would you like to get done?";
    conversation.resetPhase();
    setOrbState("speaking");
    setLastSpoken(greeting);
    speak(greeting);
  }, [firstName, speak]);

  // ── Audio amplitude for orb reactivity ──────────────────────────
  const startAmplitudeMonitor = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i]!;
        const avg = sum / data.length / 255;
        setAmplitude(Math.min(1, avg * 1.5));
        amplitudeRafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Mic permission denied — orb stays calm, that's fine
    }
  }, []);

  const stopAmplitudeMonitor = useCallback(() => {
    if (amplitudeRafRef.current) cancelAnimationFrame(amplitudeRafRef.current);
    amplitudeRafRef.current = null;
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAmplitude(0);
  }, []);

  // ── Start listening ─────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setShowTextInput(true);
      return;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* noop */ }
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    setListening(true);
    setOrbState("listening");
    startAmplitudeMonitor();

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i]![0]!.transcript;
      }
      setTranscript(text);
    };
    rec.onerror = () => {
      setListening(false);
      stopAmplitudeMonitor();
      setShowTextInput(true);
    };
    rec.onend = () => {
      setListening(false);
      stopAmplitudeMonitor();
      const s = conversation.get();
      setOrbState(s.orbState);
    };
    recognitionRef.current = rec;
    try { rec.start(); } catch { /* already started */ }
  }, [startAmplitudeMonitor, stopAmplitudeMonitor]);

  // ── Process user input (from speech or text) ────────────────────
  const processInput = useCallback((text: string) => {
    if (!text.trim()) return;
    setTranscript("");
    setTextInput("");
    spokenRef.current = false;

    const action = interpretUserInput(text);
    const s = conversation.get();

    // Exit hands-off
    if (action.type === "exit-hands-off") {
      onExit();
      return;
    }

    // See more/all providers → exit to provider view
    if (action.type === "see-more-providers" || action.type === "see-all-providers") {
      const response = showAllProviders();
      speak(response);
      setTimeout(() => onSeeProviders(), 800);
      return;
    }

    // New request
    if (action.type === "new-request") {
      const result = processNewRequest(text);
      if (result.needsClarification) {
        speak(result.response);
      } else {
        // No clarification needed — speak understanding, then search
        speak(result.response);
        setTimeout(() => {
          const searchResult = processSearchAndRecommend();
          speak(searchResult.response);
        }, 2500);
      }
      return;
    }

    // Answer clarification
    if (action.type === "answer-clarification") {
      const result = processClarificationAnswer(text);
      if (result.done) {
        // No more questions → search
        speak(result.response);
        setTimeout(() => {
          const searchResult = processSearchAndRecommend();
          speak(searchResult.response);
        }, 2500);
      } else {
        speak(result.response);
      }
      return;
    }

    // Approve contact
    if (action.type === "approve-contact") {
      const response = approveContact(action.providerName);
      speak(response);
      return;
    }

    // Decline contact
    if (action.type === "decline-contact") {
      const response = declineContact();
      speak(response);
      return;
    }

    // Select provider
    if (action.type === "select-provider") {
      const response = selectProvider(action.providerName);
      speak(response);
      return;
    }

    // Ask why
    if (action.type === "ask-why") {
      const response = explainWhy(action.providerName);
      speak(response);
      return;
    }

    // Chat with provider
    if (action.type === "chat-with-provider") {
      const response = startProviderChat(action.providerName);
      speak(response);
      setTimeout(() => onSeeProviders(), 1000);
      return;
    }

    // Tell more — treat as explain why
    if (action.type === "tell-more") {
      const response = explainWhy(action.providerName);
      speak(response);
      return;
    }

    // Unknown
    if (action.type === "unknown") {
      const response = "I'm not sure I understood that. Could you rephrase?";
      speak(response);
      return;
    }
  }, [onExit, onSeeProviders, speak]);

  // ── Auto-process transcript when speech finalizes ───────────────
  useEffect(() => {
    if (!listening && transcript.trim()) {
      processInput(transcript);
    }
  }, [listening, transcript, processInput]);

  // ── Cleanup on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopAmplitudeMonitor();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* noop */ }
      }
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [stopAmplitudeMonitor]);

  // ── Tap orb to listen (or show text input fallback) ─────────────
  const handleOrbTap = useCallback(() => {
    if (listening) return;
    if (speechSupported) {
      startListening();
    } else {
      setShowTextInput((v) => !v);
    }
  }, [listening, speechSupported, startListening]);

  return (
    <div className="hands-off-overlay fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Exit button */}
      <button
        type="button"
        onClick={onExit}
        className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-subtle transition-colors hover:text-foreground"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        Exit hands-off
      </button>

      {/* Orb */}
      <button
        type="button"
        onClick={handleOrbTap}
        className="group relative flex flex-col items-center justify-center rounded-full focus:outline-none"
        aria-label={listening ? "Listening — tap to stop" : "Tap to speak"}
      >
        <AiOrb state={orbState} size={240} amplitude={amplitude} />
        <span className="mt-2 text-xs text-muted-foreground transition-opacity duration-300 group-hover:opacity-70">
          {listening ? "Listening…" : speechSupported ? "Tap to speak" : "Type below"}
        </span>
      </button>

      {/* Last spoken text (subtitle) */}
      {lastSpoken ? (
        <div className="mt-6 max-w-lg px-6 text-center">
          <p className="rise-in text-sm leading-relaxed text-foreground/80">
            {lastSpoken}
          </p>
        </div>
      ) : null}

      {/* Live transcript */}
      {transcript && listening ? (
        <div className="mt-4 max-w-lg px-6 text-center">
          <p className="text-sm italic text-muted-foreground">"{transcript}"</p>
        </div>
      ) : null}

      {/* Text input fallback / alternative */}
      {showTextInput || !speechSupported ? (
        <form
          className="mt-6 w-full max-w-md px-6"
          onSubmit={(e) => {
            e.preventDefault();
            processInput(textInput);
          }}
        >
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-subtle">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your message…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />
            <Button type="submit" disabled={!textInput.trim()} size="md">
              Send
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {speechSupported ? "Voice not available — type instead" : "Voice not supported in this browser"}
          </p>
        </form>
      ) : null}

      {/* Quick actions */}
      <div className="mt-8 flex gap-2">
        <Button
          variant="secondary"
          onClick={() => setShowTextInput((v) => !v)}
          className="text-xs"
        >
          {showTextInput ? "Hide keyboard" : "Use keyboard"}
        </Button>
      </div>

      {/* Conversation phase indicator (subtle, bottom) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
          {conv.phase === "awaiting-input" ? "Hands-off mode" : conv.phase.replace(/-/g, " ")}
        </span>
      </div>
    </div>
  );
}
