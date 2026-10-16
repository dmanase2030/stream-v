'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/channels', label: 'Channels' },
  { href: '/movies', label: 'Movies' },
  { href: '/tv', label: 'Series' },
  { href: '/mytv', label: 'MyTV+' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide navbar entirely on channel player pages
  const isChannelPage = pathname.startsWith('/channel/');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isChannelPage) return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-bg-primary/95 backdrop-blur-2xl shadow-xl shadow-black/20 border-b border-white/[0.03]'
          : ''
      }`}
    >
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14">
        <div className="flex items-center justify-between h-16 lg:h-[68px]">
          {/* Logo + Nav Links */}
          <div className="flex items-center gap-8 lg:gap-10">
            <Link href="/" className="flex-shrink-0 hover:opacity-90 transition-opacity">
              <img src="/logo.png" alt="SAHND+" className="h-7 lg:h-8" />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                    pathname === link.href
                      ? 'text-white'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <SearchBar />
            {/* Watchlist */}
            <Link
              href="/watchlist"
              className="hidden sm:flex p-2.5 text-white/50 hover:text-white transition-colors rounded-lg"
              title="My List"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </Link>
            <UserMenu />
            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-white/50 hover:text-white transition-colors"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="7" x2="21" y2="7" />
                    <line x1="3" y1="12" x2="18" y2="12" />
                    <line x1="3" y1="17" x2="14" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-bg-primary/98 backdrop-blur-2xl border-t border-white/5 animate-fade-in">
          <div className="px-6 py-4 space-y-1">
            {[...navLinks, { href: '/watchlist', label: 'My List' }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pathname === link.href
                    ? 'text-white bg-white/5'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
