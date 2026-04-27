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
    Perform a comprehensive "Strategic Growth & Architecture Audit" for the following website. Move beyond just surface-level CRO—analyze the entire ecosystem including branding, trust infrastructure, user experience, and revenue gaps.
    
    WEBSITE DATA:
    - URL: ${scrapedData.url}
    - Title: ${scrapedData.title}
    - Description: ${scrapedData.description}
    - Headings: H1: [${scrapedData.h1s.join(", ")}], H2: [${scrapedData.h2s.join(", ")}]
    - CTAs Found: ${JSON.stringify(scrapedData.ctas)}
    - Social Proof status: ${JSON.stringify(scrapedData.socialProof)}
    - Forms: ${JSON.stringify(scrapedData.forms)}
    - Site Map Complexity: ${scrapedData.navLinks} navigation links
    
    CONTENT PREVIEW:
    ${scrapedData.bodyText}
    
    AUDIT FOCUS AREAS:
    1. VALUE ARCHITECTURE: Is the brand promise immediately clear and compelling?
    2. TRUST INFRASTRUCTURE: Is social proof and authority integrated to build genuine trust?
    3. UX & COGNITIVE LOAD: Are there friction points or navigation issues hurting the experience?
    4. GROWTH LEAKAGE: Where is the brand losing attention or revenue due to structural flaws?
    
    RULES:
    1. ACT AS A GROWTH PARTNER, NOT A SALESPERSON.
    2. Use the framework: "That's the issue and we can fix it by doing this".
    3. Be highly prescriptive, authoritative, and diagnostic.
    4. Provide specific, non-generic fixes for every problem identified.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are the founder of Digital Matter, a high-end Growth Systems & Performance Lab. You have a direct, punchy, and highly prescriptive communication style. You diagnose 'Growth Blockers' with surgical precision. Your tone is 'Expert Partner -> Strategic Fix'. Avoid 'salesy' language or hype.",
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
    Based on the following Strategic Growth Audit, generate a partner-level outreach email to the owner of ${scrapedData.url}.
    
    AUDIT INSIGHTS:
    - Top Observation: ${auditResult.executiveSummary}
    - Critical Issue: ${auditResult.prioritizedIssues[0].issue}
    - Expert Solution: ${auditResult.strategicImprovements[0]}
    
    EMAIL STRATEGY:
    - Goal: Secure a 30-minute strategy call to walk through the technical fixes.
    - Start with a technical observation—show you've actually looked at the infrastructure of ${scrapedData.url}.
    - Explain the 'Growth Leakage'—why the current setup is costing them money.
    - Offer the complete audit summary as a value-add.
    - Tone: Helpful, authoritative, and direct. Zero sales fluff.
    - CTA: Ask if they are open to a quick session this or next week to discuss the fixes.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are the founder of Digital Matter, a high-end Growth Systems & Performance Lab. You write emails that sound like a partner reaching out to fix a problem, not a vendor pitching a service. You focus on technical clarity and revenue upside. Your CTAs are low-friction and collaborative.",
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
