import { AuditResult, EmailResult } from "./types";

export async function generateAudit(url: string, industry: string): Promise<AuditResult> {
  // Step 1: Scrape the website via backend proxy (to avoid CORS)
  const scrapeResponse = await fetch("/api/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!scrapeResponse.ok) {
    let errorMsg = "Failed to analyze website structure.";
    try {
      const errorData = await scrapeResponse.json();
      errorMsg = errorData.error || errorMsg;
    } catch (e) {
      // Fallback
    }
    throw new Error(errorMsg);
  }

  const scrapedData = await scrapeResponse.json();

  // Step 2: Generate audit via backend
  const auditResponse = await fetch("/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, industry, scrapedData }),
  });

  if (!auditResponse.ok) {
    const errorData = await auditResponse.json();
    throw new Error(errorData.error || "Failed to generate AI audit insights.");
  }

  return await auditResponse.json();
}

export async function generateColdEmail(auditResult: AuditResult, scrapedData: any): Promise<EmailResult> {
  const emailResponse = await fetch("/api/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ auditResult, scrapedData }),
  });

  if (!emailResponse.ok) {
    const errorData = await emailResponse.json();
    throw new Error(errorData.error || "Failed to generate AI email strategy.");
  }

  return await emailResponse.json();
}
