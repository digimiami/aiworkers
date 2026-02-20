'use client';

import Link from 'next/link';
import { 
  Search, Briefcase, BarChart3, Users, FileText, Globe, Mail, 
  Calendar, ShoppingCart, CheckSquare, TrendingUp, Phone, Send,
  Settings, ArrowRight, ArrowDown, Zap, Target, DollarSign,
  Clock, Star, ChevronRight, BookOpen
} from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Search for Prospects',
    icon: Search,
    color: 'from-purple-500 to-blue-500',
    link: '/',
    linkText: 'Go to Search',
    description: 'Start by searching for local businesses that need your help. Enter a zip code or city/state and a niche (e.g., plumber, dentist, restaurant).',
    details: [
      'Enter a location (zip code, city, or state)',
      'Choose a niche or business type',
      'AI automatically finds businesses using Google Maps',
      'Each business gets an AI health score (0-100)',
      'See what each business is missing (website, reviews, SEO, etc.)',
      'Results are saved to your dashboard automatically',
    ],
    proTip: 'Start with niches that typically need the most help: plumbers, HVAC, dentists, restaurants, and auto repair shops.',
  },
  {
    number: 2,
    title: 'Run a Full Audit',
    icon: Briefcase,
    color: 'from-blue-500 to-cyan-500',
    link: '/audit',
    linkText: 'Go to Audit',
    description: 'Deep-dive into a specific business with a comprehensive Google Business Profile audit. Get an A-F grade report card.',
    details: [
      'Enter the business name and location',
      'AI scans their Google Business Profile',
      'Scores categories: hours, description, photos, reviews, website, Q&A',
      'Each category gets a score and specific recommendation',
      'Overall grade from A (excellent) to F (needs major help)',
      'Use this report to show prospects exactly what\'s wrong',
    ],
    proTip: 'The audit report is your best sales tool. Businesses can\'t argue with data showing their profile is incomplete.',
  },
  {
    number: 3,
    title: 'Analyze Their Reviews',
    icon: BarChart3,
    color: 'from-cyan-500 to-teal-500',
    link: '/reviews',
    linkText: 'Go to Reviews',
    description: 'AI-powered sentiment analysis of a business\'s Google reviews. Understand their reputation at a glance.',
    details: [
      'Fetch all reviews from Google Maps',
      'AI analyzes sentiment: positive, negative, neutral',
      'Identify common complaints and praise themes',
      'Calculate their review response rate',
      'Visual charts showing sentiment breakdown',
      'Generate improvement recommendations',
    ],
    proTip: 'Businesses with low response rates to reviews are prime prospects — they clearly need help managing their online reputation.',
  },
  {
    number: 4,
    title: 'Check Their Competitors',
    icon: Users,
    color: 'from-teal-500 to-green-500',
    link: '/competitors',
    linkText: 'Go to Competitors',
    description: 'Compare the business against their top local competitors. Show them exactly where they\'re falling behind.',
    details: [
      'Enter a business to analyze',
      'AI finds their top 3-5 local competitors',
      'Side-by-side comparison: rating, reviews, website, photos',
      'Highlights where the prospect is losing',
      'Winner badges for each category',
      'Powerful sales ammunition for your proposal',
    ],
    proTip: 'Nothing motivates a business owner more than seeing their competitor outperforming them online.',
  },
  {
    number: 5,
    title: 'Generate a Proposal',
    icon: FileText,
    color: 'from-green-500 to-yellow-500',
    link: '/proposals',
    linkText: 'Go to Proposals',
    description: 'AI creates a custom sales proposal tailored to each business\'s specific problems and niche.',
    details: [
      'Select a prospect from your saved list',
      'AI analyzes their specific pain points',
      'Generates a full proposal with recommended services',
      'Includes pricing tiers: Basic, Pro, Enterprise',
      'ROI projections customized to their industry',
      'Professional formatting ready to send',
    ],
    proTip: 'Always customize the AI-generated proposal slightly before sending. Add a personal touch that shows you actually researched their business.',
  },
  {
    number: 6,
    title: 'Create a Landing Page',
    icon: Globe,
    color: 'from-yellow-500 to-orange-500',
    link: '/landing-pages',
    linkText: 'Go to Landing Pages',
    description: 'AI builds a preview landing page for the business to show them what you\'d create. Seeing is believing.',
    details: [
      'Select a prospect from your list',
      'AI generates a full landing page for their niche',
      'Includes hero section, services, testimonials, CTA',
      'Each page gets a unique preview URL',
      'Share the preview link in your proposal',
      'Prospects can see exactly what they\'d get',
    ],
    proTip: 'Include the landing page preview link in your cold email. Prospects who can SEE what you\'d build are 3x more likely to respond.',
  },
  {
    number: 7,
    title: 'Export PDF Proposal',
    icon: FileText,
    color: 'from-orange-500 to-red-500',
    link: '/proposal-pdf',
    linkText: 'Go to PDF Proposals',
    description: 'Generate a professional, branded PDF proposal document you can attach to emails or present in meetings.',
    details: [
      'Professional cover page with your branding',
      'Executive summary with business analysis',
      'Service tiers with pricing ($497/mo, $997/mo, $1997/mo)',
      'ROI projections with 12-month table',
      'Call-to-action with booking link',
      'Customize colors, company name, and logo',
    ],
    proTip: 'PDF proposals feel more professional and are easier to share. Always attach one to your outreach emails.',
  },
  {
    number: 8,
    title: 'Send Cold Emails',
    icon: Mail,
    color: 'from-red-500 to-pink-500',
    link: '/cold-emails',
    linkText: 'Go to Cold Emails',
    description: 'AI writes personalized cold emails based on each business\'s specific problems. Choose your tone and send.',
    details: [
      'Select a prospect from your saved list',
      'Choose tone: professional, friendly, or urgent',
      'AI writes a personalized email based on their audit data',
      'Edit the email before sending',
      'Send directly via integrated email (Resend)',
      'Track sent emails in your outreach dashboard',
    ],
    proTip: 'The "friendly" tone works best for small local businesses. Keep emails short — under 150 words gets the highest response rate.',
  },
  {
    number: 9,
    title: 'Set Up Drip Campaigns',
    icon: Calendar,
    color: 'from-pink-500 to-purple-500',
    link: '/campaigns',
    linkText: 'Go to Campaigns',
    description: 'Create automated follow-up sequences. Most deals close after the 3rd-5th touch point.',
    details: [
      'Create a campaign with multiple steps',
      'Day 1: Send initial proposal email',
      'Day 3: Follow-up email with case study',
      'Day 7: SMS message with special offer',
      'Day 14: Final follow-up with urgency',
      'Assign prospects and track which step they\'re on',
    ],
    proTip: '80% of sales require 5+ follow-ups, but 44% of salespeople give up after one. Drip campaigns do the follow-up for you.',
  },
  {
    number: 10,
    title: 'Bulk Outreach',
    icon: ShoppingCart,
    color: 'from-purple-500 to-violet-500',
    link: '/bulk',
    linkText: 'Go to Bulk Search',
    description: 'Search an entire zip code for all businesses in a niche, analyze them all, and send proposals in bulk.',
    details: [
      'Enter a zip code and niche',
      'Search finds ALL businesses in that area',
      'Auto-analyze every business found',
      'Filter by health score (target the weakest)',
      'One-click "Send Proposal to All"',
      'Progress bar shows send status',
    ],
    proTip: 'Bulk outreach is a numbers game. Send to 100 businesses, expect 5-10 replies, close 2-3 deals. That\'s $1,000-$6,000/month in recurring revenue.',
  },
  {
    number: 11,
    title: 'Manage Your Pipeline',
    icon: CheckSquare,
    color: 'from-violet-500 to-indigo-500',
    link: '/crm',
    linkText: 'Go to CRM',
    description: 'Track every prospect through your sales pipeline with a visual Kanban board.',
    details: [
      'Kanban columns: Found → Contacted → Replied → Meeting → Closed',
      'Move prospects between stages with one click',
      'Add deal values to track pipeline revenue',
      'See stats: total pipeline value, conversion rate',
      'Click any card for full prospect details',
      'Track conversation history per prospect',
    ],
    proTip: 'Review your CRM every morning. Focus on prospects in "Replied" and "Meeting" stages — they\'re closest to closing.',
  },
  {
    number: 12,
    title: 'Book Appointments',
    icon: Phone,
    color: 'from-indigo-500 to-blue-500',
    link: '/book',
    linkText: 'Go to Booking',
    description: 'Prospects can book a call directly from your proposals and landing pages. No back-and-forth scheduling.',
    details: [
      'Calendar view with available time slots (Mon-Fri, 9am-5pm)',
      'Prospects fill out: name, email, phone, business, preferred service',
      'Instant confirmation page after booking',
      'You get notified via Telegram and email',
      'Include booking link in all proposals and emails',
      'View all bookings in your Analytics dashboard',
    ],
    proTip: 'Add your booking link to your email signature, proposals, and landing pages. Make it as easy as possible for prospects to say yes.',
  },
  {
    number: 13,
    title: 'Track Everything',
    icon: TrendingUp,
    color: 'from-blue-500 to-purple-500',
    link: '/analytics',
    linkText: 'Go to Analytics',
    description: 'Monitor your entire operation: proposals sent, open rates, reply rates, conversion rates, and revenue.',
    details: [
      'Overview stats: proposals, opens, replies, conversions, revenue',
      'Weekly proposals chart (last 8 weeks)',
      'Conversion funnel: Sent → Opened → Replied → Meeting → Closed',
      'Monthly revenue tracking',
      'Top performing niches table',
      'Recent activity feed',
    ],
    proTip: 'Check analytics weekly. Double down on niches with the highest conversion rates and drop the ones that don\'t respond.',
  },
];

