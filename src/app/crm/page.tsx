'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, X, DollarSign, Calendar, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Deal {
  id: string;
  name: string;
  niche: string;
  healthScore: number;
  lastContact: string;
  dealValue: number;
  notes: string;
}

interface PipelineStage {
  id: string;
  name: string;
  deals: Deal[];
}

export default function CRMPage() {
  const [stages, setStages] = useState<PipelineStage[]>([
    { id: 'found', name: 'Found', deals: [] },
    { id: 'contacted', name: 'Contacted', deals: [] },
    { id: 'replied', name: 'Replied', deals: [] },
    { id: 'meeting', name: 'Meeting', deals: [] },
    { id: 'won', name: 'Closed Won', deals: [] },
    { id: 'lost', name: 'Closed Lost', deals: [] },
  ]);

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    niche: '',
    healthScore: 50,
    dealValue: 0,
    notes: '',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('crm_pipeline');
    if (saved) {
      try {
        setStages(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load CRM data:', err);
      }
    }
  }, []);

  // Save to localStorage whenever stages change
  useEffect(() => {
    localStorage.setItem('crm_pipeline', JSON.stringify(stages));
  }, [stages]);

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.niche) return;

    const newDeal: Deal = {
      id: Date.now().toString(),
      name: formData.name,
      niche: formData.niche,
      healthScore: formData.healthScore,
      lastContact: new Date().toISOString().split('T')[0],
      dealValue: formData.dealValue,
      notes: formData.notes,
    };

    setStages((prev) =>
      prev.map((stage) =>
        stage.id === 'found' ? { ...stage, deals: [newDeal, ...stage.deals] } : stage
      )
    );

    setFormData({
      name: '',
      niche: '',
      healthScore: 50,
      dealValue: 0,
      notes: '',
    });
    setShowAddForm(false);
  };

  const handleMoveDeal = (dealId: string, fromStageId: string, toStageId: string) => {
    setStages((prev) => {
      const newStages = prev.map((stage) => ({ ...stage }));
      const fromStage = newStages.find((s) => s.id === fromStageId);
      const toStage = newStages.find((s) => s.id === toStageId);

      if (!fromStage || !toStage) return prev;

      const dealIndex = fromStage.deals.findIndex((d) => d.id === dealId);
      if (dealIndex === -1) return prev;

      const [deal] = fromStage.deals.splice(dealIndex, 1);
      toStage.deals.push(deal);

      return newStages;
    });
  };

  const handleDeleteDeal = (dealId: string, stageId: string) => {
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === stageId
          ? { ...stage, deals: stage.deals.filter((d) => d.id !== dealId) }
          : stage
      )
    );
    setShowModal(false);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  // Calculate stats
  const totalPipelineValue = stages.reduce((sum, stage) => {
    return sum + stage.deals.reduce((stageSum, deal) => stageSum + deal.dealValue, 0);
  }, 0);

  const totalDeals = stages.reduce((sum, stage) => sum + stage.deals.length, 0);
  const closedWon = stages.find((s) => s.id === 'won')?.deals.length || 0;
  const conversionRate = totalDeals > 0 ? Math.round((closedWon / totalDeals) * 100) : 0;

  return (
    <div className="space-y-8">
      <section className="text-center space-y-4 max-w-3xl mx-auto py-10">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Sales <span className="text-purple-500">CRM Pipeline</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Manage your prospects and track deals through the sales pipeline.
        </p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        <div className="bg-zinc-900/50 border border-purple-500/20 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-gray-400 text-sm mb-2">Total Pipeline Value</p>
          <p className="text-3xl font-bold text-purple-400 flex items-center gap-2">
            <DollarSign size={24} />
            {(totalPipelineValue / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="bg-zinc-900/50 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-gray-400 text-sm mb-2">Total Deals</p>
          <p className="text-3xl font-bold text-blue-400 flex items-center gap-2">
            <Users size={24} />
            {totalDeals}
          </p>
        </div>
        <div className="bg-zinc-900/50 border border-green-500/20 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-gray-400 text-sm mb-2">Conversion Rate</p>
          <p className="text-3xl font-bold text-green-400 flex items-center gap-2">
            <TrendingUp size={24} />
            {conversionRate}%
          </p>
        </div>
        <div className="bg-zinc-900/50 border border-yellow-500/20 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-gray-400 text-sm mb-2">Closed Won</p>
          <p className="text-3xl font-bold text-yellow-400">{closedWon}</p>
        </div>
      </div>

      {/* Add Deal Button */}
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Deal
        </button>
      </div>

      {/* Add Deal Form */}
      {showAddForm && (
        <div className="max-w-6xl mx-auto bg-zinc-900/50 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
          <form onSubmit={handleAddDeal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Business Name</label>
                <input
                  type="text"
                  placeholder="Enter business name"
                  className="w-full bg-black border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Niche</label>
                <input
                  type="text"
                  placeholder="e.g., Plumber, Dentist"
                  className="w-full bg-black border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Health Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full bg-black border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white"
                  value={formData.healthScore}
                  onChange={(e) => setFormData({ ...formData, healthScore: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Deal Value ($)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-black border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white"
                  value={formData.dealValue}
                  onChange={(e) => setFormData({ ...formData, dealValue: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Notes</label>
              <textarea
                placeholder="Add any notes about this deal..."
                className="w-full bg-black border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white h-24 resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-all"
              >
                Add Deal
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      <div className="max-w-7xl mx-auto overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex-shrink-0 w-80 bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm"
            >
              <h3 className="font-bold text-lg mb-4 text-gray-300">
                {stage.name}
                <span className="ml-2 text-sm text-gray-500">({stage.deals.length})</span>
              </h3>

              <div className="space-y-3">
                {stage.deals.map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => {
                      setSelectedDeal(deal);
                      setShowModal(true);
                    }}
                    className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-purple-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">
                        {deal.name}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDeal(deal.id, stage.id);
                        }}
                        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-sm text-gray-400 mb-3">{deal.niche}</p>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Health Score</span>
                        <span className={cn('px-2 py-1 rounded border', getHealthColor(deal.healthScore))}>
                          {deal.healthScore}
                        </span>
                      </div>
                      {deal.dealValue > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Deal Value</span>
                          <span className="text-green-400 font-bold">${deal.dealValue.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Move Buttons */}
                    <div className="flex gap-1 flex-wrap">
                      {stage.id !== 'won' && stage.id !== 'lost' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextStageIndex = stages.findIndex((s) => s.id === stage.id) + 1;
                            if (nextStageIndex < stages.length) {
                              handleMoveDeal(deal.id, stage.id, stages[nextStageIndex].id);
                            }
                          }}
                          className="text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/40 px-2 py-1 rounded transition-all"
                        >
                          Move →
                        </button>
                      )}
                      {stage.id !== 'found' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const prevStageIndex = stages.findIndex((s) => s.id === stage.id) - 1;
                            if (prevStageIndex >= 0) {
                              handleMoveDeal(deal.id, stage.id, stages[prevStageIndex].id);
                            }
                          }}
                          className="text-xs bg-gray-500/20 text-gray-400 hover:bg-gray-500/40 px-2 py-1 rounded transition-all"
                        >
                          ← Back
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deal Details Modal */}
      {showModal && selectedDeal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-purple-500/20 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedDeal.name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Niche</p>
                <p className="text-white font-semibold">{selectedDeal.niche}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Health Score</p>
                <div className={cn('inline-block px-3 py-1 rounded border', getHealthColor(selectedDeal.healthScore))}>
                  {selectedDeal.healthScore}
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Deal Value</p>
                <p className="text-2xl font-bold text-green-400">
                  ${selectedDeal.dealValue.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Last Contact</p>
                <p className="text-white flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(selectedDeal.lastContact).toLocaleDateString()}
                </p>
              </div>

              {selectedDeal.notes && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Notes</p>
                  <p className="text-gray-300 bg-black/50 rounded-lg p-3">{selectedDeal.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-zinc-800 flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const stageId = stages.find((s) => s.deals.some((d) => d.id === selectedDeal.id))?.id;
                    if (stageId) {
                      handleDeleteDeal(selectedDeal.id, stageId);
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
