'use client';

import { useState } from 'react';
import { Search, Send, CheckCircle, AlertCircle, Loader, Filter } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  healthScore: number;
  niche: string;
}

interface SendResult {
  businessId: string;
  businessName: string;
  email: string;
  status: 'sent' | 'failed';
  error?: string;
  timestamp: string;
}

export default function BulkPage() {
  const [zipCode, setZipCode] = useState('');
  const [niche, setNiche] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [healthScoreFilter, setHealthScoreFilter] = useState(0);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!zipCode.trim() || !niche.trim()) {
      setMessage('Please enter both zip code and niche');
      return;
    }

    setLoading(true);
    setMessage('');
    setBusinesses([]);
    setSelectedBusinesses(new Set());

    try {
      const response = await fetch('/api/bulk-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode, niche }),
      });

      if (!response.ok) {
        throw new Error('Failed to search businesses');
      }

      const data = await response.json();
      setBusinesses(data.businesses);
      setMessage(`Found ${data.businesses.length} businesses in ${zipCode}`);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to search businesses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter((b) => b.healthScore <= healthScoreFilter || healthScoreFilter === 0);

  const handleSelectAll = () => {
    if (selectedBusinesses.size === filteredBusinesses.length) {
      setSelectedBusinesses(new Set());
    } else {
      setSelectedBusinesses(new Set(filteredBusinesses.map((b) => b.id)));
    }
  };

  const handleToggleSelect = (businessId: string) => {
    const newSelected = new Set(selectedBusinesses);
    if (newSelected.has(businessId)) {
      newSelected.delete(businessId);
    } else {
      newSelected.add(businessId);
    }
    setSelectedBusinesses(newSelected);
  };

  const handleBulkSend = async () => {
    if (selectedBusinesses.size === 0) {
      setMessage('Please select at least one business');
      return;
    }

    const selectedBizzes = businesses.filter((b) => selectedBusinesses.has(b.id));

    setSending(true);
    setMessage('');

    try {
      const response = await fetch('/api/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businesses: selectedBizzes,
          proposalTemplate: 'We can help improve your business',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send proposals');
      }

      const data = await response.json();
      setSendResults(data.results);
      setShowResults(true);
      setMessage(`Sent ${data.successCount} proposals successfully!`);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to send proposals. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Search className="text-purple-500" size={32} />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Bulk Search & Outreach
          </h1>
        </div>

        {/* Search Section */}
        <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Search Businesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Zip Code</label>
              <input
                type="text"
                placeholder="e.g., 10001"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full bg-black/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Niche (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g., Plumbing, HVAC"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-black/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg border ${
              message.includes('successfully') || message.includes('Found')
                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Results Section */}
        {businesses.length > 0 && !showResults && (
          <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Found Businesses</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-400" />
                  <label className="text-sm text-gray-300">Health Score:</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={healthScoreFilter}
                    onChange={(e) => setHealthScoreFilter(Number(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-400">{healthScoreFilter === 0 ? 'All' : `≤ ${healthScoreFilter}`}</span>
                </div>
              </div>
            </div>

            {/* Select All */}
            <div className="mb-4 flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-purple-500/10">
              <input
                type="checkbox"
                checked={selectedBusinesses.size === filteredBusinesses.length && filteredBusinesses.length > 0}
                onChange={handleSelectAll}
                className="w-5 h-5 rounded cursor-pointer"
              />
              <span className="text-white font-semibold">
                Select All ({selectedBusinesses.size} / {filteredBusinesses.length})
              </span>
            </div>

            {/* Businesses Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Select</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Business Name</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Niche</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Health Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBusinesses.map((business) => (
                    <tr key={business.id} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedBusinesses.has(business.id)}
                          onChange={() => handleToggleSelect(business.id)}
                          className="w-4 h-4 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 text-white font-semibold">{business.name}</td>
                      <td className="py-3 px-4 text-gray-400">{business.email}</td>
                      <td className="py-3 px-4 text-gray-400">{business.niche}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-black/50 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                business.healthScore >= 70
                                  ? 'bg-green-500'
                                  : business.healthScore >= 50
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${business.healthScore}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{business.healthScore}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bulk Send Button */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleBulkSend}
                disabled={selectedBusinesses.size === 0 || sending}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                {sending ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Sending {selectedBusinesses.size} Proposals...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Proposal to {selectedBusinesses.size} Business{selectedBusinesses.size !== 1 ? 'es' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Send Results */}
        {showResults && sendResults.length > 0 && (
          <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Send Results</h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400">
                  {sendResults.filter((r) => r.status === 'sent').length}
                </div>
                <div className="text-sm text-green-300">Sent Successfully</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-400">
                  {sendResults.filter((r) => r.status === 'failed').length}
                </div>
                <div className="text-sm text-red-300">Failed</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{sendResults.length}</div>
                <div className="text-sm text-blue-300">Total</div>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sendResults.map((result) => (
                <div
                  key={result.businessId}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    result.status === 'sent'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  {result.status === 'sent' ? (
                    <CheckCircle size={20} className="text-green-400" />
                  ) : (
                    <AlertCircle size={20} className="text-red-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{result.businessName}</div>
                    <div className="text-xs text-gray-400">{result.email}</div>
                  </div>
                  <div className="text-xs font-semibold text-gray-400">
                    {result.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowResults(false);
                setSendResults([]);
                setBusinesses([]);
                setSelectedBusinesses(new Set());
              }}
              className="w-full mt-4 bg-white/5 border border-purple-500/20 hover:border-purple-500/50 text-white font-semibold py-2 rounded-lg transition-all"
            >
              New Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
