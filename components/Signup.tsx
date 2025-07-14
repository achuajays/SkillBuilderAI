import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SignupCredentials } from '../types/auth';
import SpinnerIcon from './icons/SpinnerIcon';

interface SignupProps {
  onToggleView: () => void;
}

const Signup: React.FC<SignupProps> = ({ onToggleView }) => {
  const { signup, isLoading, error } = useAuth();
  const [credentials, setCredentials] = useState<SignupCredentials>({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(credentials);
    } catch (err) {
      // Error is handled in the AuthContext
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Sign up for SkillBuilder AI</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-2">
            Name (optional)
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={credentials.name}
            onChange={handleChange}
            className="block w-full rounded-md border-0 py-3 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition"
            placeholder="Your name"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-2">
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={credentials.email}
            onChange={handleChange}
            required
            className="block w-full rounded-md border-0 py-3 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={credentials.password}
            onChange={handleChange}
            required
            className="block w-full rounded-md border-0 py-3 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition"
            placeholder="••••••••"
          />
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 rounded-md bg-primary-600 text-white font-semibold shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <SpinnerIcon className="w-5 h-5 mr-2" /> : null}
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button 
            onClick={onToggleView}
            className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline transition"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;