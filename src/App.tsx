import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
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

  const [copySuccess, setCopySuccess] = useState(false);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setStep("scraping");

    try {
      // 1. Scrape
      const scrapeRes = await axios.post("/api/scrape", { url });
      
      const scrapedData = scrapeRes.data;
      
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
      const message = err.response?.data?.error || err.message || "An unexpected error occurred";
      setError(message);
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const downloadPDF = () => {
    if (!results) return;
    const { audit, scrapedData } = results;
    const doc = new jsPDF();
    const lime: [number, number, number] = [190, 242, 100]; // #BEF264
    const dark: [number, number, number] = [10, 10, 10]; // #0a0a0a
    const white: [number, number, number] = [255, 255, 255];

    const addBackground = () => {
      doc.setFillColor(dark[0], dark[1], dark[2]);
      doc.rect(0, 0, 210, 297, 'F');
    };

    const addHeader = (pageNumber: number) => {
      // Branding
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(white[0], white[1], white[2]);
      doc.text("DIGITAL", 20, 20);
      const digitalWidth = doc.getTextWidth("DIGITAL ");
      doc.setTextColor(lime[0], lime[1], lime[2]);
      doc.text("MATTER.", 20 + digitalWidth, 20);
      
      doc.setFont("courier", "bold");
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text("D I G I T A L L Y   Y O U R S", 20, 24);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`PAGE ${pageNumber}`, 190, 20, { align: 'right' });
    };

    const addFooter = () => {
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text("THE DIGITAL MATTER | GROWTH SYSTEMS & PERFORMANCE LAB", 105, 288, { align: 'center' });
    };

    addBackground();
    addHeader(1);

    const hostname = new URL(scrapedData.url).hostname.replace('www.', '').toUpperCase();
    
    // Page Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(lime[0], lime[1], lime[2]);
    doc.text("CRO AUDIT REPORT", 20, 45);

    doc.setFontSize(10);
    doc.setTextColor(180, 180, 180);
    doc.text(`Prepared for: WWW.${hostname}`, 20, 55);
    doc.text(`DATE Created: ${new Date().toLocaleDateString()}`, 20, 60);

    // Big Score Visual
    const avgScore = Object.values(audit.performanceMetrics).reduce((a, b) => a + b, 0) / 5;
    doc.setDrawColor(lime[0], lime[1], lime[2]);
    doc.setLineWidth(1);
    doc.circle(170, 50, 12);
    doc.setFontSize(14);
    doc.setTextColor(lime[0], lime[1], lime[2]);
    doc.text(`${(avgScore * 10).toFixed(0)}`, 170, 51.5, { align: 'center' });
    doc.setFontSize(6);
    doc.text("HEALTH SCORE", 170, 56, { align: 'center' });

    let currentY = 85;

    // 1. PERFORMANCE METRICS
    doc.setFontSize(14);
    doc.setTextColor(white[0], white[1], white[2]);
    doc.text("PERFORMANCE METRICS", 20, currentY);
    currentY += 15;

    const metrics = [
      { label: "Messaging & Clarity", value: audit.performanceMetrics.messaging },
      { label: "Trust & Social Proof", value: audit.performanceMetrics.trust },
      { label: "Performance", value: audit.performanceMetrics.performance },
      { label: "User Experience", value: audit.performanceMetrics.ux },
      { label: "Conversion Optimization", value: audit.performanceMetrics.conversion }
    ];

    metrics.forEach(m => {
      doc.setFontSize(10);
      doc.setTextColor(white[0], white[1], white[2]);
      doc.text(m.label, 20, currentY);
      
      // Bar background
      doc.setFillColor(30, 30, 30);
      doc.roundedRect(110, currentY - 4, 60, 4, 2, 2, 'F');
      
      // Bar foreground
      doc.setFillColor(lime[0], lime[1], lime[2]);
      const barWidth = (m.value / 10) * 60;
      doc.roundedRect(110, currentY - 4, barWidth, 4, 1, 1, 'F');
      
      // Score text
      doc.setTextColor(lime[0], lime[1], lime[2]);
      doc.setFont("helvetica", "bold");
      doc.text(`${m.value}/10`, 180, currentY);
      doc.setFont("helvetica", "normal");
      
      currentY += 10;
    });

    currentY += 15;

    // 2. EXECUTIVE ANALYSIS
    doc.setFontSize(14);
    doc.setTextColor(lime[0], lime[1], lime[2]);
    doc.setFont("helvetica", "bold");
    doc.text("EXECUTIVE ANALYSIS", 20, currentY);
    currentY += 10;

    doc.setFontSize(11);
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFont("helvetica", "normal");
    const analysisLines = doc.splitTextToSize(audit.executiveAnalysis, 170);
    doc.text(analysisLines, 20, currentY);
    
    // NEXT PAGE: OPPORTUNITIES
    doc.addPage();
    addBackground();
    addHeader(2);
    currentY = 40;

    // Table: OPPORTUNITY FOR GROWTH
    autoTable(doc, {
      startY: currentY,
      head: [['OPPORTUNITY FOR GROWTH', 'EXPECTED IMPACT']],
      body: audit.opportunitiesForGrowth.map(opt => [opt.opportunity, opt.impact]),
      theme: 'plain',
      styles: {
        fillColor: [10, 10, 10],
        textColor: [255, 255, 255],
        fontSize: 9,
        cellPadding: 8,
        lineColor: [30, 30, 30],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [190, 242, 100],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'bold' },
        1: { cellWidth: 115 }
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;

    // 3. QUICK WINS
    doc.setFontSize(14);
    doc.setTextColor(lime[0], lime[1], lime[2]);
    doc.setFont("helvetica", "bold");
    doc.text("QUICK WINS", 20, currentY);
    currentY += 12;

    audit.quickWins.forEach(win => {
      if (currentY > 270) {
        doc.addPage();
        addBackground();
        addHeader(3);
        currentY = 40;
      }
      doc.setFontSize(10);
      doc.setTextColor(lime[0], lime[1], lime[2]);
      doc.text("•", 20, currentY);
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(win, 160);
      doc.text(lines, 26, currentY);
      currentY += (lines.length * 6) + 4;
    });

    currentY += 10;

    // 4. STRATEGIC RECOMMENDATIONS
    if (currentY > 230) {
      doc.addPage();
      addBackground();
      addHeader(doc.getNumberOfPages());
      currentY = 40;
    }

    doc.setFontSize(14);
    doc.setTextColor(lime[0], lime[1], lime[2]);
    doc.setFont("helvetica", "bold");
    doc.text("STRATEGIC RECOMMENDATIONS", 20, currentY);
    currentY += 12;

    audit.strategicRecommendations.forEach(rec => {
      if (currentY > 270) {
        doc.addPage();
        addBackground();
        addHeader(doc.getNumberOfPages());
        currentY = 40;
      }
      doc.setFontSize(10);
      doc.setTextColor(lime[0], lime[1], lime[2]);
      doc.text("•", 20, currentY);
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(rec, 160);
      doc.text(lines, 26, currentY);
      currentY += (lines.length * 6) + 4;
    });

    addFooter();
    doc.save(`Audit-${hostname}.pdf`);
  };

  const avgScore = results ? Object.values(results.audit.performanceMetrics).reduce((a, b) => a + b, 0) / 5 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden selection:bg-lime-500/30 selection:text-white pb-20">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-lime-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-slate-950/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-black border border-lime-500/50 flex items-center justify-center rounded-xl shadow-lg shadow-lime-500/10 group-hover:border-lime-500 transition-all transition-transform">
              <span className="text-lime-500 font-black font-mono text-lg">D</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight leading-none">DIGITAL<span className="text-lime-400">MATTER.</span></span>
              <span className="text-[7px] font-bold text-slate-500 tracking-[0.4em] mt-1 uppercase">Digitally Yours</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <a href="#" className="hover:text-lime-400 transition-colors">Audit Engine</a>
            <a href="#" className="hover:text-lime-400 transition-colors">Strategy Lab</a>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-lime-500/30 transition-colors cursor-pointer flex items-center justify-center">
               <Loader2 className="w-4 h-4 text-slate-600" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto mb-16 text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-8"
          >
            <div>
              <h1 className="text-5xl font-black tracking-tighter mb-4 uppercase text-white">CRO Audit Engine</h1>
              <p className="text-slate-400 text-xl max-w-xl leading-relaxed font-light">
                Secure your revenue. We scan high-growth architectures to identify conversion leaks and systemic scale blockers.
              </p>
            </div>
            <div className="hidden md:block text-[9px] font-mono text-lime-400 bg-lime-400/5 px-5 py-2 rounded-full border border-lime-400/20 uppercase tracking-[0.2em] font-bold">
              Production Build v5.8.2
            </div>
          </motion.div>

          <motion.form 
            onSubmit={handleAudit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 p-3 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl"
          >
            <div className="relative flex-1">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center text-slate-500 gap-2 pr-4 border-r border-white/10">
                <Globe className="w-6 h-6" />
              </div>
              <input
                type="text"
                placeholder="enter-business-url.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-24 pr-8 py-6 rounded-3xl border-none focus:ring-0 bg-transparent text-slate-100 placeholder:text-slate-700 transition-all outline-none text-xl font-light"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url}
              className="bg-lime-400 text-black px-14 py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:bg-lime-300 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_-5px_rgba(190,242,100,0.4)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{step.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  RUN AUDIT
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.form>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-5 bg-red-400/5 border border-red-400/20 text-red-200 rounded-2xl text-sm flex items-center gap-4"
            >
              <AlertTriangle className="w-5 h-5 text-red-400" />
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
              className="space-y-12"
            >
              <div className="grid grid-cols-1 gap-12">
                {/* Main Report Card */}
                <div className="bg-white/5 rounded-[4rem] p-12 border border-white/10 backdrop-blur-2xl relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-lime-400/5 border border-lime-400/20 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-lime-400/50 transition-colors">
                        <span className="text-3xl font-black text-lime-400">{(avgScore * 10).toFixed(0)}</span>
                        <span className="text-[7px] font-black uppercase tracking-widest text-slate-500 mt-1">Health Score</span>
                      </div>
                      <div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Audit Blueprint</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">Growth Intelligence Output</p>
                      </div>
                    </div>
                    <button 
                      onClick={downloadPDF}
                      className="bg-white text-black px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-200 transition-all flex items-center gap-3 shadow-2xl"
                    >
                      <Download className="w-5 h-5" />
                      EXPORT PDF
                    </button>
                  </div>

                  <div className="space-y-16">
                    {/* Metrics & Analysis Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                      <div className="lg:col-span-5 space-y-10 group/metrics">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-8 border-b border-white/5 pb-4">Performance Baseline</h3>
                        {[
                          { label: "Messaging Intelligence", val: results.audit.performanceMetrics.messaging },
                          { label: "Trust Architecture", val: results.audit.performanceMetrics.trust },
                          { label: "System Performance", val: results.audit.performanceMetrics.performance },
                          { label: "UX Flow Dynamics", val: results.audit.performanceMetrics.ux },
                          { label: "Conversion Loops", val: results.audit.performanceMetrics.conversion }
                        ].map((m, i) => (
                          <div key={i} className="space-y-3">
                             <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                               <span className="text-slate-500 group-hover/metrics:text-slate-300 transition-colors">{m.label}</span>
                               <span className="text-lime-400">{m.val}/10</span>
                             </div>
                             <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${m.val * 10}%` }}
                                 transition={{ delay: i * 0.1, duration: 1 }}
                                 className="h-full bg-lime-400 rounded-full"
                               />
                             </div>
                          </div>
                        ))}
                      </div>
                      <div className="lg:col-span-7 flex flex-col justify-center">
                        <div className="p-10 bg-lime-400/[0.02] border border-lime-400/10 rounded-[3rem] relative">
                          <AlertTriangle className="absolute -top-4 -left-4 w-12 h-12 text-lime-400/10" />
                          <h3 className="text-xl font-black uppercase tracking-tight text-lime-400 mb-6">Executive Diagnostic</h3>
                          <p className="text-slate-300 leading-relaxed font-light text-lg italic opacity-80">
                            "{results.audit.executiveAnalysis}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Table Grid */}
                    <div className="space-y-8">
                       <div className="flex items-center justify-between">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Revenue Leverage Points</h3>
                         <span className="text-[8px] font-mono text-slate-500 bg-white/5 px-4 py-1 rounded-full uppercase tracking-widest border border-white/5">Strategic Observation Hub</span>
                       </div>
                       <div className="overflow-hidden bg-black/40 rounded-[3rem] border border-white/10">
                         <div className="grid grid-cols-1 md:grid-cols-12 bg-lime-400 text-black px-10 py-6 font-black uppercase text-[11px] tracking-[0.3em]">
                           <div className="md:col-span-4">Growth Opportunity</div>
                           <div className="md:col-span-8 border-l border-black/10 pl-8">Strategic Impact Index</div>
                         </div>
                         {results.audit.opportunitiesForGrowth.map((opt, i) => (
                           <div key={i} className="grid grid-cols-1 md:grid-cols-12 p-10 border-t border-white/5 hover:bg-white/5 transition-colors group/row">
                              <div className="md:col-span-4 font-black text-lg text-white mb-4 md:mb-0 pr-8 group-hover/row:text-lime-400 transition-colors uppercase leading-tight">{opt.opportunity}</div>
                              <div className="md:col-span-8 text-slate-400 leading-relaxed font-light md:pl-8 md:border-l md:border-white/5 text-sm">{opt.impact}</div>
                           </div>
                         ))}
                       </div>
                    </div>

                    {/* Tactical & Strategic Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                       <div className="bg-black/40 p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden group/win">
                         <Zap className="absolute -right-4 -top-4 w-32 h-32 text-lime-400 opacity-5 group-hover/win:opacity-10 transition-opacity" />
                         <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-10 flex items-center gap-4">
                           <div className="p-3 bg-lime-400/10 rounded-xl"><Zap className="w-5 h-5 text-lime-400" /></div> Quick Wins
                         </h3>
                         <ul className="space-y-6">
                           {results.audit.quickWins.map((win, i) => (
                             <li key={i} className="flex gap-5 text-sm text-slate-400 leading-relaxed font-light">
                               <span className="text-lime-400 font-black mt-1">0{i+1}</span>
                               {win}
                             </li>
                           ))}
                         </ul>
                       </div>
                       <div className="bg-black/40 p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden group/strat">
                         <Target className="absolute -right-4 -top-4 w-32 h-32 text-indigo-400 opacity-5 group-hover/strat:opacity-10 transition-opacity" />
                         <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-10 flex items-center gap-4">
                           <div className="p-3 bg-indigo-400/10 rounded-xl"><Target className="w-5 h-5 text-indigo-400" /></div> Strategic Shifts
                         </h3>
                         <ul className="space-y-6">
                           {results.audit.strategicRecommendations.map((rec, i) => (
                             <li key={i} className="flex gap-5 text-sm text-slate-400 leading-relaxed font-light">
                               <span className="text-indigo-400 font-black mt-1">0{i+1}</span>
                               {rec}
                             </li>
                           ))}
                         </ul>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Outreach Engine */}
                <div className="bg-white/5 border border-white/10 rounded-[4rem] p-16 relative overflow-hidden group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
                    <div className="flex items-center gap-6">
                      <div className="p-5 bg-indigo-400/10 rounded-3xl border border-indigo-400/20">
                        <Mail className="text-indigo-400 w-10 h-10" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Partner Outreach</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">High-Authority Narrative Generator</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(results.email.body)}
                      className={`px-12 py-6 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl ${copySuccess ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-slate-200'}`}
                    >
                      {copySuccess ? 'Copied Narrative' : 'COPY COMPLETE DATA'}
                    </button>
                  </div>
                  <div className="bg-black/60 p-12 rounded-[3.5rem] border border-white/5 shadow-inner">
                    <div className="mb-10 pb-10 border-b border-white/10">
                      <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600 block mb-4">Subject Vector</span>
                      <p className="text-2xl font-black text-slate-100 italic tracking-tighter leading-tight">"{results.email.subjectLines[0]}"</p>
                    </div>
                    <div className="relative">
                      <pre className="text-slate-400 whitespace-pre-wrap font-sans text-md leading-relaxed font-light font-serif">
                        {results.email.body}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty State / Capabilities */}
          {!results && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
            >
              {[
                { 
                  icon: BarChart3, 
                  title: "Diagnostic Analysis", 
                  desc: "We scan value architecture, trust infrastructure, and every revenue leakage point." 
                },
                { 
                  icon: Zap, 
                  title: "Automation Design", 
                  desc: "Identify manual growth blockers and design AI-driven scaling frameworks." 
                },
                { 
                  icon: Mail, 
                  title: "Partner Outreach", 
                  desc: "Draft technical, value-driven emails that position you as a high-level expert." 
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 hover:border-lime-500/20 transition-all group backdrop-blur-sm text-left">
                  <div className="w-14 h-14 bg-black border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:border-lime-500/50 transition-all duration-500">
                    <feature.icon className="text-lime-400 w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-light">{feature.desc}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Enterprise Status Footer */}
      <footer className="h-10 px-8 flex items-center justify-between bg-slate-900 border-t border-white/5 text-[9px] text-slate-500 uppercase tracking-[0.3em] font-bold fixed bottom-0 left-0 right-0 z-50">
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-lime-500 shadow-[0_0_8px_#bef264]"></div> Growth System Active</span>
          <span className="opacity-40">Version 5.5 Stable</span>
        </div>
        <div className="hidden sm:block">Digital Matter © 2026 Systems & Performance Lab</div>
      </footer>
    </div>
  );
}
