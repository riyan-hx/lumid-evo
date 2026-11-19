"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Microphone recording kept on the device as a data URL. Falls back gracefully when the mic is unavailable. */
export function useRecorder() {
  const [state, setState] = useState<"idle" | "recording" | "done" | "denied">("idle");
  const [seconds, setSeconds] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  const stop = useCallback(() => {
    clearInterval(timer.current);
    if (rec.current?.state === "recording") rec.current.stop();
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const r = new MediaRecorder(stream);
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const reader = new FileReader();
        reader.onload = () => {
          setUrl(reader.result as string);
          setState("done");
        };
        reader.readAsDataURL(new Blob(chunks, { type: r.mimeType }));
      };
      rec.current = r;
      r.start();
      setSeconds(0);
      setState("recording");
      timer.current = setInterval(() => setSeconds((s) => (s >= 179 ? (stop(), s) : s + 1)), 1000);
    } catch {
      setState("denied");
    }
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setUrl(null);
    setSeconds(0);
    setState("idle");
  }, [stop]);

  useEffect(() => () => stop(), [stop]);
  return { state, seconds, url, start, stop, reset, setUrl };
}

export const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
