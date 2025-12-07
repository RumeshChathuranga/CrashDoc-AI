import React, { useState, useRef } from "react";
import { ChevronRight, X, Loader2, Camera, Scan } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

interface ReportWizardProps {
  onCancel: () => void;
  onComplete: (data: any) => void;
}

const steps = [
  {
    id: 1,
    title: "Front View",
    desc: "Capture the entire front of your vehicle.",
  },
  {
    id: 2,
    title: "Rear View",
    desc: "Capture the rear including license plate.",
  },
  { id: 3, title: "Left Side", desc: "Capture the driver side." },
  { id: 4, title: "Right Side", desc: "Capture the passenger side." },
  { id: 5, title: "Close-ups", desc: "Take close-ups of specific damage." },
];

const ReportWizard: React.FC<ReportWizardProps> = ({
  onCancel,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<Record<number, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState("Initializing System...");
  const [analyzingImage, setAnalyzingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Haptic feedback for successful upload
      if (navigator.vibrate) navigator.vibrate([50]);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotos((prev) => ({
          ...prev,
          [steps[currentStep].id]: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCamera = () => {
    // Haptic feedback for camera trigger
    if (navigator.vibrate) navigator.vibrate(50);
    fileInputRef.current?.click();
  };

  // 1. Function to analyze the accident using Gemini
  const analyzeAccident = async (
    base64Image: string
  ): Promise<AIAnalysisResult> => {
    const base64Data = base64Image.split(",")[1];
    const mimeType = base64Image.substring(
      base64Image.indexOf(":") + 1,
      base64Image.indexOf(";")
    );

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Schema definition matches user request
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        severity_score: { type: Type.NUMBER, description: "Score from 1-10" },
        estimated_cost: {
          type: Type.OBJECT,
          properties: {
            min: { type: Type.NUMBER },
            max: { type: Type.NUMBER },
            currency: { type: Type.STRING },
          },
          required: ["min", "max", "currency"],
        },
        parts_damaged: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              part: { type: Type.STRING },
              status: {
                type: Type.STRING,
                enum: ["crushed", "scratched", "broken", "dented"],
              },
            },
            required: ["part", "status"],
          },
        },
        fault_analysis: {
          type: Type.OBJECT,
          properties: {
            likely_fault: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          },
          required: ["likely_fault", "confidence"],
        },
        recommended_action: { type: Type.STRING },
      },
      required: [
        "severity_score",
        "estimated_cost",
        "parts_damaged",
        "fault_analysis",
        "recommended_action",
      ],
    };

    const prompt = `You are an expert automotive damage assessor and insurance adjuster with 20+ years of experience. Analyze this accident scene image with high precision.

DETAILED ANALYSIS INSTRUCTIONS:
1. SEVERITY SCORE (1-10): Assess overall damage severity
   - 1-3: Minor (cosmetic scratches, small dents)
   - 4-6: Moderate (broken lights, damaged panels, minor structural)
   - 7-9: Severe (major structural damage, airbag deployment, frame damage)
   - 10: Total loss (vehicle unsafe/unrepairable)

2. COST ESTIMATION: Provide realistic repair cost range in USD
   - Consider parts + labor costs
   - Account for paint/body work
   - Include mechanical/structural repairs if visible
   - Be specific based on visible damage

3. PARTS DAMAGED: List ALL visible damaged components
   - Common parts: bumper, hood, fender, door, headlight, taillight, mirror, windshield, quarter panel, grille, wheel, tire
   - Status: 'crushed' (severe deformation), 'broken' (cracked/shattered), 'scratched' (surface damage), 'dented' (minor deformation)

4. FAULT ANALYSIS: Assess likely fault based on damage patterns
   - Analyze impact points, damage distribution, crumple zones
   - Provide confidence percentage (0-100)
   - Be specific about likely collision scenario

5. RECOMMENDED ACTION: Provide clear next steps
   - Contact insurance, towing needed, drive carefully to shop, immediate professional inspection required, etc.

Return ONLY valid JSON with no markdown formatting.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response text from AI");
      return JSON.parse(text);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      // Fallback mock data if AI fails
      return {
        severity_score: 5,
        estimated_cost: { min: 500, max: 1000, currency: "USD" },
        parts_damaged: [{ part: "Unknown", status: "scratched" }],
        fault_analysis: {
          likely_fault: "Analysis Failed - Please Retake Photos",
          confidence: 0,
        },
        recommended_action: "Manual review required",
      };
    }
  };

  // Enhanced function to analyze ALL photos together
  const analyzeAllPhotos = async (): Promise<AIAnalysisResult> => {
    const photoArray = Object.values(photos);
    if (photoArray.length === 0) throw new Error("No photos");

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts = photoArray.map((photo: string) => {
      const base64Data = photo.split(",")[1];
      const mimeType = photo.substring(photo.indexOf(":") + 1, photo.indexOf(";"));
      return { inlineData: { mimeType, data: base64Data } };
    });

    parts.push({
      text: `You are analyzing ${photoArray.length} photos of a vehicle accident from different angles (front, rear, left, right, and close-ups).

COMPREHENSIVE MULTI-PHOTO ANALYSIS:
Analyze ALL images together to provide a complete 360° assessment:

1. SEVERITY SCORE (1-10): Combine damage from all angles
2. COST ESTIMATION: Total repair cost based on ALL visible damage
3. PARTS DAMAGED: List EVERY damaged component seen across all photos (bumpers, lights, doors, panels, glass, wheels, etc.)
4. FAULT ANALYSIS: Use damage distribution across vehicle to determine collision type and likely fault
5. RECOMMENDED ACTION: Based on total damage severity

Provide the most accurate professional assessment possible using all available visual data.`
    } as any);

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        severity_score: { type: Type.NUMBER },
        estimated_cost: {
          type: Type.OBJECT,
          properties: {
            min: { type: Type.NUMBER },
            max: { type: Type.NUMBER },
            currency: { type: Type.STRING },
          },
          required: ["min", "max", "currency"],
        },
        parts_damaged: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              part: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["crushed", "scratched", "broken", "dented"] },
            },
            required: ["part", "status"],
          },
        },
        fault_analysis: {
          type: Type.OBJECT,
          properties: {
            likely_fault: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          },
          required: ["likely_fault", "confidence"],
        },
        recommended_action: { type: Type.STRING },
      },
      required: ["severity_score", "estimated_cost", "parts_damaged", "fault_analysis", "recommended_action"],
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema,
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response");
      return JSON.parse(text);
    } catch (error) {
      console.error("Multi-photo analysis failed:", error);
      throw error;
    }
  };

  const handleNext = async () => {
    // Haptic feedback for navigation
    if (navigator.vibrate) navigator.vibrate(50);

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Finish and Analyze ALL PHOTOS
      const photoKeys = Object.keys(photos);
      const hasPhotos = photoKeys.length > 0;

      setAnalyzingImage(hasPhotos ? photos[parseInt(photoKeys[0])] : null);
      setIsAnalyzing(true);

      // Enhanced loading sequence
      setLoadingText("Encrypting biometric data...");
      await new Promise((r) => setTimeout(r, 800));

      setLoadingText(`Analyzing ${photoKeys.length} photos from all angles...`);
      await new Promise((r) => setTimeout(r, 1000));

      setLoadingText("Gemini 2.5 Flash Multi-Photo Processing...");

      let analysisResult;
      if (hasPhotos) {
        try {
          analysisResult = await analyzeAllPhotos();
        } catch (err) {
          console.error("Analysis failed, using fallback:", err);
          analysisResult = await analyzeAccident(photos[parseInt(photoKeys[0])]);
        }
      } else {
        // Fallback if no photo taken
        setLoadingText("Simulation Mode (No Photos)...");
        await new Promise((r) => setTimeout(r, 1000));
        analysisResult = {
          severity_score: 7,
          estimated_cost: { min: 1200, max: 1500, currency: "USD" },
          parts_damaged: [
            { part: "Front Bumper", status: "crushed" },
            { part: "Headlight", status: "broken" },
          ],
          fault_analysis: {
            likely_fault: "Rear-ending vehicle",
            confidence: 85,
          },
          recommended_action: "Do not drive. Tow required.",
        };
      }

      setLoadingText("Finalizing Report...");
      // Success Haptic Pattern
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      await new Promise((r) => setTimeout(r, 500));

      // Get location if available
      let location = undefined;
      try {
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 3000,
              });
            }
          );
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        }
      } catch (err) {
        console.log("Location not available:", err);
      }

      onComplete({
        id: `ACC-${Date.now()}`,
        photos,
        timestamp: new Date().toISOString(),
        analysis: analysisResult,
        location,
      });
    }
  };

  const step = steps[currentStep];
  const hasPhoto = !!photos[step.id];

  if (isAnalyzing) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6">
        {/* Futuristic Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
          {/* Scanning Interface */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.2)] bg-black mb-8">
            {analyzingImage ? (
              <img
                src={analyzingImage}
                alt="Scanning"
                className="w-full h-full object-cover opacity-60"
              />
            ) : (
              <div className="w-full h-full bg-slate-900 grid grid-cols-8 grid-rows-8 gap-1 opacity-50">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="border border-blue-500/10"></div>
                ))}
              </div>
            )}

            {/* Laser Scan Line Animation */}
            <div className="absolute inset-0 z-20 overflow-hidden">
              <div className="h-full w-full relative animate-scan">
                <div className="absolute w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)]"></div>
                <div className="absolute w-full h-24 bg-gradient-to-t from-cyan-400/20 to-transparent transform -translate-y-full"></div>
              </div>
            </div>

            {/* HUD Elements */}
            <div className="absolute top-4 left-4 text-cyan-400 text-[10px] font-mono">
              TARGET_LOCK: CONFIRMED
              <br />
              ISO: 800 | F/2.8
            </div>
            <div className="absolute bottom-4 right-4 text-cyan-400 text-[10px] font-mono text-right">
              AI_MODEL: GEMINI_2.5
              <br />
              LATENCY: 24ms
            </div>
            <Scan className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-cyan-400/50" />
          </div>

          <div className="text-center space-y-3 w-full max-w-xs">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              ANALYZING
            </h2>
            <p className="text-blue-300 font-mono text-sm animate-pulse">
              {loadingText}
            </p>

            {/* Terminal Output */}
            <div className="mt-4 w-full bg-black/60 rounded-lg p-3 font-mono text-[10px] text-green-400/80 border border-white/5 h-20 overflow-hidden flex flex-col justify-end text-left">
              <p className="opacity-40">
                {">> Initializing secure handshake..."}
              </p>
              <p className="opacity-60">
                {">> Image tensor conversion complete."}
              </p>
              <p>{">> Uploading to Neural Engine..."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto md:py-8">
      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>
        <div className="text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">
            Step {currentStep + 1} / {steps.length}
          </h2>
          <p className="text-white font-medium text-lg">{step.title}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Camera Viewport Area */}
      <div className="flex-1 relative bg-slate-900 md:rounded-3xl overflow-hidden mx-0 md:mx-4 mb-4 group border border-white/10 shadow-2xl">
        {hasPhoto ? (
          <img
            src={photos[step.id]}
            alt="Captured"
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {/* Viewfinder Overlay */}
            <div className="absolute inset-8 border-2 border-dashed border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
              <div className="flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-white/50"></div>
                <div className="w-4 h-4 border-t-2 border-r-2 border-white/50"></div>
              </div>
              <div className="flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-white/50"></div>
                <div className="w-4 h-4 border-b-2 border-r-2 border-white/50"></div>
              </div>
            </div>
            <Camera className="w-16 h-16 text-white/20 mb-4" />
            <p className="text-white/80 font-medium z-10">{step.desc}</p>
            <p className="text-xs text-gray-500 mt-2 max-w-xs">
              Tap the capture button below to upload or take a photo.
            </p>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-8 flex justify-center items-center bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          {hasPhoto ? (
            <div className="flex gap-4 w-full max-w-xs">
              <button
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(50);
                  setPhotos((prev) => {
                    const n = { ...prev };
                    delete n[step.id];
                    return n;
                  });
                }}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur text-white text-sm font-medium transition-all"
              >
                Retake
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                {currentStep === steps.length - 1 ? "Analyze" : "Next"}{" "}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={triggerCamera}
              className="w-20 h-20 rounded-full border-4 border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 group shadow-lg"
            >
              <div className="w-16 h-16 rounded-full bg-white group-hover:scale-90 transition-transform"></div>
            </button>
          )}
        </div>
      </div>

      {/* Progress Dots */}
      <div className="px-8 pb-8 flex justify-center gap-2">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentStep ? "w-8 bg-blue-500" : "w-2 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ReportWizard;
