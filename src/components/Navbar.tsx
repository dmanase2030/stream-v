'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import ProfileSwitcher from './ProfileSwitcher';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/tv', label: 'TV Shows' },
  { href: '/channels', label: 'Live TV' },
  { href: '/mytv', label: 'My List' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide navbar entirely on channel player pages
  const isChannelPage = pathname.startsWith('/channel/');

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

            <div className="hidden lg:flex items-center gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13px] transition-colors duration-200 ${
                    pathname === link.href
                      ? 'text-white font-semibold'
                      : 'text-[#e5e5e5]/80 hover:text-[#b3b3b3]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side - Netflix style */}
          <div className="flex items-center gap-4">
            <SearchBar />
            <ProfileSwitcher />
            <UserMenu />
            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
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
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="17" x2="21" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#141414]/95 backdrop-blur-xl border-t border-white/10">
          <div className="px-[4%] py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 text-sm transition-colors ${
                  pathname === link.href
                    ? 'text-white font-semibold'
                    : 'text-white/60 hover:text-white'
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
