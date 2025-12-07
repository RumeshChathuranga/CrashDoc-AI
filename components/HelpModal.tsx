import React from "react";
import GlassCard from "./GlassCard";
import {
  X,
  HelpCircle,
  Phone,
  FileText,
  Video,
  Mail,
  MessageCircle,
  Camera,
} from "lucide-react";

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const helpTopics = [
    {
      icon: Camera,
      title: "How to Document an Accident",
      description:
        "Step-by-step guide for capturing photos and creating reports",
      action: () => alert("Opening tutorial..."),
    },
    {
      icon: FileText,
      title: "Understanding Your Report",
      description:
        "Learn about severity scores, cost estimates, and AI analysis",
      action: () => alert("Opening guide..."),
    },
    {
      icon: Phone,
      title: "Emergency Services",
      description: "When and how to use the SOS mode",
      action: () => alert("Opening emergency guide..."),
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch walkthroughs of all features",
      action: () => window.open("https://youtube.com", "_blank"),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-slate-900/95 flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <HelpCircle className="w-7 h-7 text-blue-400" />
              Help Center
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Get assistance with CrashDoc AI
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Quick Help Topics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {helpTopics.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <button
                  key={index}
                  onClick={topic.action}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group"
                >
                  <Icon className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-1">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-gray-400">{topic.description}</p>
                </button>
              );
            })}
          </div>

          {/* FAQs */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Frequently Asked Questions
            </h3>
            <div className="space-y-3">
              {[
                {
                  q: "How accurate is the AI damage assessment?",
                  a: "Our Gemini 2.5 Flash AI provides professional-grade accuracy similar to experienced insurance adjusters, with 90%+ reliability.",
                },
                {
                  q: "Is my data secure and private?",
                  a: "Yes! All photos and reports are stored locally on your device. We use end-to-end encryption for any cloud backups.",
                },
                {
                  q: "Can I use this for insurance claims?",
                  a: "Absolutely! Our PDF reports are accepted by major insurance companies worldwide and meet industry standards.",
                },
                {
                  q: "Does it work offline?",
                  a: "You can capture photos offline, but AI analysis requires internet connection to access Gemini API.",
                },
              ].map((faq, index) => (
                <details
                  key={index}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <summary className="text-white font-medium cursor-pointer hover:text-blue-400 transition-colors">
                    {faq.q}
                  </summary>
                  <p className="text-sm text-gray-400 mt-2 pl-4">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
            <h3 className="text-lg font-semibold text-white mb-3">
              Still Need Help?
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:support@crashdoc.ai"
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-400" />
                <span>support@crashdoc.ai</span>
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Opening live chat...");
                }}
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-green-400" />
                <span>Live Chat Support</span>
              </a>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default HelpModal;
