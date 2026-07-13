'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function NewRequestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({
    bloodType: user?.bloodType || 'O+',
    units: '1',
    hospital: '',
    address: '',
    urgency: 'urgent',
    lat: '',
    lng: '',
  });

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          lat: pos.coords.latitude.toString(),
          lng: pos.coords.longitude.toString(),
        }));
      },
      () => setError('Could not get location')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/requests', {
        ...form,
        units: parseInt(form.units),
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post request');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-12">
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Request Posted!
              </h2>
              <p className="text-gray-600 mb-4">
                We found <span className="font-bold text-red-600">{result.matchedDonors}</span> eligible {result.request.bloodType} donors within 10km.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                All matched donors have been notified via email and will contact you shortly.
              </p>
              <Button
                className="bg-red-600 hover:bg-red-700 w-full"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">🚨 Post Urgent Blood Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Blood Type Needed</Label>
                <select
                  value={form.bloodType}
                  onChange={e => setForm(f => ({ ...f, bloodType: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  {BLOOD_TYPES.map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Units Required</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={form.units}
                  onChange={e => setForm(f => ({ ...f, units: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Hospital Name</Label>
                <Input
                  value={form.hospital}
                  onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))}
                  placeholder="SMS Hospital"
                  required
                />
              </div>
              <div>
                <Label>Hospital Address</Label>
                <Input
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Tonk Road, Jaipur"
                  required
                />
              </div>
              <div>
                <Label>Urgency Level</Label>
                <select
                  value={form.urgency}
                  onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                  <option value="moderate">Moderate</option>
                </select>
              </div>
              <div>
                <Label>Hospital Location</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-2"
                  onClick={getLocation}
                >
                  📍 Use My Current Location
                </Button>
                {form.lat && (
                  <p className="text-sm text-green-600">
                    ✅ Location set: {parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}
                  </p>
                )}
                {!form.lat && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={form.lat}
                      onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
                      placeholder="Latitude"
                    />
                    <Input
                      value={form.lng}
                      onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
                      placeholder="Longitude"
                    />
                  </div>
                )}
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading || !form.lat}
              >
                {loading ? 'Finding donors...' : '🚨 Post Request & Notify Donors'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}