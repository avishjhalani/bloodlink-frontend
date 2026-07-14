'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

interface Notification {
  id: number;
  requestId: number;
  status: string;
  request: {
    bloodType: string;
    hospital: string;
  };
}

interface Profile {
  name: string;
  email: string;
  bloodType: string;
  totalDonations: number;
  reliabilityScore: number;
  isAvailable: boolean;
  lastDonationDate?: string;
  recentNotifications: Notification[];
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      api.get('/donors/profile')
        .then(res => setProfile(res.data))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const res = await api.patch('/donors/availability');
      setProfile(p => p ? { ...p, isAvailable: res.data.isAvailable } : null);
    } finally {
      setToggling(false);
    }
  };

  const markDonated = async () => {
    await api.patch('/donors/donated');
    setProfile(p => p ? { ...p, lastDonationDate: new Date().toISOString() } : null);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>My Donor Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold">{profile.name}</p>
                <p className="text-gray-600">{profile.email}</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600">{profile.bloodType}</div>
                <div className="text-xs text-gray-500">Blood Type</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{profile.totalDonations}</div>
                <div className="text-xs text-gray-500">Donations</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(profile.reliabilityScore * 100)}%
                </div>
                <div className="text-xs text-gray-500">Reliability</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className={`text-2xl font-bold ${profile.isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                  {profile.isAvailable ? '✅' : '⏸️'}
                </div>
                <div className="text-xs text-gray-500">
                  {profile.isAvailable ? 'Available' : 'Unavailable'}
                </div>
              </div>
            </div>

            {profile.lastDonationDate && (
              <p className="text-sm text-gray-600">
                Last donation: {new Date(profile.lastDonationDate).toLocaleDateString()}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                onClick={toggleAvailability}
                disabled={toggling}
                variant={profile.isAvailable ? 'outline' : 'default'}
                className="flex-1"
              >
                {profile.isAvailable ? '⏸️ Mark Unavailable' : '✅ Mark Available'}
              </Button>
              <Button
                onClick={markDonated}
                variant="outline"
                className="flex-1"
              >
                🩸 I Just Donated
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests I Was Notified About</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.recentNotifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No notifications yet</p>
            ) : (
              <div className="space-y-3">
                {profile.recentNotifications.map((notif: Notification) => (
                  <div key={notif.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-semibold text-red-600">{notif.request.bloodType}</span>
                      <span className="text-gray-600 ml-2">{notif.request.hospital}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        notif.status === 'confirmed' ? 'default' :
                        notif.status === 'declined' ? 'secondary' : 'outline'
                      }>
                        {notif.status}
                      </Badge>
                      {notif.status === 'notified' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => api.post(`/donors/confirm/${notif.requestId}`).then(() => {
                            setProfile(p => p ? {
                              ...p,
                              recentNotifications: p.recentNotifications.map((n: Notification) =>
                                n.id === notif.id ? { ...n, status: 'confirmed' } : n
                              )
                            } : null);
                          })}
                        >
                          Confirm
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
