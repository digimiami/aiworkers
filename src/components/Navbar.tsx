import Link from 'next/link';
import { LayoutDashboard, Search, Zap, FileText, Send, Globe, Briefcase, BarChart3, Users, CheckSquare, Mail, Calendar, ShoppingCart, Settings, TrendingUp, Phone, BookOpen } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-purple-500/20 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent shrink-0">
          <Zap className="text-purple-500 fill-purple-500" />
          AI Workers
        </Link>
        <div className="flex items-center gap-4 overflow-x-auto">
          <Link href="/guide" className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-3 py-1 rounded-full hover:bg-purple-500/20 transition-colors whitespace-nowrap text-sm font-medium">
            <BookOpen size={16} />
            Guide
          </Link>
          <Link href="/" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <Search size={16} /> Search
          </Link>
          <Link href="/dashboard" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link href="/audit" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <Briefcase size={16} /> Audit
          </Link>
          <Link href="/reviews" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <BarChart3 size={16} /> Reviews
          </Link>
          <Link href="/competitors" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <Users size={16} /> Competitors
          </Link>
          <Link href="/crm" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <CheckSquare size={16} /> CRM
          </Link>
          <Link href="/proposals" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <FileText size={16} /> Proposals
          </Link>
          <Link href="/outreach" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <Send size={16} /> Outreach
          </Link>
          <Link href="/landing-pages" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <Globe size={16} /> Landing Pages
          </Link>
          <Link href="/cold-emails" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <Mail size={16} /> Cold Emails
          </Link>
          <Link href="/campaigns" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <Calendar size={16} /> Campaigns
          </Link>
          <Link href="/bulk" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <ShoppingCart size={16} /> Bulk
          </Link>
          <Link href="/proposal-pdf" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <FileText size={16} /> PDF
          </Link>
          <Link href="/roi-calculator" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <TrendingUp size={16} /> ROI
          </Link>
          <Link href="/analytics" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <BarChart3 size={16} /> Analytics
          </Link>
          <Link href="/book" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <Phone size={16} /> Book
          </Link>
          <Link href="/settings" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap text-sm">
            <Settings size={16} /> Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
