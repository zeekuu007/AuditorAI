import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
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
import { generateAudit, AuditResult } from "./ai";
import { Screen, User, AuditReport } from "./types";

const INITIAL_USER: User = {
  name: "Zeerak Khan",
  email: "zeerak@auditguru.ai",
  plan: "Free",
  auditsRemaining: 1
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
        }
      ],
      quickWins: ["Add trust badges", "Shorten footer", "Fix mobile padding"],
      strategicRecommendations: ["Refocus target audience", "Simplify pricing", "Add demo video"],
      performanceMetrics: { messaging: 7, trust: 5, performance: 8, ux: 6, conversion: 5 }
    }
  },
  { 
    id: "2", 
    url: "mystore.com", 
    industry: "E-commerce", 
    score: 78, 
    date: "May 18, 2024", 
    status: "Completed",
    result: {
      score: 78,
      estimatedRevenueLoss: 1200,
      executiveAnalysis: "Great design and trust signals. Focus on mobile checkout speed to capture the remaining 22%.",
      topIssues: [
        {
          title: "Mobile Load Speed",
          impact: "Medium",
          description: "Largest Contentful Paint (LCP) is 3.2s on 4G connections.",
          fix: "Optimize images using WebP format and lazy-load non-critical assets.",
          whyItMatters: "Pages that load in <2s have 2x the conversion of slower ones.",
          potentialImpactText: "+5% Revenue"
        }
      ],
      quickWins: ["Fix broken links", "Optimize hero image"],
      strategicRecommendations: ["Run A/B test on cart button", "Add exit-intent popup"],
      performanceMetrics: { messaging: 9, trust: 8, performance: 6, ux: 8, conversion: 8 }
    }
  },
  { id: "3", url: "brand.io", industry: "Agency", score: 45, date: "May 15, 2024", status: "Completed" },
  { id: "4", url: "shop.com", industry: "Retail", score: 71, date: "May 12, 2024", status: "Locked" },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [user, setUser] = useState<User>(INITIAL_USER);
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

  const downloadPDF = (report: AuditReport | null = null) => {
    const auditData = report?.result || currentAudit;
    const auditUrl = report?.url || url;
    
    if (!auditData) return;

    const doc = new jsPDF();
    const indigo: [number, number, number] = [79, 70, 229]; // Indigo-600
    const slate: [number, number, number] = [15, 23, 42]; // Slate-950
    const white: [number, number, number] = [255, 255, 255];

    // Header
    doc.setFillColor(slate[0], slate[1], slate[2]);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("CRO AUDIT REPORT", 20, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`URL: ${auditUrl}`, 20, 32);
    doc.text(`DATE: ${report?.date || new Date().toLocaleDateString()}`, 190, 32, { align: 'right' });

    // Score Circle replacement for PDF
    doc.setDrawColor(indigo[0], indigo[1], indigo[2]);
    doc.setLineWidth(2);
    doc.circle(170, 65, 15);
    doc.setFontSize(18);
    doc.setTextColor(indigo[0], indigo[1], indigo[2]);
    doc.text(`${auditData.score}`, 170, 67, { align: 'center' });
    doc.setFontSize(8);
    doc.text("HEALTH SCORE", 170, 72, { align: 'center' });

    // Executive Analysis
    doc.setTextColor(slate[0], slate[1], slate[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("EXECUTIVE ANALYSIS", 20, 60);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const analysisLines = doc.splitTextToSize(auditData.executiveAnalysis, 130);
    doc.text(analysisLines, 20, 70);

    // Revenue Loss
    let currentY = 100;
    doc.setFillColor(254, 242, 242); // Red-50
    doc.rect(20, currentY, 170, 25, 'F');
    doc.setTextColor(220, 38, 38); // Red-600
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("ESTIMATED MONTHLY REVENUE LOSS", 105, currentY + 10, { align: 'center' });
    doc.setFontSize(16);
    doc.text(`$${auditData.estimatedRevenueLoss.toLocaleString()}`, 105, currentY + 18, { align: 'center' });

    currentY += 40;

    // Top Issues Table
    doc.setTextColor(indigo[0], indigo[1], indigo[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TOP CONVERSION ISSUES", 20, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Issue', 'Impact', 'Description']],
      body: auditData.topIssues.map(issue => [issue.title, issue.impact, issue.description]),
      theme: 'grid',
      headStyles: { fillColor: indigo, textColor: white },
      styles: { fontSize: 8, cellPadding: 5 },
      columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 20 }, 2: { cellWidth: 110 } }
    });

    const hostname = auditUrl.replace(/https?:\/\//, '').split('/')[0];
    doc.save(`Audit-${hostname}.pdf`);
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
        status: user.auditsRemaining > 0 ? "Completed" : "Locked",
        result
      };
      
      setReports(prev => [newReport, ...prev]);
      if (user.auditsRemaining > 0) {
        setUser(prev => ({ ...prev, auditsRemaining: prev.auditsRemaining - 1 }));
      }
    } catch (error) {
      console.error("Audit failed", error);
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
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20">
              <img src="https://storage.googleapis.com/bit_app_artifacts/AuditGuru/logo.png" alt="AuditGuru Logo" className="w-full h-full object-cover" />
            </div>
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
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Free Audits Left</span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{user.auditsRemaining}/2</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500" 
                style={{ width: `${(user.auditsRemaining / 2) * 100}%` }} 
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
                   <p className="text-slate-500 dark:text-slate-400">You have {user.auditsRemaining} free audit credits left.</p>
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
