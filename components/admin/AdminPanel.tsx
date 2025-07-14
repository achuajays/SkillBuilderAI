import React, { useState, useEffect } from 'react';
import { SecureApiKey } from '../../types/admin';
import { checkAdminStatus, getApiKeys } from '../../services/adminService';
import ApiKeyManager from './ApiKeyManager';
import SpinnerIcon from '../icons/SpinnerIcon';

const AdminPanel: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [apiKeys, setApiKeys] = useState<SecureApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        const adminStatus = await checkAdminStatus();
        setIsAdmin(adminStatus);
        
        if (adminStatus) {
          const keys = await getApiKeys();
          setApiKeys(keys);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin panel');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAdmin();
  }, []);

  const handleApiKeysUpdate = (updatedKeys: SecureApiKey[]) => {
    setApiKeys(updatedKeys);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SpinnerIcon className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 rounded-lg p-4 text-red-700 dark:text-red-300">
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-600 rounded-lg p-4 text-yellow-700 dark:text-yellow-300">
            <h3 className="font-bold">Access Denied</h3>
            <p>You don't have administrator privileges to access this panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage API keys and system configuration</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <ApiKeyManager apiKeys={apiKeys} onUpdate={handleApiKeysUpdate} />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;