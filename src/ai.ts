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
  categoryScores: {
    messaging: number;
    trust: number;
    performance: number;
    ux: number;
    cta: number;
  };
}

export interface EmailResult {
  subjectLines: string[];
  body: string;
}

export async function generateAudit(scrapedData: any): Promise<AuditResult> {
  const prompt = `
    Perform a high-level Conversion Rate Optimization (CRO) audit. Focus on finding "Conversion Leakage"—where the site is losing money due to friction, lack of trust, or poor communication.
    
    WEBSITE DATA:
    - URL: ${scrapedData.url}
    - Title: ${scrapedData.title}
    - Description: ${scrapedData.description}
    - Headings: H1: [${scrapedData.h1s.join(", ")}], H2: [${scrapedData.h2s.join(", ")}]
    - CTAs found: ${JSON.stringify(scrapedData.ctas)}
    - Social Proof: ${JSON.stringify(scrapedData.socialProof)}
    - Form complexity: ${JSON.stringify(scrapedData.forms)}
    - Navigation Complexity: ${scrapedData.navLinks} links in nav.
    
    BODY CONTENT PREVIEW:
    ${scrapedData.bodyText}
    
    AUDIT FOCUS:
    1. TRUST GAPS: Is there enough social proof (testimonials, trust badges, authority)? If missing, that's a leakage point.
    2. FRICTION POINTS: Are forms too long? Is navigation overwhelming? Are CTAs invisible or weak?
    3. VALUE CLARITY: Does the user know EXACTLY what they get in 5 seconds?
    4. REVENUE IMPACT: How do these issues translate to lost profit?
    
    RULES:
    1. DO NOT focus only on H1/Headings. Analyze the whole structure and strategy.
    2. Use the framework: "That's the issue and we can fix it by doing this".
    3. Be direct, authoritative, and prescriptive.
    4. No generic "you should improve SEO" advice. Focus on CONVERSIONS.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are a world-class CRO (Conversion Rate Optimization) expert and agency founder at Digital Matter. You hunt for 'Conversion Leakage'—the hidden reasons users don't buy. You look at trust, friction, value proposition, and information architecture. You have a direct, punchy, and highly prescriptive communication style. You don't just point out problems; you provide the exact architectural fix. Your tone is 'Problem -> Solution'. Example: 'You have zero social proof on the home page which kills trust; we can fix this by adding a verified testimonial slider above the fold.'",
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
          riskJustification: { type: Type.STRING },
          categoryScores: {
            type: Type.OBJECT,
            properties: {
              messaging: { type: Type.NUMBER, description: "0-10 score for messaging clarity" },
              trust: { type: Type.NUMBER, description: "0-10 score for trust indicators" },
              performance: { type: Type.NUMBER, description: "0-10 score for perceived performance" },
              ux: { type: Type.NUMBER, description: "0-10 score for user experience" },
              cta: { type: Type.NUMBER, description: "0-10 score for CTA effectiveness" }
            },
            required: ["messaging", "trust", "performance", "ux", "cta"]
          }
        },
        required: ["executiveSummary", "prioritizedIssues", "missingOpportunities", "quickWins", "strategicImprovements", "conversionRiskScore", "riskJustification", "categoryScores"]
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
      systemInstruction: "You are the founder of Digital Matter, a high-end CRO agency. You write emails that are direct, value-heavy, and shows you've actually spent time looking at their architecture. Your tone is like a high-level partner, not a vendor. You focus on 'Conversion Gaps' and 'Fixes'.",
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
