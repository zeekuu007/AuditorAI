import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";

// Mimic __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Route: Health
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok", time: new Date().toISOString() });
});

// API Route: Audit (Self-contained for robustness)
app.post("/api/audit", async (req: Request, res: Response) => {
  console.log("Audit request received:", req.body);
  
  try {
    const { url, industry } = req.body;
    
    // 1. Basic Validation
    if (!url || typeof url !== "string") {
      return res.status(400).json({ 
        success: false, 
        message: "URL is required and must be a string",
        error: "Invalid input" 
      });
    }

    // 2. Format validation
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      console.warn("Suspicious URL format:", url);
      // We continue but log it
    }

    // 3. Simulate processing delay
    // This is safe even on Vercel unless it exceeds 10s/60s
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 4. Extract site metadata
    let siteName = "Your Business";
    let domain = "your-website.com";
    try {
      domain = url.replace(/https?:\/\//, "").split("/")[0].replace("www.", "");
      if (domain) {
        siteName = domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1);
      }
    } catch (e) {
      console.error("Domain parsing error:", e);
    }

    // 5. Data pools
    const industriesPool: Record<string, string[]> = {
      "E-commerce": ["product pages", "checkout flow", "cart abandonment", "Social Proof", "Microcopy"],
      "SaaS": ["landing page", "onboarding flow", "pricing table", "Value Proposition", "Demo booking"],
      "Lead Gen": ["contact form", "value prop", "trust signals", "Lead magnet", "CTA visibility"],
      "General": ["homepage", "navigation", "footer", "Mobile responsiveness", "Readability"]
    };

    const targetIndustry = (industry && industriesPool[industry]) ? industry : "General";
    const keywords = industriesPool[targetIndustry] || industriesPool["General"];

    const score = Math.floor(Math.random() * (85 - 45 + 1)) + 45;
    const status = score < 60 ? "Critical" : score < 75 ? "Needs Improvement" : "Strong";
    const monthlyLoss = Math.floor(Math.random() * (12000 - 3000 + 1)) + 3000;
    const yearlyLoss = monthlyLoss * 12;

    const issuePool = [
      {
        title: "Weak Value Proposition",
        description: `The ${keywords[0]} doesn't clearly articulate why a customer should choose ${siteName} over competitors.`,
        fix: "Rewrite the hero heading to focus on outcomes, not features.",
        whyItMatters: "Confusion causes friction. If visitors don't understand your value in 3 seconds, they leave.",
        potentialImpact: "15-20% boost in conversion."
      },
      {
        title: "High Friction Checkout",
        description: `The ${keywords[1]} has too many steps, causing massive drop-off during the final commitment phase.`,
        fix: "Reduce form fields and add guest checkout options.",
        whyItMatters: "Every additional field reduces your conversion rate by approx 7%.",
        potentialImpact: "10% reduction in cart abandonment."
      },
      {
        title: "Hidden Social Proof",
        description: `Trust signals for ${siteName} are buried or missing on key decision pages like the ${keywords[0]}.`,
        fix: "Place testimonials or client logos directly below the primary CTA.",
        whyItMatters: "Social proof provides the 'permission' visitors need to buy from a new brand.",
        potentialImpact: "8-12% lift in RPV (Revenue Per Visitor)."
      },
      {
        title: "Invisible CTA Contrast",
        description: `Your primary buttons on the ${keywords[0]} lack visual weight and blend into the branding.`,
        fix: "Use a high-contrast 'pop' color for primary conversion buttons.",
        whyItMatters: "If they can't find the button, they can't give you money.",
        potentialImpact: "20% increase in CTR."
      },
      {
        title: "Mobile Layout Breaking",
        description: `The ${keywords[3] || "mobile UI"} is suffering from 'thumb-reach' issues on larger devices.`,
        fix: "Reposition mobile buttons to the bottom 30% of the screen.",
        whyItMatters: "Mobile traffic is often >60% but converts at half the rate due to UX friction.",
        potentialImpact: "Significant recovery of mobile revenue."
      }
    ];

    // 6. Selection logic
    const selectedIssues = [...issuePool].sort(() => 0.5 - Math.random());
    const primaryIssue = selectedIssues[0];
    const secondaryIssue = selectedIssues[1] || selectedIssues[0];

    // 7. Construct response
    const result = {
      success: true,
      message: "Audit generated",
      score,
      status,
      estimatedMonthlyRevenueLoss: monthlyLoss,
      estimatedYearlyRevenueLoss: yearlyLoss,
      revenueImpactStatement: `Based on industry benchmarks for ${targetIndustry}, ${siteName} is likely leaking significant revenue through micro-frictions.`,
      executiveAnalysis: `Our scan of ${domain} suggests that while the brand presence is strong, the conversion architecture lags behind best practices. The primary friction point is ${primaryIssue.title}.`,
      executiveSummaryBullets: [
        `${siteName}'s current conversion rate likely underperforms for the ${targetIndustry} industry.`,
        `${primaryIssue.title} is causing approximately $${Math.floor(monthlyLoss * 0.4).toLocaleString()}/mo in leakage.`,
        "Mobile users are experiencing higher friction than desktop counterparts.",
        "The value proposition needs immediate sharpening to reduce bounce rates."
      ],
      topIssues: selectedIssues.map(issue => ({
        title: issue.title,
        impact: "High",
        description: issue.description,
        fix: issue.fix,
        whyItMatters: issue.whyItMatters,
        potentialImpactText: issue.potentialImpact
      })),
      quickWins: [
        "Improve hero contrast",
        "Add trust badges to footer",
        "Speed up mobile load time"
      ],
      strategicRecommendations: [
        "A/B test the primary headline",
        "Heatmap the checkout flow"
      ],
      emailTemplate: {
        subject: `Quick feedback for ${siteName}`,
        body: `Hey — came across your store, really like what you're building.\n\nQuick thing I noticed:\n\nYour current site flow is likely underperforming for first-time visitors — especially on mobile.\n\nFor example: ${primaryIssue.description}\n\nFixing this alone could noticeably improve conversions without increasing ad spend.\n\nI recorded a quick teardown showing exactly where you're losing revenue.\n\nWant me to send it over?`
      },
      performanceMetrics: {
        messaging: Math.floor(Math.random() * 40) + 50,
        trust: Math.floor(Math.random() * 40) + 50,
        performance: Math.floor(Math.random() * 40) + 50,
        ux: Math.floor(Math.random() * 40) + 50,
        conversion: Math.floor(Math.random() * 40) + 50
      },
      nextStepsCTA: {
         headline: "Stop the leakage",
         body: "Most of these issues can be fixed in under 4 hours.",
         buttonText: "Get full report"
      }
    };

    console.log("Audit successfully generated for:", domain);
    return res.status(200).json(result);

  } catch (err: any) {
    console.error("FATAL: /api/audit crashed", err);
    return res.status(500).json({ 
      success: false, 
      message: "Backend engine failure",
      error: err.message || "Unknown error"
    });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  
  app.get("*", (req, res) => {
    // Don't mask API errors with index.html
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ success: false, message: "API endpoint not found" });
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  // Development only - lazy import Vite
  // We use a separate function to avoid top-level await issues or bundling crashes
  const setupVite = async () => {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware loaded");
    } catch (e) {
      console.warn("Vite not found, serving static files only");
    }
  };
  setupVite();
}

const PORT = Number(process.env.PORT) || 3000;
// Only listen if not running on Vercel as a serverless function entry point
// Though for AI Studio Express apps, app.listen is usually fine.
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

export default app;

