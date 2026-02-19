'use client';

import { useState, useEffect } from 'react';
import { Settings, Bell, Save, Check, AlertCircle, Loader, Copy, ExternalLink } from 'lucide-react';

interface NotificationSettings {
  telegramChatId: string;
  enableProposalOpened: boolean;
  enableProspectReplied: boolean;
  enableAppointmentBooked: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    telegramChatId: '',
    enableProposalOpened: true,
    enableProspectReplied: true,
    enableAppointmentBooked: true,
  });

  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [botInfo, setBotInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('telegramSettings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }

    // Check bot connection
    checkBotConnection();
  }, []);

  const checkBotConnection = async () => {
    try {
      const response = await fetch('/api/telegram-notify');
      if (response.ok) {
        const data = await response.json();
        setBotInfo(data);
      }
    } catch (error) {
      console.error('Error checking bot connection:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings.telegramChatId.trim()) {
      setMessage('Please enter your Telegram Chat ID');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Save to localStorage
      localStorage.setItem('telegramSettings', JSON.stringify(settings));
      setMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!settings.telegramChatId.trim()) {
      setMessage('Please enter your Telegram Chat ID first');
      return;
    }

    setTestLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/telegram-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: settings.telegramChatId,
          type: 'proposal_opened',
          prospectName: 'Test Prospect',
          businessName: 'Test Business',
          details: 'This is a test notification',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      setMessage('Test notification sent successfully! Check your Telegram.');
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to send test notification. Please check your Chat ID.');
    } finally {
      setTestLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(settings.telegramChatId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="text-purple-500" size={32} />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Settings
          </h1>
        </div>

        {/* Telegram Connection Status */}
        <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bell size={24} />
              Telegram Bot Connection
            </h2>
            {botInfo && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
                <Check size={16} className="text-green-400" />
                <span className="text-sm text-green-300">Connected</span>
              </div>
            )}
          </div>

          {botInfo && (
            <div className="p-4 bg-black/30 rounded-lg border border-purple-500/10 mb-4">
              <div className="text-sm text-gray-300">
                <p>
                  <strong>Bot Name:</strong> {botInfo.botName}
                </p>
                <p>
                  <strong>Bot Username:</strong> @{botInfo.botUsername}
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-300">
              <strong>How to get your Telegram Chat ID:</strong>
            </p>
            <ol className="text-sm text-blue-300 mt-2 ml-4 space-y-1 list-decimal">
              <li>Start a chat with @getidsbot on Telegram</li>
              <li>Send any message to the bot</li>
              <li>Copy your Chat ID from the response</li>
              <li>Paste it below</li>
            </ol>
          </div>
        </div>

        {/* Telegram Chat ID */}
        <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Telegram Chat ID</h2>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Your Chat ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., 123456789"
                value={settings.telegramChatId}
                onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                className="flex-1 bg-black/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-white/5 border border-purple-500/20 hover:border-purple-500/50 text-gray-300 rounded-lg transition-all flex items-center gap-2"
              >
                {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3 mb-6 p-4 bg-black/30 rounded-lg border border-purple-500/10">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Notification Preferences</h3>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableProposalOpened}
                onChange={(e) =>
                  setSettings({ ...settings, enableProposalOpened: e.target.checked })
                }
                className="w-4 h-4 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-300">📧 Notify when proposal is opened</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableProspectReplied}
                onChange={(e) =>
                  setSettings({ ...settings, enableProspectReplied: e.target.checked })
                }
                className="w-4 h-4 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-300">💬 Notify when prospect replies</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAppointmentBooked}
                onChange={(e) =>
                  setSettings({ ...settings, enableAppointmentBooked: e.target.checked })
                }
                className="w-4 h-4 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-300">📅 Notify when appointment is booked</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Settings
                </>
              )}
            </button>

            <button
              onClick={handleTestNotification}
              disabled={testLoading || !settings.telegramChatId.trim()}
              className="flex-1 bg-white/5 border border-purple-500/20 hover:border-purple-500/50 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              {testLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Bell size={20} />
                  Send Test
                </>
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`p-4 rounded-lg border flex items-start gap-3 ${
            message.includes('successfully') || message.includes('Check')
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            {message.includes('successfully') || message.includes('Check') ? (
              <Check className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
            ) : (
              <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={20} />
            )}
            <p className={message.includes('successfully') || message.includes('Check')
              ? 'text-green-300'
              : 'text-red-300'
            }>
              {message}
            </p>
          </div>
        )}

        {/* Additional Settings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Email Settings */}
          <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">📧 Email Settings</h2>
            <p className="text-sm text-gray-400 mb-4">Configure your email sending preferences</p>
            <button className="w-full bg-white/5 border border-purple-500/20 hover:border-purple-500/50 text-white font-semibold py-2 rounded-lg transition-all">
              Configure
            </button>
          </div>

          {/* API Keys */}
          <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">🔑 API Keys</h2>
            <p className="text-sm text-gray-400 mb-4">Manage your external API integrations</p>
            <button className="w-full bg-white/5 border border-purple-500/20 hover:border-purple-500/50 text-white font-semibold py-2 rounded-lg transition-all">
              Manage
            </button>
          </div>

          {/* Account Settings */}
          <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">👤 Account Settings</h2>
            <p className="text-sm text-gray-400 mb-4">Update your profile and preferences</p>
            <button className="w-full bg-white/5 border border-purple-500/20 hover:border-purple-500/50 text-white font-semibold py-2 rounded-lg transition-all">
              Edit Profile
            </button>
          </div>

          {/* Billing */}
          <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">💳 Billing</h2>
            <p className="text-sm text-gray-400 mb-4">Manage your subscription and billing</p>
            <button className="w-full bg-white/5 border border-purple-500/20 hover:border-purple-500/50 text-white font-semibold py-2 rounded-lg transition-all">
              View Billing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
