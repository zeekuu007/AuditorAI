import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Scrape
  app.post("/api/scrape", async (req, res) => {
    console.log("POST /api/scrape - Request received");
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const targetUrl = url.startsWith("http") ? url : `https://${url}`;
      const response = await axios.get(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "max-age=0",
          "Sec-Ch-Ua": '"Not A(Bit:Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"Windows"',
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1"
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // Extract basic info
      const title = $("title").text().trim();
      const metaDescription = $('meta[name="description"]').attr("content") || "";
      
      // Extract headings
      const h1s = $("h1").map((_, el) => $(el).text().trim()).get();
      const h2s = $("h2").map((_, el) => $(el).text().trim()).get();

      // Extract CTAs (buttons and links that look like buttons)
      const ctas = $("a, button")
        .filter((_, el) => {
          const text = $(el).text().toLowerCase();
          const cls = $(el).attr("class") || "";
          const id = $(el).attr("id") || "";
          return (
            text.includes("get started") ||
            text.includes("sign up") ||
            text.includes("book") ||
            text.includes("demo") ||
            text.includes("try") ||
            text.includes("buy") ||
            text.includes("contact") ||
            text.includes("checkout") ||
            text.includes("add to cart") ||
            cls.includes("btn") ||
            cls.includes("button") ||
            id.includes("btn") ||
            id.includes("button")
          );
        })
        .map((_, el) => ({
          text: $(el).text().trim(),
          type: el.tagName,
          href: $(el).attr("href") || ""
        }))
        .get()
        .slice(0, 15);

      // Extract Social Proof Indicators
      const socialProof = {
        hasTestimonials: $("body").text().toLowerCase().includes("testimonial") || $(".testimonial, .review, .feedback").length > 0,
        hasTrustBadges: $('img[src*="trust"], img[src*="badge"], img[src*="guarantee"], img[src*="verified"]').length > 0,
        reviewCount: $(".rating, .stars, .reviews").length,
      };

      // Extract Form Info
      const forms = $("form").map((_, el) => {
        const inputs = $(el).find("input, select, textarea").length;
        return { inputCount: inputs };
      }).get();

      // Extract Navigation Info
      const navLinks = $("nav a").length;

      // Extract body text (main readable content)
      // We focus on semantic tags first
      let bodyText = $("main, article, #content, .content, .main").text().trim();
      if (!bodyText || bodyText.length < 200) {
        bodyText = $("body").text().trim();
      }

      // Clean text: remove extra whitespace, scripts, styles
      bodyText = bodyText
        .replace(/\s+/g, " ")
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
        .substring(0, 6000); // Slightly more context

      res.json({
        url: targetUrl,
        title,
        description: metaDescription,
        h1s,
        h2s,
        ctas,
        socialProof,
        forms,
        navLinks,
        bodyText,
      });
    } catch (error: any) {
      console.error("Scraping error:", error.message);
      
      let clientMessage = error.message;
      if (error.response?.status === 403) {
        clientMessage = "Access denied (403). This website may be blocking automated scrapers. Try a different URL or ensure the site is public.";
      } else if (error.code === 'ECONNABORTED') {
        clientMessage = "Request timed out. The website is taking too long to respond.";
      }
      
      res.status(500).json({ error: `Failed to scrape website: ${clientMessage}` });
    }
  });

  // API Route: Audit Generation
  app.post("/api/audit", async (req, res) => {
    console.log("POST /api/audit - Request received");
    const { url, industry } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY missing");
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }

    try {
      console.log(`Generating audit for ${url} in ${industry}...`);
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        systemInstruction: "You are a senior CRO Auditor. You deliver sharp, high-perceived-value diagnostics. Your tone is executive, calm, and slightly critical.",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              score: { type: SchemaType.NUMBER },
              estimatedRevenueLoss: { type: SchemaType.NUMBER },
              executiveAnalysis: { type: SchemaType.STRING },
              topIssues: { 
                type: SchemaType.ARRAY, 
                items: { 
                  type: SchemaType.OBJECT,
                  properties: {
                    title: { type: SchemaType.STRING },
                    impact: { type: SchemaType.STRING },
                    description: { type: SchemaType.STRING },
                    fix: { type: SchemaType.STRING },
                    whyItMatters: { type: SchemaType.STRING },
                    potentialImpactText: { type: SchemaType.STRING }
                  },
                  required: ["title", "impact", "description", "fix", "whyItMatters", "potentialImpactText"]
                }
              },
              quickWins: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              strategicRecommendations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              performanceMetrics: {
                type: SchemaType.OBJECT,
                properties: {
                  messaging: { type: SchemaType.NUMBER },
                  trust: { type: SchemaType.NUMBER },
                  performance: { type: SchemaType.NUMBER },
                  ux: { type: SchemaType.NUMBER },
                  conversion: { type: SchemaType.NUMBER }
                },
                required: ["messaging", "trust", "performance", "ux", "conversion"]
              }
            },
            required: ["score", "estimatedRevenueLoss", "executiveAnalysis", "topIssues", "quickWins", "strategicRecommendations", "performanceMetrics"]
          }
        }
      });

      const auditPrompt = `
        Analyze this website URL: ${url} (Industry: ${industry}) and generate a PRECISE CRO Audit.
        
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

      const result = await model.generateContent(auditPrompt);
      const response = await result.response;
      res.json(JSON.parse(response.text()));
    } catch (error: any) {
      console.error("Audit generation error:", error.message);
      res.status(500).json({ error: `Failed to generate audit: ${error.message}` });
    }
  });

  // API Route: Email Generation
  app.post("/api/email", async (req, res) => {
    console.log("POST /api/email - Request received");
    const { auditResult, scrapedData } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        systemInstruction: "You are the founder of AuditGuru, a high-end Growth Systems & Performance Lab. You write emails that sound like a partner reaching out to fix a problem, not a vendor pitching a service. You focus on revenue recovery and long-term scaling architecture. Your CTAs are advisory and consultative.",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              subjectLines: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              body: { type: SchemaType.STRING }
            },
            required: ["subjectLines", "body"]
          }
        }
      });

      const emailPrompt = `
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

      const result = await model.generateContent(emailPrompt);
      const response = await result.response;
      res.json(JSON.parse(response.text()));
    } catch (error: any) {
      console.error("Email generation error:", error.message);
      res.status(500).json({ error: `Failed to generate email: ${error.message}` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
