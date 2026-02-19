'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, RefreshCw, Loader } from 'lucide-react';

interface Prospect {
  id: string;
  name: string;
  business: string;
  email: string;
  auditFindings?: string;
}

interface GeneratedEmail {
  subject: string;
  body: string;
  prospectName: string;
  businessName: string;
  email: string;
}

export default function ColdEmailsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [tone, setTone] = useState<'professional' | 'friendly' | 'urgent'>('professional');
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [editedBody, setEditedBody] = useState('');
  const [editedSubject, setEditedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  // Load prospects from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('prospects');
    if (stored) {
      try {
        setProspects(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse prospects:', e);
      }
    }
  }, []);

  const handleGenerateEmail = async () => {
    if (!selectedProspect) {
      setMessage('Please select a prospect');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/generate-cold-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectName: selectedProspect.name,
          businessName: selectedProspect.business,
          auditFindings: selectedProspect.auditFindings || 'General business optimization needed',
          tone,
          email: selectedProspect.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate email');
      }

      const data = await response.json();
      setGeneratedEmail(data);
      setEditedSubject(data.subject);
      setEditedBody(data.body);
      setMessage('Email generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to generate email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!generatedEmail) return;

    setSending(true);
    setMessage('');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: generatedEmail.email,
          subject: editedSubject,
          body: editedBody,
          prospectName: generatedEmail.prospectName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setMessage('Email sent successfully!');
      setGeneratedEmail(null);
      setEditedBody('');
      setEditedSubject('');
      setSelectedProspect(null);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Mail className="text-purple-500" size={32} />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            AI Cold Email Writer
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prospect Selection */}
          <div className="lg:col-span-1 bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Select Prospect</h2>
            
            {prospects.length === 0 ? (
              <p className="text-gray-400">No prospects found. Create prospects in the CRM first.</p>
            ) : (
              <div className="space-y-3">
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
                    <div className="text-sm text-gray-400">{prospect.business}</div>
                    <div className="text-xs text-gray-500">{prospect.email}</div>
                  </button>
                ))}
              </div>
            )}

            {selectedProspect && (
              <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h3 className="font-semibold text-white mb-2">Selected</h3>
                <div className="text-sm text-gray-300">
                  <p><strong>{selectedProspect.name}</strong></p>
                  <p>{selectedProspect.business}</p>
                </div>
              </div>
            )}
          </div>

          {/* Email Generation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tone Selection */}
            <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Email Tone</h2>
              <div className="grid grid-cols-3 gap-3">
                {(['professional', 'friendly', 'urgent'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`py-2 px-4 rounded-lg border transition-all capitalize ${
                      tone === t
                        ? 'bg-purple-500/30 border-purple-500 text-white'
                        : 'bg-white/5 border-purple-500/20 text-gray-300 hover:border-purple-500/50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateEmail}
                disabled={!selectedProspect || loading}
                className="w-full mt-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw size={20} />
                    Generate Email
                  </>
                )}
              </button>
            </div>

            {/* Generated Email */}
            {generatedEmail && (
              <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Generated Email</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Subject</label>
                    <input
                      type="text"
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      className="w-full bg-black/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Email Body</label>
                    <textarea
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      rows={10}
                      className="w-full bg-black/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSendEmail}
                      disabled={sending}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                    >
                      {sending ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Send Email
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedEmail(null);
                        setEditedBody('');
                        setEditedSubject('');
                      }}
                      className="flex-1 bg-white/5 border border-purple-500/20 hover:border-purple-500/50 text-white font-semibold py-3 rounded-lg transition-all"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {message && (
              <div className={`p-4 rounded-lg border ${
                message.includes('successfully')
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
