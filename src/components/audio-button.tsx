"use client";
import { useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import type { Language } from "@/lib/i18n";

export function AudioButton({ text, language }: { text: string; language: Language }) {
  const [playing, setPlaying] = useState(false);
  function toggle() {
    if (!("speechSynthesis" in window)) return;
    if (playing) { window.speechSynthesis.pause(); setPlaying(false); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = ({ en: "en-IN", hi: "hi-IN", te: "te-IN" })[language];
    utterance.rate = 0.92;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  }
  return <button className="audio-button" onClick={toggle}><span>{playing ? <Pause size={14}/> : <Play size={14}/>}</span>{playing ? "Pause audio" : "Listen to introduction"}<Volume2 size={15}/></button>;
}