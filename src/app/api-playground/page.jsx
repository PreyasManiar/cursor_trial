'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import Notifications, { showNotification } from '../components/Notifications';
import { supabase } from '@/lib/supabase';

export default function APIPlaygroundPage() {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const verifyApiKey = async (keyValue) => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('value', keyValue)
        .eq('status', 'active')
        .single();

      if (error) return false;
      return !!data; // Returns true if key exists and is active
    } catch (err) {
      console.error('Error verifying API key:', err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isValidKey = await verifyApiKey(apiKey);

      if (isValidKey) {
        showNotification('success', 'Valid API Key, /protected can be accessed');
        setApiKey(''); // Clear the form
      } else {
        router.push('/protected');
        showNotification('error', 'Invalid API Key');
      }
    } catch (error) {
      showNotification('error', 'Error validating API key');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className={`flex-1 min-h-screen bg-gray-50 transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-0' : 'ml-[280px]'
      }`}>
        <Notifications />
        
        <div className="max-w-[1200px] mx-auto p-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-6">API Playground</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="text"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your API key"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !apiKey.trim()}
                className={`w-full px-4 py-2 rounded-lg text-white transition-colors
                  ${isLoading || !apiKey.trim() 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {isLoading ? 'Validating...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 