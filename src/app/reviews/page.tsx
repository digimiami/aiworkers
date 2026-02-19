'use client';

import { useState } from 'react';
import axios from 'axios';
import { Search, MapPin, Building2, Loader2, AlertCircle, ThumbsUp, ThumbsDown, MessageCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewAnalysis {
  business: {
    name: string;
    address: string;
    rating: number;
    totalReviews: number;
  };
  analysis: {
    totalReviews: number;
    averageSentiment: 'positive' | 'negative' | 'neutral';
    sentimentBreakdown: {
      positive: number;
      neutral: number;
      negative: number;
    };
    commonComplaints: string[];
    commonPraise: string[];
    responseRate: number;
    recommendations: string[];
  };
  reviews: Array<{
    author: string;
    rating: number;
    text: string;
    time: number;
  }>;
}

export default function ReviewsPage() {
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ReviewAnalysis | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !location) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('/api/analyze-reviews', {
        businessName,
        location,
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'negative':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp size={24} />;
      case 'negative':
        return <ThumbsDown size={24} />;
      default:
        return <MessageCircle size={24} />;
    }
  };

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4 max-w-3xl mx-auto py-10">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Review <span className="text-purple-500">Analyzer</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Analyze customer reviews with AI sentiment analysis and get actionable insights.
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
            Analyze Reviews
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
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Business Header */}
          <div className="bg-zinc-900/50 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-2">{result.business.name}</h2>
            <p className="text-gray-400 flex items-center gap-2 mb-4">
              <MapPin size={16} /> {result.business.address}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-black/50 rounded-lg p-4 border border-zinc-800">
                <p className="text-gray-400 text-sm">Google Rating</p>
                <p className="text-2xl font-bold text-yellow-400">{result.business.rating.toFixed(1)}</p>
              </div>
              <div className="bg-black/50 rounded-lg p-4 border border-zinc-800">
                <p className="text-gray-400 text-sm">Total Reviews</p>
                <p className="text-2xl font-bold text-blue-400">{result.business.totalReviews}</p>
              </div>
              <div className={cn(
                'bg-black/50 rounded-lg p-4 border',
                result.analysis.averageSentiment === 'positive' ? 'border-green-500/30' : result.analysis.averageSentiment === 'negative' ? 'border-red-500/30' : 'border-yellow-500/30'
              )}>
                <p className="text-gray-400 text-sm">Sentiment</p>
                <p className={cn(
                  'text-2xl font-bold capitalize',
                  result.analysis.averageSentiment === 'positive' ? 'text-green-400' : result.analysis.averageSentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
                )}>
                  {result.analysis.averageSentiment}
                </p>
              </div>
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="bg-zinc-900/50 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp size={24} className="text-purple-500" />
              Sentiment Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Positive */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp size={20} className="text-green-400" />
                  <span className="font-bold text-lg">Positive</span>
                </div>
                <div className="bg-black/50 rounded-lg p-4 border border-green-500/30">
                  <p className="text-4xl font-bold text-green-400 mb-2">
                    {result.analysis.sentimentBreakdown.positive}
                  </p>
                  <p className="text-sm text-gray-400">
                    {result.analysis.totalReviews > 0
                      ? Math.round((result.analysis.sentimentBreakdown.positive / result.analysis.totalReviews) * 100)
                      : 0}
                    % of reviews
                  </p>
                </div>
              </div>

              {/* Neutral */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle size={20} className="text-yellow-400" />
                  <span className="font-bold text-lg">Neutral</span>
                </div>
                <div className="bg-black/50 rounded-lg p-4 border border-yellow-500/30">
                  <p className="text-4xl font-bold text-yellow-400 mb-2">
                    {result.analysis.sentimentBreakdown.neutral}
                  </p>
                  <p className="text-sm text-gray-400">
                    {result.analysis.totalReviews > 0
                      ? Math.round((result.analysis.sentimentBreakdown.neutral / result.analysis.totalReviews) * 100)
                      : 0}
                    % of reviews
                  </p>
                </div>
              </div>

              {/* Negative */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsDown size={20} className="text-red-400" />
                  <span className="font-bold text-lg">Negative</span>
                </div>
                <div className="bg-black/50 rounded-lg p-4 border border-red-500/30">
                  <p className="text-4xl font-bold text-red-400 mb-2">
                    {result.analysis.sentimentBreakdown.negative}
                  </p>
                  <p className="text-sm text-gray-400">
                    {result.analysis.totalReviews > 0
                      ? Math.round((result.analysis.sentimentBreakdown.negative / result.analysis.totalReviews) * 100)
                      : 0}
                    % of reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="mt-6 space-y-2">
              <p className="text-sm text-gray-400">Distribution</p>
              <div className="flex h-8 rounded-full overflow-hidden border border-zinc-800">
                {result.analysis.totalReviews > 0 && (
                  <>
                    <div
                      className="bg-green-500 flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        width: `${(result.analysis.sentimentBreakdown.positive / result.analysis.totalReviews) * 100}%`,
                      }}
                    >
                      {(result.analysis.sentimentBreakdown.positive / result.analysis.totalReviews) * 100 > 10 &&
                        `${Math.round((result.analysis.sentimentBreakdown.positive / result.analysis.totalReviews) * 100)}%`}
                    </div>
                    <div
                      className="bg-yellow-500 flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        width: `${(result.analysis.sentimentBreakdown.neutral / result.analysis.totalReviews) * 100}%`,
                      }}
                    >
                      {(result.analysis.sentimentBreakdown.neutral / result.analysis.totalReviews) * 100 > 10 &&
                        `${Math.round((result.analysis.sentimentBreakdown.neutral / result.analysis.totalReviews) * 100)}%`}
                    </div>
                    <div
                      className="bg-red-500 flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        width: `${(result.analysis.sentimentBreakdown.negative / result.analysis.totalReviews) * 100}%`,
                      }}
                    >
                      {(result.analysis.sentimentBreakdown.negative / result.analysis.totalReviews) * 100 > 10 &&
                        `${Math.round((result.analysis.sentimentBreakdown.negative / result.analysis.totalReviews) * 100)}%`}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Common Praise & Complaints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Common Praise */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                <ThumbsUp size={20} />
                Common Praise
              </h3>
              <ul className="space-y-3">
                {result.analysis.commonPraise.length > 0 ? (
                  result.analysis.commonPraise.map((praise, i) => (
                    <li key={i} className="text-gray-300 flex items-start gap-3">
                      <span className="text-green-400 font-bold mt-1">✓</span>
                      <span>{praise}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400">No common praise identified</li>
                )}
              </ul>
            </div>

            {/* Common Complaints */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <ThumbsDown size={20} />
                Common Complaints
              </h3>
              <ul className="space-y-3">
                {result.analysis.commonComplaints.length > 0 ? (
                  result.analysis.commonComplaints.map((complaint, i) => (
                    <li key={i} className="text-gray-300 flex items-start gap-3">
                      <span className="text-red-400 font-bold mt-1">✗</span>
                      <span>{complaint}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400">No common complaints identified</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Recommendations for Improvement</h3>
            <ul className="space-y-3">
              {result.analysis.recommendations.map((rec, i) => (
                <li key={i} className="text-gray-300 flex items-start gap-3">
                  <span className="text-purple-400 font-bold mt-1">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Reviews */}
          {result.reviews.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Recent Reviews</h3>
              <div className="space-y-4">
                {result.reviews.map((review, i) => (
                  <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-purple-500/40 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-white">{review.author}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(review.time * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, j) => (
                          <span key={j} className="text-yellow-400">★</span>
                        ))}
                        {Array.from({ length: 5 - review.rating }).map((_, j) => (
                          <span key={j} className="text-gray-600">★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
