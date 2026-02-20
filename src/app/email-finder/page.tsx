'use client';

import { useState } from 'react';
import { Search, Mail, CheckCircle, XCircle, AlertCircle, Shield, User, Building, Globe, Loader2, Copy, Check, Zap, ArrowRight } from 'lucide-react';

interface EmailResult {
  email: string;
  type: string;
  confidence: number;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  sources: number;
}

interface VerifyResult {
  email: string;
  status: string;
  result: string;
  score: number;
  isDisposable: boolean;
  isWebmail: boolean;
  isMxRecordFound: boolean;
}

export default function EmailFinderPage() {
  const [domain, setDomain] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);

  const [copiedEmail, setCopiedEmail] = useState('');

  const handleSearch = async () => {
    if (!domain) return;
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch('/api/find-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, firstName, lastName }),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleVerify = async (email?: string) => {
    const emailToVerify = email || verifyEmail;
    if (!emailToVerify) return;
    setVerifying(true);
    setVerifyResult(null);
    setVerifyEmail(emailToVerify);
    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToVerify }),
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch (err) {
      console.error(err);
    }
    setVerifying(false);
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(''), 2000);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (confidence >= 50) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'valid' || status === 'deliverable') return <CheckCircle className="text-green-400" size={18} />;
    if (status === 'invalid' || status === 'undeliverable') return <XCircle className="text-red-400" size={18} />;
    return <AlertCircle className="text-yellow-400" size={18} />;
  };

  const getStatusColor = (result: string) => {
    if (result === 'deliverable') return 'text-green-400 bg-green-500/10';
    if (result === 'undeliverable') return 'text-red-400 bg-red-500/10';
    return 'text-yellow-400 bg-yellow-500/10';
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Hero */}
      <section className="text-center space-y-4 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-4 py-2 rounded-full text-purple-400 text-sm">
          <Mail size={16} />
          Powered by Hunter.io
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Email Finder</span> & Verifier
        </h1>
        <p className="text-gray-400 text-lg">
          Find business emails by domain. Verify any email before sending. Get contact info for your prospects.
        </p>
      </section>

      {/* Email Finder */}
      <section className="max-w-4xl mx-auto">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Search className="text-purple-400" size={20} />
            Find Emails by Domain
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Domain (required)</label>
              <div className="relative">
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">First Name (optional)</label>
              <input
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Last Name (optional)</label>
              <input
                type="text"
                placeholder="Smith"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={!domain || loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            {loading ? 'Searching...' : 'Find Emails'}
          </button>
        </div>
      </section>

      {/* Search Results */}
      {results && (
        <section className="max-w-4xl mx-auto space-y-6">
          {/* Company Info */}
          {results.organization && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Building size={18} className="text-purple-400" />
                  <span className="font-bold text-white">{results.organization}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Globe size={14} />
                  {results.domain}
                </div>
                {results.pattern && (
                  <div className="bg-purple-500/10 border border-purple-500/30 text-purple-400 px-3 py-1 rounded-full text-xs">
                    Pattern: {results.pattern}
                  </div>
                )}
                <div className="text-gray-400 text-sm">
                  {results.emails.length} email{results.emails.length !== 1 ? 's' : ''} found
                </div>
              </div>
            </div>
          )}

          {/* Specific Email Result */}
          {results.specificEmail && (
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-green-400">
                <Zap size={18} className="fill-green-400" />
                Best Match Found
              </h3>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xl font-mono text-white">{results.specificEmail.email}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getConfidenceColor(results.specificEmail.confidence)}`}>
                  {results.specificEmail.confidence}% confidence
                </span>
                <button onClick={() => copyEmail(results.specificEmail.email)} className="text-gray-400 hover:text-white transition-colors">
                  {copiedEmail === results.specificEmail.email ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
                <button onClick={() => handleVerify(results.specificEmail.email)} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
                  <Shield size={14} /> Verify
                </button>
              </div>
              {results.specificEmail.position && (
                <p className="text-gray-400 text-sm mt-2">{results.specificEmail.position}</p>
              )}
            </div>
          )}

          {/* All Emails */}
          {results.emails.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Mail className="text-purple-400" size={18} />
                All Emails Found ({results.emails.length})
              </h3>
              <div className="space-y-3">
                {results.emails.map((e: EmailResult, i: number) => (
                  <div key={i} className="flex items-center gap-4 bg-black/30 rounded-xl p-4 hover:bg-black/50 transition-all flex-wrap">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">
                      {e.firstName?.[0] || e.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-white text-sm">{e.email}</span>
                        <button onClick={() => copyEmail(e.email)} className="text-gray-500 hover:text-white transition-colors">
                          {copiedEmail === e.email ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                        {e.firstName && <span><User size={12} className="inline mr-1" />{e.firstName} {e.lastName}</span>}
                        {e.position && <span>{e.position}</span>}
                        {e.department && <span className="bg-zinc-800 px-2 py-0.5 rounded">{e.department}</span>}
                        <span className="bg-zinc-800 px-2 py-0.5 rounded">{e.type}</span>
                        <span>{e.sources} source{e.sources !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getConfidenceColor(e.confidence)}`}>
                        {e.confidence}%
                      </span>
                      <button
                        onClick={() => handleVerify(e.email)}
                        className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/30 hover:bg-purple-500/20 transition-all"
                      >
                        <Shield size={12} /> Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guessed Emails */}
          {results.guessedEmails && results.guessedEmails.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Zap className="text-yellow-400" size={18} />
                Pattern-Based Guesses
              </h3>
              <p className="text-gray-400 text-sm mb-4">No verified emails found. These are common email patterns — verify before sending.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {results.guessedEmails.map((email: string, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                    <span className="font-mono text-sm text-gray-300">{email}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => copyEmail(email)} className="text-gray-500 hover:text-white transition-colors">
                        {copiedEmail === email ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => handleVerify(email)}
                        className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1"
                      >
                        <Shield size={12} /> Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Email Verifier */}
      <section className="max-w-4xl mx-auto">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="text-green-400" size={20} />
            Email Verifier
          </h2>
          <p className="text-gray-400 text-sm mb-4">Verify any email address before sending to avoid bounces and protect your sender reputation.</p>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                placeholder="someone@example.com"
                value={verifyEmail}
                onChange={(e) => setVerifyEmail(e.target.value)}
                className="w-full bg-black/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={!verifyEmail || verifying}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2 shrink-0"
            >
              {verifying ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
              {verifying ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          {/* Verify Result */}
          {verifyResult && (
            <div className="mt-6 bg-black/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon(verifyResult.result)}
                <span className="font-mono text-white">{verifyResult.email}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(verifyResult.result)}`}>
                  {verifyResult.result?.toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="text-sm font-bold text-white capitalize">{verifyResult.status}</p>
                </div>
                <div className="bg-zinc-900/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Score</p>
                  <p className={`text-sm font-bold ${verifyResult.score >= 70 ? 'text-green-400' : verifyResult.score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {verifyResult.score}/100
                  </p>
                </div>
                <div className="bg-zinc-900/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">MX Records</p>
                  <p className="text-sm font-bold text-white">{verifyResult.isMxRecordFound ? '✅ Found' : '❌ Not Found'}</p>
                </div>
                <div className="bg-zinc-900/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Disposable</p>
                  <p className="text-sm font-bold text-white">{verifyResult.isDisposable ? '⚠️ Yes' : '✅ No'}</p>
                </div>
              </div>

              {verifyResult.result === 'deliverable' && (
                <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle size={16} />
                  This email is safe to send to. Low bounce risk.
                </div>
              )}
              {verifyResult.result === 'risky' && (
                <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-yellow-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  This email might bounce. Proceed with caution.
                </div>
              )}
              {verifyResult.result === 'undeliverable' && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
                  <XCircle size={16} />
                  This email will likely bounce. Do not send.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Tips */}
      <section className="max-w-4xl mx-auto">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-bold mb-4">Tips for Finding Business Emails</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-start gap-2">
              <ArrowRight size={14} className="text-purple-400 mt-1 shrink-0" />
              <span>Extract the domain from the business website (e.g., joes-plumbing.com)</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight size={14} className="text-purple-400 mt-1 shrink-0" />
              <span>Always verify emails before sending to protect your sender reputation</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight size={14} className="text-purple-400 mt-1 shrink-0" />
              <span>Use the owner's name from Google Maps for more accurate results</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight size={14} className="text-purple-400 mt-1 shrink-0" />
              <span>Emails with 80%+ confidence are usually safe to send to</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight size={14} className="text-purple-400 mt-1 shrink-0" />
              <span>Common patterns: info@, contact@, firstname@domain.com</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight size={14} className="text-purple-400 mt-1 shrink-0" />
              <span>If no emails found, try the pattern guesses and verify each one</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
