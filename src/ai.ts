import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult, EmailResult } from "./types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ""
});

const MODEL_NAME = "gemini-1.5-flash";

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

  if (scrapedData.isBlocked) {
    throw new Error(`The target website (${url}) is blocking automated access. For a deep audit, we need access to the site's structure. Please try a different URL or ensure the site allows scraping.`);
  }

  // Step 2: Generate audit with Gemini
  const prompt = `Analyze this website: ${url} (Industry: ${industry})
    Scraped Data Context: ${JSON.stringify(scrapedData, null, 2)}
    
    Objective: Generate a high-converting CRO audit report designed to create urgency and highlight revenue loss.
    
    Tone: Direct, slightly aggressive, business-focused, professional but sharp.
    
    REQUIRED JSON OUTPUT:
    {
      "score": number (45-85),
      "status": "Needs Improvement" | "Critical" | "Strong",
      "estimatedMonthlyRevenueLoss": number (Maximum 15000),
      "estimatedYearlyRevenueLoss": number,
      "revenueImpactStatement": "string (e.g., 'This is revenue currently being lost due to avoidable conversion issues.')",
      "executiveAnalysis": "string (Brief context)",
      "executiveSummaryBullets": ["string (4-6 bullets: what's broken, why it matters, impact)"],
      "topIssues": [
        {
          "title": "string (clear and specific)",
          "impact": "High" | "Medium" | "Low",
          "description": "string (what this is costing)",
          "fix": "string (recommended fix)",
          "whyItMatters": "string",
          "potentialImpactText": "string"
        }
      ],
      "quickWins": ["string (3-5 quick high-impact fixes)"],
      "strategicRecommendations": ["string"],
      "emailTemplate": {
        "subject": "string",
        "body": "string"
      },
      "nextStepsCTA": {
        "headline": "string (Strong, slightly confrontational)",
        "body": "string (Reinforce loss, position call as solution, add urgency)",
        "buttonText": "Book a 30-minute strategy call"
      },
      "performanceMetrics": {
        "messaging": number,
        "trust": number,
        "performance": number,
        "ux": number,
        "conversion": number
      }
    }
    
    Ensure exactly 5 distinct top issues are provided in the "topIssues" array.
    Ensure executiveSummaryBullets has 4-6 bullet points.
    Ensure quickWins has 3-5 items.
    The emailTemplate should be written as if a senior Customer Support or Strategy Lead is reaching out to the customer. It should be catchy, very human-written, and directly reference the audit findings. Use a warm but expert tone.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a CRO expert, direct-response copywriter, and conversion strategist. You write sharp, personalized teardowns that make business owners uncomfortable enough to take action. Focus heavily on money impact and revenue loss.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            status: { type: Type.STRING },
            estimatedMonthlyRevenueLoss: { type: Type.NUMBER },
            estimatedYearlyRevenueLoss: { type: Type.NUMBER },
            revenueImpactStatement: { type: Type.STRING },
            executiveAnalysis: { type: Type.STRING },
            executiveSummaryBullets: { type: Type.ARRAY, items: { type: Type.STRING } },
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
            emailTemplate: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                body: { type: Type.STRING }
              },
              required: ["subject", "body"]
            },
            nextStepsCTA: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                body: { type: Type.STRING },
                buttonText: { type: Type.STRING }
              },
              required: ["headline", "body", "buttonText"]
            },
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
          required: ["score", "status", "estimatedMonthlyRevenueLoss", "estimatedYearlyRevenueLoss", "revenueImpactStatement", "executiveAnalysis", "executiveSummaryBullets", "topIssues", "quickWins", "strategicRecommendations", "emailTemplate", "nextStepsCTA", "performanceMetrics"]
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
