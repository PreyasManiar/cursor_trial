'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function APIPlaygroundPage() {
  const [query, setQuery] = useState('');
  const [searchTopic, setSearchTopic] = useState('general');
  const [searchDepth, setSearchDepth] = useState('basic');
  const [maxResults, setMaxResults] = useState(5);
  const [timeRange, setTimeRange] = useState('none');
  const [includeAnswer, setIncludeAnswer] = useState('none');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link href="/dashboard" className="hover:text-gray-900">Pages</Link>
        <span>/</span>
        <span className="text-gray-900">API Playground</span>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">API Playground</h1>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Tavily Search
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
              Tavily Extract
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API key
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>default</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Query <span className="text-red-600">required</span>
              </label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="4"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are the latest updates with Nvidia?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search topic
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                >
                  <option value="general">general</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search depth
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={searchDepth}
                  onChange={(e) => setSearchDepth(e.target.value)}
                >
                  <option value="basic">basic</option>
                </select>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Send Request
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400">Response</span>
            <button className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <div className="h-[400px] bg-gray-800 rounded"></div>
        </div>
      </div>
    </div>
  );
}