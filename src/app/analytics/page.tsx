'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, MessageSquare, CheckCircle, DollarSign } from 'lucide-react';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  preferredService: string;
  selectedDate: string;
  selectedTime: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface ProposalData {
  week: string;
  sent: number;
}

export default function Analytics() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalProposals: 0,
    openRate: 0,
    replyRate: 0,
    conversionRate: 0,
    totalRevenue: 0,
  });

  const [proposalsPerWeek, setProposalsPerWeek] = useState<ProposalData[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'bookings' | 'activity'>('overview');

  useEffect(() => {
    // Load bookings from localStorage
    const storedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    setBookings(storedBookings);

    // Load proposal settings
    const proposalSettings = JSON.parse(localStorage.getItem('proposalSettings') || '{}');

    // Generate sample stats
    const totalProposals = 24;
    const openRate = 68;
    const replyRate = 42;
    const conversionRate = 18;
    const totalRevenue = 47952;

    setStats({
      totalProposals,
      openRate,
      replyRate,
      conversionRate,
      totalRevenue,
    });

    // Generate sample weekly data
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      weeks.push({
        week: `Week ${8 - i}`,
        sent: Math.floor(Math.random() * 10) + 2,
      });
    }
    setProposalsPerWeek(weeks);
  }, []);

  const conversionFunnelData = [
    { stage: 'Sent', count: stats.totalProposals, color: 'bg-blue-500' },
    { stage: 'Opened', count: Math.round(stats.totalProposals * (stats.openRate / 100)), color: 'bg-purple-500' },
    { stage: 'Replied', count: Math.round(stats.totalProposals * (stats.replyRate / 100)), color: 'bg-pink-500' },
    { stage: 'Meeting', count: Math.round(stats.totalProposals * (stats.replyRate / 100) * 0.6), color: 'bg-orange-500' },
    { stage: 'Closed', count: Math.round(stats.totalProposals * (stats.conversionRate / 100)), color: 'bg-green-500' },
  ];

  const topNiches = [
    { name: 'E-commerce', proposals: 8, revenue: 15984 },
    { name: 'SaaS', proposals: 6, revenue: 11988 },
    { name: 'Services', proposals: 5, revenue: 9980 },
    { name: 'Real Estate', proposals: 3, revenue: 5994 },
    { name: 'Healthcare', proposals: 2, revenue: 3996 },
  ];

  const monthlyRevenue = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 16000 },
    { month: 'May', revenue: 19000 },
    { month: 'Jun', revenue: 20000 },
  ];

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

  const recentActivity = [
    { type: 'proposal_sent', description: 'Sent proposal to Tech Startup Inc', time: '2 hours ago' },
    { type: 'email_opened', description: 'Proposal opened by John Smith', time: '4 hours ago' },
    { type: 'booking_created', description: 'New booking from Sarah Johnson', time: '6 hours ago' },
    { type: 'proposal_sent', description: 'Sent proposal to Digital Agency', time: '1 day ago' },
    { type: 'reply_received', description: 'Reply received from Marketing Co', time: '2 days ago' },
  ];

  const handleDeleteBooking = (id: string) => {
    const updated = bookings.filter(b => b.id !== id);
    setBookings(updated);
    localStorage.setItem('bookings', JSON.stringify(updated));
  };

  const handleUpdateBookingStatus = (id: string, status: 'pending' | 'completed' | 'cancelled') => {
    const updated = bookings.map(b =>
      b.id === id ? { ...b, status } : b
    );
    setBookings(updated);
    localStorage.setItem('bookings', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Track your proposals, bookings, and revenue
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/5 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Proposals</p>
                  <p className="text-3xl font-bold text-white">{stats.totalProposals}</p>
                </div>
                <Eye className="text-purple-500" size={32} />
              </div>
            </div>

            <div className="bg-white/5 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Open Rate</p>
                  <p className="text-3xl font-bold text-white">{stats.openRate}%</p>
                </div>
                <TrendingUp className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-white/5 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Reply Rate</p>
                  <p className="text-3xl font-bold text-white">{stats.replyRate}%</p>
                </div>
                <MessageSquare className="text-pink-500" size={32} />
              </div>
            </div>

            <div className="bg-white/5 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Conversion Rate</p>
                  <p className="text-3xl font-bold text-white">{stats.conversionRate}%</p>
                </div>
                <CheckCircle className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-white/5 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">${(stats.totalRevenue / 1000).toFixed(1)}k</p>
                </div>
                <DollarSign className="text-green-500" size={32} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-purple-500/20">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-6 py-3 font-semibold transition-colors ${
                selectedTab === 'overview'
                  ? 'text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab('bookings')}
              className={`px-6 py-3 font-semibold transition-colors ${
                selectedTab === 'bookings'
                  ? 'text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setSelectedTab('activity')}
              className={`px-6 py-3 font-semibold transition-colors ${
                selectedTab === 'activity'
                  ? 'text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Activity
            </button>
          </div>

          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-8">
              {/* Proposals Per Week */}
              <div className="bg-white/5 border border-purple-500/20 rounded-lg p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-6">Proposals Sent (Last 8 Weeks)</h2>
                <div className="flex items-end justify-between h-64 gap-2">
                  {proposalsPerWeek.map((week, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-purple-500 to-blue-500 rounded-t"
                        style={{ height: `${(week.sent / 12) * 100}%` }}
                      />
                      <p className="text-gray-400 text-sm mt-4">{week.week}</p>
                      <p className="text-white font-semibold">{week.sent}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white/5 border border-purple-500/20 rounded-lg p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-6">Conversion Funnel</h2>
                <div className="space-y-4">
                  {conversionFunnelData.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-300 font-semibold">{item.stage}</p>
                        <p className="text-white font-bold">{item.count}</p>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-8 overflow-hidden">
                        <div
                          className={`${item.color} h-full flex items-center justify-end pr-3 text-white font-semibold text-sm`}
                          style={{ width: `${(item.count / stats.totalProposals) * 100}%` }}
                        >
                          {((item.count / stats.totalProposals) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue by Month */}
              <div className="bg-white/5 border border-purple-500/20 rounded-lg p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-6">Revenue by Month</h2>
                <div className="flex items-end justify-between h-64 gap-2">
                  {monthlyRevenue.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-green-500 to-emerald-500 rounded-t"
                        style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                      />
                      <p className="text-gray-400 text-sm mt-4">{item.month}</p>
                      <p className="text-white font-semibold text-sm">${(item.revenue / 1000).toFixed(0)}k</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performing Niches */}
              <div className="bg-white/5 border border-purple-500/20 rounded-lg p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-6">Top Performing Niches</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-500/20">
                        <th className="text-left py-4 px-4 text-gray-400">Niche</th>
                        <th className="text-left py-4 px-4 text-gray-400">Proposals</th>
                        <th className="text-left py-4 px-4 text-gray-400">Revenue</th>
                        <th className="text-left py-4 px-4 text-gray-400">Avg Deal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topNiches.map((niche, idx) => (
                        <tr key={idx} className="border-b border-purple-500/10 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 text-white font-semibold">{niche.name}</td>
                          <td className="py-4 px-4 text-gray-300">{niche.proposals}</td>
                          <td className="py-4 px-4 text-green-400 font-semibold">${niche.revenue.toLocaleString()}</td>
                          <td className="py-4 px-4 text-gray-300">${(niche.revenue / niche.proposals).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {selectedTab === 'bookings' && (
            <div className="bg-white/5 border border-purple-500/20 rounded-lg p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6">Appointment Bookings</h2>
              {bookings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No bookings yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-500/20">
                        <th className="text-left py-4 px-4 text-gray-400">Name</th>
                        <th className="text-left py-4 px-4 text-gray-400">Company</th>
                        <th className="text-left py-4 px-4 text-gray-400">Date</th>
                        <th className="text-left py-4 px-4 text-gray-400">Time</th>
                        <th className="text-left py-4 px-4 text-gray-400">Service</th>
                        <th className="text-left py-4 px-4 text-gray-400">Status</th>
                        <th className="text-left py-4 px-4 text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-purple-500/10 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 text-white font-semibold">{booking.name}</td>
                          <td className="py-4 px-4 text-gray-300">{booking.businessName}</td>
                          <td className="py-4 px-4 text-gray-300">{booking.selectedDate}</td>
                          <td className="py-4 px-4 text-gray-300">{booking.selectedTime}</td>
                          <td className="py-4 px-4 text-gray-300">{booking.preferredService}</td>
                          <td className="py-4 px-4">
                            <select
                              value={booking.status}
                              onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value as any)}
                              className={`px-3 py-1 rounded text-sm font-semibold border-0 focus:outline-none ${
                                booking.status === 'completed'
                                  ? 'bg-green-500/20 text-green-300'
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-500/20 text-red-300'
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="text-red-400 hover:text-red-300 font-semibold text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {selectedTab === 'activity' && (
            <div className="bg-white/5 border border-purple-500/20 rounded-lg p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-4 pb-4 border-b border-purple-500/10 last:border-0">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      activity.type === 'proposal_sent' ? 'bg-blue-500' :
                      activity.type === 'email_opened' ? 'bg-purple-500' :
                      activity.type === 'booking_created' ? 'bg-green-500' :
                      'bg-pink-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-white font-semibold">{activity.description}</p>
                      <p className="text-gray-400 text-sm">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
