import Link from 'next/link';
import { LayoutDashboard, Search, Zap, FileText, Send, Globe } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-purple-500/20 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          <Zap className="text-purple-500 fill-purple-500" />
          AI Workers
        </Link>
<div className="flex items-center gap-6">
	          <Link href="/" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
	            <Search size={18} />
	            Search
	          </Link>
	          <Link href="/dashboard" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
	            <LayoutDashboard size={18} />
	            Dashboard
	          </Link>
	          <Link href="/proposals" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
	            <FileText size={18} />
	            Proposals
	          </Link>
	          <Link href="/outreach" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
	            <Send size={18} />
	            Outreach
	          </Link>
	          <Link href="/landing-pages" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
	            <Globe size={18} />
	            Landing Pages
	          </Link>
	        </div>
      </div>
    </nav>
  );
}
