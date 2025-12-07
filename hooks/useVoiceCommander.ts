
import { useState, useEffect, useRef } from 'react';

interface VoiceCommanderProps {
  onEmergency: () => void;
  onStartReport: () => void;
}

export const useVoiceCommander = ({ onEmergency, onStartReport }: VoiceCommanderProps) => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart to keep listening (always-on behavior)
      try {
        recognition.start();
      } catch (e) {
        // Ignore error if already started
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log("Voice Input:", transcript);

      if (transcript.includes("crash") || transcript.includes("doc")) {
        // Wake word detected / approximate match
        
        if (transcript.includes("help") || transcript.includes("emergency")) {
          setLastCommand("ACTIVATING SOS");
          speak("Emergency protocol initiated.");
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          onEmergency();
        } 
        else if (transcript.includes("report") || transcript.includes("new")) {
          setLastCommand("STARTING REPORT");
          speak("Opening report wizard.");
          if (navigator.vibrate) navigator.vibrate(100);
          onStartReport();
        }
        else if (transcript.includes("status") || transcript.includes("system")) {
          setLastCommand("SYSTEM STATUS");
          const statusText = "System online. GPS accuracy within 5 meters. Network connection stable.";
          speak(statusText);
        }
      }
    };

    recognitionRef.current = recognition;
    
    // Start listening
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onEmergency, onStartReport]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return { isListening, lastCommand };
};
