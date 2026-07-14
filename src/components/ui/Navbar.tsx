'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="text-xl">🩸</span>
        <span className="font-bold text-red-600 text-lg">BloodLink</span>
      </Link>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <Badge variant="outline" className="text-red-600 border-red-200">
              {user.bloodType}
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
            <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500">
              Logout
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}