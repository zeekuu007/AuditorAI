import { AuditResult, EmailResult } from "./types";

export async function generateAudit(url: string, industry: string): Promise<AuditResult> {
  const response = await fetch("/api/audit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, industry }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate audit");
  }

  return response.json();
}

export async function generateColdEmail(auditResult: AuditResult, scrapedData: any): Promise<EmailResult> {
  const response = await fetch("/api/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ auditResult, scrapedData }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate email");
  }

  return response.json();
}
