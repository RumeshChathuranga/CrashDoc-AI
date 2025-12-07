import React from "react";
import GlassCard from "./GlassCard";
import {
  X,
  Users,
  MessageSquare,
  TrendingUp,
  Award,
  Globe,
  Heart,
} from "lucide-react";

interface CommunityModalProps {
  onClose: () => void;
}

const CommunityModal: React.FC<CommunityModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-slate-900/95 flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="w-7 h-7 text-purple-400" />
              Community
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Connect with other CrashDoc AI users
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Community Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30">
              <TrendingUp className="w-6 h-6 text-blue-400 mb-2" />
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-xs text-gray-400">Active Users</div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30">
              <Award className="w-6 h-6 text-green-400 mb-2" />
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-xs text-gray-400">Reports Created</div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30">
              <Globe className="w-6 h-6 text-purple-400 mb-2" />
              <div className="text-2xl font-bold text-white">25+</div>
              <div className="text-xs text-gray-400">Countries</div>
            </div>
          </div>

          {/* Join Community */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Join Our Community
            </h3>
            <div className="space-y-3">
              <a
                href="https://discord.gg/crashdoc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      Discord Server
                    </div>
                    <div className="text-xs text-gray-400">
                      Join 5K+ members
                    </div>
                  </div>
                </div>
                <div className="text-indigo-400 group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </a>

              <a
                href="https://reddit.com/r/crashdoc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      Reddit Community
                    </div>
                    <div className="text-xs text-gray-400">
                      Share experiences
                    </div>
                  </div>
                </div>
                <div className="text-orange-400 group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </a>

              <a
                href="https://twitter.com/crashdocai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Twitter/X</div>
                    <div className="text-xs text-gray-400">
                      Follow for updates
                    </div>
                  </div>
                </div>
                <div className="text-blue-400 group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </a>
            </div>
          </div>

          {/* Community Stories */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Community Success Stories
            </h3>
            <div className="space-y-3">
              {[
                {
                  name: "Sarah M.",
                  location: "California",
                  story:
                    "CrashDoc AI helped me get my insurance claim approved in just 2 days! The detailed report was exactly what they needed.",
                  rating: 5,
                },
                {
                  name: "Rajesh K.",
                  location: "Sri Lanka",
                  story:
                    "මම සිංහලෙන් භාවිතා කළා. ඉතා පහසු සහ වෘත්තීය! (Used it in Sinhala. Very easy and professional!)",
                  rating: 5,
                },
                {
                  name: "Miguel R.",
                  location: "Spain",
                  story:
                    "Instant damage assessment saved me from a dishonest mechanic. Knew the real cost before getting quotes!",
                  rating: 5,
                },
              ].map((story, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                        {story.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">
                          {story.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {story.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array(story.rating)
                        .fill(0)
                        .map((_, i) => (
                          <span key={i} className="text-yellow-400">
                            ★
                          </span>
                        ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {story.story}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contribute */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30">
            <div className="flex items-start gap-4">
              <Heart className="w-8 h-8 text-pink-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Help Us Improve
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  Share your feedback, report bugs, or suggest new features.
                  Your input shapes the future of CrashDoc AI!
                </p>
                <button
                  onClick={() =>
                    window.open(
                      "https://github.com/yourusername/crashdoc-ai/issues",
                      "_blank"
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold transition-colors text-sm"
                >
                  Contribute on GitHub
                </button>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default CommunityModal;