const quickStartSteps = [
  { icon: Search, text: 'Search "plumber" in your city', time: '30 seconds' },
  { icon: Briefcase, text: 'Pick a business with low health score', time: '10 seconds' },
  { icon: FileText, text: 'Generate a proposal', time: '1 minute' },
  { icon: Mail, text: 'Send a cold email', time: '2 minutes' },
  { icon: DollarSign, text: 'Close the deal', time: 'Profit!' },
];

export default function GuidePage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-10">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-4 py-2 rounded-full text-purple-400 text-sm">
          <BookOpen size={16} />
          Complete Guide & Workflow
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight">
          How to Use <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">AI Workers</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Follow this step-by-step guide to find local businesses that need help, 
          generate proposals, and close deals — all powered by AI.
        </p>
      </section>

      {/* Quick Start */}
      <section className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Zap className="text-yellow-400 fill-yellow-400" size={24} />
            Quick Start — Your First Deal in 5 Minutes
          </h2>
          <p className="text-gray-400 mb-6">Follow these 5 steps to send your first proposal right now.</p>
          
          <div className="space-y-4">
            {quickStartSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">
                  {index + 1}
                </div>
                <step.icon size={20} className="text-purple-400 shrink-0" />
                <span className="text-white font-medium flex-1">{step.text}</span>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <Clock size={14} />
                  {step.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Calculator */}
      <section className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <DollarSign className="text-green-400" size={24} />
            Revenue Potential
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-black/30 rounded-xl">
              <p className="text-3xl font-bold text-green-400">100</p>
              <p className="text-gray-400 text-sm">Proposals sent per week</p>
            </div>
            <div className="text-center p-4 bg-black/30 rounded-xl">
              <p className="text-3xl font-bold text-green-400">5-10%</p>
              <p className="text-gray-400 text-sm">Average response rate</p>
            </div>
            <div className="text-center p-4 bg-black/30 rounded-xl">
              <p className="text-3xl font-bold text-green-400">$2,000-$6,000</p>
              <p className="text-gray-400 text-sm">Monthly recurring revenue</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4 text-center">
            Based on closing 2-3 clients per week at $497-$1,997/month per client
          </p>
        </div>
      </section>

      {/* Full Workflow Steps */}
      <section className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Complete Workflow</h2>
          <p className="text-gray-400">13 steps from finding a prospect to closing the deal</p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-full w-0.5 h-8 bg-gradient-to-b from-purple-500/50 to-transparent hidden md:block" />
              )}
              
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Step number and icon */}
                  <div className="flex md:flex-col items-center gap-3 md:gap-2 shrink-0">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                      <step.icon size={28} className="text-white" />
                    </div>
                    <span className="text-xs text-gray-500 font-mono">STEP {step.number}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                        <p className="text-gray-400 mt-1">{step.description}</p>
                      </div>
                      <Link 
                        href={step.link}
                        className="shrink-0 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-500/20 transition-all flex items-center gap-1 text-sm font-medium"
                      >
                        {step.linkText}
                        <ChevronRight size={16} />
                      </Link>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {step.details.map((detail, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <ArrowRight size={14} className="text-purple-400 mt-0.5 shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pro tip */}
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-2">
                      <Star size={16} className="text-yellow-400 mt-0.5 shrink-0 fill-yellow-400" />
                      <div>
                        <span className="text-yellow-400 font-semibold text-xs uppercase tracking-wider">Pro Tip</span>
                        <p className="text-gray-300 text-sm mt-0.5">{step.proTip}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowDown size={20} className="text-purple-500/50" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Best Practices */}
      <section className="max-w-4xl mx-auto">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="text-purple-400" size={24} />
            Best Practices for Maximum Results
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-purple-400">Daily Routine</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Search 2-3 new zip codes every morning</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Send 20-30 cold emails per day</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Follow up on all replies within 1 hour</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Update your CRM pipeline daily</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Check analytics every evening</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-bold text-purple-400">Top Converting Niches</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2"><span className="text-green-400">★</span> Plumbers & HVAC — high ticket, low online presence</li>
                <li className="flex items-start gap-2"><span className="text-green-400">★</span> Dentists & Chiropractors — need patient flow</li>
                <li className="flex items-start gap-2"><span className="text-green-400">★</span> Restaurants & Cafes — need reviews & visibility</li>
                <li className="flex items-start gap-2"><span className="text-green-400">★</span> Auto Repair Shops — competitive, need edge</li>
                <li className="flex items-start gap-2"><span className="text-green-400">★</span> Lawyers — high value, need leads</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-purple-400">Email Tips</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Keep subject lines under 6 words</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Mention their business name in the first line</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Include one specific problem you found</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">•</span> End with a clear CTA (book a call link)</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Send between 9-11am local time</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-purple-400">Pricing Strategy</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Basic ($497/mo): Google listing + reviews</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Pro ($997/mo): + website + SEO</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Enterprise ($1,997/mo): + ads + full management</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Always present 3 options (anchor pricing)</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">•</span> Most clients choose the middle tier</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Settings Reminder */}
      <section className="max-w-4xl mx-auto">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Settings className="text-gray-400" size={24} />
            Setup Checklist
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Configure Telegram chat ID in Settings for instant alerts',
              'Set up your email signature with booking link',
              'Customize your brand colors in PDF Proposals',
              'Test the booking page to make sure notifications work',
              'Set up at least one drip campaign template',
              'Add your business info in Settings for white-label proposals',
            ].map((item, i) => (
              <label key={i} className="flex items-start gap-3 text-gray-300 text-sm cursor-pointer hover:text-white transition-colors">
                <input type="checkbox" className="mt-1 accent-purple-500" />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <div className="mt-6">
            <Link 
              href="/settings" 
              className="bg-purple-500/10 border border-purple-500/30 text-purple-400 px-6 py-2 rounded-lg hover:bg-purple-500/20 transition-all inline-flex items-center gap-2"
            >
              <Settings size={16} />
              Go to Settings
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-10">
          <h2 className="text-3xl font-bold mb-3">Ready to Find Your First Client?</h2>
          <p className="text-gray-400 mb-6">Start searching for businesses right now. Your first deal is just minutes away.</p>
          <Link 
            href="/"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all inline-flex items-center gap-2 text-lg"
          >
            <Search size={20} />
            Start Searching Now
          </Link>
        </div>
      </section>
    </div>
  );
}
