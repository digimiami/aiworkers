'use client';

import { useState, useEffect } from 'react';
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
  ArrowLeft
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
}

export default function ProposalsPage() {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const businessId = new URLSearchParams(window.location.search).get('businessId');
    if (businessId) {
      const saved = JSON.parse(localStorage.getItem('prospects') || '[]');
      const found = saved.find((p: any) => p.id === businessId);
      if (found) {
        setSelectedBusiness(found);
      }
    }
  }, []);

  const generateProposal = async () => {
    if (!selectedBusiness) return;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await axios.post('/api/generate-proposal', { business: selectedBusiness });
      setProposal(res.data);
      
      // Save proposal to local storage for outreach
      const savedProposals = JSON.parse(localStorage.getItem('generated_proposals') || '[]');
      const newProposal = {
        id: Date.now().toString(),
        businessId: selectedBusiness.id,
        businessName: selectedBusiness.name,
        data: res.data,
        dateCreated: new Date().toISOString(),
        status: 'draft'
      };
      localStorage.setItem('generated_proposals', JSON.stringify([newProposal, ...savedProposals]));
    } catch (err) {
      setError('Failed to generate proposal. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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
          <Link href="/dashboard" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Proposal Generator</h1>
            <p className="text-zinc-400">Create a tailored sales pitch for {selectedBusiness.name}</p>
          </div>
        </div>
        {!proposal && !isGenerating && (
          <button
            onClick={generateProposal}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all flex items-center gap-2"
          >
            <Zap className="fill-white" size={18} />
            Generate with AI
          </button>
        )}
      </div>

      {isGenerating && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-20 flex flex-col items-center justify-center space-y-6">
          <Loader2 className="animate-spin text-purple-500" size={48} />
          <div className="text-center">
            <h3 className="text-xl font-bold">DeepSeek AI is working...</h3>
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
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-8 shadow-2xl">
              <div className="flex justify-between items-start border-b border-zinc-800 pb-8">
                <div>
                  <h2 className="text-4xl font-bold mb-2">Service Proposal</h2>
                  <p className="text-zinc-400">Prepared for <span className="text-white font-medium">{selectedBusiness.name}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-500">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-sm text-zinc-500">Ref: PROP-{selectedBusiness.id.slice(0, 8)}</p>
                </div>
              </div>

              <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Building2 size={20} className="text-purple-500" />
                  Business Analysis
                </h3>
                <p className="text-zinc-300 leading-relaxed">{proposal.businessAnalysis}</p>
              </section>

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

              <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-green-400">
                  <TrendingUp size={20} />
                  Expected ROI
                </h3>
                <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-2xl text-zinc-300">
                  {proposal.roiProjections}
                </div>
              </section>
            </div>
          </div>

          <div className="space-y-6">
            {/* Pricing Tiers */}
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

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-colors gap-2">
                <Download size={24} className="text-blue-400" />
                <span className="text-xs font-bold">Download PDF</span>
              </button>
              <Link 
                href={`/outreach?businessId=${selectedBusiness.id}`}
                className="flex flex-col items-center justify-center p-4 bg-purple-600 rounded-2xl hover:bg-purple-500 transition-colors gap-2"
              >
                <Send size={24} className="text-white" />
                <span className="text-xs font-bold text-white">Send Proposal</span>
              </Link>
            </div>
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
