'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import api from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  bloodType: string;
  isAvailable: boolean;
}

interface DonorNotification {
  id: number;
  requestId: number;
  donorId: number;
  status: string;
  notifiedAt: string;
  respondedAt?: string;
  distance: number;
  donor: {
    id: number;
    name: string;
    phone: string;
    bloodType: string;
  };
}

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
  notifications?: DonorNotification[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRequests, setActiveRequests] = useState<BloodRequest[]>([]);
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fulfillment Dialog State
  const [fulfillModalOpen, setFulfillModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [selectedDonors, setSelectedDonors] = useState<number[]>([]);
  const [submittingFulfillment, setSubmittingFulfillment] = useState(false);

  useEffect(() => {
    // Read directly from localStorage — no context dependency
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    // Fetch data
    Promise.all([
      api.get('/requests/active'),
      api.get('/requests'),
    ]).then(([active, mine]) => {
      setActiveRequests(active.data);
      setMyRequests(mine.data);
      setTimeout(() => {
        setCurrentUser(parsedUser);
      }, 0);
    }).catch(() => {
      router.push('/login');
    }).finally(() => setLoading(false));
  }, [router]);

  const openFulfillModal = (request: BloodRequest) => {
    setSelectedRequest(request);
    setSelectedDonors([]);
    setFulfillModalOpen(true);
  };

  const toggleDonorSelection = (donorId: number) => {
    setSelectedDonors(prev =>
      prev.includes(donorId) ? prev.filter(id => id !== donorId) : [...prev, donorId]
    );
  };

  const handleFulfillSubmit = async () => {
    if (!selectedRequest) return;
    setSubmittingFulfillment(true);
    try {
      await api.patch(`/requests/${selectedRequest.id}/fulfill`, {
        donorIds: selectedDonors,
      });
      
      // Refresh active and personal requests
      const resActive = await api.get('/requests/active');
      const resMine = await api.get('/requests');
      setActiveRequests(resActive.data);
      setMyRequests(resMine.data);
      
      setFulfillModalOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Error fulfilling request:', err);
    } finally {
      setSubmittingFulfillment(false);
    }
  };

  const urgencyColor = (urgency: string) => {
    if (urgency === 'critical') return 'bg-red-100 text-red-700 border-red-200';
    if (urgency === 'urgent') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  if (loading) {
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
              Welcome, {currentUser?.name} 👋
            </h1>
            <p className="text-gray-600">
              Blood Type: <span className="font-semibold text-red-600">{currentUser?.bloodType}</span>
            </p>
          </div>
          <Link href="/request/new">
            <Button className="bg-red-600 hover:bg-red-700">
              🚨 Post Urgent Request
            </Button>
          </Link>
        </div>

        {/* Active Requests */}
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
                You haven&apos;t posted any requests yet.
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
                      {req.status === 'active' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white font-medium ml-1"
                          onClick={() => openFulfillModal(req)}
                        >
                          Fulfill
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Fulfill Modal */}
      {fulfillModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md shadow-2xl bg-white border border-gray-100 rounded-lg">
            <CardContent className="pt-6 space-y-6">
              <div className="text-center">
                <span className="text-4xl mb-2 block">🎉</span>
                <h3 className="text-xl font-bold text-gray-900">Mark Request as Fulfilled</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Help us reward the donors who helped save a life!
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-700">
                  Select the donor(s) who completed the donation:
                </p>

                {(selectedRequest.notifications?.filter(n => n.status === 'confirmed') || []).length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
                    No donors confirmed availability for this request. You can still fulfill and close it.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                    {selectedRequest.notifications
                      ?.filter(n => n.status === 'confirmed')
                      .map((notif) => (
                        <label
                          key={notif.id}
                          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDonors.includes(notif.donorId)}
                            onChange={() => toggleDonorSelection(notif.donorId)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-4 w-4 shrink-0"
                          />
                          <div className="text-sm">
                            <p className="font-semibold text-gray-900">{notif.donor.name}</p>
                            <p className="text-xs text-gray-500">
                              Phone: {notif.donor.phone || 'N/A'} • Blood: {notif.donor.bloodType}
                            </p>
                          </div>
                        </label>
                      ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setFulfillModalOpen(false);
                    setSelectedRequest(null);
                  }}
                  disabled={submittingFulfillment}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                  onClick={handleFulfillSubmit}
                  disabled={submittingFulfillment}
                >
                  {submittingFulfillment ? 'Fulfilling...' : 'Confirm Fulfillment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}