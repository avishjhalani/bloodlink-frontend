'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { AxiosError } from 'axios';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

interface RequestResult {
  matchedDonors: number;
  request: {
    bloodType: string;
    units: number;
    hospital: string;
    address: string;
    urgency: string;
    lat: number;
    lng: number;
    status: string;
    id: number;
  };
}

export default function NewRequestPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RequestResult | null>(null);
  const [form, setForm] = useState({
    bloodType: 'O+',
    units: '1',
    hospital: '',
    address: '',
    urgency: 'urgent',
    lat: '',
    lng: '',
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.bloodType) {
      setTimeout(() => {
        setForm(f => ({ ...f, bloodType: user.bloodType }));
      }, 0);
    }
  }, [user]);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [searching, setSearching] = useState(false);

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

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError('');
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
        {
          headers: {
            'User-Agent': 'BloodLink-App/1.0',
          },
        }
      );
      const data = await response.json();
      setSuggestions(data);
      if (data.length === 0) {
        setError('No locations found. Try adjusting your search.');
      }
    } catch {
      setError('Failed to search location.');
    } finally {
      setSearching(false);
    }
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
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Failed to post request');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

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
                <div className="flex gap-2 mb-2">
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search hospital name or city..."
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        searchLocation();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={searchLocation}
                    disabled={searching}
                    className="bg-red-600 hover:bg-red-700 text-white shrink-0"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                {suggestions.length > 0 && (
                  <div className="border rounded-md bg-white shadow-lg max-h-60 overflow-y-auto mb-2 divide-y text-sm border-gray-200">
                    {suggestions.map((s, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setForm(f => ({
                            ...f,
                            lat: s.lat,
                            lng: s.lon,
                            address: s.display_name,
                          }));
                          setSearchQuery(s.display_name);
                          setSuggestions([]);
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-red-50 text-gray-700 transition-colors flex gap-2 items-start"
                      >
                        <span className="shrink-0">📍</span>
                        <span>{s.display_name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-2"
                  onClick={getLocation}
                >
                  📍 Use My Current Location
                </Button>

                {form.lat && form.lng && (
                  <div className="bg-green-50 text-green-800 border border-green-200 rounded-md p-2.5 text-xs flex justify-between items-center mt-2">
                    <span>✅ Location Captured: {parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(f => ({ ...f, lat: '', lng: '' }));
                        setSearchQuery('');
                      }}
                      className="text-green-600 hover:text-green-800 font-bold ml-2 cursor-pointer"
                    >
                      Clear
                    </button>
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
