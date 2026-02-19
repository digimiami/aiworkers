'use client';

import { useState } from 'react';
import axios from 'axios';
import { Search, MapPin, Building2, Loader2, AlertCircle, Star, Globe, Image, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Business {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  website: string | null;
  photosCount: number;
  hasHours: boolean;
}

interface CompetitorAnalysis {
  mainBusiness: Business;
  competitors: Business[];
  analysis: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    positioning: string;
  };
}

export default function CompetitorsPage() {
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CompetitorAnalysis | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !location) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('/api/competitors', {
        businessName,
        location,
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze competitors');
    } finally {
      setIsLoading(false);
    }
  };

  const isWinner = (mainValue: number, competitorValue: number) => mainValue > competitorValue;
  const isLoser = (mainValue: number, competitorValue: number) => mainValue < competitorValue;

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4 max-w-3xl mx-auto py-10">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Competitor <span className="text-purple-500">Analysis</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Find and compare your top local competitors side-by-side.
        </p>
      </section>

      <div className="bg-zinc-900/50 border border-purple-500/20 p-6 rounded-2xl backdrop-blur-sm max-w-4xl mx-auto shadow-2xl">
        <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            Analyze
          </button>
        </form>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-8 max-w-6xl mx-auto">
          {/* Comparison Table */}
          <div className="bg-zinc-900/50 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm overflow-x-auto">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp size={24} className="text-purple-500" />
              Competitive Comparison
            </h3>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4 px-4 font-bold text-gray-300">Metric</th>
                  <th className="text-center py-4 px-4 font-bold">
                    <div className="text-purple-400">{result.mainBusiness.name}</div>
                    <div className="text-xs text-gray-500 font-normal">(Your Business)</div>
                  </th>
                  {result.competitors.map((comp) => (
                    <th key={comp.id} className="text-center py-4 px-4 font-bold">
                      <div className="text-gray-300">{comp.name}</div>
                      <div className="text-xs text-gray-500 font-normal">Competitor</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Rating */}
                <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-4 px-4 text-gray-300 flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" />
                    Google Rating
                  </td>
                  <td className="text-center py-4 px-4">
                    <div className={cn(
                      'inline-block px-3 py-1 rounded-lg font-bold',
                      result.mainBusiness.rating >= 4 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    )}>
                      {result.mainBusiness.rating.toFixed(1)}
                    </div>
                  </td>
                  {result.competitors.map((comp) => (
                    <td key={comp.id} className="text-center py-4 px-4">
                      <div className={cn(
                        'inline-block px-3 py-1 rounded-lg font-bold',
                        isWinner(result.mainBusiness.rating, comp.rating)
                          ? 'bg-green-500/20 text-green-400'
                          : isLoser(result.mainBusiness.rating, comp.rating)
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-500/20 text-gray-400'
                      )}>
                        {comp.rating.toFixed(1)}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Review Count */}
                <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-4 px-4 text-gray-300">Review Count</td>
                  <td className="text-center py-4 px-4">
                    <div className="inline-block px-3 py-1 rounded-lg font-bold bg-blue-500/20 text-blue-400">
                      {result.mainBusiness.reviewCount}
                    </div>
                  </td>
                  {result.competitors.map((comp) => (
                    <td key={comp.id} className="text-center py-4 px-4">
                      <div className={cn(
                        'inline-block px-3 py-1 rounded-lg font-bold',
                        isWinner(result.mainBusiness.reviewCount, comp.reviewCount)
                          ? 'bg-green-500/20 text-green-400'
                          : isLoser(result.mainBusiness.reviewCount, comp.reviewCount)
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-500/20 text-gray-400'
                      )}>
                        {comp.reviewCount}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Website */}
                <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-4 px-4 text-gray-300 flex items-center gap-2">
                    <Globe size={16} className="text-blue-500" />
                    Website
                  </td>
                  <td className="text-center py-4 px-4">
                    {result.mainBusiness.website ? (
                      <CheckCircle size={20} className="text-green-400 mx-auto" />
                    ) : (
                      <AlertTriangle size={20} className="text-red-400 mx-auto" />
                    )}
                  </td>
                  {result.competitors.map((comp) => (
                    <td key={comp.id} className="text-center py-4 px-4">
                      {comp.website ? (
                        <CheckCircle size={20} className="text-green-400 mx-auto" />
                      ) : (
                        <AlertTriangle size={20} className="text-red-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* Photos */}
                <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-4 px-4 text-gray-300 flex items-center gap-2">
                    <Image size={16} className="text-purple-500" />
                    Photos
                  </td>
                  <td className="text-center py-4 px-4">
                    <div className="inline-block px-3 py-1 rounded-lg font-bold bg-purple-500/20 text-purple-400">
                      {result.mainBusiness.photosCount}
                    </div>
                  </td>
                  {result.competitors.map((comp) => (
                    <td key={comp.id} className="text-center py-4 px-4">
                      <div className={cn(
                        'inline-block px-3 py-1 rounded-lg font-bold',
                        isWinner(result.mainBusiness.photosCount, comp.photosCount)
                          ? 'bg-green-500/20 text-green-400'
                          : isLoser(result.mainBusiness.photosCount, comp.photosCount)
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-500/20 text-gray-400'
                      )}>
                        {comp.photosCount}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Strategic Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                <CheckCircle size={20} />
                Your Strengths
              </h3>
              <ul className="space-y-3">
                {result.analysis.strengths.length > 0 ? (
                  result.analysis.strengths.map((strength, i) => (
                    <li key={i} className="text-gray-300 flex items-start gap-3">
                      <span className="text-green-400 font-bold mt-1">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400">No specific strengths identified</li>
                )}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} />
                Areas to Improve
              </h3>
              <ul className="space-y-3">
                {result.analysis.weaknesses.length > 0 ? (
                  result.analysis.weaknesses.map((weakness, i) => (
                    <li key={i} className="text-gray-300 flex items-start gap-3">
                      <span className="text-red-400 font-bold mt-1">✗</span>
                      <span>{weakness}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400">No specific weaknesses identified</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Improvement Roadmap</h3>
            <ul className="space-y-3">
              {result.analysis.improvements.map((improvement, i) => (
                <li key={i} className="text-gray-300 flex items-start gap-3">
                  <span className="text-purple-400 font-bold mt-1">{i + 1}.</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Market Positioning */}
          <div className="bg-zinc-900/50 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4">Market Positioning Strategy</h3>
            <p className="text-gray-300 leading-relaxed">{result.analysis.positioning}</p>
          </div>
        </div>
      )}
    </div>
  );
}
