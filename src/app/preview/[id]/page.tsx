'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface LandingPageData {
  hero: { title: string; subtitle: string; cta: string };
  features: { title: string; description: string; icon: string }[];
  about: string;
  testimonials: { name: string; text: string; rating: number }[];
  contact: { address: string; phone: string };
  businessName: string;
}

export default function PreviewPage() {
  const { id } = useParams();
  const [content, setContent] = useState<LandingPageData | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pages = JSON.parse(localStorage.getItem('generated_pages') || '{}');
      if (pages[id as string]) {
        setContent(pages[id as string]);
      }
    }
  }, [id]);

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-zinc-400 font-medium">Loading landing page preview...</p>
      </div>
    );
  }

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Top Bar for AI Workers */}
      <div className="bg-zinc-900 text-white p-3 flex items-center justify-between sticky top-0 z-50 px-6">
        <div className="flex items-center gap-4">
          <Link href={`/landing-pages?businessId=${id}`} className="p-1 hover:bg-zinc-800 rounded transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <span className="text-sm font-bold">Previewing: {content.businessName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400">This is an AI-generated preview</span>
          <button className="bg-blue-600 px-3 py-1 rounded text-xs font-bold hover:bg-blue-500 transition-colors">
            Publish Site
          </button>
        </div>
      </div>

      {/* Hero */}
      <header className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">{content.hero.title}</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">{content.hero.subtitle}</p>
          <button className="bg-white text-blue-600 px-10 py-4 rounded-full font-bold shadow-xl text-lg hover:scale-105 transition-transform">
            {content.hero.cta}
          </button>
        </div>
      </header>

      {/* Features */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {content.features.map((f, i) => (
              <div key={i} className="text-center space-y-4 p-6 rounded-3xl hover:bg-zinc-50 transition-colors">
                <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 mx-auto text-2xl font-bold">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold">{f.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-24 px-6 bg-zinc-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">About {content.businessName}</h2>
          <p className="text-xl text-zinc-600 leading-relaxed">{content.about}</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.testimonials.map((t, i) => (
              <div key={i} className="p-10 border border-zinc-100 rounded-3xl bg-white shadow-sm italic text-zinc-600 relative">
                <div className="text-blue-200 absolute top-4 left-4 text-6xl opacity-50 font-serif">&quot;</div>
                <p className="relative z-10 text-lg">{t.text}</p>
                <div className="mt-8 not-italic flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {t.name[0]}
                  </div>
                  <div className="font-bold text-black">— {t.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 px-6 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-10">Contact us today for a free consultation.</p>
          <button className="bg-white text-blue-600 px-10 py-4 rounded-full font-bold shadow-xl text-lg hover:scale-105 transition-transform">
            Book Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-16 px-6 text-center border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <h4 className="text-2xl font-bold mb-6">{content.businessName}</h4>
          <div className="space-y-2 text-zinc-400">
            <p>{content.contact.address}</p>
            <p>{content.contact.phone}</p>
          </div>
          <div className="mt-12 pt-8 border-t border-zinc-800 text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} {content.businessName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
