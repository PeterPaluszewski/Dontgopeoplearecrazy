'use client';

import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export default function GamePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🌍</div>
          <p className="text-gray-400">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🎒 Backpacking Game</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h2 className="text-3xl font-bold mb-4">Welcome, Traveler!</h2>
          <p className="text-gray-300 mb-6">
            Your backpacking adventure is about to begin. Soon you&apos;ll explore the world, manage
            your resources, and travel between amazing cities.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-700 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🍕</div>
              <h3 className="font-bold mb-2">Food</h3>
              <p className="text-gray-400 text-sm">Manage your hunger while traveling</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">💧</div>
              <h3 className="font-bold mb-2">Water</h3>
              <p className="text-gray-400 text-sm">Stay hydrated on your journey</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold mb-2">Energy</h3>
              <p className="text-gray-400 text-sm">Rest to keep your energy up</p>
            </div>
          </div>

          <div className="mt-8 bg-blue-900/20 border border-blue-500 rounded-lg p-6">
            <h3 className="font-bold text-blue-300 mb-2">🚀 Coming Soon</h3>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>✨ Interactive 3D globe with location markers</li>
              <li>🗺️ Travel between 10 European cities</li>
              <li>🎒 Inventory system with items</li>
              <li>🎲 Random events during travel</li>
              <li>💾 Cloud saves with your progress</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
