'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

interface AnalyticsOverview {
  requests: {
    total: number;
    active: number;
    fulfilled: number;
    fulfillmentRate: string;
  };
  donors: {
    total: number;
    available: number;
  };
  notifications: {
    total: number;
    confirmed: number;
    confirmationRate: string;
  };
}

interface BloodTypeStatItem {
  bloodType: string;
  count: number;
}

interface BloodTypeStats {
  requestsByBloodType: BloodTypeStatItem[];
  donorsByBloodType: BloodTypeStatItem[];
}

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [bloodTypes, setBloodTypes] = useState<BloodTypeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/blood-types'),
      ]).then(([ov, bt]) => {
        setOverview(ov.data);
        setBloodTypes(bt.data);
      }).finally(() => setLoading(false));
    }
  }, [user]);

  if (loading || !overview || !bloodTypes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">📊 BloodLink Analytics</h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Requests', value: overview.requests.total, color: 'text-red-600' },
            { label: 'Active Now', value: overview.requests.active, color: 'text-orange-600' },
            { label: 'Fulfilled', value: overview.requests.fulfilled, color: 'text-green-600' },
            { label: 'Fulfillment Rate', value: overview.requests.fulfillmentRate, color: 'text-blue-600' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-4 text-center">
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Donor Stats */}
          <Card>
            <CardHeader><CardTitle>👥 Donors</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Registered</span>
                <span className="font-bold">{overview.donors.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currently Available</span>
                <span className="font-bold text-green-600">{overview.donors.available}</span>
              </div>
            </CardContent>
          </Card>

          {/* Notification Stats */}
          <Card>
            <CardHeader><CardTitle>📧 Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sent</span>
                <span className="font-bold">{overview.notifications.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Confirmed</span>
                <span className="font-bold text-green-600">{overview.notifications.confirmed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Confirmation Rate</span>
                <span className="font-bold text-blue-600">{overview.notifications.confirmationRate}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blood Type Distribution */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Requests by Blood Type</CardTitle></CardHeader>
            <CardContent>
              {bloodTypes.requestsByBloodType.map((item: BloodTypeStatItem) => (
                <div key={item.bloodType} className="flex justify-between py-2 border-b last:border-0">
                  <span className="font-semibold text-red-600">{item.bloodType}</span>
                  <span className="font-bold">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Donors by Blood Type</CardTitle></CardHeader>
            <CardContent>
              {bloodTypes.donorsByBloodType.map((item: BloodTypeStatItem) => (
                <div key={item.bloodType} className="flex justify-between py-2 border-b last:border-0">
                  <span className="font-semibold text-red-600">{item.bloodType}</span>
                  <span className="font-bold">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}