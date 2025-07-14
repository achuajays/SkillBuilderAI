
import React from 'react';
import UserProfile from './UserProfile';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
    duration?: number;
}

const Header: React.FC<HeaderProps> = ({ duration }) => {
    const { isAuthenticated } = useAuth();
    
    return (
        <header className="relative">
            {isAuthenticated && (
                <div className="absolute right-0 top-0">
                    <UserProfile />
                </div>
            )}
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    SkillBuilder <span className="text-primary-500">AI</span>
                </h1>
                <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
                    Turn any skill into a {duration ? `${duration}-day` : ''} learning journey, powered by AI.
                </p>
            </div>
        </header>
    );
};

export default Header;
