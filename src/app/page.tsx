import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🩸</span>
          <span className="text-xl font-bold text-red-600">BloodLink</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-red-600 hover:bg-red-700">Register as Donor</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <span className="text-6xl mb-6 block">🩸</span>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Save Lives with <span className="text-red-600">BloodLink</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Real-time blood donor matching for India. Post urgent requests,
            find eligible donors within 10km, and get notified instantly.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-lg px-8">
                Register as Donor
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Post Blood Request
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center px-4">
          <div>
            <div className="text-4xl font-bold text-red-600">10km</div>
            <div className="text-gray-600 mt-1">Matching Radius</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-red-600">&lt;60s</div>
            <div className="text-gray-600 mt-1">Donor Notification</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-red-600">8</div>
            <div className="text-gray-600 mt-1">Blood Types Supported</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Post Request', desc: 'Enter blood type, hospital, and location', icon: '📋' },
              { step: '2', title: 'Instant Match', desc: 'We find eligible donors within 10km using GPS', icon: '📍' },
              { step: '3', title: 'Notify & Connect', desc: 'Donors get email alerts and confirm availability', icon: '📧' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 border-t">
        <p>🩸 BloodLink — Built to save lives in India</p>
      </footer>
    </main>
  );
}