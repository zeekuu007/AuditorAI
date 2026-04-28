export interface AuditResult {
  score: number;
  estimatedRevenueLoss: number;
  executiveAnalysis: string;
  topIssues: {
    title: string;
    impact: "High" | "Medium" | "Low";
    description: string;
    fix: string; // The "AI Recommended Fix"
    whyItMatters: string;
    potentialImpactText: string;
  }[];
  quickWins: string[];
  strategicRecommendations: string[];
  performanceMetrics: {
    messaging: number;
    trust: number;
    performance: number;
    ux: number;
    conversion: number;
  };
}

export interface EmailResult {
  subjectLines: string[];
  body: string;
}

export type Screen = "onboarding" | "analyzing" | "overview" | "issues" | "issue-detail" | "paywall" | "dashboard" | "growth-tools" | "reports" | "billing" | "account";

export interface AuditReport {
  id: string;
  url: string;
  industry: string;
  date: string;
  score: number;
  status: "Completed" | "Locked";
  result?: AuditResult;
}

export interface User {
  name: string;
  email: string;
  plan: "Free" | "Starter" | "Growth" | "Pro";
  auditsRemaining: number;
}
