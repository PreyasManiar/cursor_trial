'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const router = useRouter();

  const handleTryAgain = () => {
    router.push('/api-playground');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md w-full">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Protected Page</h2>
        <p className="text-gray-600 mb-6">
          This is a protected page that can only be accessed with a valid API key.
        </p>
        <button 
          onClick={handleTryAgain}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
} 