'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import api from '@/lib/api';

interface BloodRequest {
  id: number;
  bloodType: string;
  units: number;
  hospital: string;
  address: string;
  urgency: string;
  status: string;
  donorsNotified: number;
  donorsConfirmed: number;
  createdAt: string;
  requester?: { name: string; phone: string };
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeRequests, setActiveRequests] = useState<BloodRequest[]>([]);
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading]);

  useEffect(() => {
    if (user) {
      Promise.all([
        api.get('/requests/active'),
        api.get('/requests'),
      ]).then(([active, mine]) => {
        setActiveRequests(active.data);
        setMyRequests(mine.data);
      }).finally(() => setLoading(false));
    }
  }, [user]);

  const urgencyColor = (urgency: string) => {
    if (urgency === 'critical') return 'bg-red-100 text-red-700 border-red-200';
    if (urgency === 'urgent') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🩸</div>
          <p className="text-gray-600">Loading BloodLink...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.name} 👋
            </h1>
            <p className="text-gray-600">Blood Type: <span className="font-semibold text-red-600">{user?.bloodType}</span></p>
          </div>
          <Link href="/request/new">
            <Button className="bg-red-600 hover:bg-red-700">
              🚨 Post Urgent Request
            </Button>
          </Link>
        </div>

        {/* Active Requests Near You */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🔴 Active Blood Requests
            <Badge variant="destructive">{activeRequests.length}</Badge>
          </h2>

          {activeRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                No active requests right now. 
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeRequests.map(req => (
                <Card key={req.id} className="border-l-4 border-l-red-500">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-red-600">{req.bloodType}</span>
                          <Badge className={urgencyColor(req.urgency)}>
                            {req.urgency.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{req.units} units needed</Badge>
                        </div>
                        <p className="font-medium text-gray-900">{req.hospital}</p>
                        <p className="text-sm text-gray-600">{req.address}</p>
                        {req.requester && (
                          <p className="text-sm text-gray-500 mt-1">
                            Contact: {req.requester.name} — {req.requester.phone}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{req.donorsNotified} notified</p>
                        <p className="text-green-600">{req.donorsConfirmed} confirmed</p>
                        <p className="mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* My Requests */}
        <section>
          <h2 className="text-xl font-semibold mb-4">📋 My Requests</h2>
          {myRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                You haven't posted any requests yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {myRequests.map(req => (
                <Card key={req.id}>
                  <CardContent className="pt-4 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-red-600 mr-2">{req.bloodType}</span>
                      <span className="text-gray-700">{req.hospital}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {req.donorsConfirmed}/{req.donorsNotified} confirmed
                      </span>
                      <Badge variant={req.status === 'active' ? 'destructive' : 'secondary'}>
                        {req.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}