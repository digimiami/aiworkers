'use client';

import { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Play, Pause, Square, Users, Calendar, CheckCircle, Clock } from 'lucide-react';

interface CampaignStep {
  day: number;
  type: 'email' | 'sms';
  content: string;
  subject?: string;
}

interface CampaignProspect {
  prospectId: string;
  prospectName: string;
  prospectEmail: string;
  currentStep: number;
  status: 'pending' | 'in-progress' | 'completed';
  startedAt: string;
  completedAt?: string;
}

interface Campaign {
  id: string;
  name: string;
  sequence: CampaignStep[];
  prospects: CampaignProspect[];
  status: 'active' | 'paused' | 'stopped';
  createdAt: string;
}

interface Prospect {
  id: string;
  name: string;
  business: string;
  email: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddProspectModal, setShowAddProspectModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('campaigns');
    if (stored) {
      try {
        setCampaigns(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse campaigns:', e);
      }
    }

    const storedProspects = localStorage.getItem('prospects');
    if (storedProspects) {
      try {
        setProspects(JSON.parse(storedProspects));
      } catch (e) {
        console.error('Failed to parse prospects:', e);
      }
    }
  }, []);

  // Save campaigns to localStorage
  useEffect(() => {
    localStorage.setItem('campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  const handleCreateCampaign = () => {
    if (!campaignName.trim()) return;

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: campaignName,
      sequence: [
        { day: 1, type: 'email', subject: 'Proposal', content: 'Send proposal email' },
        { day: 3, type: 'email', subject: 'Follow-up', content: 'Send follow-up email' },
        { day: 7, type: 'sms', content: 'Send SMS reminder' },
        { day: 14, type: 'email', subject: 'Final Follow-up', content: 'Send final follow-up email' },
      ],
      prospects: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setCampaigns([...campaigns, newCampaign]);
    setCampaignName('');
    setShowCreateModal(false);
  };

  const handleAddProspectToCampaign = () => {
    if (!selectedCampaign || !selectedProspect) return;

    const updated = campaigns.map((c) => {
      if (c.id === selectedCampaign.id) {
        return {
          ...c,
          prospects: [
            ...c.prospects,
            {
              prospectId: selectedProspect.id,
              prospectName: selectedProspect.name,
              prospectEmail: selectedProspect.email,
              currentStep: 0,
              status: 'pending' as const,
              startedAt: new Date().toISOString(),
            },
          ],
        };
      }
      return c;
    });

    setCampaigns(updated);
    setSelectedProspect(null);
    setShowAddProspectModal(false);
  };

  const handleUpdateCampaignStatus = (campaignId: string, newStatus: 'active' | 'paused' | 'stopped') => {
    const updated = campaigns.map((c) =>
      c.id === campaignId ? { ...c, status: newStatus } : c
    );
    setCampaigns(updated);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns(campaigns.filter((c) => c.id !== campaignId));
  };

  const handleRemoveProspect = (campaignId: string, prospectId: string) => {
    const updated = campaigns.map((c) => {
      if (c.id === campaignId) {
        return {
          ...c,
          prospects: c.prospects.filter((p) => p.prospectId !== prospectId),
        };
      }
      return c;
    });
    setCampaigns(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Zap className="text-purple-500" size={32} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Drip Campaigns
            </h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 transition-all"
          >
            <Plus size={20} />
            New Campaign
          </button>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-lg p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{campaign.name}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {campaign.prospects.length} prospect{campaign.prospects.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateCampaignStatus(campaign.id, campaign.status === 'active' ? 'paused' : 'active')}
                    className={`p-2 rounded-lg border transition-all ${
                      campaign.status === 'active'
                        ? 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30'
                        : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30'
                    }`}
                  >
                    {campaign.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="p-2 rounded-lg border bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Campaign Timeline */}
              <div className="mb-6 p-4 bg-black/30 rounded-lg border border-purple-500/10">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Campaign Sequence</h3>
                <div className="space-y-2">
                  {campaign.sequence.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-sm font-semibold text-purple-300">
                        Day {step.day}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">
                          {step.type === 'email' ? '📧' : '💬'} {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                        </div>
                        {step.subject && <div className="text-xs text-gray-400">{step.subject}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prospects in Campaign */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <Users size={16} />
                    Prospects
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setShowAddProspectModal(true);
                    }}
                    className="text-xs bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 px-2 py-1 rounded transition-all"
                  >
                    Add
                  </button>
                </div>

                {campaign.prospects.length === 0 ? (
                  <p className="text-xs text-gray-500">No prospects assigned yet</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {campaign.prospects.map((prospect) => (
                      <div
                        key={prospect.prospectId}
                        className="flex items-center justify-between p-2 bg-black/30 rounded border border-purple-500/10 hover:border-purple-500/30 transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{prospect.prospectName}</div>
                          <div className="text-xs text-gray-500">Step {prospect.currentStep + 1} / {campaign.sequence.length}</div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {prospect.status === 'completed' ? (
                            <CheckCircle size={16} className="text-green-400" />
                          ) : (
                            <Clock size={16} className="text-yellow-400" />
                          )}
                          <button
                            onClick={() => handleRemoveProspect(campaign.id, prospect.prospectId)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Campaign Stats */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-purple-500/10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {campaign.prospects.filter((p) => p.status === 'completed').length}
                  </div>
                  <div className="text-xs text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {campaign.prospects.filter((p) => p.status === 'in-progress').length}
                  </div>
                  <div className="text-xs text-gray-400">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {campaign.prospects.filter((p) => p.status === 'pending').length}
                  </div>
                  <div className="text-xs text-gray-400">Pending</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {campaigns.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-purple-500/50 mb-4" size={48} />
            <p className="text-gray-400 text-lg">No campaigns yet. Create one to get started!</p>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-purple-500/30 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Create New Campaign</h2>
            <input
              type="text"
              placeholder="Campaign name (e.g., Q1 Outreach)"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCampaignName('');
                }}
                className="flex-1 bg-white/5 border border-purple-500/20 hover:border-purple-500/50 text-white font-semibold py-2 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2 rounded-lg transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Prospect Modal */}
      {showAddProspectModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-purple-500/30 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Add Prospect to Campaign</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {prospects.map((prospect) => (
                <button
                  key={prospect.id}
                  onClick={() => setSelectedProspect(prospect)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedProspect?.id === prospect.id
                      ? 'bg-purple-500/30 border-purple-500'
                      : 'bg-white/5 border-purple-500/20 hover:border-purple-500/50'
                  }`}
                >
                  <div className="font-semibold text-white">{prospect.name}</div>
                  <div className="text-sm text-gray-400">{prospect.email}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddProspectModal(false);
                  setSelectedProspect(null);
                }}
                className="flex-1 bg-white/5 border border-purple-500/20 hover:border-purple-500/50 text-white font-semibold py-2 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProspectToCampaign}
                disabled={!selectedProspect}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-all"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
