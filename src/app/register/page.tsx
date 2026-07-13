'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

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
    
    // Manually save to localStorage first
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    
    // Then redirect
    window.location.href = '/dashboard';
  } catch (err: any) {
    console.log('Full error:', err);
    setError(err.response?.data?.message || 'Registration failed');
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
              <Button
                type="button"
                variant="outline"
                className="w-full mb-2"
                onClick={getLocation}
              >
                📍 Use My Current Location
              </Button>
              {form.lat && form.lng && (
                <p className="text-sm text-green-600">
                  ✅ Location captured: {parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}
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