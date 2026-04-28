import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult, EmailResult } from "./types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ""
});

const MODEL_NAME = "gemini-3-flash-preview";

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

  // Step 2: Generate audit with Gemini
  const prompt = `Analyze this website: ${url} (Industry: ${industry})
    Scraped Data Context: ${JSON.stringify(scrapedData, null, 2)}
    
    Objective: Deliver a high-value CRO Audit.
    
    REQUIRED JSON OUTPUT:
    {
      "score": number (45-85),
      "estimatedRevenueLoss": number,
      "executiveAnalysis": "string",
      "topIssues": [
        {
          "title": "string",
          "impact": "High" | "Medium" | "Low",
          "description": "string",
          "fix": "string",
          "whyItMatters": "string",
          "potentialImpactText": "string"
        }
      ],
      "quickWins": ["string"],
      "strategicRecommendations": ["string"],
      "performanceMetrics": {
        "messaging": number,
        "trust": number,
        "performance": number,
        "ux": number,
        "conversion": number
      }
    }`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a world-class CRO (Conversion Rate Optimization) Specialist. You provide sharp, data-driven, and slightly critical audits that focus on revenue recovery.",
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

    if (!response.text) throw new Error("AI returned empty content");
    return JSON.parse(response.text);
  } catch (err: any) {
    console.error("AI Generation Error:", err);
    throw new Error(`AI Audit failed: ${err.message}`);
  }
}

export async function generateColdEmail(auditResult: AuditResult, scrapedData: any): Promise<EmailResult> {
  const prompt = `Generate a partner-level outreach email for ${scrapedData.url}.
    Insight: ${auditResult.executiveAnalysis}
    Growth Block: ${auditResult.topIssues[0]?.title}
    
    Tone: Expert, advisory, direct.
    Return JSON { "subjectLines": ["string"], "body": "string" }`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are the CEO of AuditGuru. You write emails that sound like a partner reaching out to solve a profitable problem.",
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

    if (!response.text) throw new Error("AI returned empty content");
    return JSON.parse(response.text);
  } catch (err: any) {
    console.error("AI Email Error:", err);
    throw new Error(`AI Email failed: ${err.message}`);
  }
}
