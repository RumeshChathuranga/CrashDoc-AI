import React, { useState, useEffect, useRef } from "react";
import { AppView } from "./types";
import Dashboard from "./components/Dashboard";
import SOSMode from "./components/SOSMode";
import ReportWizard from "./components/ReportWizard";
import AnalysisResult from "./components/AnalysisResult";
import LiveHelpMode from "./components/LiveHelpMode"; // Import LiveHelpMode
import CrashAlert from "./components/CrashAlert";
import SettingsModal from "./components/SettingsModal";
import HelpModal from "./components/HelpModal";
import CommunityModal from "./components/CommunityModal";
import { CrashDetector } from "./CrashDetector";
import { Settings, HelpCircle, Users } from "lucide-react";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [reportData, setReportData] = useState<any>(null);
  const [isCrashDetected, setIsCrashDetected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const crashDetectorRef = useRef<CrashDetector | null>(null);

  // Initialize Crash Detector
  useEffect(() => {
    const detector = new CrashDetector(() => {
      setIsCrashDetected(true);
    });

    // Attempt to start automatically (works on non-iOS or if permission already granted)
    detector.start();

    crashDetectorRef.current = detector;

    return () => {
      detector.stop();
    };
  }, []);

  const handleManualTestCrash = () => {
    // Explicitly call start() again on user interaction to handle iOS permissions if needed
    crashDetectorRef.current?.start();
    crashDetectorRef.current?.simulateCrash();
  };

  const handleCrashConfirm = () => {
    setIsCrashDetected(false);
    setCurrentView(AppView.SOS_MODE);
  };

  const handleCrashCancel = () => {
    setIsCrashDetected(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-900 text-white selection:bg-purple-500 selection:text-white">
      {/* Animated Background Blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vw] rounded-full bg-purple-900/20 blur-3xl filter animate-pulse"></div>
        <div
          className="absolute top-[40%] -right-[10%] h-[60vh] w-[60vw] rounded-full bg-blue-900/20 blur-3xl filter animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute -bottom-[20%] left-[20%] h-[50vh] w-[50vw] rounded-full bg-indigo-900/20 blur-3xl filter animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* High Priority Alerts */}
      {isCrashDetected && (
        <CrashAlert
          onCancel={handleCrashCancel}
          onConfirmSOS={handleCrashConfirm}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onTestCrash={handleManualTestCrash}
        />
      )}

      {/* Help Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* Community Modal */}
      {showCommunity && (
        <CommunityModal onClose={() => setShowCommunity(false)} />
      )}

      {/* Main Content Layer */}
      <div className="relative z-10 min-h-screen pb-20">
        {currentView === AppView.DASHBOARD && (
          <Dashboard
            onStartReport={() => setCurrentView(AppView.NEW_REPORT)}
            onEmergency={() => setCurrentView(AppView.SOS_MODE)}
            onLiveHelp={() => setCurrentView(AppView.LIVE_HELP)} // Route to Live Help
            onViewReport={(data) => {
              setReportData(data);
              setCurrentView(AppView.ANALYSIS);
            }}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        {currentView === AppView.SOS_MODE && (
          <SOSMode onExit={() => setCurrentView(AppView.DASHBOARD)} />
        )}

        {currentView === AppView.LIVE_HELP && (
          <LiveHelpMode onExit={() => setCurrentView(AppView.DASHBOARD)} />
        )}

        {currentView === AppView.NEW_REPORT && (
          <ReportWizard
            onCancel={() => setCurrentView(AppView.DASHBOARD)}
            onComplete={(data) => {
              setReportData(data);
              setCurrentView(AppView.ANALYSIS);
            }}
          />
        )}

        {currentView === AppView.ANALYSIS && (
          <AnalysisResult
            data={reportData}
            onBack={() => setCurrentView(AppView.DASHBOARD)}
          />
        )}
      </div>

      {/* Bottom Navigation Bar */}
      {currentView === AppView.DASHBOARD && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-around items-center">
            <button
              onClick={() => setShowSettings(true)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/10 transition-all group"
            >
              <Settings className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                Settings
              </span>
            </button>

            <button
              onClick={() => setShowHelp(true)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/10 transition-all group"
            >
              <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                Help
              </span>
            </button>

            <button
              onClick={() => setShowCommunity(true)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/10 transition-all group"
            >
              <Users className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                Community
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
