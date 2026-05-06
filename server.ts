import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// API Route: Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API Route: Audit (Simulated)
app.post("/api/audit", async (req, res) => {
  try {
    const { url, industry } = req.body;
    
    // Validate request
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        message: "URL is required",
        error: "Missing parameters" 
      });
    }

    // Deep validation of URL format (basic check)
    if (!url.includes(".") || url.length < 4) {
       return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid website URL",
        error: "Invalid URL format" 
      });
    }

    // Artificial delay to simulate "processing"
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract domain for personalization
    let domain = "your site";
    try {
      const cleanUrl = url.replace(/https?:\/\//, "").split("/")[0].replace("www.", "");
      if (cleanUrl) domain = cleanUrl;
    } catch (e) {
      console.warn("Domain extraction failed for:", url);
    }
    
    const siteName = domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1);

    const industriesList: Record<string, string[]> = {
      "E-commerce": ["product pages", "checkout flow", "cart abandonment", "Social Proof", "Microcopy"],
      "SaaS": ["landing page", "onboarding flow", "pricing table", "Value Proposition", "Demo booking"],
      "Lead Gen": ["contact form", "value prop", "trust signals", "Lead magnet", "CTA visibility"],
      "General": ["homepage", "navigation", "footer", "Mobile responsiveness", "Readability"]
    };

    const targetIndustry = (industry && industriesList[industry]) ? industry : "General";
    const keywords = industriesList[targetIndustry] || industriesList["General"];

    // Randomize score (45-85)
    const score = Math.floor(Math.random() * (85 - 45 + 1)) + 45;
    const status = score < 60 ? "Critical" : score < 75 ? "Needs Improvement" : "Strong";
    
    // Revenue loss logic
    const monthlyLoss = Math.floor(Math.random() * (12000 - 3000 + 1)) + 3000;
    const yearlyLoss = monthlyLoss * 12;

    const issuePool = [
      {
        title: "Weak Value Proposition",
        impact: "High",
        description: `The ${keywords[0]} doesn't clearly articulate why a customer should choose ${siteName} over competitors within the first 3 seconds.`,
        fix: "Rewrite the H1 to focus on the primary benefit rather than features.",
        whyItMatters: "Confusion is the #1 conversion killer. If they don't get it, they leave.",
        potentialImpact: "15-20% boost in unique page views conversion."
      },
      {
        title: "Friction in User Flow",
        impact: "Medium",
        description: `Too many steps or distractions in the ${keywords[1]} (specifically around the secondary nav) are causing users to drop off.`,
        fix: "Remove secondary navigation and unnecessary form fields in the conversion path.",
        whyItMatters: "Every extra click reduces the probability of a conversion by roughly 10%.",
        potentialImpact: "8-12% reduction in bounce rate on target pages."
      },
      {
        title: "Invisible Calls to Action",
        impact: "High",
        description: `The primary buttons on the ${keywords[0]} blend into the background or are buried 'below the fold' on mobile browsers.`,
        fix: "Use high-contrast colors for primary buttons and ensure a CTA is visible without scrolling.",
        whyItMatters: "If users have to hunt for the 'Next Step', they won't take it.",
        potentialImpact: "25% increase in click-through rate (CTR)."
      },
      {
        title: "Lack of Social Proof",
        impact: "Medium",
        description: `${siteName} lacks visible trust signals (reviews, logos, case studies) at the critical decision-making points.`,
        fix: "Inject 2-3 customer testimonials directly above the main conversion element.",
        whyItMatters: "Trust is the currency of the web. Without proof, you're just a stranger asking for money.",
        potentialImpact: "5-10% lift in overall trust score and conversion."
      },
      {
        title: "Mobile Optimization Gaps",
        impact: "High",
        description: `The ${keywords[3] || "layout"} breaks on smaller screens, specifically affecting the ${keywords[2] || "checkout"} experience for iOS users.`,
        fix: "Implement a 'sticky' CTA on mobile and fix overlapping element containers.",
        whyItMatters: "Over 60% of your traffic is likely mobile. A broken mobile UI is a broken business.",
        potentialImpact: "Significant recovery of mobile-only revenue loss."
      },
      {
        title: "Information Overload",
        impact: "Medium",
        description: `The ${keywords[0]} is too text-heavy, making it difficult for visitors to scan for key information quickly.`,
        fix: "Use bullet points, iconography, and better whitespace to break up long blocks of text.",
        whyItMatters: "Web users scan, they don't read. If you make them work too hard, they'll leave.",
        potentialImpact: "10-15% increase in average session duration."
      },
      {
        title: "Lack of Internal Urgency",
        impact: "Low",
        description: `There is no incentive for a visitor of ${siteName} to take action *right now* rather than leaving and forgetting.`,
        fix: "Implement subtle urgency triggers like 'limited spots available' or a clear deadline for an offer.",
        whyItMatters: "Procrastination leads to lost sales. Give them a reason to click today.",
        potentialImpact: "5-8% increase in immediate checkout starts."
      },
      {
        title: "Conflicting Navigational Paths",
        impact: "Medium",
        description: `The navigation menu on ${keywords[0]} has too many links, distracting users from the primary conversion path.`,
        fix: "Simplify the headers to only include 4-5 essential links.",
        whyItMatters: "Hick's Law states that more choices lead to longer decision times and higher abandonment.",
        potentialImpact: "12% more traffic directed to high-value pages."
      },
      {
        title: "Poor Visual Hierarchy",
        impact: "High",
        description: `The most important element on the ${keywords[1]} isn't the most visually prominent, confusing the user's focus.`,
        fix: "Use scale and color contrast to guide the eye toward the primary CTA.",
        whyItMatters: "Visual hierarchy controls the 'story' of the page. If the story is messy, the conversion fails.",
        potentialImpact: "18% improvement in focus-map heatmap scores."
      },
      {
        title: "Broken Trust during Checkout",
        impact: "High",
        description: `The transition from ${keywords[1]} to the final step lack consistent branding or security badges.`,
        fix: "Add SSL badges and keep branding consistent across subdomains or external checkouts.",
        whyItMatters: "Security concerns at checkout are a top reason for cart abandonment.",
        potentialImpact: "15% reduction in checkout abandonment."
      }
    ];

    // Shuffle and pick 5
    const selectedIssues = [...issuePool].sort(() => 0.5 - Math.random());
    
    // Safety check: ensure we have at least 2 issues for the bullets logic
    if (selectedIssues.length < 2) {
       selectedIssues.push(...issuePool.slice(0, 2));
    }

    const result = {
      success: true,
      message: "Audit generated successfully",
      score,
      status,
      estimatedMonthlyRevenueLoss: monthlyLoss,
      estimatedYearlyRevenueLoss: yearlyLoss,
      revenueImpactStatement: `Based on average ${targetIndustry} benchmarks, ${siteName} is likely leaking significant revenue through micro-frictions.`,
      executiveAnalysis: `Our scan of ${domain} reveals that while the brand is strong, the conversion architecture is lagging behind best practices. The primary friction point is the ${selectedIssues[0].title}.`,
      executiveSummaryBullets: [
        `${siteName}'s conversion rate is currently below industry average for ${targetIndustry}.`,
        `The ${selectedIssues[1].title} is causing approximately $${Math.floor(monthlyLoss * 0.4).toLocaleString()}/mo in direct leakage.`,
        "Mobile users are experiencing higher bounce rates than desktop counterparts.",
        "The value proposition needs immediate sharpening to reduce immediate bounce.",
        "Social proof is underutilized at critical decision points."
      ],
      topIssues: selectedIssues.slice(0, 5).map(issue => ({
        title: issue.title,
        impact: issue.impact,
        description: issue.description,
        fix: issue.fix,
        whyItMatters: issue.whyItMatters,
        potentialImpactText: issue.potentialImpact
      })),
      quickWins: [
        "Change CTA button color to a high-contrast hue.",
        "Add a trust banner with logos under the hero section.",
        "Simplify the main navigation menu.",
        "Speed up page load by optimizing top-of-fold images.",
        "Add a 5-second customer video testimonial."
      ].sort(() => 0.5 - Math.random()).slice(0, 4),
      strategicRecommendations: [
        "Implement A/B testing on all primary headlines.",
        "Conduct a full heat-map analysis of the checkout flow.",
        "Redesign the mobile experience for 'thumb-friendly' interaction."
      ],
      emailTemplate: {
        subject: [`Quick feedback on ${domain}`, `Question about ${siteName}`, `I recorded a video for you regarding ${domain}`][Math.floor(Math.random() * 3)],
        body: (() => {
           const intros = [
             "Hey — came across your store, really like what you're building.",
             `Hi, I was just checking out ${domain} and I'm a big fan of the brand.`,
             `Hey, I was browsing ${siteName} and noticed something interesting.`
           ];
           const intro = intros[Math.floor(Math.random() * intros.length)];
           
           return `${intro}\n\nQuick thing I noticed:\n\nYour current site flow is likely underperforming for first-time visitors — especially on mobile.\n\nFor example: ${selectedIssues[0].description}\n\nFixing this alone could noticeably improve conversions without increasing ad spend.\n\nI recorded a quick teardown showing exactly where you're losing revenue.\n\nWant me to send it over?`;
        })()
      },
      nextStepsCTA: {
        headline: `Stop leaking $${monthlyLoss.toLocaleString()} a month.`,
        body: `The issues identified on ${domain} are entirely fixable. Most of our clients see an ROI within the first 14 days of implementation.`,
        buttonText: "Request a Full Implementation Plan"
      },
      performanceMetrics: {
        messaging: Math.floor(Math.random() * (90 - 40) + 40),
        trust: Math.floor(Math.random() * (90 - 40) + 40),
        performance: Math.floor(Math.random() * (90 - 40) + 40),
        ux: Math.floor(Math.random() * (90 - 40) + 40),
        conversion: Math.floor(Math.random() * (90 - 40) + 40)
      }
    };

    res.json(result);
  } catch (error: any) {
    console.error("CRITICAL: Audit Generation Error:", error);
    res.status(200).json({ 
       success: false,
       message: "We encountered an issue generating your audit, but here is a sample assessment based on common patterns.",
       error: error.message,
       score: 58,
       status: "Needs Improvement",
       estimatedMonthlyRevenueLoss: 4200,
       topIssues: [],
       quickWins: ["Optimize mobile load speed", "Sharpen headline clarity"]
    });
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

