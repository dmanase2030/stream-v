'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

export default function Navbar() {
  const pathname = usePathname();

  // Hide navbar entirely on channel player pages
  const isChannelPage = pathname.startsWith('/channel/');

  if (isChannelPage) return null;

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent">
      <div className="px-[4%]">
        <div className="flex items-center justify-between h-[68px]">
          {/* Netflix-style logo + Nav Links */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex-shrink-0">
              <span className="text-[#E50914] font-black text-2xl tracking-tighter uppercase" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                LUNIFLEX
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {[
                { href: '/', label: 'Home' },
                { href: '/tv', label: 'Shows' },
                { href: '/movies', label: 'Movies' },
                { href: '/new', label: 'New & Popular' },
                { href: '/mytv', label: 'My List' },
              ].map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                    pathname === tab.href
                      ? 'bg-white/15 text-white font-medium'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side - Netflix style */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <SearchBar />
            </div>
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Mobile tab bar - Netflix pill style */}
      <div className="lg:hidden px-[4%] pb-3">
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
          <Link href="/search" className="p-2 text-white/80 hover:text-white transition-colors shrink-0" aria-label="Search">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </Link>
          {[
            { href: '/', label: 'Home' },
            { href: '/tv', label: 'Shows' },
            { href: '/movies', label: 'Movies' },
            { href: '/new', label: 'New & Popular' },
            { href: '/mytv', label: 'My List' },
          ].map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap shrink-0 transition ${
                pathname === tab.href
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
