
import React, { useEffect, useState, useRef } from 'react';
import { ShieldAlert, XCircle } from 'lucide-react';

interface CrashAlertProps {
  onCancel: () => void;
  onConfirmSOS: () => void;
}

const CrashAlert: React.FC<CrashAlertProps> = ({ onCancel, onConfirmSOS }) => {
  const [countdown, setCountdown] = useState(10);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    // Start Countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onConfirmSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start Audio Alarm
    const playAlarm = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        audioContextRef.current = ctx;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5); // Drop to A4 (Siren effect)
        
        // LFO for rapid beeping
        const lfo = ctx.createOscillator();
        lfo.type = 'square';
        lfo.frequency.value = 4; // 4 Hz beep
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 1000;
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        oscillatorRef.current = osc;

        // Loop the siren effect
        const sirenInterval = setInterval(() => {
            if(osc.frequency) {
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
            }
        }, 1000);

        return () => clearInterval(sirenInterval);

      } catch (e) {
        console.error("Audio play failed", e);
      }
    };

    const stopAlarm = playAlarm();

    // Haptic SOS Pattern
    if (navigator.vibrate) {
        const interval = setInterval(() => {
            navigator.vibrate([200, 100, 200, 100, 500]);
        }, 1500);
        return () => {
            clearInterval(timer);
            if (stopAlarm) stopAlarm();
            clearInterval(interval);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }

    return () => {
      clearInterval(timer);
      if (stopAlarm) stopAlarm();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [onConfirmSOS]);

  return (
    <div className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center p-6 text-white animate-pulse">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500 to-red-900"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl animate-bounce">
          <ShieldAlert className="w-16 h-16 text-red-600" />
        </div>
        
        <h1 className="text-4xl font-black uppercase tracking-widest mb-2">Crash Detected</h1>
        <p className="text-xl font-medium opacity-90 mb-10">Initiating Emergency Response</p>
        
        <div className="text-9xl font-black font-mono mb-12 tabular-nums">
          00:{countdown.toString().padStart(2, '0')}
        </div>

        <button 
          onClick={onCancel}
          className="flex items-center gap-3 px-10 py-5 bg-white text-red-600 rounded-full text-xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-transform"
        >
          <XCircle className="w-8 h-8" />
          I AM OKAY - CANCEL
        </button>
      </div>
    </div>
  );
};

export default CrashAlert;
