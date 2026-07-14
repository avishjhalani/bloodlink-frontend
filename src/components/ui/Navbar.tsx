'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b px-4 sm:px-6 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl">🩸</span>
          <span className="font-bold text-red-600 text-lg">BloodLink</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {user && (
            <>
              <Badge variant="outline" className="text-red-600 border-red-200 px-2.5 py-0.5 font-bold">
                Donor Type: {user.bloodType}
              </Badge>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm">Profile</Button>
              </Link>
              <Link href="/analytics">
                <Button variant="ghost" size="sm">Analytics</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500 hover:text-red-600">
                Logout
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <>
              <Badge variant="outline" className="text-red-600 border-red-200 px-2 font-bold text-xs">
                {user.bloodType}
              </Badge>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Toggle Menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {isOpen && user && (
        <div className="md:hidden border-t mt-3 pt-3 pb-2 space-y-1 max-w-5xl mx-auto">
          <Link href="/dashboard" onClick={() => setIsOpen(false)}>
            <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              Dashboard
            </div>
          </Link>
          <Link href="/profile" onClick={() => setIsOpen(false)}>
            <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              Profile
            </div>
          </Link>
          <Link href="/analytics" onClick={() => setIsOpen(false)}>
            <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              Analytics
            </div>
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}