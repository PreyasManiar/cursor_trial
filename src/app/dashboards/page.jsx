'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Notifications, { showNotification } from '../components/Notifications';
import Sidebar from '../components/Sidebar';

export default function DashboardPage() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState('development');
  const [newKeyLimit, setNewKeyLimit] = useState('1000');
  const [editingKey, setEditingKey] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [visibleKeyIds, setVisibleKeyIds] = useState(new Set());
  const [editModalKey, setEditModalKey] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Fetch API keys on component mount
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        console.log('Verifying Supabase connection...');
        const { data, error } = await supabase.from('api_keys').select('count');
        if (error) {
          console.error('Supabase connection error:', error);
          setError('Database connection failed. Please check your configuration.');
          return;
        }
        console.log('Supabase connection successful');
        fetchApiKeys();
      } catch (err) {
        console.error('Connection verification failed:', err);
        setError('Failed to connect to the database. Please check your configuration.');
      }
    };

    verifyConnection();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setError('Failed to load API keys. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) return;
    
    try {
      setError(null);
      const newKey = {
        name: newKeyName,
        value: `dandi-${newKeyType === 'production' ? 'prod' : 'dev'}-${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
        type: newKeyType,
        usage: 0,
        limit: parseInt(newKeyLimit),
        status: 'active'
      };
      
      const { data, error: supabaseError } = await supabase
        .from('api_keys')
        .insert([newKey])
        .select()
        .single();

      if (supabaseError) {
        const errorMessage = supabaseError?.message || 'Failed to create API key';
        setError(errorMessage);
        showNotification('error', errorMessage);
        return;
      }

      setApiKeys(prev => [data, ...prev]);
      setNewKeyName('');
      setNewKeyType('development');
      setNewKeyLimit('1000');
      setShowCreateModal(false);
      showNotification('success', 'API key created successfully');
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while creating the API key';
      setError(errorMessage);
      showNotification('error', errorMessage);
    }
  };

  const handleEdit = (key) => {
    setEditModalKey(key);
    setEditingName(key.name);
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) return;
    
    try {
      setError(null);
      const { error } = await supabase
        .from('api_keys')
        .update({ name: editingName })
        .eq('id', editModalKey.id);

      if (error) throw error;

      setApiKeys(apiKeys.map(key => 
        key.id === editModalKey.id ? { ...key, name: editingName } : key
      ));
      setEditModalKey(null);
      setEditingName('');
      showNotification('success', 'API key name updated successfully');
    } catch (err) {
      const errorMessage = 'Failed to update API key name';
      console.error('Error updating API key:', err);
      setError(errorMessage);
      showNotification('error', errorMessage);
    }
  };

  const toggleKeyStatus = async (id) => {
    try {
      setError(null);
      const key = apiKeys.find(k => k.id === id);
      const newStatus = key.status === 'active' ? 'inactive' : 'active';

      const { error } = await supabase
        .from('api_keys')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setApiKeys(apiKeys.map(key => 
        key.id === id ? { ...key, status: newStatus } : key
      ));
    } catch (err) {
      console.error('Error toggling API key status:', err);
      setError('Failed to update API key status. Please try again.');
    }
  };

  const deleteApiKey = async (id) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setApiKeys(apiKeys.filter(key => key.id !== id));
      setShowDeleteConfirm(null);
      showNotification('error', 'API key deleted successfully');
    } catch (err) {
      const errorMessage = 'Failed to delete API key';
      console.error('Error deleting API key:', err);
      setError(errorMessage);
      showNotification('error', errorMessage);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotification('success', 'Copied API Key to clipboard');
    
    setTimeout(() => {
      setCopiedId(null);
    }, 3000);
  };

  const toggleKeyVisibility = (id) => {
    setVisibleKeyIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

const formatApiKey = (key, isVisible) => {
  if (!key || typeof key !== 'string') return ''; // Handle null, undefined, or non-string values
  if (isVisible) return key;
  return key.replace(/[^-]/g, '*');
};


  return (
    <div className="flex">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className={`flex-1 min-h-screen bg-gray-50 transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-0' : 'ml-[280px]'
      }`}>
        <Notifications />

        {error && showNotification('error', error)}

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
                  <p className="text-sm text-gray-500 mt-1">
                    The key is used to authenticate your requests to the Research API. 
                    To learn more, see the documentation page.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
                >
                  <span className="text-lg font-medium">+</span>
                  Create New Key
                </button>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="py-32 text-center text-gray-500">
                    Loading API keys...
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="py-32 text-center text-gray-500">
                    No API keys found. Create your first key to get started.
                  </div>
                ) : (
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
                            {editingKey === key.id ? (
                              <input
                                type="text"
                                defaultValue={key.name}
                                onBlur={(e) => handleEdit(key)}
                                className="text-sm px-2 py-1 border border-gray-300 rounded"
                                autoFocus
                              />
                            ) : (
                              <span className="text-sm text-gray-900">{key.name}</span>
                            )}
                          </td>
                          <td className="py-4">
                            <span className="text-sm text-gray-500">{key.usage}</span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <code className="text-sm text-gray-500 font-mono">
                                {formatApiKey(key.value, visibleKeyIds.has(key.id))}
                              </code>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center justify-end gap-3">
                              <button 
                                onClick={() => toggleKeyVisibility(key.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {visibleKeyIds.has(key.id) ? (
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </button>
                              <button
                                onClick={(e) => copyToClipboard(key.value, key.id)}
                                className="text-gray-400 hover:text-gray-600"
                                title="Copy API key"
                              >
                                {copiedId === key.id ? (
                                  <span className="text-green-500 text-xs">Copied!</span>
                                ) : (
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                  </svg>
                                )}
                              </button>
                              <button 
                                onClick={() => handleEdit(key)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => {
                                  if (showDeleteConfirm === key.id) {
                                    deleteApiKey(key.id);
                                  } else {
                                    setShowDeleteConfirm(key.id);
                                  }
                                }}
                                className={`text-gray-400 ${showDeleteConfirm === key.id ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}`}
                              >
                                {showDeleteConfirm === key.id ? (
                                  <span className="text-xs font-medium">Confirm?</span>
                                ) : (
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Create API Key Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg mx-4">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Create a new API key</h2>
                <p className="text-sm text-gray-500 mb-6">Enter a name and limit for the new API key.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Key Name — A unique name to identify this key
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="Key Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Key Type — Choose the environment for this key
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="keyType"
                          value="production"
                          checked={newKeyType === 'production'}
                          onChange={(e) => setNewKeyType(e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Production</div>
                          <div className="text-sm text-gray-500">Rate limited to 1,000 requests/minute</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="keyType"
                          value="development"
                          checked={newKeyType === 'development'}
                          onChange={(e) => setNewKeyType(e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Development</div>
                          <div className="text-sm text-gray-500">Rate limited to 100 requests/minute</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      Limit monthly usage*
                    </label>
                    <input
                      type="number"
                      value={newKeyLimit}
                      onChange={(e) => setNewKeyLimit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      *If the combined usage of all your keys exceeds your plan's limit, all requests will be rejected.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createApiKey}
                    disabled={!newKeyName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit API Key Modal */}
        {editModalKey && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit API Key</h3>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter new name"
                />
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setEditModalKey(null);
                      setEditingName('');
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editingName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}