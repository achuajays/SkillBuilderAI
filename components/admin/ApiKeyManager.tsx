import React, { useState } from 'react';
import { SecureApiKey, CreateApiKeyRequest } from '../../types/admin';
import { createApiKey, updateApiKey, deleteApiKey, toggleApiKeyStatus, getApiKeys } from '../../services/adminService';
import SpinnerIcon from '../icons/SpinnerIcon';

interface ApiKeyManagerProps {
  apiKeys: SecureApiKey[];
  onUpdate: (keys: SecureApiKey[]) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ apiKeys, onUpdate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [newKey, setNewKey] = useState<CreateApiKeyRequest>({
    key_name: '',
    api_key: '',
    description: '',
    is_active: true
  });

  const [editKey, setEditKey] = useState({
    api_key: '',
    description: '',
    is_active: true
  });

  const refreshKeys = async () => {
    try {
      const keys = await getApiKeys();
      onUpdate(keys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh keys');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.key_name.trim() || !newKey.api_key.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      await createApiKey(newKey);
      await refreshKeys();
      setNewKey({ key_name: '', api_key: '', description: '', is_active: true });
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await updateApiKey(id, editKey);
      await refreshKeys();
      setEditingKey(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteApiKey(id);
      await refreshKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      await toggleApiKeyStatus(id, !currentStatus);
      await refreshKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle API key status');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (key: SecureApiKey) => {
    setEditingKey(key.id);
    setEditKey({
      api_key: key.api_key,
      description: key.description,
      is_active: key.is_active
    });
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API Key Management</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors"
          >
            {showCreateForm ? 'Cancel' : 'Add New Key'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 border-b border-red-400 dark:border-red-600 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create New API Key</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Key Name *
                </label>
                <input
                  type="text"
                  value={newKey.key_name}
                  onChange={(e) => setNewKey({ ...newKey, key_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., OPENAI_API_KEY"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newKey.description}
                  onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API Key *
              </label>
              <input
                type="password"
                value={newKey.api_key}
                onChange={(e) => setNewKey({ ...newKey, api_key: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter the API key"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={newKey.is_active}
                onChange={(e) => setNewKey({ ...newKey, is_active: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Active
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 disabled:opacity-50 flex items-center gap-2"
              >
                {isCreating && <SpinnerIcon className="h-4 w-4 animate-spin" />}
                Create Key
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-6">
        {apiKeys.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No API keys found</p>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                {editingKey === key.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={editKey.description}
                          onChange={(e) => setEditKey({ ...editKey, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          API Key
                        </label>
                        <input
                          type="password"
                          value={editKey.api_key}
                          onChange={(e) => setEditKey({ ...editKey, api_key: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editKey.is_active}
                        onChange={(e) => setEditKey({ ...editKey, is_active: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(key.id)}
                        disabled={isLoading}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50 flex items-center gap-1"
                      >
                        {isLoading && <SpinnerIcon className="h-3 w-3 animate-spin" />}
                        Save
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{key.key_name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          key.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {key.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{key.description}</p>
                      <p className="text-sm font-mono text-gray-500 dark:text-gray-500">{maskApiKey(key.api_key)}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Created: {new Date(key.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggleStatus(key.id, key.is_active)}
                        disabled={isLoading}
                        className={`px-3 py-1 text-sm rounded ${
                          key.is_active
                            ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                            : 'bg-green-600 hover:bg-green-500 text-white'
                        } disabled:opacity-50`}
                      >
                        {key.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => startEdit(key)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(key.id)}
                        disabled={isLoading}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeyManager;