import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  TrendingUp, 
  CreditCard, 
  User as UserIcon, 
  Plus, 
  ArrowRight, 
  Globe, 
  BarChart3, 
  ShieldCheck, 
  ChevronRight,
  Download,
  Share2,
  Lock,
  Check,
  AlertTriangle,
  Zap,
  Clock,
  ExternalLink,
  Copy,
  ChevronLeft,
  Settings,
  Mail,
  Target,
  MessageSquare,
  Sun,
  Moon
} from "lucide-react";
import { generateAudit } from "./ai";
import { Screen, User, AuditReport, AuditResult } from "./types";
import { Logo } from "./components/Logo";

const INITIAL_USER: User = {
  name: "Zeerak Khan",
  email: "zeerak@auditguru.ai",
  plan: "Pro",
  auditsRemaining: 999999
};

const INITIAL_REPORTS: AuditReport[] = [
  { 
    id: "1", 
    url: "example.com", 
    industry: "SaaS", 
    score: 62, 
    date: "May 20, 2024", 
    status: "Completed",
    result: {
      score: 62,
      estimatedRevenueLoss: 4200,
      executiveAnalysis: "The site has strong messaging but fails to convert due to excessive form friction and lack of clear CTA hierarchy.",
      topIssues: [
        {
          title: "High Form Friction",
          impact: "High",
          description: "The signup form has 12 fields, causing a 45% drop-off rate.",
          fix: "Reduce form fields to 4 (Name, Email, Job Title, Company Size) and use a multi-step approach if more data is needed.",
          whyItMatters: "Every additional field reduces conversion by 3-5%.",
          potentialImpactText: "+15% Conversion"
        },
        {
          title: "Weak Social Proof",
          impact: "Medium",
          description: "Testimonials are tucked away at the bottom of the page.",
          fix: "Move testimonials to the 'above-the-fold' section and include customer logos for credibility.",
          whyItMatters: "Trust signals are most effective near the decision point.",
          potentialImpactText: "+8% Trust"
        },
        {
          title: "Confusing Error Messaging",
          impact: "Low",
          description: "Field validation errors are generic and don't guide the user on how to fix them.",
          fix: "Implement inline validation with clear instructions on how to correct common errors.",
          whyItMatters: "Clarity in user feedback reduces frustration and abandonment.",
          potentialImpactText: "+2% Retention"
        },
        {
          title: "Missing 'Guest' Checkout Option",
          impact: "High",
          description: "Forcing account creation before purchase is a major conversion blocker.",
          fix: "Enable guest checkout and offer account creation on the 'Thank You' page instead.",
          whyItMatters: "Frictionless checkout is the fastest path to revenue.",
          potentialImpactText: "+15% Conversion"
        },
        {
          title: "Slow Landing Page Load Time",
          impact: "Medium",
          description: "The initial page load is 4.2s on mobile, which is double the industry standard.",
          fix: "Optimize images, implement lazy loading, and compress CSS/JS files.",
          whyItMatters: "Every second of delay reduces conversion by up to 7%.",
          potentialImpactText: "+5% CR Improvement"
        }
      ],
      quickWins: ["Add trust badges", "Shorten footer", "Fix mobile padding"],
      strategicRecommendations: ["Refocus target audience", "Simplify pricing", "Add demo video"],
      performanceMetrics: { messaging: 7, trust: 5, performance: 8, ux: 6, conversion: 5 }
    }
  },
  { 
    id: "2", 
    url: "wellness-cat.com", 
    industry: "E-commerce", 
    score: 96, 
    date: "May 18, 2024", 
    status: "Completed",
    result: {
      score: 96,
      estimatedRevenueLoss: 450,
      executiveAnalysis: "Outstanding conversion architecture. The site leverages social proof and clear urgency markers effectively. Only minor technical debt remains.",
      topIssues: [
        {
          title: "Micro-copy Clarity",
          impact: "Low",
          description: "Shipping policy links are slightly hidden in the footer.",
          fix: "Move shipping info closer to the 'Add to Cart' button.",
          whyItMatters: "Removing small frictions near the checkout increases completion rates.",
          potentialImpactText: "+1% LTV"
        },
        {
          title: "Abandoned Cart Reminders",
          impact: "Medium",
          description: "No automatic follow-up for users who leave items in their cart.",
          fix: "Implement a 3-step email sequence for abandoned carts.",
          whyItMatters: "Cart recovery can drive up to 10% more revenue with zero spend.",
          potentialImpactText: "+5% Sales"
        },
        {
          title: "Sticky Header Navigation",
          impact: "Low",
          description: "Desktop navigation disappears on scroll, making it harder to navigate back.",
          fix: "Make the header sticky so 'Shop Now' is always visible.",
          whyItMatters: "Reducing effort to navigate improves browsing depth.",
          potentialImpactText: "+2% PV/Session"
        },
        {
          title: "Instagram Feed Lag",
          impact: "Low",
          description: "The social feed widget loads before the main content.",
          fix: "Lazy-load social widgets after the hero section is ready.",
          whyItMatters: "Speed impacts perceived value and bounce rates.",
          potentialImpactText: "+1% Retention"
        },
        {
          title: "Benefit-First Headlines",
          impact: "Medium",
          description: "Headlines focus on features rather than outcomes for cats.",
          fix: "Rewrite headlines to lead with 'Happier, Healthier Cats' messaging.",
          whyItMatters: "Emotional connection drives purchase intent in pets niche.",
          potentialImpactText: "+4% CTR"
        }
      ],
      quickWins: ["Update meta descriptions", "Add favicon"],
      strategicRecommendations: ["Loyalty program implementation"],
      performanceMetrics: { messaging: 9, trust: 9, performance: 9, ux: 10, conversion: 9 }
    }
  },
  { 
    id: "3", 
    url: "brand.io", 
    industry: "Agency", 
    score: 45, 
    date: "May 15, 2024", 
    status: "Completed",
    result: {
      score: 45,
      estimatedRevenueLoss: 8500,
      executiveAnalysis: "Critical issues detected. The site lacks a secure connection and fundamental SEO metadata, leading to high bounce rates and massive trust deficits in the eyes of visitors.",
      topIssues: [
        {
          title: "Missing SSL Certificate",
          impact: "High",
          description: "Site is currently serving over HTTP, flagging 'Not Secure' in modern browsers.",
          fix: "Install an SSL certificate immediately and force HTTPS redirection.",
          whyItMatters: "Security is non-negotiable for modern trust and SEO ranking.",
          potentialImpactText: "+40% Trust"
        },
        {
          title: "Unoptimized Hero Image",
          impact: "Medium",
          description: "The main hero image is 4MB, delaying rendering significantly and hurting LCP scores.",
          fix: "Resize and compress images to under 200KB.",
          whyItMatters: "Visual stability and speed are key to professional first impressions.",
          potentialImpactText: "+12% Speed"
        },
        {
          title: "Complex Checkout Flow",
          impact: "High",
          description: "The multi-step process for a simple service leads to high drop-off rates.",
          fix: "Simplify to a single-page checkout process.",
          whyItMatters: "Every additional field is an opportunity for the user to leave.",
          potentialImpactText: "+20% Sales"
        },
        {
          title: "Hidden Contact Information",
          impact: "Medium",
          description: "Users have to scroll through multiple pages to find a way to get help.",
          fix: "Place a 'Contact Us' link prominently in the header and footer.",
          whyItMatters: "Accessibility builds reliability and perceived support quality.",
          potentialImpactText: "+8% Leads"
        },
        {
          title: "No Value Proposition",
          impact: "High",
          description: "The headline is generic and doesn't explain what the agency does differently.",
          fix: "Rewrite the hero section to focus on the unique value provided to clients.",
          whyItMatters: "Clarity in the first 3 seconds is vital for retention.",
          potentialImpactText: "+15% Engagement"
        }
      ],
      quickWins: ["Set up SSL", "Add meta titles", "Compress main image"],
      strategicRecommendations: ["Full site speed optimization", "Rebranding strategy"],
      performanceMetrics: { messaging: 4, trust: 2, performance: 3, ux: 5, conversion: 3 }
    }
  },
  { id: "4", url: "shop.com", industry: "Retail", score: 71, date: "May 12, 2024", status: "Locked" },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<AuditReport[]>(INITIAL_REPORTS);
  
  // Audit State
  const [url, setUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Analyzing page speed...");
  const [currentAudit, setCurrentAudit] = useState<AuditResult | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark based on logo vibe

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const downloadPDF = async (report: AuditReport | null = null) => {
    try {
      const auditData = report?.result || currentAudit;
      const auditUrl = report?.url || url;
      
      if (!auditData) {
        alert("No audit data available for this site yet.");
        return;
      }

      const doc = new jsPDF();
      const white: [number, number, number] = [255, 255, 255];
      const black: [number, number, number] = [0, 0, 0];
      const violet: [number, number, number] = [139, 92, 246]; // violet-500
      const teal: [number, number, number] = [45, 212, 191]; // teal-400
      const slateDark: [number, number, number] = [15, 23, 42];
      
      // we'll draw the magnifying glass logo manually in PDF
      const drawLogo = (doc: jsPDF, x: number, y: number, scale: number = 1) => {
        doc.setDrawColor(violet[0], violet[1], violet[2]);
        doc.setLineWidth(1.5 * scale);
        doc.circle(x, y, 10 * scale);
        
        // Bars
        doc.setFillColor(teal[0], teal[1], teal[2]);
        doc.rect(x - 6 * scale, y + 2 * scale, 1.5 * scale, -4 * scale, 'F');
        doc.rect(x - 3 * scale, y + 2 * scale, 1.5 * scale, -7 * scale, 'F');
        doc.rect(x + 0 * scale, y + 2 * scale, 1.5 * scale, -9 * scale, 'F');
        doc.rect(x + 3 * scale, y + 2 * scale, 1.5 * scale, -5 * scale, 'F');
        
        // Handle (A shape)
        doc.setLineWidth(3 * scale);
        doc.line(x + 8 * scale, y + 8 * scale, x + 15 * scale, y + 15 * scale);
      };

      // --- HEADER (Dark Branding) ---
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, 210, 50, 'F');
      
      // Branding: AuditGuru
      drawLogo(doc, 25, 25, 1.2);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("Audit", 45, 28);
      const auditWidth = doc.getTextWidth("Audit");
      doc.setTextColor(violet[0], violet[1], violet[2]);
      doc.text("Guru", 45 + auditWidth, 28);

      // Tagline
      doc.setFontSize(7);
      doc.setTextColor(140, 140, 140);
      doc.text("FIND ISSUES. FIX CONVERSIONS. GROW REVENUE.", 45, 34);

      doc.setTextColor(violet[0], violet[1], violet[2]);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("CRO AUDIT REPORT", 200, 28, { align: 'right' });
      
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Prepared for: ${auditUrl.toUpperCase()}`, 200, 34, { align: 'right' });
      doc.text(`DATE Created: ${report?.date || new Date().toLocaleDateString()}`, 200, 40, { align: 'right' });

      // --- BODY (White) ---
      let currentY = 65;

      const scScore = auditData.score || 0;
      let scColor: [number, number, number] = [220, 38, 38]; 
      if (scScore >= 95) scColor = [16, 185, 129];
      else if (scScore >= 60) scColor = [245, 158, 11];
      
      doc.setDrawColor(scColor[0], scColor[1], scColor[2]);
      doc.setLineWidth(2.5);
      doc.circle(170, currentY + 12, 18);
      doc.setFontSize(22);
      doc.setTextColor(scColor[0], scColor[1], scColor[2]);
      doc.text(`${scScore}`, 170, currentY + 14, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("SCORE", 170, currentY + 20, { align: 'center' });

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.text("EXECUTIVE ANALYSIS", 20, currentY + 8);
      
      doc.setDrawColor(scColor[0], scColor[1], scColor[2]);
      doc.setLineWidth(1.5);
      doc.line(20, currentY + 11, 45, currentY + 11);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const analysisLines = doc.splitTextToSize(auditData.executiveAnalysis || "No analysis available.", 125);
      doc.text(analysisLines, 20, currentY + 22, { align: 'justify', maxWidth: 125 });

      // Spacing fix for revenue loss box
      currentY += Math.max(55, (analysisLines.length * 5) + 30);

      doc.setLineWidth(1.5);
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(252, 165, 165);
      doc.roundedRect(20, currentY, 170, 30, 4, 4, 'FD');
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("ESTIMATED MONTHLY REVENUE LOSS", 105, currentY + 10, { align: 'center' });
      doc.setFontSize(22);
      doc.text(`$${(auditData.estimatedRevenueLoss || 0).toLocaleString()}`, 105, currentY + 22, { align: 'center' });

      currentY += 45;

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("TOP CONVERSION HURDLES", 20, currentY);
      
      autoTable(doc, {
        startY: currentY + 6,
        head: [['ISSUE', 'IMPACT', 'RECOMMENDED FIX']],
        body: auditData.topIssues.map(issue => [issue.title.toUpperCase(), issue.impact, issue.fix]),
        theme: 'striped',
        headStyles: { fillColor: slateDark, textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: { 
          0: { cellWidth: 60, fontStyle: 'bold', fontSize: 8.5 }, 
          1: { cellWidth: 25, halign: 'center' }, 
          2: { cellWidth: 85 } 
        },
        didParseCell: (data: any) => {
          if (data.section === 'body' && data.column.index === 1) {
            const val = data.cell.raw;
            if (val === 'High') data.cell.styles.textColor = [220, 38, 38];
            else if (val === 'Medium') data.cell.styles.textColor = [249, 115, 22]; // Orange
            else if (val === 'Low') data.cell.styles.textColor = [234, 179, 8]; // Yellow
          }
        }
      });

      const afterTableY = (doc as any).lastAutoTable.finalY + 15;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("NEXT STEPS: STOP THE REVENUE LEAKS", 20, afterTableY);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const closing = "Let's dive deeper into these results and build a concrete game plan to plug your revenue leaks. Schedule a quick 30-minute Strategy Call with our team to recover your lost conversions today.";
      const closingLines = doc.splitTextToSize(closing, 170);
      doc.text(closingLines, 20, afterTableY + 10);

      const pagesCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pagesCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("AUDIT GURU | STRATEGIC GROWTH SYSTEMS & PERFORMANCE LAB", 105, 285, { align: 'center' });
        doc.text(`Page ${i}/${pagesCount}`, 195, 285, { align: 'right' });
      }

      doc.save(`Audit-${auditUrl.replace(/https?:\/\//, '').split('/')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF.");
    }
  };

  const handleUpgrade = (plan: string) => {
    setIsUpgrading(true);
    // Simulate payment logic
    setTimeout(() => {
      setUser(prev => ({ ...prev, plan: plan as any, auditsRemaining: 999 }));
      setIsUpgrading(false);
      setScreen("dashboard");
      alert(`Success! You have been upgraded to the ${plan} plan.`);
    }, 2000);
  };

  // Simulation effect for loading
  useEffect(() => {
    if (screen === "analyzing") {
      const texts = [
        "Analyzing page speed...",
        "Scanning conversion elements...",
        "Evaluating trust signals...",
        "Reviewing content & copy...",
        "Mapping user journey..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setScreen("overview");
            return 100;
          }
          const next = prev + 1;
          if (next % 20 === 0 && i < texts.length - 1) {
            i++;
            setLoadingText(texts[i]);
          }
          return next;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [screen]);

  const runAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setScreen("analyzing");
    setProgress(0);
    setError(null);
    
    try {
      // We pass the industry too
      const result = await generateAudit(url, industry || "General");
      setCurrentAudit(result);
      
      const newReport: AuditReport = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        industry: industry || "General",
        score: result.score,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: (user.auditsRemaining > 0 || user.plan === "Pro") ? "Completed" : "Locked",
        result
      };
      
      setReports(prev => [newReport, ...prev]);
      if (user.auditsRemaining > 0 && user.plan !== "Pro") {
        setUser(prev => ({ ...prev, auditsRemaining: prev.auditsRemaining - 1 }));
      }
      setScreen("overview");
    } catch (err: any) {
      console.error("Audit failed", err);
      setError(err.message || "Failed to generate audit. Please try again.");
      setScreen("onboarding");
    }
  };

  const SidebarItem = ({ id, icon: Icon, label, activeScreen }: { id: Screen, icon: any, label: string, activeScreen: Screen }) => (
    <button
      onClick={() => setScreen(id)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        activeScreen === id 
          ? "bg-indigo-600/10 text-indigo-400" 
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Logo showText={false} size="sm" />
            <span className="font-ex-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AuditGuru</span>
          </div>

          <nav className="space-y-1">
            <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" activeScreen={screen} />
            <SidebarItem id="onboarding" icon={Plus} label="New Audit" activeScreen={screen} />
            <SidebarItem id="reports" icon={FileText} label="Reports" activeScreen={screen} />
            <SidebarItem id="growth-tools" icon={TrendingUp} label="Growth Tools" activeScreen={screen} />
            <SidebarItem id="billing" icon={CreditCard} label="Billing" activeScreen={screen} />
            <SidebarItem id="account" icon={UserIcon} label="Account" activeScreen={screen} />
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-800">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-between px-4 py-2.5 mb-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all text-slate-400 hover:text-white"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-xs font-bold uppercase tracking-widest">{isDarkMode ? 'Light' : 'Dark'} Mode</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-600'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isDarkMode ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </button>
          
          <div className="bg-slate-800/50 rounded-xl p-3 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user.plan === "Pro" ? "Active Subscription" : "Free Audits Left"}</span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{user.plan === "Pro" ? "Unlimited" : `${user.auditsRemaining}/2`}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500" 
                style={{ width: `${user.plan === "Pro" ? 100 : (user.auditsRemaining / 2) * 100}%` }} 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-[10px] text-slate-500">{user.plan} Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 relative custom-scrollbar transition-colors duration-300">
        <AnimatePresence mode="wait">
          {screen === "onboarding" && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="min-h-full flex items-center justify-center p-8"
            >
              <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="text-slate-900 dark:text-slate-100">
                  <h1 className="text-4xl font-bold mb-4 leading-tight">
                    Let's find what's <br />
                    costing you <span className="text-indigo-600 dark:text-indigo-400">sales</span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
                    Enter your website and we'll run a <br />
                    comprehensive CRO audit.
                  </p>

                  <form onSubmit={runAudit} className="space-y-6">
                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Website URL</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600" />
                        <input
                           type="text"
                           value={url}
                           onChange={(e) => setUrl(e.target.value)}
                           placeholder="https://yourwebsite.com"
                           className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Industry (Optional)</label>
                      <select 
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none"
                      >
                        <option value="">Select your industry</option>
                        <option value="SaaS">SaaS</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Agency">Agency</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Legal">Legal</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={!url}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-indigo-600/20"
                    >
                      Run Audit
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </div>

                <div className="relative hidden md:block">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative z-10">
                    <div className="w-full aspect-[4/3] bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center">
                       <div className="relative">
                          <div className="w-48 h-32 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                              <Search className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                            </div>
                          </div>
                          <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                          </div>
                       </div>
                    </div>
                  </div>
                  <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
                  <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
                </div>
              </div>
            </motion.div>
          )}

          {screen === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-full flex flex-col items-center justify-center p-8 text-slate-900 dark:text-white"
            >
              <div className="max-w-md w-full text-center">
                <h2 className="text-3xl font-bold mb-2">Analyzing your website...</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-12">This usually takes 60-90 seconds</p>

                <div className="mb-12 relative text-left">
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-8">
                    <motion.div 
                      className="h-full bg-indigo-600 dark:bg-indigo-500" 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="absolute right-0 -top-8 text-sm font-bold text-indigo-600 dark:text-indigo-400">{progress}%</div>

                  <div className="space-y-4">
                    {[
                      { label: "Analyzing page speed", done: progress > 20 },
                      { label: "Scanning conversion elements", done: progress > 40 },
                      { label: "Evaluating trust signals", done: progress > 60 },
                      { label: "Reviewing content & copy", done: progress > 80 },
                      { label: "Mapping user journey", done: progress > 95 }
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${step.done ? "bg-emerald-500 text-white" : "border-2 border-slate-200 dark:border-slate-800"}`}>
                              {step.done && <Check className="w-3 h-3" />}
                            </div>
                            <span className={`text-sm ${step.done ? "text-slate-900 dark:text-slate-100 font-medium" : "text-slate-400 dark:text-slate-600"}`}>{step.label}</span>
                         </div>
                         {!step.done && progress > (i * 20) && (
                           <div className="w-4 h-4 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
                         )}
                         {step.done && <Check className="w-4 h-4 text-emerald-500" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radar Chart Placeholder Visual */}
                <div className="relative w-48 h-48 mx-auto opacity-20 dark:opacity-30">
                   <div className="absolute inset-0 border-2 border-indigo-600 dark:border-indigo-500 rounded-full animate-ping" />
                   <div className="absolute inset-4 border-2 border-indigo-600 dark:border-indigo-500 rounded-full" />
                   <div className="absolute inset-10 border-2 border-indigo-600 dark:border-indigo-500 rounded-full" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {screen === "overview" && currentAudit && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 max-w-6xl mx-auto text-slate-900 dark:text-slate-100"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Audit Overview</h2>
                <div className="flex gap-3">
                  <button 
                    onClick={() => downloadPDF()}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold"
                  >
                    <Download className="w-4 h-4" />
                    Download Full PDF
                  </button>
                  <button 
                    onClick={() => alert("Sharing functionality is coming soon!")}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all font-bold"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Report
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                  <div className="flex items-center gap-1.5 mb-4">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Conversion Score</span>
                    <Lock className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                  </div>
                  <div className="relative mb-4">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                      <circle 
                        cx="64" 
                        cy="64" 
                        r="60" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={377} 
                        strokeDashoffset={377 - (377 * currentAudit.score) / 100} 
                        className="text-orange-500" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-4xl font-bold leading-none">{currentAudit.score}<span className="text-lg text-slate-400 font-medium">/100</span></span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-1">Needs Improvement</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">You're losing potential customers.</p>
                  <button onClick={() => setScreen("paywall")} className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                    <Lock className="w-4 h-4" />
                    View Full Report
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 mb-6">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Estimated Revenue Loss</span>
                    <Lock className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                  </div>
                  <div className="text-5xl font-bold mb-2 text-slate-900 dark:text-slate-100">${currentAudit.estimatedRevenueLoss.toLocaleString()}</div>
                  <div className="text-sm font-bold text-red-500 mb-6 uppercase tracking-widest">Per Month</div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Fix the issues in this report to recover lost revenue.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Top 3 Issues</span>
                  </div>
                  <div className="space-y-4">
                    {currentAudit.topIssues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${issue.impact === "High" ? "bg-red-500" : issue.impact === "Medium" ? "bg-orange-500" : "bg-blue-500"}`} />
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{issue.title}</div>
                          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{issue.impact} Impact</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setScreen("issues")} className="mt-8 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-2 group transition-all">
                    View All Issues
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                   <span className="text-slate-500 dark:text-slate-400">You've used 1 of 2 free audits</span>
                   <div className="w-48 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 w-1/2" />
                   </div>
                </div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">1 free audit remaining</span>
              </div>
            </motion.div>
          )}

          {screen === "issues" && currentAudit && (
            <motion.div
              key="issues"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 max-w-6xl mx-auto text-slate-900 dark:text-slate-100"
            >
              <div className="mb-8">
                 <button onClick={() => setScreen("overview")} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 mb-4 font-medium transition-all">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Overview
                 </button>
                 <h2 className="text-2xl font-bold">Issues Breakdown</h2>
              </div>

              <div className="flex gap-4 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 whitespace-nowrap">All Issues ({currentAudit.topIssues.length})</button>
                <button className="px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap transition-all">High (5)</button>
                <button className="px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap transition-all">Medium (4)</button>
                <button className="px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap transition-all">Low (3)</button>
              </div>

              <div className="space-y-4">
                {currentAudit.topIssues.map((issue, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-500 transition-all shadow-sm">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${issue.impact === "High" ? "bg-red-50 dark:bg-red-900/30 text-red-500" : "bg-orange-50 dark:bg-orange-900/30 text-orange-500"}`}>
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold">{issue.title}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${issue.impact === "High" ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400" : "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400"}`}>{issue.impact} Impact</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                          {issue.description.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedIssue(i);
                        setScreen("issue-detail");
                      }} 
                      className="flex items-center gap-2 px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm group"
                    >
                      Preview
                      <Lock className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100" />
                    </button>
                  </div>
                ))}
                
                <button className="w-full py-4 text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-all">Show more issues</button>
              </div>
            </motion.div>
          )}

          {screen === "issue-detail" && currentAudit && selectedIssue !== null && (
            <motion.div
              key="issue-detail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 max-w-6xl mx-auto text-slate-900 dark:text-slate-100"
            >
              <div className="mb-8">
                 <button onClick={() => setScreen("issues")} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 mb-4 font-medium transition-all">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Issues
                 </button>
                 <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold">{currentAudit.topIssues[selectedIssue].title}</h2>
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full text-xs font-bold uppercase tracking-widest">High Impact</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">The Problem</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                      {currentAudit.topIssues[selectedIssue].description}
                    </p>
                    
                    <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-900 dark:text-slate-100 not-italic block mb-2 underline decoration-indigo-500/30">Why it matters:</span>
                      {currentAudit.topIssues[selectedIssue].whyItMatters}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="p-8">
                       <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">The Solution (Detailed Steps)</h3>
                       <div className="relative">
                          <div className="space-y-4 filter blur-sm select-none opacity-20 dark:opacity-10">
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-4/6" />
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                          </div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                             <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center mb-6">
                                <Lock className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                             </div>
                             <h4 className="text-xl font-bold mb-2">Detailed fix is locked</h4>
                             <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs">Upgrade to a paid plan to unlock the exact step-by-step fix for this issue.</p>
                             <button onClick={() => setScreen("paywall")} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                                Unlock All Fixes
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Potential Results</h3>
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                       <TrendingUp className="w-8 h-8 mb-4 opacity-50" />
                       <div className="text-2xl font-bold mb-1">{currentAudit.topIssues[selectedIssue].potentialImpactText}</div>
                       <div className="text-xs font-bold uppercase tracking-widest opacity-60">Estimated Improvement</div>
                    </div>
                  </div>

                  <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-600/20">
                    <Zap className="w-8 h-8 mb-6 opacity-30" />
                    <h3 className="text-xl font-bold mb-2 leading-tight">Need a professional to fix this?</h3>
                    <p className="text-sm text-indigo-100 mb-8 opacity-80 leading-relaxed">
                      Our certified CRO engineers can implement these fixes for you in 48 hours.
                    </p>
                    <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all font-bold">
                      Book a Free Call
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {screen === "paywall" && (
            <motion.div
              key="paywall"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 max-w-6xl mx-auto text-slate-900 dark:text-slate-100"
            >
              <div className="text-center mb-16">
                 <h2 className="text-4xl font-bold mb-4">Unlock Revenue-Boosting Fixes</h2>
                 <p className="text-slate-500 dark:text-slate-400 text-lg">Stop guessing. Get the exact step-by-step actions to scale your business.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: "Starter", price: 10, features: ["5 Audits per month", "Standard CRO Checklist", "Community Support", "Email Reports"] },
                  { name: "Growth", price: 20, priceId: "growth", featured: true, features: ["Unlimited Audits", "Step-by-Step Fixes", "1 Growth Call/mo", "PDF Exports", "Priority AI Scan"] },
                  { name: "Pro", price: 50, features: ["Everything in Growth", "Done-For-You Implementation", "Custom Strategy Lab", "Dedicated Account Manager"] }
                ].map((plan, i) => (
                  <div key={i} className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 flex flex-col border ${plan.featured ? "border-indigo-600 dark:border-indigo-500 ring-4 ring-indigo-500/10 scale-105" : "border-slate-100 dark:border-slate-800"} shadow-xl relative transition-all`}>
                    {plan.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Most Popular</div>
                    )}
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-end gap-1 mb-8">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-slate-400 dark:text-slate-500 font-medium mb-1">/mo</span>
                    </div>

                    <ul className="space-y-4 mb-10 flex-1">
                      {plan.features.map((f, fi) => (
                        <li key={fi} className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => handleUpgrade(plan.name)}
                      disabled={isUpgrading}
                      className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg ${plan.featured ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20" : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"} disabled:opacity-50`}
                    >
                      {isUpgrading ? "Processing..." : plan.name === user.plan ? "Current Plan" : "Get Started"}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-16 text-center">
                 <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">Trusted by over 400+ fast-growing startups</p>
                 <div className="flex justify-center gap-12 opacity-30 dark:opacity-50 grayscale filter invert dark:invert-0">
                    <Globe className="w-8 h-8" />
                    <Zap className="w-8 h-8" />
                    <TrendingUp className="w-8 h-8" />
                    <Target className="w-8 h-8" />
                    <BarChart3 className="w-8 h-8" />
                 </div>
              </div>
            </motion.div>
          )}

          {screen === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-10 max-w-7xl mx-auto text-slate-900 dark:text-slate-100"
            >
              <div className="flex justify-between items-center mb-12">
                <div>
                   <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name.split(" ")[0]}</h1>
                   <p className="text-slate-500 dark:text-slate-400">You have {user.auditsRemaining > 1000 ? "unlimited" : user.auditsRemaining} audit credits left.</p>
                </div>
                <button 
                  onClick={() => setScreen("onboarding")}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <Plus className="w-5 h-5" />
                  New Audit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                  { label: "Total Audits", value: "14", icon: Search },
                  { label: "Avg. Score", value: "68/100", icon: BarChart3 },
                  { label: "Issues Found", value: "124", icon: AlertTriangle },
                  { label: "Recoverable Rev.", value: "$4.2k", icon: TrendingUp }
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        <stat.icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                   <h3 className="font-bold">Recent Audits</h3>
                   <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        <th className="px-8 py-4">Website</th>
                        <th className="px-8 py-4">Industry</th>
                        <th className="px-8 py-4 text-center">Score</th>
                        <th className="px-8 py-4">Date</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                  <Globe className="w-4 h-4 text-indigo-400 dark:text-indigo-300" />
                               </div>
                               <span className="font-bold text-slate-900 dark:text-slate-100">{report.url}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400">{report.industry}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={`text-sm font-bold ${report.score > 70 ? "text-emerald-500" : report.score > 50 ? "text-orange-500" : "text-red-500"}`}>{report.score}/100</span>
                          </td>
                          <td className="px-8 py-5 text-sm text-slate-400 dark:text-slate-500 font-medium">{report.date}</td>
                          <td className="px-8 py-5 text-right">
                             {report.status === "Locked" && user.plan === "Free" ? (
                               <button 
                                 onClick={() => setScreen("paywall")}
                                 className="p-2 text-slate-300 dark:text-slate-700 hover:text-indigo-600 transition-colors flex items-center justify-end gap-2 ml-auto"
                               >
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">Unlock</span>
                                 <Lock className="w-4 h-4" />
                               </button>
                             ) : (
                               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => window.open(report.url.startsWith('http') ? report.url : `https://${report.url}`, '_blank')}
                                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => downloadPDF(report)}
                                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (report.result) {
                                        setCurrentAudit(report.result);
                                        setUrl(report.url);
                                        setScreen("overview");
                                      }
                                    }}
                                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 transition-colors font-bold text-xs uppercase tracking-widest"
                                  >
                                    Open
                                  </button>
                               </div>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {screen === "growth-tools" && (
            <motion.div 
              key="growth-tools"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="p-10 max-w-7xl mx-auto text-slate-900 dark:text-slate-100"
            >
               <div className="mb-12">
                 <h1 className="text-3xl font-bold mb-2">Growth & Conversion Tools</h1>
                 <p className="text-slate-500 dark:text-slate-400">Premium tools to help you implement fixes and scale faster.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[
                   { icon: Mail, title: "Cold Email Generator", desc: "Generate high-converting outreach emails based on your audit results.", plan: "Growth", color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
                   { icon: Target, title: "Landing Page Rewrite", desc: "An AI-powered copywriter that rewrites your landing page for better clarity.", plan: "Pro", color: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
                   { icon: BarChart3, title: "A/B Test Ideas", desc: "Data-driven hypotheses for your next split tests based on behavioral science.", plan: "Growth", color: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
                   { icon: MessageSquare, title: "Chatbot Script Gen", desc: "Custom scripts for your support/sales chatbot to handle common objections.", plan: "Growth", color: "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" },
                   { icon: LayoutDashboard, title: "Monthly Growth Plan", desc: "A 30-day step-by-step roadmap tailored to your website's biggest leaks.", plan: "Pro", color: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" },
                   { icon: ShieldCheck, title: "Trust Signal Scan", desc: "Deep analysis of your site's trust markers and how they affect LTV.", plan: "Growth", color: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400" }
                 ].map((tool, i) => (
                   <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-500 transition-all group flex flex-col">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${tool.color}`}>
                         <tool.icon className="w-7 h-7" />
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold">{tool.title}</h3>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 rounded-full">{tool.plan}</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed flex-1">{tool.desc}</p>
                      
                      <button 
                        onClick={() => setScreen("paywall")}
                        className="w-full py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold text-sm hover:bg-slate-900 dark:hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Unlock Tool
                      </button>
                   </div>
                 ))}
               </div>
            </motion.div>
          )}

          {/* Fallback/WIP screen */}
          {["reports", "billing", "account"].includes(screen) && (
            <motion.div 
              key="wip"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="min-h-full flex flex-col items-center justify-center text-slate-900 dark:text-slate-100"
            >
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                 <Settings className="w-8 h-8 text-slate-400 dark:text-slate-500" />
               </div>
               <h2 className="text-2xl font-bold mb-2">Module under development</h2>
               <p className="text-slate-500 dark:text-slate-400 max-w-xs text-center">We're building this feature right now. Check back in a few days!</p>
               <button onClick={() => setScreen("dashboard")} className="mt-8 px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">Return Home</button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
