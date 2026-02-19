'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Globe, 
  Activity, 
  Search, 
  Filter, 
  ArrowUpDown,
  MapPin,
  Star,
  ExternalLink,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Prospect {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string | null;
  rating: number;
  reviewCount: number;
  healthScore: number;
  missing: string[];
  niche: string;
  city: string;
  dateAdded: string;
}

export default function Dashboard() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [filterNiche, setFilterNiche] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [sortBy, setSortBy] = useState<'healthScore' | 'name' | 'dateAdded'>('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem('prospects') || '[]');
      setProspects(saved);
    }
  }, []);

  const filteredProspects = prospects
    .filter(p => p.niche.toLowerCase().includes(filterNiche.toLowerCase()))
    .filter(p => p.city.toLowerCase().includes(filterCity.toLowerCase()))
    .sort((a, b) => {
      const factor = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'healthScore') return (a.healthScore - b.healthScore) * factor;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * factor;
      return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime() * factor;
    });

  const stats = {
    total: prospects.length,
    avgScore: prospects.length ? Math.round(prospects.reduce((acc, p) => acc + p.healthScore, 0) / prospects.length) : 0,
    noWebsite: prospects.filter(p => !p.website).length,
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="text-purple-500" />
            Prospect Dashboard
          </h1>
          <p className="text-gray-400">Manage and track your potential leads.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Users size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Prospects</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg. Health Score</p>
              <p className="text-2xl font-bold">{stats.avgScore}</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
              <Globe size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Missing Website</p>
              <p className="text-2xl font-bold">{stats.noWebsite}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 bg-black border border-zinc-800 rounded-lg px-3 py-1.5 flex-1 min-w-[200px]">
          <Search size={16} className="text-gray-500" />
          <input 
            type="text" 
            placeholder="Filter by niche..." 
            className="bg-transparent border-none focus:outline-none text-sm w-full"
            value={filterNiche}
            onChange={(e) => setFilterNiche(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-black border border-zinc-800 rounded-lg px-3 py-1.5 flex-1 min-w-[200px]">
          <Filter size={16} className="text-gray-500" />
          <input 
            type="text" 
            placeholder="Filter by city..." 
            className="bg-transparent border-none focus:outline-none text-sm w-full"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
          />
        </div>
        <button 
          onClick={() => {
            setSortBy('healthScore');
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          }}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg px-4 py-1.5 text-sm transition-colors"
        >
          <ArrowUpDown size={16} />
          Sort by Score
        </button>
      </div>

      {/* Prospects Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/50 border-b border-zinc-800">
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Business</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Niche / City</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-center">Health Score</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredProspects.length > 0 ? filteredProspects.map((prospect) => (
              <tr key={prospect.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold">{prospect.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={10} /> {prospect.address}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">{prospect.niche}</div>
                  <div className="text-xs text-gray-500">{prospect.city}</div>
                </td>
                <td className="px-6 py-4">
                  <div className={cn("text-lg font-bold text-center", getScoreColor(prospect.healthScore))}>
                    {prospect.healthScore}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {!prospect.website && (
                      <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full">No Website</span>
                    )}
                    {prospect.rating < 4 && (
                      <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full">Low Rating</span>
                    )}
                    {prospect.reviewCount < 20 && (
                      <span className="text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full">Few Reviews</span>
                    )}
                  </div>
                </td>
<td className="px-6 py-4">
	                  <div className="flex items-center gap-3">
	                    {prospect.website && (
	                      <a href={prospect.website} target="_blank" className="text-gray-400 hover:text-white transition-colors" title="Visit Website">
	                        <Globe size={18} />
	                      </a>
	                    )}
	                    <Link 
	                      href={`/proposals?businessId=${prospect.id}`}
	                      className="text-gray-400 hover:text-purple-400 transition-colors"
	                      title="Generate Proposal"
	                    >
	                      <FileText size={18} />
	                    </Link>
	                    <Link 
	                      href={`/landing-pages?businessId=${prospect.id}`}
	                      className="text-gray-400 hover:text-blue-400 transition-colors"
	                      title="Generate Landing Page"
	                    >
	                      <LayoutDashboard size={18} />
	                    </Link>
	                  </div>
	                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                  No prospects found. Start by searching on the homepage!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
