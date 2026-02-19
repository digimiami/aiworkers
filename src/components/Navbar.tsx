import Link from 'next/link';
import { LayoutDashboard, Search, Zap, FileText, Send, Globe, Briefcase, BarChart3, Users, CheckSquare, Mail, Calendar, ShoppingCart, Settings } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-purple-500/20 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          <Zap className="text-purple-500 fill-purple-500" />
          AI Workers
        </Link>
<div className="flex items-center gap-6 overflow-x-auto">
	          <Link href="/" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap">
	            <Search size={18} />
	            Search
	          </Link>
	          <Link href="/dashboard" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap">
	            <LayoutDashboard size={18} />
	            Dashboard
	          </Link>
	          <Link href="/audit" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap">
	            <Briefcase size={18} />
	            Audit
	          </Link>
	          <Link href="/reviews" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap">
	            <BarChart3 size={18} />
	            Reviews
	          </Link>
	          <Link href="/competitors" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap">
	            <Users size={18} />
	            Competitors
	          </Link>
	          <Link href="/crm" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap">
	            <CheckSquare size={18} />
	            CRM
	          </Link>
	          <Link href="/proposals" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap">
	            <FileText size={18} />
	            Proposals
	          </Link>
	          <Link href="/outreach" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap">
	            <Send size={18} />
	            Outreach
	          </Link>
		          <Link href="/landing-pages" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap">
		            <Globe size={18} />
		            Landing Pages
		          </Link>
		          <Link href="/cold-emails" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap">
		            <Mail size={18} />
		            Cold Emails
		          </Link>
		          <Link href="/campaigns" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap">
		            <Calendar size={18} />
		            Campaigns
		          </Link>
		          <Link href="/bulk" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap">
		            <ShoppingCart size={18} />
		            Bulk
		          </Link>
		          <Link href="/settings" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap">
		            <Settings size={18} />
		            Settings
		          </Link>
		        </div>
      </div>
    </nav>
  );
}
