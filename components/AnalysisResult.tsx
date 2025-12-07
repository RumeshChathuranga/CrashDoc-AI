import React, { useRef } from "react";
import GlassCard from "./GlassCard";
import {
  ArrowLeft,
  Share2,
  Download,
  AlertTriangle,
  Car,
  DollarSign,
  Wrench,
  FileText,
  Calendar,
  MapPin,
} from "lucide-react";
import { AccidentReport } from "../types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface AnalysisResultProps {
  data: AccidentReport;
  onBack: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, onBack }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  // Use data from AI or fallback to empty state
  const analysis = data?.analysis || {
    severity_score: 0,
    estimated_cost: { min: 0, max: 0, currency: "USD" },
    parts_damaged: [],
    fault_analysis: { likely_fault: "Unknown", confidence: 0 },
    recommended_action: "N/A",
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      // Show loading state
      const downloadBtn = document.getElementById("download-btn");
      if (downloadBtn) {
        downloadBtn.innerHTML =
          '<svg class="animate-spin h-5 w-5 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating...';
      }

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Header
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, 40, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("ACCIDENT ANALYSIS REPORT", pageWidth / 2, 20, {
        align: "center",
      });

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, {
        align: "center",
      });

      let yPos = 50;

      // Severity Section
      pdf.setFillColor(239, 68, 68);
      if (analysis.severity_score < 4) pdf.setFillColor(16, 185, 129);
      else if (analysis.severity_score < 7) pdf.setFillColor(251, 191, 36);

      pdf.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(`SEVERITY SCORE: ${analysis.severity_score}/10`, 20, yPos + 10);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(analysis.recommended_action, 20, yPos + 18, {
        maxWidth: pageWidth - 40,
      });

      yPos += 35;

      // Cost Estimation Section
      pdf.setTextColor(50, 50, 50);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("ESTIMATED REPAIR COST", 15, yPos);

      yPos += 8;
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(15, yPos, pageWidth - 15, yPos);

      yPos += 10;
      pdf.setFontSize(22);
      pdf.setTextColor(16, 185, 129);
      const costRange = `${
        analysis.estimated_cost.currency === "USD"
          ? "$"
          : analysis.estimated_cost.currency + " "
      }${analysis.estimated_cost.min.toLocaleString()} - ${analysis.estimated_cost.max.toLocaleString()}`;
      pdf.text(costRange, 15, yPos);

      yPos += 8;
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text("*Includes parts & labor estimate", 15, yPos);

      yPos += 15;

      // Damaged Parts Section
      pdf.setTextColor(50, 50, 50);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("DAMAGED COMPONENTS", 15, yPos);

      yPos += 8;
      pdf.line(15, yPos, pageWidth - 15, yPos);
      yPos += 8;

      if (analysis.parts_damaged && analysis.parts_damaged.length > 0) {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        analysis.parts_damaged.forEach((part, index) => {
          if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = 20;
          }

          pdf.setTextColor(50, 50, 50);
          pdf.text(`• ${part.part}`, 20, yPos);

          pdf.setTextColor(150, 150, 150);
          pdf.text(`[${part.status.toUpperCase()}]`, 120, yPos);

          yPos += 7;
        });
      } else {
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text("No specific parts identified", 20, yPos);
        yPos += 7;
      }

      yPos += 10;

      // Fault Analysis Section
      pdf.setTextColor(50, 50, 50);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("AI FAULT ANALYSIS", 15, yPos);

      yPos += 8;
      pdf.line(15, yPos, pageWidth - 15, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text("Confidence Level:", 15, yPos);

      pdf.setFontSize(16);
      pdf.setTextColor(59, 130, 246);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${analysis.fault_analysis.confidence}%`, 60, yPos);

      yPos += 10;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text("Assessment:", 15, yPos);

      yPos += 7;
      pdf.setFontSize(12);
      pdf.setTextColor(50, 50, 50);
      pdf.setFont("helvetica", "bold");
      const faultText = pdf.splitTextToSize(
        analysis.fault_analysis.likely_fault,
        pageWidth - 30
      );
      pdf.text(faultText, 15, yPos);

      yPos += faultText.length * 7 + 15;

      // Location & Timestamp if available
      if (data?.location || data?.timestamp) {
        if (yPos > pageHeight - 40) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setTextColor(50, 50, 50);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("INCIDENT DETAILS", 15, yPos);

        yPos += 8;
        pdf.line(15, yPos, pageWidth - 15, yPos);
        yPos += 10;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);

        if (data.timestamp) {
          pdf.text(
            `Date & Time: ${new Date(data.timestamp).toLocaleString()}`,
            15,
            yPos
          );
          yPos += 7;
        }

        if (data.location) {
          pdf.text(
            `Location: ${data.location.latitude.toFixed(
              6
            )}, ${data.location.longitude.toFixed(6)}`,
            15,
            yPos
          );
          yPos += 7;
        }
      }

      // Add Photos Section
      if (data?.photos && Object.keys(data.photos).length > 0) {
        pdf.addPage();
        yPos = 20;

        pdf.setTextColor(50, 50, 50);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("PHOTOGRAPHIC EVIDENCE", 15, yPos);

        yPos += 8;
        pdf.line(15, yPos, pageWidth - 15, yPos);
        yPos += 15;

        const photoLabels = [
          "Front View",
          "Rear View",
          "Left Side",
          "Right Side",
          "Close-up Details",
        ];
        const photos = Object.values(data.photos);

        for (let i = 0; i < photos.length; i++) {
          if (yPos > pageHeight - 80) {
            pdf.addPage();
            yPos = 20;
          }

          try {
            const imgWidth = pageWidth - 30;
            const imgHeight = 60;

            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(photoLabels[i] || `Photo ${i + 1}`, 15, yPos);
            yPos += 5;

            pdf.addImage(
              photos[i] as string,
              "JPEG",
              15,
              yPos,
              imgWidth,
              imgHeight
            );
            yPos += imgHeight + 10;
          } catch (err) {
            console.error(`Failed to add photo ${i + 1}:`, err);
          }
        }
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        "Generated by CrashDoc AI powered by Gemini 2.5 Flash",
        pageWidth / 2,
        pageHeight - 15,
        { align: "center" }
      );
      pdf.text(
        "This report is AI-generated and not a legal determination.",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Save PDF
      const reportId = data?.id || `ACC-${Date.now()}`;
      pdf.save(`CrashDoc_Report_${reportId}.pdf`);

      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

      // Reset button
      if (downloadBtn) {
        downloadBtn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download PDF';
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const getSeverityColor = (score: number) => {
    if (score < 4) return "text-emerald-400";
    if (score < 7) return "text-yellow-400";
    return "text-red-500";
  };

  const getSeverityBg = (score: number) => {
    if (score < 4) return "bg-emerald-500/20 border-emerald-500/30";
    if (score < 7) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col max-w-4xl mx-auto md:pt-6">
      <div className="px-4 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-200" />
        </button>
        <h1 className="text-xl font-bold">Analysis Complete</h1>
      </div>

      <div ref={reportRef} className="flex-1 px-4 space-y-6">
        {/* Summary Banner */}
        <div
          className={`rounded-2xl p-6 flex items-start gap-4 border ${getSeverityBg(
            analysis.severity_score
          )}`}
        >
          <AlertTriangle
            className={`w-8 h-8 shrink-0 ${getSeverityColor(
              analysis.severity_score
            )}`}
          />
          <div>
            <h2 className={`text-lg font-bold text-white`}>
              Severity Score: {analysis.severity_score}/10
            </h2>
            <p className="text-gray-200/80 text-sm mt-1">
              {analysis.recommended_action}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cost Estimation */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-4 h-4 text-green-400" />
              </div>
              <h3 className="text-gray-400 text-sm uppercase tracking-wider">
                Estimated Repair Cost
              </h3>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">
                {analysis.estimated_cost.currency === "USD"
                  ? "$"
                  : analysis.estimated_cost.currency + " "}
                {analysis.estimated_cost.min.toLocaleString()}
              </span>
              <span className="text-xl text-gray-400">
                - {analysis.estimated_cost.max.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              *Includes parts & labor estimate.
            </p>

            <div className="mt-6 space-y-3">
              <h4 className="text-xs text-gray-400 font-semibold uppercase">
                Damaged Components
              </h4>
              {analysis.parts_damaged.length > 0 ? (
                analysis.parts_damaged.map((comp, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <Wrench className="w-3 h-3 text-gray-500" />
                      <span className="capitalize">{comp.part}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        comp.status === "crushed"
                          ? "bg-red-500/20 text-red-300"
                          : comp.status === "broken"
                          ? "bg-orange-500/20 text-orange-300"
                          : comp.status === "dented"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {comp.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No specific parts identified.
                </p>
              )}
            </div>
          </GlassCard>

          {/* Fault Analysis */}
          <GlassCard className="p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Car className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-gray-400 text-sm uppercase tracking-wider">
                AI Fault Analysis
              </h3>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center py-4">
              <div className="w-32 h-32 rounded-full border-8 border-white/5 relative flex items-center justify-center mb-6">
                {/* Confidence Circle */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    className="text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={
                      2 *
                      Math.PI *
                      58 *
                      (1 - analysis.fault_analysis.confidence / 100)
                    }
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold">
                    {analysis.fault_analysis.confidence}%
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase">
                    Confidence
                  </span>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 w-full">
                <h4 className="text-sm text-gray-400 mb-1">Assessment</h4>
                <p className="text-lg font-semibold text-white leading-tight">
                  {analysis.fault_analysis.likely_fault}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Incident Details */}
        {(data?.location || data?.timestamp) && (
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-gray-400 text-sm uppercase tracking-wider">
                Incident Details
              </h3>
            </div>

            <div className="space-y-3">
              {data.timestamp && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300">
                    {new Date(data.timestamp).toLocaleString()}
                  </span>
                </div>
              )}

              {data.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300">
                    {data.location.latitude.toFixed(6)},{" "}
                    {data.location.longitude.toFixed(6)}
                  </span>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            id="download-btn"
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
          <button className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors text-white font-semibold backdrop-blur-md">
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4 pb-4">
          Generated by Gemini 2.5 Flash. Not a legal determination.
        </p>
      </div>
    </div>
  );
};

export default AnalysisResult;
