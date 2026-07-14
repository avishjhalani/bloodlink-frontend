'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { AxiosError } from 'axios';

type ConfirmState = 'verifying' | 'confirming' | 'success' | 'error';

export default function ConfirmPage() {
  const { id } = useParams();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [state, setState] = useState<ConfirmState>('verifying');
  const [message, setMessage] = useState('Verifying credentials...');
  const isApiCalled = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Store current path to redirect back after login
      localStorage.setItem('redirect_after_login', `/request/confirm/${id}`);
      router.push('/login');
      return;
    }

    // Authenticated - attempt confirmation
    const confirmDonation = async () => {
      if (isApiCalled.current) return;
      isApiCalled.current = true;
      
      setState('confirming');
      setMessage('Confirming your availability to donate blood...');

      try {
        await api.post(`/donors/confirm/${id}`);
        setState('success');
      } catch (err) {
        console.error('Confirmation error:', err);
        const axiosError = err as AxiosError<{ message?: string }>;
        setMessage(axiosError.response?.data?.message || 'Could not confirm request. It may have expired or already been completed.');
        setState('error');
      }
    };

    confirmDonation();
  }, [user, isLoading, id, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16">
        <Card className="shadow-xl border-gray-100">
          <CardHeader className="text-center pb-2">
            <div className="text-5xl mb-4">🩸</div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Donation Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-center">
            {state === 'verifying' && (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-gray-600 font-medium">{message}</p>
              </div>
            )}

            {state === 'confirming' && (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-gray-600 font-medium">{message}</p>
              </div>
            )}

            {state === 'success' && (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 text-3xl">
                  ✓
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-green-600">Thank You!</h3>
                  <p className="text-gray-600 text-sm leading-relaxed px-2">
                    Your availability to donate has been successfully registered. The requestor has been notified, and you will receive hospital contact details shortly.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-red-600 hover:bg-red-700 w-full text-white font-medium"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}

            {state === 'error' && (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 text-3xl font-bold">
                  !
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-red-600">Confirmation Failed</h3>
                  <p className="text-red-500 text-sm leading-relaxed px-2 font-medium">
                    {message}
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gray-800 hover:bg-gray-950 w-full text-white font-medium"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
