'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Layout, 
  Eye, 
  Code, 
  Download, 
  Loader2, 
  ArrowLeft, 
  ExternalLink,
  Smartphone,
  Monitor,
  CheckCircle,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LandingPageData {
  hero: { title: string; subtitle: string; cta: string };
  features: { title: string; description: string; icon: string }[];
  about: string;
  testimonials: { name: string; text: string; rating: number }[];
  contact: { address: string; phone: string };
}

interface Business {
  id: string;
  name: string;
  niche: string;
  city: string;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  email?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
}

interface LLMOption {
  id: string;
  name: string;
  available: boolean;
}

export default function LandingPagesPage() {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [content, setContent] = useState<LandingPageData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [llms, setLlms] = useState<LLMOption[]>([]);
  const [selectedLlm, setSelectedLlm] = useState('deepseek');
  const [loadingBusiness, setLoadingBusiness] = useState(true);

  useEffect(() => {
    // Fetch available LLMs
    axios.get('/api/llms')
      .then(res => {
        setLlms(res.data.llms || []);
        const firstAvailable = (res.data.llms || []).find((l: LLMOption) => l.available);
        if (firstAvailable) setSelectedLlm(firstAvailable.id);
      })
      .catch(() => {});

    // Fetch business from DB instead of localStorage
    const businessId = new URLSearchParams(window.location.search).get('businessId');
    if (businessId) {
      axios.get(`/api/prospects/${businessId}`)
        .then(res => {
          const p = res.data.prospect;
          if (p) {
            setSelectedBusiness({
              id: p.id,
              name: p.name,
              niche: p.niche || '',
              city: p.city || '',
              phone: p.phone,
              address: p.address,
              website: p.website,
              email: p.email,
              rating: p.rating,
              reviewCount: p.reviewCount,
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoadingBusiness(false));
    } else {
      setLoadingBusiness(false);
    }
  }, []);

  const selectedLlmName = llms.find(l => l.id === selectedLlm)?.name || selectedLlm;

  const generateLandingPage = async () => {
    if (!selectedBusiness) return;
    setIsGenerating(true);
    try {
      const res = await axios.post('/api/generate-landing-page', { 
        business: selectedBusiness,
        llm: selectedLlm,
      });
      setContent(res.data.landingPage);
      const id = res.data.landingPageId || Math.random().toString(36).substring(7);
      setPreviewId(id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadingBusiness) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!selectedBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800 text-zinc-600">
          <Layout size={48} />
        </div>
        <h2 className="text-2xl font-bold">No business selected</h2>
        <p className="text-zinc-400 text-center max-w-md">Select a business from the dashboard to generate a custom landing page.</p>
        <Link href="/dashboard" className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/prospect/${selectedBusiness.id}`} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Landing Page Generator</h1>
            <p className="text-zinc-400">Building a custom site for {selectedBusiness.name}</p>
          </div>
        </div>
        {!content && !isGenerating && (
          <div className="flex items-center gap-3">
            {/* LLM Dropdown */}
            <div className="relative">
              <select
                value={selectedLlm}
                onChange={(e) => setSelectedLlm(e.target.value)}
                className="appearance-none bg-zinc-900 border border-zinc-700 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {llms.map((llm) => (
                  <option key={llm.id} value={llm.id} disabled={!llm.available}>
                    {llm.name} {!llm.available ? '(unavailable)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 text-zinc-500 pointer-events-none" />
            </div>
            <button
              onClick={generateLandingPage}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <Layout size={18} />
              Generate Landing Page
            </button>
          </div>
        )}
      </div>

      {isGenerating ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-20 flex flex-col items-center justify-center space-y-6">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <div className="text-center">
            <h3 className="text-xl font-bold">{selectedLlmName} is designing your page...</h3>
            <p className="text-zinc-400">Crafting custom copy and layout for {selectedBusiness.niche}.</p>
          </div>
        </div>
      ) : content ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-500">Preview Controls</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewMode('desktop')}
                  className={cn("flex-1 py-2 rounded-lg border flex justify-center", viewMode === 'desktop' ? "bg-blue-600 border-blue-500" : "bg-black border-zinc-800")}
                >
                  <Monitor size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('mobile')}
                  className={cn("flex-1 py-2 rounded-lg border flex justify-center", viewMode === 'mobile' ? "bg-blue-600 border-blue-500" : "bg-black border-zinc-800")}
                >
                  <Smartphone size={18} />
                </button>
              </div>
              <div className="space-y-2">
                {previewId && (
                  <Link 
                    href={`/preview/${previewId}`} 
                    target="_blank"
                    className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <ExternalLink size={16} />
                    Live Preview
                  </Link>
                )}
                <button className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                  <Code size={16} />
                  Export HTML
                </button>
              </div>
              <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                Generated by {selectedLlmName}
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-500">Page Structure</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Hero Section</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Features Grid</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> About Us</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Testimonials</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Contact Footer</li>
              </ul>
            </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-3">
            <div className={cn(
              "mx-auto bg-white text-black rounded-2xl overflow-hidden shadow-2xl transition-all duration-500",
              viewMode === 'mobile' ? "max-w-[375px]" : "w-full"
            )}>
              <div className="bg-zinc-100 border-b p-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="bg-white border rounded px-3 py-0.5 text-[10px] text-zinc-400 flex-1 mx-4">
                  https://{selectedBusiness.name.toLowerCase().replace(/\s+/g, '-')}.aiworkers.com
                </div>
              </div>
              
              <div className="h-[600px] overflow-y-auto overflow-x-hidden scrollbar-hide">
                {/* Hero */}
                <header className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12 text-center">
                  <h2 className="text-3xl font-extrabold mb-4">{content.hero.title}</h2>
                  <p className="text-blue-100 mb-8">{content.hero.subtitle}</p>
                  <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-lg">
                    {content.hero.cta}
                  </button>
                </header>

                {/* Features */}
                <section className="p-12 bg-white">
                  <h3 className="text-2xl font-bold text-center mb-12">Our Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {content.features.map((f, i) => (
                      <div key={i} className="text-center space-y-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto font-bold">
                          {i + 1}
                        </div>
                        <h4 className="font-bold">{f.title}</h4>
                        <p className="text-zinc-500 text-sm">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* About */}
                <section className="p-12 bg-zinc-50">
                  <div className="max-w-2xl mx-auto text-center">
                    <h3 className="text-2xl font-bold mb-6">About {selectedBusiness.name}</h3>
                    <p className="text-zinc-600 leading-relaxed">{content.about}</p>
                  </div>
                </section>

                {/* Testimonials */}
                <section className="p-12 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {content.testimonials.map((t, i) => (
                      <div key={i} className="p-6 border rounded-2xl bg-white shadow-sm italic text-zinc-600">
                        &quot;{t.text}&quot;
                        <div className="mt-4 not-italic font-bold text-black">— {t.name}</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Footer */}
                <footer className="bg-zinc-900 text-white p-12 text-center">
                  <h4 className="font-bold mb-4">{selectedBusiness.name}</h4>
                  <p className="text-zinc-400 text-sm mb-2">{content.contact.address}</p>
                  <p className="text-zinc-400 text-sm">{content.contact.phone}</p>
                </footer>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
