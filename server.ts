import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// API Route: Health
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
      validateStatus: () => true, // Accept any status code to handle errors gracefully
    });

    if (response.status >= 400) {
      return res.status(response.status).json({ error: `Website returned status ${response.status}` });
    }

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
    console.error("Internal Scrape Error:", error.message);
    res.status(500).json({ error: `Scraping failed: ${error.message}` });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  
  // SPA fallback
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
    const indexPath = path.join(distPath, "index.html");
    res.sendFile(indexPath);
  });
} else {
  // Lazily import Vite for dev to avoid overhead in production
  import("vite").then(async (vite) => {
    const viteServer = await vite.createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(viteServer.middlewares);
  }).catch(err => {
    console.error("Failed to load Vite server:", err);
  });
}

// Development server startup
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

export default app;

