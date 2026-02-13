'use client';

import { useEffect, useState } from 'react';
import { getAllLocations, getAllItems } from '@/lib/database';
import type { Location, Item } from '@/types/game';

export default function TestPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [locationsData, itemsData] = await Promise.all([getAllLocations(), getAllItems()]);
        setLocations(locationsData);
        setItems(itemsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        const fullError = JSON.stringify(err, null, 2);
        setError(`${errorMessage}\n\nFull error:\n${fullError}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Testing Supabase Connection...</h1>
          <div className="animate-pulse">Loading data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-red-500">Connection Error</h1>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <pre className="font-mono text-sm whitespace-pre-wrap">{error}</pre>
          </div>
          <div className="mt-8 space-y-2 text-gray-300">
            <p className="font-semibold">Troubleshooting steps:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                <strong className="text-yellow-400">Did you run the database schema?</strong>
                <br />
                Go to Supabase Dashboard → SQL Editor → Run{' '}
                <code className="bg-gray-800 px-1">database-schema.sql</code>
              </li>
              <li>Check that .env.local exists with correct values</li>
              <li>Verify NEXT_PUBLIC_SUPABASE_URL is set correctly</li>
              <li>Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is the publishable key</li>
              <li>Restart the dev server after changing .env.local</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-green-500">
          ✅ Supabase Connection Successful!
        </h1>

        <div className="space-y-8">
          {/* Locations Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Locations ({locations.length})</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <h3 className="font-bold text-lg mb-2">{location.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{location.description}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Lat: {location.latitude}</span>
                    <span>Lng: {location.longitude}</span>
                    <span>Days: {location.travelDays}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Items ({items.length})</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {items.map((item) => (
                <div key={item.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{item.name}</h3>
                    <span className="text-xs bg-blue-600 px-2 py-1 rounded">{item.itemType}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                  <div className="flex gap-2 text-xs text-gray-500">
                    {item.foodValue > 0 && (
                      <span className="text-green-400">🍕 +{item.foodValue}</span>
                    )}
                    {item.waterValue > 0 && (
                      <span className="text-blue-400">💧 +{item.waterValue}</span>
                    )}
                    {item.energyValue > 0 && (
                      <span className="text-yellow-400">⚡ +{item.energyValue}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-6">
            <h3 className="font-bold text-green-400 mb-2">🎉 Database Setup Complete!</h3>
            <p className="text-gray-300">
              Your Supabase connection is working perfectly. You can now proceed with building the
              authentication system and game features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
