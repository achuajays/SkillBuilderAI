import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SpinnerIcon from './icons/SpinnerIcon';

const UserProfile: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return null;

  return (
    <div className="flex items-center justify-end space-x-4">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        <span className="font-medium">{user.name || user.email}</span>
      </div>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? <SpinnerIcon className="w-4 h-4 mr-2" /> : null}
        {isLoading ? 'Logging out...' : 'Log out'}
      </button>
    </div>
  );
};

export default UserProfile;