import { AuditResult } from "./types";

export async function generateAudit(url: string, industry: string): Promise<AuditResult> {
  // Call the simulated audit endpoint on our backend
  const response = await fetch("/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, industry }),
  });

  if (!response.ok) {
    let errorMsg = "Audit service is temporarily unavailable.";
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch (e) {
      errorMsg = `Server Error (${response.status}): Failed to complete audit.`;
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}
