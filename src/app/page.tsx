'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Building2, Globe, Star, Phone, AlertCircle, Loader2, Mail, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Business {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string | null;
  email?: string | null;
  rating: number;
  reviewCount: number;
  photosCount: number;
  healthScore?: number;
  missing?: string[];
  suggestion?: string;
  isAnalyzing?: boolean;
  dbId?: string;
}

interface SavedProspect {
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
}

export default function SearchPage() {
  const [location, setLocation] = useState('');
  const [niche, setNiche] = useState('');
  const [results, setResults] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentProspects, setRecentProspects] = useState<SavedProspect[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Load recent prospects from DB on page load
  useEffect(() => {
    fetchRecentProspects();
  }, []);

  const fetchRecentProspects = async () => {
    try {
      const res = await axios.get('/api/prospects');
      setRecentProspects(res.data.prospects || []);
    } catch (err) {
      console.error('Failed to load recent prospects:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !niche) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`/api/search?location=${encodeURIComponent(location)}&niche=${encodeURIComponent(niche)}`);
      const businesses = response.data.results.map((b: Business) => ({ ...b, isAnalyzing: true }));
      setResults(businesses);

      // Analyze each business
      businesses.forEach(async (business: Business, index: number) => {
        try {
          const analysisRes = await axios.post('/api/analyze', business);
          const analysis = analysisRes.data;
          
          setResults(prev => {
            const newResults = [...prev];
            newResults[index] = { 
              ...newResults[index], 
              ...analysis, 
              isAnalyzing: false 
            };
            
            // Save to backend DB
            fetch('/api/prospects', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                placeId: business.id,
                name: business.name,
                address: business.address,
                phone: business.phone,
                website: business.website,
                email: business.email || newResults[index].email,
                rating: business.rating,
                reviewCount: business.reviewCount,
                niche,
                city: location,
                healthScore: newResults[index].healthScore,
                missing: JSON.stringify(newResults[index].missing || []),
              }),
            })
              .then(res => res.json())
              .then(data => {
                if (data.prospect?.id) {
                  setResults(prev => {
                    const updated = [...prev];
                    updated[index] = { ...updated[index], dbId: data.prospect.id };
                    return updated;
                  });
                  // Refresh recent prospects
                  fetchRecentProspects();
                }
              })
              .catch(e => console.error('Failed to save prospect:', e));
            
            return newResults;
          });
        } catch (err) {
          console.error('Analysis error for', business.name, err);
          setResults(prev => {
            const newResults = [...prev];
            newResults[index].isAnalyzing = false;
            return newResults;
          });
        }
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 border-green-500/30 bg-green-500/10';
    if (score >= 50) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  const parseMissing = (missing: string | null): string[] => {
    if (!missing) return [];
    try {
      return JSON.parse(missing);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4 max-w-3xl mx-auto py-10">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Find Your Next <span className="text-purple-500">High-Ticket</span> Client
        </h1>
        <p className="text-gray-400 text-lg">
          AI-powered prospecting tool that identifies local businesses in need of your services.
        </p>
      </section>

      <div className="bg-zinc-900/50 border border-purple-500/20 p-6 rounded-2xl backdrop-blur-sm max-w-4xl mx-auto shadow-2xl">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="relative">
            <Building2 className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Niche (e.g. Plumber)"
              className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
            Search Prospects
          </button>
        </form>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((business) => {
            const card = (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:border-purple-500/40 transition-all group relative overflow-hidden cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-xl group-hover:text-purple-400 transition-colors">{business.name}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <MapPin size={14} /> {business.address}
                    </p>
                  </div>
                  {business.isAnalyzing ? (
                    <div className="animate-pulse bg-zinc-800 h-10 w-10 rounded-full flex items-center justify-center">
                       <Loader2 className="animate-spin text-purple-500" size={20} />
                    </div>
                  ) : business.healthScore !== undefined && (
                    <div className={cn("h-12 w-12 rounded-full border-2 flex flex-col items-center justify-center text-xs font-bold", getScoreColor(business.healthScore))}>
                      <span>{business.healthScore}</span>
                      <span className="text-[8px] uppercase">Score</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1"><Globe size={14} /> Website</span>
                    {business.website ? (
                      <span className="text-blue-400">Has Website</span>
                    ) : (
                      <span className="text-red-400 font-medium">No Website</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1"><Star size={14} /> Reviews</span>
                    <span>{business.rating} ({business.reviewCount})</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1"><Phone size={14} /> Phone</span>
                    <span>{business.phone}</span>
                  </div>
                  {business.email && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1"><Mail size={14} /> Email</span>
                      <span className="text-blue-400 text-xs truncate">{business.email}</span>
                    </div>
                  )}
                </div>

                {!business.isAnalyzing && business.missing && (
                  <div className="space-y-2 pt-4 border-t border-zinc-800">
                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Opportunities</p>
                    <ul className="space-y-1">
                      {business.missing.map((item, i) => (
                        <li key={i} className="text-xs text-gray-300 flex items-center gap-2">
                          <AlertCircle size={12} className="text-yellow-500" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );

            if (business.dbId) {
              return (
                <Link key={business.id} href={`/prospect/${business.dbId}`}>
                  {card}
                </Link>
              );
            }

            return <div key={business.id}>{card}</div>;
          })}
        </div>
      )}

      {/* Recent Prospects Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Clock size={24} className="text-purple-500" />
          <h2 className="text-2xl font-bold">Recent Prospects</h2>
          <span className="text-zinc-500 text-sm">({recentProspects.length} saved)</span>
        </div>

        {loadingRecent ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-purple-500" size={32} />
          </div>
        ) : recentProspects.length === 0 ? (
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-12 text-center">
            <p className="text-zinc-500">No saved prospects yet. Search for businesses above to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProspects.slice(0, 12).map((prospect) => (
              <Link key={prospect.id} href={`/prospect/${prospect.id}`}>
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:border-purple-500/40 transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg group-hover:text-purple-400 transition-colors">{prospect.name}</h3>
                      {prospect.address && (
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <MapPin size={14} /> {prospect.address}
                        </p>
                      )}
                    </div>
                    {prospect.healthScore !== null && (
                      <div className={cn("h-10 w-10 rounded-full border-2 flex flex-col items-center justify-center text-xs font-bold", getScoreColor(prospect.healthScore))}>
                        <span>{prospect.healthScore}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    {prospect.niche && <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">{prospect.niche}</span>}
                    {prospect.city && <span>{prospect.city}</span>}
                    {prospect.rating && <span className="flex items-center gap-1"><Star size={10} /> {prospect.rating}</span>}
                  </div>
                  {prospect.missing && parseMissing(prospect.missing).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-800">
                      <div className="flex flex-wrap gap-1">
                        {parseMissing(prospect.missing).slice(0, 3).map((item, i) => (
                          <span key={i} className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
