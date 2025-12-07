
import React, { useEffect, useState } from 'react';
import { Mic } from 'lucide-react';

interface VoiceVisualizerProps {
  isListening: boolean;
  lastCommand: string | null;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isListening, lastCommand }) => {
  const [displayCommand, setDisplayCommand] = useState<string | null>(null);

  useEffect(() => {
    if (lastCommand) {
      setDisplayCommand(lastCommand);
      const timer = setTimeout(() => setDisplayCommand(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastCommand]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none flex justify-center pb-6">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl">
        <div className={`p-2 rounded-full ${isListening ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500'}`}>
          <Mic className="w-4 h-4" />
        </div>

        {/* Waveform Animation */}
        <div className="flex items-center gap-1 h-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-1 rounded-full bg-blue-400 transition-all duration-150 ${
                isListening ? 'animate-waveform' : 'h-1 opacity-30'
              }`}
              style={{
                animationDelay: `${i * 0.1}s`,
                height: isListening ? '100%' : '20%'
              }}
            />
          ))}
        </div>

        <div className="min-w-[100px]">
          <p className="text-xs font-mono font-medium text-blue-100/80">
            {displayCommand ? (
              <span className="text-cyan-400 animate-pulse">{displayCommand}</span>
            ) : (
              <span className="opacity-50">"CrashDoc..."</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceVisualizer;
