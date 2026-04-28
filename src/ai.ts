import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

export async function generateAudit(url: string, industry: string): Promise<AuditResult> {
  const prompt = `
    Analyze this website URL: ${url} (Industry: ${industry}) and generate a PRECISE CRO Audit.
    
    REQUIRED JSON OUTPUT:
    1. Score (45-85)
    2. Estimated Revenue Loss (Random between $2,000 and $15,000 per month)
    3. Executive Analysis: 1 authoritative paragraph.
    4. Top Issues: 3 high-impact entries.
       - Title (e.g., "Weak Value Proposition")
       - Impact (High/Medium/Low)
       - Description
       - Fix: Specific actionable recommendation.
       - WhyItMatters: Behavioral psychology explanation.
       - PotentialImpactText: Estimated monthly revenue recovery for this fix (e.g. "$2,450 / month").
    5. Quick Wins: 3 bullet points.
    6. Strategic Recommendations: 3 high-level shifts.
    7. Performance Metrics: 1-10 scores.

    TONE: Advisory, slightly critical, growth-focused.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
                impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
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

  return JSON.parse(response.text);
}

export async function generateColdEmail(auditResult: AuditResult, scrapedData: any): Promise<EmailResult> {
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
    model: "gemini-3-flash-preview",
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

  return JSON.parse(response.text);
}
