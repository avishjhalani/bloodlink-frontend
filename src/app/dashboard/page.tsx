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
  const [activeRequests, setActiveRequests] = useState<BloodRequest[]>([]); // Compatible matches
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([]); // User's own requests
  const [allActiveRequests, setAllActiveRequests] = useState<BloodRequest[]>([]); // Global feed
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

    // Fetch data: compatible donor alerts, user requests, and global active requests
    Promise.all([
      api.get('/requests/compatible'),
      api.get('/requests'),
      api.get('/requests/active'),
    ]).then(([compatible, mine, active]) => {
      setActiveRequests(compatible.data);
      setMyRequests(mine.data);
      setAllActiveRequests(active.data);
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
      
      // Refresh all request lists
      const [resCompatible, resMine, resActive] = await Promise.all([
        api.get('/requests/compatible'),
        api.get('/requests'),
        api.get('/requests/active'),
      ]);
      setActiveRequests(resCompatible.data);
      setMyRequests(resMine.data);
      setAllActiveRequests(resActive.data);
      
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
        {/* Main Dashboard Side-by-Side Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Left Column: My Requests */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              📋 My Requests
              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                {myRequests.length}
              </Badge>
            </h2>

            {myRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <span className="text-3xl block mb-2">📋</span>
                You haven&apos;t posted any blood requests yet.
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map(req => (
                  <Card key={req.id} className="border border-gray-100 shadow-sm hover:border-red-100 transition-colors">
                    <CardContent className="pt-4 flex justify-between items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-red-600 text-lg">{req.bloodType}</span>
                          <Badge variant={req.status === 'active' ? 'destructive' : 'secondary'}>
                            {req.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{req.hospital}</p>
                        <p className="text-xs text-gray-500">{req.donorsConfirmed}/{req.donorsNotified} donors confirmed</p>
                      </div>
                      {req.status === 'active' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white font-medium shrink-0 shadow-sm ml-1"
                          onClick={() => openFulfillModal(req)}
                        >
                          Fulfill
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Right Column: Compatible Match Alerts */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              🚨 Compatible Match Alerts
              <Badge variant="destructive">{activeRequests.length}</Badge>
            </h2>

            {activeRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <span className="text-3xl block mb-2">🤝</span>
                No compatible requests matching your blood type right now.
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {activeRequests.map(req => (
                  <Card key={req.id} className="border-l-4 border-l-red-500 border-t border-r border-b border-gray-100 shadow-sm">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-red-600">{req.bloodType}</span>
                            <Badge className={urgencyColor(req.urgency)}>
                              {req.urgency.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs font-semibold">{req.units} units</Badge>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{req.hospital}</p>
                          <p className="text-xs text-gray-600 line-clamp-1">{req.address}</p>
                          {req.requester && (
                            <p className="text-xs text-gray-500 font-medium mt-1">
                              Contact: {req.requester.name} — {req.requester.phone}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-400 shrink-0 space-y-1">
                          <p>{req.donorsNotified} notified</p>
                          <p className="text-green-600 font-semibold">{req.donorsConfirmed} confirmed</p>
                          <p className="text-[10px] mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Bottom Full-Width Feed: All Active Requests */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            🌍 All Active Requests (Global Registry)
            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100">
              {allActiveRequests.length}
            </Badge>
          </h2>

          {allActiveRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50/50 rounded-xl border border-gray-100">
              No other active blood requests posted on the platform.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allActiveRequests.map(req => (
                <Card key={req.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 flex flex-col justify-between h-full min-h-[140px]">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-red-600 text-lg">{req.bloodType}</span>
                          <span className="text-xs text-gray-400">• {req.units} units</span>
                        </div>
                        <Badge className={`${urgencyColor(req.urgency)} text-[10px] px-1.5 py-0.5`}>
                          {req.urgency.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-gray-900 line-clamp-1">{req.hospital}</p>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mb-2">{req.address}</p>
                    </div>
                    <div className="pt-2 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400 mt-2">
                      <span>Posted {new Date(req.createdAt).toLocaleDateString()}</span>
                      <span className="text-green-600 font-medium">{req.donorsConfirmed} confirmed</span>
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