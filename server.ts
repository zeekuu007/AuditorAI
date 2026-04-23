import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Scrape
  app.post("/api/scrape", async (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const targetUrl = url.startsWith("http") ? url : `https://${url}`;
      const response = await axios.get(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        timeout: 10000,
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
          return (
            text.includes("get started") ||
            text.includes("sign up") ||
            text.includes("book") ||
            text.includes("demo") ||
            text.includes("try") ||
            text.includes("buy") ||
            text.includes("contact") ||
            cls.includes("btn") ||
            cls.includes("button")
          );
        })
        .map((_, el) => $(el).text().trim())
        .get()
        .slice(0, 10);

      // Extract body text (main readable content)
      // We focus on semantic tags first
      let bodyText = $("main, article, #content").text().trim();
      if (!bodyText || bodyText.length < 200) {
        bodyText = $("body").text().trim();
      }

      // Clean text: remove extra whitespace, scripts, styles
      bodyText = bodyText
        .replace(/\s+/g, " ")
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
        .substring(0, 5000); // Limit context for AI

      res.json({
        url: targetUrl,
        title,
        description: metaDescription,
        h1s,
        h2s,
        ctas,
        bodyText,
      });
    } catch (error: any) {
      console.error("Scraping error:", error.message);
      res.status(500).json({ error: `Failed to scrape website: ${error.message}` });
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
