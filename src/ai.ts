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
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMsg = errorData.message || errorData.error || errorMsg;
      } else {
        const text = await response.text();
        console.error("Non-JSON error response:", text);
      }
    } catch (e) {
      errorMsg = `Server Error (${response.status}): Failed to complete audit.`;
    }
    throw new Error(errorMsg);
  }

  const result = await response.json();
  // Handle success: false from backend
  if (result.success === false && result.message) {
    console.warn("Audit API returned success:false", result.message);
  }
  return result;
}
