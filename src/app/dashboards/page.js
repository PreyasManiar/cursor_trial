'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'default',
      key: 'tvly-dev-********************************',
      type: 'dev',
      usage: 24,
      createdAt: new Date().toISOString(),
      status: 'active'
    }
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const createApiKey = () => {
    if (!newKeyName.trim()) return;
    const newKey = {
      id: Date.now(),
      name: newKeyName,
      key: `tvly-dev-${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      type: 'dev',
      usage: 0,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
  };

  const updateKeyName = (id, newName) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, name: newName } : key
    ));
    setEditingKey(null);
  };

  const toggleKeyStatus = (id) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, status: key.status === 'active' ? 'inactive' : 'active' } : key
    ));
  };

  const deleteApiKey = (id) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto p-8">
        {/* Current Plan Section */}
        <div className="mb-8 p-8 bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F97316] rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-white mb-2">CURRENT PLAN</div>
              <h2 className="text-4xl font-bold text-white mb-6">Researcher</h2>
              <div className="space-y-4">
                <div className="text-sm text-white">API Limit</div>
                <div className="flex items-center justify-between text-sm text-white mb-2">
                  <span>24 / 1,000 Requests</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: '2.4%' }}></div>
                </div>
              </div>
            </div>
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
              Manage Plan
            </button>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
                <p className="text-sm text-gray-500 mt-1">The key is used to authenticate your requests to the Research API. To learn more, see the documentation page.</p>
              </div>
              <button
                onClick={createApiKey}
                className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
              >
                <span className="text-lg font-medium">+</span>
                Create New Key
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-medium text-gray-500 pb-4">NAME</th>
                    <th className="text-left text-sm font-medium text-gray-500 pb-4">USAGE</th>
                    <th className="text-left text-sm font-medium text-gray-500 pb-4">KEY</th>
                    <th className="text-right text-sm font-medium text-gray-500 pb-4">OPTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {apiKeys.map(key => (
                    <tr key={key.id} className="group">
                      <td className="py-4">
                        <span className="text-sm text-gray-900">{key.name}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-gray-500">{key.usage}</span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-gray-500 font-mono">{key.key}</code>
                          <button
                            onClick={() => copyToClipboard(key.key, key.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {copiedId === key.id ? (
                              <span className="text-green-500 text-xs">Copied!</span>
                            ) : (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-3">
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => deleteApiKey(key.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}