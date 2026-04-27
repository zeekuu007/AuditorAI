import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AuditResult {
  executiveSummary: string[];
  performanceMetrics: {
    messaging: number;
    trust: number;
    performance: number;
    ux: number;
    conversion: number;
  };
  performanceDiagnosis: string[];
  customerJourney: string[];
  revenueOpportunityMap: string[];
  systemicLimitations: string[];
  priorityFramework: {
    immediate: string;
    growth: string;
    longTerm: string;
  };
  strategicInsight: string;
  strategyAlignmentText: string;
}

export interface EmailResult {
  subjectLines: string[];
  body: string;
}

export async function generateAudit(scrapedData: any): Promise<AuditResult> {
  const prompt = `
    Analyze this website URL: ${scrapedData.url} and generate a STRATEGIC GROWTH AUDIT REPORT.
    Follow the EXACT structure and tone of a high-end consultant audit (clean, diagnostic, authoritative).

    WEBSITE DATA:
    - URL: ${scrapedData.url}
    - Title: ${scrapedData.title}
    - Headings: H1: [${scrapedData.h1s.join(", ")}], H2: [${scrapedData.h2s.join(", ")}]
    - CTAs: ${JSON.stringify(scrapedData.ctas)}
    - Site Map Complexity: ${scrapedData.navLinks} links
    - Content Preview: ${scrapedData.bodyText.substring(0, 5000)}

    PDF STRUCTURE REQUIRED (MATCH REFERENCE):
    1. EXECUTIVE SUMMARY: 5-6 high-impact bullets on conversion drop-offs, pricing clarity, and scaling potential.
    2. PERFORMANCE METRICS: Score the following from 1-10 based on analysis: Messaging, Trust, Performance, UX, Conversion.
    3. BUSINESS PERFORMANCE DIAGNOSIS: 4-5 items focusing on friction, trust, and navigation. 
    4. CUSTOMER JOURNEY BREAKDOWN: 4-5 items on funnels.
    5. REVENUE OPPORTUNITY MAP: 4-5 items on potential.
    6. SYSTEMIC LIMITATIONS: 3-4 items on blockers.
    7. STRATEGIC PRIORITY FRAMEWORK: One-line strategic focuses.
    8. STRATEGIC INSIGHT: One paragraph.
    9. STRATEGY ALIGNMENT TEXT: A paragraph.

    TONE RULES:
    - Advisory, confident, direct.
    - Focus on revenue leakage and growth.
    - NO implementation tutorials.
    - Make the solution feel non-trivial.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are a senior Growth Auditor for high-growth brands. You deliver sharp, high-perceived-value diagnostics that uncover hidden revenue leakage. Your tone is executive, calm, and slightly critical. You maintain branding and structure consistency across reports.",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.ARRAY, items: { type: Type.STRING } },
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
          },
          performanceDiagnosis: { type: Type.ARRAY, items: { type: Type.STRING } },
          customerJourney: { type: Type.ARRAY, items: { type: Type.STRING } },
          revenueOpportunityMap: { type: Type.ARRAY, items: { type: Type.STRING } },
          systemicLimitations: { type: Type.ARRAY, items: { type: Type.STRING } },
          priorityFramework: {
            type: Type.OBJECT,
            properties: {
              immediate: { type: Type.STRING },
              growth: { type: Type.STRING },
              longTerm: { type: Type.STRING }
            },
            required: ["immediate", "growth", "longTerm"]
          },
          strategicInsight: { type: Type.STRING },
          strategyAlignmentText: { type: Type.STRING }
        },
        required: [
          "executiveSummary", "performanceMetrics", "performanceDiagnosis", "customerJourney", 
          "revenueOpportunityMap", "systemicLimitations", "priorityFramework", 
          "strategicInsight", "strategyAlignmentText"
        ]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateColdEmail(auditResult: AuditResult, scrapedData: any): Promise<EmailResult> {
  const prompt = `
    Based on the following Strategic Growth Diagnosis, generate a partner-level outreach email to the owner of ${scrapedData.url}.
    
    DIAGNOSIS INSIGHTS:
    - Top Observation: ${auditResult.executiveSummary[0]}
    - Performance Issue: ${auditResult.performanceDiagnosis[0]?.issue || "Conversion leakage"}
    - Systemic Limitation: ${auditResult.systemicLimitations[0]?.limitation || "Growth blocker"}
    
    EMAIL STRATEGY:
    - Goal: Secure a 30-minute strategy session to discuss revenue recovery and growth systems.
    - Start with a high-level diagnostic observation—show you've analyzed the revenue architecture of ${scrapedData.url}.
    - Explain the 'Growth Leakage'—why current structural flaws are costing profit.
    - MANDATORY: Include this specific insight: "Even if you understand these issues, execution requires iteration, testing, and cross-functional alignment — which is where most teams stall."
    - Position yourself as a "Growth Engine Owner".
    - Tone: Advisory, authoritative, direct. Zero sales fluff.
    - CTA: Ask for 30 minutes of availability to discuss the recovery roadmap and these diagnostic insights in detail.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are the founder of Digital Matter, a high-end Growth Systems & Performance Lab. You write emails that sound like a partner reaching out to fix a problem, not a vendor pitching a service. You focus on revenue recovery and long-term scaling architecture. Your CTAs are advisory and consultative.",
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
