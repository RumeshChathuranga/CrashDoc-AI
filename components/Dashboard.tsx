import React from "react";
import GlassCard from "./GlassCard";
import SystemMonitor from "./SystemMonitor";
import {
  ShieldAlert,
  Camera,
  History,
  ChevronRight,
  Menu,
  Settings,
  Mic,
} from "lucide-react";

interface DashboardProps {
  onStartReport: () => void;
  onEmergency: () => void;
  onViewReport: (data: any) => void;
  onOpenSettings: () => void;
  onLiveHelp: () => void; // New Prop
}

const Dashboard: React.FC<DashboardProps> = ({
  onStartReport,
  onEmergency,
  onViewReport,
  onOpenSettings,
  onLiveHelp,
}) => {
  const recentReports = [
    {
      id: "ACC-2025-12-07",
      date: "Dec 7, 2025",
      location: "Galle Road, Colombo",
      status: "Complete",
    },
    {
      id: "ACC-2025-11-15",
      date: "Nov 15, 2025",
      location: "Kandy Road",
      status: "In Review",
    },
  ];

  const handleStartReport = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    onStartReport();
  };

  const handleEmergency = () => {
    if (navigator.vibrate) navigator.vibrate(100);
    onEmergency();
  };

  const handleLiveHelp = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    onLiveHelp();
  };

  const handleViewReport = (data: any) => {
    if (navigator.vibrate) navigator.vibrate(20);
    onViewReport(data);
  };

  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto px-4 py-6 md:px-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-orange-600 flex items-center justify-center shadow-xl shadow-red-500/30 ring-2 ring-red-400/20">
            <ShieldAlert className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              CrashDoc AI
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Professional Accident Documentation
            </p>
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer active:scale-95 duration-200 shadow-lg"
        >
          <Settings className="w-5 h-5 text-gray-300" />
        </button>
      </header>

      {/* Bento Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-4 pb-20">
        {/* System Monitor Component */}
        <SystemMonitor />

        {/* SOS Action Card */}
        <GlassCard
          onClick={handleEmergency}
          className="col-span-1 md:col-span-2 p-8 flex items-center justify-between relative group overflow-hidden cursor-pointer border-red-500/40 shadow-2xl shadow-red-500/10"
          hoverEffect
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 via-red-500/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-300 font-semibold uppercase tracking-wider">
                Emergency Response
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 group-hover:scale-105 transition-transform origin-left">
              Emergency SOS
            </h2>
            <p className="text-red-100/90 text-sm max-w-[85%] leading-relaxed">
              One-tap alert to Police, Ambulance, and Emergency Contacts.
              Activates live location beacon.
            </p>
          </div>
          <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.6)] animate-pulse group-hover:shadow-[0_0_60px_rgba(220,38,38,0.9)] transition-all group-hover:scale-110 ring-4 ring-red-500/30">
            <ShieldAlert className="w-10 h-10 text-white" />
          </div>
        </GlassCard>

        {/* Start New Report */}
        <GlassCard
          onClick={handleStartReport}
          className="col-span-1 md:col-span-1 md:row-span-2 p-8 flex flex-col justify-between relative group cursor-pointer shadow-2xl shadow-blue-500/10"
          hoverEffect
        >
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-800/50 to-transparent z-0" />
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-2">
                <div className="h-1 w-8 bg-blue-400 rounded-full" />
                <span className="text-xs text-blue-300 font-semibold uppercase">Report</span>
            </div>
            <Camera className="w-6 h-6 text-blue-300 group-hover:scale-110 transition-transform" />
          </div>

          <div className="relative z-10 mt-8">
            <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
              New Report
            </h2>
            <p className="text-blue-100/80 text-sm mb-6 leading-relaxed">
              AI-guided documentation in 3 minutes.
            </p>
            <div className="w-full py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-sm font-semibold group-hover:bg-white/20 transition-all">
              Start <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </GlassCard>

        {/* Live Assistant Card (New) */}
        <GlassCard
          onClick={handleLiveHelp}
          className="col-span-1 md:col-span-1 md:row-span-2 p-8 flex flex-col justify-between relative group cursor-pointer shadow-2xl shadow-purple-500/10"
          hoverEffect
        >
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-800/50 to-transparent z-0" />
          <div className="relative z-10 flex justify-between items-start">
             <div className="flex items-center gap-2">
                <div className="h-1 w-8 bg-purple-400 rounded-full" />
                <span className="text-xs text-purple-300 font-semibold uppercase">Voice</span>
            </div>
            <Mic className="w-6 h-6 text-purple-300 group-hover:scale-110 transition-transform" />
          </div>

          <div className="relative z-10 mt-8">
            <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
              Live Help
            </h2>
            <p className="text-purple-100/80 text-sm mb-6 leading-relaxed">
              Real-time voice guidance with Gemini Live.
            </p>
            <div className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center text-sm font-semibold transition-all shadow-lg shadow-purple-500/30">
              Start Call
            </div>
          </div>
        </GlassCard>

        {/* Recent Reports */}
        <GlassCard className="col-span-1 p-6 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <History className="w-4 h-4 text-gray-400" />
              Recent
            </h3>
            <span className="text-xs text-blue-400 cursor-pointer hover:underline">
              All
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {recentReports.map((report) => (
              <div
                key={report.id}
                onClick={() => handleViewReport({ id: report.id })}
                className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer active:scale-98"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium text-gray-300">
                    {report.id}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      report.status === "Complete"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{report.location}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
