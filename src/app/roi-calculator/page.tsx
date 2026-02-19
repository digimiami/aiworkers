'use client';

import { useState } from 'react';
import { ArrowRight, Loader } from 'lucide-react';

export default function ROICalculator() {
  const [formData, setFormData] = useState({
    monthlyRevenue: 50000,
    industryType: 'e-commerce',
    hasWebsite: true,
    googleRating: 4.5,
    reviewCount: 50,
    monthlyAdSpend: 2000,
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'monthlyRevenue' || name === 'reviewCount' || name === 'monthlyAdSpend' ? parseInt(value) : parseFloat(value),
    }));
  };

  const calculateROI = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/roi-calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to calculate ROI');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Error calculating ROI. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              ROI Calculator
            </h1>
            <p className="text-gray-400 text-lg">
              Discover how much revenue AI Workers can generate for your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="bg-white/5 border border-purple-500/20 rounded-lg p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6">Your Business</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Monthly Revenue
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">$</span>
                    <input
                      type="number"
                      name="monthlyRevenue"
                      value={formData.monthlyRevenue}
                      onChange={handleInputChange}
                      className="flex-1 bg-white/10 border border-purple-500/30 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Industry Type
                  </label>
                  <select
                    name="industryType"
                    value={formData.industryType}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-purple-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="e-commerce">E-commerce</option>
                    <option value="saas">SaaS</option>
                    <option value="services">Services</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasWebsite"
                    checked={formData.hasWebsite}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-purple-500/30 bg-white/10 cursor-pointer"
                  />
                  <label className="ml-3 text-gray-300">
                    I have a website
                  </label>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Google Rating: {formData.googleRating.toFixed(1)}/5
                  </label>
                  <input
                    type="range"
                    name="googleRating"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.googleRating}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Review Count
                  </label>
                  <input
                    type="number"
                    name="reviewCount"
                    value={formData.reviewCount}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-purple-500/30 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Monthly Ad Spend
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">$</span>
                    <input
                      type="number"
                      name="monthlyAdSpend"
                      value={formData.monthlyAdSpend}
                      onChange={handleInputChange}
                      className="flex-1 bg-white/10 border border-purple-500/30 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <button
                  onClick={calculateROI}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      Calculate ROI
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded p-3 text-red-300 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            <div>
              {result ? (
                <div className="space-y-6">
                  {/* Before/After Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                      <p className="text-gray-400 text-sm mb-2">Current Monthly</p>
                      <p className="text-3xl font-bold text-white">
                        ${formData.monthlyRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg p-6 backdrop-blur-sm">
                      <p className="text-gray-300 text-sm mb-2">Projected Monthly</p>
                      <p className="text-3xl font-bold text-green-400">
                        ${(formData.monthlyRevenue + result.projectedRevenueIncrease).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-400">Monthly Leads Gained</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {result.projectedMonthlyLeads}
                        </p>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min((result.projectedMonthlyLeads / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-white/5 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-400">Monthly Revenue Increase</p>
                        <p className="text-2xl font-bold text-green-400">
                          +${result.projectedRevenueIncrease.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${Math.min((result.projectedRevenueIncrease / formData.monthlyRevenue) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-white/5 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                      <p className="text-gray-400 text-sm mb-2">12-Month Projection</p>
                      <p className="text-3xl font-bold text-white mb-2">
                        +${result.yearlyProjection.toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Annual revenue increase potential
                      </p>
                    </div>

                    <div className="bg-white/5 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                      <p className="text-gray-400 text-sm mb-2">Conversion Rate</p>
                      <p className="text-3xl font-bold text-blue-400">
                        {(result.conversionRate * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="bg-white/5 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                    <p className="text-gray-400 text-sm mb-2">Analysis</p>
                    <p className="text-gray-300">
                      {result.reasoning}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 border border-purple-500/20 rounded-lg p-8 backdrop-blur-sm h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-400 text-lg">
                      Fill in your business details and click &quot;Calculate ROI&quot; to see your potential revenue growth
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
