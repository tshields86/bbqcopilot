'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Flame } from 'lucide-react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.bbqcopilot.com';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-char-800/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="max-container px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-ember-500 to-copper rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-ash-white">
            BBQ<span className="text-ember-500">Copilot</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-char-300 hover:text-ash-white transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-char-300 hover:text-ash-white transition-colors"
          >
            How It Works
          </a>
          <a
            href={`${appUrl}/login`}
            className="text-char-300 hover:text-ash-white transition-colors"
          >
            Sign In
          </a>
          <a href={appUrl} className="btn-primary">
            Start Cooking Free
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-ash-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-char-800/95 backdrop-blur-md border-t border-char-700">
          <div className="px-6 py-4 flex flex-col gap-4">
            <a
              href="#features"
              className="text-char-300 hover:text-ash-white transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-char-300 hover:text-ash-white transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href={`${appUrl}/login`}
              className="text-char-300 hover:text-ash-white transition-colors py-2"
            >
              Sign In
            </a>
            <a href={appUrl} className="btn-primary text-center">
              Start Cooking Free
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
