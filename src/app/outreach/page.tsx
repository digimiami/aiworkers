'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  History, 
  Loader2, 
  AlertCircle,
  Search,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SentOutreach {
  id: string;
  businessId: string;
  businessName: string;
  type: 'email' | 'sms';
  status: 'sent' | 'opened' | 'replied' | 'failed';
  dateSent: string;
  recipient: string;
  contentSnippet: string;
  fullContent?: string;
  replies?: OutreachReply[];
}

interface OutreachReply {
  id: string;
  content: string;
  dateSent: string;
  sender: 'us' | 'them';
}

interface Business {
  id: string;
  name: string;
  phone: string;
  website: string | null;
}

export default function OutreachPage() {
  const [outreachHistory, setOutreachHistory] = useState<SentOutreach[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [outreachType, setOutreachType] = useState<'email' | 'sms'>('email');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [findingEmail, setFindingEmail] = useState(false);
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Load history
    const savedHistory = JSON.parse(localStorage.getItem('outreach_history') || '[]');
    setOutreachHistory(savedHistory);
  }, []);

  useEffect(() => {
    // Load selected business if any
    const businessId = new URLSearchParams(window.location.search).get('businessId');
    if (businessId) {
      const saved = JSON.parse(localStorage.getItem('prospects') || '[]');
      const found = saved.find((p: any) => p.id === businessId);
      if (found) {
        setSelectedBusiness(found);
        setRecipient(outreachType === 'email' ? 'onboarding@resend.dev' : found.phone);
        setMessage(`We've analyzed ${found.name} and found several areas where we can help you grow. Check out our proposal!`);
        
        // Auto-find email if email type and website available
        if (outreachType === 'email' && found.website) {
          findEmailForBusiness(found);
        }
      }
    }
  }, [outreachType]);

  const findEmailForBusiness = async (business: Business) => {
    if (!business.website) return;
    
    setFindingEmail(true);
    try {
      // Extract domain from website
      const url = new URL(business.website.startsWith('http') ? business.website : `https://${business.website}`);
      const domain = url.hostname.replace('www.', '');
      
      const response = await axios.post('/api/find-email', {
        domain: domain,
        companyName: business.name
      });
      
      if (response.data.emails && response.data.emails.length > 0) {
        const primaryEmail = response.data.emails[0].email;
        setRecipient(primaryEmail);
      } else if (response.data.guessedEmails && response.data.guessedEmails.length > 0) {
        setRecipient(response.data.guessedEmails[0]);
      }
    } catch (err) {
      console.error('Error finding email:', err);
    } finally {
      setFindingEmail(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness || !recipient) return;

    setIsSending(true);
    setStatusMessage(null);
    try {
      let res;
      if (outreachType === 'email') {
        res = await axios.post('/api/send-email', {
          email: recipient,
          businessName: selectedBusiness.name,
          content: message
        });
      } else {
        res = await axios.post('/api/send-sms', {
          to: recipient,
          businessName: selectedBusiness.name,
          message: message
        });
      }

      const newOutreach: SentOutreach = {
        id: Math.random().toString(36).substring(7),
        businessId: selectedBusiness.id,
        businessName: selectedBusiness.name,
        type: outreachType,
        status: 'sent',
        dateSent: new Date().toISOString(),
        recipient: recipient,
        contentSnippet: message.substring(0, 100),
        fullContent: message,
        replies: []
      };

      const updatedHistory = [newOutreach, ...outreachHistory];
      setOutreachHistory(updatedHistory);
      localStorage.setItem('outreach_history', JSON.stringify(updatedHistory));
      
      setStatusMessage({ type: 'success', text: `Successfully sent ${outreachType} to ${selectedBusiness.name}!` });
      setMessage('');
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Failed to send ${outreachType}. Please check your configuration.` });
    } finally {
      setIsSending(false);
    }
  };

  const handleReply = async (outreachId: string) => {
    const reply = replyContent[outreachId];
    if (!reply) return;

    const outreach = outreachHistory.find(o => o.id === outreachId);
    if (!outreach) return;

    try {
      if (outreach.type === 'email') {
        await axios.post('/api/send-email', {
          email: outreach.recipient,
          businessName: outreach.businessName,
          content: reply
        });
      } else {
        await axios.post('/api/send-sms', {
          to: outreach.recipient,
          businessName: outreach.businessName,
          message: reply
        });
      }

      const newReply: OutreachReply = {
        id: Math.random().toString(36).substring(7),
        content: reply,
        dateSent: new Date().toISOString(),
        sender: 'us'
      };

      const updatedHistory = outreachHistory.map(o => {
        if (o.id === outreachId) {
          return {
            ...o,
            replies: [...(o.replies || []), newReply],
            status: 'replied' as const
          };
        }
        return o;
      });

      setOutreachHistory(updatedHistory);
      localStorage.setItem('outreach_history', JSON.stringify(updatedHistory));
      setReplyContent({ ...replyContent, [outreachId]: '' });
      setStatusMessage({ type: 'success', text: 'Reply sent successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to send reply.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Send className="text-blue-500" />
            Outreach Center
          </h1>
          <p className="text-zinc-400">Connect with prospects and track your conversations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Send Form */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-6 sticky top-24">
            <h3 className="font-bold text-lg">New Outreach</h3>
            
            {selectedBusiness ? (
              <form onSubmit={handleSend} className="space-y-4">
                <div className="p-4 bg-black rounded-2xl border border-zinc-800">
                  <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Target Business</p>
                  <p className="font-bold">{selectedBusiness.name}</p>
                </div>

                <div className="flex gap-2 p-1 bg-black rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setOutreachType('email')}
                    className={cn("flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", outreachType === 'email' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}
                  >
                    <Mail size={16} /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutreachType('sms')}
                    className={cn("flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", outreachType === 'sms' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}
                  >
                    <MessageSquare size={16} /> SMS
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Recipient</label>
                    {selectedBusiness?.website && outreachType === 'email' && (
                      <button
                        type="button"
                        onClick={() => findEmailForBusiness(selectedBusiness)}
                        disabled={findingEmail}
                        className="text-xs text-blue-500 hover:text-blue-400 disabled:opacity-50"
                      >
                        {findingEmail ? 'Finding...' : 'Auto-find'}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder={outreachType === 'email' ? "Email address" : "Phone number"}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 uppercase font-bold">Message Content</label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                    placeholder="Write your outreach message..."
                  />
                </div>

                {statusMessage && (
                  <div className={cn("p-3 rounded-xl text-xs flex items-center gap-2", statusMessage.type === 'success' ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20")}>
                    {statusMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    {statusMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSending || !recipient || !message}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  Send {outreachType === 'email' ? 'Email' : 'SMS'}
                </button>
              </form>
            ) : (
              <div className="text-center py-10 space-y-4">
                <Search className="mx-auto text-zinc-700" size={40} />
                <p className="text-sm text-zinc-500">Select a prospect from the dashboard to start outreach.</p>
                <Link href="/dashboard" className="inline-block text-xs font-bold text-blue-500 hover:underline">
                  Browse Prospects
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <History size={18} className="text-zinc-500" />
                Recent Activity
              </h3>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-lg">{outreachHistory.length} Total</span>
            </div>
            
            <div className="divide-y divide-zinc-800">
              {outreachHistory.length > 0 ? outreachHistory.map((item) => (
                <div key={item.id} className="p-6 hover:bg-white/5 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl", item.type === 'email' ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500")}>
                        {item.type === 'email' ? <Mail size={18} /> : <MessageSquare size={18} />}
                      </div>
                      <div>
                        <h4 className="font-bold">{item.businessName}</h4>
                        <p className="text-xs text-zinc-500">{item.recipient}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border", 
                        item.status === 'sent' ? "text-blue-400 border-blue-500/20 bg-blue-500/5" : 
                        item.status === 'opened' ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" :
                        item.status === 'replied' ? "text-green-400 border-green-500/20 bg-green-500/5" :
                        "text-red-400 border-red-500/20 bg-red-500/5"
                      )}>
                        {item.status}
                      </span>
                      <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(item.dateSent).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-2 italic">&quot;{item.contentSnippet}...&quot;</p>
                  <div className="mt-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setExpandedThreadId(expandedThreadId === item.id ? null : item.id)} className="text-xs font-bold text-blue-500 flex items-center gap-1">
                      {expandedThreadId === item.id ? 'Hide' : 'View'} Thread <ArrowRight size={12} />
                    </button>
                    <Link href={`/proposals?businessId=${item.businessId}`} className="text-xs font-bold text-zinc-500 flex items-center gap-1">
                      View Proposal <ExternalLink size={12} />
                    </Link>
                  </div>
                  
                  {expandedThreadId === item.id && (
                    <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
                      <div className="bg-black/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                        <p className="text-xs font-bold text-zinc-400 mb-2">Original Message:</p>
                        <p className="text-sm text-zinc-300">{item.fullContent || item.contentSnippet}</p>
                      </div>
                      
                      {item.replies && item.replies.length > 0 && (
                        <div className="space-y-2">
                          {item.replies.map(reply => (
                            <div key={reply.id} className="bg-zinc-800/50 rounded-lg p-3">
                              <p className="text-xs text-zinc-400 mb-1">{reply.sender === 'us' ? 'Our Reply' : 'Their Reply'} - {new Date(reply.dateSent).toLocaleDateString()}</p>
                              <p className="text-sm text-zinc-300">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <textarea
                          value={replyContent[item.id] || ''}
                          onChange={(e) => setReplyContent({ ...replyContent, [item.id]: e.target.value })}
                          placeholder="Write a reply..."
                          className="flex-1 bg-black border border-zinc-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={2}
                        />
                        <button
                          onClick={() => handleReply(item.id)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold flex items-center gap-1 whitespace-nowrap"
                        >
                          <Send size={12} /> Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="py-20 text-center text-zinc-600">
                  <p>No outreach activity yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
