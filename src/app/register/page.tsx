'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { AxiosError } from 'axios';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function RegisterPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    bloodType: 'O+',
    phone: '',
    lat: '',
    lng: '',
  });

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
      () => setError('Could not get location. Please enter manually.')
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
      const res = await api.post('/auth/register', {
        ...form,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
      });
      
      login(res.data.user);
    } catch (err) {
      console.log('Full error:', err);
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🩸</div>
          <CardTitle className="text-2xl text-red-600">Join BloodLink</CardTitle>
          <p className="text-gray-600">Register as a blood donor</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Avish Jhalani"
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="avish@example.com"
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <Label>Blood Type</Label>
              <select
                value={form.bloodType}
                onChange={e => setForm(f => ({ ...f, bloodType: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm"
                required
              >
                {BLOOD_TYPES.map(bt => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Phone (optional)</Label>
              <Input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="9876543210"
              />
            </div>
            <div>
              <Label>Your Location</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search city, area, landmark..."
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
                        setForm(f => ({ ...f, lat: s.lat, lng: s.lon }));
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
              {loading ? 'Registering...' : 'Register as Donor'}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Already registered?{' '}
              <Link href="/login" className="text-red-600 hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}