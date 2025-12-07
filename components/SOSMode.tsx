
import React, { useState, useEffect } from 'react';
import { X, Phone, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';
import GlassCard from './GlassCard';

interface SOSModeProps {
  onExit: () => void;
}

const SOSMode: React.FC<SOSModeProps> = ({ onExit }) => {
  const [status, setStatus] = useState<'COUNTDOWN' | 'ACTIVATING' | 'ACTIVE'>('COUNTDOWN');
  const [countdown, setCountdown] = useState(3);
  const [notified, setNotified] = useState<{ police: boolean; ambulance: boolean; contacts: boolean }>({
    police: false,
    ambulance: false,
    contacts: false,
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (status === 'COUNTDOWN') {
      if (countdown > 0) {
        // Haptic pulse for each second
        if (navigator.vibrate) navigator.vibrate(50);
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        setStatus('ACTIVATING');
        // Heavy SOS Haptic Pattern
        if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
      }
    } else if (status === 'ACTIVATING') {
      // Simulate API calls
      setTimeout(() => setNotified(prev => ({ ...prev, police: true })), 1500);
      setTimeout(() => setNotified(prev => ({ ...prev, ambulance: true })), 2500);
      setTimeout(() => {
        setNotified(prev => ({ ...prev, contacts: true }));
        setStatus('ACTIVE');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Success pattern
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [status, countdown]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-red-900/20 animate-pulse pointer-events-none" />
      
      {status === 'COUNTDOWN' && (
        <div className="flex flex-col items-center z-10">
          <div className="w-48 h-48 rounded-full border-4 border-red-500 flex items-center justify-center mb-8 relative">
            <span className="text-8xl font-bold text-red-500">{countdown}</span>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                className="text-transparent"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="92"
                cx="96"
                cy="96"
              />
              <circle
                className="text-red-500 transition-all duration-1000 ease-linear"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 92}
                strokeDashoffset={2 * Math.PI * 92 * ((3 - countdown) / 3)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="92"
                cx="96"
                cy="96"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Sending Emergency Alert</h2>
          <p className="text-gray-400 mb-8">Tap cancel if this is a mistake.</p>
          <button 
            onClick={onExit}
            className="px-12 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all"
          >
            Cancel Alert
          </button>
        </div>
      )}

      {(status === 'ACTIVATING' || status === 'ACTIVE') && (
        <div className="w-full max-w-md z-10 flex flex-col gap-4">
          <GlassCard className="p-6 border-red-500/50 bg-red-950/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center animate-bounce">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Emergency Mode Active</h2>
                <p className="text-red-200 text-sm">Broadcasting location...</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${notified.police ? 'bg-green-500' : 'bg-yellow-500 animate-ping'}`} />
                  <span>Police (119)</span>
                </div>
                {notified.police ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${notified.ambulance ? 'bg-green-500' : 'bg-yellow-500 animate-ping'}`} />
                  <span>Ambulance (1990)</span>
                </div>
                {notified.ambulance ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${notified.contacts ? 'bg-green-500' : 'bg-yellow-500 animate-ping'}`} />
                  <span>Emergency Contacts</span>
                </div>
                {notified.contacts ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex items-center justify-between">
            <div className="text-sm text-gray-300">
              <p>GPS Location</p>
              <p className="text-white font-mono">6.9271° N, 79.8612° E</p>
            </div>
            <button className="p-3 bg-green-600 rounded-full hover:bg-green-500 transition-colors">
              <Phone className="w-6 h-6 text-white" />
            </button>
          </GlassCard>

          <button 
            onClick={onExit}
            className="mt-8 text-sm text-gray-400 underline hover:text-white transition-colors"
          >
            I am safe now, cancel emergency
          </button>
        </div>
      )}
    </div>
  );
};

export default SOSMode;
