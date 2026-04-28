import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

console.log("Starting server process...");

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

async function createServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route: Scrape
  app.post("/api/scrape", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      const targetUrl = url.startsWith("http") ? url : `https://${url}`;
      const response = await axios.get(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const title = $("title").text().trim();
      const metaDescription = $('meta[name="description"]').attr("content") || "";
      const h1s = $("h1").map((_, el) => $(el).text().trim()).get();
      const h2s = $("h2").map((_, el) => $(el).text().trim()).get();

      const ctas = $("a, button")
        .filter((_, el) => {
          const text = $(el).text().toLowerCase();
          return (
            text.includes("get") || text.includes("sign") || text.includes("book") || 
            text.includes("demo") || text.includes("buy") || text.includes("contact")
          );
        })
        .map((_, el) => ({ text: $(el).text().trim(), type: el.tagName }))
        .get()
        .slice(0, 10);

      let bodyText = $("main, article, body").text().trim()
        .replace(/\s+/g, " ")
        .substring(0, 4000);

      res.json({ url: targetUrl, title, description: metaDescription, h1s, h2s, ctas, bodyText });
    } catch (error: any) {
      res.status(500).json({ error: `Scraping failed: ${error.message}` });
    }
  });

  // API Route: Audit
  app.post("/api/audit", async (req, res) => {
    const { url, industry, scrapedData } = req.body;
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "API key missing" });

    try {
      const model = "gemini-1.5-flash";
      const prompt = `Analyze this website: ${url} (Industry: ${industry}) using this data: ${JSON.stringify(scrapedData)}. Return a JSON CRO audit with score, revenue loss, executive analysis, 5 top issues (title, impact, description, fix, whyItMatters, potentialImpactText), 5 quick wins, 3 strategic recommendations, and performance metrics.`;

      const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a CRO Expert. Provide sharp diagnostics in JSON format.",
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
      res.json(JSON.parse(result.text || "{}"));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Email
  app.post("/api/email", async (req, res) => {
    const { auditResult, scrapedData } = req.body;
    try {
      const model = "gemini-1.5-flash";
      const prompt = `Generate a CRO outreach email for ${scrapedData.url} based on this audit: ${JSON.stringify(auditResult)}. Focus on revenue recovery. Return JSON { "subjectLines": ["..."], "body": "..." }.`;
      const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are CEO of AuditGuru. Advisory tone.",
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
      res.json(JSON.parse(result.text || "{}"));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Serve static files in production
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  return app;
}

// Development server startup
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  createServer().then((app) => {
    app.listen(3000, "0.0.0.0", () => {
      console.log("Dev Server running on http://localhost:3000");
    });
  });
}

// Export for Vercel
export default async (req: any, res: any) => {
  const app = await createServer();
  return app(req, res);
};
