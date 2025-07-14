
import React from 'react';
import UserProfile from './UserProfile';
import { useAuth } from '../contexts/AuthContext';
import { checkAdminStatus } from '../services/adminService';

interface HeaderProps {
    duration?: number;
    onAdminClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ duration, onAdminClick }) => {
    const { isAuthenticated } = useAuth();
    const [isAdmin, setIsAdmin] = React.useState(false);

    React.useEffect(() => {
        if (isAuthenticated) {
            checkAdminStatus().then(setIsAdmin);
        }
    }, [isAuthenticated]);
    
    return (
        <header className="relative">
            {isAuthenticated && (
                <div className="absolute right-0 top-0 flex items-center gap-4">
                    {isAdmin && onAdminClick && (
                        <button
                            onClick={onAdminClick}
                            className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 border border-primary-600 hover:border-primary-700 dark:border-primary-400 dark:hover:border-primary-300 rounded-md transition-colors"
                        >
                            Admin Panel
                        </button>
                    )}
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
