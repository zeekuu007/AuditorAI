import { AuditResult } from "./ai";

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
