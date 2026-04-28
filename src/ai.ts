import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult, EmailResult } from "./types";

const ai = new GoogleGenAI({ 
  apiKey: (process.env.GEMINI_API_KEY as string) || "" 
});

export async function generateAudit(url: string, industry: string): Promise<AuditResult> {
  // Step 1: Scrape the website
  const scrapeResponse = await fetch("/api/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!scrapeResponse.ok) {
    const errorData = await scrapeResponse.json();
    throw new Error(errorData.error || "Failed to analyze website structure.");
  }

  const scrapedData = await scrapeResponse.json();

  // Step 2: Generate audit with Gemini
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this website URL: ${url} (Industry: ${industry}) and generate a PRECISE CRO Audit based on this scraped data:
    ${JSON.stringify(scrapedData, null, 2)}
    
    REQUIRED JSON OUTPUT:
    1. Score (45-85)
    2. Estimated Revenue Loss (Between $2,000 and $15,000 per month)
    3. Executive Analysis: 1 authoritative paragraph.
    4. Top Issues: EXACTLY 5 high-impact entries.
       - Title (e.g., "Weak Value Proposition")
       - Impact (High, Medium, or Low)
       - Description
       - Fix: Specific actionable recommendation.
       - WhyItMatters: Behavioral psychology explanation.
       - PotentialImpactText: Estimated monthly revenue recovery for this fix (e.g. "$2,450 / month").
    5. Quick Wins: 5 actionable bullet points.
    6. Strategic Recommendations: 3 high-level shifts.
    7. Performance Metrics: 1-10 scores for messaging, trust, performance, ux, and conversion.

    TONE: Advisory, slightly critical, growth-focused.
  `;

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
    throw new Error("Empty response from AI engine");
  }

  return JSON.parse(response.text);
}

export async function generateColdEmail(auditResult: AuditResult, scrapedData: any): Promise<EmailResult> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Based on the following Strategic Growth Diagnosis, generate a partner-level outreach email to the owner of ${scrapedData.url}.
    
    DIAGNOSIS INSIGHTS:
    - Top Observation: ${auditResult.executiveAnalysis}
    - Growth Opportunity: ${auditResult.topIssues[0]?.title}
    
    EMAIL STRATEGY:
    - Goal: Secure a 30-minute strategy session to discuss revenue recovery and growth systems.
    - Start with a high-level diagnostic observation—show you've analyzed the revenue architecture of ${scrapedData.url}.
    - Explain the 'Growth Leakage'—why current structural flaws are costing profit.
    - Position yourself as a "Growth Engine Owner".
    - Tone: Advisory, authoritative, direct. Zero sales fluff.
    - CTA: Ask for 30 minutes of availability.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are the founder of AuditGuru, a high-end Growth Systems & Performance Lab. You write emails that sound like a partner reaching out to fix a problem, not a vendor pitching a service. You focus on revenue recovery and long-term scaling architecture. Your CTAs are advisory and consultative.",
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
    throw new Error("Empty response from AI engine");
  }

  return JSON.parse(response.text);
}
