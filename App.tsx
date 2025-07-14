import React, { useState, useCallback } from 'react';
import { LearningPlan, DayPlan } from './types';
import { generatePlan } from './services/geminiService';
import { getLearningPlan, saveLearningPlan, deleteLearningPlan } from './services/learningPlanService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import LearningPlanDisplay from './components/LearningPlanDisplay';
import DayDetailView from './components/DayDetailView';
import QuizView from './components/QuizView';
import SpinnerIcon from './components/icons/SpinnerIcon';
import ResetIcon from './components/icons/ResetIcon';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthView from './components/AuthView';

type View = 'plan' | 'day' | 'quiz';

// Main app content component
const MainContent: React.FC = () => {
  const { user } = useAuth();
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [currentView, setCurrentView] = useState<View>('plan');
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch learning plan on mount
  useEffect(() => {
    const fetchPlan = async () => {
      if (!user) return;
      try {
        const plan = await getLearningPlan(user.id);
        setLearningPlan(plan);
      } catch (err) {
        console.error('Error fetching learning plan:', err);
        setError('Failed to load learning plan.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, [user]);

  const handleGeneratePlan = useCallback(async (skill: string, duration: number) => {
    if (!skill.trim() || !user) {
      setError('Please enter a skill you want to learn.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setLearningPlan(null);
    setCurrentView('plan');
    setSelectedDayId(null);

    try {
      const planDays = await generatePlan(skill, duration);
      const newPlan: LearningPlan = {
        skill,
        duration,
        days: planDays.map(day => ({ ...day, isCompleted: false, reflection: '' }))
      };
      await saveLearningPlan(user.id, newPlan);
      setLearningPlan(newPlan);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  const handleSelectDay = useCallback((dayId: number) => {
    setSelectedDayId(dayId);
    setCurrentView('day');
  }, []);

  const handleStartQuiz = useCallback(() => {
    setCurrentView('quiz');
  }, []);
  
  const handleBackToPlan = useCallback(() => {
    setSelectedDayId(null);
    setCurrentView('plan');
  }, []);

  const handleUpdateDay = useCallback(async (updatedDay: DayPlan) => {
    if (!learningPlan || !user) return;
    const updatedDays = learningPlan.days.map(day =>
      day.day === updatedDay.day ? updatedDay : day
    );
    const updatedPlan = { ...learningPlan, days: updatedDays };
    try {
      await saveLearningPlan(user.id, updatedPlan);
      setLearningPlan(updatedPlan);
    } catch (err) {
      console.error('Error updating learning plan:', err);
      setError('Failed to update day.');
    }
  }, [learningPlan, user]);

  const handleReset = useCallback(async () => {
    if (!user) return;
    try {
      await deleteLearningPlan(user.id);
      setLearningPlan(null);
    } catch (err) {
      console.error('Error deleting learning plan:', err);
      setError('Failed to reset plan.');
    }
    setError(null);
    setCurrentView('plan');
    setSelectedDayId(null);
  }, [user]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center mt-16">
          <SpinnerIcon className="h-12 w-12 text-primary-500 animate-spin" />
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Building your personalized plan... this might take a moment!</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center mt-8 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 rounded-lg text-red-700 dark:text-red-300">
          <p className="font-bold">Oops! Something went wrong.</p>
          <p>{error}</p>
        </div>
      );
    }
    
    if (learningPlan) {
      const selectedDay = learningPlan.days.find(d => d.day === selectedDayId);

      if (currentView === 'day' && selectedDay) {
        return <DayDetailView plan={learningPlan} dayData={selectedDay} onUpdateDay={handleUpdateDay} onBack={handleBackToPlan} />;
      }
      
      if (currentView === 'quiz') {
        return <QuizView plan={learningPlan} onBack={handleBackToPlan} />;
      }

      return <LearningPlanDisplay plan={learningPlan} onUpdateDay={handleUpdateDay} onSelectDay={handleSelectDay} onStartQuiz={handleStartQuiz}/>;
    }

    return <InputForm onGeneratePlan={handleGeneratePlan} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans antialiased">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        <Header duration={learningPlan?.duration} />
        <main className="mt-8">
          {renderContent()}
        </main>
        {learningPlan && currentView === 'plan' && !isLoading && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-md bg-gray-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 transition-colors"
            >
              <ResetIcon className="h-5 w-5" />
              Start a New Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// App wrapper with authentication
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

// Content based on authentication status
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans antialiased flex items-center justify-center">
        <SpinnerIcon className="h-12 w-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  // Show auth view if not authenticated
  if (!isAuthenticated) {
    return <AuthView />;
  }

  // Show main content if authenticated
  return <MainContent />;
};

export default App;