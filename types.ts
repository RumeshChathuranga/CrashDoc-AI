export enum AppView {
  DASHBOARD = "DASHBOARD",
  SOS_MODE = "SOS_MODE",
  NEW_REPORT = "NEW_REPORT",
  ANALYSIS = "ANALYSIS",
  LIVE_HELP = "LIVE_HELP",
}

export interface UserProfile {
  name: string;
  vehicle: string;
  policyNumber: string;
}

export interface DamagedPart {
  part: string;
  status: "crushed" | "scratched" | "broken" | "dented";
}

export interface AIAnalysisResult {
  severity_score: number;
  estimated_cost: {
    min: number;
    max: number;
    currency: string;
  };
  parts_damaged: DamagedPart[];
  fault_analysis: {
    likely_fault: string;
    confidence: number;
  };
  recommended_action: string;
}

export interface AccidentReport {
  id: string;
  timestamp: string;
  photos: Record<number, string>;
  analysis: AIAnalysisResult;
  location?: {
    latitude: number;
    longitude: number;
  };
}