import React, { useState, useEffect } from "react";
import { Wifi, Activity, Navigation, Zap } from "lucide-react";
import GlassCard from "./GlassCard";

const SystemMonitor: React.FC = () => {
  const [latency, setLatency] = useState(24);
  const [gpsStrength, setGpsStrength] = useState(4);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Clock tick
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 60000);

    // Simulate network latency fluctuation
    const netInterval = setInterval(() => {
      setLatency((prev) =>
        Math.max(
          12,
          Math.min(
            60,
            prev +
              (Math.random() > 0.5
                ? Math.floor(Math.random() * 5)
                : -Math.floor(Math.random() * 5))
          )
        )
      );
    }, 2000);

    // Simulate GPS signal fluctuation
    const gpsInterval = setInterval(() => {
      setGpsStrength(Math.random() > 0.9 ? 3 : 4);
    }, 5000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(netInterval);
      clearInterval(gpsInterval);
    };
  }, []);

  return (
    <GlassCard className="col-span-1 md:col-span-1 p-6 flex flex-col justify-between h-full relative overflow-hidden group shadow-xl shadow-blue-500/5">
      {/* Background Tech Elements */}
      <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
        <Activity className="w-32 h-32 text-blue-400" />
      </div>
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl" />

      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400/10">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <h2 className="text-gray-300 text-xs font-bold uppercase tracking-widest">
              System Telemetry
            </h2>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">
              ONLINE
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {/* GPS Signal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Navigation className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-200">GPS Signal</span>
            </div>
            <div className="flex gap-1 items-end h-4">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`w-1 rounded-sm transition-all duration-500 ${
                    bar <= gpsStrength ? "bg-blue-500" : "bg-white/10"
                  }`}
                  style={{ height: `${bar * 25}%` }}
                />
              ))}
            </div>
          </div>

          {/* Network Latency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wifi className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-200">Network</span>
            </div>
            <div className="text-right">
              <span
                className={`text-sm font-mono font-bold ${
                  latency < 40 ? "text-emerald-400" : "text-yellow-400"
                }`}
              >
                {latency}ms
              </span>
            </div>
          </div>

          {/* AI Core Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-200">AI Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 uppercase">Idle</span>
              <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500/50 w-full origin-left animate-pulse transform scale-x-50"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end">
        <div className="text-xs text-gray-500 font-mono">
          {currentTime.toLocaleDateString()}
        </div>
        <div className="text-xl font-light text-white tracking-tight">
          {currentTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </GlassCard>
  );
};

export default SystemMonitor;
