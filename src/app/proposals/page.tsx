'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Send, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  TrendingUp,
  Package,
  ArrowLeft,
  ChevronDown,
  X,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RecommendedService {
  title: string;
  description: string;
}

interface PricingTier {
  tier: string;
  price: string;
  features: string[];
}

interface ProposalData {
  businessAnalysis: string;
  whatTheyAreMissing: string[];
  recommendedServices: RecommendedService[];
  pricingTiers: PricingTier[];
  roiProjections: string;
}

interface Business {
  id: string;
  name: string;
  niche: string;
  city: string;
  rating: number;
  reviewCount: number;
  website: string | null;
  missing: string[];
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface LLMOption {
  id: string;
  name: string;
  available: boolean;
}

export default function ProposalsPage() {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [llms, setLlms] = useState<LLMOption[]>([]);
  const [selectedLlm, setSelectedLlm] = useState('deepseek');
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendEmail, setSendEmail] = useState('');
  const [sendSubject, setSendSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');
  const proposalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch available LLMs
    axios.get('/api/llms')
      .then(res => {
        setLlms(res.data.llms || []);
        const firstAvailable = (res.data.llms || []).find((l: LLMOption) => l.available);
        if (firstAvailable) setSelectedLlm(firstAvailable.id);
      })
      .catch(() => {});

    // Fetch business from DB instead of localStorage
    const businessId = new URLSearchParams(window.location.search).get('businessId');
    if (businessId) {
      axios.get(`/api/prospects/${businessId}`)
        .then(res => {
          const p = res.data.prospect;
          if (p) {
            let missingArr: string[] = [];
            if (p.missing) {
              try { missingArr = JSON.parse(p.missing); } catch { missingArr = []; }
            }
            setSelectedBusiness({
              id: p.id,
              name: p.name,
              niche: p.niche || '',
              city: p.city || '',
              rating: p.rating || 0,
              reviewCount: p.reviewCount || 0,
              website: p.website,
              missing: missingArr,
              email: p.email,
              phone: p.phone,
              address: p.address,
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoadingBusiness(false));
    } else {
      setLoadingBusiness(false);
    }
  }, []);

  const generateProposal = async () => {
    if (!selectedBusiness) return;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await axios.post('/api/generate-proposal', { 
        business: selectedBusiness,
        llm: selectedLlm,
      });
      setProposal(res.data.proposal);
    } catch (err) {
      setError('Failed to generate proposal. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!proposal || !selectedBusiness) return;
    
    // Build a clean HTML document for printing as PDF
    const pricingHTML = (proposal.pricingTiers || []).map(tier => `
      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-weight:bold;text-transform:uppercase;font-size:12px;color:#6b7280;">${tier.tier}</span>
          <span style="font-weight:bold;font-size:18px;color:#7c3aed;">${tier.price}</span>
        </div>
        <ul style="list-style:none;padding:0;margin:0;">
          ${tier.features.map(f => `<li style="font-size:13px;color:#4b5563;padding:4px 0;">✓ ${f}</li>`).join('')}
        </ul>
      </div>
    `).join('');

    const gapsHTML = (proposal.whatTheyAreMissing || []).map(gap => 
      `<li style="font-size:14px;color:#4b5563;padding:4px 0;">⚠ ${gap}</li>`
    ).join('');

    const servicesHTML = (proposal.recommendedServices || []).map(s => `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:8px;">
        <h4 style="font-weight:bold;font-size:16px;margin:0 0 4px 0;">${s.title}</h4>
        <p style="font-size:13px;color:#6b7280;margin:0;">${s.description}</p>
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Proposal - ${selectedBusiness.name}</title>
        <style>
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1f2937; }
          .header { border-bottom: 3px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { font-size: 32px; color: #7c3aed; margin: 0 0 8px 0; }
          .header p { color: #6b7280; margin: 2px 0; font-size: 14px; }
          .section { margin-bottom: 30px; }
          .section h3 { font-size: 20px; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px; }
          .analysis { font-size: 15px; line-height: 1.7; color: #374151; }
          .roi-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; font-size: 15px; line-height: 1.6; color: #166534; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Service Proposal</h1>
          <p><strong>Prepared for:</strong> ${selectedBusiness.name}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Reference:</strong> PROP-${selectedBusiness.id.slice(0, 8)}</p>
          ${selectedBusiness.address ? `<p><strong>Location:</strong> ${selectedBusiness.address}</p>` : ''}
        </div>

        <div class="section">
          <h3>📊 Business Analysis</h3>
          <p class="analysis">${proposal.businessAnalysis || ''}</p>
        </div>

        ${gapsHTML ? `
        <div class="section">
          <h3>⚠️ Identified Gaps</h3>
          <ul style="list-style:none;padding:0;">${gapsHTML}</ul>
        </div>
        ` : ''}

        ${servicesHTML ? `
        <div class="section">
          <h3>✅ Recommended Solutions</h3>
          ${servicesHTML}
        </div>
        ` : ''}

        ${pricingHTML ? `
        <div class="section">
          <h3>💰 Pricing Plans</h3>
          ${pricingHTML}
        </div>
        ` : ''}

        ${proposal.roiProjections ? `
        <div class="section">
          <h3>📈 Expected ROI</h3>
          <div class="roi-box">${proposal.roiProjections}</div>
        </div>
        ` : ''}

        <div class="footer">
          <p>Generated by AI Workers | contact@aiworkers.vip</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window and trigger print (Save as PDF)
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const openSendModal = () => {
    if (selectedBusiness) {
      setSendEmail(selectedBusiness.email || '');
      setSendSubject(`Service Proposal for ${selectedBusiness.name}`);
      setSendSuccess(false);
      setSendError('');
      setShowSendModal(true);
    }
  };

  const handleSendProposal = async () => {
    if (!sendEmail || !proposal || !selectedBusiness) return;
    setIsSending(true);
    setSendError('');
    setSendSuccess(false);
    try {
      // Build proposal content as formatted text for email
      const pricingText = (proposal.pricingTiers || []).map(t => 
        `${t.tier}: ${t.price}\n${t.features.map(f => `  • ${f}`).join('\n')}`
      ).join('\n\n');

      const content = [
        proposal.businessAnalysis || '',
        '',
        proposal.whatTheyAreMissing?.length ? `IDENTIFIED GAPS:\n${proposal.whatTheyAreMissing.map(g => `• ${g}`).join('\n')}` : '',
        '',
        proposal.recommendedServices?.length ? `RECOMMENDED SOLUTIONS:\n${proposal.recommendedServices.map(s => `${s.title}: ${s.description}`).join('\n\n')}` : '',
        '',
        pricingText ? `PRICING PLANS:\n${pricingText}` : '',
        '',
        proposal.roiProjections ? `EXPECTED ROI:\n${proposal.roiProjections}` : '',
      ].filter(Boolean).join('\n');

      await axios.post('/api/send-email', {
        email: sendEmail,
        subject: sendSubject,
        content,
        businessName: selectedBusiness.name,
      });
      setSendSuccess(true);
    } catch (err) {
      setSendError('Failed to send email. Please check your email settings.');
    } finally {
      setIsSending(false);
    }
  };

  const selectedLlmName = llms.find(l => l.id === selectedLlm)?.name || selectedLlm;

  if (loadingBusiness) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (!selectedBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800">
          <FileText size={48} className="text-zinc-600" />
        </div>
        <h2 className="text-2xl font-bold">No business selected</h2>
        <p className="text-zinc-400">Select a business from the dashboard to generate a proposal.</p>
        <Link href="/dashboard" className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/prospect/${selectedBusiness.id}`} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Proposal Generator</h1>
            <p className="text-zinc-400">Create a tailored sales pitch for {selectedBusiness.name}</p>
          </div>
        </div>
        {!proposal && !isGenerating && (
          <div className="flex items-center gap-3">
            {/* LLM Dropdown */}
            <div className="relative">
              <select
                value={selectedLlm}
                onChange={(e) => setSelectedLlm(e.target.value)}
                className="appearance-none bg-zinc-900 border border-zinc-700 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                {llms.map((llm) => (
                  <option key={llm.id} value={llm.id} disabled={!llm.available}>
                    {llm.name} {!llm.available ? '(unavailable)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 text-zinc-500 pointer-events-none" />
            </div>
            <button
              onClick={generateProposal}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <Zap className="fill-white" size={18} />
              Generate with AI
            </button>
          </div>
        )}
      </div>

      {isGenerating && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-20 flex flex-col items-center justify-center space-y-6">
          <Loader2 className="animate-spin text-purple-500" size={48} />
          <div className="text-center">
            <h3 className="text-xl font-bold">{selectedLlmName} is working...</h3>
            <p className="text-zinc-400">Analyzing business data and crafting the perfect proposal.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {proposal && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Proposal Content */}
            <div ref={proposalRef} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-8 shadow-2xl">
              <div className="flex justify-between items-start border-b border-zinc-800 pb-8">
                <div>
                  <h2 className="text-4xl font-bold mb-2">Service Proposal</h2>
                  <p className="text-zinc-400">Prepared for <span className="text-white font-medium">{selectedBusiness.name}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-500">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-sm text-zinc-500">Ref: PROP-{selectedBusiness.id.slice(0, 8)}</p>
                  <p className="text-sm text-purple-400">Generated by {selectedLlmName}</p>
                </div>
              </div>

              <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Building2 size={20} className="text-purple-500" />
                  Business Analysis
                </h3>
                <p className="text-zinc-300 leading-relaxed">{proposal.businessAnalysis}</p>
              </section>

              {proposal.whatTheyAreMissing && proposal.whatTheyAreMissing.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-red-400">
                    <AlertCircle size={20} />
                    Identified Gaps
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {proposal.whatTheyAreMissing.map((gap, i) => (
                      <div key={i} className="flex items-start gap-2 text-zinc-400 bg-black/30 p-3 rounded-xl border border-zinc-800/50">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                        {gap}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {proposal.recommendedServices && proposal.recommendedServices.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-blue-400">
                    <CheckCircle2 size={20} />
                    Recommended Solutions
                  </h3>
                  <div className="space-y-4">
                    {proposal.recommendedServices.map((service, i) => (
                      <div key={i} className="p-4 bg-zinc-800/30 rounded-2xl border border-zinc-700/30">
                        <h4 className="font-bold text-lg mb-1">{service.title}</h4>
                        <p className="text-zinc-400 text-sm">{service.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {proposal.roiProjections && (
                <section className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-green-400">
                    <TrendingUp size={20} />
                    Expected ROI
                  </h3>
                  <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-2xl text-zinc-300">
                    {proposal.roiProjections}
                  </div>
                </section>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Pricing Tiers */}
            {proposal.pricingTiers && proposal.pricingTiers.length > 0 && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Package size={20} className="text-purple-500" />
                  Pricing Plans
                </h3>
                <div className="space-y-4">
                  {proposal.pricingTiers.map((tier, i) => (
                    <div key={i} className={cn(
                      "p-5 rounded-2xl border transition-all",
                      i === 1 ? "bg-purple-600/10 border-purple-500/50" : "bg-black/40 border-zinc-800"
                    )}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold uppercase tracking-wider text-zinc-500">{tier.tier}</span>
                        <span className="text-lg font-bold text-purple-400">{tier.price}</span>
                      </div>
                      <ul className="space-y-2">
                        {tier.features.map((feat, j) => (
                          <li key={j} className="text-xs text-zinc-400 flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-green-500" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={downloadPDF}
                className="flex flex-col items-center justify-center p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-colors gap-2 cursor-pointer"
              >
                <Download size={24} className="text-blue-400" />
                <span className="text-xs font-bold">Download PDF</span>
              </button>
              <button 
                onClick={openSendModal}
                className="flex flex-col items-center justify-center p-4 bg-purple-600 rounded-2xl hover:bg-purple-500 transition-colors gap-2 cursor-pointer"
              >
                <Send size={24} className="text-white" />
                <span className="text-xs font-bold text-white">Send to Client</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Proposal Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Mail size={20} className="text-purple-500" />
                Send Proposal
              </h3>
              <button onClick={() => setShowSendModal(false)} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors">
                <X size={20} className="text-zinc-400" />
              </button>
            </div>

            {sendSuccess ? (
              <div className="text-center space-y-4 py-6">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h4 className="text-lg font-bold text-green-400">Proposal Sent!</h4>
                <p className="text-zinc-400 text-sm">The proposal has been emailed to {sendEmail}</p>
                <button 
                  onClick={() => setShowSendModal(false)}
                  className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-zinc-400 text-sm">
                  Send this proposal directly to <strong className="text-white">{selectedBusiness?.name}</strong> via email.
                </p>

                {sendError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
                    {sendError}
                  </div>
                )}

                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Recipient Email</label>
                  <input
                    type="email"
                    value={sendEmail}
                    onChange={(e) => setSendEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Subject</label>
                  <input
                    type="text"
                    value={sendSubject}
                    onChange={(e) => setSendSubject(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendProposal}
                    disabled={isSending || !sendEmail}
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    {isSending ? 'Sending...' : 'Send Email'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Zap({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M4 14.71 12 3l1 9h7L12 21l-1-9H4z" />
    </svg>
  );
}
