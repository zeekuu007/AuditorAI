import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Globe, 
  Search, 
  AlertTriangle, 
  Zap, 
  Target, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  Copy,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Loader2,
  Download,
  FileText
} from "lucide-react";
import { generateAudit, generateColdEmail, AuditResult, EmailResult } from "./ai";

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "scraping" | "auditing" | "emailing" | "done">("idle");
  const [results, setResults] = useState<{
    scrapedData: any;
    audit: AuditResult;
    email: EmailResult;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setStep("scraping");

    try {
      // 1. Scrape
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      
      if (!scrapeRes.ok) {
        const errorData = await scrapeRes.json();
        throw new Error(errorData.error || "Failed to scrape website");
      }
      
      const scrapedData = await scrapeRes.json();
      
      // 2. Audit
      setStep("auditing");
      const audit = await generateAudit(scrapedData);
      
      // 3. Email
      setStep("emailing");
      const email = await generateColdEmail(audit, scrapedData);
      
      setResults({ scrapedData, audit, email });
      setStep("done");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadPDF = () => {
    if (!results) return;
    const { audit, scrapedData } = results;
    const doc = new jsPDF();
    const lime: [number, number, number] = [190, 242, 100]; // #BEF264
    const dark: [number, number, number] = [10, 10, 10]; // #0a0a0a

    // Background
    doc.setFillColor(dark[0], dark[1], dark[2]);
    doc.rect(0, 0, 210, 297, 'F');

    // Header & Logo (Wordmark Recreation - Reduced Size)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    
    // "DIGITAL" in White
    doc.setTextColor(255, 255, 255);
    doc.text("DIGITAL", 20, 25);
    
    // "MATTER." in Lime
    const digitalWidth = doc.getTextWidth("DIGITAL ");
    doc.setTextColor(lime[0], lime[1], lime[2]);
    doc.text("MATTER.", 20 + digitalWidth, 25);
    
    // "DIGITALLY YOURS" Subtext - Aligned Left
    doc.setFont("courier", "bold");
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text("D I G I T A L L Y   Y O U R S", 20, 29);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(lime[0], lime[1], lime[2]);
    doc.text("STRATEGIC GROWTH AUDIT", 20, 50);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Prepared for: ${new URL(scrapedData.url).hostname.toUpperCase()}`, 20, 60);
    doc.text(`DATE Created: ${new Date().toLocaleDateString()}`, 20, 65);

    // Score Metrics
    let currentY = 85;
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("GROWTH ECOSYSTEM DIAGNOSTICS", 20, currentY);
    
    currentY += 15;
    const scores = [
      { label: "Value Architecture", score: audit.categoryScores.messaging },
      { label: "Trust Infrastructure", score: audit.categoryScores.trust },
      { label: "Technical Environment", score: audit.categoryScores.performance },
      { label: "Architecture & UX", score: audit.categoryScores.ux },
      { label: "Conversion Optimization", score: audit.categoryScores.cta }
    ];

    scores.forEach((s) => {
      doc.setFontSize(10);
      doc.setTextColor(180, 180, 180);
      doc.text(s.label, 20, currentY);
      
      doc.setFillColor(30, 30, 30);
      doc.rect(120, currentY - 4, 60, 4, 'F');
      doc.setFillColor(lime[0], lime[1], lime[2]);
      doc.rect(120, currentY - 4, (s.score / 10) * 60, 4, 'F');
      
      doc.setTextColor(lime[0], lime[1], lime[2]);
      doc.text(`${s.score}/10`, 185, currentY);
      currentY += 10;
    });

    // Executive Analysis
    currentY += 15;
    doc.setFontSize(14);
    doc.setTextColor(lime[0], lime[1], lime[2]);
    doc.text("EXECUTIVE ANALYSIS", 20, currentY);
    
    currentY += 10;
    doc.setFontSize(10);
    doc.setTextColor(220, 220, 220);
    const summaryLines = doc.splitTextToSize(audit.executiveSummary, 170);
    summaryLines.forEach((line: string, index: number) => {
      if (currentY > 275) {
        doc.addPage();
        doc.setFillColor(dark[0], dark[1], dark[2]);
        doc.rect(0, 0, 210, 297, 'F');
        currentY = 30;
      }
      const isLastLine = index === summaryLines.length - 1;
      doc.text(line, 20, currentY, isLastLine ? {} : { align: 'justify', maxWidth: 170 });
      currentY += 6;
    });

    // Prioritized Issues Table
    currentY += 10;
    if (currentY > 200) {
      doc.addPage();
      doc.setFillColor(dark[0], dark[1], dark[2]);
      doc.rect(0, 0, 210, 297, 'F');
      currentY = 30;
    }

    autoTable(doc, {
      startY: currentY,
      head: [['OPPORTUNITY FOR GROWTH', 'EXPECTED IMPACT']],
      body: audit.prioritizedIssues.map(i => [i.issue, i.impact]),
      theme: 'plain',
      headStyles: { fillColor: lime, textColor: dark, fontStyle: 'bold' },
      bodyStyles: { textColor: [255, 255, 255], fillColor: [15, 15, 15] },
      alternateRowStyles: { fillColor: [25, 25, 25] },
      margin: { left: 20, right: 20 },
      didDrawPage: (data) => {
        currentY = data.cursor?.y || 20;
      }
    });

    currentY += 20;
    if (currentY > 250) {
      doc.addPage();
      doc.setFillColor(dark[0], dark[1], dark[2]);
      doc.rect(0, 0, 210, 297, 'F');
      currentY = 30;
    }

    // Quick Wins Section
    doc.setFontSize(14);
    doc.setTextColor(lime[0], lime[1], lime[2]);
    doc.text("QUICK WINS", 20, currentY);
    currentY += 10;
    
    audit.quickWins.forEach((win) => {
      const bullet = "• ";
      const lines = doc.splitTextToSize(win, 164); // Reduced width to account for bullet
      
      lines.forEach((line: string, index: number) => {
        if (currentY > 275) {
          doc.addPage();
          doc.setFillColor(dark[0], dark[1], dark[2]);
          doc.rect(0, 0, 210, 297, 'F');
          currentY = 30;
        }
        
        doc.setFontSize(10);
        doc.setTextColor(190, 190, 190);
        
        if (index === 0) {
          doc.setTextColor(lime[0], lime[1], lime[2]);
          doc.text(bullet, 20, currentY);
          doc.setTextColor(190, 190, 190);
        }
        
        const isLastLine = index === lines.length - 1;
        doc.text(line, 26, currentY, isLastLine ? {} : { align: 'justify', maxWidth: 164 });
        currentY += 6;
      });
      currentY += 2;
    });

    currentY += 10;
    if (currentY > 250) {
      doc.addPage();
      doc.setFillColor(dark[0], dark[1], dark[2]);
      doc.rect(0, 0, 210, 297, 'F');
      currentY = 30;
    }

    // Strategic Recommendations
    doc.setFontSize(14);
    doc.setTextColor(lime[0], lime[1], lime[2]);
    doc.text("STRATEGIC RECOMMENDATIONS", 20, currentY);
    currentY += 10;
    
    audit.strategicImprovements.forEach((imp) => {
      const bullet = "• ";
      const lines = doc.splitTextToSize(imp, 164);
      
      lines.forEach((line: string, index: number) => {
        if (currentY > 275) {
          doc.addPage();
          doc.setFillColor(dark[0], dark[1], dark[2]);
          doc.rect(0, 0, 210, 297, 'F');
          currentY = 30;
        }

        doc.setFontSize(10);
        doc.setTextColor(190, 190, 190);

        if (index === 0) {
          doc.setTextColor(lime[0], lime[1], lime[2]);
          doc.text(bullet, 20, currentY);
          doc.setTextColor(190, 190, 190);
        }

        const isLastLine = index === lines.length - 1;
        doc.text(line, 26, currentY, isLastLine ? {} : { align: 'justify', maxWidth: 164 });
        currentY += 6;
      });
      currentY += 2;
    });

    // Branding Footer on last page
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text("THE DIGITAL MATTER | GROWTH SYSTEMS & PERFORMANCE LAB", 105, 288, { align: 'center' });

    doc.save(`Audit-Report-${new URL(scrapedData.url).hostname}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden selection:bg-blue-500/30 selection:text-white">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-slate-950/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-400 rounded-lg shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Zap className="text-white w-5 h-5 m-1.5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Auditor<span className="text-blue-400">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-blue-400 transition-colors">Dashboard</a>
            <a href="#" className="hover:text-blue-400 transition-colors">History</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Settings</a>
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto mb-12 text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-6"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">New Audit Analysis</h1>
              <p className="text-slate-400 text-base max-w-xl leading-relaxed">
                Enter a website URL to generate a comprehensive CRO audit and conversion-optimized outreach strategy.
              </p>
            </div>
            <div className="hidden md:block text-xs font-mono text-blue-400 bg-blue-400/5 px-4 py-1.5 rounded-full border border-blue-400/15">
              AI CLOUD INSTANCE ACTIVE v4.2
            </div>
          </motion.div>

          <motion.form 
            onSubmit={handleAudit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-2xl"
          >
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center text-slate-500 gap-1 pr-2 border-r border-white/5">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium">https://</span>
              </div>
              <input
                type="text"
                placeholder="domain.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-24 pr-4 py-4 rounded-xl border-none focus:ring-0 bg-transparent text-slate-100 placeholder:text-slate-600 transition-all outline-none"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url}
              className="bg-blue-500 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-600 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {step === "scraping" && "Scraping..."}
                  {step === "auditing" && "Auditing..."}
                  {step === "emailing" && "Drafting..."}
                </>
              ) : (
                <>
                  Start Audit
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.form>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-400/5 border border-red-400/15 text-red-300 rounded-xl text-sm flex items-center gap-3"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              {error}
            </motion.div>
          )}
        </div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Audit Data */}
              <div className="lg:col-span-7 space-y-6">
                {/* Audit Header */}
                <div className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 text-right">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1 block">Risk Score</span>
                    <div className={`text-4xl font-black tracking-tighter ${
                      results.audit.conversionRiskScore > 7 ? "text-red-400" : 
                      results.audit.conversionRiskScore > 4 ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {results.audit.conversionRiskScore}
                      <span className="text-lg opacity-30">/10</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <BarChart3 className="text-blue-400 w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold">Strategic Growth Analysis</h2>
                  </div>

                  {/* Category Scores Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {[
                      { label: "Messaging", score: results.audit.categoryScores.messaging },
                      { label: "Trust", score: results.audit.categoryScores.trust },
                      { label: "Technical", score: results.audit.categoryScores.performance },
                      { label: "UX/Arch", score: results.audit.categoryScores.ux },
                      { label: "Revenue", score: results.audit.categoryScores.cta },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
                        <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">{s.label}</div>
                        <div className={`text-lg font-bold ${s.score > 7 ? 'text-emerald-400' : s.score > 4 ? 'text-amber-400' : 'text-red-400'}`}>
                          {s.score}/10
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/5 mb-6">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-3 text-left">Executive Summary</span>
                    <p className="text-slate-300 leading-relaxed text-base font-light italic text-left">
                      "{results.audit.executiveSummary}"
                    </p>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/5 text-left">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Contextual Justification</span>
                    <p className="text-xs text-slate-500 leading-relaxed">{results.audit.riskJustification}</p>
                  </div>
                </div>

                {/* Priority Issues */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.audit.prioritizedIssues.map((issue, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-sm backdrop-blur-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-400/10 flex-shrink-0 flex items-center justify-center">
                          <TrendingDown className="text-red-400 w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-slate-200 mb-2">{issue.issue}</h3>
                          <p className="text-xs text-slate-500 mb-3 leading-relaxed">{issue.impact}</p>
                          <span className="text-[9px] uppercase font-bold tracking-widest bg-red-400/10 text-red-400 border border-red-400/20 px-2 py-1 rounded">High Impact</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Wins & More */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="bg-blue-400/5 rounded-2xl p-6 border border-blue-400/15 backdrop-blur-sm">
                    <h4 className="font-bold text-blue-400 mb-4 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                      <Zap className="w-3.5 h-3.5" /> Quick Wins
                    </h4>
                    <ul className="space-y-3">
                      {results.audit.quickWins.map((win, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-2 leading-relaxed">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-400" />
                          {win}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-emerald-400/5 rounded-2xl p-6 border border-emerald-400/15 backdrop-blur-sm">
                    <h4 className="font-bold text-emerald-400 mb-4 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                      <Target className="w-3.5 h-3.5" /> Opportunities
                    </h4>
                    <ul className="space-y-3">
                      {results.audit.missingOpportunities.map((op, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-2 leading-relaxed">
                          <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-emerald-400" />
                          {op}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-900 rounded-2xl p-6 text-white border border-white/5 shadow-xl backdrop-blur-md">
                    <h4 className="font-bold mb-4 flex items-center gap-2 text-indigo-400 uppercase text-[10px] tracking-widest">
                      <TrendingDown className="w-3.5 h-3.5 rotate-180" /> Strategic
                    </h4>
                    <ul className="space-y-3">
                      {results.audit.strategicImprovements.map((imp, idx) => (
                        <li key={idx} className="text-[10px] text-slate-400 flex items-start gap-2 leading-relaxed">
                          <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-white opacity-50" />
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Middle Action Bar: Centered Download Button */}
              <div className="lg:col-span-12 flex justify-center py-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadPDF}
                  className="flex items-center gap-4 bg-[#BEF264] text-black px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#BEF264]/20 group transition-all"
                >
                  <div className="w-8 h-8 bg-black/10 rounded-lg flex items-center justify-center group-hover:bg-black/20">
                    <Download className="w-4 h-4" />
                  </div>
                  Get Branded AUDIT Report (PDF)
                </motion.button>
              </div>

              {/* Right Column: Cold Email */}
              <div className="lg:col-span-12 xl:col-span-8 xl:mx-auto w-full flex flex-col gap-6">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-white backdrop-blur-md flex flex-col flex-1 group text-left relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-500/20">
                        <Mail className="w-4 h-4 text-indigo-400" />
                      </div>
                      <h2 className="text-xl font-bold tracking-tight">Personalized Outreach</h2>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(results.email.body)}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors border border-white/5"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-6 flex-1 flex flex-col">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-3">Subject Line Options</span>
                      <div className="space-y-2">
                        {results.email.subjectLines.map((subject, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => {
                              copyToClipboard(subject);
                              window.alert("Subject copied!");
                            }}
                            className={`text-[11px] p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group/subject ${idx === 0 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'}`}
                          >
                            <span className="truncate pr-4">{subject}</span>
                            <Copy className="w-3.5 h-3.5 opacity-0 group-hover/subject:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 flex-1 flex flex-col">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 block mb-4">Email Body</span>
                      <div className="flex-1 text-sm font-serif italic text-slate-300 leading-relaxed overflow-y-auto whitespace-pre-wrap pr-2 custom-scrollbar">
                        {results.email.body}
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button 
                        onClick={() => {
                          copyToClipboard(results.email.body);
                          window.alert("Email body copied!");
                        }}
                        className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white/5"
                      >
                         Copy Full Email
                      </button>
                      <button className="px-5 bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                         <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Statistics Bar */}
                <div className="h-14 px-6 flex items-center justify-between bg-slate-900/50 border border-white/5 rounded-2xl text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Connected</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div> Active</span>
                  </div>
                  <div>ID #{Math.floor(Math.random() * 10000)}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty State / Features */}
          {!results && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
            >
              {[
                { 
                  icon: Globe, 
                  title: "Semantic Analysis", 
                  desc: "We extract structure, intent-based CTAs, and semantic hierarchy for behavioral analysis." 
                },
                { 
                  icon: BarChart3, 
                  title: "Revenue Logic", 
                  desc: "Identify conversion friction points that directly impact your bottom line and user trust." 
                },
                { 
                  icon: Mail, 
                  title: "Hyper-Outreach", 
                  desc: "Draft highly researched emails that offer genuine value rather than generic sales pitches." 
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group backdrop-blur-sm text-left">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:bg-blue-500 transition-all duration-500">
                    <feature.icon className="text-blue-400 w-6 h-6 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-light">{feature.desc}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Status Bar / Footer */}
      <footer className="h-10 px-8 flex items-center justify-between bg-slate-900/80 border-t border-white/10 text-[10px] text-slate-400 uppercase tracking-widest fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Scraper: Connected</span>
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Engine: v4.2 Stable</span>
        </div>
        <div className="hidden sm:block">© 2026 AuditorAI Systems • Enterprise Grade</div>
      </footer>
    </div>
  );
}
