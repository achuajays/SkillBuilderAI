import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import Header from './Header';

type AuthViewType = 'login' | 'signup';

const AuthView: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthViewType>('login');

  const toggleView = () => {
    setCurrentView(currentView === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <div className="mt-8">
        {currentView === 'login' ? (
          <Login onToggleView={toggleView} />
        ) : (
          <Signup onToggleView={toggleView} />
        )}
      </div>
    </div>
  );
};

export default AuthView;