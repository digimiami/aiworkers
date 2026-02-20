'use client';

import { useState, useEffect } from 'react';
import { Settings, Bell, Save, Check, AlertCircle, Loader, Copy, Mail, Key, User, CreditCard, Shield, Globe, Phone, AtSign, Send, Zap } from 'lucide-react';

interface AppSettings {
  // Profile
  companyName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  website: string;
  // Telegram
  telegramChatId: string;
  enableProposalOpened: boolean;
  enableProspectReplied: boolean;
  enableAppointmentBooked: boolean;
  enableNewLead: boolean;
  // Email
  emailFrom: string;
  emailReplyTo: string;
  emailSignature: string;
  // API Keys
  resendApiKey: string;
  hunterApiKey: string;
  deepseekApiKey: string;
  googleMapsApiKey: string;
  twilioSid: string;
  twilioAuth: string;
  twilioPhone: string;
  telegramBotToken: string;
  // Branding
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
}

const defaultSettings: AppSettings = {
  companyName: 'AI Workers',
  ownerName: '',
  ownerEmail: '',
  ownerPhone: '',
  website: 'https://aiworkers.vip',
  telegramChatId: '',
  enableProposalOpened: true,
  enableProspectReplied: true,
  enableAppointmentBooked: true,
  enableNewLead: true,
  emailFrom: 'contact@aiworkers.vip',
  emailReplyTo: '',
  emailSignature: '',
  resendApiKey: '',
  hunterApiKey: '',
  deepseekApiKey: '',
  googleMapsApiKey: '',
  twilioSid: '',
  twilioAuth: '',
  twilioPhone: '',
  telegramBotToken: '',
  primaryColor: '#8b5cf6',
  accentColor: '#3b82f6',
  logoUrl: '',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [botInfo, setBotInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem('aiworkersSettings');
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
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

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSave = () => {
    setLoading(true);
    try {
      localStorage.setItem('aiworkersSettings', JSON.stringify(settings));
      showMessage('Settings saved successfully!', 'success');
    } catch (error) {
      showMessage('Failed to save settings.', 'error');
    }
    setLoading(false);
  };

  const testTelegram = async () => {
    if (!settings.telegramChatId.trim()) {
      showMessage('Please enter your Telegram Chat ID first', 'error');
      return;
    }
    setTestResults(prev => ({ ...prev, telegram: 'loading' }));
    try {
      const res = await fetch('/api/telegram-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: settings.telegramChatId,
          type: 'proposal_opened',
          prospectName: 'Test Prospect',
          businessName: 'Test Business',
          details: 'This is a test notification from AI Workers Settings',
        }),
      });
      if (res.ok) {
        setTestResults(prev => ({ ...prev, telegram: 'success' }));
        showMessage('Telegram test sent! Check your Telegram.', 'success');
      } else {
        setTestResults(prev => ({ ...prev, telegram: 'error' }));
        showMessage('Telegram test failed. Check your Chat ID.', 'error');
      }
    } catch {
      setTestResults(prev => ({ ...prev, telegram: 'error' }));
      showMessage('Telegram test failed.', 'error');
    }
  };

  const testEmail = async () => {
    if (!settings.ownerEmail.trim()) {
      showMessage('Please enter your email address first', 'error');
      return;
    }
    setTestResults(prev => ({ ...prev, email: 'loading' }));
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: settings.ownerEmail,
          subject: 'AI Workers - Test Email',
          html: '<h2>Test Email from AI Workers</h2><p>If you received this, your email settings are working correctly!</p><p>— AI Workers Team</p>',
        }),
      });
      if (res.ok) {
        setTestResults(prev => ({ ...prev, email: 'success' }));
        showMessage('Test email sent! Check your inbox.', 'success');
      } else {
        setTestResults(prev => ({ ...prev, email: 'error' }));
        showMessage('Email test failed. Check your Resend API key and domain verification.', 'error');
      }
    } catch {
      setTestResults(prev => ({ ...prev, email: 'error' }));
      showMessage('Email test failed.', 'error');
    }
  };

  const testSMS = async () => {
    if (!settings.ownerPhone.trim()) {
      showMessage('Please enter your phone number first', 'error');
      return;
    }
    setTestResults(prev => ({ ...prev, sms: 'loading' }));
    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: settings.ownerPhone,
          message: 'Test SMS from AI Workers. Your SMS settings are working!',
        }),
      });
      if (res.ok) {
        setTestResults(prev => ({ ...prev, sms: 'success' }));
        showMessage('Test SMS sent! Check your phone.', 'success');
      } else {
        setTestResults(prev => ({ ...prev, sms: 'error' }));
        showMessage('SMS test failed. Check your Twilio settings.', 'error');
      }
    } catch {
      setTestResults(prev => ({ ...prev, sms: 'error' }));
      showMessage('SMS test failed.', 'error');
    }
  };

  const testHunter = async () => {
    setTestResults(prev => ({ ...prev, hunter: 'loading' }));
    try {
      const res = await fetch('/api/find-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: 'stripe.com' }),
      });
      const data = await res.json();
      if (data.emails && data.emails.length > 0) {
        setTestResults(prev => ({ ...prev, hunter: 'success' }));
        showMessage(`Hunter.io working! Found ${data.emails.length} emails for stripe.com`, 'success');
      } else {
        setTestResults(prev => ({ ...prev, hunter: 'error' }));
        showMessage('Hunter.io returned no results. Check your API key.', 'error');
      }
    } catch {
      setTestResults(prev => ({ ...prev, hunter: 'error' }));
      showMessage('Hunter.io test failed.', 'error');
    }
  };

  const testDeepSeek = async () => {
    setTestResults(prev => ({ ...prev, deepseek: 'loading' }));
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Business',
          address: '123 Main St',
          rating: 4.0,
          totalReviews: 10,
          types: ['restaurant'],
          hasWebsite: true,
          phone: '555-1234',
        }),
      });
      if (res.ok) {
        setTestResults(prev => ({ ...prev, deepseek: 'success' }));
        showMessage('DeepSeek AI is working!', 'success');
      } else {
        setTestResults(prev => ({ ...prev, deepseek: 'error' }));
        showMessage('DeepSeek test failed. Check your API key.', 'error');
      }
    } catch {
      setTestResults(prev => ({ ...prev, deepseek: 'error' }));
      showMessage('DeepSeek test failed.', 'error');
    }
  };

  const testGoogleMaps = async () => {
    setTestResults(prev => ({ ...prev, google: 'loading' }));
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: 'Miami', niche: 'plumber' }),
      });
      const data = await res.json();
      if (data.businesses && data.businesses.length > 0) {
        setTestResults(prev => ({ ...prev, google: 'success' }));
        showMessage(`Google Maps working! Found ${data.businesses.length} businesses.`, 'success');
      } else {
        setTestResults(prev => ({ ...prev, google: 'error' }));
        showMessage('Google Maps returned no results. Check your API key.', 'error');
      }
    } catch {
      setTestResults(prev => ({ ...prev, google: 'error' }));
      showMessage('Google Maps test failed.', 'error');
    }
  };

  const getTestIcon = (key: string) => {
    const status = testResults[key];
    if (status === 'loading') return <Loader size={14} className="animate-spin text-purple-400" />;
    if (status === 'success') return <Check size={14} className="text-green-400" />;
    if (status === 'error') return <AlertCircle size={14} className="text-red-400" />;
    return null;
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'branding', label: 'Branding', icon: Globe },
  ];

  const inputClass = "w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="text-purple-500" size={28} />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Settings
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
          Save All Settings
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 ${
          messageType === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {messageType === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-purple-500/20 border border-purple-500/40 text-purple-400'
                : 'bg-zinc-900/50 border border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2"><User className="text-purple-400" size={20} /> Business Profile</h2>
          <p className="text-gray-400 text-sm">Your business info is used in proposals, emails, and landing pages.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Company Name</label>
              <input type="text" placeholder="AI Workers" value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Your Name</label>
              <input type="text" placeholder="John Smith" value={settings.ownerName} onChange={e => setSettings({...settings, ownerName: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" placeholder="you@example.com" value={settings.ownerEmail} onChange={e => setSettings({...settings, ownerEmail: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input type="tel" placeholder="+1 (555) 123-4567" value={settings.ownerPhone} onChange={e => setSettings({...settings, ownerPhone: e.target.value})} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Website</label>
              <input type="url" placeholder="https://aiworkers.vip" value={settings.website} onChange={e => setSettings({...settings, website: e.target.value})} className={inputClass} />
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Telegram */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2"><Bell className="text-purple-400" size={20} /> Telegram Notifications</h2>
              {botInfo && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs">
                  <Check size={14} /> Bot Connected: @{botInfo.botUsername}
                </div>
              )}
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-300">
              <strong>How to get your Telegram Chat ID:</strong>
              <ol className="mt-2 ml-4 space-y-1 list-decimal">
                <li>Open Telegram and search for @getidsbot</li>
                <li>Start a chat and send any message</li>
                <li>Copy the Chat ID number from the response</li>
                <li>Paste it below and click &quot;Test Telegram&quot;</li>
              </ol>
            </div>

            <div>
              <label className={labelClass}>Telegram Chat ID</label>
              <div className="flex gap-3">
                <input type="text" placeholder="e.g., 123456789" value={settings.telegramChatId} onChange={e => setSettings({...settings, telegramChatId: e.target.value})} className={inputClass} />
                <button onClick={testTelegram} className="shrink-0 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-2.5 rounded-lg hover:bg-purple-500/20 transition-all flex items-center gap-2 text-sm font-medium">
                  {getTestIcon('telegram') || <Send size={14} />} Test Telegram
                </button>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">Notification Events</h3>
              {[
                { key: 'enableProposalOpened', label: 'Proposal opened by prospect', emoji: '📧' },
                { key: 'enableProspectReplied', label: 'Prospect replies to email', emoji: '💬' },
                { key: 'enableAppointmentBooked', label: 'Appointment booked', emoji: '📅' },
                { key: 'enableNewLead', label: 'New lead captured', emoji: '🎯' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={(settings as any)[item.key]}
                    onChange={e => setSettings({...settings, [item.key]: e.target.checked})}
                    className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-300">{item.emoji} {item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* SMS */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Phone className="text-purple-400" size={20} /> SMS Notifications</h2>
            <p className="text-gray-400 text-sm">Test your Twilio SMS integration.</p>
            <button onClick={testSMS} className="bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-2.5 rounded-lg hover:bg-purple-500/20 transition-all flex items-center gap-2 text-sm font-medium">
              {getTestIcon('sms') || <Send size={14} />} Send Test SMS
            </button>
          </div>
        </div>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2"><Mail className="text-purple-400" size={20} /> Email Settings</h2>
          
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-300">
            <strong>Important:</strong> To send emails from contact@aiworkers.vip, you must verify the aiworkers.vip domain in your <a href="https://resend.com/domains" target="_blank" rel="noopener" className="underline hover:text-yellow-200">Resend dashboard</a>. Without verification, emails will be sent from onboarding@resend.dev.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>From Email</label>
              <input type="email" value={settings.emailFrom} onChange={e => setSettings({...settings, emailFrom: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Reply-To Email</label>
              <input type="email" placeholder="reply@aiworkers.vip" value={settings.emailReplyTo} onChange={e => setSettings({...settings, emailReplyTo: e.target.value})} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email Signature (HTML supported)</label>
            <textarea
              rows={4}
              placeholder="<p>Best regards,<br>Your Name<br>AI Workers | aiworkers.vip</p>"
              value={settings.emailSignature}
              onChange={e => setSettings({...settings, emailSignature: e.target.value})}
              className={inputClass + ' resize-y'}
            />
          </div>

          <button onClick={testEmail} className="bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-2.5 rounded-lg hover:bg-purple-500/20 transition-all flex items-center gap-2 text-sm font-medium">
            {getTestIcon('email') || <Send size={14} />} Send Test Email
          </button>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-xl font-bold flex items-center gap-2"><Key className="text-purple-400" size={20} /> API Keys & Integrations</h2>
            <p className="text-gray-400 text-sm">Manage your API keys. Keys are stored locally in your browser. For production, set them as environment variables in Vercel.</p>

            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 text-sm text-red-300">
              <strong>Security Note:</strong> API keys stored in localStorage are for development/testing only. For production, always use Vercel environment variables.
            </div>

            {/* Google Maps */}
            <div className="bg-black/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2"><Globe size={16} className="text-blue-400" /> Google Maps API</h3>
                <button onClick={testGoogleMaps} className="text-xs bg-purple-500/10 border border-purple-500/30 text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-500/20 transition-all flex items-center gap-1">
                  {getTestIcon('google') || <Zap size={12} />} Test
                </button>
              </div>
              <input type="password" placeholder="AIzaSy..." value={settings.googleMapsApiKey} onChange={e => setSettings({...settings, googleMapsApiKey: e.target.value})} className={inputClass} />
              <p className="text-xs text-gray-500">Used for business search and audit. Get it at console.cloud.google.com</p>
            </div>

            {/* DeepSeek */}
            <div className="bg-black/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2"><Zap size={16} className="text-green-400" /> DeepSeek AI</h3>
                <button onClick={testDeepSeek} className="text-xs bg-purple-500/10 border border-purple-500/30 text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-500/20 transition-all flex items-center gap-1">
                  {getTestIcon('deepseek') || <Zap size={12} />} Test
                </button>
              </div>
              <input type="password" placeholder="sk-..." value={settings.deepseekApiKey} onChange={e => setSettings({...settings, deepseekApiKey: e.target.value})} className={inputClass} />
              <p className="text-xs text-gray-500">Powers AI analysis, proposals, cold emails, and chatbot</p>
            </div>

            {/* Hunter.io */}
            <div className="bg-black/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2"><AtSign size={16} className="text-orange-400" /> Hunter.io</h3>
                <button onClick={testHunter} className="text-xs bg-purple-500/10 border border-purple-500/30 text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-500/20 transition-all flex items-center gap-1">
                  {getTestIcon('hunter') || <Zap size={12} />} Test
                </button>
              </div>
              <input type="password" placeholder="Your Hunter.io API key" value={settings.hunterApiKey} onChange={e => setSettings({...settings, hunterApiKey: e.target.value})} className={inputClass} />
              <p className="text-xs text-gray-500">Email finder and verification. Get it at hunter.io/api-keys</p>
            </div>

            {/* Resend */}
            <div className="bg-black/30 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2"><Mail size={16} className="text-purple-400" /> Resend (Email)</h3>
              <input type="password" placeholder="re_..." value={settings.resendApiKey} onChange={e => setSettings({...settings, resendApiKey: e.target.value})} className={inputClass} />
              <p className="text-xs text-gray-500">Email sending service. Get it at resend.com/api-keys</p>
            </div>

            {/* Twilio */}
            <div className="bg-black/30 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2"><Phone size={16} className="text-cyan-400" /> Twilio (SMS)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Account SID</label>
                  <input type="password" placeholder="AC..." value={settings.twilioSid} onChange={e => setSettings({...settings, twilioSid: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Auth Token</label>
                  <input type="password" placeholder="Your auth token" value={settings.twilioAuth} onChange={e => setSettings({...settings, twilioAuth: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Phone Number</label>
                  <input type="text" placeholder="+1234567890" value={settings.twilioPhone} onChange={e => setSettings({...settings, twilioPhone: e.target.value})} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Telegram Bot */}
            <div className="bg-black/30 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2"><Send size={16} className="text-blue-400" /> Telegram Bot</h3>
              <input type="password" placeholder="Bot token from @BotFather" value={settings.telegramBotToken} onChange={e => setSettings({...settings, telegramBotToken: e.target.value})} className={inputClass} />
              <p className="text-xs text-gray-500">Get it from @BotFather on Telegram</p>
            </div>
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2"><Globe className="text-purple-400" size={20} /> Branding & White Label</h2>
          <p className="text-gray-400 text-sm">Customize how your proposals and landing pages look.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Primary Color</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={settings.primaryColor} onChange={e => setSettings({...settings, primaryColor: e.target.value})} className="w-12 h-10 rounded cursor-pointer border border-zinc-700 bg-transparent" />
                <input type="text" value={settings.primaryColor} onChange={e => setSettings({...settings, primaryColor: e.target.value})} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Accent Color</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={settings.accentColor} onChange={e => setSettings({...settings, accentColor: e.target.value})} className="w-12 h-10 rounded cursor-pointer border border-zinc-700 bg-transparent" />
                <input type="text" value={settings.accentColor} onChange={e => setSettings({...settings, accentColor: e.target.value})} className={inputClass} />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Logo URL</label>
              <input type="url" placeholder="https://example.com/logo.png" value={settings.logoUrl} onChange={e => setSettings({...settings, logoUrl: e.target.value})} className={inputClass} />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-black/30 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4">Preview</h3>
            <div className="flex items-center gap-4">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-contain" />
              ) : (
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}>
                  {settings.companyName?.[0] || 'A'}
                </div>
              )}
              <div>
                <p className="font-bold text-white">{settings.companyName || 'AI Workers'}</p>
                <p className="text-sm text-gray-400">{settings.website || 'https://aiworkers.vip'}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <div className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}>
                Primary Button
              </div>
              <div className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: settings.primaryColor, color: settings.primaryColor }}>
                Secondary Button
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button (bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
          Save All Settings
        </button>
      </div>
    </div>
  );
}
