'use client';

import { useState } from 'react';
import axios from 'axios';
import { Search, MapPin, Building2, Loader2, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditScore {
  category: string;
  score: number;
  recommendation: string;
}

interface AuditResult {
  business: {
    name: string;
    address: string;
    phone: string;
    website: string | null;
    rating: number;
    reviewCount: number;
    photosCount: number;
  };
  audit: {
    overallGrade: string;
    overallScore: number;
    scores: AuditScore[];
  };
}

export default function AuditPage() {
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState('');

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !location) return;

    setIsLoading(true);
    setError('');
    setAuditResult(null);

    try {
      const response = await axios.post('/api/audit', {
        businessName,
        location,
      });
      setAuditResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to audit business');
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'from-green-500 to-emerald-600 text-white';
      case 'B':
        return 'from-blue-500 to-cyan-600 text-white';
      case 'C':
        return 'from-yellow-500 to-amber-600 text-white';
      case 'D':
        return 'from-orange-500 to-red-600 text-white';
      case 'F':
        return 'from-red-500 to-rose-600 text-white';
      default:
        return 'from-gray-500 to-gray-600 text-white';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle size={16} />;
    if (score >= 60) return <AlertCircle size={16} />;
    return <AlertCircle size={16} />;
  };

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4 max-w-3xl mx-auto py-10">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Google Business <span className="text-purple-500">Audit</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Analyze any business's Google Business Profile and get actionable recommendations.
        </p>
      </section>

      <div className="bg-zinc-900/50 border border-purple-500/20 p-6 rounded-2xl backdrop-blur-sm max-w-4xl mx-auto shadow-2xl">
        <form onSubmit={handleAudit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Building2 className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Business Name"
              className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="City, State or Zip"
              className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
            Run Audit
          </button>
        </form>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {auditResult && (
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Business Info Card */}
          <div className="bg-zinc-900/50 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{auditResult.business.name}</h2>
                <p className="text-gray-400 flex items-center gap-2 mb-2">
                  <MapPin size={16} /> {auditResult.business.address}
                </p>
                {auditResult.business.website && (
                  <a
                    href={auditResult.business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm"
                  >
                    {auditResult.business.website}
                  </a>
                )}
              </div>
              <div className={cn(
                'h-24 w-24 rounded-2xl flex flex-col items-center justify-center font-bold bg-gradient-to-br',
                getGradeColor(auditResult.audit.overallGrade)
              )}>
                <div className="text-5xl">{auditResult.audit.overallGrade}</div>
                <div className="text-xs uppercase tracking-wider">Grade</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/50 rounded-lg p-4 border border-zinc-800">
                <p className="text-gray-400 text-sm">Overall Score</p>
                <p className="text-2xl font-bold text-purple-400">{auditResult.audit.overallScore}</p>
              </div>
              <div className="bg-black/50 rounded-lg p-4 border border-zinc-800">
                <p className="text-gray-400 text-sm">Google Rating</p>
                <p className="text-2xl font-bold text-yellow-400">{auditResult.business.rating.toFixed(1)}</p>
              </div>
              <div className="bg-black/50 rounded-lg p-4 border border-zinc-800">
                <p className="text-gray-400 text-sm">Reviews</p>
                <p className="text-2xl font-bold text-blue-400">{auditResult.business.reviewCount}</p>
              </div>
              <div className="bg-black/50 rounded-lg p-4 border border-zinc-800">
                <p className="text-gray-400 text-sm">Photos</p>
                <p className="text-2xl font-bold text-green-400">{auditResult.business.photosCount}</p>
              </div>
            </div>
          </div>

          {/* Audit Scores */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp size={24} className="text-purple-500" />
              Detailed Audit Scores
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auditResult.audit.scores.map((score, index) => (
                <div
                  key={index}
                  className={cn(
                    'bg-zinc-900/50 border rounded-xl p-5 backdrop-blur-sm transition-all hover:border-purple-500/40',
                    getScoreColor(score.score)
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-lg">{score.category}</h4>
                    <div className="flex items-center gap-2">
                      {getScoreIcon(score.score)}
                      <span className="text-2xl font-bold">{score.score}</span>
                    </div>
                  </div>

                  {/* Score Bar */}
                  <div className="w-full bg-black/50 rounded-full h-2 mb-3 overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        score.score >= 80 ? 'bg-green-500' : score.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ width: `${score.score}%` }}
                    />
                  </div>

                  <p className="text-sm text-gray-300">{score.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Key Insights</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold mt-1">•</span>
                <span>Focus on improving categories with scores below 70 for maximum impact</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold mt-1">•</span>
                <span>Adding more photos and encouraging reviews are quick wins</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold mt-1">•</span>
                <span>Ensure business hours are always current and accurate</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold mt-1">•</span>
                <span>A website is critical for business credibility and conversions</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
