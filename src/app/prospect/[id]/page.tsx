'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Globe,
  Mail,
  Star,
  AlertCircle,
  FileText,
  Layout,
  Send,
  Clock,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Prospect {
  id: string;
  placeId: string | null;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  rating: number | null;
  reviewCount: number | null;
  niche: string | null;
  city: string | null;
  healthScore: number | null;
  missing: string | null;
  createdAt: string;
  proposals: any[];
  landingPages: any[];
  outreach: any[];
  bookings: any[];
}

export default function ProspectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      axios
        .get(`/api/prospects/${id}`)
        .then((res) => setProspect(res.data.prospect))
        .catch((err) => setError(err.response?.data?.error || 'Failed to load prospect'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const parseMissing = (missing: string | null): string[] => {
    if (!missing) return [];
    try {
      return JSON.parse(missing);
    } catch {
      return [];
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 border-green-500/30 bg-green-500/10';
    if (score >= 50) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (error || !prospect) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-2xl font-bold">Prospect Not Found</h2>
        <p className="text-zinc-400">{error || 'The prospect could not be loaded.'}</p>
        <Link href="/" className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors">
          Back to Search
        </Link>
      </div>
    );
  }

  const missingItems = parseMissing(prospect.missing);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{prospect.name}</h1>
          <div className="flex items-center gap-4 text-zinc-400 text-sm mt-1">
            {prospect.niche && (
              <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full text-xs">{prospect.niche}</span>
            )}
            {prospect.city && <span>{prospect.city}</span>}
            <span className="flex items-center gap-1">
              <Clock size={12} /> Added {new Date(prospect.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        {prospect.healthScore !== null && (
          <div className={cn("h-16 w-16 rounded-full border-2 flex flex-col items-center justify-center text-sm font-bold", getScoreColor(prospect.healthScore))}>
            <span className="text-lg">{prospect.healthScore}</span>
            <span className="text-[8px] uppercase">Score</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href={`/proposals?businessId=${prospect.id}`}
          className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-purple-500/40 transition-all gap-2 group"
        >
          <FileText size={28} className="text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold">Generate Proposal</span>
        </Link>
        <Link
          href={`/landing-pages?businessId=${prospect.id}`}
          className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-blue-500/40 transition-all gap-2 group"
        >
          <Layout size={28} className="text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold">Generate Landing Page</span>
        </Link>
        <Link
          href={`/cold-emails?businessId=${prospect.id}`}
          className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-green-500/40 transition-all gap-2 group"
        >
          <Send size={28} className="text-green-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold">Send Cold Email</span>
        </Link>
        <Link
          href={`/outreach?businessId=${prospect.id}`}
          className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-yellow-500/40 transition-all gap-2 group"
        >
          <Clock size={28} className="text-yellow-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold">View Outreach History</span>
        </Link>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Info */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 size={20} className="text-purple-500" />
            Business Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prospect.address && (
              <div className="flex items-start gap-3 p-3 bg-black/30 rounded-xl border border-zinc-800/50">
                <MapPin size={18} className="text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-semibold">Address</p>
                  <p className="text-sm">{prospect.address}</p>
                </div>
              </div>
            )}
            {prospect.phone && (
              <div className="flex items-start gap-3 p-3 bg-black/30 rounded-xl border border-zinc-800/50">
                <Phone size={18} className="text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-semibold">Phone</p>
                  <p className="text-sm">{prospect.phone}</p>
                </div>
              </div>
            )}
            {prospect.website && (
              <div className="flex items-start gap-3 p-3 bg-black/30 rounded-xl border border-zinc-800/50">
                <Globe size={18} className="text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-semibold">Website</p>
                  <a href={prospect.website} target="_blank" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
                    {prospect.website} <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
            {prospect.email && (
              <div className="flex items-start gap-3 p-3 bg-black/30 rounded-xl border border-zinc-800/50">
                <Mail size={18} className="text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-semibold">Email</p>
                  <a href={`mailto:${prospect.email}`} className="text-sm text-blue-400 hover:underline">{prospect.email}</a>
                </div>
              </div>
            )}
            {prospect.rating !== null && (
              <div className="flex items-start gap-3 p-3 bg-black/30 rounded-xl border border-zinc-800/50">
                <Star size={18} className="text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-semibold">Rating</p>
                  <p className="text-sm">{prospect.rating} ({prospect.reviewCount || 0} reviews)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Opportunities */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-400">
            <AlertCircle size={20} />
            Opportunities
          </h2>
          {missingItems.length > 0 ? (
            <ul className="space-y-2">
              {missingItems.map((item, i) => (
                <li key={i} className="text-sm text-zinc-300 flex items-start gap-2 p-2 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                  <AlertCircle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-500 text-sm">No specific opportunities identified yet.</p>
          )}
        </div>
      </div>

      {/* Proposals History */}
      {prospect.proposals.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText size={20} className="text-purple-500" />
            Proposals ({prospect.proposals.length})
          </h2>
          <div className="space-y-3">
            {prospect.proposals.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-zinc-800/50">
                <div>
                  <p className="text-sm font-medium">Proposal — {p.llmUsed || 'Unknown LLM'}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(p.createdAt).toLocaleDateString()} · Status: {p.status}
                  </p>
                </div>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  p.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'
                )}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Landing Pages History */}
      {prospect.landingPages.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Layout size={20} className="text-blue-500" />
            Landing Pages ({prospect.landingPages.length})
          </h2>
          <div className="space-y-3">
            {prospect.landingPages.map((lp: any) => (
              <div key={lp.id} className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-zinc-800/50">
                <div>
                  <p className="text-sm font-medium">/{lp.slug}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(lp.createdAt).toLocaleDateString()} · {lp.llmUsed || 'Unknown LLM'} · {lp.wordCount || 0} words
                  </p>
                </div>
                <Link href={`/preview/${lp.id}`} target="_blank" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1">
                  <ExternalLink size={12} /> Preview
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outreach History */}
      {prospect.outreach.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Send size={20} className="text-green-500" />
            Outreach History ({prospect.outreach.length})
          </h2>
          <div className="space-y-3">
            {prospect.outreach.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-zinc-800/50">
                <div>
                  <p className="text-sm font-medium">{o.subject || o.type}</p>
                  <p className="text-xs text-zinc-500">
                    {o.type} to {o.recipient} · {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  o.status === 'sent' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                )}>
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
