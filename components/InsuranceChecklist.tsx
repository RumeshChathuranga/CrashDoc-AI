import React, { useState } from "react";
import GlassCard from "./GlassCard";
import {
  CheckCircle2,
  Circle,
  FileText,
  Shield,
  Phone,
  Camera as CameraIcon,
  Users,
  AlertTriangle,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
}

interface InsuranceChecklistProps {
  onUpdateProgress: (progress: number) => void;
}

const InsuranceChecklist: React.FC<InsuranceChecklistProps> = ({
  onUpdateProgress,
}) => {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "1",
      title: "Document the Scene",
      description: "Take photos from all angles (front, rear, sides, damage)",
      icon: CameraIcon,
      completed: false,
    },
    {
      id: "2",
      title: "Exchange Information",
      description: "Get other driver's name, license, insurance, contact",
      icon: Users,
      completed: false,
    },
    {
      id: "3",
      title: "Police Report",
      description: "Call police if injuries or major damage occurred",
      icon: Shield,
      completed: false,
    },
    {
      id: "4",
      title: "Witness Details",
      description: "Collect contact info from any witnesses present",
      icon: Phone,
      completed: false,
    },
    {
      id: "5",
      title: "Note Conditions",
      description: "Record weather, road conditions, traffic signals",
      icon: AlertTriangle,
      completed: false,
    },
    {
      id: "6",
      title: "Medical Check",
      description: "Seek medical attention even for minor injuries",
      icon: FileText,
      completed: false,
    },
  ]);

  const toggleItem = (id: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);

    const completedCount = updatedItems.filter((item) => item.completed).length;
    const progress = (completedCount / updatedItems.length) * 100;
    onUpdateProgress(progress);

    if (navigator.vibrate) navigator.vibrate(30);
  };

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-gray-400 text-sm uppercase tracking-wider">
            Insurance Claim Checklist
          </h3>
        </div>
        <div className="text-sm font-semibold text-white">
          {completedCount}/{totalCount}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {progressPercent === 100
            ? "✅ All steps completed!"
            : `${Math.round(progressPercent)}% complete`}
        </p>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`w-full flex items-start gap-3 p-4 rounded-xl transition-all ${
                item.completed
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="mt-0.5">
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-500" />
                )}
              </div>

              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Icon
                    className={`w-4 h-4 ${
                      item.completed ? "text-green-400" : "text-gray-400"
                    }`}
                  />
                  <h4
                    className={`font-semibold text-sm ${
                      item.completed
                        ? "text-green-300 line-through"
                        : "text-white"
                    }`}
                  >
                    {item.title}
                  </h4>
                </div>
                <p
                  className={`text-xs ${
                    item.completed ? "text-green-400/70" : "text-gray-400"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {progressPercent === 100 && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
          <p className="text-sm text-green-300 text-center font-semibold">
            🎉 Great job! You're ready to file your insurance claim.
          </p>
        </div>
      )}
    </GlassCard>
  );
};

export default InsuranceChecklist;
