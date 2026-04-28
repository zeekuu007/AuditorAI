import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult, EmailResult } from "./types";

// Initialize AI on the frontend as per environment constraints
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

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
      // Fallback for non-JSON errors
    }
    throw new Error(errorMsg);
  }

  const scrapedData = await scrapeResponse.json();

  // Step 2: Generate audit with Gemini (Frontend call)
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this website URL: ${url} (Industry: ${industry}) and generate a PRECISE CRO Audit based on this scraped data:
    ${JSON.stringify(scrapedData, null, 2)}
    
    REQUIRED JSON OUTPUT:
    1. Score (45-85)
    2. Estimated Revenue Loss (Between $2,000 and $15,000 per month)
    3. Executive Analysis: 1 authoritative paragraph.
    4. Top Issues: EXACTLY 5 high-impact entries.
       - title
       - impact (High, Medium, or Low)
       - description
       - fix
       - whyItMatters
       - potentialImpactText
    5. Quick Wins: 5 actionable bullet points.
    6. Strategic Recommendations: 3 high-level shifts.
    7. Performance Metrics: 1-10 scores for messaging, trust, performance, ux, and conversion.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a senior CRO Auditor. You deliver sharp, high-perceived-value diagnostics. Your tone is executive, calm, and slightly critical.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            estimatedRevenueLoss: { type: Type.NUMBER },
            executiveAnalysis: { type: Type.STRING },
            topIssues: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  description: { type: Type.STRING },
                  fix: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                  potentialImpactText: { type: Type.STRING }
                },
                required: ["title", "impact", "description", "fix", "whyItMatters", "potentialImpactText"]
              }
            },
            quickWins: { type: Type.ARRAY, items: { type: Type.STRING } },
            strategicRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            performanceMetrics: {
              type: Type.OBJECT,
              properties: {
                messaging: { type: Type.NUMBER },
                trust: { type: Type.NUMBER },
                performance: { type: Type.NUMBER },
                ux: { type: Type.NUMBER },
                conversion: { type: Type.NUMBER }
              },
              required: ["messaging", "trust", "performance", "ux", "conversion"]
            }
          },
          required: ["score", "estimatedRevenueLoss", "executiveAnalysis", "topIssues", "quickWins", "strategicRecommendations", "performanceMetrics"]
        }
      }
    });

    if (!response.text) {
      throw new Error("The AI returned an empty response. Please try again.");
    }

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini Audit Error:", error);
    throw new Error(error.message || "Failed to generate AI audit insights.");
  }
}

export async function generateColdEmail(auditResult: AuditResult, scrapedData: any): Promise<EmailResult> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Based on the following Strategic Growth Diagnosis, generate a partner-level outreach email to the owner of ${scrapedData.url}.
    
    DIAGNOSIS INSIGHTS:
    - Top Observation: ${auditResult.executiveAnalysis}
    - Growth Opportunity: ${auditResult.topIssues[0]?.title}
    
    EMAIL STRATEGY:
    - Goal: Secure a 30-minute strategy session.
    - Focus on 'Growth Leakage'.
    - Position as a "Growth Engine Owner".
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are the founder of AuditGuru. You write high-perceived-value advisory emails.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subjectLines: { type: Type.ARRAY, items: { type: Type.STRING } },
            body: { type: Type.STRING }
          },
          required: ["subjectLines", "body"]
        }
      }
    });

    if (!response.text) {
      throw new Error("The AI returned an empty response for the email.");
    }

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini Email Error:", error);
    throw new Error(error.message || "Failed to generate AI email strategy.");
  }
}
