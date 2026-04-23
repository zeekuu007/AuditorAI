import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AuditResult {
  executiveSummary: string;
  prioritizedIssues: { issue: string; impact: string }[];
  missingOpportunities: string[];
  quickWins: string[];
  strategicImprovements: string[];
  conversionRiskScore: number;
  riskJustification: string;
}

export interface EmailResult {
  subjectLines: string[];
  body: string;
}

export async function generateAudit(scrapedData: any): Promise<AuditResult> {
  const prompt = `
    Perform a professional Conversion Rate Optimization (CRO) audit for the following website content.
    
    URL: ${scrapedData.url}
    Title: ${scrapedData.title}
    Description: ${scrapedData.description}
    Headings (H1): ${scrapedData.h1s.join(", ")}
    Headings (H2): ${scrapedData.h2s.join(", ")}
    CTAs Found: ${scrapedData.ctas.join(", ")}
    
    Content Preview:
    ${scrapedData.bodyText}
    
    RULES:
    1. No generic feedback.
    2. No hallucinations.
    3. Analyze only what is visible in the provided data.
    4. Tie every insight to revenue/conversion impact.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are a world-class CRO (Conversion Rate Optimization) expert with 15 years of experience in direct-response marketing and user psychology. Your goal is to find friction points and conversion killers on a website.",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          prioritizedIssues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                issue: { type: Type.STRING },
                impact: { type: Type.STRING }
              },
              required: ["issue", "impact"]
            }
          },
          missingOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          quickWins: { type: Type.ARRAY, items: { type: Type.STRING } },
          strategicImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
          conversionRiskScore: { type: Type.NUMBER, description: "0-10 scale where 10 is high risk of losing customers" },
          riskJustification: { type: Type.STRING }
        },
        required: ["executiveSummary", "prioritizedIssues", "missingOpportunities", "quickWins", "strategicImprovements", "conversionRiskScore", "riskJustification"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateColdEmail(auditResult: AuditResult, scrapedData: any): Promise<EmailResult> {
  const prompt = `
    Based on the following CRO audit, generate a highly personalized cold email to the owner of ${scrapedData.url}.
    
    AUDIT SUMMARY:
    ${auditResult.executiveSummary}
    
    SPECIFIC ISSUES:
    ${auditResult.prioritizedIssues.map(i => `- ${i.issue} (Impact: ${i.impact})`).join("\n")}
    
    QUICK WINS:
    ${auditResult.quickWins.join(", ")}
    
    EMAIL REQUIREMENTS:
    - 3 subject line options (curiosity-driven, non-spammy).
    - Length: 120–180 words max.
    - Start with a specific observation about the website (${scrapedData.url}).
    - Mention 2–3 real issues from the audit.
    - Explain business impact (lost leads, conversions, trust issues).
    - End with a soft CTA (offer audit summary or quick fix list).
    - Tone: human, confident, not salesy.
    - NO buzzwords.
    - NO AI mention.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are a master of cold outreach and sales copywriting. You write emails that people actually want to read because they offer genuine value and show deep research. Your tone is like a helpful consultant, not a salesperson.",
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
